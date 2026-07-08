/**
 * store.js — Quản lý dữ liệu & phiên đăng nhập.
 * Nguồn dữ liệu gốc: database.json (đồng bộ qua api.php khi chạy trên PHP hosting).
 * Khi mở trực tiếp bằng file:// hoặc không có backend, tự dùng dữ liệu mặc định
 * trong data.js và lưu mọi thay đổi (đơn hàng, số dư, tài khoản...) vào localStorage
 * để trải nghiệm vẫn hoạt động đầy đủ.
 */
(function (global) {
  'use strict';

  const LS_KEY = 'kenios_local_state_v1';
  const API_URL = './api.php';

  const Store = {
    db: null,
    session: null, // { userId } khi đã đăng nhập
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
      if (local.users) this.db.users = local.users;
      if (local.orders) this.db.orders = local.orders;
      if (local.transactions) this.db.transactions = local.transactions;
    },

    _persistOverrides() {
      this._writeLocal('overrides', {
        users: this.db.users,
        orders: this.db.orders,
        transactions: this.db.transactions
      });
    },

    _readLocal(key) {
      try { return JSON.parse(localStorage.getItem(`${LS_KEY}:${key}`)); } catch { return null; }
    },
    _writeLocal(key, val) {
      try { localStorage.setItem(`${LS_KEY}:${key}`, JSON.stringify(val)); } catch { /* ignore */ }
    },

    // ---- Tài khoản ----
    currentUser() {
      if (!this.session) return null;
      return this.db.users.find(u => u.userId === this.session.userId) || null;
    },

    register(username, password) {
      username = username.trim();
      if (!username || password.length < 6) throw new Error('Tên đăng nhập không hợp lệ hoặc mật khẩu quá ngắn (tối thiểu 6 ký tự).');
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
      this.session = { userId: user.userId };
      this._writeLocal('session', this.session);
      this._emit();
      return user;
    },

    login(username, password) {
      const user = this.db.users.find(u => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password);
      if (!user) throw new Error('Sai tên đăng nhập hoặc mật khẩu.');
      this.session = { userId: user.userId };
      this._writeLocal('session', this.session);
      this._emit();
      return user;
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

    // ---- Đồng bộ Admin (chỉ hoạt động khi có backend PHP) ----
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
