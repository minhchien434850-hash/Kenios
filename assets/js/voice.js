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
