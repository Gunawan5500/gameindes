import fs from "fs";import path from "path";import {fileURLToPath} from "url";
import {loadWorld,runLevel,goldPerHour,xpHours,branchCap,CFG} from "./balance_sim.js";
const dir=path.dirname(fileURLToPath(import.meta.url));
const w=loadWorld();const mains=["STR","DEX","CON","INT","WIS","CHA"];const lv=[5,10,20,30,45,60,75,90,105,120,135,150];
const fx=(x,n=1)=>Number.isFinite(x)?x.toFixed(n):"-";
const out={cfg:{...CFG,weapon_tier_for:"ceil(L/25)"},monsters:w.monsters.length,xp:xpHours(),combat:[],gold:[],branch:[]};
console.log("Monster dimuat:",w.monsters.length);
console.log("\n== XP: jam minimum idle (target CD: Lv10=11, Lv20=37, Lv30=72, Lv150~720) ==");
console.table(out.xp);
console.log("\n== Tempur: power_needed (x kekuatan tambahan dari skill/perk/armor agar idle berkelanjutan) ==");
const rows=[];for(const L of lv){const row={Lv:L};for(const m of mains){const r=runLevel(w,L,m);row[m]=fx(r.power_needed,2);out.combat.push({L,m,...r})}rows.push(row)}
console.table(rows);
console.log("\n== Tempur STR: detail (reguler & boss) ==");
console.table(lv.map(L=>{const r=runLevel(w,L,"STR");return{Lv:L,hp:r.hp,ttk_s:fx(r.ttk,1),bars_per_kill:fx(r.bars,2),boss_bars:fx(r.boss_bars,2),boss_ttk_s:fx(r.boss_ttk,0)}}));
console.log("\n== Gold idle (br/jam, arketipe STR, setelah penyesuaian berkelanjutan) ==");
const gl=[5,15,30,45,60,75,90,105,120,135,150].map(L=>{const g=goldPerHour(w,L,"STR");out.gold.push(g);return{Lv:L,gold_per_kill_br:fx(g.gold_per_kill_br,0),kills_hr:fx(g.kills_per_hour,0),income_br_hr:fx(g.income_br_per_hour,0),income_g_hr:fx(g.income_br_per_hour/10000,2)}});
console.table(gl);
console.log("\n== Cap cabang WD-4.13 (sewa asumsi per periode = sink_4: Village 10k, Town 30k, City 90k, Major 250k br) ==");
const rent={Village:10000,Town:30000,City:90000,Major:250000};
const tierLv={1:15,2:45,3:75,4:105,5:135};
for(const t of [1,2,3,4,5]){const inc=goldPerHour(w,tierLv[t],"STR").income_br_per_hour;for(const [c,r] of Object.entries(rent))for(const sk of [0,50,100]){const b=branchCap(inc,sk,r);out.branch.push({tier:t,city:c,skill:sk,income_br_hr:Math.round(inc),...b})}}
console.table(out.branch.filter(b=>b.skill===50||b.skill===100).filter(b=>b.city==="Town"||b.city==="Major"));
fs.writeFileSync(path.join(dir,"report.json"),JSON.stringify(out));
