# ARS — Advance Rendering System
## Complete Project Report, Setup Guide, Architecture and Developer Manual

**Project:** ARS (Advance Rendering System)  
**Project type:** Lightweight client-side, multi-page web framework  
**Core technologies:** HTML5, CSS3 and Vanilla JavaScript  
**Routing style:** Hash-based routing (`#route`)  
**Page format:** HTML fragments loaded into a shared application shell  
**Configuration file:** `pages.json`

---

## 1. Executive Summary

ARS (Advance Rendering System) is a lightweight front-end framework designed to make it easier to build multi-page websites using plain HTML, CSS and JavaScript. Instead of creating a separate complete HTML document for every page, the project uses one root document (`index.html`) as the permanent application shell. Individual page fragments are stored in the `page/` directory and inserted into the shell's `<main id="app">` container when a route is opened.

The framework combines several small JavaScript modules:

- **Router:** reads the current URL hash and loads the matching page.
- **Cache:** stores page content in memory so a page can be reused without another fetch.
- **Preloader:** displays a loading overlay and can fetch pages in the background.
- **Renderer:** measures animation-frame timing and exposes FPS and render statistics.
- **Hover analyser:** records the elements users hover over and calculates simple hover statistics.
- **Application boot file:** loads `pages.json`, registers routes, builds the navigation menu and starts the router.

The project also includes a Liquid Glass-inspired visual design, a live Status page, sample pages and embedded fallback HTML for selected routes.

ARS is currently best understood as a small, extensible client-side page-loading framework and development foundation. It is not a complete replacement for a production application framework, and its current rendering module measures browser animation frames rather than implementing a virtual DOM or a full rendering pipeline.

---

## 2. Project Goals

The project is designed around these goals:

1. **Simple page creation:** developers can create a page as a small HTML fragment.
2. **One shared application shell:** the navigation, background, preloader and main container remain in place while page content changes.
3. **No full-page navigation for internal routes:** navigation uses URL hashes and JavaScript.
4. **Reusable page content:** fetched page HTML is stored in an in-memory cache.
5. **Background page warming:** other configured pages can be fetched after the first route loads.
6. **Simple configuration:** route names, page titles and file paths are declared in `pages.json`.
7. **Visible diagnostics:** the Status page displays information collected by the engine modules.
8. **No front-end framework dependency:** the current implementation uses browser APIs and Vanilla JavaScript.

---

## 3. Technology Stack

| Technology | Use in ARS |
|---|---|
| HTML5 | Root shell and page fragments |
| CSS3 | Layout, responsive styling, Liquid Glass appearance and loading animation |
| Vanilla JavaScript | Application logic and engine modules |
| Fetch API | Loads `pages.json` and page fragments over HTTP or HTTPS |
| URL hash | Identifies the current route |
| `Map` and `Set` | Store cache entries and renderer listeners |
| `requestAnimationFrame` | Measures frame timing and FPS |
| DOM events | Tracks mouse hover activity |
| `performance.now()` | Measures elapsed time and page loading duration |
| `Blob` | Estimates cached value size |

No npm package is required by the current source code to run the application. A local static web server is recommended for development.

---

## 4. Project Directory Structure

The uploaded project contains the following structure:

```text
ARS/
├── index.html
├── pages.json
├── .env
│
├── CSS/
│   └── main.css
│
├── Engine/
│   ├── cache.js
│   ├── renderer.js
│   ├── hover.js
│   └── preloader.js
│
├── JS/
│   ├── app.js
│   └── router.js
│
├── page/
│   ├── info.html
│   ├── status.html
│   ├── start.html
│   ├── myPage.html
│   └── contact.html
│
└── Media/
    └── ars-logo.svg
```

### 4.1 Root files

**`index.html`**

The permanent application shell. It contains:

- Document metadata and page title.
- Main stylesheet and favicon references.
- Animated background elements.
- The ARS loading overlay.
- The navigation bar.
- The `#app` element where page fragments are inserted.
- Script tags that load the engine and application files.

The engine scripts must be loaded before `JS/router.js` and `JS/app.js`, because those files use the engine APIs.

**`pages.json`**

The route configuration file. Each entry describes a page using three properties:

- `name`: route identifier used in the URL hash.
- `title`: label displayed in navigation.
- `path`: location of the page fragment.

**`.env`**

The uploaded project contains an `.env` file. The current browser-side ARS code does not read this file. A browser cannot safely use a private API key merely by placing it in a front-end `.env` file. Keep secrets on a server and never publish private keys in client-side code or a public repository.

### 4.2 CSS directory

**`CSS/main.css`** contains the project's visual styling, including the background, glass surfaces, navigation, buttons, page layouts, status grid and preloader presentation.

### 4.3 Engine directory

The `Engine/` directory contains reusable modules that expose their APIs through the global `window.ARS` object.

### 4.4 JS directory

- `JS/app.js` starts the engine, loads route configuration, creates navigation links and starts the router.
- `JS/router.js` handles route changes, page loading, fallback content, rendering and page-load measurements.

### 4.5 Page directory

Each file in `page/` represents the content of one route. These files are HTML fragments, not complete HTML documents.

### 4.6 Media directory

The current media directory contains the ARS SVG logo. Additional images, icons, fonts and other static assets can be organised here.

---

## 5. High-Level Architecture

ARS has three main layers.

### Layer A — Application shell

`index.html` stays loaded. It provides the permanent elements that should not need to be recreated for every route:

- Navigation
- Background
- Preloader
- Main page container

### Layer B — Application and routing

`JS/app.js` reads the page configuration and prepares the application. `JS/router.js` decides which page fragment to load and inserts it into the main container.

### Layer C — Engine modules

The engine modules provide shared services:

- Cache management
- Frame timing and render counters
- Hover analysis
- Loading overlay and background preloading

### Architecture diagram

```text
Browser
  |
  v
index.html
  |
  +-- CSS/main.css
  |
  +-- Engine/cache.js
  +-- Engine/renderer.js
  +-- Engine/hover.js
  +-- Engine/preloader.js
  |
  +-- JS/router.js
  +-- JS/app.js
         |
         +-- Fetch pages.json
         |
         +-- Register routes
         |
         +-- Generate navigation
         |
         +-- Start Router
                  |
                  +-- Read URL hash
                  +-- Check page cache
                  +-- Fetch page fragment when needed
                  +-- Use embedded fallback when available
                  +-- Insert HTML into #app
                  +-- Update status and navigation
```

---

## 6. Application Startup: What Happens First?

When the browser opens `index.html`, the following sequence occurs.

1. The browser parses the root HTML document.
2. It loads `CSS/main.css`.
3. It creates the background, preloader, navigation container and `#app` element.
4. It loads the engine scripts in the order written in `index.html`.
5. `JS/app.js` executes.
6. The application starts `ARS.Renderer` and `ARS.Hover`.
7. It records a boot timestamp in the cache.
8. If the site is running over HTTP or HTTPS, it requests `pages.json`.
9. If the JSON is valid, it registers every page and generates the navigation menu.
10. If loading the JSON fails, it uses the hard-coded `FALLBACK_PAGES` array.
11. The router opens the route from the URL hash. If there is no hash, it opens `info`.
12. After the initial page loads, the router starts background preloading of the other configured routes when running over HTTP or HTTPS.

### Why script order matters

The current `index.html` intentionally loads:

```text
Engine/cache.js
Engine/renderer.js
Engine/hover.js
Engine/preloader.js
JS/router.js
JS/app.js
```

`JS/router.js` expects the cache and preloader APIs to exist. `JS/app.js` expects all engine modules and the router to exist. Reordering these scripts can cause `ARS` module references to be undefined.

---

## 7. How Routing Works

ARS uses the browser's URL hash as its route identifier.

Examples:

```text
http://localhost:8000/#info
http://localhost:8000/#status
http://localhost:8000/#start
http://localhost:8000/#contact
```

When the hash changes, the router receives the browser's `hashchange` event and calls its page-loading function.

### Route example

The following configuration:

```json
{
  "name": "contact",
  "title": "Contact",
  "path": "page/contact.html"
}
```

means:

- The route identifier is `contact`.
- The navigation label is `Contact`.
- The page fragment is loaded from `page/contact.html`.
- The route is opened with `#contact`.

### Route loading sequence

The current router follows this general sequence:

1. Check whether the route is registered or has an embedded fallback.
2. If the route is unknown, change the target to `info`.
3. Save the current route in the cache under `ars:route`.
4. Display the preloader.
5. Check the page cache using `ars:page:<route>`.
6. If cached, reuse the stored HTML.
7. If not cached and the browser is not using `file:`, attempt to fetch the configured page path.
8. If the fetch fails, try the matching embedded page.
9. If neither source exists, show an error page.
10. Insert the HTML into `#app`.
11. Re-execute inline scripts found in the inserted fragment.
12. Increase the renderer's render counter.
13. Save the measured page-load duration.
14. Complete and hide the preloader.
15. Update the active navigation link and scroll to the top.

### Navigation links

`JS/app.js` generates links using the route data:

```html
<a href="#contact" data-route="contact" class="nav-link">Contact</a>
```

The router adds the `active` class to the link whose `data-route` matches the current route.

---

## 8. How to Set Up ARS

### Requirements

- A modern browser such as Firefox, Chrome or Edge.
- The extracted ARS project directory.
- Python 3, Node.js with a static server command, or an editor with a local-server extension.

### Step 1 — Extract the project

Extract the ZIP archive into a directory, for example:

```text
~/Projects/ARS/
```

Open a terminal in that directory.

### Step 2 — Check the files

```bash
ls
```

You should see `index.html`, `pages.json`, `CSS`, `Engine`, `JS`, `page` and `Media`.

### Step 3 — Start a local server

Using Python:

```bash
python3 -m http.server 8000
```

Or, if you have the `serve` package available:

```bash
npx serve .
```

### Step 4 — Open ARS

For the Python server, open:

```text
http://localhost:8000
```

To open a specific route:

```text
http://localhost:8000/#info
http://localhost:8000/#status
http://localhost:8000/#start
```

### Why use a local server?

The application uses `fetch()` to read `pages.json` and the page fragments. Browsers generally restrict these requests when a page is opened directly through a `file://` URL. HTTP local development avoids that restriction and allows the framework to load the actual files.

### Direct file opening

The current project has a hard-coded fallback route list in `JS/app.js` and embedded fallback HTML in `JS/router.js` for `info`, `status` and `start`.

Important limitation: `myPage` and `contact` are configured as normal external page files but do not have matching embedded HTML strings in the router. Therefore, those pages are not guaranteed to work when the application is opened directly using `file://`. Use a local server for all project pages.

---

## 9. Creating a New Page — Main Developer Workflow

This is the normal way to extend the current ARS project.

### Step 1 — Create an HTML fragment

Inside the `page/` directory, create a file:

```text
page/about.html
```

Example content:

```html
<section class="page-center">
  <div class="glass box info-box">
    <h2>About My Project</h2>
    <p>This page is loaded by the ARS router.</p>
    <a href="#info">Back to Info</a>
  </div>
</section>
```

### Important page-file rules

A page fragment should contain only the content that belongs inside the application container.

Do not add another full document structure:

```html
<!-- Do not use these in a page fragment -->
<html>
<head>
<body>
```

The root `index.html` already provides those elements.

You can use normal HTML elements such as:

- `section`
- `div`
- `h1`, `h2`, `h3`
- `p`
- `ul`, `ol`, `li`
- `img`
- `a`
- `form`
- `input`
- `button`

You can reuse existing CSS classes such as `page-center`, `glass`, `box` and `info-box`.

### Step 2 — Register the new page in `pages.json`

Open `pages.json` and add a new object to the array:

```json
{
  "name": "about",
  "title": "About",
  "path": "page/about.html"
}
```

For example, the complete file could look like this:

```json
[
  {
    "name": "info",
    "title": "Info",
    "path": "page/info.html"
  },
  {
    "name": "status",
    "title": "Status",
    "path": "page/status.html"
  },
  {
    "name": "start",
    "title": "Start",
    "path": "page/start.html"
  },
  {
    "name": "myPage",
    "title": "My Page",
    "path": "page/myPage.html"
  },
  {
    "name": "contact",
    "title": "Contact",
    "path": "page/contact.html"
  },
  {
    "name": "about",
    "title": "About",
    "path": "page/about.html"
  }
]
```

Be careful with JSON syntax:

- Use double quotes around keys and string values.
- Separate objects with commas.
- Do not put a comma after the final object.
- Do not add JavaScript comments to JSON.

### Step 3 — Open the route

Restart or refresh the local page if necessary, then visit:

```text
http://localhost:8000/#about
```

The app reads the route configuration, generates its navigation link and loads the fragment.

### Step 4 — Verify the result

Check that:

- The page appears inside the main application area.
- The navigation link is visible.
- The correct navigation item becomes active.
- The URL hash is `#about`.
- The Status page's Total Pages value includes the route.

### A note about the fallback configuration

`JS/app.js` contains a `FALLBACK_PAGES` array used if `pages.json` cannot be fetched. If you want a newly created route to be registered in that fallback mode, add the same route object there too.

For direct `file://` support, you would also need to add the page's HTML string to the `embedded` object in `JS/router.js`. This creates a second copy of the page content, so a local HTTP server is the simpler and more maintainable development method.

---

## 10. Creating a Page With JavaScript

The router re-executes inline `<script>` elements found in a loaded page fragment. A page can therefore include a small script:

```html
<div class="glass box info-box">
  <h2 id="welcome-title">Welcome</h2>
  <button id="hello-button" type="button">Click me</button>
  <p id="hello-result"></p>
</div>

<script>
(function () {
  const button = document.getElementById("hello-button");
  const result = document.getElementById("hello-result");

  if (!button || !result) return;

  button.addEventListener("click", function () {
    result.textContent = "Hello from an ARS page!";
  });
})();
</script>
```

### Important lifecycle warning

The current router inserts page HTML and moves script elements into the document body to execute them. It does not provide a page-unmount hook or automatically remove event listeners, intervals or timeouts created by a page script.

For example, the current Status page starts a `setInterval()` that runs every 250 milliseconds. The current implementation does not clear that interval when the user navigates away. Repeated visits can therefore create multiple running intervals.

Recommended future improvement: introduce a page lifecycle contract, such as an initialization function and a cleanup function, so a page can stop timers and remove listeners before it is replaced.

---

## 11. Engine Module: Cache Management

**File:** `Engine/cache.js`

The cache stores values in a JavaScript `Map`. The current maximum target is 2 MB.

### Why ARS uses a cache

Without a cache, revisiting a page can require another network request. ARS stores the page HTML after it is loaded. On a later visit, the router can retrieve the HTML from memory.

### Cache key examples

```text
ars:boot
ars:route
ars:page:info
ars:page:status
ars:page:contact
ars:load:info
ars:load:status
```

### Available API

```js
ARS.Cache.set(key, value);
ARS.Cache.get(key);
ARS.Cache.has(key);
ARS.Cache.remove(key);
ARS.Cache.clear();
ARS.Cache.clear("ars:page:");
ARS.Cache.stats();
```

### API explanation

| Method | Purpose |
|---|---|
| `set(key, value)` | Stores a value |
| `get(key)` | Retrieves a value and marks it recently used |
| `has(key)` | Checks whether a key exists |
| `remove(key)` | Deletes one entry |
| `clear()` | Deletes all entries |
| `clear(prefix)` | Deletes entries whose keys start with a prefix |
| `stats()` | Returns byte usage, entry count, limit and keys |

### LRU behaviour

The cache uses a simple Least Recently Used strategy:

1. New or updated entries are placed at the end of the Map.
2. Reading an entry moves it to the end.
3. When the estimated cache size exceeds the 2 MB target, the oldest entries are removed until the total is within the target or only one entry remains.

The byte count is estimated using a `Blob` for strings and JSON-serialisable values. It is an approximate cache accounting value, not a measurement of the browser's total memory usage.

---

## 12. Engine Module: Renderer

**File:** `Engine/renderer.js`

The renderer module uses `requestAnimationFrame()` to collect frame timing information.

### What it measures

- FPS: frames counted during an approximately one-second measurement window.
- Frame time: time in milliseconds between animation frames.
- Render count: number of times the router reports that it inserted a page.
- Uptime: time since the renderer module was initialised.
- Running state: whether the animation loop is active.

### Available API

```js
ARS.Renderer.start();
ARS.Renderer.stop();

const stats = ARS.Renderer.stats();

function onFrame(frame) {
  // frame contains fps, frameTime and now
}

ARS.Renderer.onFrame(onFrame);
ARS.Renderer.offFrame(onFrame);
ARS.Renderer.markRender();
```

### Important distinction

The current `Renderer` is a frame-monitoring module. It does not itself construct page layouts, diff DOM trees, schedule component updates or replace the browser's rendering engine. The browser performs actual layout, paint and compositing. ARS uses the animation-frame loop to observe frame timing and expose statistics.

The current application starts the renderer during boot. The loop continues requesting animation frames while it is running.

---

## 13. Engine Module: Hover Analysis

**File:** `Engine/hover.js`

The hover module listens for `mouseover` and `mouseout` events on the document.

### Information collected

- Most recent hover target signature.
- Whether an element is currently being hovered.
- Accumulated hover time.
- Total hover event count.
- Average hover duration.
- Most frequently recorded target.
- Number of unique target signatures.

A target signature is built from the element's tag name and its class names. For example:

```text
button.primary
div.glass.box
a.nav-link
```

### Available API

```js
ARS.Hover.start();

const hoverStats = ARS.Hover.stats();
```

The current module starts once during application boot and prevents duplicate registration of its own document listeners.

### How to read the results

The Status page shows the latest target, hover duration, total hover count, most recorded target and number of tracked signatures.

### Current limitation

The implementation uses bubbling `mouseover` and `mouseout` events. Moving between nested elements can create extra events and influence the counts. The statistics are useful for simple interaction observation, but they should not be treated as precise user analytics.

The module currently observes pointer hover events. It does not implement cursor-distance prediction, proximity-based link preloading or a configurable hover radius.

---

## 14. Engine Module: Preloader

**File:** `Engine/preloader.js`

The preloader has two responsibilities.

### A. Loading overlay

The module controls the preloader elements defined in `index.html`.

```js
ARS.Preloader.show("Loading page...");
ARS.Preloader.setProgress(50);
ARS.Preloader.hide();
```

- `show(text)` displays the overlay and optionally changes its message.
- `setProgress(percent)` changes the progress bar width, clamped between 0 and 100.
- `hide()` removes the visible state.

The router uses these methods during page loading.

### B. Background page preloading

```js
ARS.Preloader.preload(
  "page/contact.html",
  "ars:page:contact"
);
```

The method fetches the page, checks the HTTP response, reads the HTML and stores it in the cache when a cache key is supplied. It returns `true` on success and `false` on failure.

After the first route has loaded, the router calls this method for the other configured routes when the app is running over HTTP or HTTPS.

### What preloading means in this version

The current code performs background fetching of configured page files. It does not use mouse position, cursor distance or hover intent to decide which page should be loaded. It also does not implement a five-centimetre cursor radius or predictive link-opening system.

Those behaviours would require an additional navigation-intent or hover-prediction module.

---

## 15. The Application Boot Module

**File:** `JS/app.js`

This file coordinates the modules and prepares the application.

Its responsibilities are:

1. Start the renderer.
2. Start hover analysis.
3. Save the boot timestamp.
4. Load the page configuration.
5. Register all routes with the router.
6. Build the navigation links.
7. Start the router.

### Navigation generation

For each page configuration object, `buildNav()` creates an anchor element. Its URL hash and `data-route` are based on the page's `name`, while its visible text uses `title` when available.

This means you do not need to manually create a navigation link in `index.html` for every new page when using the normal HTTP/HTTPS configuration flow.

### Fallback list

The file contains a `FALLBACK_PAGES` array. It is used if `pages.json` cannot be fetched or parsed successfully. Keep it in sync with `pages.json` if you need those fallback routes to be available.

---

## 16. The Router Module

**File:** `JS/router.js`

The router is responsible for:

- Route registration.
- Reading the current hash.
- Listening for `hashchange`.
- Choosing the target page.
- Checking the cache.
- Fetching the page fragment.
- Using embedded fallback HTML when available.
- Rendering the fragment.
- Executing page scripts.
- Updating navigation state.
- Recording page-load time.
- Showing an error view when a page cannot be loaded.

### Public API

```js
ARS.Router.register(name, url);
ARS.Router.start();
ARS.Router.load(name);
ARS.Router.current();
ARS.Router.pageCount();
```

### API explanation

| Method | Purpose |
|---|---|
| `register(name, url)` | Adds or updates a route |
| `start()` | Installs hash-change handling and loads the initial route |
| `load(name)` | Loads a route |
| `current()` | Returns the current route name |
| `pageCount()` | Counts the unique registered and embedded route names |

### Unknown route behaviour

If a requested route is not registered and has no embedded fallback, the router changes the target to `info`. If a route is registered but its file cannot be fetched and no embedded fallback exists, the router displays an error view.

---

## 17. Understanding the Status Page

**File:** `page/status.html`

The Status page is a practical demonstration of the engine APIs. It periodically reads engine statistics and writes the values into the page.

It currently displays:

| Display | Source |
|---|---|
| FPS | `ARS.Renderer.stats()` |
| Frame Time | `ARS.Renderer.stats()` |
| Renders | `ARS.Renderer.stats()` |
| Uptime | `ARS.Renderer.stats()` |
| Total Pages | `ARS.Router.pageCount()` |
| Cache Size | `ARS.Cache.stats()` |
| Cache Entries | `ARS.Cache.stats()` |
| JS Heap | `performance.memory`, when supported |
| Current Route | `ARS.Router.current()` |
| Page Load | `ars:load:<route>` cache entry |
| Hover Target | `ARS.Hover.stats()` |
| Hover Time | `ARS.Hover.stats()` |
| Total Hovers | `ARS.Hover.stats()` |
| Top Hovered | `ARS.Hover.stats()` |
| Elements Tracked | `ARS.Hover.stats()` |

The JavaScript update interval is currently 250 milliseconds.

`performance.memory` is not supported in every browser. The page displays `n/a` when that property is unavailable.

---

## 18. Page and Asset Organisation

A useful convention for future development is:

```text
page/
├── home.html
├── about.html
├── contact.html
├── services.html
└── dashboard.html

CSS/
├── main.css
└── pages/
    ├── about.css
    └── dashboard.css

JS/
├── app.js
├── router.js
└── pages/
    ├── about.js
    └── dashboard.js

Media/
├── images/
├── icons/
└── fonts/
```

This is a suggested organisation, not the exact structure currently present in the uploaded project. The current project has one main stylesheet and no separate page JavaScript directory.

When adding assets, use paths relative to the root application URL, for example:

```html
<img src="Media/images/profile.png" alt="Profile">
```

If you add separate CSS or JavaScript files, ensure the browser can load them from the local server and consider how they should be initialised and cleaned up when routes change.

---

## 19. Testing Checklist

Use this checklist after changing the project.

### Startup

- [ ] `index.html` loads without a blank screen.
- [ ] The browser console has no missing-script errors.
- [ ] The navigation menu is generated.
- [ ] The initial route opens.

### Routing

- [ ] `#info` opens the Info page.
- [ ] `#status` opens the Status page.
- [ ] `#start` opens the Start page.
- [ ] `#myPage` opens the custom page.
- [ ] `#contact` opens the Contact page.
- [ ] Browser back and forward navigation work.
- [ ] An unknown route falls back to Info.

### Page creation

- [ ] A new fragment is stored under `page/`.
- [ ] Its route entry is valid JSON.
- [ ] The navigation item appears.
- [ ] The page content is inserted into `#app`.
- [ ] The page does not contain a duplicate document structure.

### Cache and preloading

- [ ] First visit loads the page.
- [ ] A later visit can use the cached HTML.
- [ ] Cache statistics change as pages are stored.
- [ ] Background preloading works over HTTP/HTTPS.

### Engine diagnostics

- [ ] FPS and frame time are displayed.
- [ ] Render count increases after route rendering.
- [ ] Hover statistics change when moving the pointer.
- [ ] Cache size and entry count are displayed.
- [ ] Unsupported browser metrics show a fallback value.

### Browser tools

Open Developer Tools and inspect:

- **Console:** JavaScript errors and warnings.
- **Network:** requests for `pages.json` and page fragments.
- **Elements:** the contents of `main#app`.
- **Performance:** long tasks and repeated timers if the page is opened repeatedly.

---

## 20. Troubleshooting

### Problem: The page is blank

Check that the local server is running and that you opened the correct URL. Then inspect the browser console for script errors.

### Problem: A new page does not appear

Check all three values in `pages.json`:

- `name` matches the hash route.
- `title` is the navigation label.
- `path` points to the real HTML file.

Also verify that the JSON syntax is valid and that the filename's capitalisation matches exactly.

### Problem: Navigation is missing

Check that the `nav-links` element exists in `index.html`, that `JS/app.js` loaded and that the page configuration was successfully fetched or the fallback list was used.

### Problem: A page works on the server but not with `file://`

This is expected for pages that rely on `fetch()` and do not have embedded fallback HTML. Run a local server. The current embedded map only includes `info`, `status` and `start`.

### Problem: The preloader stays visible

Inspect the console and Network panel. A failed route load should enter the router's error path, but errors in other scripts or a malformed page can still affect the experience.

### Problem: Page JavaScript runs more than once

The current router does not clean up page-level timers or event listeners. A script that registers a global listener or starts an interval can remain active after navigation. Add cleanup support before building pages that create long-running work.

### Problem: Status values show `n/a`

Some browser performance properties are not standard across browsers. In particular, `performance.memory` is not universally available.

---

## 21. Current Implementation Limitations

The following points describe the uploaded source as it exists. They are not claims that the framework already solves these problems.

1. **No request cancellation:** the router does not abort an older page fetch when a user navigates rapidly to another route. A late response can potentially render after a newer navigation.
2. **No page cleanup lifecycle:** page timers, event listeners and other resources are not automatically cleaned up when a page is replaced.
3. **Duplicated fallback content:** selected pages are stored both as files and as strings in `JS/router.js`.
4. **Fallback lists require manual synchronisation:** `pages.json` and `FALLBACK_PAGES` can drift apart.
5. **Limited file-mode support:** only the routes with embedded HTML can reliably use the embedded fallback.
6. **Cache invalidation:** cached HTML is not automatically refreshed when the source file changes during the same session.
7. **Background preload scope:** all other configured routes are fetched after the first route loads; the current implementation does not use user intent to choose them.
8. **No route-level loading priority:** preloading does not currently prioritise pages based on likely navigation.
9. **Hover event noise:** nested mouse transitions can affect hover counts.
10. **Continuous animation-frame monitoring:** the renderer keeps requesting frames while running, even if no page update is needed.
11. **No virtual DOM:** page fragments are inserted with `innerHTML`; the framework does not implement virtual-DOM reconciliation.
12. **Inline script lifecycle risks:** dynamically re-executed scripts can create global side effects.
13. **No built-in component system:** reusable UI components must currently be authored with ordinary HTML/CSS/JavaScript.
14. **No build pipeline:** the current project does not include bundling, minification, automated tests or a production build command.
15. **No server-side routing:** route changes are client-side hash changes; this is not server-side page rendering.

---

## 22. Recommended Future Improvements

These are development recommendations for future ARS versions. They are not features confirmed in the current source.

### Priority 1 — Reliability

- Add an `AbortController` per route request.
- Ensure only the latest requested route can update the page.
- Add a page cleanup lifecycle.
- Clear intervals and timeouts when leaving a page.
- Handle missing page files and invalid route configuration consistently.
- Avoid inserting untrusted HTML without sanitisation.

### Priority 2 — Better cache behaviour

- Add cache expiry or version-based invalidation.
- Add a method to refresh a page from the server.
- Avoid duplicate concurrent fetches for the same route.
- Expose cache hit and miss counters.
- Consider separate limits for page HTML and other data.

### Priority 3 — Smarter preloading

- Add link-intent detection.
- Preload on pointer hover or keyboard focus with a short delay.
- Avoid fetching every page when the project becomes large.
- Prioritise likely next routes.
- Cancel or deprioritise speculative requests when bandwidth is limited.

### Priority 4 — Engine lifecycle and performance

- Allow the renderer to pause when the page is hidden.
- Make frame monitoring optional.
- Use `visibilitychange` to reduce background work.
- Improve hover tracking with `pointerover`/`pointerout` or carefully filtered events.
- Provide a single cleanup method for each page module.

### Priority 5 — Developer experience

- Add route validation.
- Add a page creation template.
- Add automated smoke tests.
- Add a clear development and production configuration.
- Add API documentation and versioning.
- Consider a plugin or module registration system for larger projects.

---

## 23. Security and Deployment Notes

ARS currently runs in the browser and loads HTML fragments into the DOM. Treat page content as trusted application code.

- Do not place passwords, private API keys or database credentials in `.env` files that are shipped to the browser.
- Do not insert user-supplied HTML directly with `innerHTML` unless it has been safely sanitised.
- Validate external data before using it in the DOM.
- Use HTTPS when deploying publicly.
- Configure the hosting server to serve the project files and correct MIME types.
- Keep third-party scripts to a minimum and load only trusted dependencies.
- Do not assume that hiding a value in JavaScript makes it secret.

For a real application that needs private credentials or database access, add a server-side API. The browser should call that API rather than connecting directly to a database with exposed credentials.

---

## 24. Deployment

ARS is a static front-end project in its current form. It can be hosted on a static hosting provider that serves HTML, CSS, JavaScript and JSON files.

Before deployment:

1. Confirm that all referenced files exist.
2. Confirm that `pages.json` is included.
3. Check that page paths and asset paths use the correct letter case.
4. Remove private or unnecessary local files from the deployment.
5. Do not publish secrets in `.env`.
6. Test the deployed site over HTTPS.
7. Open each route directly using its hash URL.
8. Check the browser console and Network panel.

Because the router uses hash-based routing, the route identifier remains after the `#` and does not require the server to resolve a separate path for each page.

---

## 25. Quick Reference

### Add a page

1. Create `page/pageName.html`.
2. Add `{ "name": "pageName", "title": "Page Name", "path": "page/pageName.html" }` to `pages.json`.
3. If needed, add the route to `FALLBACK_PAGES` for configuration fallback.
4. Run a local server and open `#pageName`.

### Run the project

```bash
cd /path/to/ARS
python3 -m http.server 8000
```

Open `http://localhost:8000`.

### Useful browser-console commands

```js
ARS.Router.current();
ARS.Router.pageCount();

ARS.Cache.stats();
ARS.Cache.clear();

ARS.Renderer.stats();
ARS.Hover.stats();

ARS.Preloader.show("Testing...");
ARS.Preloader.setProgress(50);
ARS.Preloader.hide();
```

### Main source files

| File | Responsibility |
|---|---|
| `index.html` | Application shell |
| `pages.json` | Route configuration |
| `JS/app.js` | Application boot and navigation generation |
| `JS/router.js` | Route loading and page insertion |
| `Engine/cache.js` | In-memory LRU cache |
| `Engine/renderer.js` | FPS and frame-time monitoring |
| `Engine/hover.js` | Hover event statistics |
| `Engine/preloader.js` | Loading overlay and background page fetching |
| `CSS/main.css` | Main visual design |
| `page/status.html` | Engine status demonstration |

---

## 26. Conclusion

ARS provides a compact foundation for building multi-page front-end projects without introducing a large framework dependency. Its central idea is straightforward: keep one application shell running, place page fragments in a dedicated directory, describe routes in a configuration file and let a small router load those fragments into the main container.

The engine modules add useful supporting capabilities: an in-memory cache, background page fetching, a loading overlay, frame statistics and hover observations. The sample pages demonstrate how these modules can be used and monitored.

The current implementation is suitable for learning, prototypes and small static front-end projects. Before using it as the foundation for a large or production-critical application, the most important next steps are request cancellation, page cleanup, cache invalidation, safer HTML handling and more selective preloading.

**The core development rule is simple: create the page fragment, register it in `pages.json`, run the project through a local server and open its hash route.**
