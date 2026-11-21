# Panduan Standar Folder & Format Aset — Battle-Smith RPG

Dokumen ini menjadi acuan tunggal penamaan file, format gambar/audio, resolusi, dan penempatan folder di dalam `assets/`. Seluruh standar dirancang agar **100% offline**, terhubung otomatis ke manifest JSON di `data/`, dan menjaga pemakaian RAM **< 150 MB di HP Oppo A54 (`WD-6.01`)** sekaligus tampil tajam di **Laptop ASUS ROG GL553VD**.

---

## 1. Struktur Folder Resmi

```text
assets/
├── monsters/<area_id>/        # 544 gambar unik (480 Spesies + 48 Mini Boss + 16 Boss)
├── materials/<area_id>/       # 208 ikon bahan crafting (13 per area x 16 area)
├── trophies/<area_id>/        # 480 ikon trofi Galeri Bengkel (atau 23 dasar bagian)
├── sprites/
│   ├── hero/                  # Sprite sheet / cutout karakter utama (Pandai Besi)
│   ├── companions/            # Sprite sheet / cutout 5 slot murid Companion
│   └── npcs/                  # Sprite sheet / cutout 16 Core Key NPC & warga kota
├── weapons/                   # 48 senjata Paperdoll (tangan karakter + ikon bengkel)
├── armors/                    # 5 slot armor x 3 kelas bahan (Ringan, Sedang, Berat)
├── vfx/                       # Efek 6 Elemen + Neutral, Interrupt, Crit, AoE, Pillar
├── env/
│   ├── shared/                # Properti & tekstur umum (anvil, lentera, portal, peti)
│   └── <area_id>/             # Tekstur lantai seamless, pohon, batu, & dermaga tiap area
├── ui/
│   ├── skills/                # Ikon 25 Active/Buff Skill (5 Smith Class) + 29 Kartu Destiny
│   ├── factions/              # Emblem 11 Faksi Wilayah + 3 Organisasi Netral/Aktif
│   └── elements/              # Ikon 6 Elemen (Fire, Ice, Lightning, Earth, Light, Dark) + Neutral
└── audio/
    ├── sfx/                   # Efek suara pendek (palu tempa, tebasan, interrupt, portal)
    └── bgm/                   # Musik latar looping ringan per suasana (desa, pantai, boss)
```

---

## 2. Aturan Format, Resolusi & Ukuran File (Ramah Oppo A54)

| Folder | Format Wajib | Latar Belakang | Resolusi Ideal | Target Ukuran / File |
| :--- | :--- | :--- | :--- | :--- |
| `monsters/<area_id>/` | `.webp` (Q 80–85%) | **Transparan (Alpha)** untuk cutout panggung 3D | `512×512` (Boss), `256×256`–`512×512` (Spesies) | `40–85 KB` |
| `materials/<area_id>/` | `.webp` (Q 80%) | **Transparan** | `256×256` | `10–25 KB` |
| `trophies/<area_id>/` | `.webp` (Q 80%) | **Transparan** | `256×256` | `10–25 KB` |
| `sprites/*/` | `.webp` (Q 85%) | **Transparan** (cutout 1×1 atau grid rata) | `256×256` per frame (mis. grid `4×3` = `1024×768`) | `50–160 KB` |
| `weapons/` | `.webp` (Q 85%) | **Transparan**, **gagang di tengah-bawah** | `128×128` atau `256×256` | `8–25 KB` |
| `armors/` | `.webp` (Q 85%) | **Transparan** | `128×128` atau `256×256` | `8–25 KB` |
| `vfx/` | `.webp` (Q 85%) | **Hitam Murni (`#000000`)** untuk efek menyala (*Additive*), atau Transparan untuk asap/tanah | `256×256` per frame (strip `4×1` = `1024×256`) | `15–60 KB` |
| `env/*/` | `.webp` (Q 80%) | Penuh (*Seamless Tileable* untuk lantai) / Transparan untuk prop | `256×256` atau `512×512` | `20–70 KB` |
| `ui/*/` | `.webp` (Q 85%) | **Transparan** | `128×128` (ikon skill/elemen), `256×256` (faksi) | `6–20 KB` |
| `audio/sfx/` | `.ogg` (Opus/Vorbis, Mono) | — | 44.1 kHz, 64–96 kbps | `10–40 KB` |
| `audio/bgm/` | `.ogg` (Vorbis, Stereo) | — | 44.1 kHz, 96–112 kbps | `400–900 KB` |

---

## 3. Konvensi Penamaan File (Wajib `lowercase_snake_case`)

**Aturan ketat:** huruf kecil semua, pemisah hanya underscore (`_`), **tanpa spasi**, tanpa tanda baca khusus (`'`, `-`, `(`, `)`).

1. **Monster (`assets/monsters/<area_id>/`)** — sinkron dengan `data/monsters_visual_manifest.json`:
   - Spesies: `sp_<nama_spesies>.webp` (contoh: `sp_rime_wolf.webp`, `sp_beach_crab.webp`)
   - Mini Boss: `mb_<id_dan_nama>.webp`
   - Boss Area: `boss_<id_dan_nama>.webp` (contoh: `boss_a01_boss_vrokhal_the_glacier_king.webp`)
2. **Material & Trofi** — sinkron dengan `data/materials_visual_manifest.json` & `data/trophies_visual_manifest.json`:
   - Material: `mat_<mat_id>_<nama>.webp`
   - Trofi: `trf_<trf_id>_<nama>.webp`
3. **Sprite Karakter (`assets/sprites/`)** — sinkron dengan `data/vfx_animation_manifest.json`:
   - Karakter Utama: `hero/hero_smith_sheet.webp`
   - Companion: `companions/comp_kael_sheet.webp`
   - NPC: `npcs/npc_brann_sheet.webp`, `npcs/npc_mira_sheet.webp`
   - *Susunan Baris Sprite Sheet Standar (bila memakai multi-frame `cols × 3`)*:
     - **Baris 0 (Atas)**: `idle` (diam / bernapas)
     - **Baris 1 (Tengah)**: `walk` (berjalan)
     - **Baris 2 (Bawah)**: `attack` (menyerang / menempa)
4. **Senjata Paperdoll (`assets/weapons/`)**:
   - Format: `wpn_<stat>_<nama>.webp` (contoh: `wpn_str_kapak_perang.webp`, `wpn_dex_pisau_lempar.webp`, `wpn_int_tongkat_rune.webp`)
   - **Penting untuk animasi ayunan (*Swing Arc*)**: posisikan pegangan/gagang senjata di bagian **tengah-bawah kanvas** mengarah tegak ke atas agar poros putar (`weaponPivot`) di Three.js mengayun mulus!
5. **Armor (`assets/armors/`)**:
   - Format: `arm_<kelas>_<slot>.webp` (`kelas` = `ringan|sedang|berat`; `slot` = `zirah|perisai|helm|sarung|sepatu`)
6. **VFX (`assets/vfx/`)** — sinkron dengan `data/vfx_animation_manifest.json`:
   - Format: `vfx_<jenis>_<elemen_atau_fungsi>.webp` (contoh: `vfx_slash_fire.webp`, `vfx_bolt_lightning.webp`, `vfx_interrupt_shock.webp`, `vfx_aoe_telegraph.webp`)
   - Untuk efek cahaya menyala (*slash, petir, bintang crit, pilar level-up*), gunakan **latar hitam pekat `#000000`** agar `THREE.AdditiveBlending` meluruhkan warna hitam menjadi transparan mulus.
7. **Lingkungan (`assets/env/<area_id>/` & `assets/env/shared/`)**:
   - Lantai berulang: `tile_<permukaan>.webp` (contoh: `tile_cobble.webp`, `tile_sand.webp`, `tile_snow.webp`)
   - Properti panggung: `prop_<objek>.webp` (contoh: `prop_anvil.webp`, `prop_lantern.webp`, `prop_salt_crystal.webp`)
8. **Ikon UI (`assets/ui/`)**:
   - Skill 5 Tipe Smith: `skills/sk_<smith>_t<1-5>_<nama>.webp` (`smith` = `wpn|arm|rng|run|ref`)
   - Kartu Destiny: `skills/dst_<nama_kelas>.webp` (contoh: `skills/dst_spellblade.webp`, `skills/dst_omnismith.webp`)
   - Faksi: `factions/fac_<faction_id>.webp`
   - Elemen: `elements/el_<fire|ice|lightning|earth|light|dark|neutral>.webp`

---

## 4. Cara Menghubungkan & Menguji Aset Baru Tanpa Mengubah Kode

1. Buat atau ekspor gambar sesuai nama di atas (atau cek daftar lengkap di `data/vfx_animation_manifest.json`).
2. Taruh file ke folder yang sesuai di dalam `assets/`.
3. Untuk menguji dan menyetel `Cols × Rows`, `FPS`, `Scale`, `Camera Shake`, atau `Hit-Stop` secara *live* di panggung 3D:
   - Buka prototipe `prototypes/tidewrack_threejs/index.html` → klik tombol **`🎨 VFX Linker`** → pilih slot → unggah gambar Anda → geser slider sampai pas → klik **`💾 Unduh JSON`** lalu ganti file `data/vfx_animation_manifest.json`.
4. **Hapus latar otomatis (untuk 544 monster yang masih berlatar kotak penuh)**: dapat diproses massal di Google Colab memakai `rembg` menjadi `.webp` transparan sebelum disalin ke `assets/monsters/<area_id>/`.
