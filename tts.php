<?php
// tts.php - Proxy Google Cloud Text-to-Speech cho kenios.store.
// Trình duyệt gửi văn bản tới đây; máy chủ mới là nơi gọi Google Cloud với API key
// bí mật (secrets.php), nên khóa không bao giờ bị lộ ra phía client.
ini_set('max_execution_time', 30);
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/lib_secrets.php';

$secrets = read_secrets();
$api_key = trim((string)($secrets['ttsApiKey'] ?? ''));
if ($api_key === '') {
    http_response_code(503);
    echo json_encode(["status" => "error", "message" => "Chưa cấu hình Google Cloud TTS API key."]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?: [];
$text = trim((string)($input['text'] ?? ''));
if ($text === '') {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Thiếu nội dung cần đọc."]);
    exit;
}
if (mb_strlen($text) > 800) $text = mb_substr($text, 0, 800);

$voiceName = (string)($input['voice'] ?? 'vi-VN-Wavenet-A');
$rate = floatval($input['rate'] ?? 1);
if ($rate < 0.25 || $rate > 4) $rate = 1;
$pitch = floatval($input['pitch'] ?? 0);
if ($pitch < -20 || $pitch > 20) $pitch = 0;

$payload = json_encode([
    "input" => ["text" => $text],
    "voice" => ["languageCode" => "vi-VN", "name" => $voiceName],
    "audioConfig" => ["audioEncoding" => "MP3", "speakingRate" => $rate, "pitch" => $pitch]
]);

$ch = curl_init("https://texttospeech.googleapis.com/v1/text:synthesize?key=" . urlencode($api_key));
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 15);
$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curl_err = curl_error($ch);
curl_close($ch);

if ($response === false) {
    http_response_code(502);
    echo json_encode(["status" => "error", "message" => "Không kết nối được tới Google Cloud TTS: $curl_err"]);
    exit;
}

$result = json_decode($response, true);
if ($http_code !== 200 || empty($result['audioContent'])) {
    http_response_code(502);
    $msg = $result['error']['message'] ?? 'Google Cloud TTS trả về lỗi không xác định.';
    echo json_encode(["status" => "error", "message" => $msg]);
    exit;
}

echo json_encode(["status" => "success", "audioContent" => $result['audioContent']]);
