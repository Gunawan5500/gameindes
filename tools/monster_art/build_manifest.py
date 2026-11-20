#!/usr/bin/env python3
"""Ekstraktor manifest visual & prompt otomatis dari Battle-Smith_RPG_Peta_Dunia_Musuh_v1.xlsx.

Menghasilkan:
1. data/monsters_visual_manifest.json -> 544 entitas unik (480 Spesies + 48 Mini Boss + 16 Boss)
   lengkap dengan prompt terstandarisasi untuk Gemini API (Jalur 2) & Google Colab SDXL (Jalur 4).
2. data/monsters_id_to_visual.json    -> Pemetaan seluruh 4.864 ID musuh ke visual_key & efek Rank.
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
DEFAULT_MANIFEST = ROOT / "data" / "monsters_visual_manifest.json"
DEFAULT_MAPPING = ROOT / "data" / "monsters_id_to_visual.json"

STYLE_PRESETS: dict[str, dict[str, str]] = {
    "dark_fantasy": {
        "prefix": (
            "Dark fantasy RPG monster portrait, hand-painted digital illustration, "
            "rich brushwork, dramatic rim lighting, gritty medieval smithing world aesthetic, "
            "centered single creature, square framing, no text, no watermark, no border, no UI"
        ),
        "negative": (
            "text, watermark, signature, logo, frame, border, card layout, multiple creatures, "
            "collage, split screen, blurry, lowres, deformed anatomy, modern elements, anime chibi"
        ),
    },
    "ink_bestiary": {
        "prefix": (
            "Vintage dark fantasy bestiary illustration, detailed ink crosshatching and woodcut engraving "
            "with subtle muted watercolor wash on aged parchment background, centered single monster, "
            "medieval monster compendium style, no text, no labels, no border"
        ),
        "negative": (
            "text, letters, numbers, labels, watermark, modern digital gloss, 3d render, photo, "
            "multiple creatures, collage, neon colors, frame"
        ),
    },
    "pixel_art": {
        "prefix": (
            "32-bit dark fantasy RPG enemy sprite, crisp pixel art, high-contrast shading, "
            "classic SNES and PlayStation JRPG battle sprite style, centered single monster "
            "on dark muted atmospheric background, no text, no UI, no border"
        ),
        "negative": (
            "blurry, anti-aliased photo, 3d render, text, watermark, UI elements, "
            "multiple sprites, sprite sheet, grid, border"
        ),
    },
}

AREA_BIOMES: dict[str, str] = {
    "Hollowfrost Range": "frozen snow-covered mountain peaks, glacial mist, icy blue lighting",
    "Cinderwatch Isles": "foggy volcanic rocky islands, storm-lit sea cliffs, crackling overcast sky",
    "Greymoor Downs": "windswept misty highland moors, pale heather grass, eerie twilight haze",
    "Blackmere Fens": "dark sunken bog and murky swamp waters, toxic green mist, gnarled roots",
    "Elderwake Grove": "ancient colossal forest, glowing golden-emerald sunbeams, mossy giant trees",
    "Rustleaf Weald": "autumnal decaying forest, crimson and rust-orange leaves, acidic damp fog",
    "Hollowbarrow Highlands": "barren tomb-dotted hills and cold dark lakes, ghostly pale mist",
    "Saltgrave Coast": "stormy shipwreck coastline, jagged sea rocks, crashing grey waves",
    "Briarfall Marches": "thorny borderland plains and tangled bramble woods, overcast dusk sky",
    "Bonethorn Peninsula": "dense primeval peninsula jungle with bone-white thorns, arcane violet haze",
    "Wyrmspine Mountains": "jagged snowbound dragon-ridge mountains, storm clouds and lightning glow",
    "Ashwind Steppe": "barren ash-swept steppe and pale salt lakes, dusty amber horizon",
    "Frostpine Taiga": "cold northern pine forest, frost-dusted evergreens, crisp winter twilight",
    "Emberwaste": "scorched volcanic desert, glowing magma cracks, drifting embers and smoke",
    "Crownfrost Isle": "isolated frozen fortress island, pale blizzard winds, austere ice citadels",
    "Wraithtide Isles": "remote spectral fog-shrouded islands, ghostly sea mist, moonlit gloom",
}

FAMILY_HINTS: dict[str, str] = {
    "Beast": "feral wild creature with detailed fur, claws, or horns",
    "Humanoid": "armored or weathered humanoid warrior/cultist figure",
    "Undead": "skeletal, withered, or spectral undead horror with tattered remains",
    "Construct": "ancient forged golem or sentinel made of stone, iron, or runes",
    "Plant": "twisted living botanical monster of bark, roots, thorns, or spores",
    "Aquatic": "abyssal amphibious or crustacean sea monster with wet scales or shells",
    "Spirit": "ethereal translucent phantom radiating spectral energy",
    "Insect": "chitinous giant arthropod with sharp mandibles and armored carapace",
    "Elemental": "living manifestation of pure elemental energy and swirling matter",
    "Dragonkin": "scaled draconic reptile with fierce eyes, horns, and predatory posture",
}

ROLE_POSES: dict[str, str] = {
    "Skirmisher": "agile predatory crouching stance, lean silhouette, ready to strike",
    "Brute": "massive hulking muscular build, imposing heavy aggressive posture",
    "Caster": "mystical posture channeling glowing arcane or elemental energy",
    "Tank": "heavily armored thick-hided defensive juggernaut silhouette",
    "Support": "ominous ritualistic aura, holding totem, bell, or glowing sigils",
}

DAMAGE_AURA: dict[str, str] = {
    "Cold": "frost crystals and freezing icy vapor",
    "Fire": "glowing embers, flames, and scorched cracks",
    "Lightning": "crackling electric arcs and storm sparks",
    "Poison": "oozing venomous green miasma and toxic droplets",
    "Acid": "corrosive sizzling emerald slime and fumes",
    "Necrotic": "dark shadowy necrotic wisps and pale ghostly glow",
    "Radiant": "blinding golden-white sacred runes and ethereal light",
    "Psychic": "eerie violet mind-warp distortion and glowing eyes",
    "Thunder": "booming shockwave mist and dark tempest wind",
    "Force": "shimmering arcane kinetic ripples",
}


def slugify(text: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "_", text.strip().lower()).strip("_")
    return slug


def stable_seed(key: str) -> int:
    digest = hashlib.sha256(key.encode("utf-8")).hexdigest()
    return int(digest[:8], 16) % (2**31 - 1)


def build_prompt(
    *,
    style_key: str,
    display_name: str,
    tipe: str,
    area: str,
    wilayah: str,
    famili: str,
    role: str,
    damage_type: str,
    skill_desc: str | None = None,
) -> tuple[str, str]:
    style = STYLE_PRESETS[style_key]
    biome = AREA_BIOMES.get(area, f"{area} dark fantasy wilderness")
    fam_hint = FAMILY_HINTS.get(famili, famili.lower())
    pose = ROLE_POSES.get(role, "menacing combat stance")
    aura = DAMAGE_AURA.get(damage_type, "")

    if tipe == "Boss":
        tier_desc = (
            "colossal legendary apex boss monster, dramatic low-angle composition, "
            "overwhelming ancient presence, intricate battle scars and crown-like features"
        )
    elif tipe == "Mini Boss":
        tier_desc = (
            "formidable veteran mini-boss champion, scarred and intimidating, "
            "elaborate menacing presence"
        )
    else:
        tier_desc = "distinctive RPG monster"

    parts = [
        f"{display_name}, {tier_desc}",
        f"{fam_hint}",
        f"{pose}",
    ]
    if aura:
        parts.append(f"accented with {aura}")
    if skill_desc:
        # Keep only concise thematic cue if boss skill mentions elemental/visual motif
        lower_sk = skill_desc.lower()
        cues = []
        if "blizzard" in lower_sk or "cold" in lower_sk or "es" in lower_sk:
            cues.append("swirling freezing blizzard aura")
        if "api" in lower_sk or "fire" in lower_sk or "lava" in lower_sk or "bara" in lower_sk:
            cues.append("blazing inferno aura")
        if "petir" in lower_sk or "lightning" in lower_sk or "badai" in lower_sk:
            cues.append("crackling storm energy")
        if "racun" in lower_sk or "poison" in lower_sk or "acid" in lower_sk:
            cues.append("toxic venomous aura")
        if "necrotic" in lower_sk or "bayangan" in lower_sk or "roh" in lower_sk:
            cues.append("haunting spectral shadow aura")
        if "tameng" in lower_sk or "armor" in lower_sk or "bertahan" in lower_sk:
            cues.append("heavy impenetrable armor plating")
        if cues:
            parts.append(", ".join(dict.fromkeys(cues)))

    parts.append(f"environment: {biome} ({wilayah})")
    parts.append(style["prefix"])

    return ", ".join(parts), style["negative"]


def rank_visual_fx(rank: int | None, tipe: str) -> dict[str, Any]:
    """Efek visual programatik agar 1 gambar Spesies tampil berbeda di Rank 1-10 & Khusus."""
    if tipe == "Boss":
        return {
            "tier_label": "Boss Area",
            "frame": "boss-legendary",
            "css_filter": "contrast(1.08) saturate(1.12)",
            "scale": 1.08,
            "aura_color": "#e85d04",
        }
    if tipe == "Mini Boss":
        return {
            "tier_label": "Mini Boss",
            "frame": "miniboss-epic",
            "css_filter": "contrast(1.05) saturate(1.08)",
            "scale": 1.04,
            "aura_color": "#f48c06",
        }

    r = int(rank or 1)
    # Subtle progressive shift across Rank 1..10
    brightness = round(0.94 + (r - 1) * 0.015, 3)
    contrast = round(0.95 + (r - 1) * 0.022, 3)
    saturate = round(0.88 + (r - 1) * 0.032, 3)
    scale = round(0.94 + (r - 1) * 0.012, 3)
    is_special = tipe == "Reguler Khusus"

    return {
        "tier_label": f"Rank {r}" + (" (Khusus)" if is_special else ""),
        "frame": "special-epic" if is_special else f"rank-{(r - 1) // 3 + 1}",
        "css_filter": f"brightness({brightness}) contrast({contrast}) saturate({saturate})",
        "scale": scale,
        "aura_color": "#eab308" if is_special else None,
    }


def extract_manifest(xlsx_path: Path, style_key: str) -> tuple[dict[str, Any], dict[str, Any]]:
    wb = openpyxl.load_workbook(xlsx_path, read_only=True, data_only=True)

    # Read Boss sheet for extra skill descriptions
    boss_skills: dict[str, str] = {}
    if "Boss" in wb.sheetnames:
        ws_b = wb["Boss"]
        b_rows = list(ws_b.iter_rows(values_only=True))
        b_header = b_rows[3]
        b_idx = {h: i for i, h in enumerate(b_header) if h}
        skill_col = next((i for h, i in b_idx.items() if "Skill" in str(h)), None)
        for row in b_rows[4:]:
            if not row or not row[0]:
                continue
            if skill_col is not None and row[skill_col]:
                boss_skills[str(row[0]).strip()] = str(row[skill_col]).strip()

    ws = wb["Musuh"]
    rows = list(ws.iter_rows(values_only=True))
    header = rows[3]
    idx = {h: i for i, h in enumerate(header) if h}

    visual_entries: dict[str, dict[str, Any]] = {}
    id_mapping: dict[str, dict[str, Any]] = {}

    for row in rows[4:]:
        if not row or not row[0]:
            continue
        m_id = str(row[idx["ID"]]).strip()
        area = str(row[idx["Area"]]).strip()
        wilayah = str(row[idx["Wilayah"]]).strip()
        tipe = str(row[idx["Tipe"]]).strip()
        nama = str(row[idx["Nama"]]).strip()
        spesies = str(row[idx["Spesies"]]).strip()
        famili = str(row[idx["Famili"]]).strip()
        role = str(row[idx["Role"]]).strip()
        rank = row[idx["Rank"]]
        damage_type = str(row[idx["Tipe damage"]] or "").strip()

        if tipe in ("Boss", "Mini Boss"):
            prefix = "boss" if tipe == "Boss" else "miniboss"
            visual_key = f"{prefix}_{slugify(m_id)}_{slugify(nama)}"
            display_name = nama
        else:
            visual_key = f"sp_{slugify(spesies)}"
            display_name = spesies

        area_slug = slugify(area)
        rel_filename = f"{area_slug}/{visual_key}.webp"

        if visual_key not in visual_entries:
            prompt, neg_prompt = build_prompt(
                style_key=style_key,
                display_name=display_name,
                tipe=tipe,
                area=area,
                wilayah=wilayah,
                famili=famili,
                role=role,
                damage_type=damage_type,
                skill_desc=boss_skills.get(m_id),
            )
            visual_entries[visual_key] = {
                "visual_key": visual_key,
                "filename": rel_filename,
                "display_name": display_name,
                "tipe": "Boss" if tipe == "Boss" else ("Mini Boss" if tipe == "Mini Boss" else "Spesies"),
                "area": area,
                "wilayah": wilayah,
                "famili": famili,
                "role": role,
                "damage_type": damage_type,
                "seed": stable_seed(visual_key),
                "prompt": prompt,
                "negative_prompt": neg_prompt,
            }

        id_mapping[m_id] = {
            "nama": nama,
            "spesies": spesies,
            "area": area,
            "wilayah": wilayah,
            "tipe": tipe,
            "rank": rank if isinstance(rank, int) else None,
            "visual_key": visual_key,
            "filename": rel_filename,
            "fx": rank_visual_fx(rank if isinstance(rank, int) else None, tipe),
        }

    manifest = {
        "source_file": xlsx_path.name,
        "style": style_key,
        "total_unique_images": len(visual_entries),
        "total_monsters_covered": len(id_mapping),
        "counts": {
            "species": sum(1 for v in visual_entries.values() if v["tipe"] == "Spesies"),
            "mini_boss": sum(1 for v in visual_entries.values() if v["tipe"] == "Mini Boss"),
            "boss": sum(1 for v in visual_entries.values() if v["tipe"] == "Boss"),
        },
        "entries": list(visual_entries.values()),
    }

    mapping_doc = {
        "source_file": xlsx_path.name,
        "total_monsters": len(id_mapping),
        "total_unique_images": len(visual_entries),
        "monsters": id_mapping,
    }
    return manifest, mapping_doc


def main() -> None:
    parser = argparse.ArgumentParser(description="Bangun manifest visual 544 monster dari Excel.")
    parser.add_argument("--xlsx", type=Path, default=DEFAULT_XLSX, help="Path file Excel sumber.")
    parser.add_argument(
        "--style",
        choices=list(STYLE_PRESETS.keys()),
        default="dark_fantasy",
        help="Preset gaya visual (default: dark_fantasy).",
    )
    parser.add_argument("--out-manifest", type=Path, default=DEFAULT_MANIFEST)
    parser.add_argument("--out-mapping", type=Path, default=DEFAULT_MAPPING)
    args = parser.parse_args()

    manifest, mapping_doc = extract_manifest(args.xlsx, args.style)

    args.out_manifest.parent.mkdir(parents=True, exist_ok=True)
    args.out_mapping.parent.mkdir(parents=True, exist_ok=True)

    args.out_manifest.write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8")
    args.out_mapping.write_text(json.dumps(mapping_doc, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"Style           : {manifest['style']}")
    print(f"Total unik      : {manifest['total_unique_images']} gambar ({manifest['counts']})")
    print(f"Total musuh     : {manifest['total_monsters_covered']} ID terpetakan")
    print(f"Manifest disimpan: {args.out_manifest}")
    print(f"Mapping disimpan : {args.out_mapping}")


if __name__ == "__main__":
    main()
