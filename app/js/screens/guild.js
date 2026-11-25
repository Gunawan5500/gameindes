/**
 * Battle-Smith RPG — Fase 3B: Layar 5 Murid AI Seed & Cabang Bengkel (77 Kota)
 * Terhubung langsung ke generateApprenticeFromSeed (CD-6.02), runApprenticeTrial,
 * dan assignApprenticeToBranch di game_loop_engine.js (0% ubah engines/).
 */
(function (global) {
  "use strict";

  const Bridge = global.BSRPG_BRIDGE;
  const B = global.BSRPG_BACKEND;

  const ui = {
    subTab: "apprentices", // "apprentices" | "branches"
    selectedSeedForBranch: ""
  };

  function esc(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function shortName(seed) {
    return String(seed || "").split("-").pop() || seed;
  }

  function renderApprenticesTab(snap) {
    const list = snap.apprenticeProfiles || [];
    const sub = snap.build.subStats?.byId || {};
    const leadBonus = Number(sub.cha_apprentice_lead?.value || 0).toFixed(1);

    const cardsHtml = list.map(a => {
      const prof = a.profile;
      const name = shortName(a.seed);
      const branchLoc = a.branchLocationId
        ? (snap.catalogs.locations || []).find(l => l.location_id === a.branchLocationId)
        : null;

      const nextTrialReq = a.passedTrials === 0 ? 50 : a.passedTrials === 1 ? 80 : null;
      const canRunTrial = nextTrialReq !== null && a.skill >= nextTrialReq;

      const statusBadge = a.isCompanion
        ? `<span class="badge ok">⚔️ Companion Aktif</span>`
        : branchLoc
          ? `<span class="badge warm">🏪 Kepala Cabang (${esc(branchLoc.location_name)})</span>`
          : `<span class="badge">🔨 Belajar di Bengkel</span>`;

      const skillPct = Math.min(100, Math.round((prof.effectiveSkill / Math.max(1, prof.talentCap)) * 100));

      return `
        <div class="card ${a.isCompanion ? "warm" : branchLoc ? "teal" : ""}">
          <div class="card-head">
            <div style="display:flex;align-items:center;gap:9px;min-width:0">
              ${global.BSRPG_ASSETS ? global.BSRPG_ASSETS.renderDualTierPortraitHtml(a.seed, name, 42) : ""}
              <div style="min-width:0">
                <div class="card-title">
                  ${esc(name)}
                  <span class="badge">${esc(prof.smithClass)}</span>
                </div>
                <div class="card-sub">
                  Latar: <b>${esc(prof.background)}</b> • Mazhab: <b>${esc(prof.primarySmithType)}</b> • Destiny: <b>${esc(prof.destinyCard)}</b>
                </div>
              </div>
            </div>
            ${statusBadge}
          </div>

          <div style="display:flex;align-items:center;gap:8px;margin:2px 0">
            <span style="font-size:10.5px;color:#cbd5e1;width:118px;flex-shrink:0">Skill <b>${prof.effectiveSkill}</b> / Cap ${prof.talentCap}</span>
            <div class="bar-track" style="flex:1;height:7px">
              <div class="bar-fill xps" style="width:${skillPct}%"></div>
            </div>
            <span style="font-size:10.5px;color:var(--teal-hi);flex-shrink:0">Ujian ${a.passedTrials}/2</span>
          </div>

          <div class="monster-stat-strip">
            <span>❤️ Loyalitas: <b>${prof.loyalty}</b>/100</span>
            <span>📈 Bakat/Belajar: <b>${prof.baseTalent}/${prof.learningRate}</b></span>
            <span>⚔️ Assist Dmg: <b>${prof.assistDamagePctPerStrike}%</b></span>
            <span>🏪 Siap Cabang: <b>${prof.canManageBranchShop ? "Ya ✓" : "Belum"}</b></span>
          </div>

          <div style="font-size:11px;color:#cbd5e1;line-height:1.4">
            <div>✨ <b>Aura Companion:</b> ${esc(prof.passiveAura?.label || "-")}</div>
            <div style="color:var(--muted);font-size:10.5px">🎯 Jurus AI: ${esc((prof.aiCombatSkills || []).join(", ") || "Pukulan Dasar")}</div>
          </div>

          <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:wrap;margin-top:4px">
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              ${a.isCompanion
                ? `<button class="btn btn-secondary btn-xs" disabled>✓ Mendampingi Bertarung</button>`
                : branchLoc
                  ? `<button class="btn btn-secondary btn-xs" data-shop-recall="${esc(a.seed)}">↩ Tarik dari Cabang</button>`
                  : `<button class="btn btn-primary btn-xs" data-shop-companion="${esc(a.seed)}">⚔️ Jadikan Companion</button>`}

              ${nextTrialReq !== null ? `
                <button class="btn ${canRunTrial ? "btn-primary" : "btn-secondary"} btn-xs" data-shop-trial="${esc(a.seed)}" ${canRunTrial ? "" : "disabled"}>
                  🎓 Ujian #${a.passedTrials + 1} (Butuh Skill ${nextTrialReq})
                </button>
              ` : `<span class="badge ok">🎓 Master Lulus Penuh</span>`}
            </div>
            <small style="font-size:10px;color:var(--muted);font-family:monospace">${esc(a.seed)}</small>
          </div>
        </div>
      `;
    }).join("");

    return `
      <div class="card teal" style="margin-bottom:10px">
        <div class="card-head">
          <div>
            <div class="card-title">👥 5 Murid Prosedural AI Seed (CD-6.02)</div>
            <div class="card-sub">
              Skill murid bertambah otomatis saat Anda menjalankan <b>Idle Smith</b> (+0.8/jam). CHA Leadership Anda memberikan <b>+${leadBonus}%</b> dukungan pembinaan &amp; loyalitas!
            </div>
          </div>
          <span class="badge ok">Aktif: ${list.length}/5 Murid</span>
        </div>
      </div>

      <div class="cards-grid">${cardsHtml}</div>
    `;
  }

  function renderBranchesTab(snap) {
    const branches = snap.branches || [];
    const curLoc = snap.location;
    const locs = snap.catalogs.locations || [];
    const apps = snap.apprenticeProfiles || [];

    const totalDailyBr = branches.reduce((acc, b) => acc + (b.dailyIncomeBr || 0), 0);
    const hourlyIdleBr = totalDailyBr * 6; // 1 jam Idle = 6 hari kalender dunia (4 jam = 24 hari = 1 hari real)
    const alreadyHasBranchHere = branches.some(b => b.locationId === curLoc?.location_id);

    const eligibleApps = apps.filter(a => a.profile.canManageBranchShop && !a.branchLocationId);
    if (!ui.selectedSeedForBranch || !eligibleApps.some(a => a.seed === ui.selectedSeedForBranch)) {
      ui.selectedSeedForBranch = eligibleApps[0]?.seed || "";
    }

    const branchRowsHtml = branches.map(b => {
      const bLoc = locs.find(l => l.location_id === b.locationId);
      const appObj = apps.find(a => a.seed === b.apprenticeSeed);
      return `
        <div class="settlement-row">
          <div style="min-width:0;flex:1">
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
              <strong style="font-size:12.5px;color:var(--amber-hi)">🏪 Cabang ${esc(bLoc?.location_name || b.locationId)}</strong>
              <span class="badge">Tier ${b.tier}</span>
              <span class="badge ok">+${B.formatCurrency(b.dailyIncomeBr)} / hari kalender</span>
            </div>
            <div style="font-size:10.5px;color:var(--muted);margin-top:2px">
              Kepala Cabang: <b>${esc(shortName(b.apprenticeSeed))}</b> (${esc(appObj?.profile?.smithClass || "-")}, Skill ${appObj?.skill || 0}) • Area: ${esc(bLoc?.area_name || "-")}
            </div>
          </div>
          <button class="btn btn-secondary btn-xs" data-shop-recall="${esc(b.apprenticeSeed)}">↩ Tarik Murid</button>
        </div>
      `;
    }).join("");

    const readinessHtml = apps.map(a => {
      const p = a.profile;
      const okSkill = p.effectiveSkill >= 60;
      const okLoy = p.loyalty >= 70;
      const okTrial = a.passedTrials >= 1;
      return `
        <div class="settlement-row">
          <div>
            <strong style="font-size:12px">${esc(shortName(a.seed))} (${esc(p.smithClass)})</strong>
            <div style="font-size:10.5px;color:var(--muted)">
              Skill ≥ 60: <b style="color:${okSkill ? "var(--teal-hi)" : "#fda4af"}">${p.effectiveSkill}</b> •
              Loyalitas ≥ 70: <b style="color:${okLoy ? "var(--teal-hi)" : "#fda4af"}">${p.loyalty}</b> •
              Ujian ≥ 1: <b style="color:${okTrial ? "var(--teal-hi)" : "#fda4af"}">${a.passedTrials}</b>
            </div>
          </div>
          ${a.branchLocationId
            ? `<span class="badge warm">Sedang Menjaga Cabang</span>`
            : p.canManageBranchShop
              ? `<span class="badge ok">✓ Memenuhi Syarat</span>`
              : `<span class="badge">Latih via Idle Smith</span>`}
        </div>
      `;
    }).join("");

    return `
      <div class="card warm" style="margin-bottom:10px">
        <div class="card-head">
          <div>
            <div class="card-title">🏪 Jaringan Cabang Bengkel (${branches.length} Kota Aktif)</div>
            <div class="card-sub">
              Cabang menghasilkan kas pasif otomatis setiap hari kalender dunia berjalan &amp; mengizinkan <b>Istirahat Gratis + Hapus Kutukan</b> di jaringan Anda!
            </div>
          </div>
          <div style="text-align:right">
            <div style="font-size:13px;font-weight:800;color:var(--teal-hi)">+${B.formatCurrency(totalDailyBr)} / hari WD</div>
            <div style="font-size:10px;color:var(--muted)">Setara +${B.formatCurrency(hourlyIdleBr)} per 1 jam Idle</div>
          </div>
        </div>
      </div>

      <div class="forge-two-col">
        <div class="card">
          <div class="card-head">
            <div>
              <div class="card-title">📍 Buka Cabang di Lokasi Saat Ini: ${esc(curLoc?.location_name || "-")}</div>
              <div class="card-sub">Tier ${esc(curLoc?.tier || 1)} (${esc(curLoc?.settlement_type || "-")}) — Pindah kota di tab <b>🗺️ Peta Dunia</b> untuk membuka cabang di kota lain.</div>
            </div>
          </div>

          ${alreadyHasBranchHere ? `
            <div class="badge ok" style="align-self:flex-start">✓ Kota ini sudah memiliki Cabang Bengkel aktif</div>
          ` : eligibleApps.length > 0 ? `
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
              <select id="sel-branch-apprentice" class="select-compact" style="flex:1;min-width:180px">
                ${eligibleApps.map(a => `<option value="${esc(a.seed)}" ${a.seed === ui.selectedSeedForBranch ? "selected" : ""}>${esc(shortName(a.seed))} — ${esc(a.profile.smithClass)} (Skill ${a.profile.effectiveSkill}, Loyal ${a.profile.loyalty})</option>`).join("")}
              </select>
              <button class="btn btn-primary btn-xs" id="btn-open-branch-here">🏪 Resmikan Cabang di ${esc(curLoc?.location_name)}</button>
            </div>
          ` : `
            <div style="font-size:11.5px;color:var(--muted);line-height:1.45">
              Belum ada murid bebas yang memenuhi 3 syarat Kepala Cabang (<b>Skill ≥ 60, Loyalitas ≥ 70, &amp; Lulus Ujian #1</b>). Latih murid melalui <b>Idle Smith</b> lalu jalankan Ujian di tab sebelah!
            </div>
          `}

          <div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border)">
            <div style="font-size:11.5px;font-weight:800;color:#e2e8f0;margin-bottom:6px">Daftar Cabang Beroperasi:</div>
            <div class="settlements-list">
              ${branchRowsHtml || `<div style="font-size:11px;color:var(--muted)">Belum ada cabang yang dibuka.</div>`}
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-head">
            <div>
              <div class="card-title">📋 Ceklis Kesiapan 5 Murid (Syarat Kepala Cabang)</div>
              <div class="card-sub">Wajib mencapai <b>Skill ≥ 60</b>, <b>Loyalitas ≥ 70</b>, dan minimal <b>1x Lulus Ujian</b>.</div>
            </div>
          </div>
          <div class="settlements-list">${readinessHtml}</div>
        </div>
      </div>
    `;
  }

  function render(container, snap, showToast = () => {}) {
    const subTabsHtml = `
      <div class="sub-tabs-grid sub-tabs-2">
        <button class="sub-tab-btn ${ui.subTab === "apprentices" ? "active" : ""}" data-shop-sub="apprentices">👥 5 Murid AI Seed &amp; Companion</button>
        <button class="sub-tab-btn ${ui.subTab === "branches" ? "active" : ""}" data-shop-sub="branches">🏪 Cabang Bengkel (${(snap.branches || []).length} Kota)</button>
      </div>
    `;

    const bodyHtml = ui.subTab === "apprentices"
      ? renderApprenticesTab(snap)
      : renderBranchesTab(snap);

    container.innerHTML = subTabsHtml + bodyHtml;

    container.querySelectorAll("[data-shop-sub]").forEach(btn => {
      btn.onclick = () => {
        ui.subTab = btn.getAttribute("data-shop-sub");
        render(container, Bridge.getSnapshot(), showToast);
      };
    });

    container.querySelectorAll("[data-shop-companion]").forEach(btn => {
      btn.onclick = () => {
        const seed = btn.getAttribute("data-shop-companion");
        const res = Bridge.setCompanionApprentice(seed);
        if (!res.ok) return showToast(`⚠ ${res.reason}`);
        showToast(`⚔️ ${shortName(seed)} (${res.profile.smithClass}) aktif sebagai Companion!`);
      };
    });

    container.querySelectorAll("[data-shop-trial]").forEach(btn => {
      btn.onclick = () => {
        const seed = btn.getAttribute("data-shop-trial");
        const res = Bridge.runApprenticeTrial(seed);
        if (!res.ok) return showToast(`⚠ ${res.reason}`);
        if (global.BSRPG_AUDIO) global.BSRPG_AUDIO.play("victory");
        showToast(`🎓 ${shortName(seed)} lulus Ujian Kenaikan #${res.apprentice.passedTrials}!`);
      };
    });

    container.querySelectorAll("[data-shop-recall]").forEach(btn => {
      btn.onclick = () => {
        const seed = btn.getAttribute("data-shop-recall");
        const res = Bridge.recallApprenticeFromBranch(seed);
        if (!res.ok) return showToast(`⚠ ${res.reason}`);
        if (global.BSRPG_AUDIO) global.BSRPG_AUDIO.play("ui_click");
        showToast(`↩ ${shortName(seed)} ditarik kembali ke Bengkel Utama.`);
      };
    });

    const selApp = container.querySelector("#sel-branch-apprentice");
    if (selApp) {
      selApp.onchange = e => { ui.selectedSeedForBranch = e.target.value; };
    }

    const btnOpenBranch = container.querySelector("#btn-open-branch-here");
    if (btnOpenBranch) {
      btnOpenBranch.onclick = () => {
        const res = Bridge.openBranchWithApprentice(ui.selectedSeedForBranch, snap.location?.location_id);
        if (!res.ok) return showToast(`⚠ ${res.reason}`);
        if (global.BSRPG_AUDIO) global.BSRPG_AUDIO.play("coin");
        showToast(`🏪 Cabang baru dibuka di ${snap.location?.location_name} (+${B.formatCurrency(res.branch.dailyIncomeBr)}/hari)!`);
      };
    }
  }

  global.BSRPG_SCREEN_SHOP = { render };
})(window);
