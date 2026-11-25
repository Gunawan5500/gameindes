/**
 * Battle-Smith RPG — Unified Core Game Loop & Idle Save-State Engine (BETA v1.0)
 * Arsitektur Opsi A (LOCKED): Event-Driven Hybrid Tick + Sparse JSON Save-State
 *
 * Mengintegrasikan 4 Engine Backend Resmi (CD v3.2 + WD v1.9):
 * 1. Skill & Combat Engine (engines/skill_engine/skill_engine.js):
 *    - 6 Stat Utama (Lv1-150, Cap 30/60/90/120/150, 311 poin di Lv150) & 60 Sub-Stat (+25% Fokus)
 *    - 150 Node SWTOR Discipline + Cross-Stat Macro Loadout (3-6 slot)
 *    - 5-Tier Smith Class Point Budget & Single-Word Class Names (CD-3.02b) + 21 Smith Perks (CD-3.03)
 *    - Anti-Farm XP & Drop Lv150 (CD-1.08), Uncapped Balanced +N (CD-4.02), Apprentice Seed AI (CD-6.02), Gate Curse & Long Rest (CD-7)
 * 2. Forge & Element Fusion Engine (engines/skill_engine/forge_engine.js):
 *    - 208 Bahan WD (16 Area, Hidden Trait), 48 Senjata + 15 Armor (63 item), Mode Fusi Inti Kedua (6 Elemen Hibrida)
 * 3. Supply & Demand Regional Market Engine (engines/snd_prototype/snd_engine.js):
 *    - 77 Pasar Berjenjang (Village/Town/City/Major City), Sparse Delta Save, Lazy Decay 12 Jam, Politik Faksi
 * 4. Narrative Moral Issue Engine (engines/issue_engine/issue_engine.js):
 *    - 36 Templat Berslot + Twist Deterministik per Seed Save, Conscience Alignment, & Loyalitas Murid (±1)
 */
import {
  createSkillEngine,
  getTierForLevel,
  getStatCapForLevel,
  getTotalStatPointsForLevel,
  computeMonsterStats
} from "../skill_engine/skill_engine.js";
import { createForgeEngine, parseMaterialsCsv, ALL_CRAFTABLE_ITEMS_63 as WEAPONS_CATALOG } from "../skill_engine/forge_engine.js";
import { BasicSnDEngine, formatCurrency } from "../snd_prototype/snd_engine.js";
import { createIssueEngine } from "../issue_engine/issue_engine.js";

const SEASONS = ["Spring", "Summer", "Autumn", "Winter"];

export function getXpQuotaForLevel(level) {
  return Math.round(60 * Math.pow(level, 1.1));
}

export function getHourlyXpCapForLevel(level) {
  if (level <= 10) return 600;
  if (level <= 20) return 900;
  if (level <= 30) return 1200;
  return 1200 + 60 * (level - 30); // Mencapai 8.400 XP/jam di Lv150 (CD-1.04 LOCKED)
}

export class UnifiedBetaGameLoop {
  constructor({
    skillData,
    materialsCsvText,
    economyConfig,
    locations,
    factions,
    relations,
    dummyItems,
    issueTemplates,
    materialsList,
    areaEnemiesByTier = {},
    saveSeed = "BETA-SAVE-2026"
  }) {
    this.skillEngine = createSkillEngine(skillData);
    const parsedMats = parseMaterialsCsv(materialsCsvText);
    this.forgeEngine = createForgeEngine({
      skillEngine: this.skillEngine,
      weapons: WEAPONS_CATALOG,
      materials: parsedMats
    });
    this.sndEngine = new BasicSnDEngine({
      config: economyConfig,
      locations,
      factions,
      relations,
      items: dummyItems,
      initialWorldState: { day: 1, season: "Spring", festivalActive: false }
    });
    this.issueEngine = createIssueEngine({
      templates: issueTemplates.templates,
      twists: issueTemplates.twists,
      locations,
      relations,
      materials: materialsList
    });

    this.locations = locations;
    this.areaEnemiesByTier = areaEnemiesByTier;

    // Inisialisasi State Beta Default (Lv1, Tier 1)
    this.state = this.createInitialState(saveSeed);
  }

  createInitialState(saveSeed = "BETA-SAVE-2026") {
    const startLoc = this.locations.find(l => l.location_name === "Briarfall City")?.location_id
      || this.locations[0]?.location_id || "LOC-01";

    // Bangkitkan 5 Murid Awal dari Seed Prosedural (CD-6.01 & CD-6.02: maks 5 murid)
    const defaultSeeds = [
      "APR-7F3A-Kael",
      "APR-99B1-Lyra",
      "APR-44C8-Garrick",
      "APR-12D9-Vesper",
      "APR-88E2-Thorne"
    ];
    const apprentices = defaultSeeds.map((seed, idx) => {
      const profile = this.skillEngine.generateApprenticeFromSeed(seed, 25 + idx * 5, 0);
      return {
        seed,
        skill: profile.effectiveSkill,
        loyalty: profile.loyalty,
        passedTrials: 0,
        isCompanion: idx === 0,
        branchLocationId: null
      };
    });

    return {
      version: "BETA-1.0-CDv3.2-WDv1.9",
      saveSeed,
      calendar: {
        totalIdleHours: 0,
        day: 1,
        year: 1,
        season: "Spring",
        nowMs: Date.UTC(2026, 10, 21, 8, 0, 0)
      },
      player: {
        name: "Alden the Battle-Smith",
        background: "Pandai Besi",
        level: 1,
        unlockedGateTier: 1, // Naik ke 2..5 setelah lulus Gate Boss di Lv30/60/90/120
        stats: { STR: 4, DEX: 2, CON: 3, INT: 2, WIS: 1, CHA: 1 }, // Total Lv1 = 13 poin (CD-1.01)
        unspentStatPoints: 0,
        focusSubStats: {
          STR: ["str_raw_might", "str_armor_crush"],
          DEX: ["dex_attack_speed", "dex_accuracy"],
          CON: ["con_max_vitality", "con_mitigate"],
          INT: ["int_macro_capacity", "int_weakness_exploit"],
          WIS: ["wis_crit_chance", "wis_rare_drop"],
          CHA: ["cha_trade_bargain", "cha_apprentice_lead"]
        },
        smithTiers: { Weaponsmith: 1, Armorer: 0, Rangesmith: 0, Runesmith: 0, Reforger: 0 },
        selectedPerkT3: "STR",
        selectedPerkT5: "STR+CON",
        selectedUtilities: {
          STR_T1: "str_t1_u1",
          STR_T2: "str_t2_u1",
          STR_T3: "str_t3_u1",
          STR_T4: "str_t4_u1",
          STR_T5: "str_t5_u1",
          CON_T1: "con_t1_u2",
          INT_T1: "int_t1_u1",
          DEX_T1: "dex_t1_u1"
        },
        loadout: [
          { activeId: "str_t1_a", modIds: ["str_t1_u1", "dex_t1_u1"] },
          { activeId: "str_t2_a", modIds: ["str_t2_u1"] },
          { activeId: "str_t3_a", modIds: ["str_t3_u1", "int_t1_u1"] },
          { activeId: "str_t5_a", modIds: ["str_t5_u1", "str_t4_u1"] }
        ],
        xp: {
          battle: 0,
          smith: 0,
          crossBuffBattleToSmithPct: 0,
          crossBuffSmithToBattlePct: 0
        },
        stamina: {
          current: 115,
          max: 115
        },
        curses: {
          activeStacks: 0,
          highestGateTierCursed: 1
        },
        conscienceScore: 0, // +Mulia / -Kejam
        bronze: 5000, // 50s modal awal
        currentLocationId: startLoc
      },
      equipment: {
        weapon: {
          id: "w_str_1",
          name: "Kapak Perang Permulaan",
          stat: "STR",
          tier: 1,
          rarity: "Common",
          enhancePlus: 0,
          tag: "Dekat",
          trigger: "Twister",
          element: "Fire",
          budget: { damage: 35, speed: 15, accuracy: 15, defense: 5, trigger: 30 }
        },
        armorClass: "sedang",
        armorElement: "Fire",
        armorSlotsSameElement: 5
      },
      apprentices,
      branches: [], // [{ locationId, apprenticeSeed, tier, dailyIncomeBr }]
      inventory: {
        materials: { "MAT-A09-04": 12, "MAT-A09-05": 12, "MAT-A09-07": 6, "MAT-A09-08": 6 },
        forgedGallery: []
      },
      narrative: {
        activeIssue: null,
        resolvedHistory: [],
        eventLogs: []
      },
      huntState: {
        rngCounter: 1,
        regionPatrolHours: {},
        areaPatrolHours: {},
        defeatedMiniBossIds: [],
        bossCooldownUntilDay: {}
      }
    };
  }

  _ensureHuntState() {
    if (!this.state.huntState || typeof this.state.huntState !== "object") {
      this.state.huntState = {
        rngCounter: 1,
        regionPatrolHours: {},
        areaPatrolHours: {},
        defeatedMiniBossIds: [],
        bossCooldownUntilDay: {}
      };
    }
    const hs = this.state.huntState;
    if (!Number.isFinite(hs.rngCounter)) hs.rngCounter = 1;
    if (!hs.regionPatrolHours) hs.regionPatrolHours = {};
    if (!hs.areaPatrolHours) hs.areaPatrolHours = {};
    if (!Array.isArray(hs.defeatedMiniBossIds)) hs.defeatedMiniBossIds = [];
    if (!hs.bossCooldownUntilDay) hs.bossCooldownUntilDay = {};
    return hs;
  }

  _nextHuntRng() {
    const hs = this._ensureHuntState();
    let h = 2166136261 >>> 0;
    const str = `${this.state.saveSeed || "BSRPG"}:${this.state.calendar.day}:${hs.rngCounter++}`;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return ((h >>> 0) % 100000) / 100000;
  }

  _rollMonsterDrops(monster, rollsCount = 1, effectiveDropMult = 1.0) {
    const materialsLooted = {};
    const trophiesFound = [];
    if (!monster || rollsCount <= 0) return { materialsLooted, trophiesFound };

    const mult = Math.max(0.05, Math.min(1.6, effectiveDropMult || 1.0));
    const drops = Array.isArray(monster.drops) ? monster.drops : [];
    const invMats = this.state.inventory.materials || (this.state.inventory.materials = {});

    for (let r = 0; r < rollsCount; r++) {
      for (const entry of drops) {
        const [itemId, baseChance, minQ = 1, maxQ = 1] = entry;
        if (!itemId) continue;
        const chance = Math.min(1.0, Number(baseChance || 0) * mult);
        if (this._nextHuntRng() <= chance) {
          const span = Math.max(0, Number(maxQ) - Number(minQ));
          const qty = Number(minQ) + (span > 0 ? Math.floor(this._nextHuntRng() * (span + 1)) : 0);
          if (qty <= 0) continue;
          if (String(itemId).startsWith("MAT-")) {
            invMats[itemId] = Math.min(9999, (invMats[itemId] || 0) + qty);
            materialsLooted[itemId] = (materialsLooted[itemId] || 0) + qty;
          } else if (trophiesFound.length < 6) {
            trophiesFound.push({ name: String(itemId), qty });
          }
        }
      }

      if (monster.uniq && monster.uniq.name) {
        const uChance = Math.min(0.5, Number(monster.uniq.ch || 0) * mult);
        if (this._nextHuntRng() <= uChance && trophiesFound.length < 6) {
          trophiesFound.push({ name: `✦ ${monster.uniq.name}`, qty: 1, isUnique: true });
        }
      }
    }

    return { materialsLooted, trophiesFound };
  }

  _log(msg) {
    const entry = `[Thn ${this.state.calendar.year} Hari ${this.state.calendar.day} • Lv${this.state.player.level}] ${msg}`;
    this.state.narrative.eventLogs.push(entry);
    if (this.state.narrative.eventLogs.length > 25) {
      this.state.narrative.eventLogs.shift();
    }
    return entry;
  }

  getActiveCompanion() {
    const app = this.state.apprentices.find(a => a.isCompanion);
    if (!app) return null;
    return this.skillEngine.generateApprenticeFromSeed(app.seed, app.skill, app.passedTrials);
  }

  /**
   * Otomatis alokasi poin stat sesuai model 60% Stat Utama + 25% CON/DEX + 15% INT/WIS/CHA sampai Cap Tier
   */
  autoAllocateStats(primaryStat = "STR") {
    const p = this.state.player;
    const cap = p.unlockedGateTier * 30;
    const totalAllowed = getTotalStatPointsForLevel(p.level);
    const order = [primaryStat, "CON", "INT", "DEX", "WIS", "CHA"].filter((v, i, a) => a.indexOf(v) === i);

    let currentSum = Object.values(p.stats).reduce((a, b) => a + b, 0);
    let toSpend = Math.max(0, totalAllowed - currentSum);

    while (toSpend > 0) {
      let spentInLoop = false;
      for (const st of order) {
        if (toSpend <= 0) break;
        if (p.stats[st] < cap) {
          p.stats[st] += 1;
          toSpend -= 1;
          spentInLoop = true;
          if (st === primaryStat && p.stats[st] < cap && toSpend > 0) {
            p.stats[st] += 1;
            toSpend -= 1;
          }
        }
      }
      if (!spentInLoop) break;
    }

    p.unspentStatPoints = toSpend;
    p.stamina.max = 100 + 5 * p.stats.CON;
    p.stamina.current = p.stamina.max;
  }

  /**
   * 1. CORE IDLE TICK (Opsi A: mendukung live tick 0.1 jam maupun Offline Cap 8 jam CD-7.01)
   * Patokan Kalender WD (CD-1.06): 60 jam idle = 1 tahun (360 hari) -> 1 jam idle = 6 hari in-game.
   */
  advanceIdleHours({
    hours = 4,
    mode = "Battle",
    targetMonster = null,
    levelPool = null,
    regionMiniBoss = null,
    areaId = null,
    regionId = null,
    autoAlternateBars = false
  }) {
    const effectiveHours = Math.min(8, Math.max(0.1, hours)); // Offline cap 8 jam (CD-7.01)
    const p = this.state.player;
    const eq = this.state.equipment;
    const hs = this._ensureHuntState();
    const subStats = this.skillEngine.computeSubStats(p.stats, p.focusSubStats).byId;

    // Cek apakah pemain lumpuh karena Kutukan Gate (CD-7.01)
    const curseStatus = this.skillEngine.computeGateCurseAndRest({
      level: p.level,
      gateTier: p.curses.highestGateTierCursed,
      activeCurseStacks: p.curses.activeStacks,
      atOwnWorkshopOrBranch: true,
      conCurseResistPct: subStats.con_curse_resist?.value || 0
    });
    if (mode === "Battle" && curseStatus.isIncapacitated) {
      return {
        aborted: true,
        reason: `Lumpuh oleh Kutukan Gate (${curseStatus.currentTotalDebuff}/${curseStatus.incapacitateThreshold}). Lakukan Long Rest terlebih dahulu!`
      };
    }

    // Jika mode Konsep 2 (levelPool tersedia), acak monster representatif & rentetan encounter dari kolam level tersebut
    const validPool = Array.isArray(levelPool) && levelPool.length > 0 ? levelPool : null;
    const regularsInPool = validPool ? validPool.filter(m => m.type === "Reguler") : [];
    const specialsInPool = validPool ? validPool.filter(m => m.type === "Reguler Khusus") : [];

    const pickFromLevelPool = () => {
      if (!validPool) return null;
      const rollSpecial = specialsInPool.length > 0 && this._nextHuntRng() < 0.10;
      const bucket = rollSpecial ? specialsInPool : (regularsInPool.length > 0 ? regularsInPool : validPool);
      const idx = Math.floor(this._nextHuntRng() * bucket.length);
      return bucket[Math.min(bucket.length - 1, idx)];
    };

    const defaultMonster = (validPool ? pickFromLevelPool() : targetMonster) || {
      name: `Tier-${p.unlockedGateTier} Patrol Brute`,
      lvl: p.level,
      role: "Brute",
      type: "Reguler",
      el: "Ice",
      weak: eq.weapon.element || "Fire"
    };

    const comp = this.getActiveCompanion();
    const sim = this.skillEngine.simulateBattle({
      level: p.level,
      stats: p.stats,
      focusSubStats: p.focusSubStats,
      selectedUtilities: p.selectedUtilities,
      loadout: p.loadout,
      smithConfig: {
        tiers: p.smithTiers,
        firstTakenClass: p.firstTakenClass,
        activeDestinyId: p.activeDestinyId,
        selectedPerkT3: p.selectedPerkT3,
        selectedPerkT5: p.selectedPerkT5
      },
      skillMasteryState: p.skillMasteryState || null,
      activeDestinyId: p.activeDestinyId || null,
      weapon: eq.weapon,
      armorClass: eq.armorClass,
      armorElement: eq.armorElement,
      armorSlotsSameElement: eq.armorSlotsSameElement,
      apprenticeSeed: comp?.seed || null,
      apprenticeSkill: comp?.effectiveSkill || 50,
      apprenticeTrials: comp?.passedTrials || 0,
      wdEnemy: defaultMonster,
      maxSeconds: 60
    });

    // Hitung efisiensi stamina & jam efektif (Sub-Stat CON Battle/Forge Stamina mengurangi laju kuras stamina)
    const isRanged = eq.weapon.tag === "Jauh";
    const staminaSaveFactor = Math.max(0.55, 1 - (subStats.con_battle_stamina?.value || 0) / 250);
    const staminaBurnPerHour = (mode === "Battle" ? 20 * (isRanged ? 1.2 : 1.0) : 14) * staminaSaveFactor;
    const maxStaminaHours = p.stamina.current / staminaBurnPerHour;
    const activeHours = Math.min(effectiveHours, maxStaminaHours);
    p.stamina.current = Math.max(0, +(p.stamina.current - activeHours * staminaBurnPerHour).toFixed(1));

    // Laju XP/jam sesuai CD-1.04 & Anti-Farm CD-1.08 (target ~720 jam idle total sampai Lv150 = 12 tahun kalender WD)
    const hourlyCap = getHourlyXpCapForLevel(p.level);
    const antiFarm = sim.antiFarmSummary;
    const title = this.skillEngine.evaluateTitle(p.stats);
    const crossBuffEfficiency = title.type === "Seimbang" ? 1.10 : 1.0;

    let battleXpGained = 0;
    let smithXpGained = 0;
    let bronzeEarned = 0;
    let levelsGained = 0;
    const battleHoursActive = autoAlternateBars ? activeHours * 0.5 : (mode === "Battle" ? activeHours : 0);

    if (autoAlternateBars) {
      const hBattle = activeHours * 0.5;
      const hSmith = activeHours * 0.5;
      const workshopSynergyMult = 1.22;
      battleXpGained = Math.round(hBattle * hourlyCap * workshopSynergyMult * antiFarm.xpMult * (1 + (p.xp.crossBuffSmithToBattlePct * crossBuffEfficiency) / 100));
      smithXpGained = Math.round(hSmith * hourlyCap * workshopSynergyMult * (1 + (p.xp.crossBuffBattleToSmithPct * crossBuffEfficiency) / 100));
      bronzeEarned += Math.round(hBattle * 120 * p.unlockedGateTier * antiFarm.effectiveDropMult + hSmith * 150 * p.unlockedGateTier);
    } else if (mode === "Battle") {
      const buffMult = 1 + (p.xp.crossBuffSmithToBattlePct * crossBuffEfficiency) / 100;
      battleXpGained = Math.round(activeHours * hourlyCap * antiFarm.xpMult * buffMult);
      p.xp.crossBuffSmithToBattlePct = 0;
      bronzeEarned += Math.round(activeHours * 160 * p.unlockedGateTier * antiFarm.effectiveDropMult);
    } else {
      const buffMult = 1 + (p.xp.crossBuffBattleToSmithPct * crossBuffEfficiency) / 100;
      smithXpGained = Math.round(activeHours * hourlyCap * buffMult);
      p.xp.crossBuffBattleToSmithPct = 0;
      const bargainMult = 1 + (subStats.cha_trade_bargain?.value || 0) / 100;
      bronzeEarned += Math.round(activeHours * 180 * p.unlockedGateTier * bargainMult);
    }

    // Roll Pertemuan Kolam Monster per Level + Drop Material ke Tas + Peluang Sergapan Mini Boss (8%/jam)
    const encounteredMonsters = [];
    const materialsLooted = {};
    const trophiesFound = [];
    let miniBossAmbush = null;

    const mergeDrops = (dropRes) => {
      for (const [mId, q] of Object.entries(dropRes.materialsLooted || {})) {
        materialsLooted[mId] = (materialsLooted[mId] || 0) + q;
      }
      for (const tr of (dropRes.trophiesFound || [])) {
        if (trophiesFound.length < 8) trophiesFound.push(tr);
      }
    };

    if (battleHoursActive > 0) {
      if (regionId) {
        hs.regionPatrolHours[regionId] = +((hs.regionPatrolHours[regionId] || 0) + battleHoursActive).toFixed(2);
      }
      if (areaId) {
        hs.areaPatrolHours[areaId] = +((hs.areaPatrolHours[areaId] || 0) + battleHoursActive).toFixed(2);
      }

      const encounterRolls = Math.max(1, Math.round(battleHoursActive * 3));
      if (validPool) {
        const countById = {};
        for (let i = 0; i < encounterRolls; i++) {
          const m = pickFromLevelPool();
          if (!m) continue;
          if (!countById[m.id]) {
            countById[m.id] = { id: m.id, name: m.name, type: m.type, lvl: m.lvl, count: 0 };
          }
          countById[m.id].count += 1;
          mergeDrops(this._rollMonsterDrops(m, 1, antiFarm.effectiveDropMult));
        }
        encounteredMonsters.push(...Object.values(countById));
      } else if (targetMonster && Array.isArray(targetMonster.drops)) {
        encounteredMonsters.push({
          id: targetMonster.id || "target",
          name: targetMonster.name,
          type: targetMonster.type || "Reguler",
          lvl: targetMonster.lvl,
          count: encounterRolls
        });
        mergeDrops(this._rollMonsterDrops(targetMonster, encounterRolls, antiFarm.effectiveDropMult));
      }

      // Peluang kecil Mini Boss menyergap di Mode Idle (~8% per jam efektif Battle, hanya jika belum kena cooldown)
      if (regionMiniBoss && regionMiniBoss.id) {
        const cdUntil = hs.bossCooldownUntilDay[regionMiniBoss.id] || 0;
        if (this.state.calendar.day >= cdUntil) {
          const ambushProb = 1 - Math.pow(1 - 0.08, battleHoursActive);
          if (this._nextHuntRng() < ambushProb) {
            const mbSim = this.skillEngine.simulateBattle({
              level: p.level,
              stats: p.stats,
              focusSubStats: p.focusSubStats,
              selectedUtilities: p.selectedUtilities,
              loadout: p.loadout,
              smithConfig: {
                tiers: p.smithTiers,
                firstTakenClass: p.firstTakenClass,
                activeDestinyId: p.activeDestinyId,
                selectedPerkT3: p.selectedPerkT3,
                selectedPerkT5: p.selectedPerkT5
              },
              skillMasteryState: p.skillMasteryState || null,
              activeDestinyId: p.activeDestinyId || null,
              weapon: eq.weapon,
              armorClass: eq.armorClass,
              armorElement: eq.armorElement,
              armorSlotsSameElement: eq.armorSlotsSameElement,
              apprenticeSeed: comp?.seed || null,
              apprenticeSkill: comp?.effectiveSkill || 50,
              apprenticeTrials: comp?.passedTrials || 0,
              wdEnemy: regionMiniBoss,
              maxSeconds: 90
            });
            const mbWon = mbSim.metrics.killsPerHpBar >= 1.0;
            if (mbWon) {
              const bonusBr = Math.round(220 * p.unlockedGateTier);
              const bonusXp = Math.round(hourlyCap * 0.35);
              bronzeEarned += bonusBr;
              battleXpGained += bonusXp;
              mergeDrops(this._rollMonsterDrops(regionMiniBoss, 1, Math.max(1.0, mbSim.antiFarmSummary.effectiveDropMult)));
              if (!hs.defeatedMiniBossIds.includes(regionMiniBoss.id)) {
                hs.defeatedMiniBossIds.push(regionMiniBoss.id);
              }
              this._log(`⚡ SERGAPAN IDLE! ${regionMiniBoss.name} (Lv.${regionMiniBoss.lvl}) muncul & berhasil dikalahkan (+${formatCurrency(bonusBr)})!`);
              miniBossAmbush = { triggered: true, won: true, name: regionMiniBoss.name, lvl: regionMiniBoss.lvl, bonusBr, bonusXp };
            } else {
              this._log(`⚡ SERGAPAN IDLE! ${regionMiniBoss.name} (Lv.${regionMiniBoss.lvl}) menyergap namun karakter terpukul mundur (${mbSim.metrics.killsPerHpBar}x).`);
              miniBossAmbush = { triggered: true, won: false, name: regionMiniBoss.name, lvl: regionMiniBoss.lvl, killsPerHpBar: mbSim.metrics.killsPerHpBar };
            }
          }
        }
      }
    }

    p.xp.battle += battleXpGained;
    p.xp.smith += smithXpGained;
    p.bronze += bronzeEarned;

    // Latih 5 Murid selama jam idle (CD-6.01 & CD-6.02)
    const leadMult = 1 + (subStats.cha_apprentice_lead?.value || 0) / 100;
    for (const app of this.state.apprentices) {
      const prof = this.skillEngine.generateApprenticeFromSeed(app.seed, app.skill, app.passedTrials);
      const gain = +(activeHours * (prof.learningRate / 180) * leadMult).toFixed(2);
      app.skill = Math.min(prof.talentCap, +(app.skill + gain).toFixed(2));
    }

    // Loop Kenaikan Level (CD-1.04: naik bila kedua bar penuh, carry-over maks 50% kuota berikutnya, tertahan di Gate Lv30/60/90/120)
    const maxLevelForCurrentGate = p.unlockedGateTier * 30;
    while (p.level < maxLevelForCurrentGate) {
      const quota = getXpQuotaForLevel(p.level);
      if (p.xp.battle >= quota && p.xp.smith >= quota) {
        const nextQuota = getXpQuotaForLevel(p.level + 1);
        const carryCap = Math.round(nextQuota * 0.5);

        const excessBattle = p.xp.battle - quota;
        const excessSmith = p.xp.smith - quota;

        p.xp.battle = Math.min(carryCap, excessBattle);
        p.xp.smith = Math.min(carryCap, excessSmith);

        // Kelebihan di atas carry-over menjadi Muatan Buff Silang (CD-1.05, cap +25%)
        if (excessBattle > carryCap) {
          p.xp.crossBuffBattleToSmithPct = Math.min(25, +(p.xp.crossBuffBattleToSmithPct + ((excessBattle - carryCap) / nextQuota) * 15).toFixed(1));
        }
        if (excessSmith > carryCap) {
          p.xp.crossBuffSmithToBattlePct = Math.min(25, +(p.xp.crossBuffSmithToBattlePct + ((excessSmith - carryCap) / nextQuota) * 15).toFixed(1));
        }

        p.level += 1;
        p.unspentStatPoints += 2;
        levelsGained += 1;
      } else {
        if (p.xp.battle > quota) {
          const overflow = p.xp.battle - quota;
          p.xp.battle = quota;
          p.xp.crossBuffBattleToSmithPct = Math.min(25, +(p.xp.crossBuffBattleToSmithPct + (overflow / quota) * 10).toFixed(1));
        }
        if (p.xp.smith > quota) {
          const overflow = p.xp.smith - quota;
          p.xp.smith = quota;
          p.xp.crossBuffSmithToBattlePct = Math.min(25, +(p.xp.crossBuffSmithToBattlePct + (overflow / quota) * 10).toFixed(1));
        }
        break;
      }
    }

    // Majukan Kalender Dunia (60 jam idle = 360 hari -> 1 jam = 6 hari)
    const cal = this.state.calendar;
    const prevDay = cal.day;
    cal.totalIdleHours = +(cal.totalIdleHours + effectiveHours).toFixed(2);
    const totalDays = 1 + Math.floor(cal.totalIdleHours * 6);
    const daysElapsed = Math.max(0, totalDays - prevDay);
    cal.day = totalDays;
    cal.year = 1 + Math.floor((cal.day - 1) / 360);
    cal.season = SEASONS[Math.floor(((cal.day - 1) % 360) / 90)];
    cal.nowMs += Math.round(effectiveHours * 3600 * 1000);

    // Update Pasar SnD & Pendapatan Cabang Toko Murid (WD-3.10 & WD-5.06)
    this.sndEngine.worldState.day = cal.day;
    this.sndEngine.worldState.season = cal.season;
    this.sndEngine.autoPrune(cal.nowMs);

    let branchIncomeBr = 0;
    if (daysElapsed > 0 && this.state.branches.length > 0) {
      for (const br of this.state.branches) {
        const app = this.state.apprentices.find(a => a.seed === br.apprenticeSeed);
        const loyaltyFactor = app && app.loyalty < 50 ? 0.5 : 1.0;
        const inc = Math.round(daysElapsed * br.dailyIncomeBr * loyaltyFactor);
        branchIncomeBr += inc;
      }
      p.bronze += branchIncomeBr;
    }

    // Bangkitkan Issue Moral bila belum ada yang aktif
    if (!this.state.narrative.activeIssue && daysElapsed >= 3) {
      this.state.narrative.activeIssue = this.issueEngine.generate({
        seed: this.state.saveSeed,
        day: cal.day,
        locationId: p.currentLocationId,
        history: this.state.narrative.resolvedHistory,
        counter: (this.state.narrative.totalResolvedCount || 0)
      });
    }

    return {
      effectiveHours,
      activeHours,
      daysElapsed,
      battleXpGained,
      smithXpGained,
      levelsGained,
      newLevel: p.level,
      bronzeEarned,
      branchIncomeBr,
      combatMetrics: sim.metrics,
      encounteredMonsters,
      materialsLooted,
      trophiesFound,
      miniBossAmbush
    };
  }

  /**
   * 1b. PANGGIL MISI BURUAN MINI BOSS ATAU MISI EKSPEDISI BOSS AREA (DENGAN COOLDOWN & DUEL HP OPSI 3)
   */
  challengeBossMission({ bossMonster, areaId = null, regionId = null, requiredHighMiniBossId = null }) {
    if (!bossMonster || !bossMonster.id) {
      return { ok: false, reason: "Target Boss tidak valid." };
    }
    const p = this.state.player;
    const eq = this.state.equipment;
    const cal = this.state.calendar;
    const hs = this._ensureHuntState();
    const isAreaBoss = bossMonster.type === "Boss";

    // Cek Kutukan Gate lumpuh
    const subStats = this.skillEngine.computeSubStats(p.stats, p.focusSubStats).byId;
    const curseStatus = this.skillEngine.computeGateCurseAndRest({
      level: p.level,
      gateTier: p.curses.highestGateTierCursed,
      activeCurseStacks: p.curses.activeStacks,
      atOwnWorkshopOrBranch: true,
      conCurseResistPct: subStats.con_curse_resist?.value || 0
    });
    if (curseStatus.isIncapacitated) {
      return { ok: false, reason: "Karakter lumpuh oleh Kutukan Gate! Lakukan Long Rest terlebih dahulu." };
    }

    // Cek Cooldown Anti-Farming
    const cdUntil = hs.bossCooldownUntilDay[bossMonster.id] || 0;
    if (cal.day < cdUntil) {
      return {
        ok: false,
        reason: `${bossMonster.name} sedang Cooldown Respawn ${cdUntil - cal.day} hari kalender lagi (selesai di Hari ${cdUntil}).`
      };
    }

    // Cek Syarat Misi Panggil
    if (isAreaBoss) {
      const areaHours = hs.areaPatrolHours[areaId] || 0;
      if (areaHours < 3.0) {
        return {
          ok: false,
          reason: `Syarat Misi Ekspedisi Boss belum terpenuhi: butuh Jejak Patroli Area 3.0 jam (saat ini ${areaHours.toFixed(1)} jam).`
        };
      }
      if (requiredHighMiniBossId && !hs.defeatedMiniBossIds.includes(requiredHighMiniBossId)) {
        return {
          ok: false,
          reason: "Syarat Misi Ekspedisi Boss belum terpenuhi: kalahkan Mini Boss wilayah Tinggi di area ini terlebih dahulu!"
        };
      }
    } else {
      const regHours = hs.regionPatrolHours[regionId] || 0;
      if (regHours < 2.0) {
        return {
          ok: false,
          reason: `Syarat Misi Buruan Wilayah belum terpenuhi: butuh Jejak Patroli Wilayah 2.0 jam (saat ini ${regHours.toFixed(1)} jam).`
        };
      }
    }

    if (p.stamina.current < 15) {
      return { ok: false, reason: "Stamina tidak cukup untuk Misi Boss (butuh minimal 15 STM)." };
    }
    p.stamina.current = +(p.stamina.current - 15).toFixed(1);

    const comp = this.getActiveCompanion();
    const sim = this.skillEngine.simulateBattle({
      level: p.level,
      stats: p.stats,
      focusSubStats: p.focusSubStats,
      selectedUtilities: p.selectedUtilities,
      loadout: p.loadout,
      smithConfig: {
        tiers: p.smithTiers,
        firstTakenClass: p.firstTakenClass,
        activeDestinyId: p.activeDestinyId,
        selectedPerkT3: p.selectedPerkT3,
        selectedPerkT5: p.selectedPerkT5
      },
      skillMasteryState: p.skillMasteryState || null,
      activeDestinyId: p.activeDestinyId || null,
      weapon: eq.weapon,
      armorClass: eq.armorClass,
      armorElement: eq.armorElement,
      armorSlotsSameElement: eq.armorSlotsSameElement,
      apprenticeSeed: comp?.seed || null,
      apprenticeSkill: comp?.effectiveSkill || 55,
      apprenticeTrials: comp?.passedTrials || 0,
      wdEnemy: bossMonster,
      maxSeconds: 120
    });

    const kph = sim.metrics.killsPerHpBar;
    const won = kph >= 1.0;
    const playerMaxHp = sim.playerSummary.maxPlayerHp;
    const bossMaxHp = sim.monsterSummary.hp;

    // Majukan waktu misi 1 hari kalender (~0.17 jam)
    cal.totalIdleHours = +(cal.totalIdleHours + 1 / 6).toFixed(2);
    cal.day = 1 + Math.floor(cal.totalIdleHours * 6);
    cal.year = 1 + Math.floor((cal.day - 1) / 360);
    cal.season = SEASONS[Math.floor(((cal.day - 1) % 360) / 90)];
    cal.nowMs += 600 * 1000;
    this.sndEngine.worldState.day = cal.day;
    this.sndEngine.worldState.season = cal.season;

    let playerEndHp = 0;
    let bossEndHp = 0;
    let bronzeReward = 0;
    let xpReward = 0;
    let drops = { materialsLooted: {}, trophiesFound: [] };
    const cooldownDays = won ? (isAreaBoss ? 18 : 6) : (isAreaBoss ? 6 : 3);
    const cooldownUntilDay = cal.day + cooldownDays;
    hs.bossCooldownUntilDay[bossMonster.id] = cooldownUntilDay;

    if (won) {
      bossEndHp = 0;
      playerEndHp = Math.max(1, Math.round(playerMaxHp * (1 - 1 / Math.max(1.04, kph))));
      const tierMult = Math.max(1, Math.ceil(bossMonster.lvl / 30));
      bronzeReward = Math.round((isAreaBoss ? 750 : 300) * tierMult);
      xpReward = Math.round(getHourlyXpCapForLevel(p.level) * (isAreaBoss ? 0.9 : 0.45) * sim.antiFarmSummary.xpMult);
      p.bronze += bronzeReward;
      p.xp.battle += xpReward;
      drops = this._rollMonsterDrops(bossMonster, 1, Math.max(1.0, sim.antiFarmSummary.effectiveDropMult));
      if (!isAreaBoss && !hs.defeatedMiniBossIds.includes(bossMonster.id)) {
        hs.defeatedMiniBossIds.push(bossMonster.id);
      }
      this._log(`🏆 MISI BOSS TUNTAS! Mengalahkan ${bossMonster.name} (Lv.${bossMonster.lvl}) — Sisa HP ${playerEndHp}/${playerMaxHp}, +${formatCurrency(bronzeReward)}, Cooldown ${cooldownDays} hari.`);
    } else {
      playerEndHp = 0;
      bossEndHp = Math.max(1, Math.round(bossMaxHp * (1 - Math.min(0.98, kph))));
      this._log(`☠ MISI BOSS GAGAL! Tumbang melawan ${bossMonster.name} (Sisa HP Boss ${bossEndHp}/${bossMaxHp}). Cooldown pemulihan ${cooldownDays} hari.`);
    }

    return {
      ok: true,
      won,
      bossName: bossMonster.name,
      bossType: bossMonster.type,
      bossLvl: bossMonster.lvl,
      duelHp: {
        playerMaxHp,
        playerEndHp,
        bossMaxHp,
        bossEndHp
      },
      bronzeReward,
      xpReward,
      materialsLooted: drops.materialsLooted,
      trophiesFound: drops.trophiesFound,
      cooldownDays,
      cooldownUntilDay,
      combatMetrics: sim.metrics,
      combatLogSample: (sim.combatLogSample || []).slice(0, 10)
    };
  }

  /**
   * 2. UJIAN MURID (Milestone Skill 50 & Skill 80 — CD-6.02 LOCKED)
   */
  runApprenticeTrial(apprenticeSeed) {
    const app = this.state.apprentices.find(a => a.seed === apprenticeSeed);
    if (!app) return { success: false, reason: "Murid tidak ditemukan." };

    const reqSkill = app.passedTrials === 0 ? 50 : app.passedTrials === 1 ? 80 : 999;
    if (app.skill < reqSkill) {
      return { success: false, reason: `Skill murid (${app.skill}) belum mencapai syarat Ujian (${reqSkill}).` };
    }

    app.passedTrials += 1;
    app.loyalty = Math.min(100, app.loyalty + 10);
    const updated = this.skillEngine.generateApprenticeFromSeed(app.seed, app.skill, app.passedTrials);
    this._log(`Murid ${app.seed} lulus Ujian #${app.passedTrials}! Kelas Smith: ${updated.smithClass}, Cap Bakat naik ke ${updated.talentCap}, Loyalitas ${app.loyalty}.`);
    return { success: true, apprentice: updated };
  }

  /**
   * 3. BUKA CABANG TOKO DENGAN MURID (CD-6.02 & WD-3.10 LOCKED: Skill >= 60, Loyalitas >= 70, Lulus Ujian >= 1)
   */
  assignApprenticeToBranch(apprenticeSeed, locationId = null) {
    const app = this.state.apprentices.find(a => a.seed === apprenticeSeed);
    if (!app) return { success: false, reason: "Murid tidak ditemukan." };

    const prof = this.skillEngine.generateApprenticeFromSeed(app.seed, app.skill, app.passedTrials);
    if (!prof.canManageBranchShop) {
      return {
        success: false,
        reason: `Syarat Kepala Cabang belum terpenuhi (Skill ${app.skill}/60, Loyalitas ${app.loyalty}/70, Ujian ${app.passedTrials}/1).`
      };
    }

    const locId = locationId || this.state.player.currentLocationId;
    app.branchLocationId = locId;
    app.isCompanion = false;

    const dailyIncomeBr = Math.round(prof.effectiveSkill * 3.5 * this.state.player.unlockedGateTier);
    const branchEntry = {
      locationId: locId,
      apprenticeSeed: app.seed,
      smithSpecialty: prof.smithClass,
      tier: this.state.player.unlockedGateTier,
      dailyIncomeBr
    };
    this.state.branches.push(branchEntry);
    this._log(`Cabang Bengkel dibuka di ${locId} dijaga oleh ${app.seed} (${prof.smithClass}, +${formatCurrency(dailyIncomeBr)}/hari).`);
    return { success: true, branch: branchEntry };
  }

  /**
   * 4. TANTANG BOSS GATE UNTUK NAIK TIER (Lv30, 60, 90, 120, dan Puncak Lv150 — CD-1.07 & CD-7.01)
   */
  challengeGateBoss({ forceWin = false, allocateSmithPointTo = "Weaponsmith" } = {}) {
    const p = this.state.player;
    const gateTier = p.unlockedGateTier;
    const gateBossLevel = gateTier * 30;

    const gateBoss = {
      name: `Gate Guardian of Tier ${gateTier}`,
      lvl: gateBossLevel,
      role: "Boss",
      type: "Boss",
      el: "Ice",
      weak: this.state.equipment.weapon.element || "Fire"
    };

    const comp = this.getActiveCompanion();
    const sim = this.skillEngine.simulateBattle({
      level: p.level,
      stats: p.stats,
      focusSubStats: p.focusSubStats,
      selectedUtilities: p.selectedUtilities,
      loadout: p.loadout,
      smithConfig: {
        tiers: p.smithTiers,
        selectedPerkT3: p.selectedPerkT3,
        selectedPerkT5: p.selectedPerkT5
      },
      weapon: this.state.equipment.weapon,
      armorClass: this.state.equipment.armorClass,
      armorElement: this.state.equipment.armorElement,
      armorSlotsSameElement: this.state.equipment.armorSlotsSameElement,
      apprenticeSeed: comp?.seed || null,
      apprenticeSkill: comp?.effectiveSkill || 60,
      apprenticeTrials: comp?.passedTrials || 1,
      wdEnemy: gateBoss,
      maxSeconds: 120
    });

    const kph = sim.metrics.killsPerHpBar;
    const won = forceWin || kph >= 1.0;
    const playerMaxHp = sim.playerSummary.maxPlayerHp;
    const bossMaxHp = sim.monsterSummary.hp;
    const duelHp = won
      ? { playerMaxHp, playerEndHp: Math.max(1, Math.round(playerMaxHp * (1 - 1 / Math.max(1.04, kph)))), bossMaxHp, bossEndHp: 0 }
      : { playerMaxHp, playerEndHp: 0, bossMaxHp, bossEndHp: Math.max(1, Math.round(bossMaxHp * (1 - Math.min(0.98, kph)))) };

    if (!won) {
      // Kalah Gate = +1 Kutukan Gate (-4 * Tier_Gate per stat, CD-7.01)
      p.curses.activeStacks += 1;
      p.curses.highestGateTierCursed = Math.max(p.curses.highestGateTierCursed, gateTier);
      const subStats = this.skillEngine.computeSubStats(p.stats, p.focusSubStats).byId;
      const curseInfo = this.skillEngine.computeGateCurseAndRest({
        level: p.level,
        gateTier,
        activeCurseStacks: p.curses.activeStacks,
        atOwnWorkshopOrBranch: true,
        conCurseResistPct: subStats.con_curse_resist?.value || 0
      });
      this._log(`Kalah melawan ${gateBoss.name}! Terkena Kutukan Gate Tier ${gateTier} (${curseInfo.maxStatDebuffPerCurse} stat, total debuff ${curseInfo.currentTotalDebuff}/${curseInfo.incapacitateThreshold}).`);
      return { won: false, bossName: gateBoss.name, bossLvl: gateBossLevel, duelHp, curseInfo, combatMetrics: sim.metrics, combatLogSample: (sim.combatLogSample || []).slice(0, 10) };
    }

    // Menang Gate: Buka Tier berikutnya (hingga Tier 5) & +1 Poin Smith Class (CD-3.01: total 5 poin di Tier 5)
    if (p.unlockedGateTier < 5) {
      p.unlockedGateTier += 1;
      const usedSmithPts = Object.values(p.smithTiers).reduce((a, b) => a + b, 0);
      if (usedSmithPts < 5) {
        p.smithTiers[allocateSmithPointTo] = (p.smithTiers[allocateSmithPointTo] || 0) + 1;
      }
    }

    const mastery = this.skillEngine.evaluateSmithMastery(p.stats, { tiers: p.smithTiers });
    this._log(`LULUS GATE TIER ${gateTier} (${gateBoss.name})! Cap Stat naik ke ${p.unlockedGateTier * 30}, Gelar Smith Class: ${mastery.singleWordClassName}.`);
    return {
      won: true,
      bossName: gateBoss.name,
      bossLvl: gateBossLevel,
      duelHp,
      newUnlockedGateTier: p.unlockedGateTier,
      newStatCap: p.unlockedGateTier * 30,
      smithClass: mastery.singleWordClassName,
      combatMetrics: sim.metrics,
      combatLogSample: (sim.combatLogSample || []).slice(0, 10)
    };
  }

  /**
   * 5. LONG REST & PEMULIHAN KUTUKAN GATE (CD-7.03 LOCKED)
   */
  performLongRest({ atOwnWorkshopOrBranch = true } = {}) {
    const p = this.state.player;
    const subStats = this.skillEngine.computeSubStats(p.stats, p.focusSubStats).byId;
    const restInfo = this.skillEngine.computeGateCurseAndRest({
      level: p.level,
      gateTier: p.curses.highestGateTierCursed,
      activeCurseStacks: p.curses.activeStacks,
      atOwnWorkshopOrBranch,
      conCurseResistPct: subStats.con_curse_resist?.value || 0
    });

    const cost = restInfo.longRest.totalLongRestCostBr;
    p.bronze = Math.max(0, p.bronze - cost);
    p.stamina.current = p.stamina.max;
    p.curses.activeStacks = 0;

    return restInfo;
  }

  /**
   * 6. TEMPA, FUSI INTI KEDUA, & ENHANCE +N TANPA BATAS SEIMBANG (CD-4.02 & Forge Engine)
   */
  forgeAndEquipBestWeapon({
    weaponId = "w_str_4",
    materialIds = ["MAT-A01-13", "MAT-A01-11", "MAT-A01-06", "MAT-A01-09"],
    coreElement = "es",
    secondCoreElement = "petir",
    targetEnhancePlus = 15,
    rarityOverride = "Epic"
  } = {}) {
    const p = this.state.player;
    const seq = [0.15, 0.88, 0.05, 0.65, 0.92];
    let idx = 0;
    const detRng = () => seq[idx++ % seq.length];

    const craftRes = this.forgeEngine.executeForge({
      weaponId,
      pickedMaterialIds: materialIds,
      coreElement,
      coreSize: "besar",
      level: p.level,
      stats: p.stats,
      focusSubStats: p.focusSubStats,
      smithConfig: { tiers: p.smithTiers },
      isIdle: false
    }, detRng);

    if (!craftRes.success) return craftRes;
    let item = craftRes.forgedWeapon;

    // Jika pemain punya Runesmith >= 1 dan item Mode Fusi, lakukan Fusi Inti Kedua
    if ((p.smithTiers.Runesmith || 0) >= 1 && item.modeName === "Fusi" && secondCoreElement) {
      const fuseRes = this.forgeEngine.fuseSecondCore({
        forgedWeapon: item,
        secondCoreElement,
        stats: p.stats,
        focusSubStats: p.focusSubStats,
        smithConfig: { tiers: p.smithTiers }
      }, () => 0.90);
      if (fuseRes.success) item = fuseRes.forgedWeapon;
    }

    const subStats = this.skillEngine.computeSubStats(p.stats, p.focusSubStats).byId;
    const enh = this.skillEngine.computeWeaponEnhancement(
      targetEnhancePlus,
      rarityOverride === "Unique",
      subStats.str_enhance_power?.value || 0,
      p.smithTiers.Reforger || 0
    );

    const wMeta = WEAPONS_CATALOG.find(w => w.id === weaponId) || WEAPONS_CATALOG[0];
    this.state.equipment.weapon = {
      id: wMeta.id,
      name: `${item.name} +${targetEnhancePlus}`,
      stat: wMeta.stat,
      tier: p.unlockedGateTier,
      rarity: rarityOverride,
      enhancePlus: targetEnhancePlus,
      tag: wMeta.tag,
      trigger: wMeta.trigger,
      element: item.elementWd || "Fire",
      fused: item.fused,
      hybridFusion: item.hybridFusion?.name || null,
      budget: wMeta.budget
    };

    this.state.inventory.forgedGallery.unshift(this.state.equipment.weapon);
    if (this.state.inventory.forgedGallery.length > 10) {
      this.state.inventory.forgedGallery.pop();
    }
    this._log(`Menempa & memasang ${this.state.equipment.weapon.name} (${rarityOverride}, ${enh.phase}: +${enh.powerBonusPct}% Daya).`);
    return { success: true, equippedWeapon: this.state.equipment.weapon, enhancement: enh };
  }

  /**
   * 7. RESOLUSI ISSUE MORAL (WD-4.12 & CD-6.01: Menggeser Conscience & Loyalitas 5 Murid ±1)
   */
  resolveActiveMoralIssue(choice = "Mulia") {
    const issue = this.state.narrative.activeIssue;
    if (!issue) return { resolved: false, reason: "Tidak ada isu moral aktif." };

    const p = this.state.player;
    const loyaltyDelta = choice === "Mulia" ? 1 : choice === "Kejam" ? -1 : 0;
    const conscienceDelta = choice === "Mulia" ? 5 : choice === "Kejam" ? -5 : 0;

    p.conscienceScore += conscienceDelta;
    for (const app of this.state.apprentices) {
      app.loyalty = Math.max(0, Math.min(100, app.loyalty + loyaltyDelta));
    }

    this.state.narrative.totalResolvedCount = (this.state.narrative.totalResolvedCount || 0) + 1;
    this.state.narrative.resolvedHistory.push({
      id: issue.id,
      theme: issue.theme,
      tags: issue.tags,
      choice,
      day: this.state.calendar.day
    });
    // Simpan 12 riwayat terakhir untuk anti-repeat issue_engine agar Sparse Save tetap < 15 KB
    if (this.state.narrative.resolvedHistory.length > 12) {
      this.state.narrative.resolvedHistory.shift();
    }
    this.state.narrative.activeIssue = null;
    this._log(`Isu Moral [${issue.id} - ${issue.theme}] diputuskan: ${choice} (Conscience ${p.conscienceScore}).`);
    return { resolved: true, choice, conscienceScore: p.conscienceScore, loyaltyDelta };
  }

  /**
   * 8. SPARSE SAVE-STATE SERIALIZER (< 15 KB untuk HP/PWA — WD-5.06)
   */
  exportSaveState() {
    const sndDeltaJson = this.sndEngine.exportSaveJSON();
    const payload = {
      ...this.state,
      sndMarketSparseState: JSON.parse(sndDeltaJson)
    };
    return JSON.stringify(payload);
  }

  importSaveState(jsonString) {
    const parsed = typeof jsonString === "string" ? JSON.parse(jsonString) : jsonString;
    if (parsed.sndMarketSparseState) {
      const s = parsed.sndMarketSparseState;
      this.sndEngine.worldState.day = s.day ?? 1;
      this.sndEngine.worldState.season = s.season ?? "Spring";
      this.sndEngine.worldState.festivalActive = Boolean(s.festivalActive);
      this.sndEngine.worldState.boycottedFactions = new Set(s.boycottedFactions || []);
      this.sndEngine.worldState.activeCaravanEvents = s.activeCaravanEvents || [];
      this.sndEngine.marketDeltas = new Map(Object.entries(s.marketDeltas || {}));
    }
    const { sndMarketSparseState, ...rest } = parsed;
    this.state = rest;
    return this.state;
  }
}
