import { useEffect, useMemo, useState } from "react";
import {
  clearLocalDraftsForAccount,
  deleteAccountAndData,
  deleteAllOwnedDreams,
  fetchConsentHistory,
  requestAccountDeletion,
} from "../lib/dataRightsService.js";
import {
  fetchModerationReports,
  MODERATION_STATUSES,
  updateModerationReportStatus,
} from "../lib/moderationService.js";
import { trackSafeAnalyticsEvent } from "../lib/betaService.js";

const COPY = {
  en: {
    title: "Account & Trust Center",
    subtitle:
      "Export, delete, review consent history, clear local drafts, and help keep the public archive safe.",
    dataRights: "Account and data rights",
    dataRightsText:
      "Your private dream records remain owner-controlled. Export before destructive actions.",
    clearDrafts: "Clear local offline drafts",
    deleteAll: "Delete all dreams",
    deleteAccount: "Delete account",
    requestDeletion: "Request account deletion",
    consentHistory: "Consent history",
    loadConsent: "View consent history",
    noConsent: "No consent events recorded yet.",
    moderation: "Admin moderation dashboard",
    moderationText: "Review user reports and set public moderation status.",
    loadReports: "Load reports",
    noReports: "No reports in the queue.",
    status: "Status",
    applyStatus: "Update status",
    reason: "Reason",
    record: "Record",
    reporter: "Reporter",
    confirmDeleteAll:
      "Delete all of your dream records? This removes private records, public mirrors, and research signals.",
    confirmDeleteAccount:
      "Delete this account and its dream data? Export your data first. You may need to sign in again if Firebase asks for recent login.",
    confirmClearDrafts: "Clear offline drafts stored on this device?",
    deletedAll: ({ deleted, failed }) =>
      `Deleted ${deleted} dreams. ${failed} failed.`,
    draftsCleared: "Local offline drafts cleared.",
    deletionRequested: "Account deletion request created.",
    accountDeleted: "Account deletion completed.",
    recentLoginNeeded:
      "Firebase requires a recent login before deleting the auth account. Your deletion request was recorded.",
    adminOnly: "Visible only to admin profiles.",
    expand: "Expand",
    collapse: "Collapse",
  },
  zh: {
    title: "帳戶與信任中心",
    subtitle: "匯出、刪除、檢視同意紀錄、清除本機草稿，並協助維護公開檔案庫安全。",
    dataRights: "帳戶與資料權利",
    dataRightsText: "你的私人夢境紀錄仍由擁有者控制。執行刪除前建議先匯出。",
    clearDrafts: "清除本機離線草稿",
    deleteAll: "刪除全部夢境",
    deleteAccount: "刪除帳戶",
    requestDeletion: "提出帳戶刪除請求",
    consentHistory: "同意紀錄",
    loadConsent: "檢視同意紀錄",
    noConsent: "目前尚無同意事件。",
    moderation: "管理員審核儀表板",
    moderationText: "檢視使用者回報，並設定公開內容的審核狀態。",
    loadReports: "載入回報",
    noReports: "目前沒有待處理回報。",
    status: "狀態",
    applyStatus: "更新狀態",
    reason: "原因",
    record: "紀錄",
    reporter: "回報者",
    confirmDeleteAll:
      "確定刪除你的全部夢境紀錄？這會移除私人紀錄、公開鏡像與研究訊號。",
    confirmDeleteAccount:
      "確定刪除此帳戶與夢境資料？請先匯出資料。Firebase 可能要求你重新登入以確認近期登入。",
    confirmClearDrafts: "確定清除此裝置上的離線草稿？",
    deletedAll: ({ deleted, failed }) => `已刪除 ${deleted} 則夢境，${failed} 則失敗。`,
    draftsCleared: "本機離線草稿已清除。",
    deletionRequested: "帳戶刪除請求已建立。",
    accountDeleted: "帳戶刪除已完成。",
    recentLoginNeeded: "Firebase 需要近期登入才能刪除驗證帳戶。刪除請求已先記錄。",
    adminOnly: "只會顯示給管理員個人資料。",
    expand: "展開",
    collapse: "收合",
  },
  es: {
    title: "Centro de cuenta y confianza",
    subtitle:
      "Exporta, elimina, revisa consentimientos, borra borradores locales y ayuda a mantener seguro el archivo público.",
    dataRights: "Cuenta y derechos de datos",
    dataRightsText:
      "Tus registros privados siguen bajo tu control. Exporta antes de acciones destructivas.",
    clearDrafts: "Borrar borradores sin conexión",
    deleteAll: "Eliminar todos los sueños",
    deleteAccount: "Eliminar cuenta",
    requestDeletion: "Solicitar eliminación de cuenta",
    consentHistory: "Historial de consentimiento",
    loadConsent: "Ver historial de consentimiento",
    noConsent: "Aún no hay eventos de consentimiento.",
    moderation: "Panel de moderación admin",
    moderationText: "Revisa reportes y cambia el estado de moderación pública.",
    loadReports: "Cargar reportes",
    noReports: "No hay reportes en cola.",
    status: "Estado",
    applyStatus: "Actualizar estado",
    reason: "Motivo",
    record: "Registro",
    reporter: "Reportado por",
    confirmDeleteAll:
      "¿Eliminar todos tus registros de sueños? Esto elimina privados, copias públicas y señales de investigación.",
    confirmDeleteAccount:
      "¿Eliminar esta cuenta y sus datos? Exporta primero. Firebase puede pedir un inicio de sesión reciente.",
    confirmClearDrafts: "¿Borrar los borradores sin conexión de este dispositivo?",
    deletedAll: ({ deleted, failed }) =>
      `Se eliminaron ${deleted} sueños. ${failed} fallaron.`,
    draftsCleared: "Borradores locales borrados.",
    deletionRequested: "Solicitud de eliminación creada.",
    accountDeleted: "Eliminación de cuenta completada.",
    recentLoginNeeded:
      "Firebase requiere un inicio de sesión reciente para eliminar la cuenta de autenticación. La solicitud quedó registrada.",
    adminOnly: "Visible solo para perfiles admin.",
    expand: "Expandir",
    collapse: "Contraer",
  },
};

export default function AccountReadinessPanel({
  language = "zh",
  user,
  profile,
  observations = [],
  onDreamsDeleted = () => {},
  onAccountDeleted = () => {},
}) {
  const copy = COPY[language] || COPY.zh;
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState("");
  const [consents, setConsents] = useState([]);
  const [reports, setReports] = useState([]);
  const [reportStatuses, setReportStatuses] = useState({});
  const isAdmin = Boolean(profile?.isAdmin || profile?.role === "admin");
  const sortedConsents = useMemo(
    () => [...consents].slice(0, 12),
    [consents]
  );

  useEffect(() => {
    if (!isAdmin) {
      setReports([]);
    }
  }, [isAdmin]);

  async function runAction(actionName, action) {
    setBusy(actionName);
    setNotice("");

    try {
      await action();
    } catch (error) {
      setNotice(error?.code === "auth/requires-recent-login" ? copy.recentLoginNeeded : error.message);
    } finally {
      setBusy("");
    }
  }

  async function handleLoadConsent() {
    await runAction("consent", async () => {
      setConsents(await fetchConsentHistory(user));
    });
  }

  async function handleClearDrafts() {
    if (!window.confirm(copy.confirmClearDrafts)) return;

    await runAction("drafts", async () => {
      await clearLocalDraftsForAccount(user);
      setNotice(copy.draftsCleared);
    });
  }

  async function handleDeleteAllDreams() {
    if (!window.confirm(copy.confirmDeleteAll)) return;

    await runAction("deleteAll", async () => {
      const result = await deleteAllOwnedDreams(user);
      onDreamsDeleted();
      setNotice(copy.deletedAll({ deleted: result.deletedCount, failed: result.failedCount }));
    });
  }

  async function handleRequestDeletion() {
    await runAction("requestDeletion", async () => {
      await requestAccountDeletion(user);
      setNotice(copy.deletionRequested);
    });
  }

  async function handleDeleteAccount() {
    if (!window.confirm(copy.confirmDeleteAccount)) return;

    await runAction("deleteAccount", async () => {
      await trackSafeAnalyticsEvent("account_deletion_started", {
        currentUser: user,
        language,
      });
      await deleteAccountAndData(user);
      await trackSafeAnalyticsEvent("account_deletion_completed", {
        currentUser: user,
        language,
      });
      setNotice(copy.accountDeleted);
      onAccountDeleted();
    });
  }

  async function handleLoadReports() {
    await runAction("reports", async () => {
      const nextReports = await fetchModerationReports();
      setReports(nextReports);
      setReportStatuses(
        Object.fromEntries(
          nextReports.map((report) => [
            report.id,
            report.status || report.moderationStatus || "pending_review",
          ])
        )
      );
    });
  }

  async function handleUpdateReport(report) {
    const status = reportStatuses[report.id] || "pending_review";

    await runAction(`report-${report.id}`, async () => {
      await updateModerationReportStatus(report.id, {
        status,
        recordId: report.recordId,
      });
      setReports((current) =>
        current.map((item) =>
          item.id === report.id ? { ...item, status, moderationStatus: status } : item
        )
      );
    });
  }

  return (
    <section className="mb-6 overflow-hidden rounded-3xl border border-cyan-300/15 bg-zinc-950/65 shadow-[0_0_36px_rgba(34,211,238,.08)] backdrop-blur">
      <div className="border-b border-white/10 p-5 sm:p-6">
        <p className="cdo-kicker">{copy.title}</p>
        <p className="cdo-body-copy mt-3 max-w-4xl">{copy.subtitle}</p>
        {notice && (
          <p className="mt-4 rounded-2xl border border-cyan-300/20 bg-cyan-300/5 p-3 font-mono text-xs leading-6 text-cyan-100">
            {notice}
          </p>
        )}
      </div>

      <div className="grid gap-4 p-5 sm:p-6 xl:grid-cols-3">
        <details open className="group rounded-2xl border border-white/10 bg-black/25 p-4">
          <summary className="cursor-pointer list-none">
            <DisclosureTitle title={copy.dataRights} />
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            {copy.dataRightsText}
          </p>
          <div className="mt-4 grid gap-3">
            <ActionButton disabled={busy === "drafts"} onClick={handleClearDrafts}>
              {copy.clearDrafts}
            </ActionButton>
            <ActionButton
              danger
              disabled={observations.length === 0 || busy === "deleteAll"}
              onClick={handleDeleteAllDreams}
            >
              {copy.deleteAll}
            </ActionButton>
            <ActionButton disabled={busy === "requestDeletion"} onClick={handleRequestDeletion}>
              {copy.requestDeletion}
            </ActionButton>
            <ActionButton danger disabled={busy === "deleteAccount"} onClick={handleDeleteAccount}>
              {copy.deleteAccount}
            </ActionButton>
          </div>
        </details>

        <details className="group rounded-2xl border border-white/10 bg-black/25 p-4">
          <summary className="cursor-pointer list-none">
            <DisclosureTitle title={copy.consentHistory} />
          </summary>
          <button
            type="button"
            onClick={handleLoadConsent}
            disabled={busy === "consent"}
            className="mt-4 w-full rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-100 transition hover:border-cyan-300/45 disabled:opacity-60"
          >
            {copy.loadConsent}
          </button>
          <div className="mt-4 max-h-72 space-y-2 overflow-y-auto pr-1">
            {sortedConsents.length > 0 ? (
              sortedConsents.map((event) => (
                <div key={event.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-cyan-100">
                    {event.type || event.action || event.source || "consent"}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    {formatEventDate(event.createdAt, language)} · {event.sharingMode || ""}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm leading-relaxed text-slate-400">{copy.noConsent}</p>
            )}
          </div>
        </details>

        {isAdmin && (
          <details className="group rounded-2xl border border-fuchsia-300/15 bg-fuchsia-300/5 p-4">
            <summary className="cursor-pointer list-none">
              <DisclosureTitle title={copy.moderation} />
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              {copy.moderationText}
            </p>
            <button
              type="button"
              onClick={handleLoadReports}
              disabled={busy === "reports"}
              className="mt-4 w-full rounded-xl border border-fuchsia-300/25 bg-fuchsia-300/10 px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-fuchsia-100 transition hover:border-fuchsia-300/45 disabled:opacity-60"
            >
              {copy.loadReports}
            </button>
            <div className="mt-4 max-h-80 space-y-3 overflow-y-auto pr-1">
              {reports.length > 0 ? (
                reports.map((report) => (
                  <div key={report.id} className="rounded-xl border border-white/10 bg-black/30 p-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-fuchsia-100">
                      {report.targetType} · {copy.reason}: {report.reason}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-slate-400">
                      {copy.record}: {report.recordId || "--"}
                    </p>
                    <p className="text-xs leading-5 text-slate-400">
                      {copy.reporter}: {report.reporterId || "--"}
                    </p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                      <select
                        value={reportStatuses[report.id] || "pending_review"}
                        onChange={(event) =>
                          setReportStatuses((current) => ({
                            ...current,
                            [report.id]: event.target.value,
                          }))
                        }
                        className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 font-mono text-[10px] text-cyan-50"
                      >
                        {MODERATION_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleUpdateReport(report)}
                        disabled={busy === `report-${report.id}`}
                        className="rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-100"
                      >
                        {copy.applyStatus}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-relaxed text-slate-400">{copy.noReports}</p>
              )}
            </div>
          </details>
        )}
      </div>
    </section>
  );
}

function DisclosureTitle({ title }) {
  return (
    <span className="flex items-center justify-between gap-3">
      <span className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-cyan-100">
        {title}
      </span>
      <span className="text-cyan-200/70 transition group-open:rotate-180">v</span>
    </span>
  );
}

function ActionButton({ children, onClick, disabled, danger = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "rounded-xl border px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] transition disabled:cursor-not-allowed disabled:opacity-50",
        danger
          ? "border-red-300/25 bg-red-400/5 text-red-100 hover:border-red-300/45 hover:bg-red-400/10"
          : "border-cyan-300/25 bg-cyan-300/10 text-cyan-100 hover:border-cyan-300/45 hover:bg-cyan-300/15",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function formatEventDate(value, language) {
  const date =
    value && typeof value.toDate === "function"
      ? value.toDate()
      : value?.seconds
        ? new Date(value.seconds * 1000)
        : new Date(value || "");

  if (Number.isNaN(date.getTime())) return "";

  try {
    return new Intl.DateTimeFormat(
      language === "zh" ? "zh-Hant-TW" : language === "es" ? "es" : "en",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    ).format(date);
  } catch {
    return date.toISOString().slice(0, 16).replace("T", " ");
  }
}
