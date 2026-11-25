/**
 * Battle-Smith RPG — Fase 3B: Layar Pasar Supply & Demand Regional (77 Kota)
 * Terhubung 100% ke BasicSnDEngine (3-Layer Lazy Math, -20% Area Asal, 25% Riak Kota Induk,
 * Kelas Pasar & Modal Kas Kota, CHA Trade Bargaining, Shadow Syndicate, & Politik Faksi).
 * 0% modifikasi pada engines/ maupun data/.
 */
(function (global) {
  "use strict";

  const Bridge = global.BSRPG_BRIDGE;
  const B = global.BSRPG_BACKEND;

  const ui = {
    subTab: "buy",         // "buy" | "sell" | "politics"
    areaFilter: "LOCAL",   // "LOCAL" | "TIER"
    catFilter: "ALL",
    viaShadowSyndicate: false,
    lastNewsLogs: []
  };

  function esc(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderHeaderStrip(snap, mState) {
    const loc = mState.loc;
    const parentTxt = mState.parentLoc
      ? `Riak Induk 25%: <b>${esc(mState.parentLoc.location_name)}</b>`
      : "Pusat Ekonomi Mandiri (Induk)";

    return `
      <div class="card ${ui.viaShadowSyndicate ? "boss" : "teal"}" style="margin-bottom:10px">
        <div class="card-head">
          <div>
            <div class="card-title">
              ⚖️ Pasar ${esc(loc.location_name)}
              <span class="badge">${esc(loc.settlement_type)}</span>
              ${loc.is_contested_enclave === "Y" ? `<span class="badge warn">⚔️ Kota Sengketa</span>` : ""}
              ${mState.isBoycotted ? `<span class="badge warn">🚫 Boikot Faksi</span>` : ""}
            </div>
            <div class="card-sub">
              Area: <b>${esc(loc.area_name)}</b> (T${esc(loc.tier)}) • Faksi: <b>${esc(loc.faction_name)}</b> • ${parentTxt}
            </div>
          </div>
          <button class="chip-btn ${ui.viaShadowSyndicate ? "danger" : "warm"}" id="btn-toggle-syndicate" title="Jalur Pasar Gelap: tembus batas kelas pasar & boikot faksi dengan biaya ekstra +45%">
            🕶️ ${ui.viaShadowSyndicate ? "Shadow Syndicate: AKTIF (+45%)" : "Jalur Resmi (Klik -> Pasar Gelap)"}
          </button>
        </div>

        <div class="monster-stat-strip" style="margin-top:4px">
          <span>💰 Kas Anda: <b style="color:var(--amber-hi)">${snap.bronzeFormatted}</b></span>
          <span>🏦 Modal Beli Kota: <b>${mState.cashCapFormatted}</b></span>
          <span>🗣️ CHA Efektif: <b>${mState.effectiveCha}</b> (+${mState.bargainBonusPct}% Tawar)</span>
          <span>🍂 Musim: <b>${esc(snap.calendar.season)}</b></span>
          <span>📉 Delta Aktif: <b>${mState.activeDeltasCount}</b> komoditas</span>
        </div>
      </div>
    `;
  }

  function renderBuyTab(snap, mState) {
    const categories = ["ALL", ...Array.from(new Set(mState.buyList.map(x => x.category)))];
    const filtered = mState.buyList.filter(it => ui.catFilter === "ALL" || it.category === ui.catFilter);

    const rowsHtml = filtered.map(it => {
      const q = it.quote;
      const reasonsTxt = q.reasons && q.reasons.length ? q.reasons.join(" • ") : "Harga dasar stabil";
      const multPct = Math.round((q.totalMult - 1) * 100);
      const multSign = multPct > 0 ? `+${multPct}%` : `${multPct}%`;
      const multColor = multPct <= -5 ? "var(--teal-hi)" : multPct >= 10 ? "#fda4af" : "#cbd5e1";
      const canAfford1 = snap.player.bronze >= q.finalPriceBr;
      const canAfford5 = snap.player.bronze >= q.finalPriceBr * 5;
      const supPct = Math.max(5, Math.min(150, it.supplyRatioPct));

      return `
        <div class="card" style="padding:9px 11px">
          <div class="card-head" style="margin-bottom:4px">
            <div style="min-width:0">
              <div class="card-title" style="font-size:12.5px">
                🪨 ${esc(it.name)}
                <span class="badge">${esc(it.rarity)}</span>
                <span class="badge">${esc(it.category)}</span>
              </div>
              <div class="card-sub">
                Asal: ${esc(it.areaName)} • Min Pasar: <b>${esc(it.minMarketClass)}</b> • Di Tas: <b>x${it.ownedQty}</b>
              </div>
            </div>
            <div style="text-align:right;flex-shrink:0">
              <div style="font-size:13px;font-weight:800;color:var(--amber-hi)">${q.formatted} <small style="font-weight:600;color:var(--muted)">/pcs</small></div>
              <div style="font-size:10px;color:${multColor}">S&amp;D ${q.localSnD}x (${multSign})</div>
            </div>
          </div>

          <div style="display:flex;align-items:center;gap:8px;margin:4px 0">
            <span style="font-size:10px;color:var(--muted);width:84px;flex-shrink:0">Stok Pasar ${it.supplyRatioPct}%</span>
            <div class="bar-track" style="flex:1;height:6px">
              <div class="bar-fill stm" style="width:${Math.min(100, supPct)}%"></div>
            </div>
          </div>

          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-top:4px">
            <span style="font-size:10.5px;color:#94a3b8">${esc(reasonsTxt)}</span>
            ${it.allowed ? `
              <div style="display:flex;gap:6px;flex-shrink:0">
                <button class="btn btn-primary btn-xs" data-mkt-buy="${esc(it.id)}" data-qty="1" ${canAfford1 ? "" : "disabled"}>🛒 Beli x1</button>
                <button class="btn btn-secondary btn-xs" data-mkt-buy="${esc(it.id)}" data-qty="5" ${canAfford5 ? "" : "disabled"}>x5 (${B.formatCurrency(q.finalPriceBr * 5)})</button>
              </div>
            ` : `
              <span class="badge warn wrap-ok" title="Aktifkan tombol Shadow Syndicate di atas atau pindah ke kota lebih besar">🔒 ${esc(it.lockReason)}</span>
            `}
          </div>
        </div>
      `;
    }).join("");

    return `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px">
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <button class="pill-btn ${ui.areaFilter === "LOCAL" ? "active" : ""}" data-mkt-area="LOCAL">📍 Bahan Area Lokal (-20% Asal)</button>
          <button class="pill-btn ${ui.areaFilter === "TIER" ? "active" : ""}" data-mkt-area="TIER">🌍 Komoditas Se-Tier ${esc(mState.loc.tier)}</button>
        </div>
        <select id="mkt-cat-filter" class="select-compact">
          ${categories.map(c => `<option value="${esc(c)}" ${ui.catFilter === c ? "selected" : ""}>${c === "ALL" ? "Semua Kategori" : `Kategori: ${esc(c)}`}</option>`).join("")}
        </select>
      </div>

      <div class="cards-grid">
        ${rowsHtml || `<div class="card"><div class="card-sub">Tidak ada komoditas yang cocok dengan filter ini.</div></div>`}
      </div>
    `;
  }

  function renderSellTab(snap, mState) {
    const gearHtml = mState.sellGearList.map(g => `
      <div class="settlement-row">
        <div style="min-width:0;flex:1">
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
            <strong style="font-size:12px;color:#f8fafc">${g.itemType === "armor" ? "🛡️" : "⚔️"} ${esc(g.name)}</strong>
            <span class="badge">${esc(g.rarity)}</span>
            <span class="badge">Mutu: ${esc(g.qualityName)}</span>
          </div>
          <div style="font-size:10.5px;color:var(--muted);margin-top:2px">
            Taksiran Pasar Kota: <b style="color:var(--amber-hi)">${g.formatted}</b>
            ${g.exceedsCashCap ? ` • <span style="color:#fda4af">Melebihi modal kas toko (${mState.cashCapFormatted})!</span>` : ""}
          </div>
        </div>
        <button class="btn ${g.exceedsCashCap ? "btn-secondary" : "btn-primary"} btn-xs" data-mkt-sell-gear="${esc(g.uid)}" ${g.exceedsCashCap ? "disabled" : ""}>
          💰 Jual (${g.formatted})
        </button>
      </div>
    `).join("");

    const matHtml = mState.sellMatList.map(m => {
      const q = m.quote;
      const overCap1 = !ui.viaShadowSyndicate && q.finalPriceBr > mState.cashCapBr;
      const canSell = m.allowed && !overCap1;
      const maxBatch = Math.min(m.qty, Math.max(1, Math.floor(mState.cashCapBr / Math.max(1, q.finalPriceBr))));
      const sell5Qty = Math.min(5, maxBatch);

      return `
        <div class="settlement-row">
          <div style="min-width:0;flex:1">
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
              <strong style="font-size:12px;color:#f1f5f9">🪨 ${esc(m.name)}</strong>
              <span class="badge">Stok x${m.qty}</span>
              <span class="badge">${esc(m.rarity)}</span>
            </div>
            <div style="font-size:10.5px;color:var(--muted);margin-top:2px">
              Harga Beli Toko: <b style="color:var(--teal-hi)">${q.formatted}/pcs</b> (S&amp;D ${q.localSnD}x)
            </div>
          </div>
          ${canSell ? `
            <div style="display:flex;gap:5px;flex-wrap:wrap;flex-shrink:0">
              <button class="btn btn-primary btn-xs" data-mkt-sell-mat="${esc(m.id)}" data-qty="1">Jual x1</button>
              ${m.qty >= 2 && sell5Qty >= 2 ? `<button class="btn btn-secondary btn-xs" data-mkt-sell-mat="${esc(m.id)}" data-qty="${sell5Qty}">x${sell5Qty}</button>` : ""}
              ${m.qty > sell5Qty && maxBatch > sell5Qty ? `<button class="btn btn-secondary btn-xs" data-mkt-sell-mat="${esc(m.id)}" data-qty="${maxBatch}">Maks (${maxBatch})</button>` : ""}
            </div>
          ` : `
            <span class="badge warn">${overCap1 ? "Modal Kota Kurang" : esc(m.lockReason)}</span>
          `}
        </div>
      `;
    }).join("");

    return `
      <div class="forge-two-col">
        <div class="card">
          <div class="card-head">
            <div>
              <div class="card-title">⚔️ Jual Barang Tempaan Galeri (${mState.sellGearList.length}/12)</div>
              <div class="card-sub">Harga dipengaruhi kelangkaan, kualitas tempa, +N, CHA Tawar, &amp; batas kas kota (${mState.cashCapFormatted}).</div>
            </div>
          </div>
          <div class="settlements-list">
            ${gearHtml || `<div style="font-size:11.5px;color:var(--muted);padding:4px 0">Belum ada barang di Galeri. Tempa senjata/armor di tab <b>🔥 Bengkel</b> untuk dijual ke pedagang kota!</div>`}
          </div>
        </div>

        <div class="card">
          <div class="card-head">
            <div>
              <div class="card-title">🪨 Jual Bahan Mentah dari Tas (${mState.sellMatList.length} jenis)</div>
              <div class="card-sub">Menjual partai besar menurunkan harga lokal sementara (pulih otomatis 12 jam via Lazy Math).</div>
            </div>
          </div>
          <div class="settlements-list">
            ${matHtml || `<div style="font-size:11.5px;color:var(--muted);padding:4px 0">Tas bahan kosong. Jalankan Patroli Idle di tab <b>⚔️ Misi &amp; Idle</b> untuk mengumpulkan drop!</div>`}
          </div>
        </div>
      </div>
    `;
  }

  function renderPoliticsTab(snap, mState) {
    const relBadgeClass = st => {
      if (st === "Alliance") return "ok";
      if (st === "Embargo" || st === "Open War") return "warn";
      return "";
    };

    const relRows = mState.localRelations.map(r => `
      <div class="settlement-row">
        <div>
          <strong style="font-size:12px;color:#f1f5f9">🏛️ ${esc(r.factionName)}</strong>
          <div style="font-size:10.5px;color:var(--muted)">
            ${r.status === "Alliance" ? "Pasokan lintas faksi diskon -10%" : r.status === "Open War" ? "Permintaan senjata +35% & bahan +20%, barang musuh langka" : r.status === "Embargo" ? "Pasokan barang asal faksi ini menyusut tajam" : "Perdagangan lintas faksi berjalan normal"}
          </div>
        </div>
        <span class="badge ${relBadgeClass(r.status)}">${esc(r.status)}</span>
      </div>
    `).join("");

    const evList = mState.caravanEvents || [];
    const caravanHtml = evList.length
      ? evList.map(ev => `
          <div class="settlement-row">
            <div style="font-size:11.5px;color:#e2e8f0">
              🐪 <b>${esc(ev.label || ev.type || "Rombongan Karavan")}</b> — Lokasi: <b>${esc(ev.locId || "-")}</b>
              ${ev.itemId ? ` • Komoditas: <b>${esc(ev.itemId)}</b>` : ""}
            </div>
            <span class="badge warm">Aktif</span>
          </div>
        `).join("")
      : `<div style="font-size:11.5px;color:var(--muted)">Belum ada kabar karavan khusus hari ini. Klik tombol pantau karavan untuk memperbarui pergerakan niaga!</div>`;

    return `
      <div class="forge-two-col">
        <div class="card">
          <div class="card-head">
            <div>
              <div class="card-title">🏛️ Diplomasi Niaga: ${esc(mState.loc.faction_name)}</div>
              <div class="card-sub">Hubungan politik menentukan embargo, diskon aliansi, dan lonjakan harga perang (WD-2).</div>
            </div>
            <span class="badge pending">Buku Besar ??? Kota Jauh: Menunggu Backend</span>
          </div>
          <div class="settlements-list">${relRows}</div>
        </div>

        <div class="card warm">
          <div class="card-head">
            <div>
              <div class="card-title">🐪 Kabar Karavan &amp; Arus Pasar</div>
              <div class="card-sub">Simulasi pergerakan karavan lintas kota yang mengguncang suplai &amp; permintaan lokal.</div>
            </div>
            <button class="btn btn-primary btn-xs" id="btn-refresh-caravan">🐪 Pantau Karavan</button>
          </div>
          <div class="settlements-list">${caravanHtml}</div>
          ${ui.lastNewsLogs.length ? `
            <div style="margin-top:8px;padding-top:6px;border-top:1px solid var(--border);font-size:10.5px;color:#cbd5e1">
              <b>Catatan Niaga Terbaru:</b>
              ${ui.lastNewsLogs.slice(0, 4).map(l => `<div>• ${esc(l)}</div>`).join("")}
            </div>
          ` : ""}
        </div>
      </div>
    `;
  }

  function render(container, snap, showToast = () => {}) {
    const mState = Bridge.getMarketState({
      viaShadowSyndicate: ui.viaShadowSyndicate,
      areaFilter: ui.areaFilter
    });

    const subTabsHtml = `
      <div class="sub-tabs-grid sub-tabs-3">
        <button class="sub-tab-btn ${ui.subTab === "buy" ? "active" : ""}" data-mkt-sub="buy">🛒 Beli Bahan (${mState.buyList.length})</button>
        <button class="sub-tab-btn ${ui.subTab === "sell" ? "active" : ""}" data-mkt-sub="sell">💰 Jual Barang &amp; Bahan</button>
        <button class="sub-tab-btn ${ui.subTab === "politics" ? "active" : ""}" data-mkt-sub="politics">🌐 Politik Faksi &amp; Karavan</button>
      </div>
    `;

    let bodyHtml = "";
    if (ui.subTab === "buy") bodyHtml = renderBuyTab(snap, mState);
    else if (ui.subTab === "sell") bodyHtml = renderSellTab(snap, mState);
    else bodyHtml = renderPoliticsTab(snap, mState);

    container.innerHTML = subTabsHtml + renderHeaderStrip(snap, mState) + bodyHtml;

    // Bindings
    container.querySelectorAll("[data-mkt-sub]").forEach(btn => {
      btn.onclick = () => {
        ui.subTab = btn.getAttribute("data-mkt-sub");
        render(container, Bridge.getSnapshot(), showToast);
      };
    });

    const btnSynd = container.querySelector("#btn-toggle-syndicate");
    if (btnSynd) {
      btnSynd.onclick = () => {
        ui.viaShadowSyndicate = !ui.viaShadowSyndicate;
        showToast(ui.viaShadowSyndicate
          ? "🕶️ Jalur Shadow Syndicate aktif (+45% markup beli, tembus batas kelas pasar)"
          : "⚖️ Kembali ke pasar resmi kota");
        render(container, Bridge.getSnapshot(), showToast);
      };
    }

    container.querySelectorAll("[data-mkt-area]").forEach(btn => {
      btn.onclick = () => {
        ui.areaFilter = btn.getAttribute("data-mkt-area");
        ui.catFilter = "ALL";
        render(container, Bridge.getSnapshot(), showToast);
      };
    });

    const selCat = container.querySelector("#mkt-cat-filter");
    if (selCat) {
      selCat.onchange = e => {
        ui.catFilter = e.target.value;
        render(container, Bridge.getSnapshot(), showToast);
      };
    }

    container.querySelectorAll("[data-mkt-buy]").forEach(btn => {
      btn.onclick = () => {
        const itemId = btn.getAttribute("data-mkt-buy");
        const qty = Number(btn.getAttribute("data-qty")) || 1;
        const res = Bridge.buyMarketMaterial({ itemId, qty, viaShadowSyndicate: ui.viaShadowSyndicate });
        if (!res.ok) return showToast(`⚠ ${res.reason}`);
        if (global.BSRPG_AUDIO) global.BSRPG_AUDIO.play("coin");
        showToast(`🛒 Dibeli ${qty}x ${res.itemName} (${res.tx.totalFormatted})`);
      };
    });

    container.querySelectorAll("[data-mkt-sell-mat]").forEach(btn => {
      btn.onclick = () => {
        const itemId = btn.getAttribute("data-mkt-sell-mat");
        const qty = Number(btn.getAttribute("data-qty")) || 1;
        const res = Bridge.sellBagMaterial({ itemId, qty, viaShadowSyndicate: ui.viaShadowSyndicate });
        if (!res.ok) return showToast(`⚠ ${res.reason}`);
        if (global.BSRPG_AUDIO) global.BSRPG_AUDIO.play("coin");
        showToast(`💰 Terjual ${qty}x ${res.itemName} -> +${res.tx.totalFormatted}`);
      };
    });

    container.querySelectorAll("[data-mkt-sell-gear]").forEach(btn => {
      btn.onclick = () => {
        const targetUid = btn.getAttribute("data-mkt-sell-gear");
        const res = Bridge.sellGalleryGearToMarket({ targetUid, viaShadowSyndicate: ui.viaShadowSyndicate });
        if (!res.ok) return showToast(`⚠ ${res.reason}`);
        if (global.BSRPG_AUDIO) global.BSRPG_AUDIO.play("coin");
        showToast(`💰 Hasil tempa ${res.itemName} terjual +${res.formatted}!`);
      };
    });

    const btnCaravan = container.querySelector("#btn-refresh-caravan");
    if (btnCaravan) {
      btnCaravan.onclick = () => {
        const res = Bridge.refreshCaravanNews();
        ui.lastNewsLogs = res.logs || [];
        showToast("🐪 Pergerakan karavan regional diperbarui!");
      };
    }
  }

  global.BSRPG_SCREEN_MARKET = { render };
})(window);
