import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { loadWorld, runLevel, goldPerHour, xpHours, branchCap, CFG } from "./balance_sim.js";

const dir = path.dirname(fileURLToPath(import.meta.url));
const w = loadWorld();
const mains = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
const lv = [5, 10, 20, 30, 45, 60, 75, 90, 105, 120, 135, 150];
const fx = (x, n = 1) => (Number.isFinite(x) ? x.toFixed(n) : "-");

const out = {
  version: "v2.0-CDv3.2-WDv1.9-LOCKED",
  cfg: {
    ...CFG,
    weapon_tier_for: "ceil(L/30)",
    rarity_for: "Common..Unique",
    plus_n_for: "floor(L/7.5)"
  },
  monsters: w.monsters.length,
  xp: xpHours(),
  combat_bare_v1: [],
  combat: [],
  gold: [],
  branch: []
};

console.log("Monster dimuat:", w.monsters.length);
console.log("\n== 1. XP: jam minimum & realistis idle (target CD-1.06: Lv10=11, Lv20=37, Lv30=72, Lv150~720) ==");
console.table(out.xp);

console.log("\n== 2A. Tempur Bare-Weapon (v1 lama tanpa Skill/Perk/+N/Rarity/Murid) — power_needed ==");
const rowsBare = [];
for (const L of lv) {
  const row = { Lv: L };
  for (const m of mains) {
    const r = runLevel(w, L, m, 0, false);
    row[m] = fx(r.power_needed, 2);
    out.combat_bare_v1.push({ L, m, ...r });
  }
  rowsBare.push(row);
}
console.table(rowsBare);

console.log("\n== 2B. Tempur Full Systems CD v3.2 LOCKED (Skill SWTOR + 21 Perk + Rarity + Enhance +N + Murid Seed AI) — bars_per_kill (<= 0.25 = Sustain 1.00x) ==");
const rowsFull = [];
for (const L of lv) {
  const row = { Lv: L };
  for (const m of mains) {
    const r = runLevel(w, L, m, 0, true);
    row[m] = `${fx(r.bars, 2)} (${fx(r.power_needed, 2)}x)`;
    out.combat.push({ L, m, ...r });
  }
  rowsFull.push(row);
}
console.table(rowsFull);

console.log("\n== 3. Perbandingan Keseimbangan 6 Stat Utama di Lv150 (Full Systems CD v3.2) ==");
console.table(
  mains.map(m => {
    const r = runLevel(w, 150, m, 0, true);
    return {
      Stat: m,
      HP: r.hp,
      Rarity: r.rarity,
      Enhance_PlusN: `+${r.plusN}`,
      Reguler_TTK_s: fx(r.ttk, 2),
      Reguler_Bars_Per_Kill: fx(r.bars, 3),
      Boss_TTK_s: fx(r.boss_ttk, 1),
      Boss_Bars_Per_Kill: fx(r.boss_bars, 2),
      Power_Needed: fx(r.power_needed, 2)
    };
  })
);

console.log("\n== 4. Gold idle (br/jam, arketipe STR Full Systems CD v3.2) ==");
const gl = [5, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150].map(L => {
  const g = goldPerHour(w, L, "STR");
  out.gold.push(g);
  return {
    Lv: L,
    gold_per_kill_br: fx(g.gold_per_kill_br, 0),
    kills_hr: fx(g.kills_per_hour, 0),
    income_br_hr: fx(g.income_br_per_hour, 0),
    income_g_hr: fx(g.income_br_per_hour / 10000, 2)
  };
});
console.table(gl);

console.log("\n== 5. Cap cabang WD-4.13 & CD-6.02 (rasio C terkalibrasi 0.8-2.0x sewa: Village 10k, Town 30k, City 90k, Major 250k br) ==");
const rent = { Village: 10000, Town: 30000, City: 90000, Major: 250000 };
const tierLv = { 1: 15, 2: 45, 3: 75, 4: 105, 5: 135 };
for (const t of [1, 2, 3, 4, 5]) {
  const inc = goldPerHour(w, tierLv[t], "STR").income_br_per_hour;
  for (const [c, r] of Object.entries(rent)) {
    for (const sk of [0, 50, 100]) {
      const b = branchCap(inc, sk, r);
      out.branch.push({ tier: t, city: c, skill: sk, income_br_hr: Math.round(inc), ...b });
    }
  }
}
console.table(out.branch.filter(b => b.skill === 50 || b.skill === 100).filter(b => b.city === "Town" || b.city === "Major"));
fs.writeFileSync(path.join(dir, "report.json"), JSON.stringify(out, null, 2));
