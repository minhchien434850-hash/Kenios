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
    logoSubtext: "v3.0 Premium",
    logoUrl: "",
    logoFont: "Be Vietnam Pro",
    logoColor: "",
    logoColorMode: "solid",
    logoAnimSpeed: 6,
    accentColor: "#ffb703",
    googleClientId: "",
    welcomePopupEnabled: false,
    welcomePopupTitle: "Chào mừng bạn đến với KENIOS.STORE!",
    welcomePopupMessage: "Hệ thống nạp tiền VietQR tự động 24/7, giao key tức thì sau thanh toán. Cần hỗ trợ gì cứ liên hệ Admin nhé!",
    welcomeVoiceEnabled: false,
    welcomeVoiceText: "Xin chào! Chào mừng bạn đã đến với KENIOS.STORE.",
    hotline: "0387332523",
    zaloLink: "https://zalo.me/0387332523",
    contactChannels: [
      { id: "zalo", label: "Zalo", icon: "💬", url: "https://zalo.me/0387332523", enabled: true },
      { id: "phone", label: "Hotline", icon: "📞", url: "tel:0387332523", enabled: false },
      { id: "telegram", label: "Telegram", icon: "📢", url: "", enabled: false },
      { id: "facebook", label: "Facebook", icon: "👍", url: "", enabled: false },
      { id: "instagram", label: "Instagram", icon: "📷", url: "", enabled: false },
      { id: "tiktok", label: "TikTok", icon: "🎵", url: "", enabled: false },
      { id: "email", label: "Email", icon: "📧", url: "", enabled: false }
    ],
    contactAdminName: "ADMIN SHOP",
    contactAdminSub: "Chủ sở hữu hệ thống",
    contactAdminDesc: "Chuyên cung cấp phụ kiện gaming và dịch vụ thiết kế website chất lượng cao, giúp nâng tầm trải nghiệm của bạn.",
    bgUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1920&auto=format&fit=crop",
    aiName: "Trợ Lý Ảo Kenios",
    aiGreeting: "Xin chào! Tôi là trợ lý ảo của KENIOS.STORE. Tôi có thể giúp gì cho bạn hôm nay?",
    aiResponseGreeting: "Chào bạn! Chúc bạn một ngày mua sắm vui vẻ. Tôi có thể hỗ trợ bạn tìm hiểu về dịch vụ Game hoặc Thiết Kế Web của shop.",
    aiResponseDeposit: "Nạp tiền vào tài khoản rất đơn giản và tự động 100%: vào mục \"Nạp tiền\", nhập số tiền muốn nạp rồi quét mã VietQR. Số dư sẽ được cộng tự động ngay sau khi giao dịch thành công.",
    aiResponseProduct: "Shop đang cung cấp nhiều gói dịch vụ cho PUBG, Liên Quân, Free Fire, Tốc Chiến. Bạn có thể bấm vào danh mục tương ứng trên trang chủ để xem chi tiết và mua key.",
    aiResponseWeb: "Bên mình có dịch vụ thiết kế website phong cách hiện đại, chuẩn SEO và tương thích tốt trên mọi thiết bị. Hãy xem mục \"Thiết Kế Web\" để biết thêm chi tiết nhé!",
    aiResponsePrice: "🔥 BẢNG GIÁ 🔥🚀\n\n📱 PUBG IOS\n\n💎 VNHAX\n💰 600K/Tháng\n💰 300K/Tuần\n\n💎 VNHAX MOD SKIN VN\n💰 450K/Tháng\n💰 225K/Tuần\n\n💎 OASIS VIP\n💰 800K/Tháng\n💰 400K/Tuần\n\n💎 KING\n💰 900K/Tháng\n💰 450K/Tuần\n\n💎 TIMO VIP\n💰 500K/Tháng\n💰 250K/Tuần\n💰 50K/Ngày\n\n💎 VINGODL\n💰 550K/Tháng\n💰 250K/Tuần\n\n🤖 PUBG ANDROID\n\n💰 ZOLO: 500K/T - 250K/Tuần\n💰 MG: 500K/T - 250K/Tuần\n💰 VNB: 500K/T - 250K/Tuần\n💰 ROOT: 650K/Tháng\n\n⚔️ LIÊN QUÂN\n💰 250K/Tháng\n💰 120K/Tuần\n💰 500/Tháng chống tố\n💰 250/Tuần chống tố\n\n🔥 FREE FIRE\n💰 550K/Tháng\n💰 250K/Tuần\n\n🌐 Tất cả dịch vụ: https://linkbio.co/KENIOS\n👥 Nhóm Zalo: https://zalo.me/g/wfggej458\n📢 Nhóm Telegram: https://t.me/minhchienhaxgame\n\n❤️ Cảm ơn anh em đã ủng hộ ❤️",
    aiResponseContact: "Bạn có thể liên hệ trực tiếp Admin qua Zalo/Hotline để được hỗ trợ setup và tư vấn chi tiết. Link liên hệ nằm ở góc phải màn hình.",
    aiResponseThanks: "Không có gì đâu! Rất vui vì đã giúp được bạn. Nếu cần thêm thông tin gì cứ hỏi mình nhé!",
    aiResponseFallback: "Mình chưa hiểu rõ câu hỏi này. Bạn có thể hỏi mình về: \"cách nạp tiền\", \"giá sản phẩm\", \"dịch vụ thiết kế web\", hoặc nhắn Zalo Admin để được hỗ trợ ngay nhé.",
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
    ttsPitch: 1
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
      image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=600&auto=format&fit=crop" }
  ],
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
        { id: "pkg-radar-30day", name: "1 Tháng", price: 350000 }
      ]
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
        { id: "pkg-aimbot-30day", name: "1 Tháng", price: 390000 }
      ]
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
    }
  ],
  users: [
    { userId: "10001", username: "kenios", password: "admin1999@", balance: 0, role: "admin", status: "active", createdAt: "2026-06-13" }
  ],
  posts: [
    { id: "1", title: "Hướng dẫn cài đặt an toàn 100%", summary: "Làm sao để trải nghiệm an toàn, không lo mất tài khoản chính? Xem ngay cẩm nang này.", date: "2026-06-10" },
    { id: "2", title: "Cập nhật hệ thống nạp tiền VietQR siêu tốc", summary: "Hệ thống chính thức nâng cấp cơ chế sinh mã QR tự động theo chuẩn Napas 247.", date: "2026-06-09" }
  ],
  orders: [],
  transactions: [],
  media: []
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

  const Store = {
    db: null,
    session: null, // { userId } khi đã đăng nhập
    serverAvailable: null, // null = chưa rõ, true/false sau lần gọi API đầu tiên
    _listeners: [],

    async init() {
      this.db = await this._loadDb();
      this._mergeLocalOverrides();
      const savedSession = this._readLocal('session');
      if (savedSession && this.db.users.some(u => u.userId === savedSession.userId)) {
        this.session = savedSession;
      }
      return this.db;
    },

    onChange(fn) { this._listeners.push(fn); },
    _emit() { this._listeners.forEach(fn => { try { fn(this.db); } catch (e) { console.error(e); } }); },

    async _loadDb() {
      try {
        const res = await fetch(`database.json?v=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (json && json.config) return json;
        }
      } catch (e) {
        console.warn('Không tải được database.json, dùng dữ liệu mặc định.', e);
      }
      return JSON.parse(JSON.stringify(global.KENIOS_DEFAULT_DB));
    },

    _mergeLocalOverrides() {
      const local = this._readLocal('overrides');
      if (!local) return;
      ['users', 'orders', 'transactions', 'categories', 'services', 'media'].forEach(key => {
        if (Array.isArray(local[key])) this.db[key] = local[key];
      });
      if (local.config) Object.assign(this.db.config, local.config);
    },

    _persistOverrides() {
      this._writeLocal('overrides', {
        users: this.db.users,
        orders: this.db.orders,
        transactions: this.db.transactions,
        categories: this.db.categories,
        services: this.db.services,
        media: this.db.media,
        config: this.db.config
      });
    },

    _readLocal(key) {
      try { return JSON.parse(localStorage.getItem(`${LS_KEY}:${key}`)); } catch { return null; }
    },
    _writeLocal(key, val) {
      try { localStorage.setItem(`${LS_KEY}:${key}`, JSON.stringify(val)); } catch { /* ignore */ }
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
      try { json = await res.json(); } catch (e) { throw new BackendUnavailableError(); }
      if (!json || typeof json.status === 'undefined') throw new BackendUnavailableError();
      return json;
    },

    // ---- Tài khoản ----
    currentUser() {
      if (!this.session) return null;
      return this.db.users.find(u => u.userId === this.session.userId) || null;
    },

    isAdmin() {
      const u = this.currentUser();
      return !!u && u.role === 'admin';
    },

    async register(username, password) {
      username = (username || '').trim();
      if (!username || (password || '').length < 6) {
        throw new Error('Tên đăng nhập không hợp lệ hoặc mật khẩu quá ngắn (tối thiểu 6 ký tự).');
      }
      try {
        const result = await this._callApi('register', { username, password });
        this.serverAvailable = true;
        if (result.status !== 'success') throw new Error(result.message || 'Đăng ký thất bại.');
        this._upsertUser(result.user);
        this._setSession(result.user.userId);
        return result.user;
      } catch (err) {
        if (err instanceof BackendUnavailableError) {
          this.serverAvailable = false;
          return this._localRegister(username, password);
        }
        throw err;
      }
    },

    async login(username, password) {
      username = (username || '').trim();
      try {
        const result = await this._callApi('login', { username, password });
        this.serverAvailable = true;
        if (result.status !== 'success') throw new Error(result.message || 'Sai tên đăng nhập hoặc mật khẩu.');
        this._upsertUser(result.user);
        this._setSession(result.user.userId);
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
    async loginWithGoogle(credential) {
      const result = await this._callApi('google_login', { credential });
      if (result.status !== 'success') throw new Error(result.message || 'Đăng nhập Google thất bại.');
      this._upsertUser(result.user);
      this._setSession(result.user.userId);
      return result.user;
    },

    // Chế độ demo cục bộ (không có máy chủ PHP): kiểm tra trực tiếp trong dữ liệu đã tải.
    _localRegister(username, password) {
      if (this.db.users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
        throw new Error('Tên đăng nhập đã tồn tại.');
      }
      const user = {
        userId: String(Date.now()),
        username, password, balance: 0, role: 'member', status: 'active',
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(username)}`,
        createdAt: new Date().toISOString().slice(0, 10)
      };
      this.db.users.push(user);
      this._persistOverrides();
      this._setSession(user.userId);
      return user;
    },

    _localLogin(username, password) {
      const user = this.db.users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
      if (!user) throw new Error('Sai tên đăng nhập hoặc mật khẩu.');
      if (user.status !== 'active') throw new Error('Tài khoản đã bị khóa.');
      this._setSession(user.userId);
      return user;
    },

    _upsertUser(safeUser) {
      const idx = this.db.users.findIndex(u => u.userId === safeUser.userId);
      if (idx >= 0) this.db.users[idx] = Object.assign({}, this.db.users[idx], safeUser);
      else this.db.users.push(safeUser);
      this._persistOverrides();
    },

    _setSession(userId) {
      this.session = { userId };
      this._writeLocal('session', this.session);
      this._emit();
    },

    logout() {
      this.session = null;
      this._writeLocal('session', null);
      this._emit();
    },

    // ---- Giao dịch ----
    deposit(amount, note) {
      const user = this.currentUser();
      if (!user) throw new Error('Bạn cần đăng nhập trước.');
      user.balance = (user.balance || 0) + amount;
      this.db.transactions.unshift({
        id: 'TX' + Date.now(), userId: user.userId, amount, type: 'deposit',
        description: note || 'Nạp tiền qua VietQR', date: new Date().toISOString()
      });
      this._persistOverrides();
      this._emit();
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
        return { credited: false, serverError: true, message: (res && res.message) || 'Máy chủ chưa kiểm tra được giao dịch.' };
      }
      if (res.credited && res.balance !== null && res.balance !== undefined) {
        const user = this.currentUser();
        if (user) user.balance = res.balance;
        this._persistOverrides();
        this._emit();
      }
      return { credited: !!res.credited, balance: res.balance };
    },

    // Gói có kho key thật (admin đã nhập key trong tab Dịch vụ) sẽ có field `keyCount`
    // (kể cả khi = 0). Với gói này, PHẢI mua qua máy chủ (redeemKeyOnServer) để rút
    // đúng 1 key thật + trừ số dư một cách xác thực, không dùng đường cũ (giả lập cục bộ).
    usesRealKeyStock(pkg) {
      return pkg && typeof pkg.keyCount === 'number';
    },

    async redeemKeyOnServer(username, password, service, pkg) {
      const result = await this._callApi('redeem_key', {
        username, password, serviceId: service.id, packageId: pkg.id
      });
      if (result.status !== 'success') throw new Error(result.message || 'Mua hàng thất bại.');
      const user = this.currentUser();
      if (user) user.balance = result.balance;
      this.db.orders.unshift(result.order);
      this._persistOverrides();
      this._emit();
      return result.order;
    },

    // Đường cũ (demo cục bộ): dùng cho các gói CHƯA cấu hình kho key thật, sinh key
    // giả lập ngay trên trình duyệt — giữ lại để không phá vỡ các dịch vụ demo hiện có.
    buyPackage(service, pkg) {
      const user = this.currentUser();
      if (!user) throw new Error('Bạn cần đăng nhập trước khi mua.');
      if ((user.balance || 0) < pkg.price) throw new Error('Số dư không đủ. Vui lòng nạp thêm tiền.');
      user.balance -= pkg.price;
      const key = this._generateKey(service, pkg);
      const order = {
        id: 'DH' + Date.now(), userId: user.userId, serviceId: service.id,
        serviceName: service.name, packageName: pkg.name, price: pkg.price,
        key, date: new Date().toISOString()
      };
      this.db.orders.unshift(order);
      this.db.transactions.unshift({
        id: 'TX' + Date.now(), userId: user.userId, amount: -pkg.price, type: 'purchase',
        description: `Mua ${service.name} - ${pkg.name}`, date: new Date().toISOString()
      });
      this._persistOverrides();
      this._emit();
      return order;
    },

    myOrders() {
      const user = this.currentUser();
      if (!user) return [];
      return this.db.orders.filter(o => o.userId === user.userId);
    },

    _generateKey(service, pkg) {
      const prefix = service.name.split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 4);
      const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
      return `${prefix}-${pkg.name.replace(/\s+/g, '').toUpperCase()}-${rand}`;
    },

    // ============================================================
    // ADMIN — chỉnh sửa dịch vụ / danh mục / người dùng / cấu hình.
    // Mọi thay đổi được lưu cục bộ ngay lập tức; nút "Đồng bộ lên máy chủ"
    // trong bảng quản trị mới thực sự ghi vào database.json qua api.php.
    // ============================================================
    adminSaveService(service) {
      const idx = this.db.services.findIndex(s => s.id === service.id);
      if (idx >= 0) this.db.services[idx] = service;
      else this.db.services.push(service);
      this._persistOverrides();
      this._emit();
    },

    adminDeleteService(id) {
      this.db.services = this.db.services.filter(s => s.id !== id);
      this._persistOverrides();
      this._emit();
    },

    adminSaveCategory(category) {
      const idx = this.db.categories.findIndex(c => c.id === category.id);
      if (idx >= 0) this.db.categories[idx] = category;
      else this.db.categories.push(category);
      this._persistOverrides();
      this._emit();
    },

    adminDeleteCategory(id) {
      if (this.db.services.some(s => s.categoryId === id)) {
        throw new Error('Không thể xóa danh mục đang có dịch vụ. Hãy xóa hoặc chuyển dịch vụ trước.');
      }
      this.db.categories = this.db.categories.filter(c => c.id !== id);
      this._persistOverrides();
      this._emit();
    },

    adminUpdateConfig(patch) {
      Object.assign(this.db.config, patch);
      this._persistOverrides();
      this._emit();
    },

    adminAdjustBalance(userId, delta) {
      const user = this.db.users.find(u => u.userId === userId);
      if (!user) throw new Error('Không tìm thấy người dùng.');
      user.balance = Math.max(0, (user.balance || 0) + delta);
      this._persistOverrides();
      this._emit();
    },

    adminSetUserStatus(userId, status) {
      const user = this.db.users.find(u => u.userId === userId);
      if (!user) throw new Error('Không tìm thấy người dùng.');
      if (user.role === 'admin') throw new Error('Không thể khóa tài khoản quản trị.');
      user.status = status;
      this._persistOverrides();
      this._emit();
    },

    adminAddMedia(item) {
      if (!this.db.media) this.db.media = [];
      this.db.media.unshift(item);
      this._persistOverrides();
      this._emit();
    },

    adminDeleteMedia(id) {
      this.db.media = (this.db.media || []).filter(m => m.id !== id);
      this._persistOverrides();
      this._emit();
    },

    // Upload file thật lên server (chỉ hoạt động khi có backend PHP với thư mục uploads/ ghi được).
    async uploadFile(file) {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API_URL}?action=upload_file`, { method: 'POST', body: fd });
      let json;
      try { json = await res.json(); } catch (e) { throw new Error('Không có máy chủ PHP để tải file lên (chế độ demo cục bộ không hỗ trợ upload).'); }
      if (json.status !== 'success') throw new Error(json.message || 'Tải file thất bại.');
      return json.url;
    },

    // Tải lại toàn bộ kho key thật (packages[].keys) cho tab Dịch vụ — máy chủ chỉ trả
    // key thật khi xác thực đúng tài khoản admin, tránh lộ key cho khách vãng lai.
    async fetchFullServiceKeys(adminUser, adminPass) {
      const res = await fetch(`${API_URL}?action=get_db&t=${Date.now()}`, {
        headers: { 'X-Admin-User': adminUser, 'X-Admin-Pass': adminPass }
      });
      const json = await res.json();
      if (!json || !Array.isArray(json.services)) throw new Error('Không tải được dữ liệu từ máy chủ.');
      const hasKeys = json.services.some(s => (s.packages || []).some(p => Array.isArray(p.keys)));
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

    // ---- Đồng bộ Admin lên máy chủ (chỉ hoạt động khi có backend PHP) ----
    async trySaveToServer(adminUser, adminPass) {
      try {
        const res = await fetch(`${API_URL}?action=save_db`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Admin-User': adminUser, 'X-Admin-Pass': adminPass },
          body: JSON.stringify(this.db)
        });
        return await res.json();
      } catch (e) {
        return { status: 'error', message: 'Không có kết nối tới máy chủ PHP (chế độ demo cục bộ).' };
      }
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
      const load = () => { this.voices = window.speechSynthesis.getVoices(); };
      load();
      window.speechSynthesis.onvoiceschanged = load;
    },

    // Danh sách giọng ưu tiên hiển thị cho người dùng chọn: Google trước, còn lại sau.
    availableVoices() {
      const vi = this.voices.filter(v => v.lang.startsWith('vi'));
      const others = this.voices.filter(v => !v.lang.startsWith('vi'));
      const sortGoogleFirst = (a, b) => {
        const ag = /google/i.test(a.name) ? 0 : 1;
        const bg = /google/i.test(b.name) ? 0 : 1;
        return ag - bg;
      };
      return [...vi.sort(sortGoogleFirst), ...others.sort(sortGoogleFirst)];
    },

    _pickVoice() {
      if (this.prefs.voiceURI) {
        const chosen = this.voices.find(v => v.voiceURI === this.prefs.voiceURI);
        if (chosen) return chosen;
      }
      // Mặc định: giọng nữ Google tiếng Việt, rồi tới bất kỳ giọng Google nào, cuối cùng là giọng vi-VN bất kỳ.
      return this.voices.find(v => v.lang.startsWith('vi') && /google/i.test(v.name))
        || this.voices.find(v => /google/i.test(v.name))
        || this.voices.find(v => v.lang.startsWith('vi'))
        || this.voices[0]
        || null;
    },

    async speak(text) {
      if (!this.prefs.enabled || !text) return;
      this.stop();
      if (!ttsUnavailable) {
        const played = await this._speakGoogleCloud(text);
        if (played) return;
      }
      this._speakBrowser(text);
    },

    async _speakGoogleCloud(text) {
      try {
        const res = await fetch(TTS_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, rate: this.prefs.rate, pitch: (this.prefs.pitch - 1) * 10 })
        });
        const json = await res.json();
        if (json.status !== 'success' || !json.audioContent) { ttsUnavailable = true; return false; }
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
      if (voice) { utter.voice = voice; utter.lang = voice.lang; }
      else utter.lang = 'vi-VN';
      utter.rate = this.prefs.rate;
      utter.pitch = this.prefs.pitch;
      utter.volume = this.prefs.volume;
      window.speechSynthesis.speak(utter);
    },

    stop() {
      if (currentAudio) { currentAudio.pause(); currentAudio = null; }
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    },

    setPrefs(patch) {
      Object.assign(this.prefs, patch);
      writePrefs(this.prefs);
    }
  };

  function readPrefs() {
    try { return JSON.parse(localStorage.getItem(PREF_KEY)) || {}; } catch { return {}; }
  }
  function writePrefs(p) {
    try { localStorage.setItem(PREF_KEY, JSON.stringify(p)); } catch { /* ignore */ }
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
      injectCSS();
      document.addEventListener('pointerdown', (e) => this._onPointer(e), { passive: true });
      this._buildSettingsPanel();
    },

    _onPointer(e) {
      if (this.prefs.touchEnabled) spawnRipple(e.clientX, e.clientY);
      if (this.prefs.sound !== 'none') playSound(this.prefs.sound, this.prefs.volume);
    },

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
        opt.value = key; opt.textContent = val.label;
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
        background: radial-gradient(circle, rgba(255,183,3,.55) 0%, rgba(134,59,255,.25) 60%, transparent 75%);
        animation: fxRipple .5s ease-out forwards; }
    `;
    document.head.appendChild(s);
  }

  function spawnRipple(x, y) {
    const size = 46;
    const el = document.createElement('div');
    el.className = 'fx-ripple';
    el.style.left = (x - size / 2) + 'px';
    el.style.top = (y - size / 2) + 'px';
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
      osc.connect(g); g.connect(master);
      osc.start(now + start); osc.stop(now + start + dur + 0.02);
    };

    switch (preset) {
      case 'pop': tone(900, 0, 0.08, 'sine', 0.5); break;
      case 'click': tone(1800, 0, 0.03, 'square', 0.25); break;
      case 'coin': tone(1046, 0, 0.09, 'square', 0.3); tone(1568, 0.08, 0.12, 'square', 0.25); break;
      case 'wood': tone(220, 0, 0.05, 'triangle', 0.4); tone(160, 0.02, 0.06, 'triangle', 0.25); break;
      case 'chime': tone(1318, 0, 0.35, 'sine', 0.25); tone(1976, 0.05, 0.4, 'sine', 0.18); break;
      case 'bubble': tone(500, 0, 0.05, 'sine', 0.3); tone(900, 0.04, 0.08, 'sine', 0.25); break;
      case 'blip': tone(2400, 0, 0.02, 'square', 0.2); tone(1200, 0.02, 0.03, 'square', 0.18); break;
      case 'marimba': tone(784, 0, 0.2, 'sine', 0.3); tone(988, 0.03, 0.25, 'sine', 0.2); break;
      case 'bell': tone(1568, 0, 0.5, 'sine', 0.3); tone(2093, 0.02, 0.5, 'sine', 0.15); break;
      case 'success': tone(659, 0, 0.1, 'sine', 0.3); tone(880, 0.1, 0.1, 'sine', 0.3); tone(1318, 0.2, 0.2, 'sine', 0.3); break;
      case 'laser': tone(1800, 0, 0.08, 'sawtooth', 0.2); tone(400, 0.05, 0.1, 'sawtooth', 0.15); break;
      case 'drop': tone(1200, 0, 0.04, 'sine', 0.3); tone(300, 0.03, 0.15, 'sine', 0.25); break;
      case 'notify': tone(1046, 0, 0.12, 'triangle', 0.25); tone(1568, 0.1, 0.15, 'triangle', 0.2); break;
      default: break;
    }
  }

  function readPrefs() {
    try { return JSON.parse(localStorage.getItem(PREF_KEY)) || {}; } catch { return {}; }
  }
  function writePrefs(p) {
    try { localStorage.setItem(PREF_KEY, JSON.stringify(p)); } catch { /* ignore */ }
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
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

  // ============================================================
  // BỘ ICON SVG (thay cho emoji "icon máy" — hiển thị đồng nhất, nét mảnh, đẹp trên
  // mọi thiết bị). Dùng qua thuộc tính data-icon="tên" trong HTML, hoặc ICONS.tên
  // trong template JS. Tất cả vẽ bằng nét currentColor nên tự đổi màu theo chữ.
  // ============================================================
  const _svg = (inner) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
  const ICONS = {
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
    close: _svg('<path d="M6 6l12 12M18 6 6 18"/>')
  };
  function applyIcons(root = document) {
    $$('[data-icon]', root).forEach(el => {
      const name = el.dataset.icon;
      if (ICONS[name] && !el.dataset.iconDone) { el.innerHTML = ICONS[name]; el.dataset.iconDone = '1'; }
    });
  }

  let selectedCategory = 'all';
  let currentServiceId = null;
  let currentPackage = null;
  let adminActiveTab = 'overview';
  let adminServiceEditing = null;  // null | 'new' | service id
  let adminCategoryEditing = null; // null | 'new' | category id

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

  document.addEventListener('DOMContentLoaded', boot);

  async function boot() {
    Voice.init();
    Effects.init();
    await Store.init();
    Store.onChange(renderDynamic);

    applyIcons();
    renderStatic();
    renderDynamic();
    renderFaq();
    wireGlobalUI();
    wireAuthModal();
    wireDepositModal();
    wireServiceModal();
    wireAdminModal();
    wireLegalModal();
    wireAiWidget();
    wireSearchModal();
    wireScrollReveal();
    wireScrollTopButton();

    const loader = $('#bootLoader');
    if (loader) { loader.classList.add('hidden'); setTimeout(() => loader.remove(), 500); }

    maybeShowWelcome(Store.db.config);
  }

  // ---- Thông báo popup và lời chào giọng nói khi vào web — HAI tính năng tách
  // biệt hoàn toàn: mỗi cái có công tắc bật/tắt và nội dung riêng, không dùng chung. ----
  const WELCOME_POPUP_SHOWN_KEY = 'kenios_welcome_popup_shown_v1';
  const WELCOME_VOICE_SHOWN_KEY = 'kenios_welcome_voice_shown_v1';

  function maybeShowWelcome(cfg) {
    if (cfg.welcomePopupEnabled && !sessionStorage.getItem(WELCOME_POPUP_SHOWN_KEY)) {
      sessionStorage.setItem(WELCOME_POPUP_SHOWN_KEY, '1');
      setTimeout(() => {
        setText('#welcomeTitle', cfg.welcomePopupTitle);
        setText('#welcomeMessage', cfg.welcomePopupMessage);
        setAttr('#welcomeContactBtn', 'href', cfg.zaloLink);
        openModal('#welcomeModal');
      }, 600);
    }
    if (cfg.welcomeVoiceEnabled && !sessionStorage.getItem(WELCOME_VOICE_SHOWN_KEY)) {
      sessionStorage.setItem(WELCOME_VOICE_SHOWN_KEY, '1');
      setTimeout(() => { Voice.speak(cfg.welcomeVoiceText); }, 600);
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
    setText('#footerBrand', cfg.logoText);
    setText('#footerDesc', cfg.contactAdminDesc);
    setText('#footerAdminName', `${cfg.contactAdminName} — ${cfg.contactAdminSub}`);
    setText('#footerHotline', cfg.hotline);
    setText('#footerYear', new Date().getFullYear());
    renderContactWidgets(cfg);

    setText('#heroTag', cfg.bannerTagText);
    setText('#heroTitle', cfg.siteTitle.replace(/^.*?-\s*/, ''));
    setText('#heroSub', cfg.siteSubtitle);
    setText('#heroBtn1', cfg.bannerBtn1Text);
    setText('#heroBtn2', cfg.bannerBtn2Text);
    applyHeroBackground(cfg.bgUrl);

    const m = `📢 ${cfg.marqueeText}`;
    setText('#marqueeText1', m);
    setText('#marqueeText2', m);
    document.documentElement.style.setProperty('--marquee-speed', `${cfg.marqueeSpeed || 26}s`);

    applyBranding(cfg);
    setupGoogleSignIn(cfg);
    setText('#aiName', cfg.aiName);
    if ($('#aiAvatar')) $('#aiAvatar').src = cfg.aiAvatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=kenios-ai`;

    Voice.setPrefs({ enabled: !!cfg.ttsEnabled, rate: cfg.ttsRate || 1, pitch: cfg.ttsPitch || 1 });

    renderPosts();
  }

  // ---- Đăng nhập bằng Google (một chạm, không cần mã xác nhận) ----
  let _gsiScriptLoading = null;
  function loadGoogleScript() {
    if (window.google?.accounts?.id) return Promise.resolve();
    if (_gsiScriptLoading) return _gsiScriptLoading;
    _gsiScriptLoading = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true;
      s.onload = resolve;
      s.onerror = () => { _gsiScriptLoading = null; reject(new Error('Không tải được Google Sign-In script.')); };
      document.head.appendChild(s);
    });
    return _gsiScriptLoading;
  }

  async function setupGoogleSignIn(cfg) {
    const box = $('#googleSignInBox');
    const divider = $('#authDivider');
    if (!cfg.googleClientId) { box.hidden = true; divider.hidden = true; return; }
    try {
      await loadGoogleScript();
      box.hidden = false;
      divider.hidden = false;
      box.innerHTML = '';
      window.google.accounts.id.initialize({
        client_id: cfg.googleClientId,
        callback: handleGoogleCredential
      });
      window.google.accounts.id.renderButton(box, { theme: 'filled_black', size: 'large', shape: 'pill', text: 'signin_with', width: 280 });
    } catch (err) {
      console.warn(err);
      box.hidden = true;
      divider.hidden = true;
    }
  }

  function handleGoogleCredential(response) {
    Store.loginWithGoogle(response.credential).then(() => {
      closeModal('#authModal');
      toast('Đăng nhập bằng Google thành công!', 'success');
    }).catch(err => toast(err.message, 'error'));
  }

  // ---- Thương hiệu: logo (ảnh/font/màu) + màu chủ đạo toàn site ----
  const LOGO_FONTS = ['Be Vietnam Pro', 'Poppins', 'Montserrat', 'Playfair Display', 'Orbitron', 'Pacifico'];
  const BANK_OPTIONS = [
    'ACB', 'Vietcombank', 'VietinBank', 'BIDV', 'MBBank', 'Techcombank', 'VPBank',
    'TPBank', 'Sacombank', 'HDBank', 'SHB', 'OCB', 'MSB', 'SeABank', 'VIB', 'Agribank'
  ];
  const _loadedFonts = new Set(['Be Vietnam Pro']);

  function ensureFontLoaded(fontName) {
    if (_loadedFonts.has(fontName)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@400;600;700;800&display=swap`;
    document.head.appendChild(link);
    _loadedFonts.add(fontName);
  }

  // ---- Widget liên hệ đa kênh: 1 kênh bật -> nút thẳng; nhiều kênh bật -> gộp
  // thành 1 nút mở ra danh sách. Dùng chung cho header / footer / popup chào mừng. ----
  function renderContactWidgets(cfg) {
    const channels = cfg.contactChannels || [];
    renderContactWidget($('#headerContactWrap'), channels, { btnClass: 'btn btn-ghost btn-sm' });
    renderContactWidget($('#footerContactWrap'), channels, { btnClass: 'btn btn-glass btn-sm', dropUp: true });
    renderContactWidget($('#welcomeContactWrap'), channels, { btnClass: 'btn btn-primary btn-block' });
  }

  function renderContactWidget(container, channels, opts = {}) {
    if (!container) return;
    const enabled = channels.filter(c => c.enabled && c.url);
    container.innerHTML = '';
    if (!enabled.length) { container.hidden = true; return; }
    container.hidden = false;

    if (enabled.length === 1) {
      const c = enabled[0];
      const a = document.createElement('a');
      a.href = c.url;
      if (!c.url.startsWith('tel:') && !c.url.startsWith('mailto:')) { a.target = '_blank'; a.rel = 'noopener'; }
      a.className = opts.btnClass;
      a.innerHTML = `<span>${c.icon}</span> ${esc(c.label)}`;
      container.appendChild(a);
      return;
    }

    const wrap = document.createElement('div');
    wrap.className = 'contact-widget';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = opts.btnClass;
    btn.innerHTML = `<span>💬</span> Liên hệ`;
    const dropdown = document.createElement('div');
    dropdown.className = 'contact-dropdown' + (opts.dropUp ? ' drop-up' : '');
    dropdown.innerHTML = enabled.map(c => {
      const targetAttrs = (!c.url.startsWith('tel:') && !c.url.startsWith('mailto:')) ? 'target="_blank" rel="noopener"' : '';
      return `<a href="${esc(c.url)}" ${targetAttrs}><span>${c.icon}</span> ${esc(c.label)}</a>`;
    }).join('');
    btn.addEventListener('click', (e) => { e.stopPropagation(); dropdown.classList.toggle('open'); });
    document.addEventListener('click', () => dropdown.classList.remove('open'));
    wrap.appendChild(btn);
    wrap.appendChild(dropdown);
    container.appendChild(wrap);
  }

  function applyBranding(cfg) {
    $$('.brand-mark').forEach(img => { img.src = cfg.logoUrl || './favicon.svg'; });

    const font = cfg.logoFont || 'Be Vietnam Pro';
    ensureFontLoaded(font);
    document.documentElement.style.setProperty('--logo-font', `'${font}', 'Be Vietnam Pro', sans-serif`);
    document.documentElement.style.setProperty('--logo-color', cfg.logoColor || 'inherit');

    const accent = cfg.accentColor || '#ffb703';
    document.documentElement.style.setProperty('--gold', accent);
    document.documentElement.style.setProperty('--gold-soft', `color-mix(in srgb, ${accent} 70%, white)`);

    document.documentElement.style.setProperty('--logo-anim-speed', `${cfg.logoAnimSpeed || 6}s`);
    const brandNameEl = $('#brandName');
    if (brandNameEl) {
      brandNameEl.classList.remove('logo-anim-rainbow', 'logo-anim-shine');
      if (cfg.logoColorMode === 'rainbow') brandNameEl.classList.add('logo-anim-rainbow');
      else if (cfg.logoColorMode === 'shine') brandNameEl.classList.add('logo-anim-shine');
    }
  }

  // ============================================================
  // RENDER — phần động (phụ thuộc trạng thái đăng nhập / dữ liệu đổi)
  // ============================================================
  function renderDynamic() {
    renderAuthArea();
    renderHeroStats();
    renderCategories();
    renderServiceGrid();
    renderWebdesignGrid();
  }

  function categoryMediaHtml(c) {
    if (!c.image) return '';
    if (isVideoUrl(c.image)) {
      return `<video class="category-media" src="${esc(c.image)}" muted loop autoplay playsinline></video>`;
    }
    return `<div class="category-media" data-fallback-bg="${esc(c.image)}" style="background-image:url('${esc(c.image)}')"></div>`;
  }

  function renderCategories() {
    const grid = $('#categoryGrid');
    grid.innerHTML = Store.db.categories.map(c => `
      <div class="category-card ${c.image ? 'has-media' : ''}" data-category="${esc(c.id)}" role="button" tabindex="0">
        ${categoryMediaHtml(c)}
        <span class="category-icon">${c.icon}</span>
        <h3>${esc(c.name)}</h3>
        <p>${esc(c.description)}</p>
      </div>
    `).join('');
    applyImageFallbacks(grid, '.category-media');
    grid.onclick = (e) => {
      const card = e.target.closest('.category-card');
      if (!card) return;
      const catId = card.dataset.category;
      selectedCategory = catId === 'webdesign' ? 'all' : catId;
      renderServiceGrid();
      const target = catId === 'webdesign' ? '#webdesign' : '#services';
      document.querySelector(target).scrollIntoView({ behavior: 'smooth' });
    };

    const filterWrap = $('#filterTabs');
    const cats = Store.db.categories.filter(c => c.id !== 'webdesign');
    filterWrap.innerHTML = [`<button class="filter-tab ${selectedCategory === 'all' ? 'active' : ''}" data-filter="all">Tất cả</button>`]
      .concat(cats.map(c => `<button class="filter-tab ${selectedCategory === c.id ? 'active' : ''}" data-filter="${esc(c.id)}">${c.icon} ${esc(c.name)}</button>`))
      .join('');
    filterWrap.onclick = (e) => {
      const btn = e.target.closest('.filter-tab');
      if (!btn) return;
      selectedCategory = btn.dataset.filter;
      $$('.filter-tab', filterWrap).forEach(b => b.classList.toggle('active', b === btn));
      renderServiceGrid();
    };
  }

  function renderPosts() {
    const grid = $('#postGrid');
    grid.innerHTML = Store.db.posts.map(p => `
      <article class="post-card">
        <time>${esc(p.date)}</time>
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.summary)}</p>
      </article>
    `).join('');
  }

  // Nền Hero hỗ trợ cả ảnh và video (tự nhận diện qua đuôi file .mp4/.webm/.ogg).
  function isVideoUrl(url) { return /\.(mp4|webm|ogg)(\?|#|$)/i.test(url || ''); }

  function applyHeroBackground(url) {
    const imgEl = $('#heroBg');
    const videoEl = $('#heroBgVideo');
    if (!url) { imgEl.style.backgroundImage = 'none'; videoEl.hidden = true; return; }
    if (isVideoUrl(url)) {
      videoEl.src = url;
      videoEl.hidden = false;
      videoEl.onerror = () => { videoEl.hidden = true; };
      imgEl.style.backgroundImage = 'none';
    } else {
      videoEl.hidden = true;
      imgEl.style.backgroundImage = `url(${url})`;
    }
  }

  // ---- FAQ ----
  const FAQ_ITEMS = [
    { q: 'Nạp tiền vào tài khoản như thế nào?', a: 'Vào mục "Nạp tiền", nhập số tiền muốn nạp rồi quét mã VietQR hiển thị. Số dư được cộng tự động ngay sau khi hệ thống xác nhận giao dịch thành công, không cần chờ duyệt thủ công.' },
    { q: 'Mua xong bao lâu thì nhận được key?', a: 'Key được cấp phát tự động ngay lập tức sau khi thanh toán, hiển thị trong mục "Đơn hàng của tôi" và có thể sao chép trực tiếp.' },
    { q: 'Có được hoàn tiền không?', a: 'Do đây là sản phẩm số cấp phát tức thì, đơn hàng đã giao key không thể hoàn tiền trừ khi lỗi từ phía hệ thống. Vui lòng liên hệ Admin trong vòng 24 giờ nếu gặp sự cố.' },
    { q: 'Tôi cần hỗ trợ thêm thì liên hệ ở đâu?', a: 'Bạn có thể nhắn Zalo/Hotline của Admin (góc phải header) hoặc trò chuyện trực tiếp với trợ lý ảo AI ở góc dưới màn hình, hỗ trợ 24/7.' }
  ];

  function renderFaq() {
    const list = $('#faqList');
    if (!list) return;
    list.innerHTML = FAQ_ITEMS.map((item, i) => `
      <div class="faq-item" data-faq-index="${i}">
        <button class="faq-question" type="button">
          <span>${esc(item.q)}</span><span class="chev">▾</span>
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
    const list = Store.db.services.filter(s => !query || s.name.toLowerCase().includes(query) || s.description.toLowerCase().includes(query));
    if (!query) {
      results.innerHTML = `<p class="empty-note">Nhập từ khóa để tìm dịch vụ (VD: PUBG, Landing Page, Aimbot...)</p>`;
      return;
    }
    results.innerHTML = list.length ? list.map(s => {
      const minPrice = Math.min(...s.packages.map(p => p.price));
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
    if (!('IntersectionObserver' in window)) { items.forEach(el => el.classList.add('revealed')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('revealed'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12 });
    items.forEach(el => io.observe(el));
  }

  // ---- Nút lên đầu trang ----
  function wireScrollTopButton() {
    const btn = $('#scrollTopBtn');
    window.addEventListener('scroll', () => {
      btn.hidden = window.scrollY < 500;
      btn.classList.toggle('visible', window.scrollY >= 500);
    }, { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  function renderHeroStats() {
    const db = Store.db;
    const stats = [
      { label: 'Dịch Vụ', value: db.services.length },
      { label: 'Danh Mục', value: db.categories.length },
      { label: 'Đơn Hàng', value: db.orders.length },
      { label: 'Hoạt Động', value: '24/7' }
    ];
    $('#heroStats').innerHTML = stats.map(s => `
      <div class="stat-chip"><strong>${s.value}</strong><span>${s.label}</span></div>
    `).join('');
  }

  function serviceCardHtml(s) {
    const minPrice = Math.min(...(s.packages || []).map(p => p.price));
    const inStock = s.status === 'instock';
    const isVideo = isVideoUrl(s.image);
    return `
      <article class="service-card" data-service="${esc(s.id)}">
        <div class="thumb" ${isVideo ? '' : `data-fallback-bg="${esc(s.image)}" style="background-image:url('${esc(s.image)}')"`}>
          ${isVideo ? `<video class="thumb-video" src="${esc(s.image)}" muted loop autoplay playsinline></video>` : ''}
          <span class="badge ${inStock ? '' : 'out'}">${inStock ? 'Còn hàng' : 'Hết hàng'}</span>
        </div>
        <div class="body">
          <h3>${esc(s.name)}</h3>
          <p class="desc">${esc(s.description)}</p>
          <div class="price-row">
            <span class="price">Từ ${fmt(minPrice)}</span>
            <button class="btn btn-glass btn-sm" data-view-service="${esc(s.id)}">Xem chi tiết</button>
          </div>
        </div>
      </article>
    `;
  }

  function renderServiceGrid() {
    const list = Store.db.services.filter(s => s.categoryId !== 'webdesign' &&
      (selectedCategory === 'all' || s.categoryId === selectedCategory));
    $('#serviceGrid').innerHTML = list.length
      ? list.map(serviceCardHtml).join('')
      : `<p class="empty-note">Chưa có dịch vụ nào trong danh mục này.</p>`;
    applyImageFallbacks($('#serviceGrid'));
  }

  function renderWebdesignGrid() {
    const list = Store.db.services.filter(s => s.categoryId === 'webdesign');
    $('#webdesignGrid').innerHTML = list.map(serviceCardHtml).join('');
    applyImageFallbacks($('#webdesignGrid'));
  }

  // Ảnh minh họa lấy từ Unsplash có thể chậm/không tải được tùy mạng — khi lỗi,
  // hiển thị nền gradient thay vì để trống mảng xám khó chịu.
  function applyImageFallbacks(root, selector) {
    $$(`${selector || '.thumb'}[data-fallback-bg]`, root).forEach(el => {
      const url = el.dataset.fallbackBg;
      if (!url) return;
      const img = new Image();
      img.onerror = () => { el.classList.add('img-fallback'); el.textContent = '🖼️'; el.style.backgroundImage = 'none'; };
      img.src = url;
    });
  }

  function renderAuthArea() {
    const area = $('#authArea');
    const user = Store.currentUser();
    $('#adminQuickBtn').hidden = !(user && user.role === 'admin');
    if (!user) {
      area.innerHTML = `<button class="btn btn-primary btn-sm" id="openAuthBtn">Đăng nhập</button>`;
      $('#openAuthBtn').addEventListener('click', () => openModal('#authModal'));
      return;
    }
    const avatar = user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.username)}`;
    area.innerHTML = `
      <div class="auth-mini">
        <button class="balance-pill" id="balancePill">${fmt(user.balance || 0)}</button>
        <div class="user-menu">
          <button class="avatar-btn" id="avatarBtn"><img src="${avatar}" alt=""></button>
          <div class="user-dropdown" id="userDropdown">
            <strong style="padding:8px 12px;font-size:.85rem;">${esc(user.username)}</strong>
            <button id="ddOrders"><span class="dd-ico">${ICONS.box}</span> Đơn hàng của tôi</button>
            <button id="ddDeposit"><span class="dd-ico">${ICONS.card}</span> Nạp tiền</button>
            <button id="ddLogout"><span class="dd-ico">${ICONS.logout}</span> Đăng xuất</button>
          </div>
        </div>
      </div>
    `;
    $('#balancePill').addEventListener('click', () => openModal('#depositModal'));
    $('#avatarBtn').addEventListener('click', () => $('#userDropdown').classList.toggle('open'));
    $('#ddOrders').addEventListener('click', () => { $('#userDropdown').classList.remove('open'); openOrdersModal(); });
    $('#ddDeposit').addEventListener('click', () => { $('#userDropdown').classList.remove('open'); openModal('#depositModal'); });
    $('#ddLogout').addEventListener('click', () => { Store.logout(); toast('Đã đăng xuất.', 'success'); });
  }

  // ============================================================
  // MODAL helpers
  // ============================================================
  function openModal(sel) { $(sel).hidden = false; document.body.style.overflow = 'hidden'; }
  function closeModal(sel) { $(sel).hidden = true; document.body.style.overflow = ''; }

  async function withLoading(btn, fn) {
    btn.classList.add('is-loading');
    btn.disabled = true;
    try { await fn(); } finally { btn.classList.remove('is-loading'); btn.disabled = false; }
  }

  function wireGlobalUI() {
    $$('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal('#' + overlay.id); });
    });
    $$('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => closeModal('#' + btn.closest('.modal-overlay').id));
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') $$('.modal-overlay').forEach(o => { if (!o.hidden) closeModal('#' + o.id); });
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.user-menu')) $('#userDropdown')?.classList.remove('open');
    });

    const closeMobileNav = () => {
      $('#mobileNav').classList.remove('open');
      $('#mobileNavBackdrop').classList.remove('open');
      $('#menuToggle').setAttribute('aria-expanded', 'false');
    };
    $('#menuToggle').addEventListener('click', () => {
      const open = $('#mobileNav').classList.toggle('open');
      $('#mobileNavBackdrop').classList.toggle('open', open);
      $('#menuToggle').setAttribute('aria-expanded', String(open));
    });
    $('#mobileNavBackdrop').addEventListener('click', closeMobileNav);
    $$('.mobile-nav-link', $('#mobileNav')).forEach(a => a.addEventListener('click', closeMobileNav));
    $('#mobileNavDeposit').addEventListener('click', () => {
      if (!Store.currentUser()) { toast('Vui lòng đăng nhập trước khi nạp tiền.', 'error'); openModal('#authModal'); return; }
      openModal('#depositModal');
    });
    $('#mobileNavOrders').addEventListener('click', () => openOrdersModal());

    $('#adminQuickBtn').addEventListener('click', () => openAdminModal());

    $('#heroBtn2').addEventListener('click', () => {
      if (!Store.currentUser()) { toast('Vui lòng đăng nhập trước khi nạp tiền.', 'error'); openModal('#authModal'); return; }
      openModal('#depositModal');
    });

    document.body.addEventListener('click', (e) => {
      const viewBtn = e.target.closest('[data-view-service]');
      if (viewBtn) openServiceModal(viewBtn.dataset.viewService);

      const pwToggle = e.target.closest('[data-pw-toggle]');
      if (pwToggle) {
        const input = pwToggle.previousElementSibling;
        const isPw = input.type === 'password';
        input.type = isPw ? 'text' : 'password';
        pwToggle.textContent = isPw ? '🙈' : '👁';
      }

      const legalLink = e.target.closest('[data-legal]');
      if (legalLink) { e.preventDefault(); openLegalModal(legalLink.dataset.legal); }
    });
  }

  // ---- Đăng nhập / Đăng ký ----
  function wireAuthModal() {
    $$('.auth-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        $$('.auth-tab').forEach(t => t.classList.toggle('active', t === tab));
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
          await Store.login(fd.get('username'), fd.get('password'));
          closeModal('#authModal');
          e.target.reset();
          $('#loginError').textContent = '';
          toast('Đăng nhập thành công!', 'success');
        } catch (err) { $('#loginError').textContent = err.message; }
      });
    });

    $('#registerForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const submitBtn = e.target.querySelector('button[type=submit]');
      withLoading(submitBtn, async () => {
        try {
          await Store.register(fd.get('username'), fd.get('password'));
          closeModal('#authModal');
          e.target.reset();
          $('#registerError').textContent = '';
          toast('Tạo tài khoản thành công! Chào mừng bạn.', 'success');
        } catch (err) { $('#registerError').textContent = err.message; }
      });
    });
  }

  // ---- Nạp tiền VietQR ----
  function wireDepositModal() {
    const quick = $('#quickAmounts');
    [50000, 100000, 200000, 500000, 1000000].forEach(v => {
      const b = document.createElement('button');
      b.type = 'button'; b.textContent = fmt(v);
      b.addEventListener('click', () => { $('#depositAmount').value = v; });
      quick.appendChild(b);
    });

    $('#genQrBtn').addEventListener('click', () => {
      const cfg = Store.db.config;
      const amount = parseInt($('#depositAmount').value, 10);
      if (!amount || amount < 10000) { toast('Số tiền nạp tối thiểu là 10.000đ.', 'error'); return; }
      const user = Store.currentUser();
      const note = `NAP${user.userId}${Date.now().toString().slice(-6)}`;
      const url = `https://img.vietqr.io/image/${encodeURIComponent(cfg.bankId)}-${cfg.bankAccountNo}-qr_only.png`
        + `?amount=${amount}&addInfo=${encodeURIComponent(note)}&accountName=${encodeURIComponent(cfg.bankAccountName)}`;
      $('#depositQrImg').src = url;
      setText('#qrBank', cfg.bankId);
      setText('#qrOwner', cfg.bankAccountName);
      setText('#qrAccount', cfg.bankAccountNo);
      setText('#qrAmount', fmt(amount));
      setText('#qrNote', note);
      $('#depositQrBox').hidden = false;
      $('#confirmDepositBtn').dataset.amount = amount;
      $('#confirmDepositBtn').dataset.note = note;
      $('#copyAccountBtn').onclick = () => {
        navigator.clipboard?.writeText(cfg.bankAccountNo).then(() => toast('Đã sao chép số tài khoản!', 'success'));
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
            Voice.speak('Bạn đã nạp tiền thành công. Số dư đã được cộng vào tài khoản.');
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
  function wireServiceModal() {
    $('#serviceModalBuyBtn').addEventListener('click', () => {
      const service = Store.db.services.find(s => s.id === currentServiceId);
      const errEl = $('#serviceModalError');
      errEl.textContent = '';
      if (!Store.currentUser()) { errEl.textContent = 'Vui lòng đăng nhập trước khi mua.'; return; }
      if (!currentPackage) { errEl.textContent = 'Vui lòng chọn một gói.'; return; }

      withLoading($('#serviceModalBuyBtn'), async () => {
        try {
          let order;
          if (Store.usesRealKeyStock(currentPackage)) {
            const password = $('#serviceModalPassword').value;
            if (!password) { errEl.textContent = 'Vui lòng nhập lại mật khẩu để xác nhận mua hàng.'; return; }
            order = await Store.redeemKeyOnServer(Store.currentUser().username, password, service, currentPackage);
          } else {
            order = Store.buyPackage(service, currentPackage);
          }
          closeModal('#serviceModal');
          toast(`Mua thành công! Key: ${order.key}`, 'success');
          Voice.speak(`Bạn đã mua thành công gói ${order.packageName} của ${order.serviceName}.`);
        } catch (err) { errEl.textContent = err.message; }
      });
    });
  }

  function openServiceModal(serviceId) {
    const service = Store.db.services.find(s => s.id === serviceId);
    if (!service) return;
    currentServiceId = serviceId;
    currentPackage = service.packages[0] || null;

    const modalImg = $('#serviceModalImg');
    const modalVideo = $('#serviceModalVideo');
    if (isVideoUrl(service.image)) {
      modalVideo.src = service.image;
      modalVideo.hidden = false;
      modalImg.hidden = true;
    } else {
      modalImg.src = service.image;
      modalImg.alt = service.name;
      modalImg.hidden = false;
      modalVideo.hidden = true;
    }
    const inStock = service.status === 'instock';
    $('#serviceModalBadge').textContent = inStock ? 'Còn hàng' : 'Hết hàng';
    $('#serviceModalBadge').className = 'badge' + (inStock ? '' : ' out');
    setText('#serviceModalTitle', service.name);
    setText('#serviceModalDesc', service.description);
    $('#serviceModalFeatures').innerHTML = (service.features || []).map(f => `<li>${esc(f)}</li>`).join('');

    const pkgWrap = $('#serviceModalPackages');
    pkgWrap.innerHTML = service.packages.map((p, i) => `
      <div class="package-option ${i === 0 ? 'selected' : ''}" data-pkg="${esc(p.id)}">
        <span>${esc(p.name)}</span>
        <span class="package-option-price">
          <strong>${fmt(p.price)}</strong>
          ${Store.usesRealKeyStock(p) ? `<small class="pkg-stock ${p.keyCount > 0 ? '' : 'out'}">${p.keyCount > 0 ? `Còn ${p.keyCount} key` : 'Hết key'}</small>` : ''}
        </span>
      </div>
    `).join('');
    pkgWrap.querySelectorAll('.package-option').forEach(el => {
      el.addEventListener('click', () => {
        pkgWrap.querySelectorAll('.package-option').forEach(o => o.classList.remove('selected'));
        el.classList.add('selected');
        currentPackage = service.packages.find(p => p.id === el.dataset.pkg);
        syncServiceModalPasswordField();
      });
    });

    syncServiceModalPasswordField();
    $('#serviceModalError').textContent = '';
    $('#serviceModalPassword').value = '';
    $('#serviceModalBuyBtn').disabled = !inStock;
    $('#serviceModalBuyBtn').textContent = inStock ? 'Mua Ngay' : 'Hết Hàng';
    openModal('#serviceModal');
  }

  function syncServiceModalPasswordField() {
    $('#serviceModalPasswordRow').hidden = !Store.usesRealKeyStock(currentPackage);
  }

  // ---- Đơn hàng của tôi ----
  function openOrdersModal() {
    if (!Store.currentUser()) { toast('Vui lòng đăng nhập.', 'error'); openModal('#authModal'); return; }
    const orders = Store.myOrders();
    $('#ordersList').innerHTML = orders.length ? orders.map(o => `
      <div class="order-item">
        <div class="row"><strong>${esc(o.serviceName)}</strong><span>${fmt(o.price)}</span></div>
        <div class="row muted"><span>${esc(o.packageName)}</span><span>${new Date(o.date).toLocaleString('vi-VN')}</span></div>
        <div class="key">${esc(o.key)} <button class="btn-copy-key" data-copy-key="${esc(o.key)}" title="Sao chép">📋</button></div>
      </div>
    `).join('') : `<p class="empty-note">Bạn chưa có đơn hàng nào.</p>`;
    $$('[data-copy-key]', $('#ordersList')).forEach(btn => {
      btn.addEventListener('click', () => {
        navigator.clipboard?.writeText(btn.dataset.copyKey).then(() => toast('Đã sao chép key!', 'success'));
      });
    });
    openModal('#ordersModal');
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
      { label: '💳 Nạp tiền', text: 'Cách nạp tiền' },
      { label: '🏷️ Giá sản phẩm', text: 'Giá sản phẩm' },
      { label: '💻 Thiết kế web', text: 'Dịch vụ thiết kế web' },
      { label: '📞 Liên hệ Admin', text: 'Liên hệ admin' }
    ];
    $('#aiQuickReplies').innerHTML = quick.map(q => `<button data-q="${esc(q.text)}">${q.label}</button>`).join('');
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
        Voice.speak(cfg.aiGreeting);
      }
    });
    $('#aiClose').addEventListener('click', () => { $('#aiPanel').hidden = true; });

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
    setTimeout(() => { addAiMessage(reply, 'bot'); Voice.speak(reply); }, 350);
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
    { keys: ['zolo'], text: '🤖 PUBG ANDROID — ZOLO\n💰 500K/Tháng\n💰 250K/Tuần' },
    { keys: ['vnb'], text: '🤖 PUBG ANDROID — VNB\n💰 500K/Tháng\n💰 250K/Tuần' },
    { keys: ['root'], text: '🤖 PUBG ANDROID — ROOT\n💰 650K/Tháng' },
    { keys: ['mg'], text: '🤖 PUBG ANDROID — MG\n💰 500K/Tháng\n💰 250K/Tuần' },
    { keys: ['liên quân', 'lien quan'], text: '⚔️ LIÊN QUÂN\n💰 250K/Tháng\n💰 120K/Tuần\n💰 500K/Tháng chống tố\n💰 250K/Tuần chống tố' },
    { keys: ['free fire', 'freefire'], text: '🔥 FREE FIRE\n💰 550K/Tháng\n💰 250K/Tuần' },
    { keys: ['pubg ios', 'ios'], text: '📱 PUBG IOS\n\n💎 VNHAX: 600K/Tháng - 300K/Tuần\n💎 VNHAX MOD SKIN VN: 450K/Tháng - 225K/Tuần\n💎 OASIS VIP: 800K/Tháng - 400K/Tuần\n💎 KING: 900K/Tháng - 450K/Tuần\n💎 TIMO VIP: 500K/Tháng - 250K/Tuần - 50K/Ngày\n💎 VINGODL: 550K/Tháng - 250K/Tuần' },
    { keys: ['pubg android', 'android'], text: '🤖 PUBG ANDROID\n\n💰 ZOLO: 500K/Tháng - 250K/Tuần\n💰 MG: 500K/Tháng - 250K/Tuần\n💰 VNB: 500K/Tháng - 250K/Tuần\n💰 ROOT: 650K/Tháng' }
  ];

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
    if (/nạp tiền|nap tien|vietqr|qr/.test(t)) return cfg.aiResponseDeposit;
    const specificPrice = matchPriceItem(t);
    if (specificPrice) return specificPrice;
    if (/giá|gia|bảng giá|bang gia|price/.test(t)) return cfg.aiResponsePrice;
    if (/thiết kế web|thiet ke web|landing|web shop/.test(t)) return cfg.aiResponseWeb;
    if (/sản phẩm|san pham|pubg|liên quân|lien quan|free fire|tốc chiến|toc chien/.test(t)) return cfg.aiResponseProduct;
    if (/admin|liên hệ|lien he|zalo|hotline/.test(t)) return cfg.aiResponseContact;
    if (/cảm ơn|cam on|thanks/.test(t)) return cfg.aiResponseThanks;
    if (/chào|hello|hi\b|xin chào/.test(t)) return cfg.aiResponseGreeting;
    return cfg.aiResponseFallback;
  }

  // ============================================================
  // ADMIN DASHBOARD
  // ============================================================
  function openAdminModal() {
    if (!Store.isAdmin()) { toast('Bạn không có quyền truy cập.', 'error'); return; }
    adminActiveTab = 'overview';
    $$('.admin-tab').forEach(t => t.classList.toggle('active', t.dataset.adminTab === 'overview'));
    renderAdminTab('overview');
    $('#adminSyncMsg').textContent = '';
    openModal('#adminModal');
  }

  function wireAdminModal() {
    $('#adminTabs').addEventListener('click', (e) => {
      const btn = e.target.closest('.admin-tab');
      if (!btn) return;
      adminActiveTab = btn.dataset.adminTab;
      $$('.admin-tab', $('#adminTabs')).forEach(t => t.classList.toggle('active', t === btn));
      renderAdminTab(adminActiveTab);
    });

    $('#adminSyncBtn').addEventListener('click', () => {
      withLoading($('#adminSyncBtn'), async () => {
        const user = Store.currentUser();
        const pass = $('#adminSyncPass').value;
        if (!pass) { $('#adminSyncMsg').textContent = 'Vui lòng nhập mật khẩu admin.'; return; }
        const result = await Store.trySaveToServer(user.username, pass);
        $('#adminSyncMsg').textContent = result.message || (result.status === 'success' ? 'Đã đồng bộ thành công!' : 'Đồng bộ thất bại.');
        if (result.status === 'success') $('#adminSyncPass').value = '';
      });
    });

    // Ủy quyền sự kiện cho toàn bộ nội dung động bên trong bảng quản trị.
    $('#adminPanelBody').addEventListener('click', onAdminPanelClick);
    $('#adminPanelBody').addEventListener('submit', onAdminPanelSubmit);
  }

  function renderAdminTab(tab) {
    const body = $('#adminPanelBody');
    if (tab === 'overview') body.innerHTML = adminOverviewHtml();
    else if (tab === 'services') body.innerHTML = adminServicesHtml();
    else if (tab === 'categories') body.innerHTML = adminCategoriesHtml();
    else if (tab === 'orders') body.innerHTML = adminOrdersHtml();
    else if (tab === 'users') body.innerHTML = adminUsersHtml();
    else if (tab === 'media') body.innerHTML = adminMediaHtml();
    else if (tab === 'config') { body.innerHTML = adminConfigHtml(); wireAdminConfigSecretBoxes(); }
  }

  function wireAdminConfigSecretBoxes() {
    $('#bankWebhookUrl').value = `${location.origin}${location.pathname.replace(/[^/]*$/, '')}bank_callback.php`;
    $('#copyWebhookUrlBtn').addEventListener('click', () => {
      navigator.clipboard?.writeText($('#bankWebhookUrl').value).then(() => toast('Đã sao chép URL webhook!', 'success'));
    });

    const user = Store.currentUser();
    Store.secretsStatus(user.username, $('#adminSyncPass').value || '').then(res => {
      if (res.status !== 'success') {
        $('#bankTokenStatus').textContent = '⚠️ Nhập mật khẩu admin ở thanh dưới cùng rồi mở lại tab này để xem trạng thái.';
        $('#ttsKeyStatus').textContent = '⚠️ Nhập mật khẩu admin ở thanh dưới cùng rồi mở lại tab này để xem trạng thái.';
        return;
      }
      $('#bankTokenStatus').innerHTML = res.bankTokenConfigured ? '✅ Đã cấu hình token webhook.' : '⚠️ Chưa cấu hình — webhook sẽ từ chối mọi giao dịch thật cho tới khi lưu token.';
      $('#ttsKeyStatus').innerHTML = res.ttsApiKeyConfigured ? '✅ Đã cấu hình API key — giọng nói dùng Google Cloud TTS thật.' : 'ℹ️ Chưa cấu hình — trang đang dùng giọng trình duyệt để dự phòng.';
    }).catch(() => {
      $('#bankTokenStatus').textContent = 'Không kiểm tra được trạng thái (cần mật khẩu admin ở thanh dưới cùng).';
      $('#ttsKeyStatus').textContent = 'Không kiểm tra được trạng thái (cần mật khẩu admin ở thanh dưới cùng).';
    });

    $('#saveBankTokenBtn').addEventListener('click', () => {
      const token = $('#bankTokenInput').value.trim();
      const pass = $('#adminSyncPass').value;
      if (!token) { toast('Vui lòng nhập token trước khi lưu.', 'error'); return; }
      if (!pass) { toast('Vui lòng nhập mật khẩu admin ở thanh dưới cùng của bảng quản trị.', 'error'); return; }
      withLoading($('#saveBankTokenBtn'), async () => {
        const res = await Store.saveSecrets(user.username, pass, { bankToken: token });
        toast(res.message || (res.status === 'success' ? 'Đã lưu.' : 'Lưu thất bại.'), res.status === 'success' ? 'success' : 'error');
        if (res.status === 'success') { $('#bankTokenInput').value = ''; renderAdminTab('config'); }
      });
    });

    $('#saveTtsKeyBtn').addEventListener('click', () => {
      const key = $('#ttsApiKeyInput').value.trim();
      const pass = $('#adminSyncPass').value;
      if (!key) { toast('Vui lòng nhập API key trước khi lưu.', 'error'); return; }
      if (!pass) { toast('Vui lòng nhập mật khẩu admin ở thanh dưới cùng của bảng quản trị.', 'error'); return; }
      withLoading($('#saveTtsKeyBtn'), async () => {
        const res = await Store.saveSecrets(user.username, pass, { ttsApiKey: key });
        toast(res.message || (res.status === 'success' ? 'Đã lưu.' : 'Lưu thất bại.'), res.status === 'success' ? 'success' : 'error');
        if (res.status === 'success') { $('#ttsApiKeyInput').value = ''; renderAdminTab('config'); }
      });
    });
  }

  function adminOverviewHtml() {
    const db = Store.db;
    const revenue = db.orders.reduce((sum, o) => sum + (o.price || 0), 0);
    const totalBalance = db.users.reduce((sum, u) => sum + (u.balance || 0), 0);
    const stats = [
      { label: 'Người dùng', value: db.users.length },
      { label: 'Đơn hàng', value: db.orders.length },
      { label: 'Doanh thu', value: fmt(revenue) },
      { label: 'Tổng số dư ví', value: fmt(totalBalance) }
    ];
    const recent = db.orders.slice(0, 5);
    return `
      <div class="admin-stat-grid">
        ${stats.map(s => `<div class="admin-stat-card"><strong>${s.value}</strong><span>${s.label}</span></div>`).join('')}
      </div>
      <h4 class="admin-section-title">Đơn hàng gần đây</h4>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead><tr><th>Dịch vụ</th><th>Gói</th><th>Giá</th><th>Thời gian</th></tr></thead>
          <tbody>
            ${recent.length ? recent.map(o => `
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
    const editTarget = editing && editing !== 'new' ? services.find(s => s.id === editing) : null;
    let formHtml = '';
    if (editing) {
      const s = editTarget || { id: '', name: '', categoryId: categories[0]?.id || '', description: '', image: '', status: 'instock', features: [], packages: [{ name: '1 Ngày', price: 0 }] };
      formHtml = `
        <form class="admin-form" data-admin-form="service">
          <input type="hidden" name="_originalId" value="${esc(s.id)}">
          <label>Mã dịch vụ (id, không dấu) <input name="id" value="${esc(s.id)}" ${editTarget ? 'readonly' : ''} required></label>
          <label>Danh mục
            <select name="categoryId">${categories.map(c => `<option value="${esc(c.id)}" ${c.id === s.categoryId ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select>
          </label>
          <label class="span-2">Tên dịch vụ <input name="name" value="${esc(s.name)}" required></label>
          <label class="span-2">Mô tả <textarea name="description">${esc(s.description)}</textarea></label>
          <label class="span-2">URL ảnh hoặc video (.mp4/.webm/.ogg) <input name="image" value="${esc(s.image)}" placeholder="Lấy từ tab Thư viện"></label>
          <label>Trạng thái
            <select name="status">
              <option value="instock" ${s.status === 'instock' ? 'selected' : ''}>Còn hàng</option>
              <option value="outofstock" ${s.status === 'outofstock' ? 'selected' : ''}>Hết hàng</option>
            </select>
          </label>
          <label class="span-2">Tính năng (mỗi dòng một mục) <textarea name="features">${esc((s.features || []).join('\n'))}</textarea></label>
          <div class="admin-pkg-rows" id="adminPkgRows">
            ${(s.packages || []).map(p => adminPkgRowHtml(p)).join('')}
          </div>
          <div class="admin-form-actions">
            <button type="button" class="btn btn-glass btn-sm" id="adminAddPkgRow">+ Thêm gói</button>
            <button type="submit" class="btn btn-primary btn-sm">💾 Lưu dịch vụ</button>
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
          <thead><tr><th>Tên</th><th>Danh mục</th><th>Giá từ</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
          <tbody>
            ${services.map(s => `
              <tr>
                <td>${esc(s.name)}</td>
                <td>${esc(categories.find(c => c.id === s.categoryId)?.name || s.categoryId)}</td>
                <td>${fmt(Math.min(...(s.packages || [{ price: 0 }]).map(p => p.price)))}</td>
                <td>${s.status === 'instock' ? 'Còn hàng' : 'Hết hàng'}</td>
                <td class="admin-row-actions">
                  <button data-admin-edit-service="${esc(s.id)}">Sửa</button>
                  <button class="danger" data-admin-delete-service="${esc(s.id)}">Xóa</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function adminPkgRowHtml(p) {
    const keys = p.keys || [];
    return `
      <div class="admin-pkg-row" data-pkg-id="${esc(p.id || '')}">
        <div class="admin-pkg-row-main">
          <input placeholder="Tên gói (VD: 7 Ngày)" data-pkg-name value="${esc(p.name)}">
          <input type="number" min="0" step="1000" placeholder="Giá (đ)" data-pkg-price value="${p.price}">
          <button type="button" class="btn btn-glass btn-sm" data-pkg-keys-toggle>🔑 Kho key (<span data-pkg-key-count>${keys.length}</span>)</button>
          <button type="button" class="btn btn-ghost btn-sm" data-remove-pkg-row>✕</button>
        </div>
        <div class="admin-pkg-keys-panel" data-pkg-keys-panel hidden>
          <p class="muted" style="font-size:.75rem;margin:0 0 6px;">Mỗi dòng là 1 key. Khi khách mua gói này, hệ thống tự rút đúng 1 key ở đây và xóa khỏi kho.</p>
          <ul class="admin-pkg-key-list" data-pkg-key-list>${pkgKeyListItems(keys)}</ul>
          <textarea class="pkg-keys-input" data-pkg-keys-input placeholder="Dán nhiều key, mỗi dòng 1 key rồi bấm Thêm key"></textarea>
          <div class="admin-pkg-keys-actions">
            <button type="button" class="btn btn-glass btn-sm" data-add-pkg-keys>+ Thêm key</button>
            <button type="button" class="btn btn-ghost btn-sm danger" data-clear-pkg-keys>🗑️ Xóa hết key</button>
          </div>
        </div>
        <textarea data-pkg-keys-data hidden>${esc(keys.join('\n'))}</textarea>
      </div>
    `;
  }

  function pkgKeyListItems(keys) {
    return keys.length
      ? keys.map((k, i) => `<li><span>${esc(k)}</span><button type="button" data-remove-pkg-key="${i}" title="Xóa key này">✕</button></li>`).join('')
      : '<li class="empty-note">Chưa có key nào trong kho.</li>';
  }

  function refreshPkgKeyList(row, keys) {
    row.querySelector('[data-pkg-key-count]').textContent = keys.length;
    row.querySelector('[data-pkg-key-list]').innerHTML = pkgKeyListItems(keys);
  }

  function adminCategoriesHtml() {
    const categories = Store.db.categories;
    const editing = adminCategoryEditing;
    const editTarget = editing && editing !== 'new' ? categories.find(c => c.id === editing) : null;
    let formHtml = '';
    if (editing) {
      const c = editTarget || { id: '', name: '', icon: '📁', description: '', image: '' };
      formHtml = `
        <form class="admin-form" data-admin-form="category">
          <label>Mã danh mục (id) <input name="id" value="${esc(c.id)}" ${editTarget ? 'readonly' : ''} required></label>
          <label>Icon (emoji) <input name="icon" value="${esc(c.icon)}"></label>
          <label class="span-2">Tên danh mục <input name="name" value="${esc(c.name)}" required></label>
          <label class="span-2">Mô tả <input name="description" value="${esc(c.description)}"></label>
          <label class="span-2">URL ảnh hoặc video (.mp4/.webm/.ogg) <input name="image" value="${esc(c.image)}" placeholder="Lấy từ tab Thư viện"></label>
          <div class="admin-form-actions">
            <button type="submit" class="btn btn-primary btn-sm">💾 Lưu danh mục</button>
            <button type="button" class="btn btn-ghost btn-sm" data-admin-cancel-category>Hủy</button>
          </div>
        </form>
      `;
    }
    return `
      <div class="admin-toolbar">
        <button class="btn btn-primary btn-sm" data-admin-new-category>+ Thêm danh mục</button>
      </div>
      ${formHtml}
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead><tr><th>Icon</th><th>Tên</th><th>Mô tả</th><th>Thao tác</th></tr></thead>
          <tbody>
            ${categories.map(c => `
              <tr>
                <td>${c.icon}</td>
                <td>${esc(c.name)}</td>
                <td>${esc(c.description)}</td>
                <td class="admin-row-actions">
                  <button data-admin-edit-category="${esc(c.id)}">Sửa</button>
                  <button class="danger" data-admin-delete-category="${esc(c.id)}">Xóa</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function adminOrdersHtml() {
    const orders = Store.db.orders;
    return `
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead><tr><th>Mã đơn</th><th>Người dùng</th><th>Dịch vụ</th><th>Gói</th><th>Giá</th><th>Key</th><th>Thời gian</th></tr></thead>
          <tbody>
            ${orders.length ? orders.map(o => {
              const user = Store.db.users.find(u => u.userId === o.userId);
              return `<tr>
                <td>${esc(o.id)}</td><td>${esc(user?.username || o.userId)}</td><td>${esc(o.serviceName)}</td>
                <td>${esc(o.packageName)}</td><td>${fmt(o.price)}</td><td>${esc(o.key)}</td>
                <td>${new Date(o.date).toLocaleString('vi-VN')}</td>
              </tr>`;
            }).join('') : '<tr><td colspan="7">Chưa có đơn hàng nào.</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  }

  function adminUsersHtml() {
    const users = Store.db.users;
    return `
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead><tr><th>Tên đăng nhập</th><th>Vai trò</th><th>Số dư</th><th>Trạng thái</th><th>Ngày tạo</th><th>Thao tác</th></tr></thead>
          <tbody>
            ${users.map(u => `
              <tr>
                <td>${esc(u.username)}</td>
                <td>${u.role === 'admin' ? 'Admin' : 'Thành viên'}</td>
                <td>${fmt(u.balance || 0)}</td>
                <td>${u.status === 'banned' ? 'Đã khóa' : 'Hoạt động'}</td>
                <td>${esc(u.createdAt || '')}</td>
                <td class="admin-row-actions">
                  <button data-admin-adjust-balance="${esc(u.userId)}" data-delta="10000">+10k</button>
                  <button data-admin-adjust-balance="${esc(u.userId)}" data-delta="-10000">-10k</button>
                  ${u.role !== 'admin' ? `<button class="danger" data-admin-toggle-status="${esc(u.userId)}" data-status="${u.status === 'banned' ? 'active' : 'banned'}">${u.status === 'banned' ? 'Mở khóa' : 'Khóa'}</button>` : ''}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function adminConfigHtml() {
    const c = Store.db.config;
    return `
      <form class="admin-form" data-admin-form="config">
        <div class="admin-form-section">🏷️ Thương hiệu &amp; Logo</div>
        <label>Chữ logo (logoText) <input name="logoText" value="${esc(c.logoText)}"></label>
        <label>Dòng phụ (logoSubtext) <input name="logoSubtext" value="${esc(c.logoSubtext)}"></label>
        <label class="span-2">Ảnh logo (logoUrl — để trống dùng icon mặc định)
          <input name="logoUrl" value="${esc(c.logoUrl || '')}" placeholder="Dán URL ảnh (PNG/GIF/WEBP/SVG) — lấy từ tab Thư viện">
        </label>
        <label>Font chữ logo
          <select name="logoFont">
            ${LOGO_FONTS.map(f => `<option value="${esc(f)}" ${c.logoFont === f ? 'selected' : ''} style="font-family:'${esc(f)}'">${esc(f)}</option>`).join('')}
          </select>
        </label>
        <label>Màu chữ logo <input type="color" name="logoColor" value="${esc(c.logoColor || '#f3f4f6')}"></label>
        <label>Hiệu ứng chạy màu chữ logo
          <select name="logoColorMode">
            <option value="solid" ${c.logoColorMode === 'solid' ? 'selected' : ''}>Tắt (dùng màu ở trên)</option>
            <option value="rainbow" ${c.logoColorMode === 'rainbow' ? 'selected' : ''}>🌈 Cầu vồng 7 màu (chạy liên tục)</option>
            <option value="shine" ${c.logoColorMode === 'shine' ? 'selected' : ''}>✨ Ánh kim lấp lánh</option>
          </select>
        </label>
        <label>Tốc độ chạy màu (giây/vòng)
          <input type="number" name="logoAnimSpeed" min="1" max="20" step="0.5" value="${c.logoAnimSpeed || 6}">
        </label>

        <div class="admin-form-section">🎨 Màu chủ đạo toàn trang</div>
        <label>Màu chủ đạo (nút, giá, điểm nhấn) <input type="color" name="accentColor" value="${esc(c.accentColor || '#ffb703')}"></label>

        <div class="admin-form-section">🖼️ Banner / Hero</div>
        <label class="span-2">Nhãn nhỏ trên tiêu đề (bannerTagText) <input name="bannerTagText" value="${esc(c.bannerTagText || '')}"></label>
        <label>Nút 1 (bannerBtn1Text) <input name="bannerBtn1Text" value="${esc(c.bannerBtn1Text || '')}"></label>
        <label>Nút 2 (bannerBtn2Text) <input name="bannerBtn2Text" value="${esc(c.bannerBtn2Text || '')}"></label>
        <label class="span-2">Ảnh/Video nền Hero (bgUrl)
          <input name="bgUrl" value="${esc(c.bgUrl || '')}" placeholder="Dán URL ảnh (PNG/JPEG/GIF/WEBP) hoặc video (.mp4/.webm/.ogg) — lấy từ tab Thư viện">
        </label>

        <div class="admin-form-section">📞 Liên hệ &amp; Giới thiệu</div>
        <label class="span-2">Tên website (siteTitle) <input name="siteTitle" value="${esc(c.siteTitle)}"></label>
        <label class="span-2">Mô tả ngắn (siteSubtitle) <textarea name="siteSubtitle">${esc(c.siteSubtitle)}</textarea></label>
        <label>Tên Admin hiển thị (contactAdminName) <input name="contactAdminName" value="${esc(c.contactAdminName || '')}"></label>
        <label>Chức danh (contactAdminSub) <input name="contactAdminSub" value="${esc(c.contactAdminSub || '')}"></label>
        <label class="span-2">Giới thiệu (contactAdminDesc) <textarea name="contactAdminDesc">${esc(c.contactAdminDesc || '')}</textarea></label>
        <label>Hotline <input name="hotline" value="${esc(c.hotline)}"></label>
        <label>Link Zalo <input name="zaloLink" value="${esc(c.zaloLink)}"></label>

        <div class="admin-form-section">📇 Kênh liên hệ (chọn nhiều — tự gộp thành 1 nút danh sách)</div>
        ${(c.contactChannels || []).map(ch => `
          <label class="span-2 contact-channel-row">
            <span class="contact-channel-toggle">
              <input type="checkbox" name="contact_${esc(ch.id)}_enabled" ${ch.enabled ? 'checked' : ''}>
              ${ch.icon} ${esc(ch.label)}
            </span>
            <input name="contact_${esc(ch.id)}_url" value="${esc(ch.url || '')}" placeholder="${ch.id === 'phone' ? 'tel:0387332523' : ch.id === 'email' ? 'mailto:ban@kenios.store' : 'https://...'}">
          </label>
        `).join('')}
        <p class="muted" style="grid-column:1/-1;font-size:.78rem;margin:0;">
          Chỉ 1 kênh được bật → hiện thẳng 1 nút. Bật từ 2 kênh trở lên → tự động gộp thành 1 nút "Liên hệ" duy nhất, bấm vào sẽ mở danh sách tất cả các kênh — áp dụng đồng nhất ở header, footer và popup chào mừng.
        </p>

        <div class="admin-form-section">🔑 Đăng nhập bằng Google</div>
        <label class="span-2">Google Client ID
          <input name="googleClientId" value="${esc(c.googleClientId || '')}" placeholder="xxxxxxxx.apps.googleusercontent.com">
        </label>
        <p class="muted" style="grid-column:1/-1;font-size:.78rem;margin:0;">
          Lấy Client ID miễn phí tại
          <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener" style="color:var(--gold-soft);">Google Cloud Console</a>
          (tạo OAuth Client ID loại "Web application", thêm domain của bạn vào "Authorized JavaScript origins").
          Để trống thì nút đăng nhập Google sẽ ẩn.
        </p>

        <div class="admin-form-section">🏦 Ngân hàng (VietQR) &amp; Giao dịch tự động</div>
        <label>Ngân hàng
          <select name="bankId">
            ${BANK_OPTIONS.concat(BANK_OPTIONS.includes(c.bankId) ? [] : [c.bankId]).filter(Boolean).map(b => `<option value="${esc(b)}" ${c.bankId === b ? 'selected' : ''}>${esc(b)}</option>`).join('')}
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
              <button type="button" class="pw-toggle-btn" id="copyWebhookUrlBtn" title="Sao chép">📋</button>
            </span>
          </label>
          <button type="button" class="btn btn-glass btn-sm" id="saveBankTokenBtn">🔒 Lưu Token Webhook</button>
          <p class="muted" style="font-size:.75rem;margin:6px 0 0;">Token được lưu riêng ở máy chủ (secrets.php), không hiển thị lại và không gửi cho khách truy cập trang.</p>
        </div>

        <div class="admin-form-section">🔊 Giọng nói Google Cloud TTS (chạy được trên mọi trình duyệt, kể cả Safari/iPhone)</div>
        <div class="secret-box span-2" id="ttsKeyBox">
          <div class="secret-status" id="ttsKeyStatus">Đang kiểm tra trạng thái…</div>
          <label>Google Cloud Text-to-Speech API Key
            <input type="password" id="ttsApiKeyInput" placeholder="Để trống nếu giữ nguyên API key hiện tại" autocomplete="new-password">
          </label>
          <button type="button" class="btn btn-glass btn-sm" id="saveTtsKeyBtn">🔒 Lưu API Key</button>
          <p class="muted" style="font-size:.75rem;margin:6px 0 0;">
            Lấy API key miễn phí tại <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener" style="color:var(--gold-soft);">Google Cloud Console</a> (bật API "Cloud Text-to-Speech"). Chưa cấu hình thì trang sẽ tự dùng giọng trình duyệt để dự phòng. Khóa được lưu riêng ở máy chủ, không hiển thị lại và không gửi cho khách truy cập trang.
          </p>
        </div>

        <div class="admin-form-section">📣 Thông báo Popup khi vào Web</div>
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

        <div class="admin-form-section">🔊 Lời chào giọng nói (Google) khi vào Web</div>
        <label>Bật lời chào giọng nói
          <select name="welcomeVoiceEnabled">
            <option value="1" ${c.welcomeVoiceEnabled ? 'selected' : ''}>Bật</option>
            <option value="0" ${!c.welcomeVoiceEnabled ? 'selected' : ''}>Tắt</option>
          </select>
        </label>
        <label class="span-2">Nội dung đọc bằng giọng Google
          <textarea name="welcomeVoiceText">${esc(c.welcomeVoiceText || '')}</textarea>
        </label>
        <p class="muted" style="grid-column:1/-1;font-size:.78rem;margin:0;">
          Chỉ đọc to bằng giọng nữ Google (nếu trình duyệt hỗ trợ), <b>không hiện popup nào</b> — độc lập hoàn toàn với thông báo popup ở trên. Có thể bật riêng 1 trong 2, cả 2, hoặc tắt cả 2.
        </p>

        <div class="admin-form-section">📢 Chữ chạy</div>
        <label class="span-2">Chữ chạy (marqueeText) <input name="marqueeText" value="${esc(c.marqueeText)}"></label>
        <label>Tốc độ chạy (giây/vòng, càng nhỏ càng nhanh)
          <input type="number" name="marqueeSpeed" min="6" max="60" step="1" value="${c.marqueeSpeed || 26}">
        </label>

        <div class="admin-form-section">🤖 Trợ lý ảo AI</div>
        <label>Giọng nói trợ lý (TTS)
          <select name="ttsEnabled">
            <option value="1" ${c.ttsEnabled ? 'selected' : ''}>Bật</option>
            <option value="0" ${!c.ttsEnabled ? 'selected' : ''}>Tắt</option>
          </select>
        </label>
        <label>Tên trợ lý (aiName) <input name="aiName" value="${esc(c.aiName || '')}"></label>
        <label class="span-2">Lời chào đầu tiên (aiGreeting) <textarea name="aiGreeting">${esc(c.aiGreeting || '')}</textarea></label>
        <label class="span-2">Trả lời khi chào hỏi (aiResponseGreeting) <textarea name="aiResponseGreeting">${esc(c.aiResponseGreeting || '')}</textarea></label>
        <label class="span-2">Trả lời về nạp tiền (aiResponseDeposit) <textarea name="aiResponseDeposit">${esc(c.aiResponseDeposit || '')}</textarea></label>
        <label class="span-2">Trả lời về sản phẩm (aiResponseProduct) <textarea name="aiResponseProduct">${esc(c.aiResponseProduct || '')}</textarea></label>
        <label class="span-2">Trả lời về thiết kế web (aiResponseWeb) <textarea name="aiResponseWeb">${esc(c.aiResponseWeb || '')}</textarea></label>
        <label class="span-2">Trả lời về bảng giá (aiResponsePrice) <textarea name="aiResponsePrice">${esc(c.aiResponsePrice || '')}</textarea></label>
        <label class="span-2">Trả lời về liên hệ (aiResponseContact) <textarea name="aiResponseContact">${esc(c.aiResponseContact || '')}</textarea></label>
        <label class="span-2">Trả lời khi cảm ơn (aiResponseThanks) <textarea name="aiResponseThanks">${esc(c.aiResponseThanks || '')}</textarea></label>
        <label class="span-2">Trả lời mặc định khi không hiểu (aiResponseFallback) <textarea name="aiResponseFallback">${esc(c.aiResponseFallback || '')}</textarea></label>

        <div class="admin-form-actions">
          <button type="submit" class="btn btn-primary btn-sm">💾 Lưu cấu hình</button>
        </div>
      </form>
    `;
  }

  function adminMediaHtml() {
    const media = Store.db.media || [];
    return `
      <div class="media-upload-row">
        <input type="file" id="adminMediaFile" accept="image/*,video/mp4,video/webm,video/ogg">
        <button type="button" class="btn btn-primary btn-sm" id="adminUploadBtn">⬆️ Tải lên</button>
        <span class="muted" style="font-size:.8rem;">Ảnh hoặc video tối đa 500MB. Chỉ hoạt động khi có máy chủ PHP (cần hosting cho phép upload lớn — xem file .user.ini).</span>
      </div>
      <div class="media-grid">
        ${media.length ? media.map(m => `
          <div class="media-card">
            <div class="media-preview">
              ${m.type === 'video'
                ? `<video src="${esc(m.url)}" muted></video>`
                : `<img src="${esc(m.url)}" alt="">`}
            </div>
            <div class="media-info">
              <strong style="font-size:.78rem;">${esc(m.name || '')}</strong>
              <span class="media-url">${esc(m.url)}</span>
              <div class="media-actions">
                <button type="button" data-admin-copy-media="${esc(m.url)}">📋 Sao chép</button>
                <button type="button" class="danger" data-admin-delete-media="${esc(m.id)}">Xóa</button>
              </div>
            </div>
          </div>
        `).join('') : '<p class="empty-note">Chưa có ảnh/video nào. Tải lên để lấy link sử dụng cho ảnh sản phẩm, danh mục hoặc nền Hero.</p>'}
      </div>
    `;
  }

  function onAdminPanelClick(e) {
    const newService = e.target.closest('[data-admin-new-service]');
    if (newService) { adminServiceEditing = 'new'; renderAdminTab('services'); return; }

    const editService = e.target.closest('[data-admin-edit-service]');
    if (editService) { adminServiceEditing = editService.dataset.adminEditService; renderAdminTab('services'); return; }

    const cancelService = e.target.closest('[data-admin-cancel-service]');
    if (cancelService) { adminServiceEditing = null; renderAdminTab('services'); return; }

    const deleteService = e.target.closest('[data-admin-delete-service]');
    if (deleteService) {
      if (confirm('Xóa dịch vụ này? Hành động không thể hoàn tác.')) {
        Store.adminDeleteService(deleteService.dataset.adminDeleteService);
        renderAdminTab('services');
        toast('Đã xóa dịch vụ.', 'success');
      }
      return;
    }

    const addPkgRow = e.target.closest('#adminAddPkgRow');
    if (addPkgRow) {
      $('#adminPkgRows').insertAdjacentHTML('beforeend', adminPkgRowHtml({ name: '', price: 0 }));
      return;
    }
    const removePkgRow = e.target.closest('[data-remove-pkg-row]');
    if (removePkgRow) { removePkgRow.closest('.admin-pkg-row').remove(); return; }

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
      const keys = dataEl.value.split('\n').map(k => k.trim()).filter(Boolean);
      keys.splice(parseInt(removePkgKey.dataset.removePkgKey, 10), 1);
      dataEl.value = keys.join('\n');
      refreshPkgKeyList(row, keys);
      return;
    }
    const addPkgKeys = e.target.closest('[data-add-pkg-keys]');
    if (addPkgKeys) {
      const row = addPkgKeys.closest('.admin-pkg-row');
      const input = row.querySelector('[data-pkg-keys-input]');
      const newKeys = input.value.split('\n').map(k => k.trim()).filter(Boolean);
      if (!newKeys.length) return;
      const dataEl = row.querySelector('[data-pkg-keys-data]');
      const keys = dataEl.value.split('\n').map(k => k.trim()).filter(Boolean).concat(newKeys);
      dataEl.value = keys.join('\n');
      input.value = '';
      refreshPkgKeyList(row, keys);
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
    const loadKeysBtn = e.target.closest('#adminLoadKeysBtn');
    if (loadKeysBtn) {
      const user = Store.currentUser();
      const pass = $('#adminSyncPass').value;
      if (!pass) { $('#adminSyncMsg').textContent = 'Vui lòng nhập mật khẩu admin ở ô bên cạnh trước.'; return; }
      withLoading(loadKeysBtn, async () => {
        try {
          await Store.fetchFullServiceKeys(user.username, pass);
          renderAdminTab('services');
          toast('Đã tải kho key đầy đủ từ máy chủ.', 'success');
        } catch (err) {
          $('#adminSyncMsg').textContent = err.message;
        }
      });
      return;
    }

    const newCategory = e.target.closest('[data-admin-new-category]');
    if (newCategory) { adminCategoryEditing = 'new'; renderAdminTab('categories'); return; }

    const editCategory = e.target.closest('[data-admin-edit-category]');
    if (editCategory) { adminCategoryEditing = editCategory.dataset.adminEditCategory; renderAdminTab('categories'); return; }

    const cancelCategory = e.target.closest('[data-admin-cancel-category]');
    if (cancelCategory) { adminCategoryEditing = null; renderAdminTab('categories'); return; }

    const deleteCategory = e.target.closest('[data-admin-delete-category]');
    if (deleteCategory) {
      try {
        Store.adminDeleteCategory(deleteCategory.dataset.adminDeleteCategory);
        renderAdminTab('categories');
        toast('Đã xóa danh mục.', 'success');
      } catch (err) { toast(err.message, 'error'); }
      return;
    }

    const adjustBalance = e.target.closest('[data-admin-adjust-balance]');
    if (adjustBalance) {
      Store.adminAdjustBalance(adjustBalance.dataset.adminAdjustBalance, parseInt(adjustBalance.dataset.delta, 10));
      renderAdminTab('users');
      toast('Đã cập nhật số dư.', 'success');
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
      if (!file) { toast('Vui lòng chọn một file trước.', 'error'); return; }
      withLoading(uploadBtn, async () => {
        try {
          const url = await Store.uploadFile(file);
          const type = /\.(mp4|webm|ogg)$/i.test(url) ? 'video' : 'image';
          Store.adminAddMedia({ id: 'media-' + Date.now(), url, type, name: file.name, date: new Date().toISOString() });
          renderAdminTab('media');
          toast('Tải lên thành công!', 'success');
        } catch (err) { toast(err.message, 'error'); }
      });
      return;
    }

    const copyMedia = e.target.closest('[data-admin-copy-media]');
    if (copyMedia) {
      navigator.clipboard?.writeText(copyMedia.dataset.adminCopyMedia).then(() => toast('Đã sao chép link!', 'success'));
      return;
    }

    const deleteMedia = e.target.closest('[data-admin-delete-media]');
    if (deleteMedia) {
      if (confirm('Xóa file này khỏi thư viện?')) {
        Store.adminDeleteMedia(deleteMedia.dataset.adminDeleteMedia);
        renderAdminTab('media');
        toast('Đã xóa file.', 'success');
      }
      return;
    }
  }

  function onAdminPanelSubmit(e) {
    const formType = e.target.dataset.adminForm;
    if (!formType) return;
    e.preventDefault();
    const fd = new FormData(e.target);

    if (formType === 'service') {
      const id = fd.get('id').trim();
      if (!id) { toast('Vui lòng nhập mã dịch vụ.', 'error'); return; }
      // Giữ nguyên id gói cũ (không sinh lại mỗi lần lưu) và chỉ gửi lại field `keys`
      // khi thực sự biết rõ nội dung kho key hiện tại (đã gõ thêm, hoặc phiên này đã
      // tải đủ kho key từ máy chủ) — tránh trường hợp sửa giá/tên mà vô tình gửi kho
      // key rỗng đè lên kho key thật trên máy chủ khi chưa bấm "Tải kho key đầy đủ".
      const originalService = Store.db.services.find(s => s.id === id);
      const packages = $$('.admin-pkg-row', e.target).map((row, i) => {
        const name = row.querySelector('[data-pkg-name]').value.trim();
        const price = parseInt(row.querySelector('[data-pkg-price]').value, 10) || 0;
        const keys = row.querySelector('[data-pkg-keys-data]').value.split('\n').map(k => k.trim()).filter(Boolean);
        const pkgId = row.dataset.pkgId;
        const pkg = { id: pkgId || `pkg-${id}-${i}-${Date.now().toString(36)}`, name, price };
        const original = pkgId && originalService ? (originalService.packages || []).find(p => p.id === pkgId) : null;
        const knewKeysAlready = original && Array.isArray(original.keys);
        if (keys.length || knewKeysAlready) pkg.keys = keys;
        return pkg;
      }).filter(p => p.name);
      if (!packages.length) { toast('Cần ít nhất một gói giá.', 'error'); return; }
      Store.adminSaveService({
        id, name: fd.get('name').trim(), categoryId: fd.get('categoryId'),
        description: fd.get('description').trim(), image: fd.get('image').trim(),
        status: fd.get('status'), features: fd.get('features').split('\n').map(s => s.trim()).filter(Boolean),
        packages
      });
      adminServiceEditing = null;
      renderAdminTab('services');
      toast('Đã lưu dịch vụ.', 'success');
    } else if (formType === 'category') {
      const id = fd.get('id').trim();
      if (!id) { toast('Vui lòng nhập mã danh mục.', 'error'); return; }
      Store.adminSaveCategory({
        id, name: fd.get('name').trim(), icon: fd.get('icon').trim() || '📁',
        description: fd.get('description').trim(), image: fd.get('image').trim()
      });
      adminCategoryEditing = null;
      renderAdminTab('categories');
      toast('Đã lưu danh mục.', 'success');
    } else if (formType === 'config') {
      Store.adminUpdateConfig({
        logoText: fd.get('logoText'), logoSubtext: fd.get('logoSubtext'),
        logoUrl: fd.get('logoUrl'), logoFont: fd.get('logoFont'), logoColor: fd.get('logoColor'),
        logoColorMode: fd.get('logoColorMode'), logoAnimSpeed: parseFloat(fd.get('logoAnimSpeed')) || 6,
        accentColor: fd.get('accentColor'),
        bannerTagText: fd.get('bannerTagText'), bannerBtn1Text: fd.get('bannerBtn1Text'), bannerBtn2Text: fd.get('bannerBtn2Text'),
        siteTitle: fd.get('siteTitle'), siteSubtitle: fd.get('siteSubtitle'),
        contactAdminName: fd.get('contactAdminName'), contactAdminSub: fd.get('contactAdminSub'), contactAdminDesc: fd.get('contactAdminDesc'),
        hotline: fd.get('hotline'), zaloLink: fd.get('zaloLink'),
        googleClientId: fd.get('googleClientId'),
        welcomePopupEnabled: fd.get('welcomePopupEnabled') === '1',
        welcomePopupTitle: fd.get('welcomePopupTitle'), welcomePopupMessage: fd.get('welcomePopupMessage'),
        welcomeVoiceEnabled: fd.get('welcomeVoiceEnabled') === '1', welcomeVoiceText: fd.get('welcomeVoiceText'),
        bankId: fd.get('bankId'), bankAccountNo: fd.get('bankAccountNo'), bankAccountName: fd.get('bankAccountName'),
        marqueeText: fd.get('marqueeText'), marqueeSpeed: parseInt(fd.get('marqueeSpeed'), 10) || 26,
        ttsEnabled: fd.get('ttsEnabled') === '1',
        aiName: fd.get('aiName'), aiGreeting: fd.get('aiGreeting'),
        aiResponseGreeting: fd.get('aiResponseGreeting'), aiResponseDeposit: fd.get('aiResponseDeposit'),
        aiResponseProduct: fd.get('aiResponseProduct'), aiResponseWeb: fd.get('aiResponseWeb'),
        aiResponsePrice: fd.get('aiResponsePrice'), aiResponseContact: fd.get('aiResponseContact'),
        aiResponseThanks: fd.get('aiResponseThanks'), aiResponseFallback: fd.get('aiResponseFallback'),
        bgUrl: fd.get('bgUrl'),
        contactChannels: (Store.db.config.contactChannels || []).map(ch => ({
          ...ch,
          enabled: fd.get(`contact_${ch.id}_enabled`) === 'on',
          url: (fd.get(`contact_${ch.id}_url`) || '').trim()
        }))
      });
      renderStatic();
      toast('Đã lưu cấu hình. Nhấn "Đồng bộ lên máy chủ" để áp dụng cho mọi khách truy cập.', 'success');
    }
  }

  // ============================================================
  // Toast
  // ============================================================
  const TOAST_ICONS = { success: '✅', error: '⚠️' };
  function toast(message, type = 'success') {
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<span class="toast-icon">${TOAST_ICONS[type] || 'ℹ️'}</span><span class="toast-body"></span><button class="toast-dismiss" aria-label="Đóng">✕</button>`;
    el.querySelector('.toast-body').textContent = message;
    el.querySelector('.toast-dismiss').addEventListener('click', () => el.remove());
    $('#toastStack').appendChild(el);
    setTimeout(() => el.remove(), 5000);
  }

  function setText(sel, text) { const el = $(sel); if (el) el.textContent = text ?? ''; }
  function setAttr(sel, attr, val) { const el = $(sel); if (el && val) el.setAttribute(attr, val); }
})();
