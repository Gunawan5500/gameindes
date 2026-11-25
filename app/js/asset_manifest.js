/**
 * Battle-Smith RPG — Fase 4 Offline Asset Manifest (.webp Resolver)
 * Mendukung mode file terpisah (app/assets/* untuk Capacitor APK) maupun
 * mode standalone preview (window.__BSRPG_INLINE_ASSETS data URI).
 */
(function (global) {
  "use strict";

  const RELATIVE_PATHS = {
    sprite_hero: "assets/sprites/hero_smith_5f.webp",
    sprite_beast: "assets/sprites/enemy_beast_5f.webp",
    sprite_undead: "assets/sprites/enemy_undead_5f.webp",
    sprite_humanoid: "assets/sprites/enemy_humanoid_5f.webp",
    sprite_boss: "assets/sprites/boss_titan_5f.webp",
    ui_avatar_hero: "assets/ui/avatar_hero.webp",
    ui_forge_anvil: "assets/ui/forge_anvil.webp",
    ui_banner_wilds: "assets/ui/banner_wilds.webp",
    ui_banner_boss: "assets/ui/banner_boss_arena.webp"
  };

  function get(key) {
    const inline = global.__BSRPG_INLINE_ASSETS;
    if (inline && inline[key]) return inline[key];
    return RELATIVE_PATHS[key] || "";
  }

  /**
   * Memilih kategori sprite 5-frame musuh berdasarkan tipe & nama monster WD.
   */
  function getEnemySpriteInfo(monster) {
    if (!monster) {
      return { key: "sprite_beast", label: "Beast 5-Frame", url: get("sprite_beast") };
    }
    const type = String(monster.type || "").toLowerCase();
    const text = `${monster.name || ""} ${monster.family || ""} ${monster.archetype || ""}`.toLowerCase();

    if (type.includes("boss") || text.includes("gate") || text.includes("guardian") || text.includes("king") || text.includes("lord")) {
      return { key: "sprite_boss", label: "Boss Titan 5-Frame", url: get("sprite_boss") };
    }
    if (/wraith|ghost|specter|skeleton|bone|undead|lich|golem|construct|spirit|shadow|phantom|shade|wisp|revenant|treant/.test(text)) {
      return { key: "sprite_undead", label: "Spectral/Construct 5-Frame", url: get("sprite_undead") };
    }
    if (/bandit|raider|cultist|knight|guard|scout|mercenary|assassin|rogue|mage|priest|pirate|corsair|warrior|hunter|smith|reaver|brigand|soldier/.test(text)) {
      return { key: "sprite_humanoid", label: "Humanoid/Raider 5-Frame", url: get("sprite_humanoid") };
    }
    return { key: "sprite_beast", label: "Beast 5-Frame", url: get("sprite_beast") };
  }

  global.BSRPG_ASSETS = {
    RELATIVE_PATHS,
    get,
    getEnemySpriteInfo
  };
})(typeof window !== "undefined" ? window : globalThis);
