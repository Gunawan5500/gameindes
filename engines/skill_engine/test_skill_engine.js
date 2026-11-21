// Test & Verification Suite for Battle-Smith RPG Skill Engine (CD v3.3)
// Memverifikasi:
// 1. 60 Sub-Stat (CD-1.02b) + 125 Node 5 Pohon Skill Tipe Smith + 29 Kartu Destiny + 48 Active Weapon Skills [W]
// 2. RF Classic "Use-to-Level" Mastery (Lv.1 -> Lv.7 / GM) via manual & Idle Battle 8 Jam
// 3. 29 Kartu Destiny (Pure, Dual Berarah 2+2 tie-breaker, Multi-Class Polymath/Omnismith) & Jalur Ganda Ganti Destiny
// 4. Rotasi Anti-Spam GCD (1.3d) + Cooldown + Weapon Skill [W] + Class Buff (RF) + Efek Signature Destiny
// 5. Kompatibilitas mundur (legacy v3.2 loadout) & seluruh aturan LOCKED v3.2 (CD-1.08, CD-3.03, CD-4.02, CD-6.02, CD-7)
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createSkillEngine, getTotalStatPointsForLevel, getStatCapForLevel } from "./skill_engine.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillDataPath = path.join(__dirname, "skill_data.json");
const skillData = JSON.parse(fs.readFileSync(skillDataPath, "utf8"));
const engine = createSkillEngine(skillData);

console.log("=== 1. VERIFIKASI STRUKTUR DATA CD v3.3 (60 SUB-STAT, 125 NODE SMITH, 29 DESTINY, 48 WEAPON SKILLS) ===");
const statsList = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
const smithList = ["Weaponsmith", "Armorer", "Rangesmith", "Runesmith", "Reforger"];

const totalSubStats = statsList.reduce((acc, s) => acc + skillData.sub_stats[s].length, 0);
assert.equal(totalSubStats, 60, "Harus tepat 60 Sub-Stat");
assert.equal(skillData.gcd_sec, 1.3, "GCD Anti-Spam harus 1.3 detik");
assert.equal(skillData.skill_mastery_levels.length, 7, "Skala RF Mastery harus Lv.1..Lv.7 (GM)");

let totalActives = 0;
let totalPassives = 0;
let totalMorphs = 0;
for (const cls of smithList) {
  const tree = skillData.smith_skill_trees[cls];
  assert.ok(tree, `Pohon ${cls} harus ada`);
  assert.equal(tree.tiers.length, 5, `${cls} harus punya 5 Tier`);
  for (const t of tree.tiers) {
    totalActives += 1;
    totalPassives += 1;
    totalMorphs += t.morph_choices.length;
    assert.equal(t.morph_choices.length, 3, `${cls} T${t.tier} harus punya 3 pilihan Morph`);
  }
  console.log(`- ${cls} (${tree.class_progression.join(" -> ")}): 5 Active/Buff, 5 Core Passive, 15 Morph | Resource: ${tree.resource.name}`);
}

const totalClassNodes = totalActives + totalPassives + totalMorphs;
const destinyCards = Object.values(skillData.destiny_cards);
const pureCount = destinyCards.filter(c => c.category === "pure").length;
const dualCount = destinyCards.filter(c => c.category === "dual").length;
const multiCount = destinyCards.filter(c => c.category === "multi").length;
const weaponSkillCount = Object.keys(skillData.weapon_skills).length;

assert.equal(totalClassNodes, 125, "Total Node 5 Pohon Smith harus 125");
assert.equal(destinyCards.length, 29, "Total Kartu Destiny harus 29");
assert.equal(pureCount, 5);
assert.equal(dualCount, 20);
assert.equal(multiCount, 4);
assert.equal(weaponSkillCount, 48, "Total Weapon Skill [W] harus 48");
console.log(`PASS Struktur v3.3: ${totalSubStats} Sub-Stat | ${totalClassNodes} Node Class (${totalActives}A/${totalPassives}P/${totalMorphs}M) | ${destinyCards.length} Kartu Destiny (${pureCount}/${dualCount}/${multiCount}) | ${weaponSkillCount} Weapon Skills [W]\n`);

console.log("=== 2. VERIFIKASI RF CLASSIC 'USE-TO-LEVEL' (Lv.1 -> Lv.7 / GM) & IDLE TRAINING ===");
const lv30Stats = { STR: 30, DEX: 12, CON: 18, INT: 5, WIS: 3, CHA: 3 };
let masteryState = {};

// Di Lv.1 (0 XP): Active terbuka, Core Passive & Morph masih terkunci!
const unlockedLv1 = engine.getUnlockedNodes(lv30Stats, {}, { primaryType: "Weaponsmith", primaryRank: 2 }, masteryState);
assert.equal(unlockedLv1.unlockedActives.length, 2, "Tier 2 Weaponsmith membuka 2 Active/Buff");
assert.equal(unlockedLv1.unlockedPassives.length, 0, "Di Lv.1, Core Passive harus masih terkunci");
assert.equal(unlockedLv1.unlockedMorphs.length, 0, "Di Lv.1, Morph harus masih terkunci");

// Latih Tempered Cleave (wpn_t1_a) sampai Lv.3 (55 XP) -> Core Passive terbuka!
let trainRes = engine.trainSkillMastery(masteryState, "wpn_t1_a", 55);
masteryState = trainRes.masteryState;
assert.equal(trainRes.nextStage.label, "Lv.3");
assert.ok(trainRes.unlockedMilestones.includes("core_passive"), "Lv.3 wajib buka core_passive");
const unlockedLv3 = engine.getUnlockedNodes(lv30Stats, {}, { primaryType: "Weaponsmith", primaryRank: 2 }, masteryState);
assert.equal(unlockedLv3.unlockedPassives.length, 1, "Core Passive T1 harus terbuka di Lv.3");
assert.equal(unlockedLv3.unlockedMorphs.length, 0, "Morph belum terbuka di Lv.3");

// Latih sampai Lv.5 (+135 XP = 190 XP) -> Pilihan Morph 1-dari-3 terbuka!
trainRes = engine.trainSkillMastery(masteryState, "wpn_t1_a", 135);
masteryState = trainRes.masteryState;
assert.equal(trainRes.nextStage.label, "Lv.5");
assert.ok(trainRes.unlockedMilestones.includes("morph_choice"), "Lv.5 wajib buka morph_choice");
const unlockedLv5 = engine.getUnlockedNodes(lv30Stats, { Weaponsmith_T1: "wpn_t1_m3" }, { primaryType: "Weaponsmith", primaryRank: 2 }, masteryState);
assert.equal(unlockedLv5.unlockedMorphs.length, 1);
assert.equal(unlockedLv5.unlockedMorphs[0].id, "wpn_t1_m3", "Pilihan Morph Forge Synergy (Sharp Alloy) harus terpilih");

// Latih sampai GM (+260 XP = 450 XP) -> +40% efektivitas, -10% CD, GM Morph Peak (1.25x)!
trainRes = engine.trainSkillMastery(masteryState, "wpn_t1_a", 260);
masteryState = trainRes.masteryState;
assert.equal(trainRes.nextStage.label, "GM");
assert.equal(trainRes.nextStage.effectivenessBonusPct, 40);
assert.equal(trainRes.nextStage.cdrPct, 10);
assert.equal(trainRes.nextStage.morphMultiplier, 1.25);
assert.ok(trainRes.unlockedMilestones.includes("gm_morph_peak"));

// Latih via Mode Idle Battle 8 Jam untuk skill lain + Weapon Skill [W]
const idleTrain = engine.trainSkillsFromIdle(masteryState, ["wpn_t2_a"], "wsk_w_str_1", 8);
assert.ok(idleTrain.masteryState.wpn_t2_a >= 190, "Idle 8 jam harus menaikkan Class Buff ke minimal Lv.5");
assert.ok(idleTrain.masteryState.wsk_w_str_1 >= 250, "Idle 8 jam harus ikut melatih Weapon Skill [W]");
console.log("PASS RF Mastery Progression:", {
  wpn_t1_a: engine.getSkillMasteryStage(idleTrain.masteryState.wpn_t1_a).label,
  idleGains: idleTrain.skillGains
});
console.log("");

console.log("=== 3. VERIFIKASI 29 KARTU DESTINY & JALUR GANDA GANTI DESTINY (MISI GUILD / BAYAR / SHADOW SYNDICATE) ===");
// Cek Dual Berarah + Tie-Breaker 2+2
const spellbladeDestiny = engine.resolveActiveDestinyCard({ Weaponsmith: 3, Runesmith: 2 });
assert.equal(spellbladeDestiny.activeCard.id, "Spellblade");
assert.ok(spellbladeDestiny.unlockedCards.some(c => c.id === "pure_weaponsmith"), "Pure Weaponsmith juga ada di koleksi");
assert.ok(spellbladeDestiny.unlockedCards.some(c => c.id === "pure_runesmith"), "Pure Runesmith juga ada di koleksi");

const hexbladeTie = engine.resolveActiveDestinyCard({ Weaponsmith: 2, Runesmith: 2 }, null, "Runesmith");
assert.equal(hexbladeTie.activeCard.id, "Hexblade", "Seri 2+2 dengan Runesmith diambil lebih dulu harus menjadi Hexblade");

// Cek Multi-Class Polymath (+1 Slot Macro!) & Omnismith (Buka 48 Senjata!)
const polymathBuild = engine.buildMacroLoadout({
  stats: { STR: 20, DEX: 20, CON: 20, INT: 30, WIS: 20, CHA: 20 },
  smithConfig: { tiers: { Runesmith: 2, Reforger: 2, Weaponsmith: 1 } }
});
assert.equal(polymathBuild.activeDestinyCard.id, "Polymath");
assert.equal(polymathBuild.maxSlots, 5, "INT 30 (4 slot) + Polymath (+1 slot) = 5 slot Macro Bar!");

const omniMastery = engine.evaluateSmithMastery(
  { STR: 50, DEX: 50, CON: 50, INT: 50, WIS: 50, CHA: 50 },
  { tiers: { Weaponsmith: 1, Armorer: 1, Rangesmith: 1, Runesmith: 1, Reforger: 1 } }
);
assert.equal(omniMastery.activeDestinyCard.id, "Omnismith");
const omniCompat = omniMastery.checkWeaponCompatibility({ id: "w_int_6", stat: "INT", tier: 5, tag: "Jauh", trigger: "Astral Nova" });
assert.equal(omniCompat.isCompatible, true);
assert.equal(omniCompat.unlockedByOmnismith, true, "Omnismith bebas memakai 48 senjata tanpa penalti");

// Uji Jalur Ganda Ganti Destiny pada Spellblade (koleksi: Spellblade, pure_weaponsmith, pure_runesmith)
const switchFailNoTrial = engine.evaluateDestinySwitch({
  currentCardId: "Spellblade", targetCardId: "pure_weaponsmith",
  smithTiers: { Weaponsmith: 3, Runesmith: 2 }, level: 90, method: "trial", trialCompleted: false
});
assert.equal(switchFailNoTrial.allowed, false);
assert.equal(switchFailNoTrial.reason, "TRIAL_NOT_COMPLETED");

const switchPassTrial = engine.evaluateDestinySwitch({
  currentCardId: "Spellblade", targetCardId: "pure_weaponsmith",
  smithTiers: { Weaponsmith: 3, Runesmith: 2 }, level: 90, method: "trial", trialCompleted: true
});
assert.equal(switchPassTrial.allowed, true);
assert.equal(switchPassTrial.costBronze, 0);

const switchFailPoor = engine.evaluateDestinySwitch({
  currentCardId: "Spellblade", targetCardId: "pure_runesmith",
  smithTiers: { Weaponsmith: 3, Runesmith: 2 }, level: 90, method: "gold", playerBronze: 50000
});
assert.equal(switchFailPoor.allowed, false);
assert.equal(switchFailPoor.reason, "INSUFFICIENT_BRONZE");
assert.equal(switchFailPoor.costBronze, 135000, "Lv90 T3 = 500 * 90 * 3 = 135,000 br (13g 50s)");

const switchHostileTrialBlocked = engine.evaluateDestinySwitch({
  currentCardId: "Spellblade", targetCardId: "pure_runesmith",
  smithTiers: { Weaponsmith: 3, Runesmith: 2 }, level: 90, method: "trial", trialCompleted: true, isFactionHostile: true
});
assert.equal(switchHostileTrialBlocked.allowed, false);
assert.equal(switchHostileTrialBlocked.reason, "FACTION_HOSTILE_USE_SYNDICATE_GOLD");

const switchHostileSyndicate = engine.evaluateDestinySwitch({
  currentCardId: "Spellblade", targetCardId: "pure_runesmith",
  smithTiers: { Weaponsmith: 3, Runesmith: 2 }, level: 90, method: "gold", isFactionHostile: true, playerBronze: 250000
});
assert.equal(switchHostileSyndicate.allowed, true);
assert.equal(switchHostileSyndicate.broker, "Shadow Syndicate");
assert.equal(switchHostileSyndicate.costBronze, 202500, "Hostile Shadow Syndicate +50% = 202,500 br");

const switchLockedCard = engine.evaluateDestinySwitch({
  currentCardId: "Spellblade", targetCardId: "Omnismith",
  smithTiers: { Weaponsmith: 3, Runesmith: 2 }, level: 90, method: "gold", playerBronze: 9999999
});
assert.equal(switchLockedCard.allowed, false);
assert.equal(switchLockedCard.reason, "DESTINY_LOCKED");
console.log("PASS Dual-Path Destiny Switch:", {
  trialFree: switchPassTrial.reason,
  guildGoldLv90T3: `${switchFailPoor.costBronze} br`,
  hostileSyndicateLv90T3: `${switchHostileSyndicate.costBronze} br (${switchHostileSyndicate.broker})`
});
console.log("");

console.log("=== 4. VERIFIKASI SIMULASI TEMPUR ANTI-SPAM (GCD 1.3d + CD + WEAPON SKILL [W] + SPELLBLADE + ARCHBLADE + OMNISMITH) ===");
// 4A. Spellblade Lv120 (Weaponsmith 3 + Runesmith 2)
const spellbladeStats = { STR: 90, DEX: 30, CON: 60, INT: 50, WIS: 15, CHA: 6 };
const spellbladeFresh = engine.simulateBattle({
  level: 120,
  stats: spellbladeStats,
  smithConfig: { tiers: { Weaponsmith: 3, Runesmith: 2 } },
  skillMasteryState: {}, // Semua skill baru Lv.1!
  loadout: ["wpn_t1_a", "wpn_t2_a", "run_t1_a", "run_t2_a"],
  weapon: { id: "w_str_4", stat: "STR", tier: 4, rarity: "Epic", enhancePlus: 12, tag: "Dekat", trigger: "Thunderclap", element: "Fire", budget: { damage: 35, speed: 15, accuracy: 15, defense: 5, trigger: 30 } },
  wdEnemy: { name: "Frostfang Alpha Lv120", lvl: 120, role: "Brute", type: "Mini Boss", el: "Ice", weak: "Fire" }
});

const spellbladeGM = engine.simulateBattle({
  level: 120,
  stats: spellbladeStats,
  smithConfig: { tiers: { Weaponsmith: 3, Runesmith: 2 } },
  skillMasteryState: { wpn_t1_a: 450, wpn_t2_a: 450, run_t1_a: 450, run_t2_a: 450, wsk_w_str_4: 450 }, // Semua GM!
  selectedMorphs: { Weaponsmith_T1: "wpn_t1_m1", Runesmith_T1: "run_t1_m1" },
  loadout: ["wpn_t1_a", "wpn_t2_a", "run_t1_a", "run_t2_a"],
  weapon: { id: "w_str_4", stat: "STR", tier: 4, rarity: "Epic", enhancePlus: 12, tag: "Dekat", trigger: "Thunderclap", element: "Fire", budget: { damage: 35, speed: 15, accuracy: 15, defense: 5, trigger: 30 } },
  wdEnemy: { name: "Frostfang Alpha Lv120", lvl: 120, role: "Brute", type: "Mini Boss", el: "Ice", weak: "Fire" }
});

assert.equal(spellbladeGM.playerSummary.activeDestinyCard.id, "Spellblade");
assert.ok(spellbladeGM.metrics.minGapBetweenCastsSec >= 1.3, `Anti-Spam GCD dilanggar! minGap=${spellbladeGM.metrics.minGapBetweenCastsSec}`);
assert.ok(spellbladeGM.metrics.weaponSkillsCastCount > 0, "Weapon Skill [W] wajib terpakai dalam rotasi");
assert.ok(spellbladeGM.metrics.classBuffsCastCount > 0, "Class Buff (RF) wajib terpakai dalam rotasi");
assert.ok(spellbladeGM.metrics.destinySignaturesTriggered > 0, "Signature Spellblade (Rune Mark) wajib terpicu");
assert.ok(spellbladeGM.metrics.dps > spellbladeFresh.metrics.dps, `GM DPS (${spellbladeGM.metrics.dps}) harus lebih tinggi dari Lv.1 DPS (${spellbladeFresh.metrics.dps})`);
assert.ok(Object.keys(spellbladeGM.metrics.skillUsesDelta).length >= 3, "skillUsesDelta harus mencatat pemakaian skill untuk latihan RF");

// 4B. Archblade Endgame Lv150 (Weaponsmith 5 Murni + Apex Ultimate + Companion Seed + Legacy Compat Check)
let realWdEnemy150 = { name: "Hollowfrost Apex Boss Lv150", lvl: 150, role: "Caster", type: "Reguler", el: "Ice", weak: "Fire" };
try {
  const areaFile = path.join(__dirname, "../../data/areas/crownfrost_isle.json");
  if (fs.existsSync(areaFile)) {
    const areaData = JSON.parse(fs.readFileSync(areaFile, "utf8"));
    const enemies = areaData.enemies || areaData.monsters || (Array.isArray(areaData) ? areaData : []);
    const found = enemies.find(e => e.lvl === 150) || enemies[enemies.length - 1];
    if (found) realWdEnemy150 = found;
  }
} catch (_) { /* fallback */ }

const lv150Stats = { STR: 150, CON: 80, INT: 50, DEX: 21, WIS: 5, CHA: 5 };
assert.equal(Object.values(lv150Stats).reduce((a, b) => a + b, 0), getTotalStatPointsForLevel(150));
assert.equal(getStatCapForLevel(150), 150);

const archbladeSim = engine.simulateBattle({
  level: 150,
  stats: lv150Stats,
  focusSubStats: {
    STR: ["str_raw_might", "str_armor_crush"],
    CON: ["con_max_vitality", "con_mitigate"],
    INT: ["int_macro_capacity", "int_weakness_exploit"],
    DEX: ["dex_attack_speed", "dex_accuracy"]
  },
  selectedMorphs: { Weaponsmith_T4: "wpn_t4_m3", Weaponsmith_T5: "wpn_t5_m1" },
  loadout: ["wpn_t1_a", "wpn_t2_a", "wpn_t4_a", "wpn_t5_a"],
  smithConfig: { primaryType: "Weaponsmith", primaryRank: 5, selectedPerkT3: "STR", selectedPerkT5: "STR+CON" },
  skillMasteryState: { wpn_t1_a: 450, wpn_t2_a: 450, wpn_t4_a: 450, wpn_t5_a: 450, wsk_w_str_6: 450 },
  weapon: { id: "w_str_6", stat: "STR", tier: 5, rarity: "Unique", enhancePlus: 25, tag: "Dekat", trigger: "Earthbreaker", element: "Fire", budget: { damage: 35, speed: 15, accuracy: 15, defense: 5, trigger: 30 } },
  armorClass: "sedang",
  armorElement: realWdEnemy150.el || "Ice",
  armorSlotsSameElement: 5,
  apprenticeSeed: "APR-7F3A-Kael",
  apprenticeSkill: 85,
  apprenticeTrials: 2,
  wdEnemy: realWdEnemy150
});
assert.equal(archbladeSim.playerSummary.smithClass, "Archblade");
assert.equal(archbladeSim.playerSummary.activeDestinyCard.name, "Archblade");
assert.equal(archbladeSim.playerSummary.weaponSkill.name, "Earthbreaker");
assert.ok(archbladeSim.metrics.minGapBetweenCastsSec >= 1.3);
assert.ok(archbladeSim.metrics.killsPerHpBar >= 1.0);

// Pastikan skillUsesDelta dari simulasi tempur bisa langsung diumpankan ke trainSkillMastery
let postBattleMastery = {};
for (const [sId, uses] of Object.entries(spellbladeFresh.metrics.skillUsesDelta)) {
  postBattleMastery = engine.trainSkillMastery(postBattleMastery, sId, uses).masteryState;
}
assert.ok(Object.values(postBattleMastery).some(xp => xp > 0), "Hasil cast di battle harus menambah XP RF Mastery");

// 4C. Omnismith Lv150 (1+1+1+1+1 — 3-Class Omni-Surge + Bebas 48 Senjata!)
const omniSim = engine.simulateBattle({
  level: 150,
  stats: { STR: 65, DEX: 55, CON: 60, INT: 75, WIS: 36, CHA: 20 },
  smithConfig: { tiers: { Weaponsmith: 1, Armorer: 1, Rangesmith: 1, Runesmith: 1, Reforger: 1 } },
  loadout: ["wpn_t1_a", "run_t1_a", "ref_t1_a", "rng_t1_a", "arm_t1_a"],
  weapon: { id: "w_dex_6", stat: "DEX", tier: 5, rarity: "Legendary", enhancePlus: 15, tag: "Jauh", trigger: "Piercing Shot", element: "Lightning", budget: { damage: 25, speed: 25, accuracy: 20, defense: 5, trigger: 25 } },
  wdEnemy: realWdEnemy150
});
assert.equal(omniSim.playerSummary.activeDestinyCard.id, "Omnismith");
assert.equal(omniSim.playerSummary.weaponCompatibility.unlockedByOmnismith, true);
assert.ok(omniSim.metrics.destinySignaturesTriggered > 0, "Omnismith wajib memicu Omni-Surge dari rantai 3 Smith Class berbeda!");
assert.ok(omniSim.metrics.minGapBetweenCastsSec >= 1.3);

// 4D. Backward-Compatibility Test: Legacy v3.2 Loadout (`str_t1_a`) tidak boleh crash!
const legacyCompatSim = engine.simulateBattle({
  level: 30,
  stats: lv30Stats,
  selectedUtilities: { STR_T1: "str_t1_u1" },
  loadout: [{ activeId: "str_t1_a", modIds: ["str_t1_u1"] }],
  smithConfig: { primaryType: "Weaponsmith", primaryRank: 2 },
  wdEnemy: { name: "Briarfall Brute Lv30", lvl: 30, role: "Brute", type: "Reguler", el: "Earth", weak: "Fire" }
});
assert.ok(legacyCompatSim.metrics.skillsCastCount > 0, "Legacy v3.2 loadout harus otomatis dipetakan ke skill v3.3");

console.log("PASS Spellblade Lv120:", {
  freshLv1Dps: spellbladeFresh.metrics.dps,
  gmLv7Dps: spellbladeGM.metrics.dps,
  minGapSec: spellbladeGM.metrics.minGapBetweenCastsSec,
  weaponSkillCasts: spellbladeGM.metrics.weaponSkillsCastCount,
  classBuffCasts: spellbladeGM.metrics.classBuffsCastCount,
  runeMarkProcs: spellbladeGM.metrics.destinySignaturesTriggered
});
console.log("PASS Archblade Lv150:", {
  dps: archbladeSim.metrics.dps,
  killsPerHpBar: archbladeSim.metrics.killsPerHpBar,
  weaponSkill: archbladeSim.playerSummary.weaponSkill,
  sampleLog: archbladeSim.combatLogSample.slice(0, 5)
});
console.log("PASS Omnismith Lv150:", {
  dps: omniSim.metrics.dps,
  omniSurges: omniSim.metrics.destinySignaturesTriggered,
  weaponUnlockedByOmni: omniSim.playerSummary.weaponCompatibility.unlockedByOmnismith
});
console.log("");

console.log("=== 5. VERIFIKASI ATURAN LOCKED v3.2 (CD-1.08 ANTI-FARM, CD-4.02 +N, CD-6.02 MURID SEED v3.3, CD-7 GATE CURSE) ===");
const afZero = engine.computeAntiFarmMultipliers(150, 120, 20);
assert.equal(afZero.xpMult, 0);
assert.equal(afZero.baseDropMult, 0.25);

const enh15 = engine.computeWeaponEnhancement(15, false, 30, 5);
const enh30 = engine.computeWeaponEnhancement(30, false, 30, 5);
assert.equal(enh15.powerBonusPct, 115);
assert.ok(enh30.powerBonusPct > enh15.powerBonusPct);
assert.equal(enh30.canBreakWeapon, false);

const app1 = engine.generateApprenticeFromSeed("APR-7F3A-Kael", 85, 2);
assert.ok(app1.aiCombatSkills.length >= 1, "Murid Seed AI wajib punya skill dari 5 Pohon Smith v3.3");
assert.ok(app1.destinyCard, "Murid Seed AI wajib punya Kartu Destiny v3.3");

const restOwn = engine.computeGateCurseAndRest({ level: 150, gateTier: 5, activeCurseStacks: 2, atOwnWorkshopOrBranch: true, conCurseResistPct: 20 });
const restInn = engine.computeGateCurseAndRest({ level: 150, gateTier: 5, activeCurseStacks: 2, atOwnWorkshopOrBranch: false, conCurseResistPct: 20 });
assert.equal(restOwn.longRest.baseRestCostBr, 0);
assert.ok(restInn.longRest.totalLongRestCostBr > restOwn.longRest.totalLongRestCostBr);

console.log("PASS Murid Seed v3.3:", {
  seed: app1.seed,
  smithClass: app1.smithClass,
  destinyCard: app1.destinyCard,
  aiCombatSkills: app1.aiCombatSkills
});
console.log("\nSEMUA VERIFIKASI SKILL ENGINE CD v3.3 LULUS 100%!");
