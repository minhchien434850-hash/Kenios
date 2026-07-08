<?php
// api.php - Backend Storage Sync for kenios.store
ini_set('memory_limit', '256M');
ini_set('max_execution_time', 60);
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
            echo json_encode(["status" => "error", "message" => "No file uploaded"]);
            exit;
        }
        $file = $_FILES['file'];
        if ($file['error'] !== UPLOAD_ERR_OK) {
            echo json_encode(["status" => "error", "message" => "File upload error code: " . $file['error']]);
            exit;
        }
        $allowed_ext = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($ext, $allowed_ext, true)) {
            echo json_encode(["status" => "error", "message" => "Định dạng file không được hỗ trợ"]);
            exit;
        }
        $upload_dir = __DIR__ . '/uploads/';
        if (!file_exists($upload_dir)) mkdir($upload_dir, 0755, true);

        $filename = bin2hex(random_bytes(8)) . '.' . $ext;
        $target = $upload_dir . $filename;

        if (move_uploaded_file($file['tmp_name'], $target)) {
            echo json_encode(["status" => "success", "url" => "uploads/" . $filename]);
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to save file on server"]);
        }
        break;

    default:
        echo json_encode(["status" => "error", "message" => "Action not specified or unsupported"]);
        break;
}
