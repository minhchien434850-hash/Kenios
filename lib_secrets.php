<?php
// lib_secrets.php - Đọc/ghi secrets.php (API key, token webhook). Dùng chung bởi
// api.php, tts.php, bank_callback.php. Không có hàm nào ở đây trả dữ liệu thẳng
// ra HTTP response — nơi gọi phải tự quyết định lộ field nào (thường là KHÔNG).
function read_secrets() {
    $file = __DIR__ . '/secrets.php';
    if (!file_exists($file)) return [];
    $data = include $file;
    return is_array($data) ? $data : [];
}

function write_secrets($patch) {
    $file = __DIR__ . '/secrets.php';
    $current = read_secrets();
    $merged = array_merge($current, $patch);
    $export = var_export($merged, true);
    $content = "<?php\n"
        . "// secrets.php - Lưu trữ các khóa bí mật (API key, token webhook) TÁCH RIÊNG\n"
        . "// khỏi database.json. Không có action API nào trả nguyên nội dung file này\n"
        . "// ra ngoài, nên khóa bí mật không bao giờ lộ cho trình duyệt.\n"
        . "return $export;\n";
    $ok = file_put_contents($file, $content, LOCK_EX) !== false;
    // secrets.php được include() — nếu OPcache đang bật, máy chủ có thể vẫn phục vụ
    // bản biên dịch cũ vài giây sau khi ghi. Vô hiệu hóa cache của riêng file này để
    // request kế tiếp thấy giá trị mới ngay lập tức.
    if ($ok && function_exists('opcache_invalidate')) opcache_invalidate($file, true);
    return $ok;
}
