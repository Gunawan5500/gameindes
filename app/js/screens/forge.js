/**
 * Battle-Smith RPG — Fase 3A: Bengkel Tempa (63 Resep), Fusi Inti Kedua & Enhance +N
 * Dirancang lega & bertahap (3 Sub-Tab terpisah) agar nyaman di Laptop maupun HP Oppo A54 Portrait.
 * Terhubung 100% ke forge_engine.js & computeWeaponEnhancement di skill_engine.js (0% ubah engines/).
 */
(function (global) {
  "use strict";

  const Bridge = global.BSRPG_BRIDGE;
  const B = global.BSRPG_BACKEND;

  const SLOT_LABELS = ["Slot 1 — Inti", "Slot 2 — Badan", "Slot 3 — Pengikat", "Slot 4 — Aksen"];
  const ELEMENTS = [
    { id: "",       lbl: "⚪ Tanpa Inti" },
    { id: "api",    lbl: "🔥 Api (Fire)" },
    { id: "es",     lbl: "❄️ Es (Ice)" },
    { id: "petir",  lbl: "⚡ Petir (Lightning)" },
    { id: "tanah",  lbl: "🪨 Tanah (Earth)" },
    { id: "cahaya", lbl: "☀️ Cahaya (Light)" },
    { id: "gelap",  lbl: "🌑 Gelap (Dark)" }
  ];

  const ui = {
    subTab: "craft",       // "craft" | "fusion" | "enhance" | "codex"
    category: "weapon",    // "weapon" | "armor"
    filterKey: "ALL",      // Stat untuk senjata, Slot untuk armor
    codexFilter: "ALL",    // "ALL" | "WEAPON" | "ARMOR" | "FORGED"
    selectedRecipeId: null,
    slotMatIds: ["", "", "", ""],
    coreElement: "petir",
    coreSize: "sedang",
    selectedFusionUid: null,
    secondElementId: "es",
    selectedEnhanceUid: null,
    selectedCatalystMatId: null,
    showStatGuide: true
  };

  function esc(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function openSubTab(subTab, targetUid = null) {
    ui.subTab = subTab;
    if (subTab === "fusion" && targetUid) ui.selectedFusionUid = targetUid;
    if (subTab === "enhance" && targetUid) ui.selectedEnhanceUid = targetUid;
  }

  function getOwnedMaterialsList(snap) {
    const entries = Object.entries(snap.state.inventory.materials || {}).filter(([, q]) => q > 0);
    return entries.map(([id, qty]) => {
      const pm = snap.catalogs.parsedMaterialsById?.[id];
      const m = snap.catalogs.materialsById?.[id];
      return {
        id,
        qty,
        name: m?.material_name || pm?.n || id,
        rarity: m?.rarity || pm?.r || "Common",
        category: m?.category || pm?.k || "Material",
        elementWd: m?.element || pm?.element_wd || "Neutral",
        craftPower: pm?.craft_power_pts || 1,
        tags: pm?.t || []
      };
    }).sort((a, b) => b.craftPower - a.craftPower || b.qty - a.qty);
  }

  function collectAllOwnedGear(snap) {
    const list = [];
    const eq = snap.equipment;
    if (eq.weapon) {
      list.push({ item: eq.weapon, statusLabel: "Dipakai (Senjata)", isEquipped: true });
    }
    for (const [slot, arm] of Object.entries(eq.armorSlots || {})) {
      if (arm) list.push({ item: arm, statusLabel: `Dipakai (${slot})`, isEquipped: true, armorSlot: slot });
    }
    for (const g of (snap.state.inventory.forgedGallery || [])) {
      if (g) list.push({ item: g, statusLabel: "Di Galeri", isEquipped: false });
    }
    return list;
  }

  function autoFillSlotsFromBag(ownedMats, maxSlots) {
    const next = ["", "", "", ""];
    if (!ownedMats.length) return next;
    // Sebarkan stok yang dimiliki ke slot tersedia (utamakan pengikat di slot 3 bila ada)
    const remaining = {};
    for (const m of ownedMats) remaining[m.id] = m.qty;

    for (let i = 0; i < maxSlots; i++) {
      let pick = null;
      if (i === 2) {
        pick = ownedMats.find(m => remaining[m.id] > 0 && m.tags.includes("pengikat"));
      }
      if (!pick) {
        pick = ownedMats.find(m => remaining[m.id] > 0);
      }
      if (pick) {
        next[i] = pick.id;
        remaining[pick.id] -= 1;
      }
    }
    return next;
  }

  // =========================================================================
  // SUB-TAB 1: MEJA TEMPA (63 RESEP SENJATA & ARMOR — TAMPILAN LEGA)
  // =========================================================================
  function renderCraftTab(snap) {
    const p = snap.player;
    const maxSlots = snap.forgeMaxSlots || 2;
    const ownedMats = getOwnedMaterialsList(snap);

    const pool = ui.category === "weapon" ? snap.catalogs.weapons : snap.catalogs.armors;
    const filteredRecipes = pool.filter(r => {
      if (ui.filterKey === "ALL") return true;
      return ui.category === "weapon" ? r.stat === ui.filterKey : r.slot === ui.filterKey;
    });

    if (!ui.selectedRecipeId || !filteredRecipes.some(r => r.id === ui.selectedRecipeId)) {
      const defMatch = filteredRecipes.find(r => r.stat === (snap.equipment.weapon?.stat || "STR")) || filteredRecipes[0];
      ui.selectedRecipeId = defMatch ? defMatch.id : pool[0].id;
    }
    const recipe = pool.find(r => r.id === ui.selectedRecipeId) || pool[0];

    // Pastikan isi slot masih valid terhadap isi tas; jika semua kosong & ada bahan di tas, isi otomatis
    const activePicks = ui.slotMatIds.slice(0, maxSlots);
    if (activePicks.every(x => !x) && ownedMats.length > 0) {
      ui.slotMatIds = autoFillSlotsFromBag(ownedMats, maxSlots);
    }

    const validSlotIds = ui.slotMatIds.slice(0, maxSlots).map(id => {
      return (snap.state.inventory.materials?.[id] || 0) > 0 ? id : "";
    });
    const pv = Bridge.previewForgeDraft({
      itemId: recipe.id,
      pickedMaterialIds: validSlotIds,
      coreElement: ui.coreElement,
      coreSize: ui.coreSize
    });

    const filterOptions = ui.category === "weapon"
      ? ["ALL", "STR", "DEX", "CON", "INT", "WIS", "CHA"].map(k =>
          `<option value="${k}" ${ui.filterKey === k ? "selected" : ""}>${k === "ALL" ? "Semua Stat (48)" : `Stat ${k}`}</option>`
        ).join("")
      : ["ALL", "Zirah", "Perisai", "Helm", "Sarung", "Sepatu"].map(k =>
          `<option value="${k}" ${ui.filterKey === k ? "selected" : ""}>${k === "ALL" ? "Semua Slot (15)" : `Slot ${k}`}</option>`
        ).join("");

    const recipeOptions = filteredRecipes.map(r => {
      const meta = r.itemType === "armor"
        ? `[${r.slot} • ${r.armorClass}] ${r.name} (${r.stat})`
        : `[T${r.tier} • ${r.stat} ${r.tag}] ${r.name}`;
      return `<option value="${esc(r.id)}" ${r.id === recipe.id ? "selected" : ""}>${esc(meta)}</option>`;
    }).join("");

    const slotsHtml = [0, 1, 2, 3].map(idx => {
      const locked = idx >= maxSlots;
      const reqLv = idx === 2 ? 11 : idx === 3 ? 21 : 1;
      if (locked) {
        return `
          <div class="forge-slot-row locked">
            <span style="font-size:11.5px;color:var(--muted)">🔒 ${SLOT_LABELS[idx]}</span>
            <span class="badge">Terbuka Lv.${reqLv}</span>
          </div>
        `;
      }
      const curVal = validSlotIds[idx] || "";
      const matOpts = [
        `<option value="">— Kosong —</option>`,
        ...ownedMats.map(m => `<option value="${esc(m.id)}" ${m.id === curVal ? "selected" : ""}>${esc(m.name)} (x${m.qty} • ${esc(m.category)}/${esc(m.rarity)})</option>`)
      ].join("");

      return `
        <div class="forge-slot-row">
          <span style="font-size:11.5px;font-weight:700;color:#e2e8f0;min-width:118px">${SLOT_LABELS[idx]}</span>
          <select class="select-compact" style="flex:1" data-forge-slot="${idx}">
            ${matOpts}
          </select>
        </div>
      `;
    }).join("");

    const resBadgeColor = pv.resonanceStatus === "selaras"
      ? "ok"
      : pv.resonanceStatus === "tegang"
        ? "warn"
        : "";

    const lastRes = snap.lastForgeResult;
    let lastBannerHtml = "";
    if (lastRes) {
      if (lastRes.crafted && lastRes.item) {
        const it = lastRes.item;
        const stillInGallery = (snap.state.inventory.forgedGallery || []).some(g => g.uid === it.uid);
        lastBannerHtml = `
          <div class="card teal" style="margin-bottom:10px">
            <div class="card-head">
              <div>
                <div class="card-title">✨ Hasil Tempa Terakhir: ${esc(it.name)}</div>
                <div class="card-sub">Kualitas: <b>${esc(it.qualityName)} (${esc(it.rarity)})</b> • Mode: <b>${esc(it.modeName)}</b> • +${lastRes.xpGained} Smith XP</div>
              </div>
              <div style="display:flex;gap:6px;flex-wrap:wrap">
                ${stillInGallery ? `<button class="btn btn-primary btn-xs" data-equip-uid="${esc(it.uid)}">⚔️ Pasang Sekarang</button>` : `<span class="badge ok">Sudah Dipakai</span>`}
                ${it.canFuse ? `<button class="btn btn-secondary btn-xs" data-jump-fuse="${esc(it.uid)}">🔮 Lanjut Fusi</button>` : ""}
              </div>
            </div>
          </div>
        `;
      } else if (!lastRes.crafted) {
        lastBannerHtml = `
          <div class="card" style="margin-bottom:10px;border-color:#fb7185">
            <div class="card-title" style="color:#fda4af">💨 Tempa Terakhir Gagal (+${lastRes.xpGained} Smith XP)</div>
            <div class="card-sub">Bahan hilang: ${esc((lastRes.lostMaterials || []).join(", ") || "-")} • Bahan terselamatkan: ${esc((lastRes.keptMaterials || []).join(", ") || "Tidak ada")}</div>
          </div>
        `;
      }
    }

    const Assets = global.BSRPG_ASSETS;
    const selRecipeIcon = getRecipeIconUrl(recipe);
    const matStripHtml = [0, 1, 2, 3].map(idx => {
      const locked = idx >= maxSlots;
      const mid = validSlotIds[idx] || "";
      if (locked) {
        return `<div class="forge-mat-chip locked" title="${SLOT_LABELS[idx]} (Terkunci)"><span>🔒</span></div>`;
      }
      if (!mid) {
        return `<div class="forge-mat-chip empty" title="${SLOT_LABELS[idx]} (Kosong)"><span>+</span></div>`;
      }
      const mObj = ownedMats.find(x => x.id === mid);
      const mIcon = Assets && typeof Assets.getCustomIcon === "function"
        ? Assets.getCustomIcon("materials", mid)
        : "";
      return `
        <div class="forge-mat-chip filled" title="${esc(mObj?.name || mid)}">
          ${mIcon ? `<img src="${mIcon}" alt="${esc(mObj?.name || mid)}" />` : `<span>🪨</span>`}
          <span class="forge-mat-qty">×${mObj?.qty || 1}</span>
        </div>
      `;
    }).join("");

    return `
      ${lastBannerHtml}

      <!-- KARTU SHOWCASE BENGKEL (GAYA SAMPLE: IKON SENJATA BESAR + SLOT BAHAN VISUAL + PELUANG) -->
      <div class="card warm forge-hero-card" style="margin-bottom:10px">
        <div style="display:flex;align-items:center;gap:11px">
          <div class="forge-hero-slot">
            ${selRecipeIcon ? `<img src="${selRecipeIcon}" alt="${esc(recipe.name)}" />` : `<span style="font-size:28px">${recipe.itemType === "armor" ? "🛡️" : "⚔️"}</span>`}
            <span class="forge-hero-tier">T${esc(recipe.tier || 1)}</span>
          </div>
          <div style="min-width:0;flex:1">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:wrap">
              <div class="card-title" style="font-size:14px">${esc(recipe.name)}</div>
              <span class="badge ok">Peluang ${Math.round(pv.successChancePct || 75)}%</span>
            </div>
            <div class="card-sub">Stat Utama: <b style="color:var(--sky)">${esc(recipe.stat)}</b> • Trigger: <b style="color:var(--amber-hi)">${esc(recipe.trigger)}</b></div>
            <div class="forge-mat-strip">${matStripHtml}</div>
          </div>
        </div>
      </div>

      <div class="forge-two-col">
        <!-- KOLOM KIRI: PILIH CETAK BIRU & INTI ELEMEN -->
        <div class="card">
          <div class="card-head">
            <div>
              <div class="card-title">1. Cetak Biru &amp; Inti Elemen</div>
              <div class="card-sub">63 Resep resmi (48 Senjata + 15 Armor)</div>
            </div>
            <div style="display:flex;gap:5px">
              <button class="pill-btn ${ui.category === "weapon" ? "active" : ""}" data-cat="weapon">⚔️ Senjata</button>
              <button class="pill-btn ${ui.category === "armor" ? "active" : ""}" data-cat="armor">🛡️ Armor</button>
            </div>
          </div>

          <div style="display:flex;gap:6px;flex-wrap:wrap">
            <select id="forge-flt-key" class="select-compact">
              ${filterOptions}
            </select>
            <select id="forge-sel-recipe" class="select-compact" style="flex:1;min-width:170px">
              ${recipeOptions}
            </select>
          </div>

          <div class="passive-box">
            <div><b>${esc(recipe.name)}</b> • Stat Utama: <b style="color:var(--sky)">${esc(recipe.stat)}</b> • Trigger: <b style="color:var(--amber-hi)">${esc(recipe.trigger)}</b></div>
            <div style="color:var(--muted);margin-top:2px">
              ${recipe.itemType === "armor"
                ? `Slot ${esc(recipe.slot)} (${recipe.acPct}% AC • ${esc(recipe.armorClass)}) — ${esc(recipe.triggerDesc)}`
                : `Anggaran Dasar: Dmg ${recipe.budget.damage}% • Spd ${recipe.budget.speed}% • Acc ${recipe.budget.accuracy}% • Trg ${recipe.budget.trigger}%`}
            </div>
          </div>

          <div style="display:flex;gap:8px;flex-wrap:wrap;padding-top:2px">
            <label style="flex:1;min-width:140px;display:flex;flex-direction:column;gap:4px;font-size:11px;color:var(--muted)">
              <span>Inti Elemen</span>
              <select id="forge-sel-elem" class="select-compact">
                ${ELEMENTS.map(e => `<option value="${e.id}" ${ui.coreElement === e.id ? "selected" : ""}>${e.lbl}</option>`).join("")}
              </select>
            </label>
            <label style="width:125px;display:flex;flex-direction:column;gap:4px;font-size:11px;color:var(--muted)">
              <span>Ukuran Inti</span>
              <select id="forge-sel-size" class="select-compact" ${!ui.coreElement ? "disabled" : ""}>
                <option value="kecil" ${ui.coreSize === "kecil" ? "selected" : ""}>Kecil (+5%)</option>
                <option value="sedang" ${ui.coreSize === "sedang" ? "selected" : ""}>Sedang (+10%)</option>
                <option value="besar" ${ui.coreSize === "besar" ? "selected" : ""}>Besar (+15%)</option>
              </select>
            </label>
          </div>
        </div>

        <!-- KOLOM KANAN: SLOT BAHAN TAS & EKSEKUSI TEMPA -->
        <div class="card warm">
          <div class="card-head">
            <div>
              <div class="card-title">2. Susunan Bahan (${maxSlots}/4 Slot Terbuka)</div>
              <div class="card-sub">Jenis bahan di Tas: <b>${ownedMats.length}</b> • Stamina: <b>${Math.round(p.stamina.current)}/${p.stamina.max}</b></div>
            </div>
            <button class="chip-btn teal" id="btn-autofill-mats">✨ Isi Otomatis</button>
          </div>

          <div style="display:flex;flex-direction:column;gap:6px">
            ${slotsHtml}
          </div>

          ${pv.valid ? `
            <div class="monster-stat-strip" style="justify-content:space-between">
              <span>🎯 Peluang Jadi: <b style="color:${pv.successChance >= 70 ? "var(--teal-hi)" : "var(--amber-hi)"}">${pv.successChance}%</b></span>
              <span>🔮 Mode Fusi: <b>${pv.modeProbabilitiesPct[2]}%</b></span>
              <span class="badge ${resBadgeColor}">Resonansi: ${esc(pv.resonanceStatus.toUpperCase())}</span>
            </div>
            <div style="font-size:11px;color:#cbd5e1;display:flex;justify-content:space-between;flex-wrap:wrap;gap:6px">
              <span>Trait Terdeteksi: <b style="color:var(--amber-hi)">${esc(pv.detectedTrait)}</b></span>
              <span>Peluang Trait Langka: <b>${pv.rareTraitChancePct}%</b></span>
            </div>
          ` : `
            <div class="passive-box" style="color:#fda4af">
              ⚠ ${esc(pv.reason || "Pilih minimal 1 bahan dari Tas (kumpulkan lewat Patroli Idle Level).")}
            </div>
          `}

          <button class="btn btn-primary" id="btn-do-forge" style="width:100%;padding:9px;margin-top:2px" ${pv.valid && p.stamina.current >= 8 ? "" : "disabled"}>
            🔥 Tempa ${esc(recipe.name)} (8 STM)
          </button>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // SUB-TAB 2: FUSI INTI KEDUA (6 ELEMEN HIBRIDA — KHUSUS BARANG MODE FUSI)
  // =========================================================================
  function renderFusionTab(snap) {
    const p = snap.player;
    const allGear = collectAllOwnedGear(snap);
    const fusableList = allGear.filter(x => x.item.modeIdx === 2 && !x.item.fused);
    const runesmithTier = p.smithTiers.Runesmith || 0;

    if (fusableList.length > 0 && (!ui.selectedFusionUid || !fusableList.some(x => x.item.uid === ui.selectedFusionUid))) {
      ui.selectedFusionUid = fusableList[0].item.uid;
    }
    const pickedEntry = fusableList.find(x => x.item.uid === ui.selectedFusionUid) || null;
    const targetItem = pickedEntry?.item || null;

    // Hitung pratinjau hasil hibrida & risiko gagal
    let previewFusionText = "";
    let failChancePct = 25;
    if (targetItem) {
      const sub = snap.build.subStats.byId;
      const qB = sub.con_quench_stability ? sub.con_quench_stability.value * 0.35 : 0;
      const aB = sub.int_attunement_craft ? sub.int_attunement_craft.value * 0.35 : 0;
      failChancePct = Math.max(4, +(25 - qB - aB - runesmithTier * 2.5).toFixed(1));

      if (ui.secondElementId === targetItem.coreElement) {
        previewFusionText = `✨ <b>Resonansi Murni:</b> Inti ${esc(targetItem.coreElement)} naik tingkat ukuran (+15% Damage &amp; Trigger).`;
      } else {
        const pairKey = [targetItem.coreElement, ui.secondElementId].sort().join("+");
        const hyb = snap.catalogs.hybridFusions?.[pairKey];
        previewFusionText = hyb
          ? `⚡ <b>Elemen Hibrida "${esc(hyb.name)}":</b> ${esc(hyb.desc)}`
          : `🔮 <b>Aliran Dua Elemen (${esc(targetItem.coreElement)} + ${esc(ui.secondElementId)}):</b> +15% Skill Damage &amp; +12% Trigger Power.`;
      }
    }

    const reqMet = p.level >= 10 && runesmithTier >= 1;
    const feeBr = targetItem ? 100 * (targetItem.tier || 1) : 100;

    return `
      <div class="card teal" style="margin-bottom:10px">
        <div class="card-head">
          <div>
            <div class="card-title">🔮 Meja Fusi Inti Kedua (6 Elemen Hibrida — CD-3.02)</div>
            <div class="card-sub">Tanam Inti Kedua pada senjata/armor berstatus <b>Mode Fusi</b> untuk membuka elemen ganda atau menaikkan ukuran Inti.</div>
          </div>
          <span class="badge ${reqMet ? "ok" : "warn"}">
            Syarat: Lv.${p.level}/10 • Runesmith T${runesmithTier}/1
          </span>
        </div>
      </div>

      ${!fusableList.length ? `
        <div class="card">
          <div class="card-title">Belum Ada Barang Berstatus "Mode Fusi"</div>
          <div class="card-sub">Tempa senjata/armor dengan Inti Elemen (dan bahan Kristal/Esensi bermuatan <i>murni</i>) di tab <b>🔨 Meja Tempa</b> hingga mendapatkan hasil <b>Mode Fusi</b>.</div>
        </div>
      ` : `
        <div class="card warm">
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <label style="flex:1;min-width:200px;display:flex;flex-direction:column;gap:4px;font-size:11px;color:var(--muted)">
              <span>Pilih Barang Mode Fusi (${fusableList.length} tersedia)</span>
              <select id="fuse-sel-item" class="select-compact">
                ${fusableList.map(x => `<option value="${esc(x.item.uid)}" ${x.item.uid === ui.selectedFusionUid ? "selected" : ""}>[${esc(x.statusLabel)}] ${esc(x.item.name)} (Inti: ${esc(x.item.coreElement)})</option>`).join("")}
              </select>
            </label>

            <label style="width:190px;display:flex;flex-direction:column;gap:4px;font-size:11px;color:var(--muted)">
              <span>Pilih Inti Elemen Kedua</span>
              <select id="fuse-sel-elem2" class="select-compact">
                ${ELEMENTS.filter(e => e.id).map(e => `<option value="${e.id}" ${ui.secondElementId === e.id ? "selected" : ""}>${e.lbl}</option>`).join("")}
              </select>
            </label>
          </div>

          <div class="passive-box unlocked" style="line-height:1.5">
            <div>${previewFusionText}</div>
            <div style="margin-top:3px;color:var(--muted)">
              Risiko Gagal (Tegang): <b style="color:#fda4af">${failChancePct}%</b> (Diturunkan oleh CON Quench Stability, INT Attunement &amp; Runesmith) • Biaya Katalis: <b>${B.formatCurrency(feeBr)} &amp; 5 STM</b>
            </div>
          </div>

          <div style="display:flex;justify-content:flex-end">
            <button class="btn btn-primary" id="btn-do-fuse" ${reqMet && p.bronze >= feeBr && p.stamina.current >= 5 ? "" : "disabled"}>
              🔮 Tanam Inti Kedua (${B.formatCurrency(feeBr)} • 5 STM)
            </button>
          </div>
        </div>
      `}
    `;
  }

  // =========================================================================
  // SUB-TAB 3: ENHANCE +N TANPA BATAS SEIMBANG & GALERI BARANG
  // =========================================================================
  function renderEnhanceAndGalleryTab(snap) {
    const p = snap.player;
    const allGear = collectAllOwnedGear(snap);
    const ownedMats = getOwnedMaterialsList(snap);

    if (allGear.length > 0 && (!ui.selectedEnhanceUid || !allGear.some(x => x.item.uid === ui.selectedEnhanceUid))) {
      ui.selectedEnhanceUid = allGear[0].item.uid;
    }
    if (ownedMats.length > 0 && (!ui.selectedCatalystMatId || !ownedMats.some(m => m.id === ui.selectedCatalystMatId))) {
      // Utamakan bahan Common paling melimpah sebagai katalis +N
      const cheapest = [...ownedMats].sort((a, b) => a.craftPower - b.craftPower || b.qty - a.qty)[0];
      ui.selectedCatalystMatId = cheapest.id;
    }

    const quote = ui.selectedEnhanceUid ? Bridge.getEnhancementQuote(ui.selectedEnhanceUid) : null;
    const gallery = snap.state.inventory.forgedGallery || [];

    const galleryHtml = gallery.map(g => `
      <div class="settlement-row">
        <div style="min-width:0;flex:1">
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
            <strong style="font-size:12px;color:#f1f5f9">${g.itemType === "armor" ? "🛡️" : "⚔️"} ${esc(g.name)}</strong>
            <span class="badge">${esc(g.rarity || "Common")}</span>
            ${g.canFuse ? `<span class="badge ok">Mode Fusi</span>` : ""}
            ${g.hybridFusion ? `<span class="badge ok">⚡ ${esc(g.hybridFusion.name || g.hybridFusion)}</span>` : ""}
          </div>
          <div style="font-size:10.5px;color:var(--muted);margin-top:2px">
            ${g.itemType === "armor" ? `Armor ${esc(g.armorSlot)} (${esc(g.armorClass)})` : `Senjata ${esc(g.stat)} (${esc(g.tag)})`} • Trigger: ${esc(g.trigger || g.triggerName || "-")} • Elemen: ${esc(g.element || "Neutral")}
          </div>
        </div>
        <div style="display:flex;gap:5px;flex-shrink:0;flex-wrap:wrap">
          <button class="btn btn-primary btn-xs" data-equip-uid="${esc(g.uid)}">⚔️ Pasang</button>
          <button class="btn btn-danger btn-xs" data-scrap-uid="${esc(g.uid)}" title="Bongkar menjadi Kas & 1 Bahan Common">♻️ Bongkar</button>
        </div>
      </div>
    `).join("");

    return `
      <!-- PANEL ENHANCE +N -->
      <div class="card warm" style="margin-bottom:10px">
        <div class="card-head">
          <div>
            <div class="card-title">⚡ Meja Enhance +N Tanpa Batas Seimbang (CD-4.02)</div>
            <div class="card-sub">0% risiko barang pecah! Dilindungi Checkpoint aman di <b>+5</b> dan <b>+15</b>.</div>
          </div>
          <button class="btn btn-secondary btn-xs" disabled title="Fitur memindahkan +N antar senjata (CD-4.02) menunggu fungsi khusus di engines/">
            🔒 Transfer +N (Menunggu Backend)
          </button>
        </div>

        ${quote ? `
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <label style="flex:1.3;min-width:200px;display:flex;flex-direction:column;gap:4px;font-size:11px;color:var(--muted)">
              <span>Pilih Barang yang Diperkuat</span>
              <select id="enh-sel-item" class="select-compact">
                ${allGear.map(x => `<option value="${esc(x.item.uid)}" ${x.item.uid === ui.selectedEnhanceUid ? "selected" : ""}>[${esc(x.statusLabel)}] ${esc(x.item.name)} (+${x.item.enhancePlus || 0})</option>`).join("")}
              </select>
            </label>

            <label style="flex:1;min-width:170px;display:flex;flex-direction:column;gap:4px;font-size:11px;color:var(--muted)">
              <span>Katalis Bahan (1 unit)</span>
              <select id="enh-sel-mat" class="select-compact">
                ${ownedMats.length
                  ? ownedMats.map(m => `<option value="${esc(m.id)}" ${m.id === ui.selectedCatalystMatId ? "selected" : ""}>${esc(m.name)} (x${m.qty})</option>`).join("")
                  : `<option value="">Tas bahan kosong</option>`}
              </select>
            </label>
          </div>

          <div class="monster-stat-strip" style="justify-content:space-between">
            <span>Tingkat: <b>+${quote.curPlus} → +${quote.nextPlus}</b> (${esc(quote.nextEnh.phase)})</span>
            <span>Daya Tempa: <b style="color:var(--sky)">+${quote.curEnh.powerBonusPct}% → +${quote.nextEnh.powerBonusPct}%</b></span>
            <span>Peluang Sukses: <b style="color:${quote.nextEnh.effectiveSuccessRatePct >= 65 ? "var(--teal-hi)" : "var(--amber-hi)"}">${quote.nextEnh.effectiveSuccessRatePct}%</b></span>
            <span>Checkpoint Aman: <b>+${quote.curEnh.minCheckpoint}</b></span>
          </div>

          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">
            <span style="font-size:11px;color:var(--muted)">
              Biaya Tempa: <b style="color:var(--amber-hi)">${B.formatCurrency(quote.costBr)}</b> + 1 Bahan + ${quote.staminaCost} STM
            </span>
            <button class="btn btn-primary btn-xs" id="btn-do-enhance" ${ownedMats.length > 0 && p.bronze >= quote.costBr && p.stamina.current >= quote.staminaCost ? "" : "disabled"}>
              ⚡ Tempa ke +${quote.nextPlus} (${quote.nextEnh.effectiveSuccessRatePct}%)
            </button>
          </div>
        ` : ""}
      </div>

      <!-- PANEL GALERI & BONGKAR (SCRAP) -->
      <div class="card">
        <div class="card-head">
          <div>
            <div class="card-title">🗄️ Galeri Barang Tempaan (${gallery.length}/12 Slot)</div>
            <div class="card-sub">Pasang senjata/armor ke tubuh karakter, atau bongkar (Scrap) barang berlebih menjadi Kas &amp; Bahan.</div>
          </div>
          <span class="badge">Armor Pasif Penuh: Sebagian Menunggu Backend</span>
        </div>

        <div class="settlements-list">
          ${galleryHtml || `<div style="font-size:11.5px;color:var(--muted);padding:6px 2px">Galeri masih kosong. Barang yang Anda tempa di tab <b>🔨 Meja Tempa</b> akan tersimpan di sini.</div>`}
        </div>
      </div>
    `;
  }

  function renderStatBenefitsCard(snap) {
    const p = snap.player;
    const sub = snap.build.subStats?.byId || {};
    const v = id => Number(sub[id]?.value || 0).toFixed(1);
    const items = [
      { k: "STR", val: p.stats.STR, icon: "🔨", title: "Pukulan & Penguatan +N", desc: `Hammer <b>+${v("str_hammer_strike")}%</b> peluang jadi • Enhance +N <b>+${v("str_enhance_power")}%</b> sukses` },
      { k: "CON", val: p.stats.CON, icon: "🛡️", title: "Hemat Bahan & Stabil Fusi", desc: `Hemat Bahan <b>+${v("con_material_conservation")}%</b> saat gagal • Quench <b>+${v("con_quench_stability")}%</b> anti-retak Fusi` },
      { k: "INT", val: p.stats.INT, icon: "🔮", title: "Mutu Rarity & Selaras Elemen", desc: `Smith's Tools <b>+${v("int_smith_tools")}%</b> mutu/rarity • Attunement <b>+${v("int_attunement_craft")}%</b> bobot Fusi` },
      { k: "WIS", val: p.stats.WIS, icon: "✨", title: "Kemurnian & Rare Trait", desc: `Material Purity <b>+${v("wis_material_purity")}%</b> peluang Trait Langka • Rare Drop <b>+${v("wis_rare_drop")}%</b>` },
      { k: "DEX", val: p.stats.DEX, icon: "⚙️", title: "Kecepatan & Presisi Pemicu", desc: `Forge Speed <b>+${v("dex_forge_speed")}%</b> • Mechanism/Salvage <b>+${v("dex_mechanism_craft")}%</b>` },
      { k: "CHA", val: p.stats.CHA, icon: "⚖️", title: "Harga Jual & Didikan Murid", desc: `Bargaining <b>+${v("cha_trade_bargaining")}%</b> harga pasar • Leadership <b>+${v("cha_apprentice_lead")}%</b> 5 Murid` }
    ];

    return `
      <div class="card teal" style="margin-bottom:10px;padding:8px 11px">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">
          <span style="font-size:11.5px;font-weight:800;color:var(--teal-hi)">📊 Keuntungan 6 Stat Anda di Bengkel &amp; Profesi</span>
          <button class="chip-btn" id="btn-toggle-forge-stat-guide">${ui.showStatGuide ? "▴ Sembunyikan Panduan" : "▾ Lihat Efek Tiap Stat"}</button>
        </div>
        ${ui.showStatGuide ? `
          <div class="forge-stat-guide-grid" style="margin-top:8px">
            ${items.map(it => `
              <div class="forge-stat-chip">
                <div style="display:flex;justify-content:space-between;align-items:center;gap:4px">
                  <strong style="color:var(--amber-hi);font-size:11.5px">${it.icon} ${it.k} (${it.val})</strong>
                  <span style="font-size:10px;color:#cbd5e1;font-weight:700">${it.title}</span>
                </div>
                <div style="font-size:10.5px;color:var(--muted);line-height:1.35;margin-top:2px">${it.desc}</div>
              </div>
            `).join("")}
          </div>
        ` : ""}
      </div>
    `;
  }

  function getRecipeIconUrl(recipe) {
    const Assets = global.BSRPG_ASSETS;
    if (!Assets || typeof Assets.getCustomIcon !== "function") return "";
    const cat = recipe?.itemType === "armor" ? "armors" : "weapons";
    return Assets.getCustomIcon(cat, recipe?.id || recipe?.name)
      || Assets.getCustomIcon("weapons", recipe?.id || recipe?.name)
      || "";
  }

  function renderSmithingCodexTab(snap) {
    const allRecipes = [
      ...(snap.catalogs.weapons || []).map(r => ({ ...r, itemType: "weapon" })),
      ...(snap.catalogs.armors || []).map(r => ({ ...r, itemType: "armor" }))
    ];
    const owned = collectAllOwnedGear(snap);

    // Kumpulkan rekor tempa per recipeId (jumlah tempa, +N tertinggi, rarity terbaik)
    const RARITY_RANK = { Common: 1, Uncommon: 2, Rare: 3, Epic: 4, Legendary: 5, Unique: 6 };
    const records = new Map();
    for (const entry of owned) {
      const it = entry.item;
      const rid = it?.recipeId || it?.id;
      if (!rid) continue;
      const cur = records.get(rid) || { count: 0, maxPlus: 0, bestRarity: "Common" };
      cur.count += 1;
      cur.maxPlus = Math.max(cur.maxPlus, Number(it.plusN || 0));
      if ((RARITY_RANK[it.rarity] || 0) >= (RARITY_RANK[cur.bestRarity] || 0)) {
        cur.bestRarity = it.rarity || cur.bestRarity;
      }
      records.set(rid, cur);
    }

    const discoveredCount = allRecipes.filter(r => records.has(r.id)).length;
    const filtered = allRecipes.filter(r => {
      if (ui.codexFilter === "WEAPON") return r.itemType === "weapon";
      if (ui.codexFilter === "ARMOR") return r.itemType === "armor";
      if (ui.codexFilter === "FORGED") return records.has(r.id);
      return true;
    });

    const filterBtns = [
      { id: "ALL", lbl: `Semua (${allRecipes.length})` },
      { id: "WEAPON", lbl: `⚔️ Senjata (${(snap.catalogs.weapons || []).length})` },
      { id: "ARMOR", lbl: `🛡️ Armor (${(snap.catalogs.armors || []).length})` },
      { id: "FORGED", lbl: `✓ Sudah Ditempa (${discoveredCount})` }
    ].map(f => `<button class="pill-btn ${ui.codexFilter === f.id ? "active" : ""}" data-codex-flt="${f.id}">${f.lbl}</button>`).join("");

    const cardsHtml = filtered.map(r => {
      const rec = records.get(r.id);
      const isForged = Boolean(rec);
      const iconUrl = getRecipeIconUrl(r);
      const iconHtml = iconUrl
        ? `<img src="${iconUrl}" alt="${esc(r.name)}" class="codex-item-img ${isForged ? "" : "locked-sil"}" />`
        : `<span style="font-size:22px">${r.itemType === "armor" ? "🛡️" : "⚔️"}</span>`;
      const rarClass = isForged ? `rar-${String(rec.bestRarity || "common").toLowerCase()}` : "locked";
      return `
        <div class="codex-card ${rarClass}">
          <div class="codex-icon-box">
            ${iconHtml}
            ${isForged && rec.maxPlus > 0 ? `<span class="codex-plus-tag">+${rec.maxPlus}</span>` : ""}
            ${!isForged ? `<span class="codex-lock-tag">🔒</span>` : ""}
          </div>
          <div style="min-width:0;flex:1">
            <div class="codex-name">${isForged ? esc(r.name) : `${esc(r.name)}`}</div>
            <div class="codex-meta">
              ${r.itemType === "armor" ? `${esc(r.slot || "Armor")} • ${esc(r.stat)}` : `T${esc(r.tier || 1)} • ${esc(r.stat)} ${esc(r.tag || "")}`}
            </div>
            <div class="codex-status">
              ${isForged
                ? `<span class="badge ok">✓ ${esc(rec.bestRarity)} • ${rec.count}×</span>`
                : `<span class="badge">Belum Ditempa</span>`}
            </div>
          </div>
        </div>
      `;
    }).join("");

    return `
      <div class="card warm">
        <div class="card-head">
          <div>
            <div class="card-title">📖 Smithing Codex (Bestiary Tempaan — Gaya Witcher 3)</div>
            <div class="card-sub">Mencatat seluruh senjata &amp; armor yang berhasil Anda tempa selama perjalanan Endless Blacksmith.</div>
          </div>
          <span class="badge ok">${discoveredCount} / ${allRecipes.length} Tercatat</span>
        </div>
        <div class="filter-pills" style="margin-bottom:4px">${filterBtns}</div>
        <div class="codex-grid">${cardsHtml || `<div class="card-sub">Belum ada tempaan pada filter ini. Mulai menempa di tab Meja Tempa!</div>`}</div>
      </div>
    `;
  }

  function render(container, snap, showToast = () => {}) {
    const Assets = global.BSRPG_ASSETS;
    const dioramaUrl = Assets ? Assets.get("ui_forge_diorama") : "";
    const anvilUrl = Assets ? Assets.get("ui_forge_anvil") : "";
    const curWpnIcon = Assets && typeof Assets.getCustomIcon === "function"
      ? Assets.getCustomIcon("weapons", snap.equipment?.weapon?.recipeId || snap.equipment?.weapon?.id || "w_str_1")
      : "";
    const forgeBannerHtml = dioramaUrl ? `
      <div class="card warm" style="padding:0;overflow:hidden;margin-bottom:8px">
        <img src="${dioramaUrl}" alt="Diorama Bengkel" style="width:100%;max-height:175px;object-fit:cover;display:block;border-bottom:1.5px solid var(--bronze-border)" />
        <div style="padding:7px 10px;display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">
          <div class="card-title" style="font-size:12.5px">🔥 Bengkel Tempa &amp; Smithing Codex</div>
          <div class="card-sub" style="margin:0">Slot Bahan: <b>${snap.forgeMaxSlots || 2}</b> • Aktif: <b>${esc(snap.equipment?.weapon?.name || "-")}</b></div>
        </div>
      </div>
    ` : ((anvilUrl || curWpnIcon) ? `
      <div class="card warm" style="display:flex;align-items:center;gap:10px;padding:8px 10px;margin-bottom:8px">
        <img src="${curWpnIcon || anvilUrl}" alt="Bengkel Tempa" class="forge-banner-thumb" style="object-fit:contain;background:#120e0b" />
        <div style="min-width:0;flex:1">
          <div class="card-title" style="font-size:12.5px">🔥 Bengkel Tempa &amp; Smithing Codex</div>
          <div class="card-sub">63 Resep Senjata/Armor • Slot Bahan: <b>${snap.forgeMaxSlots || 2}</b> • Senjata Aktif: <b>${esc(snap.equipment?.weapon?.name || "-")}</b></div>
        </div>
      </div>
    ` : "");

    const subTabsHtml = `
      <div class="sub-tabs-grid sub-tabs-4">
        <button class="sub-tab-btn ${ui.subTab === "craft" ? "active" : ""}" data-forge-sub="craft">🔨 Tempa</button>
        <button class="sub-tab-btn ${ui.subTab === "fusion" ? "active" : ""}" data-forge-sub="fusion">🔮 Fusi</button>
        <button class="sub-tab-btn ${ui.subTab === "enhance" ? "active" : ""}" data-forge-sub="enhance">⚡ +N &amp; Galeri</button>
        <button class="sub-tab-btn ${ui.subTab === "codex" ? "active" : ""}" data-forge-sub="codex">📖 Codex</button>
      </div>
    `;

    let bodyHtml = "";
    if (ui.subTab === "craft") bodyHtml = renderCraftTab(snap);
    else if (ui.subTab === "fusion") bodyHtml = renderFusionTab(snap);
    else if (ui.subTab === "codex") bodyHtml = renderSmithingCodexTab(snap);
    else bodyHtml = renderEnhanceAndGalleryTab(snap);

    container.innerHTML = forgeBannerHtml + subTabsHtml + (ui.subTab === "codex" ? "" : renderStatBenefitsCard(snap)) + bodyHtml;

    const btnGuide = container.querySelector("#btn-toggle-forge-stat-guide");
    if (btnGuide) {
      btnGuide.onclick = () => {
        ui.showStatGuide = !ui.showStatGuide;
        render(container, Bridge.getSnapshot(), showToast);
      };
    }

    // Sub-tab switch
    container.querySelectorAll("[data-forge-sub]").forEach(btn => {
      btn.onclick = () => {
        if (global.BSRPG_AUDIO) global.BSRPG_AUDIO.play("ui_click");
        ui.subTab = btn.getAttribute("data-forge-sub");
        render(container, Bridge.getSnapshot(), showToast);
      };
    });

    // Codex filter switch
    container.querySelectorAll("[data-codex-flt]").forEach(btn => {
      btn.onclick = () => {
        if (global.BSRPG_AUDIO) global.BSRPG_AUDIO.play("ui_click");
        ui.codexFilter = btn.getAttribute("data-codex-flt");
        render(container, Bridge.getSnapshot(), showToast);
      };
    });

    // Craft bindings
    container.querySelectorAll("[data-cat]").forEach(btn => {
      btn.onclick = () => {
        ui.category = btn.getAttribute("data-cat");
        ui.filterKey = "ALL";
        ui.selectedRecipeId = null;
        render(container, Bridge.getSnapshot(), showToast);
      };
    });

    const fltKey = container.querySelector("#forge-flt-key");
    if (fltKey) fltKey.onchange = e => { ui.filterKey = e.target.value; ui.selectedRecipeId = null; render(container, Bridge.getSnapshot(), showToast); };

    const selRec = container.querySelector("#forge-sel-recipe");
    if (selRec) selRec.onchange = e => { ui.selectedRecipeId = e.target.value; render(container, Bridge.getSnapshot(), showToast); };

    const selElem = container.querySelector("#forge-sel-elem");
    if (selElem) selElem.onchange = e => { ui.coreElement = e.target.value; render(container, Bridge.getSnapshot(), showToast); };

    const selSize = container.querySelector("#forge-sel-size");
    if (selSize) selSize.onchange = e => { ui.coreSize = e.target.value; render(container, Bridge.getSnapshot(), showToast); };

    container.querySelectorAll("[data-forge-slot]").forEach(sel => {
      sel.onchange = e => {
        const idx = Number(sel.getAttribute("data-forge-slot"));
        ui.slotMatIds[idx] = e.target.value;
        render(container, Bridge.getSnapshot(), showToast);
      };
    });

    const btnAuto = container.querySelector("#btn-autofill-mats");
    if (btnAuto) {
      btnAuto.onclick = () => {
        const latest = Bridge.getSnapshot();
        const mats = getOwnedMaterialsList(latest);
        if (!mats.length) return showToast("⚠ Tas bahan kosong! Jalankan Patroli Idle dulu.");
        ui.slotMatIds = autoFillSlotsFromBag(mats, latest.forgeMaxSlots || 2);
        render(container, latest, showToast);
        showToast("✨ Bahan terbaik dari Tas dipasang ke slot meja tempa.");
      };
    }

    const btnForge = container.querySelector("#btn-do-forge");
    if (btnForge) {
      btnForge.onclick = () => {
        const latest = Bridge.getSnapshot();
        const picks = ui.slotMatIds.slice(0, latest.forgeMaxSlots || 2).filter(Boolean);
        const res = Bridge.forgeCraftItem({
          itemId: ui.selectedRecipeId,
          pickedMaterialIds: picks,
          coreElement: ui.coreElement,
          coreSize: ui.coreSize
        });
        if (!res.ok) return showToast(`⚠ ${res.reason}`);
        if (global.BSRPG_AUDIO) global.BSRPG_AUDIO.play("forge_hammer");
        if (global.BSRPG_PERF) global.BSRPG_PERF.pulseClass(".forge-banner-thumb", "fx-forge-flash", 380);
        if (res.crafted) {
          showToast(`🔥 Sukses menempa ${res.item.name} [${res.item.qualityName}]!`);
        } else {
          showToast(`💨 Tempa gagal! Sebagian bahan terselamatkan: ${(res.keptMaterials || []).join(", ") || "tidak ada"}.`);
        }
      };
    }

    // Equip / Scrap / Jump Fuse shared buttons
    container.querySelectorAll("[data-equip-uid]").forEach(btn => {
      btn.onclick = () => {
        const r = Bridge.equipForgedItem(btn.getAttribute("data-equip-uid"));
        if (!r.ok) return showToast(`⚠ ${r.reason}`);
        if (global.BSRPG_AUDIO) global.BSRPG_AUDIO.play("ui_click");
        showToast(`⚔️ Terpasang: ${r.equipped.name}!`);
      };
    });

    container.querySelectorAll("[data-scrap-uid]").forEach(btn => {
      btn.onclick = () => {
        const r = Bridge.scrapGalleryItem(btn.getAttribute("data-scrap-uid"));
        if (!r.ok) return showToast(`⚠ ${r.reason}`);
        if (global.BSRPG_AUDIO) global.BSRPG_AUDIO.play("coin");
        showToast(`♻️ Dibongkar: +${B.formatCurrency(r.refundBr)}${r.salvagedMaterial ? ` & +1 ${r.salvagedMaterial}` : ""}`);
      };
    });

    container.querySelectorAll("[data-jump-fuse]").forEach(btn => {
      btn.onclick = () => {
        ui.subTab = "fusion";
        ui.selectedFusionUid = btn.getAttribute("data-jump-fuse");
        render(container, Bridge.getSnapshot(), showToast);
      };
    });

    // Fusion bindings
    const selFuseItem = container.querySelector("#fuse-sel-item");
    if (selFuseItem) selFuseItem.onchange = e => { ui.selectedFusionUid = e.target.value; render(container, Bridge.getSnapshot(), showToast); };

    const selFuseElem2 = container.querySelector("#fuse-sel-elem2");
    if (selFuseElem2) selFuseElem2.onchange = e => { ui.secondElementId = e.target.value; render(container, Bridge.getSnapshot(), showToast); };

    const btnFuse = container.querySelector("#btn-do-fuse");
    if (btnFuse) {
      btnFuse.onclick = () => {
        const r = Bridge.fuseForgedItem({
          targetUid: ui.selectedFusionUid,
          secondElementId: ui.secondElementId
        });
        if (!r.ok) return showToast(`⚠ ${r.reason}`);
        if (global.BSRPG_AUDIO) global.BSRPG_AUDIO.play(r.fusedSuccess ? "victory" : "forge_hammer");
        if (global.BSRPG_PERF) global.BSRPG_PERF.pulseClass(".forge-banner-thumb", "fx-forge-flash", 380);
        showToast(r.fusedSuccess ? `🔮 ${r.message}` : `💥 ${r.message}`);
      };
    }

    // Enhance bindings
    const selEnhItem = container.querySelector("#enh-sel-item");
    if (selEnhItem) selEnhItem.onchange = e => { ui.selectedEnhanceUid = e.target.value; render(container, Bridge.getSnapshot(), showToast); };

    const selEnhMat = container.querySelector("#enh-sel-mat");
    if (selEnhMat) selEnhMat.onchange = e => { ui.selectedCatalystMatId = e.target.value; };

    const btnEnh = container.querySelector("#btn-do-enhance");
    if (btnEnh) {
      btnEnh.onclick = () => {
        const r = Bridge.enhanceItemPlusOne({
          targetUid: ui.selectedEnhanceUid,
          catalystMatId: ui.selectedCatalystMatId
        });
        if (!r.ok) return showToast(`⚠ ${r.reason}`);
        if (global.BSRPG_AUDIO) global.BSRPG_AUDIO.play("forge_hammer");
        if (global.BSRPG_PERF) global.BSRPG_PERF.pulseClass(".forge-banner-thumb", "fx-forge-flash", 380);
        if (r.succeeded) {
          showToast(`⚡ SUKSES! ${r.item.name} naik ke +${r.newPlus}!`);
        } else {
          showToast(`💨 Enhance gagal (peluang ${r.chancePct}%). Tetap aman di +${r.newPlus} (Checkpoint +${r.checkpoint}).`);
        }
      };
    }
  }

  global.BSRPG_SCREEN_FORGE = { render, openSubTab };
})(window);
