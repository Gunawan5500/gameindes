/**
 * Battle-Smith RPG — Fase 2B (Diperbarui Poin 6 & Poin 7): Layar Patroli Idle & Duel Misi Boss
 * - Poin 6: Kartu Long Rest dikeluarkan dari sini dan dipindah ke Bar Atas Global (di atas semua tab)
 * - Poin 7: 30 kotak Level kembar diganti menjadi 3 Tombol Wilayah + 1 Baris Dropdown/Stepper Level yang sangat bersih & lega!
 */
(function (global) {
  "use strict";

  const Bridge = global.BSRPG_BRIDGE;
  const B = global.BSRPG_BACKEND;

  const ui = {
    subTab: "level_idle", // "level_idle" | "boss_missions"
    previewBossId: null,
    gateAllocClass: null,
    showWorldLogs: false
  };

  function esc(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function openSubTab(tabName, bossId = null) {
    ui.subTab = tabName;
    if (bossId) ui.previewBossId = bossId;
  }

  function renderLevelIdleTab(snap) {
    const p = snap.player;
    const hs = snap.huntState || {};
    const groups = snap.levelGroups || [];

    if (!groups.length) {
      return `
        <div class="card teal">
          <div class="card-title">⏳ Memuat Ekosistem Wilayah (${esc(snap.location?.area_name || "Area")})...</div>
          <div class="card-sub">Menyiapkan data 3 Wilayah &amp; kolam level monster (RAM Oppo A54 &lt; 150 MB).</div>
        </div>
      `;
    }

    const wantedLv = p.selectedIdleLevel || p.level;
    const activeGroup = groups.reduce((best, cur) =>
      Math.abs(cur.lvl - wantedLv) < Math.abs(best.lvl - wantedLv) ? cur : best
    , groups[0]);

    // Rangkum 3 Wilayah Area (Rendah, Sedang, Tinggi) agar informasi bahan tidak berulang 30 kali!
    const bandsMap = new Map();
    for (const g of groups) {
      if (!bandsMap.has(g.regionId)) {
        bandsMap.set(g.regionId, {
          regionId: g.regionId,
          regionName: g.regionName,
          zoneBand: g.zoneBand,
          minLv: g.lvl,
          maxLv: g.lvl,
          categories: g.dropCategories,
          sampleMaterials: g.sampleMaterials,
          miniBoss: g.regionMiniBoss
        });
      } else {
        const b = bandsMap.get(g.regionId);
        b.minLv = Math.min(b.minLv, g.lvl);
        b.maxLv = Math.max(b.maxLv, g.lvl);
      }
    }
    const zoneCards = Array.from(bandsMap.values());
    const minAreaLv = groups[0].lvl;
    const maxAreaLv = groups[groups.length - 1].lvl;

    const sim = Bridge.previewCombat(activeGroup.representativeMonster);
    const af = sim.antiFarmSummary;
    const kph = sim.metrics.killsPerHpBar;
    const kphColor = kph >= 1.0 ? "var(--teal-hi)" : kph >= 0.4 ? "var(--amber-hi)" : "#fda4af";

    const regHours = hs.regionPatrolHours?.[activeGroup.regionId] || 0;
    const areaHours = hs.areaPatrolHours?.[activeGroup.areaId] || 0;
    const mb = activeGroup.regionMiniBoss;
    const mbCdUntil = mb ? (hs.bossCooldownUntilDay?.[mb.id] || 0) : 0;
    const mbOnCd = snap.calendar.day < mbCdUntil;

    const matDropsSummary = activeGroup.sampleMaterials
      .map(m => `${esc(m.name)} <small style="color:var(--muted)">[${esc(m.category)}]</small>`)
      .join(" • ");

    // Dropdown Level bersih (Lv.1 s/d Lv.30)
    const levelOptionsHtml = groups.map(g => {
      const tag = g.lvl === p.level ? " ★ Selevel" : g.lvl > p.level + 2 ? " ⚠ Berat" : "";
      return `<option value="${g.lvl}" ${g.lvl === activeGroup.lvl ? "selected" : ""}>Level ${g.lvl} — Wilayah ${esc(g.zoneBand)} (${esc(g.regionName)})${tag}</option>`;
    }).join("");

    // Laporan Sesi Idle Terakhir
    const rep = snap.lastIdleReport;
    let reportHtml = "";
    if (rep) {
      const encBadges = (rep.encounteredMonsters || []).map(e =>
        `<span class="badge ${e.type === "Reguler Khusus" ? "ok" : ""}">${e.type === "Reguler Khusus" ? "✦ " : ""}${esc(e.name)} ×${e.count}</span>`
      ).join(" ");
      const lootBadges = (rep.lootNamed || []).map(l =>
        `<span class="badge ok">🪨 ${esc(l.name)} +${l.qty}</span>`
      ).join(" ");
      const trBadges = (rep.trophiesFound || []).map(t =>
        `<span class="badge warn">${esc(t.name)} +${t.qty}</span>`
      ).join(" ");

      const ambushHtml = rep.miniBossAmbush
        ? `<div style="padding:6px 9px;border-radius:8px;background:${rep.miniBossAmbush.won ? "rgba(60,174,163,0.18)" : "rgba(159,18,57,0.25)"};border:1px solid ${rep.miniBossAmbush.won ? "var(--teal)" : "#fb7185"};font-size:11px">
            ⚡ <b>SERGAPAN MINI BOSS!</b> <b>${esc(rep.miniBossAmbush.name)} (Lv.${rep.miniBossAmbush.lvl})</b> muncul —
            ${rep.miniBossAmbush.won
              ? `<b style="color:var(--teal-hi)">DIKALAHKAN! (+${B.formatCurrency(rep.miniBossAmbush.bonusBr)}, +${rep.miniBossAmbush.bonusXp} XP)</b>`
              : `<b style="color:#fda4af">Terlalu kuat (${rep.miniBossAmbush.killsPerHpBar}x), karakter mundur selamat.</b>`}
          </div>`
        : "";

      reportHtml = `
        <div class="card teal" style="margin-top:10px">
          <div class="card-head">
            <div>
              <div class="card-title">📊 Laporan Sesi Terakhir — ${esc(rep.modeLabel)} Lv.${rep.idleLevel} (${rep.activeHours.toFixed(1)}j • +${rep.daysElapsed} Hari)</div>
              <div class="card-sub">Wilayah: <b>${esc(rep.regionName)}</b> • Selesai pukul ${esc(rep.timeLabel)}</div>
            </div>
            ${rep.levelsGained > 0 ? `<span class="badge ok">🎉 Naik ke Lv.${rep.newLevel}!</span>` : `<span class="badge">Tersimpan</span>`}
          </div>
          ${ambushHtml}
          <div class="monster-stat-strip">
            <span>⚔️ Battle XP: <b style="color:var(--sky)">+${rep.battleXpGained}</b></span>
            <span>🔨 Smith XP: <b style="color:var(--amber-hi)">+${rep.smithXpGained}</b></span>
            <span>🪙 Kas: <b style="color:var(--teal-hi)">+${B.formatCurrency(rep.bronzeEarned)}</b></span>
            ${rep.branchIncomeBr > 0 ? `<span>🏪 Cabang: <b>+${B.formatCurrency(rep.branchIncomeBr)}</b></span>` : ""}
          </div>
          ${encBadges ? `<div style="display:flex;gap:5px;flex-wrap:wrap;align-items:center"><span style="font-size:10.5px;color:var(--muted)">Monster Ditemui:</span> ${encBadges}</div>` : ""}
          ${(lootBadges || trBadges) ? `<div style="display:flex;gap:5px;flex-wrap:wrap;align-items:center"><span style="font-size:10.5px;color:var(--amber-hi)">Masuk ke Tas [I]:</span> ${lootBadges} ${trBadges}</div>` : ""}
        </div>
      `;
    }

    return `
      <!-- KARTU 1: PILIH WILAYAH & DROPDOWN LEVEL (POIN 7 — RINGKAS & BERSIH) -->
      <div class="card warm" style="margin-bottom:10px">
        <div class="card-head">
          <div>
            <div class="card-title">🌲 Pilih Wilayah &amp; Level Patroli (${esc(snap.location?.area_name)})</div>
            <div class="card-sub">9 Monster Reguler + 1 ✦ Khusus diacak otomatis pada Level pilihan Anda.</div>
          </div>
          <button class="chip-btn ${p.selectedIdleLevel === null ? "teal" : ""}" id="btn-auto-follow-lvl">
            ${p.selectedIdleLevel === null ? "✓ Auto Ikuti Lv Pemain" : "🔄 Auto Selevel"}
          </button>
        </div>

        <!-- 3 Tombol Wilayah (Beda Bahan & Mini Boss) -->
        <div class="zone-bands-grid" style="margin-bottom:4px">
          ${zoneCards.map(z => {
            const isZoneActive = z.regionId === activeGroup.regionId;
            return `
              <button class="choice-card ${isZoneActive ? "selected" : ""}" data-pick-zone-lv="${z.minLv}" style="padding:7px 9px;min-width:0">
                <div style="display:flex;justify-content:space-between;align-items:center;gap:4px;width:100%;flex-wrap:wrap">
                  <strong style="font-size:11.5px;color:${isZoneActive ? "var(--amber-hi)" : "#fff"}">${esc(z.zoneBand)}</strong>
                  <span class="badge">Lv.${z.minLv}–${z.maxLv}</span>
                </div>
                <span style="font-size:10px;color:var(--muted)">${esc(z.regionName)} • ${esc(z.categories.slice(0, 3).join(", "))}</span>
              </button>
            `;
          }).join("")}
        </div>

        <!-- 1 Baris Dropdown + Stepper Level -->
        <div style="display:flex;align-items:center;gap:6px">
          <button class="stepper-btn" id="btn-lvl-dec" ${activeGroup.lvl <= minAreaLv ? "disabled" : ""} title="Turun 1 Level">−</button>
          <select id="sel-idle-lvl" class="select-compact" style="flex:1;min-width:0;padding:6px 9px;font-size:12px">
            ${levelOptionsHtml}
          </select>
          <button class="stepper-btn" id="btn-lvl-inc" ${activeGroup.lvl >= maxAreaLv ? "disabled" : ""} title="Naik 1 Level">+</button>
        </div>

        <div class="monster-stat-strip" style="justify-content:space-between">
          <span>⚡ DPS: <b style="color:var(--sky)">${sim.metrics.dps}</b></span>
          <span>💀 Kills/Bar: <b style="color:${kphColor}">${kph}x</b></span>
          <span style="color:${af.xpMult < 1 ? "#fda4af" : "var(--teal-hi)"}">📈 XP ${Math.round(af.xpMult * 100)}% • Drop ${Math.round(af.effectiveDropMult * 100)}%</span>
          <span>💀 Sergapan Mini Boss: <b>${mb ? (mbOnCd ? "Cooldown" : "8%/jam") : "-"}</b></span>
        </div>

        <div style="font-size:11px;color:#cbd5e1;display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap">
          <span>🪨 <b>Bahan Wilayah Ini:</b> ${matDropsSummary || "-"}</span>
          <span style="color:var(--teal-hi)">📜 Jejak Misi: Wilayah <b>${regHours.toFixed(1)}/2.0j</b> • Area <b>${areaHours.toFixed(1)}/3.0j</b></span>
        </div>

        ${(() => {
          const Assets = global.BSRPG_ASSETS;
          const heroUrl = Assets ? Assets.get("sprite_hero") : "";
          const wildsUrl = Assets ? Assets.get("ui_banner_wilds") : "";
          const repMon = activeGroup.reg || activeGroup.spec || null;
          const customMonUrl = Assets && typeof Assets.getCustomMonsterUrl === "function"
            ? Assets.getCustomMonsterUrl(repMon)
            : "";
          const enemyInfo = Assets ? Assets.getEnemySpriteInfo(repMon) : { url: "", label: "Monster 5-Frame" };
          const enemyVisualHtml = customMonUrl
            ? `<img src="${customMonUrl}" alt="${esc(repMon ? repMon.name : "Monster")}" class="custom-mon-sprite" data-sprite-role="enemy" />`
            : `<div class="sprite-5f enemy-anim" data-sprite-role="enemy" style="${enemyInfo.url ? `background-image:url('${enemyInfo.url}')` : ""}"></div>`;
          const stageBadge = customMonUrl ? "👹 Dark Bestiary .webp" : `🎬 5-Frame .webp (${esc(enemyInfo.label)})`;
          return `
        <div class="sprite-arena-stage" data-sprite-stage="idle" style="${wildsUrl ? `background-image:url('${wildsUrl}')` : ""}">
          <div class="sprite-arena-head">
            <span>⚔️ <b>Arena Grinding:</b> ${esc(p.name)} vs ${esc(repMon ? repMon.name : `Monster Lv.${activeGroup.lvl}`)}</span>
            <span class="badge ok">${stageBadge}</span>
          </div>
          <div class="sprite-arena-floor">
            <div class="sprite-unit-wrap">
              <div class="sprite-5f hero-anim" data-sprite-role="hero" style="${heroUrl ? `background-image:url('${heroUrl}')` : ""}"></div>
              <span class="sprite-caption">🛡️ ${esc(p.name)} Lv.${p.level}</span>
            </div>
            <div class="sprite-clash-badge">⚔️</div>
            <div class="sprite-unit-wrap">
              ${enemyVisualHtml}
              <span class="sprite-caption">🐾 Lv.${activeGroup.lvl} ${esc(repMon ? repMon.name : "Monster")}</span>
            </div>
          </div>
        </div>`;
        })()}
      </div>

      <!-- KARTU 2: TOMBOL DURASI IDLE (LEGA TANPA KARTU LONG REST) -->
      <div class="card">
        <div class="card-head">
          <div>
            <div class="card-title">⚔️ Jalankan Sesi Idle Otomatis (Batas Offline 8 Jam)</div>
            <div class="card-sub">
              Buff Silang S→B: <b style="color:var(--sky)">+${p.xp.crossBuffSmithToBattlePct}%</b> • Buff Silang B→S: <b style="color:var(--amber-hi)">+${p.xp.crossBuffBattleToSmithPct}%</b> (Jika Stamina habis, klik tombol <b>🏕️ Istirahat</b> di bar atas).
            </div>
          </div>
          <span class="badge ok">1 Jam = 6 Hari WD</span>
        </div>

        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn btn-primary" data-run-idle="B1">▶ Battle 1 Jam</button>
          <button class="btn btn-primary" data-run-idle="B4">▶ Battle 4 Jam</button>
          <button class="btn btn-secondary" data-run-idle="B8">💤 Battle 8 Jam</button>
          <button class="btn btn-secondary" data-run-idle="BAL4">⚖️ Seimbang 4 Jam</button>
          <button class="btn btn-secondary" data-run-idle="S2">🔨 Smith 2 Jam</button>
          <button class="btn btn-secondary" data-run-idle="S4">🔨 Smith 4 Jam</button>
        </div>
      </div>

      ${reportHtml}
    `;
  }

  function renderBossMissionsTab(snap) {
    const p = snap.player;
    const hs = snap.huntState || {};
    const curDay = snap.calendar.day;
    const areaId = snap.activeAreaData?.area?.area_id || snap.location?.area_id;
    const monsters = snap.activeAreaData?.monsters || [];
    const areaRegions = (snap.catalogs.regions || [])
      .filter(r => r.area_id === areaId)
      .sort((a, b) => Number(a.level_min) - Number(b.level_min));
    const regionById = {};
    for (const r of areaRegions) regionById[r.region_id] = r;

    const miniBosses = monsters.filter(m => m.type === "Mini Boss").sort((a, b) => a.lvl - b.lvl);
    const areaBoss = monsters.find(m => m.type === "Boss") || null;
    const highRegion = areaRegions.find(r => r.zone_band === "Tinggi");
    const highMiniBoss = highRegion ? miniBosses.find(m => m.reg === highRegion.region_id) : null;

    const gate = Bridge.previewGateBoss();
    const duel = snap.lastBossDuelReport;
    const previewEnemy = monsters.find(m => m.id === ui.previewBossId) || areaBoss || miniBosses[0] || null;
    const previewSim = previewEnemy ? Bridge.previewCombat(previewEnemy) : null;

    const pMaxHp = duel ? duel.duelHp.playerMaxHp : (previewSim?.playerSummary?.maxPlayerHp || 44);
    const pCurHp = duel ? duel.duelHp.playerEndHp : pMaxHp;
    const bMaxHp = duel ? duel.duelHp.bossMaxHp : (previewSim?.monsterSummary?.hp || gate.monster.hp);
    const bCurHp = duel ? duel.duelHp.bossEndHp : bMaxHp;
    const bName = duel ? `${duel.bossName} (Lv.${duel.bossLvl})` : (previewEnemy ? `${previewEnemy.name} (Lv.${previewEnemy.lvl})` : `Gate Guardian (Lv.${gate.gateBossLevel})`);
    const pPct = Math.max(0, Math.min(100, Math.round((pCurHp / Math.max(1, pMaxHp)) * 100)));
    const bPct = Math.max(0, Math.min(100, Math.round((bCurHp / Math.max(1, bMaxHp)) * 100)));

    const duelLootBadges = (duel?.lootNamed || []).map(l => `<span class="badge ok">🪨 ${esc(l.name)} +${l.qty}</span>`).join(" ");
    const duelTrBadges = (duel?.trophiesFound || []).map(t => `<span class="badge warn">${esc(t.name)} +${t.qty}</span>`).join(" ");

    const miniBossCardsHtml = miniBosses.map(mb => {
      const reg = regionById[mb.reg];
      const regHours = hs.regionPatrolHours?.[mb.reg] || 0;
      const cdUntil = hs.bossCooldownUntilDay?.[mb.id] || 0;
      const cdRem = Math.max(0, cdUntil - curDay);
      const unlocked = regHours >= 2.0;
      const canCall = unlocked && cdRem === 0 && p.stamina.current >= 15;
      const mbSim = Bridge.previewCombat(mb);
      const defeatedOnce = (hs.defeatedMiniBossIds || []).includes(mb.id);

      return `
        <div class="card warm">
          <div class="card-head">
            <div>
              <div class="card-title">
                💀 ${esc(mb.name)} <span class="badge">Lv.${mb.lvl}</span>
                ${defeatedOnce ? `<span class="badge ok">✓ Kalah</span>` : ""}
              </div>
              <div class="card-sub">Wilayah ${esc(reg ? reg.region_name : mb.reg)} • Cooldown menang: 6 Hari WD</div>
            </div>
            ${cdRem > 0
              ? `<span class="badge warn">⏳ ${cdRem}h</span>`
              : unlocked
                ? `<span class="badge ok">Siap</span>`
                : `<span class="badge pending">Jejak ${regHours.toFixed(1)}/2.0j</span>`}
          </div>
          <div class="monster-stat-strip">
            <span>❤️ HP <b>${mbSim.monsterSummary.hp}</b></span>
            <span>⚔️ Dmg <b>${mbSim.monsterSummary.dmg}</b></span>
            <span>💀 Kesiapan: <b style="color:${mbSim.metrics.killsPerHpBar >= 1 ? "var(--teal-hi)" : "#fda4af"}">${mbSim.metrics.killsPerHpBar}x</b></span>
          </div>
          <button class="btn ${canCall ? "btn-primary" : "btn-secondary"} btn-xs" data-call-boss="${esc(mb.id)}" ${canCall ? "" : "disabled"}>
            ${cdRem > 0 ? `⏳ Cooldown (${cdRem} Hari)` : !unlocked ? `🔒 Patroli Wilayah (${regHours.toFixed(1)}/2.0j)` : "⚔️ Panggil & Duel (15 STM)"}
          </button>
        </div>
      `;
    }).join("");

    let areaBossHtml = "";
    if (areaBoss) {
      const areaHours = hs.areaPatrolHours?.[areaId] || 0;
      const highMbCleared = !highMiniBoss || (hs.defeatedMiniBossIds || []).includes(highMiniBoss.id);
      const cdUntil = hs.bossCooldownUntilDay?.[areaBoss.id] || 0;
      const cdRem = Math.max(0, cdUntil - curDay);
      const unlocked = areaHours >= 3.0 && highMbCleared;
      const canCall = unlocked && cdRem === 0 && p.stamina.current >= 15;
      const abSim = Bridge.previewCombat(areaBoss);

      areaBossHtml = `
        <div class="card boss" style="margin-top:9px">
          <div class="card-head">
            <div>
              <div class="card-title">👑 ${esc(areaBoss.name)} <span class="badge">Lv.${areaBoss.lvl} BOSS AREA</span></div>
              <div class="card-sub">Misi Ekspedisi Puncak • Cooldown Anti-Farming: <b>18 Hari WD</b></div>
            </div>
            ${cdRem > 0 ? `<span class="badge warn">⏳ Cooldown ${cdRem}h</span>` : unlocked ? `<span class="badge ok">Terbuka</span>` : `<span class="badge pending">Terkunci</span>`}
          </div>
          <div class="monster-stat-strip">
            <span>❤️ HP <b>${abSim.monsterSummary.hp}</b></span>
            <span>⚔️ Dmg <b>${abSim.monsterSummary.dmg}</b></span>
            <span>💀 Kesiapan: <b style="color:${abSim.metrics.killsPerHpBar >= 1 ? "var(--teal-hi)" : "#fda4af"}">${abSim.metrics.killsPerHpBar}x / 1.00x</b></span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">
            <span style="font-size:10.5px;color:#e2e8f0">
              Syarat: <span style="color:${areaHours >= 3 ? "var(--teal-hi)" : "#fda4af"}">① Jejak Area ${areaHours.toFixed(1)}/3.0j</span> •
              <span style="color:${highMbCleared ? "var(--teal-hi)" : "#fda4af"}">② Kalahkan ${esc(highMiniBoss ? highMiniBoss.name.split(",")[0] : "Mini Boss Tinggi")}</span>
            </span>
            <button class="btn ${canCall ? "btn-primary" : "btn-danger"} btn-xs" data-call-boss="${esc(areaBoss.id)}" ${canCall ? "" : "disabled"}>
              ${cdRem > 0 ? `⏳ Cooldown ${cdRem} Hari` : !unlocked ? "🔒 Syarat Belum Lengkap" : "👑 Mulai Ekspedisi Boss (15 STM)"}
            </button>
          </div>
        </div>
      `;
    }

    const gatePct = Math.min(100, Math.round(gate.metrics.killsPerHpBar * 100));
    const smithClasses = ["Weaponsmith", "Armorer", "Rangesmith", "Runesmith", "Reforger"];

    return `
      <div class="duel-arena" style="margin-bottom:9px">
        <div class="card-head">
          <div>
            <div class="card-title">⚔️ Panggung Duel Boss — Health Bar Aktif (Opsi 3)</div>
            <div class="card-sub">
              ${duel
                ? `Hasil Terakhir (${esc(duel.kind)}): <b style="color:${duel.won ? "var(--teal-hi)" : "#fda4af"}">${duel.won ? "🏆 MENANG DUEL!" : "☠ TUMBANG!"}</b>`
                : "Bar HP aktif berhadapan khusus pada pertarungan Misi Boss &amp; Gate Boss."}
            </div>
          </div>
          <span class="badge ${duel ? (duel.won ? "ok" : "warn") : ""}">${duel ? (duel.won ? "Victory" : "Defeat") : "Siap"}</span>
        </div>

        ${(() => {
          const Assets = global.BSRPG_ASSETS;
          const heroUrl = Assets ? Assets.get("sprite_hero") : "";
          const bossUrl = Assets ? Assets.get("sprite_boss") : "";
          const bossBg = Assets ? Assets.get("ui_banner_boss") : "";
          return `
        <div class="sprite-arena-stage boss-stage" data-sprite-stage="boss" style="${bossBg ? `background-image:url('${bossBg}')` : ""}">
          <div class="sprite-arena-head">
            <span>🔥 <b>Arena Duel 2D:</b> Head-to-Head Boss</span>
            <span class="badge ok">🎬 5-Frame .webp Aktif</span>
          </div>
          <div class="sprite-arena-floor">
            <div class="sprite-unit-wrap">
              <div class="sprite-5f hero-anim" data-sprite-role="hero" style="${heroUrl ? `background-image:url('${heroUrl}')` : ""}"></div>
              <span class="sprite-caption">🛡️ ${esc(p.name)}</span>
            </div>
            <div class="sprite-clash-badge">⚡VS⚡</div>
            <div class="sprite-unit-wrap">
              <div class="sprite-5f boss-anim" data-sprite-role="boss" style="${bossUrl ? `background-image:url('${bossUrl}')` : ""}"></div>
              <span class="sprite-caption">👹 ${esc(bName)}</span>
            </div>
          </div>
        </div>`;
        })()}

        <div class="duel-vs-grid">
          <div class="duel-fighter">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <strong style="font-size:12px;color:#e0f2fe">🛡️ ${esc(p.name)} (Lv.${p.level})</strong>
              <span style="font-size:10.5px;color:var(--teal-hi)">${snap.companion ? `+ ⚔️ ${esc(snap.companion.seed.split("-").pop())}` : ""}</span>
            </div>
            <div class="bar-row">
              <span class="bar-lbl hp">HP</span>
              <div class="bar-track" style="height:10px"><div class="bar-fill hp" style="width:${pPct}%"></div></div>
              <span class="bar-val" style="width:68px">${pCurHp}/${pMaxHp}</span>
            </div>
          </div>
          <div style="text-align:center;font-weight:900;color:var(--amber-hi);font-size:13px">VS</div>
          <div class="duel-fighter">
            <strong style="font-size:12px;color:#fecaca;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">👹 ${esc(bName)}</strong>
            <div class="bar-row">
              <span class="bar-lbl hp">HP</span>
              <div class="bar-track" style="height:10px"><div class="bar-fill hp" style="width:${bPct}%"></div></div>
              <span class="bar-val" style="width:68px">${bCurHp}/${bMaxHp}</span>
            </div>
          </div>
        </div>

        ${duel && (duelLootBadges || duelTrBadges || duel.bronzeReward > 0) ? `
          <div style="display:flex;gap:5px;flex-wrap:wrap;align-items:center;font-size:11px">
            <span style="color:var(--amber-hi);font-weight:700">Hadiah:</span>
            ${duel.bronzeReward > 0 ? `<span class="badge ok">🪙 +${B.formatCurrency(duel.bronzeReward)}</span>` : ""}
            ${duelLootBadges} ${duelTrBadges}
          </div>
        ` : ""}
      </div>

      <div class="cards-grid">${miniBossCardsHtml}</div>
      ${areaBossHtml}

      <div class="card boss" style="margin-top:9px;border-color:var(--amber)">
        <div class="card-head">
          <div>
            <div class="card-title">⛩️ Ujian Gate Boss — Penjaga Tier ${gate.gateTier} (Lv.${gate.gateBossLevel})</div>
            <div class="card-sub">Buka Cap Stat ${(gate.gateTier + 1) * 30} &amp; +1 Poin Tipe Smith (Syarat: Kills/Bar ≥ 1.00x).</div>
          </div>
          <span class="badge ${gate.readyToWin ? "ok" : "warn"}">${gate.metrics.killsPerHpBar}x / 1.00x</span>
        </div>
        <div class="bar-track" style="height:8px">
          <div class="bar-fill ${gate.readyToWin ? "stm" : "hp"}" style="width:${gatePct}%"></div>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;padding-top:3px">
          <label style="font-size:11px;color:#e2e8f0;display:flex;align-items:center;gap:6px">
            <span>+1 Poin Smith:</span>
            <select id="sel-gate-smith" class="select-compact">
              ${smithClasses.map(cls => `<option value="${cls}" ${ui.gateAllocClass === cls ? "selected" : ""}>${cls} (T${p.smithTiers[cls] || 0})</option>`).join("")}
            </select>
          </label>
          <button class="btn ${gate.readyToWin ? "btn-primary" : "btn-danger"} btn-xs" id="btn-challenge-gate">
            ⚔️ Tantang Gate Boss Lv.${gate.gateBossLevel}
          </button>
        </div>
      </div>
    `;
  }

  function render(container, snap, callbacks = {}) {
    const { showToast = () => {} } = typeof callbacks === "function"
      ? { showToast: callbacks }
      : callbacks;

    const p = snap.player;
    const curAreaId = snap.location?.area_id || "saltgrave_coast";
    if (snap.activeLoadedAreaId !== curAreaId) {
      Bridge.loadAreaData(curAreaId).catch(() => {});
    }
    if (!ui.gateAllocClass) ui.gateAllocClass = snap.build.smith.primaryType || p.firstTakenClass || "Weaponsmith";

    const issueHtml = snap.activeIssue ? `
      <div class="card warm" style="margin-bottom:9px;border-color:#fb7185">
        <div class="card-head">
          <div class="card-title">📜 Isu Moral — ${esc(snap.activeIssue.theme)} (${esc(snap.activeIssue.tier)})</div>
          <span class="badge warn">${snap.activeIssue.expires_in_sessions} sesi</span>
        </div>
        <div style="font-size:11.5px;color:#f1f5f9">${esc(snap.activeIssue.text)}</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <button class="btn btn-primary btn-xs" data-inline-moral="Mulia">✦ Mulia (+5)</button>
          <button class="btn btn-danger btn-xs" data-inline-moral="Kejam">✦ Kejam (-5)</button>
          <button class="btn btn-secondary btn-xs" data-inline-moral="Netral">• Netral</button>
        </div>
      </div>
    ` : "";

    container.innerHTML = `
      ${issueHtml}
      <div class="sub-tabs-grid sub-tabs-2">
        <button class="sub-tab-btn ${ui.subTab === "level_idle" ? "active" : ""}" data-btl-sub="level_idle">🌲 Patroli Idle (Wilayah &amp; Level)</button>
        <button class="sub-tab-btn ${ui.subTab === "boss_missions" ? "active" : ""}" data-btl-sub="boss_missions">👑 Misi Boss &amp; Duel HP</button>
      </div>
      ${ui.subTab === "level_idle" ? renderLevelIdleTab(snap) : renderBossMissionsTab(snap)}
    `;

    container.querySelectorAll("[data-btl-sub]").forEach(btn => {
      btn.onclick = () => {
        ui.subTab = btn.getAttribute("data-btl-sub");
        render(container, Bridge.getSnapshot(), callbacks);
      };
    });

    container.querySelectorAll("[data-inline-moral]").forEach(btn => {
      btn.onclick = () => {
        const ch = btn.getAttribute("data-inline-moral");
        Bridge.resolveMoralIssue(ch);
        showToast(`⚖️ Isu Moral diputuskan: ${ch}`);
      };
    });

    const autoLvlBtn = container.querySelector("#btn-auto-follow-lvl");
    if (autoLvlBtn) {
      autoLvlBtn.onclick = () => {
        Bridge.setIdleLevel(null);
        showToast("🔄 Patroli Idle otomatis mengikuti Level karakter.");
      };
    }

    container.querySelectorAll("[data-pick-zone-lv]").forEach(btn => {
      btn.onclick = () => {
        const lv = Number(btn.getAttribute("data-pick-zone-lv"));
        Bridge.setIdleLevel(lv);
        showToast(`🌲 Pindah ke Wilayah mulai Level ${lv}.`);
      };
    });

    const selLvl = container.querySelector("#sel-idle-lvl");
    if (selLvl) {
      selLvl.onchange = e => {
        const lv = Number(e.target.value);
        Bridge.setIdleLevel(lv);
        showToast(`🌲 Level Patroli disetel ke Lv.${lv}.`);
      };
    }

    const decBtn = container.querySelector("#btn-lvl-dec");
    if (decBtn && selLvl) {
      decBtn.onclick = () => {
        const cur = Number(selLvl.value);
        Bridge.setIdleLevel(cur - 1);
      };
    }
    const incBtn = container.querySelector("#btn-lvl-inc");
    if (incBtn && selLvl) {
      incBtn.onclick = () => {
        const cur = Number(selLvl.value);
        Bridge.setIdleLevel(cur + 1);
      };
    }

    const IDLE_PRESETS = {
      B1:   { hours: 1, mode: "Battle", autoAlternateBars: false },
      B4:   { hours: 4, mode: "Battle", autoAlternateBars: false },
      B8:   { hours: 8, mode: "Battle", autoAlternateBars: false },
      BAL4: { hours: 4, mode: "Battle", autoAlternateBars: true },
      S2:   { hours: 2, mode: "Smith",  autoAlternateBars: false },
      S4:   { hours: 4, mode: "Smith",  autoAlternateBars: false }
    };

    container.querySelectorAll("[data-run-idle]").forEach(btn => {
      btn.onclick = () => {
        const cfg = IDLE_PRESETS[btn.getAttribute("data-run-idle")];
        if (!cfg) return;
        if (Bridge.getSnapshot().player.stamina.current <= 0.5) {
          return showToast("⚠ Stamina habis! Klik tombol 🏕️ Istirahat di bar atas.");
        }
        const r = Bridge.runIdle(cfg);
        if (r.aborted) return showToast(`⚠ ${r.reason}`);
        if (global.BSRPG_AUDIO) global.BSRPG_AUDIO.play(cfg.mode === "Smith" ? "forge_hammer" : "slash");
        if (global.BSRPG_PERF) global.BSRPG_PERF.pulseClass('[data-sprite-stage="idle"]', "fx-hit-shake", 300);
        const matCount = Object.values(r.materialsLooted || {}).reduce((a, b) => a + b, 0);
        showToast(`✓ Idle selesai: +${r.battleXpGained} BTL / +${r.smithXpGained} SMT XP, +${matCount} Bahan ke Tas`);
      };
    });

    container.querySelectorAll("[data-call-boss]").forEach(btn => {
      btn.onclick = () => {
        const bossId = btn.getAttribute("data-call-boss");
        ui.previewBossId = bossId;
        const r = Bridge.challengeBossMission(bossId);
        if (!r.ok) return showToast(`⚠ ${r.reason}`);
        if (global.BSRPG_AUDIO) global.BSRPG_AUDIO.play(r.won ? "victory" : "slash");
        if (global.BSRPG_PERF) global.BSRPG_PERF.pulseClass('[data-sprite-stage="boss"]', "fx-hit-shake", 320);
        showToast(r.won
          ? `🏆 MENANG DUEL melawan ${r.bossName}! Sisa HP ${r.duelHp.playerEndHp}/${r.duelHp.playerMaxHp}.`
          : `☠ Tumbang melawan ${r.bossName}. Cooldown ${r.cooldownDays} hari.`);
      };
    });

    const selGate = container.querySelector("#sel-gate-smith");
    if (selGate) selGate.onchange = e => { ui.gateAllocClass = e.target.value; };
    const btnGate = container.querySelector("#btn-challenge-gate");
    if (btnGate) {
      btnGate.onclick = () => {
        const r = Bridge.challengeGateBoss({ allocateSmithPointTo: ui.gateAllocClass });
        if (global.BSRPG_AUDIO) global.BSRPG_AUDIO.play(r.won ? "victory" : "slash");
        if (global.BSRPG_PERF) global.BSRPG_PERF.pulseClass('[data-sprite-stage="boss"]', "fx-hit-shake", 320);
        showToast(r.won
          ? `🏆 LULUS GATE! Cap Stat naik ke ${r.newStatCap} & +1 poin ke ${ui.gateAllocClass}!`
          : `☠ Kalah Gate Boss (Sisa HP Boss ${r.duelHp.bossEndHp}/${r.duelHp.bossMaxHp}). Kena +1 Kutukan Gate!`);
      };
    }
  }

  global.BSRPG_SCREEN_BATTLE = { render, openSubTab };
})(window);
