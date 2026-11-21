# Laporan Simulator Gabungan WD + CD (v1, 21 November 2026)

Dijalankan dengan `node engines/balance_sim/run_report.js` (tes: `node engines/balance_sim/test_balance_sim.js`).
Data: 4.864 musuh WD (`data/areas/*.json`), 208 harga material, rumus CD v3.2 bagian 5b (`computeMonsterStats`).
Model: analitik nilai-harapan, arketipe 6 stat utama senjata, musuh selevel.

## Batas model (penting)
Belum dimodelkan: 150 node skill, 21 perk, armor + trigger, +N, rarity, XP per kill, stamina idle.
Asumsi simulator (bisa diubah di `CFG`): senjata T1–T6 sepanjang Lv1–150 (`ceil(L/25)`), kualitas senjata x1,1, 6 detik overhead per kill,
idle dianggap berkelanjutan bila 1 kill memakan <= 25% HP, harga jual 55% (buyback WD-5).
Karena itu `power_needed` dibaca sebagai: **berapa kali lipat kekuatan tambahan yang harus disuplai sistem yang belum dimodelkan**.

## Temuan
1. **Target jam idle tidak cocok.** Jika kuota XP dihitung dua bar (Battle + Smith), jam minimum Lv10/20/30 = 10,7 / 36,9 / 71,6 (cocok dengan CD-1.06: 11/37/72). Total Lv150 = **505 jam**, bukan ~720 jam seperti tertulis di CD-1.06. Dengan satu bar hasilnya 252 jam.
2. **STR jauh di atas stat lain.** `power_needed` Lv150: STR 3,1x | INT 7,0x | WIS 9,3x | DEX 7,5x | CON 10,9x | CHA 10,9x (pembacaan terakhir tabel). Penyebab: bonus damage `floor(STR/2)` bersifat datar dan melampaui damage senjata (sekitar 18 di anggaran T6). Ini membenarkan OPEN CD "penyetelan antar-stat".
3. **Beban tempur naik tajam per tier.** Persentase HP yang hilang per kill (arketipe STR): Lv30 0,28 → Lv45 0,54 → Lv150 0,78. HP pemain Lv150 hanya 600, sedangkan boss rata-rata memakan 3,6 HP bar.
4. **Pendapatan gold idle rendah dan hampir datar di Tier 1–3.** STR (setelah penyesuaian): Lv5 ~1,3 g/jam, Lv30 ~0,7 g/jam, Lv75 ~1,4 g/jam, Lv150 ~5,7 g/jam. Turun di Lv5→Lv30 karena beban tempur naik tanpa kenaikan harga drop. Harga drop baru melompat tiap tier.
5. **Cap cabang WD-4.13 bermasalah.** Batas C (3–8% dari sewa) selalu menjadi pembatas, dan hasil cabang jauh di bawah sewa (Town: cap 1.650–2.400 br per periode vs sewa asumsi 30.000 br). Cabang selalu rugi, dan batas A (relatif ke pemain) tidak pernah berperan.
   - **USULAN perbaikan**: rasio C = 0,8–2,0x sewa per periode (agar cabang bisa balik modal bila skill tinggi), sewa per periode ditautkan ke pendapatan idle Tier (mis. 2–4 jam idle), bukan angka tetap per kelas kota.

## Aksi yang disarankan
- CD: samakan target jam Lv150 (505 vs 720), putuskan penyetelan antar-stat (STR flat bonus), dan kaji HP/armor tier tinggi.
- WD: revisi `WD-4.13` (rasio C) dan tinjau kenaikan harga drop di dalam tier (income datar Lv1–30).
