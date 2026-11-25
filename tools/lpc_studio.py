#!/usr/bin/env python3
"""
Battle-Smith RPG — Visual Animation & Attack Motion Studio (Local Laptop Engine + UI)
Membuka Studio visual di browser laptop (http://127.0.0.1:8787) untuk:
  1. Memilih karakter/murid/monster dari tools/lpc_recipes.json
  2. Memilih gerakan serangan secara visual (Slash, Thrust, Shoot, Spellcast, Walk, Idle, Hurt)
     dengan live preview animasi 5-frame, kontrol arah, FPS, & pilihan 5 frame
  3. Menelusuri & mengganti layer PNG langsung dari folder Universal-LPC (88.000+ file)
  4. 1-Klik Simpan ke tools/lpc_recipes.json + Ekspor .webp ke app/assets/ + Rebuild Preview Game
"""
import argparse
import base64
import io
import json
import os
import subprocess
import sys
import webbrowser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
import lpc_pipeline as lp  # noqa: E402

RECIPES_PATH = os.path.join(ROOT, "tools", "lpc_recipes.json")

ANIMATION_PRESETS = [
    {"id": "slash",       "label": "⚔️ Slash (Tebasan Pedang/Kapak/Palu)"},
    {"id": "halfslash",   "label": "🗡️ Half-Slash (Tebasan Cepat)"},
    {"id": "thrust",      "label": "🔱 Thrust (Tusukan Tombak)"},
    {"id": "shoot",       "label": "🏹 Shoot (Panah / Busur)"},
    {"id": "spellcast",   "label": "✨ Spellcast (Sihir / Rune)"},
    {"id": "combat_idle", "label": "🛡️ Combat Idle (Siaga Tempur)"},
    {"id": "walk",        "label": "🏃 Walk (Berjalan / Maju)"},
    {"id": "idle",        "label": "🧍 Idle (Berdiri Santai)"},
    {"id": "hurt",        "label": "💥 Hurt (Terkena Serangan)"},
]

STATE = {
    "lpc_dir": "",
    "sp_root": "",
    "index": {},
}


def auto_detect_lpc_dir(cli_dir=None):
    if cli_dir and os.path.isdir(cli_dir):
        return cli_dir
    home = os.path.expanduser("~")
    candidates = [
        os.path.join(home, "Desktop", "Universal-LPC-Spritesheet-Character-Generator"),
        os.path.join(home, "Downloads", "Universal-LPC-Spritesheet-Character-Generator"),
        os.path.join(home, "Universal-LPC-Spritesheet-Character-Generator"),
        os.path.join(ROOT, "..", "Universal-LPC-Spritesheet-Character-Generator"),
    ]
    for c in candidates:
        if os.path.isdir(c):
            return os.path.abspath(c)
    return ""


def load_lpc_index(lpc_dir):
    if not lpc_dir or not os.path.isdir(lpc_dir):
        STATE["lpc_dir"] = lpc_dir or ""
        STATE["sp_root"] = ""
        STATE["index"] = {}
        return 0
    sp_root, idx = lp.index_lpc_spritesheets(lpc_dir)
    STATE["lpc_dir"] = lpc_dir
    STATE["sp_root"] = sp_root
    STATE["index"] = idx
    return len(idx)


def load_recipes():
    with open(RECIPES_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def save_recipes(data):
    with open(RECIPES_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


def img_to_webp_b64(img, quality=86):
    buf = io.BytesIO()
    img.save(buf, "WEBP", quality=quality, method=6)
    return "data:image/webp;base64," + base64.b64encode(buf.getvalue()).decode("ascii"), len(buf.getvalue())


def extract_custom_frames(sheet_img, anim_name, direction, frame_indices, recipes):
    """Potong 5 frame spesifik (berdasarkan frame_indices, misal [0,1,2,3,4]) ke strip 320x64."""
    fw = recipes["grid"]["frame_width"]
    fh = recipes["grid"]["frame_height"]
    anims = recipes["grid"]["animations"]
    strip = Image.new("RGBA", (fw * 5, fh), (0, 0, 0, 0))
    w, h = sheet_img.size

    if h == 768 and w >= 192:
        row_idx = lp.DIR_ROW_4.get(direction, 3)
        cell = 192
        y0 = row_idx * cell
        n_cols = max(1, w // cell)
        for out_i, src_col in enumerate(frame_indices[:5]):
            col = max(0, min(int(src_col), n_cols - 1))
            x0 = col * cell
            crop = sheet_img.crop((x0 + 64, y0 + 64, x0 + 128, y0 + 128))
            strip.paste(crop, (out_i * fw, 0), crop)
        return strip

    if h <= 512:
        row_idx = lp.DIR_ROW_4.get(direction, 3) if h >= 256 else 0
    else:
        row_idx = anims.get(anim_name, anims["slash"]).get(direction, 15)

    y0 = min(row_idx * fh, max(0, h - fh))
    n_cols = max(1, w // fw)
    for out_i, src_col in enumerate(frame_indices[:5]):
        col = max(0, min(int(src_col), n_cols - 1))
        x0 = col * fw
        crop = sheet_img.crop((x0, y0, x0 + fw, y0 + fh))
        strip.paste(crop, (out_i * fw, 0), crop)
    return strip


def render_character_preview(entry, recipes, anim_override=None, dir_override=None, frame_indices=None):
    index = STATE["index"]
    fw = recipes["grid"]["frame_width"]
    fh = recipes["grid"]["frame_height"]
    anim_name = anim_override or entry.get("animation", "slash")
    direction = dir_override or entry.get("direction", "right")
    f_idx = frame_indices or entry.get("frame_indices") or [0, 1, 2, 3, 4]

    strip_out = Image.new("RGBA", (fw * 5, fh), (0, 0, 0, 0))
    portrait_canvas = Image.new("RGBA", (fw, fh), (0, 0, 0, 0))
    layer_logs = []

    for idx_i, layer_spec in enumerate(entry.get("layers", [])):
        if layer_spec.get("disabled"):
            layer_logs.append({"idx": idx_i, "part": layer_spec.get("part", ""), "matched": None, "status": "disabled"})
            continue

        # Jika user memilih file PNG eksak lewat pencarian Studio
        exact_file = layer_spec.get("exact_file")
        if exact_file and exact_file.lower() in index:
            rel_anim, full_anim = exact_file.lower(), index[exact_file.lower()]
        else:
            rel_anim, full_anim = lp.resolve_layer_for_anim(index, layer_spec, anim_name)

        if full_anim:
            with Image.open(full_anim).convert("RGBA") as sheet:
                l_strip = extract_custom_frames(sheet, anim_name, direction, f_idx, recipes)
                if l_strip.getbbox() is not None:
                    strip_out.alpha_composite(l_strip)
                    layer_logs.append({"idx": idx_i, "part": layer_spec.get("part", ""), "matched": rel_anim, "status": "ok"})
                else:
                    layer_logs.append({"idx": idx_i, "part": layer_spec.get("part", ""), "matched": rel_anim, "status": "empty"})
        else:
            layer_logs.append({"idx": idx_i, "part": layer_spec.get("part", ""), "matched": None, "status": "missing"})

        # Portrait (walk down frame 0)
        rel_w, full_w = lp.resolve_layer_for_anim(index, layer_spec, "walk")
        use_p = full_w or full_anim
        if use_p:
            with Image.open(use_p).convert("RGBA") as psheet:
                f0 = lp.extract_front_frame_64(psheet, fw, fh)
                if f0.size != (fw, fh):
                    tmp = Image.new("RGBA", (fw, fh), (0, 0, 0, 0))
                    tmp.paste(f0, (0, 0), f0)
                    f0 = tmp
                if f0.getbbox() is not None:
                    portrait_canvas.alpha_composite(f0)

    bust = portrait_canvas.crop((14, 8, 50, 44))
    portrait_out = Image.new("RGBA", (96, 96), (18, 28, 42, 255))
    scaled = bust.resize((88, 88), Image.NEAREST)
    portrait_out.paste(scaled, (4, 6), scaled)

    return strip_out, portrait_out, layer_logs


STUDIO_HTML = r"""<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Battle-Smith RPG — Animation &amp; Attack Motion Studio</title>
<style>
  :root {
    --bg: #0b1118; --card: #121c27; --card2: #0e1620; --border: #24364a;
    --text: #e2e8f0; --muted: #94a3b8; --amber: #f59e0b; --teal: #14b8a6; --rose: #f43f5e; --sky: #38bdf8;
  }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: system-ui, -apple-system, sans-serif; background: var(--bg); color: var(--text); font-size: 13px; }
  header { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 16px; background: #0f1924; border-bottom: 1px solid var(--border); flex-wrap: wrap; }
  h1 { margin: 0; font-size: 15px; color: var(--amber); }
  .wrap { display: grid; grid-template-columns: 310px 1fr; gap: 14px; padding: 14px; max-width: 1360px; margin: 0 auto; }
  @media (max-width: 900px) { .wrap { grid-template-columns: 1fr; } }
  .card { background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 12px; display: flex; flex-direction: column; gap: 10px; }
  .title { font-weight: 700; font-size: 13px; color: var(--sky); }
  .muted { color: var(--muted); font-size: 11.5px; }
  input, select, button { font: inherit; border-radius: 7px; border: 1px solid var(--border); background: var(--card2); color: var(--text); padding: 6px 9px; }
  button { cursor: pointer; font-weight: 600; }
  button.primary { background: #b45309; border-color: var(--amber); color: #fff; }
  button.teal { background: #0f766e; border-color: var(--teal); color: #fff; }
  button.danger { background: #9f1239; border-color: var(--rose); color: #fff; }
  button.active { background: #0369a1; border-color: var(--sky); color: #fff; }
  .row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .char-list { display: flex; flex-direction: column; gap: 6px; max-height: 520px; overflow-y: auto; }
  .char-item { text-align: left; display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; background: var(--card2); border: 1px solid var(--border); border-radius: 8px; }
  .char-item.active { border-color: var(--amber); background: #1d2633; }
  .stage-box { background: radial-gradient(circle at 50% 45%, #1c2e42, #0b131d); border: 1px solid #334e68; border-radius: 10px; padding: 16px; display: flex; align-items: center; justify-content: space-around; gap: 16px; flex-wrap: wrap; min-height: 170px; }
  @keyframes play5f { from { background-position-x: 0px; } to { background-position-x: -640px; } }
  .preview-sprite { width: 128px; height: 128px; background-size: 640px 128px; background-repeat: no-repeat; image-rendering: pixelated; animation: play5f 0.8s steps(5) infinite; border: 1px dashed #3b5570; border-radius: 8px; }
  .preview-portrait { width: 96px; height: 96px; border-radius: 10px; border: 2px solid var(--amber); image-rendering: pixelated; background: #0d1620; }
  .filmstrip { width: 320px; height: 64px; image-rendering: pixelated; border: 1px solid var(--border); border-radius: 6px; background: #0b1118; }
  .anim-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(175px, 1fr)); gap: 6px; }
  .layer-row { display: grid; grid-template-columns: 1fr 120px auto; gap: 6px; align-items: center; padding: 6px 8px; background: var(--card2); border: 1px solid var(--border); border-radius: 7px; font-size: 12px; }
  .badge { font-size: 10.5px; padding: 2px 6px; border-radius: 999px; font-weight: 700; }
  .badge.ok { background: #134e4a; color: #5eead4; }
  .badge.miss { background: #4c0519; color: #fda4af; }
  .search-results { max-height: 170px; overflow-y: auto; display: flex; flex-direction: column; gap: 4px; }
  .search-item { font-family: monospace; font-size: 11px; text-align: left; padding: 5px 8px; }
  #status { font-size: 12px; color: var(--teal); font-weight: 600; }
</style>
</head>
<body>
<header>
  <div>
    <h1>🎬 Battle-Smith RPG — Animation &amp; Attack Motion Studio</h1>
    <div id="lpc-meta" class="muted">Memuat indeks Universal LPC...</div>
  </div>
  <div class="row">
    <input id="inp-lpc-dir" style="width:320px" placeholder="Path folder Universal-LPC-Spritesheet-Character-Generator" />
    <button id="btn-reload-lpc">🔄 Muat Folder</button>
    <button id="btn-export-all" class="teal">⚡ Ekspor Semua + Rebuild Game</button>
  </div>
</header>

<div class="wrap">
  <!-- KOLOM KIRI: DAFTAR KARAKTER & MONSTER -->
  <div class="card">
    <div class="title">👥 Karakter, 5 Murid &amp; Monster LPC</div>
    <div id="char-list" class="char-list"></div>
    <div id="status">Siap.</div>
  </div>

  <!-- KOLOM KANAN: LIVE PREVIEW, PILIH GERAKAN SERANGAN & LAYER -->
  <div style="display:flex;flex-direction:column;gap:12px">
    <div class="card">
      <div class="row" style="justify-content:space-between">
        <div>
          <div id="active-title" class="title">Pilih Karakter</div>
          <div id="active-sub" class="muted">-</div>
        </div>
        <div class="row">
          <button id="btn-save-char" class="primary">💾 Simpan &amp; Ekspor .webp Karakter Ini</button>
        </div>
      </div>

      <div class="stage-box">
        <div style="text-align:center">
          <div id="live-sprite" class="preview-sprite"></div>
          <div class="muted" style="margin-top:4px">Live 5-Frame (2× Zoom)</div>
        </div>
        <div style="text-align:center">
          <img id="live-portrait" class="preview-portrait" alt="Portrait" />
          <div class="muted" style="margin-top:4px">Potret 96×96 (.webp)</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px">
          <div class="muted">Strip 5-Frame Asli (320×64):</div>
          <img id="live-strip" class="filmstrip" alt="Strip" />
          <div class="row">
            <label class="muted">Arah:
              <select id="sel-dir">
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
          <div class="row">
            <span class="muted">Urutan 5 Frame:</span>
            <input id="inp-frames" value="0,1,2,3,4" style="width:110px;font-family:monospace" title="Contoh: 0,1,2,3,4 atau 0,1,2,3,5" />
            <button id="btn-apply-frames">Terapkan</button>
          </div>
        </div>
      </div>

      <div class="title">🎯 Pilih Gerakan Serangan (Klik untuk Ganti &amp; Preview Langsung)</div>
      <div id="anim-grid" class="anim-grid"></div>
    </div>

    <div class="card">
      <div class="row" style="justify-content:space-between">
        <div class="title">🧩 Susunan Layer Karakter (Body, Head, Armor, Hair, Weapon)</div>
        <span class="muted">Klik cari layer di bawah untuk menambah/mengganti PNG langsung dari 88.000+ file LPC</span>
      </div>
      <div id="layer-list" style="display:flex;flex-direction:column;gap:6px"></div>

      <div class="row" style="margin-top:6px">
        <input id="inp-search" style="flex:1" placeholder="Cari layer PNG di folder LPC (contoh: head/heads/human, hair/short, weapon/sword, body/bodies)..." />
        <button id="btn-search">🔍 Cari Layer LPC</button>
      </div>
      <div id="search-results" class="search-results"></div>
    </div>
  </div>
</div>

<script>
let DATA = null;
let ACTIVE_ID = null;

async function api(url, body) {
  const res = await fetch(url, body ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {});
  return res.json();
}

function getActiveChar() {
  return DATA.recipes.stage1_characters.find(c => c.id === ACTIVE_ID);
}

function renderCharList() {
  const el = document.getElementById("char-list");
  el.innerHTML = DATA.recipes.stage1_characters.map(c => `
    <button class="char-item ${c.id === ACTIVE_ID ? "active" : ""}" data-cid="${c.id}">
      <div>
        <div><b>${c.name}</b></div>
        <div class="muted">${c.animation} • ${c.direction} • ${c.layers.length} layer</div>
      </div>
      <span class="badge ok">${c.category}</span>
    </button>
  `).join("");
  el.querySelectorAll("[data-cid]").forEach(b => {
    b.onclick = () => { ACTIVE_ID = b.dataset.cid; renderAll(); refreshPreview(); };
  });
}

function renderAnimGrid() {
  const ch = getActiveChar();
  const el = document.getElementById("anim-grid");
  el.innerHTML = DATA.animations.map(a => `
    <button class="${ch.animation === a.id ? "active" : ""}" data-anim="${a.id}">${a.label}</button>
  `).join("");
  el.querySelectorAll("[data-anim]").forEach(b => {
    b.onclick = () => { ch.animation = b.dataset.anim; renderAnimGrid(); renderCharList(); refreshPreview(); };
  });
}

function renderLayerList(logs = []) {
  const ch = getActiveChar();
  const el = document.getElementById("layer-list");
  el.innerHTML = ch.layers.map((l, idx) => {
    const log = logs.find(x => x.idx === idx);
    const ok = log && log.status === "ok";
    const badge = l.disabled ? `<span class="badge miss">OFF</span>` : ok ? `<span class="badge ok">OK</span>` : `<span class="badge miss">${log ? log.status : "?"}</span>`;
    return `
      <div class="layer-row">
        <div>
          <b>${l.part || l.exact_file}</b> ${badge}
          <div class="muted" style="font-family:monospace;font-size:10.5px">${log && log.matched ? log.matched : (l.exact_file || "Belum cocok — pakai pencarian di bawah")}</div>
        </div>
        <input value="${(l.colors || []).join(",")}" data-col-idx="${idx}" placeholder="warna (light,steel)" />
        <div class="row">
          <button data-toggle-idx="${idx}">${l.disabled ? "Aktifkan" : "Matikan"}</button>
          <button class="danger" data-del-idx="${idx}">✕</button>
        </div>
      </div>
    `;
  }).join("");

  el.querySelectorAll("[data-col-idx]").forEach(inp => {
    inp.onchange = () => {
      const i = Number(inp.dataset.colIdx);
      ch.layers[i].colors = inp.value.split(",").map(s => s.trim()).filter(Boolean);
      delete ch.layers[i].exact_file;
      refreshPreview();
    };
  });
  el.querySelectorAll("[data-toggle-idx]").forEach(b => {
    b.onclick = () => { const i = Number(b.dataset.toggleIdx); ch.layers[i].disabled = !ch.layers[i].disabled; refreshPreview(); };
  });
  el.querySelectorAll("[data-del-idx]").forEach(b => {
    b.onclick = () => { ch.layers.splice(Number(b.dataset.delIdx), 1); refreshPreview(); };
  });
}

async function refreshPreview() {
  const ch = getActiveChar();
  if (!ch) return;
  document.getElementById("active-title").textContent = `${ch.name} (${ch.id})`;
  document.getElementById("active-sub").textContent = `Output: ${ch.out_sprite} ${ch.out_portrait ? "• " + ch.out_portrait : ""}`;
  document.getElementById("sel-dir").value = ch.direction || "right";
  document.getElementById("inp-frames").value = (ch.frame_indices || [0,1,2,3,4]).join(",");

  document.getElementById("status").textContent = "Merender preview 5-frame...";
  const r = await api("/api/preview", { entry: ch });
  if (r.error) { document.getElementById("status").textContent = "⚠ " + r.error; return; }
  document.getElementById("live-sprite").style.backgroundImage = `url('${r.strip_b64}')`;
  document.getElementById("live-strip").src = r.strip_b64;
  document.getElementById("live-portrait").src = r.portrait_b64;
  renderLayerList(r.layer_logs);
  const okCount = r.layer_logs.filter(x => x.status === "ok").length;
  document.getElementById("status").textContent = `✓ Preview aktif (${okCount}/${ch.layers.length} layer cocok • Strip ${(r.strip_bytes/1024).toFixed(2)} KB)`;
}

function renderAll() {
  renderCharList();
  renderAnimGrid();
}

document.getElementById("sel-dir").onchange = e => { getActiveChar().direction = e.target.value; renderCharList(); refreshPreview(); };
document.getElementById("rng-speed").oninput = e => {
  const sec = (Number(e.target.value) / 100).toFixed(2);
  document.getElementById("lbl-speed").textContent = sec + "s";
  document.getElementById("live-sprite").style.animationDuration = sec + "s";
};
document.getElementById("btn-apply-frames").onclick = () => {
  const arr = document.getElementById("inp-frames").value.split(",").map(s => Number(s.trim())).filter(n => Number.isFinite(n));
  if (arr.length === 5) { getActiveChar().frame_indices = arr; refreshPreview(); }
  else alert("Masukkan tepat 5 angka frame, contoh: 0,1,2,3,4");
};

document.getElementById("btn-save-char").onclick = async () => {
  const ch = getActiveChar();
  document.getElementById("status").textContent = "Menyimpan resep & mengekspor .webp...";
  const r = await api("/api/save_export", { entry: ch });
  document.getElementById("status").textContent = r.ok ? `💾 Tersimpan! ${r.message}` : `⚠ ${r.error}`;
};

document.getElementById("btn-export-all").onclick = async () => {
  document.getElementById("status").textContent = "Mengekspor semua karakter + rebuild fase5_offline_preview.html...";
  const r = await api("/api/export_all", {});
  document.getElementById("status").textContent = r.ok ? `⚡ Selesai! ${r.message}` : `⚠ ${r.error}`;
};

document.getElementById("btn-reload-lpc").onclick = async () => {
  const dir = document.getElementById("inp-lpc-dir").value.trim();
  const r = await api("/api/set_lpc_dir", { lpc_dir: dir });
  document.getElementById("lpc-meta").textContent = `${r.count} file PNG terindeks dari ${r.lpc_dir}`;
  refreshPreview();
};

document.getElementById("btn-search").onclick = async () => {
  const q = document.getElementById("inp-search").value.trim();
  const r = await api("/api/search_layers", { query: q });
  const el = document.getElementById("search-results");
  el.innerHTML = (r.matches || []).map(m => `<button class="search-item" data-add-file="${m}">+ Tambah: ${m}</button>`).join("") || `<div class="muted">Tidak ada hasil untuk "${q}".</div>`;
  el.querySelectorAll("[data-add-file]").forEach(b => {
    b.onclick = () => {
      const f = b.dataset.addFile;
      getActiveChar().layers.push({ part: f.split("/").slice(0, 3).join("/"), colors: [], exact_file: f });
      refreshPreview();
    };
  });
};

(async function boot() {
  DATA = await api("/api/init");
  document.getElementById("inp-lpc-dir").value = DATA.lpc_dir || "";
  document.getElementById("lpc-meta").textContent = `${DATA.indexed_count} file PNG terindeks dari ${DATA.lpc_dir || "(belum ditemukan)"}`;
  ACTIVE_ID = DATA.recipes.stage1_characters[0]?.id || null;
  renderAll();
  refreshPreview();
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
        elif self.path == "/api/init":
            self._send_json({
                "lpc_dir": STATE["lpc_dir"],
                "indexed_count": len(STATE["index"]),
                "animations": ANIMATION_PRESETS,
                "recipes": load_recipes(),
            })
        else:
            self.send_error(404)

    def do_POST(self):
        try:
            body = self._read_json()
            if self.path == "/api/set_lpc_dir":
                cnt = load_lpc_index(body.get("lpc_dir", ""))
                self._send_json({"ok": True, "lpc_dir": STATE["lpc_dir"], "count": cnt})
            elif self.path == "/api/preview":
                recipes = load_recipes()
                entry = body["entry"]
                strip, portrait, logs = render_character_preview(entry, recipes)
                s_b64, s_sz = img_to_webp_b64(strip)
                p_b64, p_sz = img_to_webp_b64(portrait)
                self._send_json({
                    "ok": True,
                    "strip_b64": s_b64,
                    "strip_bytes": s_sz,
                    "portrait_b64": p_b64,
                    "portrait_bytes": p_sz,
                    "layer_logs": logs,
                })
            elif self.path == "/api/search_layers":
                q = str(body.get("query", "")).lower().strip()
                tokens = [t for t in q.split() if t]
                matches = [rel for rel in STATE["index"].keys() if all(t in rel for t in tokens)][:40]
                self._send_json({"ok": True, "matches": matches})
            elif self.path == "/api/save_export":
                recipes = load_recipes()
                entry = body["entry"]
                for i, c in enumerate(recipes["stage1_characters"]):
                    if c["id"] == entry["id"]:
                        recipes["stage1_characters"][i] = entry
                        break
                save_recipes(recipes)
                strip, portrait, _ = render_character_preview(entry, recipes)
                msg_parts = []
                if entry.get("out_sprite"):
                    _, sz = lp.save_webp(strip, entry["out_sprite"])
                    msg_parts.append(f"{entry['out_sprite']} ({sz/1024:.2f} KB)")
                if entry.get("out_portrait"):
                    _, sz = lp.save_webp(portrait, entry["out_portrait"])
                    msg_parts.append(f"{entry['out_portrait']} ({sz/1024:.2f} KB)")
                self._send_json({"ok": True, "message": " + ".join(msg_parts)})
            elif self.path == "/api/export_all":
                recipes = load_recipes()
                exported = 0
                for entry in recipes["stage1_characters"]:
                    strip, portrait, logs = render_character_preview(entry, recipes)
                    if any(x["status"] == "ok" for x in logs):
                        if entry.get("out_sprite"):
                            lp.save_webp(strip, entry["out_sprite"])
                        if entry.get("out_portrait"):
                            lp.save_webp(portrait, entry["out_portrait"])
                        exported += 1
                subprocess.run(
                    ["node", os.path.join(ROOT, "tools", "build_offline_app.mjs"), os.path.join(ROOT, "app", "dist", "fase5_offline_preview.html")],
                    check=True,
                )
                self._send_json({"ok": True, "message": f"{exported} karakter diekspor ke .webp & fase5_offline_preview.html diperbarui!"})
            else:
                self.send_error(404)
        except Exception as exc:
            self._send_json({"ok": False, "error": str(exc)}, code=500)


def main():
    parser = argparse.ArgumentParser(description="Battle-Smith RPG Visual Animation & Attack Motion Studio")
    parser.add_argument("--lpc-dir", help="Path folder Universal-LPC-Spritesheet-Character-Generator")
    parser.add_argument("--port", type=int, default=8787)
    parser.add_argument("--no-browser", action="store_true")
    args = parser.parse_args()

    lpc_dir = auto_detect_lpc_dir(args.lpc_dir)
    cnt = load_lpc_index(lpc_dir)
    print(f"Battle-Smith Animation Studio aktif di http://127.0.0.1:{args.port}")
    print(f"Folder LPC: {lpc_dir or '(belum terdeteksi — masukkan di UI)'} ({cnt} PNG terindeks)")
    if not args.no_browser:
        webbrowser.open(f"http://127.0.0.1:{args.port}")
    ThreadingHTTPServer(("127.0.0.1", args.port), StudioHandler).serve_forever()


if __name__ == "__main__":
    main()
