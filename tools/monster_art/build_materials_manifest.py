#!/usr/bin/env python3
"""Ekstraktor manifest visual & prompt otomatis untuk Material (208) dan Trofi Monster (480 / 23 dasar)
dari Battle-Smith_RPG_Peta_Dunia_Musuh_v1.xlsx.

Kompatibel penuh dengan:
- Jalur 2: tools/monster_art/generate_gemini_api.py --manifest data/materials_visual_manifest.json --out-dir assets/materials
- Jalur 4: tools/monster_art/colab_generate_monsters.ipynb (upload materials_visual_manifest.json / trophies_visual_manifest.json)
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path
from typing import Any

import openpyxl

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_XLSX = ROOT / "Battle-Smith_RPG_Peta_Dunia_Musuh_v1.xlsx"
DEFAULT_MAT_MANIFEST = ROOT / "data" / "materials_visual_manifest.json"
DEFAULT_TRF_MANIFEST = ROOT / "data" / "trophies_visual_manifest.json"
DEFAULT_ITEM_MAPPING = ROOT / "data" / "materials_id_to_visual.json"

ITEM_STYLE_PRESETS: dict[str, dict[str, str]] = {
    "dark_fantasy": {
        "prefix": (
            "Dark fantasy RPG crafting material inventory icon, hand-painted digital game item art, "
            "centered single object floating on clean dark slate vignette background, crisp material texture, "
            "dramatic studio rim lighting, gritty medieval smithing aesthetic, square framing, "
            "no text, no border, no UI frame, no watermark, no hands"
        ),
        "negative": (
            "text, numbers, watermark, frame, card border, inventory slot UI, multiple scattered items, "
            "hands holding object, character, human face, blurry, lowres, photo, modern objects"
        ),
    },
    "ink_bestiary": {
        "prefix": (
            "Vintage dark fantasy alchemical and blacksmithing compendium item illustration, "
            "detailed ink crosshatching with muted watercolor wash on aged parchment background, "
            "centered single crafting ingredient, no text, no labels, no border"
        ),
        "negative": (
            "text, labels, watermark, modern 3d gloss, photo, frame, border, hands, multiple objects"
        ),
    },
    "pixel_art": {
        "prefix": (
            "32-bit dark fantasy RPG inventory item icon, crisp pixel art, high-contrast shading, "
            "centered single crafting material on clean dark background, classic JRPG icon style, "
            "no text, no border, no UI"
        ),
        "negative": (
            "blurry, 3d render, photo, text, watermark, UI frame, border, multiple items"
        ),
    },
}

AREA_PALETTES: dict[str, str] = {
    "Hollowfrost Range": "icy frost-covered, pale glacial blue and silver accents",
    "Cinderwatch Isles": "volcanic storm-touched, charcoal rock with electric blue sparks",
    "Greymoor Downs": "misty highland twilight, muted grey-lavender and eerie violet glint",
    "Blackmere Fens": "swamp-stained murky dark moss with glowing toxic green veins",
    "Elderwake Grove": "ancient sacred woodland, rich emerald moss and warm golden radiance",
    "Rustleaf Weald": "autumnal decaying rust-orange, crimson patina and corrosive emerald sheen",
    "Hollowbarrow Highlands": "graveyard barrow relic, pale bone-grey with faint ghostly teal mist",
    "Saltgrave Coast": "sea-weathered barnacle-crusted, storm-grey steel and deep ocean teal",
    "Briarfall Marches": "rugged iron-forged borderland aesthetic, weathered bronze and dark thorn",
    "Bonethorn Peninsula": "ivory bone-white accents with subtle arcane violet crystalline shimmer",
    "Wyrmspine Mountains": "high-altitude storm-forged, frost-steel and crackling lightning veins",
    "Ashwind Steppe": "ash-dusted desert-weathered, scorched amber and dusty ochre patina",
    "Frostpine Taiga": "winter pinewood and cold northern iron, deep forest green and hoarfrost",
    "Emberwaste": "volcanic molten-veined, obsidian black with glowing orange-red magma cracks",
    "Crownfrost Isle": "regal royal frost-steel, crystalline deep sapphire ice and silver filigree",
    "Wraithtide Isles": "spectral sea-cursed relic, moonlit phantom cyan and weathered dark silver",
}

CATEGORY_VISUALS: dict[str, str] = {
    "Kulit": "rolled cured monster hide pelt leather bundle with coarse fur or scales",
    "Kayu": "raw mystical timber log, heartwood branch, or glowing hardened tree resin chunk",
    "Kristal": "jagged faceted raw arcane crystal shard cluster glowing internally",
    "Tulang": "carved curved monster bone, horn, antler, or talon trophy specimen",
    "Logam": "rough metallic ore chunk or freshly smelted raw ingot with gleaming mineral veins",
    "Serat": "braided bundle of tough monster sinew, enchanted silk thread, or fibrous cord",
    "Esensi": "swirling ethereal magical orb or crystallized pulsing elemental core heart",
}

RARITY_VISUALS: dict[str, str] = {
    "Common": "raw humble unrefined crafting material, subtle natural lighting",
    "Uncommon": "fine quality sturdy crafting material with faint natural sheen",
    "Rare": "exquisite high-grade crafting material with vivid magical glow",
    "Epic": "radiant masterwork relic material emitting intense elemental aura and sparks",
    "Legendary": "mythic legendary boss artifact radiating overwhelming ethereal energy and sacred light",
}

RARITY_FX: dict[str, dict[str, str]] = {
    "Common": {"border": "#9ca3af", "glow": "rgba(156,163,175,0.2)"},
    "Uncommon": {"border": "#22c55e", "glow": "rgba(34,197,94,0.35)"},
    "Rare": {"border": "#3b82f6", "glow": "rgba(59,130,246,0.45)"},
    "Epic": {"border": "#a855f7", "glow": "rgba(168,85,247,0.55)"},
    "Legendary": {"border": "#f59e0b", "glow": "rgba(245,158,11,0.7)"},
}

TROPHY_PART_VISUALS: dict[str, str] = {
    "Fang": "razor-sharp curved monster fang tooth specimen",
    "Essence": "swirling luminous spirit essence wisp orb",
    "Core": "pulsing runic stone or elemental monster core sphere",
    "Bone": "weathered ancient monster bone relic",
    "Wand": "carved gnarled dark-fantasy monster catalyst wand",
    "Staff": "ornate mystic monster-forged staff headpiece",
    "Claw": "wicked hooked predatory monster claw",
    "Dagger": "jagged trophy blade shard forged from monster remains",
    "Talon": "curved raptor-like armored monster talon",
    "Heartwood": "dense living magical heartwood core chunk",
    "Scale": "thick iridescent armored monster scale plate",
    "Sword": "broken trophy greatsword blade fragment",
    "Stinger": "barbed venomous monster stinger tail tip",
    "Axe": "notched brutal monster-forged axe head relic",
    "Shell": "heavy armored ridged aquatic carapace shell",
    "Thorn": "wicked spiraled living bramble thorn spike",
    "Tusk": "massive curved battle-scarred beast tusk",
    "Chitin": "glossy segmented armored insect chitin plate",
    "Bow": "recurve trophy bow limb crafted from monster horn and sinew",
    "Antler": "branching majestic frost-or-rune-etched antler rack",
    "Horn": "heavy spiraled demonic or draconic monster horn",
    "Feather": "large shimmering mystical monster plume feather",
    "Spear": "barbed ancient monster spearhead relic",
}

ELEMENT_HINTS: dict[str, str] = {
    "Cold": "rimmed with delicate frost crystals and cold blue mist",
    "Fire": "glowing with hot embers and subtle flame wisps",
    "Lightning": "crackling with tiny electric blue lightning arcs",
    "Poison": "coated with glistening venomous emerald droplets",
    "Acid": "sizzling with bright corrosive chartreuse vapor",
    "Necrotic": "wreathed in pale shadowy necrotic smoke",
    "Radiant": "shimmering with warm sacred golden light rays",
    "Psychic": "emanating subtle violet telepathic aura rings",
    "Thunder": "surrounded by faint stormy shockwave mist",
    "Force": "pulsing with translucent arcane kinetic energy",
}


def slugify(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", text.strip().lower()).strip("_")


def stable_seed(key: str) -> int:
    digest = hashlib.sha256(key.encode("utf-8")).hexdigest()
    return int(digest[:8], 16) % (2**31 - 1)


def build_material_prompt(
    *,
    style_key: str,
    nama: str,
    area: str,
    rarity: str,
    kategori: str,
    elemen: str,
) -> tuple[str, str]:
    style = ITEM_STYLE_PRESETS[style_key]
    cat_desc = CATEGORY_VISUALS.get(kategori, kategori.lower())
    rar_desc = RARITY_VISUALS.get(rarity, "fantasy crafting material")
    area_pal = AREA_PALETTES.get(area, f"{area} dark fantasy palette")
    elem_hint = ELEMENT_HINTS.get(elemen, "")

    parts = [
        f"{nama}",
        cat_desc,
        rar_desc,
        area_pal,
    ]
    if elem_hint:
        parts.append(elem_hint)
    parts.append(style["prefix"])
    return ", ".join(parts), style["negative"]


def build_trophy_prompt(
    *,
    style_key: str,
    nama: str,
    spesies: str,
    area: str,
    famili: str,
    bagian: str,
    rarity: str,
    elemen: str,
) -> tuple[str, str]:
    style = ITEM_STYLE_PRESETS[style_key]
    part_desc = TROPHY_PART_VISUALS.get(bagian, f"monster trophy {bagian.lower()}")
    rar_desc = RARITY_VISUALS.get(rarity, "rare monster trophy")
    area_pal = AREA_PALETTES.get(area, f"{area} dark fantasy palette")
    elem_hint = ELEMENT_HINTS.get(elemen, "")

    parts = [
        f"{nama} (trophy from {spesies}, {famili.lower()} creature)",
        part_desc,
        rar_desc,
        area_pal,
    ]
    if elem_hint:
        parts.append(elem_hint)
    parts.append(style["prefix"])
    return ", ".join(parts), style["negative"]


def extract_all(xlsx_path: Path, style_key: str, trophy_mode: str) -> tuple[dict[str, Any], dict[str, Any], dict[str, Any]]:
    wb = openpyxl.load_workbook(xlsx_path, read_only=True, data_only=True)

    # 1. Read Properti Material for Elemen & extra metadata
    prop_by_id: dict[str, dict[str, Any]] = {}
    if "Properti Material" in wb.sheetnames:
        rows_p = list(wb["Properti Material"].iter_rows(values_only=True))
        for r in rows_p[4:]:
            if not r or not r[0]:
                continue
            prop_by_id[str(r[0]).strip()] = {
                "elemen": str(r[6] or "-").strip(),
                "stat_utama": str(r[8] or "").strip(),
            }

    # 2. Extract 208 Materials
    mat_entries: list[dict[str, Any]] = []
    item_mapping: dict[str, dict[str, Any]] = {}

    rows_m = list(wb["Material"].iter_rows(values_only=True))
    for r in rows_m[4:]:
        if not r or not r[0]:
            continue
        mat_id = str(r[0]).strip()
        area = str(r[1]).strip()
        nama = str(r[2]).strip()
        rarity = str(r[3]).strip()
        kategori = str(r[4]).strip()
        elemen = prop_by_id.get(mat_id, {}).get("elemen", "-")

        visual_key = f"mat_{slugify(mat_id)}_{slugify(nama)}"
        rel_filename = f"{slugify(area)}/{visual_key}.webp"
        prompt, neg_prompt = build_material_prompt(
            style_key=style_key,
            nama=nama,
            area=area,
            rarity=rarity,
            kategori=kategori,
            elemen=elemen,
        )

        mat_entries.append(
            {
                "visual_key": visual_key,
                "id": mat_id,
                "filename": rel_filename,
                "display_name": nama,
                "tipe": f"Material ({rarity})",
                "area": area,
                "rarity": rarity,
                "kategori": kategori,
                "elemen": elemen,
                "seed": stable_seed(visual_key),
                "prompt": prompt,
                "negative_prompt": neg_prompt,
            }
        )
        item_mapping[mat_id] = {
            "kind": "material",
            "nama": nama,
            "area": area,
            "rarity": rarity,
            "kategori": kategori,
            "elemen": elemen,
            "visual_key": visual_key,
            "filename": f"materials/{rel_filename}",
            "fx": RARITY_FX.get(rarity, RARITY_FX["Common"]),
        }

    # 3. Extract 480 Trophies (either 480 unique or 23 base parts)
    trf_entries_dict: dict[str, dict[str, Any]] = {}
    rows_t = list(wb["Trofi Monster"].iter_rows(values_only=True))
    for r in rows_t[4:]:
        if not r or not r[0]:
            continue
        trf_id = str(r[0]).strip()
        nama = str(r[1]).strip()
        spesies = str(r[2]).strip()
        area = str(r[3]).strip()
        famili = str(r[8]).strip()
        bagian = str(r[10]).strip()
        rarity = str(r[11]).strip()
        elemen = str(r[12] or "-").strip()

        if trophy_mode == "parts":
            visual_key = f"trf_part_{slugify(bagian)}"
            rel_filename = f"base_parts/{visual_key}.webp"
            if visual_key not in trf_entries_dict:
                part_desc = TROPHY_PART_VISUALS.get(bagian, f"monster trophy {bagian.lower()}")
                style = ITEM_STYLE_PRESETS[style_key]
                prompt = f"Monster Trophy {bagian}, {part_desc}, classic dark fantasy crafting trophy icon, {style['prefix']}"
                trf_entries_dict[visual_key] = {
                    "visual_key": visual_key,
                    "filename": rel_filename,
                    "display_name": f"Trophy Base: {bagian}",
                    "tipe": "Trofi Dasar",
                    "area": "All Areas",
                    "bagian": bagian,
                    "seed": stable_seed(visual_key),
                    "prompt": prompt,
                    "negative_prompt": style["negative"],
                }
        else:
            visual_key = f"trf_{slugify(trf_id)}_{slugify(nama)}"
            rel_filename = f"{slugify(area)}/{visual_key}.webp"
            prompt, neg_prompt = build_trophy_prompt(
                style_key=style_key,
                nama=nama,
                spesies=spesies,
                area=area,
                famili=famili,
                bagian=bagian,
                rarity=rarity,
                elemen=elemen,
            )
            trf_entries_dict[visual_key] = {
                "visual_key": visual_key,
                "id": trf_id,
                "filename": rel_filename,
                "display_name": nama,
                "tipe": f"Trofi ({rarity})",
                "area": area,
                "spesies": spesies,
                "famili": famili,
                "bagian": bagian,
                "rarity": rarity,
                "elemen": elemen,
                "seed": stable_seed(visual_key),
                "prompt": prompt,
                "negative_prompt": neg_prompt,
            }

        item_mapping[trf_id] = {
            "kind": "trophy",
            "nama": nama,
            "spesies": spesies,
            "area": area,
            "bagian": bagian,
            "rarity": rarity,
            "elemen": elemen,
            "visual_key": visual_key,
            "filename": f"trophies/{rel_filename}",
            "fx": RARITY_FX.get(rarity, RARITY_FX["Uncommon"]),
        }

    mat_manifest = {
        "source_file": xlsx_path.name,
        "asset_type": "materials",
        "style": style_key,
        "total_unique_images": len(mat_entries),
        "total_monsters_covered": len(mat_entries),
        "entries": mat_entries,
    }
    trf_manifest = {
        "source_file": xlsx_path.name,
        "asset_type": "trophies",
        "trophy_mode": trophy_mode,
        "style": style_key,
        "total_unique_images": len(trf_entries_dict),
        "total_monsters_covered": sum(1 for v in item_mapping.values() if v["kind"] == "trophy"),
        "entries": list(trf_entries_dict.values()),
    }
    mapping_doc = {
        "source_file": xlsx_path.name,
        "total_materials": len(mat_entries),
        "total_trophies": sum(1 for v in item_mapping.values() if v["kind"] == "trophy"),
        "trophy_mode": trophy_mode,
        "items": item_mapping,
    }
    return mat_manifest, trf_manifest, mapping_doc


def main() -> None:
    parser = argparse.ArgumentParser(description="Bangun manifest visual Material (208) & Trofi Monster (480 / 23).")
    parser.add_argument("--xlsx", type=Path, default=DEFAULT_XLSX)
    parser.add_argument("--style", choices=list(ITEM_STYLE_PRESETS.keys()), default="dark_fantasy")
    parser.add_argument(
        "--trophy-mode",
        choices=["full", "parts"],
        default="full",
        help="'full' = 480 ikon trofi unik per spesies (default), 'parts' = hanya 23 ikon dasar Bagian.",
    )
    parser.add_argument("--out-materials", type=Path, default=DEFAULT_MAT_MANIFEST)
    parser.add_argument("--out-trophies", type=Path, default=DEFAULT_TRF_MANIFEST)
    parser.add_argument("--out-mapping", type=Path, default=DEFAULT_ITEM_MAPPING)
    args = parser.parse_args()

    mat_manifest, trf_manifest, mapping_doc = extract_all(args.xlsx, args.style, args.trophy_mode)

    for p in (args.out_materials, args.out_trophies, args.out_mapping):
        p.parent.mkdir(parents=True, exist_ok=True)

    args.out_materials.write_text(json.dumps(mat_manifest, indent=2, ensure_ascii=False), encoding="utf-8")
    args.out_trophies.write_text(json.dumps(trf_manifest, indent=2, ensure_ascii=False), encoding="utf-8")
    args.out_mapping.write_text(json.dumps(mapping_doc, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"Style            : {args.style}")
    print(f"Material unik    : {mat_manifest['total_unique_images']} -> {args.out_materials}")
    print(f"Trofi ({args.trophy_mode:5s})    : {trf_manifest['total_unique_images']} -> {args.out_trophies}")
    print(f"Mapping gabungan : {len(mapping_doc['items'])} item -> {args.out_mapping}")


if __name__ == "__main__":
    main()
