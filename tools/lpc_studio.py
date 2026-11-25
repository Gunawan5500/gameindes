#!/usr/bin/env python3
"""
Battle-Smith RPG — Character Appearance, Motion Filter & Weapon Motion Studio (v3)
Perbaikan & Fitur Utama:
  1. Kepala & Muka terpisah rapi: slot `head` khusus `head/heads/*` + slot `eyes` khusus `eyes/*`
     (tidak tercampur telinga/hidung, kepala pasti muncul!).
  2. Filter Gerakan Tubuh (SEMUA gerakan LPC) terpisah dari Filter Gerakan Senjata.
  3. Editor Gerakan Senjata 5-Frame (Bisa Disetting): pilih animasi file senjata sendiri
     + atur Offset X, Y, & Rotasi (°) per Frame 1–5 (plus Preset: Palu, Pedang, Tombak, Staf, Siaga).
  4. 1-Klik Ekspor .webp (320x64 + 96x96) ke slot Game + Rebuild Preview.
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

EXPORT_SLOTS = [
    {"id": "hero_smith",         "label": "🛡️ Hero Battle-Smith (Utama)", "sprite": "app/assets/sprites/hero_smith_5f.webp",         "portrait": "app/assets/ui/avatar_hero.webp"},
    {"id": "apprentice_kael",    "label": "👤 Murid: Kael",               "sprite": "app/assets/sprites/apprentice_kael_5f.webp",    "portrait": "app/assets/ui/portraits/portrait_kael.webp"},
    {"id": "apprentice_lyra",    "label": "👤 Murid: Lyra",               "sprite": "app/assets/sprites/apprentice_lyra_5f.webp",    "portrait": "app/assets/ui/portraits/portrait_lyra.webp"},
    {"id": "apprentice_garrick", "label": "👤 Murid: Garrick",            "sprite": "app/assets/sprites/apprentice_garrick_5f.webp", "portrait": "app/assets/ui/portraits/portrait_garrick.webp"},
    {"id": "apprentice_vesper",  "label": "👤 Murid: Vesper",             "sprite": "app/assets/sprites/apprentice_vesper_5f.webp",  "portrait": "app/assets/ui/portraits/portrait_vesper.webp"},
    {"id": "apprentice_thorne",  "label": "👤 Murid: Thorne",             "sprite": "app/assets/sprites/apprentice_thorne_5f.webp",  "portrait": "app/assets/ui/portraits/portrait_thorne.webp"},
    {"id": "enemy_humanoid",     "label": "🗡️ Musuh: Humanoid / Bandit",  "sprite": "app/assets/sprites/enemy_humanoid_5f.webp",     "portrait": None},
    {"id": "enemy_undead",       "label": "💀 Musuh: Undead / Skeleton",  "sprite": "app/assets/sprites/enemy_undead_5f.webp",       "portrait": None},
    {"id": "enemy_orc",          "label": "👹 Musuh: Orc / Goblin",       "sprite": "app/assets/sprites/enemy_orc_5f.webp",          "portrait": None},
    {"id": "boss_humanoid",      "label": "👑 Boss: Humanoid Warlord",    "sprite": "app/assets/sprites/boss_humanoid_5f.webp",      "portrait": None},
]

WEAPON_MOTION_PRESETS = {
    "lpc_default": {
        "label": "🎯 Bawaan LPC (Tanpa Ubah)",
        "lock_frame": False,
        "frames": [{"dx": 0, "dy": 0, "rot": 0} for _ in range(5)],
    },
    "hammer_smash": {
        "label": "🔨 Ayun Palu / Kapak (Smash)",
        "lock_frame": True,
        "frames": [
            {"dx": -4, "dy": -4, "rot": 45},
            {"dx": -2, "dy": -6, "rot": 25},
            {"dx":  2, "dy": -2, "rot": -15},
            {"dx":  6, "dy":  3, "rot": -55},
            {"dx":  2, "dy":  1, "rot": -15},
        ],
    },
    "sword_arc": {
        "label": "⚔️ Tebas Pedang (Slash Arc)",
        "lock_frame": True,
        "frames": [
            {"dx": -3, "dy": -5, "rot": 55},
            {"dx":  0, "dy": -3, "rot": 15},
            {"dx":  5, "dy":  0, "rot": -30},
            {"dx":  7, "dy":  3, "rot": -65},
            {"dx":  1, "dy":  0, "rot": -10},
        ],
    },
    "spear_thrust": {
        "label": "🔱 Tusuk Tombak (Thrust)",
        "lock_frame": True,
        "frames": [
            {"dx": -5, "dy":  0, "rot": 0},
            {"dx": -3, "dy":  0, "rot": 0},
            {"dx":  5, "dy":  0, "rot": 0},
            {"dx":  9, "dy":  0, "rot": 0},
            {"dx":  2, "dy":  0, "rot": 0},
        ],
    },
    "staff_cast": {
        "label": "✨ Angkat Staf Sihir (Cast)",
        "lock_frame": True,
        "frames": [
            {"dx": 0, "dy":  0, "rot": 0},
            {"dx": 1, "dy": -3, "rot": -8},
            {"dx": 2, "dy": -7, "rot": -14},
            {"dx": 1, "dy": -5, "rot": -8},
            {"dx": 0, "dy": -1, "rot": 0},
        ],
    },
    "idle_bob": {
        "label": "🛡️ Siaga Diam (Idle Hold)",
        "lock_frame": True,
        "frames": [
            {"dx": 0, "dy":  0, "rot": 0},
            {"dx": 0, "dy": -1, "rot": 3},
            {"dx": 0, "dy": -2, "rot": 5},
            {"dx": 0, "dy": -1, "rot": 2},
            {"dx": 0, "dy":  0, "rot": 0},
        ],
    },
}

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
    if any(skip in low for skip in ("/behind/", "_behind", "/shadow", "shadow.png", "/mask", "/bg/")):
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

            # Pisahkan head/heads/* (kepala asli) dari head/ears/* & head/nose/*!
            if top == "head":
                if style.startswith("heads/"):
                    clean_style = style[len("heads/"):]
                    STATE["slots"]["head"][clean_style][color][anim] = full
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


def build_ui_catalog():
    slots_out = {}
    for slot_name, styles in STATE["slots"].items():
        slots_out[slot_name] = [{"style": st, "colors": sorted(styles[st].keys())} for st in sorted(styles.keys())]

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
        "slots": slots_out,
        "weapons": weapons_out,
        "export_slots": EXPORT_SLOTS,
        "weapon_presets": WEAPON_MOTION_PRESETS,
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


def apply_weapon_motion_strip(w_strip, w_motion, direction):
    """Terapkan offset (dx, dy) & rotasi per-frame (0..4) khusus layer senjata."""
    frames_cfg = w_motion.get("frames") or []
    lock_frame = bool(w_motion.get("lock_frame"))
    if not frames_cfg or (not lock_frame and all(f.get("dx", 0) == 0 and f.get("dy", 0) == 0 and f.get("rot", 0) == 0 for f in frames_cfg)):
        return w_strip

    out = Image.new("RGBA", (320, 64), (0, 0, 0, 0))
    dir_sign = -1 if direction == "left" else 1
    base_frame0 = w_strip.crop((0, 0, 64, 64))

    for i in range(5):
        src = base_frame0 if lock_frame else w_strip.crop((i * 64, 0, (i + 1) * 64, 64))
        cfg = frames_cfg[i] if i < len(frames_cfg) else {"dx": 0, "dy": 0, "rot": 0}
        dx = int(cfg.get("dx", 0)) * dir_sign
        dy = int(cfg.get("dy", 0))
        rot = float(cfg.get("rot", 0)) * dir_sign

        if rot != 0:
            src = src.rotate(rot, resample=Image.NEAREST, expand=False, center=(32, 36))

        cell = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
        cell.paste(src, (dx, dy), src)
        out.paste(cell, (i * 64, 0), cell)
    return out


def render_layers_from_selection(sel):
    body_anim = sel.get("animation") or "slash"
    wpn_anim = sel.get("weapon_animation") or body_anim
    if wpn_anim == "__follow__":
        wpn_anim = body_anim
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

    # Urutan tumpukan visual: body -> feet -> legs -> torso -> head -> eyes -> hair -> hat -> weapon
    for slot in ("body", "feet", "legs", "torso", "head", "eyes", "hair", "hat"):
        pick = sel.get(slot)
        if not pick or not pick.get("style"):
            continue
        amap = STATE["slots"].get(slot, {}).get(pick["style"], {}).get(pick.get("color") or "default")
        if not amap:
            continue

        f_anim = pick_file_for_anim(amap, body_anim)
        if f_anim:
            with Image.open(f_anim).convert("RGBA") as sh:
                part_strip = lp.extract_5frame_strip_smart(sh, body_anim, direction, recipes_grid)
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

    # Layer Senjata (Terpisah animasi & bisa disetting per-frame!)
    wpn = sel.get("weapon")
    if wpn and wpn.get("category") and wpn.get("id"):
        amap = STATE["weapons"].get(wpn["category"], {}).get(wpn["id"], {}).get(wpn.get("color") or "default")
        if amap:
            f_wpn = pick_file_for_anim(amap, wpn_anim)
            if f_wpn:
                with Image.open(f_wpn).convert("RGBA") as wsh:
                    w_strip = lp.extract_5frame_strip_smart(wsh, wpn_anim, direction, recipes_grid)
                    w_strip = apply_weapon_motion_strip(w_strip, sel.get("weapon_motion") or {}, direction)
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
<title>Battle-Smith RPG — Character, Motion &amp; Weapon Studio v3</title>
<style>
  :root {
    --bg: #0b1118; --card: #121c27; --card2: #0d151f; --border: #25384d;
    --text: #e2e8f0; --muted: #94a3b8; --amber: #f59e0b; --teal: #14b8a6; --sky: #38bdf8;
  }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: system-ui, -apple-system, sans-serif; background: var(--bg); color: var(--text); font-size: 13px; }
  header { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 16px; background: #0f1924; border-bottom: 1px solid var(--border); flex-wrap: wrap; }
  h1 { margin: 0; font-size: 15px; color: var(--amber); }
  .layout { display: grid; grid-template-columns: 380px 1fr; gap: 14px; padding: 14px; max-width: 1400px; margin: 0 auto; }
  @media (max-width: 960px) { .layout { grid-template-columns: 1fr; } }
  .card { background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 12px; display: flex; flex-direction: column; gap: 10px; }
  .sec-title { font-weight: 700; font-size: 13px; color: var(--sky); display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; }
  .muted { color: var(--muted); font-size: 11.5px; }
  input, select, button { font: inherit; border-radius: 7px; border: 1px solid var(--border); background: var(--card2); color: var(--text); padding: 6px 8px; }
  select { width: 100%; }
  button { cursor: pointer; font-weight: 600; }
  button.primary { background: #b45309; border-color: var(--amber); color: #fff; }
  button.teal { background: #0f766e; border-color: var(--teal); color: #fff; }
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
  .pill.active { background: #0369a1; border-color: var(--sky); color: #fff; }
  .kf-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; }
  @media (max-width: 700px) { .kf-grid { grid-template-columns: repeat(2, 1fr); } }
  .kf-card { background: var(--card2); border: 1px solid var(--border); border-radius: 7px; padding: 6px; display: flex; flex-direction: column; gap: 4px; font-size: 11px; }
  .kf-card input { width: 100%; padding: 3px 5px; font-size: 11.5px; font-family: monospace; }
  .log-list { font-family: monospace; font-size: 11px; color: var(--muted); display: flex; flex-direction: column; gap: 2px; }
  #status { font-weight: 700; color: var(--teal); font-size: 12px; }
</style>
</head>
<body>
<header>
  <div>
    <h1>🎨 Battle-Smith RPG — Character, Motion &amp; Weapon Motion Studio v3</h1>
    <div id="meta" class="muted">Memindai folder Universal LPC...</div>
  </div>
  <div class="row">
    <input id="inp-dir" style="width:310px" placeholder="Path folder Universal-LPC-Spritesheet-Character-Generator" />
    <button id="btn-scan">🔄 Pindai Ulang</button>
  </div>
</header>

<div class="layout">
  <!-- PANEL KIRI: PENAMPILAN KARAKTER (HEAD & EYES TERPISAH RAPI) -->
  <div class="card">
    <div class="sec-title">
      <span>👤 1. Penampilan Karakter</span>
      <button id="btn-random">🎲 Acak</button>
    </div>
    <div id="appearance-slots" style="display:flex;flex-direction:column;gap:7px"></div>
  </div>

  <!-- PANEL KANAN -->
  <div style="display:flex;flex-direction:column;gap:12px">
    <!-- PREVIEW -->
    <div class="card">
      <div class="sec-title">
        <span>🎬 Preview Live 5-Frame</span>
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

    <!-- FILTER GERAKAN TUBUH (TERPISAH) -->
    <div class="card">
      <div class="sec-title">
        <span>🏃 2. Filter Gerakan Tubuh Karakter (Semua Gerakan)</span>
      </div>
      <div id="motion-pills" class="pill-wrap"></div>
    </div>

    <!-- FILTER SENJATA + SETTING GERAKAN SENJATA TERPISAH -->
    <div class="card">
      <div class="sec-title">
        <span>⚔️ 3. Senjata &amp; Pengaturan Gerakan Senjata (Terpisah dari Tubuh)</span>
        <button id="btn-clear-wpn">Tanpa Senjata</button>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">
        <label class="muted">Kategori Senjata<select id="sel-wcat"></select></label>
        <label class="muted">Jenis Senjata<select id="sel-wid"></select></label>
        <label class="muted">Warna / Varian<select id="sel-wcol"></select></label>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:4px">
        <label class="muted">Sumber Animasi File Senjata (Terpisah)
          <select id="sel-wanim"></select>
        </label>
        <label class="muted">Preset Gerakan Senjata (Posisi &amp; Rotasi 5-Frame)
          <select id="sel-wpreset"></select>
        </label>
      </div>

      <div class="row" style="justify-content:space-between">
        <label class="muted" style="display:flex;align-items:center;gap:6px;cursor:pointer">
          <input type="checkbox" id="chk-wlock" />
          Kunci 1 pose senjata (Frame 0) lalu gerakkan bebas lewat keyframe X/Y/Rotasi di bawah
        </label>
      </div>
      <div id="kf-grid" class="kf-grid"></div>
    </div>

    <!-- EKSPOR -->
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
const SEL = {
  animation: "slash",
  weapon_animation: "__follow__",
  direction: "right",
  body: null, head: null, eyes: null, hair: null, hat: null, torso: null, legs: null, feet: null,
  weapon: null,
  weapon_motion: {
    lock_frame: false,
    frames: [0,1,2,3,4].map(() => ({ dx: 0, dy: 0, rot: 0 }))
  }
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

function renderAppearanceSlots() {
  const wrap = document.getElementById("appearance-slots");
  wrap.innerHTML = SLOT_LABELS.map(([key, label]) => {
    const list = CAT.slots[key] || [];
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
        const item = (CAT.slots[k] || []).find(x => x.style === st);
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

function renderMotionPills() {
  const el = document.getElementById("motion-pills");
  el.innerHTML = (CAT.animations || []).map(a =>
    `<button class="pill ${SEL.animation === a ? "active" : ""}" data-m="${a}">${a}</button>`
  ).join("");
  el.querySelectorAll("[data-m]").forEach(b => {
    b.onclick = () => { SEL.animation = b.dataset.m; renderMotionPills(); refreshPreview(); };
  });
}

function renderWeaponFilter() {
  const cats = Object.keys(CAT.weapons || {});
  const elCat = document.getElementById("sel-wcat");
  const elId = document.getElementById("sel-wid");
  const elCol = document.getElementById("sel-wcol");
  const elWAnim = document.getElementById("sel-wanim");

  const curCat = SEL.weapon?.category || "";
  elCat.innerHTML = `<option value="">-- Tanpa Senjata --</option>` + cats.map(c => `<option value="${c}" ${c === curCat ? "selected" : ""}>${c}</option>`).join("");

  const wList = curCat ? (CAT.weapons[curCat] || []) : [];
  const curId = SEL.weapon?.id || "";
  elId.innerHTML = wList.length ? wList.map(w => `<option value="${w.id}" ${w.id === curId ? "selected" : ""}>${w.id}</option>`).join("") : `<option value="">-</option>`;

  const wObj = wList.find(w => w.id === curId);
  const curCol = SEL.weapon?.color || "";
  elCol.innerHTML = wObj ? wObj.colors.map(c => `<option value="${c}" ${c === curCol ? "selected" : ""}>${c}</option>`).join("") : `<option value="">-</option>`;

  const wAnims = wObj ? (wObj.anims.includes("all") ? CAT.animations : wObj.anims) : CAT.animations;
  elWAnim.innerHTML = `<option value="__follow__" ${SEL.weapon_animation === "__follow__" ? "selected" : ""}>🔗 Ikuti Gerakan Tubuh</option>` +
    wAnims.map(a => `<option value="${a}" ${SEL.weapon_animation === a ? "selected" : ""}>${a}</option>`).join("");

  elCat.onchange = () => {
    if (!elCat.value) SEL.weapon = null;
    else {
      const first = (CAT.weapons[elCat.value] || [])[0];
      SEL.weapon = first ? { category: elCat.value, id: first.id, color: first.colors[0] || "default" } : null;
    }
    renderWeaponFilter();
    refreshPreview();
  };
  elId.onchange = () => {
    const w = (CAT.weapons[elCat.value] || []).find(x => x.id === elId.value);
    if (w) SEL.weapon = { category: elCat.value, id: w.id, color: w.colors[0] || "default" };
    renderWeaponFilter();
    refreshPreview();
  };
  elCol.onchange = () => { if (SEL.weapon) { SEL.weapon.color = elCol.value; refreshPreview(); } };
  elWAnim.onchange = () => { SEL.weapon_animation = elWAnim.value; refreshPreview(); };
}

function renderWeaponKeyframes() {
  document.getElementById("chk-wlock").checked = Boolean(SEL.weapon_motion.lock_frame);
  const grid = document.getElementById("kf-grid");
  grid.innerHTML = SEL.weapon_motion.frames.map((f, i) => `
    <div class="kf-card">
      <b>Frame ${i + 1}</b>
      <label>X <input type="number" min="-24" max="24" value="${f.dx}" data-kf="${i}" data-prop="dx" /></label>
      <label>Y <input type="number" min="-24" max="24" value="${f.dy}" data-kf="${i}" data-prop="dy" /></label>
      <label>Rot° <input type="number" min="-180" max="180" step="5" value="${f.rot}" data-kf="${i}" data-prop="rot" /></label>
    </div>
  `).join("");
  grid.querySelectorAll("[data-kf]").forEach(inp => {
    inp.onchange = () => {
      const i = Number(inp.dataset.kf);
      SEL.weapon_motion.frames[i][inp.dataset.prop] = Number(inp.value) || 0;
      refreshPreview();
    };
  });
}

function pickDefaultAppearance() {
  const findFirst = (slot, prefStyle, prefColor) => {
    const list = CAT.slots[slot] || [];
    if (!list.length) return null;
    const item = list.find(x => x.style.includes(prefStyle)) || list[0];
    const col = item.colors.find(c => c.includes(prefColor)) || item.colors[0];
    return { style: item.style, color: col };
  };
  SEL.body = findFirst("body", "male", "light");
  SEL.head = findFirst("head", "human/male", "light");
  SEL.eyes = findFirst("eyes", "human", "brown") || findFirst("eyes", "", "");
  SEL.hair = findFirst("hair", "short", "brown");
  SEL.torso = findFirst("torso", "plate/male", "steel") || findFirst("torso", "male", "brown");
  SEL.legs = findFirst("legs", "pants/male", "charcoal") || findFirst("legs", "male", "black");
  SEL.feet = findFirst("feet", "boots", "brown");
  SEL.hat = null;
}

async function refreshPreview() {
  document.getElementById("status").textContent = "Merender...";
  const r = await api("/api/preview", SEL);
  if (!r.ok) { document.getElementById("status").textContent = "⚠ " + r.error; return; }
  document.getElementById("live-sprite").style.backgroundImage = `url('${r.strip_b64}')`;
  document.getElementById("live-strip").src = r.strip_b64;
  document.getElementById("live-portrait").src = r.portrait_b64;
  document.getElementById("status").textContent = `✓ Tubuh:${SEL.animation} | Senjata:${SEL.weapon_animation === "__follow__" ? SEL.animation : SEL.weapon_animation} • ${(r.strip_bytes/1024).toFixed(2)} KB`;
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

document.getElementById("btn-play").onclick = () => { PAUSED = !PAUSED; updateFramePlayback(); };
document.getElementById("btn-prev-f").onclick = () => { PAUSED = true; MANUAL_FRAME = (MANUAL_FRAME + 4) % 5; updateFramePlayback(); };
document.getElementById("btn-next-f").onclick = () => { PAUSED = true; MANUAL_FRAME = (MANUAL_FRAME + 1) % 5; updateFramePlayback(); };
document.getElementById("sel-dir").onchange = e => { SEL.direction = e.target.value; refreshPreview(); };
document.getElementById("rng-speed").oninput = e => {
  const sec = (Number(e.target.value) / 100).toFixed(2);
  document.getElementById("lbl-speed").textContent = sec + "s";
  document.getElementById("live-sprite").style.animationDuration = sec + "s";
};
document.getElementById("btn-clear-wpn").onclick = () => { SEL.weapon = null; renderWeaponFilter(); refreshPreview(); };
document.getElementById("chk-wlock").onchange = e => { SEL.weapon_motion.lock_frame = e.target.checked; refreshPreview(); };

document.getElementById("sel-wpreset").onchange = e => {
  const p = CAT.weapon_presets[e.target.value];
  if (!p) return;
  SEL.weapon_motion = { lock_frame: p.lock_frame, frames: p.frames.map(f => ({ ...f })) };
  renderWeaponKeyframes();
  refreshPreview();
};

document.getElementById("btn-random").onclick = () => {
  const rnd = arr => arr[Math.floor(Math.random() * arr.length)];
  for (const k of ["body", "head", "eyes", "hair", "torso", "legs", "feet"]) {
    const list = CAT.slots[k] || [];
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
  document.getElementById("meta").textContent = `${CAT.file_count} PNG • ${CAT.slots.head.length} Kepala • ${CAT.animations.length} Gerakan • ${Object.keys(CAT.weapons).length} Kategori Senjata`;
  document.getElementById("sel-export-slot").innerHTML = CAT.export_slots.map(s => `<option value="${s.id}">${s.label}</option>`).join("");
  document.getElementById("sel-wpreset").innerHTML = Object.entries(CAT.weapon_presets).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join("");
  pickDefaultAppearance();
  renderAppearanceSlots();
  renderMotionPills();
  renderWeaponFilter();
  renderWeaponKeyframes();
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
    parser = argparse.ArgumentParser(description="Battle-Smith RPG Character, Motion & Weapon Motion Studio v3")
    parser.add_argument("--lpc-dir", help="Path folder Universal-LPC-Spritesheet-Character-Generator")
    parser.add_argument("--port", type=int, default=8787)
    parser.add_argument("--no-browser", action="store_true")
    args = parser.parse_args()

    lpc_dir = auto_detect_lpc_dir(args.lpc_dir)
    cnt = scan_lpc_catalog(lpc_dir)
    print(f"Battle-Smith Studio v3 aktif di http://127.0.0.1:{args.port}")
    print(f"Folder LPC: {lpc_dir or '(belum terdeteksi)'} ({cnt} PNG, {len(STATE['slots']['head'])} Kepala, {len(STATE['animations'])} Gerakan)")
    if not args.no_browser:
        webbrowser.open(f"http://127.0.0.1:{args.port}")
    ThreadingHTTPServer(("127.0.0.1", args.port), StudioHandler).serve_forever()


if __name__ == "__main__":
    main()
