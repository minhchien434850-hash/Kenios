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
    unset($u['password'], $u['contact']);
    return $u;
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
        $db = read_db($db_file);
        if (empty($db) || !isset($db['users'])) {
            echo json_encode(["status" => "error", "message" => "Database not initialized"]);
            exit;
        }
        foreach ($db['users'] as $u) {
            if (strtolower($u['username'] ?? '') === strtolower($username)) {
                echo json_encode(["status" => "error", "message" => "Tên đăng nhập đã tồn tại."]);
                exit;
            }
        }
        $user = [
            "userId" => uniqid(),
            "username" => $username,
            "password" => password_hash($password, PASSWORD_BCRYPT),
            "contact" => trim((string)($input['contact'] ?? '')),
            "balance" => 0,
            "role" => "member",
            "status" => "active",
            "avatar" => "https://api.dicebear.com/7.x/adventurer/svg?seed=" . urlencode($username),
            "createdAt" => date("Y-m-d")
        ];
        $db['users'][] = $user;
        if (!write_db($db_file, $db)) {
            echo json_encode(["status" => "error", "message" => "Failed to write database file"]);
            exit;
        }
        echo json_encode(["status" => "success", "user" => safe_user($user)]);
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
            write_db($db_file, $db);
        }
        echo json_encode(["status" => "success", "user" => safe_user($db['users'][$matchedIdx])]);
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
        if (empty($db) || !isset($db['users'])) {
            echo json_encode(["status" => "error", "message" => "Database not initialized"]);
            exit;
        }

        $matchedIdx = -1;
        foreach ($db['users'] as $idx => $u) {
            if (strtolower($u['username'] ?? '') === $email) { $matchedIdx = $idx; break; }
        }

        if ($matchedIdx === -1) {
            $user = [
                "userId" => uniqid(),
                "username" => $email,
                "password" => password_hash(bin2hex(random_bytes(16)), PASSWORD_BCRYPT),
                "balance" => 0,
                "role" => "member",
                "status" => "active",
                "authProvider" => "google",
                "avatar" => $info['picture'] ?? ("https://api.dicebear.com/7.x/adventurer/svg?seed=" . urlencode($email)),
                "createdAt" => date("Y-m-d")
            ];
            $db['users'][] = $user;
            if (!write_db($db_file, $db)) {
                echo json_encode(["status" => "error", "message" => "Failed to write database file"]);
                exit;
            }
            echo json_encode(["status" => "success", "user" => safe_user($user)]);
        } else {
            if (($db['users'][$matchedIdx]['status'] ?? 'active') !== 'active') {
                echo json_encode(["status" => "error", "message" => "Tài khoản đã bị khóa."]);
                exit;
            }
            echo json_encode(["status" => "success", "user" => safe_user($db['users'][$matchedIdx])]);
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
        $admin_user = $_SERVER['HTTP_X_ADMIN_USER'] ?? ($_GET['admin_user'] ?? '');
        $admin_pass = $_SERVER['HTTP_X_ADMIN_PASS'] ?? ($_GET['admin_pass'] ?? '');
        $is_admin = !empty($admin_user) && admin_authenticated($db, $admin_user, $admin_pass);

        if (isset($db['users']) && is_array($db['users'])) {
            $db['users'] = array_map('safe_user', $db['users']);
        }
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
        $username = trim((string)($input['username'] ?? ''));
        $password = (string)($input['password'] ?? '');
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

        $userIdx = -1;
        foreach (($db['users'] ?? []) as $i => $u) {
            if (strtolower($u['username'] ?? '') === strtolower($username)) { $userIdx = $i; break; }
        }
        if ($userIdx === -1 || !verify_password($password, $db['users'][$userIdx]['password'] ?? '')) {
            flock($fp, LOCK_UN); fclose($fp);
            echo json_encode(["status" => "error", "message" => "Sai tên đăng nhập hoặc mật khẩu."]);
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

        $price = floatval($pkg['price'] ?? 0);

        // Áp mã giảm giá (nếu khách nhập): đối chiếu với danh sách mã trong config, giảm theo % hoặc theo số tiền.
        $discountAmount = 0;
        $appliedCode = '';
        if ($discountCode !== '') {
            $matched = null;
            foreach (($db['config']['discountCodes'] ?? []) as $dc) {
                if (!is_array($dc)) continue;
                if (($dc['enabled'] ?? true) === false) continue;
                if (strtoupper(trim((string)($dc['code'] ?? ''))) === $discountCode) { $matched = $dc; break; }
            }
            if ($matched === null) {
                flock($fp, LOCK_UN); fclose($fp);
                echo json_encode(["status" => "error", "message" => "Mã giảm giá không đúng hoặc đã hết hiệu lực."]);
                exit;
            }
            $val = floatval($matched['value'] ?? 0);
            $discountAmount = (($matched['type'] ?? 'percent') === 'amount') ? floor($val) : floor($price * $val / 100);
            $discountAmount = max(0, min($discountAmount, $price));
            $appliedCode = $discountCode;
        }
        $originalPrice = $price;
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
        $order = [
            "id" => "DH" . time() . rand(100, 999), "userId" => $db['users'][$userIdx]['userId'],
            "serviceId" => $serviceId, "serviceName" => $service['name'], "packageName" => $pkg['name'],
            "os" => $os, "price" => $price, "originalPrice" => $originalPrice,
            "discountCode" => $appliedCode, "discountAmount" => $discountAmount, "key" => $key,
            "date" => date("c", $purchaseTs), "purchaseDate" => date("c", $purchaseTs),
            "expiryDate" => $days === null ? null : date("c", $purchaseTs + $days * 86400)
        ];
        if (!isset($db['orders'])) $db['orders'] = [];
        array_unshift($db['orders'], $order);
        if (!isset($db['transactions'])) $db['transactions'] = [];
        $txDesc = $discountAmount > 0
            ? "Mua {$service['name']} - {$pkg['name']} (mã {$appliedCode} -" . number_format($discountAmount) . "đ)"
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

        echo json_encode(["status" => "success", "order" => $order, "balance" => $db['users'][$userIdx]['balance']]);
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
            echo json_encode(["status" => "success", "message" => "Database saved successfully"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to write database file"]);
        }
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
            "bankTokenConfigured" => !empty($secrets['bankToken']) || !empty($db['config']['bankToken'] ?? '')
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
