# BATTLE-SMITH RPG: MASTER WORLD DEVELOPMENT (WD) v1.0
Dokumen ini berdiri sendiri. AI yang membacanya tidak punya riwayat percakapan sebelumnya. Baca seluruhnya sebelum bekerja.

## 0. Aturan kerja untuk AI pembaca
- **Proyek**: Battle-Smith RPG, game solo idle/RPG pandai besi + petualangan, 100% offline tanpa AI/API saat bermain, target laptop dan HP Oppo A54 (portrait, UI kartu/teks, RAM < 150 MB). Bahasa Indonesia, ringkas, nyaman dibaca di HP.
- **PRJ-01 (LOCKED)**: fokus backend dulu (data, rumus, aturan, simulasi). Frontend/UI ditunda sampai fondasi selesai.
- **Label**: `LOCKED` = sudah disetujui pengguna. `USULAN` = belum dikonfirmasi. `DEMO` = angka sementara. Semua angka bersifat DEMO kecuali disebut lain.
- **Satuan**: `br` = bronze (`1g = 100s = 10.000br`; angka bertuliskan "gold" di file lama dibaca sebagai `br`). `S` = Smith. `Rep` = reputasi.
- **Format diskusi**: Tiap topik beri 2-3 opsi (A/B/C) dengan plus/minus, lalu satu rekomendasi. Maksimal satu pertanyaan per balasan.
- **Aturan kunci**: Usulan yang tidak dikeberatkan pengguna dianggap `LOCKED` dan harus disebut eksplisit. Pilihan pengguna mengalahkan rekomendasi AI.
- **Batas chunk**: Dokumen ini hanya memegang **World Development (WD)**. Jangan mengubah nilai `LOCKED` di [master_CD_v3.1.md](master_CD_v3.1.md) (Character Development & Battle). Bila ada benturan, tandai `KONFLIK` di laporan.
- **Kerahasiaan konten (LOCKED)**: Jangan mengungkap isi hubungan rahasia spesifik antar-lokasi/NPC hasil seed (pengguna ikut bermain).
- **Awal sesi**: sebut 5 nilai `LOCKED` dari dokumen ini untuk membuktikan kamu membaca versi terbaru.
- **Akhir sesi**: tulis Laporan Perubahan memakai format di Bagian 8.

## 1. Pembagian chunk World Development
- **WD-1**: Peta, Geografi, Wilayah, Permukiman, dan Dungeon (16 Area, 48 Wilayah, 77 Lokasi, 16 Dungeon).
- **WD-2**: Faksi, Ras, Politik, Konflik, dan Hierarki Iblis (11 faksi, 5 ras, 5 kota besar, reputasi, matriks hubungan).
- **WD-3**: NPC, Generator, Promosi, dan Hubungan (mix-and-match, 3 jalur promosi, arc, nada bicara, kepribadian berkembang).
- **WD-4**: Narasi, Event Director, Krisis Besar, Kalender, dan Moral Dunia (kartu event, 5 fase krisis, musim/festival, Mulia/Kejam, seed).
- **WD-5**: Ekonomi, Pasar (*Supply & Demand*), Toko, Guild, dan Harga Acuan (rumus S&D, mata uang, harga bahan & senjata tempa, Grade).
- **WD-6**: Ekosistem Dunia & Arsitektur Aset Data (populasi monster/material/trofi per area, pemecahan data & optimasi RAM Oppo A54).
- **Parkir (di luar WD)**: Character Development & Battle (`CD-1` s.d `CD-7`: stat, level, XP, skill, Smith type, perk, senjata, trigger, armor, murid, kutukan, rumus tempur) dikelola terpisah di `master_CD_v3.1.md`.

## 2. Kontrak lintas chunk (baca saja dari `master_CD_v3.1.md`)
- **Skala demo & penuh**: Demo berakhir di Lv30 (Magang Lv1-10, Journeyman Lv11-20, Master Lv21-30). Versi penuh Lv150 (tier tambahan tiap 30 level: Lv31-60, 61-90, 91-120, 121-150).
- **Zona & kelipatan**: Rendah Lv1-10 (`x1`), Sedang Lv11-20 (`x1,5`), Tinggi Lv21-30 (`x2,25`). Pemetaan zona ke tier level dan batas dungeon masih perlu sinkronisasi.
- **Mata uang**: `1g = 100s = 10.000br`.
- **Stat yang menyentuh WD**: `CHA` memengaruhi harga jual, Rep Toko, dan murid (`CD-1.02`); `WIS` memengaruhi penilaian pasar dan drop langka.
- **Idle & stamina**: Idle hanya satu mode (Battle atau Smith), offline cap 8 jam (`CD-7.01`). Idle murni untuk grinding; tidak mengambil keputusan cerita dan tidak mengisi resonansi item moral.
- **Senjata, Smith type & elemen**: 36 senjata (6 stat x 6 tier, tag Dekat/Jauh), 5 Smith type (termasuk Rangesmith), 36 trigger, serta sistem elemen terpisah (mode Terkunci/Fleksibel/Fusi) menjadi pemicu reaksi NPC, pesanan khusus, dan permintaan pasar faksi.

## 3. Keputusan LOCKED

### WD-1 Peta, Wilayah, Permukiman, dan Dungeon
- **WD-1.01**: Struktur dunia terdiri dari 16 Area, 48 Wilayah (3 per area: Rendah Lv1-10, Sedang Lv11-20, Tinggi Lv21-30), 77 permukiman (48 desa, 16 kota kecil, 8 kota sedang, 5 kota besar; kapasitas total 1.376 NPC), dan 16 Dungeon (masing-masing 100 lantai). Di demo hanya dungeon Tier 1 (6 dungeon, Lv1-30) yang aktif; Tier 2-5 (Lv31-150) ditunda ke versi penuh. *(Nama spesifik area/wilayah/dungeon masih USULAN).*
- **WD-1.02**: 5 Kota Besar bersifat multi-ras (ras dominan + minoritas dengan status sosial) dan punya tema sosial tetap: **Briarfall** (distopia), **Saltgrave** (utopia palsu), **Wyrmspine** (diskriminasi berbasis aturan/kepentingan), **Kurultai** (utopia rapuh), **Obsidian** (ketimpangan sosial). Diskriminasi lahir dari aturan & kepentingan dunia, bukan ras baik/jahat.
- **WD-1.03**: Isu kota besar menurun berjenjang ke bawah: Kota Besar (struktur/politik) -> Kota Sedang (penegakan) -> Kota Kecil (dampak pasar) -> Desa (harga manusiawi). Pemain menemui gejala di desa dulu, baru sebabnya di kota belakangan.

### WD-2 Faksi, Ras, Politik, dan Hierarki Iblis
- **WD-2.01**: Terdapat 7+ faksi berjenjang (minor, menengah, mayor), masing-masing memiliki dinamika sendiri (`Q23`). Di peta dunia saat ini tercatat 11 faksi.
- **WD-2.02**: 5 ras ala D&D dipetakan dari 11 faksi: **Manusia** (Briarfall, Saltgrave, Ashwind), **Kurcaci** (Wyrmspine, Penjaga Barrow), **Elf** (Elderwake, Frostpine), **Orc/suku buas** (Thornback, Sisa Mahkota Beku), **Tiefling/berdarah api** (Hierarki Iblis, Emberwaste). Satu ras boleh memiliki faksi yang saling berkonflik.
- **WD-2.03**: Hubungan antar-faksi berubah sendiri seiring waktu (`Q26`). Reputasi pemain dihitung terpisah per faksi (`Q27`).
- **WD-2.04**: Sumber konflik besar bergantian antara Hierarki Iblis/supernatural, perang faksi, serta bencana & serbuan monster (`Q7`). Bisnis pemain yang membesar membuka NPC/toko baru, uang/reputasi, serta wilayah dan faksi baru (`Q8`).

### WD-3 NPC, Generator, Promosi, dan Hubungan
- **WD-3.01**: Jumlah NPC bertambah bertahap (`Q4`). NPC dibangkitkan secara prosedural (*mix and match* tanpa AI) lalu dapat dipromosikan menjadi NPC kunci gaya *Watch Dogs: Legion* (`Q25`).
- **WD-3.02**: Promosi menjadi NPC kunci memakai 3 jalur sekaligus (mana yang terpenuhi duluan): **misi pribadi**, **kedekatan**, atau **bakat menonjol** (`Q28`).
- **WD-3.03**: Hubungan mencakup persahabatan, rivalitas, dan romansa ringan/soft (`Q5`). NPC dapat aktif, sibuk, atau pergi/pindah, tetapi **tidak bisa mati** (`Q6`).
- **WD-3.04**: NPC berperan ganda sebagai pelanggan, pemasok, dan mentor sekaligus (`Q16`). NPC bereaksi pada senjata tempaan pemain lewat komentar, pesanan khusus, dan hubungan/diskon (`Q17`).
- **WD-3.05**: Interaksi dialog menggunakan menu topik (tap) (`Q14`). Kepribadian NPC berkembang perlahan karena peristiwa & hubungan (`Q15`). Kepribadian Smith terbentuk dari 3 nada pilihan: **Ramah**, **Tegas**, **Jenaka** (`Q24`).

### WD-4 Narasi, Event Director, Kalender, dan Moral Dunia
- **WD-4.01**: Game berjalan 100% offline tanpa AI/API saat bermain. Semua cerita dan kejadian berbentuk data kartu (*pop-up* kartu, `Q21`). Struktur cerita dan konsekuensi dunia yang terasa acak dibangkitkan dari **seed per save** (variabel tersembunyi, jejak lewat log Kabar).
- **WD-4.02**: Nada cerita campuran, bergantian sesuai situasi: epik, santai, gelap (`Q1`). Kejutan kecil sering, kejutan besar jarang (`Q9`). Cabang cerita tidak bergantung hidup-mati (`Q3`).
- **WD-4.03**: Prinsip tanpa tekanan waktu: misi datang dari semua sumber (NPC, kondisi dunia, papan misi/Guild, `Q10`), tanpa batas waktu (`Q11`), dan misi/event serta krisis besar **menunggu tanpa konsekuensi** saat idle (`Q12`, `Q13`). Saat idle hanya simulasi latar (pasar, drift faksi, aktivitas NPC) yang berjalan, lalu ditampilkan pada layar ringkasan saat pemain kembali (`Q19`) — dirancang untuk pola main jarang buka, sesi pendek 10-20 menit.
- **WD-4.04**: Kalender lengkap dengan hari, bulan, musim, festival, dan hari besar (`Q20`).
- **WD-4.05**: Moral naratif memakai dua stat terpisah: **Mulia** dan **Kejam**, dengan imbalan semi abu-abu (Mulia = kedekatan NPC baik & warga kecil, biaya gold/bahan/waktu; Kejam = hadiah cepat & akses faksi berkuasa/pasar gelap, biaya NPC/desa menjauh). Tambahan stat moral selalu pasti per pilihan (tidak diundi); momen dibagi Sapaan, Dilema, Titik Balik. Tag nilai berpasangan dengan antonim memicu reaksi NPC otomatis. Konsekuensi fisik terwujud lewat Penyelarasan senjata (item bersyarat stat jadi *dormant* bila sisi lawan lebih besar atau seimbang).

### WD-5 Ekonomi, Pasar, dan Harga
- **WD-5.01**: Ekonomi dinamis penuh memakai *supply and demand* (`Q18`). Harga tidak tetap: `Harga = harga_acuan x pengali_pasar`. Bahan tingkat lebih tinggi harus lebih mahal.
- **WD-5.02**: Mata uang 3 tingkat: `1g = 100s = 10.000br` (`1s = 100br`). Semua angka "gold" di file lama dibaca sebagai `br`.
- **WD-5.03**: Material Common dan Uncommon memakai **Grade I / II / III** (cap mutu saat drop, menumpuk terpisah di gudang) untuk keragaman antar-wilayah tanpa menambah jenis bahan.
- **WD-5.04**: Harga senjata hasil tempaan dipengaruhi: biaya bahan (harga jual terakhir/pasar), nilai kerajinan (Mastery Tempa), mutu (Mastery, stat, dadu mengecil), nilai seni, dan bonus CHA. Mahakarya hanya bisa dicapai dengan bahan langka. Senjata unik bisa dijual, disimpan di galeri, dipakai sendiri, atau diberikan ke NPC.
- **WD-5.05**: Elemen adalah sistem terpisah dari bahan (ditanam lewat Inti Elemen) dan memengaruhi dunia (musim menggeser permintaan elemen, faksi & pelanggan punya afinitas elemen). Mode elemen senjata terdiri dari 3 karakter: **Terkunci**, **Fleksibel**, **Fusi**.

### WD-6 Platform dan Skala Aset Data
- **WD-6.01**: Harus berjalan lancar di laptop dan HP Oppo A54 (RAM < 150 MB, `Q29`). Struktur data disiapkan sampai versi penuh Lv150 (`Q22`), tetapi konten & pemuatan dilakukan bertahap (mulai Demo Lv30).

## 4. USULAN (belum dikonfirmasi)
- **Peta & Dungeon (`v1.xlsx`)**:
  - Nama 16 Area, 48 Wilayah, dan 16 Dungeon (6 aktif demo: Gravebark Warren, Drownedbell Crypts, Thornroot Barrow, Kingless Ossuary, Wailstone Depths, Marrow Warrens).
  - Rumus level lantai dungeon: `30 x (tier - 1) + ROUNDUP(0,3 x lantai)`.
  - Sebaran faksi desa/pos semi-random (~70% faksi dominan area, seed per save); 27 lokasi bertrait *Bertentangan* menjadi kantong faksi/ras asing.
  - Tambahan kolom CSV `Induk` dan `Isu lokal`; 30-45 templat isu berjenjang (5 isu x 3 tingkat x 2-3 wajah).
- **Faksi & Politik**:
  - 5 poros konflik awal dari `Kepentingan` 5 kota besar: (1) Mahkota & perbatasan (Briarfall–Ashwind), (2) Pelabuhan & pajak (Saltgrave–Briarfall), (3) Logam & hutan (Wyrmspine–Elderwake), (4) Api vs Es (Emberwaste vs pengaruh es), (5) Standar vs Fusi (Briarfall & Wyrmspine vs Ashwind & Emberwaste).
  - Matriks hubungan antar-faksi `-100` sampai `+100` dengan drift harian berbobot & ambang kartu (aliansi, perang dingin, embargo, perang terbuka).
  - Reputasi pemain 3 tingkat (Musuh / Netral / Sekutu).
- **NPC & Event Director**:
  - Jenjang prototipe Tidewrack: Warga -> Dikenal (3 pertemuan) -> Calon (maks 5) -> Kunci (maks 12); 8 arc (Mentor, Rival, Sahabat, Pelanggan Setia, Romansa Ringan, Informan, Pemasok Langka, Pelindung); 20 sifat berpasangan; kedekatan 0-99; 30% NPC dari faksi acak.
  - Atribut tambahan NPC: kelas sosial (elit/warga/terpinggir) dan posisi konflik (loyalis/ragu/penengah). Cerita khusus ditulis hanya untuk ~12 NPC kunci dan 5 kota besar.
  - Kapasitas antrean Event Director 3-5 kartu (urutan: festival -> misi/krisis -> kejutan kecil; maks 1 kejutan besar/sesi). Krisis besar berjalan 5 fase (desas-desus, ketegangan, deklarasi, misi khusus, akibat).
  - Skala kalender: 1 hari game = 30 menit nyata (1 tahun 360 hari = 7,5 hari nyata). Simulasi offline detail maks 7 hari game, selebihnya agregat.
- **Ekonomi S&D**:
  - Rumus pasar: `harga = acuan x (D / S)^k`, `k = 0,5`, batas `x0,4` sampai `x2,5`. Pemulihan harga penuh dalam 12 jam nyata (dihitung saat game dibuka).
  - Harga acuan bahan: rasio rarity `1 : 4 : 16 : 60 : 300`, pengali wilayah `x1 / x2,5 / x4`. Kedalaman pasar tipis untuk barang langka.
  - Selisih beli-jual toko: toko beli dari pemain 50-60% harga pasar. Hemat data: state S/D hanya disimpan untuk barang yang pernah diperdagangkan. Harga opsional berbeda per kota (murah di area asal).
  - Harga tempaan: `(0,9 x biaya_bahan + nilai_kerajinan + nilai_seni + nilai_kejutan) x (1 + bonus_CHA) x pengali_pasar`. Bonus CHA `+1%` per poin di atas 10 (batas `+25%`).
- **Ekosistem & Platform**:
  - Data `v1.xlsx`: 4.864 musuh (4.800 reguler, 48 mini boss, 16 boss area Lv32), 208 material (13/area), 480 trofi monster, 19.952 baris drop item.
  - Platform web app/PWA dengan penyimpanan lokal + ekspor/impor file save. Pemecahan database menjadi 16 file per area + 1 file efek bersama, dimuat per tier level.

## 5. Inventaris Aset Data Dunia di Repositori
| File di Repo | Peran dalam WD | Catatan / Masalah Saat Ini |
| :--- | :--- | :--- |
| `Battle-Smith_RPG_Peta_Dunia_Musuh_v1.xlsx` | Database mentah geografi, dungeon, musuh, drop, material, trofi (19 sheet) | 5,3 MB (64 MB *uncompressed*), terlalu berat untuk runtime & AI chat; superset dari 2 file Excel DEMO lama |
| `lokasi_peta_dunia.csv` | 77 permukiman, 11 faksi, kapasitas, trait, kepentingan 5 kota besar | **BUG**: kolom `Level` rusak oleh Excel (`1-10` -> `10-Jan`, `11-20` -> `20-Nov`). Belum ada tabel relasi faksi |
| `Spesifikasi Narasi dan NPC Battle-Smith RPG.docx` | Sumber utama Q1-Q29 (Event Director, NPC, kalender, S&D, elemen) | Memakai daftar lama 9 faksi (bentrok dengan 11 faksi di CSV) |
| `Battle-Smith RPG RPG Naratif-Moral Berbasis Faksi...docx` | Sumber utama 5 ras, tema 5 kota besar, isu berjenjang, moral Mulia/Kejam | Berisi rancangan 6 keluarga senjata (lintas chunk CD) |
| `Laporan Sesi Desain Battle-Smith.docx` | Sumber utama ekonomi S&D, harga bahan & tempaan, Grade I-III | Ada file duplikat identik `Laporan Sesi Desain Battle-Smith(1).docx` |
| `Balai Kenalan Tidewrack_ Prototipe Generator NPC.html` | Prototipe generator NPC & log Kabar | Masih memuat Google Fonts eksternal (perlu font lokal agar 100% offline) |

## 6. KONFLIK & Kosakata yang Perlu Disatukan
1. **Jumlah Faksi (9 vs 11)**: Dokumen Narasi mengusulkan 9 faksi (termasuk Guild Petualang, Persekutuan Pandai Besi, Pasar Gelap), sedangkan `lokasi_peta_dunia.csv` memakai 11 faksi wilayah. Perlu disepakati apakah Guild/Persekutuan/Pasar Gelap menjadi *faksi lintas-wilayah* di luar 11 faksi teritorial.
2. **Istilah "Resonansi" (3 arti)**: Dipakai sekaligus untuk (a) tahap upgrade senjata Unique, (b) keselarasan elemen-bahan saat tempa, dan (c) pengisian bar item moral Mulia/Kejam. Wajib diganti namanya agar tidak membingungkan.
3. **Jumlah Elemen (6 vs 13)**: Dokumen Narasi memakai 6 elemen (api, es, petir, tanah, cahaya, gelap), sedangkan `v1.xlsx` memakai 13 tipe damage ala D&D.
4. **Skala Data Monster & RAM Oppo A54**: `master_CD_v3.1.md` (5b) menyebut 100 monster, sedangkan `v1.xlsx` berisi 4.864 monster unik + 19.952 baris drop. Perlu keputusan arsitektur (unik penuh vs template biome dipakai ulang) agar RAM tetap < 150 MB.
5. **Arti Batas Level Dungeon**: Di `v1.xlsx` berarti level monster maks di lantai 100; di `master_CD_v3.1.md` ada tafsiran pemain di atas batas tidak boleh masuk.
6. **Event Moral "Aktif Saja" vs Sesi Pendek**: Aturan event moral hanya di mode aktif perlu diselaraskan dengan sistem antrean Event Director untuk sesi 10-20 menit.
7. **Lintas Chunk (Parkir ke CD)**: Perbedaan 5 vs 6 tingkat kualitas, serta 36 senjata vs 10 jenis senjata Unique di `v1.xlsx`.

## 7. OPEN (Daftar Keputusan Terbuka WD)
- **WD-1**: Konfirmasi nama 16 Area, 48 Wilayah, dan 16 Dungeon; kepastian arti batas level dungeon; sistem tier antar-area di versi penuh Lv150; perbaikan bug `lokasi_peta_dunia.csv` + penambahan kolom `Induk` dan `Isu lokal`.
- **WD-2**: Kepentingan tertulis untuk 6 faksi non-kota-besar (Sisa Mahkota Beku, Penjaga Barrow, Dewan Elderwake, Hierarki Iblis, Suku Frostpine, Suku Thornback); faksi es pada poros Api vs Es; komposisi ras tiap kota besar; matriks hubungan awal antar-faksi; posisi Guild/Persekutuan/Pasar Gelap; apakah faksi bisa menjadi musuh permanen.
- **WD-3**: Kedalaman fitur romansa ringan; apakah NPC bisa direkrut menjadi pegawai bengkel (atau hanya murid `CD-6.01`/sekutu/pelanggan); potret NPC vs ikon/warna; matriks lengkap sifat NPC ke tag nilai moral.
- **WD-4**: Keputusan final *endless* tanpa ending vs ending opsional + tujuan jangka panjang pemain; konfirmasi skala waktu (1 hari = 30 menit); penamaan dunia & kota awal; penulisan 30-45 templat isu berjenjang; pilihan bahasa teks (ID saja vs dwibahasa).
- **WD-5**: Kalibrasi nominal bronze/silver/gold berbasis waktu menabung (Lv10/20/30) dan daftar *gold sink*; parameter final S&D (`k`, batas harga, kedalaman pasar per rarity, pemulihan 12 jam); definisi "harga jual terakhir" yang tahan eksploitasi; mekanisme harga per kota, embargo, dan perang; apakah Trofi Monster boleh diperdagangkan.
- **WD-6**: Keputusan 100 musuh unik/wilayah vs template biome untuk efisiensi Oppo A54; pemecahan `v1.xlsx` menjadi file data bersih (`data/` CSV/JSON); pembersihan file duplikat/DEMO lama di repo; konfirmasi jalur web app/PWA.

## 8. Format Laporan Perubahan (isi tiap akhir sesi)
```text
LAPORAN PERUBAHAN
Versi master yang dipakai: WD v1.0
Chunk: WD-?
Tanggal sesi: ...
1. Keputusan baru (ID, isi, status LOCKED/USULAN)
2. Aturan lama yang tergantikan
3. Nilai kontrak lintas chunk yang disentuh
4. KONFLIK dengan chunk lain (jika ada)
5. OPEN baru
6. Parkir (topik milik chunk lain)
```

## 9. Log versi
- **v1.0 (19 November 2026)**: Konsolidasi perdana World Development dari `Battle-Smith_RPG_Peta_Dunia_Musuh_v1.xlsx`, `lokasi_peta_dunia.csv`, `Spesifikasi Narasi dan NPC`, `Naratif-Moral Berbasis Faksi`, dan `Laporan Sesi Desain`, diselaraskan dengan kontrak baca-saja `master_CD_v3.1.md`.
