// Simulator keseimbangan gabungan WD + CD (headless, nol dependensi).
// Membaca data WD (data/areas/*.json, materials.csv) + rumus CD (computeMonsterStats, master CD v3.2 bagian 5b).
// Model ANALITIK nilai-harapan (bukan tick). Yang BELUM dimodelkan: 150 node skill, 21 perk, armor+trigger, +N, rarity.
// Karena itu hasil "power_needed" = berapa kali lipat kekuatan tambahan yang HARUS disuplai sistem-sistem itu.
import fs from "fs";import path from "path";import {fileURLToPath} from "url";
import {computeMonsterStats,getTierForLevel,getStatCapForLevel,getTotalStatPointsForLevel} from "../skill_engine/skill_engine.js";
const ROOT=path.join(path.dirname(fileURLToPath(import.meta.url)),"..","..");
export const CFG={
  sell_spread:0.55,            // WD-5 buyback
  overhead_sec_per_kill:6,     // jalan/respawn (ASUMSI)
  gear_quality:1.1,            // ASUMSI (kualitas Bagus)
  weapon_tier_for:L=>Math.min(6,Math.ceil(L/25)), // ASUMSI progres senjata T1..T6 sepanjang Lv1-150
  sustain_bars_per_kill:0.25,  // ASUMSI: idle berkelanjutan jika 1 kill menelan <=25% HP
  idle_cap_hours:8,
  stat_order:["CON","DEX","WIS","STR","INT","CHA"],
  profile:{STR:[40,15,15,5,25],DEX:[25,25,20,5,25],CON:[25,15,15,25,20],INT:[20,15,15,5,45],WIS:[30,15,25,10,20],CHA:[25,20,25,5,25]}
};
export function loadWorld(){
  const monsters=[];
  for(const f of fs.readdirSync(path.join(ROOT,"data/areas")).filter(x=>x.endsWith(".json"))){
    const d=JSON.parse(fs.readFileSync(path.join(ROOT,"data/areas",f),"utf8"));
    for(const m of d.monsters)monsters.push(m);
  }
  const lines=fs.readFileSync(path.join(ROOT,"data/materials.csv"),"utf8").replace(/\r/g,"").trim().split("\n");
  const h=lines[0].split(",");const iid=h.indexOf("material_id"),ip=h.indexOf("base_price_full_br_demo");
  const price=new Map();for(const l of lines.slice(1)){const c=l.split(",");price.set(c[iid],+c[ip])}
  return{monsters,price};
}
export function allocate(L,main){
  const total=getTotalStatPointsForLevel(L),cap=getStatCapForLevel(L);const st={STR:1,DEX:1,CON:1,INT:1,WIS:1,CHA:1};
  let free=total-6;const add=(k,n)=>{const g=Math.min(n,cap-st[k],free);st[k]+=g;free-=g;return g};
  const order=CFG.stat_order.filter(k=>k!==main);
  add(main,Math.floor(free*0.6));add(order[0],Math.floor(total*0.25));add(order[1],Math.floor(total*0.15));
  for(const k of [main,...order])add(k,free);
  return st;
}
export function playerModel(L,main,power=1){
  const st=allocate(L,main),tier=getTierForLevel(L),wt=CFG.weapon_tier_for(L);
  const budget=(100+15*(wt-1))*CFG.gear_quality,[d,s,a,df,t]=CFG.profile[main];
  const dmgW=budget*d/100/4,spd=budget*s/100/100,acc=budget*a/100;
  const trig=budget*t/100*0.8*(1+0.01*st[main]);
  let trigDmg=0,reduce=0;
  if(["STR","DEX","INT","WIS"].includes(main))trigDmg=trig/4;
  if(main==="CON")reduce=Math.min(60,trig/2);
  if(main==="CHA"){trigDmg=trig/8;reduce=Math.min(60,trig/4)}
  const hit=Math.min(95,75+acc+Math.min(20,st.DEX)+5)/100;
  const ev=Math.min(30,Math.min(20,st.DEX*0.5)*2)/100; // dodge+parry (jarak dekat)
  const crit=Math.min(20,st.WIS)/100;
  const perHit=(dmgW+Math.floor(st.STR/2)+trigDmg)*1.05*(1+crit)*power;
  return{st,hp:20+5*st.CON+5*tier,perHit,aps:1*(1+spd),hit,ev,reduce,tier,wt};
}
export function fight(p,m,Lp){
  const diff=Math.min(2,Math.max(0.5,1+0.1*(m.lvl-Lp)));
  const dealt=p.perHit*p.hit*(1-m.dodge/100)*(1-m.armor/100)*p.aps; // dps
  const ttk=m.hp/Math.max(dealt,1e-9);
  const raw=m.dmg*diff,mit=Math.min(p.st.CON/2,raw*0.5);
  const taken=Math.max(0,raw-mit)*(1-p.reduce/100)*m.speed*(m.accuracy/100)*(1-p.ev); // dps masuk
  const dmgPerKill=taken*ttk;
  return{ttk,dealt,taken,dmgPerKill,bars:dmgPerKill/p.hp,survive:p.hp/Math.max(taken,1e-9)};
}
export function runLevel(world,L,main,lvlOffset=0){
  const mons=world.monsters.filter(m=>m.lvl===Math.min(150,Math.max(1,L+lvlOffset)));
  const reg=mons.filter(m=>m.type==="Reguler").map(computeMonsterStats),boss=mons.filter(m=>m.type==="Boss"||m.type==="Mini Boss").map(computeMonsterStats);
  const p=playerModel(L,main);
  const avg=(arr,f)=>arr.length?arr.reduce((s,x)=>s+f(x),0)/arr.length:NaN;
  const rf=reg.map(m=>fight(p,m,L)),bf=boss.map(m=>fight(p,m,L));
  const bars=avg(rf,f=>f.bars),ttk=avg(rf,f=>f.ttk);
  return{L,main,hp:p.hp,ttk,bars,power_needed:Math.max(1,bars/CFG.sustain_bars_per_kill),
    boss_bars:avg(bf,f=>f.bars),boss_ttk:avg(bf,f=>f.ttk),n_reg:reg.length,kills_per_hour:3600/(ttk+CFG.overhead_sec_per_kill)};
}
export function goldPerKill(world,m){
  let v=0;for(const [id,ch,mn,mx] of m.drops){if(!String(id).startsWith("MAT-"))continue;v+=ch*((mn+mx)/2)*(world.price.get(id)||0)}
  return v*CFG.sell_spread;
}
export function goldPerHour(world,L,main="STR"){
  const r=runLevel(world,L,main);const mons=world.monsters.filter(m=>m.lvl===L&&m.type==="Reguler");
  const g=mons.reduce((s,m)=>s+goldPerKill(world,m),0)/Math.max(1,mons.length);
  // jika terlalu berat untuk idle berkelanjutan, laju diturunkan proporsional power_needed (istirahat/stamina)
  const eff=1/r.power_needed;
  return{L,gold_per_kill_br:g,kills_per_hour:r.kills_per_hour,income_br_per_hour:g*r.kills_per_hour*eff,income_unconstrained:g*r.kills_per_hour};
}
// XP: waktu minimum per level jika selalu mencapai cap XP/jam (CD-1.04). Dua tafsir: satu bar vs dua bar.
export function xpHours(){
  const cap=L=>L<=10?600:L<=20?900:L<=30?1200:1200+60*(L-30);
  const quota=L=>60*Math.pow(L,1.1);
  const out=[];let h1=0,h2=0;
  for(let L=1;L<150;L++){h1+=quota(L)/cap(L);h2+=2*quota(L)/cap(L);if([10,20,30,60,90,120,150].includes(L+1))out.push({lv:L+1,hours_one_bar:+h1.toFixed(1),hours_two_bars:+h2.toFixed(1)})}
  return out;
}
// WD-4.13: cap cabang = min(A, C)
export function branchCap(incomeBrHr,skill,rentBr,capHours=CFG.idle_cap_hours){
  const pct=0.15+0.45*skill/100,ratio=0.03+0.05*skill/100;
  const A=pct*incomeBrHr*capHours,C=ratio*rentBr;
  return{A:Math.round(A),C:Math.round(C),cap:Math.round(Math.min(A,C)),binds:A<C?"A (relatif ke pemain)":"C (relatif ke sewa)"};
}
