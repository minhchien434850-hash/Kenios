<?php
// secrets.php - Lưu trữ các khóa bí mật (API key, token webhook) TÁCH RIÊNG khỏi
// database.json. File này chỉ được "require" bởi các script PHP phía máy chủ
// (api.php, tts.php, bank_callback.php) — không có action API nào trả nguyên
// nội dung file này ra ngoài, nên khóa bí mật không bao giờ lộ cho trình duyệt.
return [
    // Khóa API Google Cloud Text-to-Speech (https://console.cloud.google.com/apis/credentials).
    "ttsApiKey" => "",
    // Token xác thực webhook / lịch sử ngân hàng tự động (ThueAPIBank - ACB).
    "bankToken" => "9ae2cbf6b50e0bc2f5814f3ce6ce7f9b",
];
