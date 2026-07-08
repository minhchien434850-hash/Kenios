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

$db_file = __DIR__ . '/database.json';
$action = $_GET['action'] ?? '';

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
    unset($u['password']);
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

    case 'get_db':
        if (!file_exists($db_file)) {
            echo json_encode(["status" => "error", "message" => "Database file not found"]);
            exit;
        }
        echo file_get_contents($db_file);
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
        $users = $db['users'] ?? [];

        $authenticated = empty($users); // Cho phép ghi lần đầu khi chưa có tài khoản nào (khởi tạo)
        foreach ($users as $u) {
            if (($u['role'] ?? '') === 'admin'
                && strtolower($u['username'] ?? '') === strtolower($admin_user)
                && verify_password($admin_pass, $u['password'] ?? '')) {
                $authenticated = true;
                break;
            }
        }

        if (!$authenticated) {
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

        if (write_db($db_file, $input)) {
            echo json_encode(["status" => "success", "message" => "Database saved successfully"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to write database file"]);
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
        $image_ext = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
        $video_ext = ['mp4', 'webm', 'ogg'];
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $is_video = in_array($ext, $video_ext, true);
        if (!$is_video && !in_array($ext, $image_ext, true)) {
            echo json_encode(["status" => "error", "message" => "Định dạng file không được hỗ trợ (chỉ ảnh hoặc video mp4/webm/ogg)"]);
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
            echo json_encode(["status" => "success", "url" => "uploads/" . $filename, "type" => $is_video ? "video" : "image"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to save file on server"]);
        }
        break;

    default:
        echo json_encode(["status" => "error", "message" => "Action not specified or unsupported"]);
        break;
}
