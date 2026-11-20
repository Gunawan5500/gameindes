# Generator Gambar Monster, Material & Trofi — Battle-Smith RPG

Toolkit ini mengubah master data di `Battle-Smith_RPG_Peta_Dunia_Musuh_v1.xlsx` menjadi paket manifest prompt siap generate untuk seluruh aset visual game:

| Paket Aset | Sumber Sheet Excel | Jumlah Data Asli | Jumlah Gambar Unik | Manifest JSON |
| :--- | :--- | ---: | ---: | :--- |
| **Monster** | `Musuh` + `Boss` | 4.864 musuh | **544 gambar** (480 Spesies + 48 Mini Boss + 16 Boss) | `data/monsters_visual_manifest.json` |
| **Material Crafting** | `Material` + `Properti Material` | 208 material | **208 ikon** (13 per area × 16 area) | `data/materials_visual_manifest.json` |
| **Trofi Monster** | `Trofi Monster` | 480 trofi | **480 ikon** (atau **23 ikon dasar `Bagian`** dengan `--trophy-mode parts`) | `data/trophies_visual_manifest.json` |

Mapping ID ke file gambar & efek visual CSS (Rank 1–10, `Reguler Khusus`, dan warna Rarity Common–Legendary) tersedia di:
- `data/monsters_id_to_visual.json`
- `data/materials_id_to_visual.json`

---

## Catatan Penting Tentang Langganan Gemini Pro
Langganan **Gemini Pro / Google AI Pro** berlaku untuk aplikasi web Gemini (dan benefit Google Drive/Colab), sedangkan **Gemini API di Google AI Studio memakai kuota API terpisah**.
- **Jalur 4 (Google Colab GPU T4 Gratis):** paling mudah & **Rp 0** untuk seluruh paket (~25–35 menit untuk 544 monster, ~10 menit untuk 208 material, ~20 menit untuk 480 trofi).
- **Jalur 2 (Google Gemini API):** cocok jika punya API key di [Google AI Studio](https://aistudio.google.com/apikey)—bisa dipakai penuh atau khusus untuk item/boss paling penting (`--boss-only` atau `materials`).

---

## Cara Pakai Jalur 4 — Google Colab (Gratis, 1 Notebook untuk Semua)
1. Buka [Google Colab](https://colab.research.google.com/) → **File → Upload notebook** → pilih `tools/monster_art/colab_generate_monsters.ipynb`.
2. Ubah runtime ke GPU: **Runtime → Change runtime type → T4 GPU**.
3. Di Sel 2, pilih dropdown `ASSET_PACK`: `'monsters'`, `'materials'`, atau `'trophies'`.
4. Jalankan Sel 1–5 (di Sel 3 upload file `*_visual_manifest.json` yang sesuai dari folder `data/`).
5. Default-nya menyaring `AREA_FILTER = 'Hollowfrost Range'` untuk uji coba cepat (~2 menit). Kosongkan `AREA_FILTER = ''` untuk men-generate semua area (**auto-resume** aktif).
6. Jalankan Sel 6 untuk membuat `.zip` di Google Drive lalu ekstrak ke `assets/monsters/`, `assets/materials/`, atau `assets/trophies/`.

---

## Cara Pakai Jalur 2 — Google Gemini API
```bash
pip install google-genai pillow
export GEMINI_API_KEY="AIza..."

# 1. Monster (544 unik, 512x512)
python3 tools/monster_art/generate_gemini_api.py --area "Hollowfrost Range"
python3 tools/monster_art/generate_gemini_api.py --boss-only

# 2. Material Crafting (208 unik, 256x256 agar ringan)
python3 tools/monster_art/generate_gemini_api.py \
  --manifest data/materials_visual_manifest.json \
  --out-dir assets/materials \
  --size 256 \
  --area "Hollowfrost Range"

# 3. Trofi Monster (480 unik / 23 dasar, 256x256)
python3 tools/monster_art/generate_gemini_api.py \
  --manifest data/trophies_visual_manifest.json \
  --out-dir assets/trophies \
  --size 256 \
  --area "Hollowfrost Range"
```

---

## Mengganti Gaya Visual atau Mode Trofi Hemat
```bash
# Ganti gaya monster (dark_fantasy | ink_bestiary | pixel_art)
python3 tools/monster_art/build_manifest.py --style ink_bestiary

# Ganti gaya material & trofi, atau pakai mode hemat 23 ikon dasar Bagian untuk trofi:
python3 tools/monster_art/build_materials_manifest.py --style dark_fantasy --trophy-mode parts
```
