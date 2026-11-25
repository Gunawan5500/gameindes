/**
 * Battle-Smith RPG — Shell Router & HUD Controller (Fase 1 s/d Fase 3B)
 * Menghubungkan HUD 3 Zona, Bar Global Long Rest & Poin Stat (Poin 6),
 * Modal Karakter/Item [I], dan 7 Layar Utama langsung ke BSRPG_BRIDGE.
 */
(function (global) {
  "use strict";

  const Bridge = global.BSRPG_BRIDGE;
  const B = global.BSRPG_BACKEND;

  const uiState = {
    inGameplay: false,
    route: "battle",
    itemModalOpen: false,
    settingsOpen: false,
    restModalOpen: false,
    questOpen: false,
    activeStatKey: null,
    selectedBagKey: null,
    scale: Bridge.loadUiPrefs()
  };

  let toastTimer = null;

  function showToast(msg) {
    const el = document.getElementById("toast");
    el.textContent = msg;
    el.classList.remove("hidden");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.add("hidden"), 2300);
  }

  function applyScale() {
    const sc = uiState.scale;
    document.getElementById("hud-zone-tl").style.transform = `scale(${(sc.tl / 100).toFixed(2)})`;
    document.getElementById("hud-zone-tr").style.transform = `scale(${(sc.tr / 100).toFixed(2)})`;
    document.getElementById("hud-zone-bm").style.transform = `scale(${(sc.bm / 100).toFixed(2)})`;

    for (const k of ["global", "tl", "tr", "bm"]) {
      const inp = document.getElementById(`set-scale-${k}`);
      const lbl = document.getElementById(`lbl-scale-${k}`);
      if (inp) inp.value = sc[k];
      if (lbl) lbl.textContent = `${sc[k]}%`;
    }
    Bridge.saveUiPrefs(sc);
  }

  function renderHud(snap) {
    const p = snap.player;

    // Top-Left: Player + Curse Frame + Stamina (Opsi 3: HP hanya aktif di Duel Misi Boss)
    document.getElementById("hud-player-name").textContent = p.name;
    document.getElementById("hud-smith-class").textContent = snap.build.smith.singleWordClassName;
    document.getElementById("hud-lv-badge").textContent = p.level;

    const stmPct = Math.max(0, Math.min(100, Math.round((p.stamina.current / Math.max(1, p.stamina.max)) * 100)));
    document.getElementById("hud-stm-fill").style.width = `${stmPct}%`;
    document.getElementById("hud-stm-val").textContent = `${Math.round(p.stamina.current)}/${p.stamina.max}`;

    const subMeta = document.getElementById("hud-sub-meta");
    if (subMeta) {
      const ptsTxt = p.unspentStatPoints > 0 ? ` • +${p.unspentStatPoints} Stat!` : "";
      subMeta.textContent = `Lv.${p.level} (Cap ${snap.statCap}) • Patroli Lv.${p.selectedIdleLevel || p.level}${ptsTxt}`;
    }

    const avatarEl = document.getElementById("btn-avatar");
    const avatarImg = document.getElementById("hud-avatar-img");
    if (avatarImg && global.BSRPG_ASSETS && !avatarImg.dataset.loaded) {
      const avUrl = global.BSRPG_ASSETS.get("ui_avatar_hero");
      if (avUrl) {
        avatarImg.src = avUrl;
        avatarImg.dataset.loaded = "1";
      }
    }
    const curseBadge = document.getElementById("hud-curse-badge");
    avatarEl.classList.remove("curse-mild", "curse-severe");
    if (p.curses.activeStacks > 0) {
      avatarEl.classList.add(snap.curseInfo.isIncapacitated ? "curse-severe" : "curse-mild");
      curseBadge.textContent = `☠ ${p.curses.activeStacks}`;
      curseBadge.classList.remove("hidden");
    } else {
      curseBadge.classList.add("hidden");
    }

    // Poin 6: Global Action Bar di Atas Semua Tab (Long Rest & Poin Stat)
    const btnRest = document.getElementById("btn-global-rest");
    if (btnRest) {
      const curseTxt = p.curses.activeStacks > 0 ? ` • ☠ Kutukan ${p.curses.activeStacks}` : "";
      btnRest.textContent = `🏕️ Istirahat / Long Rest (STM ${Math.round(p.stamina.current)}/${p.stamina.max}${curseTxt})`;
      btnRest.classList.toggle("danger", p.curses.activeStacks > 0 || stmPct < 25);
      btnRest.classList.toggle("teal", p.curses.activeStacks === 0 && stmPct >= 25);
    }
    const btnStat = document.getElementById("btn-global-stat");
    if (btnStat) {
      if (p.unspentStatPoints > 0) {
        btnStat.textContent = `⬆ Alokasi +${p.unspentStatPoints} Poin Stat`;
        btnStat.classList.remove("hidden");
      } else {
        btnStat.classList.add("hidden");
      }
    }
    const locHint = document.getElementById("global-loc-hint");
    if (locHint) {
      const hasOwnHere = snap.location?.location_id === "loc_22_tidewrack_village" ||
        (snap.branches || []).some(b => b.locationId === snap.location?.location_id);
      locHint.textContent = `📍 ${snap.location?.location_name || "-"} ${hasOwnHere ? "(🏠 Bengkel/Cabang)" : "(🏨 Kota Luar)"}`;
    }

    // Center-Top & Portrait Sub-Bar: Bronze & Calendar
    const calText = `Thn ${snap.calendar.year} • Hari ${snap.calendar.day} (${snap.calendar.season})`;
    document.getElementById("hud-bronze").textContent = snap.bronzeFormatted;
    document.getElementById("hud-calendar").textContent = calText;
    const brSm = document.getElementById("hud-bronze-sm");
    const calSm = document.getElementById("hud-calendar-sm");
    if (brSm) brSm.textContent = snap.bronzeFormatted;
    if (calSm) calSm.textContent = calText;

    // Top-Right: Map, Quest, Companion Stamina
    document.getElementById("btn-hud-map").textContent = `🗺️ ${snap.location?.location_name || "Tidewrack Village"} (T${p.unlockedGateTier})`;
    const compName = snap.companion ? `${snap.companion.seed.split("-").pop()} (${snap.companion.smithClass})` : "Tanpa Companion";
    document.getElementById("hud-comp-name").textContent = `⚔️ ${compName}`;
    const compStmEl = document.getElementById("hud-comp-stm-fill");
    if (compStmEl) compStmEl.style.width = `${stmPct}%`;

    // Quest Drawer Body
    const curRegHours = snap.huntState?.regionPatrolHours?.[snap.location?.region_id] || 0;
    const curAreaHours = snap.huntState?.areaPatrolHours?.[snap.location?.area_id] || 0;
    document.getElementById("quest-drawer-body").innerHTML = `
      <div>• <b>Jejak Misi Wilayah (${snap.location?.region_name || "-"}):</b> ${curRegHours.toFixed(1)} / 2.0 jam (Panggil Mini Boss).</div>
      <div>• <b>Jejak Ekspedisi Area (${snap.location?.area_name || "-"}):</b> ${curAreaHours.toFixed(1)} / 3.0 jam (Panggil Boss Area).</div>
      <div>• <b>Target Gate Tier ${p.unlockedGateTier}:</b> Capai Lv.${p.unlockedGateTier * 30} &amp; kalahkan Gate Boss.</div>
      <div>• <b>Isu Moral Aktif:</b> ${snap.activeIssue ? `<span style="color:#fda4af">${snap.activeIssue.theme}</span>` : "Belum ada (muncul saat Idle)"}</div>
    `;

    // Alert badge di tab Isu Moral
    const issueTab = document.getElementById("tab-issue-btn");
    issueTab.textContent = snap.activeIssue ? "📜 Isu Moral (1)" : "📜 Isu Moral";
    issueTab.classList.toggle("alert", Boolean(snap.activeIssue));

    // Bottom-Middle: Opsi A Skill Bar Loadout (% Bonus Berbasis Stat)
    const barEl = document.getElementById("hud-skill-bar");
    const classPills = snap.build.equippedSkills.map((sk, idx) => {
      const pct = Math.round((sk.base_multiplier - 1) * 100 + (sk.mastery?.effectivenessBonusPct || 0));
      return `
        <button class="skill-pill" data-skill-tip="${sk.name} (${sk.smithClass} ${sk.mastery?.label || "Lv.1"}): ${sk.role}, +${Math.max(10, pct)}% efek berbasis Stat">
          <div class="skill-pill-top"><span>[${idx + 1}]</span><span>${sk.mastery?.label || "Lv.1"}</span></div>
          <div class="skill-pill-name">${sk.name}</div>
          <div class="skill-pill-pct">+${Math.max(10, pct)}% Efek</div>
        </button>
      `;
    });

    const ws = snap.build.weaponSkill;
    if (ws) {
      const wPct = Math.round((ws.effectiveMultiplier - 1) * 100);
      classPills.push(`
        <button class="skill-pill wpn" data-skill-tip="[W] ${ws.name} (${ws.unlocked ? "Aktif" : "Terkunci"}): Jurus Senjata +${Math.max(15, wPct)}% Trigger">
          <div class="skill-pill-top"><span>[W]</span><span>${ws.mastery?.label || "Lv.1"}</span></div>
          <div class="skill-pill-name">${ws.name}</div>
          <div class="skill-pill-pct">${ws.unlocked ? `+${Math.max(15, wPct)}% Trig` : "🔒 Terkunci"}</div>
        </button>
      `);
    }
    barEl.innerHTML = classPills.join("");
    barEl.querySelectorAll("[data-skill-tip]").forEach(b => {
      b.onclick = () => showToast(b.getAttribute("data-skill-tip"));
    });

    // Dual XP Bars
    const xpbPct = Math.min(100, Math.round((p.xp.battle / Math.max(1, snap.xpQuota)) * 100));
    const xpsPct = Math.min(100, Math.round((p.xp.smith / Math.max(1, snap.xpQuota)) * 100));
    document.getElementById("hud-xpb-fill").style.width = `${xpbPct}%`;
    document.getElementById("hud-xpb-val").textContent = `${p.xp.battle}/${snap.xpQuota}`;
    document.getElementById("hud-xps-fill").style.width = `${xpsPct}%`;
    document.getElementById("hud-xps-val").textContent = `${p.xp.smith}/${snap.xpQuota}`;

    // Save Size Label
    document.getElementById("save-size-label").textContent = `${(snap.saveBytes / 1024).toFixed(2)} KB`;
  }

  function renderRestModal(snap) {
    if (!uiState.restModalOpen) return;
    const p = snap.player;
    const hasOwnHere = snap.location?.location_id === "loc_22_tidewrack_village" ||
      (snap.branches || []).some(b => b.locationId === snap.location?.location_id);
    const innCostEst = B.formatCurrency(Math.max(15, p.level * 12 * Math.max(1, p.unlockedGateTier)));
    const primaryStat = snap.equipment?.weapon?.stat || "STR";

    const el = document.getElementById("rest-modal-body");
    el.innerHTML = `
      <div class="card teal">
        <div class="card-head">
          <div>
            <div class="card-title">⚡ Kondisi Stamina &amp; Kutukan Saat Ini</div>
            <div class="card-sub">Lokasi: <b>${snap.location?.location_name || "-"}</b> • Kas: <b>${snap.bronzeFormatted}</b></div>
          </div>
          <span class="badge ${p.curses.activeStacks > 0 ? "warn" : "ok"}">
            ${p.curses.activeStacks > 0 ? `☠ Kutukan Gate: ${p.curses.activeStacks} Tumpuk` : "✓ Bebas Kutukan"}
          </span>
        </div>
        <div style="font-size:12px;color:#e2e8f0">
          Stamina: <b style="color:var(--teal-hi)">${Math.round(p.stamina.current)} / ${p.stamina.max} STM</b>
          (Long Rest memajukan kalender +8 jam / +2 hari WD &amp; memulihkan Stamina 100%).
        </div>
      </div>

      <div class="card ${hasOwnHere ? "warm" : ""}">
        <div class="card-head">
          <div>
            <div class="card-title">🏠 Istirahat di Bengkel Utama / Cabang Sendiri</div>
            <div class="card-sub">Biaya <b>Gratis (0 br)</b> • Memulihkan <b>100% STM</b> &amp; <b>menghapus seluruh Kutukan Gate</b>!</div>
          </div>
          <span class="badge ok">0 br</span>
        </div>
        <button class="btn btn-primary" id="btn-do-rest-own">
          🏠 Istirahat di Bengkel / Cabang (Gratis + Bersihkan Kutukan)
        </button>
      </div>

      <div class="card">
        <div class="card-head">
          <div>
            <div class="card-title">🏨 Sewa Kamar Penginapan Kota Luar</div>
            <div class="card-sub">Tersedia di semua 77 kota (~${innCostEst}) • Pulihkan 100% STM (Kutukan Gate membutuhkan fasilitas bengkel sendiri).</div>
          </div>
          <span class="badge">~${innCostEst}</span>
        </div>
        <button class="btn btn-secondary" id="btn-do-rest-inn">
          🏨 Menginap di Penginapan Kota
        </button>
      </div>

      ${p.unspentStatPoints > 0 ? `
        <div class="card warm">
          <div class="card-head">
            <div>
              <div class="card-title">⬆ Poin Stat Belum Terpakai: +${p.unspentStatPoints} Poin</div>
              <div class="card-sub">Anda dapat mengalokasikan manual di tab Class &amp; Skill atau isi otomatis sesuai senjata (${primaryStat}).</div>
            </div>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn btn-primary btn-xs" id="btn-rest-open-stat">🌳 Alokasi Manual &amp; Fokus Profesi</button>
            <button class="btn btn-secondary btn-xs" id="btn-rest-auto-stat">⚡ Auto-Isi ke ${primaryStat}</button>
          </div>
        </div>
      ` : ""}
    `;

    el.querySelector("#btn-do-rest-own").onclick = () => {
      const res = Bridge.performLongRest({ atOwnWorkshopOrBranch: true });
      if (global.BSRPG_AUDIO) global.BSRPG_AUDIO.play("rest");
      setRestModal(false);
      showToast(`🏠 Istirahat selesai! STM penuh${res.cursesCleared ? " & Kutukan Gate dibersihkan" : ""}.`);
    };

    el.querySelector("#btn-do-rest-inn").onclick = () => {
      const res = Bridge.performLongRest({ atOwnWorkshopOrBranch: false });
      if (global.BSRPG_AUDIO) global.BSRPG_AUDIO.play("rest");
      setRestModal(false);
      showToast(`🏨 Menginap di penginapan selesai (biaya ${B.formatCurrency(res.costPaid || 0)})!`);
    };

    const btnOpenSt = el.querySelector("#btn-rest-open-stat");
    if (btnOpenSt) {
      btnOpenSt.onclick = () => {
        setRestModal(false);
        uiState.route = "class";
        if (global.BSRPG_SCREEN_CLASS?.openStatTab) global.BSRPG_SCREEN_CLASS.openStatTab();
        renderStage(Bridge.getSnapshot());
      };
    }

    const btnAutoSt = el.querySelector("#btn-rest-auto-stat");
    if (btnAutoSt) {
      btnAutoSt.onclick = () => {
        Bridge.autoAllocateStats(primaryStat);
        showToast(`⚡ Poin Stat dialokasikan otomatis ke ${primaryStat}!`);
      };
    }
  }

  function renderStage(snap) {
    document.querySelectorAll("#mw-nav .mw-tab").forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-route") === uiState.route);
    });

    const body = document.getElementById("stage-body");

    const navCallbacks = {
      showToast,
      goToRoute(targetRoute) {
        uiState.route = targetRoute;
        renderStage(Bridge.getSnapshot());
      }
    };

    if (uiState.route === "battle") {
      global.BSRPG_SCREEN_BATTLE.render(body, snap, navCallbacks);
      return;
    }

    if (uiState.route === "class") {
      global.BSRPG_SCREEN_CLASS.render(body, snap, showToast);
      return;
    }

    if (uiState.route === "forge") {
      global.BSRPG_SCREEN_FORGE.render(body, snap, showToast);
      return;
    }

    if (uiState.route === "market") {
      global.BSRPG_SCREEN_MARKET.render(body, snap, showToast);
      return;
    }

    if (uiState.route === "shop") {
      global.BSRPG_SCREEN_SHOP.render(body, snap, showToast);
      return;
    }

    if (uiState.route === "map") {
      global.BSRPG_SCREEN_MAP.render(body, snap, navCallbacks);
      return;
    }

    if (uiState.route === "issue") {
      const iss = snap.activeIssue;
      body.innerHTML = iss
        ? `
          <div class="card warm">
            <div class="card-head">
              <div>
                <div class="card-title">📜 Isu Moral Aktif — ${iss.theme} (${iss.tier})</div>
                <div class="card-sub">ID: ${iss.id} • Kedaluwarsa: ${iss.expires_in_sessions} sesi</div>
              </div>
              <span class="badge ok">Issue Engine Aktif</span>
            </div>
            <p style="margin:4px 0;font-size:12.5px;color:#e2e8f0;line-height:1.5">${iss.text}</p>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <button data-moral="Mulia" class="btn btn-primary">✦ Mulia (+5 Conscience, +1 Loyalitas)</button>
              <button data-moral="Kejam" class="btn btn-danger">✦ Kejam (-5 Conscience, -1 Loyalitas)</button>
              <button data-moral="Netral" class="btn btn-secondary">• Netral</button>
            </div>
          </div>
        `
        : `
          <div class="card">
            <div class="card-title">📜 Belum Ada Isu Moral Aktif</div>
            <div class="card-sub">Jalankan Idle minimal 1 jam (≥ 3 hari kalender dunia) di tab <b>⚔️ Misi &amp; Idle</b> untuk membangkitkan kartu isu deterministik dari 36 templat WD-4.15.</div>
          </div>
        `;
      body.querySelectorAll("[data-moral]").forEach(btn => {
        btn.onclick = () => {
          const ch = btn.getAttribute("data-moral");
          Bridge.resolveMoralIssue(ch);
          showToast(`⚖️ Isu diputuskan: ${ch}`);
        };
      });
    }
  }

  function renderItemModal(snap) {
    if (!uiState.itemModalOpen) return;
    const p = snap.player;
    const eq = snap.equipment;
    const armorSlots = eq.armorSlots || {};
    const gallery = snap.state.inventory.forgedGallery || [];
    const matEntries = Object.entries(snap.state.inventory.materials || {});
    document.getElementById("item-modal-meta").textContent =
      `Kas: ${snap.bronzeFormatted} • Tempaan: ${gallery.length}/12 • Bahan: ${matEntries.length} jenis`;

    const statsOrder = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
    const statsHtml = statsOrder.map(k => `
      <button class="stat-row-btn ${uiState.activeStatKey === k ? "active" : ""}" data-stat="${k}">
        <span><b style="color:var(--sky)">${k}</b></span>
        <span><b>${p.stats[k]}</b>/${snap.statCap} ▸</span>
      </button>
    `).join("");

    // Conscience Arch indicator (Mulia > 0 kiri, Kejam < 0 kanan)
    const cScore = p.conscienceScore || 0;
    const norm = Math.max(-1, Math.min(1, cScore / 30));
    const angleRad = Math.PI * (0.5 - norm * 0.42);
    const dotX = (110 - Math.cos(angleRad) * 90).toFixed(1);
    const dotY = (56 - Math.sin(angleRad) * 46).toFixed(1);
    const cLabel = cScore > 0 ? `MULIA +${cScore}` : cScore < 0 ? `KEJAM ${cScore}` : "NETRAL 0";

    const forgedBagItems = gallery.map(g => ({
      id: `GEAR:${g.uid}`,
      uid: g.uid,
      kind: "gear",
      icon: g.itemType === "armor" ? "🛡️" : "⚔️",
      badgeText: g.enhancePlus > 0 ? `+${g.enhancePlus}` : (g.rarity?.[0] || "C"),
      name: g.name,
      rarity: g.rarity || "Common",
      canFuse: Boolean(g.canFuse),
      desc: `${g.itemType === "armor" ? `Armor ${g.armorSlot} (${g.armorClass})` : `Senjata ${g.stat} (${g.tag})`} • Kualitas: ${g.qualityName || "Standar"} • Trigger: ${g.trigger || g.triggerName || "-"} • Elemen: ${g.element || "Neutral"}${g.hybridFusion ? ` (${g.hybridFusion.name || g.hybridFusion})` : ""}`
    }));

    const matBagItems = matEntries.map(([id, qty]) => {
      const mInfo = Bridge.resolveDropName ? Bridge.resolveDropName(id) : { name: id, rarity: "Common", category: "Material" };
      return {
        id: `MAT:${id}`,
        matId: id,
        kind: "material",
        icon: "🪨",
        badgeText: `x${qty}`,
        name: `${mInfo.name} (${id})`,
        qty,
        desc: `${mInfo.category} • Rarity: ${mInfo.rarity} — Bahan siap pakai di tab 🔥 Bengkel atau dijual di ⚖️ Pasar S&D.`
      };
    });

    const bagItems = [...forgedBagItems, ...matBagItems];
    const minSlots = Math.max(15, Math.ceil(bagItems.length / 5) * 5);
    const tilesHtml = bagItems.map(it => `
      <button class="icon-tile ${uiState.selectedBagKey === it.id ? "selected" : ""}" data-bag-id="${it.id}" title="${it.name}" style="${it.kind === "gear" ? "border-color:rgba(226,155,56,0.55)" : ""}">
        <span>${it.icon}</span>
        <span class="tile-qty">${it.badgeText}</span>
      </button>
    `).join("") + Array.from({ length: Math.max(0, minSlots - bagItems.length) }, () => `<div class="icon-tile empty"></div>`).join("");

    const paperSlots = {
      Helm:    { key: "EQ:Helm",    icon: "⛑️", item: armorSlots.Helm,    fallback: "Slot Helm (Kosong)" },
      Zirah:   { key: "EQ:Zirah",   icon: "🦺", item: armorSlots.Zirah,   fallback: `Zirah Standar (${eq.armorClass})` },
      Sepatu:  { key: "EQ:Sepatu",  icon: "🥾", item: armorSlots.Sepatu,  fallback: "Slot Sepatu (Kosong)" },
      Weapon:  { key: "EQ:Weapon",  icon: "🪓", item: eq.weapon,          fallback: "Senjata" },
      Perisai: { key: "EQ:Perisai", icon: "🛡️", item: armorSlots.Perisai, fallback: "Slot Perisai (Kosong)" },
      Sarung:  { key: "EQ:Sarung",  icon: "🧤", item: armorSlots.Sarung,  fallback: "Slot Sarung Tangan (Kosong)" }
    };

    const renderPaperTile = (slotKey) => {
      const s = paperSlots[slotKey];
      const active = uiState.selectedBagKey === s.key;
      const filled = Boolean(s.item);
      return `
        <button class="icon-tile ${active ? "selected" : ""}" data-bag-id="${s.key}" style="width:44px;height:44px;${filled ? "border-color:var(--amber)" : ""}" title="${s.item ? s.item.name : s.fallback}">
          <span>${s.icon}</span>
          ${s.item && s.item.enhancePlus > 0 ? `<span class="tile-qty">+${s.item.enhancePlus}</span>` : ""}
        </button>
      `;
    };

    let subPopHtml = "";
    if (uiState.activeStatKey) {
      const subs = snap.build.subStats.byStat[uiState.activeStatKey] || [];
      subPopHtml = `
        <div class="floating-popover" style="left:212px">
          <div class="modal-head" style="padding:7px 10px">
            <strong style="font-size:12px;color:var(--sky)">${uiState.activeStatKey} — 10 Sub-Stat (★ Fokus Profesi)</strong>
            <button id="btn-close-subpop" class="chip-btn">✕</button>
          </div>
          <div style="padding:8px;overflow-y:auto;font-size:11px;display:flex;flex-direction:column;gap:4px" class="thin-scroll">
            ${subs.map(s => `
              <div style="display:flex;justify-content:space-between;gap:6px;padding:3px 6px;border-radius:6px;background:${s.isFocused ? "rgba(226,155,56,0.18)" : "#13202e"}">
                <span>${s.isFocused ? "★ " : ""}${s.name}</span>
                <b style="color:${s.isFocused ? "var(--amber-hi)" : "var(--sky)"}">${s.value}${s.unit === "pct" ? "%" : ""}</b>
              </div>
            `).join("")}
          </div>
        </div>
      `;
    }

    let bubbleHtml = "";
    if (uiState.selectedBagKey) {
      if (uiState.selectedBagKey.startsWith("EQ:")) {
        const slotName = uiState.selectedBagKey.slice(3);
        const s = paperSlots[slotName];
        if (s) {
          const it = s.item;
          bubbleHtml = `
            <div class="floating-popover" style="right:298px;border-color:var(--amber)">
              <div class="modal-head" style="padding:7px 10px">
                <strong style="font-size:12px;color:var(--amber-hi)">${s.icon} Perlengkapan Tubuh</strong>
                <button id="btn-close-bagpop" class="chip-btn">✕</button>
              </div>
              <div style="padding:10px;font-size:12px;display:flex;flex-direction:column;gap:8px">
                ${it ? `
                  <div><b>${it.name}</b> <span class="badge">${it.rarity || "Common"}</span></div>
                  <div style="color:var(--muted);font-size:11.5px">
                    Stat: <b>${it.stat}</b> • Trigger: <b>${it.trigger || it.triggerName || "-"}</b> • Elemen: <b>${it.element || "Neutral"}</b>
                  </div>
                  <div style="display:flex;gap:6px;flex-wrap:wrap">
                    <button class="btn btn-primary btn-xs" data-modal-goto-enh="${it.uid}">⚡ Enhance +N</button>
                    ${slotName !== "Weapon" ? `<button class="btn btn-secondary btn-xs" data-modal-unequip="${slotName}">↩ Lepas ke Galeri</button>` : ""}
                  </div>
                ` : `
                  <div style="color:var(--muted);font-size:11.5px">${s.fallback}. Tempa armor slot ini di tab <b>🔥 Bengkel</b>!</div>
                  <button class="btn btn-primary btn-xs" id="btn-modal-open-forge">🔥 Buka Bengkel Tempa</button>
                `}
              </div>
            </div>
          `;
        }
      } else {
        const picked = bagItems.find(x => x.id === uiState.selectedBagKey);
        if (picked) {
          bubbleHtml = `
            <div class="floating-popover" style="right:298px;border-color:var(--amber)">
              <div class="modal-head" style="padding:7px 10px">
                <strong style="font-size:12px;color:var(--amber-hi)">🎒 Info Item</strong>
                <button id="btn-close-bagpop" class="chip-btn">✕</button>
              </div>
              <div style="padding:10px;font-size:12px;display:flex;flex-direction:column;gap:8px">
                <div><b>${picked.name}</b> <span class="badge">${picked.badgeText}</span></div>
                <div style="color:var(--muted);font-size:11.5px">${picked.desc}</div>
                ${picked.kind === "gear" ? `
                  <div style="display:flex;gap:6px;flex-wrap:wrap">
                    <button class="btn btn-primary btn-xs" data-modal-equip="${picked.uid}">⚔️ Pasang</button>
                    <button class="btn btn-secondary btn-xs" data-modal-goto-enh="${picked.uid}">⚡ +N</button>
                    ${picked.canFuse ? `<button class="btn btn-secondary btn-xs" data-modal-goto-fuse="${picked.uid}">🔮 Fusi</button>` : ""}
                    <button class="btn btn-danger btn-xs" data-modal-scrap="${picked.uid}">♻️ Bongkar</button>
                  </div>
                ` : `
                  <div style="display:flex;gap:6px;flex-wrap:wrap">
                    <button class="btn btn-primary btn-xs" id="btn-modal-open-forge">🔥 Pakai di Meja Tempa</button>
                    <button class="btn btn-secondary btn-xs" id="btn-modal-open-market">⚖️ Jual di Pasar S&amp;D</button>
                  </div>
                `}
              </div>
            </div>
          `;
        }
      }
    }

    const body = document.getElementById("item-modal-body");
    body.innerHTML = `
      <div class="char-col-left thin-scroll" style="overflow-y:auto">
        <div style="margin-bottom:8px">
          <div style="font-weight:800;font-size:14px;color:#fff">${p.name}</div>
          <div style="font-size:11px;color:var(--amber-hi)">${snap.build.smith.singleWordClassName} • Lv.${p.level}</div>
        </div>
        <div style="font-size:10px;color:var(--muted);margin-bottom:5px;text-transform:uppercase">Stat Karakter (Klik → Sub-Stat)</div>
        ${statsHtml}
      </div>

      <div class="char-col-center" style="align-items:center;justify-content:space-between">
        <div style="display:flex;align-items:center;justify-content:center;gap:14px;flex:1;width:100%">
          <div style="display:flex;flex-direction:column;gap:8px">
            ${renderPaperTile("Helm")}
            ${renderPaperTile("Zirah")}
            ${renderPaperTile("Sepatu")}
          </div>
          <div style="text-align:center;max-width:165px">
            <div style="font-size:62px;line-height:1">🛡️</div>
            <div style="font-size:11px;color:var(--teal-hi);margin-top:6px;font-weight:700">${eq.weapon?.name || "-"}</div>
            <div style="font-size:10px;color:var(--muted)">Armor Aktif: ${String(eq.armorClass || "sedang").toUpperCase()} (${eq.armorElement})</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:8px">
            ${renderPaperTile("Weapon")}
            ${renderPaperTile("Perisai")}
            ${renderPaperTile("Sarung")}
          </div>
        </div>

        <div style="text-align:center;width:210px">
          <svg viewBox="0 0 220 64" style="width:195px;height:auto;overflow:visible">
            <path d="M 20 54 A 90 90 0 0 1 200 54" fill="none" stroke="#1e293b" stroke-width="9" stroke-linecap="round"/>
            <path d="M 20 54 A 90 90 0 0 1 110 10" fill="none" stroke="#38bdf8" stroke-width="7" stroke-linecap="round"/>
            <path d="M 110 10 A 90 90 0 0 1 200 54" fill="none" stroke="#ef4444" stroke-width="7" stroke-linecap="round"/>
            <circle cx="${dotX}" cy="${dotY}" r="6" fill="#fff" stroke="#38bdf8" stroke-width="2.5"/>
            <text x="110" y="38" text-anchor="middle" fill="#94a3b8" font-size="8.5" font-weight="700">CONSCIENCE</text>
            <text x="110" y="53" text-anchor="middle" fill="#7dd3fc" font-size="11.5" font-weight="800">${cLabel}</text>
          </svg>
        </div>
      </div>

      <div class="char-col-right thin-scroll" style="overflow-y:auto">
        <div style="font-size:12px;font-weight:800;color:var(--amber-hi);margin-bottom:8px">🎒 Tas Item &amp; Hasil Tempa</div>
        <div class="bag-icon-grid">${tilesHtml}</div>
      </div>

      ${subPopHtml}
      ${bubbleHtml}
    `;

    body.querySelectorAll("[data-stat]").forEach(btn => {
      btn.onclick = () => {
        const k = btn.getAttribute("data-stat");
        uiState.activeStatKey = uiState.activeStatKey === k ? null : k;
        uiState.selectedBagKey = null;
        renderItemModal(Bridge.getSnapshot());
      };
    });
    body.querySelectorAll("[data-bag-id]").forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute("data-bag-id");
        uiState.selectedBagKey = uiState.selectedBagKey === id ? null : id;
        uiState.activeStatKey = null;
        renderItemModal(Bridge.getSnapshot());
      };
    });
    const closeSub = document.getElementById("btn-close-subpop");
    if (closeSub) closeSub.onclick = () => { uiState.activeStatKey = null; renderItemModal(Bridge.getSnapshot()); };
    const closeBag = document.getElementById("btn-close-bagpop");
    if (closeBag) closeBag.onclick = () => { uiState.selectedBagKey = null; renderItemModal(Bridge.getSnapshot()); };

    body.querySelectorAll("[data-modal-equip]").forEach(btn => {
      btn.onclick = () => {
        const r = Bridge.equipForgedItem(btn.getAttribute("data-modal-equip"));
        uiState.selectedBagKey = null;
        showToast(r.ok ? `⚔️ Dipasang: ${r.equipped.name}` : `⚠ ${r.reason}`);
      };
    });
    body.querySelectorAll("[data-modal-unequip]").forEach(btn => {
      btn.onclick = () => {
        const r = Bridge.unequipArmorSlot(btn.getAttribute("data-modal-unequip"));
        uiState.selectedBagKey = null;
        showToast(r.ok ? `↩ Dilepas ke Galeri: ${r.item.name}` : `⚠ ${r.reason}`);
      };
    });
    body.querySelectorAll("[data-modal-scrap]").forEach(btn => {
      btn.onclick = () => {
        const r = Bridge.scrapGalleryItem(btn.getAttribute("data-modal-scrap"));
        uiState.selectedBagKey = null;
        showToast(r.ok ? `♻️ Dibongkar: +${B.formatCurrency(r.refundBr)}` : `⚠ ${r.reason}`);
      };
    });
    body.querySelectorAll("[data-modal-goto-enh]").forEach(btn => {
      btn.onclick = () => {
        const uid = btn.getAttribute("data-modal-goto-enh");
        setItemModal(false);
        uiState.route = "forge";
        if (global.BSRPG_SCREEN_FORGE?.openSubTab) global.BSRPG_SCREEN_FORGE.openSubTab("enhance", uid);
        renderStage(Bridge.getSnapshot());
      };
    });
    body.querySelectorAll("[data-modal-goto-fuse]").forEach(btn => {
      btn.onclick = () => {
        const uid = btn.getAttribute("data-modal-goto-fuse");
        setItemModal(false);
        uiState.route = "forge";
        if (global.BSRPG_SCREEN_FORGE?.openSubTab) global.BSRPG_SCREEN_FORGE.openSubTab("fusion", uid);
        renderStage(Bridge.getSnapshot());
      };
    });
    const openForgeBtn = body.querySelector("#btn-modal-open-forge");
    if (openForgeBtn) {
      openForgeBtn.onclick = () => {
        setItemModal(false);
        uiState.route = "forge";
        if (global.BSRPG_SCREEN_FORGE?.openSubTab) global.BSRPG_SCREEN_FORGE.openSubTab("craft");
        renderStage(Bridge.getSnapshot());
      };
    }
    const openMktBtn = body.querySelector("#btn-modal-open-market");
    if (openMktBtn) {
      openMktBtn.onclick = () => {
        setItemModal(false);
        uiState.route = "market";
        renderStage(Bridge.getSnapshot());
      };
    }
  }

  function renderAll(snap) {
    const startEl = document.getElementById("window-start");
    const shellEl = document.getElementById("app-shell");

    if (!uiState.inGameplay) {
      startEl.classList.remove("hidden");
      shellEl.classList.add("hidden");
      global.BSRPG_SCREEN_CREATE.render(startEl, snap, {
        onEnterGameplay() {
          uiState.inGameplay = true;
          uiState.route = "battle";
          renderAll(Bridge.getSnapshot());
        },
        onTogglePortrait() {
          setPortraitPreview(!document.body.classList.contains("mode-portrait"));
        },
        onToast: showToast
      });
      return;
    }

    startEl.classList.add("hidden");
    shellEl.classList.remove("hidden");
    renderHud(snap);
    renderStage(snap);
    renderItemModal(snap);
    renderRestModal(snap);
  }

  function setItemModal(open) {
    uiState.itemModalOpen = open;
    document.getElementById("modal-item").classList.toggle("hidden", !open);
    if (open) renderItemModal(Bridge.getSnapshot());
  }

  function setSettingsModal(open) {
    uiState.settingsOpen = open;
    document.getElementById("modal-settings").classList.toggle("hidden", !open);
  }

  function setRestModal(open) {
    uiState.restModalOpen = open;
    document.getElementById("modal-rest").classList.toggle("hidden", !open);
    if (open) renderRestModal(Bridge.getSnapshot());
  }

  // Event Bindings
  document.querySelectorAll("#mw-nav .mw-tab").forEach(btn => {
    btn.onclick = () => {
      if (global.BSRPG_AUDIO) global.BSRPG_AUDIO.play("ui_click");
      uiState.route = btn.getAttribute("data-route");
      renderStage(Bridge.getSnapshot());
    };
  });

  document.getElementById("btn-global-rest").onclick = () => {
    if (global.BSRPG_AUDIO) global.BSRPG_AUDIO.play("ui_click");
    setRestModal(true);
  };
  document.getElementById("btn-close-rest").onclick = () => setRestModal(false);
  document.getElementById("modal-rest").onclick = e => { if (e.target.id === "modal-rest") setRestModal(false); };

  document.getElementById("btn-global-stat").onclick = () => {
    if (global.BSRPG_AUDIO) global.BSRPG_AUDIO.play("ui_click");
    uiState.route = "class";
    if (global.BSRPG_SCREEN_CLASS?.openStatTab) global.BSRPG_SCREEN_CLASS.openStatTab();
    renderStage(Bridge.getSnapshot());
  };

  document.getElementById("btn-item-trigger").onclick = () => {
    if (global.BSRPG_AUDIO) global.BSRPG_AUDIO.play("ui_click");
    setItemModal(true);
  };
  document.getElementById("btn-avatar").onclick = () => {
    if (global.BSRPG_AUDIO) global.BSRPG_AUDIO.play("ui_click");
    setItemModal(true);
  };
  document.getElementById("btn-close-item").onclick = () => setItemModal(false);
  document.getElementById("modal-item").onclick = e => { if (e.target.id === "modal-item") setItemModal(false); };

  document.getElementById("btn-hud-map").onclick = () => {
    if (global.BSRPG_AUDIO) global.BSRPG_AUDIO.play("ui_click");
    uiState.route = "map";
    renderStage(Bridge.getSnapshot());
  };
  document.getElementById("btn-hud-quest").onclick = () => {
    if (global.BSRPG_AUDIO) global.BSRPG_AUDIO.play("ui_click");
    uiState.questOpen = !uiState.questOpen;
    document.getElementById("quest-drawer").classList.toggle("hidden", !uiState.questOpen);
  };
  document.getElementById("btn-close-quest").onclick = () => {
    uiState.questOpen = false;
    document.getElementById("quest-drawer").classList.add("hidden");
  };

  document.getElementById("btn-open-settings").onclick = () => {
    if (global.BSRPG_AUDIO) global.BSRPG_AUDIO.play("ui_click");
    syncAudioControls();
    syncPerfControls();
    setSettingsModal(true);
  };
  document.getElementById("btn-hud-settings-sm").onclick = () => {
    if (global.BSRPG_AUDIO) global.BSRPG_AUDIO.play("ui_click");
    syncAudioControls();
    syncPerfControls();
    setSettingsModal(true);
  };
  document.getElementById("btn-close-settings").onclick = () => setSettingsModal(false);
  document.getElementById("modal-settings").onclick = e => { if (e.target.id === "modal-settings") setSettingsModal(false); };

  // Fase 4: Sinkronisasi & Binding Audio SFX (.ogg) di Modal UI & Save
  function syncAudioControls() {
    if (!global.BSRPG_AUDIO) return;
    const st = global.BSRPG_AUDIO.getState();
    const muteBtn = document.getElementById("btn-audio-mute");
    const volSlider = document.getElementById("set-audio-vol");
    const volLbl = document.getElementById("lbl-audio-vol");
    if (muteBtn) {
      muteBtn.textContent = st.muted ? "🔇 Mute" : "🔊 Aktif";
      muteBtn.classList.toggle("danger", st.muted);
      muteBtn.classList.toggle("teal", !st.muted);
    }
    if (volSlider) volSlider.value = String(st.volumePct);
    if (volLbl) volLbl.textContent = `${st.volumePct}%`;
  }

  // Fase 5: Sinkronisasi & Binding Lite Mode Oppo A54 + Monitor RAM
  function syncPerfControls() {
    if (!global.BSRPG_PERF) return;
    const st = global.BSRPG_PERF.getState();
    const btnLite = document.getElementById("btn-lite-mode");
    const ramLbl = document.getElementById("perf-ram-summary");
    if (btnLite) {
      btnLite.textContent = st.liteMode ? "🌿 Lite: ON" : "⚡ Lite: OFF";
      btnLite.classList.toggle("teal", st.liteMode);
    }
    if (ramLbl) {
      const heapTxt = st.jsHeapMb != null ? ` • JS Heap ${st.jsHeapMb} MB` : "";
      ramLbl.textContent = `${st.areasInRam}/${st.totalAreas} Area di RAM${heapTxt} • 0 backdrop-filter`;
    }
  }

  const btnLiteMode = document.getElementById("btn-lite-mode");
  if (btnLiteMode && global.BSRPG_PERF) {
    btnLiteMode.onclick = () => {
      const st = global.BSRPG_PERF.toggleLiteMode();
      syncPerfControls();
      if (global.BSRPG_AUDIO) global.BSRPG_AUDIO.play("ui_click");
      showToast(st.liteMode
        ? "🌿 Lite Mode Oppo A54 AKTIF (animasi berulang dimatikan, ekstra hemat baterai/RAM)"
        : "⚡ Mode Normal AKTIF (animasi 5-frame & efek ringan aktif)");
    };
  }
  syncPerfControls();

  // Fase 5: Integrasi Tombol Back Android (Capacitor APK)
  if (global.BSRPG_CAPACITOR) {
    global.BSRPG_CAPACITOR.registerBackHandler(() => {
      if (uiState.itemModalOpen) { setItemModal(false); return true; }
      if (uiState.restModalOpen) { setRestModal(false); return true; }
      if (uiState.settingsOpen) { setSettingsModal(false); return true; }
      if (uiState.questOpen) {
        uiState.questOpen = false;
        document.getElementById("quest-drawer").classList.add("hidden");
        return true;
      }
      return false;
    });
  }

  const btnAudioMute = document.getElementById("btn-audio-mute");
  if (btnAudioMute && global.BSRPG_AUDIO) {
    btnAudioMute.onclick = () => {
      const st = global.BSRPG_AUDIO.toggleMute();
      syncAudioControls();
      if (!st.muted) global.BSRPG_AUDIO.play("ui_click");
      showToast(st.muted ? "🔇 Audio SFX dimatikan (Mute)" : `🔊 Audio SFX aktif (${st.volumePct}%)`);
    };
  }
  const setAudioVol = document.getElementById("set-audio-vol");
  if (setAudioVol && global.BSRPG_AUDIO) {
    setAudioVol.oninput = e => {
      global.BSRPG_AUDIO.setVolume(Number(e.target.value) / 100);
      syncAudioControls();
    };
  }
  const btnAudioTest = document.getElementById("btn-audio-test");
  if (btnAudioTest && global.BSRPG_AUDIO) {
    btnAudioTest.onclick = () => {
      const st = global.BSRPG_AUDIO.getState();
      if (st.muted) {
        showToast("🔇 Audio sedang Mute. Aktifkan dulu untuk uji suara.");
        return;
      }
      global.BSRPG_AUDIO.testSound();
      showToast("🔨 Memutar SFX palu tempa (.ogg)...");
    };
  }
  syncAudioControls();

  const btnTogglePortrait = document.getElementById("btn-toggle-portrait");
  const btnExitPortrait = document.getElementById("btn-exit-portrait");
  function setPortraitPreview(on) {
    document.body.classList.toggle("mode-portrait", on);
    if (btnExitPortrait) btnExitPortrait.classList.toggle("hidden", !on);
  }
  if (btnTogglePortrait) btnTogglePortrait.onclick = () => {
    setPortraitPreview(true);
    showToast("📱 Mode HP Oppo A54 Portrait (390px) aktif");
  };
  if (btnExitPortrait) btnExitPortrait.onclick = () => {
    setPortraitPreview(false);
    showToast("💻 Kembali ke Mode Laptop");
  };

  // Dynamic HUD Scale sliders
  document.getElementById("set-scale-global").oninput = e => {
    const v = Number(e.target.value);
    uiState.scale = { global: v, tl: v, tr: v, bm: v };
    applyScale();
  };
  for (const k of ["tl", "tr", "bm"]) {
    document.getElementById(`set-scale-${k}`).oninput = e => {
      uiState.scale[k] = Number(e.target.value);
      applyScale();
    };
  }
  document.getElementById("btn-reset-scale").onclick = () => {
    uiState.scale = { global: 100, tl: 100, tr: 100, bm: 100 };
    applyScale();
    showToast("↺ Ukuran HUD dikembalikan ke 100%");
  };

  // Sparse Save / Load / Reset & Menu Awal
  document.getElementById("btn-export-save").onclick = () => {
    const json = Bridge.exportSave();
    document.getElementById("save-json-box").value = json;
    showToast(`📤 Save diekspor (${(json.length / 1024).toFixed(2)} KB)`);
  };
  document.getElementById("btn-import-save").onclick = () => {
    const raw = document.getElementById("save-json-box").value.trim();
    if (!raw) return showToast("⚠ Tempel teks JSON Save terlebih dahulu.");
    try {
      Bridge.importSave(raw);
      setSettingsModal(false);
      showToast("📥 Save berhasil dimuat!");
    } catch (err) {
      showToast(`⚠ JSON Save tidak valid: ${err.message}`);
    }
  };
  document.getElementById("btn-reset-save").onclick = () => {
    setSettingsModal(false);
    uiState.inGameplay = false;
    global.BSRPG_SCREEN_CREATE.openTitleMode();
    Bridge.resetSave();
    showToast("🗑️ Save dihapus. Silakan buat karakter baru.");
  };
  document.getElementById("btn-go-start-window").onclick = () => {
    setSettingsModal(false);
    uiState.inGameplay = false;
    global.BSRPG_SCREEN_CREATE.openTitleMode();
    renderAll(Bridge.getSnapshot());
  };

  // Global Keyboard Shortcuts: [I] Item, [Esc] Tutup
  window.addEventListener("keydown", e => {
    if (!uiState.inGameplay) return;
    if (document.activeElement && ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) return;
    if (e.key === "i" || e.key === "I") {
      e.preventDefault();
      setItemModal(!uiState.itemModalOpen);
    } else if (e.key === "Escape") {
      if (uiState.itemModalOpen) setItemModal(false);
      else if (uiState.restModalOpen) setRestModal(false);
      else if (uiState.settingsOpen) setSettingsModal(false);
    }
  });

  Bridge.subscribe(renderAll);
  applyScale();
  renderAll(Bridge.getSnapshot());
})(window);
