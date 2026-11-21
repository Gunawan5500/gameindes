// Test & Verification Suite for Battle-Smith RPG Skill Engine (CD-1.02b, CD-2.01 SWTOR Discipline + Loadout, CD-3 Smith Class, & WD Monster Integration)
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createSkillEngine, computeMonsterStats, getTotalStatPointsForLevel, getStatCapForLevel } from "./skill_engine.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillDataPath = path.join(__dirname, "skill_data.json");
const skillData = JSON.parse(fs.readFileSync(skillDataPath, "utf8"));

const engine = createSkillEngine(skillData);

console.log("=== 1. VERIFIKASI STRUKTUR DATA (60 SUB-STAT & 150 NODE SWTOR) ===");
const statsList = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
let totalSubStats = 0;
let totalNodes = 0;

for (const s of statsList) {
  const subs = skillData.sub_stats[s].length;
  const tiers = skillData.disciplines[s].tiers;
  const nodesInStat = tiers.reduce((acc, t) => acc + 1 + t.utility_choices.length + 1, 0);
  totalSubStats += subs;
  totalNodes += nodesInStat;
  console.log(`- ${s} (${skillData.disciplines[s].discipline_name}): ${subs} Sub-Stat | ${nodesInStat} Skill Nodes (5 Core Passive, 15 Utility Choices, 5 Active Rotation)`);
}
console.log(`Total Sub-Stat: ${totalSubStats} (Target: 60) | Total Skill Nodes: ${totalNodes} (Target: 150)\n`);

console.log("=== 2. UJI BUILD TIER 1 (Lv30, 71 Poin Stat, Cap 30) ===");
const lv30Stats = { STR: 30, DEX: 12, CON: 18, INT: 5, WIS: 3, CHA: 3 }; // Total = 71 poin
const lv30Sim = engine.simulateBattle({
  level: 30,
  stats: lv30Stats,
  focusSubStats: { STR: ["str_raw_might", "str_armor_crush"], CON: ["con_max_vitality", "con_mitigate"] },
  selectedUtilities: { STR_T1: "str_t1_u1" },
  loadout: [
    { activeId: "str_t1_a", modIds: ["str_t1_u1"] }
  ],
  smithConfig: { primaryType: "Weaponsmith", primaryRank: 2 },
  wdEnemy: { name: "Briarfall Brute Lv30", lvl: 30, role: "Brute", type: "Reguler", el: "Earth", weak: "Fire" }
});
console.log("Ringkasan Pemain Lv30:", lv30Sim.playerSummary);
console.log("Stat Musuh WD Lv30:", lv30Sim.monsterSummary);
console.log("Metrik Tempur Lv30:", lv30Sim.metrics);
console.log("");

console.log("=== 3. UJI BUILD ENDGAME TIER 5 (Lv150, 311 Poin Stat, Cap 150) — CROSS-STAT MODDING & RUNESMITH ===");
// Membaca 1 sampel musuh Lv150 nyata dari data/areas WD jika ada
let realWdEnemy150 = { name: "Hollowfrost Apex Boss Lv150", lvl: 150, role: "Caster", type: "Reguler", el: "Ice", weak: "Fire" };
try {
  const areaFile = path.join(__dirname, "../../data/areas/crownfrost_isle.json");
  if (fs.existsSync(areaFile)) {
    const areaData = JSON.parse(fs.readFileSync(areaFile, "utf8"));
    const enemies = areaData.enemies || areaData.monsters || (Array.isArray(areaData) ? areaData : []);
    const found = enemies.find(e => e.lvl === 150) || enemies[enemies.length - 1];
    if (found) realWdEnemy150 = found;
  }
} catch (e) {
  // fallback
}

// Lv150: Total Poin = 13 + 2*(149) = 311 poin.
// Contoh Build: STR 150 (Penuh), CON 80 (Syarat Perk Hibrida Tingkat 5 STR+CON >= 75), INT 50 (4 Slot Macro + Cross-Stat Element Mod), DEX 21, WIS 5, CHA 5 = 311 poin
const lv150Stats = { STR: 150, CON: 80, INT: 50, DEX: 21, WIS: 5, CHA: 5 };
console.log(`Cek Poin Lv150: ${Object.values(lv150Stats).reduce((a, b) => a + b, 0)} / ${getTotalStatPointsForLevel(150)} (Cap: ${getStatCapForLevel(150)})`);

const lv150Focus = {
  STR: ["str_raw_might", "str_armor_crush"],
  CON: ["con_max_vitality", "con_mitigate"],
  INT: ["int_macro_capacity", "int_weakness_exploit"],
  DEX: ["dex_attack_speed", "dex_accuracy"]
};

const lv150Utilities = {
  STR_T1: "str_t1_u1", // Sundering Edge
  STR_T2: "str_t2_u1", // Bloodied Cleave
  STR_T3: "str_t3_u1", // Impaling Follow-up
  STR_T4: "str_t4_u1", // Executioner's Arc
  STR_T5: "str_t5_u1", // Worldbreaker Wrath
  CON_T1: "con_t1_u2", // Granite Skin
  CON_T2: "con_t2_u2", // Unbreakable Poise
  INT_T1: "int_t1_u1", // Adaptive Element (Auto-match enemy weak!)
  INT_T2: "int_t2_u3", // Macro Subroutine
  DEX_T1: "dex_t1_u1"  // Razor Tempo
};

// Pasang 4 Skill Aktif di Macro Bar (karena INT 50 x 1.25 Fokus = 62.5 -> 4 Slot) dengan Cross-Stat Mods dari INT, DEX, CON!
const lv150Loadout = [
  { activeId: "str_t1_a", modIds: ["str_t1_u1", "dex_t1_u1"] }, // Builder STR + Mod DEX (Cross-Stat!)
  { activeId: "str_t3_a", modIds: ["str_t3_u1", "int_t1_u1"] }, // Core Combo STR + Mod Adaptive Element INT (Cross-Stat!)
  { activeId: "str_t5_a", modIds: ["str_t5_u1", "str_t4_u1"] }, // Apex Capstone STR
  { activeId: "con_t2_a", modIds: ["con_t2_u2", "con_t1_u2"] }  // Defensive Active CON
];

const lv150Mastery = engine.evaluateSmithMastery(lv150Stats, { primaryType: "Weaponsmith", primaryRank: 5 });
console.log("Evaluasi Smith Class & Perk Hibrida Lv150:", {
  smithClass: `${lv150Mastery.titlePrefix} ${lv150Mastery.primaryType}`,
  craftBonusPct: lv150Mastery.craftBonusPct,
  eligibleSingleStatPerks: lv150Mastery.eligibleSingleStatPerks,
  eligibleHybridPairPerks: lv150Mastery.eligibleHybridPairPerks
});

const lv150Sim = engine.simulateBattle({
  level: 150,
  stats: lv150Stats,
  focusSubStats: lv150Focus,
  selectedUtilities: lv150Utilities,
  loadout: lv150Loadout,
  smithConfig: { primaryType: "Weaponsmith", primaryRank: 5 },
  weapon: { stat: "STR", tier: 5, rarity: "Unique", enhancePlus: 25, tag: "Dekat", element: "Fire", budget: { damage: 35, speed: 15, accuracy: 15, defense: 5, trigger: 30 } },
  armorClass: "sedang",
  armorElement: realWdEnemy150.el || "Ice",
  armorSlotsSameElement: 5,
  apprenticeSeed: "APR-7F3A-Kael",
  apprenticeSkill: 85,
  apprenticeTrials: 2,
  wdEnemy: realWdEnemy150
});

console.log("Ringkasan Pemain Lv150 (+25 Unique & Companion Seed):", lv150Sim.playerSummary);
console.log("Stat Musuh WD Lv150:", lv150Sim.monsterSummary);
console.log("Metrik Tempur Lv150:", lv150Sim.metrics);
console.log("Sampel Log Rotasi Skill SWTOR:", lv150Sim.combatLogSample.slice(0, 6));

console.log("\n=== 4. VERIFIKASI CD-1.08 (ANTI-FARM), CD-4.02 (+N TANPA BATAS SEIMBANG), CD-6.02 (SEED MURID), & CD-7 (KUTUKAN GATE & LONG REST) ===");
console.log("- Anti-Farm (Pemain Lv150 vs Monster Lv120, delta -30):", engine.computeAntiFarmMultipliers(150, 120, 20));
console.log("- Anti-Farm (Pemain Lv150 vs Monster Lv142, delta -8):", engine.computeAntiFarmMultipliers(150, 142, 20));
console.log("- Enhance +15 (Overforge):", engine.computeWeaponEnhancement(15, false, 30, 5));
console.log("- Enhance +30 (Transcendent Infinite):", engine.computeWeaponEnhancement(30, false, 30, 5));
console.log("- Seed Murid #1 (APR-7F3A-Kael, Skill 85, 2 Ujian):", engine.generateApprenticeFromSeed("APR-7F3A-Kael", 85, 2));
console.log("- Seed Murid #2 (APR-99B1-Lyra, Skill 62, 1 Ujian):", engine.generateApprenticeFromSeed("APR-99B1-Lyra", 62, 1));
console.log("- Kutukan Gate Tier 5 & Biaya Long Rest (Cabang Sendiri vs Penginapan):", {
  ownBranch: engine.computeGateCurseAndRest({ level: 150, gateTier: 5, activeCurseStacks: 2, atOwnWorkshopOrBranch: true, conCurseResistPct: 20 }),
  townInn: engine.computeGateCurseAndRest({ level: 150, gateTier: 5, activeCurseStacks: 2, atOwnWorkshopOrBranch: false, conCurseResistPct: 20 })
});

