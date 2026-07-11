<?php
// lib_card.php — Tính số tiền cộng cho khách khi nạp thẻ cào + hỏi lại trạng thái thẻ.
// Dùng CHUNG cho card.php (callback tự động) và api.php (chủ động hỏi cổng). Bảng % lấy
// đúng theo bảng phí card2k.net mức "Thành viên"; phải khớp DEFAULT_CARD_DISCOUNTS (script.js).

function card_default_discounts() {
    return [
        'VIETTEL'   => [10000=>19, 20000=>19, 30000=>20, 50000=>18.5, 100000=>18.5, 200000=>18.5, 300000=>18.5, 500000=>20.5, 1000000=>20.5, 'default'=>20.5],
        'VINAPHONE' => [10000=>19.5, 20000=>19.5, 30000=>19.5, 50000=>16.5, 100000=>15.5, 200000=>16, 300000=>16, 500000=>15.5, 'default'=>15.5],
        'MOBIFONE'  => [10000=>26, 20000=>26, 30000=>26, 50000=>25.5, 100000=>25, 200000=>23, 300000=>23, 500000=>22, 'default'=>22],
        'GARENA'    => [5000=>19.5, 10000=>18.5, 20000=>18.5, 50000=>18.5, 100000=>18.5, 200000=>18.5, 500000=>18.5, 'default'=>18.5],
        'ZING'      => ['default'=>18.5],
        'GATE'      => [10000=>17, 20000=>17, 50000=>17, 100000=>17, 200000=>17, 300000=>23.5, 500000=>17, 1000000=>17, 2000000=>23.5, 5000000=>17, 'default'=>17],
        'VCOIN'     => [2000000=>21, 5000000=>21.5, 'default'=>19.5],
        'SCOIN'     => ['default'=>32.5],
    ];
}

// Số tiền cộng cho khách. $face = mệnh giá thực; $amount = tiền cổng thực trả về ví (0 nếu
// không biết); $configDiscounts = % admin tự đặt (nếu có). KHÔNG cộng quá $amount để không lỗ.
function card_compute_credit($telco, $face, $amount, $configDiscounts) {
    $telco = strtoupper((string)$telco);
    $face = intval($face); $amount = intval($amount);
    $pct = 0;
    if (is_array($configDiscounts) && isset($configDiscounts[$telco]) && $configDiscounts[$telco] !== '' && !is_array($configDiscounts[$telco])) {
        $pct = floatval($configDiscounts[$telco]);
    } else {
        $disc = card_default_discounts();
        if (isset($disc[$telco])) {
            $tbl = $disc[$telco];
            $pct = ($face > 0 && isset($tbl[$face])) ? floatval($tbl[$face]) : floatval($tbl['default'] ?? 0);
        }
    }
    if ($pct > 0) {
        $credit = (int)floor($face * (100 - $pct) / 100);
        if ($amount > 0 && $credit > $amount) $credit = $amount;
    } else {
        $credit = $amount > 0 ? $amount : $face;
    }
    return $credit;
}

// URL endpoint của cổng nạp thẻ theo cấu hình (mặc định card2k.net). Cùng họ chargingws/v2.
function card_gateway_url($config) {
    return 'https://card2k.net/chargingws/v2';
}

// Ghi log 1 dòng để soi lỗi khi hỏi trạng thái thẻ (bị .htaccess chặn tải về).
function card_query_log($line) {
    @file_put_contents(__DIR__ . '/card_query_log.txt', '[' . date('c') . '] ' . $line . "\n", FILE_APPEND | LOCK_EX);
}

// Gửi 1 POST tới cổng, trả về mảng JSON đã giải mã (hoặc null nếu lỗi/không phải JSON).
function _card_gateway_post($gatewayUrl, $params) {
    $ch = curl_init($gatewayUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($params));
    curl_setopt($ch, CURLOPT_TIMEOUT, 20);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    $resp = curl_exec($ch);
    $err = curl_error($ch);
    curl_close($ch);
    if ($resp === false) { card_query_log('POST ' . ($params['command'] ?? '?') . ' curl_error=' . $err); return null; }
    $j = json_decode($resp, true);
    card_query_log('POST ' . ($params['command'] ?? '?') . ' rid=' . ($params['request_id'] ?? '') . ' resp=' . substr($resp, 0, 400));
    return is_array($j) ? $j : null;
}

// HỎI LẠI trạng thái 1 thẻ. QUAN TRỌNG: cổng card2k/thesieure trả trạng thái ĐÃ XỬ LÝ qua
// lệnh 'check' (KHÔNG phải 'charging' — gửi lại 'charging' chỉ báo lại "đang xử lý"). Ta thử
// 'check' trước; nếu cổng không trả trạng thái hợp lệ thì thử lại 'charging' để phòng hờ.
// Trả về ['status'=>int|null, 'value'=>int, 'amount'=>int, 'raw'=>...].
// status: 1/2=thành công, 3=thẻ sai/lỗi, 4/99/100=đang xử lý, null=không gọi được.
function card_query_status($req, $partnerId, $partnerKey, $gatewayUrl) {
    $code = (string)($req['code'] ?? '');
    $serial = (string)($req['serial'] ?? '');
    $telco = (string)($req['telco'] ?? '');
    $amount = intval($req['declaredAmount'] ?? 0);
    $request_id = (string)($req['request_id'] ?? '');
    if ($code === '' || $serial === '' || $request_id === '') return ['status' => null];
    $sign = md5($partnerKey . $code . $serial);
    $base = [
        'telco' => strtoupper($telco), 'code' => $code, 'serial' => $serial, 'amount' => $amount,
        'request_id' => $request_id, 'partner_id' => $partnerId, 'sign' => $sign,
    ];
    $last = null;
    foreach (['check', 'charging'] as $cmd) {
        $j = _card_gateway_post($gatewayUrl, array_merge($base, ['command' => $cmd]));
        if (!is_array($j)) continue;
        $last = $j;
        if (isset($j['status'])) {
            $st = intval($j['status']);
            // 'check' đã cho trạng thái ĐÃ RESOLVED (1/2/3) -> dùng luôn, khỏi thử 'charging'.
            if ($cmd === 'check' && ($st === 1 || $st === 2 || $st === 3)) {
                return ['status' => $st, 'value' => intval($j['value'] ?? ($j['declared_value'] ?? 0)), 'amount' => intval($j['amount'] ?? 0), 'raw' => $j];
            }
            // Với 'charging' (fallback) hoặc 'check' báo đang xử lý: nhớ lại, thử tiếp.
            if ($cmd === 'charging') {
                return ['status' => $st, 'value' => intval($j['value'] ?? ($j['declared_value'] ?? 0)), 'amount' => intval($j['amount'] ?? 0), 'raw' => $j];
            }
        }
    }
    if (is_array($last) && isset($last['status'])) {
        return ['status' => intval($last['status']), 'value' => intval($last['value'] ?? 0), 'amount' => intval($last['amount'] ?? 0), 'raw' => $last];
    }
    return ['status' => null, 'raw' => $last];
}
