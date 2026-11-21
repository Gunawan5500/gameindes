import fs from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { BasicSnDEngine, parseCSV, formatCurrency } from './snd_engine.js';

const root = path.resolve(import.meta.dirname, '../..');
const config = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, 'economy_config.json'), 'utf8'));
const locations = parseCSV(fs.readFileSync(path.join(root, 'data/locations.csv'), 'utf8'));
const factions = parseCSV(fs.readFileSync(path.join(root, 'data/factions.csv'), 'utf8'));
const relations = parseCSV(fs.readFileSync(path.join(root, 'data/faction_relations.csv'), 'utf8'));
const items = parseCSV(fs.readFileSync(path.join(import.meta.dirname, 'dummy_items.csv'), 'utf8'));

const engine = new BasicSnDEngine({
  config,
  locations,
  factions,
  relations,
  items,
  initialWorldState: { day: 1, season: 'Winter', festivalActive: false }
});

const T0 = Date.UTC(2026, 10, 19, 8, 0, 0);
const HOUR = 60 * 60 * 1000;

// Helper cari location_id dari nama Inggris
const locIdByName = (name) => locations.find((l) => l.location_name === name)?.location_id;

const locWhitepine = locIdByName('Whitepine Village');       // Village (Hollowfrost, Frostcrown Remnant)
const locHollowfrostMkt = locIdByName('Hollowfrost Market'); // Town (Induk Whitepine!)
const locBriarfall = locIdByName('Briarfall City');          // Major City (Briarfall Crown)
const locBriarMeadow = locIdByName('Briar Meadow Village');  // Village di Briarfall Marches
const locObsidian = locIdByName('Obsidian City');            // Major City (Emberwaste Order)
const locWyrmspine = locIdByName('Wyrmspine Forgecity');     // Major City (Wyrmspine Hold)

console.log('=== UJI COBA BASIC S&D ENGINE (v0.1 DEMO) ===');
console.log(`Data termuat: ${locations.length} lokasi, ${factions.length} faksi/org, ${relations.length} relasi, ${items.length} item dummy.\n`);

// SKENARIO 1: 77 Pasar Berjenjang 4 Kelas (WD-5.06) + Diskon Area Asal
console.log('--- SKENARIO 1: Filter 4 Kelas Pasar & Diskon Area Asal ---');
const tryLegendAtVillage = engine.canTradeAtLocation(locWhitepine, 'mat_frostcrown_core');
const tryLegendAtMajor = engine.canTradeAtLocation(locBriarfall, 'mat_frostcrown_core');
const oreAtOrigin = engine.getPrice(locWyrmspine, 'mat_iron_ore', { mode: 'buy', nowMs: T0 });
const oreAtBriarfall = engine.getPrice(locBriarfall, 'mat_iron_ore', { mode: 'buy', nowMs: T0 });
console.log(`1a. Jual Legendary di Whitepine Village: ${tryLegendAtVillage.allowed ? 'BISA' : 'DITOLAK'} -> ${tryLegendAtVillage.reason}`);
console.log(`1b. Jual Legendary di Briarfall City (Major City): ${tryLegendAtMajor.allowed ? 'BISA' : 'DITOLAK'}`);
console.log(`1c. Raw Iron Ore di area asal (Wyrmspine): ${oreAtOrigin.formatted} [${oreAtOrigin.reasons.join(', ')}]`);
console.log(`1d. Raw Iron Ore di luar area (Briarfall): ${oreAtBriarfall.formatted}\n`);

// SKENARIO 2: Borong Desa -> Anti-Eksploitasi Biaya Tempa + Efek Riak 25% Induk
console.log('--- SKENARIO 2: Borong Stok Desa, Anti-Eksploitasi Tempa & Riak Kota Induk ---');
const beforeVillage = engine.getPrice(locWhitepine, 'mat_iron_ore', { mode: 'buy', nowMs: T0 });
const beforeParent = engine.getPrice(locHollowfrostMkt, 'mat_iron_ore', { mode: 'buy', nowMs: T0 });
// Pemain memborong 15 bijih di desa kecil (kedalaman tipis = 16)
const buyTrade = engine.executeTrade(locWhitepine, 'mat_iron_ore', 15, { action: 'player_buy', nowMs: T0 });
const afterVillage = engine.getPrice(locWhitepine, 'mat_iron_ore', { mode: 'buy', nowMs: T0 });
const forgingCost = engine.getForgingMaterialCost(locWhitepine, [{ itemId: 'mat_iron_ore', qty: 4 }], T0);
// Uji riak: ubah pasar induk (Hollowfrost Market) lalu lihat pengaruh ke anak (Whitepine Village)
engine.executeTrade(locHollowfrostMkt, 'mat_pine_resin', 25, { action: 'player_buy', nowMs: T0 });
const childRipple = engine.getPrice(locWhitepine, 'mat_pine_resin', { mode: 'buy', nowMs: T0 });

console.log(`2a. Harga bijih Whitepine sebelum borong: ${beforeVillage.formatted} -> sesudah borong 15: ${afterVillage.formatted} (lonjakan +${buyTrade.priceShiftPct}%)`);
console.log(`2b. Anti-Eksploitasi Tempa (4 bijih): Harga pasar mentah=${formatCurrency(forgingCost.totalRawMarketBr)} vs Biaya Tempa Teredam=${forgingCost.dampedFormatted}`);
console.log(`2c. Riak 25% Induk -> Anak (Frostpine Resin di Whitepine): localSnD=${childRipple.localSnD}, parentSnD=${childRipple.parentSnD}, totalMult=${childRipple.totalMult} -> ${childRipple.formatted}\n`);

// SKENARIO 3: Pemulihan Lazy Math 12 Jam & Auto-Prune (0 Byte!)
console.log('--- SKENARIO 3: Lazy Math Pemulihan 6 Jam & 12 Jam + Auto-Prune ---');
const after6h = engine.getPrice(locWhitepine, 'mat_iron_ore', { mode: 'buy', nowMs: T0 + 6 * HOUR });
const deltaCount6h = engine.marketDeltas.size;
const after12h = engine.getPrice(locWhitepine, 'mat_iron_ore', { mode: 'buy', nowMs: T0 + 12 * HOUR });
const pruned = engine.autoPrune(T0 + 12 * HOUR);
console.log(`3a. Setelah 6 jam idle (pulih 50%): ${after6h.formatted} (entri aktif di RAM: ${deltaCount6h})`);
console.log(`3b. Setelah 12 jam idle (pulih 100%): ${after12h.formatted} (auto-prune hapus ${pruned} entri, sisa di RAM: ${engine.marketDeltas.size})\n`);

// SKENARIO 4: Dampak Politik WD-2 (Embargo, Open War, Boikot + Shadow Syndicate)
console.log('--- SKENARIO 4: Politik WD-2 (Embargo, Open War, Boikot & Shadow Syndicate) ---');
// Hari-0 sudah ada Embargo Emberwaste <-> Frostcrown + Musim Dingin (elemen Api naik!)
const emberAtOrigin = engine.getPrice(locObsidian, 'mat_ember_shard', { mode: 'buy', nowMs: T0 });
const emberAtFrost = engine.getPrice(locHollowfrostMkt, 'mat_ember_shard', { mode: 'buy', nowMs: T0 });
// Aktifkan Open War Briarfall <-> Ashwind
engine.setRelationStatus('briarfall_crown', 'ashwind_clans', 'Open War', -82);
const axeWarBriarfall = engine.getPrice(locBriarfall, 'wpn_iron_axe', { mode: 'buy', nowMs: T0 });
// Aktifkan Boikot (WD-2.14) pada Briarfall Crown
engine.worldState.boycottedFactions.add('briarfall_crown');
const blockedNormal = engine.canTradeAtLocation(locBriarfall, 'wpn_iron_axe', false);
const viaShadow = engine.getPrice(locBriarfall, 'wpn_iron_axe', { mode: 'buy', nowMs: T0, viaShadowSyndicate: true });

console.log(`4a. Ember Shard di asal (Obsidian City, Musim Dingin): ${emberAtOrigin.formatted} [${emberAtOrigin.reasons.join(', ')}]`);
console.log(`4b. Ember Shard di Hollowfrost (Embargo + Musim Dingin): ${emberAtFrost.formatted} [${emberAtFrost.reasons.join(', ')}]`);
console.log(`4c. Kapak Perang di Briarfall saat Open War: ${axeWarBriarfall.formatted} [${axeWarBriarfall.reasons.join(', ')}]`);
console.log(`4d. Saat Boikot Briarfall: toko resmi=${blockedNormal.allowed ? 'BISA' : 'DITOLAK'} | via Shadow Syndicate=${viaShadow.formatted}\n`);

// SKENARIO 5: Simulasi Idle 10 Hari Game (7 Hari Detail + 3 Agregat) & Event Karavan
console.log('--- SKENARIO 5: Simulasi Idle 10 Hari Game (Event Karavan & Ringkasan) ---');
const sim = engine.simulateOfflineDays(10, 20261119, T0 + 15 * HOUR);
console.log(`Hari sekarang: ${sim.currentDay} | Detail: ${sim.detailedDaysSimulated} hari | Agregat: ${sim.aggregatedDays} hari | Event aktif hari ini: ${sim.activeEventsToday}`);
console.log('Contoh 4 baris Log Kabar Ringkasan Idle:');
for (const line of sim.kabarLogs.slice(-4)) {
  console.log('  *', line);
}
console.log('');

// SKENARIO 6: Benchmark Kecepatan & Ukuran Save File (Target Oppo A54 < 150 MB)
console.log('--- SKENARIO 6: Benchmark Performa & Memori (Target Oppo A54) ---');
// Buat 30 transaksi aktif di berbagai kota untuk simulasi save file realistis
for (let i = 0; i < 30; i++) {
  const loc = locations[i % locations.length];
  engine.executeTrade(loc.location_id, 'mat_iron_ore', 2, { action: 'player_buy', nowMs: T0 + 16 * HOUR, viaShadowSyndicate: true });
}
const tStart = performance.now();
for (let i = 0; i < 1000; i++) {
  const loc = locations[i % locations.length];
  const item = items[i % items.length];
  engine.getPrice(loc.location_id, item.item_id, { mode: 'buy', nowMs: T0 + 16 * HOUR });
}
const elapsedMs = performance.now() - tStart;
const saveJson = engine.exportSaveJSON();
const saveBytes = Buffer.byteLength(saveJson, 'utf8');

console.log(`6a. Kecepatan 1.000 kalkulasi harga lengkap: ${elapsedMs.toFixed(2)} ms (${(elapsedMs / 1000).toFixed(4)} ms/harga)`);
console.log(`6b. Ukuran Sparse Save State (30 transaksi aktif + world state): ${(saveBytes / 1024).toFixed(2)} KB (${saveBytes} bytes)`);
console.log(`6c. Pemakaian Heap RAM Node.js total proses: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB (jauh di bawah batas 150 MB Oppo A54!)`);
