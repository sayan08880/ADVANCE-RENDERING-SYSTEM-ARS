/* ============================================================
   ARS ENGINE — Mouse Hover Analysis
   Tracks hovered element, live hover time, hover counts and
   the most hovered element ("heat map").
   API: ARS.Hover.start | stats
   ============================================================ */
window.ARS = window.ARS || {};

ARS.Hover = (function () {
  let started = false;
  let current = null, currentSince = 0;
  let totalHovers = 0, totalHoverMs = 0, lastTarget = "—";
  const heat = new Map();   // element signature -> hover count

  function signature(el) {
    if (!el || !el.tagName) return "—";
    let sig = el.tagName.toLowerCase();
    if (typeof el.className === "string" && el.className.trim()) {
      sig += "." + el.className.trim().replace(/\s+/g, ".");
    }
    return sig;
  }

  function onOver(e) {
    if (current) totalHoverMs += performance.now() - currentSince;
    current = e.target;
    currentSince = performance.now();
    totalHovers++;
    lastTarget = signature(current);
    heat.set(lastTarget, (heat.get(lastTarget) || 0) + 1);
  }

  function onOut(e) {
    if (current && e.target === current) {
      totalHoverMs += performance.now() - currentSince;
      current = null;
    }
  }

  function start() {
    if (started) return;
    started = true;
    document.addEventListener("mouseover", onOver, true);
    document.addEventListener("mouseout", onOut, true);
  }

  function topHeat() {
    let top = "—", max = 0;
    heat.forEach(function (count, sig) {
      if (count > max) { max = count; top = sig; }
    });
    return { element: top, count: max };
  }

  function stats() {
    const live = current ? performance.now() - currentSince : 0;
    return {
      target: lastTarget,
      hovering: !!current,
      hoverMs: Math.round(totalHoverMs + live),
      totalHovers: totalHovers,
      avgHoverMs: totalHovers ? Math.round((totalHoverMs + live) / totalHovers) : 0,
      top: topHeat(),
      tracked: heat.size
    };
  }

  return { start: start, stats: stats };
})();
