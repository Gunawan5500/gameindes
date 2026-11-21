// Battle-Smith RPG — CD-1.02b & CD-2.01 Skill & Sub-Stat Engine (SWTOR Discipline + Cross-Stat Macro Loadout)
// Mengintegrasikan:
// 1. 6 Stat Utama (STR, DEX, CON, INT, WIS, CHA) skala Lv1-150 (Cap Stat 30/60/90/120/150)
// 2. 60 Sub-Stat (10 per Stat Utama) + 2 Sub-Stat Fokus per Stat (+25% efisiensi)
// 3. 150 Node Skill SWTOR-Style (5 Tier x [Core Passive +10, Pilih 1-dari-3 Utility/Morph +20, Active Skill +30] per Stat)
// 4. Active Macro Loadout (3-6 slot berdasarkan Sub-Stat INT Macro Capacity) + 2 Cross-Stat Utility Mod per Active Skill
// 5. Sinergi penuh dengan 5 Smith Type (CD-3: Weaponsmith, Armorer, Reforger, Runesmith, Rangesmith) & 5 Role / 4 Tipe Monster WD (B3 & B4)

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

export function getTierForLevel(level) {
  return Math.min(5, Math.max(1, Math.ceil(level / 30)));
}

export function getStatCapForLevel(level) {
  return getTierForLevel(level) * 30;
}

export function getTotalStatPointsForLevel(level) {
  return 13 + 2 * (level - 1);
}

export function computeMonsterStats(wdEnemy) {
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

export function createSkillEngine(skillData) {
  const STATS = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];

  // Map all nodes by ID for quick lookup
  const passiveMap = new Map();
  const utilityMap = new Map();
  const activeMap = new Map();

  for (const stat of STATS) {
    const disc = skillData.disciplines[stat];
    if (!disc) continue;
    for (const t of disc.tiers) {
      passiveMap.set(t.core_passive.id, { ...t.core_passive, stat, tier: t.tier });
      for (const u of t.utility_choices) {
        utilityMap.set(u.id, { ...u, stat, tier: t.tier });
      }
      activeMap.set(t.active_skill.id, { ...t.active_skill, stat, tier: t.tier });
    }
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

  /**
   * 4. Evaluasi Smith Class (Total 5 Poin Tingkat / 5 Tier, Nama Kelas 1 Kata CD-3.02b, Mazhab Barang A+C, & 21 Perk Smith CD-3.03)
   */
  function evaluateSmithMastery(stats, smithConfig = {}) {
    let tiers = { Weaponsmith: 0, Armorer: 0, Rangesmith: 0, Runesmith: 0, Reforger: 0 };
    if (smithConfig.tiers) {
      for (const k of Object.keys(tiers)) {
        tiers[k] = Math.max(0, Math.min(5, +(smithConfig.tiers[k] || 0)));
      }
    } else {
      const pType = smithConfig.primaryType || "Weaponsmith";
      const pRank = Math.min(5, Math.max(1, +(smithConfig.primaryRank || 1)));
      tiers[pType] = pRank;
      if (smithConfig.secondaryType && smithConfig.secondaryRank > 0) {
        const sType = smithConfig.secondaryType;
        tiers[sType] = Math.min(5 - pRank, Math.max(0, +(smithConfig.secondaryRank || 0)));
      }
    }

    const activeEntries = Object.entries(tiers).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
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

    // Pilih Perk Aktif (dari smithConfig.selectedPerkT3 / selectedPerkT5, atau otomatis pilih yang pertama yang layak)
    const activePerkT3 = eligiblePerksT3Details.find(p => p.stat === smithConfig.selectedPerkT3 || p.id === smithConfig.selectedPerkT3)
      || eligiblePerksT3Details[0] || null;
    const activePerkT5 = eligiblePerksT5Details.find(p => p.pair === smithConfig.selectedPerkT5 || p.id === smithConfig.selectedPerkT5)
      || eligiblePerksT5Details[0] || null;

    function checkWeaponCompatibility(weapon = {}) {
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
      return {
        isCompatible: bestRank >= 1,
        matchedClass,
        masteryRank: bestRank,
        masteryBonusPct: bestRank >= 1 ? bestRank * 6 : -25,
        triggerUnlocked: bestRank >= 1
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
   * 5. Dapatkan semua Core Passive (+10), Utility Choices (+20, 1 per tier), dan Active Skills (+30) yang terbuka
   */
  function getUnlockedNodes(stats, selectedUtilities = {}) {
    const unlockedPassives = [];
    const unlockedUtilities = [];
    const unlockedActives = [];

    for (const stat of STATS) {
      const val = stats[stat] || 1;
      const disc = skillData.disciplines[stat];
      if (!disc) continue;

      for (const t of disc.tiers) {
        if (val >= t.core_passive.stat_req) {
          unlockedPassives.push({ ...t.core_passive, stat, tier: t.tier });
        }
        // Utility (+20): pilih 1 dari 3 jika stat mencukupi
        const uReq = t.utility_choices[0].stat_req;
        if (val >= uReq) {
          const pickedId = selectedUtilities[`${stat}_T${t.tier}`];
          const picked = t.utility_choices.find(u => u.id === pickedId) || t.utility_choices[0];
          unlockedUtilities.push({ ...picked, stat, tier: t.tier });
        }
        if (val >= t.active_skill.stat_req) {
          unlockedActives.push({ ...t.active_skill, stat, tier: t.tier });
        }
      }
    }

    return { unlockedPassives, unlockedUtilities, unlockedActives };
  }

  /**
   * 6. Validasi & Rakit Active Macro Loadout (Opsi C: 3-6 Slot + 2 Cross-Stat Utility Mods per Skill Aktif)
   */
  function buildMacroLoadout({ stats, focusSubStats = {}, selectedUtilities = {}, loadout = [], smithConfig = {} }) {
    const subStats = computeSubStats(stats, focusSubStats);
    const maxSlots = getMacroSlotCapacity(subStats.byId);
    const unlocked = getUnlockedNodes(stats, selectedUtilities);
    const smith = evaluateSmithMastery(stats, smithConfig);

    const unlockedActiveIds = new Set(unlocked.unlockedActives.map(a => a.id));
    const unlockedUtilityMap = new Map(unlocked.unlockedUtilities.map(u => [u.id, u]));

    // Agregasi pasif global dari Core Passives
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
      enemy_dmg_debuff_pct: 0
    };

    for (const p of unlocked.unlockedPassives) {
      for (const [k, v] of Object.entries(p.effect)) {
        if (passiveTotals[k] !== undefined) passiveTotals[k] += v;
      }
    }

    // Jika Runesmith, cross-stat mod mendapat bonus efektivitas (+4% per rank utama)
    const crossStatModMult = smith.primaryType === "Runesmith"
      ? 1 + (smith.primaryRank * (smith.synergy.cross_stat_mod_bonus_pct_per_rank || 4)) / 100
      : 1.0;

    // Jika Reforger, cooldown recovery mendapat bonus (+2.5% per rank utama)
    const globalCdrPct = (smith.primaryType === "Reforger" ? smith.primaryRank * 2.5 : 0)
      + (subStats.byId.wis_tactical_rhythm ? subStats.byId.wis_tactical_rhythm.value * 0.5 : 0);

    const equippedSkills = [];
    const usedModIds = new Set();

    for (const slot of loadout.slice(0, maxSlots)) {
      if (!unlockedActiveIds.has(slot.activeId)) continue;
      const baseSkill = activeMap.get(slot.activeId);

      // Maksimal 2 Utility Mod (boleh Cross-Stat dari stat mana saja yang sudah dibuka pemain!)
      const appliedMods = [];
      const modIds = (slot.modIds || []).slice(0, 2);

      const combinedModEffect = {
        skill_dmg_pct: 0,
        proc_bonus_dmg_pct: 0,
        armor_pen_pct: 0,
        crit_chance_pct: 0,
        crit_dmg_pct: 0,
        cooldown_reduction_sec: 0,
        dmg_reduction_pct: 0,
        heal_on_cast_pct: 0,
        trigger_power_pct: 0,
        auto_match_weakness: false,
        element_override: null
      };

      for (const mId of modIds) {
        if (!unlockedUtilityMap.has(mId) || usedModIds.has(mId)) continue;
        const mod = unlockedUtilityMap.get(mId);
        usedModIds.add(mId);
        const isCrossStat = mod.stat !== baseSkill.stat;
        const mult = isCrossStat ? crossStatModMult : 1.0;

        appliedMods.push({ id: mod.id, name: mod.name, stat: mod.stat, branch: mod.branch, isCrossStat });

        for (const [k, v] of Object.entries(mod.mod_effect)) {
          if (typeof v === "boolean") {
            combinedModEffect[k] = combinedModEffect[k] || v;
          } else if (typeof v === "string") {
            combinedModEffect[k] = v;
          } else if (typeof v === "number" && combinedModEffect[k] !== undefined) {
            combinedModEffect[k] = +(combinedModEffect[k] + v * mult).toFixed(2);
          }
        }
      }

      const rawCd = Math.max(2, baseSkill.cooldown_sec - combinedModEffect.cooldown_reduction_sec);
      const effectiveCd = +(rawCd * (1 - Math.min(0.4, globalCdrPct / 100))).toFixed(2);
      const finalElement = combinedModEffect.element_override || baseSkill.element;

      equippedSkills.push({
        ...baseSkill,
        finalElement,
        effectiveCooldownSec: effectiveCd,
        appliedMods,
        combinedModEffect
      });
    }

    return {
      maxSlots,
      subStats,
      title: evaluateTitle(stats),
      smith,
      passiveTotals,
      unlockedCount: {
        passives: unlocked.unlockedPassives.length,
        utilities: unlocked.unlockedUtilities.length,
        actives: unlocked.unlockedActives.length
      },
      equippedSkills
    };
  }

  const RARITY_BUDGET_BONUS = {
    Common: 0,
    Uncommon: 10,
    Rare: 22,
    Epic: 36,
    Legendary: 52,
    Unique: 75
  };

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
      bonusPct += p1 * 4; // +4% per level up to +5 (+20%)
      phase = isUnique ? "Resonance I-II" : "Fase 1: Tempa Stabil (+1..+5)";
      baseSuccessRatePct = 100 - (p1 - 1) * 5; // 100 -> 80%
    }
    if (n > 5) {
      const p2 = Math.min(5, n - 5);
      bonusPct += p2 * 7; // +7% per level +6..+10 (+55% total)
      phase = isUnique ? "Resonance III-IV" : "Fase 2: Tempa Panas (+6..+10)";
      baseSuccessRatePct = 70 - (p2 - 1) * 7.5; // 70 -> 40%
    }
    if (n > 10) {
      const p3 = Math.min(5, n - 10);
      bonusPct += p3 * 12; // +12% per level +11..+15 (+115% total)
      phase = isUnique ? "Resonance V (Apex)" : "Fase 3: Masterwork Overforge (+11..+15)";
      baseSuccessRatePct = 30 - (p3 - 1) * 5; // 30 -> 10%
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
   * CD-6.02: Generator Seed Murid Prosedural & AI Autonomous Style (Opsi A + Seed AI Style)
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
    const SMITH_TYPES = ["Weaponsmith", "Armorer", "Rangesmith", "Runesmith", "Reforger"];

    const baseTalent = Math.floor(45 + nextRand() * 50); // 45..94
    const learningRate = Math.floor(45 + nextRand() * 50); // 45..94
    const baseLoyalty = Math.floor(55 + nextRand() * 35); // 55..89
    const bg = BACKGROUNDS[Math.floor(nextRand() * BACKGROUNDS.length)];

    const trials = Math.max(0, Math.min(2, passedTrials));
    const talentCap = Math.min(100, baseTalent + trials * 15);
    const loyalty = Math.min(100, baseLoyalty + trials * 10);
    const effectiveSkill = Math.min(talentCap, Math.max(0, currentSkill));

    // AI otonom memilih gaya Smith Class (alokasi 5 poin Tier sesuai bakat/ujian)
    const maxTierPts = effectiveSkill >= 80 && trials >= 2 ? 5 : effectiveSkill >= 50 && trials >= 1 ? 3 : Math.max(1, Math.ceil(effectiveSkill / 25));
    const primarySmith = SMITH_TYPES[Math.floor(nextRand() * SMITH_TYPES.length)];
    let secondarySmith = SMITH_TYPES[Math.floor(nextRand() * SMITH_TYPES.length)];
    if (secondarySmith === primarySmith) secondarySmith = SMITH_TYPES[(SMITH_TYPES.indexOf(primarySmith) + 1) % 5];

    const styleRoll = nextRand();
    const smithTiers = { Weaponsmith: 0, Armorer: 0, Rangesmith: 0, Runesmith: 0, Reforger: 0 };
    if (styleRoll < 0.45) {
      // Murni Spesialis
      smithTiers[primarySmith] = maxTierPts;
    } else if (styleRoll < 0.85 && maxTierPts >= 2) {
      // Hibrida 2 Kelas
      const pPts = Math.ceil(maxTierPts * 0.6);
      smithTiers[primarySmith] = pPts;
      smithTiers[secondarySmith] = maxTierPts - pPts;
    } else {
      // Polimatik / Omnismith
      for (let i = 0; i < maxTierPts; i++) {
        const c = SMITH_TYPES[i % 5];
        smithTiers[c] += 1;
      }
    }

    // Stat murid tumbuh mengikuti effectiveSkill dan latar belakang
    const apprenticeStats = { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 };
    for (const s of STATS) {
      const isBg = bg.stats.includes(s);
      const weight = isBg ? 1.15 : 0.65;
      apprenticeStats[s] = Math.max(5, Math.round(10 + effectiveSkill * weight * (0.85 + nextRand() * 0.3)));
    }

    const smithEval = evaluateSmithMastery(apprenticeStats, { tiers: smithTiers });
    const primaryStat = bg.stats[0];
    const disc = skillData.disciplines[primaryStat];
    const aiSkills = disc ? disc.tiers.slice(0, Math.min(3, Math.ceil(maxTierPts / 2) + 1)).map(t => t.active_skill.name) : [];

    // Aura pasif & Assist Strike (setiap 3 dtk = 15% + 0.35% * Skill)
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
   * 7. Simulasi Pertempuran Rotasi SWTOR (Time-stepped Rotation & Basic Attack vs Monster WD)
   */
  function simulateBattle({
    level = 30,
    stats = { STR: 30, DEX: 15, CON: 20, INT: 10, WIS: 10, CHA: 10 },
    focusSubStats = {},
    selectedUtilities = {},
    loadout = [],
    smithConfig = { primaryType: "Weaponsmith", primaryRank: 1 },
    weapon = { stat: "STR", tier: 1, rarity: "Common", enhancePlus: 0, tag: "Dekat", element: "Neutral", budget: { damage: 35, speed: 15, accuracy: 15, defense: 5, trigger: 30 } },
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
    const build = buildMacroLoadout({ stats, focusSubStats, selectedUtilities, loadout, smithConfig });
    const sub = build.subStats.byId;
    const pas = build.passiveTotals;
    const monster = computeMonsterStats(wdEnemy);

    // Evaluasi Companion Murid jika dibawa (CD-6.02)
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

    // Kecepatan serang dasar
    const totalAtkSpdPct = wSpdPoints + sub.dex_attack_speed.value + pas.attack_speed_pct + (companionAura.attack_speed_pct || 0);
    const playerAttacksPerSec = +(1.0 * (1 + totalAtkSpdPct / 100)).toFixed(2);

    // Peluang kena (cap 95%)
    const titleHitBonus = build.title.type === "Spesialis"
      ? (build.title.primaryStat === weapon.stat ? 5 : -5)
      : 0;
    const playerHitChance = Math.min(95, 75 + wAccPoints + sub.dex_accuracy.value + pas.accuracy_pct + (companionAura.accuracy_pct || 0) + titleHitBonus - monster.dodge);

    // Dodge, Parry, Critical (cap bersama bonus peluang +30% dari stat dasar)
    let rawDodge = Math.min(20, sub.dex_evasion.value) + (isRanged ? 8 : 0) + (armorClass === "ringan" ? 8 : armorClass === "sedang" ? 4 : 0) + pas.dodge_pct;
    let rawParry = isRanged ? 0 : (Math.min(20, sub.dex_parry_reflex.value) + (armorClass === "ringan" ? 8 : armorClass === "sedang" ? 4 : 0) + pas.parry_pct);
    let rawCrit = Math.min(20, sub.wis_crit_chance.value) + pas.crit_chance_pct;

    const critMultiplier = 2.0 + (sub.wis_crit_severity.value + pas.crit_dmg_pct) / 100;

    const compat = build.smith.checkWeaponCompatibility(weapon);
    const masteryMult = 1 + compat.masteryBonusPct / 100;

    // Trigger senjata (CD-4.03 LOCKED: skala stat utama 1.5% per poin, CON +15% Guard Damage, CHA /5 dan /3)
    const mainStatVal = stats[weapon.stat] || 10;
    const triggerMult = compat.triggerUnlocked
      ? (1 + (sub.int_trigger_mastery.value + pas.trigger_power_pct + enh.overforgeTriggerBonusPct + (companionAura.trigger_power_pct || 0)) / 100)
      : 0;
    const effectiveTrigger = wTrgPoints * 0.8 * (1 + 0.015 * mainStatVal) * triggerMult * enh.powerMultiplier;
    const conGuardDmgBonus = (weapon.stat === "CON" || (build.smith.tiers.Armorer || 0) >= 1) ? (stats.CON || 10) * 0.15 : 0;
    const triggerDmgBonus = ["STR", "DEX", "INT", "WIS"].includes(weapon.stat)
      ? effectiveTrigger / 4
      : weapon.stat === "CHA" ? effectiveTrigger / 5 : conGuardDmgBonus;
    const triggerDefPct = weapon.stat === "CON" ? effectiveTrigger / 2 : weapon.stat === "CHA" ? effectiveTrigger / 3 : 0;

    // Faktor elemen dasar (B4 LOCKED: +25% weak + sub-stat INT Weakness Exploit; -25% sama el)
    function getElementMultiplier(atkElement, autoMatchWeakness = false) {
      const el = autoMatchWeakness || atkElement === "Adaptive" ? monster.weak : (atkElement || weapon.element || "Neutral");
      const elemPotency = sub.int_elemental_potency.value + pas.elemental_dmg_pct + (companionAura.elemental_dmg_pct || 0);
      if (el !== "Neutral" && el === monster.weak) {
        return 1.25 + (sub.int_weakness_exploit.value + pas.weakness_bonus_pct + elemPotency) / 100;
      }
      if (el !== "Neutral" && el === monster.el) {
        return 0.75;
      }
      return 1.0 + (el !== "Neutral" ? elemPotency / 200 : 0);
    }

    // Simulasi langkah waktu (dt = 0.5 detik)
    const dt = 0.5;
    let playerHp = maxPlayerHp;
    let monsterHp = monster.hp;
    let totalDamageDealt = 0;
    let totalDamageTaken = 0;
    let skillsCastCount = 0;
    let procsTriggered = 0;
    let procsConsumed = 0;
    let companionDamageDealt = 0;

    const cooldowns = new Map(build.equippedSkills.map(s => [s.id, 0]));
    const activeProcs = new Set();
    let activeBuffDmgRedPct = 0;
    let activeBuffTimer = 0;

    let basicAtkAccumulator = 0;
    let monsterAtkAccumulator = 0;
    let companionAtkAccumulator = 0;
    const log = [];

    for (let t = 0; t < maxSeconds && playerHp > 0; t += dt) {
      // Update timers
      for (const [sId, cd] of cooldowns.entries()) {
        if (cd > 0) cooldowns.set(sId, Math.max(0, +(cd - dt).toFixed(2)));
      }
      if (activeBuffTimer > 0) {
        activeBuffTimer = Math.max(0, +(activeBuffTimer - dt).toFixed(2));
        if (activeBuffTimer === 0) activeBuffDmgRedPct = 0;
      }

      // 1. Cek rotasi Active Macro Bar (prioritas: Proc Consumer yang proc-nya aktif -> High-Impact/Capstone -> Builder/Defensive)
      let skillToCast = null;
      for (const sk of build.equippedSkills) {
        if (cooldowns.get(sk.id) <= 0) {
          if (sk.consumes_proc && activeProcs.has(sk.consumes_proc)) {
            skillToCast = sk;
            break;
          }
          if (!skillToCast) skillToCast = sk;
        }
      }

      if (skillToCast) {
        cooldowns.set(skillToCast.id, skillToCast.effectiveCooldownSec);
        skillsCastCount++;

        let skillMult = skillToCast.base_multiplier * (1 + (skillToCast.combinedModEffect.skill_dmg_pct + pas.dmg_pct) / 100);
        if (skillToCast.consumes_proc && activeProcs.has(skillToCast.consumes_proc)) {
          activeProcs.delete(skillToCast.consumes_proc);
          procsConsumed++;
          skillMult += skillToCast.proc_multiplier_bonus * (1 + skillToCast.combinedModEffect.proc_bonus_dmg_pct / 100);
        }
        if (skillToCast.grants_proc) {
          activeProcs.add(skillToCast.grants_proc);
          procsTriggered++;
        }
        if (skillToCast.self_buff) {
          activeBuffDmgRedPct = skillToCast.self_buff.dmg_reduction_pct || 0;
          activeBuffTimer = skillToCast.self_buff.duration_sec || 4;
        }
        if (skillToCast.combinedModEffect.heal_on_cast_pct > 0) {
          playerHp = Math.min(maxPlayerHp, playerHp + maxPlayerHp * (skillToCast.combinedModEffect.heal_on_cast_pct / 100));
        }

        // Hitung damage skill
        const baseStrike = weaponBaseDmg + sub.str_raw_might.value + triggerDmgBonus;
        const elemMult = getElementMultiplier(skillToCast.finalElement, skillToCast.combinedModEffect.auto_match_weakness);
        const armorPen = Math.min(monster.armor, sub.str_armor_crush.value + pas.armor_pen_pct + skillToCast.combinedModEffect.armor_pen_pct);
        const effectiveMonsterArmor = Math.max(0, monster.armor - armorPen);
        const expectedCritFactor = 1 + (Math.min(35, rawCrit + skillToCast.combinedModEffect.crit_chance_pct) / 100) * (critMultiplier - 1);

        const dmg = baseStrike * masteryMult * skillMult * elemMult * expectedCritFactor * (1 - effectiveMonsterArmor / 100) * (playerHitChance / 100);
        monsterHp -= dmg;
        totalDamageDealt += dmg;

        if (log.length < 12) {
          log.push(`[t=${t.toFixed(1)}s] Cast ${skillToCast.name} (${skillToCast.role}) -> ${dmg.toFixed(1)} dmg`);
        }
      }

      // 2. Basic Attack
      basicAtkAccumulator += playerAttacksPerSec * dt;
      while (basicAtkAccumulator >= 1.0) {
        basicAtkAccumulator -= 1.0;
        const baseStrike = weaponBaseDmg + sub.str_raw_might.value + triggerDmgBonus;
        const titleMult = build.title.type === "Spesialis" && build.title.primaryStat === weapon.stat ? 1.05 : 1.0;
        const rangedMult = isRanged ? 0.9 * (1 + sub.dex_ranged_draw.value / 200) : 1.0;
        const elemMult = getElementMultiplier(weapon.element, false);
        const armorPen = Math.min(monster.armor, sub.str_armor_crush.value + pas.armor_pen_pct);
        const effectiveMonsterArmor = Math.max(0, monster.armor - armorPen);
        const expectedCritFactor = 1 + (rawCrit / 100) * (critMultiplier - 1);

        const dmg = baseStrike * masteryMult * titleMult * rangedMult * elemMult * expectedCritFactor * (1 - effectiveMonsterArmor / 100) * (playerHitChance / 100);
        monsterHp -= dmg;
        totalDamageDealt += dmg;
      }

      // 2b. Companion Murid Assist Strike tiap 3 detik (CD-6.02)
      if (companion) {
        companionAtkAccumulator += dt;
        if (companionAtkAccumulator >= 3.0) {
          companionAtkAccumulator -= 3.0;
          const basePlayerStrike = (weaponBaseDmg + sub.str_raw_might.value + triggerDmgBonus) * masteryMult;
          const assistDmg = basePlayerStrike * (companion.assistDamagePctPerStrike / 100) * leadershipMult;
          monsterHp -= assistDmg;
          totalDamageDealt += assistDmg;
          companionDamageDealt += assistDmg;
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

        // Mitigate CON (cap 50% mentah, atau 60% dengan Perk CON)
        const mitigateCapRatio = build.smith.activePerkT3?.stat === "CON" ? 0.60 : 0.50;
        const flatMitigate = Math.min(rawIncoming * mitigateCapRatio, sub.con_mitigate.value);
        const afterMitigate = Math.max(1, rawIncoming - flatMitigate);

        // Pengurang persen (CD-4.03 LOCKED: weapon defense 1.25 poin = 1% DR + trigger + passive + buff, cap 60%)
        const armorClassMit = armorClass === "berat" ? 10 : armorClass === "sedang" ? 5 : 0;
        const totalPctRed = Math.min(60, (wDefPoints / 1.25) + triggerDefPct + pas.dmg_reduction_pct + armorClassMit + activeBuffDmgRedPct + (companionAura.dmg_reduction_pct || 0));

        // Resist elemen Armor Sedang (B4 LOCKED: +5% per slot jika elemen cocok + Elemental Barrier INT)
        let elemResistPct = monster.el !== "Neutral" ? sub.int_elemental_barrier.value : 0;
        if (armorClass === "sedang" && monster.el !== "Neutral" && armorElement === monster.el) {
          elemResistPct += armorSlotsSameElement * 5;
        }
        elemResistPct = Math.min(50, elemResistPct);

        const finalHitDmg = afterMitigate * (1 - totalPctRed / 100) * (1 - elemResistPct / 100) * (effectiveMonsterHit / 100);
        playerHp -= finalHitDmg;
        totalDamageTaken += finalHitDmg;
      }
    }

    const durationSec = maxSeconds;
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
        procsTriggered,
        procsConsumed,
        companionDamageDealt: +companionDamageDealt.toFixed(1)
      },
      combatLogSample: log
    };
  }

  return {
    computeSubStats,
    getMacroSlotCapacity,
    evaluateTitle,
    evaluateSmithMastery,
    getUnlockedNodes,
    buildMacroLoadout,
    computeAntiFarmMultipliers,
    computeWeaponEnhancement,
    generateApprenticeFromSeed,
    computeGateCurseAndRest,
    simulateBattle
  };
}
