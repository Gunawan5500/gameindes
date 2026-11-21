// Battle-Smith RPG — Forge Engine (Bengkel Tempa + Fusi Inti Elemen + 208 Bahan WD + 36 Senjata CD-4 + Sinergi Skill Engine)
// Mempertahankan penuh mekanik inti bengkel-tempa-v2.html yang disukai pengguna:
// 1. 4 Slot Bahan (Inti, Badan, Pengikat, Aksen) + Tag Fisik Kategori (Logam, Kulit, Kayu, Tulang, Kristal, Esensi, Serat)
// 2. Status Keselarasan Elemen Inti (Attunement: Selaras, Netral, Tegang) & 3 Mode Elemen (Terkunci, Fleksibel, Fusi)
// 3. Fitur FUSI INTI KEDUA (6 Elemen Hibrida: Uap, Magma, Badai Beku, Gerhana, Gempa Listrik, Plasma; atau Upgrade Tingkat Inti Kecil -> Sedang -> Besar)
// 4. 5 Kualitas Tempa (Cacat x0.8, Biasa x1.0, Bagus x1.1, Istimewa x1.25, Mahakarya x1.5), 6 Trait Sinergi, 3 Trait Langka, плюс Hidden Trait dari 208 Bahan WD (data/materials.csv)
// 5. Terintegrasi langsung dengan 36 Senjata Resmi CD-4 (6 Stat x 6 Tier + 36 Weapon Trigger), 24 Sub-Stat Profesi (CD-1.02b), dan 5 Smith Class (CD-3)!

export const ELEMENT_ID_TO_WD = {
  api: "Fire",
  es: "Ice",
  petir: "Lightning",
  tanah: "Earth",
  cahaya: "Light",
  gelap: "Dark",
  Fire: "Fire",
  Ice: "Ice",
  Lightning: "Lightning",
  Earth: "Earth",
  Light: "Light",
  Dark: "Dark",
  Neutral: "Neutral"
};

export const ELEMENT_WD_TO_ID = {
  Fire: "api",
  Ice: "es",
  Lightning: "petir",
  Earth: "tanah",
  Light: "cahaya",
  Dark: "gelap",
  Neutral: ""
};

export const ELEMENT_OPPOSITES = {
  api: "es",
  es: "api",
  petir: "tanah",
  tanah: "petir",
  cahaya: "gelap",
  gelap: "cahaya"
};

export const MATERIAL_CATEGORY_TAGS = {
  Logam: ["tajam", "berat"],
  Kulit: ["stabil", "ringan"],
  Kayu: ["ringan"],
  Tulang: ["tumpul", "buas"],
  Kristal: ["murni"],
  Esensi: ["murni", "stabil"],
  Serat: ["pengikat", "stabil"]
};

export const RARITY_QUALITY = {
  Common: 2,
  Uncommon: 3,
  Rare: 4,
  Epic: 5,
  Legendary: 6,
  Unique: 7
};

export const QUALITY_TIERS = ["Cacat", "Biasa", "Bagus", "Istimewa", "Mahakarya"];
export const QUALITY_MULTIPLIERS = [0.8, 1.0, 1.1, 1.25, 1.5];

export const ELEMENT_MODES = ["Terkunci", "Fleksibel", "Fusi"];
export const ELEMENT_MODE_DESC = [
  "Elemen permanen, bonus daya elemen terbesar (x1.3)",
  "Elemen bisa diganti dengan Inti baru",
  "Bisa menanam Inti kedua untuk Elemen Hibrida atau naik Tingkat Inti"
];

export const SYNERGY_TRAITS = [
  { el: "api", tag: "tajam", name: "Gigitan Membara", bonus: { skill_dmg_pct: 10, elem_dmg_pct: 8 } },
  { el: "es", tag: "berat", name: "Hantaman Beku", bonus: { armor_pen_pct: 10, enemy_spd_debuff_pct: 8 } },
  { el: "petir", tag: "ringan", name: "Kilat Cepat", bonus: { attack_speed_pct: 12, cooldown_reduction_sec: 0.5 } },
  { el: "tanah", tag: "tumpul", name: "Guncang Bumi", bonus: { mitigate_bonus_pct: 10, stagger_power_pct: 12 } },
  { el: "cahaya", tag: "murni", name: "Cahaya Suci", bonus: { accuracy_pct: 10, heal_on_cast_pct: 3 } },
  { el: "gelap", tag: "buas", name: "Taring Senyap", bonus: { crit_chance_pct: 6, crit_dmg_pct: 15 } }
];

export const BASE_TAG_TRAITS = {
  tajam: { name: "Tajam", bonus: { skill_dmg_pct: 6 } },
  berat: { name: "Kokoh", bonus: { armor_pen_pct: 6 } },
  buas: { name: "Liar", bonus: { crit_dmg_pct: 10 } },
  murni: { name: "Murni", bonus: { elem_dmg_pct: 8 } },
  ringan: { name: "Lincah", bonus: { attack_speed_pct: 8 } },
  stabil: { name: "Teguh", bonus: { mitigate_bonus_pct: 6 } },
  tumpul: { name: "Padat", bonus: { trigger_power_pct: 8 } }
};

export const RARE_TRAITS = [
  { name: "Bara Abadi", bonus: { skill_dmg_pct: 18, elem_dmg_pct: 15 }, desc: "+18% Skill Dmg & +15% Elemental Potency" },
  { name: "Bisikan Leluhur", bonus: { cooldown_reduction_sec: 1.5, trigger_power_pct: 20 }, desc: "-1.5s Skill Cooldown & +20% Trigger Power" },
  { name: "Retakan Bintang", bonus: { armor_pen_pct: 18, crit_dmg_pct: 25 }, desc: "+18% Armor Penetration & +25% Crit Severity" }
];

export const HYBRID_FUSIONS = {
  "api+es": {
    name: "Uap (Steam)",
    elements_wd: ["Fire", "Ice"],
    desc: "Mengurangi akurasi musuh -12% & menembus pertahanan",
    combat_bonus: { enemy_acc_debuff_pct: 12, skill_dmg_pct: 12 }
  },
  "api+tanah": {
    name: "Magma",
    elements_wd: ["Fire", "Earth"],
    desc: "Luka bakar berat (+20% Skill & Trigger Damage, +10% Armor Crush)",
    combat_bonus: { skill_dmg_pct: 20, armor_pen_pct: 10 }
  },
  "es+petir": {
    name: "Badai Beku (Froststorm)",
    elements_wd: ["Ice", "Lightning"],
    desc: "Peluang membeku (+15% Attack Speed & -10% Speed Musuh)",
    combat_bonus: { attack_speed_pct: 15, skill_dmg_pct: 14 }
  },
  "cahaya+gelap": {
    name: "Gerhana (Eclipse)",
    elements_wd: ["Light", "Dark"],
    desc: "Sangat kuat, menyerang dua kutub (+28% Skill Damage & Auto-Weakness Exploit)",
    combat_bonus: { skill_dmg_pct: 28, auto_match_weakness: true }
  },
  "petir+tanah": {
    name: "Gempa Listrik (Electro-Quake)",
    elements_wd: ["Lightning", "Earth"],
    desc: "Getaran elektromagnetik (+18% Trigger Power & +12% Mitigate)",
    combat_bonus: { trigger_power_pct: 18, dmg_reduction_pct: 10 }
  },
  "api+petir": {
    name: "Plasma",
    elements_wd: ["Fire", "Lightning"],
    desc: "Panas bertegangan tinggi (+18% Armor Penetration & +8% Crit Chance)",
    combat_bonus: { armor_pen_pct: 18, crit_chance_pct: 8, skill_dmg_pct: 15 }
  }
};

// 48 Senjata Resmi CD-4.01 (36 Dasar + 12 Jauh Baru = 8 Senjata per Stat: 32 Dekat + 16 Jauh) + 48 Weapon Trigger
export const WEAPONS_36 = [
  // STR (8: 6 Dekat, 2 Jauh)
  { id: "w_str_1", name: "Kapak Perang", stat: "STR", tier: 1, tag: "Dekat", trigger: "Twister", modeWeights: [55, 30, 15], budget: { damage: 40, speed: 15, accuracy: 15, defense: 5, trigger: 25 } },
  { id: "w_str_2", name: "Kapak Besar", stat: "STR", tier: 2, tag: "Dekat", trigger: "Cleave", modeWeights: [60, 25, 15], budget: { damage: 42, speed: 13, accuracy: 15, defense: 5, trigger: 25 } },
  { id: "w_str_r1", name: "Kapak Lempar Berat", stat: "STR", tier: 2, tag: "Jauh", trigger: "Splitting Throw", modeWeights: [40, 40, 20], budget: { damage: 35, speed: 15, accuracy: 25, defense: 0, trigger: 25 } },
  { id: "w_str_3", name: "Palu Perang", stat: "STR", tier: 3, tag: "Dekat", trigger: "Heavy Chain", modeWeights: [55, 35, 10], budget: { damage: 40, speed: 15, accuracy: 15, defense: 5, trigger: 25 } },
  { id: "w_str_4", name: "Pedang Besar", stat: "STR", tier: 4, tag: "Dekat", trigger: "Breaker Edge", modeWeights: [50, 30, 20], budget: { damage: 40, speed: 15, accuracy: 15, defense: 5, trigger: 25 } },
  { id: "w_str_5", name: "Gada Berduri", stat: "STR", tier: 5, tag: "Dekat", trigger: "Spike Burst", modeWeights: [55, 25, 20], budget: { damage: 40, speed: 15, accuracy: 15, defense: 5, trigger: 25 } },
  { id: "w_str_6", name: "Maul", stat: "STR", tier: 6, tag: "Dekat", trigger: "Earthbreaker", modeWeights: [60, 20, 20], budget: { damage: 45, speed: 10, accuracy: 15, defense: 5, trigger: 25 } },
  { id: "w_str_r2", name: "Arbalest Baja", stat: "STR", tier: 6, tag: "Jauh", trigger: "Siege Bolt", modeWeights: [35, 35, 30], budget: { damage: 38, speed: 12, accuracy: 25, defense: 0, trigger: 25 } },

  // DEX (8: 4 Dekat, 4 Jauh)
  { id: "w_dex_1", name: "Belati", stat: "DEX", tier: 1, tag: "Dekat", trigger: "Quick Stab", modeWeights: [30, 50, 20], budget: { damage: 25, speed: 25, accuracy: 20, defense: 5, trigger: 25 } },
  { id: "w_dex_2", name: "Pedang Pendek", stat: "DEX", tier: 2, tag: "Dekat", trigger: "Riposte", modeWeights: [30, 50, 20], budget: { damage: 25, speed: 25, accuracy: 20, defense: 5, trigger: 25 } },
  { id: "w_dex_r1", name: "Pisau Lempar Kembar", stat: "DEX", tier: 2, tag: "Jauh", trigger: "Fan of Knives", modeWeights: [25, 45, 30], budget: { damage: 22, speed: 28, accuracy: 25, defense: 0, trigger: 25 } },
  { id: "w_dex_3", name: "Belati Kembar", stat: "DEX", tier: 3, tag: "Dekat", trigger: "Dual Flurry", modeWeights: [25, 45, 30], budget: { damage: 25, speed: 25, accuracy: 20, defense: 5, trigger: 25 } },
  { id: "w_dex_4", name: "Katana", stat: "DEX", tier: 4, tag: "Dekat", trigger: "Iaijutsu", modeWeights: [35, 40, 25], budget: { damage: 28, speed: 25, accuracy: 20, defense: 2, trigger: 25 } },
  { id: "w_dex_5", name: "Busur Pendek", stat: "DEX", tier: 5, tag: "Jauh", trigger: "Quick Draw", modeWeights: [25, 45, 30], budget: { damage: 25, speed: 20, accuracy: 30, defense: 0, trigger: 25 } },
  { id: "w_dex_6", name: "Busur Panjang", stat: "DEX", tier: 6, tag: "Jauh", trigger: "Piercing Shot", modeWeights: [25, 45, 30], budget: { damage: 25, speed: 20, accuracy: 30, defense: 0, trigger: 25 } },
  { id: "w_dex_r2", name: "Crossbow Berulang", stat: "DEX", tier: 6, tag: "Jauh", trigger: "Rapid Volley", modeWeights: [20, 45, 35], budget: { damage: 24, speed: 26, accuracy: 25, defense: 0, trigger: 25 } },

  // CON (8: 6 Dekat, 2 Jauh)
  { id: "w_con_1", name: "Gada Penjaga", stat: "CON", tier: 1, tag: "Dekat", trigger: "Guard Strike", modeWeights: [50, 35, 15], budget: { damage: 25, speed: 15, accuracy: 15, defense: 25, trigger: 20 } },
  { id: "w_con_2", name: "Flail Baja", stat: "CON", tier: 2, tag: "Dekat", trigger: "Swing Lash", modeWeights: [45, 35, 20], budget: { damage: 25, speed: 15, accuracy: 15, defense: 25, trigger: 20 } },
  { id: "w_con_3", name: "Gauntlet Baja", stat: "CON", tier: 3, tag: "Dekat", trigger: "Counter Fist", modeWeights: [50, 30, 20], budget: { damage: 25, speed: 15, accuracy: 15, defense: 25, trigger: 20 } },
  { id: "w_con_r1", name: "Bola Rantai Berat", stat: "CON", tier: 3, tag: "Jauh", trigger: "Entangling Weight", modeWeights: [40, 35, 25], budget: { damage: 25, speed: 15, accuracy: 25, defense: 15, trigger: 20 } },
  { id: "w_con_4", name: "Palu Penjaga", stat: "CON", tier: 4, tag: "Dekat", trigger: "Bulwark Slam", modeWeights: [55, 30, 15], budget: { damage: 25, speed: 15, accuracy: 15, defense: 25, trigger: 20 } },
  { id: "w_con_5", name: "Rantai Berduri", stat: "CON", tier: 5, tag: "Dekat", trigger: "Thorn Chain", modeWeights: [40, 35, 25], budget: { damage: 25, speed: 15, accuracy: 15, defense: 25, trigger: 20 } },
  { id: "w_con_6", name: "Pedang Penjaga", stat: "CON", tier: 6, tag: "Dekat", trigger: "Sentinel Oath", modeWeights: [50, 30, 20], budget: { damage: 25, speed: 15, accuracy: 15, defense: 25, trigger: 20 } },
  { id: "w_con_r2", name: "Ballista Perisai", stat: "CON", tier: 6, tag: "Jauh", trigger: "Fortress Shot", modeWeights: [45, 30, 25], budget: { damage: 25, speed: 12, accuracy: 23, defense: 20, trigger: 20 } },

  // INT (8: 5 Dekat, 3 Jauh)
  { id: "w_int_1", name: "Tongkat Rune", stat: "INT", tier: 1, tag: "Dekat", trigger: "Arcane Bolt", modeWeights: [15, 35, 50], budget: { damage: 20, speed: 15, accuracy: 15, defense: 5, trigger: 45 } },
  { id: "w_int_2", name: "Pedang Rune", stat: "INT", tier: 2, tag: "Dekat", trigger: "Rune Edge", modeWeights: [20, 35, 45], budget: { damage: 20, speed: 15, accuracy: 15, defense: 5, trigger: 45 } },
  { id: "w_int_r1", name: "Orb Rune Melayang", stat: "INT", tier: 2, tag: "Jauh", trigger: "Prismatic Beam", modeWeights: [10, 30, 60], budget: { damage: 20, speed: 15, accuracy: 20, defense: 0, trigger: 45 } },
  { id: "w_int_3", name: "Palu Rune", stat: "INT", tier: 3, tag: "Dekat", trigger: "Runic Shockwave", modeWeights: [20, 30, 50], budget: { damage: 20, speed: 15, accuracy: 15, defense: 5, trigger: 45 } },
  { id: "w_int_4", name: "Sabit Arcane", stat: "INT", tier: 4, tag: "Dekat", trigger: "Soul Reap", modeWeights: [15, 30, 55], budget: { damage: 20, speed: 15, accuracy: 15, defense: 5, trigger: 45 } },
  { id: "w_int_5", name: "Cakram Rune", stat: "INT", tier: 5, tag: "Jauh", trigger: "Orbit Discs", modeWeights: [10, 30, 60], budget: { damage: 20, speed: 15, accuracy: 20, defense: 0, trigger: 45 } },
  { id: "w_int_6", name: "Rantai Rune", stat: "INT", tier: 6, tag: "Dekat", trigger: "Binding Chain", modeWeights: [15, 30, 55], budget: { damage: 20, speed: 15, accuracy: 15, defense: 5, trigger: 45 } },
  { id: "w_int_r2", name: "Senapan Rune", stat: "INT", tier: 6, tag: "Jauh", trigger: "Arcane Snipe", modeWeights: [15, 25, 60], budget: { damage: 22, speed: 15, accuracy: 23, defense: 0, trigger: 40 } },

  // WIS (8: 5 Dekat, 3 Jauh)
  { id: "w_wis_1", name: "Tombak", stat: "WIS", tier: 1, tag: "Dekat", trigger: "Keen Thrust", modeWeights: [35, 45, 20], budget: { damage: 30, speed: 15, accuracy: 25, defense: 10, trigger: 20 } },
  { id: "w_wis_2", name: "Trisula", stat: "WIS", tier: 2, tag: "Dekat", trigger: "Triple Prong", modeWeights: [30, 45, 25], budget: { damage: 30, speed: 15, accuracy: 25, defense: 10, trigger: 20 } },
  { id: "w_wis_r1", name: "Sumpit Pemburu", stat: "WIS", tier: 2, tag: "Jauh", trigger: "Neurotoxin Dart", modeWeights: [25, 45, 30], budget: { damage: 24, speed: 22, accuracy: 30, defense: 0, trigger: 24 } },
  { id: "w_wis_3", name: "Naginata", stat: "WIS", tier: 3, tag: "Dekat", trigger: "Sweeping Arc", modeWeights: [35, 40, 25], budget: { damage: 30, speed: 15, accuracy: 25, defense: 10, trigger: 20 } },
  { id: "w_wis_4", name: "Tongkat Bo", stat: "WIS", tier: 4, tag: "Dekat", trigger: "Disarm Sweep", modeWeights: [30, 50, 20], budget: { damage: 30, speed: 15, accuracy: 25, defense: 10, trigger: 20 } },
  { id: "w_wis_5", name: "Tombak Lempar", stat: "WIS", tier: 5, tag: "Jauh", trigger: "Tracker Mark", modeWeights: [35, 45, 20], budget: { damage: 25, speed: 20, accuracy: 30, defense: 0, trigger: 25 } },
  { id: "w_wis_6", name: "Tombak Pemburu", stat: "WIS", tier: 6, tag: "Dekat", trigger: "Prey Sense", modeWeights: [35, 40, 25], budget: { damage: 30, speed: 15, accuracy: 25, defense: 10, trigger: 20 } },
  { id: "w_wis_r2", name: "Busur Silang Pemburu", stat: "WIS", tier: 6, tag: "Jauh", trigger: "Deadeye Pin", modeWeights: [30, 40, 30], budget: { damage: 28, speed: 17, accuracy: 30, defense: 0, trigger: 25 } },

  // CHA (8: 6 Dekat, 2 Jauh)
  { id: "w_cha_1", name: "Rapier", stat: "CHA", tier: 1, tag: "Dekat", trigger: "Feint", modeWeights: [30, 45, 25], budget: { damage: 25, speed: 20, accuracy: 25, defense: 5, trigger: 25 } },
  { id: "w_cha_2", name: "Saber", stat: "CHA", tier: 2, tag: "Dekat", trigger: "Rally Cut", modeWeights: [35, 40, 25], budget: { damage: 25, speed: 20, accuracy: 25, defense: 5, trigger: 25 } },
  { id: "w_cha_3", name: "Pedang Bangsawan", stat: "CHA", tier: 3, tag: "Dekat", trigger: "Noble Challenge", modeWeights: [30, 40, 30], budget: { damage: 25, speed: 20, accuracy: 25, defense: 5, trigger: 25 } },
  { id: "w_cha_r1", name: "Pistol Flintlock Duel", stat: "CHA", tier: 3, tag: "Jauh", trigger: "Point-Blank Decree", modeWeights: [25, 40, 35], budget: { damage: 25, speed: 20, accuracy: 30, defense: 0, trigger: 25 } },
  { id: "w_cha_4", name: "Tongkat Penguasa", stat: "CHA", tier: 4, tag: "Dekat", trigger: "Command Aura", modeWeights: [25, 40, 35], budget: { damage: 25, speed: 20, accuracy: 25, defense: 5, trigger: 25 } },
  { id: "w_cha_5", name: "Cambuk Dagang", stat: "CHA", tier: 5, tag: "Dekat", trigger: "Debt Lash", modeWeights: [30, 45, 25], budget: { damage: 25, speed: 20, accuracy: 25, defense: 5, trigger: 25 } },
  { id: "w_cha_6", name: "Pedang Upacara", stat: "CHA", tier: 6, tag: "Dekat", trigger: "Grand Ovation", modeWeights: [25, 35, 40], budget: { damage: 25, speed: 20, accuracy: 25, defense: 5, trigger: 25 } },
  { id: "w_cha_r2", name: "Meriam Genggam Komando", stat: "CHA", tier: 6, tag: "Jauh", trigger: "Salvo Signal", modeWeights: [25, 35, 40], budget: { damage: 27, speed: 18, accuracy: 28, defense: 0, trigger: 27 } }
];
export const WEAPONS_48 = WEAPONS_36;

// 15 Jenis Armor Resmi CD-5.02b (5 Slot x 3 Kelas: Ringan, Sedang, Berat) + 15 Base Armor Trigger Unik
export const ARMORS_15 = [
  // 1. Zirah / Chest (40% AC)
  { id: "a_chest_light", itemType: "armor", slot: "Zirah", acPct: 40, armorClass: "Ringan", name: "Zirah Kulit Bayangan", stat: "DEX", tier: 1, tag: "Armor Ringan", trigger: "Shadow Weave", triggerDesc: "+15% Attack Speed & Crit usai Dodge", modeWeights: [30, 45, 25], budget: { damage: 10, speed: 20, accuracy: 15, defense: 30, trigger: 25 } },
  { id: "a_chest_med",   itemType: "armor", slot: "Zirah", acPct: 40, armorClass: "Sedang", name: "Zirah Sisik Elemen", stat: "INT", tier: 2, tag: "Armor Sedang", trigger: "Elemental Carapace", triggerDesc: "Serap 15% serangan elemen ke Trigger (+5% Resist Elemen)", modeWeights: [20, 35, 45], budget: { damage: 10, speed: 10, accuracy: 10, defense: 35, trigger: 35 } },
  { id: "a_chest_heavy", itemType: "armor", slot: "Zirah", acPct: 40, armorClass: "Berat",  name: "Zirah Pelat Adamantine", stat: "CON", tier: 3, tag: "Armor Berat", trigger: "Adamantine Bulwark", triggerDesc: "+25% Mitigate Shield saat HP < 50%", modeWeights: [55, 25, 20], budget: { damage: 5, speed: 5, accuracy: 10, defense: 50, trigger: 30 } },

  // 2. Perisai / Shield (25% AC)
  { id: "a_shield_light", itemType: "armor", slot: "Perisai", acPct: 25, armorClass: "Ringan", name: "Buckler Tangkis Cepat", stat: "DEX", tier: 1, tag: "Armor Ringan", trigger: "Buckler Riposte", triggerDesc: "Balas 50% weapon dmg otomatis saat Parry", modeWeights: [30, 50, 20], budget: { damage: 15, speed: 20, accuracy: 15, defense: 25, trigger: 25 } },
  { id: "a_shield_med",   itemType: "armor", slot: "Perisai", acPct: 25, armorClass: "Sedang", name: "Perisai Segel Rune", stat: "INT", tier: 2, tag: "Armor Sedang", trigger: "Runic Ward Shield", triggerDesc: "Pantulkan 20% serangan elemen (+5% Resist Elemen)", modeWeights: [20, 30, 50], budget: { damage: 10, speed: 10, accuracy: 15, defense: 30, trigger: 35 } },
  { id: "a_shield_heavy", itemType: "armor", slot: "Perisai", acPct: 25, armorClass: "Berat",  name: "Perisai Menara Benteng", stat: "CON", tier: 3, tag: "Armor Berat", trigger: "Fortress Wall", triggerDesc: "Redam 35% damage & Stagger lawan (-10% Speed musuh)", modeWeights: [60, 25, 15], budget: { damage: 5, speed: 5, accuracy: 10, defense: 55, trigger: 25 } },

  // 3. Helm (15% AC)
  { id: "a_helm_light", itemType: "armor", slot: "Helm", acPct: 15, armorClass: "Ringan", name: "udung Bidik Pemburu", stat: "WIS", tier: 1, tag: "Armor Ringan", trigger: "Predator's Visor", triggerDesc: "+8% Akurasi & deteksi celah Dodge lawan", modeWeights: [30, 45, 25], budget: { damage: 10, speed: 15, accuracy: 30, defense: 20, trigger: 25 } },
  { id: "a_helm_med",   itemType: "armor", slot: "Helm", acPct: 15, armorClass: "Sedang", name: "Mahkota Pelindung Pikiran", stat: "CHA", tier: 2, tag: "Armor Sedang", trigger: "Mind-Ward Circlet", triggerDesc: "-30% durasi debuff/kutukan & -8% Cooldown Skill", modeWeights: [25, 35, 40], budget: { damage: 10, speed: 15, accuracy: 15, defense: 25, trigger: 35 } },
  { id: "a_helm_heavy", itemType: "armor", slot: "Helm", acPct: 15, armorClass: "Berat",  name: "Helm Baja Juggernaut", stat: "CON", tier: 3, tag: "Armor Berat", trigger: "Iron Juggernaut Helm", triggerDesc: "Redam 50% bonus Critical Hit lawan", modeWeights: [55, 30, 15], budget: { damage: 5, speed: 5, accuracy: 15, defense: 50, trigger: 25 } },

  // 4. Sarung Tangan / Gauntlets (10% AC)
  { id: "a_glove_light", itemType: "armor", slot: "Sarung", acPct: 10, armorClass: "Ringan", name: "Sarung Tangan Presisi", stat: "DEX", tier: 1, tag: "Armor Ringan", trigger: "Sleight Grips", triggerDesc: "+10% Attack Speed & +5% Parry", modeWeights: [30, 50, 20], budget: { damage: 10, speed: 25, accuracy: 20, defense: 20, trigger: 25 } },
  { id: "a_glove_med",   itemType: "armor", slot: "Sarung", acPct: 10, armorClass: "Sedang", name: "Bracer Penyalur Inti", stat: "INT", tier: 2, tag: "Armor Sedang", trigger: "Channeler's Bracers", triggerDesc: "+12% daya Inti Elemen & Fusi Hibrida senjata", modeWeights: [20, 35, 45], budget: { damage: 10, speed: 15, accuracy: 15, defense: 25, trigger: 35 } },
  { id: "a_glove_heavy", itemType: "armor", slot: "Sarung", acPct: 10, armorClass: "Berat",  name: "Gauntlet Penghancur Baja", stat: "STR", tier: 3, tag: "Armor Berat", trigger: "Crushing Gauntlets", triggerDesc: "+10% Armor Crush & daya hantam senjata berat", modeWeights: [55, 25, 20], budget: { damage: 20, speed: 10, accuracy: 10, defense: 35, trigger: 25 } },

  // 5. Sepatu / Boots (10% AC)
  { id: "a_boot_light", itemType: "armor", slot: "Sepatu", acPct: 10, armorClass: "Ringan", name: "Sepatu Langkah Angin", stat: "DEX", tier: 1, tag: "Armor Ringan", trigger: "Windstep Boots", triggerDesc: "+8% Dodge & hemat Stamina tempur -15%", modeWeights: [30, 50, 20], budget: { damage: 5, speed: 30, accuracy: 15, defense: 25, trigger: 25 } },
  { id: "a_boot_med",   itemType: "armor", slot: "Sepatu", acPct: 10, armorClass: "Sedang", name: "Sepatu Penjelajah Medan", stat: "WIS", tier: 2, tag: "Armor Sedang", trigger: "Strider Treads", triggerDesc: "+5% Dodge, +5% Mitigate, & +5% Resist Elemen", modeWeights: [30, 40, 30], budget: { damage: 5, speed: 20, accuracy: 15, defense: 30, trigger: 30 } },
  { id: "a_boot_heavy", itemType: "armor", slot: "Sepatu", acPct: 10, armorClass: "Berat",  name: "Greaves Pengguncang Bumi", stat: "CON", tier: 3, tag: "Armor Berat", trigger: "Earthshaker Greaves", triggerDesc: "Hapus penalti speed Armor Berat & +10% Poise", modeWeights: [55, 30, 15], budget: { damage: 10, speed: 15, accuracy: 10, defense: 45, trigger: 20 } }
];

// +1 Secondary Trigger per Slot Armor yang dibuka bertahap oleh Tier Armorer (1 s.d. 5)
export const ARMORER_SECONDARY_TRIGGERS = {
  Zirah:   { reqArmorerTier: 1, name: "Heart of the Forge", desc: "+12% Max HP & pulihkan 2% HP tiap Armor Trigger aktif", bonus: { max_hp_pct: 12, dmg_reduction_pct: 5 } },
  Perisai: { reqArmorerTier: 2, name: "Unbreakable Aegis", desc: "+10% Block/Parry & ubah 30% Mitigate Perisai ke Raw Might", bonus: { skill_dmg_pct: 10, dmg_reduction_pct: 6 } },
  Helm:    { reqArmorerTier: 3, name: "Tactical Command Crown", desc: "-1.5 dtk Cooldown Skill Defensif/Combo & kebal interupsi", bonus: { cooldown_reduction_sec: 1.5, dmg_reduction_pct: 5 } },
  Sarung:  { reqArmorerTier: 4, name: "Ironclad Grip", desc: "+15% daya Weapon Trigger senjata yang digenggam", bonus: { trigger_power_pct: 15, skill_dmg_pct: 8 } },
  Sepatu:  { reqArmorerTier: 5, name: "Seismic Stride", desc: "Guncang tanah: kurangi Akurasi & Speed serang musuh -12%", bonus: { enemy_debuff_pct: 12, dmg_reduction_pct: 6 } }
};

// +1 Ultimate Armor Trigger (Full-Set Capstone ke-11 khusus Armorer Murni 5+0 / Aegisborn)
export const ARMORER_ULTIMATE_TRIGGERS = {
  Berat:  { name: "Living Citadel of the World-Forge", desc: "-20% damage masuk ekstra, cap Mitigate 70%, & ledakan Citadel Nova (50% Max HP tiap 5 dtk)", bonus: { dmg_reduction_pct: 20, max_hp_pct: 20, skill_dmg_pct: 28 } },
  Sedang: { name: "Prismatic Sanctuary Matrix", desc: "+25% Resist seluruh 6 Elemen & pantulan serangan elemen Weakness Exploit x1.5", bonus: { dmg_reduction_pct: 16, elem_resist_all_pct: 25, skill_dmg_pct: 25 } },
  Ringan: { name: "Phantom Mirage Carapace", desc: "Cap Dodge+Parry naik ke 45% & serangan balik otomatis Phantom Counter-Slash (120% weapon dmg)", bonus: { dodge_parry_cap_bonus: 15, dmg_reduction_pct: 15, skill_dmg_pct: 30 } }
};

export const ALL_CRAFTABLE_ITEMS_63 = [...WEAPONS_48, ...ARMORS_15];

/**
 * Parser CSV sederhana untuk membaca 208 bahan dari data/materials.csv WD
 */
export function parseMaterialsCsv(csvText) {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim());

  const materials = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    // Parse CSV with quoted fields
    const cols = [];
    let cur = "", inQuotes = false;
    for (let c = 0; c < line.length; c++) {
      const ch = line[c];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        cols.push(cur.trim());
        cur = "";
      } else {
        cur += ch;
      }
    }
    cols.push(cur.trim());

    const row = {};
    headers.forEach((h, idx) => { row[h] = cols[idx] || ""; });

    const elId = ELEMENT_WD_TO_ID[row.element] || "es";
    const cat = row.category || "Logam";
    const tags = (MATERIAL_CATEGORY_TAGS[cat] || ["tajam"]).slice();
    const rarity = row.rarity || "Common";

    materials.push({
      id: row.material_id,
      n: row.material_name,
      area_id: row.area_id,
      g: row.area_name || "Umum",
      tier: +row.tier || 1,
      r: rarity,
      k: cat,
      a: elId,
      element_wd: row.element || "Neutral",
      sub_damage_tag: row.sub_damage_tag || "",
      t: tags,
      q: RARITY_QUALITY[rarity] || 2,
      craft_power_pts: +row.craft_power_pts || 1,
      primary_stat: row.primary_stat || "STR",
      stat_bonus: +row.stat_bonus || 1,
      hidden_trait: row.hidden_trait || "Dormant",
      hidden_trait_effect: row.hidden_trait_effect || "",
      s: `${row.drop_source} (${row.area_name})`
    });
  }
  return materials;
}

/**
 * Jumlah slot bahan Bengkel Tempa berdasarkan Level Smith (Lv1-150):
 * Lv1-10: 2 slot (Inti, Badan)
 * Lv11-20: 3 slot (Inti, Badan, Pengikat)
 * Lv21-150: 4 slot penuh (Inti, Badan, Pengikat, Aksen)
 */
export function getForgeMaterialSlots(level) {
  return level <= 10 ? 2 : level <= 20 ? 3 : 4;
}

export function createForgeEngine({ skillEngine, weapons = WEAPONS_36, materials = [] }) {
  /**
   * 1. Pratinjau & Kalkulasi Peluang Tempa (calc() dari bengkel-tempa-v2.html + 24 Sub-Stat Profesi & 5 Smith Class!)
   */
  function previewForge({
    level = 30,
    stats = { STR: 30, DEX: 15, CON: 20, INT: 15, WIS: 10, CHA: 10 },
    focusSubStats = {},
    smithConfig = { primaryType: "Weaponsmith", primaryRank: 2 },
    weaponId = "w_str_1",
    pickedMaterialIds = [],
    coreElement = "api", // "", "api", "es", "petir", "tanah", "cahaya", "gelap"
    coreSize = "sedang", // "kecil", "sedang", "besar"
    isIdle = false
  }) {
    const weapon = weapons.find(w => w.id === weaponId || w.name === weaponId) || weapons[0];
    const picks = pickedMaterialIds
      .map(id => materials.find(m => m.id === id || m.n === id))
      .filter(Boolean);

    if (!picks.length) return { valid: false, reason: "Pilih minimal 1 bahan tempa." };

    const sub = skillEngine ? skillEngine.computeSubStats(stats, focusSubStats).byId : {};
    const smith = skillEngine ? skillEngine.evaluateSmithMastery(stats, smithConfig) : { craftBonusPct: 12, primaryType: "Weaponsmith", primaryRank: 2 };

    const n = picks.length;
    const avgQ = picks.reduce((acc, m) => acc + m.q, 0) / n;
    const totalCraftPower = picks.reduce((acc, m) => acc + (m.craft_power_pts || m.q), 0);
    const cnt = tag => picks.filter(m => m.t.includes(tag)).length;

    // Status Keselarasan Elemen Inti (Attunement WD-4.06: tanpa / netral / selaras / tegang)
    let resonanceStatus = "tanpa";
    if (coreElement) {
      resonanceStatus = "netral";
      if (picks.some(m => m.a === ELEMENT_OPPOSITES[coreElement])) resonanceStatus = "tegang";
      else if (picks.some(m => m.a === coreElement)) resonanceStatus = "selaras";
    }

    const hasBinder = cnt("pengikat") > 0;

    // Bonus Sub-Stat Profesi CD-1.02b:
    // - str_hammer_strike (+0.25%/pt): menaikkan peluang berhasil tempa
    // - int_attunement_craft (+0.25%/pt): memperbesar bonus Selaras & meredam penalti Tegang
    // - con_material_conservation (+0.20%/pt): menyelamatkan bahan saat gagal
    const hammerBonus = sub.str_hammer_strike ? sub.str_hammer_strike.value * 0.4 : 0;
    const attuneBonus = sub.int_attunement_craft ? sub.int_attunement_craft.value * 0.35 : 0;
    const toolsBonus = sub.int_smith_tools ? sub.int_smith_tools.value * 0.4 : 0;
    const purityBonus = sub.wis_material_purity ? sub.wis_material_purity.value * 0.35 : 0;
    const conservePct = sub.con_material_conservation ? Math.min(45, sub.con_material_conservation.value) : 0;

    // Peluang berhasil tempa (rumus asli bengkel-tempa-v2 + skala Lv150 & Sub-Stat)
    const effectiveLv = Math.min(40, level); // agar di Lv150 tidak otomatis 100% tanpa bahan bagus
    let successChance = 50 + 1.1 * effectiveLv - 6 * n + avgQ * 4 + (hasBinder ? 8 : 0)
      + (resonanceStatus === "selaras" ? 8 + attuneBonus : resonanceStatus === "tegang" ? Math.min(0, -10 + attuneBonus * 0.5) : 0)
      + hammerBonus;

    if (coreElement && coreSize === "besar" && level < 20) successChance -= 12;
    if (coreElement && coreSize === "sedang" && level < 10) successChance -= 6;
    successChance = Math.max(5, Math.min(98, +successChance.toFixed(1)));

    // Bobot Mode Elemen [Terkunci, Fleksibel, Fusi]
    // Sub-Stat INT Attunement Craft & Poin Tier Runesmith (0-5) meningkatkan bobot mode Fusi!
    const runesmithTier = smith.tiers ? (smith.tiers.Runesmith || 0) : (smith.primaryType === "Runesmith" ? smith.primaryRank : 0);
    const runesmithFusionBoost = runesmithTier * 6;
    const modeWeights = [
      weapon.modeWeights[0] + 8 * cnt("stabil"),
      weapon.modeWeights[1] + 8 * cnt("pengikat"),
      weapon.modeWeights[2] + 8 * cnt("murni") + Math.min(45, level * 0.3) + attuneBonus + runesmithFusionBoost
    ];
    if (isIdle) modeWeights[2] *= 0.5;

    const totalMw = modeWeights.reduce((a, b) => a + b, 0);
    const modeProbabilitiesPct = modeWeights.map(w => Math.round((w / totalMw) * 100));

    // Deteksi Trait Sinergi
    let detectedTrait = "Polos";
    let detectedTraitBonus = {};
    if (coreElement) {
      const syn = SYNERGY_TRAITS.find(x => x.el === coreElement && cnt(x.tag) > 0);
      if (syn) {
        detectedTrait = syn.name;
        detectedTraitBonus = syn.bonus;
      }
    }
    if (detectedTrait === "Polos") {
      const topTag = Object.keys(BASE_TAG_TRAITS).sort((a, b) => cnt(b) - cnt(a))[0];
      if (cnt(topTag) > 0) {
        detectedTrait = BASE_TAG_TRAITS[topTag].name;
        detectedTraitBonus = BASE_TAG_TRAITS[topTag].bonus;
      }
    }

    // Estimasi peluang Trait Langka
    const rareTraitChancePct = Math.min(65, +(4 + (resonanceStatus === "tegang" ? 10 : 0) + purityBonus + (smith.craftBonusPct * 0.25) - (isIdle ? 2 : 0)).toFixed(1));

    return {
      valid: true,
      weapon,
      picks,
      n,
      avgQ: +avgQ.toFixed(2),
      totalCraftPower,
      cnt,
      coreElement,
      coreSize,
      resonanceStatus,
      hasBinder,
      successChance,
      modeWeights,
      modeProbabilitiesPct,
      detectedTrait,
      detectedTraitBonus,
      rareTraitChancePct,
      subStatBonuses: {
        hammerBonus: +hammerBonus.toFixed(1),
        attuneBonus: +attuneBonus.toFixed(1),
        toolsBonus: +toolsBonus.toFixed(1),
        purityBonus: +purityBonus.toFixed(1),
        conservePct: +conservePct.toFixed(1)
      },
      smith
    };
  }

  /**
   * 2. Eksekusi Tempa (forge() + 5 Komponen Barang Opsi C + Kecocokan Pemakaian Opsi A)
   */
  function executeForge(params, rngFn = Math.random) {
    const pv = previewForge(params);
    if (!pv.valid) return pv;

    const rollSuccess = rngFn() * 100;
    if (rollSuccess > pv.successChance) {
      const lossRatio = (0.3 + rngFn() * 0.3) * (pv.hasBinder ? 0.7 : 1.0) * (1 - pv.subStatBonuses.conservePct / 100);
      const lostCount = Math.min(pv.n, Math.max(1, Math.round(pv.n * lossRatio)));
      const lostMaterials = pv.picks.slice(0, lostCount).map(m => m.n);
      const keptMaterials = pv.picks.slice(lostCount).map(m => m.n);
      return {
        success: false,
        lostMaterials,
        keptMaterials,
        xpGained: 4
      };
    }

    // 5 Komponen Barang (Opsi C) dari distribusi 5 Tier Smith Class:
    const sTiers = pv.smith.tiers || { Weaponsmith: 2, Armorer: 0, Rangesmith: 0, Runesmith: 0, Reforger: 0 };
    const reforgerPolishBonus = (sTiers.Reforger || 0) * 3.5;

    // Skor Kualitas (q) diperkuat oleh Sub-Stat INT Smith's Tools, Smith Class Bonus, & Komponen Reforger
    const qualityScore = rngFn() * 70
      + Math.min(45, (params.level || 30) * 0.4)
      + pv.avgQ * 4
      + (pv.resonanceStatus === "selaras" ? 6 : 0)
      + pv.subStatBonuses.toolsBonus
      + (pv.smith.craftBonusPct * 0.35)
      + reforgerPolishBonus
      - (params.isIdle ? 8 : 0);

    const qualityTierIdx = qualityScore < 30 ? 0 : qualityScore < 55 ? 1 : qualityScore < 72 ? 2 : qualityScore < 85 ? 3 : 4;
    const qualityName = QUALITY_TIERS[qualityTierIdx];
    const qualityMult = QUALITY_MULTIPLIERS[qualityTierIdx];

    // Trait & Rare Trait Roll
    let traitName = pv.detectedTrait;
    let traitBonus = { ...pv.detectedTraitBonus };
    let isRareTrait = false;
    const finalRareChance = pv.rareTraitChancePct + (qualityTierIdx >= 3 ? 8 : 0);

    if (rngFn() * 100 < finalRareChance) {
      isRareTrait = true;
      const pickedRare = RARE_TRAITS[Math.floor(rngFn() * RARE_TRAITS.length)];
      traitName = pickedRare.name;
      traitBonus = { ...pickedRare.bonus };
    }
    if (qualityTierIdx === 0 && !isRareTrait) {
      traitName = "Retak Berdenging";
      traitBonus = {};
    }

    // Roll Mode Elemen (0 = Terkunci, 1 = Fleksibel, 2 = Fusi)
    let modeIdx = -1;
    if (pv.coreElement) {
      const w = pv.modeWeights.slice();
      w[2] += qualityTierIdx === 3 ? 10 : qualityTierIdx === 4 ? 20 : 0;
      let r = rngFn() * w.reduce((a, b) => a + b, 0);
      modeIdx = 0;
      while (r > w[modeIdx] && modeIdx < 2) {
        r -= w[modeIdx];
        modeIdx++;
      }
    }

    const mainMaterial = pv.picks.slice().sort((a, b) => (b.craft_power_pts || b.q) - (a.craft_power_pts || a.q))[0];
    const elemBonusPct = pv.coreElement
      ? ({ kecil: 5, sedang: 10, besar: 15 }[pv.coreSize] || 10) * (modeIdx === 0 ? 1.3 : 1.0)
      : 0;

    // 5 Komponen Barang (Opsi C) memberikan bonus anatomi spesifik pada barang yang ditempa:
    // - Weaponsmith Tier: +2% Melee Damage & Trigger per tier
    // - Rangesmith Tier: +2.5% Ranged Speed & Accuracy per tier
    // - Armorer Tier: +3% Defense/Guard Budget per tier
    // - Runesmith Tier: +2.5% Trigger/Elemental Resonance per tier
    // - Reforger Tier: +1 Enhance (+N) awal setiap 2 tier Reforger
    const wsmMult = pv.weapon.tag === "Dekat" ? 1 + (sTiers.Weaponsmith || 0) * 0.02 : 1.0;
    const rngMult = pv.weapon.tag === "Jauh" ? 1 + (sTiers.Rangesmith || 0) * 0.025 : 1.0;
    const armMult = 1 + (sTiers.Armorer || 0) * 0.03;
    const runMult = 1 + (sTiers.Runesmith || 0) * 0.025;
    const initialEnhancePlus = Math.floor((sTiers.Reforger || 0) / 2);

    const scaledBudget = {
      damage: +(pv.weapon.budget.damage * qualityMult * wsmMult * (1 + elemBonusPct / 100) * (1 + initialEnhancePlus * 0.04)).toFixed(1),
      speed: +(pv.weapon.budget.speed * qualityMult * rngMult).toFixed(1),
      accuracy: +(pv.weapon.budget.accuracy * qualityMult * rngMult).toFixed(1),
      defense: +(pv.weapon.budget.defense * qualityMult * armMult + (sTiers.Armorer || 0) * 1.5).toFixed(1),
      trigger: +(pv.weapon.budget.trigger * qualityMult * wsmMult * runMult * (1 + pv.totalCraftPower * 0.005)).toFixed(1)
    };

    const elementWd = pv.coreElement ? (ELEMENT_ID_TO_WD[pv.coreElement] || "Neutral") : "Neutral";

    const forgedWeapon = {
      uid: `FW-${Date.now()}-${Math.floor(rngFn() * 1000)}`,
      baseWeaponId: pv.weapon.id,
      baseWeaponName: pv.weapon.name,
      name: `${pv.weapon.name}${initialEnhancePlus > 0 ? " +" + initialEnhancePlus : ""} "${traitName}"`,
      forgedByClass: pv.smith.singleWordClassName || pv.smith.primaryType,
      stat: pv.weapon.stat,
      tier: Math.max(pv.weapon.tier, Math.ceil((params.level || 30) / 30)),
      tag: pv.weapon.tag,
      triggerName: pv.weapon.trigger,
      enhancePlus: initialEnhancePlus,
      mainMaterialName: mainMaterial.n,
      mainMaterialHiddenTrait: mainMaterial.hidden_trait || "Dormant",
      mainMaterialHiddenEffect: mainMaterial.hidden_trait_effect || "",
      materialStatBonus: { stat: mainMaterial.primary_stat || pv.weapon.stat, val: mainMaterial.stat_bonus || 1 },
      qualityTierIdx,
      qualityName,
      qualityMult,
      traitName,
      isRareTrait,
      traitBonus,
      coreElement: pv.coreElement || "",
      element: elementWd,
      coreSize: pv.coreSize,
      modeIdx,
      modeName: modeIdx >= 0 ? ELEMENT_MODES[modeIdx] : "Tanpa Inti",
      canFuse: modeIdx === 2,
      fused: false,
      hybridFusion: null,
      budget: scaledBudget
    };

    return {
      success: true,
      forgedWeapon,
      xpGained: 10 + qualityTierIdx * 6
    };
  }

  /**
   * 3. Fitur FUSI INTI KEDUA (Butuh minimal Runesmith Tier 1 untuk Fusi mandiri sesuai CD-3.02 Opsi A+C!)
   */
  function fuseSecondCore({
    forgedWeapon,
    secondElementId,
    level = 30,
    stats = { CON: 30, INT: 30 },
    focusSubStats = {},
    smithConfig = { primaryType: "Runesmith", primaryRank: 3 },
    rngFn = Math.random
  }) {
    if (!forgedWeapon || forgedWeapon.modeIdx !== 2 || forgedWeapon.fused) {
      return { success: false, message: "Senjata ini tidak berada dalam Mode Fusi atau sudah pernah difusi." };
    }
    if (level < 10) {
      return { success: false, message: "Fusi membutuhkan minimal Level Smith 10." };
    }

    const smith = skillEngine ? skillEngine.evaluateSmithMastery(stats, smithConfig) : { tiers: { Runesmith: 3 } };
    const runesmithTier = smith.tiers ? (smith.tiers.Runesmith || 0) : (smithConfig.primaryType === "Runesmith" ? (smithConfig.primaryRank || 1) : 0);
    if (runesmithTier < 1) {
      return {
        success: false,
        message: "Fusi Inti Kedua membutuhkan minimal Runesmith Tier 1 (contoh: ambil Runescribe, Spellblade, Hexblade, Arcarcher, atau Omnismith)."
      };
    }

    const sub = skillEngine ? skillEngine.computeSubStats(stats, focusSubStats).byId : {};
    const quenchBonus = sub.con_quench_stability ? sub.con_quench_stability.value * 0.35 : 0;
    const attuneBonus = sub.int_attunement_craft ? sub.int_attunement_craft.value * 0.35 : 0;
    const runesmithBonus = runesmithTier * 2.5;

    // Risiko gagal Fusi di bengkel-tempa-v2.html adalah 25%; dengan CON Quench Stability & INT Attunement turun hingga minimal 4%!
    const failChancePct = Math.max(4, +(25 - quenchBonus - attuneBonus - runesmithBonus).toFixed(1));

    forgedWeapon.fused = true;
    forgedWeapon.canFuse = false;

    if (rngFn() * 100 < failChancePct) {
      forgedWeapon.fusionMessage = `Fusi gagal (Tegang, risiko ${failChancePct}%): Inti kedua hancur dan slot Fusi tertutup.`;
      return { success: false, failChancePct, forgedWeapon, message: forgedWeapon.fusionMessage };
    }

    if (secondElementId === forgedWeapon.coreElement) {
      // Sama elemen -> Naik Tingkat Inti & lonjakan damage/trigger
      const sizes = ["kecil", "sedang", "besar", "agung"];
      const curIdx = Math.max(0, sizes.indexOf(forgedWeapon.coreSize));
      forgedWeapon.coreSize = sizes[Math.min(sizes.length - 1, curIdx + 1)];
      forgedWeapon.budget.damage = +(forgedWeapon.budget.damage * 1.15).toFixed(1);
      forgedWeapon.budget.trigger = +(forgedWeapon.budget.trigger * 1.15).toFixed(1);
      forgedWeapon.fusionMessage = `Fusi Resonansi Murni berhasil! Inti ${forgedWeapon.coreElement} naik ke tingkat ${forgedWeapon.coreSize.toUpperCase()} (+15% Damage & Trigger).`;
    } else {
      // Beda elemen -> Elemen Hibrida!
      const pairKey = [forgedWeapon.coreElement, secondElementId].sort().join("+");
      const hyb = HYBRID_FUSIONS[pairKey] || {
        name: `Hibrida ${forgedWeapon.coreElement}+${secondElementId}`,
        elements_wd: [ELEMENT_ID_TO_WD[forgedWeapon.coreElement], ELEMENT_ID_TO_WD[secondElementId]],
        desc: "Aliran dua elemen (+15% Skill Damage & +12% Trigger Power)",
        combat_bonus: { skill_dmg_pct: 15, trigger_power_pct: 12 }
      };
      forgedWeapon.hybridFusion = { key: pairKey, ...hyb };
      forgedWeapon.budget.damage = +(forgedWeapon.budget.damage * 1.12).toFixed(1);
      forgedWeapon.budget.trigger = +(forgedWeapon.budget.trigger * 1.20).toFixed(1);
      forgedWeapon.fusionMessage = `Fusi Hibrida berhasil (${forgedWeapon.coreElement} + ${secondElementId}) -> ${hyb.name}: ${hyb.desc}`;
    }

    return {
      success: true,
      failChancePct,
      forgedWeapon,
      message: forgedWeapon.fusionMessage
    };
  }

  /**
   * 4. Uji Senjata Hasil Tempaan & Fusi Langsung di Skill Engine (Simulasi Rotasi SWTOR vs Monster WD)
   */
  function simulateForgedWeaponBattle({
    forgedWeapon,
    level = 30,
    stats,
    focusSubStats = {},
    selectedUtilities = {},
    loadout = [],
    smithConfig = {},
    wdEnemy
  }) {
    if (!skillEngine) throw new Error("skillEngine belum dihubungkan ke forgeEngine.");

    // Tambahkan stat bonus dari bahan utama senjata
    const boostedStats = { ...stats };
    if (forgedWeapon.materialStatBonus) {
      const sKey = forgedWeapon.materialStatBonus.stat;
      if (boostedStats[sKey] !== undefined) {
        boostedStats[sKey] += forgedWeapon.materialStatBonus.val;
      }
    }

    // Jika senjata punya Elemen Hibrida (misal api+es = Fire & Ice, atau cahaya+gelap = Gerhana),
    // cek apakah salah satu dari 2 elemen hibrida tersebut cocok dengan kelemahan (weak) musuh WD!
    let effectiveWeaponElement = forgedWeapon.element || "Neutral";
    if (forgedWeapon.hybridFusion) {
      const enemyWeak = wdEnemy?.weak || "Fire";
      if (forgedWeapon.hybridFusion.combat_bonus?.auto_match_weakness || forgedWeapon.hybridFusion.elements_wd.includes(enemyWeak)) {
        effectiveWeaponElement = enemyWeak;
      }
    }

    const baseSim = skillEngine.simulateBattle({
      level,
      stats: boostedStats,
      focusSubStats,
      selectedUtilities,
      loadout,
      smithConfig,
      weapon: {
        stat: forgedWeapon.stat,
        tier: forgedWeapon.tier,
        tag: forgedWeapon.tag,
        element: effectiveWeaponElement,
        budget: forgedWeapon.budget
      },
      wdEnemy
    });

    // Aplikasikan bonus dari Trait Sinergi/Langka & Elemen Hibrida Fusi
    const tBonus = forgedWeapon.traitBonus || {};
    const hBonus = forgedWeapon.hybridFusion?.combat_bonus || {};
    const extraDmgMult = 1 + ((tBonus.skill_dmg_pct || 0) + (tBonus.elem_dmg_pct || 0) * 0.5 + (hBonus.skill_dmg_pct || 0)) / 100;
    const extraDefMult = 1 - Math.min(0.35, ((tBonus.mitigate_bonus_pct || 0) + (hBonus.dmg_reduction_pct || 0) + (hBonus.enemy_acc_debuff_pct || 0)) / 100);

    const finalDps = +(baseSim.metrics.dps * extraDmgMult).toFixed(2);
    const finalDtps = +(baseSim.metrics.dtps * extraDefMult).toFixed(2);
    const finalTtd = finalDtps > 0 ? +(baseSim.playerSummary.maxPlayerHp / finalDtps).toFixed(1) : 9999;
    const finalKillsPerBar = +((finalDps * finalTtd) / baseSim.monsterSummary.hp).toFixed(2);

    return {
      forgedWeaponSummary: {
        name: forgedWeapon.name,
        quality: forgedWeapon.qualityName,
        stat: forgedWeapon.stat,
        tag: forgedWeapon.tag,
        trigger: forgedWeapon.triggerName,
        mode: forgedWeapon.modeName,
        element: effectiveWeaponElement,
        hybridFusion: forgedWeapon.hybridFusion ? forgedWeapon.hybridFusion.name : null,
        mainMaterial: `${forgedWeapon.mainMaterialName} (${forgedWeapon.mainMaterialHiddenTrait})`
      },
      playerSummary: baseSim.playerSummary,
      monsterSummary: baseSim.monsterSummary,
      metrics: {
        ...baseSim.metrics,
        dps: finalDps,
        dtps: finalDtps,
        timeToDieSec: finalTtd,
        killsPerHpBar: finalKillsPerBar
      },
      combatLogSample: baseSim.combatLogSample
    };
  }

  return {
    previewForge,
    executeForge,
    fuseSecondCore,
    simulateForgedWeaponBattle
  };
}
