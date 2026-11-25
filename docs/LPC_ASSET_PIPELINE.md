# Panduan Dual-Tier Universal LPC Asset Pipeline (HP Oppo A54 + Laptop)

Battle-Smith RPG mendukung **Universal-LPC-Spritesheet-Character-Generator** secara langsung melalui 1 katalog resep bersama ([`tools/lpc_recipes.json`](../tools/lpc_recipes.json)) dan 1 skrip pipeline ([`tools/lpc_pipeline.py`](../tools/lpc_pipeline.py)).

## 1. Pembagian Hibrida (LPC vs Monster Khusus)
- **Dari Universal LPC (`lpc_pipeline.py`):**
  - Hero Battle-Smith (`hero_smith_5f.webp` + `avatar_hero.webp`)
  - 5 Murid AI Seed (`Kael, Lyra, Garrick, Vesper, Thorne` → `portrait_*.webp` + `apprentice_*_5f.webp`)
  - Monster Humanoid / Bandit / Cultist (`enemy_humanoid_5f.webp`)
  - Monster Undead / Skeleton / Lich (`enemy_undead_5f.webp`)
  - Monster Orc / Goblin / Lizard (`enemy_orc_5f.webp`)
  - Boss Humanoid / Warlord (`boss_humanoid_5f.webp`)
- **Dari Asset Khusus (Non-LPC):**
  - Beast berkaki empat (Serigala/Beruang), Flora (*Treant*), Wyrm/Dragon, & Boss Titan Non-Humanoid (`enemy_beast_5f.webp`, `boss_titan_5f.webp`).

## 2. Tahap 1 — Build untuk HP Android Oppo A54 (APK Ringan)
Jalankan dari root repo `gameindes/` dengan menunjuk folder lokal `Universal-LPC-Spritesheet-Character-Generator` di laptop Anda:

```bash
python3 tools/lpc_pipeline.py \
  --lpc-dir "D:/path/ke/Universal-LPC-Spritesheet-Character-Generator" \
  --mode stage1
```

Hasilnya langsung menimpa sprite 5-frame (`320×64` `.webp`) & potret (`96×96` `.webp`) di `app/assets/` + otomatis membuat `app/assets/CREDITS_LPC.txt` (atribusi CC-BY-SA 3.0).

## 3. Tahap 2 — Live Procedural Mini-Pack untuk Laptop
Untuk mengaktifkan komposit layer NPC acak secara *live* di Laptop (tetap 100% sinkron dengan Sparse Save HP):

```bash
python3 tools/lpc_pipeline.py \
  --lpc-dir "D:/path/ke/Universal-LPC-Spritesheet-Character-Generator" \
  --mode stage2
```

Atau jalankan Tahap 1 + Tahap 2 sekaligus dengan `--mode both`.

## 4. Impor 1 File PNG Hasil Ekspor Manual dari Web LPC
Jika Anda mendesain 1 karakter khusus di web generator LPC lalu mengunduh file `.png`-nya:

```bash
python3 tools/lpc_pipeline.py \
  --mode import-png \
  --png "C:/Downloads/hero_custom.png" \
  --id hero_smith \
  --dir right \
  --anim slash
```

## 5. Rebuild Preview Offline & Sync ke APK
```bash
npm run verify:capacitor
npm run build:preview
npm run cap:sync
```
