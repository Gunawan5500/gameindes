/* ============================================================================
 * BATTLE-SMITH RPG — Tidewrack Village (Lv.1) HD-2D Three.js Node Prototype
 * Arsitektur: 1 Node Panggung Aktif (RF Online / Octopath HD-2D × SWTOR × Amalur)
 * Sinkronisasi: master_CD_v3.1.md (v3.3) & master_WD_v1.9.md
 * 100% Offline • Target: HP Oppo A54 (<150MB RAM) & Laptop ASUS ROG GL553VD
 * ============================================================================ */
(function () {
  'use strict';

  if (typeof THREE === 'undefined') {
    document.body.innerHTML = '<div style="padding:24px;color:#f6c368;font-family:sans-serif">Gagal memuat Three.js (lib/three.min.js tidak ditemukan).</div>';
    return;
  }
  if (typeof window.BattleSmithSkillV33 === 'undefined') {
    document.body.innerHTML = '<div style="padding:24px;color:#f6c368;font-family:sans-serif">Gagal memuat Skill Engine CD v3.3 (skill_engine_v33.js tidak ditemukan).</div>';
    return;
  }

  const skillV33 = window.BattleSmithSkillV33;
  const skillEngine = skillV33.engine;
  const skillData = skillV33.skillData;
  const SMITH_CLASSES = ['Weaponsmith', 'Armorer', 'Rangesmith', 'Runesmith', 'Reforger'];

  // --------------------------------------------------------------------------
  // 1. MASTER DATA SLICE (Tidewrack Village & Saltgrave Coast Lv.1 + CD v3.3)
  // --------------------------------------------------------------------------
  const ROLE_MOD = {
    Brute:      { hp: 0.90, dmg: 1.25, spd: 0.9, acc: 80, dodge: 3,  armor: 10 },
    Skirmisher: { hp: 0.85, dmg: 1.10, spd: 1.3, acc: 85, dodge: 15, armor: 0  },
    Caster:     { hp: 0.80, dmg: 1.30, spd: 1.0, acc: 90, dodge: 5,  armor: 0  },
    Tank:       { hp: 1.40, dmg: 0.80, spd: 0.8, acc: 75, dodge: 0,  armor: 25 },
    Support:    { hp: 1.10, dmg: 0.90, spd: 1.0, acc: 85, dodge: 10, armor: 10 }
  };

  const TYPE_MOD = {
    'Reguler':        { hp: 1.0, dmg: 1.00, dodge: 0, armor: 0 },
    'Reguler Khusus': { hp: 1.5, dmg: 1.15, dodge: 2, armor: 3 }
  };

  const WEAPON_CATALOG = [
    {
      id: 'wpn_starter_hammer',
      weaponCatalogId: 'w_str_3',
      name: 'Palu Besi Tua',
      stat: 'STR', tier: 1, mode: 'Dekat', tag: 'Dekat', range: 2.5, dmg: 7, crit: 5, el: 'Neutral',
      trigger: 'Heavy Chain', smithClass: 'Weaponsmith',
      cost: {}, price: 0,
      desc: 'Senjata awal Pandai Besi di Tidewrack. Jurus [W]: Heavy Chain (Weaponsmith).'
    },
    {
      id: 'wpn_str_axe',
      weaponCatalogId: 'w_str_1',
      name: 'Kapak Perang Tidewrack',
      stat: 'STR', tier: 1, mode: 'Dekat', tag: 'Dekat', range: 2.6, dmg: 11, crit: 6, el: 'Neutral',
      trigger: 'Twister', smithClass: 'Weaponsmith',
      cost: { 'MAT-A08-02': 2, 'MAT-A08-05': 1 }, price: 65,
      desc: 'CD-4.01 (T1 STR Dekat). Jurus [W]: Twister (+burst AoE Weaponsmith).'
    },
    {
      id: 'wpn_dex_knives',
      weaponCatalogId: 'w_dex_r1',
      name: 'Pisau Lempar Kembar',
      stat: 'DEX', tier: 1, mode: 'Jauh', tag: 'Jauh', range: 6.4, dmg: 9, crit: 12, el: 'Neutral',
      trigger: 'Fan of Knives', smithClass: 'Rangesmith',
      cost: { 'MAT-A08-01': 2, 'MAT-A08-02': 2 }, price: 70,
      desc: 'CD-4.04 (Jauh — butuh Rangesmith T1 / Omnismith). Jurus [W]: Fan of Knives!'
    },
    {
      id: 'wpn_int_staff',
      weaponCatalogId: 'w_int_1',
      name: 'Tongkat Rune Petir',
      stat: 'INT', tier: 1, mode: 'Jauh', tag: 'Jauh', range: 5.8, dmg: 10, crit: 8, el: 'Lightning',
      trigger: 'Arcane Bolt', smithClass: 'Runesmith',
      cost: { 'MAT-A08-01': 3, 'MAT-A08-05': 1 }, price: 85,
      desc: 'CD-4.01 (T1 INT — butuh Runesmith/Rangesmith T1 atau Omnismith). Jurus [W]: Arcane Bolt (Lightning)!'
    }
  ];

  const MATERIAL_CATALOG = {
    'MAT-A08-01': { id: 'MAT-A08-01', name: 'Salt Crystal', rarity: 'Common', price: 20, el: 'Lightning', desc: 'Kristal garam bermuatan petir dari Tidewrack Beach.' },
    'MAT-A08-02': { id: 'MAT-A08-02', name: 'Crab Shell', rarity: 'Common', price: 20, el: 'Neutral', desc: 'Cangkang keras kepiting pantai untuk kepala senjata & pelindung.' },
    'MAT-A08-05': { id: 'MAT-A08-05', name: 'Anchor Iron', rarity: 'Uncommon', price: 80, el: 'Neutral', desc: 'Besi jangkar karam berkualitas tinggi (Tempered +20%).' }
  };

  // Authentic Lv.1 Monsters from data/areas/saltgrave_coast.json
  const BEACH_MONSTER_TEMPLATES = [
    {
      id: 'A08-R-001', name: 'Runt Beach Crab', sp: 'crab',
      type: 'Reguler', role: 'Tank', lvl: 1, el: 'Neutral', weak: 'Neutral',
      drops: ['MAT-A08-02', 'MAT-A08-01'], bronze: 14, xp: 20,
      pos: [-5.5, 0, -2.5]
    },
    {
      id: 'A08-R-002', name: 'Runt Sand Gull', sp: 'gull',
      type: 'Reguler', role: 'Skirmisher', lvl: 1, el: 'Neutral', weak: 'Neutral',
      drops: ['MAT-A08-01', 'MAT-A08-02'], bronze: 12, xp: 18,
      pos: [1.5, 0, -5.2]
    },
    {
      id: 'A08-R-003', name: 'Runt Tide Scavenger', sp: 'scavenger',
      type: 'Reguler', role: 'Skirmisher', lvl: 1, el: 'Neutral', weak: 'Neutral',
      drops: ['MAT-A08-05', 'MAT-A08-02'], bronze: 18, xp: 22,
      pos: [6.2, 0, 1.8]
    },
    {
      id: 'A08-R-005', name: 'Runt Jellyfish Drifter', sp: 'jellyfish',
      type: 'Reguler Khusus', role: 'Caster', lvl: 1, el: 'Lightning', weak: 'Lightning',
      drops: ['MAT-A08-01', 'MAT-A08-05'], bronze: 32, xp: 34,
      castSkill: 'Static Surge',
      pos: [-1.5, 0, 5.4]
    }
  ];

  // --------------------------------------------------------------------------
  // 2. GAME STATE (Player Lv.1 + Full CD v3.3 Skill Tree, RF Mastery & Destiny)
  // --------------------------------------------------------------------------
  const state = {
    activeNodeId: 'tidewrack_village',
    cameraMode: 'octopath', // 'octopath' | 'diablo' | 'swtor'
    qualityMode: 'lite',    // 'lite' (Oppo A54) | 'ultra' (ROG GL553VD)
    idleMode: false,
    showDpad: false,
    modalOpen: false,

    player: {
      name: 'Pandai Besi',
      level: 1,
      tier: 1,
      smithClass: 'Bladesmith',
      smithTiers: { Weaponsmith: 1, Armorer: 0, Rangesmith: 0, Runesmith: 0, Reforger: 0 },
      firstTakenClass: 'Weaponsmith',
      activeDestinyId: null,
      skillMastery: {}, // RF Classic XP per skillId & wsk_*
      selectedMorphs: {}, // { Weaponsmith_T1: 'wpn_t1_m1', ... }
      equippedSkillIds: ['wpn_t1_a'],
      fastTraining: true, // Demo 12x RF Mastery XP agar cepat lihat Lv.1 -> Lv.3 -> Lv.5 -> GM
      isFactionHostile: false, // Uji Shadow Syndicate +50% pada Jalur Ganda Ganti Destiny
      stats: { STR: 3, DEX: 2, CON: 3, INT: 2, WIS: 1, CHA: 2 },
      freePoints: 0,
      hp: 40, maxHp: 40,
      barrier: 0,
      stamina: 115, maxStamina: 115,
      xpBattle: 0, xpSmith: 0,
      xpQuota: 60, // 60 * 1^1.1
      crossBuffBattle: 0,
      crossBuffSmith: 0,
      bronze: 120,
      mulia: 0,
      kejam: 0,
      resources: {
        forge_heat: 0,
        bastion_guard: 0,
        hunters_mark: 0,
        elemental_charge: 0,
        overclock: 0
      },
      equippedWeaponId: 'wpn_starter_hammer',
      ownedWeapons: ['wpn_starter_hammer'],
      inventory: {
        'MAT-A08-01': 2,
        'MAT-A08-02': 2,
        'MAT-A08-05': 1
      }
    },

    // Anti-Spam GCD (1.3d) + Individual Cooldowns + RF Class Buff + Destiny Combat Procs
    gcdDuration: skillData.gcd_sec || 1.3,
    gcdRemaining: 0,
    skillCooldowns: {},
    weaponSkillCd: 0,
    activeClassBuff: null,
    activeClassBuffName: '',
    activeClassBuffTimer: 0,
    runeMarkActive: false,
    arcaneEdgeTimer: 0,
    chronosmithIcd: 0,
    lastCastSkillId: null,
    recentClasses: [],
    v33Build: null,

    companion: {
      recruited: false,
      name: 'Kael',
      role: 'Scout / DPS',
      loyalty: 52, // 0-100 (CD-6.01)
      attackCd: 0
    },

    npcs: {
      brann: { loyalty: 50, talked: false },
      mira:  { loyalty: 48, talked: false },
      kael:  { loyalty: 52, talked: false }
    },

    quests: {
      talkedBrann: false,
      forgedOnce: false,
      huntedCount: 0,
      huntedGoal: 3,
      recruitedKael: false
    },

    // Movement & Targeting
    pos: new THREE.Vector3(0, 0, 2.2),
    moveTarget: null,
    facing: 1,
    walkCycle: 0,
    lungeTimer: 0,
    targetEntity: null,
    nearestInteractable: null,
    autoAttackTimer: 0,
    idleActionTimer: 0,
    cameraYaw: 0
  };

  function getWeapon() {
    return WEAPON_CATALOG.find(w => w.id === state.player.equippedWeaponId) || WEAPON_CATALOG[0];
  }

  function getWeaponEnginePayload() {
    const w = getWeapon();
    return {
      id: w.weaponCatalogId,
      name: w.name,
      stat: w.stat,
      tier: w.tier || 1,
      tag: w.tag || w.mode,
      trigger: w.trigger,
      element: w.el || 'Neutral'
    };
  }

  function calcPlayerDerived() {
    const p = state.player;
    const hpBonusPct = state.v33Build ? (state.v33Build.passiveTotals.max_hp_pct || 0) : 0;
    const baseHp = 20 + 5 * p.stats.CON + 5 * p.tier;
    p.maxHp = Math.round(baseHp * (1 + hpBonusPct / 100));
    p.maxStamina = 100 + 5 * p.stats.CON;
    p.xpQuota = Math.round(60 * Math.pow(p.level, 1.1));
    if (p.hp > p.maxHp) p.hp = p.maxHp;
    if (p.stamina > p.maxStamina) p.stamina = p.maxStamina;
  }

  function refreshBuildV33(skipDomRebuild) {
    const p = state.player;
    const build = skillEngine.buildMacroLoadout({
      stats: p.stats,
      selectedMorphs: p.selectedMorphs,
      loadout: p.equippedSkillIds,
      smithConfig: {
        tiers: p.smithTiers,
        firstTakenClass: p.firstTakenClass,
        activeDestinyId: p.activeDestinyId
      },
      skillMasteryState: p.skillMastery,
      activeDestinyId: p.activeDestinyId,
      weapon: getWeaponEnginePayload()
    });
    state.v33Build = build;
    p.smithClass = build.activeDestinyCard ? build.activeDestinyCard.displayName : build.smith.singleWordClassName;
    p.equippedSkillIds = build.equippedSkills.map(s => s.id);
    if (build.activeDestinyCard?.signatureActive && build.activeDestinyCard.signature?.effect?.min_forge_heat) {
      p.resources.forge_heat = Math.max(1, p.resources.forge_heat);
    }
    calcPlayerDerived();
    if (!skipDomRebuild && typeof renderMacroBarSlots === 'function') {
      renderMacroBarSlots();
    }
    return build;
  }

  function calcMonsterStats(tpl) {
    const r = ROLE_MOD[tpl.role] || ROLE_MOD.Brute;
    const t = TYPE_MOD[tpl.type] || TYPE_MOD['Reguler'];
    const baseHp = 15 + 10 * tpl.lvl;
    const baseDmg = (1.5 + 0.4 * tpl.lvl) * 1.0; // Tier 1 = x1.0
    return {
      maxHp: Math.round(baseHp * r.hp * t.hp),
      dmg: Math.max(2, Math.round(baseDmg * r.dmg * t.dmg * 2.2)), // tuned for punchy Lv1 demo
      spd: r.spd,
      dodge: r.dodge + t.dodge,
      armor: r.armor + t.armor
    };
  }

  // --------------------------------------------------------------------------
  // 3. THREE.JS CORE & RENDERER SETUP (Oppo A54 Lite / ROG GL553VD Ultra)
  // --------------------------------------------------------------------------
  const canvas = document.getElementById('three-canvas');
  const worldOverlay = document.getElementById('world-overlay');

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'default'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(44, window.innerWidth / window.innerHeight, 0.1, 120);

  // Persistent Scene Root vs Active Node Group (strictly disposed on Node Switch!)
  const activeNodeGroup = new THREE.Group();
  scene.add(activeNodeGroup);
  const dynamicActorsGroup = new THREE.Group();
  scene.add(dynamicActorsGroup);

  // Data-Driven VFX, Sprite Sheet, Paperdoll Weapon & GPU Particle Manager
  const vfx = new window.BattleSmithVFXManager(scene, camera);

  const nodeEntities = [];   // Interactables, NPCs, Enemies, Mining nodes, Portals in current node
  const nodeParticles = [];  // (Legacy fallback unused — ambient particles now run in 1 GPU THREE.Points call!)
  const activeFloaters = []; // Floating damage & loot popups
  const activeSlashes = [];  // (Handled by vfx_manager.js)
  let waterMesh = null;
  let forgeLight = null;
  let clickRingMesh = null;
  let targetRingMesh = null;

  // Detect default quality based on screen / device
  if (window.innerWidth >= 1024 && (navigator.hardwareConcurrency || 4) >= 6) {
    state.qualityMode = 'ultra';
  }

  function applyQualityPreset() {
    const isUltra = state.qualityMode === 'ultra';
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isUltra ? 1.75 : 1.0));
    renderer.shadowMap.enabled = isUltra;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.needsUpdate = true;
    vfx.setUltraQuality(isUltra);
    document.getElementById('btn-quality').textContent = isUltra ? 'ROG Ultra' : 'Oppo A54 Lite';
    document.getElementById('btn-quality').classList.toggle('active', isUltra);
  }

  // --------------------------------------------------------------------------
  // 4. PROCEDURAL TEXTURES & HD-2D SPRITE STANDEE GENERATOR (100% Offline)
  // --------------------------------------------------------------------------
  function makeCanvasTex(size, drawFn, repeat) {
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const ctx = c.getContext('2d');
    drawFn(ctx, size);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    if (repeat) {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(repeat[0], repeat[1]);
    }
    return tex;
  }

  function createCobbleTex() {
    return makeCanvasTex(256, (ctx, s) => {
      ctx.fillStyle = '#2d373f';
      ctx.fillRect(0, 0, s, s);
      for (let y = 0; y < s; y += 32) {
        const offset = (y / 32) % 2 === 0 ? 0 : 16;
        for (let x = -16; x < s; x += 32) {
          const shade = 52 + ((x * 13 + y * 7) % 22);
          ctx.fillStyle = `rgb(${shade}, ${shade + 8}, ${shade + 13})`;
          ctx.fillRect(x + offset + 2, y + 2, 28, 28);
          ctx.fillStyle = `rgba(255,255,255,0.06)`;
          ctx.fillRect(x + offset + 3, y + 3, 26, 4);
        }
      }
      // Subtle salt/sand dust speckles
      for (let i = 0; i < 160; i++) {
        ctx.fillStyle = i % 2 ? 'rgba(210,198,165,0.12)' : 'rgba(12,18,22,0.16)';
        ctx.fillRect((i * 53) % s, (i * 97) % s, 3, 3);
      }
    }, [7, 7]);
  }

  function createSandTex() {
    return makeCanvasTex(256, (ctx, s) => {
      ctx.fillStyle = '#7b745d';
      ctx.fillRect(0, 0, s, s);
      for (let i = 0; i < 700; i++) {
        const x = (i * 73) % s;
        const y = (i * 131) % s;
        ctx.fillStyle = i % 3 === 0 ? 'rgba(220,210,178,0.22)' : (i % 3 === 1 ? 'rgba(65,58,45,0.22)' : 'rgba(130,148,142,0.15)');
        ctx.fillRect(x, y, 4, 2);
      }
      // Subtle tide ripples
      ctx.strokeStyle = 'rgba(235,225,195,0.1)';
      ctx.lineWidth = 2;
      for (let y = 16; y < s; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(s * 0.3, y - 6, s * 0.7, y + 6, s, y);
        ctx.stroke();
      }
    }, [8, 8]);
  }

  function createWoodTex(dark) {
    return makeCanvasTex(128, (ctx, s) => {
      ctx.fillStyle = dark ? '#3c2d23' : '#5e4633';
      ctx.fillRect(0, 0, s, s);
      for (let y = 0; y < s; y += 16) {
        ctx.fillStyle = y % 32 === 0 ? 'rgba(0,0,0,0.18)' : 'rgba(255,220,180,0.06)';
        ctx.fillRect(0, y, s, 14);
        ctx.fillStyle = 'rgba(15,10,6,0.55)';
        ctx.fillRect(0, y + 14, s, 2);
      }
    }, [2, 2]);
  }

  function createShadowDiscTex() {
    return makeCanvasTex(64, (ctx, s) => {
      const g = ctx.createRadialGradient(s / 2, s / 2, 4, s / 2, s / 2, s / 2);
      g.addColorStop(0, 'rgba(0,0,0,0.62)');
      g.addColorStop(0.65, 'rgba(0,0,0,0.26)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, s, s);
    });
  }
  const sharedShadowTex = createShadowDiscTex();

  // Hand-crafted HD-2D Cutout Character & Monster Sprite Renderer (256x256 Transparent PNG-like Canvas)
  function createCharacterSpriteTex(kind) {
    return makeCanvasTex(256, (ctx) => {
      ctx.clearRect(0, 0, 256, 256);
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      const outline = '#0d1116';

      if (kind === 'hero') {
        // Battle-Smith Protagonist (apron, steel pauldron, glowing hammer/weapon)
        // Cloak
        ctx.fillStyle = '#244552';
        ctx.strokeStyle = outline;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(92, 96); ctx.lineTo(64, 212); ctx.lineTo(186, 212); ctx.lineTo(164, 96);
        ctx.closePath(); ctx.fill(); ctx.stroke();

        // Boots
        ctx.fillStyle = '#33241b';
        ctx.fillRect(96, 198, 22, 34); ctx.strokeRect(96, 198, 22, 34);
        ctx.fillRect(136, 198, 22, 34); ctx.strokeRect(136, 198, 22, 34);

        // Torso & Leather Smith Apron
        ctx.fillStyle = '#6c492f';
        ctx.beginPath();
        ctx.roundRect(92, 102, 72, 102, 12);
        ctx.fill(); ctx.stroke();

        // Steel Chest Plate & Belt
        ctx.fillStyle = '#7f93a3';
        ctx.beginPath(); ctx.roundRect(96, 104, 64, 34, 8); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#e29b38';
        ctx.fillRect(92, 148, 72, 11); ctx.strokeRect(92, 148, 72, 11);

        // Shoulder Pauldron
        ctx.fillStyle = '#9db1c2';
        ctx.beginPath(); ctx.arc(92, 114, 18, Math.PI, Math.PI * 2); ctx.fill(); ctx.stroke();

        // Head & Hair
        ctx.fillStyle = '#e8c4a0';
        ctx.beginPath(); ctx.arc(128, 74, 24, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#2c221e';
        ctx.beginPath(); ctx.arc(128, 67, 25, Math.PI * 0.95, Math.PI * 2.05); ctx.fill(); ctx.stroke();
        // Eyes
        ctx.fillStyle = '#15191f';
        ctx.fillRect(120, 74, 5, 5); ctx.fillRect(134, 74, 5, 5);

        // Forge Gloves (Weapon rendered independently by Paperdoll Weapon Plane!)
        ctx.fillStyle = '#4a3222';
        ctx.beginPath(); ctx.arc(168, 146, 11, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(88, 148, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      } else if (kind === 'brann') {
        // Master Brann (Dwarf Forgemaster)
        ctx.strokeStyle = outline; ctx.lineWidth = 6;
        ctx.fillStyle = '#4e3322';
        ctx.beginPath(); ctx.roundRect(78, 114, 100, 114, 16); ctx.fill(); ctx.stroke();
        // Heavy anvil apron
        ctx.fillStyle = '#8b451c';
        ctx.fillRect(96, 126, 64, 96); ctx.strokeRect(96, 126, 64, 96);
        // Head
        ctx.fillStyle = '#e5b793';
        ctx.beginPath(); ctx.arc(128, 86, 26, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        // Big braided fiery-grey beard
        ctx.fillStyle = '#c97e46';
        ctx.beginPath();
        ctx.moveTo(98, 92); ctx.quadraticCurveTo(128, 178, 158, 92);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        // Forge tongs / hammer
        ctx.fillStyle = '#9aaab8';
        ctx.fillRect(178, 94, 12, 84); ctx.strokeRect(178, 94, 12, 84);
        ctx.fillStyle = '#f29a35';
        ctx.fillRect(166, 78, 36, 22); ctx.strokeRect(166, 78, 36, 22);
      } else if (kind === 'mira') {
        // Mira Saltvein (Human Coastal Informant / Trader)
        ctx.strokeStyle = outline; ctx.lineWidth = 6;
        ctx.fillStyle = '#1e5b63';
        ctx.beginPath(); ctx.moveTo(96, 102); ctx.lineTo(74, 226); ctx.lineTo(182, 226); ctx.lineTo(160, 102); ctx.closePath();
        ctx.fill(); ctx.stroke();
        // Gold sash
        ctx.fillStyle = '#e29b38';
        ctx.beginPath(); ctx.moveTo(100, 106); ctx.lineTo(166, 182); ctx.lineTo(154, 194); ctx.lineTo(90, 118); ctx.closePath();
        ctx.fill(); ctx.stroke();
        // Head + tricorn-like coastal hood
        ctx.fillStyle = '#eac7a6';
        ctx.beginPath(); ctx.arc(128, 76, 22, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#163840';
        ctx.beginPath(); ctx.moveTo(94, 72); ctx.lineTo(128, 42); ctx.lineTo(164, 72); ctx.closePath(); ctx.fill(); ctx.stroke();
        // Glowing brass lantern in hand
        ctx.fillStyle = '#f6c368';
        ctx.beginPath(); ctx.arc(182, 152, 13, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      } else if (kind === 'kael') {
        // Kael (Elf Apprentice / Companion)
        ctx.strokeStyle = outline; ctx.lineWidth = 6;
        ctx.fillStyle = '#2d6a56';
        ctx.beginPath(); ctx.moveTo(98, 100); ctx.lineTo(80, 222); ctx.lineTo(176, 222); ctx.lineTo(158, 100); ctx.closePath();
        ctx.fill(); ctx.stroke();
        // Pointed Elf ears & head
        ctx.fillStyle = '#ecd0b4';
        ctx.beginPath(); ctx.moveTo(102, 74); ctx.lineTo(84, 64); ctx.lineTo(106, 84); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(154, 74); ctx.lineTo(172, 64); ctx.lineTo(150, 84); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(128, 76, 21, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#d4b46a';
        ctx.beginPath(); ctx.arc(128, 66, 22, Math.PI, Math.PI * 2); ctx.fill(); ctx.stroke();
        // Spear
        ctx.strokeStyle = '#6c492f'; ctx.lineWidth = 8;
        ctx.beginPath(); ctx.moveTo(174, 222); ctx.lineTo(192, 54); ctx.stroke();
        ctx.fillStyle = '#cfe4f0'; ctx.strokeStyle = outline; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(194, 34); ctx.lineTo(206, 68); ctx.lineTo(182, 66); ctx.closePath(); ctx.fill(); ctx.stroke();
      } else if (kind === 'crab') {
        // Runt Beach Crab (Armored Coastal Tank)
        ctx.strokeStyle = outline; ctx.lineWidth = 6;
        // Legs
        for (let i = -1; i <= 1; i++) {
          ctx.beginPath(); ctx.moveTo(86, 178 + i * 10); ctx.lineTo(44, 214 + i * 8); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(170, 178 + i * 10); ctx.lineTo(212, 214 + i * 8); ctx.stroke();
        }
        // Heavy crimson-rust shell
        ctx.fillStyle = '#a83c32';
        ctx.beginPath(); ctx.ellipse(128, 164, 68, 44, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        // Barnacle plates
        ctx.fillStyle = '#c9a679';
        ctx.beginPath(); ctx.arc(106, 152, 12, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(152, 156, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        // Huge Claws
        ctx.fillStyle = '#c84b3c';
        ctx.beginPath(); ctx.arc(62, 126, 28, 0.3, Math.PI * 1.8); ctx.lineTo(62, 126); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(194, 126, 28, Math.PI * 1.2, Math.PI * 2.7); ctx.lineTo(194, 126); ctx.closePath(); ctx.fill(); ctx.stroke();
        // Glowing yellow stalk eyes
        ctx.fillStyle = '#ffe066';
        ctx.beginPath(); ctx.arc(110, 124, 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(146, 124, 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      } else if (kind === 'gull') {
        // Runt Sand Gull (Feral Sea Bird Skirmisher)
        ctx.strokeStyle = outline; ctx.lineWidth = 6;
        // Wings spread
        ctx.fillStyle = '#cfd9e2';
        ctx.beginPath();
        ctx.moveTo(128, 126); ctx.quadraticCurveTo(54, 52, 24, 118); ctx.lineTo(88, 148);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(128, 126); ctx.quadraticCurveTo(202, 52, 232, 118); ctx.lineTo(168, 148);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        // Body
        ctx.fillStyle = '#e5edf2';
        ctx.beginPath(); ctx.ellipse(128, 144, 34, 42, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        // Beak & Fierce Eyes
        ctx.fillStyle = '#e89d38';
        ctx.beginPath(); ctx.moveTo(118, 118); ctx.lineTo(128, 144); ctx.lineTo(138, 118); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#d9483b';
        ctx.fillRect(114, 108, 7, 7); ctx.fillRect(135, 108, 7, 7);
      } else if (kind === 'scavenger') {
        // Runt Tide Scavenger (Bandit Skirmisher)
        ctx.strokeStyle = outline; ctx.lineWidth = 6;
        ctx.fillStyle = '#434a52';
        ctx.beginPath(); ctx.moveTo(94, 98); ctx.lineTo(74, 224); ctx.lineTo(182, 224); ctx.lineTo(162, 98); ctx.closePath(); ctx.fill(); ctx.stroke();
        // Bandana mask + hood
        ctx.fillStyle = '#7d302c';
        ctx.beginPath(); ctx.arc(128, 84, 22, 0, Math.PI); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#2d333a';
        ctx.beginPath(); ctx.arc(128, 72, 25, Math.PI * 0.9, Math.PI * 2.1); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#f0c451';
        ctx.fillRect(116, 72, 6, 5); ctx.fillRect(134, 72, 6, 5);
        // Rusty curved dagger
        ctx.fillStyle = '#aeb9c4';
        ctx.beginPath(); ctx.moveTo(170, 148); ctx.lineTo(222, 114); ctx.lineTo(184, 166); ctx.closePath(); ctx.fill(); ctx.stroke();
      } else if (kind === 'jellyfish') {
        // Runt Jellyfish Drifter (Reguler Khusus — Lightning Caster!)
        ctx.strokeStyle = outline; ctx.lineWidth = 5;
        // Electric glow aura
        const grad = ctx.createRadialGradient(128, 116, 12, 128, 116, 98);
        grad.addColorStop(0, 'rgba(108, 224, 212, 0.55)');
        grad.addColorStop(1, 'rgba(108, 224, 212, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 256, 256);
        // Crackling Tendrils
        ctx.strokeStyle = '#6ce0d4'; ctx.lineWidth = 6;
        for (let i = 0; i < 5; i++) {
          const sx = 86 + i * 21;
          ctx.beginPath();
          ctx.moveTo(sx, 128);
          ctx.bezierCurveTo(sx - 16, 168, sx + 18, 194, sx - 6, 226);
          ctx.stroke();
        }
        // Bell Dome
        ctx.fillStyle = '#2c8fa3'; ctx.strokeStyle = '#bdf8f2'; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.arc(128, 114, 58, Math.PI, 0); ctx.quadraticCurveTo(128, 146, 70, 114); ctx.closePath();
        ctx.fill(); ctx.stroke();
        // Inner core
        ctx.fillStyle = '#fff1a8';
        ctx.beginPath(); ctx.arc(128, 96, 16, 0, Math.PI * 2); ctx.fill();
      }
    });
  }

  const SPRITE_ID_BY_KIND = {
    hero: 'hero_smith',
    kael: 'companion_kael',
    brann: 'npc_brann',
    mira: 'npc_mira',
    crab: 'mob_crab',
    gull: 'mob_gull',
    scavenger: 'mob_scavenger',
    jellyfish: 'mob_jellyfish'
  };

  // Create upright HD-2D standee group (linked to data/vfx_animation_manifest.json + Sprite Sheet support!)
  function createStandee(kind, scaleW, scaleH) {
    const group = new THREE.Group();
    const spriteId = SPRITE_ID_BY_KIND[kind] || kind;
    const customTex = vfx.getCustomSpriteTexture(spriteId);
    const tex = customTex || createCharacterSpriteTex(kind);

    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      alphaTest: 0.12,
      side: THREE.DoubleSide
    });
    const geo = new THREE.PlaneGeometry(scaleW, scaleH);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = scaleH * 0.5;
    group.add(mesh);

    const shGeo = new THREE.CircleGeometry(scaleW * 0.42, 16);
    const shMat = new THREE.MeshBasicMaterial({ map: sharedShadowTex, transparent: true, depthWrite: false });
    const shadow = new THREE.Mesh(shGeo, shMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.03;
    group.add(shadow);

    group.userData.spriteMesh = mesh;
    group.userData.spriteMat = mat;
    group.userData.spriteKind = kind;
    group.userData.spriteId = spriteId;
    group.userData.isCustomTex = Boolean(customTex);
    group.userData.baseScaleY = scaleH;
    group.userData.animAcc = 0;
    group.userData.animFrame = 0;
    return group;
  }

  function applySpriteTextureToActor(group) {
    if (!group || !group.userData || !group.userData.spriteId) return;
    const spriteId = group.userData.spriteId;
    const customTex = vfx.getCustomSpriteTexture(spriteId);
    const oldTex = group.userData.spriteMat.map;
    const wasCustom = group.userData.isCustomTex;

    if (customTex) {
      group.userData.spriteMat.map = customTex;
      group.userData.isCustomTex = true;
      const cfg = vfx.manifest.sprites[spriteId];
      if (cfg && cfg.sheet) {
        vfx.applySpriteSheetConfig(customTex, cfg.sheet.cols, cfg.sheet.rows, 0, 0);
      }
    } else {
      group.userData.spriteMat.map = createCharacterSpriteTex(group.userData.spriteKind);
      group.userData.isCustomTex = false;
    }
    group.userData.spriteMat.needsUpdate = true;
    if (oldTex && !wasCustom && oldTex !== group.userData.spriteMat.map) {
      oldTex.dispose();
    }
  }

  function stepSpriteSheetAnim(group, clipName, dt) {
    if (!group || !group.userData) return;
    const cfg = vfx.manifest.sprites[group.userData.spriteId];
    if (!cfg || !cfg.sheet) return;
    const cols = Math.max(1, Number(cfg.sheet.cols) || 1);
    const rows = Math.max(1, Number(cfg.sheet.rows) || 1);
    if (cols <= 1 && rows <= 1) return;
    const clip = (cfg.sheet.clips && cfg.sheet.clips[clipName]) || { row: 0, frames: cols, fps: cfg.sheet.fps || 8 };
    const fps = Math.max(1, Number(clip.fps || cfg.sheet.fps) || 8);
    const frameCount = Math.max(1, Math.min(cols, Number(clip.frames) || cols));
    group.userData.animAcc = (group.userData.animAcc || 0) + dt * fps;
    const frame = Math.floor(group.userData.animAcc) % frameCount;
    if (frame !== group.userData.animFrame) {
      group.userData.animFrame = frame;
      vfx.applySpriteSheetConfig(group.userData.spriteMat.map, cols, rows, frame, clip.row || 0);
    }
  }

  // Persistent Player & Companion Actors
  let playerActor = createStandee('hero', 1.7, 1.9);
  dynamicActorsGroup.add(playerActor);

  // Paperdoll Held Weapon Plane attached to Player's Standee (swings & swaps independently!)
  const weaponPivot = new THREE.Group();
  weaponPivot.position.set(0.46, -0.08, 0.06);
  const weaponMat = new THREE.MeshBasicMaterial({
    map: vfx.getWeaponTexture(state.player.equippedWeaponId),
    transparent: true,
    alphaTest: 0.1,
    side: THREE.DoubleSide
  });
  const weaponMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 1.05), weaponMat);
  weaponMesh.position.set(0.08, 0.42, 0);
  weaponPivot.add(weaponMesh);
  playerActor.userData.spriteMesh.add(weaponPivot);
  state.swingTimer = 0;

  let companionActor = createStandee('kael', 1.55, 1.75);
  companionActor.visible = false;
  dynamicActorsGroup.add(companionActor);

  function refreshHeroSprite() {
    const wpn = getWeapon();
    const wCfg = vfx.manifest.weapons[wpn.id] || {};
    weaponMat.map = vfx.getWeaponTexture(wpn.id);
    weaponMat.needsUpdate = true;
    const sc = Number(wCfg.scale) || 1.05;
    weaponMesh.scale.set(sc, sc, 1);
    applySpriteTextureToActor(playerActor);
  }
  refreshHeroSprite();

  // Live refresh when user uploads/resets custom assets in the VFX & Sprite Linker!
  vfx.onAssetChange((category, id) => {
    if (category === 'weapons' || category === 'manifest') {
      refreshHeroSprite();
    }
    if (category === 'sprites' || category === 'manifest') {
      applySpriteTextureToActor(playerActor);
      applySpriteTextureToActor(companionActor);
      nodeEntities.forEach(ent => {
        if (ent.mesh && ent.mesh.userData && ent.mesh.userData.spriteId) {
          applySpriteTextureToActor(ent.mesh);
        }
      });
    }
  });

  // Click-to-Move Marker & Target Selection Ring
  function initMarkers() {
    const cGeo = new THREE.RingGeometry(0.28, 0.44, 24);
    const cMat = new THREE.MeshBasicMaterial({ color: 0xf6c368, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
    clickRingMesh = new THREE.Mesh(cGeo, cMat);
    clickRingMesh.rotation.x = -Math.PI / 2;
    clickRingMesh.position.y = 0.05;
    clickRingMesh.visible = false;
    dynamicActorsGroup.add(clickRingMesh);

    const tGeo = new THREE.RingGeometry(0.68, 0.86, 28);
    const tMat = new THREE.MeshBasicMaterial({ color: 0xdf544c, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
    targetRingMesh = new THREE.Mesh(tGeo, tMat);
    targetRingMesh.rotation.x = -Math.PI / 2;
    targetRingMesh.position.y = 0.06;
    targetRingMesh.visible = false;
    dynamicActorsGroup.add(targetRingMesh);
  }
  initMarkers();

  // --------------------------------------------------------------------------
  // 5. NODE BUILDER & EXPLICIT MEMORY DISPOSAL (1 Node Panggung Aktif!)
  // --------------------------------------------------------------------------
  function disposeActiveNode() {
    let freedGeos = 0;
    let freedMats = 0;
    let freedTexs = 0;

    // Clear node-specific VFX & AoE telegraphs
    vfx.clearNodeVFX();

    // Clear DOM world labels
    nodeEntities.forEach(ent => {
      if (ent.labelEl && ent.labelEl.parentNode) ent.labelEl.parentNode.removeChild(ent.labelEl);
    });
    nodeEntities.length = 0;
    nodeParticles.length = 0;
    activeSlashes.length = 0;
    waterMesh = null;
    forgeLight = null;
    state.targetEntity = null;
    state.nearestInteractable = null;
    state.moveTarget = null;
    targetRingMesh.visible = false;
    clickRingMesh.visible = false;

    const customTexSet = new Set(Object.values(vfx.customTextures.sprites).map(x => x.tex));
    const seenGeo = new Set();
    const seenMat = new Set();
    const seenTex = new Set();

    activeNodeGroup.traverse(obj => {
      if (obj.geometry && !seenGeo.has(obj.geometry)) {
        seenGeo.add(obj.geometry);
        obj.geometry.dispose();
        freedGeos++;
      }
      if (obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach(m => {
          if (m && !seenMat.has(m)) {
            seenMat.add(m);
            if (m.map && m.map !== sharedShadowTex && !customTexSet.has(m.map) && !seenTex.has(m.map)) {
              seenTex.add(m.map);
              m.map.dispose();
              freedTexs++;
            }
            m.dispose();
            freedMats++;
          }
        });
      }
    });

    while (activeNodeGroup.children.length > 0) {
      activeNodeGroup.remove(activeNodeGroup.children[0]);
    }

    return { freedGeos, freedMats, freedTexs };
  }

  function createWorldLabel(text, cssClass) {
    const el = document.createElement('div');
    el.className = 'world-label ' + (cssClass || '');
    el.innerHTML = text;
    worldOverlay.appendChild(el);
    return el;
  }

  function buildLantern(x, z) {
    const g = new THREE.Group();
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.1, 2.5, 6),
      new THREE.MeshStandardMaterial({ color: 0x3b2c22, roughness: 0.9 })
    );
    post.position.y = 1.25;
    g.add(post);

    const lamp = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.42, 0.32),
      new THREE.MeshBasicMaterial({ color: 0xffc86b })
    );
    lamp.position.y = 2.55;
    g.add(lamp);

    if (state.qualityMode === 'ultra') {
      const pt = new THREE.PointLight(0xffb554, 1.5, 9, 1.6);
      pt.position.y = 2.6;
      g.add(pt);
    }
    g.position.set(x, 0, z);
    activeNodeGroup.add(g);
  }

  function buildCottage(x, z, rotY, woodTex, darkWoodTex) {
    const g = new THREE.Group();
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 2.6, 3.4),
      new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.85 })
    );
    wall.position.y = 1.3;
    wall.castShadow = true;
    wall.receiveShadow = true;
    g.add(wall);

    // Warm glowing window
    const win = new THREE.Mesh(
      new THREE.PlaneGeometry(0.95, 0.85),
      new THREE.MeshBasicMaterial({ color: 0xffcf77 })
    );
    win.position.set(0, 1.45, 1.72);
    g.add(win);

    // Pitched roof
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(3.4, 2.1, 4),
      new THREE.MeshStandardMaterial({ map: darkWoodTex, roughness: 0.9 })
    );
    roof.rotation.y = Math.PI / 4;
    roof.position.y = 3.6;
    roof.castShadow = true;
    g.add(roof);

    g.position.set(x, 0, z);
    g.rotation.y = rotY;
    activeNodeGroup.add(g);
  }

  function buildPortalGate(x, z, labelText, targetNodeId, targetTitle) {
    const g = new THREE.Group();
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x4b5b69, roughness: 0.85 });
    const leftPillar = new THREE.Mesh(new THREE.BoxGeometry(0.55, 3.2, 0.55), stoneMat);
    leftPillar.position.set(-1.1, 1.6, 0);
    const rightPillar = new THREE.Mesh(new THREE.BoxGeometry(0.55, 3.2, 0.55), stoneMat);
    rightPillar.position.set(1.1, 1.6, 0);
    const topBar = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.55, 0.65), stoneMat);
    topBar.position.set(0, 3.25, 0);
    g.add(leftPillar, rightPillar, topBar);

    // Glowing RF-Online style waypoint swirl ring
    const swirl = new THREE.Mesh(
      new THREE.TorusGeometry(0.92, 0.09, 10, 28),
      new THREE.MeshBasicMaterial({ color: 0x6ce0d4 })
    );
    swirl.position.set(0, 1.65, 0);
    g.add(swirl);

    const core = new THREE.Mesh(
      new THREE.CircleGeometry(0.86, 20),
      new THREE.MeshBasicMaterial({ color: 0x3caea3, transparent: true, opacity: 0.35, side: THREE.DoubleSide })
    );
    core.position.set(0, 1.65, 0);
    g.add(core);

    const pt = new THREE.PointLight(0x5be3d6, 2.0, 8, 1.5);
    pt.position.set(0, 1.7, 0);
    g.add(pt);

    g.position.set(x, 0, z);
    g.rotation.y = Math.PI / 2;
    activeNodeGroup.add(g);

    const ent = {
      id: 'portal_' + targetNodeId,
      kind: 'portal',
      name: labelText,
      targetNodeId,
      targetTitle,
      mesh: g,
      swirlMesh: swirl,
      pos: new THREE.Vector3(x, 0, z),
      radius: 2.0,
      labelOffsetY: 3.7,
      labelEl: createWorldLabel('🌀 ' + labelText, 'portal')
    };
    nodeEntities.push(ent);
    return ent;
  }

  function addAmbientParticles(colorHex, count, spreadX, spreadZ, riseSpeed) {
    vfx.configureAmbientParticles(colorHex, count, spreadX, spreadZ, riseSpeed);
  }

  // --- NODE 1: TIDEWRACK VILLAGE (Kota Awal — WD-4.07) ---
  function buildTidewrackVillage() {
    scene.background = new THREE.Color(0x12212b);
    scene.fog = new THREE.FogExp2(0x12212b, 0.024);

    // Lighting (Twilight maritime + warm forge rim lighting ala Octopath)
    const hemi = new THREE.HemisphereLight(0x88bfd4, 0x2c241e, 0.85);
    activeNodeGroup.add(hemi);
    const dir = new THREE.DirectionalLight(0xffcf96, 1.05);
    dir.position.set(10, 16, 10);
    dir.castShadow = true;
    activeNodeGroup.add(dir);

    const cobbleTex = createCobbleTex();
    const woodTex = createWoodTex(false);
    const darkWoodTex = createWoodTex(true);

    // Ground plaza
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(28, 22),
      new THREE.MeshStandardMaterial({ map: cobbleTex, roughness: 0.9 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    activeNodeGroup.add(ground);

    // Western Shimmering Sea Edge + Wooden Pier (Saltgrave Coast!)
    const waterGeo = new THREE.PlaneGeometry(16, 32, 12, 12);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x164a5b,
      roughness: 0.25,
      metalness: 0.3,
      transparent: true,
      opacity: 0.92
    });
    waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.rotation.x = -Math.PI / 2;
    waterMesh.position.set(-16.5, -0.25, 0);
    activeNodeGroup.add(waterMesh);

    const pier = new THREE.Mesh(
      new THREE.BoxGeometry(5.5, 0.35, 3.6),
      new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.9 })
    );
    pier.position.set(-11.2, 0.1, 1.2);
    activeNodeGroup.add(pier);

    // Cottages framing the village diorama
    buildCottage(-6.8, -6.5, 0.25, woodTex, darkWoodTex);
    buildCottage(6.5, -6.8, -0.3, woodTex, darkWoodTex);
    buildCottage(-7.8, 6.2, 0.85, woodTex, darkWoodTex);

    // Street Lanterns
    buildLantern(-2.8, -2.5);
    buildLantern(4.8, -2.2);
    buildLantern(8.5, 2.2);

    // --- LANDMARK: BENGKEL TEMPA ANDA (Player's Forge & Anvil) ---
    const forgeGroup = new THREE.Group();
    const hearth = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 1.8, 1.7),
      new THREE.MeshStandardMaterial({ color: 0x454d54, roughness: 0.9 })
    );
    hearth.position.set(0, 0.9, -0.6);
    const chimney = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 2.6, 1.1),
      new THREE.MeshStandardMaterial({ color: 0x383f46, roughness: 0.95 })
    );
    chimney.position.set(0, 2.8, -0.8);
    const fireCore = new THREE.Mesh(
      new THREE.BoxGeometry(1.25, 0.72, 0.5),
      new THREE.MeshBasicMaterial({ color: 0xff8c2b })
    );
    fireCore.position.set(0, 0.85, 0.18);
    const anvilBase = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.65, 0.55),
      new THREE.MeshStandardMaterial({ color: 0x2a3138, metalness: 0.65, roughness: 0.45 })
    );
    anvilBase.position.set(0, 0.33, 1.15);
    const anvilTop = new THREE.Mesh(
      new THREE.BoxGeometry(1.25, 0.24, 0.48),
      new THREE.MeshStandardMaterial({ color: 0x62707d, metalness: 0.8, roughness: 0.3 })
    );
    anvilTop.position.set(0, 0.74, 1.15);
    // Wooden Forge Canopy Posts
    const pMat = new THREE.MeshStandardMaterial({ map: darkWoodTex, roughness: 0.9 });
    [[-1.8, -1.4], [1.8, -1.4], [-1.8, 1.6], [1.8, 1.6]].forEach(([px, pz]) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.12, 3.0, 6), pMat);
      post.position.set(px, 1.5, pz);
      forgeGroup.add(post);
    });
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.22, 3.6), pMat);
    canopy.position.set(0, 3.05, 0.1);
    forgeGroup.add(hearth, chimney, fireCore, anvilBase, anvilTop, canopy);

    forgeLight = new THREE.PointLight(0xff8a30, 3.4, 13, 1.4);
    forgeLight.position.set(0, 1.6, 0.8);
    forgeGroup.add(forgeLight);

    forgeGroup.position.set(0, 0, -5.6);
    activeNodeGroup.add(forgeGroup);

    nodeEntities.push({
      id: 'obj_forge',
      kind: 'forge',
      name: 'Bengkel Tempa Tidewrack',
      mesh: forgeGroup,
      pos: new THREE.Vector3(0, 0, -4.4),
      radius: 2.3,
      labelOffsetY: 3.5,
      labelEl: createWorldLabel('🔥 Bengkel Tempa (Tempa & Senjata)', 'node-obj')
    });

    // --- LANDMARK: PAPAN KABAR TIDEWRACK (WD-4.15 Issue Board) ---
    const boardGroup = new THREE.Group();
    const bPost = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.9, 0.18), new THREE.MeshStandardMaterial({ map: woodTex }));
    bPost.position.y = 1.05;
    const paper = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.85), new THREE.MeshBasicMaterial({ color: 0xe9dcb8 }));
    paper.position.set(0, 1.25, 0.11);
    boardGroup.add(bPost, paper);
    boardGroup.position.set(-4.6, 0, 1.2);
    boardGroup.rotation.y = 0.45;
    activeNodeGroup.add(boardGroup);

    nodeEntities.push({
      id: 'obj_board',
      kind: 'board',
      name: 'Papan Kabar Tidewrack',
      mesh: boardGroup,
      pos: new THREE.Vector3(-4.6, 0, 1.2),
      radius: 1.8,
      labelOffsetY: 2.3,
      labelEl: createWorldLabel('📜 Papan Kabar & Isu Desa', 'node-obj')
    });

    // --- 3 TOWN NPCS (HD-2D Standees with SWTOR 3-Tone Dialog!) ---
    const brannMesh = createStandee('brann', 1.65, 1.75);
    brannMesh.position.set(2.4, 0, -3.5);
    activeNodeGroup.add(brannMesh);
    nodeEntities.push({
      id: 'npc_brann',
      kind: 'npc',
      npcKey: 'brann',
      name: 'Master Brann',
      title: 'Dwarf • Mentor Pandai Besi',
      mesh: brannMesh,
      pos: brannMesh.position,
      radius: 1.9,
      labelOffsetY: 2.1,
      labelEl: createWorldLabel('Master Brann <span class="quest-badge">!</span>', 'npc')
    });

    const miraMesh = createStandee('mira', 1.55, 1.82);
    miraMesh.position.set(-3.4, 0, -2.8);
    activeNodeGroup.add(miraMesh);
    nodeEntities.push({
      id: 'npc_mira',
      kind: 'npc',
      npcKey: 'mira',
      name: 'Mira Saltvein',
      title: 'Human • Pedagang & Informan',
      mesh: miraMesh,
      pos: miraMesh.position,
      radius: 1.9,
      labelOffsetY: 2.15,
      labelEl: createWorldLabel('Mira Saltvein (Pasar S&D) <span class="quest-badge">!</span>', 'npc')
    });

    if (!state.companion.recruited) {
      const kaelMesh = createStandee('kael', 1.55, 1.8);
      kaelMesh.position.set(4.5, 0, 2.8);
      activeNodeGroup.add(kaelMesh);
      nodeEntities.push({
        id: 'npc_kael',
        kind: 'npc',
        npcKey: 'kael',
        name: 'Kael',
        title: 'Elf • Calon Murid & Companion',
        mesh: kaelMesh,
        pos: kaelMesh.position,
        radius: 1.9,
        labelOffsetY: 2.1,
        labelEl: createWorldLabel('Kael (Calon Murid) <span class="quest-badge">!</span>', 'companion')
      });
    }

    // --- PORTAL TIMUR -> TIDEWRACK BEACH (Lv.1 Hunting Node) ---
    buildPortalGate(11.4, 0.2, 'Gerbang Timur → Tidewrack Beach (Lv.1)', 'tidewrack_beach', 'Tidewrack Beach (Zona Berburu Lv.1–10)');

    // Warm floating forge embers
    addAmbientParticles(0xff9f45, 34, 14, 14, 0.55);

    // Spawn player at village center
    state.pos.set(0, 0, 2.2);
  }

  // --- NODE 2: TIDEWRACK BEACH (Zona Berburu Lv.1–10 — Saltgrave Coast) ---
  function buildTidewrackBeach() {
    scene.background = new THREE.Color(0x162b36);
    scene.fog = new THREE.FogExp2(0x162b36, 0.022);

    const hemi = new THREE.HemisphereLight(0x9bd3e8, 0x3b362a, 0.92);
    activeNodeGroup.add(hemi);
    const dir = new THREE.DirectionalLight(0xffe1b8, 1.1);
    dir.position.set(12, 18, 8);
    dir.castShadow = true;
    activeNodeGroup.add(dir);

    const sandTex = createSandTex();
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 22),
      new THREE.MeshStandardMaterial({ map: sandTex, roughness: 0.95 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    activeNodeGroup.add(ground);

    // Shimmering Ocean along the south/north shore
    waterMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(38, 14, 16, 8),
      new THREE.MeshStandardMaterial({ color: 0x19576b, roughness: 0.22, metalness: 0.35, transparent: true, opacity: 0.9 })
    );
    waterMesh.rotation.x = -Math.PI / 2;
    waterMesh.position.set(0, -0.22, -13.5);
    activeNodeGroup.add(waterMesh);

    // Coastal Rocks & Driftwood Props
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x4b5861, roughness: 0.92 });
    [[-7.5, -6.8, 1.6], [4.2, -7.4, 2.1], [9.5, -5.2, 1.8], [9.8, 6.2, 2.0], [-4.8, 7.6, 1.5]].forEach(([rx, rz, sc]) => {
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(sc, 0), rockMat);
      rock.position.set(rx, sc * 0.45, rz);
      rock.scale.set(1.2, 0.75, 1.0);
      rock.castShadow = true;
      activeNodeGroup.add(rock);
    });

    // --- 2 MINEABLE SALT CRYSTAL DEPOSITS (MAT-A08-01 — RF Online Mining feel!) ---
    [[-3.2, -6.4], [5.8, -4.6]].forEach(([mx, mz], idx) => {
      const cg = new THREE.Group();
      const cMat = new THREE.MeshStandardMaterial({
        color: 0x6ce0d4, emissive: 0x1c6870, emissiveIntensity: 0.65, roughness: 0.25, metalness: 0.2
      });
      for (let k = 0; k < 3; k++) {
        const shard = new THREE.Mesh(new THREE.OctahedronGeometry(0.45 - k * 0.08, 0), cMat);
        shard.position.set((k - 1) * 0.35, 0.45 + (k === 1 ? 0.22 : 0), (k % 2) * 0.2);
        shard.scale.set(0.7, 1.6, 0.7);
        cg.add(shard);
      }
      cg.position.set(mx, 0, mz);
      activeNodeGroup.add(cg);

      nodeEntities.push({
        id: 'mine_' + idx,
        kind: 'mine',
        name: 'Deposit Salt Crystal',
        matId: 'MAT-A08-01',
        mesh: cg,
        pos: new THREE.Vector3(mx, 0, mz),
        radius: 1.9,
        depleted: false,
        respawnTimer: 0,
        labelOffsetY: 1.55,
        labelEl: createWorldLabel('⛏️ Deposit Salt Crystal', 'node-obj')
      });
    });

    // --- 4 REAL LV.1 MONSTERS (from data/areas/saltgrave_coast.json) ---
    BEACH_MONSTER_TEMPLATES.forEach((tpl, idx) => {
      const stats = calcMonsterStats(tpl);
      const isElite = tpl.type === 'Reguler Khusus';
      const w = isElite ? 1.9 : 1.55;
      const h = isElite ? 2.1 : 1.7;
      const mesh = createStandee(tpl.sp, w, h);
      mesh.position.set(tpl.pos[0], 0, tpl.pos[2]);
      activeNodeGroup.add(mesh);

      const ent = {
        id: 'mob_' + idx,
        kind: 'enemy',
        tpl,
        name: tpl.name,
        isElite,
        hp: stats.maxHp,
        maxHp: stats.maxHp,
        dmg: stats.dmg,
        spd: stats.spd,
        dodge: stats.dodge,
        armor: stats.armor,
        alive: true,
        respawnTimer: 0,
        mesh,
        homePos: new THREE.Vector3(tpl.pos[0], 0, tpl.pos[2]),
        pos: mesh.position,
        radius: 1.5,
        attackTimer: 1.4,
        stunTimer: 0,
        flashTimer: 0,
        casting: false,
        castTimer: 0,
        castDuration: 2.8,
        castCooldown: 5.5,
        patrolPhase: idx * 1.7,
        labelOffsetY: h + 0.35,
        labelEl: createWorldLabel(
          `${isElite ? '★ ' : ''}${tpl.name} <small>Lv.${tpl.lvl}</small><div class="mini-hp-wrap"><div class="mini-hp-fill" style="width:100%"></div></div>`,
          isElite ? 'elite' : 'enemy'
        )
      };
      nodeEntities.push(ent);
    });

    // --- PORTAL BARAT -> KEMBALI KE TIDEWRACK VILLAGE ---
    buildPortalGate(-12.2, 0.2, 'Portal Barat → Tidewrack Village', 'tidewrack_village', 'Tidewrack Village (Kota Awal)');

    // Sea mist sparkles
    addAmbientParticles(0x9ee8eb, 28, 22, 16, 0.25);

    // Spawn player near western entrance
    state.pos.set(-9.2, 0, 0.4);
  }

  function switchNode(nodeId, titleText) {
    const overlay = document.getElementById('node-transition');
    const titleEl = document.getElementById('trans-title');
    const subEl = document.getElementById('trans-sub');

    titleEl.textContent = titleText || (nodeId === 'tidewrack_village' ? 'Tidewrack Village' : 'Tidewrack Beach');
    subEl.textContent = 'Membersihkan memori Node lama & memuat Node aktif...';
    overlay.classList.add('active');

    setTimeout(() => {
      const prevNode = state.activeNodeId;
      const freed = disposeActiveNode();
      state.activeNodeId = nodeId;

      if (nodeId === 'tidewrack_village') {
        buildTidewrackVillage();
        if (prevNode === 'tidewrack_beach') {
          state.pos.set(9.0, 0, 0.3);
        }
        document.getElementById('hud-node-name').textContent = 'Tidewrack Village';
        document.getElementById('hud-node-sub').textContent = 'Saltgrave Coast • Kota Awal (Tier 1)';
      } else {
        buildTidewrackBeach();
        document.getElementById('hud-node-name').textContent = 'Tidewrack Beach';
        document.getElementById('hud-node-sub').textContent = 'Saltgrave Coast • Zona Berburu Lv.1–10';
      }

      // Sync player & companion positions
      playerActor.position.copy(state.pos);
      companionActor.position.set(state.pos.x - 1.5, 0, state.pos.z + 0.9);
      companionActor.visible = state.companion.recruited;

      subEl.textContent = `Memori Node lama dibersihkan (${freed.freedGeos} geo, ${freed.freedMats} mat, ${freed.freedTexs} tex) • RAM aman!`;
      addLog(`Pindah Node → ${titleEl.textContent} (bebas ${freed.freedGeos} geo / ${freed.freedTexs} tex).`, 'sys');
      updateHUD();

      setTimeout(() => overlay.classList.remove('active'), 360);
    }, 240);
  }

  // --------------------------------------------------------------------------
  // 6. COMBAT, SKILLS (SWTOR MACRO BAR), LOOT & DUAL-XP ENGINE
  // --------------------------------------------------------------------------
  function spawnFloatingText(worldPos, text, color) {
    const el = document.createElement('div');
    el.className = 'float-text';
    el.textContent = text;
    el.style.color = color || '#eef1f4';
    worldOverlay.appendChild(el);
    activeFloaters.push({
      el,
      pos: worldPos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.5, 1.9, 0)),
      life: 1.05,
      maxLife: 1.05
    });
  }

  function spawnAttackFX(fromPos, toPos, vfxId, isRanged) {
    const id = typeof vfxId === 'string' ? vfxId : (isRanged ? 'ranged_throw' : 'slash_neutral');
    vfx.playVFX(id, toPos, {
      fromPos: (isRanged || id === 'bolt_lightning' || id === 'ranged_throw') ? fromPos : null,
      facing: state.facing
    });
  }

  function grantXP(kind, amount) {
    const p = state.player;
    if (kind === 'battle') {
      const bonus = p.crossBuffSmith > 0 ? Math.round(amount * 0.15) : 0;
      const total = amount + bonus;
      p.xpBattle += total;
      if (p.xpBattle > p.xpQuota) {
        p.crossBuffBattle = Math.min(30, p.crossBuffBattle + (p.xpBattle - p.xpQuota));
      }
      spawnFloatingText(state.pos, `+${total} XP Battle`, '#f0a868');
    } else {
      const bonus = p.crossBuffBattle > 0 ? Math.round(amount * 0.15) : 0;
      const total = amount + bonus;
      p.xpSmith += total;
      if (p.xpSmith > p.xpQuota) {
        p.crossBuffSmith = Math.min(30, p.crossBuffSmith + (p.xpSmith - p.xpQuota));
      }
      spawnFloatingText(state.pos, `+${total} XP Smith`, '#7cc9f5');
    }

    // Dual-XP Level Up Rule (CD-1.04: naik level jika KEDUA bar penuh!)
    if (p.xpBattle >= p.xpQuota && p.xpSmith >= p.xpQuota) {
      const carryB = Math.min(Math.floor(p.xpQuota * 0.5), p.xpBattle - p.xpQuota);
      const carryS = Math.min(Math.floor(p.xpQuota * 0.5), p.xpSmith - p.xpQuota);
      p.level += 1;
      p.freePoints += 2; // CD-1.01: +2 poin stat per level
      p.stats.STR += 1;
      p.stats.CON += 1;
      refreshBuildV33();
      p.xpBattle = carryB;
      p.xpSmith = carryS;
      p.hp = p.maxHp;
      p.stamina = p.maxStamina;
      vfx.playVFX('levelup_pillar', state.pos);
      addLog(`★ NAIK KE LEVEL ${p.level}! (+2 Poin Stat: STR & CON +1, HP pulih penuh)`, 'moral');
      spawnFloatingText(state.pos, `LEVEL UP! Lv.${p.level}`, '#ffe066');
    }
    updateHUD();
  }

  function addSmithResource(resId, amount) {
    const p = state.player;
    if (!resId || !amount || p.resources[resId] === undefined) return;
    const pas = state.v33Build?.passiveTotals || {};
    const cap = resId === 'elemental_charge' ? 3 : (resId === 'forge_heat' ? 5 + (pas.resource_max_bonus || 0) : 5);
    const before = p.resources[resId];
    p.resources[resId] = Math.min(cap, before + amount);

    // Synthesist Destiny: 50% echo +1 resource ke pohon lain
    const destSig = state.v33Build?.activeDestinyCard?.signatureActive
      ? (state.v33Build.activeDestinyCard.signature?.effect || {})
      : {};
    if (p.resources[resId] > before && destSig.cross_resource_share_chance_pct && Math.random() < 0.5) {
      const unlockedRes = SMITH_CLASSES
        .filter(c => (p.smithTiers[c] || 0) > 0)
        .map(c => skillData.smith_skill_trees[c]?.resource?.id)
        .filter(r => r && r !== resId);
      if (unlockedRes.length) {
        const other = unlockedRes[Math.floor(Math.random() * unlockedRes.length)];
        const oCap = other === 'elemental_charge' ? 3 : 5;
        p.resources[other] = Math.min(oCap, (p.resources[other] || 0) + 1);
      }
    }
  }

  function awardSkillMasteryXP(skillId, skillName) {
    const p = state.player;
    const xpPerUse = p.fastTraining ? 12 : 1;
    const res = skillEngine.trainSkillMastery(p.skillMastery, skillId, 1, xpPerUse);
    p.skillMastery = res.masteryState;
    if (res.leveledUp) {
      refreshBuildV33();
      const milestoneMap = {
        core_passive: 'Core Passive Terbuka!',
        morph_choice: 'Pilihan Morph 1-dari-3 Terbuka!',
        gm_morph_peak: 'GRAND MASTER! (+40% Efektivitas, -10% CD, Puncak Morph!)'
      };
      const msTxt = res.unlockedMilestones.map(m => milestoneMap[m]).filter(Boolean).join(' • ');
      vfx.playVFX(res.nextStage.isGM ? 'levelup_pillar' : 'aura_light', state.pos, { silentJuice: !res.nextStage.isGM });
      spawnFloatingText(state.pos, `${skillName} → ${res.nextStage.label}!`, res.nextStage.isGM ? '#ffe066' : '#6ce0d4');
      addLog(`✦ RF Mastery: ${skillName} naik ke ${res.nextStage.label}${msTxt ? ' — ' + msTxt : ''}`, 'moral');
    }
  }

  function getActiveDestinySignature() {
    const card = state.v33Build?.activeDestinyCard;
    return (card && card.signatureActive && card.signature?.effect) ? card.signature.effect : {};
  }

  function pickVfxForSkill(sk, wpn, resolvedEl) {
    if (sk.interrupts_cast) return 'interrupt_shock';
    if (sk.tier === 5) return sk.smithClass === 'Runesmith' ? 'bolt_lightning' : 'slash_fire';
    if (resolvedEl === 'Lightning') return 'bolt_lightning';
    if (resolvedEl === 'Fire') return 'slash_fire';
    if (resolvedEl === 'Ice') return 'impact_ice';
    if (sk.smithClass === 'Rangesmith' || wpn.mode === 'Jauh') return 'ranged_throw';
    return 'slash_neutral';
  }

  function triggerSkill(slotIndex) {
    const build = state.v33Build || refreshBuildV33(true);
    const sk = build.equippedSkills[slotIndex];
    if (!sk) return;

    // Anti-Spam Global Cooldown (GCD = 1.3 detik) + Cooldown individual
    if (state.gcdRemaining > 0) {
      return;
    }
    if ((state.skillCooldowns[sk.id] || 0) > 0) {
      return;
    }

    const p = state.player;
    const wpn = getWeapon();
    const pas = build.passiveTotals;
    const destSig = getActiveDestinySignature();

    // Class Buff (RF) bisa diaktifkan langsung tanpa musuh di depan!
    if (sk.role === 'Class Buff (RF)' && sk.self_buff) {
      state.gcdRemaining = state.gcdDuration;
      state.skillCooldowns[sk.id] = sk.effectiveCooldownSec;
      state.activeClassBuff = { ...sk.self_buff };
      state.activeClassBuffName = sk.name;
      state.activeClassBuffTimer = sk.self_buff.duration_sec || 16;
      vfx.playVFX('aura_light', state.pos);
      spawnFloatingText(state.pos, `⚡ ${sk.name} (${sk.mastery.label})`, '#6ce0d4');
      addLog(`⚡ Class Buff RF: ${sk.name} aktif selama ${state.activeClassBuffTimer}d! (${sk.desc})`, 'sys');
      awardSkillMasteryXP(sk.id, sk.name);
      updateHUD();
      return;
    }

    // Pick nearest alive enemy if none targeted
    let target = state.targetEntity;
    if (!target || target.kind !== 'enemy' || !target.alive) {
      target = findNearestEnemy();
      if (target) selectEntity(target);
    }
    if (!target || target.kind !== 'enemy' || !target.alive) {
      addLog('Tidak ada musuh di Node ini. Pergi ke Tidewrack Beach lewat Portal Timur!', 'sys');
      return;
    }

    const skillRange = (sk.smithClass === 'Rangesmith' || sk.smithClass === 'Runesmith')
      ? Math.max(wpn.range, 6.0)
      : wpn.range;
    const dist = state.pos.distanceTo(target.pos);
    if (dist > skillRange + 0.6) {
      const dir = new THREE.Vector3().subVectors(target.pos, state.pos).normalize();
      state.moveTarget = target.pos.clone().sub(dir.multiplyScalar(Math.max(1.6, skillRange - 0.5)));
      addLog(`Mendekati ${target.name} (Jarak ${skillRange.toFixed(1)}m)...`, 'sys');
      return;
    }

    // Face target & commit GCD + individual CD
    if (Math.abs(target.pos.x - state.pos.x) > 0.1) {
      state.facing = target.pos.x >= state.pos.x ? 1 : -1;
    }
    state.gcdRemaining = state.gcdDuration;
    state.skillCooldowns[sk.id] = sk.effectiveCooldownSec;
    state.lungeTimer = 0.18;
    state.swingTimer = 0.24;

    // Reforger Clockwork Flow: rotasi 2 tombol berbeda -> +1 Overclock
    if (pas.overclock_on_rotation && state.lastCastSkillId && state.lastCastSkillId !== sk.id) {
      addSmithResource('overclock', 1);
    }
    state.lastCastSkillId = sk.id;

    // Omnismith Signature: rangkai 3 tombol Smith Class berbeda -> Omni-Surge!
    let omniSurgeMult = 1.0;
    let labelPrefix = '';
    if (destSig.omni_surge_on_3_classes) {
      state.recentClasses.push(sk.smithClass);
      if (state.recentClasses.length > 3) state.recentClasses.shift();
      if (state.recentClasses.length === 3 && new Set(state.recentClasses).size === 3) {
        omniSurgeMult = 1.25;
        labelPrefix += 'OMNI-SURGE! ';
        for (const kId of Object.keys(state.skillCooldowns)) {
          if (kId !== sk.id && state.skillCooldowns[kId] > 0) {
            state.skillCooldowns[kId] = Math.max(0, state.skillCooldowns[kId] - 2.0);
          }
        }
        state.weaponSkillCd = Math.max(0, state.weaponSkillCd - 2.0);
        state.recentClasses.length = 0;
        vfx.playVFX('levelup_pillar', state.pos, { silentJuice: true });
        addLog('✦ OMNISMITH OMNI-SURGE! (+25% Dmg & -2d semua Cooldown!)', 'moral');
      }
    }

    const modEff = sk.combinedModEffect || {};
    const masteryMult = 1 + (sk.mastery.effectivenessBonusPct || 0) / 100;
    const buffDmgPct = (state.activeClassBuff?.dmg_pct || 0) + (p.resources.overclock * 3);
    const baseStrike = wpn.dmg + Math.floor(p.stats.STR / 2) + (sk.scales_with_con_ac ? Math.floor(p.stats.CON * 0.6) : 0);
    let skillMult = sk.base_multiplier * masteryMult * (1 + ((modEff.skill_dmg_pct || 0) + (pas.dmg_pct || 0) + buffDmgPct) / 100);
    let color = '#ffe8c2';
    let extraVfxId = null;

    // Resource Generation
    if (sk.grants_resource) {
      addSmithResource(sk.grants_resource.id, sk.grants_resource.amount);
      if (destSig.barrier_on_opener_pct) {
        p.barrier = Math.max(p.barrier, Math.round(p.maxHp * (destSig.barrier_on_opener_pct / 100)));
      }
    }

    // Interrupt / Stagger
    if (sk.interrupts_cast) {
      if (target.casting) {
        target.casting = false;
        target.castTimer = 0;
        vfx.syncTelegraph(target.id, target.pos, 0, false);
        target.stunTimer = 2.2;
        skillMult *= 1.45;
        labelPrefix = 'INTERRUPTED! ' + labelPrefix;
        color = '#6ce0d4';
        if (sk.smithClass === 'Weaponsmith') { addSmithResource('forge_heat', 3); state.weaponSkillCd = Math.max(0, state.weaponSkillCd - 2); }
        if (sk.smithClass === 'Armorer') { addSmithResource('bastion_guard', 5); p.hp = Math.min(p.maxHp, p.hp + Math.round(p.maxHp * 0.08)); }
        if (sk.smithClass === 'Reforger') {
          for (const kId of Object.keys(state.skillCooldowns)) {
            if (kId !== sk.id && state.skillCooldowns[kId] > 0) state.skillCooldowns[kId] = Math.max(0, state.skillCooldowns[kId] - 2);
          }
        }
        addLog(`✦ ${sk.name} membatalkan ${target.tpl.castSkill} milik ${target.name}! (+Stun 2.2d)`, 'combat');
      } else {
        target.stunTimer = Math.max(target.stunTimer || 0, 0.9);
      }
      if (sk.self_buff?.barrier_hp_pct) {
        p.barrier += Math.round(p.maxHp * (sk.self_buff.barrier_hp_pct / 100));
      }
    }

    // Resource Consumption (Core Combo / Hybrid Fusion / Chrono Rewind)
    if (sk.consumes_resource) {
      const rId = sk.consumes_resource.id;
      const floor = (rId === 'forge_heat' && destSig.min_forge_heat) ? 1 : 0;
      const spent = Math.max(0, (p.resources[rId] || 0) - floor);
      p.resources[rId] = floor;
      if (spent > 0) {
        skillMult += spent * (sk.consumes_resource.per_stack_mult || 0.22);
        labelPrefix = `BURST x${spent}! ` + labelPrefix;
        color = '#ffae42';
        if (sk.heal_per_stack_pct) {
          const healAmt = Math.round(p.maxHp * ((spent * sk.heal_per_stack_pct) / 100));
          p.hp = Math.min(p.maxHp, p.hp + healAmt);
          spawnFloatingText(state.pos, `+${healAmt} HP`, '#8fe3b8');
        }
        if (sk.triggers_hybrid_fusion && spent >= 2) {
          skillMult *= destSig.double_hybrid_fusion ? 1.55 : 1.3;
          labelPrefix = 'FUSI HIBRIDA! ' + labelPrefix;
          color = '#7cf5ff';
          extraVfxId = 'crit_spark';
          addLog(`✦ ${sk.name} memicu Reaksi Fusi Hibrida (${spent} Elemental Charge)!`, 'combat');
        }
        if (sk.consumes_resource.cdr_other_skills_per_stack_sec) {
          const shave = spent * sk.consumes_resource.cdr_other_skills_per_stack_sec;
          let count = 0;
          for (const kId of Object.keys(state.skillCooldowns)) {
            if (kId !== sk.id && state.skillCooldowns[kId] > 0 && count < 2) {
              state.skillCooldowns[kId] = Math.max(0, state.skillCooldowns[kId] - shave);
              count++;
            }
          }
          addLog(`⏱ Chrono Rewind memangkas ${shave.toFixed(1)}d CD skill lain!`, 'sys');
        }
      }
    }

    // Execute (< 35% HP)
    if (sk.execute_threshold_hp_pct && (target.hp / target.maxHp) * 100 < sk.execute_threshold_hp_pct) {
      skillMult *= 1.35;
      labelPrefix = 'EXECUTE! ' + labelPrefix;
    }

    // Destiny Signatures: Spellblade Rune Mark, Hexblade Arcane Edge, Vanguard Barrier
    const isElemSkill = sk.smithClass === 'Runesmith' || (sk.finalElement && sk.finalElement !== 'Neutral');
    if (destSig.spellblade_mark_bonus_pct && isElemSkill && state.runeMarkActive) {
      state.runeMarkActive = false;
      skillMult *= 1.3;
      labelPrefix = 'RUNE MARK! ' + labelPrefix;
      color = '#c7a4ff';
      extraVfxId = 'crit_spark';
    }
    if (destSig.spellblade_mark_bonus_pct && sk.smithClass === 'Weaponsmith') {
      state.runeMarkActive = true;
    }
    if (destSig.arcane_edge_auto_weakness && isElemSkill) {
      state.arcaneEdgeTimer = 4.0;
    }
    if (destSig.barrier_on_opener_pct && p.barrier > 0 && sk.smithClass === 'Weaponsmith') {
      skillMult *= 1.18;
    }
    if (modEff.heal_on_cast_pct > 0) {
      const healAmt = Math.max(1, Math.round(p.maxHp * (modEff.heal_on_cast_pct / 100)));
      p.hp = Math.min(p.maxHp, p.hp + healAmt);
    }
    if (modEff.reset_weapon_skill_cd) {
      state.weaponSkillCd = 0;
    }

    // Resolve Element & Weakness Exploit
    let el = sk.finalElement === 'WeaponAttunement' ? wpn.el : sk.finalElement;
    const autoWeak = sk.auto_match_weakness || modEff.auto_match_weakness || el === 'Adaptive' || state.arcaneEdgeTimer > 0 || (destSig.marked_auto_weakness && p.resources.hunters_mark > 0);
    if (autoWeak && target.tpl.weak !== 'Neutral') el = target.tpl.weak;

    let rawDmg = baseStrike * skillMult * omniSurgeMult;
    if (el !== 'Neutral' && el === target.tpl.weak) {
      rawDmg *= 1.25 + ((pas.weakness_bonus_pct || 0) + (state.activeClassBuff?.weakness_bonus_pct || 0)) / 100;
      labelPrefix = 'WEAKNESS! ' + labelPrefix;
      color = '#7cf5ff';
      extraVfxId = 'crit_spark';
      if (destSig.weakness_cdr_all_sec && state.chronosmithIcd <= 0) {
        state.chronosmithIcd = 4.0;
        for (const kId of Object.keys(state.skillCooldowns)) {
          if (state.skillCooldowns[kId] > 0) state.skillCooldowns[kId] = Math.max(0, state.skillCooldowns[kId] - 1.5);
        }
        addLog('⏱ Chronosmith Temporal Exploit: -1.5d semua CD Macro Bar!', 'sys');
      }
      if (destSig.charge_on_weakness) addSmithResource('elemental_charge', 1);
    }

    // Critical Check
    const critChance = p.stats.WIS + wpn.crit + (pas.crit_chance_pct || 0) + (state.activeClassBuff?.crit_chance_pct || 0);
    if (Math.random() * 100 < critChance) {
      rawDmg *= 1.85 + ((pas.crit_dmg_pct || 0) + p.resources.hunters_mark * 4) / 100;
      labelPrefix = 'CRIT! ' + labelPrefix;
      color = '#ffe066';
      extraVfxId = 'crit_spark';
    }

    const armorPen = sk.armor_pen_override_pct
      ? target.armor
      : Math.min(target.armor, (pas.armor_pen_pct || 0) + (modEff.armor_pen_pct || 0) + p.resources.forge_heat * 3);
    const finalDmg = Math.max(2, Math.round(rawDmg * (1 - Math.max(0, target.armor - armorPen) / 100)));
    const mainVfxId = pickVfxForSkill(sk, wpn, el);

    applyDamageToEnemy(target, finalDmg, labelPrefix, color, mainVfxId, skillRange > 3.5, extraVfxId);
    awardSkillMasteryXP(sk.id, sk.name);
    updateHUD();
  }

  function triggerWeaponSkill() {
    const build = state.v33Build || refreshBuildV33(true);
    const ws = build.weaponSkill;
    if (!ws) return;
    if (!ws.unlocked) {
      addLog(`🔒 Weapon Skill [W] "${ws.name}" terkunci! Butuh minimal Tier 1 ${ws.governing_smith} (atau Kartu Destiny Omnismith).`, 'sys');
      return;
    }
    if (state.gcdRemaining > 0 || state.weaponSkillCd > 0) return;

    let target = state.targetEntity;
    if (!target || target.kind !== 'enemy' || !target.alive) {
      target = findNearestEnemy();
      if (target) selectEntity(target);
    }
    if (!target || target.kind !== 'enemy' || !target.alive) {
      addLog('Tidak ada musuh di Node ini untuk memakai Weapon Skill [W]!', 'sys');
      return;
    }

    const wpn = getWeapon();
    const dist = state.pos.distanceTo(target.pos);
    if (dist > wpn.range + 0.6) {
      const dir = new THREE.Vector3().subVectors(target.pos, state.pos).normalize();
      state.moveTarget = target.pos.clone().sub(dir.multiplyScalar(Math.max(1.6, wpn.range - 0.5)));
      addLog(`Mendekati ${target.name} untuk [W] ${ws.name}...`, 'sys');
      return;
    }

    if (Math.abs(target.pos.x - state.pos.x) > 0.1) {
      state.facing = target.pos.x >= state.pos.x ? 1 : -1;
    }
    state.gcdRemaining = state.gcdDuration;
    state.weaponSkillCd = ws.effectiveCooldownSec;
    state.lungeTimer = 0.22;
    state.swingTimer = 0.26;

    const p = state.player;
    const pas = build.passiveTotals;
    const baseStrike = (wpn.dmg + Math.floor(p.stats.STR / 2)) * 1.15;
    let rawDmg = baseStrike * ws.effectiveMultiplier * (1 + ((pas.dmg_pct || 0) + (pas.trigger_power_pct || 0) * 0.5) / 100);
    let labelPrefix = `[W] ${ws.name}! `;
    let color = '#6ce0d4';
    let extraVfxId = 'crit_spark';

    // Jika pemain belum membuka T3 Interrupt, [W] Weapon Skill bisa melakukan Stagger-Interrupt darurat di Lv.1!
    const hasClassInterrupt = build.equippedSkills.some(s => s.interrupts_cast);
    if (!hasClassInterrupt && target.casting) {
      target.casting = false;
      target.castTimer = 0;
      vfx.syncTelegraph(target.id, target.pos, 0, false);
      target.stunTimer = 1.8;
      rawDmg *= 1.35;
      labelPrefix = 'INTERRUPTED! ' + labelPrefix;
      addLog(`✦ [W] ${ws.name} menggagalkan ${target.tpl.castSkill} milik ${target.name}!`, 'combat');
    }

    const el = state.arcaneEdgeTimer > 0 && target.tpl.weak !== 'Neutral' ? target.tpl.weak : wpn.el;
    if (el !== 'Neutral' && el === target.tpl.weak) {
      rawDmg *= 1.25;
      labelPrefix = 'WEAKNESS! ' + labelPrefix;
    }

    const finalDmg = Math.max(3, Math.round(rawDmg * (1 - target.armor / 100)));
    const mainVfxId = el === 'Lightning' ? 'bolt_lightning' : (wpn.mode === 'Jauh' ? 'ranged_throw' : 'slash_fire');
    applyDamageToEnemy(target, finalDmg, labelPrefix, color, mainVfxId, wpn.mode === 'Jauh', extraVfxId);
    awardSkillMasteryXP(ws.id, `[W] ${ws.name}`);
    updateHUD();
  }

  function performAutoAttack(target) {
    if (!target || target.kind !== 'enemy' || !target.alive) return;
    const wpn = getWeapon();
    if (state.pos.distanceTo(target.pos) > wpn.range + 0.6) return;

    if (Math.abs(target.pos.x - state.pos.x) > 0.1) {
      state.facing = target.pos.x >= state.pos.x ? 1 : -1;
    }
    state.swingTimer = 0.2;

    const p = state.player;
    const build = state.v33Build || refreshBuildV33(true);
    const pas = build.passiveTotals;
    const destSig = getActiveDestinySignature();

    if (destSig.spellblade_mark_bonus_pct && wpn.mode === 'Dekat') state.runeMarkActive = true;
    if ((p.smithTiers.Weaponsmith || 0) >= 1 && Math.random() < 0.25) addSmithResource('forge_heat', 1);

    let rawDmg = (wpn.dmg + Math.floor(p.stats.STR / 2)) * (0.72 + (pas.dmg_pct || 0) / 140);
    const el = state.arcaneEdgeTimer > 0 && target.tpl.weak !== 'Neutral' ? target.tpl.weak : wpn.el;
    if (el !== 'Neutral' && el === target.tpl.weak) rawDmg *= 1.25;

    const finalDmg = Math.max(1, Math.round(rawDmg * (1 - target.armor / 100)));
    const mainVfxId = el === 'Lightning' ? 'bolt_lightning' : (wpn.mode === 'Jauh' ? 'ranged_throw' : 'slash_neutral');
    applyDamageToEnemy(target, finalDmg, '', '#dce4ec', mainVfxId, wpn.mode === 'Jauh', null);
  }

  function applyDamageToEnemy(target, dmg, prefix, color, vfxId, isRanged, extraVfxId) {
    target.hp = Math.max(0, target.hp - dmg);
    target.flashTimer = 0.14;
    target.recoilTimer = 0.18;
    // Slight physical knockback away from attacker ("Juice"!)
    const push = new THREE.Vector3().subVectors(target.pos, state.pos);
    push.y = 0;
    if (push.lengthSq() > 0.01) {
      push.normalize();
      target.pos.addScaledVector(push, 0.24);
      target.pos.x = Math.max(-12.2, Math.min(12.2, target.pos.x));
      target.pos.z = Math.max(-8.4, Math.min(8.4, target.pos.z));
    }

    spawnAttackFX(state.pos, target.pos, vfxId, isRanged);
    if (extraVfxId) vfx.playVFX(extraVfxId, target.pos);
    spawnFloatingText(target.pos, `${prefix}-${dmg}`, color);
    updateEnemyLabel(target);

    if (target.hp <= 0) {
      target.alive = false;
      target.casting = false;
      vfx.syncTelegraph(target.id, target.pos, 0, false);
      target.respawnTimer = 9.0;
      target.mesh.visible = false;
      target.labelEl.style.display = 'none';
      // Death Dissolve Particle Burst!
      vfx.spawnParticleBurst(target.pos, target.isElite ? '#6ce0d4' : '#f0b878', target.isElite ? 34 : 20, 4.4, 3.6);
      if (state.targetEntity === target) {
        state.targetEntity = null;
        targetRingMesh.visible = false;
      }

      // Loot & Rewards
      const tpl = target.tpl;
      state.player.bronze += tpl.bronze;
      const dropMatId = tpl.drops[Math.floor(Math.random() * tpl.drops.length)];
      state.player.inventory[dropMatId] = (state.player.inventory[dropMatId] || 0) + 1;
      const matName = MATERIAL_CATALOG[dropMatId] ? MATERIAL_CATALOG[dropMatId].name : dropMatId;

      if (state.quests.huntedCount < state.quests.huntedGoal) {
        state.quests.huntedCount += 1;
      }

      addLog(`✓ ${target.name} tumbang! +${tpl.bronze} br, +1 ${matName}`, 'loot');
      spawnFloatingText(target.pos, `+1 ${matName}`, '#8fe3b8');
      grantXP('battle', tpl.xp);
    }
  }

  function updateEnemyLabel(ent) {
    const fill = ent.labelEl.querySelector('.mini-hp-fill');
    if (fill) fill.style.width = Math.max(0, Math.round((ent.hp / ent.maxHp) * 100)) + '%';
  }

  function findNearestEnemy() {
    let best = null, bestD = 999;
    nodeEntities.forEach(e => {
      if (e.kind === 'enemy' && e.alive) {
        const d = state.pos.distanceTo(e.pos);
        if (d < bestD) { bestD = d; best = e; }
      }
    });
    return best;
  }

  // --------------------------------------------------------------------------
  // 7. INTERACTIONS: FORGE, SWTOR 3-TONE DIALOG, MINING, PORTAL PICKER
  // --------------------------------------------------------------------------
  function interactWith(ent) {
    if (!ent) return;
    if (ent.kind === 'forge') {
      openForgeModal();
    } else if (ent.kind === 'npc') {
      openDialogModal(ent.npcKey);
    } else if (ent.kind === 'board') {
      openBoardModal();
    } else if (ent.kind === 'portal') {
      openPortalModal(ent);
    } else if (ent.kind === 'mine') {
      if (ent.depleted) return;
      ent.depleted = true;
      ent.respawnTimer = 12.0;
      ent.mesh.scale.set(0.35, 0.35, 0.35);
      ent.labelEl.textContent = '⛏️ Memulihkan deposit...';
      state.swingTimer = 0.24;
      vfx.playVFX('impact_ice', ent.pos);
      state.player.inventory[ent.matId] = (state.player.inventory[ent.matId] || 0) + 2;
      addLog('⛏️ Menambang +2 Salt Crystal dari pesisir Tidewrack.', 'loot');
      spawnFloatingText(ent.pos, '+2 Salt Crystal', '#6ce0d4');
      grantXP('smith', 12);
    } else if (ent.kind === 'enemy' && ent.alive) {
      selectEntity(ent);
      triggerSkill(0);
    }
  }

  function openModal(html, wide) {
    state.modalOpen = true;
    const box = document.getElementById('modal-content');
    box.classList.toggle('wide', Boolean(wide));
    box.innerHTML = html;
    document.getElementById('modal-backdrop').classList.add('open');
  }

  function closeModal() {
    state.modalOpen = false;
    document.getElementById('modal-backdrop').classList.remove('open');
  }

  // --- MODAL: BENGKEL TEMPA LV.1 ---
  function openForgeModal() {
    const p = state.player;
    const invSummary = Object.keys(MATERIAL_CATALOG).map(id => {
      const m = MATERIAL_CATALOG[id];
      return `<span class="tag">${m.name}: <b>${p.inventory[id] || 0}</b></span>`;
    }).join(' ');

    const cards = WEAPON_CATALOG.map(w => {
      const owned = p.ownedWeapons.includes(w.id);
      const equipped = p.equippedWeaponId === w.id;
      const costStr = Object.entries(w.cost).map(([mid, qty]) => {
        const have = p.inventory[mid] || 0;
        const ok = have >= qty;
        return `<span style="color:${ok ? '#8fe3b8' : '#e26868'}">${MATERIAL_CATALOG[mid].name} ${have}/${qty}</span>`;
      }).join(' • ') || 'Gratis (Bawaan)';

      const canCraft = Object.entries(w.cost).every(([mid, qty]) => (p.inventory[mid] || 0) >= qty);

      let btnHtml = '';
      if (equipped) {
        btnHtml = `<button class="btn-secondary" disabled>✓ Sedang Dipakai</button>`;
      } else if (owned) {
        btnHtml = `<button class="btn-primary" data-equip="${w.id}">Pakai Senjata</button>`;
      } else {
        btnHtml = `<button class="btn-primary" data-craft="${w.id}" ${canCraft ? '' : 'disabled'}>🔥 Tempa (+25 XP Smith)</button>`;
      }

      return `
        <div class="item-card ${equipped ? 'equipped' : ''}">
          <div>
            <div class="item-title">${w.name}</div>
            <div class="item-desc" style="margin:3px 0">${w.stat} • <b>${w.mode} (${w.range}m)</b> • Dmg ${w.dmg} • ${w.el}</div>
            <div class="item-desc">${w.desc}</div>
            <div class="item-desc" style="margin-top:4px">Bahan: ${costStr}</div>
          </div>
          ${btnHtml}
        </div>
      `;
    }).join('');

    openModal(`
      <div class="modal-head">
        <div>
          <h2 class="modal-title">🔥 Bengkel Tempa Tidewrack (Lv.1)</h2>
          <div class="modal-sub">Tempa senjata Dekat/Jauh/Rune — jurus [W] Weapon Skill otomatis ikut berganti!</div>
        </div>
        <button class="close-btn" id="btn-close-modal">Tutup</button>
      </div>
      <div style="margin-bottom:10px;display:flex;flex-wrap:wrap;gap:5px;align-items:center;justify-content:space-between">
        <div>${invSummary}</div>
        <button class="btn-secondary" id="btn-quench-practice">🔨 Latihan Tempa Cepat (+15 XP Smith • 10 br)</button>
      </div>
      <div class="item-grid">${cards}</div>
    `);

    document.getElementById('btn-close-modal').onclick = closeModal;
    document.getElementById('btn-quench-practice').onclick = () => {
      if (state.player.bronze < 10) {
        addLog('Bronze kurang untuk membeli arang latihan (butuh 10 br).', 'sys');
        return;
      }
      state.player.bronze -= 10;
      state.quests.forgedOnce = true;
      addLog('🔨 Latihan menempa bilah dasar di perapian Tidewrack (+15 XP Smith).', 'loot');
      grantXP('smith', 15);
      openForgeModal();
    };

    document.querySelectorAll('[data-craft]').forEach(btn => {
      btn.onclick = () => {
        const w = WEAPON_CATALOG.find(x => x.id === btn.dataset.craft);
        if (!w) return;
        for (const [mid, qty] of Object.entries(w.cost)) {
          state.player.inventory[mid] = (state.player.inventory[mid] || 0) - qty;
        }
        state.player.ownedWeapons.push(w.id);
        state.player.equippedWeaponId = w.id;
        state.quests.forgedOnce = true;
        refreshHeroSprite();
        refreshBuildV33();
        addLog(`🔥 Berhasil menempa & memakai ${w.name} ([W] ${w.trigger})!`, 'loot');
        grantXP('smith', 25);
        openForgeModal();
      };
    });

    document.querySelectorAll('[data-equip]').forEach(btn => {
      btn.onclick = () => {
        state.player.equippedWeaponId = btn.dataset.equip;
        refreshHeroSprite();
        refreshBuildV33();
        const w = getWeapon();
        addLog(`⚔️ Memakai ${w.name} (Jarak ${w.mode}: ${w.range}m, [W] ${w.trigger}).`, 'sys');
        updateHUD();
        openForgeModal();
      };
    });
  }

  // --- MODAL: SWTOR 3-TONE DIALOG WHEEL (WD-3.05 & WD-4.05) ---
  function openDialogModal(npcKey) {
    if (npcKey === 'brann') {
      const loy = state.npcs.brann.loyalty;
      openModal(`
        <div class="modal-head">
          <div>
            <h2 class="modal-title">Master Brann — Mentor Pandai Besi</h2>
            <div class="modal-sub">Dwarf • Sifat: Teliti, Sabar (Mulia) • Kedekatan/Loyalitas: <b>${loy}/100</b></div>
          </div>
          <button class="close-btn" id="btn-close-modal">Tutup</button>
        </div>
        <div class="dialog-speech">
          "Angin laut Tidewrack membuat besi cepat berkarat, nak. Warga desa ini lebih suka berburu di darat daripada melaut karena monster pesisir makin berani. Sebelum ke <b>Tidewrack Beach</b> lewat Gerbang Timur, pastikan palumu panas dan ingat dua bar XP-mu: <i>Battle</i> dan <i>Smith</i> harus sama-sama penuh untuk naik ke Level 2."
        </div>
        <div class="dialog-choices">
          <button class="choice-btn" id="ch-brann-1">
            <span>"Terima kasih, Master. Aku akan menempa senjata untuk melindungi warga desa."</span>
            <span class="tone-badge tone-ramah">Ramah • Mulia +1</span>
          </button>
          <button class="choice-btn" id="ch-brann-2">
            <span>"Selama bayarannya setimpal, aku tidak peduli siapa yang butuh pedang."</span>
            <span class="tone-badge tone-tegas">Tegas • Kejam +1</span>
          </button>
          <button class="choice-btn" id="ch-brann-3">
            <span>"Tenang saja, kepiting pantai itu bakal kutempa jadi sup baja!"</span>
            <span class="tone-badge tone-jenaka">Jenaka • Netral</span>
          </button>
        </div>
      `);
      document.getElementById('btn-close-modal').onclick = closeModal;
      const finishBrann = (tone, moral, loyDelta, reply) => {
        state.quests.talkedBrann = true;
        if (moral === 'mulia') { state.player.mulia += 1; vfx.playVFX('aura_light', state.pos); }
        if (moral === 'kejam') { state.player.kejam += 1; vfx.playVFX('aura_dark', state.pos); }
        state.npcs.brann.loyalty = Math.max(0, Math.min(100, state.npcs.brann.loyalty + loyDelta));
        if (!state.npcs.brann.talked) {
          state.npcs.brann.talked = true;
          state.player.inventory['MAT-A08-05'] = (state.player.inventory['MAT-A08-05'] || 0) + 1;
          addLog(`Master Brann (${tone}): "${reply}" (+1 Anchor Iron, Loyalitas ${loyDelta >= 0 ? '+' : ''}${loyDelta})`, 'moral');
          grantXP('smith', 15);
        } else {
          addLog(`Master Brann (${tone}): "${reply}"`, 'moral');
        }
        updateHUD();
        closeModal();
      };
      document.getElementById('ch-brann-1').onclick = () => finishBrann('Ramah', 'mulia', +2, 'Hati pandai besi sejati! Ambil Anchor Iron ini untuk tempaan pertamamu.');
      document.getElementById('ch-brann-2').onclick = () => finishBrann('Tegas', 'kejam', -1, 'Hmph... sikap keras seperti pedagang Port Saltgrave. Tetap ambil besi ini.');
      document.getElementById('ch-brann-3').onclick = () => finishBrann('Jenaka', 'netral', +1, 'Haha! Buktikan ucapanmu di Tidewrack Beach, ambil Anchor Iron ini.');
    } else if (npcKey === 'mira') {
      const loy = state.npcs.mira.loyalty;
      const bountyReady = state.quests.huntedCount >= state.quests.huntedGoal;
      openModal(`
        <div class="modal-head">
          <div>
            <h2 class="modal-title">Mira Saltvein — Pasar S&D & Informan</h2>
            <div class="modal-sub">Human • Saltgrave League • Sifat: Licin, Penasaran • Loyalitas: <b>${loy}/100</b></div>
          </div>
          <button class="close-btn" id="btn-close-modal">Tutup</button>
        </div>
        <div class="dialog-speech">
          "Harga <b>Salt Crystal</b> sedang naik di Port Rotdock karena kapal penyelundup tertahan. Kalau kau mau bronze cepat, bersihkan <b>3 monster</b> di Tidewrack Beach (${state.quests.huntedCount}/${state.quests.huntedGoal}), atau jual bahanmu ke sini."
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px">
          <button class="btn-primary" id="btn-mira-bounty" ${bountyReady ? '' : 'disabled'}>
            ${bountyReady ? '✦ Klaim Hadiah Patroli (+60 br, +15 XP Battle)' : `Patroli Pantai (${state.quests.huntedCount}/${state.quests.huntedGoal})`}
          </button>
          <button class="btn-secondary" id="btn-buy-iron">Beli Anchor Iron (80 br)</button>
          <button class="btn-secondary" id="btn-sell-salt">Jual 1 Salt Crystal (+24 br)</button>
        </div>
        <div class="dialog-choices">
          <button class="choice-btn" id="ch-mira-1">
            <span>"Beri aku info jalur aman untuk warga desa — bukan cuma harga pasar."</span>
            <span class="tone-badge tone-ramah">Ramah • Mulia +1</span>
          </button>
          <button class="choice-btn" id="ch-mira-2">
            <span>"Kasih tahu jalur Shadow Syndicate. Aku mau beli trofi langka lebih cepat."</span>
            <span class="tone-badge tone-tegas">Tegas • Kejam +1</span>
          </button>
        </div>
      `);
      document.getElementById('btn-close-modal').onclick = closeModal;
      document.getElementById('btn-mira-bounty').onclick = () => {
        state.quests.huntedCount = 0;
        state.player.bronze += 60;
        addLog('✦ Kontrak Mira selesai! +60 br & +15 XP Battle.', 'loot');
        grantXP('battle', 15);
        openDialogModal('mira');
      };
      document.getElementById('btn-buy-iron').onclick = () => {
        if (state.player.bronze < 80) { addLog('Bronze tidak cukup (butuh 80 br).', 'sys'); return; }
        state.player.bronze -= 80;
        state.player.inventory['MAT-A08-05'] = (state.player.inventory['MAT-A08-05'] || 0) + 1;
        addLog('Membeli 1 Anchor Iron dari Mira (-80 br).', 'loot');
        updateHUD();
        openDialogModal('mira');
      };
      document.getElementById('btn-sell-salt').onclick = () => {
        if ((state.player.inventory['MAT-A08-01'] || 0) < 1) { addLog('Tidak punya Salt Crystal untuk dijual.', 'sys'); return; }
        state.player.inventory['MAT-A08-01'] -= 1;
        state.player.bronze += 24;
        addLog('Menjual 1 Salt Crystal di pasar Tidewrack (+24 br, permintaan tinggi!).', 'loot');
        updateHUD();
        openDialogModal('mira');
      };
      document.getElementById('ch-mira-1').onclick = () => {
        state.player.mulia += 1;
        state.npcs.mira.loyalty = Math.max(0, state.npcs.mira.loyalty - 1);
        addLog('Mira mengangkat bahu: "Terlalu baik untuk pesisir Saltgrave..." (Mulia +1, Loyalitas Mira -1)', 'moral');
        updateHUD(); closeModal();
      };
      document.getElementById('ch-mira-2').onclick = () => {
        state.player.kejam += 1;
        state.npcs.mira.loyalty = Math.min(100, state.npcs.mira.loyalty + 2);
        addLog('Mira tersenyum tipis: "Ah, pelanggan cerdas. Nanti kuperkenalkan dengan Informan Syndicate." (Kejam +1, Loyalitas Mira +2)', 'moral');
        updateHUD(); closeModal();
      };
    } else if (npcKey === 'kael') {
      openModal(`
        <div class="modal-head">
          <div>
            <h2 class="modal-title">Kael — Calon Murid & Companion (CD-6.01)</h2>
            <div class="modal-sub">Elf • Sifat: Berani, Setia (Mulia) • Bakat Tempur & Crew Skill</div>
          </div>
          <button class="close-btn" id="btn-close-modal">Tutup</button>
        </div>
        <div class="dialog-speech">
          "Aku melihatmu menyalakan bengkel di desa ini! Aku bisa menjaga punggungmu di <b>Tidewrack Beach</b> dengan tombakku, dan membantu mengumpulkan bahan saat kau menempa. Boleh aku bergabung sebagai murid pertamamu?"
        </div>
        <div class="dialog-choices">
          <button class="choice-btn" id="ch-kael-join">
            <span>"Bergabunglah, Kael! Kita jaga Tidewrack bersama sebagai guru dan murid."</span>
            <span class="tone-badge tone-ramah">Rekrut Companion • Mulia +1</span>
          </button>
          <button class="choice-btn" id="ch-kael-later">
            <span>"Tunggu dulu di sini, aku mau melihat suasana desa sendirian sebentar."</span>
            <span class="tone-badge tone-jenaka">Nanti Saja • Netral</span>
          </button>
        </div>
      `);
      document.getElementById('btn-close-modal').onclick = closeModal;
      document.getElementById('ch-kael-later').onclick = closeModal;
      document.getElementById('ch-kael-join').onclick = () => {
        state.companion.recruited = true;
        state.quests.recruitedKael = true;
        state.player.mulia += 1;
        state.companion.loyalty = Math.min(100, state.companion.loyalty + 2);
        // Remove town standing Kael and activate live follower Companion!
        const idx = nodeEntities.findIndex(e => e.id === 'npc_kael');
        if (idx >= 0) {
          const ent = nodeEntities[idx];
          activeNodeGroup.remove(ent.mesh);
          if (ent.labelEl && ent.labelEl.parentNode) ent.labelEl.parentNode.removeChild(ent.labelEl);
          nodeEntities.splice(idx, 1);
        }
        companionActor.visible = true;
        companionActor.position.set(state.pos.x - 1.5, 0, state.pos.z + 0.8);
        addLog('✦ Kael bergabung sebagai Companion Murid! Ia akan ikut bertarung di belakangmu.', 'moral');
        spawnFloatingText(state.pos, 'Companion: Kael!', '#6ce0d4');
        updateHUD();
        closeModal();
      };
    }
  }

  // --- MODAL: PAPAN KABAR TIDEWRACK ---
  function openBoardModal() {
    openModal(`
      <div class="modal-head">
        <div>
          <h2 class="modal-title">📜 Papan Kabar Tidewrack Village</h2>
          <div class="modal-sub">Saltgrave Coast • Faksi: Saltgrave League • Enclave Sengketa (WD-1.07)</div>
        </div>
        <button class="close-btn" id="btn-close-modal">Tutup</button>
      </div>
      <div class="dialog-speech">
        <b>[Isu Lokal — WD-4.15]:</b> Penyelundup dari <i>Port Saltgrave</i> menurunkan peti bijih curian di dekat <b>Tidewrack Beach</b>. Kemunculan <b>Runt Jellyfish Drifter (Reguler Khusus)</b> membuat nelayan takut mendekati pantai.<br><br>
        <b>Tips SWTOR Interrupt:</b> Saat <i>Jellyfish Drifter</i> mengisi bar merah <b>Static Surge</b>, tekan skill <b>[2] Pommel Bash</b> untuk membatalkan serangannya!
      </div>
      <button class="btn-primary" id="btn-board-ok">Mengerti</button>
    `);
    document.getElementById('btn-close-modal').onclick = closeModal;
    document.getElementById('btn-board-ok').onclick = closeModal;
  }

  // --- MODAL: PORTAL PINDAH NODE (RF Online / Instanced Zone Map) ---
  function openPortalModal(portalEnt) {
    const inVillage = state.activeNodeId === 'tidewrack_village';
    openModal(`
      <div class="modal-head">
        <div>
          <h2 class="modal-title">🌀 Gerbang Node — Saltgrave Coast (Tier 1)</h2>
          <div class="modal-sub">Konsep 1 Node Panggung Aktif: Node lama otomatis dibersihkan dari RAM saat pindah.</div>
        </div>
        <button class="close-btn" id="btn-close-modal">Batal</button>
      </div>
      <div class="dialog-choices">
        ${inVillage ? `
          <button class="choice-btn" id="btn-go-beach">
            <div>
              <div style="font-weight:700;color:#6ce0d4">⚔️ Tidewrack Beach (Wilayah Rendah • Lv.1–10)</div>
              <div style="font-size:11px;color:#98a6b3">4 Monster Lv.1 (termasuk Elite Drifter) + Deposit Salt Crystal</div>
            </div>
            <span class="tone-badge tone-ramah">Masuk Node</span>
          </button>
        ` : `
          <button class="choice-btn" id="btn-go-village">
            <div>
              <div style="font-weight:700;color:#f6c368">🔥 Tidewrack Village (Kota Awal • Aman)</div>
              <div style="font-size:11px;color:#98a6b3">Bengkel Tempa, Master Brann, Mira Pasar S&D, Kael Companion</div>
            </div>
            <span class="tone-badge tone-jenaka">Kembali</span>
          </button>
        `}
        <button class="choice-btn" disabled style="opacity:0.55;cursor:not-allowed">
          <div>
            <div style="font-weight:700">⛵ Port Rotdock (Town • Karavan WD-1.06)</div>
            <div style="font-size:11px;color:#98a6b3">Terkunci di sampel Lv.1 sederhana (rencana ekspansi penuh)</div>
          </div>
          <span class="tag">Preview</span>
        </button>
        <button class="choice-btn" disabled style="opacity:0.55;cursor:not-allowed">
          <div>
            <div style="font-weight:700">🗝️ Drownedbell Crypts (Dungeon 100 Lantai • Portal L10)</div>
            <div style="font-size:11px;color:#98a6b3">Terkunci di sampel Lv.1 sederhana (rencana ekspansi penuh)</div>
          </div>
          <span class="tag">Preview</span>
        </button>
      </div>
    `);
    document.getElementById('btn-close-modal').onclick = closeModal;
    const goBeach = document.getElementById('btn-go-beach');
    if (goBeach) goBeach.onclick = () => { closeModal(); switchNode('tidewrack_beach', 'Tidewrack Beach'); };
    const goVillage = document.getElementById('btn-go-village');
    if (goVillage) goVillage.onclick = () => { closeModal(); switchNode('tidewrack_village', 'Tidewrack Village'); };
  }

  // --- MODAL: KARAKTER & TAS ---
  function openSheetModal() {
    const p = state.player;
    const w = getWeapon();
    const build = state.v33Build || refreshBuildV33(true);
    const card = build.activeDestinyCard;
    const statsHtml = Object.entries(p.stats).map(([k, v]) => `<span class="tag"><b>${k}</b>: ${v}</span>`).join(' ');
    const invHtml = Object.keys(MATERIAL_CATALOG).map(id => {
      const m = MATERIAL_CATALOG[id];
      return `<div class="item-card"><div class="item-title">${m.name} (x${p.inventory[id] || 0})</div><div class="item-desc">${m.rarity} • ${m.price} br • ${m.desc}</div></div>`;
    }).join('');

    openModal(`
      <div class="modal-head">
        <div>
          <h2 class="modal-title">🛡️ Lembar Karakter — Lv.${p.level} ${p.smithClass}</h2>
          <div class="modal-sub">Kartu Destiny: <b>${card ? card.displayName : p.smithClass}</b> • Macro Bar: ${build.equippedSkills.length}/${build.maxSlots} Slot + [W] • GCD ${state.gcdDuration}d</div>
        </div>
        <button class="close-btn" id="btn-close-modal">Tutup</button>
      </div>
      <div style="margin-bottom:10px;display:flex;flex-wrap:wrap;gap:6px">${statsHtml}</div>
      <div class="dialog-speech" style="margin-bottom:10px">
        <b>Moral Conscience (WD-4.06):</b> Mulia ${p.mulia} | Kejam ${p.kejam}<br>
        <b>Companion Murid:</b> ${state.companion.recruited ? `${state.companion.name} (Aktif — Loyalitas ${state.companion.loyalty}/100)` : 'Belum direkrut (Temui Kael di Tidewrack Village)'}<br>
        <b>Kontrol Laptop:</b> WASD / Klik Tanah jalan • <b>[1–6]</b> Skill Class • <b>[Q]</b> Weapon Skill [W] • <b>[K]</b> Skill Tree & 29 Kartu Destiny • <b>[E]</b> Interaksi • <b>[Tab]</b> Ganti Target • Klik-Kanan putar kamera.<br>
        <b>Kontrol HP:</b> Tap tanah/NPC/Musuh, tap tombol skill di bawah, atau aktifkan D-Pad!
      </div>
      <div class="item-grid">${invHtml}</div>
    `);
    document.getElementById('btn-close-modal').onclick = closeModal;
  }

  // --- MODAL CD v3.3: 5 POHON SMITH, RF MASTERY (Lv.1-GM), 29 KARTU DESTINY & WEAPON SKILL [W] ---
  const v33Ui = { tab: 'tree', selectedClass: 'Weaponsmith', switchTargetId: null };

  function applyBuildPreset(name) {
    const p = state.player;
    if (name === 'starter') {
      p.smithTiers = { Weaponsmith: 1, Armorer: 0, Rangesmith: 0, Runesmith: 0, Reforger: 0 };
      p.firstTakenClass = 'Weaponsmith';
      p.activeDestinyId = null;
      p.stats.INT = 2;
      p.equippedSkillIds = ['wpn_t1_a'];
    } else if (name === 'spellblade') {
      p.smithTiers = { Weaponsmith: 3, Armorer: 0, Rangesmith: 0, Runesmith: 2, Reforger: 0 };
      p.firstTakenClass = 'Weaponsmith';
      p.activeDestinyId = null;
      p.stats.INT = Math.max(p.stats.INT, 30);
      p.equippedSkillIds = ['wpn_t1_a', 'wpn_t2_a', 'wpn_t3_a', 'run_t1_a'];
    } else if (name === 'archblade') {
      p.smithTiers = { Weaponsmith: 5, Armorer: 0, Rangesmith: 0, Runesmith: 0, Reforger: 0 };
      p.firstTakenClass = 'Weaponsmith';
      p.activeDestinyId = null;
      p.stats.INT = Math.max(p.stats.INT, 30);
      p.equippedSkillIds = ['wpn_t1_a', 'wpn_t2_a', 'wpn_t4_a', 'wpn_t5_a'];
    } else if (name === 'polymath') {
      p.smithTiers = { Weaponsmith: 1, Armorer: 0, Rangesmith: 0, Runesmith: 2, Reforger: 2 };
      p.firstTakenClass = 'Runesmith';
      p.activeDestinyId = null;
      p.stats.INT = Math.max(p.stats.INT, 30);
      p.equippedSkillIds = ['run_t1_a', 'run_t2_a', 'ref_t1_a', 'ref_t2_a', 'wpn_t1_a'];
    } else if (name === 'omnismith') {
      p.smithTiers = { Weaponsmith: 1, Armorer: 1, Rangesmith: 1, Runesmith: 1, Reforger: 1 };
      p.firstTakenClass = 'Weaponsmith';
      p.activeDestinyId = null;
      p.stats.INT = Math.max(p.stats.INT, 75);
      p.equippedSkillIds = ['wpn_t1_a', 'run_t1_a', 'ref_t1_a', 'rng_t1_a', 'arm_t1_a'];
    }
    v33Ui.switchTargetId = null;
    refreshBuildV33();
    updateHUD();
    addLog(`✦ Preset Build v3.3 aktif: ${state.player.smithClass} (${state.v33Build.equippedSkills.length}/${state.v33Build.maxSlots} slot + [W]).`, 'moral');
  }

  function openSkillDestinyModal(tab, cls) {
    if (tab) v33Ui.tab = tab;
    if (cls) v33Ui.selectedClass = cls;

    const p = state.player;
    const build = refreshBuildV33(true);
    const totalPts = Object.values(p.smithTiers).reduce((a, b) => a + b, 0);
    const activeCard = build.activeDestinyCard;
    const unlockedIds = new Set(build.unlockedDestinyCards.map(c => c.id));
    const trialDone = state.quests.forgedOnce || state.quests.huntedCount >= 1;

    let bodyHtml = '';

    if (v33Ui.tab === 'tree') {
      const ptsBar = SMITH_CLASSES.map(c => {
        const val = p.smithTiers[c] || 0;
        return `
          <div class="smith-pt-pill ${v33Ui.selectedClass === c ? 'active-cls' : ''}">
            <button class="chip-btn ${v33Ui.selectedClass === c ? 'active' : ''}" data-pick-cls="${c}" style="padding:2px 6px">${c}</button>
            <button class="mini-step-btn" data-pt-dec="${c}" ${val <= 0 || totalPts <= 1 ? 'disabled' : ''}>−</button>
            <b style="min-width:16px;text-align:center;color:${val > 0 ? '#f6c368' : '#98a6b3'}">T${val}</b>
            <button class="mini-step-btn" data-pt-inc="${c}" ${totalPts >= 5 || val >= 5 ? 'disabled' : ''}>+</button>
          </div>
        `;
      }).join('');

      const tree = skillData.smith_skill_trees[v33Ui.selectedClass];
      const clsRank = p.smithTiers[v33Ui.selectedClass] || 0;
      const isPure5 = totalPts === 5 && clsRank === 5;
      const tierCards = tree.tiers.map(t => {
        const sk = t.active_skill;
        const cp = t.core_passive;
        const unlocked = t.tier <= clsRank && (!t.pure_only || isPure5);
        const mastery = skillEngine.getSkillMasteryStage(p.skillMastery[sk.id] || 0);
        const isEquipped = p.equippedSkillIds.includes(sk.id);
        const pickedMorphId = p.selectedMorphs[`${v33Ui.selectedClass}_T${t.tier}`] || t.morph_choices[0].id;

        const morphBtns = t.morph_choices.map((m, idx) => {
          const picked = mastery.morphUnlocked && pickedMorphId === m.id;
          return `
            <button class="morph-btn ${picked ? 'picked' : ''}" data-morph-key="${v33Ui.selectedClass}_T${t.tier}" data-morph-id="${m.id}" ${unlocked && mastery.morphUnlocked ? '' : 'disabled'}>
              <div style="font-weight:700;color:${picked ? '#f6c368' : '#eef1f4'}">${idx + 1}. ${m.name}</div>
              <div style="font-size:9.5px;color:#6ce0d4;margin:1px 0">${m.branch}${mastery.isGM && picked ? ' • ✦ GM 1.25×' : ''}</div>
              <div>${m.desc}</div>
            </button>
          `;
        }).join('');

        return `
          <div class="tree-tier-card ${unlocked ? 'unlocked' : 'locked-tier'}">
            <div class="tier-head">
              <div>
                <span class="tag">T${t.tier} ${t.rank_label}</span>
                <b style="font-size:13px;color:${unlocked ? '#f6c368' : '#98a6b3'};margin-left:4px">${sk.name}</b>
                <span style="font-size:11px;color:#98a6b3"> • ${sk.role} • CD ${sk.cooldown_sec}d</span>
              </div>
              <div style="display:flex;gap:5px;align-items:center">
                <span class="skill-rank ${mastery.isGM ? 'gm' : ''}">${mastery.label} (${mastery.xp}${mastery.nextLevelXpReq ? '/' + mastery.nextLevelXpReq : ' MAX'})</span>
                ${unlocked ? `<button class="chip-btn" data-train-demo="${sk.id}" title="Tambah +60 XP RF Mastery untuk uji cepat">+60 XP</button>` : ''}
                ${unlocked
                  ? `<button class="chip-btn ${isEquipped ? 'active' : 'teal'}" data-toggle-equip="${sk.id}">${isEquipped ? '✓ Di Macro Bar' : '+ Pasang Bar'}</button>`
                  : `<span class="tag">${t.pure_only ? '🔒 5 Poin Murni' : '🔒 Butuh ' + v33Ui.selectedClass + ' T' + t.tier}</span>`
                }
              </div>
            </div>
            <div style="font-size:11.5px;color:#dce4ec">${sk.desc}</div>
            <div class="bar-track" style="height:5px;margin:5px 0"><div class="skill-xp-fill" style="width:${mastery.progressToNextPct}%"></div></div>
            <div class="passive-box ${unlocked && mastery.corePassiveUnlocked ? 'open' : ''}">
              <b>${unlocked && mastery.corePassiveUnlocked ? '✓ Core Passive:' : '🔒 Core Passive (Buka di Skill Lv.3):'}</b> <b>${cp.name}</b> — ${cp.desc}
            </div>
            <div style="font-size:10.5px;color:${unlocked && mastery.morphUnlocked ? '#f6c368' : '#98a6b3'};margin-top:4px">
              ${unlocked && mastery.morphUnlocked ? '✦ Pilih 1 dari 3 Morph (SWTOR):' : '🔒 Pilihan Morph 1-dari-3 (Terbuka di Skill Lv.5, Puncak di GM):'}
            </div>
            <div class="morph-grid">${morphBtns}</div>
          </div>
        `;
      }).join('');

      bodyHtml = `
        <div class="preset-strip">
          <span style="font-size:11px;color:#98a6b3">Uji Cepat Build (5 Poin Smith):</span>
          <button class="chip-btn" data-preset="starter">Lv.1 Pemula</button>
          <button class="chip-btn teal" data-preset="spellblade">Spellblade (3+2)</button>
          <button class="chip-btn" data-preset="archblade">Archblade (5 Murni)</button>
          <button class="chip-btn teal" data-preset="polymath">Polymath (+1 Slot)</button>
          <button class="chip-btn active" data-preset="omnismith">Omnismith (1×5)</button>
        </div>
        <div class="smith-pts-bar">
          <div style="width:100%;font-size:11px;color:#98a6b3;display:flex;justify-content:space-between">
            <span>Alokasi 5 Poin Tier Smith (Terpakai: <b style="color:#f6c368">${totalPts}/5</b>)</span>
            <span>Resource ${tree.smith_class}: <b style="color:#6ce0d4">${tree.resource.name}</b> • Slot Macro: <b>${build.equippedSkills.length}/${build.maxSlots}</b></span>
          </div>
          ${ptsBar}
        </div>
        ${tierCards}
      `;
    } else if (v33Ui.tab === 'destiny') {
      const switchTarget = v33Ui.switchTargetId && v33Ui.switchTargetId !== activeCard?.id
        ? skillData.destiny_cards[v33Ui.switchTargetId]
        : null;
      let switchBoxHtml = '';
      if (switchTarget) {
        const trialEval = skillEngine.evaluateDestinySwitch({
          currentCardId: activeCard?.id,
          targetCardId: switchTarget.id,
          smithTiers: p.smithTiers,
          firstTakenClass: p.firstTakenClass,
          level: p.level,
          method: 'trial',
          trialCompleted: trialDone,
          isFactionHostile: p.isFactionHostile,
          playerBronze: p.bronze
        });
        const goldEval = skillEngine.evaluateDestinySwitch({
          currentCardId: activeCard?.id,
          targetCardId: switchTarget.id,
          smithTiers: p.smithTiers,
          firstTakenClass: p.firstTakenClass,
          level: p.level,
          method: 'gold',
          isFactionHostile: p.isFactionHostile,
          playerBronze: p.bronze
        });
        switchBoxHtml = `
          <div class="switch-box">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:6px">
              <b style="color:#f6c368">🔄 Konfirmasi Ganti Kartu Destiny → ${switchTarget.name || switchTarget.names_by_tier[0]}</b>
              <button class="chip-btn" id="btn-cancel-switch">Batal</button>
            </div>
            <div style="font-size:11px;color:#98a6b3;margin-bottom:8px">
              Aturan Jalur Ganda (CD-3.02b): Pilih Misi Forgemasters' Guild (Gratis) atau Bayar Instan (500br × Lv.${p.level} × T${p.tier}${p.isFactionHostile ? ' + 50% Shadow Syndicate!' : ''}).
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:6px">
              <button class="btn-primary" id="btn-do-switch-trial" ${trialEval.allowed ? '' : 'disabled'}>
                ${trialEval.allowed ? '✓ Jalur Misi Guild (GRATIS — Trial Terpenuhi!)' : (p.isFactionHostile ? '🔒 Misi Guild Diblokir (Status Hostile!)' : '🔒 Selesaikan 1 Tempa / 1 Kill Pantai dulu')}
              </button>
              <button class="btn-secondary" id="btn-do-switch-gold" ${goldEval.allowed ? '' : 'disabled'}>
                💰 Bayar via ${goldEval.broker}: ${goldEval.costBronze} br ${goldEval.allowed ? '(Cukup)' : '(Kurang ' + goldEval.shortfallBronze + ' br)'}
              </button>
            </div>
          </div>
        `;
      }

      const allCards = Object.values(skillData.destiny_cards);
      const renderGroup = (title, cards) => `
        <div style="font-size:11.5px;font-weight:700;color:#f6c368;margin:10px 0 6px">${title}</div>
        <div class="destiny-grid">
          ${cards.map(c => {
            const isUnlocked = unlockedIds.has(c.id);
            const isActive = activeCard && activeCard.id === c.id;
            const liveObj = build.unlockedDestinyCards.find(x => x.id === c.id);
            const label = liveObj ? liveObj.displayName : (c.name || c.names_by_tier[4]);
            const reqText = c.category === 'pure'
              ? `${c.smith_class} T1–T5`
              : (c.category === 'dual' ? `${c.primary} > ${c.secondary}` : `Min. ${c.min_classes} Smith Class`);
            return `
              <div class="destiny-card ${isActive ? 'active' : (isUnlocked ? 'unlocked' : 'locked')}">
                <div>
                  <div style="display:flex;justify-content:space-between;align-items:center;gap:4px">
                    <b style="font-size:12.5px;color:${isActive ? '#ffe066' : (isUnlocked ? '#6ce0d4' : '#98a6b3')}">${label}</b>
                    <span class="tag">${reqText}</span>
                  </div>
                  <div style="font-size:10.5px;color:#dce4ec;margin-top:4px"><b>${c.signature.name}:</b> ${c.signature.desc}</div>
                </div>
                <div>
                  ${isActive
                    ? `<button class="btn-secondary" disabled style="width:100%">★ Kartu Destiny Aktif</button>`
                    : (isUnlocked
                      ? `<button class="btn-primary" data-req-switch="${c.id}" style="width:100%">🔄 Ganti ke Kartu Ini...</button>`
                      : `<span style="font-size:10px;color:#98a6b3">🔒 Belum memenuhi syarat sebaran poin</span>`)
                  }
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;

      bodyHtml = `
        <div class="destiny-hero">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">
            <div>
              <div style="font-size:11px;color:#6ce0d4">KARTU DESTINY AKTIF (KINGDOMS OF AMALUR × CD-3.02b)</div>
              <div style="font-family:Georgia,serif;font-size:17px;font-weight:700;color:#ffe066">🃏 ${activeCard ? activeCard.displayName : '-'} <span class="tag">${activeCard ? activeCard.category.toUpperCase() : ''}</span></div>
            </div>
            <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
              <button class="chip-btn ${p.isFactionHostile ? 'active' : ''}" id="btn-toggle-hostile">
                ${p.isFactionHostile ? '☠️ Guild Hostile (Syndicate +50%)' : '🏛️ Guild Ramah (Trial Aktif)'}
              </button>
              <button class="chip-btn teal" id="btn-demo-gold">+2000 br (Dana Uji)</button>
            </div>
          </div>
          <div style="font-size:11.5px;color:#eef1f4;margin-top:6px">
            <b>Signature (${activeCard?.signature?.name || '-'}):</b> ${activeCard?.signature?.desc || '-'}
            ${activeCard && !activeCard.signatureActive ? ' <span style="color:#f6c368">(Aktif penuh mulai Tier 3)</span>' : ''}
          </div>
          <div style="font-size:11px;color:#98a6b3;margin-top:4px">
            Koleksi Terbuka: <b style="color:#6ce0d4">${build.unlockedDestinyCards.length}/29 Kartu</b> • Status Misi Trial: <b style="color:${trialDone ? '#8fe3b8' : '#f6c368'}">${trialDone ? '✓ Terpenuhi (Tempa / Patroli)' : 'Belum (Tempa 1 senjata / kalahkan 1 monster)'}</b> • Kas: <b>${p.bronze} br</b>
          </div>
        </div>
        ${switchBoxHtml}
        ${renderGroup('A. 5 Kartu Destiny Murni (Skala Tier 1–5)', allCards.filter(c => c.category === 'pure'))}
        ${renderGroup('B. 20 Kartu Destiny Dual-Class Berarah', allCards.filter(c => c.category === 'dual'))}
        ${renderGroup('C. 4 Kartu Destiny Multi-Class (3–5 Class)', allCards.filter(c => c.category === 'multi'))}
      `;
    } else {
      const ws = build.weaponSkill;
      const w = getWeapon();
      bodyHtml = `
        <div class="destiny-hero">
          <div style="font-size:11px;color:#6ce0d4">1 SLOT KHUSUS WEAPON SKILL [W] • HOTKEY [Q]</div>
          <div style="font-family:Georgia,serif;font-size:17px;font-weight:700;color:#ffe066">⚔️ ${ws.name} <span class="skill-rank ${ws.mastery.isGM ? 'gm' : ''}">${ws.mastery.label}</span></div>
          <div style="font-size:12px;color:#eef1f4;margin-top:4px">Senjata Terpasang: <b>${w.name}</b> (${w.stat} • ${w.mode} ${w.range}m • ${w.el})</div>
          <div style="font-size:11.5px;color:#98a6b3;margin-top:4px">
            Status: <b style="color:${ws.unlocked ? '#8fe3b8' : '#ff7c73'}">${ws.unlocked ? (ws.unlockedByOmnismith ? '✓ TERBUKA VIA OMNISMITH (Bebas 48 Senjata!)' : '✓ TERBUKA (' + ws.governing_smith + ' cocok)') : '🔒 TERKUNCI — Butuh min. Tier 1 ' + ws.governing_smith + ' atau Destiny Omnismith'}</b>
          </div>
          <div style="font-size:11.5px;color:#dce4ec;margin-top:4px">
            Cooldown Efektif: <b>${ws.effectiveCooldownSec}d</b> • Multiplier Efektif: <b>${ws.effectiveMultiplier}×</b> • RF XP: <b>${ws.mastery.xp}${ws.mastery.nextLevelXpReq ? '/' + ws.mastery.nextLevelXpReq : ' (GM MAX)'}</b>
          </div>
          <div class="bar-track" style="height:6px;margin:7px 0"><div class="skill-xp-fill" style="width:${ws.mastery.progressToNextPct}%"></div></div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">
            <button class="btn-primary" id="btn-train-wpn-demo">+60 XP Latih Weapon Skill [W]</button>
            <button class="chip-btn ${p.fastTraining ? 'active' : ''}" id="btn-toggle-fast-train">
              ${p.fastTraining ? '⚡ Kecepatan Latih RF: Demo Cepat (12× XP)' : '🐢 Kecepatan Latih RF: Standar Asli (1× XP)'}
            </button>
          </div>
        </div>
        <div class="dialog-speech">
          <b>Aturan Anti-Spam (SWTOR × RF Classic):</b><br>
          • <b>Global Cooldown (GCD): ${state.gcdDuration} detik</b> berlaku lintas semua tombol setiap kali skill digunakan — jeda otomatis diisi oleh <b>Auto-Attack</b> senjata (DEX & Weapon Trigger tetap vital!).<br>
          • <b>Use-to-Level (Lv.1 → GM):</b> Setiap skill yang digunakan secara manual maupun lewat <b>Mode Idle</b> menaikkan mastery hingga <b>GM (+40% efektivitas, -10% Cooldown, Puncak Morph 1.25×)</b>!
        </div>
      `;
    }

    openModal(`
      <div class="modal-head">
        <div>
          <h2 class="modal-title">🌳 Skill Tree Smith, RF Mastery & 29 Kartu Destiny (CD v3.3)</h2>
          <div class="modal-sub">125 Node Class • RF Classic Lv.1–GM • 29 Kartu Destiny Amalur • 48 Weapon Skills [W] • GCD ${state.gcdDuration}d</div>
        </div>
        <button class="close-btn" id="btn-close-modal">Tutup</button>
      </div>
      <div class="v33-tabs">
        <button class="v33-tab-btn ${v33Ui.tab === 'tree' ? 'active' : ''}" data-v33tab="tree">🌳 5 Pohon Smith & Morph</button>
        <button class="v33-tab-btn ${v33Ui.tab === 'destiny' ? 'active' : ''}" data-v33tab="destiny">🃏 29 Kartu Destiny (${build.unlockedDestinyCards.length})</button>
        <button class="v33-tab-btn ${v33Ui.tab === 'weapon' ? 'active' : ''}" data-v33tab="weapon">⚔️ Weapon Skill [W] & GCD</button>
      </div>
      ${bodyHtml}
    `, true);

    document.getElementById('btn-close-modal').onclick = closeModal;
    document.querySelectorAll('[data-v33tab]').forEach(btn => {
      btn.onclick = () => openSkillDestinyModal(btn.dataset.v33tab);
    });
    document.querySelectorAll('[data-preset]').forEach(btn => {
      btn.onclick = () => { applyBuildPreset(btn.dataset.preset); openSkillDestinyModal('tree'); };
    });
    document.querySelectorAll('[data-pick-cls]').forEach(btn => {
      btn.onclick = () => openSkillDestinyModal('tree', btn.dataset.pickCls);
    });
    document.querySelectorAll('[data-pt-inc]').forEach(btn => {
      btn.onclick = () => {
        const c = btn.dataset.ptInc;
        const sum = Object.values(p.smithTiers).reduce((a, b) => a + b, 0);
        if (sum < 5 && (p.smithTiers[c] || 0) < 5) {
          if (sum === 0) p.firstTakenClass = c;
          p.smithTiers[c] = (p.smithTiers[c] || 0) + 1;
          refreshBuildV33();
          updateHUD();
          openSkillDestinyModal('tree', c);
        }
      };
    });
    document.querySelectorAll('[data-pt-dec]').forEach(btn => {
      btn.onclick = () => {
        const c = btn.dataset.ptDec;
        const sum = Object.values(p.smithTiers).reduce((a, b) => a + b, 0);
        if (sum > 1 && (p.smithTiers[c] || 0) > 0) {
          p.smithTiers[c] -= 1;
          refreshBuildV33();
          updateHUD();
          openSkillDestinyModal('tree', c);
        }
      };
    });
    document.querySelectorAll('[data-train-demo]').forEach(btn => {
      btn.onclick = () => {
        const sId = btn.dataset.trainDemo;
        const res = skillEngine.trainSkillMastery(p.skillMastery, sId, 60, 1);
        p.skillMastery = res.masteryState;
        refreshBuildV33();
        updateHUD();
        openSkillDestinyModal('tree');
      };
    });
    document.querySelectorAll('[data-toggle-equip]').forEach(btn => {
      btn.onclick = () => {
        const sId = btn.dataset.toggleEquip;
        const idx = p.equippedSkillIds.indexOf(sId);
        if (idx >= 0) {
          if (p.equippedSkillIds.length > 1) p.equippedSkillIds.splice(idx, 1);
        } else {
          if (p.equippedSkillIds.length >= build.maxSlots) p.equippedSkillIds.shift();
          p.equippedSkillIds.push(sId);
        }
        refreshBuildV33();
        updateHUD();
        openSkillDestinyModal('tree');
      };
    });
    document.querySelectorAll('[data-morph-id]').forEach(btn => {
      btn.onclick = () => {
        p.selectedMorphs[btn.dataset.morphKey] = btn.dataset.morphId;
        refreshBuildV33();
        updateHUD();
        openSkillDestinyModal('tree');
      };
    });

    // Destiny Tab Actions
    const toggleHostile = document.getElementById('btn-toggle-hostile');
    if (toggleHostile) toggleHostile.onclick = () => { p.isFactionHostile = !p.isFactionHostile; openSkillDestinyModal('destiny'); };
    const demoGold = document.getElementById('btn-demo-gold');
    if (demoGold) demoGold.onclick = () => { p.bronze += 2000; updateHUD(); openSkillDestinyModal('destiny'); };
    const cancelSw = document.getElementById('btn-cancel-switch');
    if (cancelSw) cancelSw.onclick = () => { v33Ui.switchTargetId = null; openSkillDestinyModal('destiny'); };
    document.querySelectorAll('[data-req-switch]').forEach(btn => {
      btn.onclick = () => { v33Ui.switchTargetId = btn.dataset.reqSwitch; openSkillDestinyModal('destiny'); };
    });
    const doTrial = document.getElementById('btn-do-switch-trial');
    if (doTrial) doTrial.onclick = () => {
      const res = skillEngine.evaluateDestinySwitch({
        currentCardId: activeCard?.id, targetCardId: v33Ui.switchTargetId,
        smithTiers: p.smithTiers, firstTakenClass: p.firstTakenClass,
        level: p.level, method: 'trial', trialCompleted: trialDone,
        isFactionHostile: p.isFactionHostile, playerBronze: p.bronze
      });
      if (res.allowed) {
        p.activeDestinyId = res.newActiveDestinyId;
        v33Ui.switchTargetId = null;
        refreshBuildV33();
        updateHUD();
        vfx.playVFX('levelup_pillar', state.pos);
        addLog(`🃏 Ganti Kartu Destiny via Misi ${res.broker} (GRATIS) → ${res.newActiveDestinyName}!`, 'moral');
        openSkillDestinyModal('destiny');
      }
    };
    const doGold = document.getElementById('btn-do-switch-gold');
    if (doGold) doGold.onclick = () => {
      const res = skillEngine.evaluateDestinySwitch({
        currentCardId: activeCard?.id, targetCardId: v33Ui.switchTargetId,
        smithTiers: p.smithTiers, firstTakenClass: p.firstTakenClass,
        level: p.level, method: 'gold',
        isFactionHostile: p.isFactionHostile, playerBronze: p.bronze
      });
      if (res.allowed) {
        p.bronze = res.remainingBronze;
        p.activeDestinyId = res.newActiveDestinyId;
        v33Ui.switchTargetId = null;
        refreshBuildV33();
        updateHUD();
        vfx.playVFX('aura_light', state.pos);
        addLog(`🃏 Ganti Kartu Destiny via ${res.broker} (-${res.costBronze} br) → ${res.newActiveDestinyName}!`, 'moral');
        openSkillDestinyModal('destiny');
      }
    };

    // Weapon Tab Actions
    const trainWpn = document.getElementById('btn-train-wpn-demo');
    if (trainWpn) trainWpn.onclick = () => {
      const res = skillEngine.trainSkillMastery(p.skillMastery, build.weaponSkill.id, 60, 1);
      p.skillMastery = res.masteryState;
      refreshBuildV33();
      updateHUD();
      openSkillDestinyModal('weapon');
    };
    const toggleFast = document.getElementById('btn-toggle-fast-train');
    if (toggleFast) toggleFast.onclick = () => { p.fastTraining = !p.fastTraining; openSkillDestinyModal('weapon'); };
  }

  // --------------------------------------------------------------------------
  // 8. INPUT HANDLING (WASD, Tap-to-Move, Raycast Target, Right-Drag Orbit)
  // --------------------------------------------------------------------------
  const keys = {};
  const raycaster = new THREE.Raycaster();
  const pointerNDC = new THREE.Vector2();
  const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

  let isDraggingCam = false;
  let pointerDownPos = { x: 0, y: 0 };

  window.addEventListener('keydown', (e) => {
    if (state.modalOpen) {
      if (e.key === 'Escape') closeModal();
      return;
    }
    const k = e.key.toLowerCase();
    keys[k] = true;
    if (k >= '1' && k <= '6') triggerSkill(Number(k) - 1);
    if (k === 'q') triggerWeaponSkill();
    if (k === 'k') openSkillDestinyModal('tree');
    if (k === 'e' || k === ' ') {
      if (state.nearestInteractable) interactWith(state.nearestInteractable);
      else if (state.targetEntity) interactWith(state.targetEntity);
    }
    if (k === 'tab') {
      e.preventDefault();
      cycleTarget();
    }
  });

  window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
  });

  function cycleTarget() {
    const candidates = nodeEntities.filter(e => (e.kind === 'enemy' && e.alive) || e.kind === 'npc');
    if (!candidates.length) return;
    const idx = candidates.indexOf(state.targetEntity);
    selectEntity(candidates[(idx + 1) % candidates.length]);
  }

  function selectEntity(ent) {
    state.targetEntity = ent;
    if (!ent) {
      targetRingMesh.visible = false;
      updateTargetFrame();
      return;
    }
    targetRingMesh.visible = true;
    targetRingMesh.position.set(ent.pos.x, 0.06, ent.pos.z);
    targetRingMesh.material.color.setHex(
      ent.kind === 'enemy' ? 0xdf544c : (ent.kind === 'portal' || ent.kind === 'mine' ? 0x6ce0d4 : 0xf6c368)
    );
    updateTargetFrame();
  }

  canvas.addEventListener('contextmenu', e => e.preventDefault());

  canvas.addEventListener('pointerdown', (e) => {
    if (state.modalOpen) return;
    pointerDownPos = { x: e.clientX, y: e.clientY };
    if (e.button === 2) {
      isDraggingCam = true;
    }
  });

  window.addEventListener('pointermove', (e) => {
    if (!isDraggingCam) return;
    const dx = e.clientX - pointerDownPos.x;
    pointerDownPos.x = e.clientX;
    state.cameraYaw -= dx * 0.008;
  });

  window.addEventListener('pointerup', (e) => {
    if (e.button === 2) {
      isDraggingCam = false;
      return;
    }
    if (state.modalOpen || e.target !== canvas) return;
    const moved = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
    if (moved > 10) return;

    const rect = canvas.getBoundingClientRect();
    pointerNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointerNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointerNDC, camera);

    // 1. Check click on entities (NPC, Forge, Monster, Mine, Portal)
    let clickedEnt = null;
    let bestHitDist = 999;
    nodeEntities.forEach(ent => {
      if (ent.kind === 'enemy' && !ent.alive) return;
      const hits = raycaster.intersectObject(ent.mesh, true);
      if (hits.length && hits[0].distance < bestHitDist) {
        bestHitDist = hits[0].distance;
        clickedEnt = ent;
      }
    });

    if (clickedEnt) {
      selectEntity(clickedEnt);
      const d = state.pos.distanceTo(clickedEnt.pos);
      if (clickedEnt.kind === 'enemy') {
        const w = getWeapon();
        if (d <= w.range + 0.5) triggerSkill(0);
        else {
          const dir = new THREE.Vector3().subVectors(clickedEnt.pos, state.pos).normalize();
          state.moveTarget = clickedEnt.pos.clone().sub(dir.multiplyScalar(Math.max(1.5, w.range - 0.6)));
        }
      } else {
        if (d <= clickedEnt.radius + 0.6) interactWith(clickedEnt);
        else {
          state.moveTarget = clickedEnt.pos.clone();
          state.pendingInteract = clickedEnt;
        }
      }
      return;
    }

    // 2. Otherwise click-to-move on floor plane (RF Online / Diablo style!)
    const hitPt = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(groundPlane, hitPt)) {
      hitPt.x = Math.max(-12.5, Math.min(12.5, hitPt.x));
      hitPt.z = Math.max(-8.8, Math.min(8.8, hitPt.z));
      hitPt.y = 0;
      state.moveTarget = hitPt;
      state.pendingInteract = null;
      clickRingMesh.position.set(hitPt.x, 0.05, hitPt.z);
      clickRingMesh.scale.set(1, 1, 1);
      clickRingMesh.visible = true;
    }
  });

  // Virtual D-Pad hold bindings
  const dpadDir = { x: 0, z: 0 };
  document.querySelectorAll('.dpad-btn').forEach(btn => {
    const dx = Number(btn.dataset.dx || 0);
    const dz = Number(btn.dataset.dz || 0);
    const start = (e) => { e.preventDefault(); dpadDir.x = dx; dpadDir.z = dz; state.moveTarget = null; };
    const stop = () => { dpadDir.x = 0; dpadDir.z = 0; };
    btn.addEventListener('pointerdown', start);
    btn.addEventListener('pointerup', stop);
    btn.addEventListener('pointerleave', stop);
    btn.addEventListener('pointercancel', stop);
  });

  // --------------------------------------------------------------------------
  // 9. UI BINDINGS, DYNAMIC CD v3.3 MACRO BAR & HUD UPDATES
  // --------------------------------------------------------------------------
  function renderMacroBarSlots() {
    const build = state.v33Build || refreshBuildV33(true);
    const wrap = document.getElementById('class-skill-slots');
    if (!wrap) return;
    const html = [];
    for (let i = 0; i < build.maxSlots; i++) {
      const sk = build.equippedSkills[i];
      if (sk) {
        const shortSub = sk.role.includes('Buff') ? 'Buff RF'
          : (sk.interrupts_cast ? 'Interrupt!'
            : (sk.consumes_resource ? 'Burst'
              : (sk.tier === 5 ? 'Apex Ult' : 'Opener')));
        html.push(`
          <button class="skill-slot" id="skill-slot-${i}" title="${sk.name} (${sk.smithClass} T${sk.tier}, ${sk.mastery.label}) — ${sk.desc}">
            <div class="skill-top-row">
              <span class="skill-key">[${i + 1}]</span>
              <span class="skill-rank ${sk.mastery.isGM ? 'gm' : ''}" id="skill-rank-${i}">${sk.mastery.label}</span>
            </div>
            <span class="skill-name">${sk.name}</span>
            <span class="skill-sub">${shortSub} • ${sk.effectiveCooldownSec}d</span>
            <div class="skill-xp-bar"><div class="skill-xp-fill" id="skill-xp-${i}" style="width:${sk.mastery.progressToNextPct}%"></div></div>
            <div class="gcd-mask" id="skill-gcd-${i}"></div>
            <div class="cd-mask" id="skill-cd-${i}"></div>
          </button>
        `);
      } else {
        html.push(`
          <button class="skill-slot empty-slot" id="skill-slot-${i}" data-open-tree="1" title="Slot kosong — klik [K] untuk alokasi Poin Smith & pasang skill">
            <span>[${i + 1}]<br>+ Skill</span>
          </button>
        `);
      }
    }
    wrap.innerHTML = html.join('');
    for (let i = 0; i < build.maxSlots; i++) {
      const el = document.getElementById('skill-slot-' + i);
      if (!el) continue;
      if (el.dataset.openTree) el.onclick = () => openSkillDestinyModal('tree');
      else el.onclick = () => triggerSkill(i);
    }
  }

  function addLog(text, type) {
    const box = document.getElementById('log-entries');
    const div = document.createElement('div');
    div.className = 'log-line ' + (type || '');
    div.textContent = text;
    box.appendChild(div);
    while (box.children.length > 26) box.removeChild(box.firstChild);
    box.scrollTop = box.scrollHeight;
  }

  function updateTargetFrame() {
    const frame = document.getElementById('target-frame');
    const ent = state.targetEntity;
    if (!ent || (ent.kind === 'enemy' && !ent.alive)) {
      frame.classList.remove('visible', 'friendly');
      return;
    }
    frame.classList.add('visible');
    frame.classList.toggle('friendly', ent.kind !== 'enemy');
    document.getElementById('target-name').textContent = ent.name;

    const meta = document.getElementById('target-meta');
    const hpWrap = document.getElementById('target-hp-row');
    const castBox = document.getElementById('target-cast-box');

    if (ent.kind === 'enemy') {
      hpWrap.style.display = 'flex';
      document.getElementById('target-hp-fill').style.width = Math.round((ent.hp / ent.maxHp) * 100) + '%';
      document.getElementById('target-hp-val').textContent = `${ent.hp}/${ent.maxHp}`;
      meta.innerHTML = `
        <span class="tag ${ent.isElite ? 'elite' : ''}">${ent.tpl.type} • Lv.${ent.tpl.lvl}</span>
        <span class="tag">${ent.tpl.role}</span>
        <span class="tag weak">Weak: ${ent.tpl.weak}</span>
      `;
      if (ent.casting) {
        castBox.classList.add('casting');
        const pct = Math.min(100, Math.round((ent.castTimer / ent.castDuration) * 100));
        const intIdx = state.v33Build ? state.v33Build.equippedSkills.findIndex(s => s.interrupts_cast) : -1;
        const hintKey = intIdx >= 0 ? `[${intIdx + 1}]` : '[Q]';
        document.getElementById('target-cast-name').textContent = `⚡ ${ent.tpl.castSkill} — TEKAN ${hintKey}!`;
        document.getElementById('target-cast-fill').style.width = pct + '%';
      } else {
        castBox.classList.remove('casting');
      }
    } else {
      hpWrap.style.display = 'none';
      castBox.classList.remove('casting');
      meta.innerHTML = `<span class="tag">${ent.title || 'Interaksi Node'}</span>`;
    }
  }

  function updateHUD() {
    const p = state.player;
    const w = getWeapon();
    const build = state.v33Build || refreshBuildV33(true);
    const card = build.activeDestinyCard;

    document.getElementById('hud-destiny').textContent = `🃏 ${card ? card.displayName : p.smithClass}`;
    document.getElementById('hud-lvl').textContent = `Lv.${p.level} • T${p.tier}`;
    document.getElementById('hud-hp-fill').style.width = Math.round((p.hp / p.maxHp) * 100) + '%';
    document.getElementById('hud-hp-val').textContent = `${p.hp}/${p.maxHp}${p.barrier > 0 ? '+' + Math.round(p.barrier) : ''}`;
    document.getElementById('hud-stam-fill').style.width = Math.round((p.stamina / p.maxStamina) * 100) + '%';
    document.getElementById('hud-stam-val').textContent = `${p.stamina}/${p.maxStamina}`;
    document.getElementById('hud-bronze').textContent = `${p.bronze} br`;
    document.getElementById('hud-wpn').textContent = `${w.name} (${w.mode})`;
    document.getElementById('hud-mulia').textContent = p.mulia;
    document.getElementById('hud-kejam').textContent = p.kejam;

    // Dual XP Bars
    document.getElementById('hud-xpb-fill').style.width = Math.min(100, Math.round((p.xpBattle / p.xpQuota) * 100)) + '%';
    document.getElementById('hud-xpb-val').textContent = `${p.xpBattle}/${p.xpQuota}`;
    document.getElementById('hud-xps-fill').style.width = Math.min(100, Math.round((p.xpSmith / p.xpQuota) * 100)) + '%';
    document.getElementById('hud-xps-val').textContent = `${p.xpSmith}/${p.xpQuota}`;

    // Smith Resources, RF Class Buff, Destiny Signature & GCD Pills
    const procStrip = document.getElementById('proc-strip');
    const pills = [];
    if (p.resources.forge_heat > 0) pills.push(`<span class="buff-pill">🔥 Forge Heat ${p.resources.forge_heat}</span>`);
    if (p.resources.bastion_guard > 0) pills.push(`<span class="buff-pill">🛡️ Bastion Guard ${p.resources.bastion_guard}</span>`);
    if (p.resources.hunters_mark > 0) pills.push(`<span class="buff-pill">🎯 Hunter's Mark ${p.resources.hunters_mark}</span>`);
    if (p.resources.elemental_charge > 0) pills.push(`<span class="buff-pill">✨ Elem Charge ${p.resources.elemental_charge}/3</span>`);
    if (p.resources.overclock > 0) pills.push(`<span class="buff-pill">⚙️ Overclock ${p.resources.overclock}</span>`);
    if (state.activeClassBuffTimer > 0) pills.push(`<span class="buff-pill companion">⚡ ${state.activeClassBuffName} ${state.activeClassBuffTimer.toFixed(0)}d</span>`);
    if (state.runeMarkActive) pills.push(`<span class="buff-pill destiny">✦ Rune Mark Siap!</span>`);
    if (state.arcaneEdgeTimer > 0) pills.push(`<span class="buff-pill destiny">✦ Arcane Edge ${state.arcaneEdgeTimer.toFixed(1)}d</span>`);
    if (state.recentClasses.length > 0 && card?.id === 'Omnismith') pills.push(`<span class="buff-pill destiny">✦ Omni-Chain ${state.recentClasses.length}/3</span>`);
    if (state.gcdRemaining > 0) pills.push(`<span class="buff-pill gcd-pill">⏱ GCD ${state.gcdRemaining.toFixed(1)}d</span>`);
    if (state.companion.recruited) pills.push(`<span class="buff-pill companion">🛡️ Kael (${state.companion.loyalty})</span>`);
    if (state.idleMode) pills.push(`<span class="buff-pill companion">💤 Idle ON</span>`);
    procStrip.innerHTML = pills.join('');

    // Quest Tracker
    const q = state.quests;
    document.getElementById('q-1').className = 'quest-item ' + (q.talkedBrann ? 'done' : '');
    document.getElementById('q-2').className = 'quest-item ' + (q.forgedOnce ? 'done' : '');
    document.getElementById('q-3').className = 'quest-item ' + (q.recruitedKael ? 'done' : '');
    document.getElementById('q-4').className = 'quest-item ' + (q.huntedCount >= q.huntedGoal ? 'done' : '');
    document.getElementById('q-4').textContent = `• Pindah ke Tidewrack Beach & kalahkan monster (${q.huntedCount}/${q.huntedGoal})`;

    // Class Skill Slots (CD + Anti-Spam GCD sweep + RF Mastery XP + Proc/Interrupt glow)
    const gcdPct = state.gcdRemaining > 0 ? Math.min(100, Math.round((state.gcdRemaining / state.gcdDuration) * 100)) : 0;
    const enemyCasting = state.targetEntity && state.targetEntity.kind === 'enemy' && state.targetEntity.casting;

    build.equippedSkills.forEach((sk, i) => {
      const slot = document.getElementById('skill-slot-' + i);
      if (!slot) return;
      const mask = document.getElementById('skill-cd-' + i);
      const gcdMask = document.getElementById('skill-gcd-' + i);
      const rankEl = document.getElementById('skill-rank-' + i);
      const xpEl = document.getElementById('skill-xp-' + i);
      const curCd = state.skillCooldowns[sk.id] || 0;
      const liveMastery = skillEngine.getSkillMasteryStage(p.skillMastery[sk.id] || 0);

      if (rankEl) {
        rankEl.textContent = liveMastery.label;
        rankEl.classList.toggle('gm', liveMastery.isGM);
      }
      if (xpEl) xpEl.style.width = liveMastery.progressToNextPct + '%';
      if (gcdMask) gcdMask.style.height = (curCd <= 0 ? gcdPct : 0) + '%';
      if (mask) {
        if (curCd > 0) {
          mask.classList.add('on');
          mask.textContent = curCd.toFixed(1);
        } else {
          mask.classList.remove('on');
        }
      }

      const consumerReady = sk.consumes_resource && (p.resources[sk.consumes_resource.id] || 0) >= 2 && curCd <= 0;
      slot.classList.toggle('proc-ready', Boolean(consumerReady));
      slot.classList.toggle('interrupt-alert', Boolean(sk.interrupts_cast && enemyCasting && curCd <= 0));
      slot.classList.toggle('buff-active', Boolean(sk.role === 'Class Buff (RF)' && state.activeClassBuffTimer > 0));
    });

    // Dedicated Weapon Skill [W] Slot (Hotkey Q)
    const ws = build.weaponSkill;
    const wsSlot = document.getElementById('weapon-skill-slot');
    if (ws && wsSlot) {
      const wsMastery = skillEngine.getSkillMasteryStage(p.skillMastery[ws.id] || 0);
      document.getElementById('wpn-skill-name').textContent = ws.name;
      document.getElementById('wpn-skill-sub').textContent = ws.unlocked
        ? `${ws.effectiveCooldownSec}d${ws.unlockedByOmnismith ? ' • Omni' : ''}`
        : `🔒 ${ws.governing_smith} T1`;
      const wsRankEl = document.getElementById('wpn-skill-rank');
      wsRankEl.textContent = wsMastery.label;
      wsRankEl.classList.toggle('gm', wsMastery.isGM);
      document.getElementById('wpn-skill-xp').style.width = wsMastery.progressToNextPct + '%';
      document.getElementById('wpn-skill-gcd').style.height = (state.weaponSkillCd <= 0 && ws.unlocked ? gcdPct : 0) + '%';
      const wsCdEl = document.getElementById('wpn-skill-cd');
      if (state.weaponSkillCd > 0) {
        wsCdEl.classList.add('on');
        wsCdEl.textContent = state.weaponSkillCd.toFixed(1);
      } else {
        wsCdEl.classList.remove('on');
      }
      wsSlot.classList.toggle('locked', !ws.unlocked);
      const hasClassInt = build.equippedSkills.some(s => s.interrupts_cast);
      wsSlot.classList.toggle('interrupt-alert', Boolean(!hasClassInt && ws.unlocked && enemyCasting && state.weaponSkillCd <= 0));
    }

    updateTargetFrame();
  }

  // Wire HUD Buttons
  document.getElementById('weapon-skill-slot').onclick = () => triggerWeaponSkill();
  document.getElementById('btn-skill-destiny').onclick = () => openSkillDestinyModal('tree');
  document.getElementById('hud-destiny').onclick = () => openSkillDestinyModal('destiny');

  document.getElementById('context-prompt').onclick = () => {
    if (state.nearestInteractable) interactWith(state.nearestInteractable);
  };

  document.getElementById('btn-cam').onclick = () => {
    const modes = ['octopath', 'diablo', 'swtor'];
    const labels = { octopath: 'Kamera: Octopath HD-2D', diablo: 'Kamera: 2.5D Diablo', swtor: 'Kamera: 3D SWTOR' };
    state.cameraMode = modes[(modes.indexOf(state.cameraMode) + 1) % modes.length];
    document.getElementById('btn-cam').textContent = labels[state.cameraMode];
    addLog(`Sudut kamera diganti ke ${labels[state.cameraMode]}.`, 'sys');
  };

  document.getElementById('btn-quality').onclick = () => {
    state.qualityMode = state.qualityMode === 'lite' ? 'ultra' : 'lite';
    applyQualityPreset();
    addLog(`Preset grafis: ${state.qualityMode === 'ultra' ? 'ROG GL553VD Ultra (Bayangan & DPR tinggi)' : 'Oppo A54 Lite (Hemat RAM & Baterai)'}.`, 'sys');
  };

  document.getElementById('btn-idle').onclick = () => {
    state.idleMode = !state.idleMode;
    document.getElementById('btn-idle').classList.toggle('active', state.idleMode);
    document.getElementById('btn-idle').textContent = state.idleMode ? '💤 Idle: ON' : '💤 Idle: OFF';
    addLog(state.idleMode ? 'Mode Idle aktif (Auto-Hunt + Latihan RF Mastery Lv.1-GM otomatis!).' : 'Mode Idle dimatikan (Kendali Manual).', 'sys');
    updateHUD();
  };

  document.getElementById('btn-dpad-toggle').onclick = () => {
    state.showDpad = !state.showDpad;
    document.getElementById('touch-dpad').classList.toggle('visible', state.showDpad);
    document.getElementById('btn-dpad-toggle').classList.toggle('active', state.showDpad);
  };

  document.getElementById('btn-sheet').onclick = openSheetModal;
  document.getElementById('btn-quick-portal').onclick = () => {
    const p = nodeEntities.find(e => e.kind === 'portal');
    openPortalModal(p);
  };
  document.getElementById('modal-backdrop').addEventListener('click', (e) => {
    if (e.target.id === 'modal-backdrop') closeModal();
  });

  // --------------------------------------------------------------------------
  // 9b. LIVE VFX & SPRITE LINKER STUDIO DRAWER (data/vfx_animation_manifest.json)
  // --------------------------------------------------------------------------
  const linkerState = {
    open: false,
    tab: 'vfx', // 'vfx' | 'sprites' | 'weapons'
    selectedId: {
      vfx: 'slash_fire',
      sprites: 'hero_smith',
      weapons: 'wpn_starter_hammer'
    }
  };

  function toggleVfxDrawer(forceOpen) {
    linkerState.open = typeof forceOpen === 'boolean' ? forceOpen : !linkerState.open;
    document.getElementById('vfx-drawer').classList.toggle('open', linkerState.open);
    document.getElementById('btn-vfx-linker').classList.toggle('active', linkerState.open);
    if (linkerState.open) renderVfxDrawer();
  }

  document.getElementById('btn-vfx-linker').onclick = () => toggleVfxDrawer();
  document.getElementById('btn-close-vfx').onclick = () => toggleVfxDrawer(false);

  document.querySelectorAll('[data-vtab]').forEach(btn => {
    btn.onclick = () => {
      linkerState.tab = btn.dataset.vtab;
      document.querySelectorAll('[data-vtab]').forEach(b => b.classList.toggle('active', b === btn));
      renderVfxDrawer();
    };
  });

  function renderVfxDrawer() {
    const body = document.getElementById('vfx-drawer-body');
    const cat = linkerState.tab;
    const dict = vfx.manifest[cat] || {};
    const ids = Object.keys(dict);
    if (!ids.includes(linkerState.selectedId[cat])) linkerState.selectedId[cat] = ids[0];
    const id = linkerState.selectedId[cat];
    const item = dict[id];
    if (!item) return;

    const isCustom = vfx.isCustom(cat, id);
    const customName = vfx.getCustomFilename(cat, id);
    const optionsHtml = ids.map(k => {
      const mark = vfx.isCustom(cat, k) ? '✦ ' : '';
      return `<option value="${k}" ${k === id ? 'selected' : ''}>${mark}${dict[k].label} (${k})</option>`;
    }).join('');

    let controlsHtml = '';
    if (cat === 'vfx') {
      const sh = item.sheet || { cols: 1, rows: 1, fps: 16 };
      controlsHtml = `
        <div class="field-group">
          <div class="field-label"><span>Sprite Sheet Grid (1×1 = gambar tunggal)</span></div>
          <div class="grid-3">
            <label class="field-label" style="flex-direction:column;align-items:stretch;gap:3px">
              <span>Cols</span>
              <input class="drawer-input" type="number" min="1" max="16" id="vf-cols" value="${sh.cols}" />
            </label>
            <label class="field-label" style="flex-direction:column;align-items:stretch;gap:3px">
              <span>Rows</span>
              <input class="drawer-input" type="number" min="1" max="16" id="vf-rows" value="${sh.rows}" />
            </label>
            <label class="field-label" style="flex-direction:column;align-items:stretch;gap:3px">
              <span>FPS</span>
              <input class="drawer-input" type="number" min="1" max="60" id="vf-fps" value="${sh.fps}" />
            </label>
          </div>
        </div>
        <div class="field-group">
          <div class="grid-2">
            <label class="field-label" style="flex-direction:column;align-items:stretch;gap:3px">
              <span>Warna Tint</span>
              <input class="drawer-input" type="color" id="vf-color" value="${item.color || '#ffffff'}" style="height:30px;padding:2px" />
            </label>
            <label class="field-label" style="flex-direction:column;align-items:stretch;gap:3px">
              <span>Blending</span>
              <select class="drawer-select" id="vf-blend">
                <option value="additive" ${item.blending !== 'normal' ? 'selected' : ''}>Additive (Menyala)</option>
                <option value="normal" ${item.blending === 'normal' ? 'selected' : ''}>Normal (Alpha)</option>
              </select>
            </label>
          </div>
          <label class="field-label"><span>Scale</span><b id="val-scale">${item.scale}</b></label>
          <input class="drawer-range" type="range" min="0.5" max="4.5" step="0.1" id="vf-scale" value="${item.scale}" />
          <label class="field-label"><span>Durasi (detik)</span><b id="val-dur">${item.duration}s</b></label>
          <input class="drawer-range" type="range" min="0.1" max="1.5" step="0.02" id="vf-dur" value="${item.duration}" />
          <label class="field-label"><span>Camera Shake</span><b id="val-shake">${item.camera_shake}</b></label>
          <input class="drawer-range" type="range" min="0" max="0.45" step="0.02" id="vf-shake" value="${item.camera_shake}" />
          <label class="field-label"><span>Hit-Stop (ms)</span><b id="val-stop">${item.hit_stop_ms}ms</b></label>
          <input class="drawer-range" type="range" min="0" max="120" step="5" id="vf-stop" value="${item.hit_stop_ms}" />
          <label class="field-label"><span>Partikel Burst (GPU)</span><b id="val-part">${item.particle_count}</b></label>
          <input class="drawer-range" type="range" min="0" max="60" step="2" id="vf-part" value="${item.particle_count}" />
        </div>
      `;
    } else if (cat === 'sprites') {
      const sh = item.sheet || { cols: 1, rows: 1, fps: 8 };
      controlsHtml = `
        <div class="field-group">
          <div class="field-label"><span>Konfigurasi Sprite Sheet Karakter/Monster</span></div>
          <div class="grid-3">
            <label class="field-label" style="flex-direction:column;align-items:stretch;gap:3px">
              <span>Cols</span>
              <input class="drawer-input" type="number" min="1" max="16" id="sp-cols" value="${sh.cols}" />
            </label>
            <label class="field-label" style="flex-direction:column;align-items:stretch;gap:3px">
              <span>Rows</span>
              <input class="drawer-input" type="number" min="1" max="16" id="sp-rows" value="${sh.rows}" />
            </label>
            <label class="field-label" style="flex-direction:column;align-items:stretch;gap:3px">
              <span>FPS</span>
              <input class="drawer-input" type="number" min="1" max="30" id="sp-fps" value="${sh.fps}" />
            </label>
          </div>
          <div style="font-size:10.5px;color:#98a6b3">
            Tips: Unggah gambar PNG/WebP transparan (1×1 atau grid Sprite Sheet mis. 4×1 / 4×3) untuk langsung melihatnya berdiri di panggung 3D!
          </div>
        </div>
      `;
    } else {
      controlsHtml = `
        <div class="field-group">
          <label class="field-label"><span>Skala Paperdoll Tangan</span><b id="val-wscale">${item.scale}</b></label>
          <input class="drawer-range" type="range" min="0.5" max="2.0" step="0.05" id="wp-scale" value="${item.scale}" />
          <label class="field-label"><span>Lebar Ayunan (Swing Arc)</span><b id="val-warc">${item.swing_arc}</b></label>
          <input class="drawer-range" type="range" min="0.5" max="2.8" step="0.1" id="wp-arc" value="${item.swing_arc}" />
          <div style="font-size:10.5px;color:#98a6b3">
            Senjata otomatis terpasang & berayun saat karakter menyerang. Klik "Tes" untuk memasang & mengayunkannya!
          </div>
        </div>
      `;
    }

    body.innerHTML = `
      <div class="field-group">
        <div class="field-label">
          <span>Pilih Slot ID Manifest</span>
          <span class="status-pill ${isCustom ? 'custom' : 'proc'}">${isCustom ? '✦ Custom Aset' : 'Prosedural'}</span>
        </div>
        <select class="drawer-select" id="linker-slot-select">${optionsHtml}</select>
        <div class="path-chip">${item.asset_file}${customName ? ' (dimuat: ' + customName + ')' : ''}</div>
        <div style="display:flex;gap:6px;margin-top:2px">
          <label class="upload-label" style="flex:1">
            📂 Ganti Gambar (.webp/.png)
            <input type="file" id="linker-file-input" accept="image/*" style="display:none" />
          </label>
          <button class="btn-secondary" id="linker-reset-btn" title="Kembalikan ke fallback prosedural">↺ Reset</button>
        </div>
      </div>

      <button class="btn-primary" id="linker-test-btn" style="padding:8px">
        ${cat === 'vfx' ? '⚡ Tes Efek Ini di Panggung 3D!' : (cat === 'weapons' ? '⚔️ Pakai & Tes Ayunan Senjata!' : '🧍 Fokus & Tes Animasi Sprite!')}
      </button>

      ${controlsHtml}

      <details class="field-group">
        <summary style="cursor:pointer;font-size:11px;font-weight:700;color:#f6c368">📝 Prompt Referensi Pembuatan Aset</summary>
        <div class="prompt-box" style="margin-top:6px">${item.prompt || '-'}</div>
      </details>
    `;

    // Wire events
    document.getElementById('linker-slot-select').onchange = (e) => {
      linkerState.selectedId[cat] = e.target.value;
      renderVfxDrawer();
    };

    document.getElementById('linker-file-input').onchange = (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      vfx.loadCustomImageFile(cat, id, file, () => {
        addLog(`✦ Aset custom "${file.name}" terhubung ke slot ${cat}.${id}!`, 'sys');
        renderVfxDrawer();
        if (cat === 'vfx') testSelectedAsset(cat, id);
      });
    };

    document.getElementById('linker-reset-btn').onclick = () => {
      vfx.resetCustomAsset(cat, id);
      addLog(`↺ Slot ${cat}.${id} dikembalikan ke fallback prosedural.`, 'sys');
      renderVfxDrawer();
    };

    document.getElementById('linker-test-btn').onclick = () => testSelectedAsset(cat, id);

    if (cat === 'vfx') {
      const syncNum = (elId, fn) => {
        const el = document.getElementById(elId);
        if (el) el.oninput = () => fn(el.value);
      };
      syncNum('vf-cols', v => { item.sheet.cols = Math.max(1, Number(v) || 1); });
      syncNum('vf-rows', v => { item.sheet.rows = Math.max(1, Number(v) || 1); });
      syncNum('vf-fps', v => { item.sheet.fps = Math.max(1, Number(v) || 1); });
      syncNum('vf-color', v => { item.color = v; });
      syncNum('vf-blend', v => { item.blending = v; });
      syncNum('vf-scale', v => { item.scale = Number(v); document.getElementById('val-scale').textContent = v; });
      syncNum('vf-dur', v => { item.duration = Number(v); document.getElementById('val-dur').textContent = v + 's'; });
      syncNum('vf-shake', v => { item.camera_shake = Number(v); document.getElementById('val-shake').textContent = v; });
      syncNum('vf-stop', v => { item.hit_stop_ms = Number(v); document.getElementById('val-stop').textContent = v + 'ms'; });
      syncNum('vf-part', v => { item.particle_count = Number(v); document.getElementById('val-part').textContent = v; });
    } else if (cat === 'sprites') {
      const updateSheet = () => {
        item.sheet.cols = Math.max(1, Number(document.getElementById('sp-cols').value) || 1);
        item.sheet.rows = Math.max(1, Number(document.getElementById('sp-rows').value) || 1);
        item.sheet.fps = Math.max(1, Number(document.getElementById('sp-fps').value) || 8);
        if (item.sheet.clips) {
          Object.values(item.sheet.clips).forEach(cl => { cl.frames = item.sheet.cols; cl.fps = item.sheet.fps; });
        }
        vfx._notifyChange('sprites', id);
      };
      document.getElementById('sp-cols').oninput = updateSheet;
      document.getElementById('sp-rows').oninput = updateSheet;
      document.getElementById('sp-fps').oninput = updateSheet;
    } else if (cat === 'weapons') {
      document.getElementById('wp-scale').oninput = (e) => {
        item.scale = Number(e.target.value);
        document.getElementById('val-wscale').textContent = item.scale;
        refreshHeroSprite();
      };
      document.getElementById('wp-arc').oninput = (e) => {
        item.swing_arc = Number(e.target.value);
        document.getElementById('val-warc').textContent = item.swing_arc;
      };
    }
  }

  function testSelectedAsset(cat, id) {
    if (cat === 'vfx') {
      const targetPt = state.pos.clone().add(new THREE.Vector3(state.facing * 2.1, 0, 0));
      state.swingTimer = 0.24;
      state.lungeTimer = 0.16;
      vfx.playVFX(id, id === 'levelup_pillar' || id === 'aoe_telegraph' ? state.pos : targetPt, {
        fromPos: (id === 'bolt_lightning' || id === 'ranged_throw') ? state.pos : null,
        facing: state.facing
      });
    } else if (cat === 'weapons') {
      if (!state.player.ownedWeapons.includes(id)) state.player.ownedWeapons.push(id);
      state.player.equippedWeaponId = id;
      refreshHeroSprite();
      refreshBuildV33();
      updateHUD();
      state.swingTimer = 0.28;
      state.lungeTimer = 0.16;
      const w = getWeapon();
      const previewVfx = w.el === 'Lightning' ? 'bolt_lightning' : (w.mode === 'Jauh' ? 'ranged_throw' : 'slash_neutral');
      vfx.playVFX(previewVfx, state.pos.clone().add(new THREE.Vector3(state.facing * 2.0, 0, 0)), {
        fromPos: state.pos, facing: state.facing
      });
    } else if (cat === 'sprites') {
      state.swingTimer = 0.26;
      state.lungeTimer = 0.16;
      vfx.playVFX('aura_light', state.pos, { silentJuice: true });
      addLog(`Menampilkan pratinjau sprite ${id}. (Monster Lv.1 berada di Node Tidewrack Beach!)`, 'sys');
    }
  }

  document.getElementById('btn-copy-manifest').onclick = () => {
    const jsonText = vfx.exportManifestJSON();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(jsonText).then(() => {
        addLog('📋 JSON Manifest berhasil disalin! Tempel ke data/vfx_animation_manifest.json.', 'sys');
      }).catch(() => {
        addLog('Gagal akses clipboard otomatis — gunakan tombol Unduh JSON.', 'sys');
      });
    } else {
      addLog('Gunakan tombol Unduh JSON untuk menyimpan file manifest.', 'sys');
    }
  };

  document.getElementById('btn-download-manifest').onclick = () => {
    const blob = new Blob([vfx.exportManifestJSON()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vfx_animation_manifest.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    addLog('💾 Mengunduh vfx_animation_manifest.json (simpan ke folder data/).', 'sys');
  };

  // --------------------------------------------------------------------------
  // 10. MAIN REAL-TIME GAME LOOP (60 FPS, Hit-Stop, Shake, Billboard, AI)
  // --------------------------------------------------------------------------
  const clock = new THREE.Clock();
  let fpsFrames = 0;
  let fpsAccum = 0;
  const projVec = new THREE.Vector3();

  function updateCamera(dt) {
    let offset;
    let lookOffsetY = 1.1;

    if (state.cameraMode === 'octopath') {
      offset = new THREE.Vector3(0, 6.2, 11.2);
    } else if (state.cameraMode === 'diablo') {
      offset = new THREE.Vector3(7.5, 11.2, 8.2);
    } else {
      // 3D SWTOR / RF Online Over-the-shoulder
      offset = new THREE.Vector3(0, 3.3, 6.4);
      lookOffsetY = 1.35;
    }

    offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), state.cameraYaw);

    const desiredPos = state.pos.clone().add(offset);
    camera.position.lerp(desiredPos, Math.min(1, dt * 6.5));
    // Apply manifest-driven Camera Shake offset!
    camera.position.add(vfx.shakeOffset);
    camera.lookAt(state.pos.x + vfx.shakeOffset.x * 0.4, lookOffsetY + vfx.shakeOffset.y * 0.4, state.pos.z);
  }

  function projectToScreen(worldPos) {
    projVec.copy(worldPos).project(camera);
    const visible = projVec.z < 1 && projVec.z > -1;
    const x = (projVec.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-projVec.y * 0.5 + 0.5) * window.innerHeight;
    return { x, y, visible };
  }

  function tick(now) {
    requestAnimationFrame(tick);
    const rawDt = Math.min(0.05, clock.getDelta());
    const elapsed = clock.elapsedTime;
    // Update VFX Manager, GPU Particles, Hit-Stop & Shake
    const dt = vfx.update(rawDt, elapsed);

    // 1. CD v3.3 Timers: Anti-Spam GCD (1.3s), Individual Skill CDs, [W] CD, RF Class Buff & Destiny Timers
    let cdChanged = false;
    if (state.gcdRemaining > 0) {
      state.gcdRemaining = Math.max(0, state.gcdRemaining - rawDt);
      cdChanged = true;
    }
    if (state.weaponSkillCd > 0) {
      state.weaponSkillCd = Math.max(0, state.weaponSkillCd - rawDt);
      cdChanged = true;
    }
    for (const sId of Object.keys(state.skillCooldowns)) {
      if (state.skillCooldowns[sId] > 0) {
        state.skillCooldowns[sId] = Math.max(0, state.skillCooldowns[sId] - rawDt);
        cdChanged = true;
      }
    }
    if (state.activeClassBuffTimer > 0) {
      state.activeClassBuffTimer = Math.max(0, state.activeClassBuffTimer - rawDt);
      if (state.activeClassBuffTimer <= 0) {
        state.activeClassBuff = null;
        state.activeClassBuffName = '';
      }
      cdChanged = true;
    }
    if (state.arcaneEdgeTimer > 0) state.arcaneEdgeTimer = Math.max(0, state.arcaneEdgeTimer - rawDt);
    if (state.chronosmithIcd > 0) state.chronosmithIcd = Math.max(0, state.chronosmithIcd - rawDt);

    // 2. Player Movement (WASD / D-Pad / Click-to-Move / Idle)
    let moveX = dpadDir.x;
    let moveZ = dpadDir.z;
    if (!state.modalOpen) {
      if (keys['w'] || keys['arrowup']) moveZ -= 1;
      if (keys['s'] || keys['arrowdown']) moveZ += 1;
      if (keys['a'] || keys['arrowleft']) moveX -= 1;
      if (keys['d'] || keys['arrowright']) moveX += 1;
    }

    const speed = 5.2;
    let isMoving = false;

    if (moveX !== 0 || moveZ !== 0) {
      state.moveTarget = null;
      state.pendingInteract = null;
      const moveVec = new THREE.Vector3(moveX, 0, moveZ).normalize();
      moveVec.applyAxisAngle(new THREE.Vector3(0, 1, 0), state.cameraYaw);
      state.pos.addScaledVector(moveVec, speed * dt);
      if (Math.abs(moveVec.x) > 0.1) state.facing = moveVec.x > 0 ? 1 : -1;
      isMoving = true;
    } else if (state.moveTarget && !state.modalOpen) {
      const diff = new THREE.Vector3().subVectors(state.moveTarget, state.pos);
      diff.y = 0;
      const dist = diff.length();
      if (dist > 0.25) {
        diff.normalize();
        state.pos.addScaledVector(diff, speed * dt);
        if (Math.abs(diff.x) > 0.1) state.facing = diff.x > 0 ? 1 : -1;
        isMoving = true;
      } else {
        state.moveTarget = null;
        clickRingMesh.visible = false;
        if (state.pendingInteract) {
          const targetObj = state.pendingInteract;
          state.pendingInteract = null;
          interactWith(targetObj);
        }
      }
    }

    state.pos.x = Math.max(-12.6, Math.min(12.6, state.pos.x));
    state.pos.z = Math.max(-8.8, Math.min(8.8, state.pos.z));

    // Animate Player HD-2D Standee (Procedural Squash-Stretch + Sprite Sheet + Paperdoll Weapon Swing!)
    if (isMoving) state.walkCycle += dt * 11;
    const bob = isMoving ? Math.abs(Math.sin(state.walkCycle)) * 0.14 : Math.sin(elapsed * 2.5) * 0.03;
    const squashY = isMoving ? 1 + Math.sin(state.walkCycle * 2) * 0.045 : 1 + Math.sin(elapsed * 2.5) * 0.02;
    const squashX = 1 / Math.sqrt(squashY);
    const lunge = state.lungeTimer > 0 ? Math.sin((state.lungeTimer / 0.18) * Math.PI) * 0.45 : 0;
    if (state.lungeTimer > 0) state.lungeTimer = Math.max(0, state.lungeTimer - rawDt);

    playerActor.position.set(state.pos.x + lunge * state.facing, bob, state.pos.z);
    playerActor.userData.spriteMesh.scale.set(state.facing * squashX, squashY, 1);
    stepSpriteSheetAnim(playerActor, state.swingTimer > 0 ? 'attack' : (isMoving ? 'walk' : 'idle'), dt);

    // Paperdoll Weapon Swing Arc Animation!
    const wCfg = vfx.manifest.weapons[state.player.equippedWeaponId] || { swing_arc: 1.6 };
    if (state.swingTimer > 0) {
      state.swingTimer = Math.max(0, state.swingTimer - rawDt);
      const prog = 1 - state.swingTimer / 0.24;
      const arc = Number(wCfg.swing_arc) || 1.6;
      const angle = prog < 0.22
        ? 0.55 * (prog / 0.22)
        : 0.55 - Math.sin(((prog - 0.22) / 0.78) * Math.PI * 0.85) * arc;
      weaponPivot.rotation.z = angle;
    } else {
      weaponPivot.rotation.z = -0.22 + Math.sin(elapsed * (isMoving ? 11 : 2.6)) * (isMoving ? 0.14 : 0.05);
    }

    // 2b. Live Auto-Attack filler selama jeda GCD (1.3d) & Cooldown!
    if (!state.modalOpen && state.targetEntity && state.targetEntity.kind === 'enemy' && state.targetEntity.alive) {
      const wpn = getWeapon();
      if (state.pos.distanceTo(state.targetEntity.pos) <= wpn.range + 0.6) {
        state.autoAttackTimer -= dt;
        if (state.autoAttackTimer <= 0) {
          const aspdBonus = (state.player.stats.DEX * 1.5) + (state.activeClassBuff?.attack_speed_pct || 0) + (state.v33Build?.passiveTotals?.attack_speed_pct || 0);
          state.autoAttackTimer = Math.max(0.55, 1.25 / (1 + aspdBonus / 100));
          performAutoAttack(state.targetEntity);
        }
      }
    }

    // 3. Companion Follower & Auto-Assist (Kael)
    if (state.companion.recruited && companionActor.visible) {
      const followTarget = new THREE.Vector3(state.pos.x - 1.45 * state.facing, 0, state.pos.z + 0.9);
      const cDiff = new THREE.Vector3().subVectors(followTarget, companionActor.position);
      cDiff.y = 0;
      const cMoving = cDiff.length() > 0.35;
      if (cMoving) {
        companionActor.position.addScaledVector(cDiff.normalize(), 4.8 * dt);
        companionActor.position.y = Math.abs(Math.sin(elapsed * 9)) * 0.1;
      } else {
        companionActor.position.y = Math.sin(elapsed * 2.5 + 1) * 0.03;
      }
      companionActor.userData.spriteMesh.lookAt(camera.position.x, companionActor.position.y + 0.9, camera.position.z);
      stepSpriteSheetAnim(companionActor, cMoving ? 'walk' : 'idle', dt);

      if (state.companion.attackCd > 0) state.companion.attackCd -= dt;
      if (state.targetEntity && state.targetEntity.kind === 'enemy' && state.targetEntity.alive && state.companion.attackCd <= 0) {
        if (companionActor.position.distanceTo(state.targetEntity.pos) < 7.0) {
          state.companion.attackCd = 2.4;
          const destSig = getActiveDestinySignature();
          const compDmg = destSig.companion_mirrors_buff && state.activeClassBuffTimer > 0 ? 7 : 5;
          applyDamageToEnemy(state.targetEntity, compDmg, 'Kael ', '#6ce0d4', 'ranged_throw', true);
          if ((state.player.smithTiers.Reforger || 0) >= 1) addSmithResource('overclock', 1);
        }
      }
    }

    // 4. Idle Mode Automation (CD v3.3 Anti-Spam GCD Rotation + Latihan RF Mastery Otomatis!)
    if (state.idleMode && !state.modalOpen) {
      state.idleActionTimer -= dt;
      if (state.activeNodeId === 'tidewrack_beach') {
        const mob = (state.targetEntity && state.targetEntity.kind === 'enemy' && state.targetEntity.alive)
          ? state.targetEntity
          : findNearestEnemy();
        if (mob) {
          if (state.targetEntity !== mob) selectEntity(mob);
          const wpn = getWeapon();
          const d = state.pos.distanceTo(mob.pos);
          if (d > wpn.range) {
            const dir = new THREE.Vector3().subVectors(mob.pos, state.pos).normalize();
            state.moveTarget = mob.pos.clone().sub(dir.multiplyScalar(Math.max(1.5, wpn.range - 0.5)));
          } else if (state.gcdRemaining <= 0) {
            const build = state.v33Build || refreshBuildV33(true);
            const eq = build.equippedSkills;
            const buffIdx = eq.findIndex(s => s.role === 'Class Buff (RF)' && (state.skillCooldowns[s.id] || 0) <= 0);
            const intIdx = eq.findIndex(s => s.interrupts_cast && (state.skillCooldowns[s.id] || 0) <= 0);
            const ultIdx = eq.findIndex(s => s.tier === 5 && (state.skillCooldowns[s.id] || 0) <= 0);
            const consIdx = eq.findIndex(s => s.consumes_resource && (state.skillCooldowns[s.id] || 0) <= 0 && (state.player.resources[s.consumes_resource.id] || 0) >= 2);
            const readyIdx = eq.findIndex(s => s.role !== 'Class Buff (RF)' && (state.skillCooldowns[s.id] || 0) <= 0);

            if (buffIdx >= 0 && state.activeClassBuffTimer <= 0) triggerSkill(buffIdx);
            else if (mob.casting && intIdx >= 0) triggerSkill(intIdx);
            else if (mob.casting && intIdx < 0 && build.weaponSkill?.unlocked && state.weaponSkillCd <= 0) triggerWeaponSkill();
            else if (ultIdx >= 0) triggerSkill(ultIdx);
            else if (consIdx >= 0) triggerSkill(consIdx);
            else if (build.weaponSkill?.unlocked && state.weaponSkillCd <= 0) triggerWeaponSkill();
            else if (readyIdx >= 0) triggerSkill(readyIdx);
          }
        }
      } else if (state.activeNodeId === 'tidewrack_village' && state.idleActionTimer <= 0) {
        state.idleActionTimer = 4.0;
        state.player.bronze += 5;
        vfx.spawnParticleBurst(new THREE.Vector3(0, 0.9, -4.4), '#ff9f45', 14, 2.5, 3.4);
        grantXP('smith', 6);
        addLog('💤 Idle Bengkel: Menempa paku & reparasi alat warga (+5 br, +6 XP Smith).', 'loot');
      }
    }

    // 5. Update Entities (Monsters AI, Cast Bar + AoE Telegraph, Hit Recoil, Sprite Sheets)
    let nearestObj = null;
    let nearestDist = 999;

    nodeEntities.forEach(ent => {
      if (ent.mesh.userData && ent.mesh.userData.spriteMesh) {
        ent.mesh.userData.spriteMesh.lookAt(camera.position.x, ent.mesh.position.y + 0.9, camera.position.z);
        stepSpriteSheetAnim(ent.mesh, 'idle', dt);
      }
      if (ent.kind === 'portal' && ent.swirlMesh) {
        ent.swirlMesh.rotation.z += dt * 1.4;
      }

      if (ent.kind === 'mine' && ent.depleted) {
        ent.respawnTimer -= dt;
        if (ent.respawnTimer <= 0) {
          ent.depleted = false;
          ent.mesh.scale.set(1, 1, 1);
          ent.labelEl.textContent = '⛏️ Deposit Salt Crystal';
        }
      }

      if (ent.kind === 'enemy') {
        if (!ent.alive) {
          ent.respawnTimer -= dt;
          if (ent.respawnTimer <= 0) {
            ent.alive = true;
            ent.hp = ent.maxHp;
            ent.pos.copy(ent.homePos);
            ent.mesh.visible = true;
            ent.labelEl.style.display = 'block';
            updateEnemyLabel(ent);
          }
          return;
        }

        // Hit flash & procedural recoil squash-tilt
        if (ent.flashTimer > 0) {
          ent.flashTimer -= rawDt;
          ent.mesh.userData.spriteMat.color.setHex(ent.flashTimer > 0 ? 0xff9999 : 0xffffff);
        }
        if (ent.recoilTimer > 0) {
          ent.recoilTimer = Math.max(0, ent.recoilTimer - rawDt);
          const rec = Math.sin((ent.recoilTimer / 0.18) * Math.PI);
          ent.mesh.userData.spriteMesh.scale.set(1 + rec * 0.16, 1 - rec * 0.14, 1);
          ent.mesh.userData.spriteMesh.rotation.z = rec * 0.22;
        } else {
          const breathe = 1 + Math.sin(elapsed * 3.2 + ent.patrolPhase) * 0.03;
          ent.mesh.userData.spriteMesh.scale.set(1 / Math.sqrt(breathe), breathe, 1);
          ent.mesh.userData.spriteMesh.rotation.z = 0;
        }

        const distToPlayer = ent.pos.distanceTo(state.pos);

        if (ent.stunTimer > 0) {
          ent.stunTimer -= dt;
          vfx.syncTelegraph(ent.id, state.pos, 0, false);
        } else if (ent.casting) {
          ent.castTimer += dt;
          vfx.syncTelegraph(ent.id, state.pos, ent.castTimer / ent.castDuration, true);
          if (ent.castTimer >= ent.castDuration) {
            ent.casting = false;
            ent.castTimer = 0;
            ent.castCooldown = 7.0;
            vfx.syncTelegraph(ent.id, state.pos, 0, false);
            vfx.playVFX('bolt_lightning', state.pos, { fromPos: ent.pos });
            const dmg = Math.max(3, ent.dmg * 2 - Math.floor(state.player.stats.CON / 2));
            damagePlayer(dmg, `${ent.name} melepas ${ent.tpl.castSkill}!`);
          }
        } else if (distToPlayer < 5.6 || state.targetEntity === ent) {
          const engageRange = ent.tpl.role === 'Caster' ? 4.4 : 2.1;
          if (distToPlayer > engageRange) {
            const dir = new THREE.Vector3().subVectors(state.pos, ent.pos).normalize();
            ent.pos.addScaledVector(dir, 2.2 * dt);
          } else {
            if (ent.tpl.castSkill) {
              ent.castCooldown -= dt;
              if (ent.castCooldown <= 0) {
                ent.casting = true;
                ent.castTimer = 0;
                if (state.targetEntity !== ent) selectEntity(ent);
                const intIdx = state.v33Build ? state.v33Build.equippedSkills.findIndex(s => s.interrupts_cast) : -1;
                const hintKey = intIdx >= 0 ? `[${intIdx + 1}] ${state.v33Build.equippedSkills[intIdx].name}` : '[Q] Weapon Skill [W]';
                addLog(`⚡ ${ent.name} mulai merapal ${ent.tpl.castSkill}! Tekan ${hintKey} untuk INTERRUPT!`, 'combat');
              }
            }
            ent.attackTimer -= dt;
            if (ent.attackTimer <= 0 && !ent.casting) {
              ent.attackTimer = 1.9 / ent.spd;
              const mitigate = Math.min(Math.floor(state.player.stats.CON / 2), Math.floor(ent.dmg * 0.5));
              const guardRed = (state.player.resources.bastion_guard * 3 + (state.activeClassBuff?.dmg_reduction_pct || 0)) / 100;
              const finalDmg = Math.max(1, Math.round((ent.dmg - mitigate) * (1 - Math.min(0.6, guardRed))));
              vfx.playVFX('slash_neutral', state.pos, { silentJuice: true });
              if ((state.player.smithTiers.Armorer || 0) >= 1) addSmithResource('bastion_guard', 1);
              damagePlayer(finalDmg, `${ent.name} menyerang`);
            }
          }
        } else {
          ent.patrolPhase += dt * 0.7;
          ent.pos.x = ent.homePos.x + Math.sin(ent.patrolPhase) * 1.1;
          ent.pos.z = ent.homePos.z + Math.cos(ent.patrolPhase * 0.8) * 0.8;
        }

        ent.mesh.position.y = ent.tpl.sp === 'jellyfish'
          ? 0.35 + Math.sin(elapsed * 3 + ent.patrolPhase) * 0.16
          : Math.abs(Math.sin(elapsed * 4 + ent.patrolPhase)) * 0.05;
      }

      if (ent.kind !== 'enemy') {
        const d = state.pos.distanceTo(ent.pos);
        if (d <= ent.radius + 0.7 && d < nearestDist) {
          nearestDist = d;
          nearestObj = ent;
        }
      }

      const pPos = new THREE.Vector3(ent.pos.x, ent.labelOffsetY, ent.pos.z);
      const scr = projectToScreen(pPos);
      if (scr.visible && !(ent.kind === 'enemy' && !ent.alive)) {
        ent.labelEl.style.display = 'block';
        ent.labelEl.style.left = scr.x + 'px';
        ent.labelEl.style.top = scr.y + 'px';
      } else {
        ent.labelEl.style.display = 'none';
      }
    });

    // Update Context Interact Prompt
    state.nearestInteractable = nearestObj;
    const promptEl = document.getElementById('context-prompt');
    if (nearestObj && !state.modalOpen) {
      promptEl.classList.add('visible');
      const verb = nearestObj.kind === 'forge' ? '🔥 Buka Bengkel Tempa'
        : nearestObj.kind === 'portal' ? '🌀 Buka Gerbang Pindah Node'
        : nearestObj.kind === 'mine' ? '⛏️ Tambang Salt Crystal'
        : nearestObj.kind === 'board' ? '📜 Baca Papan Kabar'
        : `💬 Bicara dengan ${nearestObj.name}`;
      promptEl.textContent = `[E] ${verb}`;
    } else {
      promptEl.classList.remove('visible');
    }

    if (state.targetEntity && targetRingMesh.visible) {
      targetRingMesh.position.set(state.targetEntity.pos.x, 0.06, state.targetEntity.pos.z);
      targetRingMesh.rotation.z += dt * 1.5;
    }

    // Billboard hero sprite (weaponPivot inherits lookAt cleanly!)
    playerActor.userData.spriteMesh.lookAt(camera.position.x, playerActor.position.y + 0.95, camera.position.z);

    // 6. Animate Environment (Forge Flicker, Sea Shimmer, Floaters)
    if (forgeLight) {
      forgeLight.intensity = 3.1 + Math.sin(elapsed * 14) * 0.45 + Math.cos(elapsed * 23) * 0.2;
    }
    if (waterMesh) {
      waterMesh.position.y = -0.24 + Math.sin(elapsed * 1.7) * 0.04;
    }

    for (let i = activeFloaters.length - 1; i >= 0; i--) {
      const fl = activeFloaters[i];
      fl.life -= rawDt;
      fl.pos.y += rawDt * 1.1;
      const scr = projectToScreen(fl.pos);
      fl.el.style.left = scr.x + 'px';
      fl.el.style.top = scr.y + 'px';
      fl.el.style.opacity = Math.max(0, fl.life / fl.maxLife).toFixed(2);
      if (fl.life <= 0) {
        if (fl.el.parentNode) fl.el.parentNode.removeChild(fl.el);
        activeFloaters.splice(i, 1);
      }
    }

    if (state.activeNodeId === 'tidewrack_village' && state.player.hp < state.player.maxHp) {
      state.player.hp = Math.min(state.player.maxHp, state.player.hp + dt * 4);
      if (Math.random() < 0.08) updateHUD();
    }

    // 7. Camera & Render
    updateCamera(rawDt);
    renderer.render(scene, camera);

    if (cdChanged || (state.targetEntity && state.targetEntity.casting)) {
      updateHUD();
    }

    // 8. Telemetry (FPS, Draw Calls, VRAM Objects)
    fpsFrames++;
    fpsAccum += rawDt;
    if (fpsAccum >= 0.6) {
      const fps = Math.round(fpsFrames / fpsAccum);
      const info = renderer.info;
      document.getElementById('hud-telemetry').textContent =
        `${fps} FPS • Calls: ${info.render.calls} • Geo: ${info.memory.geometries} • Tex: ${info.memory.textures}`;
      fpsFrames = 0;
      fpsAccum = 0;
    }
  }

  function damagePlayer(dmg, sourceMsg) {
    const p = state.player;
    let remaining = dmg;
    if (p.barrier > 0) {
      const absorbed = Math.min(p.barrier, remaining);
      p.barrier = Math.max(0, p.barrier - absorbed);
      remaining = Math.max(0, remaining - absorbed);
    }
    p.hp = Math.max(0, Math.round(p.hp - remaining));
    vfx.shakeMag = Math.max(vfx.shakeMag, 0.12);
    spawnFloatingText(state.pos, remaining > 0 ? `-${remaining}` : 'BLOCKED!', remaining > 0 ? '#ff7875' : '#6ce0d4');
    addLog(`${sourceMsg} (-${remaining} HP${remaining < dmg ? ', ditahan Barrier' : ''}).`, 'combat');
    if (p.hp <= 0) {
      p.hp = p.maxHp;
      p.barrier = 0;
      addLog('⚠ HP habis! Mundur darurat ke Tidewrack Village (HP dipulihkan).', 'combat');
      switchNode('tidewrack_village', 'Tidewrack Village (Pulih)');
    }
    updateHUD();
  }

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // --------------------------------------------------------------------------
  // 11. BOOT INITIAL NODE: TIDEWRACK VILLAGE (Lv.1) + CD v3.3 SKILL ENGINE
  // --------------------------------------------------------------------------
  refreshBuildV33();
  applyQualityPreset();
  buildTidewrackVillage();
  playerActor.position.copy(state.pos);
  updateHUD();
  addLog('Selamat datang di Tidewrack Village (CD v3.3)! Klik "🌳 Skill & Destiny" [K] untuk uji 5 Pohon Smith, RF Mastery Lv.1-GM, & 29 Kartu Destiny, atau [Q] untuk Weapon Skill [W]!', 'sys');

  requestAnimationFrame(tick);
})();
