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
