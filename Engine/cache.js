/* ============================================================
   ARS ENGINE — Cache Management System
   In-memory LRU cache with byte-size tracking.
   API: ARS.Cache.set | get | has | remove | clear | stats
   ============================================================ */
window.ARS = window.ARS || {};

ARS.Cache = (function () {
  const store = new Map();                      // key -> { value, bytes }
  const MAX_BYTES = 2 * 1024 * 1024;            // 2 MB soft limit

  function byteSize(value) {
    try {
      return new Blob([typeof value === "string" ? value : JSON.stringify(value)]).size;
    } catch (e) {
      return String(value).length;
    }
  }

  function evictIfNeeded() {
    let total = stats().bytes;
    while (total > MAX_BYTES && store.size > 1) {
      const oldest = store.keys().next().value; // LRU: first key
      total -= store.get(oldest).bytes;
      store.delete(oldest);
    }
  }

  function set(key, value) {
    if (store.has(key)) store.delete(key);      // refresh position (LRU)
    store.set(key, { value: value, bytes: byteSize(value) });
    evictIfNeeded();
  }

  function get(key) {
    if (!store.has(key)) return undefined;
    const entry = store.get(key);
    store.delete(key);                          // move to most-recent
    store.set(key, entry);
    return entry.value;
  }

  function has(key) { return store.has(key); }
  function remove(key) { return store.delete(key); }

  function clear(prefix) {
    if (!prefix) { store.clear(); return; }
    for (const k of [...store.keys()]) if (k.startsWith(prefix)) store.delete(k);
  }

  function stats() {
    let bytes = 0;
    store.forEach(function (e) { bytes += e.bytes; });
    return {
      bytes: bytes,
      kb: +(bytes / 1024).toFixed(2),
      entries: store.size,
      maxBytes: MAX_BYTES,
      keys: [...store.keys()]
    };
  }

  return { set: set, get: get, has: has, remove: remove, clear: clear, stats: stats };
})();
