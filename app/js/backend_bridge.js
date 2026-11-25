/**
 * Battle-Smith RPG — Frontend Backend Bridge (Fase 1 + Fase 2A)
 * Jembatan tunggal antara UI (app/) dan 5 Engine Backend resmi (engines/ via dist/backend_bundle.js).
 * - 0% ubah kode di engines/ (semua rumus memanggil engine asli secara langsung)
 * - Auto-save Sparse JSON (< 15 KB) ke localStorage
 * - Lazy-load 1 Area saja (dist/areas/<area_id>.js) agar RAM Oppo A54 < 150 MB
 */
(function (global) {
  "use strict";

  const SAVE_KEY = "bsrpg_sparse_save_v1";
  const UI_PREFS_KEY = "bsrpg_ui_prefs_v1";

  const B = global.BSRPG_BACKEND;
  if (!B) {
    throw new Error("BSRPG_BACKEND belum dimuat. Jalankan node tools/build_offline_app.mjs terlebih dahulu.");
  }

  const S = B.STATIC_DATA;
  const locations = B.parseCSV(S.locationsCsvText);
  const factions = B.parseCSV(S.factionsCsvText);
  const relations = B.parseCSV(S.factionRelationsCsvText || S.relationsCsvText);
  const areasDungeons = B.parseCSV(S.areasDungeonsCsvText);
  const regions = B.parseCSV(S.regionsCsvText);
  const dummyItems = B.parseCSV(S.dummyItemsCsvText);
  const materialsList = B.parseCSV(S.materialsCsvText);
  const materialsById = {};
  for (const m of materialsList) {
    if (m.material_id) materialsById[m.material_id] = m;
  }
  const parsedMaterials = B.parseMaterialsCsv(S.materialsCsvText);
  const parsedMaterialsById = {};
  for (const pm of parsedMaterials) {
    if (pm.id) parsedMaterialsById[pm.id] = pm;
  }

  // 6 Latar Belakang Resmi CD-1.03 (LOCKED)
  const BACKGROUNDS_CD103 = [
    { id: "Pandai Besi", stats: ["STR", "CON", "INT"], desc: "Terbiasa di depan tungku panas; kuat menempa logam & menjaga ketahanan." },
    { id: "Pemburu",     stats: ["DEX", "CON", "WIS"], desc: "Penjelajah pesisir & hutan; tajam membidik kelemahan dan berburu bahan langka." },
    { id: "Pedagang",    stats: ["CHA", "INT", "WIS"], desc: "Paham arus Supply & Demand 77 kota, tawar-menawar, dan jaringan pasar." },
    { id: "Prajurit",    stats: ["STR", "DEX", "CON"], desc: "Veteran garis depan; seimbang antara serangan fisik, tangkisan, dan vitalitas." },
    { id: "Pelajar",     stats: ["INT", "WIS", "CHA"], desc: "Peneliti rune, Attunement elemen, serta kapasitas slot Skill Bar." },
    { id: "Pengembara",  stats: ["STR", "DEX", "CHA"], desc: "Petualang bebas lintas faksi; lincah bertarung dan memimpin murid." }
  ];

  // Pemetaan Senjata Awal Tier 1 & Skill T1 sesuai Mazhab Tipe Smith Awal (CD-3.01 & CD-3.02)
  const STARTER_KIT_BY_SMITH = {
    Weaponsmith: { weaponId: "w_str_1", customName: "Kapak Perang Permulaan", element: "Neutral", t1SkillId: "wpn_t1_a", armorClass: "sedang" },
    Armorer:     { weaponId: "w_con_1", customName: "Gada Penjaga Permulaan", element: "Neutral", t1SkillId: "arm_t1_a", armorClass: "berat" },
    Rangesmith:  { weaponId: "w_dex_r1", customName: "Pisau Lempar Permulaan", element: "Neutral", t1SkillId: "rng_t1_a", armorClass: "ringan" },
    Runesmith:   { weaponId: "w_int_1", customName: "Tongkat Rune Permulaan", element: "Lightning", t1SkillId: "run_t1_a", armorClass: "sedang" },
    Reforger:    { weaponId: "w_cha_1", customName: "Rapier Taktis Permulaan", element: "Neutral", t1SkillId: "ref_t1_a", armorClass: "ringan" }
  };

  const listeners = new Set();
  let activeLoadedAreaId = null;
  let activeAreaData = null;
  let cachedLevelGroupsAreaId = null;
  let cachedLevelGroups = [];
  let hasSavedGame = false;
  let lastIdleReport = null;
  let lastBossDuelReport = null;
  let lastForgeResult = null;

  const ELEMENT_WD_TO_TAG = {
    Fire: "Api",
    Ice: "Es",
    Lightning: "Petir",
    Earth: "Tanah",
    Light: "Cahaya",
    Dark: "Gelap",
    Neutral: "Netral"
  };

  function registerRealMaterialsIntoSndEngine(snd) {
    if (!snd || !snd.items) return;
    for (const m of materialsList) {
      if (!m.material_id) continue;
      snd.items.set(m.material_id, {
        item_id: m.material_id,
        item_name: m.material_name,
        category: "material",
        rarity: m.rarity || "Common",
        base_price_br: Math.max(5, Number(m.base_price_full_br_demo) || 20),
        origin_area_id: m.area_id || "",
        element_tag: ELEMENT_WD_TO_TAG[m.element] || "Netral",
        min_market_class: m.min_market_class || "Village"
      });
    }
  }

  function normalizeProfessionFocusSubStats(focusMap) {
    const out = {};
    for (const st of ["STR", "DEX", "CON", "INT", "WIS", "CHA"]) {
      const profDefs = (S.skillData.sub_stats?.[st] || []).filter(x => x.category === "profession");
      const profIds = profDefs.map(x => x.id);
      const cur = Array.isArray(focusMap?.[st]) ? focusMap[st].filter(id => profIds.includes(id)) : [];
      for (const pid of profIds) {
        if (cur.length >= 2) break;
        if (!cur.includes(pid)) cur.push(pid);
      }
      out[st] = cur.slice(0, 2);
    }
    return out;
  }

  function createGameInstance(saveSeed) {
    const inst = new B.UnifiedBetaGameLoop({
      skillData: S.skillData,
      materialsCsvText: S.materialsCsvText,
      economyConfig: S.economyConfig,
      locations,
      factions,
      relations,
      dummyItems,
      issueTemplates: S.issueTemplates,
      materialsList,
      saveSeed: saveSeed || ("BSRPG-" + Date.now().toString(36).toUpperCase())
    });
    registerRealMaterialsIntoSndEngine(inst.sndEngine);
    return inst;
  }

  let game = createGameInstance("BSRPG-OFFLINE-2026");

  function ensurePlayerV33Fields(p) {
    if (!p.firstTakenClass) {
      const first = Object.entries(p.smithTiers || {}).find(([, v]) => v > 0);
      p.firstTakenClass = first ? first[0] : "Weaponsmith";
    }
    if (!p.skillMasteryState || typeof p.skillMasteryState !== "object") {
      p.skillMasteryState = {};
    }
    if (p.activeDestinyId === undefined) {
      p.activeDestinyId = null;
    }
    if (!p.unFuseUsedByTier || typeof p.unFuseUsedByTier !== "object") {
      p.unFuseUsedByTier = {};
    }
    if (p.destinyTrialReady === undefined) {
      p.destinyTrialReady = false;
    }
    if (p.selectedTargetMonster === undefined) {
      p.selectedTargetMonster = null;
    }
    if (p.selectedIdleLevel === undefined) {
      p.selectedIdleLevel = null;
    }
    // Poin 3: Fokus Sub-Stat selalu dikunci pada keahlian Smith & Profesi (category === "profession")
    p.focusSubStats = normalizeProfessionFocusSubStats(p.focusSubStats);
  }

  function ensureEquipmentV33Fields(eq) {
    if (!eq) return;
    if (eq.weapon && !eq.weapon.uid) {
      eq.weapon.uid = "EQ-STARTER-WPN";
      eq.weapon.baseWeaponId = eq.weapon.baseWeaponId || eq.weapon.id;
      eq.weapon.baseWeaponName = eq.weapon.baseWeaponName || eq.weapon.name;
      eq.weapon.itemType = "weapon";
    }
    if (!eq.armorSlots || typeof eq.armorSlots !== "object") {
      eq.armorSlots = { Zirah: null, Perisai: null, Helm: null, Sarung: null, Sepatu: null };
    }
  }

  function syncArmorSetToEngine(eq) {
    ensureEquipmentV33Fields(eq);
    const equippedPieces = Object.values(eq.armorSlots).filter(Boolean);
    if (!equippedPieces.length) return;

    // Kelas armor dominan (Zirah punya bobot tertinggi 40% AC)
    const chest = eq.armorSlots.Zirah;
    const domClass = chest?.armorClass || equippedPieces[0]?.armorClass || "Sedang";
    eq.armorClass = String(domClass).toLowerCase();

    const elemCounts = {};
    for (const pc of equippedPieces) {
      const el = pc.element || "Neutral";
      if (el !== "Neutral") elemCounts[el] = (elemCounts[el] || 0) + 1;
    }
    const sortedEl = Object.entries(elemCounts).sort((a, b) => b[1] - a[1]);
    if (sortedEl.length > 0) {
      eq.armorElement = sortedEl[0][0];
      eq.armorSlotsSameElement = sortedEl[0][1];
    } else {
      eq.armorSlotsSameElement = 0;
    }
  }

  function applySmithXpGain(xpGain) {
    const p = game.state.player;
    p.xp.smith += Math.max(0, Math.round(xpGain));
    let levelsGained = 0;
    const maxLv = p.unlockedGateTier * 30;
    while (p.level < maxLv) {
      const quota = B.getXpQuotaForLevel(p.level);
      if (p.xp.battle >= quota && p.xp.smith >= quota) {
        const nextQuota = B.getXpQuotaForLevel(p.level + 1);
        const carryCap = Math.round(nextQuota * 0.5);
        p.xp.battle = Math.min(carryCap, p.xp.battle - quota);
        p.xp.smith = Math.min(carryCap, p.xp.smith - quota);
        p.level += 1;
        p.unspentStatPoints += 2;
        levelsGained += 1;
      } else {
        if (p.xp.smith > quota) {
          const overflow = p.xp.smith - quota;
          p.xp.smith = quota;
          p.xp.crossBuffSmithToBattlePct = Math.min(25, +(p.xp.crossBuffSmithToBattlePct + (overflow / quota) * 10).toFixed(1));
        }
        break;
      }
    }
    return levelsGained;
  }

  // Muat save lokal jika sudah pernah bermain
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      game.importSaveState(saved);
      ensurePlayerV33Fields(game.state.player);
      ensureEquipmentV33Fields(game.state.equipment);
      hasSavedGame = Boolean(game.state.player.characterCreated);
    }
  } catch (err) {
    console.warn("Gagal memuat save lokal, memulai dari Window Awal:", err);
  }
  ensurePlayerV33Fields(game.state.player);
  ensureEquipmentV33Fields(game.state.equipment);

  function persistSave() {
    try {
      const json = game.exportSaveState();
      localStorage.setItem(SAVE_KEY, json);
      hasSavedGame = Boolean(game.state.player.characterCreated);
      return json.length;
    } catch {
      return 0;
    }
  }

  function notify() {
    const snap = getSnapshot();
    listeners.forEach(fn => {
      try { fn(snap); } catch (e) { console.error(e); }
    });
  }

  /**
   * Hitung biaya Un-fuse resmi CD-2.03 (LOCKED):
   * 1 respec gratis per tier S, selebihnya 100br x level x poin x (1 + 0,25 x title unik), batas x4.
   */
  function getUnFuseQuote(pointsChanged = 1) {
    const p = game.state.player;
    ensurePlayerV33Fields(p);
    const tier = p.unlockedGateTier || 1;
    const usedCount = p.unFuseUsedByTier[tier] || 0;
    if (usedCount === 0) {
      return { isFree: true, costBr: 0, tier, usedCount };
    }
    const pts = Math.max(1, pointsChanged);
    const titleObj = game.skillEngine.evaluateTitle(p.stats);
    const uniqueTitleCount = titleObj.type === "Spesialis" ? 1 : 0;
    const mult = Math.min(4, 1 + 0.25 * uniqueTitleCount);
    const costBr = Math.round(100 * p.level * pts * mult);
    return { isFree: false, costBr, tier, usedCount };
  }

  function consumeUnFuse(pointsChanged = 1) {
    const p = game.state.player;
    const q = getUnFuseQuote(pointsChanged);
    if (!q.isFree) {
      if (p.bronze < q.costBr) {
        return { ok: false, reason: `Kas tidak cukup untuk Un-fuse (butuh ${B.formatCurrency(q.costBr)}).` };
      }
      p.bronze -= q.costBr;
    }
    p.unFuseUsedByTier[q.tier] = (p.unFuseUsedByTier[q.tier] || 0) + 1;
    return { ok: true, paidBr: q.costBr, wasFree: q.isFree };
  }

  function getSnapshot() {
    const st = game.state;
    const p = st.player;
    ensurePlayerV33Fields(p);
    const eq = st.equipment;
    ensureEquipmentV33Fields(eq);
    const loc = locations.find(l => l.location_id === p.currentLocationId) || locations[0];
    const quota = B.getXpQuotaForLevel(p.level);
    const statCap = p.unlockedGateTier * 30;

    // Evaluasi penuh CD v3.3 langsung dari skill_engine.js (termasuk RF Mastery Lv.1-GM & 29 Destiny)
    const smithConfig = {
      tiers: p.smithTiers,
      firstTakenClass: p.firstTakenClass,
      activeDestinyId: p.activeDestinyId,
      selectedPerkT3: p.selectedPerkT3,
      selectedPerkT5: p.selectedPerkT5
    };

    const build = game.skillEngine.buildMacroLoadout({
      stats: p.stats,
      focusSubStats: p.focusSubStats,
      selectedMorphs: p.selectedUtilities,
      selectedUtilities: p.selectedUtilities,
      loadout: p.loadout,
      smithConfig,
      skillMasteryState: p.skillMasteryState,
      activeDestinyId: p.activeDestinyId,
      weapon: eq.weapon
    });

    const subById = build.subStats.byId;
    const curseInfo = game.skillEngine.computeGateCurseAndRest({
      level: p.level,
      gateTier: p.curses.highestGateTierCursed,
      activeCurseStacks: p.curses.activeStacks,
      atOwnWorkshopOrBranch: true,
      conCurseResistPct: subById.con_curse_resist?.value || 0
    });

    const companion = game.getActiveCompanion();
    const apprenticeProfiles = st.apprentices.map(a => ({
      ...a,
      profile: game.skillEngine.generateApprenticeFromSeed(a.seed, a.skill, a.passedTrials)
    }));

    const saveJson = game.exportSaveState();
    const saveBytes = new Blob([saveJson]).size;

    return {
      hasSavedGame,
      state: st,
      player: p,
      equipment: eq,
      calendar: st.calendar,
      location: loc,
      xpQuota: quota,
      statCap,
      forgeMaxSlots: B.getForgeMaterialSlots(p.level),
      bronzeFormatted: B.formatCurrency(p.bronze),
      build,
      curseInfo,
      unFuseQuote: getUnFuseQuote(1),
      companion,
      apprenticeProfiles,
      branches: st.branches,
      activeIssue: st.narrative.activeIssue,
      eventLogs: st.narrative.eventLogs,
      huntState: game._ensureHuntState(),
      lastIdleReport,
      lastBossDuelReport,
      lastForgeResult,
      saveBytes,
      activeLoadedAreaId,
      activeAreaData,
      levelGroups: getAreaLevelGroups(activeAreaData),
      skillData: S.skillData,
      backgrounds: BACKGROUNDS_CD103,
      starterKits: STARTER_KIT_BY_SMITH,
      catalogs: {
        locationsCount: locations.length,
        areasCount: areasDungeons.length,
        regionsCount: regions.length,
        factionsCount: factions.length,
        materialsCount: materialsList.length,
        weaponsCount: B.WEAPONS_48.length,
        armorsCount: B.ARMORS_15.length,
        areas: areasDungeons,
        locations,
        regions,
        factions,
        materialsById,
        parsedMaterialsById,
        hybridFusions: B.HYBRID_FUSIONS,
        weapons: B.WEAPONS_48,
        armors: B.ARMORS_15,
        allCraftables: B.ALL_CRAFTABLE_ITEMS_63
      }
    };
  }

  /**
   * Kelompokkan 300 monster "common" (Reguler + Reguler Khusus) per Area menjadi 30 grup Level.
   * Di-cache untuk 1 Area aktif saja agar 0 ms saat re-render di Oppo A54.
   */
  function getAreaLevelGroups(areaData) {
    const areaId = areaData?.area?.area_id || null;
    if (!areaId || !Array.isArray(areaData.monsters)) return [];
    if (cachedLevelGroupsAreaId === areaId && cachedLevelGroups.length > 0) {
      return cachedLevelGroups;
    }

    const byLvl = new Map();
    const miniBossByReg = {};
    for (const m of areaData.monsters) {
      if (m.type === "Mini Boss") {
        miniBossByReg[m.reg] = m;
        continue;
      }
      if (m.type === "Boss") continue;
      const lv = Number(m.lvl) || 1;
      if (!byLvl.has(lv)) byLvl.set(lv, []);
      byLvl.get(lv).push(m);
    }

    const regMetaById = {};
    for (const r of regions) {
      if (r.area_id === areaId) regMetaById[r.region_id] = r;
    }

    const groups = [];
    const sortedLevels = Array.from(byLvl.keys()).sort((a, b) => a - b);
    for (const lvl of sortedLevels) {
      const pool = byLvl.get(lvl);
      const regulars = pool.filter(x => x.type === "Reguler");
      const specials = pool.filter(x => x.type === "Reguler Khusus");
      const regId = pool[0]?.reg || "";
      const regMeta = regMetaById[regId] || null;

      const elementsSet = new Set();
      const categoriesSet = new Set();
      const matIdsSet = new Set();
      for (const m of pool) {
        if (m.el) elementsSet.add(m.el);
        for (const [dId] of (m.drops || [])) {
          if (materialsById[dId]) {
            matIdsSet.add(dId);
            categoriesSet.add(materialsById[dId].category);
          }
        }
      }

      const sampleMaterials = Array.from(matIdsSet).slice(0, 5).map(id => ({
        id,
        name: materialsById[id].material_name,
        rarity: materialsById[id].rarity,
        category: materialsById[id].category
      }));

      // Gunakan monster Brute/Reguler representatif di level tersebut untuk estimasi cepat
      const rep = regulars.find(x => x.role === "Brute") || regulars[0] || pool[0];
      groups.push({
        lvl,
        areaId,
        regionId: regId,
        regionName: regMeta ? regMeta.region_name : regId,
        zoneBand: regMeta ? regMeta.zone_band : "Rendah",
        pool,
        regularCount: regulars.length,
        specialCount: specials.length,
        specialMonster: specials[0] || null,
        regionMiniBoss: miniBossByReg[regId] || null,
        elements: Array.from(elementsSet),
        dropCategories: Array.from(categoriesSet),
        sampleMaterials,
        representativeMonster: rep
      });
    }

    cachedLevelGroupsAreaId = areaId;
    cachedLevelGroups = groups;
    return groups;
  }

  /**
   * Lazy-load 1 file Area saja (app/dist/areas/<areaId>.js ~153 KB atau raw JSON string)
   * dan bersihkan Area sebelumnya agar RAM Oppo A54 tetap < 150 MB.
   */
  function loadAreaData(areaId) {
    return new Promise((resolve, reject) => {
      if (!areaId) return resolve(null);
      if (activeLoadedAreaId === areaId && activeAreaData) {
        return resolve(activeAreaData);
      }
      // Bersihkan Area sebelumnya dari RAM
      if (global.__BSRPG_AREA_CACHE && activeLoadedAreaId && activeLoadedAreaId !== areaId) {
        delete global.__BSRPG_AREA_CACHE[activeLoadedAreaId];
      }
      activeAreaData = null;

      if (global.__BSRPG_AREA_CACHE && global.__BSRPG_AREA_CACHE[areaId]) {
        activeLoadedAreaId = areaId;
        activeAreaData = global.__BSRPG_AREA_CACHE[areaId];
        queueMicrotask(() => {
          notify();
          resolve(activeAreaData);
        });
        return;
      }

      // Dukungan file preview tunggal mandiri: parse 1 Area JSON saat diminta saja (sisanya tetap string mentah)
      if (global.__BSRPG_RAW_AREAS && typeof global.__BSRPG_RAW_AREAS[areaId] === "string") {
        try {
          const parsed = JSON.parse(global.__BSRPG_RAW_AREAS[areaId]);
          global.__BSRPG_AREA_CACHE = { [areaId]: parsed };
          activeLoadedAreaId = areaId;
          activeAreaData = parsed;
          queueMicrotask(() => {
            notify();
            resolve(activeAreaData);
          });
          return;
        } catch (err) {
          return reject(new Error(`Gagal mem-parsing data area ${areaId}: ${err.message}`));
        }
      }

      const script = document.createElement("script");
      script.src = `./dist/areas/${areaId}.js`;
      script.async = true;
      script.onload = () => {
        script.remove();
        activeLoadedAreaId = areaId;
        activeAreaData = (global.__BSRPG_AREA_CACHE && global.__BSRPG_AREA_CACHE[areaId]) || null;
        notify();
        resolve(activeAreaData);
      };
      script.onerror = () => {
        script.remove();
        reject(new Error(`Gagal memuat data area: ${areaId}`));
      };
      document.head.appendChild(script);
    });
  }

  const Bridge = {
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    getSnapshot,
    formatCurrency: B.formatCurrency,
    loadAreaData,
    getSkillMasteryStage(xp) {
      return game.skillEngine.getSkillMasteryStage(xp);
    },
    getPerksCatalog(primaryType = "Weaponsmith") {
      const maxStats = { STR: 150, DEX: 150, CON: 150, INT: 150, WIS: 150, CHA: 150 };
      const dummyTiers = { Weaponsmith: 0, Armorer: 0, Rangesmith: 0, Runesmith: 0, Reforger: 0 };
      dummyTiers[primaryType] = 5;
      const full = game.skillEngine.evaluateSmithMastery(maxStats, { tiers: dummyTiers });
      return {
        perksT3: full.eligiblePerksT3Details,
        perksT5: full.eligiblePerksT5Details
      };
    },

    // Preview kalkulasi murni dari skill_engine.js untuk Wizard Pembuatan Karakter
    previewCharacterDraft({ stats, focusSubStats, startingSmithClass }) {
      const tiers = { Weaponsmith: 0, Armorer: 0, Rangesmith: 0, Runesmith: 0, Reforger: 0 };
      tiers[startingSmithClass || "Weaponsmith"] = 1;
      const subStats = game.skillEngine.computeSubStats(stats, focusSubStats);
      const title = game.skillEngine.evaluateTitle(stats);
      const smith = game.skillEngine.evaluateSmithMastery(stats, { tiers, firstTakenClass: startingSmithClass });
      const maxSlots = game.skillEngine.getMacroSlotCapacity(subStats.byId);
      const hp = Math.round((20 + subStats.byId.con_max_vitality.value + 5) * (1 + (smith.activeDestinyCard?.effectivePassives?.max_hp_pct || 0) / 100));
      const stm = 100 + 5 * (stats.CON || 1);
      const kit = STARTER_KIT_BY_SMITH[startingSmithClass || "Weaponsmith"];
      const wMeta = B.WEAPONS_48.find(w => w.id === kit.weaponId) || B.WEAPONS_48[0];
      return { subStats, title, smith, maxSlots, hp, stm, starterWeapon: wMeta, kit };
    },

    /**
     * Fase 2A — Buat Karakter Baru (CD-1.01, CD-1.02b, CD-1.03, CD-3.01, WD-4.07)
     */
    createNewCharacter({ name, background, stats, focusSubStats, startingSmithClass = "Weaponsmith" }) {
      const cleanName = String(name || "").trim().slice(0, 28) || "Alden";
      const totalPts = Object.values(stats || {}).reduce((a, b) => a + Number(b || 0), 0);
      if (totalPts !== 13) {
        return { ok: false, reason: `Total Stat awal harus tepat 13 poin (saat ini ${totalPts}).` };
      }

      game = createGameInstance("BSRPG-" + Date.now().toString(36).toUpperCase());
      const st = game.state;
      const p = st.player;

      p.name = cleanName;
      p.background = background || "Pandai Besi";
      p.level = 1;
      p.unlockedGateTier = 1;
      p.stats = {
        STR: Number(stats.STR) || 1,
        DEX: Number(stats.DEX) || 1,
        CON: Number(stats.CON) || 1,
        INT: Number(stats.INT) || 1,
        WIS: Number(stats.WIS) || 1,
        CHA: Number(stats.CHA) || 1
      };
      p.unspentStatPoints = 0;
      p.focusSubStats = JSON.parse(JSON.stringify(focusSubStats));

      const tiers = { Weaponsmith: 0, Armorer: 0, Rangesmith: 0, Runesmith: 0, Reforger: 0 };
      tiers[startingSmithClass] = 1;
      p.smithTiers = tiers;
      p.firstTakenClass = startingSmithClass;
      p.activeDestinyId = null;
      p.skillMasteryState = {};
      p.selectedUtilities = {};
      p.unFuseUsedByTier = {};
      p.destinyTrialReady = false;
      p.selectedTargetMonster = null;
      p.selectedIdleLevel = null;
      p.characterCreated = true;
      lastIdleReport = null;
      lastBossDuelReport = null;
      lastForgeResult = null;

      // Lokasi mulai resmi WD-4.07 (LOCKED): Tidewrack Village (Saltgrave Coast, Tier 1)
      const tidewrack = locations.find(l => l.location_id === "loc_22_tidewrack_village");
      if (tidewrack) p.currentLocationId = tidewrack.location_id;

      // Stamina & Senjata Awal sesuai Mazhab Tipe Smith (agar [W] Weapon Skill langsung aktif!)
      p.stamina.max = 100 + 5 * p.stats.CON;
      p.stamina.current = p.stamina.max;

      const kit = STARTER_KIT_BY_SMITH[startingSmithClass] || STARTER_KIT_BY_SMITH.Weaponsmith;
      const wMeta = B.WEAPONS_48.find(w => w.id === kit.weaponId) || B.WEAPONS_48[0];
      st.equipment.weapon = {
        uid: "EQ-STARTER-WPN",
        itemType: "weapon",
        id: wMeta.id,
        baseWeaponId: wMeta.id,
        baseWeaponName: kit.customName,
        name: kit.customName,
        stat: wMeta.stat,
        tier: 1,
        rarity: "Common",
        enhancePlus: 0,
        tag: wMeta.tag,
        trigger: wMeta.trigger,
        element: kit.element,
        budget: { ...wMeta.budget }
      };
      st.equipment.armorClass = kit.armorClass;
      st.equipment.armorElement = kit.element === "Neutral" ? "Lightning" : kit.element;
      st.equipment.armorSlots = { Zirah: null, Perisai: null, Helm: null, Sarung: null, Sepatu: null };
      p.loadout = [{ activeId: kit.t1SkillId, modIds: [] }];

      // Stok bahan awal Saltgrave Coast (Tier 1)
      st.inventory.materials = {
        "MAT-A08-01": 10, // Salt Crystal
        "MAT-A08-02": 8,  // Crab Shell
        "MAT-A08-03": 8,  // Frayed Rope
        "MAT-A08-05": 6   // Anchor Iron
      };

      game._log(`Memulai petualangan di ${tidewrack ? tidewrack.location_name : p.currentLocationId} sebagai ${p.background} (${startingSmithClass}).`);
      persistSave();
      notify();
      return { ok: true };
    },

    // Alokasi manual poin Stat saat naik level (+2 poin/Lv, CD-1.01 & CD-1.07)
    spendStatPoint(statKey) {
      const p = game.state.player;
      const cap = p.unlockedGateTier * 30;
      if (p.unspentStatPoints <= 0) return { ok: false, reason: "Tidak ada poin Stat tersisa." };
      if ((p.stats[statKey] || 1) >= cap) return { ok: false, reason: `Stat ${statKey} sudah mencapai Cap Tier (${cap}).` };
      p.stats[statKey] += 1;
      p.unspentStatPoints -= 1;
      if (statKey === "CON") {
        p.stamina.max = 100 + 5 * p.stats.CON;
        p.stamina.current = Math.min(p.stamina.max, p.stamina.current + 5);
      }
      persistSave();
      notify();
      return { ok: true };
    },

    // Ganti 2 Sub-Stat Fokus per Stat (+25% efisiensi khusus Smith & Profesi, CD-1.02b; mengikuti aturan Un-fuse CD-2.03)
    toggleFocusSubStat(statKey, subId) {
      const p = game.state.player;
      ensurePlayerV33Fields(p);
      const subDef = (S.skillData.sub_stats?.[statKey] || []).find(x => x.id === subId);
      if (!subDef || subDef.category !== "profession") {
        return { ok: false, reason: "Fokus Sub-Stat (+25%) dikhususkan untuk keahlian Smith & Profesi agar selalu terpakai." };
      }
      const list = (p.focusSubStats[statKey] || []).slice();
      if (list.includes(subId)) {
        return { ok: false, reason: "Pilih Sub-Stat Profesi lain untuk menggantikan salah satu dari 2 Fokus aktif." };
      }
      const uf = consumeUnFuse(1);
      if (!uf.ok) return uf;
      if (list.length >= 2) list.shift();
      list.push(subId);
      p.focusSubStats[statKey] = list;
      persistSave();
      notify();
      return { ok: true, wasFree: uf.wasFree, paidBr: uf.paidBr };
    },

    // Alokasi 5 Poin Tier Tipe Smith (CD-3.01: anggaran 1 poin per Gate Tier; geser poin memakai Un-fuse CD-2.03)
    adjustSmithTier(smithClass, delta) {
      const p = game.state.player;
      ensurePlayerV33Fields(p);
      const cur = p.smithTiers[smithClass] || 0;
      const used = Object.values(p.smithTiers).reduce((a, b) => a + b, 0);
      const maxBudget = p.unlockedGateTier; // 1..5 poin sesuai Tier Gate yang sudah terbuka

      if (delta > 0) {
        if (used >= maxBudget) {
          return { ok: false, reason: `Anggaran Poin Smith Tier ${p.unlockedGateTier} penuh (${used}/${maxBudget}). Kalahkan Gate Boss Lv.${p.unlockedGateTier * 30} untuk +1 poin!` };
        }
        if (cur >= 5) return { ok: false, reason: "Maksimal Tier 5 per Mazhab Smith." };
        if (used === 0) p.firstTakenClass = smithClass;
        p.smithTiers[smithClass] = cur + 1;
        persistSave();
        notify();
        return { ok: true, msg: `+1 poin ke ${smithClass} (Tier ${cur + 1}).` };
      } else {
        if (cur <= 0) return { ok: false, reason: `Poin ${smithClass} sudah 0.` };
        if (used <= 1) return { ok: false, reason: "Minimal 1 Mazhab Tipe Smith harus aktif (Tier 1)." };
        const uf = consumeUnFuse(1);
        if (!uf.ok) return uf;
        p.smithTiers[smithClass] = cur - 1;
        persistSave();
        notify();
        return { ok: true, msg: `Un-fuse -1 poin ${smithClass} (${uf.wasFree ? "Gratis jatah Tier" : "Biaya " + B.formatCurrency(uf.paidBr)}).` };
      }
    },

    // Pasang / Lepas Active Skill di Macro Bar (Opsi A Mafia Wars)
    toggleEquipSkill(skillId) {
      const p = game.state.player;
      const snap = getSnapshot();
      const curIds = snap.build.equippedSkills.map(s => s.id);
      const exists = curIds.includes(skillId);
      let nextIds;
      if (exists) {
        if (curIds.length <= 1) return { ok: false, reason: "Minimal 1 Skill harus terpasang di Skill Bar." };
        nextIds = curIds.filter(id => id !== skillId);
      } else {
        if (curIds.length >= snap.build.maxSlots) {
          return { ok: false, reason: `Skill Bar penuh (${snap.build.maxSlots} slot). Naikkan INT (Macro Capacity) atau lepas 1 skill dulu.` };
        }
        nextIds = [...curIds, skillId];
      }
      p.loadout = nextIds.map(id => ({ activeId: id, modIds: [] }));
      persistSave();
      notify();
      return { ok: true, equipped: !exists };
    },

    // Pilih Morph 1-dari-3 (Terbuka di Skill Lv.5, ganti memakai Un-fuse CD-2.03)
    selectSkillMorph(tierKey, skillId, morphId) {
      const p = game.state.player;
      ensurePlayerV33Fields(p);
      const xp = p.skillMasteryState[skillId] || 0;
      const stage = game.skillEngine.getSkillMasteryStage(xp);
      if (!stage.morphUnlocked) {
        return { ok: false, reason: `Morph terbuka saat skill mencapai Lv.5 (saat ini ${stage.label}). Latih lewat Idle Battle!` };
      }
      const prev = p.selectedUtilities[tierKey];
      if (prev === morphId) return { ok: true, unchanged: true };
      if (prev) {
        const uf = consumeUnFuse(1);
        if (!uf.ok) return uf;
      }
      p.selectedUtilities[tierKey] = morphId;
      persistSave();
      notify();
      return { ok: true };
    },

    // Ganti Kartu Destiny Aktif dengan Jalur Ganda resmi CD-3.02b (evaluateDestinySwitch)
    switchDestinyCard({ targetCardId, method = "gold" }) {
      const p = game.state.player;
      ensurePlayerV33Fields(p);
      const snap = getSnapshot();
      const currentId = snap.build.activeDestinyCard?.id || null;
      const loc = snap.location;
      const isHostile = loc ? game.sndEngine.worldState.boycottedFactions.has(loc.faction_id) : false;

      const check = game.skillEngine.evaluateDestinySwitch({
        currentCardId: currentId,
        targetCardId,
        smithTiers: p.smithTiers,
        firstTakenClass: p.firstTakenClass,
        level: p.level,
        method,
        trialCompleted: Boolean(p.destinyTrialReady),
        isFactionHostile: isHostile,
        playerBronze: p.bronze
      });

      if (!check.allowed) {
        if (check.reason === "TRIAL_NOT_COMPLETED") {
          return { ok: false, reason: "Selesaikan Trial Guild dulu (jalankan Idle Battle / Gate) atau gunakan Jalur Bayar Instan." };
        }
        if (check.reason === "INSUFFICIENT_BRONZE") {
          return { ok: false, reason: `Kas kurang ${B.formatCurrency(check.shortfallBronze)} (biaya ${B.formatCurrency(check.costBronze)}).` };
        }
        return { ok: false, reason: `Tidak dapat mengganti Destiny (${check.reason}).` };
      }

      if (check.costBronze > 0) p.bronze -= check.costBronze;
      if (method === "trial") p.destinyTrialReady = false;
      p.activeDestinyId = check.newActiveDestinyId;
      game._log(`Kartu Destiny aktif diganti ke ${check.newActiveDestinyName} lewat ${check.broker} (${method === "trial" ? "Trial Misi" : B.formatCurrency(check.costBronze)}).`);
      persistSave();
      notify();
      return { ok: true, check };
    },

    // Pilih Perk Smith Tingkat 3 / Tingkat 5 (CD-3.03; ganti memakai Un-fuse CD-2.03)
    selectSmithPerk(tierLevel, key) {
      const p = game.state.player;
      ensurePlayerV33Fields(p);
      const field = tierLevel === 5 ? "selectedPerkT5" : "selectedPerkT3";
      if (p[field] === key) return { ok: true };
      const uf = consumeUnFuse(1);
      if (!uf.ok) return uf;
      p[field] = key;
      persistSave();
      notify();
      return { ok: true, wasFree: uf.wasFree, paidBr: uf.paidBr };
    },

    // =====================================================================
    // FASE 2B — PETA RUTE KOTA, TARGET IDLE MONSTER/BOSS & PREVIEW TEMPUR
    // =====================================================================
    resolveDropName(idOrName) {
      const mat = materialsById[idOrName];
      if (mat) return { id: idOrName, name: mat.material_name, rarity: mat.rarity, category: mat.category, isMaterial: true };
      return { id: idOrName, name: String(idOrName), rarity: "Trophy", category: "Trofi", isMaterial: false };
    },

    computeMonsterPreview(monster) {
      const p = game.state.player;
      const sub = game.skillEngine.computeSubStats(p.stats, p.focusSubStats).byId;
      const stats = B.computeMonsterStats(monster);
      const antiFarm = game.skillEngine.computeAntiFarmMultipliers(
        p.level,
        monster.lvl,
        sub.wis_rare_drop ? sub.wis_rare_drop.value : 0
      );
      return { stats, antiFarm };
    },

    previewCombat(targetMonster = null) {
      const p = game.state.player;
      ensurePlayerV33Fields(p);
      const eq = game.state.equipment;
      const comp = game.getActiveCompanion();
      const effectiveEnemy = targetMonster || p.selectedTargetMonster || {
        name: `Tier-${p.unlockedGateTier} Patrol Brute`,
        lvl: p.level,
        role: "Brute",
        type: "Reguler",
        el: "Ice",
        weak: eq.weapon.element || "Fire"
      };
      return game.skillEngine.simulateBattle({
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
        skillMasteryState: p.skillMasteryState,
        activeDestinyId: p.activeDestinyId,
        weapon: eq.weapon,
        armorClass: eq.armorClass,
        armorElement: eq.armorElement,
        armorSlotsSameElement: eq.armorSlotsSameElement,
        apprenticeSeed: comp?.seed || null,
        apprenticeSkill: comp?.effectiveSkill || 50,
        apprenticeTrials: comp?.passedTrials || 0,
        wdEnemy: effectiveEnemy,
        maxSeconds: 60
      });
    },

    /**
     * Pratinjau kesiapan 1:1 terhadap rumus challengeGateBoss di game_loop_engine.js:
     * Gate Boss Lv = unlockedGateTier * 30, menang bila killsPerHpBar >= 1.00x.
     */
    previewGateBoss() {
      const p = game.state.player;
      const gateTier = p.unlockedGateTier;
      const gateBossLevel = gateTier * 30;
      const gateBoss = {
        name: `Gate Guardian of Tier ${gateTier}`,
        lvl: gateBossLevel,
        role: "Boss",
        type: "Boss",
        el: "Ice",
        weak: game.state.equipment.weapon.element || "Fire"
      };
      const comp = game.getActiveCompanion();
      const sim = game.skillEngine.simulateBattle({
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
        weapon: game.state.equipment.weapon,
        armorClass: game.state.equipment.armorClass,
        armorElement: game.state.equipment.armorElement,
        armorSlotsSameElement: game.state.equipment.armorSlotsSameElement,
        apprenticeSeed: comp?.seed || null,
        apprenticeSkill: comp?.effectiveSkill || 60,
        apprenticeTrials: comp?.passedTrials || 1,
        wdEnemy: gateBoss,
        maxSeconds: 120
      });
      return {
        gateTier,
        gateBossLevel,
        monster: sim.monsterSummary,
        metrics: sim.metrics,
        readyToWin: sim.metrics.killsPerHpBar >= 1.0,
        combatLogSample: sim.combatLogSample
      };
    },

    setTargetMonster(monster, areaId = null) {
      const p = game.state.player;
      ensurePlayerV33Fields(p);
      if (!monster) {
        p.selectedTargetMonster = null;
      } else {
        // Simpan ringkas agar Sparse Save JSON tetap < 5 KB di Oppo A54
        p.selectedTargetMonster = {
          id: monster.id,
          areaId: areaId || activeLoadedAreaId || null,
          reg: monster.reg || "",
          type: monster.type || "Reguler",
          name: monster.name,
          fam: monster.fam || "",
          role: monster.role || "Brute",
          lvl: Number(monster.lvl) || 1,
          el: monster.el || "Neutral",
          sub_el: monster.sub_el || "-",
          weak: monster.weak || "Neutral",
          drops: (monster.drops || []).slice(0, 5),
          uniqName: monster.uniq?.name || monster.uniqName || null,
          boss_skill: monster.boss_skill || null
        };
      }
      persistSave();
      notify();
      return { ok: true, target: p.selectedTargetMonster };
    },

    clearTargetMonster() {
      return Bridge.setTargetMonster(null);
    },

    setIdleLevel(lvl = null) {
      const p = game.state.player;
      ensurePlayerV33Fields(p);
      p.selectedIdleLevel = lvl === null || lvl === undefined ? null : Number(lvl);
      p.selectedTargetMonster = null;
      persistSave();
      notify();
      return { ok: true, selectedIdleLevel: p.selectedIdleLevel };
    },

    async travelToLocation(locationId) {
      const loc = locations.find(l => l.location_id === locationId);
      if (!loc) return { ok: false, reason: "Kota/Desa tujuan tidak ditemukan." };
      const p = game.state.player;
      ensurePlayerV33Fields(p);
      const prevLoc = locations.find(l => l.location_id === p.currentLocationId);
      const areaChanged = !prevLoc || prevLoc.area_id !== loc.area_id;
      p.currentLocationId = loc.location_id;

      if (areaChanged) {
        p.selectedTargetMonster = null;
        p.selectedIdleLevel = null;
      }

      game._log(`Berpindah rute dari ${prevLoc ? prevLoc.location_name : "-"} ke ${loc.location_name} (${loc.area_name}, Tier ${loc.tier}).`);
      persistSave();
      try {
        await loadAreaData(loc.area_id);
      } catch {
        notify();
      }
      return { ok: true, loc, areaChanged };
    },

    // Aksi langsung ke Main Engine (game_loop_engine.js): Konsep 2 Kolam Monster per Level + 8%/jam Sergapan Mini Boss + RF Mastery
    runIdle({ hours = 4, mode = "Battle", autoAlternateBars = false } = {}) {
      const p = game.state.player;
      ensurePlayerV33Fields(p);
      const beforeSnap = getSnapshot();

      const groups = beforeSnap.levelGroups || [];
      let chosenGroup = null;
      if (groups.length > 0) {
        const wantedLv = p.selectedIdleLevel || p.level;
        chosenGroup = groups.reduce((best, cur) =>
          Math.abs(cur.lvl - wantedLv) < Math.abs(best.lvl - wantedLv) ? cur : best
        , groups[0]);
      }

      const repEnemy = chosenGroup ? chosenGroup.representativeMonster : null;
      const preview = (mode === "Battle" || autoAlternateBars) ? Bridge.previewCombat(repEnemy) : null;

      const res = game.advanceIdleHours({
        hours,
        mode,
        targetMonster: repEnemy,
        levelPool: chosenGroup ? chosenGroup.pool : null,
        regionMiniBoss: chosenGroup ? chosenGroup.regionMiniBoss : null,
        areaId: chosenGroup ? chosenGroup.areaId : (beforeSnap.location?.area_id || null),
        regionId: chosenGroup ? chosenGroup.regionId : (beforeSnap.location?.region_id || null),
        autoAlternateBars
      });

      if (!res.aborted && (mode === "Battle" || autoAlternateBars) && res.activeHours > 0) {
        const bHours = autoAlternateBars ? res.activeHours * 0.5 : res.activeHours;
        const eqIds = beforeSnap.build.equippedSkills.map(s => s.id);
        const wsId = beforeSnap.build.weaponSkill?.unlocked ? beforeSnap.build.weaponSkill.id : null;
        const trained = game.skillEngine.trainSkillsFromIdle(p.skillMasteryState, eqIds, wsId, bHours);
        p.skillMasteryState = trained.masteryState;
        p.destinyTrialReady = true;
        res.skillMasteryGains = trained.skillGains;
      }

      if (!res.aborted) {
        const lootNamed = Object.entries(res.materialsLooted || {}).map(([id, qty]) => {
          const inf = Bridge.resolveDropName(id);
          return { id, name: inf.name, rarity: inf.rarity, qty };
        });
        lastIdleReport = {
          ...res,
          modeLabel: autoAlternateBars ? "Seimbang 50:50" : (mode === "Battle" ? "Idle Battle" : "Idle Smith"),
          idleLevel: chosenGroup ? chosenGroup.lvl : p.level,
          regionName: chosenGroup ? chosenGroup.regionName : (beforeSnap.location?.region_name || "-"),
          lootNamed,
          antiFarm: preview ? preview.antiFarmSummary : null,
          combatLogSample: preview ? (preview.combatLogSample || []).slice(0, 8) : [],
          timeLabel: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
        };
      }

      persistSave();
      notify();
      return res;
    },

    // Misi Panggil Mini Boss / Ekspedisi Boss Area (dengan Cooldown & Panggung Duel HP Opsi 3)
    challengeBossMission(bossId) {
      const snap = getSnapshot();
      const monsters = snap.activeAreaData?.monsters || [];
      const boss = monsters.find(m => m.id === bossId);
      if (!boss) return { ok: false, reason: "Data Boss belum dimuat di memori Area." };

      const areaId = snap.activeAreaData?.area?.area_id || snap.location?.area_id;
      const areaRegions = regions.filter(r => r.area_id === areaId);
      const highRegion = areaRegions.find(r => r.zone_band === "Tinggi");
      const highMiniBoss = highRegion
        ? monsters.find(m => m.type === "Mini Boss" && m.reg === highRegion.region_id)
        : null;

      const res = game.challengeBossMission({
        bossMonster: boss,
        areaId,
        regionId: boss.reg,
        requiredHighMiniBossId: boss.type === "Boss" && highMiniBoss ? highMiniBoss.id : null
      });

      if (!res.ok) return res;
      if (res.won) game.state.player.destinyTrialReady = true;

      const lootNamed = Object.entries(res.materialsLooted || {}).map(([id, qty]) => {
        const inf = Bridge.resolveDropName(id);
        return { id, name: inf.name, rarity: inf.rarity, qty };
      });
      lastBossDuelReport = {
        ...res,
        kind: boss.type === "Boss" ? "Misi Ekspedisi Boss Area" : "Misi Buruan Mini Boss",
        lootNamed,
        timeLabel: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      };

      persistSave();
      notify();
      return res;
    },

    performLongRest({ atOwnWorkshopOrBranch = true } = {}) {
      const res = game.performLongRest({ atOwnWorkshopOrBranch });
      persistSave();
      notify();
      return res;
    },
    challengeGateBoss({ allocateSmithPointTo = "Weaponsmith" } = {}) {
      const res = game.challengeGateBoss({ allocateSmithPointTo });
      if (res.won) game.state.player.destinyTrialReady = true;
      lastBossDuelReport = {
        ok: true,
        won: res.won,
        kind: "Ujian Gate Boss",
        bossName: res.bossName,
        bossType: "Gate Boss",
        bossLvl: res.bossLvl,
        duelHp: res.duelHp,
        bronzeReward: 0,
        xpReward: 0,
        lootNamed: [],
        trophiesFound: [],
        combatMetrics: res.combatMetrics,
        combatLogSample: res.combatLogSample || [],
        timeLabel: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      };
      persistSave();
      notify();
      return res;
    },
    resolveMoralIssue(choice = "Mulia") {
      const res = game.resolveActiveMoralIssue(choice);
      persistSave();
      notify();
      return res;
    },
    autoAllocateStats(primaryStat = "STR") {
      game.autoAllocateStats(primaryStat);
      persistSave();
      notify();
    },

    // =====================================================================
    // FASE 3A — BENGKEL TEMPA (63 RESEP), FUSI INTI KEDUA, +N & EQUIP/SCRAP
    // =====================================================================
    previewForgeDraft({ itemId = "w_str_1", pickedMaterialIds = [], coreElement = "", coreSize = "sedang" } = {}) {
      const p = game.state.player;
      ensurePlayerV33Fields(p);
      return game.forgeEngine.previewForge({
        level: p.level,
        stats: p.stats,
        focusSubStats: p.focusSubStats,
        smithConfig: {
          tiers: p.smithTiers,
          firstTakenClass: p.firstTakenClass,
          activeDestinyId: p.activeDestinyId,
          selectedPerkT3: p.selectedPerkT3,
          selectedPerkT5: p.selectedPerkT5
        },
        weaponId: itemId,
        pickedMaterialIds: pickedMaterialIds.filter(Boolean),
        coreElement: coreElement || "",
        coreSize: coreSize || "sedang",
        isIdle: false
      });
    },

    forgeCraftItem({ itemId = "w_str_1", pickedMaterialIds = [], coreElement = "", coreSize = "sedang" } = {}) {
      const st = game.state;
      const p = st.player;
      ensurePlayerV33Fields(p);
      ensureEquipmentV33Fields(st.equipment);

      const cleanIds = pickedMaterialIds.filter(Boolean);
      const maxSlots = B.getForgeMaterialSlots(p.level);
      if (cleanIds.length < 1 || cleanIds.length > maxSlots) {
        return { ok: false, reason: `Pilih 1 s/d ${maxSlots} bahan tempa sesuai kapasitas meja Lv.${p.level}.` };
      }
      if ((st.inventory.forgedGallery || []).length >= 12) {
        return { ok: false, reason: "Galeri Barang penuh (12/12). Bongkar (Scrap) barang lama dulu agar Save tetap ringan." };
      }
      if (p.stamina.current < 8) {
        return { ok: false, reason: "Stamina kurang untuk menempa (butuh minimal 8 STM)." };
      }

      // Cek stok bahan di tas (mendukung bahan sama di beberapa slot bila jumlah cukup)
      const neededByMat = {};
      for (const id of cleanIds) neededByMat[id] = (neededByMat[id] || 0) + 1;
      const bagMats = st.inventory.materials || {};
      for (const [id, need] of Object.entries(neededByMat)) {
        if ((bagMats[id] || 0) < need) {
          const mName = materialsById[id]?.material_name || id;
          return { ok: false, reason: `Stok ${mName} di tas tidak cukup (butuh ${need}, punya ${bagMats[id] || 0}).` };
        }
      }

      p.stamina.current = +(p.stamina.current - 8).toFixed(1);

      const res = game.forgeEngine.executeForge({
        level: p.level,
        stats: p.stats,
        focusSubStats: p.focusSubStats,
        smithConfig: {
          tiers: p.smithTiers,
          firstTakenClass: p.firstTakenClass,
          activeDestinyId: p.activeDestinyId,
          selectedPerkT3: p.selectedPerkT3,
          selectedPerkT5: p.selectedPerkT5
        },
        weaponId: itemId,
        pickedMaterialIds: cleanIds,
        coreElement: coreElement || "",
        coreSize: coreSize || "sedang",
        isIdle: false
      }, () => game._nextHuntRng());

      if (!res.valid && res.reason) {
        return { ok: false, reason: res.reason };
      }

      if (!res.success) {
        // Hanya kurangi bahan yang hilang (menghormati CON Material Conservation & Pengikat)
        const remainingIds = cleanIds.slice();
        const lostCount = (res.lostMaterials || []).length;
        for (let i = 0; i < lostCount && i < remainingIds.length; i++) {
          const mId = remainingIds[i];
          bagMats[mId] = Math.max(0, (bagMats[mId] || 0) - 1);
          if (bagMats[mId] === 0) delete bagMats[mId];
        }
        const lvUp = applySmithXpGain(res.xpGained || 4);
        lastForgeResult = {
          ok: true,
          crafted: false,
          lostMaterials: res.lostMaterials || [],
          keptMaterials: res.keptMaterials || [],
          xpGained: res.xpGained || 4,
          levelsGained: lvUp
        };
        game._log(`Tempa gagal! Kehilangan ${(res.lostMaterials || []).join(", ") || "1 bahan"}, selamat: ${(res.keptMaterials || []).join(", ") || "tidak ada"}.`);
        persistSave();
        notify();
        return lastForgeResult;
      }

      // Berhasil tempa: konsumsi seluruh bahan yang dipasang di meja
      for (const [id, need] of Object.entries(neededByMat)) {
        bagMats[id] = Math.max(0, (bagMats[id] || 0) - need);
        if (bagMats[id] === 0) delete bagMats[id];
      }

      const item = res.forgedWeapon;
      const baseMeta = B.ALL_CRAFTABLE_ITEMS_63.find(x => x.id === item.baseWeaponId) || B.WEAPONS_48[0];
      const qToRarity = ["Common", "Common", "Uncommon", "Rare", "Epic"];
      const rarity = (item.isRareTrait && item.qualityTierIdx >= 4) ? "Legendary" : (qToRarity[item.qualityTierIdx] || "Common");

      item.id = baseMeta.id;
      item.trigger = baseMeta.trigger;
      item.rarity = rarity;
      item.itemType = baseMeta.itemType === "armor" ? "armor" : "weapon";
      if (item.itemType === "armor") {
        item.armorSlot = baseMeta.slot;
        item.armorClass = baseMeta.armorClass;
        item.acPct = baseMeta.acPct;
        item.triggerDesc = baseMeta.triggerDesc || "";
      }

      st.inventory.forgedGallery = st.inventory.forgedGallery || [];
      st.inventory.forgedGallery.unshift(item);

      const lvUp = applySmithXpGain(res.xpGained || 16);
      lastForgeResult = {
        ok: true,
        crafted: true,
        item,
        xpGained: res.xpGained || 16,
        levelsGained: lvUp
      };
      game._log(`🔥 Berhasil menempa ${item.name} [${item.qualityName} • ${item.rarity} • Mode ${item.modeName}]!`);
      persistSave();
      notify();
      return lastForgeResult;
    },

    findOwnedItem(uid) {
      const st = game.state;
      ensureEquipmentV33Fields(st.equipment);
      if (st.equipment.weapon && st.equipment.weapon.uid === uid) {
        return { item: st.equipment.weapon, location: "equipped_weapon" };
      }
      for (const [slot, arm] of Object.entries(st.equipment.armorSlots || {})) {
        if (arm && arm.uid === uid) return { item: arm, location: "equipped_armor", slot };
      }
      const galIdx = (st.inventory.forgedGallery || []).findIndex(x => x && x.uid === uid);
      if (galIdx >= 0) {
        return { item: st.inventory.forgedGallery[galIdx], location: "gallery", index: galIdx };
      }
      return null;
    },

    fuseForgedItem({ targetUid, secondElementId = "petir" } = {}) {
      const st = game.state;
      const p = st.player;
      const found = Bridge.findOwnedItem(targetUid);
      if (!found) return { ok: false, reason: "Barang tidak ditemukan." };
      const item = found.item;

      if (item.modeIdx !== 2 || item.fused) {
        return { ok: false, reason: "Hanya barang berstatus Mode Fusi yang belum difusi yang bisa ditanam Inti Kedua." };
      }
      if (p.level < 10) {
        return { ok: false, reason: "Fusi Inti Kedua membutuhkan minimal Level 10 (CD-3.02)." };
      }
      if ((p.smithTiers.Runesmith || 0) < 1) {
        return { ok: false, reason: "Fusi Inti Kedua wajib memiliki minimal Runesmith Tier 1 (buka di tab Class & Skill)." };
      }
      const feeBr = 100 * (item.tier || 1);
      if (p.bronze < feeBr) {
        return { ok: false, reason: `Kas kurang untuk katalis Fusi (butuh ${B.formatCurrency(feeBr)}).` };
      }
      if (p.stamina.current < 5) {
        return { ok: false, reason: "Stamina kurang untuk Fusi (butuh 5 STM)." };
      }

      p.bronze -= feeBr;
      p.stamina.current = +(p.stamina.current - 5).toFixed(1);

      const fRes = game.forgeEngine.fuseSecondCore({
        forgedWeapon: item,
        secondElementId,
        level: p.level,
        stats: p.stats,
        focusSubStats: p.focusSubStats,
        smithConfig: { tiers: p.smithTiers, firstTakenClass: p.firstTakenClass },
        rngFn: () => game._nextHuntRng()
      });

      const lvUp = applySmithXpGain(fRes.success ? 20 : 6);
      if (found.location === "equipped_armor") syncArmorSetToEngine(st.equipment);
      game._log(fRes.message || (fRes.success ? `Fusi berhasil pada ${item.name}!` : `Fusi gagal pada ${item.name}.`));
      persistSave();
      notify();
      return { ok: true, fusedSuccess: fRes.success, failChancePct: fRes.failChancePct, message: fRes.message, item, levelsGained: lvUp };
    },

    getEnhancementQuote(targetUid) {
      const p = game.state.player;
      const found = Bridge.findOwnedItem(targetUid);
      if (!found) return null;
      const item = found.item;
      const curPlus = item.enhancePlus || 0;
      const isUnique = item.rarity === "Unique";
      const sub = game.skillEngine.computeSubStats(p.stats, p.focusSubStats).byId;
      const strEnh = sub.str_enhance_power ? sub.str_enhance_power.value : 0;
      const refTier = p.smithTiers.Reforger || 0;

      const curEnh = game.skillEngine.computeWeaponEnhancement(curPlus, isUnique, strEnh, refTier);
      const nextEnh = game.skillEngine.computeWeaponEnhancement(curPlus + 1, isUnique, strEnh, refTier);
      const costBr = Math.round(50 * (curPlus + 1) * Math.max(1, item.tier || 1));

      return {
        item,
        location: found.location,
        curPlus,
        nextPlus: curPlus + 1,
        curEnh,
        nextEnh,
        costBr,
        staminaCost: 4
      };
    },

    enhanceItemPlusOne({ targetUid, catalystMatId = null } = {}) {
      const st = game.state;
      const p = st.player;
      const quote = Bridge.getEnhancementQuote(targetUid);
      if (!quote) return { ok: false, reason: "Barang tidak ditemukan untuk di-Enhance." };
      if (p.stamina.current < quote.staminaCost) {
        return { ok: false, reason: `Stamina kurang (butuh ${quote.staminaCost} STM).` };
      }
      if (p.bronze < quote.costBr) {
        return { ok: false, reason: `Kas kurang untuk Enhance +${quote.nextPlus} (butuh ${B.formatCurrency(quote.costBr)}).` };
      }

      const bagMats = st.inventory.materials || {};
      const matKeys = Object.keys(bagMats).filter(k => bagMats[k] > 0);
      const chosenMat = catalystMatId && bagMats[catalystMatId] > 0 ? catalystMatId : (matKeys[0] || null);
      if (!chosenMat) {
        return { ok: false, reason: "Butuh minimal 1 bahan tempa di Tas sebagai katalis Enhance +N (cari lewat Idle Level!)." };
      }

      p.bronze -= quote.costBr;
      p.stamina.current = +(p.stamina.current - quote.staminaCost).toFixed(1);
      bagMats[chosenMat] -= 1;
      if (bagMats[chosenMat] <= 0) delete bagMats[chosenMat];

      const item = quote.item;
      const roll = game._nextHuntRng() * 100;
      const succeeded = roll <= quote.nextEnh.effectiveSuccessRatePct;

      if (succeeded) {
        item.enhancePlus = quote.nextPlus;
      } else if (quote.curPlus > quote.curEnh.minCheckpoint) {
        item.enhancePlus = Math.max(quote.curEnh.minCheckpoint, quote.curPlus - 1);
      }

      // Perbarui label +N pada nama barang
      const baseTitle = item.baseWeaponName || item.name.replace(/\s*\+\d+/g, "").replace(/\s*"[^"]*"$/, "").trim();
      const traitSuffix = item.traitName ? ` "${item.traitName}"` : "";
      item.name = `${baseTitle}${item.enhancePlus > 0 ? " +" + item.enhancePlus : ""}${traitSuffix}`;

      const lvUp = applySmithXpGain(succeeded ? 6 : 3);
      game._log(succeeded
        ? `⚡ ENHANCE SUKSES! ${item.name} naik ke +${item.enhancePlus} (+${quote.nextEnh.powerBonusPct}% Daya).`
        : `💨 Enhance +${quote.nextPlus} gagal (peluang ${quote.nextEnh.effectiveSuccessRatePct}%). Barang aman di +${item.enhancePlus} (Checkpoint +${quote.curEnh.minCheckpoint}).`);
      persistSave();
      notify();
      return {
        ok: true,
        succeeded,
        newPlus: item.enhancePlus,
        checkpoint: quote.curEnh.minCheckpoint,
        chancePct: quote.nextEnh.effectiveSuccessRatePct,
        usedMatName: materialsById[chosenMat]?.material_name || chosenMat,
        item,
        levelsGained: lvUp
      };
    },

    equipForgedItem(targetUid) {
      const st = game.state;
      ensureEquipmentV33Fields(st.equipment);
      const gal = st.inventory.forgedGallery || [];
      const idx = gal.findIndex(x => x && x.uid === targetUid);
      if (idx < 0) return { ok: false, reason: "Barang sudah terpasang atau tidak ada di Galeri." };

      const picked = gal.splice(idx, 1)[0];
      if (picked.itemType === "armor") {
        const slot = picked.armorSlot || "Zirah";
        const prevArmor = st.equipment.armorSlots[slot];
        st.equipment.armorSlots[slot] = picked;
        if (prevArmor) gal.unshift(prevArmor);
        syncArmorSetToEngine(st.equipment);
        game._log(`🛡️ Memasang Armor [${slot}]: ${picked.name} (${picked.armorClass}).`);
      } else {
        const prevWeapon = st.equipment.weapon;
        picked.id = picked.baseWeaponId || picked.id;
        picked.trigger = picked.trigger || picked.triggerName;
        st.equipment.weapon = picked;
        if (prevWeapon) gal.unshift(prevWeapon);
        game._log(`⚔️ Memasang Senjata: ${picked.name} [${picked.rarity || "Common"}].`);
      }

      persistSave();
      notify();
      return { ok: true, equipped: picked };
    },

    unequipArmorSlot(slotName) {
      const st = game.state;
      ensureEquipmentV33Fields(st.equipment);
      const cur = st.equipment.armorSlots?.[slotName];
      if (!cur) return { ok: false, reason: `Slot ${slotName} sudah kosong.` };
      if ((st.inventory.forgedGallery || []).length >= 12) {
        return { ok: false, reason: "Galeri Barang penuh (12/12). Bongkar 1 barang di Galeri terlebih dahulu." };
      }
      st.equipment.armorSlots[slotName] = null;
      st.inventory.forgedGallery.unshift(cur);
      syncArmorSetToEngine(st.equipment);
      persistSave();
      notify();
      return { ok: true, item: cur };
    },

    scrapGalleryItem(targetUid) {
      const st = game.state;
      const gal = st.inventory.forgedGallery || [];
      const idx = gal.findIndex(x => x && x.uid === targetUid);
      if (idx < 0) return { ok: false, reason: "Hanya barang di Galeri (tidak sedang dipakai) yang bisa dibongkar." };

      const removed = gal.splice(idx, 1)[0];
      const refundBr = Math.round(45 * Math.max(1, removed.tier || 1) * (1 + (removed.qualityTierIdx || 1) * 0.5) + (removed.enhancePlus || 0) * 30);
      st.player.bronze += refundBr;

      // Kembalikan 1 bahan Common area saat ini
      const curAreaId = (locations.find(l => l.location_id === st.player.currentLocationId) || locations[0])?.area_id;
      const areaCommonMat = materialsList.find(m => m.area_id === curAreaId && m.rarity === "Common") || materialsList[0];
      if (areaCommonMat) {
        const mId = areaCommonMat.material_id;
        st.inventory.materials[mId] = Math.min(9999, (st.inventory.materials[mId] || 0) + 1);
      }

      game._log(`♻️ Membongkar ${removed.name} -> +${B.formatCurrency(refundBr)}${areaCommonMat ? ` & +1 ${areaCommonMat.material_name}` : ""}.`);
      persistSave();
      notify();
      return {
        ok: true,
        scrappedName: removed.name,
        refundBr,
        salvagedMaterial: areaCommonMat ? areaCommonMat.material_name : null
      };
    },

    // =====================================================================
    // FASE 3B — PASAR SUPPLY & DEMAND 77 KOTA + 5 MURID AI SEED & CABANG
    // =====================================================================
    getMarketState({ viaShadowSyndicate = false, areaFilter = "LOCAL" } = {}) {
      const st = game.state;
      const p = st.player;
      const snd = game.sndEngine;
      registerRealMaterialsIntoSndEngine(snd);

      const locId = p.currentLocationId;
      const loc = locations.find(l => l.location_id === locId) || locations[0];
      const nowMs = st.calendar.nowMs;
      const sub = game.skillEngine.computeSubStats(p.stats, p.focusSubStats).byId;
      const bargainBonusPct = sub.cha_trade_bargaining ? sub.cha_trade_bargaining.value : 0;
      const effectiveCha = p.stats.CHA + Math.round(bargainBonusPct * 1.5);

      const cashCapBr = S.economyConfig.market_class_cash_cap_br?.[loc.settlement_type] ?? 1500;
      const parentLoc = loc.parent_location_id ? locations.find(l => l.location_id === loc.parent_location_id) : null;

      // Daftar bahan untuk dibeli di pasar kota saat ini
      const targetMats = materialsList.filter(m => {
        if (areaFilter === "LOCAL") return m.area_id === loc.area_id;
        if (areaFilter === "TIER") return String(m.tier) === String(loc.tier);
        return m.area_id === areaFilter;
      });

      const buyList = targetMats.map(m => {
        const tradeCheck = snd.canTradeAtLocation(locId, m.material_id, viaShadowSyndicate);
        const quote = snd.getPrice(locId, m.material_id, {
          mode: "buy",
          nowMs,
          cha: effectiveCha,
          viaShadowSyndicate
        });
        const sd = snd.getEffectiveSD(locId, m.material_id, nowMs);
        return {
          id: m.material_id,
          name: m.material_name,
          rarity: m.rarity,
          category: m.category,
          areaName: m.area_name,
          minMarketClass: m.min_market_class,
          ownedQty: st.inventory.materials?.[m.material_id] || 0,
          allowed: tradeCheck.allowed,
          lockReason: tradeCheck.reason,
          quote,
          supplyRatioPct: Math.round((sd.s / Math.max(1, sd.baseDepth)) * 100)
        };
      });

      // Daftar bahan di Tas pemain untuk dijual ke pasar
      const sellMatList = Object.entries(st.inventory.materials || {})
        .filter(([, q]) => q > 0)
        .map(([id, qty]) => {
          const m = materialsById[id];
          const tradeCheck = snd.canTradeAtLocation(locId, id, viaShadowSyndicate);
          const quote = snd.getPrice(locId, id, {
            mode: "sell",
            nowMs,
            cha: effectiveCha,
            viaShadowSyndicate
          });
          return {
            id,
            name: m?.material_name || id,
            rarity: m?.rarity || "Common",
            category: m?.category || "Material",
            qty,
            allowed: tradeCheck.allowed,
            lockReason: tradeCheck.reason,
            quote
          };
        });

      // Daftar barang Galeri untuk dijual ke pasar senjata kota
      const sellGearList = (st.inventory.forgedGallery || []).map(g => {
        const commodityId = g.tier >= 3 ? "wpn_ember_blade" : g.tier >= 2 ? "wpn_ashwind_bow" : "wpn_iron_axe";
        const baseQuote = snd.getPrice(locId, commodityId, {
          mode: "sell",
          nowMs,
          cha: effectiveCha,
          viaShadowSyndicate
        });
        const qualMult = g.qualityMult || 1.0;
        const enhMult = 1 + (g.enhancePlus || 0) * 0.12;
        const estPriceBr = Math.max(15, Math.round(baseQuote.finalPriceBr * qualMult * enhMult));
        return {
          uid: g.uid,
          name: g.name,
          rarity: g.rarity || "Common",
          qualityName: g.qualityName || "Biasa",
          itemType: g.itemType || "weapon",
          commodityId,
          estPriceBr,
          formatted: B.formatCurrency(estPriceBr),
          exceedsCashCap: !viaShadowSyndicate && estPriceBr > cashCapBr
        };
      });

      // Ringkasan relasi politik faksi lokal terhadap faksi lain
      const localRelations = factions
        .filter(f => f.faction_id !== loc.faction_id)
        .map(f => ({
          factionId: f.faction_id,
          factionName: f.faction_name,
          status: snd.getRelationStatus(loc.faction_id, f.faction_id)
        }));

      return {
        loc,
        parentLoc,
        cashCapBr,
        cashCapFormatted: B.formatCurrency(cashCapBr),
        effectiveCha,
        bargainBonusPct,
        isBoycotted: snd.worldState.boycottedFactions.has(loc.faction_id),
        festivalActive: Boolean(snd.worldState.festivalActive),
        caravanEvents: snd.worldState.activeCaravanEvents || [],
        activeDeltasCount: snd.marketDeltas.size,
        localRelations,
        buyList,
        sellMatList,
        sellGearList
      };
    },

    buyMarketMaterial({ itemId, qty = 1, viaShadowSyndicate = false } = {}) {
      const st = game.state;
      const p = st.player;
      const snd = game.sndEngine;
      registerRealMaterialsIntoSndEngine(snd);
      const cleanQty = Math.max(1, Math.floor(Number(qty) || 1));

      const sub = game.skillEngine.computeSubStats(p.stats, p.focusSubStats).byId;
      const effectiveCha = p.stats.CHA + Math.round((sub.cha_trade_bargaining?.value || 0) * 1.5);
      const check = snd.canTradeAtLocation(p.currentLocationId, itemId, viaShadowSyndicate);
      if (!check.allowed) return { ok: false, reason: check.reason };

      const quote = snd.getPrice(p.currentLocationId, itemId, {
        mode: "buy",
        nowMs: st.calendar.nowMs,
        cha: effectiveCha,
        viaShadowSyndicate
      });
      const totalCost = quote.finalPriceBr * cleanQty;
      if (p.bronze < totalCost) {
        return { ok: false, reason: `Kas tidak cukup (butuh ${B.formatCurrency(totalCost)}, punya ${B.formatCurrency(p.bronze)}).` };
      }

      const tx = snd.executeTrade(p.currentLocationId, itemId, cleanQty, {
        action: "player_buy",
        nowMs: st.calendar.nowMs,
        cha: effectiveCha,
        viaShadowSyndicate
      });
      if (!tx.ok) return tx;

      p.bronze -= tx.totalBr;
      st.inventory.materials[itemId] = Math.min(9999, (st.inventory.materials[itemId] || 0) + cleanQty);
      const mName = materialsById[itemId]?.material_name || itemId;
      game._log(`🛒 Membeli ${cleanQty}x ${mName} seharga ${tx.totalFormatted} (geser harga ${tx.priceShiftPct >= 0 ? "+" : ""}${tx.priceShiftPct}%).`);
      persistSave();
      notify();
      return { ok: true, tx, itemName: mName };
    },

    sellBagMaterial({ itemId, qty = 1, viaShadowSyndicate = false } = {}) {
      const st = game.state;
      const p = st.player;
      const snd = game.sndEngine;
      registerRealMaterialsIntoSndEngine(snd);
      const owned = st.inventory.materials?.[itemId] || 0;
      const cleanQty = Math.max(1, Math.min(owned, Math.floor(Number(qty) || 1)));
      if (owned <= 0) return { ok: false, reason: "Stok bahan di Tas sudah habis." };

      const sub = game.skillEngine.computeSubStats(p.stats, p.focusSubStats).byId;
      const effectiveCha = p.stats.CHA + Math.round((sub.cha_trade_bargaining?.value || 0) * 1.5);
      const tx = snd.executeTrade(p.currentLocationId, itemId, cleanQty, {
        action: "player_sell",
        nowMs: st.calendar.nowMs,
        cha: effectiveCha,
        viaShadowSyndicate
      });
      if (!tx.ok) return tx;

      st.inventory.materials[itemId] -= cleanQty;
      if (st.inventory.materials[itemId] <= 0) delete st.inventory.materials[itemId];
      p.bronze += tx.totalBr;

      const mName = materialsById[itemId]?.material_name || itemId;
      game._log(`💰 Menjual ${cleanQty}x ${mName} -> +${tx.totalFormatted} (saturasi pasar ${tx.priceShiftPct}%).`);
      persistSave();
      notify();
      return { ok: true, tx, itemName: mName };
    },

    sellGalleryGearToMarket({ targetUid, viaShadowSyndicate = false } = {}) {
      const st = game.state;
      const p = st.player;
      const snd = game.sndEngine;
      const gal = st.inventory.forgedGallery || [];
      const idx = gal.findIndex(x => x && x.uid === targetUid);
      if (idx < 0) return { ok: false, reason: "Barang tidak ditemukan di Galeri." };

      const item = gal[idx];
      const mState = Bridge.getMarketState({ viaShadowSyndicate });
      const gearRow = mState.sellGearList.find(g => g.uid === targetUid);
      if (!gearRow) return { ok: false, reason: "Gagal menghitung harga jual barang." };
      if (gearRow.exceedsCashCap) {
        return {
          ok: false,
          reason: `Modal toko ${mState.loc.location_name} (${mState.cashCapFormatted}) tidak sanggup membeli ${item.name} (${gearRow.formatted}). Jual di Town/City lebih besar atau lewat Shadow Syndicate!`
        };
      }

      // Catat saturasi komoditas senjata di S&D Engine
      const sub = game.skillEngine.computeSubStats(p.stats, p.focusSubStats).byId;
      const effectiveCha = p.stats.CHA + Math.round((sub.cha_trade_bargaining?.value || 0) * 1.5);
      snd.executeTrade(p.currentLocationId, gearRow.commodityId, 1, {
        action: "player_sell",
        nowMs: st.calendar.nowMs,
        cha: effectiveCha,
        viaShadowSyndicate
      });

      gal.splice(idx, 1);
      p.bronze += gearRow.estPriceBr;
      game._log(`💰 Menjual hasil tempa ${item.name} di ${mState.loc.location_name} -> +${gearRow.formatted}!`);
      persistSave();
      notify();
      return { ok: true, itemName: item.name, earnedBr: gearRow.estPriceBr, formatted: gearRow.formatted };
    },

    refreshCaravanNews() {
      const st = game.state;
      const logs = game.sndEngine.simulateOfflineDays(1, st.calendar.day * 97 + 13, st.calendar.nowMs);
      persistSave();
      notify();
      return { ok: true, logs };
    },

    // --- 5 MURID AI SEED & CABANG BENGKEL ---
    setCompanionApprentice(seed) {
      const st = game.state;
      const target = st.apprentices.find(a => a.seed === seed);
      if (!target) return { ok: false, reason: "Murid tidak ditemukan." };
      if (target.branchLocationId) {
        return { ok: false, reason: "Murid ini sedang bertugas menjaga Cabang Bengkel. Tarik dari cabang dulu bila ingin dijadikan Companion." };
      }
      for (const a of st.apprentices) {
        a.isCompanion = a.seed === seed;
      }
      const prof = game.skillEngine.generateApprenticeFromSeed(target.seed, target.skill, target.passedTrials);
      game._log(`⚔️ ${target.seed.split("-").pop()} (${prof.smithClass}) ditetapkan sebagai Companion Tempur aktif!`);
      persistSave();
      notify();
      return { ok: true, profile: prof };
    },

    runApprenticeTrial(seed) {
      const res = game.runApprenticeTrial(seed);
      if (!res.success) return { ok: false, reason: res.reason };
      persistSave();
      notify();
      return { ok: true, apprentice: res.apprentice };
    },

    openBranchWithApprentice(seed, locationId = null) {
      const st = game.state;
      const targetLocId = locationId || st.player.currentLocationId;
      if (st.branches.some(b => b.locationId === targetLocId)) {
        return { ok: false, reason: "Sudah ada Cabang Bengkel aktif di kota ini." };
      }
      const existingByApp = st.branches.find(b => b.apprenticeSeed === seed);
      if (existingByApp) {
        return { ok: false, reason: "Murid ini sudah memimpin cabang di kota lain." };
      }
      const res = game.assignApprenticeToBranch(seed, targetLocId);
      if (!res.success) return { ok: false, reason: res.reason };

      // Pastikan masih ada 1 murid lain menjadi Companion bila yang ditugaskan tadi adalah Companion
      if (!st.apprentices.some(a => a.isCompanion)) {
        const freeApp = st.apprentices.find(a => !a.branchLocationId);
        if (freeApp) freeApp.isCompanion = true;
      }
      persistSave();
      notify();
      return { ok: true, branch: res.branch };
    },

    recallApprenticeFromBranch(seed) {
      const st = game.state;
      const app = st.apprentices.find(a => a.seed === seed);
      if (!app || !app.branchLocationId) {
        return { ok: false, reason: "Murid ini tidak sedang menjaga cabang." };
      }
      const prevLoc = locations.find(l => l.location_id === app.branchLocationId);
      st.branches = st.branches.filter(b => b.apprenticeSeed !== seed);
      app.branchLocationId = null;
      if (!st.apprentices.some(a => a.isCompanion)) app.isCompanion = true;
      game._log(`↩ Menarik kembali ${seed.split("-").pop()} dari cabang ${prevLoc ? prevLoc.location_name : ""}.`);
      persistSave();
      notify();
      return { ok: true };
    },

    // Save / Load / Reset (Sparse JSON < 15 KB)
    exportSave() {
      return game.exportSaveState();
    },
    importSave(jsonText) {
      game.importSaveState(jsonText);
      registerRealMaterialsIntoSndEngine(game.sndEngine);
      game.state.player.characterCreated = true;
      ensurePlayerV33Fields(game.state.player);
      ensureEquipmentV33Fields(game.state.equipment);
      persistSave();
      notify();
      return true;
    },
    resetSave() {
      try { localStorage.removeItem(SAVE_KEY); } catch {}
      hasSavedGame = false;
      lastIdleReport = null;
      lastBossDuelReport = null;
      lastForgeResult = null;
      game = createGameInstance();
      ensurePlayerV33Fields(game.state.player);
      ensureEquipmentV33Fields(game.state.equipment);
      notify();
    },

    loadUiPrefs() {
      const def = { global: 100, tl: 100, tr: 100, bm: 100 };
      try {
        const raw = JSON.parse(localStorage.getItem(UI_PREFS_KEY) || "null");
        if (raw && typeof raw === "object") {
          for (const k of ["global", "tl", "tr", "bm"]) {
            const n = Number(raw[k]);
            if (Number.isFinite(n) && n >= 75 && n <= 125) def[k] = n;
          }
        }
      } catch {}
      return def;
    },
    saveUiPrefs(prefs) {
      try { localStorage.setItem(UI_PREFS_KEY, JSON.stringify(prefs)); } catch {}
    }
  };

  global.BSRPG_BRIDGE = Bridge;
})(window);
