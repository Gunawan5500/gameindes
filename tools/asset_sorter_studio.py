#!/usr/bin/env python3
"""
Battle-Smith RPG — Visual Asset Sorter & Grid Cropper Studio (Python + Local Web UI)
------------------------------------------------------------------------------------
Alat visual untuk menyortir, memotong (Grid Crop), dan memasangkan aset itch.io Anda
tepat ke setiap slot nyata di Battle-Smith RPG:
  1. Grid Cropper: Potong lembar monster / sprite sheet berdasarkan Baris x Kolom + preview garis potong.
  2. Visual Asset Mapper:
     - 48 Senjata & 15 Armor (langsung dari engines/skill_engine/forge_engine.js)
     - 5 Class & 25 Skill (langsung dari engines/skill_engine/skill_data.json)
     - Material & Ore (langsung dari data/materials.csv)
     - 10 Famili Monster & 16 Boss Area (langsung dari data/monsters_visual_manifest.json)
     - Slot UI Bloodsteel, Banner, Animated Smith / Diorama Bengkel, & 6 Bioma Kota
  3. 1-Klik Simpan -> menulis tools/asset_assignments.json & app/js/asset_overrides.js
     yang langsung memprioritaskan pilihan tepat Anda di dalam game!

Cara jalankan di CMD/PowerShell:
  npm run studio:assets
  (atau: python tools/asset_sorter_studio.py)
"""

import argparse
import csv
import io
import json
import os
import re
import sys
import threading
import urllib.parse
import webbrowser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("ERROR: Modul 'Pillow' belum terpasang. Jalankan: pip install Pillow")
    sys.exit(1)

REPO_ROOT = Path(__file__).resolve().parent.parent
APP_DIR = REPO_ROOT / "app"
APP_ASSETS = APP_DIR / "assets"
RAW_DIR = REPO_ROOT / "assets" / "itch_raw"
ASSIGNMENTS_FILE = REPO_ROOT / "tools" / "asset_assignments.json"
OVERRIDES_JS = APP_DIR / "js" / "asset_overrides.js"

IMAGE_EXTS = {".png", ".webp", ".jpg", ".jpeg"}


def slugify(name: str) -> str:
    return re.sub(r"[^a-zA-Z0-9]+", "_", str(name).strip().lower()).strip("_") or "asset"


def load_game_slots() -> dict:
    """Membaca daftar slot nyata langsung dari file engine & data repo."""
    slots = {
        "ui_forge": [
            {"id": "ui_forge_diorama", "label": "🔥 Diorama / Animated Smith Bengkel", "sub": "Tampil di atas layar Tab Bengkel"},
            {"id": "ui_gothic_bloodsteel_play_button", "label": "▶️ Tombol PLAY (Title Screen)", "sub": "Tombol buat karakter baru"},
            {"id": "ui_gothic_continue_button_with_crimson_ornaments", "label": "⏯️ Tombol CONTINUE (Title Screen)", "sub": "Tombol lanjutkan save"},
            {"id": "ui_frame_panel_gold", "label": "🖼️ Bingkai Panel Utama / Modal", "sub": "Frame kartu penting & modal"},
            {"id": "ui_frame_panel_boss", "label": "💀 Bingkai Modal Boss / Event Moral", "sub": "Frame tengkorak/merah"},
            {"id": "ui_banner_map", "label": "🗺️ Banner / Tombol MAP", "sub": "Header Peta Dunia & Kota"},
            {"id": "ui_banner_skills", "label": "🌳 Banner / Tombol SKILLS", "sub": "Header Class & Skill"},
            {"id": "ui_banner_quests", "label": "📜 Banner / Tombol QUESTS", "sub": "Header Misi & Isu Moral"},
            {"id": "ui_banner_inventory", "label": "🎒 Banner / Tombol INVENTORY", "sub": "Header Tas & Karakter"},
            {"id": "ui_banner_settings", "label": "⚙️ Banner / Tombol SETTINGS", "sub": "Header Pengaturan & Save"},
            {"id": "ui_map_city_coast", "label": "⚓ Peta Kota Bioma Pelabuhan", "sub": "Saltgrave, Cinderwatch, Wraithtide"},
            {"id": "ui_map_city_desert", "label": "🌴 Peta Kota Bioma Gurun/Oasis", "sub": "Emberwaste, Ashwind Steppe"},
            {"id": "ui_map_city_mountain", "label": "⛰️ Peta Kota Bioma Pegunungan", "sub": "Wyrmspine, Hollowfrost, Crownfrost"},
            {"id": "ui_map_city_forest", "label": "🌲 Peta Kota Bioma Hutan Rimba", "sub": "Elderwake, Rustleaf, Bonethorn, Frostpine"},
            {"id": "ui_map_city_highland", "label": "🏰 Peta Kota Bioma Benteng", "sub": "Greymoor, Hollowbarrow, Briarfall"},
            {"id": "ui_map_city_swamp", "label": "🌫️ Peta Kota Bioma Rawa Gelap", "sub": "Blackmere Fens"},
        ],
        "weapons": [],
        "armors": [],
        "skills": [],
        "materials": [],
        "monsters": [],
    }

    # 1. Baca 48 Senjata & 15 Armor dari engines/skill_engine/forge_engine.js
    forge_path = REPO_ROOT / "engines" / "skill_engine" / "forge_engine.js"
    if forge_path.exists():
        src = forge_path.read_text(encoding="utf-8", errors="ignore")
        for m in re.finditer(r'\{\s*id:\s*"([^"]+)"[^}]*?name:\s*"([^"]+)"[^}]*?\}', src):
            rid, rname = m.group(1), m.group(2)
            entry = {"id": rid, "label": rname, "sub": rid}
            if rid.startswith("a_"):
                slots["armors"].append(entry)
            else:
                slots["weapons"].append(entry)

    # 2. Baca Class & Skill dari engines/skill_engine/skill_data.json
    skill_path = REPO_ROOT / "engines" / "skill_engine" / "skill_data.json"
    if skill_path.exists():
        try:
            sd = json.loads(skill_path.read_text(encoding="utf-8"))
            trees = sd.get("smith_skill_trees", {})
            for cls_name, tree in trees.items():
                slots["skills"].append({"id": f"class_{slugify(cls_name)}", "label": f"[CLASS] {cls_name}", "sub": "Insignia Kelas Smith"})
                for t in tree.get("tiers", []):
                    sk = t.get("active_skill", {})
                    if sk.get("id"):
                        slots["skills"].append({
                            "id": sk["id"],
                            "label": f"[{cls_name} T{t.get('tier', '?')}] {sk.get('name', sk['id'])}",
                            "sub": sk.get("role", ""),
                        })
        except Exception:
            pass

    # 3. Baca Material dari data/materials.csv
    mat_path = REPO_ROOT / "data" / "materials.csv"
    if mat_path.exists():
        try:
            with mat_path.open("r", encoding="utf-8-sig", newline="") as f:
                for row in csv.DictReader(f):
                    mid = row.get("material_id") or row.get("id")
                    mname = row.get("material_name") or row.get("name") or mid
                    if mid:
                        slots["materials"].append({
                            "id": mid,
                            "label": mname,
                            "sub": f"{row.get('category', '')} • {row.get('rarity', '')}",
                        })
        except Exception:
            pass

    # 4. Famili Monster (10) + 16 Boss Area
    families = [
        ("fam_beast", "🐾 Famili: Beast (112 Spesies)", "Serigala, cougar, beruang, rusa"),
        ("fam_undead", "💀 Famili: Undead (100 Spesies)", "Skeleton, lich, necromancer, reaper"),
        ("fam_humanoid", "🗡️ Famili: Humanoid (114 Spesies)", "Bandit, kultis, plague hunter, knight"),
        ("fam_construct", "🪨 Famili: Construct (50 Spesies)", "Golem batu/besi, mimic"),
        ("fam_plant", "🍄 Famili: Plant (36 Spesies)", "Treant, jamur/spora"),
        ("fam_aquatic", "🐙 Famili: Aquatic (34 Spesies)", "Monster pesisir, abyssal jelly"),
        ("fam_spirit", "👻 Famili: Spirit (30 Spesies)", "Wraith, frost spirit, phantom"),
        ("fam_insect", "🕷️ Famili: Insect (25 Spesies)", "Laba-laba, kumbang"),
        ("fam_dragonkin", "🐉 Famili: Dragonkin (23 Spesies)", "Wyrm, drake"),
        ("fam_elemental", "⚡ Famili: Elemental (20 Spesies)", "Icicle sprite, ember elemental"),
        ("fam_boss_default", "👹 Boss Default / Gate Boss", "Cadangan jika Boss belum dipetakan spesifik"),
    ]
    for fid, flbl, fsub in families:
        slots["monsters"].append({"id": fid, "label": flbl, "sub": fsub})

    areas_dir = REPO_ROOT / "data" / "areas"
    if areas_dir.exists():
        for af in sorted(areas_dir.glob("*.json")):
            try:
                ad = json.loads(af.read_text(encoding="utf-8"))
                area_name = ad.get("area", {}).get("area_name", af.stem)
                for mon in ad.get("monsters", []):
                    if mon.get("type") == "Boss":
                        slots["monsters"].append({
                            "id": f"boss_{slugify(mon.get('name', af.stem))}",
                            "label": f"👑 Boss: {mon.get('name')}",
                            "sub": f"Boss Area • {area_name}",
                        })
            except Exception:
                pass

    return slots


ROOT_ASSETS = REPO_ROOT / "assets"
SORTED_OUT = APP_ASSETS / "sorted"


def scan_available_assets() -> dict:
    """Memindai SEMUA gambar di assets/ (root) DAN app/assets/ agar seluruh aset lokal laptop langsung terbaca."""
    gallery_imgs = []
    sheets = []
    seen_repo = set()

    for source_label, base_dir in [("assets", ROOT_ASSETS), ("app/assets", APP_ASSETS)]:
        if not base_dir.exists():
            continue
        for f in sorted(base_dir.rglob("*")):
            if not f.is_file() or f.suffix.lower() not in IMAGE_EXTS:
                continue
            repo_rel = str(f.relative_to(REPO_ROOT)).replace("\\", "/")
            if repo_rel in seen_repo:
                continue
            seen_repo.add(repo_rel)

            sub_folder = str(f.parent.relative_to(base_dir)).replace("\\", "/")
            folder_display = source_label if sub_folder == "." else f"{source_label}/{sub_folder}"
            kb = round(f.stat().st_size / 1024, 1)

            # Jika sudah di dalam app/assets/, appPath terisi; jika masih di assets/, akan otomatis dikonversi saat Simpan!
            app_rel = str(f.relative_to(APP_DIR)).replace("\\", "/") if source_label == "app/assets" else ""
            gallery_imgs.append({
                "repoPath": repo_rel,
                "appPath": app_rel,
                "name": f.name,
                "folder": folder_display,
                "source": source_label,
                "kb": kb,
            })

            try:
                with Image.open(f) as im:
                    w, h = im.size
                if max(w, h) >= 256:
                    sheets.append({"repoPath": repo_rel, "name": f.name, "source": folder_display, "w": w, "h": h})
            except Exception:
                pass

    return {"appImages": gallery_imgs, "sheets": sheets}


def load_assignments() -> dict:
    if ASSIGNMENTS_FILE.exists():
        try:
            return json.loads(ASSIGNMENTS_FILE.read_text(encoding="utf-8"))
        except Exception:
            pass
    return {"ui_forge": {}, "weapons": {}, "armors": {}, "skills": {}, "materials": {}, "monsters": {}}


def ensure_in_app_assets(path_val: str, category: str, slot_id: str) -> str:
    """
    Jika user memilih file dari folder root assets/ (bukan app/assets/),
    otomatis konversi & salin ke app/assets/sorted/<category>/<slot_id>.webp
    dengan ukuran ringan aman Oppo A54 (< 150 MB RAM).
    """
    if not path_val:
        return ""
    norm = path_val.replace("\\", "/")
    # Sudah berupa path relatif di dalam app/assets/
    if norm.startswith("assets/") and (APP_DIR / norm).exists():
        return norm

    src = (REPO_ROOT / norm).resolve()
    if not src.exists() or not str(src).startswith(str(REPO_ROOT)):
        return norm

    # Jika file sumber kebetulan memang sudah di dalam app/assets/
    try:
        rel_in_app = str(src.relative_to(APP_DIR)).replace("\\", "/")
        if rel_in_app.startswith("assets/"):
            return rel_in_app
    except ValueError:
        pass

    # Konversi dari root assets/ -> app/assets/sorted/<category>/<slot_id>.webp
    max_px_map = {"ui_forge": 760, "monsters": 128, "weapons": 128, "armors": 128, "skills": 96, "materials": 96}
    max_px = max_px_map.get(category, 128)
    dest = SORTED_OUT / slugify(category) / f"{slugify(slot_id)}.webp"
    dest.parent.mkdir(parents=True, exist_ok=True)

    im = Image.open(src)
    has_alpha = im.mode in ("RGBA", "LA") or ("transparency" in im.info)
    im = im.convert("RGBA" if has_alpha else "RGB")
    w, h = im.size
    if max(w, h) > max_px:
        scale = max_px / float(max(w, h))
        new_sz = (max(1, int(round(w * scale))), max(1, int(round(h * scale))))
        resample = Image.Resampling.NEAREST if (category == "monsters" and max(w, h) <= 128) else Image.Resampling.LANCZOS
        im = im.resize(new_sz, resample)

    if category == "monsters" and max(im.size) <= 160 and has_alpha:
        im.save(dest, "WEBP", lossless=True, method=6)
    else:
        im.save(dest, "WEBP", quality=84, method=5)

    return str(dest.relative_to(APP_DIR)).replace("\\", "/")


def save_assignments_and_generate_js(data: dict):
    # Konversi otomatis semua pilihan dari root assets/ ke app/assets/sorted/ agar langsung jalan di APK!
    resolved_for_game = {}
    for cat, mapping in (data or {}).items():
        resolved_for_game[cat] = {}
        for slot_id, val in (mapping or {}).items():
            if not val:
                continue
            resolved_for_game[cat][slot_id] = ensure_in_app_assets(val, cat, slot_id)

    ASSIGNMENTS_FILE.parent.mkdir(parents=True, exist_ok=True)
    ASSIGNMENTS_FILE.write_text(json.dumps(resolved_for_game, indent=2, ensure_ascii=False), encoding="utf-8")

    js = f"""/**
 * Battle-Smith RPG — Manual Visual Asset Overrides
 * Dihasilkan otomatis oleh Battle-Smith Asset Sorter Studio (tools/asset_sorter_studio.py)
 * Prioritas #1 di atas auto-matching!
 */
(function (global) {{
  "use strict";

  const OVERRIDES = {json.dumps(resolved_for_game, indent=2, ensure_ascii=False)};

  function slug(str) {{
    return String(str || "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  }}

  if (global.BSRPG_ASSETS) {{
    const A = global.BSRPG_ASSETS;
    A.MANUAL_OVERRIDES = OVERRIDES;

    // 1. Timpa UI & Peta langsung ke RELATIVE_PATHS
    if (OVERRIDES.ui_forge && A.RELATIVE_PATHS) {{
      for (const [k, v] of Object.entries(OVERRIDES.ui_forge)) {{
        if (v) A.RELATIVE_PATHS[k] = v;
      }}
    }}

    // 2. Bungkus getCustomIcon agar cek pilihan manual dulu
    const origGetIcon = typeof A.getCustomIcon === "function" ? A.getCustomIcon.bind(A) : () => "";
    A.getCustomIcon = function (category, slugOrId) {{
      const map = OVERRIDES[category] || {{}};
      const rawKey = String(slugOrId || "");
      if (map[rawKey]) return map[rawKey];
      const s = slug(rawKey);
      if (map[s]) return map[s];
      return origGetIcon(category, slugOrId);
    }};

    // 3. Bungkus getCustomMonsterUrl agar cek Boss spesifik & 10 Famili manual dulu
    const origGetMon = typeof A.getCustomMonsterUrl === "function" ? A.getCustomMonsterUrl.bind(A) : () => "";
    A.getCustomMonsterUrl = function (monster) {{
      const map = OVERRIDES.monsters || {{}};
      if (monster) {{
        const bossKey = "boss_" + slug(monster.name || "");
        if (map[bossKey]) return map[bossKey];
        const fam = slug(monster.famili || monster.family || "");
        if (fam && map["fam_" + fam]) return map["fam_" + fam];
        const txt = `${{monster.name || ""}} ${{monster.type || ""}}`.toLowerCase();
        if (txt.includes("boss") && map.fam_boss_default) return map.fam_boss_default;
        const guesses = [
          [/wolf|bear|stag|boar|cougar|raven|hound|beast/, "fam_beast"],
          [/skeleton|undead|lich|necro|reaper|zombie|ghoul|bone/, "fam_undead"],
          [/wraith|ghost|spirit|phantom|shade|specter/, "fam_spirit"],
          [/golem|construct|automaton|mimic|sentinel/, "fam_construct"],
          [/treant|spore|fung|vine|plant|thorn/, "fam_plant"],
          [/crab|kraken|jelly|tide|sea|aquatic|shark|eel/, "fam_aquatic"],
          [/spider|beetle|wasp|ant|insect|mantis/, "fam_insect"],
          [/wyrm|drake|dragon|wyvern/, "fam_dragonkin"],
          [/sprite|elemental|flame|frost|ember|storm/, "fam_elemental"],
          [/bandit|knight|cultist|plague|raider|assassin|guard|hunter|warrior/, "fam_humanoid"]
        ];
        for (const [re, fk] of guesses) {{
          if (re.test(txt) && map[fk]) return map[fk];
        }}
      }}
      return origGetMon(monster);
    }};
  }}
}})(typeof window !== "undefined" ? window : globalThis);
"""
    OVERRIDES_JS.write_text(js, encoding="utf-8")


def perform_grid_crop(repo_path: str, rows: int, cols: int, out_subdir: str, prefix: str, target_px: int) -> dict:
    src = (REPO_ROOT / repo_path).resolve()
    if not src.exists() or not str(src).startswith(str(REPO_ROOT)):
        raise ValueError("File sumber tidak valid.")
    rows = max(1, min(32, int(rows)))
    cols = max(1, min(32, int(cols)))
    target_px = max(32, min(256, int(target_px)))

    out_dir = APP_ASSETS / out_subdir
    out_dir.mkdir(parents=True, exist_ok=True)
    clean_prefix = slugify(prefix or src.stem)

    im = Image.open(src).convert("RGBA")
    w, h = im.size
    cell_w = w / cols
    cell_h = h / rows

    created = []
    idx = 0
    for r in range(rows):
        for c in range(cols):
            box = (int(round(c * cell_w)), int(round(r * cell_h)), int(round((c + 1) * cell_w)), int(round((r + 1) * cell_h)))
            cell = im.crop(box)
            bbox = cell.getbbox()
            if not bbox:
                continue
            cell = cell.crop(bbox)
            cw, ch = cell.size
            if cw < 8 or ch < 8:
                continue
            side = max(cw, ch) + 4
            sq = Image.new("RGBA", (side, side), (0, 0, 0, 0))
            sq.paste(cell, ((side - cw) // 2, (side - ch) // 2))
            if side > target_px:
                sq = sq.resize((target_px, target_px), Image.Resampling.NEAREST if side <= 160 else Image.Resampling.LANCZOS)
            idx += 1
            fname = f"{clean_prefix}_{idx:02d}.webp"
            out_file = out_dir / fname
            sq.save(out_file, "WEBP", lossless=True, method=6)
            created.append(str(out_file.relative_to(APP_DIR)).replace("\\", "/"))

    return {"ok": True, "count": len(created), "files": created[:24], "outDir": str(out_dir.relative_to(REPO_ROOT))}


HTML_PAGE = r"""<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Battle-Smith RPG — Visual Asset Sorter &amp; Grid Cropper Studio</title>
<style>
  :root { --bg:#120f0d; --card:#1e1915; --card2:#28211b; --iron:#4a4036; --bronze:#8c693e; --gold:#e0a94f; --gold2:#f6cf7f; --txt:#f0e8dc; --mut:#a6998a; --ok:#34b37e; --red:#c43646; }
  * { box-sizing:border-box; }
  body { margin:0; background:var(--bg); color:var(--txt); font-family:system-ui,-apple-system,"Segoe UI",sans-serif; font-size:13px; }
  header { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:10px 16px; background:#1a1511; border-bottom:2px solid var(--bronze); position:sticky; top:0; z-index:20; }
  h1 { margin:0; font-size:16px; color:var(--gold2); }
  .tabs { display:flex; gap:8px; }
  .btn { padding:8px 13px; border-radius:8px; border:1.5px solid var(--iron); background:var(--card2); color:var(--txt); font-weight:700; cursor:pointer; font-size:12px; }
  .btn:hover { border-color:var(--gold); }
  .btn.active { border-color:var(--gold); background:#47331a; color:var(--gold2); }
  .btn.primary { background:linear-gradient(180deg,#ebb454,#b57220); border-color:var(--gold2); color:#171008; }
  .btn.ok { background:#143828; border-color:var(--ok); color:#9bf3c9; }
  .btn.danger { background:#3d161b; border-color:var(--red); color:#ffd5da; }
  .wrap { padding:14px 16px; max-width:1460px; margin:0 auto; }
  .hidden { display:none !important; }
  .mapper-grid { display:grid; grid-template-columns:390px 1fr; gap:14px; align-items:start; }
  .panel { background:var(--card); border:1.5px solid var(--iron); border-radius:10px; padding:12px; }
  .panel.gold { border-color:var(--bronze); }
  .slot-list { max-height:calc(100vh - 235px); overflow-y:auto; display:flex; flex-direction:column; gap:6px; margin-top:8px; padding-right:4px; }
  .slot-row { display:flex; align-items:center; gap:9px; padding:7px 9px; border-radius:8px; border:1.5px solid #383028; background:#15110e; cursor:pointer; text-align:left; width:100%; color:var(--txt); }
  .slot-row:hover { border-color:var(--bronze); }
  .slot-row.selected { border-color:var(--gold); background:#2f2316; }
  .slot-row.filled { border-left:4px solid var(--ok); }
  .slot-thumb { width:40px; height:40px; border-radius:6px; border:1px solid var(--iron); background:#0d0a08; object-fit:contain; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:16px; }
  .gallery-grid { max-height:calc(100vh - 240px); overflow-y:auto; display:grid; grid-template-columns:repeat(auto-fill, minmax(112px, 1fr)); gap:8px; margin-top:8px; padding-right:4px; }
  .asset-card { border:1.5px solid #3b322a; background:#14100d; border-radius:8px; padding:6px; cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:5px; text-align:center; }
  .asset-card:hover { border-color:var(--gold); transform:translateY(-1px); }
  .asset-card.picked { border-color:var(--ok); background:#142b21; }
  .asset-card img { width:72px; height:72px; object-fit:contain; image-rendering:auto; background:#090706; border-radius:5px; }
  .asset-name { font-size:10px; color:var(--mut); word-break:break-all; line-height:1.2; max-height:24px; overflow:hidden; }
  .bar { display:flex; gap:8px; flex-wrap:wrap; align-items:center; }
  input, select { background:#120e0b; border:1.5px solid var(--iron); color:var(--txt); border-radius:7px; padding:6px 9px; font-size:12px; }
  .crop-grid { display:grid; grid-template-columns:320px 1fr; gap:14px; align-items:start; }
  .crop-stage { position:relative; display:inline-block; max-width:100%; background:#0a0807; border:1.5px solid var(--bronze); border-radius:8px; overflow:hidden; }
  .crop-stage img { display:block; max-width:100%; max-height:68vh; }
  .crop-overlay { position:absolute; inset:0; pointer-events:none; }
  #toast { position:fixed; bottom:18px; right:18px; background:#143828; border:1.5px solid var(--ok); color:#d8ffec; padding:10px 16px; border-radius:9px; font-weight:700; z-index:99; box-shadow:0 8px 24px rgba(0,0,0,0.65); }
</style>
</head>
<body>
<header>
  <div>
    <h1>⚒️ Battle-Smith RPG — Visual Asset Sorter &amp; Grid Cropper</h1>
    <div style="font-size:11px;color:var(--mut)">Pilih slot di kiri → klik gambar di kanan → Simpan ke Game (<code>app/js/asset_overrides.js</code>)</div>
  </div>
  <div class="tabs">
    <button id="mode-mapper" class="btn active" onclick="setMode('mapper')">🎯 1. Sortir &amp; Pasang Aset</button>
    <button id="mode-cropper" class="btn" onclick="setMode('cropper')">✂️ 2. Potong Grid Monster/Sheet</button>
    <button class="btn primary" onclick="saveAll()">💾 Simpan ke Game</button>
  </div>
</header>

<div class="wrap">
  <!-- TAB 1: VISUAL ASSET MAPPER -->
  <div id="view-mapper">
    <div class="bar" style="margin-bottom:10px" id="cat-bar"></div>
    <div class="mapper-grid">
      <div class="panel gold">
        <div class="bar" style="justify-content:space-between">
          <strong id="slot-head" style="color:var(--gold2)">Slot Game</strong>
          <span id="slot-progress" style="font-size:11px;color:#9bf3c9;font-weight:700">0 / 0</span>
        </div>
        <div class="bar" style="margin-top:8px">
          <input id="slot-search" placeholder="Cari nama slot..." style="flex:1" oninput="renderSlots()" />
          <button class="btn danger" onclick="clearSelectedSlot()" title="Kosongkan slot terpilih">✕ Lepas</button>
        </div>
        <div id="slot-list" class="slot-list"></div>
      </div>

      <div class="panel">
        <div class="bar" style="justify-content:space-between">
          <strong style="color:var(--gold2)">Galeri Aset Anda (<code>app/assets/</code>)</strong>
          <span id="gal-count" style="font-size:11px;color:var(--mut)">0 gambar</span>
        </div>
        <div class="bar" style="margin-top:8px">
          <select id="gal-folder" onchange="renderGallery()"></select>
          <input id="gal-search" placeholder="Cari nama file..." style="flex:1" oninput="renderGallery()" />
          <button class="btn" onclick="refreshData()">🔄 Muat Ulang</button>
        </div>
        <div id="gallery-grid" class="gallery-grid"></div>
      </div>
    </div>
  </div>

  <!-- TAB 2: INTERACTIVE GRID CROPPER -->
  <div id="view-cropper" class="hidden">
    <div class="crop-grid">
      <div class="panel gold" style="display:flex;flex-direction:column;gap:10px">
        <strong style="color:var(--gold2)">✂️ Pemotong Grid Presisi (Dark Bestiary / Sheet)</strong>
        <div style="font-size:11px;color:var(--mut)">Pilih gambar lembar monster, atur jumlah <b>Baris × Kolom</b> sampai garis merah pas di tiap monster, lalu klik <b>Potong &amp; Simpan</b>!</div>
        <label style="display:flex;flex-direction:column;gap:4px">
          <span>1. Pilih File Lembar Gambar:</span>
          <select id="crop-file" onchange="updateCropPreview()"></select>
        </label>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <label style="display:flex;flex-direction:column;gap:4px"><span>Baris (Rows)</span><input id="crop-rows" type="number" min="1" max="32" value="4" oninput="drawGridOverlay()" /></label>
          <label style="display:flex;flex-direction:column;gap:4px"><span>Kolom (Cols)</span><input id="crop-cols" type="number" min="1" max="32" value="4" oninput="drawGridOverlay()" /></label>
        </div>
        <label style="display:flex;flex-direction:column;gap:4px">
          <span>2. Folder Tujuan di <code>app/assets/</code>:</span>
          <select id="crop-out">
            <option value="monsters">monsters (Monster &amp; Boss)</option>
            <option value="icons/weapons">icons/weapons (Senjata)</option>
            <option value="icons/skills">icons/skills (Skill)</option>
            <option value="icons/materials">icons/materials (Material)</option>
            <option value="ui/custom">ui/custom (UI / Bengkel)</option>
          </select>
        </label>
        <label style="display:flex;flex-direction:column;gap:4px">
          <span>3. Nama Awalan File (mis. <code>undead_sheet1</code>):</span>
          <input id="crop-prefix" placeholder="mis. undead_sheet1" />
        </label>
        <label style="display:flex;flex-direction:column;gap:4px">
          <span>4. Ukuran Maksimal Output (px):</span>
          <input id="crop-px" type="number" min="32" max="256" value="128" />
        </label>
        <button class="btn primary" onclick="runGridCrop()">✂️ Potong &amp; Simpan ke .webp</button>
        <div id="crop-result" style="font-size:11.5px;color:#9bf3c9"></div>
      </div>

      <div class="panel" style="text-align:center">
        <div style="margin-bottom:8px;font-size:11.5px;color:var(--mut)">Pratinjau Garis Potong Grid (Garis emas = batas tiap potongan)</div>
        <div class="crop-stage" id="crop-stage">
          <img id="crop-img" src="" alt="Preview Sheet" onload="drawGridOverlay()" />
          <svg id="crop-svg" class="crop-overlay"></svg>
        </div>
      </div>
    </div>
  </div>
</div>

<div id="toast" class="hidden"></div>

<script>
const CAT_META = [
  { id: "ui_forge",  lbl: "🏛️ UI, Animated Smith & Peta Bioma", defFolder: "ui/custom" },
  { id: "monsters",  lbl: "👹 10 Famili Monster & 16 Boss",      defFolder: "monsters" },
  { id: "weapons",   lbl: "⚔️ 48 Senjata",                       defFolder: "icons/weapons" },
  { id: "armors",    lbl: "🛡️ 15 Armor",                         defFolder: "icons/armors" },
  { id: "skills",    lbl: "🌳 Class & 25 Skill",                 defFolder: "icons/skills" },
  { id: "materials", lbl: "🪨 Material & Ore",                   defFolder: "icons/materials" }
];

let STATE = { slots: {}, assets: { appImages: [], sheets: [] }, assignments: {} };
let curCat = "ui_forge";
let selectedSlotId = null;

function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.remove("hidden");
  clearTimeout(window._tt);
  window._tt = setTimeout(() => t.classList.add("hidden"), 2600);
}

function setMode(m) {
  document.getElementById("view-mapper").classList.toggle("hidden", m !== "mapper");
  document.getElementById("view-cropper").classList.toggle("hidden", m !== "cropper");
  document.getElementById("mode-mapper").classList.toggle("active", m === "mapper");
  document.getElementById("mode-cropper").classList.toggle("active", m === "cropper");
  if (m === "cropper") updateCropPreview();
}

async function refreshData() {
  const res = await fetch("/api/state");
  STATE = await res.json();
  renderCatBar();
  populateFolders();
  populateSheets();
  selectCat(curCat);
}

function renderCatBar() {
  document.getElementById("cat-bar").innerHTML = CAT_META.map(c => {
    const total = (STATE.slots[c.id] || []).length;
    const filled = Object.values(STATE.assignments[c.id] || {}).filter(Boolean).length;
    return `<button class="btn ${curCat === c.id ? "active" : ""}" onclick="selectCat('${c.id}')">${c.lbl} (${filled}/${total})</button>`;
  }).join("");
}

function selectCat(catId) {
  curCat = catId;
  const list = STATE.slots[catId] || [];
  selectedSlotId = list[0] ? list[0].id : null;
  const meta = CAT_META.find(x => x.id === catId);
  const fSel = document.getElementById("gal-folder");
  if (meta && [...fSel.options].some(o => o.value === meta.defFolder)) {
    fSel.value = meta.defFolder;
  } else {
    fSel.value = "ALL";
  }
  renderCatBar();
  renderSlots();
  renderGallery();
}

function populateFolders() {
  const folders = [...new Set(STATE.assets.appImages.map(x => x.folder))].sort();
  const fSel = document.getElementById("gal-folder");
  fSel.innerHTML = `<option value="ALL">Semua Folder (${STATE.assets.appImages.length})</option>` +
    folders.map(f => `<option value="${f}">${f}</option>`).join("");
}

function previewUrlFor(val) {
  if (!val) return "";
  // Jika sudah path relatif di dalam app/ (assets/...) dan bukan file mentah root
  if (val.startsWith("app/")) return "/repo-file/" + encodeURIComponent(val);
  // Cek apakah ada di gallery appImages sebagai repoPath
  const hit = (STATE.assets.appImages || []).find(x => x.repoPath === val || x.appPath === val);
  if (hit) return "/repo-file/" + encodeURIComponent(hit.repoPath);
  return "/app-file/" + val;
}

function renderSlots() {
  const q = (document.getElementById("slot-search").value || "").toLowerCase();
  const list = STATE.slots[curCat] || [];
  const map = STATE.assignments[curCat] || {};
  const filledCount = list.filter(s => map[s.id]).length;
  document.getElementById("slot-progress").textContent = `${filledCount} / ${list.length} Terisi`;

  const filtered = list.filter(s => !q || s.label.toLowerCase().includes(q) || s.id.toLowerCase().includes(q));
  document.getElementById("slot-list").innerHTML = filtered.map(s => {
    const assigned = map[s.id] || "";
    const thumb = assigned ? `<img class="slot-thumb" src="${previewUrlFor(assigned)}" />` : `<div class="slot-thumb">—</div>`;
    return `
      <button class="slot-row ${selectedSlotId === s.id ? "selected" : ""} ${assigned ? "filled" : ""}" onclick="pickSlot('${s.id}')">
        ${thumb}
        <div style="min-width:0;flex:1">
          <div style="font-weight:700;font-size:12px;color:${selectedSlotId === s.id ? "var(--gold2)" : "var(--txt)"}">${s.label}</div>
          <div style="font-size:10px;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${assigned ? "✓ " + assigned : s.sub}</div>
        </div>
      </button>
    `;
  }).join("");
}

function pickSlot(id) {
  selectedSlotId = id;
  renderSlots();
  renderGallery();
}

function renderGallery() {
  const folder = document.getElementById("gal-folder").value;
  const q = (document.getElementById("gal-search").value || "").toLowerCase();
  const curAssigned = (STATE.assignments[curCat] || {})[selectedSlotId] || "";
  const imgs = STATE.assets.appImages.filter(x =>
    (folder === "ALL" || x.folder === folder) &&
    (!q || x.name.toLowerCase().includes(q) || x.repoPath.toLowerCase().includes(q))
  );
  document.getElementById("gal-count").textContent = `${imgs.length} gambar`;
  document.getElementById("gallery-grid").innerHTML = imgs.map(x => {
    const pickVal = x.appPath || x.repoPath;
    const isPicked = curAssigned === x.appPath || curAssigned === x.repoPath;
    return `
      <div class="asset-card ${isPicked ? "picked" : ""}" onclick="assignAsset('${pickVal.replace(/'/g, "\\'")}')">
        <img src="/repo-file/${encodeURIComponent(x.repoPath)}" loading="lazy" />
        <div class="asset-name" title="${x.repoPath}">${x.name}</div>
      </div>
    `;
  }).join("");
}

function assignAsset(path) {
  if (!selectedSlotId) return toast("⚠ Pilih 1 slot di kiri terlebih dahulu.");
  if (!STATE.assignments[curCat]) STATE.assignments[curCat] = {};
  STATE.assignments[curCat][selectedSlotId] = path;
  // Otomatis pindah ke slot berikutnya agar sortir cepat!
  const list = STATE.slots[curCat] || [];
  const idx = list.findIndex(s => s.id === selectedSlotId);
  if (idx >= 0 && idx + 1 < list.length) selectedSlotId = list[idx + 1].id;
  renderCatBar();
  renderSlots();
  renderGallery();
  toast("✓ Dipasang! Jangan lupa klik 💾 Simpan ke Game.");
}

function clearSelectedSlot() {
  if (!selectedSlotId || !STATE.assignments[curCat]) return;
  delete STATE.assignments[curCat][selectedSlotId];
  renderCatBar();
  renderSlots();
  renderGallery();
}

async function saveAll() {
  const res = await fetch("/api/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(STATE.assignments)
  });
  const data = await res.json();
  if (data.ok) toast("💾 Tersimpan ke app/js/asset_overrides.js! Refresh game untuk melihat hasil.");
  else toast("⚠ Gagal menyimpan.");
}

function populateSheets() {
  const sel = document.getElementById("crop-file");
  sel.innerHTML = STATE.assets.sheets.map(s =>
    `<option value="${s.repoPath}">[${s.source}] ${s.name} (${s.w}×${s.h})</option>`
  ).join("");
}

function updateCropPreview() {
  const p = document.getElementById("crop-file").value;
  if (!p) return;
  document.getElementById("crop-img").src = "/repo-file/" + encodeURIComponent(p);
  const base = p.split("/").pop().replace(/\.[^.]+$/, "");
  if (!document.getElementById("crop-prefix").value) {
    document.getElementById("crop-prefix").value = base;
  }
}

function drawGridOverlay() {
  const rows = Math.max(1, Number(document.getElementById("crop-rows").value) || 1);
  const cols = Math.max(1, Number(document.getElementById("crop-cols").value) || 1);
  const svg = document.getElementById("crop-svg");
  let lines = "";
  for (let r = 1; r < rows; r++) {
    const y = (r / rows) * 100;
    lines += `<line x1="0%" y1="${y}%" x2="100%" y2="${y}%" stroke="#f6cf7f" stroke-width="1.5" stroke-dasharray="4 3" />`;
  }
  for (let c = 1; c < cols; c++) {
    const x = (c / cols) * 100;
    lines += `<line x1="${x}%" y1="0%" x2="${x}%" y2="100%" stroke="#f6cf7f" stroke-width="1.5" stroke-dasharray="4 3" />`;
  }
  svg.innerHTML = lines;
}

async function runGridCrop() {
  const body = {
    repoPath: document.getElementById("crop-file").value,
    rows: Number(document.getElementById("crop-rows").value),
    cols: Number(document.getElementById("crop-cols").value),
    outSubdir: document.getElementById("crop-out").value,
    prefix: document.getElementById("crop-prefix").value,
    targetPx: Number(document.getElementById("crop-px").value)
  };
  const res = await fetch("/api/crop", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (data.ok) {
    document.getElementById("crop-result").textContent = `✓ Berhasil memotong ${data.count} gambar ke ${data.outDir}!`;
    toast(`✂️ ${data.count} potongan .webp berhasil disimpan!`);
    await refreshData();
  } else {
    toast("⚠ Gagal crop: " + (data.error || "Unknown"));
  }
}

refreshData();
</script>
</body>
</html>
"""


class StudioHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

    def _send_json(self, obj, code=200):
        raw = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def _send_file(self, path: Path):
        if not path.exists() or not path.is_file():
            self.send_error(404)
            return
        ext = path.suffix.lower()
        ctype = {".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg"}.get(ext, "application/octet-stream")
        raw = path.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path in ("/", "/index.html"):
            raw = HTML_PAGE.encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(raw)))
            self.end_headers()
            self.wfile.write(raw)
        elif parsed.path == "/api/state":
            self._send_json({
                "slots": load_game_slots(),
                "assets": scan_available_assets(),
                "assignments": load_assignments(),
            })
        elif parsed.path.startswith("/app-file/"):
            rel = urllib.parse.unquote(parsed.path[len("/app-file/"):])
            self._send_file((APP_DIR / rel).resolve())
        elif parsed.path.startswith("/repo-file/"):
            rel = urllib.parse.unquote(parsed.path[len("/repo-file/"):])
            self._send_file((REPO_ROOT / rel).resolve())
        else:
            self.send_error(404)

    def do_POST(self):
        length = int(self.headers.get("Content-Length", "0"))
        body = json.loads(self.rfile.read(length).decode("utf-8") or "{}")
        if self.path == "/api/save":
            save_assignments_and_generate_js(body)
            self._send_json({"ok": True})
        elif self.path == "/api/crop":
            try:
                res = perform_grid_crop(
                    body.get("repoPath", ""),
                    body.get("rows", 4),
                    body.get("cols", 4),
                    body.get("outSubdir", "monsters"),
                    body.get("prefix", "sheet"),
                    body.get("targetPx", 128),
                )
                self._send_json(res)
            except Exception as err:
                self._send_json({"ok": False, "error": str(err)}, code=400)
        else:
            self.send_error(404)


def main():
    parser = argparse.ArgumentParser(description="Battle-Smith RPG Visual Asset Sorter & Grid Cropper Studio")
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument("--no-browser", action="store_true")
    args = parser.parse_args()

    # Pastikan file asset_overrides.js awal selalu ada agar index.html tidak 404
    if not OVERRIDES_JS.exists():
        save_assignments_and_generate_js(load_assignments())

    server = ThreadingHTTPServer(("127.0.0.1", args.port), StudioHandler)
    url = f"http://127.0.0.1:{args.port}/"
    print(f"=== Battle-Smith Visual Asset Sorter Studio ===")
    print(f"Buka di browser: {url}")
    print("Tekan Ctrl+C di terminal ini untuk menutup Studio.")
    if not args.no_browser:
        threading.Timer(0.6, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStudio ditutup.")


if __name__ == "__main__":
    main()
