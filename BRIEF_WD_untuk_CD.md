# BRIEF WD → CD (v1, 20 November 2026)

Dokumen ini berdiri sendiri. AI CD tidak butuh riwayat percakapan.
Pengirim: chunk World Development (WD, `master_WD_v1.9.md`). Penerima: chunk Character Development & Battle (CD, `master_CD_v3.1.md`).

**Status: SARAN.** Tidak ada isi `master_CD_v3.1.md` yang diubah. Semua keputusan akhir milik pemilik CD dan pengguna. Label: LOCKED = sudah final di WD. USULAN = saran WD.

---

## A. Fakta WD yang sudah LOCKED dan harus dibaca CD

| Topik | Nilai | ID |
|---|---|---|
| Skala | **Mode Full Lv1–150** (bukan demo Lv30) | WD-6.02 |
| Area/Tier | 16 Area, Tier 1–5; Tier t = level `30×(t−1)+1` s.d. `30×t` | WD-1.01, 1.04 |
| Dungeon | 16 dungeon, 100 lantai, portal tiap 10 lantai, milestone lantai 50 | WD-1.04 |
| Musuh | 4.864 musuh mengisi Lv1–150 (tanpa lubang) | WD-6.03, 6.04 |
| Elemen | **6 Elemen + Neutral**: Fire, Ice, Lightning, Earth, Light, Dark, Neutral. `sub_damage_tag` asli tetap disimpan | WD-6.05 |
| Murid | 5 murid maks. Murid ber-`menempa` tinggi bisa menjaga cabang bengkel | WD-3.08, 3.10 |
| Moral | Mulia/Kejam menggeser `loyalitas` murid ±1 | WD-3.13 |
| Istilah | **Resonance** = tahap upgrade Unique (milik CD). **Attunement** = keselarasan elemen-bahan. **Conscience** = bar moral item | WD-4.06 |
| Waktu | Kalender maju hanya saat idle (1 hari = 30 menit idle) | WD-4.09 |
| Idle | Idle = grinding saja (berburu, gold, bahan dasar). Tanpa keputusan moral | WD-4.10 |
| Ekonomi | Pace cepat gold. Trofi Signature: senjata ke-1 jadi trofi Galeri, ke-2 dst boleh dijual | WD-5.09, 5.10 |

File data WD yang bisa dibaca CD: `data/areas/<area_id>.json` (16 file), `data/materials.csv`, `data/trophies.csv`.

---

## B. Temuan dan permintaan keputusan untuk CD

### B1. (Prioritas 1) Cap stat dan poin per level di Lv150, `CD-1.07`
- Rumus sekarang `poin = 13 + 2×(level−1)` memberi **311 poin** di Lv150.
- Jika cap stat 10/20/30/40/50 (tambah 10 per tier), kapasitas 6 stat adalah **300**. Semua stat hampir penuh, build jadi seragam, dan pilihan title/Smith type kehilangan makna.
- **USULAN WD**: +2 poin per level sampai Lv30 (71 poin), lalu **+1 poin per level** sesudahnya. Total Lv150 = 191 dari kapasitas 300 (rata-rata stat sekitar 32).
- Minta CD memutuskan: poin per level setelah Lv30, cap stat tiap tier, dan cap XP/jam (`1.200 + 25/level` menghasilkan 4.200 di Lv150, perlu dicek).

### B2. (Prioritas 1) Kelipatan zona hanya 3 zona, WD punya 5 tier
- `CD-2` kontrak: kelipatan zona ×1 / ×1,5 / ×2,25. Jika diteruskan geometris (×1,5), Tier 4 = ×3,4 dan Tier 5 = ×5,1.
- Di Lv150: damage dasar `1,5 + 0,4×150 = 61,5`; dikali 5,1 sekitar **311** per serangan.
- HP pemain maksimal `20 + 5×50 + 5×5 = 295`. Satu pukulan monster biasa bisa membunuh pemain.
- Beta test CD sudah menemukan "monster terlalu keras di Lv30". Masalahnya membesar di Lv150.
- **USULAN WD**: ganti pengali geometris dengan kenaikan linear/sub-linear, dan atau naikkan HP pemain per tier. Uji ulang di simulator CD.

### B3. (Prioritas 1) Data musuh WD tidak punya HP dan damage
- Tiap musuh di `data/areas/*.json` hanya berisi: `lvl`, `role`, `type`, `fam`, `el`, `sub_el`, `weak`, `sub_weak`, `drops`, `uniq`. **HP dan damage dihitung dari rumus CD.**
- **Role tidak cocok**: WD punya Skirmisher (1.445), Brute (1.053), Caster (1.024), Tank (956), Support (386). CD hanya punya Serang/Bertahan/Seimbang.
- **Tipe tidak cocok**: WD punya Reguler (4.320), Reguler Khusus (480), Mini Boss (48), Boss (16). CD punya Normal/Elit/Boss.
- **Permintaan**: tabel pemetaan 5 role WD dan 4 tipe WD ke pengali HP/damage/dodge/armor CD. Contoh usulan: Tank ke Bertahan, Brute ke Serang, Skirmisher ke Serang dengan dodge tinggi, Caster dan Support perlu aturan baru. Reguler Khusus bisa setara Elit ringan, Mini Boss setara Elit berat.

### B4. Elemen dan kelemahan
- `punya_kelemahan` di `monster_stats.csv` masih placeholder. Resist armor "sedang +5%" masih menunggu elemen.
- WD sudah menyediakan: elemen tiap musuh (`el`), kelemahannya (`weak`), dan 6 elemen utama.
- **USULAN WD**: CD memakai 6 elemen WD apa adanya. Resist armor sedang +5% dibuat per elemen. Kelemahan musuh diambil dari kolom `weak`, bukan placeholder Y/N.

### B5. Murid (`CD-6.01`)
- WD memakai dari CD: `bakat`, `laju belajar`, `loyalitas`, dan batas 5 murid.
- **Butuh dari CD**: skala numerik tiap atribut (disarankan 0–100) dan status batas 5 murid (masih USULAN) menjadi LOCKED atau diubah.
- WD memakai `bakat/skill` di rumus cap cabang: `cap = min(A, C)` dengan persen 15–60% dan rasio 3–8% (WD-4.13).
- **Parkir ke CD**: companion yang ikut bertempur, ujian murid, dan pewarisan toko.

### B6. Waktu progres Lv150 vs pace WD
- `CD-1.06`: waktu minimum idle Lv30 = 72 jam. Tidak ada target untuk Lv150.
- WD-4.09: tiap 60 jam idle = 1 tahun kalender. Jika Lv150 butuh ribuan jam, pemain melewati puluhan tahun.
- **Permintaan**: tetapkan target total jam idle sampai Lv150 (**USULAN WD: 600–900 jam**) sebelum mengunci kuota XP `60×L^1,1`.

### B7. Kerapian dokumen
- Ubah label "demo Lv30" di kontrak lintas chunk menjadi Full Lv1–150 (pada bagian 2).
- Samakan ejaan UI: **Resonance** untuk tahap upgrade Unique.
- "Resonance Hammer" (trigger INT di bagian 4) berbeda arti dari Resonance (tahap upgrade). Cukup ganti namanya atau beri catatan.

---

## C. Urutan kerja yang disarankan untuk CD
1. B1 (cap stat dan poin per level) dan B6 (target jam).
2. B2 (kelipatan zona 5 tier).
3. B3 (pemetaan role/tipe) dan B4 (elemen).
4. B5 (skala murid).
5. B7 (rapikan dokumen).

## D. Yang WD janjikan
- WD tidak mengubah `master_CD_v3.1.md` dan tidak mengubah nilai LOCKED CD.
- WD akan menyesuaikan data WD jika CD mengubah skala atau pemetaan, dan akan melaporkannya sebagai KONFLIK jika bentrok.
