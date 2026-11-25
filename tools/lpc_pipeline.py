#!/usr/bin/env python3
"""
Battle-Smith RPG — Dual-Tier Universal LPC Asset Pipeline (v2.0)
Mendukung struktur Universal LPC Modern (per-animasi: <part>/<anim>/<color>.png & <part>/<anim>.png)
maupun struktur Legacy (832x1344 full sheet) serta weapon oversize 192x192!

Mode:
  - --mode stage1 : Pre-bake sprite 5-frame (320x64 .webp) & potret (96x96 .webp) untuk HP Oppo A54 (APK)
  - --mode stage2 : Ekstrak Mini-Pack layer .webp (app/assets/lpc_parts/) untuk Live NPC Generator di Laptop
  - --mode both   : Jalankan Stage 1 + Stage 2 sekaligus
  - --mode import-png : Konversi 1 file PNG hasil ekspor manual LPC menjadi 5-frame .webp + potret 96x96 .webp
"""
import argparse
import json
import os
import sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RECIPES_PATH = os.path.join(ROOT, "tools", "lpc_recipes.json")

DIR_ROW_4 = {"up": 0, "left": 1, "down": 2, "right": 3}


def index_lpc_spritesheets(lpc_dir):
    """Indeks seluruh file PNG di dalam folder spritesheets/ milik Universal LPC."""
    sp_root = os.path.join(lpc_dir, "spritesheets")
    if not os.path.isdir(sp_root):
        sp_root = lpc_dir
    index = {}
    for dirpath, _, filenames in os.walk(sp_root):
        for fn in filenames:
            if not fn.lower().endswith(".png"):
                continue
            full = os.path.join(dirpath, fn)
            rel = os.path.relpath(full, sp_root).replace("\\", "/").lower()
            index[rel] = full
    return sp_root, index


def resolve_layer_for_anim(index, layer_spec, anim_name):
    """
    Cari layer PNG terbaik untuk animasi tertentu (misal 'slash' atau 'walk').
    Prioritas:
      1. Modern LPC v2 berwarna: <part>/<anim>/<color>.png
      2. Modern LPC v2 tanpa warna: <part>/<anim>.png
      3. Modern LPC v2 sub-varian (gender/folder tengah): path mengandung <part> + <anim> + <color>
      4. Legacy full sheet: <part>/<color>.png
    """
    parts = [layer_spec["part"]] + list(layer_spec.get("fallback_parts", []))
    colors = [c.lower() for c in layer_spec.get("colors", [])]
    gender = (layer_spec.get("gender") or "").lower()
    anim_candidates = [anim_name]
    if anim_name == "slash":
        anim_candidates += ["halfslash", "thrust", "walk"]
    elif anim_name == "walk":
        anim_candidates += ["idle", "combat_idle"]
    elif anim_name == "spellcast":
        anim_candidates += ["slash", "walk"]
    elif anim_name == "shoot":
        anim_candidates += ["slash", "walk"]

    for part in parts:
        p = part.lower().strip("/")
        # 1. Exact <part>/<anim>/<color>.png
        for a in anim_candidates:
            for c in colors:
                exact = f"{p}/{a}/{c}.png"
                if exact in index:
                    return exact, index[exact]
            # 2. Exact <part>/<anim>.png (seperti body/bodies/female/slash.png)
            exact_no_col = f"{p}/{a}.png"
            if exact_no_col in index:
                return exact_no_col, index[exact_no_col]

        # 3. Prefix/token match di dalam <part>/...
        prefix_matches = [rel for rel in index.keys() if rel.startswith(p + "/")]
        if prefix_matches:
            # Hindari layer "behind" / "shadow" kecuali diminta
            clean = [r for r in prefix_matches if "/behind/" not in r and "_behind" not in r and "shadow" not in r]
            pool = clean or prefix_matches
            if gender:
                g_pool = [r for r in pool if f"/{gender}/" in r or r.endswith(f"/{gender}.png")]
                if g_pool:
                    pool = g_pool

            for a in anim_candidates:
                a_pool = [r for r in pool if f"/{a}/" in r or r.endswith(f"/{a}.png")]
                if not a_pool:
                    continue
                for c in colors:
                    for r in a_pool:
                        if r.endswith(f"/{c}.png") or f"_{c}.png" in r or f"/{c}_" in r:
                            return r, index[r]
                # Jika tidak ada warna spesifik, ambil yang pertama di animasi tsb
                return a_pool[0], index[a_pool[0]]

            # 4. Legacy full sheet di dalam <part>/
            for c in colors:
                for r in pool:
                    if r.endswith(f"/{c}.png"):
                        return r, index[r]
            return pool[0], index[pool[0]]

    return None, None


def extract_5frame_strip_smart(sheet_img, anim_name, direction, recipes):
    """
    Potong 5 frame horizontal (320x64) secara otomatis dari:
      - Modern LPC 4-row sheet (height == 256, 64x64 per frame)
      - Modern LPC 4-row oversize weapon sheet (height == 768, 192x192 per frame -> center-crop 64x64)
      - Legacy LPC 21-row full sheet (height >= 1344)
    """
    fw = recipes["grid"]["frame_width"]
    fh = recipes["grid"]["frame_height"]
    frames = recipes["grid"]["frames_per_strip"]
    anims = recipes["grid"]["animations"]

    strip = Image.new("RGBA", (fw * frames, fh), (0, 0, 0, 0))
    w, h = sheet_img.size

    if h == 768 and w >= 192:
        # Oversized 192x192 weapon animation (4 rows)
        row_idx = DIR_ROW_4.get(direction, 3)
        cell = 192
        y0 = row_idx * cell
        n_cols = max(1, w // cell)
        for i in range(frames):
            col = min(i, n_cols - 1)
            x0 = col * cell
            # Center 64x64 karakter berada di offset (64, 64) dalam sel 192x192
            crop = sheet_img.crop((x0 + 64, y0 + 64, x0 + 128, y0 + 128))
            strip.paste(crop, (i * fw, 0), crop)
        return strip

    if h <= 512:
        # Modern LPC 4-row per-animation sheet (256px) atau 1-row (64px)
        row_idx = DIR_ROW_4.get(direction, 3) if h >= 256 else 0
    else:
        # Legacy full sheet (1344px+)
        row_idx = anims.get(anim_name, anims["slash"]).get(direction, 15)

    y0 = min(row_idx * fh, max(0, h - fh))
    n_cols = max(1, w // fw)
    for i in range(frames):
        col = min(i, n_cols - 1)
        x0 = col * fw
        crop = sheet_img.crop((x0, y0, x0 + fw, y0 + fh))
        strip.paste(crop, (i * fw, 0), crop)
    return strip


def extract_front_frame_64(sheet_img, fw=64, fh=64):
    """Ambil 1 frame menghadap depan (Down Frame 0) dari sheet modern (row 2) atau legacy (row 10)."""
    w, h = sheet_img.size
    if h == 768 and w >= 192:
        return sheet_img.crop((64, 2 * 192 + 64, 128, 2 * 192 + 128))
    if h <= 512:
        y0 = 2 * fh if h >= 3 * fh else 0
    else:
        y0 = 10 * fh if h >= 11 * fh else 0
    return sheet_img.crop((0, y0, min(fw, w), min(y0 + fh, h)))


def composite_recipe(index, entry, recipes):
    """Komposit seluruh layer untuk 1 karakter (strip 5-frame + potret 96x96)."""
    fw = recipes["grid"]["frame_width"]
    fh = recipes["grid"]["frame_height"]
    frames = recipes["grid"]["frames_per_strip"]
    anim_name = entry.get("animation", "slash")
    direction = entry.get("direction", "right")

    strip_out = Image.new("RGBA", (fw * frames, fh), (0, 0, 0, 0))
    portrait_canvas = Image.new("RGBA", (fw, fh), (0, 0, 0, 0))
    matched_layers = []

    for layer_spec in entry["layers"]:
        # A. Layer untuk 5-frame battle strip
        rel_anim, full_anim = resolve_layer_for_anim(index, layer_spec, anim_name)
        if full_anim:
            matched_layers.append(rel_anim)
            with Image.open(full_anim).convert("RGBA") as sheet:
                layer_strip = extract_5frame_strip_smart(sheet, anim_name, direction, recipes)
                strip_out.alpha_composite(layer_strip)

        # B. Layer untuk potret menghadap depan (walk/idle down frame 0)
        rel_walk, full_walk = resolve_layer_for_anim(index, layer_spec, "walk")
        use_portrait = full_walk or full_anim
        if use_portrait:
            with Image.open(use_portrait).convert("RGBA") as psheet:
                f0 = extract_front_frame_64(psheet, fw, fh)
                if f0.size != (fw, fh):
                    tmp = Image.new("RGBA", (fw, fh), (0, 0, 0, 0))
                    tmp.paste(f0, (0, 0), f0)
                    f0 = tmp
                portrait_canvas.alpha_composite(f0)

    # Potong bust (40x40 tengah atas) -> upscale crisp 96x96 .webp
    bust = portrait_canvas.crop((12, 6, 52, 46))
    portrait_out = Image.new("RGBA", (96, 96), (18, 28, 42, 255))
    scaled = bust.resize((88, 88), Image.NEAREST)
    portrait_out.paste(scaled, (4, 6), scaled)
    return strip_out, portrait_out, matched_layers


def save_webp(img, rel_or_abs_path, quality=86):
    out = rel_or_abs_path if os.path.isabs(rel_or_abs_path) else os.path.join(ROOT, rel_or_abs_path)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    img.save(out, "WEBP", quality=quality, method=6)
    return out, os.path.getsize(out)


def run_stage1(lpc_dir, recipes):
    _, index = index_lpc_spritesheets(lpc_dir)
    if not index:
        raise RuntimeError(f"Tidak ditemukan file PNG LPC di: {lpc_dir}")

    used_layers = set()
    total_bytes = 0

    print(f"[STAGE 1 — HP Pre-Bake v2] Terindeks {len(index)} layer PNG dari {lpc_dir}")
    for entry in recipes["stage1_characters"]:
        strip, portrait, matched = composite_recipe(index, entry, recipes)
        if not matched:
            print(f"  [SKIP] {entry['id']}: tidak ada layer cocok.")
            continue
        used_layers.update(matched)

        if entry.get("out_sprite"):
            _, sz = save_webp(strip, entry["out_sprite"])
            total_bytes += sz
            print(f"  [OK] {entry['id']} sprite -> {entry['out_sprite']} ({sz/1024:.2f} KB, {len(matched)} layer)")
        if entry.get("out_portrait"):
            _, sz = save_webp(portrait, entry["out_portrait"])
            total_bytes += sz
            print(f"  [OK] {entry['id']} portrait -> {entry['out_portrait']} ({sz/1024:.2f} KB)")

    credits_path = os.path.join(ROOT, "app", "assets", "CREDITS_LPC.txt")
    with open(credits_path, "w", encoding="utf-8") as cf:
        cf.write("Battle-Smith RPG — Universal LPC Spritesheet Attribution (CC-BY-SA 3.0 / GPL 3.0)\n")
        cf.write("Source: https://github.com/liberatedpixelcup/Universal-LPC-Spritesheet-Character-Generator\n\n")
        for layer in sorted(used_layers):
            cf.write(f"- {layer}\n")
    print(f"[STAGE 1 SELESAI] Total output: {total_bytes/1024:.2f} KB • Atribusi disimpan ke app/assets/CREDITS_LPC.txt")


def run_stage2(lpc_dir, recipes):
    _, index = index_lpc_spritesheets(lpc_dir)
    if not index:
        raise RuntimeError(f"Tidak ditemukan file PNG LPC di: {lpc_dir}")

    cfg = recipes["stage2_mini_pack"]
    out_dir = os.path.join(ROOT, cfg["out_dir"])
    os.makedirs(out_dir, exist_ok=True)
    fw = recipes["grid"]["frame_width"]
    fh = recipes["grid"]["frame_height"]

    manifest = {"version": "2.0", "mode": "laptop_stage2_minipack", "slots": {}}
    total_bytes = 0

    print(f"[STAGE 2 — Laptop Live Mini-Pack v2] Mengekstrak layer pilihan ke {cfg['out_dir']}")
    for slot_name, items in cfg["slots"].items():
        manifest["slots"][slot_name] = []
        for item in items:
            rel, full = resolve_layer_for_anim(index, item, "walk")
            if not full:
                continue
            with Image.open(full).convert("RGBA") as sheet:
                f0 = extract_front_frame_64(sheet, fw, fh)
                bust = f0.crop((12, 6, 52, 46)).resize((88, 88), Image.NEAREST)
                rel_out = f"{slot_name}_{item['id']}.webp"
                _, sz = save_webp(bust, os.path.join(out_dir, rel_out), quality=84)
                total_bytes += sz
                manifest["slots"][slot_name].append({
                    "id": item["id"],
                    "file": f"assets/lpc_parts/{rel_out}",
                    "source": rel
                })
                print(f"  [OK] {slot_name}/{item['id']} -> {rel_out} ({sz/1024:.2f} KB)")

    manifest_path = os.path.join(ROOT, cfg["manifest_file"])
    with open(manifest_path, "w", encoding="utf-8") as mf:
        json.dump(manifest, mf, indent=2)
    print(f"[STAGE 2 SELESAI] Total Mini-Pack: {total_bytes/1024:.2f} KB • Manifest: {cfg['manifest_file']}")


def run_import_png(png_path, target_id, direction, animation, recipes):
    fw = recipes["grid"]["frame_width"]
    fh = recipes["grid"]["frame_height"]

    with Image.open(png_path).convert("RGBA") as sheet:
        strip = extract_5frame_strip_smart(sheet, animation, direction, recipes)
        f0 = extract_front_frame_64(sheet, fw, fh)
        bust = f0.crop((12, 6, 52, 46))
        portrait = Image.new("RGBA", (96, 96), (18, 28, 42, 255))
        scaled = bust.resize((88, 88), Image.NEAREST)
        portrait.paste(scaled, (4, 6), scaled)

    sp_out = f"app/assets/sprites/{target_id}_5f.webp"
    pt_out = f"app/assets/ui/portraits/portrait_{target_id}.webp"
    _, sz1 = save_webp(strip, sp_out)
    _, sz2 = save_webp(portrait, pt_out)
    print(f"[IMPORT PNG OK] {png_path} -> {sp_out} ({sz1/1024:.2f} KB) & {pt_out} ({sz2/1024:.2f} KB)")


def main():
    parser = argparse.ArgumentParser(description="Battle-Smith RPG Dual-Tier LPC Asset Pipeline (v2.0)")
    parser.add_argument("--mode", choices=["stage1", "stage2", "both", "import-png"], required=True)
    parser.add_argument("--lpc-dir", help="Path ke folder lokal Universal-LPC-Spritesheet-Character-Generator")
    parser.add_argument("--png", help="Path ke 1 file PNG hasil ekspor LPC (khusus --mode import-png)")
    parser.add_argument("--id", default="custom_npc", help="ID target sprite (khusus --mode import-png)")
    parser.add_argument("--dir", choices=["right", "left"], default="right")
    parser.add_argument("--anim", choices=["slash", "walk", "thrust", "shoot", "spellcast"], default="slash")
    args = parser.parse_args()

    with open(RECIPES_PATH, "r", encoding="utf-8") as f:
        recipes = json.load(f)

    if args.mode == "import-png":
        if not args.png or not os.path.isfile(args.png):
            sys.exit("Error: --png wajib diisi dengan path file PNG yang valid.")
        run_import_png(args.png, args.id, args.dir, args.anim, recipes)
        return

    if not args.lpc_dir or not os.path.isdir(args.lpc_dir):
        sys.exit("Error: --lpc-dir wajib diisi dengan path folder Universal-LPC-Spritesheet-Character-Generator.")

    if args.mode in ("stage1", "both"):
        run_stage1(args.lpc_dir, recipes)
    if args.mode in ("stage2", "both"):
        run_stage2(args.lpc_dir, recipes)


if __name__ == "__main__":
    main()
