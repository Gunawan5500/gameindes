#!/usr/bin/env python3
"""
Battle-Smith RPG — Dual-Tier Universal LPC Asset Pipeline
Menghubungkan repo lokal Universal-LPC-Spritesheet-Character-Generator ke Battle-Smith RPG:
  - --mode stage1 : Pre-bake sprite 5-frame (320x64 .webp) & potret (96x96 .webp) untuk HP Oppo A54 (APK ringan)
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


def resolve_layer(index, candidate_patterns):
    """Cari file layer PNG yang paling cocok (exact suffix -> fuzzy token match)."""
    for pat in candidate_patterns:
        p = pat.lower().lstrip("/")
        if p in index:
            return p, index[p]
    # Suffix match
    for pat in candidate_patterns:
        p = pat.lower().lstrip("/")
        for rel, full in index.items():
            if rel.endswith(p):
                return rel, full
    # Fallback token match (semua kata kunci utama muncul di path)
    for pat in candidate_patterns:
        tokens = [t for t in pat.lower().replace(".png", "").split("/") if t not in ("bodies", "clothes", "universal")]
        for rel, full in index.items():
            if all(tok in rel for tok in tokens):
                return rel, full
    return None, None


def extract_5frame_strip(sheet_img, row_idx, fw=64, fh=64, frames=5):
    """Potong 5 frame horizontal (320x64) dari baris animasi LPC tertentu."""
    strip = Image.new("RGBA", (fw * frames, fh), (0, 0, 0, 0))
    y0 = row_idx * fh
    if y0 + fh > sheet_img.height:
        # Fallback aman ke baris Walk Down jika sheet lebih pendek
        y0 = min(10 * fh, max(0, sheet_img.height - fh))
    for i in range(frames):
        x0 = i * fw
        if x0 + fw > sheet_img.width:
            x0 = max(0, sheet_img.width - fw)
        crop = sheet_img.crop((x0, y0, x0 + fw, y0 + fh))
        strip.paste(crop, (i * fw, 0), crop)
    return strip


def extract_portrait_96(sheet_img, fw=64, fh=64):
    """Potong area dada/wajah dari Walk Down Frame 0 (row 10, col 0) -> upscale crisp 96x96."""
    y_row = 10 * fh if (10 * fh + fh) <= sheet_img.height else 0
    frame = sheet_img.crop((0, y_row, fw, y_row + fh))
    # Fokus upper-body / kepala (40x40 di tengah atas) -> 96x96 NEAREST agar pixel-art tetap tajam
    bust = frame.crop((12, 6, 52, 46))
    bg = Image.new("RGBA", (96, 96), (18, 28, 42, 255))
    scaled = bust.resize((88, 88), Image.NEAREST)
    bg.paste(scaled, (4, 6), scaled)
    return bg


def composite_recipe(index, layers_spec, row_idx, fw=64, fh=64, frames=5):
    """Tumpuk layer-layer LPC menjadi 1 strip 5-frame + 1 potret 96x96."""
    strip_out = Image.new("RGBA", (fw * frames, fh), (0, 0, 0, 0))
    portrait_canvas = Image.new("RGBA", (fw, fh), (0, 0, 0, 0))
    matched_layers = []

    for candidates in layers_spec:
        rel, full = resolve_layer(index, candidates)
        if not full:
            continue
        matched_layers.append(rel)
        with Image.open(full).convert("RGBA") as sheet:
            layer_strip = extract_5frame_strip(sheet, row_idx, fw, fh, frames)
            strip_out.alpha_composite(layer_strip)
            y_row = 10 * fh if (10 * fh + fh) <= sheet.height else 0
            frame0 = sheet.crop((0, y_row, fw, y_row + fh))
            portrait_canvas.alpha_composite(frame0)

    # Bangun potret 96x96 dari gabungan portrait_canvas
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

    anims = recipes["grid"]["animations"]
    fw = recipes["grid"]["frame_width"]
    fh = recipes["grid"]["frame_height"]
    frames = recipes["grid"]["frames_per_strip"]
    used_layers = set()
    total_bytes = 0

    print(f"[STAGE 1 — HP Pre-Bake] Terindeks {len(index)} layer PNG dari {lpc_dir}")
    for entry in recipes["stage1_characters"]:
        anim_name = entry.get("animation", "slash")
        direction = entry.get("direction", "right")
        row_idx = anims.get(anim_name, anims["slash"]).get(direction, 15)

        strip, portrait, matched = composite_recipe(index, entry["layers"], row_idx, fw, fh, frames)
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

    manifest = {"version": "1.0", "mode": "laptop_stage2_minipack", "slots": {}}
    total_bytes = 0

    print(f"[STAGE 2 — Laptop Live Mini-Pack] Mengekstrak layer pilihan ke {cfg['out_dir']}")
    for slot_name, items in cfg["slots"].items():
        manifest["slots"][slot_name] = []
        for item in items:
            rel, full = resolve_layer(index, item["patterns"])
            if not full:
                continue
            with Image.open(full).convert("RGBA") as sheet:
                # Simpan potret transparan 64x64 (Walk Down Frame 0) untuk komposit live super ringan
                y_row = 10 * fh if (10 * fh + fh) <= sheet.height else 0
                bust = sheet.crop((12, y_row + 6, 52, y_row + 46)).resize((88, 88), Image.NEAREST)
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
    anims = recipes["grid"]["animations"]
    fw = recipes["grid"]["frame_width"]
    fh = recipes["grid"]["frame_height"]
    frames = recipes["grid"]["frames_per_strip"]
    row_idx = anims.get(animation, anims["slash"]).get(direction, 15)

    with Image.open(png_path).convert("RGBA") as sheet:
        strip = extract_5frame_strip(sheet, row_idx, fw, fh, frames)
        portrait = extract_portrait_96(sheet, fw, fh)

    sp_out = f"app/assets/sprites/{target_id}_5f.webp"
    pt_out = f"app/assets/ui/portraits/portrait_{target_id}.webp"
    _, sz1 = save_webp(strip, sp_out)
    _, sz2 = save_webp(portrait, pt_out)
    print(f"[IMPORT PNG OK] {png_path} -> {sp_out} ({sz1/1024:.2f} KB) & {pt_out} ({sz2/1024:.2f} KB)")


def main():
    parser = argparse.ArgumentParser(description="Battle-Smith RPG Dual-Tier LPC Asset Pipeline")
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
