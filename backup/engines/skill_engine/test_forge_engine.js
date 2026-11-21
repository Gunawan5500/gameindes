// Test Suite for Integrated Forge Engine (Bengkel Tempa + Fusi + 208 WD Materials + 36 Weapons + SWTOR Skill Engine)
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createSkillEngine } from "./skill_engine.js";
import { createForgeEngine, parseMaterialsCsv, WEAPONS_36 } from "./forge_engine.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillData = JSON.parse(fs.readFileSync(path.join(__dirname, "skill_data.json"), "utf8"));
const csvText = fs.readFileSync(path.join(__dirname, "../../data/materials.csv"), "utf8");

const materials208 = parseMaterialsCsv(csvText);
const skillEngine = createSkillEngine(skillData);
const forgeEngine = createForgeEngine({ skillEngine, weapons: WEAPONS_36, materials: materials208 });

console.log("=== 1. VERIFIKASI INTEGRASI KATALOG BAHAN WD & 36 SENJATA CD-4 ===");
console.log(`- Total Bahan dari data/materials.csv: ${materials208.length} bahan (16 Area WD, Tier 1-5)`);
console.log(`- Total Senjata Resmi CD-4: ${WEAPONS_36.length} senjata (6 Stat x 6 Tier, masing-masing dengan Weapon Trigger unik)\n`);

console.log("=== 2. UJI PRATINJAU TEMPA (BENGKEL TEMPA + 24 SUB-STAT PROFESI + RUNESMITH) ===");
const playerStats = { STR: 90, DEX: 30, CON: 60, INT: 80, WIS: 35, CHA: 16 }; // Lv150 build
const playerFocus = {
  STR: ["str_raw_might", "str_hammer_strike"],
  CON: ["con_max_vitality", "con_quench_stability"],
  INT: ["int_attunement_craft", "int_smith_tools"],
  WIS: ["wis_material_purity", "wis_crit_chance"]
};

// Pilih 4 bahan dari katalog 208 bahan WD (Inti, Badan, Pengikat, Aksen)
const pickedIds = ["MAT-A01-13", "MAT-A01-11", "MAT-A01-06", "MAT-A01-09"];
const preview = forgeEngine.previewForge({
  level: 120,
  stats: playerStats,
  focusSubStats: playerFocus,
  smithConfig: { primaryType: "Runesmith", primaryRank: 5 },
  weaponId: "w_int_3", // Palu Rune (Trigger: Runic Shockwave)
  pickedMaterialIds: pickedIds,
  coreElement: "es",
  coreSize: "besar"
});

console.log("Senjata yang Ditempa:", `${preview.weapon.name} (${preview.weapon.stat}, Trigger: ${preview.weapon.trigger})`);
console.log("Bahan yang Dipilih (4 Slot):", preview.picks.map(m => `${m.n} [${m.r}, ${m.k}, ${m.a}]`).join(" | "));
console.log("Status Attunement Inti:", preview.resonanceStatus.toUpperCase());
console.log("Peluang Berhasil Tempa:", `${preview.successChance}%`);
console.log("Distribusi Peluang Mode Elemen [Terkunci / Fleksibel / Fusi]:", preview.modeProbabilitiesPct.map((p, i) => `${["Terkunci", "Fleksibel", "Fusi"][i]} ${p}%`).join(" | "));
console.log("Sinergi Trait Terdeteksi:", preview.detectedTrait, "| Peluang Trait Langka:", `${preview.rareTraitChancePct}%`);
console.log("Kontribusi Sub-Stat Profesi:", preview.subStatBonuses, "\n");

console.log("=== 3. UJI TEMPA + FITUR FUSI INTI KEDUA (ELEMEN HIBRIDA) + SIMULASI SKILL SWTOR ===");
// Deterministic RNG agar menghasilkan kualitas Mahakarya, Trait Langka, & Mode Fusi (roll ke-5 = 0.92) untuk demonstrasi Fusi
let seq = [0.15, 0.88, 0.05, 0.60, 0.92];
let idx = 0;
const detRng = () => seq[idx++ % seq.length];

const forgeRes = forgeEngine.executeForge({
  level: 120,
  stats: playerStats,
  focusSubStats: playerFocus,
  smithConfig: { primaryType: "Runesmith", primaryRank: 5 },
  weaponId: "w_int_3",
  pickedMaterialIds: pickedIds,
  coreElement: "es",
  coreSize: "besar"
}, detRng);

console.log("Hasil Tempaan Awal:", {
  name: forgeRes.forgedWeapon.name,
  quality: forgeRes.forgedWeapon.qualityName,
  mode: forgeRes.forgedWeapon.modeName,
  core: `${forgeRes.forgedWeapon.coreElement} (${forgeRes.forgedWeapon.coreSize})`,
  hiddenTraitWD: `${forgeRes.forgedWeapon.mainMaterialHiddenTrait}: ${forgeRes.forgedWeapon.mainMaterialHiddenEffect}`,
  budget: forgeRes.forgedWeapon.budget
});

// Lakukan FUSI dengan Inti Kedua "petir" (es + petir -> Badai Beku!)
const fusionRes = forgeEngine.fuseSecondCore({
  forgedWeapon: forgeRes.forgedWeapon,
  secondElementId: "petir",
  level: 120,
  stats: playerStats,
  focusSubStats: playerFocus,
  smithConfig: { primaryType: "Runesmith", primaryRank: 5 },
  rngFn: () => 0.50 // di atas failChancePct
});

console.log("Hasil Fusi Inti Kedua:", {
  success: fusionRes.success,
  failRiskReducedTo: `${fusionRes.failChancePct}% (dari 25% dasar berkat CON Quench Stability & INT Attunement)`,
  message: fusionRes.message,
  budgetAfterFusion: fusionRes.forgedWeapon.budget
});

// Uji Senjata Hasil Fusi di Skill Engine melawan Monster WD
const battleSim = forgeEngine.simulateForgedWeaponBattle({
  forgedWeapon: fusionRes.forgedWeapon,
  level: 120,
  stats: playerStats,
  focusSubStats: playerFocus,
  selectedUtilities: { INT_T1: "int_t1_u1", INT_T3: "int_t3_u1", STR_T1: "str_t1_u1" },
  loadout: [
    { activeId: "int_t1_a", modIds: ["int_t1_u1", "str_t1_u1"] },
    { activeId: "int_t3_a", modIds: ["int_t3_u1"] },
    { activeId: "str_t3_a", modIds: [] }
  ],
  smithConfig: { primaryType: "Runesmith", primaryRank: 5 },
  wdEnemy: { name: "Cinderwatch Storm-Wyvern Lv120", lvl: 120, role: "Skirmisher", type: "Mini Boss", el: "Fire", weak: "Ice" }
});

console.log("\nSimulasi Tempur Senjata Hasil Fusi di Skill Engine:");
console.log("- Senjata:", battleSim.forgedWeaponSummary);
console.log("- Musuh WD:", battleSim.monsterSummary);
console.log("- Metrik Tempur:", battleSim.metrics);
