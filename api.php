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

$db_file = __DIR__ . '/database.json';
$action = $_GET['action'] ?? '';

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
    foreach ($users as $u) {
        if (($u['role'] ?? '') === 'admin'
            && strtolower($u['username'] ?? '') === strtolower($admin_user)
            && verify_password($admin_pass, $u['password'] ?? '')) {
            return true;
        }
    }
    return false;
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

switch ($action) {
    case 'register':
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $username = trim($input['username'] ?? '');
        $password = (string)($input['password'] ?? '');
        if ($username === '' || strlen($password) < 6) {
            echo json_encode(["status" => "error", "message" => "Tên đăng nhập hoặc mật khẩu không hợp lệ (mật khẩu tối thiểu 6 ký tự)."]);
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
        write_db($db_file, $db);
        echo json_encode(["status" => "success", "user" => safe_user($db['users'][$matchedIdx]), "token" => $token]);
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
        // Frontend gọi khi khách bấm "Tôi đã chuyển khoản" (và có thể lặp lại vài giây/lần).
        require_once __DIR__ . '/lib_bank.php';
        $secrets = read_secrets();
        $token = trim((string)($secrets['bankToken'] ?? ''));
        if ($token === '') {
            echo json_encode(["status" => "error", "message" => "Chưa cấu hình token ThueAPIBank trong phần Cấu hình admin."]);
            exit;
        }
        $body = json_decode(file_get_contents('php://input'), true) ?: [];
        $note = strtoupper(preg_replace('/[^a-zA-Z0-9]/', '', (string)($body['note'] ?? '')));

        $ch = curl_init("https://thueapibank.vn/historyapiacb/" . urlencode($token));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);
        $response = curl_exec($ch);
        $curl_err = curl_error($ch);
        curl_close($ch);
        if ($response === false) {
            echo json_encode(["status" => "error", "message" => "Không kết nối được tới ThueAPIBank: $curl_err"]);
            exit;
        }
        $parsed = json_decode($response, true);
        if (!is_array($parsed)) {
            echo json_encode(["status" => "error", "message" => "ThueAPIBank trả về dữ liệu không hợp lệ (kiểm tra lại token)."]);
            exit;
        }
        $transactions = bank_extract_transactions($parsed);

        // Khóa file khi cộng tiền để không cộng trùng khi có nhiều request cùng lúc.
        $fp = fopen($db_file, 'c+');
        if (!$fp || !flock($fp, LOCK_EX)) {
            echo json_encode(["status" => "error", "message" => "Không khóa được cơ sở dữ liệu, thử lại sau."]);
            exit;
        }
        $raw = stream_get_contents($fp);
        $db = $raw ? (json_decode($raw, true) ?: []) : [];
        list($count, $logs) = bank_process_transactions($db, $transactions);
        if ($count > 0) {
            ftruncate($fp, 0);
            rewind($fp);
            fwrite($fp, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            fflush($fp);
        }
        flock($fp, LOCK_UN);
        fclose($fp);

        // Kiểm tra riêng: giao dịch của "note" (mã nạp lần này) đã được ghi nhận chưa
        // (dù ở lần poll này hay đã cộng từ webhook trước đó) + trả về số dư mới của user.
        $credited = false;
        $balance = null;
        if ($note !== '') {
            foreach (($db['transactions'] ?? []) as $t) {
                if (($t['type'] ?? '') !== 'deposit') continue;
                $desc = strtoupper(preg_replace('/[^a-zA-Z0-9]/', '', $t['description'] ?? ''));
                if (strpos($desc, $note) !== false) {
                    $credited = true;
                    foreach (($db['users'] ?? []) as $u) {
                        if (($u['userId'] ?? '') === ($t['userId'] ?? '~')) { $balance = $u['balance']; break; }
                    }
                    break;
                }
            }
        }
        echo json_encode(["status" => "success", "processed" => $count, "credited" => $credited, "balance" => $balance]);
        break;

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
        echo json_encode($db, JSON_UNESCAPED_UNICODE);
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
        $price = max(0, $price - floor($price * $vipPercent / 100));

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
            elseif (!empty($matched['expiresAt']) && strtotime((string)$matched['expiresAt']) < time()) $err = "Mã giảm giá đã hết hạn sử dụng.";
            elseif ((intval($matched['maxUses'] ?? 0) > 0) && (intval($matched['usedCount'] ?? 0) >= intval($matched['maxUses'] ?? 0))) $err = "Mã giảm giá đã hết lượt sử dụng.";
            elseif ((intval($matched['minOrder'] ?? 0) > 0) && $price < intval($matched['minOrder'] ?? 0)) $err = "Đơn chưa đạt mức tối thiểu để dùng mã.";
            elseif (!empty($matched['categoryId']) && ($matched['categoryId'] !== ($service['categoryId'] ?? ''))) $err = "Mã giảm giá không áp dụng cho sản phẩm này.";
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
        $purchaseTs = time();
        $days = duration_days_from_name($pkg['name']);
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
        if ($vipPercent > 0) $parts[] = "VIP -{$vipPercent}%";
        if ($appliedCode !== '') $parts[] = "mã {$appliedCode}";
        $txDesc = count($parts) > 0
            ? "Mua {$service['name']} - {$pkg['name']} (" . implode(', ', $parts) . " · giảm " . number_format($totalDiscount) . "đ)"
            : "Mua {$service['name']} - {$pkg['name']}";
        array_unshift($db['transactions'], [
            "id" => "TX" . time() . rand(100, 999), "userId" => $db['users'][$userIdx]['userId'], "amount" => -$price,
            "type" => "purchase", "description" => $txDesc, "date" => date("c")
        ]);

        ftruncate($fp, 0);
        rewind($fp);
        fwrite($fp, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        fflush($fp);
        flock($fp, LOCK_UN);
        fclose($fp);

        archive_orders([$order]); // lưu đơn + key vào kho đơn hàng bền vững
        echo json_encode(["status" => "success", "order" => $order, "balance" => $db['users'][$userIdx]['balance']]);
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
        $price = max(0, $price - floor($price * $vipPercent / 100));

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
            elseif (!empty($matched['expiresAt']) && strtotime((string)$matched['expiresAt']) < time()) $err = "Mã giảm giá đã hết hạn sử dụng.";
            elseif ((intval($matched['maxUses'] ?? 0) > 0) && (intval($matched['usedCount'] ?? 0) >= intval($matched['maxUses'] ?? 0))) $err = "Mã giảm giá đã hết lượt sử dụng.";
            elseif ((intval($matched['minOrder'] ?? 0) > 0) && $price < intval($matched['minOrder'] ?? 0)) $err = "Đơn chưa đạt mức tối thiểu để dùng mã.";
            elseif (!empty($matched['categoryId']) && ($matched['categoryId'] !== ($service['categoryId'] ?? ''))) $err = "Mã giảm giá không áp dụng cho sản phẩm này.";
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
        if ($vipPercent > 0) $parts[] = "VIP -{$vipPercent}%";
        if ($appliedCode !== '') $parts[] = "mã {$appliedCode}";
        $txDesc = count($parts) > 0
            ? "Mua {$service['name']} - {$pkg['name']} (" . implode(', ', $parts) . " · giảm " . number_format($totalDiscount) . "đ)"
            : "Mua {$service['name']} - {$pkg['name']}";
        array_unshift($db['transactions'], [
            "id" => "TX" . time() . rand(100, 999), "userId" => $db['users'][$userIdx]['userId'], "amount" => -$price,
            "type" => "purchase", "description" => $txDesc, "date" => date("c")
        ]);

        ftruncate($fp, 0);
        rewind($fp);
        fwrite($fp, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        fflush($fp);
        flock($fp, LOCK_UN);
        fclose($fp);

        archive_orders([$order]); // lưu đơn + key vào kho đơn hàng bền vững
        echo json_encode(["status" => "success", "order" => $order, "balance" => $db['users'][$userIdx]['balance']]);
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
            $existingPasswords = []; $existingContacts = [];
            foreach ($db['users'] as $u) {
                if (!empty($u['userId'])) { $existingPasswords[$u['userId']] = $u['password'] ?? ''; $existingContacts[$u['userId']] = $u['contact'] ?? ''; }
            }
            foreach ($input['users'] as $i => $u) {
                $uid = $u['userId'] ?? null;
                if ($uid && empty($u['password']) && isset($existingPasswords[$uid])) {
                    $input['users'][$i]['password'] = $existingPasswords[$uid];
                }
                if ($uid && empty($u['contact']) && !empty($existingContacts[$uid])) {
                    $input['users'][$i]['contact'] = $existingContacts[$uid];
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

    // Khách NẠP THẺ CÀO qua thesieure.com. Gửi thẻ lên cổng, ghi 1 yêu cầu "đang xử lý";
    // tiền được cộng khi thesieure gọi callback (card.php) báo thẻ hợp lệ.
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

        $request_id = 'CARD' . $userId . time() . rand(1000, 9999);
        $sign = md5($partnerKey . $code . $serial); // chữ ký: md5(partner_key + code + serial) — giống nhau cả 2 cổng

        // Chọn cổng nạp thẻ theo cấu hình admin. thesieure.com và doithe1s.vn dùng CHUNG
        // chuẩn API /chargingws/v2 (cùng tham số + cùng chữ ký), chỉ khác tên miền.
        $gateway = strtolower(trim((string)($db['config']['cardGateway'] ?? 'thesieure.com')));
        $endpoints = [
            'thesieure.com' => 'https://thesieure.com/chargingws/v2',
            'doithe1s.vn'   => 'https://doithe1s.vn/chargingws/v2',
        ];
        $chargeUrl = $endpoints[$gateway] ?? $endpoints['thesieure.com'];

        $post = http_build_query([
            'telco' => $telco, 'code' => $code, 'serial' => $serial, 'amount' => $amount,
            'request_id' => $request_id, 'partner_id' => $partnerId, 'sign' => $sign, 'command' => 'charging'
        ]);
        $ch = curl_init($chargeUrl);
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
                'gatewayStatus' => $gwStatus, 'date' => date('c')
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

    // Khách KIỂM TRA trạng thái các thẻ đã nạp + lấy số dư mới nhất (callback đã cộng chưa).
    case 'card_status':
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $userId = (string)($input['userId'] ?? '');
        $token = (string)($input['token'] ?? '');
        if ($userId === '') { echo json_encode(["status" => "error", "message" => "Thiếu tài khoản."]); exit; }
        $db = read_db($db_file);
        $balance = null; $meFound = false;
        foreach (($db['users'] ?? []) as $u) { if (($u['userId'] ?? '') === $userId) { $balance = $u['balance']; $meFound = $u; break; } }
        if ($meFound && !token_ok($meFound, $token)) { echo json_encode(["status" => "error", "message" => "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."]); exit; }
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
        echo json_encode(["status" => "success", "balance" => $balance, "requests" => $mine]);
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
        echo json_encode(["status" => "success", "db" => $db], JSON_UNESCAPED_UNICODE);
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
            "cardConfigured" => !empty($secrets['cardPartnerId']) && !empty($secrets['cardPartnerKey'])
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
