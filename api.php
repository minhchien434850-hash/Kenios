<?php
// api.php - Backend Storage Sync for kenios.store
ini_set('memory_limit', '640M');
ini_set('max_execution_time', 300);
// Lưu ý: upload_max_filesize/post_max_size KHÔNG thể chỉnh bằng ini_set() lúc
// runtime (PHP đã đọc các giá trị này trước khi script chạy). Xem file .user.ini
// đi kèm — hosting dùng PHP-FPM sẽ tự áp dụng; Apache/php.ini cần admin hosting chỉnh tay.
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, X-Admin-User, X-Admin-Pass");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/lib_secrets.php';
require_once __DIR__ . '/lib_card.php';

$db_file = __DIR__ . '/database.json';
$action = $_GET['action'] ?? '';

// TỰ CẬP NHẬT .htaccess GỐC: file bắt đầu bằng dấu chấm là file ẨN, tải về/up thủ công hay
// bị iPhone/trình duyệt từ chối. Nếu bản trên hosting còn thiếu các mục chặn mới
// (otp_admin.json, auto_backup...), tự ghi lại bản đầy đủ — admin KHÔNG cần up .htaccess.
(function () {
    $ht = __DIR__ . '/.htaccess';
    $cur = @file_get_contents($ht);
    if ($cur !== false && strpos($cur, 'otp_admin') !== false && strpos($cur, 'auto_backup') !== false
        && strpos($cur, 'key_log') !== false && strpos($cur, 'push_subs') !== false
        && strpos($cur, 'bank_poll_marker') !== false && strpos($cur, 'bank_poll_log') !== false) return;
    @file_put_contents($ht,
        "# Chặn truy cập trực tiếp vào các file dữ liệu / bí mật (chỉ cho PHP đọc nội bộ).\n"
        . "# File này do api.php tự tạo/cập nhật — không cần up thủ công.\n"
        . "<FilesMatch \"^(database\\.json|database_backup\\.json|orders_backup\\.json|rate_limits\\.json|secrets\\.php|lib_secrets\\.php|lib_bank\\.php|lib_card\\.php|card_callback_log\\.txt|card_query_log\\.txt|expiry_notify_marker\\.txt|auto_backup_marker\\.txt|bank_poll_marker\\.txt|bank_poll_log\\.txt|auto_backup_[0-9-]+\\.json|otp_admin\\.json|key_log\\.json|push_subs\\.json|push_vapid\\.json|\\.user\\.ini)$\">\n"
        . "  <IfModule mod_authz_core.c>\n    Require all denied\n  </IfModule>\n"
        . "  <IfModule !mod_authz_core.c>\n    Order allow,deny\n    Deny from all\n  </IfModule>\n"
        . "</FilesMatch>\n");
})();

// TỰ TẠO uploads/.htaccess nếu chưa có — chặn thực thi PHP/CGI trong thư mục uploads
// (lớp phòng thủ thứ 2 ngoài whitelist đuôi file). Tự tạo vì file bắt đầu bằng dấu chấm
// là file ẨN, tải về máy/up thủ công hay bị trình duyệt & app Tệp từ chối.
(function () {
    $dir = __DIR__ . '/uploads';
    $ht = $dir . '/.htaccess';
    if (is_dir($dir) && !file_exists($ht)) {
        @file_put_contents($ht,
            "# uploads/.htaccess — thư mục này CHỈ chứa file tĩnh (ảnh/video/tệp tải về).\n"
            . "# Chặn mọi khả năng thực thi mã phía máy chủ (file này do api.php tự tạo).\n"
            . "<FilesMatch \"\\.(php|php3|php4|php5|php7|php8|phtml|phar|pl|py|cgi|sh)$\">\n"
            . "  <IfModule mod_authz_core.c>\n    Require all denied\n  </IfModule>\n"
            . "  <IfModule !mod_authz_core.c>\n    Order allow,deny\n    Deny from all\n  </IfModule>\n"
            . "</FilesMatch>\n"
            . "RemoveHandler .php .php3 .php4 .php5 .php7 .php8 .phtml .phar\n"
            . "RemoveType .php .php3 .php4 .php5 .php7 .php8 .phtml .phar\n");
    }
})();

// Suy ra số ngày sử dụng từ tên gói ("7 Ngày", "1 Tháng"...). null = vĩnh viễn.
function duration_days_from_name($name) {
    $t = mb_strtolower((string)$name);
    if (preg_match('/vĩnh viễn|vinh vien|vĩnh|lifetime|forever|perm/u', $t)) return null;
    preg_match('/\d+/', $t, $m);
    $num = isset($m[0]) ? intval($m[0]) : 1;
    if ($num <= 0) $num = 1;
    if (preg_match('/năm|nam|year/u', $t)) return $num * 365;
    if (preg_match('/tháng|thang|month/u', $t)) return $num * 30;
    if (preg_match('/tuần|tuan|week/u', $t)) return $num * 7;
    if (preg_match('/ngày|ngay|day/u', $t)) return $num;
    return null;
}

// Sinh MÃ TÀI KHOẢN chỉ gồm SỐ, tăng dần giống admin (10001, 10002, ...). Tránh userId
// dạng chữ (uniqid) gây rắc rối khi khớp nội dung chuyển khoản / hiển thị.
function next_numeric_user_id($db) {
    $max = 10000;
    foreach (($db['users'] ?? []) as $u) {
        $uid = (string)($u['userId'] ?? '');
        if ($uid !== '' && ctype_digit($uid)) { $n = intval($uid); if ($n > $max) $max = $n; }
    }
    return (string)($max + 1);
}

function admin_authenticated($db, $admin_user, $admin_pass) {
    $users = $db['users'] ?? [];
    if (empty($users)) return true; // Cho phép ghi lần đầu khi chưa có tài khoản nào (khởi tạo)
    // CHỐNG DÒ MẬT KHẨU ADMIN qua các lệnh quản trị (export_db, save_db, secrets...):
    // giống cơ chế của login — mỗi lần gọi tính 1 lượt theo IP, đúng mật khẩu thì xoá
    // bộ đếm; sai quá 15 lượt trong 10 phút thì khoá IP đó 15 phút.
    $rlKey = 'admin:' . client_ip();
    $rl = rate_limit_hit($rlKey, 15, 600, 900);
    if (!$rl['ok']) return false;
    foreach ($users as $u) {
        if (($u['role'] ?? '') === 'admin'
            && strtolower($u['username'] ?? '') === strtolower($admin_user)
            && verify_password($admin_pass, $u['password'] ?? '')) {
            rate_limit_reset($rlKey); // đúng mật khẩu -> xoá bộ đếm (dùng admin bình thường không bị khoá)
            // XÁC THỰC 2 LỚP: nếu bật (và Telegram đã cấu hình), phải có phiên OTP còn hiệu
            // lực (admin2faOkUntil) — kẻ biết mật khẩu nhưng không có Telegram sẽ bị chặn.
            if (!empty($db['config']['admin2faEnabled'])) {
                $sec2 = read_secrets();
                if (!empty($sec2['telegramBotToken']) && !empty($sec2['telegramChatId'])
                    && intval($u['admin2faOkUntil'] ?? 0) < time()) {
                    return false;
                }
            }
            return true;
        }
    }
    return false;
}

// Kiểm tra RIÊNG mật khẩu admin (KHÔNG qua cổng 2FA) — dùng cho chính luồng cấp/xác minh
// OTP (nếu bắt 2FA ở đây thì thành vòng lặp gà–trứng). Trả về chỉ số user hoặc -1.
function admin_password_ok($db, $admin_user, $admin_pass) {
    foreach (($db['users'] ?? []) as $i => $u) {
        if (($u['role'] ?? '') === 'admin'
            && strtolower($u['username'] ?? '') === strtolower($admin_user)
            && verify_password($admin_pass, $u['password'] ?? '')) return $i;
    }
    return -1;
}

// ---- CHỐNG DÒ MẬT KHẨU / SPAM (rate limit) ----
// Đếm số lần thử theo "khoá" (VD login:ten, card:userId) trong 1 cửa sổ thời gian; vượt
// ngưỡng thì KHOÁ TẠM. Lưu ở file riêng rate_limits.json (khoá flock) để không đụng DB.
// Trả về ['ok'=>bool, 'retry'=>số giây còn phải chờ nếu bị khoá].
function rate_limit_hit($key, $maxAttempts, $windowSec, $lockSec) {
    $file = __DIR__ . '/rate_limits.json';
    $now = time();
    $fp = @fopen($file, 'c+');
    if (!$fp) return ['ok' => true]; // không chặn nếu không mở được file (tránh khoá oan)
    if (!flock($fp, LOCK_EX)) { fclose($fp); return ['ok' => true]; }
    $raw = stream_get_contents($fp);
    $data = $raw ? (json_decode($raw, true) ?: []) : [];
    // Dọn mục cũ để file không phình.
    foreach ($data as $k => $v) {
        $exp = max($v['lockUntil'] ?? 0, ($v['first'] ?? 0) + $windowSec);
        if ($exp < $now - 3600) unset($data[$k]);
    }
    $rec = $data[$key] ?? ['count' => 0, 'first' => $now, 'lockUntil' => 0];
    if (($rec['lockUntil'] ?? 0) > $now) {
        $retry = $rec['lockUntil'] - $now;
        flock($fp, LOCK_UN); fclose($fp);
        return ['ok' => false, 'retry' => $retry];
    }
    if ($now - ($rec['first'] ?? $now) > $windowSec) $rec = ['count' => 0, 'first' => $now, 'lockUntil' => 0];
    $rec['count'] = ($rec['count'] ?? 0) + 1;
    $locked = false;
    if ($rec['count'] > $maxAttempts) { $rec['lockUntil'] = $now + $lockSec; $locked = true; }
    $data[$key] = $rec;
    ftruncate($fp, 0); rewind($fp);
    fwrite($fp, json_encode($data));
    fflush($fp); flock($fp, LOCK_UN); fclose($fp);
    return $locked ? ['ok' => false, 'retry' => $lockSec] : ['ok' => true];
}
// Xoá bộ đếm khi thao tác thành công (VD đăng nhập đúng) để không khoá oan lần sau.
function rate_limit_reset($key) {
    $file = __DIR__ . '/rate_limits.json';
    $fp = @fopen($file, 'c+');
    if (!$fp) return;
    if (!flock($fp, LOCK_EX)) { fclose($fp); return; }
    $raw = stream_get_contents($fp);
    $data = $raw ? (json_decode($raw, true) ?: []) : [];
    if (isset($data[$key])) {
        unset($data[$key]);
        ftruncate($fp, 0); rewind($fp); fwrite($fp, json_encode($data)); fflush($fp);
    }
    flock($fp, LOCK_UN); fclose($fp);
}
// IP khách (ưu tiên header proxy phổ biến). Chỉ dùng để rate-limit, không tin tuyệt đối.
function client_ip() {
    $xff = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '';
    if ($xff !== '') { $parts = explode(',', $xff); return trim($parts[0]); }
    return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
}
// Định dạng "còn phải chờ" thân thiện (giây -> phút/giây).
function retry_human($sec) {
    $sec = max(1, intval($sec));
    if ($sec < 60) return $sec . ' giây';
    return ceil($sec / 60) . ' phút';
}

// Đẩy response về client NGAY rồi mới chạy việc chậm (gửi Telegram) để khách không phải chờ.
// Chỉ chắc chắn hoạt động trên PHP-FPM (fastcgi_finish_request); SAPI khác cố flush buffer.
function flush_response() {
    if (function_exists('fastcgi_finish_request')) { @fastcgi_finish_request(); return; }
    if (function_exists('litespeed_finish_request')) { @litespeed_finish_request(); return; }
    @ob_end_flush(); @flush();
}
// Soạn + gửi thông báo "đơn mới" (kèm cảnh báo kho key nếu sắp hết) tới Telegram admin.
// $isRenew: true = đơn GIA HẠN (khách mua lại gói đang sắp/vừa hết hạn) — tiêu đề Telegram
// phân biệt rõ "GIA HẠN KEY" với "MUA KEY" để admin nhìn phát biết ngay.
function tg_notify_order($username, $serviceName, $pkgName, $price, $remainKeys = null, $isRenew = false) {
    $msg = ($isRenew ? "🔁 <b>GIA HẠN KEY</b>\n" : "🛒 <b>MUA KEY MỚI</b>\n")
         . "👤 <b>" . htmlspecialchars((string)$username) . "</b>\n"
         . "📦 " . htmlspecialchars((string)$serviceName) . " — " . htmlspecialchars((string)$pkgName) . "\n"
         . "💵 " . number_format((float)$price) . "đ";
    if ($remainKeys !== null && $remainKeys <= 3) $msg .= "\n⚠️ Kho gói này còn <b>" . intval($remainKeys) . "</b> key!";
    notify_telegram($msg);
}
// Gửi thông báo "khách nạp tiền" tới Telegram admin.
function tg_notify_deposit($username, $amount, $method) {
    notify_telegram("💰 <b>NẠP TIỀN</b>\n👤 <b>" . htmlspecialchars((string)$username) . "</b>\n➕ "
        . number_format((float)$amount) . "đ\n🏦 " . htmlspecialchars((string)$method));
}

function read_db($file) {
    if (!file_exists($file)) return [];
    $content = file_get_contents($file);
    return json_decode($content, true) ?: [];
}

function write_db($file, $data) {
    $json_content = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    return file_put_contents($file, $json_content, LOCK_EX) !== false;
}

// Kho lưu ĐƠN HÀNG KHÁCH (append-only) — tách riêng khỏi database.json để đơn + key
// của khách KHÔNG mất khi up code mới đè lên database.json. Cộng dồn theo id, không trùng.
function orders_archive_file() { return __DIR__ . '/orders_backup.json'; }

// Gộp thêm các đơn mới vào kho đơn hàng (giữ nguyên đơn cũ, bỏ qua đơn trùng id).
function archive_orders($newOrders) {
    if (empty($newOrders) || !is_array($newOrders)) return;
    $file = orders_archive_file();
    $fp = @fopen($file, 'c+');
    if (!$fp) return;
    if (!flock($fp, LOCK_EX)) { fclose($fp); return; }
    $raw = stream_get_contents($fp);
    $existing = $raw ? (json_decode($raw, true) ?: []) : [];
    if (!is_array($existing)) $existing = [];
    $byId = [];
    foreach ($existing as $o) { if (is_array($o) && !empty($o['id'])) $byId[$o['id']] = true; }
    $changed = false;
    foreach ($newOrders as $o) {
        if (!is_array($o) || empty($o['id']) || isset($byId[$o['id']])) continue;
        $existing[] = $o; $byId[$o['id']] = true; $changed = true;
    }
    if ($changed) {
        ftruncate($fp, 0); rewind($fp);
        fwrite($fp, json_encode($existing, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        fflush($fp);
    }
    flock($fp, LOCK_UN); fclose($fp);
}

// Phục hồi đơn hàng khách từ kho archive vào $db (chỉ thêm đơn còn thiếu, của user còn
// tồn tại). Trả về số đơn đã phục hồi. Dùng khi up file mới làm database.json mất đơn.
function recover_orders_into(&$db) {
    $file = orders_archive_file();
    if (!file_exists($file)) return 0;
    $archived = json_decode(file_get_contents($file), true);
    if (!is_array($archived) || empty($archived)) return 0;
    if (!isset($db['orders']) || !is_array($db['orders'])) $db['orders'] = [];
    $haveIds = [];
    foreach ($db['orders'] as $o) { if (is_array($o) && !empty($o['id'])) $haveIds[$o['id']] = true; }
    $userIds = [];
    foreach (($db['users'] ?? []) as $u) { if (!empty($u['userId'])) $userIds[$u['userId']] = true; }
    $recovered = 0;
    foreach ($archived as $o) {
        if (!is_array($o) || empty($o['id']) || isset($haveIds[$o['id']])) continue;
        // Chỉ phục hồi đơn của user còn tồn tại (tránh rác trỏ tới tài khoản đã xóa).
        if (!empty($o['userId']) && !isset($userIds[$o['userId']])) continue;
        $db['orders'][] = $o; $haveIds[$o['id']] = true; $recovered++;
    }
    if ($recovered > 0) {
        usort($db['orders'], function ($a, $b) {
            return strcmp((string)($b['date'] ?? $b['purchaseDate'] ?? ''), (string)($a['date'] ?? $a['purchaseDate'] ?? ''));
        });
    }
    return $recovered;
}

// So khớp mật khẩu: hỗ trợ hash bcrypt (password_hash) và mật khẩu văn bản thuần
// còn sót lại từ tài khoản demo cũ. Khi khớp bằng văn bản thuần, hàm trả về true
// nhưng KHÔNG tự ý sửa dữ liệu ở đây — nơi gọi tự quyết định có nâng cấp hash hay không.
function verify_password($input, $stored) {
    if ($stored === '' || $stored === null) return false;
    if (password_get_info($stored)['algo'] !== null) {
        return password_verify($input, $stored);
    }
    return hash_equals($stored, $input);
}

function safe_user($u) {
    // Ẩn mật khẩu, liên hệ và MÃ PHIÊN (token) — token là bí mật riêng của mỗi khách,
    // không được lộ cho khách khác qua get_db.
    unset($u['password'], $u['contact'], $u['token']);
    return $u;
}

// Sinh mã phiên đăng nhập ngẫu nhiên (dùng xác thực mua hàng thay cho mật khẩu).
function gen_session_token() {
    return bin2hex(random_bytes(24));
}

// Kiểm tra mã phiên khi mua hàng/thao tác nhạy cảm. Nếu tài khoản ĐÃ có token trên máy
// chủ thì bắt buộc khớp (chống người khác giả mạo userId để mua hộ / rút số dư). Tài
// khoản cũ chưa có token (chưa đăng nhập lại từ khi cập nhật) tạm cho qua — sẽ được bảo
// vệ ngay lần đăng nhập kế tiếp (máy chủ cấp token lúc đó).
function token_ok($u, $token) {
    $serverToken = (string)($u['token'] ?? '');
    if ($serverToken === '') return true;
    return is_string($token) && $token !== '' && hash_equals($serverToken, $token);
}

// Nhắc admin qua Telegram (1 lần/ngày) danh sách key SẮP HẾT HẠN trong 3 ngày tới, để
// admin chủ động nhắn khách gia hạn. Chốt theo file đánh dấu ngày để không gửi trùng.
function maybe_notify_expiring_keys($db) {
    if (!function_exists('notify_telegram')) return;
    $marker = __DIR__ . '/expiry_notify_marker.txt';
    $today = date('Y-m-d');
    if (@file_get_contents($marker) === $today) return;
    @file_put_contents($marker, $today); // ghi TRƯỚC để nhiều request cùng lúc không gửi trùng
    $now = time(); $soon = []; $names = [];
    foreach (($db['users'] ?? []) as $u) { $names[(string)($u['userId'] ?? '')] = (string)($u['username'] ?? ''); }
    foreach (($db['orders'] ?? []) as $o) {
        if (empty($o['expiryDate'])) continue;
        $t = strtotime((string)$o['expiryDate']);
        if ($t === false || $t <= $now || $t > $now + 3 * 86400) continue;
        $un = $names[(string)($o['userId'] ?? '')] ?? (string)($o['userId'] ?? '?');
        $soon[] = "• {$un} — " . ($o['serviceName'] ?? '') . " (" . ($o['packageName'] ?? '') . ") hết hạn " . date('d/m H:i', $t);
        if (count($soon) >= 15) { $soon[] = '…'; break; }
    }
    if ($soon) notify_telegram("⏰ <b>KEY SẮP HẾT HẠN (3 ngày tới)</b>\n" . implode("\n", $soon) . "\n👉 Nhắn khách gia hạn nhé!");
}

// SAO LƯU TỰ ĐỘNG hằng ngày vào 12h TRƯA (giờ Việt Nam) và GỬI VỀ TELEGRAM. Bản sao lưu là
// TOÀN BỘ CẤU HÌNH: cả database.json (config, danh mục, sản phẩm, kho key, người dùng, đơn
// hàng, giao dịch, media metadata...) LẪN khóa API (_secrets: token ngân hàng, Partner
// card2k, Telegram, TTS) — khôi phục là ĐỦ mọi thứ, không thiếu mục nào.
//
// Vì hosting chia sẻ thường KHÔNG có cron: ta kích hoạt khi có khách vào web TỪ 12h trưa
// trở đi, và chốt marker theo ngày (dưới khóa file) nên mỗi ngày chỉ chạy + gửi ĐÚNG 1 lần.
// File backup bị .htaccess chặn tải trực tiếp; giữ 7 bản gần nhất.
function maybe_auto_backup($db_file) {
    // Đường "piggyback" (không có cron): chỉ chạy khi khách vào web TỪ 12h trưa (giờ VN) trở đi.
    try { $vn = new DateTime('now', new DateTimeZone('Asia/Ho_Chi_Minh')); }
    catch (Exception $e) { return; }
    if ((int)$vn->format('G') < 12) return;   // chưa tới 12h trưa -> chưa sao lưu
    daily_backup_core($db_file);
}

// LÕI sao lưu ĐẦY ĐỦ — chạy khi được gọi (KHÔNG kiểm tra giờ; dùng cho cả cron chạy đúng
// 12h). Vẫn chốt marker theo ngày (dưới khóa file) -> mỗi ngày chỉ tạo + gửi Telegram đúng
// 1 lần dù bị gọi nhiều lần. Trả về mảng ['ok'=>bool, 'msg'=>..., 'skipped'=>bool].
function daily_backup_core($db_file) {
    try { $vn = new DateTime('now', new DateTimeZone('Asia/Ho_Chi_Minh')); }
    catch (Exception $e) { return ['ok' => false, 'msg' => 'timezone']; }
    $today = $vn->format('Y-m-d');

    // KIỂM TRA + GHI ĐÁNH DẤU dưới KHÓA FILE (atomic) — mỗi ngày đúng 1 lần.
    $marker = __DIR__ . '/auto_backup_marker.txt';
    $mf = @fopen($marker, 'c+');
    if (!$mf) return ['ok' => false, 'msg' => 'marker'];
    if (!flock($mf, LOCK_EX)) { fclose($mf); return ['ok' => false, 'msg' => 'lock']; }
    $done = trim((string)stream_get_contents($mf)) === $today;
    if (!$done) { ftruncate($mf, 0); rewind($mf); fwrite($mf, $today); fflush($mf); }
    flock($mf, LOCK_UN); fclose($mf);
    if ($done) return ['ok' => true, 'skipped' => true, 'msg' => 'Đã sao lưu hôm nay rồi.'];
    if (!file_exists($db_file)) return ['ok' => false, 'msg' => 'no-db'];

    // Đọc database dưới khóa chia sẻ để không chép trúng lúc đơn hàng đang ghi dở.
    $fp = @fopen($db_file, 'r');
    if (!$fp) return ['ok' => false, 'msg' => 'open'];
    if (!flock($fp, LOCK_SH)) { fclose($fp); return ['ok' => false, 'msg' => 'lock2']; }
    $content = stream_get_contents($fp);
    flock($fp, LOCK_UN); fclose($fp);
    $chk = json_decode($content, true);
    if (!is_array($chk) || !isset($chk['config'])) return ['ok' => false, 'msg' => 'bad-json'];

    // GẮN KÈM KHÓA API (_secrets) để bản sao lưu là ĐẦY ĐỦ — khôi phục lại được cả token
    // ngân hàng/card2k/Telegram, không phải nhập tay lại. Khôi phục qua "Khôi phục từ file"
    // trong tab Sao lưu (đã tự tách _secrets ghi vào secrets.php, không nhét vào database).
    $sec = read_secrets();
    $chk['_secrets'] = [
        'bankToken'        => (string)($sec['bankToken'] ?? ''),
        'cardPartnerId'    => (string)($sec['cardPartnerId'] ?? ''),
        'cardPartnerKey'   => (string)($sec['cardPartnerKey'] ?? ''),
        'telegramBotToken' => (string)($sec['telegramBotToken'] ?? ''),
        'telegramChatId'   => (string)($sec['telegramChatId'] ?? ''),
        'ttsApiKey'        => (string)($sec['ttsApiKey'] ?? ''),
    ];
    $chk['_backupType'] = 'full-config';
    $chk['_backupTime'] = $vn->format('c');
    $bundle = json_encode($chk, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    if ($bundle === false) return ['ok' => false, 'msg' => 'encode'];

    $backupPath = __DIR__ . '/auto_backup_' . $today . '.json';
    @file_put_contents($backupPath, $bundle, LOCK_EX);
    // Dọn: chỉ giữ 7 bản mới nhất.
    $files = glob(__DIR__ . '/auto_backup_????-??-??.json');
    if (is_array($files) && count($files) > 7) {
        sort($files); // tên chứa ngày nên sort chuỗi = sort thời gian
        foreach (array_slice($files, 0, count($files) - 7) as $old) { @unlink($old); }
    }
    // GỬI FILE BACKUP ĐẦY ĐỦ VỀ TELEGRAM admin (bản dự phòng NGOÀI hosting).
    if (function_exists('notify_telegram_document')) {
        $users = is_array($chk['users'] ?? null) ? count($chk['users']) : 0;
        $orders = is_array($chk['orders'] ?? null) ? count($chk['orders']) : 0;
        $svcs = is_array($chk['services'] ?? null) ? count($chk['services']) : 0;
        notify_telegram_document($backupPath,
            "💾 <b>SAO LƯU TỰ ĐỘNG (ĐẦY ĐỦ)</b> — " . $vn->format('d/m/Y H:i') . " (giờ VN)\n"
            . "🧩 Gồm: cấu hình + khóa API + {$svcs} sản phẩm + kho key + {$users} người dùng + {$orders} đơn.\n"
            . "👉 Cất file này. Khôi phục: Quản trị → Sao lưu → <b>Khôi phục từ file</b> (kéo file vào).");
    }
    return ['ok' => true, 'skipped' => false, 'msg' => 'Đã sao lưu & gửi Telegram.', 'file' => basename($backupPath)];
}

// Ghi nhật ký chẩn đoán nạp tự động (giữ ~200 dòng cuối), file bị .htaccess chặn.
function bank_poll_log_write($text) {
    $file = __DIR__ . '/bank_poll_log.txt';
    try { $vn = new DateTime('now', new DateTimeZone('Asia/Ho_Chi_Minh')); $ts = $vn->format('d/m H:i:s'); }
    catch (Exception $e) { $ts = date('d/m H:i:s'); }
    $entry = "[$ts] " . $text . "\n";
    $old = @file_get_contents($file);
    if ($old === false) $old = '';
    $combined = $old . $entry;
    // Cắt bớt: chỉ giữ ~30KB cuối để không phình file.
    if (strlen($combined) > 30000) $combined = substr($combined, -30000);
    @file_put_contents($file, $combined, LOCK_EX);
}

// Đọc riêng: giao dịch của "note" đã được ghi nhận chưa + số dư mới của user đó (đọc từ $db).
function bank_note_status($db, $note) {
    $out = ['credited' => false, 'balance' => null];
    if ($note === '') return $out;
    $noteClean = strtoupper(preg_replace('/[^a-zA-Z0-9]/', '', $note));
    if ($noteClean === '') return $out;
    foreach (($db['transactions'] ?? []) as $t) {
        if (($t['type'] ?? '') !== 'deposit') continue;
        $desc = strtoupper(preg_replace('/[^a-zA-Z0-9]/', '', $t['description'] ?? ''));
        if (strpos($desc, $noteClean) !== false) {
            $out['credited'] = true;
            foreach (($db['users'] ?? []) as $u) {
                if (($u['userId'] ?? '') === ($t['userId'] ?? '~')) { $out['balance'] = $u['balance']; break; }
            }
            break;
        }
    }
    return $out;
}

// ---- NẠP VIETQR TỰ ĐỘNG (dùng chung cho poll thủ công + poll nền) ----
// KÉO lịch sử ACB từ ThueAPIBank rồi cộng tiền cho mọi giao dịch khớp "NAP<userId>".
// Cộng cho TẤT CẢ khách có chuyển khoản chờ, không phụ thuộc ai bấm nút.
//   $note        : (tuỳ chọn) chỉ để biết riêng giao dịch của mã nạp này đã cộng chưa.
//   $minInterval : nếu >0, chỉ THỰC SỰ gọi ThueAPIBank tối đa 1 lần / $minInterval giây
//                  (chung 1 đồng hồ bank_poll_marker.txt cho MỌI nơi gọi — trình duyệt của
//                  nhiều khách + poll nền — để không gọi API quá dày). Chưa tới hạn thì
//                  BỎ QUA việc gọi API nhưng vẫn trả trạng thái mã nạp đọc từ CSDL.
//   $verboseLog  : true = luôn ghi nhật ký chi tiết (dùng cho nút "Quét ngay" của admin);
//                  false = chỉ ghi khi có cộng tiền hoặc lỗi (poll tự động, đỡ nhiễu log).
// Trả về: ['ok'=>bool, 'processed'=>int, 'credited'=>bool, 'balance'=>?, 'skipped'=>bool, 'message'=>string].
function bank_pull_credit($db_file, $note = '', $minInterval = 0, $verboseLog = true) {
    require_once __DIR__ . '/lib_bank.php';
    $secrets = function_exists('read_secrets') ? read_secrets() : [];
    $token = trim((string)($secrets['bankToken'] ?? ''));
    if ($token === '') return ['ok' => false, 'message' => 'Chưa cấu hình token ThueAPIBank trong phần Cấu hình admin.'];

    // GIỚI HẠN NHỊP dùng chung: chốt "đến hạn gọi API chưa" một cách atomic. Chưa tới hạn ->
    // không gọi ThueAPIBank, chỉ đọc trạng thái mã nạp từ CSDL rồi trả về.
    if ($minInterval > 0) {
        $marker = __DIR__ . '/bank_poll_marker.txt';
        $now = time(); $due = false;
        $mf = @fopen($marker, 'c+');
        if ($mf) {
            if (flock($mf, LOCK_EX)) {
                $last = (int)trim((string)stream_get_contents($mf));
                $due = ($now - $last) >= $minInterval;
                if ($due) { ftruncate($mf, 0); rewind($mf); fwrite($mf, (string)$now); fflush($mf); }
                flock($mf, LOCK_UN);
            }
            fclose($mf);
        }
        if (!$due) {
            $db = read_db($db_file);
            $st = bank_note_status($db, $note);
            return ['ok' => true, 'processed' => 0, 'skipped' => true, 'credited' => $st['credited'], 'balance' => $st['balance'], 'message' => 'throttled'];
        }
    }

    $ch = curl_init("https://thueapibank.vn/historyapiacb/" . urlencode($token));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    $response = curl_exec($ch);
    $curl_err = curl_error($ch);
    curl_close($ch);
    if ($response === false) { bank_poll_log_write("LỖI kết nối ThueAPIBank: $curl_err"); return ['ok' => false, 'message' => "Không kết nối được tới ThueAPIBank: $curl_err"]; }
    $parsed = json_decode($response, true);
    if (!is_array($parsed)) { bank_poll_log_write("ThueAPIBank trả về KHÔNG phải JSON (token sai?): " . substr((string)$response, 0, 200)); return ['ok' => false, 'message' => 'ThueAPIBank trả về dữ liệu không hợp lệ (kiểm tra lại token).']; }

    // PHÁT HIỆN LỖI TỪ ThueAPIBank (VD {"status":"error","msg":"Token không hợp lệ"}) — trả
    // lỗi RÕ RÀNG thay vì cố đọc như giao dịch (ra "tiền=0" khó hiểu). Đây là lý do hay gặp
    // nhất khiến "ngân hàng nhận tiền mà web không cộng": token sai / hết hạn / chưa kích hoạt.
    $statusVal = strtolower(trim((string)($parsed['status'] ?? ($parsed['success'] ?? ''))));
    $errMsg = $parsed['msg'] ?? ($parsed['message'] ?? ($parsed['error'] ?? ''));
    if (!is_string($errMsg)) $errMsg = json_encode($errMsg, JSON_UNESCAPED_UNICODE);
    $looksError = in_array($statusVal, ['error', 'false', '0', 'fail', 'failed'], true);
    if (($looksError || $errMsg !== '') && empty(bank_find_txn_list($parsed))) {
        $shown = $errMsg !== '' ? $errMsg : 'ThueAPIBank từ chối yêu cầu';
        bank_poll_log_write("ThueAPIBank BÁO LỖI: " . $shown . "  → token SAI / HẾT HẠN / CHƯA KÍCH HOẠT, hoặc token không phải của tài khoản đang nhận tiền. Vào Cấu hình dán lại token đúng.");
        return ['ok' => false, 'message' => 'ThueAPIBank báo: "' . $shown . '". Kiểm tra lại token trong Cấu hình (token sai/hết hạn/chưa kích hoạt?).'];
    }

    $transactions = bank_extract_transactions($parsed);

    // Khóa file khi cộng tiền để không cộng trùng khi có nhiều request cùng lúc.
    $fp = fopen($db_file, 'c+');
    if (!$fp || !flock($fp, LOCK_EX)) return ['ok' => false, 'message' => 'Không khóa được cơ sở dữ liệu, thử lại sau.'];
    $raw = stream_get_contents($fp);
    $db = $raw ? (json_decode($raw, true) ?: []) : [];
    list($count, $logs, $notifs, $details) = bank_process_transactions($db, $transactions);
    if ($count > 0) {
        ftruncate($fp, 0); rewind($fp);
        fwrite($fp, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        fflush($fp);
    }
    flock($fp, LOCK_UN); fclose($fp);

    // GHI NHẬT KÝ CHẨN ĐOÁN: ThueAPIBank trả về mấy giao dịch, từng cái khớp/không khớp + vì
    // sao. Poll tự động chỉ ghi khi CÓ cộng tiền (đỡ nhiễu); admin "Quét ngay" luôn ghi đủ.
    if ($verboseLog || $count > 0) {
        $summary = "Kéo về " . count($transactions) . " giao dịch, đã cộng " . $count . ".";
        if (empty($transactions)) $summary .= " (ThueAPIBank không trả giao dịch nào — tài khoản đúng chưa? token đúng ngân hàng nhận tiền chưa?)";
        $lines = [$summary];
        foreach (($details ?? []) as $d) {
            $lines[] = "  • ND='" . $d['memo'] . "' | tiền=" . number_format($d['amount']) . " | " . $d['result'];
        }
        // Khi CÓ giao dịch nhưng KHÔNG cộng được -> in DỮ LIỆU GỐC của giao dịch đầu để biết
        // ThueAPIBank đặt tên trường (số tiền/nội dung) là gì mà web đọc chưa ra.
        if ($count === 0 && !empty($transactions) && is_array($transactions[0])) {
            $lines[] = "  RAW mẫu (tên trường thật): " . substr(json_encode($transactions[0], JSON_UNESCAPED_UNICODE), 0, 600);
        }
        bank_poll_log_write(implode("\n", $lines));
    }

    // Báo Telegram cho admin từng giao dịch vừa cộng (sau khi đã mở khóa file).
    if ($count > 0 && function_exists('tg_notify_deposit')) {
        foreach (($notifs ?? []) as $n) { tg_notify_deposit($n['username'] ?? '', $n['amount'] ?? 0, 'VietQR tự động'); }
    }

    $st = bank_note_status($db, $note);
    return ['ok' => true, 'processed' => $count, 'credited' => $st['credited'], 'balance' => $st['balance'], 'skipped' => false, 'message' => 'ok'];
}

// POLL NỀN TỰ ĐỘNG: chạy sau get_db (mỗi lần có người vào web). Giới hạn nhịp 15s nằm bên
// trong bank_pull_credit (chung đồng hồ với poll của trình duyệt khách). Nhờ vậy khách
// chuyển khoản xong, dù KHÔNG bấm nút nào, chỉ cần có ai đó vào web là tiền được cộng.
function maybe_auto_poll_bank($db_file) {
    try { bank_pull_credit($db_file, '', 15, false); } catch (Throwable $e) { /* không được để hỏng get_db */ }
}

// ---- THÔNG BÁO ĐẨY (Web Push, kiểu "không kèm nội dung") ----
// Máy chủ chỉ gửi "cú hích" đánh thức service worker; sw.js tự tải thông báo mới nhất về
// hiển thị. Nhờ vậy KHÔNG cần mã hóa payload phức tạp — chỉ cần chữ ký VAPID (ES256).
function push_b64url($d) { return rtrim(strtr(base64_encode($d), '+/', '-_'), '='); }
// Cặp khóa VAPID (EC P-256) tự sinh 1 lần, lưu vào push_vapid.json (bị .htaccess chặn).
function push_vapid_keys() {
    $file = __DIR__ . '/push_vapid.json';
    $k = @json_decode(@file_get_contents($file), true);
    if (is_array($k) && !empty($k['publicKey']) && !empty($k['privatePem'])) return $k;
    if (!function_exists('openssl_pkey_new')) return null;
    $res = @openssl_pkey_new(['curve_name' => 'prime256v1', 'private_key_type' => OPENSSL_KEYTYPE_EC]);
    if (!$res) return null;
    if (!@openssl_pkey_export($res, $pem)) return null;
    $det = openssl_pkey_get_details($res);
    if (empty($det['ec']['x']) || empty($det['ec']['y'])) return null;
    $pub = push_b64url("\x04" . str_pad($det['ec']['x'], 32, "\0", STR_PAD_LEFT) . str_pad($det['ec']['y'], 32, "\0", STR_PAD_LEFT));
    $k = ['publicKey' => $pub, 'privatePem' => $pem];
    @file_put_contents($file, json_encode($k));
    return $k;
}
// JWT VAPID ký ES256; đổi chữ ký DER của openssl sang dạng thô r||s (64 byte) mà Web Push cần.
function push_vapid_jwt($aud) {
    $k = push_vapid_keys();
    if (!$k) return null;
    $data = push_b64url(json_encode(['typ' => 'JWT', 'alg' => 'ES256']))
        . '.' . push_b64url(json_encode(['aud' => $aud, 'exp' => time() + 43200, 'sub' => 'mailto:admin@kenios.store']));
    if (!@openssl_sign($data, $der, $k['privatePem'], OPENSSL_ALGO_SHA256)) return null;
    // DER: SEQ { INT r, INT s } -> r||s mỗi cái 32 byte (chữ ký ECDSA ngắn nên độ dài luôn 1 byte).
    $parse = function ($der, &$off) {
        if (ord($der[$off]) !== 0x02) return null;
        $len = ord($der[$off + 1]);
        $val = substr($der, $off + 2, $len);
        $off += 2 + $len;
        $val = ltrim($val, "\0");
        return str_pad($val, 32, "\0", STR_PAD_LEFT);
    };
    $off = 2;
    $r = $parse($der, $off);
    $s = $parse($der, $off);
    if ($r === null || $s === null) return null;
    return $data . '.' . push_b64url($r . $s);
}
// Kho subscription của khách (push_subs.json, khóa flock, tối đa 2000 thiết bị).
function push_subs_update($fn) {
    $file = __DIR__ . '/push_subs.json';
    $fp = @fopen($file, 'c+');
    if (!$fp || !flock($fp, LOCK_EX)) { if ($fp) fclose($fp); return null; }
    $raw = stream_get_contents($fp);
    $subs = $raw ? (json_decode($raw, true) ?: []) : [];
    if (!is_array($subs)) $subs = [];
    $out = $fn($subs);
    if (count($subs) > 2000) $subs = array_slice($subs, -2000, null, true);
    ftruncate($fp, 0); rewind($fp);
    fwrite($fp, json_encode($subs));
    fflush($fp); flock($fp, LOCK_UN); fclose($fp);
    return $out === null ? true : $out;
}

// LỊCH SỬ KHO KEY: ghi thêm các dòng {t, by, act(add/remove/sold), sv, pkg, n, total} vào
// key_log.json (bị .htaccess chặn đọc trực tiếp). Giữ tối đa 500 dòng gần nhất.
function key_log_add($entries) {
    $file = __DIR__ . '/key_log.json';
    $fp = @fopen($file, 'c+');
    if (!$fp || !flock($fp, LOCK_EX)) { if ($fp) fclose($fp); return; }
    $raw = stream_get_contents($fp);
    $log = $raw ? (json_decode($raw, true) ?: []) : [];
    if (!is_array($log)) $log = [];
    foreach ($entries as $e) array_unshift($log, $e);
    if (count($log) > 500) $log = array_slice($log, 0, 500);
    ftruncate($fp, 0); rewind($fp);
    fwrite($fp, json_encode($log, JSON_UNESCAPED_UNICODE));
    fflush($fp); flock($fp, LOCK_UN); fclose($fp);
}

// % SALE RIÊNG theo sản phẩm/danh mục (config.itemSales) — trả % CAO NHẤT đang hiệu lực
// khớp với sản phẩm này (theo chính nó hoặc danh mục của nó). Hết hạn/tắt thì bỏ qua.
function item_sale_percent($cfg, $serviceId, $categoryId) {
    $best = 0;
    foreach ((is_array($cfg['itemSales'] ?? null) ? $cfg['itemSales'] : []) as $s) {
        if (!is_array($s) || ($s['enabled'] ?? true) === false) continue;
        $p = floatval($s['percent'] ?? 0);
        if ($p <= 0) continue;
        if (!empty($s['endsAt'])) { $t = strtotime((string)$s['endsAt']); if ($t !== false && time() > $t) continue; }
        $match = ((($s['targetType'] ?? '') === 'service') && (($s['targetId'] ?? '') === $serviceId))
              || ((($s['targetType'] ?? '') === 'category') && (($s['targetId'] ?? '') === $categoryId));
        if ($match && $p > $best) $best = $p;
    }
    return $best;
}

// % GIẢM GIA HẠN (config.renewDiscountPercent): khách MUA LẠI đúng sản phẩm + gói mà họ
// đang có key SẮP HẾT HẠN (trong 7 ngày tới) hoặc VỪA hết hạn (30 ngày qua) thì được giảm.
// Trả 0 nếu tắt hoặc không phải trường hợp gia hạn. Cạnh tranh bằng MAX với VIP/CTV
// (không cộng dồn) — cùng triết lý với các giảm giá khác.
function renew_discount_percent($db, $cfg, $userId, $serviceId, $pkgName) {
    $p = floatval($cfg['renewDiscountPercent'] ?? 0);
    if ($p <= 0 || $userId === '') return 0;
    $now = time();
    foreach (($db['orders'] ?? []) as $o) {
        if (($o['userId'] ?? '') !== $userId) continue;
        if (($o['serviceId'] ?? '') !== $serviceId) continue;
        if ((string)($o['packageName'] ?? '') !== (string)$pkgName) continue;
        if (!empty($o['refunded'])) continue;
        if (empty($o['expiryDate'])) continue; // key vĩnh viễn thì không có khái niệm gia hạn
        $t = strtotime((string)$o['expiryDate']);
        if ($t === false) continue;
        if ($t >= $now - 30 * 86400 && $t <= $now + 7 * 86400) return $p;
    }
    return 0;
}

// QUYỀN CỘNG TÁC VIÊN (config.ctvPerms) — admin bật/tắt từng quyền trong tab Cấu hình.
// Chưa cấu hình gì => mặc định BẬT các quyền an toàn (xem kho/đơn/doanh số, bán tặng,
// trả lời đánh giá) trừ "xem TẤT CẢ đơn" mặc định TẮT (chỉ xem đơn do mình giới thiệu)
// cho riêng tư hơn. Admin luôn có mọi quyền (hàm này chỉ áp cho vai trò 'ctv').
function ctv_perms($cfg) {
    $p = is_array($cfg['ctvPerms'] ?? null) ? $cfg['ctvPerms'] : [];
    $on = function ($key, $default) use ($p) {
        if (!array_key_exists($key, $p)) return $default;
        return $p[$key] === true || $p[$key] === 1 || $p[$key] === '1';
    };
    return [
        'viewStock'     => $on('viewStock', true),
        'viewOrdersOwn' => $on('viewOrdersOwn', true),
        'viewOrdersAll' => $on('viewOrdersAll', false),
        'viewSales'     => $on('viewSales', true),
        'giftPurchase'  => $on('giftPurchase', true),
        'replyReviews'  => $on('replyReviews', true),
    ];
}

// Xác thực 1 yêu cầu là CỘNG TÁC VIÊN (hoặc admin) đang đăng nhập: khớp userId + token
// phiên, vai trò ctv/admin, tài khoản còn hoạt động. Trả về chỉ số user hoặc -1.
// KHÔNG cần mật khẩu admin — CTV chỉ có token phiên như khách thường.
function ctv_user_index($db, $userId, $token) {
    foreach (($db['users'] ?? []) as $i => $u) {
        if ((string)($u['userId'] ?? '') !== (string)$userId) continue;
        $role = (string)($u['role'] ?? '');
        if ($role !== 'ctv' && $role !== 'admin') return -1;
        if (($u['status'] ?? 'active') !== 'active') return -1;
        if (!token_ok($u, $token)) return -1;
        return $i;
    }
    return -1;
}

// Sinh mã giới thiệu ngắn, DUY NHẤT (không trùng refCode nào đang có). Bỏ ký tự dễ nhầm.
function gen_ref_code($db) {
    $alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    $existing = [];
    foreach (($db['users'] ?? []) as $u) { $c = strtoupper(trim((string)($u['refCode'] ?? ''))); if ($c !== '') $existing[$c] = true; }
    do {
        $code = '';
        for ($i = 0; $i < 6; $i++) $code .= $alphabet[random_int(0, strlen($alphabet) - 1)];
    } while (isset($existing[$code]));
    return $code;
}

// Tự động XOÁ 1 mã giảm giá khỏi cấu hình khi đã DÙNG HẾT (đạt "Lượt tối đa" tổng, hoặc đủ
// "Số tài khoản được dùng"). Gọi SAU khi đã cộng usedCount và thêm đơn mới vào $db['orders'].
// autoDelete=false thì giữ lại. Trả về true nếu vừa xoá.
function discount_maybe_autodelete(&$db, $codeIdx, $codeUpper) {
    if ($codeIdx < 0 || !isset($db['config']['discountCodes'][$codeIdx]) || !is_array($db['config']['discountCodes'][$codeIdx])) return false;
    $dc = $db['config']['discountCodes'][$codeIdx];
    if (($dc['autoDelete'] ?? true) === false) return false;
    $exhausted = false;
    $mu = intval($dc['maxUses'] ?? 0);
    if ($mu > 0 && intval($dc['usedCount'] ?? 0) >= $mu) $exhausted = true;
    if (!$exhausted) {
        $muser = intval($dc['maxUsers'] ?? 0);
        if ($muser > 0) {
            $set = [];
            foreach (($db['orders'] ?? []) as $o) {
                if (strtoupper(trim((string)($o['discountCode'] ?? ''))) === $codeUpper) $set[(string)($o['userId'] ?? '')] = true;
            }
            if (count($set) >= $muser) $exhausted = true;
        }
    }
    if ($exhausted) { array_splice($db['config']['discountCodes'], $codeIdx, 1); return true; }
    return false;
}

// Xoá các mã giảm giá ĐÃ HẾT HẠN dùng (qua hết ngày trên "Hạn dùng"). Mã có autoDelete=false
// thì giữ lại. Gọi khi có phát sinh mua để dọn dần danh sách.
function discount_sweep_expired(&$db) {
    if (empty($db['config']['discountCodes']) || !is_array($db['config']['discountCodes'])) return;
    $now = time();
    $db['config']['discountCodes'] = array_values(array_filter($db['config']['discountCodes'], function ($dc) use ($now) {
        if (!is_array($dc)) return false;
        if (($dc['autoDelete'] ?? true) === false) return true;
        if (!empty($dc['expiresAt'])) {
            $t = strtotime((string)$dc['expiresAt']);
            if ($t !== false && $now > $t + 86399) return false; // qua hết ngày ghi trên hạn
        }
        return true;
    }));
}

switch ($action) {
    case 'register':
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $username = trim($input['username'] ?? '');
        $password = (string)($input['password'] ?? '');
        if ($username === '' || strlen($password) < 6) {
            echo json_encode(["status" => "error", "message" => "Tên đăng nhập hoặc mật khẩu không hợp lệ (mật khẩu tối thiểu 6 ký tự)."]);
            exit;
        }
        // Chống tạo tài khoản hàng loạt: tối đa 5 tài khoản / giờ / IP, vượt thì khoá 1 giờ.
        $rlReg = rate_limit_hit('reg:' . client_ip(), 5, 3600, 3600);
        if (!$rlReg['ok']) {
            echo json_encode(["status" => "error", "message" => "Tạo tài khoản quá nhiều lần. Vui lòng thử lại sau " . retry_human($rlReg['retry']) . "."]);
            exit;
        }
        $fp = fopen($db_file, 'c+');
        if (!$fp || !flock($fp, LOCK_EX)) {
            if ($fp) fclose($fp);
            echo json_encode(["status" => "error", "message" => "Không khóa được cơ sở dữ liệu, thử lại sau."]);
            exit;
        }
        $raw = stream_get_contents($fp);
        $db = $raw ? (json_decode($raw, true) ?: []) : [];
        if (!isset($db['users']) || !is_array($db['users'])) {
            flock($fp, LOCK_UN); fclose($fp);
            echo json_encode(["status" => "error", "message" => "Database not initialized"]);
            exit;
        }
        foreach ($db['users'] as $u) {
            if (strtolower($u['username'] ?? '') === strtolower($username)) {
                flock($fp, LOCK_UN); fclose($fp);
                echo json_encode(["status" => "error", "message" => "Tên đăng nhập đã tồn tại."]);
                exit;
            }
        }
        $user = [
            "userId" => next_numeric_user_id($db),
            "username" => $username,
            "password" => password_hash($password, PASSWORD_BCRYPT),
            "contact" => trim((string)($input['contact'] ?? '')),
            "balance" => 0,
            "role" => "member",
            "status" => "active",
            "avatar" => "https://api.dicebear.com/7.x/adventurer/svg?seed=" . urlencode($username),
            "createdAt" => date("Y-m-d"),
            "token" => gen_session_token()
        ];
        // Mã giới thiệu riêng của tài khoản + gắn NGƯỜI GIỚI THIỆU (nếu nhập mã hợp lệ khi
        // đăng ký). referredBy lưu ngay trên máy chủ để sau này thưởng cho người giới thiệu.
        $user['refCode'] = gen_ref_code($db);
        $inRef = strtoupper(trim((string)($input['refCode'] ?? '')));
        if ($inRef !== '' && $inRef !== $user['refCode']) {
            foreach ($db['users'] as $ru) {
                if (strtoupper(trim((string)($ru['refCode'] ?? ''))) === $inRef) { $user['referredBy'] = $inRef; break; }
            }
        }
        $db['users'][] = $user;
        ftruncate($fp, 0); rewind($fp);
        fwrite($fp, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        fflush($fp); flock($fp, LOCK_UN); fclose($fp);
        echo json_encode(["status" => "success", "user" => safe_user($user), "token" => $user['token']]);
        break;

    case 'reset_password':
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $username = trim($input['username'] ?? '');
        $contact = trim((string)($input['contact'] ?? ''));
        $new = (string)($input['newPassword'] ?? '');
        if ($username === '' || $contact === '' || strlen($new) < 6) {
            echo json_encode(["status" => "error", "message" => "Thiếu thông tin hoặc mật khẩu mới quá ngắn."]);
            exit;
        }
        $fp = fopen($db_file, 'c+');
        if (!$fp || !flock($fp, LOCK_EX)) { echo json_encode(["status" => "error", "message" => "Không khóa được CSDL."]); exit; }
        $raw = stream_get_contents($fp);
        $db = $raw ? (json_decode($raw, true) ?: []) : [];
        $idx = -1;
        foreach (($db['users'] ?? []) as $i => $u) {
            if (strtolower($u['username'] ?? '') === strtolower($username)
                && trim((string)($u['contact'] ?? '')) !== ''
                && strtolower(trim((string)($u['contact'] ?? ''))) === strtolower($contact)) { $idx = $i; break; }
        }
        if ($idx === -1) {
            flock($fp, LOCK_UN); fclose($fp);
            echo json_encode(["status" => "error", "message" => "Không khớp tên đăng nhập với email/SĐT đã đăng ký."]);
            exit;
        }
        $db['users'][$idx]['password'] = password_hash($new, PASSWORD_BCRYPT);
        ftruncate($fp, 0); rewind($fp);
        fwrite($fp, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        fflush($fp); flock($fp, LOCK_UN); fclose($fp);
        echo json_encode(["status" => "success", "message" => "Đã đặt lại mật khẩu."]);
        break;

    case 'change_password':
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $username = trim($input['username'] ?? '');
        $current = (string)($input['currentPassword'] ?? '');
        $new = (string)($input['newPassword'] ?? '');
        if ($username === '' || strlen($new) < 6) {
            echo json_encode(["status" => "error", "message" => "Mật khẩu mới tối thiểu 6 ký tự."]);
            exit;
        }
        $fp = fopen($db_file, 'c+');
        if (!$fp || !flock($fp, LOCK_EX)) { echo json_encode(["status" => "error", "message" => "Không khóa được CSDL."]); exit; }
        $raw = stream_get_contents($fp);
        $db = $raw ? (json_decode($raw, true) ?: []) : [];
        $idx = -1;
        foreach (($db['users'] ?? []) as $i => $u) {
            if (strtolower($u['username'] ?? '') === strtolower($username)) { $idx = $i; break; }
        }
        if ($idx === -1 || !verify_password($current, $db['users'][$idx]['password'] ?? '')) {
            flock($fp, LOCK_UN); fclose($fp);
            echo json_encode(["status" => "error", "message" => "Mật khẩu hiện tại không đúng."]);
            exit;
        }
        $db['users'][$idx]['password'] = password_hash($new, PASSWORD_BCRYPT);
        ftruncate($fp, 0); rewind($fp);
        fwrite($fp, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        fflush($fp); flock($fp, LOCK_UN); fclose($fp);
        echo json_encode(["status" => "success", "message" => "Đã đổi mật khẩu."]);
        break;

    case 'login':
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $username = trim($input['username'] ?? '');
        $password = (string)($input['password'] ?? '');
        // Chống dò mật khẩu: tối đa 8 lần thử / 15 phút cho mỗi (IP + tên đăng nhập),
        // vượt thì khoá tạm 15 phút. Đăng nhập đúng sẽ xoá bộ đếm.
        $rlKey = 'login:' . client_ip() . ':' . strtolower($username);
        $rl = rate_limit_hit($rlKey, 8, 900, 900);
        if (!$rl['ok']) {
            echo json_encode(["status" => "error", "message" => "Bạn đã thử sai quá nhiều lần. Vui lòng thử lại sau " . retry_human($rl['retry']) . "."]);
            exit;
        }
        $db = read_db($db_file);
        if (empty($db) || !isset($db['users'])) {
            echo json_encode(["status" => "error", "message" => "Database not initialized"]);
            exit;
        }
        $matchedIdx = -1;
        foreach ($db['users'] as $idx => $u) {
            if (strtolower($u['username'] ?? '') === strtolower($username)) { $matchedIdx = $idx; break; }
        }
        if ($matchedIdx === -1 || !verify_password($password, $db['users'][$matchedIdx]['password'] ?? '')) {
            echo json_encode(["status" => "error", "message" => "Sai tên đăng nhập hoặc mật khẩu."]);
            exit;
        }
        rate_limit_reset($rlKey); // đăng nhập đúng -> xoá bộ đếm
        if (($db['users'][$matchedIdx]['status'] ?? 'active') !== 'active') {
            echo json_encode(["status" => "error", "message" => "Tài khoản đã bị khóa."]);
            exit;
        }
        // Nâng cấp mật khẩu văn bản thuần cũ lên bcrypt ngay khi đăng nhập thành công.
        if (password_get_info($db['users'][$matchedIdx]['password'])['algo'] === null) {
            $db['users'][$matchedIdx]['password'] = password_hash($password, PASSWORD_BCRYPT);
        }
        // Cấp MÃ PHIÊN mới mỗi lần đăng nhập (để xác thực mua hàng thay mật khẩu).
        $token = gen_session_token();
        $db['users'][$matchedIdx]['token'] = $token;
        // Tài khoản cũ chưa có mã giới thiệu -> sinh ngay trên máy chủ (để chương trình
        // giới thiệu hoạt động: người khác nhập mã này khi đăng ký sẽ liên kết được).
        if (empty($db['users'][$matchedIdx]['refCode'])) $db['users'][$matchedIdx]['refCode'] = gen_ref_code($db);
        write_db($db_file, $db);
        echo json_encode(["status" => "success", "user" => safe_user($db['users'][$matchedIdx]), "token" => $token]);
        break;

    // Thưởng GIỚI THIỆU: khi người được mời (referee) đã NẠP TIỀN, cộng thưởng cho NGƯỜI
    // GIỚI THIỆU (referrer) — CHỈ người giới thiệu nhận tiền, người nhập mã KHÔNG nhận.
    // Idempotent: mỗi referee chỉ thưởng 1 lần (cờ referralRewarded).
    case 'claim_referral':
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $userId = (string)($input['userId'] ?? '');
        $token  = (string)($input['token'] ?? '');
        $fp = fopen($db_file, 'c+');
        if (!$fp || !flock($fp, LOCK_EX)) { echo json_encode(["status" => "error", "message" => "Không khóa được CSDL."]); exit; }
        $raw = stream_get_contents($fp);
        $db = $raw ? (json_decode($raw, true) ?: []) : [];
        if (($db['config']['referralEnabled'] ?? true) === false) { flock($fp, LOCK_UN); fclose($fp); echo json_encode(["status" => "success", "rewarded" => false]); exit; }
        $bonus = intval($db['config']['referralBonus'] ?? 0);
        $ri = -1;
        foreach (($db['users'] ?? []) as $i => $u) { if (($u['userId'] ?? '') === $userId) { $ri = $i; break; } }
        if ($ri === -1 || !token_ok($db['users'][$ri], $token)) { flock($fp, LOCK_UN); fclose($fp); echo json_encode(["status" => "error", "message" => "Phiên đăng nhập không hợp lệ."]); exit; }
        $referee = $db['users'][$ri];
        // Đã thưởng rồi hoặc không có người giới thiệu -> bỏ qua (không lỗi).
        if (!empty($referee['referralRewarded']) || empty($referee['referredBy'])) { flock($fp, LOCK_UN); fclose($fp); echo json_encode(["status" => "success", "rewarded" => false]); exit; }
        // Bắt buộc referee ĐÃ TỪNG NẠP TIỀN (chống nhận thưởng khi chưa nạp).
        $hasDeposit = false;
        foreach (($db['transactions'] ?? []) as $t) { if (($t['userId'] ?? '') === $userId && ($t['type'] ?? '') === 'deposit') { $hasDeposit = true; break; } }
        if (!$hasDeposit) { flock($fp, LOCK_UN); fclose($fp); echo json_encode(["status" => "success", "rewarded" => false]); exit; }
        // Tìm người giới thiệu theo refCode đã lưu.
        $refCode = strtoupper(trim((string)$referee['referredBy']));
        $rri = -1;
        foreach (($db['users'] ?? []) as $i => $u) { if (strtoupper(trim((string)($u['refCode'] ?? ''))) === $refCode) { $rri = $i; break; } }
        $db['users'][$ri]['referralRewarded'] = true; // đánh dấu để không thưởng lại
        $rewarded = false;
        if ($rri !== -1 && $rri !== $ri && $bonus > 0) {
            $db['users'][$rri]['balance'] = floatval($db['users'][$rri]['balance'] ?? 0) + $bonus;
            if (!isset($db['transactions'])) $db['transactions'] = [];
            array_unshift($db['transactions'], [
                'id' => 'TXR' . time() . rand(100, 999), 'userId' => $db['users'][$rri]['userId'],
                'amount' => $bonus, 'type' => 'referral',
                'description' => 'Thưởng giới thiệu bạn ' . ($referee['username'] ?? ''), 'date' => date('c')
            ]);
            $rewarded = true;
        }
        ftruncate($fp, 0); rewind($fp);
        fwrite($fp, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        fflush($fp); flock($fp, LOCK_UN); fclose($fp);
        echo json_encode(["status" => "success", "rewarded" => $rewarded]);
        break;

    case 'google_login':
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $credential = trim($input['credential'] ?? '');
        if ($credential === '') {
            echo json_encode(["status" => "error", "message" => "Thiếu credential từ Google."]);
            exit;
        }
        $db = read_db($db_file);
        $client_id = trim((string)($db['config']['googleClientId'] ?? ''));
        if ($client_id === '') {
            echo json_encode(["status" => "error", "message" => "Đăng nhập Google chưa được cấu hình (thiếu Google Client ID)."]);
            exit;
        }

        // Xác thực ID token THẬT SỰ với Google (không tự tin bất kỳ payload nào gửi lên
        // mà không kiểm tra chữ ký) bằng endpoint tokeninfo chính thức của Google.
        $ch = curl_init('https://oauth2.googleapis.com/tokeninfo?id_token=' . urlencode($credential));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        $resp = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        $info = $resp ? json_decode($resp, true) : null;

        if ($http_code !== 200 || !$info || empty($info['email'])) {
            echo json_encode(["status" => "error", "message" => "Không xác thực được với Google (token không hợp lệ hoặc hết hạn)."]);
            exit;
        }
        if (($info['aud'] ?? '') !== $client_id) {
            echo json_encode(["status" => "error", "message" => "Token Google không khớp với ứng dụng này."]);
            exit;
        }
        if (($info['email_verified'] ?? 'false') !== 'true' && ($info['email_verified'] ?? false) !== true) {
            echo json_encode(["status" => "error", "message" => "Email Google chưa được xác minh."]);
            exit;
        }

        $email = strtolower($info['email']);
        // Khóa file + đọc lại DB mới nhất để tạo/đăng nhập tài khoản Google (tránh race
        // và cấp đúng mã số tăng dần).
        $fp = fopen($db_file, 'c+');
        if (!$fp || !flock($fp, LOCK_EX)) {
            if ($fp) fclose($fp);
            echo json_encode(["status" => "error", "message" => "Không khóa được cơ sở dữ liệu, thử lại sau."]);
            exit;
        }
        $raw = stream_get_contents($fp);
        $db = $raw ? (json_decode($raw, true) ?: []) : [];
        if (!isset($db['users']) || !is_array($db['users'])) {
            flock($fp, LOCK_UN); fclose($fp);
            echo json_encode(["status" => "error", "message" => "Database not initialized"]);
            exit;
        }

        $matchedIdx = -1;
        foreach ($db['users'] as $idx => $u) {
            if (strtolower($u['username'] ?? '') === $email) { $matchedIdx = $idx; break; }
        }

        $token = gen_session_token();
        if ($matchedIdx === -1) {
            $user = [
                "userId" => next_numeric_user_id($db),
                "username" => $email,
                "password" => password_hash(bin2hex(random_bytes(16)), PASSWORD_BCRYPT),
                "balance" => 0,
                "role" => "member",
                "status" => "active",
                "authProvider" => "google",
                "avatar" => $info['picture'] ?? ("https://api.dicebear.com/7.x/adventurer/svg?seed=" . urlencode($email)),
                "createdAt" => date("Y-m-d"),
                "token" => $token
            ];
            $user['refCode'] = gen_ref_code($db);
            $inRef = strtoupper(trim((string)($input['refCode'] ?? '')));
            if ($inRef !== '' && $inRef !== $user['refCode']) {
                foreach ($db['users'] as $ru) {
                    if (strtoupper(trim((string)($ru['refCode'] ?? ''))) === $inRef) { $user['referredBy'] = $inRef; break; }
                }
            }
            $db['users'][] = $user;
            ftruncate($fp, 0); rewind($fp);
            fwrite($fp, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            fflush($fp); flock($fp, LOCK_UN); fclose($fp);
            echo json_encode(["status" => "success", "user" => safe_user($user), "token" => $token]);
        } else {
            if (($db['users'][$matchedIdx]['status'] ?? 'active') !== 'active') {
                flock($fp, LOCK_UN); fclose($fp);
                echo json_encode(["status" => "error", "message" => "Tài khoản đã bị khóa."]);
                exit;
            }
            $db['users'][$matchedIdx]['token'] = $token;
            if (empty($db['users'][$matchedIdx]['refCode'])) $db['users'][$matchedIdx]['refCode'] = gen_ref_code($db);
            ftruncate($fp, 0); rewind($fp);
            fwrite($fp, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            fflush($fp); flock($fp, LOCK_UN); fclose($fp);
            echo json_encode(["status" => "success", "user" => safe_user($db['users'][$matchedIdx]), "token" => $token]);
        }
        break;

    case 'test_api':
        $bank = $_GET['bank'] ?? '';
        $token = $_GET['token'] ?? '';
        if (empty($bank) || empty($token)) {
            echo json_encode(["status" => "error", "message" => "Thiếu ngân hàng hoặc token"]);
            exit;
        }
        $url = "https://thueapibank.vn/api/" . urlencode($bank) . "/" . urlencode($token);
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        $response = curl_exec($ch);
        curl_close($ch);
        if ($response === false) {
            echo json_encode(["status" => "error", "message" => "Lỗi kết nối từ server hosting đến ThueAPIBank"]);
            exit;
        }
        echo $response;
        break;

    case 'poll_acb':
        // Chủ động KÉO lịch sử giao dịch ACB từ ThueAPIBank rồi cộng số dư cho các nội
        // dung chuyển khoản khớp "NAP<userId>". Token giữ bí mật trong secrets.php.
        // Khách bấm "Tôi đã chuyển khoản" HOẶC trang tự gọi ngầm vài giây/lần khi mở QR.
        $body = json_decode(file_get_contents('php://input'), true) ?: [];
        $note = (string)($body['note'] ?? '');
        // Giới hạn nhịp 8s chung: nhiều khách mở QR cùng lúc cũng không gọi ThueAPIBank quá
        // dày. Chưa tới hạn thì chỉ đọc trạng thái mã nạp từ CSDL (vẫn báo "đã cộng" kịp thời).
        $r = bank_pull_credit($db_file, $note, 8, false);
        if (empty($r['ok'])) {
            echo json_encode(["status" => "error", "message" => $r['message'] ?? 'Lỗi kiểm tra giao dịch.']);
            exit;
        }
        echo json_encode([
            "status" => "success", "processed" => $r['processed'] ?? 0,
            "credited" => !empty($r['credited']), "balance" => $r['balance'] ?? null
        ]);
        break;

    // CRON SAO LƯU 12H: cron job của hosting gọi URL này lúc 12h -> tạo bản sao lưu ĐẦY ĐỦ
    // + gửi Telegram NGAY (không phụ thuộc múi giờ máy chủ). Vẫn chốt marker/ngày nên gọi
    // nhiều lần cũng chỉ 1 backup/ngày. Không trả dữ liệu nhạy cảm, marker giới hạn lạm dụng.
    case 'cron_backup':
        $r = daily_backup_core($db_file);
        echo json_encode([
            'status'  => !empty($r['ok']) ? 'success' : 'error',
            'skipped' => !empty($r['skipped']),
            'message' => $r['msg'] ?? '',
            'file'    => $r['file'] ?? ''
        ], JSON_UNESCAPED_UNICODE);
        break;

    // TRẠM TRUNG CHUYỂN VIDEO: video nền/hero đặt ở nguồn khác bị CORS chặn fetch trong
    // webview Zalo -> máy chủ tải hộ rồi trả về như file cùng nhà. CHỈ cho file video,
    // chặn địa chỉ nội bộ (chống dò mạng), giới hạn 50MB, cache 1 ngày cho nhẹ băng thông.
    case 'media_proxy': {
        $u = isset($_GET['u']) ? trim((string)$_GET['u']) : '';
        if (!preg_match('~^https?://~i', $u) || !preg_match('~\.(mp4|webm|ogg|ogv|mov|m4v)([?#]|$)~i', $u)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'URL không hợp lệ (chỉ nhận file video)']);
            break;
        }
        $host = parse_url($u, PHP_URL_HOST);
        $ip = $host ? gethostbyname($host) : '';
        if (!$host || ($ip && filter_var($ip, FILTER_VALIDATE_IP) &&
            !filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE))) {
            http_response_code(403);
            echo json_encode(['status' => 'error', 'message' => 'Nguồn video không được phép']);
            break;
        }
        $ext = strtolower(preg_replace('~^.*\.([a-z0-9]+)([?#].*)?$~i', '$1', $u));
        $mime = ['mp4' => 'video/mp4', 'webm' => 'video/webm', 'ogg' => 'video/ogg',
                 'ogv' => 'video/ogg', 'mov' => 'video/quicktime', 'm4v' => 'video/mp4'][$ext] ?? 'video/mp4';
        header('Content-Type: ' . $mime);
        header('Cache-Control: public, max-age=86400'); // webview cache 1 ngày, đỡ tải lại
        header_remove('Pragma');
        $sent = 0;
        $ch = curl_init($u);
        curl_setopt_array($ch, [
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_MAXREDIRS      => 3,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_TIMEOUT        => 120,
            // CHỈ cho http/https (kể cả khi bị chuyển hướng) — chặn file://, gopher://... để
            // không bị lợi dụng đọc tệp nội bộ / dò dịch vụ trong mạng máy chủ (SSRF).
            CURLOPT_PROTOCOLS       => CURLPROTO_HTTP | CURLPROTO_HTTPS,
            CURLOPT_REDIR_PROTOCOLS => CURLPROTO_HTTP | CURLPROTO_HTTPS,
            CURLOPT_USERAGENT      => 'Mozilla/5.0 (kenios-media-proxy)',
            CURLOPT_WRITEFUNCTION  => function ($ch, $chunk) use (&$sent) {
                $sent += strlen($chunk);
                if ($sent > 50 * 1024 * 1024) return -1; // quá 50MB -> ngắt
                echo $chunk;
                return strlen($chunk);
            }
        ]);
        curl_exec($ch);
        curl_close($ch);
        exit; // đã tự đổ dữ liệu ra, không cho khối JSON phía dưới chạy thêm
    }

    case 'get_db':
        if (!file_exists($db_file)) {
            echo json_encode(["status" => "error", "message" => "Database file not found"]);
            exit;
        }
        $db = read_db($db_file);

        // TỰ PHỤC HỒI ĐƠN HÀNG: nếu database.json vừa bị up file mới đè làm MẤT SẠCH đơn
        // (orders rỗng) nhưng kho đơn hàng bền vững còn dữ liệu, gộp đơn của khách trở lại
        // ngay để khách không mất key. Chỉ chạy khi orders rỗng nên gần như không tốn kém.
        if (empty($db['orders']) && file_exists(orders_archive_file())) {
            $fp = @fopen($db_file, 'c+');
            if ($fp && flock($fp, LOCK_EX)) {
                $raw = stream_get_contents($fp);
                $live = $raw ? (json_decode($raw, true) ?: []) : [];
                if (is_array($live) && empty($live['orders'])) {
                    if (recover_orders_into($live) > 0) {
                        ftruncate($fp, 0); rewind($fp);
                        fwrite($fp, json_encode($live, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
                        fflush($fp);
                    }
                    $db = $live;
                } elseif (is_array($live)) {
                    $db = $live;
                }
                flock($fp, LOCK_UN); fclose($fp);
            }
        }

        $admin_user = $_SERVER['HTTP_X_ADMIN_USER'] ?? ($_GET['admin_user'] ?? '');
        $admin_pass = $_SERVER['HTTP_X_ADMIN_PASS'] ?? ($_GET['admin_pass'] ?? '');
        $is_admin = !empty($admin_user) && admin_authenticated($db, $admin_user, $admin_pass);

        if (isset($db['users']) && is_array($db['users'])) {
            $db['users'] = array_map('safe_user', $db['users']);
        }
        // Yêu cầu nạp thẻ (cardRequests) chứa userId + mệnh giá của khách — chỉ trả cho
        // admin đã xác thực, khách thường KHÔNG được thấy của người khác.
        if (!$is_admin) unset($db['cardRequests']);
        // bankToken đã chuyển sang secrets.php — không trả field cũ này ra ngoài nữa.
        if (isset($db['config']['bankToken'])) $db['config']['bankToken'] = '';
        // Kho key thật của từng gói CHỈ trả về cho admin đã xác thực; khách thường chỉ
        // thấy số lượng còn lại (keyCount) để tránh lộ toàn bộ key chưa bán cho bất kỳ ai ghé web.
        if (isset($db['services']) && is_array($db['services'])) {
            foreach ($db['services'] as $si => $s) {
                foreach (($s['packages'] ?? []) as $pi => $p) {
                    if (array_key_exists('keys', $p)) {
                        $db['services'][$si]['packages'][$pi]['keyCount'] = count($p['keys']);
                        if (!$is_admin) unset($db['services'][$si]['packages'][$pi]['keys']);
                    }
                }
            }
        }
        // Không trả lịch sử nạp thẻ (chứa code/serial + dữ liệu riêng của khách) ra public.
        // Khách xem thẻ của mình qua action=card_status; admin xem qua action=card_requests.
        unset($db['cardRequests']);
        echo json_encode($db, JSON_UNESCAPED_UNICODE);
        // Nhắc admin qua Telegram (tối đa 1 lần/ngày) danh sách key sắp hết hạn — gửi SAU
        // khi đã trả dữ liệu cho khách nên không làm chậm ai.
        flush_response();
        maybe_notify_expiring_keys(read_db($db_file));
        maybe_auto_backup($db_file); // sao lưu tự động 1 lần/ngày (sau khi đã trả dữ liệu)
        maybe_auto_poll_bank($db_file); // NẠP VIETQR tự động: cộng tiền dù khách không bấm nút
        break;

    case 'redeem_key':
        // Mua gói có kho key thật: xác thực lại tài khoản NGAY TẠI MÁY CHỦ (không tin
        // dữ liệu phía trình duyệt), rồi rút 1 key + trừ số dư một cách nguyên tử (atomic)
        // bằng khóa file, tránh 2 người mua cùng lúc nhận trùng 1 key.
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $userId = (string)($input['userId'] ?? '');
        $username = trim((string)($input['username'] ?? ''));
        $token = (string)($input['token'] ?? '');
        $serviceId = (string)($input['serviceId'] ?? '');
        $packageId = (string)($input['packageId'] ?? '');
        $discountCode = strtoupper(trim((string)($input['discountCode'] ?? '')));

        $fp = fopen($db_file, 'c+');
        if (!$fp || !flock($fp, LOCK_EX)) {
            echo json_encode(["status" => "error", "message" => "Không khóa được cơ sở dữ liệu, vui lòng thử lại."]);
            exit;
        }
        $raw = stream_get_contents($fp);
        $db = $raw ? (json_decode($raw, true) ?: []) : [];

        // Xác thực bằng TÀI KHOẢN ĐANG ĐĂNG NHẬP (userId, ưu tiên) hoặc username — KHÔNG
        // bắt nhập lại mật khẩu (hoạt động cả với tài khoản đăng nhập bằng Google).
        $userIdx = -1;
        foreach (($db['users'] ?? []) as $i => $u) {
            if ($userId !== '' && ($u['userId'] ?? '') === $userId) { $userIdx = $i; break; }
            if ($userId === '' && strtolower($u['username'] ?? '') === strtolower($username)) { $userIdx = $i; break; }
        }
        if ($userIdx === -1) {
            flock($fp, LOCK_UN); fclose($fp);
            echo json_encode(["status" => "error", "message" => "Không tìm thấy tài khoản. Vui lòng đăng nhập lại."]);
            exit;
        }
        if (!token_ok($db['users'][$userIdx], $token)) {
            flock($fp, LOCK_UN); fclose($fp);
            echo json_encode(["status" => "error", "message" => "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."]);
            exit;
        }
        if (!empty($db['config']['maintenanceMode']) && ($db['users'][$userIdx]['role'] ?? '') !== 'admin') {
            flock($fp, LOCK_UN); fclose($fp);
            echo json_encode(["status" => "error", "message" => "Shop đang bảo trì, vui lòng quay lại sau ít phút."]);
            exit;
        }
        if (($db['users'][$userIdx]['status'] ?? 'active') !== 'active') {
            flock($fp, LOCK_UN); fclose($fp);
            echo json_encode(["status" => "error", "message" => "Tài khoản đã bị khóa."]);
            exit;
        }

        $serviceIdx = -1;
        foreach (($db['services'] ?? []) as $i => $s) { if ($s['id'] === $serviceId) { $serviceIdx = $i; break; } }
        if ($serviceIdx === -1) {
            flock($fp, LOCK_UN); fclose($fp);
            echo json_encode(["status" => "error", "message" => "Dịch vụ không tồn tại."]);
            exit;
        }
        $service = $db['services'][$serviceIdx];

        $pkgIdx = -1;
        foreach (($service['packages'] ?? []) as $i => $p) { if ($p['id'] === $packageId) { $pkgIdx = $i; break; } }
        if ($pkgIdx === -1) {
            flock($fp, LOCK_UN); fclose($fp);
            echo json_encode(["status" => "error", "message" => "Gói dịch vụ không tồn tại."]);
            exit;
        }
        $pkg = $service['packages'][$pkgIdx];

        $basePrice = floatval($pkg['price'] ?? 0);
        $originalPrice = $basePrice;
        $cfg = is_array($db['config'] ?? null) ? $db['config'] : [];

        // 1) Flash Sale toàn shop (giảm % nếu đang bật & còn hiệu lực).
        $flashPercent = 0;
        $fs = is_array($cfg['flashSale'] ?? null) ? $cfg['flashSale'] : [];
        if (!empty($fs['enabled'])) {
            $fp_percent = floatval($fs['percent'] ?? 0);
            $endsOk = empty($fs['endsAt']) || strtotime((string)$fs['endsAt']) > time();
            if ($fp_percent > 0 && $endsOk) $flashPercent = $fp_percent;
        }
        // 1b) Sale RIÊNG theo sản phẩm/danh mục: so với Flash toàn shop lấy mức CAO HƠN
        // (không cộng dồn để tránh giảm chồng giảm).
        $isp = item_sale_percent($cfg, $serviceId, (string)($service['categoryId'] ?? ''));
        if ($isp > $flashPercent) $flashPercent = $isp;
        $price = $basePrice - floor($basePrice * $flashPercent / 100);

        // 2) Hạng VIP theo tổng chi tiêu (tổng price các đơn của user).
        $vipPercent = 0;
        $tiers = is_array($cfg['vipTiers'] ?? null) ? $cfg['vipTiers'] : [];
        if (!empty($tiers)) {
            $uid = $db['users'][$userIdx]['userId'] ?? '';
            $spent = 0;
            foreach (($db['orders'] ?? []) as $o) { if (($o['userId'] ?? '') === $uid) $spent += floatval($o['price'] ?? 0); }
            foreach ($tiers as $t) {
                if (!is_array($t)) continue;
                if ($spent >= (floatval($t['minSpent'] ?? 0)) && floatval($t['discountPercent'] ?? 0) > $vipPercent) {
                    $vipPercent = floatval($t['discountPercent'] ?? 0);
                }
            }
        }
        // 2b) Chiết khấu CTV: cộng tác viên có % riêng (config.ctvDiscountPercent);
        // lấy mức CAO HƠN giữa VIP và CTV (không cộng dồn).
        if (($db['users'][$userIdx]['role'] ?? '') === 'ctv') {
            $ctvP = floatval($cfg['ctvDiscountPercent'] ?? 0);
            if ($ctvP > $vipPercent) $vipPercent = $ctvP;
        }
        // 2c) GIA HẠN: nếu admin CÓ đặt % gia hạn và đây đúng là trường hợp gia hạn, giá
        // tính THẲNG TỪ GIÁ GỐC của sản phẩm — KHÔNG cộng dồn với sale/VIP/CTV. Nhờ vậy
        // gia hạn lần nào giá cũng như nhau (không lấy giá đã giảm của lần trước để giảm
        // tiếp). Admin CHƯA đặt % gia hạn thì gia hạn = mua thường, không tự giảm.
        $renewP = renew_discount_percent($db, $cfg, (string)($db['users'][$userIdx]['userId'] ?? ''), $serviceId, (string)($pkg['name'] ?? ''));
        if ($renewP > 0) {
            $flashPercent = 0;
            $vipPercent = $renewP;
            $price = max(0, $basePrice - floor($basePrice * $renewP / 100));
        } else {
            $price = max(0, $price - floor($price * $vipPercent / 100));
        }

        // 3) Mã giảm giá (nếu khách nhập): đối chiếu + kiểm tra hạn/lượt/đơn tối thiểu/danh mục.
        $discountAmount = 0;
        $appliedCode = '';
        $matchedCodeIdx = -1;
        if ($discountCode !== '') {
            $matched = null;
            foreach (($cfg['discountCodes'] ?? []) as $ci => $dc) {
                if (!is_array($dc)) continue;
                if (($dc['enabled'] ?? true) === false) continue;
                if (strtoupper(trim((string)($dc['code'] ?? ''))) === $discountCode) { $matched = $dc; $matchedCodeIdx = $ci; break; }
            }
            $err = '';
            if ($matched === null) $err = "Mã giảm giá không đúng hoặc đã hết hiệu lực.";
            // Hết hạn = QUA HẾT NGÀY ghi trên mã (23:59:59) — thống nhất với danh sách admin
            // và bộ dọn tự động (trước đây chỗ này tính từ 0h sáng nên lệch nhau cả ngày).
            elseif (!empty($matched['expiresAt']) && strtotime((string)$matched['expiresAt']) + 86399 < time()) $err = "Mã giảm giá đã hết hạn sử dụng.";
            elseif ((intval($matched['maxUses'] ?? 0) > 0) && (intval($matched['usedCount'] ?? 0) >= intval($matched['maxUses'] ?? 0))) $err = "Mã giảm giá đã hết lượt sử dụng.";
            elseif ((intval($matched['minOrder'] ?? 0) > 0) && $price < intval($matched['minOrder'] ?? 0)) $err = "Đơn chưa đạt mức tối thiểu để dùng mã.";
            elseif (!empty($matched['categoryId']) && ($matched['categoryId'] !== ($service['categoryId'] ?? ''))) $err = "Mã giảm giá không áp dụng cho sản phẩm này.";
            // Giới hạn SỐ LẦN MỖI NGƯỜI (maxUsesPerUser): đếm số đơn của CHÍNH khách này đã
            // từng dùng đúng mã đó. Đạt giới hạn -> không cho dùng nữa. Để trống/0 = không hạn.
            if ($err === '' && intval($matched['maxUsesPerUser'] ?? 0) > 0) {
                $uidCur = (string)($db['users'][$userIdx]['userId'] ?? '');
                $usedByUser = 0;
                foreach (($db['orders'] ?? []) as $o) {
                    if (($o['userId'] ?? '') === $uidCur && strtoupper(trim((string)($o['discountCode'] ?? ''))) === $discountCode) $usedByUser++;
                }
                if ($usedByUser >= intval($matched['maxUsesPerUser'])) $err = "Bạn đã dùng mã này đủ số lần cho phép (" . intval($matched['maxUsesPerUser']) . " lần/người).";
            }
            // Giới hạn SỐ TÀI KHOẢN được dùng (maxUsers): đếm số tài khoản KHÁC NHAU đã từng
            // dùng mã. Nếu khách hiện tại chưa nằm trong nhóm đó VÀ đã đủ số tài khoản -> chặn.
            // (Khách đã từng dùng vẫn dùng tiếp được, tuỳ 'số lần/người'.) Để trống/0 = không hạn.
            if ($err === '' && intval($matched['maxUsers'] ?? 0) > 0) {
                $uidCur = (string)($db['users'][$userIdx]['userId'] ?? '');
                $usersUsed = []; $mePresent = false;
                foreach (($db['orders'] ?? []) as $o) {
                    if (strtoupper(trim((string)($o['discountCode'] ?? ''))) === $discountCode) {
                        $ouid = (string)($o['userId'] ?? '');
                        $usersUsed[$ouid] = true;
                        if ($ouid === $uidCur) $mePresent = true;
                    }
                }
                if (!$mePresent && count($usersUsed) >= intval($matched['maxUsers'])) $err = "Mã giảm giá chỉ dành cho " . intval($matched['maxUsers']) . " tài khoản (đã đủ số người dùng).";
            }
            if ($err !== '') {
                flock($fp, LOCK_UN); fclose($fp);
                echo json_encode(["status" => "error", "message" => $err]);
                exit;
            }
            $val = floatval($matched['value'] ?? 0);
            $discountAmount = (($matched['type'] ?? 'percent') === 'amount') ? floor($val) : floor($price * $val / 100);
            $discountAmount = max(0, min($discountAmount, $price));
            $appliedCode = $discountCode;
        }
        $price = $price - $discountAmount;

        $balance = floatval($db['users'][$userIdx]['balance'] ?? 0);
        if ($balance < $price) {
            flock($fp, LOCK_UN); fclose($fp);
            echo json_encode(["status" => "error", "message" => "Số dư không đủ. Vui lòng nạp thêm tiền."]);
            exit;
        }

        $keys = $pkg['keys'] ?? [];
        if (empty($keys)) {
            flock($fp, LOCK_UN); fclose($fp);
            echo json_encode(["status" => "error", "message" => "Gói này tạm hết key, vui lòng liên hệ Admin hoặc chọn gói khác."]);
            exit;
        }
        $key = array_shift($keys);
        $db['services'][$serviceIdx]['packages'][$pkgIdx]['keys'] = $keys;
        $db['users'][$userIdx]['balance'] = $balance - $price;

        // Hệ điều hành khách chọn: ưu tiên tên thư mục con, rồi tới tên danh mục.
        $os = trim((string)($input['os'] ?? ''));
        if ($os === '') {
            $subId = $service['subcategoryId'] ?? '';
            foreach (($db['subcategories'] ?? []) as $sc) { if (($sc['id'] ?? '') === $subId && $subId !== '') { $os = $sc['name']; break; } }
            if ($os === '') foreach (($db['categories'] ?? []) as $c) { if (($c['id'] ?? '') === ($service['categoryId'] ?? '')) { $os = $c['name']; break; } }
        }
        // Tăng lượt dùng của mã giảm giá đã áp dụng thành công.
        if ($matchedCodeIdx >= 0) {
            $db['config']['discountCodes'][$matchedCodeIdx]['usedCount'] = (intval($db['config']['discountCodes'][$matchedCodeIdx]['usedCount'] ?? 0)) + 1;
        }
        $totalDiscount = $originalPrice - $price;
        $purchaseTs = time();
        $days = duration_days_from_name($pkg['name']);
        $order = [
            "id" => "DH" . time() . rand(100, 999), "userId" => $db['users'][$userIdx]['userId'],
            "serviceId" => $serviceId, "serviceName" => $service['name'], "packageName" => $pkg['name'],
            "os" => $os, "price" => $price, "originalPrice" => $originalPrice,
            "discountCode" => $appliedCode, "discountAmount" => $totalDiscount,
            "flashPercent" => $flashPercent, "vipPercent" => $vipPercent, "key" => $key,
            "date" => date("c", $purchaseTs), "purchaseDate" => date("c", $purchaseTs),
            "expiryDate" => $days === null ? null : date("c", $purchaseTs + $days * 86400)
        ];
        if (!isset($db['orders'])) $db['orders'] = [];
        array_unshift($db['orders'], $order);
        if (!isset($db['transactions'])) $db['transactions'] = [];
        $parts = [];
        if ($flashPercent > 0) $parts[] = "flash -{$flashPercent}%";
        if ($vipPercent > 0) $parts[] = ($renewP > 0 ? "gia hạn -{$vipPercent}%" : "VIP -{$vipPercent}%");
        if ($appliedCode !== '') $parts[] = "mã {$appliedCode}";
        $txDesc = count($parts) > 0
            ? "Mua {$service['name']} - {$pkg['name']} (" . implode(', ', $parts) . " · giảm " . number_format($totalDiscount) . "đ)"
            : "Mua {$service['name']} - {$pkg['name']}";
        array_unshift($db['transactions'], [
            "id" => "TX" . time() . rand(100, 999), "userId" => $db['users'][$userIdx]['userId'], "amount" => -$price,
            "type" => "purchase", "description" => $txDesc, "date" => date("c")
        ]);

        // Tự xoá mã giảm giá nếu đã dùng hết (sau khi đã cộng lượt & thêm đơn ở trên) + dọn
        // các mã đã HẾT HẠN.
        if ($matchedCodeIdx >= 0 && $appliedCode !== '') discount_maybe_autodelete($db, $matchedCodeIdx, $appliedCode);
        discount_sweep_expired($db);

        ftruncate($fp, 0);
        rewind($fp);
        fwrite($fp, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        fflush($fp);
        flock($fp, LOCK_UN);
        fclose($fp);

        archive_orders([$order]); // lưu đơn + key vào kho đơn hàng bền vững
        echo json_encode(["status" => "success", "order" => $order, "balance" => $db['users'][$userIdx]['balance']]);
        // Thông báo Telegram cho admin SAU KHI đã trả kết quả cho khách (không bắt khách chờ).
        flush_response();
        // Lịch sử kho: ghi 1 dòng "đã bán 1 key" (sau khi trả kết quả, không làm chậm khách).
        key_log_add([['t' => date('c'), 'by' => (string)($db['users'][$userIdx]['username'] ?? ''), 'act' => 'sold',
            'sv' => (string)$service['name'], 'pkg' => (string)$pkg['name'], 'n' => 1, 'total' => count($keys)]]);
        tg_notify_order($db['users'][$userIdx]['username'] ?? $order['userId'], $service['name'], $pkg['name'], $price, count($keys), $renewP > 0);
        break;

    case 'purchase':
        // Mua gói CHƯA cấu hình kho key thật (không có field `keys`): TRỪ SỐ DƯ NGAY TRÊN
        // MÁY CHỦ một cách nguyên tử (atomic) bằng khóa file, sinh key demo, tạo đơn +
        // giao dịch. Nhờ vậy số dư đã trừ được lưu bền vững trên server — bảng quản trị
        // hiển thị đúng số dư còn lại, và khách xóa dữ liệu web / đăng nhập lại vẫn thấy
        // số dư đã bị trừ (không bị "hoàn tiền ảo" như đường demo cục bộ trước đây).
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $userId = (string)($input['userId'] ?? '');
        $username = trim((string)($input['username'] ?? ''));
        $token = (string)($input['token'] ?? '');
        $serviceId = (string)($input['serviceId'] ?? '');
        $packageId = (string)($input['packageId'] ?? '');
        $discountCode = strtoupper(trim((string)($input['discountCode'] ?? '')));

        $fp = fopen($db_file, 'c+');
        if (!$fp || !flock($fp, LOCK_EX)) {
            echo json_encode(["status" => "error", "message" => "Không khóa được cơ sở dữ liệu, vui lòng thử lại."]);
            exit;
        }
        $raw = stream_get_contents($fp);
        $db = $raw ? (json_decode($raw, true) ?: []) : [];

        // Xác định người mua theo userId (ưu tiên) hoặc username. Không tin số dư phía client.
        $userIdx = -1;
        foreach (($db['users'] ?? []) as $i => $u) {
            if ($userId !== '' && ($u['userId'] ?? '') === $userId) { $userIdx = $i; break; }
            if ($userId === '' && strtolower($u['username'] ?? '') === strtolower($username)) { $userIdx = $i; break; }
        }
        if ($userIdx === -1) {
            flock($fp, LOCK_UN); fclose($fp);
            echo json_encode(["status" => "error", "message" => "Không tìm thấy tài khoản. Vui lòng đăng nhập lại."]);
            exit;
        }
        if (!token_ok($db['users'][$userIdx], $token)) {
            flock($fp, LOCK_UN); fclose($fp);
            echo json_encode(["status" => "error", "message" => "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."]);
            exit;
        }
        if (!empty($db['config']['maintenanceMode']) && ($db['users'][$userIdx]['role'] ?? '') !== 'admin') {
            flock($fp, LOCK_UN); fclose($fp);
            echo json_encode(["status" => "error", "message" => "Shop đang bảo trì, vui lòng quay lại sau ít phút."]);
            exit;
        }
        if (($db['users'][$userIdx]['status'] ?? 'active') !== 'active') {
            flock($fp, LOCK_UN); fclose($fp);
            echo json_encode(["status" => "error", "message" => "Tài khoản đã bị khóa."]);
            exit;
        }

        $serviceIdx = -1;
        foreach (($db['services'] ?? []) as $i => $s) { if ($s['id'] === $serviceId) { $serviceIdx = $i; break; } }
        if ($serviceIdx === -1) {
            flock($fp, LOCK_UN); fclose($fp);
            echo json_encode(["status" => "error", "message" => "Dịch vụ không tồn tại."]);
            exit;
        }
        $service = $db['services'][$serviceIdx];

        $pkgIdx = -1;
        foreach (($service['packages'] ?? []) as $i => $p) { if ($p['id'] === $packageId) { $pkgIdx = $i; break; } }
        if ($pkgIdx === -1) {
            flock($fp, LOCK_UN); fclose($fp);
            echo json_encode(["status" => "error", "message" => "Gói dịch vụ không tồn tại."]);
            exit;
        }
        $pkg = $service['packages'][$pkgIdx];

        // Gói CÓ kho key thật phải mua qua 'redeem_key' (cần mật khẩu + rút key thật).
        if (array_key_exists('keys', $pkg)) {
            flock($fp, LOCK_UN); fclose($fp);
            echo json_encode(["status" => "error", "message" => "Gói này cần xác nhận mật khẩu để nhận key. Vui lòng thử lại."]);
            exit;
        }

        $basePrice = floatval($pkg['price'] ?? 0);
        $originalPrice = $basePrice;
        $cfg = is_array($db['config'] ?? null) ? $db['config'] : [];

        // 1) Flash Sale toàn shop.
        $flashPercent = 0;
        $fs = is_array($cfg['flashSale'] ?? null) ? $cfg['flashSale'] : [];
        if (!empty($fs['enabled'])) {
            $fp_percent = floatval($fs['percent'] ?? 0);
            $endsOk = empty($fs['endsAt']) || strtotime((string)$fs['endsAt']) > time();
            if ($fp_percent > 0 && $endsOk) $flashPercent = $fp_percent;
        }
        // 1b) Sale RIÊNG theo sản phẩm/danh mục: so với Flash toàn shop lấy mức CAO HƠN
        // (không cộng dồn để tránh giảm chồng giảm).
        $isp = item_sale_percent($cfg, $serviceId, (string)($service['categoryId'] ?? ''));
        if ($isp > $flashPercent) $flashPercent = $isp;
        $price = $basePrice - floor($basePrice * $flashPercent / 100);

        // 2) Hạng VIP theo tổng chi tiêu.
        $vipPercent = 0;
        $tiers = is_array($cfg['vipTiers'] ?? null) ? $cfg['vipTiers'] : [];
        if (!empty($tiers)) {
            $uid = $db['users'][$userIdx]['userId'] ?? '';
            $spent = 0;
            foreach (($db['orders'] ?? []) as $o) { if (($o['userId'] ?? '') === $uid) $spent += floatval($o['price'] ?? 0); }
            foreach ($tiers as $t) {
                if (!is_array($t)) continue;
                if ($spent >= (floatval($t['minSpent'] ?? 0)) && floatval($t['discountPercent'] ?? 0) > $vipPercent) {
                    $vipPercent = floatval($t['discountPercent'] ?? 0);
                }
            }
        }
        // 2b) Chiết khấu CTV: cộng tác viên có % riêng (config.ctvDiscountPercent);
        // lấy mức CAO HƠN giữa VIP và CTV (không cộng dồn).
        if (($db['users'][$userIdx]['role'] ?? '') === 'ctv') {
            $ctvP = floatval($cfg['ctvDiscountPercent'] ?? 0);
            if ($ctvP > $vipPercent) $vipPercent = $ctvP;
        }
        // 2c) GIA HẠN: nếu admin CÓ đặt % gia hạn và đây đúng là trường hợp gia hạn, giá
        // tính THẲNG TỪ GIÁ GỐC của sản phẩm — KHÔNG cộng dồn với sale/VIP/CTV. Nhờ vậy
        // gia hạn lần nào giá cũng như nhau (không lấy giá đã giảm của lần trước để giảm
        // tiếp). Admin CHƯA đặt % gia hạn thì gia hạn = mua thường, không tự giảm.
        $renewP = renew_discount_percent($db, $cfg, (string)($db['users'][$userIdx]['userId'] ?? ''), $serviceId, (string)($pkg['name'] ?? ''));
        if ($renewP > 0) {
            $flashPercent = 0;
            $vipPercent = $renewP;
            $price = max(0, $basePrice - floor($basePrice * $renewP / 100));
        } else {
            $price = max(0, $price - floor($price * $vipPercent / 100));
        }

        // 3) Mã giảm giá (nếu khách nhập).
        $discountAmount = 0;
        $appliedCode = '';
        $matchedCodeIdx = -1;
        if ($discountCode !== '') {
            $matched = null;
            foreach (($cfg['discountCodes'] ?? []) as $ci => $dc) {
                if (!is_array($dc)) continue;
                if (($dc['enabled'] ?? true) === false) continue;
                if (strtoupper(trim((string)($dc['code'] ?? ''))) === $discountCode) { $matched = $dc; $matchedCodeIdx = $ci; break; }
            }
            $err = '';
            if ($matched === null) $err = "Mã giảm giá không đúng hoặc đã hết hiệu lực.";
            // Hết hạn = QUA HẾT NGÀY ghi trên mã (23:59:59) — thống nhất với danh sách admin
            // và bộ dọn tự động (trước đây chỗ này tính từ 0h sáng nên lệch nhau cả ngày).
            elseif (!empty($matched['expiresAt']) && strtotime((string)$matched['expiresAt']) + 86399 < time()) $err = "Mã giảm giá đã hết hạn sử dụng.";
            elseif ((intval($matched['maxUses'] ?? 0) > 0) && (intval($matched['usedCount'] ?? 0) >= intval($matched['maxUses'] ?? 0))) $err = "Mã giảm giá đã hết lượt sử dụng.";
            elseif ((intval($matched['minOrder'] ?? 0) > 0) && $price < intval($matched['minOrder'] ?? 0)) $err = "Đơn chưa đạt mức tối thiểu để dùng mã.";
            elseif (!empty($matched['categoryId']) && ($matched['categoryId'] !== ($service['categoryId'] ?? ''))) $err = "Mã giảm giá không áp dụng cho sản phẩm này.";
            // Giới hạn SỐ LẦN MỖI NGƯỜI (maxUsesPerUser): đếm số đơn của CHÍNH khách này đã
            // từng dùng đúng mã đó. Đạt giới hạn -> không cho dùng nữa. Để trống/0 = không hạn.
            if ($err === '' && intval($matched['maxUsesPerUser'] ?? 0) > 0) {
                $uidCur = (string)($db['users'][$userIdx]['userId'] ?? '');
                $usedByUser = 0;
                foreach (($db['orders'] ?? []) as $o) {
                    if (($o['userId'] ?? '') === $uidCur && strtoupper(trim((string)($o['discountCode'] ?? ''))) === $discountCode) $usedByUser++;
                }
                if ($usedByUser >= intval($matched['maxUsesPerUser'])) $err = "Bạn đã dùng mã này đủ số lần cho phép (" . intval($matched['maxUsesPerUser']) . " lần/người).";
            }
            // Giới hạn SỐ TÀI KHOẢN được dùng (maxUsers): đếm số tài khoản KHÁC NHAU đã từng
            // dùng mã. Nếu khách hiện tại chưa nằm trong nhóm đó VÀ đã đủ số tài khoản -> chặn.
            // (Khách đã từng dùng vẫn dùng tiếp được, tuỳ 'số lần/người'.) Để trống/0 = không hạn.
            if ($err === '' && intval($matched['maxUsers'] ?? 0) > 0) {
                $uidCur = (string)($db['users'][$userIdx]['userId'] ?? '');
                $usersUsed = []; $mePresent = false;
                foreach (($db['orders'] ?? []) as $o) {
                    if (strtoupper(trim((string)($o['discountCode'] ?? ''))) === $discountCode) {
                        $ouid = (string)($o['userId'] ?? '');
                        $usersUsed[$ouid] = true;
                        if ($ouid === $uidCur) $mePresent = true;
                    }
                }
                if (!$mePresent && count($usersUsed) >= intval($matched['maxUsers'])) $err = "Mã giảm giá chỉ dành cho " . intval($matched['maxUsers']) . " tài khoản (đã đủ số người dùng).";
            }
            if ($err !== '') {
                flock($fp, LOCK_UN); fclose($fp);
                echo json_encode(["status" => "error", "message" => $err]);
                exit;
            }
            $val = floatval($matched['value'] ?? 0);
            $discountAmount = (($matched['type'] ?? 'percent') === 'amount') ? floor($val) : floor($price * $val / 100);
            $discountAmount = max(0, min($discountAmount, $price));
            $appliedCode = $discountCode;
        }
        $price = $price - $discountAmount;

        $balance = floatval($db['users'][$userIdx]['balance'] ?? 0);
        if ($balance < $price) {
            flock($fp, LOCK_UN); fclose($fp);
            echo json_encode(["status" => "error", "message" => "Số dư không đủ. Vui lòng nạp thêm tiền."]);
            exit;
        }

        // GIAO ĐÚNG key admin đã nhập (client gửi lên từ kho, giữ nguyên chuỗi, KHÔNG
        // thêm đuôi). TUYỆT ĐỐI KHÔNG sinh key demo: nếu chưa có key thật thì TỪ CHỐI
        // (không trừ tiền) để không bao giờ giao key ảo cho khách.
        $providedKey = trim((string)($input['key'] ?? ''));
        if ($providedKey === '') {
            flock($fp, LOCK_UN); fclose($fp);
            echo json_encode(["status" => "error", "message" => "Gói này chưa có key trong kho. Vui lòng thêm key cho gói (hoặc liên hệ Admin) rồi mua lại."]);
            exit;
        }
        $key = $providedKey;
        // Đủ điều kiện -> trừ số dư trên máy chủ.
        $db['users'][$userIdx]['balance'] = $balance - $price;

        // Hệ điều hành khách chọn: ưu tiên tên thư mục con, rồi tới tên danh mục.
        $os = trim((string)($input['os'] ?? ''));
        if ($os === '') {
            $subId = $service['subcategoryId'] ?? '';
            foreach (($db['subcategories'] ?? []) as $sc) { if (($sc['id'] ?? '') === $subId && $subId !== '') { $os = $sc['name']; break; } }
            if ($os === '') foreach (($db['categories'] ?? []) as $c) { if (($c['id'] ?? '') === ($service['categoryId'] ?? '')) { $os = $c['name']; break; } }
        }

        if ($matchedCodeIdx >= 0) {
            $db['config']['discountCodes'][$matchedCodeIdx]['usedCount'] = (intval($db['config']['discountCodes'][$matchedCodeIdx]['usedCount'] ?? 0)) + 1;
        }
        $totalDiscount = $originalPrice - $price;
        $purchaseTs = time();
        $days = duration_days_from_name($pkg['name']);
        $order = [
            "id" => "DH" . time() . rand(100, 999), "userId" => $db['users'][$userIdx]['userId'],
            "serviceId" => $serviceId, "serviceName" => $service['name'], "packageName" => $pkg['name'],
            "os" => $os, "price" => $price, "originalPrice" => $originalPrice,
            "discountCode" => $appliedCode, "discountAmount" => $totalDiscount,
            "flashPercent" => $flashPercent, "vipPercent" => $vipPercent, "key" => $key,
            "date" => date("c", $purchaseTs), "purchaseDate" => date("c", $purchaseTs),
            "expiryDate" => $days === null ? null : date("c", $purchaseTs + $days * 86400)
        ];
        if (!isset($db['orders'])) $db['orders'] = [];
        array_unshift($db['orders'], $order);
        if (!isset($db['transactions'])) $db['transactions'] = [];
        $parts = [];
        if ($flashPercent > 0) $parts[] = "flash -{$flashPercent}%";
        if ($vipPercent > 0) $parts[] = ($renewP > 0 ? "gia hạn -{$vipPercent}%" : "VIP -{$vipPercent}%");
        if ($appliedCode !== '') $parts[] = "mã {$appliedCode}";
        $txDesc = count($parts) > 0
            ? "Mua {$service['name']} - {$pkg['name']} (" . implode(', ', $parts) . " · giảm " . number_format($totalDiscount) . "đ)"
            : "Mua {$service['name']} - {$pkg['name']}";
        array_unshift($db['transactions'], [
            "id" => "TX" . time() . rand(100, 999), "userId" => $db['users'][$userIdx]['userId'], "amount" => -$price,
            "type" => "purchase", "description" => $txDesc, "date" => date("c")
        ]);

        // Tự xoá mã giảm giá nếu đã dùng hết (sau khi đã cộng lượt & thêm đơn ở trên) + dọn
        // các mã đã HẾT HẠN.
        if ($matchedCodeIdx >= 0 && $appliedCode !== '') discount_maybe_autodelete($db, $matchedCodeIdx, $appliedCode);
        discount_sweep_expired($db);

        ftruncate($fp, 0);
        rewind($fp);
        fwrite($fp, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        fflush($fp);
        flock($fp, LOCK_UN);
        fclose($fp);

        archive_orders([$order]); // lưu đơn + key vào kho đơn hàng bền vững
        echo json_encode(["status" => "success", "order" => $order, "balance" => $db['users'][$userIdx]['balance']]);
        flush_response();
        tg_notify_order($db['users'][$userIdx]['username'] ?? $order['userId'], $service['name'], $pkg['name'], $price, null, $renewP > 0);
        break;

    case 'purchase_combo':
        // Mua combo: TRỪ SỐ DƯ 1 LẦN theo giá combo NGAY TRÊN MÁY CHỦ (atomic), phát key
        // + tạo đơn cho TỪNG sản phẩm trong combo. Persist bền vững như 'purchase'.
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $userId = (string)($input['userId'] ?? '');
        $username = trim((string)($input['username'] ?? ''));
        $token = (string)($input['token'] ?? '');
        $comboId = (string)($input['comboId'] ?? '');

        $fp = fopen($db_file, 'c+');
        if (!$fp || !flock($fp, LOCK_EX)) {
            echo json_encode(["status" => "error", "message" => "Không khóa được cơ sở dữ liệu, vui lòng thử lại."]);
            exit;
        }
        $raw = stream_get_contents($fp);
        $db = $raw ? (json_decode($raw, true) ?: []) : [];

        $userIdx = -1;
        foreach (($db['users'] ?? []) as $i => $u) {
            if ($userId !== '' && ($u['userId'] ?? '') === $userId) { $userIdx = $i; break; }
            if ($userId === '' && strtolower($u['username'] ?? '') === strtolower($username)) { $userIdx = $i; break; }
        }
        if ($userIdx === -1) {
            flock($fp, LOCK_UN); fclose($fp);
            echo json_encode(["status" => "error", "message" => "Không tìm thấy tài khoản. Vui lòng đăng nhập lại."]);
            exit;
        }
        if (!token_ok($db['users'][$userIdx], $token)) {
            flock($fp, LOCK_UN); fclose($fp);
            echo json_encode(["status" => "error", "message" => "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."]);
            exit;
        }
        if (!empty($db['config']['maintenanceMode']) && ($db['users'][$userIdx]['role'] ?? '') !== 'admin') {
            flock($fp, LOCK_UN); fclose($fp);
            echo json_encode(["status" => "error", "message" => "Shop đang bảo trì, vui lòng quay lại sau ít phút."]);
            exit;
        }
        if (($db['users'][$userIdx]['status'] ?? 'active') !== 'active') {
            flock($fp, LOCK_UN); fclose($fp);
            echo json_encode(["status" => "error", "message" => "Tài khoản đã bị khóa."]);
            exit;
        }

        $cfg = is_array($db['config'] ?? null) ? $db['config'] : [];
        $combo = null;
        foreach (($cfg['combos'] ?? []) as $c) { if (is_array($c) && ($c['id'] ?? '') === $comboId) { $combo = $c; break; } }
        if ($combo === null) {
            flock($fp, LOCK_UN); fclose($fp);
            echo json_encode(["status" => "error", "message" => "Không tìm thấy combo."]);
            exit;
        }

        // Ghép từng item -> service + package (giữ chỉ số để rút key thật khỏi kho nếu có).
        $resolved = [];
        foreach (($combo['items'] ?? []) as $it) {
            if (!is_array($it)) continue;
            $sid = (string)($it['serviceId'] ?? '');
            $pid = (string)($it['packageId'] ?? '');
            $si = -1;
            foreach (($db['services'] ?? []) as $i => $s) { if (($s['id'] ?? '') === $sid) { $si = $i; break; } }
            if ($si === -1) continue;
            $pi = -1;
            foreach (($db['services'][$si]['packages'] ?? []) as $j => $p) { if (($p['id'] ?? '') === $pid) { $pi = $j; break; } }
            if ($pi === -1) continue;
            $resolved[] = ['si' => $si, 'pi' => $pi, 'sid' => $sid, 'pid' => $pid];
        }
        // Key thật admin đã nhập (client gửi lên từ kho cục bộ) theo từng sản phẩm, để
        // giao ĐÚNG chuỗi key — không thêm đuôi — khi máy chủ chưa có kho key của gói.
        $itemKeys = is_array($input['itemKeys'] ?? null) ? $input['itemKeys'] : [];
        if (empty($resolved)) {
            flock($fp, LOCK_UN); fclose($fp);
            echo json_encode(["status" => "error", "message" => "Combo chưa có sản phẩm hợp lệ."]);
            exit;
        }

        $price = floatval($combo['price'] ?? 0);
        $balance = floatval($db['users'][$userIdx]['balance'] ?? 0);
        if ($balance < $price) {
            flock($fp, LOCK_UN); fclose($fp);
            echo json_encode(["status" => "error", "message" => "Số dư không đủ. Vui lòng nạp thêm tiền."]);
            exit;
        }

        // KIỂM TRA đủ key thật cho TỪNG sản phẩm TRƯỚC khi trừ tiền. KHÔNG sinh key demo:
        // nếu 1 sản phẩm trong combo chưa có key thì từ chối cả combo (không trừ tiền).
        foreach ($resolved as $r) {
            $pkg = $db['services'][$r['si']]['packages'][$r['pi']];
            $hasServerKey = array_key_exists('keys', $pkg) && !empty($pkg['keys']);
            $mapKey = $r['sid'] . '::' . $r['pid'];
            $provided = isset($itemKeys[$mapKey]) ? trim((string)$itemKeys[$mapKey]) : '';
            if (!$hasServerKey && $provided === '') {
                flock($fp, LOCK_UN); fclose($fp);
                echo json_encode(["status" => "error", "message" => "Một sản phẩm trong combo chưa có key trong kho. Vui lòng thêm key (hoặc liên hệ Admin) rồi mua lại."]);
                exit;
            }
        }
        $db['users'][$userIdx]['balance'] = $balance - $price;

        $uid = $db['users'][$userIdx]['userId'];
        $nowTs = time();
        $orders = [];
        $idx = 0;
        foreach ($resolved as $r) {
            $service = $db['services'][$r['si']];
            $pkg = $db['services'][$r['si']]['packages'][$r['pi']];
            // Rút đúng 1 key thật khỏi kho máy chủ (nếu gói có); nếu chưa có kho thì dùng
            // key thật client gửi lên (đã kiểm tra không rỗng ở trên). KHÔNG sinh key demo.
            $key = null;
            if (array_key_exists('keys', $pkg) && !empty($pkg['keys'])) {
                $keys = $pkg['keys'];
                $key = array_shift($keys);
                $db['services'][$r['si']]['packages'][$r['pi']]['keys'] = $keys;
            } else {
                $mapKey = $r['sid'] . '::' . $r['pid'];
                $key = trim((string)($itemKeys[$mapKey] ?? ''));
            }
            $os = '';
            $subId = $service['subcategoryId'] ?? '';
            foreach (($db['subcategories'] ?? []) as $sc) { if (($sc['id'] ?? '') === $subId && $subId !== '') { $os = $sc['name']; break; } }
            if ($os === '') foreach (($db['categories'] ?? []) as $c) { if (($c['id'] ?? '') === ($service['categoryId'] ?? '')) { $os = $c['name']; break; } }
            $days = duration_days_from_name($pkg['name']);
            $order = [
                "id" => "DH" . $nowTs . $idx . rand(100, 999), "userId" => $uid,
                "serviceId" => $service['id'], "serviceName" => $service['name'], "packageName" => $pkg['name'],
                "price" => 0, "comboId" => $combo['id'], "comboName" => $combo['name'] ?? '',
                "os" => $os, "key" => $key, "date" => date("c", $nowTs), "purchaseDate" => date("c", $nowTs),
                "expiryDate" => $days === null ? null : date("c", $nowTs + $days * 86400)
            ];
            if (!isset($db['orders'])) $db['orders'] = [];
            array_unshift($db['orders'], $order);
            $orders[] = $order;
            $idx++;
        }
        if (!isset($db['transactions'])) $db['transactions'] = [];
        array_unshift($db['transactions'], [
            "id" => "TX" . $nowTs . rand(100, 999), "userId" => $uid, "amount" => -$price,
            "type" => "purchase", "description" => "Mua combo \"" . ($combo['name'] ?? '') . "\" (" . count($orders) . " sản phẩm)",
            "date" => date("c")
        ]);

        ftruncate($fp, 0);
        rewind($fp);
        fwrite($fp, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        fflush($fp);
        flock($fp, LOCK_UN);
        fclose($fp);

        archive_orders($orders); // lưu tất cả đơn + key của combo vào kho đơn hàng bền vững
        echo json_encode(["status" => "success", "orders" => $orders, "balance" => $db['users'][$userIdx]['balance']]);
        break;

    case 'add_review':
        // Thêm/cập nhật đánh giá sản phẩm. Chỉ khách ĐÃ MUA sản phẩm mới được đánh giá.
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $serviceId = (string)($input['serviceId'] ?? '');
        $userId = (string)($input['userId'] ?? '');
        $username = trim((string)($input['username'] ?? ''));
        $rating = max(1, min(5, intval($input['rating'] ?? 0)));
        $text = trim((string)($input['text'] ?? ''));
        if ($serviceId === '' || $userId === '') {
            echo json_encode(["status" => "error", "message" => "Thiếu thông tin đánh giá."]);
            exit;
        }
        $fp = fopen($db_file, 'c+');
        if (!$fp || !flock($fp, LOCK_EX)) {
            echo json_encode(["status" => "error", "message" => "Không khóa được cơ sở dữ liệu, thử lại sau."]);
            exit;
        }
        $raw = stream_get_contents($fp);
        $db = $raw ? (json_decode($raw, true) ?: []) : [];
        // Xác minh đã mua
        $purchased = false;
        foreach (($db['orders'] ?? []) as $o) {
            if (($o['userId'] ?? '') === $userId && ($o['serviceId'] ?? '') === $serviceId) { $purchased = true; break; }
        }
        if (!$purchased) {
            flock($fp, LOCK_UN); fclose($fp);
            echo json_encode(["status" => "error", "message" => "Chỉ khách đã mua sản phẩm mới được đánh giá."]);
            exit;
        }
        if (!isset($db['reviews']) || !is_array($db['reviews'])) $db['reviews'] = [];
        $found = false;
        foreach ($db['reviews'] as &$rv) {
            if (($rv['serviceId'] ?? '') === $serviceId && ($rv['userId'] ?? '') === $userId) {
                $rv['rating'] = $rating; $rv['text'] = $text; $rv['date'] = date('c'); $found = true; break;
            }
        }
        unset($rv);
        if (!$found) {
            array_unshift($db['reviews'], [
                'id' => 'RV' . time() . rand(100, 999), 'serviceId' => $serviceId,
                'userId' => $userId, 'username' => $username, 'rating' => $rating, 'text' => $text, 'date' => date('c')
            ]);
        }
        ftruncate($fp, 0); rewind($fp);
        fwrite($fp, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        fflush($fp); flock($fp, LOCK_UN); fclose($fp);
        echo json_encode(["status" => "success"]);
        break;

    // ---- WEB PUSH ----
    // Khóa công khai VAPID cho trình duyệt đăng ký nhận thông báo đẩy.
    case 'push_public_key':
        $k = push_vapid_keys();
        if (!$k) { echo json_encode(["status" => "error", "message" => "Máy chủ thiếu OpenSSL — không dùng được thông báo đẩy."]); exit; }
        echo json_encode(["status" => "success", "publicKey" => $k['publicKey']]);
        break;

    // Trình duyệt khách gửi subscription lên để nhận thông báo đẩy.
    case 'push_subscribe':
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $sub = $input['subscription'] ?? null;
        $endpoint = is_array($sub) ? (string)($sub['endpoint'] ?? '') : '';
        if ($endpoint === '' || !preg_match('#^https://#', $endpoint)) { echo json_encode(["status" => "error", "message" => "Subscription không hợp lệ."]); exit; }
        $rlP = rate_limit_hit('push:' . client_ip(), 10, 600, 600);
        if (!$rlP['ok']) { echo json_encode(["status" => "error", "message" => "Thao tác quá nhanh."]); exit; }
        push_subs_update(function (&$subs) use ($sub, $endpoint) {
            $subs[md5($endpoint)] = ['endpoint' => $endpoint, 't' => time()];
        });
        echo json_encode(["status" => "success"]);
        break;

    case 'push_unsubscribe':
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $endpoint = (string)($input['endpoint'] ?? '');
        if ($endpoint !== '') push_subs_update(function (&$subs) use ($endpoint) { unset($subs[md5($endpoint)]); });
        echo json_encode(["status" => "success"]);
        break;

    // sw.js gọi khi nhận cú hích: trả thông báo MỚI NHẤT (công khai, không có gì nhạy cảm).
    case 'latest_announcement':
        $db = read_db($db_file);
        $list = (array)($db['config']['announcements'] ?? []);
        usort($list, function ($a, $b) { return strcmp((string)($b['date'] ?? ''), (string)($a['date'] ?? '')); });
        $latest = $list[0] ?? null;
        echo json_encode([
            "status" => "success",
            "title" => $latest ? (string)($latest['title'] ?? '') : '',
            "text" => $latest ? (string)($latest['text'] ?? '') : ''
        ], JSON_UNESCAPED_UNICODE);
        break;

    // ADMIN bấm gửi: đánh thức service worker của MỌI thiết bị đã đăng ký (cú hích rỗng,
    // sw tự tải thông báo mới nhất về hiện). Tự dọn thiết bị đã hủy (404/410).
    case 'push_send':
        $admin_user = $_SERVER['HTTP_X_ADMIN_USER'] ?? '';
        $admin_pass = $_SERVER['HTTP_X_ADMIN_PASS'] ?? '';
        $db = read_db($db_file);
        if (!admin_authenticated($db, $admin_user, $admin_pass)) { echo json_encode(["status" => "error", "message" => "Unauthorized"]); exit; }
        $k = push_vapid_keys();
        if (!$k) { echo json_encode(["status" => "error", "message" => "Máy chủ thiếu OpenSSL."]); exit; }
        $subsAll = @json_decode(@file_get_contents(__DIR__ . '/push_subs.json'), true);
        if (!is_array($subsAll) || !$subsAll) { echo json_encode(["status" => "success", "sent" => 0, "removed" => 0, "message" => "Chưa có khách nào bật thông báo đẩy."]); exit; }
        $sent = 0; $removed = []; $jwtByAud = [];
        $batch = array_slice($subsAll, 0, 300, true); // mỗi lần gửi tối đa 300 thiết bị
        foreach ($batch as $id => $s) {
            $endpoint = (string)($s['endpoint'] ?? '');
            if ($endpoint === '') { $removed[] = $id; continue; }
            $u = parse_url($endpoint);
            $aud = ($u['scheme'] ?? 'https') . '://' . ($u['host'] ?? '');
            if (!isset($jwtByAud[$aud])) $jwtByAud[$aud] = push_vapid_jwt($aud);
            $jwt = $jwtByAud[$aud];
            if (!$jwt) continue;
            $ch = curl_init($endpoint);
            curl_setopt_array($ch, [
                CURLOPT_POST => true, CURLOPT_POSTFIELDS => '', CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT => 6, CURLOPT_CONNECTTIMEOUT => 4,
                CURLOPT_HTTPHEADER => ['TTL: 86400', 'Content-Length: 0', 'Urgency: normal',
                    'Authorization: vapid t=' . $jwt . ', k=' . $k['publicKey']]
            ]);
            curl_exec($ch);
            $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            if ($code >= 200 && $code < 300) $sent++;
            elseif ($code === 404 || $code === 410) $removed[] = $id;
        }
        if ($removed) push_subs_update(function (&$subs) use ($removed) { foreach ($removed as $id) unset($subs[$id]); });
        echo json_encode(["status" => "success", "sent" => $sent, "removed" => count($removed), "total" => count($subsAll)]);
        break;

    // VÒNG QUAY MAY MẮN: máy chủ CHỌN GIẢI (theo tỉ lệ admin đặt) + cộng thưởng + đếm lượt
    // theo ngày — khách không thể gian lận vì mọi thứ quyết định ở máy chủ.
    case 'spin_wheel':
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $userId = (string)($input['userId'] ?? '');
        $token = (string)($input['token'] ?? '');
        $fp = fopen($db_file, 'c+');
        if (!$fp || !flock($fp, LOCK_EX)) { echo json_encode(["status" => "error", "message" => "Không khóa được CSDL."]); exit; }
        $raw = stream_get_contents($fp);
        $db = $raw ? (json_decode($raw, true) ?: []) : [];
        $lw = is_array($db['config']['luckyWheel'] ?? null) ? $db['config']['luckyWheel'] : [];
        $prizes = array_values(array_filter((array)($lw['prizes'] ?? []), function ($p) {
            return is_array($p) && trim((string)($p['label'] ?? '')) !== '' && floatval($p['weight'] ?? 0) > 0;
        }));
        if (empty($lw['enabled']) || count($prizes) < 2) {
            flock($fp, LOCK_UN); fclose($fp);
            echo json_encode(["status" => "error", "message" => "Vòng quay đang tắt."]); exit;
        }
        $ui = -1;
        foreach (($db['users'] ?? []) as $i => $u) { if (($u['userId'] ?? '') === $userId) { $ui = $i; break; } }
        if ($ui === -1 || !token_ok($db['users'][$ui], $token)) {
            flock($fp, LOCK_UN); fclose($fp);
            echo json_encode(["status" => "error", "message" => "Vui lòng đăng nhập lại."]); exit;
        }
        $perDay = max(1, intval($lw['spinsPerDay'] ?? 1));
        $today = date('Y-m-d');
        $wDate = (string)($db['users'][$ui]['wheelDate'] ?? '');
        $wCount = intval($db['users'][$ui]['wheelCount'] ?? 0);
        if ($wDate !== $today) { $wCount = 0; }
        if ($wCount >= $perDay) {
            flock($fp, LOCK_UN); fclose($fp);
            echo json_encode(["status" => "error", "message" => "Bạn đã hết lượt quay hôm nay — quay lại vào ngày mai nhé!"]); exit;
        }
        // Chọn giải theo TỈ LỆ (weight) — random ở máy chủ.
        $totalW = 0.0;
        foreach ($prizes as $p) $totalW += floatval($p['weight']);
        $r = random_int(0, 1000000) / 1000000 * $totalW;
        $idx = 0; $acc = 0.0;
        foreach ($prizes as $i => $p) { $acc += floatval($p['weight']); if ($r <= $acc) { $idx = $i; break; } }
        $prize = $prizes[$idx];
        $amount = ($prize['type'] ?? 'none') === 'balance' ? max(0, floor(floatval($prize['value'] ?? 0))) : 0;
        if ($amount > 0) {
            $db['users'][$ui]['balance'] = floatval($db['users'][$ui]['balance'] ?? 0) + $amount;
            if (!isset($db['transactions'])) $db['transactions'] = [];
            array_unshift($db['transactions'], [
                'id' => 'TXW' . time() . rand(100, 999), 'userId' => $userId, 'amount' => $amount,
                'type' => 'wheel', 'description' => 'Vòng quay may mắn: ' . (string)$prize['label'], 'date' => date('c')
            ]);
        }
        $db['users'][$ui]['wheelDate'] = $today;
        $db['users'][$ui]['wheelCount'] = $wCount + 1;
        ftruncate($fp, 0); rewind($fp);
        fwrite($fp, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        fflush($fp); flock($fp, LOCK_UN); fclose($fp);
        echo json_encode([
            "status" => "success", "prizeIndex" => $idx,
            "prize" => ["label" => (string)$prize['label'], "type" => (string)($prize['type'] ?? 'none'), "value" => $amount],
            "balance" => $db['users'][$ui]['balance'], "spinsLeft" => $perDay - ($wCount + 1)
        ], JSON_UNESCAPED_UNICODE);
        break;

    // TRANG CỘNG TÁC VIÊN: trả về dữ liệu CHỈ ĐỌC cho CTV theo đúng quyền admin đã bật —
    // tồn kho (số lượng key, KHÔNG lộ nội dung key), danh sách đơn (của khách mình giới
    // thiệu hoặc tất cả), và tổng doanh số. Xác thực bằng token phiên của chính CTV.
    case 'ctv_panel':
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $userId = (string)($input['userId'] ?? '');
        $token = (string)($input['token'] ?? '');
        $db = read_db($db_file);
        $ci = ctv_user_index($db, $userId, $token);
        if ($ci === -1) { echo json_encode(["status" => "error", "message" => "Bạn không có quyền Cộng tác viên hoặc phiên đã hết hạn."]); exit; }
        $cfg = is_array($db['config'] ?? null) ? $db['config'] : [];
        $isAdmin = (($db['users'][$ci]['role'] ?? '') === 'admin');
        $perms = ctv_perms($cfg);
        // Admin xem trang này thì thấy đủ mọi quyền.
        if ($isAdmin) foreach ($perms as $k => $v) $perms[$k] = true;

        // Bảng tồn kho: mỗi sản phẩm > gói > số key còn. Chỉ những gói có kho key thật.
        $stock = [];
        if ($perms['viewStock']) {
            foreach (($db['services'] ?? []) as $s) {
                $pkgs = [];
                foreach (($s['packages'] ?? []) as $p) {
                    if (!array_key_exists('keys', $p)) continue; // gói không dùng kho key thì bỏ
                    $pkgs[] = ["name" => (string)($p['name'] ?? ''), "price" => floatval($p['price'] ?? 0), "count" => count((array)($p['keys'] ?? []))];
                }
                if ($pkgs) $stock[] = ["service" => (string)($s['name'] ?? ''), "packages" => $pkgs];
            }
        }

        // Mã giới thiệu của CTV -> tập userId của khách do CTV này giới thiệu.
        $myRef = strtoupper(trim((string)($db['users'][$ci]['refCode'] ?? '')));
        $myReferredIds = [];
        if ($myRef !== '') {
            foreach (($db['users'] ?? []) as $u) {
                if (strtoupper(trim((string)($u['referredBy'] ?? ''))) === $myRef) $myReferredIds[(string)($u['userId'] ?? '')] = true;
            }
        }
        // Bản đồ userId -> tên để hiển thị (không lộ mật khẩu/email).
        $nameOf = [];
        foreach (($db['users'] ?? []) as $u) { $nameOf[(string)($u['userId'] ?? '')] = (string)($u['username'] ?? ''); }

        // Danh sách đơn theo quyền: xem TẤT CẢ hoặc chỉ đơn của khách mình giới thiệu.
        // KHÔNG trả nội dung key (bảo mật) — chỉ tên sản phẩm/gói/giá/ngày/khách.
        $showAll = $perms['viewOrdersAll'];
        $showOwn = $perms['viewOrdersOwn'] || $showAll;
        $orders = [];
        if ($showOwn) {
            foreach (($db['orders'] ?? []) as $o) {
                $ouid = (string)($o['userId'] ?? '');
                $mine = isset($myReferredIds[$ouid]);
                if (!$showAll && !$mine) continue;
                $orders[] = [
                    "id" => (string)($o['id'] ?? ''), "user" => $nameOf[$ouid] ?? $ouid,
                    "serviceName" => (string)($o['serviceName'] ?? ''), "packageName" => (string)($o['packageName'] ?? ''),
                    "price" => floatval($o['price'] ?? 0), "date" => (string)($o['date'] ?? $o['purchaseDate'] ?? ''),
                    "mine" => $mine, "refunded" => !empty($o['refunded'])
                ];
                if (count($orders) >= 300) break;
            }
        }

        // Doanh số: hôm nay / tháng này. "own" = đơn của khách mình giới thiệu; "all" nếu có quyền.
        $sales = null;
        if ($perms['viewSales']) {
            $now = time(); $tToday = strtotime(date('Y-m-d') . ' 00:00:00'); $tMonth = strtotime(date('Y-m-01') . ' 00:00:00');
            $agg = ["todayCount" => 0, "todayRevenue" => 0.0, "monthCount" => 0, "monthRevenue" => 0.0, "ownTotalCount" => 0, "ownTotalRevenue" => 0.0, "referredUsers" => count($myReferredIds)];
            foreach (($db['orders'] ?? []) as $o) {
                if (!empty($o['refunded'])) continue;
                $ouid = (string)($o['userId'] ?? '');
                $mine = isset($myReferredIds[$ouid]);
                if (!$showAll && !$mine) continue; // không có quyền xem all thì chỉ tính đơn của mình
                $price = floatval($o['price'] ?? 0);
                $t = strtotime((string)($o['date'] ?? $o['purchaseDate'] ?? ''));
                if ($mine) { $agg['ownTotalCount']++; $agg['ownTotalRevenue'] += $price; }
                if ($t !== false && $t >= $tToday) { $agg['todayCount']++; $agg['todayRevenue'] += $price; }
                if ($t !== false && $t >= $tMonth) { $agg['monthCount']++; $agg['monthRevenue'] += $price; }
            }
            $sales = $agg;
        }

        echo json_encode([
            "status" => "success", "perms" => $perms,
            "ctvName" => (string)($db['users'][$ci]['username'] ?? ''),
            "refCode" => $myRef, "ctvDiscountPercent" => floatval($cfg['ctvDiscountPercent'] ?? 0),
            "balance" => floatval($db['users'][$ci]['balance'] ?? 0),
            "stock" => $stock, "orders" => $orders, "sales" => $sales
        ], JSON_UNESCAPED_UNICODE);
        break;

    // CTV MUA/TẶNG KEY cho khách: CTV trả bằng số dư của MÌNH (theo giá CTV), key được giao
    // THẲNG vào tài khoản khách (tạo đơn cho khách). Nguyên tử bằng khóa file. Cần quyền
    // giftPurchase đang bật.
    case 'ctv_gift_key':
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $userId = (string)($input['userId'] ?? '');
        $token = (string)($input['token'] ?? '');
        $serviceId = (string)($input['serviceId'] ?? '');
        $packageId = (string)($input['packageId'] ?? '');
        $targetName = trim((string)($input['targetUsername'] ?? ''));
        $fp = fopen($db_file, 'c+');
        if (!$fp || !flock($fp, LOCK_EX)) { echo json_encode(["status" => "error", "message" => "Không khóa được CSDL, thử lại."]); exit; }
        $raw = stream_get_contents($fp);
        $db = $raw ? (json_decode($raw, true) ?: []) : [];
        $ci = ctv_user_index($db, $userId, $token);
        if ($ci === -1) { flock($fp, LOCK_UN); fclose($fp); echo json_encode(["status" => "error", "message" => "Bạn không có quyền Cộng tác viên hoặc phiên đã hết hạn."]); exit; }
        $cfg = is_array($db['config'] ?? null) ? $db['config'] : [];
        $isAdmin = (($db['users'][$ci]['role'] ?? '') === 'admin');
        $perms = ctv_perms($cfg);
        if (!$isAdmin && !$perms['giftPurchase']) { flock($fp, LOCK_UN); fclose($fp); echo json_encode(["status" => "error", "message" => "Quyền bán/tặng key của Cộng tác viên đang tắt."]); exit; }
        // Tìm khách nhận theo tên đăng nhập (không phân biệt hoa thường).
        $ti = -1;
        foreach (($db['users'] ?? []) as $i => $u) { if (strtolower((string)($u['username'] ?? '')) === strtolower($targetName)) { $ti = $i; break; } }
        if ($ti === -1) { flock($fp, LOCK_UN); fclose($fp); echo json_encode(["status" => "error", "message" => "Không tìm thấy tài khoản khách \"" . $targetName . "\"."]); exit; }
        if (($db['users'][$ti]['status'] ?? 'active') !== 'active') { flock($fp, LOCK_UN); fclose($fp); echo json_encode(["status" => "error", "message" => "Tài khoản khách đang bị khóa."]); exit; }
        // Tìm sản phẩm + gói.
        $serviceIdx = -1;
        foreach (($db['services'] ?? []) as $i => $s) { if (($s['id'] ?? '') === $serviceId) { $serviceIdx = $i; break; } }
        if ($serviceIdx === -1) { flock($fp, LOCK_UN); fclose($fp); echo json_encode(["status" => "error", "message" => "Sản phẩm không tồn tại."]); exit; }
        $service = $db['services'][$serviceIdx];
        $pkgIdx = -1;
        foreach (($service['packages'] ?? []) as $i => $p) { if (($p['id'] ?? '') === $packageId) { $pkgIdx = $i; break; } }
        if ($pkgIdx === -1) { flock($fp, LOCK_UN); fclose($fp); echo json_encode(["status" => "error", "message" => "Gói không tồn tại."]); exit; }
        $pkg = $service['packages'][$pkgIdx];
        if (!array_key_exists('keys', $pkg)) { flock($fp, LOCK_UN); fclose($fp); echo json_encode(["status" => "error", "message" => "Gói này không dùng kho key."]); exit; }
        // Giá CTV: LẤY GIÁ GỐC trừ % chiết khấu CTV (không cộng dồn sale/VIP/mã) — CTV luôn
        // mua đúng giá sỉ đã thoả thuận, dễ tính tiền bán lại.
        $basePrice = floatval($pkg['price'] ?? 0);
        $ctvP = floatval($cfg['ctvDiscountPercent'] ?? 0);
        $price = max(0, $basePrice - floor($basePrice * $ctvP / 100));
        $balance = floatval($db['users'][$ci]['balance'] ?? 0);
        if ($balance < $price) { flock($fp, LOCK_UN); fclose($fp); echo json_encode(["status" => "error", "message" => "Số dư của bạn không đủ (" . number_format($price) . "đ). Nạp thêm để bán tiếp."]); exit; }
        $keys = $pkg['keys'] ?? [];
        if (empty($keys)) { flock($fp, LOCK_UN); fclose($fp); echo json_encode(["status" => "error", "message" => "Gói này tạm hết key."]); exit; }
        $key = array_shift($keys);
        $db['services'][$serviceIdx]['packages'][$pkgIdx]['keys'] = $keys;
        $db['users'][$ci]['balance'] = $balance - $price; // TRỪ tiền CTV
        // Hệ điều hành: theo thư mục con rồi danh mục (như redeem_key).
        $os = '';
        $subId = $service['subcategoryId'] ?? '';
        foreach (($db['subcategories'] ?? []) as $sc) { if (($sc['id'] ?? '') === $subId && $subId !== '') { $os = $sc['name']; break; } }
        if ($os === '') foreach (($db['categories'] ?? []) as $c) { if (($c['id'] ?? '') === ($service['categoryId'] ?? '')) { $os = $c['name']; break; } }
        $purchaseTs = time();
        $days = duration_days_from_name($pkg['name']);
        // Đơn thuộc về KHÁCH (targetUser) — key vào tài khoản khách; ghi CTV đã bán hộ.
        $order = [
            "id" => "DH" . time() . rand(100, 999), "userId" => $db['users'][$ti]['userId'],
            "serviceId" => $serviceId, "serviceName" => $service['name'], "packageName" => $pkg['name'],
            "os" => $os, "price" => $price, "originalPrice" => $basePrice,
            "discountCode" => '', "discountAmount" => $basePrice - $price,
            "flashPercent" => 0, "vipPercent" => $ctvP, "key" => $key,
            "giftedByCtv" => (string)($db['users'][$ci]['username'] ?? ''),
            "date" => date("c", $purchaseTs), "purchaseDate" => date("c", $purchaseTs),
            "expiryDate" => $days === null ? null : date("c", $purchaseTs + $days * 86400)
        ];
        if (!isset($db['orders'])) $db['orders'] = [];
        array_unshift($db['orders'], $order);
        if (!isset($db['transactions'])) $db['transactions'] = [];
        // Giao dịch TRỪ tiền của CTV (không phải của khách).
        array_unshift($db['transactions'], [
            "id" => "TX" . time() . rand(100, 999), "userId" => $db['users'][$ci]['userId'], "amount" => -$price,
            "type" => "ctv_gift", "description" => "CTV bán/tặng key {$service['name']} - {$pkg['name']} cho {$targetName}", "date" => date("c")
        ]);
        ftruncate($fp, 0); rewind($fp);
        fwrite($fp, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        fflush($fp); flock($fp, LOCK_UN); fclose($fp);
        archive_orders([$order]);
        echo json_encode(["status" => "success", "order" => $order, "balance" => $db['users'][$ci]['balance'], "price" => $price], JSON_UNESCAPED_UNICODE);
        flush_response();
        key_log_add([['t' => date('c'), 'by' => (string)($db['users'][$ci]['username'] ?? ''), 'act' => 'sold',
            'sv' => (string)$service['name'], 'pkg' => (string)$pkg['name'], 'n' => 1, 'total' => count($keys)]]);
        if (function_exists('notify_telegram')) {
            notify_telegram("🤝 <b>CTV BÁN KEY</b>\n👤 CTV: " . ($db['users'][$ci]['username'] ?? '') . "\n🎁 Giao cho: {$targetName}\n📦 {$service['name']} - {$pkg['name']}\n💰 " . number_format($price) . "đ\n📦 Còn " . count($keys) . " key");
        }
        break;

    // LỊCH SỬ KHO KEY (admin xem): trả tối đa 200 dòng gần nhất từ key_log.json.
    case 'key_log':
        $admin_user = $_SERVER['HTTP_X_ADMIN_USER'] ?? '';
        $admin_pass = $_SERVER['HTTP_X_ADMIN_PASS'] ?? '';
        $db = read_db($db_file);
        if (!admin_authenticated($db, $admin_user, $admin_pass)) { echo json_encode(["status" => "error", "message" => "Unauthorized"]); exit; }
        $log = @json_decode(@file_get_contents(__DIR__ . '/key_log.json'), true);
        if (!is_array($log)) $log = [];
        echo json_encode(["status" => "success", "log" => array_slice($log, 0, 200)], JSON_UNESCAPED_UNICODE);
        break;

    // TRẢ LỜI đánh giá của khách: ghi adminReply vào đúng review theo id. Cho phép ADMIN
    // (mật khẩu) HOẶC Cộng tác viên (token phiên + quyền replyReviews đang bật).
    case 'reply_review':
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $admin_user = $_SERVER['HTTP_X_ADMIN_USER'] ?? '';
        $admin_pass = $_SERVER['HTTP_X_ADMIN_PASS'] ?? '';
        $ctvUserId = (string)($input['ctvUserId'] ?? '');
        $ctvToken = (string)($input['ctvToken'] ?? '');
        $reviewId = (string)($input['reviewId'] ?? '');
        $reply = trim((string)($input['reply'] ?? ''));
        if ($reviewId === '') { echo json_encode(["status" => "error", "message" => "Thiếu mã đánh giá."]); exit; }
        if (mb_strlen($reply) > 1000) $reply = mb_substr($reply, 0, 1000);
        $fp = fopen($db_file, 'c+');
        if (!$fp || !flock($fp, LOCK_EX)) { echo json_encode(["status" => "error", "message" => "Không khóa được CSDL."]); exit; }
        $raw = stream_get_contents($fp);
        $db = $raw ? (json_decode($raw, true) ?: []) : [];
        $okAdmin = ($admin_user !== '' && admin_authenticated($db, $admin_user, $admin_pass));
        $okCtv = false;
        if (!$okAdmin && $ctvUserId !== '') {
            $rci = ctv_user_index($db, $ctvUserId, $ctvToken);
            $rperms = ctv_perms(is_array($db['config'] ?? null) ? $db['config'] : []);
            $okCtv = ($rci !== -1 && (($db['users'][$rci]['role'] ?? '') === 'admin' || $rperms['replyReviews']));
        }
        if (!$okAdmin && !$okCtv) {
            flock($fp, LOCK_UN); fclose($fp);
            echo json_encode(["status" => "error", "message" => "Unauthorized"]); exit;
        }
        $done = false;
        foreach (($db['reviews'] ?? []) as $i => $rv) {
            if (($rv['id'] ?? '') === $reviewId) {
                // reply rỗng = XOÁ phản hồi.
                if ($reply === '') { unset($db['reviews'][$i]['adminReply'], $db['reviews'][$i]['adminReplyDate']); }
                else { $db['reviews'][$i]['adminReply'] = $reply; $db['reviews'][$i]['adminReplyDate'] = date('c'); }
                $done = true; break;
            }
        }
        if (!$done) { flock($fp, LOCK_UN); fclose($fp); echo json_encode(["status" => "error", "message" => "Không tìm thấy đánh giá."]); exit; }
        ftruncate($fp, 0); rewind($fp);
        fwrite($fp, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        fflush($fp); flock($fp, LOCK_UN); fclose($fp);
        echo json_encode(["status" => "success"]);
        break;

    case 'save_db':
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            echo json_encode(["status" => "error", "message" => "Invalid JSON payload"]);
            exit;
        }

        $admin_user = $_SERVER['HTTP_X_ADMIN_USER'] ?? ($_GET['admin_user'] ?? '');
        $admin_pass = $_SERVER['HTTP_X_ADMIN_PASS'] ?? ($_GET['admin_pass'] ?? '');

        $db = read_db($db_file);

        if (!admin_authenticated($db, $admin_user, $admin_pass)) {
            echo json_encode(["status" => "error", "message" => "Unauthorized: Admin credentials invalid"]);
            exit;
        }

        // Khóa API (_secrets) chỉ nằm trong secrets.php — không bao giờ lưu vào database.json.
        // File media (_uploads) khôi phục riêng qua action=restore_uploads — không nhét vào DB.
        unset($input['_secrets']);
        unset($input['_uploads']);

        // Gộp các mảng nhạy cảm về đồng thời (orders/transactions/tickets) để tránh mất dữ liệu
        // khi admin lưu cấu hình trong lúc có giao dịch mới phát sinh song song.
        foreach (['orders', 'transactions'] as $field) {
            if (!isset($db[$field]) || !is_array($db[$field])) continue;
            if (!isset($input[$field]) || !is_array($input[$field])) $input[$field] = [];
            $existingIds = array_column($input[$field], 'id');
            foreach ($db[$field] as $row) {
                if (!empty($row['id']) && !in_array($row['id'], $existingIds, true)) {
                    $input[$field][] = $row;
                }
            }
        }

        // Mật khẩu (băm) không còn được gửi ra trình duyệt qua get_db, nên khi admin
        // ghi đè lại toàn bộ users, giữ nguyên password cũ theo userId thay vì để trống.
        if (isset($db['users']) && is_array($db['users']) && isset($input['users']) && is_array($input['users'])) {
            $existingPasswords = []; $existingContacts = []; $existing2fa = [];
            foreach ($db['users'] as $u) {
                if (!empty($u['userId'])) {
                    $existingPasswords[$u['userId']] = $u['password'] ?? '';
                    $existingContacts[$u['userId']] = $u['contact'] ?? '';
                    $existing2fa[$u['userId']] = intval($u['admin2faOkUntil'] ?? 0);
                }
            }
            foreach ($input['users'] as $i => $u) {
                $uid = $u['userId'] ?? null;
                if ($uid && empty($u['password']) && isset($existingPasswords[$uid])) {
                    $input['users'][$i]['password'] = $existingPasswords[$uid];
                }
                if ($uid && empty($u['contact']) && !empty($existingContacts[$uid])) {
                    $input['users'][$i]['contact'] = $existingContacts[$uid];
                }
                // Dấu phiên 2FA không được gửi ra trình duyệt -> khi admin lưu lại users,
                // giữ nguyên phiên đang mở (không thì cứ lưu xong là bị hỏi mã lại).
                if ($uid && empty($u['admin2faOkUntil']) && !empty($existing2fa[$uid])) {
                    $input['users'][$i]['admin2faOkUntil'] = $existing2fa[$uid];
                }
            }
        }

        // Kho key thật (packages[].keys) chỉ được trình duyệt biết đầy đủ SAU KHI admin
        // bấm "Tải kho key đầy đủ" trong phiên đó. Nếu gói gửi lên KHÔNG có field `keys`
        // (client chưa từng tải), giữ nguyên kho key đang có trên máy chủ thay vì xóa mất.
        if (isset($db['services']) && is_array($db['services']) && isset($input['services']) && is_array($input['services'])) {
            $oldKeysByService = [];
            foreach ($db['services'] as $s) {
                if (empty($s['id'])) continue;
                foreach (($s['packages'] ?? []) as $p) {
                    if (!empty($p['id']) && array_key_exists('keys', $p)) {
                        $oldKeysByService[$s['id']][$p['id']] = $p['keys'];
                    }
                }
            }
            foreach ($input['services'] as $si => $s) {
                if (empty($s['id']) || !isset($s['packages']) || !is_array($s['packages'])) continue;
                foreach ($s['packages'] as $pi => $p) {
                    if (empty($p['id']) || array_key_exists('keys', $p)) continue;
                    if (isset($oldKeysByService[$s['id']][$p['id']])) {
                        $input['services'][$si]['packages'][$pi]['keys'] = $oldKeysByService[$s['id']][$p['id']];
                    }
                }
            }
            // LỊCH SỬ KHO KEY: ghi lại mỗi lần admin THÊM/BỚT key (so kho mới với kho cũ).
            $keyLogEntries = [];
            foreach ($input['services'] as $s) {
                if (empty($s['id'])) continue;
                foreach (($s['packages'] ?? []) as $p) {
                    if (empty($p['id']) || !array_key_exists('keys', $p) || !is_array($p['keys'])) continue;
                    $old = $oldKeysByService[$s['id']][$p['id']] ?? [];
                    $delta = count($p['keys']) - count(is_array($old) ? $old : []);
                    if ($delta !== 0) {
                        $keyLogEntries[] = [
                            't' => date('c'), 'by' => (string)$admin_user, 'act' => $delta > 0 ? 'add' : 'remove',
                            'sv' => (string)($s['name'] ?? $s['id']), 'pkg' => (string)($p['name'] ?? $p['id']),
                            'n' => abs($delta), 'total' => count($p['keys'])
                        ];
                    }
                }
            }
            if ($keyLogEntries) key_log_add($keyLogEntries);
        }

        if (write_db($db_file, $input)) {
            // TỰ ĐỘNG SAO LƯU: mỗi lần đồng bộ thành công, ghi ra database_backup.json.
            // File này KHÔNG bị ghi đè khi bạn upload code mới (không nằm trong bộ mã),
            // nên sau khi update hosting có thể bấm "Khôi phục" để lấy lại toàn bộ dữ liệu.
            // Ghi thẳng nội dung vừa lưu (không đọc lại file) để bản sao lưu luôn khớp.
            @file_put_contents(__DIR__ . '/database_backup.json', json_encode($input, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
            // Cộng dồn ĐƠN HÀNG KHÁCH vào kho đơn hàng bền vững: admin bấm "Đồng bộ" để
            // chuẩn bị up file mới -> mọi đơn + key hiện có được lưu lại, không bị mất.
            archive_orders($input['orders'] ?? []);
            echo json_encode(["status" => "success", "message" => "Database saved successfully"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to write database file"]);
        }
        break;

    // Admin cộng/trừ số dư 1 người dùng NGAY TRÊN MÁY CHỦ (bền vững, khách thấy liền).
    // ĐỔI VAI TRÒ người dùng (member/ctv/admin) — ghi THẲNG máy chủ ngay khi admin chọn,
    // không đi đường đồng bộ cả cục database nữa (trước đây chỉ lưu cục bộ nên "không nhận").
    case 'admin_set_role':
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $admin_user = $_SERVER['HTTP_X_ADMIN_USER'] ?? '';
        $admin_pass = $_SERVER['HTTP_X_ADMIN_PASS'] ?? '';
        $targetId = (string)($input['userId'] ?? '');
        $role = (string)($input['role'] ?? '');
        if (!in_array($role, ['member', 'ctv', 'admin'], true)) { echo json_encode(["status" => "error", "message" => "Vai trò không hợp lệ."]); exit; }
        $fp = fopen($db_file, 'c+');
        if (!$fp || !flock($fp, LOCK_EX)) { echo json_encode(["status" => "error", "message" => "Không khóa được CSDL."]); exit; }
        $raw = stream_get_contents($fp);
        $db = $raw ? (json_decode($raw, true) ?: []) : [];
        if (!admin_authenticated($db, $admin_user, $admin_pass)) {
            flock($fp, LOCK_UN); fclose($fp);
            echo json_encode(["status" => "error", "message" => "Unauthorized"]); exit;
        }
        $ti = -1;
        foreach (($db['users'] ?? []) as $i => $u) { if (($u['userId'] ?? '') === $targetId) { $ti = $i; break; } }
        if ($ti === -1) { flock($fp, LOCK_UN); fclose($fp); echo json_encode(["status" => "error", "message" => "Không tìm thấy người dùng."]); exit; }
        // Không cho hạ vai trò admin CUỐI CÙNG (tự khóa mình khỏi quản trị).
        if (($db['users'][$ti]['role'] ?? '') === 'admin' && $role !== 'admin') {
            $adminCount = 0;
            foreach ($db['users'] as $u) { if (($u['role'] ?? '') === 'admin') $adminCount++; }
            if ($adminCount <= 1) { flock($fp, LOCK_UN); fclose($fp); echo json_encode(["status" => "error", "message" => "Đây là admin cuối cùng — không thể hạ vai trò (shop sẽ mất quyền quản trị)."]); exit; }
        }
        $db['users'][$ti]['role'] = $role;
        ftruncate($fp, 0); rewind($fp);
        fwrite($fp, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        fflush($fp); flock($fp, LOCK_UN); fclose($fp);
        echo json_encode(["status" => "success", "role" => $role]);
        break;

    // KHÓA/MỞ tài khoản — cũng ghi thẳng máy chủ như đổi vai trò.
    case 'admin_set_status':
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $admin_user = $_SERVER['HTTP_X_ADMIN_USER'] ?? '';
        $admin_pass = $_SERVER['HTTP_X_ADMIN_PASS'] ?? '';
        $targetId = (string)($input['userId'] ?? '');
        $status = (string)($input['status'] ?? '');
        if (!in_array($status, ['active', 'locked'], true)) { echo json_encode(["status" => "error", "message" => "Trạng thái không hợp lệ."]); exit; }
        $fp = fopen($db_file, 'c+');
        if (!$fp || !flock($fp, LOCK_EX)) { echo json_encode(["status" => "error", "message" => "Không khóa được CSDL."]); exit; }
        $raw = stream_get_contents($fp);
        $db = $raw ? (json_decode($raw, true) ?: []) : [];
        if (!admin_authenticated($db, $admin_user, $admin_pass)) {
            flock($fp, LOCK_UN); fclose($fp);
            echo json_encode(["status" => "error", "message" => "Unauthorized"]); exit;
        }
        $ti = -1;
        foreach (($db['users'] ?? []) as $i => $u) { if (($u['userId'] ?? '') === $targetId) { $ti = $i; break; } }
        if ($ti === -1) { flock($fp, LOCK_UN); fclose($fp); echo json_encode(["status" => "error", "message" => "Không tìm thấy người dùng."]); exit; }
        if (($db['users'][$ti]['role'] ?? '') === 'admin' && $status === 'locked') {
            flock($fp, LOCK_UN); fclose($fp);
            echo json_encode(["status" => "error", "message" => "Không thể khóa tài khoản quản trị."]); exit;
        }
        $db['users'][$ti]['status'] = $status;
        ftruncate($fp, 0); rewind($fp);
        fwrite($fp, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        fflush($fp); flock($fp, LOCK_UN); fclose($fp);
        echo json_encode(["status" => "success", "userStatus" => $status]);
        break;

    case 'admin_adjust_balance':
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $admin_user = $_SERVER['HTTP_X_ADMIN_USER'] ?? ($_GET['admin_user'] ?? '');
        $admin_pass = $_SERVER['HTTP_X_ADMIN_PASS'] ?? ($_GET['admin_pass'] ?? '');
        $targetId = (string)($input['userId'] ?? '');
        $delta = floatval($input['delta'] ?? 0);
        if ($delta === 0.0) { echo json_encode(["status" => "error", "message" => "Số tiền không hợp lệ."]); exit; }
        $fp = fopen($db_file, 'c+');
        if (!$fp || !flock($fp, LOCK_EX)) {
            if ($fp) fclose($fp);
            echo json_encode(["status" => "error", "message" => "Không khóa được cơ sở dữ liệu, thử lại sau."]); exit;
        }
        $raw = stream_get_contents($fp);
        $db = $raw ? (json_decode($raw, true) ?: []) : [];
        if (!admin_authenticated($db, $admin_user, $admin_pass)) {
            flock($fp, LOCK_UN); fclose($fp);
            echo json_encode(["status" => "error", "message" => "Unauthorized"]); exit;
        }
        $uidx = -1;
        foreach (($db['users'] ?? []) as $i => $u) { if (($u['userId'] ?? '') === $targetId) { $uidx = $i; break; } }
        if ($uidx === -1) {
            flock($fp, LOCK_UN); fclose($fp);
            echo json_encode(["status" => "error", "message" => "Không tìm thấy người dùng."]); exit;
        }
        $newBal = max(0, floatval($db['users'][$uidx]['balance'] ?? 0) + $delta);
        $db['users'][$uidx]['balance'] = $newBal;
        if (!isset($db['transactions'])) $db['transactions'] = [];
        array_unshift($db['transactions'], [
            "id" => "TX" . time() . rand(100, 999), "userId" => $db['users'][$uidx]['userId'],
            "amount" => $delta, "type" => $delta >= 0 ? "deposit" : "adjust",
            "description" => $delta >= 0 ? "Admin cộng tiền" : "Admin trừ tiền", "date" => date("c")
        ]);
        ftruncate($fp, 0); rewind($fp);
        fwrite($fp, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        fflush($fp); flock($fp, LOCK_UN); fclose($fp);
        echo json_encode(["status" => "success", "balance" => $newBal]);
        break;

    // Admin HOÀN TIỀN 1 đơn hàng: cộng lại giá đơn vào số dư khách + đánh dấu đã hoàn
    // (chống hoàn 2 lần) — nguyên tử bằng khóa file.
    case 'admin_refund_order':
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $admin_user = $_SERVER['HTTP_X_ADMIN_USER'] ?? ($_GET['admin_user'] ?? '');
        $admin_pass = $_SERVER['HTTP_X_ADMIN_PASS'] ?? ($_GET['admin_pass'] ?? '');
        $orderId = (string)($input['orderId'] ?? '');
        $fp = fopen($db_file, 'c+');
        if (!$fp || !flock($fp, LOCK_EX)) {
            if ($fp) fclose($fp);
            echo json_encode(["status" => "error", "message" => "Không khóa được cơ sở dữ liệu, thử lại sau."]); exit;
        }
        $raw = stream_get_contents($fp);
        $db = $raw ? (json_decode($raw, true) ?: []) : [];
        if (!admin_authenticated($db, $admin_user, $admin_pass)) {
            flock($fp, LOCK_UN); fclose($fp);
            echo json_encode(["status" => "error", "message" => "Unauthorized"]); exit;
        }
        $oidx = -1;
        foreach (($db['orders'] ?? []) as $i => $o) { if (($o['id'] ?? '') === $orderId) { $oidx = $i; break; } }
        if ($oidx === -1) {
            flock($fp, LOCK_UN); fclose($fp);
            echo json_encode(["status" => "error", "message" => "Không tìm thấy đơn hàng."]); exit;
        }
        if (!empty($db['orders'][$oidx]['refunded'])) {
            flock($fp, LOCK_UN); fclose($fp);
            echo json_encode(["status" => "error", "message" => "Đơn này đã được hoàn tiền rồi."]); exit;
        }
        $price = floatval($db['orders'][$oidx]['price'] ?? 0);
        $ouid = (string)($db['orders'][$oidx]['userId'] ?? '');
        $uidx = -1;
        foreach (($db['users'] ?? []) as $i => $u) { if (($u['userId'] ?? '') === $ouid) { $uidx = $i; break; } }
        if ($uidx === -1) {
            flock($fp, LOCK_UN); fclose($fp);
            echo json_encode(["status" => "error", "message" => "Không tìm thấy tài khoản của đơn này."]); exit;
        }
        $db['orders'][$oidx]['refunded'] = true;
        $newBal = floatval($db['users'][$uidx]['balance'] ?? 0) + $price;
        $db['users'][$uidx]['balance'] = $newBal;
        if (!isset($db['transactions'])) $db['transactions'] = [];
        array_unshift($db['transactions'], [
            "id" => "TX" . time() . rand(100, 999), "userId" => $ouid,
            "amount" => $price, "type" => "refund",
            "description" => "Hoàn tiền đơn " . $orderId, "date" => date("c")
        ]);
        ftruncate($fp, 0); rewind($fp);
        fwrite($fp, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        fflush($fp); flock($fp, LOCK_UN); fclose($fp);
        echo json_encode(["status" => "success", "balance" => $newBal]);
        break;

    // Admin xóa 1 người dùng NGAY TRÊN MÁY CHỦ (không xóa được tài khoản admin).
    case 'admin_delete_user':
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $admin_user = $_SERVER['HTTP_X_ADMIN_USER'] ?? ($_GET['admin_user'] ?? '');
        $admin_pass = $_SERVER['HTTP_X_ADMIN_PASS'] ?? ($_GET['admin_pass'] ?? '');
        $targetId = (string)($input['userId'] ?? '');
        $fp = fopen($db_file, 'c+');
        if (!$fp || !flock($fp, LOCK_EX)) {
            if ($fp) fclose($fp);
            echo json_encode(["status" => "error", "message" => "Không khóa được cơ sở dữ liệu, thử lại sau."]); exit;
        }
        $raw = stream_get_contents($fp);
        $db = $raw ? (json_decode($raw, true) ?: []) : [];
        if (!admin_authenticated($db, $admin_user, $admin_pass)) {
            flock($fp, LOCK_UN); fclose($fp);
            echo json_encode(["status" => "error", "message" => "Unauthorized"]); exit;
        }
        $uidx = -1;
        foreach (($db['users'] ?? []) as $i => $u) { if (($u['userId'] ?? '') === $targetId) { $uidx = $i; break; } }
        if ($uidx === -1) {
            flock($fp, LOCK_UN); fclose($fp);
            echo json_encode(["status" => "error", "message" => "Không tìm thấy người dùng."]); exit;
        }
        if (($db['users'][$uidx]['role'] ?? '') === 'admin') {
            flock($fp, LOCK_UN); fclose($fp);
            echo json_encode(["status" => "error", "message" => "Không thể xóa tài khoản quản trị."]); exit;
        }
        array_splice($db['users'], $uidx, 1);
        ftruncate($fp, 0); rewind($fp);
        fwrite($fp, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        fflush($fp); flock($fp, LOCK_UN); fclose($fp);
        echo json_encode(["status" => "success"]);
        break;

    // Khách tự đổi ảnh đại diện của MÌNH (xác thực bằng userId của tài khoản đang đăng nhập).
    case 'update_avatar':
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $userId = (string)($input['userId'] ?? '');
        $token = (string)($input['token'] ?? '');
        $avatar = trim((string)($input['avatar'] ?? ''));
        if ($userId === '' || $avatar === '') {
            echo json_encode(["status" => "error", "message" => "Thiếu thông tin ảnh đại diện."]); exit;
        }
        if (mb_strlen($avatar) > 2000) {
            echo json_encode(["status" => "error", "message" => "Đường dẫn ảnh quá dài."]); exit;
        }
        $fp = fopen($db_file, 'c+');
        if (!$fp || !flock($fp, LOCK_EX)) {
            if ($fp) fclose($fp);
            echo json_encode(["status" => "error", "message" => "Không khóa được cơ sở dữ liệu, thử lại sau."]); exit;
        }
        $raw = stream_get_contents($fp);
        $db = $raw ? (json_decode($raw, true) ?: []) : [];
        $uidx = -1;
        foreach (($db['users'] ?? []) as $i => $u) { if (($u['userId'] ?? '') === $userId) { $uidx = $i; break; } }
        if ($uidx === -1) {
            flock($fp, LOCK_UN); fclose($fp);
            echo json_encode(["status" => "error", "message" => "Không tìm thấy tài khoản. Vui lòng đăng nhập lại."]); exit;
        }
        if (!token_ok($db['users'][$uidx], $token)) {
            flock($fp, LOCK_UN); fclose($fp);
            echo json_encode(["status" => "error", "message" => "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."]); exit;
        }
        $db['users'][$uidx]['avatar'] = $avatar;
        ftruncate($fp, 0); rewind($fp);
        fwrite($fp, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        fflush($fp); flock($fp, LOCK_UN); fclose($fp);
        echo json_encode(["status" => "success", "avatar" => $avatar]);
        break;

    // Khách NẠP THẺ CÀO qua card2k.net. Gửi thẻ lên cổng, ghi 1 yêu cầu "đang xử lý";
    // tiền được cộng khi cổng gọi callback (card.php) báo thẻ hợp lệ.
    case 'card_charge':
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $userId = (string)($input['userId'] ?? '');
        $token  = (string)($input['token'] ?? '');
        $telco  = strtoupper(trim((string)($input['telco'] ?? '')));
        $amount = intval($input['amount'] ?? 0);
        $serial = trim((string)($input['serial'] ?? ''));
        $code   = trim((string)($input['code'] ?? ''));

        $secrets = read_secrets();
        $partnerId  = trim((string)($secrets['cardPartnerId'] ?? ''));
        $partnerKey = trim((string)($secrets['cardPartnerKey'] ?? ''));
        if ($partnerId === '' || $partnerKey === '') {
            echo json_encode(["status" => "error", "message" => "Nạp thẻ cào chưa được cấu hình. Vui lòng liên hệ Admin."]); exit;
        }
        if ($userId === '' || $telco === '' || $amount <= 0 || $serial === '' || $code === '') {
            echo json_encode(["status" => "error", "message" => "Vui lòng chọn nhà mạng, mệnh giá và nhập đủ Serial + Mã thẻ."]); exit;
        }

        // Xác minh user tồn tại + mã phiên + tạo mã yêu cầu duy nhất.
        $db = read_db($db_file);
        $meUser = null;
        foreach (($db['users'] ?? []) as $u) { if (($u['userId'] ?? '') === $userId) { $meUser = $u; break; } }
        if (!$meUser) { echo json_encode(["status" => "error", "message" => "Không tìm thấy tài khoản. Vui lòng đăng nhập lại."]); exit; }
        if (!token_ok($meUser, $token)) { echo json_encode(["status" => "error", "message" => "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."]); exit; }

        // Chống spam thẻ: tối đa 5 lần gửi thẻ / phút / tài khoản. Gửi thẻ sai liên tục dễ bị
        // cổng card2k phạt/khoá đối tác, nên chặn ngay ở đây.
        $rlCard = rate_limit_hit('card:' . $userId, 5, 60, 120);
        if (!$rlCard['ok']) {
            echo json_encode(["status" => "error", "message" => "Bạn gửi thẻ quá nhanh. Vui lòng thử lại sau " . retry_human($rlCard['retry']) . "."]); exit;
        }

        $request_id = 'CARD' . $userId . time() . rand(1000, 9999);
        $sign = md5($partnerKey . $code . $serial); // chữ ký thesieure: md5(partner_key + code + serial)

        $post = http_build_query([
            'telco' => $telco, 'code' => $code, 'serial' => $serial, 'amount' => $amount,
            'request_id' => $request_id, 'partner_id' => $partnerId, 'sign' => $sign, 'command' => 'charging'
        ]);
        $ch = curl_init('https://card2k.net/chargingws/v2');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $post);
        curl_setopt($ch, CURLOPT_TIMEOUT, 20);
        $resp = curl_exec($ch);
        $curlErr = curl_error($ch);
        curl_close($ch);
        if ($resp === false) {
            echo json_encode(["status" => "error", "message" => "Không kết nối được cổng nạp thẻ: $curlErr"]); exit;
        }
        $res = json_decode($resp, true);
        $gwStatus = is_array($res) ? ($res['status'] ?? null) : null;

        // Ghi yêu cầu vào cardRequests (khóa file) để callback biết cộng cho ai, bao nhiêu.
        $fp = fopen($db_file, 'c+');
        if ($fp && flock($fp, LOCK_EX)) {
            $raw = stream_get_contents($fp);
            $db2 = $raw ? (json_decode($raw, true) ?: []) : [];
            if (!isset($db2['cardRequests']) || !is_array($db2['cardRequests'])) $db2['cardRequests'] = [];
            array_unshift($db2['cardRequests'], [
                'request_id' => $request_id, 'userId' => $userId, 'telco' => $telco,
                'declaredAmount' => $amount, 'status' => 'pending',
                'gatewayStatus' => $gwStatus, 'date' => date('c'),
                // Lưu code/serial để CHỦ ĐỘNG hỏi lại cổng trạng thái (không phụ thuộc callback).
                // database.json bị .htaccess chặn + get_db đã bỏ cardRequests nên không lộ ra ngoài.
                // Xoá đi sau khi thẻ xử lý xong (thành công/thất bại) ở card_status.
                'code' => $code, 'serial' => $serial
            ]);
            // Chỉ giữ 500 yêu cầu gần nhất cho gọn.
            if (count($db2['cardRequests']) > 500) $db2['cardRequests'] = array_slice($db2['cardRequests'], 0, 500);
            ftruncate($fp, 0); rewind($fp);
            fwrite($fp, json_encode($db2, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            fflush($fp); flock($fp, LOCK_UN);
        }
        if ($fp) fclose($fp);

        // status 99/100 = đã nhận, đang xử lý (chờ callback). Khác đi là lỗi thẻ ngay.
        if ($gwStatus === 99 || $gwStatus === 100 || $gwStatus === '99' || $gwStatus === '100') {
            echo json_encode(["status" => "success", "pending" => true, "message" => "Đã gửi thẻ, hệ thống đang kiểm tra. Số dư sẽ được cộng trong ít phút nếu thẻ hợp lệ."]);
        } elseif ($gwStatus === 1 || $gwStatus === '1' || $gwStatus === 2 || $gwStatus === '2') {
            echo json_encode(["status" => "success", "pending" => true, "message" => "Đã tiếp nhận thẻ. Số dư sẽ được cộng sau khi hệ thống xác nhận."]);
        } else {
            $msg = is_array($res) ? ($res['message'] ?? 'Thẻ không hợp lệ hoặc sai mệnh giá.') : 'Cổng nạp thẻ trả về dữ liệu không hợp lệ.';
            echo json_encode(["status" => "error", "message" => $msg]);
        }
        break;

    // Khách KIỂM TRA trạng thái các thẻ đã nạp. CHỦ ĐỘNG hỏi lại cổng (không chờ callback):
    // gửi lại request_id + code + serial lên card2k, nếu cổng báo success thì cộng tiền NGAY.
    case 'card_status':
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $userId = (string)($input['userId'] ?? '');
        $token = (string)($input['token'] ?? '');
        if ($userId === '') { echo json_encode(["status" => "error", "message" => "Thiếu tài khoản."]); exit; }
        $db = read_db($db_file);
        $meFound = false;
        foreach (($db['users'] ?? []) as $u) { if (($u['userId'] ?? '') === $userId) { $meFound = $u; break; } }
        if ($meFound && !token_ok($meFound, $token)) { echo json_encode(["status" => "error", "message" => "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."]); exit; }

        // 1) Gom các thẻ ĐANG XỬ LÝ gần đây của khách (còn code/serial) để hỏi lại cổng.
        $secrets = read_secrets();
        $partnerId  = trim((string)($secrets['cardPartnerId'] ?? ''));
        $partnerKey = trim((string)($secrets['cardPartnerKey'] ?? ''));
        $gatewayUrl = card_gateway_url($db['config'] ?? []);
        $toQuery = [];
        if ($partnerId !== '' && $partnerKey !== '') {
            foreach (($db['cardRequests'] ?? []) as $r) {
                if (($r['userId'] ?? '') !== $userId) continue;
                if (($r['status'] ?? 'pending') !== 'pending') continue;
                if (empty($r['code']) || empty($r['serial'])) continue;
                $ts = strtotime($r['date'] ?? '');
                if ($ts && $ts < time() - 3 * 86400) continue; // bỏ thẻ quá cũ (>3 ngày)
                $toQuery[] = $r;
                if (count($toQuery) >= 5) break;
            }
        }
        // 2) Hỏi cổng NGOÀI khóa file (curl chậm). Ghi lại kết quả theo request_id.
        $gwResult = [];
        foreach ($toQuery as $r) {
            $gwResult[$r['request_id']] = card_query_status($r, $partnerId, $partnerKey, $gatewayUrl);
        }
        // 3) Áp kết quả DƯỚI khóa file: success -> cộng tiền (chống trùng), failed -> đánh dấu.
        if ($gwResult) {
            $fp = fopen($db_file, 'c+');
            if ($fp && flock($fp, LOCK_EX)) {
                $raw = stream_get_contents($fp);
                $db = $raw ? (json_decode($raw, true) ?: []) : [];
                $cfgDisc = (isset($db['config']['cardDiscounts']) && is_array($db['config']['cardDiscounts'])) ? $db['config']['cardDiscounts'] : [];
                $cardDepositNotifs = [];
                foreach (($db['cardRequests'] ?? []) as $i => $r) {
                    $rid = $r['request_id'] ?? '';
                    if (!isset($gwResult[$rid])) continue;
                    $st = $gwResult[$rid]['status'];
                    if ($st === 1 || $st === 2) {
                        // Đã cộng trước đó chưa?
                        $done = ($r['status'] ?? '') === 'success';
                        foreach (($db['transactions'] ?? []) as $t) { if (($t['cardRef'] ?? '') === $rid) { $done = true; break; } }
                        if (!$done) {
                            $face = intval($gwResult[$rid]['value'] ?? 0); if ($face <= 0) $face = intval($r['declaredAmount'] ?? 0);
                            $credit = card_compute_credit($r['telco'] ?? '', $face, intval($gwResult[$rid]['amount'] ?? 0), $cfgDisc);
                            $uid = $r['userId'] ?? '';
                            foreach (($db['users'] ?? []) as $ui => $u) {
                                if (($u['userId'] ?? '') === $uid) {
                                    $db['users'][$ui]['balance'] = floatval($u['balance'] ?? 0) + $credit;
                                    if (!isset($db['transactions'])) $db['transactions'] = [];
                                    array_unshift($db['transactions'], [
                                        'id' => 'TX' . time() . rand(100, 999), 'userId' => $uid, 'type' => 'deposit',
                                        'amount' => $credit, 'date' => date('c'),
                                        'description' => "Nạp thẻ cào " . ($r['telco'] ?? '') . " (nhận " . number_format($credit) . "đ)",
                                        'cardRef' => $rid
                                    ]);
                                    $cardDepositNotifs[] = ['username' => $u['username'] ?? $uid, 'amount' => $credit, 'telco' => $r['telco'] ?? ''];
                                    break;
                                }
                            }
                            $db['cardRequests'][$i]['status'] = 'success';
                            $db['cardRequests'][$i]['realAmount'] = $credit;
                        }
                        unset($db['cardRequests'][$i]['code'], $db['cardRequests'][$i]['serial']);
                    } elseif ($st === 3) {
                        $db['cardRequests'][$i]['status'] = 'failed';
                        unset($db['cardRequests'][$i]['code'], $db['cardRequests'][$i]['serial']);
                    }
                }
                $db['cardRequests'] = array_values($db['cardRequests'] ?? []);
                ftruncate($fp, 0); rewind($fp);
                fwrite($fp, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
                fflush($fp); flock($fp, LOCK_UN);
            }
            if ($fp) fclose($fp);
            // Thông báo Telegram cho admin các thẻ vừa được duyệt & cộng tiền (ngoài khoá file).
            foreach (($cardDepositNotifs ?? []) as $n) {
                tg_notify_deposit($n['username'], $n['amount'], 'Thẻ ' . $n['telco']);
            }
        }

        // 4) Trả về số dư mới + danh sách thẻ + lịch sử nạp thành công (để hiện ngay, kể cả
        //    thẻ vừa được cộng trong lần kiểm tra này mà client chưa tải lại trang).
        $balance = null;
        foreach (($db['users'] ?? []) as $u) { if (($u['userId'] ?? '') === $userId) { $balance = $u['balance']; break; } }
        $mine = [];
        foreach (($db['cardRequests'] ?? []) as $r) {
            if (($r['userId'] ?? '') !== $userId) continue;
            $mine[] = [
                'telco' => $r['telco'] ?? '', 'declaredAmount' => $r['declaredAmount'] ?? 0,
                'status' => $r['status'] ?? 'pending', 'realAmount' => $r['realAmount'] ?? null,
                'date' => $r['date'] ?? ''
            ];
            if (count($mine) >= 10) break;
        }
        $deposits = [];
        foreach (($db['transactions'] ?? []) as $t) {
            if (($t['userId'] ?? '') !== $userId || ($t['type'] ?? '') !== 'deposit' || floatval($t['amount'] ?? 0) <= 0) continue;
            $deposits[] = ['amount' => $t['amount'], 'description' => $t['description'] ?? '', 'date' => $t['date'] ?? ''];
            if (count($deposits) >= 50) break;
        }
        echo json_encode(["status" => "success", "balance" => $balance, "requests" => $mine, "deposits" => $deposits]);
        break;

    // Admin xem danh sách yêu cầu NẠP THẺ CÀO của khách (mới nhất trước).
    case 'card_requests':
        $admin_user = $_SERVER['HTTP_X_ADMIN_USER'] ?? ($_GET['admin_user'] ?? '');
        $admin_pass = $_SERVER['HTTP_X_ADMIN_PASS'] ?? ($_GET['admin_pass'] ?? '');
        $db = read_db($db_file);
        if (!admin_authenticated($db, $admin_user, $admin_pass)) {
            echo json_encode(["status" => "error", "message" => "Unauthorized"]); exit;
        }
        $usersById = [];
        foreach (($db['users'] ?? []) as $u) { if (!empty($u['userId'])) $usersById[$u['userId']] = $u['username'] ?? ''; }
        $list = [];
        foreach (($db['cardRequests'] ?? []) as $r) {
            $list[] = [
                'requestId' => $r['request_id'] ?? '',
                'username' => $usersById[$r['userId'] ?? ''] ?? ('#' . ($r['userId'] ?? '')),
                'telco' => $r['telco'] ?? '', 'declaredAmount' => $r['declaredAmount'] ?? 0,
                'realAmount' => $r['realAmount'] ?? null, 'status' => $r['status'] ?? 'pending',
                'date' => $r['date'] ?? ''
            ];
            if (count($list) >= 100) break;
        }
        // Thống kê nhanh
        $sumSuccess = 0; $cntSuccess = 0; $cntPending = 0; $cntFailed = 0;
        foreach (($db['cardRequests'] ?? []) as $r) {
            $st = $r['status'] ?? 'pending';
            if ($st === 'success') { $cntSuccess++; $sumSuccess += floatval($r['realAmount'] ?? 0); }
            elseif ($st === 'failed') { $cntFailed++; }
            else { $cntPending++; }
        }
        echo json_encode(["status" => "success", "requests" => $list,
            "stats" => ["success" => $cntSuccess, "pending" => $cntPending, "failed" => $cntFailed, "sumSuccess" => $sumSuccess]]);
        break;

    // Admin DUYỆT TAY 1 thẻ đang chờ: dùng khi cổng đã báo success nhưng callback không về
    // được (VD sai chữ ký). Admin xem "Thực nhận" bên card2k rồi nhập số tiền cộng cho khách.
    case 'card_approve':
        $admin_user = $_SERVER['HTTP_X_ADMIN_USER'] ?? '';
        $admin_pass = $_SERVER['HTTP_X_ADMIN_PASS'] ?? '';
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $reqId  = (string)($input['requestId'] ?? '');
        $credit = intval($input['amount'] ?? 0);
        $dbAuth = read_db($db_file);
        if (!admin_authenticated($dbAuth, $admin_user, $admin_pass)) { echo json_encode(["status" => "error", "message" => "Unauthorized"]); exit; }
        if ($reqId === '' || $credit <= 0) { echo json_encode(["status" => "error", "message" => "Thiếu mã yêu cầu hoặc số tiền."]); exit; }
        $fp = fopen($db_file, 'c+');
        if (!$fp || !flock($fp, LOCK_EX)) { if ($fp) fclose($fp); echo json_encode(["status" => "error", "message" => "Không khóa được CSDL."]); exit; }
        $raw = stream_get_contents($fp);
        $db = $raw ? (json_decode($raw, true) ?: []) : [];
        $ri = -1;
        foreach (($db['cardRequests'] ?? []) as $i => $r) { if (($r['request_id'] ?? '') === $reqId) { $ri = $i; break; } }
        if ($ri === -1) { flock($fp, LOCK_UN); fclose($fp); echo json_encode(["status" => "error", "message" => "Không tìm thấy yêu cầu."]); exit; }
        // Chống cộng trùng.
        $dup = false;
        foreach (($db['transactions'] ?? []) as $t) { if (($t['cardRef'] ?? '') === $reqId) { $dup = true; break; } }
        if ($dup || ($db['cardRequests'][$ri]['status'] ?? '') === 'success') {
            flock($fp, LOCK_UN); fclose($fp);
            echo json_encode(["status" => "error", "message" => "Thẻ này đã được cộng tiền rồi."]); exit;
        }
        $uid = $db['cardRequests'][$ri]['userId'] ?? '';
        $uIdx = -1;
        foreach (($db['users'] ?? []) as $i => $u) { if (($u['userId'] ?? '') === $uid) { $uIdx = $i; break; } }
        if ($uIdx === -1) { flock($fp, LOCK_UN); fclose($fp); echo json_encode(["status" => "error", "message" => "Không tìm thấy tài khoản khách."]); exit; }
        $db['users'][$uIdx]['balance'] = floatval($db['users'][$uIdx]['balance'] ?? 0) + $credit;
        if (!isset($db['transactions'])) $db['transactions'] = [];
        $telco = $db['cardRequests'][$ri]['telco'] ?? '';
        array_unshift($db['transactions'], [
            'id' => 'TX' . time() . rand(100, 999), 'userId' => $uid, 'type' => 'deposit',
            'amount' => $credit, 'date' => date('c'),
            'description' => "Nạp thẻ cào $telco - duyệt tay (nhận " . number_format($credit) . "đ)",
            'cardRef' => $reqId
        ]);
        $db['cardRequests'][$ri]['status'] = 'success';
        $db['cardRequests'][$ri]['realAmount'] = $credit;
        ftruncate($fp, 0); rewind($fp);
        fwrite($fp, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        fflush($fp); flock($fp, LOCK_UN); fclose($fp);
        echo json_encode(["status" => "success", "balance" => $db['users'][$uIdx]['balance']]);
        break;

    // Admin xem log callback nạp thẻ (chẩn đoán vì sao cổng success mà web vẫn chờ).
    case 'card_log':
        $admin_user = $_SERVER['HTTP_X_ADMIN_USER'] ?? ($_GET['admin_user'] ?? '');
        $admin_pass = $_SERVER['HTTP_X_ADMIN_PASS'] ?? ($_GET['admin_pass'] ?? '');
        $db = read_db($db_file);
        if (!admin_authenticated($db, $admin_user, $admin_pass)) { echo json_encode(["status" => "error", "message" => "Unauthorized"]); exit; }
        $tailFile = function ($path, $n) {
            if (!file_exists($path)) return null;
            $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            return implode("\n", array_slice($lines, -$n));
        };
        $cb = $tailFile(__DIR__ . '/card_callback_log.txt', 40);
        $qr = $tailFile(__DIR__ . '/card_query_log.txt', 25);
        $parts = [];
        $parts[] = "===== CALLBACK (card2k gọi về card.php) =====\n" .
            ($cb !== null ? $cb : "(Chưa có callback nào. Nghĩa là card2k CHƯA gọi về card.php —\nkiểm tra Callback URL bên card2k đúng https://<tên-miền>/card.php và thử nạp 1 thẻ.)");
        $parts[] = "\n===== KIỂM TRA CHỦ ĐỘNG (web hỏi lại cổng) =====\n" .
            ($qr !== null ? $qr : "(Chưa có lần hỏi lại nào được ghi.)");
        echo json_encode(["status" => "success", "log" => implode("\n", $parts)]);
        break;

    // Admin xem NHẬT KÝ NẠP VIETQR TỰ ĐỘNG: ThueAPIBank trả về gì, giao dịch nào khớp/
    // không khớp + lý do. Có ?force=1 để BUỘC quét ngay 1 lần (bỏ qua giới hạn nhịp) rồi
    // trả log mới nhất — dùng khi khách báo "đã chuyển mà chưa cộng" để chẩn đoán tại chỗ.
    case 'bank_poll_log':
        $admin_user = $_SERVER['HTTP_X_ADMIN_USER'] ?? ($_GET['admin_user'] ?? '');
        $admin_pass = $_SERVER['HTTP_X_ADMIN_PASS'] ?? ($_GET['admin_pass'] ?? '');
        $db = read_db($db_file);
        if (!admin_authenticated($db, $admin_user, $admin_pass)) { echo json_encode(["status" => "error", "message" => "Unauthorized"]); exit; }
        $forced = null;
        if (!empty($_GET['force'])) {
            $r = bank_pull_credit($db_file); // quét ngay, ghi vào log
            $forced = empty($r['ok'])
                ? ('Quét ngay: LỖI — ' . ($r['message'] ?? '?'))
                : ('Quét ngay: đã cộng ' . ($r['processed'] ?? 0) . ' giao dịch.');
        }
        $logTxt = @file_get_contents(__DIR__ . '/bank_poll_log.txt');
        if ($logTxt === false || $logTxt === '') {
            $logTxt = "(Chưa có lần quét nào được ghi. Nếu đã cấu hình token ThueAPIBank, hãy bấm \"Quét ngay\" hoặc để khách vào web để hệ thống tự quét.)";
        } else {
            $lines = explode("\n", rtrim($logTxt, "\n"));
            $logTxt = implode("\n", array_slice($lines, -120)); // 120 dòng cuối
        }
        $sec = read_secrets();
        $hasToken = trim((string)($sec['bankToken'] ?? '')) !== '';
        echo json_encode([
            "status" => "success",
            "hasToken" => $hasToken,
            "forced" => $forced,
            "log" => ($hasToken ? '' : "⚠️ CHƯA cấu hình token ThueAPIBank trong Cấu hình — nạp tự động sẽ KHÔNG chạy.\n\n") . $logTxt
        ], JSON_UNESCAPED_UNICODE);
        break;

    // Tạo bản sao lưu thủ công trên máy chủ (chép database.json -> database_backup.json).
    case 'backup_db':
        $admin_user = $_SERVER['HTTP_X_ADMIN_USER'] ?? ($_GET['admin_user'] ?? '');
        $admin_pass = $_SERVER['HTTP_X_ADMIN_PASS'] ?? ($_GET['admin_pass'] ?? '');
        $db = read_db($db_file);
        if (!admin_authenticated($db, $admin_user, $admin_pass)) {
            echo json_encode(["status" => "error", "message" => "Unauthorized"]); exit;
        }
        if (!file_exists($db_file)) { echo json_encode(["status" => "error", "message" => "Chưa có dữ liệu để sao lưu."]); exit; }
        // Đọc database.json dưới khóa chia sẻ để không chép trúng lúc đơn mua đang ghi dở.
        $fp = fopen($db_file, 'r');
        if (!$fp || !flock($fp, LOCK_SH)) {
            if ($fp) fclose($fp);
            echo json_encode(["status" => "error", "message" => "Không đọc được cơ sở dữ liệu, thử lại sau."]); exit;
        }
        $content = stream_get_contents($fp);
        flock($fp, LOCK_UN); fclose($fp);
        // Chỉ sao lưu khi dữ liệu là JSON hợp lệ (tránh tạo bản backup hỏng).
        $chk = json_decode($content, true);
        if (!is_array($chk) || !isset($chk['config'])) {
            echo json_encode(["status" => "error", "message" => "Dữ liệu hiện tại không hợp lệ, chưa thể sao lưu."]); exit;
        }
        if (file_put_contents(__DIR__ . '/database_backup.json', $content, LOCK_EX) !== false) {
            echo json_encode(["status" => "success", "time" => date('c'), "size" => strlen($content)]);
        } else {
            echo json_encode(["status" => "error", "message" => "Không tạo được bản sao lưu (kiểm tra quyền ghi thư mục)."]);
        }
        break;

    // Khôi phục: chép database_backup.json -> database.json.
    case 'restore_db':
        $admin_user = $_SERVER['HTTP_X_ADMIN_USER'] ?? ($_GET['admin_user'] ?? '');
        $admin_pass = $_SERVER['HTTP_X_ADMIN_PASS'] ?? ($_GET['admin_pass'] ?? '');
        $db = read_db($db_file);
        if (!admin_authenticated($db, $admin_user, $admin_pass)) {
            echo json_encode(["status" => "error", "message" => "Unauthorized"]); exit;
        }
        $backup = __DIR__ . '/database_backup.json';
        if (!file_exists($backup)) { echo json_encode(["status" => "error", "message" => "Chưa có bản sao lưu nào trên máy chủ."]); exit; }
        // Kiểm tra bản sao lưu là JSON hợp lệ trước khi ghi đè.
        $bkContent = file_get_contents($backup);
        $bk = json_decode($bkContent, true);
        if (!is_array($bk) || !isset($bk['config'])) { echo json_encode(["status" => "error", "message" => "Bản sao lưu hỏng hoặc không hợp lệ."]); exit; }
        $bkTime = filemtime($backup);
        // Ghi đè database.json dưới khóa độc quyền để không đụng đơn mua đang ghi song song.
        $fp = fopen($db_file, 'c+');
        if (!$fp || !flock($fp, LOCK_EX)) {
            if ($fp) fclose($fp);
            echo json_encode(["status" => "error", "message" => "Không khóa được cơ sở dữ liệu, thử lại sau."]); exit;
        }
        ftruncate($fp, 0); rewind($fp);
        $ok = fwrite($fp, $bkContent) !== false;
        fflush($fp); flock($fp, LOCK_UN); fclose($fp);
        if ($ok) {
            echo json_encode(["status" => "success", "time" => date('c', $bkTime)]);
        } else {
            echo json_encode(["status" => "error", "message" => "Không khôi phục được (kiểm tra quyền ghi)."]);
        }
        break;

    // Thông tin bản sao lưu hiện có trên máy chủ (có/không, thời gian, dung lượng).
    case 'backup_info':
        $admin_user = $_SERVER['HTTP_X_ADMIN_USER'] ?? ($_GET['admin_user'] ?? '');
        $admin_pass = $_SERVER['HTTP_X_ADMIN_PASS'] ?? ($_GET['admin_pass'] ?? '');
        $db = read_db($db_file);
        if (!admin_authenticated($db, $admin_user, $admin_pass)) {
            echo json_encode(["status" => "error", "message" => "Unauthorized"]); exit;
        }
        $backup = __DIR__ . '/database_backup.json';
        if (file_exists($backup)) {
            echo json_encode(["status" => "success", "exists" => true, "time" => date('c', filemtime($backup)), "size" => filesize($backup)]);
        } else {
            echo json_encode(["status" => "success", "exists" => false]);
        }
        break;

    // KIỂM TRA SỨC KHỎE HỆ THỐNG (admin, CHỈ ĐỌC — không đổi gì): tự chẩn đoán các cấu
    // hình/quyền hay gây lỗi (quyền ghi, secrets, Telegram, callback thẻ, sao lưu...)
    // để admin bấm 1 nút là thấy ngay chỗ hỏng thay vì mò log.
    case 'health_check':
        $admin_user = $_SERVER['HTTP_X_ADMIN_USER'] ?? ($_GET['admin_user'] ?? '');
        $admin_pass = $_SERVER['HTTP_X_ADMIN_PASS'] ?? ($_GET['admin_pass'] ?? '');
        $db = read_db($db_file);
        if (!admin_authenticated($db, $admin_user, $admin_pass)) {
            echo json_encode(["status" => "error", "message" => "Unauthorized"]); exit;
        }
        $secrets = read_secrets();
        $checks = [];
        $add = function ($key, $label, $ok, $note = '') use (&$checks) {
            $checks[] = ['key' => $key, 'label' => $label, 'ok' => (bool)$ok, 'note' => $note];
        };

        // 1) Quyền ghi thư mục + database.json (mọi tính năng lưu đều cần).
        $probe = __DIR__ . '/.__health_probe.tmp';
        $dirWritable = (@file_put_contents($probe, 'x') !== false); @unlink($probe);
        $add('dir_write', 'Quyền ghi thư mục web', $dirWritable, $dirWritable ? '' : 'PHP không ghi được file — chỉnh quyền (CHMOD 755/775) thư mục trên hosting.');
        $dbWritable = file_exists($db_file) && is_writable($db_file);
        $add('db_write', 'Ghi được database.json', $dbWritable, $dbWritable ? 'Kích thước ' . number_format(filesize($db_file)) . ' byte' : 'Không ghi được — mua hàng/nạp tiền sẽ lỗi.');

        // 2) Secrets đã nhập chưa (chỉ báo CÓ/CHƯA, không lộ giá trị).
        $add('card_secret', 'Nạp thẻ cào (Partner ID + Key card2k)',
            trim((string)($secrets['cardPartnerId'] ?? '')) !== '' && trim((string)($secrets['cardPartnerKey'] ?? '')) !== '',
            'Nhập trong tab Cấu hình → Nạp thẻ cào.');
        $add('bank_secret', 'Nạp VietQR tự động (Bank token)',
            trim((string)($secrets['bankToken'] ?? '')) !== '', 'Nhập trong tab Cấu hình → Ngân hàng.');
        $add('telegram_secret', 'Thông báo Telegram (bot token + chat id)',
            trim((string)($secrets['telegramBotToken'] ?? '')) !== '' && trim((string)($secrets['telegramChatId'] ?? '')) !== '',
            'Nhập trong tab Cấu hình → Telegram (nút "Gửi thử" để kiểm chứng).');

        // 3) Callback thẻ cào có nhận được không (bằng chứng card2k gọi về thành công).
        $cbLog = __DIR__ . '/card_callback_log.txt';
        $cbTime = file_exists($cbLog) ? filemtime($cbLog) : 0;
        $add('card_callback', 'Callback thẻ cào từ card2k', $cbTime > 0,
            $cbTime > 0 ? 'Lần cuối: ' . date('d/m/Y H:i', $cbTime) : 'Chưa từng nhận callback — kiểm tra Callback URL bên card2k = https://<tên-miền>/card.php');

        // 4) Sao lưu: bản thủ công + bản tự động gần nhất.
        $manual = __DIR__ . '/database_backup.json';
        $autoFiles = glob(__DIR__ . '/auto_backup_????-??-??.json') ?: [];
        sort($autoFiles);
        $latestAuto = $autoFiles ? basename(end($autoFiles)) : '';
        $add('backup_manual', 'Bản sao lưu thủ công', file_exists($manual),
            file_exists($manual) ? 'Lúc ' . date('d/m/Y H:i', filemtime($manual)) : 'Bấm "Sao lưu ngay" trong tab Sao lưu.');
        $add('backup_auto', 'Sao lưu TỰ ĐỘNG + gửi Telegram 12h trưa (giữ ' . count($autoFiles) . '/7 bản)', !empty($autoFiles),
            $latestAuto !== '' ? 'Mới nhất: ' . $latestAuto : 'Tự tạo & gửi Telegram khi có khách vào web từ 12h trưa (giờ VN).');

        // 5) Kho đơn hàng bền vững (chống mất đơn khi up đè database.json).
        $af = orders_archive_file();
        $afOk = file_exists($af);
        $afCount = 0;
        if ($afOk) { $arr = json_decode(@file_get_contents($af), true); $afCount = is_array($arr) ? count($arr) : 0; }
        $add('orders_archive', 'Kho đơn hàng bền vững', $afOk, $afOk ? "Đang giữ {$afCount} đơn" : 'Sẽ tự tạo khi có đơn hàng đầu tiên.');

        // 6) Thư mục uploads (media) ghi được không.
        $upDir = __DIR__ . '/uploads';
        $add('uploads', 'Thư mục uploads (ảnh/video/file tải lên)', is_dir($upDir) ? is_writable($upDir) : $dirWritable,
            is_dir($upDir) ? '' : 'Chưa có — sẽ tự tạo khi tải file đầu tiên.');

        // 7) Số liệu nhanh + môi trường PHP.
        $add('php', 'PHP ' . PHP_VERSION . ' + cURL', function_exists('curl_init'),
            function_exists('curl_init') ? '' : 'Thiếu cURL — nạp thẻ/Telegram/ngân hàng sẽ lỗi. Bật extension curl trên hosting.');
        $okCount = count(array_filter($checks, function ($c) {return $c['ok'];}));
        echo json_encode([
            "status" => "success", "time" => date('c'),
            "summary" => $okCount . '/' . count($checks),
            "users" => is_array($db['users'] ?? null) ? count($db['users']) : 0,
            "orders" => is_array($db['orders'] ?? null) ? count($db['orders']) : 0,
            "checks" => $checks
        ], JSON_UNESCAPED_UNICODE);
        break;

    // Thông tin kho đơn hàng bền vững (số đơn đang lưu, thời gian cập nhật).
    case 'orders_archive_info':
        $admin_user = $_SERVER['HTTP_X_ADMIN_USER'] ?? ($_GET['admin_user'] ?? '');
        $admin_pass = $_SERVER['HTTP_X_ADMIN_PASS'] ?? ($_GET['admin_pass'] ?? '');
        $db = read_db($db_file);
        if (!admin_authenticated($db, $admin_user, $admin_pass)) {
            echo json_encode(["status" => "error", "message" => "Unauthorized"]); exit;
        }
        $af = orders_archive_file();
        if (file_exists($af)) {
            $arr = json_decode(file_get_contents($af), true);
            $count = is_array($arr) ? count($arr) : 0;
            echo json_encode(["status" => "success", "exists" => true, "count" => $count, "time" => date('c', filemtime($af)), "size" => filesize($af)]);
        } else {
            echo json_encode(["status" => "success", "exists" => false, "count" => 0]);
        }
        break;

    // Phục hồi đơn hàng khách từ kho đơn hàng bền vững vào database.json (chỉ thêm đơn
    // còn thiếu của user còn tồn tại) — không đụng tới sản phẩm/cấu hình.
    case 'recover_orders':
        $admin_user = $_SERVER['HTTP_X_ADMIN_USER'] ?? ($_GET['admin_user'] ?? '');
        $admin_pass = $_SERVER['HTTP_X_ADMIN_PASS'] ?? ($_GET['admin_pass'] ?? '');
        $db0 = read_db($db_file);
        if (!admin_authenticated($db0, $admin_user, $admin_pass)) {
            echo json_encode(["status" => "error", "message" => "Unauthorized"]); exit;
        }
        if (!file_exists(orders_archive_file())) {
            echo json_encode(["status" => "success", "recovered" => 0, "message" => "Chưa có kho đơn hàng nào."]); exit;
        }
        $fp = fopen($db_file, 'c+');
        if (!$fp || !flock($fp, LOCK_EX)) {
            if ($fp) fclose($fp);
            echo json_encode(["status" => "error", "message" => "Không khóa được cơ sở dữ liệu, thử lại sau."]); exit;
        }
        $raw = stream_get_contents($fp);
        $live = $raw ? (json_decode($raw, true) ?: []) : [];
        $recovered = recover_orders_into($live);
        if ($recovered > 0) {
            ftruncate($fp, 0); rewind($fp);
            fwrite($fp, json_encode($live, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            fflush($fp);
        }
        flock($fp, LOCK_UN); fclose($fp);
        echo json_encode(["status" => "success", "recovered" => $recovered]);
        break;

    // Tải toàn bộ dữ liệu thô (kèm mật khẩu băm & kho key) để admin lưu 1 bản về MÁY.
    case 'export_db':
        $admin_user = $_SERVER['HTTP_X_ADMIN_USER'] ?? ($_GET['admin_user'] ?? '');
        $admin_pass = $_SERVER['HTTP_X_ADMIN_PASS'] ?? ($_GET['admin_pass'] ?? '');
        $db = read_db($db_file);
        if (!admin_authenticated($db, $admin_user, $admin_pass)) {
            echo json_encode(["status" => "error", "message" => "Unauthorized"]); exit;
        }
        // Gói kèm khóa API vào bản sao lưu (chỉ admin tải được) để khôi phục là ĐỦ toàn bộ
        // cấu hình: token ngân hàng tự động, Partner ID/Key nạp thẻ, Telegram, TTS.
        $sec = read_secrets();
        $db['_secrets'] = [
            'bankToken'        => (string)($sec['bankToken'] ?? ''),
            'cardPartnerId'    => (string)($sec['cardPartnerId'] ?? ''),
            'cardPartnerKey'   => (string)($sec['cardPartnerKey'] ?? ''),
            'telegramBotToken' => (string)($sec['telegramBotToken'] ?? ''),
            'telegramChatId'   => (string)($sec['telegramChatId'] ?? ''),
            'ttsApiKey'        => (string)($sec['ttsApiKey'] ?? ''),
        ];
        // GÓI KÈM FILE MEDIA ĐÃ TẢI LÊN (uploads/) — ảnh/video/hoạt ảnh nền, ảnh danh mục/
        // sản phẩm... Trước đây bản sao lưu chỉ có ĐƯỜNG DẪN (uploads/xxx.mp4) chứ không có
        // FILE, nên sau khi up bản web mới (uploads/ trống) rồi khôi phục thì link 404.
        //
        // QUAN TRỌNG — TRUYỀN DÒNG (streaming): nhúng cả video vào 1 file JSON có thể rất
        // nặng. Nếu json_encode CẢ CỤC một lần thì máy chủ dễ hết bộ nhớ và điện thoại
        // không giữ nổi -> "không kết nối được máy chủ". Vì vậy ta GHI THẲNG ra trình duyệt
        // theo từng phần, mỗi file media mã hoá base64 rồi tuôn ra ngay, KHÔNG giữ tất cả
        // trong RAM. Trình duyệt tải trực tiếp về máy như một file (Content-Disposition),
        // JS không phải ôm cả file khổng lồ.
        $per_file_cap = 120 * 1024 * 1024;  // bỏ qua từng file > 120MB
        $up_dir = __DIR__ . '/uploads/';

        // Tắt nén/đệm đầu ra để tuôn dữ liệu dần, tránh phình bộ nhớ.
        @ini_set('zlib.output_compression', '0');
        while (ob_get_level() > 0) { @ob_end_clean(); }

        $stamp = date('Y-m-d-H-i-s');
        header_remove('Content-Type');
        header('Content-Type: application/json; charset=UTF-8');
        header('Content-Disposition: attachment; filename="kenios-backup-' . $stamp . '.json"');

        // Phần "khung" (users/config/orders/_secrets...) nhỏ -> mã hoá bình thường, rồi bỏ
        // dấu } cuối để nối thêm _uploads bằng cách tuôn dòng.
        $head = json_encode($db, JSON_UNESCAPED_UNICODE);
        echo substr($head, 0, -1);   // bỏ ĐÚNG 1 dấu } cuối (không dùng rtrim để tránh cắt nhầm }})
        echo ',"_uploads":[';
        $first = true; $embedded = 0; $skipped = [];
        if (is_dir($up_dir)) {
            $names = @scandir($up_dir) ?: [];
            foreach ($names as $name) {
                if ($name === '.' || $name === '..') continue;
                if ($name[0] === '.') continue;                 // bỏ .gitkeep, .htaccess...
                $path = $up_dir . $name;
                if (!is_file($path)) continue;
                $size = filesize($path);
                if ($size === false || $size === 0) continue;
                if ($size > $per_file_cap) { $skipped[] = $name; continue; }
                $data = @file_get_contents($path);
                if ($data === false) { $skipped[] = $name; continue; }
                echo ($first ? '' : ',') . '{"n":' . json_encode($name) . ',"d":"' . base64_encode($data) . '"}';
                unset($data);
                $first = false; $embedded++;
                if (function_exists('flush')) { @flush(); }
            }
        }
        echo ']';
        echo ',"_uploadsMeta":' . json_encode(['embedded' => $embedded, 'skipped' => $skipped]);
        echo '}';
        exit;

    // Khôi phục file media (uploads/) từ bản sao lưu — nhận mảng {n, d(base64)} và ghi lại
    // vào thư mục uploads/ để các đường dẫn ảnh/video/hoạt ảnh hoạt động sau khi phục hồi.
    case 'restore_uploads':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(["status" => "error", "message" => "POST required"]); exit; }
        $admin_user = $_SERVER['HTTP_X_ADMIN_USER'] ?? '';
        $admin_pass = $_SERVER['HTTP_X_ADMIN_PASS'] ?? '';
        $db = read_db($db_file);
        if (!admin_authenticated($db, $admin_user, $admin_pass)) { echo json_encode(["status" => "error", "message" => "Unauthorized"]); exit; }
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $items = (isset($input['uploads']) && is_array($input['uploads'])) ? $input['uploads'] : [];
        $up_dir = __DIR__ . '/uploads/';
        if (!is_dir($up_dir)) @mkdir($up_dir, 0755, true);
        // Chỉ cho phép các đuôi media/tệp an toàn (giống upload_file) — CHẶN mã chạy máy chủ.
        $ok_ext = ['jpg','jpeg','jfif','png','gif','webp','svg','bmp','avif','heic','heif','ico','apng',
                   'mp4','webm','ogg','ogv','mov','m4v','mkv','avi','3gp','flv','wmv',
                   'zip','rar','7z','apk','ipa','exe','msi','dmg','obb','txt','pdf','json','dll','bin'];
        $written = 0; $failed = 0;
        foreach ($items as $it) {
            $name = (string)($it['n'] ?? '');
            $b64  = (string)($it['d'] ?? '');
            // Chống path traversal: chỉ nhận tên file thuần (không thư mục), ký tự an toàn.
            $name = basename($name);
            if ($name === '' || $name[0] === '.' || !preg_match('/^[A-Za-z0-9._-]+$/', $name)) { $failed++; continue; }
            $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
            if (!in_array($ext, $ok_ext, true)) { $failed++; continue; }
            $data = base64_decode($b64, true);
            if ($data === false) { $failed++; continue; }
            if (@file_put_contents($up_dir . $name, $data) !== false) { $written++; } else { $failed++; }
            unset($data);
        }
        echo json_encode(["status" => "success", "written" => $written, "failed" => $failed]);
        break;

    case 'secrets_status':
        $admin_user = $_SERVER['HTTP_X_ADMIN_USER'] ?? ($_GET['admin_user'] ?? '');
        $admin_pass = $_SERVER['HTTP_X_ADMIN_PASS'] ?? ($_GET['admin_pass'] ?? '');
        $db = read_db($db_file);
        if (!admin_authenticated($db, $admin_user, $admin_pass)) {
            echo json_encode(["status" => "error", "message" => "Unauthorized"]);
            exit;
        }
        $secrets = read_secrets();
        echo json_encode([
            "status" => "success",
            "ttsApiKeyConfigured" => !empty($secrets['ttsApiKey']),
            "bankTokenConfigured" => !empty($secrets['bankToken']) || !empty($db['config']['bankToken'] ?? ''),
            "cardConfigured" => !empty($secrets['cardPartnerId']) && !empty($secrets['cardPartnerKey']),
            "telegramConfigured" => !empty($secrets['telegramBotToken']) && !empty($secrets['telegramChatId'])
        ]);
        break;

    case 'save_secrets':
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $admin_user = $_SERVER['HTTP_X_ADMIN_USER'] ?? '';
        $admin_pass = $_SERVER['HTTP_X_ADMIN_PASS'] ?? '';
        $db = read_db($db_file);
        if (!admin_authenticated($db, $admin_user, $admin_pass)) {
            echo json_encode(["status" => "error", "message" => "Unauthorized"]);
            exit;
        }
        $patch = [];
        if (isset($input['ttsApiKey']) && trim($input['ttsApiKey']) !== '') $patch['ttsApiKey'] = trim($input['ttsApiKey']);
        if (isset($input['bankToken']) && trim($input['bankToken']) !== '') $patch['bankToken'] = trim($input['bankToken']);
        // Thẻ cào (thesieure.com): Partner ID + Partner Key.
        if (isset($input['cardPartnerId']) && trim($input['cardPartnerId']) !== '') $patch['cardPartnerId'] = trim($input['cardPartnerId']);
        if (isset($input['cardPartnerKey']) && trim($input['cardPartnerKey']) !== '') $patch['cardPartnerKey'] = trim($input['cardPartnerKey']);
        // Thông báo Telegram: Bot Token + Chat ID. Cho phép GỠ bằng cách gửi "-" (xoá cấu hình).
        foreach (['telegramBotToken', 'telegramChatId'] as $tk) {
            if (isset($input[$tk])) {
                $v = trim((string)$input[$tk]);
                if ($v === '-') $patch[$tk] = '';
                elseif ($v !== '') $patch[$tk] = $v;
            }
        }
        if (!$patch) {
            echo json_encode(["status" => "error", "message" => "Không có gì để lưu"]);
            exit;
        }
        if (write_secrets($patch)) {
            echo json_encode(["status" => "success", "message" => "Đã lưu cấu hình bảo mật"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Không ghi được file secrets.php (kiểm tra quyền ghi file trên hosting)"]);
        }
        break;

    // Admin bấm "Gửi thử" để kiểm tra cấu hình Telegram.
    case 'test_telegram':
        $admin_user = $_SERVER['HTTP_X_ADMIN_USER'] ?? '';
        $admin_pass = $_SERVER['HTTP_X_ADMIN_PASS'] ?? '';
        $db = read_db($db_file);
        if (!admin_authenticated($db, $admin_user, $admin_pass)) {
            echo json_encode(["status" => "error", "message" => "Unauthorized"]); exit;
        }
        $secrets = read_secrets();
        if (empty($secrets['telegramBotToken']) || empty($secrets['telegramChatId'])) {
            echo json_encode(["status" => "error", "message" => "Chưa cấu hình Bot Token + Chat ID. Hãy lưu trước khi gửi thử."]); exit;
        }
        $ok = notify_telegram("✅ <b>KENIOS.STORE</b>\nThông báo Telegram đã hoạt động! Bạn sẽ nhận tin khi có đơn mới / khách nạp tiền.");
        echo json_encode($ok
            ? ["status" => "success", "message" => "Đã gửi tin thử — kiểm tra Telegram của bạn!"]
            : ["status" => "error", "message" => "Gửi thất bại. Kiểm tra lại Bot Token / Chat ID (và bạn đã bấm Start cho bot chưa)."]);
        break;

    // XÁC THỰC 2 LỚP ADMIN — bước 1: cấp mã OTP 6 số qua Telegram (hiệu lực 5 phút).
    case 'request_admin_otp':
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $au = trim((string)($input['username'] ?? ''));
        $ap = (string)($input['password'] ?? '');
        $rlO = rate_limit_hit('otp:' . client_ip(), 5, 600, 900);
        if (!$rlO['ok']) { echo json_encode(["status" => "error", "message" => "Yêu cầu mã quá nhiều lần, thử lại sau " . retry_human($rlO['retry']) . "."]); exit; }
        $db = read_db($db_file);
        if (admin_password_ok($db, $au, $ap) === -1) { echo json_encode(["status" => "error", "message" => "Sai tài khoản hoặc mật khẩu admin."]); exit; }
        $sec = read_secrets();
        if (empty($sec['telegramBotToken']) || empty($sec['telegramChatId'])) { echo json_encode(["status" => "error", "message" => "Chưa cấu hình Telegram — không gửi được mã."]); exit; }
        $code = str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        @file_put_contents(__DIR__ . '/otp_admin.json', json_encode([
            'user' => strtolower($au), 'hash' => password_hash($code, PASSWORD_BCRYPT),
            'exp' => time() + 300, 'tries' => 0
        ]));
        notify_telegram("🔐 <b>MÃ XÁC THỰC ADMIN</b>\nMã của bạn: <b>{$code}</b>\nHiệu lực 5 phút. KHÔNG chia sẻ mã này cho bất kỳ ai.");
        echo json_encode(["status" => "success", "message" => "Đã gửi mã 6 số qua Telegram."]);
        break;

    // XÁC THỰC 2 LỚP ADMIN — bước 2: xác minh mã, mở phiên admin 3 giờ (admin2faOkUntil).
    case 'verify_admin_otp':
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $au = trim((string)($input['username'] ?? ''));
        $ap = (string)($input['password'] ?? '');
        $codeIn = preg_replace('/\D/', '', (string)($input['code'] ?? ''));
        $fp = fopen($db_file, 'c+');
        if (!$fp || !flock($fp, LOCK_EX)) { echo json_encode(["status" => "error", "message" => "Không khóa được CSDL."]); exit; }
        $raw = stream_get_contents($fp);
        $db = $raw ? (json_decode($raw, true) ?: []) : [];
        $ai = admin_password_ok($db, $au, $ap);
        if ($ai === -1) { flock($fp, LOCK_UN); fclose($fp); echo json_encode(["status" => "error", "message" => "Sai tài khoản hoặc mật khẩu admin."]); exit; }
        $otpFile = __DIR__ . '/otp_admin.json';
        $otp = @json_decode(@file_get_contents($otpFile), true);
        $fail = function ($msg) use ($fp) { flock($fp, LOCK_UN); fclose($fp); echo json_encode(["status" => "error", "message" => $msg]); exit; };
        if (!is_array($otp) || ($otp['user'] ?? '') !== strtolower($au)) $fail("Chưa có mã nào được cấp — bấm gửi lại mã.");
        if (intval($otp['exp'] ?? 0) < time()) { @unlink($otpFile); $fail("Mã đã hết hạn — bấm gửi lại mã."); }
        if (intval($otp['tries'] ?? 0) >= 5) { @unlink($otpFile); $fail("Nhập sai quá 5 lần — bấm gửi lại mã."); }
        if ($codeIn === '' || !password_verify($codeIn, (string)($otp['hash'] ?? ''))) {
            $otp['tries'] = intval($otp['tries'] ?? 0) + 1;
            @file_put_contents($otpFile, json_encode($otp));
            $fail("Mã không đúng (" . $otp['tries'] . "/5).");
        }
        @unlink($otpFile); // mã dùng 1 lần
        $db['users'][$ai]['admin2faOkUntil'] = time() + 3 * 3600; // nhập mã 1 lần dùng 3 tiếng
        ftruncate($fp, 0); rewind($fp);
        fwrite($fp, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        fflush($fp); flock($fp, LOCK_UN); fclose($fp);
        echo json_encode(["status" => "success", "message" => "Xác thực thành công — phiên admin mở trong 3 giờ."]);
        break;

    // TRA CỨU KEY công khai: khách dán key -> biết key có tồn tại + còn hạn không.
    // KHÔNG trả thông tin người mua. Rate-limit chống dò quét key hàng loạt.
    case 'check_key':
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $key = trim((string)($input['key'] ?? ''));
        if ($key === '' || strlen($key) > 200) { echo json_encode(["status" => "error", "message" => "Thiếu key cần kiểm tra."]); exit; }
        $rlK = rate_limit_hit('keycheck:' . client_ip(), 12, 60, 120);
        if (!$rlK['ok']) { echo json_encode(["status" => "error", "message" => "Bạn kiểm tra quá nhanh, thử lại sau " . retry_human($rlK['retry']) . "."]); exit; }
        $db = read_db($db_file);
        $hit = null;
        foreach (($db['orders'] ?? []) as $o) {
            if (hash_equals((string)($o['key'] ?? ''), $key)) { $hit = $o; break; }
        }
        if ($hit === null) { echo json_encode(["status" => "success", "found" => false]); exit; }
        $expIso = (string)($hit['expiryDate'] ?? '');
        $expTs = $expIso !== '' ? strtotime($expIso) : false;
        echo json_encode([
            "status" => "success", "found" => true,
            "serviceName" => (string)($hit['serviceName'] ?? ''),
            "packageName" => (string)($hit['packageName'] ?? ''),
            "expiryDate" => $expIso,
            "expired" => ($expTs !== false && $expTs < time())
        ], JSON_UNESCAPED_UNICODE);
        break;

    case 'upload_file':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(["status" => "error", "message" => "POST method required"]);
            exit;
        }
        if (!isset($_FILES['file'])) {
            http_response_code(400);
            $server_limit = ini_get('post_max_size');
            echo json_encode(["status" => "error", "message" => "Không nhận được file — có thể file vượt quá giới hạn của máy chủ (hiện tại: post_max_size=$server_limit). Xem file .user.ini để tăng giới hạn hosting."]);
            exit;
        }
        $file = $_FILES['file'];
        if ($file['error'] === UPLOAD_ERR_INI_SIZE || $file['error'] === UPLOAD_ERR_FORM_SIZE) {
            $server_limit = ini_get('upload_max_filesize');
            echo json_encode(["status" => "error", "message" => "File vượt quá giới hạn upload_max_filesize của máy chủ hosting (hiện tại: $server_limit). Cần chỉnh file .user.ini hoặc liên hệ nhà cung cấp hosting để tăng lên 500M."]);
            exit;
        }
        if ($file['error'] !== UPLOAD_ERR_OK) {
            echo json_encode(["status" => "error", "message" => "File upload error code: " . $file['error']]);
            exit;
        }
        $image_ext = ['jpg', 'jpeg', 'jfif', 'png', 'gif', 'webp', 'svg', 'bmp', 'avif', 'heic', 'heif', 'ico', 'apng'];
        $video_ext = ['mp4', 'webm', 'ogg', 'ogv', 'mov', 'm4v', 'mkv', 'avi', '3gp', 'flv', 'wmv'];
        // File bản game / tệp tải về; chặn các đuôi chạy được phía máy chủ để bảo mật.
        $file_ext = ['zip', 'rar', '7z', 'apk', 'ipa', 'exe', 'msi', 'dmg', 'obb', 'txt', 'pdf', 'json', 'dll', 'bin'];
        $blocked_ext = ['php', 'php3', 'php4', 'php5', 'phtml', 'phar', 'cgi', 'pl', 'py', 'sh', 'htaccess'];
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $is_video = in_array($ext, $video_ext, true);
        $is_image = in_array($ext, $image_ext, true);
        $is_file = in_array($ext, $file_ext, true);
        if (in_array($ext, $blocked_ext, true) || (!$is_video && !$is_image && !$is_file)) {
            echo json_encode(["status" => "error", "message" => "Định dạng file không được hỗ trợ hoặc bị chặn vì lý do bảo mật."]);
            exit;
        }
        $max_size = 500 * 1024 * 1024; // 500MB cho cả ảnh và video
        if ($file['size'] > $max_size) {
            echo json_encode(["status" => "error", "message" => "File quá lớn (tối đa 500MB)"]);
            exit;
        }
        $upload_dir = __DIR__ . '/uploads/';
        if (!file_exists($upload_dir)) mkdir($upload_dir, 0755, true);

        $filename = bin2hex(random_bytes(8)) . '.' . $ext;
        $target = $upload_dir . $filename;

        if (move_uploaded_file($file['tmp_name'], $target)) {
            $type = $is_video ? "video" : ($is_image ? "image" : "file");
            echo json_encode(["status" => "success", "url" => "uploads/" . $filename, "type" => $type]);
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to save file on server"]);
        }
        break;

    default:
        echo json_encode(["status" => "error", "message" => "Action not specified or unsupported"]);
        break;
}
