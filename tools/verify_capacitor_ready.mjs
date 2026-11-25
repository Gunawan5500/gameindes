#!/usr/bin/env node
/**
 * Battle-Smith RPG — Fase 5 Capacitor APK Pre-Flight Verifier
 * Memastikan app/ memenuhi semua syarat 100% offline, 0 CDN, 0 backdrop-filter: blur(),
 * 16 Area lazy-load, serta asset .webp/.ogg lengkap dan ringan untuk Oppo A54.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const APP_DIR = path.join(ROOT, "app");

function assert(cond, msg) {
  if (!cond) throw new Error(`PRE-FLIGHT FAIL: ${msg}`);
}

// 1. Cek capacitor.config.json & package.json
const capCfg = JSON.parse(fs.readFileSync(path.join(ROOT, "capacitor.config.json"), "utf8"));
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
assert(capCfg.webDir === "app", `webDir harus "app", ditemukan "${capCfg.webDir}"`);
assert(capCfg.appId === "com.battlesmith.rpg", "appId tidak sesuai");
assert(pkg.dependencies?.["@capacitor/core"], "@capacitor/core belum terdaftar di package.json");

// 2. Cek app/index.html bebas CDN & semua script/css lokal ada
const html = fs.readFileSync(path.join(APP_DIR, "index.html"), "utf8");
assert(!/<(script|link)[^>]*(https?:)?\/\//i.test(html), "Ditemukan URL eksternal/CDN di app/index.html!");

const refs = [...html.matchAll(/(?:src|href)="([^"]+)"/gi)].map(m => m[1]);
for (const ref of refs) {
  if (ref.startsWith("#") || ref.startsWith("data:")) continue;
  const full = path.join(APP_DIR, ref);
  assert(fs.existsSync(full), `Referensi hilang di app/: ${ref}`);
}

// 3. Cek 0 backdrop-filter: blur()
const css = fs.readFileSync(path.join(APP_DIR, "css", "style.css"), "utf8");
assert(!/backdrop-filter\s*:\s*blur/i.test(css), "Ditemukan backdrop-filter: blur() di style.css!");

// 4. Cek 16 Area lazy-load terpisah
const areas = fs.readdirSync(path.join(APP_DIR, "dist", "areas")).filter(f => f.endsWith(".js"));
assert(areas.length === 16, `Harus ada 16 file area lazy-load, ditemukan ${areas.length}`);

// 5. Cek total ukuran asset .webp & .ogg
let assetBytes = 0;
let webpCount = 0;
let oggCount = 0;
function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else {
      const sz = fs.statSync(p).size;
      assetBytes += sz;
      if (ent.name.endsWith(".webp")) webpCount++;
      if (ent.name.endsWith(".ogg")) oggCount++;
    }
  }
}
walk(path.join(APP_DIR, "assets"));
assert(webpCount >= 9, `Asset .webp kurang (${webpCount})`);
assert(oggCount >= 6, `Asset .ogg kurang (${oggCount})`);
assert(assetBytes < 500 * 1024, `Total asset terlalu besar (${(assetBytes / 1024).toFixed(1)} KB)`);

console.log(JSON.stringify({
  ok: true,
  appId: capCfg.appId,
  webDir: capCfg.webDir,
  checkedRefs: refs.length,
  lazyAreas: areas.length,
  webpCount,
  oggCount,
  totalAssetKB: Number((assetBytes / 1024).toFixed(2)),
  backdropBlurCount: 0,
  externalCdnCount: 0
}, null, 2));
