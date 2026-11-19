BATTLE-SMITH RPG: MASTER CHARACTER DEVELOPMENT (CD) v3.1
Dokumen ini berdiri sendiri. AI yang membacanya tidak punya riwayat percakapan sebelumnya. Baca seluruhnya sebelum bekerja.
0. Aturan kerja untuk AI pembaca
Proyek: Battle-Smith RPG, game idle/RPG blacksmith + petualangan. Bahasa Indonesia, ringkas, nyaman dibaca di HP.
PRJ-01 (LOCKED): fokus backend dulu (data, rumus, aturan, simulasi). Frontend/UI ditunda sampai fondasi selesai.
Label: LOCKED = sudah disetujui pengguna. USULAN = belum dikonfirmasi. DEMO = angka sementara. Semua angka DEMO.
Satuan: br = bronze (1g = 100s = 10.000br). S = Smith. Rep = reputasi.
Tiap topik: 2-3 opsi (A/B/C) dengan plus/minus, lalu satu rekomendasi. Maksimal satu pertanyaan per balasan.
Usulan yang tidak dikeberatkan pengguna dianggap LOCKED dan harus disebut eksplisit. Pilihan pengguna mengalahkan rekomendasi AI.
Jangan mengubah LOCKED di luar chunk milikmu. Bila perlu, tandai KONFLIK di laporan.
Jangan menghidupkan kembali aturan di bagian 6 (aturan lama yang tergantikan).
Awal sesi: sebut 5 nilai LOCKED dari dokumen ini (contoh kuota XP, cap stat, kelipatan zona) untuk membuktikan kamu membaca versi terbaru.
Akhir sesi: tulis Laporan Perubahan memakai format di bagian 8.
1. Pembagian chunk
CD-1 stat, level, XP, tier. CD-2 skill, title, un-fuse. CD-3 Smith type dan perk. CD-4 senjata dan anggaran poin. CD-5 armor dan bertahan. CD-6 murid. CD-7 kutukan dan idle. Pemilik chunk: belum diputuskan. Saran (USULAN, belum dipilih pengguna): Claude memegang Karakter dan Battle (CD-1 sampai CD-7, monster, zona), Gemini memegang World Development. Chunk World Development (peta, toko, ekonomi, monster, Guild, hierarki iblis) dikerjakan terpisah dan tidak dibahas di sini.
2. Kontrak lintas chunk (baca saja)
Skala demo: level maksimal 30. Tier S: Magang Lv1-10, Journeyman Lv11-20, Master Lv21-30. Cap stat 10/20/30. Naik tier = lulus Gate (boss).
HP = 20 + 5 x CON + 5 x tier. Stamina = 100 + 5 x CON. Modifier d20 = floor(stat/2).
Peluang +1% per poin, cap +20% per jenis. Parry, dodge, critical memakai cap bonus peluang bersama +30%.
Damage +1 per 2 STR. Mitigate +1 per 2 CON (USULAN cap 50% damage mentah).
Damage monster = damage dasar x kelipatan zona x faktor selisih. Zona Lv1-10 x1, Lv11-20 x1,5, Lv21-30 x2,25 (rumus dan kelipatan LOCKED; pemetaan zona ke tier level, dan dungeon tier 1 dengan batas level 30 x tier, masih USULAN). Faktor selisih = 1 + 0,1 x (level monster - level pemain), batas x0,5 sampai x2,0.
Rumus monster (DEMO, dari CSV): HP = 15 + 10 x level, damage dasar = 1,5 + 0,4 x level. Peran mengubahnya (Serang HP x0,85 dan damage x1,25, Bertahan HP x1,4 dan damage x0,8, Seimbang tetap).
Anggaran poin senjata = 100 + 15 x (tier - 1).
3. Keputusan LOCKED
CD-1 Stat, level, XP

CD-1.01: 6 stat (STR, DEX, CON, INT, WIS, CHA), mulai di 1, +5 poin bebas, latar belakang maksimal 2 poin dari 3 stat pilihan, +2 poin per level. Total poin = 13 + 2 x (level - 1).
CD-1.02: peran stat. STR damage dan +N. DEX akurasi, AC, parry, dodge, kecepatan tempa. CON HP, stamina, hemat bahan, Mitigate. INT Smith's Tools, rarity tempa, slot rune, kapasitas Macro dan trigger, elemen. WIS drop langka, critical, penilaian pasar. CHA harga jual, Rep Toko, murid, debuff dan buff sekutu.
CD-1.03: latar belakang. Pandai Besi (STR, CON, INT), Pemburu (DEX, CON, WIS), Pedagang (CHA, INT, WIS), Prajurit (STR, DEX, CON), Pelajar (INT, WIS, CHA), Pengembara (STR, DEX, CHA).
CD-1.04: dua bar XP (Battle dan Smith). Level naik bila keduanya penuh. Kuota tiap bar = 60 x L^1,1. Cap XP/jam 600 (Lv1-10), 900 (Lv11-20), 1.200 (Lv21-30). Carry-over maksimal 50% kuota level berikutnya.
CD-1.05: kelebihan XP menjadi muatan buff silang (Battle ke Smith, Smith ke Battle). Hanya menambah performa idle, tidak menyentuh XP, tidak menumpuk melewati cap.
CD-1.06: idle hanya satu mode (Battle atau Smith). Waktu minimum (DEMO): Lv10 = 11 jam, Lv20 = 37 jam, Lv30 = 72 jam idle.
CD-1.07: skala demo berakhir di Lv30. Versi penuh Lv150 ditunda: tier tambahan tiap 30 level (Lv31-60, 61-90, 91-120, 121-150), cap XP/jam setelah Lv30 = 1.200 + 25 per level. Cap stat dan poin per level setelah Lv30 belum diputuskan.

CD-2 Skill, title, un-fuse

CD-2.01: 36 skill breakpoint (6 stat x 6). Pasif di stat 5/15/25, aktif (cooldown) di 10/20/30. Tema: STR serangan berat, DEX menghindar, CON Mitigate, INT elemen, WIS critical dan deteksi, CHA debuff dan buff sekutu. Skill DEX 10 memberi +10% parry sementara.
CD-2.02: title dihitung saat naik level. Spesialis bila stat terbesar unggul minimal 2 poin: +5% damage dan akurasi senjata sejenis, -5% senjata jenis lain. Bila tidak: Seimbang, tanpa penalti jenis senjata, plus muatan buff silang +10% lebih efisien. Corrupted tidak mengubah title.
CD-2.03: un-fuse. 1 respec gratis per tier S, selebihnya 100br x level x poin x (1 + 0,25 x title unik), batas x4. Ganti perk memakai jatah yang sama (USULAN).

CD-3 Smith type dan perk

CD-3.01: 5 Smith type: Weaponsmith, Armorer, Reforger, Runesmith, Rangesmith (khusus senjata jarak jauh). Dipilih setelah Gate pertama. Tingkat 1-5. Type utama laju penuh sampai 5, type tambahan laju 50% maksimal 3.
CD-3.02: bonus dasar +6% per tingkat utama (maksimal +30%). Spesialis dapat perk di tingkat 3 dan 5. Gabungan dapat +3% per tingkat tambahan (maksimal +9%), tanpa perk. Nama: awalan tingkat utama (Raw, Tempered, Honed, Grand, Paragon) + akar pasangan + julukan tingkat tambahan. Akar pasangan Rangesmith belum dibuat.
CD-3.03: perk (nama Inggris). Tingkat 3 = 6 perk stat tunggal (stat terkait minimal 10). Tingkat 5 = 15 perk hibrida pasangan stat (kedua stat minimal 15, contoh STR+DEX = Venomed Blade). Pilih 1 per tingkat. Ganti perk = un-fuse.
CD-3.04: Runesmith slot rune per rarity (Common 0 sampai Unique 5), peluang retak cabut rune = 35% - 1% x INT (minimal 5%). Reforger pindah +N dengan penalti -2 (tingkat 1-2) atau -1 (tingkat 3-5), biaya 50% biaya enhance.

CD-4 Senjata dan anggaran poin

CD-4.01: 36 senjata, tiap stat 6 tier (tier 1 = awal). STR: Kapak Perang, Kapak Besar, Palu Perang, Pedang Besar, Gada Berduri, Maul. DEX: Belati, Pedang Pendek, Belati Kembar, Katana, Busur Pendek, Busur Panjang. CON: Gada Penjaga, Flail Baja, Gauntlet Baja, Palu Penjaga, Rantai Berduri, Pedang Penjaga. INT: Tongkat Rune, Pedang Rune, Palu Rune, Sabit Arcane, Cakram Rune, Rantai Rune. WIS: Tombak, Trisula, Naginata, Tongkat Bo, Tombak Lempar, Tombak Pemburu. CHA: Rapier, Saber, Pedang Bangsawan, Tongkat Penguasa, Cambuk Dagang, Pedang Upacara.
CD-4.02: syarat pakai (ketiganya berlaku). Stat minimal = tier + rarity (Common +0, Uncommon +4, Rare +8, Epic +12, Legendary +16, Unique +20). Level minimal = tier + rarity (+0, +3, +6, +10, +15, +20). Stat di bawah syarat memberi penalti (senjata akurasi -1 per poin).
CD-4.03: anggaran dibagi ke damage, speed, accuracy, defense, trigger (persen). Profil: STR 40/15/15/5/25, DEX 25/25/20/5/25, CON 25/15/15/25/20, INT 20/15/15/5/45, WIS 30/15/25/10/20, CHA 25/20/25/5/25. Batas per komponen: damage 15-50%, speed 5-30%, accuracy 5-30%, defense 0-30%, trigger 15-60%. Bobot (tebakan): damage 4 poin per 1, speed dan accuracy 1 poin per 1%, defense 2 poin per 1%. Kelebihan trigger memakai poin, kekurangan mengembalikan poin.
CD-4.04: pembeda jarak di DEX. Tiap senjata bertag Dekat atau Jauh, jumlah senjata tetap 36. Dekat bisa parry. Jauh tidak bisa parry, dodge dan akurasi lebih tinggi, damage dasar lebih rendah atau stamina lebih boros. Angka belum ditetapkan.

CD-5 Armor dan bertahan

CD-5.01: DEX menghindar (parry, dodge, AC). CON mengurangi damage yang lolos lewat Mitigate.
CD-5.02: armor 5 slot, AC: Zirah 40%, Perisai 25%, Helm 15%, Sarung 10%, Sepatu 10%. Kelas ditentukan bahan: ringan (dodge dan parry +8%), berat (Mitigate +10%, kecepatan -5%), sedang = setengah keduanya plus resist elemen +5% (menunggu elemen).

CD-6 Murid dan CD-7 Kutukan, idle

CD-6.01: murid punya 3 atribut (bakat, laju belajar, loyalitas), batas 5 murid (USULAN total). Pemain pilih fokus latihan. Murid pilihan jadi pemilik toko saat pemain pindah.
CD-7.01: stamina hanya di idle (Battle atau Smith, laju Battle lebih besar). Offline cap 8 jam. Kalah Gate = satu kutukan acak (debuff per stat maksimal -4, total 13+ tidak bisa bertarung).
4. USULAN (belum dikonfirmasi)
36 weapon trigger (satu per senjata, kelebihan dan kekurangan). Hanya Twister (Kapak Perang) dan Heavy Chain (Palu Perang) berasal dari GDD asli. Daftar nama: STR Twister, Cleave, Heavy Chain, Breaker Edge, Spike Burst, Earthbreaker. DEX Quick Stab, Riposte, Dual Flurry, Iaijutsu, Quick Draw, Piercing Shot. CON Guard Strike, Swing Lash, Counter Fist, Bulwark Slam, Thorn Chain, Sentinel Oath. INT Arcane Bolt, Rune Edge, Resonance Hammer, Soul Reap, Orbit Discs, Binding Chain. WIS Keen Thrust, Triple Prong, Sweeping Arc, Disarm Sweep, Tracker Mark, Prey Sense. CHA Feint, Rally Cut, Noble Challenge, Command Aura, Debt Lash, Grand Ovation.
Tag Jauh: Busur Pendek, Busur Panjang, Tombak Lempar, Cakram Rune. Senjata jarak jauh baru (crossbow, senapan fantasi) agar Rangesmith tidak sempit. Gunslinger ditunda.
Profil anggaran Jauh (opsi A): damage 25 / speed 20 / accuracy 30 / defense 0 / trigger 25.
Mikro-bonus tiap poin stat 1-4 (berhenti di stat 5). Mitigate cap 50% damage mentah.
5. Temuan beta test senjata (Lv10 vs monster Lv10, DEMO)
STR bertahan 1,5-2 kali lebih lama dari stat lain di tier yang sama, karena damage +1 per 2 STR ada di atas anggaran senjata.
CON paling lemah (DPS sekitar setengah STR). Bobot defense 2 poin per 1% tidak cukup.
Jauh tidak terlalu kuat dengan nilai awal (dodge +8%, damage x0,9, stamina x1,2).
Di Lv30 monster terlalu keras karena kelipatan zona x2,25.
Opsi penyetelan belum dipilih: A (bonus stat non-STR), B (kurangi damage anggaran STR), C (naikkan bobot defense dan trigger CON dan CHA). Rekomendasi: B dan C.
5b. Model simulasi dan data (DEMO)
Dipakai beta test senjata (HTML) dan monster_stats.csv. Semua angka DEMO dan mudah diganti.

Model beta test

Alokasi stat pemain: stat utama senjata 60% poin bebas, lalu urutan CON, DEX, WIS, STR, INT, CHA (tanpa stat utama) dengan porsi 25% dan 15%. Sisa poin mengisi sampai cap.
Peluang kena = 75% + akurasi senjata + min(20, DEX) + 5 (title), maksimal 95%.
Dodge = min(20, DEX x 0,5)% (+8% untuk senjata Jauh). Parry = min(20, DEX x 0,5)% hanya senjata Dekat. Critical = min(20, WIS)%, damage x2. Jumlah dodge, parry, dan critical dibatasi 30%.
Senjata dari anggaran: damage = poin damage / 4, speed dan accuracy (%) = poinnya, defense (%) = poin / 2. Kecepatan serang dasar 1 per detik x (1 + speed).
Damage per pukulan = (damage senjata + floor(STR/2) + bonus trigger) x 1,05 (title) x 0,9 (Jauh).
Trigger (abstraksi): efektif = poin trigger x 0,8 x (1 + 1% x stat utama). INT x0,5 bila musuh tanpa kelemahan. STR, DEX, INT, WIS: tambah damage efektif/4. CON: pengurang damage efektif/2 (%). CHA: tambah damage efektif/8 dan pengurang efektif/4 (%). Pengurang total maksimal 60%.
Monster menyerang 1 kali per detik, akurasi 80%. Damage diterima = (mentah - min(CON/2, 50% mentah)) x (1 - pengurang).
Metrik: kill per HP bar. Stamina idle Battle = (100 + 5 x CON) / (25 per jam x pengali Jauh 1,2).
Parameter Jauh (DEMO): dodge +8%, damage x0,9, stamina x1,2.

monster_stats.csv (USULAN dari nol; daftar asli GDD v2 belum tersedia)

100 monster, 17 kolom: id, nama, zona, kelipatan_zona, tier_bahan_bintang, level, tipe, afinitas_stat, peran, hp, dmg_dasar, dmg_setelah_zona, kecepatan_serang_per_detik, akurasi_pct, dodge_pct, armor_pct, punya_kelemahan.
Zona Rendah 34, Menengah 32, Tinggi 34. Tipe: 82 Normal, 15 Elit, 3 Boss (satu per zona di Lv10/20/30).
Dasar: HP = 15 + 10 x level, damage = 1,5 + 0,4 x level. Peran: Serang (HP x0,85, damage x1,25), Bertahan (HP x1,4, damage x0,8), Seimbang (tetap). Elit: HP x2, damage x1,3, dodge +3, armor +5. Boss: HP x5, damage x1,5, dodge +3, armor +10.
Afinitas (peran, kecepatan, akurasi, dodge, armor): STR Serang 0,9/80/3/10. DEX Serang 1,3/85/15/0. CON Bertahan 0,8/75/0/25. INT Serang 1,0/90/5/0. WIS Seimbang 1,1/80/10/0. CHA Seimbang 1,0/80/8/0.
Kolom punya_kelemahan masih placeholder (Y untuk afinitas INT dan CON), menunggu sistem elemen.
6. Aturan lama yang tergantikan (jangan dipakai)
Kuota XP 60 x L^1,5 diganti 60 x L^1,1.
Level maksimal 30 sebagai batas permanen diganti: demo Lv30, versi penuh Lv150.
Gagasan level 999 dan kurva XP lebih curam dibatalkan.
Smith type 4 diganti 5. Pilihan Bow (Bladewright atau type ke-7) gugur, digantikan Rangesmith.
"Seimbang = buff lebih kecil" dan "1 murid per toko" sudah dihapus (sejak GDD v2).
7. OPEN
Pemilik chunk dan pembagian AI. Penyetelan temuan beta test. XP dan drop anti-farm menurut selisih level. Level monster di daftar asli dan bagian drop U/T/L. Skala damage monster atau kelipatan zona di Lv30. Daftar 21 perk (belum dibuat, hanya Venomed Blade yang diketahui). Macro, slot trigger Armorer, penalti mati, biaya Long Rest, rumus +N final. Elemen dan resist armor sedang. Ujian murid dan pewarisan toko. Rarity dan +N di anggaran senjata. Bobot anggaran poin. 36 trigger belum disimulasikan satu per satu. Cap stat dan tier di atas Lv30 (versi penuh).
8. Format Laporan Perubahan (isi tiap akhir sesi)
LAPORAN PERUBAHAN
Versi master yang dipakai: v3.1
Chunk: CD-?
Tanggal sesi: ...
1. Keputusan baru (ID, isi, status LOCKED/USULAN)
2. Aturan lama yang tergantikan
3. Nilai kontrak lintas chunk yang disentuh
4. KONFLIK dengan chunk lain (jika ada)
5. OPEN baru
6. Parkir (topik milik chunk lain)
9. Log versi
v3.0: basis GDD v2 dan perubahan sampai pembahasan Smith type ke-5 dan pembeda jarak DEX.
v3.1: tambah PRJ-01 (fokus backend), bagian 5b (model simulasi dan spesifikasi CSV monster), status LOCKED rumus damage monster, OPEN diperbarui. Saran pembagian AI tercatat sebagai USULAN.
