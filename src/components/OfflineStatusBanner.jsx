import { useEffect, useState } from "react";

const OFFLINE_COPY = {
  en: {
    offline:
      "You are offline. Dream drafts can be saved on this device and uploaded later.",
    online: "Back online. You can upload saved drafts.",
  },
  zh: {
    offline: "你目前離線。夢境草稿可以先儲存在此裝置，之後再上傳。",
    online: "已重新連線。你可以上傳已儲存的草稿。",
  },
  es: {
    offline:
      "Estás sin conexión. Los borradores pueden guardarse en este dispositivo y subirse después.",
    online: "Conexión restaurada. Puedes subir los borradores guardados.",
  },
};

export default function OfflineStatusBanner({ language = "zh" }) {
  const copy = OFFLINE_COPY[language] || OFFLINE_COPY.zh;
  const [online, setOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine
  );
  const [recentlyOnline, setRecentlyOnline] = useState(false);

  useEffect(() => {
    function handleOnline() {
      setOnline(true);
      setRecentlyOnline(true);
      window.setTimeout(() => setRecentlyOnline(false), 5200);
    }

    function handleOffline() {
      setOnline(false);
      setRecentlyOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (online && !recentlyOnline) return null;

  return (
    <div className="fixed left-1/2 top-[calc(env(safe-area-inset-top)+.75rem)] z-[63] w-[min(42rem,calc(100vw-1.5rem))] -translate-x-1/2 rounded-2xl border border-cyan-300/25 bg-zinc-950/92 px-4 py-3 text-center font-mono text-[10px] font-bold uppercase leading-5 tracking-[0.12em] text-cyan-100 shadow-[0_0_32px_rgba(34,211,238,.16)] backdrop-blur">
      {online ? copy.online : copy.offline}
    </div>
  );
}
