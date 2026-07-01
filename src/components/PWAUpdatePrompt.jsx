import { isNativeAppShell } from "../lib/nativeApp.js";

const UPDATE_COPY = {
  en: {
    title: "A new version is available.",
    text: "Current dream text will be saved locally before updating.",
    update: "Update now",
    later: "Later",
  },
  zh: {
    title: "有新版本可用。",
    text: "更新前會先嘗試把目前夢境草稿存到本機。",
    update: "立即更新",
    later: "稍後",
  },
  es: {
    title: "Hay una nueva versión disponible.",
    text: "Antes de actualizar se guardará el borrador actual en este dispositivo.",
    update: "Actualizar ahora",
    later: "Luego",
  },
};

export default function PWAUpdatePrompt({
  language = "zh",
  visible = false,
  onUpdate = () => {},
  onDismiss = () => {},
}) {
  const copy = UPDATE_COPY[language] || UPDATE_COPY.zh;

  if (!visible || isNativeAppShell()) return null;

  return (
    <aside className="fixed left-1/2 top-[calc(env(safe-area-inset-top)+.75rem)] z-[64] w-[min(34rem,calc(100vw-1.5rem))] -translate-x-1/2 rounded-2xl border border-fuchsia-300/25 bg-zinc-950/92 p-4 text-zinc-100 shadow-[0_0_38px_rgba(217,70,239,.18)] backdrop-blur">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-fuchsia-100">
            {copy.title}
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-300">{copy.text}</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={onUpdate}
            className="rounded-xl border border-cyan-300/35 bg-cyan-300 px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-950 transition hover:bg-cyan-200"
          >
            {copy.update}
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-200 transition hover:border-fuchsia-300/35 hover:text-fuchsia-100"
          >
            {copy.later}
          </button>
        </div>
      </div>
    </aside>
  );
}
