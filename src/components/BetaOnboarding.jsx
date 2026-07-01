import { useState } from "react";
import { markBetaOnboardingComplete } from "../lib/betaService.js";

const COPY = {
  en: {
    eyebrow: "Early beta",
    title: "Choose how your dreams can contribute.",
    intro: "You do not need to publish your dreams to help collective dream research.",
    points: [
      "Dreams can stay private by default.",
      "Anonymous statistics can help without publishing text.",
      "Please report bugs, privacy concerns, or confusing UI.",
      "Dream tags and statistics are not diagnosis.",
      "You can delete, export, or unpublish your dreams.",
    ],
    private: "Keep everything private",
    stats: "Recommended: contribute anonymous statistics",
    choose: "Let me choose dream by dream",
    continue: "Continue",
  },
  zh: {
    eyebrow: "早期 Beta",
    title: "選擇你的夢如何參與。",
    intro: "你不需要公開夢境文字，也能幫助集體夢境研究。",
    points: [
      "夢境可以預設保持私人。",
      "匿名統計可以協助研究，而不公開文字。",
      "請回報錯誤、隱私疑慮或不清楚的介面。",
      "夢境標籤與統計不是診斷。",
      "你可以刪除、匯出或取消公開自己的夢。",
    ],
    private: "全部保持私人",
    stats: "推薦：匿名公開文字與統計",
    choose: "每則夢各自選擇",
    continue: "繼續",
  },
  es: {
    eyebrow: "Beta temprana",
    title: "Elige cómo pueden contribuir tus sueños.",
    intro: "No necesitas publicar tus sueños para ayudar a la investigación colectiva.",
    points: [
      "Los sueños pueden permanecer privados por defecto.",
      "Las estadísticas anónimas ayudan sin publicar el texto.",
      "Reporta errores, privacidad o UI confusa.",
      "Las etiquetas y estadísticas no son diagnóstico.",
      "Puedes borrar, exportar o dejar de publicar tus sueños.",
    ],
    private: "Mantener todo privado",
    stats: "Recomendado: contribuir estadísticas anónimas",
    choose: "Elegir sueño por sueño",
    continue: "Continuar",
  },
};

export default function BetaOnboarding({
  language = "zh",
  currentUser,
  onDone = () => {},
}) {
  const copy = COPY[language] || COPY.zh;
  const [choice, setChoice] = useState("anonymous_public");
  const [busy, setBusy] = useState(false);

  async function handleContinue() {
    setBusy(true);
    try {
      await markBetaOnboardingComplete(currentUser, choice);
      onDone(choice);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[85] flex items-end justify-center bg-black/70 px-3 py-4 backdrop-blur sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="beta-onboarding-title"
    >
      <section className="w-full max-w-2xl rounded-[2rem] border border-cyan-300/20 bg-zinc-950 p-5 text-zinc-100 shadow-[0_0_80px_rgba(34,211,238,.14)] sm:p-7">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-200">
          {copy.eyebrow}
        </p>
        <h2
          id="beta-onboarding-title"
          className="mt-3 text-2xl font-bold leading-tight text-zinc-50 sm:text-3xl"
        >
          {copy.title}
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-300">{copy.intro}</p>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            ["private", copy.private],
            ["anonymous_public", copy.stats],
            ["dream_by_dream", copy.choose],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setChoice(value)}
              className={[
                "min-h-24 rounded-2xl border px-4 py-4 text-left text-sm font-semibold leading-6 transition",
                choice === value
                  ? "border-cyan-200 bg-cyan-200 text-slate-950"
                  : "border-white/10 bg-white/[0.04] text-slate-200 hover:border-cyan-300/40",
              ].join(" ")}
            >
              {label}
            </button>
          ))}
        </div>

        <ul className="mt-5 grid gap-2 text-sm leading-6 text-slate-300 sm:grid-cols-2">
          {copy.points.map((point) => (
            <li key={point} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              {point}
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={handleContinue}
          disabled={busy}
          className="mt-6 w-full rounded-2xl bg-cyan-200 px-4 py-4 font-mono text-xs font-bold uppercase tracking-[0.18em] text-slate-950 transition hover:bg-cyan-100 disabled:opacity-60"
        >
          {busy ? "..." : copy.continue}
        </button>
      </section>
    </div>
  );
}
