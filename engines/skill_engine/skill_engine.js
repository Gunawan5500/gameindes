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
