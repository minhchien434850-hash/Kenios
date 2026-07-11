<?php
// card.php — Callback nhận kết quả NẠP THẺ CÀO từ card2k.net.
// Cấu hình bên card2k: "Đường dẫn nhận dữ liệu (Callback Url)" = https://<tên-miền>/card.php
// Khi thẻ được duyệt, cổng POST kết quả về đây; ta xác minh chữ ký rồi cộng số dư.
header("Content-Type: application/json; charset=UTF-8");
require_once __DIR__ . '/lib_secrets.php';
require_once __DIR__ . '/lib_card.php';

$db_file = __DIR__ . '/database.json';

// Nhận tham số (thesieure gửi qua POST form; hỗ trợ cả JSON phòng hờ).
$in = $_POST;
if (empty($in)) {
    $raw = file_get_contents('php://input');
    $j = json_decode($raw, true);
    if (is_array($j)) $in = $j;
}

$request_id = (string)($in['request_id'] ?? '');
$statusCode = (string)($in['status'] ?? '');
$cbCode     = (string)($in['code'] ?? '');   // code/serial trong callback (nhiều cổng KHÔNG gửi lại)
$cbSerial   = (string)($in['serial'] ?? '');
$callbackSign = (string)($in['callback_sign'] ?? ($in['sign'] ?? ($in['signature'] ?? '')));
// Số tiền cổng thực trả về ví (đã trừ phí) và mệnh giá thực của thẻ. $credit tính sau
// (dựa trên tỷ lệ % theo nhà mạng admin cấu hình), khi đã đọc DB.
$amount = intval($in['amount'] ?? 0);
$value  = intval($in['value'] ?? ($in['declared_value'] ?? 0));

// ---- LOG CHẨN ĐOÁN: ghi lại MỌI callback để soi khi có sự cố "cổng success nhưng web
// vẫn chờ". File này được .htaccess chặn truy cập trực tiếp. Xoá đi sau khi hết lỗi.
$logLine = function ($note) use ($in) {
    @file_put_contents(__DIR__ . '/card_callback_log.txt',
        date('c') . " | " . $note . " | DATA=" . json_encode($in, JSON_UNESCAPED_UNICODE) . "\n",
        FILE_APPEND);
};
$logLine('CALLBACK NHẬN ĐƯỢC');

$secrets = read_secrets();
$partnerKey = trim((string)($secrets['cardPartnerKey'] ?? ''));
if ($partnerKey === '') { $logLine('LỖI: chưa cấu hình Partner Key'); echo json_encode(["status" => "error", "message" => "Chưa cấu hình Partner Key."]); exit; }

// status 1 = thành công đúng mệnh giá; 2 = thành công nhưng sai mệnh giá (vẫn cộng tiền thực).
$success = ($statusCode === '1' || $statusCode === '2');

$fp = fopen($db_file, 'c+');
if (!$fp || !flock($fp, LOCK_EX)) { echo json_encode(["status" => "error", "message" => "Không khóa được CSDL."]); exit; }
$raw = stream_get_contents($fp);
$db = $raw ? (json_decode($raw, true) ?: []) : [];

// Tìm yêu cầu nạp thẻ tương ứng để biết cộng cho ai + lấy CODE/SERIAL ĐÃ LƯU (khi gửi thẻ).
$reqIdx = -1;
foreach (($db['cardRequests'] ?? []) as $i => $r) {
    if (($r['request_id'] ?? '') === $request_id) { $reqIdx = $i; break; }
}
$stCode   = ($reqIdx !== -1) ? (string)($db['cardRequests'][$reqIdx]['code'] ?? '')   : '';
$stSerial = ($reqIdx !== -1) ? (string)($db['cardRequests'][$reqIdx]['serial'] ?? '') : '';
if ($reqIdx === -1) {
    $logLine("CẢNH BÁO: không tìm thấy yêu cầu với request_id=$request_id (không cộng được cho ai)");
} else {
    $logLine("OK: tìm thấy yêu cầu (userId=" . ($db['cardRequests'][$reqIdx]['userId'] ?? '?') . "), statusCode cổng=$statusCode");
}

// ---- Xác minh callback ----
// QUAN TRỌNG: card2k thường KHÔNG gửi lại code/serial trong callback, nên phải dùng
// CODE/SERIAL ĐÃ LƯU lúc gửi thẻ để tính chữ ký kỳ vọng (nếu chỉ dựa vào code/serial của
// callback thì luôn rỗng -> chữ ký luôn sai -> không bao giờ cộng tiền). Chấp nhận nhiều
// kiểu ghép (mọi cổng họ chargingws/v2) để không bị kẹt vì thứ tự.
$sigCands = [];
foreach ([[$stCode, $stSerial], [$cbCode, $cbSerial]] as $pair) {
    list($c, $s) = $pair;
    if ($c !== '' && $s !== '') {
        $sigCands[] = md5($partnerKey . $c . $s);
        $sigCands[] = md5($partnerKey . $s . $c);
        $sigCands[] = md5($c . $s . $partnerKey);
        $sigCands[] = md5($s . $c . $partnerKey);
    }
}
$sigCands = array_map('strtolower', $sigCands);
$sigOk = ($callbackSign !== '' && in_array(strtolower($callbackSign), $sigCands, true));
// Xác thực thay thế: callback có gửi code/serial VÀ khớp với đã lưu -> đúng là card2k
// (chỉ cổng + máy chủ mới biết cặp code/serial này). Cho qua kể cả khi chữ ký lạ kiểu.
$codeMatch = ($cbCode !== '' && $cbSerial !== '' && $stCode !== '' && $stSerial !== ''
    && strcasecmp($cbCode, $stCode) === 0 && strcasecmp($cbSerial, $stSerial) === 0);
if (!$sigOk && !$codeMatch) {
    $logLine("LỖI CHỮ KÝ: nhận=$callbackSign | reqIdx=$reqIdx | thử " . count($sigCands) . " kiểu ghép");
    flock($fp, LOCK_UN); fclose($fp);
    echo json_encode(["status" => "error", "message" => "Chữ ký callback không hợp lệ."]); exit;
}

// Chống cộng trùng: nếu đã có giao dịch với cardRef = request_id thì thôi.
$already = false;
foreach (($db['transactions'] ?? []) as $t) {
    if (($t['cardRef'] ?? '') === $request_id) { $already = true; break; }
}

// TÍNH SỐ TIỀN CỘNG theo TỶ LỆ % của nhà mạng (admin cấu hình cho khớp thesieure.com):
// khách nhận = mệnh giá thực × (100 - %)/100. An toàn: KHÔNG cộng quá số tiền cổng thực
// trả về ví ($amount) để shop không bị lỗ. Chưa đặt % thì cộng đúng tiền cổng trả.
$telcoReq = ($reqIdx !== -1) ? strtoupper((string)($db['cardRequests'][$reqIdx]['telco'] ?? '')) : '';
$discounts = (isset($db['config']['cardDiscounts']) && is_array($db['config']['cardDiscounts'])) ? $db['config']['cardDiscounts'] : [];
$face = $value > 0 ? $value : intval(($reqIdx !== -1 ? ($db['cardRequests'][$reqIdx]['declaredAmount'] ?? 0) : 0));
// Số tiền cộng cho khách = mệnh giá × (100 − %); không cộng quá tiền cổng thực trả ($amount).
$credit = card_compute_credit($telcoReq, $face, $amount, $discounts);

if ($success && !$already && $reqIdx !== -1 && $credit > 0) {
    $uid = $db['cardRequests'][$reqIdx]['userId'] ?? '';
    $uIdx = -1;
    foreach (($db['users'] ?? []) as $i => $u) { if (($u['userId'] ?? '') === $uid) { $uIdx = $i; break; } }
    if ($uIdx !== -1) {
        $db['users'][$uIdx]['balance'] = floatval($db['users'][$uIdx]['balance'] ?? 0) + $credit;
        if (!isset($db['transactions'])) $db['transactions'] = [];
        $telco = $db['cardRequests'][$reqIdx]['telco'] ?? '';
        array_unshift($db['transactions'], [
            'id' => 'TX' . time() . rand(100, 999), 'userId' => $uid,
            'type' => 'deposit', 'amount' => $credit, 'date' => date('c'),
            'description' => "Nạp thẻ cào $telco (nhận " . number_format($credit) . "đ)",
            'cardRef' => $request_id
        ]);
        // Lưu lại để thông báo Telegram SAU khi ghi DB xong (không giữ khoá lâu vì curl).
        $tgDeposit = ['username' => $db['users'][$uIdx]['username'] ?? $uid, 'amount' => $credit, 'telco' => $telco];
    }
}

// Cập nhật trạng thái yêu cầu.
if ($reqIdx !== -1) {
    $db['cardRequests'][$reqIdx]['status'] = $success ? 'success' : 'failed';
    $db['cardRequests'][$reqIdx]['realAmount'] = $credit;
    $db['cardRequests'][$reqIdx]['gatewayStatus'] = $statusCode;
}
$logLine(($success && !$already && $reqIdx !== -1 && $credit > 0)
    ? "ĐÃ CỘNG $credit đ cho user (thành công)"
    : "KHÔNG cộng tiền (success=" . ($success ? 1 : 0) . ", already=" . ($already ? 1 : 0) . ", reqIdx=$reqIdx, credit=$credit)");

ftruncate($fp, 0); rewind($fp);
fwrite($fp, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
fflush($fp); flock($fp, LOCK_UN); fclose($fp);

echo json_encode(["status" => "success", "message" => "OK"]);

// Thông báo Telegram cho admin khi thẻ được duyệt & đã cộng tiền (sau khi trả kết quả).
if (!empty($tgDeposit) && function_exists('notify_telegram')) {
    if (function_exists('fastcgi_finish_request')) { @fastcgi_finish_request(); }
    notify_telegram("💰 <b>NẠP THẺ CÀO</b>\n👤 <b>" . htmlspecialchars((string)$tgDeposit['username'])
        . "</b>\n➕ " . number_format((float)$tgDeposit['amount']) . "đ\n🏦 Thẻ " . htmlspecialchars((string)$tgDeposit['telco']));
}
