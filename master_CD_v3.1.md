BATTLE-SMITH RPG: MASTER CHARACTER DEVELOPMENT (CD) v3.3
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
Skala penuh (Mode Full): level maksimal 150 (16 Area, 5 Tier WD; Tier t = level 30 x (t - 1) + 1 s.d. 30 x t: Tier 1 Lv1-30, Tier 2 Lv31-60, Tier 3 Lv61-90, Tier 4 Lv91-120, Tier 5 Lv121-150). Cap stat tiap tier: 30 / 60 / 90 / 120 / 150. Naik tier = lulus Gate (boss).
Istilah lintas chunk (LOCKED, selaras WD-4.06): Resonance = tahap upgrade Unique (milik CD). Attunement = keselarasan elemen-bahan. Conscience = bar moral item.
HP = 20 + 5 x CON + 5 x tier. Stamina = 100 + 5 x CON. Modifier d20 = floor(stat/2).
Peluang +1% per poin, cap +20% per jenis. Parry, dodge, critical memakai cap bonus peluang bersama +30%.
Damage +1 per 2 STR. Mitigate +1 per 2 CON (USULAN cap 50% damage mentah).
Damage monster = damage dasar x kelipatan zona (5 Tier) x pengali role x pengali tipe x faktor selisih. Kelipatan zona 5 Tier (LOCKED): Tier 1 (Lv1-30) x1,0; Tier 2 (Lv31-60) x1,25; Tier 3 (Lv61-90) x1,5; Tier 4 (Lv91-120) x1,75; Tier 5 (Lv121-150) x2,0. Faktor selisih = 1 + 0,1 x (level monster - level pemain), batas x0,5 sampai x2,0.
Rumus monster (berlaku untuk 4.864 musuh di data/areas/*.json WD): HP dasar = 15 + 10 x level, damage dasar = 1,5 + 0,4 x level. Pemetaan 5 Role WD dan 4 Tipe WD mengikuti tabel LOCKED di Bagian 5b.
Elemen (LOCKED, selaras WD-6.05): 6 Elemen + Neutral (Fire, Ice, Lightning, Earth, Light, Dark, Neutral). Serangan sesuai weak musuh = Weakness Exploit (+25% damage dasar + skala sub-stat INT). Serangan sama dengan el musuh = -25% damage (Neutral tetap x1,0).
Anggaran poin senjata = 100 + 20 x (tier - 1) + bonus_rarity (Common +0, Uncommon +10, Rare +22, Epic +36, Legendary +52, Unique +75).
3. Keputusan LOCKED
CD-1 Stat, sub-stat, level, XP

CD-1.01: 6 stat utama (STR, DEX, CON, INT, WIS, CHA), mulai di 1, +5 poin bebas, latar belakang maksimal 2 poin dari 3 stat pilihan, +2 poin per level sampai Lv150. Total poin = 13 + 2 x (level - 1) (311 poin di Lv150 dari total kapasitas 900).
CD-1.02: peran stat utama. STR damage dan +N. DEX akurasi, AC, parry, dodge, kecepatan tempa. CON HP, stamina, hemat bahan, Mitigate. INT Smith's Tools, rarity tempa, slot rune, kapasitas Macro dan trigger, elemen. WIS drop langka, critical, penilaian pasar. CHA harga jual, Rep Toko, murid, debuff dan buff sekutu.
CD-1.02b: 60 Sub-Stat (10 Sub-Stat per Stat Utama: 6 Tempur + 4 Profesi/Smith). Semua sub-stat naik otomatis mengikuti nilai Stat Utamanya. Pemain memilih 2 Sub-Stat Fokus per Stat Utama (total 12 fokus aktif) yang mendapat bonus +25% efisiensi (ganti fokus mengikuti aturan un-fuse CD-2.03).
- STR: (Tempur) 1. Raw Might, 2. Heavy Impact, 3. Armor Crush, 4. Cleave Force, 5. Weapon Weight, 6. Brawn Guard; (Profesi) 7. Hammer Strike, 8. Enhance Power (+N), 9. Alloy Shaping, 10. Carry Load.
- DEX: (Tempur) 1. Accuracy, 2. Attack Speed, 3. Evasion (Dodge), 4. Parry Reflex, 5. Armor Mobility (AC), 6. Ranged Draw; (Profesi) 7. Forge Speed, 8. Fine Engraving, 9. Mechanism Craft, 10. Quick Salvage.
- CON: (Tempur) 1. Max Vitality (HP), 2. Mitigate, 3. Thick Hide (Armor), 4. Battle Stamina, 5. Poise (Tenacity), 6. Curse & Blight Resist; (Profesi) 7. Forge Stamina, 8. Material Conservation, 9. Heat Tolerance, 10. Quench Stability.
- INT: (Tempur) 1. Elemental Potency, 2. Weakness Exploit, 3. Trigger Mastery, 4. Elemental Barrier, 5. Spell/Arcane Accuracy, 6. Macro Capacity; (Profesi) 7. Smith's Tools Mastery, 8. Rune Slotting, 9. Safe Extraction, 10. Attunement Craft.
- WIS: (Tempur) 1. Critical Chance, 2. Critical Severity, 3. Enemy Sense, 4. Foresight, 5. Tactical Rhythm, 6. Counter Window; (Profesi) 7. Rare Drop Hunting, 8. Market Appraisal, 9. Trophy Curation, 10. Material Purity Sense.
- CHA: (Tempur) 1. Intimidate (Dread), 2. Break Morale, 3. Rally Ally, 4. Protective Command, 5. Battlefield Presence, 6. Conscience Alignment; (Profesi) 7. Trade Bargaining, 8. Shop Reputation, 9. Apprentice Leadership, 10. Faction Diplomacy.
CD-1.03: latar belakang. Pandai Besi (STR, CON, INT), Pemburu (DEX, CON, WIS), Pedagang (CHA, INT, WIS), Prajurit (STR, DEX, CON), Pelajar (INT, WIS, CHA), Pengembara (STR, DEX, CHA).
CD-1.04: dua bar XP (Battle dan Smith). Level naik bila keduanya penuh. Kuota tiap bar = 60 x L^1,1. Cap XP/jam 600 (Lv1-10), 900 (Lv11-20), 1.200 (Lv21-30), dan setelah Lv30 = 1.200 + 60 x (L - 30) (mencapai 8.400 XP/jam di Lv150). Carry-over maksimal 50% kuota level berikutnya.
CD-1.05: kelebihan XP menjadi muatan buff silang (Battle ke Smith, Smith ke Battle). Hanya menambah performa idle, tidak menyentuh XP, tidak menumpuk melewati cap.
CD-1.06: idle hanya satu mode (Battle atau Smith). Waktu minimum: Lv10 = 11 jam, Lv20 = 37 jam, Lv30 = 72 jam idle, dan target total sampai Lv150 = ~720 jam idle (12 tahun kalender in-game dengan patokan WD 60 jam idle = 1 tahun).
CD-1.07: Mode Full Lv1-150 aktif (5 Tier, tiap Tier 30 level: Lv1-30, 31-60, 61-90, 91-120, 121-150). Cap stat per tier: 30 / 60 / 90 / 120 / 150 (+30 tiap tier). Poin stat per level tetap +2 sampai Lv150.
CD-1.08: Anti-Farm XP & Drop menurut selisih level (delta = level_monster - level_pemain, skala Lv1-150, LOCKED): delta >= +5 mendapat XP x1,25 dan Drop x1,15; rentang ideal -5 <= delta <= +4 mendapat XP 100% dan Drop 100%; rentang -6 >= delta >= -15 turun linear -8% XP dan -5% Drop per level di bawah -5 (pada delta = -15: XP 20%, Drop 50%); delta < -15 memberi XP 0% (anti-farm XP di zona level rendah) tetapi Drop Bahan tetap minimal 25% (+ bonus sub-stat WIS Rare Drop Hunting agar crafter tetap bisa mengumpulkan bahan Tier bawah).

CD-2 Skill (5 Pohon Tipe Smith: SWTOR × RF Classic GM × Amalur Destiny), title, un-fuse

CD-2.01: Sistem Skill Hibrida 5 Pohon Tipe Smith — SWTOR Ability Tree × RF Online Classic Mastery (Lv.1-7/GM) × Kingdoms of Amalur Destiny Cards (125 Node Class Total = 5 Smith Class x 5 Tier x [1 Active/Buff + 1 Core Passive + 3 Morph Choice], spesifikasi lengkap di docs/BLUEPRINT_SKILL_TREE_DESTINY_v3.3.md; migrasi kode engines/skill_engine/ menunggu tahap coding).
- 5 Pohon Skill Tipe Smith & Mekanik Unik (Resource):
  1. Weaponsmith (Forge Heat 0-5)
  2. Armorer (Bastion Guard 0-5)
  3. Rangesmith (Hunter's Mark 0-5)
  4. Runesmith (Elemental Charge 0-3 + 6 Reaksi Fusi Hibrida)
  5. Reforger (Overclock 0-5 + Sinergi +N & Companion)
- Struktur 5 Baris Tier per Smith Class (terbuka sesuai alokasi 5 Poin Tier CD-3.01) & Anti-Spam Cooldown:
  - Tier 1 (Basic): Opener / Builder (CD ~4-5d).
  - Tier 2 (Expert): Class Buff ala RF Classic (CD ~26-30d, durasi ~16-18d).
  - Tier 3 (Elite): Defensive / Interrupt pembatal Cast Bar ala SWTOR (CD ~12-14d).
  - Tier 4 (Master): Core Combo / Execute pengonsumsi Resource (CD ~9-10d).
  - Tier 5 (Apex — eksklusif 5 poin murni 1 class): Signature Ultimate (CD ~28-34d).
  - Seluruh skill memakai Cooldown individual + Global Cooldown (GCD ~1,2-1,5d) agar tidak bisa spam 1 tombol; jeda diisi Auto-Attack & rotasi tombol lain.
- Sistem Latihan "Use-to-Level" ala RF Online Classic (Lv.1 -> Lv.7 / GM):
  - Setiap Active Skill, Class Buff, dan Weapon Skill naik level otomatis saat dipakai (manual maupun lewat Mode Idle Battle 8 jam): Lv.1 s.d. Lv.7 (GM: +40% efektivitas, -10% CD, bonus puncak Morph).
  - Pembukaan di dalam Tier: Active/Buff langsung terbuka saat menanam Poin Tier -> mencapai Skill Lv.3 membuka Core Passive -> mencapai Skill Lv.5 membuka Pilihan Morph 1-dari-3 SWTOR (1. Offense, 2. Defense/Companion, 3. Forge Synergy).
- Active Macro Bar + 1 Tombol Khusus Weapon Skill (48 Trigger):
  - Kapasitas slot skill Class di Macro Bar tetap ditentukan Sub-Stat INT #6 (Macro Capacity): skor 1-29 = 3 slot, 30-74 = 4 slot, 75-119 = 5 slot, 120+ = 6 slot.
  - Ditambah 1 Tombol Khusus "Weapon Skill" (CD ~6-8d) yang berubah otomatis sesuai 48 Senjata terpasang (48 Weapon Trigger menjadi skill aktif, terbuka bila punya min. Tier 1 Smith Class cocok sesuai CD-3.02).
  - 6 Stat Utama (STR..CHA) tetap menggerakkan 60 Sub-Stat (CD-1.02b), syarat senjata, stat tempur, dan kapasitas Macro Bar.
CD-2.02: title dihitung saat naik level. Spesialis bila stat terbesar unggul minimal 2 poin: +5% damage dan akurasi senjata sejenis, -5% senjata jenis lain. Bila tidak: Seimbang, tanpa penalti jenis senjata, plus muatan buff silang +10% lebih efisien. Corrupted tidak mengubah title.
CD-2.03: un-fuse. 1 respec gratis per tier S, selebihnya 100br x level x poin x (1 + 0,25 x title unik), batas x4. Ganti perk, ganti distribusi 5 Poin Tier Smith, ganti pilihan Morph 1-dari-3, dan ganti 2 Sub-Stat Fokus memakai jatah yang sama. (Ganti Kartu Destiny aktif yang syarat poinnya sudah terpenuhi mengikuti aturan terpisah di CD-3.02b.)

CD-3 Smith type, anggaran 5 tier, 29 Kartu Destiny 1-kata, dan mazhab barang (LOCKED)

CD-3.01: 5 Smith Class (Weaponsmith, Armorer, Rangesmith, Runesmith, Reforger) dengan Total Anggaran 5 Poin Tingkat (5 Tier). Pemain mendapat 1 poin tingkat tiap Tier dunia (total 5 poin di Lv150) yang bebas dialokasikan ke 5 Smith Class (contoh: 5 murni di 1 class; 4+1; 3+2; 3+1+1; 2+2+1; atau 1+1+1+1+1 mengambil semua 5 class di Tier 1).
CD-3.02: Mazhab Pembuatan Barang & Kecocokan Pakai (Gabungan Opsi A + C). Semua pemain tetap bisa menempa seluruh 48 Senjata dan 15 Armor di Bengkel Tempa (untuk pesanan NPC, dijual di toko, atau trofi Galeri). Namun:
- 5 Komponen Barang (Opsi C): Setiap barang punya 5 aspek yang kekuatannya mengikuti poin Tier (0-5) pemain pada class terkait: (1) Weaponsmith = Bilah/Kepala Senjata Dekat & Battle-Harness Armor agresif; (2) Armorer = Pelat/Perisai, Armor Trigger, & Senjata Pertahanan CON/Berat; (3) Rangesmith = Mekanik/Busur Senjata Jauh & Ranger Gear tinggi Dodge; (4) Runesmith = Inti Elemen, Mode Fusi (6 Elemen Hibrida, butuh minimal Runesmith Tier 1 untuk Fusi mandiri), & Slot Rune; (5) Reforger = Struktur Enhance +N, Transfer +N, & Pemurnian Kualitas.
- Kecocokan Pemakaian Tempur (Equip & Trigger Mastery, Opsi A): Pemain hanya mengaktifkan 100% Weapon/Armor Trigger (termasuk Tombol Khusus Weapon Skill) dan bonus Mastery (+6% per poin tier pada class tersebut) jika memiliki minimal Tier 1 pada Smith Class yang menaungi barang tersebut (Weaponsmith = Senjata Dekat STR/DEX/WIS/CHA; Armorer = Senjata CON & Armor Berat/Perisai; Rangesmith = Senjata Jauh; Runesmith = Senjata INT/Rune & Senjata Hasil Fusi Hibrida; Reforger = Senjata/Armor ber-+N & Taktis). Bila poin class terkait = 0, barang tetap bisa di-equip darurat tetapi terkena penalti ketidakcocokan (-25% efektivitas & Trigger terkunci).
CD-3.02b: Sistem 29 Kartu Destiny & Nama Kelas 1-Kata Unik ala Kingdoms of Amalur (LOCKED):
- Setiap dari 29 Nama Kelas 1-Kata merupakan Kartu Destiny dengan Bonus Pasif Skala Tier + 1 Efek Signature Unik Berarah (detail lengkap di docs/BLUEPRINT_SKILL_TREE_DESTINY_v3.3.md):
  - 5 Murni 1 Class (Tier 1 -> 2 -> 3 -> 4 -> 5):
    - Weaponsmith: Bladesmith -> Edgewright -> Warmonger -> Vanquisher -> Archblade
    - Armorer: Platesmith -> Shieldwright -> Bulwark -> Juggernaut -> Aegisborn
    - Rangesmith: Bowyer -> Fletcher -> Deadeye -> Ballistary -> Horizoner
    - Runesmith: Runescribe -> Glyphwright -> Spellforger -> Arcanist -> Runelord
    - Reforger: Tinkerer -> Temperer -> Transmuter -> Alchemizer -> Sovereign
  - 20 Gabungan 2 Class Berarah (menurut Class Utama yang Tier-nya lebih tinggi; bila seri 2+2 mengacu class yang diambil lebih dulu):
    - Utama Weaponsmith: +Armorer = Vanguard | +Rangesmith = Skirmisher | +Runesmith = Spellblade | +Reforger = Hellforger
    - Utama Armorer: +Weaponsmith = Wardensmith | +Rangesmith = Sentinel | +Runesmith = Runeguard | +Reforger = Ironclad
    - Utama Rangesmith: +Weaponsmith = Outrider | +Armorer = Bastionbow | +Runesmith = Arcarcher | +Reforger = Artificer
    - Utama Runesmith: +Weaponsmith = Hexblade | +Armorer = Aegisrune | +Rangesmith = Starfletcher | +Reforger = Thaumaturge
    - Utama Reforger: +Weaponsmith = Reaver | +Armorer = Colossus | +Rangesmith = Machinist | +Runesmith = Chronosmith
  - 4 Multi-Class (3-5 Class): 3 Class = Polymath (dominan Runesmith/Reforger) atau Arsenist (dominan Weapon/Armor/Range); 4 Class = Synthesist; Semua 5 Class Tier 1 (1+1+1+1+1) = Omnismith.
- Aturan Koleksi & Ganti Kartu Destiny (LOCKED — Jalur Ganda): Seluruh Kartu Destiny yang syarat sebaran poin Smith-nya telah terpenuhi masuk ke koleksi pemain. Mengganti Kartu Destiny aktif di luar pertarungan tidak gratis — wajib memilih salah satu: (1) Jalur Misi (Destiny Trial di Forgemasters' Guild: tempa 1 senjata mutu Istimewa+ sesuai mazhab tujuan atau kalahkan 1 Reguler Khusus/Mini Boss di Area aktif), ATAU (2) Jalur Bayar Mahal Instan (Gold Sink: 500br x Level x Tier di Forgemasters' Guild; +50% lewat Shadow Syndicate bila faksi lokal Hostile; angka DEMO).
CD-3.03: 21 Perk Smith (LOCKED: nama Inggris, efek ganda Tempa + Tempur, syarat Cap Stat 150, plus Bonus Afinitas +25% bila stat perk selaras dengan Smith Class utama pemain: Weaponsmith=STR/DEX, Armorer=CON/STR, Rangesmith=DEX/WIS, Runesmith=INT/WIS, Reforger=CHA/CON). Pilih 1 per tingkat; ganti perk & distribusi 5 poin Smith Class = un-fuse.
- Tingkat 3 = 6 Perk Stat Tunggal (terbuka jika ada Smith Class mencapai Tier >= 3 dan stat terkait >= 45):
  1. STR — Titan's Anvil: (Tempa) +10 Skor Kualitas senjata dekat/berat & +1 Enhance (+N) gratis saat Mahakarya; (Tempur) +15% Armor Crush & +10% Raw Might.
  2. DEX — Quicksilver Edge: (Tempa) +8% Speed & Accuracy Budget barang; (Tempur) +10% Attack Speed & tiap Dodge/Parry mempercepat cooldown skill 0,5 dtk.
  3. CON — Unbreakable Crucible: (Tempa) -50% bahan hilang saat gagal & -10% risiko gagal Fusi; (Tempur) +15% Max HP & cap Mitigate CON naik dari 50% ke 60% damage mentah.
  4. INT — Runic Overdrive: (Tempa) +20 Bobot Mode Fusi & -10% risiko retak cabut Rune; (Tempur) +20% Trigger Mastery & +15% bonus Weakness Exploit.
  5. WIS — Seeker's Eye: (Tempa) +12% peluang Trait Langka; (Tempur) +8% Critical Chance & +25% Critical Severity.
  6. CHA — Sovereign Seal: (Tempa) +20% harga jual & +15% laju belajar Murid; (Tempur) Debuff musuh -10% Damage/Akurasi & memperkuat Self-Buff +20%.
- Tingkat 5 = 15 Perk Hibrida Pasangan Stat (eksklusif Spesialis Murni 5 poin di 1 Smith Class dan kedua stat pasangan >= 75):
  1. STR+DEX — Venomed Blade: +20% Bleed/Poison DPS & kurangi Armor musuh -15%.
  2. STR+CON — Colossus Might: Tambah 15% nilai CON/Vitality ke Raw Might & +12% Damage Reduction.
  3. STR+INT — Spellforged Impact: +25% Elemental & Physical Hybrid Damage + bobot Mode Fusi senjata STR +25.
  4. STR+WIS — Executioner's Verdict: +35% Critical Damage & +20% Armor Penetration pada target ber-Proc/HP < 50%.
  5. STR+CHA — Warlord's Dreadblade: Kurangi Armor & Damage musuh -15% serta +20% Skill Active Damage.
  6. DEX+CON — Mirage Bastion: Pulihkan 4% HP saat Dodge/Parry & +15% Mitigate Shield.
  7. DEX+INT — Chrono Trigger: -20% Cooldown seluruh Skill Aktif & +30% Weapon Trigger DPS.
  8. DEX+WIS — Phantom Deadeye: Akurasi terkunci 95% (abaikan Dodge lawan) & konversi Dodge/Parry ke +25% Critical Damage.
  9. DEX+CHA — Duelist's Encore: +18% Attack Speed, Double Strike setelah Skill Aktif, & +15% nilai jual/Rep karya tempa.
  10. CON+INT — Aegis of the Runelord: -15% semua damage masuk & pantulkan 30% damage teredam sebagai Elemen Kelemahan (weak) musuh.
  11. CON+WIS — Immortal Foresight: Regenerasi 2% Max HP/dtk, kebal kritikal lawan, & +15% peluang Mahakarya di Bengkel.
  12. CON+CHA — Citadel of Command: +20% Max HP, +15% Damage Reduction, & ubah 25% Defense Budget menjadi bonus Counter Damage.
  13. INT+WIS — Omniscient Artificer: +1 Slot Macro Bar ekstra, Auto-Weakness Exploit (+30% elem dmg), & 2x peluang Trait Langka.
  14. INT+CHA — Sovereign Runecaster: +25% efektivitas Cross-Stat Mod, risiko gagal Fusi turun ke 2%, & +22% damage senjata Fusi Hibrida.
  15. WIS+CHA — Grand Inquisitor's Grace: Musuh menerima +25% damage dari semua sumber, +10% Crit Chance, & +25% Rare/Legendary Drop.
CD-3.04: Runesmith slot rune per rarity (Common 0 sampai Unique 5), peluang retak cabut rune = 35% - 1% x INT (minimal 5%). Reforger pindah +N dengan penalti -2 (Tier 1-2) atau -1 (Tier 3-5), biaya 50% biaya enhance. Tahap upgrade senjata/item Unique menggunakan istilah resmi Resonance.

CD-4 Senjata (48 senjata: 32 Dekat + 16 Jauh), anggaran poin, dan rumus +N tanpa batas seimbang (LOCKED)

CD-4.01: 48 senjata (8 senjata per stat = 6 senjata daftar awal + 2 senjata jarak jauh khusus Rangesmith per stat agar setiap stat memiliki opsi Jauh dari tier awal hingga puncak).
- STR (6 Dekat, 2 Jauh): Kapak Perang (T1 Dekat), Kapak Besar (T2 Dekat), Kapak Lempar Berat (T2 Jauh), Palu Perang (T3 Dekat), Pedang Besar (T4 Dekat), Gada Berduri (T5 Dekat), Maul (T6 Dekat), Arbalest Baja (T6 Jauh).
- DEX (4 Dekat, 4 Jauh): Belati (T1 Dekat), Pedang Pendek (T2 Dekat), Pisau Lempar Kembar (T2 Jauh), Belati Kembar (T3 Dekat), Katana (T4 Dekat), Busur Pendek (T5 Jauh), Busur Panjang (T6 Jauh), Crossbow Berulang (T6 Jauh).
- CON (6 Dekat, 2 Jauh): Gada Penjaga (T1 Dekat), Flail Baja (T2 Dekat), Gauntlet Baja (T3 Dekat), Bola Rantai Berat (T3 Jauh), Palu Penjaga (T4 Dekat), Rantai Berduri (T5 Dekat), Pedang Penjaga (T6 Dekat), Ballista Perisai (T6 Jauh).
- INT (5 Dekat, 3 Jauh): Tongkat Rune (T1 Dekat), Pedang Rune (T2 Dekat), Orb Rune Melayang (T2 Jauh), Palu Rune (T3 Dekat), Sabit Arcane (T4 Dekat), Cakram Rune (T5 Jauh), Rantai Rune (T6 Dekat), Senapan Rune (T6 Jauh).
- WIS (5 Dekat, 3 Jauh): Tombak (T1 Dekat), Trisula (T2 Dekat), Sumpit Pemburu (T2 Jauh), Naginata (T3 Dekat), Tongkat Bo (T4 Dekat), Tombak Lempar (T5 Jauh), Tombak Pemburu (T6 Dekat), Busur Silang Pemburu (T6 Jauh).
- CHA (6 Dekat, 2 Jauh): Rapier (T1 Dekat), Saber (T2 Dekat), Pedang Bangsawan (T3 Dekat), Pistol Flintlock Duel (T3 Jauh), Tongkat Penguasa (T4 Dekat), Cambuk Dagang (T5 Dekat), Pedang Upacara (T6 Dekat), Meriam Genggam Komando (T6 Jauh).
CD-4.02: syarat pakai & Rumus Enhance +N Tanpa Batas Seimbang (Gabungan Opsi A + C, LOCKED).
- Syarat pakai (ketiganya berlaku): Stat minimal = tier + rarity (Common +0, Uncommon +4, Rare +8, Epic +12, Legendary +16, Unique +20). Level minimal = tier + rarity (+0, +3, +6, +10, +15, +20). Stat di bawah syarat memberi penalti (senjata akurasi -1 per poin).
- Rumus Enhance +N Tanpa Batas Seimbang (Uncapped Asymptotic +N & Safe Resonance):
  1. Tidak Ada Batas Atas (+1 sampai +tak terhingga) & Tanpa Risiko Senjata Hancur Permanen.
  2. Tiga Fase Kenaikan Daya (Stepped + Logarithmic Soft-Cap agar tetap seimbang di atas +15):
     - Fase 1 (+1 s.d. +5 — Tempa Stabil): +4% daya dasar per tingkat (kumulatif +20% di +5). Peluang sukses dasar 100% -> 80%, gagal = aman (tidak turun tingkat).
     - Fase 2 (+6 s.d. +10 — Tempa Panas): +7% daya dasar per tingkat (kumulatif +55% di +10). Peluang sukses dasar 70% -> 40%, gagal = turun -1 tingkat (atau aman dengan bahan pelindung / Perk CON Unbreakable Crucible).
     - Fase 3 (+11 s.d. +15 — Masterwork Overforge): +12% daya dasar per tingkat (kumulatif +115% / x2,15 daya dasar di +15) + membuka Aura Overforge (+15% Trigger Efektif). Peluang sukses dasar 30% -> 10%.
     - Fase 4 (+16 ke atas — Transcendent Infinite +N, tanpa batas): Setiap tingkat N > 15 menambah daya secara hiperbolik/logaritmik seimbang: Bonus_Pct(N) = 115% + 45% x ln(1 + (N - 15) x 0,5) (contoh: +20 = +171%, +30 = +211%, +50 = +246%, +100 = +284%) serta +1% Trigger Mastery per tingkat di atas +15. Peluang sukses dasar di atas +15 = max(5%, 10% / (1 + 0,15 x (N - 15))), ditambah bonus Sub-Stat STR #8 (Enhance Power) dan Tier Reforger (+3% peluang sukses per Tier). Gagal di atas +15 tidak pernah menghancurkan senjata dan tidak pernah turun di bawah checkpoint +15.
  3. Khusus Barang Unique (Sistem Resonance I..V + Infinite Resonance): Tahap Resonance I..V setara +3/+6/+9/+12/+15 tanpa risiko turun tingkat, dan setelah Resonance V dapat dilanjutkan ke Resonance Transcendent (+16 ke atas) dengan kurva logaritmik yang sama.
CD-4.03: Anggaran poin senjata berdasarkan Tier & Rarity serta Bobot Penyetelan Antar-Stat (Gabungan Opsi A + B + C, LOCKED).
- Total Anggaran Poin = 100 + 20 x (Tier - 1) + Bonus_Rarity:
  - Dasar Tier 1..5: 100 / 120 / 140 / 160 / 180 poin.
  - Bonus Anggaran Rarity: Common +0, Uncommon +10, Rare +22, Epic +36, Legendary +52, Unique +75 poin.
- Profil pembagian anggaran (Damage / Speed / Accuracy / Defense / Trigger %):
  - Profil Dekat (STR disetel dari 40% ke 35% damage, +5% ke trigger): STR 35/15/15/5/30, DEX 25/25/20/5/25, CON 25/15/15/25/20, INT 20/15/15/5/45, WIS 30/15/25/10/20, CHA 25/20/25/5/25.
  - Profil Jauh: dasar 25/20/30/0/25 (menyesuaikan stat senjata).
  - Batas per komponen: damage 15-50%, speed 5-30%, accuracy 5-30%, defense 0-30%, trigger 15-60%.
- Bobot Konversi & Penyetelan Keseimbangan Antar-Stat (Menutup gap STR vs CON/CHA/Non-STR):
  - Damage: 4 poin = 1 Base Damage. Speed & Accuracy: 1 poin = 1%. Defense: dinaikkan dari 2 poin = 1% menjadi 1,25 poin = 1% Damage Reduction (+0,8% DR per poin).
  - Skala Stat Utama ke Weapon Trigger untuk semua stat = 1 + 1,5% x Stat_Utama (naik dari 1%).
  - Konversi Stat CON: Selain Mitigate, senjata CON/Armorer menambahkan +15% nilai CON sebagai Bonus Blunt/Guard Damage pada pukulan dan skill.
  - Konversi Stat CHA: Efek Trigger CHA ditingkatkan menjadi tambah Damage Efektif/5 dan Pengurang Damage Efektif/3 (%) (naik dari /8 dan /4).
CD-4.04: pembeda jarak Dekat vs Jauh (LOCKED: 48 senjata = 32 Dekat + 16 Jauh). Dekat bisa parry dan dinaungi Weaponsmith. Jauh tidak bisa parry, dodge dan akurasi lebih tinggi, dinaungi Rangesmith (+6% Mastery/tier & +2,5% Speed/Accuracy komponen tempa/tier).

CD-5 Armor, 15 jenis armor, dan sistem Armor Trigger Armorer (LOCKED)

CD-5.01: DEX menghindar (parry, dodge, AC). CON mengurangi damage yang lolos lewat Mitigate.
CD-5.02: armor 5 slot, AC: Zirah 40%, Perisai 25%, Helm 15%, Sarung 10%, Sepatu 10%. Kelas ditentukan bahan: ringan (Kulit/Serat: dodge dan parry +8%), berat (Logam/Tulang: Mitigate +10%, kecepatan -5%), sedang (Kayu/Kristal/Esensi/Campuran: setengah keduanya plus resist elemen +5% per slot terhadap 1 elemen spesifik sesuai elemen bahan/Attunement pembuatannya, maksimal +25% untuk 5 slot sejenis, ditambah sub-stat INT Elemental Barrier).
CD-5.02b: 15 Jenis Armor (5 Slot x 3 Kelas) & Sistem Armor Trigger Bertingkat (LOCKED):
- Setiap potong armor memiliki 1 Base Armor Trigger unik sesuai Slot & Kelasnya (15 Base Trigger):
  1. Zirah (40%): Ringan = Shadow Weave (+15% Spd/Crit usai Dodge); Sedang = Elemental Carapace (serap 15% elem ke Trigger); Berat = Adamantine Bulwark (+25% Mitigate saat HP < 50%).
  2. Perisai (25%): Ringan = Buckler Riposte (balas 50% dmg saat Parry); Sedang = Runic Ward Shield (pantulkan 20% serangan elemen); Berat = Fortress Wall (redam 35% dmg & Stagger lawan).
  3. Helm (15%): Ringan = Predator's Visor (+8% Akurasi & anti-Dodge); Sedang = Mind-Ward Circlet (-30% debuff & -8% CDR); Berat = Iron Juggernaut Helm (redam 50% bonus Crit lawan).
  4. Sarung Tangan (10%): Ringan = Sleight Grips (+10% Attack Speed & +5% Parry); Sedang = Channeler's Bracers (+12% daya Inti/Fusi); Berat = Crushing Gauntlets (+10% Armor Crush).
  5. Sepatu (10%): Ringan = Windstep Boots (+8% Dodge & -15% Stamina); Sedang = Strider Treads (+5% Dodge & +5% Mitigate); Berat = Earthshaker Greaves (hapus penalti speed Berat & +10% Poise).
- Aturan Kecocokan Base Trigger: Ringan cocok untuk Weaponsmith/Rangesmith/Armorer (>=1); Sedang cocok untuk Runesmith/Reforger/Armorer (>=1); Berat eksklusif membutuhkan Armorer (>=1).
- Bonus +1 Trigger Kedua per Slot dari Tier Armorer (1-5) & +1 Ultimate Trigger Armorer Murni (5+0 / Aegisborn):
  - Setiap poin Tier Armorer menambahkan +1 Secondary Trigger pada masing-masing slot armor secara bertahap: Tier 1 (Zirah: Heart of the Forge +12% HP & regen 2% saat trigger), Tier 2 (Perisai: Unbreakable Aegis +10% Block/Parry & konversi 30% Mitigate ke Raw Might), Tier 3 (Helm: Tactical Command Crown -1,5 dtk CD skill defensif/combo), Tier 4 (Sarung Tangan: Ironclad Grip +15% daya Weapon Trigger), Tier 5 (Sepatu: Seismic Stride -12% Akurasi & Speed musuh).
  - Khusus Armorer Murni (5 poin penuh di Armorer = Aegisborn): Selain ke-5 slot armornya masing-masing memiliki 2 trigger aktif (5 Base + 5 Secondary = 10 Trigger), membuka +1 Ultimate Armor Trigger (Full-Set Capstone Trigger ke-11) sesuai kelas zirah utama:
    * Berat — Living Citadel of the World-Forge (-20% damage masuk ekstra, cap Mitigate CON naik ke 70%, & ledakan Citadel Nova 50% Max HP tiap 5 dtk).
    * Sedang — Prismatic Sanctuary Matrix (+25% Resist seluruh 6 Elemen & pantulan serangan elemen Weakness Exploit x1,5).
    * Ringan — Phantom Mirage Carapace (cap gabungan Dodge+Parry naik dari 30% ke 45% & serangan balik otomatis Phantom Counter-Slash 120% weapon dmg saat menghindar).

CD-6 Murid (Sistem Seed Prosedural & AI Autonomous Style) dan CD-7 Kutukan, penalti mati, Long Rest, idle (LOCKED)

CD-6.01: murid punya 3 atribut utama (bakat, laju belajar, loyalitas) serta nilai skill fokus latihan (seperti menempa), semuanya memakai skala numerik 0-100 (LOCKED). Batas maksimal 5 murid (LOCKED, selaras WD-3.08). Moral Mulia/Kejam menggeser loyalitas ±1 (WD-3.13). Pemain pilih fokus latihan. Murid pilihan jadi pemilik/penjaga cabang saat pemain pindah (WD-3.10, WD-4.13).
CD-6.02: Sistem Seed Murid (Apprentice Seed), Companion Tempur AI, Ujian Murid, & Syarat Cabang Toko (Opsi A + Seed AI Style, LOCKED):
- Generator Seed Murid & AI Autonomous Style: Setiap murid dibangkitkan dari Seed unik (contoh: APR-7F3A-Kael) dengan struktur karakter sama seperti pemain. Berdasarkan seed-nya, komputer/AI secara otonom menentukan: (1) Bakat awal (40-95), Laju Belajar (40-95), Loyalitas awal (50-90), dan Latar Belakang (CD-1.03); (2) Distribusi prioritas 6 Stat Utama & 2 Sub-Stat Fokus; (3) Alokasi 5 poin Tier Smith Class beserta Nama Kelas 1-Kata Unik (CD-3.02b, misal Spellblade, Bulwark, Deadeye, Thaumaturge, Omnismith) dan gaya bertarung/tempa (2-3 Skill Aktif Disiplin SWTOR).
- Companion Tempur (1 Murid Aktif): Pemain dapat membawa 1 murid pendamping ke Battle/Idle. Murid menyerang otomatis sesuai gaya AI seed-nya setiap 3 detik dengan Assist Strike = (15% + 0,35% x Skill_Murid) x Damage_Pemain x (1 + Sub-Stat CHA #9 Apprentice Leadership), memicu skill disiplinnya, serta memberi Aura Pasif sesuai Smith Class utamanya (Weaponsmith/Rangesmith: +10% Atk Speed & Acc; Armorer: +12% Mitigate & Perisai Darurat; Runesmith: +15% Elemental/Trigger Dmg; Reforger: +15% Drop Bahan & Efisiensi Stamina).
- Ujian Murid (Milestone Skill 50 & 80): Nilai Bakat adalah soft-cap awal Skill murid. Saat Skill mencapai 50 (Ujian Madya) dan 80 (Ujian Mahakarya), murid menjalani ujian tempa/tempur yang menaikkan batas Bakat +15 (hingga 100), +10 Loyalitas, serta membuka Tier 3 Smith Class + Perk Tingkat 3 (di Ujian 50) dan Tier 5 Smith Class Puncak/Hibrida (di Ujian 80).
- Syarat Teknis Penjaga Cabang Toko (selaras WD-3.10 & WD-4.13): Minimal Skill >= 60, Loyalitas >= 70, dan sudah lulus minimal Ujian Murid 50. Spesialisasi Smith Class murid dari seed-nya menentukan bonus spesialisasi cabang toko yang dijaganya.
CD-7.01: stamina hanya di idle (Battle atau Smith, laju Battle lebih besar). Offline cap 8 jam. Kalah Gate = satu kutukan acak dengan skala Lv1-150 (LOCKED): debuff per stat maksimal = -4 x Tier_Gate (-4 / -8 / -12 / -16 / -20 untuk Gate Tier 1..5), dan ambang lumpuh tidak bisa bertarung = total tumpukan debuff mencapai 13 x Tier_Gate (13 / 26 / 39 / 52 / 65), dapat diredam oleh Sub-Stat CON #6 (Curse & Blight Resist).
CD-7.02: Penalti Mati Reguler (LOCKED): Saat HP habis di pertarungan reguler/idle (bukan Gate), Idle Battle berhenti otomatis, Stamina sisa 0, kehilangan 25% muatan buff silang aktif (CD-1.05), tanpa kehilangan XP yang sudah masuk dan tanpa terkena Kutukan Gate.
CD-7.03: Biaya Long Rest & Pemulihan Kutukan (LOCKED): Long Rest memulihkan HP & Stamina penuh. Gratis (0 br) bila dilakukan di Bengkel Utama / Cabang Toko sendiri, atau 20 br x Level x Tier bila di penginapan luar. Biaya pembersihan Kutukan Gate saat Long Rest = 30 br x Level x Tier_Gate per tumpukan kutukan.
4. Daftar 48 Weapon Trigger (LOCKED)
48 weapon trigger (satu per senjata: 36 trigger awal + 12 trigger senjata Jauh baru):
- STR (8): Twister, Cleave, Splitting Throw (Kapak Lempar Berat - Jauh), Heavy Chain, Breaker Edge, Spike Burst, Earthbreaker, Siege Bolt (Arbalest Baja - Jauh).
- DEX (8): Quick Stab, Riposte, Fan of Knives (Pisau Lempar Kembar - Jauh), Dual Flurry, Iaijutsu, Quick Draw (Busur Pendek - Jauh), Piercing Shot (Busur Panjang - Jauh), Rapid Volley (Crossbow Berulang - Jauh).
- CON (8): Guard Strike, Swing Lash, Counter Fist, Entangling Weight (Bola Rantai Berat - Jauh), Bulwark Slam, Thorn Chain, Sentinel Oath, Fortress Shot (Ballista Perisai - Jauh).
- INT (8): Arcane Bolt, Rune Edge, Prismatic Beam (Orb Rune Melayang - Jauh), Runic Shockwave, Soul Reap, Orbit Discs (Cakram Rune - Jauh), Binding Chain, Arcane Snipe (Senapan Rune - Jauh).
- WIS (8): Keen Thrust, Triple Prong, Neurotoxin Dart (Sumpit Pemburu - Jauh), Sweeping Arc, Disarm Sweep, Tracker Mark (Tombak Lempar - Jauh), Prey Sense, Deadeye Pin (Busur Silang Pemburu - Jauh).
- CHA (8): Feint, Rally Cut, Noble Challenge, Point-Blank Decree (Pistol Flintlock Duel - Jauh), Command Aura, Debt Lash, Grand Ovation, Salvo Signal (Meriam Genggam Komando - Jauh).
Profil anggaran Jauh (opsi A): damage 25 / speed 20 / accuracy 30 / defense 0 / trigger 25.
Mikro-bonus tiap poin stat 1-4 (berhenti di stat 5). Mitigate cap dasar 50% damage mentah (60% dengan Perk CON Unbreakable Crucible, 70% dengan Ultimate Armor Trigger Berat Aegisborn).
5. Penyetelan Temuan Beta Test Senjata (LOCKED)
- Temuan lama di mana STR bertahan 1,5-2x lebih lama dan CON/CHA tertinggal sudah diselesaikan secara permanen (LOCKED) melalui:
  1. Penyesuaian anggaran damage senjata STR dari 40% menjadi 35% (+5% dialihkan ke trigger).
  2. Peningkatan bobot Defense senjata dari 2 poin per 1% menjadi 1,25 poin per 1% (+0,8% DR per poin).
  3. Peningkatan skala Stat Utama ke Weapon Trigger dari 1% menjadi 1,5% per poin stat utama, ditambah konversi CON (+15% CON menjadi Bonus Blunt/Guard Damage pada senjata CON/Armorer + Sistem 15 Base & 6 Armorer Trigger CD-5.02b) serta peningkatan rasio Trigger CHA menjadi Damage Efektif/5 dan Pengurang Efektif/3 (%).
  4. Perluasan senjata Jauh menjadi 16 senjata lintas 6 stat di bawah naungan Rangesmith (+6% mastery/tier & +2,5% speed/acc/tier).
  5. Kelipatan zona 5 Tier linear (x1,0 s.d. x2,0) dan cap stat 30/60/90/120/150.
5b. Model simulasi, Skill & Forge Engine, dan pemetaan data musuh WD
Dipakai beta test senjata (HTML), bengkel-tempa-v3.html, engines/skill_engine/ (skill_data.json, skill_engine.js, forge_engine.js, test_skill_engine.js, test_forge_engine.js), dan perhitungan stat untuk 4.864 musuh di data/areas/*.json WD.

Model beta test & Skill/Forge Engine

Alokasi stat pemain: stat utama senjata 60% poin bebas, lalu urutan CON, DEX, WIS, STR, INT, CHA (tanpa stat utama) dengan porsi 25% dan 15%. Sisa poin mengisi sampai cap.
Peluang kena = 75% + akurasi senjata + min(20, DEX) + 5 (title), maksimal 95%.
Dodge = min(20, DEX x 0,5)% (+8% untuk senjata Jauh). Parry = min(20, DEX x 0,5)% hanya senjata Dekat. Critical = min(20, WIS)%, damage x2. Jumlah dodge, parry, dan critical dibatasi 30% (atau 45% dengan Ultimate Armor Trigger Ringan Aegisborn).
Senjata dari anggaran: Total Anggaran = 100 + 20 x (Tier - 1) + Bonus_Rarity (Common 0..Unique +75), dikali faktor Enhance +N Tanpa Batas Seimbang (CD-4.02). Damage = poin damage / 4, speed dan accuracy (%) = poinnya, defense (%) = poin / 1,25. Kecepatan serang dasar 1 per detik x (1 + speed).
Damage per pukulan = (damage senjata + floor(STR/2) + bonus_guard_CON + bonus trigger) x (1 + mastery_smith_class) x 1,05 (title) x 0,9 (Jauh) x faktor elemen (x1,25 jika cocok weak musuh, x0,75 jika sama dengan el musuh, x1,0 untuk Neutral) + Assist Strike Murid (CD-6.02).
Trigger (abstraksi): hanya aktif jika pemain memiliki minimal Tier 1 pada Smith Class yang cocok (jika tidak cocok: trigger = 0 dan penalti mastery -25%). Efektif = poin trigger x 0,8 x (1 + 1,5% x stat utama). STR, DEX, INT, WIS: tambah damage efektif/4. CON: pengurang damage efektif/2 (%) + 15% CON sebagai Guard Damage. CHA: tambah damage efektif/5 dan pengurang efektif/3 (%). Pengurang total maksimal 60%.
Monster menyerang sesuai speed role, akurasi sesuai role. Damage diterima = (mentah - min(CON/2, cap_mitigate x mentah)) x (1 - pengurang) x (1 - resist_elemen_armor_sedang).
Metrik: kill per HP bar. Stamina idle Battle = (100 + 5 x CON) / (25 per jam x pengali Jauh 1,2).
Parameter Jauh (DEMO): dodge +8%, damage x0,9, stamina x1,2.

Pemetaan Stat Monster WD (LOCKED, menggantikan tabel peran/afinitas CSV lama)

Sumber data: 16 file data/areas/<area_id>.json (4.864 musuh, Lv1-150).
Rumus Dasar: HP Dasar = 15 + 10 x lvl; Damage Dasar = (1,5 + 0,4 x lvl) x kelipatan_zona_tier.
Kelipatan Zona per Tier WD: Tier 1 (Lv1-30) = x1,0; Tier 2 (Lv31-60) = x1,25; Tier 3 (Lv61-90) = x1,5; Tier 4 (Lv91-120) = x1,75; Tier 5 (Lv121-150) = x2,0.
Tabel 5 Role WD (berbasis Sub-Stat Tempur 1-6):
- Brute (basis STR): HP x0,90 | Damage x1,25 | Speed 0,9/dtk | Akurasi 80% | Dodge 3% | Armor 10%
- Skirmisher (basis DEX): HP x0,85 | Damage x1,10 | Speed 1,3/dtk | Akurasi 85% | Dodge 15% | Armor 0%
- Caster (basis INT): HP x0,80 | Damage x1,30 | Speed 1,0/dtk | Akurasi 90% | Dodge 5% | Armor 0%
- Tank (basis CON): HP x1,40 | Damage x0,80 | Speed 0,8/dtk | Akurasi 75% | Dodge 0% | Armor 25%
- Support (basis WIS/CHA): HP x1,10 | Damage x0,90 | Speed 1,0/dtk | Akurasi 85% | Dodge 10% | Armor 10%
Tabel 4 Tipe WD (dikalikan/ditambahkan di atas Role):
- Reguler (4.320): HP x1,0 | Damage x1,0 | Dodge +0% | Armor +0%
- Reguler Khusus (480): HP x1,5 | Damage x1,15 | Dodge +2% | Armor +3%
- Mini Boss (48): HP x2,5 | Damage x1,30 | Dodge +3% | Armor +5%
- Boss (16): HP x5,0 | Damage x1,50 | Dodge +5% | Armor +10%
Elemen & Kelemahan: diambil langsung dari kolom el dan weak tiap musuh di JSON WD (6 Elemen: Fire, Ice, Lightning, Earth, Light, Dark, plus Neutral).
6. Aturan lama yang tergantikan (jangan dipakai)
Kuota XP 60 x L^1,5 diganti 60 x L^1,1.
Level maksimal 30 sebagai batas permanen maupun label demo Lv30 diganti Mode Full Lv1-150 (5 Tier x 30 level).
Gagasan level 999 dan kurva XP lebih curam dibatalkan.
Smith type 4 diganti 5. Pilihan Bow (Bladewright atau type ke-7) gugur, digantikan Rangesmith.
"Seimbang = buff lebih kecil" dan "1 murid per toko" sudah dihapus (sejak GDD v2).
Kelipatan zona 3 tingkat (x1 / x1,5 / x2,25 untuk Lv1-30) diganti kelipatan zona 5 Tier linear (x1,0 / x1,25 / x1,5 / x1,75 / x2,0 untuk Lv1-150).
Laju cap XP/jam setelah Lv30 sebesar 1.200 + 25/level diganti 1.200 + 60 x (L - 30).
Placeholder punya_kelemahan (Y/N) dan penalti trigger INT x0,5 pada musuh tanpa kelemahan dihapus, diganti sistem 6 Elemen + Neutral dan kolom el/weak WD.
Nama trigger INT "Resonance Hammer" diganti menjadi "Runic Shockwave".
36 skill breakpoint statis (pasif 5/15/25, aktif 10/20/30) diganti Sistem Skill SWTOR Discipline & Cross-Stat Macro Loadout 150 Node (+10 Core Passive, +20 Pilih 1-dari-3 Utility/Morph, +30 Rotational Active Skill).
Syarat stat Perk Smith Tingkat 3 (stat 10) dan Tingkat 5 (stat 15) di skala demo diganti stat 45 (Tingkat 3) dan stat 75 pada kedua stat (Tingkat 5) di skala penuh 150.
Sistem nama Smith Class multi-kata (awalan Raw..Paragon + akar pasangan) diganti Sistem Anggaran 5 Poin Tier & Nama Kelas 1-Kata Unik (CD-3.01 & CD-3.02b).
Jumlah senjata 36 (hanya 4 senjata Jauh) diperluas menjadi 48 senjata (32 Dekat + 16 Jauh = +2 senjata Jauh baru per stat) agar Rangesmith seimbang di semua stat.
Sistem Skill SWTOR Discipline 150 Node berbasis 6 Stat Utama (STR..CHA) & 48 Weapon Trigger murni pasif diganti Sistem Hibrida 5 Pohon Skill Tipe Smith (SWTOR Ability Tree + Cooldown/GCD Anti-Spam + RF Classic Lv.1-GM + 29 Kartu Destiny Kingdoms of Amalur + 1 Tombol Khusus Weapon Skill).
7. OPEN
Seluruh poin desain mekanik CD-1 s.d. CD-7 telah LOCKED di v3.2 & diperbarui desain skill/Destiny-nya di v3.3. Sisa teknis: migrasi kode engines/skill_engine/ (skill_data.json, skill_engine.js) & prototipe Three.js ke spesifikasi CD v3.3, tuning biaya bayar instan ganti Kartu Destiny (500br x Level x Tier DEMO) di simulator S&D WD, serta catatan administratif pembagian peran AI (usulan Claude CD / Gemini WD).
8. Format Laporan Perubahan (isi tiap akhir sesi)
LAPORAN PERUBAHAN
Versi master yang dipakai: v3.2 (Final Locked) -> v3.3
Chunk: CD-2, CD-3, CD-4 (Desain 5 Pohon Skill Tipe Smith + 29 Kartu Destiny + Latihan RF Classic GM + Standar Folder Aset)
Tanggal sesi: 21 November 2026
1. Keputusan baru (ID, isi, status LOCKED/USULAN):
- CD-2.01 (LOCKED): Pindah ke 5 Pohon Skill Tipe Smith (Weaponsmith, Armorer, Rangesmith, Runesmith, Reforger) bergaya SWTOR Ability Tree (5 Tier = T1 Opener, T2 Class Buff RF, T3 Defensive/Interrupt, T4 Core Combo/Execute, T5 Apex Ultimate; 125 Node Class total). Semua skill memakai Cooldown individual + GCD anti-spam. 6 Stat Utama tetap menggerakkan 60 Sub-Stat dan kapasitas Macro Bar (3-6 slot dari INT).
- CD-2.01 & CD-4 (LOCKED): 48 Weapon Trigger ditingkatkan menjadi 1 Tombol Khusus "Weapon Skill" (CD ~6-8d) di samping Macro Bar yang berubah otomatis sesuai senjata terpasang (butuh min. Tier 1 Smith Class cocok sesuai CD-3.02).
- CD-2.01 (LOCKED): Sistem latihan skill "Use-to-Level" ala RF Online Classic (Lv.1 -> Lv.7 / GM) berlaku untuk Active Skill, Class Buff, dan Weapon Skill (berjalan saat manual maupun Mode Idle Battle). Mencapai Skill Lv.3 membuka Core Passive; mencapai Skill Lv.5 membuka Pilihan Morph 1-dari-3 (Offense / Defense-Companion / Forge Synergy); GM (+40% efek, -10% CD, bonus puncak Morph).
- CD-3.02b (LOCKED): 29 Nama Kelas 1-Kata menjadi koleksi 29 Kartu Destiny ala Kingdoms of Amalur dengan Bonus Pasif Skala Tier + 1 Efek Signature Unik Berarah (spesifikasi di docs/BLUEPRINT_SKILL_TREE_DESTINY_v3.3.md). Mengganti Kartu Destiny aktif di luar battle memakai Jalur Ganda: Misi Pengukuhan (Destiny Trial di Forgemasters' Guild) ATAU Bayar Mahal Instan (500br x Level x Tier; +50% lewat Shadow Syndicate saat Hostile; angka DEMO).
- Standar Aset (LOCKED): Struktur folder standar assets/ (monsters, materials, trophies, sprites, weapons, armors, vfx, env, ui, audio) + panduan format .webp/.ogg ramah Oppo A54 dibuat di assets/README.md.
2. Aturan lama yang tergantikan:
- 6 Pohon Disiplin berbasis 6 Stat Utama (150 Node) -> 5 Pohon Skill Tipe Smith (125 Node Class) + 29 Kartu Destiny.
- Pembukaan node berbasis breakpoint stat (+10/+20/+30) -> Pembukaan berbasis Poin Tier Smith + latihan skill RF Classic (Lv.1->GM: Lv.3 Core Passive, Lv.5 Morph 1-dari-3).
- 48 Weapon Trigger murni pasif -> 1 Tombol Khusus "Weapon Skill" aktif ber-cooldown.
3. Nilai kontrak lintas chunk yang disentuh:
- Tidak mengubah nilai LOCKED WD maupun keputusan CD-1.08, CD-3.03 (21 Perk), CD-4.02/4.03 (+N/Rarity), CD-5.02b (15 Armor), CD-6.02 (Seed Murid), dan CD-7.01-7.03 dari v3.2; memanfaatkan langsung Forgemasters' Guild (WD-2.05), Shadow Syndicate (WD-2.14), Gold Sink (WD-5.10), 6 Elemen + Neutral (WD-6.05), dan Mode Idle 8 jam (CD-7.01).
4. KONFLIK dengan chunk lain (jika ada):
- Tidak ada konflik; seluruh kontrak WD dan CD sinkron 100%.
5. OPEN baru:
- Migrasi kode engines/skill_engine/ (skill_data.json, skill_engine.js) & prototipe Three.js ke spesifikasi CD v3.3 (menunggu persetujuan pengguna untuk mulai tahap coding).
- Tuning angka biaya bayar instan ganti Kartu Destiny (500br x Level x Tier DEMO) di simulator S&D WD.
6. Parkir (topik milik chunk lain):
- Tidak ada.
9. Log versi
v3.0: basis GDD v2 dan perubahan sampai pembahasan Smith type ke-5 dan pembeda jarak DEX.
v3.1: tambah PRJ-01 (fokus backend), bagian 5b (model simulasi dan spesifikasi CSV monster), status LOCKED rumus damage monster, OPEN diperbarui. Saran pembagian AI tercatat sebagai USULAN.
v3.2: penyelesaian penuh 100% BRIEF WD -> CD v1 (B1-B7) dan seluruh OPEN CD-1 s.d. CD-7 + pembangunan engines/skill_engine/ & forge_engine.js + bengkel-tempa-v3.html: Mode Full Lv1-150, cap stat 30/60/90/120/150, 60 sub-stat, Anti-Farm XP/Drop Lv150 (CD-1.08), sistem skill SWTOR Discipline & Cross-Stat Macro Loadout (150 node), anggaran 5 Tier Smith Class dengan nama 1-kata unik, aturan Mazhab Barang A+C, 21 Perk Smith lengkap (CD-3.03), 48 senjata (32 Dekat + 16 Jauh), Rumus Enhance +N Tanpa Batas Seimbang & Anggaran Rarity + Penyetelan Stat (CD-4.02 & CD-4.03), 15 Armor + Secondary & Ultimate Armor Trigger Armorer (CD-5.02b), Sistem Seed Murid AI Style + Companion Tempur + Ujian 50/80 + Syarat Cabang (CD-6.02), serta Skala Kutukan Gate, Penalti Mati, & Biaya Long Rest (CD-7.01-7.03).
v3.3: revisi sistem skill & kelas (desain blueprint tanpa ubah kode dulu): migrasi dari 6 pohon stat ke 5 Pohon Skill Tipe Smith (SWTOR Ability Tree + Cooldown/GCD anti-spam + 1 Tombol Khusus Weapon Skill 48 Trigger), sistem latihan RF Classic Use-to-Level (Lv.1-GM: Lv.3 Core Passive, Lv.5 Morph 1-dari-3), 29 Kartu Destiny ala Kingdoms of Amalur dengan Jalur Ganda ganti kartu (Misi Forgemasters' Guild atau Bayar Mahal 500br x Lv x Tier), pembuatan docs/BLUEPRINT_SKILL_TREE_DESTINY_v3.3.md, serta pembuatan struktur folder standar assets/ & assets/README.md.

