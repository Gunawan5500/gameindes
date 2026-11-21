// Simulator keseimbangan gabungan WD + CD v2 (headless, nol dependensi).
// Membaca data WD (data/areas/*.json, materials.csv) + rumus CD v3.2 FINAL LOCKED:
// 1. Anggaran Senjata Rarity (CD-4.03): 100 + 20*(Tier-1) + Bonus_Rarity (Common 0..Unique 75)
// 2. Rumus Enhance +N Tanpa Batas Seimbang (CD-4.02): Fase 1 (+4%/lvl), Fase 2 (+7%/lvl), Fase 3 (+12%/lvl), Fase 4 (Logaritmik)
// 3. Penyetelan Antar-Stat (CD-4.03 & Bagian 5): STR damage 35%, Defense 1.25 poin/1%, Trigger scale +1.5%/stat, CON +15% Guard Dmg, CHA Trigger /5 & /3
// 4. Sistem Penuh CD v3.2: 60 Sub-Stat (+25% Fokus), 150 Node SWTOR Skill Rotation, 5-Tier Smith Mastery (+30% di Tier 5), 21 Perk Smith (Afinitas x1.25), 15+6 Armor Trigger Armorer, & Companion Murid Seed AI (Assist Strike tiap 3 dtk)
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  computeMonsterStats,
  getTierForLevel,
  getStatCapForLevel,
  getTotalStatPointsForLevel
} from "../skill_engine/skill_engine.js";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

export const RARITY_BONUS = { Common: 0, Uncommon: 10, Rare: 22, Epic: 36, Legendary: 52, Unique: 75 };

export const CFG = {
  sell_spread: 0.55,            // WD-5 buyback
  overhead_sec_per_kill: 6,     // jalan/respawn
  gear_quality_for: L => (L < 30 ? 1.0 : L < 60 ? 1.1 : L < 90 ? 1.2 : L < 120 ? 1.35 : 1.5),
  weapon_tier_for: L => Math.min(5, Math.max(1, Math.ceil(L / 30))),
  rarity_for: L => (L < 20 ? "Common" : L < 45 ? "Uncommon" : L < 75 ? "Rare" : L < 105 ? "Epic" : L < 135 ? "Legendary" : "Unique"),
  plus_n_for: L => Math.floor(L / 7.5), // Progresi +N alami: Lv15=+2, Lv30=+4, Lv60=+8, Lv90=+12, Lv120=+16, Lv150=+20
  sustain_bars_per_kill: 0.25,  // Idle berkelanjutan jika 1 kill menelan <=25% HP
  idle_cap_hours: 8,
  stat_order: ["CON", "DEX", "WIS", "STR", "INT", "CHA"],
  // CD-4.03 LOCKED: STR disetel ke 35/15/15/5/30
  profile: {
    STR: [35, 15, 15, 5, 30],
    DEX: [25, 25, 20, 5, 25],
    CON: [25, 15, 15, 25, 20],
    INT: [20, 15, 15, 5, 45],
    WIS: [30, 15, 25, 10, 20],
    CHA: [25, 20, 25, 5, 25]
  }
};

export function computeEnhancementMult(plusN) {
  const n = Math.max(0, Math.floor(plusN || 0));
  let pct = 0;
  if (n > 0) pct += Math.min(5, n) * 4;
  if (n > 5) pct += Math.min(5, n - 5) * 7;
  if (n > 10) pct += Math.min(5, n - 10) * 12;
  if (n > 15) pct += 45 * Math.log(1 + (n - 15) * 0.5);
  return 1 + pct / 100;
}

export function loadWorld() {
  const monsters = [];
  for (const f of fs.readdirSync(path.join(ROOT, "data/areas")).filter(x => x.endsWith(".json"))) {
    const d = JSON.parse(fs.readFileSync(path.join(ROOT, "data/areas", f), "utf8"));
    for (const m of d.monsters) monsters.push(m);
  }
  const lines = fs.readFileSync(path.join(ROOT, "data/materials.csv"), "utf8").replace(/\r/g, "").trim().split("\n");
  const h = lines[0].split(",");
  const iid = h.indexOf("material_id"), ip = h.indexOf("base_price_full_br_demo");
  const price = new Map();
  for (const l of lines.slice(1)) {
    const c = l.split(",");
    price.set(c[iid], +c[ip]);
  }
  return { monsters, price };
}

export function allocate(L, main) {
  const total = getTotalStatPointsForLevel(L), cap = getStatCapForLevel(L);
  const st = { STR: 1, DEX: 1, CON: 1, INT: 1, WIS: 1, CHA: 1 };
  let free = total - 6;
  const add = (k, n) => {
    const g = Math.min(n, cap - st[k], free);
    st[k] += g;
    free -= g;
    return g;
  };
  const order = CFG.stat_order.filter(k => k !== main);
  add(main, Math.floor(free * 0.6));
  add(order[0], Math.floor(total * 0.25));
  add(order[1], Math.floor(total * 0.15));
  for (const k of [main, ...order]) add(k, free);
  return st;
}

/**
 * Model Pemain:
 * - fullSystems = true (default v2): menerapkan seluruh keputusan LOCKED CD v3.2 (+N Tanpa Batas, Rarity Budget, Bobot Stat Baru, Rotasi Skill SWTOR, 21 Perk Smith, Armor Trigger Armorer, & Companion Murid Seed AI).
 * - fullSystems = false: model bare-weapon lama untuk perbandingan backward-compatibility.
 */
export function playerModel(L, main, power = 1, fullSystems = true) {
  const st = allocate(L, main);
  const tier = getTierForLevel(L);
  const wt = CFG.weapon_tier_for(L);
  const rarity = fullSystems ? CFG.rarity_for(L) : "Common";
  const plusN = fullSystems ? CFG.plus_n_for(L) : 0;
  const enhMult = fullSystems ? computeEnhancementMult(plusN) : 1.0;
  const qMult = fullSystems ? CFG.gear_quality_for(L) : 1.1;

  // CD-4.03 LOCKED: Anggaran = 100 + 20*(Tier-1) + Bonus_Rarity
  const baseBudget = fullSystems ? (100 + 20 * (wt - 1) + (RARITY_BONUS[rarity] || 0)) : (100 + 15 * (wt - 1));
  const budget = baseBudget * qMult;
  const [d, s, a, df, t] = CFG.profile[main];

  const dmgW = (budget * d / 100 / 4) * enhMult;
  const spd = budget * s / 100 / 100 + (fullSystems ? (st.DEX * 0.25) / 100 : 0);
  const acc = budget * a / 100 + (fullSystems ? st.DEX * 0.3 : 0);

  // CD-4.03 LOCKED: Trigger scale 1 + 1.5% * Stat_Utama (+ Trigger Mastery INT)
  const trigScale = fullSystems ? (1 + 0.015 * st[main]) * (1 + (st.INT * 0.35) / 100) * enhMult : (1 + 0.01 * st[main]);
  const trig = budget * t / 100 * 0.8 * trigScale;

  let trigDmg = 0;
  // CD-4.03 LOCKED: Bobot Defense senjata = 1.25 poin per 1% DR (+ Armor Class & Armorer Secondary/Ultimate Trigger)
  let reduce = fullSystems ? (budget * df / 100) / 1.25 : 0;
  if (["STR", "DEX", "INT", "WIS"].includes(main)) trigDmg = trig / 4;
  if (main === "CON") {
    // CD-4.03 & CD-5.02b LOCKED: CON mendapat +15% CON sebagai Blunt/Guard Damage + Konversi Armorer Trigger & Citadel Nova
    trigDmg = fullSystems ? (st.CON * 0.15 + trig / 5.5) : 0;
    reduce += trig / 2;
  }
  if (main === "CHA") {
    // CD-4.03 LOCKED: CHA Trigger dinaikkan ke Damage Efektif/5 dan Pengurang Efektif/3 (%)
    trigDmg = fullSystems ? trig / 4.2 : trig / 8;
    reduce += fullSystems ? trig / 3 : trig / 4;
  }

  // Bonus stat khusus non-STR dari 60 Sub-Stat Fokus (+25%) & 21 Perk Smith (CD-3.03)
  let statIdentityMult = 1.0;
  if (fullSystems) {
    if (main === "DEX") statIdentityMult = 1.22; // Double Strike / Attack Speed & Dodge-to-Crit Perk
    if (main === "INT") statIdentityMult = 1.28; // Weakness Exploit (+25% + INT scale) & Hybrid Core Fusion
    if (main === "WIS") statIdentityMult = 1.26; // Critical Severity (+25..35%) & Rare Trait
    if (main === "CON") statIdentityMult = 1.24; // Aegisborn Secondary + Ultimate Citadel Nova
    if (main === "CHA") statIdentityMult = 1.25; // Sovereign Seal + Grand Inquisitor (+25% Vulnerability & Companion Lead)
    if (main === "STR") statIdentityMult = 1.15; // Titan's Anvil & Armor Crush
  }

  // Mastery Smith Class (+6% per tier, mencapai +30% di Tier 5) + Rotasi Skill SWTOR (rata-rata multiplier rotasi aktif) + Companion Murid Seed AI (Assist Strike tiap 3 dtk)
  const smithMasteryMult = fullSystems ? (1 + tier * 0.06) : 1.0;
  const swtorSkillRotationMult = fullSystems ? (1.15 + tier * 0.12) : 1.0;
  const companionAssistMult = fullSystems ? (1.12 + (st.CHA * 0.0015)) : 1.0;

  // Pertahanan ekstra dari Core Passive SWTOR, Armor Class, & Perk Smith
  if (fullSystems) {
    reduce += 8 + tier * 4;
  }
  reduce = Math.min(65, reduce);

  const hit = Math.min(95, 75 + acc + Math.min(20, st.DEX) + 5) / 100;
  const evCap = fullSystems && main === "DEX" ? 42 : 30;
  const ev = Math.min(evCap, Math.min(20, st.DEX * 0.5) * 2 + (fullSystems ? 8 : 0)) / 100;
  const critChance = Math.min(35, Math.min(20, st.WIS) + (fullSystems ? 5 + (main === "WIS" ? 10 : 0) : 0)) / 100;
  const critSeverity = fullSystems ? (1.0 + (st.WIS * 0.4) / 100) : 1.0;

  const baseStrike = dmgW + (fullSystems ? st.STR * 0.5 * 1.15 : Math.floor(st.STR / 2)) + trigDmg;
  const perHit = baseStrike
    * 1.05
    * (1 + critChance * critSeverity)
    * statIdentityMult
    * smithMasteryMult
    * swtorSkillRotationMult
    * companionAssistMult
    * power;

  // HP Pemain = (20 + 5*CON*1.25 Fokus + 5*tier) * (1 + Bonus Perk/Passives)
  const hpMult = fullSystems ? (1 + tier * 0.08 + (main === "CON" ? 0.25 : 0.10)) : 1.0;
  const hp = Math.round((20 + 5 * st.CON * (fullSystems ? 1.25 : 1.0) + 5 * tier) * hpMult);

  return { st, hp, perHit, aps: 1 * (1 + spd), hit, ev, reduce, tier, wt, rarity, plusN };
}

export function fight(p, m, Lp) {
  const diff = Math.min(2, Math.max(0.5, 1 + 0.1 * (m.lvl - Lp)));
  const armorCrush = Math.min(m.armor, p.st.STR * 0.22);
  const effArmor = Math.max(0, m.armor - armorCrush);
  const dealt = p.perHit * p.hit * (1 - m.dodge / 100) * (1 - effArmor / 100) * p.aps;
  const ttk = m.hp / Math.max(dealt, 1e-9);
  const raw = m.dmg * diff * (1 - Math.min(0.25, (p.st.CHA * 0.15) / 100));
  const mit = Math.min(p.st.CON * 0.625, raw * 0.55);
  const taken = Math.max(0, raw - mit) * (1 - p.reduce / 100) * m.speed * (m.accuracy / 100) * (1 - p.ev);
  const dmgPerKill = taken * ttk;
  return { ttk, dealt, taken, dmgPerKill, bars: dmgPerKill / p.hp, survive: p.hp / Math.max(taken, 1e-9) };
}

export function runLevel(world, L, main, lvlOffset = 0, fullSystems = true) {
  const mons = world.monsters.filter(m => m.lvl === Math.min(150, Math.max(1, L + lvlOffset)));
  const reg = mons.filter(m => m.type === "Reguler").map(computeMonsterStats);
  const boss = mons.filter(m => m.type === "Boss" || m.type === "Mini Boss").map(computeMonsterStats);
  const p = playerModel(L, main, 1, fullSystems);
  const avg = (arr, f) => (arr.length ? arr.reduce((s, x) => s + f(x), 0) / arr.length : NaN);
  const rf = reg.map(m => fight(p, m, L)), bf = boss.map(m => fight(p, m, L));
  const bars = avg(rf, f => f.bars), ttk = avg(rf, f => f.ttk);
  return {
    L,
    main,
    hp: p.hp,
    rarity: p.rarity,
    plusN: p.plusN,
    ttk,
    bars,
    power_needed: Math.max(1, bars / CFG.sustain_bars_per_kill),
    boss_bars: avg(bf, f => f.bars),
    boss_ttk: avg(bf, f => f.ttk),
    n_reg: reg.length,
    kills_per_hour: 3600 / (ttk + CFG.overhead_sec_per_kill)
  };
}

export function goldPerKill(world, m) {
  let v = 0;
  for (const [id, ch, mn, mx] of m.drops) {
    if (!String(id).startsWith("MAT-")) continue;
    v += ch * ((mn + mx) / 2) * (world.price.get(id) || 0);
  }
  return v * CFG.sell_spread;
}

export function goldPerHour(world, L, main = "STR") {
  const r = runLevel(world, L, main);
  const mons = world.monsters.filter(m => m.lvl === L && m.type === "Reguler");
  const g = mons.reduce((s, m) => s + goldPerKill(world, m), 0) / Math.max(1, mons.length);
  const eff = 1 / r.power_needed;
  return {
    L,
    gold_per_kill_br: g,
    kills_per_hour: r.kills_per_hour,
    income_br_per_hour: g * r.kills_per_hour * eff,
    income_unconstrained: g * r.kills_per_hour
  };
}

// XP: waktu minimum per level jika mencapai cap XP/jam (CD-1.04) + waktu realistis dengan pergantian sesi & Long Rest (~720 jam di Lv150 sesuai CD-1.06).
export function xpHours() {
  const cap = L => (L <= 10 ? 600 : L <= 20 ? 900 : L <= 30 ? 1200 : 1200 + 60 * (L - 30));
  const quota = L => 60 * Math.pow(L, 1.1);
  const out = [];
  let h1 = 0, h2 = 0;
  for (let L = 1; L < 150; L++) {
    h1 += quota(L) / cap(L);
    h2 += (2 * quota(L)) / cap(L);
    if ([10, 20, 30, 60, 90, 120, 150].includes(L + 1)) {
      const realisticWithGateAndRest = +(h2 * (L + 1 <= 30 ? 1.0 : 1.425)).toFixed(1);
      out.push({
        lv: L + 1,
        hours_one_bar: +h1.toFixed(1),
        hours_two_bars: +h2.toFixed(1),
        hours_realistic_cd106: realisticWithGateAndRest
      });
    }
  }
  return out;
}

// WD-4.13 & CD-6.02: cap cabang = min(A, C) dengan rasio C yang sudah dikalibrasi (0.8 - 2.0x sewa) agar cabang murid (Skill >= 60) menguntungkan
export function branchCap(incomeBrHr, skill, rentBr, capHours = CFG.idle_cap_hours) {
  const pct = 0.15 + (0.45 * skill) / 100;
  const ratio = 0.80 + (1.20 * skill) / 100; // Skill 60 = 1.52x sewa, Skill 100 = 2.0x sewa
  const A = pct * incomeBrHr * capHours;
  const C = ratio * rentBr;
  return {
    A: Math.round(A),
    C: Math.round(C),
    cap: Math.round(Math.min(A, C)),
    binds: A < C ? "A (relatif ke pemain)" : "C (relatif ke sewa)"
  };
}
