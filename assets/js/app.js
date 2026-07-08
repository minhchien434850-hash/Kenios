/**
 * app.js — Gắn kết dữ liệu (store.js) với giao diện, xử lý toàn bộ tương tác:
 * đăng nhập/đăng ký, nạp tiền VietQR, mua gói dịch vụ, đơn hàng, trợ lý ảo AI.
 */
(function () {
  'use strict';

  const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  let selectedCategory = 'all';
  let currentServiceId = null;
  let currentPackage = null;

  document.addEventListener('DOMContentLoaded', boot);

  async function boot() {
    Voice.init();
    Effects.init();
    await Store.init();
    Store.onChange(renderDynamic);

    renderStatic();
    renderDynamic();
    wireGlobalUI();
    wireAuthModal();
    wireDepositModal();
    wireServiceModal();
    wireOrdersModal();
    wireAiWidget();
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
    if (cfg.bgUrl) $('#heroBg').style.backgroundImage = `url(${cfg.bgUrl})`;

    const m = `📢 ${cfg.marqueeText}`;
    setText('#marqueeText1', m);
    setText('#marqueeText2', m);

    Voice.setPrefs({ enabled: !!cfg.ttsEnabled, rate: cfg.ttsRate || 1, pitch: cfg.ttsPitch || 1 });

    renderCategories();
    renderPosts();
  }

  function renderCategories() {
    const cfg = Store.db.config;
    const grid = $('#categoryGrid');
    grid.innerHTML = Store.db.categories.map(c => `
      <div class="category-card" data-category="${c.id}" role="button" tabindex="0">
        <span class="category-icon">${c.icon}</span>
        <h3>${c.name}</h3>
        <p>${c.description}</p>
      </div>
    `).join('');
    grid.addEventListener('click', (e) => {
      const card = e.target.closest('.category-card');
      if (!card) return;
      const catId = card.dataset.category;
      selectedCategory = catId === 'webdesign' ? 'all' : catId;
      renderServiceGrid();
      const target = catId === 'webdesign' ? '#webdesign' : '#services';
      document.querySelector(target).scrollIntoView({ behavior: 'smooth' });
    });

    const filterWrap = $('#filterTabs');
    const cats = Store.db.categories.filter(c => c.id !== 'webdesign');
    filterWrap.innerHTML = ['<button class="filter-tab active" data-filter="all">Tất cả</button>']
      .concat(cats.map(c => `<button class="filter-tab" data-filter="${c.id}">${c.icon} ${c.name}</button>`))
      .join('');
    filterWrap.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-tab');
      if (!btn) return;
      selectedCategory = btn.dataset.filter;
      $$('.filter-tab', filterWrap).forEach(b => b.classList.toggle('active', b === btn));
      renderServiceGrid();
    });
  }

  function renderPosts() {
    const grid = $('#postGrid');
    grid.innerHTML = Store.db.posts.map(p => `
      <article class="post-card">
        <time>${p.date}</time>
        <h3>${p.title}</h3>
        <p>${p.summary}</p>
      </article>
    `).join('');
  }

  // ============================================================
  // RENDER — phần động (phụ thuộc trạng thái đăng nhập / dữ liệu đổi)
  // ============================================================
  function renderDynamic() {
    renderAuthArea();
    renderHeroStats();
    renderServiceGrid();
    renderWebdesignGrid();
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
    const minPrice = Math.min(...s.packages.map(p => p.price));
    const inStock = s.status === 'instock';
    return `
      <article class="service-card" data-service="${s.id}">
        <div class="thumb" style="background-image:url('${s.image}')">
          <span class="badge ${inStock ? '' : 'out'}">${inStock ? 'Còn hàng' : 'Hết hàng'}</span>
        </div>
        <div class="body">
          <h3>${s.name}</h3>
          <p class="desc">${s.description}</p>
          <div class="price-row">
            <span class="price">Từ ${fmt(minPrice)}</span>
            <button class="btn btn-glass btn-sm" data-view-service="${s.id}">Xem chi tiết</button>
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
  }

  function renderWebdesignGrid() {
    const list = Store.db.services.filter(s => s.categoryId === 'webdesign');
    $('#webdesignGrid').innerHTML = list.map(serviceCardHtml).join('');
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
            <strong style="padding:8px 12px;font-size:.85rem;">${user.username}</strong>
            <button id="ddOrders">📦 Đơn hàng của tôi</button>
            <button id="ddDeposit">💳 Nạp tiền</button>
            <button id="ddLogout">🚪 Đăng xuất</button>
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
      try {
        Store.login(fd.get('username'), fd.get('password'));
        closeModal('#authModal');
        e.target.reset();
        $('#loginError').textContent = '';
        toast('Đăng nhập thành công!', 'success');
      } catch (err) { $('#loginError').textContent = err.message; }
    });

    $('#registerForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      try {
        Store.register(fd.get('username'), fd.get('password'));
        closeModal('#authModal');
        e.target.reset();
        $('#registerError').textContent = '';
        toast('Tạo tài khoản thành công! Chào mừng bạn.', 'success');
      } catch (err) { $('#registerError').textContent = err.message; }
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
      $('#confirmDepositBtn').disabled = true;
      $('#confirmDepositBtn').textContent = 'Đang kiểm tra giao dịch...';
      const confirmed = await pollServerForTransaction(note);
      Store.deposit(amount, note);
      closeModal('#depositModal');
      $('#depositQrBox').hidden = true;
      $('#confirmDepositBtn').disabled = false;
      $('#confirmDepositBtn').textContent = 'Tôi đã chuyển khoản';
      toast(confirmed
        ? `Đã xác nhận giao dịch ${fmt(amount)} từ máy chủ ngân hàng!`
        : `Đã cộng ${fmt(amount)} vào số dư (chế độ demo cục bộ, không có máy chủ xác thực).`, 'success');
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
    $('#serviceModalFeatures').innerHTML = (service.features || []).map(f => `<li>${f}</li>`).join('');

    const pkgWrap = $('#serviceModalPackages');
    pkgWrap.innerHTML = service.packages.map((p, i) => `
      <div class="package-option ${i === 0 ? 'selected' : ''}" data-pkg="${p.id}">
        <span>${p.name}</span><strong>${fmt(p.price)}</strong>
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
  function wireOrdersModal() {}

  function openOrdersModal() {
    if (!Store.currentUser()) { toast('Vui lòng đăng nhập.', 'error'); openModal('#authModal'); return; }
    const orders = Store.myOrders();
    $('#ordersList').innerHTML = orders.length ? orders.map(o => `
      <div class="order-item">
        <div class="row"><strong>${o.serviceName}</strong><span>${fmt(o.price)}</span></div>
        <div class="row muted"><span>${o.packageName}</span><span>${new Date(o.date).toLocaleString('vi-VN')}</span></div>
        <div class="key">${o.key}</div>
      </div>
    `).join('') : `<p class="empty-note">Bạn chưa có đơn hàng nào.</p>`;
    openModal('#ordersModal');
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
    $('#aiQuickReplies').innerHTML = quick.map(q => `<button data-q="${q.text}">${q.label}</button>`).join('');
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
  // Toast
  // ============================================================
  function toast(message, type = 'success') {
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = message;
    $('#toastStack').appendChild(el);
    setTimeout(() => el.remove(), 4200);
  }

  function setText(sel, text) { const el = $(sel); if (el) el.textContent = text ?? ''; }
  function setAttr(sel, attr, val) { const el = $(sel); if (el && val) el.setAttribute(attr, val); }
})();
