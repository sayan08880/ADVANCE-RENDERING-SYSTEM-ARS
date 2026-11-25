/* ============================================================
   ARS — Hash Router
   Loads /page/*.html into <main id="app">, caches pages,
   executes inline page scripts, updates the nav state.
   Works on both http:// (fetch) and file:// (embedded fallback).
   ============================================================ */
window.ARS = window.ARS || {};

ARS.Router = (function () {
  const routes = {};        // name -> url
  let current = null;

  /* ---- Embedded page fallbacks (used when fetch is blocked, e.g. file://) ---- */
  const embedded = {
    info: `<!-- ============ PAGE A : INFO ============ -->
<section class="page-center">
  <h1 class="ars-title">ARS</h1>

  <div class="glass box info-box">
    <h2>Advance Rendering System</h2>
    <p>
      ARS is a lightweight front-end framework for rapid development.
      Pages live in <strong>/page</strong>, the Engine handles rendering,
      mouse-hover analysis, preloading and cache management — so you
      focus only on building pages.
    </p>
    <div class="info-chips">
      <span class="chip">Hash Router</span>
      <span class="chip">Rendering Engine</span>
      <span class="chip">Hover Analysis</span>
      <span class="chip">Preloader</span>
      <span class="chip">Cache Management</span>
      <span class="chip">Liquid Glass UI</span>
    </div>
    <pre class="tree">ADVANCE-RENDARING-SYSTEM/
├── index.html          ← root page
├── .env                ← blank (use for API keys later)
├── page/               ← your pages live here
│   ├── info.html
│   ├── status.html
│   └── start.html
├── JS/                 ← app scripts (router, boot)
├── CSS/                ← liquid glass stylesheet
├── Engine/             ← rendering · hover · preloader · cache
└── Media/              ← images, icons, media assets</pre>
  </div>
</section>
`,

    status: `<!-- ============ PAGE B : LIVE STATUS ============ -->
<section class="page-center">
  <div class="glass box status-box">
    <h2>Live Engine Status</h2>
    <div class="status-grid">
      <div class="stat"><span class="stat-label">FPS</span><span class="stat-value good" id="st-fps">–</span></div>
      <div class="stat"><span class="stat-label">Frame Time</span><span class="stat-value" id="st-frame">–</span></div>
      <div class="stat"><span class="stat-label">Renders</span><span class="stat-value" id="st-renders">–</span></div>
      <div class="stat"><span class="stat-label">Uptime</span><span class="stat-value" id="st-uptime">–</span></div>
      <div class="stat"><span class="stat-label">Total Pages</span><span class="stat-value good" id="st-pages">–</span></div>
      <div class="stat"><span class="stat-label">Cache Size</span><span class="stat-value warn" id="st-cache">–</span></div>
      <div class="stat"><span class="stat-label">Cache Entries</span><span class="stat-value" id="st-entries">–</span></div>
      <div class="stat"><span class="stat-label">JS Heap</span><span class="stat-value warn" id="st-heap">–</span></div>
      <div class="stat"><span class="stat-label">Current Route</span><span class="stat-value hot" id="st-route">–</span></div>
      <div class="stat"><span class="stat-label">Page Load</span><span class="stat-value" id="st-load">–</span></div>
      <div class="stat"><span class="stat-label">Hover Target</span><span class="stat-value" id="st-hover" title="">–</span></div>
      <div class="stat"><span class="stat-label">Hover Time</span><span class="stat-value" id="st-hoverms">–</span></div>
      <div class="stat"><span class="stat-label">Total Hovers</span><span class="stat-value" id="st-hovers">–</span></div>
      <div class="stat"><span class="stat-label">Top Hovered</span><span class="stat-value hot" id="st-top" title="">–</span></div>
      <div class="stat"><span class="stat-label">Elements Tracked</span><span class="stat-value" id="st-tracked">–</span></div>
    </div>
  </div>
</section>

<script>
(function () {
  function $(id) { return document.getElementById(id); }
  function fmtBytes(b) {
    if (b < 1024) return b + " B";
    if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
    return (b / (1024 * 1024)).toFixed(2) + " MB";
  }
  function tick() {
    var r = ARS.Renderer.stats();
    var c = ARS.Cache.stats();
    var h = ARS.Hover.stats();
    $("st-fps").textContent     = r.fps;
    $("st-frame").textContent   = r.frameTime + " ms";
    $("st-renders").textContent = r.renders;
    $("st-uptime").textContent  = r.uptime + " s";
    $("st-pages").textContent   = ARS.Router.pageCount ? ARS.Router.pageCount() : "–";
    $("st-cache").textContent   = fmtBytes(c.bytes) + " / " + fmtBytes(c.maxBytes);
    $("st-entries").textContent = c.entries;
    $("st-heap").textContent    = (performance.memory)
        ? fmtBytes(performance.memory.usedJSHeapSize) : "n/a";
    $("st-route").textContent   = "#" + (ARS.Router.current() || "info");
    var load = ARS.Cache.get("ars:load:" + ARS.Router.current());
    $("st-load").textContent    = (load !== undefined) ? load + " ms" : "–";
    var hoverEl = $("st-hover");
    hoverEl.textContent = h.target;
    hoverEl.title = h.target;
    $("st-hoverms").textContent = h.hoverMs + " ms";
    $("st-hovers").textContent  = h.totalHovers;
    var topEl = $("st-top");
    topEl.textContent = h.top.element + " ×" + h.top.count;
    topEl.title = h.top.element + " ×" + h.top.count;
    $("st-tracked").textContent = h.tracked;
  }
  setInterval(tick, 250);
  tick();
})();
</script>
`,

    start: `<!-- ============ PAGE C : START ============ -->
<section class="page-center long">
  <div class="glass box start-box">
    <h1 class="typing"><span id="type-line1"></span><br><span id="type-line2" class="grad"></span></h1>
    <span class="caret"></span>
    <p class="start-sub" id="type-sub"></p>
    <div class="btn-row">
      <a href="#info" class="btn primary">Open Info Page</a>
      <a href="#status" class="btn">Live Status</a>
    </div>
  </div>

  <div class="glass box doc-box">
    <h3>Quick Start — Add Your Own Page</h3>
    <ol>
      <li>Create <code>page/myPage.html</code> with your content.</li>
      <li>Register it in <code>JS/app.js</code>:
        <code>ARS.Router.register("myPage", "page/myPage.html");</code></li>
      <li>Add a nav link in <code>index.html</code>:
        <code>&lt;a href="#myPage" data-route="myPage" class="nav-link"&gt;My Page&lt;/a&gt;</code></li>
      <li>(Optional) For file:// support, add the HTML string to the <code>embedded</code> map in <code>JS/router.js</code>.</li>
    </ol>
    <p>The Engine auto-preloads and caches every route, and tracks FPS, hover analytics and cache size in real time.</p>
  </div>

  <div class="glass box doc-box">
    <h3>Engine API</h3>
    <ol>
      <li><code>ARS.Renderer.stats()</code> — fps, frameTime, renders, uptime</li>
      <li><code>ARS.Cache.set / get / stats / clear()</code> — LRU cache with byte tracking</li>
      <li><code>ARS.Hover.stats()</code> — hover target, times, heat-map top element</li>
      <li><code>ARS.Preloader.show / hide / preload()</code> — glass loading overlay</li>
      <li><code>ARS.Router.register / load / current / pageCount()</code> — hash routing + page cache</li>
    </ol>
  </div>

  <div class="glass box doc-box">
    <h3>Folder Roles</h3>
    <ul>
      <li><code>index.html</code> — shell: nav, preloader, #app container, script order</li>
      <li><code>page/</code> — one HTML file per route (content only, no full document)</li>
      <li><code>JS/</code> — router + boot; register every new page here</li>
      <li><code>CSS/</code> — Liquid Glass design system</li>
      <li><code>Engine/</code> — renderer, hover, preloader, cache (do not remove)</li>
      <li><code>Media/</code> — logos, images, icons</li>
      <li><code>.env</code> — optional API keys for later integrations</li>
    </ul>
  </div>

  <div class="glass box doc-box">
    <h3>Long Page Section 1</h3>
    <p>This page is intentionally long — scroll down to test smooth scrolling and hover analytics while you move the mouse.</p>
  </div>
  <div class="glass box doc-box">
    <h3>Long Page Section 2</h3>
    <p>Every element you hover is tracked by <code>Engine/hover.js</code> — open the Status page to watch it live.</p>
  </div>
  <div class="glass box doc-box">
    <h3>Long Page Section 3</h3>
    <p>Pages are fetched once (or served from embedded fallback), stored in the ARS cache, and served instantly on the next visit.</p>
  </div>
  <p class="filler">— End of page · keep building —</p>
</section>

<script>
(function () {
  var l1 = document.getElementById("type-line1");
  var l2 = document.getElementById("type-line2");
  var sub = document.getElementById("type-sub");
  var t1 = "HELLO DEVELOPER";
  var t2 = "START THE CODE";
  var t3 = "ARS framework is ready — create pages in /page and register routes in JS/app.js";

  function typeInto(el, text, speed, done) {
    var i = 0;
    (function step() {
      if (i < text.length) {
        el.textContent += text[i++];
        setTimeout(step, speed + Math.random() * 40);
      } else if (done) { setTimeout(done, 250); }
    })();
  }

  typeInto(l1, t1, 70, function () {
    typeInto(l2, t2, 70, function () {
      typeInto(sub, t3, 22);
    });
  });
})();
</script>
`
  };

  function register(name, url) { routes[name] = url; }

  function pageCount() {
    const keys = new Set([...Object.keys(routes), ...Object.keys(embedded)]);
    return keys.size;
  }

  function render(html) {
    const app = document.getElementById("app");
    app.innerHTML = html;
    // re-execute inline <script> tags of the loaded page
    app.querySelectorAll("script").forEach(function (oldScript) {
      const s = document.createElement("script");
      if (oldScript.src) { s.src = oldScript.src; }
      else { s.textContent = oldScript.textContent; }
      document.body.appendChild(s);
      oldScript.remove();
    });
  }

  function updateNav() {
    document.querySelectorAll(".nav-link").forEach(function (a) {
      a.classList.toggle("active", a.dataset.route === current);
    });
  }

  function error(msg) {
    render(
      '<section class="page-center"><div class="glass box info-box">' +
      "<h2>Could not render page</h2><p>" + msg + "</p>" +
      "<p style='margin-top:10px'>If you opened <code>index.html</code> directly (file://), the framework still works via embedded pages. " +
      "For live editing of <code>/page/*.html</code> run a local server:</p>" +
      "<div class='tree'>npx serve . &nbsp;&nbsp;# or VS Code Live Server</div>" +
      "</div></section>"
    );
  }

  async function load(name) {
    if (!routes[name] && !embedded[name]) name = "info";   // fallback route
    current = name;
    ARS.Cache.set("ars:route", name);
    ARS.Preloader.show("Rendering /page/" + name + ".html …");
    ARS.Preloader.setProgress(25);
    try {
      const t0 = performance.now();
      const cacheKey = "ars:page:" + name;
      let html;

      if (ARS.Cache.has(cacheKey)) {                // cache hit
        html = ARS.Cache.get(cacheKey);
        ARS.Preloader.setProgress(85);
      } else {
        // Try network fetch first (works on http/https servers)
        let fetched = false;
        if (routes[name] && location.protocol !== "file:") {
          try {
            const res = await fetch(routes[name]);
            if (res.ok) {
              html = await res.text();
              fetched = true;
              ARS.Preloader.setProgress(70);
            }
          } catch (e) { /* fall through to embedded */ }
        }

        // Fallback: use embedded page (works on file:// and when fetch fails)
        if (!fetched) {
          if (embedded[name]) {
            html = embedded[name];
            ARS.Preloader.setProgress(70);
          } else {
            throw new Error("Page \"" + name + "\" not found (no embedded fallback either)");
          }
        }

        ARS.Cache.set(cacheKey, html);
      }

      render(html);
      ARS.Renderer.markRender();
      ARS.Cache.set("ars:load:" + name, +(performance.now() - t0).toFixed(1));
      ARS.Preloader.setProgress(100);
      setTimeout(ARS.Preloader.hide, 200);
      updateNav();
      window.scrollTo(0, 0);
    } catch (err) {
      ARS.Preloader.hide();
      error(String(err.message || err));
    }
  }

  function start() {
    window.addEventListener("hashchange", function () {
      load(location.hash.slice(1) || "info");
    });
    const initial = location.hash.slice(1) || "info";
    load(initial).then(function () {
      // preload + cache the other pages in the background (only when not file://)
      if (location.protocol !== "file:") {
        Object.keys(routes).forEach(function (n) {
          if (n !== initial) ARS.Preloader.preload(routes[n], "ars:page:" + n);
        });
      }
    });
  }

  return {
    register: register,
    start: start,
    load: load,
    current: function () { return current; },
    pageCount: pageCount
  };
})();
