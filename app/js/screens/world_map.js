/**
 * Battle-Smith RPG — Fase 2B & 3B: Layar Peta Rute Kota, Legend/Popup ⚔️ Sengketa, Ekosistem Level/Boss & 16 Dungeon
 * - Dilengkapi Poin 5: Tombol & Bubble Popup penjelasan "⚔️ Sengketa" (Kantong Sengketa Ras/Faksi)
 * - Strict 1-Area Lazy-Load (~153 KB) agar RAM Oppo A54 tetap < 150 MB
 */
(function (global) {
  "use strict";

  const Bridge = global.BSRPG_BRIDGE;

  const state = {
    subTab: "routes",     // "routes" | "ecosystem" | "dungeons"
    mapLayer: "world",    // "world" | "city"
    selectedAreaId: null,
    tierFilter: "ALL",
    ecoView: "levels",    // "levels" | "bosses" | "bestiary"
    zoneFilter: "ALL",
    matFilter: "ALL",
    page: 1,
    pageSize: 10,
    loadingAreaId: null,
    showSengketaLegend: false,
    contestedPopupLocId: null
  };

  // Koordinat geografis 16 Area (persentase responsif terhadap app/assets/ui/map_world.webp)
  const WORLD_AREA_COORDS = {
    crownfrost_isle:        { x: 56, y: 10, short: "Crownfrost" },
    hollowbarrow_highlands: { x: 72, y: 19, short: "Hollowbarrow" },
    hollowfrost_range:      { x: 47, y: 22, short: "Hollowfrost" },
    frostpine_taiga:        { x: 33, y: 22, short: "Frostpine" },
    briarfall_marches:      { x: 18, y: 24, short: "Briarfall" },
    emberwaste:             { x: 82, y: 31, short: "Emberwaste" },
    elderwake_grove:        { x: 22, y: 36, short: "Elderwake" },
    wyrmspine_mountains:    { x: 48, y: 38, short: "Wyrmspine" },
    ashwind_steppe:         { x: 68, y: 40, short: "Ashwind" },
    rustleaf_weald:         { x: 26, y: 49, short: "Rustleaf" },
    greymoor_downs:         { x: 38, y: 53, short: "Greymoor" },
    blackmere_fens:         { x: 67, y: 59, short: "Blackmere" },
    bonethorn_peninsula:    { x: 14, y: 61, short: "Bonethorn" },
    saltgrave_coast:        { x: 37, y: 66, short: "Saltgrave" },
    wraithtide_isles:       { x: 84, y: 71, short: "Wraithtide" },
    cinderwatch_isles:      { x: 60, y: 81, short: "Cinderwatch" }
  };

  const WORLD_ROUTES = [
    ["saltgrave_coast", "greymoor_downs"],
    ["saltgrave_coast", "bonethorn_peninsula"],
    ["saltgrave_coast", "blackmere_fens"],
    ["greymoor_downs", "rustleaf_weald"],
    ["greymoor_downs", "wyrmspine_mountains"],
    ["rustleaf_weald", "elderwake_grove"],
    ["elderwake_grove", "briarfall_marches"],
    ["elderwake_grove", "frostpine_taiga"],
    ["frostpine_taiga", "hollowfrost_range"],
    ["hollowfrost_range", "crownfrost_isle"],
    ["wyrmspine_mountains", "hollowfrost_range"],
    ["wyrmspine_mountains", "ashwind_steppe"],
    ["ashwind_steppe", "blackmere_fens"],
    ["ashwind_steppe", "emberwaste"],
    ["ashwind_steppe", "hollowbarrow_highlands"],
    ["blackmere_fens", "cinderwatch_isles"],
    ["blackmere_fens", "wraithtide_isles"]
  ];

  // Titik interaktif pada Peta Kota/Desa bergaya Final Fantasy Tactics (map_city.webp)
  const CITY_LANDMARKS = [
    { id: "forge",  x: 24, y: 58, label: "🔥 Bengkel Tempa",     action: "route", target: "forge" },
    { id: "market", x: 56, y: 50, label: "⚖️ Pasar S&D",         action: "route", target: "market" },
    { id: "shop",   x: 74, y: 25, label: "🏪 Balai Murid & Inn", action: "route", target: "shop" },
    { id: "battle", x: 34, y: 19, label: "⚔️ Patroli & Dungeon", action: "route", target: "battle" },
    { id: "world",  x: 76, y: 76, label: "⚓ Pelabuhan (World)",  action: "world", target: "world" }
  ];

  const SETTLEMENT_ICONS = {
    "Village": "🏘️",
    "Town": "🏰",
    "City": "🏛️",
    "Major City": "👑"
  };

  function esc(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderVisualMapCard(snap, areas, locsByArea) {
    const curLoc = snap.location;
    const Assets = global.BSRPG_ASSETS;
    const worldUrl = Assets ? Assets.get("ui_map_world") : "";
    const cityUrl = Assets ? Assets.get("ui_map_city") : "";
    const activeAreaId = state.selectedAreaId || curLoc?.area_id || "saltgrave_coast";
    const selArea = areas.find(a => a.area_id === activeAreaId) || areas[0];
    const selAreaLocs = locsByArea[activeAreaId] || [];

    const layerSwitchHtml = `
      <div class="sub-tabs-grid" style="margin-bottom:8px">
        <button class="sub-tab-btn ${state.mapLayer === "world" ? "active" : ""}" data-imap-layer="world">🗺️ 1. World Map (16 Area)</button>
        <button class="sub-tab-btn ${state.mapLayer === "city" ? "active" : ""}" data-imap-layer="city">🏘️ 2. City / Village Map (Gaya FFT)</button>
      </div>
    `;

    if (state.mapLayer === "city") {
      const cityPinsHtml = CITY_LANDMARKS.map(lm => `
        <button type="button" class="imap-pin city-node" style="left:${lm.x}%;top:${lm.y}%"
          data-city-pin-action="${lm.action}" data-city-pin-target="${lm.target}">
          ${lm.label}
        </button>
      `).join("");

      const townChipsHtml = selAreaLocs.map(l => {
        const isHere = curLoc?.location_id === l.location_id;
        return isHere
          ? `<span class="badge ok">📍 ${esc(l.location_name)} (${esc(l.settlement_type)})</span>`
          : `<button type="button" class="chip-btn" data-travel-loc="${esc(l.location_id)}">🚶 ${esc(l.location_name)}</button>`;
      }).join("");

      return `
        <div class="card warm imap-shell">
          <div class="card-head">
            <div>
              <div class="card-title">🏘️ Peta Kota / Desa — ${esc(curLoc?.location_name || "-")}</div>
              <div class="card-sub">Gaya ilustratif Final Fantasy Tactics • Klik bangunan untuk langsung masuk fitur, atau klik ⚓ Pelabuhan ke World Map.</div>
            </div>
            <span class="badge ok">${esc(curLoc?.settlement_type || "Village")}</span>
          </div>
          ${layerSwitchHtml}
          <div class="imap-canvas city-ratio" data-imap="city">
            ${cityUrl ? `<img src="${cityUrl}" alt="Peta Kota" class="imap-bg" />` : ""}
            ${cityPinsHtml}
          </div>
          <div style="display:flex;gap:5px;flex-wrap:wrap;align-items:center">
            <span style="font-size:10.5px;color:var(--muted)">Kota/Desa di ${esc(selArea?.area_name || "-")}:</span>
            ${townChipsHtml}
          </div>
        </div>
      `;
    }

    // Lapisan 1: World Map (16 Area Pins + SVG Route Lines)
    const linesSvg = WORLD_ROUTES.map(([aId, bId]) => {
      const ca = WORLD_AREA_COORDS[aId];
      const cb = WORLD_AREA_COORDS[bId];
      if (!ca || !cb) return "";
      return `<line x1="${ca.x}%" y1="${ca.y}%" x2="${cb.x}%" y2="${cb.y}%" stroke="rgba(251,191,36,0.45)" stroke-width="1.6" stroke-dasharray="4 3" />`;
    }).join("");

    const pinsHtml = areas.map(a => {
      const c = WORLD_AREA_COORDS[a.area_id];
      if (!c) return "";
      const aLocs = locsByArea[a.area_id] || [];
      const isHere = curLoc?.area_id === a.area_id;
      const isSel = activeAreaId === a.area_id;
      const hasContested = aLocs.some(l => l.is_contested_enclave === "Y");
      const cls = [
        "imap-pin",
        isHere ? "here" : "",
        isSel && !isHere ? "selected" : "",
        hasContested ? "contested" : ""
      ].filter(Boolean).join(" ");
      return `
        <button type="button" class="${cls}" style="left:${c.x}%;top:${c.y}%" data-world-pin="${esc(a.area_id)}" title="${esc(a.area_name)} (Tier ${a.tier})">
          <span class="imap-pin-dot"></span>
          <span>T${esc(a.tier)} ${esc(c.short)}${hasContested ? " ⚔️" : ""}</span>
        </button>
      `;
    }).join("");

    const selTownBtns = selAreaLocs.map(l => {
      const isHere = curLoc?.location_id === l.location_id;
      return isHere
        ? `<button type="button" class="btn btn-primary btn-xs" data-imap-layer="city">🏘️ Masuk Peta ${esc(l.location_name)}</button>`
        : `<button type="button" class="btn btn-secondary btn-xs" data-travel-loc="${esc(l.location_id)}">🚶 Ke ${esc(l.location_name)}</button>`;
    }).join("");

    return `
      <div class="card imap-shell">
        <div class="card-head">
          <div>
            <div class="card-title">🗺️ Peta Dunia Interaktif (16 Area &amp; 77 Kota)</div>
            <div class="card-sub">Klik titik Area di peta untuk melihat rute kota, sengketa ⚔️, atau masuk ke Peta Kota/Desa.</div>
          </div>
          <span class="badge ok">📍 ${esc(curLoc?.area_name || "-")}</span>
        </div>
        ${layerSwitchHtml}
        <div class="imap-canvas world-ratio" data-imap="world">
          ${worldUrl ? `<img src="${worldUrl}" alt="Peta Dunia" class="imap-bg" />` : ""}
          <svg class="imap-routes-svg" aria-hidden="true">${linesSvg}</svg>
          ${pinsHtml}
        </div>
        ${selArea ? `
          <div class="card warm" style="padding:8px 10px">
            <div class="card-head">
              <div>
                <div class="card-title" style="font-size:12px">📍 ${esc(selArea.area_name)} <span class="badge">Tier ${esc(selArea.tier)} • Lv.${esc(selArea.outdoor_level_range)}</span></div>
                <div class="card-sub">${esc(selArea.biome_type)} • Faksi: <b>${esc(selArea.faction_name)}</b> • ${selAreaLocs.length} Permukiman</div>
              </div>
              <button type="button" class="btn btn-primary btn-xs" data-inspect-area="${esc(selArea.area_id)}">👹 Level &amp; Boss</button>
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px">${selTownBtns}</div>
          </div>
        ` : ""}
      </div>
    `;
  }

  function renderRoutesSubTab(snap) {
    const curLoc = snap.location;
    const areas = snap.catalogs.areas || [];
    const locs = snap.catalogs.locations || [];

    const locsByArea = {};
    for (const l of locs) {
      if (!locsByArea[l.area_id]) locsByArea[l.area_id] = [];
      locsByArea[l.area_id].push(l);
    }
    const rankOrder = { "Village": 1, "Town": 2, "City": 3, "Major City": 4 };
    for (const k of Object.keys(locsByArea)) {
      locsByArea[k].sort((a, b) => {
        const lvA = parseInt(a.level_range, 10) || 0;
        const lvB = parseInt(b.level_range, 10) || 0;
        if (lvA !== lvB) return lvA - lvB;
        return (rankOrder[a.settlement_type] || 9) - (rankOrder[b.settlement_type] || 9);
      });
    }

    const filteredAreas = [...areas]
      .filter(a => state.tierFilter === "ALL" || String(a.tier) === String(state.tierFilter))
      .sort((a, b) => Number(a.tier) - Number(b.tier) || Number(a.area_no) - Number(b.area_no));

    const tierPills = [
      { id: "ALL", lbl: `Semua (${areas.length})` },
      { id: "1", lbl: "Tier 1 (Lv.1–30)" },
      { id: "2", lbl: "Tier 2 (Lv.31–60)" },
      { id: "3", lbl: "Tier 3 (Lv.61–90)" },
      { id: "4", lbl: "Tier 4 (Lv.91–120)" },
      { id: "5", lbl: "Tier 5 (Lv.121–150)" }
    ].map(t => `<button class="pill-btn ${state.tierFilter === t.id ? "active" : ""}" data-map-tier="${t.id}">${t.lbl}</button>`).join("");

    const areaCardsHtml = filteredAreas.map(a => {
      const areaLocs = locsByArea[a.area_id] || [];
      const isCurrentArea = curLoc?.area_id === a.area_id;
      const isLoadedInRam = snap.activeLoadedAreaId === a.area_id;

      const settlementsHtml = areaLocs.map(l => {
        const isHere = curLoc?.location_id === l.location_id;
        const icon = SETTLEMENT_ICONS[l.settlement_type] || "📍";
        const contested = l.is_contested_enclave === "Y";
        const popupOpen = contested && state.contestedPopupLocId === l.location_id;

        return `
          <div style="display:flex;flex-direction:column;gap:5px">
            <div class="settlement-row ${isHere ? "here" : ""}">
              <div style="min-width:0;flex:1">
                <div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap">
                  <strong style="font-size:12px;color:${isHere ? "var(--amber-hi)" : "#f1f5f9"}">${icon} ${esc(l.location_name)}</strong>
                  <span class="badge">${esc(l.settlement_type)} • Lv.${esc(l.level_range)}</span>
                  ${contested
                    ? `<button type="button" class="badge warn" style="cursor:pointer" data-sengketa-info="${esc(l.location_id)}" title="Klik untuk melihat detail Kantong Sengketa">⚔️ Sengketa ${popupOpen ? "▴" : "ℹ️"}</button>`
                    : ""}
                </div>
                <div style="font-size:10.5px;color:var(--muted);margin-top:2px">
                  Wilayah: ${esc(l.region_name)} • Ras Dominan: ${esc(l.dominant_race)} • Spesialis: ${esc(l.specialties || "-")}
                </div>
              </div>
              ${isHere
                ? `<span class="badge ok" style="flex-shrink:0">📍 Lokasi Saat Ini</span>`
                : `<button class="btn btn-secondary btn-xs" data-travel-loc="${esc(l.location_id)}">🚶 Pindah</button>`}
            </div>
            ${popupOpen ? `
              <div class="sengketa-bubble">
                <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
                  <strong style="color:#fda4af;font-size:11.5px">⚔️ Kantong Sengketa Faksi/Ras — ${esc(l.location_name)}</strong>
                  <button type="button" class="chip-btn" data-sengketa-close="${esc(l.location_id)}">✕ Tutup</button>
                </div>
                <div style="font-size:11px;color:#e2e8f0;line-height:1.45;margin-top:4px">
                  <div>• <b>Ciri Konflik Lokal:</b> ${esc(l.trait || "Gesekan perbatasan antar ras dan faksi penguasa.")}</div>
                  <div>• <b>Demografi Sengketa:</b> Mayoritas <b>${esc(l.dominant_race)}</b> berdampingan tegang dengan minoritas <b>${esc(l.minority_races_usulan || "-")}</b> di bawah Faksi <b>${esc(l.faction_name)}</b>.</div>
                  <div>• <b>Dampak Gameplay:</b> Fluktuasi harga <b>⚖️ Pasar S&amp;D</b> &amp; permintaan senjata lebih tajam, rawan gesekan embargo/Shadow Syndicate, dan memicu kartu <b>📜 Isu Moral</b> bertema sengketa!</div>
                </div>
              </div>
            ` : ""}
          </div>
        `;
      }).join("");

      return `
        <div class="card ${isCurrentArea ? "warm" : ""}">
          <div class="card-head">
            <div>
              <div class="card-title">
                ${esc(a.area_name)}
                ${isLoadedInRam ? `<span class="badge ok" style="margin-left:5px">Di RAM</span>` : ""}
              </div>
              <div class="card-sub">Tier ${esc(a.tier)} (Lv.${esc(a.outdoor_level_range)}) • ${esc(a.biome_type)} • Faksi: <b>${esc(a.faction_name)}</b></div>
            </div>
            <div style="display:flex;gap:5px;align-items:center;flex-wrap:wrap">
              <span class="badge">T${esc(a.tier)}</span>
              <button class="btn btn-primary btn-xs" data-inspect-area="${esc(a.area_id)}">👹 Level &amp; Boss</button>
            </div>
          </div>
          <div class="settlements-list">${settlementsHtml}</div>
        </div>
      `;
    }).join("");

    return `
      ${renderVisualMapCard(snap, areas, locsByArea)}

      <div class="card teal" style="margin-bottom:8px">
        <div class="card-head">
          <div>
            <div class="card-title">📍 Posisi Aktif: ${esc(curLoc?.location_name || "-")} (${esc(curLoc?.area_name || "-")})</div>
            <div class="card-sub">
              Area di RAM: <b style="color:var(--teal-hi)">${esc(snap.activeLoadedAreaId || "Belum dimuat (0 KB)")}</b> (Hanya 1 Area dimuat pada satu waktu demi RAM Oppo A54 &lt; 150 MB).
            </div>
          </div>
          <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
            <button type="button" class="chip-btn warn" id="btn-toggle-sengketa-legend">
              ℹ️ Apa Arti ⚔️ Sengketa? ${state.showSengketaLegend ? "▴" : "▾"}
            </button>
            <span class="badge pending">Ongkos Karavan: Menunggu Backend</span>
          </div>
        </div>
        ${state.showSengketaLegend ? `
          <div class="sengketa-bubble" style="margin-top:6px">
            <strong style="color:#fda4af;font-size:11.5px">📖 Legenda Peta: Arti Label "⚔️ Sengketa" (Contested Enclave — WD-2)</strong>
            <div style="font-size:11px;color:#e2e8f0;line-height:1.45;margin-top:4px">
              Kota/desa berlabel <b>⚔️ Sengketa</b> adalah permukiman perbatasan tempat ras lokal atau kantong pengungsi berseberangan dengan faksi penguasa Area.
              <br/>• <b>Klik langsung lencana ⚔️ Sengketa</b> pada nama kota mana pun di bawah untuk membaca konflik spesifik kota tersebut!
              <br/>• <b>Keuntungan &amp; Risiko:</b> Permintaan senjata/logam tempur lebih tinggi di <b>⚖️ Pasar S&amp;D</b>, jalur <b>🕶️ Shadow Syndicate</b> sering dibutuhkan saat boikot pecah, serta kaya akan peristiwa <b>📜 Isu Moral</b>.
            </div>
          </div>
        ` : ""}
      </div>

      <div class="filter-pills thin-scroll">${tierPills}</div>
      <div class="map-areas-stack">${areaCardsHtml}</div>
    `;
  }

  function renderEcosystemSubTab(snap) {
    const curAreaId = snap.activeLoadedAreaId || snap.location?.area_id || "saltgrave_coast";
    const areaData = snap.activeAreaData;

    if (!areaData || snap.activeLoadedAreaId !== curAreaId) {
      if (state.loadingAreaId !== curAreaId) {
        state.loadingAreaId = curAreaId;
        Bridge.loadAreaData(curAreaId).finally(() => {
          state.loadingAreaId = null;
        });
      }
      return `
        <div class="card teal">
          <div class="card-title">⏳ Memuat Ekosistem Area (${esc(curAreaId)})...</div>
          <div class="card-sub">Memuat 1 file Area (~153 KB) dan membersihkan Area sebelumnya dari RAM.</div>
        </div>
      `;
    }

    const areaMeta = areaData.area || {};
    const isPlayerInThisArea = snap.location?.area_id === areaMeta.area_id;
    const hs = snap.huntState || {};
    const curDay = snap.calendar.day;

    const areaOptionsHtml = (snap.catalogs.areas || [])
      .slice()
      .sort((a, b) => Number(a.tier) - Number(b.tier) || Number(a.area_no) - Number(b.area_no))
      .map(a => `<option value="${esc(a.area_id)}" ${a.area_id === areaMeta.area_id ? "selected" : ""}>T${esc(a.tier)} — ${esc(a.area_name)} (Lv.${esc(a.outdoor_level_range)})</option>`)
      .join("");

    const viewPills = [
      { id: "levels", lbl: "🌲 30 Grup Level Idle (Common)" },
      { id: "bosses", lbl: "👑 Mini Boss & Boss Area (Misi)" },
      { id: "bestiary", lbl: `📖 Ensiklopedia Spesies (${areaData.monster_count})` }
    ].map(v => `<button class="pill-btn ${state.ecoView === v.id ? "active" : ""}" data-eco-view="${v.id}">${v.lbl}</button>`).join("");

    let innerHtml = "";

    if (state.ecoView === "levels") {
      const groups = (snap.levelGroups || []).filter(g => {
        if (state.zoneFilter !== "ALL" && g.zoneBand !== state.zoneFilter) return false;
        if (state.matFilter !== "ALL" && !g.dropCategories.includes(state.matFilter)) return false;
        return true;
      });

      const cards = groups.map(g => {
        const { stats, antiFarm } = Bridge.computeMonsterPreview(g.representativeMonster);
        const mats = g.sampleMaterials.map(m => `${esc(m.name)} [${esc(m.category)}]`).join(" • ");
        const isSelected = isPlayerInThisArea && (snap.player.selectedIdleLevel || snap.player.level) === g.lvl;
        return `
          <div class="card ${isSelected ? "warm" : ""}">
            <div class="card-head">
              <div>
                <div class="card-title">🌲 Kolam Monster Level ${g.lvl} <span class="badge">${esc(g.zoneBand)}</span></div>
                <div class="card-sub">${esc(g.regionName)} • ${g.regularCount} Reguler + ${g.specialCount} ✦ Khusus (${esc(g.specialMonster?.name || "-")})</div>
              </div>
              ${isPlayerInThisArea
                ? `<button class="btn ${isSelected ? "btn-secondary" : "btn-primary"} btn-xs" data-map-pick-lvl="${g.lvl}">${isSelected ? "✓ Aktif" : "🎯 Patroli Lv Ini"}</button>`
                : `<span class="badge pending">Pindah Kota ke Area Ini Dulu</span>`}
            </div>
            <div class="monster-stat-strip">
              <span>❤️ Rata2 HP <b>${stats.hp}</b></span>
              <span>⚔️ Dmg <b>${stats.dmg}</b></span>
              <span>⚡ Elemen: <b>${esc(g.elements.join(", "))}</b></span>
              <span>📈 XP ${Math.round(antiFarm.xpMult * 100)}% • Drop ${Math.round(antiFarm.effectiveDropMult * 100)}%</span>
            </div>
            <div style="font-size:10.5px;color:#cbd5e1">🪨 <b>Bahan Drop:</b> ${mats || "-"}</div>
          </div>
        `;
      }).join("");

      innerHtml = `
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">
          <select id="map-flt-zone" class="select-compact">
            <option value="ALL" ${state.zoneFilter === "ALL" ? "selected" : ""}>Wilayah: Semua (3)</option>
            <option value="Rendah" ${state.zoneFilter === "Rendah" ? "selected" : ""}>Wilayah Rendah</option>
            <option value="Sedang" ${state.zoneFilter === "Sedang" ? "selected" : ""}>Wilayah Sedang</option>
            <option value="Tinggi" ${state.zoneFilter === "Tinggi" ? "selected" : ""}>Wilayah Tinggi</option>
          </select>
          <select id="map-flt-mat" class="select-compact">
            ${["ALL", "Logam", "Kulit", "Kayu", "Kristal", "Tulang", "Serat"].map(c =>
              `<option value="${c}" ${state.matFilter === c ? "selected" : ""}>${c === "ALL" ? "Filter Bahan: Semua" : `Bahan: ${c}`}</option>`
            ).join("")}
          </select>
        </div>
        <div class="cards-grid">${cards}</div>
      `;
    } else if (state.ecoView === "bosses") {
      const bosses = (areaData.monsters || [])
        .filter(m => m.type === "Boss" || m.type === "Mini Boss")
        .sort((a, b) => b.lvl - a.lvl);

      const cards = bosses.map(m => {
        const { stats } = Bridge.computeMonsterPreview(m);
        const cdUntil = hs.bossCooldownUntilDay?.[m.id] || 0;
        const cdRem = Math.max(0, cdUntil - curDay);
        const isAreaBoss = m.type === "Boss";
        const drops = (m.drops || []).slice(0, 4).map(([dId, ch]) => `${esc(Bridge.resolveDropName(dId).name)} (${Math.round(Number(ch) * 100)}%)`).join(" • ");

        return `
          <div class="card ${isAreaBoss ? "boss" : "warm"}" data-monster-card="${esc(m.id)}">
            <div class="card-head">
              <div>
                <div class="card-title">${isAreaBoss ? "👑" : "💀"} ${esc(m.name)} <span class="badge">Lv.${m.lvl} ${esc(m.type)}</span></div>
                <div class="card-sub">
                  ${isAreaBoss ? "Hanya via Misi Ekspedisi Boss (Cooldown 18 Hari WD)" : "8%/jam Sergapan Idle atau via Misi Buruan Wilayah (Cooldown 6 Hari WD)"}
                </div>
              </div>
              ${cdRem > 0 ? `<span class="badge warn">⏳ Cooldown ${cdRem}h</span>` : `<span class="badge ok">Tersedia</span>`}
            </div>
            <div class="monster-stat-strip">
              <span>❤️ HP <b>${stats.hp}</b></span>
              <span>⚔️ Dmg <b>${stats.dmg}</b></span>
              <span>🛡️ Armor <b>${stats.armor}%</b></span>
              <span>🎯 Weak: <b style="color:var(--amber-hi)">${esc(m.weak)}</b></span>
            </div>
            <div style="font-size:10.5px;color:#cbd5e1">
              <div>🎁 <b>Drop:</b> ${drops}</div>
              ${m.boss_skill ? `<div style="color:#fecaca;margin-top:2px">🔥 ${esc(m.boss_skill)}</div>` : ""}
            </div>
            ${isPlayerInThisArea
              ? `<button class="btn btn-primary btn-xs" data-goto-boss-mission="${esc(m.id)}">📜 Buka Panel Misi Boss</button>`
              : `<span class="badge pending">Pindah Kota ke ${esc(areaMeta.area_name)} untuk mengambil Misi</span>`}
          </div>
        `;
      }).join("");

      innerHtml = `<div class="cards-grid">${cards}</div>`;
    } else {
      const list = areaData.monsters || [];
      const totalPages = Math.max(1, Math.ceil(list.length / state.pageSize));
      if (state.page > totalPages) state.page = totalPages;
      const start = (state.page - 1) * state.pageSize;
      const slice = list.slice(start, start + state.pageSize);

      innerHtml = `
        <div class="pagination-bar" style="margin-bottom:8px">
          <button class="chip-btn" id="btn-bestiary-prev" ${state.page <= 1 ? "disabled" : ""}>◀ Sebelumnya</button>
          <span style="font-size:11.5px;color:#cbd5e1">Ensiklopedia <b>${start + 1}–${Math.min(list.length, start + state.pageSize)}</b> dari <b>${list.length}</b> (Hal ${state.page}/${totalPages})</span>
          <button class="chip-btn" id="btn-bestiary-next" ${state.page >= totalPages ? "disabled" : ""}>Berikutnya ▶</button>
        </div>
        <div class="cards-grid">
          ${slice.map(m => {
            const { stats } = Bridge.computeMonsterPreview(m);
            const drops = (m.drops || []).slice(0, 3).map(([dId, ch]) => `${esc(Bridge.resolveDropName(dId).name)} (${Math.round(Number(ch) * 100)}%)`).join(" • ");
            return `
              <div class="card">
                <div class="card-head">
                  <div>
                    <div class="card-title">${esc(m.name)} <span class="badge">Lv.${m.lvl}</span></div>
                    <div class="card-sub">${esc(m.type)} • ${esc(m.fam)} (${esc(m.role)})</div>
                  </div>
                  <span class="badge">El: ${esc(m.el)}</span>
                </div>
                <div class="monster-stat-strip">
                  <span>❤️ HP <b>${stats.hp}</b></span>
                  <span>⚔️ Dmg <b>${stats.dmg}</b></span>
                  <span>🎯 Weak: <b>${esc(m.weak)}</b></span>
                </div>
                <div style="font-size:10.5px;color:var(--muted)">🎁 ${drops}</div>
              </div>
            `;
          }).join("")}
        </div>
      `;
    }

    return `
      <div class="card teal" style="margin-bottom:8px">
        <div class="card-head" style="align-items:center">
          <div>
            <div class="card-title">👹 Ekosistem: ${esc(areaMeta.area_name)} (Tier ${esc(areaMeta.tier)})</div>
            <div class="card-sub">Monster biasa diburu per Level secara acak; Mini Boss &amp; Boss dipanggil lewat Misi ber-cooldown.</div>
          </div>
          <select id="sel-inspect-area" class="select-compact" aria-label="Pilih Area">
            ${areaOptionsHtml}
          </select>
        </div>
      </div>

      <div class="filter-pills thin-scroll">${viewPills}</div>
      ${innerHtml}
    `;
  }

  function renderDungeonsSubTab(snap) {
    const areas = [...(snap.catalogs.areas || [])].sort((a, b) => Number(a.tier) - Number(b.tier) || Number(a.area_no) - Number(b.area_no));
    const cards = areas.map(a => `
      <div class="card">
        <div class="card-head">
          <div>
            <div class="card-title">🗝️ ${esc(a.dungeon_name)}</div>
            <div class="card-sub">${esc(a.area_name)} • Tier ${esc(a.tier)} (Lv.${esc(a.dungeon_level_min)}–${esc(a.dungeon_level_max)})</div>
          </div>
          <span class="badge">${esc(a.dungeon_floors)} Lantai</span>
        </div>
        <div style="font-size:11px;color:#cbd5e1">
          Tema: <b>${esc(a.dungeon_theme)}</b> • Portal tiap <b>${esc(a.portal_interval_floors)} lt</b> • Permanen di <b>Lt.${esc(a.permanent_milestone_floor)}</b>
        </div>
        <button class="btn btn-secondary btn-xs" disabled>🔒 Masuk Dungeon (Menunggu Backend)</button>
      </div>
    `).join("");

    return `
      <div class="card warm" style="margin-bottom:8px">
        <div class="card-head">
          <div>
            <div class="card-title">🗝️ 16 Dungeon Bawah Tanah (100 Lantai per Area — WD-1.04 &amp; WD-1.05)</div>
            <div class="card-sub">Checkpoint portal aktif setiap 10 lantai (maks 3 dungeon tersimpan sementara, permanen di lantai 50).</div>
          </div>
          <span class="badge pending">Progresi Lantai: Menunggu Backend</span>
        </div>
      </div>
      <div class="cards-grid">${cards}</div>
    `;
  }

  function render(container, snap, callbacks = {}) {
    const { showToast = () => {}, goToRoute = () => {} } = typeof callbacks === "function"
      ? { showToast: callbacks, goToRoute: () => {} }
      : callbacks;

    const subTabsHtml = `
      <div class="sub-tabs-grid sub-tabs-3">
        <button class="sub-tab-btn ${state.subTab === "routes" ? "active" : ""}" data-map-sub="routes">🌍 16 Area &amp; 77 Kota</button>
        <button class="sub-tab-btn ${state.subTab === "ecosystem" ? "active" : ""}" data-map-sub="ecosystem">👹 Level &amp; Boss</button>
        <button class="sub-tab-btn ${state.subTab === "dungeons" ? "active" : ""}" data-map-sub="dungeons">🗝️ 16 Dungeon</button>
      </div>
    `;

    let contentHtml = "";
    if (state.subTab === "routes") contentHtml = renderRoutesSubTab(snap);
    else if (state.subTab === "ecosystem") contentHtml = renderEcosystemSubTab(snap);
    else contentHtml = renderDungeonsSubTab(snap);

    container.innerHTML = subTabsHtml + contentHtml;

    container.querySelectorAll("[data-map-sub]").forEach(btn => {
      btn.onclick = () => {
        state.subTab = btn.getAttribute("data-map-sub");
        render(container, Bridge.getSnapshot(), callbacks);
      };
    });

    const btnLegend = container.querySelector("#btn-toggle-sengketa-legend");
    if (btnLegend) {
      btnLegend.onclick = () => {
        state.showSengketaLegend = !state.showSengketaLegend;
        render(container, Bridge.getSnapshot(), callbacks);
      };
    }

    container.querySelectorAll("[data-sengketa-info]").forEach(btn => {
      btn.onclick = () => {
        const locId = btn.getAttribute("data-sengketa-info");
        state.contestedPopupLocId = state.contestedPopupLocId === locId ? null : locId;
        render(container, Bridge.getSnapshot(), callbacks);
      };
    });

    container.querySelectorAll("[data-sengketa-close]").forEach(btn => {
      btn.onclick = () => {
        state.contestedPopupLocId = null;
        render(container, Bridge.getSnapshot(), callbacks);
      };
    });

    container.querySelectorAll("[data-map-tier]").forEach(btn => {
      btn.onclick = () => {
        state.tierFilter = btn.getAttribute("data-map-tier");
        render(container, Bridge.getSnapshot(), callbacks);
      };
    });

    container.querySelectorAll("[data-imap-layer]").forEach(btn => {
      btn.onclick = () => {
        if (global.BSRPG_AUDIO) global.BSRPG_AUDIO.play("ui_click");
        state.mapLayer = btn.getAttribute("data-imap-layer");
        render(container, Bridge.getSnapshot(), callbacks);
      };
    });

    container.querySelectorAll("[data-world-pin]").forEach(btn => {
      btn.onclick = () => {
        if (global.BSRPG_AUDIO) global.BSRPG_AUDIO.play("ui_click");
        const areaId = btn.getAttribute("data-world-pin");
        state.selectedAreaId = areaId;
        render(container, Bridge.getSnapshot(), callbacks);
      };
    });

    container.querySelectorAll("[data-city-pin-action]").forEach(btn => {
      btn.onclick = () => {
        if (global.BSRPG_AUDIO) global.BSRPG_AUDIO.play("ui_click");
        const act = btn.getAttribute("data-city-pin-action");
        const tgt = btn.getAttribute("data-city-pin-target");
        if (act === "world") {
          state.mapLayer = "world";
          render(container, Bridge.getSnapshot(), callbacks);
        } else if (act === "route") {
          goToRoute(tgt);
        }
      };
    });

    container.querySelectorAll("[data-travel-loc]").forEach(btn => {
      btn.onclick = async () => {
        const res = await Bridge.travelToLocation(btn.getAttribute("data-travel-loc"));
        if (!res.ok) return showToast(`⚠ ${res.reason}`);
        if (global.BSRPG_AUDIO) global.BSRPG_AUDIO.play("ui_click");
        state.selectedAreaId = res.loc.area_id;
        showToast(`🚶 Tiba di ${res.loc.location_name} (${res.loc.area_name}, Tier ${res.loc.tier})!`);
      };
    });

    container.querySelectorAll("[data-inspect-area]").forEach(btn => {
      btn.onclick = async () => {
        const areaId = btn.getAttribute("data-inspect-area");
        state.subTab = "ecosystem";
        state.page = 1;
        try {
          const data = await Bridge.loadAreaData(areaId);
          showToast(`📂 Ekosistem ${data?.area?.area_name || areaId} dimuat.`);
        } catch (err) {
          showToast(`⚠ ${err.message}`);
        }
      };
    });

    const selArea = container.querySelector("#sel-inspect-area");
    if (selArea) {
      selArea.onchange = async e => {
        state.page = 1;
        try { await Bridge.loadAreaData(e.target.value); } catch (err) { showToast(`⚠ ${err.message}`); }
      };
    }

    container.querySelectorAll("[data-eco-view]").forEach(btn => {
      btn.onclick = () => {
        state.ecoView = btn.getAttribute("data-eco-view");
        state.page = 1;
        render(container, Bridge.getSnapshot(), callbacks);
      };
    });

    const fltZone = container.querySelector("#map-flt-zone");
    if (fltZone) fltZone.onchange = e => { state.zoneFilter = e.target.value; render(container, Bridge.getSnapshot(), callbacks); };
    const fltMat = container.querySelector("#map-flt-mat");
    if (fltMat) fltMat.onchange = e => { state.matFilter = e.target.value; render(container, Bridge.getSnapshot(), callbacks); };

    container.querySelectorAll("[data-map-pick-lvl]").forEach(btn => {
      btn.onclick = () => {
        const lv = Number(btn.getAttribute("data-map-pick-lvl"));
        Bridge.setIdleLevel(lv);
        if (global.BSRPG_SCREEN_BATTLE?.openSubTab) global.BSRPG_SCREEN_BATTLE.openSubTab("level_idle");
        showToast(`🌲 Patroli Idle disetel ke Kolam Level ${lv}!`);
        goToRoute("battle");
      };
    });

    container.querySelectorAll("[data-goto-boss-mission]").forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute("data-goto-boss-mission");
        if (global.BSRPG_SCREEN_BATTLE?.openSubTab) global.BSRPG_SCREEN_BATTLE.openSubTab("boss_missions", id);
        goToRoute("battle");
      };
    });

    const prevB = container.querySelector("#btn-bestiary-prev");
    if (prevB) prevB.onclick = () => { state.page = Math.max(1, state.page - 1); render(container, Bridge.getSnapshot(), callbacks); };
    const nextB = container.querySelector("#btn-bestiary-next");
    if (nextB) nextB.onclick = () => { state.page += 1; render(container, Bridge.getSnapshot(), callbacks); };
  }

  function openMonstersTab() {
    state.subTab = "ecosystem";
  }

  global.BSRPG_SCREEN_MAP = { render, openMonstersTab };
})(window);
