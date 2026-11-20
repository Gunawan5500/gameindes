// WD-4.12 Issue Engine: 36 templat berslot + twist + bobot dinamis. Nol dependensi, tanpa AI.
// Deterministik per seed save (rahasia pemain) tetapi sulit ditebak: bobot dari politik dunia,
// anti-ulang (riwayat), twist tersembunyi, dan kaskade antar jenjang.
export function hash(str){let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
export function rng(seed){let a=seed>>>0;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const TIER={"Major City":"Major City","City":"City","Town":"Town","Village":"Village"};
const RACES=["Human","Dwarf","Elf","Orc","Tiefling"];
function wpick(r,items,wf){let tot=0;const w=items.map(x=>{const v=Math.max(0,wf(x));tot+=v;return v});let x=r()*tot;for(let i=0;i<items.length;i++){x-=w[i];if(x<=0)return items[i]}return items[items.length-1]}
export function createIssueEngine({templates,twists,locations,relations,materials}){
  const loc=new Map(locations.map(l=>[l.location_id,l]));
  const rel=new Map();
  for(const p of relations){rel.set(p.faction_a_id+"|"+p.faction_b_id,+p.base_score_demo);rel.set(p.faction_b_id+"|"+p.faction_a_id,+p.base_score_demo)}
  const facName=new Map(locations.map(l=>[l.faction_id,l.faction_name]));
  const factions=[...facName.keys()];
  const matByArea=new Map();for(const m of materials){if(!matByArea.has(m.area_id))matByArea.set(m.area_id,[]);matByArea.get(m.area_id).push(m)}
  const areaName=new Map(locations.map(l=>[l.area_id,l.area_name]));const areas=[...areaName.keys()];
  const byTier=t=>templates.filter(x=>x.tier===t);
  function generate({seed,day,locationId,history=[],parentIssue=null,npcName="seorang warga",counter=0}){
    const L=loc.get(locationId);if(!L)throw new Error("lokasi tidak dikenal: "+locationId);
    const r=rng(hash(`${seed}|${day}|${locationId}|${counter}`));
    const tier=TIER[L.settlement_type];const pool=byTier(tier);
    // faksi B: lawan tertimbang oleh permusuhan nyata antar faksi
    const others=factions.filter(f=>f!==L.faction_id);
    const fb=wpick(r,others,f=>1+Math.max(0,-(rel.get(L.faction_id+"|"+f)||0))/20);
    const hostility=Math.max(0,-(rel.get(L.faction_id+"|"+fb)||0));
    const contested=L.is_contested_enclave==="Y";
    const recentIds=history.slice(-8).map(h=>h.id),recentThemes=history.slice(-4).map(h=>h.theme);
    let tpl;
    if(parentIssue&&r()<0.4){const same=pool.filter(t=>t.tags===parentIssue.tags);tpl=same.length?same[Math.floor(r()*same.length)]:null}
    if(!tpl)tpl=wpick(r,pool,t=>{let w=1;
      if(t.axis==="conflict")w*=1+hostility/40;
      if(t.axis==="social"&&contested)w*=1.8;
      if(recentIds.includes(t.id))w*=0.08;
      if(recentThemes.includes(t.theme))w*=0.4;
      return w});
    const tw=wpick(r,twists,t=>t.w);
    const mats=matByArea.get(L.area_id)||[];const mat=mats.length?mats[Math.floor(r()*mats.length)].material_name:"logam biasa";
    const ras=(contested&&r()<0.55)||r()<0.25?RACES.filter(x=>x!==L.dominant_race)[Math.floor(r()*4)]:(L.dominant_race||"Human");
    const asal=areaName.get(areas.filter(a=>a!==L.area_id)[Math.floor(r()*(areas.length-1))]);
    const slots={kota:L.location_name,faksiA:L.faction_name,faksiB:facName.get(fb),bahan:mat,ras,asal,npc:npcName};
    const text=tpl.text.replace(/\{(\w+)\}/g,(_,k)=>slots[k]);
    return{id:tpl.id,theme:tpl.theme,tags:tpl.tags,tier,axis:tpl.axis,text,twist:tw.id,slots,choices:["Mulia","Kejam","Netral"],
      expires_in_sessions:3,on_expire:tw.id==="escalate"?"naik_jenjang":"Netral"};
  }
  return{generate};
}
