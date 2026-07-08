<?php
// bank_callback.php - Webhook nhận thanh toán tự động VietQR cho kenios.store
// Hỗ trợ payload dạng ThueAPIBank / Casso / SePay / webhook đơn giản (flat JSON).
//
// BẢO MẬT: token xác thực PHẢI được cấu hình trong database.json (config.bankToken).
// Không có secret nào được hardcode trong mã nguồn và không có đường vòng (bypass) nào
// được chấp nhận nếu không xác thực được — giao dịch không hợp lệ sẽ bị từ chối.
ini_set('memory_limit', '256M');
ini_set('max_execution_time', 30);
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: *");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(["status" => "ok"]);
    exit;
}

$db_file = __DIR__ . '/database.json';

function read_db($file) {
    if (!file_exists($file)) return [];
    $content = file_get_contents($file);
    return json_decode($content, true) ?: [];
}

function write_db($file, $data) {
    $json_content = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    return file_put_contents($file, $json_content, LOCK_EX) !== false;
}

function get_header($name) {
    $name_server = 'HTTP_' . strtoupper(str_replace('-', '_', $name));
    if (!empty($_SERVER[$name_server])) return $_SERVER[$name_server];
    if (function_exists('getallheaders')) {
        foreach (getallheaders() as $key => $val) {
            if (strtolower($key) === strtolower($name)) return $val;
        }
    }
    return '';
}

$raw_input = file_get_contents('php://input');
$data = json_decode($raw_input, true);
if (!$data) $data = $_GET;
if (empty($data)) $data = $_POST;
if (!is_array($data)) $data = [];

require_once __DIR__ . '/lib_secrets.php';

$db = read_db($db_file);
$secrets = read_secrets();
// Ưu tiên token trong secrets.php (không lộ qua get_db); vẫn đọc field cũ trong
// database.json để tương thích ngược nếu chưa kịp chuyển sang secrets.php.
$configured_token = trim((string)($secrets['bankToken'] ?? '')) ?: trim((string)($db['config']['bankToken'] ?? ''));

// === XÁC THỰC ===
// Không có token nào được cấu hình -> từ chối mọi callback thật (chỉ cho phép ping/test).
$request_token = '';
$header_names = ['Authorization', 'X-API-Key', 'X-API-Token', 'X-Token', 'Token', 'X-Webhook-Token', 'X-Callback-Token'];
foreach ($header_names as $h) {
    $val = get_header($h);
    if (!empty($val)) { $request_token = preg_replace('/^bearer\s+/i', '', trim($val)); break; }
}
if (empty($request_token)) {
    foreach (['token', 'apikey', 'api_key', 'api_token', 'key', 'webhook_token'] as $k) {
        if (!empty($_GET[$k])) { $request_token = trim($_GET[$k]); break; }
        if (!empty($data[$k])) { $request_token = trim($data[$k]); break; }
    }
}

$is_authenticated = false;
if (!empty($configured_token)) {
    if (!empty($request_token) && hash_equals($configured_token, $request_token)) {
        $is_authenticated = true;
    } else {
        // Chữ ký HMAC-SHA256 của body thô, ký bằng token đã cấu hình (Casso/SePay/ThueAPIBank).
        $sig = get_header('signature') ?: get_header('X-Signature') ?: get_header('X-Webhook-Signature');
        if (!empty($sig)) {
            $expected = hash_hmac('sha256', $raw_input, $configured_token);
            if (hash_equals($expected, strtolower(trim($sig)))) $is_authenticated = true;
        }
    }
}

// === BYPASS CHỈ DÀNH CHO PING/HANDSHAKE (không đụng tới số dư) ===
$has_amount_field = isset($data['amount']) || isset($data['transferAmount']) || isset($data['value'])
    || isset($data['credit']) || isset($data['data']) || isset($data['transactions']) || isset($data['transaction']);

if (!$is_authenticated) {
    if (!$has_amount_field) {
        http_response_code(200);
        echo json_encode(["status" => "success", "message" => "Webhook connected successfully to kenios.store", "time" => date("Y-m-d H:i:s")]);
        exit;
    }
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized webhook call"]);
    exit;
}

// === PARSE DANH SÁCH GIAO DỊCH ===
if (isset($data['data']) && is_array($data['data'])) {
    $transactions = $data['data'];
} elseif (isset($data['transactions']) && is_array($data['transactions'])) {
    $transactions = $data['transactions'];
} elseif (isset($data['transaction']) && is_array($data['transaction'])) {
    $transactions = [$data['transaction']];
} else {
    $transactions = [$data];
}

if (empty($db) || !isset($db['users'])) {
    echo json_encode(["status" => "error", "message" => "Database not initialized"]);
    exit;
}

$processed_count = 0;
$success_logs = [];

foreach ($transactions as $txn) {
    if (!is_array($txn)) continue;

    $memo = '';
    foreach (['description', 'memo', 'addInfo', 'content', 'remarks', 'transferDescription'] as $f) {
        if (!empty($txn[$f])) { $memo = $txn[$f]; break; }
    }

    $amount = 0;
    foreach (['amount', 'transferAmount', 'value', 'credit', 'creditAmount'] as $f) {
        if (isset($txn[$f]) && intval($txn[$f]) > 0) { $amount = intval($txn[$f]); break; }
    }

    $txnRef = '';
    foreach (['transactionNumber', 'tid', 'id', 'reference', 'refNumber', 'transId', 'transactionID', 'ftNo'] as $f) {
        if (!empty($txn[$f])) { $txnRef = strval($txn[$f]); break; }
    }
    if (empty($txnRef)) $txnRef = 'AUTO-' . $amount . '-' . md5($memo . $amount);

    if ($amount < 1000) continue;

    // Chống xử lý trùng lặp
    $already = false;
    foreach (($db['transactions'] ?? []) as $t) {
        if (isset($t['bankRef']) && strval($t['bankRef']) === $txnRef) { $already = true; break; }
    }
    if ($already) continue;

    // Khớp user: nội dung chuyển khoản phải chứa "NAP<userId>" (đúng định dạng do
    // trang nạp tiền sinh ra), tránh khớp nhầm theo tên người dùng gây trừ/cộng sai tài khoản.
    $memo_clean = strtoupper(preg_replace('/[^a-zA-Z0-9]/', '', $memo));
    $matchedUserIdx = -1;
    foreach ($db['users'] as $idx => $u) {
        $uid = isset($u['userId']) ? strval($u['userId']) : '';
        if (empty($uid)) continue;
        if (strpos($memo_clean, 'NAP' . $uid) !== false) { $matchedUserIdx = $idx; break; }
    }
    if ($matchedUserIdx === -1) continue;

    $matched_user = $db['users'][$matchedUserIdx];
    $old_balance = isset($matched_user['balance']) ? floatval($matched_user['balance']) : 0;
    $db['users'][$matchedUserIdx]['balance'] = $old_balance + $amount;

    $newTxn = [
        "userId" => $matched_user['userId'], "username" => $matched_user['username'],
        "type" => "deposit", "amount" => $amount, "date" => date("c"),
        "description" => "Nạp tiền tự động VietQR ($memo)", "bankRef" => $txnRef
    ];
    if (!isset($db['transactions'])) $db['transactions'] = [];
    array_unshift($db['transactions'], $newTxn);

    $processed_count++;
    $success_logs[] = "+" . number_format($amount) . "d -> user=" . $matched_user['username'] . " | Ref=$txnRef";
}

if ($processed_count > 0 && write_db($db_file, $db)) {
    http_response_code(200);
    echo json_encode(["status" => "success", "processed" => $processed_count, "details" => $success_logs]);
} else {
    http_response_code(200);
    echo json_encode(["status" => "success", "message" => "No new matching transactions", "received" => count($transactions)]);
}
