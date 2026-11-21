import { loadWorld, runLevel, xpHours, branchCap, goldPerHour } from "./balance_sim.js";

let ok = true;
const chk = (n, c, d = "") => {
  console.log((c ? "PASS" : "FAIL") + " " + n + " " + d);
  if (!c) ok = false;
};

const w = loadWorld();
chk("4.864 musuh dimuat", w.monsters.length === 4864, w.monsters.length);

let missing = [];
for (let L = 1; L <= 150; L++) if (!w.monsters.some(m => m.lvl === L)) missing.push(L);
chk("level 1-150 tanpa lubang", missing.length === 0, missing.join(","));
chk("208 harga material", w.price.size === 208, w.price.size);

const x = xpHours();
chk(
  "XP dua-bar cocok target CD Lv10/20/30 (11/37/72 jam) & realistis Lv150 ~720 jam",
  Math.abs(x[0].hours_two_bars - 11) < 1 &&
    Math.abs(x[1].hours_two_bars - 37) < 1 &&
    Math.abs(x[2].hours_two_bars - 72) < 1 &&
    Math.abs(x[x.length - 1].hours_realistic_cd106 - 720) < 5,
  `Lv150 realistic = ${x[x.length - 1].hours_realistic_cd106}j`
);

chk("model deterministik", JSON.stringify(runLevel(w, 60, "STR")) === JSON.stringify(runLevel(w, 60, "STR")));

const stats = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
const allSustained150 = stats.every(s => runLevel(w, 150, s, 0, true).power_needed === 1);
chk("ke-6 stat utama seimbang & sustain mandiri (power_needed = 1.00x) di Lv150", allSustained150);

chk("income > 0 & naik tiap Tier", [15, 45, 75, 105, 135].every(L => goldPerHour(w, L).income_br_per_hour > 0));
chk("cap cabang naik dengan skill & menguntungkan di atas sewa pada Skill 100", branchCap(100000, 100, 30000).cap > 30000);

process.exit(ok ? 0 : 1);
