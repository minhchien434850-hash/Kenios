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

// Tính tiền khuyến mãi cộng thêm khi nạp $amount, đọc cấu hình khuyến mãi trong $db['config'].
// Trả về 0 nếu tắt khuyến mãi / chưa đạt mức tối thiểu / cấu hình không hợp lệ.
function bank_deposit_bonus($db, $amount) {
    $cfg = (isset($db['config']) && is_array($db['config'])) ? $db['config'] : [];
    if (empty($cfg['depositBonusEnabled'])) return 0;
    $percent = floatval($cfg['depositBonusPercent'] ?? 0);
    $min = intval($cfg['depositBonusMin'] ?? 0);
    if ($percent <= 0) return 0;
    if ($amount < $min) return 0;
    return (int)floor($amount * $percent / 100);
}

// Cộng số dư cho user có nội dung chuyển khoản khớp "NAP<userId>", chống trùng bằng bankRef.
// Hàm này thay đổi trực tiếp $db (tham chiếu) và trả về [số_giao_dịch_đã_xử_lý, mảng_log].
function bank_process_transactions(&$db, $transactions) {
    $processed = 0;
    $logs = [];
    $notifs = []; // danh sách nạp tiền để thông báo Telegram (gửi SAU khi ghi DB)
    if (empty($db) || !isset($db['users']) || !is_array($db['users'])) return [0, [], []];

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
            // memo_clean đã viết hoa -> PHẢI viết hoa cả userId khi so khớp, nếu không tài
            // khoản có userId chứa chữ cái (khách đăng ký/Google dùng uniqid) sẽ khớp trượt
            // và không được cộng tiền, trong khi admin (userId toàn số) thì vẫn khớp.
            if (strpos($memo_clean, 'NAP' . strtoupper($uid)) !== false) { $matchedIdx = $idx; break; }
        }
        if ($matchedIdx === -1) continue;

        // Khuyến mãi nạp tiền: nạp >= depositBonusMin được cộng thêm depositBonusPercent%.
        $bonus = bank_deposit_bonus($db, $amount);
        $credit = $amount + $bonus;

        $mu = $db['users'][$matchedIdx];
        $old = isset($mu['balance']) ? floatval($mu['balance']) : 0;
        $db['users'][$matchedIdx]['balance'] = $old + $credit;

        if (!isset($db['transactions'])) $db['transactions'] = [];
        $desc = $bonus > 0
            ? "Nạp tiền tự động VietQR ($memo) (+" . number_format($bonus) . "đ khuyến mãi)"
            : "Nạp tiền tự động VietQR ($memo)";
        array_unshift($db['transactions'], [
            'id' => 'TX' . time() . rand(100, 999),
            'userId' => $mu['userId'], 'username' => $mu['username'] ?? '',
            'type' => 'deposit', 'amount' => $credit, 'date' => date('c'),
            'description' => $desc, 'bankRef' => $txnRef
        ]);

        $processed++;
        $logs[] = '+' . number_format($credit) . 'd (goc ' . number_format($amount) . ' + km ' . number_format($bonus) . ') -> ' . ($mu['username'] ?? $mu['userId']) . " | Ref=$txnRef";
        $notifs[] = ['username' => $mu['username'] ?? $mu['userId'], 'amount' => $credit];
    }

    return [$processed, $logs, $notifs];
}
