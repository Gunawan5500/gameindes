BATTLE-SMITH RPG: MASTER CHARACTER DEVELOPMENT (CD) v3.2
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
Anggaran poin senjata = 100 + 15 x (tier - 1).
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

CD-2 Skill (SWTOR Discipline + Loadout), title, un-fuse

CD-2.01: Sistem Skill MMORPG/SWTOR Discipline & Cross-Stat Macro Loadout (150 Node Total = 25 Node per Stat Utama sepanjang Stat 1-150, terimplementasi di engines/skill_engine/).
- Struktur 5 Tier per Stat (tiap Tier = 30 poin stat):
  1. Breakpoint +10 (Stat 10, 40, 70, 100, 130) -> 5 Core Passive (otomatis aktif, memperkuat Sub-Stat & mekanik dasar).
  2. Breakpoint +20 (Stat 20, 50, 80, 110, 140) -> 5 Tier Utility / Morph Choice (pemain memilih 1 dari 3 varian per Tier: Offense, Defense, atau Tactical/Forge = 15 Utility node per stat).
  3. Breakpoint +30 (Stat 30, 60, 90, 120, 150) -> 5 Rotational Active Skills (Stat 30 Builder/Opener pemicu Proc; Stat 60 Defensive/Interrupt; Stat 90 Core Combo pengonsumsi Proc; Stat 120 High-Impact/Execute; Stat 150 Apex Capstone Ultimate).
- Active Macro Bar & Cross-Stat Modding:
  - Kapasitas slot skill aktif di Macro Bar ditentukan oleh Sub-Stat INT #6 (Macro Capacity): skor 1-29 = 3 slot, 30-74 = 4 slot, 75-119 = 5 slot, 120+ = 6 slot.
  - Setiap Skill Aktif yang dipasang di Macro Bar memiliki 2 Slot Modifikasi yang dapat diisi oleh Utility/Morph (+20) yang sudah dibuka pemain, termasuk lintas stat (Cross-Stat Modding).
- Enam Disiplin Stat: STR (Juggernaut Forgebreaker), DEX (Phantom Bladeweaver), CON (Immortal Bastion), INT (Arcane Runelord), WIS (Seeker Inquisitor), CHA (Sovereign Marshal).
CD-2.02: title dihitung saat naik level. Spesialis bila stat terbesar unggul minimal 2 poin: +5% damage dan akurasi senjata sejenis, -5% senjata jenis lain. Bila tidak: Seimbang, tanpa penalti jenis senjata, plus muatan buff silang +10% lebih efisien. Corrupted tidak mengubah title.
CD-2.03: un-fuse. 1 respec gratis per tier S, selebihnya 100br x level x poin x (1 + 0,25 x title unik), batas x4. Ganti perk, ganti pilihan Utility/Morph (+20), dan ganti 2 Sub-Stat Fokus memakai jatah yang sama.

CD-3 Smith type, anggaran 5 tier, nama 1-kata, dan mazhab barang (LOCKED)

CD-3.01: 5 Smith Class (Weaponsmith, Armorer, Rangesmith, Runesmith, Reforger) dengan Total Anggaran 5 Poin Tingkat (5 Tier). Pemain mendapat 1 poin tingkat tiap Tier dunia (total 5 poin di Lv150) yang bebas dialokasikan ke 5 Smith Class (contoh: 5 murni di 1 class; 4+1; 3+2; 3+1+1; 2+2+1; atau 1+1+1+1+1 mengambil semua 5 class di Tier 1).
CD-3.02: Mazhab Pembuatan Barang & Kecocokan Pakai (Gabungan Opsi A + C). Semua pemain tetap bisa menempa seluruh 36 Senjata dan 5 Slot Armor di Bengkel Tempa (untuk pesanan NPC, dijual di toko, atau trofi Galeri). Namun:
- 5 Komponen Barang (Opsi C): Setiap barang punya 5 aspek yang kekuatannya mengikuti poin Tier (0-5) pemain pada class terkait: (1) Weaponsmith = Bilah/Kepala Senjata Dekat & Battle-Harness Armor agresif; (2) Armorer = Pelat/Perisai, Armor Trigger, & Senjata Pertahanan CON/Berat; (3) Rangesmith = Mekanik/Busur Senjata Jauh & Ranger Gear tinggi Dodge; (4) Runesmith = Inti Elemen, Mode Fusi (6 Elemen Hibrida, butuh minimal Runesmith Tier 1 untuk Fusi mandiri), & Slot Rune; (5) Reforger = Struktur Enhance +N, Transfer +N, & Pemurnian Kualitas.
- Kecocokan Pemakaian Tempur (Equip & Trigger Mastery, Opsi A): Pemain hanya mengaktifkan 100% Weapon/Armor Trigger dan bonus Mastery (+6% per poin tier pada class tersebut) jika memiliki minimal Tier 1 pada Smith Class yang menaungi barang tersebut (Weaponsmith = Senjata Dekat STR/DEX/WIS/CHA; Armorer = Senjata CON & Armor Berat/Perisai; Rangesmith = Senjata Jauh; Runesmith = Senjata INT/Rune & Senjata Hasil Fusi Hibrida; Reforger = Senjata/Armor ber-+N & Taktis). Bila poin class terkait = 0, barang tetap bisa di-equip darurat tetapi terkena penalti ketidakcocokan (-25% efektivitas & Trigger terkunci).
CD-3.02b: Sistem Nama Kelas 1 Kata Unik (Single-Word Class Name, LOCKED):
- Murni 1 Class (Tier 1 -> 2 -> 3 -> 4 -> 5):
  - Weaponsmith: Bladesmith -> Edgewright -> Warmonger -> Vanquisher -> Archblade
  - Armorer: Platesmith -> Shieldwright -> Bulwark -> Juggernaut -> Aegisborn
  - Rangesmith: Bowyer -> Fletcher -> Deadeye -> Ballistary -> Horizoner
  - Runesmith: Runescribe -> Glyphwright -> Spellforger -> Arcanist -> Runelord
  - Reforger: Tinkerer -> Temperer -> Transmuter -> Alchemizer -> Sovereign
- Gabungan 2 Class (20 Nama 1-Kata Berarah menurut Class Utama yang Tier-nya lebih tinggi; bila seri 2+2 mengacu class yang diambil lebih dulu):
  - Utama Weaponsmith: +Armorer = Vanguard | +Rangesmith = Skirmisher | +Runesmith = Spellblade | +Reforger = Hellforger
  - Utama Armorer: +Weaponsmith = Wardensmith | +Rangesmith = Sentinel | +Runesmith = Runeguard | +Reforger = Ironclad
  - Utama Rangesmith: +Weaponsmith = Outrider | +Armorer = Bastionbow | +Runesmith = Arcarcher | +Reforger = Artificer
  - Utama Runesmith: +Weaponsmith = Hexblade | +Armorer = Aegisrune | +Rangesmith = Starfletcher | +Reforger = Thaumaturge
  - Utama Reforger: +Weaponsmith = Reaver | +Armorer = Colossus | +Rangesmith = Machinist | +Runesmith = Chronosmith
- Multi-Class (3-5 Class): 3 Class = Polymath (dominan INT/Reforge) atau Arsenist (dominan Weapon/Armor/Range); 4 Class = Synthesist; Semua 5 Class Tier 1 (1+1+1+1+1) = Omnismith.
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

CD-4 Senjata (48 senjata: 32 Dekat + 16 Jauh) dan anggaran poin

CD-4.01: 48 senjata (8 senjata per stat = 6 senjata daftar awal + 2 senjata jarak jauh khusus Rangesmith per stat agar setiap stat memiliki opsi Jauh dari tier awal hingga puncak).
- STR (6 Dekat, 2 Jauh): Kapak Perang (T1 Dekat), Kapak Besar (T2 Dekat), Kapak Lempar Berat (T2 Jauh), Palu Perang (T3 Dekat), Pedang Besar (T4 Dekat), Gada Berduri (T5 Dekat), Maul (T6 Dekat), Arbalest Baja (T6 Jauh).
- DEX (4 Dekat, 4 Jauh): Belati (T1 Dekat), Pedang Pendek (T2 Dekat), Pisau Lempar Kembar (T2 Jauh), Belati Kembar (T3 Dekat), Katana (T4 Dekat), Busur Pendek (T5 Jauh), Busur Panjang (T6 Jauh), Crossbow Berulang (T6 Jauh).
- CON (6 Dekat, 2 Jauh): Gada Penjaga (T1 Dekat), Flail Baja (T2 Dekat), Gauntlet Baja (T3 Dekat), Bola Rantai Berat (T3 Jauh), Palu Penjaga (T4 Dekat), Rantai Berduri (T5 Dekat), Pedang Penjaga (T6 Dekat), Ballista Perisai (T6 Jauh).
- INT (5 Dekat, 3 Jauh): Tongkat Rune (T1 Dekat), Pedang Rune (T2 Dekat), Orb Rune Melayang (T2 Jauh), Palu Rune (T3 Dekat), Sabit Arcane (T4 Dekat), Cakram Rune (T5 Jauh), Rantai Rune (T6 Dekat), Senapan Rune (T6 Jauh).
- WIS (5 Dekat, 3 Jauh): Tombak (T1 Dekat), Trisula (T2 Dekat), Sumpit Pemburu (T2 Jauh), Naginata (T3 Dekat), Tongkat Bo (T4 Dekat), Tombak Lempar (T5 Jauh), Tombak Pemburu (T6 Dekat), Busur Silang Pemburu (T6 Jauh).
- CHA (6 Dekat, 2 Jauh): Rapier (T1 Dekat), Saber (T2 Dekat), Pedang Bangsawan (T3 Dekat), Pistol Flintlock Duel (T3 Jauh), Tongkat Penguasa (T4 Dekat), Cambuk Dagang (T5 Dekat), Pedang Upacara (T6 Dekat), Meriam Genggam Komando (T6 Jauh).
CD-4.02: syarat pakai (ketiganya berlaku). Stat minimal = tier + rarity (Common +0, Uncommon +4, Rare +8, Epic +12, Legendary +16, Unique +20). Level minimal = tier + rarity (+0, +3, +6, +10, +15, +20). Stat di bawah syarat memberi penalti (senjata akurasi -1 per poin).
CD-4.03: anggaran dibagi ke damage, speed, accuracy, defense, trigger (persen). Profil Dekat: STR 40/15/15/5/25, DEX 25/25/20/5/25, CON 25/15/15/25/20, INT 20/15/15/5/45, WIS 30/15/25/10/20, CHA 25/20/25/5/25. Profil Jauh menyesuaikan stat dengan akurasi/speed lebih tinggi dan defense lebih rendah (dasar Jauh: 25/20/30/0/25). Batas per komponen: damage 15-50%, speed 5-30%, accuracy 5-30%, defense 0-30%, trigger 15-60%. Bobot (tebakan): damage 4 poin per 1, speed dan accuracy 1 poin per 1%, defense 2 poin per 1%. Kelebihan trigger memakai poin, kekurangan mengembalikan poin.
CD-4.04: pembeda jarak Dekat vs Jauh (LOCKED: 48 senjata = 32 Dekat + 16 Jauh). Dekat bisa parry dan dinaungi Weaponsmith. Jauh tidak bisa parry, dodge dan akurasi lebih tinggi, dinaungi Rangesmith (+6% Mastery/tier & +2,5% Speed/Accuracy komponen tempa/tier).

CD-5 Armor dan bertahan

CD-5.01: DEX menghindar (parry, dodge, AC). CON mengurangi damage yang lolos lewat Mitigate.
CD-5.02: armor 5 slot, AC: Zirah 40%, Perisai 25%, Helm 15%, Sarung 10%, Sepatu 10%. Kelas ditentukan bahan: ringan (dodge dan parry +8%), berat (Mitigate +10%, kecepatan -5%), sedang = setengah keduanya plus resist elemen +5% per slot terhadap 1 elemen spesifik sesuai elemen bahan/Attunement pembuatannya (maksimal +25% untuk 5 slot sejenis, ditambah sub-stat INT Elemental Barrier).

CD-6 Murid dan CD-7 Kutukan, idle

CD-6.01: murid punya 3 atribut utama (bakat, laju belajar, loyalitas) serta nilai skill fokus latihan (seperti menempa), semuanya memakai skala numerik 0-100 (LOCKED). Batas maksimal 5 murid (LOCKED, selaras WD-3.08). Moral Mulia/Kejam menggeser loyalitas ±1 (WD-3.13). Pemain pilih fokus latihan. Murid pilihan jadi pemilik/penjaga cabang saat pemain pindah (WD-3.10, WD-4.13).
CD-7.01: stamina hanya di idle (Battle atau Smith, laju Battle lebih besar). Offline cap 8 jam. Kalah Gate = satu kutukan acak (debuff per stat maksimal -4, total 13+ tidak bisa bertarung).
4. USULAN & Daftar 48 Weapon Trigger
48 weapon trigger (satu per senjata: 36 trigger awal + 12 trigger senjata Jauh baru):
- STR (8): Twister, Cleave, Splitting Throw (Kapak Lempar Berat - Jauh), Heavy Chain, Breaker Edge, Spike Burst, Earthbreaker, Siege Bolt (Arbalest Baja - Jauh).
- DEX (8): Quick Stab, Riposte, Fan of Knives (Pisau Lempar Kembar - Jauh), Dual Flurry, Iaijutsu, Quick Draw (Busur Pendek - Jauh), Piercing Shot (Busur Panjang - Jauh), Rapid Volley (Crossbow Berulang - Jauh).
- CON (8): Guard Strike, Swing Lash, Counter Fist, Entangling Weight (Bola Rantai Berat - Jauh), Bulwark Slam, Thorn Chain, Sentinel Oath, Fortress Shot (Ballista Perisai - Jauh).
- INT (8): Arcane Bolt, Rune Edge, Prismatic Beam (Orb Rune Melayang - Jauh), Runic Shockwave, Soul Reap, Orbit Discs (Cakram Rune - Jauh), Binding Chain, Arcane Snipe (Senapan Rune - Jauh).
- WIS (8): Keen Thrust, Triple Prong, Neurotoxin Dart (Sumpit Pemburu - Jauh), Sweeping Arc, Disarm Sweep, Tracker Mark (Tombak Lempar - Jauh), Prey Sense, Deadeye Pin (Busur Silang Pemburu - Jauh).
- CHA (8): Feint, Rally Cut, Noble Challenge, Point-Blank Decree (Pistol Flintlock Duel - Jauh), Command Aura, Debt Lash, Grand Ovation, Salvo Signal (Meriam Genggam Komando - Jauh).
Profil anggaran Jauh (opsi A): damage 25 / speed 20 / accuracy 30 / defense 0 / trigger 25.
Mikro-bonus tiap poin stat 1-4 (berhenti di stat 5). Mitigate cap 50% damage mentah.
5. Temuan beta test senjata (Lv10 vs monster Lv10, DEMO)
STR bertahan 1,5-2 kali lebih lama dari stat lain di tier yang sama, karena damage +1 per 2 STR ada di atas anggaran senjata.
CON paling lemah (DPS sekitar setengah STR). Bobot defense 2 poin per 1% tidak cukup.
Jauh kini diperkuat lewat 16 pilihan senjata lintas 6 stat dan komponen Rangesmith (+2,5% speed/accuracy per tier + 6% mastery per tier).
Masalah monster terlalu keras di Lv30 (karena pengali lama x2,25) sudah diselesaikan di v3.2 lewat kelipatan zona 5 Tier linear (x1,0 s.d. x2,0) dan kenaikan cap stat menjadi 30/60/90/120/150.
Opsi penyetelan antar-stat yang belum dipilih: A (bonus stat non-STR), B (kurangi damage anggaran STR), C (naikkan bobot defense dan trigger CON dan CHA). Rekomendasi: B dan C.
5b. Model simulasi, Skill & Forge Engine, dan pemetaan data musuh WD
Dipakai beta test senjata (HTML), bengkel-tempa-v3.html, engines/skill_engine/ (skill_data.json, skill_engine.js, forge_engine.js, test_skill_engine.js, test_forge_engine.js), dan perhitungan stat untuk 4.864 musuh di data/areas/*.json WD.

Model beta test & Skill/Forge Engine

Alokasi stat pemain: stat utama senjata 60% poin bebas, lalu urutan CON, DEX, WIS, STR, INT, CHA (tanpa stat utama) dengan porsi 25% dan 15%. Sisa poin mengisi sampai cap.
Peluang kena = 75% + akurasi senjata + min(20, DEX) + 5 (title), maksimal 95%.
Dodge = min(20, DEX x 0,5)% (+8% untuk senjata Jauh). Parry = min(20, DEX x 0,5)% hanya senjata Dekat. Critical = min(20, WIS)%, damage x2. Jumlah dodge, parry, dan critical dibatasi 30%.
Senjata dari anggaran: damage = poin damage / 4, speed dan accuracy (%) = poinnya, defense (%) = poin / 2. Kecepatan serang dasar 1 per detik x (1 + speed).
Damage per pukulan = (damage senjata + floor(STR/2) + bonus trigger) x (1 + mastery_smith_class) x 1,05 (title) x 0,9 (Jauh) x faktor elemen (x1,25 jika cocok weak musuh, x0,75 jika sama dengan el musuh, x1,0 untuk Neutral).
Trigger (abstraksi): hanya aktif jika pemain memiliki minimal Tier 1 pada Smith Class yang cocok (jika tidak cocok: trigger = 0 dan penalti mastery -25%). Efektif = poin trigger x 0,8 x (1 + 1% x stat utama). STR, DEX, INT, WIS: tambah damage efektif/4. CON: pengurang damage efektif/2 (%). CHA: tambah damage efektif/8 dan pengurang efektif/4 (%). Pengurang total maksimal 60%.
Monster menyerang sesuai speed role, akurasi sesuai role. Damage diterima = (mentah - min(CON/2, 50% mentah)) x (1 - pengurang) x (1 - resist_elemen_armor_sedang).
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
7. OPEN
Pemilik chunk dan pembagian AI. Penyetelan temuan beta test antar-stat (STR vs CON). XP dan drop anti-farm menurut selisih level. Slot trigger Armorer, penalti mati, biaya Long Rest, rumus +N final. Detail mekanik companion tempur murid, ujian murid, dan syarat teknis pewarisan toko (CD-6). Rarity dan +N di anggaran senjata. Bobot anggaran poin. 48 trigger belum disimulasikan efek uniknya satu per satu.
8. Format Laporan Perubahan (isi tiap akhir sesi)
LAPORAN PERUBAHAN
Versi master yang dipakai: v3.1 -> v3.2
Chunk: CD-1, CD-2, CD-3, CD-4, CD-5, CD-6, Bagian 2 & 5b (Tindak lanjut BRIEF WD -> CD v1 + Skill & Forge Engine + 5-Tier Smith Class + 48 Senjata + 21 Perk Smith)
Tanggal sesi: 20-21 November 2026
1. Keputusan baru (ID, isi, status LOCKED/USULAN):
- CD-1.01 & CD-1.07 (LOCKED): Mode Full Lv1-150 aktif (5 Tier x 30 level). Poin stat per level tetap +2 sampai Lv150 (total 311 poin). Cap stat tiap tier naik +30: 30 / 60 / 90 / 120 / 150 (kapasitas total 900).
- CD-1.02b (LOCKED): Setiap Stat Utama memiliki 10 Sub-Stat (6 Tempur + 4 Profesi/Smith = 60 Sub-Stat total) dengan koefisien linear terukur di engines/skill_engine/skill_data.json. Pemain memilih 2 Sub-Stat Fokus per Stat Utama (+25% efisiensi, diubah lewat un-fuse).
- CD-1.04 & CD-1.06 (LOCKED): Target total waktu minimum idle sampai Lv150 = ~720 jam (12 tahun kalender WD). Cap XP/jam setelah Lv30 = 1.200 + 60 x (L - 30) (8.400 XP/jam di Lv150).
- CD-2.01 (LOCKED): Sistem Skill SWTOR Discipline & Cross-Stat Macro Loadout (150 Node = 25 per stat: +10 Core Passive, +20 pilih 1-dari-3 Utility/Morph, +30 Rotational Active Skill). Kapasitas Macro Bar 3-6 slot dari Sub-Stat INT Macro Capacity; tiap Skill Aktif punya 2 slot Cross-Stat Utility Mod.
- CD-3.01, CD-3.02, CD-3.02b, & CD-3.03 (LOCKED): Anggaran total 5 Poin Tingkat (5 Tier) bebas distribusi ke 5 Smith Class. Sistem Nama Kelas 1-Kata Unik. Aturan Mazhab Barang A+C (semua barang bisa ditempa dengan 5 aspek komponen; pemakaian tempur butuh minimal Tier 1 pada class terkait). Daftar lengkap 21 Perk Smith (6 Perk Stat Tunggal Tier 3 syarat stat >= 45 + 15 Perk Hibrida Pasangan Stat Tier 5 syarat 5 poin murni & kedua stat >= 75, dengan Bonus Afinitas +25% bila cocok dengan Smith Class utama).
- CD-4.01 & CD-4.04 (LOCKED): Penambahan 12 Senjata Jarak Jauh baru (2 per Stat, beserta 12 Weapon Trigger baru) sehingga total menjadi 48 Senjata (32 Dekat + 16 Jauh).
- Kontrak Bagian 2 & Bagian 5b (LOCKED): Kelipatan zona dipetakan ke 5 Tier WD secara linear (+0,25/tier): x1,0 / x1,25 / x1,5 / x1,75 / x2,0.
- Bagian 5b (LOCKED): Tabel pemetaan 5 Role WD dan 4 Tipe WD ke pengali HP, damage, speed, akurasi, dodge, dan armor CD.
- CD-5.02 & Bagian 5b (LOCKED): Adopsi 6 Elemen + Neutral WD beserta pembacaan kolom el dan weak. Serangan cocok weak = +25% damage dasar (+ sub-stat INT Weakness Exploit); sama dengan el = -25%. Armor Sedang memberi +5% resist per slot terhadap 1 elemen spesifik sesuai bahan/Attunement.
- CD-6.01 (LOCKED): Batas maksimal 5 murid LOCKED. Skala numerik bakat, laju belajar, loyalitas, dan skill fokus murid dikunci pada 0-100.
- Kontrak Bagian 2 & Bagian 4 (LOCKED): Standarisasi istilah Resonance, Attunement, Conscience. Trigger Palu Rune "Resonance Hammer" diganti menjadi "Runic Shockwave".
2. Aturan lama yang tergantikan:
- Label skala demo Lv30 -> Mode Full Lv1-150.
- Cap XP/jam setelah Lv30 (1.200 + 25/level) -> 1.200 + 60 x (L - 30).
- Kelipatan zona 3 tingkat (x1 / x1,5 / x2,25) -> 5 Tier linear (x1,0 / x1,25 / x1,5 / x1,75 / x2,0).
- Tabel peran/afinitas monster CSV lama & placeholder punya_kelemahan (Y/N) -> Tabel 5 Role & 4 Tipe WD + kolom el/weak 6 Elemen WD.
- Nama trigger INT "Resonance Hammer" -> "Runic Shockwave".
- 36 skill breakpoint statis (5..30) & syarat perk 10/15 -> 150 Node SWTOR Discipline + Cross-Stat Macro Loadout & 21 Perk Smith lengkap (syarat 45/75).
- Nama Smith Class multi-kata -> Nama Kelas 1-Kata Unik dengan anggaran 5 Poin Tier.
- Batas 36 senjata (4 Jauh) -> 48 senjata (32 Dekat + 16 Jauh).
3. Nilai kontrak lintas chunk yang disentuh:
- Skala level (Lv1-150, 5 Tier), cap stat (30/60/90/120/150), kelipatan zona (x1,0 s.d. x2,0), pemetaan role/tipe monster WD, 6 elemen + Neutral, skala murid 0-100 (maks 5 murid), dan istilah Resonance/Attunement/Conscience.
4. KONFLIK dengan chunk lain (jika ada):
- Tidak ada konflik; seluruh permintaan B1-B7 dari BRIEF WD -> CD telah diselesaikan dan diuji di engines/skill_engine/.
5. OPEN baru:
- Tidak ada (OPEN mengenai daftar 21 perk telah ditutup dan dikunci di CD-3.03).
6. Parkir (topik milik chunk lain):
- Tidak ada. Detail companion tempur, ujian murid, dan pewarisan toko tetap di OPEN CD-6 untuk sesi berikutnya.
9. Log versi
v3.0: basis GDD v2 dan perubahan sampai pembahasan Smith type ke-5 dan pembeda jarak DEX.
v3.1: tambah PRJ-01 (fokus backend), bagian 5b (model simulasi dan spesifikasi CSV monster), status LOCKED rumus damage monster, OPEN diperbarui. Saran pembagian AI tercatat sebagai USULAN.
v3.2: integrasi penuh BRIEF WD -> CD v1 (B1-B7) + pembangunan engines/skill_engine/ & forge_engine.js + bengkel-tempa-v3.html: Mode Full Lv1-150, cap stat 30/60/90/120/150, 60 sub-stat, sistem skill SWTOR Discipline & Cross-Stat Macro Loadout (150 node), anggaran 5 Tier Smith Class dengan nama 1-kata unik, aturan Mazhab Barang A+C, 21 Perk Smith lengkap (CD-3.03), perluasan senjata menjadi 48 senjata (32 Dekat + 16 Jauh), target idle Lv150 ~720 jam, kelipatan zona 5 Tier linear (x1,0-x2,0), pemetaan 5 Role & 4 Tipe monster WD, adopsi 6 elemen + Neutral, dan skala murid 0-100.
