/**
 * Battle-Smith RPG — Auto-Generated Custom Itch.io Asset Manifest
 * Dihasilkan otomatis oleh: npm run import:assets (tools/import_itch_assets.py)
 * JANGAN edit manual jika tidak perlu — cukup taruh file di assets/itch_raw/ lalu jalankan ulang.
 */
(function (global) {
  "use strict";

  const CUSTOM_RELATIVE_PATHS = {
  "mon_abyssal_creature": "assets/monsters/abyssal_creature.webp",
  "mon_animated_stone_golem": "assets/monsters/animated_stone_golem.webp",
  "mon_plague_alchemist": "assets/monsters/plague_alchemist.webp",
  "mon_azure_ember_wraith": "assets/monsters/azure_ember_wraith.webp",
  "mon_abyssal_necromancer": "assets/monsters/abyssal_necromancer.webp"
};

  const CUSTOM_PACKS = {
  "weapons": [],
  "armors": [],
  "materials": [],
  "skills": [],
  "monsters": [
    {
      "key": "mon_abyssal_creature",
      "slug": "abyssal_creature",
      "path": "assets/monsters/abyssal_creature.webp",
      "w": 64,
      "h": 64
    },
    {
      "key": "mon_animated_stone_golem",
      "slug": "animated_stone_golem",
      "path": "assets/monsters/animated_stone_golem.webp",
      "w": 64,
      "h": 64
    },
    {
      "key": "mon_plague_alchemist",
      "slug": "plague_alchemist",
      "path": "assets/monsters/plague_alchemist.webp",
      "w": 64,
      "h": 64
    },
    {
      "key": "mon_azure_ember_wraith",
      "slug": "azure_ember_wraith",
      "path": "assets/monsters/azure_ember_wraith.webp",
      "w": 64,
      "h": 64
    },
    {
      "key": "mon_abyssal_necromancer",
      "slug": "abyssal_necromancer",
      "path": "assets/monsters/abyssal_necromancer.webp",
      "w": 64,
      "h": 64
    }
  ],
  "ui": [],
  "portraits": []
};

  if (global.BSRPG_ASSETS && global.BSRPG_ASSETS.RELATIVE_PATHS) {
    Object.assign(global.BSRPG_ASSETS.RELATIVE_PATHS, CUSTOM_RELATIVE_PATHS);
    global.BSRPG_ASSETS.CUSTOM_PACKS = CUSTOM_PACKS;

    // Helper: ambil ikon senjata/armor/material/skill kustom berdasarkan ID atau nama
    global.BSRPG_ASSETS.getCustomIcon = function (category, slugOrId) {
      const list = CUSTOM_PACKS[category] || [];
      if (!list.length) return "";
      const norm = String(slugOrId || "").toLowerCase().replace(/[^a-z0-9]+/g, "_");
      const exact = list.find(item => item.slug === norm || item.key === norm);
      if (exact) return exact.path;
      // Fallback deterministik berdasarkan hash agar tiap item selalu konsisten
      let h = 2166136261 >>> 0;
      for (let i = 0; i < norm.length; i++) {
        h ^= norm.charCodeAt(i);
        h = Math.imul(h, 16777619) >>> 0;
      }
      return list[h % list.length].path;
    };

    // Helper: ambil sprite monster kustom (jika ada di app/assets/monsters/) secara deterministik
    global.BSRPG_ASSETS.getCustomMonsterUrl = function (monster) {
      const list = CUSTOM_PACKS.monsters || [];
      if (!list.length || !monster) return "";
      const text = `${monster.name || ""} ${monster.family || monster.famili || ""}`.toLowerCase();
      // Coba cocokkan kata kunci famili terlebih dahulu
      const keywords = [
        [/wraith|spirit|ghost|frost|azure|ice/, /wraith|spirit|ghost|frost|azure/],
        [/golem|construct|stone|iron|mimic/, /golem|construct|stone|iron|mimic/],
        [/plague|alchemist|bandit|humanoid|cultist/, /plague|alchemist|hunter|doctor/],
        [/undead|necro|skeleton|lich|reaper/, /necro|reaper|skeleton|undead|lich/],
        [/abyss|void|boss|demon|horror/, /abyss|void|demon|horror/]
      ];
      for (const [mRe, aRe] of keywords) {
        if (mRe.test(text)) {
          const hit = list.find(x => aRe.test(x.slug));
          if (hit) return hit.path;
        }
      }
      // Fallback deterministik berdasarkan nama monster
      const seed = String(monster.id || monster.name || "mon");
      let h = 2166136261 >>> 0;
      for (let i = 0; i < seed.length; i++) {
        h ^= seed.charCodeAt(i);
        h = Math.imul(h, 16777619) >>> 0;
      }
      return list[h % list.length].path;
    };
  }
})(typeof window !== "undefined" ? window : globalThis);
