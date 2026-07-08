<?php
// lib_bank.php - Logic xử lý giao dịch nạp tiền tự động, dùng chung bởi:
//   • bank_callback.php  — nhận webhook do cổng thanh toán ĐẨY sang (push)
//   • api.php?action=poll_acb — chủ động KÉO lịch sử giao dịch từ ThueAPIBank (pull)
// Tách ra đây để hai đường (webhook / polling) xử lý giống hệt nhau, không lệch nhau.

// Rút danh sách giao dịch từ nhiều định dạng payload khác nhau (Casso/SePay/ThueAPIBank/flat).
function bank_extract_transactions($data) {
    if (!is_array($data)) return [];
    if (isset($data['data']) && is_array($data['data'])) return $data['data'];
    if (isset($data['transactions']) && is_array($data['transactions'])) return $data['transactions'];
    if (isset($data['transaction']) && is_array($data['transaction'])) return [$data['transaction']];
    return [$data];
}

// Cộng số dư cho user có nội dung chuyển khoản khớp "NAP<userId>", chống trùng bằng bankRef.
// Hàm này thay đổi trực tiếp $db (tham chiếu) và trả về [số_giao_dịch_đã_xử_lý, mảng_log].
function bank_process_transactions(&$db, $transactions) {
    $processed = 0;
    $logs = [];
    if (empty($db) || !isset($db['users']) || !is_array($db['users'])) return [0, []];

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

        // Bỏ qua giao dịch tiền RA (chỉ cộng tiền VÀO) nếu payload có đánh dấu chiều giao dịch.
        foreach (['type', 'transferType', 'direction'] as $f) {
            if (!empty($txn[$f])) {
                $t = strtolower((string)$txn[$f]);
                if (in_array($t, ['out', 'debit', 'withdraw', 'send', '-'], true)) { $amount = 0; }
                break;
            }
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

        // Khớp user: nội dung chuyển khoản phải chứa "NAP<userId>" (đúng định dạng do trang
        // nạp tiền sinh ra), tránh khớp nhầm theo tên gây cộng sai tài khoản.
        $memo_clean = strtoupper(preg_replace('/[^a-zA-Z0-9]/', '', $memo));
        $matchedIdx = -1;
        foreach ($db['users'] as $idx => $u) {
            $uid = isset($u['userId']) ? strval($u['userId']) : '';
            if ($uid === '') continue;
            if (strpos($memo_clean, 'NAP' . $uid) !== false) { $matchedIdx = $idx; break; }
        }
        if ($matchedIdx === -1) continue;

        $mu = $db['users'][$matchedIdx];
        $old = isset($mu['balance']) ? floatval($mu['balance']) : 0;
        $db['users'][$matchedIdx]['balance'] = $old + $amount;

        if (!isset($db['transactions'])) $db['transactions'] = [];
        array_unshift($db['transactions'], [
            'id' => 'TX' . time() . rand(100, 999),
            'userId' => $mu['userId'], 'username' => $mu['username'] ?? '',
            'type' => 'deposit', 'amount' => $amount, 'date' => date('c'),
            'description' => "Nạp tiền tự động VietQR ($memo)", 'bankRef' => $txnRef
        ]);

        $processed++;
        $logs[] = '+' . number_format($amount) . 'd -> ' . ($mu['username'] ?? $mu['userId']) . " | Ref=$txnRef";
    }

    return [$processed, $logs];
}
