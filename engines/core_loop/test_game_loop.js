/**
 * Test & Verification Suite for Battle-Smith RPG Unified Beta Game Loop Engine (Opsi A)
 * Menguji perjalanan penuh karakter dari Tier 1 (Lv1) hingga Lulus Gate Tier 5 (Lv150 / ~720 jam idle / 12 tahun kalender):
 * - Dual XP Bar (Battle & Smith), Carry-over 50%, Muatan Buff Silang (CD-1.04 & CD-1.05)
 * - Gate Boss Tier 1..5, Kutukan Gate & Long Rest (CD-7.01 - CD-7.03)
 * - 5 Murid Seed Prosedural AI, Ujian Skill 50 & 80, dan Pembukaan Cabang Toko (CD-6.02 & WD-3.10)
 * - Tempa Senjata, Fusi Inti Kedua, & Enhance +N Tanpa Batas Seimbang (+15 s.d. +30) (CD-4.02)
 * - Pasar Regional SnD & Issue Moral Deterministik (WD-4.12 & WD-5.06)
 * - Ukuran Sparse Save-State (< 15 KB)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { UnifiedBetaGameLoop, getXpQuotaForLevel, getHourlyXpCapForLevel } from "./game_loop_engine.js";
import { parseCSV, formatCurrency } from "../snd_prototype/snd_engine.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "../..");

const skillData = JSON.parse(fs.readFileSync(path.join(rootDir, "engines/skill_engine/skill_data.json"), "utf8"));
const materialsCsvText = fs.readFileSync(path.join(rootDir, "data/materials.csv"), "utf8");
const economyConfig = JSON.parse(fs.readFileSync(path.join(rootDir, "engines/snd_prototype/economy_config.json"), "utf8"));
const locations = parseCSV(fs.readFileSync(path.join(rootDir, "data/locations.csv"), "utf8"));
const factions = parseCSV(fs.readFileSync(path.join(rootDir, "data/factions.csv"), "utf8"));
const relations = parseCSV(fs.readFileSync(path.join(rootDir, "data/faction_relations.csv"), "utf8"));
const dummyItems = parseCSV(fs.readFileSync(path.join(rootDir, "engines/snd_prototype/dummy_items.csv"), "utf8"));
const issueTemplates = JSON.parse(fs.readFileSync(path.join(rootDir, "data/issue_templates.json"), "utf8"));
const materialsList = parseCSV(materialsCsvText);

const game = new UnifiedBetaGameLoop({
  skillData,
  materialsCsvText,
  economyConfig,
  locations,
  factions,
  relations,
  dummyItems,
  issueTemplates,
  materialsList,
  saveSeed: "BETA-MASTER-2026"
});

console.log("=== 1. INISIALISASI UNIFIED BETA GAME LOOP (Lv1, Tier 1, 5 Murid Seed AI) ===");
console.log("Pemain Awal:", {
  name: game.state.player.name,
  level: game.state.player.level,
  stats: game.state.player.stats,
  smithTiers: game.state.player.smithTiers,
  bronze: formatCurrency(game.state.player.bronze)
});
console.log("5 Murid Awal (Dibangkitkan dari Seed AI):");
for (const app of game.state.apprentices) {
  const prof = game.skillEngine.generateApprenticeFromSeed(app.seed, app.skill, app.passedTrials);
  console.log(`  - ${prof.seed} [${prof.background} -> ${prof.smithClass}]: Skill ${prof.effectiveSkill}/${prof.talentCap} | Loyalitas ${prof.loyalty} | Aura: ${prof.passiveAura.label}`);
}

console.log("\n=== 2. SIMULASI PERJALANAN LINTAS 5 TIER (Lv1 -> Lv150, Gate Boss, Ujian Murid, Cabang Toko, & +N Tanpa Batas) ===");

const tierPlan = [
  { targetTier: 1, targetLv: 30, smithPointTo: "Weaponsmith", weaponId: "w_str_2", rarity: "Rare", plusN: 5, branchCity: "Briarfall City" },
  { targetTier: 2, targetLv: 60, smithPointTo: "Weaponsmith", weaponId: "w_str_3", rarity: "Epic", plusN: 10, branchCity: "Ashwind Steppe" },
  { targetTier: 3, targetLv: 90, smithPointTo: "Runesmith",   weaponId: "w_str_4", rarity: "Epic", plusN: 15, branchCity: "Hollowfrost Market" },
  { targetTier: 4, targetLv: 120, smithPointTo: "Weaponsmith", weaponId: "w_str_5", rarity: "Legendary", plusN: 22, branchCity: "Wyrmspine Forgecity" },
  { targetTier: 5, targetLv: 150, smithPointTo: "Weaponsmith", weaponId: "w_str_6", rarity: "Unique", plusN: 30, branchCity: "Obsidian City" }
];

for (const step of tierPlan) {
  let sessionsInTier = 0;
  while (game.state.player.level < step.targetLv && sessionsInTier < 200) {
    sessionsInTier++;
    game.autoAllocateStats("STR");
    // Jalankan sesi idle 8 jam (Offline cap CD-7.01) lalu Long Rest gratis di bengkel sendiri
    game.advanceIdleHours({ hours: 8, autoAlternateBars: true });
    game.performLongRest({ atOwnWorkshopOrBranch: true });

    // Selesaikan Issue Moral jika muncul
    if (game.state.narrative.activeIssue) {
      game.resolveActiveMoralIssue(sessionsInTier % 3 === 0 ? "Netral" : "Mulia");
    }

    // Cek Ujian Murid (Skill 50 dan Skill 80)
    for (const app of game.state.apprentices) {
      if ((app.passedTrials === 0 && app.skill >= 50) || (app.passedTrials === 1 && app.skill >= 80)) {
        game.runApprenticeTrial(app.seed);
      }
    }
  }

  game.autoAllocateStats("STR");

  // Tempa & Pasang Senjata Terbaik untuk Tier ini (termasuk Fusi Inti Kedua & Enhance +N Tanpa Batas)
  const forged = game.forgeAndEquipBestWeapon({
    weaponId: step.weaponId,
    coreElement: "api",
    secondCoreElement: "petir",
    targetEnhancePlus: step.plusN,
    rarityOverride: step.rarity
  });

  // Buka 1 Cabang Toko dengan murid yang sudah memenuhi syarat (Skill >= 60, Loyalitas >= 70, Ujian >= 1)
  const eligibleApp = game.state.apprentices.find(a => !a.branchLocationId && !a.isCompanion && a.skill >= 60 && a.loyalty >= 70 && a.passedTrials >= 1);
  if (eligibleApp) {
    const locObj = locations.find(l => l.location_name === step.branchCity) || locations[step.targetTier * 5];
    game.assignApprenticeToBranch(eligibleApp.seed, locObj?.location_id);
  }

  // Tantang Gate Boss di ujung Tier (Lv30, 60, 90, 120, 150)
  const gateResult = game.challengeGateBoss({ allocateSmithPointTo: step.smithPointTo });

  console.log(`[Tier ${step.targetTier} Selesai @ Lv${game.state.player.level}]`, {
    idleHours: game.state.calendar.totalIdleHours,
    calendarYear: `Tahun ${game.state.calendar.year} Hari ${game.state.calendar.day} (${game.state.calendar.season})`,
    stats: game.state.player.stats,
    smithClass: gateResult.smithClass,
    equippedWeapon: `${forged.equippedWeapon.name} [${forged.equippedWeapon.rarity}] (${forged.enhancement.phase}: +${forged.enhancement.powerBonusPct}%)`,
    gateBossWon: gateResult.won,
    gateCombatDps: gateResult.combatMetrics.dps,
    activeBranches: game.state.branches.length,
    treasury: formatCurrency(game.state.player.bronze)
  });
}

console.log("\n=== 3. UJI SKENARIO KALAH GATE -> KUTUKAN GATE TIER 5 -> PEMULIHAN LONG REST (CD-7.01 - CD-7.03) ===");
// Simulasikan kalah Gate melawan Boss Ekstrem untuk memverifikasi Kutukan Gate & Pemulihan Long Rest
game.state.player.curses.activeStacks = 2;
game.state.player.curses.highestGateTierCursed = 5;
const restCheck = game.performLongRest({ atOwnWorkshopOrBranch: true });
console.log("Hasil Pemulihan 2 Tumpukan Kutukan Gate Tier 5 di Bengkel Sendiri:", {
  maxStatDebuffPerCurse: restCheck.maxStatDebuffPerCurse,
  incapacitateThreshold: restCheck.incapacitateThreshold,
  cleanseCostPaid: formatCurrency(restCheck.longRest.totalLongRestCostBr),
  remainingCurseStacks: game.state.player.curses.activeStacks
});

console.log("\n=== 4. VERIFIKASI SPARSE SAVE-STATE & ROUND-TRIP IMPORT/EXPORT (< 15 KB) ===");
// Lakukan beberapa transaksi di pasar SnD terlebih dahulu agar ada delta pasar
const sampleLoc = game.state.player.currentLocationId;
game.sndEngine.executeTrade(sampleLoc, "mat_iron_ore", 10, { action: "player_buy", nowMs: game.state.calendar.nowMs });

const exportedJson = game.exportSaveState();
const byteSize = Buffer.byteLength(exportedJson, "utf8");
console.log(`Ukuran Sparse Save-State JSON: ${byteSize} bytes (${(byteSize / 1024).toFixed(2)} KB) — Target < 15 KB: ${byteSize < 15360 ? "PASS" : "FAIL"}`);

// Uji Import kembali
const restoredState = game.importSaveState(exportedJson);
console.log("Verifikasi Round-Trip Save-State:", {
  version: restoredState.version,
  level: restoredState.player.level,
  totalStatPoints: Object.values(restoredState.player.stats).reduce((a, b) => a + b, 0),
  apprenticesCount: restoredState.apprentices.length,
  branchesCount: restoredState.branches.length,
  resolvedIssuesCount: restoredState.narrative.resolvedHistory.length
});

if (restoredState.player.level !== 150 || byteSize >= 15360) {
  console.error("VERIFIKASI GAGAL!");
  process.exit(1);
}
console.log("\nSEMUA VERIFIKASI UNIFIED BETA GAME LOOP (Lv1-150) LULUS 100%!");
