import { useMemo, useState } from "react";
import {
  PRIVACY_ONBOARDING_CHOICES,
  normalizePrivacyOnboardingChoice,
} from "../lib/privacyDefaults.js";
import LanguageMenu from "./LanguageMenu.jsx";

const ONBOARDING_COPY = {
  en: {
    languageLabel: "Switch interface language",
    englishLabel: "English interface",
    chineseLabel: "Traditional Chinese interface",
    spanishLabel: "Spanish interface",
    eyebrow: "Account privacy setup",
    title: "Choose how your dreams can contribute.",
    subtitle: "You do not need to publish your dreams to help collective dream research.",
    recommended: "Recommended",
    defaultLabel: "Default",
    continueButton: "Save and continue",
    saving: "Saving...",
    options: {
      private: {
        title: "Keep everything private",
        text: "Future dreams stay private and out of research statistics unless you change one later.",
      },
      stats_only: {
        title: "Keep text private, contribute anonymous statistics",
        text: "Dream words stay private while tags and non-identifying signals help the collective patterns.",
      },
      dream_by_dream: {
        title: "Let me choose dream by dream",
        text: "Keep the privacy-first default, then decide separately when recording or editing.",
      },
    },
    reassurance: [
      "Your dream text will not be public in stats-only mode.",
      "You can change this later.",
      "You can exclude any dream.",
      "You can delete, export, or unpublish your dreams.",
    ],
  },
  zh: {
    languageLabel: "切換介面語言",
    englishLabel: "英文介面",
    chineseLabel: "繁體中文介面",
    spanishLabel: "西班牙文介面",
    eyebrow: "帳戶隱私設定",
    title: "選擇你的夢如何貢獻。",
    subtitle: "你不需要公開夢境，也能幫助集體夢境研究。",
    recommended: "建議",
    defaultLabel: "預設",
    continueButton: "儲存並繼續",
    saving: "儲存中...",
    options: {
      private: {
        title: "全部保持私人",
        text: "未來夢境會保持私人，也不加入研究統計，除非你之後單獨變更。",
      },
      stats_only: {
        title: "文字保持私人，貢獻匿名統計",
        text: "夢境文字不公開，只讓標籤與非識別訊號加入集體模式。",
      },
      dream_by_dream: {
        title: "每則夢境再決定",
        text: "先維持隱私優先預設，之後在記錄或編輯時逐則選擇。",
      },
    },
    reassurance: [
      "僅供統計模式不會公開夢境文字。",
      "你之後可以修改此設定。",
      "任何夢境都可以排除。",
      "你可以刪除、匯出或取消公開夢境。",
    ],
  },
  es: {
    languageLabel: "Cambiar idioma de la interfaz",
    englishLabel: "Interfaz en inglés",
    chineseLabel: "Interfaz en chino tradicional",
    spanishLabel: "Interfaz en español",
    eyebrow: "Configuración de privacidad",
    title: "Elige cómo pueden contribuir tus sueños.",
    subtitle: "No necesitas publicar tus sueños para ayudar a la investigación colectiva.",
    recommended: "Recomendado",
    defaultLabel: "Predeterminado",
    continueButton: "Guardar y continuar",
    saving: "Guardando...",
    options: {
      private: {
        title: "Mantener todo privado",
        text: "Los sueños futuros quedan privados y fuera de estadísticas salvo que cambies uno después.",
      },
      stats_only: {
        title: "Texto privado, estadísticas anónimas",
        text: "El texto queda privado; etiquetas y señales no identificables ayudan a ver patrones.",
      },
      dream_by_dream: {
        title: "Elegir sueño por sueño",
        text: "Mantén el valor privado por defecto y decide aparte al registrar o editar.",
      },
    },
    reassurance: [
      "Tu texto no será público en modo solo estadísticas.",
      "Puedes cambiar esto después.",
      "Puedes excluir cualquier sueño.",
      "Puedes eliminar, exportar o quitar de público tus sueños.",
    ],
  },
};

const OPTION_ORDER = [
  PRIVACY_ONBOARDING_CHOICES.PRIVATE,
  PRIVACY_ONBOARDING_CHOICES.STATS_ONLY,
  PRIVACY_ONBOARDING_CHOICES.DREAM_BY_DREAM,
];

export default function PrivacyOnboardingScreen({
  language = "zh",
  setLanguage = () => {},
  onComplete,
  saving = false,
  error = "",
}) {
  const copy = ONBOARDING_COPY[language] || ONBOARDING_COPY.zh;
  const [choice, setChoice] = useState(PRIVACY_ONBOARDING_CHOICES.PRIVATE);
  const selectedChoice = normalizePrivacyOnboardingChoice(choice);
  const options = useMemo(
    () =>
      OPTION_ORDER.map((value) => ({
        value,
        ...copy.options[value],
        recommended: value === PRIVACY_ONBOARDING_CHOICES.STATS_ONLY,
        defaultChoice: value === PRIVACY_ONBOARDING_CHOICES.PRIVATE,
      })),
    [copy]
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030407] px-3 py-5 text-zinc-100 selection:bg-cyan-300/30 selection:text-cyan-50 sm:px-6 sm:py-8">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-20rem] h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute bottom-[-16rem] right-[-12rem] h-[34rem] w-[34rem] rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] bg-[size:44px_44px]" />
      </div>

      <section className="relative mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-5xl flex-col justify-center">
        <div className="mb-4 flex justify-end">
          <LanguageMenu language={language} setLanguage={setLanguage} copy={copy} />
        </div>

        <div className="rounded-3xl border border-cyan-300/20 bg-zinc-950/75 p-5 shadow-terminal backdrop-blur sm:p-8">
          <div className="grid gap-7 lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)] lg:items-start">
            <div>
              <p className="cdo-kicker">{copy.eyebrow}</p>
              <h1 className="mt-4 text-3xl font-semibold leading-tight text-zinc-50 sm:text-5xl">
                {copy.title}
              </h1>
              <p className="cdo-body-copy mt-5 max-w-xl text-base">
                {copy.subtitle}
              </p>
              <div className="mt-6 grid gap-2">
                {copy.reassurance.map((item) => (
                  <p
                    key={item}
                    className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm leading-relaxed text-zinc-300"
                  >
                    {item}
                  </p>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {options.map((option) => {
                const active = selectedChoice === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setChoice(option.value)}
                    className={[
                      "w-full rounded-2xl border p-4 text-left transition sm:p-5",
                      active
                        ? "border-cyan-300/55 bg-cyan-300/10 shadow-[0_0_30px_rgba(34,211,238,.14)]"
                        : option.recommended
                          ? "border-emerald-300/30 bg-emerald-300/10 hover:border-emerald-300/50"
                          : "border-white/10 bg-black/25 hover:border-cyan-300/35",
                    ].join(" ")}
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <h2 className="text-lg font-semibold leading-snug text-zinc-50">
                        {option.title}
                      </h2>
                      <div className="flex shrink-0 flex-wrap gap-2">
                        {option.defaultChoice && (
                          <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-cyan-100">
                            {copy.defaultLabel}
                          </span>
                        )}
                        {option.recommended && (
                          <span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-emerald-100">
                            {copy.recommended}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-300">
                      {option.text}
                    </p>
                  </button>
                );
              })}

              {error && (
                <p className="rounded-2xl border border-red-300/25 bg-red-400/10 p-4 text-sm leading-relaxed text-red-100">
                  {error}
                </p>
              )}

              <button
                type="button"
                onClick={() => onComplete?.(selectedChoice)}
                disabled={saving}
                className="mt-2 w-full rounded-2xl border border-cyan-300/35 bg-cyan-300 px-5 py-4 font-mono text-xs font-bold uppercase tracking-[0.14em] text-zinc-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? copy.saving : copy.continueButton}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
