/* ============================================================
   THEME ENGINE — Noir (dark) / Ivoire (light)
   - Respects saved choice, falls back to system preference.
   - Persists via localStorage when available (try/catch keeps
     sandboxed previews from breaking).
   - Adds a brief .theming class for a smooth cross-fade.
   ============================================================ */
(function () {
  const root = document.documentElement;
  let memory = null; // in-memory fallback for sandboxed environments

  function readSaved() {
    try { return localStorage.getItem('ky-theme'); } catch (e) { return memory; }
  }
  function save(t) {
    try { localStorage.setItem('ky-theme', t); } catch (e) { memory = t; }
  }

  function systemPref() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
      ? 'ivoire' : 'noir';
  }

  function apply(theme, animate) {
    if (animate) {
      root.classList.add('theming');
      setTimeout(() => root.classList.remove('theming'), 550);
    }
    root.setAttribute('data-theme', theme);
    document.querySelectorAll('.theme-switch span').forEach(s => {
      s.classList.toggle('on', s.dataset.theme === theme);
    });
  }

  // initial — before paint where possible
  apply(readSaved() || systemPref(), false);

  // wire switches (one per page nav)
  window.addEventListener('DOMContentLoaded', () => {
    apply(readSaved() || systemPref(), false); // sync switch UI
    document.querySelectorAll('.theme-switch').forEach(sw => {
      sw.addEventListener('click', () => {
        const next = root.getAttribute('data-theme') === 'noir' ? 'ivoire' : 'noir';
        apply(next, true);
        save(next);
      });
    });
  });
})();
