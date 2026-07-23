<?php
// lib_bank.php - Logic xử lý giao dịch nạp tiền tự động, dùng chung bởi:
//   • bank_callback.php  — nhận webhook do cổng thanh toán ĐẨY sang (push)
//   • api.php?action=poll_acb — chủ động KÉO lịch sử giao dịch từ ThueAPIBank (pull)
// Tách ra đây để hai đường (webhook / polling) xử lý giống hệt nhau, không lệch nhau.

// $arr có phải là DANH SÁCH các object (giao dịch) không: khóa 0..n và phần tử đầu là mảng.
function bank_is_list_of_objects($arr) {
    if (!is_array($arr) || empty($arr)) return false;
    if (array_keys($arr) !== range(0, count($arr) - 1)) return false; // không phải list tuần tự
    return is_array(reset($arr)); // phần tử đầu là object
}
// Đào ĐỆ QUY tìm mảng-các-object đầu tiên ở bất kỳ độ sâu nào (ThueAPIBank hay lồng
// giao dịch trong data.transactions / result.data ...). Trả [] nếu không thấy.
function bank_find_txn_list($data, $depth = 0) {
    if ($depth > 5 || !is_array($data)) return [];
    if (bank_is_list_of_objects($data)) return $data;
    foreach ($data as $v) {
        if (is_array($v)) {
            $r = bank_find_txn_list($v, $depth + 1);
            if (!empty($r)) return $r;
        }
    }
    return [];
}
// Rút danh sách giao dịch từ nhiều định dạng payload khác nhau (Casso/SePay/ThueAPIBank/flat).
// Đào sâu tự động: tìm mảng-các-object ở bất kỳ đâu trong JSON, không phụ thuộc tên khóa.
function bank_extract_transactions($data) {
    if (!is_array($data)) return [];
    $found = bank_find_txn_list($data);
    if (!empty($found)) return $found;
    // Không thấy danh sách nào -> có thể payload chính LÀ 1 giao dịch đơn: bọc lại.
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

// Đọc số tiền BỀN BỈ từ mọi định dạng: số nguyên, số thực, hoặc CHUỖI có dấu phân cách
// ("100,000", "+100.000đ", "100 000 VND"...). intval() cũ đọc "100,000" thành 100 -> nhỏ
// hơn 1000 -> giao dịch bị bỏ qua, KHÔNG cộng tiền. Ở đây chỉ giữ chữ số; dấu trừ = tiền ra.
function bank_amount_int($raw) {
    if (is_int($raw)) return $raw;
    if (is_float($raw)) return (int)$raw;
    $s = (string)$raw;
    $neg = (strpos($s, '-') !== false);
    $digits = preg_replace('/\D+/', '', $s);
    if ($digits === '') return 0;
    $v = (int)substr($digits, 0, 15); // cắt bớt phòng chuỗi quá dài gây tràn số
    return $neg ? -$v : $v;
}

// Cộng số dư cho user có nội dung chuyển khoản khớp "NAP<userId>", chống trùng bằng bankRef.
// Thay đổi trực tiếp $db (tham chiếu). Trả về [số_đã_xử_lý, mảng_log, mảng_thông_báo, mảng_chẩn_đoán].
function bank_process_transactions(&$db, $transactions) {
    $processed = 0;
    $logs = [];
    $notifs = [];  // danh sách nạp tiền để thông báo Telegram (gửi SAU khi ghi DB)
    $details = []; // CHẨN ĐOÁN: mỗi giao dịch kéo về + lý do khớp/không khớp (ghi ra log)
    if (empty($db) || !isset($db['users']) || !is_array($db['users'])) return [0, [], [], []];

    foreach ($transactions as $txn) {
        if (!is_array($txn)) continue;

        $memo = '';
        foreach (['description', 'memo', 'addInfo', 'content', 'remarks', 'transferDescription', 'note', 'detail', 'comment', 'noidung', 'noiDung', 'noi_dung', 'mota', 'moTa', 'mo_ta'] as $f) {
            if (!empty($txn[$f])) { $memo = $txn[$f]; break; }
        }
        // DỰ PHÒNG: không khớp tên field nào -> quét MỌI giá trị chuỗi, lấy cái chứa "NAP"
        // (đúng nội dung nạp do web sinh ra) — nhờ vậy đọc được dù ThueAPIBank đặt tên lạ.
        if ($memo === '') {
            foreach ($txn as $v) {
                if (is_string($v) && stripos(preg_replace('/[^a-zA-Z0-9]/', '', $v), 'NAP') !== false) { $memo = $v; break; }
            }
        }

        // Đọc số tiền: thử lần lượt các tên field, lấy field đầu tiên ra số khác 0.
        $amount = 0;
        foreach (['amount', 'transferAmount', 'value', 'credit', 'creditAmount', 'amountIn', 'money', 'amount_in', 'sotien', 'soTien', 'so_tien', 'tien', 'giatri', 'giaTri'] as $f) {
            if (isset($txn[$f]) && $txn[$f] !== '' && $txn[$f] !== null) {
                $a = bank_amount_int($txn[$f]);
                if ($a != 0) { $amount = $a; break; }
            }
        }
        // DỰ PHÒNG: chưa ra số tiền -> quét field có TÊN gợi ý tiền (chứa amount/tien/money/
        // credit/gia tri/value), lấy giá trị >= 1000 đầu tiên. Đọc được dù tên field lạ.
        if ($amount == 0) {
            foreach ($txn as $k => $v) {
                if (!is_scalar($v)) continue;
                $kl = strtolower((string)$k);
                if (preg_match('/(amount|tien|money|credit|gia.?tri|value|sotien)/', $kl)) {
                    $a = bank_amount_int($v);
                    if ($a >= 1000) { $amount = $a; break; }
                }
            }
        }

        // Bỏ qua giao dịch tiền RA (chỉ cộng tiền VÀO) nếu payload có đánh dấu chiều giao dịch.
        foreach (['type', 'transferType', 'direction'] as $f) {
            if (!empty($txn[$f])) {
                $t = strtolower((string)$txn[$f]);
                if (in_array($t, ['out', 'debit', 'withdraw', 'send', '-'], true)) { $amount = 0; }
                break;
            }
        }
        if ($amount < 0) $amount = 0; // số âm = tiền ra

        $txnRef = '';
        foreach (['transactionNumber', 'tid', 'id', 'reference', 'refNumber', 'transId', 'transactionID', 'ftNo'] as $f) {
            if (!empty($txn[$f])) { $txnRef = strval($txn[$f]); break; }
        }
        if (empty($txnRef)) $txnRef = 'AUTO-' . $amount . '-' . md5($memo . $amount);

        $memo_clean = strtoupper(preg_replace('/[^a-zA-Z0-9]/', '', $memo));
        $dg = ['memo' => $memo_clean, 'amount' => $amount, 'ref' => $txnRef, 'result' => ''];

        if ($amount < 1000) { $dg['result'] = 'BỎ: số tiền < 1000 (đọc được ' . $amount . ')'; $details[] = $dg; continue; }

        // Chống xử lý trùng lặp
        $already = false;
        foreach (($db['transactions'] ?? []) as $t) {
            if (isset($t['bankRef']) && strval($t['bankRef']) === $txnRef) { $already = true; break; }
        }
        if ($already) { $dg['result'] = 'BỎ: đã cộng trước đó (trùng ref)'; $details[] = $dg; continue; }

        // Khớp user: nội dung chuyển khoản phải chứa "NAP<userId>". Chọn userId DÀI NHẤT khớp
        // để tránh nhầm "NAP1" trong "NAP12..." (userId ngắn ăn trước userId dài của khách).
        $matchedIdx = -1; $matchedLen = -1;
        foreach ($db['users'] as $idx => $u) {
            $uid = isset($u['userId']) ? strval($u['userId']) : '';
            if ($uid === '') continue;
            if (strpos($memo_clean, 'NAP' . strtoupper($uid)) !== false && strlen($uid) > $matchedLen) {
                $matchedIdx = $idx; $matchedLen = strlen($uid);
            }
        }
        if ($matchedIdx === -1) {
            $dg['result'] = 'KHÔNG KHỚP: nội dung không chứa NAP<mã tài khoản> nào';
            $details[] = $dg; continue;
        }

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
        $dg['result'] = 'ĐÃ CỘNG +' . number_format($credit) . 'đ -> ' . ($mu['username'] ?? $mu['userId']);
        $details[] = $dg;
    }

    return [$processed, $logs, $notifs, $details];
}
