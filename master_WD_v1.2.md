# BATTLE-SMITH RPG: MASTER WORLD DEVELOPMENT (WD) v1.2
Dokumen ini berdiri sendiri. AI yang membacanya tidak punya riwayat percakapan sebelumnya. Baca seluruhnya sebelum bekerja.

## 0. Aturan kerja untuk AI pembaca
- **Proyek**: Battle-Smith RPG, game solo idle/RPG pandai besi + petualangan, 100% offline tanpa AI/API saat bermain, target laptop dan HP Oppo A54 (portrait, UI kartu/teks, RAM < 150 MB). Bahasa Indonesia, ringkas, nyaman dibaca di HP.
- **PRJ-01 (LOCKED)**: fokus backend dulu (data, rumus, aturan, simulasi). Frontend/UI ditunda sampai fondasi selesai.
- **Label**: `LOCKED` = sudah disetujui pengguna. `USULAN` = belum dikonfirmasi. `DEMO` = angka sementara. Semua angka bersifat DEMO kecuali disebut lain.
- **Satuan**: `br` = bronze (`1g = 100s = 10.000br`; angka bertuliskan "gold" di file lama dibaca sebagai `br`). `S` = Smith. `Rep` = reputasi.
- **Penamaan (WD-2.13 LOCKED)**: Semua *proper noun* dunia (11 faksi, 3 organisasi, area, wilayah, dungeon, awalan permukiman) memakai Bahasa Inggris ringkas; teks narasi & UI tetap Bahasa Indonesia.
- **Format diskusi**: Tiap topik beri 2-3 opsi (A/B/C) dengan plus/minus, lalu satu rekomendasi. Maksimal satu pertanyaan per balasan.
- **Aturan kunci**: Usulan yang tidak dikeberatkan pengguna dianggap `LOCKED` dan harus disebut eksplisit. Pilihan pengguna mengalahkan rekomendasi AI.
- **Batas chunk**: Dokumen ini hanya memegang **World Development (WD)**. Jangan mengubah nilai `LOCKED` di `master_CD_v3.1.md` (Character Development & Battle). Bila ada benturan, tandai `KONFLIK` di laporan.
- **Kerahasiaan konten (LOCKED)**: Jangan mengungkap isi hubungan rahasia spesifik antar-lokasi/NPC hasil seed (pengguna ikut bermain).
- **Awal sesi**: sebut 5 nilai `LOCKED` dari dokumen ini untuk membuktikan kamu membaca versi terbaru.
- **Akhir sesi**: tulis Laporan Perubahan memakai format di Bagian 8.

## 1. Pembagian chunk World Development
- **WD-1**: Peta, Geografi, Wilayah, Permukiman, dan Dungeon (16 Area, 48 Wilayah, 77 Lokasi, 16 Dungeon).
- **WD-2 (SELESAI — LOCKED)**: Faksi, Ras, Politik, Diplomasi Dinamis, dan Siklus Antagonis Dinamis (database: `data/factions.csv`, `data/faction_relations.csv`).
- **WD-3**: NPC, Generator, Promosi, dan Hubungan (mix-and-match, 3 jalur promosi, arc, nada bicara, kepribadian berkembang).
- **WD-4**: Narasi, Event Director, Krisis Besar, Kalender, dan Moral Dunia (kartu event, 5 fase krisis, musim/festival, Mulia/Kejam, seed).
- **WD-5**: Ekonomi, Pasar (*Supply & Demand*), Toko, Guild, dan Harga Acuan (rumus S&D, mata uang, harga bahan & senjata tempa, Grade).
- **WD-6**: Ekosistem Dunia & Arsitektur Aset Data (populasi monster/material/trofi per area, pemecahan data & optimasi RAM Oppo A54).
- **Parkir (di luar WD)**: Character Development & Battle (`CD-1` s.d `CD-7`) dikelola terpisah di `master_CD_v3.1.md`.

## 2. Kontrak lintas chunk (baca saja dari `master_CD_v3.1.md`)
- **Skala demo & penuh**: Demo berakhir di Lv30 (Magang Lv1-10, Journeyman Lv11-20, Master Lv21-30). Versi penuh Lv150 (tier tambahan tiap 30 level: Lv31-60, 61-90, 91-120, 121-150).
- **Zona & kelipatan**: Rendah Lv1-10 (`x1`), Sedang Lv11-20 (`x1,5`), Tinggi Lv21-30 (`x2,25`).
- **Mata uang**: `1g = 100s = 10.000br`.
- **Stat yang menyentuh WD**: `CHA` memengaruhi harga jual, Rep Toko, dan murid (`CD-1.02`); `WIS` memengaruhi penilaian pasar dan drop langka.
- **Idle & stamina**: Idle hanya satu mode (Battle atau Smith), offline cap 8 jam (`CD-7.01`). Idle murni untuk grinding; tidak mengambil keputusan cerita dan tidak mengisi resonansi item moral.
- **Senjata, Smith type & elemen**: 36 senjata (6 stat x 6 tier, tag Dekat/Jauh), 5 Smith type (termasuk Rangesmith), 36 trigger, serta sistem elemen terpisah (mode Terkunci/Fleksibel/Fusi) menjadi pemicu reaksi NPC, pesanan khusus, dan permintaan pasar faksi.

## 3. Keputusan LOCKED

### WD-1 Peta, Wilayah, Permukiman, dan Dungeon
- **WD-1.01**: Struktur dunia terdiri dari 16 Area, 48 Wilayah (3 per area: Rendah Lv1-10, Sedang Lv11-20, Tinggi Lv21-30), 77 permukiman (48 desa, 16 kota kecil, 8 kota sedang, 5 kota besar; kapasitas total 1.376 NPC), dan 16 Dungeon (masing-masing 100 lantai). Di demo hanya dungeon Tier 1 (6 dungeon, Lv1-30) yang aktif; Tier 2-5 (Lv31-150) ditunda ke versi penuh. *(Nama spesifik area/wilayah/dungeon masih USULAN).*
- **WD-1.02**: 5 Kota Besar bersifat multi-ras (ras dominan + minoritas dengan status sosial) dan punya tema sosial tetap: **Briarfall City** (distopia), **Port Saltgrave** (utopia palsu), **Wyrmspine Forgecity** (diskriminasi berbasis aturan/kepentingan), **Kurultai Camp** (utopia rapuh), **Obsidian City** (ketimpangan sosial). Diskriminasi lahir dari aturan & kepentingan dunia, bukan ras baik/jahat.
- **WD-1.03**: Isu kota besar menurun berjenjang ke bawah: Kota Besar (struktur/politik) -> Kota Sedang (penegakan) -> Kota Kecil (dampak pasar) -> Desa (harga manusiawi). Pemain menemui gejala di desa dulu, sebabnya di kota belakangan.

### WD-2 Faksi, Ras, Politik, dan Siklus Antagonis Dinamis *(SELESAI)*
- **WD-2.01**: Terdapat 7+ faksi berjenjang (Mayor, Menengah, Minor), masing-masing memiliki dinamika sendiri (`Q23`).
- **WD-2.02**: 5 ras ala D&D dipetakan dari 11 faksi wilayah: **Human** (*Briarfall Crown, Saltgrave League, Ashwind Clans*), **Dwarf** (*Wyrmspine Hold, Barrow Wardens*), **Elf** (*Elderwake Council, Frostpine Tribe*), **Orc/Savage Tribes** (*Thornback Tribe, Frostcrown Remnant*), **Tiefling/Flame-blooded** (*Infernal Hierarchy, Emberwaste Order*). Satu ras boleh memiliki faksi yang saling berkonflik.
- **WD-2.03**: Hubungan antar-faksi berubah sendiri seiring waktu (`Q26`). Reputasi pemain dihitung terpisah per faksi (`Q27`).
- **WD-2.04**: Sumber konflik besar bergantian antara ancaman supernatural/faksi antagonis, perang faksi, serta bencana & serbuan monster (`Q7`). Bisnis pemain yang membesar membuka NPC/toko baru, uang/reputasi, serta wilayah dan faksi baru (`Q8`).
- **WD-2.05**: **Struktur 2 Lapisan**:
  1. **11 Faksi Wilayah** (memegang teritori, 5 ras, politik, dan perang di peta).
  2. **2 Organisasi Netral Lintas-Wilayah**: **Adventurers' Guild** (papan misi) & **Forgemasters' Guild** (karir/guru Smith) — tidak termasuk 11 faksi dan tidak berebut teritori.
  3. **1 Organisasi Aktif Lintas-Wilayah**: **Shadow Syndicate** (Pasar Gelap) — pemain bayangan yang ikut berperan aktif terhadap dinamika 11 faksi (penyelundupan saat embargo, suplai perang ilegal, perantara saat pemain diboikot).
- **WD-2.06**: **Prinsip Konflik Abu-Abu**: Seluruh 11 faksi pada dasarnya abu-abu — tidak ada faksi suci/jahat mutlak; semua punya alasan logis, warga/toko, dan sisi gelap masing-masing.
- **WD-2.07**: **Poros Api vs Es**: Aliansi Rapuh Utara (**Frostcrown Remnant** sebagai motor militer + **Frostpine Tribe** sebagai sekutu pragmatis/terpaksa) melawan **Emberwaste Order**, dengan ketegangan internal di utara sendiri.
- **WD-2.08**: **Kubu Internal Faksi**: Semua 11 faksi memiliki **kubu Pro (garis keras)** dan **kubu Kontra (moderat/pembelot)** agar konflik seimbang & dinamis (selaras atribut posisi konflik NPC: *loyalis, ragu, penengah/pembelot*).
- **WD-2.09**: **Siklus Antagonis Dinamis**:
  - **Babak 1 (Pembuka / Demo)**: Kubu garis keras **Infernal Hierarchy** menjadi antagonis pembuka.
  - **Arti mengalahkan antagonis**: Menumbangkan kubu garis keras (Pro) sehingga kubu moderat (Kontra) naik mengambil alih. Faksi tetap ada di peta dan kembali abu-abu.
  - **Babak 2 dst (Dinamis / Endless)**: Setelah antagonis sebelumnya tumbang, mesin **Tekanan Dunia** memilih antagonis baru dari 11 faksi berdasarkan: *Kekuatan Faksi + Dominasi Kubu Keras + Ketegangan Matriks/Vakum Kekuasaan + Aksi Pemain & Shadow Syndicate + bobot Seed*.
- **WD-2.10**: **Penyelesaian Quest Antagonis**: Tujuan penutup tiap babak krisis selalu menumbangkan kubu keras antagonis aktif agar siklus bergulir rapi, namun **caranya bebas moral** — jalur **Mulia** (bantu kubu moderat/warga) atau jalur **Kejam / Pedagang Perang** (sabotase, manfaatkan *Shadow Syndicate*, jual senjata ke dua kubu sebelum menjatuhkan antagonis).
- **WD-2.11**: **Jenjang Awal 11 Faksi (Dinamis)**:
  - **Mayor (6)**: *Briarfall Crown, Saltgrave League, Wyrmspine Hold, Ashwind Clans, Emberwaste Order, Infernal Hierarchy*.
  - **Menengah (3)**: *Frostcrown Remnant, Barrow Wardens, Elderwake Council*.
  - **Minor (2)**: *Frostpine Tribe, Thornback Tribe*.
  - Jenjang efektif bersifat dinamis: faksi Menengah/Minor dapat melonjak sementara menjadi Antagonis Aktif bila dikuatkan konflik/suplai, dan faksi Mayor yang baru tumbang melemah sementara.
- **WD-2.12**: **Kepentingan & Kubu Pro/Kontra 6 Faksi Non-Kota-Besar**: Terkunci (detail lengkap tersimpan di `data/factions.csv`).
- **WD-2.13**: **Konvensi Penamaan Inggris**: Seluruh *proper noun* dunia (11 faksi, 3 organisasi, area, wilayah, dungeon, dan awalan 77 permukiman CSV) memakai Bahasa Inggris ringkas (gaya 2 kata). Narasi, dialog & UI tetap Bahasa Indonesia.
- **WD-2.14**: **Reputasi & Boikot per Era**: Reputasi pemain per faksi memakai skala `-100` s.d `+100` (*Hostile / Neutral / Allied*). Bila jatuh di bawah ambang ekstrem (DEMO `< -80`), faksi menjadi **Hostile Terkunci per Era** (boikot toko resmi; akses bahan wilayah hanya lewat **Shadow Syndicate**). Boikot terbuka kembali saat kubu faksi berganti atau babak krisis selesai.
- **WD-2.15**: **Kubu 5 Kota Besar & Matriks Awal**: Kubu Pro/Kontra 5 Kota Besar serta Matriks Relasi 11×11 (55 pasangan di `data/faction_relations.csv`) dikunci sebagai **titik start & label Rival Sejarah** (bebas bergeser `-100` s.d `+100` seiring permainan).
- **WD-2.16**: **Mesin Diplomasi Dinamis (Gabungan Simulasi + Kartu Insiden)**:
  - Di balik layar, 55 pasangan relasi digerakkan oleh **Efek Ancaman (*Threat*)** (faksi/sekutu yang terlalu kuat dicurigai termasuk oleh temannya sendiri -> *teman bisa jadi musuh*), **Kelelahan Perang (*War Exhaustion*)** (perang berkepanjangan mendorong gencatan senjata -> *musuh bisa berdamai*), **Pergeseran Kubu Pro/Kontra**, serta **Aksi Pemain / Shadow Syndicate**.
  - Setiap kali skor menembus ambang batas status, mesin menerbitkan **Kartu Insiden** dengan alasan cerita di log Kabar.
- **WD-2.17**: **Parameter Ritme Seimbang & Rumus Tekanan Dunia (aturan LOCKED, angka DEMO)**:
  - **Ambang Relasi 55 Pasangan**: `>= +60` **Alliance** | `+25..+59` **Friendly** | `-24..+24` **Neutral** | `-25..-54` **Cold War** | `-55..-74` **Embargo** | `<= -75` **Open War**.
  - **Rem Keseimbangan Dunia**: Maksimal **3 Open War** & **4 Embargo** bersamaan di peta. *Threat* aktif saat `Kekuatan faksi >= 75` (menggerus relasi termasuk sekutu). Perang berlangsung rata-rata 15-30 hari game sebelum *War Exhaustion* mendorong damai.
  - **Rumus Kandidat Antagonis Babak 2+**: `Skor = 0,35 x Kekuatan + 0,30 x Kubu_Keras + 0,20 x Ketegangan_Rata2 + 0,15 x Aksi_Pemain_Shadow + Acak_Seed(0..15)`. Antagonis yang baru tumbang mendapat jeda *cooldown* **1 babak**.

### WD-3 NPC, Generator, Promosi, dan Hubungan
- **WD-3.01**: Jumlah NPC bertambah bertahap (`Q4`). NPC dibangkitkan secara prosedural (*mix and match* tanpa AI) lalu dapat dipromosikan menjadi NPC kunci gaya *Watch Dogs: Legion* (`Q25`).
- **WD-3.02**: Promosi menjadi NPC kunci memakai 3 jalur sekaligus (mana yang terpenuhi duluan): **misi pribadi**, **kedekatan**, atau **bakat menonjol** (`Q28`).
- **WD-3.03**: Hubungan mencakup persahabatan, rivalitas, dan romansa ringan/soft (`Q5`). NPC dapat aktif, sibuk, atau pergi/pindah, tetapi **tidak bisa mati** (`Q6`).
- **WD-3.04**: NPC berperan ganda sebagai pelanggan, pemasok, dan mentor sekaligus (`Q16`). NPC bereaksi pada senjata tempaan pemain lewat komentar, pesanan khusus, dan hubungan/diskon (`Q17`).
- **WD-3.05**: Interaksi dialog menggunakan menu topik (tap) (`Q14`). Kepribadian NPC berkembang perlahan karena peristiwa & hubungan (`Q15`). Kepribadian Smith terbentuk dari 3 nada pilihan: **Ramah**, **Tegas**, **Jenaka** (`Q24`).

### WD-4 Narasi, Event Director, Kalender, dan Moral Dunia
- **WD-4.01**: Game berjalan 100% offline tanpa AI/API saat bermain. Semua cerita dan kejadian berbentuk data kartu (*pop-up* kartu, `Q21`). Struktur cerita dan konsekuensi dunia yang terasa acak dibangkitkan dari **seed per save** (variabel tersembunyi, jejak lewat log Kabar).
- **WD-4.02**: Nada cerita campuran, bergantian sesuai situasi: epik, santai, gelap (`Q1`). Kejutan kecil sering, kejutan besar jarang (`Q9`). Cabang cerita tidak bergantung hidup-mati (`Q3`).
- **WD-4.03**: Prinsip tanpa tekanan waktu: misi datang dari semua sumber (NPC, kondisi dunia, *Adventurers' Guild*, `Q10`), tanpa batas waktu (`Q11`), dan misi/event serta krisis besar **menunggu tanpa konsekuensi** saat idle (`Q12`, `Q13`). Saat idle hanya simulasi latar (pasar, drift faksi, aktivitas NPC) yang berjalan lalu dirangkum saat kembali (`Q19`) — dirancang untuk sesi pendek 10-20 menit.
- **WD-4.04**: Kalender lengkap dengan hari, bulan, musim, festival, dan hari besar (`Q20`).
- **WD-4.05**: Moral naratif memakai dua stat terpisah: **Mulia** dan **Kejam**, dengan imbalan semi abu-abu. Tambahan stat moral selalu pasti per pilihan (tidak diundi); momen dibagi Sapaan, Dilema, Titik Balik. Tag nilai berpasangan dengan antonim memicu reaksi NPC otomatis. Konsekuensi fisik terwujud lewat Penyelarasan senjata.

### WD-5 Ekonomi, Pasar, dan Harga
- **WD-5.01**: Ekonomi dinamis penuh memakai *supply and demand* (`Q18`). Harga tidak tetap: `Harga = harga_acuan x pengali_pasar`. Bahan tingkat lebih tinggi harus lebih mahal.
- **WD-5.02**: Mata uang 3 tingkat: `1g = 100s = 10.000br` (`1s = 100br`). Semua angka "gold" di file lama dibaca sebagai `br`.
- **WD-5.03**: Material Common dan Uncommon memakai **Grade I / II / III** (cap mutu saat drop, menumpuk terpisah di gudang).
- **WD-5.04**: Harga senjata hasil tempaan dipengaruhi biaya bahan (harga jual terakhir/pasar), nilai kerajinan (Mastery Tempa), mutu (Mastery, stat, dadu mengecil), nilai seni, dan bonus CHA. Mahakarya hanya bisa dicapai dengan bahan langka. Senjata unik bisa dijual, disimpan di galeri, dipakai sendiri, atau diberikan ke NPC.
- **WD-5.05**: Elemen adalah sistem terpisah dari bahan (ditanam lewat Inti Elemen) dan memengaruhi dunia (musim menggeser permintaan elemen, faksi & pelanggan punya afinitas elemen). Mode elemen senjata terdiri dari 3 karakter: **Terkunci**, **Fleksibel**, **Fusi**.

### WD-6 Platform dan Skala Aset Data
- **WD-6.01**: Harus berjalan lancar di laptop dan HP Oppo A54 (RAM < 150 MB, `Q29`). Struktur data disiapkan sampai versi penuh Lv150 (`Q22`), tetapi konten & pemuatan dilakukan bertahap (mulai Demo Lv30).

## 4. USULAN (belum dikonfirmasi)
- **WD-1 Peta & Dungeon (`v1.xlsx`)**:
  - Nama 16 Area, 48 Wilayah, dan 16 Dungeon (6 aktif demo: *Gravebark Warren, Drownedbell Crypts, Thornroot Barrow, Kingless Ossuary, Wailstone Depths, Marrow Warrens*).
  - Rumus level lantai dungeon: `30 x (tier - 1) + ROUNDUP(0,3 x lantai)`.
  - Sebaran faksi desa/pos semi-random (~70% faksi dominan area, seed per save); 27 lokasi bertrait *Bertentangan* menjadi kantong faksi/ras asing.
  - Tambahan kolom CSV `Induk` dan `Isu lokal`; 30-45 templat isu berjenjang.
- **WD-3 NPC & Event Director**:
  - Jenjang prototipe Tidewrack: Warga -> Dikenal (3 pertemuan) -> Calon (maks 5) -> Kunci (maks 12); 8 arc; 20 sifat berpasangan; kedekatan 0-99; 30% NPC faksi acak; tambahan kelas sosial (elit/warga/terpinggir) & posisi konflik (loyalis/ragu/penengah).
  - Antrean Event Director 3-5 kartu (festival -> misi/krisis -> kejutan kecil; maks 1 kejutan besar/sesi); krisis 5 fase; skala waktu 1 hari game = 30 menit nyata; simulasi offline detail maks 7 hari game lalu agregat.
- **WD-5 Ekonomi S&D**:
  - `harga = acuan x (D / S)^k` (`k = 0,5`, batas `x0,4` s.d `x2,5`), pemulihan 12 jam nyata; rasio acuan rarity `1 : 4 : 16 : 60 : 300`; pengali wilayah `x1 / x2,5 / x4`; selisih beli-jual toko 50-60%; state S/D hanya disimpan untuk barang yang pernah diperdagangkan; bonus CHA `+1%`/poin di atas 10 (cap `+25%`).
- **WD-6 Ekosistem & Platform**:
  - `v1.xlsx`: 4.864 musuh, 208 material, 480 trofi, 19.952 baris drop. Platform web app/PWA dengan save JSON + ekspor/impor; pecah data per area (16 file + efek bersama), muat per tier level.

## 5. Inventaris Aset Data Dunia di Repositori
| File di Repo | Peran dalam WD | Status / Catatan |
| :--- | :--- | :--- |
| `data/factions.csv` | **Database bersih `WD-2`**: 11 faksi wilayah + 3 organisasi, kubu Pro/Kontra, kebutuhan senjata | **AKTIF / BERSIH** (selaras `WD-2.05` s.d `WD-2.17`) |
| `data/faction_relations.csv` | **Database bersih `WD-2`**: 55 pasangan relasi awal 11 faksi, label Rival Sejarah, poros konflik | **AKTIF / BERSIH** (Hari-0 patuh rem keseimbangan: 4 Embargo, 0 Open War) |
| `Battle-Smith_RPG_Peta_Dunia_Musuh_v1.xlsx` | Database mentah geografi, dungeon, musuh, drop, material, trofi (19 sheet) | 5,3 MB (64 MB *uncompressed*), perlu dipecah ke `data/` ringan (`WD-1` & `WD-6`) |
| `lokasi_peta_dunia.csv` | 77 permukiman mentah | **BUG**: kolom `Level` rusak (`10-Jan`, `20-Nov`); nama faksi/lokasi masih Indonesia (target rapikan di `WD-1`) |
| `Spesifikasi Narasi dan NPC Battle-Smith RPG.docx` | Sumber Q1-Q29 | Daftar 9 faksi lama sudah tergantikan |
| `Battle-Smith RPG RPG Naratif-Moral Berbasis Faksi...docx` | Sumber 5 ras, tema kota besar, isu berjenjang, Mulia/Kejam | 6 keluarga senjata = parkir ke CD |
| `Laporan Sesi Desain Battle-Smith.docx` | Sumber ekonomi S&D, harga bahan & tempaan, Grade I-III | Ada file duplikat identik `(1).docx` |
| `Balai Kenalan Tidewrack_ Prototipe Generator NPC.html` | Prototipe generator NPC & log Kabar | Masih memuat Google Fonts eksternal |

## 6. KONFLIK & Aturan Lama yang Tergantikan
### 6a. Aturan lama yang tergantikan (jangan dipakai)
- Daftar lama **9 faksi organisasi** (`Spesifikasi Narasi` Bagian 8) digantikan oleh **Struktur 2 Lapisan (`WD-2.05`)**.
- Penamaan faksi/organisasi/lokasi berbahasa Indonesia digantikan oleh **Konvensi Penamaan Inggris (`WD-2.13`)**.
- Gagasan *Hierarki Iblis* sebagai antagonis permanen hitam-putih digantikan oleh **11 Faksi Abu-Abu + Siklus Antagonis Dinamis (`WD-2.06`, `WD-2.09`)**.
- Matriks relasi statis digantikan oleh **Mesin Diplomasi Dinamis (`WD-2.16`, `WD-2.17`)**.

### 6b. KONFLIK & Kosakata yang masih perlu disatukan
1. **Istilah "Resonansi" (3 arti)**: tahap upgrade senjata Unique vs keselarasan elemen-bahan vs pengisian bar item moral Mulia/Kejam.
2. **Jumlah Elemen (6 vs 13)**: 6 elemen di spesifikasi Narasi vs 13 tipe damage D&D di `v1.xlsx`.
3. **Skala Data Monster & RAM Oppo A54**: 100 monster di `master_CD_v3.1.md` vs 4.864 monster unik (+19.952 drop) di `v1.xlsx`.
4. **Arti Batas Level Dungeon**: level monster maks di lantai 100 (`v1.xlsx`) vs batas level pemain masuk (`master_CD_v3.1.md`).
5. **Event Moral "Aktif Saja" vs Sesi Pendek**: perlu diselaraskan lewat antrean Event Director.
6. **Lintas Chunk (Parkir ke CD)**: 5 vs 6 tingkat kualitas; 36 senjata vs 10 jenis senjata Unique di `v1.xlsx`.

## 7. OPEN (Daftar Keputusan Terbuka WD)
- **WD-1**: Konfirmasi nama 16 Area/48 Wilayah/16 Dungeon; kepastian arti batas level dungeon; sistem tier antar-area di Lv150; komposisi ras minoritas 5 kota besar; perbaikan bug tanggal `lokasi_peta_dunia.csv` + pembaruan nama Inggris (`WD-2.13`) + penambahan kolom `Induk` dan `Isu lokal` ke `data/locations.csv`.
- **WD-2**: **SELESAI** (seluruh angka DEMO siap dituning saat simulasi).
- **WD-3**: Kedalaman romansa ringan; rekrut NPC jadi pegawai bengkel vs murid (`CD-6.01`)/sekutu/pelanggan; potret NPC vs ikon/warna; matriks sifat ke tag nilai moral.
- **WD-4**: Keputusan final *endless* vs ending opsional + tujuan jangka panjang; konfirmasi skala waktu (1 hari = 30 menit); nama dunia & kota awal; 30-45 templat isu berjenjang; pilihan bahasa teks (ID saja vs dwibahasa); penamaan ulang 3 arti "Resonansi".
- **WD-5**: Kalibrasi nominal bronze/silver/gold berbasis waktu menabung (Lv10/20/30) + daftar *gold sink*; parameter final S&D (`k`, batas harga, kedalaman pasar, pemulihan 12 jam); definisi "harga jual terakhir" tahan eksploitasi; mekanisme harga per kota/embargo/perang; apakah Trofi Monster boleh diperdagangkan.
- **WD-6**: Keputusan 100 musuh unik/wilayah vs template biome untuk Oppo A54 (< 150 MB); pemecahan `v1.xlsx` ke `data/` CSV/JSON; pembersihan file duplikat/DEMO lama di repo; konfirmasi jalur PWA.

## 8. Format Laporan Perubahan (isi tiap akhir sesi)
```text
LAPORAN PERUBAHAN
Versi master yang dipakai: WD v1.2
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
- **v1.0 (19 November 2026)**: Konsolidasi perdana World Development dari seluruh aset dunia di repo, diselaraskan dengan kontrak baca-saja `master_CD_v3.1.md`.
- **v1.1 (19 November 2026)**: Fondasi politik `WD-2` (`WD-2.05` s.d `WD-2.14` LOCKED).
- **v1.2 (19 November 2026)**: **Penuntasan `WD-2` 100%** (`WD-2.15` s.d `WD-2.17` LOCKED: kubu 5 kota besar, mesin diplomasi dinamis *Threat + War Exhaustion + Kartu Insiden*, ritme seimbang maks 3 Open War & 4 Embargo, rumus Tekanan Dunia) + ekspor database bersih `data/factions.csv` (14 entitas) dan `data/faction_relations.csv` (55 pasangan).
