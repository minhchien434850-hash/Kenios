// sw.js — Service Worker cho KENIOS.STORE (PWA cài như app).
// Chiến lược:
//  - api.php / database.json / *.php  -> LUÔN lấy từ mạng (dữ liệu tiền/kho key phải mới,
//    KHÔNG bao giờ cache) để tránh hiện số dư/tồn kho cũ.
//  - Còn lại (giao diện, ảnh, icon) -> ưu tiên mạng, hỏng mạng thì lấy bản cache (offline).
// Đổi CACHE_VERSION mỗi lần cập nhật lớn để trình duyệt tải lại vỏ ứng dụng.
const CACHE_VERSION = 'kenios-v4';
const SHELL = ['./', './index.html', './style.css?v=4', './script.js?v=4', './manifest.json',
  './favicon.svg', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_VERSION).then((c) => c.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Không đụng vào yêu cầu động/nhạy cảm — để trình duyệt tự lấy thẳng từ mạng.
function isDynamic(url) {
  return /\.php(\?|$)/i.test(url) || /database\.json/i.test(url) || /\/api\b/i.test(url);
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;                    // chỉ xử lý GET
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;     // bỏ qua tài nguyên ngoài (font, CDN...)
  if (isDynamic(req.url)) return;                       // dữ liệu động -> mạng thẳng, không cache

  // Ưu tiên MẠNG và BỎ QUA cache HTTP của trình duyệt (cache:'no-store') để LUÔN lấy code
  // mới khi online — tránh trình duyệt trong-app (Telegram/Zalo) giữ mãi bản cũ. Hỏng mạng
  // thì mới lấy bản CACHE của service worker (offline).
  e.respondWith(
    fetch(req, { cache: 'no-store' }).then((res) => {
      if (res && res.ok) {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then((c) => c.put(req, copy)).catch(() => {});
      }
      return res;
    }).catch(() => fetch(req).then((r) => r).catch(() => caches.match(req).then((hit) => hit || caches.match('./index.html'))))
  );
});
