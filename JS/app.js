/* ============================================================
   ARS — Application Boot
   1. start the Engine (renderer + hover analysis)
   2. load pages.json  -> auto-register routes + build nav
   3. start the router

   TO ADD A NEW PAGE (framework style):
     1. Create   page/contact.html   (content only — no <html>/<head>/<body>)
     2. Add one entry to pages.json, for example:
          {
            "name":  "contact",
            "title": "Contact",
            "path":  "page/contact.html"
          }
     That's it. ARS registers the route and generates the nav link automatically.
   ============================================================ */
(function () {
  ARS.Renderer.start();          // rendering engine (FPS loop)
  ARS.Hover.start();             // mouse hover analysis
  ARS.Cache.set("ars:boot", Date.now());

  /**
   * Build navigation links from pages.json entries
   */
  function buildNav(pages) {
    const container = document.getElementById("nav-links");
    if (!container) return;
    container.innerHTML = "";
    pages.forEach(function (p) {
      const a = document.createElement("a");
      a.href = "#" + p.name;
      a.dataset.route = p.name;
      a.className = "nav-link";
      a.textContent = p.title || p.name;
      container.appendChild(a);
    });
  }

  /**
   * Fallback list used when pages.json cannot be fetched
   * (e.g. opened via file://). Keep in sync with pages.json.
   */
  const FALLBACK_PAGES = [
    { name: "info",    title: "Info",    path: "page/info.html" },
    { name: "status",  title: "Status",  path: "page/status.html" },
    { name: "start",   title: "Start",   path: "page/start.html" },
    { name: "myPage",  title: "My Page", path: "page/myPage.html" },
    { name: "contact", title: "Contact", path: "page/contact.html" }
  ];

  function boot(pages) {
    pages.forEach(function (p) {
      ARS.Router.register(p.name, p.path);
    });
    buildNav(pages);
    ARS.Router.start();
  }

  // Prefer pages.json (http/https). Fall back gracefully on file:// or network error.
  if (location.protocol === "file:") {
    boot(FALLBACK_PAGES);
  } else {
    fetch("pages.json")
      .then(function (res) {
        if (!res.ok) throw new Error("pages.json " + res.status);
        return res.json();
      })
      .then(function (pages) {
        if (!Array.isArray(pages) || pages.length === 0) {
          throw new Error("pages.json is empty or invalid");
        }
        boot(pages);
      })
      .catch(function (err) {
        console.warn("[ARS] Could not load pages.json — using fallback list.", err);
        boot(FALLBACK_PAGES);
      });
  }
})();
