import { useEffect, useState } from "react";
import {
  FEEDBACK_CATEGORIES,
  FEEDBACK_SEVERITIES,
  submitFeedback,
  trackSafeAnalyticsEvent,
} from "../lib/betaService.js";

const REPORT_CONTACT_MAILTO =
  "mailto:collectivedreamdatabase@gmail.com?subject=Collective%20Dream%20Observatory%20Report%20or%20Suggestion";

const COPY = {
  en: {
    button: "Feedback",
    title: "Send beta feedback",
    subtitle:
      "Report bugs, privacy concerns, translation issues, confusing UI, imports, or moderation problems.",
    category: "Category",
    severity: "Severity",
    message: "Message",
    messagePlaceholder: "Describe what happened. Please avoid pasting private dream text.",
    screenshot: "Private screenshot URL (optional)",
    screenshotHelp: "Screenshots are private unless you allow support access.",
    allowSupport: "Allow support team to view this screenshot",
    emailContact: "Email support instead",
    emailHelp: "For urgent privacy or account requests, you can also contact the support email directly.",
    submit: "Send feedback",
    close: "Close",
    sent: "Feedback sent. Thank you for helping the beta.",
    failed: "Feedback could not be sent. Try again later.",
    categoryLabels: {
      bug_report: "Bug report",
      privacy_concern: "Privacy concern",
      translation_issue: "Translation issue",
      feature_suggestion: "Feature suggestion",
      confusing_ui: "Confusing UI",
      import_problem: "Import problem",
      moderation_issue: "Moderation/reporting issue",
    },
    severityLabels: {
      low: "Low",
      medium: "Medium",
      high: "High",
      critical: "Critical",
    },
  },
  zh: {
    button: "回饋",
    title: "送出 Beta 回饋",
    subtitle: "回報錯誤、隱私疑慮、翻譯問題、介面不清楚、匯入或審核問題。",
    category: "類型",
    severity: "嚴重度",
    message: "內容",
    messagePlaceholder: "描述發生了什麼。請盡量不要貼上私人夢境原文。",
    screenshot: "私人截圖網址（選填）",
    screenshotHelp: "截圖預設為私人；只有你允許時支援團隊才可查看。",
    allowSupport: "允許支援團隊查看這張截圖",
    emailContact: "改用電子郵件聯絡",
    emailHelp: "若是緊急隱私或帳戶請求，也可以直接寄信給支援信箱。",
    submit: "送出回饋",
    close: "關閉",
    sent: "已送出回饋。謝謝你幫忙測試 Beta。",
    failed: "回饋暫時無法送出，請稍後再試。",
    categoryLabels: {
      bug_report: "錯誤回報",
      privacy_concern: "隱私疑慮",
      translation_issue: "翻譯問題",
      feature_suggestion: "功能建議",
      confusing_ui: "介面不清楚",
      import_problem: "匯入問題",
      moderation_issue: "審核／回報問題",
    },
    severityLabels: {
      low: "低",
      medium: "中",
      high: "高",
      critical: "嚴重",
    },
  },
  es: {
    button: "Feedback",
    title: "Enviar feedback beta",
    subtitle:
      "Reporta errores, privacidad, traducciones, UI confusa, importación o moderación.",
    category: "Categoría",
    severity: "Severidad",
    message: "Mensaje",
    messagePlaceholder: "Describe qué pasó. Evita pegar texto privado del sueño.",
    screenshot: "URL privada de captura (opcional)",
    screenshotHelp: "Las capturas son privadas salvo que permitas acceso de soporte.",
    allowSupport: "Permitir que soporte vea esta captura",
    emailContact: "Contactar por correo",
    emailHelp: "Para solicitudes urgentes de privacidad o cuenta, también puedes escribir directamente a soporte.",
    submit: "Enviar feedback",
    close: "Cerrar",
    sent: "Feedback enviado. Gracias por ayudar con la beta.",
    failed: "No se pudo enviar el feedback. Inténtalo más tarde.",
    categoryLabels: {
      bug_report: "Error",
      privacy_concern: "Privacidad",
      translation_issue: "Traducción",
      feature_suggestion: "Sugerencia",
      confusing_ui: "UI confusa",
      import_problem: "Importación",
      moderation_issue: "Moderación/reporte",
    },
    severityLabels: {
      low: "Baja",
      medium: "Media",
      high: "Alta",
      critical: "Crítica",
    },
  },
};

export default function FeedbackWidget({ currentUser = null, language = "zh" }) {
  const copy = COPY[language] || COPY.zh;
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("bug_report");
  const [severity, setSeverity] = useState("medium");
  const [message, setMessage] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [allowSupportAccess, setAllowSupportAccess] = useState(false);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    function handleOpenFeedback(event) {
      const detail = event.detail || {};
      if (FEEDBACK_CATEGORIES.includes(detail.category)) {
        setCategory(detail.category);
      }
      if (FEEDBACK_SEVERITIES.includes(detail.severity)) {
        setSeverity(detail.severity);
      }
      setOpen(true);
      trackSafeAnalyticsEvent("app_opened", {
        currentUser,
        language,
        metadata: { source: detail.source || "report_feedback_opened" },
      }).catch(() => {});
    }

    window.addEventListener("cdo:open-feedback", handleOpenFeedback);
    return () => window.removeEventListener("cdo:open-feedback", handleOpenFeedback);
  }, [currentUser, language]);

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setNotice("");

    try {
      await submitFeedback({
        currentUser,
        language,
        category,
        severity,
        message,
        screenshotUrl,
        allowSupportAccess,
      });
      setMessage("");
      setScreenshotUrl("");
      setAllowSupportAccess(false);
      setNotice(copy.sent);
    } catch {
      setNotice(copy.failed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 px-3 py-4 backdrop-blur sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="beta-feedback-title"
        >
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-xl rounded-3xl border border-fuchsia-300/20 bg-zinc-950 p-5 shadow-[0_0_60px_rgba(217,70,239,.16)] sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p
                  id="beta-feedback-title"
                  className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-fuchsia-100"
                >
                  {copy.title}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{copy.subtitle}</p>
                <a
                  href={REPORT_CONTACT_MAILTO}
                  className="mt-3 inline-flex rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-100 transition hover:border-cyan-300/45 hover:bg-cyan-300/15"
                >
                  {copy.emailContact}
                </a>
                <p className="mt-2 text-xs leading-5 text-slate-400">{copy.emailHelp}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 font-mono text-[10px] text-zinc-300"
              >
                {copy.close}
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                  {copy.category}
                </span>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-sm text-cyan-50"
                >
                  {FEEDBACK_CATEGORIES.map((item) => (
                    <option key={item} value={item}>
                      {copy.categoryLabels[item]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                  {copy.severity}
                </span>
                <select
                  value={severity}
                  onChange={(event) => setSeverity(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-sm text-cyan-50"
                >
                  {FEEDBACK_SEVERITIES.map((item) => (
                    <option key={item} value={item}>
                      {copy.severityLabels[item]}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="mt-4 block">
              <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                {copy.message}
              </span>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value.slice(0, 4000))}
                placeholder={copy.messagePlaceholder}
                className="min-h-32 w-full rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-sm leading-7 text-slate-200 outline-none focus:border-fuchsia-300/45"
              />
            </label>

            <label className="mt-4 block">
              <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                {copy.screenshot}
              </span>
              <input
                value={screenshotUrl}
                onChange={(event) => setScreenshotUrl(event.target.value.slice(0, 1200))}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-sm text-cyan-50"
              />
              <span className="mt-2 block text-xs leading-5 text-slate-400">
                {copy.screenshotHelp}
              </span>
            </label>

            <label className="mt-4 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={allowSupportAccess}
                onChange={(event) => setAllowSupportAccess(event.target.checked)}
                className="h-5 w-5 accent-fuchsia-300"
              />
              {copy.allowSupport}
            </label>

            {notice && (
              <p className="mt-4 rounded-xl border border-cyan-300/20 bg-cyan-300/5 p-3 text-sm leading-6 text-cyan-100">
                {notice}
              </p>
            )}

            <button
              type="submit"
              disabled={busy || message.trim().length < 4}
              className="mt-5 w-full rounded-2xl border border-fuchsia-300/35 bg-fuchsia-300 px-4 py-4 font-mono text-xs font-bold uppercase tracking-[0.18em] text-zinc-950 transition hover:bg-fuchsia-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? "..." : copy.submit}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
