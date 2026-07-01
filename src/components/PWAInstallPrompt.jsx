import { useEffect, useState } from "react";
import {
  getInstallInstructions,
  isIosSafari,
  isStandaloneDisplay,
  markInstallPromptDismissed,
} from "../lib/pwaInstallService.js";
import { trackSafeAnalyticsEvent } from "../lib/betaService.js";

const INSTALL_COPY = {
  en: {
    title: "Install Dream Observatory",
    install: "Install app",
    dismiss: "Later",
    installed: "Installed",
    privacy: "Private drafts stay on this device until you upload them.",
  },
  zh: {
    title: "安裝夢境觀測站",
    install: "安裝 App",
    dismiss: "稍後",
    installed: "已安裝",
    privacy: "本機草稿會留在此裝置，直到你選擇上傳。",
  },
  es: {
    title: "Instalar Dream Observatory",
    install: "Instalar app",
    dismiss: "Luego",
    installed: "Instalada",
    privacy: "Los borradores privados se quedan en este dispositivo hasta que los subas.",
  },
};

export default function PWAInstallPrompt({ language = "zh" }) {
  const copy = INSTALL_COPY[language] || INSTALL_COPY.zh;
  const instructions = getInstallInstructions(language);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (isStandaloneDisplay()) return undefined;

    function handleBeforeInstallPrompt(event) {
      event.preventDefault();
      setDeferredPrompt(event);
    }

    function handleInstalled() {
      setInstalled(true);
      setVisible(false);
      markInstallPromptDismissed();
      trackSafeAnalyticsEvent("pwa_installed", { language }).catch(() => {});
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  if (installed || isStandaloneDisplay()) return null;

  const manualInstruction = isIosSafari() ? instructions.ios : instructions.desktop;

  async function handleInstall() {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice.catch(() => null);
    if (choice?.outcome === "accepted") {
      trackSafeAnalyticsEvent("pwa_installed", { language }).catch(() => {});
    }
    setDeferredPrompt(null);
    markInstallPromptDismissed();
    setVisible(false);
  }

  function handleDismiss() {
    markInstallPromptDismissed();
    setVisible(false);
  }

  if (!visible) {
    return (
      <button
        type="button"
        onClick={() => setVisible(true)}
        className="fixed bottom-[calc(env(safe-area-inset-bottom)+4.75rem)] right-3 z-[61] rounded-full border border-cyan-300/25 bg-zinc-950/90 px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,.16)] backdrop-blur transition hover:border-cyan-300/45 hover:bg-cyan-300/10 sm:bottom-4 sm:right-4"
      >
        {copy.install}
      </button>
    );
  }

  return (
    <aside className="fixed bottom-[calc(env(safe-area-inset-bottom)+4.75rem)] right-3 z-[62] w-[min(22rem,calc(100vw-1.5rem))] rounded-2xl border border-cyan-300/25 bg-zinc-950/92 p-4 text-zinc-100 shadow-[0_0_38px_rgba(34,211,238,.18)] backdrop-blur sm:bottom-4 sm:right-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-100">
            {copy.title}
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-300">
            {deferredPrompt ? copy.privacy : manualInstruction}
          </p>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 font-mono text-[10px] text-zinc-300 hover:border-cyan-300/30 hover:text-cyan-100"
          aria-label={copy.dismiss}
        >
          x
        </button>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {deferredPrompt && (
          <button
            type="button"
            onClick={handleInstall}
            className="rounded-xl border border-cyan-300/35 bg-cyan-300 px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-950 transition hover:bg-cyan-200"
          >
            {copy.install}
          </button>
        )}
        <button
          type="button"
          onClick={handleDismiss}
          className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-200 transition hover:border-cyan-300/35 hover:text-cyan-100"
        >
          {copy.dismiss}
        </button>
      </div>
    </aside>
  );
}
