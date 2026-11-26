/**
 * Battle-Smith RPG — Manual Visual Asset Overrides
 * Dihasilkan otomatis oleh Battle-Smith Asset Sorter Studio (tools/asset_sorter_studio.py)
 * Prioritas #1 di atas auto-matching!
 */
(function (global) {
  "use strict";

  const OVERRIDES = {
  "ui_forge": {},
  "weapons": {},
  "armors": {},
  "skills": {},
  "materials": {},
  "monsters": {}
};

  function slug(str) {
    return String(str || "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  }

  if (global.BSRPG_ASSETS) {
    const A = global.BSRPG_ASSETS;
    A.MANUAL_OVERRIDES = OVERRIDES;

    // 1. Timpa UI & Peta langsung ke RELATIVE_PATHS
    if (OVERRIDES.ui_forge && A.RELATIVE_PATHS) {
      for (const [k, v] of Object.entries(OVERRIDES.ui_forge)) {
        if (v) A.RELATIVE_PATHS[k] = v;
      }
    }

    // 2. Bungkus getCustomIcon agar cek pilihan manual dulu
    const origGetIcon = typeof A.getCustomIcon === "function" ? A.getCustomIcon.bind(A) : () => "";
    A.getCustomIcon = function (category, slugOrId) {
      const map = OVERRIDES[category] || {};
      const rawKey = String(slugOrId || "");
      if (map[rawKey]) return map[rawKey];
      const s = slug(rawKey);
      if (map[s]) return map[s];
      return origGetIcon(category, slugOrId);
    };

    // 3. Bungkus getCustomMonsterUrl agar cek Boss spesifik & 10 Famili manual dulu
    const origGetMon = typeof A.getCustomMonsterUrl === "function" ? A.getCustomMonsterUrl.bind(A) : () => "";
    A.getCustomMonsterUrl = function (monster) {
      const map = OVERRIDES.monsters || {};
      if (monster) {
        const bossKey = "boss_" + slug(monster.name || "");
        if (map[bossKey]) return map[bossKey];
        const fam = slug(monster.famili || monster.family || "");
        if (fam && map["fam_" + fam]) return map["fam_" + fam];
        const txt = `${monster.name || ""} ${monster.type || ""}`.toLowerCase();
        if (txt.includes("boss") && map.fam_boss_default) return map.fam_boss_default;
        const guesses = [
          [/wolf|bear|stag|boar|cougar|raven|hound|beast/, "fam_beast"],
          [/skeleton|undead|lich|necro|reaper|zombie|ghoul|bone/, "fam_undead"],
          [/wraith|ghost|spirit|phantom|shade|specter/, "fam_spirit"],
          [/golem|construct|automaton|mimic|sentinel/, "fam_construct"],
          [/treant|spore|fung|vine|plant|thorn/, "fam_plant"],
          [/crab|kraken|jelly|tide|sea|aquatic|shark|eel/, "fam_aquatic"],
          [/spider|beetle|wasp|ant|insect|mantis/, "fam_insect"],
          [/wyrm|drake|dragon|wyvern/, "fam_dragonkin"],
          [/sprite|elemental|flame|frost|ember|storm/, "fam_elemental"],
          [/bandit|knight|cultist|plague|raider|assassin|guard|hunter|warrior/, "fam_humanoid"]
        ];
        for (const [re, fk] of guesses) {
          if (re.test(txt) && map[fk]) return map[fk];
        }
      }
      return origGetMon(monster);
    };
  }
})(typeof window !== "undefined" ? window : globalThis);
