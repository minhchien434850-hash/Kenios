/* ===========================================================
   KENIOS.STORE — script.js (toàn bộ logic phía client)
   Gộp từ: data.js + store.js + voice.js + effects.js + app.js
=========================================================== */

/**
 * data.js — Dữ liệu mặc định của shop (dùng khi chưa nạp được database.json,
 * ví dụ mở trực tiếp bằng file:// hoặc server chưa có PHP).
 * Cùng cấu trúc với database.json để store.js dùng chung một schema.
 */
window.KENIOS_DEFAULT_DB = {
  config: {
    siteName: "kenios.store",
    siteTitle: "KENIOS.STORE - Cửa Hàng Dịch Vụ Game & Thiết Kế Website",
    siteSubtitle: "Hệ thống phân phối phụ kiện game & dịch vụ thiết kế web hàng đầu Việt Nam. Tự động 24/24, hỗ trợ setup từ A-Z.",
    logoText: "KENIOS.STORE",
    logoSubtext: "Next Gen",
    logoUrl: "",
    logoFont: "Be Vietnam Pro",
    logoColor: "",
    logoColorMode: "rainbow",
    logoAnimSpeed: 6,
    logoMotionMode: "none",
    logoMotionSpeed: 2,
    accentColor: "#22d3ee",
    referralEnabled: true,
    referralBonus: 20000,
    showcaseEnabled: false,
    googleClientId: "",
    welcomePopupEnabled: false,
    welcomePopupTitle: "Chào mừng bạn đến với KENIOS.STORE!",
    welcomePopupMessage: "Hệ thống nạp tiền VietQR tự động 24/7, giao key tức thì sau thanh toán. Cần hỗ trợ gì cứ liên hệ Admin nhé!",
    welcomeVoiceEnabled: false,
    welcomeAlways: true,
    hotline: "",
    zaloLink: "",
    contactChannels: [
    { id: "zalo", label: "Zalo", icon: "", url: "", enabled: false },
    { id: "phone", label: "Hotline", icon: "", url: "", enabled: false },
    { id: "telegram", label: "Telegram", icon: "", url: "", enabled: false },
    { id: "facebook", label: "Facebook", icon: "", url: "", enabled: false },
    { id: "instagram", label: "Instagram", icon: "", url: "", enabled: false },
    { id: "tiktok", label: "TikTok", icon: "", url: "", enabled: false },
    { id: "email", label: "Email", icon: "", url: "", enabled: false }],

    contactAdminName: "ADMIN SHOP",
    contactAdminSub: "Chủ sở hữu hệ thống",
    contactAdminDesc: "Chuyên cung cấp phụ kiện gaming và dịch vụ thiết kế website chất lượng cao, giúp nâng tầm trải nghiệm của bạn.",
    bgUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1920&auto=format&fit=crop",
    siteBgUrl: "",
    aiName: "Trợ Lý Ảo Kenios",
    aiGreeting: "Xin chào! Tôi là trợ lý ảo của KENIOS.STORE. Tôi có thể giúp gì cho bạn hôm nay?",
    aiResponseGreeting: "Chào bạn! Chúc bạn một ngày mua sắm vui vẻ. Tôi có thể hỗ trợ bạn tìm hiểu về dịch vụ Game hoặc Thiết Kế Web của shop.",
    aiResponsePrice: "🔥 BẢNG GIÁ 🔥🚀\n\n🎮 PUBG IOS\n\n💎 VNHAX\n💰 600K/Tháng\n💰 300K/Tuần\n\n💎 VNHAX MOD SKIN VN\n💰 450K/Tháng\n💰 225K/Tuần\n\n💎 OASIS VIP\n💰 800K/Tháng\n💰 400K/Tuần\n\n💎 KING\n💰 900K/Tháng\n💰 450K/Tuần\n\n💎 TIMO VIP\n💰 500K/Tháng\n💰 250K/Tuần\n💰 50K/Ngày\n\n💎 VINGODL\n💰 550K/Tháng\n💰 250K/Tuần\n\n🤖 PUBG ANDROID\n\n💰 ZOLO: 500K/T - 250K/Tuần\n💰 MG: 500K/T - 250K/Tuần\n💰 VNB: 500K/T - 250K/Tuần\n💰 ROOT: 650K/Tháng\n\n⚔️ LIÊN QUÂN\n💰 250K/Tháng\n💰 120K/Tuần\n💰 500/Tháng chống tố\n💰 250/Tuần chống tố\n\n🔥 FREE FIRE\n💰 550K/Tháng\n💰 250K/Tuần\n\n🌐 Tất cả dịch vụ: https://linkbio.co/KENIOS\n👥 Nhóm Zalo: https://zalo.me/g/wfggej458\n📢 Nhóm Telegram: https://t.me/minhchienhaxgame\n\n❤️ Cảm ơn anh em đã ủng hộ ❤️",
    aiResponseFallback: "Mình chưa hiểu rõ câu hỏi này 🥲. Bạn có thể hỏi mình về: cách nạp tiền, cách mua/nhận key, bảng giá, bảo hành, thiết kế web… hoặc nhắn Zalo Admin để được hỗ trợ ngay nhé!",
    // Bộ câu trả lời sẵn — khách nhắn chứa từ khoá nào (cách nhau bởi dấu phẩy) thì trả lời câu tương ứng.
    aiKnowledge: [
    { k: "nạp tiền, nap tien, nạp, vietqr, chuyển khoản, ck, nạp thế nào", a: "Nạp tiền 100% TỰ ĐỘNG 👍: vào mục \"Nạp tiền\", nhập số tiền rồi quét mã VietQR bằng app ngân hàng. Số dư cộng NGAY sau khi chuyển khoản thành công, không cần chờ duyệt." },
    { k: "mua key, cách mua, mua thế nào, đặt hàng, mua hàng, mua sao", a: "Cách mua: chọn sản phẩm → chọn gói → bấm \"Mua Ngay\" (trừ vào số dư). Key hiện NGAY trong mục \"Đơn hàng của tôi\", bạn copy dùng liền 🔑." },
    { k: "bao lâu, khi nào nhận, chờ bao lâu, nhận key lâu, giao key", a: "Key giao TỰ ĐỘNG & TỨC THÌ ngay sau khi thanh toán, không phải chờ đợi. Xem trong \"Đơn hàng của tôi\" nhé." },
    { k: "nhận key ở đâu, key đâu, lấy key ở đâu, xem key", a: "Key nằm trong mục \"Đơn hàng của tôi\" (bấm avatar hoặc menu). Mỗi đơn có nút sao chép key." },
    { k: "bảo hành, bao hanh, key lỗi, lỗi key, không dùng được, không vào được", a: "Sản phẩm được BẢO HÀNH trong suốt thời gian gói ✅. Nếu key lỗi, bạn nhắn Admin kèm mã đơn để được kiểm tra & đổi key ngay." },
    { k: "hoàn tiền, hoan tien, refund, trả lại tiền, đổi trả", a: "Vì là sản phẩm số cấp phát tức thì nên shop không hoàn tiền sau khi đã nhận key, trừ trường hợp lỗi từ hệ thống. Gặp sự cố hãy liên hệ Admin trong 24h nhé." },
    { k: "an toàn, có bị khóa, khóa nick, khóa acc, ban, có an toàn không, tố", a: "Tụi mình luôn cập nhật bản MỚI & AN TOÀN nhất 🔒. Game online vẫn có rủi ro nhất định, bạn dùng đúng hướng dẫn để hạn chế tối đa. Liên Quân có bản CHỐNG TỐ riêng." },
    { k: "cài đặt, cai dat, hướng dẫn, dùng thế nào, sử dụng, setup", a: "Sau khi mua, bạn xem hướng dẫn cài đặt đi kèm hoặc nhắn Admin để được gửi video hướng dẫn chi tiết từng bước 📹." },
    { k: "thiết kế web, thiet ke web, website, làm web, landing", a: "Shop nhận THIẾT KẾ WEBSITE hiện đại, chuẩn SEO, chạy mượt trên mọi thiết bị 💻. Xem mục \"Thiết Kế Web\" hoặc nhắn Admin để được báo giá theo yêu cầu." },
    { k: "uy tín, lừa đảo, scam, có thật không, tin được không, thật không", a: "Shop UY TÍN, giao dịch tự động minh bạch, có cộng đồng đông đảo ❤️. Bạn xem phần đánh giá & giao dịch gần đây trên trang để yên tâm hơn nhé." },
    { k: "khuyến mãi, khuyen mai, giảm giá, sale, ưu đãi, mã giảm, khuyến mại", a: "Ưu đãi & mã giảm giá được cập nhật thường xuyên trong nhóm Zalo/Telegram 🎁. Tham gia nhóm ở phần Liên Hệ để không bỏ lỡ nhé!" },
    { k: "giờ làm việc, mấy giờ, còn hoạt động, có online, làm việc lúc nào", a: "Hệ thống bán & giao key hoạt động TỰ ĐỘNG 24/7 ⏰. Admin hỗ trợ tư vấn gần như cả ngày." },
    { k: "nhiều máy, mấy máy, mấy thiết bị, share, dùng chung", a: "Mỗi key dùng cho 1 thiết bị theo gói. Nếu cần nhiều máy, bạn mua thêm key hoặc hỏi Admin gói phù hợp nhé." },
    { k: "gia hạn, gia han, hết hạn, renew, còn hạn", a: "Gần hết hạn, bạn chỉ cần mua lại gói tương ứng là được gia hạn. Cần hỗ trợ nhanh thì nhắn Admin nhé." },
    { k: "thanh toán, momo, thẻ cào, the cao, ngân hàng nào, banking", a: "Shop nhận chuyển khoản VietQR của TẤT CẢ ngân hàng, cộng tiền tự động. Hình thức khác (Momo/thẻ) vui lòng hỏi Admin." },
    { k: "số dư, so du, còn bao nhiêu tiền, kiểm tra tiền, tài khoản", a: "Số dư hiển thị ở góc trên khi đăng nhập và trong menu tài khoản. Muốn nạp thêm thì vào mục \"Nạp tiền\" nhé." },
    { k: "đăng ký, dang ky, đăng nhập, tạo tài khoản, quên mật khẩu, login", a: "Bấm \"Đăng nhập\" để tạo tài khoản mới hoặc đăng nhập bằng Google. Quên mật khẩu thì dùng chức năng \"Quên mật khẩu\" hoặc nhắn Admin." },
    { k: "pubg, pu bg", a: "PUBG có nhiều tool xịn: VNHAX, OASIS, KING, TIMO, VINGODL… cho cả iOS & Android 🎮. Bấm danh mục PUBG để xem giá từng gói." },
    { k: "free fire, freefire, ff", a: "🔥 FREE FIRE: 550K/Tháng · 250K/Tuần. Bấm danh mục Free Fire để xem chi tiết và mua nhé." },
    { k: "liên quân, lien quan, lq", a: "⚔️ LIÊN QUÂN: 250K/Tháng · 120K/Tuần (có bản CHỐNG TỐ). Xem danh mục Liên Quân để biết thêm nhé." },
    { k: "tốc chiến, toc chien, lmht", a: "Tốc Chiến có tool hỗ trợ & mod skin. Bạn bấm danh mục Tốc Chiến để xem các gói và giá nhé." },
    { k: "liên hệ, lien he, zalo, telegram, admin, số điện thoại, hotline, facebook", a: "Bạn liên hệ Admin qua Zalo/Telegram ở phần \"Liên Hệ & Cộng Đồng\" (kéo xuống cuối trang) hoặc nút liên hệ góc phải màn hình 💬." },
    { k: "hỗ trợ, support, giúp, tư vấn, cần giúp", a: "Shop hỗ trợ 24/7 nhé! Bạn cứ hỏi mình ở đây, hoặc nhắn Zalo Admin để được tư vấn trực tiếp." },
    { k: "cảm ơn, cam on, thanks, thank, tks", a: "Không có gì ạ! 😄 Chúc bạn chơi game vui vẻ, cần gì cứ nhắn shop nhé ❤️" },
    { k: "tạm biệt, bye, tam biet, chào tạm biệt", a: "Tạm biệt bạn! 👋 Hẹn gặp lại, chúc bạn một ngày tốt lành nhé." }],

    bankId: "MBBank",
    bankAccountNo: "0822148411",
    bankAccountName: "NGUYEN TIN HAO",
    bannerTagText: "Dịch vụ hàng đầu Việt Nam",
    bannerBtn1Text: "Xem Dịch Vụ",
    bannerBtn2Text: "Nạp Tiền Ngay",
    marqueeText: "Hệ thống nạp tiền VietQR tự động 24/7 · Key được gửi tự động ngay trong mục Đơn Hàng Của Tôi · Trợ lý ảo AI hỗ trợ giải đáp 24/24",
    marqueeSpeed: 26,
    ttsEnabled: true,
    ttsVoice: "google_female_vi",
    ttsRate: 1,
    ttsPitch: 1,
    // Khuyến mãi nạp tiền: nạp >= depositBonusMin sẽ được cộng thêm depositBonusPercent%.
    depositBonusEnabled: false,
    depositBonusPercent: 0,
    depositBonusMin: 0,
    // Mã giảm giá sản phẩm: admin tạo tuỳ ý. Mỗi mã giảm theo % hoặc theo số tiền cố định.
    // { code, type:'percent'|'amount', value, enabled, maxUses, maxUsesPerUser, maxUsers, usedCount, expiresAt, minOrder, categoryId }
    discountCodes: [],
    // Flash Sale toàn shop có đếm ngược: giảm % mọi sản phẩm tới thời điểm endsAt.
    flashSale: { enabled: false, percent: 0, endsAt: '', title: 'FLASH SALE' },
    // Hạng thành viên VIP: tổng chi tiêu >= minSpent thì tự động giảm discountPercent% khi mua.
    // [{ name, minSpent, discountPercent }] — sắp xếp tăng dần theo minSpent.
    vipTiers: []
  },
  categories: [
  { id: "pubg", name: "PUBG", description: "Công cụ hỗ trợ & phụ kiện cho game PUBG", icon: "🎯",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop" },
  { id: "lienquan", name: "Liên Quân", description: "Mod skin, bản đồ sáng và dịch vụ hỗ trợ leo rank", icon: "🛡️",
    image: "https://images.unsplash.com/photo-1553481187-be93c21490a9?q=80&w=600&auto=format&fit=crop" },
  { id: "freefire", name: "Free Fire", description: "Công cụ hỗ trợ, phụ kiện độc quyền cho Free Fire", icon: "🔥",
    image: "https://images.unsplash.com/photo-1560253023-3ec5d502959f?q=80&w=600&auto=format&fit=crop" },
  { id: "tocchien", name: "Tốc Chiến", description: "Phần mềm bổ trợ và mod skin cho Tốc Chiến", icon: "⚡",
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&auto=format&fit=crop" },
  { id: "webdesign", name: "Thiết Kế Web", description: "Thiết kế website hiện đại, Glassmorphism, chuẩn SEO", icon: "💻",
    image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=600&auto=format&fit=crop" },
  { id: "other", name: "Khác", description: "Các sản phẩm, phần mềm và dịch vụ khác", icon: "📁",
    image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=600&auto=format&fit=crop" }],

  services: [
  {
    id: "pubg-radar", categoryId: "pubg", name: "PUBG ESP Radar Premium",
    description: "Hiển thị khung xương địch, vị trí, khoảng cách, hướng nhìn, xe cộ và hòm đồ.",
    status: "instock",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop",
    features: ["Test mượt mà, không giật lag", "Cập nhật tự động", "Hỗ trợ setup từ A-Z"],
    packages: [
    { id: "pkg-radar-1day", name: "1 Ngày", price: 25000 },
    { id: "pkg-radar-3day", name: "3 Ngày", price: 65000 },
    { id: "pkg-radar-7day", name: "7 Ngày", price: 120000 },
    { id: "pkg-radar-30day", name: "1 Tháng", price: 350000 }]

  },
  {
    id: "pubg-aimbot", categoryId: "pubg", name: "PUBG Silent Aimbot Max",
    description: "Hỗ trợ ngắm bắn mượt mà, tùy chỉnh độ nhạy và trường nhìn (FOV).",
    status: "instock",
    image: "https://images.unsplash.com/photo-1553481187-be93c21490a9?q=80&w=800&auto=format&fit=crop",
    features: ["Tùy chỉnh FOV & độ mượt", "Cập nhật tự động"],
    packages: [
    { id: "pkg-aimbot-1day", name: "1 Ngày", price: 30000 },
    { id: "pkg-aimbot-7day", name: "7 Ngày", price: 140000 },
    { id: "pkg-aimbot-30day", name: "1 Tháng", price: 390000 }]

  },
  {
    id: "kingmod", categoryId: "pubg", name: "Phụ Kiện KingMod",
    description: "Phụ kiện hỗ trợ trải nghiệm mượt mà và leo rank dễ dàng hơn.",
    status: "outofstock",
    image: "https://images.unsplash.com/photo-1560253023-3ec5d502959f?q=80&w=800&auto=format&fit=crop",
    features: ["Cập nhật tự động"],
    packages: [{ id: "pkg-kingmod-1m", name: "1 Tháng", price: 200000 }]
  },
  {
    id: "web-landing", categoryId: "webdesign", name: "Thiết Kế Landing Page",
    description: "Landing Page giới thiệu sản phẩm/dịch vụ với hiệu ứng kính mờ (Glassmorphism), tải trang nhanh, chuẩn SEO.",
    status: "instock",
    image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=800&auto=format&fit=crop",
    features: ["Thiết kế phong cách Apple kính mờ", "Tương thích mọi thiết bị", "Chuẩn SEO Google", "Bàn giao toàn bộ mã nguồn", "Bảo hành kỹ thuật trọn đời"],
    packages: [{ id: "pkg-landing", name: "Trọn gói", price: 1500000 }]
  },
  {
    id: "web-shop", categoryId: "webdesign", name: "Thiết Kế Web Shop Tự Động",
    description: "Website bán acc/key tích hợp nạp tiền VietQR tự động, quản trị admin thời gian thực.",
    status: "instock",
    image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=800&auto=format&fit=crop",
    features: ["Nạp tiền QR tự động", "Đồng bộ thời gian thực", "Trợ lý ảo AI đàm thoại", "Quản trị Admin đầy đủ"],
    packages: [{ id: "pkg-webshop", name: "Trọn gói", price: 3500000 }]
  }],

  users: [
  { userId: "10001", username: "kenios", password: "admin1999@", balance: 0, role: "admin", status: "active", createdAt: "2026-06-13" }],

  posts: [
  { id: "1", title: "Hướng dẫn cài đặt an toàn 100%", summary: "Làm sao để trải nghiệm an toàn, không lo mất tài khoản chính? Xem ngay cẩm nang này.", date: "2026-06-10" },
  { id: "2", title: "Cập nhật hệ thống nạp tiền VietQR siêu tốc", summary: "Hệ thống chính thức nâng cấp cơ chế sinh mã QR tự động theo chuẩn Napas 247.", date: "2026-06-09" }],

  orders: [],
  transactions: [],
  media: [],
  reviews: [] // Đánh giá sản phẩm: { id, serviceId, userId, username, rating(1-5), text, date }
};

/**
 * store.js — Quản lý dữ liệu & phiên đăng nhập.
 * Nguồn dữ liệu gốc: database.json (đồng bộ qua api.php khi chạy trên PHP hosting).
 * Đăng nhập/đăng ký ưu tiên xác thực qua máy chủ (mật khẩu được băm bằng
 * password_hash phía PHP); nếu không có backend (mở file://, hosting tĩnh),
 * tự động chuyển sang chế độ demo cục bộ lưu trong localStorage để trải
 * nghiệm vẫn hoạt động đầy đủ.
 */
(function (global) {
  'use strict';

  const LS_KEY = 'kenios_local_state_v1';
  const API_URL = './api.php';

  // Ném ra khi không có backend PHP thật sự phản hồi (mở file://, hosting tĩnh,
  // lỗi mạng...) — phân biệt với lỗi hợp lệ mà server trả về (vd. sai mật khẩu).
  class BackendUnavailableError extends Error {}

  // Suy ra số ngày sử dụng từ tên gói (VD "7 Ngày", "1 Tháng", "1 Tuần", "Vĩnh viễn").
  // Trả về null nếu là gói vĩnh viễn / không xác định thời hạn (không tính ngày hết hạn).
  function parseDurationDays(name) {
    const t = (name || '').toLowerCase();
    if (/vĩnh viễn|vinh vien|vĩnh|lifetime|forever|perm|không thời hạn|khong thoi han/.test(t)) return null;
    const num = parseInt((t.match(/\d+/) || [])[0], 10) || 1;
    if (/năm|nam|year/.test(t)) return num * 365;
    if (/tháng|thang|month/.test(t)) return num * 30;
    if (/tuần|tuan|week/.test(t)) return num * 7;
    if (/ngày|ngay|day/.test(t)) return num;
    return null;
  }
  // Tính ngày hết hạn (ISO) từ tên gói + ngày mua. Trả về null nếu gói vĩnh viễn.
  function computeExpiryISO(packageName, fromISO) {
    const days = parseDurationDays(packageName);
    if (days == null) return null;
    const d = new Date(fromISO || Date.now());
    d.setDate(d.getDate() + days);
    return d.toISOString();
  }

  const Store = {
    db: null,
    session: null, // { userId } khi đã đăng nhập
    serverAvailable: null, // null = chưa rõ, true/false sau lần gọi API đầu tiên
    _listeners: [],

    async init() {
      this.db = await this._loadDb();
      if (!Array.isArray(this.db.subcategories)) this.db.subcategories = [];
      // Bổ sung các trường cấu hình MỚI còn thiếu từ mặc định (VD aiKnowledge) khi
      // database.json trên máy chủ được tạo trước bản cập nhật — tránh mất tính năng mới.
      this.db.config = Object.assign({}, global.KENIOS_DEFAULT_DB.config, this.db.config || {});
      this._mergeLocalOverrides();
      const savedSession = this._readLocal('session');
      if (savedSession && this.db.users.some((u) => u.userId === savedSession.userId)) {
        this.session = savedSession;
      }
      return this.db;
    },

    onChange(fn) {this._listeners.push(fn);},
    _emit() {this._listeners.forEach((fn) => {try {fn(this.db);} catch (e) {console.error(e);}});},

    async _loadDb() {
      // Ưu tiên api.php?action=get_db — endpoint này đã LỌC BỎ mật khẩu (băm), key thật
      // trong kho và token ngân hàng trước khi trả ra, nên an toàn cho khách. Chỉ khi
      // không có backend PHP (hosting tĩnh / mở bằng file://) mới đọc thẳng database.json.
      this._dbFromServer = false; // true nếu tải được từ máy chủ (get_db) — dữ liệu tiền thật
      // Fetch có GIỚI HẠN THỜI GIAN: trình duyệt trong app (Telegram/Zalo) hay mạng yếu
      // có thể mở kết nối nhưng không trả về, khiến trang kẹt mãi ở màn hình chờ. Sau
      // 12s coi như thất bại và chuyển sang phương án dự phòng.
      const fetchWithTimeout = async (url, ms = 12000) => {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), ms);
        try {return await fetch(url, { cache: 'no-store', signal: ctrl.signal });} finally
        {clearTimeout(timer);}
      };
      try {
        const res = await fetchWithTimeout(`api.php?action=get_db&t=${Date.now()}`);
        if (res.ok) {
          const json = await res.json();
          if (json && json.config) {this._dbFromServer = true;return json;}
        }
      } catch (e) {/* thử tiếp database.json */}
      try {
        const res = await fetchWithTimeout(`database.json?v=${Date.now()}`);
        if (res.ok) {
          const json = await res.json();
          if (json && json.config) return json;
        }
      } catch (e) {
        console.warn('Không tải được dữ liệu, dùng dữ liệu mặc định.', e);
      }
      return JSON.parse(JSON.stringify(global.KENIOS_DEFAULT_DB));
    },

    _mergeLocalOverrides() {
      // CHỈ áp bản ghi đè cục bộ khi có thay đổi CHƯA đồng bộ lên server. Nếu không
      // (bản cũ / đã đồng bộ rồi), LUÔN ưu tiên dữ liệu server — tránh bản localStorage
      // cũ đè lên khiến media/dịch vụ mới vừa lưu trên server không hiện lại.
      if (!this._readLocal('overrides_dirty')) return;
      const local = this._readLocal('overrides');
      if (!local) return;
      const fromServer = !!this._dbFromServer;
      // Khi tải được từ MÁY CHỦ: số dư, danh sách người dùng và đơn hàng LẤY THEO SERVER
      // (mọi thao tác tiền: mua hàng, nạp, admin cộng/trừ, đăng ký... đều ghi thẳng server),
      // nên admin và khách luôn thấy đúng số dư còn lại + đủ user sau khi tải lại trang.
      // Chỉ giữ lại các thứ admin chỉnh CỤC BỘ chưa đồng bộ: sản phẩm, danh mục, thư viện,
      // cấu hình — và vai trò/trạng thái người dùng. Chế độ demo (không backend) giữ nguyên
      // toàn bộ bản cục bộ như trước.
      const localArrays = fromServer ?
      ['categories', 'subcategories', 'services', 'media'] :
      ['users', 'orders', 'transactions', 'categories', 'subcategories', 'services', 'media'];
      const serverUsers = Array.isArray(this.db.users) ? this.db.users : [];
      localArrays.forEach((key) => {
        if (Array.isArray(local[key])) this.db[key] = local[key];
      });
      if (fromServer && Array.isArray(local.users)) {
        // Nền là user từ server (đúng số dư + đủ user); phủ lại vai trò/trạng thái đã
        // chỉnh cục bộ chưa đồng bộ để không mất thao tác đổi vai trò/khóa của admin.
        const localById = {};
        local.users.forEach((u) => {if (u && u.userId) localById[u.userId] = u;});
        this.db.users = serverUsers.map((su) => {
          const lu = su && su.userId ? localById[su.userId] : null;
          return lu ? Object.assign({}, su, { role: lu.role, status: lu.status }) : su;
        });
      }
      if (local.config) Object.assign(this.db.config, local.config);
    },

    _persistOverrides() {
      this._writeLocal('overrides', {
        users: this.db.users,
        orders: this.db.orders,
        transactions: this.db.transactions,
        categories: this.db.categories,
        subcategories: this.db.subcategories,
        services: this.db.services,
        media: this.db.media,
        config: this.db.config
      });
      this._writeLocal('overrides_dirty', 1); // đánh dấu có thay đổi chưa đồng bộ
    },
    _clearLocalOverrides() {
      try {
        localStorage.removeItem(`${LS_KEY}:overrides`);
        localStorage.removeItem(`${LS_KEY}:overrides_dirty`);
      } catch (e) {/* ignore */}
    },

    _readLocal(key) {
      try {return JSON.parse(localStorage.getItem(`${LS_KEY}:${key}`));} catch {return null;}
    },
    _writeLocal(key, val) {
      try {localStorage.setItem(`${LS_KEY}:${key}`, JSON.stringify(val));} catch {/* ignore */}
    },

    async _callApi(action, payload) {
      let res;
      try {
        res = await fetch(`${API_URL}?action=${action}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload || {})
        });
      } catch (e) {
        throw new BackendUnavailableError();
      }
      let json;
      try {json = await res.json();} catch (e) {throw new BackendUnavailableError();}
      if (!json || typeof json.status === 'undefined') throw new BackendUnavailableError();
      return json;
    },

    // ---- Tài khoản ----
    currentUser() {
      if (!this.session) return null;
      return this.db.users.find((u) => u.userId === this.session.userId) || null;
    },

    isAdmin() {
      const u = this.currentUser();
      return !!u && u.role === 'admin';
    },

    async register(username, password, contact) {
      username = (username || '').trim();
      contact = (contact || '').trim();
      if (!username || (password || '').length < 6) {
        throw new Error('Tên đăng nhập không hợp lệ hoặc mật khẩu quá ngắn (tối thiểu 6 ký tự).');
      }
      try {
        const result = await this._callApi('register', { username, password, contact });
        this.serverAvailable = true;
        if (result.status !== 'success') throw new Error(result.message || 'Đăng ký thất bại.');
        this._upsertUser(result.user);
        this._setSession(result.user.userId, result.token);
        return result.user;
      } catch (err) {
        if (err instanceof BackendUnavailableError) {
          this.serverAvailable = false;
          return this._localRegister(username, password, contact);
        }
        throw err;
      }
    },

    async resetPassword(username, contact, newPassword) {
      const result = await this._callApi('reset_password', { username, contact, newPassword });
      if (result.status !== 'success') throw new Error(result.message || 'Không đặt lại được mật khẩu.');
      return true;
    },

    async login(username, password) {
      username = (username || '').trim();
      try {
        const result = await this._callApi('login', { username, password });
        this.serverAvailable = true;
        if (result.status !== 'success') throw new Error(result.message || 'Sai tên đăng nhập hoặc mật khẩu.');
        this._upsertUser(result.user);
        this._setSession(result.user.userId, result.token);
        return result.user;
      } catch (err) {
        if (err instanceof BackendUnavailableError) {
          this.serverAvailable = false;
          return this._localLogin(username, password);
        }
        throw err;
      }
    },

    // Đăng nhập bằng Google: gửi ID token (credential) lên server để xác thực thật
    // với Google rồi mới tạo/đăng nhập tài khoản. Chỉ hoạt động khi có backend PHP.
    async changePassword(currentPassword, newPassword) {
      const user = this.currentUser();
      if (!user) throw new Error('Bạn cần đăng nhập.');
      if ((newPassword || '').length < 6) throw new Error('Mật khẩu mới tối thiểu 6 ký tự.');
      try {
        const result = await this._callApi('change_password', {
          username: user.username, currentPassword, newPassword
        });
        if (result.status !== 'success') throw new Error(result.message || 'Đổi mật khẩu thất bại.');
        return true;
      } catch (err) {
        if (err instanceof BackendUnavailableError) {
          if (user.password !== undefined && user.password !== currentPassword) throw new Error('Mật khẩu hiện tại không đúng.');
          user.password = newPassword;
          this._persistOverrides();
          return true;
        }
        throw err;
      }
    },

    async loginWithGoogle(credential) {
      const result = await this._callApi('google_login', { credential });
      if (result.status !== 'success') throw new Error(result.message || 'Đăng nhập Google thất bại.');
      this._upsertUser(result.user);
      this._setSession(result.user.userId, result.token);
      return result.user;
    },

    // Chế độ demo cục bộ (không có máy chủ PHP): kiểm tra trực tiếp trong dữ liệu đã tải.
    _localRegister(username, password, contact) {
      if (this.db.users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
        throw new Error('Tên đăng nhập đã tồn tại.');
      }
      const user = {
        userId: String(Date.now()),
        username, password, contact: contact || '', balance: 0, role: 'member', status: 'active',
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(username)}`,
        createdAt: new Date().toISOString().slice(0, 10)
      };
      this.db.users.push(user);
      this._persistOverrides();
      this._setSession(user.userId);
      return user;
    },

    _localLogin(username, password) {
      const user = this.db.users.find((u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
      if (!user) throw new Error('Sai tên đăng nhập hoặc mật khẩu.');
      if (user.status !== 'active') throw new Error('Tài khoản đã bị khóa.');
      this._setSession(user.userId);
      return user;
    },

    _upsertUser(safeUser) {
      const idx = this.db.users.findIndex((u) => u.userId === safeUser.userId);
      if (idx >= 0) this.db.users[idx] = Object.assign({}, this.db.users[idx], safeUser);else
      this.db.users.push(safeUser);
      this._persistOverrides();
    },

    _setSession(userId, token) {
      this.session = { userId, token: token || null };
      this._writeLocal('session', this.session);
      this._emit();
    },

    // Mã phiên đăng nhập (do máy chủ cấp khi đăng nhập) — dùng để xác thực mua hàng mà
    // KHÔNG cần nhập lại mật khẩu, đồng thời chặn người khác giả mạo userId để mua hộ.
    currentToken() {return this.session && this.session.token || '';},

    logout() {
      this.session = null;
      this._writeLocal('session', null);
      this._emit();
    },

    // ---- Giao dịch ----
    // Tính tiền khuyến mãi cộng thêm khi nạp `amount` (đọc cấu hình khuyến mãi).
    // Trả về 0 nếu tắt khuyến mãi / chưa đạt mức tối thiểu / cấu hình không hợp lệ.
    depositBonusFor(amount) {
      const c = this.db.config || {};
      if (!c.depositBonusEnabled) return 0;
      const percent = parseFloat(c.depositBonusPercent) || 0;
      const min = parseInt(c.depositBonusMin, 10) || 0;
      if (percent <= 0) return 0;
      if (amount < min) return 0;
      return Math.floor(amount * percent / 100);
    },

    // Tìm mã giảm giá đang bật khớp với chuỗi khách nhập (không phân biệt hoa thường / khoảng trắng).
    findDiscountCode(codeStr) {
      const code = (codeStr || '').trim().toUpperCase();
      if (!code) return null;
      const list = this.db.config.discountCodes || [];
      return list.find((d) => d && d.enabled !== false && (d.code || '').trim().toUpperCase() === code) || null;
    },

    // Tính giá sau khi áp mã giảm giá cho 1 mức giá gốc, có kiểm tra các điều kiện nâng cao:
    // hạn sử dụng (expiresAt), giới hạn lượt dùng (maxUses/usedCount), đơn tối thiểu (minOrder),
    // giới hạn danh mục (categoryId). opts.categoryId = danh mục của sản phẩm đang mua.
    // Trả về { valid, price, discount, reason }: price là giá phải trả sau giảm (>= 0).
    applyDiscountToPrice(price, codeStr, opts = {}) {
      const raw = (codeStr || '').trim();
      if (!raw) return { valid: false, price, discount: 0, reason: '' };
      const d = this.findDiscountCode(raw);
      if (!d) return { valid: false, price, discount: 0, reason: 'Mã giảm giá không đúng hoặc đã hết hiệu lực.' };
      // Hạn sử dụng
      if (d.expiresAt) {
        const exp = Date.parse(d.expiresAt);
        if (!isNaN(exp) && Date.now() > exp) return { valid: false, price, discount: 0, reason: 'Mã giảm giá đã hết hạn sử dụng.' };
      }
      // Giới hạn lượt dùng (tổng chung)
      const maxUses = parseInt(d.maxUses, 10) || 0;
      if (maxUses > 0 && (parseInt(d.usedCount, 10) || 0) >= maxUses) {
        return { valid: false, price, discount: 0, reason: 'Mã giảm giá đã hết lượt sử dụng.' };
      }
      // Giới hạn số lần MỖI NGƯỜI (maxUsesPerUser): đếm số đơn của chính khách đã dùng mã này.
      const maxPerUser = parseInt(d.maxUsesPerUser, 10) || 0;
      if (maxPerUser > 0) {
        const me = this.currentUser();
        if (me) {
          const codeUp = (d.code || raw).trim().toUpperCase();
          const usedByMe = (this.db.orders || []).filter((o) => o && o.userId === me.userId && String(o.discountCode || '').trim().toUpperCase() === codeUp).length;
          if (usedByMe >= maxPerUser) {
            return { valid: false, price, discount: 0, reason: `Bạn đã dùng mã này đủ ${maxPerUser} lần cho phép.` };
          }
        }
      }
      // Giới hạn SỐ TÀI KHOẢN được dùng (maxUsers): số tài khoản khác nhau đã dùng mã.
      const maxUsers = parseInt(d.maxUsers, 10) || 0;
      if (maxUsers > 0) {
        const me = this.currentUser();
        const codeUp = (d.code || raw).trim().toUpperCase();
        const set = new Set();
        let mePresent = false;
        (this.db.orders || []).forEach((o) => {
          if (o && String(o.discountCode || '').trim().toUpperCase() === codeUp) {
            set.add(o.userId);
            if (me && o.userId === me.userId) mePresent = true;
          }
        });
        if (!mePresent && set.size >= maxUsers) {
          return { valid: false, price, discount: 0, reason: `Mã chỉ dành cho ${maxUsers} tài khoản (đã đủ số người dùng).` };
        }
      }
      // Đơn tối thiểu
      const minOrder = parseInt(d.minOrder, 10) || 0;
      if (minOrder > 0 && price < minOrder) {
        return { valid: false, price, discount: 0, reason: `Mã chỉ áp dụng cho đơn từ ${minOrder.toLocaleString('vi-VN')}đ.` };
      }
      // Giới hạn danh mục
      if (d.categoryId && opts.categoryId && d.categoryId !== opts.categoryId) {
        return { valid: false, price, discount: 0, reason: 'Mã giảm giá không áp dụng cho sản phẩm này.' };
      }
      let discount = d.type === 'percent' ?
      Math.floor(price * (parseFloat(d.value) || 0) / 100) :
      Math.floor(parseFloat(d.value) || 0);
      discount = Math.max(0, Math.min(discount, price)); // không giảm quá giá gốc
      return { valid: true, price: price - discount, discount, reason: '', code: (d.code || raw).trim().toUpperCase(), type: d.type, value: d.value };
    },

    // Ghi nhận 1 lượt sử dụng mã giảm giá (tăng usedCount) sau khi mua thành công ở chế độ demo.
    recordDiscountUse(codeStr) {
      const d = this.findDiscountCode(codeStr);
      if (d) {d.usedCount = (parseInt(d.usedCount, 10) || 0) + 1;this._persistOverrides();}
    },

    // ---- Flash Sale ----
    // Trạng thái flash sale hiện tại: { active, percent, endsAt, remainingMs, title }.
    flashSaleInfo() {
      const f = this.db.config && this.db.config.flashSale || {};
      const percent = parseFloat(f.percent) || 0;
      const end = f.endsAt ? Date.parse(f.endsAt) : NaN;
      const remainingMs = isNaN(end) ? 0 : end - Date.now();
      const active = !!f.enabled && percent > 0 && (!f.endsAt || remainingMs > 0);
      return { active, percent, endsAt: f.endsAt || '', remainingMs: Math.max(0, remainingMs), title: f.title || 'FLASH SALE' };
    },
    // Giá sau khi áp Flash Sale (giá niêm yết khi đang sale). Không sale thì trả nguyên giá.
    flashSalePrice(base) {
      const f = this.flashSaleInfo();
      if (!f.active) return base;
      return Math.max(0, base - Math.floor(base * f.percent / 100));
    },

    // ---- Hạng thành viên VIP ----
    // Tổng chi tiêu (tiền đã mua hàng) của 1 user — dùng để xét hạng VIP.
    userTotalSpent(user) {
      if (!user) return 0;
      return (this.db.orders || []).
      filter((o) => o.userId === user.userId).
      reduce((s, o) => s + (o.price || 0), 0);
    },
    // Hạng VIP cao nhất mà user đạt được (tổng chi tiêu >= minSpent). Trả null nếu chưa đạt hạng nào.
    vipTierFor(user) {
      const tiers = this.db.config && this.db.config.vipTiers || [];
      if (!tiers.length || !user) return null;
      const spent = this.userTotalSpent(user);
      const eligible = tiers.
      filter((t) => spent >= (parseInt(t.minSpent, 10) || 0)).
      sort((a, b) => (parseInt(b.minSpent, 10) || 0) - (parseInt(a.minSpent, 10) || 0));
      return eligible[0] || null;
    },

    // Tính chi tiết giá phải trả khi mua 1 gói: Flash Sale -> VIP -> Mã giảm giá.
    // Trả về { base, afterFlash, afterVip, final, flashPercent, vipPercent, vipName, code, codeDiscount, totalDiscount }.
    computePurchasePrice(service, pkg, discountCode, user) {
      user = user || this.currentUser();
      const base = pkg.price;
      const flash = this.flashSaleInfo();
      const afterFlash = this.flashSalePrice(base);
      const tier = this.vipTierFor(user);
      const vipPercent = tier ? parseFloat(tier.discountPercent) || 0 : 0;
      const vipCut = Math.floor(afterFlash * vipPercent / 100);
      const afterVip = Math.max(0, afterFlash - vipCut);
      const dc = this.applyDiscountToPrice(afterVip, discountCode, { categoryId: service ? service.categoryId : '' });
      const codeValid = dc.valid;
      const codeDiscount = codeValid ? dc.discount : 0;
      const final = Math.max(0, afterVip - codeDiscount);
      return {
        base, afterFlash, afterVip, final,
        flashPercent: flash.active ? flash.percent : 0,
        vipPercent, vipName: tier ? tier.name : '',
        code: codeValid ? dc.code : '', codeValid, codeReason: dc.reason || '',
        codeDiscount, totalDiscount: base - final
      };
    },

    deposit(amount, note) {
      const user = this.currentUser();
      if (!user) throw new Error('Bạn cần đăng nhập trước.');
      const bonus = this.depositBonusFor(amount);
      user.balance = (user.balance || 0) + amount + bonus;
      const baseNote = note || 'Nạp tiền qua VietQR';
      const desc = bonus > 0 ? `${baseNote} (+${bonus.toLocaleString('vi-VN')}đ khuyến mãi)` : baseNote;
      this.db.transactions.unshift({
        id: 'TX' + Date.now(), userId: user.userId, amount: amount + bonus, type: 'deposit',
        description: desc, date: new Date().toISOString()
      });
      this._persistOverrides();
      this._emit();
      this.processReferralReward(user.userId); // thưởng giới thiệu nếu là lần nạp đầu
    },

    // Kiểm tra giao dịch nạp tự động: bảo máy chủ kéo lịch sử ngân hàng từ ThueAPIBank
    // (poll_acb). Nếu máy chủ đã cộng tiền cho đúng mã nạp này (qua polling lần này hoặc
    // webhook trước đó), đồng bộ số dư mới từ máy chủ về máy khách.
    //   • Ném BackendUnavailableError khi KHÔNG có máy chủ PHP (nơi gọi rơi về demo cục bộ).
    //   • Trả { serverError:true } khi CÓ máy chủ nhưng bước gọi ngân hàng lỗi (KHÔNG được
    //     cộng tiền demo trong trường hợp này, tránh cộng tiền ảo khi bank API tạm lỗi).
    async checkAutoDeposit(note) {
      const res = await this._callApi('poll_acb', { note }); // BackendUnavailableError sẽ propagate ra ngoài
      if (!res || res.status !== 'success') {
        return { credited: false, serverError: true, message: res && res.message || 'Máy chủ chưa kiểm tra được giao dịch.' };
      }
      if (res.credited && res.balance !== null && res.balance !== undefined) {
        const user = this.currentUser();
        if (user) user.balance = res.balance;
        this._persistOverrides();
        this._emit();
        if (user) this.processReferralReward(user.userId); // thưởng giới thiệu nếu là lần nạp đầu
      }
      return { credited: !!res.credited, balance: res.balance };
    },

    // Nạp thẻ cào qua thesieure.com — gửi thẻ lên máy chủ; tiền cộng sau khi cổng duyệt
    // (callback card.php). Cần có backend PHP + đã cấu hình Partner ID/Key.
    async chargeCard(info) {
      const user = this.currentUser();
      if (!user) throw new Error('Bạn cần đăng nhập trước khi nạp thẻ.');
      const res = await this._callApi('card_charge', {
        userId: user.userId, token: this.currentToken(),
        telco: info.telco, amount: info.amount, serial: info.serial, code: info.code
      });
      return res;
    },

    // Kiểm tra trạng thái các thẻ đã nạp + đồng bộ số dư mới nhất (nếu callback đã cộng).
    async cardStatus() {
      const user = this.currentUser();
      if (!user) throw new Error('Bạn cần đăng nhập.');
      const res = await this._callApi('card_status', { userId: user.userId, token: this.currentToken() });
      if (res && res.status === 'success' && res.balance !== null && res.balance !== undefined) {
        if (user.balance !== res.balance) {user.balance = res.balance;this._persistOverrides();this._emit();}
      }
      return res;
    },

    // Gói có kho key thật (admin đã nhập key trong tab Dịch vụ) sẽ có field `keyCount`
    // (kể cả khi = 0). Với gói này, PHẢI mua qua máy chủ (redeemKeyOnServer) để rút
    // đúng 1 key thật + trừ số dư một cách xác thực, không dùng đường cũ (giả lập cục bộ).
    usesRealKeyStock(pkg) {
      return pkg && typeof pkg.keyCount === 'number';
    },

    // 1 gói còn bán được không: gói quản kho key thì phải còn key; gói không quản kho key
    // coi như còn hàng.
    pkgBuyable(pkg) {
      return !!pkg && (!this.usesRealKeyStock(pkg) || (pkg.keyCount || 0) > 0);
    },
    // Sản phẩm CÒN HÀNG thực tế: admin không đặt "hết hàng" VÀ còn ít nhất 1 gói bán được.
    // Dùng cho nhãn "Hết hàng" + khoá nút Mua để khách không bấm mua hụt.
    serviceInStock(service) {
      if (!service || service.status === 'outofstock') return false;
      const pkgs = service.packages || [];
      return pkgs.length > 0 && pkgs.some((p) => this.pkgBuyable(p));
    },

    // Hệ điều hành / nền tảng của sản phẩm = tên thư mục con (nếu có), ngược lại tên danh mục.
    serviceOs(service) {
      const sub = (this.db.subcategories || []).find((s) => s.id === service.subcategoryId);
      if (sub) return sub.name;
      const cat = this.db.categories.find((c) => c.id === service.categoryId);
      return cat ? cat.name : '';
    },

    async redeemKeyOnServer(username, password, service, pkg, discountCode) {
      const user = this.currentUser();
      const result = await this._callApi('redeem_key', {
        username, password, userId: user ? user.userId : '', token: this.currentToken(),
        serviceId: service.id, packageId: pkg.id,
        os: this.serviceOs(service), discountCode: (discountCode || '').trim()
      });
      if (result.status !== 'success') throw new Error(result.message || 'Mua hàng thất bại.');
      if (user) user.balance = result.balance;
      this.db.orders.unshift(result.order);
      // Giảm số key còn lại hiển thị (key đã bị rút khỏi kho trên máy chủ) để UI khớp ngay.
      const svc = this.db.services.find((s) => s.id === service.id);
      const p = svc && (svc.packages || []).find((x) => x.id === pkg.id);
      if (p && typeof p.keyCount === 'number') p.keyCount = Math.max(0, p.keyCount - 1);
      this._persistOverrides();
      this._emit();
      return result.order;
    },

    // Mua gói CHƯA có kho key thật NHƯNG QUA MÁY CHỦ: trừ số dư trực tiếp trên server
    // (bền vững) rồi đồng bộ số dư + đơn về client. Nhờ vậy bảng quản trị và lần đăng
    // nhập sau (kể cả khi khách đã xóa dữ liệu web) đều thấy số dư đã bị trừ đúng.
    async purchaseOnServer(service, pkg, discountCode) {
      const user = this.currentUser();
      if (!user) throw new Error('Bạn cần đăng nhập trước khi mua.');
      // Xem trước ĐÚNG key admin đã nhập trong kho (client) để gửi lên máy chủ giao
      // nguyên chuỗi — KHÔNG thêm đuôi. Chỉ rút hẳn khỏi kho SAU khi server nhận.
      const svc = this.db.services.find((s) => s.id === service.id);
      const livePkg = svc && (svc.packages || []).find((x) => x.id === pkg.id);
      const stock = livePkg && Array.isArray(livePkg.keys) ? livePkg.keys : Array.isArray(pkg.keys) ? pkg.keys : null;
      const chosenKey = stock && stock.length ? stock[0] : '';
      const result = await this._callApi('purchase', {
        userId: user.userId, username: user.username, token: this.currentToken(),
        serviceId: service.id, packageId: pkg.id,
        os: this.serviceOs(service), discountCode: (discountCode || '').trim(),
        key: chosenKey
      });
      if (result.status !== 'success') throw new Error(result.message || 'Mua hàng thất bại.');
      // Server đã nhận & giao đúng key thật -> rút key đó khỏi kho local để không phát lại.
      if (chosenKey && stock && stock[0] === chosenKey && result.order && result.order.key === chosenKey) {
        stock.shift();
      }
      user.balance = result.balance;
      this.db.orders.unshift(result.order);
      this._persistOverrides();
      this._emit();
      return result.order;
    },

    // Mua 1 gói (không có kho key thật): ưu tiên máy chủ để trừ số dư bền vững; chỉ khi
    // KHÔNG có backend PHP mới rơi về đường demo cục bộ (buyPackage) trên trình duyệt.
    async purchase(service, pkg, discountCode) {
      if (this.serverAvailable === false) return this.buyPackage(service, pkg, discountCode);
      try {
        const order = await this.purchaseOnServer(service, pkg, discountCode);
        this.serverAvailable = true;
        return order;
      } catch (err) {
        if (err instanceof BackendUnavailableError) {
          this.serverAvailable = false;
          return this.buyPackage(service, pkg, discountCode);
        }
        throw err;
      }
    },

    // Đường cũ (demo cục bộ): dùng cho các gói CHƯA cấu hình kho key thật, sinh key
    // giả lập ngay trên trình duyệt — giữ lại để không phá vỡ các dịch vụ demo hiện có.
    buyPackage(service, pkg, discountCode) {
      const user = this.currentUser();
      if (!user) throw new Error('Bạn cần đăng nhập trước khi mua.');
      const p = this.computePurchasePrice(service, pkg, discountCode, user);
      if (discountCode && discountCode.trim() && !p.codeValid) throw new Error(p.codeReason || 'Mã giảm giá không hợp lệ.');
      const finalPrice = p.final;
      if ((user.balance || 0) < finalPrice) throw new Error('Số dư không đủ. Vui lòng nạp thêm tiền.');
      // Phát ĐÚNG key admin đã nhập trong kho của gói (không thêm bất kỳ đuôi nào). KHÔNG
      // sinh key demo: hết key thì báo lỗi & KHÔNG trừ tiền.
      const svc = this.db.services.find((s) => s.id === service.id);
      const livePkg = svc && (svc.packages || []).find((x) => x.id === pkg.id);
      const stock = livePkg && Array.isArray(livePkg.keys) ? livePkg.keys : Array.isArray(pkg.keys) ? pkg.keys : null;
      if (!stock || !stock.length) throw new Error('Gói này tạm hết key trong kho, vui lòng liên hệ Admin.');
      const key = stock.shift(); // rút đúng 1 key thật khỏi kho, giữ nguyên chuỗi
      user.balance -= finalPrice;
      const purchaseDate = new Date().toISOString();
      const order = {
        id: 'DH' + Date.now(), userId: user.userId, serviceId: service.id,
        serviceName: service.name, packageName: pkg.name, price: finalPrice,
        originalPrice: pkg.price, discountCode: p.code, discountAmount: p.totalDiscount,
        flashPercent: p.flashPercent, vipPercent: p.vipPercent,
        os: this.serviceOs(service), key, date: purchaseDate,
        purchaseDate, expiryDate: computeExpiryISO(pkg.name, purchaseDate)
      };
      this.db.orders.unshift(order);
      const parts = [];
      if (p.flashPercent > 0) parts.push(`flash -${p.flashPercent}%`);
      if (p.vipPercent > 0) parts.push(`VIP -${p.vipPercent}%`);
      if (p.code) parts.push(`mã ${p.code}`);
      const desc = parts.length ?
      `Mua ${service.name} - ${pkg.name} (${parts.join(', ')} · giảm ${p.totalDiscount.toLocaleString('vi-VN')}đ)` :
      `Mua ${service.name} - ${pkg.name}`;
      this.db.transactions.unshift({
        id: 'TX' + Date.now(), userId: user.userId, amount: -finalPrice, type: 'purchase',
        description: desc, date: purchaseDate
      });
      if (p.code) this.recordDiscountUse(p.code);
      this._persistOverrides();
      this._emit();
      return order;
    },

    // ---- Combo sản phẩm ----
    combos() {return this.db.config && this.db.config.combos || [];},
    // Tổng giá gốc của các sản phẩm trong combo (để hiển thị mức tiết kiệm).
    comboOriginalPrice(combo) {
      return (combo.items || []).reduce((sum, it) => {
        const svc = this.db.services.find((s) => s.id === it.serviceId);
        const pkg = svc && (svc.packages || []).find((p) => p.id === it.packageId);
        return sum + (pkg ? pkg.price || 0 : 0);
      }, 0);
    },
    // Mua combo: trừ tiền 1 lần theo giá combo, phát key + tạo đơn cho TỪNG sản phẩm.
    buyCombo(comboId) {
      const user = this.currentUser();
      if (!user) throw new Error('Bạn cần đăng nhập trước khi mua.');
      const combo = this.combos().find((c) => c.id === comboId);
      if (!combo) throw new Error('Không tìm thấy combo.');
      const items = (combo.items || []).map((it) => {
        const service = this.db.services.find((s) => s.id === it.serviceId);
        const pkg = service && (service.packages || []).find((p) => p.id === it.packageId);
        return service && pkg ? { service, pkg } : null;
      }).filter(Boolean);
      if (!items.length) throw new Error('Combo chưa có sản phẩm hợp lệ.');
      const price = Number(combo.price) || 0;
      if ((user.balance || 0) < price) throw new Error('Số dư không đủ. Vui lòng nạp thêm tiền.');
      // Xác định kho key TỪNG sản phẩm trước; nếu 1 sản phẩm hết key thì báo lỗi & KHÔNG
      // trừ tiền. KHÔNG sinh key demo.
      const stocks = items.map(({ service, pkg }) => {
        const svc = this.db.services.find((s) => s.id === service.id);
        const livePkg = svc && (svc.packages || []).find((x) => x.id === pkg.id);
        return livePkg && Array.isArray(livePkg.keys) ? livePkg.keys : Array.isArray(pkg.keys) ? pkg.keys : null;
      });
      if (stocks.some((st) => !st || !st.length)) throw new Error('Một sản phẩm trong combo tạm hết key, vui lòng liên hệ Admin.');
      user.balance -= price;
      const now = new Date().toISOString();
      const orders = items.map(({ service, pkg }, i) => {
        // Phát đúng key admin đã nhập trong kho của gói (đã kiểm tra còn key ở trên).
        const key = stocks[i].shift();
        const order = {
          id: 'DH' + Date.now() + i, userId: user.userId, serviceId: service.id,
          serviceName: service.name, packageName: pkg.name, price: 0,
          comboId: combo.id, comboName: combo.name,
          os: this.serviceOs(service), key, date: now,
          purchaseDate: now, expiryDate: computeExpiryISO(pkg.name, now)
        };
        this.db.orders.unshift(order);
        return order;
      });
      this.db.transactions.unshift({
        id: 'TX' + Date.now(), userId: user.userId, amount: -price, type: 'purchase',
        description: `Mua combo "${combo.name}" (${items.length} sản phẩm)`, date: now
      });
      this._persistOverrides();
      this._emit();
      return orders;
    },
    // Mua combo qua MÁY CHỦ (trừ số dư bền vững). Chỉ rơi về buyCombo cục bộ khi không
    // có backend PHP. Đồng bộ số dư + các đơn mới về client sau khi server xử lý xong.
    async purchaseComboOnServer(comboId) {
      const user = this.currentUser();
      if (!user) throw new Error('Bạn cần đăng nhập trước khi mua.');
      // Gom ĐÚNG key admin đã nhập trong kho (client) cho từng sản phẩm để giao nguyên
      // chuỗi — không thêm đuôi — khi máy chủ chưa có kho key của gói đó.
      const combo = this.combos().find((c) => c.id === comboId);
      const itemKeys = {};
      if (combo) {
        (combo.items || []).forEach((it) => {
          const svc = this.db.services.find((s) => s.id === it.serviceId);
          const p = svc && (svc.packages || []).find((x) => x.id === it.packageId);
          const stock = p && Array.isArray(p.keys) ? p.keys : null;
          const mapKey = it.serviceId + '::' + it.packageId;
          if (stock && stock.length && !(mapKey in itemKeys)) itemKeys[mapKey] = stock[0];
        });
      }
      const result = await this._callApi('purchase_combo', {
        userId: user.userId, username: user.username, token: this.currentToken(), comboId, itemKeys
      });
      if (result.status !== 'success') throw new Error(result.message || 'Mua combo thất bại.');
      user.balance = result.balance;
      (result.orders || []).forEach((o) => this.db.orders.unshift(o));
      // Rút khỏi kho local những key thật vừa được giao (khớp đầu kho) + giảm keyCount hiển thị.
      (result.orders || []).forEach((o) => {
        const svc = this.db.services.find((s) => s.id === o.serviceId);
        const p = svc && (svc.packages || []).find((x) => x.name === o.packageName);
        if (!p) return;
        if (Array.isArray(p.keys) && p.keys.length && p.keys[0] === o.key) p.keys.shift();
        if (typeof p.keyCount === 'number' && p.keyCount > 0) p.keyCount -= 1;
      });
      this._persistOverrides();
      this._emit();
      return result.orders || [];
    },

    async purchaseCombo(comboId) {
      if (this.serverAvailable === false) return this.buyCombo(comboId);
      try {
        const orders = await this.purchaseComboOnServer(comboId);
        this.serverAvailable = true;
        return orders;
      } catch (err) {
        if (err instanceof BackendUnavailableError) {
          this.serverAvailable = false;
          return this.buyCombo(comboId);
        }
        throw err;
      }
    },

    adminSaveCombo(data) {
      if (!this.db.config.combos) this.db.config.combos = [];
      const list = this.db.config.combos;
      const items = (data.items || []).filter((it) => it.serviceId && it.packageId);
      if (!data.name || !data.name.trim()) throw new Error('Vui lòng nhập tên combo.');
      if (!items.length) throw new Error('Combo cần ít nhất 1 sản phẩm (đã chọn cả gói).');
      if (data.id) {
        const idx = list.findIndex((c) => c.id === data.id);
        if (idx !== -1) list[idx] = { ...list[idx], name: data.name.trim(), price: data.price, description: data.description, image: data.image, items };
      } else {
        list.unshift({ id: 'CB' + Date.now(), name: data.name.trim(), price: data.price, description: data.description, image: data.image, items });
      }
      this._persistOverrides();
      this._emit();
    },
    adminDeleteCombo(id) {
      if (!this.db.config.combos) return;
      this.db.config.combos = this.db.config.combos.filter((c) => c.id !== id);
      this._persistOverrides();
      this._emit();
    },

    myOrders() {
      const user = this.currentUser();
      if (!user) return [];
      return this.db.orders.filter((o) => o.userId === user.userId);
    },

    // ---- Đánh giá sản phẩm ----
    reviewsFor(serviceId) {
      return (this.db.reviews || []).filter((r) => r.serviceId === serviceId).
      sort((a, b) => (Date.parse(b.date) || 0) - (Date.parse(a.date) || 0));
    },
    avgRating(serviceId) {
      const rs = this.reviewsFor(serviceId);
      if (!rs.length) return 0;
      return rs.reduce((s, r) => s + (parseInt(r.rating, 10) || 0), 0) / rs.length;
    },
    ratingCount(serviceId) {return this.reviewsFor(serviceId).length;},
    // Khách đã mua sản phẩm này chưa (điều kiện để được đánh giá).
    hasPurchased(serviceId) {
      const user = this.currentUser();
      if (!user) return false;
      return (this.db.orders || []).some((o) => o.userId === user.userId && o.serviceId === serviceId);
    },
    // Đánh giá của chính user hiện tại cho 1 sản phẩm (nếu đã đánh giá).
    myReviewFor(serviceId) {
      const user = this.currentUser();
      if (!user) return null;
      return (this.db.reviews || []).find((r) => r.serviceId === serviceId && r.userId === user.userId) || null;
    },
    addReview(serviceId, rating, text) {
      const user = this.currentUser();
      if (!user) throw new Error('Bạn cần đăng nhập để đánh giá.');
      if (!this.hasPurchased(serviceId)) throw new Error('Chỉ khách đã mua sản phẩm mới được đánh giá.');
      rating = Math.max(1, Math.min(5, parseInt(rating, 10) || 0));
      if (!this.db.reviews) this.db.reviews = [];
      // Mỗi user 1 đánh giá / sản phẩm — có thì cập nhật, chưa có thì thêm mới.
      const existing = this.db.reviews.find((r) => r.serviceId === serviceId && r.userId === user.userId);
      if (existing) {
        existing.rating = rating;existing.text = (text || '').trim();existing.date = new Date().toISOString();
      } else {
        this.db.reviews.unshift({
          id: 'RV' + Date.now(), serviceId, userId: user.userId, username: user.username,
          rating, text: (text || '').trim(), date: new Date().toISOString()
        });
      }
      this._persistOverrides();
      this._emit();
      // Cố gắng lưu lên máy chủ (nếu có backend) để mọi khách cùng thấy.
      this._callApi('add_review', { serviceId, userId: user.userId, username: user.username, rating, text: (text || '').trim() }).
      catch(() => {});
    },
    // ---- Giới thiệu bạn bè ----
    // Sinh & lưu mã giới thiệu cố định cho 1 user (nếu chưa có).
    ensureRefCode(user) {
      if (!user) return '';
      if (!user.refCode) {
        // Mã theo TÊN khách cho dễ nhớ & gắn thương hiệu: KENIOS-<TÊN>. Bỏ dấu,
        // in hoa, chỉ giữ chữ/số. Nếu trùng (tên rút gọn giống nhau) thì thêm số.
        const clean = (user.username || '').
        normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').
        toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 14);
        const base = 'KENIOS-' + (clean || Math.random().toString(36).slice(2, 7).toUpperCase());
        let code = base,n = 1;
        while (this.db.users.some((u) => u !== user && (u.refCode || '') === code)) {
          n++;code = base + n;
        }
        user.refCode = code;
        this._persistOverrides();
      }
      return user.refCode;
    },
    findByRefCode(code) {
      code = (code || '').trim().toUpperCase();
      if (!code) return null;
      return this.db.users.find((u) => (u.refCode || '').toUpperCase() === code) || null;
    },
    // Gắn người giới thiệu cho tài khoản vừa tạo (gọi sau khi đăng ký).
    applyReferralCode(refereeUserId, code) {
      if (this.db.config.referralEnabled === false) return;
      const referee = this.db.users.find((u) => u.userId === refereeUserId);
      const referrer = this.findByRefCode(code);
      if (!referee || !referrer || referrer.userId === referee.userId) return;
      if (referee.referredBy) return; // đã có người giới thiệu
      referee.referredBy = referrer.refCode;
      this._persistOverrides();this._emit();
    },
    // Thưởng khi người được giới thiệu NẠP TIỀN lần đầu — cả 2 bên +referralBonus.
    processReferralReward(refereeUserId) {
      const cfg = this.db.config;
      if (cfg.referralEnabled === false) return;
      const bonus = Number(cfg.referralBonus) || 0;
      const referee = this.db.users.find((u) => u.userId === refereeUserId);
      if (!referee || referee.referralRewarded || !referee.referredBy) return;
      const referrer = this.findByRefCode(referee.referredBy);
      referee.referralRewarded = true; // đánh dấu để chỉ thưởng 1 lần dù có tìm thấy người mời hay không
      if (bonus > 0 && referrer && referrer.userId !== referee.userId) {
        referee.balance = (referee.balance || 0) + bonus;
        referrer.balance = (referrer.balance || 0) + bonus;
        const now = new Date().toISOString();
        this.db.transactions.unshift({ id: 'TXR' + Date.now(), userId: referee.userId, amount: bonus, type: 'referral', description: 'Thưởng giới thiệu (bạn được mời)', date: now });
        this.db.transactions.unshift({ id: 'TXR' + (Date.now() + 1), userId: referrer.userId, amount: bonus, type: 'referral', description: 'Thưởng giới thiệu bạn ' + (referee.username || ''), date: now });
      }
      this._persistOverrides();this._emit();
    },
    // Thống kê giới thiệu của user hiện tại.
    myReferralStats() {
      const user = this.currentUser();
      if (!user) return null;
      const code = this.ensureRefCode(user);
      const invited = this.db.users.filter((u) => u.referredBy === code);
      const earned = (this.db.transactions || []).
      filter((t) => t.userId === user.userId && t.type === 'referral').
      reduce((s, t) => s + (t.amount || 0), 0);
      return { code, count: invited.length, earned };
    },

    // ============================================================
    // ADMIN — chỉnh sửa dịch vụ / danh mục / người dùng / cấu hình.
    // Mọi thay đổi được lưu cục bộ ngay lập tức; nút "Đồng bộ lên máy chủ"
    // trong bảng quản trị mới thực sự ghi vào database.json qua api.php.
    // ============================================================
    adminSaveService(service) {
      const idx = this.db.services.findIndex((s) => s.id === service.id);
      if (idx >= 0) this.db.services[idx] = service;else
      this.db.services.push(service);
      this._persistOverrides();
      this._emit();
    },

    adminDeleteService(id) {
      this.db.services = this.db.services.filter((s) => s.id !== id);
      this._persistOverrides();
      this._emit();
    },

    adminSaveCategory(category) {
      const idx = this.db.categories.findIndex((c) => c.id === category.id);
      if (idx >= 0) this.db.categories[idx] = category;else
      this.db.categories.push(category);
      this._persistOverrides();
      this._emit();
    },

    adminDeleteCategory(id) {
      if (this.db.services.some((s) => s.categoryId === id)) {
        throw new Error('Không thể xóa danh mục đang có dịch vụ. Hãy xóa hoặc chuyển dịch vụ trước.');
      }
      if ((this.db.subcategories || []).some((sc) => sc.categoryId === id)) {
        throw new Error('Không thể xóa danh mục đang có thư mục con. Hãy xóa các thư mục con trước.');
      }
      this.db.categories = this.db.categories.filter((c) => c.id !== id);
      this._persistOverrides();
      this._emit();
    },

    adminSaveSubcategory(sub) {
      if (!this.db.subcategories) this.db.subcategories = [];
      const idx = this.db.subcategories.findIndex((s) => s.id === sub.id);
      if (idx >= 0) this.db.subcategories[idx] = sub;else
      this.db.subcategories.push(sub);
      this._persistOverrides();
      this._emit();
    },

    adminDeleteSubcategory(id) {
      if (this.db.services.some((s) => s.subcategoryId === id)) {
        throw new Error('Không thể xóa thư mục con đang có sản phẩm. Hãy xóa hoặc chuyển sản phẩm trước.');
      }
      this.db.subcategories = (this.db.subcategories || []).filter((s) => s.id !== id);
      this._persistOverrides();
      this._emit();
    },

    adminUpdateConfig(patch) {
      Object.assign(this.db.config, patch);
      this._persistOverrides();
      this._emit();
    },

    // Cộng/trừ số dư — bản CỤC BỘ (khi không có máy chủ / chưa nhớ mật khẩu admin).
    adminAdjustBalance(userId, delta) {
      const user = this.db.users.find((u) => u.userId === userId);
      if (!user) throw new Error('Không tìm thấy người dùng.');
      user.balance = Math.max(0, (user.balance || 0) + delta);
      this._persistOverrides();
      this._emit();
    },

    // Cộng/trừ số dư NGAY TRÊN MÁY CHỦ (bền vững — khách thấy tiền liền, không cần bấm
    // "Đồng bộ"). delta > 0 là cộng, < 0 là trừ.
    async adminAdjustBalanceServer(userId, delta, adminUser, adminPass) {
      try {
        const r = await fetch(`${API_URL}?action=admin_adjust_balance`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Admin-User': adminUser, 'X-Admin-Pass': adminPass },
          body: JSON.stringify({ userId, delta })
        });
        const json = await r.json();
        if (json && json.status === 'success') {
          const user = this.db.users.find((u) => u.userId === userId);
          if (user) user.balance = json.balance;
          this._persistOverrides();
          this._emit();
        }
        return json;
      } catch (e) {return { status: 'error', message: 'Không kết nối được máy chủ.' };}
    },

    // Admin hoàn tiền 1 đơn hàng (server): cộng lại giá đơn cho khách + đánh dấu đã hoàn.
    async adminRefundOrder(orderId, adminUser, adminPass) {
      try {
        const r = await fetch(`${API_URL}?action=admin_refund_order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Admin-User': adminUser, 'X-Admin-Pass': adminPass },
          body: JSON.stringify({ orderId })
        });
        const json = await r.json();
        if (json && json.status === 'success') {
          const o = this.db.orders.find((x) => x.id === orderId);
          if (o) {
            o.refunded = true;
            const u = this.db.users.find((x) => x.userId === o.userId);
            if (u) u.balance = json.balance;
          }
          this._persistOverrides();
          this._emit();
        }
        return json;
      } catch (e) {return { status: 'error', message: 'Không kết nối được máy chủ.' };}
    },

    // Xóa người dùng — bản CỤC BỘ (dự phòng khi không có máy chủ).
    adminDeleteUser(userId) {
      const user = this.db.users.find((u) => u.userId === userId);
      if (!user) throw new Error('Không tìm thấy người dùng.');
      if (user.role === 'admin') throw new Error('Không thể xóa tài khoản quản trị.');
      const me = this.currentUser();
      if (me && me.userId === userId) throw new Error('Không thể tự xóa tài khoản của chính bạn.');
      this.db.users = this.db.users.filter((u) => u.userId !== userId);
      this._persistOverrides();
      this._emit();
    },

    // Xóa người dùng NGAY TRÊN MÁY CHỦ (xóa hẳn, không hiện lại khi tải trang).
    async adminDeleteUserServer(userId, adminUser, adminPass) {
      try {
        const r = await fetch(`${API_URL}?action=admin_delete_user`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Admin-User': adminUser, 'X-Admin-Pass': adminPass },
          body: JSON.stringify({ userId })
        });
        const json = await r.json();
        if (json && json.status === 'success') {
          this.db.users = this.db.users.filter((u) => u.userId !== userId);
          this._persistOverrides();
          this._emit();
        }
        return json;
      } catch (e) {return { status: 'error', message: 'Không kết nối được máy chủ.' };}
    },

    adminSetUserStatus(userId, status) {
      const user = this.db.users.find((u) => u.userId === userId);
      if (!user) throw new Error('Không tìm thấy người dùng.');
      if (user.role === 'admin') throw new Error('Không thể khóa tài khoản quản trị.');
      user.status = status;
      this._persistOverrides();
      this._emit();
    },

    // Đặt vai trò: 'member' | 'ctv' (cộng tác viên) | 'admin'.
    adminSetRole(userId, role) {
      const valid = ['member', 'ctv', 'admin'];
      if (!valid.includes(role)) return;
      const user = this.db.users.find((u) => u.userId === userId);
      if (!user) throw new Error('Không tìm thấy người dùng.');
      const me = this.currentUser();
      if (me && me.userId === userId && me.role === 'admin' && role !== 'admin') {
        throw new Error('Không thể tự hạ vai trò admin của chính bạn (tránh tự khóa mình khỏi quản trị).');
      }
      user.role = role;
      this._persistOverrides();
      this._emit();
    },
    // Quyền mở trang quản trị: admin (đầy đủ) hoặc CTV (giới hạn).
    canAccessAdmin() {const u = this.currentUser();return !!u && (u.role === 'admin' || u.role === 'ctv');},
    isCtv() {const u = this.currentUser();return !!u && u.role === 'ctv';},

    adminAddMedia(item) {
      if (!this.db.media) this.db.media = [];
      this.db.media.unshift(item);
      this._persistOverrides();
      this._emit();
    },

    adminDeleteMedia(id) {
      this.db.media = (this.db.media || []).filter((m) => m.id !== id);
      this._persistOverrides();
      this._emit();
    },

    // Upload file thật lên server (chỉ hoạt động khi có backend PHP với thư mục uploads/ ghi được).
    async uploadFile(file) {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API_URL}?action=upload_file`, { method: 'POST', body: fd });
      let json;
      try {json = await res.json();} catch (e) {throw new Error('Không có máy chủ PHP để tải file lên (chế độ demo cục bộ không hỗ trợ upload).');}
      if (json.status !== 'success') throw new Error(json.message || 'Tải file thất bại.');
      return json.url;
    },

    // Khách tự đổi ảnh đại diện của MÌNH — lưu bền vững trên máy chủ (theo userId).
    async updateAvatar(url) {
      const user = this.currentUser();
      if (!user) throw new Error('Bạn cần đăng nhập.');
      url = (url || '').trim();
      if (!url) throw new Error('Chưa có ảnh để cập nhật.');
      try {
        const res = await this._callApi('update_avatar', { userId: user.userId, token: this.currentToken(), avatar: url });
        if (res.status !== 'success') throw new Error(res.message || 'Không đổi được ảnh đại diện.');
        user.avatar = res.avatar || url;
      } catch (e) {
        if (!(e instanceof BackendUnavailableError)) throw e;
        user.avatar = url; // chế độ demo không có máy chủ: đổi cục bộ
      }
      this._persistOverrides();
      this._emit();
      return user.avatar;
    },

    // Tải lại toàn bộ kho key thật (packages[].keys) cho tab Dịch vụ — máy chủ chỉ trả
    // key thật khi xác thực đúng tài khoản admin, tránh lộ key cho khách vãng lai.
    async fetchFullServiceKeys(adminUser, adminPass) {
      const res = await fetch(`${API_URL}?action=get_db&t=${Date.now()}`, {
        headers: { 'X-Admin-User': adminUser, 'X-Admin-Pass': adminPass }
      });
      const json = await res.json();
      if (!json || !Array.isArray(json.services)) throw new Error('Không tải được dữ liệu từ máy chủ.');
      const hasKeys = json.services.some((s) => (s.packages || []).some((p) => Array.isArray(p.keys)));
      if (!hasKeys) throw new Error('Sai mật khẩu admin hoặc chưa có kho key nào.');
      this.db.services = json.services;
      this._persistOverrides();
      this._emit();
    },

    async secretsStatus(adminUser, adminPass) {
      const res = await fetch(`${API_URL}?action=secrets_status`, {
        headers: { 'X-Admin-User': adminUser, 'X-Admin-Pass': adminPass }
      });
      return await res.json();
    },

    async saveSecrets(adminUser, adminPass, patch) {
      const res = await fetch(`${API_URL}?action=save_secrets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-User': adminUser, 'X-Admin-Pass': adminPass },
        body: JSON.stringify(patch)
      });
      return await res.json();
    },

    // Gửi tin nhắn Telegram thử để admin kiểm tra cấu hình.
    async testTelegram(adminUser, adminPass) {
      try {
        const res = await fetch(`${API_URL}?action=test_telegram`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Admin-User': adminUser, 'X-Admin-Pass': adminPass },
          body: '{}'
        });
        return await res.json();
      } catch (e) {return { status: 'error', message: 'Không kết nối được máy chủ.' };}
    },

    // ---- Đồng bộ Admin lên máy chủ (chỉ hoạt động khi có backend PHP) ----
    async trySaveToServer(adminUser, adminPass) {
      try {
        const res = await fetch(`${API_URL}?action=save_db`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Admin-User': adminUser, 'X-Admin-Pass': adminPass },
          body: JSON.stringify(this.db)
        });
        const json = await res.json();
        // Đồng bộ THÀNH CÔNG → toàn bộ dữ liệu (kể cả Thư viện/Tạo Link) đã nằm trên
        // server. Xóa bản ghi đè cục bộ (localStorage) để lần mở web sau LẤY DỮ LIỆU
        // MỚI TỪ SERVER — trước đây bản localStorage cũ đè lên khiến media vừa lưu
        // không hiện lại khi tải trang.
        if (json && json.status === 'success') {
          this._clearLocalOverrides();
        }
        return json;
      } catch (e) {
        return { status: 'error', message: 'Không có kết nối tới máy chủ PHP (chế độ demo cục bộ).' };
      }
    },

    // ---- Sao lưu & Khôi phục dữ liệu (server-side) ----
    async backupNow(u, p) {
      try {const r = await fetch(`${API_URL}?action=backup_db`, { method: 'POST', headers: { 'X-Admin-User': u, 'X-Admin-Pass': p } });return await r.json();}
      catch (e) {return { status: 'error', message: 'Không kết nối được máy chủ.' };}
    },
    async backupInfo(u, p) {
      try {const r = await fetch(`${API_URL}?action=backup_info`, { headers: { 'X-Admin-User': u, 'X-Admin-Pass': p } });return await r.json();}
      catch (e) {return { status: 'error' };}
    },
    async cardRequestsAdmin(u, p) {
      try {const r = await fetch(`${API_URL}?action=card_requests`, { headers: { 'X-Admin-User': u, 'X-Admin-Pass': p } });return await r.json();}
      catch (e) {return { status: 'error', message: 'Không kết nối được máy chủ.' };}
    },
    async cardApprove(u, p, requestId, amount) {
      try {const r = await fetch(`${API_URL}?action=card_approve`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Admin-User': u, 'X-Admin-Pass': p }, body: JSON.stringify({ requestId, amount }) });return await r.json();}
      catch (e) {return { status: 'error', message: 'Không kết nối được máy chủ.' };}
    },
    async cardLog(u, p) {
      try {const r = await fetch(`${API_URL}?action=card_log`, { headers: { 'X-Admin-User': u, 'X-Admin-Pass': p } });return await r.json();}
      catch (e) {return { status: 'error', message: 'Không kết nối được máy chủ.' };}
    },
    async restoreFromServer(u, p) {
      try {const r = await fetch(`${API_URL}?action=restore_db`, { method: 'POST', headers: { 'X-Admin-User': u, 'X-Admin-Pass': p } });return await r.json();}
      catch (e) {return { status: 'error', message: 'Không kết nối được máy chủ.' };}
    },
    async exportDb(u, p) {
      try {const r = await fetch(`${API_URL}?action=export_db`, { headers: { 'X-Admin-User': u, 'X-Admin-Pass': p } });return await r.json();}
      catch (e) {return { status: 'error', message: 'Không kết nối được máy chủ.' };}
    },
    // Kho đơn hàng bền vững: thông tin (số đơn) + phục hồi đơn khách về database.json.
    async ordersArchiveInfo(u, p) {
      try {const r = await fetch(`${API_URL}?action=orders_archive_info`, { headers: { 'X-Admin-User': u, 'X-Admin-Pass': p } });return await r.json();}
      catch (e) {return { status: 'error' };}
    },
    async recoverOrders(u, p) {
      try {const r = await fetch(`${API_URL}?action=recover_orders`, { method: 'POST', headers: { 'X-Admin-User': u, 'X-Admin-Pass': p } });return await r.json();}
      catch (e) {return { status: 'error', message: 'Không kết nối được máy chủ.' };}
    },
    // Gửi lại các FILE MEDIA (uploads/) từ bản sao lưu để ghi vào thư mục uploads/ trên máy chủ.
    async restoreUploads(u, p, uploads) {
      try {
        const r = await fetch(`${API_URL}?action=restore_uploads`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Admin-User': u, 'X-Admin-Pass': p },
          body: JSON.stringify({ uploads })
        });
        return await r.json();
      } catch (e) { return { status: 'error', message: 'Không gửi được file media.' }; }
    },
    // Nạp 1 file sao lưu (.json) từ máy admin rồi đẩy lên server.
    async importDb(dbObj, u, p) {
      if (!dbObj || !dbObj.config || !Array.isArray(dbObj.users)) throw new Error('File sao lưu không hợp lệ (thiếu config/users).');
      // Tách khóa API (nếu bản sao lưu có kèm) ra để ghi riêng vào secrets.php, KHÔNG lưu
      // vào database.json.
      const secrets = dbObj._secrets && typeof dbObj._secrets === 'object' ? dbObj._secrets : null;
      // Tách FILE MEDIA (ảnh/video/hoạt ảnh nền...) để ghi lại vào thư mục uploads/ — nhờ vậy
      // các đường dẫn uploads/xxx hoạt động trở lại sau khi khôi phục.
      const uploads = Array.isArray(dbObj._uploads) ? dbObj._uploads : null;
      delete dbObj._secrets;
      delete dbObj._uploads;
      delete dbObj._uploadsMeta;
      this.db = dbObj;
      this._clearLocalOverrides();
      this._emit();
      // Ghi lại file media TRƯỚC khi lưu DB để khi trang tải lại là link đã có file.
      // Gửi THEO TỪNG ĐỢT (~20MB/đợt) để không tạo 1 request khổng lồ làm treo điện thoại/
      // vượt giới hạn máy chủ. File lớn hơn 1 đợt sẽ đi riêng 1 request.
      if (uploads && uploads.length) {
        const chunks = [];
        let cur = [], curSize = 0;
        for (const it of uploads) {
          const s = it && it.d ? it.d.length : 0;
          if (cur.length && curSize + s > 20 * 1024 * 1024) { chunks.push(cur); cur = []; curSize = 0; }
          cur.push(it); curSize += s;
        }
        if (cur.length) chunks.push(cur);
        for (const ch of chunks) {
          try { await this.restoreUploads(u, p, ch); } catch (e) {/* bỏ qua đợt lỗi, tiếp tục */}
        }
      }
      const res = await this.trySaveToServer(u, p);
      // Khôi phục khóa API: token ngân hàng tự động, Partner ID/Key nạp thẻ, Telegram, TTS.
      if (secrets) {
        const patch = {};
        ['bankToken', 'cardPartnerId', 'cardPartnerKey', 'telegramBotToken', 'telegramChatId', 'ttsApiKey'].forEach((k) => {
          if (secrets[k] != null && String(secrets[k]).trim() !== '') patch[k] = String(secrets[k]).trim();
        });
        if (Object.keys(patch).length) {try {await this.saveSecrets(u, p, patch);} catch (e) {/* bỏ qua nếu lỗi */}}
      }
      return res;
    }
  };

  global.Store = Store;
})(window);

/**
 * voice.js — Giọng nói trợ lý ảo.
 * Ưu tiên gọi Google Cloud Text-to-Speech thật (qua tts.php, API key giữ bí mật ở
 * máy chủ) để có đúng giọng nữ Google trên MỌI trình duyệt kể cả Safari/iPhone
 * (Web Speech API của Safari không có giọng Google). Nếu chưa cấu hình API key
 * hoặc máy chủ không phản hồi, tự động dùng lại giọng trình duyệt (Web Speech API)
 * làm phương án dự phòng.
 */
(function (global) {
  'use strict';

  const PREF_KEY = 'kenios_voice_prefs_v1';
  const TTS_URL = './tts.php';
  let ttsUnavailable = false; // set true sau lần gọi lỗi đầu tiên để không spam request lỗi
  let currentAudio = null;

  const Voice = {
    voices: [],
    prefs: Object.assign({ enabled: true, voiceURI: null, rate: 1, pitch: 1, volume: 1 }, readPrefs()),

    init() {
      if (!('speechSynthesis' in window)) return;
      const load = () => {this.voices = window.speechSynthesis.getVoices();};
      load();
      window.speechSynthesis.onvoiceschanged = load;
    },

    // Danh sách giọng ưu tiên hiển thị cho người dùng chọn: Google trước, còn lại sau.
    availableVoices() {
      const vi = this.voices.filter((v) => v.lang.startsWith('vi'));
      const others = this.voices.filter((v) => !v.lang.startsWith('vi'));
      const sortGoogleFirst = (a, b) => {
        const ag = /google/i.test(a.name) ? 0 : 1;
        const bg = /google/i.test(b.name) ? 0 : 1;
        return ag - bg;
      };
      return [...vi.sort(sortGoogleFirst), ...others.sort(sortGoogleFirst)];
    },

    _pickVoice() {
      if (this.prefs.voiceURI) {
        const chosen = this.voices.find((v) => v.voiceURI === this.prefs.voiceURI);
        if (chosen) return chosen;
      }
      // Mặc định: giọng nữ Google tiếng Việt, rồi tới bất kỳ giọng Google nào, cuối cùng là giọng vi-VN bất kỳ.
      return this.voices.find((v) => v.lang.startsWith('vi') && /google/i.test(v.name)) ||
      this.voices.find((v) => /google/i.test(v.name)) ||
      this.voices.find((v) => v.lang.startsWith('vi')) ||
      this.voices[0] ||
      null;
    },

    async speak(text) {
      // Giọng đọc đã bị xóa hoàn toàn theo yêu cầu
      return;
    },

    async _speakGoogleCloud(text) {
      try {
        const res = await fetch(TTS_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, rate: this.prefs.rate, pitch: (this.prefs.pitch - 1) * 10 })
        });
        const json = await res.json();
        if (json.status !== 'success' || !json.audioContent) {ttsUnavailable = true;return false;}
        const audio = new Audio('data:audio/mp3;base64,' + json.audioContent);
        audio.volume = this.prefs.volume;
        currentAudio = audio;
        await audio.play();
        return true;
      } catch (e) {
        ttsUnavailable = true;
        return false;
      }
    },

    _speakBrowser(text) {
      if (!('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      const voice = this._pickVoice();
      if (voice) {utter.voice = voice;utter.lang = voice.lang;} else
      utter.lang = 'vi-VN';
      utter.rate = this.prefs.rate;
      utter.pitch = this.prefs.pitch;
      utter.volume = this.prefs.volume;
      window.speechSynthesis.speak(utter);
    },

    stop() {
      if (currentAudio) {currentAudio.pause();currentAudio = null;}
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    },

    setPrefs(patch) {
      Object.assign(this.prefs, patch);
      writePrefs(this.prefs);
    }
  };

  function readPrefs() {
    try {return JSON.parse(localStorage.getItem(PREF_KEY)) || {};} catch {return {};}
  }
  function writePrefs(p) {
    try {localStorage.setItem(PREF_KEY, JSON.stringify(p));} catch {/* ignore */}
  }

  global.Voice = Voice;
})(window);

/**
 * effects.js — Hiệu ứng chạm kèm âm thanh.
 * Thay thế hoàn toàn effects_patch.js cũ (ripple/spark/bubble/star/heart/magic
 * + rainbow text + halo logo + marquee 7 màu). Bộ mới chỉ giữ lại một gợn sóng
 * (ripple) tinh tế tại vị trí chạm, đi kèm âm thanh click tổng hợp bằng Web Audio
 * API (không phụ thuộc file mp3 ngoài) — người dùng có thể đổi âm thanh, chỉnh
 * âm lượng hoặc tắt hẳn trong bảng cài đặt góc phải màn hình.
 */
(function (global) {
  'use strict';

  const PREF_KEY = 'kenios_fx_prefs_v1';
  let audioCtx = null;

  const SOUND_PRESETS = {
    none: { label: 'Tắt âm thanh' },
    pop: { label: 'Pop nhẹ' },
    click: { label: 'Click cơ học' },
    coin: { label: 'Coin (Xu)' },
    wood: { label: 'Gõ gỗ' },
    chime: { label: 'Chuông ngân' },
    bubble: { label: 'Bong bóng' },
    blip: { label: 'Blip điện tử' },
    marimba: { label: 'Marimba' },
    bell: { label: 'Chuông cửa' },
    success: { label: 'Báo thành công' },
    laser: { label: 'Laser' },
    drop: { label: 'Giọt nước' },
    notify: { label: 'Thông báo nhẹ' }
  };

  const Effects = {
    prefs: Object.assign({ touchEnabled: true, sound: 'pop', volume: 0.5 }, readPrefs()),

    init() {


      // Đã GỠ hoàn toàn hiệu ứng chạm (gợn sóng + âm thanh) theo yêu cầu — không gắn
      // listener gì nữa để khi chạm màn hình không còn hiệu ứng nào.
    }, _onPointer() {/* không dùng nữa */},

    setPrefs(patch) {
      Object.assign(this.prefs, patch);
      writePrefs(this.prefs);
    },

    _buildSettingsPanel() {
      const btn = document.createElement('button');
      btn.className = 'fx-toggle-btn';
      btn.type = 'button';
      btn.setAttribute('aria-label', 'Cài đặt hiệu ứng chạm & âm thanh');
      // Icon SVG được điền bởi applyIcons() (gọi trong boot, sau Effects.init).
      btn.setAttribute('data-icon', 'sound');

      const panel = document.createElement('div');
      panel.className = 'fx-panel';
      panel.innerHTML = `
        <h4>Hiệu ứng chạm &amp; âm thanh</h4>
        <label class="fx-row">
          <span>Gợn sóng khi chạm</span>
          <input type="checkbox" id="fxTouchEnabled">
        </label>
        <label class="fx-row">
          <span>Âm thanh khi chạm</span>
          <select id="fxSound"></select>
        </label>
        <label class="fx-row">
          <span>Âm lượng</span>
          <input type="range" id="fxVolume" min="0" max="1" step="0.05">
        </label>
        <button type="button" class="fx-test-btn" id="fxTestBtn">Nghe thử</button>
      `;

      document.body.appendChild(btn);
      document.body.appendChild(panel);

      const selSound = panel.querySelector('#fxSound');
      Object.entries(SOUND_PRESETS).forEach(([key, val]) => {
        const opt = document.createElement('option');
        opt.value = key;opt.textContent = val.label;
        selSound.appendChild(opt);
      });

      const chkTouch = panel.querySelector('#fxTouchEnabled');
      const rngVolume = panel.querySelector('#fxVolume');
      const syncUI = () => {
        chkTouch.checked = this.prefs.touchEnabled;
        selSound.value = this.prefs.sound;
        rngVolume.value = this.prefs.volume;
      };
      syncUI();

      chkTouch.addEventListener('change', () => this.setPrefs({ touchEnabled: chkTouch.checked }));
      selSound.addEventListener('change', () => this.setPrefs({ sound: selSound.value }));
      rngVolume.addEventListener('input', () => this.setPrefs({ volume: parseFloat(rngVolume.value) }));
      panel.querySelector('#fxTestBtn').addEventListener('click', () => {
        if (this.prefs.sound !== 'none') playSound(this.prefs.sound, this.prefs.volume);
        spawnRipple(window.innerWidth / 2, window.innerHeight / 2);
      });

      btn.addEventListener('click', () => panel.classList.toggle('open'));
      document.addEventListener('click', (e) => {
        if (!panel.contains(e.target) && e.target !== btn) panel.classList.remove('open');
      });
    }
  };

  function injectCSS() {
    const s = document.createElement('style');
    s.textContent = `
      @keyframes fxRipple { 0% { transform: scale(0); opacity: .55; } 100% { transform: scale(1); opacity: 0; } }
      .fx-ripple { position: fixed; pointer-events: none; z-index: 999999; border-radius: 50%;
        background: radial-gradient(circle, rgba(34,211,238,.55) 0%, rgba(134,59,255,.25) 60%, transparent 75%);
        animation: fxRipple .5s ease-out forwards; }
    `;
    document.head.appendChild(s);
  }

  function spawnRipple(x, y) {
    const size = 46;
    const el = document.createElement('div');
    el.className = 'fx-ripple';
    el.style.left = x - size / 2 + 'px';
    el.style.top = y - size / 2 + 'px';
    el.style.width = size + 'px';
    el.style.height = size + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 550);
  }

  function ctx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  // Toàn bộ âm thanh được tổng hợp bằng Web Audio API — không cần tải file ngoài,
  // nên không bao giờ "chết link" và có thể chỉnh sửa/mở rộng dễ dàng.
  function playSound(preset, volume) {
    const ac = ctx();
    const now = ac.currentTime;
    const master = ac.createGain();
    master.gain.value = volume;
    master.connect(ac.destination);

    const tone = (freq, start, dur, type = 'sine', gain = 0.35) => {
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, now + start);
      g.gain.exponentialRampToValueAtTime(gain, now + start + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
      osc.connect(g);g.connect(master);
      osc.start(now + start);osc.stop(now + start + dur + 0.02);
    };

    switch (preset) {
      case 'pop':tone(900, 0, 0.08, 'sine', 0.5);break;
      case 'click':tone(1800, 0, 0.03, 'square', 0.25);break;
      case 'coin':tone(1046, 0, 0.09, 'square', 0.3);tone(1568, 0.08, 0.12, 'square', 0.25);break;
      case 'wood':tone(220, 0, 0.05, 'triangle', 0.4);tone(160, 0.02, 0.06, 'triangle', 0.25);break;
      case 'chime':tone(1318, 0, 0.35, 'sine', 0.25);tone(1976, 0.05, 0.4, 'sine', 0.18);break;
      case 'bubble':tone(500, 0, 0.05, 'sine', 0.3);tone(900, 0.04, 0.08, 'sine', 0.25);break;
      case 'blip':tone(2400, 0, 0.02, 'square', 0.2);tone(1200, 0.02, 0.03, 'square', 0.18);break;
      case 'marimba':tone(784, 0, 0.2, 'sine', 0.3);tone(988, 0.03, 0.25, 'sine', 0.2);break;
      case 'bell':tone(1568, 0, 0.5, 'sine', 0.3);tone(2093, 0.02, 0.5, 'sine', 0.15);break;
      case 'success':tone(659, 0, 0.1, 'sine', 0.3);tone(880, 0.1, 0.1, 'sine', 0.3);tone(1318, 0.2, 0.2, 'sine', 0.3);break;
      case 'laser':tone(1800, 0, 0.08, 'sawtooth', 0.2);tone(400, 0.05, 0.1, 'sawtooth', 0.15);break;
      case 'drop':tone(1200, 0, 0.04, 'sine', 0.3);tone(300, 0.03, 0.15, 'sine', 0.25);break;
      case 'notify':tone(1046, 0, 0.12, 'triangle', 0.25);tone(1568, 0.1, 0.15, 'triangle', 0.2);break;
      default:break;
    }
  }

  function readPrefs() {
    try {return JSON.parse(localStorage.getItem(PREF_KEY)) || {};} catch {return {};}
  }
  function writePrefs(p) {
    try {localStorage.setItem(PREF_KEY, JSON.stringify(p));} catch {/* ignore */}
  }

  global.Effects = Effects;
})(window);

/**
 * app.js — Gắn kết dữ liệu (store.js) với giao diện, xử lý toàn bộ tương tác:
 * đăng nhập/đăng ký, nạp tiền VietQR, mua gói dịch vụ, đơn hàng, trợ lý ảo AI,
 * và bảng quản trị hệ thống dành cho admin.
 */
(function () {
  'use strict';

  const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  // ISO -> giá trị cho <input type="datetime-local"> (yyyy-MM-ddTHH:mm theo giờ địa phương).
  function toLocalDatetimeValue(iso) {
    const d = new Date(iso);
    if (isNaN(d)) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  const esc = (s) => String(s !== null && s !== void 0 ? s : '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c]);

  // ============================================================
  // BỘ ICON SVG (thay cho emoji "icon máy" — hiển thị đồng nhất, nét mảnh, đẹp trên
  // mọi thiết bị). Dùng qua thuộc tính data-icon="tên" trong HTML, hoặc ICONS.tên
  // trong template JS. Tất cả vẽ bằng nét currentColor nên tự đổi màu theo chữ.
  // ============================================================
  const _svg = (inner) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
  const ICONS = {
    eye: _svg('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>'),
    download: _svg('<path d="M12 3v12M8 11l4 4 4-4"/><path d="M5 19h14"/>'),
    google: _svg('<path d="M21 12.2c0-.6-.1-1.2-.2-1.8H12v3.6h5.1a4.4 4.4 0 0 1-1.9 2.9v2.4h3.1c1.8-1.7 2.7-4.1 2.7-7.1Z" fill="currentColor" stroke="none"/><path d="M12 21c2.5 0 4.6-.8 6.1-2.2l-3.1-2.4c-.8.6-1.9.9-3 .9-2.3 0-4.3-1.6-5-3.7H3.8v2.4A9 9 0 0 0 12 21Z" fill="currentColor" stroke="none"/><path d="M7 13.6a5.4 5.4 0 0 1 0-3.4V7.8H3.8a9 9 0 0 0 0 8.1L7 13.6Z" fill="currentColor" stroke="none"/><path d="M12 6.6c1.3 0 2.5.5 3.4 1.3l2.6-2.6A9 9 0 0 0 3.8 7.8L7 10.2c.7-2.1 2.7-3.6 5-3.6Z" fill="currentColor" stroke="none"/>'),
    home: _svg('<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/>'),
    card: _svg('<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 9.5h19"/><path d="M6.5 14.5h4"/>'),
    box: _svg('<path d="M21 8 12 3 3 8v8l9 5 9-5V8Z"/><path d="M3 8l9 5 9-5"/><path d="M12 13v8"/>'),
    grid: _svg('<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>'),
    gamepad: _svg('<path d="M6 8h12a4 4 0 0 1 4 4v.4a3.4 3.4 0 0 1-6.1 2.1l-.6-.9H8.7l-.6.9A3.4 3.4 0 0 1 2 12.4V12a4 4 0 0 1 4-4Z"/><path d="M7.5 11v2M6.5 12h2"/><circle cx="16" cy="11.4" r=".8" fill="currentColor" stroke="none"/><circle cx="17.6" cy="13" r=".8" fill="currentColor" stroke="none"/>'),
    web: _svg('<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/><path d="m9.7 8-2 2 2 2M14.3 8l2 2-2 2"/>'),
    news: _svg('<path d="M4 5h13v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5Z"/><path d="M17 8h3v10.5a1.5 1.5 0 0 1-3 0V8Z"/><path d="M7 8.5h7M7 12h7M7 15.5h4"/>'),
    dashboard: _svg('<path d="M4 20V10M9 20V4M14 20v-7M19 20V8"/>'),
    users: _svg('<circle cx="9" cy="8" r="3.2"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/><path d="M16 5.2a3.2 3.2 0 0 1 0 5.6M17.7 20a5.6 5.6 0 0 0-2.7-4.7"/>'),
    image: _svg('<rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="8.5" cy="9.5" r="1.7"/><path d="m4 17 4.5-4.5a2 2 0 0 1 2.7 0L20 20"/>'),
    gear: _svg('<circle cx="12" cy="12" r="3.1"/><path d="M12 2.5v2.6M12 18.9v2.6M4.3 4.3l1.9 1.9M17.8 17.8l1.9 1.9M2.5 12h2.6M18.9 12h2.6M4.3 19.7l1.9-1.9M17.8 6.2l1.9-1.9"/>'),
    search: _svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/>'),
    shield: _svg('<path d="M12 3 5 6v6c0 4 3 6.6 7 9 4-2.4 7-5 7-9V6l-7-3Z"/><path d="m9 12 2 2 4-4"/>'),
    robot: _svg('<rect x="4.5" y="8" width="15" height="11" rx="3"/><path d="M12 8V5.2"/><circle cx="12" cy="3.6" r="1.6"/><circle cx="9.2" cy="13" r="1.2" fill="currentColor" stroke="none"/><circle cx="14.8" cy="13" r="1.2" fill="currentColor" stroke="none"/><path d="M9.5 16.3h5M2.5 12v3M21.5 12v3"/>'),
    sound: _svg('<path d="M4 9v6h3.5L13 20V4L7.5 9H4Z"/><path d="M16.4 9a4 4 0 0 1 0 6M19 6.5a7.5 7.5 0 0 1 0 11"/>'),
    logout: _svg('<path d="M15 5h4a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-4"/><path d="M10 12H3M6 8l-3 4 3 4"/>'),
    close: _svg('<path d="M6 6l12 12M18 6 6 18"/>'),
    chevron: _svg('<path d="m6 9 6 6 6-6"/>'),
    back: _svg('<path d="M15 5l-7 7 7 7"/>'),
    lock: _svg('<rect x="4.5" y="10" width="15" height="10" rx="2.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15" r="1.3" fill="currentColor" stroke="none"/>'),
    support: _svg('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3.2"/><path d="m6 6 3.6 3.6M14.4 14.4 18 18M18 6l-3.6 3.6M9.6 14.4 6 18"/>'),
    refresh: _svg('<path d="M4 12a8 8 0 0 1 13.7-5.6L20 8M20 4v4h-4"/><path d="M20 12a8 8 0 0 1-13.7 5.6L4 16M4 20v-4h4"/>'),
    check: _svg('<circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/>'),
    calendar: _svg('<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/>'),
    clock: _svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
    save: _svg('<path d="M5 4h11l3 3v13H5V4Z"/><path d="M8 4v5h7V4M8 20v-6h8v6"/>'),
    cloud: _svg('<path d="M7 18a4 4 0 0 1-.5-8A5.5 5.5 0 0 1 17 9.5a3.5 3.5 0 0 1 .5 8H7Z"/><path d="M12 21v-7m0 0-2.2 2.2M12 14l2.2 2.2"/>'),
    copy: _svg('<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/>'),
    link: _svg('<path d="M9.5 13.5a4 4 0 0 0 5.7.3l3-3a4 4 0 0 0-5.7-5.7L11 6.6"/><path d="M14.5 10.5a4 4 0 0 0-5.7-.3l-3 3a4 4 0 0 0 5.7 5.7L13 17.4"/>'),
    history: _svg('<path d="M3 3v5h5"/><path d="M3.05 13a9 9 0 1 0 2.4-6.36L3 8"/><path d="M12 7v5l3.5 2"/>'),
    upload: _svg('<path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/><path d="M12 16V4M8 8l4-4 4 4"/>'),
    trash: _svg('<path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"/>'),
    arrowUp: _svg('<path d="M12 19V5"/><path d="M6 11l6-6 6 6"/>'),
    arrowDown: _svg('<path d="M12 5v14"/><path d="M6 13l6 6 6-6"/>'),
    sun: _svg('<circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.4M12 19.6V22M2 12h2.4M19.6 12H22M4.6 4.6l1.7 1.7M17.7 17.7l1.7 1.7M4.6 19.4l1.7-1.7M17.7 6.3l1.7-1.7"/>'),
    moon: _svg('<path d="M20 14.5A8 8 0 0 1 9.5 4 7 7 0 1 0 20 14.5Z"/>'),
    // ---- Icon cho danh mục / thư mục con (admin chọn từ bộ này, không dùng emoji) ----
    target: _svg('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>'),
    fire: _svg('<path d="M12 2.5C9 6.5 7.5 8.5 7.5 12a4.5 4.5 0 0 0 9 0c0-1.7-.7-3-1.7-4.3C14.5 9 13.5 9.5 13 11c-.6-2.2-.5-4.3-1-8.5Z"/>'),
    bolt: _svg('<path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"/>'),
    crown: _svg('<path d="M3 8l4 3.5L12 5l5 6.5L21 8v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8Z"/><path d="M3 15h18"/>'),
    rocket: _svg('<path d="M14.5 3.5A9 9 0 0 1 9 15l-3-3A9 9 0 0 1 17.5 6.5a10 10 0 0 0-3-3Z"/><circle cx="14.5" cy="9.5" r="1.4"/><path d="M6 15c-1.5 1-2.5 4-2.5 4s3-1 4-2.5"/>'),
    star: _svg('<path d="m12 3 2.6 5.3 5.9.9-4.3 4.1 1 5.9L12 16.9 6.8 19.2l1-5.9L3.5 9.2l5.9-.9L12 3Z"/>'),
    trophy: _svg('<path d="M8 4h8v4a4 4 0 0 1-8 0V4Z"/><path d="M8 5.5H5V7a3 3 0 0 0 3 3M16 5.5h3V7a3 3 0 0 1-3 3"/><path d="M12 12v4M9 20h6M10 20l.5-4h3l.5 4"/>'),
    sword: _svg('<path d="M14 3h7v7l-9.5 9.5-2 .5.5-2L19.5 8.5"/><path d="m5 15 4 4M4 20l2.5-2.5"/>'),
    diamond: _svg('<path d="M6 3h12l3 6-9 12L3 9l3-6Z"/><path d="M3 9h18M9 3 7 9l5 12 5-12-2-6"/>'),
    phone: _svg('<path d="M6.8 3.5c.9 0 1.7.6 1.9 1.5l.6 2.4c.2.7-.1 1.4-.6 1.9L7.4 10.6a12.5 12.5 0 0 0 6 6l1.3-1.3c.5-.5 1.2-.8 1.9-.6l2.4.6c.9.2 1.5 1 1.5 1.9v2.5c0 1.1-.9 2-2 2A16 16 0 0 1 4.4 5.5c0-1.1.9-2 2-2Z"/>'),
    cart: _svg('<circle cx="9" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/><path d="M3 4h2l2.2 11a1.5 1.5 0 0 0 1.5 1.2h8a1.5 1.5 0 0 0 1.5-1.2L20 8H6"/>'),
    tag: _svg('<path d="M4 4h7.5l8.5 8.5-7.5 7.5L4 11.5V4Z"/><circle cx="8.5" cy="8.5" r="1.4"/>'),
    gift: _svg('<rect x="3.5" y="8" width="17" height="4" rx="1"/><path d="M5 12v8h14v-8M12 8v12"/><path d="M12 8S10.5 4.5 8.2 4.5A1.8 1.8 0 0 0 8 8h4Zm0 0s1.5-3.5 3.8-3.5A1.8 1.8 0 0 1 16 8h-4Z"/>'),
    key: _svg('<circle cx="8" cy="15" r="4"/><path d="m10.8 12.2 8-8M17.5 4.5 20 7M15.5 6.5 18 9"/>'),
    folder: _svg('<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/>'),
    apple: _svg('<path d="M15.5 3c.2 1.2-.3 2.3-1 3-.7.8-1.9 1.3-2.9 1.2-.2-1.1.4-2.3 1-3C13.4 3.4 14.6 3 15.5 3Z"/><path d="M18.5 16.4c-.6 1.9-1.9 3.9-3.5 3.9-1 0-1.5-.6-2.7-.6s-1.7.6-2.6.6c-1.7 0-3.2-2.8-3.8-5.1-.6-2.6.4-5 2.5-5.3 1.1-.2 2.1.5 2.9.5.7 0 2-.9 3.3-.7 1.1.1 2.1.6 2.7 1.5-1.9 1.3-1.8 3.9.1 4.7Z"/>'),
    android: _svg('<path d="M5 11a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v6a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 5 17v-6Z"/><path d="M8 10 6.3 7M16 10l1.7-3"/><path d="M9.5 8.3v.01M14.5 8.3v.01"/><path d="M3 12v3M21 12v3M9 18.5v2M15 18.5v2"/>'),
    monitor: _svg('<rect x="3" y="4" width="18" height="12" rx="1.6"/><path d="M8 20h8M12 16v4"/>'),
    headset: _svg('<path d="M4 13v-1a8 8 0 0 1 16 0v1"/><rect x="3" y="13" width="4" height="6" rx="1.5"/><rect x="17" y="13" width="4" height="6" rx="1.5"/><path d="M20 19a4 4 0 0 1-4 3h-2"/>'),
    bulb: _svg('<path d="M9.5 18h5M10.5 21h3M12 3a6 6 0 0 0-3.8 10.6c.6.6.8 1.4.8 2.4h6c0-1 .2-1.8.8-2.4A6 6 0 0 0 12 3Z"/>'),
    heart: _svg('<path d="M12 20s-7-4.3-9.2-8.5A4.6 4.6 0 0 1 12 6a4.6 4.6 0 0 1 9.2 5.5C19 15.7 12 20 12 20Z"/>'),
    wallet: _svg('<rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3 10h18M16.5 13.5h1.5"/><path d="M17 6V4.5a1.5 1.5 0 0 0-1.9-1.4L5 5.5"/>'),
    // ---- Icon SVG cho các kênh liên hệ / mạng xã hội (không dùng emoji) ----
    zalo: _svg('<path d="M4 5h16v10h-7l-5 4v-4H4Z"/><path d="M8 9h5M8 12h3"/>'),
    telegram: _svg('<path d="M21 4 3 11l5 2 1.5 5 2.5-3.2L17 18l4-14Z"/><path d="m8 13 8-5"/>'),
    facebook: _svg('<path d="M14.5 8H16V5.2h-2A3.2 3.2 0 0 0 10.8 8v2H9v3h1.8v6h3v-6h2l.7-3h-2.7V8.6c0-.4.3-.6.7-.6Z"/>'),
    instagram: _svg('<rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.6"/><circle cx="16.6" cy="7.4" r="1" fill="currentColor" stroke="none"/>'),
    tiktok: _svg('<path d="M13 4c.4 2.6 2 4.2 4.5 4.4v2.7c-1.6 0-3.1-.5-4.5-1.4V15a4.7 4.7 0 1 1-4.7-4.7c.3 0 .6 0 .9.1v2.8a2 2 0 1 0 1.3 1.9V4Z"/>'),
    email: _svg('<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m3.5 7 8.5 6 8.5-6"/>'),
    youtube: _svg('<rect x="3" y="6" width="18" height="12" rx="3.5"/><path d="m10 9.2 5 2.8-5 2.8Z" fill="currentColor" stroke="none"/>'),
    messenger: _svg('<path d="M12 3c5 0 9 3.7 9 8.4 0 4.6-4 8.3-9 8.3-1 0-2-.2-2.9-.5L5 20.5l.3-3.4A8 8 0 0 1 3 11.4C3 6.7 7 3 12 3Z"/><path d="m7.5 13.5 3-3 2 2 3-2.5"/>'),
    discord: _svg('<path d="M7 7a15 15 0 0 1 10 0l1.5 3.5a12 12 0 0 1 1 5l-2.5 2-1.2-2M7 7 5.5 10.5a12 12 0 0 0-1 5l2.5 2 1.2-2"/><circle cx="9.5" cy="13" r="1"/><circle cx="14.5" cy="13" r="1"/>'),
    // ---- Icon SVG bổ sung (thay cho emoji của điện thoại) ----
    warn: _svg('<path d="M12 3.5 21 19H3L12 3.5Z"/><path d="M12 10v4"/><circle cx="12" cy="16.6" r="0.6" fill="currentColor" stroke="none"/>'),
    info: _svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5"/><circle cx="12" cy="8" r="0.7" fill="currentColor" stroke="none"/>'),
    bell: _svg('<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2.5H4.5L6 16Z"/><path d="M10 19a2 2 0 0 0 4 0"/>'),
    megaphone: _svg('<path d="M4 10v4a1 1 0 0 0 1 1h2l9 4V5L7 9H5a1 1 0 0 0-1 1Z"/><path d="M18 9a3 3 0 0 1 0 6"/>'),
    undo: _svg('<path d="M9 7 4 12l5 5"/><path d="M4 12h11a5 5 0 0 1 0 10h-2"/>'),
    ban: _svg('<circle cx="12" cy="12" r="8.5"/><path d="m6.2 6.2 11.6 11.6"/>'),
    party: _svg('<path d="M4 20 9 8l7 7-12 5Z"/><path d="M14 4v2M18 6l-1.5 1.5M20 10h-2"/>'),
    sale: _svg('<path d="M4 4h7.5l8.5 8.5-7.5 7.5L4 11.5V4Z"/><circle cx="8.5" cy="8.5" r="1.4"/><path d="M10.5 14.5 15 10"/>')
  };
  // SVG icon để CHÈN THẲNG vào nút/nhãn (gắn class 'ico' cho CSS canh cỡ theo chữ).
  // Dùng thay cho emoji của điện thoại — giao diện luôn nhất quán trên mọi máy.
  const ico = (name) => (ICONS[name] || '').replace('<svg ', '<svg class="ico" ');
  // Map id kênh liên hệ -> tên icon SVG ở trên (mặc định dùng headset nếu không khớp).
  const CONTACT_ICON_MAP = {
    zalo: 'zalo', phone: 'phone', hotline: 'phone', telegram: 'telegram', facebook: 'facebook',
    messenger: 'messenger', instagram: 'instagram', tiktok: 'tiktok', email: 'email',
    youtube: 'youtube', discord: 'discord', web: 'web', other: 'headset'
  };
  const contactChannelIcon = (type) => ICONS[CONTACT_ICON_MAP[type]] || ICONS.headset;
  // Nền tảng liên hệ / nhóm — admin thêm bao nhiêu tuỳ ý, mỗi mục chọn 1 nền tảng.
  const CONTACT_PLATFORMS = [
  ['zalo', 'Zalo'], ['telegram', 'Telegram'], ['facebook', 'Facebook'], ['messenger', 'Messenger'],
  ['instagram', 'Instagram'], ['tiktok', 'TikTok'], ['youtube', 'YouTube'], ['discord', 'Discord'],
  ['phone', 'Hotline'], ['email', 'Email'], ['web', 'Website'], ['other', 'Khác']];

  const CONTACT_PLATFORM_LABEL = CONTACT_PLATFORMS.reduce(function (o, p) { o[p[0]] = p[1]; return o; }, {});
  // Kiểu nền tảng của 1 kênh (tương thích ngược: cấu hình cũ chỉ có id).
  const chType = (ch) => ch.type || ch.id || 'other';
  // Bộ icon để admin chọn cho Danh mục / Thư mục con (đều là SVG, không phải emoji "icon máy").
  const PICKER_ICON_KEYS = ['gamepad', 'target', 'fire', 'bolt', 'shield', 'crown', 'rocket', 'star', 'trophy', 'sword', 'diamond', 'phone', 'web', 'cart', 'tag', 'gift', 'key', 'folder', 'headset', 'bulb', 'heart', 'robot'];

  // Nền tảng của SẢN PHẨM — để tách iOS / Android / PC... thành khu riêng NGOÀI danh sách.
  const PLATFORMS = [
  { key: 'ios', label: 'iOS', icon: 'apple' },
  { key: 'android', label: 'Android', icon: 'android' },
  { key: 'pc', label: 'PC / Windows', icon: 'monitor' },
  { key: 'other', label: 'Khác', icon: 'folder' }];

  const platformOf = (s) => PLATFORMS.find((x) => x.key === (s && s.platform)) || null;

  function applyIcons(root = document) {
    $$('[data-icon]', root).forEach((el) => {
      const name = el.dataset.icon;
      if (ICONS[name] && !el.dataset.iconDone) {el.innerHTML = ICONS[name];el.dataset.iconDone = '1';}
    });
  }
  // Trả về SVG cho icon danh mục: ưu tiên key trong ICONS; nếu dữ liệu cũ còn là emoji
  // thì vẫn hiển thị emoji đó (tương thích ngược), mặc định là folder.
  function catIcon(key) {
    if (key && ICONS[key]) return ICONS[key];
    if (key && /[\u{1F000}-\u{1FAFF}☀-➿]/u.test(key)) return `<span class="emoji-fallback">${esc(key)}</span>`;
    return ICONS.folder;
  }

  let selectedCategory = 'all';
  let selectedSub = 'all'; // lọc theo thư mục con trong mục "Dịch Vụ Nổi Bật"
  let serviceSort = 'default'; // sắp xếp danh sách sản phẩm
  let serviceStatusFilter = 'all'; // lọc theo trạng thái còn hàng
  let browseCategoryId = null; // null = đang xem danh sách Danh mục; ngược lại = id danh mục đang mở
  let browseSubId = null; // null = đang xem Thư mục con; ngược lại = id thư mục con đang mở

  // Sinh ID tự động dạng "01", "02"... cho từng bộ sưu tập (danh mục / thư mục con /
  // sản phẩm) — MỖI bộ có chuỗi số riêng, không dùng chung. Bỏ qua các id chữ cũ.
  function nextSeqId(arr) {
    let max = 0;
    (arr || []).forEach((item) => {
      const n = parseInt(String(item.id).replace(/\D/g, ''), 10);
      if (!isNaN(n) && n > max) max = n;
    });
    return String(max + 1).padStart(2, '0');
  }
  let currentServiceId = null;
  let currentPackage = null;
  let currentDiscount = null; // mã giảm giá đã áp dụng hợp lệ cho sản phẩm đang xem
  let adminActiveTab = 'overview';
  let adminServiceEditing = null; // null | 'new' | service id
  let adminCategoryEditing = null; // null | 'new' | category id
  let adminComboEditing = null; // null | 'new' | combo id
  let adminSubcategoryEditing = null; // null | 'new' | subcategory id

  const LEGAL_CONTENT = {
    terms: {
      title: 'Điều Khoản Dịch Vụ',
      html: `
        <h4>1. Phạm vi dịch vụ</h4>
        <p>KENIOS.STORE cung cấp các gói công cụ hỗ trợ trò chơi và dịch vụ thiết kế website theo mô tả trên từng sản phẩm. Khách hàng chịu trách nhiệm tuân thủ điều khoản sử dụng của nhà phát hành game khi sử dụng sản phẩm.</p>
        <h4>2. Thanh toán</h4>
        <p>Nạp tiền được thực hiện qua chuyển khoản VietQR. Số dư được cộng tự động sau khi hệ thống xác nhận giao dịch thành công.</p>
        <h4>3. Giao sản phẩm</h4>
        <p>Key/tài khoản được cấp phát tự động ngay sau khi thanh toán thành công và hiển thị trong mục "Đơn hàng của tôi".</p>
      `
    },
    privacy: {
      title: 'Chính Sách Bảo Mật',
      html: `
        <h4>Thông tin thu thập</h4>
        <p>Chúng tôi chỉ lưu trữ tên đăng nhập, mật khẩu (đã được mã hóa băm một chiều), số dư và lịch sử đơn hàng cần thiết để vận hành dịch vụ.</p>
        <h4>Bảo vệ dữ liệu</h4>
        <p>Mật khẩu không bao giờ được lưu ở dạng văn bản thuần trên máy chủ. Không chia sẻ thông tin tài khoản của bạn với bên thứ ba.</p>
      `
    },
    refund: {
      title: 'Chính Sách Hoàn Tiền',
      html: `
        <p>Do đặc thù sản phẩm số (key/tài khoản được cấp phát tức thì), đơn hàng đã giao key không thể hoàn tiền trừ khi sản phẩm lỗi từ phía hệ thống. Vui lòng liên hệ Admin qua Zalo/Hotline trong vòng 24 giờ nếu gặp sự cố để được hỗ trợ.</p>
      `
    }
  };

  // ============================================================
  // LIVE FEED — Bảng xếp hạng nạp + Giao dịch/Nạp tiền gần đây.
  // Chạy dữ liệu ẢO (nhiều tên khác nhau, đổi liên tục) để tạo social-proof.
  // Khi có giao dịch / nạp tiền THẬT thì gộp thêm vào, KHÔNG xoá dữ liệu ảo.
  // Sản phẩm & giá lấy từ bảng giá của trợ lý AI (cfg.aiResponsePrice).
  // ============================================================
  const LiveFeed = (() => {
    const SURNAMES = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý', 'Đinh', 'Tô', 'Cao', 'Mai', 'Trịnh', 'Đoàn', 'Lương', 'Tạ', 'Chu'];
    const GIVENS = ['Minh', 'Hùng', 'Quân', 'Anh', 'Tuấn', 'Khoa', 'Long', 'Nam', 'Phúc', 'Bảo', 'Đạt', 'Huy', 'Kiên', 'Sơn', 'Thắng', 'Vinh', 'Duy', 'Tài', 'Lộc', 'Phát', 'Hải', 'Trung', 'Dũng', 'Hoàng', 'Nghĩa', 'Khánh', 'Thịnh', 'Cường', 'Đức', 'Nhân'];

    let productPool = [];
    let orders = []; // {name, product, label, price, time}
    let deposits = []; // {name, amount, time}
    let rank = {}; // name -> tổng nạp tích luỹ
    let timer = null;
    let seenReal = new Set();

    const rndInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

    function maskName() {
      const s = pick(SURNAMES),g = pick(GIVENS);
      switch (rndInt(0, 3)) {
        case 0:return `${s} ${g[0]}${'*'.repeat(rndInt(2, 4))}`;
        case 1:return `${s.slice(0, 2)}${'*'.repeat(rndInt(2, 3))} ${g}`;
        case 2:return `${s} V.${g[0]}${'*'.repeat(2)}`;
        default:return `${s[0]}${'*'.repeat(3)} ${g}`;
      }
    }

    function parsePrice(str) {
      let n = parseInt(String(str).replace(/[^\d]/g, ''), 10);
      if (!n) return 0;
      if (n < 1000) n *= 1000;
      return n;
    }

    function buildProductPool(cfg) {
      const pool = [];
      const text = cfg && cfg.aiResponsePrice || '';
      let current = '';
      text.split('\n').forEach((raw) => {
        const line = raw.replace(/[\u{1F000}-\u{1FFFF}☀-➿←-⇿️]/gu, '').trim();
        if (!line) return;
        if (/https?:|zalo|telegram|linkbio|cảm ơn|bảng giá|android|ios/i.test(line) && !/\d+\s*[kK]?\s*\//.test(line)) {return;}
        const hasPrice = /\d+\s*[kK]?\s*\/\s*(Tháng|Tuần|Ngày|T\b)/i.test(line);
        if (!hasPrice) {current = line.replace(/[:\-–].*$/, '').trim();return;}
        let name = current;
        const inline = line.match(/^([^:0-9]+):/);
        if (inline) name = inline[1].trim();
        if (!name) return;
        const re = /(\d+)\s*[kK]?\s*\/\s*(Tháng|Tuần|Ngày|T)\b([^\/\d]*)/gi;
        let m;
        while (m = re.exec(line)) {
          let label = m[2];if (/^T$/i.test(label)) label = 'Tháng';
          const extra = (m[3] || '').replace(/[^\p{L}\s]/gu, '').trim();
          if (extra) label += ' ' + extra;
          pool.push({ product: name, label, price: parsePrice(m[1]) });
        }
      });
      if (!pool.length) {
        ['VNHAX', 'OASIS VIP', 'KING', 'TIMO VIP', 'FREE FIRE', 'LIÊN QUÂN'].forEach((p) =>
        pool.push({ product: p, label: pick(['Tháng', 'Tuần']), price: rndInt(2, 12) * 50000 }));
      }
      return pool;
    }

    function relTime(ts) {
      const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
      if (s < 60) return `${s} giây trước`;
      const m = Math.floor(s / 60);
      if (m < 60) return `${m} phút trước`;
      const h = Math.floor(m / 60);
      if (h < 24) return `${h} giờ trước`;
      return `${Math.floor(h / 24)} ngày trước`;
    }

    const DEPOSIT_AMOUNTS = [50000, 50000, 100000, 100000, 100000, 200000, 200000, 300000, 500000, 500000, 1000000, 2000000];

    function makeFakeOrder(agoMax) {
      const p = pick(productPool);
      return { name: maskName(), product: p.product, label: p.label, price: p.price,
        time: Date.now() - rndInt(3, agoMax || 90) * 1000, fake: true };
    }
    function makeFakeDeposit(agoMax) {
      return { name: maskName(), amount: pick(DEPOSIT_AMOUNTS),
        time: Date.now() - rndInt(3, agoMax || 90) * 1000, fake: true };
    }

    function seed() {
      orders = [];deposits = [];rank = {};
      // Bảng xếp hạng: một nhóm "đại gia" nạp tích luỹ lớn
      for (let i = 0; i < 12; i++) rank[maskName()] = rndInt(6, 90) * 500000;
      // Lịch sử gần đây
      let t = 5;
      for (let i = 0; i < 14; i++) {const o = makeFakeOrder();o.time = Date.now() - t * 1000;orders.push(o);t += rndInt(20, 120);}
      t = 8;
      for (let i = 0; i < 14; i++) {const d = makeFakeDeposit();d.time = Date.now() - t * 1000;deposits.push(d);rank[d.name] = (rank[d.name] || 0) + d.amount;t += rndInt(20, 120);}
      orders.sort((a, b) => b.time - a.time);
      deposits.sort((a, b) => b.time - a.time);
    }

    function mergeReal(db) {
      if (!db) return;
      // Đơn hàng thật -> giao dịch gần đây (mua)
      (db.orders || []).forEach((o) => {
        const key = 'O' + o.id;
        if (seenReal.has(key)) return;
        seenReal.add(key);
        orders.unshift({ name: 'Bạn', product: o.serviceName || 'Sản phẩm', label: (o.packageName || '').replace(/^Gói\s*/i, ''),
          price: o.price || 0, time: Date.parse(o.date) || Date.now(), fake: false, real: true });
      });
      // Nạp tiền thật -> nạp tiền gần đây + cộng bảng xếp hạng (không mất dữ liệu ảo)
      (db.transactions || []).filter((x) => x.type === 'deposit' && x.amount > 0).forEach((x) => {
        const key = 'D' + x.id;
        if (seenReal.has(key)) return;
        seenReal.add(key);
        deposits.unshift({ name: 'Bạn', amount: x.amount, time: Date.parse(x.date) || Date.now(), fake: false, real: true });
        rank['Bạn (bạn)'] = (rank['Bạn (bạn)'] || 0) + x.amount;
      });
      orders.sort((a, b) => b.time - a.time);
      deposits.sort((a, b) => b.time - a.time);
    }

    function tick() {
      // Thêm 1 mục ảo mới, cập nhật lại thời gian tương đối
      if (Math.random() < 0.55) {orders.unshift(makeFakeOrder(6));} else
      {const d = makeFakeDeposit(6);deposits.unshift(d);rank[d.name] = (rank[d.name] || 0) + d.amount;}
      // Thỉnh thoảng "đại gia" nạp thêm để bảng xếp hạng nhảy
      if (Math.random() < 0.25) {const names = Object.keys(rank);if (names.length) {const n = pick(names);rank[n] += pick(DEPOSIT_AMOUNTS);}}
      if (orders.length > 40) orders.length = 40;
      if (deposits.length > 40) deposits.length = 40;
      render();
    }

    function medal(i) {return i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';}

    function render() {
      const rankEl = $('#rankList');
      if (rankEl) {
        const top = Object.entries(rank).sort((a, b) => b[1] - a[1]).slice(0, 6);
        rankEl.innerHTML = top.map(([name, total], i) => `
          <div class="rank-row ${medal(i)}">
            <span class="rank-pos">${i + 1}</span>
            <span class="rank-name">${esc(name)}</span>
            <span class="rank-total">${fmt(total)}</span>
          </div>`).join('');
      }
      const ordEl = $('#orderFeed');
      if (ordEl) {
        ordEl.innerHTML = orders.slice(0, 8).map((o) => `
          <div class="feed-row${o.real ? ' feed-real' : ''}">
            <span class="feed-ava" data-icon="cart"></span>
            <span class="feed-main"><b>${esc(o.name)}</b> mua <b>${esc(o.product)}</b>${o.label ? ` · ${esc(o.label)}` : ''}<span class="feed-time">${relTime(o.time)}</span></span>
            <span class="feed-amt">${fmt(o.price)}</span>
          </div>`).join('');
        applyIcons(ordEl);
      }
      const depEl = $('#depositFeed');
      if (depEl) {
        depEl.innerHTML = deposits.slice(0, 8).map((d) => `
          <div class="feed-row${d.real ? ' feed-real' : ''}">
            <span class="feed-ava dep" data-icon="wallet"></span>
            <span class="feed-main"><b>${esc(d.name)}</b> đã nạp<span class="feed-time">${relTime(d.time)}</span></span>
            <span class="feed-amt plus">+${fmt(d.amount)}</span>
          </div>`).join('');
        applyIcons(depEl);
      }
    }

    function init() {
      productPool = buildProductPool(Store.db.config);
      seed();
      mergeReal(Store.db);
      render();
      if (timer) clearInterval(timer);
      timer = setInterval(tick, rndInt(6000, 9000));
      Store.onChange((db) => {mergeReal(db);render();});
    }

    return { init };
  })();

  // ============================================================
  // MARQUEE — cuộn text ngang liên tục bằng requestAnimationFrame
  // Không phụ thuộc CSS animation, hoạt động trên mọi browser/device.
  // ============================================================
  let _marqueeRaf = null;
  function startMarquee(speedSec) {
    const track = document.getElementById('marqueeTrack');
    if (!track) return;

    // Tắt CSS animation để tránh conflict
    track.style.animation = 'none';
    track.style.willChange = 'transform';

    if (_marqueeRaf) {cancelAnimationFrame(_marqueeRaf);_marqueeRaf = null;}

    let pos = 0;
    let lastTime = null;

    function step(ts) {
      if (!lastTime) lastTime = ts;
      const dt = ts - lastTime;
      lastTime = ts;

      // Tốc độ px/ms = (half width) / (speedSec * 1000)
      const half = track.scrollWidth / 2;
      if (half > 0) {
        const pxPerMs = half / ((speedSec || 26) * 1000);
        pos -= pxPerMs * dt;
        if (pos <= -half) pos += half;
        track.style.transform = `translateX(${pos}px)`;
      }
      _marqueeRaf = requestAnimationFrame(step);
    }

    _marqueeRaf = requestAnimationFrame(step);
  }

  // ============================================================
  // FLASH SALE — banner đếm ngược trên trang chủ
  // ============================================================
  let _flashTimer = null;
  function updateFlashSaleBar() {
    const bar = $('#flashSaleBar');
    if (!bar) return;
    const f = Store.flashSaleInfo();
    if (!f.active) {bar.hidden = true;return;}
    bar.hidden = false;
    setText('#flashSaleTitle', f.title || 'FLASH SALE');
    setText('#flashSaleDesc', `Giảm ${f.percent}% toàn bộ sản phẩm`);
    const cd = $('#flashSaleCountdown');
    if (f.endsAt) {
      const ms = f.remainingMs;
      const s = Math.floor(ms / 1000);
      const d = Math.floor(s / 86400);
      const h = Math.floor(s % 86400 / 3600);
      const m = Math.floor(s % 3600 / 60);
      const sec = s % 60;
      const pad = (n) => String(n).padStart(2, '0');
      cd.textContent = (d > 0 ? `${d} ngày ` : '') + `${pad(h)}:${pad(m)}:${pad(sec)}`;
      cd.hidden = false;
    } else {
      cd.hidden = true;
    }
  }
  function wireFlashSaleBar() {
    updateFlashSaleBar();
    if (_flashTimer) clearInterval(_flashTimer);
    _flashTimer = setInterval(() => {
      const before = Store.flashSaleInfo().active;
      updateFlashSaleBar();
      // Khi flash sale vừa hết giờ -> render lại sản phẩm để bỏ giá sale.
      if (before && !Store.flashSaleInfo().active) renderDynamic();
    }, 1000);
  }

  // ============================================================
  // THEME — chế độ Sáng / Tối (lưu lựa chọn của khách)
  // ============================================================
  const THEME_KEY = 'kenios_theme';
  function applyTheme(theme) {
    const t = theme === 'light' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', t);
    // Cập nhật MỌI nút chuyển sáng/tối (hiện chỉ còn 1 nút trong menu 3 gạch).
    $$('[data-theme-toggle]').forEach((btn) => {
      btn.innerHTML = t === 'light' ? ICONS.moon || '🌙' : ICONS.sun || '☀️';
      btn.setAttribute('aria-label', t === 'light' ? 'Chuyển chế độ tối' : 'Chuyển chế độ sáng');
      btn.title = t === 'light' ? 'Chuyển chế độ tối' : 'Chuyển chế độ sáng';
    });
  }
  function wireThemeToggle() {
    let saved = 'dark';
    try {saved = localStorage.getItem(THEME_KEY) || 'dark';} catch {}
    applyTheme(saved);
    $$('[data-theme-toggle]').forEach((btn) => btn.addEventListener('click', (e) => {
      e.preventDefault();e.stopPropagation();
      const cur = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      const next = cur === 'light' ? 'dark' : 'light';
      applyTheme(next);
      try {localStorage.setItem(THEME_KEY, next);} catch {}
    }));
  }

  // ---- PWA: đăng ký service worker + nút "Cài đặt ứng dụng" (thêm vào màn hình chính) ----
  function wirePwa() {
    // Đăng ký service worker NGAY (boot chạy sau khi trang đã tải nên không cần chờ 'load';
    // đợi 'load' sẽ lỡ sự kiện vì boot await fetch xong mới tới đây).
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('./sw.js').catch(() => {/* không sao nếu thất bại */});
    }
    const btn = $('#installAppBtn');
    if (!btn) return;
    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (standalone) return; // đã cài rồi thì không hiện nút

    let deferredPrompt = null;
    // Android/Chrome: bắt sự kiện để hiện nút cài đặt gọn trong menu.
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      btn.hidden = false;
    });
    window.addEventListener('appinstalled', () => {btn.hidden = true;deferredPrompt = null;toast('Đã cài KENIOS.STORE vào màn hình chính!', 'success');});

    // iPhone/iPad Safari không có beforeinstallprompt -> hiện nút kèm hướng dẫn thủ công.
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (isIos) btn.hidden = false;

    btn.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        try {await deferredPrompt.userChoice;} catch {/* ignore */}
        deferredPrompt = null;
        btn.hidden = true;
      } else if (isIos) {
        toast('Trên iPhone: bấm nút Chia sẻ ⎋ ở thanh dưới → chọn "Thêm vào MH chính".', 'info');
      } else {
        toast('Mở trình duyệt Chrome và bấm menu ⋮ → "Cài đặt ứng dụng / Thêm vào MH chính".', 'info');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', boot);

  function hideBootLoader() {
    const loader = $('#bootLoader');
    if (loader && !loader.dataset.hidden) {
      loader.dataset.hidden = '1';
      loader.classList.add('hidden');
      setTimeout(() => loader.remove(), 500);
    }
  }

  async function boot() {
    // Chạy từng bước có bọc lỗi: một hàm lỗi (VD thiếu phần tử) KHÔNG được làm sập
    // cả trang và kẹt màn hình chờ. Ghi log để còn gỡ lỗi.
    const step = (fn, name) => {try {fn();} catch (e) {console.error('Boot lỗi ở ' + name + ':', e);}};
    // Phao cứu: dù có bất kỳ lỗi/treo nào, sau 12s vẫn gỡ màn hình chờ để người dùng
    // thấy được trang (đặc biệt trên trình duyệt trong app Telegram/Zalo).
    const failsafe = setTimeout(hideBootLoader, 12000);

    step(() => Voice.init(), 'Voice.init');
    step(() => Effects.init(), 'Effects.init');
    try {
      await Store.init();
    } catch (e) {
      console.error('Store.init lỗi, dùng dữ liệu mặc định:', e);
      // Dùng window.* (không phải global.* — IIFE này không có tham số global nên sẽ lỗi
      // ReferenceError khiến fallback không chạy, web trắng khi máy chủ chậm/lỗi).
      try {Store.db = JSON.parse(JSON.stringify(window.KENIOS_DEFAULT_DB));} catch (_) {}
    }
    step(() => Store.onChange(renderDynamic), 'onChange');

    step(applyIcons, 'applyIcons');
    step(renderStatic, 'renderStatic');
    step(renderDynamic, 'renderDynamic');
    step(renderFaq, 'renderFaq');
    step(wireGlobalUI, 'wireGlobalUI');
    step(wireAuthModal, 'wireAuthModal');
    step(wireDepositModal, 'wireDepositModal');
    step(wireServiceModal, 'wireServiceModal');
    step(wireCart, 'wireCart');
    step(wireAdminModal, 'wireAdminModal');
    step(wireLegalModal, 'wireLegalModal');
    step(wireAiWidget, 'wireAiWidget');
    step(wireSearchModal, 'wireSearchModal');
    step(wireScrollReveal, 'wireScrollReveal');
    step(wireScrollTopButton, 'wireScrollTopButton');
    step(wireFlashSaleBar, 'wireFlashSaleBar');
    step(wireThemeToggle, 'wireThemeToggle');
    step(wireServiceFilters, 'wireServiceFilters');
    step(wirePwa, 'wirePwa');

    clearTimeout(failsafe);
    hideBootLoader();

    step(() => maybeShowWelcome(Store.db.config), 'maybeShowWelcome');
  }

  // ---- Thông báo popup khi vào web (đã bỏ tính năng lời chào bằng giọng nói). ----
  const WELCOME_POPUP_SHOWN_KEY = 'kenios_welcome_popup_shown_v1';

  function maybeShowWelcome(cfg) {
    // welcomeAlways = bật (mặc định) thì hiện popup MỌI LẦN vào web; tắt thì chỉ 1 lần mỗi phiên.
    const always = cfg.welcomeAlways !== false;
    if (cfg.welcomePopupEnabled && (always || !sessionStorage.getItem(WELCOME_POPUP_SHOWN_KEY))) {
      sessionStorage.setItem(WELCOME_POPUP_SHOWN_KEY, '1');
      setTimeout(() => {
        setText('#welcomeTitle', cfg.welcomePopupTitle);
        setText('#welcomeMessage', cfg.welcomePopupMessage);
        setAttr('#welcomeContactBtn', 'href', cfg.zaloLink);
        openModal('#welcomeModal');
      }, 600);
    }
  }

  // ============================================================
  // RENDER — phần tĩnh (cấu hình site, chỉ đọc 1 lần)
  // ============================================================
  function renderStatic() {
    const cfg = Store.db.config;
    document.title = cfg.siteTitle;
    setText('#brandName', cfg.logoText);
    setText('#brandSub', cfg.logoSubtext);
    setText('#mobileNavBrandName', cfg.logoText);
    setText('#mobileNavBrandSub', cfg.logoSubtext);
    setText('#footerBrand', cfg.logoText);
    setText('#footerDesc', cfg.contactAdminDesc);
    setText('#footerAdminName', `${cfg.contactAdminName} — ${cfg.contactAdminSub}`);
    setText('#footerHotline', cfg.hotline);
    const hotlineItem = $('#footerHotlineItem');
    if (hotlineItem) hotlineItem.hidden = !(cfg.hotline && cfg.hotline.trim());
    setText('#footerYear', new Date().getFullYear());
    renderContactWidgets(cfg);

    setText('#heroTag', cfg.bannerTagText);
    setText('#heroBrandName', cfg.logoText);
    setText('#heroTitle', cfg.siteTitle.replace(/^.*?-\s*/, ''));
    setText('#heroSub', cfg.siteSubtitle);
    setText('#heroBtn1', cfg.bannerBtn1Text);
    setText('#heroBtn2', cfg.bannerBtn2Text);
    applyHeroBackground(cfg.bgUrl);
    applySiteBackground(cfg.siteBgUrl);

    const m = `${ico('megaphone')} ${esc(cfg.marqueeText || '')}`;
    const mq1 = $('#marqueeText1'),mq2 = $('#marqueeText2');
    if (mq1) mq1.innerHTML = m;
    if (mq2) mq2.innerHTML = m;
    // Marquee chạy bằng JS requestAnimationFrame — không bị block bởi prefers-reduced-motion hay CSS cache
    const marqueeSpeed = cfg.marqueeSpeed || 26;
    startMarquee(marqueeSpeed);

    applyBranding(cfg);
    setupGoogleSignIn(cfg);
    setText('#aiName', cfg.aiName);
    if ($('#aiAvatar')) $('#aiAvatar').src = cfg.aiAvatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=kenios-ai`;

    Voice.setPrefs({ enabled: !!cfg.ttsEnabled, rate: cfg.ttsRate || 1, pitch: cfg.ttsPitch || 1 });

    renderPosts();
  }

  // ---- Đăng nhập bằng Google (một chạm, không cần mã xác nhận) ----
  let _gsiScriptLoading = null;
  function loadGoogleScript() {var _window$google;
    if ((_window$google = window.google) !== null && _window$google !== void 0 && (_window$google = _window$google.accounts) !== null && _window$google !== void 0 && _window$google.id) return Promise.resolve();
    if (_gsiScriptLoading) return _gsiScriptLoading;
    _gsiScriptLoading = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true;
      s.onload = resolve;
      s.onerror = () => {_gsiScriptLoading = null;reject(new Error('Không tải được Google Sign-In script.'));};
      document.head.appendChild(s);
    });
    return _gsiScriptLoading;
  }

  async function setupGoogleSignIn(cfg) {
    const box = $('#googleSignInBox');
    const fallback = $('#googleFallbackBtn');
    if (!box) return;
    if (!cfg.googleClientId) {box.hidden = true;return;}
    try {
      await loadGoogleScript();
      box.hidden = false;
      if (fallback) fallback.hidden = true;
      box.innerHTML = '';
      window.google.accounts.id.initialize({
        client_id: cfg.googleClientId,
        callback: handleGoogleCredential
      });
      window.google.accounts.id.renderButton(box, { theme: 'filled_black', size: 'large', shape: 'pill', text: 'signin_with', width: 280 });
    } catch (err) {
      console.warn(err);
      box.hidden = true;
    }
  }

  function handleGoogleCredential(response) {
    Store.loginWithGoogle(response.credential).then(() => {
      closeModal('#authModal');
      toast('Đăng nhập bằng Google thành công!', 'success');
    }).catch((err) => toast(err.message, 'error'));
  }

  // ---- Thương hiệu: logo (ảnh/font/màu) + màu chủ đạo toàn site ----
  // Font chữ logo — gồm font chữ thường + nhiều font ĐẬM / 3D / display cho logo game.
  // (Bungee Shade có sẵn hiệu ứng bóng 3D; Russo One/Black Ops One/Anton… kiểu chữ khối 3D.)
  const LOGO_FONTS = [
  'Be Vietnam Pro', 'Poppins', 'Montserrat', 'Playfair Display', 'Pacifico',
  'Orbitron', 'Russo One', 'Black Ops One', 'Anton', 'Staatliches', 'Archivo Black',
  'Bungee', 'Bungee Shade', 'Bungee Inline', 'Titan One', 'Bowlby One SC',
  'Rubik Mono One', 'Passion One', 'Luckiest Guy', 'Bangers', 'Fredoka',
  'Righteous', 'Monoton', 'Faster One'];

  // Font có nhiều độ đậm (nạp kèm trục wght); còn lại là font 1 độ đậm → nạp trơn.
  const WEIGHTED_FONTS = new Set(['Be Vietnam Pro', 'Poppins', 'Montserrat', 'Playfair Display', 'Fredoka']);
  const BANK_OPTIONS = [
  'ACB', 'Vietcombank', 'VietinBank', 'BIDV', 'MBBank', 'Techcombank', 'VPBank',
  'TPBank', 'Sacombank', 'HDBank', 'SHB', 'OCB', 'MSB', 'SeABank', 'VIB', 'Agribank'];

  const _loadedFonts = new Set(['Be Vietnam Pro']);

  function ensureFontLoaded(fontName) {
    if (!fontName || _loadedFonts.has(fontName)) return;
    // Font display 1 độ đậm sẽ lỗi nếu ép trục wght → chỉ font nhiều độ đậm mới thêm wght.
    const spec = WEIGHTED_FONTS.has(fontName) ? ':wght@400;600;700;800' : '';
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}${spec}&display=swap`;
    document.head.appendChild(link);
    _loadedFonts.add(fontName);
  }

  // ---- Widget liên hệ đa kênh: 1 kênh bật -> nút thẳng; nhiều kênh bật -> gộp
  // thành 1 nút mở ra danh sách. Dùng chung cho header / footer / popup chào mừng. ----
  function renderContactWidgets(cfg) {
    const channels = cfg.contactChannels || [];
    renderContactWidget($('#headerContactWrap'), channels, { btnClass: 'btn btn-ghost btn-sm' });
    renderContactWidget($('#drawerContactWrap'), channels, { btnClass: 'btn btn-glass btn-sm btn-block' });
    renderContactWidget($('#footerContactWrap'), channels, { btnClass: 'btn btn-glass btn-sm', dropUp: true });
    renderContactWidget($('#welcomeContactWrap'), channels, { btnClass: 'btn btn-primary btn-block' });
    renderContactSection(cfg);
  }

  // Phần "Liên Hệ & Cộng Đồng" trên trang — hiện các kênh/nhóm mạng xã hội dạng thẻ.
  function renderContactSection(cfg) {
    const grid = $('#contactGroups');
    const empty = $('#contactEmpty');
    if (!grid) return;
    const enabled = (cfg.contactChannels || []).filter((c) => c.enabled && c.url);
    if (!enabled.length) {
      grid.innerHTML = '';
      if (empty) empty.hidden = false;
      return;
    }
    if (empty) empty.hidden = true;
    grid.innerHTML = enabled.map((c) => {
      const t = chType(c);
      const isTel = c.url.startsWith('tel:') || c.url.startsWith('mailto:');
      const attrs = isTel ? '' : 'target="_blank" rel="noopener"';
      const cta = /nhóm|group|zalo\.me\/g\/|t\.me\/|chat\.whatsapp|discord\.gg/i.test(c.url) ? 'Tham gia nhóm' : 'Liên hệ ngay';
      const label = c.label || CONTACT_PLATFORM_LABEL[t] || 'Liên hệ';
      return `
        <a class="contact-card contact-${esc(t)}" href="${esc(c.url)}" ${attrs}>
          <span class="contact-card-ico">${contactChannelIcon(t)}</span>
          <span class="contact-card-body">
            <strong>${esc(label)}</strong>
            <small>${esc(cta)}</small>
          </span>
          <span class="contact-card-arrow" aria-hidden="true">${ICONS.chevron || ''}</span>
        </a>`;
    }).join('');
  }

  function renderContactWidget(container, channels, opts = {}) {
    if (!container) return;
    const enabled = channels.filter((c) => c.enabled && c.url);
    container.innerHTML = '';
    if (!enabled.length) {container.hidden = true;return;}
    container.hidden = false;

    if (enabled.length === 1) {
      const c = enabled[0];
      const a = document.createElement('a');
      a.href = c.url;
      if (!c.url.startsWith('tel:') && !c.url.startsWith('mailto:')) {a.target = '_blank';a.rel = 'noopener';}
      a.className = opts.btnClass;
      a.innerHTML = `<span class="ch-ico">${contactChannelIcon(chType(c))}</span> ${esc(c.label || CONTACT_PLATFORM_LABEL[chType(c)] || 'Liên hệ')}`;
      container.appendChild(a);
      return;
    }

    const wrap = document.createElement('div');
    wrap.className = 'contact-widget';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = opts.btnClass;
    btn.innerHTML = `${ico('headset')} Liên hệ`;
    const dropdown = document.createElement('div');
    dropdown.className = 'contact-dropdown' + (opts.dropUp ? ' drop-up' : '');
    dropdown.innerHTML = enabled.map((c) => {
      const targetAttrs = !c.url.startsWith('tel:') && !c.url.startsWith('mailto:') ? 'target="_blank" rel="noopener"' : '';
      return `<a href="${esc(c.url)}" ${targetAttrs}><span class="ch-ico">${contactChannelIcon(chType(c))}</span> ${esc(c.label || CONTACT_PLATFORM_LABEL[chType(c)] || 'Liên hệ')}</a>`;
    }).join('');
    btn.addEventListener('click', (e) => {e.stopPropagation();dropdown.classList.toggle('open');});
    document.addEventListener('click', () => dropdown.classList.remove('open'));
    wrap.appendChild(btn);
    wrap.appendChild(dropdown);
    container.appendChild(wrap);
  }

  function applyBranding(cfg) {
    // Logo mặc định giờ là ẢNH đầy đủ (logo.png) → LUÔN hiển thị full khung (phủ kín, không
    // viền/nền trang trí) như app-icon, dù admin có đặt logo riêng hay không.
    const hasPhoto = true;
    const logoUrl = cfg.logoUrl || '';
    const isVid = isVideoUrl(logoUrl); // logo là VIDEO -> dùng <video>, không phải <img>
    const src = logoUrl || './logo.png';
    $$('.brand-mark-wrap, .mobile-nav-brand-mark, .auth-logo').forEach((w) => {
      w.classList.toggle('has-photo', hasPhoto);
      const idAttr = w.classList.contains('mobile-nav-brand-mark') ? ' id="mobileNavLogo"' : '';
      w.innerHTML = isVid ?
      `<video class="brand-mark"${idAttr} src="${esc(src)}" muted loop autoplay playsinline></video>` :
      `<img class="brand-mark"${idAttr} src="${esc(src)}" alt="">`;
    });

    // Áp logo cho MỌI chỗ khác có logo: favicon (tab trình duyệt), apple-touch-icon, màn
    // hình chờ, màn bảo trì, logo modal đăng nhập. Logo dạng VIDEO không dùng được cho các
    // chỗ này (favicon/ảnh) nên tự động dùng ảnh logo mặc định.
    const imgLogo = logoUrl && !isVid ? logoUrl : './logo.png';
    document.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]').forEach((l) => {l.href = imgLogo;});
    document.querySelectorAll('.maintenance-logo, .boot-loader-mark').forEach((img) => {if (img.tagName === 'IMG') img.src = imgLogo;});
    const authLogoImg = document.querySelector('.auth-logo img');
    if (authLogoImg) authLogoImg.src = imgLogo;

    const font = cfg.logoFont || 'Be Vietnam Pro';
    ensureFontLoaded(font);
    document.documentElement.style.setProperty('--logo-font', `'${font}', 'Be Vietnam Pro', sans-serif`);
    document.documentElement.style.setProperty('--logo-color', cfg.logoColor || 'inherit');

    // Tông chủ đạo mới là cyan. Tự di trú màu VÀNG mặc định cũ (#ffb703) sang cyan
    // để web đang chạy hết vàng ngay mà admin không cần chỉnh; màu tự chọn khác vẫn giữ.
    let accent = cfg.accentColor || "#22d3ee";
    if (typeof accent === 'string' && accent.trim().toLowerCase() === '#ffb703') accent = '#22d3ee';
    document.documentElement.style.setProperty('--gold', accent);
    document.documentElement.style.setProperty('--gold-soft', `color-mix(in srgb, ${accent} 70%, white)`);

    // Hai nhóm tách biệt: MÀU CHẠY (logoColorMode) + CHUYỂN ĐỘNG (logoMotionMode), tốc độ riêng.
    const colorSpeed = cfg.logoAnimSpeed || 6;
    const motionSpeed = cfg.logoMotionSpeed || 2;
    document.documentElement.style.setProperty('--logo-anim-speed', `${colorSpeed}s`);
    document.documentElement.style.setProperty('--logo-motion-speed', `${motionSpeed}s`);
    const colorMode = cfg.logoColorMode || 'solid';
    const motionMode = cfg.logoMotionMode || 'none';
    // Áp hiệu ứng cho logo header, logo menu 3 gạch VÀ logo banner hero — để hero
    // luôn ĐỒNG BỘ (màu chạy + chuyển động) với logo chính khi admin đổi cấu hình.
    $$('#brandName, #mobileNavBrandName, #heroBrandName').forEach((el) => {
      el.classList.remove(
        ...LOGO_COLOR_MODES.map((m) => 'logo-color-' + m),
        ...LOGO_MOTION_MODES.map((m) => 'logo-motion-' + m)
      );
      const anims = [];
      if (LOGO_COLOR_ANIM[colorMode]) {
        el.classList.add('logo-color-' + colorMode);
        anims.push(`${LOGO_COLOR_ANIM[colorMode][0]} ${colorSpeed}s ${LOGO_COLOR_ANIM[colorMode][1]} infinite`);
      }
      if (LOGO_MOTION_ANIM[motionMode]) {
        el.classList.add('logo-motion-' + motionMode);
        anims.push(`${LOGO_MOTION_ANIM[motionMode][0]} ${motionSpeed}s ${LOGO_MOTION_ANIM[motionMode][1]} infinite`);
      }
      // Gộp cả 2 animation vào 1 khai báo inline để chạy đồng thời (không đè nhau).
      el.style.animation = anims.join(', ');
    });
  }

  // XEM TRƯỚC TRỰC TIẾP: đọc các lựa chọn logo/màu đang chọn trong form Cấu hình
  // và áp NGAY lên logo thật (header, menu 3 gạch, hero) mà chưa cần bấm Lưu.
  function liveBrandingPreview() {
    const form = $('[data-admin-form="config"]');
    if (!form) return;
    const fd = new FormData(form);
    const preview = Object.assign({}, Store.db.config, {
      logoFont: fd.get('logoFont') || Store.db.config.logoFont,
      logoColor: fd.get('logoColor') || Store.db.config.logoColor,
      logoColorMode: fd.get('logoColorMode') || 'solid',
      logoAnimSpeed: parseFloat(fd.get('logoAnimSpeed')) || 6,
      logoMotionMode: fd.get('logoMotionMode') || 'none',
      logoMotionSpeed: parseFloat(fd.get('logoMotionSpeed')) || 2,
      accentColor: fd.get('accentColor') || Store.db.config.accentColor,
      logoUrl: fd.get('logoUrl') != null ? fd.get('logoUrl') : Store.db.config.logoUrl
    });
    applyBranding(preview);
  }

  // ============================================================
  // RENDER — phần động (phụ thuộc trạng thái đăng nhập / dữ liệu đổi)
  // ============================================================
  function renderDynamic() {
    renderAuthArea();
    renderHeroStats();
    renderCategories();
    renderDrawerCategories();
    renderServiceGrid();
    renderWebdesignGrid();
    renderShowcase();
    renderCombos();
    if (typeof updateFlashSaleBar === 'function') updateFlashSaleBar();
    injectSeoJsonLd();
    applyMaintenanceMode();
  }

  // Khung ảnh thẻ danh mục / thư mục con / sản phẩm dùng KHUNG CỐ ĐỊNH 4:3 (đặt trong CSS)
  // và ảnh/video phủ kín bằng cover. Vì vậy dù admin up ảnh rộng/cao bao nhiêu, cột và
  // khung thẻ vẫn giữ NGUYÊN kích thước, không nới rộng, không xê dịch chữ. Không đặt
  // --media-ar cho lưới thẻ nữa (chỉ modal chi tiết mới ăn theo tỷ lệ ảnh thật).

  // Chế độ bảo trì: khi admin bật, khách thấy trang "Đang bảo trì" và không thao tác được.
  // Admin (đang đăng nhập vai admin) VẪN vào bình thường để cập nhật shop.
  function applyMaintenanceMode() {
    const overlay = $('#maintenanceOverlay');
    if (!overlay) return;
    const cfg = Store.db.config || {};
    const show = !!cfg.maintenanceMode && !(Store.isAdmin && Store.isAdmin());
    if (show) {
      const msg = (cfg.maintenanceMessage || '').trim() || 'Shop đang được nâng cấp, vui lòng quay lại sau ít phút. Cảm ơn bạn!';
      setText('#maintenanceMsg', msg);
      overlay.hidden = false;
      document.body.classList.add('maintenance-on');
    } else {
      overlay.hidden = true;
      document.body.classList.remove('maintenance-on');
    }
    // Nút "Đăng nhập Admin" trên trang bảo trì -> mở hộp đăng nhập (modal nổi trên overlay).
    const loginBtn = $('#maintenanceAdminLogin');
    if (loginBtn && !loginBtn.dataset.wired) {
      loginBtn.dataset.wired = '1';
      loginBtn.addEventListener('click', () => openModal('#authModal'));
    }
  }

  // Chèn dữ liệu có cấu trúc (JSON-LD schema.org) cho Google/Zalo: thông tin cửa hàng +
  // danh sách sản phẩm kèm giá & tình trạng còn hàng. Giúp lên kết quả tìm kiếm đẹp hơn.
  function injectSeoJsonLd() {
    try {
      const cfg = Store.db && Store.db.config || {};
      const base = location.origin + location.pathname.replace(/[^/]*$/, '');
      const storeName = cfg.logoText || 'KENIOS.STORE';
      const abs = (u) => u && /^https?:/i.test(u) ? u : '';
      const desc = cfg.metaDescription || cfg.welcomePopupMessage || 'Cửa hàng dịch vụ game & thiết kế website.';
      const store = { '@type': 'OnlineStore', name: storeName, url: base, logo: abs(cfg.logoUrl) || base + 'logo.png', description: desc };
      const sameAs = (cfg.contactChannels || []).filter((c) => c && c.enabled && abs(c.url)).map((c) => c.url);
      if (sameAs.length) store.sameAs = sameAs;
      const services = Store.db && Store.db.services || [];
      const items = services.slice(0, 50).map((s, i) => {
        const prices = (s.packages || []).map((p) => parseFloat(p.price)).filter((n) => n > 0);
        const minPrice = prices.length ? Math.min(...prices) : 0;
        const inStock = (s.packages || []).some((p) => p.keyCount == null || p.keyCount > 0 || p.keys && p.keys.length);
        const product = {
          '@type': 'Product', name: s.name || 'Sản phẩm', description: s.description || storeName,
          offers: { '@type': 'Offer', price: minPrice, priceCurrency: 'VND', url: base,
            availability: 'https://schema.org/' + (inStock ? 'InStock' : 'OutOfStock') }
        };
        if (abs(s.image)) product.image = s.image;
        return { '@type': 'ListItem', position: i + 1, item: product };
      });
      const graph = [store];
      if (items.length) graph.push({ '@type': 'ItemList', name: 'Sản phẩm & dịch vụ', itemListElement: items });
      const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
      let el = document.getElementById('seoJsonLd');
      if (!el) {el = document.createElement('script');el.type = 'application/ld+json';el.id = 'seoJsonLd';document.head.appendChild(el);}
      el.textContent = json;
    } catch (e) {console.error('SEO JSON-LD lỗi:', e);}
  }

  // Hiển thị các combo ưu đãi ở trang chủ (ẩn section nếu chưa có combo nào).
  function renderCombos() {
    const section = $('#combos');
    const grid = $('#comboGrid');
    if (!section || !grid) return;
    const combos = Store.combos();
    if (!combos.length) {section.hidden = true;grid.innerHTML = '';return;}
    section.hidden = false;
    grid.innerHTML = combos.map((c) => {
      const orig = Store.comboOriginalPrice(c);
      const save = orig - (Number(c.price) || 0);
      const mediaHtml = c.image ? isVideoUrl(c.image) ?
      `<video class="combo-media" src="${esc(c.image)}" muted loop autoplay playsinline></video>` :
      `<div class="combo-media" style="background-image:url('${esc(c.image)}')"></div>` : '';
      const itemsHtml = (c.items || []).map((it) => {
        const svc = Store.db.services.find((s) => s.id === it.serviceId);
        const pkg = svc && (svc.packages || []).find((p) => p.id === it.packageId);
        return svc && pkg ? `<li>${esc(svc.name)} — ${esc(pkg.name)}</li>` : '';
      }).join('');
      return `
        <div class="combo-card">
          ${mediaHtml}
          <div class="combo-card-body">
            <h3>${esc(c.name)}</h3>
            ${c.description ? `<p class="combo-desc">${esc(c.description)}</p>` : ''}
            <ul class="combo-items">${itemsHtml}</ul>
            <div class="combo-price-row">
              <div class="combo-prices"><strong>${fmt(c.price)}</strong>${save > 0 ? `<s>${fmt(orig)}</s>` : ''}</div>
              ${save > 0 ? `<span class="combo-save">Tiết kiệm ${fmt(save)}</span>` : ''}
            </div>
            <button type="button" class="btn btn-primary btn-block combo-buy" data-buy-combo="${esc(c.id)}">Mua combo</button>
          </div>
        </div>`;
    }).join('');
    $$('[data-buy-combo]', grid).forEach((btn) => {btn.onclick = () => buyComboFlow(btn.dataset.buyCombo);});
  }

  function buyComboFlow(comboId) {
    if (!Store.currentUser()) {toast('Vui lòng đăng nhập trước khi mua.', 'error');openModal('#authModal');return;}
    const combo = Store.combos().find((c) => c.id === comboId);
    if (!combo) return;
    // Nhắc nhẹ trước khi mua combo (tránh bấm nhầm mất tiền).
    if (!confirm(`Mua combo "${combo.name}" với giá ${fmt(combo.price)}? Số tiền sẽ trừ vào số dư của bạn.`)) return;
    (async () => {
      try {
        await Store.purchaseCombo(comboId);
        toast('Mua combo thành công! Xem key trong "Đơn hàng của tôi".', 'success');
        openOrdersModal();
      } catch (err) {toast(err.message, 'error');}
    })();
  }

  // Mục "Hình ảnh & Video" — độc lập với banner Hero, lấy từ Thư viện (Store.db.media).
  function renderShowcase() {
    const grid = $('#showcaseGrid');
    const section = $('#showcase');
    if (!grid || !section) return;
    // Mặc định ẨN mục "Hình ảnh & Video" cho web nhẹ (không tải ảnh/video thừa).
    // Admin có thể bật lại: Cấu hình → "Hiện mục Hình ảnh & Video".
    if (Store.db.config.showcaseEnabled !== true) {section.hidden = true;grid.innerHTML = '';return;}
    const media = (Store.db.media || []).filter((m) => m.showcase !== false);
    if (!media.length) {section.hidden = true;grid.innerHTML = '';return;}
    section.hidden = false;
    grid.innerHTML = media.map((m) => `
      <div class="showcase-item">
        ${m.type === 'video' ?
    `<video src="${esc(m.url)}" muted loop autoplay playsinline></video>` :
    `<img src="${esc(m.url)}" alt="${esc(m.name || '')}" loading="lazy">`}
      </div>`).join('');
  }

  function categoryMediaHtml(c) {
    if (!c.image) return '';
    if (isVideoUrl(c.image)) {
      return `<video class="category-media" src="${esc(c.image)}" muted loop autoplay playsinline></video>`;
    }
    return `<div class="category-media" data-fallback-bg="${esc(c.image)}" style="background-image:url('${esc(c.image)}')"></div>`;
  }

  function categoryCardHtml(c, kind) {
    // kind: 'category' | 'subcategory'
    const dataAttr = kind === 'subcategory' ? `data-subcategory="${esc(c.id)}"` : `data-category="${esc(c.id)}"`;
    return `
      <div class="category-card ${c.image ? 'has-media' : ''}" ${dataAttr} role="button" tabindex="0">
        ${categoryMediaHtml(c)}
        <span class="category-icon">${catIcon(c.icon)}</span>
        <h3>${esc(c.name)}</h3>
        <p>${esc(c.description || '')}</p>
      </div>`;
  }

  function renderBreadcrumb() {
    const bc = $('#categoryBreadcrumb');
    if (!browseCategoryId) {bc.hidden = true;bc.innerHTML = '';return;}
    const cat = Store.db.categories.find((c) => c.id === browseCategoryId);
    const sub = browseSubId ? (Store.db.subcategories || []).find((s) => s.id === browseSubId) : null;
    const crumbs = [
    `<button class="crumb" data-crumb="root"><span class="crumb-ico" data-crumb-back>${ICONS.back}</span>Danh mục</button>`,
    `<span class="crumb-sep">${ICONS.chevron}</span>`,
    sub ?
    `<button class="crumb" data-crumb="category">${esc(cat ? cat.name : '')}</button>` :
    `<span class="crumb current">${esc(cat ? cat.name : '')}</span>`];

    if (sub) {
      crumbs.push(`<span class="crumb-sep">${ICONS.chevron}</span>`, `<span class="crumb current">${esc(sub.name)}</span>`);
    }
    bc.innerHTML = crumbs.join('');
    bc.hidden = false;
  }

  // Bộ duyệt 3 cấp: Danh mục → Thư mục con → Sản phẩm.
  function renderCategories() {
    const grid = $('#categoryGrid');
    renderBreadcrumb();

    if (!browseCategoryId) {
      // Cấp 1: danh sách Danh mục (bỏ webdesign vì đã có mục "Thiết Kế Website" riêng).
      const cats = Store.db.categories.filter((c) => c.id !== 'webdesign');
      grid.innerHTML = cats.map((c) => categoryCardHtml(c, 'category')).join('') ||
      '<p class="empty-note">Chưa có danh mục nào.</p>';
    } else {
      const subs = (Store.db.subcategories || []).filter((s) => s.categoryId === browseCategoryId);
      if (!browseSubId && subs.length) {
        // Cấp 2: các Thư mục con của danh mục + sản phẩm gắn thẳng danh mục (nếu có).
        const directProducts = Store.db.services.filter((s) => s.categoryId === browseCategoryId && !s.subcategoryId);
        grid.innerHTML = subs.map((s) => categoryCardHtml(s, 'subcategory')).join('') +
        directProducts.map(serviceCardHtml).join('');
      } else {
        // Cấp 3: sản phẩm trong thư mục con (hoặc trong danh mục nếu danh mục không có thư mục con).
        const products = browseSubId ?
        Store.db.services.filter((s) => s.subcategoryId === browseSubId) :
        Store.db.services.filter((s) => s.categoryId === browseCategoryId);
        grid.innerHTML = products.length ?
        products.map(serviceCardHtml).join('') :
        '<p class="empty-note">Chưa có sản phẩm nào trong mục này.</p>';
      }
    }
    applyImageFallbacks(grid, '.category-media');
    applyImageFallbacks(grid);

    grid.onclick = (e) => {
      const catCard = e.target.closest('[data-category]');
      if (catCard) {
        browseCategoryId = catCard.dataset.category;
        browseSubId = null;
        renderCategories();
        $('#categories').scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      const subCard = e.target.closest('[data-subcategory]');
      if (subCard) {
        browseSubId = subCard.dataset.subcategory;
        renderCategories();
        $('#categories').scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    };

    const bc = $('#categoryBreadcrumb');
    bc.onclick = (e) => {
      const crumb = e.target.closest('[data-crumb]');
      if (!crumb) return;
      if (crumb.dataset.crumb === 'root') {browseCategoryId = null;browseSubId = null;} else
      if (crumb.dataset.crumb === 'category') {browseSubId = null;}
      renderCategories();
    };

    renderFilterTabs();
  }

  // Render danh mục sản phẩm động trong menu 3 gạch (drawer)
  function renderDrawerCategories() {
    const listEl = $('#drawerCategoriesList');
    if (!listEl) return;
    const cats = Store.db.categories.filter((c) => c.id !== 'webdesign');
    listEl.innerHTML = cats.map((c) => {
      // Tìm các thư mục con (subcategories) cho danh mục này
      const subs = (Store.db.subcategories || []).filter((s) => s.categoryId === c.id);

      let subHtml = '';
      if (subs.length > 0) {
        subHtml = `
          <div class="drawer-subcat-list">
            ${subs.map((s) => `
              <button type="button" class="drawer-subcat-link" data-cat="${esc(c.id)}" data-sub="${esc(s.id)}">
                ${ico('chevron')} ${esc(s.name)}
              </button>
            `).join('')}
          </div>
        `;
      }

      return `
        <div class="drawer-cat-item">
          <button type="button" class="drawer-cat-btn" data-cat="${esc(c.id)}">
            <span style="display:flex;align-items:center;gap:10px;">
              <span class="mnl-icon">${catIcon(c.icon)}</span>
              <span>${esc(c.name)}</span>
            </span>
            ${subs.length > 0 ? `<span style="font-size:0.75rem;opacity:0.6;margin-left:auto;">▼</span>` : ''}
          </button>
          ${subHtml}
        </div>
      `;
    }).join('');

    // Wire sự kiện click cho các nút danh mục chính
    $$('.drawer-cat-btn', listEl).forEach((btn) => {
      btn.onclick = () => {
        const catId = btn.dataset.cat;

        // Cập nhật bộ lọc 3 cấp
        browseCategoryId = catId;
        browseSubId = null;
        renderCategories();

        // Cập nhật bộ lọc tabs dịch vụ nổi bật (nếu có)
        selectedCategory = catId;
        selectedSub = 'all';
        const filterWrap = $('#filterTabs');
        if (filterWrap) {
          $$('.filter-tab', filterWrap).forEach((b) => b.classList.toggle('active', b.dataset.filter === catId));
        }
        renderSubFilterTabs();
        renderServiceGrid();

        closeMobileNavGlobal();
        const target = $('#categories');
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      };
    });

    // Wire sự kiện click cho các nút thư mục con
    $$('.drawer-subcat-link', listEl).forEach((link) => {
      link.onclick = () => {
        const catId = link.dataset.cat;
        const subId = link.dataset.sub;

        // Cập nhật bộ lọc 3 cấp
        browseCategoryId = catId;
        browseSubId = subId;
        renderCategories();

        // Cập nhật bộ lọc tabs dịch vụ nổi bật (nếu có)
        selectedCategory = catId;
        selectedSub = subId;
        const filterWrap = $('#filterTabs');
        if (filterWrap) {
          $$('.filter-tab', filterWrap).forEach((b) => b.classList.toggle('active', b.dataset.filter === catId));
        }
        renderSubFilterTabs();
        const subFilterWrap = $('#subFilterTabs');
        if (subFilterWrap) {
          $$('.filter-tab', subFilterWrap).forEach((b) => b.classList.toggle('active', b.dataset.subfilter === subId));
        }
        renderServiceGrid();

        closeMobileNavGlobal();
        const target = $('#categories');
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      };
    });
  }

  function renderFilterTabs() {
    const filterWrap = $('#filterTabs');
    if (!filterWrap) return;
    const cats = Store.db.categories.filter((c) => c.id !== 'webdesign');
    filterWrap.innerHTML = [`<button class="filter-tab ${selectedCategory === 'all' ? 'active' : ''}" data-filter="all">Tất cả</button>`].
    concat(cats.map((c) => `<button class="filter-tab ${selectedCategory === c.id ? 'active' : ''}" data-filter="${esc(c.id)}"><span class="filter-ico">${catIcon(c.icon)}</span> ${esc(c.name)}</button>`)).
    join('');
    filterWrap.onclick = (e) => {
      const btn = e.target.closest('.filter-tab');
      if (!btn) return;
      selectedCategory = btn.dataset.filter;
      selectedSub = 'all'; // đổi danh mục thì reset thư mục con
      $$('.filter-tab', filterWrap).forEach((b) => b.classList.toggle('active', b === btn));
      renderSubFilterTabs();
      renderServiceGrid();
    };
    renderSubFilterTabs();
  }

  // Hàng lọc thứ 2: thư mục con của danh mục đang chọn (chỉ hiện khi danh mục đó có
  // thư mục con). Bấm danh mục ở hàng trên → hiện hàng thư mục con này để lọc tiếp.
  function renderSubFilterTabs() {
    const wrap = $('#subFilterTabs');
    if (!wrap) return;
    const subs = selectedCategory === 'all' ?
    [] :
    (Store.db.subcategories || []).filter((s) => s.categoryId === selectedCategory);
    if (!subs.length) {wrap.hidden = true;wrap.innerHTML = '';return;}
    wrap.hidden = false;
    wrap.innerHTML = [`<button class="filter-tab sub ${selectedSub === 'all' ? 'active' : ''}" data-subfilter="all">Tất cả</button>`].
    concat(subs.map((s) => `<button class="filter-tab sub ${selectedSub === s.id ? 'active' : ''}" data-subfilter="${esc(s.id)}"><span class="filter-ico">${catIcon(s.icon)}</span> ${esc(s.name)}</button>`)).
    join('');
    wrap.onclick = (e) => {
      const btn = e.target.closest('.filter-tab');
      if (!btn) return;
      selectedSub = btn.dataset.subfilter;
      $$('.filter-tab', wrap).forEach((b) => b.classList.toggle('active', b === btn));
      renderServiceGrid();
    };
  }

  function renderPosts() {
    const grid = $('#postGrid');
    grid.innerHTML = Store.db.posts.map((p) => `
      <article class="post-card">
        <time>${esc(p.date)}</time>
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.summary)}</p>
      </article>
    `).join('');
  }

  // Nền Hero hỗ trợ cả ảnh và video (tự nhận diện qua đuôi file .mp4/.webm/.ogg).
  function isVideoUrl(url) {return /\.(mp4|webm|ogg|ogv|mov|m4v|mkv|avi|3gp|flv|wmv)(\?|#|$)/i.test(url || '');}

  function applyHeroBackground(url) {
    const imgEl = $('#heroBg');
    const videoEl = $('#heroBgVideo');
    if (!url) {imgEl.style.backgroundImage = 'none';videoEl.hidden = true;return;}
    if (isVideoUrl(url)) {
      imgEl.style.backgroundImage = 'none';
      // Trình duyệt trong app (Zalo/Messenger/Facebook) + iOS/Android CHỈ tự chạy video khi:
      // muted + playsinline + GỌI .play() bằng JS. Thuộc tính autoplay trên thẻ KHÔNG đủ khi
      // src được gán bằng JS -> video hero không hiện trên Zalo. Ép đủ điều kiện + gọi play,
      // thử lại khi video tải xong (giống nền toàn trang).
      videoEl.muted = true;videoEl.defaultMuted = true;videoEl.setAttribute('muted', '');
      videoEl.playsInline = true;videoEl.setAttribute('playsinline', '');
      videoEl.setAttribute('webkit-playsinline', '');
      videoEl.loop = true;videoEl.autoplay = true;
      if (videoEl.src !== url) videoEl.src = url;
      videoEl.hidden = false;
      const tryPlay = () => {try {const p = videoEl.play();if (p && p.catch) p.catch(() => {});} catch (e) {/* ignore */}};
      videoEl.onloadeddata = tryPlay;
      videoEl.oncanplay = tryPlay;
      videoEl.onerror = () => {videoEl.hidden = true;};
      videoEl.load();
      tryPlay();
    } else {
      videoEl.hidden = true;videoEl.removeAttribute('src');
      imgEl.style.backgroundImage = `url(${url})`;
    }
  }

  // Nền ẢNH/VIDEO phủ toàn giao diện (cấu hình siteBgUrl) — nhận link giống hero.
  function applySiteBackground(url) {
    const wrap = $('#siteBg');
    const imgEl = $('#siteBgImg');
    const videoEl = $('#siteBgVideo');
    if (!wrap) return;
    // Bật/tắt lớp .site-bg-on trên <html>: khi CÓ nền ảnh/video thì các mảng nền tối
    // (section, footer, header) chuyển sang trong suốt để thấy được nền phía sau; khi
    // KHÔNG dùng nền thì giữ nguyên giao diện tối như cũ.
    document.documentElement.classList.toggle('site-bg-on', !!url);
    if (!url) {
      wrap.hidden = true;
      videoEl.hidden = true;videoEl.removeAttribute('src');
      imgEl.hidden = true;imgEl.style.backgroundImage = 'none';
      return;
    }
    wrap.hidden = false;
    if (isVideoUrl(url)) {
      imgEl.hidden = true;imgEl.style.backgroundImage = 'none';
      // iOS/Android CHỈ tự chạy video khi: muted + playsinline + gọi .play() (thuộc tính
      // autoplay không đủ khi src được gán bằng JS). Đặt đủ rồi ép chạy, thử lại khi tải xong.
      videoEl.muted = true;videoEl.defaultMuted = true;videoEl.setAttribute('muted', '');
      videoEl.playsInline = true;videoEl.setAttribute('playsinline', '');
      videoEl.setAttribute('webkit-playsinline', '');
      videoEl.loop = true;videoEl.autoplay = true;
      if (videoEl.src !== url) videoEl.src = url;
      videoEl.hidden = false;
      const tryPlay = () => {try {const p = videoEl.play();if (p && p.catch) p.catch(() => {});} catch (e) {/* ignore */}};
      videoEl.onloadeddata = tryPlay;
      videoEl.oncanplay = tryPlay;
      videoEl.onerror = () => {videoEl.hidden = true;};
      videoEl.load();
      tryPlay();
    } else {
      videoEl.hidden = true;videoEl.removeAttribute('src');
      imgEl.hidden = false;imgEl.style.backgroundImage = `url(${url})`;
    }
  }

  // ---- FAQ ----
  const FAQ_ITEMS = [
  { q: 'Nạp tiền vào tài khoản như thế nào?', a: 'Vào mục "Nạp tiền", nhập số tiền muốn nạp rồi quét mã VietQR hiển thị. Số dư được cộng tự động ngay sau khi hệ thống xác nhận giao dịch thành công, không cần chờ duyệt thủ công.' },
  { q: 'Mua xong bao lâu thì nhận được key?', a: 'Key được cấp phát tự động ngay lập tức sau khi thanh toán, hiển thị trong mục "Đơn hàng của tôi" và có thể sao chép trực tiếp.' },
  { q: 'Có được hoàn tiền không?', a: 'Do đây là sản phẩm số cấp phát tức thì, đơn hàng đã giao key không thể hoàn tiền trừ khi lỗi từ phía hệ thống. Vui lòng liên hệ Admin trong vòng 24 giờ nếu gặp sự cố.' },
  { q: 'Tôi cần hỗ trợ thêm thì liên hệ ở đâu?', a: 'Bạn có thể nhắn Zalo/Hotline của Admin (góc phải header) hoặc trò chuyện trực tiếp với trợ lý ảo AI ở góc dưới màn hình, hỗ trợ 24/7.' }];


  function renderFaq() {
    const list = $('#faqList');
    if (!list) return;
    list.innerHTML = FAQ_ITEMS.map((item, i) => `
      <div class="faq-item" data-faq-index="${i}">
        <button class="faq-question" type="button">
          <span>${esc(item.q)}</span><span class="chev">${ICONS.chevron}</span>
        </button>
        <div class="faq-answer"><p>${esc(item.a)}</p></div>
      </div>
    `).join('');
    list.addEventListener('click', (e) => {
      const btn = e.target.closest('.faq-question');
      if (!btn) return;
      btn.closest('.faq-item').classList.toggle('open');
    });
  }

  // ---- Tìm kiếm dịch vụ ----
  function wireSearchModal() {
    const input = $('#searchInput');
    $('#searchToggleBtn').addEventListener('click', () => {
      openModal('#searchModal');
      input.value = '';
      renderSearchResults('');
      setTimeout(() => input.focus(), 50);
    });
    input.addEventListener('input', () => renderSearchResults(input.value.trim().toLowerCase()));
    $('#searchResults').addEventListener('click', (e) => {
      const item = e.target.closest('[data-search-service]');
      if (!item) return;
      closeModal('#searchModal');
      openServiceModal(item.dataset.searchService);
    });
  }

  function renderSearchResults(query) {
    const results = $('#searchResults');
    const list = Store.db.services.filter((s) => !query || s.name.toLowerCase().includes(query) || s.description.toLowerCase().includes(query));
    if (!query) {
      results.innerHTML = `<p class="empty-note">Nhập từ khóa để tìm dịch vụ (VD: PUBG, Landing Page, Aimbot...)</p>`;
      return;
    }
    results.innerHTML = list.length ? list.map((s) => {
      const minPrice = Math.min(...s.packages.map((p) => p.price));
      return `
        <button type="button" class="search-result-item" data-search-service="${esc(s.id)}">
          <span>${esc(s.name)}</span><span class="price">Từ ${fmt(minPrice)}</span>
        </button>
      `;
    }).join('') : `<p class="empty-note">Không tìm thấy dịch vụ phù hợp.</p>`;
  }

  // ---- Hiệu ứng cuộn hiện dần (scroll reveal) ----
  function wireScrollReveal() {
    const items = $$('[data-reveal]');
    if (!items.length) return;
    const reveal = (el) => el.classList.add('revealed');
    const revealAll = () => items.forEach(reveal);

    // PHAO CỨU ĐẶT TRƯỚC TIÊN: dù observer lỗi/không chạy (webview Telegram hay không
    // kích hoạt IntersectionObserver lúc mới tải → nội dung/sản phẩm kẹt ở opacity:0 trông
    // như "không thấy"), sau 1s vẫn hiện HẾT để không bao giờ mất nội dung.
    const failsafe = setTimeout(revealAll, 1000);

    // Hiện ngay các mục đang nằm trong khung nhìn (khỏi chờ).
    const inView = (el) => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      return r.top < vh && r.bottom > 0;
    };
    requestAnimationFrame(() => items.forEach((el) => {if (inView(el)) reveal(el);}));

    // Chạm/cuộn lần đầu -> hiện hết ngay (webview thường cần một tương tác mới "thức dậy").
    const wake = () => {clearTimeout(failsafe);revealAll();
      window.removeEventListener('scroll', wake);window.removeEventListener('touchstart', wake);};
    window.addEventListener('scroll', wake, { passive: true, once: true });
    window.addEventListener('touchstart', wake, { passive: true, once: true });

    // Observer (trình duyệt thường): hiện dần khi cuộn tới. Bọc lỗi để KHÔNG chặn phao cứu.
    if ('IntersectionObserver' in window) {
      try {
        const io = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {if (entry.isIntersecting) {reveal(entry.target);io.unobserve(entry.target);}});
        }, { threshold: 0.08 });
        items.forEach((el) => io.observe(el));
      } catch (e) {revealAll();}
    } else {revealAll();}
  }

  // ---- Nút lên đầu trang & xuống cuối trang ----
  // Khi đang mở modal (VD trang Quản trị), nội dung cuộn BÊN TRONG modal nên 2 nút
  // phải cuộn đúng phần đó thay vì cuộn cả trang (đang bị khóa).
  let _updateScrollBtns = null;
  function currentScroller() {
    if (!document.body.classList.contains('modal-open')) return null;
    const overlay = $('.modal-overlay:not([hidden])');
    if (!overlay) return null;
    const cands = overlay.querySelectorAll('.admin-panel-body, .admin-modal, .legal-content, .orders-list, .downloads-list, .deposit-history-list, .modal');
    for (const el of cands) {if (el.scrollHeight > el.clientHeight + 8) return el;}
    return overlay.querySelector('.admin-modal, .modal');
  }
  function wireScrollTopButton() {
    const btn = $('#scrollTopBtn');
    const btnDown = $('#scrollBottomBtn');
    _updateScrollBtns = () => {
      const sc = currentScroller();
      const y = sc ? sc.scrollTop : window.scrollY;
      const dist = sc ? sc.scrollHeight - sc.scrollTop - sc.clientHeight :
      document.documentElement.scrollHeight - window.scrollY - window.innerHeight;
      const th = sc ? 200 : 500; // trong modal ngưỡng nhỏ hơn cho dễ hiện
      if (btn) {const s = y > th;btn.hidden = !s;btn.classList.toggle('visible', s);}
      if (btnDown) {const s = dist > th;btnDown.hidden = !s;btnDown.classList.toggle('visible', s);}
    };
    window.addEventListener('scroll', _updateScrollBtns, { passive: true });
    document.addEventListener('scroll', _updateScrollBtns, { capture: true, passive: true }); // bắt cuộn TRONG modal
    window.addEventListener('resize', _updateScrollBtns, { passive: true });
    _updateScrollBtns();
    const doScroll = (toBottom) => {
      const sc = currentScroller();
      if (sc) sc.scrollTo({ top: toBottom ? sc.scrollHeight : 0, behavior: 'smooth' });else
      window.scrollTo({ top: toBottom ? document.documentElement.scrollHeight : 0, behavior: 'smooth' });
    };
    if (btn) btn.addEventListener('click', () => doScroll(false));
    if (btnDown) btnDown.addEventListener('click', () => doScroll(true));
  }

  function renderHeroStats() {
    const db = Store.db;
    const stats = [
    { label: 'Dịch Vụ', value: db.services.length, icon: 'gamepad' },
    { label: 'Danh Mục', value: db.categories.length, icon: 'grid' },
    { label: 'Đơn Hàng', value: db.orders.length, icon: 'box' },
    { label: 'Hoạt Động', value: '24/7', icon: 'bolt' }];

    $('#heroStats').innerHTML = stats.map((s) => `
      <div class="stat-chip"><span class="stat-chip-ico">${ICONS[s.icon] || ''}</span><strong>${s.value}</strong><span>${s.label}</span></div>
    `).join('');
  }

  // Chuỗi sao đánh giá (đầy/rỗng) cho 1 điểm trung bình.
  function starsHtml(rating) {
    const full = Math.round(rating);
    let out = '';
    for (let i = 1; i <= 5; i++) out += `<span class="rs-star${i <= full ? ' on' : ''}">${ICONS.star}</span>`;
    return `<span class="review-stars">${out}</span>`;
  }

  function serviceCardHtml(s) {
    const minPrice = Math.min(...(s.packages || []).map((p) => p.price));
    const inStock = Store.serviceInStock(s);
    const isVideo = isVideoUrl(s.image);
    const flash = Store.flashSaleInfo();
    const rCount = Store.ratingCount(s.id);
    const salePrice = Store.flashSalePrice(minPrice);
    const priceHtml = flash.active && salePrice < minPrice ?
    `<span class="price"><del class="price-old">Từ ${fmt(minPrice)}</del> <b class="price-sale">Từ ${fmt(salePrice)}</b></span>` :
    `<span class="price">Từ ${fmt(minPrice)}</span>`;
    return `
      <article class="service-card ${inStock ? '' : 'out-of-stock'}" data-service="${esc(s.id)}">
        <div class="thumb" ${isVideo ? '' : `data-fallback-bg="${esc(s.image)}" style="background-image:url('${esc(s.image)}')"`}>
          ${isVideo ? `<video class="thumb-video" src="${esc(s.image)}" muted loop autoplay playsinline></video>` : ''}
          <div class="thumb-badges">
            <span class="badge ${inStock ? '' : 'out'}">${inStock ? 'Còn hàng' : 'Hết hàng'}</span>
            ${flash.active ? `<span class="badge flash-badge">-${flash.percent}%</span>` : ''}
          </div>
          <span class="views-badge">${ICONS.eye}<b>${viewsFor(s.id)}</b></span>
        </div>
        <div class="body">
          <h3>${esc(s.name)}</h3>
          ${rCount > 0 ? `<div class="card-rating">${starsHtml(Store.avgRating(s.id))} <small>${Store.avgRating(s.id).toFixed(1)} (${rCount})</small></div>` : ''}
          <p class="desc">${esc(s.description)}</p>
          <div class="price-row">
            ${priceHtml}
            <button class="btn btn-glass btn-sm" data-view-service="${esc(s.id)}">Xem chi tiết</button>
          </div>
        </div>
      </article>
    `;
  }

  const VIEWS_KEY = 'kenios_views_v1';
  function _views() {try {return JSON.parse(localStorage.getItem(VIEWS_KEY)) || {};} catch {return {};}}
  function viewsFor(id) {
    const v = _views();
    if (v[id] == null) {v[id] = 20 + Math.floor(Math.random() * 180);try {localStorage.setItem(VIEWS_KEY, JSON.stringify(v));} catch {}}
    return v[id];
  }
  function bumpViews(id) {
    const v = _views();
    v[id] = (v[id] || viewsFor(id)) + 1;
    try {localStorage.setItem(VIEWS_KEY, JSON.stringify(v));} catch {}
    return v[id];
  }

  // Sắp xếp danh sách sản phẩm theo lựa chọn hiện tại.
  function sortServiceList(arr) {
    const minP = (s) => Math.min(...(s.packages || [{ price: 0 }]).map((p) => p.price));
    const list = arr.slice();
    if (serviceSort === 'price-asc') list.sort((a, b) => minP(a) - minP(b));else
    if (serviceSort === 'price-desc') list.sort((a, b) => minP(b) - minP(a));else
    if (serviceSort === 'name') list.sort((a, b) => a.name.localeCompare(b.name, 'vi'));else
    if (serviceSort === 'rating') list.sort((a, b) => Store.avgRating(b.id) - Store.avgRating(a.id));
    return list;
  }

  // Trả về HTML danh sách sản phẩm, TÁCH RIÊNG theo nền tảng nếu có sản phẩm được gán
  // (iOS 1 khu, Android 1 khu...). Sản phẩm chưa gán nền tảng hiện phẳng như cũ ở đầu.
  function renderGroupedByPlatform(list) {
    if (!list.some((s) => platformOf(s))) {
      return `<div class="service-grid">${list.map(serviceCardHtml).join('')}</div>`;
    }
    let html = '';
    const ungrouped = list.filter((s) => !platformOf(s));
    if (ungrouped.length) html += `<div class="service-grid">${ungrouped.map(serviceCardHtml).join('')}</div>`;
    PLATFORMS.forEach((pl) => {
      const grp = list.filter((s) => (s.platform || '') === pl.key);
      if (!grp.length) return;
      html += `<div class="plat-group-head"><span class="plat-group-ico">${ICONS[pl.icon] || ''}</span><span>${pl.label}</span><span class="plat-group-count">${grp.length}</span></div>`;
      html += `<div class="service-grid">${grp.map(serviceCardHtml).join('')}</div>`;
    });
    return html;
  }

  function renderServiceGrid() {
    const grid = $('#serviceGrid');
    const statusOk = (s) => !(serviceStatusFilter === 'instock' && s.status !== 'instock');

    // Khi ĐÃ chọn 1 danh mục / thư mục con cụ thể -> hiển thị lưới phẳng của mục đó.
    if (selectedCategory !== 'all' || selectedSub !== 'all') {
      const list = sortServiceList(Store.db.services.filter((s) =>
      s.categoryId !== 'webdesign' && statusOk(s) && (
      selectedCategory === 'all' || s.categoryId === selectedCategory) && (
      selectedSub === 'all' || s.subcategoryId === selectedSub)
      ));
      grid.className = 'service-plat-wrap';
      grid.innerHTML = list.length ?
      renderGroupedByPlatform(list) :
      `<p class="empty-note">Chưa có dịch vụ nào phù hợp bộ lọc.</p>`;
      applyImageFallbacks(grid);
      return;
    }

    // "Tất cả" -> NHÓM THEO DANH MỤC: mỗi danh mục 1 tiêu đề + lưới riêng (không gộp chung).
    grid.className = 'service-groups';
    const cats = (Store.db.categories || []).filter((c) => c.id !== 'webdesign');
    const known = new Set(cats.map((c) => c.id));
    let html = '';
    cats.forEach((c) => {
      const list = sortServiceList(Store.db.services.filter((s) => s.categoryId === c.id && statusOk(s)));
      if (!list.length) return;
      html += `
        <section class="cat-group">
          <div class="cat-group-head">
            <span class="cat-group-ico">${catIcon(c.icon)}</span>
            <h3>${esc(c.name)}</h3>
            <span class="cat-group-count">${list.length}</span>
          </div>
          ${renderGroupedByPlatform(list)}
        </section>`;
    });
    // Sản phẩm không thuộc danh mục nào còn tồn tại -> gom vào nhóm "Khác".
    const orphan = sortServiceList(Store.db.services.filter((s) => s.categoryId !== 'webdesign' && !known.has(s.categoryId) && statusOk(s)));
    if (orphan.length) {
      html += `
        <section class="cat-group">
          <div class="cat-group-head"><h3>Khác</h3><span class="cat-group-count">${orphan.length}</span></div>
          ${renderGroupedByPlatform(orphan)}
        </section>`;
    }
    grid.innerHTML = html || `<p class="empty-note">Chưa có dịch vụ nào.</p>`;
    applyImageFallbacks(grid);
  }

  function wireServiceFilters() {
    const sortSel = $('#serviceSort');
    const statusSel = $('#serviceStatusFilter');
    if (sortSel) sortSel.addEventListener('change', () => {serviceSort = sortSel.value;renderServiceGrid();});
    if (statusSel) statusSel.addEventListener('change', () => {serviceStatusFilter = statusSel.value;renderServiceGrid();});
  }

  function renderWebdesignGrid() {
    const list = Store.db.services.filter((s) => s.categoryId === 'webdesign');
    $('#webdesignGrid').innerHTML = list.map(serviceCardHtml).join('');
    applyImageFallbacks($('#webdesignGrid'));
  }

  // Ảnh minh họa lấy từ Unsplash có thể chậm/không tải được tùy mạng — khi lỗi,
  // hiển thị nền gradient thay vì để trống mảng xám khó chịu.
  function applyImageFallbacks(root, selector) {
    $$(`${selector || '.thumb'}[data-fallback-bg]`, root).forEach((el) => {
      const url = el.dataset.fallbackBg;
      if (!url) return;
      const img = new Image();
      img.onerror = () => {el.classList.add('img-fallback');el.textContent = '';el.style.backgroundImage = 'none';};
      img.src = url;
    });
  }

  // ---- Ghi nhớ tạm thông tin admin trong phiên để "Lưu giao diện" không cần nhập lại mật khẩu ----
  const ADMIN_CREDS_KEY = 'kenios_admin_creds_v1';
  // Lưu trong localStorage để nhớ QUA CẢ khi đóng/mở lại tab → không bắt đăng nhập
  // lại mỗi lần lưu/đồng bộ cấu hình. (Đọc kèm sessionStorage cho bản cũ.)
  function rememberAdminCreds(username, password) {
    try {localStorage.setItem(ADMIN_CREDS_KEY, JSON.stringify({ username, password }));} catch {/* ignore */}
  }
  function getAdminCreds() {
    try {
      return JSON.parse(localStorage.getItem(ADMIN_CREDS_KEY)) ||
      JSON.parse(sessionStorage.getItem(ADMIN_CREDS_KEY)) || null;
    } catch {return null;}
  }
  function clearAdminCreds() {
    try {localStorage.removeItem(ADMIN_CREDS_KEY);sessionStorage.removeItem(ADMIN_CREDS_KEY);} catch {/* ignore */}
  }

  function renderAuthArea() {
    const area = $('#authArea');
    const user = Store.currentUser();
    const adminLabel = $('#mobileNavAdminLabel');
    const adminLink = $('#mobileNavAdminLink');
    if (user && (user.role === 'admin' || user.role === 'ctv')) {
      if (adminLabel) adminLabel.hidden = false;
      if (adminLink) {adminLink.hidden = false;adminLink.querySelector('span:last-child').textContent = user.role === 'ctv' ? 'Trang Cộng tác viên' : 'Cấu hình & Quản trị Shop';}
    } else {
      if (adminLabel) adminLabel.hidden = true;
      if (adminLink) adminLink.hidden = true;
    }
    // Nút Lưu giao diện đã được chuyển vào bên trong tab Config của admin modal
    renderDrawerUser(user);
    if (!user) {
      area.innerHTML = `<button class="btn btn-primary btn-sm" id="openAuthBtn">Đăng nhập</button>`;
      $('#openAuthBtn').addEventListener('click', () => openModal('#authModal'));
      return;
    }
    const avatar = user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.username)}`;
    // Không hiển thị số dư ở header ngoài nữa — số dư chỉ hiện trong menu 3 gạch (drawer)
    // và trong hồ sơ tài khoản (bấm avatar).
    area.innerHTML = `
      <div class="auth-mini">
        <div class="user-menu">
          <button class="avatar-btn" id="avatarBtn" aria-label="Mở bảng điều khiển tài khoản"><img src="${avatar}" alt=""></button>
        </div>
      </div>
    `;
    $('#avatarBtn').addEventListener('click', () => {
      renderProfileModal();
      openModal('#profileModal');
    });
  }

  // Khung render thông tin cá nhân dạng Modal chuyên nghiệp khi click vào Avatar
  // Thẻ hạng VIP trong hồ sơ: hạng hiện tại + tiến độ tới hạng kế tiếp.
  function vipBadgeHtml(user) {
    const tiers = (Store.db.config.vipTiers || []).slice().sort((a, b) => (parseInt(a.minSpent, 10) || 0) - (parseInt(b.minSpent, 10) || 0));
    if (!tiers.length) return '';
    const spent = Store.userTotalSpent(user);
    const current = Store.vipTierFor(user);
    const next = tiers.find((t) => spent < (parseInt(t.minSpent, 10) || 0));
    let progress = '';
    if (next) {
      const need = (parseInt(next.minSpent, 10) || 0) - spent;
      const base = current ? parseInt(current.minSpent, 10) || 0 : 0;
      const pct = Math.max(0, Math.min(100, Math.round((spent - base) / ((parseInt(next.minSpent, 10) || 1) - base) * 100)));
      progress = `<div class="vip-progress"><span style="width:${pct}%"></span></div>
        <small style="color:var(--muted);">Mua thêm <b style="color:var(--gold-soft);">${fmt(need)}</b> để lên hạng <b>${esc(next.name)}</b> (giảm ${parseFloat(next.discountPercent) || 0}%)</small>`;
    } else if (current) {
      progress = `<small style="color:var(--muted);">Bạn đang ở hạng cao nhất ${ico('party')}</small>`;
    }
    return `
      <div class="vip-badge-box">
        <div class="vip-badge-head">
          <span class="vip-badge-crown">${ICONS.crown || '👑'}</span>
          <div>
            <strong>${current ? esc(current.name) + ` · giảm ${parseFloat(current.discountPercent) || 0}%` : 'Chưa có hạng'}</strong>
            <small>Tổng chi tiêu: ${fmt(spent)}</small>
          </div>
        </div>
        ${progress}
      </div>`;
  }

  function renderProfileModal() {
    const body = $('#profileModalBody');
    if (!body) return;
    const user = Store.currentUser();
    if (!user) return;
    const avatar = user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.username)}`;

    body.innerHTML = `
      <div class="profile-head" style="display:flex;align-items:center;gap:16px;background:rgba(255,255,255,0.02);padding:16px;border-radius:14px;border:1px solid rgba(255,255,255,0.04);margin-bottom:20px;">
        <label id="profAvatarEdit" title="Bấm để đổi ảnh đại diện" style="position:relative;flex-shrink:0;cursor:pointer;width:64px;height:64px;">
          <img id="profAvatarImg" src="${avatar}" alt="" style="width:64px;height:64px;border-radius:50%;border:2px solid var(--gold);box-shadow:0 0 15px rgba(34,211,238,0.2);object-fit:cover;">
          <span style="position:absolute;right:-2px;bottom:-2px;width:24px;height:24px;border-radius:50%;background:var(--gold);color:#06121a;display:flex;align-items:center;justify-content:center;border:2px solid var(--bg-alt);">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.2"/></svg>
          </span>
          <input type="file" id="profAvatarInput" accept="image/*" hidden>
        </label>
        <div class="profile-meta" style="display:flex;flex-direction:column;gap:4px;">
          <strong style="font-size:1.15rem;color:var(--ink);">${esc(user.username)}</strong>
          <span style="font-size:0.8rem;color:var(--muted);">ID tài khoản: <code style="color:var(--gold-soft);">${esc(user.userId)}</code></span>
          <span style="font-size:0.8rem;color:var(--muted);">${user.role === 'admin' ? `${ico('shield')} Quản trị viên` : user.role === 'ctv' ? `${ico('heart')} Cộng tác viên` : `${ico('users')} Thành viên`}</span>
        </div>
      </div>
      <div class="profile-balance" style="display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,0.03);padding:14px 16px;border-radius:12px;border:1px solid rgba(255,255,255,0.05);margin-bottom:12px;">
        <span style="color:var(--muted);font-weight:500;">Số dư hiện tại</span>
        <strong style="font-size:1.25rem;color:var(--gold);">${fmt(user.balance || 0)}</strong>
      </div>
      ${vipBadgeHtml(user)}
      ${Store.db.config.referralEnabled !== false ? (() => {
      const st = Store.myReferralStats();
      const bonus = Number(Store.db.config.referralBonus) || 0;
      return `
      <div class="profile-referral">
        <div class="pr-head">${ico('gift')} Giới thiệu bạn bè${bonus > 0 ? ` — cả hai +<b>${fmt(bonus)}</b> khi bạn của bạn nạp tiền lần đầu` : ''}</div>
        <div class="pr-code-row">
          <input id="profRefCode" type="text" readonly value="${esc(st.code)}" onclick="this.select()">
          <button type="button" class="btn btn-primary btn-sm" id="profRefCopy"><span class="btn-ico">${ICONS.copy}</span> Sao chép mã</button>
        </div>
        <div class="pr-stats"><span>Đã mời: <b>${st.count}</b></span><span>Thưởng đã nhận: <b>${fmt(st.earned)}</b></span></div>
      </div>`;
    })() : ''}
      <div class="profile-actions" style="display:flex;flex-direction:column;gap:10px;">
        <button type="button" class="btn btn-glass btn-block" id="profDepositBtn" style="justify-content:flex-start;text-align:left;gap:12px;padding:12px 16px;">
          <span class="btn-ico">${ICONS.card}</span> Nạp tiền tự động
        </button>
        <button type="button" class="btn btn-glass btn-block" id="profOrdersBtn" style="justify-content:flex-start;text-align:left;gap:12px;padding:12px 16px;">
          <span class="btn-ico">${ICONS.box}</span> Đơn hàng của tôi
        </button>
        <button type="button" class="btn btn-glass btn-block" id="profPasswordBtn" style="justify-content:flex-start;text-align:left;gap:12px;padding:12px 16px;">
          <span class="btn-ico">${ICONS.lock}</span> Thay đổi mật khẩu
        </button>
        <button type="button" class="btn btn-ghost btn-block" id="profLogoutBtn" style="justify-content:flex-start;text-align:left;gap:12px;padding:12px 16px;color:#ff5e5e;margin-top:10px;">
          <span class="btn-ico">${ICONS.logout}</span> Đăng xuất tài khoản
        </button>
      </div>
    `;

    // Khách tự đổi ảnh đại diện: chọn ảnh → tải lên máy chủ → lưu vào tài khoản.
    const avatarInput = $('#profAvatarInput');
    if (avatarInput) avatarInput.onchange = async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      if (!file.type || !file.type.startsWith('image/')) {toast('Vui lòng chọn file ảnh.', 'error');e.target.value = '';return;}
      if (file.size > 5 * 1024 * 1024) {toast('Ảnh đại diện tối đa 5MB.', 'error');e.target.value = '';return;}
      const editLabel = $('#profAvatarEdit');
      if (editLabel) editLabel.style.opacity = '.5';
      try {
        const url = await Store.uploadFile(file);
        await Store.updateAvatar(url);
        renderProfileModal();
        toast('Đã đổi ảnh đại diện!', 'success');
      } catch (err) {
        toast(err.message || 'Đổi ảnh thất bại.', 'error');
        if (editLabel) editLabel.style.opacity = '1';
      }
    };

    // Gán sự kiện click cho các nút
    $('#profDepositBtn').onclick = () => {closeModal('#profileModal');openModal('#depositModal');};
    $('#profOrdersBtn').onclick = () => {closeModal('#profileModal');openOrdersModal();};
    $('#profPasswordBtn').onclick = () => {closeModal('#profileModal');openPasswordModal();};
    const refCopyBtn = $('#profRefCopy');
    if (refCopyBtn) refCopyBtn.onclick = () => {var _$, _navigator$clipboard;
      const code = ((_$ = $('#profRefCode')) === null || _$ === void 0 ? void 0 : _$.value) || '';
      const done = () => toast('Đã sao chép mã giới thiệu!', 'success');
      if ((_navigator$clipboard = navigator.clipboard) !== null && _navigator$clipboard !== void 0 && _navigator$clipboard.writeText) navigator.clipboard.writeText(code).then(done).catch(() => fallbackCopy(code, done));else
      fallbackCopy(code, done);
    };
    $('#profLogoutBtn').onclick = () => {closeModal('#profileModal');clearAdminCreds();Store.logout();toast('Đã đăng xuất.', 'success');};
  }

  // Hộp thông tin người dùng trong menu 3 gạch: ID, số dư, đổi mật khẩu (hoặc nút đăng nhập).
  function renderDrawerUser(user) {
    const box = $('#drawerUserBox');
    if (!box) return;
    if (!user) {
      box.innerHTML = `<button type="button" class="btn btn-primary btn-block" id="drawerLoginBtn">Đăng nhập / Đăng ký</button>`;
      $('#drawerLoginBtn').addEventListener('click', () => {closeMobileNavGlobal();openModal('#authModal');});
      return;
    }
    const avatar = user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.username)}`;
    box.innerHTML = `
      <div class="drawer-user-head">
        <img class="drawer-user-avatar" src="${avatar}" alt="">
        <div class="drawer-user-meta">
          <strong>${esc(user.username)}</strong>
          <small>ID: ${esc(user.userId)}${user.role === 'admin' ? ' · Quản trị' : user.role === 'ctv' ? ' · Cộng tác viên' : ''}</small>
        </div>
      </div>
      <div class="drawer-user-balance"><span>Số dư</span><strong>${fmt(user.balance || 0)}</strong></div>
      <div class="drawer-user-actions">
        <button type="button" class="btn btn-glass btn-sm" id="drawerDepositBtn"><span class="btn-ico">${ICONS.card}</span> Nạp tiền</button>
        <button type="button" class="btn btn-glass btn-sm" id="drawerPasswordBtn"><span class="btn-ico">${ICONS.lock}</span> Đổi mật khẩu</button>
        <button type="button" class="btn btn-ghost btn-sm" id="drawerLogoutBtn"><span class="btn-ico">${ICONS.logout}</span> Đăng xuất</button>
      </div>`;
    $('#drawerDepositBtn').addEventListener('click', () => {closeMobileNavGlobal();openModal('#depositModal');});
    $('#drawerPasswordBtn').addEventListener('click', () => {closeMobileNavGlobal();openPasswordModal();});
    $('#drawerLogoutBtn').addEventListener('click', () => {closeMobileNavGlobal();clearAdminCreds();Store.logout();toast('Đã đăng xuất.', 'success');});
  }

  function closeMobileNavGlobal() {var _$2, _$3, _$4;
    (_$2 = $('#mobileNav')) === null || _$2 === void 0 || _$2.classList.remove('open');
    (_$3 = $('#mobileNavBackdrop')) === null || _$3 === void 0 || _$3.classList.remove('open');
    document.body.classList.remove('drawer-open');
    (_$4 = $('#menuToggle')) === null || _$4 === void 0 || _$4.setAttribute('aria-expanded', 'false');
  }

  function openPasswordModal() {
    if (!Store.currentUser()) {openModal('#authModal');return;}
    $('#passwordForm').reset();
    $('#passwordError').textContent = '';
    openModal('#passwordModal');
  }

  // ============================================================
  // MODAL helpers
  // ============================================================
  function openModal(sel) {$(sel).hidden = false;document.body.style.overflow = 'hidden';document.body.classList.add('modal-open');if (sel === '#depositModal') updateDepositBonusNote();setTimeout(() => _updateScrollBtns && _updateScrollBtns(), 60);}
  function closeModal(sel) {$(sel).hidden = true;document.body.style.overflow = '';if (!$('.modal-overlay:not([hidden])')) document.body.classList.remove('modal-open');if (_updateScrollBtns) _updateScrollBtns();}

  async function withLoading(btn, fn) {
    btn.classList.add('is-loading');
    btn.disabled = true;
    try {await fn();} finally {btn.classList.remove('is-loading');btn.disabled = false;}
  }

  function wireGlobalUI() {var _$5, _$7;
    // Nút đồng bộ máy chủ nằm trong tab Config của admin — wire trong wireAdminConfigSecretBoxes()

    // Đổi mật khẩu
    (_$5 = $('#passwordForm')) === null || _$5 === void 0 || _$5.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const errEl = $('#passwordError');
      errEl.textContent = '';
      if (fd.get('new') !== fd.get('confirm')) {errEl.textContent = 'Mật khẩu mới nhập lại không khớp.';return;}
      const submitBtn = e.target.querySelector('button[type=submit]');
      withLoading(submitBtn, async () => {
        try {
          await Store.changePassword(fd.get('current'), fd.get('new'));
          const u = Store.currentUser();
          if (u && u.role === 'admin') rememberAdminCreds(u.username, fd.get('new'));
          closeModal('#passwordModal');
          e.target.reset();
          toast('Đã đổi mật khẩu thành công!', 'success');
        } catch (err) {errEl.textContent = err.message;}
      });
    });
    $$('.modal-overlay').forEach((overlay) => {
      overlay.addEventListener('click', (e) => {if (e.target === overlay) closeModal('#' + overlay.id);});
    });
    $$('[data-close-modal]').forEach((btn) => {
      btn.addEventListener('click', () => closeModal('#' + btn.closest('.modal-overlay').id));
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') $$('.modal-overlay').forEach((o) => {if (!o.hidden) closeModal('#' + o.id);});
    });
    document.addEventListener('click', (e) => {var _$6;
      if (!e.target.closest('.user-menu')) (_$6 = $('#userDropdown')) === null || _$6 === void 0 || _$6.classList.remove('open');
    });

    const closeMobileNav = () => {
      $('#mobileNav').classList.remove('open');
      $('#mobileNavBackdrop').classList.remove('open');
      document.body.classList.remove('drawer-open');
      $('#menuToggle').setAttribute('aria-expanded', 'false');
    };
    $('#menuToggle').addEventListener('click', () => {
      const open = $('#mobileNav').classList.toggle('open');
      $('#mobileNavBackdrop').classList.toggle('open', open);
      document.body.classList.toggle('drawer-open', open);
      $('#menuToggle').setAttribute('aria-expanded', String(open));
    });
    $('#mobileNavBackdrop').addEventListener('click', closeMobileNav);
    $$('.mobile-nav-link', $('#mobileNav')).forEach((a) => a.addEventListener('click', closeMobileNav));

    // Bấm LOGO (header hoặc menu) -> TẢI LẠI TRANG (làm mới hoàn toàn, về đầu trang).
    $$('.brand, .mobile-nav-brand').forEach((el) => el.addEventListener('click', (e) => {
      e.preventDefault();
      closeMobileNav();
      // Xoá hash (#...) rồi tải lại để luôn về đầu trang và làm mới nội dung.
      if (window.location.hash) window.location.href = window.location.pathname + window.location.search;else
      window.location.reload();
    }));
    $('#mobileNavDeposit').addEventListener('click', () => {
      if (!Store.currentUser()) {toast('Vui lòng đăng nhập trước khi nạp tiền.', 'error');openModal('#authModal');return;}
      openModal('#depositModal');
    });
    $('#mobileNavDepositHistory').addEventListener('click', () => openDepositHistoryModal());
    (_$7 = $('#mobileNavTxHistory')) === null || _$7 === void 0 || _$7.addEventListener('click', () => {closeMobileNavGlobal();openTxHistoryModal();});
    $('#mobileNavOrders').addEventListener('click', () => openOrdersModal());
    $('#mobileNavDownloads').addEventListener('click', () => {closeMobileNav();openDownloadsModal();});
    const adminNavBtn2 = $('#mobileNavAdminLink');
    if (adminNavBtn2) adminNavBtn2.addEventListener('click', () => {closeMobileNavGlobal();openAdminModal();});

    $('#heroBtn2').addEventListener('click', () => {
      if (!Store.currentUser()) {toast('Vui lòng đăng nhập trước khi nạp tiền.', 'error');openModal('#authModal');return;}
      openModal('#depositModal');
    });

    document.body.addEventListener('click', (e) => {
      const viewBtn = e.target.closest('[data-view-service]');
      if (viewBtn) openServiceModal(viewBtn.dataset.viewService);
      // Bấm bất kỳ đâu trên thẻ sản phẩm (ngoài nút) cũng mở chi tiết — tiện cho thẻ nhỏ.
      else {
        const svcCard = e.target.closest('.service-card[data-service]');
        if (svcCard) openServiceModal(svcCard.dataset.service);
      }

      const pwToggle = e.target.closest('[data-pw-toggle]');
      if (pwToggle) {
        const input = pwToggle.previousElementSibling;
        const isPw = input.type === 'password';
        input.type = isPw ? 'text' : 'password';
        pwToggle.classList.toggle('revealed', isPw);
      }

      const legalLink = e.target.closest('[data-legal]');
      if (legalLink) {e.preventDefault();openLegalModal(legalLink.dataset.legal);}
    });
  }

  // ---- Đăng nhập / Đăng ký ----
  function wireAuthModal() {var _$8, _$9, _$0;
    $$('.auth-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        $$('.auth-tab').forEach((t) => t.classList.toggle('active', t === tab));
        const isLogin = tab.dataset.authTab === 'login';
        $('#loginForm').hidden = !isLogin;
        $('#registerForm').hidden = isLogin;
      });
    });

    $('#loginForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const submitBtn = e.target.querySelector('button[type=submit]');
      withLoading(submitBtn, async () => {
        try {
          const u = await Store.login(fd.get('username'), fd.get('password'));
          if (u && u.role === 'admin') rememberAdminCreds(fd.get('username'), fd.get('password'));
          closeModal('#authModal');
          e.target.reset();
          $('#loginError').textContent = '';
          toast('Đăng nhập thành công!', 'success');
        } catch (err) {$('#loginError').textContent = err.message;}
      });
    });

    $('#registerForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const submitBtn = e.target.querySelector('button[type=submit]');
      withLoading(submitBtn, async () => {
        try {
          const newUser = await Store.register(fd.get('username'), fd.get('password'), fd.get('contact'));
          const refCode = (fd.get('refCode') || '').trim();
          if (newUser && refCode) Store.applyReferralCode(newUser.userId, refCode);
          closeModal('#authModal');
          e.target.reset();
          $('#registerError').textContent = '';
          toast('Tạo tài khoản thành công! Chào mừng bạn.', 'success');
        } catch (err) {$('#registerError').textContent = err.message;}
      });
    });

    (_$8 = $('#forgotPwBtn')) === null || _$8 === void 0 || _$8.addEventListener('click', () => {closeModal('#authModal');$('#forgotForm').reset();$('#forgotError').textContent = '';openModal('#forgotModal');});
    (_$9 = $('#forgotForm')) === null || _$9 === void 0 || _$9.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const submitBtn = e.target.querySelector('button[type=submit]');
      withLoading(submitBtn, async () => {
        try {
          await Store.resetPassword(fd.get('username').trim(), fd.get('contact').trim(), fd.get('new'));
          closeModal('#forgotModal');
          toast('Đã đặt lại mật khẩu! Đăng nhập bằng mật khẩu mới.', 'success');
          openModal('#authModal');
        } catch (err) {$('#forgotError').textContent = err.message;}
      });
    });

    (_$0 = $('#googleFallbackBtn')) === null || _$0 === void 0 || _$0.addEventListener('click', () => {var _window$google2;
      if ((_window$google2 = window.google) !== null && _window$google2 !== void 0 && (_window$google2 = _window$google2.accounts) !== null && _window$google2 !== void 0 && _window$google2.id) {window.google.accounts.id.prompt();} else
      if (!Store.db.config.googleClientId) {toast('Admin chưa cấu hình Google Client ID trong tab Cấu hình.', 'error');} else
      {toast('Đang tải Google… thử lại sau vài giây.', 'error');}
    });
  }

  // ---- Nạp tiền VietQR ----
  // Cập nhật dòng thông báo khuyến mãi theo số tiền khách đang nhập.
  function updateDepositBonusNote() {var _$1;
    const noteEl = $('#depositBonusNote');
    if (!noteEl) return;
    const c = Store.db.config || {};
    const amount = parseInt((_$1 = $('#depositAmount')) === null || _$1 === void 0 ? void 0 : _$1.value, 10) || 0;
    if (!c.depositBonusEnabled || (parseFloat(c.depositBonusPercent) || 0) <= 0) {noteEl.hidden = true;return;}
    const percent = parseFloat(c.depositBonusPercent) || 0;
    const min = parseInt(c.depositBonusMin, 10) || 0;
    const bonus = Store.depositBonusFor(amount);
    if (bonus > 0) {
      noteEl.innerHTML = `${ico('gift')} Khuyến mãi <b>+${percent}%</b>: bạn được cộng thêm <b>${fmt(bonus)}</b> — tổng nhận <b>${fmt(amount + bonus)}</b>.`;
    } else if (min > 0) {
      noteEl.innerHTML = `${ico('gift')} Đang có khuyến mãi <b>+${percent}%</b> cho đơn nạp từ <b>${fmt(min)}</b> trở lên.`;
    } else {
      noteEl.innerHTML = `${ico('gift')} Đang có khuyến mãi nạp tiền <b>+${percent}%</b>.`;
    }
    noteEl.hidden = false;
  }

  function wireDepositModal() {var _$12, _$13, _$14, _$15;
    const quick = $('#quickAmounts');
    [50000, 100000, 200000, 500000, 1000000].forEach((v) => {
      const b = document.createElement('button');
      b.type = 'button';b.textContent = fmt(v);
      b.addEventListener('click', () => {$('#depositAmount').value = v;updateDepositBonusNote();});
      quick.appendChild(b);
    });
    $('#depositAmount').addEventListener('input', updateDepositBonusNote);
    updateDepositBonusNote();

    // Chuyển tab VietQR / Thẻ cào
    $$('.deposit-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        const which = tab.dataset.depositTab;
        $$('.deposit-tab').forEach((t) => t.classList.toggle('active', t === tab));
        $('#depositPaneVietqr').hidden = which !== 'vietqr';
        $('#depositPaneCard').hidden = which !== 'card';
      });
    });

    // Ước tính số tiền khách nhận theo % chiết khấu nhà mạng (khớp bảng phí thesieure).
    function updateCardReceiveNote() {var _$10, _$11;
      const noteEl = $('#cardReceiveNote');
      if (!noteEl) return;
      const telco = ((_$10 = $('#cardTelco')) === null || _$10 === void 0 ? void 0 : _$10.value) || '';
      const amount = parseInt((_$11 = $('#cardAmount')) === null || _$11 === void 0 ? void 0 : _$11.value, 10) || 0;
      const pct = cardDiscountPct(telco, amount);
      if (pct > 0 && amount > 0) {
        const recv = Math.floor(amount * (100 - pct) / 100);
        noteEl.hidden = false;
        noteEl.innerHTML = `Chiết khấu <b>${pct}%</b> — bạn sẽ nhận <b>${fmt(recv)}</b> vào số dư.`;
      } else {noteEl.hidden = true;}
    }
    (_$12 = $('#cardTelco')) === null || _$12 === void 0 || _$12.addEventListener('change', updateCardReceiveNote);
    (_$13 = $('#cardAmount')) === null || _$13 === void 0 || _$13.addEventListener('change', updateCardReceiveNote);
    updateCardReceiveNote();

    // Sau khi gửi thẻ: TỰ ĐỘNG hỏi lại cổng vài lần (10s/lần, tối đa ~2 phút) để cộng tiền
    // ngay khi cổng duyệt xong mà khách KHÔNG cần bấm "Kiểm tra thẻ đã nạp".
    let cardPollTimer = null;
    function autoPollCardStatus() {
      if (cardPollTimer) {clearInterval(cardPollTimer);cardPollTimer = null;}
      const u0 = Store.currentUser();
      const before = u0 && u0.balance || 0;
      let n = 0;
      cardPollTimer = setInterval(async () => {
        n++;
        let res = null;
        try {res = await Store.cardStatus();} catch (e) {/* offline */}
        const u1 = Store.currentUser();
        const after = u1 && u1.balance || 0;
        const pend = res && Array.isArray(res.requests) ? res.requests.filter((r) => r.status === 'pending').length : 1;
        if (after > before) {toast('Thẻ đã được duyệt! Số dư +' + fmt(after - before) + 'đ.', 'success');}
        if (after > before || pend === 0 || n >= 12) {clearInterval(cardPollTimer);cardPollTimer = null;}
      }, 10000);
    }

    // Nạp thẻ cào
    (_$14 = $('#submitCardBtn')) === null || _$14 === void 0 || _$14.addEventListener('click', () => {
      if (!Store.currentUser()) {toast('Vui lòng đăng nhập trước khi nạp thẻ.', 'error');return;}
      const msgEl = $('#cardChargeMsg');
      const setMsg = (t, ok) => {if (msgEl) {msgEl.hidden = false;msgEl.textContent = t;msgEl.style.color = ok === false ? 'var(--danger)' : ok ? 'var(--success)' : 'var(--muted)';}};
      const telco = $('#cardTelco').value;
      const amount = parseInt($('#cardAmount').value, 10) || 0;
      const serial = $('#cardSerial').value.trim();
      const code = $('#cardCode').value.trim();
      if (!serial || !code) {setMsg('Vui lòng nhập đủ Serial và Mã thẻ.', false);return;}
      withLoading($('#submitCardBtn'), async () => {
        setMsg('Đang gửi thẻ, vui lòng đợi…');
        try {
          const res = await Store.chargeCard({ telco, amount, serial, code });
          if (res.status === 'success') {
            setMsg(res.message || 'Đã gửi thẻ, đang chờ hệ thống duyệt.', true);
            toast('Đã gửi thẻ! Số dư sẽ cộng khi thẻ được duyệt.', 'success');
            $('#cardSerial').value = '';$('#cardCode').value = '';
            autoPollCardStatus(); // tự động kiểm tra để cộng tiền, khỏi cần bấm tay
          } else {
            setMsg(res.message || 'Nạp thẻ thất bại.', false);
            toast(res.message || 'Nạp thẻ thất bại.', 'error');
          }
        } catch (e) {
          setMsg('Không kết nối được máy chủ nạp thẻ (cần backend PHP).', false);
          toast('Không nạp được thẻ (thiếu máy chủ).', 'error');
        }
      });
    });

    // Kiểm tra thẻ đã nạp: xem trạng thái + cập nhật số dư nếu đã cộng.
    (_$15 = $('#checkCardBtn')) === null || _$15 === void 0 || _$15.addEventListener('click', () => {
      if (!Store.currentUser()) {toast('Vui lòng đăng nhập.', 'error');return;}
      const listEl = $('#cardStatusList');
      const before = Store.currentUser().balance || 0;
      withLoading($('#checkCardBtn'), async () => {
        try {
          const res = await Store.cardStatus();
          if (!res || res.status !== 'success') {toast(res && res.message || 'Không kiểm tra được.', 'error');return;}
          const after = Store.currentUser().balance || 0;
          if (after > before) toast(`Đã cộng tiền! Số dư: ${fmt(after)}.`, 'success');
          const reqs = res.requests || [];
          if (!reqs.length) {listEl.hidden = false;listEl.innerHTML = '<p class="muted" style="font-size:.8rem;margin:0;">Bạn chưa nạp thẻ nào.</p>';return;}
          listEl.hidden = false;
          listEl.innerHTML = reqs.map((r) => {
            const st = cardStatusLabel(r.status, 'Thẻ lỗi/sai');
            const amt = r.status === 'success' && r.realAmount ? ` · nhận ${fmt(r.realAmount)}` : '';
            const when = r.date ? new Date(r.date).toLocaleString('vi-VN') : '';
            return `<div class="card-status-item"><span>${esc(r.telco)} ${fmt(r.declaredAmount)}${amt}</span><span class="card-status-badge ${esc(r.status)}">${st}</span><small>${esc(when)}</small></div>`;
          }).join('');
        } catch (e) {
          toast('Không kết nối được máy chủ.', 'error');
        }
      });
    });

    $('#genQrBtn').addEventListener('click', () => {
      const cfg = Store.db.config;
      const amount = parseInt($('#depositAmount').value, 10);
      if (!amount || amount < 10000) {toast('Số tiền nạp tối thiểu là 10.000đ.', 'error');return;}
      const user = Store.currentUser();
      const note = `NAP${user.userId}${Date.now().toString().slice(-6)}`;
      const url = `https://img.vietqr.io/image/${encodeURIComponent(cfg.bankId)}-${cfg.bankAccountNo}-qr_only.png` +
      `?amount=${amount}&addInfo=${encodeURIComponent(note)}&accountName=${encodeURIComponent(cfg.bankAccountName)}`;
      $('#depositQrImg').src = url;
      setText('#qrBank', cfg.bankId);
      setText('#qrOwner', cfg.bankAccountName);
      setText('#qrAccount', cfg.bankAccountNo);
      setText('#qrAmount', fmt(amount));
      setText('#qrNote', note);
      $('#depositQrBox').hidden = false;
      $('#confirmDepositBtn').dataset.amount = amount;
      $('#confirmDepositBtn').dataset.note = note;
      $('#copyAccountBtn').onclick = () => {var _navigator$clipboard2;
        (_navigator$clipboard2 = navigator.clipboard) === null || _navigator$clipboard2 === void 0 || _navigator$clipboard2.writeText(cfg.bankAccountNo).then(() => toast('Đã sao chép số tài khoản!', 'success'));
      };
      $('#copyNoteBtn').onclick = () => {var _navigator$clipboard3;
        (_navigator$clipboard3 = navigator.clipboard) === null || _navigator$clipboard3 === void 0 || _navigator$clipboard3.writeText(note).then(() => toast('Đã sao chép nội dung chuyển khoản!', 'success'));
      };
    });

    $('#confirmDepositBtn').addEventListener('click', async () => {
      const amount = parseInt($('#confirmDepositBtn').dataset.amount, 10);
      const note = $('#confirmDepositBtn').dataset.note;
      await withLoading($('#confirmDepositBtn'), async () => {
        try {
          const res = await Store.checkAutoDeposit(note);
          if (res.credited) {
            closeModal('#depositModal');
            $('#depositQrBox').hidden = true;
            toast('Đã nhận được chuyển khoản! Số dư của bạn đã được cộng tự động.', 'success');
          } else if (res.serverError) {
            // Có máy chủ nhưng bước gọi ngân hàng lỗi — KHÔNG cộng tiền, chỉ báo lỗi.
            toast(res.message + ' Vui lòng thử lại sau ít phút hoặc liên hệ Admin.', 'error');
          } else {
            toast('Chưa nhận được giao dịch. Nếu bạn vừa chuyển khoản, vui lòng đợi 10–30 giây rồi bấm lại nút này.', 'error');
          }
        } catch (e) {
          // Chỉ tới đây khi KHÔNG có máy chủ PHP (chế độ demo) → cộng cục bộ để vẫn dùng thử được.
          Store.deposit(amount, note);
          closeModal('#depositModal');
          $('#depositQrBox').hidden = true;
          toast(`Đã cộng ${fmt(amount)} vào số dư (chế độ demo cục bộ, không có máy chủ xác thực).`, 'success');
        }
      });
    });
  }

  // ---- Chi tiết dịch vụ ----
  // Cập nhật dòng "Thành tiền" trong modal sản phẩm: Flash Sale + VIP + mã giảm giá.
  function updateServiceModalTotal() {
    const totalEl = $('#serviceModalTotal');
    if (!totalEl || !currentPackage) {if (totalEl) totalEl.innerHTML = '';return;}
    const service = Store.db.services.find((s) => s.id === currentServiceId);
    const codeStr = currentDiscount && currentDiscount.valid ? currentDiscount.code : '';
    const p = Store.computePurchasePrice(service, currentPackage, codeStr, Store.currentUser());
    const tags = [];
    if (p.flashPercent > 0) tags.push(`<span class="save-tag flash">Flash -${p.flashPercent}%</span>`);
    if (p.vipPercent > 0) tags.push(`<span class="save-tag vip">${esc(p.vipName || 'VIP')} -${p.vipPercent}%</span>`);
    if (p.code) tags.push(`<span class="save-tag code">Mã ${esc(p.code)} -${fmt(p.codeDiscount)}</span>`);
    if (p.totalDiscount > 0) {
      totalEl.innerHTML = `Thành tiền: <del>${fmt(p.base)}</del> <strong>${fmt(p.final)}</strong>
        <span class="service-total-save">(tiết kiệm ${fmt(p.totalDiscount)})</span>
        <span class="save-tags">${tags.join('')}</span>`;
    } else {
      totalEl.innerHTML = `Thành tiền: <strong>${fmt(p.final)}</strong>`;
    }
  }

  // Áp dụng mã giảm giá khách nhập cho gói đang chọn; hiển thị kết quả.
  function applyServiceDiscount() {
    const msgEl = $('#serviceModalDiscountMsg');
    const codeStr = ($('#serviceModalDiscountCode').value || '').trim();
    if (!currentPackage) return;
    if (!codeStr) {
      currentDiscount = null;
      msgEl.hidden = true;
      updateServiceModalTotal();
      return;
    }
    const service = Store.db.services.find((s) => s.id === currentServiceId);
    // Áp mã trên giá SAU Flash Sale + VIP (đúng như khi mua thật).
    const p = Store.computePurchasePrice(service, currentPackage, codeStr, Store.currentUser());
    if (p.codeValid) {
      currentDiscount = { valid: true, code: p.code };
      msgEl.hidden = false;
      msgEl.className = 'discount-apply-msg ok';
      msgEl.innerHTML = `${ico('check')} Áp dụng mã <b>${esc(p.code)}</b> — giảm thêm <b>${fmt(p.codeDiscount)}</b>.`;
    } else {
      currentDiscount = null;
      msgEl.hidden = false;
      msgEl.className = 'discount-apply-msg err';
      msgEl.innerHTML = `${ico('warn')} ${esc(p.codeReason || 'Mã giảm giá không hợp lệ.')}`;
    }
    updateServiceModalTotal();
  }

  function wireServiceModal() {var _$16;
    $('#serviceModalApplyDiscountBtn').addEventListener('click', applyServiceDiscount);
    $('#serviceModalDiscountCode').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {e.preventDefault();applyServiceDiscount();}
    });

    (_$16 = $('#serviceModalCartBtn')) === null || _$16 === void 0 || _$16.addEventListener('click', () => {
      if (!currentPackage) {$('#serviceModalError').textContent = 'Vui lòng chọn một gói.';return;}
      addToCart(currentServiceId, currentPackage.id);
      toast('Đã thêm vào giỏ hàng!', 'success');
    });

    $('#serviceModalBuyBtn').addEventListener('click', () => {
      const service = Store.db.services.find((s) => s.id === currentServiceId);
      const errEl = $('#serviceModalError');
      errEl.textContent = '';
      if (!Store.currentUser()) {errEl.textContent = 'Vui lòng đăng nhập trước khi mua.';return;}
      if (!currentPackage) {errEl.textContent = 'Vui lòng chọn một gói.';return;}

      // Mã giảm giá dùng khi mua = mã đã áp dụng hợp lệ cho đúng gói đang chọn.
      const codeStr = currentDiscount && currentDiscount.valid ? currentDiscount.code : '';

      withLoading($('#serviceModalBuyBtn'), async () => {
        try {
          let order;
          if (Store.usesRealKeyStock(currentPackage)) {
            // Không bắt nhập lại mật khẩu — xác thực bằng tài khoản đang đăng nhập.
            order = await Store.redeemKeyOnServer(Store.currentUser().username, '', service, currentPackage, codeStr);
          } else {
            order = await Store.purchase(service, currentPackage, codeStr);
          }
          closeModal('#serviceModal');
          const saved = order.discountAmount > 0 ? ` (đã giảm ${fmt(order.discountAmount)})` : '';
          toast(`Mua thành công${saved}! Key: ${order.key}`, 'success');
        } catch (err) {errEl.textContent = err.message;}
      });
    });
  }

  function openServiceModal(serviceId) {
    const service = Store.db.services.find((s) => s.id === serviceId);
    if (!service) return;
    currentServiceId = serviceId;
    currentPackage = service.packages[0] || null;

    const modalImg = $('#serviceModalImg');
    const modalVideo = $('#serviceModalVideo');
    const modalMedia = modalImg.closest('.service-modal-media');
    // Canh khung theo ĐÚNG tỷ lệ thật của ảnh/video (9:16, 3:4, 4:3, 16:9...) để media lấp
    // vừa khung, ở giữa, không dải đen. Giới hạn tỷ lệ để không quá cao/rộng.
    const setMediaAR = (w, h) => {
      if (!modalMedia || !(w > 0) || !(h > 0)) return;
      const r = Math.min(Math.max(w / h, 0.62), 1.9); // ~ giữa 3:5 và 1.9:1
      modalMedia.style.setProperty('--media-ar', r.toFixed(4));
    };
    if (modalMedia) modalMedia.style.removeProperty('--media-ar'); // reset về mặc định 16:9
    if (isVideoUrl(service.image)) {
      modalVideo.src = service.image;
      modalVideo.hidden = false;
      modalImg.hidden = true;
      if (modalMedia) modalMedia.style.backgroundImage = '';
      modalVideo.onloadedmetadata = () => setMediaAR(modalVideo.videoWidth, modalVideo.videoHeight);
    } else {
      modalImg.src = service.image;
      modalImg.alt = service.name;
      modalImg.hidden = false;
      modalVideo.hidden = true;
      // Đặt nền cho khung modal = chính ảnh, để lớp mờ ::before lấp hai bên (ảnh hiện full).
      if (modalMedia) modalMedia.style.backgroundImage = service.image ? `url('${String(service.image).replace(/'/g, "%27")}')` : '';
      modalImg.onload = () => setMediaAR(modalImg.naturalWidth, modalImg.naturalHeight);
    }
    const inStock = Store.serviceInStock(service);
    $('#serviceModalBadge').textContent = inStock ? 'Còn hàng' : 'Hết hàng';
    $('#serviceModalBadge').className = 'badge' + (inStock ? '' : ' out');
    setText('#serviceModalTitle', service.name);
    setText('#serviceModalDesc', service.description);
    $('#serviceModalViews').innerHTML = `${ICONS.eye}<b>${bumpViews(serviceId)}</b> lượt xem`;
    const dl = $('#serviceModalDownload');
    if (service.downloadUrl) {dl.hidden = false;dl.href = service.downloadUrl;dl.innerHTML = `${ICONS.download} Tải bản game`;} else
    {dl.hidden = true;}
    $('#serviceModalFeatures').innerHTML = (service.features || []).map((f) => `<li>${esc(f)}</li>`).join('');

    const pkgWrap = $('#serviceModalPackages');
    const flash = Store.flashSaleInfo();
    const selId = currentPackage && currentPackage.id;
    const optHtml = (p) => {
      const sale = Store.flashSalePrice(p.price);
      const priceCell = flash.active && sale < p.price ?
      `<del class="price-old">${fmt(p.price)}</del> <strong>${fmt(sale)}</strong>` :
      `<strong>${fmt(p.price)}</strong>`;
      return `
      <div class="package-option ${p.id === selId ? 'selected' : ''}" data-pkg="${esc(p.id)}">
        <span>${esc(p.name)}</span>
        <span class="package-option-price">
          ${priceCell}
          ${Store.usesRealKeyStock(p) ? `<small class="pkg-stock ${p.keyCount > 0 ? '' : 'out'}">${p.keyCount > 0 ? `Còn ${p.keyCount} key` : 'Hết key'}</small>` : ''}
        </span>
      </div>`;
    };
    pkgWrap.innerHTML = (service.packages || []).map(optHtml).join('');
    // Khoá/mở nút Mua theo gói ĐANG chọn (gói hết key thì không mua được dù sản phẩm còn gói khác).
    const updateBuyBtnStock = () => {
      const ok = Store.serviceInStock(service) && Store.pkgBuyable(currentPackage);
      $('#serviceModalBuyBtn').disabled = !ok;
      $('#serviceModalBuyBtn').textContent = ok ? 'Mua Ngay' : 'Hết Hàng';
    };
    pkgWrap.querySelectorAll('.package-option').forEach((el) => {
      el.addEventListener('click', () => {
        pkgWrap.querySelectorAll('.package-option').forEach((o) => o.classList.remove('selected'));
        el.classList.add('selected');
        currentPackage = service.packages.find((p) => p.id === el.dataset.pkg);
        syncServiceModalPasswordField();
        // Đổi gói -> tính lại mã giảm giá (nếu có) theo giá gói mới.
        applyServiceDiscount();
        updateBuyBtnStock();
      });
    });

    // Reset ô mã giảm giá mỗi lần mở sản phẩm.
    currentDiscount = null;
    $('#serviceModalDiscountCode').value = '';
    $('#serviceModalDiscountMsg').hidden = true;
    // Ẩn ô mã giảm giá nếu admin chưa tạo mã nào đang bật (tránh khách nhập vô ích).
    const hasCodes = (Store.db.config.discountCodes || []).some((d) => d && d.enabled !== false && (d.code || '').trim());
    $('#serviceModalDiscountRow').hidden = !hasCodes;
    updateServiceModalTotal();

    syncServiceModalPasswordField();
    $('#serviceModalError').textContent = '';
    $('#serviceModalPassword').value = '';
    updateBuyBtnStock();
    renderServiceReviews(serviceId);
    openModal('#serviceModal');
  }

  function syncServiceModalPasswordField() {
    // Không còn yêu cầu nhập lại mật khẩu khi mua -> luôn ẩn ô mật khẩu.
    const row = $('#serviceModalPasswordRow');
    if (row) row.hidden = true;
  }

  // Render khu vực đánh giá trong modal sản phẩm: điểm trung bình + danh sách + form.
  let reviewDraftRating = 5;
  function renderServiceReviews(serviceId) {
    const wrap = $('#serviceModalReviews');
    if (!wrap) return;
    const reviews = Store.reviewsFor(serviceId);
    const avg = Store.avgRating(serviceId);
    const canReview = Store.hasPurchased(serviceId);
    const mine = Store.myReviewFor(serviceId);
    reviewDraftRating = mine ? parseInt(mine.rating, 10) || 5 : 5;
    const head = reviews.length ?
    `<div class="review-summary">${starsHtml(avg)} <b>${avg.toFixed(1)}</b>/5 · ${reviews.length} đánh giá</div>` :
    `<p class="muted" style="font-size:.85rem;margin:0;">Chưa có đánh giá nào. ${canReview ? 'Hãy là người đầu tiên đánh giá!' : 'Mua sản phẩm để đánh giá.'}</p>`;
    const list = reviews.map((r) => `
      <div class="review-item">
        <div class="review-item-head">
          <span class="review-item-user">${esc(r.username || 'Khách')}</span>
          <span>${starsHtml(r.rating)}</span>
        </div>
        ${r.text ? `<p class="review-item-text">${esc(r.text)}</p>` : ''}
      </div>`).join('');
    let form = '';
    if (canReview) {
      const pick = [1, 2, 3, 4, 5].map((n) => `<span data-star="${n}" class="rs-star${n <= reviewDraftRating ? ' on' : ''}">${ICONS.star}</span>`).join('');
      form = `
        <div class="review-form">
          <strong style="font-size:.9rem;">${mine ? 'Cập nhật đánh giá của bạn' : 'Viết đánh giá của bạn'}</strong>
          <span class="review-star-pick" id="reviewStarPick">${pick}</span>
          <textarea id="reviewText" rows="2" placeholder="Chia sẻ trải nghiệm của bạn (không bắt buộc)" style="width:100%;padding:9px 11px;border-radius:10px;border:1px solid var(--border);background:rgba(255,255,255,.03);color:var(--ink);">${mine ? esc(mine.text || '') : ''}</textarea>
          <button type="button" class="btn btn-primary btn-sm" id="submitReviewBtn">${mine ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}</button>
        </div>`;
    } else if (Store.currentUser()) {
      form = `<p class="muted" style="font-size:.8rem;margin:6px 0 0;">Chỉ khách đã mua sản phẩm này mới được đánh giá.</p>`;
    }
    wrap.innerHTML = `
      <h4 class="reviews-title">${ico('star')} Đánh giá sản phẩm</h4>
      ${head}
      <div class="review-list">${list}</div>
      ${form}`;
    // Wire chọn sao
    const pickEl = $('#reviewStarPick');
    if (pickEl) {
      pickEl.querySelectorAll('[data-star]').forEach((star) => {
        star.addEventListener('click', () => {
          reviewDraftRating = parseInt(star.dataset.star, 10);
          pickEl.querySelectorAll('[data-star]').forEach((s2) => s2.classList.toggle('on', parseInt(s2.dataset.star, 10) <= reviewDraftRating));
        });
      });
    }
    const submitBtn = $('#submitReviewBtn');
    if (submitBtn) submitBtn.addEventListener('click', () => {
      try {
        Store.addReview(serviceId, reviewDraftRating, $('#reviewText').value);
        toast('Cảm ơn bạn đã đánh giá!', 'success');
        renderServiceReviews(serviceId);
        renderServiceGrid();
      } catch (err) {toast(err.message, 'error');}
    });
  }

  // ---- Đơn hàng của tôi ----
  const fmtDateTime = (iso) => {try {return new Date(iso).toLocaleString('vi-VN');} catch {return '';}};

  // Trạng thái hết hạn của 1 đơn: {cls, text} hoặc null nếu vĩnh viễn / còn xa.
  function orderExpiryWarn(o) {
    if (!o.expiryDate) return null;
    const exp = Date.parse(o.expiryDate);
    if (isNaN(exp)) return null;
    const diff = exp - Date.now();
    const dayMs = 86400000;
    if (diff <= 0) return { cls: 'expired', text: `${ico('ban')} Key đã hết hạn — gia hạn để tiếp tục dùng` };
    if (diff <= 3 * dayMs) {
      const days = Math.ceil(diff / dayMs);
      return { cls: 'soon', text: `${ico('clock')} Sắp hết hạn — còn ${days} ngày, nên gia hạn sớm` };
    }
    return null;
  }

  function orderCardHtml(o) {var _find;
    const contact = Store.db.config.zaloLink || ((_find = (Store.db.config.contactChannels || []).find((c) => c.enabled && c.url)) === null || _find === void 0 ? void 0 : _find.url) || '';
    const expiry = o.expiryDate ? fmtDateTime(o.expiryDate) : 'Vĩnh viễn (không hết hạn)';
    const purchased = fmtDateTime(o.purchaseDate || o.date);
    const svc = Store.db.services.find((s) => s.id === o.serviceId);
    const download = svc && svc.downloadUrl || o.downloadUrl || '';
    const warn = orderExpiryWarn(o);
    return `
      <div class="order-card">
        <div class="order-card-head">
          <strong>${esc(o.serviceName)}</strong>
          <span class="order-price">${fmt(o.price)}</span>
        </div>
        <div class="order-line"><span class="order-ico">${ICONS.key}</span>
          <span>Bạn đã mua 1 key${o.os ? ` <b>${esc(o.os)}</b>` : ''} (Thời hạn: <b>${esc(o.packageName)}</b>)</span>
        </div>
        <div class="order-line"><span class="order-ico">${ICONS.calendar}</span><span>Ngày mua: <b>${esc(purchased)}</b></span></div>
        <div class="order-line"><span class="order-ico">${ICONS.clock}</span><span>Hết hạn: <b>${esc(expiry)}</b></span></div>
        ${warn ? `<span class="order-expiry-warn ${warn.cls}">${warn.text}</span>
          <button class="btn btn-primary btn-sm btn-block" data-renew-service="${esc(o.serviceId)}" style="margin-top:8px;"><span class="order-ico">${ICONS.refresh || ''}</span> Gia hạn ngay</button>` : ''}
        <div class="order-key-row">
          <span class="order-ico">${ICONS.key}</span>
          <code>${esc(o.key)}</code>
          <button class="btn-copy-key" data-copy-key="${esc(o.key)}" title="Sao chép key">${ICONS.copy}</button>
        </div>
        ${download ? `<a class="btn btn-primary btn-sm btn-block order-download" href="${esc(download)}" target="_blank" rel="noopener"><span class="order-ico">${ICONS.upload || ICONS.box}</span> Tải bản game</a>` : ''}
        ${contact ? `<a class="btn btn-glass btn-sm btn-block order-contact" href="${esc(contact)}" target="_blank" rel="noopener"><span class="order-ico">${ICONS.headset}</span> Liên hệ hỗ trợ</a>` : ''}
      </div>`;
  }

  function openOrdersModal() {
    if (!Store.currentUser()) {toast('Vui lòng đăng nhập.', 'error');openModal('#authModal');return;}
    const orders = Store.myOrders();
    // Banner tổng hợp số key sắp/đã hết hạn để khách chú ý gia hạn.
    const warnCount = orders.filter((o) => orderExpiryWarn(o)).length;
    const banner = warnCount > 0 ?
    `<div class="order-expiry-warn expired" style="display:block;margin-bottom:12px;">${ico('bell')} Bạn có <b>${warnCount}</b> key sắp/đã hết hạn — hãy gia hạn để không gián đoạn.</div>` :
    '';
    $('#ordersList').innerHTML = orders.length ?
    banner + orders.map(orderCardHtml).join('') :
    `<p class="empty-note">Bạn chưa có đơn hàng nào.</p>`;
    $$('[data-copy-key]', $('#ordersList')).forEach((btn) => {
      btn.addEventListener('click', () => {var _navigator$clipboard4;
        (_navigator$clipboard4 = navigator.clipboard) === null || _navigator$clipboard4 === void 0 || _navigator$clipboard4.writeText(btn.dataset.copyKey).then(() => toast('Đã sao chép key!', 'success'));
      });
    });
    $$('[data-renew-service]', $('#ordersList')).forEach((btn) => {
      btn.addEventListener('click', () => {closeModal('#ordersModal');openServiceModal(btn.dataset.renewService);});
    });
    openModal('#ordersModal');
  }

  // Tải xuống — đồng bộ với link tải của từng sản phẩm.
  function openDownloadsModal() {
    const items = Store.db.services.filter((s) => s.downloadUrl);
    $('#downloadsList').innerHTML = items.length ?
    items.map((s) => `
        <div class="download-item">
          <div class="download-item-info">
            <span class="download-ico">${ICONS.download}</span>
            <div><strong>${esc(s.name)}</strong><small>${esc(Store.serviceOs ? Store.serviceOs(s) : '')}</small></div>
          </div>
          <a class="btn btn-primary btn-sm" href="${esc(s.downloadUrl)}" target="_blank" rel="noopener">Tải bản này</a>
        </div>`).join('') :
    '<p class="empty-note">Chưa có bản tải nào. Admin thêm link tải cho sản phẩm ở tab Dịch vụ.</p>';
    openModal('#downloadsModal');
  }

  // Nhãn trạng thái thẻ cào dùng ICON SVG RIÊNG (không dùng emoji máy). failText đổi được
  // vì mỗi nơi ghi khác nhau ("Thẻ lỗi/sai" / "Lỗi/sai" / "Lỗi").
  function cardStatusLabel(status, failText) {
    const ico = {
      pending: `<span class="cs-ico pending">${ICONS.clock}</span>`,
      success: `<span class="cs-ico ok">${ICONS.check}</span>`,
      failed: `<span class="cs-ico fail">${ICONS.close}</span>`
    }[status] || '';
    const txt = { pending: 'Đang xử lý', success: 'Thành công', failed: failText || 'Thẻ lỗi/sai' }[status] || status;
    return `${ico} ${txt}`;
  }

  // Lịch sử nạp tiền: gồm các lần nạp THÀNH CÔNG (giao dịch type='deposit') + các thẻ cào
  // ĐANG XỬ LÝ / LỖI (chưa cộng tiền). Mở lịch sử cũng chủ động hỏi cổng trạng thái thẻ.
  async function openDepositHistoryModal() {
    const user = Store.currentUser();
    if (!user) {toast('Vui lòng đăng nhập.', 'error');openModal('#authModal');return;}
    openModal('#depositHistoryModal');
    if ($('#depositHistorySummary')) $('#depositHistorySummary').innerHTML = '';
    $('#depositHistoryList').innerHTML = '<p class="empty-note">Đang tải &amp; kiểm tra thẻ…</p>';

    // Chủ động hỏi cổng trạng thái các thẻ đang xử lý (đồng thời cập nhật số dư + lịch sử).
    let cardReqs = [];
    let serverDeps = null;
    try {
      const res = await Store.cardStatus();
      if (res && res.status === 'success') {cardReqs = res.requests || [];if (Array.isArray(res.deposits)) serverDeps = res.deposits;}
    } catch (e) {/* offline: chỉ hiện dữ liệu cục bộ */}

    // Ưu tiên lịch sử nạp MỚI NHẤT từ máy chủ (kể cả thẻ vừa cộng); offline thì dùng cục bộ.
    const deps = serverDeps !== null ? serverDeps :
    (Store.db.transactions || []).filter((t) => t.userId === user.userId && t.type === 'deposit' && (t.amount || 0) > 0);
    const total = deps.reduce((s, t) => s + (t.amount || 0), 0);
    // Thẻ THÀNH CÔNG đã nằm trong deps (qua transaction) rồi → chỉ thêm ĐANG XỬ LÝ / LỖI.
    const openCards = cardReqs.filter((r) => r.status === 'pending' || r.status === 'failed');

    const items = [];
    deps.forEach((t) => items.push({ ts: Date.parse(t.date) || 0, kind: 'ok', amount: t.amount, desc: t.description || 'Nạp tiền', date: t.date }));
    openCards.forEach((r) => items.push({ ts: Date.parse(r.date) || 0, kind: r.status, telco: r.telco, declared: r.declaredAmount, date: r.date }));
    items.sort((a, b) => b.ts - a.ts);

    const pendCount = openCards.filter((r) => r.status === 'pending').length;
    if ($('#depositHistorySummary')) $('#depositHistorySummary').innerHTML =
    `<div class="dh-summary-row"><span>Tổng đã nạp</span><strong>${fmt(total)}</strong></div>
       <div class="dh-summary-row"><span>Số lần nạp thành công</span><strong>${deps.length}</strong></div>` + (
    pendCount ? `<div class="dh-summary-row"><span>Thẻ đang xử lý</span><strong>${pendCount}</strong></div>` : '');

    const badge = {
      pending: `<span class="dh-status pending">${cardStatusLabel('pending')}</span>`,
      failed: `<span class="dh-status failed">${cardStatusLabel('failed', 'Thẻ lỗi/sai')}</span>`
    };
    $('#depositHistoryList').innerHTML = items.length ?
    items.map((it) => {
      const when = it.date ? new Date(it.date).toLocaleString('vi-VN') : '';
      if (it.kind === 'ok') {
        return `<div class="dh-item">
              <div class="dh-item-main">
                <span class="dh-item-amount">+${fmt(it.amount)}</span>
                <span class="dh-item-desc">${esc(it.desc)}</span>
              </div>
              <span class="dh-item-date">${esc(when)}</span>
            </div>`;
      }
      return `<div class="dh-item dh-item-${it.kind}">
            <div class="dh-item-main">
              <span class="dh-item-desc">Nạp thẻ cào ${esc(it.telco || '')} ${fmt(it.declared || 0)} ${badge[it.kind] || ''}</span>
            </div>
            <span class="dh-item-date">${esc(when)}</span>
          </div>`;
    }).join('') :
    '<p class="empty-note">Bạn chưa có giao dịch nạp tiền nào.</p>';
  }

  // Lịch sử GIAO DỊCH đầy đủ của khách: nạp, mua, admin cộng/trừ — hiện trong menu 3 gạch.
  function openTxHistoryModal() {
    const user = Store.currentUser();
    if (!user) {toast('Vui lòng đăng nhập.', 'error');openModal('#authModal');return;}
    const txs = (Store.db.transactions || []).filter((t) => t.userId === user.userId);
    $('#txHistoryList').innerHTML = txs.length ?
    txs.map((t) => {
      const plus = (t.amount || 0) >= 0;
      return `
        <div class="dh-item">
          <div class="dh-item-main">
            <span class="dh-item-amount" style="color:${plus ? 'var(--success)' : 'var(--danger)'}">${plus ? '+' : ''}${fmt(t.amount || 0)}</span>
            <span class="dh-item-desc">${esc(t.description || (t.type === 'purchase' ? 'Mua hàng' : 'Giao dịch'))}</span>
          </div>
          <span class="dh-item-date">${esc(new Date(t.date).toLocaleString('vi-VN'))}</span>
        </div>`;
    }).join('') :
    '<p class="empty-note">Bạn chưa có giao dịch nào.</p>';
    openModal('#txHistoryModal');
  }

  // % chiết khấu nạp thẻ MẶC ĐỊNH — LẤY ĐÚNG theo bảng phí đổi thẻ cào của card2k.net
  // (mức "Thành viên"). Viettel/Vina/Mobifone/Gate/Vcoin chiết khấu KHÁC NHAU theo mệnh giá
  // nên dùng bảng theo mệnh giá; các cổng còn lại một mức. `default` dùng cho mệnh giá không
  // liệt kê. Phải khớp $DEFAULT_DISC trong card.php.
  const DEFAULT_CARD_DISCOUNTS = {
    VIETTEL: { 10000: 19, 20000: 19, 30000: 20, 50000: 18.5, 100000: 18.5, 200000: 18.5, 300000: 18.5, 500000: 20.5, 1000000: 20.5, default: 20.5 },
    VINAPHONE: { 10000: 19.5, 20000: 19.5, 30000: 19.5, 50000: 16.5, 100000: 15.5, 200000: 16, 300000: 16, 500000: 15.5, default: 15.5 },
    MOBIFONE: { 10000: 26, 20000: 26, 30000: 26, 50000: 25.5, 100000: 25, 200000: 23, 300000: 23, 500000: 22, default: 22 },
    GARENA: { 5000: 19.5, 10000: 18.5, 20000: 18.5, 50000: 18.5, 100000: 18.5, 200000: 18.5, 500000: 18.5, default: 18.5 },
    ZING: { default: 18.5 },
    GATE: { 10000: 17, 20000: 17, 50000: 17, 100000: 17, 200000: 17, 300000: 23.5, 500000: 17, 1000000: 17, 2000000: 23.5, 5000000: 17, default: 17 },
    VCOIN: { 2000000: 21, 5000000: 21.5, default: 19.5 },
    SCOIN: { default: 32.5 }
  };
  // Lấy % chiết khấu theo nhà mạng + mệnh giá. Ưu tiên admin tự đặt (một mức phẳng cho mọi
  // mệnh giá); nếu chưa đặt thì dùng bảng mặc định theo mệnh giá ở trên.
  function cardDiscountPct(telco, amount) {
    const cfg = Store.db.config && Store.db.config.cardDiscounts || {};
    const ov = cfg[telco];
    if (ov != null && ov !== '' && typeof ov !== 'object') return parseFloat(ov) || 0;
    const tbl = DEFAULT_CARD_DISCOUNTS[telco];
    if (!tbl) return 0;
    if (amount != null && tbl[amount] != null) return tbl[amount];
    return tbl.default || 0;
  }
  // Giá trị hiển thị tham khảo (dùng cho placeholder ô cấu hình admin).
  function cardDiscountHint(telco) {
    const tbl = DEFAULT_CARD_DISCOUNTS[telco];
    return tbl ? tbl.default || 0 : 0;
  }

  // ---- Giỏ hàng (mua nhiều sản phẩm cùng lúc) ----
  const CART_KEY = 'kenios_cart_v1';
  function getCart() {try {return JSON.parse(localStorage.getItem(CART_KEY)) || [];} catch {return [];}}
  function saveCart(c) {try {localStorage.setItem(CART_KEY, JSON.stringify(c));} catch {/* ignore */}updateCartBadge();}
  function addToCart(serviceId, packageId) {const c = getCart();c.push({ serviceId, packageId });saveCart(c);}
  function updateCartBadge() {
    const n = getCart().length;
    const b = $('#cartBadge');
    if (b) {b.textContent = n;b.hidden = n === 0;}
  }
  function cartItemInfo(it) {
    const service = Store.db.services.find((s) => s.id === it.serviceId);
    const pkg = service && (service.packages || []).find((p) => p.id === it.packageId);
    if (!service || !pkg) return null;
    let price = pkg.price;
    try {price = Store.computePurchasePrice(service, pkg, '', Store.currentUser()).final;} catch (e) {/* dùng giá gốc */}
    return { service, pkg, price };
  }
  function renderCart() {
    const cart = getCart();
    const listEl = $('#cartList');
    if (!listEl) return;
    let total = 0;
    const rows = [];
    cart.forEach((it, i) => {
      const info = cartItemInfo(it);
      if (!info) {rows.push(`<div class="cart-item"><div class="cart-item-main"><strong>Sản phẩm không còn</strong></div><button class="cart-item-del" data-cart-remove="${i}" title="Xóa">${ico('close')}</button></div>`);return;}
      total += info.price;
      rows.push(`<div class="cart-item">
        <div class="cart-item-main"><strong>${esc(info.service.name)}</strong><span>${esc(info.pkg.name)}</span></div>
        <span class="cart-item-price">${fmt(info.price)}</span>
        <button class="cart-item-del" data-cart-remove="${i}" title="Xóa khỏi giỏ">${ico('close')}</button>
      </div>`);
    });
    listEl.innerHTML = rows.length ? rows.join('') : '<p class="empty-note">Giỏ hàng trống. Vào sản phẩm bấm "Thêm vào giỏ" để thêm.</p>';
    if ($('#cartTotal')) $('#cartTotal').textContent = fmt(total);
    if ($('#cartFoot')) $('#cartFoot').hidden = !rows.length;
    if ($('#cartError')) $('#cartError').textContent = '';
  }
  function openCartModal() {renderCart();openModal('#cartModal');}

  async function checkoutCart() {
    const user = Store.currentUser();
    if (!user) {toast('Vui lòng đăng nhập trước khi mua.', 'error');openModal('#authModal');return;}
    const cart = getCart();
    if (!cart.length) return;
    let ok = 0;const failed = [];const remaining = [];
    for (const it of cart) {
      const info = cartItemInfo(it);
      if (!info) continue; // món không còn -> bỏ khỏi giỏ luôn
      try {
        if (Store.usesRealKeyStock(info.pkg)) await Store.redeemKeyOnServer(user.username, '', info.service, info.pkg, '');else
        await Store.purchase(info.service, info.pkg, '');
        ok++;
      } catch (e) {failed.push(`${info.service.name} - ${info.pkg.name}: ${e.message}`);remaining.push(it);}
    }
    saveCart(remaining); // giữ lại các món chưa mua được (hết key / thiếu tiền) để thử lại
    renderCart();
    if (ok > 0) toast(`Đã mua ${ok} sản phẩm! Xem key trong "Đơn hàng của tôi".`, 'success');
    if (failed.length) {
      if ($('#cartError')) $('#cartError').innerHTML = 'Chưa mua được (còn trong giỏ):<br>' + failed.map(esc).join('<br>');
    } else {
      closeModal('#cartModal');
      openOrdersModal();
    }
  }

  function wireCart() {var _$17, _$18, _$19, _$20;
    updateCartBadge();
    (_$17 = $('#mobileNavCart')) === null || _$17 === void 0 || _$17.addEventListener('click', () => {closeMobileNavGlobal();openCartModal();});
    (_$18 = $('#cartClearBtn')) === null || _$18 === void 0 || _$18.addEventListener('click', () => {if (confirm('Xóa hết sản phẩm trong giỏ?')) {saveCart([]);renderCart();}});
    (_$19 = $('#cartCheckoutBtn')) === null || _$19 === void 0 || _$19.addEventListener('click', () => withLoading($('#cartCheckoutBtn'), checkoutCart));
    (_$20 = $('#cartList')) === null || _$20 === void 0 || _$20.addEventListener('click', (e) => {
      const del = e.target.closest('[data-cart-remove]');
      if (del) {const c = getCart();c.splice(parseInt(del.dataset.cartRemove, 10), 1);saveCart(c);renderCart();}
    });
  }

  // ---- Thông tin pháp lý ----
  function wireLegalModal() {}
  function openLegalModal(key) {
    const data = LEGAL_CONTENT[key];
    if (!data) return;
    setText('#legalTitle', data.title);
    $('#legalContent').innerHTML = data.html;
    openModal('#legalModal');
  }

  // ============================================================
  // TRỢ LÝ ẢO AI
  // ============================================================
  function wireAiWidget() {
    const cfg = Store.db.config;
    setText('#aiName', cfg.aiName);
    $('#aiAvatar').src = cfg.aiAvatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=kenios-ai`;

    const quick = [
    { icon: 'card', label: 'Nạp tiền', text: 'Cách nạp tiền' },
    { icon: 'tag', label: 'Bảng giá', text: 'Xem bảng giá' },
    { icon: 'cart', label: 'Cách mua key', text: 'Cách mua key' },
    { icon: 'shield', label: 'Bảo hành', text: 'Chính sách bảo hành' },
    { icon: 'web', label: 'Thiết kế web', text: 'Dịch vụ thiết kế web' },
    { icon: 'headset', label: 'Liên hệ Admin', text: 'Liên hệ admin' }];

    $('#aiQuickReplies').innerHTML = quick.map((q) => `<button data-q="${esc(q.text)}"><span class="qr-ico">${ICONS[q.icon]}</span>${esc(q.label)}</button>`).join('');
    $('#aiQuickReplies').addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (btn) sendAiMessage(btn.dataset.q);
    });

    $('#aiFab').addEventListener('click', () => {
      const panel = $('#aiPanel');
      const wasHidden = panel.hidden;
      panel.hidden = !panel.hidden;
      if (wasHidden && !$('#aiMessages').children.length) {
        addAiMessage(cfg.aiGreeting, 'bot');
      }
    });
    $('#aiClose').addEventListener('click', () => {$('#aiPanel').hidden = true;});

    $('#aiForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const input = $('#aiInput');
      const text = input.value.trim();
      if (!text) return;
      sendAiMessage(text);
      input.value = '';
    });
  }

  function addAiMessage(text, who) {
    const el = document.createElement('div');
    el.className = `ai-msg ${who}`;
    el.textContent = text;
    $('#aiMessages').appendChild(el);
    $('#aiMessages').scrollTop = $('#aiMessages').scrollHeight;
  }

  function sendAiMessage(text) {
    addAiMessage(text, 'user');
    const reply = getAiReply(text.toLowerCase());
    setTimeout(() => {addAiMessage(reply, 'bot');}, 350);
  }

  // Bảng giá theo từng mục — khách hỏi đúng mục nào thì trả lời riêng mục đó,
  // chỉ đưa ra toàn bộ bảng giá (cfg.aiResponsePrice) khi khách hỏi chung chung.
  const PRICE_ITEMS = [
  { keys: ['vnhax mod skin', 'mod skin vn', 'mod skin'], text: '💎 VNHAX MOD SKIN VN\n💰 450K/Tháng\n💰 225K/Tuần' },
  { keys: ['vnhax'], text: '💎 VNHAX\n💰 600K/Tháng\n💰 300K/Tuần' },
  { keys: ['oasis'], text: '💎 OASIS VIP\n💰 800K/Tháng\n💰 400K/Tuần' },
  { keys: ['king'], text: '💎 KING\n💰 900K/Tháng\n💰 450K/Tuần' },
  { keys: ['timo'], text: '💎 TIMO VIP\n💰 500K/Tháng\n💰 250K/Tuần\n💰 50K/Ngày' },
  { keys: ['vingodl', 'vin godl'], text: '💎 VINGODL\n💰 550K/Tháng\n💰 250K/Tuần' },
  { keys: ['zolo'], text: 'PUBG ANDROID — ZOLO\n💰 500K/Tháng\n💰 250K/Tuần' },
  { keys: ['vnb'], text: 'PUBG ANDROID — VNB\n💰 500K/Tháng\n💰 250K/Tuần' },
  { keys: ['root'], text: 'PUBG ANDROID — ROOT\n💰 650K/Tháng' },
  { keys: ['mg'], text: 'PUBG ANDROID — MG\n💰 500K/Tháng\n💰 250K/Tuần' },
  { keys: ['liên quân', 'lien quan'], text: '⚔️ LIÊN QUÂN\n💰 250K/Tháng\n💰 120K/Tuần\n💰 500K/Tháng chống tố\n💰 250K/Tuần chống tố' },
  { keys: ['free fire', 'freefire'], text: '🔥 FREE FIRE\n💰 550K/Tháng\n💰 250K/Tuần' },
  { keys: ['pubg ios', 'ios'], text: '🎮 PUBG IOS\n\n💎 VNHAX: 600K/Tháng - 300K/Tuần\n💎 VNHAX MOD SKIN VN: 450K/Tháng - 225K/Tuần\n💎 OASIS VIP: 800K/Tháng - 400K/Tuần\n💎 KING: 900K/Tháng - 450K/Tuần\n💎 TIMO VIP: 500K/Tháng - 250K/Tuần - 50K/Ngày\n💎 VINGODL: 550K/Tháng - 250K/Tuần' },
  { keys: ['pubg android', 'android'], text: 'PUBG ANDROID\n\n💰 ZOLO: 500K/Tháng - 250K/Tuần\n💰 MG: 500K/Tháng - 250K/Tuần\n💰 VNB: 500K/Tháng - 250K/Tuần\n💰 ROOT: 650K/Tháng' }];


  function matchPriceItem(t) {
    const norm = t.toLowerCase();
    const hasWord = (w) => new RegExp(`\\b${w}\\b`, 'i').test(norm);
    for (const item of PRICE_ITEMS) {
      for (const key of item.keys) {
        const matched = key.includes(' ') ? norm.includes(key) : hasWord(key);
        if (matched) return item.text;
      }
    }
    return null;
  }

  function getAiReply(t) {
    const cfg = Store.db.config;
    // 1) Chào hỏi
    if (/^(chào|hello|hi|hey|alo|xin chào|chao)\b/.test(t) || /^(hi|hello|alo)$/.test(t.trim())) return cfg.aiResponseGreeting;
    // 2) Hỏi đúng 1 sản phẩm trong bảng giá -> trả lời riêng mục đó
    const specificPrice = matchPriceItem(t);
    if (specificPrice) return specificPrice;
    // 3) Hỏi chung về bảng giá -> đưa cả bảng
    if (/bảng giá|bang gia|giá cả|xem giá|full giá|price list|có những gói/.test(t)) return cfg.aiResponsePrice;
    // 4) Bộ câu trả lời sẵn (admin thêm được nhiều tuỳ ý)
    for (const item of cfg.aiKnowledge || []) {
      const kws = String(item.k || '').split(/[,\n]/).map((s) => s.trim().toLowerCase()).filter(Boolean);
      if (kws.some((k) => t.includes(k))) return item.a;
    }
    // 5) Không khớp -> câu mặc định
    return cfg.aiResponseFallback;
  }

  // ============================================================
  // ADMIN DASHBOARD
  // ============================================================
  // Đưa tab đang chọn vào giữa tầm nhìn của thanh tab (khi thanh tab cuộn ngang
  // trên mobile), tránh trường hợp tab đầu/cuối bị khuất mép.
  function scrollAdminTabIntoView(btn) {
    if (!btn || typeof btn.scrollIntoView !== 'function') return;
    try {btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });} catch (_) {}
  }

  // Các tab Cộng tác viên được phép xem: Tổng quan, Đơn hàng, Dịch vụ (thêm/sửa
  // sản phẩm) và Thư viện. KHÔNG có Cấu hình, Người dùng, Ngân hàng — an toàn.
  const CTV_TABS = ['overview', 'orders', 'services', 'media'];

  function openAdminModal() {
    if (!Store.canAccessAdmin()) {toast('Bạn không có quyền truy cập.', 'error');return;}
    const ctv = Store.isCtv();
    // Ẩn các tab nhạy cảm với CTV; admin thấy đủ.
    $$('.admin-tab').forEach((t) => {t.hidden = ctv && !CTV_TABS.includes(t.dataset.adminTab);});
    adminActiveTab = 'overview';
    const first = $('.admin-tab[data-admin-tab="overview"]');
    $$('.admin-tab').forEach((t) => t.classList.toggle('active', t === first));
    if ($('#adminTabs')) $('#adminTabs').scrollLeft = 0; // luôn bắt đầu từ tab đầu tiên
    renderAdminTab('overview');
    $('#adminSyncMsg').textContent = '';
    openModal('#adminModal');
  }

  function wireAdminModal() {
    $('#adminTabs').addEventListener('click', (e) => {
      const btn = e.target.closest('.admin-tab');
      if (!btn) return;
      adminActiveTab = btn.dataset.adminTab;
      $$('.admin-tab', $('#adminTabs')).forEach((t) => t.classList.toggle('active', t === btn));
      scrollAdminTabIntoView(btn);
      renderAdminTab(adminActiveTab);
    });

    // Ủy quyền sự kiện cho toàn bộ nội dung động bên trong bảng quản trị.
    $('#adminPanelBody').addEventListener('click', onAdminPanelClick);
    $('#adminPanelBody').addEventListener('submit', onAdminPanelSubmit);
    $('#adminPanelBody').addEventListener('change', onAdminPanelChange);

    $('#adminLoadKeysBtn').addEventListener('click', () => {
      const user = Store.currentUser();
      const creds = getAdminCreds();
      if (!creds) {toast('Vui lòng đăng nhập lại admin 1 lần.', 'error');return;}
      withLoading($('#adminLoadKeysBtn'), async () => {
        try {
          await Store.fetchFullServiceKeys(user.username, creds.password);
          renderAdminTab('services');
          toast('Đã tải kho key đầy đủ từ máy chủ.', 'success');
        } catch (err) {$('#adminSyncMsg').textContent = err.message;}
      });
    });
  }

  // Đồng bộ toàn bộ dữ liệu lên máy chủ dùng thông tin admin đã lưu trong phiên
  // (không cần nhập lại mật khẩu). Nếu chưa có (vd. đã tải lại trang), yêu cầu đăng nhập lại.
  async function saveUiToServer() {
    let creds = getAdminCreds();
    const user = Store.currentUser();
    if (!user || user.role !== 'admin') {toast('Chỉ admin mới lưu được giao diện.', 'error');return;}
    // Thiếu mật khẩu đã nhớ (vd. đăng nhập bằng Google, hoặc bản cũ) → KHÔNG đăng
    // xuất nữa. Hỏi mật khẩu 1 lần rồi nhớ lại; nếu bỏ qua thì vẫn giữ bản đã lưu
    // cục bộ, không bắt đăng nhập lại.
    if (!creds || creds.username.toLowerCase() !== user.username.toLowerCase()) {
      let pw = null;
      try {pw = window.prompt('Nhập mật khẩu admin 1 lần để đồng bộ lên máy chủ (sẽ được nhớ, không hỏi lại):');} catch {pw = null;}
      if (!pw) {
        toast('Đã lưu cục bộ. Chưa đồng bộ lên máy chủ (bỏ qua nhập mật khẩu).', 'success');
        return;
      }
      rememberAdminCreds(user.username, pw);
      creds = getAdminCreds();
    }
    const btn = $('#adminSyncServerBtn');
    const msgEl = $('#adminConfigSyncMsg');
    await withLoading(btn || { classList: { add: () => {}, remove: () => {} }, disabled: false }, async () => {
      const result = await Store.trySaveToServer(creds.username, creds.password);
      if (result.status === 'success') {
        toast('Đã lưu giao diện lên máy chủ! Mọi khách truy cập sẽ thấy thay đổi.', 'success');
        if (msgEl) msgEl.textContent = 'Đã lưu lúc ' + new Date().toLocaleTimeString('vi-VN');
        if ($('#adminSyncMsg')) $('#adminSyncMsg').textContent = 'Đã lưu lúc ' + new Date().toLocaleTimeString('vi-VN');
      } else {
        toast(result.message || 'Lưu thất bại. Thử đăng nhập lại admin.', 'error');
      }
    });
  }

  // Tự đồng bộ toàn bộ dữ liệu lên máy chủ NGAY sau khi admin thêm/sửa/xóa nội dung
  // (sản phẩm, danh mục, combo...) bằng mật khẩu admin đã nhớ — không cần bấm nút riêng.
  // Nếu chưa nhớ mật khẩu (vd. đăng nhập Google) hoặc máy chủ lỗi thì giữ bản cục bộ và
  // nhắc bấm "Đồng bộ lên máy chủ". Trả về true nếu đã đẩy lên server.
  async function autoSyncToServer(okMsg, localMsg) {
    const creds = getAdminCreds();
    const user = Store.currentUser();
    const ok = okMsg || 'Đã lưu và đồng bộ lên máy chủ.';
    const local = localMsg || 'Đã lưu (cục bộ). Hãy bấm "Đồng bộ lên máy chủ" để đưa lên web.';
    if (!creds || !user || user.role !== 'admin' || creds.username.toLowerCase() !== user.username.toLowerCase()) {
      toast(local, 'success');
      return false;
    }
    try {
      const res = await Store.trySaveToServer(creds.username, creds.password);
      if (res && res.status === 'success') {toast(ok, 'success');return true;}
      toast(res && res.message ? res.message : local, res && res.message ? 'error' : 'success');
      return false;
    } catch (e) {
      toast(local, 'success');
      return false;
    }
  }

  function renderAdminTab(tab) {
    const body = $('#adminPanelBody');
    // Nút "Tải kho key đầy đủ" chỉ liên quan tới sản phẩm → chỉ hiện ở tab Dịch vụ.
    const loadKeysBtn = $('#adminLoadKeysBtn');
    if (loadKeysBtn) loadKeysBtn.hidden = tab !== 'services';
    // Chốt chặn: Cộng tác viên chỉ được xem các tab cho phép.
    if (Store.isCtv() && !CTV_TABS.includes(tab)) {
      body.innerHTML = '<p class="empty-note">Bạn (Cộng tác viên) không có quyền xem mục này.</p>';
      return;
    }
    if (tab === 'overview') body.innerHTML = adminOverviewHtml();else
    if (tab === 'services') body.innerHTML = adminServicesHtml();else
    if (tab === 'categories') body.innerHTML = adminCategoriesHtml();else
    if (tab === 'orders') {body.innerHTML = adminOrdersHtml();wireAdminTableTools('orders');} else
    if (tab === 'report') {body.innerHTML = adminReportHtml();wireAdminReport();} else
    if (tab === 'users') {body.innerHTML = adminUsersHtml();wireAdminTableTools('users');} else
    if (tab === 'media') body.innerHTML = adminMediaHtml();else
    if (tab === 'linkgen') body.innerHTML = adminLinkGenHtml();else
    if (tab === 'combos') body.innerHTML = adminCombosHtml();else
    if (tab === 'promo') {var _$21;body.innerHTML = adminPromoHtml();(_$21 = $('#adminSyncServerBtn')) === null || _$21 === void 0 || _$21.addEventListener('click', () => saveUiToServer());} else
    if (tab === 'cards') {body.innerHTML = adminCardsHtml();wireAdminCards();} else
    if (tab === 'config') {body.innerHTML = adminConfigHtml();wireAdminConfigSecretBoxes();} else
    if (tab === 'backup') {body.innerHTML = adminBackupHtml();wireBackupBox();}
  }

  function wireAdminConfigSecretBoxes() {var _$22, _$23, _$24, _$25, _$26, _$27;
    // Wire nút Đồng bộ lên máy chủ (chỉ nằm trong tab Config)
    (_$22 = $('#adminSyncServerBtn')) === null || _$22 === void 0 || _$22.addEventListener('click', () => saveUiToServer());

    const baseUrl = `${location.origin}${location.pathname.replace(/[^/]*$/, '')}`;
    $('#bankWebhookUrl').value = `${baseUrl}bank_callback.php`;
    $('#copyWebhookUrlBtn').addEventListener('click', () => {var _navigator$clipboard5;
      (_navigator$clipboard5 = navigator.clipboard) === null || _navigator$clipboard5 === void 0 || _navigator$clipboard5.writeText($('#bankWebhookUrl').value).then(() => toast('Đã sao chép URL webhook!', 'success'));
    });
    if ($('#cardCallbackUrl')) $('#cardCallbackUrl').value = `${baseUrl}card.php`;
    (_$23 = $('#copyCardCbBtn')) === null || _$23 === void 0 || _$23.addEventListener('click', () => {var _navigator$clipboard6;
      (_navigator$clipboard6 = navigator.clipboard) === null || _navigator$clipboard6 === void 0 || _navigator$clipboard6.writeText($('#cardCallbackUrl').value).then(() => toast('Đã sao chép Callback URL!', 'success'));
    });

    const user = Store.currentUser();
    const creds = getAdminCreds();
    const pass = creds ? creds.password : '';
    Store.secretsStatus(user.username, pass).then((res) => {
      if (res.status !== 'success') {
        $('#bankTokenStatus').textContent = 'Chưa xác định được trạng thái (đăng nhập lại admin nếu cần).';
        return;
      }
      $('#bankTokenStatus').innerHTML = res.bankTokenConfigured ? `${ico('check')} Đã cấu hình token webhook.` : 'Chưa cấu hình — webhook sẽ từ chối mọi giao dịch thật cho tới khi lưu token.';
      if ($('#cardApiStatus')) $('#cardApiStatus').innerHTML = res.cardConfigured ? `${ico('check')} Đã cấu hình API thẻ cào — khách nạp thẻ được.` : 'Chưa cấu hình — nhập Partner ID + Partner Key để bật nạp thẻ cào.';
      if ($('#telegramStatus')) $('#telegramStatus').innerHTML = res.telegramConfigured ? `${ico('check')} Đã bật thông báo Telegram — admin nhận tin khi có đơn/nạp tiền.` : 'Chưa bật — nhập Bot Token + Chat ID để nhận thông báo.';
    }).catch(() => {
      $('#bankTokenStatus').textContent = 'Không kiểm tra được trạng thái.';
      if ($('#cardApiStatus')) $('#cardApiStatus').textContent = 'Không kiểm tra được trạng thái.';
      if ($('#telegramStatus')) $('#telegramStatus').textContent = 'Không kiểm tra được trạng thái.';
    });

    $('#saveBankTokenBtn').addEventListener('click', () => {
      const token = $('#bankTokenInput').value.trim();
      const c = getAdminCreds();
      if (!token) {toast('Vui lòng nhập token trước khi lưu.', 'error');return;}
      if (!c) {toast('Vui lòng đăng nhập lại admin 1 lần.', 'error');return;}
      withLoading($('#saveBankTokenBtn'), async () => {
        const res = await Store.saveSecrets(c.username, c.password, { bankToken: token });
        toast(res.message || (res.status === 'success' ? 'Đã lưu.' : 'Lưu thất bại.'), res.status === 'success' ? 'success' : 'error');
        if (res.status === 'success') {$('#bankTokenInput').value = '';renderAdminTab('config');}
      });
    });

    (_$24 = $('#saveCardApiBtn')) === null || _$24 === void 0 || _$24.addEventListener('click', () => {
      const pid = $('#cardPartnerIdInput').value.trim();
      const pkey = $('#cardPartnerKeyInput').value.trim();
      const c = getAdminCreds();
      if (!pid && !pkey) {toast('Nhập Partner ID và/hoặc Partner Key trước khi lưu.', 'error');return;}
      if (!c) {toast('Vui lòng đăng nhập lại admin 1 lần.', 'error');return;}
      const patch = {};
      if (pid) patch.cardPartnerId = pid;
      if (pkey) patch.cardPartnerKey = pkey;
      withLoading($('#saveCardApiBtn'), async () => {
        const res = await Store.saveSecrets(c.username, c.password, patch);
        toast(res.message || (res.status === 'success' ? 'Đã lưu.' : 'Lưu thất bại.'), res.status === 'success' ? 'success' : 'error');
        if (res.status === 'success') {$('#cardPartnerIdInput').value = '';$('#cardPartnerKeyInput').value = '';renderAdminTab('config');}
      });
    });

    // ---- Thông báo Telegram ----
    (_$25 = $('#saveTelegramBtn')) === null || _$25 === void 0 || _$25.addEventListener('click', () => {
      const tok = $('#telegramTokenInput').value.trim();
      const chat = $('#telegramChatInput').value.trim();
      const c = getAdminCreds();
      if (!tok && !chat) {toast('Nhập Bot Token và/hoặc Chat ID trước khi lưu.', 'error');return;}
      if (!c) {toast('Vui lòng đăng nhập lại admin 1 lần.', 'error');return;}
      const patch = {};
      if (tok) patch.telegramBotToken = tok;
      if (chat) patch.telegramChatId = chat;
      withLoading($('#saveTelegramBtn'), async () => {
        const res = await Store.saveSecrets(c.username, c.password, patch);
        toast(res.message || (res.status === 'success' ? 'Đã lưu.' : 'Lưu thất bại.'), res.status === 'success' ? 'success' : 'error');
        if (res.status === 'success') {$('#telegramTokenInput').value = '';$('#telegramChatInput').value = '';renderAdminTab('config');}
      });
    });
    (_$26 = $('#testTelegramBtn')) === null || _$26 === void 0 || _$26.addEventListener('click', () => {
      const c = getAdminCreds();
      if (!c) {toast('Vui lòng đăng nhập lại admin 1 lần.', 'error');return;}
      withLoading($('#testTelegramBtn'), async () => {
        const res = await Store.testTelegram(c.username, c.password);
        toast(res.message || (res.status === 'success' ? 'Đã gửi tin thử — kiểm tra Telegram!' : 'Gửi thất bại.'), res.status === 'success' ? 'success' : 'error');
      });
    });
    (_$27 = $('#clearTelegramBtn')) === null || _$27 === void 0 || _$27.addEventListener('click', () => {
      const c = getAdminCreds();
      if (!c) {toast('Vui lòng đăng nhập lại admin 1 lần.', 'error');return;}
      if (!confirm('Tắt thông báo Telegram? Bạn sẽ không nhận tin nữa cho tới khi cấu hình lại.')) return;
      withLoading($('#clearTelegramBtn'), async () => {
        const res = await Store.saveSecrets(c.username, c.password, { telegramBotToken: '-', telegramChatId: '-' });
        toast(res.status === 'success' ? 'Đã tắt thông báo Telegram.' : res.message || 'Thất bại.', res.status === 'success' ? 'success' : 'error');
        if (res.status === 'success') renderAdminTab('config');
      });
    });
  }

  // ---- Sao lưu & Khôi phục dữ liệu trên máy chủ ----
  function wireBackupBox() {var _$28, _$29, _$30, _$31, _$32, _$34;
    const infoEl = $('#backupInfoStatus');
    const msgEl = $('#backupMsg');
    const setMsg = (t, ok) => {if (msgEl) {msgEl.textContent = t;msgEl.style.color = ok === false ? 'var(--danger, #ef4444)' : ok ? 'var(--success, #22c55e)' : 'var(--muted)';}};

    function refreshInfo() {
      const c = getAdminCreds();
      if (!infoEl) return;
      if (!c) {infoEl.textContent = 'Đăng nhập lại admin 1 lần để xem trạng thái sao lưu.';return;}
      Store.backupInfo(c.username, c.password).then((res) => {
        if (res.status !== 'success') {infoEl.textContent = res.message || 'Không kiểm tra được bản sao lưu.';return;}
        if (res.exists) {
          const when = res.time ? new Date(res.time).toLocaleString('vi-VN') : '(không rõ thời gian)';
          const kb = res.size ? ' · ' + Math.max(1, Math.round(res.size / 1024)) + ' KB' : '';
          infoEl.innerHTML = '<span class="backup-ok-ico">' + ICONS.check + '</span> Có bản sao lưu trên máy chủ · Cập nhật: ' + esc(when) + kb;
        } else {
          infoEl.textContent = 'Chưa có bản sao lưu. Bấm "Sao lưu ngay" hoặc "Đồng bộ lên máy chủ" để tạo.';
        }
      }).catch(() => {infoEl.textContent = 'Không kiểm tra được bản sao lưu.';});
    }
    refreshInfo();

    // Trạng thái kho đơn hàng bền vững (số đơn đang lưu).
    function refreshOrdersInfo() {
      const el = $('#ordersArchiveStatus');
      if (!el) return;
      const c = getAdminCreds();
      if (!c) {el.textContent = 'Đăng nhập lại admin 1 lần để xem kho đơn hàng.';return;}
      Store.ordersArchiveInfo(c.username, c.password).then((res) => {
        if (!res || res.status !== 'success') {el.textContent = 'Không kiểm tra được kho đơn hàng.';return;}
        if (res.exists && res.count > 0) {
          const when = res.time ? new Date(res.time).toLocaleString('vi-VN') : '';
          el.innerHTML = '<span class="backup-ok-ico">' + ICONS.check + '</span> Đang lưu <b>' + res.count + '</b> đơn hàng khách' + (when ? ' · Cập nhật: ' + esc(when) : '');
        } else {
          el.textContent = 'Chưa có đơn hàng nào trong kho (sẽ tự lưu khi có khách mua hoặc khi bấm Đồng bộ).';
        }
      }).catch(() => {el.textContent = 'Không kiểm tra được kho đơn hàng.';});
    }
    refreshOrdersInfo();

    (_$28 = $('#recoverOrdersBtn')) === null || _$28 === void 0 || _$28.addEventListener('click', () => {
      const c = getAdminCreds();
      if (!c) {toast('Vui lòng đăng nhập lại admin 1 lần.', 'error');return;}
      if (!confirm('Phục hồi các đơn hàng khách đang thiếu từ kho đơn hàng về web? Sản phẩm/cấu hình hiện tại KHÔNG bị đụng tới.')) return;
      withLoading($('#recoverOrdersBtn'), async () => {
        setMsg('Đang phục hồi đơn hàng…');
        const res = await Store.recoverOrders(c.username, c.password);
        if (res.status === 'success') {
          const n = res.recovered || 0;
          setMsg(n > 0 ? `Đã phục hồi ${n} đơn hàng khách. Đang tải lại…` : 'Không có đơn nào cần phục hồi (web đang đủ đơn).', true);
          toast(n > 0 ? `Đã phục hồi ${n} đơn hàng!` : 'Web đang đủ đơn hàng.', 'success');
          if (n > 0) {Store._clearLocalOverrides();setTimeout(() => location.reload(), 900);} else
          refreshOrdersInfo();
        } else {setMsg(res.message || 'Phục hồi thất bại.', false);toast(res.message || 'Phục hồi thất bại.', 'error');}
      });
    });

    (_$29 = $('#backupNowBtn')) === null || _$29 === void 0 || _$29.addEventListener('click', () => {
      const c = getAdminCreds();
      if (!c) {toast('Vui lòng đăng nhập lại admin 1 lần.', 'error');return;}
      withLoading($('#backupNowBtn'), async () => {
        setMsg('Đang sao lưu…');
        const res = await Store.backupNow(c.username, c.password);
        if (res.status === 'success') {setMsg('Đã tạo bản sao lưu trên máy chủ lúc ' + new Date().toLocaleTimeString('vi-VN') + '.', true);toast('Đã sao lưu lên máy chủ!', 'success');refreshInfo();} else
        {setMsg(res.message || 'Sao lưu thất bại.', false);toast(res.message || 'Sao lưu thất bại.', 'error');}
      });
    });

    (_$30 = $('#backupRestoreBtn')) === null || _$30 === void 0 || _$30.addEventListener('click', () => {
      const c = getAdminCreds();
      if (!c) {toast('Vui lòng đăng nhập lại admin 1 lần.', 'error');return;}
      if (!confirm('Khôi phục sẽ ghi đè toàn bộ dữ liệu hiện tại bằng bản sao lưu trên máy chủ. Trang sẽ tải lại sau khi khôi phục. Tiếp tục?')) return;
      withLoading($('#backupRestoreBtn'), async () => {
        setMsg('Đang khôi phục…');
        const res = await Store.restoreFromServer(c.username, c.password);
        if (res.status === 'success') {
          // Xóa bản ghi đè cục bộ (localStorage) TRƯỚC khi tải lại — nếu không, dữ liệu
          // cũ trong trình duyệt sẽ đè lên bản vừa khôi phục từ máy chủ, khiến việc khôi
          // phục như không có tác dụng.
          Store._clearLocalOverrides();
          setMsg('Đã khôi phục. Đang tải lại trang…', true);
          toast('Đã khôi phục dữ liệu từ máy chủ!', 'success');
          setTimeout(() => location.reload(), 900);
        } else {setMsg(res.message || 'Khôi phục thất bại.', false);toast(res.message || 'Khôi phục thất bại.', 'error');}
      });
    });

    // Nút tải backup là 1 LIÊN KẾT THẬT (<a>) đã GẮN SẴN đường dẫn tải ở href (làm trong
    // adminBackupHtml). KHÔNG sửa href lúc bấm để tránh iOS dùng href cũ (=> mở nhầm trang
    // chủ). Ở đây chỉ: nếu chưa có khóa admin thì chặn + nhắc; còn lại chỉ hiện hướng dẫn.
    const _dlBtn = $('#backupDownloadBtn');
    if (_dlBtn) {
      _dlBtn.addEventListener('click', (ev) => {
        const href = _dlBtn.getAttribute('href') || '';
        if (!getAdminCreds() || href === '#' || href === '') {
          ev.preventDefault();
          toast('Vui lòng đăng nhập lại admin 1 lần.', 'error');
          return;
        }
        setMsg('Đang tải bản sao lưu… Trên iPhone: xem ở biểu tượng Tải về (mũi tên ⌄) cạnh thanh địa chỉ, hoặc app Tệp → Tải về. Trên máy tính: xem mục Downloads.', true);
      });
    }

    (_$32 = $('#backupImportBtn')) === null || _$32 === void 0 || _$32.addEventListener('click', () => {var _$33;return (_$33 = $('#backupImportInput')) === null || _$33 === void 0 ? void 0 : _$33.click();});
    (_$34 = $('#backupImportInput')) === null || _$34 === void 0 || _$34.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const c = getAdminCreds();
      if (!c) {toast('Vui lòng đăng nhập lại admin 1 lần.', 'error');e.target.value = '';return;}
      if (!confirm('Phục hồi từ file "' + file.name + '" sẽ ghi đè toàn bộ dữ liệu hiện tại và đồng bộ lên máy chủ. Trang sẽ tải lại. Tiếp tục?')) {e.target.value = '';return;}
      const reader = new FileReader();
      reader.onload = async () => {
        let dbObj;
        try {dbObj = JSON.parse(reader.result);}
        catch (err) {setMsg('File không phải JSON hợp lệ.', false);toast('File sao lưu lỗi.', 'error');e.target.value = '';return;}
        setMsg('Đang phục hồi từ file…');
        try {
          const res = await Store.importDb(dbObj, c.username, c.password);
          if (res && res.status === 'success') {
            setMsg('Đã phục hồi từ file. Đang tải lại trang…', true);
            toast('Đã phục hồi dữ liệu từ file!', 'success');
            setTimeout(() => location.reload(), 900);
          } else {setMsg(res && res.message || 'Phục hồi thất bại.', false);toast(res && res.message || 'Phục hồi thất bại.', 'error');}
        } catch (err) {setMsg(err.message || 'File sao lưu không hợp lệ.', false);toast(err.message || 'File sao lưu không hợp lệ.', 'error');}
        e.target.value = '';
      };
      reader.readAsText(file);
    });
  }

  function adminOverviewHtml() {
    const db = Store.db;
    const revenue = db.orders.reduce((sum, o) => sum + (o.price || 0), 0);
    const totalBalance = db.users.reduce((sum, u) => sum + (u.balance || 0), 0);
    const totalDeposit = (db.transactions || []).filter((t) => t.type === 'deposit').reduce((s, t) => s + (t.amount || 0), 0);
    const stats = [
    { label: 'Người dùng', value: db.users.length },
    { label: 'Đơn hàng', value: db.orders.length },
    { label: 'Doanh thu', value: fmt(revenue) },
    { label: 'Tổng đã nạp', value: fmt(totalDeposit) },
    { label: 'Tổng số dư ví', value: fmt(totalBalance) }];

    const recent = db.orders.slice(0, 5);

    // ----- Doanh thu 14 ngày gần nhất (từ đơn hàng) -----
    const days = 14;
    const byDay = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();d.setHours(0, 0, 0, 0);d.setDate(d.getDate() - i);
      const start = d.getTime(),end = start + 86400000;
      const total = db.orders.reduce((s, o) => {
        const t = Date.parse(o.purchaseDate || o.date);
        return !isNaN(t) && t >= start && t < end ? s + (o.price || 0) : s;
      }, 0);
      byDay.push({ label: `${d.getDate()}/${d.getMonth() + 1}`, total });
    }
    const maxDay = Math.max(1, ...byDay.map((x) => x.total));
    const chart = byDay.map((x) => `
      <div class="revenue-bar-wrap" title="${x.label}: ${fmt(x.total)}">
        <span class="revenue-bar-val">${x.total > 0 ? Math.round(x.total / 1000) + 'k' : ''}</span>
        <div class="revenue-bar" style="height:${Math.round(x.total / maxDay * 100)}%"></div>
        <span class="revenue-bar-label">${x.label}</span>
      </div>`).join('');

    // ----- Sản phẩm bán chạy (theo doanh thu) -----
    const prodMap = {};
    db.orders.forEach((o) => {
      const k = o.serviceName || 'Khác';
      if (!prodMap[k]) prodMap[k] = { name: k, count: 0, revenue: 0 };
      prodMap[k].count++;prodMap[k].revenue += o.price || 0;
    });
    const topProducts = Object.values(prodMap).sort((a, b) => b.revenue - a.revenue).slice(0, 6);
    const maxProd = Math.max(1, ...topProducts.map((p) => p.revenue));

    // ----- Cảnh báo kho key sắp hết (gói có kho key thật, còn ≤ 5) -----
    const LOW = 5;
    const lowStock = [];
    (db.services || []).forEach((s) => {
      (s.packages || []).forEach((p) => {
        if (typeof p.keyCount === 'number' && p.keyCount <= LOW) {
          lowStock.push({ svc: s.name, pkg: p.name, count: p.keyCount });
        }
      });
    });
    const lowStockHtml = lowStock.length ? `
      <div class="admin-lowstock">
        <div class="admin-lowstock-head">${ico('warn')} <b>${lowStock.length}</b> gói sắp/đã hết key — hãy nhập thêm để không gián đoạn bán hàng</div>
        <div class="admin-lowstock-list">
          ${lowStock.map((x) => `<span class="admin-lowstock-item ${x.count === 0 ? 'out' : ''}">${esc(x.svc)} · ${esc(x.pkg)}: <b>${x.count === 0 ? 'HẾT KEY' : 'còn ' + x.count}</b></span>`).join('')}
        </div>
      </div>` : '';

    // ----- Lịch sử dùng mã giảm giá -----
    const codes = (db.config.discountCodes || []).filter((d) => (parseInt(d.usedCount, 10) || 0) > 0).
    sort((a, b) => (parseInt(b.usedCount, 10) || 0) - (parseInt(a.usedCount, 10) || 0));

    return `
      <div class="admin-guide">
        <b>${ico('bulb')} Hướng dẫn:</b> Trang <b>Tổng quan</b> cho bạn thấy sức khoẻ shop: số liệu nhanh, biểu đồ
        <b>doanh thu 14 ngày</b>, <b>sản phẩm bán chạy</b> và <b>lịch sử dùng mã giảm giá</b>. Dữ liệu tự
        cập nhật theo đơn hàng & giao dịch thực tế.
      </div>
      <div class="admin-stat-grid">
        ${stats.map((s) => `<div class="admin-stat-card"><strong>${s.value}</strong><span>${s.label}</span></div>`).join('')}
      </div>

      ${lowStockHtml}

      <h4 class="admin-section-title">Doanh thu 14 ngày gần nhất</h4>
      <div class="revenue-chart">${chart}</div>

      <h4 class="admin-section-title">Sản phẩm bán chạy (theo doanh thu)</h4>
      <div class="top-products">
        ${topProducts.length ? topProducts.map((p) => `
          <div class="top-product-row">
            <span style="flex:0 0 34%;">${esc(p.name)}</span>
            <span class="top-product-bar"><span style="width:${Math.round(p.revenue / maxProd * 100)}%"></span></span>
            <span style="flex:0 0 auto;color:var(--gold-soft);">${fmt(p.revenue)} · ${p.count} đơn</span>
          </div>`).join('') : '<p class="muted">Chưa có đơn hàng nào.</p>'}
      </div>

      <h4 class="admin-section-title">Lịch sử dùng mã giảm giá</h4>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead><tr><th>Mã</th><th>Loại</th><th>Đã dùng</th><th>Giới hạn</th></tr></thead>
          <tbody>
            ${codes.length ? codes.map((d) => `
              <tr><td><b>${esc(d.code)}</b></td><td>${d.type === 'amount' ? 'Giảm ' + fmt(parseInt(d.value, 10) || 0) : 'Giảm ' + (parseFloat(d.value) || 0) + '%'}</td><td>${parseInt(d.usedCount, 10) || 0}</td><td>${(parseInt(d.maxUses, 10) || 0) > 0 ? d.maxUses : 'Không giới hạn'}</td></tr>
            `).join('') : '<tr><td colspan="4">Chưa có mã giảm giá nào được sử dụng.</td></tr>'}
          </tbody>
        </table>
      </div>

      <h4 class="admin-section-title">Đơn hàng gần đây</h4>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead><tr><th>Dịch vụ</th><th>Gói</th><th>Giá</th><th>Thời gian</th></tr></thead>
          <tbody>
            ${recent.length ? recent.map((o) => `
              <tr><td>${esc(o.serviceName)}</td><td>${esc(o.packageName)}</td><td>${fmt(o.price)}</td><td>${new Date(o.date).toLocaleString('vi-VN')}</td></tr>
            `).join('') : '<tr><td colspan="4">Chưa có đơn hàng nào.</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  }

  function adminServicesHtml() {
    const services = Store.db.services;
    const categories = Store.db.categories;
    const editing = adminServiceEditing;
    const editTarget = editing && editing !== 'new' ? services.find((s) => s.id === editing) : null;
    let formHtml = '';
    if (editing) {var _categories$;
      const s = editTarget || { id: '', name: '', categoryId: ((_categories$ = categories[0]) === null || _categories$ === void 0 ? void 0 : _categories$.id) || '', subcategoryId: '', description: '', image: '', status: 'instock', features: [], packages: [{ name: '1 Ngày', price: 0 }] };
      const subsForCat = (Store.db.subcategories || []).filter((sc) => sc.categoryId === s.categoryId);
      formHtml = `
        <form class="admin-form" data-admin-form="service">
          <input type="hidden" name="_originalId" value="${esc(s.id)}">
          <label>Mã sản phẩm (tự động) <input class="auto-id" value="#${editTarget ? esc(s.id) : nextSeqId(services)}" readonly tabindex="-1"></label>
          <label>Danh mục
            <select name="categoryId" id="adminServiceCategory">${categories.map((c) => `<option value="${esc(c.id)}" ${c.id === s.categoryId ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select>
          </label>
          <label>Thư mục con (tùy chọn)
            <select name="subcategoryId" id="adminServiceSubcat">
              <option value="">— Không thuộc thư mục con —</option>
              ${subsForCat.map((sc) => `<option value="${esc(sc.id)}" ${sc.id === s.subcategoryId ? 'selected' : ''}>${esc(sc.name)}</option>`).join('')}
            </select>
          </label>
          <label class="span-2">Tên dịch vụ <input name="name" value="${esc(s.name)}" required></label>
          <label class="span-2">Mô tả <textarea name="description">${esc(s.description)}</textarea></label>
          <label class="span-2">URL ảnh hoặc video (.mp4/.webm/.ogg) <input name="image" value="${esc(s.image)}" placeholder="Lấy từ tab Thư viện"></label>
          <label class="span-2">Link tải / file tải bản game (khách xem trong đơn hàng)
            <input name="downloadUrl" id="adminServiceDownload" value="${esc(s.downloadUrl || '')}" placeholder="Dán link (Drive/MediaFire/link trực tiếp) hoặc bấm Tải file lên">
          </label>
          <label class="span-2 download-upload-row">
            <input type="file" id="adminServiceFile">
            <button type="button" class="btn btn-glass btn-sm" id="adminServiceUploadBtn">Tải file lên máy chủ</button>
            <span class="muted" style="font-size:.75rem;">File tải lên sẽ tự điền vào ô link ở trên.</span>
          </label>
          <label>Trạng thái
            <select name="status">
              <option value="instock" ${s.status === 'instock' ? 'selected' : ''}>Còn hàng</option>
              <option value="outofstock" ${s.status === 'outofstock' ? 'selected' : ''}>Hết hàng</option>
            </select>
          </label>
          <label>Nền tảng (tách riêng ngoài danh sách)
            <select name="platform">
              <option value="" ${!s.platform ? 'selected' : ''}>— Không tách —</option>
              ${PLATFORMS.map((pl) => `<option value="${pl.key}" ${s.platform === pl.key ? 'selected' : ''}>${pl.label}</option>`).join('')}
            </select>
          </label>
          <label class="span-2">Tính năng (mỗi dòng một mục) <textarea name="features">${esc((s.features || []).join('\n'))}</textarea></label>
          <div class="admin-pkg-rows" id="adminPkgRows">
            ${(s.packages || []).map((p) => adminPkgRowHtml(p)).join('')}
          </div>
          <div class="admin-form-actions">
            <button type="button" class="btn btn-glass btn-sm" id="adminAddPkgRow">+ Thêm gói</button>
            <button type="submit" class="btn btn-primary btn-sm">Lưu dịch vụ</button>
            <button type="button" class="btn btn-ghost btn-sm" data-admin-cancel-service>Hủy</button>
          </div>
        </form>
      `;
    }
    return `
      <div class="admin-toolbar">
        <button class="btn btn-primary btn-sm" data-admin-new-service>+ Thêm dịch vụ</button>
      </div>
      ${formHtml}
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead><tr><th>Tên</th><th>Danh mục › Thư mục con</th><th>Giá từ</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
          <tbody>
            ${services.map((s) => {var _categories$find, _find2;
      const catName = ((_categories$find = categories.find((c) => c.id === s.categoryId)) === null || _categories$find === void 0 ? void 0 : _categories$find.name) || s.categoryId;
      const subName = s.subcategoryId ? ((_find2 = (Store.db.subcategories || []).find((x) => x.id === s.subcategoryId)) === null || _find2 === void 0 ? void 0 : _find2.name) || '' : '';
      return `
              <tr>
                <td>${esc(s.name)}</td>
                <td>${esc(catName)}${subName ? ' › ' + esc(subName) : ''}</td>
                <td>${fmt(Math.min(...(s.packages || [{ price: 0 }]).map((p) => p.price)))}</td>
                <td>${s.status === 'instock' ? 'Còn hàng' : 'Hết hàng'}</td>
                <td class="admin-row-actions">
                  <button data-admin-edit-service="${esc(s.id)}">Sửa</button>
                  <button class="danger" data-admin-delete-service="${esc(s.id)}">Xóa</button>
                </td>
              </tr>`;
    }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function adminPkgRowHtml(p) {
    const keys = p.keys || [];
    // Khi mới tải trang, client CHỈ có keyCount từ máy chủ (danh sách key thật chưa tải về
    // để bảo mật). Hiển thị keyCount để admin thấy ĐÚNG số lượng kho — tránh tưởng nhầm là
    // mất key sau khi khôi phục/cập nhật. Muốn xem/sửa từng key thì bấm "Tải kho key đầy đủ".
    const keysLoaded = Array.isArray(p.keys);
    const stockCount = keysLoaded ? keys.length : typeof p.keyCount === 'number' ? p.keyCount : 0;
    const needLoad = !keysLoaded && stockCount > 0;
    return `
      <div class="admin-pkg-row" data-pkg-id="${esc(p.id || '')}">
        <div class="admin-pkg-row-main">
          <input placeholder="Tên gói (VD: 7 Ngày)" data-pkg-name value="${esc(p.name)}">
          <input type="number" min="0" step="1000" placeholder="Giá (đ)" data-pkg-price value="${p.price}">
          <button type="button" class="btn btn-glass btn-sm" data-pkg-keys-toggle>Kho key (<span data-pkg-key-count>${stockCount}</span>)</button>
          <button type="button" class="btn btn-ghost btn-sm" data-remove-pkg-row>${ico('close')}</button>
        </div>
        <div class="admin-pkg-keys-panel" data-pkg-keys-panel hidden>
          <p class="muted" style="font-size:.75rem;margin:0 0 6px;">Mỗi dòng là 1 key. Khi khách mua gói này, hệ thống tự rút đúng 1 key ở đây và xóa khỏi kho.</p>
          ${needLoad ? `<p class="muted" style="font-size:.75rem;margin:0 0 6px;color:var(--gold-soft);">Có <b>${stockCount}</b> key trên máy chủ. Bấm <b>"Tải kho key đầy đủ"</b> ở đầu trang Dịch vụ để xem/sửa từng key. Không tải mà lưu vẫn <b>giữ nguyên</b> kho key trên máy chủ.</p>` : ''}
          <ul class="admin-pkg-key-list" data-pkg-key-list>${pkgKeyListItems(keys)}</ul>
          <textarea class="pkg-keys-input" data-pkg-keys-input placeholder="Dán nhiều key, mỗi dòng 1 key rồi bấm Thêm key"></textarea>
          <div class="admin-pkg-keys-actions">
            <button type="button" class="btn btn-glass btn-sm" data-add-pkg-keys>+ Thêm key</button>
            <button type="button" class="btn btn-ghost btn-sm danger" data-clear-pkg-keys>Xóa hết key</button>
          </div>
        </div>
        <textarea data-pkg-keys-data hidden>${esc(keys.join('\n'))}</textarea>
      </div>
    `;
  }

  function pkgKeyListItems(keys) {
    return keys.length ?
    keys.map((k, i) => `<li><span>${esc(k)}</span><button type="button" data-remove-pkg-key="${i}" title="Xóa key này">${ico('close')}</button></li>`).join('') :
    '<li class="empty-note">Chưa có key nào trong kho.</li>';
  }

  function refreshPkgKeyList(row, keys) {
    row.querySelector('[data-pkg-key-count]').textContent = keys.length;
    row.querySelector('[data-pkg-key-list]').innerHTML = pkgKeyListItems(keys);
  }

  // Bộ chọn icon SVG cho Danh mục / Thư mục con (không dùng emoji "icon máy").
  function iconPickerHtml(selectedKey, hiddenName) {
    const sel = selectedKey && ICONS[selectedKey] ? selectedKey : 'folder';
    return `
      <div class="icon-picker" data-icon-picker>
        <input type="hidden" name="${hiddenName}" value="${esc(sel)}">
        ${PICKER_ICON_KEYS.map((k) => `
          <button type="button" class="icon-pick ${k === sel ? 'selected' : ''}" data-icon-pick="${k}" title="${k}" aria-label="${k}">${ICONS[k]}</button>
        `).join('')}
      </div>`;
  }

  // Hai nhóm hiệu ứng logo TÁCH BIỆT hoàn toàn: MÀU CHẠY và CHUYỂN ĐỘNG (kết hợp được).
  const LOGO_COLOR_FX = [
  ['solid', 'Mặc định'], ['rainbow', 'Cầu vồng'], ['shine', 'Ánh kim'], ['gradient', 'Gradient'],
  ['glow', 'Phát sáng'], ['sparkle', 'Lung linh'], ['neon', 'Neon'],
  ['fire', 'Lửa'], ['ice', 'Băng giá'], ['ocean', 'Đại dương'], ['sunset', 'Hoàng hôn'],
  ['candy', 'Kẹo ngọt'], ['gold', 'Vàng kim'], ['aurora', 'Cực quang'], ['matrix', 'Ma trận']];

  const LOGO_MOTION_FX = [
  ['none', 'Không'], ['pulse', 'Nhịp đập'], ['bounce', 'Nảy'], ['wave', 'Lắc lư'], ['flip', 'Lật 3D']];

  const LOGO_COLOR_MODES = LOGO_COLOR_FX.map(([v]) => v).filter((v) => v !== 'solid');
  const LOGO_MOTION_MODES = LOGO_MOTION_FX.map(([v]) => v).filter((v) => v !== 'none');
  // Tên keyframe + kiểu chạy cho từng hiệu ứng (để gộp animation inline khi kết hợp màu + chuyển động).
  const LOGO_COLOR_ANIM = {
    rainbow: ['logoRainbowCycle', 'linear'], shine: ['logoShineSweep', 'linear'], gradient: ['logoGradientMove', 'linear'],
    glow: ['logoGlow', 'ease-in-out'], sparkle: ['logoSparkle', 'ease-in-out'], neon: ['logoNeon', 'ease-in-out'],
    fire: ['logoGradientMove', 'linear'], ice: ['logoGradientMove', 'linear'], ocean: ['logoGradientMove', 'linear'],
    sunset: ['logoGradientMove', 'linear'], candy: ['logoGradientMove', 'linear'], gold: ['logoGradientMove', 'linear'],
    aurora: ['logoGradientMove', 'linear'], matrix: ['logoMatrix', 'ease-in-out']
  };
  const LOGO_MOTION_ANIM = {
    pulse: ['logoPulse', 'ease-in-out'], bounce: ['logoBounce', 'ease-in-out'],
    wave: ['logoWave', 'ease-in-out'], flip: ['logoFlip', 'ease-in-out']
  };

  // Bộ chọn hiệu ứng: mỗi ô xem trước ngay trên chữ "Kenios" (không icon máy/emoji).
  // prefix = 'logo-color' hoặc 'logo-motion'; noneKey = giá trị "tắt" ('solid' hoặc 'none').
  function fxPickerHtml(list, hiddenName, selected, prefix, noneKey) {
    const sel = selected || list[0][0];
    return `
      <div class="fx-picker" data-fx-picker>
        <input type="hidden" name="${hiddenName}" value="${esc(sel)}">
        ${list.map(([v, label]) => `
          <button type="button" class="fx-pick ${v === sel ? 'selected' : ''}" data-fx-pick="${v}" title="${esc(label)}">
            <span class="fx-pick-demo ${v === noneKey ? '' : prefix + '-' + v}">Kenios</span>
            <span class="fx-pick-label">${esc(label)}</span>
          </button>
        `).join('')}
      </div>`;
  }

  // Bộ chọn FONT chữ logo — mỗi ô hiển thị chữ "Kenios" bằng đúng font đó để xem trước.
  function fontPickerHtml(selected) {
    const sel = selected || 'Be Vietnam Pro';
    LOGO_FONTS.forEach(ensureFontLoaded); // nạp trước để xem trước đúng font
    return `
      <div class="fx-picker font-picker" data-fx-picker>
        <input type="hidden" name="logoFont" value="${esc(sel)}">
        ${LOGO_FONTS.map((f) => `
          <button type="button" class="fx-pick ${f === sel ? 'selected' : ''}" data-fx-pick="${esc(f)}" title="${esc(f)}">
            <span class="fx-pick-demo" style="font-family:'${esc(f)}', sans-serif; font-size:1.05rem">Kenios</span>
            <span class="fx-pick-label">${esc(f)}</span>
          </button>
        `).join('')}
      </div>`;
  }

  function adminCategoriesHtml() {
    const categories = Store.db.categories;
    const subcategories = Store.db.subcategories || [];

    // ----- Form Danh mục -----
    const cEditing = adminCategoryEditing;
    const cEditTarget = cEditing && cEditing !== 'new' ? categories.find((c) => c.id === cEditing) : null;
    let catForm = '';
    if (cEditing) {
      const c = cEditTarget || { id: '', name: '', icon: 'folder', description: '', image: '' };
      catForm = `
        <form class="admin-form" data-admin-form="category">
          <label>Mã danh mục (tự động) <input class="auto-id" value="#${cEditTarget ? esc(c.id) : nextSeqId(categories)}" readonly tabindex="-1"></label>
          <label class="span-2">Tên danh mục <input name="name" value="${esc(c.name)}" required></label>
          <label class="span-2">Chọn icon danh mục ${iconPickerHtml(c.icon, 'icon')}</label>
          <label class="span-2">Mô tả <input name="description" value="${esc(c.description || '')}"></label>
          <label class="span-2">URL ảnh hoặc video (.mp4/.webm/.ogg) <input name="image" value="${esc(c.image || '')}" placeholder="Lấy từ tab Thư viện"></label>
          <div class="admin-form-actions">
            <button type="submit" class="btn btn-primary btn-sm">Lưu danh mục</button>
            <button type="button" class="btn btn-ghost btn-sm" data-admin-cancel-category>Hủy</button>
          </div>
        </form>`;
    }

    // ----- Form Thư mục con -----
    const sEditing = adminSubcategoryEditing;
    const sEditTarget = sEditing && sEditing !== 'new' ? subcategories.find((s) => s.id === sEditing) : null;
    let subForm = '';
    if (sEditing) {var _categories$2;
      const s = sEditTarget || { id: '', categoryId: ((_categories$2 = categories[0]) === null || _categories$2 === void 0 ? void 0 : _categories$2.id) || '', name: '', icon: 'folder', description: '', image: '' };
      subForm = `
        <form class="admin-form" data-admin-form="subcategory">
          <label>Mã thư mục con (tự động) <input class="auto-id" value="#${sEditTarget ? esc(s.id) : nextSeqId(subcategories)}" readonly tabindex="-1"></label>
          <label>Thuộc danh mục
            <select name="categoryId" required>${categories.map((c) => `<option value="${esc(c.id)}" ${c.id === s.categoryId ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select>
          </label>
          <label class="span-2">Tên thư mục con (VD: PUBG IOS) <input name="name" value="${esc(s.name)}" required></label>
          <label class="span-2">Chọn icon thư mục con ${iconPickerHtml(s.icon, 'icon')}</label>
          <label class="span-2">Mô tả <input name="description" value="${esc(s.description || '')}"></label>
          <label class="span-2">URL ảnh hoặc video (.mp4/.webm/.ogg) <input name="image" value="${esc(s.image || '')}" placeholder="Lấy từ tab Thư viện"></label>
          <div class="admin-form-actions">
            <button type="submit" class="btn btn-primary btn-sm">Lưu thư mục con</button>
            <button type="button" class="btn btn-ghost btn-sm" data-admin-cancel-subcategory>Hủy</button>
          </div>
        </form>`;
    }

    return `
      <div class="admin-toolbar">
        <button class="btn btn-primary btn-sm" data-admin-new-category>+ Thêm danh mục</button>
      </div>
      ${catForm}
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead><tr><th>Icon</th><th>Tên</th><th>Thư mục con</th><th>Mô tả</th><th>Thao tác</th></tr></thead>
          <tbody>
            ${categories.map((c) => `
              <tr>
                <td><span class="admin-cell-ico">${catIcon(c.icon)}</span></td>
                <td>${esc(c.name)}</td>
                <td>${subcategories.filter((s) => s.categoryId === c.id).length}</td>
                <td>${esc(c.description || '')}</td>
                <td class="admin-row-actions">
                  <button data-admin-edit-category="${esc(c.id)}">Sửa</button>
                  <button class="danger" data-admin-delete-category="${esc(c.id)}">Xóa</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="admin-form-section" style="margin-top:24px;">Thư mục con (Danh mục → Thư mục con → Sản phẩm)</div>
      <div class="admin-toolbar">
        <button class="btn btn-primary btn-sm" data-admin-new-subcategory>+ Thêm thư mục con</button>
      </div>
      ${subForm}
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead><tr><th>Icon</th><th>Tên thư mục con</th><th>Thuộc danh mục</th><th>Số sản phẩm</th><th>Thao tác</th></tr></thead>
          <tbody>
            ${subcategories.length ? subcategories.map((s) => {var _categories$find2;return `
              <tr>
                <td><span class="admin-cell-ico">${catIcon(s.icon)}</span></td>
                <td>${esc(s.name)}</td>
                <td>${esc(((_categories$find2 = categories.find((c) => c.id === s.categoryId)) === null || _categories$find2 === void 0 ? void 0 : _categories$find2.name) || s.categoryId)}</td>
                <td>${Store.db.services.filter((x) => x.subcategoryId === s.id).length}</td>
                <td class="admin-row-actions">
                  <button data-admin-edit-subcategory="${esc(s.id)}">Sửa</button>
                  <button class="danger" data-admin-delete-subcategory="${esc(s.id)}">Xóa</button>
                </td>
              </tr>
            `;}).join('') : '<tr><td colspan="5" class="empty-note">Chưa có thư mục con. VD: danh mục PUBG → thư mục con "PUBG IOS".</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  }

  function adminOrdersHtml() {
    const orders = Store.db.orders;
    return `
      ${adminTableToolsHtml('orders', 'Tìm mã đơn, khách, dịch vụ, gói, key...')}
      <div class="admin-table-wrap">
        <table class="admin-table" data-admin-table="orders">
          <thead><tr><th>Mã đơn</th><th>Người dùng</th><th>Dịch vụ</th><th>Gói</th><th>Giá</th><th>Key</th><th>Thời gian</th><th>Thao tác</th></tr></thead>
          <tbody>
            ${orders.length ? orders.map((o) => {
      const user = Store.db.users.find((u) => u.userId === o.userId);
      const refundable = (o.price || 0) > 0 && !o.refunded;
      return `<tr data-admin-row>
                <td>${esc(o.id)}</td><td>${esc((user === null || user === void 0 ? void 0 : user.username) || o.userId)}</td><td>${esc(o.serviceName)}</td>
                <td>${esc(o.packageName)}</td><td>${fmt(o.price)}</td><td>${esc(o.key)}</td>
                <td>${new Date(o.date).toLocaleString('vi-VN')}</td>
                <td class="admin-row-actions">${refundable ?
      `<button data-refund-order="${esc(o.id)}" title="Hoàn tiền đơn này vào số dư khách">${ico('undo')} Hoàn tiền</button>` :
      o.refunded ? '<span class="muted" style="font-size:.75rem;">Đã hoàn</span>' : '—'}</td>
              </tr>`;
    }).join('') : '<tr><td colspan="8">Chưa có đơn hàng nào.</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  }

  // Thanh công cụ (ô tìm kiếm + nút xuất CSV) dùng chung cho bảng Đơn hàng / Người dùng.
  function adminTableToolsHtml(kind, placeholder) {
    return `
      <div class="admin-table-tools">
        <input type="search" class="admin-tbl-search" data-admin-search="${kind}" placeholder="${esc(placeholder)}" autocomplete="off">
        <span class="admin-tbl-count" data-admin-count="${kind}"></span>
        <button type="button" class="btn btn-glass btn-sm" data-admin-export="${kind}">${ico('download')} Xuất CSV</button>
      </div>`;
  }

  // Lọc các dòng bảng theo từ khoá (khớp nội dung hiển thị) + cập nhật bộ đếm.
  function wireAdminTableTools(kind) {var _$35;
    const search = $(`[data-admin-search="${kind}"]`);
    const table = $(`[data-admin-table="${kind}"]`);
    const countEl = $(`[data-admin-count="${kind}"]`);
    if (!table) return;
    const rows = $$('tbody tr[data-admin-row]', table);
    const applyFilter = () => {
      const term = ((search === null || search === void 0 ? void 0 : search.value) || '').trim().toLowerCase();
      let shown = 0;
      rows.forEach((tr) => {
        const match = !term || tr.textContent.toLowerCase().includes(term);
        tr.hidden = !match;
        if (match) shown++;
      });
      if (countEl) countEl.textContent = term ? `${shown}/${rows.length} dòng` : `${rows.length} dòng`;
    };
    search === null || search === void 0 || search.addEventListener('input', applyFilter);
    applyFilter();
    (_$35 = $(`[data-admin-export="${kind}"]`)) === null || _$35 === void 0 || _$35.addEventListener('click', () => exportAdminCsv(kind, ((search === null || search === void 0 ? void 0 : search.value) || '').trim().toLowerCase()));
  }

  // Xuất CSV (kèm BOM để Excel đọc đúng tiếng Việt). Tôn trọng từ khoá đang lọc.
  function downloadCsv(filename, headers, rows) {
    const cell = (v) => {const s = String(v == null ? '' : v);return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;};
    const lines = [headers.map(cell).join(',')].concat(rows.map((r) => r.map(cell).join(',')));
    const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;a.download = filename;
    document.body.appendChild(a);a.click();a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function exportAdminCsv(kind, term) {
    const stamp = new Date().toISOString().slice(0, 10);
    const hit = (txt) => !term || String(txt).toLowerCase().includes(term);
    if (kind === 'orders') {
      const rows = (Store.db.orders || []).map((o) => {
        const user = Store.db.users.find((u) => u.userId === o.userId);
        return [o.id, (user === null || user === void 0 ? void 0 : user.username) || o.userId, o.serviceName, o.packageName, o.price || 0,
        o.key, o.date ? new Date(o.date).toLocaleString('vi-VN') : '', o.refunded ? 'Đã hoàn' : ''];
      }).filter((r) => hit(r.join(' ')));
      downloadCsv(`kenios-donhang-${stamp}.csv`,
      ['Mã đơn', 'Người dùng', 'Dịch vụ', 'Gói', 'Giá', 'Key', 'Thời gian', 'Hoàn tiền'], rows);
      toast(`Đã xuất ${rows.length} đơn hàng ra CSV.`, 'success');
    } else if (kind === 'users') {
      const rows = (Store.db.users || []).map((u) => [
      u.username, u.userId, u.role === 'admin' ? 'Admin' : u.role === 'ctv' ? 'Cộng tác viên' : 'Thành viên',
      u.balance || 0, u.status === 'banned' ? 'Đã khóa' : 'Hoạt động', u.createdAt || '']
      ).filter((r) => hit(r.join(' ')));
      downloadCsv(`kenios-nguoidung-${stamp}.csv`,
      ['Tên đăng nhập', 'Mã KH', 'Vai trò', 'Số dư', 'Trạng thái', 'Ngày tạo'], rows);
      toast(`Đã xuất ${rows.length} người dùng ra CSV.`, 'success');
    }
  }

  // ---- Báo cáo doanh thu theo khoảng thời gian ----
  const _ymd = (d) => d.toISOString().slice(0, 10);
  function adminReportHtml() {
    const today = new Date();
    const from = _ymd(new Date(today.getTime() - 29 * 86400000));
    const to = _ymd(today);
    return `
      <div class="report-toolbar">
        <div class="report-dates">
          <label>Từ ngày <input type="date" id="reportFrom" value="${from}"></label>
          <label>Đến ngày <input type="date" id="reportTo" value="${to}"></label>
        </div>
        <div class="report-quicks">
          <button type="button" class="btn btn-glass btn-sm" data-report-quick="7">7 ngày</button>
          <button type="button" class="btn btn-glass btn-sm" data-report-quick="30">30 ngày</button>
          <button type="button" class="btn btn-glass btn-sm" data-report-quick="month">Tháng này</button>
        </div>
        <div class="report-actions">
          <button type="button" class="btn btn-primary btn-sm" id="reportApplyBtn">Xem báo cáo</button>
          <button type="button" class="btn btn-glass btn-sm" id="reportExportBtn">${ico('download')} Xuất CSV</button>
        </div>
      </div>
      <div id="reportBody"></div>`;
  }
  // Tính báo cáo từ đơn hàng trong khoảng [from, to] (bỏ đơn đã hoàn tiền).
  function computeReport(from, to) {
    const start = new Date(from + 'T00:00:00');
    const end = new Date(to + 'T23:59:59');
    const orders = (Store.db.orders || []).filter((o) => {
      const d = new Date(o.date || o.purchaseDate || 0);
      return d >= start && d <= end && !o.refunded;
    });
    const revenue = orders.reduce((s, o) => s + (parseFloat(o.price) || 0), 0);
    const byUser = {},byService = {};
    orders.forEach((o) => {
      const uname = (Store.db.users.find((u) => u.userId === o.userId) || {}).username || o.userId;
      byUser[uname] = (byUser[uname] || 0) + (parseFloat(o.price) || 0);
      const sn = o.serviceName || '(không tên)';
      if (!byService[sn]) byService[sn] = { revenue: 0, count: 0 };
      byService[sn].revenue += parseFloat(o.price) || 0;
      byService[sn].count += 1;
    });
    return {
      revenue, count: orders.length, avg: orders.length ? revenue / orders.length : 0,
      topUsers: Object.entries(byUser).sort((a, b) => b[1] - a[1]).slice(0, 10),
      topServices: Object.entries(byService).sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 10)
    };
  }
  function renderReportBody(from, to) {
    const box = $('#reportBody');
    if (!box) return;
    const r = computeReport(from, to);
    const tiles = [
    { label: 'Doanh thu', value: fmt(r.revenue) },
    { label: 'Số đơn', value: r.count },
    { label: 'TB/đơn', value: fmt(Math.round(r.avg)) }];

    box.innerHTML = `
      <div class="report-tiles">
        ${tiles.map((t) => `<div class="report-tile"><strong>${t.value}</strong><span>${t.label}</span></div>`).join('')}
      </div>
      <div class="report-cols">
        <div class="report-col">
          <h4>${ico('trophy')} Khách mua nhiều nhất</h4>
          ${r.topUsers.length ? `<table class="admin-table"><tbody>
            ${r.topUsers.map(([n, v], i) => `<tr><td>${i + 1}. ${esc(n)}</td><td style="text-align:right">${fmt(v)}</td></tr>`).join('')}
          </tbody></table>` : '<p class="muted">Chưa có đơn nào trong khoảng này.</p>'}
        </div>
        <div class="report-col">
          <h4>${ico('fire')} Sản phẩm bán chạy</h4>
          ${r.topServices.length ? `<table class="admin-table"><tbody>
            ${r.topServices.map(([n, o], i) => `<tr><td>${i + 1}. ${esc(n)}</td><td style="text-align:right">${fmt(o.revenue)} <small class="muted">(${o.count} đơn)</small></td></tr>`).join('')}
          </tbody></table>` : '<p class="muted">—</p>'}
        </div>
      </div>`;
  }
  function wireAdminReport() {var _$36, _$37;
    const apply = () => renderReportBody($('#reportFrom').value, $('#reportTo').value);
    (_$36 = $('#reportApplyBtn')) === null || _$36 === void 0 || _$36.addEventListener('click', apply);
    $$('[data-report-quick]').forEach((b) => b.addEventListener('click', () => {
      const q = b.dataset.reportQuick;
      const today = new Date();
      let from;
      if (q === 'month') from = new Date(today.getFullYear(), today.getMonth(), 1);else
      from = new Date(today.getTime() - (parseInt(q, 10) - 1) * 86400000);
      $('#reportFrom').value = _ymd(from);
      $('#reportTo').value = _ymd(today);
      apply();
    }));
    (_$37 = $('#reportExportBtn')) === null || _$37 === void 0 || _$37.addEventListener('click', () => {
      const from = $('#reportFrom').value,to = $('#reportTo').value;
      const start = new Date(from + 'T00:00:00'),end = new Date(to + 'T23:59:59');
      const rows = (Store.db.orders || []).filter((o) => {
        const d = new Date(o.date || o.purchaseDate || 0);
        return d >= start && d <= end && !o.refunded;
      }).map((o) => {
        const u = Store.db.users.find((x) => x.userId === o.userId);
        return [o.id, (u === null || u === void 0 ? void 0 : u.username) || o.userId, o.serviceName, o.packageName, o.price || 0,
        o.date ? new Date(o.date).toLocaleString('vi-VN') : ''];
      });
      downloadCsv(`kenios-baocao-${from}_${to}.csv`,
      ['Mã đơn', 'Người dùng', 'Dịch vụ', 'Gói', 'Giá', 'Thời gian'], rows);
      toast(`Đã xuất ${rows.length} đơn (${from} → ${to}) ra CSV.`, 'success');
    });
    apply();
  }

  function adminUsersHtml() {
    const users = Store.db.users;
    return `
      ${adminTableToolsHtml('users', 'Tìm tên đăng nhập, mã KH...')}
      <div class="admin-table-wrap">
        <table class="admin-table" data-admin-table="users">
          <thead><tr><th>Tên đăng nhập</th><th>Vai trò</th><th>Số dư</th><th>Trạng thái</th><th>Ngày tạo</th><th>Thao tác</th></tr></thead>
          <tbody>
            ${users.map((u) => `
              <tr data-admin-row>
                <td>${esc(u.username)}</td>
                <td>
                  <select class="user-role-select" data-admin-set-role="${esc(u.userId)}" title="Đổi vai trò">
                    <option value="member" ${u.role !== 'admin' && u.role !== 'ctv' ? 'selected' : ''}>Thành viên</option>
                    <option value="ctv" ${u.role === 'ctv' ? 'selected' : ''}>Cộng tác viên</option>
                    <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Admin</option>
                  </select>
                </td>
                <td>${fmt(u.balance || 0)}</td>
                <td>${u.status === 'banned' ? 'Đã khóa' : 'Hoạt động'}</td>
                <td>${esc(u.createdAt || '')}</td>
                <td class="admin-row-actions">
                  <div class="user-bal-adjust">
                    <input type="number" min="0" step="1000" class="user-adjust-amount" data-adjust-amount="${esc(u.userId)}" placeholder="Số tiền (đ)">
                    <button data-admin-add-balance="${esc(u.userId)}" title="Cộng tiền vào tài khoản">+ Cộng</button>
                    <button data-admin-sub-balance="${esc(u.userId)}" title="Trừ tiền khỏi tài khoản">− Trừ</button>
                  </div>
                  ${u.role !== 'admin' ? `<button class="danger" data-admin-toggle-status="${esc(u.userId)}" data-status="${u.status === 'banned' ? 'active' : 'banned'}">${u.status === 'banned' ? 'Mở khóa' : 'Khóa'}</button>` : ''}
                  ${u.role !== 'admin' ? `<button class="danger" data-admin-delete-user="${esc(u.userId)}" title="Xóa tài khoản này">Xóa</button>` : ''}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // 1 dòng cấu hình kênh liên hệ / nhóm trong admin (thêm/xoá động).
  function contactChannelRowHtml(ch = {}) {
    const t = chType(ch);
    return `
      <div class="contact-ch-row" data-ch-row>
        <label class="contact-ch-on" title="Bật hiển thị"><input type="checkbox" data-ch-enabled ${ch.enabled ? 'checked' : ''}></label>
        <select data-ch-type class="contact-ch-type">
          ${CONTACT_PLATFORMS.map(([v, label]) => `<option value="${v}" ${v === t ? 'selected' : ''}>${label}</option>`).join('')}
        </select>
        <input data-ch-label class="contact-ch-label" value="${esc(ch.label || '')}" placeholder="Tên hiển thị (VD: Nhóm Zalo VIP)">
        <input data-ch-url class="contact-ch-url" value="${esc(ch.url || '')}" placeholder="https://zalo.me/g/... , https://t.me/... , tel:..., mailto:...">
        <button type="button" class="contact-ch-del" data-ch-remove title="Xoá dòng này">${ico('close')}</button>
      </div>`;
  }

  // 1 dòng câu trả lời sẵn của AI (từ khoá + câu trả lời) trong admin.
  function aiKnowledgeRowHtml(item = {}) {
    return `
      <div class="ai-kb-row" data-kb-row>
        <input data-kb-k class="ai-kb-k" value="${esc(item.k || '')}" placeholder="Từ khoá (VD: nạp tiền, nap tien, vietqr)">
        <textarea data-kb-a class="ai-kb-a" placeholder="Câu trả lời khách sẽ nhận">${esc(item.a || '')}</textarea>
        <button type="button" class="ai-kb-del" data-kb-remove title="Xoá câu này">${ico('close')}</button>
      </div>`;
  }
  function readAiKnowledgeFromEditor() {
    return $$('#aiKnowledgeEditor [data-kb-row]').map((row) => ({
      k: row.querySelector('[data-kb-k]').value.trim(),
      a: row.querySelector('[data-kb-a]').value.trim()
    })).filter((x) => x.k && x.a);
  }

  // Đọc lại toàn bộ kênh liên hệ / nhóm từ trình soạn thảo động khi lưu cấu hình.
  function readContactChannelsFromEditor() {
    return $$('#contactChannelsEditor [data-ch-row]').map((row, i) => {
      const type = row.querySelector('[data-ch-type]').value;
      const label = row.querySelector('[data-ch-label]').value.trim();
      const url = row.querySelector('[data-ch-url]').value.trim();
      const enabled = row.querySelector('[data-ch-enabled]').checked;
      return { id: `${type}-${i}`, type, label: label || CONTACT_PLATFORM_LABEL[type] || 'Liên hệ', url, enabled };
    });
  }

  // 1 dòng mã giảm giá sản phẩm trong admin: mã + loại giảm + giá trị + điều kiện nâng cao.
  function discountCodeRowHtml(dc = {}) {
    const type = dc.type === 'amount' ? 'amount' : 'percent';
    const used = parseInt(dc.usedCount, 10) || 0;
    const maxUses = parseInt(dc.maxUses, 10) || 0;
    // input date cần định dạng yyyy-MM-dd
    const expDate = dc.expiresAt ? String(dc.expiresAt).slice(0, 10) : '';
    const cats = Store.db.categories || [];
    return `
      <div class="discount-row2" data-dc-row data-dc-used="${used}">
        <div class="discount-line">
          <label class="discount-on" title="Bật mã này"><input type="checkbox" data-dc-enabled ${dc.enabled !== false ? 'checked' : ''}></label>
          <input data-dc-code class="discount-code" value="${esc(dc.code || '')}" placeholder="MÃ (VD: SALE10)" style="text-transform:uppercase">
          <select data-dc-type class="discount-type">
            <option value="percent" ${type === 'percent' ? 'selected' : ''}>Giảm %</option>
            <option value="amount" ${type === 'amount' ? 'selected' : ''}>Giảm tiền (đ)</option>
          </select>
          <input data-dc-value class="discount-value" type="number" min="0" step="any" value="${dc.value != null ? dc.value : ''}" placeholder="VD: 10 hoặc 50000">
          <button type="button" class="discount-del" data-dc-remove title="Xoá mã này">${ico('close')}</button>
        </div>
        <div class="discount-line discount-cond">
          <label class="dc-cond">Lượt tối đa (tổng) <input data-dc-maxuses type="number" min="0" step="1" value="${maxUses || ''}" placeholder="0 = không giới hạn"></label>
          <label class="dc-cond">Số lần / mỗi người <input data-dc-maxperuser type="number" min="0" step="1" value="${parseInt(dc.maxUsesPerUser, 10) || '' }" placeholder="0 = không giới hạn"></label>
          <label class="dc-cond">Số tài khoản được dùng <input data-dc-maxusers type="number" min="0" step="1" value="${parseInt(dc.maxUsers, 10) || '' }" placeholder="0 = không giới hạn (VD: 1 = 1 tài khoản)"></label>
          <label class="dc-cond">Đã dùng <input value="${used}${maxUses ? '/' + maxUses : ''}" readonly tabindex="-1" class="dc-used-view"></label>
          <label class="dc-cond">Hạn dùng <input data-dc-expires type="date" value="${esc(expDate)}"></label>
          <label class="dc-cond">Đơn tối thiểu (đ) <input data-dc-minorder type="number" min="0" step="1000" value="${dc.minOrder ? parseInt(dc.minOrder, 10) : ''}" placeholder="0 = mọi đơn"></label>
          <label class="dc-cond">Chỉ danh mục
            <select data-dc-category>
              <option value="">— Mọi sản phẩm —</option>
              ${cats.map((cat) => `<option value="${esc(cat.id)}" ${dc.categoryId === cat.id ? 'selected' : ''}>${esc(cat.name)}</option>`).join('')}
            </select>
          </label>
        </div>
      </div>`;
  }
  function readDiscountCodesFromEditor() {
    return $$('#discountCodesEditor [data-dc-row]').map((row) => ({
      code: row.querySelector('[data-dc-code]').value.trim().toUpperCase(),
      type: row.querySelector('[data-dc-type]').value === 'amount' ? 'amount' : 'percent',
      value: Math.max(0, parseFloat(row.querySelector('[data-dc-value]').value) || 0),
      enabled: row.querySelector('[data-dc-enabled]').checked,
      maxUses: Math.max(0, parseInt(row.querySelector('[data-dc-maxuses]').value, 10) || 0),
      maxUsesPerUser: Math.max(0, parseInt(row.querySelector('[data-dc-maxperuser]').value, 10) || 0),
      maxUsers: Math.max(0, parseInt(row.querySelector('[data-dc-maxusers]').value, 10) || 0),
      usedCount: parseInt(row.dataset.dcUsed, 10) || 0,
      expiresAt: row.querySelector('[data-dc-expires]').value || '',
      minOrder: Math.max(0, parseInt(row.querySelector('[data-dc-minorder]').value, 10) || 0),
      categoryId: row.querySelector('[data-dc-category]').value || ''
    })).filter((x) => x.code && x.value > 0);
  }

  // 1 dòng hạng VIP trong admin (tên hạng + mốc chi tiêu + % giảm).
  function vipTierRowHtml(t = {}) {
    return `
      <div class="vip-row" data-vip-row>
        <input data-vip-name class="vip-name" value="${esc(t.name || '')}" placeholder="Tên hạng (VD: VIP Bạc)">
        <label class="vip-cond">Chi tiêu từ (đ) <input data-vip-min type="number" min="0" step="1000" value="${t.minSpent ? parseInt(t.minSpent, 10) : ''}" placeholder="VD: 500000"></label>
        <label class="vip-cond">Giảm (%) <input data-vip-pct type="number" min="0" max="100" step="1" value="${t.discountPercent ? parseFloat(t.discountPercent) : ''}" placeholder="VD: 5"></label>
        <button type="button" class="vip-del" data-vip-remove title="Xoá hạng này">${ico('close')}</button>
      </div>`;
  }
  function readVipTiersFromEditor() {
    return $$('#vipTiersEditor [data-vip-row]').map((row) => ({
      name: row.querySelector('[data-vip-name]').value.trim(),
      minSpent: Math.max(0, parseInt(row.querySelector('[data-vip-min]').value, 10) || 0),
      discountPercent: Math.max(0, Math.min(100, parseFloat(row.querySelector('[data-vip-pct]').value) || 0))
    })).filter((x) => x.name && x.discountPercent > 0).
    sort((a, b) => a.minSpent - b.minSpent);
  }

  function adminPromoHtml() {
    const c = Store.db.config;
    const enabled = !!c.depositBonusEnabled;
    const percent = parseFloat(c.depositBonusPercent) || 0;
    const min = parseInt(c.depositBonusMin, 10) || 0;
    // Ví dụ minh hoạ để admin dễ hình dung.
    const sample = min > 0 ? min : 100000;
    const sampleBonus = enabled && percent > 0 ? Math.floor(sample * percent / 100) : 0;
    const fs = c.flashSale || {};
    // datetime-local cần định dạng yyyy-MM-ddTHH:mm (giờ địa phương)
    const fsEndLocal = fs.endsAt ? toLocalDatetimeValue(fs.endsAt) : '';
    return `
      <form class="admin-form" data-admin-form="promo">
        <div class="admin-guide">
          <b>${ico('bulb')} Hướng dẫn nhanh:</b> Trang này gộp 4 công cụ tăng doanh thu — <b>Khuyến mãi nạp tiền</b>,
          <b>Flash Sale</b>, <b>Mã giảm giá</b>, <b>Hạng VIP</b>. Sau khi chỉnh, bấm <b>"Lưu"</b> rồi
          <b>"Đồng bộ lên máy chủ"</b> để áp dụng cho mọi khách. Thứ tự giảm giá khi khách mua:
          <b>Flash Sale → Hạng VIP → Mã giảm giá</b>.
        </div>

        <div class="admin-form-section">1. Khuyến mãi nạp tiền</div>
        <p class="muted" style="grid-column:1/-1;font-size:.82rem;margin:0 0 4px;">
          <b>Hướng dẫn:</b> Khi khách nạp tiền đạt mức tối thiểu, hệ thống tự cộng thêm % khuyến mãi vào số dư. Đặt % = 0 hoặc chọn "Tắt" để ngừng.
        </p>
        <label>Bật khuyến mãi nạp tiền
          <select name="depositBonusEnabled">
            <option value="1" ${enabled ? 'selected' : ''}>Bật</option>
            <option value="0" ${!enabled ? 'selected' : ''}>Tắt</option>
          </select>
        </label>
        <label>Phần trăm khuyến mãi (%)
          <input type="number" name="depositBonusPercent" min="0" max="100" step="1" value="${percent}" placeholder="VD: 10">
        </label>
        <label>Số tiền nạp tối thiểu để nhận khuyến mãi (đ)
          <input type="number" name="depositBonusMin" min="0" step="1000" value="${min}" placeholder="VD: 100000">
        </label>
        <p class="muted" style="grid-column:1/-1;font-size:.82rem;margin:2px 0 0;">
          ${enabled && percent > 0 ?
    `Ví dụ: khách nạp <b>${sample.toLocaleString('vi-VN')}đ</b> sẽ được cộng thêm <b>${sampleBonus.toLocaleString('vi-VN')}đ</b> (${percent}%), tổng nhận <b>${(sample + sampleBonus).toLocaleString('vi-VN')}đ</b>.` :
    'Đang tắt khuyến mãi — khách nạp bao nhiêu nhận đúng bấy nhiêu.'}
        </p>

        <div class="admin-form-section">2. Flash Sale (giảm giá toàn shop có đếm ngược)</div>
        <p class="muted" style="grid-column:1/-1;font-size:.82rem;margin:0 0 4px;">
          <b>Hướng dẫn:</b> Bật Flash Sale để giảm giá <b>toàn bộ sản phẩm</b> theo % trong một khung thời gian. Trang chủ sẽ hiện banner <b>đồng hồ đếm ngược</b>, giá sản phẩm tự gạch ngang giá cũ. Hết giờ (mốc "Kết thúc lúc") thì tự tắt.
        </p>
        <label>Bật Flash Sale
          <select name="flashSaleEnabled">
            <option value="1" ${fs.enabled ? 'selected' : ''}>Bật</option>
            <option value="0" ${!fs.enabled ? 'selected' : ''}>Tắt</option>
          </select>
        </label>
        <label>Giảm giá (%)
          <input type="number" name="flashSalePercent" min="0" max="100" step="1" value="${parseFloat(fs.percent) || 0}" placeholder="VD: 15">
        </label>
        <label>Kết thúc lúc
          <input type="datetime-local" name="flashSaleEndsAt" value="${esc(fsEndLocal)}">
        </label>
        <label>Tiêu đề banner
          <input name="flashSaleTitle" value="${esc(fs.title || 'FLASH SALE')}" placeholder="VD: FLASH SALE CUỐI TUẦN">
        </label>

        <div class="admin-form-section">3. Mã giảm giá sản phẩm (tạo bao nhiêu mã tuỳ ý)</div>
        <div class="admin-guide">
          <b>${ico('bulb')} Hướng dẫn dùng mã giảm giá:</b>
          <ul style="margin:6px 0 0;padding-left:18px;">
            <li><b>Ô tick trái:</b> bật/tắt từng mã.</li>
            <li><b>MÃ:</b> tên mã khách gõ (VD: <code>SALE10</code>). <b>Giảm %</b> hoặc <b>Giảm tiền (đ)</b> + giá trị.</li>
            <li><b>Lượt tối đa (tổng):</b> tổng số lần mã được dùng, chung cho mọi khách (0 = không giới hạn). "Đã dùng" hiển thị số lần đã dùng.</li>
            <li><b>Số lần / mỗi người:</b> mỗi khách được dùng mã bao nhiêu lần (VD: 1 = mỗi người 1 lần; 0 = không giới hạn theo người).</li>
            <li><b>Số tài khoản được dùng:</b> bao nhiêu <b>tài khoản khác nhau</b> được dùng mã (VD: <b>1 = chỉ 1 tài khoản duy nhất</b>, ai dùng trước thì chiếm; 0 = không giới hạn).</li>
            <li><b>Hạn dùng:</b> ngày hết hạn (để trống = không hết hạn).</li>
            <li><b>Đơn tối thiểu:</b> giá đơn phải từ mức này mới áp được mã (0 = mọi đơn).</li>
            <li><b>Chỉ danh mục:</b> giới hạn mã cho 1 danh mục sản phẩm (mặc định mọi sản phẩm).</li>
          </ul>
          Khách nhập mã ở ô "Mã giảm giá" trong từng sản phẩm — hệ thống tự đối chiếu &amp; kiểm tra các điều kiện trên.
        </div>
        <div class="span-2 discount-editor" id="discountCodesEditor">
          ${(c.discountCodes || []).map((dc) => discountCodeRowHtml(dc)).join('')}
        </div>
        <div class="span-2">
          <button type="button" class="btn btn-glass btn-sm" id="addDiscountCodeBtn"><span class="btn-ico">${ICONS.tag || ''}</span> + Thêm mã giảm giá</button>
        </div>

        <div class="admin-form-section">4. Hạng thành viên VIP (tự giảm giá theo tổng chi tiêu)</div>
        <div class="admin-guide">
          <b>${ico('bulb')} Hướng dẫn hạng VIP:</b> Khách mua càng nhiều (tổng tiền đã mua) sẽ tự lên hạng và được <b>giảm giá % mọi đơn</b> mà không cần nhập mã.
          Mỗi hạng gồm: <b>Tên hạng</b>, <b>Chi tiêu từ</b> (tổng tiền đã mua để đạt hạng) và <b>Giảm (%)</b>. Tạo nhiều hạng với mốc chi tiêu tăng dần (VD: 500.000đ → 3%, 2.000.000đ → 5%, 5.000.000đ → 8%).
          Khách sẽ thấy hạng của mình trong menu tài khoản.
        </div>
        <div class="span-2 vip-editor" id="vipTiersEditor">
          ${(c.vipTiers || []).map((t) => vipTierRowHtml(t)).join('')}
        </div>
        <div class="span-2">
          <button type="button" class="btn btn-glass btn-sm" id="addVipTierBtn"><span class="btn-ico">${ICONS.crown || ''}</span> + Thêm hạng VIP</button>
        </div>

        <div class="admin-form-actions">
          <button type="submit" class="btn btn-primary btn-sm">Lưu khuyến mãi</button>
          <button type="button" class="btn btn-glass btn-sm" id="adminSyncServerBtn" style="gap:7px;">
            <span class="btn-ico" data-icon="cloud"></span> Đồng bộ lên máy chủ
          </button>
          <span class="admin-sync-msg" id="adminConfigSyncMsg" style="font-size:.78rem;color:var(--muted);align-self:center;"></span>
        </div>
      </form>
    `;
  }

  function adminConfigHtml() {
    const c = Store.db.config;
    return `
      <form class="admin-form" data-admin-form="config">
        <div class="admin-form-section">Thương hiệu &amp; Logo</div>
        <label>Chữ logo (logoText) <input name="logoText" value="${esc(c.logoText)}"></label>
        <label>Dòng phụ (logoSubtext) <input name="logoSubtext" value="${esc(c.logoSubtext)}"></label>
        <label class="span-2">Ảnh / Video logo (logoUrl — để trống dùng icon mặc định)
          <input name="logoUrl" value="${esc(c.logoUrl || '')}" placeholder="Dán URL ảnh (PNG/GIF/WEBP/SVG) hoặc video (.mp4/.webm/.ogg) — logo sẽ tự phát video">
        </label>
        <label class="span-2">Font chữ logo (bấm chọn — xem trước trực tiếp, có nhiều font đậm/3D)
          ${fontPickerHtml(c.logoFont)}
        </label>
        <label>Màu chữ logo <input type="color" name="logoColor" value="${esc(c.logoColor || '#f3f4f6')}"></label>
        <div class="admin-form-section">Hiệu ứng logo — MÀU CHẠY (tách riêng với chuyển động)</div>
        <label class="span-2">Chọn màu chạy (bấm chọn — xem trước trực tiếp)
          ${fxPickerHtml(LOGO_COLOR_FX, 'logoColorMode', c.logoColorMode, 'logo-color', 'solid')}
        </label>
        <label>Tốc độ màu chạy (giây/vòng)
          <input type="number" name="logoAnimSpeed" min="1" max="20" step="0.5" value="${c.logoAnimSpeed || 6}">
        </label>

        <div class="admin-form-section">Hiệu ứng logo — CHUYỂN ĐỘNG (kết hợp được với màu chạy)</div>
        <label class="span-2">Chọn chuyển động (bấm chọn — xem trước trực tiếp)
          ${fxPickerHtml(LOGO_MOTION_FX, 'logoMotionMode', c.logoMotionMode, 'logo-motion', 'none')}
        </label>
        <label>Tốc độ chuyển động (giây/vòng)
          <input type="number" name="logoMotionSpeed" min="0.5" max="20" step="0.5" value="${c.logoMotionSpeed || 2}">
        </label>

        <label class="admin-check-label"><input type="checkbox" name="showcaseEnabled" ${c.showcaseEnabled === true ? 'checked' : ''}> Hiện mục "Hình ảnh &amp; Video" ở trang chủ (tắt để web nhẹ hơn)</label>

        <div class="admin-form-section">Giới thiệu bạn bè</div>
        <label class="admin-check-label"><input type="checkbox" name="referralEnabled" ${c.referralEnabled !== false ? 'checked' : ''}> Bật chương trình giới thiệu (mỗi người có 1 mã, cả hai nhận thưởng khi người mới nạp lần đầu)</label>
        <label>Tiền thưởng mỗi bên (đồng) <input type="number" name="referralBonus" min="0" step="1000" value="${Number(c.referralBonus) || 0}"></label>

        <div class="admin-form-section">Màu chủ đạo toàn trang</div>
        <label>Màu chủ đạo (nút, giá, điểm nhấn) <input type="color" name="accentColor" value="${esc(c.accentColor || "#22d3ee")}"></label>

        <div class="admin-form-section">Banner / Hero</div>
        <label class="span-2">Nhãn nhỏ trên tiêu đề (bannerTagText) <input name="bannerTagText" value="${esc(c.bannerTagText || '')}"></label>
        <label>Nút 1 (bannerBtn1Text) <input name="bannerBtn1Text" value="${esc(c.bannerBtn1Text || '')}"></label>
        <label>Nút 2 (bannerBtn2Text) <input name="bannerBtn2Text" value="${esc(c.bannerBtn2Text || '')}"></label>
        <label class="span-2">Ảnh/Video nền Hero (bgUrl)
          <input name="bgUrl" value="${esc(c.bgUrl || '')}" placeholder="Dán URL ảnh (PNG/JPEG/GIF/WEBP) hoặc video (.mp4/.webm/.ogg) — lấy từ tab Thư viện">
        </label>
        <label class="span-2">Ảnh/Video nền GIAO DIỆN (siteBgUrl — chạy sau toàn trang)
          <input name="siteBgUrl" value="${esc(c.siteBgUrl || '')}" placeholder="Dán URL ảnh (PNG/JPEG/GIF/WEBP) hoặc video (.mp4/.webm/.ogg) — để trống dùng nền mặc định">
        </label>

        <div class="admin-form-section">Liên hệ &amp; Giới thiệu</div>
        <label class="span-2">Tên website (siteTitle) <input name="siteTitle" value="${esc(c.siteTitle)}"></label>
        <label class="span-2">Mô tả ngắn (siteSubtitle) <textarea name="siteSubtitle">${esc(c.siteSubtitle)}</textarea></label>
        <label>Tên Admin hiển thị (contactAdminName) <input name="contactAdminName" value="${esc(c.contactAdminName || '')}"></label>
        <label>Chức danh (contactAdminSub) <input name="contactAdminSub" value="${esc(c.contactAdminSub || '')}"></label>
        <label class="span-2">Giới thiệu (contactAdminDesc) <textarea name="contactAdminDesc">${esc(c.contactAdminDesc || '')}</textarea></label>
        <label>Hotline <input name="hotline" value="${esc(c.hotline)}"></label>
        <label>Link Zalo <input name="zaloLink" value="${esc(c.zaloLink)}"></label>

        <div class="admin-form-section">Kênh liên hệ &amp; Nhóm mạng xã hội (thêm bao nhiêu tuỳ ý)</div>
        <div class="span-2 contact-ch-editor" id="contactChannelsEditor">
          ${(c.contactChannels || []).map((ch) => contactChannelRowHtml(ch)).join('')}
        </div>
        <div class="span-2">
          <button type="button" class="btn btn-glass btn-sm" id="addContactChannelBtn"><span class="btn-ico">${ICONS.gift || ''}</span> + Thêm kênh / nhóm</button>
        </div>
        <p class="muted" style="grid-column:1/-1;font-size:.78rem;margin:0;">
          Bấm "+ Thêm kênh / nhóm" để tạo bao nhiêu mục tuỳ ý (nhiều nhóm Zalo, Telegram… đều được). Mỗi mục: chọn nền tảng, đặt tên, dán link, tích "Bật". Kênh nào bật + có link sẽ hiện ở phần "Liên Hệ &amp; Cộng Đồng" và nút liên hệ (từ 2 kênh trở lên tự gộp thành 1 nút danh sách).
        </p>

        <div class="admin-form-section">Đăng nhập bằng Google</div>
        <label class="span-2">Google Client ID
          <input name="googleClientId" value="${esc(c.googleClientId || '')}" placeholder="xxxxxxxx.apps.googleusercontent.com">
        </label>
        <p class="muted" style="grid-column:1/-1;font-size:.78rem;margin:0;">
          Lấy Client ID miễn phí tại
          <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener" style="color:var(--gold-soft);">Google Cloud Console</a>
          (tạo OAuth Client ID loại "Web application", thêm domain của bạn vào "Authorized JavaScript origins").
          Để trống thì nút đăng nhập Google sẽ ẩn.
        </p>

        <div class="admin-form-section">Ngân hàng (VietQR) &amp; Giao dịch tự động</div>
        <label>Ngân hàng
          <select name="bankId">
            ${BANK_OPTIONS.concat(BANK_OPTIONS.includes(c.bankId) ? [] : [c.bankId]).filter(Boolean).map((b) => `<option value="${esc(b)}" ${c.bankId === b ? 'selected' : ''}>${esc(b)}</option>`).join('')}
          </select>
        </label>
        <label>Số tài khoản <input name="bankAccountNo" value="${esc(c.bankAccountNo)}"></label>
        <label class="span-2">Tên chủ tài khoản <input name="bankAccountName" value="${esc(c.bankAccountName)}"></label>

        <div class="secret-box span-2" id="bankWebhookBox">
          <div class="secret-status" id="bankTokenStatus">Đang kiểm tra trạng thái…</div>
          <label>Webhook Token (dùng chung cho Casso / SePay / ThueAPIBank / ACB...)
            <input type="password" id="bankTokenInput" placeholder="Để trống nếu giữ nguyên token hiện tại" autocomplete="new-password">
          </label>
          <label>URL Webhook — dán vào cấu hình bên SePay/Casso/ACB
            <span class="input-with-toggle">
              <input type="text" id="bankWebhookUrl" readonly>
              <button type="button" class="pw-toggle-btn" id="copyWebhookUrlBtn" title="Sao chép"></button>
            </span>
          </label>
          <button type="button" class="btn btn-glass btn-sm" id="saveBankTokenBtn">${ico('lock')} Lưu Token Webhook</button>
          <p class="muted" style="font-size:.75rem;margin:6px 0 0;">Token được lưu riêng ở máy chủ (secrets.php), không hiển thị lại và không gửi cho khách truy cập trang.</p>
        </div>

        <div class="admin-form-section">Nạp thẻ cào (card2k.net)</div>
        <div class="secret-box span-2" id="cardApiBox">
          <div class="secret-status" id="cardApiStatus">Đang kiểm tra trạng thái…</div>
          <label>Partner ID
            <input type="text" id="cardPartnerIdInput" placeholder="Nhập Partner ID (để trống nếu giữ nguyên)" autocomplete="off">
          </label>
          <label>Partner Key
            <input type="password" id="cardPartnerKeyInput" placeholder="Nhập Partner Key (để trống nếu giữ nguyên)" autocomplete="new-password">
          </label>
          <label>Callback URL — dán vào ô "Đường dẫn nhận dữ liệu (Callback Url)" bên card2k.net
            <span class="input-with-toggle">
              <input type="text" id="cardCallbackUrl" readonly>
              <button type="button" class="pw-toggle-btn" id="copyCardCbBtn" title="Sao chép"></button>
            </span>
          </label>
          <button type="button" class="btn btn-glass btn-sm" id="saveCardApiBtn">${ico('lock')} Lưu API thẻ cào</button>
          <p class="muted" style="font-size:.75rem;margin:6px 0 0;">Lấy Partner ID / Partner Key trong mục "Chi tiết kết nối API" của card2k.net. Khóa được lưu riêng ở máy chủ (secrets.php), không hiển thị lại. Sau khi lưu, khách sẽ nạp được thẻ cào ở mục "Nạp tiền → Thẻ cào".</p>
        </div>

        <div class="admin-form-section">Thông báo Telegram cho Admin</div>
        <div class="secret-box span-2" id="telegramBox">
          <div class="secret-status" id="telegramStatus">Đang kiểm tra trạng thái…</div>
          <label>Bot Token
            <input type="password" id="telegramTokenInput" placeholder="VD: 123456:ABC... (để trống nếu giữ nguyên)" autocomplete="new-password">
          </label>
          <label>Chat ID (của bạn hoặc nhóm nhận thông báo)
            <input type="text" id="telegramChatInput" placeholder="VD: 123456789 hoặc -100... (để trống nếu giữ nguyên)" autocomplete="off">
          </label>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button type="button" class="btn btn-glass btn-sm" id="saveTelegramBtn">${ico('lock')} Lưu Telegram</button>
            <button type="button" class="btn btn-glass btn-sm" id="testTelegramBtn">${ico('telegram')} Gửi thử</button>
            <button type="button" class="btn btn-glass btn-sm" id="clearTelegramBtn">Tắt thông báo</button>
          </div>
          <p class="muted" style="font-size:.75rem;margin:6px 0 0;">Tạo bot bằng <b>@BotFather</b> để lấy <b>Bot Token</b>. Lấy <b>Chat ID</b> bằng cách nhắn cho bot rồi mở <b>@userinfobot</b> (hoặc thêm bot vào nhóm). Khi cấu hình xong, admin sẽ nhận tin nhắn mỗi khi có <b>đơn mới / khách nạp tiền / kho key sắp hết</b>.</p>
        </div>

        <div class="admin-form-section span-2">Tỷ lệ % chiết khấu nạp thẻ theo nhà mạng — khách nhận = mệnh giá × (100 − %). Đặt đúng bằng bảng phí của card2k.net.</div>
        <div class="card-discount-grid span-2">
          ${['VIETTEL', 'VINAPHONE', 'MOBIFONE', 'GARENA', 'ZING', 'GATE', 'VCOIN', 'SCOIN'].map((t) => {
      const telcoName = { VIETTEL: 'Viettel', VINAPHONE: 'Vinaphone', MOBIFONE: 'Mobifone', GARENA: 'Garena', ZING: 'Zing', GATE: 'Gate', VCOIN: 'Vcoin', SCOIN: 'Scoin' }[t];
      const saved = (c.cardDiscounts || {})[t];
      const val = saved != null && saved !== '' && typeof saved !== 'object' ? saved : '';
      return `<label>${telcoName} (%) <input type="number" name="cardDiscount_${t}" min="0" max="90" step="0.5" value="${esc(String(val))}" placeholder="mặc định ${cardDiscountHint(t)}%"></label>`;
    }).join('')}
        </div>
        <p class="muted span-2" style="font-size:.75rem;margin:0;">Mặc định đang theo bảng phí phổ biến (Viettel/Vina/Mobifone thay đổi theo mệnh giá). <b>Nên nhập lại đúng % theo bảng phí card2k.net</b> để khớp số tiền thực nhận. Để trống = dùng mặc định. Nhập số = ép một mức % cho <b>mọi mệnh giá</b> của nhà mạng đó. Hệ thống luôn <b>không cộng quá</b> số tiền cổng thực trả nên bạn không lỗ.</p>

        <div class="admin-form-section">${ico('gear')} Chế độ bảo trì</div>
        <label>Bật bảo trì (tạm đóng shop với khách)
          <select name="maintenanceMode">
            <option value="0" ${!c.maintenanceMode ? 'selected' : ''}>Tắt — shop hoạt động bình thường</option>
            <option value="1" ${c.maintenanceMode ? 'selected' : ''}>Bật — khách thấy trang "Đang bảo trì"</option>
          </select>
        </label>
        <label class="span-2">Lời nhắn khi bảo trì
          <input name="maintenanceMessage" value="${esc(c.maintenanceMessage || '')}" placeholder="VD: Shop đang nâng cấp, quay lại sau ít phút nhé!">
        </label>
        <p class="muted span-2" style="font-size:.75rem;margin:0 0 6px;">Khi bật, khách vào web sẽ thấy trang "Đang bảo trì" và không mua được (server cũng chặn). <b>Riêng admin vẫn vào và thao tác bình thường</b> để cập nhật shop an toàn.</p>

        <div class="admin-form-section">Thông báo Popup khi vào Web</div>
        <label>Bật thông báo popup
          <select name="welcomePopupEnabled">
            <option value="1" ${c.welcomePopupEnabled ? 'selected' : ''}>Bật</option>
            <option value="0" ${!c.welcomePopupEnabled ? 'selected' : ''}>Tắt</option>
          </select>
        </label>
        <label>Tiêu đề popup <input name="welcomePopupTitle" value="${esc(c.welcomePopupTitle || '')}"></label>
        <label class="span-2">Nội dung popup
          <textarea name="welcomePopupMessage">${esc(c.welcomePopupMessage || '')}</textarea>
        </label>
        <p class="muted" style="grid-column:1/-1;font-size:.78rem;margin:0;">
          Popup kèm nút "Liên hệ ngay" sẽ hiện 1 lần mỗi phiên truy cập. Đây là thông báo <b>chỉ hiển thị bằng chữ</b>, tách riêng hoàn toàn với lời chào giọng nói bên dưới.
        </p>

        <label>Hiện popup mọi lần vào web
          <select name="welcomeAlways">
            <option value="1" ${c.welcomeAlways !== false ? 'selected' : ''}>Có — ai vào cũng thấy</option>
            <option value="0" ${c.welcomeAlways === false ? 'selected' : ''}>Chỉ 1 lần mỗi phiên</option>
          </select>
        </label>

        <div class="admin-form-section">Chữ chạy</div>
        <label class="span-2">Chữ chạy (marqueeText) <input name="marqueeText" value="${esc(c.marqueeText)}"></label>
        <label>Tốc độ chạy (giây/vòng, càng nhỏ càng nhanh)
          <input type="number" name="marqueeSpeed" min="6" max="60" step="1" value="${c.marqueeSpeed || 26}">
        </label>

        <div class="admin-form-section">Trợ lý ảo AI</div>
        <label>Giọng nói trợ lý (TTS)
          <select name="ttsEnabled">
            <option value="1" ${c.ttsEnabled ? 'selected' : ''}>Bật</option>
            <option value="0" ${!c.ttsEnabled ? 'selected' : ''}>Tắt</option>
          </select>
        </label>
        <label>Tên trợ lý (aiName) <input name="aiName" value="${esc(c.aiName || '')}"></label>
        <label class="span-2">Lời chào đầu tiên khi mở khung chat (aiGreeting) <textarea name="aiGreeting">${esc(c.aiGreeting || '')}</textarea></label>
        <label class="span-2">Trả lời khi khách chào hỏi <textarea name="aiResponseGreeting">${esc(c.aiResponseGreeting || '')}</textarea></label>
        <label class="span-2">Trả lời khi hỏi chung về bảng giá <textarea name="aiResponsePrice">${esc(c.aiResponsePrice || '')}</textarea></label>
        <label class="span-2">Trả lời mặc định khi không hiểu câu hỏi <textarea name="aiResponseFallback">${esc(c.aiResponseFallback || '')}</textarea></label>

        <div class="admin-form-section">Bộ câu trả lời sẵn của AI (thêm bao nhiêu câu tuỳ ý)</div>
        <div class="span-2 ai-kb-editor" id="aiKnowledgeEditor">
          ${(c.aiKnowledge || []).map((item) => aiKnowledgeRowHtml(item)).join('')}
        </div>
        <div class="span-2">
          <button type="button" class="btn btn-glass btn-sm" id="addAiKnowledgeBtn">+ Thêm câu trả lời</button>
        </div>
        <p class="muted" style="grid-column:1/-1;font-size:.78rem;margin:0;">
          Mỗi dòng gồm: <b>Từ khoá</b> (cách nhau bởi dấu phẩy — khách nhắn chứa 1 trong các từ này) và <b>Câu trả lời</b>. Khách hỏi trúng từ khoá nào thì AI trả lời câu đó. Thêm càng nhiều câu, AI trả lời càng thông minh.
        </p>

        <div class="admin-form-actions">
          <button type="submit" class="btn btn-primary btn-sm">Lưu cấu hình</button>
          <button type="button" class="btn btn-glass btn-sm" id="adminSyncServerBtn" style="gap:7px;">
            <span class="btn-ico" data-icon="cloud"></span> Đồng bộ lên máy chủ
          </button>
          <span class="admin-sync-msg" id="adminConfigSyncMsg" style="font-size:.78rem;color:var(--muted);align-self:center;"></span>
        </div>
      </form>
    `;
  }

  // ---- Admin: Sao lưu & Khôi phục dữ liệu (tab riêng) ----
  // ---- Admin: theo dõi Nạp thẻ cào của khách ----
  function adminCardsHtml() {
    return `
      <div class="admin-cards-page">
        <div class="admin-section-title" style="margin:0 0 4px;">Nạp thẻ cào của khách</div>
        <p class="muted" style="font-size:.85rem;margin:0 0 12px;">Theo dõi các thẻ khách đã nạp: đang xử lý / thành công / lỗi. Tiền tự cộng khi cổng card2k.net duyệt (callback về <code>card.php</code>). Nếu cổng đã báo <b>success</b> mà web vẫn <b>Đang xử lý</b> → callback chưa về được, dùng nút <b>Duyệt tay</b> để cộng cho khách.</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;">
          <button type="button" class="btn btn-glass btn-sm" id="cardLogBtn"><span class="btn-ico">${ICONS.news || ''}</span> Xem log callback</button>
          <button type="button" class="btn btn-glass btn-sm" id="cardReloadBtn"><span class="btn-ico">${ICONS.refresh || ''}</span> Tải lại</button>
        </div>
        <pre id="cardLogBox" class="card-log-box" hidden></pre>
        <div class="admin-card-stats" id="adminCardStats"></div>
        <div class="admin-table-wrap" style="margin-top:14px;">
          <table class="admin-table">
            <thead><tr><th>Khách</th><th>Nhà mạng</th><th>Mệnh giá</th><th>Thực nhận</th><th>Trạng thái</th><th>Thời gian</th><th></th></tr></thead>
            <tbody id="adminCardRows"><tr><td colspan="7" class="empty-note">Đang tải…</td></tr></tbody>
          </table>
        </div>
      </div>`;
  }

  function wireAdminCards() {var _$38, _$39;
    const c = getAdminCreds();
    const rows = $('#adminCardRows');
    const statsEl = $('#adminCardStats');
    if (!c) {if (rows) rows.innerHTML = '<tr><td colspan="7" class="empty-note">Đăng nhập lại admin 1 lần để xem.</td></tr>';return;}

    (_$38 = $('#cardReloadBtn')) === null || _$38 === void 0 || _$38.addEventListener('click', () => renderAdminTab('cards'));
    (_$39 = $('#cardLogBtn')) === null || _$39 === void 0 || _$39.addEventListener('click', () => {
      const box = $('#cardLogBox');
      if (!box) return;
      if (!box.hidden) {box.hidden = true;return;}
      box.hidden = false;box.textContent = 'Đang tải log…';
      Store.cardLog(c.username, c.password).then((res) => {
        box.textContent = res && res.status === 'success' ? res.log || '(trống)' : res && res.message || 'Không tải được log.';
      });
    });

    // Duyệt tay: cộng tiền cho 1 thẻ đang chờ (khi callback không về được).
    rows.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-card-approve]');
      if (!btn) return;
      const reqId = btn.dataset.cardApprove;
      const suggest = btn.dataset.suggest || '';
      const input = window.prompt('Số tiền cộng cho khách (đã tính sẵn theo % chiết khấu = số khách được hứa nhận). Sửa lại nếu cần rồi bấm OK:', suggest);
      if (input == null) return;
      const amount = parseInt(String(input).replace(/[^\d]/g, ''), 10);
      if (!amount || amount <= 0) {toast('Số tiền không hợp lệ.', 'error');return;}
      withLoading(btn, async () => {
        const res = await Store.cardApprove(c.username, c.password, reqId, amount);
        if (res && res.status === 'success') {toast('Đã cộng ' + fmt(amount) + ' cho khách.', 'success');renderAdminTab('cards');} else
        {toast(res && res.message || 'Duyệt thất bại.', 'error');}
      });
    });

    Store.cardRequestsAdmin(c.username, c.password).then((res) => {
      if (!res || res.status !== 'success') {rows.innerHTML = `<tr><td colspan="7" class="empty-note">${esc(res && res.message || 'Không tải được.')}</td></tr>`;return;}
      const s = res.stats || {};
      if (statsEl) statsEl.innerHTML =
      `<span class="acs-chip ok"><span class="cs-ico ok">${ICONS.check}</span> Thành công: <b>${s.success || 0}</b> · ${fmt(s.sumSuccess || 0)}</span>` +
      `<span class="acs-chip pend"><span class="cs-ico pending">${ICONS.clock}</span> Đang xử lý: <b>${s.pending || 0}</b></span>` +
      `<span class="acs-chip fail"><span class="cs-ico fail">${ICONS.close}</span> Lỗi: <b>${s.failed || 0}</b></span>`;
      const list = res.requests || [];
      const label = { pending: cardStatusLabel('pending'), success: cardStatusLabel('success'), failed: cardStatusLabel('failed', 'Lỗi/sai') };
      rows.innerHTML = list.length ?
      list.map((r) => {
        const when = r.date ? new Date(r.date).toLocaleString('vi-VN') : '';
        // Số tiền KHÁCH CẦN NHẬN = mệnh giá × (100 − % chiết khấu) — đúng như lúc khách
        // thấy "bạn sẽ nhận X đ". Dùng để hiện sẵn + điền sẵn khi duyệt tay.
        const disc = cardDiscountPct(String(r.telco || '').toUpperCase(), Number(r.declaredAmount) || 0);
        const suggest = Math.floor((Number(r.declaredAmount) || 0) * (100 - disc) / 100);
        const real = r.status === 'success' && r.realAmount ? fmt(r.realAmount) :
        r.status === 'pending' ? `<span style="color:var(--gold-soft);">cần cộng ${fmt(suggest)}</span>` : '—';
        const act = r.status === 'pending' && r.requestId ?
        `<button type="button" class="btn btn-primary btn-sm" data-card-approve="${esc(r.requestId)}" data-suggest="${suggest}">Duyệt tay ${fmt(suggest)}</button>` :
        '';
        return `<tr><td>${esc(r.username)}</td><td>${esc(r.telco)}</td><td>${fmt(r.declaredAmount)}</td><td>${real}</td><td><span class="card-status-badge ${esc(r.status)}">${label[r.status] || r.status}</span></td><td style="white-space:nowrap;font-size:.78rem;">${esc(when)}</td><td>${act}</td></tr>`;
      }).join('') :
      '<tr><td colspan="7" class="empty-note">Chưa có khách nào nạp thẻ.</td></tr>';
    }).catch(() => {rows.innerHTML = '<tr><td colspan="7" class="empty-note">Không tải được.</td></tr>';});
  }

  function adminBackupHtml() {
    // GẮN SẴN đường dẫn tải vào href NGAY LÚC render (admin đang đăng nhập nên có sẵn khóa).
    // Nhờ vậy nút tải là 1 liên kết thật đã có URL đúng — bấm là điện thoại tự tải file,
    // KHÔNG bị lỗi mở ra trang chủ do href còn là "#" (đặt href bằng JS lúc bấm hay bị iOS
    // dùng href cũ trước khi kịp cập nhật).
    const _c = getAdminCreds();
    // Dùng './api.php' trực tiếp — biến API_URL nằm trong IIFE của Store, KHÔNG thấy được ở
    // đây (IIFE của app). Trước đây tham chiếu API_URL gây lỗi "API_URL is not defined".
    const dlHref = _c
      ? './api.php?action=export_db&download=1&admin_user=' + encodeURIComponent(_c.username)
        + '&admin_pass=' + encodeURIComponent(_c.password) + '&t=' + Date.now()
      : '#';
    return `
      <div class="admin-backup-page">
        <div class="admin-section-title" style="margin:0 0 4px;">Sao lưu &amp; Khôi phục dữ liệu</div>
        <p class="muted" style="font-size:.85rem;margin:0 0 16px;line-height:1.6;">
          Giúp bạn <b>không phải làm lại web từ đầu</b> mỗi khi cập nhật bản code mới lên hosting.
          Toàn bộ dữ liệu (người dùng, đơn hàng, cấu hình, kho key…) được lưu thành file
          <code>database_backup.json</code> ngay trên máy chủ. Mỗi lần bấm "Đồng bộ lên máy chủ",
          hệ thống tự tạo bản sao lưu này. Khi tải code mới lên, <b>đừng ghi đè</b> 2 file
          <code>database.json</code> và <code>database_backup.json</code> — lỡ mất dữ liệu thì bấm
          "Khôi phục từ máy chủ" là web trở lại như cũ.
        </p>

        <div class="backup-box" id="backupBox">
          <div class="secret-status" id="backupInfoStatus">Đang kiểm tra bản sao lưu trên máy chủ…</div>

          <div class="backup-card-grid">
            <div class="backup-card">
              <div class="backup-card-title"><span class="backup-card-ico">${ICONS.cloud}</span> Trên máy chủ</div>
              <p class="muted" style="font-size:.78rem;margin:0 0 10px;">Lưu / lấy lại dữ liệu ngay trên hosting.</p>
              <button type="button" class="btn btn-primary btn-sm" id="backupNowBtn" style="width:100%;margin-bottom:8px;"><span class="btn-ico">${ICONS.cloud}</span> Sao lưu ngay lên máy chủ</button>
              <button type="button" class="btn btn-glass btn-sm" id="backupRestoreBtn" style="width:100%;"><span class="btn-ico">${ICONS.refresh}</span> Khôi phục từ máy chủ</button>
            </div>
            <div class="backup-card">
              <div class="backup-card-title"><span class="backup-card-ico">${ICONS.web}</span> Trên thiết bị</div>
              <p class="muted" style="font-size:.78rem;margin:0 0 10px;">Giữ thêm 1 bản trên máy để phòng khi cần. Bản này lưu <b>đầy đủ cấu hình</b> — kể cả <b>khóa API ngân hàng tự động &amp; nạp thẻ cào</b>, khôi phục là chạy được ngay. ${ICONS.warn ? '<span class="inline-ico" style="color:var(--gold)">' + ICONS.warn + '</span>' : ''} File chứa khóa bí mật, hãy giữ kín.</p>
              <a class="btn btn-glass btn-sm" id="backupDownloadBtn" href="${dlHref}" target="_blank" rel="noopener" download="kenios-backup.json" style="width:100%;margin-bottom:8px;text-decoration:none;display:flex;align-items:center;justify-content:center;"><span class="btn-ico">${ICONS.download}</span> Tải bản sao lưu về máy (kèm khóa API)</a>
              <button type="button" class="btn btn-glass btn-sm" id="backupImportBtn" style="width:100%;"><span class="btn-ico">${ICONS.upload}</span> Phục hồi từ file trên máy</button>
              <input type="file" id="backupImportInput" accept="application/json,.json" style="display:none">
            </div>
          </div>

          <div class="backup-card" style="margin-top:14px;">
            <div class="backup-card-title"><span class="backup-card-ico">${ICONS.key}</span> Đơn hàng &amp; key của khách</div>
            <p class="muted" style="font-size:.78rem;margin:0 0 8px;">Mỗi đơn khách mua được lưu vào kho đơn hàng riêng (cộng dồn, không mất khi up code mới). Bấm "Đồng bộ lên máy chủ" cũng tự lưu toàn bộ đơn vào đây.</p>
            <div class="secret-status" id="ordersArchiveStatus" style="margin-bottom:10px;">Đang kiểm tra kho đơn hàng…</div>
            <button type="button" class="btn btn-glass btn-sm" id="recoverOrdersBtn" style="width:100%;"><span class="btn-ico">${ICONS.refresh}</span> Phục hồi đơn hàng khách về web</button>
          </div>

          <span class="admin-sync-msg" id="backupMsg" style="display:block;font-size:.82rem;color:var(--muted);margin-top:12px;"></span>
        </div>

        <div class="backup-steps">
          <div class="admin-form-section" style="margin-top:20px;">Các bước an toàn khi upload code mới lên hosting</div>
          <ol style="margin:0;padding-left:20px;font-size:.85rem;line-height:1.9;color:var(--muted);">
            <li>Bấm <b>Sao lưu ngay lên máy chủ</b> (và <b>Tải bản sao lưu về máy</b> cho chắc chắn).</li>
            <li>Upload bản code mới, nhưng <b>KHÔNG ghi đè</b> 2 file: <code>database.json</code> và <code>database_backup.json</code> (cả <code>secrets.php</code>).</li>
            <li>Nếu web vẫn còn dữ liệu → xong. Nếu lỡ mất → bấm <b>Khôi phục từ máy chủ</b> (hoặc <b>Phục hồi từ file trên máy</b> nếu server mất sạch dữ liệu).</li>
          </ol>
        </div>
      </div>
    `;
  }

  // ---- Admin: Combo sản phẩm ----
  function comboPackageOptions(serviceId, selectedPkgId) {
    const svc = Store.db.services.find((s) => s.id === serviceId);
    const pkgs = svc && svc.packages || [];
    return ['<option value="">— Chọn gói —</option>'].
    concat(pkgs.map((p) => `<option value="${esc(p.id)}" ${p.id === selectedPkgId ? 'selected' : ''}>${esc(p.name)} · ${fmt(p.price)}</option>`)).
    join('');
  }
  function comboItemRowHtml(item) {
    item = item || {};
    const svcOptions = ['<option value="">— Chọn sản phẩm —</option>'].
    concat(Store.db.services.map((s) => `<option value="${esc(s.id)}" ${s.id === item.serviceId ? 'selected' : ''}>${esc(s.name)}</option>`)).
    join('');
    return `
      <div class="combo-item-row" data-combo-item>
        <select data-combo-service class="combo-item-service">${svcOptions}</select>
        <select data-combo-package class="combo-item-package">${comboPackageOptions(item.serviceId, item.packageId)}</select>
        <button type="button" class="btn btn-glass btn-sm danger" data-combo-item-remove aria-label="Xoá sản phẩm">${ico('close')}</button>
      </div>`;
  }
  function adminCombosHtml() {
    const combos = Store.combos();
    const editing = adminComboEditing;
    const editTarget = editing && editing !== 'new' ? combos.find((c) => c.id === editing) : null;
    let form = '';
    if (editing) {
      const c = editTarget || { id: '', name: '', price: 0, description: '', image: '', items: [{}] };
      const items = c.items && c.items.length ? c.items : [{}];
      form = `
        <form class="admin-form" data-admin-form="combo">
          <label class="span-2">Tên combo <input name="name" value="${esc(c.name || '')}" required></label>
          <label>Giá combo (đồng) <input type="number" name="price" min="0" step="1000" value="${Number(c.price) || 0}" required></label>
          <label class="span-2">Mô tả ngắn <input name="description" value="${esc(c.description || '')}"></label>
          <label class="span-2">URL ảnh/video (tuỳ chọn) <input name="image" value="${esc(c.image || '')}" placeholder="Lấy từ tab Thư viện"></label>
          <div class="span-2">
            <div class="admin-section-title" style="margin:6px 0 8px;">Sản phẩm trong combo (chọn sản phẩm → gói)</div>
            <div id="comboItemsEditor">${items.map(comboItemRowHtml).join('')}</div>
            <button type="button" class="btn btn-glass btn-sm" id="addComboItemBtn">+ Thêm sản phẩm</button>
          </div>
          <div class="admin-form-actions span-2">
            <button type="submit" class="btn btn-primary btn-sm">Lưu combo</button>
            <button type="button" class="btn btn-glass btn-sm" data-admin-cancel-combo>Huỷ</button>
          </div>
        </form>`;
    }
    return `
      <div class="admin-toolbar">
        <button type="button" class="btn btn-primary btn-sm" data-admin-new-combo>+ Tạo combo mới</button>
      </div>
      ${form}
      <div class="combo-admin-list">
        ${combos.length ? combos.map((c) => {
      const orig = Store.comboOriginalPrice(c);
      const save = orig - (Number(c.price) || 0);
      return `
          <div class="combo-admin-card">
            <div class="combo-admin-info">
              <strong>${esc(c.name)}</strong>
              <span>${fmt(c.price)} ${save > 0 ? `<s>${fmt(orig)}</s> · tiết kiệm ${fmt(save)}` : ''} · ${(c.items || []).length} sản phẩm</span>
            </div>
            <div class="admin-row-actions">
              <button type="button" data-admin-edit-combo="${esc(c.id)}">Sửa</button>
              <button type="button" class="danger" data-admin-delete-combo="${esc(c.id)}">Xoá</button>
            </div>
          </div>`;
    }).join('') : '<p class="empty-note">Chưa có combo nào. Bấm "Tạo combo mới" để gộp nhiều sản phẩm với giá ưu đãi.</p>'}
      </div>
    `;
  }

  // Sao chép dự phòng cho môi trường không có navigator.clipboard (VD http, iOS cũ).
  function fallbackCopy(text, onDone) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';ta.style.top = '-9999px';
      document.body.appendChild(ta);
      ta.select();ta.setSelectionRange(0, (text || '').length);
      document.execCommand('copy');
      document.body.removeChild(ta);
      if (onDone) onDone();
    } catch (e) {toast('Không sao chép được — hãy chọn ô link rồi copy thủ công.', 'error');}
  }

  // Chuyển đường dẫn tương đối (uploads/xxx.mp4) thành LINK ĐẦY ĐỦ dựa trên địa
  // chỉ trang hiện tại — để copy ra link dùng/chia sẻ được ngay.
  function absUrl(url) {
    if (!url) return '';
    if (/^(https?:)?\/\//i.test(url) || url.startsWith('data:') || url.startsWith('blob:')) return url;
    try {return new URL(url, document.baseURI).href;} catch {return url;}
  }

  // Tab "Tạo Link": tải lên ảnh/video (hoặc dán link) → tạo LINK ĐẦY ĐỦ, lưu lại
  // (dùng chung kho db.media nên bền, đồng bộ lên máy chủ) + lịch sử + nút sao chép.
  function adminLinkGenHtml() {
    const media = Store.db.media || [];
    return `
      <div class="admin-section-title">Tạo link ảnh / video — tải lên hoặc dán link, hệ thống lưu lại &amp; cho sao chép link đầy đủ.</div>
      <div class="media-upload-row">
        <input type="file" id="linkGenFile" accept="image/*,video/*">
        <button type="button" class="btn btn-primary btn-sm" id="linkGenUploadBtn">Tải lên &amp; tạo link</button>
        <span class="muted" style="font-size:.8rem;">Ảnh hoặc video tối đa 500MB (cần máy chủ PHP cho phép upload lớn — xem .user.ini).</span>
      </div>
      <div class="media-link-row">
        <input type="text" id="linkGenUrl" placeholder="Hoặc dán sẵn 1 link ảnh/video để lưu vào lịch sử">
        <select id="linkGenType">
          <option value="auto">Tự nhận đuôi</option>
          <option value="video">Video (.mp4/.webm)</option>
          <option value="image">Ảnh (.jpg/.png/.gif)</option>
        </select>
        <button type="button" class="btn btn-glass btn-sm" id="linkGenAddBtn">+ Lưu link</button>
      </div>
      <div class="admin-section-title" style="margin-top:20px;">Lịch sử link đã lưu (${media.length})</div>
      <div class="linkgen-history">
        ${media.length ? media.map((m) => {
      const full = absUrl(m.url);
      return `
          <div class="linkgen-item">
            <div class="linkgen-thumb">${m.type === 'video' ?
      `<video src="${esc(m.url)}" muted playsinline></video>` :
      `<img src="${esc(m.url)}" alt="" loading="lazy">`}</div>
            <div class="linkgen-body">
              <strong>${esc(m.name || 'media')}${m.type === 'video' ? ' · video' : ''}</strong>
              ${m.date ? `<span class="linkgen-date">${esc(new Date(m.date).toLocaleString('vi-VN'))}</span>` : ''}
              <input class="linkgen-link" type="text" readonly value="${esc(full)}" onclick="this.select()">
            </div>
            <div class="linkgen-actions">
              <button type="button" class="btn btn-primary btn-sm" data-linkgen-copy="${esc(full)}"><span class="btn-ico">${ICONS.copy}</span> Sao chép</button>
              <button type="button" class="btn btn-glass btn-sm danger" data-admin-delete-media="${esc(m.id)}" data-from="linkgen">Xóa</button>
            </div>
          </div>`;
    }).join('') : '<p class="empty-note">Chưa có link nào. Tải lên hoặc dán link để tạo — link sẽ được lưu lại ở đây.</p>'}
      </div>
    `;
  }

  function adminMediaHtml() {
    const media = Store.db.media || [];
    return `
      <div class="media-upload-row">
        <input type="file" id="adminMediaFile" accept="image/*,video/*">
        <button type="button" class="btn btn-primary btn-sm" id="adminUploadBtn">Tải lên</button>
        <span class="muted" style="font-size:.8rem;">Ảnh hoặc video tối đa 500MB. Chỉ hoạt động khi có máy chủ PHP (cần hosting cho phép upload lớn — xem file .user.ini).</span>
      </div>
      <div class="media-link-row">
        <input type="text" id="adminMediaUrl" placeholder="Dán link ảnh/video từ nơi khác (VD: link .mp4...)">
        <select id="adminMediaType">
          <option value="auto">Tự nhận đuôi</option>
          <option value="video">Video (.mp4/.webm)</option>
          <option value="image">Ảnh (.jpg/.png/.gif)</option>
        </select>
        <button type="button" class="btn btn-glass btn-sm" id="adminAddLinkBtn">+ Thêm link (tạo video/ảnh thành link)</button>
      </div>
      <p class="muted" style="font-size:.75rem;margin:0 0 12px;">Thư viện dùng cho ảnh sản phẩm/danh mục, nền Hero, và mục "Hình ảnh &amp; Video" trên trang chủ. Chọn đuôi (video/ảnh) khi link không rõ đuôi.</p>
      <div class="media-grid">
        ${media.length ? media.map((m) => `
          <div class="media-card">
            <div class="media-preview">
              ${m.type === 'video' ?
    `<video src="${esc(m.url)}" muted></video>` :
    `<img src="${esc(m.url)}" alt="">`}
            </div>
            <div class="media-info">
              <strong style="font-size:.78rem;">${esc(m.name || '')}</strong>
              <span class="media-url">${esc(m.url)}</span>
              <div class="media-actions">
                <button type="button" data-admin-copy-media="${esc(m.url)}">Sao chép</button>
                <button type="button" class="danger" data-admin-delete-media="${esc(m.id)}">Xóa</button>
              </div>
            </div>
          </div>
        `).join('') : '<p class="empty-note">Chưa có ảnh/video nào. Tải lên để lấy link sử dụng cho ảnh sản phẩm, danh mục hoặc nền Hero.</p>'}
      </div>
    `;
  }

  function onAdminPanelClick(e) {
    // ----- Combo -----
    if (e.target.closest('[data-admin-new-combo]')) {adminComboEditing = 'new';renderAdminTab('combos');return;}
    const editCombo = e.target.closest('[data-admin-edit-combo]');
    if (editCombo) {adminComboEditing = editCombo.dataset.adminEditCombo;renderAdminTab('combos');return;}
    if (e.target.closest('[data-admin-cancel-combo]')) {adminComboEditing = null;renderAdminTab('combos');return;}
    const delCombo = e.target.closest('[data-admin-delete-combo]');
    if (delCombo) {
      if (confirm('Xoá combo này?')) {Store.adminDeleteCombo(delCombo.dataset.adminDeleteCombo);adminComboEditing = null;renderAdminTab('combos');autoSyncToServer('Đã xóa combo và đồng bộ lên máy chủ.', 'Đã xóa combo (cục bộ). Hãy bấm "Đồng bộ lên máy chủ".');}
      return;
    }
    if (e.target.closest('#addComboItemBtn')) {var _$40;
      (_$40 = $('#comboItemsEditor')) === null || _$40 === void 0 || _$40.insertAdjacentHTML('beforeend', comboItemRowHtml({}));
      return;
    }
    const rmComboItem = e.target.closest('[data-combo-item-remove]');
    if (rmComboItem) {
      const editor = $('#comboItemsEditor');
      if (editor && editor.querySelectorAll('[data-combo-item]').length > 1) rmComboItem.closest('[data-combo-item]').remove();else
      toast('Combo cần ít nhất 1 sản phẩm.', 'error');
      return;
    }

    const newService = e.target.closest('[data-admin-new-service]');
    if (newService) {adminServiceEditing = 'new';renderAdminTab('services');return;}

    const editService = e.target.closest('[data-admin-edit-service]');
    if (editService) {adminServiceEditing = editService.dataset.adminEditService;renderAdminTab('services');return;}

    const cancelService = e.target.closest('[data-admin-cancel-service]');
    if (cancelService) {adminServiceEditing = null;renderAdminTab('services');return;}

    const deleteService = e.target.closest('[data-admin-delete-service]');
    if (deleteService) {
      if (confirm('Xóa dịch vụ này? Hành động không thể hoàn tác.')) {
        Store.adminDeleteService(deleteService.dataset.adminDeleteService);
        renderAdminTab('services');
        autoSyncToServer('Đã xóa sản phẩm và đồng bộ lên máy chủ.', 'Đã xóa sản phẩm (cục bộ). Hãy bấm "Đồng bộ lên máy chủ".');
      }
      return;
    }

    const addPkgRow = e.target.closest('#adminAddPkgRow');
    if (addPkgRow) {
      $('#adminPkgRows').insertAdjacentHTML('beforeend', adminPkgRowHtml({ name: '', price: 0 }));
      return;
    }
    const removePkgRow = e.target.closest('[data-remove-pkg-row]');
    if (removePkgRow) {removePkgRow.closest('.admin-pkg-row').remove();return;}

    const pkgKeysToggle = e.target.closest('[data-pkg-keys-toggle]');
    if (pkgKeysToggle) {
      const panel = pkgKeysToggle.closest('.admin-pkg-row').querySelector('[data-pkg-keys-panel]');
      panel.hidden = !panel.hidden;
      return;
    }
    const removePkgKey = e.target.closest('[data-remove-pkg-key]');
    if (removePkgKey) {
      const row = removePkgKey.closest('.admin-pkg-row');
      const dataEl = row.querySelector('[data-pkg-keys-data]');
      const keys = dataEl.value.split('\n').map((k) => k.trim()).filter(Boolean);
      keys.splice(parseInt(removePkgKey.dataset.removePkgKey, 10), 1);
      dataEl.value = keys.join('\n');
      refreshPkgKeyList(row, keys);
      return;
    }
    const addPkgKeys = e.target.closest('[data-add-pkg-keys]');
    if (addPkgKeys) {
      const row = addPkgKeys.closest('.admin-pkg-row');
      const input = row.querySelector('[data-pkg-keys-input]');
      const newKeys = input.value.split('\n').map((k) => k.trim()).filter(Boolean);
      if (!newKeys.length) return;
      const dataEl = row.querySelector('[data-pkg-keys-data]');
      const keys = dataEl.value.split('\n').map((k) => k.trim()).filter(Boolean);
      let added = 0,dup = 0;
      newKeys.forEach((k) => {if (keys.includes(k)) {dup++;} else {keys.push(k);added++;}});
      dataEl.value = keys.join('\n');
      input.value = '';
      refreshPkgKeyList(row, keys);
      toast(dup > 0 ? `Đã thêm ${added} key (bỏ qua ${dup} key trùng).` : `Đã thêm ${added} key vào kho.`, 'success');
      return;
    }
    const clearPkgKeys = e.target.closest('[data-clear-pkg-keys]');
    if (clearPkgKeys) {
      if (!confirm('Xóa toàn bộ key trong kho của gói này?')) return;
      const row = clearPkgKeys.closest('.admin-pkg-row');
      row.querySelector('[data-pkg-keys-data]').value = '';
      refreshPkgKeyList(row, []);
      return;
    }
    const newCategory = e.target.closest('[data-admin-new-category]');
    if (newCategory) {adminCategoryEditing = 'new';renderAdminTab('categories');return;}

    const editCategory = e.target.closest('[data-admin-edit-category]');
    if (editCategory) {adminCategoryEditing = editCategory.dataset.adminEditCategory;renderAdminTab('categories');return;}

    const cancelCategory = e.target.closest('[data-admin-cancel-category]');
    if (cancelCategory) {adminCategoryEditing = null;renderAdminTab('categories');return;}

    const deleteCategory = e.target.closest('[data-admin-delete-category]');
    if (deleteCategory) {
      try {
        Store.adminDeleteCategory(deleteCategory.dataset.adminDeleteCategory);
        renderAdminTab('categories');
        autoSyncToServer('Đã xóa danh mục và đồng bộ lên máy chủ.', 'Đã xóa danh mục (cục bộ). Hãy bấm "Đồng bộ lên máy chủ".');
      } catch (err) {toast(err.message, 'error');}
      return;
    }

    // ----- Thư mục con -----
    const newSubcat = e.target.closest('[data-admin-new-subcategory]');
    if (newSubcat) {adminSubcategoryEditing = 'new';renderAdminTab('categories');return;}

    const editSubcat = e.target.closest('[data-admin-edit-subcategory]');
    if (editSubcat) {adminSubcategoryEditing = editSubcat.dataset.adminEditSubcategory;renderAdminTab('categories');return;}

    const cancelSubcat = e.target.closest('[data-admin-cancel-subcategory]');
    if (cancelSubcat) {adminSubcategoryEditing = null;renderAdminTab('categories');return;}

    const deleteSubcat = e.target.closest('[data-admin-delete-subcategory]');
    if (deleteSubcat) {
      try {
        Store.adminDeleteSubcategory(deleteSubcat.dataset.adminDeleteSubcategory);
        renderAdminTab('categories');
        autoSyncToServer('Đã xóa thư mục con và đồng bộ lên máy chủ.', 'Đã xóa thư mục con (cục bộ). Hãy bấm "Đồng bộ lên máy chủ".');
      } catch (err) {toast(err.message, 'error');}
      return;
    }

    // ----- Bộ chọn icon (Danh mục / Thư mục con) -----
    const iconPick = e.target.closest('[data-icon-pick]');
    if (iconPick) {
      const picker = iconPick.closest('[data-icon-picker]');
      picker.querySelector('input[type=hidden]').value = iconPick.dataset.iconPick;
      $$('.icon-pick', picker).forEach((b) => b.classList.toggle('selected', b === iconPick));
      return;
    }

    // ----- Bộ chọn hiệu ứng logo -----
    const fxPick = e.target.closest('[data-fx-pick]');
    if (fxPick) {
      const picker = fxPick.closest('[data-fx-picker]');
      picker.querySelector('input[type=hidden]').value = fxPick.dataset.fxPick;
      $$('.fx-pick', picker).forEach((b) => b.classList.toggle('selected', b === fxPick));
      // Áp ngay lên logo thật (font / màu chạy / chuyển động) để xem trước trực tiếp.
      if (fxPick.closest('[data-admin-form="config"]')) liveBrandingPreview();
      return;
    }

    // ----- Thêm / xoá kênh liên hệ (nhóm mạng xã hội) -----
    if (e.target.closest('#addContactChannelBtn')) {
      const editor = $('#contactChannelsEditor');
      if (editor) {editor.insertAdjacentHTML('beforeend', contactChannelRowHtml({ enabled: true }));}
      return;
    }
    const delCh = e.target.closest('[data-ch-remove]');
    if (delCh) {var _delCh$closest;(_delCh$closest = delCh.closest('[data-ch-row]')) === null || _delCh$closest === void 0 || _delCh$closest.remove();return;}

    // ----- Thêm / xoá câu trả lời sẵn của AI -----
    if (e.target.closest('#addAiKnowledgeBtn')) {
      const editor = $('#aiKnowledgeEditor');
      if (editor) {var _editor$querySelector;editor.insertAdjacentHTML('beforeend', aiKnowledgeRowHtml({}));(_editor$querySelector = editor.querySelector('.ai-kb-row:last-child [data-kb-k]')) === null || _editor$querySelector === void 0 || _editor$querySelector.focus();}
      return;
    }
    const delKb = e.target.closest('[data-kb-remove]');
    if (delKb) {var _delKb$closest;(_delKb$closest = delKb.closest('[data-kb-row]')) === null || _delKb$closest === void 0 || _delKb$closest.remove();return;}

    // ----- Thêm / xoá mã giảm giá sản phẩm -----
    if (e.target.closest('#addDiscountCodeBtn')) {
      const editor = $('#discountCodesEditor');
      if (editor) {var _editor$querySelector2;editor.insertAdjacentHTML('beforeend', discountCodeRowHtml({ enabled: true, type: 'percent' }));(_editor$querySelector2 = editor.querySelector('[data-dc-row]:last-child [data-dc-code]')) === null || _editor$querySelector2 === void 0 || _editor$querySelector2.focus();}
      return;
    }
    const delDc = e.target.closest('[data-dc-remove]');
    if (delDc) {var _delDc$closest;(_delDc$closest = delDc.closest('[data-dc-row]')) === null || _delDc$closest === void 0 || _delDc$closest.remove();return;}

    // ----- Thêm / xoá hạng VIP -----
    if (e.target.closest('#addVipTierBtn')) {
      const editor = $('#vipTiersEditor');
      if (editor) {var _editor$querySelector3;editor.insertAdjacentHTML('beforeend', vipTierRowHtml({}));(_editor$querySelector3 = editor.querySelector('[data-vip-row]:last-child [data-vip-name]')) === null || _editor$querySelector3 === void 0 || _editor$querySelector3.focus();}
      return;
    }
    const delVip = e.target.closest('[data-vip-remove]');
    if (delVip) {var _delVip$closest;(_delVip$closest = delVip.closest('[data-vip-row]')) === null || _delVip$closest === void 0 || _delVip$closest.remove();return;}

    const addBal = e.target.closest('[data-admin-add-balance]');
    const subBal = e.target.closest('[data-admin-sub-balance]');
    if (addBal || subBal) {
      const btn = addBal || subBal;
      const userId = btn.dataset.adminAddBalance || btn.dataset.adminSubBalance;
      const row = btn.closest('tr');
      const input = row && row.querySelector('[data-adjust-amount]');
      const amount = parseInt(input && input.value || '', 10);
      if (!amount || amount <= 0) {toast('Nhập số tiền cần cộng/trừ (lớn hơn 0).', 'error');return;}
      const delta = addBal ? amount : -amount;
      const creds = getAdminCreds();
      (async () => {
        if (creds) {
          const res = await Store.adminAdjustBalanceServer(userId, delta, creds.username, creds.password);
          if (res.status === 'success') {
            renderAdminTab('users');
            toast(addBal ? `Đã cộng ${fmt(amount)} vào tài khoản.` : `Đã trừ ${fmt(amount)} khỏi tài khoản.`, 'success');
            return;
          }
          if (res.message && /unauthor/i.test(res.message)) {toast('Cần đăng nhập lại admin 1 lần để lưu lên máy chủ.', 'error');return;}
          // Máy chủ lỗi khác → cập nhật cục bộ để không kẹt (nhớ Đồng bộ sau).
          Store.adminAdjustBalance(userId, delta);
          renderAdminTab('users');
          toast('Đã cập nhật (cục bộ). Hãy bấm "Đồng bộ lên máy chủ".', 'success');
        } else {
          Store.adminAdjustBalance(userId, delta);
          renderAdminTab('users');
          toast('Đã cập nhật (cục bộ). Hãy bấm "Đồng bộ lên máy chủ" để khách thấy.', 'success');
        }
      })();
      return;
    }

    const refundOrder = e.target.closest('[data-refund-order]');
    if (refundOrder) {
      const orderId = refundOrder.dataset.refundOrder;
      const o = Store.db.orders.find((x) => x.id === orderId);
      if (!o) return;
      const creds = getAdminCreds();
      if (!creds) {toast('Vui lòng đăng nhập lại admin 1 lần.', 'error');return;}
      if (!confirm(`Hoàn ${fmt(o.price)} của đơn "${orderId}" vào số dư khách?`)) return;
      (async () => {
        const res = await Store.adminRefundOrder(orderId, creds.username, creds.password);
        if (res.status === 'success') {renderAdminTab('orders');toast(`Đã hoàn ${fmt(o.price)} cho khách.`, 'success');} else
        {toast(res.message || 'Hoàn tiền thất bại.', 'error');}
      })();
      return;
    }

    const delUser = e.target.closest('[data-admin-delete-user]');
    if (delUser) {
      const userId = delUser.dataset.adminDeleteUser;
      const u = Store.db.users.find((x) => x.userId === userId);
      if (!confirm(`Xóa tài khoản "${u ? u.username : ''}"? Hành động không thể hoàn tác.`)) return;
      const creds = getAdminCreds();
      (async () => {
        try {
          if (creds) {
            const res = await Store.adminDeleteUserServer(userId, creds.username, creds.password);
            if (res.status === 'success') {renderAdminTab('users');toast('Đã xóa người dùng.', 'success');return;}
            if (res.message && /unauthor/i.test(res.message)) {toast('Cần đăng nhập lại admin 1 lần để xóa trên máy chủ.', 'error');return;}
            if (res.message) {toast(res.message, 'error');return;}
          }
          Store.adminDeleteUser(userId);
          renderAdminTab('users');
          toast('Đã xóa (cục bộ). Hãy bấm "Đồng bộ lên máy chủ".', 'success');
        } catch (err) {toast(err.message, 'error');}
      })();
      return;
    }

    const toggleStatus = e.target.closest('[data-admin-toggle-status]');
    if (toggleStatus) {
      Store.adminSetUserStatus(toggleStatus.dataset.adminToggleStatus, toggleStatus.dataset.status);
      renderAdminTab('users');
      toast('Đã cập nhật trạng thái người dùng.', 'success');
      return;
    }

    const uploadBtn = e.target.closest('#adminUploadBtn');
    if (uploadBtn) {
      const fileInput = $('#adminMediaFile');
      const file = fileInput.files[0];
      if (!file) {toast('Vui lòng chọn một file trước.', 'error');return;}
      withLoading(uploadBtn, async () => {
        try {
          const url = await Store.uploadFile(file);
          const type = isVideoUrl(url) ? 'video' : 'image';
          Store.adminAddMedia({ id: 'media-' + Date.now(), url, type, name: file.name, date: new Date().toISOString() });
          renderAdminTab('media');
          toast('Tải lên thành công!', 'success');
        } catch (err) {toast(err.message, 'error');}
      });
      return;
    }

    const svcUploadBtn = e.target.closest('#adminServiceUploadBtn');
    if (svcUploadBtn) {
      const file = $('#adminServiceFile').files[0];
      if (!file) {toast('Vui lòng chọn file bản game trước.', 'error');return;}
      withLoading(svcUploadBtn, async () => {
        try {
          const url = await Store.uploadFile(file);
          $('#adminServiceDownload').value = url;
          toast('Đã tải file lên & điền link tải!', 'success');
        } catch (err) {toast(err.message, 'error');}
      });
      return;
    }

    const addLinkBtn = e.target.closest('#adminAddLinkBtn');
    if (addLinkBtn) {
      const url = $('#adminMediaUrl').value.trim();
      if (!url) {toast('Vui lòng dán link trước.', 'error');return;}
      let type = $('#adminMediaType').value;
      if (type === 'auto') type = /\.(mp4|webm|ogg)(\?|#|$)/i.test(url) ? 'video' : 'image';
      Store.adminAddMedia({ id: 'media-' + Date.now(), url, type, name: 'Link ' + type, date: new Date().toISOString() });
      renderAdminTab('media');
      toast('Đã thêm link vào Thư viện.', 'success');
      return;
    }

    // ----- Tab "Tạo Link": tải lên / dán link → lưu lịch sử -----
    const linkGenUploadBtn = e.target.closest('#linkGenUploadBtn');
    if (linkGenUploadBtn) {var _$41;
      const file = (_$41 = $('#linkGenFile')) === null || _$41 === void 0 ? void 0 : _$41.files[0];
      if (!file) {toast('Vui lòng chọn một file trước.', 'error');return;}
      withLoading(linkGenUploadBtn, async () => {
        try {
          const url = await Store.uploadFile(file);
          const type = isVideoUrl(url) ? 'video' : 'image';
          Store.adminAddMedia({ id: 'media-' + Date.now(), url, type, name: file.name, date: new Date().toISOString() });
          renderAdminTab('linkgen');
          toast('Đã tạo link & lưu vào lịch sử!', 'success');
        } catch (err) {toast(err.message, 'error');}
      });
      return;
    }

    const linkGenAddBtn = e.target.closest('#linkGenAddBtn');
    if (linkGenAddBtn) {
      const url = $('#linkGenUrl').value.trim();
      if (!url) {toast('Vui lòng dán link trước.', 'error');return;}
      let type = $('#linkGenType').value;
      if (type === 'auto') type = isVideoUrl(url) ? 'video' : 'image';
      Store.adminAddMedia({ id: 'media-' + Date.now(), url, type, name: 'Link ' + type, date: new Date().toISOString() });
      renderAdminTab('linkgen');
      toast('Đã lưu link vào lịch sử.', 'success');
      return;
    }

    const linkGenCopy = e.target.closest('[data-linkgen-copy]');
    if (linkGenCopy) {var _navigator$clipboard7;
      const link = linkGenCopy.dataset.linkgenCopy;
      const done = () => toast('Đã sao chép link!', 'success');
      if ((_navigator$clipboard7 = navigator.clipboard) !== null && _navigator$clipboard7 !== void 0 && _navigator$clipboard7.writeText) navigator.clipboard.writeText(link).then(done).catch(() => fallbackCopy(link, done));else
      fallbackCopy(link, done);
      return;
    }

    const copyMedia = e.target.closest('[data-admin-copy-media]');
    if (copyMedia) {var _navigator$clipboard8;
      // Sao chép LINK ĐẦY ĐỦ (không phải đường dẫn tương đối) để dùng được ngay.
      const link = absUrl(copyMedia.dataset.adminCopyMedia);
      const done = () => toast('Đã sao chép link!', 'success');
      if ((_navigator$clipboard8 = navigator.clipboard) !== null && _navigator$clipboard8 !== void 0 && _navigator$clipboard8.writeText) navigator.clipboard.writeText(link).then(done).catch(() => fallbackCopy(link, done));else
      fallbackCopy(link, done);
      return;
    }

    const deleteMedia = e.target.closest('[data-admin-delete-media]');
    if (deleteMedia) {
      if (confirm('Xóa file này? Link đã lưu sẽ bị gỡ khỏi lịch sử.')) {
        Store.adminDeleteMedia(deleteMedia.dataset.adminDeleteMedia);
        renderAdminTab(deleteMedia.dataset.from === 'linkgen' ? 'linkgen' : 'media');
        toast('Đã xóa.', 'success');
      }
      return;
    }
  }

  // Khi admin đổi Danh mục trong form Dịch vụ, nạp lại danh sách Thư mục con tương ứng.
  function onAdminPanelChange(e) {
    // Đổi VAI TRÒ người dùng (Thành viên / Cộng tác viên / Admin).
    const roleSel = e.target.closest('[data-admin-set-role]');
    if (roleSel) {
      try {
        Store.adminSetRole(roleSel.dataset.adminSetRole, roleSel.value);
        renderAdminTab('users');
        toast('Đã cập nhật vai trò.', 'success');
      } catch (err) {toast(err.message, 'error');renderAdminTab('users');}
      return;
    }

    // Đổi màu chữ / màu chủ đạo / tốc độ trong form Cấu hình → xem trước ngay.
    if (e.target.closest('[data-admin-form="config"]')) liveBrandingPreview();

    // Đổi sản phẩm trong 1 dòng combo → nạp lại danh sách gói tương ứng.
    const comboSvc = e.target.closest('[data-combo-service]');
    if (comboSvc) {
      const row = comboSvc.closest('[data-combo-item]');
      const pkgSel = row === null || row === void 0 ? void 0 : row.querySelector('[data-combo-package]');
      if (pkgSel) pkgSel.innerHTML = comboPackageOptions(comboSvc.value, '');
      return;
    }

    const catSel = e.target.closest('#adminServiceCategory');
    if (!catSel) return;
    const sub = $('#adminServiceSubcat');
    if (!sub) return;
    const subs = (Store.db.subcategories || []).filter((s) => s.categoryId === catSel.value);
    sub.innerHTML = `<option value="">— Không thuộc thư mục con —</option>` +
    subs.map((s) => `<option value="${esc(s.id)}">${esc(s.name)}</option>`).join('');
  }

  function onAdminPanelSubmit(e) {
    const formType = e.target.dataset.adminForm;
    if (!formType) return;
    e.preventDefault();
    const fd = new FormData(e.target);

    if (formType === 'combo') {
      const items = $$('[data-combo-item]', e.target).map((row) => {var _row$querySelector, _row$querySelector2;return {
          serviceId: ((_row$querySelector = row.querySelector('[data-combo-service]')) === null || _row$querySelector === void 0 ? void 0 : _row$querySelector.value) || '',
          packageId: ((_row$querySelector2 = row.querySelector('[data-combo-package]')) === null || _row$querySelector2 === void 0 ? void 0 : _row$querySelector2.value) || ''
        };});
      try {
        Store.adminSaveCombo({
          id: adminComboEditing && adminComboEditing !== 'new' ? adminComboEditing : '',
          name: fd.get('name'), price: parseInt(fd.get('price'), 10) || 0,
          description: fd.get('description') || '', image: fd.get('image') || '', items
        });
        adminComboEditing = null;
        renderAdminTab('combos');
        autoSyncToServer('Đã lưu combo và đồng bộ lên máy chủ.', 'Đã lưu combo (cục bộ). Hãy bấm "Đồng bộ lên máy chủ".');
      } catch (err) {toast(err.message, 'error');}
      return;
    }

    if (formType === 'service') {
      // ID sản phẩm sinh tự động (#01, #02...) khi thêm mới; giữ nguyên khi sửa.
      const id = adminServiceEditing === 'new' ? nextSeqId(Store.db.services) : adminServiceEditing;
      // Giữ nguyên id gói cũ (không sinh lại mỗi lần lưu) và chỉ gửi lại field `keys`
      // khi thực sự biết rõ nội dung kho key hiện tại (đã gõ thêm, hoặc phiên này đã
      // tải đủ kho key từ máy chủ) — tránh trường hợp sửa giá/tên mà vô tình gửi kho
      // key rỗng đè lên kho key thật trên máy chủ khi chưa bấm "Tải kho key đầy đủ".
      const originalService = Store.db.services.find((s) => s.id === id);
      const packages = $$('.admin-pkg-row', e.target).map((row, i) => {var _row$querySelector3;
        const name = row.querySelector('[data-pkg-name]').value.trim();
        const price = parseInt(row.querySelector('[data-pkg-price]').value, 10) || 0;
        // Kho key đã xác nhận + CHÍNH những key còn đang gõ dở trong ô (chưa bấm "+ Thêm
        // key") — gộp lại để gõ xong bấm Lưu là tự vào kho, không sợ mất. Đồng thời khử
        // trùng, giữ nguyên thứ tự (không thêm/bớt ký tự nào của key).
        const confirmedKeys = row.querySelector('[data-pkg-keys-data]').value.split('\n').map((k) => k.trim()).filter(Boolean);
        const pendingKeys = (((_row$querySelector3 = row.querySelector('[data-pkg-keys-input]')) === null || _row$querySelector3 === void 0 ? void 0 : _row$querySelector3.value) || '').split('\n').map((k) => k.trim()).filter(Boolean);
        const keys = [];
        confirmedKeys.concat(pendingKeys).forEach((k) => {if (!keys.includes(k)) keys.push(k);});
        const pkgId = row.dataset.pkgId;
        const pkg = { id: pkgId || `pkg-${id}-${i}-${Date.now().toString(36)}`, name, price };
        const original = pkgId && originalService ? (originalService.packages || []).find((p) => p.id === pkgId) : null;
        const knewKeysAlready = original && Array.isArray(original.keys);
        if (keys.length || knewKeysAlready) pkg.keys = keys;
        return pkg;
      }).filter((p) => p.name);
      if (!packages.length) {toast('Cần ít nhất một gói giá.', 'error');return;}
      const categoryId = fd.get('categoryId');
      // Chỉ giữ subcategoryId nếu thư mục con đó thực sự thuộc danh mục đã chọn.
      let subcategoryId = fd.get('subcategoryId') || '';
      if (subcategoryId && !(Store.db.subcategories || []).some((sc) => sc.id === subcategoryId && sc.categoryId === categoryId)) {
        subcategoryId = '';
      }
      Store.adminSaveService({
        id, name: fd.get('name').trim(), categoryId, subcategoryId,
        description: fd.get('description').trim(), image: fd.get('image').trim(),
        downloadUrl: (fd.get('downloadUrl') || '').trim(),
        status: fd.get('status'), platform: fd.get('platform') || '',
        features: fd.get('features').split('\n').map((s) => s.trim()).filter(Boolean),
        packages
      });
      adminServiceEditing = null;
      renderAdminTab('services');
      autoSyncToServer('Đã lưu sản phẩm và đồng bộ lên máy chủ.', 'Đã lưu sản phẩm (cục bộ). Hãy bấm "Đồng bộ lên máy chủ".');
    } else if (formType === 'category') {
      const id = adminCategoryEditing === 'new' ? nextSeqId(Store.db.categories) : adminCategoryEditing;
      Store.adminSaveCategory({
        id, name: fd.get('name').trim(), icon: fd.get('icon') || 'folder',
        description: fd.get('description').trim(), image: fd.get('image').trim()
      });
      adminCategoryEditing = null;
      renderAdminTab('categories');
      autoSyncToServer('Đã lưu danh mục và đồng bộ lên máy chủ.', 'Đã lưu danh mục (cục bộ). Hãy bấm "Đồng bộ lên máy chủ".');
    } else if (formType === 'subcategory') {
      const id = adminSubcategoryEditing === 'new' ? nextSeqId(Store.db.subcategories || []) : adminSubcategoryEditing;
      Store.adminSaveSubcategory({
        id, categoryId: fd.get('categoryId'), name: fd.get('name').trim(), icon: fd.get('icon') || 'folder',
        description: fd.get('description').trim(), image: fd.get('image').trim()
      });
      adminSubcategoryEditing = null;
      renderAdminTab('categories');
      autoSyncToServer('Đã lưu thư mục con và đồng bộ lên máy chủ.', 'Đã lưu thư mục con (cục bộ). Hãy bấm "Đồng bộ lên máy chủ".');
    } else if (formType === 'config') {
      const cardDiscounts = {};
      ['VIETTEL', 'VINAPHONE', 'MOBIFONE', 'GARENA', 'ZING', 'GATE', 'VCOIN', 'SCOIN'].forEach((t) => {
        const raw = fd.get('cardDiscount_' + t);
        const v = parseFloat(raw);
        if (raw !== null && raw !== '' && !isNaN(v) && v > 0) cardDiscounts[t] = Math.max(0, Math.min(90, v));
      });
      Store.adminUpdateConfig({
        cardDiscounts,
        logoText: fd.get('logoText'), logoSubtext: fd.get('logoSubtext'),
        logoUrl: fd.get('logoUrl'), logoFont: fd.get('logoFont'), logoColor: fd.get('logoColor'),
        logoColorMode: fd.get('logoColorMode'), logoAnimSpeed: parseFloat(fd.get('logoAnimSpeed')) || 6,
        logoMotionMode: fd.get('logoMotionMode') || 'none', logoMotionSpeed: parseFloat(fd.get('logoMotionSpeed')) || 2,
        accentColor: fd.get('accentColor'),
        referralEnabled: fd.get('referralEnabled') === 'on',
        referralBonus: parseInt(fd.get('referralBonus'), 10) || 0,
        showcaseEnabled: fd.get('showcaseEnabled') === 'on',
        bannerTagText: fd.get('bannerTagText'), bannerBtn1Text: fd.get('bannerBtn1Text'), bannerBtn2Text: fd.get('bannerBtn2Text'),
        siteTitle: fd.get('siteTitle'), siteSubtitle: fd.get('siteSubtitle'),
        contactAdminName: fd.get('contactAdminName'), contactAdminSub: fd.get('contactAdminSub'), contactAdminDesc: fd.get('contactAdminDesc'),
        hotline: fd.get('hotline'), zaloLink: fd.get('zaloLink'),
        googleClientId: fd.get('googleClientId'),
        welcomePopupEnabled: fd.get('welcomePopupEnabled') === '1',
        welcomePopupTitle: fd.get('welcomePopupTitle'), welcomePopupMessage: fd.get('welcomePopupMessage'),
        welcomeAlways: fd.get('welcomeAlways') !== '0', welcomeVoiceEnabled: false,
        maintenanceMode: fd.get('maintenanceMode') === '1', maintenanceMessage: fd.get('maintenanceMessage'),
        bankId: fd.get('bankId'), bankAccountNo: fd.get('bankAccountNo'), bankAccountName: fd.get('bankAccountName'),
        marqueeText: fd.get('marqueeText'), marqueeSpeed: parseInt(fd.get('marqueeSpeed'), 10) || 26,
        ttsEnabled: fd.get('ttsEnabled') === '1',
        aiName: fd.get('aiName'), aiGreeting: fd.get('aiGreeting'),
        aiResponseGreeting: fd.get('aiResponseGreeting'),
        aiResponsePrice: fd.get('aiResponsePrice'), aiResponseFallback: fd.get('aiResponseFallback'),
        aiKnowledge: readAiKnowledgeFromEditor(),
        bgUrl: fd.get('bgUrl'),
        siteBgUrl: fd.get('siteBgUrl'),
        contactChannels: readContactChannelsFromEditor()
      });
      renderStatic();
      toast('Đã lưu cấu hình. Nhấn "Đồng bộ lên máy chủ" để áp dụng cho mọi khách truy cập.', 'success');
    } else if (formType === 'promo') {
      const fsEnds = fd.get('flashSaleEndsAt');
      Store.adminUpdateConfig({
        depositBonusEnabled: fd.get('depositBonusEnabled') === '1',
        depositBonusPercent: Math.max(0, Math.min(100, parseFloat(fd.get('depositBonusPercent')) || 0)),
        depositBonusMin: Math.max(0, parseInt(fd.get('depositBonusMin'), 10) || 0),
        discountCodes: readDiscountCodesFromEditor(),
        flashSale: {
          enabled: fd.get('flashSaleEnabled') === '1',
          percent: Math.max(0, Math.min(100, parseFloat(fd.get('flashSalePercent')) || 0)),
          endsAt: fsEnds ? new Date(fsEnds).toISOString() : '',
          title: (fd.get('flashSaleTitle') || 'FLASH SALE').trim() || 'FLASH SALE'
        },
        vipTiers: readVipTiersFromEditor()
      });
      renderStatic();
      renderAdminTab('promo');
      toast('Đã lưu Khuyến mãi / Flash Sale / Mã giảm giá / VIP. Nhấn "Đồng bộ lên máy chủ" để áp dụng cho mọi khách.', 'success');
    }
  }

  // ============================================================
  // Toast
  // ============================================================
  const TOAST_ICONS = { success: ICONS.check, error: ICONS.warn, info: ICONS.info };
  function toast(message, type = 'success') {
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<span class="toast-icon">${TOAST_ICONS[type] || ICONS.info}</span><span class="toast-body"></span><button class="toast-dismiss" aria-label="Đóng">${ICONS.close}</button>`;
    el.querySelector('.toast-body').textContent = message;
    el.querySelector('.toast-dismiss').addEventListener('click', () => el.remove());
    $('#toastStack').appendChild(el);
    setTimeout(() => el.remove(), 5000);
  }

  function setText(sel, text) {const el = $(sel);if (el) el.textContent = text !== null && text !== void 0 ? text : '';}
  function setAttr(sel, attr, val) {const el = $(sel);if (el && val) el.setAttribute(attr, val);}
})();

/* PRESTIGE v6 — đèn nền theo con trỏ trên thẻ (cao cấp). Tách riêng, không đụng
   logic hiện có: chỉ lắng nghe di chuột và đặt biến CSS --mx/--my cho thẻ đang trỏ.
   Tự tắt trên cảm ứng hoặc khi người dùng chọn giảm chuyển động. */
(function () {
  try {
    var mq = window.matchMedia;
    if (mq && (mq('(hover: none)').matches || mq('(prefers-reduced-motion: reduce)').matches)) return;
    var SEL = '.service-card, .category-card';
    document.addEventListener('pointermove', function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      var card = t.closest(SEL);
      if (!card) return;
      var r = card.getBoundingClientRect();
      if (!r.width || !r.height) return;
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    }, { passive: true });
  } catch (_) {/* im lặng, không ảnh hưởng trang */}
})();