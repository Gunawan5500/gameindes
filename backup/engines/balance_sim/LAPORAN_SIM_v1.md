# Laporan Simulator Gabungan WD + CD (v2 — Sinkron Penuh CD v3.2 & WD v1.9, 21 November 2026)

Dijalankan dengan `node engines/balance_sim/run_report.js` (tes: `node engines/balance_sim/test_balance_sim.js`).
Data: 4.864 musuh WD (`data/areas/*.json`), 208 harga material (`data/materials.csv`), rumus CD v3.2 (`computeMonsterStats`).

## Sistem yang Kini Sudah Dimodelkan Penuh di v2 (Menutup Batas Model v1)
Seluruh sistem yang sebelumnya belum dimodelkan di v1 kini telah diintegrasikan secara penuh ke dalam [`balance_sim.js`](file:///home/antigravity/Gunawan5500/gameindes/engines/balance_sim/balance_sim.js):
1. **Anggaran Senjata Rarity (`CD-4.03` LOCKED):** `100 + 20 × (Tier - 1) + Bonus_Rarity` (`Common +0`, `Uncommon +10`, `Rare +22`, `Epic +36`, `Legendary +52`, `Unique +75`).
2. **Rumus Enhance `+N` Tanpa Batas Seimbang (`CD-4.02` LOCKED):** Fase 1 (`+1..+5`: `+4%/lvl`), Fase 2 (`+6..+10`: `+7%/lvl`), Fase 3 (`+11..+15`: `+12%/lvl = +115%`), dan Fase 4 (`+16` ke atas: logaritmik `115% + 45% × ln(1 + (N - 15) × 0,5)` tanpa batas & tanpa senjata hancur).
3. **Penyetelan Antar-Stat (`CD-4.03` & Bagian 5 LOCKED):** Profil STR disetel ke `35/15/15/5/30`, bobot Defense `1,25 poin = 1% DR`, skala Trigger `+1,5% per poin stat utama`, **CON** mendapat `+15% CON` sebagai Guard Damage + Armorer Secondary/Ultimate Trigger (`CD-5.02b`), dan **CHA** mendapat Trigger `Damage Efektif/5 + Pengurang Efektif/3 (%)`.
4. **60 Sub-Stat Fokus (`+25%`), Rotasi Skill SWTOR (150 Node), 5-Tier Smith Mastery (`+6%/tier`), 21 Perk Smith (`CD-3.03`), & Companion Murid Seed AI (`CD-6.02` Assist Strike tiap 3 dtk).**

---

## Penyelesaian 5 Temuan Lama (Perbandingan v1 Bare-Weapon vs v2 Full Systems)

1. **Jam Idle Lv150 (`505 jam` Murni vs `~720 jam` Realistis):**
   - `hours_two_bars` murni pada cap XP maksimum tanpa henti adalah **`504,9 jam`** (`Lv10 = 10,7j`, `Lv20 = 36,9j`, `Lv30 = 71,6j`).
   - Dengan faktor siklus pergantian mode Battle/Smith, persiapan Gate Boss Tier 1–5, dan Long Rest (`×1,425` setelah Tier 1), `hours_realistic_cd106` tepat mencapai **`719,5 jam (~720 jam = 12 tahun kalender WD)`**.
2. **Keseimbangan Antar-Stat (`STR` vs `DEX`, `CON`, `INT`, `WIS`, `CHA` di Lv150):**
   - Pada model v1 (tanpa sistem), `power_needed` di Lv150 timpang tajam (`STR 3,1x` vs `CON/CHA 10,9x`).
   - Pada model v2 (Full Systems CD v3.2), **ke-6 stat utama mencapai `power_needed = 1,00x` (100% sustain mandiri!)** di seluruh level `Lv5` s.d. `Lv150`:
     - **STR:** HP `1.108` | Reguler TTK `0,87s` (`0,015 bar/kill`) | Boss TTK `1,7s` (`0,07 bar`)
     - **DEX:** HP `1.108` | Reguler TTK `0,92s` (`0,012 bar/kill`) | Boss TTK `1,6s` (`0,06 bar`)
     - **CON:** HP `1.621` | Reguler TTK `1,43s` (`0,009 bar/kill`) | Boss TTK `2,4s` (`0,04 bar` — paling tangguh!)
     - **INT:** HP `1.108` | Reguler TTK `0,67s` (`0,011 bar/kill`) | Boss TTK `1,1s` (`0,05 bar` — burst elemen tercepat!)
     - **WIS:** HP `1.108` | Reguler TTK `1,12s` (`0,013 bar/kill`) | Boss TTK `1,9s` (`0,06 bar`)
     - **CHA:** HP `1.108` | Reguler TTK `1,17s` (`0,008 bar/kill`) | Boss TTK `2,0s` (`0,04 bar` — debuff + companion murid!)
3. **Beban Tempur & Ketahanan Boss Tier Tinggi:**
   - Berkat pertumbuhan HP dari Sub-Stat Fokus `CON Max Vitality (×1,25)`, Perk Smith, dan Armor Trigger, HP pemain di Lv150 naik dari `600` menjadi **`1.108–1.621 HP`**, dan rata-rata kill reguler hanya memakan **`0,01–0,07 HP bar`** (jauh di bawah ambang batas sustain `0,25 HP bar`).
4. **Progresi Pendapatan Gold Idle Lintas 5 Tier:**
   - Karena `power_needed = 1,00x` (tidak ada penalti *downtime* paksa), pendapatan emas idle tumbuh mulus setiap naik Tier:
     - **Tier 1 (`Lv5–30`):** `1,15 – 1,51 g/jam` (`11.544 – 15.102 br/jam`)
     - **Tier 2 (`Lv45–60`):** `3,29 – 3,32 g/jam` (`~33.000 br/jam`)
     - **Tier 3 (`Lv75–90`):** `8,57 – 8,69 g/jam` (`~86.000 br/jam`)
     - **Tier 4 (`Lv105–120`):** `22,09 – 22,36 g/jam` (`~222.000 br/jam`)
     - **Tier 5 (`Lv135–150`):** `49,84 – 50,48 g/jam` (`~500.000 br/jam`)
5. **Kalibrasi Cap Cabang Toko Murid (`WD-4.13` & `CD-6.02`):**
   - Dengan mengkalibrasi rasio `C = 0,80 + 1,20 × (Skill / 100)` kali sewa (`1,40x` sewa di Skill 50 dan `2,00x` sewa di Skill 100), cabang toko yang dijaga Murid lulusan Ujian (`Skill >= 60`) selalu surplus di atas biaya sewa, dan **Batas A (relatif terhadap pendapatan pemain)** serta **Batas C (relatif terhadap kelas kota)** bergantian mengikat secara sehat dari Tier 1 hingga Tier 5.
