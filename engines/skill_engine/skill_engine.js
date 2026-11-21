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

  /**
   * 4. Evaluasi Smith Type & Perk Eligibility (CD-3.01 - CD-3.03, diselaraskan ke Cap Stat 150)
   *    - Perk Tingkat 3 (Stat Tunggal): Primary Smith Rank >= 3 & Stat >= 45
   *    - Perk Tingkat 5 (Pasangan Stat Hibrida): Primary Smith Rank == 5 (Spesialis, tanpa secondary) & kedua Stat >= 75
   */
  function evaluateSmithMastery(stats, smithConfig = {}) {
    const primaryType = smithConfig.primaryType || "Weaponsmith";
    const primaryRank = Math.min(5, Math.max(1, smithConfig.primaryRank || 1));
    const secondaryType = smithConfig.secondaryType || null;
    const secondaryRank = secondaryType ? Math.min(3, Math.max(0, smithConfig.secondaryRank || 0)) : 0;
    const isSpecialistSmith = !secondaryType || secondaryRank === 0;

    const pData = skillData.smith_types[primaryType] || skillData.smith_types.Weaponsmith;
    const craftBonusPct = primaryRank * pData.primary_bonus_per_rank_pct + (secondaryRank * 3);
    const rankPrefix = pData.rank_prefixes[primaryRank - 1];

    // Perk eligibility (Scale 150: Tier 3 single stat >= 45, Tier 5 dual stat >= 75)
    const eligibleSingleStatPerks = [];
    const eligibleHybridPairPerks = [];

    if (isSpecialistSmith && primaryRank >= 3) {
      for (const s of STATS) {
        if ((stats[s] || 1) >= 45) eligibleSingleStatPerks.push(s);
      }
    }
    if (isSpecialistSmith && primaryRank >= 5) {
      for (let i = 0; i < STATS.length; i++) {
        for (let j = i + 1; j < STATS.length; j++) {
          const s1 = STATS[i], s2 = STATS[j];
          if ((stats[s1] || 1) >= 75 && (stats[s2] || 1) >= 75) {
            eligibleHybridPairPerks.push(`${s1}+${s2}`);
          }
        }
      }
    }

    return {
      titlePrefix: rankPrefix,
      primaryType,
      primaryRank,
      secondaryType,
      secondaryRank,
      isSpecialistSmith,
      craftBonusPct,
      synergy: pData.skill_synergy,
      eligibleSingleStatPerks,
      eligibleHybridPairPerks
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
    weapon = { stat: "STR", tier: 1, tag: "Dekat", element: "Neutral", budget: { damage: 40, speed: 15, accuracy: 15, defense: 5, trigger: 25 } },
    armorClass = "sedang",
    armorElement = "Fire",
    armorSlotsSameElement = 5,
    wdEnemy = { name: "Ashwind Brute", lvl: 30, role: "Brute", type: "Reguler", el: "Fire", weak: "Ice" },
    maxSeconds = 120
  }) {
    const tier = getTierForLevel(level);
    const build = buildMacroLoadout({ stats, focusSubStats, selectedUtilities, loadout, smithConfig });
    const sub = build.subStats.byId;
    const pas = build.passiveTotals;
    const monster = computeMonsterStats(wdEnemy);

    // HP Pemain = (20 + 5 * CON + 5 * tier) * (1 + max_hp_pct)
    const baseHp = 20 + sub.con_max_vitality.value + 5 * tier;
    const maxPlayerHp = Math.round(baseHp * (1 + pas.max_hp_pct / 100));

    // Anggaran poin senjata = 100 + 15 * (weapon.tier - 1)
    const totalBudget = 100 + 15 * ((weapon.tier || tier) - 1);
    const wDmgPoints = totalBudget * ((weapon.budget?.damage || 30) / 100);
    const wSpdPoints = totalBudget * ((weapon.budget?.speed || 15) / 100);
    const wAccPoints = totalBudget * ((weapon.budget?.accuracy || 15) / 100);
    const wDefPoints = totalBudget * ((weapon.budget?.defense || 10) / 100);
    const wTrgPoints = totalBudget * ((weapon.budget?.trigger || 25) / 100);

    const weaponBaseDmg = wDmgPoints / 4;
    const isRanged = weapon.tag === "Jauh";

    // Kecepatan serang dasar
    const totalAtkSpdPct = wSpdPoints + sub.dex_attack_speed.value + pas.attack_speed_pct;
    const playerAttacksPerSec = +(1.0 * (1 + totalAtkSpdPct / 100)).toFixed(2);

    // Peluang kena (cap 95%)
    const titleHitBonus = build.title.type === "Spesialis"
      ? (build.title.primaryStat === weapon.stat ? 5 : -5)
      : 0;
    const playerHitChance = Math.min(95, 75 + wAccPoints + sub.dex_accuracy.value + pas.accuracy_pct + titleHitBonus - monster.dodge);

    // Dodge, Parry, Critical (cap bersama bonus peluang +30% dari stat dasar)
    let rawDodge = Math.min(20, sub.dex_evasion.value) + (isRanged ? 8 : 0) + (armorClass === "ringan" ? 8 : armorClass === "sedang" ? 4 : 0) + pas.dodge_pct;
    let rawParry = isRanged ? 0 : (Math.min(20, sub.dex_parry_reflex.value) + (armorClass === "ringan" ? 8 : armorClass === "sedang" ? 4 : 0) + pas.parry_pct);
    let rawCrit = Math.min(20, sub.wis_crit_chance.value) + pas.crit_chance_pct;

    const critMultiplier = 2.0 + (sub.wis_crit_severity.value + pas.crit_dmg_pct) / 100;

    // Trigger senjata
    const mainStatVal = stats[weapon.stat] || 10;
    const triggerMult = 1 + (sub.int_trigger_mastery.value + pas.trigger_power_pct) / 100;
    const effectiveTrigger = wTrgPoints * 0.8 * (1 + 0.01 * mainStatVal) * triggerMult;
    const triggerDmgBonus = ["STR", "DEX", "INT", "WIS"].includes(weapon.stat)
      ? effectiveTrigger / 4
      : weapon.stat === "CHA" ? effectiveTrigger / 8 : 0;
    const triggerDefPct = weapon.stat === "CON" ? effectiveTrigger / 2 : weapon.stat === "CHA" ? effectiveTrigger / 4 : 0;

    // Faktor elemen dasar (B4 LOCKED: +25% weak + sub-stat INT Weakness Exploit; -25% sama el)
    function getElementMultiplier(atkElement, autoMatchWeakness = false) {
      const el = autoMatchWeakness || atkElement === "Adaptive" ? monster.weak : (atkElement || weapon.element || "Neutral");
      if (el !== "Neutral" && el === monster.weak) {
        return 1.25 + (sub.int_weakness_exploit.value + pas.weakness_bonus_pct + sub.int_elemental_potency.value + pas.elemental_dmg_pct) / 100;
      }
      if (el !== "Neutral" && el === monster.el) {
        return 0.75;
      }
      return 1.0 + (el !== "Neutral" ? (sub.int_elemental_potency.value + pas.elemental_dmg_pct) / 200 : 0);
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

    const cooldowns = new Map(build.equippedSkills.map(s => [s.id, 0]));
    const activeProcs = new Set();
    let activeBuffDmgRedPct = 0;
    let activeBuffTimer = 0;

    let basicAtkAccumulator = 0;
    let monsterAtkAccumulator = 0;
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

        const dmg = baseStrike * skillMult * elemMult * expectedCritFactor * (1 - effectiveMonsterArmor / 100) * (playerHitChance / 100);
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

        const dmg = baseStrike * titleMult * rangedMult * elemMult * expectedCritFactor * (1 - effectiveMonsterArmor / 100) * (playerHitChance / 100);
        monsterHp -= dmg;
        totalDamageDealt += dmg;
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

        // Mitigate CON (cap 50% mentah)
        const flatMitigate = Math.min(rawIncoming * 0.5, sub.con_mitigate.value);
        const afterMitigate = Math.max(1, rawIncoming - flatMitigate);

        // Pengurang persen (weapon defense + trigger + passive + buff, cap 60%)
        const armorClassMit = armorClass === "berat" ? 10 : armorClass === "sedang" ? 5 : 0;
        const totalPctRed = Math.min(60, (wDefPoints / 2) + triggerDefPct + pas.dmg_reduction_pct + armorClassMit + activeBuffDmgRedPct);

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

    return {
      playerSummary: {
        level,
        tier,
        maxPlayerHp,
        title: build.title.type,
        smithClass: `${build.smith.titlePrefix} ${build.smith.primaryType}`,
        macroSlotsUsed: `${build.equippedSkills.length}/${build.maxSlots}`,
        unlockedNodes: build.unlockedCount
      },
      monsterSummary: monster,
      metrics: {
        dps,
        dtps,
        timeToDieSec,
        killsPerHpBar,
        skillsCastCount,
        procsTriggered,
        procsConsumed
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
    simulateBattle
  };
}
