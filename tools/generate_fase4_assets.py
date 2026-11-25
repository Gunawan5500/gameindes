#!/usr/bin/env python3
"""
Battle-Smith RPG — Fase 4 Offline Asset Generator (.webp 5-Frame Sprites, UI, & .ogg SFX)
Menghasilkan asset 2D RPG ringan ramah RAM Oppo A54 (< 150 MB, total aset < 100 KB).
"""
import math
import os
import random
import struct
import subprocess
import tempfile
import wave
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_SPRITES = os.path.join(ROOT, "app", "assets", "sprites")
OUT_UI = os.path.join(ROOT, "app", "assets", "ui")
OUT_AUDIO = os.path.join(ROOT, "app", "assets", "audio")

os.makedirs(OUT_SPRITES, exist_ok=True)
os.makedirs(OUT_UI, exist_ok=True)
os.makedirs(OUT_AUDIO, exist_ok=True)


# ---------------------------------------------------------------------------
# 1. HELPER GAMBAR SPRITE 5-FRAME (320x64 = 5 x 64x64)
# ---------------------------------------------------------------------------
def save_webp(img, path, quality=82):
    img.save(path, "WEBP", quality=quality, method=6)
    return os.path.getsize(path)


def draw_shadow(d, cx, cy, rx=16, ry=5):
    d.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=(8, 12, 20, 145))


def draw_hero_frame(img, ox, frame):
    """5-frame Battle-Smith Hero: idle -> windup -> lunge -> hammer/blade strike -> follow-through."""
    d = ImageDraw.Draw(img, "RGBA")
    bob = [0, -2, -1, 1, 0][frame]
    lunge = [0, -3, 5, 9, 3][frame]
    cx = ox + 28 + lunge
    cy = 48 + bob

    draw_shadow(d, ox + 30 + lunge // 2, 56, 15, 4)

    # Cloak / Cape (deep navy-teal)
    cape_dx = [-4, -8, -10, -12, -6][frame]
    d.polygon([
        (cx - 5, cy - 22),
        (cx + 3, cy - 22),
        (cx + cape_dx + 2, cy - 1),
        (cx + cape_dx - 9, cy - 3),
    ], fill=(22, 78, 99, 255), outline=(10, 32, 46, 255))

    # Boots & legs
    leg_spread = [0, 2, 5, 6, 2][frame]
    d.rectangle([cx - 7 - leg_spread // 2, cy - 9, cx - 2 - leg_spread // 2, cy + 5], fill=(45, 55, 72, 255), outline=(15, 23, 42, 255))
    d.rectangle([cx + 2 + leg_spread // 2, cy - 9, cx + 7 + leg_spread // 2, cy + 5], fill=(55, 65, 81, 255), outline=(15, 23, 42, 255))

    # Armored torso + leather smith apron
    d.rounded_rectangle([cx - 9, cy - 24, cx + 9, cy - 7], radius=3, fill=(71, 85, 105, 255), outline=(15, 23, 42, 255))
    d.rectangle([cx - 6, cy - 16, cx + 6, cy - 6], fill=(146, 64, 14, 255), outline=(69, 26, 3, 255))
    # Glowing forge core emblem on chest
    d.ellipse([cx - 3, cy - 21, cx + 3, cy - 15], fill=(245, 158, 11, 255), outline=(254, 243, 199, 255))

    # Head + Helmet
    d.ellipse([cx - 7, cy - 37, cx + 7, cy - 23], fill=(243, 205, 174, 255), outline=(30, 41, 59, 255))
    # Visor helmet
    d.pieslice([cx - 8, cy - 39, cx + 8, cy - 25], 180, 360, fill=(100, 116, 139, 255), outline=(15, 23, 42, 255))
    d.rectangle([cx - 8, cy - 33, cx + 8, cy - 30], fill=(217, 119, 6, 255))
    # Eyes
    d.rectangle([cx + 1, cy - 30, cx + 3, cy - 28], fill=(15, 23, 42, 255))
    d.rectangle([cx + 4, cy - 30, cx + 6, cy - 28], fill=(56, 189, 248, 255))

    # Offhand Shield
    d.rounded_rectangle([cx - 14, cy - 22, cx - 7, cy - 10], radius=2, fill=(30, 64, 175, 255), outline=(147, 197, 253, 255))
    d.line([cx - 11, cy - 20, cx - 11, cy - 12], fill=(251, 191, 36, 255), width=2)

    # Weapon: Runic Forge Hammer / Blade swinging across 5 frames
    # Angles: rest, raised back, overhead, forward smash, follow-through
    angles = [-0.55, -1.9, -1.1, 0.25, 0.7]
    ang = angles[frame]
    hx = cx + 6
    hy = cy - 16
    tx = int(hx + math.cos(ang) * 20)
    ty = int(hy + math.sin(ang) * 20)
    d.line([hx, hy, tx, ty], fill=(180, 83, 9, 255), width=3)
    # Hammer/Blade head
    px = int(-math.sin(ang) * 5)
    py = int(math.cos(ang) * 5)
    d.polygon([
        (tx - px, ty - py),
        (tx + px, ty + py),
        (tx + px + int(math.cos(ang) * 7), ty + py + int(math.sin(ang) * 7)),
        (tx - px + int(math.cos(ang) * 7), ty - py + int(math.sin(ang) * 7)),
    ], fill=(226, 232, 240, 255), outline=(245, 158, 11, 255))

    # Slash / Spark arc on frames 2 & 3
    if frame == 2:
        d.arc([cx - 4, cy - 42, cx + 28, cy - 4], 270, 355, fill=(253, 224, 71, 210), width=3)
    elif frame == 3:
        d.arc([cx - 2, cy - 38, cx + 30, cy + 2], 290, 45, fill=(251, 191, 36, 245), width=4)
        d.arc([cx + 2, cy - 34, cx + 26, cy - 2], 300, 35, fill=(255, 255, 255, 230), width=2)
        for sx, sy in [(tx + 6, ty - 4), (tx + 9, ty + 3), (tx + 3, ty + 7)]:
            d.ellipse([sx - 2, sy - 2, sx + 2, sy + 2], fill=(254, 240, 138, 255))


def draw_beast_frame(img, ox, frame):
    """5-frame Frost/Steppe Dire Wolf facing left."""
    d = ImageDraw.Draw(img, "RGBA")
    lunge = [0, 3, -6, -9, -2][frame]
    bob = [0, 2, -4, -1, 0][frame]
    cx = ox + 34 + lunge
    cy = 46 + bob

    draw_shadow(d, ox + 32 + lunge // 2, 56, 17, 4)

    # Tail
    tail_y = [0, -3, -6, -2, 1][frame]
    d.polygon([(cx + 12, cy - 10), (cx + 22, cy - 16 + tail_y), (cx + 19, cy - 6 + tail_y)], fill=(100, 116, 139, 255), outline=(15, 23, 42, 255))

    # Legs
    step = [0, -3, 6, 4, -1][frame]
    d.line([cx - 9, cy - 4, cx - 12 - step, cy + 8], fill=(71, 85, 105, 255), width=4)
    d.line([cx - 3, cy - 4, cx - 4 + step, cy + 8], fill=(100, 116, 139, 255), width=4)
    d.line([cx + 6, cy - 4, cx + 8 + step, cy + 8], fill=(71, 85, 105, 255), width=4)
    d.line([cx + 12, cy - 4, cx + 15 - step, cy + 8], fill=(100, 116, 139, 255), width=4)

    # Body
    d.ellipse([cx - 14, cy - 18, cx + 16, cy - 1], fill=(148, 163, 184, 255), outline=(30, 41, 59, 255))
    # Frost mane spikes
    d.polygon([(cx - 12, cy - 16), (cx - 4, cy - 26), (cx + 3, cy - 16)], fill=(186, 230, 253, 255), outline=(30, 41, 59, 255))
    d.polygon([(cx - 2, cy - 16), (cx + 6, cy - 23), (cx + 10, cy - 14)], fill=(125, 211, 252, 255), outline=(30, 41, 59, 255))

    # Head facing left
    hx, hy = cx - 15, cy - 17
    d.ellipse([hx - 8, hy - 8, hx + 8, hy + 7], fill=(148, 163, 184, 255), outline=(15, 23, 42, 255))
    # Ears
    d.polygon([(hx - 3, hy - 7), (hx - 6, hy - 15), (hx + 1, hy - 8)], fill=(71, 85, 105, 255))
    d.polygon([(hx + 2, hy - 7), (hx + 5, hy - 14), (hx + 7, hy - 6)], fill=(100, 116, 139, 255))
    # Snout & glowing eye
    d.polygon([(hx - 6, hy - 2), (hx - 14, hy + 1), (hx - 6, hy + 5)], fill=(203, 213, 225, 255), outline=(15, 23, 42, 255))
    d.rectangle([hx - 5, hy - 3, hx - 2, hy - 1], fill=(244, 63, 94, 255))

    # Claw slash on frame 3
    if frame == 3:
        for i in range(3):
            y0 = cy - 22 + i * 6
            d.line([hx - 16, y0, hx - 6, y0 + 10], fill=(186, 230, 253, 240), width=2)


def draw_undead_frame(img, ox, frame):
    """5-frame Spectral / Golem Undead facing left."""
    d = ImageDraw.Draw(img, "RGBA")
    hover = [0, -3, -5, -2, 1][frame]
    lunge = [0, 2, -4, -8, -2][frame]
    cx = ox + 34 + lunge
    cy = 44 + hover

    draw_shadow(d, ox + 34 + lunge // 2, 56, 14, 4)

    # Tattered ghostly robe
    d.polygon([
        (cx - 10, cy - 22),
        (cx + 10, cy - 22),
        (cx + 14, cy + 6),
        (cx + 5, cy + 2),
        (cx, cy + 8),
        (cx - 6, cy + 2),
        (cx - 14, cy + 6),
    ], fill=(59, 7, 100, 235), outline=(192, 132, 252, 255))

    # Rib / rune core
    glow = [140, 180, 235, 255, 160][frame]
    d.ellipse([cx - 5, cy - 16, cx + 5, cy - 6], fill=(45, 212, 191, glow))

    # Skull / Hooded Head
    d.ellipse([cx - 8, cy - 35, cx + 8, cy - 20], fill=(226, 232, 240, 255), outline=(59, 7, 100, 255))
    d.pieslice([cx - 10, cy - 38, cx + 10, cy - 22], 180, 360, fill=(46, 16, 101, 255), outline=(168, 85, 247, 255))
    # Glowing eyes facing left
    d.rectangle([cx - 6, cy - 29, cx - 3, cy - 26], fill=(45, 212, 191, 255))
    d.rectangle([cx - 1, cy - 29, cx + 2, cy - 26], fill=(45, 212, 191, 255))

    # Spectral Scythe / Orb
    ang = [-2.5, -1.7, -2.2, -3.0, -2.7][frame]
    hx, hy = cx - 8, cy - 14
    tx = int(hx + math.cos(ang) * 18)
    ty = int(hy + math.sin(ang) * 18)
    d.line([hx, hy, tx, ty], fill=(148, 163, 184, 255), width=2)
    d.arc([tx - 9, ty - 9, tx + 9, ty + 9], 120, 260, fill=(45, 212, 191, 255), width=3)

    if frame == 3:
        d.ellipse([cx - 24, cy - 26, cx - 8, cy - 10], outline=(192, 132, 252, 240), width=3)


def draw_humanoid_frame(img, ox, frame):
    """5-frame Raider / Cultist Humanoid facing left."""
    d = ImageDraw.Draw(img, "RGBA")
    lunge = [0, 3, -4, -8, -2][frame]
    bob = [0, -1, -2, 1, 0][frame]
    cx = ox + 34 + lunge
    cy = 48 + bob

    draw_shadow(d, ox + 34 + lunge // 2, 56, 14, 4)

    # Legs
    d.rectangle([cx - 6, cy - 8, cx - 1, cy + 5], fill=(51, 65, 85, 255), outline=(15, 23, 42, 255))
    d.rectangle([cx + 2, cy - 8, cx + 7, cy + 5], fill=(30, 41, 59, 255), outline=(15, 23, 42, 255))

    # Crimson-dark brigandine torso
    d.rounded_rectangle([cx - 8, cy - 23, cx + 8, cy - 7], radius=3, fill=(127, 29, 29, 255), outline=(15, 23, 42, 255))
    d.line([cx - 7, cy - 21, cx + 7, cy - 9], fill=(217, 119, 6, 255), width=2)

    # Hooded Head facing left
    d.ellipse([cx - 7, cy - 36, cx + 7, cy - 23], fill=(226, 185, 154, 255), outline=(15, 23, 42, 255))
    d.pieslice([cx - 9, cy - 38, cx + 9, cy - 22], 180, 360, fill=(69, 10, 10, 255), outline=(220, 38, 38, 255))
    d.rectangle([cx - 5, cy - 30, cx - 2, cy - 28], fill=(251, 191, 36, 255))

    # Curved blade swinging left
    ang = [2.6, 1.4, 2.1, 3.05, 2.8][frame]
    hx, hy = cx - 6, cy - 15
    tx = int(hx + math.cos(ang) * 19)
    ty = int(hy + math.sin(ang) * 19)
    d.line([hx, hy, tx, ty], fill=(226, 232, 240, 255), width=3)
    if frame == 3:
        d.arc([cx - 28, cy - 32, cx - 2, cy - 2], 130, 230, fill=(248, 113, 113, 240), width=3)


def draw_boss_frame(img, ox, frame):
    """5-frame Boss Titan / Gate Guardian facing left (larger silhouette inside 64x64)."""
    d = ImageDraw.Draw(img, "RGBA")
    lunge = [0, 2, -3, -7, -2][frame]
    bob = [0, -2, -4, 2, 0][frame]
    cx = ox + 35 + lunge
    cy = 48 + bob

    draw_shadow(d, ox + 34 + lunge // 2, 57, 20, 5)

    # Fiery / Frost Aura ring behind boss
    aura_r = [22, 24, 27, 25, 22][frame]
    d.ellipse([cx - aura_r, cy - 24 - aura_r // 2, cx + aura_r, cy + 4], outline=(244, 63, 94, 120), width=2)

    # Heavy legs
    d.rectangle([cx - 11, cy - 10, cx - 3, cy + 6], fill=(30, 41, 59, 255), outline=(244, 63, 94, 255))
    d.rectangle([cx + 3, cy - 10, cx + 11, cy + 6], fill=(30, 41, 59, 255), outline=(244, 63, 94, 255))

    # Massive armored chest
    d.rounded_rectangle([cx - 14, cy - 30, cx + 14, cy - 8], radius=4, fill=(51, 65, 85, 255), outline=(251, 191, 36, 255))
    # Shoulder pauldrons with spikes
    d.polygon([(cx - 18, cy - 24), (cx - 14, cy - 36), (cx - 6, cy - 26)], fill=(159, 18, 57, 255), outline=(253, 224, 71, 255))
    d.polygon([(cx + 18, cy - 24), (cx + 14, cy - 36), (cx + 6, cy - 26)], fill=(159, 18, 57, 255), outline=(253, 224, 71, 255))
    # Glowing Boss Core
    d.ellipse([cx - 5, cy - 24, cx + 5, cy - 14], fill=(244, 63, 94, 255), outline=(254, 240, 138, 255))

    # Crowned Helm
    d.rounded_rectangle([cx - 9, cy - 43, cx + 9, cy - 29], radius=3, fill=(15, 23, 42, 255), outline=(251, 191, 36, 255))
    # Crown horns
    d.polygon([(cx - 8, cy - 42), (cx - 12, cy - 52), (cx - 3, cy - 42)], fill=(251, 191, 36, 255))
    d.polygon([(cx + 8, cy - 42), (cx + 12, cy - 52), (cx + 3, cy - 42)], fill=(251, 191, 36, 255))
    d.polygon([(cx - 3, cy - 43), (cx, cy - 50), (cx + 3, cy - 43)], fill=(244, 63, 94, 255))
    # Glowing visor eyes
    d.rectangle([cx - 6, cy - 37, cx - 2, cy - 34], fill=(253, 224, 71, 255))
    d.rectangle([cx + 1, cy - 37, cx + 5, cy - 34], fill=(253, 224, 71, 255))

    # Colossal Greataxe swinging left
    ang = [2.4, 1.15, 1.85, 3.0, 2.7][frame]
    hx, hy = cx - 10, cy - 18
    tx = int(hx + math.cos(ang) * 22)
    ty = int(hy + math.sin(ang) * 22)
    d.line([hx, hy, tx, ty], fill=(120, 53, 15, 255), width=4)
    d.ellipse([tx - 7, ty - 7, tx + 7, ty + 7], fill=(225, 29, 72, 255), outline=(254, 240, 138, 255))

    if frame == 3:
        d.arc([cx - 34, cy - 42, cx - 2, cy + 4], 120, 245, fill=(251, 113, 133, 250), width=4)
        d.arc([cx - 30, cy - 36, cx - 6, cy - 2], 130, 235, fill=(254, 240, 138, 240), width=2)


def generate_sprites():
    specs = [
        ("hero_smith_5f.webp", draw_hero_frame),
        ("enemy_beast_5f.webp", draw_beast_frame),
        ("enemy_undead_5f.webp", draw_undead_frame),
        ("enemy_humanoid_5f.webp", draw_humanoid_frame),
        ("boss_titan_5f.webp", draw_boss_frame),
    ]
    sizes = {}
    for fname, fn in specs:
        sheet = Image.new("RGBA", (320, 64), (0, 0, 0, 0))
        for f in range(5):
            fn(sheet, f * 64, f)
        sizes[fname] = save_webp(sheet, os.path.join(OUT_SPRITES, fname), quality=86)
    return sizes


# ---------------------------------------------------------------------------
# 2. UI ICONS & ARENA BANNERS (.webp)
# ---------------------------------------------------------------------------
def generate_ui_assets():
    sizes = {}

    # A. Hero Avatar (96x96)
    av = Image.new("RGBA", (96, 96), (15, 23, 42, 255))
    d = ImageDraw.Draw(av, "RGBA")
    for y in range(96):
        c = int(18 + (y / 96) * 26)
        d.line([(0, y), (96, y)], fill=(c, c + 12, c + 28, 255))
    # Subtle ember glow behind portrait
    d.ellipse([14, 16, 82, 84], fill=(217, 119, 6, 55))
    # Shoulders & cloak
    d.pieslice([8, 56, 88, 120], 180, 360, fill=(30, 64, 99, 255), outline=(14, 116, 144, 255))
    d.rectangle([28, 66, 68, 96], fill=(71, 85, 105, 255), outline=(15, 23, 42, 255))
    d.ellipse([42, 72, 54, 84], fill=(245, 158, 11, 255), outline=(254, 243, 199, 255))
    # Head & Helmet
    d.ellipse([26, 18, 70, 64], fill=(243, 205, 174, 255), outline=(15, 23, 42, 255))
    d.pieslice([22, 10, 74, 58], 180, 360, fill=(100, 116, 139, 255), outline=(15, 23, 42, 255))
    d.rectangle([22, 32, 74, 39], fill=(217, 119, 6, 255), outline=(120, 53, 15, 255))
    # Eyes
    d.rectangle([36, 42, 43, 47], fill=(15, 23, 42, 255))
    d.rectangle([53, 42, 60, 47], fill=(56, 189, 248, 255))
    # Frame border
    d.rounded_rectangle([2, 2, 93, 93], radius=14, outline=(245, 158, 11, 220), width=3)
    sizes["avatar_hero.webp"] = save_webp(av, os.path.join(OUT_UI, "avatar_hero.webp"), quality=84)

    # B. Forge Anvil Banner (160x90)
    fg = Image.new("RGBA", (160, 90), (20, 12, 10, 255))
    d = ImageDraw.Draw(fg, "RGBA")
    for y in range(90):
        t = y / 90.0
        d.line([(0, y), (160, y)], fill=(int(24 + 55 * t), int(14 + 22 * t), int(14 + 8 * t), 255))
    # Furnace glow
    d.ellipse([30, 8, 130, 82], fill=(234, 88, 12, 70))
    d.ellipse([52, 22, 108, 74], fill=(251, 191, 36, 95))
    # Anvil silhouette
    d.polygon([(40, 56), (122, 56), (112, 66), (52, 66)], fill=(71, 85, 105, 255), outline=(226, 232, 240, 255))
    d.rectangle([62, 66, 98, 76], fill=(51, 65, 85, 255))
    d.polygon([(46, 76), (114, 76), (120, 84), (40, 84)], fill=(30, 41, 59, 255), outline=(148, 163, 184, 255))
    # Glowing ingot on anvil
    d.rounded_rectangle([64, 48, 96, 56], radius=2, fill=(251, 146, 60, 255), outline=(254, 240, 138, 255))
    # Sparks
    rng = random.Random(42)
    for _ in range(18):
        sx = rng.randint(40, 122)
        sy = rng.randint(10, 54)
        d.ellipse([sx - 1, sy - 1, sx + 1, sy + 1], fill=(254, 240, 138, 230))
    sizes["forge_anvil.webp"] = save_webp(fg, os.path.join(OUT_UI, "forge_anvil.webp"), quality=82)

    # C. Wilds Idle Arena Backdrop (360x96)
    bg = Image.new("RGBA", (360, 96), (12, 20, 32, 255))
    d = ImageDraw.Draw(bg, "RGBA")
    for y in range(96):
        t = y / 96.0
        d.line([(0, y), (360, y)], fill=(int(14 + 14 * t), int(26 + 24 * t), int(44 + 26 * t), 255))
    # Moon
    d.ellipse([272, 10, 304, 42], fill=(224, 242, 254, 210))
    d.ellipse([264, 4, 312, 50], outline=(56, 189, 248, 70), width=2)
    # Distant mountains
    d.polygon([(0, 74), (48, 36), (98, 66), (154, 28), (222, 68), (294, 38), (360, 66), (360, 96), (0, 96)], fill=(19, 34, 52, 255))
    d.polygon([(0, 82), (76, 52), (144, 76), (218, 48), (310, 78), (360, 62), (360, 96), (0, 96)], fill=(15, 29, 44, 255))
    # Ground platform
    d.rectangle([0, 74, 360, 96], fill=(20, 42, 54, 255))
    d.line([(0, 74), (360, 74)], fill=(45, 212, 191, 130), width=2)
    # Stars
    rng = random.Random(7)
    for _ in range(24):
        sx, sy = rng.randint(6, 354), rng.randint(4, 42)
        d.point((sx, sy), fill=(226, 232, 240, 200))
    sizes["banner_wilds.webp"] = save_webp(bg, os.path.join(OUT_UI, "banner_wilds.webp"), quality=80)

    # D. Boss Duel Arena Backdrop (360x96)
    bb = Image.new("RGBA", (360, 96), (28, 10, 18, 255))
    d = ImageDraw.Draw(bb, "RGBA")
    for y in range(96):
        t = y / 96.0
        d.line([(0, y), (360, y)], fill=(int(34 + 36 * t), int(10 + 12 * t), int(22 + 14 * t), 255))
    # Ancient Boss Gate arch in center
    d.pieslice([132, 14, 228, 108], 180, 360, fill=(69, 10, 10, 220), outline=(244, 63, 94, 180))
    d.pieslice([148, 28, 212, 102], 180, 360, fill=(159, 18, 57, 130))
    # Cracked obsidian floor
    d.rectangle([0, 74, 360, 96], fill=(32, 16, 24, 255))
    d.line([(0, 74), (360, 74)], fill=(244, 63, 94, 175), width=2)
    # Floating embers
    rng = random.Random(99)
    for _ in range(26):
        sx, sy = rng.randint(8, 352), rng.randint(6, 70)
        d.ellipse([sx - 1, sy - 1, sx + 1, sy + 1], fill=(251, 191, 36, 200))
    sizes["banner_boss_arena.webp"] = save_webp(bb, os.path.join(OUT_UI, "banner_boss_arena.webp"), quality=80)

    return sizes


# ---------------------------------------------------------------------------
# 3. SYNTHESIZED LIGHTWEIGHT .OGG SFX (22050 Hz Mono, ~2-5 KB each)
# ---------------------------------------------------------------------------
SR = 22050


def write_ogg(samples, out_path):
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        wav_path = tmp.name
    try:
        with wave.open(wav_path, "wb") as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)
            wf.setframerate(SR)
            raw = bytearray()
            for s in samples:
                val = max(-1.0, min(1.0, s))
                raw += struct.pack("<h", int(val * 32767))
            wf.writeframes(raw)
        subprocess.run(
            ["oggenc", "-Q", "-q", "2", "-o", out_path, wav_path],
            check=True,
        )
    finally:
        if os.path.exists(wav_path):
            os.remove(wav_path)
    return os.path.getsize(out_path)


def generate_audio():
    sizes = {}
    rng = random.Random(1337)

    # 1. UI Click (0.065s crisp tactile wooden-metal tick)
    n = int(SR * 0.065)
    s_click = []
    for i in range(n):
        t = i / SR
        env = math.exp(-t * 65.0)
        val = (0.65 * math.sin(2 * math.pi * 880 * t) + 0.35 * math.sin(2 * math.pi * 1760 * t)) * env * 0.55
        s_click.append(val)
    sizes["sfx_ui_click.ogg"] = write_ogg(s_click, os.path.join(OUT_AUDIO, "sfx_ui_click.ogg"))

    # 2. Forge Hammer (0.34s metallic anvil ring)
    n = int(SR * 0.34)
    s_hammer = []
    for i in range(n):
        t = i / SR
        env_hit = math.exp(-t * 45.0)
        env_ring = math.exp(-t * 9.5)
        hit = (rng.uniform(-1, 1) * 0.5 + math.sin(2 * math.pi * 220 * t) * 0.5) * env_hit
        ring = (
            0.5 * math.sin(2 * math.pi * 1120 * t)
            + 0.32 * math.sin(2 * math.pi * 1690 * t)
            + 0.18 * math.sin(2 * math.pi * 2540 * t)
        ) * env_ring
        s_hammer.append((hit * 0.5 + ring * 0.65) * 0.7)
    sizes["sfx_forge_hammer.ogg"] = write_ogg(s_hammer, os.path.join(OUT_AUDIO, "sfx_forge_hammer.ogg"))

    # 3. Coin Trade (0.22s bright dual chime)
    n = int(SR * 0.22)
    s_coin = []
    for i in range(n):
        t = i / SR
        c1 = math.sin(2 * math.pi * 1318.5 * t) * math.exp(-t * 18.0)
        c2 = math.sin(2 * math.pi * 1975.5 * max(0.0, t - 0.055)) * math.exp(-max(0.0, t - 0.055) * 16.0) if t >= 0.055 else 0.0
        s_coin.append((c1 * 0.45 + c2 * 0.55) * 0.65)
    sizes["sfx_coin.ogg"] = write_ogg(s_coin, os.path.join(OUT_AUDIO, "sfx_coin.ogg"))

    # 4. Combat Slash (0.22s swoosh + impact thud)
    n = int(SR * 0.22)
    s_slash = []
    for i in range(n):
        t = i / SR
        swoosh = rng.uniform(-1, 1) * math.sin(math.pi * min(1.0, t / 0.14)) * math.exp(-t * 14.0) * 0.45
        freq = 190 - 110 * min(1.0, t / 0.18)
        thud = math.sin(2 * math.pi * freq * t) * math.exp(-t * 20.0) * 0.6
        s_slash.append((swoosh + thud) * 0.7)
    sizes["sfx_slash.ogg"] = write_ogg(s_slash, os.path.join(OUT_AUDIO, "sfx_slash.ogg"))

    # 5. Long Rest (0.42s warm soothing triad)
    n = int(SR * 0.42)
    notes = [(0.0, 392.0), (0.09, 493.88), (0.18, 587.33)]
    s_rest = []
    for i in range(n):
        t = i / SR
        val = 0.0
        for start, f in notes:
            if t >= start:
                dt = t - start
                val += math.sin(2 * math.pi * f * dt) * math.exp(-dt * 7.5) * 0.35
        s_rest.append(val * 0.7)
    sizes["sfx_rest.ogg"] = write_ogg(s_rest, os.path.join(OUT_AUDIO, "sfx_rest.ogg"))

    # 6. Victory Fanfare (0.46s upbeat 4-note brass/chime)
    n = int(SR * 0.46)
    vnotes = [(0.0, 523.25), (0.09, 659.25), (0.18, 783.99), (0.27, 1046.5)]
    s_vic = []
    for i in range(n):
        t = i / SR
        val = 0.0
        for start, f in vnotes:
            if t >= start:
                dt = t - start
                val += (0.7 * math.sin(2 * math.pi * f * dt) + 0.3 * math.sin(2 * math.pi * f * 2 * dt)) * math.exp(-dt * 9.0) * 0.32
        s_vic.append(val * 0.72)
    sizes["sfx_victory.ogg"] = write_ogg(s_vic, os.path.join(OUT_AUDIO, "sfx_victory.ogg"))

    return sizes


def generate_lpc_slot_defaults():
    """Bangkitkan fallback .webp ringan untuk slot LPC (5 Murid AI Seed + Orc + Boss Humanoid).
    Saat user menjalankan tools/lpc_pipeline.py --mode stage1, file-file ini otomatis diganti hasil LPC asli.
    """
    out_portraits = os.path.join(OUT_UI, "portraits")
    os.makedirs(out_portraits, exist_ok=True)
    sizes = {}

    # 5 Murid AI Seed portraits (96x96 .webp)
    apprentices = [
        ("portrait_kael.webp",    (224, 178, 146), (30, 41, 59),   (153, 27, 27),  (251, 191, 36)),  # Weaponsmith
        ("portrait_lyra.webp",    (246, 212, 184), (250, 204, 21), (29, 78, 216),  (56, 189, 248)),  # Runesmith
        ("portrait_garrick.webp", (214, 165, 130), (120, 53, 15),  (71, 85, 105),  (226, 232, 240)), # Armorer
        ("portrait_vesper.webp",  (230, 192, 160), (20, 83, 45),   (22, 101, 52),  (74, 222, 128)),  # Rangesmith
        ("portrait_thorne.webp",  (176, 126, 94),  (148, 163, 184),(127, 29, 29),  (245, 158, 11)),  # Reforger
    ]
    for fname, skin, hair, tunic, accent in apprentices:
        im = Image.new("RGBA", (96, 96), (14, 22, 34, 255))
        d = ImageDraw.Draw(im, "RGBA")
        for y in range(96):
            c = int(16 + (y / 96) * 20)
            d.line([(0, y), (96, y)], fill=(c, c + 10, c + 24, 255))
        # Shoulders
        d.pieslice([10, 56, 86, 122], 180, 360, fill=tunic + (255,), outline=accent + (255,))
        # Head
        d.ellipse([26, 18, 70, 62], fill=skin + (255,), outline=(15, 23, 42, 255))
        # Hair / Hood
        d.pieslice([22, 12, 74, 54], 180, 360, fill=hair + (255,), outline=(15, 23, 42, 255))
        # Eyes
        d.rectangle([36, 40, 42, 45], fill=(15, 23, 42, 255))
        d.rectangle([54, 40, 60, 45], fill=accent + (255,))
        # Emblem
        d.ellipse([43, 72, 53, 82], fill=accent + (255,))
        d.rounded_rectangle([2, 2, 93, 93], radius=14, outline=accent + (210,), width=3)
        sizes[fname] = save_webp(im, os.path.join(out_portraits, fname), quality=82)

    # Orc / Goblin 5-frame sprite (320x64 .webp)
    orc_sheet = Image.new("RGBA", (320, 64), (0, 0, 0, 0))
    for f in range(5):
        d = ImageDraw.Draw(orc_sheet, "RGBA")
        ox = f * 64
        lunge = [0, 2, -4, -8, -2][f]
        bob = [0, -1, -2, 1, 0][f]
        cx, cy = ox + 34 + lunge, 48 + bob
        draw_shadow(d, ox + 34 + lunge // 2, 56, 15, 4)
        d.rectangle([cx - 7, cy - 8, cx - 2, cy + 5], fill=(63, 98, 18, 255), outline=(15, 23, 42, 255))
        d.rectangle([cx + 2, cy - 8, cx + 7, cy + 5], fill=(54, 83, 20, 255), outline=(15, 23, 42, 255))
        d.rounded_rectangle([cx - 10, cy - 25, cx + 10, cy - 7], radius=3, fill=(120, 53, 15, 255), outline=(15, 23, 42, 255))
        d.ellipse([cx - 8, cy - 38, cx + 8, cy - 23], fill=(101, 163, 13, 255), outline=(15, 23, 42, 255))
        # Tusks & eyes
        d.rectangle([cx - 5, cy - 31, cx - 2, cy - 29], fill=(244, 63, 94, 255))
        d.polygon([(cx - 6, cy - 25), (cx - 8, cy - 29), (cx - 4, cy - 25)], fill=(248, 250, 252, 255))
        # Cleaver axe
        ang = [2.5, 1.3, 2.0, 3.05, 2.75][f]
        hx, hy = cx - 7, cy - 16
        tx, ty = int(hx + math.cos(ang) * 19), int(hy + math.sin(ang) * 19)
        d.line([hx, hy, tx, ty], fill=(146, 64, 14, 255), width=3)
        d.ellipse([tx - 5, ty - 5, tx + 5, ty + 5], fill=(203, 213, 225, 255), outline=(15, 23, 42, 255))
    sizes["enemy_orc_5f.webp"] = save_webp(orc_sheet, os.path.join(OUT_SPRITES, "enemy_orc_5f.webp"), quality=84)

    # Humanoid Warlord Boss 5-frame sprite (320x64 .webp)
    hb_sheet = Image.new("RGBA", (320, 64), (0, 0, 0, 0))
    for f in range(5):
        draw_boss_frame(hb_sheet, f * 64, f)
    sizes["boss_humanoid_5f.webp"] = save_webp(hb_sheet, os.path.join(OUT_SPRITES, "boss_humanoid_5f.webp"), quality=84)

    return sizes


if __name__ == "__main__":
    sp = generate_sprites()
    ui = generate_ui_assets()
    au = generate_audio()
    lpc_def = generate_lpc_slot_defaults()
    total = sum(sp.values()) + sum(ui.values()) + sum(au.values()) + sum(lpc_def.values())
    print("Generated Fase 4 + LPC Default Slot Assets:")
    for group_name, d in [
        ("Sprites (.webp 5-frame)", sp),
        ("UI/Banners (.webp)", ui),
        ("Audio (.ogg)", au),
        ("LPC Slot Defaults (5 Murid + Orc + Boss Humanoid)", lpc_def),
    ]:
        print(f"  {group_name}:")
        for k, v in d.items():
            print(f"    - {k}: {v/1024:.2f} KB")
    print(f"TOTAL ASSETS SIZE: {total/1024:.2f} KB")
