#!/usr/bin/env node
/**
 * Battle-Smith RPG — Offline App & Standalone Preview Packager (Fase 4)
 * Mengemas app/ (HTML, CSS, 16 Area Lazy-Load, .webp Sprites/UI, .ogg SFX, & JS)
 * menjadi satu file preview mandiri 100% offline tanpa CDN.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const APP_DIR = path.join(ROOT, "app");

function readUtf8(relPath) {
  return fs.readFileSync(path.join(APP_DIR, relPath), "utf8");
}

function toDataUri(relPath, mime) {
  const buf = fs.readFileSync(path.join(APP_DIR, relPath));
  return `data:${mime};base64,${buf.toString("base64")}`;
}

function collectRawAreas() {
  const areasDir = path.join(APP_DIR, "dist", "areas");
  const files = fs.readdirSync(areasDir).filter(f => f.endsWith(".js")).sort();
  const rawAreas = {};
  for (const file of files) {
    const areaId = file.replace(/\.js$/, "");
    const src = fs.readFileSync(path.join(areasDir, file), "utf8");
    const m = src.match(/window\.__BSRPG_AREA_CACHE\[[^\]]+\]\s*=\s*([\s\S]+?);\s*$/);
    if (!m) throw new Error(`Format area tidak valid di ${file}`);
    rawAreas[areaId] = m[1].trim();
  }
  return rawAreas;
}

function collectInlineAssets() {
  return {
    sprite_hero: toDataUri("assets/sprites/hero_smith_5f.webp", "image/webp"),
    sprite_beast: toDataUri("assets/sprites/enemy_beast_5f.webp", "image/webp"),
    sprite_undead: toDataUri("assets/sprites/enemy_undead_5f.webp", "image/webp"),
    sprite_humanoid: toDataUri("assets/sprites/enemy_humanoid_5f.webp", "image/webp"),
    sprite_boss: toDataUri("assets/sprites/boss_titan_5f.webp", "image/webp"),
    ui_avatar_hero: toDataUri("assets/ui/avatar_hero.webp", "image/webp"),
    ui_forge_anvil: toDataUri("assets/ui/forge_anvil.webp", "image/webp"),
    ui_banner_wilds: toDataUri("assets/ui/banner_wilds.webp", "image/webp"),
    ui_banner_boss: toDataUri("assets/ui/banner_boss_arena.webp", "image/webp"),
    audio_ui_click: toDataUri("assets/audio/sfx_ui_click.ogg", "audio/ogg"),
    audio_forge_hammer: toDataUri("assets/audio/sfx_forge_hammer.ogg", "audio/ogg"),
    audio_coin: toDataUri("assets/audio/sfx_coin.ogg", "audio/ogg"),
    audio_slash: toDataUri("assets/audio/sfx_slash.ogg", "audio/ogg"),
    audio_rest: toDataUri("assets/audio/sfx_rest.ogg", "audio/ogg"),
    audio_victory: toDataUri("assets/audio/sfx_victory.ogg", "audio/ogg")
  };
}

function buildStandalonePreview(outPath) {
  const indexHtml = readUtf8("index.html");
  const css = readUtf8("css/style.css");

  if (/backdrop-filter\s*:\s*blur/i.test(css)) {
    throw new Error("PELANGGARAN HARD CONSTRAINT: ditemukan backdrop-filter: blur() di app/css/style.css!");
  }

  const rawAreas = collectRawAreas();
  const inlineAssets = collectInlineAssets();

  const scriptOrder = [
    "dist/backend_bundle.js",
    "js/asset_manifest.js",
    "js/audio_manager.js",
    "js/perf_mode.js",
    "js/capacitor_bridge.js",
    "js/backend_bridge.js",
    "js/screens/title_wizard.js",
    "js/screens/class_skill.js",
    "js/screens/world_map.js",
    "js/screens/idle_patrol.js",
    "js/screens/forge.js",
    "js/screens/market.js",
    "js/screens/guild.js",
    "js/app.js"
  ];

  // Escape </script> inside inline scripts defensively
  const safeScript = code => code.replace(/<\/script>/gi, "<\\/script>");

  let out = indexHtml.replace(
    /<link\s+rel="stylesheet"\s+href="css\/style\.css"\s*\/?>/i,
    `<style>\n${css}\n</style>`
  ).replace(/<link\s+rel="manifest"[^>]*>/i, "");

  // Replace external script tags block with inlined areas, assets, and scripts
  const scriptsBlock = [
    `<script>\nwindow.__BSRPG_RAW_AREAS = ${JSON.stringify(rawAreas)};\n</script>`,
    `<script>\nwindow.__BSRPG_INLINE_ASSETS = ${JSON.stringify(inlineAssets)};\n</script>`,
    ...scriptOrder.map(rel => `<script>\n${safeScript(readUtf8(rel))}\n</script>`)
  ].join("\n  ");

  out = out.replace(
    /<!-- 100% Offline Local Scripts[\s\S]*?<\/body>/i,
    `<!-- 100% Offline Inlined Scripts (Fase 5 Standalone Preview) -->\n  ${scriptsBlock}\n</body>`
  );

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, out, "utf8");
  console.log(`Built standalone preview: ${outPath} (${(out.length / 1024).toFixed(1)} KB, ${Object.keys(rawAreas).length} areas, ${Object.keys(inlineAssets).length} inline assets)`);
}

const outArg = process.argv[2] || path.join(ROOT, "app", "dist", "fase5_offline_preview.html");
buildStandalonePreview(outArg);
