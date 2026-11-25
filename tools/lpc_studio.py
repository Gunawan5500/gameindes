#!/usr/bin/env python3
"""
Battle-Smith RPG — LPC Appearance Studio v4 (Manusia Normal & Monster Default)
Aturan Terkunci:
  1. Animasi 100% mengikuti animasi bawaan senjata LPC asli (misal katana/greatsword/bow
     dengan animasi jalan & serangnya masing-masing — tanpa rotasi/geser buatan).
  2. Fokus murni ke Penampilan dalam 2 Mode terpisah:
     - Mode 👤 Manusia Normal: male, female, muscular, pregnant (kepala/baju/celana diselaraskan otomatis).
     - Mode 👹 Monster Default LPC: skeleton, zombie, orc, goblin, lizard, wolf, minotaur, dll.
  3. 1-Klik Ekspor .webp (320x64 + 96x96) ke slot Game + Rebuild Preview Offline.
"""
import argparse
import base64
import io
import json
import os
import subprocess
import sys
import webbrowser
from collections import defaultdict
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
import lpc_pipeline as lp  # noqa: E402

KNOWN_ANIMS = {
    "slash", "halfslash", "backslash", "thrust", "shoot", "spellcast",
    "walk", "run", "idle", "combat_idle", "jump", "hurt", "sit", "climb", "emote"
}

HUMAN_BODY_TYPES = ("male", "female", "muscular", "pregnant")
MONSTER_KEYWORDS = (
    "skeleton", "zombie", "orc", "goblin", "lizard", "wolf", "boar",
    "minotaur", "jack", "alien", "vampire", "demon", "troll", "ogre",
    "kobold", "rat", "mouse", "pig", "sheep", "cat", "dog", "fox", "rabbit"
)

EXPORT_SLOTS = [
    {"id": "hero_smith",         "mode": "human",   "label": "🛡️ Hero Battle-Smith (Utama)", "sprite": "app/assets/sprites/hero_smith_5f.webp",         "portrait": "app/assets/ui/avatar_hero.webp"},
    {"id": "apprentice_kael",    "mode": "human",   "label": "👤 Murid: Kael",               "sprite": "app/assets/sprites/apprentice_kael_5f.webp",    "portrait": "app/assets/ui/portraits/portrait_kael.webp"},
    {"id": "apprentice_lyra",    "mode": "human",   "label": "👤 Murid: Lyra",               "sprite": "app/assets/sprites/apprentice_lyra_5f.webp",    "portrait": "app/assets/ui/portraits/portrait_lyra.webp"},
    {"id": "apprentice_garrick", "mode": "human",   "label": "👤 Murid: Garrick",            "sprite": "app/assets/sprites/apprentice_garrick_5f.webp", "portrait": "app/assets/ui/portraits/portrait_garrick.webp"},
    {"id": "apprentice_vesper",  "mode": "human",   "label": "👤 Murid: Vesper",             "sprite": "app/assets/sprites/apprentice_vesper_5f.webp",  "portrait": "app/assets/ui/portraits/portrait_vesper.webp"},
    {"id": "apprentice_thorne",  "mode": "human",   "label": "👤 Murid: Thorne",             "sprite": "app/assets/sprites/apprentice_thorne_5f.webp",  "portrait": "app/assets/ui/portraits/portrait_thorne.webp"},
    {"id": "enemy_humanoid",     "mode": "human",   "label": "🗡️ Musuh: Humanoid / Bandit",  "sprite": "app/assets/sprites/enemy_humanoid_5f.webp",     "portrait": None},
    {"id": "enemy_undead",       "mode": "monster", "label": "💀 Musuh: Undead / Skeleton",  "sprite": "app/assets/sprites/enemy_undead_5f.webp",       "portrait": None},
    {"id": "enemy_orc",          "mode": "monster", "label": "👹 Musuh: Orc / Goblin",       "sprite": "app/assets/sprites/enemy_orc_5f.webp",          "portrait": None},
    {"id": "boss_humanoid",      "mode": "monster", "label": "👑 Boss: Warlord / Monster",   "sprite": "app/assets/sprites/boss_humanoid_5f.webp",      "portrait": None},
]

STATE = {
    "lpc_dir": "",
    "sp_root": "",
    "file_count": 0,
    "animations": [],
    "slots": {},
    "weapons": {},
}


def auto_detect_lpc_dir(cli_dir=None):
    if cli_dir and os.path.isdir(cli_dir):
        return cli_dir
    home = os.path.expanduser("~")
    for c in [
        os.path.join(home, "Desktop", "Universal-LPC-Spritesheet-Character-Generator"),
        os.path.join(home, "Downloads", "Universal-LPC-Spritesheet-Character-Generator"),
        os.path.join(home, "Universal-LPC-Spritesheet-Character-Generator"),
    ]:
        if os.path.isdir(c):
            return os.path.abspath(c)
    return ""


def parse_lpc_rel_path(rel):
    low = rel.replace("\\", "/").lower()
    if any(skip in low for skip in ("/behind/", "_behind", "/shadow", "shadow.png", "/mask", "/bg/", "/child/", "/teen/")):
        return None
    segs = low[:-4].split("/")
    if len(segs) < 2:
        return None

    top = segs[0]
    last = segs[-1]
    prev = segs[-2] if len(segs) >= 2 else ""

    if last in KNOWN_ANIMS:
        anim = last
        if len(segs) >= 4:
            color = prev
            style = "/".join(segs[1:-2])
        else:
            color = "default"
            style = "/".join(segs[1:-1])
    elif prev in KNOWN_ANIMS:
        anim = prev
        color = last
        style = "/".join(segs[1:-2])
    else:
        anim = "__full__"
        color = last
        style = "/".join(segs[1:-1])

    if not style:
        style = top
    return top, style, color, anim


def scan_lpc_catalog(lpc_dir):
    STATE["lpc_dir"] = lpc_dir or ""
    STATE["file_count"] = 0
    STATE["animations"] = []
    slot_names = ("body", "head", "eyes", "hair", "hat", "torso", "legs", "feet")
    STATE["slots"] = {k: defaultdict(lambda: defaultdict(dict)) for k in slot_names}
    STATE["weapons"] = defaultdict(lambda: defaultdict(lambda: defaultdict(dict)))

    if not lpc_dir or not os.path.isdir(lpc_dir):
        return 0

    sp_root = os.path.join(lpc_dir, "spritesheets")
    if not os.path.isdir(sp_root):
        sp_root = lpc_dir
    STATE["sp_root"] = sp_root

    found_anims = set()
    count = 0

    for dirpath, _, filenames in os.walk(sp_root):
        for fn in filenames:
            if not fn.lower().endswith(".png"):
                continue
            count += 1
            full = os.path.join(dirpath, fn)
            rel = os.path.relpath(full, sp_root)
            parsed = parse_lpc_rel_path(rel)
            if not parsed:
                continue
            top, style, color, anim = parsed
            if anim != "__full__":
                found_anims.add(anim)

            if top == "head":
                if style.startswith("heads/"):
                    STATE["slots"]["head"][style[len("heads/"):]][color][anim] = full
                elif style.startswith("faces/"):
                    STATE["slots"]["eyes"][style][color][anim] = full
            elif top == "eyes":
                STATE["slots"]["eyes"][style][color][anim] = full
            elif top in STATE["slots"]:
                STATE["slots"][top][style][color][anim] = full
            elif top in ("beards", "facial"):
                STATE["slots"]["hair"][f"{top}/{style}"][color][anim] = full
            elif top == "weapon":
                w_parts = style.split("/")
                w_cat = w_parts[0] if w_parts else "other"
                w_id = "/".join(w_parts[1:]) if len(w_parts) > 1 else w_cat
                STATE["weapons"][w_cat][w_id][color][anim] = full

    STATE["file_count"] = count
    priority = ["slash", "halfslash", "backslash", "thrust", "shoot", "spellcast", "combat_idle", "walk", "run", "idle", "jump", "hurt", "sit", "climb", "emote"]
    STATE["animations"] = [a for a in priority if a in found_anims] + sorted(found_anims - set(priority))
    if not STATE["animations"]:
        STATE["animations"] = ["slash", "thrust", "shoot", "spellcast", "walk", "idle"]
    return count


def classify_body_or_head(style):
    low = style.lower()
    if any(mk in low for mk in MONSTER_KEYWORDS):
        return "monster"
    if "human" in low or any(f"/{bt}" in f"/{low}" or low.endswith(bt) for bt in HUMAN_BODY_TYPES):
        return "human"
    return "monster"


def detect_body_type_tag(style):
    low = f"/{style.lower()}/"
    for bt in HUMAN_BODY_TYPES:
        if f"/{bt}/" in low or low.endswith(f"/{bt}/"):
            return bt
    return "any"


def build_ui_catalog():
    slots_out = {}
    for slot_name, styles in STATE["slots"].items():
        items = []
        for st in sorted(styles.keys()):
            kind = classify_body_or_head(st) if slot_name in ("body", "head") else "shared"
            items.append({
                "style": st,
                "colors": sorted(styles[st].keys()),
                "kind": kind,
                "body_type": detect_body_type_tag(st),
            })
        slots_out[slot_name] = items

    weapons_out = {}
    for w_cat in sorted(STATE["weapons"].keys()):
        w_list = []
        for w_id in sorted(STATE["weapons"][w_cat].keys()):
            colors_map = STATE["weapons"][w_cat][w_id]
            all_anims = set()
            for amap in colors_map.values():
                for a in amap.keys():
                    all_anims.add("all" if a == "__full__" else a)
            w_list.append({"id": w_id, "colors": sorted(colors_map.keys()), "anims": sorted(all_anims)})
        weapons_out[w_cat] = w_list

    return {
        "lpc_dir": STATE["lpc_dir"],
        "file_count": STATE["file_count"],
        "animations": STATE["animations"],
        "human_body_types": list(HUMAN_BODY_TYPES),
        "slots": slots_out,
        "weapons": weapons_out,
        "export_slots": EXPORT_SLOTS,
    }


def pick_file_for_anim(anim_map, anim_name):
    if not anim_map:
        return None
    if anim_name in anim_map:
        return anim_map[anim_name]
    if "__full__" in anim_map:
        return anim_map["__full__"]
    fallbacks = {
        "slash": ["halfslash", "backslash", "thrust", "combat_idle", "walk", "idle"],
        "halfslash": ["slash", "combat_idle", "walk", "idle"],
        "backslash": ["slash", "combat_idle", "walk", "idle"],
        "thrust": ["slash", "combat_idle", "walk", "idle"],
        "shoot": ["combat_idle", "walk", "idle"],
        "spellcast": ["combat_idle", "walk", "idle"],
        "combat_idle": ["idle", "walk"],
        "run": ["walk", "idle"],
        "idle": ["walk", "combat_idle"],
    }
    for fb in fallbacks.get(anim_name, ["walk", "idle"]):
        if fb in anim_map:
            return anim_map[fb]
    return next(iter(anim_map.values()))


def render_layers_from_selection(sel):
    anim = sel.get("animation") or "slash"
    direction = sel.get("direction") or "right"
    recipes_grid = {
        "grid": {
            "frame_width": 64, "frame_height": 64, "frames_per_strip": 5,
            "animations": {
                "spellcast": {"up": 0, "left": 1, "down": 2, "right": 3},
                "thrust":    {"up": 4, "left": 5, "down": 6, "right": 7},
                "walk":      {"up": 8, "left": 9, "down": 10, "right": 11},
                "slash":     {"up": 12, "left": 13, "down": 14, "right": 15},
                "shoot":     {"up": 16, "left": 17, "down": 18, "right": 19},
            }
        }
    }

    strip_out = Image.new("RGBA", (320, 64), (0, 0, 0, 0))
    portrait_canvas = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
    used = []

    for slot in ("body", "feet", "legs", "torso", "head", "eyes", "hair", "hat"):
        pick = sel.get(slot)
        if not pick or not pick.get("style"):
            continue
        amap = STATE["slots"].get(slot, {}).get(pick["style"], {}).get(pick.get("color") or "default")
        if not amap:
            continue

        f_anim = pick_file_for_anim(amap, anim)
        if f_anim:
            with Image.open(f_anim).convert("RGBA") as sh:
                part_strip = lp.extract_5frame_strip_smart(sh, anim, direction, recipes_grid)
                if part_strip.getbbox() is not None:
                    strip_out.alpha_composite(part_strip)
                    used.append({"slot": slot, "file": os.path.relpath(f_anim, STATE["sp_root"]).replace("\\", "/")})

        f_port = pick_file_for_anim(amap, "walk") or f_anim
        if f_port:
            with Image.open(f_port).convert("RGBA") as psh:
                f0 = lp.extract_front_frame_64(psh, 64, 64)
                if f0.size != (64, 64):
                    tmp = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
                    tmp.paste(f0, (0, 0), f0)
                    f0 = tmp
                if f0.getbbox() is not None:
                    portrait_canvas.alpha_composite(f0)

    # Senjata asli LPC (100% animasi bawaan senjata, tanpa rotasi/geser buatan)
    wpn = sel.get("weapon")
    if wpn and wpn.get("category") and wpn.get("id"):
        amap = STATE["weapons"].get(wpn["category"], {}).get(wpn["id"], {}).get(wpn.get("color") or "default")
        if amap:
            f_wpn = pick_file_for_anim(amap, anim)
            if f_wpn:
                with Image.open(f_wpn).convert("RGBA") as wsh:
                    w_strip = lp.extract_5frame_strip_smart(wsh, anim, direction, recipes_grid)
                    if w_strip.getbbox() is not None:
                        strip_out.alpha_composite(w_strip)
                        used.append({"slot": "weapon", "file": os.path.relpath(f_wpn, STATE["sp_root"]).replace("\\", "/")})

    bust = portrait_canvas.crop((14, 8, 50, 44))
    portrait_out = Image.new("RGBA", (96, 96), (18, 28, 42, 255))
    scaled = bust.resize((88, 88), Image.NEAREST)
    portrait_out.paste(scaled, (4, 6), scaled)
    return strip_out, portrait_out, used


def to_b64_webp(img):
    buf = io.BytesIO()
    img.save(buf, "WEBP", quality=86, method=6)
    return "data:image/webp;base64," + base64.b64encode(buf.getvalue()).decode("ascii"), len(buf.getvalue())


STUDIO_HTML = r"""<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Battle-Smith RPG — LPC Appearance Studio v4</title>
<style>
  :root {
    --bg: #0b1118; --card: #121c27; --card2: #0d151f; --border: #25384d;
    --text: #e2e8f0; --muted: #94a3b8; --amber: #f59e0b; --teal: #14b8a6; --sky: #38bdf8;
  }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: system-ui, -apple-system, sans-serif; background: var(--bg); color: var(--text); font-size: 13px; }
  header { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 16px; background: #0f1924; border-bottom: 1px solid var(--border); flex-wrap: wrap; }
  h1 { margin: 0; font-size: 15px; color: var(--amber); }
  .layout { display: grid; grid-template-columns: 390px 1fr; gap: 14px; padding: 14px; max-width: 1400px; margin: 0 auto; }
  @media (max-width: 960px) { .layout { grid-template-columns: 1fr; } }
  .card { background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 12px; display: flex; flex-direction: column; gap: 10px; }
  .sec-title { font-weight: 700; font-size: 13px; color: var(--sky); display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; }
  .muted { color: var(--muted); font-size: 11.5px; }
  input, select, button { font: inherit; border-radius: 7px; border: 1px solid var(--border); background: var(--card2); color: var(--text); padding: 6px 8px; }
  select { width: 100%; }
  button { cursor: pointer; font-weight: 600; }
  button.primary { background: #b45309; border-color: var(--amber); color: #fff; }
  button.teal { background: #0f766e; border-color: var(--teal); color: #fff; }
  .mode-tabs { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
  .mode-tab { padding: 8px; border-radius: 8px; background: var(--card2); border: 1px solid var(--border); font-weight: 700; }
  .mode-tab.active { background: #0369a1; border-color: var(--sky); color: #fff; }
  .bt-pills { display: flex; gap: 5px; flex-wrap: wrap; }
  .row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .slot-box { background: var(--card2); border: 1px solid var(--border); border-radius: 8px; padding: 7px 8px; display: flex; flex-direction: column; gap: 5px; }
  .slot-grid { display: grid; grid-template-columns: 1fr 115px; gap: 6px; }
  .stage { background: repeating-conic-gradient(#13202e 0% 25%, #0e1824 0% 50%) 50% / 16px 16px; border: 1px solid #35516d; border-radius: 10px; padding: 16px; display: flex; align-items: center; justify-content: space-around; gap: 16px; flex-wrap: wrap; min-height: 205px; }
  @keyframes play5 { from { background-position-x: 0px; } to { background-position-x: -960px; } }
  .sprite-big { width: 192px; height: 192px; background-size: 960px 192px; background-repeat: no-repeat; image-rendering: pixelated; animation: play5 0.8s steps(5) infinite; }
  .sprite-big.paused { animation: none !important; }
  .portrait-box { width: 96px; height: 96px; border-radius: 10px; border: 2px solid var(--amber); image-rendering: pixelated; background: #0e1620; }
  .strip-img { width: 320px; height: 64px; image-rendering: pixelated; border: 1px solid var(--border); border-radius: 6px; background: #0b1118; }
  .pill-wrap { display: flex; gap: 6px; flex-wrap: wrap; }
  .pill { padding: 5px 10px; border-radius: 999px; font-size: 12px; background: var(--card2); border: 1px solid var(--border); }
  .pill.supported { border-color: var(--teal); color: #5eead4; }
  .pill.active { background: #0369a1; border-color: var(--sky); color: #fff; }
  .log-list { font-family: monospace; font-size: 11px; color: var(--muted); display: flex; flex-direction: column; gap: 2px; }
  #status { font-weight: 700; color: var(--teal); font-size: 12px; }
</style>
</head>
<body>
<header>
  <div>
    <h1>🎨 Battle-Smith RPG — LPC Appearance Studio v4</h1>
    <div id="meta" class="muted">Memindai folder Universal LPC...</div>
  </div>
  <div class="row">
    <input id="inp-dir" style="width:310px" placeholder="Path folder Universal-LPC-Spritesheet-Character-Generator" />
    <button id="btn-scan">🔄 Pindai Ulang</button>
  </div>
</header>

<div class="layout">
  <!-- PANEL KIRI: 2 MODE PENAMPILAN (MANUSIA NORMAL vs MONSTER DEFAULT) -->
  <div class="card">
    <div class="mode-tabs">
      <button id="tab-human" class="mode-tab active">👤 Manusia Normal</button>
      <button id="tab-monster" class="mode-tab">👹 Monster Default</button>
    </div>

    <div id="human-bt-bar" class="slot-box">
      <div class="muted" style="font-weight:700">Tipe Tubuh Manusia Normal:</div>
      <div id="bt-pills" class="bt-pills"></div>
    </div>

    <div class="sec-title">
      <span id="panel-mode-title">👤 Penampilan Manusia</span>
      <button id="btn-random">🎲 Acak Penampilan</button>
    </div>
    <div id="appearance-slots" style="display:flex;flex-direction:column;gap:7px"></div>
  </div>

  <!-- PANEL KANAN: PREVIEW + SENJATA ASLI LPC + FILTER GERAKAN -->
  <div style="display:flex;flex-direction:column;gap:12px">
    <!-- PREVIEW -->
    <div class="card">
      <div class="sec-title">
        <span>🎬 Preview Live 5-Frame (Animasi Asli LPC)</span>
        <span id="status">Siap.</span>
      </div>
      <div class="stage">
        <div style="text-align:center">
          <div id="live-sprite" class="sprite-big"></div>
          <div class="muted" style="margin-top:4px">Live Preview (3× Zoom)</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <img id="live-portrait" class="portrait-box" alt="Portrait" />
          <div class="muted">Potret 96×96</div>
          <img id="live-strip" class="strip-img" alt="Strip 5 Frame" />
        </div>
      </div>

      <div class="row" style="justify-content:space-between">
        <div class="row">
          <button id="btn-play" class="teal">⏸ Pause</button>
          <button id="btn-prev-f">◀ Frame</button>
          <span id="lbl-frame" class="muted">Auto (5f)</span>
          <button id="btn-next-f">Frame ▶</button>
        </div>
        <div class="row">
          <label class="muted">Arah:
            <select id="sel-dir" style="width:auto">
              <option value="right">Kanan (Hero/Murid)</option>
              <option value="left">Kiri (Musuh/Boss)</option>
              <option value="down">Depan (Down)</option>
              <option value="up">Belakang (Up)</option>
            </select>
          </label>
          <label class="muted">Kecepatan:
            <input id="rng-speed" type="range" min="35" max="150" value="80" style="width:90px" />
            <span id="lbl-speed">0.80s</span>
          </label>
        </div>
      </div>
    </div>

    <!-- PILIH SENJATA (MENENTUKAN ANIMASI ASLI LPC) -->
    <div class="card">
      <div class="sec-title">
        <span>⚔️ 2. Senjata yang Digunakan (Animasi Asli LPC — Katana/Greatsword/Bow/dll.)</span>
        <button id="btn-clear-wpn">Tanpa Senjata</button>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">
        <label class="muted">Kategori Senjata<select id="sel-wcat"></select></label>
        <label class="muted">Jenis Senjata<select id="sel-wid"></select></label>
        <label class="muted">Warna / Varian<select id="sel-wcol"></select></label>
      </div>
      <div id="wpn-anims-hint" class="muted">Animasi bawaan senjata: -</div>
    </div>

    <!-- FILTER GERAKAN (OTOMATIS DISESUAIKAN DENGAN SENJATA) -->
    <div class="card">
      <div class="sec-title">
        <span>🏃 3. Filter Gerakan (Sesuai Animasi Bawaan Senjata)</span>
        <label class="muted" style="display:flex;align-items:center;gap:5px;cursor:pointer">
          <input type="checkbox" id="chk-only-wpn-anims" checked />
          Hanya tampilkan gerakan milik senjata terpilih
        </label>
      </div>
      <div id="motion-pills" class="pill-wrap"></div>
    </div>

    <!-- EKSPOR KE GAME -->
    <div class="card">
      <div class="sec-title"><span>💾 4. Ekspor ke Game (.webp Ramah Oppo A54)</span></div>
      <div class="row">
        <select id="sel-export-slot" style="flex:1;min-width:220px"></select>
        <button id="btn-export-slot" class="primary">💾 Simpan ke Slot Game (.webp)</button>
        <button id="btn-rebuild" class="teal">⚡ Rebuild Preview Game</button>
      </div>
      <div id="used-logs" class="log-list"></div>
    </div>
  </div>
</div>

<script>
let CAT = null;
let MODE = "human"; // "human" | "monster"
let HUMAN_BT = "male"; // "male" | "female" | "muscular" | "pregnant"
let ONLY_WPN_ANIMS = true;
const SEL = {
  animation: "walk",
  direction: "right",
  body: null, head: null, eyes: null, hair: null, hat: null, torso: null, legs: null, feet: null,
  weapon: null
};
let PAUSED = false;
let MANUAL_FRAME = 0;

const SLOT_LABELS = [
  ["body",  "🧍 Tubuh (Body)"],
  ["head",  "🙂 Kepala / Muka (Head)"],
  ["eyes",  "👀 Mata / Ekspresi (Eyes)"],
  ["hair",  "💇 Rambut / Jenggot (Hair)"],
  ["hat",   "🪖 Topi / Helm (Hat)"],
  ["torso", "🛡️ Baju / Zirah (Torso)"],
  ["legs",  "👖 Celana (Legs)"],
  ["feet",  "🥾 Sepatu / Boots (Feet)"]
];

async function api(url, body) {
  const res = await fetch(url, body ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {});
  return res.json();
}

function getFilteredSlotItems(key) {
  const all = CAT.slots[key] || [];
  if (key === "body" || key === "head") {
    const byKind = all.filter(it => it.kind === MODE);
    if (MODE === "human") {
      // Untuk tubuh manusia: cocokkan body_type (male/female/muscular/pregnant)
      if (key === "body") {
        const exact = byKind.filter(it => it.body_type === HUMAN_BT);
        return exact.length ? exact : byKind;
      }
      // Untuk kepala manusia: muscular pakai kepala male, pregnant pakai kepala female
      const headBt = HUMAN_BT === "pregnant" ? "female" : (HUMAN_BT === "muscular" ? "male" : HUMAN_BT);
      const exactH = byKind.filter(it => it.body_type === headBt || it.body_type === "any");
      return exactH.length ? exactH : byKind;
    }
    return byKind.length ? byKind : all;
  }
  if (MODE === "human" && (key === "torso" || key === "legs" || key === "feet")) {
    const btMatch = all.filter(it => it.body_type === HUMAN_BT || it.body_type === "any");
    return btMatch.length ? btMatch : all;
  }
  return all;
}

function renderBodyTypePills() {
  document.getElementById("human-bt-bar").style.display = MODE === "human" ? "flex" : "none";
  document.getElementById("panel-mode-title").textContent = MODE === "human" ? `👤 Penampilan Manusia (${HUMAN_BT})` : "👹 Penampilan Monster Default LPC";
  const el = document.getElementById("bt-pills");
  el.innerHTML = (CAT.human_body_types || []).map(bt =>
    `<button class="pill ${HUMAN_BT === bt ? "active" : ""}" data-bt="${bt}">${bt}</button>`
  ).join("");
  el.querySelectorAll("[data-bt]").forEach(b => {
    b.onclick = () => {
      HUMAN_BT = b.dataset.bt;
      pickDefaultForMode();
      renderAllControls();
      refreshPreview();
    };
  });
}

function renderAppearanceSlots() {
  const wrap = document.getElementById("appearance-slots");
  wrap.innerHTML = SLOT_LABELS.map(([key, label]) => {
    const list = getFilteredSlotItems(key);
    const cur = SEL[key] || { style: "", color: "" };
    const styleOpts = `<option value="">-- Tidak Dipakai --</option>` + list.map(it =>
      `<option value="${it.style}" ${it.style === cur.style ? "selected" : ""}>${it.style}</option>`
    ).join("");
    const found = list.find(it => it.style === cur.style);
    const colOpts = found ? found.colors.map(c =>
      `<option value="${c}" ${c === cur.color ? "selected" : ""}>${c}</option>`
    ).join("") : `<option value="">-</option>`;

    return `
      <div class="slot-box">
        <div style="font-weight:700;font-size:12px">${label} <span class="muted">(${list.length})</span></div>
        <div class="slot-grid">
          <select data-slot-style="${key}">${styleOpts}</select>
          <select data-slot-color="${key}">${colOpts}</select>
        </div>
      </div>
    `;
  }).join("");

  wrap.querySelectorAll("[data-slot-style]").forEach(sel => {
    sel.onchange = () => {
      const k = sel.dataset.slotStyle;
      const st = sel.value;
      if (!st) SEL[k] = null;
      else {
        const item = getFilteredSlotItems(k).find(x => x.style === st);
        SEL[k] = { style: st, color: item?.colors[0] || "default" };
      }
      renderAppearanceSlots();
      refreshPreview();
    };
  });
  wrap.querySelectorAll("[data-slot-color]").forEach(sel => {
    sel.onchange = () => { if (SEL[sel.dataset.slotColor]) { SEL[sel.dataset.slotColor].color = sel.value; refreshPreview(); } };
  });
}

function getActiveWeaponObj() {
  if (!SEL.weapon) return null;
  return (CAT.weapons[SEL.weapon.category] || []).find(w => w.id === SEL.weapon.id) || null;
}

function renderWeaponFilter() {
  const cats = Object.keys(CAT.weapons || {});
  const elCat = document.getElementById("sel-wcat");
  const elId = document.getElementById("sel-wid");
  const elCol = document.getElementById("sel-wcol");

  const curCat = SEL.weapon?.category || "";
  elCat.innerHTML = `<option value="">-- Tanpa Senjata --</option>` + cats.map(c => `<option value="${c}" ${c === curCat ? "selected" : ""}>${c}</option>`).join("");

  const wList = curCat ? (CAT.weapons[curCat] || []) : [];
  const curId = SEL.weapon?.id || "";
  elId.innerHTML = wList.length ? wList.map(w => `<option value="${w.id}" ${w.id === curId ? "selected" : ""}>${w.id}</option>`).join("") : `<option value="">-</option>`;

  const wObj = getActiveWeaponObj();
  const curCol = SEL.weapon?.color || "";
  elCol.innerHTML = wObj ? wObj.colors.map(c => `<option value="${c}" ${c === curCol ? "selected" : ""}>${c}</option>`).join("") : `<option value="">-</option>`;

  document.getElementById("wpn-anims-hint").textContent = wObj
    ? `Animasi bawaan senjata ini: ${wObj.anims.join(", ")}`
    : "Tanpa senjata — seluruh gerakan tubuh tersedia.";

  const syncAnimToWeapon = () => {
    const wo = getActiveWeaponObj();
    if (wo && !wo.anims.includes("all") && !wo.anims.includes(SEL.animation)) {
      const pref = ["slash", "halfslash", "backslash", "thrust", "shoot", "spellcast", "walk"];
      SEL.animation = pref.find(a => wo.anims.includes(a)) || wo.anims[0] || "walk";
    }
  };

  elCat.onchange = () => {
    if (!elCat.value) SEL.weapon = null;
    else {
      const first = (CAT.weapons[elCat.value] || [])[0];
      SEL.weapon = first ? { category: elCat.value, id: first.id, color: first.colors[0] || "default" } : null;
    }
    syncAnimToWeapon();
    renderWeaponFilter();
    renderMotionPills();
    refreshPreview();
  };
  elId.onchange = () => {
    const w = (CAT.weapons[elCat.value] || []).find(x => x.id === elId.value);
    if (w) SEL.weapon = { category: elCat.value, id: w.id, color: w.colors[0] || "default" };
    syncAnimToWeapon();
    renderWeaponFilter();
    renderMotionPills();
    refreshPreview();
  };
  elCol.onchange = () => { if (SEL.weapon) { SEL.weapon.color = elCol.value; refreshPreview(); } };
}

function renderMotionPills() {
  const el = document.getElementById("motion-pills");
  const wObj = getActiveWeaponObj();
  const wAnims = wObj ? wObj.anims : [];
  let list = CAT.animations || [];
  if (wObj && ONLY_WPN_ANIMS && !wAnims.includes("all")) {
    const filtered = list.filter(a => wAnims.includes(a));
    if (filtered.length) list = filtered;
  }
  el.innerHTML = list.map(a => {
    const isSup = wObj && (wAnims.includes("all") || wAnims.includes(a));
    return `<button class="pill ${isSup ? "supported" : ""} ${SEL.animation === a ? "active" : ""}" data-m="${a}">${a}</button>`;
  }).join("");
  el.querySelectorAll("[data-m]").forEach(b => {
    b.onclick = () => { SEL.animation = b.dataset.m; renderMotionPills(); refreshPreview(); };
  });
}

function pickDefaultForMode() {
  const pick = (slot, prefStyle, prefColor) => {
    const list = getFilteredSlotItems(slot);
    if (!list.length) return null;
    const item = (prefStyle && list.find(x => x.style.includes(prefStyle))) || list[0];
    const col = (prefColor && item.colors.find(c => c.includes(prefColor))) || item.colors[0];
    return { style: item.style, color: col };
  };
  if (MODE === "human") {
    SEL.direction = "right";
    SEL.body = pick("body", HUMAN_BT, "light");
    SEL.head = pick("head", "human", "light");
    SEL.eyes = pick("eyes", "human", "brown");
    SEL.hair = pick("hair", "short", "brown");
    SEL.torso = pick("torso", "plate", "steel") || pick("torso", "", "brown");
    SEL.legs = pick("legs", "pants", "charcoal") || pick("legs", "", "black");
    SEL.feet = pick("feet", "boots", "brown");
    SEL.hat = null;
  } else {
    SEL.direction = "left";
    SEL.body = pick("body", "orc", "") || pick("body", "skeleton", "") || pick("body", "", "");
    SEL.head = pick("head", "orc", "") || pick("head", "skeleton", "") || pick("head", "", "");
    SEL.eyes = null;
    SEL.hair = null;
    SEL.hat = null;
    SEL.torso = pick("torso", "leather", "brown") || null;
    SEL.legs = pick("legs", "pants", "brown") || null;
    SEL.feet = null;
  }
  document.getElementById("sel-dir").value = SEL.direction;
}

function renderAllControls() {
  document.getElementById("tab-human").classList.toggle("active", MODE === "human");
  document.getElementById("tab-monster").classList.toggle("active", MODE === "monster");
  renderBodyTypePills();
  renderAppearanceSlots();
  renderWeaponFilter();
  renderMotionPills();
}

async function refreshPreview() {
  document.getElementById("status").textContent = "Merender...";
  const r = await api("/api/preview", SEL);
  if (!r.ok) { document.getElementById("status").textContent = "⚠ " + r.error; return; }
  document.getElementById("live-sprite").style.backgroundImage = `url('${r.strip_b64}')`;
  document.getElementById("live-strip").src = r.strip_b64;
  document.getElementById("live-portrait").src = r.portrait_b64;
  document.getElementById("status").textContent = `✓ ${MODE === "human" ? "Manusia (" + HUMAN_BT + ")" : "Monster"} • ${SEL.animation} (${SEL.direction}) • ${(r.strip_bytes/1024).toFixed(2)} KB`;
  document.getElementById("used-logs").innerHTML = (r.used || []).map(u => `<div>[${u.slot}] ${u.file}</div>`).join("");
}

function updateFramePlayback() {
  const sp = document.getElementById("live-sprite");
  sp.classList.toggle("paused", PAUSED);
  document.getElementById("btn-play").textContent = PAUSED ? "▶ Play" : "⏸ Pause";
  if (PAUSED) {
    sp.style.backgroundPositionX = `${-MANUAL_FRAME * 192}px`;
    document.getElementById("lbl-frame").textContent = `Frame ${MANUAL_FRAME + 1}/5`;
  } else {
    sp.style.backgroundPositionX = "";
    document.getElementById("lbl-frame").textContent = "Auto (5f)";
  }
}

document.getElementById("tab-human").onclick = () => { MODE = "human"; pickDefaultForMode(); renderAllControls(); refreshPreview(); };
document.getElementById("tab-monster").onclick = () => { MODE = "monster"; pickDefaultForMode(); renderAllControls(); refreshPreview(); };
document.getElementById("chk-only-wpn-anims").onchange = e => { ONLY_WPN_ANIMS = e.target.checked; renderMotionPills(); };
document.getElementById("btn-play").onclick = () => { PAUSED = !PAUSED; updateFramePlayback(); };
document.getElementById("btn-prev-f").onclick = () => { PAUSED = true; MANUAL_FRAME = (MANUAL_FRAME + 4) % 5; updateFramePlayback(); };
document.getElementById("btn-next-f").onclick = () => { PAUSED = true; MANUAL_FRAME = (MANUAL_FRAME + 1) % 5; updateFramePlayback(); };
document.getElementById("sel-dir").onchange = e => { SEL.direction = e.target.value; refreshPreview(); };
document.getElementById("rng-speed").oninput = e => {
  const sec = (Number(e.target.value) / 100).toFixed(2);
  document.getElementById("lbl-speed").textContent = sec + "s";
  document.getElementById("live-sprite").style.animationDuration = sec + "s";
};
document.getElementById("btn-clear-wpn").onclick = () => { SEL.weapon = null; renderWeaponFilter(); renderMotionPills(); refreshPreview(); };

document.getElementById("btn-random").onclick = () => {
  const rnd = arr => arr[Math.floor(Math.random() * arr.length)];
  const keys = MODE === "human" ? ["body", "head", "eyes", "hair", "torso", "legs", "feet"] : ["body", "head", "torso", "legs"];
  for (const k of keys) {
    const list = getFilteredSlotItems(k);
    if (list.length) {
      const it = rnd(list);
      SEL[k] = { style: it.style, color: rnd(it.colors) };
    }
  }
  renderAppearanceSlots();
  refreshPreview();
};

document.getElementById("btn-export-slot").onclick = async () => {
  const slotId = document.getElementById("sel-export-slot").value;
  document.getElementById("status").textContent = "Mengekspor .webp...";
  const r = await api("/api/export_slot", { slot_id: slotId, selection: SEL });
  document.getElementById("status").textContent = r.ok ? `💾 ${r.message}` : `⚠ ${r.error}`;
};

document.getElementById("btn-rebuild").onclick = async () => {
  document.getElementById("status").textContent = "Membangun ulang fase5_offline_preview.html...";
  const r = await api("/api/rebuild_preview", {});
  document.getElementById("status").textContent = r.ok ? `⚡ ${r.message}` : `⚠ ${r.error}`;
};

document.getElementById("btn-scan").onclick = async () => {
  CAT = await api("/api/rescan", { lpc_dir: document.getElementById("inp-dir").value.trim() });
  initUI();
};

function initUI() {
  document.getElementById("inp-dir").value = CAT.lpc_dir || "";
  const hCount = (CAT.slots.head || []).filter(x => x.kind === "human").length;
  const mCount = (CAT.slots.head || []).filter(x => x.kind === "monster").length;
  document.getElementById("meta").textContent = `${CAT.file_count} PNG • Kepala Manusia: ${hCount} • Kepala Monster: ${mCount} • ${Object.keys(CAT.weapons).length} Kategori Senjata`;
  document.getElementById("sel-export-slot").innerHTML = CAT.export_slots.map(s => `<option value="${s.id}">${s.label}</option>`).join("");
  pickDefaultForMode();
  renderAllControls();
  refreshPreview();
}

(async () => {
  CAT = await api("/api/catalog");
  initUI();
})();
</script>
</body>
</html>
"""


class StudioHandler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass

    def _send_json(self, obj, code=200):
        raw = json.dumps(obj).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def _read_json(self):
        n = int(self.headers.get("Content-Length", "0"))
        return json.loads(self.rfile.read(n).decode("utf-8")) if n > 0 else {}

    def do_GET(self):
        if self.path == "/" or self.path.startswith("/?"):
            raw = STUDIO_HTML.encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(raw)))
            self.end_headers()
            self.wfile.write(raw)
        elif self.path == "/api/catalog":
            self._send_json(build_ui_catalog())
        else:
            self.send_error(404)

    def do_POST(self):
        try:
            body = self._read_json()
            if self.path == "/api/rescan":
                scan_lpc_catalog(body.get("lpc_dir", ""))
                self._send_json(build_ui_catalog())
            elif self.path == "/api/preview":
                strip, portrait, used = render_layers_from_selection(body)
                s_b64, s_sz = to_b64_webp(strip)
                p_b64, p_sz = to_b64_webp(portrait)
                self._send_json({
                    "ok": True, "strip_b64": s_b64, "strip_bytes": s_sz,
                    "portrait_b64": p_b64, "portrait_bytes": p_sz, "used": used,
                })
            elif self.path == "/api/export_slot":
                slot = next((s for s in EXPORT_SLOTS if s["id"] == body.get("slot_id")), None)
                if not slot:
                    return self._send_json({"ok": False, "error": "Slot tidak ditemukan"}, code=400)
                strip, portrait, used = render_layers_from_selection(body.get("selection") or {})
                msgs = []
                if slot["sprite"]:
                    _, sz = lp.save_webp(strip, slot["sprite"])
                    msgs.append(f"{slot['sprite']} ({sz/1024:.2f} KB)")
                if slot["portrait"]:
                    _, sz = lp.save_webp(portrait, slot["portrait"])
                    msgs.append(f"{slot['portrait']} ({sz/1024:.2f} KB)")
                self._send_json({"ok": True, "message": "Tersimpan: " + " + ".join(msgs), "used": used})
            elif self.path == "/api/rebuild_preview":
                subprocess.run(
                    ["node", os.path.join(ROOT, "tools", "build_offline_app.mjs"), os.path.join(ROOT, "app", "dist", "fase5_offline_preview.html")],
                    check=True,
                )
                self._send_json({"ok": True, "message": "app/dist/fase5_offline_preview.html berhasil diperbarui!"})
            else:
                self.send_error(404)
        except Exception as exc:
            self._send_json({"ok": False, "error": str(exc)}, code=500)


def main():
    parser = argparse.ArgumentParser(description="Battle-Smith RPG LPC Appearance Studio v4")
    parser.add_argument("--lpc-dir", help="Path folder Universal-LPC-Spritesheet-Character-Generator")
    parser.add_argument("--port", type=int, default=8787)
    parser.add_argument("--no-browser", action="store_true")
    args = parser.parse_args()

    lpc_dir = auto_detect_lpc_dir(args.lpc_dir)
    cnt = scan_lpc_catalog(lpc_dir)
    print(f"Battle-Smith LPC Appearance Studio v4 aktif di http://127.0.0.1:{args.port}")
    print(f"Folder LPC: {lpc_dir or '(belum terdeteksi)'} ({cnt} PNG)")
    if not args.no_browser:
        webbrowser.open(f"http://127.0.0.1:{args.port}")
    ThreadingHTTPServer(("127.0.0.1", args.port), StudioHandler).serve_forever()


if __name__ == "__main__":
    main()
