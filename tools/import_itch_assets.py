#!/usr/bin/env python3
"""
Battle-Smith RPG — Automated Itch.io Asset Importer (Oppo A54 < 150 MB RAM Safe)
--------------------------------------------------------------------------------
Cara pakai di laptop:
  1. Taruh file gambar (.png/.jpg/.webp) ATAU file .zip dari itch.io ke folder:
       assets/itch_raw/weapons/     -> app/assets/icons/weapons/   (128x128 .webp)
       assets/itch_raw/armors/      -> app/assets/icons/armors/    (128x128 .webp)
       assets/itch_raw/materials/   -> app/assets/icons/materials/ (96x96 .webp)
       assets/itch_raw/skills/      -> app/assets/icons/skills/    (96x96 .webp)
       assets/itch_raw/monsters/    -> app/assets/monsters/        (pixel-art lossless / max 128px .webp)
       assets/itch_raw/ui/          -> app/assets/ui/custom/       (frame <=256px lossless; bg/map max 760px .webp)
       assets/itch_raw/portraits/   -> app/assets/ui/portraits/    (160x160 .webp)
  2. Jalankan:
       npm run import:assets
     (atau: python3 tools/import_itch_assets.py)
  3. Script otomatis mengecilkan ukuran, mengubah ke .webp, dan menghasilkan:
       app/js/custom_asset_manifest.js
     yang langsung terbaca oleh window.BSRPG_ASSETS tanpa edit JS manual!
"""

import io
import json
import os
import re
import sys
import zipfile
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("ERROR: Modul 'Pillow' belum terpasang. Jalankan: pip install Pillow")
    sys.exit(1)

REPO_ROOT = Path(__file__).resolve().parent.parent
RAW_ROOT = REPO_ROOT / "assets" / "itch_raw"
APP_ASSETS = REPO_ROOT / "app" / "assets"
MANIFEST_OUT = REPO_ROOT / "app" / "js" / "custom_asset_manifest.js"

IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".webp"}

CATEGORIES = {
    "weapons":   {"out": APP_ASSETS / "icons" / "weapons",   "rel": "assets/icons/weapons",   "prefix": "icon_weapon_", "max_px": 128, "quality": 85, "lossless_if_small": False},
    "armors":    {"out": APP_ASSETS / "icons" / "armors",    "rel": "assets/icons/armors",    "prefix": "icon_armor_",  "max_px": 128, "quality": 85, "lossless_if_small": False},
    "materials": {"out": APP_ASSETS / "icons" / "materials", "rel": "assets/icons/materials", "prefix": "icon_mat_",    "max_px": 96,  "quality": 85, "lossless_if_small": False},
    "skills":    {"out": APP_ASSETS / "icons" / "skills",    "rel": "assets/icons/skills",    "prefix": "icon_skill_",  "max_px": 96,  "quality": 85, "lossless_if_small": False},
    "monsters":  {"out": APP_ASSETS / "monsters",            "rel": "assets/monsters",        "prefix": "mon_",         "max_px": 128, "quality": 88, "lossless_if_small": True},
    "ui":        {"out": APP_ASSETS / "ui" / "custom",       "rel": "assets/ui/custom",       "prefix": "ui_",          "max_px": 760, "quality": 82, "lossless_if_small": True},
    "portraits": {"out": APP_ASSETS / "ui" / "portraits",    "rel": "assets/ui/portraits",    "prefix": "portrait_",    "max_px": 160, "quality": 85, "lossless_if_small": False},
}


def slugify(name: str) -> str:
    s = re.sub(r"[^a-zA-Z0-9]+", "_", name.strip().lower()).strip("_")
    return s or "asset"


def should_skip_zip_member(member_path: str, category: str) -> tuple[bool, str | None]:
    """
    Filter pintar untuk paket itch.io:
    - Abaikan __MACOSX, file tersembunyi, file preview/readme.
    - Untuk folder 8-arah (Elie Studio / Dread Realms): ambil HANYA 'south-west.png'
      dan beri nama berdasarkan folder karakter (mis. 'azure_ember_wraith').
    - Untuk paket multi-resolusi (256/512/1024): utamakan 128 jika ada di path.
    """
    low = member_path.lower().replace("\\", "/")
    if "__macosx" in low or "/." in low or low.startswith("."):
        return True, None

    p = Path(member_path)
    if p.suffix.lower() not in IMAGE_EXTS:
        return True, None

    # Filter rotasi 8-arah: hanya ambil south-west.png agar hemat RAM & tidak duplikat 8x
    if "/rotations/" in low:
        if p.name.lower() != "south-west.png":
            return True, None
        # Ambil nama folder karakter sebelum '/rotations/'
        parts = [x for x in p.parts if x]
        try:
            rot_idx = [x.lower() for x in parts].index("rotations")
            if rot_idx >= 1:
                return False, slugify(parts[rot_idx - 1])
        except ValueError:
            pass

    # Filter paket multi-size (mis. Worlds Without End 128/256/512): hindari impor 3x duplikat
    if any(seg in low for seg in ["/512x512/", "/256x256/", "/1024x1024/", "/512/", "/256/", "/1024/"]):
        if category in ("weapons", "armors", "materials", "skills"):
            # Tetap izinkan jika tidak ada folder 128 di ZIP (ditangani di caller)
            pass

    return False, slugify(p.stem)


def find_spans(counts: list[int], min_len: int = 8) -> list[tuple[int, int]]:
    spans = []
    start = None
    for i, c in enumerate(counts):
        if c > 0 and start is None:
            start = i
        elif c == 0 and start is not None:
            if i - start >= min_len:
                spans.append((start, i))
            start = None
    if start is not None and len(counts) - start >= min_len:
        spans.append((start, len(counts)))
    return spans


def auto_slice_monster_sheet(img_bytes: bytes) -> list[bytes]:
    """
    Deteksi otomatis lembar sprite sheet monster (mis. Dark Bestiary 448 Monsters):
    Jika gambar berukuran > 256px dan memiliki celah transparan antar baris/kolom,
    potong otomatis setiap monster menjadi gambar kotak terpisah.
    """
    im = Image.open(io.BytesIO(img_bytes))
    w, h = im.size
    if max(w, h) <= 256:
        return [img_bytes]

    rgba = im.convert("RGBA")
    alpha = rgba.getchannel("A")
    a_min, _ = alpha.getextrema()
    if a_min > 15:
        # Tidak ada transparansi -> kembalikan utuh agar tidak salah potong
        return [img_bytes]

    # Gunakan data alpha untuk mendeteksi baris (row bands) & kolom (cell spans)
    a_bytes = alpha.tobytes()
    row_counts = [0] * h
    for y in range(h):
        off = y * w
        row_slice = a_bytes[off:off + w]
        # Hitung cepat apakah baris punya piksel solid
        if max(row_slice) > 15:
            row_counts[y] = 1

    row_spans = find_spans(row_counts, min_len=12)
    if len(row_spans) <= 1:
        # Cek kolom jika 1 baris panjang (strip horizontal)
        col_counts = [0] * w
        for y in range(h):
            off = y * w
            for x in range(w):
                if a_bytes[off + x] > 15:
                    col_counts[x] = 1
        col_spans = find_spans(col_counts, min_len=12)
        if len(col_spans) <= 1:
            return [img_bytes]
        row_spans = [(0, h)]

    sliced = []
    for y0, y1 in row_spans:
        col_counts = [0] * w
        for y in range(y0, y1):
            off = y * w
            for x in range(w):
                if a_bytes[off + x] > 15:
                    col_counts[x] = 1
        col_spans = find_spans(col_counts, min_len=12)
        for x0, x1 in col_spans:
            cell = rgba.crop((x0, y0, x1, y1))
            bbox = cell.getbbox()
            if not bbox:
                continue
            cell = cell.crop(bbox)
            cw, ch = cell.size
            if cw < 12 or ch < 12:
                continue
            side = max(cw, ch) + 4
            square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
            square.paste(cell, ((side - cw) // 2, (side - ch) // 2))
            buf = io.BytesIO()
            square.save(buf, "PNG")
            sliced.append(buf.getvalue())

    return sliced if len(sliced) > 1 else [img_bytes]


def convert_and_save(img_bytes: bytes, dest_path: Path, cfg: dict) -> tuple[int, tuple[int, int]]:
    im = Image.open(io.BytesIO(img_bytes))
    has_alpha = im.mode in ("RGBA", "LA") or ("transparency" in im.info)
    im = im.convert("RGBA" if has_alpha else "RGB")

    w, h = im.size
    max_px = cfg["max_px"]

    # Resize proporsional jika lebih besar dari target Oppo A54
    if max(w, h) > max_px:
        scale = max_px / float(max(w, h))
        new_size = (max(1, int(round(w * scale))), max(1, int(round(h * scale))))
        resample = Image.Resampling.NEAREST if (cfg["lossless_if_small"] and max(w, h) <= 128) else Image.Resampling.LANCZOS
        im = im.resize(new_size, resample)

    dest_path.parent.mkdir(parents=True, exist_ok=True)
    use_lossless = cfg["lossless_if_small"] and max(im.size) <= 256 and has_alpha
    if use_lossless:
        im.save(dest_path, "WEBP", lossless=True, method=6)
    else:
        im.save(dest_path, "WEBP", quality=cfg["quality"], method=5)

    return dest_path.stat().st_size, im.size


def iter_category_sources(raw_dir: Path, category: str):
    """Yield (slug_name, raw_bytes) dari file lepas maupun .zip di dalam raw_dir."""
    if not raw_dir.exists():
        return

    def emit_item(base_slug: str, raw_bytes: bytes):
        if category == "monsters":
            parts = auto_slice_monster_sheet(raw_bytes)
            if len(parts) > 1:
                print(f"  [SLICE] {base_slug}: otomatis dipotong menjadi {len(parts)} monster!")
                for idx, part_bytes in enumerate(parts, start=1):
                    yield f"{base_slug}_{idx:02d}", part_bytes
                return
        yield base_slug, raw_bytes

    # 1. File gambar langsung (termasuk subfolder hasil ekstrak manual)
    for f in sorted(raw_dir.rglob("*")):
        if not f.is_file():
            continue
        if f.suffix.lower() in IMAGE_EXTS:
            rel_str = str(f.relative_to(raw_dir)).replace("\\", "/")
            skip, custom_slug = should_skip_zip_member(rel_str, category)
            if skip:
                continue
            yield from emit_item(custom_slug or slugify(f.stem), f.read_bytes())
        elif f.suffix.lower() == ".zip":
            with zipfile.ZipFile(f, "r") as zf:
                names = zf.namelist()
                has_128_folder = any("/128" in n.lower() for n in names)
                for member in sorted(names):
                    if member.endswith("/"):
                        continue
                    if has_128_folder and any(seg in member.lower() for seg in ["/256", "/512", "/1024"]):
                        continue
                    skip, custom_slug = should_skip_zip_member(member, category)
                    if skip:
                        continue
                    yield from emit_item(custom_slug or slugify(Path(member).stem), zf.read(member))


def write_manifest_js(relative_paths: dict, custom_packs: dict):
    js_content = f"""/**
 * Battle-Smith RPG — Auto-Generated Custom Itch.io Asset Manifest
 * Dihasilkan otomatis oleh: npm run import:assets (tools/import_itch_assets.py)
 * JANGAN edit manual jika tidak perlu — cukup taruh file di assets/itch_raw/ lalu jalankan ulang.
 */
(function (global) {{
  "use strict";

  const CUSTOM_RELATIVE_PATHS = {json.dumps(relative_paths, indent=2, ensure_ascii=False)};

  const CUSTOM_PACKS = {json.dumps(custom_packs, indent=2, ensure_ascii=False)};

  if (global.BSRPG_ASSETS && global.BSRPG_ASSETS.RELATIVE_PATHS) {{
    Object.assign(global.BSRPG_ASSETS.RELATIVE_PATHS, CUSTOM_RELATIVE_PATHS);
    global.BSRPG_ASSETS.CUSTOM_PACKS = CUSTOM_PACKS;

    // Helper: ambil ikon senjata/armor/material/skill kustom berdasarkan ID atau nama
    global.BSRPG_ASSETS.getCustomIcon = function (category, slugOrId) {{
      const list = CUSTOM_PACKS[category] || [];
      if (!list.length) return "";
      const norm = String(slugOrId || "").toLowerCase().replace(/[^a-z0-9]+/g, "_");
      const exact = list.find(item => item.slug === norm || item.key === norm);
      if (exact) return exact.path;
      // Fallback deterministik berdasarkan hash agar tiap item selalu konsisten
      let h = 2166136261 >>> 0;
      for (let i = 0; i < norm.length; i++) {{
        h ^= norm.charCodeAt(i);
        h = Math.imul(h, 16777619) >>> 0;
      }}
      return list[h % list.length].path;
    }};

    // Helper: ambil sprite monster kustom (jika ada di app/assets/monsters/) secara deterministik
    global.BSRPG_ASSETS.getCustomMonsterUrl = function (monster) {{
      const list = CUSTOM_PACKS.monsters || [];
      if (!list.length || !monster) return "";
      const text = `${{monster.name || ""}} ${{monster.family || monster.famili || ""}}`.toLowerCase();
      // Coba cocokkan kata kunci famili terlebih dahulu
      const keywords = [
        [/wraith|spirit|ghost|frost|azure|ice/, /wraith|spirit|ghost|frost|azure/],
        [/golem|construct|stone|iron|mimic/, /golem|construct|stone|iron|mimic/],
        [/plague|alchemist|bandit|humanoid|cultist/, /plague|alchemist|hunter|doctor/],
        [/undead|necro|skeleton|lich|reaper/, /necro|reaper|skeleton|undead|lich/],
        [/abyss|void|boss|demon|horror/, /abyss|void|demon|horror/]
      ];
      for (const [mRe, aRe] of keywords) {{
        if (mRe.test(text)) {{
          const hit = list.find(x => aRe.test(x.slug));
          if (hit) return hit.path;
        }}
      }}
      // Fallback deterministik berdasarkan nama monster
      const seed = String(monster.id || monster.name || "mon");
      let h = 2166136261 >>> 0;
      for (let i = 0; i < seed.length; i++) {{
        h ^= seed.charCodeAt(i);
        h = Math.imul(h, 16777619) >>> 0;
      }}
      return list[h % list.length].path;
    }};
  }}
}})(typeof window !== "undefined" ? window : globalThis);
"""
    MANIFEST_OUT.write_text(js_content, encoding="utf-8")


def main():
    RAW_ROOT.mkdir(parents=True, exist_ok=True)
    for cat in CATEGORIES:
        (RAW_ROOT / cat).mkdir(parents=True, exist_ok=True)

    relative_paths = {}
    custom_packs = {cat: [] for cat in CATEGORIES}
    total_files = 0
    total_bytes = 0

    print("=== Battle-Smith RPG: Itch.io Auto Asset Importer ===")
    for cat, cfg in CATEGORIES.items():
        raw_dir = RAW_ROOT / cat
        cat_count = 0
        cat_bytes = 0
        seen_slugs = set()

        for slug, raw_bytes in iter_category_sources(raw_dir, cat):
            if slug in seen_slugs:
                continue
            seen_slugs.add(slug)

            # Jika nama file di ui/ sudah diawali 'ui_', jangan gandakan prefix
            key = slug if (cat == "ui" and slug.startswith("ui_")) else f"{cfg['prefix']}{slug}"
            out_file = cfg["out"] / f"{slug}.webp"
            rel_path = f"{cfg['rel']}/{slug}.webp"

            try:
                sz, dim = convert_and_save(raw_bytes, out_file, cfg)
            except Exception as err:
                print(f"  [SKIP] {cat}/{slug}: gagal konversi ({err})")
                continue

            relative_paths[key] = rel_path
            custom_packs[cat].append({"key": key, "slug": slug, "path": rel_path, "w": dim[0], "h": dim[1]})
            cat_count += 1
            cat_bytes += sz
            total_files += 1
            total_bytes += sz

        if cat_count > 0:
            print(f"  [OK] {cat:10s}: {cat_count:3d} aset -> {cat_bytes / 1024:.1f} KB (.webp)")

    write_manifest_js(relative_paths, custom_packs)
    print(f"\nSelesai! Total {total_files} aset kustom ({total_bytes / 1024:.1f} KB) terdaftar di:")
    print(f"  -> {MANIFEST_OUT.relative_to(REPO_ROOT)}")
    if total_files == 0:
        print("\nTips: Taruh file .png/.webp/.zip dari itch.io ke folder assets/itch_raw/<kategori>/ lalu jalankan ulang.")


if __name__ == "__main__":
    main()
