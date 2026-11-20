/**
 * Battle-Smith RPG — Basic Supply & Demand (S&D) Engine Prototype (v0.1 DEMO)
 * Zero-dependency ES Module: berjalan di Node.js & Browser/PWA (Oppo A54 < 150 MB).
 *
 * Arsitektur WD-5.06 & WD-5.07:
 * 1. Sparse Save State (0 byte untuk barang diam, auto-prune setelah 12 jam pulih penuh).
 * 2. 77 Pasar Berjenjang 4 Kelas (Village / Town / City / Major City).
 * 3. 3 Lapis Lazy Math + Efek Riak 25% Kota Induk (parent_location_id) + Event Karavan.
 * 4. Anti-eksploitasi biaya bahan tempa (Harga Pasar Teredam).
 */

export function parseCSV(text) {
  const lines = text.replace(/\r/g, '').trim().split('\n');
  if (lines.length < 2) return [];
  const parseLine = (line) => {
    const out = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        out.push(cur);
        cur = '';
      } else {
        cur += ch;
      }
    }
    out.push(cur);
    return out;
  };
  const headers = parseLine(lines[0]);
  return lines.slice(1).map((line) => {
    const vals = parseLine(line);
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = vals[idx] ?? '';
    });
    return obj;
  });
}

export function formatCurrency(bronzeTotal, currencyCfg = { bronze_per_silver: 100, bronze_per_gold: 10000 }) {
  const neg = bronzeTotal < 0 ? '-' : '';
  let rem = Math.round(Math.abs(bronzeTotal));
  const g = Math.floor(rem / currencyCfg.bronze_per_gold);
  rem %= currencyCfg.bronze_per_gold;
  const s = Math.floor(rem / currencyCfg.bronze_per_silver);
  const br = rem % currencyCfg.bronze_per_silver;
  const parts = [];
  if (g > 0) parts.push(`${g}g`);
  if (s > 0) parts.push(`${s}s`);
  if (br > 0 || parts.length === 0) parts.push(`${br}br`);
  return neg + parts.join(' ');
}

// Deterministic lightweight PRNG (Mulberry32) untuk seed per save tanpa AI
function seededRandom(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

export class BasicSnDEngine {
  constructor({ config, locations, factions, relations, items, initialWorldState = {} }) {
    this.config = config;

    // Index statis (Read-Only, muat sekali)
    this.locations = new Map(locations.map((l) => [l.location_id, l]));
    this.factions = new Map(factions.map((f) => [f.faction_id, f]));
    this.items = new Map(
      items.map((it) => [
        it.item_id,
        { ...it, base_price_br: Number(it.base_price_br) }
      ])
    );

    // Index area -> faction_id (untuk cek asal barang vs Embargo/Alliance)
    this.areaFaction = new Map();
    for (const loc of locations) {
      if (loc.area_id && loc.faction_id && !this.areaFaction.has(loc.area_id)) {
        this.areaFaction.set(loc.area_id, loc.faction_id);
      }
    }

    // Index relasi 55 pasangan: "facA|facB" -> status
    this.relations = new Map();
    for (const r of relations) {
      this._setRelation(r.faction_a_id, r.faction_b_id, r.initial_status, Number(r.base_score_demo));
    }

    // State Dinamis (Sparse Save State — HANYA barang yang pernah berubah!)
    this.marketDeltas = new Map(); // key: `${locId}::${itemId}` -> { s, d, lastTs }
    this.worldState = {
      day: initialWorldState.day ?? 1,
      season: initialWorldState.season ?? 'Spring', // Spring | Summer | Autumn | Winter
      festivalActive: initialWorldState.festivalActive ?? false,
      boycottedFactions: new Set(initialWorldState.boycottedFactions ?? []),
      activeCaravanEvents: initialWorldState.activeCaravanEvents ?? [] // [{ locId, itemId, sMult, dMult, text }]
    };
  }

  _relKey(a, b) {
    return a < b ? `${a}|${b}` : `${b}|${a}`;
  }

  _setRelation(a, b, status, score) {
    this.relations.set(this._relKey(a, b), { status, score });
  }

  setRelationStatus(a, b, status, score = 0) {
    this._setRelation(a, b, status, score);
  }

  getRelationStatus(a, b) {
    if (!a || !b || a === b) return 'Self';
    return this.relations.get(this._relKey(a, b))?.status ?? 'Neutral';
  }

  isFactionInOpenWar(factionId) {
    for (const [key, val] of this.relations.entries()) {
      if (val.status === 'Open War' && key.split('|').includes(factionId)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Cek apakah lokasi berkelas pasar cukup untuk memperdagangkan item (WD-5.06).
   */
  canTradeAtLocation(locId, itemId, viaShadowSyndicate = false) {
    const loc = this.locations.get(locId);
    const item = this.items.get(itemId);
    if (!loc || !item) return { allowed: false, reason: 'Lokasi atau item tidak ditemukan.' };

    // Cek boikot faksi (WD-2.14): toko resmi tutup, hanya Shadow Syndicate bisa
    if (this.worldState.boycottedFactions.has(loc.faction_id) && !viaShadowSyndicate) {
      return {
        allowed: false,
        reason: `Faksi ${loc.faction_name} sedang memboikot Anda (Hostile Terkunci). Gunakan Shadow Syndicate.`
      };
    }

    // Cek kelas pasar (WD-5.06)
    const ranks = this.config.market_class_rank;
    const locRank = ranks[loc.settlement_type] ?? 1;
    const reqRank = ranks[item.min_market_class] ?? 1;
    const allowedRarities = this.config.market_class_allowed_rarities[loc.settlement_type] ?? [];

    if (!viaShadowSyndicate && (locRank < reqRank || !allowedRarities.includes(item.rarity))) {
      return {
        allowed: false,
        reason: `Pasar kelas ${loc.settlement_type} tidak memperdagangkan ${item.item_name} (${item.rarity}, min ${item.min_market_class}).`
      };
    }

    return { allowed: true, reason: 'OK' };
  }

  getBaseDepth(locId, itemId) {
    const loc = this.locations.get(locId);
    const item = this.items.get(itemId);
    const rarityDepth = this.config.rarity_base_depth[item.rarity] ?? 20;
    const classMult = this.config.market_class_depth_mult[loc.settlement_type] ?? 1;
    return Math.max(1, rarityDepth * classMult);
  }

  /**
   * Fungsi Inti 1: Lazy Math — pemulihan S & D instan dalam 1 rumus (tanpa loop per detik).
   */
  getEffectiveSD(locId, itemId, nowMs) {
    const baseDepth = this.getBaseDepth(locId, itemId);
    const key = `${locId}::${itemId}`;
    const entry = this.marketDeltas.get(key);
    if (!entry) {
      return { s: baseDepth, d: baseDepth, baseDepth, recoveredPct: 1 };
    }

    const elapsedHours = Math.max(0, (nowMs - entry.lastTs) / (1000 * 60 * 60));
    const recoveryHours = this.config.snd.full_recovery_hours;
    const ratio = clamp(elapsedHours / recoveryHours, 0, 1);

    if (ratio >= 1) {
      // Auto-prune saat pulih penuh (0 byte!)
      this.marketDeltas.delete(key);
      return { s: baseDepth, d: baseDepth, baseDepth, recoveredPct: 1 };
    }

    const s = entry.s + (baseDepth - entry.s) * ratio;
    const d = entry.d + (baseDepth - entry.d) * ratio;
    return { s: Math.max(0.25, s), d: Math.max(0.25, d), baseDepth, recoveredPct: ratio };
  }

  /**
   * Fungsi Inti 2: Pengali Dunia (Asal area, Open War, Embargo, Musim, Festival, Event Karavan).
   */
  getWorldMultiplier(locId, itemId) {
    const loc = this.locations.get(locId);
    const item = this.items.get(itemId);
    const wm = this.config.world_modifiers;
    let mult = 1.0;
    const reasons = [];

    // 1. Diskon area asal bahan (-20%)
    if (item.origin_area_id && item.origin_area_id === loc.area_id) {
      mult *= this.config.snd.origin_area_discount;
      reasons.push('Area asal (-20%)');
    }

    // 2. Efek politik WD-2 terhadap faksi asal barang
    const originFaction = item.origin_area_id ? this.areaFaction.get(item.origin_area_id) : null;
    if (originFaction && originFaction !== loc.faction_id) {
      const rel = this.getRelationStatus(loc.faction_id, originFaction);
      if (rel === 'Embargo' || rel === 'Open War') {
        // Pasokan barang musuh menyusut -> harga naik (1 / supply_mult)^k atau langsung inverse
        const embargoBoost = Math.pow(1 / wm.embargo_enemy_origin_supply_mult, this.config.snd.sensitivity_k);
        mult *= embargoBoost;
        reasons.push(`${rel} faksi asal (+${Math.round((embargoBoost - 1) * 100)}%)`);
      } else if (rel === 'Alliance') {
        mult *= wm.alliance_origin_discount_mult;
        reasons.push('Alliance asal (-10%)');
      }
    }

    // 3. Efek Open War pada permintaan senjata & material di wilayah faksi yang berperang
    if (this.isFactionInOpenWar(loc.faction_id)) {
      if (item.category === 'weapon') {
        mult *= wm.open_war_weapon_demand_mult;
        reasons.push('Open War senjata (+35%)');
      } else if (item.category === 'material') {
        mult *= wm.open_war_material_demand_mult;
        reasons.push('Open War bahan (+20%)');
      }
    }

    // 4. Musim & Festival (WD-4)
    if (this.worldState.season === 'Winter' && item.element_tag === 'Api') {
      mult *= wm.winter_fire_demand_mult;
      reasons.push('Musim Dingin elemen Api (+25%)');
    }
    if (this.worldState.festivalActive && (item.rarity === 'Rare' || item.rarity === 'Epic' || item.rarity === 'Legendary')) {
      mult *= wm.festival_luxury_demand_mult;
      reasons.push('Festival (+20%)');
    }

    // 5. Event Karavan Harian aktif
    for (const ev of this.worldState.activeCaravanEvents) {
      if (ev.locId === locId && (ev.itemId === itemId || ev.itemId === 'ALL')) {
        const evMult = Math.pow(ev.dMult / ev.sMult, this.config.snd.sensitivity_k);
        mult *= evMult;
        reasons.push(`Karavan (${evMult >= 1 ? '+' : ''}${Math.round((evMult - 1) * 100)}%)`);
      }
    }

    return { mult, reasons };
  }

  _getLocalSnDMultiplier(locId, itemId, nowMs) {
    const { s, d } = this.getEffectiveSD(locId, itemId, nowMs);
    const raw = Math.pow(d / s, this.config.snd.sensitivity_k);
    return clamp(raw, this.config.snd.multiplier_min, this.config.snd.multiplier_max);
  }

  /**
   * Fungsi Inti 3: Hitung Harga Beli/Jual Lengkap (termasuk Riak 25% Induk + CHA + Shadow Syndicate).
   */
  getPrice(locId, itemId, { mode = 'buy', nowMs = Date.now(), cha = 10, viaShadowSyndicate = false } = {}) {
    const loc = this.locations.get(locId);
    const item = this.items.get(itemId);
    const localSnD = this._getLocalSnDMultiplier(locId, itemId, nowMs);

    // Efek Riak 25% dari Kota Induk (parent_location_id, WD-1.03 & WD-5.07)
    let effectiveSnD = localSnD;
    let parentSnD = null;
    if (loc.parent_location_id && this.locations.has(loc.parent_location_id)) {
      parentSnD = this._getLocalSnDMultiplier(loc.parent_location_id, itemId, nowMs);
      const w = this.config.snd.parent_ripple_weight;
      effectiveSnD = localSnD * (1 - w) + parentSnD * w;
    }

    const { mult: worldMult, reasons } = this.getWorldMultiplier(locId, itemId);
    const totalMarketMult = clamp(
      effectiveSnD * worldMult,
      this.config.snd.multiplier_min,
      this.config.snd.multiplier_max
    );

    const marketPrice = item.base_price_br * totalMarketMult;
    let finalPrice = marketPrice;

    if (viaShadowSyndicate) {
      if (mode === 'buy') {
        finalPrice = marketPrice * this.config.world_modifiers.shadow_syndicate_buy_markup;
        reasons.push('Shadow Syndicate (+45%)');
      } else {
        finalPrice = marketPrice * this.config.world_modifiers.shadow_syndicate_sell_spread;
        reasons.push('Shadow Syndicate spread (45%)');
      }
    } else if (mode === 'sell') {
      // Spread toko + bonus CHA (+1%/poin di atas 10, cap +25%)
      const chaOver = Math.max(0, cha - this.config.cha_bonus.threshold);
      const chaBonus = Math.min(this.config.cha_bonus.max_bonus, chaOver * this.config.cha_bonus.per_point);
      finalPrice = marketPrice * this.config.snd.shop_buy_from_player_spread * (1 + chaBonus);
    }

    return {
      itemId,
      itemName: item.item_name,
      locationName: loc.location_name,
      basePriceBr: item.base_price_br,
      localSnD: Number(localSnD.toFixed(3)),
      parentSnD: parentSnD !== null ? Number(parentSnD.toFixed(3)) : null,
      worldMult: Number(worldMult.toFixed(3)),
      totalMult: Number(totalMarketMult.toFixed(3)),
      marketPriceBr: Math.round(marketPrice),
      finalPriceBr: Math.max(1, Math.round(finalPrice)),
      formatted: formatCurrency(Math.max(1, Math.round(finalPrice)), this.config.currency),
      reasons
    };
  }

  /**
   * Fungsi Inti 4: Eksekusi Transaksi (cek kelas pasar, modal kota, update S/D sparse).
   */
  executeTrade(locId, itemId, qty, { action = 'player_buy', nowMs = Date.now(), cha = 10, viaShadowSyndicate = false } = {}) {
    const check = this.canTradeAtLocation(locId, itemId, viaShadowSyndicate);
    if (!check.allowed) {
      return { ok: false, reason: check.reason };
    }

    const mode = action === 'player_buy' ? 'buy' : 'sell';
    const quoteBefore = this.getPrice(locId, itemId, { mode, nowMs, cha, viaShadowSyndicate });
    const totalBr = quoteBefore.finalPriceBr * qty;

    // Cek batas modal toko saat pemain menjual
    const loc = this.locations.get(locId);
    const cashCap = this.config.market_class_cash_cap_br[loc.settlement_type] ?? 1500;
    if (action === 'player_sell' && !viaShadowSyndicate && totalBr > cashCap) {
      return {
        ok: false,
        reason: `Modal toko ${loc.location_name} (${loc.settlement_type}) hanya ${formatCurrency(cashCap)}, tidak cukup membeli senilai ${formatCurrency(totalBr)}.`
      };
    }

    // Perbarui S/D pada sparse state
    const eff = this.getEffectiveSD(locId, itemId, nowMs);
    let newS = eff.s;
    let newD = eff.d;
    if (action === 'player_buy') {
      // Pemain memborong -> pasokan turun, permintaan sedikit naik
      newS = Math.max(0.5, eff.s - qty);
      newD = eff.d + qty * 0.25;
    } else {
      // Pemain menjual -> pasokan naik (saturasi pasar!)
      newS = eff.s + qty;
      newD = Math.max(0.5, eff.d - qty * 0.15);
    }

    this.marketDeltas.set(`${locId}::${itemId}`, { s: newS, d: newD, lastTs: nowMs });
    const quoteAfter = this.getPrice(locId, itemId, { mode, nowMs, cha, viaShadowSyndicate });

    return {
      ok: true,
      action,
      qty,
      unitPriceBr: quoteBefore.finalPriceBr,
      totalBr,
      totalFormatted: formatCurrency(totalBr, this.config.currency),
      newUnitPriceBr: quoteAfter.finalPriceBr,
      newUnitFormatted: quoteAfter.formatted,
      priceShiftPct: Math.round(((quoteAfter.marketPriceBr - quoteBefore.marketPriceBr) / quoteBefore.marketPriceBr) * 100)
    };
  }

  /**
   * Fungsi Inti 5: Anti-Eksploitasi Biaya Bahan Tempa (Harga Pasar Teredam — WD-5.07).
   * Biaya = harga_acuan + 50% selisih harga pasar (tidak memakai lonjakan 1 transaksi desa).
   */
  getForgingMaterialCost(locId, ingredients, nowMs = Date.now()) {
    const damping = this.config.snd.forging_cost_damping;
    let totalRawMarket = 0;
    let totalDampedCost = 0;
    const details = [];

    for (const { itemId, qty } of ingredients) {
      const quote = this.getPrice(locId, itemId, { mode: 'buy', nowMs });
      const dampedUnit = Math.round(quote.basePriceBr + (quote.marketPriceBr - quote.basePriceBr) * damping);
      totalRawMarket += quote.marketPriceBr * qty;
      totalDampedCost += dampedUnit * qty;
      details.push({
        itemId,
        qty,
        baseUnitBr: quote.basePriceBr,
        rawMarketUnitBr: quote.marketPriceBr,
        dampedUnitBr: dampedUnit
      });
    }

    return {
      totalRawMarketBr: totalRawMarket,
      totalDampedCostBr: totalDampedCost,
      dampedFormatted: formatCurrency(totalDampedCost, this.config.currency),
      details
    };
  }

  /**
   * Auto-prune entri yang sudah pulih 100% agar save file tetap minimal.
   */
  autoPrune(nowMs) {
    let removed = 0;
    const limitMs = this.config.snd.full_recovery_hours * 60 * 60 * 1000;
    for (const [key, entry] of this.marketDeltas.entries()) {
      if (nowMs - entry.lastTs >= limitMs) {
        this.marketDeltas.delete(key);
        removed++;
      }
    }
    return removed;
  }

  /**
   * Simulasi Latar Offline (maks 7 hari detail, selebihnya agregat — WD-4.03 & WD-5.07).
   * Membangkitkan Event Karavan Harian untuk Layar Ringkasan Idle & Log Kabar.
   */
  simulateOfflineDays(daysPassed, seed = 12345, nowMs = Date.now()) {
    const maxDetail = this.config.offline_simulation.max_detailed_days;
    const detailedDays = Math.min(daysPassed, maxDetail);
    const aggregatedDays = Math.max(0, daysPassed - maxDetail);
    const locList = [...this.locations.values()].filter((l) => l.settlement_type !== 'Village');
    const itemList = [...this.items.values()];
    const kabarLogs = [];

    this.worldState.activeCaravanEvents = [];

    for (let d = 1; d <= detailedDays; d++) {
      this.worldState.day += 1;
      const rng = seededRandom(seed + this.worldState.day * 997);
      const evCount = this.config.offline_simulation.caravan_events_per_day;

      for (let e = 0; e < evCount; e++) {
        const loc = locList[Math.floor(rng() * locList.length)];
        const item = itemList[Math.floor(rng() * itemList.length)];
        const isSurplus = rng() > 0.45;
        const ev = isSurplus
          ? {
              day: this.worldState.day,
              locId: loc.location_id,
              itemId: item.item_id,
              sMult: 1.4,
              dMult: 1.0,
              text: `[Hari ${this.worldState.day}] Karavan tiba di ${loc.location_name}: stok ${item.item_name} melimpah (harga turun).`
            }
          : {
              day: this.worldState.day,
              locId: loc.location_id,
              itemId: item.item_id,
              sMult: 0.65,
              dMult: 1.25,
              text: `[Hari ${this.worldState.day}] Jalur pasokan ke ${loc.location_name} terganggu: ${item.item_name} langka (harga naik).`
            };
        kabarLogs.push(ev.text);
        if (d === detailedDays) {
          this.worldState.activeCaravanEvents.push(ev);
        }
      }
    }

    if (aggregatedDays > 0) {
      this.worldState.day += aggregatedDays;
      kabarLogs.push(`[Agregat +${aggregatedDays} hari] Pasar dunia stabil kembali mengikuti arus musim ${this.worldState.season}.`);
    }

    const pruned = this.autoPrune(nowMs);
    return {
      currentDay: this.worldState.day,
      detailedDaysSimulated: detailedDays,
      aggregatedDays,
      prunedEntries: pruned,
      activeEventsToday: this.worldState.activeCaravanEvents.length,
      kabarLogs
    };
  }

  /**
   * Serialisasi Sparse Save State (untuk ukur ukuran save file nyata di HP Oppo A54).
   */
  exportSaveJSON() {
    return JSON.stringify({
      day: this.worldState.day,
      season: this.worldState.season,
      festivalActive: this.worldState.festivalActive,
      boycottedFactions: [...this.worldState.boycottedFactions],
      activeCaravanEvents: this.worldState.activeCaravanEvents,
      marketDeltas: Object.fromEntries(this.marketDeltas)
    });
  }
}
