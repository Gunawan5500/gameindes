/**
 * Battle-Smith RPG — Fase 4 Offline Audio Manager (.ogg SFX)
 * Ringan untuk Oppo A54 (pool max 2 node/SFX), aman terhadap kebijakan autoplay
 * browser, dan menyimpan pengaturan Mute/Volume secara offline di localStorage.
 */
(function (global) {
  "use strict";

  const STORAGE_KEY = "bsrpg_audio_v1";
  const SFX_PATHS = {
    ui_click: "assets/audio/sfx_ui_click.ogg",
    forge_hammer: "assets/audio/sfx_forge_hammer.ogg",
    coin: "assets/audio/sfx_coin.ogg",
    slash: "assets/audio/sfx_slash.ogg",
    rest: "assets/audio/sfx_rest.ogg",
    victory: "assets/audio/sfx_victory.ogg"
  };

  let state = { muted: false, volume: 0.65 };
  let unlocked = false;
  const pools = Object.create(null);

  function loadSettings() {
    try {
      const raw = global.localStorage && global.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.muted === "boolean") state.muted = parsed.muted;
        if (typeof parsed.volume === "number" && Number.isFinite(parsed.volume)) {
          state.volume = Math.max(0, Math.min(1, parsed.volume));
        }
      }
    } catch (_) {}
  }

  function saveSettings() {
    try {
      if (global.localStorage) {
        global.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      }
    } catch (_) {}
  }

  function resolveSrc(name) {
    const inline = global.__BSRPG_INLINE_ASSETS;
    const inlineKey = `audio_${name}`;
    if (inline && inline[inlineKey]) return inline[inlineKey];
    return SFX_PATHS[name] || "";
  }

  function getPool(name) {
    if (!pools[name]) {
      const src = resolveSrc(name);
      if (!src || typeof global.Audio !== "function") return null;
      const nodes = [];
      for (let i = 0; i < 2; i++) {
        const a = new global.Audio();
        a.preload = "auto";
        a.src = src;
        a.volume = state.muted ? 0 : state.volume;
        nodes.push(a);
      }
      pools[name] = { nodes, idx: 0 };
    }
    return pools[name];
  }

  function syncPoolVolumes() {
    const vol = state.muted ? 0 : state.volume;
    for (const k of Object.keys(pools)) {
      for (const node of pools[k].nodes) {
        node.volume = vol;
      }
    }
  }

  function unlockAudio() {
    unlocked = true;
  }

  if (typeof global.addEventListener === "function") {
    global.addEventListener("pointerdown", unlockAudio, { once: true, passive: true });
    global.addEventListener("keydown", unlockAudio, { once: true, passive: true });
  }

  function play(name) {
    if (state.muted || state.volume <= 0.001) return false;
    if (!SFX_PATHS[name]) return false;
    try {
      const pool = getPool(name);
      if (!pool) return false;
      const node = pool.nodes[pool.idx % pool.nodes.length];
      pool.idx = (pool.idx + 1) % pool.nodes.length;
      node.volume = state.volume;
      try {
        node.currentTime = 0;
      } catch (_) {}
      const p = node.play();
      if (p && typeof p.catch === "function") {
        p.catch(() => {
          // Abaikan NotAllowedError/AbortError sesuai kebijakan autoplay browser
        });
      }
      return true;
    } catch (_) {
      return false;
    }
  }

  function setMuted(muted) {
    state.muted = Boolean(muted);
    syncPoolVolumes();
    saveSettings();
    return getState();
  }

  function toggleMute() {
    return setMuted(!state.muted);
  }

  function setVolume(vol01) {
    const v = Number(vol01);
    if (!Number.isFinite(v)) return getState();
    state.volume = Math.max(0, Math.min(1, v));
    if (state.volume > 0 && state.muted) state.muted = false;
    syncPoolVolumes();
    saveSettings();
    return getState();
  }

  function getState() {
    return {
      muted: state.muted,
      volume: state.volume,
      volumePct: Math.round(state.volume * 100),
      unlocked,
      sfxKeys: Object.keys(SFX_PATHS)
    };
  }

  loadSettings();

  global.BSRPG_AUDIO = {
    SFX_PATHS,
    play,
    setMuted,
    toggleMute,
    setVolume,
    getState,
    testSound() {
      unlocked = true;
      return play("forge_hammer");
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
