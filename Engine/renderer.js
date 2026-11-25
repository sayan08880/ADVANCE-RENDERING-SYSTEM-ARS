/* ============================================================
   ARS ENGINE — Rendering Core
   requestAnimationFrame loop with live FPS / frame-time stats.
   API: ARS.Renderer.start | stop | onFrame | offFrame | stats | markRender
   ============================================================ */
window.ARS = window.ARS || {};

ARS.Renderer = (function () {
  let running = false;
  let frames = 0, fps = 0, frameTime = 0;
  let lastFrame = performance.now(), windowStart = lastFrame, bootAt = lastFrame;
  let renderCount = 0;
  const listeners = new Set();

  function loop(now) {
    if (!running) return;
    frameTime = now - lastFrame;
    lastFrame = now;
    frames++;
    if (now - windowStart >= 1000) { fps = frames; frames = 0; windowStart = now; }
    listeners.forEach(function (fn) {
      try { fn({ fps: fps, frameTime: frameTime, now: now }); } catch (e) {}
    });
    requestAnimationFrame(loop);
  }

  function start() { if (!running) { running = true; requestAnimationFrame(loop); } }
  function stop()  { running = false; }
  function onFrame(fn)  { listeners.add(fn); return fn; }
  function offFrame(fn) { listeners.delete(fn); }

  function stats() {
    return {
      fps: fps,
      frameTime: +frameTime.toFixed(2),
      renders: renderCount,
      uptime: +((performance.now() - bootAt) / 1000).toFixed(0),
      running: running
    };
  }

  function markRender() { renderCount++; }

  return { start: start, stop: stop, onFrame: onFrame, offFrame: offFrame,
           stats: stats, markRender: markRender };
})();
