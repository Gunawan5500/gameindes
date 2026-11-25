/**
 * Battle-Smith RPG — Fase 5 Capacitor Android Bridge (Zero-Dependency Safe)
 * Menangani tombol Back perangkat keras Android (tutup modal/drawer lebih dulu)
 * dan deteksi lingkungan Capacitor APK tanpa error di browser biasa.
 */
(function (global) {
  "use strict";

  function isNativeCapacitor() {
    try {
      return Boolean(global.Capacitor && typeof global.Capacitor.isNativePlatform === "function" && global.Capacitor.isNativePlatform());
    } catch (_) {
      return false;
    }
  }

  function registerBackHandler(onBack) {
    if (typeof onBack !== "function") return;
    try {
      const capApp = global.Capacitor?.Plugins?.App;
      if (capApp && typeof capApp.addListener === "function") {
        capApp.addListener("backButton", ({ canGoBack }) => {
          const handled = onBack();
          if (!handled && !canGoBack && typeof capApp.exitApp === "function") {
            capApp.exitApp();
          }
        });
      }
    } catch (_) {
      // Aman di mode browser / offline HTML preview
    }
  }

  global.BSRPG_CAPACITOR = {
    isNativeCapacitor,
    registerBackHandler,
    platform: isNativeCapacitor() ? (global.Capacitor.getPlatform?.() || "android") : "web"
  };
})(typeof window !== "undefined" ? window : globalThis);
