import { useState } from "react";
import {
  redeemBetaInviteCode,
  trackSafeAnalyticsEvent,
} from "../lib/betaService.js";

const COPY = {
  en: {
    eyebrow: "Closed beta",
    title: "Collective Dream Observatory is in invite-only beta.",
    text:
      "Public trust pages stay open, but the app workspace currently needs a beta invite.",
    signInRequired: "Sign in first, then enter your invite code.",
    codeLabel: "Invite code",
    codePlaceholder: "ENTER-CODE",
    redeem: "Unlock beta access",
    account: "Account / Sign in",
    privacy: "Privacy Policy",
    terms: "Terms",
    guidelines: "Community Guidelines",
    support: "Support",
    success: "Beta access unlocked. Welcome in.",
    failed: "This invite could not be verified.",
  },
  zh: {
    eyebrow: "封閉 Beta",
    title: "集體夢境觀測站目前為邀請制測試。",
    text: "隱私政策、條款與支援頁面仍可公開閱讀；進入 app 工作區需要 Beta 邀請。",
    signInRequired: "請先登入，再輸入邀請碼。",
    codeLabel: "邀請碼",
    codePlaceholder: "輸入邀請碼",
    redeem: "解鎖 Beta 存取",
    account: "帳戶／登入",
    privacy: "隱私政策",
    terms: "服務條款",
    guidelines: "社群規範",
    support: "支援",
    success: "Beta 存取已解鎖。歡迎進入。",
    failed: "無法驗證此邀請碼。",
  },
  es: {
    eyebrow: "Beta cerrada",
    title: "El Observatorio Colectivo de Sueños está en beta con invitación.",
    text:
      "Las páginas públicas de confianza siguen abiertas, pero el espacio de la app requiere invitación beta.",
    signInRequired: "Inicia sesión primero y luego introduce tu código.",
    codeLabel: "Código de invitación",
    codePlaceholder: "INTRODUCIR-CÓDIGO",
    redeem: "Desbloquear beta",
    account: "Cuenta / iniciar sesión",
    privacy: "Privacidad",
    terms: "Términos",
    guidelines: "Normas comunitarias",
    support: "Soporte",
    success: "Acceso beta desbloqueado. Bienvenido.",
    failed: "No se pudo verificar esta invitación.",
  },
};

export default function BetaGate({
  language = "zh",
  currentUser = null,
  onOpenAuth = () => {},
  onRedeemed = () => {},
}) {
  const copy = COPY[language] || COPY.zh;
  const [inviteCode, setInviteCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  async function handleRedeem(event) {
    event.preventDefault();
    if (!currentUser?.uid) {
      setNotice(copy.signInRequired);
      onOpenAuth();
      return;
    }

    setBusy(true);
    setNotice("");
    try {
      await redeemBetaInviteCode(currentUser, inviteCode);
      await trackSafeAnalyticsEvent("app_opened", {
        currentUser,
        language,
        metadata: { source: "beta_invite_redeemed" },
      });
      setNotice(copy.success);
      onRedeemed();
    } catch {
      setNotice(copy.failed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#030407] px-4 py-24 text-zinc-100">
      <section className="mx-auto grid w-full max-w-5xl gap-6 rounded-[2rem] border border-cyan-300/20 bg-zinc-950/80 p-6 shadow-[0_0_80px_rgba(34,211,238,.12)] sm:p-8 lg:grid-cols-[1.05fr_.95fr] lg:gap-8">
        <div className="space-y-5">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.32em] text-cyan-200">
            {copy.eyebrow}
          </p>
          <h1 className="max-w-2xl text-3xl font-bold leading-tight text-zinc-50 sm:text-4xl">
            {copy.title}
          </h1>
          <p className="max-w-2xl text-base leading-8 text-slate-300">{copy.text}</p>
          <div className="flex flex-wrap gap-3 pt-2">
            {[
              [copy.privacy, "/privacy"],
              [copy.terms, "/terms"],
              [copy.guidelines, "/community-guidelines"],
              [copy.support, "/support"],
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-100 hover:border-cyan-300/40"
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        <form
          onSubmit={handleRedeem}
          className="rounded-3xl border border-white/10 bg-black/35 p-5 sm:p-6"
        >
          {!currentUser?.uid && (
            <button
              type="button"
              onClick={onOpenAuth}
              className="mb-4 w-full rounded-2xl border border-fuchsia-300/30 bg-fuchsia-300/10 px-4 py-4 font-mono text-xs font-bold uppercase tracking-[0.2em] text-fuchsia-100"
            >
              {copy.account}
            </button>
          )}

          <label className="block">
            <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              {copy.codeLabel}
            </span>
            <input
              value={inviteCode}
              onChange={(event) => setInviteCode(event.target.value.slice(0, 80))}
              placeholder={copy.codePlaceholder}
              className="w-full rounded-2xl border border-cyan-300/20 bg-black/50 px-4 py-4 font-mono text-sm uppercase tracking-[0.18em] text-cyan-50 outline-none focus:border-cyan-200"
            />
          </label>

          {notice && (
            <p className="mt-4 rounded-2xl border border-cyan-300/20 bg-cyan-300/5 p-3 text-sm leading-6 text-cyan-100">
              {notice}
            </p>
          )}

          <button
            type="submit"
            disabled={busy || !inviteCode.trim()}
            className="mt-5 w-full rounded-2xl bg-cyan-200 px-4 py-4 font-mono text-xs font-bold uppercase tracking-[0.18em] text-slate-950 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "..." : copy.redeem}
          </button>
        </form>
      </section>
    </main>
  );
}
