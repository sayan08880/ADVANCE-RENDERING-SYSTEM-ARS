/* ============================================================
   ARS ENGINE — Preloading System
   Glass preloader overlay + background page preloader that
   warms the ARS.Cache before a route is opened.
   API: ARS.Preloader.show | hide | setProgress | preload
   ============================================================ */
window.ARS = window.ARS || {};

ARS.Preloader = (function () {
  function show(text) {
    const el = document.getElementById("ars-preloader");
    if (!el) return;
    if (text) document.getElementById("ars-preloader-text").textContent = text;
    el.classList.add("visible");
  }

  function hide() {
    const el = document.getElementById("ars-preloader");
    if (el) el.classList.remove("visible");
  }

  function setProgress(pct) {
    const bar = document.getElementById("ars-preloader-bar");
    if (bar) bar.style.width = Math.min(100, Math.max(0, pct)) + "%";
  }

  /* fetch a page in the background and store it in the cache */
  async function preload(url, cacheKey) {
    try {
      const res = await fetch(url);
      if (!res.ok) return false;
      const html = await res.text();
      if (cacheKey && window.ARS && ARS.Cache) ARS.Cache.set(cacheKey, html);
      return true;
    } catch (e) {
      return false;
    }
  }

  return { show: show, hide: hide, setProgress: setProgress, preload: preload };
})();
