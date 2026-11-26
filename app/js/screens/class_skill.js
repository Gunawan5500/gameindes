/**
 * Battle-Smith RPG — Fase 2A (Diperbarui Poin 1, 2, 3): Layar Class, Skill (Lv.1–GM), 29 Destiny & 21 Perk
 * - Poin 1: Tab Skill & Bar menyembunyikan skill yang belum terbuka secara default (+ sakelar filter Intip) agar fokus 1 per 1
 * - Poin 2: Peta Urutan Evolusi Kelas ala SWTOR (T1→T5 Murni + 4 Cabang Dual-Class)
 * - Poin 3: Fokus Sub-Stat (+25%) dikhususkan hanya untuk keahlian Smith & Profesi (category === "profession")
 */
(function (global) {
  "use strict";

  const SMITH_CLASSES = ["Weaponsmith", "Armorer", "Rangesmith", "Runesmith", "Reforger"];
  const STATS = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];

  const SMITH_META = {
    Weaponsmith: {
      icon: "⚔️", aspect: "Bilah Senjata Dekat & Battle-Harness", compat: "Senjata Dekat STR/DEX/WIS/CHA",
      purePath: ["T1 Bladesmith", "T2 Edgewright", "T3 Warmonger", "T4 Vanquisher", "👑 T5 Archblade"],
      hybrids: ["+Armorer → Vanguard", "+Rangesmith → Skirmisher", "+Runesmith → Spellblade", "+Reforger → Hellforger"]
    },
    Armorer: {
      icon: "🛡️", aspect: "Pelat, Perisai & Sistem Armor Trigger", compat: "Senjata CON & Armor Berat/Perisai",
      purePath: ["T1 Platesmith", "T2 Shieldwright", "T3 Bulwark", "T4 Juggernaut", "👑 T5 Aegisborn"],
      hybrids: ["+Weaponsmith → Wardensmith", "+Rangesmith → Sentinel", "+Runesmith → Runeguard", "+Reforger → Ironclad"]
    },
    Rangesmith: {
      icon: "🏹", aspect: "Busur/Mekanik Jauh & Gear Dodge", compat: "Seluruh 16 Senjata Jauh",
      purePath: ["T1 Bowyer", "T2 Fletcher", "T3 Deadeye", "T4 Ballistary", "👑 T5 Horizoner"],
      hybrids: ["+Weaponsmith → Outrider", "+Armorer → Bastionbow", "+Runesmith → Arcarcher", "+Reforger → Artificer"]
    },
    Runesmith: {
      icon: "🔮", aspect: "Inti Elemen, 6 Fusi Hibrida & Rune", compat: "Senjata INT & Hasil Fusi Hibrida",
      purePath: ["T1 Runescribe", "T2 Glyphwright", "T3 Spellforger", "T4 Arcanist", "👑 T5 Runelord"],
      hybrids: ["+Weaponsmith → Hexblade", "+Armorer → Aegisrune", "+Rangesmith → Starweaver", "+Reforger → Chronosmith"]
    },
    Reforger: {
      icon: "⚙️", aspect: "Enhance +N, Transfer +N & Taktis", compat: "Senjata CHA/WIS & Barang ber-+N",
      purePath: ["T1 Tinkerer", "T2 Temperer", "T3 Transmuter", "T4 Alchemizer", "👑 T5 Sovereign"],
      hybrids: ["+Weaponsmith → Reaver", "+Armorer → Dreadnought", "+Rangesmith → Machinist", "+Runesmith → Synthesist"]
    }
  };

  const state = {
    subTab: "smith",          // "smith" | "skill" | "destiny" | "perk"
    roadmapPreviewClass: null,
    skillTree: "Weaponsmith", // "Weaponsmith".."Reforger" | "weapon"
    userPickedTree: false,
    showLockedSkills: false,  // Poin 1: Sembunyikan skill belum terbuka secara default!
    showBattleSubStats: false,
    destinyFilter: "unlocked",
    pendingDestinyId: null,
    focusStatTab: "STR",
    perkTierTab: 3
  };

  function renderClassScreen(container, snap, showToast) {
    const Bridge = global.BSRPG_BRIDGE;
    const p = snap.player;
    const build = snap.build;
    const smith = build.smith;
    if (!state.userPickedTree && state.skillTree !== "weapon" && (p.smithTiers[state.skillTree] || 0) === 0) {
      state.skillTree = smith.primaryType || "Weaponsmith";
    }
    if (!state.roadmapPreviewClass) {
      state.roadmapPreviewClass = smith.primaryType || "Weaponsmith";
    }

    const usedSmithPts = smith.totalPointsUsed;
    const maxSmithPts = p.unlockedGateTier;
    const uf = snap.unFuseQuote;
    const ufLabel = uf.isFree ? "Gratis (1x/Tier)" : Bridge.formatCurrency(uf.costBr);

    let subBody = "";

    // =========================================================================
    // SUB-TAB 1: TIPE SMITH + PETA URUTAN EVOLUSI ALA SWTOR (POIN 2)
    // =========================================================================
    if (state.subTab === "smith") {
      const wCompat = smith.checkWeaponCompatibility(snap.equipment.weapon, build.activeDestinyCard);
      const pvCls = state.roadmapPreviewClass;
      const pvMeta = SMITH_META[pvCls];
      const pvTreeSkills = (snap.skillData.smith_skill_trees[pvCls]?.tiers || [])
        .map(t => `T${t.tier}: ${t.active_skill.name}`)
        .join(" → ");

      subBody = `
        <div class="card warm" style="margin-bottom:8px">
          <div class="card-head">
            <div>
              <div class="card-title">🔨 Kelas Aktif: ${smith.singleWordClassName}</div>
              <div class="card-sub">Anggaran Poin Gate Tier ${p.unlockedGateTier}: <b>${usedSmithPts}/${maxSmithPts}</b> terpakai • Bonus Tempa: <b>+${smith.craftBonusPct}%</b></div>
            </div>
            <span class="badge ${uf.isFree ? "ok" : ""}">Un-fuse: ${ufLabel}</span>
          </div>
          <div style="font-size:11.5px;color:#cbd5e1">
            Senjata Aktif (<b>${snap.equipment.weapon.name}</b>):
            ${wCompat.isCompatible
              ? `<span style="color:var(--teal-hi);font-weight:700">✓ Cocok (${wCompat.matchedClass} +${wCompat.masteryBonusPct}% Mastery &amp; [W] Aktif)</span>`
              : `<span style="color:#fda4af;font-weight:700">⚠ Tidak Cocok (-25% &amp; [W] Terkunci)</span>`}
          </div>
        </div>

        <!-- Poin 2: Peta Urutan Evolusi Kelas ala SWTOR -->
        <div class="card teal" style="margin-bottom:9px">
          <div class="card-head">
            <div>
              <div class="card-title">🗺️ Peta Urutan Evolusi Kelas (Pratinjau ${pvMeta.icon} ${pvCls})</div>
              <div class="card-sub">Klik tombol Mazhab di kanan untuk melihat pohon masa depan sebelum menanam poin:</div>
            </div>
            <div style="display:flex;gap:4px;flex-wrap:wrap">
              ${SMITH_CLASSES.map(c => `
                <button class="pill-btn ${pvCls === c ? "active" : ""}" data-pv-roadmap="${c}">${SMITH_META[c].icon} ${c}</button>
              `).join("")}
            </div>
          </div>
          <div class="passive-box unlocked" style="line-height:1.5">
            <div>🌟 <b>Jalur Spesialis Murni (5 Poin):</b> <span style="color:var(--amber-hi);font-weight:700">${pvMeta.purePath.join(" → ")}</span></div>
            <div style="margin-top:3px">⚔️ <b>Urutan Jurus Terbuka:</b> ${pvTreeSkills}</div>
            <div style="margin-top:3px">🔀 <b>Cabang Hibrida (Dual-Class):</b> <span style="color:var(--teal-hi)">${pvMeta.hybrids.join(" • ")}</span> • Multi-Class: <b>Polymath / Omnismith</b></div>
          </div>
        </div>

        <div class="cards-grid">
          ${SMITH_CLASSES.map(cls => {
            const rank = p.smithTiers[cls] || 0;
            const meta = SMITH_META[cls];
            const resName = snap.skillData.smith_skill_trees[cls]?.resource?.name || "-";
            return `
              <div class="card ${rank > 0 ? "teal" : ""}">
                <div class="card-head">
                  <div>
                    <div class="card-title">${meta.icon} ${cls}</div>
                    <div class="card-sub">Resource: <b style="color:var(--teal-hi)">${resName}</b></div>
                  </div>
                  <span class="badge ${rank > 0 ? "ok" : ""}">Tier ${rank}/5</span>
                </div>
                <div style="font-size:11px;color:#cbd5e1">
                  <div>• <b>Komponen Tempa:</b> ${meta.aspect}</div>
                  <div>• <b>Naungan Pakai:</b> ${meta.compat}</div>
                </div>
                <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding-top:4px;border-top:1px solid #1f3042">
                  <div style="display:flex;align-items:center;gap:6px">
                    <button class="stepper-btn" data-smith-dec="${cls}" ${rank <= 0 || usedSmithPts <= 1 ? "disabled" : ""} title="Kurangi poin (Un-fuse)">−</button>
                    <strong style="font-family:monospace;font-size:13px;width:28px;text-align:center">T${rank}</strong>
                    <button class="stepper-btn" data-smith-inc="${cls}" ${usedSmithPts >= maxSmithPts || rank >= 5 ? "disabled" : ""} title="Tanam poin">+</button>
                  </div>
                  <button class="chip-btn" data-jump-tree="${cls}">Skill Terbuka →</button>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      `;
    }

    // =========================================================================
    // SUB-TAB 2: SKILL & BAR (POIN 1: SEMBUNYIKAN SKILL TERKUNCI SECARA DEFAULT)
    // =========================================================================
    if (state.subTab === "skill") {
      const equippedIds = new Set(build.equippedSkills.map(s => s.id));
      const activeSmithPills = state.showLockedSkills
        ? SMITH_CLASSES
        : SMITH_CLASSES.filter(c => (p.smithTiers[c] || 0) > 0);

      const pillsHtml = `
        <div class="filter-pills">
          <button class="pill-btn ${state.skillTree === "weapon" ? "active" : ""}" data-stree="weapon">🪓 [W] Jurus Senjata</button>
          ${activeSmithPills.map(cls => `
            <button class="pill-btn ${state.skillTree === cls ? "active" : ""}" data-stree="${cls}">
              ${SMITH_META[cls].icon} ${cls} (T${p.smithTiers[cls] || 0})
            </button>
          `).join("")}
        </div>
      `;

      const Assets = global.BSRPG_ASSETS;
      const getSkillIcon = (idOrName) =>
        Assets && typeof Assets.getCustomIcon === "function"
          ? Assets.getCustomIcon("skills", idOrName)
          : "";

      let treeContentHtml = "";
      if (state.skillTree === "weapon") {
        const ws = build.weaponSkill;
        const m = ws?.mastery || Bridge.getSkillMasteryStage(0);
        const wPct = ws ? Math.round((ws.effectiveMultiplier - 1) * 100) : 0;
        const wIcon = ws ? getSkillIcon(ws.id || ws.name) : "";
        treeContentHtml = ws ? `
          <div class="skill-tier-card">
            <div class="card-head">
              <div style="display:flex;align-items:center;gap:9px;min-width:0">
                ${wIcon ? `<img src="${wIcon}" alt="${ws.name}" class="custom-skill-icon" />` : ""}
                <div style="min-width:0">
                  <div class="card-title">🪓 [W] ${ws.name} <span class="badge">${ws.weapon_name || snap.equipment.weapon.name}</span></div>
                  <div class="card-sub">Naungan: <b>${ws.governing_smith}</b> • Jarak: <b>${ws.tag}</b> • Cooldown: ${ws.effectiveCooldownSec}d</div>
                </div>
              </div>
              <span class="badge ${ws.unlocked ? "ok" : "pending"}">${ws.unlocked ? `+${Math.max(15, wPct)}% Trigger` : "🔒 Butuh " + ws.governing_smith + " T1"}</span>
            </div>
            <div style="font-size:11.5px;color:#e2e8f0">${ws.desc}</div>
            <div>
              <div style="display:flex;justify-content:space-between;font-size:10.5px;color:var(--muted);margin-bottom:3px">
                <span>RF Mastery: <b style="color:var(--amber-hi)">${m.label}</b> (+${m.effectivenessBonusPct}% efek, -${m.cdrPct}% CD)</span>
                <span>XP: ${m.xp}${m.nextLevelXpReq ? ` / ${m.nextLevelXpReq}` : " (MAX GM)"}</span>
              </div>
              <div class="bar-track"><div class="bar-fill xpb" style="width:${m.progressToNextPct}%"></div></div>
            </div>
          </div>
        ` : `<div class="card">Tidak ada senjata terpasang.</div>`;
      } else {
        const cls = state.skillTree;
        const classRank = p.smithTiers[cls] || 0;
        const isPure5 = smith.isSpecialistSmith && smith.primaryType === cls;
        const tree = snap.skillData.smith_skill_trees[cls];

        const visibleTiers = tree.tiers.filter(t => {
          const unlocked = t.tier <= classRank && (!t.pure_only || isPure5);
          return state.showLockedSkills || unlocked;
        });

        if (!visibleTiers.length) {
          treeContentHtml = `
            <div class="card">
              <div class="card-title">Belum Ada Skill Terbuka di Mazhab ${cls}</div>
              <div class="card-sub">Tanam minimal 1 poin ke ${cls} di tab <b>🔨 Tipe Smith</b>, atau aktifkan tombol <b>👁️ Intip Skill Terkunci</b> di kanan atas untuk melihat pratinjau.</div>
            </div>
          `;
        } else {
          treeContentHtml = visibleTiers.map(t => {
            const sk = t.active_skill;
            const unlocked = t.tier <= classRank && (!t.pure_only || isPure5);
            const xp = p.skillMasteryState[sk.id] || 0;
            const mastery = Bridge.getSkillMasteryStage(xp);
            const isEq = equippedIds.has(sk.id);
            const tierKey = `${cls}_T${t.tier}`;
            const pickedMorphId = p.selectedUtilities[tierKey] || t.morph_choices[0]?.id;
            const pctBonus = Math.max(10, Math.round((sk.base_multiplier - 1) * 100 + mastery.effectivenessBonusPct));
            const skIcon = getSkillIcon(sk.id || sk.name);

            // Poin 1: Sembunyikan 3 kotak Morph sampai Lv.5 kecuali mode Intip aktif!
            const showMorphBoxes = (mastery.morphUnlocked && unlocked) || state.showLockedSkills;

            return `
              <div class="skill-tier-card ${unlocked ? "" : "locked"}">
                <div class="card-head">
                  <div style="display:flex;align-items:center;gap:9px;min-width:0">
                    ${skIcon ? `<img src="${skIcon}" alt="${sk.name}" class="custom-skill-icon ${unlocked ? "" : "locked-sil"}" />` : ""}
                    <div style="min-width:0">
                      <div class="card-title">
                        <span class="badge">T${t.tier} ${t.rank_label}</span> ${sk.name}
                        ${t.pure_only ? `<span class="badge pending">Khusus Murni 5 Poin</span>` : ""}
                      </div>
                      <div class="card-sub">${sk.role} • Elemen: ${sk.element || "Neutral"} • Efek Aktif: <b style="color:var(--sky)">+${pctBonus}%</b></div>
                    </div>
                  </div>
                  ${unlocked
                    ? `<button class="btn ${isEq ? "btn-primary" : "btn-secondary"} btn-xs" data-equip-sk="${sk.id}">
                        ${isEq ? "✓ Di Skill Bar" : "+ Pasang Bar"}
                      </button>`
                    : `<span class="badge">🔒 Butuh ${cls} T${t.tier}</span>`}
                </div>

                <div style="font-size:11.5px;color:#e2e8f0">${sk.desc}</div>

                <div>
                  <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--muted);margin-bottom:3px">
                    <span>Latihan RF: <b style="color:var(--amber-hi)">${mastery.label}</b> (+${mastery.effectivenessBonusPct}% efek${mastery.isGM ? " • GM PEAK!" : ""})</span>
                    <span>XP: ${mastery.xp}${mastery.nextLevelXpReq ? ` / ${mastery.nextLevelXpReq}` : " (GM)"}</span>
                  </div>
                  <div class="bar-track"><div class="bar-fill xps" style="width:${mastery.progressToNextPct}%"></div></div>
                </div>

                ${(mastery.corePassiveUnlocked && unlocked) || state.showLockedSkills ? `
                  <div class="passive-box ${mastery.corePassiveUnlocked && unlocked ? "unlocked" : ""}">
                    <b>${mastery.corePassiveUnlocked && unlocked ? "✓" : "🔒"} Core Passive (Skill Lv.3) — ${t.core_passive.name}:</b> ${t.core_passive.desc}
                  </div>
                ` : `
                  <div style="font-size:10.5px;color:var(--muted)">
                    🔒 <b>Tahap Berikutnya:</b> Capai <b>Skill Lv.3</b> untuk membuka Pasif Inti (<i>${t.core_passive.name}</i>), dan <b>Lv.5</b> untuk memilih 1 dari 3 Cabang Morph.
                  </div>
                `}

                ${showMorphBoxes ? `
                  <div style="font-size:10.5px;color:var(--muted)">
                    ${mastery.morphUnlocked && unlocked ? "✦ Pilih 1 Cabang Morph Aktif:" : "🔒 Pratinjau 3 Cabang Morph (Terbuka di Skill Lv.5):"}
                  </div>
                  <div class="morph-row">
                    ${t.morph_choices.map(m => {
                      const isPicked = mastery.morphUnlocked && unlocked && pickedMorphId === m.id;
                      return `
                        <button class="morph-choice-btn ${isPicked ? "picked" : ""}"
                          data-pick-morph="${tierKey}|${sk.id}|${m.id}"
                          ${!(mastery.morphUnlocked && unlocked) ? "disabled" : ""}>
                          <strong style="color:${isPicked ? "var(--amber-hi)" : "#e2e8f0"}">${m.name}</strong>
                          <span style="color:var(--teal-hi);font-size:9.5px">${m.branch}</span>
                          <span style="color:var(--muted)">${m.desc}</span>
                        </button>
                      `;
                    }).join("")}
                  </div>
                ` : ""}
              </div>
            `;
          }).join("");
        }
      }

      subBody = `
        <div class="card" style="margin-bottom:8px">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">
            <span style="font-size:12px"><b>Skill Bar Opsi A:</b> ${build.equippedSkills.length}/${build.maxSlots} Slot Class + 1 Slot [W] (Hanya menampilkan skill yang sudah dimiliki agar fokus).</span>
            <button class="chip-btn ${state.showLockedSkills ? "teal" : ""}" id="btn-toggle-locked-sk">
              ${state.showLockedSkills ? "👁️ Sembunyikan yang Terkunci" : "👁️ Intip Skill & Morph Terkunci"}
            </button>
          </div>
        </div>
        ${pillsHtml}
        ${treeContentHtml}
      `;
    }

    // =========================================================================
    // SUB-TAB 3: 29 KARTU DESTINY (Kingdoms of Amalur × Jalur Ganda CD-3.02b)
    // =========================================================================
    if (state.subTab === "destiny") {
      const act = build.activeDestinyCard;
      const unlockedSet = new Set(build.unlockedDestinyCards.map(c => c.id));
      const allCards = Object.values(snap.skillData.destiny_cards || {});
      const filtered = allCards.filter(c => {
        if (state.destinyFilter === "unlocked") return unlockedSet.has(c.id);
        return c.category === state.destinyFilter;
      });

      const goldCostPreview = 500 * p.level * p.unlockedGateTier;

      const switchPanelHtml = state.pendingDestinyId ? (() => {
        const target = build.unlockedDestinyCards.find(c => c.id === state.pendingDestinyId);
        if (!target) return "";
        return `
          <div class="card warm" style="margin-bottom:8px">
            <div class="card-head">
              <div>
                <div class="card-title">🔄 Konfirmasi Ganti Destiny → ${target.displayName}</div>
                <div class="card-sub">Aturan LOCKED CD-3.02b: Pilih Jalur Misi (Trial Guild) ATAU Jalur Bayar Instan.</div>
              </div>
              <button class="chip-btn" id="btn-cancel-destiny">Batal</button>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <button class="btn btn-primary" id="btn-destiny-trial" ${!p.destinyTrialReady ? "disabled" : ""}>
                🏛️ Jalur Misi Trial (Gratis — ${p.destinyTrialReady ? "Siap!" : "Jalankan 1x Idle Battle dulu"})
              </button>
              <button class="btn btn-secondary" id="btn-destiny-gold">
                💰 Bayar Instan (${Bridge.formatCurrency(goldCostPreview)})
              </button>
            </div>
          </div>
        `;
      })() : "";

      subBody = `
        <div class="destiny-hero-banner">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;flex-wrap:wrap">
            <div>
              <div style="font-size:10px;color:var(--teal-hi);font-weight:800;text-transform:uppercase">Kartu Destiny Aktif</div>
              <div style="font-size:16px;font-weight:800;color:var(--amber-hi)">🃏 ${act ? act.displayName : "-"}</div>
              <div style="font-size:11.5px;color:#e2e8f0;margin-top:3px">
                <b>${act?.signature?.name || "Signature"}:</b> ${act?.signature?.desc || "-"}
              </div>
            </div>
            <span class="badge ${p.destinyTrialReady ? "ok" : ""}">
              Trial Guild: ${p.destinyTrialReady ? "✓ Siap Dipakai" : "Belum (1x Idle Battle)"}
            </span>
          </div>
        </div>

        ${switchPanelHtml}

        <div class="filter-pills">
          <button class="pill-btn ${state.destinyFilter === "unlocked" ? "active" : ""}" data-dfilter="unlocked">✦ Terbuka (${build.unlockedDestinyCards.length})</button>
          <button class="pill-btn ${state.destinyFilter === "pure" ? "active" : ""}" data-dfilter="pure">Murni 1 Class (5)</button>
          <button class="pill-btn ${state.destinyFilter === "dual" ? "active" : ""}" data-dfilter="dual">Dual Berarah (20)</button>
          <button class="pill-btn ${state.destinyFilter === "multi" ? "active" : ""}" data-dfilter="multi">Multi-Class (4)</button>
        </div>

        <div class="destiny-cards-grid">
          ${filtered.map(c => {
            const live = build.unlockedDestinyCards.find(u => u.id === c.id);
            const isUnlocked = Boolean(live);
            const isActive = act && act.id === c.id;
            const title = live ? live.displayName : (c.name || c.names_by_tier[0]);
            const reqLabel = c.category === "pure"
              ? `${c.smith_class} T1–T5`
              : c.category === "dual"
                ? `${c.primary} ≥ ${c.secondary}`
                : `Min ${c.min_classes} Class`;
            return `
              <div class="destiny-item ${isActive ? "active" : isUnlocked ? "unlocked" : "locked"}">
                <div>
                  <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:4px">
                    <strong style="font-size:12.5px;color:${isActive ? "var(--amber-hi)" : isUnlocked ? "var(--teal-hi)" : "var(--muted)"}">${title}</strong>
                    <span class="badge">${reqLabel}</span>
                  </div>
                  <div style="font-size:11px;color:#cbd5e1;margin-top:5px">
                    <b>${c.signature.name}:</b> ${c.signature.desc}
                  </div>
                </div>
                <div>
                  ${isActive
                    ? `<button class="btn btn-secondary" disabled style="width:100%">★ Kartu Aktif</button>`
                    : isUnlocked
                      ? `<button class="btn btn-primary" data-req-destiny="${c.id}" style="width:100%">🔄 Pilih Kartu Ini</button>`
                      : `<div style="font-size:10px;color:var(--muted)">🔒 Penuhi syarat poin di sub-tab Tipe Smith</div>`}
                </div>
              </div>
            `;
          }).join("")}
        </div>
      `;
    }

    // =========================================================================
    // SUB-TAB 4: STAT, FOKUS KHUSUS PROFESI (POIN 3) & 21 PERK SMITH
    // =========================================================================
    if (state.subTab === "perk") {
      const fStat = state.focusStatTab;
      const allSubs = build.subStats.byStat[fStat] || [];
      const profSubs = allSubs.filter(s => s.category === "profession");
      const battleSubs = allSubs.filter(s => s.category === "battle");
      const subDefsById = {};
      for (const d of (snap.skillData.sub_stats?.[fStat] || [])) subDefsById[d.id] = d;

      const perksCat = Bridge.getPerksCatalog(smith.primaryType);
      const eligT3 = new Set(smith.eligibleSingleStatPerks);
      const eligT5 = new Set(smith.eligibleHybridPairPerks);
      const perkList = state.perkTierTab === 3 ? perksCat.perksT3 : perksCat.perksT5;

      subBody = `
        <div class="create-two-col">
          <!-- Kiri: Alokasi Stat Naik Level + Fokus Sub-Stat Khusus Smith & Profesi -->
          <div class="card">
            <div class="card-head">
              <div>
                <div class="card-title">📊 Stat &amp; Fokus Keahlian Profesi (+25%)</div>
                <div class="card-sub">Title: <b style="color:var(--amber-hi)">${build.title.type}</b> • Cap Tier ${p.unlockedGateTier}: <b>${snap.statCap}</b></div>
              </div>
              <span class="badge ${p.unspentStatPoints > 0 ? "ok" : ""}">Sisa: ${p.unspentStatPoints} poin</span>
            </div>

            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:5px">
              ${STATS.map(s => `
                <div class="stat-alloc-row" style="padding:5px 7px">
                  <strong style="color:var(--sky);font-size:11.5px">${s} ${p.stats[s]}</strong>
                  <button class="stepper-btn" style="width:24px;height:22px" data-spend-stat="${s}" ${p.unspentStatPoints <= 0 || p.stats[s] >= snap.statCap ? "disabled" : ""}>+</button>
                </div>
              `).join("")}
            </div>

            <div style="border-top:1px solid #1f3042;padding-top:8px">
              <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted);margin-bottom:5px;flex-wrap:wrap;gap:4px">
                <span>Pilih 2 Fokus <b>Smith &amp; Profesi</b> (${fStat}):</span>
                <span>Un-fuse: <b>${ufLabel}</b></span>
              </div>
              <div class="filter-pills" style="margin-bottom:6px">
                ${STATS.map(s => `<button class="pill-btn ${fStat === s ? "active" : ""}" data-fstat-tab="${s}">${s}</button>`).join("")}
              </div>
              <div style="display:flex;flex-direction:column;gap:5px">
                ${profSubs.map(sub => `
                  <button class="choice-card ${sub.isFocused ? "selected" : ""}" data-toggle-focus="${sub.id}" style="padding:7px 9px">
                    <div style="display:flex;justify-content:space-between;align-items:center;width:100%">
                      <strong style="font-size:11.5px;color:${sub.isFocused ? "var(--amber-hi)" : "#fff"}">${sub.isFocused ? "★ " : ""}${sub.name}</strong>
                      <b style="font-family:monospace;font-size:11.5px;color:var(--sky)">+${sub.value}%</b>
                    </div>
                    <span style="font-size:10px;color:var(--muted)">${subDefsById[sub.id]?.desc || ""}</span>
                  </button>
                `).join("")}
              </div>

              <div style="margin-top:7px">
                <button class="chip-btn" id="btn-peek-battle-subs" style="font-size:10px">
                  ${state.showBattleSubStats ? "▾ Sembunyikan 6 Sub-Stat Battle Otomatis" : `▸ Lihat 6 Sub-Stat Battle Otomatis (${fStat})`}
                </button>
                ${state.showBattleSubStats ? `
                  <div class="passive-box" style="margin-top:5px;display:flex;flex-direction:column;gap:3px">
                    ${battleSubs.map(bs => `<div style="display:flex;justify-content:space-between"><span>${bs.name}</span><b style="color:var(--sky)">${bs.value}</b></div>`).join("")}
                  </div>
                ` : ""}
              </div>
            </div>
          </div>

          <!-- Kanan: 21 Perk Smith (6 Tingkat 3 & 15 Tingkat 5, CD-3.03) -->
          <div class="card warm">
            <div class="card-head">
              <div>
                <div class="card-title">🏅 21 Perk Smith (Tempa + Tempur)</div>
                <div class="card-sub">Afinitas ${smith.primaryType} (${smith.classAffinityStats.join("/")}) memberi <b>+25% bonus</b>!</div>
              </div>
            </div>

            <div class="filter-pills" style="margin-bottom:4px">
              <button class="pill-btn ${state.perkTierTab === 3 ? "active" : ""}" data-ptier="3">Tingkat 3 (6 Perk • Stat ≥ 45)</button>
              <button class="pill-btn ${state.perkTierTab === 5 ? "active" : ""}" data-ptier="5">Tingkat 5 (15 Hibrida • Stat ≥ 75)</button>
            </div>

            <div style="display:flex;flex-direction:column;gap:6px;max-height:330px;overflow-y:auto" class="thin-scroll">
              ${perkList.map(pk => {
                const key = state.perkTierTab === 3 ? pk.stat : pk.pair;
                const eligible = state.perkTierTab === 3 ? eligT3.has(key) : eligT5.has(key);
                const active = state.perkTierTab === 3
                  ? smith.activePerkT3?.id === pk.id
                  : smith.activePerkT5?.id === pk.id;
                return `
                  <div class="choice-card ${active ? "selected" : ""}" style="opacity:${eligible ? "1" : "0.6"}">
                    <div style="display:flex;justify-content:space-between;align-items:center;gap:4px;flex-wrap:wrap">
                      <strong style="font-size:12px;color:${active ? "var(--amber-hi)" : "#fff"}">${pk.name} (${key})</strong>
                      <div style="display:flex;gap:4px">
                        ${pk.hasAffinity ? `<span class="badge ok">Afinitas +25%</span>` : ""}
                        ${active ? `<span class="badge ok">★ Aktif</span>` : ""}
                      </div>
                    </div>
                    <div style="font-size:10.5px;color:#cbd5e1">${pk.desc}</div>
                    ${eligible && !active
                      ? `<button class="btn btn-secondary" data-pick-perk="${state.perkTierTab}|${key}" style="margin-top:3px;padding:4px 8px">Pilih Perk Ini</button>`
                      : !eligible
                        ? `<span style="font-size:10px;color:var(--muted)">🔒 Syarat: ${state.perkTierTab === 3 ? `Smith T3+ & ${key} ≥ 45` : `Murni 5 Poin & ${key} ≥ 75`}</span>`
                        : ""}
                  </div>
                `;
              }).join("")}
            </div>
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="sub-tabs-grid">
        <button class="sub-tab-btn ${state.subTab === "smith" ? "active" : ""}" data-csub="smith">🔨 Tipe Smith</button>
        <button class="sub-tab-btn ${state.subTab === "skill" ? "active" : ""}" data-csub="skill">⚔️ Skill &amp; Bar</button>
        <button class="sub-tab-btn ${state.subTab === "destiny" ? "active" : ""}" data-csub="destiny">🃏 Destiny (${build.unlockedDestinyCards.length})</button>
        <button class="sub-tab-btn ${state.subTab === "perk" ? "active" : ""}" data-csub="perk">🏅 Stat &amp; Perk</button>
      </div>
      ${subBody}
    `;

    // Bindings Sub-Tab Utama
    container.querySelectorAll("[data-csub]").forEach(b => {
      b.onclick = () => {
        state.subTab = b.getAttribute("data-csub");
        state.pendingDestinyId = null;
        renderClassScreen(container, Bridge.getSnapshot(), showToast);
      };
    });

    // Sub-tab 1: Tipe Smith + SWTOR Roadmap
    container.querySelectorAll("[data-pv-roadmap]").forEach(b => {
      b.onclick = () => {
        state.roadmapPreviewClass = b.getAttribute("data-pv-roadmap");
        renderClassScreen(container, Bridge.getSnapshot(), showToast);
      };
    });
    container.querySelectorAll("[data-smith-inc]").forEach(b => {
      b.onclick = () => {
        const r = Bridge.adjustSmithTier(b.getAttribute("data-smith-inc"), 1);
        showToast(r.ok ? `✓ ${r.msg}` : `⚠ ${r.reason}`);
      };
    });
    container.querySelectorAll("[data-smith-dec]").forEach(b => {
      b.onclick = () => {
        const r = Bridge.adjustSmithTier(b.getAttribute("data-smith-dec"), -1);
        showToast(r.ok ? `✓ ${r.msg}` : `⚠ ${r.reason}`);
      };
    });
    container.querySelectorAll("[data-jump-tree]").forEach(b => {
      b.onclick = () => {
        state.subTab = "skill";
        state.skillTree = b.getAttribute("data-jump-tree");
        state.userPickedTree = true;
        renderClassScreen(container, Bridge.getSnapshot(), showToast);
      };
    });

    // Sub-tab 2: Pohon Skill + Toggle Intip Terkunci
    const btnToggleLocked = container.querySelector("#btn-toggle-locked-sk");
    if (btnToggleLocked) {
      btnToggleLocked.onclick = () => {
        state.showLockedSkills = !state.showLockedSkills;
        if (!state.showLockedSkills && state.skillTree !== "weapon" && (p.smithTiers[state.skillTree] || 0) === 0) {
          state.skillTree = smith.primaryType || "Weaponsmith";
        }
        renderClassScreen(container, Bridge.getSnapshot(), showToast);
      };
    }

    container.querySelectorAll("[data-stree]").forEach(b => {
      b.onclick = () => {
        state.skillTree = b.getAttribute("data-stree");
        state.userPickedTree = true;
        renderClassScreen(container, Bridge.getSnapshot(), showToast);
      };
    });
    container.querySelectorAll("[data-equip-sk]").forEach(b => {
      b.onclick = () => {
        const r = Bridge.toggleEquipSkill(b.getAttribute("data-equip-sk"));
        showToast(r.ok ? (r.equipped ? "✓ Skill dipasang ke Skill Bar!" : "↺ Skill dilepas dari Skill Bar.") : `⚠ ${r.reason}`);
      };
    });
    container.querySelectorAll("[data-pick-morph]").forEach(b => {
      b.onclick = () => {
        const [tierKey, skillId, morphId] = b.getAttribute("data-pick-morph").split("|");
        const r = Bridge.selectSkillMorph(tierKey, skillId, morphId);
        showToast(r.ok ? "✦ Morph aktif diperbarui!" : `⚠ ${r.reason}`);
      };
    });

    // Sub-tab 3: Destiny
    container.querySelectorAll("[data-dfilter]").forEach(b => {
      b.onclick = () => {
        state.destinyFilter = b.getAttribute("data-dfilter");
        renderClassScreen(container, Bridge.getSnapshot(), showToast);
      };
    });
    container.querySelectorAll("[data-req-destiny]").forEach(b => {
      b.onclick = () => {
        state.pendingDestinyId = b.getAttribute("data-req-destiny");
        renderClassScreen(container, Bridge.getSnapshot(), showToast);
      };
    });
    const cancelD = container.querySelector("#btn-cancel-destiny");
    if (cancelD) cancelD.onclick = () => { state.pendingDestinyId = null; renderClassScreen(container, Bridge.getSnapshot(), showToast); };

    const trialD = container.querySelector("#btn-destiny-trial");
    if (trialD) trialD.onclick = () => {
      const r = Bridge.switchDestinyCard({ targetCardId: state.pendingDestinyId, method: "trial" });
      if (r.ok) state.pendingDestinyId = null;
      showToast(r.ok ? `🏛️ Kartu Destiny aktif: ${r.check.newActiveDestinyName}!` : `⚠ ${r.reason}`);
    };
    const goldD = container.querySelector("#btn-destiny-gold");
    if (goldD) goldD.onclick = () => {
      const r = Bridge.switchDestinyCard({ targetCardId: state.pendingDestinyId, method: "gold" });
      if (r.ok) state.pendingDestinyId = null;
      showToast(r.ok ? `💰 Kartu Destiny aktif: ${r.check.newActiveDestinyName}!` : `⚠ ${r.reason}`);
    };

    // Sub-tab 4: Stat, Fokus Profesi & Perk
    container.querySelectorAll("[data-spend-stat]").forEach(b => {
      b.onclick = () => {
        const s = b.getAttribute("data-spend-stat");
        const r = Bridge.spendStatPoint(s);
        showToast(r.ok ? `⬆ +1 ${s}` : `⚠ ${r.reason}`);
      };
    });
    container.querySelectorAll("[data-fstat-tab]").forEach(b => {
      b.onclick = () => {
        state.focusStatTab = b.getAttribute("data-fstat-tab");
        renderClassScreen(container, Bridge.getSnapshot(), showToast);
      };
    });
    container.querySelectorAll("[data-toggle-focus]").forEach(b => {
      b.onclick = () => {
        const r = Bridge.toggleFocusSubStat(state.focusStatTab, b.getAttribute("data-toggle-focus"));
        showToast(r.ok ? `★ Fokus Profesi ${state.focusStatTab} diperbarui!` : `⚠ ${r.reason}`);
      };
    });
    const btnPeekBtl = container.querySelector("#btn-peek-battle-subs");
    if (btnPeekBtl) {
      btnPeekBtl.onclick = () => {
        state.showBattleSubStats = !state.showBattleSubStats;
        renderClassScreen(container, Bridge.getSnapshot(), showToast);
      };
    }
    container.querySelectorAll("[data-ptier]").forEach(b => {
      b.onclick = () => {
        state.perkTierTab = Number(b.getAttribute("data-ptier"));
        renderClassScreen(container, Bridge.getSnapshot(), showToast);
      };
    });
    container.querySelectorAll("[data-pick-perk]").forEach(b => {
      b.onclick = () => {
        const [tierLv, key] = b.getAttribute("data-pick-perk").split("|");
        const r = Bridge.selectSmithPerk(Number(tierLv), key);
        showToast(r.ok ? `🏅 Perk Tingkat ${tierLv} (${key}) diaktifkan!` : `⚠ ${r.reason}`);
      };
    });
  }

  function openStatTab() {
    state.subTab = "perk";
  }

  global.BSRPG_SCREEN_CLASS = { render: renderClassScreen, openStatTab };
})(window);
