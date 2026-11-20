# BATTLE-SMITH RPG: MASTER WORLD DEVELOPMENT (WD) v1.4
Dokumen ini berdiri sendiri. AI yang membacanya tidak punya riwayat percakapan sebelumnya. Baca seluruhnya sebelum bekerja.

## 0. Aturan kerja untuk AI pembaca
- **Proyek**: Battle-Smith RPG, game solo idle/RPG pandai besi + petualangan, 100% offline tanpa AI/API saat bermain, target laptop dan HP Oppo A54 (portrait, UI kartu/teks, RAM < 150 MB). Bahasa Indonesia, ringkas, nyaman dibaca di HP.
- **PRJ-01 (LOCKED)**: fokus backend dulu (data, rumus, aturan, simulasi). Frontend/UI ditunda sampai fondasi selesai.
- **Cakupan WD (WD-6.02 LOCKED)**: Seluruh World Development dirancang langsung untuk **Mode Full (Lv1-150)** — bukan lagi mode Demo Lv30.
- **Label**: `LOCKED` = sudah disetujui pengguna. `USULAN` = belum dikonfirmasi. `DEMO` = angka sementara (siap dituning saat simulasi).
- **Satuan**: `br` = bronze (`1g = 100s = 10.000br`; angka bertuliskan "gold" di file lama dibaca sebagai `br`). `S` = Smith. `Rep` = reputasi.
- **Penamaan (WD-2.13 LOCKED)**: Semua *proper noun* dunia (11 faksi, 3 organisasi, 16 area, 48 wilayah, 16 dungeon, 77 permukiman) memakai Bahasa Inggris ringkas; teks narasi & UI tetap Bahasa Indonesia.
- **Format diskusi**: Tiap topik beri 2-3 opsi (A/B/C) dengan plus/minus, lalu satu rekomendasi. Maksimal satu pertanyaan per balasan.
- **Aturan kunci**: Usulan yang tidak dikeberatkan pengguna dianggap `LOCKED` dan harus disebut eksplisit. Pilihan pengguna mengalahkan rekomendasi AI.
- **Batas chunk**: Dokumen ini hanya memegang **World Development (WD)**. Jangan mengubah nilai `LOCKED` di `master_CD_v3.1.md` (Character Development & Battle). Bila ada benturan, tandai `KONFLIK` di laporan.
- **Kerahasiaan konten (LOCKED)**: Jangan mengungkap isi hubungan rahasia spesifik antar-lokasi/NPC hasil seed (pengguna ikut bermain).
- **Awal sesi**: sebut 5 nilai `LOCKED` dari dokumen ini untuk membuktikan kamu membaca versi terbaru.
- **Akhir sesi**: tulis Laporan Perubahan memakai format di Bagian 8.

## 1. Pembagian chunk World Development
- **WD-1 (SELESAI — LOCKED, Mode Full Lv1-150)**: Peta, Geografi, Wilayah, 77 Permukiman, dan 16 Dungeon (database: `data/areas_dungeons.csv`, `data/regions.csv`, `data/locations.csv`).
- **WD-2 (SELESAI — LOCKED, Mode Full Lv1-150)**: Faksi, Ras, Politik, Diplomasi Dinamis, dan Siklus Antagonis Dinamis (database: `data/factions.csv`, `data/faction_relations.csv`).
- **WD-3**: NPC, Generator, Promosi, dan Hubungan (mix-and-match, 3 jalur promosi, arc, nada bicara, kepribadian berkembang).
- **WD-4**: Narasi, Event Director, Krisis Besar, Kalender, dan Moral Dunia (kartu event, 5 fase krisis, musim/festival, Mulia/Kejam, seed).
- **WD-5 (PROGRES — Poin 1-4 LOCKED, tinggal Poin 5 *Gold Sink* & Trofi + Ekspor)**: Ekonomi, Pasar (*Supply & Demand*), *Market Ledger*, Karavan, dan Pace Cepat Full Lv1-150.
- **WD-6**: Ekosistem Dunia & Arsitektur Aset Data (populasi monster/material/trofi per area, pemecahan data & optimasi RAM Oppo A54).
- **Parkir (di luar WD)**: Character Development & Battle (`CD-1` s.d `CD-7`) dikelola terpisah di `master_CD_v3.1.md`.

## 2. Kontrak lintas chunk (baca saja dari `master_CD_v3.1.md`)
- **Skala level**: `master_CD_v3.1.md` saat ini masih mencatat Demo Lv30 dan menunda Lv31-150 (tier tiap 30 level: Lv31-60, 61-90, 91-120, 121-150). **KONFLIK SINKRONISASI**: Mulai v1.4, **WD resmi memakai Mode Full Lv1-150** (menunggu sinkronisasi dari chunk `CD` untuk cap stat, poin/level & kelipatan zona > Lv30).
- **Kelipatan zona (Tier 1 CD)**: Rendah (`x1`), Sedang (`x1,5`), Tinggi (`x2,25`).
- **Mata uang**: `1g = 100s = 10.000br`.
- **Stat yang menyentuh WD**: `CHA` memengaruhi harga jual, Rep Toko, dan murid (`CD-1.02`); `WIS` memengaruhi penilaian pasar (*Market Ledger*) dan drop langka.
- **Idle & stamina**: Idle hanya satu mode (Battle atau Smith), offline cap 8 jam (`CD-7.01`). Idle berfungsi untuk grinding bahan & "menambang" gold (`WD-5.09`); tidak mengambil keputusan cerita dan tidak mengisi resonansi item moral.
- **Senjata, Smith type & elemen**: 36 senjata (6 stat x 6 tier, tag Dekat/Jauh), 5 Smith type (termasuk Rangesmith), 36 trigger, serta sistem elemen terpisah (mode Terkunci/Fleksibel/Fusi) menjadi pemicu reaksi NPC, pesanan khusus, dan permintaan pasar faksi.

## 3. Keputusan LOCKED

### WD-1 Peta, Wilayah, Permukiman, dan Dungeon *(SELESAI — Mode Full Lv1-150)*
- **WD-1.01**: Struktur dunia terdiri dari **16 Area (Tier 1-5 aktif penuh)**, **48 Wilayah** (3 per area: Rendah, Sedang, Tinggi sesuai rentang level Tier-nya), **77 permukiman** (48 *Village*, 16 *Town*, 8 *City*, 5 *Major City*; kapasitas total 1.376 NPC), dan **16 Dungeon aktif penuh** (masing-masing 100 lantai, Tier 1 Lv1-30 s.d Tier 5 Lv121-150). Seluruh nama Inggris terkunci di `data/`.
- **WD-1.02**: 5 Kota Besar bersifat multi-ras (ras dominan + minoritas dengan status sosial) dan punya tema sosial tetap: **Briarfall City** (distopia), **Port Saltgrave** (utopia palsu), **Wyrmspine Forgecity** (diskriminasi berbasis aturan/kepentingan), **Kurultai Camp** (utopia rapuh), **Obsidian City** (ketimpangan sosial). Diskriminasi lahir dari aturan & kepentingan dunia, bukan ras baik/jahat.
- **WD-1.03**: Isu kota besar menurun berjenjang ke bawah: *Major City* (struktur/politik) -> *City* (penegakan) -> *Town* (dampak pasar) -> *Village* (harga manusiawi), terpetakan lewat kolom `parent_location_id` di `data/locations.csv`. Pemain menemui gejala di desa dulu, sebabnya di kota belakangan.
- **WD-1.04**: **Batas Level Dungeon (`30 x tier`)**: Merupakan **level monster maksimal di lantai 100** (pemain bebas masuk di level berapa pun; anti-farm mengikuti faktor selisih level di `CD`). Rumus level lantai (DEMO) = `30 x (tier - 1) + ROUNDUP(0,3 x lantai)`.
- **WD-1.05**: **Portal Savepoint Dungeon (100 Lantai)**: Setiap 10 lantai (L10, L20, …, L90) ada *task* untuk membuka Portal Savepoint. **Pulang sukarela = portal tetap utuh** (ramah sesi 10-20 menit). **Mati tanpa pengaman = portal pecah** & mundur ke *milestone* terakhir (**Lantai 1** atau gerbang permanen **Lantai 50**). **Smith dapat menempa *Portal Seal*** (sekali pakai, juga dijual di *Adventurers' Guild* sebagai *material/gold sink* `WD-5`) yang hancur menggantikan portal saat mati.
- **WD-1.06**: **Skala 16 Area Full Lv1-150 & Akses Karavan**: Zona berburu liar di 16 Area langsung mengikuti **Tier 1-5** (Tier 1 Lv1-30: 6 Area; Tier 2 Lv31-60: 4 Area; Tier 3 Lv61-90: 3 Area; Tier 4 Lv91-120: 2 Area; Tier 5 Lv121-150: *Crownfrost Isle*). **Namun seluruh 77 kota & 11 faksi tetap dapat diakses sejak awal lewat jalur Karavan/Kapal** untuk dagang, NPC & diplomasi `WD-2`.
- **WD-1.07**: **Kepemilikan Faksi 77 Lokasi & 27 Kantong Sengketa**: Awal permainan tetap mengikuti faksi resmi di `data/locations.csv`. Seluruh **27 lokasi bertrait *Bertentangan*** diberi tag `is_contested_enclave = Y` (populasi ras/faksi asing tinggi, pusat quest kubu Kontra, dan paling mudah berpindah kendali saat *Open War* `WD-2`).

### WD-2 Faksi, Ras, Politik, dan Siklus Antagonis Dinamis *(SELESAI — Mode Full Lv1-150)*
- **WD-2.01**: Terdapat 7+ faksi berjenjang (Mayor, Menengah, Minor), masing-masing memiliki dinamika sendiri (`Q23`).
- **WD-2.02**: 5 ras ala D&D dipetakan dari 11 faksi wilayah: **Human** (*Briarfall Crown, Saltgrave League, Ashwind Clans*), **Dwarf** (*Wyrmspine Hold, Barrow Wardens*), **Elf** (*Elderwake Council, Frostpine Tribe*), **Orc/Savage Tribes** (*Thornback Tribe, Frostcrown Remnant*), **Tiefling/Flame-blooded** (*Infernal Hierarchy, Emberwaste Order*). Satu ras boleh memiliki faksi yang saling berkonflik.
- **WD-2.03**: Hubungan antar-faksi berubah sendiri seiring waktu (`Q26`). Reputasi pemain dihitung terpisah per faksi (`Q27`).
- **WD-2.04**: Sumber konflik besar bergantian antara faksi antagonis aktif, perang faksi, serta bencana & serbuan monster (`Q7`). Bisnis pemain yang membesar membuka NPC/toko baru, uang/reputasi, serta wilayah dan faksi baru (`Q8`).
- **WD-2.05**: **Struktur 2 Lapisan**: 11 Faksi Wilayah + 2 Organisasi Netral Lintas-Wilayah (**Adventurers' Guild**, **Forgemasters' Guild**) + 1 Organisasi Aktif Lintas-Wilayah (**Shadow Syndicate** — pemain bayangan yang berperan aktif terhadap 11 faksi).
- **WD-2.06**: **Prinsip Konflik Abu-Abu**: Seluruh 11 faksi pada dasarnya abu-abu; semua punya alasan logis, warga/toko, dan sisi gelap.
- **WD-2.07**: **Poros Api vs Es**: Aliansi Rapuh Utara (**Frostcrown Remnant** + **Frostpine Tribe**) melawan **Emberwaste Order**, dengan ketegangan internal di utara.
- **WD-2.08**: **Kubu Internal Faksi**: Semua 11 faksi memiliki **kubu Pro (garis keras)** dan **kubu Kontra (moderat/pembelot)**.
- **WD-2.09**: **Siklus Antagonis Dinamis (Full Lv1-150 / Endless)**: Babak 1 pembuka = kubu keras **Infernal Hierarchy**. Mengalahkan antagonis = menumbangkan kubu keras & mengangkat kubu moderat (faksi tetap di peta, kembali abu-abu). Babak 2 dst = mesin **Tekanan Dunia** memilih antagonis baru dari 11 faksi (kekuatan krisis mengikuti progres Tier 1-5 pemain).
- **WD-2.10**: **Penyelesaian Quest Antagonis**: Tujuan penutup selalu menumbangkan kubu keras antagonis aktif agar siklus bergulir rapi, namun **caranya bebas moral** (Mulia / Kejam / Pedagang Perang lewat *Shadow Syndicate*).
- **WD-2.11**: **Jenjang Awal 11 Faksi (Dinamis)**: Mayor (6), Menengah (3), Minor (2) sesuai `data/factions.csv`; jenjang efektif bisa naik/turun dinamis.
- **WD-2.12**: **Kepentingan & Kubu Pro/Kontra 6 Faksi Non-Kota-Besar**: Terkunci di `data/factions.csv`.
- **WD-2.13**: **Konvensi Penamaan Inggris**: Semua *proper noun* dunia berbahasa Inggris ringkas; narasi, dialog & UI tetap Bahasa Indonesia.
- **WD-2.14**: **Reputasi & Boikot per Era**: Skala `-100` s.d `+100` (*Hostile / Neutral / Allied*). Di bawah ambang ekstrem (DEMO `< -80`) -> **Hostile Terkunci per Era** (toko resmi tutup; akses wilayah hanya via **Shadow Syndicate**); terbuka kembali saat ganti kubu/babak.
- **WD-2.15**: **Kubu 5 Kota Besar & Matriks Awal**: Kubu Pro/Kontra 5 Kota Besar & 55 pasangan di `data/faction_relations.csv` dikunci sebagai titik start & label Rival Sejarah.
- **WD-2.16**: **Mesin Diplomasi Dinamis**: Gabungan simulasi (*Threat*, *War Exhaustion*, kubu Pro/Kontra, aksi pemain/*Shadow Syndicate*) + penerbitan **Kartu Insiden** di log Kabar saat menembus ambang status.
- **WD-2.17**: **Parameter Ritme Seimbang & Rumus Tekanan Dunia (aturan LOCKED, angka DEMO)**:
  - Ambang 55 Pasangan: `>= +60` **Alliance** | `+25..+59` **Friendly** | `-24..+24` **Neutral** | `-25..-54` **Cold War** | `-55..-74` **Embargo** | `<= -75` **Open War**.
  - Rem keseimbangan: maks **3 Open War** & **4 Embargo** bersamaan; *Threat* aktif saat `Kekuatan >= 75`; perang rata-rata 15-30 hari game.
  - Rumus Kandidat Antagonis Babak 2+: `0,35 x Kekuatan + 0,30 x Kubu_Keras + 0,20 x Ketegangan_Rata2 + 0,15 x Aksi_Pemain_Shadow + Acak_Seed(0..15)`, jeda *cooldown* **1 babak**.

### WD-3 NPC, Generator, Promosi, dan Hubungan
- **WD-3.01**: Jumlah NPC bertambah bertahap (`Q4`). NPC dibangkitkan secara prosedural (*mix and match* tanpa AI) lalu dapat dipromosikan menjadi NPC kunci gaya *Watch Dogs: Legion* (`Q25`).
- **WD-3.02**: Promosi menjadi NPC kunci memakai 3 jalur sekaligus (mana yang terpenuhi duluan): **misi pribadi**, **kedekatan**, atau **bakat menonjol** (`Q28`).
- **WD-3.03**: Hubungan mencakup persahabatan, rivalitas, dan romansa ringan/soft (`Q5`). NPC dapat aktif, sibuk, atau pergi/pindah, tetapi **tidak bisa mati** (`Q6`).
- **WD-3.04**: NPC berperan ganda sebagai pelanggan, pemasok, dan mentor sekaligus (`Q16`). NPC bereaksi pada senjata tempaan pemain lewat komentar, pesanan khusus, dan hubungan/diskon (`Q17`).
- **WD-3.05**: Interaksi dialog menggunakan menu topik (tap) (`Q14`). Kepribadian NPC berkembang perlahan karena peristiwa & hubungan (`Q15`). Kepribadian Smith terbentuk dari 3 nada pilihan: **Ramah**, **Tegas**, **Jenaka** (`Q24`).

### WD-4 Narasi, Event Director, Kalender, dan Moral Dunia
- **WD-4.01**: Game berjalan 100% offline tanpa AI/API saat bermain. Semua cerita dan kejadian berbentuk data kartu (*pop-up* kartu, `Q21`). Struktur cerita dan konsekuensi dunia dibangkitkan dari **seed per save** (jejak lewat log Kabar).
- **WD-4.02**: Nada cerita campuran (epik, santai, gelap bergantian, `Q1`). Kejutan kecil sering, besar jarang (`Q9`). Cabang cerita tidak bergantung hidup-mati (`Q3`).
- **WD-4.03**: Prinsip tanpa tekanan waktu: misi datang dari semua sumber (`Q10`), tanpa batas waktu (`Q11`), misi/event dan krisis besar **menunggu tanpa konsekuensi** saat idle (`Q12`, `Q13`). Saat idle hanya simulasi latar berjalan lalu dirangkum saat kembali (`Q19`) — untuk sesi pendek 10-20 menit.
- **WD-4.04**: Kalender lengkap dengan hari, bulan, musim, festival, dan hari besar (`Q20`).
- **WD-4.05**: Moral naratif memakai dua stat terpisah: **Mulia** dan **Kejam**, imbalan semi abu-abu, tambahan pasti per pilihan (Sapaan, Dilema, Titik Balik), tag nilai berpasangan memicu reaksi NPC otomatis, konsekuensi fisik lewat Penyelarasan senjata.

### WD-5 Ekonomi, Pasar, dan Harga *(Poin 1-4 LOCKED)*
- **WD-5.01**: Ekonomi dinamis penuh memakai *supply and demand* (`Q18`): `Harga = harga_acuan x pengali_pasar`. Bahan tingkat lebih tinggi lebih mahal.
- **WD-5.02**: Mata uang 3 tingkat: `1g = 100s = 10.000br` (`1s = 100br`). Angka "gold" di file lama dibaca sebagai `br`.
- **WD-5.03**: Material Common & Uncommon memakai **Grade I / II / III**.
- **WD-5.04**: Harga senjata tempaan dipengaruhi biaya bahan (harga pasar teredam), nilai kerajinan (Mastery Tempa), mutu (dadu mengecil), nilai seni, dan bonus CHA. Mahakarya butuh bahan langka. Senjata unik bisa dijual, disimpan di galeri, dipakai, atau diberikan ke NPC.
- **WD-5.05**: Elemen terpisah dari bahan (Inti Elemen) dan memengaruhi pasar/musim/faksi. Mode elemen senjata: **Terkunci**, **Fleksibel**, **Fusi**.
- **WD-5.06**: **Pasar 77 Lokasi Berjenjang (4 Kelas Pasar)**: Semua 77 permukiman punya pasar S&D sendiri (*sparse save state*, 0 byte untuk barang diam), tetapi dibatasi kelas lokasi:
  - **Village (48)**: Material dasar/lokal (*Common-Uncommon*) & barang dasar; modal kecil.
  - **Town (16)**: Material area (*Common-Rare*) & senjata lokal/menengah.
  - **City (8)**: Material *Common-Epic* (termasuk tetangga), senjata lanjut & pesanan faksi.
  - **Major City (5)**: Katalog penuh lintas benua (*Common-Legendary* terbatas), modal terbesar & pesanan besar faksi.
- **WD-5.07**: **Arsitektur *Basic S&D Engine*** (aturan LOCKED, angka DEMO): 3 Lapis *Lazy Math* (pulih penuh **12 jam nyata** + *auto-prune* 0 byte), `k = 0,5`, batas pengali `x0,4` s.d `x2,5`, *spread* beli-jual toko `55%` (+ bonus `CHA` `+1%`/poin di atas 10, cap `+25%`), **efek riak 25% kota induk (`parent_location_id`)**, Event Karavan harian (maks 7 hari detail saat offline, sisanya agregat), serta anti-eksploitasi biaya bahan tempa = **Harga Pasar Teredam (`acuan + 50% deviasi pasar`)**.
- **WD-5.08**: ***Market Ledger* (Info Harga Luar Kota) & Paket Efek Politik/Karavan**:
  - Harga lokasi tempat pemain berdiri = gratis & *real-time*; harga luar kota = tertutup (`???`).
  - Buka info luar kota lewat beli **Market Ledger** eceran di Guild (*Adventurers' / Forgemasters' Guild*, berlaku 1 hari game / 12 jam nyata — *gold sink*).
  - **Jalur NPC Informan (`WD-3`)**: Informan resmi mengabari harga area gratis/diskon; **Informan *Shadow Syndicate*** juga membocorkan harga di wilayah boikot, rute selundupan *Embargo*, dan bocoran lonjakan perang.
  - Paket efek (`DEMO`): *Open War* (senjata `+35%`, bahan `+20%`), *Embargo* (bahan lawan `+35%`), *Winter* (Api `+25%`), *Shadow Syndicate* (beli `+45%`, jual `45%`), ongkos Karavan naik `+50%-100%` melintasi zona *Embargo/Open War*.
- **WD-5.09**: **Pace Ekonomi Cepat Full Lv1-150 (*High Velocity, High Sink*)**:
  - Arus kas harian & tempa berputar **cepat** (renyah di sesi aktif 10-20 menit), diimbangi pengeluaran operasional aktif (*Market Ledger*, ongkos Karavan, *Portal Seal*, pajak faksi, sewa/cabang bengkel, bahan Tier 2-5).
  - **Peran Mode Idle**: Mode idle (offline cap 8 jam) menjadi mesin utama "menambang" gold & bahan dasar untuk membiayai eksperimen tempa, dagang S&D, dan *gold sink* aktif (tetap patuh batas idle tanpa mengambil keputusan cerita).
  - Pengali harga acuan bahan per Tier (`DEMO` anti-inflasi Lv1-150): Tier 1 (`Lv1-30`) `x1` | Tier 2 (`Lv31-60`) `x2,5` | Tier 3 (`Lv61-90`) `x6` | Tier 4 (`Lv91-120`) `x14` | Tier 5 (`Lv121-150`) `x30`.

### WD-6 Platform dan Skala Aset Data
- **WD-6.01**: Jalan lancar di laptop dan HP Oppo A54 (RAM < 150 MB, `Q29`). Konten dimuat bertahap per Area/Tier (*lazy loading*).
- **WD-6.02**: **Mode Full (Lv1-150) Langsung Aktif**: World Development tidak lagi memakai pembatasan Demo Lv30; seluruh 16 Area (Tier 1-5), 48 Wilayah Lv1-150, 77 Lokasi, 16 Dungeon, 11 Faksi, dan kurva ekonomi dirancang langsung untuk skala penuh Lv1-150.

## 4. USULAN (belum dikonfirmasi)
- **WD-1**: Draf ras minoritas 5 Kota Besar (`minority_races_usulan` di `data/locations.csv`).
- **WD-3 NPC & Event Director**:
  - Jenjang prototipe Tidewrack: Warga -> Dikenal (3 pertemuan) -> Calon (maks 5) -> Kunci (maks 12); 8 arc (termasuk **Informan** resmi & *Shadow Syndicate*); 20 sifat berpasangan; kedekatan 0-99; 30% NPC faksi acak; tambahan kelas sosial (elit/warga/terpinggir) & posisi konflik (loyalis/ragu/penengah).
  - Antrean Event Director 3-5 kartu (festival -> misi/krisis -> kejutan kecil; maks 1 kejutan besar/sesi); krisis 5 fase; skala waktu 1 hari game = 30 menit nyata; simulasi offline detail maks 7 hari game lalu agregat.
- **WD-5**: Daftar detail nominal *Gold Sink* (sewa/cabang bengkel, *Portal Seal* Tier 1-5, ongkos Karavan, pajak) dan aturan perdagangan 480 Trofi Monster (Poin 5).
- **WD-6 Ekosistem & Platform**:
  - `v1.xlsx`: 4.864 musuh, 208 material, 480 trofi, 19.952 baris drop. Platform web app/PWA dengan save JSON + ekspor/impor; pecah data per area (16 file + efek bersama), muat per tier level.

## 5. Inventaris Aset Data Dunia di Repositori
| File di Repo | Peran dalam WD | Status / Catatan |
| :--- | :--- | :--- |
| `data/areas_dungeons.csv` | **Database bersih `WD-1` (Full Lv1-150)**: 16 Area + 16 Dungeon aktif semua (Tier 1-5, `tier_price_mult_demo`) | **AKTIF / BERSIH** |
| `data/regions.csv` | **Database bersih `WD-1` (Full Lv1-150)**: 48 Wilayah skala penuh Lv1-150 | **AKTIF / BERSIH** |
| `data/locations.csv` | **Database bersih `WD-1` (Full Lv1-150)**: 77 Permukiman Inggris, bug tanggal & typo Quay fixed, hierarki `parent_location_id`, 27 kantong sengketa | **AKTIF / BERSIH** |
| `data/factions.csv` | **Database bersih `WD-2`**: 11 faksi wilayah + 3 organisasi, kubu Pro/Kontra, kebutuhan senjata | **AKTIF / BERSIH** |
| `data/faction_relations.csv` | **Database bersih `WD-2`**: 55 pasangan relasi awal, label Rival Sejarah, poros konflik | **AKTIF / BERSIH** (Hari-0: 4 Embargo, 0 Open War) |
| `engines/snd_prototype/` | **Prototipe *Basic S&D Engine* (v0.2 DEMO)**: `snd_engine.js`, `economy_config.json`, `dummy_items.csv`, `test_simulation.js`, `snd_simulator.html` (100% offline 77 lokasi + 2 grafik live, 56 KB) | **AKTIF / TERUJI** (~10 MB RAM, 3,1 KB save state) |
| `Battle-Smith_RPG_Peta_Dunia_Musuh_v1.xlsx` | Database mentah musuh, drop, material, trofi (19 sheet) | 5,3 MB (64 MB *uncompressed*), dipecah di `WD-6` |
| `lokasi_peta_dunia.csv` | Sumber lama 77 permukiman | **TERGANTIKAN** oleh `data/locations.csv` |
| `Spesifikasi Narasi...docx`, `Naratif-Moral...docx`, `Laporan Sesi Desain...docx` | Sumber arsip desain awal | Dikonsolidasikan bertahap ke `master_WD` |
| `Balai Kenalan Tidewrack...html` | Prototipe generator NPC & log Kabar | Masih memuat Google Fonts eksternal |

## 6. KONFLIK & Aturan Lama yang Tergantikan
### 6a. Aturan lama yang tergantikan (jangan dipakai)
- **Pembatasan Demo Lv30 & penundaan Dungeon/Wilayah Tier 2-5** di WD digantikan oleh **Mode Full Lv1-150 Langsung Aktif (`WD-6.02`, `WD-1.01`, `WD-1.06`)**.
- Daftar lama **9 faksi organisasi** digantikan oleh **Struktur 2 Lapisan (`WD-2.05`)**.
- Penamaan faksi/organisasi/lokasi berbahasa Indonesia digantikan oleh **Konvensi Penamaan Inggris (`WD-2.13`)**.
- *Hierarki Iblis* sebagai antagonis permanen digantikan oleh **Siklus Antagonis Dinamis (`WD-2.06`, `WD-2.09`)**.
- Matriks relasi statis digantikan oleh **Mesin Diplomasi Dinamis (`WD-2.16`, `WD-2.17`)**.
- Tafsiran larangan masuk dungeon `> 30 x tier` digantikan oleh **`WD-1.04` (batas monster maks L100, pemain bebas masuk)**.
- Acak kepemilikan 48 desa saat *new save* digantikan oleh **`WD-1.07` (awal tetap + 27 kantong sengketa dinamis)**.
- "Harga jual terakhir mentah 1 transaksi" digantikan oleh **Harga Pasar Teredam (`WD-5.07`)**.

### 6b. KONFLIK & Kosakata yang masih perlu disatukan
1. **KONFLIK LINTAS CHUNK — Mode Full Lv1-150 (WD) vs Demo Lv30 (`master_CD_v3.1.md`)**: `WD` kini aktif penuh Lv1-150 (Tier 1-5); chunk `CD` perlu diberitahu saat sesi berikutnya untuk menyelaraskan cap stat, poin/level, kelipatan zona, dan tier senjata di atas Lv30.
2. **Istilah "Resonansi" (3 arti)**: tahap upgrade senjata Unique vs keselarasan elemen-bahan vs pengisian bar item moral Mulia/Kejam.
3. **Jumlah Elemen (6 vs 13)**: 6 elemen di spesifikasi Narasi vs 13 tipe damage D&D di `v1.xlsx`.
4. **Skala Data Monster & RAM Oppo A54**: 100 monster di `master_CD_v3.1.md` vs 4.864 monster unik (+19.952 drop) di `v1.xlsx`.
5. **Event Moral "Aktif Saja" vs Sesi Pendek**: perlu diselaraskan lewat antrean Event Director.
6. **Lintas Chunk (Parkir ke CD)**: 5 vs 6 tingkat kualitas; 36 senjata vs 10 jenis senjata Unique di `v1.xlsx`.

## 7. OPEN (Daftar Keputusan Terbuka WD)
- **WD-1**: **SELESAI (Mode Full Lv1-150)** (draf minoritas 5 kota besar berstatus USULAN).
- **WD-2**: **SELESAI (Mode Full Lv1-150)**.
- **WD-3**: Kedalaman romansa ringan; rekrut NPC jadi pegawai bengkel vs murid (`CD-6.01`)/sekutu/pelanggan; potret NPC vs ikon/warna; matriks sifat ke tag nilai moral; detail akses NPC Informan *Shadow Syndicate*.
- **WD-4**: Keputusan final *endless* vs ending opsional + tujuan jangka panjang Lv150; konfirmasi skala waktu (1 hari = 30 menit); nama dunia & kota awal; 30-45 templat isu berjenjang; pilihan bahasa teks (ID saja vs dwibahasa); penamaan ulang 3 arti "Resonansi".
- **WD-5 (tersisa Poin 5-6)**: Daftar *Gold Sink* aktif Full Lv1-150 (*Portal Seal* Tier 1-5, ongkos Karavan, sewa/cabang bengkel, pajak faksi, *Market Ledger*); apakah 480 Trofi Monster boleh diperdagangkan; ekspor `data/economy_rules.csv` & update tombol *Market Ledger* di simulator.
- **WD-6**: Keputusan 100 musuh unik/wilayah vs template biome untuk Oppo A54 (< 150 MB); penyatuan 6 vs 13 elemen di data material/musuh; pemecahan sisa `v1.xlsx` ke `data/` CSV/JSON; pembersihan file duplikat/DEMO lama di repo; konfirmasi jalur PWA.

## 8. Format Laporan Perubahan (isi tiap akhir sesi)
```text
LAPORAN PERUBAHAN
Versi master yang dipakai: WD v1.4
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
- **v1.0 (19 November 2026)**: Konsolidasi perdana World Development dari seluruh aset dunia di repo.
- **v1.1 (19 November 2026)**: Fondasi politik `WD-2` (`WD-2.05` s.d `WD-2.14` LOCKED).
- **v1.2 (19 November 2026)**: Penuntasan `WD-2` 100% (`WD-2.15` s.d `WD-2.17` LOCKED) + ekspor `data/factions.csv` & `data/faction_relations.csv`.
- **v1.3 (19 November 2026)**: Penuntasan `WD-1` 100% (`WD-1.04` s.d `WD-1.07` LOCKED) + ekspor `data/areas_dungeons.csv`, `data/regions.csv`, `data/locations.csv`.
- **v1.4 (19 November 2026)**: **Sinkronisasi penuh ke Mode Full (Lv1-150)** (`WD-6.02` LOCKED, seluruh 16 Area & 16 Dungeon Tier 1-5 aktif di `data/`), plus **Poin 1-4 `WD-5` LOCKED** (`WD-5.06` Pasar 77 lokasi 4 kelas, `WD-5.07` Arsitektur *Basic S&D Engine* + prototipe JS/HTML grafik live teruji < 10 MB RAM, `WD-5.08` *Market Ledger* Guild + NPC Informan resmi & *Shadow Syndicate*, `WD-5.09` Pace cepat *High Velocity, High Sink* dengan idle sebagai penambang gold).
