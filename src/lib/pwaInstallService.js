import { isNativeAppShell } from "./nativeApp.js";

const INSTALL_DISMISSED_KEY = "cdo-pwa-install-dismissed-at";
const INSTALL_DISMISS_DAYS = 14;

export function isStandaloneDisplay() {
  if (typeof window === "undefined") return false;
  if (isNativeAppShell()) return true;

  return (
    window.matchMedia?.("(display-mode: standalone)")?.matches ||
    window.navigator.standalone === true
  );
}

export function isIosSafari() {
  if (typeof window === "undefined") return false;

  const ua = window.navigator.userAgent || "";
  const vendor = window.navigator.vendor || "";
  const iOS = /iphone|ipad|ipod/i.test(ua);
  const safari = /safari/i.test(ua) && /apple/i.test(vendor) && !/crios|fxios|edgios/i.test(ua);

  return iOS && safari;
}

export function shouldShowInstallPrompt() {
  if (typeof window === "undefined" || isNativeAppShell() || isStandaloneDisplay()) return false;

  const dismissedAt = Number(window.localStorage.getItem(INSTALL_DISMISSED_KEY) || 0);
  if (!Number.isFinite(dismissedAt) || dismissedAt <= 0) return true;

  return Date.now() - dismissedAt > INSTALL_DISMISS_DAYS * 24 * 60 * 60 * 1000;
}

export function markInstallPromptDismissed() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(INSTALL_DISMISSED_KEY, String(Date.now()));
}

export function getInstallInstructions(language = "zh") {
  if (language === "es") {
    return {
      ios: "Abre el sitio en Safari, toca Compartir y elige Añadir a pantalla de inicio.",
      desktop: "Usa el botón de instalación del navegador o el menú del navegador.",
    };
  }

  if (language === "zh") {
    return {
      ios: "請用 Safari 開啟，點分享，然後選擇加入主畫面。",
      desktop: "請使用瀏覽器的安裝按鈕，或從瀏覽器選單安裝。",
    };
  }

  return {
    ios: "Open in Safari, tap Share, then Add to Home Screen.",
    desktop: "Use the browser install button or browser menu.",
  };
}
