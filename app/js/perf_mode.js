/**
 * Battle-Smith RPG — Fase 5 Lite Mode Oppo A54 & Micro-FX Controller
 * Mengatur Lite Mode (hemat GPU/baterai, RAM < 150 MB) yang tersimpan offline
 * di localStorage, serta memicu micro-animasi ringan secara aman.
 */
(function (global) {
  "use strict";

  const STORAGE_KEY = "bsrpg_perf_v1";
  let state = { liteMode: false };

  function load() {
    try {
      const raw = global.localStorage && global.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.liteMode === "boolean") state.liteMode = parsed.liteMode;
      }
    } catch (_) {}
  }

  function save() {
    try {
      if (global.localStorage) {
        global.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      }
    } catch (_) {}
  }

  function applyBodyClass() {
    if (typeof document !== "undefined" && document.body) {
      document.body.classList.toggle("mode-lite", state.liteMode);
    }
  }

  function setLiteMode(enabled) {
    state.liteMode = Boolean(enabled);
    applyBodyClass();
    save();
    return getState();
  }

  function toggleLiteMode() {
    return setLiteMode(!state.liteMode);
  }

  function pulseClass(selectorOrEl, className, durationMs = 360) {
    if (state.liteMode) return false;
    const el = typeof selectorOrEl === "string"
      ? (typeof document !== "undefined" ? document.querySelector(selectorOrEl) : null)
      : selectorOrEl;
    if (!el) return false;
    el.classList.remove(className);
    // Force reflow agar animasi bisa dipicu ulang secara bersih
    void el.offsetWidth;
    el.classList.add(className);
    global.setTimeout(() => {
      el.classList.remove(className);
    }, durationMs);
    return true;
  }

  function getMemoryStats() {
    const cacheKeys = global.__BSRPG_AREA_CACHE ? Object.keys(global.__BSRPG_AREA_CACHE) : [];
    const jsHeapMb = (global.performance && global.performance.memory)
      ? Number((global.performance.memory.usedJSHeapSize / (1024 * 1024)).toFixed(1))
      : null;
    return {
      liteMode: state.liteMode,
      areasInRam: Math.max(1, cacheKeys.length),
      totalAreas: 16,
      jsHeapMb
    };
  }

  function getState() {
    return {
      liteMode: state.liteMode,
      ...getMemoryStats()
    };
  }

  load();
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", applyBodyClass, { once: true });
    } else {
      applyBodyClass();
    }
  }

  global.BSRPG_PERF = {
    getState,
    setLiteMode,
    toggleLiteMode,
    pulseClass,
    getMemoryStats
  };
})(typeof window !== "undefined" ? window : globalThis);
