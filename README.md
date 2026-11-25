# ARS — Advance Rendering System

Lightweight front-end framework for rapid multi-page development.
One shell (`index.html`) + hash routes into `/page/*.html`, with a small Engine for rendering stats, hover analysis, preloading and cache.

---

## What ARS solves

- You keep building pages as plain HTML fragments in `/page`.
- The router swaps them into `#app` without full reloads.
- The Engine gives live FPS, cache size, hover heat, and load times on the Status page.
- Works when you open `index.html` directly (file://) via embedded fallbacks, and also with a local server when you edit live files.

---

## Quick run

**A. Open as file (no server)**  
Double-click `index.html`. Info / Status / Start work immediately.

**B. Local server (recommended while editing `/page`)**  
```bash
npx serve .
# or: python -m http.server 8000
# or: VS Code Live Server
```
Open the printed URL. Fetch loads the real files under `/page`.

---

## Folder structure

```
ADVANCE-RENDARING-SYSTEM/
├── index.html      # Shell: nav, preloader, #app, script order
├── pages.json      # Single source of truth for routes + nav
├── .env            # Optional API keys (blank by default)
├── page/           # One HTML fragment per route
│   ├── info.html
│   ├── status.html
│   ├── start.html
│   └── myPage.html
├── JS/
│   ├── app.js      # Boot: loads pages.json, builds nav, starts router
│   └── router.js   # Hash router + embedded fallbacks
├── CSS/
│   └── main.css    # Liquid Glass design system
├── Engine/
│   ├── renderer.js # requestAnimationFrame FPS loop
│   ├── hover.js    # Mouse hover analysis / heat map
│   ├── preloader.js# Glass overlay + background preload
│   └── cache.js    # In-memory LRU cache (byte limit)
└── Media/
    └── ars-logo.svg
```

---

## Add a new page (2 steps — framework style)

1. Create `page/contact.html`  
   Content only (section / div). **No** `<html>` / `<head>` / `<body>`.

2. Add one entry to `pages.json`:
   ```json
   {
     "name":  "contact",
     "title": "Contact",
     "path":  "page/contact.html"
   }
   ```

That's it. ARS automatically:
- registers the route
- builds the navigation link
- preloads & caches the page (when served over http/https)

**Important:** Run a local server (`npx serve .`) so `pages.json` and the real `/page` files can be fetched.  
Opening via `file://` still works for the built-in pages (fallback list inside `app.js`).

After adding the entry, open `#contact`. Status → **Total Pages** will increase.

---

## Engine API (`window.ARS`)

| Module | Methods | Purpose |
|--------|---------|---------|
| `ARS.Renderer` | `start`, `stop`, `onFrame`, `offFrame`, `stats`, `markRender` | FPS / frame-time loop |
| `ARS.Cache` | `set`, `get`, `has`, `remove`, `clear`, `stats` | LRU cache with 2 MB soft limit |
| `ARS.Hover` | `start`, `stats` | Live hover target, duration, top element |
| `ARS.Preloader` | `show`, `hide`, `setProgress`, `preload` | Glass overlay + background page warm-up |
| `ARS.Router` | `register`, `start`, `load`, `current`, `pageCount` | Hash routing, cache, page count |

Example (Status page already uses this):
```js
const r = ARS.Renderer.stats();  // { fps, frameTime, renders, uptime, running }
const c = ARS.Cache.stats();     // { bytes, kb, entries, maxBytes, keys }
const h = ARS.Hover.stats();     // { target, hovering, hoverMs, totalHovers, top, tracked }
const n = ARS.Router.pageCount(); // number of registered + embedded routes
```

---

## How routing works

1. `JS/app.js` registers names → URLs and calls `ARS.Router.start()`.
2. On `hashchange` (or first load), `load(name)` runs.
3. If protocol is not `file:` → `fetch(page/name.html)`.
4. On failure or `file:` → use the matching string in `embedded`.
5. HTML is injected into `#app`; inline `<script>` tags are re-executed.
6. Result is stored in `ARS.Cache` so the next visit is instant.

---

## Design notes

- **ARS title** on Info is static (no float animation).
- **Status grid** uses a fixed 3-column layout; long values ellipsize and show full text on hover (`title`).
- **Start page** uses bold headings and no decorative emojis for a cleaner look.
- **Info tree** is a real `<pre class="tree">` so the folder diagram keeps alignment.

---

## Script load order (do not reorder)

```
Engine/cache.js → Engine/renderer.js → Engine/hover.js → Engine/preloader.js
→ JS/router.js → JS/app.js
```

`app.js` assumes `ARS.Cache`, `ARS.Renderer`, `ARS.Hover`, `ARS.Preloader`, and `ARS.Router` already exist.

---

## License / usage

Internal / personal rapid-prototyping framework. Extend freely.
