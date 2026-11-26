/**
 * Battle-Smith RPG — Fase 2A: Window Awal (Title Screen) & Wizard Pembuatan Karakter
 * Dipanggil SEBELUM masuk ke gameplay utama (bukan tab di dalam gameplay).
 * Mematuhi penuh aturan LOCKED: CD-1.01 (13 poin), CD-1.02b (12 Fokus), CD-1.03 (6 Latar Belakang), CD-3.01 (1 Tipe Smith T1), WD-4.07 (Tidewrack Village).
 */
(function (global) {
  "use strict";

  const STATS = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
  const SMITH_DESC = {
    Weaponsmith: { icon: "⚔️", title: "Bladesmith", role: "Senjata Dekat, Bleed & Armor Crush (Resource: Forge Heat)" },
    Armorer:     { icon: "🛡️", title: "Platesmith", role: "Pertahanan CON, Perisai & Armor Trigger (Resource: Bastion Guard)" },
    Rangesmith:  { icon: "🏹", title: "Bowyer",     role: "Senjata Jauh, Dodge & Akurasi Tinggi (Resource: Hunter's Mark)" },
    Runesmith:   { icon: "🔮", title: "Runescribe", role: "Inti Elemen, 6 Fusi Hibrida & Weakness (Resource: Elemental Charge)" },
    Reforger:    { icon: "⚙️", title: "Tinkerer",   role: "Enhance +N, Cooldown & Sinergi Murid (Resource: Overclock)" }
  };

  const DEFAULT_FOCUS = {
    STR: ["str_hammer_strike", "str_enhance_power"],
    DEX: ["dex_forge_speed", "dex_mechanism_craft"],
    CON: ["con_material_conservation", "con_quench_stability"],
    INT: ["int_smith_tools", "int_attunement_craft"],
    WIS: ["wis_rare_drop", "wis_material_purity"],
    CHA: ["cha_trade_bargaining", "cha_apprentice_lead"]
  };

  const SWTOR_ROADMAP = {
    Weaponsmith: {
      pure: ["Bladesmith", "Edgewright", "Warmonger", "Vanquisher", "Archblade"],
      hybrids: ["+Armorer → Vanguard", "+Rangesmith → Skirmisher", "+Runesmith → Spellblade", "+Reforger → Hellforger"]
    },
    Armorer: {
      pure: ["Platesmith", "Shieldwright", "Bulwark", "Juggernaut", "Aegisborn"],
      hybrids: ["+Weaponsmith → Wardensmith", "+Rangesmith → Sentinel", "+Runesmith → Runeguard", "+Reforger → Ironclad"]
    },
    Rangesmith: {
      pure: ["Bowyer", "Fletcher", "Deadeye", "Ballistary", "Horizoner"],
      hybrids: ["+Weaponsmith → Outrider", "+Armorer → Bastionbow", "+Runesmith → Arcarcher", "+Reforger → Artificer"]
    },
    Runesmith: {
      pure: ["Runescribe", "Glyphwright", "Spellforger", "Arcanist", "Runelord"],
      hybrids: ["+Weaponsmith → Hexblade", "+Armorer → Aegisrune", "+Rangesmith → Starweaver", "+Reforger → Chronosmith"]
    },
    Reforger: {
      pure: ["Tinkerer", "Temperer", "Transmuter", "Alchemizer", "Sovereign"],
      hybrids: ["+Weaponsmith → Reaver", "+Armorer → Dreadnought", "+Rangesmith → Machinist", "+Runesmith → Synthesist"]
    }
  };

  const draft = {
    mode: "title", // "title" | "wizard"
    step: 1,       // 1 = Identitas & Latar Belakang | 2 = Stat & Tipe Smith | 3 = 12 Sub-Stat Fokus
    name: "Alden",
    background: "Pandai Besi",
    bgStatsPicked: ["STR", "CON"], // 2 dari 3 stat pilihan latar belakang (+1 masing-masing)
    freePts: { STR: 2, DEX: 1, CON: 1, INT: 1, WIS: 0, CHA: 0 }, // total +5 poin bebas
    startingSmithClass: "Weaponsmith",
    focusSubStats: JSON.parse(JSON.stringify(DEFAULT_FOCUS)),
    activeFocusStatTab: "STR"
  };

  function computeDraftStats() {
    const out = { STR: 1, DEX: 1, CON: 1, INT: 1, WIS: 1, CHA: 1 };
    for (const s of draft.bgStatsPicked) {
      if (out[s] !== undefined) out[s] += 1;
    }
    for (const s of STATS) {
      out[s] += draft.freePts[s] || 0;
    }
    return out;
  }

  function getFreePointsRemaining() {
    const spent = STATS.reduce((acc, s) => acc + (draft.freePts[s] || 0), 0);
    return 5 - spent;
  }

  function renderStartWindow(container, snap, callbacks) {
    const Bridge = global.BSRPG_BRIDGE;
    const isPortrait = document.body.classList.contains("mode-portrait");

    // Jika belum pernah buat karakter sama sekali dan mode masih 'title', tetap tampilkan menu awal yang jelas
    if (draft.mode === "title") {
      const p = snap.player;
      const Assets = global.BSRPG_ASSETS;
      const continueImg = Assets ? Assets.get("ui_gothic_continue_button_with_crimson_ornaments") : "";
      const playImg = Assets ? Assets.get("ui_gothic_bloodsteel_play_button") : "";

      const continueBtnHtml = continueImg
        ? `<button id="btn-continue-game" class="bloodsteel-img-btn" title="Lanjutkan Permainan"><img src="${continueImg}" alt="Continue" /></button>`
        : `<button id="btn-continue-game" class="btn btn-primary" style="width:100%;padding:9px">▶️ Masuk ke Permainan</button>`;

      const playBtnHtml = playImg
        ? `<button id="btn-open-wizard" class="bloodsteel-img-btn" title="Buat Karakter Baru"><img src="${playImg}" alt="Play" /></button>`
        : `<button id="btn-open-wizard" class="btn btn-primary" style="flex:1;padding:9px">✨ Buat Karakter Baru</button>`;

      const savedCardHtml = snap.hasSavedGame
        ? `
          <div class="card warm">
            <div class="card-head">
              <div>
                <div class="card-title">▶️ Lanjutkan Save Aktif — ${p.name}</div>
                <div class="card-sub">${p.background} • <b>${snap.build.smith.singleWordClassName}</b> Lv.${p.level} (Tier ${p.unlockedGateTier})</div>
              </div>
              <span class="badge ok">${(snap.saveBytes / 1024).toFixed(1)} KB</span>
            </div>
            <div style="font-size:11.5px;color:#cbd5e1">
              Lokasi: <b>${snap.location?.location_name || "Tidewrack Village"}</b> • Kas: <b style="color:var(--amber-hi)">${snap.bronzeFormatted}</b> • Thn ${snap.calendar.year} Hari ${snap.calendar.day}
            </div>
            <div>
              ${continueBtnHtml}
            </div>
          </div>
        `
        : `
          <div class="card">
            <div class="card-title">Belum Ada Karakter Tersimpan</div>
            <div class="card-sub">Silakan buat karakter pandai besi Anda terlebih dahulu untuk memulai petualangan di Tidewrack Village (Saltgrave Coast).</div>
          </div>
        `;

      container.innerHTML = `
        <div class="start-container">
          <div class="title-banner">
            <div>
              <div style="font-size:10.5px;color:var(--amber-hi);font-weight:800;letter-spacing:1px;text-transform:uppercase">100% Offline • Battle-Smith RPG</div>
              <h1 style="margin:3px 0;font-size:20px;color:#fff">⚒️ Dunia Emberhold</h1>
              <div style="font-size:11.5px;color:var(--muted)">Endless Blacksmith × Mafia Wars (Skala Penuh Lv.1–150)</div>
            </div>
            <button id="btn-start-toggle-portrait" class="chip-btn teal">
              ${isPortrait ? "💻 Tampilan Laptop" : "📱 Uji HP Portrait"}
            </button>
          </div>

          ${savedCardHtml}

          <div class="card teal">
            <div class="card-head">
              <div>
                <div class="card-title">✨ Buat Karakter Baru</div>
                <div class="card-sub">Pilih Nama, Latar Belakang (+2 Stat), +5 Poin Stat Bebas, Mazhab Tipe Smith Awal, &amp; 12 Sub-Stat Fokus.</div>
              </div>
              <span class="badge">Lv.1 • 13 Poin</span>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              ${playBtnHtml}
            </div>
          </div>
        </div>
      `;

      const contBtn = container.querySelector("#btn-continue-game");
      if (contBtn) contBtn.onclick = () => callbacks.onEnterGameplay();

      container.querySelector("#btn-open-wizard").onclick = () => {
        draft.mode = "wizard";
        draft.step = 1;
        renderStartWindow(container, snap, callbacks);
      };
      container.querySelector("#btn-start-toggle-portrait").onclick = () => {
        callbacks.onTogglePortrait();
        renderStartWindow(container, snap, callbacks);
      };
      return;
    }

    // =========================================================================
    // MODE WIZARD PEMBUATAN KARAKTER BARU (3 LANGKAH RINGKAS)
    // =========================================================================
    const finalStats = computeDraftStats();
    const preview = Bridge.previewCharacterDraft({
      stats: finalStats,
      focusSubStats: draft.focusSubStats,
      startingSmithClass: draft.startingSmithClass
    });
    const freeLeft = getFreePointsRemaining();
    const bgObj = snap.backgrounds.find(b => b.id === draft.background) || snap.backgrounds[0];

    let stepBodyHtml = "";

    // --- LANGKAH 1: NAMA & 6 LATAR BELAKANG (CD-1.03) ---
    if (draft.step === 1) {
      stepBodyHtml = `
        <div class="create-two-col">
          <div class="card">
            <div class="card-title">1. Nama &amp; Latar Belakang (CD-1.03)</div>
            <div>
              <label style="font-size:11px;color:var(--muted);display:block;margin-bottom:4px">Nama Karakter</label>
              <input id="inp-char-name" class="text-input" type="text" maxlength="28" value="${draft.name.replace(/"/g, "&quot;")}" placeholder="Ketik nama pandai besi..." />
            </div>
            <div style="font-size:11px;color:var(--muted);margin-top:4px">Pilih 1 dari 6 Latar Belakang resmi:</div>
            <div class="choice-grid">
              ${snap.backgrounds.map(b => `
                <button class="choice-card ${b.id === draft.background ? "selected" : ""}" data-bg-pick="${b.id}">
                  <div style="display:flex;justify-content:space-between;align-items:center">
                    <strong style="color:${b.id === draft.background ? "var(--amber-hi)" : "#fff"};font-size:12.5px">${b.id}</strong>
                    <span class="badge">${b.stats.join(" / ")}</span>
                  </div>
                  <span style="font-size:10.5px;color:var(--muted)">${b.desc}</span>
                </button>
              `).join("")}
            </div>
          </div>

          <div class="card warm">
            <div>
              <div class="card-title">Bonus +2 Poin Latar Belakang</div>
              <div class="card-sub">Pilih tepat <b>2 Stat</b> dari 3 stat khas <b>${bgObj.id}</b> untuk mendapat +1 poin awal:</div>
              <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px">
                ${bgObj.stats.map(st => {
                  const picked = draft.bgStatsPicked.includes(st);
                  return `
                    <button class="pill-btn ${picked ? "active" : ""}" data-bg-stat="${st}">
                      ${picked ? "✓ " : ""}${st} (+1)
                    </button>
                  `;
                }).join("")}
              </div>
              <div style="margin-top:8px;font-size:11px;color:${draft.bgStatsPicked.length === 2 ? "var(--teal-hi)" : "#fda4af"}">
                Terpilih: <b>${draft.bgStatsPicked.length}/2</b> stat (${draft.bgStatsPicked.join(", ") || "-"})
              </div>
            </div>

            <div style="border-top:1px solid var(--border);padding-top:8px;font-size:11.5px;color:#cbd5e1">
              <div>📍 <b>Titik Mulai (WD-4.07):</b> Tidewrack Village (Saltgrave Coast, Tier 1)</div>
              <div style="margin-top:3px">💰 <b>Modal Awal:</b> 50s + Paket Bahan Pantai Tier 1</div>
            </div>
          </div>
        </div>
      `;
    }

    // --- LANGKAH 2: +5 POIN STAT BEBAS (CD-1.01) & TIPE SMITH AWAL (CD-3.01) ---
    if (draft.step === 2) {
      stepBodyHtml = `
        <div class="create-two-col">
          <div class="card">
            <div class="card-head">
              <div>
                <div class="card-title">2A. Alokasi +5 Poin Stat Bebas (CD-1.01)</div>
                <div class="card-sub">Dasar 1 + Latar Belakang + Poin Bebas = Total 13 Poin</div>
              </div>
              <span class="badge ${freeLeft === 0 ? "ok" : "pending"}">Sisa: ${freeLeft} poin</span>
            </div>

            <div style="display:flex;flex-direction:column;gap:5px">
              ${STATS.map(s => {
                const bgAdd = draft.bgStatsPicked.includes(s) ? 1 : 0;
                const freeAdd = draft.freePts[s] || 0;
                return `
                  <div class="stat-alloc-row">
                    <div>
                      <strong style="color:var(--sky);font-size:12.5px">${s}</strong>
                      <span style="font-size:10px;color:var(--muted);margin-left:5px">(1${bgAdd ? "+1 BG" : ""}${freeAdd ? `+${freeAdd}` : ""})</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:7px">
                      <button class="stepper-btn" data-free-dec="${s}" ${freeAdd <= 0 ? "disabled" : ""}>−</button>
                      <strong style="width:22px;text-align:center;font-family:monospace;font-size:13.5px">${finalStats[s]}</strong>
                      <button class="stepper-btn" data-free-inc="${s}" ${freeLeft <= 0 ? "disabled" : ""}>+</button>
                    </div>
                  </div>
                `;
              }).join("")}
            </div>

            <div style="font-size:11px;color:#cbd5e1;background:#0c141d;padding:7px 9px;border-radius:8px">
              Title Awal: <b style="color:var(--amber-hi)">${preview.title.type}${preview.title.primaryStat ? ` (${preview.title.primaryStat})` : ""}</b>
              • HP: <b>${preview.hp}</b> • Stamina: <b>${preview.stm}</b> • Slot Skill Bar: <b>${preview.maxSlots}</b>
            </div>
          </div>

          <div class="card warm">
            <div class="card-title">2B. Pilih Mazhab Tipe Smith Awal (1/5 Poin)</div>
            <div class="card-sub">Klik Mazhab untuk melihat peta evolusi kelas masa depan ala SWTOR:</div>
            <div style="display:flex;flex-direction:column;gap:6px">
              ${Object.entries(SMITH_DESC).map(([cls, info]) => {
                const sel = draft.startingSmithClass === cls;
                return `
                  <button class="choice-card ${sel ? "selected" : ""}" data-smith-pick="${cls}">
                    <div style="display:flex;justify-content:space-between;align-items:center">
                      <strong style="font-size:12px;color:${sel ? "var(--amber-hi)" : "#fff"}">${info.icon} ${cls} → ${info.title}</strong>
                      <span class="badge">T1</span>
                    </div>
                    <span style="font-size:10.5px;color:var(--muted)">${info.role}</span>
                  </button>
                `;
              }).join("")}
            </div>

            ${(() => {
              const rm = SWTOR_ROADMAP[draft.startingSmithClass] || SWTOR_ROADMAP.Weaponsmith;
              const tSkills = (snap.skillData.smith_skill_trees?.[draft.startingSmithClass]?.tiers || [])
                .map(t => `T${t.tier} ${t.active_skill.name}`)
                .join(" → ");
              return `
                <div class="passive-box unlocked" style="line-height:1.45">
                  <div>🌟 <b>Jalur Murni (T1→T5):</b> <span style="color:var(--amber-hi);font-weight:700">${rm.pure.join(" → ")}</span></div>
                  <div style="margin-top:2px">⚔️ <b>Jurus Terbuka:</b> ${tSkills}</div>
                  <div style="margin-top:2px">🔀 <b>Cabang Hibrida:</b> <span style="color:var(--teal-hi)">${rm.hybrids.join(" • ")}</span></div>
                </div>
              `;
            })()}

            <div style="font-size:11px;color:var(--teal-hi)">
              ⚔️ Senjata Awal: <b>${preview.starterWeapon.name}</b> • Jurus [W]: <b>${preview.starterWeapon.trigger}</b>
            </div>
          </div>
        </div>
      `;
    }

    // --- LANGKAH 3: FOKUS SUB-STAT KHUSUS SMITH & PROFESI (+25%, POIN 3) & MULAI ---
    if (draft.step === 3) {
      const fStat = draft.activeFocusStatTab;
      const subList = (preview.subStats.byStat[fStat] || []).filter(s => s.category === "profession");
      const subDefsById = {};
      for (const d of (snap.skillData.sub_stats?.[fStat] || [])) subDefsById[d.id] = d;
      const chosenIds = draft.focusSubStats[fStat] || [];

      stepBodyHtml = `
        <div class="create-two-col">
          <div class="card">
            <div class="card-head">
              <div>
                <div class="card-title">3. Fokus Keahlian Smith &amp; Profesi (+25%)</div>
                <div class="card-sub">Sub-Stat Pertarungan aktif otomatis mengikuti Stat utama; di sini Anda cukup memilih <b>2 keahlian Pandai Besi &amp; Profesi</b> per Stat agar tidak ada yang mubazir:</div>
              </div>
              <span class="badge ok">Selalu Terpakai</span>
            </div>

            <div class="filter-pills" style="margin-bottom:4px">
              ${STATS.map(s => `
                <button class="pill-btn ${fStat === s ? "active" : ""}" data-focus-tab="${s}">
                  ${s} (${(draft.focusSubStats[s] || []).length}/2)
                </button>
              `).join("")}
            </div>

            <div style="display:flex;flex-direction:column;gap:5px">
              ${subList.map(sub => {
                const isFoc = chosenIds.includes(sub.id);
                return `
                  <button class="choice-card ${isFoc ? "selected" : ""}" data-focus-sub="${sub.id}" style="padding:7px 9px">
                    <div style="display:flex;justify-content:space-between;align-items:center;width:100%">
                      <strong style="font-size:11.5px;color:${isFoc ? "var(--amber-hi)" : "#e2e8f0"}">${isFoc ? "★ " : ""}${sub.name}</strong>
                      <b style="font-family:monospace;font-size:11.5px;color:var(--sky)">+${sub.value}%</b>
                    </div>
                    <span style="font-size:10px;color:var(--muted)">${subDefsById[sub.id]?.desc || ""}</span>
                  </button>
                `;
              }).join("")}
            </div>
          </div>

          <div class="card warm">
            <div>
              <div class="card-title">📋 Ringkasan Karakter Siap Mulai</div>
              <div class="card-sub">Periksa sebelum memasuki Tidewrack Village:</div>
              <div style="margin-top:8px;display:flex;flex-direction:column;gap:5px;font-size:12px">
                <div>👤 <b>Nama:</b> ${draft.name || "Alden"} (${draft.background})</div>
                <div>⚒️ <b>Kelas &amp; Destiny:</b> <span style="color:var(--amber-hi);font-weight:800">${preview.smith.singleWordClassName}</span> (${draft.startingSmithClass} T1)</div>
                <div>📊 <b>Stat (13 Poin):</b> ${STATS.map(s => `${s}:${finalStats[s]}`).join(" • ")}</div>
                <div>⚡ <b>Stamina Awal:</b> ${preview.stm} STM (HP Duel Boss: ${preview.hp})</div>
                <div>🪓 <b>Senjata &amp; [W]:</b> ${preview.starterWeapon.name} ([W] ${preview.starterWeapon.trigger})</div>
              </div>
            </div>

            <button id="btn-finish-create" class="btn btn-primary" style="width:100%;padding:10px;font-size:13px" ${freeLeft !== 0 || draft.bgStatsPicked.length !== 2 ? "disabled" : ""}>
              🚀 Mulai Petualangan di Tidewrack Village
            </button>
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="start-container">
        <div class="title-banner" style="padding:10px 14px">
          <div>
            <strong style="font-size:14px;color:var(--amber-hi)">✨ Pembuatan Karakter Baru</strong>
            <div style="font-size:11px;color:var(--muted)">Langkah ${draft.step} dari 3 • 100% Sesuai Aturan GDD</div>
          </div>
          <div style="display:flex;gap:6px">
            <button id="btn-wiz-portrait" class="chip-btn teal">${isPortrait ? "💻 Laptop" : "📱 HP Portrait"}</button>
            <button id="btn-back-title" class="chip-btn">← Menu Awal</button>
          </div>
        </div>

        <div class="wizard-steps">
          <button class="step-pill ${draft.step === 1 ? "active" : ""}" data-wiz-step="1">1. Latar Belakang</button>
          <button class="step-pill ${draft.step === 2 ? "active" : ""}" data-wiz-step="2">2. Stat &amp; Tipe Smith</button>
          <button class="step-pill ${draft.step === 3 ? "active" : ""}" data-wiz-step="3">3. Fokus &amp; Mulai</button>
        </div>

        ${stepBodyHtml}

        <div style="display:flex;justify-content:space-between;gap:8px">
          <button id="btn-step-prev" class="btn btn-secondary" ${draft.step <= 1 ? "disabled" : ""}>← Sebelumnya</button>
          ${draft.step < 3 ? `<button id="btn-step-next" class="btn btn-primary">Lanjut Langkah ${draft.step + 1} →</button>` : `<span></span>`}
        </div>
      </div>
    `;

    // Event Bindings Wizard
    container.querySelector("#btn-back-title").onclick = () => {
      draft.mode = "title";
      renderStartWindow(container, snap, callbacks);
    };
    container.querySelector("#btn-wiz-portrait").onclick = () => {
      callbacks.onTogglePortrait();
      renderStartWindow(container, snap, callbacks);
    };
    container.querySelectorAll("[data-wiz-step]").forEach(b => {
      b.onclick = () => {
        draft.step = Number(b.getAttribute("data-wiz-step"));
        renderStartWindow(container, snap, callbacks);
      };
    });
    const prevBtn = container.querySelector("#btn-step-prev");
    if (prevBtn) prevBtn.onclick = () => { draft.step = Math.max(1, draft.step - 1); renderStartWindow(container, snap, callbacks); };
    const nextBtn = container.querySelector("#btn-step-next");
    if (nextBtn) nextBtn.onclick = () => {
      if (draft.step === 1 && draft.bgStatsPicked.length !== 2) {
        return callbacks.onToast("⚠ Pilih tepat 2 Stat bonus Latar Belakang dulu.");
      }
      if (draft.step === 2 && getFreePointsRemaining() !== 0) {
        return callbacks.onToast(`⚠ Habiskan sisa ${getFreePointsRemaining()} poin Stat bebas dulu.`);
      }
      draft.step = Math.min(3, draft.step + 1);
      renderStartWindow(container, snap, callbacks);
    };

    const nameInp = container.querySelector("#inp-char-name");
    if (nameInp) nameInp.oninput = e => { draft.name = e.target.value; };

    container.querySelectorAll("[data-bg-pick]").forEach(b => {
      b.onclick = () => {
        const bgId = b.getAttribute("data-bg-pick");
        draft.background = bgId;
        const found = snap.backgrounds.find(x => x.id === bgId);
        if (found) draft.bgStatsPicked = found.stats.slice(0, 2);
        renderStartWindow(container, snap, callbacks);
      };
    });

    container.querySelectorAll("[data-bg-stat]").forEach(b => {
      b.onclick = () => {
        const st = b.getAttribute("data-bg-stat");
        if (draft.bgStatsPicked.includes(st)) {
          draft.bgStatsPicked = draft.bgStatsPicked.filter(x => x !== st);
        } else {
          if (draft.bgStatsPicked.length >= 2) draft.bgStatsPicked.shift();
          draft.bgStatsPicked.push(st);
        }
        renderStartWindow(container, snap, callbacks);
      };
    });

    container.querySelectorAll("[data-free-inc]").forEach(b => {
      b.onclick = () => {
        const s = b.getAttribute("data-free-inc");
        if (getFreePointsRemaining() > 0) {
          draft.freePts[s] = (draft.freePts[s] || 0) + 1;
          renderStartWindow(container, snap, callbacks);
        }
      };
    });
    container.querySelectorAll("[data-free-dec]").forEach(b => {
      b.onclick = () => {
        const s = b.getAttribute("data-free-dec");
        if ((draft.freePts[s] || 0) > 0) {
          draft.freePts[s] -= 1;
          renderStartWindow(container, snap, callbacks);
        }
      };
    });

    container.querySelectorAll("[data-smith-pick]").forEach(b => {
      b.onclick = () => {
        draft.startingSmithClass = b.getAttribute("data-smith-pick");
        renderStartWindow(container, snap, callbacks);
      };
    });

    container.querySelectorAll("[data-focus-tab]").forEach(b => {
      b.onclick = () => {
        draft.activeFocusStatTab = b.getAttribute("data-focus-tab");
        renderStartWindow(container, snap, callbacks);
      };
    });
    container.querySelectorAll("[data-focus-sub]").forEach(b => {
      b.onclick = () => {
        const subId = b.getAttribute("data-focus-sub");
        const list = (draft.focusSubStats[draft.activeFocusStatTab] || []).slice();
        if (!list.includes(subId)) {
          if (list.length >= 2) list.shift();
          list.push(subId);
          draft.focusSubStats[draft.activeFocusStatTab] = list;
          renderStartWindow(container, snap, callbacks);
        }
      };
    });

    const finishBtn = container.querySelector("#btn-finish-create");
    if (finishBtn) {
      finishBtn.onclick = () => {
        const res = Bridge.createNewCharacter({
          name: draft.name,
          background: draft.background,
          stats: computeDraftStats(),
          focusSubStats: draft.focusSubStats,
          startingSmithClass: draft.startingSmithClass
        });
        if (!res.ok) return callbacks.onToast(`⚠ ${res.reason}`);
        draft.mode = "title";
        callbacks.onToast(`🎉 Selamat datang di Tidewrack Village, ${draft.name}!`);
        callbacks.onEnterGameplay();
      };
    }
  }

  global.BSRPG_SCREEN_CREATE = {
    openWizardMode() { draft.mode = "wizard"; draft.step = 1; },
    openTitleMode() { draft.mode = "title"; },
    render: renderStartWindow
  };
})(window);
