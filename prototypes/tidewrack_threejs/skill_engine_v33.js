/* Auto-generated offline browser bundle from engines/skill_engine/ (CD v3.3) */
(function (global) {
  'use strict';
  const SKILL_DATA_V33 = {"version":"3.3.0","master_cd_version":"v3.3","description":"CD-1.02b (60 Sub-Stats), CD-2.01 (5 Pohon Skill Tipe Smith: SWTOR Ability Tree + Cooldown/GCD Anti-Spam + RF Classic Lv.1-GM), CD-3.02b (29 Kartu Destiny Kingdoms of Amalur + Jalur Ganda), dan CD-4 (48 Active Weapon Skills [W])","stat_caps_by_tier":[30,60,90,120,150],"focus_substat_multiplier":1.25,"max_focus_per_stat":2,"gcd_sec":1.3,"macro_capacity_brackets":[{"min_effective_int":1,"max_effective_int":29,"slots":3},{"min_effective_int":30,"max_effective_int":74,"slots":4},{"min_effective_int":75,"max_effective_int":119,"slots":5},{"min_effective_int":120,"max_effective_int":999,"slots":6}],"skill_mastery_levels":[{"level":1,"label":"Lv.1","xp_req":0,"effectiveness_bonus_pct":0,"cdr_pct":0,"unlocks":["active_skill"]},{"level":2,"label":"Lv.2","xp_req":20,"effectiveness_bonus_pct":6,"cdr_pct":0,"unlocks":[]},{"level":3,"label":"Lv.3","xp_req":55,"effectiveness_bonus_pct":12,"cdr_pct":0,"unlocks":["core_passive"]},{"level":4,"label":"Lv.4","xp_req":110,"effectiveness_bonus_pct":18,"cdr_pct":0,"unlocks":[]},{"level":5,"label":"Lv.5","xp_req":190,"effectiveness_bonus_pct":24,"cdr_pct":0,"unlocks":["morph_choice"]},{"level":6,"label":"Lv.6","xp_req":300,"effectiveness_bonus_pct":30,"cdr_pct":5,"unlocks":[]},{"level":7,"label":"GM","xp_req":450,"effectiveness_bonus_pct":40,"cdr_pct":10,"unlocks":["gm_morph_peak"]}],"destiny_switch_rules":{"mode":"dual_path","trial_guild":"Forgemasters' Guild","trial_options":["Tempa 1 senjata mutu Istimewa+ sesuai mazhab Kartu Destiny tujuan","Kalahkan 1 monster Reguler Khusus atau Mini Boss di Area aktif"],"gold_cost_formula":"500 * level * tier","gold_per_level_tier_br":500,"hostile_syndicate_surcharge_pct":50,"hostile_broker":"Shadow Syndicate","note":"Angka DEMO — siap dituning di simulator S&D WD; ganti distribusi 5 Poin Tier Smith tetap memakai un-fuse (CD-2.03)."},"smith_types":{"Weaponsmith":{"id":"Weaponsmith","primary_bonus_per_rank_pct":6,"secondary_bonus_per_rank_pct":3,"rank_prefixes":["Raw","Tempered","Honed","Grand","Paragon"],"skill_synergy":{"melee_active_dmg_pct_per_rank":3,"weapon_trigger_power_pct_per_rank":4}},"Armorer":{"id":"Armorer","primary_bonus_per_rank_pct":6,"secondary_bonus_per_rank_pct":3,"rank_prefixes":["Raw","Tempered","Honed","Grand","Paragon"],"skill_synergy":{"defensive_active_power_pct_per_rank":4,"mitigate_bonus_pct_per_rank":3}},"Reforger":{"id":"Reforger","primary_bonus_per_rank_pct":6,"secondary_bonus_per_rank_pct":3,"rank_prefixes":["Raw","Tempered","Honed","Grand","Paragon"],"skill_synergy":{"cooldown_recovery_pct_per_rank":2.5,"enhance_damage_scale_pct_per_rank":3}},"Runesmith":{"id":"Runesmith","primary_bonus_per_rank_pct":6,"secondary_bonus_per_rank_pct":3,"rank_prefixes":["Raw","Tempered","Honed","Grand","Paragon"],"skill_synergy":{"elemental_active_dmg_pct_per_rank":4,"cross_stat_mod_bonus_pct_per_rank":4}},"Rangesmith":{"id":"Rangesmith","primary_bonus_per_rank_pct":6,"secondary_bonus_per_rank_pct":3,"rank_prefixes":["Raw","Tempered","Honed","Grand","Paragon"],"skill_synergy":{"ranged_active_dmg_pct_per_rank":4,"ranged_accuracy_dodge_pct_per_rank":2}}},"sub_stats":{"STR":[{"id":"str_raw_might","index":1,"name":"Raw Might","category":"battle","unit":"flat_dmg","rate_per_point":0.5,"desc":"Bonus damage fisik dasar (+0.5 per STR)"},{"id":"str_heavy_impact","index":2,"name":"Heavy Impact","category":"battle","unit":"pct","rate_per_point":0.2,"desc":"Daya dobrak / pengurang efisiensi blok lawan"},{"id":"str_armor_crush","index":3,"name":"Armor Crush","category":"battle","unit":"pct","rate_per_point":0.2,"desc":"Penetrasi / pengabaian Armor lawan"},{"id":"str_cleave_force","index":4,"name":"Cleave Force","category":"battle","unit":"pct","rate_per_point":0.25,"desc":"Damage percikan / area serangan berat"},{"id":"str_weapon_weight","index":5,"name":"Weapon Weight","category":"battle","unit":"pct","rate_per_point":0.2,"desc":"Reduksi penalti ayunan senjata berat"},{"id":"str_brawn_guard","index":6,"name":"Brawn Guard","category":"battle","unit":"pct","rate_per_point":0.1,"desc":"Ketahanan fisik dasar dari otot"},{"id":"str_hammer_strike","index":7,"name":"Hammer Strike","category":"profession","unit":"pct","rate_per_point":0.25,"desc":"Efisiensi pukulan tempa dasar"},{"id":"str_enhance_power","index":8,"name":"Enhance Power (+N)","category":"profession","unit":"pct","rate_per_point":0.2,"desc":"Bonus peluang sukses penguatan +N"},{"id":"str_alloy_shaping","index":9,"name":"Alloy Shaping","category":"profession","unit":"pct","rate_per_point":0.2,"desc":"Efisiensi tempa logam keras tier tinggi"},{"id":"str_carry_load","index":10,"name":"Carry Load","category":"profession","unit":"pct","rate_per_point":0.3,"desc":"Kapasitas angkut bijih & perlengkapan"}],"DEX":[{"id":"dex_accuracy","index":1,"name":"Accuracy","category":"battle","unit":"pct","rate_per_point":0.15,"hard_cap":20,"desc":"Bonus peluang serangan mengenai sasaran (cap +20%)"},{"id":"dex_attack_speed","index":2,"name":"Attack Speed","category":"battle","unit":"pct","rate_per_point":0.2,"desc":"Bonus frekuensi serangan per detik"},{"id":"dex_evasion","index":3,"name":"Evasion (Dodge)","category":"battle","unit":"pct","rate_per_point":0.15,"hard_cap":20,"desc":"Peluang menghindar serangan (cap +20%)"},{"id":"dex_parry_reflex","index":4,"name":"Parry Reflex","category":"battle","unit":"pct","rate_per_point":0.15,"hard_cap":20,"desc":"Peluang menangkis serangan jarak dekat (cap +20%)"},{"id":"dex_armor_mobility","index":5,"name":"Armor Mobility (AC)","category":"battle","unit":"pct","rate_per_point":0.15,"desc":"Efisiensi AC pada zirah ringan/sedang"},{"id":"dex_ranged_draw","index":6,"name":"Ranged Draw","category":"battle","unit":"pct","rate_per_point":0.25,"desc":"Stabilitas & damage senjata bertag Jauh"},{"id":"dex_forge_speed","index":7,"name":"Forge Speed","category":"profession","unit":"pct","rate_per_point":0.25,"desc":"Kecepatan penyelesaian tempa"},{"id":"dex_fine_engraving","index":8,"name":"Fine Engraving","category":"profession","unit":"pct","rate_per_point":0.2,"desc":"Kualitas presisi bilah & akurasi tempa"},{"id":"dex_mechanism_craft","index":9,"name":"Mechanism Craft","category":"profession","unit":"pct","rate_per_point":0.25,"desc":"Kualitas rakitan pemicu & senjata Rangesmith"},{"id":"dex_quick_salvage","index":10,"name":"Quick Salvage","category":"profession","unit":"pct","rate_per_point":0.2,"desc":"Efisiensi daur ulang peralatan"}],"CON":[{"id":"con_max_vitality","index":1,"name":"Max Vitality (HP)","category":"battle","unit":"flat_hp","rate_per_point":5,"desc":"Bonus HP maksimum (+5 per CON)"},{"id":"con_mitigate","index":2,"name":"Mitigate","category":"battle","unit":"flat_mitigate","rate_per_point":0.5,"desc":"Pengurang damage mentah (+1 per 2 CON, cap 50% mentah)"},{"id":"con_thick_hide","index":3,"name":"Thick Hide (Armor)","category":"battle","unit":"pct","rate_per_point":0.15,"desc":"Pengali pertahanan zirah berat & ketahanan fisik"},{"id":"con_battle_stamina","index":4,"name":"Battle Stamina","category":"battle","unit":"flat_stamina","rate_per_point":5,"desc":"Kapasitas stamina bertarung (+5 per CON)"},{"id":"con_poise","index":5,"name":"Poise (Tenacity)","category":"battle","unit":"pct","rate_per_point":0.2,"desc":"Ketahanan terhadap stagger & interupsi"},{"id":"con_curse_resist","index":6,"name":"Curse & Blight Resist","category":"battle","unit":"pct","rate_per_point":0.2,"desc":"Ketahanan terhadap kutukan Gate & racun"},{"id":"con_forge_stamina","index":7,"name":"Forge Stamina","category":"profession","unit":"pct","rate_per_point":0.25,"desc":"Daya tahan sesi idle Smith"},{"id":"con_material_conservation","index":8,"name":"Material Conservation","category":"profession","unit":"pct","rate_per_point":0.2,"desc":"Peluang hemat bahan dasar saat menempa"},{"id":"con_heat_tolerance","index":9,"name":"Heat Tolerance","category":"profession","unit":"pct","rate_per_point":0.2,"desc":"Stabilitas suhu dapur tempa ekstrem"},{"id":"con_quench_stability","index":10,"name":"Quench Stability","category":"profession","unit":"pct","rate_per_point":0.2,"desc":"Pencegahan retak saat pendinginan/Reforger"}],"INT":[{"id":"int_elemental_potency","index":1,"name":"Elemental Potency","category":"battle","unit":"pct","rate_per_point":0.25,"desc":"Bonus damage 6 elemen utama"},{"id":"int_weakness_exploit","index":2,"name":"Weakness Exploit","category":"battle","unit":"pct","rate_per_point":0.2,"desc":"Tambahan bonus saat mengenai elemen weak musuh (di atas +25% dasar)"},{"id":"int_trigger_mastery","index":3,"name":"Trigger Mastery","category":"battle","unit":"pct","rate_per_point":0.3,"desc":"Pengali efektivitas 36 Weapon Trigger"},{"id":"int_elemental_barrier","index":4,"name":"Elemental Barrier","category":"battle","unit":"pct","rate_per_point":0.15,"desc":"Resistensi terhadap serangan berelemen"},{"id":"int_arcane_accuracy","index":5,"name":"Spell/Arcane Accuracy","category":"battle","unit":"pct","rate_per_point":0.15,"desc":"Presisi serangan energi & skill aktif berelemen"},{"id":"int_macro_capacity","index":6,"name":"Macro Capacity","category":"battle","unit":"slot_score","rate_per_point":1,"desc":"Skor kapasitas slot Active Macro Bar (3 s.d. 6 slot)"},{"id":"int_smith_tools","index":7,"name":"Smith's Tools Mastery","category":"profession","unit":"pct","rate_per_point":0.25,"desc":"Bonus peluang rarity tinggi saat menempa"},{"id":"int_rune_slotting","index":8,"name":"Rune Slotting","category":"profession","unit":"pct","rate_per_point":0.25,"desc":"Efektivitas & resonansi pemasangan Rune"},{"id":"int_safe_extraction","index":9,"name":"Safe Extraction","category":"profession","unit":"pct","rate_per_point":0.2,"desc":"Pengurang peluang retak cabut Rune"},{"id":"int_attunement_craft","index":10,"name":"Attunement Craft","category":"profession","unit":"pct","rate_per_point":0.25,"desc":"Keselarasan elemen-bahan (WD-4.06)"}],"WIS":[{"id":"wis_crit_chance","index":1,"name":"Critical Chance","category":"battle","unit":"pct","rate_per_point":0.15,"hard_cap":20,"desc":"Peluang serangan kritis (cap +20%)"},{"id":"wis_crit_severity","index":2,"name":"Critical Severity","category":"battle","unit":"pct","rate_per_point":0.25,"desc":"Tambahan damage serangan kritis (di atas x2.0 dasar)"},{"id":"wis_enemy_sense","index":3,"name":"Enemy Sense","category":"battle","unit":"pct","rate_per_point":0.2,"desc":"Pengabaian dodge lawan & deteksi titik lemah"},{"id":"wis_foresight","index":4,"name":"Foresight","category":"battle","unit":"pct","rate_per_point":0.15,"desc":"Reduksi peluang terkena serangan kritis lawan"},{"id":"wis_tactical_rhythm","index":5,"name":"Tactical Rhythm","category":"battle","unit":"pct","rate_per_point":0.15,"desc":"Pengurang konsumsi stamina & percepatan cooldown skill"},{"id":"wis_counter_window","index":6,"name":"Counter Window","category":"battle","unit":"pct","rate_per_point":0.2,"desc":"Bonus damage serangan balasan setelah dodge/parry"},{"id":"wis_rare_drop","index":7,"name":"Rare Drop Hunting","category":"profession","unit":"pct","rate_per_point":0.25,"desc":"Bonus peluang perolehan material langka"},{"id":"wis_market_appraisal","index":8,"name":"Market Appraisal","category":"profession","unit":"pct","rate_per_point":0.25,"desc":"Ketepatan membaca tren permintaan pasar WD"},{"id":"wis_trophy_curation","index":9,"name":"Trophy Curation","category":"profession","unit":"pct","rate_per_point":0.2,"desc":"Bonus prestise Galeri Trofi Signature (WD-5.10)"},{"id":"wis_material_purity","index":10,"name":"Material Purity Sense","category":"profession","unit":"pct","rate_per_point":0.2,"desc":"Deteksi kemurnian bijih & potensi Resonance"}],"CHA":[{"id":"cha_intimidate","index":1,"name":"Intimidate (Dread)","category":"battle","unit":"pct","rate_per_point":0.15,"desc":"Debuff pengurang damage & akurasi musuh"},{"id":"cha_break_morale","index":2,"name":"Break Morale","category":"battle","unit":"pct","rate_per_point":0.2,"desc":"Debuff pengurang pertahanan/armor musuh"},{"id":"cha_rally_ally","index":3,"name":"Rally Ally","category":"battle","unit":"pct","rate_per_point":0.25,"desc":"Buff damage & kecepatan untuk diri/companion murid"},{"id":"cha_protective_command","index":4,"name":"Protective Command","category":"battle","unit":"pct","rate_per_point":0.15,"desc":"Buff reduksi damage untuk diri/companion murid"},{"id":"cha_battlefield_presence","index":5,"name":"Battlefield Presence","category":"battle","unit":"pct","rate_per_point":0.2,"desc":"Kendali ritme tempur & durasi efek buff/debuff"},{"id":"cha_conscience_align","index":6,"name":"Conscience Alignment","category":"battle","unit":"pct","rate_per_point":0.25,"desc":"Bonus damage dari keselarasan bar moral Conscience senjata"},{"id":"cha_trade_bargaining","index":7,"name":"Trade Bargaining","category":"profession","unit":"pct","rate_per_point":0.25,"desc":"Bonus harga jual & diskon beli bahan"},{"id":"cha_shop_reputation","index":8,"name":"Shop Reputation","category":"profession","unit":"pct","rate_per_point":0.25,"desc":"Laju kenaikan Reputasi Toko"},{"id":"cha_apprentice_lead","index":9,"name":"Apprentice Leadership","category":"profession","unit":"pct","rate_per_point":0.25,"desc":"Bonus laju belajar & stabilitas loyalitas 5 murid"},{"id":"cha_faction_diplomacy","index":10,"name":"Faction Diplomacy","category":"profession","unit":"pct","rate_per_point":0.2,"desc":"Pengaruh negosiasi kontrak & relasi faksi WD"}]},"smith_skill_trees":{"Weaponsmith":{"smith_class":"Weaponsmith","class_progression":["Bladesmith","Edgewright","Warmonger","Vanquisher","Archblade"],"resource":{"id":"forge_heat","name":"Forge Heat","max_stacks":5,"per_stack":{"armor_pen_pct":3,"trigger_power_pct":4}},"theme":"Melee Burst, Armor Sunder, Bleed & Weapon Trigger Mastery","tiers":[{"tier":1,"rank_label":"Basic","active_skill":{"id":"wpn_t1_a","name":"Tempered Cleave","role":"Opener/Builder","cooldown_sec":4.5,"base_multiplier":1.35,"element":"Neutral","weapon_tag":"Dekat","grants_resource":{"id":"forge_heat","amount":2},"desc":"Tebasan busur depan yang menghasilkan +2 Forge Heat."},"core_passive":{"id":"wpn_t1_p","unlock_skill_level":3,"name":"Heated Edge","effect":{"dmg_pct":6,"auto_resource_chance_pct":25,"armor_pen_pct":3},"desc":"Auto-attack melee berpeluang 25% menambah +1 Forge Heat."},"morph_choices":[{"id":"wpn_t1_m1","branch":"Offense","name":"Wide Arc","effect":{"skill_dmg_pct":12,"bleed_dmg_pct":10},"desc":"Area tebasan membesar & tambah Bleed 4d."},{"id":"wpn_t1_m2","branch":"Defense/Companion","name":"Twin Rhythm","effect":{"companion_assist_pct":20,"dmg_reduction_pct":4},"desc":"Companion murid ikut memukul target (+20% dmg)."},{"id":"wpn_t1_m3","branch":"Forge Synergy","name":"Sharp Alloy","effect":{"skill_dmg_pct":15,"requires_quality":"Bagus+"},"desc":"+15% damage bila senjata mutu Bagus+."}]},{"tier":2,"rank_label":"Expert","active_skill":{"id":"wpn_t2_a","name":"Anvil's Fury","role":"Class Buff (RF)","cooldown_sec":28,"duration_sec":16,"base_multiplier":0,"element":"Neutral","self_buff":{"attack_speed_pct":15,"dmg_pct":12,"trigger_power_pct":15,"duration_sec":16},"desc":"Class Buff RF: +15% Attack Speed, +12% Raw Dmg, +15% Trigger Power selama 16d."},"core_passive":{"id":"wpn_t2_p","unlock_skill_level":3,"name":"Relentless Rhythm","effect":{"attack_speed_pct":6,"preserve_resource_in_buff":true},"desc":"Selama Anvil's Fury aktif, tumpukan Forge Heat tidak luntur."},"morph_choices":[{"id":"wpn_t2_m1","branch":"Offense","name":"Bloodlust Heat","effect":{"buff_extend_on_crit_sec":1.5,"crit_dmg_pct":12},"desc":"Setiap Crit memperpanjang durasi buff +1,5d."},{"id":"wpn_t2_m2","branch":"Defense/Companion","name":"Rallying Clang","effect":{"companion_aspd_pct":8,"dmg_reduction_pct":5},"desc":"Setengah bonus Attack Speed ikut diterima Companion."},{"id":"wpn_t2_m3","branch":"Forge Synergy","name":"Masterwork Resonance","effect":{"dmg_pct_per_enhance":2,"skill_dmg_pct":8},"desc":"Tiap tingkat +N senjata menambah +2% damage selama buff."}]},{"tier":3,"rank_label":"Elite","active_skill":{"id":"wpn_t3_a","name":"Pommel Sunder","role":"Defensive/Interrupt","cooldown_sec":13,"base_multiplier":1.25,"element":"Neutral","interrupts_cast":true,"stun_sec":2,"debuff":{"enemy_armor_reduction_pct":15,"duration_sec":5},"desc":"Hantaman gagang pembatal Cast Bar + Stun 2d + -15% Armor target."},"core_passive":{"id":"wpn_t3_p","unlock_skill_level":3,"name":"Iron Grip","effect":{"armor_pen_pct":8,"interrupt_resource_gain":3,"weapon_skill_cdr_on_interrupt_sec":2},"desc":"Interrupt sukses mengisi +3 Forge Heat & pangkas 2d CD Weapon Skill."},"morph_choices":[{"id":"wpn_t3_m1","branch":"Offense","name":"Shattering Blow","effect":{"skill_dmg_pct":18,"armor_pen_pct":10},"desc":"Pasca-Interrupt target terima +25% damage fisik 5d."},{"id":"wpn_t3_m2","branch":"Defense/Companion","name":"Guarding Parry","effect":{"parry_pct":12,"dmg_reduction_pct":6},"desc":"Memberi +20% Parry selama 4d setelah cast."},{"id":"wpn_t3_m3","branch":"Forge Synergy","name":"Heavy Pommel","effect":{"skill_dmg_pct":22,"heavy_weapon_bonus":true},"desc":"Bonus damage +30% jika memakai senjata STR/CON berat."}]},{"tier":4,"rank_label":"Master","active_skill":{"id":"wpn_t4_a","name":"Molten Sever","role":"Core Combo/Execute","cooldown_sec":9,"base_multiplier":1.85,"element":"Fire","consumes_resource":{"id":"forge_heat","per_stack_mult":0.22},"execute_threshold_hp_pct":35,"execute_bonus_pct":35,"desc":"Konsumsi seluruh Forge Heat untuk tebasan berat (+35% dmg bila HP musuh < 35%)."},"core_passive":{"id":"wpn_t4_p","unlock_skill_level":3,"name":"Executioner's Temper","effect":{"dmg_pct":10,"crit_dmg_pct":15,"stamina_on_kill":15},"desc":"Mengalahkan musuh dengan Molten Sever memulihkan 15 Stamina & +2 Forge Heat."},"morph_choices":[{"id":"wpn_t4_m1","branch":"Offense","name":"Searing Rupture","effect":{"skill_dmg_pct":20,"elemental_dmg_pct":12},"desc":"Meninggalkan luka bakar Fire setara 40% damage ledakan."},{"id":"wpn_t4_m2","branch":"Defense/Companion","name":"Crimson Drain","effect":{"heal_on_cast_pct":8,"dmg_reduction_pct":5},"desc":"15% damage Molten Sever memulihkan HP pemain."},{"id":"wpn_t4_m3","branch":"Forge Synergy","name":"Trigger Overdrive","effect":{"trigger_power_pct":25,"free_weapon_trigger_at_stacks":4},"desc":"Jika konsumsi >= 4 Forge Heat, otomatis picu Weapon Trigger gratis!"}]},{"tier":5,"rank_label":"Apex","pure_only":true,"active_skill":{"id":"wpn_t5_a","name":"Cataclysmic Anvil Fall","role":"Apex Ultimate","cooldown_sec":30,"base_multiplier":3.15,"element":"Neutral","forces_weapon_trigger":true,"debuff":{"enemy_armor_reduction_pct":30,"duration_sec":6},"desc":"3 hantaman beruntun skala raksasa + AoE Armor Sunder -30% + paksa Weapon Trigger."},"core_passive":{"id":"wpn_t5_p","unlock_skill_level":3,"name":"Archblade Supremacy","effect":{"resource_max_bonus":2,"trigger_crit_chance_pct":25,"dmg_pct":12},"desc":"Cap Forge Heat naik jadi 7 stack; Weapon Trigger mendapat +25% Crit."},"morph_choices":[{"id":"wpn_t5_m1","branch":"Offense","name":"Worldbreaker","effect":{"skill_dmg_pct":28,"armor_pen_pct":15},"desc":"Hantaman ke-3 menjadi ledakan Earth/Fire AoE masif."},{"id":"wpn_t5_m2","branch":"Defense/Companion","name":"Warlord's Banner","effect":{"companion_assist_pct":35,"dmg_reduction_pct":12},"desc":"Seluruh tim kebal CC & +25% damage selama 6d."},{"id":"wpn_t5_m3","branch":"Forge Synergy","name":"Paragon Forge","effect":{"skill_dmg_pct":24,"resonance_scale_pct":12},"desc":"Damage ulti naik +12% per tahap Resonance / kualitas Mahakarya."}]}]},"Armorer":{"smith_class":"Armorer","class_progression":["Platesmith","Shieldwright","Bulwark","Juggernaut","Aegisborn"],"resource":{"id":"bastion_guard","name":"Bastion Guard","max_stacks":5,"per_stack":{"dmg_reduction_pct":3,"thorns_pct":4}},"theme":"Maximum Vitality, Mitigate, Guard Stacks, Thorns Counter & AoE Interrupt","tiers":[{"tier":1,"rank_label":"Basic","active_skill":{"id":"arm_t1_a","name":"Shieldbreaker Bash","role":"Opener/Builder","cooldown_sec":5,"base_multiplier":1.25,"element":"Neutral","scales_with_con_ac":true,"grants_resource":{"id":"bastion_guard","amount":2},"desc":"Hantaman defensif berskala CON + AC, +2 Bastion Guard, menarik Aggro."},"core_passive":{"id":"arm_t1_p","unlock_skill_level":3,"name":"Tempered Plate","effect":{"max_hp_pct":8,"dmg_reduction_pct":4},"desc":"Setiap kali Mitigate menahan serangan, +1 Bastion Guard (CD internal 1,5d)."},"morph_choices":[{"id":"arm_t1_m1","branch":"Offense","name":"Spiked Rim","effect":{"skill_dmg_pct":15,"thorns_pct":12},"desc":"Tambah Thorns damage setara 25% nilai AC armor."},{"id":"arm_t1_m2","branch":"Defense/Companion","name":"Protective Taunt","effect":{"dmg_reduction_pct":6,"companion_dr_pct":25},"desc":"Mengurangi damage musuh ke Companion sebesar 25% selama 5d."},{"id":"arm_t1_m3","branch":"Forge Synergy","name":"Reinforced Buckler","effect":{"skill_dmg_pct":20,"dmg_reduction_pct":5},"desc":"Jika memakai Perisai (Slot 25% AC), damage & stun naik +30%."}]},{"tier":2,"rank_label":"Expert","active_skill":{"id":"arm_t2_a","name":"Ironclad Stance","role":"Class Buff (RF)","cooldown_sec":28,"duration_sec":18,"base_multiplier":0,"element":"Neutral","self_buff":{"dmg_reduction_pct":15,"mitigate_bonus_pct":15,"poise_pct":20,"duration_sec":18},"desc":"Class Buff RF: +15% Mitigate, +15% Armor, +20% Poise selama 18d."},"core_passive":{"id":"arm_t2_p","unlock_skill_level":3,"name":"Unmovable Mass","effect":{"max_hp_pct":8,"remove_heavy_armor_speed_penalty":true},"desc":"Saat Ironclad Stance aktif, penalti kecepatan Armor Berat (-5%) dihapus total."},"morph_choices":[{"id":"arm_t2_m1","branch":"Offense","name":"Molten Armor","effect":{"thorns_pct":18,"elemental_dmg_pct":10},"desc":"Penyerang jarak dekat terkena pantulan damage Fire."},{"id":"arm_t2_m2","branch":"Defense/Companion","name":"Shared Aegis","effect":{"dmg_reduction_pct":6,"companion_dr_pct":20},"desc":"40% nilai Mitigate pemain ikut melindungi Companion."},{"id":"arm_t2_m3","branch":"Forge Synergy","name":"Layered Plating","effect":{"max_hp_pct":16,"dmg_reduction_pct":4},"desc":"Bonus +4% HP maks untuk setiap slot Armor Berat (maks +20%)."}]},{"tier":3,"rank_label":"Elite","active_skill":{"id":"arm_t3_a","name":"Bulwark Slam","role":"Defensive/Interrupt","cooldown_sec":12,"base_multiplier":1.35,"element":"Earth","interrupts_cast":true,"self_buff":{"dmg_reduction_pct":12,"barrier_hp_pct":12,"duration_sec":5},"desc":"Gelombang hentakan perisai AoE, batalkan Cast Bar + Barrier 12% HP."},"core_passive":{"id":"arm_t3_p","unlock_skill_level":3,"name":"Counter Fortress","effect":{"dmg_reduction_pct":6,"heal_on_interrupt_pct":8},"desc":"Interrupt sukses langsung mengisi penuh 5 Bastion Guard & memulihkan 8% HP."},"morph_choices":[{"id":"arm_t3_m1","branch":"Offense","name":"Tremor Shock","effect":{"skill_dmg_pct":18,"enemy_dmg_debuff_pct":10},"desc":"Retakan Earth memperlambat gerak & serang musuh -25%."},{"id":"arm_t3_m2","branch":"Defense/Companion","name":"Sanctuary Wall","effect":{"heal_on_cast_pct":6,"dmg_reduction_pct":6},"desc":"Barrier juga diberikan kepada Companion murid."},{"id":"arm_t3_m3","branch":"Forge Synergy","name":"Attuned Plate","effect":{"elem_resist_pct":15,"dmg_reduction_pct":4},"desc":"+15% resistensi terhadap elemen musuh yang di-interrupt."}]},{"tier":4,"rank_label":"Master","active_skill":{"id":"arm_t4_a","name":"Retribution Nova","role":"Core Combo/Execute","cooldown_sec":10,"base_multiplier":1.75,"element":"Earth","consumes_resource":{"id":"bastion_guard","per_stack_mult":0.24},"heal_per_stack_pct":3,"desc":"Ledakkan semua Bastion Guard menjadi gelombang kejut AoE + pulih 3% HP/stack."},"core_passive":{"id":"arm_t4_p","unlock_skill_level":3,"name":"Stoic Recovery","effect":{"max_hp_pct":10,"dmg_pct":8},"desc":"Selama Retribution Nova sedang cooldown, regenerasi Stamina naik +25%."},"morph_choices":[{"id":"arm_t4_m1","branch":"Offense","name":"Vengeance Spike","effect":{"skill_dmg_pct":25,"armor_pen_pct":10},"desc":"Damage ledakan ditambah 35% dari total damage tertahan 6d terakhir."},{"id":"arm_t4_m2","branch":"Defense/Companion","name":"Immortal Stand","effect":{"heal_on_cast_pct":10,"dmg_reduction_pct":8},"desc":"Memberi Barrier setara 2x jumlah HP yang dipulihkan."},{"id":"arm_t4_m3","branch":"Forge Synergy","name":"Tempered Shrapnel","effect":{"skill_dmg_pct":20,"trigger_power_pct":15},"desc":"Bonus damage +20% bila rata-rata +N pada 5 slot armor >= +3."}]},{"tier":5,"rank_label":"Apex","pure_only":true,"active_skill":{"id":"arm_t5_a","name":"Aegis of Emberhold","role":"Apex Ultimate","cooldown_sec":32,"base_multiplier":2.75,"element":"Light","self_buff":{"dmg_reduction_pct":28,"duration_sec":6},"desc":"Selama 6d kebal Stagger, serap 60% damage masuk ke Barrier lalu ledakkan balik 150%!"},"core_passive":{"id":"arm_t5_p","unlock_skill_level":3,"name":"Aegisborn Bastion","effect":{"mitigate_cap_pct":60,"max_hp_pct":14,"cheat_death_cd_sec":90},"desc":"Cap Mitigate naik ke 60%; sekali per 90d mencegah kematian (sisa 15% HP)."},"morph_choices":[{"id":"arm_t5_m1","branch":"Offense","name":"Judgment Reflect","effect":{"skill_dmg_pct":30,"armor_pen_pct":12},"desc":"Ledakan akhir otomatis memicu Stun 2,5d AoE."},{"id":"arm_t5_m2","branch":"Defense/Companion","name":"Citadel Oath","effect":{"dmg_reduction_pct":12,"companion_dr_pct":50},"desc":"Companion tidak bisa jatuh di bawah 1 HP selama 6d durasi ulti."},{"id":"arm_t5_m3","branch":"Forge Synergy","name":"Living Mithril","effect":{"dmg_reduction_pct":10,"max_hp_pct":12},"desc":"Seluruh 5 slot armor menggandakan bonus kelas bahannya selama 10d."}]}]},"Rangesmith":{"smith_class":"Rangesmith","class_progression":["Bowyer","Fletcher","Deadeye","Ballistary","Horizoner"],"resource":{"id":"hunters_mark","name":"Hunter's Mark","max_stacks":5,"per_stack":{"enemy_dodge_reduction_pct":4,"crit_dmg_pct":4}},"theme":"Ranged Precision, Kiting, Dodge Reflex, Mark & Ricochet Volley","tiers":[{"tier":1,"rank_label":"Basic","active_skill":{"id":"rng_t1_a","name":"Pinning Shot","role":"Opener/Builder","cooldown_sec":4,"base_multiplier":1.3,"element":"Neutral","weapon_tag":"Jauh","grants_resource":{"id":"hunters_mark","amount":2},"desc":"Tembakan presisi jarak jauh (+2 Hunter's Mark), memperlambat gerak musuh -25% 3d."},"core_passive":{"id":"rng_t1_p","unlock_skill_level":3,"name":"Keen Draw","effect":{"accuracy_pct":8,"crit_chance_pct":4},"desc":"Serangan jarak >= 4m mendapat +8% Accuracy & +1 Hunter's Mark pada Crit."},"morph_choices":[{"id":"rng_t1_m1","branch":"Offense","name":"Barbed Tip","effect":{"skill_dmg_pct":14,"bleed_dmg_pct":12},"desc":"Memicu Bleed berlipat sesuai jumlah stack Hunter's Mark."},{"id":"rng_t1_m2","branch":"Defense/Companion","name":"Flank Signal","effect":{"companion_assist_pct":22,"dodge_pct":4},"desc":"Companion mendapat +25% gerak & assist menuju target bertanda."},{"id":"rng_t1_m3","branch":"Forge Synergy","name":"Finely Machined","effect":{"skill_dmg_pct":15,"attack_speed_pct":8},"desc":"+15% kecepatan proyektil & damage dengan Mechanism Craft."}]},{"tier":2,"rank_label":"Expert","active_skill":{"id":"rng_t2_a","name":"Eagle Sight","role":"Class Buff (RF)","cooldown_sec":26,"duration_sec":16,"base_multiplier":0,"element":"Neutral","self_buff":{"accuracy_pct":12,"dodge_pct":10,"crit_chance_pct":8,"duration_sec":16},"desc":"Class Buff RF: +12% Accuracy, +10% Dodge, +15% Jarak Tembak, +8% Crit Chance."},"core_passive":{"id":"rng_t2_p","unlock_skill_level":3,"name":"Windstep","effect":{"dodge_pct":6,"cdr_on_dodge_sec":1},"desc":"Setiap kali berhasil Dodge saat Eagle Sight aktif, CD skill Rangesmith -1d."},"morph_choices":[{"id":"rng_t2_m1","branch":"Offense","name":"Predator Focus","effect":{"crit_chance_pct":10,"crit_dmg_pct":15},"desc":"Setiap 3 serangan berturut-turut pasti Critical."},{"id":"rng_t2_m2","branch":"Defense/Companion","name":"Smoke Veil","effect":{"dodge_pct":10,"dmg_reduction_pct":5},"desc":"Menghilangkan Aggro musuh 3d saat buff diaktifkan."},{"id":"rng_t2_m3","branch":"Forge Synergy","name":"Featherlight Gear","effect":{"dodge_pct":8,"attack_speed_pct":6},"desc":"+6% Dodge tambahan bila memakai >= 3 slot Armor Ringan."}]},{"tier":3,"rank_label":"Elite","active_skill":{"id":"rng_t3_a","name":"Disrupting Volley","role":"Defensive/Interrupt","cooldown_sec":13,"base_multiplier":1.35,"element":"Neutral","interrupts_cast":true,"self_buff":{"dodge_pct":12,"duration_sec":3},"grants_resource":{"id":"hunters_mark","amount":2},"desc":"Melompat mundur (Backstep 3,5m) + kipas 3 proyektil pembatal Cast Bar."},"core_passive":{"id":"rng_t3_p","unlock_skill_level":3,"name":"Evasive Reflex","effect":{"dodge_pct":5,"accuracy_pct":6},"desc":"Backstep memberi kebal sesaat (0,5d) & langsung mengisi +2 Hunter's Mark."},"morph_choices":[{"id":"rng_t3_m1","branch":"Offense","name":"Shrapnel Fan","effect":{"skill_dmg_pct":20,"crit_chance_pct":5},"desc":"Jumlah proyektil naik jadi 5 busur lebar."},{"id":"rng_t3_m2","branch":"Defense/Companion","name":"Snare Net","effect":{"enemy_dmg_debuff_pct":10,"dodge_pct":6},"desc":"Meninggalkan perangkap pengikat musuh 2d di posisi awal."},{"id":"rng_t3_m3","branch":"Forge Synergy","name":"Quick-Load Quiver","effect":{"trigger_power_pct":22,"skill_dmg_pct":10},"desc":"Memicu Weapon Trigger jarak jauh 75% saat mendarat."}]},{"tier":4,"rank_label":"Master","active_skill":{"id":"rng_t4_a","name":"Heartseeker Pierce","role":"Core Combo/Execute","cooldown_sec":9,"base_multiplier":1.85,"element":"Neutral","consumes_resource":{"id":"hunters_mark","per_stack_mult":0.22},"armor_pen_override_pct":100,"desc":"Konsumsi seluruh Hunter's Mark: tembus 100% Armor + Crit Severity +35%."},"core_passive":{"id":"rng_t4_p","unlock_skill_level":3,"name":"Deadeye Ricochet","effect":{"crit_dmg_pct":20,"dmg_pct":8},"desc":"Jika Heartseeker Pierce Crit, proyektil memantul ke 1 musuh terdekat (60% dmg)."},"morph_choices":[{"id":"rng_t4_m1","branch":"Offense","name":"Armor Rend","effect":{"armor_pen_pct":20,"skill_dmg_pct":16},"desc":"Target tetap kehilangan 20% Armor selama 6d."},{"id":"rng_t4_m2","branch":"Defense/Companion","name":"Marking Tether","effect":{"cooldown_reduction_sec":1.5,"crit_chance_pct":6},"desc":"Mengembalikan 2 stack Hunter's Mark pada Mini Boss/Boss."},{"id":"rng_t4_m3","branch":"Forge Synergy","name":"Attuned Bolt","effect":{"weakness_bonus_pct":20,"elemental_dmg_pct":15},"desc":"Ubah elemen mengikuti Attunement senjata +20% Weakness Exploit."}]},{"tier":5,"rank_label":"Apex","pure_only":true,"active_skill":{"id":"rng_t5_a","name":"Horizon Starfall","role":"Apex Ultimate","cooldown_sec":28,"base_multiplier":3.05,"element":"Lightning","desc":"Hujan proyektil bertubi-tubi selama 3d ke zona target sambil bebas kiting!"},"core_passive":{"id":"rng_t5_p","unlock_skill_level":3,"name":"Horizoner Supremacy","effect":{"remove_ranged_dmg_penalty":true,"dmg_pct":12,"accuracy_pct":10},"desc":"Penalti damage senjata jauh (x0,9) dihapus total (x1,0) + jarak serang +20%."},"morph_choices":[{"id":"rng_t5_m1","branch":"Offense","name":"Meteor Rain","effect":{"skill_dmg_pct":28,"elemental_dmg_pct":15},"desc":"Gelombang terakhir meledak dengan Fire/Lightning AoE."},{"id":"rng_t5_m2","branch":"Defense/Companion","name":"Phantom Decoy","effect":{"dodge_pct":12,"dmg_reduction_pct":10},"desc":"Meninggalkan bayangan pengecoh penarik serangan Boss 4d."},{"id":"rng_t5_m3","branch":"Forge Synergy","name":"Master Ballistics","effect":{"trigger_power_pct":30,"skill_dmg_pct":15},"desc":"Setiap 2 proyektil yang kena memicu Weapon Trigger jarak jauh."}]}]},"Runesmith":{"smith_class":"Runesmith","class_progression":["Runescribe","Glyphwright","Spellforger","Arcanist","Runelord"],"resource":{"id":"elemental_charge","name":"Elemental Charge","max_stacks":3,"per_stack":{"elemental_dmg_pct":8,"weakness_bonus_pct":6}},"theme":"6 Elemen + Neutral, Weakness Exploit, Rune Slotting & 6 Reaksi Fusi Hibrida","tiers":[{"tier":1,"rank_label":"Basic","active_skill":{"id":"run_t1_a","name":"Runic Bolt","role":"Opener/Builder","cooldown_sec":4.5,"base_multiplier":1.35,"element":"WeaponAttunement","grants_resource":{"id":"elemental_charge","amount":1},"desc":"Proyektil rune mengikuti elemen senjata (Attunement), menanam +1 Elemental Charge."},"core_passive":{"id":"run_t1_p","unlock_skill_level":3,"name":"Glyph Resonance","effect":{"elemental_dmg_pct":10,"weakness_bonus_pct":10},"desc":"Memukul elemen weak memberi +1 Elemental Charge tambahan & +10% Weakness Exploit."},"morph_choices":[{"id":"run_t1_m1","branch":"Offense","name":"Chain Glyph","effect":{"skill_dmg_pct":16,"elemental_dmg_pct":10},"desc":"Memantul ke 2 musuh terdekat bila target sudah punya Charge."},{"id":"run_t1_m2","branch":"Defense/Companion","name":"Siphon Rune","effect":{"heal_on_cast_pct":4,"stamina_refund":6},"desc":"Pulihkan 6 Stamina & 3% HP tiap memicu Weakness Exploit."},{"id":"run_t1_m3","branch":"Forge Synergy","name":"Dual-Core Echo","effect":{"fusion_dual_charge":true,"trigger_power_pct":18},"desc":"Senjata Mode Fusi langsung menanam 2 Elemen Hibrida dalam 1 cast!"}]},{"tier":2,"rank_label":"Expert","active_skill":{"id":"run_t2_a","name":"Arcane Attunement","role":"Class Buff (RF)","cooldown_sec":28,"duration_sec":18,"base_multiplier":0,"element":"Adaptive","self_buff":{"elemental_dmg_pct":18,"weakness_bonus_pct":15,"rune_power_pct":25,"duration_sec":18},"desc":"Class Buff RF: +18% Elemental Potency, +15% Weakness Exploit, +25% efek Rune."},"core_passive":{"id":"run_t2_p","unlock_skill_level":3,"name":"Elemental Flux","effect":{"ignore_same_element_penalty":true,"elemental_dmg_pct":8},"desc":"Selama buff aktif, penalti -25% elemen sama dihapus (menjadi x1,0)."},"morph_choices":[{"id":"run_t2_m1","branch":"Offense","name":"Overcharged Runes","effect":{"skill_dmg_pct":15,"elemental_dmg_pct":14},"desc":"Setiap skill aktif memercikkan petir/api tambahan 25% INT."},{"id":"run_t2_m2","branch":"Defense/Companion","name":"Prismatic Ward","effect":{"elem_resist_pct":20,"dmg_reduction_pct":5},"desc":"Elemental Barrier +20% resistensi 6 elemen untuk tim."},{"id":"run_t2_m3","branch":"Forge Synergy","name":"Socket Mastery","effect":{"skill_dmg_pct":16,"trigger_power_pct":14},"desc":"+4% Skill Damage per Slot Rune terisi pada senjata (maks +20%)."}]},{"tier":3,"rank_label":"Elite","active_skill":{"id":"run_t3_a","name":"Nullify Seal","role":"Defensive/Interrupt","cooldown_sec":14,"base_multiplier":1.3,"element":"Adaptive","interrupts_cast":true,"self_buff":{"dmg_reduction_pct":14,"barrier_hp_pct":15,"duration_sec":5},"desc":"Segel rune pembatal Cast Bar + Silence 2d + Arcane Barrier 15% HP."},"core_passive":{"id":"run_t3_p","unlock_skill_level":3,"name":"Spell Eater","effect":{"auto_match_weakness_on_interrupt":true,"weakness_bonus_pct":12},"desc":"Membatalkan Cast Bar otomatis mengubah Charge berikutnya menjadi elemen weak target!"},"morph_choices":[{"id":"run_t3_m1","branch":"Offense","name":"Backlash Seal","effect":{"skill_dmg_pct":22,"auto_match_weakness":true},"desc":"Musuh yang di-interrupt meledak menerima elemen kelemahannya."},{"id":"run_t3_m2","branch":"Defense/Companion","name":"Purifying Ward","effect":{"heal_on_cast_pct":6,"elem_resist_pct":10},"desc":"Menghapus 1 debuff/racun pada pemain & Companion."},{"id":"run_t3_m3","branch":"Forge Synergy","name":"Runic Extraction","effect":{"cooldown_reduction_sec":2,"trigger_power_pct":15},"desc":"Menurunkan CD Prismatic Detonation -3d saat Interrupt berhasil."}]},{"tier":4,"rank_label":"Master","active_skill":{"id":"run_t4_a","name":"Prismatic Detonation","role":"Core Combo/Execute","cooldown_sec":9.5,"base_multiplier":1.9,"element":"Adaptive","consumes_resource":{"id":"elemental_charge","per_stack_mult":0.35},"triggers_hybrid_fusion":true,"desc":"Ledakkan semua Elemental Charge; >= 2 elemen beda memicu Reaksi Fusi Hibrida!"},"core_passive":{"id":"run_t4_p","unlock_skill_level":3,"name":"Catalyst Cascade","effect":{"elemental_dmg_pct":16,"weakness_bonus_pct":10},"desc":"Memicu Reaksi Fusi Hibrida menambah +20% Elemental Damage selama 6d."},"morph_choices":[{"id":"run_t4_m1","branch":"Offense","name":"Volatile Fusion","effect":{"skill_dmg_pct":24,"elemental_dmg_pct":15},"desc":"Radius ledakan Fusi meluas & meninggalkan zona elemen 4d."},{"id":"run_t4_m2","branch":"Defense/Companion","name":"Harmonic Shield","effect":{"dmg_reduction_pct":8,"heal_on_cast_pct":6},"desc":"Tiap Charge yang diledakkan memberi +6% Barrier bertahan."},{"id":"run_t4_m3","branch":"Forge Synergy","name":"Conscience Infusion","effect":{"skill_dmg_pct":20,"conscience_scale_pct":18},"desc":"Tambah bonus Light (Mulia) / Dark (Kejam) mengikuti Conscience senjata."}]},{"tier":5,"rank_label":"Apex","pure_only":true,"active_skill":{"id":"run_t5_a","name":"Sovereign Runestorm","role":"Apex Ultimate","cooldown_sec":32,"base_multiplier":3.1,"element":"Adaptive","auto_match_weakness":true,"desc":"Badai 6 Elemen melanda area 4d; otomatis mendeteksi & menembak weak tiap musuh!"},"core_passive":{"id":"run_t5_p","unlock_skill_level":3,"name":"Runelord Omniscience","effect":{"elemental_dmg_pct":20,"weakness_bonus_pct":20,"crit_chance_pct":6},"desc":"Serangan elemen abaikan 25% resist lawan & Weakness Exploit bisa Crit ekstra."},"morph_choices":[{"id":"run_t5_m1","branch":"Offense","name":"Eclipse Singularity","effect":{"skill_dmg_pct":30,"armor_pen_pct":15},"desc":"Menarik semua musuh ke pusat lalu meledakkan Eclipse (Light+Dark)."},{"id":"run_t5_m2","branch":"Defense/Companion","name":"Astral Sanctuary","effect":{"heal_on_cast_pct":14,"dmg_reduction_pct":8},"desc":"Memulihkan 4% HP/detik bagi Pemain & Companion di dalam badai."},{"id":"run_t5_m3","branch":"Forge Synergy","name":"Living Grimoire","effect":{"trigger_power_pct":30,"skill_dmg_pct":18},"desc":"Tiap Rune pada senjata & armor menembakkan peluru rune ekstra."}]}]},"Reforger":{"smith_class":"Reforger","class_progression":["Tinkerer","Temperer","Transmuter","Alchemizer","Sovereign"],"resource":{"id":"overclock","name":"Overclock","max_stacks":5,"per_stack":{"global_cdr_pct":3,"dmg_pct":3}},"theme":"Cooldown Manipulation, Enhance +N Overdrive, Companion Synergy & Tactical Alchemy","tiers":[{"tier":1,"rank_label":"Basic","active_skill":{"id":"ref_t1_a","name":"Tactical Strike","role":"Opener/Builder","cooldown_sec":4.5,"base_multiplier":1.3,"element":"Neutral","grants_resource":{"id":"overclock","amount":2},"desc":"Serangan adaptif (Dekat/Jauh), +2 Overclock, menandai target untuk Companion."},"core_passive":{"id":"ref_t1_p","unlock_skill_level":3,"name":"Clockwork Flow","effect":{"global_cdr_pct":5,"dmg_pct":5,"overclock_on_rotation":true},"desc":"Merotasi 2 tombol skill berbeda berturut-turut otomatis +1 Overclock & +5% dmg."},"morph_choices":[{"id":"ref_t1_m1","branch":"Offense","name":"Exploit Seam","effect":{"armor_pen_pct":15,"skill_dmg_pct":10},"desc":"Mengurangi Defense/Mitigate target -15% selama 5d."},{"id":"ref_t1_m2","branch":"Defense/Companion","name":"Command Assist","effect":{"companion_assist_pct":30,"crit_chance_pct":4},"desc":"Serangan Companion berikutnya pada target pasti Critical!"},{"id":"ref_t1_m3","branch":"Forge Synergy","name":"Tempered Edge +N","effect":{"dmg_pct_per_enhance":4,"skill_dmg_pct":10},"desc":"Bonus damage +4% untuk setiap tingkat +N pada senjata terpasang."}]},{"tier":2,"rank_label":"Expert","active_skill":{"id":"ref_t2_a","name":"Temper Overdrive","role":"Class Buff (RF)","cooldown_sec":30,"duration_sec":18,"base_multiplier":0,"element":"Neutral","self_buff":{"temp_enhance_plus":3,"global_cdr_pct":12,"dmg_pct":14,"duration_sec":18},"desc":"Class Buff RF: Naikkan +N sementara (+2..+4) & -12% Cooldown Recovery."},"core_passive":{"id":"ref_t2_p","unlock_skill_level":3,"name":"Thermal Efficiency","effect":{"global_cdr_pct":5,"stamina_save_pct":20},"desc":"Selama Temper Overdrive aktif, konsumsi stamina turun -20%."},"morph_choices":[{"id":"ref_t2_m1","branch":"Offense","name":"Volatile Overheat","effect":{"skill_dmg_pct":16,"elemental_dmg_pct":12},"desc":"Tiap skill yang dipakai saat Overdrive meledakkan percikan Fire/Lightning."},{"id":"ref_t2_m2","branch":"Defense/Companion","name":"Squadron Overdrive","effect":{"companion_assist_pct":28,"dmg_reduction_pct":6},"desc":"Companion ikut dapat +20% Attack Speed & +15% Damage Reduction."},{"id":"ref_t2_m3","branch":"Forge Synergy","name":"Alchemy Flask","effect":{"rare_drop_pct":15,"heal_on_cast_pct":5},"desc":"+15% Rare Drop & +10% efektivitas pemulihan."}]},{"tier":3,"rank_label":"Elite","active_skill":{"id":"ref_t3_a","name":"Flashbang Quench","role":"Defensive/Interrupt","cooldown_sec":14,"base_multiplier":1.2,"element":"Ice","interrupts_cast":true,"grants_resource":{"id":"overclock","amount":2},"debuff":{"enemy_acc_reduction_pct":25,"duration_sec":4},"desc":"Bom uap pendingin: batalkan Cast Bar, -25% Accuracy musuh 4d, & +2 Overclock."},"core_passive":{"id":"ref_t3_p","unlock_skill_level":3,"name":"Precision Dismantle","effect":{"enemy_dmg_debuff_pct":8,"cdr_all_on_interrupt_sec":2},"desc":"Membatalkan Cast Bar mengurangi sisa Cooldown seluruh Macro Bar -2d."},"morph_choices":[{"id":"ref_t3_m1","branch":"Offense","name":"Acidic Vapor","effect":{"skill_dmg_pct":18,"armor_pen_pct":12},"desc":"Uap pendingin merusak armor & memberi Earth/Acid DoT 5d."},{"id":"ref_t3_m2","branch":"Defense/Companion","name":"Rescue Smoke","effect":{"heal_on_cast_pct":8,"companion_dr_pct":20},"desc":"Menarik Companion mundur & memulihkan 15% HP-nya."},{"id":"ref_t3_m3","branch":"Forge Synergy","name":"Salvage Spark","effect":{"rare_drop_pct":20,"trigger_power_pct":12},"desc":"25% peluang ekstra 1 material Common/Uncommon saat musuh mati."}]},{"tier":4,"rank_label":"Master","active_skill":{"id":"ref_t4_a","name":"Chrono Rewind","role":"Core Combo/Execute","cooldown_sec":10,"base_multiplier":1.75,"element":"Adaptive","consumes_resource":{"id":"overclock","per_stack_mult":0.2,"cdr_other_skills_per_stack_sec":1},"desc":"Konsumsi Overclock: ledakan adaptif + pangkas CD 2 skill lain hingga -5d!"},"core_passive":{"id":"ref_t4_p","unlock_skill_level":3,"name":"Perpetual Gear","effect":{"trigger_power_pct":20,"global_cdr_pct":6},"desc":"Weapon Skill segera setelah Chrono Rewind mendapat +30% bonus damage."},"morph_choices":[{"id":"ref_t4_m1","branch":"Offense","name":"Double Tap","effect":{"skill_dmg_pct":22,"trigger_power_pct":25},"desc":"Menggandakan jumlah hit Weapon Skill berikutnya."},{"id":"ref_t4_m2","branch":"Defense/Companion","name":"Time Mend","effect":{"heal_on_cast_pct":12,"dmg_reduction_pct":5},"desc":"Mengembalikan 12% HP yang hilang dalam 4 detik terakhir."},{"id":"ref_t4_m3","branch":"Forge Synergy","name":"Reforged Perfection","effect":{"reset_weapon_skill_cd":true,"skill_dmg_pct":14},"desc":"Mereset 100% Cooldown Weapon Skill secara instan."}]},{"tier":5,"rank_label":"Apex","pure_only":true,"active_skill":{"id":"ref_t5_a","name":"Masterpiece Transmutation","role":"Apex Ultimate","cooldown_sec":34,"base_multiplier":2.9,"element":"Adaptive","self_buff":{"global_cdr_pct":35,"companion_assist_pct":40,"duration_sec":8},"desc":"Forge Domain 8d: semua Cooldown -35%, Weapon Trigger tiap 2 pukulan, & kombo Companion!"},"core_passive":{"id":"ref_t5_p","unlock_skill_level":3,"name":"Sovereign Artificer","effect":{"enhance_scale_bonus_pct":25,"companion_assist_pct":25,"global_cdr_pct":8},"desc":"Semua bonus Enhance +N, Trait Tempa, & Loyalitas Companion naik +25%."},"morph_choices":[{"id":"ref_t5_m1","branch":"Offense","name":"Arsenal Rain","effect":{"skill_dmg_pct":30,"trigger_power_pct":20},"desc":"Memanggil 4 proyektil senjata dari Galeri Trofi."},{"id":"ref_t5_m2","branch":"Defense/Companion","name":"Grand Marshal","effect":{"companion_assist_pct":55,"dmg_reduction_pct":8},"desc":"Memanggil bantuan bayangan 2 Murid lain serentak selama 6d."},{"id":"ref_t5_m3","branch":"Forge Synergy","name":"Resonance Awakening","effect":{"skill_dmg_pct":24,"resonance_boost":1},"desc":"Selama Forge Domain, senjata non-Unique dapat bonus setara Resonance T1!"}]}]}},"destiny_cards":{"pure_weaponsmith":{"id":"pure_weaponsmith","category":"pure","smith_class":"Weaponsmith","names_by_tier":["Bladesmith","Edgewright","Warmonger","Vanquisher","Archblade"],"req":{"class":"Weaponsmith","min_tier":1},"passive_per_tier":{"dmg_pct":6,"armor_pen_pct":3},"signature":{"id":"blade_tempest","name":"Blade Tempest","effect":{"double_trigger_on_crit":true,"min_forge_heat":1},"desc":"Crit melee memicu Weapon Trigger 2x & Forge Heat tidak pernah < 1."}},"pure_armorer":{"id":"pure_armorer","category":"pure","smith_class":"Armorer","names_by_tier":["Platesmith","Shieldwright","Bulwark","Juggernaut","Aegisborn"],"req":{"class":"Armorer","min_tier":1},"passive_per_tier":{"max_hp_pct":6,"dmg_reduction_pct":3},"signature":{"id":"unbroken_mirror","name":"Unbroken Mirror","effect":{"parry_aoe_reflect":true,"guard_on_boss_hit":1},"desc":"Parry/tahan serangan Boss memantulkan kejut AoE + 1 Bastion Guard."}},"pure_rangesmith":{"id":"pure_rangesmith","category":"pure","smith_class":"Rangesmith","names_by_tier":["Bowyer","Fletcher","Deadeye","Ballistary","Horizoner"],"req":{"class":"Rangesmith","min_tier":1},"passive_per_tier":{"dmg_pct":6,"dodge_pct":3,"accuracy_pct":3},"signature":{"id":"horizon_piercer","name":"Horizon Piercer","effect":{"piercing_ranged":true,"weapon_skill_cdr_on_dodge_sec":1.5},"desc":"Tembakan >= 5m menembus musuh & Dodge pangkas 1,5d CD Weapon Skill."}},"pure_runesmith":{"id":"pure_runesmith","category":"pure","smith_class":"Runesmith","names_by_tier":["Runescribe","Glyphwright","Spellforger","Arcanist","Runelord"],"req":{"class":"Runesmith","min_tier":1},"passive_per_tier":{"elemental_dmg_pct":6,"weakness_bonus_pct":4},"signature":{"id":"twin_catalyst","name":"Twin Catalyst","effect":{"double_hybrid_fusion":true,"charge_on_weakness":1},"desc":"Dapat memicu 2 Reaksi Fusi Hibrida beruntun & Weakness isi +1 Charge."}},"pure_reforger":{"id":"pure_reforger","category":"pure","smith_class":"Reforger","names_by_tier":["Tinkerer","Temperer","Transmuter","Alchemizer","Sovereign"],"req":{"class":"Reforger","min_tier":1},"passive_per_tier":{"global_cdr_pct":3,"companion_assist_pct":6},"signature":{"id":"grand_overclock","name":"Grand Overclock","effect":{"companion_mirrors_buff":true,"rewind_cdr_on_3_chain_sec":2},"desc":"Companion meniru Class Buff Anda & rotasi 3 skill beda pangkas 2d CD Chrono Rewind."}},"Vanguard":{"id":"Vanguard","category":"dual","primary":"Weaponsmith","secondary":"Armorer","name":"Vanguard","passive_bonus":{"dmg_pct":12,"dmg_reduction_pct":8},"signature":{"name":"Vanguard Barrier","effect":{"skill_dmg_pct":18,"barrier_on_opener_pct":8},"desc":"Opener/Combo beri Barrier 8% HP; selama utuh, melee dmg +18%."}},"Skirmisher":{"id":"Skirmisher","category":"dual","primary":"Weaponsmith","secondary":"Rangesmith","name":"Skirmisher","passive_bonus":{"dmg_pct":10,"attack_speed_pct":10,"dodge_pct":6},"signature":{"name":"Blitz Strike","effect":{"range_swap_burst_pct":25},"desc":"Ganti serangan Jauh<->Dekat picu Blitz Strike (+25% dmg & gerak 3d)."}},"Spellblade":{"id":"Spellblade","category":"dual","primary":"Weaponsmith","secondary":"Runesmith","name":"Spellblade","passive_bonus":{"dmg_pct":10,"elemental_dmg_pct":14},"signature":{"name":"Rune Mark Detonation","effect":{"spellblade_mark_bonus_pct":30},"desc":"Pukulan dekat tanam Rune Mark -> skill elemen meledakkannya +30% dmg!"}},"Hellforger":{"id":"Hellforger","category":"dual","primary":"Weaponsmith","secondary":"Reforger","name":"Hellforger","passive_bonus":{"dmg_pct":12,"trigger_power_pct":14},"signature":{"name":"Molten Overforge","effect":{"heat_to_temp_enhance":true,"elemental_dmg_pct":12},"desc":"Forge Heat menaikkan +N sementara & memercikkan Fire tiap ayunan."}},"Wardensmith":{"id":"Wardensmith","category":"dual","primary":"Armorer","secondary":"Weaponsmith","name":"Wardensmith","passive_bonus":{"max_hp_pct":12,"dmg_pct":10},"signature":{"name":"Bastion Edge","effect":{"guard_to_melee_dmg_pct":4,"bleed_on_bash":true},"desc":"Tiap Bastion Guard +4% dmg melee & Shieldbreaker Bash picu Bleed."}},"Sentinel":{"id":"Sentinel","category":"dual","primary":"Armorer","secondary":"Rangesmith","name":"Sentinel","passive_bonus":{"dmg_reduction_pct":8,"dodge_pct":8,"parry_pct":6},"signature":{"name":"Counter Shot","effect":{"counter_shot_on_avoid":true,"skill_dmg_pct":12},"desc":"Dodge/Parry lepaskan Counter Shot jarak jauh gratis (CD 3d) + perisai."}},"Runeguard":{"id":"Runeguard","category":"dual","primary":"Armorer","secondary":"Runesmith","name":"Runeguard","passive_bonus":{"max_hp_pct":10,"elem_resist_pct":12,"elemental_dmg_pct":10},"signature":{"name":"Attuned Riposte","effect":{"absorb_element_to_weapon":true,"weakness_bonus_pct":12},"desc":"Menahan serangan elemen menyerap elemen itu ke senjata untuk serangan balik!"}},"Ironclad":{"id":"Ironclad","category":"dual","primary":"Armorer","secondary":"Reforger","name":"Ironclad","passive_bonus":{"max_hp_pct":12,"dmg_reduction_pct":10,"global_cdr_pct":6},"signature":{"name":"Emergency Overclock","effect":{"low_hp_cdr_sec":4,"low_hp_barrier_pct":18},"desc":"HP < 50% picu Emergency Overclock (-4d CD defensif & Barrier 18% HP)."}},"Outrider":{"id":"Outrider","category":"dual","primary":"Rangesmith","secondary":"Weaponsmith","name":"Outrider","passive_bonus":{"dmg_pct":12,"accuracy_pct":8,"attack_speed_pct":8},"signature":{"name":"Close-Quarters Cut","effect":{"ranged_fills_heat":true,"close_counter_cut":true},"desc":"Tembakan jauh isi Forge Heat; musuh < 2,5m kena tebasan balasan otomatis!"}},"Bastionbow":{"id":"Bastionbow","category":"dual","primary":"Rangesmith","secondary":"Armorer","name":"Bastionbow","passive_bonus":{"dmg_pct":10,"dmg_reduction_pct":10,"max_hp_pct":10},"signature":{"name":"Fortified Aim","effect":{"ranged_with_heavy_shield":true,"fortify_dmg_pct":15},"desc":"Bisa pakai Perisai/Armor Berat dengan senjata jauh; diam 2d beri +20% Mitigate & +15% Dmg."}},"Arcarcher":{"id":"Arcarcher","category":"dual","primary":"Rangesmith","secondary":"Runesmith","name":"Arcarcher","passive_bonus":{"accuracy_pct":10,"elemental_dmg_pct":14,"weakness_bonus_pct":12},"signature":{"name":"Seeker Glyph","effect":{"marked_auto_weakness":true},"desc":"Tembakan pada target ber-Hunter's Mark otomatis berubah ke elemen weak & tanam Charge!"}},"Artificer":{"id":"Artificer","category":"dual","primary":"Rangesmith","secondary":"Reforger","name":"Artificer","passive_bonus":{"attack_speed_pct":10,"trigger_power_pct":15,"global_cdr_pct":6},"signature":{"name":"Auto-Turret Tempa","effect":{"turret_bonus_dps_pct":18},"desc":"Setiap 3 tembakan jauh pasang Auto-Turret mini (6d) yang ikut menembak & isi Overclock!"}},"Hexblade":{"id":"Hexblade","category":"dual","primary":"Runesmith","secondary":"Weaponsmith","name":"Hexblade","passive_bonus":{"elemental_dmg_pct":14,"dmg_pct":10,"crit_chance_pct":5},"signature":{"name":"Arcane Edge","effect":{"arcane_edge_auto_weakness":true},"desc":"Pasca-skill elemen, senjata menyala Arcane Edge (4d): ayunan dekat berikut pasti Weakness Exploit!"}},"Aegisrune":{"id":"Aegisrune","category":"dual","primary":"Runesmith","secondary":"Armorer","name":"Aegisrune","passive_bonus":{"elemental_dmg_pct":12,"dmg_reduction_pct":10,"elem_resist_pct":12},"signature":{"name":"Runic Barrier","effect":{"charge_burst_to_barrier_pct":25},"desc":"Ledakan Elemental Charge ubah 25% dmg menjadi Runic Barrier pemantul elemen."}},"Starfletcher":{"id":"Starfletcher","category":"dual","primary":"Runesmith","secondary":"Rangesmith","name":"Starfletcher","passive_bonus":{"elemental_dmg_pct":12,"crit_dmg_pct":18,"accuracy_pct":8},"signature":{"name":"Astral Trajectory","effect":{"spell_range_pct":25,"inherit_mark_crit":true},"desc":"Runic Bolt & skill elemen +25% jarak & warisi Crit Severity dari Hunter's Mark."}},"Thaumaturge":{"id":"Thaumaturge","category":"dual","primary":"Runesmith","secondary":"Reforger","name":"Thaumaturge","passive_bonus":{"elemental_dmg_pct":15,"global_cdr_pct":8,"trigger_power_pct":12},"signature":{"name":"Runic Synthesis","effect":{"double_rune_at_overclock3":true,"fusion_stamina_save_pct":50},"desc":"Efek Slot Rune ganda saat Overclock >= 3 & Fusi hemat 50% Stamina."}},"Reaver":{"id":"Reaver","category":"dual","primary":"Reforger","secondary":"Weaponsmith","name":"Reaver","passive_bonus":{"attack_speed_pct":12,"dmg_pct":12,"global_cdr_pct":6},"signature":{"name":"Frenzy Swing","effect":{"overclock_frenzy_aspd_pct":25,"lifesteal_pct":8},"desc":"Konsumsi Overclock picu Frenzy Swing (+25% ASPD & 8% lifesteal selama 5d)."}},"Colossus":{"id":"Colossus","category":"dual","primary":"Reforger","secondary":"Armorer","name":"Colossus","passive_bonus":{"max_hp_pct":14,"dmg_reduction_pct":10,"companion_assist_pct":15},"signature":{"name":"Dual-Tank Citadel","effect":{"double_poise_in_overdrive":true,"dual_tank_companion":true},"desc":"Temper Overdrive gandakan Poise/Armor & Companion bantu tarik Aggro."}},"Machinist":{"id":"Machinist","category":"dual","primary":"Reforger","secondary":"Rangesmith","name":"Machinist","passive_bonus":{"accuracy_pct":10,"global_cdr_pct":8,"attack_speed_pct":10},"signature":{"name":"Micro-Bolt Array","effect":{"micro_bolt_on_overclock":true,"volley_cdr_sec":2},"desc":"Mengisi Overclock tembakkan Micro-Bolt otomatis & pangkas CD Disrupting Volley."}},"Chronosmith":{"id":"Chronosmith","category":"dual","primary":"Reforger","secondary":"Runesmith","name":"Chronosmith","passive_bonus":{"global_cdr_pct":12,"elemental_dmg_pct":12,"weakness_bonus_pct":12},"signature":{"name":"Temporal Exploit","effect":{"weakness_cdr_all_sec":1.5},"desc":"Setiap memicu Weakness Exploit memangkas seluruh CD Macro Bar -1,5d (CD internal 4d)!"}},"Polymath":{"id":"Polymath","category":"multi","min_classes":3,"dominant":"arcane_tactical","name":"Polymath","passive_bonus":{"elemental_dmg_pct":10,"global_cdr_pct":8,"crit_chance_pct":6},"signature":{"name":"Expanded Matrix","effect":{"extra_macro_slot":1,"polymath_stack_pct":12},"desc":"+1 Slot Macro Bar ekstra + Charge/Overclock beri +12% Crit & Elem Potency (stack 3x)."}},"Arsenist":{"id":"Arsenist","category":"multi","min_classes":3,"dominant":"martial","name":"Arsenist","passive_bonus":{"dmg_pct":12,"attack_speed_pct":10,"dmg_reduction_pct":6},"signature":{"name":"Quick Arsenal Swap","effect":{"dual_weapon_swap":true,"weapon_skill_cdr_on_swap_sec":3},"desc":"Bawa 2 Senjata Aktif (Quick Swap di Battle!); ganti senjata pangkas CD Weapon Skill -3d!"}},"Synthesist":{"id":"Synthesist","category":"multi","min_classes":4,"name":"Synthesist","passive_bonus":{"dmg_pct":10,"elemental_dmg_pct":10,"dmg_reduction_pct":8,"global_cdr_pct":6},"signature":{"name":"Cross-Resource Echo","effect":{"cross_resource_share_chance_pct":50},"desc":"Mengisi 1 jenis Resource pohon berpeluang 50% mengisi +1 Resource pohon lain!"}},"Omnismith":{"id":"Omnismith","category":"multi","min_classes":5,"name":"Omnismith","passive_bonus":{"dmg_pct":12,"elemental_dmg_pct":12,"dmg_reduction_pct":8,"global_cdr_pct":8,"trigger_power_pct":15},"signature":{"name":"Master of All Forges","effect":{"unlock_all_48_weapons":true,"omni_surge_on_3_classes":true,"omni_surge_dmg_pct":25,"omni_surge_cdr_sec":2},"desc":"Bebas pakai 48 Senjata tanpa penalti + rangkai 3 skill Class beda picu Omni-Surge (+25% dmg, -2d CD, Trigger gratis)!"}}},"weapon_skills":{"w_str_1":{"id":"wsk_w_str_1","weapon_id":"w_str_1","weapon_name":"Kapak Perang","name":"Twister","stat":"STR","tier":1,"tag":"Dekat","cooldown_sec":6.5,"base_multiplier":1.35,"role":"Weapon Skill [W]","governing_smith":"Weaponsmith","desc":"Jurus Senjata Aktif [W] dari Kapak Perang (STR T1 Dekat): Twister."},"w_str_2":{"id":"wsk_w_str_2","weapon_id":"w_str_2","weapon_name":"Kapak Besar","name":"Cleave","stat":"STR","tier":2,"tag":"Dekat","cooldown_sec":6.5,"base_multiplier":1.43,"role":"Weapon Skill [W]","governing_smith":"Weaponsmith","desc":"Jurus Senjata Aktif [W] dari Kapak Besar (STR T2 Dekat): Cleave."},"w_str_r1":{"id":"wsk_w_str_r1","weapon_id":"w_str_r1","weapon_name":"Kapak Lempar Berat","name":"Splitting Throw","stat":"STR","tier":2,"tag":"Jauh","cooldown_sec":6.5,"base_multiplier":1.43,"role":"Weapon Skill [W]","governing_smith":"Rangesmith","desc":"Jurus Senjata Aktif [W] dari Kapak Lempar Berat (STR T2 Jauh): Splitting Throw."},"w_str_3":{"id":"wsk_w_str_3","weapon_id":"w_str_3","weapon_name":"Palu Perang","name":"Heavy Chain","stat":"STR","tier":3,"tag":"Dekat","cooldown_sec":6.5,"base_multiplier":1.51,"role":"Weapon Skill [W]","governing_smith":"Weaponsmith","desc":"Jurus Senjata Aktif [W] dari Palu Perang (STR T3 Dekat): Heavy Chain."},"w_str_4":{"id":"wsk_w_str_4","weapon_id":"w_str_4","weapon_name":"Pedang Besar","name":"Breaker Edge","stat":"STR","tier":4,"tag":"Dekat","cooldown_sec":6.5,"base_multiplier":1.59,"role":"Weapon Skill [W]","governing_smith":"Weaponsmith","desc":"Jurus Senjata Aktif [W] dari Pedang Besar (STR T4 Dekat): Breaker Edge."},"w_str_5":{"id":"wsk_w_str_5","weapon_id":"w_str_5","weapon_name":"Gada Berduri","name":"Spike Burst","stat":"STR","tier":5,"tag":"Dekat","cooldown_sec":6.5,"base_multiplier":1.67,"role":"Weapon Skill [W]","governing_smith":"Weaponsmith","desc":"Jurus Senjata Aktif [W] dari Gada Berduri (STR T5 Dekat): Spike Burst."},"w_str_6":{"id":"wsk_w_str_6","weapon_id":"w_str_6","weapon_name":"Maul","name":"Earthbreaker","stat":"STR","tier":6,"tag":"Dekat","cooldown_sec":6.5,"base_multiplier":1.75,"role":"Weapon Skill [W]","governing_smith":"Weaponsmith","desc":"Jurus Senjata Aktif [W] dari Maul (STR T6 Dekat): Earthbreaker."},"w_str_r2":{"id":"wsk_w_str_r2","weapon_id":"w_str_r2","weapon_name":"Arbalest Baja","name":"Siege Bolt","stat":"STR","tier":6,"tag":"Jauh","cooldown_sec":6.5,"base_multiplier":1.75,"role":"Weapon Skill [W]","governing_smith":"Rangesmith","desc":"Jurus Senjata Aktif [W] dari Arbalest Baja (STR T6 Jauh): Siege Bolt."},"w_dex_1":{"id":"wsk_w_dex_1","weapon_id":"w_dex_1","weapon_name":"Belati","name":"Quick Stab","stat":"DEX","tier":1,"tag":"Dekat","cooldown_sec":6,"base_multiplier":1.35,"role":"Weapon Skill [W]","governing_smith":"Weaponsmith","desc":"Jurus Senjata Aktif [W] dari Belati (DEX T1 Dekat): Quick Stab."},"w_dex_2":{"id":"wsk_w_dex_2","weapon_id":"w_dex_2","weapon_name":"Pedang Pendek","name":"Riposte","stat":"DEX","tier":2,"tag":"Dekat","cooldown_sec":6,"base_multiplier":1.43,"role":"Weapon Skill [W]","governing_smith":"Weaponsmith","desc":"Jurus Senjata Aktif [W] dari Pedang Pendek (DEX T2 Dekat): Riposte."},"w_dex_r1":{"id":"wsk_w_dex_r1","weapon_id":"w_dex_r1","weapon_name":"Pisau Lempar Kembar","name":"Fan of Knives","stat":"DEX","tier":2,"tag":"Jauh","cooldown_sec":6,"base_multiplier":1.43,"role":"Weapon Skill [W]","governing_smith":"Rangesmith","desc":"Jurus Senjata Aktif [W] dari Pisau Lempar Kembar (DEX T2 Jauh): Fan of Knives."},"w_dex_3":{"id":"wsk_w_dex_3","weapon_id":"w_dex_3","weapon_name":"Belati Kembar","name":"Dual Flurry","stat":"DEX","tier":3,"tag":"Dekat","cooldown_sec":6,"base_multiplier":1.51,"role":"Weapon Skill [W]","governing_smith":"Weaponsmith","desc":"Jurus Senjata Aktif [W] dari Belati Kembar (DEX T3 Dekat): Dual Flurry."},"w_dex_4":{"id":"wsk_w_dex_4","weapon_id":"w_dex_4","weapon_name":"Katana","name":"Iaijutsu","stat":"DEX","tier":4,"tag":"Dekat","cooldown_sec":6,"base_multiplier":1.59,"role":"Weapon Skill [W]","governing_smith":"Weaponsmith","desc":"Jurus Senjata Aktif [W] dari Katana (DEX T4 Dekat): Iaijutsu."},"w_dex_5":{"id":"wsk_w_dex_5","weapon_id":"w_dex_5","weapon_name":"Busur Pendek","name":"Quick Draw","stat":"DEX","tier":5,"tag":"Jauh","cooldown_sec":6,"base_multiplier":1.67,"role":"Weapon Skill [W]","governing_smith":"Rangesmith","desc":"Jurus Senjata Aktif [W] dari Busur Pendek (DEX T5 Jauh): Quick Draw."},"w_dex_6":{"id":"wsk_w_dex_6","weapon_id":"w_dex_6","weapon_name":"Busur Panjang","name":"Piercing Shot","stat":"DEX","tier":6,"tag":"Jauh","cooldown_sec":6,"base_multiplier":1.75,"role":"Weapon Skill [W]","governing_smith":"Rangesmith","desc":"Jurus Senjata Aktif [W] dari Busur Panjang (DEX T6 Jauh): Piercing Shot."},"w_dex_r2":{"id":"wsk_w_dex_r2","weapon_id":"w_dex_r2","weapon_name":"Crossbow Berulang","name":"Rapid Volley","stat":"DEX","tier":6,"tag":"Jauh","cooldown_sec":6,"base_multiplier":1.75,"role":"Weapon Skill [W]","governing_smith":"Rangesmith","desc":"Jurus Senjata Aktif [W] dari Crossbow Berulang (DEX T6 Jauh): Rapid Volley."},"w_con_1":{"id":"wsk_w_con_1","weapon_id":"w_con_1","weapon_name":"Gada Penjaga","name":"Guard Strike","stat":"CON","tier":1,"tag":"Dekat","cooldown_sec":7.5,"base_multiplier":1.35,"role":"Weapon Skill [W]","governing_smith":"Armorer","desc":"Jurus Senjata Aktif [W] dari Gada Penjaga (CON T1 Dekat): Guard Strike."},"w_con_2":{"id":"wsk_w_con_2","weapon_id":"w_con_2","weapon_name":"Flail Baja","name":"Swing Lash","stat":"CON","tier":2,"tag":"Dekat","cooldown_sec":7.5,"base_multiplier":1.43,"role":"Weapon Skill [W]","governing_smith":"Armorer","desc":"Jurus Senjata Aktif [W] dari Flail Baja (CON T2 Dekat): Swing Lash."},"w_con_3":{"id":"wsk_w_con_3","weapon_id":"w_con_3","weapon_name":"Gauntlet Baja","name":"Counter Fist","stat":"CON","tier":3,"tag":"Dekat","cooldown_sec":7.5,"base_multiplier":1.51,"role":"Weapon Skill [W]","governing_smith":"Armorer","desc":"Jurus Senjata Aktif [W] dari Gauntlet Baja (CON T3 Dekat): Counter Fist."},"w_con_r1":{"id":"wsk_w_con_r1","weapon_id":"w_con_r1","weapon_name":"Bola Rantai Berat","name":"Entangling Weight","stat":"CON","tier":3,"tag":"Jauh","cooldown_sec":7.5,"base_multiplier":1.51,"role":"Weapon Skill [W]","governing_smith":"Rangesmith","desc":"Jurus Senjata Aktif [W] dari Bola Rantai Berat (CON T3 Jauh): Entangling Weight."},"w_con_4":{"id":"wsk_w_con_4","weapon_id":"w_con_4","weapon_name":"Palu Penjaga","name":"Bulwark Slam","stat":"CON","tier":4,"tag":"Dekat","cooldown_sec":7.5,"base_multiplier":1.59,"role":"Weapon Skill [W]","governing_smith":"Armorer","desc":"Jurus Senjata Aktif [W] dari Palu Penjaga (CON T4 Dekat): Bulwark Slam."},"w_con_5":{"id":"wsk_w_con_5","weapon_id":"w_con_5","weapon_name":"Rantai Berduri","name":"Thorn Chain","stat":"CON","tier":5,"tag":"Dekat","cooldown_sec":7.5,"base_multiplier":1.67,"role":"Weapon Skill [W]","governing_smith":"Armorer","desc":"Jurus Senjata Aktif [W] dari Rantai Berduri (CON T5 Dekat): Thorn Chain."},"w_con_6":{"id":"wsk_w_con_6","weapon_id":"w_con_6","weapon_name":"Pedang Penjaga","name":"Sentinel Oath","stat":"CON","tier":6,"tag":"Dekat","cooldown_sec":7.5,"base_multiplier":1.75,"role":"Weapon Skill [W]","governing_smith":"Armorer","desc":"Jurus Senjata Aktif [W] dari Pedang Penjaga (CON T6 Dekat): Sentinel Oath."},"w_con_r2":{"id":"wsk_w_con_r2","weapon_id":"w_con_r2","weapon_name":"Ballista Perisai","name":"Fortress Shot","stat":"CON","tier":6,"tag":"Jauh","cooldown_sec":7.5,"base_multiplier":1.75,"role":"Weapon Skill [W]","governing_smith":"Rangesmith","desc":"Jurus Senjata Aktif [W] dari Ballista Perisai (CON T6 Jauh): Fortress Shot."},"w_int_1":{"id":"wsk_w_int_1","weapon_id":"w_int_1","weapon_name":"Tongkat Rune","name":"Arcane Bolt","stat":"INT","tier":1,"tag":"Dekat","cooldown_sec":7,"base_multiplier":1.35,"role":"Weapon Skill [W]","governing_smith":"Runesmith","desc":"Jurus Senjata Aktif [W] dari Tongkat Rune (INT T1 Dekat): Arcane Bolt."},"w_int_2":{"id":"wsk_w_int_2","weapon_id":"w_int_2","weapon_name":"Pedang Rune","name":"Rune Edge","stat":"INT","tier":2,"tag":"Dekat","cooldown_sec":7,"base_multiplier":1.43,"role":"Weapon Skill [W]","governing_smith":"Runesmith","desc":"Jurus Senjata Aktif [W] dari Pedang Rune (INT T2 Dekat): Rune Edge."},"w_int_r1":{"id":"wsk_w_int_r1","weapon_id":"w_int_r1","weapon_name":"Orb Rune Melayang","name":"Prismatic Beam","stat":"INT","tier":2,"tag":"Jauh","cooldown_sec":7,"base_multiplier":1.43,"role":"Weapon Skill [W]","governing_smith":"Rangesmith","desc":"Jurus Senjata Aktif [W] dari Orb Rune Melayang (INT T2 Jauh): Prismatic Beam."},"w_int_3":{"id":"wsk_w_int_3","weapon_id":"w_int_3","weapon_name":"Palu Rune","name":"Runic Shockwave","stat":"INT","tier":3,"tag":"Dekat","cooldown_sec":7,"base_multiplier":1.51,"role":"Weapon Skill [W]","governing_smith":"Runesmith","desc":"Jurus Senjata Aktif [W] dari Palu Rune (INT T3 Dekat): Runic Shockwave."},"w_int_4":{"id":"wsk_w_int_4","weapon_id":"w_int_4","weapon_name":"Sabit Arcane","name":"Soul Reap","stat":"INT","tier":4,"tag":"Dekat","cooldown_sec":7,"base_multiplier":1.59,"role":"Weapon Skill [W]","governing_smith":"Runesmith","desc":"Jurus Senjata Aktif [W] dari Sabit Arcane (INT T4 Dekat): Soul Reap."},"w_int_5":{"id":"wsk_w_int_5","weapon_id":"w_int_5","weapon_name":"Cakram Rune","name":"Orbit Discs","stat":"INT","tier":5,"tag":"Jauh","cooldown_sec":7,"base_multiplier":1.67,"role":"Weapon Skill [W]","governing_smith":"Rangesmith","desc":"Jurus Senjata Aktif [W] dari Cakram Rune (INT T5 Jauh): Orbit Discs."},"w_int_6":{"id":"wsk_w_int_6","weapon_id":"w_int_6","weapon_name":"Rantai Rune","name":"Binding Chain","stat":"INT","tier":6,"tag":"Dekat","cooldown_sec":7,"base_multiplier":1.75,"role":"Weapon Skill [W]","governing_smith":"Runesmith","desc":"Jurus Senjata Aktif [W] dari Rantai Rune (INT T6 Dekat): Binding Chain."},"w_int_r2":{"id":"wsk_w_int_r2","weapon_id":"w_int_r2","weapon_name":"Senapan Rune","name":"Arcane Snipe","stat":"INT","tier":6,"tag":"Jauh","cooldown_sec":7,"base_multiplier":1.75,"role":"Weapon Skill [W]","governing_smith":"Rangesmith","desc":"Jurus Senjata Aktif [W] dari Senapan Rune (INT T6 Jauh): Arcane Snipe."},"w_wis_1":{"id":"wsk_w_wis_1","weapon_id":"w_wis_1","weapon_name":"Tombak","name":"Keen Thrust","stat":"WIS","tier":1,"tag":"Dekat","cooldown_sec":6.5,"base_multiplier":1.35,"role":"Weapon Skill [W]","governing_smith":"Weaponsmith","desc":"Jurus Senjata Aktif [W] dari Tombak (WIS T1 Dekat): Keen Thrust."},"w_wis_2":{"id":"wsk_w_wis_2","weapon_id":"w_wis_2","weapon_name":"Trisula","name":"Triple Prong","stat":"WIS","tier":2,"tag":"Dekat","cooldown_sec":6.5,"base_multiplier":1.43,"role":"Weapon Skill [W]","governing_smith":"Weaponsmith","desc":"Jurus Senjata Aktif [W] dari Trisula (WIS T2 Dekat): Triple Prong."},"w_wis_r1":{"id":"wsk_w_wis_r1","weapon_id":"w_wis_r1","weapon_name":"Sumpit Pemburu","name":"Neurotoxin Dart","stat":"WIS","tier":2,"tag":"Jauh","cooldown_sec":6.5,"base_multiplier":1.43,"role":"Weapon Skill [W]","governing_smith":"Rangesmith","desc":"Jurus Senjata Aktif [W] dari Sumpit Pemburu (WIS T2 Jauh): Neurotoxin Dart."},"w_wis_3":{"id":"wsk_w_wis_3","weapon_id":"w_wis_3","weapon_name":"Naginata","name":"Sweeping Arc","stat":"WIS","tier":3,"tag":"Dekat","cooldown_sec":6.5,"base_multiplier":1.51,"role":"Weapon Skill [W]","governing_smith":"Weaponsmith","desc":"Jurus Senjata Aktif [W] dari Naginata (WIS T3 Dekat): Sweeping Arc."},"w_wis_4":{"id":"wsk_w_wis_4","weapon_id":"w_wis_4","weapon_name":"Tongkat Bo","name":"Disarm Sweep","stat":"WIS","tier":4,"tag":"Dekat","cooldown_sec":6.5,"base_multiplier":1.59,"role":"Weapon Skill [W]","governing_smith":"Weaponsmith","desc":"Jurus Senjata Aktif [W] dari Tongkat Bo (WIS T4 Dekat): Disarm Sweep."},"w_wis_5":{"id":"wsk_w_wis_5","weapon_id":"w_wis_5","weapon_name":"Tombak Lempar","name":"Tracker Mark","stat":"WIS","tier":5,"tag":"Jauh","cooldown_sec":6.5,"base_multiplier":1.67,"role":"Weapon Skill [W]","governing_smith":"Rangesmith","desc":"Jurus Senjata Aktif [W] dari Tombak Lempar (WIS T5 Jauh): Tracker Mark."},"w_wis_6":{"id":"wsk_w_wis_6","weapon_id":"w_wis_6","weapon_name":"Tombak Pemburu","name":"Prey Sense","stat":"WIS","tier":6,"tag":"Dekat","cooldown_sec":6.5,"base_multiplier":1.75,"role":"Weapon Skill [W]","governing_smith":"Weaponsmith","desc":"Jurus Senjata Aktif [W] dari Tombak Pemburu (WIS T6 Dekat): Prey Sense."},"w_wis_r2":{"id":"wsk_w_wis_r2","weapon_id":"w_wis_r2","weapon_name":"Busur Silang Pemburu","name":"Deadeye Pin","stat":"WIS","tier":6,"tag":"Jauh","cooldown_sec":6.5,"base_multiplier":1.75,"role":"Weapon Skill [W]","governing_smith":"Rangesmith","desc":"Jurus Senjata Aktif [W] dari Busur Silang Pemburu (WIS T6 Jauh): Deadeye Pin."},"w_cha_1":{"id":"wsk_w_cha_1","weapon_id":"w_cha_1","weapon_name":"Rapier","name":"Feint","stat":"CHA","tier":1,"tag":"Dekat","cooldown_sec":6.5,"base_multiplier":1.35,"role":"Weapon Skill [W]","governing_smith":"Weaponsmith","desc":"Jurus Senjata Aktif [W] dari Rapier (CHA T1 Dekat): Feint."},"w_cha_2":{"id":"wsk_w_cha_2","weapon_id":"w_cha_2","weapon_name":"Saber","name":"Rally Cut","stat":"CHA","tier":2,"tag":"Dekat","cooldown_sec":6.5,"base_multiplier":1.43,"role":"Weapon Skill [W]","governing_smith":"Weaponsmith","desc":"Jurus Senjata Aktif [W] dari Saber (CHA T2 Dekat): Rally Cut."},"w_cha_3":{"id":"wsk_w_cha_3","weapon_id":"w_cha_3","weapon_name":"Pedang Bangsawan","name":"Noble Challenge","stat":"CHA","tier":3,"tag":"Dekat","cooldown_sec":6.5,"base_multiplier":1.51,"role":"Weapon Skill [W]","governing_smith":"Weaponsmith","desc":"Jurus Senjata Aktif [W] dari Pedang Bangsawan (CHA T3 Dekat): Noble Challenge."},"w_cha_r1":{"id":"wsk_w_cha_r1","weapon_id":"w_cha_r1","weapon_name":"Pistol Flintlock Duel","name":"Point-Blank Decree","stat":"CHA","tier":3,"tag":"Jauh","cooldown_sec":6.5,"base_multiplier":1.51,"role":"Weapon Skill [W]","governing_smith":"Rangesmith","desc":"Jurus Senjata Aktif [W] dari Pistol Flintlock Duel (CHA T3 Jauh): Point-Blank Decree."},"w_cha_4":{"id":"wsk_w_cha_4","weapon_id":"w_cha_4","weapon_name":"Tongkat Penguasa","name":"Command Aura","stat":"CHA","tier":4,"tag":"Dekat","cooldown_sec":6.5,"base_multiplier":1.59,"role":"Weapon Skill [W]","governing_smith":"Weaponsmith","desc":"Jurus Senjata Aktif [W] dari Tongkat Penguasa (CHA T4 Dekat): Command Aura."},"w_cha_5":{"id":"wsk_w_cha_5","weapon_id":"w_cha_5","weapon_name":"Cambuk Dagang","name":"Debt Lash","stat":"CHA","tier":5,"tag":"Dekat","cooldown_sec":6.5,"base_multiplier":1.67,"role":"Weapon Skill [W]","governing_smith":"Weaponsmith","desc":"Jurus Senjata Aktif [W] dari Cambuk Dagang (CHA T5 Dekat): Debt Lash."},"w_cha_6":{"id":"wsk_w_cha_6","weapon_id":"w_cha_6","weapon_name":"Pedang Upacara","name":"Grand Ovation","stat":"CHA","tier":6,"tag":"Dekat","cooldown_sec":6.5,"base_multiplier":1.75,"role":"Weapon Skill [W]","governing_smith":"Weaponsmith","desc":"Jurus Senjata Aktif [W] dari Pedang Upacara (CHA T6 Dekat): Grand Ovation."},"w_cha_r2":{"id":"wsk_w_cha_r2","weapon_id":"w_cha_r2","weapon_name":"Meriam Genggam Komando","name":"Salvo Signal","stat":"CHA","tier":6,"tag":"Jauh","cooldown_sec":6.5,"base_multiplier":1.75,"role":"Weapon Skill [W]","governing_smith":"Rangesmith","desc":"Jurus Senjata Aktif [W] dari Meriam Genggam Komando (CHA T6 Jauh): Salvo Signal."}}};
// Battle-Smith RPG — CD v3.3 Skill, Smith Tree, RF Classic Mastery (Lv.1-GM), & 29 Destiny Cards Engine
// Mengintegrasikan:
// 1. 6 Stat Utama (STR, DEX, CON, INT, WIS, CHA) skala Lv1-150 (Cap Stat 30/60/90/120/150)
// 2. 60 Sub-Stat (10 per Stat Utama) + 2 Sub-Stat Fokus per Stat (+25% efisiensi) (CD-1.02b)
// 3. 5 Pohon Skill Tipe Smith (Weaponsmith, Armorer, Rangesmith, Runesmith, Reforger) = 125 Node Class:
//    25 Active/Buff Skills + 25 Core Passives (buka Lv.3) + 75 Pilihan Morph 1-dari-3 (buka Lv.5, Puncak GM) (CD-2.01)
// 4. Latihan RF Classic "Use-to-Level" (Lv.1 -> Lv.7 / GM) via pemakaian manual & Idle Battle + Cooldown & GCD 1.3d Anti-Spam
// 5. 29 Kartu Destiny ala Kingdoms of Amalur (5 Murni + 20 Dual Berarah + 4 Multi-Class) + Jalur Ganda Ganti Destiny (Misi Guild / Bayar) (CD-3.02b)
// 6. 1 Slot Khusus Weapon Skill [W] (48 Jurus Senjata Aktif CD-4.01) + 21 Perk Smith (CD-3.03) + Sinergi WD Monster (B3 & B4)

const ZONE_MULTIPLIERS = [1.0, 1.25, 1.5, 1.75, 2.0]; // Tier 1..5 (LOCKED B2)

const WD_ROLE_MAP = {
  Brute:      { hp_mult: 0.90, dmg_mult: 1.25, speed: 0.9, accuracy: 80, dodge: 3,  armor: 10 },
  Skirmisher: { hp_mult: 0.85, dmg_mult: 1.10, speed: 1.3, accuracy: 85, dodge: 15, armor: 0  },
  Caster:     { hp_mult: 0.80, dmg_mult: 1.30, speed: 1.0, accuracy: 90, dodge: 5,  armor: 0  },
  Tank:       { hp_mult: 1.40, dmg_mult: 0.80, speed: 0.8, accuracy: 75, dodge: 0,  armor: 25 },
  Support:    { hp_mult: 1.10, dmg_mult: 0.90, speed: 1.0, accuracy: 85, dodge: 10, armor: 10 }
};

const WD_TYPE_MAP = {
  "Reguler":        { hp_mult: 1.0, dmg_mult: 1.00, dodge_add: 0, armor_add: 0  },
  "Reguler Khusus": { hp_mult: 1.5, dmg_mult: 1.15, dodge_add: 2, armor_add: 3  },
  "Mini Boss":      { hp_mult: 2.5, dmg_mult: 1.30, dodge_add: 3, armor_add: 5  },
  "Boss":           { hp_mult: 5.0, dmg_mult: 1.50, dodge_add: 5, armor_add: 10 }
};

function getTierForLevel(level) {
  return Math.min(5, Math.max(1, Math.ceil(level / 30)));
}

function getStatCapForLevel(level) {
  return getTierForLevel(level) * 30;
}

function getTotalStatPointsForLevel(level) {
  return 13 + 2 * (level - 1);
}

function computeMonsterStats(wdEnemy) {
  const lvl = wdEnemy.lvl || 1;
  const tier = getTierForLevel(lvl);
  const zoneMult = ZONE_MULTIPLIERS[tier - 1];
  const roleCfg = WD_ROLE_MAP[wdEnemy.role] || WD_ROLE_MAP.Brute;
  const typeCfg = WD_TYPE_MAP[wdEnemy.type] || WD_TYPE_MAP["Reguler"];

  const baseHp = 15 + 10 * lvl;
  const baseDmg = (1.5 + 0.4 * lvl) * zoneMult;

  return {
    name: wdEnemy.name || `Monster Lv${lvl}`,
    lvl,
    tier,
    role: wdEnemy.role || "Brute",
    type: wdEnemy.type || "Reguler",
    el: wdEnemy.el || "Neutral",
    weak: wdEnemy.weak || "Neutral",
    hp: Math.round(baseHp * roleCfg.hp_mult * typeCfg.hp_mult),
    dmg: +(baseDmg * roleCfg.dmg_mult * typeCfg.dmg_mult).toFixed(2),
    speed: roleCfg.speed,
    accuracy: roleCfg.accuracy,
    dodge: roleCfg.dodge + typeCfg.dodge_add,
    armor: roleCfg.armor + typeCfg.armor_add
  };
}

function createSkillEngine(skillData) {
  const STATS = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
  const SMITH_CLASSES = ["Weaponsmith", "Armorer", "Rangesmith", "Runesmith", "Reforger"];
  const GCD_SEC = skillData.gcd_sec || 1.3;
  const MASTERY_LEVELS = skillData.skill_mastery_levels || [
    { level: 1, label: "Lv.1", xp_req: 0,   effectiveness_bonus_pct: 0,  cdr_pct: 0,  unlocks: ["active_skill"] },
    { level: 2, label: "Lv.2", xp_req: 20,  effectiveness_bonus_pct: 6,  cdr_pct: 0,  unlocks: [] },
    { level: 3, label: "Lv.3", xp_req: 55,  effectiveness_bonus_pct: 12, cdr_pct: 0,  unlocks: ["core_passive"] },
    { level: 4, label: "Lv.4", xp_req: 110, effectiveness_bonus_pct: 18, cdr_pct: 0,  unlocks: [] },
    { level: 5, label: "Lv.5", xp_req: 190, effectiveness_bonus_pct: 24, cdr_pct: 0,  unlocks: ["morph_choice"] },
    { level: 6, label: "Lv.6", xp_req: 300, effectiveness_bonus_pct: 30, cdr_pct: 5,  unlocks: [] },
    { level: 7, label: "GM",   xp_req: 450, effectiveness_bonus_pct: 40, cdr_pct: 10, unlocks: ["gm_morph_peak"] }
  ];
  const DESTINY_SWITCH_RULES = skillData.destiny_switch_rules || {
    mode: "dual_path",
    trial_guild: "Forgemasters' Guild",
    trial_options: [
      "Tempa 1 senjata mutu Istimewa+ sesuai mazhab Kartu Destiny tujuan",
      "Kalahkan 1 monster Reguler Khusus atau Mini Boss di Area aktif"
    ],
    gold_per_level_tier_br: 500,
    hostile_syndicate_surcharge_pct: 50,
    hostile_broker: "Shadow Syndicate"
  };

  // Index 5 Smith Skill Trees (125 Class Nodes: 25 Active/Buff, 25 Core Passive, 75 Morphs)
  const activeMap = new Map();
  const passiveMap = new Map();
  const morphMap = new Map();
  const tierByKey = new Map();

  for (const cls of SMITH_CLASSES) {
    const tree = skillData.smith_skill_trees?.[cls];
    if (!tree) continue;
    for (const t of tree.tiers) {
      tierByKey.set(`${cls}_T${t.tier}`, { ...t, smithClass: cls, resource: tree.resource });
      activeMap.set(t.active_skill.id, {
        ...t.active_skill,
        smithClass: cls,
        tier: t.tier,
        rankLabel: t.rank_label,
        pureOnly: !!t.pure_only,
        corePassiveId: t.core_passive.id,
        morphChoices: t.morph_choices,
        resource: tree.resource
      });
      passiveMap.set(t.core_passive.id, {
        ...t.core_passive,
        smithClass: cls,
        tier: t.tier,
        activeSkillId: t.active_skill.id
      });
      for (const m of t.morph_choices) {
        morphMap.set(m.id, {
          ...m,
          smithClass: cls,
          tier: t.tier,
          activeSkillId: t.active_skill.id
        });
      }
    }
  }

  // Index 29 Kartu Destiny (Kingdoms of Amalur)
  const destinyMap = new Map();
  if (skillData.destiny_cards) {
    for (const [key, card] of Object.entries(skillData.destiny_cards)) {
      destinyMap.set(card.id || key, card);
    }
  }

  // Index 48 Weapon Skills [W]
  const weaponSkillByWeaponId = new Map();
  const weaponSkillById = new Map();
  const weaponSkillByTrigger = new Map();
  if (skillData.weapon_skills) {
    for (const ws of Object.values(skillData.weapon_skills)) {
      weaponSkillByWeaponId.set(ws.weapon_id, ws);
      weaponSkillById.set(ws.id, ws);
      if (ws.name) weaponSkillByTrigger.set(ws.name.toLowerCase(), ws);
    }
  }

  const SINGLE_CLASS_NAMES = {
    Weaponsmith: ["Bladesmith", "Edgewright", "Warmonger", "Vanquisher", "Archblade"],
    Armorer:     ["Platesmith", "Shieldwright", "Bulwark", "Juggernaut", "Aegisborn"],
    Rangesmith:  ["Bowyer", "Fletcher", "Deadeye", "Ballistary", "Horizoner"],
    Runesmith:   ["Runescribe", "Glyphwright", "Spellforger", "Arcanist", "Runelord"],
    Reforger:    ["Tinkerer", "Temperer", "Transmuter", "Alchemizer", "Sovereign"]
  };

  const DUAL_CLASS_NAMES = {
    "Weaponsmith+Armorer": "Vanguard",
    "Weaponsmith+Rangesmith": "Skirmisher",
    "Weaponsmith+Runesmith": "Spellblade",
    "Weaponsmith+Reforger": "Hellforger",
    "Armorer+Weaponsmith": "Wardensmith",
    "Armorer+Rangesmith": "Sentinel",
    "Armorer+Runesmith": "Runeguard",
    "Armorer+Reforger": "Ironclad",
    "Rangesmith+Weaponsmith": "Outrider",
    "Rangesmith+Armorer": "Bastionbow",
    "Rangesmith+Runesmith": "Arcarcher",
    "Rangesmith+Reforger": "Artificer",
    "Runesmith+Weaponsmith": "Hexblade",
    "Runesmith+Armorer": "Aegisrune",
    "Runesmith+Rangesmith": "Starfletcher",
    "Runesmith+Reforger": "Thaumaturge",
    "Reforger+Weaponsmith": "Reaver",
    "Reforger+Armorer": "Colossus",
    "Reforger+Rangesmith": "Machinist",
    "Reforger+Runesmith": "Chronosmith"
  };

  const SMITH_CLASS_AFFINITY = {
    Weaponsmith: ["STR", "DEX"],
    Armorer:     ["CON", "STR"],
    Rangesmith:  ["DEX", "WIS"],
    Runesmith:   ["INT", "WIS"],
    Reforger:    ["CHA", "CON"]
  };

  const SMITH_PERKS_T3 = {
    STR: { id: "perk_t3_str", stat: "STR", name: "Titan's Anvil", forge: { quality_bonus: 10, masterwork_plus: 1 }, combat: { armor_pen_pct: 15, raw_might_pct: 10 }, desc: "+10 Kualitas Senjata Berat & +15% Armor Crush / +10% Raw Might" },
    DEX: { id: "perk_t3_dex", stat: "DEX", name: "Quicksilver Edge", forge: { speed_acc_budget_pct: 8 }, combat: { attack_speed_pct: 10, cdr_on_avoid_sec: 0.5 }, desc: "+8% Speed/Acc Tempa & +10% Attack Speed" },
    CON: { id: "perk_t3_con", stat: "CON", name: "Unbreakable Crucible", forge: { conserve_bonus_pct: 50, fusion_safe_pct: 10 }, combat: { max_hp_pct: 15, mitigate_cap_pct: 60 }, desc: "-50% Bahan Hilang/-10% Gagal Fusi & +15% Max HP (Cap Mitigate 60%)" },
    INT: { id: "perk_t3_int", stat: "INT", name: "Runic Overdrive", forge: { fusion_weight_bonus: 20, rune_safe_pct: 10 }, combat: { trigger_power_pct: 20, weakness_bonus_pct: 15 }, desc: "+20 Bobot Mode Fusi & +20% Trigger Mastery / +15% Weakness Exploit" },
    WIS: { id: "perk_t3_wis", stat: "WIS", name: "Seeker's Eye", forge: { rare_trait_bonus_pct: 12 }, combat: { crit_chance_pct: 8, crit_dmg_pct: 25 }, desc: "+12% Peluang Trait Langka & +8% Crit Chance / +25% Crit Severity" },
    CHA: { id: "perk_t3_cha", stat: "CHA", name: "Sovereign Seal", forge: { sell_price_pct: 20, apprentice_rate_pct: 15 }, combat: { enemy_debuff_pct: 10, self_buff_power_pct: 20 }, desc: "+20% Harga Jual/+15% Laju Murid & -10% Dmg/Acc Musuh" }
  };

  const SMITH_PERKS_T5 = {
    "STR+DEX": { id: "perk_t5_str_dex", pair: "STR+DEX", stats: ["STR", "DEX"], name: "Venomed Blade", forge: { speed_acc_budget_pct: 10 }, combat: { skill_dmg_pct: 20, armor_pen_pct: 15 }, desc: "+20% Bleed/Poison DPS & -15% Armor Musuh" },
    "STR+CON": { id: "perk_t5_str_con", pair: "STR+CON", stats: ["STR", "CON"], name: "Colossus Might", forge: { quality_bonus: 12 }, combat: { hp_to_might_pct: 15, dmg_reduction_pct: 12 }, desc: "+15% CON ke Raw Might & +12% Damage Reduction" },
    "STR+INT": { id: "perk_t5_str_int", pair: "STR+INT", stats: ["STR", "INT"], name: "Spellforged Impact", forge: { fusion_weight_bonus: 25 }, combat: { skill_dmg_pct: 25, trigger_power_pct: 15 }, desc: "+25% Elemental-Physical Hybrid Dmg & +25 Bobot Fusi" },
    "STR+WIS": { id: "perk_t5_str_wis", pair: "STR+WIS", stats: ["STR", "WIS"], name: "Executioner's Verdict", forge: { rare_trait_bonus_pct: 12 }, combat: { crit_dmg_pct: 35, armor_pen_pct: 20 }, desc: "+35% Crit Damage & +20% Armor Pen" },
    "STR+CHA": { id: "perk_t5_str_cha", pair: "STR+CHA", stats: ["STR", "CHA"], name: "Warlord's Dreadblade", forge: { sell_price_pct: 20 }, combat: { skill_dmg_pct: 20, enemy_debuff_pct: 15 }, desc: "-15% Armor/Dmg Musuh & +20% Skill Active Damage" },
    "DEX+CON": { id: "perk_t5_dex_con", pair: "DEX+CON", stats: ["DEX", "CON"], name: "Mirage Bastion", forge: { conserve_bonus_pct: 35 }, combat: { dmg_reduction_pct: 15, max_hp_pct: 12 }, desc: "Pulihkan HP saat Dodge/Parry & +15% Mitigate Shield" },
    "DEX+INT": { id: "perk_t5_dex_int", pair: "DEX+INT", stats: ["DEX", "INT"], name: "Chrono Trigger", forge: { fusion_weight_bonus: 20 }, combat: { global_cdr_pct: 20, trigger_power_pct: 30 }, desc: "-20% Cooldown Seluruh Skill & +30% Weapon Trigger DPS" },
    "DEX+WIS": { id: "perk_t5_dex_wis", pair: "DEX+WIS", stats: ["DEX", "WIS"], name: "Phantom Deadeye", forge: { speed_acc_budget_pct: 12 }, combat: { lock_95_acc: true, crit_dmg_pct: 25 }, desc: "Akurasi Terkunci 95% (Abaikan Dodge) & +25% Crit Damage" },
    "DEX+CHA": { id: "perk_t5_dex_cha", pair: "DEX+CHA", stats: ["DEX", "CHA"], name: "Duelist's Encore", forge: { sell_price_pct: 15 }, combat: { attack_speed_pct: 18, skill_dmg_pct: 15 }, desc: "+18% Attack Speed & Double Strike setelah Skill Aktif" },
    "CON+INT": { id: "perk_t5_con_int", pair: "CON+INT", stats: ["CON", "INT"], name: "Aegis of the Runelord", forge: { fusion_safe_pct: 15 }, combat: { dmg_reduction_pct: 15, skill_dmg_pct: 18 }, desc: "-15% Semua Damage Masuk & Pantulkan 30% sebagai Elemen Weak" },
    "CON+WIS": { id: "perk_t5_con_wis", pair: "CON+WIS", stats: ["CON", "WIS"], name: "Immortal Foresight", forge: { quality_bonus: 15 }, combat: { max_hp_pct: 18, dmg_reduction_pct: 12 }, desc: "Regen 2% HP/dtk, Kebal Crit Lawan, & +15 Skor Kualitas Tempa" },
    "CON+CHA": { id: "perk_t5_con_cha", pair: "CON+CHA", stats: ["CON", "CHA"], name: "Citadel of Command", forge: { apprentice_rate_pct: 20 }, combat: { max_hp_pct: 20, dmg_reduction_pct: 15 }, desc: "+20% Max HP, +15% Damage Reduction, & Counter Defense" },
    "INT+WIS": { id: "perk_t5_int_wis", pair: "INT+WIS", stats: ["INT", "WIS"], name: "Omniscient Artificer", forge: { rare_trait_bonus_pct: 25 }, combat: { extra_macro_slot: 1, auto_match_weakness: true, weakness_bonus_pct: 30 }, desc: "+1 Slot Macro Ekstra, Auto-Weakness (+30% Elem), & +25% Trait Langka" },
    "INT+CHA": { id: "perk_t5_int_cha", pair: "INT+CHA", stats: ["INT", "CHA"], name: "Sovereign Runecaster", forge: { fusion_safe_pct: 25, fusion_weight_bonus: 25 }, combat: { cross_mod_bonus_pct: 25, skill_dmg_pct: 22 }, desc: "+25% Cross-Stat Mod, Risiko Gagal Fusi 2%, & +22% Dmg Hibrida" },
    "WIS+CHA": { id: "perk_t5_wis_cha", pair: "WIS+CHA", stats: ["WIS", "CHA"], name: "Grand Inquisitor's Grace", forge: { rare_trait_bonus_pct: 20 }, combat: { skill_dmg_pct: 25, crit_chance_pct: 10 }, desc: "Musuh Terima +25% Damage, +10% Crit Chance, & +25% Rare Drop" }
  };

  const RARITY_BUDGET_BONUS = {
    Common: 0,
    Uncommon: 10,
    Rare: 22,
    Epic: 36,
    Legendary: 52,
    Unique: 75
  };

  function normalizeSmithTiers(smithInput = {}) {
    const tiers = { Weaponsmith: 0, Armorer: 0, Rangesmith: 0, Runesmith: 0, Reforger: 0 };
    const src = smithInput?.tiers || (SMITH_CLASSES.some(c => smithInput && smithInput[c] !== undefined) ? smithInput : null);
    if (src) {
      for (const k of SMITH_CLASSES) {
        tiers[k] = Math.max(0, Math.min(5, +(src[k] || 0)));
      }
    } else {
      const pType = smithInput?.primaryType || "Weaponsmith";
      const pRank = Math.min(5, Math.max(1, +(smithInput?.primaryRank || 1)));
      tiers[pType] = pRank;
      if (smithInput?.secondaryType && smithInput?.secondaryRank > 0) {
        const sType = smithInput.secondaryType;
        tiers[sType] = Math.min(5 - pRank, Math.max(0, +(smithInput.secondaryRank || 0)));
      }
    }
    return tiers;
  }

  function sortActiveTiers(tiers, firstTakenClass = null) {
    return Object.entries(tiers)
      .filter(([, v]) => v > 0)
      .sort((a, b) => {
        if (b[1] !== a[1]) return b[1] - a[1];
        if (firstTakenClass) {
          if (a[0] === firstTakenClass) return -1;
          if (b[0] === firstTakenClass) return 1;
        }
        return SMITH_CLASSES.indexOf(a[0]) - SMITH_CLASSES.indexOf(b[0]);
      });
  }

  /**
   * 1. Hitung 60 Sub-Stat (10 per Stat Utama) dengan dukungan 2 Fokus Sub-Stat per Stat (+25%)
   */
  function computeSubStats(stats, focusSubStats = {}) {
    const result = {};
    const flatMap = {};
    const focusMult = skillData.focus_substat_multiplier || 1.25;

    for (const stat of STATS) {
      const statVal = stats[stat] || 1;
      const chosenFocus = (focusSubStats[stat] || []).slice(0, skillData.max_focus_per_stat || 2);
      result[stat] = [];

      for (const sub of skillData.sub_stats[stat]) {
        const isFocused = chosenFocus.includes(sub.id);
        const rawVal = statVal * sub.rate_per_point * (isFocused ? focusMult : 1.0);
        const value = sub.hard_cap ? Math.min(sub.hard_cap, +rawVal.toFixed(2)) : +rawVal.toFixed(2);
        const entry = {
          id: sub.id,
          name: sub.name,
          category: sub.category,
          unit: sub.unit,
          isFocused,
          rawValue: +rawVal.toFixed(2),
          value
        };
        result[stat].push(entry);
        flatMap[sub.id] = entry;
      }
    }
    return { byStat: result, byId: flatMap };
  }

  /**
   * 2. Hitung kapasitas slot Active Macro Bar dari Sub-Stat INT #6 (int_macro_capacity)
   */
  function getMacroSlotCapacity(subStatsById) {
    const score = subStatsById.int_macro_capacity ? subStatsById.int_macro_capacity.value : 1;
    for (const b of skillData.macro_capacity_brackets) {
      if (score >= b.min_effective_int && score <= b.max_effective_int) {
        return b.slots;
      }
    }
    return 3;
  }

  /**
   * 3. Evaluasi Title Stat (CD-2.02: Spesialis bila unggul >= 2 poin, atau Seimbang)
   */
  function evaluateTitle(stats) {
    const sorted = STATS.map(s => ({ stat: s, val: stats[s] || 1 })).sort((a, b) => b.val - a.val);
    if (sorted[0].val - sorted[1].val >= 2) {
      return { type: "Spesialis", primaryStat: sorted[0].stat, sameWeaponBonusPct: 5, otherWeaponPenaltyPct: -5 };
    }
    return { type: "Seimbang", primaryStat: null, sameWeaponBonusPct: 0, otherWeaponPenaltyPct: 0, crossBuffEfficiencyBonusPct: 10 };
  }

  /**
   * 3b. CD v3.3 — RF Classic "Use-to-Level" Skill Mastery (Lv.1 -> Lv.7 / GM)
   */
  function getSkillMasteryStage(xp = 0) {
    const safeXp = Math.max(0, Math.floor(xp || 0));
    let current = MASTERY_LEVELS[0];
    let nextReq = null;

    for (let i = 0; i < MASTERY_LEVELS.length; i++) {
      if (safeXp >= MASTERY_LEVELS[i].xp_req) {
        current = MASTERY_LEVELS[i];
        nextReq = MASTERY_LEVELS[i + 1] ? MASTERY_LEVELS[i + 1].xp_req : null;
      }
    }

    const progressToNextPct = nextReq === null
      ? 100
      : Math.min(100, +(((safeXp - current.xp_req) / Math.max(1, nextReq - current.xp_req)) * 100).toFixed(1));

    return {
      xp: safeXp,
      level: current.level,
      label: current.label,
      isGM: current.level >= 7,
      effectivenessBonusPct: current.effectiveness_bonus_pct,
      cdrPct: current.cdr_pct,
      corePassiveUnlocked: current.level >= 3,
      morphUnlocked: current.level >= 5,
      gmMorphPeakUnlocked: current.level >= 7,
      morphMultiplier: current.level >= 7 ? 1.25 : 1.0,
      nextLevelXpReq: nextReq,
      progressToNextPct
    };
  }

  function trainSkillMastery(masteryState = {}, skillId, uses = 1, xpPerUse = 1) {
    const nextState = { ...(masteryState || {}) };
    const prevXp = Math.max(0, Math.floor(nextState[skillId] || 0));
    const xpGained = Math.max(0, Math.round(uses * xpPerUse));
    const nextXp = prevXp + xpGained;
    nextState[skillId] = nextXp;

    const prevStage = getSkillMasteryStage(prevXp);
    const nextStage = getSkillMasteryStage(nextXp);
    const unlockedMilestones = [];
    if (!prevStage.corePassiveUnlocked && nextStage.corePassiveUnlocked) unlockedMilestones.push("core_passive");
    if (!prevStage.morphUnlocked && nextStage.morphUnlocked) unlockedMilestones.push("morph_choice");
    if (!prevStage.gmMorphPeakUnlocked && nextStage.gmMorphPeakUnlocked) unlockedMilestones.push("gm_morph_peak");

    return {
      masteryState: nextState,
      skillId,
      xpGained,
      prevStage,
      nextStage,
      leveledUp: nextStage.level > prevStage.level,
      unlockedMilestones
    };
  }

  function trainSkillsFromIdle(masteryState = {}, equippedSkillIds = [], weaponSkillId = null, idleHours = 1) {
    let curState = { ...(masteryState || {}) };
    const hours = Math.max(0, +(idleHours || 0));
    const skillGains = [];

    for (const skillId of equippedSkillIds) {
      const sk = activeMap.get(skillId);
      const cd = sk ? sk.cooldown_sec : 8;
      // Skill CD cepat maupun Class Buff/Ulti CD lama tetap naik seimbang saat Idle Battle 8 Jam
      const xpPerHour = Math.round(42 - Math.min(20, cd * 0.55));
      const xpGain = Math.max(1, Math.round(hours * xpPerHour));
      const res = trainSkillMastery(curState, skillId, xpGain, 1);
      curState = res.masteryState;
      skillGains.push({
        skillId,
        name: sk ? sk.name : skillId,
        xpGained: res.xpGained,
        from: res.prevStage.label,
        to: res.nextStage.label,
        unlockedMilestones: res.unlockedMilestones
      });
    }

    if (weaponSkillId) {
      const ws = weaponSkillById.get(weaponSkillId) || weaponSkillByWeaponId.get(weaponSkillId);
      const targetId = ws ? ws.id : weaponSkillId;
      const xpGain = Math.max(1, Math.round(hours * 35));
      const res = trainSkillMastery(curState, targetId, xpGain, 1);
      curState = res.masteryState;
      skillGains.push({
        skillId: targetId,
        name: ws ? ws.name : targetId,
        xpGained: res.xpGained,
        from: res.prevStage.label,
        to: res.nextStage.label,
        unlockedMilestones: res.unlockedMilestones
      });
    }

    return { masteryState: curState, idleHours: hours, skillGains };
  }

  /**
   * 3c. CD v3.3 — 29 Kartu Destiny ala Kingdoms of Amalur & Jalur Ganda Ganti Destiny
   */
  function getUnlockedDestinyCards(smithInput = {}, firstTakenClass = null) {
    const tiers = normalizeSmithTiers(smithInput);
    const activeEntries = sortActiveTiers(tiers, firstTakenClass || smithInput?.firstTakenClass);
    const activeCount = activeEntries.length;
    const totalPointsUsed = activeEntries.reduce((a, [, v]) => a + v, 0);
    const magicPts = (tiers.Runesmith || 0) + (tiers.Reforger || 0);
    const martialPts = (tiers.Weaponsmith || 0) + (tiers.Armorer || 0) + (tiers.Rangesmith || 0);
    const tieBreaker = firstTakenClass || smithInput?.firstTakenClass || null;

    const unlocked = [];

    for (const card of destinyMap.values()) {
      if (card.category === "pure") {
        const rank = tiers[card.smith_class] || 0;
        if (rank >= (card.req?.min_tier || 1)) {
          const effectivePassives = {};
          for (const [k, v] of Object.entries(card.passive_per_tier || {})) {
            effectivePassives[k] = v * rank;
          }
          unlocked.push({
            ...card,
            displayName: card.names_by_tier[Math.min(5, rank) - 1],
            tierRank: rank,
            signatureActive: rank >= 3,
            effectivePassives
          });
        }
      } else if (card.category === "dual") {
        const pRank = tiers[card.primary] || 0;
        const sRank = tiers[card.secondary] || 0;
        const meetsOrder = pRank > sRank || (pRank === sRank && (!tieBreaker || tieBreaker === card.primary));
        if (pRank >= 1 && sRank >= 1 && meetsOrder) {
          unlocked.push({
            ...card,
            displayName: card.name,
            tierRank: Math.min(5, pRank + sRank),
            signatureActive: true,
            effectivePassives: { ...(card.passive_bonus || {}) }
          });
        }
      } else if (card.category === "multi") {
        let qualifies = false;
        if (card.id === "Polymath") {
          qualifies = activeCount >= 3 && magicPts >= martialPts;
        } else if (card.id === "Arsenist") {
          qualifies = activeCount >= 3 && martialPts > magicPts;
        } else if (card.id === "Synthesist") {
          qualifies = activeCount >= 4;
        } else if (card.id === "Omnismith") {
          qualifies = activeCount >= 5;
        }
        if (qualifies) {
          unlocked.push({
            ...card,
            displayName: card.name,
            tierRank: Math.max(1, totalPointsUsed),
            signatureActive: true,
            effectivePassives: { ...(card.passive_bonus || {}) }
          });
        }
      }
    }

    return unlocked;
  }

  function resolveActiveDestinyCard(smithInput = {}, activeDestinyId = null, firstTakenClass = null) {
    const tiers = normalizeSmithTiers(smithInput);
    const tieBreaker = firstTakenClass || smithInput?.firstTakenClass || null;
    const activeEntries = sortActiveTiers(tiers, tieBreaker);
    const unlockedCards = getUnlockedDestinyCards(tiers, tieBreaker);

    let defaultCardId = null;
    if (activeEntries.length === 1) {
      defaultCardId = `pure_${activeEntries[0][0].toLowerCase()}`;
    } else if (activeEntries.length === 2) {
      defaultCardId = DUAL_CLASS_NAMES[`${activeEntries[0][0]}+${activeEntries[1][0]}`] || null;
    } else if (activeEntries.length === 3) {
      const magicPts = (tiers.Runesmith || 0) + (tiers.Reforger || 0);
      const martialPts = (tiers.Weaponsmith || 0) + (tiers.Armorer || 0) + (tiers.Rangesmith || 0);
      defaultCardId = magicPts >= martialPts ? "Polymath" : "Arsenist";
    } else if (activeEntries.length === 4) {
      defaultCardId = "Synthesist";
    } else if (activeEntries.length >= 5) {
      defaultCardId = "Omnismith";
    }

    const reqId = activeDestinyId || smithInput?.activeDestinyId || null;
    let activeCard = null;
    if (reqId) {
      activeCard = unlockedCards.find(c => c.id === reqId || c.displayName === reqId) || null;
    }
    if (!activeCard && defaultCardId) {
      activeCard = unlockedCards.find(c => c.id === defaultCardId || c.displayName === defaultCardId) || null;
    }
    if (!activeCard) {
      activeCard = unlockedCards[0] || null;
    }

    return {
      activeCard,
      defaultCardId,
      unlockedCards,
      isDefault: !reqId || (activeCard && activeCard.id === defaultCardId)
    };
  }

  function evaluateDestinySwitch({
    currentCardId = null,
    targetCardId,
    smithTiers = {},
    firstTakenClass = null,
    level = 1,
    method = "gold",
    trialCompleted = false,
    isFactionHostile = false,
    playerBronze = 0
  }) {
    const unlocked = getUnlockedDestinyCards(smithTiers, firstTakenClass);
    const targetCard = unlocked.find(c => c.id === targetCardId || c.displayName === targetCardId);

    if (!destinyMap.has(targetCardId) && !targetCard) {
      return { allowed: false, reason: "UNKNOWN_DESTINY_CARD", targetCardId, costBronze: 0 };
    }
    if (!targetCard) {
      return { allowed: false, reason: "DESTINY_LOCKED", targetCardId, costBronze: 0 };
    }
    if (currentCardId && (currentCardId === targetCard.id || currentCardId === targetCard.displayName)) {
      return { allowed: false, reason: "ALREADY_ACTIVE", targetCardId: targetCard.id, costBronze: 0 };
    }

    const tier = getTierForLevel(level);
    const rate = DESTINY_SWITCH_RULES.gold_per_level_tier_br || 500;
    const baseGoldCostBr = rate * level * tier;
    const hostileSurchargePct = isFactionHostile ? (DESTINY_SWITCH_RULES.hostile_syndicate_surcharge_pct || 50) : 0;
    const finalGoldCostBr = Math.round(baseGoldCostBr * (1 + hostileSurchargePct / 100));
    const broker = isFactionHostile
      ? (DESTINY_SWITCH_RULES.hostile_broker || "Shadow Syndicate")
      : (DESTINY_SWITCH_RULES.trial_guild || "Forgemasters' Guild");

    if (method === "trial") {
      if (isFactionHostile) {
        return {
          allowed: false,
          reason: "FACTION_HOSTILE_USE_SYNDICATE_GOLD",
          method: "trial",
          broker,
          alternativeGoldCostBr: finalGoldCostBr,
          hostileSurchargePct,
          costBronze: 0
        };
      }
      if (!trialCompleted) {
        return {
          allowed: false,
          reason: "TRIAL_NOT_COMPLETED",
          method: "trial",
          broker,
          trialOptions: DESTINY_SWITCH_RULES.trial_options,
          costBronze: 0
        };
      }
      return {
        allowed: true,
        reason: "OK_TRIAL",
        method: "trial",
        broker,
        costBronze: 0,
        newActiveDestinyId: targetCard.id,
        newActiveDestinyName: targetCard.displayName
      };
    }

    // Default: Jalur Bayar Instan (Gold Sink WD-5.10)
    if (playerBronze < finalGoldCostBr) {
      return {
        allowed: false,
        reason: "INSUFFICIENT_BRONZE",
        method: "gold",
        broker,
        level,
        tier,
        baseGoldCostBr,
        hostileSurchargePct,
        costBronze: finalGoldCostBr,
        shortfallBronze: finalGoldCostBr - playerBronze
      };
    }

    return {
      allowed: true,
      reason: isFactionHostile ? "OK_SYNDICATE_GOLD" : "OK_GUILD_GOLD",
      method: "gold",
      broker,
      level,
      tier,
      baseGoldCostBr,
      hostileSurchargePct,
      costBronze: finalGoldCostBr,
      remainingBronze: playerBronze - finalGoldCostBr,
      newActiveDestinyId: targetCard.id,
      newActiveDestinyName: targetCard.displayName
    };
  }

  /**
   * 4. Evaluasi Smith Class (Total 5 Poin Tingkat / 5 Tier, Nama Kelas 1 Kata CD-3.02b, 29 Kartu Destiny, & 21 Perk Smith CD-3.03)
   */
  function evaluateSmithMastery(stats, smithConfig = {}) {
    const tiers = normalizeSmithTiers(smithConfig);
    const activeEntries = sortActiveTiers(tiers, smithConfig.firstTakenClass);
    const totalPointsUsed = activeEntries.reduce((acc, [, v]) => acc + v, 0);
    const primaryType = activeEntries.length ? activeEntries[0][0] : "Weaponsmith";
    const primaryRank = activeEntries.length ? activeEntries[0][1] : 1;
    const secondaryType = activeEntries.length > 1 ? activeEntries[1][0] : null;
    const secondaryRank = activeEntries.length > 1 ? activeEntries[1][1] : 0;
    const isSpecialistSmith = activeEntries.length === 1 && primaryRank === 5;

    let singleWordClassName = "Apprentice";
    if (activeEntries.length === 1) {
      singleWordClassName = SINGLE_CLASS_NAMES[primaryType][Math.min(5, Math.max(1, primaryRank)) - 1];
    } else if (activeEntries.length === 2) {
      singleWordClassName = DUAL_CLASS_NAMES[`${primaryType}+${secondaryType}`] || "Hybrid";
    } else if (activeEntries.length === 3) {
      const magicPts = (tiers.Runesmith || 0) + (tiers.Reforger || 0);
      const martialPts = (tiers.Weaponsmith || 0) + (tiers.Armorer || 0) + (tiers.Rangesmith || 0);
      singleWordClassName = magicPts >= martialPts ? "Polymath" : "Arsenist";
    } else if (activeEntries.length === 4) {
      singleWordClassName = "Synthesist";
    } else if (activeEntries.length >= 5) {
      singleWordClassName = "Omnismith";
    }

    const destinyInfo = resolveActiveDestinyCard(tiers, smithConfig.activeDestinyId, smithConfig.firstTakenClass);
    const pData = skillData.smith_types[primaryType] || skillData.smith_types.Weaponsmith;
    const craftBonusPct = primaryRank * 6 + (totalPointsUsed - primaryRank) * 3;
    const classAffinityStats = SMITH_CLASS_AFFINITY[primaryType] || ["STR", "DEX"];

    // Evaluasi Kelayakan 21 Perk Smith (CD-3.03) + Bonus Afinitas +25% (x1.25)
    const eligibleSingleStatPerks = [];
    const eligibleHybridPairPerks = [];
    const eligiblePerksT3Details = [];
    const eligiblePerksT5Details = [];

    if (primaryRank >= 3) {
      for (const s of STATS) {
        if ((stats[s] || 1) >= 45) {
          eligibleSingleStatPerks.push(s);
          const pk = SMITH_PERKS_T3[s];
          const hasAffinity = classAffinityStats.includes(s);
          eligiblePerksT3Details.push({ ...pk, hasAffinity, affinityMult: hasAffinity ? 1.25 : 1.0 });
        }
      }
    }
    if (isSpecialistSmith) {
      for (let i = 0; i < STATS.length; i++) {
        for (let j = i + 1; j < STATS.length; j++) {
          const s1 = STATS[i], s2 = STATS[j];
          if ((stats[s1] || 1) >= 75 && (stats[s2] || 1) >= 75) {
            const pairKey = `${s1}+${s2}`;
            eligibleHybridPairPerks.push(pairKey);
            const pk = SMITH_PERKS_T5[pairKey];
            const hasAffinity = classAffinityStats.includes(s1) || classAffinityStats.includes(s2);
            eligiblePerksT5Details.push({ ...pk, hasAffinity, affinityMult: hasAffinity ? 1.25 : 1.0 });
          }
        }
      }
    }

    const activePerkT3 = eligiblePerksT3Details.find(p => p.stat === smithConfig.selectedPerkT3 || p.id === smithConfig.selectedPerkT3)
      || eligiblePerksT3Details[0] || null;
    const activePerkT5 = eligiblePerksT5Details.find(p => p.pair === smithConfig.selectedPerkT5 || p.id === smithConfig.selectedPerkT5)
      || eligiblePerksT5Details[0] || null;

    function checkWeaponCompatibility(weapon = {}, overrideDestinyCard = null) {
      const card = overrideDestinyCard || destinyInfo.activeCard;
      const matchingClasses = [];
      if (weapon.tag === "Jauh") matchingClasses.push("Rangesmith");
      else matchingClasses.push("Weaponsmith");

      if (weapon.stat === "CON") matchingClasses.push("Armorer");
      if (weapon.stat === "INT" || weapon.fused || weapon.hybridFusion) matchingClasses.push("Runesmith");
      if (weapon.stat === "CHA" || weapon.stat === "WIS" || (weapon.enhancePlus || 0) > 0) matchingClasses.push("Reforger");

      let bestRank = 0;
      let matchedClass = null;
      for (const c of matchingClasses) {
        if ((tiers[c] || 0) > bestRank) {
          bestRank = tiers[c];
          matchedClass = c;
        }
      }

      if (card?.signature?.effect?.unlock_all_48_weapons) {
        return {
          isCompatible: true,
          matchedClass: matchedClass || "Omnismith",
          masteryRank: Math.max(2, bestRank),
          masteryBonusPct: Math.max(12, bestRank * 6),
          triggerUnlocked: true,
          unlockedByOmnismith: true
        };
      }

      return {
        isCompatible: bestRank >= 1,
        matchedClass,
        masteryRank: bestRank,
        masteryBonusPct: bestRank >= 1 ? bestRank * 6 : -25,
        triggerUnlocked: bestRank >= 1,
        unlockedByOmnismith: false
      };
    }

    return {
      singleWordClassName,
      titlePrefix: singleWordClassName,
      tiers,
      totalPointsUsed,
      primaryType,
      primaryRank,
      secondaryType,
      secondaryRank,
      isSpecialistSmith,
      craftBonusPct,
      classAffinityStats,
      synergy: pData.skill_synergy,
      activeDestinyCard: destinyInfo.activeCard,
      unlockedDestinyCards: destinyInfo.unlockedCards,
      eligibleSingleStatPerks,
      eligibleHybridPairPerks,
      eligiblePerksT3Details,
      eligiblePerksT5Details,
      activePerkT3,
      activePerkT5,
      checkWeaponCompatibility
    };
  }

  /**
   * 4b. CD v3.3 — 1 Slot Khusus Weapon Skill [W] (48 Jurus Senjata Aktif CD-4.01)
   */
  function resolveWeaponSkill(weapon = {}, smithMastery, skillMasteryState = null, activeDestinyCard = null) {
    if (!weapon) return null;
    const lookupId = weapon.id || weapon.baseWeaponId || null;
    const lookupTrigger = weapon.trigger || weapon.triggerName || null;
    let baseWs = lookupId ? weaponSkillByWeaponId.get(lookupId) : null;
    if (!baseWs && lookupTrigger) {
      baseWs = weaponSkillByTrigger.get(String(lookupTrigger).toLowerCase()) || null;
    }
    if (!baseWs) {
      const isRanged = weapon.tag === "Jauh";
      baseWs = {
        id: lookupId ? `wsk_${lookupId}` : "wsk_custom",
        weapon_id: lookupId || "custom",
        weapon_name: weapon.name || `Senjata ${weapon.stat || "STR"} T${weapon.tier || 1}`,
        name: lookupTrigger || "Forge Strike",
        stat: weapon.stat || "STR",
        tier: weapon.tier || 1,
        tag: weapon.tag || "Dekat",
        cooldown_sec: weapon.stat === "DEX" ? 6.0 : (weapon.stat === "CON" ? 7.5 : 6.5),
        base_multiplier: +(1.35 + ((weapon.tier || 1) - 1) * 0.08).toFixed(2),
        role: "Weapon Skill [W]",
        governing_smith: isRanged ? "Rangesmith" : (weapon.stat === "CON" ? "Armorer" : (weapon.stat === "INT" ? "Runesmith" : "Weaponsmith")),
        desc: `Jurus Senjata Aktif [W]: ${lookupTrigger || "Forge Strike"}.`
      };
    }

    const compat = smithMastery
      ? smithMastery.checkWeaponCompatibility(weapon, activeDestinyCard)
      : { triggerUnlocked: true, unlockedByOmnismith: false };

    const unlocked = !!compat.triggerUnlocked;
    const rawXp = skillMasteryState === null || skillMasteryState === undefined
      ? 190
      : (skillMasteryState[baseWs.id] || 0);
    const mastery = getSkillMasteryStage(rawXp);
    const effectiveCooldownSec = Math.max(GCD_SEC, +(baseWs.cooldown_sec * (1 - mastery.cdrPct / 100)).toFixed(2));
    const effectiveMultiplier = +(baseWs.base_multiplier * (1 + mastery.effectivenessBonusPct / 100)).toFixed(3);

    return {
      ...baseWs,
      unlocked,
      unlockedByOmnismith: !!compat.unlockedByOmnismith,
      mastery,
      effectiveCooldownSec,
      effectiveMultiplier
    };
  }

  /**
   * 5. Dapatkan Active/Buff Skills, Core Passives (buka Lv.3), dan Morph 1-dari-3 (buka Lv.5, Puncak GM)
   *    dari 5 Pohon Skill Tipe Smith sesuai sebaran 5 Poin Tier Smith & RF Classic Mastery!
   */
  function getUnlockedNodes(stats, selectedMorphs = {}, smithConfig = {}, skillMasteryState = null) {
    const tiers = normalizeSmithTiers(smithConfig);
    const activeEntries = sortActiveTiers(tiers, smithConfig?.firstTakenClass);
    const isPure5 = activeEntries.length === 1 && activeEntries[0][1] === 5;
    const assumeTrained = skillMasteryState === null || skillMasteryState === undefined;

    const unlockedActives = [];
    const unlockedPassives = [];
    const unlockedMorphs = [];

    for (const cls of SMITH_CLASSES) {
      const classRank = tiers[cls] || 0;
      if (classRank <= 0) continue;
      const tree = skillData.smith_skill_trees?.[cls];
      if (!tree) continue;

      for (const t of tree.tiers) {
        if (t.tier > classRank) continue;
        if (t.pure_only && !isPure5) continue;

        const skillId = t.active_skill.id;
        const xp = assumeTrained ? 190 : (skillMasteryState[skillId] || 0);
        const mastery = getSkillMasteryStage(xp);

        unlockedActives.push({
          ...t.active_skill,
          smithClass: cls,
          tier: t.tier,
          rankLabel: t.rank_label,
          pureOnly: !!t.pure_only,
          resource: tree.resource,
          mastery
        });

        if (mastery.corePassiveUnlocked) {
          unlockedPassives.push({
            ...t.core_passive,
            smithClass: cls,
            tier: t.tier,
            activeSkillId: skillId,
            masteryLevel: mastery.level
          });
        }

        if (mastery.morphUnlocked) {
          const pickedId = selectedMorphs?.[`${cls}_T${t.tier}`]
            || selectedMorphs?.[skillId]
            || null;
          const picked = t.morph_choices.find(m => m.id === pickedId) || t.morph_choices[0];
          unlockedMorphs.push({
            ...picked,
            smithClass: cls,
            tier: t.tier,
            activeSkillId: skillId,
            isGmPeak: mastery.gmMorphPeakUnlocked,
            morphMultiplier: mastery.morphMultiplier
          });
        }
      }
    }

    return {
      unlockedPassives,
      unlockedMorphs,
      unlockedUtilities: unlockedMorphs, // alias backward-compatible
      unlockedActives
    };
  }

  /**
   * 6. Validasi & Rakit Active Macro Loadout v3.3:
   *    3-6 Slot Class Skills (dari INT Macro Capacity + Polymath/Omniscient) + 1 Slot Khusus Weapon Skill [W]
   *    + Kartu Destiny Aktif + RF Classic Mastery (Lv.1-GM) + Anti-Spam GCD (1.3d)
   */
  function buildMacroLoadout({
    stats,
    focusSubStats = {},
    selectedMorphs = null,
    selectedUtilities = {},
    loadout = [],
    smithConfig = {},
    skillMasteryState = null,
    activeDestinyId = null,
    weapon = null
  }) {
    const morphChoicesMap = selectedMorphs || selectedUtilities || {};
    const subStats = computeSubStats(stats, focusSubStats);
    const mergedSmithConfig = {
      ...smithConfig,
      activeDestinyId: activeDestinyId || smithConfig.activeDestinyId || null
    };
    const smith = evaluateSmithMastery(stats, mergedSmithConfig);
    const activeDestinyCard = smith.activeDestinyCard;

    const baseSlots = getMacroSlotCapacity(subStats.byId);
    const destinyExtraSlot = activeDestinyCard?.signature?.effect?.extra_macro_slot || 0;
    const perkExtraSlot = smith.activePerkT5?.combat?.extra_macro_slot || 0;
    const maxSlots = baseSlots + destinyExtraSlot + perkExtraSlot;

    const unlocked = getUnlockedNodes(stats, morphChoicesMap, mergedSmithConfig, skillMasteryState);
    const unlockedActiveMap = new Map(unlocked.unlockedActives.map(a => [a.id, a]));
    const unlockedMorphBySkillId = new Map(unlocked.unlockedMorphs.map(m => [m.activeSkillId, m]));

    // Agregasi pasif global dari Core Passives (Lv.3+) + Kartu Destiny Aktif + Perk Smith
    const passiveTotals = {
      dmg_pct: 0,
      armor_pen_pct: 0,
      attack_speed_pct: 0,
      accuracy_pct: 0,
      parry_pct: 0,
      dodge_pct: 0,
      max_hp_pct: 0,
      dmg_reduction_pct: 0,
      elemental_dmg_pct: 0,
      weakness_bonus_pct: 0,
      trigger_power_pct: 0,
      crit_chance_pct: 0,
      crit_dmg_pct: 0,
      enemy_dmg_debuff_pct: 0,
      global_cdr_pct: 0,
      companion_assist_pct: 0,
      elem_resist_pct: 0,
      mitigate_cap_pct: 50,
      resource_max_bonus: 0,
      remove_ranged_dmg_penalty: false,
      ignore_same_element_penalty: false,
      overclock_on_rotation: false,
      auto_match_weakness: false
    };

    function mergeBonusMap(src, scale = 1.0) {
      if (!src) return;
      for (const [k, v] of Object.entries(src)) {
        if (k === "mitigate_cap_pct" && typeof v === "number") {
          passiveTotals.mitigate_cap_pct = Math.max(passiveTotals.mitigate_cap_pct, v);
        } else if (typeof v === "boolean" && passiveTotals[k] !== undefined) {
          passiveTotals[k] = passiveTotals[k] || v;
        } else if (typeof v === "number" && passiveTotals[k] !== undefined) {
          passiveTotals[k] = +(passiveTotals[k] + v * scale).toFixed(2);
        }
      }
    }

    for (const p of unlocked.unlockedPassives) {
      mergeBonusMap(p.effect, 1.0);
    }
    if (activeDestinyCard?.effectivePassives) {
      mergeBonusMap(activeDestinyCard.effectivePassives, 1.0);
    }
    if (smith.activePerkT3?.combat) {
      mergeBonusMap(smith.activePerkT3.combat, smith.activePerkT3.affinityMult * 0.5);
    }
    if (smith.activePerkT5?.combat) {
      mergeBonusMap(smith.activePerkT5.combat, smith.activePerkT5.affinityMult * 0.5);
    }

    // Global Cooldown Recovery (Reforger + WIS Tactical Rhythm + Destiny/Passive CDR)
    const globalCdrPct = passiveTotals.global_cdr_pct
      + (smith.tiers.Reforger || 0) * 2.0
      + (subStats.byId.wis_tactical_rhythm ? subStats.byId.wis_tactical_rhythm.value * 0.4 : 0);

    // Normalisasi input loadout: terima format v3.3 ({ activeId } atau string ID),
    // atau auto-mapping cerdas jika kosong / menerima ID legacy v3.2 (str_t1_a, int_t1_a, dst.)
    const requestedIds = [];
    for (const entry of (loadout || [])) {
      const id = typeof entry === "string" ? entry : entry?.activeId;
      if (id && unlockedActiveMap.has(id) && !requestedIds.includes(id)) {
        requestedIds.push(id);
      }
    }

    let loadoutAutoMapped = false;
    let finalIds = requestedIds.slice(0, maxSlots);
    if (finalIds.length === 0 && unlocked.unlockedActives.length > 0) {
      loadoutAutoMapped = true;
      // Urutkan prioritas rotasi ideal lintas Class terbuka: Buff (T2) -> Apex (T5) -> Combo (T4) -> Opener (T1) -> Interrupt (T3)
      const tierPriority = { 2: 1, 5: 2, 4: 3, 1: 4, 3: 5 };
      const sortedActives = [...unlocked.unlockedActives].sort((a, b) => {
        const pa = tierPriority[a.tier] || 9;
        const pb = tierPriority[b.tier] || 9;
        if (pa !== pb) return pa - pb;
        return (smith.tiers[b.smithClass] || 0) - (smith.tiers[a.smithClass] || 0);
      });
      finalIds = sortedActives.slice(0, maxSlots).map(a => a.id);
    }

    const equippedSkills = [];
    for (const activeId of finalIds) {
      const baseSkill = unlockedActiveMap.get(activeId);
      if (!baseSkill) continue;
      const activeMorph = unlockedMorphBySkillId.get(activeId) || null;
      const morphMult = activeMorph ? activeMorph.morphMultiplier : 1.0;

      const combinedMorphEffect = {
        skill_dmg_pct: 0,
        bleed_dmg_pct: 0,
        armor_pen_pct: 0,
        crit_chance_pct: 0,
        crit_dmg_pct: 0,
        cooldown_reduction_sec: 0,
        dmg_reduction_pct: 0,
        heal_on_cast_pct: 0,
        trigger_power_pct: 0,
        elemental_dmg_pct: 0,
        weakness_bonus_pct: 0,
        companion_assist_pct: 0,
        dmg_pct_per_enhance: 0,
        auto_match_weakness: false,
        reset_weapon_skill_cd: false,
        free_weapon_trigger_at_stacks: 0
      };

      if (activeMorph?.effect) {
        for (const [k, v] of Object.entries(activeMorph.effect)) {
          if (typeof v === "boolean") {
            combinedMorphEffect[k] = combinedMorphEffect[k] || v;
          } else if (typeof v === "number" && combinedMorphEffect[k] !== undefined) {
            combinedMorphEffect[k] = +(combinedMorphEffect[k] + v * morphMult).toFixed(2);
          }
        }
      }

      const mastery = baseSkill.mastery;
      const rawCd = Math.max(2, baseSkill.cooldown_sec - combinedMorphEffect.cooldown_reduction_sec);
      const afterMasteryCd = rawCd * (1 - mastery.cdrPct / 100);
      const effectiveCd = Math.max(GCD_SEC, +(afterMasteryCd * (1 - Math.min(0.45, globalCdrPct / 100))).toFixed(2));

      equippedSkills.push({
        ...baseSkill,
        finalElement: baseSkill.element || "Neutral",
        effectiveCooldownSec: effectiveCd,
        activeMorph,
        appliedMods: activeMorph ? [{ id: activeMorph.id, name: activeMorph.name, branch: activeMorph.branch, isGmPeak: activeMorph.isGmPeak }] : [],
        combinedModEffect: combinedMorphEffect
      });
    }

    const weaponSkill = weapon
      ? resolveWeaponSkill(weapon, smith, skillMasteryState, activeDestinyCard)
      : null;

    return {
      maxSlots,
      gcdSec: GCD_SEC,
      subStats,
      title: evaluateTitle(stats),
      smith,
      activeDestinyCard,
      unlockedDestinyCards: smith.unlockedDestinyCards,
      passiveTotals,
      unlockedCount: {
        passives: unlocked.unlockedPassives.length,
        morphs: unlocked.unlockedMorphs.length,
        utilities: unlocked.unlockedMorphs.length,
        actives: unlocked.unlockedActives.length
      },
      equippedSkills,
      weaponSkill,
      loadoutAutoMapped
    };
  }

  /**
   * CD-1.08: Anti-Farm XP & Drop Multipliers (Skala Lv1-150, LOCKED)
   */
  function computeAntiFarmMultipliers(playerLevel, monsterLevel, wisRareDropBonusPct = 0) {
    const delta = monsterLevel - playerLevel;
    let xpMult = 1.0;
    let dropMult = 1.0;

    if (delta >= 5) {
      xpMult = 1.25;
      dropMult = 1.15;
    } else if (delta >= -5) {
      xpMult = 1.0;
      dropMult = 1.0;
    } else if (delta >= -15) {
      const stepsBelow = Math.abs(delta + 5); // 1..10
      xpMult = Math.max(0.20, +(1.0 - 0.08 * stepsBelow).toFixed(2));
      dropMult = Math.max(0.50, +(1.0 - 0.05 * stepsBelow).toFixed(2));
    } else {
      xpMult = 0.0;
      dropMult = 0.25;
    }

    const effectiveDropMult = +(dropMult * (1 + wisRareDropBonusPct / 100)).toFixed(3);
    return { delta, xpMult, baseDropMult: dropMult, effectiveDropMult };
  }

  /**
   * CD-4.02 & CD-4.03: Rumus Enhance +N Tanpa Batas Seimbang (Gabungan Opsi A + C) & Anggaran Rarity
   */
  function computeWeaponEnhancement(plusLevel = 0, isUnique = false, strEnhancePowerPct = 0, reforgerTier = 0) {
    const n = Math.max(0, Math.floor(plusLevel));
    let bonusPct = 0;
    let phase = "Base (+0)";
    let baseSuccessRatePct = 100;
    let overforgeTriggerBonusPct = 0;

    if (n > 0) {
      const p1 = Math.min(5, n);
      bonusPct += p1 * 4;
      phase = isUnique ? "Resonance I-II" : "Fase 1: Tempa Stabil (+1..+5)";
      baseSuccessRatePct = 100 - (p1 - 1) * 5;
    }
    if (n > 5) {
      const p2 = Math.min(5, n - 5);
      bonusPct += p2 * 7;
      phase = isUnique ? "Resonance III-IV" : "Fase 2: Tempa Panas (+6..+10)";
      baseSuccessRatePct = 70 - (p2 - 1) * 7.5;
    }
    if (n > 10) {
      const p3 = Math.min(5, n - 10);
      bonusPct += p3 * 12;
      phase = isUnique ? "Resonance V (Apex)" : "Fase 3: Masterwork Overforge (+11..+15)";
      baseSuccessRatePct = 30 - (p3 - 1) * 5;
      if (n >= 15) overforgeTriggerBonusPct += 15;
    }
    if (n > 15) {
      const extra = n - 15;
      const logBonus = 45 * Math.log(1 + extra * 0.5);
      bonusPct += logBonus;
      overforgeTriggerBonusPct += extra * 1.0;
      phase = isUnique ? `Transcendent Resonance (+${n})` : `Fase 4: Transcendent Infinite (+${n})`;
      baseSuccessRatePct = Math.max(5, +(10 / (1 + 0.15 * extra)).toFixed(2));
    }

    const effectiveSuccessRatePct = isUnique
      ? 100
      : Math.min(95, +(baseSuccessRatePct + strEnhancePowerPct * 0.25 + reforgerTier * 3).toFixed(2));

    return {
      plusLevel: n,
      isUnique,
      phase,
      powerBonusPct: +bonusPct.toFixed(2),
      powerMultiplier: +(1 + bonusPct / 100).toFixed(4),
      overforgeTriggerBonusPct: +overforgeTriggerBonusPct.toFixed(2),
      effectiveSuccessRatePct,
      canBreakWeapon: false,
      minCheckpoint: n >= 15 ? 15 : (n >= 5 ? 5 : 0)
    };
  }

  /**
   * CD-6.02: Generator Seed Murid Prosedural & AI Autonomous Style (terhubung ke 5 Smith Skill Trees & Kartu Destiny v3.3)
   */
  function generateApprenticeFromSeed(seedString = "APR-7F3A-Kael", currentSkill = 45, passedTrials = 0) {
    let hash = 2166136261;
    for (let i = 0; i < seedString.length; i++) {
      hash ^= seedString.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    const nextRand = () => {
      hash ^= hash << 13;
      hash ^= hash >>> 17;
      hash ^= hash << 5;
      return ((hash >>> 0) % 10000) / 10000;
    };

    const BACKGROUNDS = [
      { name: "Pandai Besi", stats: ["STR", "CON", "INT"] },
      { name: "Pemburu", stats: ["DEX", "CON", "WIS"] },
      { name: "Pedagang", stats: ["CHA", "INT", "WIS"] },
      { name: "Prajurit", stats: ["STR", "DEX", "CON"] },
      { name: "Pelajar", stats: ["INT", "WIS", "CHA"] },
      { name: "Pengembara", stats: ["STR", "DEX", "CHA"] }
    ];

    const baseTalent = Math.floor(45 + nextRand() * 50);
    const learningRate = Math.floor(45 + nextRand() * 50);
    const baseLoyalty = Math.floor(55 + nextRand() * 35);
    const bg = BACKGROUNDS[Math.floor(nextRand() * BACKGROUNDS.length)];

    const trials = Math.max(0, Math.min(2, passedTrials));
    const talentCap = Math.min(100, baseTalent + trials * 15);
    const loyalty = Math.min(100, baseLoyalty + trials * 10);
    const effectiveSkill = Math.min(talentCap, Math.max(0, currentSkill));

    const maxTierPts = effectiveSkill >= 80 && trials >= 2 ? 5 : effectiveSkill >= 50 && trials >= 1 ? 3 : Math.max(1, Math.ceil(effectiveSkill / 25));
    const primarySmith = SMITH_CLASSES[Math.floor(nextRand() * SMITH_CLASSES.length)];
    let secondarySmith = SMITH_CLASSES[Math.floor(nextRand() * SMITH_CLASSES.length)];
    if (secondarySmith === primarySmith) secondarySmith = SMITH_CLASSES[(SMITH_CLASSES.indexOf(primarySmith) + 1) % 5];

    const styleRoll = nextRand();
    const smithTiers = { Weaponsmith: 0, Armorer: 0, Rangesmith: 0, Runesmith: 0, Reforger: 0 };
    if (styleRoll < 0.45) {
      smithTiers[primarySmith] = maxTierPts;
    } else if (styleRoll < 0.85 && maxTierPts >= 2) {
      const pPts = Math.ceil(maxTierPts * 0.6);
      smithTiers[primarySmith] = pPts;
      smithTiers[secondarySmith] = maxTierPts - pPts;
    } else {
      for (let i = 0; i < maxTierPts; i++) {
        const c = SMITH_CLASSES[i % 5];
        smithTiers[c] += 1;
      }
    }

    const apprenticeStats = { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 };
    for (const s of STATS) {
      const isBg = bg.stats.includes(s);
      const weight = isBg ? 1.15 : 0.65;
      apprenticeStats[s] = Math.max(5, Math.round(10 + effectiveSkill * weight * (0.85 + nextRand() * 0.3)));
    }

    const smithEval = evaluateSmithMastery(apprenticeStats, { tiers: smithTiers, firstTakenClass: primarySmith });
    const unlockedForAi = getUnlockedNodes(apprenticeStats, {}, { tiers: smithTiers, firstTakenClass: primarySmith }, null);
    const aiSkills = unlockedForAi.unlockedActives.slice(0, Math.min(4, unlockedForAi.unlockedActives.length)).map(s => s.name);

    const assistDamagePctPerStrike = +(15 + 0.35 * effectiveSkill).toFixed(2);
    const passiveAura = {
      Weaponsmith: { attack_speed_pct: 10, accuracy_pct: 10, label: "+10% Atk Speed & Accuracy" },
      Rangesmith:  { attack_speed_pct: 10, accuracy_pct: 10, label: "+10% Atk Speed & Ranged Draw" },
      Armorer:     { dmg_reduction_pct: 12, emergency_shield: true, label: "+12% Mitigate & Perisai Darurat" },
      Runesmith:   { trigger_power_pct: 15, elemental_dmg_pct: 15, label: "+15% Elemental & Trigger Dmg" },
      Reforger:    { drop_bonus_pct: 15, stamina_save_pct: 15, label: "+15% Drop Bahan & Efisiensi Stamina" }
    }[smithEval.primaryType];

    const canManageBranchShop = effectiveSkill >= 60 && loyalty >= 70 && trials >= 1;

    return {
      seed: seedString,
      background: bg.name,
      baseTalent,
      talentCap,
      learningRate,
      loyalty,
      effectiveSkill,
      passedTrials: trials,
      smithClass: smithEval.singleWordClassName,
      destinyCard: smithEval.activeDestinyCard?.displayName || smithEval.singleWordClassName,
      primarySmithType: smithEval.primaryType,
      smithTiers,
      stats: apprenticeStats,
      aiCombatSkills: aiSkills,
      assistDamagePctPerStrike,
      passiveAura,
      canManageBranchShop
    };
  }

  /**
   * CD-7.01, CD-7.02, & CD-7.03: Skala Kutukan Gate, Penalti Mati Reguler, & Biaya Long Rest (Skala Lv1-150)
   */
  function computeGateCurseAndRest({ level = 30, gateTier = 1, activeCurseStacks = 1, atOwnWorkshopOrBranch = false, conCurseResistPct = 0 }) {
    const playerTier = getTierForLevel(level);
    const gTier = Math.min(5, Math.max(1, gateTier));
    const resistFactor = 1 - Math.min(0.35, conCurseResistPct / 100);

    const maxStatDebuffPerCurse = -Math.round(4 * gTier * resistFactor);
    const incapacitateThreshold = 13 * gTier;
    const currentTotalDebuff = Math.abs(maxStatDebuffPerCurse) * activeCurseStacks;
    const isIncapacitated = currentTotalDebuff >= incapacitateThreshold;

    const baseRestCostBr = atOwnWorkshopOrBranch ? 0 : 20 * level * playerTier;
    const curseCleanseCostBr = activeCurseStacks * (30 * level * gTier);
    const totalLongRestCostBr = baseRestCostBr + curseCleanseCostBr;

    return {
      playerTier,
      gateTier: gTier,
      maxStatDebuffPerCurse,
      incapacitateThreshold,
      currentTotalDebuff,
      isIncapacitated,
      regularDeathPenalty: {
        staminaRemaining: 0,
        crossBuffChargeLostPct: 25,
        xpLost: 0,
        appliesGateCurse: false
      },
      longRest: {
        atOwnWorkshopOrBranch,
        baseRestCostBr,
        curseCleanseCostBr,
        totalLongRestCostBr
      }
    };
  }

  /**
   * 7. Simulasi Pertempuran CD v3.3:
   *    - Anti-Spam GCD (1.3d) + Cooldown Individual + Dedicated Weapon Skill [W]
   *    - RF Classic Class Buffs + Skill Mastery (Lv.1-GM) + Skill Uses Delta
   *    - 5 Smith Resources (Forge Heat, Bastion Guard, Hunter's Mark, Elemental Charge + Hybrid Fusion, Overclock)
   *    - Efek Signature 29 Kartu Destiny (Spellblade, Omnismith, Chronosmith, Archblade, Aegisborn, dll.)
   */
  function simulateBattle({
    level = 30,
    stats = { STR: 30, DEX: 15, CON: 20, INT: 10, WIS: 10, CHA: 10 },
    focusSubStats = {},
    selectedMorphs = null,
    selectedUtilities = {},
    loadout = [],
    smithConfig = { primaryType: "Weaponsmith", primaryRank: 1 },
    skillMasteryState = null,
    activeDestinyId = null,
    weapon = { id: "w_str_1", stat: "STR", tier: 1, rarity: "Common", enhancePlus: 0, tag: "Dekat", trigger: "Twister", element: "Neutral", budget: { damage: 35, speed: 15, accuracy: 15, defense: 5, trigger: 30 } },
    armorClass = "sedang",
    armorElement = "Fire",
    armorSlotsSameElement = 5,
    apprenticeSeed = null,
    apprenticeSkill = 60,
    apprenticeTrials = 1,
    wdEnemy = { name: "Ashwind Brute", lvl: 30, role: "Brute", type: "Reguler", el: "Fire", weak: "Ice" },
    maxSeconds = 120
  }) {
    const tier = getTierForLevel(level);
    const build = buildMacroLoadout({
      stats,
      focusSubStats,
      selectedMorphs,
      selectedUtilities,
      loadout,
      smithConfig,
      skillMasteryState,
      activeDestinyId,
      weapon
    });
    const sub = build.subStats.byId;
    const pas = build.passiveTotals;
    const monster = computeMonsterStats(wdEnemy);
    const destiny = build.activeDestinyCard;
    const destSig = (destiny && destiny.signatureActive && destiny.signature?.effect) ? destiny.signature.effect : {};

    const companion = apprenticeSeed
      ? generateApprenticeFromSeed(apprenticeSeed, apprenticeSkill, apprenticeTrials)
      : null;
    const companionAura = companion ? companion.passiveAura : {};
    const leadershipMult = 1 + (sub.cha_apprentice_lead ? sub.cha_apprentice_lead.value : 0) / 100;

    // HP Pemain = (20 + 5 * CON + 5 * tier) * (1 + max_hp_pct)
    const baseHp = 20 + sub.con_max_vitality.value + 5 * tier;
    const maxPlayerHp = Math.round(baseHp * (1 + pas.max_hp_pct / 100));

    // Anggaran poin senjata (CD-4.03 LOCKED) = 100 + 20 * (weapon.tier - 1) + Bonus_Rarity
    const rarityBonus = RARITY_BUDGET_BONUS[weapon.rarity || "Common"] || 0;
    const totalBudget = 100 + 20 * ((weapon.tier || tier) - 1) + rarityBonus;
    const enh = computeWeaponEnhancement(
      weapon.enhancePlus || 0,
      weapon.rarity === "Unique",
      sub.str_enhance_power ? sub.str_enhance_power.value : 0,
      build.smith.tiers.Reforger || 0
    );

    const wDmgPoints = totalBudget * ((weapon.budget?.damage || 30) / 100);
    const wSpdPoints = totalBudget * ((weapon.budget?.speed || 15) / 100);
    const wAccPoints = totalBudget * ((weapon.budget?.accuracy || 15) / 100);
    const wDefPoints = totalBudget * ((weapon.budget?.defense || 10) / 100);
    const wTrgPoints = totalBudget * ((weapon.budget?.trigger || 25) / 100);

    const weaponBaseDmg = (wDmgPoints / 4) * enh.powerMultiplier;
    const isRanged = weapon.tag === "Jauh";

    const compat = build.smith.checkWeaponCompatibility(weapon, destiny);
    const masteryMult = 1 + compat.masteryBonusPct / 100;

    // Trigger senjata (CD-4.03 LOCKED)
    const mainStatVal = stats[weapon.stat] || 10;
    const baseTriggerMult = compat.triggerUnlocked
      ? (1 + (sub.int_trigger_mastery.value + pas.trigger_power_pct + enh.overforgeTriggerBonusPct + (companionAura.trigger_power_pct || 0)) / 100)
      : 0;
    const effectiveTrigger = wTrgPoints * 0.8 * (1 + 0.015 * mainStatVal) * baseTriggerMult * enh.powerMultiplier;
    const conGuardDmgBonus = (weapon.stat === "CON" || (build.smith.tiers.Armorer || 0) >= 1) ? (stats.CON || 10) * 0.15 : 0;
    const triggerDmgBonus = ["STR", "DEX", "INT", "WIS"].includes(weapon.stat)
      ? effectiveTrigger / 4
      : weapon.stat === "CHA" ? effectiveTrigger / 5 : conGuardDmgBonus;
    const triggerDefPct = weapon.stat === "CON" ? effectiveTrigger / 2 : weapon.stat === "CHA" ? effectiveTrigger / 3 : 0;

    const titleHitBonus = build.title.type === "Spesialis"
      ? (build.title.primaryStat === weapon.stat ? 5 : -5)
      : 0;

    // Resource Caps
    const forgeHeatMax = 5 + (pas.resource_max_bonus || 0);
    const resources = {
      forge_heat: destSig.min_forge_heat ? 1 : 0,
      bastion_guard: 0,
      hunters_mark: 0,
      elemental_charge: 0,
      overclock: 0
    };
    const resourceCaps = {
      forge_heat: forgeHeatMax,
      bastion_guard: 5,
      hunters_mark: 5,
      elemental_charge: 3,
      overclock: 5
    };

    const unlockedClassResources = [];
    for (const cls of SMITH_CLASSES) {
      if ((build.smith.tiers[cls] || 0) > 0 && skillData.smith_skill_trees?.[cls]?.resource?.id) {
        unlockedClassResources.push(skillData.smith_skill_trees[cls].resource.id);
      }
    }

    let synthesistEchoCounter = 0;
    let polymathStacks = 0;

    function addResource(resId, amount) {
      if (!resId || !amount || resources[resId] === undefined) return;
      const before = resources[resId];
      resources[resId] = Math.min(resourceCaps[resId], before + amount);
      if (resources[resId] > before) {
        if (destSig.polymath_stack_pct && (resId === "elemental_charge" || resId === "overclock")) {
          polymathStacks = Math.min(3, polymathStacks + 1);
        }
        if (destSig.cross_resource_share_chance_pct && unlockedClassResources.length > 1) {
          synthesistEchoCounter++;
          if (synthesistEchoCounter % 2 === 0) {
            const other = unlockedClassResources.find(r => r !== resId);
            if (other) resources[other] = Math.min(resourceCaps[other], resources[other] + 1);
          }
        }
      }
    }

    function getElementMultiplier(atkElement, autoMatchWeakness = false, activeClassBuff = null) {
      const resolvedEl = atkElement === "WeaponAttunement" ? (weapon.element || "Neutral") : atkElement;
      const forceWeak = autoMatchWeakness || pas.auto_match_weakness || resolvedEl === "Adaptive" || (destSig.marked_auto_weakness && resources.hunters_mark > 0);
      const el = forceWeak ? monster.weak : (resolvedEl || weapon.element || "Neutral");
      const buffElem = activeClassBuff?.elemental_dmg_pct || 0;
      const buffWeak = activeClassBuff?.weakness_bonus_pct || 0;
      const chargeElem = resources.elemental_charge * 8;
      const chargeWeak = resources.elemental_charge * 6;
      const polyElem = polymathStacks * (destSig.polymath_stack_pct || 0);
      const elemPotency = sub.int_elemental_potency.value + pas.elemental_dmg_pct + buffElem + chargeElem + polyElem + (companionAura.elemental_dmg_pct || 0);

      if (el !== "Neutral" && el === monster.weak) {
        return {
          mult: 1.25 + (sub.int_weakness_exploit.value + pas.weakness_bonus_pct + buffWeak + chargeWeak + elemPotency) / 100,
          matchedWeakness: true
        };
      }
      if (el !== "Neutral" && el === monster.el) {
        if (pas.ignore_same_element_penalty && activeClassBuff) return { mult: 1.0, matchedWeakness: false };
        return { mult: 0.75, matchedWeakness: false };
      }
      return { mult: 1.0 + (el !== "Neutral" ? elemPotency / 200 : 0), matchedWeakness: false };
    }

    // Simulasi langkah waktu presisi (dt = 0.1 detik -> GCD 1.3d akurat sempurna)
    const dt = 0.1;
    let playerHp = maxPlayerHp;
    let playerBarrier = 0;
    let monsterHp = monster.hp;
    let totalDamageDealt = 0;
    let totalDamageTaken = 0;
    let skillsCastCount = 0;
    let weaponSkillsCastCount = 0;
    let classBuffsCastCount = 0;
    let procsTriggered = 0;
    let procsConsumed = 0;
    let hybridFusionsTriggered = 0;
    let destinySignaturesTriggered = 0;
    let companionDamageDealt = 0;

    const cooldowns = new Map(build.equippedSkills.map(s => [s.id, 0]));
    const skillUsesDelta = {};
    let weaponSkillCd = 0;
    let gcdRemaining = 0;
    let lastCastTime = -999;
    let minGapBetweenCastsSec = Infinity;

    let activeClassBuff = null;
    let activeClassBuffTimer = 0;
    let activeDefBuffDmgRedPct = 0;
    let activeDefBuffTimer = 0;
    let enemyArmorDebuffPct = 0;
    let enemyArmorDebuffTimer = 0;
    let frenziedTimer = 0;
    let arcaneEdgeTimer = 0;
    let runeMarkActive = false;
    let chronosmithIcd = 0;
    let ironcladIcd = 0;
    let lastSkillId = null;
    const recentClasses = [];

    let basicAtkAccumulator = 0;
    let monsterAtkAccumulator = 0;
    let companionAtkAccumulator = 0;
    let meleeAutoCount = 0;
    let rangedCastCount = 0;
    let elapsedSec = 0;
    const log = [];

    for (let step = 0; step < Math.round(maxSeconds / dt) && playerHp > 0; step++) {
      const t = +(step * dt).toFixed(2);
      elapsedSec = +(t + dt).toFixed(2);

      // Update timers
      if (gcdRemaining > 0) gcdRemaining = Math.max(0, +(gcdRemaining - dt).toFixed(2));
      if (weaponSkillCd > 0) weaponSkillCd = Math.max(0, +(weaponSkillCd - dt).toFixed(2));
      for (const [sId, cd] of cooldowns.entries()) {
        if (cd > 0) cooldowns.set(sId, Math.max(0, +(cd - dt).toFixed(2)));
      }
      if (activeClassBuffTimer > 0) {
        activeClassBuffTimer = Math.max(0, +(activeClassBuffTimer - dt).toFixed(2));
        if (activeClassBuffTimer === 0) activeClassBuff = null;
      }
      if (activeDefBuffTimer > 0) {
        activeDefBuffTimer = Math.max(0, +(activeDefBuffTimer - dt).toFixed(2));
        if (activeDefBuffTimer === 0) activeDefBuffDmgRedPct = 0;
      }
      if (enemyArmorDebuffTimer > 0) {
        enemyArmorDebuffTimer = Math.max(0, +(enemyArmorDebuffTimer - dt).toFixed(2));
        if (enemyArmorDebuffTimer === 0) enemyArmorDebuffPct = 0;
      }
      if (frenziedTimer > 0) frenziedTimer = Math.max(0, +(frenziedTimer - dt).toFixed(2));
      if (arcaneEdgeTimer > 0) arcaneEdgeTimer = Math.max(0, +(arcaneEdgeTimer - dt).toFixed(2));
      if (chronosmithIcd > 0) chronosmithIcd = Math.max(0, +(chronosmithIcd - dt).toFixed(2));
      if (ironcladIcd > 0) ironcladIcd = Math.max(0, +(ironcladIcd - dt).toFixed(2));

      // Dynamic combat stats incorporating active RF Class Buff & Smith Resources
      const buffAtkSpd = (activeClassBuff?.attack_speed_pct || 0) + (frenziedTimer > 0 ? (destSig.overclock_frenzy_aspd_pct || 0) : 0);
      const buffAcc = activeClassBuff?.accuracy_pct || 0;
      const buffDodge = activeClassBuff?.dodge_pct || 0;
      const buffCrit = (activeClassBuff?.crit_chance_pct || 0) + polymathStacks * (destSig.polymath_stack_pct || 0);
      const buffDmgPct = (activeClassBuff?.dmg_pct || 0)
        + resources.overclock * 3
        + (destSig.guard_to_melee_dmg_pct ? resources.bastion_guard * destSig.guard_to_melee_dmg_pct : 0)
        + (destSig.heat_to_temp_enhance ? resources.forge_heat * 4 : 0);

      const totalAtkSpdPct = wSpdPoints + sub.dex_attack_speed.value + pas.attack_speed_pct + buffAtkSpd + (companionAura.attack_speed_pct || 0);
      const playerAttacksPerSec = +(1.0 * (1 + totalAtkSpdPct / 100)).toFixed(2);
      const effectiveMonsterDodge = Math.max(0, monster.dodge - resources.hunters_mark * 4);
      const playerHitChance = Math.min(95, 75 + wAccPoints + sub.dex_accuracy.value + pas.accuracy_pct + buffAcc + (companionAura.accuracy_pct || 0) + titleHitBonus - effectiveMonsterDodge);

      const rawDodge = Math.min(20, sub.dex_evasion.value) + (isRanged ? 8 : 0) + (armorClass === "ringan" ? 8 : armorClass === "sedang" ? 4 : 0) + pas.dodge_pct + buffDodge;
      const rawParry = isRanged ? 0 : (Math.min(20, sub.dex_parry_reflex.value) + (armorClass === "ringan" ? 8 : armorClass === "sedang" ? 4 : 0) + pas.parry_pct);
      const rawCrit = Math.min(20, sub.wis_crit_chance.value) + pas.crit_chance_pct + buffCrit;
      const critMultiplier = 2.0 + (sub.wis_crit_severity.value + pas.crit_dmg_pct + resources.hunters_mark * 4) / 100;

      // 1. Anti-Spam Rotation (Hanya bisa cast 1 tombol saat GCD === 0!)
      if (gcdRemaining <= 0) {
        let chosenAction = null; // { type: "class" | "weapon", skill }

        // Prioritas 1: Class Buff (RF) jika sedang tidak aktif
        const readyBuff = build.equippedSkills.find(s => s.role === "Class Buff (RF)" && cooldowns.get(s.id) <= 0);
        if (readyBuff && activeClassBuffTimer <= 0) {
          chosenAction = { type: "class", skill: readyBuff };
        }

        // Prioritas 2: Apex Ultimate T5
        if (!chosenAction) {
          const readyUlt = build.equippedSkills.find(s => s.tier === 5 && cooldowns.get(s.id) <= 0);
          if (readyUlt) chosenAction = { type: "class", skill: readyUlt };
        }

        // Prioritas 3: Resource Consumer jika tumpukan >= 2
        if (!chosenAction) {
          const readyConsumer = build.equippedSkills.find(s =>
            s.consumes_resource && cooldowns.get(s.id) <= 0 && (resources[s.consumes_resource.id] || 0) >= 2
          );
          if (readyConsumer) chosenAction = { type: "class", skill: readyConsumer };
        }

        // Prioritas 4: Weapon Skill [W] (1 slot khusus dari senjata terpasang)
        if (!chosenAction && build.weaponSkill?.unlocked && weaponSkillCd <= 0) {
          chosenAction = { type: "weapon", skill: build.weaponSkill };
        }

        // Prioritas 5: Opener/Builder -> Interrupt -> Sisa skill siap
        if (!chosenAction) {
          const readyBuilder = build.equippedSkills.find(s => s.grants_resource && cooldowns.get(s.id) <= 0);
          const readyOther = build.equippedSkills.find(s => s.role !== "Class Buff (RF)" && cooldowns.get(s.id) <= 0);
          const pick = readyBuilder || readyOther;
          if (pick) chosenAction = { type: "class", skill: pick };
        }

        if (chosenAction) {
          if (lastCastTime >= 0) {
            minGapBetweenCastsSec = Math.min(minGapBetweenCastsSec, +(t - lastCastTime).toFixed(2));
          }
          lastCastTime = t;
          gcdRemaining = GCD_SEC;

          if (chosenAction.type === "weapon") {
            const ws = chosenAction.skill;
            weaponSkillCd = ws.effectiveCooldownSec;
            weaponSkillsCastCount++;
            skillsCastCount++;
            skillUsesDelta[ws.id] = (skillUsesDelta[ws.id] || 0) + 1;

            const baseStrike = weaponBaseDmg + sub.str_raw_might.value + triggerDmgBonus * 1.35;
            const elemRes = getElementMultiplier(weapon.element, arcaneEdgeTimer > 0, activeClassBuff);
            const armorPen = Math.min(monster.armor, sub.str_armor_crush.value + pas.armor_pen_pct + resources.forge_heat * 3 + enemyArmorDebuffPct);
            const effectiveMonsterArmor = Math.max(0, monster.armor - armorPen);
            const expectedCritFactor = 1 + (Math.min(45, rawCrit) / 100) * (critMultiplier - 1);

            const dmg = baseStrike * masteryMult * ws.effectiveMultiplier * (1 + (pas.dmg_pct + buffDmgPct) / 100) * elemRes.mult * expectedCritFactor * (1 - effectiveMonsterArmor / 100) * (playerHitChance / 100);
            monsterHp -= dmg;
            totalDamageDealt += dmg;

            if (log.length < 15) {
              log.push(`[t=${t.toFixed(1)}s] Cast [W] ${ws.name} (${ws.mastery.label}) -> ${dmg.toFixed(1)} dmg`);
            }
          } else {
            const sk = chosenAction.skill;
            cooldowns.set(sk.id, sk.effectiveCooldownSec);
            skillsCastCount++;
            skillUsesDelta[sk.id] = (skillUsesDelta[sk.id] || 0) + 1;

            // Reforger Clockwork Flow: rotasi 2 tombol berbeda -> +1 Overclock
            if (pas.overclock_on_rotation && lastSkillId && lastSkillId !== sk.id) {
              addResource("overclock", 1);
            }
            lastSkillId = sk.id;

            // Omnismith Signature: rangkai 3 skill dari Smith Class berbeda -> Omni-Surge!
            let omniSurgeBonusMult = 1.0;
            if (destSig.omni_surge_on_3_classes) {
              recentClasses.push(sk.smithClass);
              if (recentClasses.length > 3) recentClasses.shift();
              if (recentClasses.length === 3 && new Set(recentClasses).size === 3) {
                omniSurgeBonusMult = 1 + (destSig.omni_surge_dmg_pct || 25) / 100;
                destinySignaturesTriggered++;
                const shave = destSig.omni_surge_cdr_sec || 2;
                for (const [kId, curCd] of cooldowns.entries()) {
                  if (kId !== sk.id && curCd > 0) cooldowns.set(kId, Math.max(0, +(curCd - shave).toFixed(2)));
                }
                weaponSkillCd = Math.max(0, +(weaponSkillCd - shave).toFixed(2));
                recentClasses.length = 0;
              }
            }

            // Class Buff (RF)
            if (sk.role === "Class Buff (RF)" && sk.self_buff) {
              classBuffsCastCount++;
              const masteryScale = 1 + sk.mastery.effectivenessBonusPct / 100;
              activeClassBuff = {};
              for (const [bk, bv] of Object.entries(sk.self_buff)) {
                activeClassBuff[bk] = typeof bv === "number" ? +(bv * masteryScale).toFixed(2) : bv;
              }
              activeClassBuffTimer = sk.self_buff.duration_sec || 16;
              if (log.length < 15) {
                log.push(`[t=${t.toFixed(1)}s] Buff ${sk.name} (${sk.smithClass} ${sk.mastery.label}) aktif ${activeClassBuffTimer}d`);
              }
            } else {
              // Skill Aktif / Interrupt / Combo / Ultimate
              const modEff = sk.combinedModEffect || {};
              const enhanceMorphBonus = (modEff.dmg_pct_per_enhance || 0) * (weapon.enhancePlus || 0);
              const masteryEffMult = 1 + sk.mastery.effectivenessBonusPct / 100;
              let skillMult = sk.base_multiplier * masteryEffMult * (1 + (modEff.skill_dmg_pct + pas.dmg_pct + buffDmgPct + enhanceMorphBonus) / 100);

              if (sk.grants_resource) {
                addResource(sk.grants_resource.id, sk.grants_resource.amount);
                procsTriggered++;
                if (destSig.barrier_on_opener_pct) {
                  playerBarrier = Math.max(playerBarrier, maxPlayerHp * (destSig.barrier_on_opener_pct / 100));
                  destinySignaturesTriggered++;
                }
              }

              if (sk.consumes_resource) {
                const rId = sk.consumes_resource.id;
                const floor = (rId === "forge_heat" && destSig.min_forge_heat) ? 1 : 0;
                const spent = Math.max(0, (resources[rId] || 0) - floor);
                resources[rId] = floor;
                if (spent > 0) {
                  procsConsumed++;
                  skillMult += spent * (sk.consumes_resource.per_stack_mult || 0.2);

                  // Armorer Retribution Nova heal per stack
                  if (sk.heal_per_stack_pct) {
                    playerHp = Math.min(maxPlayerHp, playerHp + maxPlayerHp * ((spent * sk.heal_per_stack_pct) / 100));
                  }
                  // Runesmith Hybrid Fusion Reaction!
                  if (sk.triggers_hybrid_fusion && spent >= 2) {
                    hybridFusionsTriggered++;
                    skillMult *= destSig.double_hybrid_fusion ? 1.55 : 1.28;
                    if (destSig.double_hybrid_fusion) destinySignaturesTriggered++;
                  }
                  // Reforger Chrono Rewind CDR
                  if (sk.consumes_resource.cdr_other_skills_per_stack_sec) {
                    const shave = spent * sk.consumes_resource.cdr_other_skills_per_stack_sec;
                    let shavedCount = 0;
                    for (const [kId, curCd] of cooldowns.entries()) {
                      if (kId !== sk.id && curCd > 0 && shavedCount < 2) {
                        cooldowns.set(kId, Math.max(0, +(curCd - shave).toFixed(2)));
                        shavedCount++;
                      }
                    }
                  }
                  // Reaver Destiny Frenzy Swing
                  if (rId === "overclock" && destSig.overclock_frenzy_aspd_pct) {
                    frenziedTimer = 5.0;
                    destinySignaturesTriggered++;
                  }
                }
              }

              // Execute bonus (HP musuh < 35%)
              if (sk.execute_threshold_hp_pct && (monsterHp / monster.hp) * 100 < sk.execute_threshold_hp_pct) {
                skillMult *= 1 + (sk.execute_bonus_pct || 35) / 100;
              }

              // Vanguard Barrier bonus
              if (destSig.barrier_on_opener_pct && playerBarrier > 0 && sk.smithClass === "Weaponsmith") {
                skillMult *= 1.18;
              }

              // Spellblade Rune Mark detonation on elemental skill!
              const isElemSkill = sk.smithClass === "Runesmith" || (sk.finalElement && sk.finalElement !== "Neutral");
              if (destSig.spellblade_mark_bonus_pct && isElemSkill && runeMarkActive) {
                runeMarkActive = false;
                skillMult *= 1 + destSig.spellblade_mark_bonus_pct / 100;
                destinySignaturesTriggered++;
              }
              if (destSig.spellblade_mark_bonus_pct && sk.smithClass === "Weaponsmith") {
                runeMarkActive = true;
              }

              // Hexblade Arcane Edge
              if (destSig.arcane_edge_auto_weakness && isElemSkill) {
                arcaneEdgeTimer = 4.0;
                destinySignaturesTriggered++;
              }

              // Artificer Turret bonus every 3 ranged casts
              if (destSig.turret_bonus_dps_pct && sk.smithClass === "Rangesmith") {
                rangedCastCount++;
                if (rangedCastCount % 3 === 0) {
                  skillMult *= 1 + destSig.turret_bonus_dps_pct / 100;
                  addResource("overclock", 1);
                  destinySignaturesTriggered++;
                }
              }

              if (sk.self_buff) {
                activeDefBuffDmgRedPct = Math.max(activeDefBuffDmgRedPct, sk.self_buff.dmg_reduction_pct || 0);
                activeDefBuffTimer = sk.self_buff.duration_sec || 5;
                if (sk.self_buff.barrier_hp_pct) {
                  playerBarrier += maxPlayerHp * (sk.self_buff.barrier_hp_pct / 100);
                }
              }
              if (sk.debuff?.enemy_armor_reduction_pct) {
                enemyArmorDebuffPct = Math.max(enemyArmorDebuffPct, sk.debuff.enemy_armor_reduction_pct);
                enemyArmorDebuffTimer = sk.debuff.duration_sec || 5;
              }
              if (modEff.heal_on_cast_pct > 0) {
                playerHp = Math.min(maxPlayerHp, playerHp + maxPlayerHp * (modEff.heal_on_cast_pct / 100));
              }
              if (modEff.reset_weapon_skill_cd) {
                weaponSkillCd = 0;
              }

              const baseStrike = weaponBaseDmg + sub.str_raw_might.value + triggerDmgBonus + (sk.scales_with_con_ac ? (stats.CON || 10) * 0.4 : 0);
              const elemRes = getElementMultiplier(sk.finalElement, sk.auto_match_weakness || modEff.auto_match_weakness || arcaneEdgeTimer > 0, activeClassBuff);

              // Chronosmith Signature: Weakness Exploit shaves 1.5s off all Macro Bar CDs (4s ICD)
              if (elemRes.matchedWeakness && destSig.weakness_cdr_all_sec && chronosmithIcd <= 0) {
                chronosmithIcd = 4.0;
                destinySignaturesTriggered++;
                for (const [kId, curCd] of cooldowns.entries()) {
                  if (curCd > 0) cooldowns.set(kId, Math.max(0, +(curCd - destSig.weakness_cdr_all_sec).toFixed(2)));
                }
              }
              // Pure Runesmith Twin Catalyst: Weakness grants +1 Elemental Charge
              if (elemRes.matchedWeakness && destSig.charge_on_weakness) {
                addResource("elemental_charge", destSig.charge_on_weakness);
              }

              const armorPen = sk.armor_pen_override_pct
                ? monster.armor
                : Math.min(monster.armor, sub.str_armor_crush.value + pas.armor_pen_pct + (modEff.armor_pen_pct || 0) + resources.forge_heat * 3 + enemyArmorDebuffPct);
              const effectiveMonsterArmor = Math.max(0, monster.armor - armorPen);
              const expectedCritFactor = 1 + (Math.min(45, rawCrit + (modEff.crit_chance_pct || 0)) / 100) * (critMultiplier - 1);

              const dmg = baseStrike * masteryMult * skillMult * omniSurgeBonusMult * elemRes.mult * expectedCritFactor * (1 - effectiveMonsterArmor / 100) * (playerHitChance / 100);
              monsterHp -= dmg;
              totalDamageDealt += dmg;

              if (frenziedTimer > 0 && destSig.lifesteal_pct) {
                playerHp = Math.min(maxPlayerHp, playerHp + dmg * (destSig.lifesteal_pct / 100));
              }

              if (log.length < 15) {
                log.push(`[t=${t.toFixed(1)}s] Cast ${sk.name} (${sk.smithClass} ${sk.mastery.label}) -> ${dmg.toFixed(1)} dmg`);
              }
            }
          }
        }
      }

      // 2. Basic Attack (mengisi jeda GCD 1.3d & cooldown agar DEX Attack Speed & Weapon Trigger tetap vital!)
      basicAtkAccumulator += playerAttacksPerSec * dt;
      while (basicAtkAccumulator >= 1.0) {
        basicAtkAccumulator -= 1.0;
        meleeAutoCount++;
        if (destSig.spellblade_mark_bonus_pct && !isRanged) {
          runeMarkActive = true;
        }
        if ((build.smith.tiers.Weaponsmith || 0) >= 1 && meleeAutoCount % 4 === 0) {
          addResource("forge_heat", 1);
        }
        if (destSig.ranged_fills_heat && isRanged && meleeAutoCount % 3 === 0) {
          addResource("forge_heat", 1);
        }

        const doubleTriggerBonus = (destSig.double_trigger_on_crit && meleeAutoCount % 3 === 0) ? triggerDmgBonus : 0;
        if (doubleTriggerBonus > 0) destinySignaturesTriggered++;

        const baseStrike = weaponBaseDmg + sub.str_raw_might.value + triggerDmgBonus + doubleTriggerBonus;
        const titleMult = build.title.type === "Spesialis" && build.title.primaryStat === weapon.stat ? 1.05 : 1.0;
        const rangedMult = isRanged
          ? (pas.remove_ranged_dmg_penalty ? 1.0 : 0.9) * (1 + sub.dex_ranged_draw.value / 200)
          : 1.0;
        const elemRes = getElementMultiplier(weapon.element, arcaneEdgeTimer > 0, activeClassBuff);
        const armorPen = Math.min(monster.armor, sub.str_armor_crush.value + pas.armor_pen_pct + resources.forge_heat * 3 + enemyArmorDebuffPct);
        const effectiveMonsterArmor = Math.max(0, monster.armor - armorPen);
        const expectedCritFactor = 1 + (Math.min(45, rawCrit) / 100) * (critMultiplier - 1);

        const dmg = baseStrike * masteryMult * titleMult * rangedMult * (1 + buffDmgPct / 100) * elemRes.mult * expectedCritFactor * (1 - effectiveMonsterArmor / 100) * (playerHitChance / 100);
        monsterHp -= dmg;
        totalDamageDealt += dmg;
      }

      // 2b. Companion Murid Assist Strike tiap 3 detik (CD-6.02 + Sinergi Reforger/Grand Overclock)
      if (companion) {
        companionAtkAccumulator += dt;
        if (companionAtkAccumulator >= 3.0) {
          companionAtkAccumulator -= 3.0;
          const mirrorBoost = (destSig.companion_mirrors_buff && activeClassBuff) ? 1.35 : 1.0;
          const assistBoost = 1 + (pas.companion_assist_pct || 0) / 100;
          const basePlayerStrike = (weaponBaseDmg + sub.str_raw_might.value + triggerDmgBonus) * masteryMult;
          const assistDmg = basePlayerStrike * (companion.assistDamagePctPerStrike / 100) * leadershipMult * assistBoost * mirrorBoost;
          monsterHp -= assistDmg;
          totalDamageDealt += assistDmg;
          companionDamageDealt += assistDmg;
          if ((build.smith.tiers.Reforger || 0) >= 1) addResource("overclock", 1);
        }
      }

      // Respawn monster jika mati untuk menghitung Kill per HP Bar
      while (monsterHp <= 0) {
        monsterHp += monster.hp;
      }

      // 3. Serangan Monster
      monsterAtkAccumulator += monster.speed * dt;
      while (monsterAtkAccumulator >= 1.0) {
        monsterAtkAccumulator -= 1.0;
        const avoidChance = Math.min(50, rawDodge + rawParry);
        const effectiveMonsterHit = Math.max(20, monster.accuracy - sub.cha_intimidate.value - avoidChance);
        const rawIncoming = monster.dmg * (1 - Math.min(30, sub.cha_intimidate.value + pas.enemy_dmg_debuff_pct) / 100);

        const mitigateCapRatio = (pas.mitigate_cap_pct >= 60 || build.smith.activePerkT3?.stat === "CON") ? 0.60 : 0.50;
        const buffMitigate = 1 + (activeClassBuff?.mitigate_bonus_pct || 0) / 100;
        const flatMitigate = Math.min(rawIncoming * mitigateCapRatio, sub.con_mitigate.value * buffMitigate);
        const afterMitigate = Math.max(1, rawIncoming - flatMitigate);

        if ((build.smith.tiers.Armorer || 0) >= 1) {
          addResource("bastion_guard", 1);
        }

        const armorClassMit = armorClass === "berat" ? 10 : armorClass === "sedang" ? 5 : 0;
        const guardDr = resources.bastion_guard * 3;
        const buffDr = (activeClassBuff?.dmg_reduction_pct || 0) + activeDefBuffDmgRedPct;
        const totalPctRed = Math.min(60, (wDefPoints / 1.25) + triggerDefPct + pas.dmg_reduction_pct + armorClassMit + guardDr + buffDr + (companionAura.dmg_reduction_pct || 0));

        let elemResistPct = monster.el !== "Neutral" ? (sub.int_elemental_barrier.value + (pas.elem_resist_pct || 0)) : 0;
        if (armorClass === "sedang" && monster.el !== "Neutral" && armorElement === monster.el) {
          elemResistPct += armorSlotsSameElement * 5;
        }
        elemResistPct = Math.min(50, elemResistPct);

        let finalHitDmg = afterMitigate * (1 - totalPctRed / 100) * (1 - elemResistPct / 100) * (effectiveMonsterHit / 100);
        if (playerBarrier > 0) {
          const absorbed = Math.min(playerBarrier, finalHitDmg);
          playerBarrier -= absorbed;
          finalHitDmg -= absorbed;
        }
        playerHp -= finalHitDmg;
        totalDamageTaken += finalHitDmg;

        // Ironclad Signature: Emergency Overclock saat HP < 50%
        if (destSig.low_hp_barrier_pct && ironcladIcd <= 0 && playerHp > 0 && playerHp < maxPlayerHp * 0.5) {
          ironcladIcd = 35.0;
          playerBarrier += maxPlayerHp * (destSig.low_hp_barrier_pct / 100);
          destinySignaturesTriggered++;
        }
      }
    }

    const durationSec = Math.max(dt, elapsedSec);
    const dps = +(totalDamageDealt / durationSec).toFixed(2);
    const dtps = +(totalDamageTaken / durationSec).toFixed(2);
    const timeToDieSec = dtps > 0 ? +(maxPlayerHp / dtps).toFixed(1) : 9999;
    const killsPerHpBar = +((dps * timeToDieSec) / monster.hp).toFixed(2);
    const antiFarm = computeAntiFarmMultipliers(level, monster.lvl, sub.wis_rare_drop ? sub.wis_rare_drop.value : 0);

    return {
      playerSummary: {
        level,
        tier,
        maxPlayerHp,
        title: build.title.type,
        smithClass: build.smith.singleWordClassName,
        smithTiers: build.smith.tiers,
        activeDestinyCard: destiny ? {
          id: destiny.id,
          name: destiny.displayName,
          category: destiny.category,
          tierRank: destiny.tierRank,
          signatureName: destiny.signature?.name || null,
          signatureActive: !!destiny.signatureActive
        } : null,
        weaponSkill: build.weaponSkill ? {
          id: build.weaponSkill.id,
          name: build.weaponSkill.name,
          unlocked: build.weaponSkill.unlocked,
          masteryLabel: build.weaponSkill.mastery.label,
          cooldownSec: build.weaponSkill.effectiveCooldownSec
        } : null,
        gcdSec: GCD_SEC,
        weaponCompatibility: compat,
        weaponEnhancement: enh,
        companionSummary: companion,
        macroSlotsUsed: `${build.equippedSkills.length}/${build.maxSlots}`,
        unlockedNodes: build.unlockedCount
      },
      monsterSummary: monster,
      antiFarmSummary: antiFarm,
      metrics: {
        dps,
        dtps,
        timeToDieSec,
        killsPerHpBar,
        skillsCastCount,
        weaponSkillsCastCount,
        classBuffsCastCount,
        procsTriggered,
        procsConsumed,
        hybridFusionsTriggered,
        destinySignaturesTriggered,
        minGapBetweenCastsSec: Number.isFinite(minGapBetweenCastsSec) ? minGapBetweenCastsSec : GCD_SEC,
        companionDamageDealt: +companionDamageDealt.toFixed(1),
        skillUsesDelta
      },
      combatLogSample: log
    };
  }

  return {
    computeSubStats,
    getMacroSlotCapacity,
    evaluateTitle,
    evaluateSmithMastery,
    getSkillMasteryStage,
    trainSkillMastery,
    trainSkillsFromIdle,
    getUnlockedDestinyCards,
    resolveActiveDestinyCard,
    evaluateDestinySwitch,
    resolveWeaponSkill,
    getUnlockedNodes,
    buildMacroLoadout,
    computeAntiFarmMultipliers,
    computeWeaponEnhancement,
    generateApprenticeFromSeed,
    computeGateCurseAndRest,
    simulateBattle
  };
}

  const engine = createSkillEngine(SKILL_DATA_V33);
  global.BattleSmithSkillV33 = {
    version: SKILL_DATA_V33.version,
    skillData: SKILL_DATA_V33,
    engine,
    createSkillEngine,
    getTierForLevel,
    getStatCapForLevel,
    getTotalStatPointsForLevel,
    computeMonsterStats
  };
})(typeof window !== 'undefined' ? window : globalThis);
