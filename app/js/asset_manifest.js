/**
 * Battle-Smith RPG — Fase 4 & 5 Dual-Tier Offline Asset Manifest (.webp Resolver)
 * - Tahap 1 (HP Oppo A54 / APK): Pre-baked .webp dari app/assets/ (atau inline preview)
 * - Tahap 2 (Laptop Live): Opsional komposit layer Mini-Pack dari app/assets/lpc_parts/
 *   secara deterministik per seed NPC saat Lite Mode OFF.
 */
(function (global) {
  "use strict";

  const RELATIVE_PATHS = {
    sprite_hero: "assets/sprites/hero_smith_5f.webp",
    sprite_beast: "assets/sprites/enemy_beast_5f.webp",
    sprite_undead: "assets/sprites/enemy_undead_5f.webp",
    sprite_humanoid: "assets/sprites/enemy_humanoid_5f.webp",
    sprite_orc: "assets/sprites/enemy_orc_5f.webp",
    sprite_boss: "assets/sprites/boss_titan_5f.webp",
    sprite_boss_humanoid: "assets/sprites/boss_humanoid_5f.webp",
    ui_avatar_hero: "assets/ui/avatar_hero.webp",
    ui_forge_anvil: "assets/ui/forge_anvil.webp",
    ui_banner_wilds: "assets/ui/banner_wilds.webp",
    ui_banner_boss: "assets/ui/banner_boss_arena.webp",
    portrait_kael: "assets/ui/portraits/portrait_kael.webp",
    portrait_lyra: "assets/ui/portraits/portrait_lyra.webp",
    portrait_garrick: "assets/ui/portraits/portrait_garrick.webp",
    portrait_vesper: "assets/ui/portraits/portrait_vesper.webp",
    portrait_thorne: "assets/ui/portraits/portrait_thorne.webp"
  };

  let stage2Manifest = null;
  let stage2Checked = false;

  function hashSeed(str) {
    let h = 2166136261 >>> 0;
    const s = String(str || "seed");
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  }

  function get(key) {
    const inline = global.__BSRPG_INLINE_ASSETS;
    if (inline && inline[key]) return inline[key];
    return RELATIVE_PATHS[key] || "";
  }

  /**
   * Memilih potret .webp untuk 5 Murid AI Seed (Kael, Lyra, Garrick, Vesper, Thorne).
   */
  function getApprenticePortrait(seed) {
    const low = String(seed || "").toLowerCase();
    for (const name of ["kael", "lyra", "garrick", "vesper", "thorne"]) {
      if (low.includes(name)) return get(`portrait_${name}`);
    }
    return get("ui_avatar_hero");
  }

  /**
   * Tahap 2 (Laptop): Cek secara pasif apakah Mini-Pack LPC (assets/lpc_parts/manifest_lpc_parts.json) tersedia.
   */
  function probeStage2MiniPack() {
    if (stage2Checked || global.__BSRPG_INLINE_ASSETS || typeof global.fetch !== "function") return;
    stage2Checked = true;
    global.fetch("assets/lpc_parts/manifest_lpc_parts.json")
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (data && data.slots) stage2Manifest = data;
      })
      .catch(() => {
        // Mode HP / APK tanpa lpc_parts -> fallback mulus ke Tahap 1 pre-baked .webp
      });
  }

  /**
   * Merender potret Dual-Tier: jika Stage 2 Mini-Pack aktif di Laptop & Lite Mode OFF,
   * susun layer deterministik per seed; jika tidak, pakai potret pre-baked Tahap 1 (.webp).
   */
  function renderDualTierPortraitHtml(seed, altName, sizePx = 42) {
    const isLite = Boolean(global.BSRPG_PERF && global.BSRPG_PERF.getState().liteMode);
    if (stage2Manifest && !isLite && stage2Manifest.slots?.body?.length) {
      const h = hashSeed(seed);
      const pick = arr => (arr && arr.length ? arr[h % arr.length] : null);
      const b = pick(stage2Manifest.slots.body);
      const hd = pick(stage2Manifest.slots.head);
      const t = pick(stage2Manifest.slots.torso);
      const hr = pick(stage2Manifest.slots.hair);
      const layers = [b, hd, t, hr].filter(Boolean);
      if (layers.length) {
        return `<span class="lpc-portrait-stack" style="position:relative;display:inline-block;width:${sizePx}px;height:${sizePx}px;border-radius:8px;overflow:hidden;border:1px solid #334b63;background:#101a27;flex-shrink:0" title="LPC Stage 2 Live (${seed})">${layers
          .map(l => `<img src="${l.file}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;image-rendering:pixelated" />`)
          .join("")}</span>`;
      }
    }
    const url = getApprenticePortrait(seed);
    return `<img src="${url}" alt="${altName || "NPC"}" style="width:${sizePx}px;height:${sizePx}px;border-radius:8px;border:1px solid #334b63;object-fit:cover;image-rendering:pixelated;flex-shrink:0" />`;
  }

  /**
   * Pemetaan Hibrida Monster:
   * - Humanoid, Undead, Orc/Goblin, & Boss Humanoid -> slot sprite LPC 5-frame
   * - Beast/Wolf/Treant/Wyrm & Titan Non-Humanoid -> slot sprite monster khusus
   */
  function getEnemySpriteInfo(monster) {
    if (!monster) {
      return { key: "sprite_beast", label: "Beast 5-Frame", url: get("sprite_beast") };
    }
    const type = String(monster.type || "").toLowerCase();
    const text = `${monster.name || ""} ${monster.family || ""} ${monster.archetype || ""}`.toLowerCase();

    if (type.includes("boss") || text.includes("gate") || text.includes("guardian")) {
      if (/warlord|lord|knight|priest|cultist|captain|commander|king|emperor|paladin|bandit|warden/.test(text)) {
        return { key: "sprite_boss_humanoid", label: "Boss Humanoid LPC 5-Frame", url: get("sprite_boss_humanoid") };
      }
      return { key: "sprite_boss", label: "Boss Titan 5-Frame", url: get("sprite_boss") };
    }
    if (/wraith|ghost|specter|skeleton|bone|undead|lich|golem|construct|spirit|shadow|phantom|shade|wisp|revenant|zombie/.test(text)) {
      return { key: "sprite_undead", label: "Undead LPC 5-Frame", url: get("sprite_undead") };
    }
    if (/orc|goblin|ogre|troll|lizard|kobold|gnoll|demon|imp|minotaur/.test(text)) {
      return { key: "sprite_orc", label: "Orc/Monster LPC 5-Frame", url: get("sprite_orc") };
    }
    if (/bandit|raider|cultist|knight|guard|scout|mercenary|assassin|rogue|mage|priest|pirate|corsair|warrior|hunter|smith|reaver|brigand|soldier/.test(text)) {
      return { key: "sprite_humanoid", label: "Humanoid LPC 5-Frame", url: get("sprite_humanoid") };
    }
    return { key: "sprite_beast", label: "Beast 5-Frame", url: get("sprite_beast") };
  }

  probeStage2MiniPack();

  global.BSRPG_ASSETS = {
    RELATIVE_PATHS,
    get,
    getApprenticePortrait,
    renderDualTierPortraitHtml,
    hasStage2Parts() { return Boolean(stage2Manifest); },
    getEnemySpriteInfo
  };
})(typeof window !== "undefined" ? window : globalThis);
