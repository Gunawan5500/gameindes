#!/usr/bin/env python3
"""Jalur 2: Batch generator gambar monster via Google Gemini API (google-genai).

Prasyarat:
    pip install google-genai pillow
    export GEMINI_API_KEY="AIza..."   # Ambil dari https://aistudio.google.com/apikey

Contoh pakai:
    # Tes 5 gambar pertama dulu
    python3 tools/monster_art/generate_gemini_api.py --limit 5

    # Generate 1 Area pilot (Hollowfrost Range = 34 gambar)
    python3 tools/monster_art/generate_gemini_api.py --area "Hollowfrost Range"

    # Generate hanya 64 Boss & Mini Boss
    python3 tools/monster_art/generate_gemini_api.py --boss-only

    # Generate semua 544 gambar (aman dihentikan & dilanjutkan, auto-resume)
    python3 tools/monster_art/generate_gemini_api.py
"""

from __future__ import annotations

import argparse
import io
import json
import os
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_MANIFEST = ROOT / "data" / "monsters_visual_manifest.json"
DEFAULT_OUT_DIR = ROOT / "assets" / "monsters"


def save_image_bytes(raw_bytes: bytes, dest_path: Path, size: int, quality: int) -> None:
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    try:
        from PIL import Image

        with Image.open(io.BytesIO(raw_bytes)) as img:
            img = img.convert("RGB")
            if size > 0 and img.size != (size, size):
                img = img.resize((size, size), Image.Resampling.LANCZOS)
            img.save(dest_path, format="WEBP", quality=quality, method=6)
    except ImportError:
        # Fallback jika Pillow belum terpasang
        fallback = dest_path.with_suffix(".png")
        fallback.write_bytes(raw_bytes)


def generate_via_imagen(client, model: str, prompt: str) -> bytes:
    from google.genai import types

    resp = client.models.generate_images(
        model=model,
        prompt=prompt,
        config=types.GenerateImagesConfig(
            number_of_images=1,
            aspect_ratio="1:1",
            output_mime_type="image/png",
        ),
    )
    if not resp.generated_images:
        raise RuntimeError("API tidak mengembalikan gambar (kemungkinan terfilter safety).")
    return resp.generated_images[0].image.image_bytes


def generate_via_gemini_image(client, model: str, prompt: str) -> bytes:
    from google.genai import types

    resp = client.models.generate_content(
        model=model,
        contents=f"Generate a square 1:1 RPG monster portrait image:\n{prompt}",
        config=types.GenerateContentConfig(
            response_modalities=["IMAGE"],
        ),
    )
    for cand in getattr(resp, "candidates", []) or []:
        content = getattr(cand, "content", None)
        for part in getattr(content, "parts", []) or []:
            inline = getattr(part, "inline_data", None)
            if inline and getattr(inline, "data", None):
                return inline.data
    raise RuntimeError("Respons Gemini tidak berisi data gambar.")


def main() -> None:
    parser = argparse.ArgumentParser(description="Batch generate monster art via Google Gemini API.")
    parser.add_argument("--manifest", type=Path, default=DEFAULT_MANIFEST)
    parser.add_argument("--out-dir", type=Path, default=DEFAULT_OUT_DIR)
    parser.add_argument(
        "--model",
        default="gemini-2.5-flash-image",
        help=(
            "Nama model Google GenAI. Contoh: 'gemini-2.5-flash-image' (default) "
            "atau 'imagen-3.0-generate-002' / 'imagen-4.0-generate-001'."
        ),
    )
    parser.add_argument("--area", type=str, default=None, help="Filter 1 Area saja, mis. 'Hollowfrost Range'.")
    parser.add_argument("--boss-only", action="store_true", help="Hanya generate Boss & Mini Boss (64 gambar).")
    parser.add_argument("--limit", type=int, default=0, help="Batas maksimum gambar baru per sesi (0 = semua).")
    parser.add_argument("--size", type=int, default=512, help="Ukuran output persegi WebP (default: 512).")
    parser.add_argument("--quality", type=int, default=85, help="Kualitas kompresi WebP 1-100 (default: 85).")
    parser.add_argument("--delay", type=float, default=3.5, help="Jeda antar request dalam detik (default: 3.5).")
    parser.add_argument("--max-retries", type=int, default=4, help="Jumlah retry otomatis bila kena rate limit.")
    parser.add_argument("--overwrite", action="store_true", help="Timpa file gambar yang sudah ada.")
    args = parser.parse_args()

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print(
            "ERROR: Environment variable GEMINI_API_KEY belum diset.\n"
            "Ambil API key dari https://aistudio.google.com/apikey lalu jalankan:\n"
            "  export GEMINI_API_KEY='AIza...'\n"
            "  python3 tools/monster_art/generate_gemini_api.py --limit 5",
            file=sys.stderr,
        )
        sys.exit(1)

    try:
        from google import genai
    except ImportError:
        print(
            "ERROR: Paket 'google-genai' belum terpasang.\n"
            "Install dulu dengan: pip install google-genai pillow",
            file=sys.stderr,
        )
        sys.exit(1)

    manifest = json.loads(args.manifest.read_text(encoding="utf-8"))
    entries = manifest["entries"]

    if args.area:
        entries = [e for e in entries if e["area"].lower() == args.area.lower()]
    if args.boss_only:
        entries = [e for e in entries if e["tipe"] in ("Boss", "Mini Boss")]

    client = genai.Client(api_key=api_key)
    use_imagen = args.model.lower().startswith("imagen")

    total = len(entries)
    generated = 0
    skipped = 0
    failed: list[dict[str, str]] = []

    print(f"Model    : {args.model} ({'Imagen API' if use_imagen else 'Gemini Image API'})")
    print(f"Target   : {total} entitas | Output: {args.out_dir}")

    for i, entry in enumerate(entries, start=1):
        dest = args.out_dir / entry["filename"]
        if dest.exists() and not args.overwrite:
            skipped += 1
            continue

        if args.limit > 0 and generated >= args.limit:
            print(f"\nBatas --limit {args.limit} tercapai. Hentikan sementara (aman dilanjutkan nanti).")
            break

        print(f"[{i}/{total}] Generating {entry['display_name']} ({entry['area']})...", end=" ", flush=True)

        success = False
        last_err = ""
        for attempt in range(1, args.max_retries + 1):
            try:
                if use_imagen:
                    raw = generate_via_imagen(client, args.model, entry["prompt"])
                else:
                    raw = generate_via_gemini_image(client, args.model, entry["prompt"])
                save_image_bytes(raw, dest, size=args.size, quality=args.quality)
                print(f"OK -> {entry['filename']}")
                generated += 1
                success = True
                break
            except Exception as exc:  # noqa: BLE001
                last_err = str(exc)
                wait_s = min(60.0, args.delay * (2**attempt))
                if attempt < args.max_retries:
                    print(f"retry {attempt} ({wait_s:.0f}s)...", end=" ", flush=True)
                    time.sleep(wait_s)

        if not success:
            print(f"GAGAL: {last_err[:140]}")
            failed.append({"visual_key": entry["visual_key"], "error": last_err})

        time.sleep(args.delay)

    print(f"\nSelesai! Baru dibuat: {generated} | Dilewati (sudah ada): {skipped} | Gagal: {len(failed)}")
    if failed:
        fail_log = args.out_dir / "_failed_gemini.json"
        fail_log.parent.mkdir(parents=True, exist_ok=True)
        fail_log.write_text(json.dumps(failed, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"Daftar gagal dicatat di: {fail_log}")


if __name__ == "__main__":
    main()
