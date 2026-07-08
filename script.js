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
    hotline: "0387332523",
    zaloLink: "https://zalo.me/0387332523",
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
    aiResponsePrice: "Bảng giá tóm tắt:\n• PUBG ESP Radar: 25.000đ/ngày\n• PUBG Silent Aimbot: 30.000đ/ngày\n• Thiết kế Landing Page: từ 1.500.000đ\n• Thiết kế Web Shop tự động: từ 3.500.000đ\n\nNạp tiền qua VietQR để mua key và nhận ngay lập tức nhé!",
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
 * voice.js — Giọng nói trợ lý ảo, ưu tiên giọng Google (Web Speech API).
 * Thay thế toàn bộ dàn giọng "loli/anime" pitch cao trước đây bằng một giọng
 * nữ tự nhiên kiểu Google Assistant/Google Dịch, tốc độ & cao độ mặc định = bình thường.
 */
(function (global) {
  'use strict';

  const PREF_KEY = 'kenios_voice_prefs_v1';

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

    speak(text) {
      if (!this.prefs.enabled || !('speechSynthesis' in window) || !text) return;
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
    chime: { label: 'Chuông ngân' }
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
      btn.innerHTML = '🔊';

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
    setAttr('#footerZalo', 'href', cfg.zaloLink);
    setAttr('#zaloBtn', 'href', cfg.zaloLink);

    setText('#heroTag', cfg.bannerTagText);
    setText('#heroTitle', cfg.siteTitle.replace(/^.*?-\s*/, ''));
    setText('#heroSub', cfg.siteSubtitle);
    setText('#heroBtn1', cfg.bannerBtn1Text);
    setText('#heroBtn2', cfg.bannerBtn2Text);
    applyHeroBackground(cfg.bgUrl);

    const m = `📢 ${cfg.marqueeText}`;
    setText('#marqueeText1', m);
    setText('#marqueeText2', m);

    Voice.setPrefs({ enabled: !!cfg.ttsEnabled, rate: cfg.ttsRate || 1, pitch: cfg.ttsPitch || 1 });

    renderPosts();
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

  function renderCategories() {
    const grid = $('#categoryGrid');
    grid.innerHTML = Store.db.categories.map(c => `
      <div class="category-card" data-category="${esc(c.id)}" role="button" tabindex="0">
        <span class="category-icon">${c.icon}</span>
        <h3>${esc(c.name)}</h3>
        <p>${esc(c.description)}</p>
      </div>
    `).join('');
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
    return `
      <article class="service-card" data-service="${esc(s.id)}">
        <div class="thumb" data-fallback-bg="${esc(s.image)}" style="background-image:url('${esc(s.image)}')">
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
  function applyImageFallbacks(root) {
    $$('.thumb[data-fallback-bg]', root).forEach(el => {
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
            <button id="ddOrders">📦 Đơn hàng của tôi</button>
            <button id="ddDeposit">💳 Nạp tiền</button>
            ${user.role === 'admin' ? '<button id="ddAdmin">🛠️ Quản trị hệ thống</button>' : ''}
            <button id="ddLogout">🚪 Đăng xuất</button>
          </div>
        </div>
      </div>
    `;
    $('#balancePill').addEventListener('click', () => openModal('#depositModal'));
    $('#avatarBtn').addEventListener('click', () => $('#userDropdown').classList.toggle('open'));
    $('#ddOrders').addEventListener('click', () => { $('#userDropdown').classList.remove('open'); openOrdersModal(); });
    $('#ddDeposit').addEventListener('click', () => { $('#userDropdown').classList.remove('open'); openModal('#depositModal'); });
    if (user.role === 'admin') {
      $('#ddAdmin').addEventListener('click', () => { $('#userDropdown').classList.remove('open'); openAdminModal(); });
    }
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

    $('#menuToggle').addEventListener('click', () => {
      const nav = $('#mobileNav');
      const open = nav.classList.toggle('open');
      $('#menuToggle').setAttribute('aria-expanded', String(open));
    });
    $$('#mobileNav a').forEach(a => a.addEventListener('click', () => $('#mobileNav').classList.remove('open')));

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
    });

    $('#confirmDepositBtn').addEventListener('click', async () => {
      const amount = parseInt($('#confirmDepositBtn').dataset.amount, 10);
      const note = $('#confirmDepositBtn').dataset.note;
      await withLoading($('#confirmDepositBtn'), async () => {
        const confirmed = await pollServerForTransaction(note);
        Store.deposit(amount, note);
        closeModal('#depositModal');
        $('#depositQrBox').hidden = true;
        toast(confirmed
          ? `Đã xác nhận giao dịch ${fmt(amount)} từ máy chủ ngân hàng!`
          : `Đã cộng ${fmt(amount)} vào số dư (chế độ demo cục bộ, không có máy chủ xác thực).`, 'success');
      });
    });
  }

  async function pollServerForTransaction(note) {
    try {
      const res = await fetch(`api.php?action=get_db&t=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) return false;
      const json = await res.json();
      return !!(json.transactions || []).find(t => (t.description || '').includes(note));
    } catch { return false; }
  }

  // ---- Chi tiết dịch vụ ----
  function wireServiceModal() {
    $('#serviceModalBuyBtn').addEventListener('click', () => {
      const service = Store.db.services.find(s => s.id === currentServiceId);
      const errEl = $('#serviceModalError');
      errEl.textContent = '';
      if (!Store.currentUser()) { errEl.textContent = 'Vui lòng đăng nhập trước khi mua.'; return; }
      if (!currentPackage) { errEl.textContent = 'Vui lòng chọn một gói.'; return; }
      try {
        const order = Store.buyPackage(service, currentPackage);
        closeModal('#serviceModal');
        toast(`Mua thành công! Key: ${order.key}`, 'success');
        Voice.speak(`Bạn đã mua thành công gói ${order.packageName} của ${order.serviceName}.`);
      } catch (err) { errEl.textContent = err.message; }
    });
  }

  function openServiceModal(serviceId) {
    const service = Store.db.services.find(s => s.id === serviceId);
    if (!service) return;
    currentServiceId = serviceId;
    currentPackage = service.packages[0] || null;

    $('#serviceModalImg').src = service.image;
    $('#serviceModalImg').alt = service.name;
    const inStock = service.status === 'instock';
    $('#serviceModalBadge').textContent = inStock ? 'Còn hàng' : 'Hết hàng';
    $('#serviceModalBadge').className = 'badge' + (inStock ? '' : ' out');
    setText('#serviceModalTitle', service.name);
    setText('#serviceModalDesc', service.description);
    $('#serviceModalFeatures').innerHTML = (service.features || []).map(f => `<li>${esc(f)}</li>`).join('');

    const pkgWrap = $('#serviceModalPackages');
    pkgWrap.innerHTML = service.packages.map((p, i) => `
      <div class="package-option ${i === 0 ? 'selected' : ''}" data-pkg="${esc(p.id)}">
        <span>${esc(p.name)}</span><strong>${fmt(p.price)}</strong>
      </div>
    `).join('');
    pkgWrap.querySelectorAll('.package-option').forEach(el => {
      el.addEventListener('click', () => {
        pkgWrap.querySelectorAll('.package-option').forEach(o => o.classList.remove('selected'));
        el.classList.add('selected');
        currentPackage = service.packages.find(p => p.id === el.dataset.pkg);
      });
    });

    $('#serviceModalError').textContent = '';
    $('#serviceModalBuyBtn').disabled = !inStock;
    $('#serviceModalBuyBtn').textContent = inStock ? 'Mua Ngay' : 'Hết Hàng';
    openModal('#serviceModal');
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

  function getAiReply(t) {
    const cfg = Store.db.config;
    if (/nạp tiền|nap tien|vietqr|qr/.test(t)) return cfg.aiResponseDeposit;
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
    else if (tab === 'config') body.innerHTML = adminConfigHtml();
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
          <label class="span-2">URL ảnh <input name="image" value="${esc(s.image)}"></label>
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
    return `
      <div class="admin-pkg-row">
        <input placeholder="Tên gói (VD: 7 Ngày)" data-pkg-name value="${esc(p.name)}">
        <input type="number" min="0" step="1000" placeholder="Giá (đ)" data-pkg-price value="${p.price}">
        <button type="button" class="btn btn-ghost btn-sm" data-remove-pkg-row>✕</button>
      </div>
    `;
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
          <label class="span-2">URL ảnh <input name="image" value="${esc(c.image)}"></label>
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
        <label class="span-2">Tên website (siteTitle) <input name="siteTitle" value="${esc(c.siteTitle)}"></label>
        <label class="span-2">Mô tả ngắn (siteSubtitle) <textarea name="siteSubtitle">${esc(c.siteSubtitle)}</textarea></label>
        <label>Hotline <input name="hotline" value="${esc(c.hotline)}"></label>
        <label>Link Zalo <input name="zaloLink" value="${esc(c.zaloLink)}"></label>
        <label>Ngân hàng (bankId) <input name="bankId" value="${esc(c.bankId)}"></label>
        <label>Số tài khoản <input name="bankAccountNo" value="${esc(c.bankAccountNo)}"></label>
        <label class="span-2">Tên chủ tài khoản <input name="bankAccountName" value="${esc(c.bankAccountName)}"></label>
        <label class="span-2">Chữ chạy (marqueeText) <input name="marqueeText" value="${esc(c.marqueeText)}"></label>
        <label class="span-2">Ảnh/Video nền Hero (bgUrl)
          <input name="bgUrl" value="${esc(c.bgUrl || '')}" placeholder="Dán URL ảnh (.jpg/.png) hoặc video (.mp4/.webm) — lấy từ tab Thư viện">
        </label>
        <label>Giọng nói trợ lý (TTS)
          <select name="ttsEnabled">
            <option value="1" ${c.ttsEnabled ? 'selected' : ''}>Bật</option>
            <option value="0" ${!c.ttsEnabled ? 'selected' : ''}>Tắt</option>
          </select>
        </label>
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
        <span class="muted" style="font-size:.8rem;">Ảnh tối đa 5MB, video tối đa 25MB. Chỉ hoạt động khi có máy chủ PHP.</span>
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
      const names = $$('[data-pkg-name]', e.target).map(el => el.value.trim());
      const prices = $$('[data-pkg-price]', e.target).map(el => parseInt(el.value, 10) || 0);
      const packages = names.map((name, i) => ({ id: `pkg-${id}-${i}`, name, price: prices[i] })).filter(p => p.name);
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
        siteTitle: fd.get('siteTitle'), siteSubtitle: fd.get('siteSubtitle'),
        hotline: fd.get('hotline'), zaloLink: fd.get('zaloLink'),
        bankId: fd.get('bankId'), bankAccountNo: fd.get('bankAccountNo'), bankAccountName: fd.get('bankAccountName'),
        marqueeText: fd.get('marqueeText'), ttsEnabled: fd.get('ttsEnabled') === '1',
        bgUrl: fd.get('bgUrl')
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
