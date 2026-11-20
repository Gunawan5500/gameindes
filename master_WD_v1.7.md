# BATTLE-SMITH RPG: MASTER WORLD DEVELOPMENT (WD) v1.6
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
- **WD-1 (SELESAI — LOCKED, Mode Full Lv1-150)**: Peta, Geografi, Wilayah, 77 Permukiman, dan 16 Dungeon (`data/areas_dungeons.csv`, `data/regions.csv`, `data/locations.csv`).
- **WD-2 (SELESAI — LOCKED, Mode Full Lv1-150)**: Faksi, Ras, Politik, Diplomasi Dinamis, dan Siklus Antagonis Dinamis (`data/factions.csv`, `data/faction_relations.csv`).
- **WD-3 (SELESAI — LOCKED)**: NPC, Generator, Promosi, dan Hubungan (`data/npc_rules.csv`, `data/npc_pools.json`) (mix-and-match, 3 jalur promosi, arc termasuk Informan resmi & *Shadow Syndicate*, nada bicara, kepribadian berkembang).
- **WD-4**: Narasi, Event Director, Krisis Besar, Kalender, dan Moral Dunia (kartu event, 5 fase krisis, musim/festival, Mulia/Kejam, seed).
- **WD-5 (SELESAI — LOCKED, Mode Full Lv1-150)**: Ekonomi, Pasar (*Supply & Demand*), *Market Ledger*, 6 *Gold Sink*, Trofi Signature & Pace Cepat Full Lv1-150 (`data/economy_rules.csv`, `engines/snd_prototype/`).
- **WD-6 (SELESAI — LOCKED, Mode Full Lv1-150)**: Ekosistem Dunia & Arsitektur Aset Data (`data/materials.csv`, `data/trophies.csv`, 16 file `data/areas/*.json` — 26,8x lebih ringan dari Excel 64 MB!).
- **Parkir (di luar WD)**: Character Development & Battle (`CD-1` s.d `CD-7`) dikelola terpisah di `master_CD_v3.1.md`.

## 2. Kontrak lintas chunk (baca saja dari `master_CD_v3.1.md`)
- **Skala level**: `master_CD_v3.1.md` saat ini masih mencatat Demo Lv30 dan menunda Lv31-150 (tier tiap 30 level: Lv31-60, 61-90, 91-120, 121-150). **KONFLIK SINKRONISASI**: Mulai v1.4, **WD resmi memakai Mode Full Lv1-150** (menunggu sinkronisasi dari chunk `CD` untuk cap stat, poin/level, kelipatan zona & stat tempur monster > Lv30).
- **Kelipatan zona (Tier 1 CD)**: Rendah (`x1`), Sedang (`x1,5`), Tinggi (`x2,25`).
- **Mata uang**: `1g = 100s = 10.000br`.
- **Stat yang menyentuh WD**: `CHA` memengaruhi harga jual, Rep Toko, dan murid (`CD-1.02`); `WIS` memengaruhi penilaian pasar (*Market Ledger*) dan drop langka.
- **Idle & stamina**: Idle hanya satu mode (Battle atau Smith), offline cap 8 jam (`CD-7.01`). Idle berfungsi untuk grinding bahan & "menambang" gold (`WD-5.09`); tidak mengambil keputusan cerita dan tidak mengisi resonansi item moral.
- **Elemen (`WD-6.05`)**: Seluruh ekosistem dunia memakai **6 Elemen Utama (+ Neutral)**, namun `sub_damage_tag` asli D&D dari `v1.xlsx` tetap diawetkan bila chunk `CD` membutuhkannya untuk efek status.

## 3. Keputusan LOCKED

### WD-1 Peta, Wilayah, Permukiman, dan Dungeon *(SELESAI — Mode Full Lv1-150)*
- **WD-1.01**: 16 Area (Tier 1-5 aktif penuh), 48 Wilayah (Rendah/Sedang/Tinggi sesuai Tier), 77 permukiman (48 *Village*, 16 *Town*, 8 *City*, 5 *Major City*; kapasitas total 1.376 NPC), dan 16 Dungeon aktif penuh (100 lantai/dungeon, Tier 1 Lv1-30 s.d Tier 5 Lv121-150). Nama Inggris terkunci di `data/`.
- **WD-1.02**: 5 Kota Besar multi-ras bertema sosial tetap: **Briarfall City** (distopia), **Port Saltgrave** (utopia palsu), **Wyrmspine Forgecity** (diskriminasi berbasis aturan/kepentingan), **Kurultai Camp** (utopia rapuh), **Obsidian City** (ketimpangan sosial).
- **WD-1.03**: Isu kota besar menurun berjenjang (*Major City* -> *City* -> *Town* -> *Village*, kolom `parent_location_id` di `data/locations.csv`).
- **WD-1.04**: **Batas Level Dungeon (`30 x tier`)** = level monster maks di lantai 100 (pemain bebas masuk level berapa pun; rumus lantai DEMO = `30 x (tier - 1) + ROUNDUP(0,3 x lantai)`).
- **WD-1.05**: **Portal Savepoint Dungeon**: *Task* tiap 10 lantai (L10-L90) membuka portal. Pulang sukarela = portal utuh; mati tanpa pengaman = portal pecah mundur ke L1 / gerbang permanen L50. Smith dapat menempa ***Portal Seal*** (juga dijual di *Adventurers' Guild*) yang hancur menggantikan portal saat mati.
- **WD-1.06**: **Skala 16 Area Full Lv1-150 & Karavan**: Zona berburu liar mengikuti Tier 1-5; seluruh 77 kota & 11 faksi tetap dapat diakses sejak awal lewat jalur Karavan/Kapal.
- **WD-1.07**: Kepemilikan awal tetap sesuai `data/locations.csv`; **27 lokasi *Bertentangan*** bertag `is_contested_enclave = Y` (kantong minoritas/sengketa dinamis saat perang `WD-2`).

### WD-2 Faksi, Ras, Politik, dan Siklus Antagonis Dinamis *(SELESAI — Mode Full Lv1-150)*
- **WD-2.01–WD-2.04**: 7+ faksi berjenjang (`Q23`), 5 ras ala D&D dipetakan dari 11 faksi wilayah (konflik berbasis isu, bukan ras), hubungan antar-faksi berubah dinamis (`Q26`), reputasi pemain terpisah per faksi (`Q27`), krisis besar bergantian (`Q7`), bisnis membesar membuka wilayah & faksi (`Q8`).
- **WD-2.05**: **Struktur 2 Lapisan**: 11 Faksi Wilayah + 2 Organisasi Netral (**Adventurers' Guild**, **Forgemasters' Guild**) + 1 Organisasi Aktif (**Shadow Syndicate** — pemain bayangan terhadap 11 faksi).
- **WD-2.06–WD-2.08**: Seluruh 11 faksi berbasis konflik abu-abu, memiliki kubu **Pro (garis keras)** dan **Kontra (moderat)**. Poros Api vs Es = Aliansi Rapuh Utara (**Frostcrown Remnant** + **Frostpine Tribe**) vs **Emberwaste Order**.
- **WD-2.09–WD-2.10**: **Siklus Antagonis Dinamis**: Babak 1 = kubu keras **Infernal Hierarchy**; mengalahkan = menumbangkan kubu keras & mengangkat kubu moderat (faksi tetap di peta, kembali abu-abu); Babak 2+ = mesin **Tekanan Dunia** memilih antagonis baru dari 11 faksi. Tujuan penutup selalu menumbangkan kubu keras antagonis aktif, tetapi **caranya bebas moral** (Mulia / Kejam / Pedagang Perang lewat *Shadow Syndicate*).
- **WD-2.11–WD-2.17**: Jenjang awal dinamis (6 Mayor, 3 Menengah, 2 Minor), kepentingan & kubu Pro/Kontra 11 faksi di `data/factions.csv`, penamaan Inggris (`WD-2.13`), **Hostile Terkunci per Era** (`< -80` DEMO, akses via *Shadow Syndicate*, terbuka saat ganti kubu/babak), 55 pasangan awal di `data/faction_relations.csv`, **Mesin Diplomasi Dinamis** (*Threat* `>= 75`, *War Exhaustion* 15-30 hari, Kartu Insiden, maks **3 Open War** & **4 Embargo**), dan rumus Tekanan Dunia (`cooldown` 1 babak).

### WD-3 NPC, Generator, Promosi, dan Hubungan
- **WD-3.01**: Jumlah NPC bertambah bertahap (`Q4`), prosedural (*mix and match* tanpa AI) & bisa dipromosikan jadi NPC kunci (`Q25`).
- **WD-3.02**: Promosi lewat 3 jalur sekaligus: **misi pribadi**, **kedekatan**, atau **bakat menonjol** (`Q28`).
- **WD-3.03**: Persahabatan, rivalitas, romansa ringan/soft (`Q5`); NPC bisa aktif/sibuk/pindah, **tidak bisa mati** (`Q6`).
- **WD-3.04**: Peran ganda pelanggan, pemasok & mentor (`Q16`); bereaksi pada senjata tempaan (`Q17`).
- **WD-3.05**: Menu topik tap (`Q14`), kepribadian NPC berkembang (`Q15`), 3 nada Smith: **Ramah, Tegas, Jenaka** (`Q24`).
- **WD-3.06**: Tag identitas NPC: `ras` (5 ras), `asal_area` (16), `kelas_sosial` (Elit/Warga/Terpinggir), `posisi_konflik` (Pro/Ragu/Kontra). Migran/faksi musuh condong Terpinggir & memicu konflik sosial; 27 enclave sengketa ~50–60% NPC asing. Bonus ringan +1 bakat ras (Human menawar, Dwarf menempa, Elf berburu/meramu, Orc berkelahi, Tiefling meramu/menawar); migran bisa membawa order/bahan dari asal.
- **WD-3.07**: 4 jenjang (Warga → Dikenal → Calon maks 5 → Kunci) & 8 arc dari prototipe Tidewrack.
- **WD-3.08**: NPC Dikenal/Calon ber-`menempa` tinggi bisa jadi murid (5 slot `CD-6.01`) atau penjaga cabang bengkel (`WD-5.10`); lainnya jadi jaringan dunia termasuk Informan.
- **WD-3.09**: Penempatan 2 lapis: **16 Core Key NPC** (~1/Area, arc dalam) + **Local Contacts/Informan** di 77 permukiman (templat prosedural ringan).
- **WD-3.10**: Rekrut murid hibrida: acak lewat **Event Director** + acak lewat **Adventurers' Guild**, atau terarah lewat arc. Gaya companion ringan: Crew Skill (kumpul bahan/jaga cabang/bawa order), *approval* = `loyalitas` (`CD-6.01`) bereaksi pada Mulia/Kejam, mini-arc 3–4 beat. Companion tempur = **Parkir CD**.
- **WD-3.11**: Arc Romansa **dihapus**; diganti **Ikatan Guru** (hubungan guru-murid, khusus murid, tanpa percintaan). Tetap 8 arc.
- **WD-3.12**: Informan hibrida: akses dasar (Market Ledger + harga `???`) lewat langganan Guild/Syndicate (gold sink); akses penuh (bahan langka & trofi, `WD-5.08`) hanya lewat arc Informan Syndicate (risiko moral/faksi).
- **WD-3.13**: Matriks sifat 3 kelompok (Mulia 6: ramah, dermawan, setia, berani, sabar, teliti | Kejam 6: pelit, licin, pemarah, curiga, ambisius, bangga | Netral 8). Pilihan sefaham +1 loyalitas, berlawanan −1, Netral 0. Daftar kelompok = nilai awal, bisa disetel saat uji.

### WD-4 Narasi, Event Director, Kalender, dan Moral Dunia
- **WD-4.01–WD-4.02**: 100% offline tanpa AI/API, data kartu (`Q21`), seed per save (jejak lewat log Kabar), nada campuran (epik/santai/gelap, `Q1`), kejutan kecil sering/besar jarang (`Q9`), cabang tidak bergantung hidup-mati (`Q3`).
- **WD-4.03–WD-4.04**: Tanpa tekanan waktu (`Q10–Q13`), misi/event & krisis menunggu saat idle, hanya simulasi latar berjalan lalu dirangkum (`Q19`, sesi 10-20 menit); kalender lengkap hari/bulan/musim/festival (`Q20`).
- **WD-4.05**: Moral **Mulia** & **Kejam** terpisah, imbalan semi abu-abu, tambahan pasti per pilihan, tag nilai antonim memicu reaksi NPC, wujud fisik lewat Penyelarasan senjata.

### WD-5 Ekonomi, Pasar, dan Harga *(SELESAI — Mode Full Lv1-150)*
- **WD-5.01–WD-5.05**: Ekonomi S&D (`Q18`), mata uang `1g = 100s = 10.000br`, Grade I/II/III untuk Common/Uncommon, harga tempa memperhitungkan biaya bahan teredam/Mastery/mutu/seni/CHA, elemen terpisah (mode Terkunci/Fleksibel/Fusi).
- **WD-5.06**: **Pasar 77 Lokasi Berjenjang 4 Kelas** (*Village, Town, City, Major City*) dengan *sparse save state*.
- **WD-5.07**: **Arsitektur *Basic S&D Engine*** (`data/economy_rules.csv`): 3 Lapis *Lazy Math* (pulih 12 jam + *auto-prune* 0 byte), `k = 0,5`, batas `x0,4`–`x2,5`, *spread* 55%, riak induk 25%, Event Karavan, biaya bahan tempa teredam (`acuan + 50% deviasi pasar`).
- **WD-5.08**: ***Market Ledger*** (lokasi kini gratis; luar kota `???` sampai beli di Guild berlaku 12 jam) + NPC **Informan** resmi & **Informan *Shadow Syndicate*** (tembus boikot/embargo) + paket efek politik/Karavan.
- **WD-5.09**: **Pace Cepat Full Lv1-150 (*High Velocity, High Sink*)**: Idle (cap 8 jam) jadi mesin penambang gold & bahan dasar; pengali harga bahan Tier 1–5 (`x1 / x2,5 / x6 / x14 / x30`).
- **WD-5.10**: **6 *Gold Sink* Aktif & Aturan 480 Trofi Signature**: 6 *gold sink* (*Market Ledger*, Karavan, *Portal Seal*, cabang bengkel, pajak/izin, *Shadow Syndicate*). 480 Trofi hanya dari **berburu** atau dibeli mahal & terbatas di **Shadow Syndicate**; tidak dijual mentah; **senjata signature ke-1 otomatis jadi Trofi Galeri Bengkel**, baru **senjata ke-2 dst** boleh dijual.

### WD-6 Ekosistem Dunia & Arsitektur Aset Data *(SELESAI — Mode Full Lv1-150)*
- **WD-6.01**: Jalan lancar di laptop dan HP Oppo A54 (RAM < 150 MB, `Q29`).
- **WD-6.02**: **Mode Full (Lv1-150) Langsung Aktif** di seluruh World Development.
- **WD-6.03**: **Pemecahan Ekosistem per 16 Area (`data/areas/<area_id>.json`)** + katalog global ringan (`data/materials.csv`, `data/trophies.csv`). Mempertahankan **100% seluruh 4.864 musuh, 19.952 drop, 4.864 Unique, 64 boss skill, 208 material, dan 480 trofi** dari `v1.xlsx` — menyusut **26,8x** dari 64 MB uncompressed Excel menjadi **2,39 MB total** (~**153 KB per file Area**, *lazy load* < 2 MB RAM di Oppo A54!).
- **WD-6.04**: **Cakupan Monster Lv1-150 Tanpa Tambah Baris**: 4.864 musuh mengisi penuh 100% seluruh level `Lv1-150` (tanpa 1 level pun kosong; 10 Area Tier 2-5 digeser `+30 x (tier - 1)`). Variasi *endgame* Tier 5 (`Lv121-150`) & Siklus Antagonis Babak 2+ ditangani **tag varian dinamis runtime** (*Apex / Corrupted / Pasukan Antagonis*) + anomali dungeon *Apex* (0 KB tambahan).
- **WD-6.05**: **Sistem 6 Elemen Utama + `sub_damage_tag` Asli Excel**: Seluruh dunia, pasar S&D, musim, faksi, dan Inti Elemen memakai **6 Elemen Utama (+ Neutral)**:
  - **Fire** (`Fire`) | **Ice** (`Cold`) | **Lightning** (`Lightning, Thunder`) | **Earth** (`Acid, Force`) | **Light** (`Radiant`) | **Dark** (`Necrotic, Poison, Psychic`) | **Neutral** (`Bludgeoning, Piercing, Slashing, -`).
  - Sub-tipe asli Excel tetap diawetkan di kolom `sub_damage_tag` / `sub_el` agar tidak ada data yang hilang dan siap dipakai chunk `CD`.

## 4. USULAN (belum dikonfirmasi)
- **WD-1**: Draf ras minoritas 5 Kota Besar (`minority_races_usulan` di `data/locations.csv`).
- **WD-3 NPC & Event Director**:
  - Jenjang prototipe Tidewrack: Warga -> Dikenal (3 pertemuan) -> Calon (maks 5) -> Kunci (maks 12); 8 arc (termasuk **Informan** resmi & *Shadow Syndicate*); 20 sifat berpasangan; kedekatan 0-99; 30% NPC faksi acak; tambahan kelas sosial (elit/warga/terpinggir) & posisi konflik (loyalis/ragu/penengah).
  - Antrean Event Director 3-5 kartu (festival -> misi/krisis -> kejutan kecil; maks 1 kejutan besar/sesi); krisis 5 fase; skala waktu 1 hari game = 30 menit nyata; simulasi offline detail maks 7 hari game lalu agregat.
- **WD-6**: Konfirmasi jalur web app/PWA & pembersihan arsip file duplikat/DEMO lama di repo.

## 5. Inventaris Aset Data Dunia di Repositori
| File di Repo | Peran dalam WD | Status / Ukuran |
| :--- | :--- | :--- |
| `data/areas_dungeons.csv` | `WD-1` Full Lv1-150: 16 Area + 16 Dungeon aktif | **AKTIF / BERSIH** |
| `data/regions.csv` | `WD-1` Full Lv1-150: 48 Wilayah | **AKTIF / BERSIH** |
| `data/locations.csv` | `WD-1` Full Lv1-150: 77 Permukiman Inggris, bug fixed, 27 sengketa | **AKTIF / BERSIH** |
| `data/factions.csv` | `WD-2`: 11 faksi wilayah + 3 organisasi, kubu Pro/Kontra | **AKTIF / BERSIH** |
| `data/faction_relations.csv` | `WD-2`: 55 pasangan relasi awal | **AKTIF / BERSIH** |
| `data/npc_rules.csv`, `data/npc_pools.json` | `WD-3`: aturan NPC + pool sifat/arc/ras/matriks moral | **AKTIF / BERSIH** |
| `data/economy_rules.csv` | `WD-5` Full Lv1-150: 46 parameter S&D, *Market Ledger*, 6 *Gold Sink*, Trofi | **AKTIF / BERSIH** |
| `data/materials.csv` | `WD-6` Full Lv1-150: **208 Material** (6 Elemen + `sub_damage_tag`, harga Tier 1-5) | **AKTIF / BERSIH** |
| `data/trophies.csv` | `WD-6` Full Lv1-150: **480 Trofi Monster** (level Full Lv1-150, aturan `WD-5.10`) | **AKTIF / BERSIH** |
| `data/areas/*.json` (16 file) | `WD-6` Full Lv1-150: **4.864 Musuh + 19.952 Drop + 4.864 Unique + 64 Boss Skill** | **AKTIF / BERSIH** (**2,39 MB total**, ~153 KB/file!) |
| `engines/snd_prototype/` | Prototipe *Basic S&D Engine* + Simulator Grafik Live offline | **AKTIF / TERUJI** (~10 MB RAM, 3,1 KB save) |
| `Battle-Smith_RPG_Peta_Dunia_Musuh_v1.xlsx` | Sumber arsip Excel mentah (64 MB uncompressed) | **TERGANTIKAN di runtime** oleh `data/` |
| `lokasi_peta_dunia.csv`, `...DEMO.xlsx`, `...(1).docx` | Arsip lama / duplikat | Menunggu izin pembersihan user |

## 6. KONFLIK & Aturan Lama yang Tergantikan
### 6a. Aturan lama yang tergantikan (jangan dipakai)
- Pembatasan Demo Lv30 di WD -> digantikan **Mode Full Lv1-150 (`WD-6.02`)**.
- Daftar 9 faksi lama & penamaan bahasa Indonesia -> digantikan **2 Lapisan + Penamaan Inggris (`WD-2.05`, `WD-2.13`)**.
- *Hierarki Iblis* antagonis permanen & matriks statis -> digantikan **Siklus Antagonis Dinamis & Diplomasi Dinamis (`WD-2.09`, `WD-2.16`)**.
- Larangan masuk dungeon `> 30 x tier` -> digantikan **`WD-1.04` (batas monster maks L100)**.
- Acak 48 desa saat *new save* -> digantikan **`WD-1.07` (27 kantong sengketa dinamis)**.
- Harga bahan mentah 1 transaksi & jual bebas senjata signature ke-1 -> digantikan **`WD-5.07` & `WD-5.10`**.
- Konflik **6 vs 13 elemen** -> **SELESAI (`WD-6.05`: 6 Elemen Utama + `sub_damage_tag` asli)**.
- Konflik **4.864 musuh terlalu berat untuk Oppo A54** -> **SELESAI (`WD-6.03`: 16 file Area JSON ~153 KB/file, 26,8x lebih ringan!)**.

### 6b. KONFLIK & Kosakata yang masih perlu disatukan
1. **KONFLIK LINTAS CHUNK — Mode Full Lv1-150 (WD) vs Demo Lv30 (`master_CD_v3.1.md`)**: `WD` sudah penuh Lv1-150; chunk `CD` perlu diselaraskan di sesi `CD` (cap stat, poin/level, kelipatan zona, stat monster > Lv30).
2. **Istilah "Resonansi" (3 arti)**: tahap upgrade senjata Unique vs keselarasan elemen-bahan vs pengisian bar item moral Mulia/Kejam (akan diselesaikan di `WD-4`).
3. **Event Moral "Aktif Saja" vs Sesi Pendek**: perlu diselaraskan lewat antrean Event Director (`WD-4`).
4. **Lintas Chunk (Parkir ke CD)**: 5 vs 6 tingkat kualitas; 36 senjata vs 10 jenis senjata Unique di `v1.xlsx`.

## 7. OPEN (Daftar Keputusan Terbuka WD)
- **WD-1**: **SELESAI (Mode Full Lv1-150)**.
- **WD-2**: **SELESAI (Mode Full Lv1-150)**.
- **WD-3**: **SELESAI**. Sisa kecil: potret NPC vs ikon/warna (UI, ditunda); skala `loyalitas` final milik CD.
- **WD-4**: Keputusan final *endless* vs ending opsional + tujuan jangka panjang Lv150; konfirmasi skala waktu (1 hari = 30 menit); nama dunia & kota awal; 30-45 templat isu berjenjang; pilihan bahasa teks (ID saja vs dwibahasa); penamaan ulang 3 arti "Resonansi"; keselarasan event moral di antrean Event Director.
- **WD-5**: **SELESAI (Mode Full Lv1-150)**.
- **WD-6**: **SELESAI (Mode Full Lv1-150)** *(tinggal izin opsional pembersihan file arsip/duplikat lama & konfirmasi jalur PWA)*.

## 8. Format Laporan Perubahan (isi tiap akhir sesi)
```text
LAPORAN PERUBAHAN
Versi master yang dipakai: WD v1.7
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
- **v1.0–v1.5 (19–20 November 2026)**: Konsolidasi WD, penuntasan `WD-1`, `WD-2`, `WD-5`, dan sinkronisasi penuh ke Mode Full Lv1-150.
- **v1.6 (20 November 2026)**: **Penuntasan `WD-6` 100%** (`WD-6.03` pecah 16 file Area JSON, `WD-6.04` 4.864 musuh mengisi penuh Lv1-150 tanpa lubang + varian *Apex* runtime, `WD-6.05` 6 Elemen Utama + `sub_damage_tag` asli) + ekspor bersih `data/materials.csv` (208), `data/trophies.csv` (480), dan 16 file `data/areas/*.json` (**2,39 MB total vs 64 MB Excel = 26,8x lebih ringan**).
- **v1.7 (20 November 2026)**: **Penuntasan `WD-3`** (`WD-3.06`–`3.13`): tag ras/asal/kelas/konflik, penempatan 2 lapis, rekrut murid hibrida, arc Ikatan Guru menggantikan Romansa, akses Informan hibrida, matriks sifat 3 kelompok; ekspor `data/npc_rules.csv` & `data/npc_pools.json`.
