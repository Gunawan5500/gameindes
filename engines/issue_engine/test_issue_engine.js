import fs from "fs";import path from "path";import {fileURLToPath} from "url";
import {createIssueEngine} from "./issue_engine.js";
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),"..","..","data");
function csv(f){const t=fs.readFileSync(path.join(root,f),"utf8").replace(/\r/g,"").trim().split("\n");const rows=[];const parse=l=>{const o=[];let c="",q=false;for(const ch of l){if(ch==='"')q=!q;else if(ch===","&&!q){o.push(c);c=""}else c+=ch}o.push(c);return o};const h=parse(t[0]);for(const l of t.slice(1)){const v=parse(l);rows.push(Object.fromEntries(h.map((k,i)=>[k,v[i]])))}return rows}
const J=JSON.parse(fs.readFileSync(path.join(root,"issue_templates.json"),"utf8"));
const locations=csv("locations.csv"),relations=csv("faction_relations.csv"),materials=csv("materials.csv");
const E=createIssueEngine({templates:J.templates,twists:J.twists,locations,relations,materials});
let ok=true;const chk=(n,c,d="")=>{console.log((c?"PASS":"FAIL")+" "+n+" "+d);if(!c)ok=false};
// 1. deterministik per seed
const a=E.generate({seed:"S1",day:5,locationId:locations[0].location_id}),b=E.generate({seed:"S1",day:5,locationId:locations[0].location_id});
chk("deterministik (seed sama = kartu sama)",JSON.stringify(a)===JSON.stringify(b));
// 2. seed beda -> beda
let diff=0;for(let i=0;i<50;i++){const x=E.generate({seed:"A"+i,day:3,locationId:locations[10].location_id}),y=E.generate({seed:"B"+i,day:3,locationId:locations[10].location_id});if(x.text!==y.text)diff++}
chk("seed beda menghasilkan kartu beda",diff>=40,`${diff}/50`);
// 3. 1000 kartu, riwayat, variasi, anti-ulang
const hist=[];const texts=new Set(),ids=new Set(),twC={};let repeats=0;const t0=process.hrtime.bigint();
for(let i=0;i<1000;i++){const L=locations[i%locations.length];const c=E.generate({seed:"SAVE",day:i,locationId:L.location_id,history:hist,counter:i});
 if(hist.slice(-3).some(h=>h.id===c.id))repeats++;hist.push(c);texts.add(c.text);ids.add(c.id);twC[c.twist]=(twC[c.twist]||0)+1;
 if(!/^[^{}]*$/.test(c.text))ok=false}
const ms=Number(process.hrtime.bigint()-t0)/1e6;
chk("semua 36 templat terpakai",ids.size===36,ids.size);
chk("teks unik tinggi",texts.size>=700,`${texts.size}/1000 unik`);
chk("ulang dalam 3 terakhir rendah",repeats<150,`${repeats}/1000`);
chk("tidak ada slot kosong",![...texts].some(t=>/[{}]/.test(t)));
chk("1000 kartu cepat (<500 ms)",ms<500,ms.toFixed(1)+" ms");
console.log("distribusi twist:",twC);
console.log("contoh:",a.text,"| twist:",a.twist);
console.log("RAM heap MB:",(process.memoryUsage().heapUsed/1048576).toFixed(1));
process.exit(ok?0:1);
