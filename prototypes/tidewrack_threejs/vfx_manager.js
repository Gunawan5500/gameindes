/* ============================================================================
 * BATTLE-SMITH RPG — VFX & Sprite Animation Link Manager (vfx_manager.js)
 * Menghubungkan data/vfx_animation_manifest.json <-> Three.js Scene
 * Fitur:
 *  - Auto-Fallback Prosedural (tanpa error jika aset belum dibuat)
 *  - Live Asset Override (upload .webp/.png untuk uji langsung & ekspor JSON)
 *  - Sprite Sheet Animator (cols x rows x fps) + Paperdoll Weapon Swinging
 *  - GPU Particle Pool (THREE.Points = 1 Draw Call untuk ratusan partikel!)
 *  - AoE Telegraph Decal, Hit-Stop, Camera Shake, & Dynamic Flash Light
 * ============================================================================ */
(function (global) {
  'use strict';

  const DEFAULT_MANIFEST = {
    version: '1.0.0',
    project: 'Battle-Smith RPG',
    description: 'Manifest penghubung antara ID VFX, Sprite Karakter/Monster, dan Senjata Paperdoll di Three.js Engine dengan file aset gambar (.webp/.png) di folder assets/. Bila file belum ada, engine otomatis memakai fallback prosedural.',
    folders: { vfx: 'assets/vfx/', sprites: 'assets/sprites/', weapons: 'assets/weapons/', monsters: 'assets/monsters/' },
    vfx: {
      slash_neutral: {
        label: 'Forge Strike (Tebasan Fisik)',
        asset_file: 'assets/vfx/vfx_slash_neutral.webp',
        fallback: 'slash_arc', color: '#f6c368', blending: 'additive',
        sheet: { cols: 1, rows: 1, fps: 16, loop: false },
        scale: 1.85, duration: 0.24, camera_shake: 0.08, hit_stop_ms: 22, particle_count: 14, flash_light: true,
        prompt: 'RPG melee weapon slash arc effect, glowing golden steel crescent swipe with hot forge sparks, pure black background for additive blending, crisp game VFX texture, no text'
      },
      slash_fire: {
        label: 'Searing Cleave (Tebasan Api / Proc)',
        asset_file: 'assets/vfx/vfx_slash_fire.webp',
        fallback: 'slash_arc', color: '#ff822e', blending: 'additive',
        sheet: { cols: 1, rows: 1, fps: 18, loop: false },
        scale: 2.35, duration: 0.30, camera_shake: 0.18, hit_stop_ms: 48, particle_count: 26, flash_light: true,
        prompt: 'Blazing molten fire sword cleave arc VFX, bright orange and white-hot flame trail with embers, pure black background for additive blending, game sprite sheet style, no text'
      },
      bolt_lightning: {
        label: 'Arcane Bolt / Petir (Lightning)',
        asset_file: 'assets/vfx/vfx_bolt_lightning.webp',
        fallback: 'lightning_bolt', color: '#6ce0d4', blending: 'additive',
        sheet: { cols: 1, rows: 1, fps: 20, loop: false },
        scale: 2.2, duration: 0.28, camera_shake: 0.16, hit_stop_ms: 40, particle_count: 24, flash_light: true,
        prompt: 'Crackling cyan-blue electric lightning strike bolt VFX, sharp jagged arcane plasma beam, pure black background for additive blending, crisp RPG spell texture, no text'
      },
      impact_ice: {
        label: 'Frost Shatter (Ledakan Es)',
        asset_file: 'assets/vfx/vfx_impact_ice.webp',
        fallback: 'shockwave', color: '#78d5ff', blending: 'additive',
        sheet: { cols: 1, rows: 1, fps: 16, loop: false },
        scale: 2.1, duration: 0.34, camera_shake: 0.14, hit_stop_ms: 38, particle_count: 22, flash_light: true,
        prompt: 'Shattering glacial ice nova shockwave ring VFX, sharp frost crystals radiating outward, pale icy blue glow, pure black background for additive blending, no text'
      },
      impact_earth: {
        label: 'Earthbreaker (Hentakan Tanah)',
        asset_file: 'assets/vfx/vfx_impact_earth.webp',
        fallback: 'shockwave', color: '#d4a259', blending: 'additive',
        sheet: { cols: 1, rows: 1, fps: 14, loop: false },
        scale: 2.4, duration: 0.36, camera_shake: 0.24, hit_stop_ms: 55, particle_count: 28, flash_light: false,
        prompt: 'Heavy earth slam impact shockwave ring with golden-brown dust cracks and rock splinters, pure black background for additive blending, RPG VFX texture, no text'
      },
      aura_light: {
        label: 'Conscience Mulia (Cahaya Radiant)',
        asset_file: 'assets/vfx/vfx_aura_light.webp',
        fallback: 'star_burst', color: '#fff0a6', blending: 'additive',
        sheet: { cols: 1, rows: 1, fps: 14, loop: false },
        scale: 2.1, duration: 0.40, camera_shake: 0.08, hit_stop_ms: 25, particle_count: 20, flash_light: true,
        prompt: 'Radiant golden starburst holy light pulse VFX, soft warm sun rays and runes, pure black background for additive blending, fantasy RPG effect, no text'
      },
      aura_dark: {
        label: 'Conscience Kejam (Gelombang Blight)',
        asset_file: 'assets/vfx/vfx_aura_dark.webp',
        fallback: 'shockwave', color: '#d94e5a', blending: 'additive',
        sheet: { cols: 1, rows: 1, fps: 14, loop: false },
        scale: 2.2, duration: 0.38, camera_shake: 0.14, hit_stop_ms: 35, particle_count: 22, flash_light: true,
        prompt: 'Dark crimson necrotic energy pulse ring VFX, sinister jagged ember wisps, pure black background for additive blending, dark fantasy RPG effect, no text'
      },
      interrupt_shock: {
        label: 'Pommel Bash (SWTOR Interrupt Ring)',
        asset_file: 'assets/vfx/vfx_interrupt_shock.webp',
        fallback: 'shockwave', color: '#5cf2e2', blending: 'additive',
        sheet: { cols: 1, rows: 1, fps: 20, loop: false },
        scale: 2.6, duration: 0.34, camera_shake: 0.26, hit_stop_ms: 65, particle_count: 30, flash_light: true,
        prompt: 'High-contrast turquoise kinetic shockwave ring VFX for spell interrupt, crisp concentric energy ripples and sparks, pure black background for additive blending, no text'
      },
      crit_spark: {
        label: 'Critical / Weakness Exploit Burst',
        asset_file: 'assets/vfx/vfx_crit_spark.webp',
        fallback: 'star_burst', color: '#ffe066', blending: 'additive',
        sheet: { cols: 1, rows: 1, fps: 20, loop: false },
        scale: 2.2, duration: 0.28, camera_shake: 0.20, hit_stop_ms: 55, particle_count: 24, flash_light: true,
        prompt: 'Sharp golden-white critical hit starburst flare VFX, dramatic anime/HD-2D RPG impact cross flash, pure black background for additive blending, no text'
      },
      aoe_telegraph: {
        label: 'AoE Cast Telegraph (Lingkaran Bahaya)',
        asset_file: 'assets/vfx/vfx_aoe_telegraph.webp',
        fallback: 'telegraph_ring', color: '#df544c', blending: 'additive',
        sheet: { cols: 1, rows: 1, fps: 12, loop: true },
        scale: 3.4, duration: 2.8, camera_shake: 0.0, hit_stop_ms: 0, particle_count: 0, flash_light: false,
        prompt: 'Top-down glowing crimson tactical RPG magic danger circle telegraph decal, crisp outer rune border, pure black background for additive blending, no text'
      },
      ranged_throw: {
        label: 'Proyektil Jauh (Rangesmith Throw)',
        asset_file: 'assets/vfx/vfx_ranged_throw.webp',
        fallback: 'projectile_blade', color: '#d6e6f2', blending: 'additive',
        sheet: { cols: 1, rows: 1, fps: 18, loop: true },
        scale: 1.0, duration: 0.22, camera_shake: 0.06, hit_stop_ms: 18, particle_count: 10, flash_light: false,
        prompt: 'Glowing silver throwing dagger spinning blur projectile VFX with light streak, pure black background for additive blending, RPG ranged attack sprite, no text'
      },
      levelup_pillar: {
        label: 'Level Up / Resonance Pillar',
        asset_file: 'assets/vfx/vfx_levelup_pillar.webp',
        fallback: 'pillar_glow', color: '#f6c368', blending: 'additive',
        sheet: { cols: 1, rows: 1, fps: 14, loop: false },
        scale: 2.5, duration: 0.95, camera_shake: 0.14, hit_stop_ms: 0, particle_count: 42, flash_light: true,
        prompt: 'Vertical golden beam of ascending light pillar VFX with swirling forge runes, pure black background for additive blending, RPG level up effect, no text'
      }
    },
    sprites: {
      hero_smith: {
        label: 'Karakter Utama (Pandai Besi)',
        asset_file: 'assets/sprites/hero_smith_sheet.webp', fallback: 'hero',
        scale_w: 1.7, scale_h: 1.9,
        sheet: { cols: 1, rows: 1, fps: 8, clips: { idle: { row: 0, frames: 1, fps: 6 }, walk: { row: 0, frames: 1, fps: 10 }, attack: { row: 0, frames: 1, fps: 14 } } },
        prompt: 'HD-2D RPG character sprite cutout of a medieval battle-smith wearing leather apron and iron pauldron, standing pose, transparent background, Octopath Traveler pixel-painted aesthetic'
      },
      companion_kael: {
        label: 'Companion Murid (Kael — Elf Scout)',
        asset_file: 'assets/sprites/companion_kael_sheet.webp', fallback: 'kael',
        scale_w: 1.55, scale_h: 1.8,
        sheet: { cols: 1, rows: 1, fps: 8, clips: { idle: { row: 0, frames: 1, fps: 6 }, walk: { row: 0, frames: 1, fps: 10 }, attack: { row: 0, frames: 1, fps: 14 } } },
        prompt: 'HD-2D RPG character sprite cutout of an agile young elf scout apprentice in emerald coastal cloak holding a short spear, transparent background, Octopath Traveler aesthetic'
      },
      npc_brann: {
        label: 'NPC Master Brann (Dwarf Mentor)',
        asset_file: 'assets/sprites/npc_brann_sheet.webp', fallback: 'brann',
        scale_w: 1.65, scale_h: 1.75,
        sheet: { cols: 1, rows: 1, fps: 6, clips: { idle: { row: 0, frames: 1, fps: 6 } } },
        prompt: 'HD-2D RPG NPC sprite cutout of a stout dwarf master blacksmith with braided orange-grey beard and heavy forge hammer, transparent background'
      },
      npc_mira: {
        label: 'NPC Mira Saltvein (Pedagang S&D)',
        asset_file: 'assets/sprites/npc_mira_sheet.webp', fallback: 'mira',
        scale_w: 1.55, scale_h: 1.82,
        sheet: { cols: 1, rows: 1, fps: 6, clips: { idle: { row: 0, frames: 1, fps: 6 } } },
        prompt: 'HD-2D RPG NPC sprite cutout of a sharp-eyed coastal merchant informant woman wearing teal cloak, gold sash, holding brass lantern, transparent background'
      },
      mob_crab: {
        label: 'Monster: Runt Beach Crab (Lv.1 Tank)',
        asset_file: 'assets/monsters/saltgrave_coast/sp_beach_crab.webp', fallback: 'crab',
        scale_w: 1.55, scale_h: 1.7,
        sheet: { cols: 1, rows: 1, fps: 6, clips: { idle: { row: 0, frames: 1, fps: 6 } } },
        prompt: 'HD-2D RPG monster sprite cutout of an armored crimson beach crab with barnacles and massive heavy claws, transparent background'
      },
      mob_gull: {
        label: 'Monster: Runt Sand Gull (Lv.1 Skirmisher)',
        asset_file: 'assets/monsters/saltgrave_coast/sp_sand_gull.webp', fallback: 'gull',
        scale_w: 1.55, scale_h: 1.7,
        sheet: { cols: 1, rows: 1, fps: 8, clips: { idle: { row: 0, frames: 1, fps: 8 } } },
        prompt: 'HD-2D RPG monster sprite cutout of a fierce oversized coastal gull with razor beak and outstretched wings, transparent background'
      },
      mob_scavenger: {
        label: 'Monster: Runt Tide Scavenger (Lv.1 Skirmisher)',
        asset_file: 'assets/monsters/saltgrave_coast/sp_tide_scavenger.webp', fallback: 'scavenger',
        scale_w: 1.55, scale_h: 1.7,
        sheet: { cols: 1, rows: 1, fps: 7, clips: { idle: { row: 0, frames: 1, fps: 7 } } },
        prompt: 'HD-2D RPG monster sprite cutout of a ragged hooded pier scavenger bandit wielding a salt-rusted curved dagger, transparent background'
      },
      mob_jellyfish: {
        label: 'Monster Elite: Runt Jellyfish Drifter (Lv.1 Lightning)',
        asset_file: 'assets/monsters/saltgrave_coast/sp_jellyfish_drifter.webp', fallback: 'jellyfish',
        scale_w: 1.9, scale_h: 2.1,
        sheet: { cols: 1, rows: 1, fps: 8, clips: { idle: { row: 0, frames: 1, fps: 8 } } },
        prompt: 'HD-2D RPG elite monster sprite cutout of a floating bioluminescent cyan electric jellyfish drifter with crackling lightning tendrils, transparent background'
      }
    },
    weapons: {
      wpn_starter_hammer: {
        label: 'Palu Besi Tua (Paperdoll Tangan)',
        asset_file: 'assets/weapons/wpn_starter_hammer.webp', fallback: 'hammer',
        scale: 1.05, swing_arc: 1.6, glow_color: '#f6a844',
        prompt: 'Single RPG blacksmith iron forge hammer weapon icon sprite, angled upright, glowing heated edge, transparent background'
      },
      wpn_str_axe: {
        label: 'Kapak Perang Tidewrack (Paperdoll Tangan)',
        asset_file: 'assets/weapons/wpn_str_axe.webp', fallback: 'axe',
        scale: 1.2, swing_arc: 1.9, glow_color: '#ff8c38',
        prompt: 'Single dark fantasy bearded battle axe weapon sprite, heavy forged iron blade with warm amber edge, transparent background'
      },
      wpn_dex_knives: {
        label: 'Pisau Lempar Kembar (Paperdoll Tangan)',
        asset_file: 'assets/weapons/wpn_dex_knives.webp', fallback: 'knives',
        scale: 0.95, swing_arc: 1.2, glow_color: '#d8e7f5',
        prompt: 'Single sleek curved silver throwing dagger weapon sprite for RPG ranger, gleaming steel tip, transparent background'
      },
      wpn_int_staff: {
        label: 'Tongkat Rune Petir (Paperdoll Tangan)',
        asset_file: 'assets/weapons/wpn_int_staff.webp', fallback: 'staff',
        scale: 1.25, swing_arc: 1.1, glow_color: '#6ce0d4',
        prompt: 'Single arcane runic staff weapon sprite topped with a glowing cyan salt-lightning crystal orb, transparent background'
      }
    }
  };

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function makeCanvasTexture(size, drawFn) {
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const ctx = c.getContext('2d');
    drawFn(ctx, size);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  // --------------------------------------------------------------------------
  // Procedural VFX & Weapon Texture Generators (White/Alpha so color tint works!)
  // --------------------------------------------------------------------------
  function buildProceduralVFXTexture(kind) {
    return makeCanvasTexture(256, (ctx, s) => {
      ctx.clearRect(0, 0, s, s);
      const cx = s / 2, cy = s / 2;

      if (kind === 'slash_arc') {
        // Dramatic glowing crescent slash swipe (Octopath / SWTOR style)
        ctx.save();
        ctx.translate(cx, cy);
        const grad = ctx.createRadialGradient(0, 0, 32, 0, 0, 118);
        grad.addColorStop(0, 'rgba(255,255,255,0)');
        grad.addColorStop(0.58, 'rgba(255,255,255,0.22)');
        grad.addColorStop(0.84, 'rgba(255,255,255,0.95)');
        grad.addColorStop(0.95, 'rgba(255,255,255,0.45)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, 116, -Math.PI * 0.72, Math.PI * 0.42);
        ctx.arc(-14, 6, 86, Math.PI * 0.42, -Math.PI * 0.72, true);
        ctx.closePath();
        ctx.fill();

        // White-hot razor leading edge
        ctx.strokeStyle = 'rgba(255,255,255,0.98)';
        ctx.lineWidth = 7;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(0, 0, 102, -Math.PI * 0.65, Math.PI * 0.36);
        ctx.stroke();

        // Trailing sparks along arc
        for (let i = 0; i < 12; i++) {
          const ang = -Math.PI * 0.65 + (i / 11) * Math.PI * 0.98;
          const r = 82 + (i % 3) * 14;
          ctx.fillStyle = 'rgba(255,255,255,0.85)';
          ctx.beginPath();
          ctx.arc(Math.cos(ang) * r, Math.sin(ang) * r, 3.2 - (i % 2), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      } else if (kind === 'lightning_bolt') {
        // Jagged crackling electric arc with halo glow
        ctx.save();
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 18;
        const pts = [[24, 128], [68, 96], [94, 146], [134, 88], [172, 142], [208, 104], [236, 128]];
        // Outer glow stroke
        ctx.strokeStyle = 'rgba(255,255,255,0.45)';
        ctx.lineWidth = 18;
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath();
        pts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
        ctx.stroke();
        // Inner white core
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 6;
        ctx.stroke();
        // Side forks
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(94, 146); ctx.lineTo(114, 184); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(134, 88); ctx.lineTo(156, 52); ctx.stroke();
        ctx.restore();
      } else if (kind === 'shockwave') {
        // Concentric runic impact wave ring
        const g = ctx.createRadialGradient(cx, cy, 48, cx, cy, 118);
        g.addColorStop(0, 'rgba(255,255,255,0)');
        g.addColorStop(0.65, 'rgba(255,255,255,0.18)');
        g.addColorStop(0.84, 'rgba(255,255,255,0.95)');
        g.addColorStop(0.95, 'rgba(255,255,255,0.3)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(cx, cy, 118, 0, Math.PI * 2); ctx.fill();

        // Inner crisp ring + radial ticks
        ctx.strokeStyle = 'rgba(255,255,255,0.9)';
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(cx, cy, 78, 0, Math.PI * 2); ctx.stroke();
        for (let i = 0; i < 16; i++) {
          const a = (i / 16) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a) * 80, cy + Math.sin(a) * 80);
          ctx.lineTo(cx + Math.cos(a) * 108, cy + Math.sin(a) * 108);
          ctx.stroke();
        }
      } else if (kind === 'star_burst') {
        // High-impact HD-2D critical flare starburst
        const g = ctx.createRadialGradient(cx, cy, 4, cx, cy, 108);
        g.addColorStop(0, 'rgba(255,255,255,1)');
        g.addColorStop(0.3, 'rgba(255,255,255,0.75)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(cx, cy, 108, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 8; i++) {
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate((i * Math.PI) / 4);
          const len = i % 2 === 0 ? 116 : 74;
          const wid = i % 2 === 0 ? 11 : 6;
          ctx.beginPath();
          ctx.moveTo(0, -len); ctx.lineTo(wid, 0); ctx.lineTo(0, len); ctx.lineTo(-wid, 0);
          ctx.closePath(); ctx.fill();
          ctx.restore();
        }
      } else if (kind === 'telegraph_ring') {
        // Enemy AoE Cast Telegraph Circle (SWTOR / FFXIV style)
        const g = ctx.createRadialGradient(cx, cy, 20, cx, cy, 118);
        g.addColorStop(0, 'rgba(255,255,255,0.12)');
        g.addColorStop(0.82, 'rgba(255,255,255,0.34)');
        g.addColorStop(0.94, 'rgba(255,255,255,0.95)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(cx, cy, 118, 0, Math.PI * 2); ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 6;
        ctx.setLineDash([16, 10]);
        ctx.beginPath(); ctx.arc(cx, cy, 108, 0, Math.PI * 2); ctx.stroke();
      } else if (kind === 'projectile_blade') {
        // Spinning gleaming throwing dagger blur
        ctx.save();
        ctx.translate(cx, cy);
        const g = ctx.createRadialGradient(0, 0, 8, 0, 0, 96);
        g.addColorStop(0, 'rgba(255,255,255,0.95)');
        g.addColorStop(0.55, 'rgba(255,255,255,0.35)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(0, 0, 96, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 2; i++) {
          ctx.rotate(Math.PI);
          ctx.beginPath();
          ctx.moveTo(0, -96); ctx.lineTo(24, -18); ctx.lineTo(0, 12); ctx.lineTo(-14, -22);
          ctx.closePath(); ctx.fill();
        }
        ctx.restore();
      } else if (kind === 'pillar_glow') {
        // Vertical radiant Level-Up / Resonance Pillar
        const g = ctx.createLinearGradient(0, 0, s, 0);
        g.addColorStop(0, 'rgba(255,255,255,0)');
        g.addColorStop(0.28, 'rgba(255,255,255,0.28)');
        g.addColorStop(0.5, 'rgba(255,255,255,0.98)');
        g.addColorStop(0.72, 'rgba(255,255,255,0.28)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 12, s, s - 24);
        // Horizontal rune streaks
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        for (let y = 36; y < s - 36; y += 34) {
          ctx.fillRect(cx - 46, y, 92, 4);
        }
      } else {
        // Soft glowing particle dot
        const g = ctx.createRadialGradient(cx, cy, 2, cx, cy, 112);
        g.addColorStop(0, 'rgba(255,255,255,1)');
        g.addColorStop(0.4, 'rgba(255,255,255,0.65)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(cx, cy, 112, 0, Math.PI * 2); ctx.fill();
      }
    });
  }

  function buildProceduralWeaponTexture(kind) {
    return makeCanvasTexture(128, (ctx) => {
      ctx.clearRect(0, 0, 128, 128);
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#0c1015';
      ctx.lineWidth = 5;

      // Weapon centered around bottom-center pivot so swing rotation feels natural!
      if (kind === 'hammer') {
        ctx.fillStyle = '#5e3d24';
        ctx.fillRect(58, 34, 12, 82); ctx.strokeRect(58, 34, 12, 82);
        ctx.fillStyle = '#a4b7c7';
        ctx.beginPath(); ctx.roundRect(32, 16, 64, 30, 6); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#f6a844';
        ctx.fillRect(36, 22, 56, 7);
      } else if (kind === 'axe') {
        ctx.fillStyle = '#4e311d';
        ctx.fillRect(59, 26, 10, 90); ctx.strokeRect(59, 26, 10, 90);
        // Heavy bearded battle axe blade
        ctx.fillStyle = '#b8c8d6';
        ctx.beginPath();
        ctx.moveTo(64, 18); ctx.quadraticCurveTo(106, 12, 108, 46); ctx.quadraticCurveTo(96, 74, 66, 62);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        // Hot tempered orange edge
        ctx.strokeStyle = '#ff9234'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(103, 24); ctx.quadraticCurveTo(109, 46, 94, 65); ctx.stroke();
      } else if (kind === 'knives') {
        // Gleaming curved throwing dagger
        ctx.fillStyle = '#4a3525';
        ctx.fillRect(59, 76, 10, 34); ctx.strokeRect(59, 76, 10, 34);
        ctx.fillStyle = '#e29b38';
        ctx.fillRect(46, 72, 36, 8); ctx.strokeRect(46, 72, 36, 8);
        ctx.fillStyle = '#d9e7f2';
        ctx.beginPath();
        ctx.moveTo(64, 12); ctx.quadraticCurveTo(84, 42, 74, 72); ctx.lineTo(54, 72); ctx.quadraticCurveTo(56, 40, 64, 12);
        ctx.closePath(); ctx.fill(); ctx.stroke();
      } else {
        // Arcane Runesmith Lightning Staff
        ctx.fillStyle = '#4b3b2c';
        ctx.fillRect(59, 38, 10, 80); ctx.strokeRect(59, 38, 10, 80);
        // Rune prongs
        ctx.strokeStyle = '#8fa4b5'; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.arc(64, 30, 20, Math.PI * 0.15, Math.PI * 0.85, true); ctx.stroke();
        // Glowing Salt-Lightning Orb
        const g = ctx.createRadialGradient(64, 28, 3, 64, 28, 22);
        g.addColorStop(0, '#ffffff'); g.addColorStop(0.5, '#6ce0d4'); g.addColorStop(1, 'rgba(108,224,212,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(64, 28, 22, 0, Math.PI * 2); ctx.fill();
      }
    });
  }

  // --------------------------------------------------------------------------
  // Main BattleSmithVFX Class
  // --------------------------------------------------------------------------
  class BattleSmithVFXManager {
    constructor(scene, camera) {
      this.scene = scene;
      this.camera = camera;
      this.manifest = deepClone(DEFAULT_MANIFEST);
      this.vfxRoot = new THREE.Group();
      scene.add(this.vfxRoot);

      // Texture caches & user custom overrides
      this.proceduralVFXCache = {};
      this.proceduralWeaponCache = {};
      this.customTextures = { vfx: {}, sprites: {}, weapons: {} }; // { id: { tex, filename } }
      this.onAssetChangedCallbacks = [];

      // Active animated VFX meshes & telegraphs
      this.activeVFX = [];
      this.telegraphMap = new Map(); // entityId -> { group, outerMesh, fillMesh, vfxId }

      // Screen juice state (Hit-Stop, Camera Shake, Dynamic Flash Light)
      this.hitStopTimer = 0;
      this.shakeMag = 0;
      this.shakeOffset = new THREE.Vector3();
      this.flashLight = new THREE.PointLight(0xffb454, 0, 14, 1.5);
      this.flashLight.position.set(0, -100, 0);
      this.vfxRoot.add(this.flashLight);
      this.flashTimer = 0;
      this.flashDuration = 0.15;
      this.ultraEnabled = true;

      // GPU Particle Pool (THREE.Points — 1 Draw Call for up to 260 Burst Particles!)
      this.particleTex = buildProceduralVFXTexture('particle_soft');
      this._initBurstParticles(260);
      this._initAmbientParticles(90);

      // Try loading external data/vfx_animation_manifest.json if served via HTTP
      this._tryFetchManifest();
    }

    _tryFetchManifest() {
      if (typeof fetch !== 'function' || location.protocol === 'file:') return;
      fetch('../../data/vfx_animation_manifest.json')
        .then(r => (r.ok ? r.json() : null))
        .then(json => {
          if (json && json.vfx && json.sprites && json.weapons) {
            this.manifest = json;
            this._notifyChange('manifest', null);
          }
        })
        .catch(() => { /* Silent fallback to embedded DEFAULT_MANIFEST */ });
    }

    onAssetChange(fn) {
      this.onAssetChangedCallbacks.push(fn);
    }

    _notifyChange(category, id) {
      this.onAssetChangedCallbacks.forEach(fn => fn(category, id));
    }

    setUltraQuality(isUltra) {
      this.ultraEnabled = Boolean(isUltra);
      if (!this.ultraEnabled) this.flashLight.intensity = 0;
    }

    // --- GPU Burst Particle System (1 Draw Call!) ---
    _initBurstParticles(maxCount) {
      this.maxBurst = maxCount;
      this.burstData = [];
      const positions = new Float32Array(maxCount * 3);
      const colors = new Float32Array(maxCount * 3);
      for (let i = 0; i < maxCount; i++) {
        positions[i * 3 + 1] = -999;
        this.burstData.push({
          alive: false, life: 0, maxLife: 1,
          vx: 0, vy: 0, vz: 0, gravity: 6.5, r: 1, g: 1, b: 1
        });
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      const mat = new THREE.PointsMaterial({
        size: 0.42,
        map: this.particleTex,
        vertexColors: true,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true
      });
      this.burstPoints = new THREE.Points(geo, mat);
      this.burstPoints.frustumCulled = false;
      this.vfxRoot.add(this.burstPoints);
    }

    spawnParticleBurst(worldPos, colorHex, count, spreadSpeed, riseBias) {
      const actualCount = this.ultraEnabled ? count : Math.ceil(count * 0.55);
      if (actualCount <= 0) return;
      const col = new THREE.Color(colorHex || '#f6c368');
      const posAttr = this.burstPoints.geometry.attributes.position;
      const colAttr = this.burstPoints.geometry.attributes.color;
      let spawned = 0;
      for (let i = 0; i < this.maxBurst && spawned < actualCount; i++) {
        const d = this.burstData[i];
        if (d.alive) continue;
        d.alive = true;
        d.maxLife = 0.28 + Math.random() * 0.42;
        d.life = d.maxLife;
        const ang = Math.random() * Math.PI * 2;
        const spd = (spreadSpeed || 3.8) * (0.35 + Math.random() * 0.85);
        d.vx = Math.cos(ang) * spd;
        d.vz = Math.sin(ang) * spd;
        d.vy = (riseBias || 2.8) + Math.random() * 3.2;
        d.gravity = riseBias > 3.5 ? 2.5 : 8.5;
        d.r = col.r; d.g = col.g; d.b = col.b;
        posAttr.setXYZ(i, worldPos.x, (worldPos.y || 0) + 0.85 + Math.random() * 0.4, worldPos.z);
        colAttr.setXYZ(i, col.r, col.g, col.b);
        spawned++;
      }
      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;
    }

    // --- GPU Ambient Node Particles (1 Draw Call for embers / sea mist!) ---
    _initAmbientParticles(maxCount) {
      this.maxAmbient = maxCount;
      this.ambientActiveCount = 0;
      this.ambientData = [];
      const positions = new Float32Array(maxCount * 3);
      for (let i = 0; i < maxCount; i++) {
        positions[i * 3 + 1] = -999;
        this.ambientData.push({ ox: 0, oz: 0, y: -999, speedY: 0.4, phase: 0, maxY: 4.5 });
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const mat = new THREE.PointsMaterial({
        size: 0.32,
        map: this.particleTex,
        color: 0xff9f45,
        transparent: true,
        opacity: 0.78,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true
      });
      this.ambientPoints = new THREE.Points(geo, mat);
      this.ambientPoints.frustumCulled = false;
      this.vfxRoot.add(this.ambientPoints);
    }

    configureAmbientParticles(colorHex, count, spreadX, spreadZ, riseSpeed) {
      const actual = Math.min(this.maxAmbient, this.ultraEnabled ? count : Math.ceil(count * 0.5));
      this.ambientActiveCount = actual;
      this.ambientPoints.material.color.setHex(colorHex);
      const posAttr = this.ambientPoints.geometry.attributes.position;
      for (let i = 0; i < this.maxAmbient; i++) {
        const d = this.ambientData[i];
        if (i < actual) {
          d.ox = (Math.random() - 0.5) * spreadX;
          d.oz = (Math.random() - 0.5) * spreadZ;
          d.y = 0.25 + Math.random() * 4.0;
          d.speedY = riseSpeed * (0.65 + Math.random() * 0.75);
          d.phase = Math.random() * Math.PI * 2;
          d.maxY = 4.6;
          posAttr.setXYZ(i, d.ox, d.y, d.oz);
        } else {
          d.y = -999;
          posAttr.setXYZ(i, 0, -999, 0);
        }
      }
      posAttr.needsUpdate = true;
    }

    // --- Texture Resolution (Custom Override -> Procedural Fallback) ---
    getVFXTexture(vfxId) {
      if (this.customTextures.vfx[vfxId]) {
        return this.customTextures.vfx[vfxId].tex;
      }
      const cfg = this.manifest.vfx[vfxId];
      const fb = (cfg && cfg.fallback) || 'slash_arc';
      if (!this.proceduralVFXCache[fb]) {
        this.proceduralVFXCache[fb] = buildProceduralVFXTexture(fb);
      }
      return this.proceduralVFXCache[fb];
    }

    getWeaponTexture(weaponId) {
      if (this.customTextures.weapons[weaponId]) {
        return this.customTextures.weapons[weaponId].tex;
      }
      const cfg = this.manifest.weapons[weaponId];
      const fb = (cfg && cfg.fallback) || 'hammer';
      if (!this.proceduralWeaponCache[fb]) {
        this.proceduralWeaponCache[fb] = buildProceduralWeaponTexture(fb);
      }
      return this.proceduralWeaponCache[fb];
    }

    getCustomSpriteTexture(spriteId) {
      return this.customTextures.sprites[spriteId] ? this.customTextures.sprites[spriteId].tex : null;
    }

    isCustom(category, id) {
      return Boolean(this.customTextures[category] && this.customTextures[category][id]);
    }

    getCustomFilename(category, id) {
      return this.isCustom(category, id) ? this.customTextures[category][id].filename : null;
    }

    loadCustomImageFile(category, id, file, onDone) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const tex = new THREE.Texture(img);
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.needsUpdate = true;
          tex.magFilter = THREE.LinearFilter;
          tex.minFilter = THREE.LinearMipmapLinearFilter;

          // Configure Sprite Sheet repeat if defined
          const entry = this.manifest[category] && this.manifest[category][id];
          if (entry && entry.sheet) {
            const cols = Math.max(1, Number(entry.sheet.cols) || 1);
            const rows = Math.max(1, Number(entry.sheet.rows) || 1);
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            tex.repeat.set(1 / cols, 1 / rows);
          }

          if (this.customTextures[category][id] && this.customTextures[category][id].tex) {
            this.customTextures[category][id].tex.dispose();
          }
          this.customTextures[category][id] = { tex, filename: file.name };
          if (entry) {
            const folder = this.manifest.folders[category] || 'assets/';
            entry.asset_file = folder + file.name;
          }
          this._notifyChange(category, id);
          if (onDone) onDone(tex);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }

    resetCustomAsset(category, id) {
      if (this.customTextures[category] && this.customTextures[category][id]) {
        this.customTextures[category][id].tex.dispose();
        delete this.customTextures[category][id];
      }
      // Restore default sheet cols/rows if resetting
      if (DEFAULT_MANIFEST[category] && DEFAULT_MANIFEST[category][id]) {
        this.manifest[category][id] = deepClone(DEFAULT_MANIFEST[category][id]);
      }
      this._notifyChange(category, id);
    }

    applySpriteSheetConfig(tex, cols, rows, frameIdx, rowIdx) {
      if (!tex) return;
      const c = Math.max(1, Math.round(cols || 1));
      const r = Math.max(1, Math.round(rows || 1));
      tex.repeat.set(1 / c, 1 / r);
      const fi = ((frameIdx || 0) % c + c) % c;
      const ri = Math.max(0, Math.min(r - 1, rowIdx || 0));
      tex.offset.x = fi / c;
      tex.offset.y = (r - 1 - ri) / r;
    }

    // --- Play Manifest-Driven 3D VFX ---
    playVFX(vfxId, targetPos, opts) {
      const cfg = this.manifest.vfx[vfxId] || this.manifest.vfx.slash_neutral;
      const options = opts || {};
      const baseTex = this.getVFXTexture(vfxId);
      // Clone texture handle for independent sprite-sheet offset animation
      const tex = baseTex.clone();
      tex.needsUpdate = true;

      const cols = Math.max(1, Number(cfg.sheet && cfg.sheet.cols) || 1);
      const rows = Math.max(1, Number(cfg.sheet && cfg.sheet.rows) || 1);
      this.applySpriteSheetConfig(tex, cols, rows, 0, 0);

      const isAdditive = cfg.blending !== 'normal';
      const mat = new THREE.MeshBasicMaterial({
        map: tex,
        color: new THREE.Color(cfg.color || '#ffffff'),
        transparent: true,
        opacity: 1.0,
        blending: isAdditive ? THREE.AdditiveBlending : THREE.NormalBlending,
        depthWrite: false,
        side: THREE.DoubleSide
      });

      const scale = Number(cfg.scale) || 1.8;
      const duration = Math.max(0.08, Number(cfg.duration) || 0.28);
      const isBolt = cfg.fallback === 'lightning_bolt' || vfxId === 'bolt_lightning';
      const isProjectile = cfg.fallback === 'projectile_blade' || Boolean(options.fromPos && !isBolt);
      const isPillar = cfg.fallback === 'pillar_glow' || vfxId === 'levelup_pillar';
      const isRing = cfg.fallback === 'shockwave' || cfg.fallback === 'telegraph_ring';

      let geo;
      if (isPillar) geo = new THREE.PlaneGeometry(scale, scale * 2.1);
      else if (isBolt && options.fromPos) {
        const len = Math.max(2.0, options.fromPos.distanceTo(targetPos));
        geo = new THREE.PlaneGeometry(len, scale * 0.65);
      } else {
        geo = new THREE.PlaneGeometry(scale, scale);
      }

      const mesh = new THREE.Mesh(geo, mat);
      const pos = targetPos.clone();

      if (isPillar) {
        mesh.position.set(pos.x, scale * 1.05, pos.z);
      } else if (isRing) {
        mesh.position.set(pos.x, 0.14, pos.z);
        mesh.rotation.x = -Math.PI / 2;
      } else if (isBolt && options.fromPos) {
        const mid = new THREE.Vector3().addVectors(options.fromPos, pos).multiplyScalar(0.5);
        mesh.position.set(mid.x, 1.05, mid.z);
        mesh.rotation.x = -Math.PI / 4;
        mesh.rotation.z = -Math.atan2(pos.z - options.fromPos.z, pos.x - options.fromPos.x);
      } else if (isProjectile && options.fromPos) {
        mesh.position.set(options.fromPos.x, 1.05, options.fromPos.z);
      } else {
        mesh.position.set(pos.x, 1.02, pos.z);
      }

      this.vfxRoot.add(mesh);

      this.activeVFX.push({
        mesh,
        tex,
        cfg,
        life: duration,
        maxLife: duration,
        cols,
        rows,
        fps: Math.max(1, Number(cfg.sheet && cfg.sheet.fps) || 16),
        frameAcc: 0,
        frameIdx: 0,
        isRing,
        isPillar,
        isBolt,
        isProjectile,
        fromPos: options.fromPos ? options.fromPos.clone() : null,
        toPos: pos.clone(),
        spin: cfg.fallback === 'slash_arc' ? (options.facing || 1) * 2.8 : (isProjectile ? 14 : 0)
      });

      // Trigger GPU Particle Burst
      const pCount = Number(cfg.particle_count) || 0;
      if (pCount > 0) {
        this.spawnParticleBurst(pos, cfg.color, pCount, isPillar ? 2.6 : 4.2, isPillar ? 5.0 : 2.8);
      }

      // Trigger Camera Shake & Hit-Stop (unless suppressed)
      if (!options.silentJuice) {
        const shake = Number(cfg.camera_shake) || 0;
        if (shake > this.shakeMag) this.shakeMag = shake;
        const stopMs = Number(cfg.hit_stop_ms) || 0;
        if (stopMs > 0) this.hitStopTimer = Math.max(this.hitStopTimer, stopMs / 1000);
      }

      // Trigger Ultra Dynamic Flash Light
      if (this.ultraEnabled && cfg.flash_light) {
        this.flashLight.color.set(cfg.color || '#ffb454');
        this.flashLight.position.set(pos.x, 1.5, pos.z);
        this.flashLight.intensity = 4.2;
        this.flashDuration = 0.16;
        this.flashTimer = this.flashDuration;
      }
    }

    // --- Enemy AoE Cast Telegraph Decal (Synced to Cast Bar!) ---
    syncTelegraph(entityId, worldPos, progress01, active) {
      let entry = this.telegraphMap.get(entityId);
      if (!active) {
        if (entry) {
          this.vfxRoot.remove(entry.group);
          entry.outerGeo.dispose(); entry.outerMat.dispose();
          entry.fillGeo.dispose(); entry.fillMat.dispose();
          this.telegraphMap.delete(entityId);
        }
        return;
      }

      const cfg = this.manifest.vfx.aoe_telegraph;
      const radius = (Number(cfg.scale) || 3.4) * 0.5;
      if (!entry) {
        const group = new THREE.Group();
        const tex = this.getVFXTexture('aoe_telegraph');
        const outerGeo = new THREE.PlaneGeometry(radius * 2, radius * 2);
        const outerMat = new THREE.MeshBasicMaterial({
          map: tex,
          color: new THREE.Color(cfg.color || '#df544c'),
          transparent: true,
          opacity: 0.9,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });
        const outerMesh = new THREE.Mesh(outerGeo, outerMat);
        outerMesh.rotation.x = -Math.PI / 2;
        outerMesh.position.y = 0.08;

        const fillGeo = new THREE.CircleGeometry(radius * 0.92, 28);
        const fillMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(cfg.color || '#df544c'),
          transparent: true,
          opacity: 0.28,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });
        const fillMesh = new THREE.Mesh(fillGeo, fillMat);
        fillMesh.rotation.x = -Math.PI / 2;
        fillMesh.position.y = 0.09;
        group.add(outerMesh, fillMesh);
        this.vfxRoot.add(group);
        entry = { group, outerMesh, fillMesh, outerGeo, outerMat, fillGeo, fillMat };
        this.telegraphMap.set(entityId, entry);
      }

      entry.group.position.set(worldPos.x, 0, worldPos.z);
      entry.outerMesh.rotation.z += 0.015;
      const p = Math.max(0.05, Math.min(1, progress01));
      entry.fillMesh.scale.set(p, p, 1);
      entry.fillMat.opacity = 0.22 + p * 0.36;
    }

    clearNodeVFX() {
      for (let i = this.activeVFX.length - 1; i >= 0; i--) {
        const fx = this.activeVFX[i];
        this.vfxRoot.remove(fx.mesh);
        fx.mesh.geometry.dispose();
        fx.mesh.material.dispose();
        fx.tex.dispose();
      }
      this.activeVFX.length = 0;

      this.telegraphMap.forEach((entry) => {
        this.vfxRoot.remove(entry.group);
        entry.outerGeo.dispose(); entry.outerMat.dispose();
        entry.fillGeo.dispose(); entry.fillMat.dispose();
      });
      this.telegraphMap.clear();
    }

    // --- Tick Update (Returns adjusted dt if Hit-Stop active) ---
    update(rawDt, elapsed) {
      // 1. Hit-Stop check
      let simDt = rawDt;
      if (this.hitStopTimer > 0) {
        this.hitStopTimer = Math.max(0, this.hitStopTimer - rawDt);
        simDt = rawDt * 0.12; // Dramatic brief micro-freeze!
      }

      // 2. Camera Shake decay
      if (this.shakeMag > 0.002) {
        this.shakeOffset.set(
          (Math.random() - 0.5) * 2 * this.shakeMag,
          (Math.random() - 0.5) * 1.4 * this.shakeMag,
          (Math.random() - 0.5) * 2 * this.shakeMag
        );
        this.shakeMag *= Math.pow(0.04, rawDt);
      } else {
        this.shakeMag = 0;
        this.shakeOffset.set(0, 0, 0);
      }

      // 3. Dynamic Flash Light decay
      if (this.flashTimer > 0) {
        this.flashTimer = Math.max(0, this.flashTimer - rawDt);
        this.flashLight.intensity = (this.flashTimer / this.flashDuration) * 4.2;
      } else if (this.flashLight.intensity > 0) {
        this.flashLight.intensity = 0;
      }

      // 4. Active VFX Planes
      for (let i = this.activeVFX.length - 1; i >= 0; i--) {
        const fx = this.activeVFX[i];
        fx.life -= rawDt;
        const t = 1 - Math.max(0, fx.life / fx.maxLife);

        // Animate Sprite Sheet frames if multi-frame
        const totalFrames = fx.cols * fx.rows;
        if (totalFrames > 1) {
          fx.frameAcc += rawDt * fx.fps;
          const idx = Math.floor(fx.frameAcc) % totalFrames;
          if (idx !== fx.frameIdx) {
            fx.frameIdx = idx;
            const col = idx % fx.cols;
            const row = Math.floor(idx / fx.cols);
            this.applySpriteSheetConfig(fx.tex, fx.cols, fx.rows, col, row);
          }
        }

        if (fx.isProjectile && fx.fromPos) {
          fx.mesh.position.lerpVectors(fx.fromPos, fx.toPos, t);
          fx.mesh.position.y = 1.05;
          fx.mesh.lookAt(this.camera.position);
          fx.mesh.rotateZ(elapsed * fx.spin);
        } else if (fx.isRing) {
          const s = 0.45 + t * 1.15;
          fx.mesh.scale.set(s, s, 1);
          fx.mesh.material.opacity = Math.max(0, 1 - t * t);
        } else if (fx.isPillar) {
          fx.mesh.lookAt(this.camera.position.x, fx.mesh.position.y, this.camera.position.z);
          const w = 1.0 - t * 0.45;
          fx.mesh.scale.set(w, 1 + t * 0.35, 1);
          fx.mesh.material.opacity = Math.sin((1 - t) * Math.PI * 0.5);
        } else if (fx.isBolt) {
          fx.mesh.material.opacity = Math.max(0, 1 - t * 1.15);
          fx.mesh.scale.y = 1 + Math.sin(t * 24) * 0.25;
        } else {
          // Billboarding slash / star burst
          fx.mesh.lookAt(this.camera.position);
          if (fx.spin) fx.mesh.rotateZ(-0.7 + t * fx.spin * 0.55);
          const sc = fx.cfg.fallback === 'star_burst' ? (0.5 + Math.sin(t * Math.PI) * 0.85) : (0.75 + t * 0.5);
          fx.mesh.scale.set(sc, sc, 1);
          fx.mesh.material.opacity = Math.max(0, 1 - Math.pow(t, 1.6));
        }

        if (fx.life <= 0) {
          this.vfxRoot.remove(fx.mesh);
          fx.mesh.geometry.dispose();
          fx.mesh.material.dispose();
          fx.tex.dispose();
          this.activeVFX.splice(i, 1);
        }
      }

      // 5. GPU Burst Particles (1 Draw Call!)
      const bPos = this.burstPoints.geometry.attributes.position;
      const bCol = this.burstPoints.geometry.attributes.color;
      let anyBurst = false;
      for (let i = 0; i < this.maxBurst; i++) {
        const d = this.burstData[i];
        if (!d.alive) continue;
        anyBurst = true;
        d.life -= rawDt;
        if (d.life <= 0) {
          d.alive = false;
          bPos.setXYZ(i, 0, -999, 0);
          continue;
        }
        d.vy -= d.gravity * rawDt;
        const nx = bPos.getX(i) + d.vx * rawDt;
        const ny = Math.max(0.06, bPos.getY(i) + d.vy * rawDt);
        const nz = bPos.getZ(i) + d.vz * rawDt;
        bPos.setXYZ(i, nx, ny, nz);
        const fade = Math.max(0, d.life / d.maxLife);
        bCol.setXYZ(i, d.r * fade, d.g * fade, d.b * fade);
      }
      if (anyBurst) {
        bPos.needsUpdate = true;
        bCol.needsUpdate = true;
      }

      // 6. GPU Ambient Particles (1 Draw Call!)
      if (this.ambientActiveCount > 0) {
        const aPos = this.ambientPoints.geometry.attributes.position;
        for (let i = 0; i < this.ambientActiveCount; i++) {
          const d = this.ambientData[i];
          d.y += d.speedY * simDt;
          if (d.y > d.maxY) d.y = 0.2;
          const nx = d.ox + Math.sin(elapsed * 1.5 + d.phase) * 0.35;
          aPos.setXYZ(i, nx, d.y, d.oz);
        }
        aPos.needsUpdate = true;
      }

      return simDt;
    }

    exportManifestJSON() {
      return JSON.stringify(this.manifest, null, 2);
    }
  }

  global.BattleSmithVFXManager = BattleSmithVFXManager;
})(window);
