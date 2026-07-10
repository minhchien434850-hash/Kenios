<?php
// card.php — Callback nhận kết quả NẠP THẺ CÀO từ card2k.net.
// Cấu hình bên card2k: "Đường dẫn nhận dữ liệu (Callback Url)" = https://<tên-miền>/card.php
// Khi thẻ được duyệt, cổng POST kết quả về đây; ta xác minh chữ ký rồi cộng số dư.
header("Content-Type: application/json; charset=UTF-8");
require_once __DIR__ . '/lib_secrets.php';

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
$code       = (string)($in['code'] ?? '');
$serial     = (string)($in['serial'] ?? '');
$callbackSign = (string)($in['callback_sign'] ?? ($in['sign'] ?? ''));
// Số tiền cổng thực trả về ví (đã trừ phí) và mệnh giá thực của thẻ. $credit tính sau
// (dựa trên tỷ lệ % theo nhà mạng admin cấu hình), khi đã đọc DB.
$amount = intval($in['amount'] ?? 0);
$value  = intval($in['value'] ?? 0);

$secrets = read_secrets();
$partnerKey = trim((string)($secrets['cardPartnerKey'] ?? ''));
if ($partnerKey === '') { echo json_encode(["status" => "error", "message" => "Chưa cấu hình Partner Key."]); exit; }

// Xác minh chữ ký callback: md5(partner_key + code + serial). Sai -> bỏ qua (chống giả mạo).
$expected = md5($partnerKey . $code . $serial);
if ($callbackSign === '' || strtolower($callbackSign) !== strtolower($expected)) {
    echo json_encode(["status" => "error", "message" => "Chữ ký callback không hợp lệ."]); exit;
}

// status 1 = thành công đúng mệnh giá; 2 = thành công nhưng sai mệnh giá (vẫn cộng tiền thực).
$success = ($statusCode === '1' || $statusCode === '2');

$fp = fopen($db_file, 'c+');
if (!$fp || !flock($fp, LOCK_EX)) { echo json_encode(["status" => "error", "message" => "Không khóa được CSDL."]); exit; }
$raw = stream_get_contents($fp);
$db = $raw ? (json_decode($raw, true) ?: []) : [];

// Tìm yêu cầu nạp thẻ tương ứng để biết cộng cho ai.
$reqIdx = -1;
foreach (($db['cardRequests'] ?? []) as $i => $r) {
    if (($r['request_id'] ?? '') === $request_id) { $reqIdx = $i; break; }
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
// Bảng % chiết khấu MẶC ĐỊNH lấy ĐÚNG theo bảng phí đổi thẻ cào thesieure.com (mức
// "Thành viên"). Viettel/Vina/Mobifone khác nhau theo mệnh giá; các cổng còn lại một mức.
// 'default' dùng cho mệnh giá không liệt kê. Phải khớp DEFAULT_CARD_DISCOUNTS trong script.js.
$DEFAULT_DISC = [
    'VIETTEL'      => [10000=>17, 20000=>16, 30000=>17, 50000=>14, 100000=>14, 200000=>14, 300000=>15, 500000=>15.5, 1000000=>15.5, 'default'=>15.5],
    'MOBIFONE'     => [10000=>21, 20000=>21, 30000=>21, 50000=>20.5, 100000=>20.5, 200000=>19, 300000=>19, 500000=>19, 'default'=>19],
    'VINAPHONE'    => [10000=>16, 20000=>16, 30000=>16, 50000=>13, 100000=>12.5, 200000=>12, 300000=>12, 500000=>12, 'default'=>12],
    'VIETNAMOBILE' => ['default'=>38],
    'ZING'         => ['default'=>13.5],
    'GARENA'       => ['default'=>14.5],
    'VCOIN'        => [2000000=>16, 'default'=>14.5],
    'SCOIN'        => ['default'=>27.5],
];
// Ưu tiên % admin tự đặt (một mức phẳng cho mọi mệnh giá); nếu chưa đặt thì tra bảng
// mặc định theo mệnh giá thực của thẻ ($face).
if (isset($discounts[$telcoReq]) && $discounts[$telcoReq] !== '' && !is_array($discounts[$telcoReq])) {
    $discPct = floatval($discounts[$telcoReq]);
} elseif (isset($DEFAULT_DISC[$telcoReq])) {
    $tbl = $DEFAULT_DISC[$telcoReq];
    $discPct = ($face > 0 && isset($tbl[$face])) ? floatval($tbl[$face]) : floatval($tbl['default'] ?? 0);
} else {
    $discPct = 0;
}
if ($discPct > 0) {
    $credit = (int)floor($face * (100 - $discPct) / 100);
    if ($amount > 0 && $credit > $amount) $credit = $amount;
} else {
    $credit = $amount > 0 ? $amount : $face;
}

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
    }
}

// Cập nhật trạng thái yêu cầu.
if ($reqIdx !== -1) {
    $db['cardRequests'][$reqIdx]['status'] = $success ? 'success' : 'failed';
    $db['cardRequests'][$reqIdx]['realAmount'] = $credit;
    $db['cardRequests'][$reqIdx]['gatewayStatus'] = $statusCode;
}

ftruncate($fp, 0); rewind($fp);
fwrite($fp, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
fflush($fp); flock($fp, LOCK_UN); fclose($fp);

echo json_encode(["status" => "success", "message" => "OK"]);
