# Panduan Packaging Capacitor APK — Battle-Smith RPG (Oppo A54 Portrait)

Aplikasi web di folder `app/` sudah 100% offline (tanpa CDN, 16 Area lazy-load terpisah, asset `.webp` & `.ogg` total ~58 KB, 0 `backdrop-filter: blur()`, serta tombol Back Android & Lite Mode Oppo A54).

## 1. Prasyarat di Laptop (ASUS ROG GL553VD)
- **Node.js 20+ / 22+**
- **Android Studio** (termasuk Android SDK & JDK 17+)

## 2. Langkah Build APK (Debug / Release)
Jalankan dari root repositori `gameindes/`:

```bash
# 1. Instal dependensi Capacitor
npm install

# 2. Verifikasi pre-flight offline & asset
npm run verify:capacitor

# 3. Tambahkan platform Android (hanya sekali di awal)
npm run cap:add:android

# 4. Sinkronisasi folder app/ ke proyek Android
npm run cap:sync

# 5. Buka di Android Studio untuk Build APK / uji di Oppo A54
npm run cap:open
```

## 3. Kunci Orientasi Portrait untuk Oppo A54
Setelah `npm run cap:add:android`, buka `android/app/src/main/AndroidManifest.xml` dan tambahkan `android:screenOrientation="portrait"` pada tag `<activity android:name=".MainActivity" ...>`:

```xml
<activity
    android:name=".MainActivity"
    android:screenOrientation="portrait"
    android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
    android:exported="true">
```

## 4. Build APK Langsung via Gradle (Opsional CLI)
```bash
cd android
./gradlew assembleDebug
# Output: android/app/build/outputs/apk/debug/app-debug.apk
```

## 5. Checklist Performa Oppo A54
- Strict 1-Area lazy-load (`app/dist/areas/*.js`), RAM target **< 150 MB**.
- Sparse JSON Save tersimpan di `localStorage` Android WebView (**< 15 KB**).
- Jika ingin hemat baterai/GPU ekstra, aktifkan **🌿 Lite Mode** di modal `⚙️ UI & Save`.
