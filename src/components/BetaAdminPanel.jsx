import { useEffect, useMemo, useState } from "react";
import {
  BETA_CHECKLIST_ITEMS,
  FEEDBACK_CATEGORIES,
  FEEDBACK_SEVERITIES,
  FEEDBACK_STATUSES,
  addBetaAllowedEmail,
  createBetaInviteCode,
  fetchBetaChecklist,
  fetchBetaConfig,
  fetchBetaDashboardStats,
  fetchFeedbackItems,
  isAdminProfile,
  saveBetaConfig,
  updateBetaChecklistItem,
  updateFeedbackStatus,
} from "../lib/betaService.js";

const COPY = {
  en: {
    title: "Closed Beta Console",
    subtitle: "Manage invite access, feedback, readiness checks, and privacy-safe beta metrics.",
    access: "Beta access control",
    enabled: "Enable beta gate",
    saveConfig: "Save beta mode",
    invite: "Create invite code",
    invitePlaceholder: "DREAM-OBS-001",
    email: "Allow email",
    emailPlaceholder: "tester@example.com",
    addEmail: "Add allowed email",
    dashboard: "Beta dashboard",
    feedback: "Feedback dashboard",
    checklist: "Beta checklist",
    refresh: "Refresh",
    status: "Status",
    category: "Category",
    severity: "Severity",
    notes: "Internal notes",
    update: "Update",
    all: "All",
    fixed: "Mark fixed",
    closed: "Close",
    emptyFeedback: "No feedback in this filter.",
    devices: "Devices",
    browsers: "Browsers",
    saved: "Saved.",
    created: "Created.",
    failed: "Could not complete this action.",
    stats: {
      totalBetaUsers: "Beta users",
      activeUsers: "Active users",
      dreamsRecorded: "Dreams recorded",
      dreamsPrivate: "Private dreams",
      dreamsStatsOnly: "Stats-only dreams",
      dreamsPublic: "Public dreams",
      diaryImportsCompleted: "Diary imports",
      offlineDraftsUploaded: "Offline uploads",
      feedbackCount: "Feedback",
      openCriticalBugs: "Open critical bugs",
      reportsSubmitted: "Reports",
      moderationQueueSize: "Moderation queue",
      accountDeletionsTested: "Deletion tests",
    },
  },
  zh: {
    title: "封閉 Beta 控制台",
    subtitle: "管理邀請存取、回饋、上線檢查與隱私安全的 Beta 指標。",
    access: "Beta 存取控制",
    enabled: "啟用 Beta 門檻",
    saveConfig: "儲存 Beta 模式",
    invite: "建立邀請碼",
    invitePlaceholder: "DREAM-OBS-001",
    email: "允許電子郵件",
    emailPlaceholder: "tester@example.com",
    addEmail: "加入允許清單",
    dashboard: "Beta 儀表板",
    feedback: "回饋儀表板",
    checklist: "Beta 檢查表",
    refresh: "重新整理",
    status: "狀態",
    category: "類型",
    severity: "嚴重度",
    notes: "內部備註",
    update: "更新",
    all: "全部",
    fixed: "標為已修復",
    closed: "關閉",
    emptyFeedback: "此篩選沒有回饋。",
    devices: "裝置",
    browsers: "瀏覽器",
    saved: "已儲存。",
    created: "已建立。",
    failed: "此動作無法完成。",
    stats: {
      totalBetaUsers: "Beta 使用者",
      activeUsers: "活躍使用者",
      dreamsRecorded: "已記錄夢境",
      dreamsPrivate: "私人夢境",
      dreamsStatsOnly: "只統計夢境",
      dreamsPublic: "公開夢境",
      diaryImportsCompleted: "日記匯入",
      offlineDraftsUploaded: "離線草稿上傳",
      feedbackCount: "回饋數",
      openCriticalBugs: "嚴重錯誤",
      reportsSubmitted: "回報數",
      moderationQueueSize: "審核佇列",
      accountDeletionsTested: "刪除測試",
    },
  },
  es: {
    title: "Consola de beta cerrada",
    subtitle: "Gestiona invitaciones, feedback, verificaciones y métricas beta seguras.",
    access: "Control de acceso beta",
    enabled: "Activar puerta beta",
    saveConfig: "Guardar modo beta",
    invite: "Crear código",
    invitePlaceholder: "DREAM-OBS-001",
    email: "Permitir email",
    emailPlaceholder: "tester@example.com",
    addEmail: "Añadir email permitido",
    dashboard: "Panel beta",
    feedback: "Panel de feedback",
    checklist: "Lista beta",
    refresh: "Actualizar",
    status: "Estado",
    category: "Categoría",
    severity: "Severidad",
    notes: "Notas internas",
    update: "Actualizar",
    all: "Todo",
    fixed: "Marcar arreglado",
    closed: "Cerrar",
    emptyFeedback: "No hay feedback con este filtro.",
    devices: "Dispositivos",
    browsers: "Navegadores",
    saved: "Guardado.",
    created: "Creado.",
    failed: "No se pudo completar.",
    stats: {
      totalBetaUsers: "Usuarios beta",
      activeUsers: "Usuarios activos",
      dreamsRecorded: "Sueños registrados",
      dreamsPrivate: "Sueños privados",
      dreamsStatsOnly: "Solo estadísticas",
      dreamsPublic: "Sueños públicos",
      diaryImportsCompleted: "Importaciones",
      offlineDraftsUploaded: "Subidas offline",
      feedbackCount: "Feedback",
      openCriticalBugs: "Críticos abiertos",
      reportsSubmitted: "Reportes",
      moderationQueueSize: "Cola moderación",
      accountDeletionsTested: "Pruebas borrado",
    },
  },
};

const CHECKLIST_LABELS = {
  pwa_install_verified: "PWA install",
  offline_draft_verified: "Offline draft",
  private_dream_verified: "Private dream",
  stats_only_verified: "Stats-only",
  public_sharing_verified: "Public sharing",
  report_block_verified: "Report / block",
  delete_export_verified: "Delete / export",
  import_verified: "Import",
  mobile_layout_verified: "Mobile layout",
  research_export_privacy_verified: "Research export privacy",
  translations_reviewed: "Translations",
};

export default function BetaAdminPanel({ language = "zh", user, profile }) {
  const copy = COPY[language] || COPY.zh;
  const isAdmin = isAdminProfile(profile);
  const [config, setConfig] = useState(null);
  const [inviteCode, setInviteCode] = useState("");
  const [allowedEmail, setAllowedEmail] = useState("");
  const [stats, setStats] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [checklist, setChecklist] = useState([]);
  const [filters, setFilters] = useState({ status: "", category: "", severity: "" });
  const [notes, setNotes] = useState({});
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");

  const statRows = useMemo(
    () =>
      Object.keys(copy.stats).map((key) => ({
        label: copy.stats[key],
        value: stats?.[key] ?? 0,
      })),
    [copy.stats, stats]
  );

  useEffect(() => {
    if (!isAdmin) return;
    refreshConfig();
    refreshStats();
    refreshFeedback();
    refreshChecklist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  if (!isAdmin) return null;

  async function run(actionName, action) {
    setBusy(actionName);
    setNotice("");
    try {
      await action();
    } catch {
      setNotice(copy.failed);
    } finally {
      setBusy("");
    }
  }

  async function refreshConfig() {
    await run("config", async () => setConfig(await fetchBetaConfig()));
  }

  async function refreshStats() {
    await run("stats", async () => setStats(await fetchBetaDashboardStats()));
  }

  async function refreshFeedback(nextFilters = filters) {
    await run("feedback", async () => setFeedback(await fetchFeedbackItems(nextFilters)));
  }

  async function refreshChecklist() {
    await run("checklist", async () => setChecklist(await fetchBetaChecklist()));
  }

  async function handleSaveConfig() {
    await run("saveConfig", async () => {
      await saveBetaConfig(user, config || {});
      setNotice(copy.saved);
      await refreshConfig();
    });
  }

  async function handleCreateInvite() {
    await run("invite", async () => {
      await createBetaInviteCode(user, inviteCode);
      setInviteCode("");
      setNotice(copy.created);
    });
  }

  async function handleAddEmail() {
    await run("email", async () => {
      await addBetaAllowedEmail(user, allowedEmail);
      setAllowedEmail("");
      setNotice(copy.created);
    });
  }

  async function handleFeedbackStatus(item, status) {
    await run(`feedback-${item.id}`, async () => {
      await updateFeedbackStatus(item.id, {
        status,
        internalNotes: notes[item.id] || item.internalNotes || "",
      });
      await refreshFeedback();
    });
  }

  async function handleChecklistStatus(item, status) {
    await run(`check-${item.id}`, async () => {
      await updateBetaChecklistItem(user, item.id, {
        status,
        notes: notes[item.id] || item.notes || "",
      });
      await refreshChecklist();
    });
  }

  function handleFilterChange(key, value) {
    const next = { ...filters, [key]: value };
    setFilters(next);
    refreshFeedback(next);
  }

  return (
    <section className="mb-6 rounded-3xl border border-cyan-300/20 bg-zinc-950/70 p-5 text-zinc-100 shadow-[0_0_42px_rgba(34,211,238,.1)] backdrop-blur sm:p-7">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="cdo-kicker">{copy.title}</p>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-300">{copy.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            refreshStats();
            refreshFeedback();
            refreshChecklist();
          }}
          className="rounded-2xl border border-cyan-300/25 bg-cyan-300/10 px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.16em] text-cyan-100"
        >
          {busy ? "..." : copy.refresh}
        </button>
      </div>

      {notice && (
        <p className="mt-4 rounded-2xl border border-cyan-300/20 bg-cyan-300/5 p-3 text-sm text-cyan-100">
          {notice}
        </p>
      )}

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(18rem,.8fr)_minmax(0,1.2fr)]">
        <div className="space-y-5">
          <AdminCard title={copy.access}>
            <label className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-200">
              {copy.enabled}
              <input
                type="checkbox"
                checked={Boolean(config?.enabled)}
                onChange={(event) =>
                  setConfig((current) => ({ ...(current || {}), enabled: event.target.checked }))
                }
                className="h-5 w-5 accent-cyan-200"
              />
            </label>
            <button
              type="button"
              onClick={handleSaveConfig}
              className="mt-3 w-full rounded-2xl bg-cyan-200 px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.16em] text-slate-950"
            >
              {copy.saveConfig}
            </button>
            <div className="mt-4 grid gap-3">
              <input
                value={inviteCode}
                onChange={(event) => setInviteCode(event.target.value)}
                placeholder={copy.invitePlaceholder}
                className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-cyan-50"
              />
              <button
                type="button"
                onClick={handleCreateInvite}
                className="rounded-2xl border border-cyan-300/25 bg-cyan-300/10 px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.16em] text-cyan-100"
              >
                {copy.invite}
              </button>
              <input
                value={allowedEmail}
                onChange={(event) => setAllowedEmail(event.target.value)}
                placeholder={copy.emailPlaceholder}
                className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-cyan-50"
              />
              <button
                type="button"
                onClick={handleAddEmail}
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.16em] text-slate-200"
              >
                {copy.addEmail}
              </button>
            </div>
          </AdminCard>

          <AdminCard title={copy.checklist}>
            <div className="space-y-3">
              {checklist.map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-black/25 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-200">
                      {CHECKLIST_LABELS[item.id] || item.id}
                    </p>
                    <select
                      value={item.status}
                      onChange={(event) => handleChecklistStatus(item, event.target.value)}
                      className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-cyan-50"
                    >
                      {["not_started", "in_progress", "verified", "blocked"].map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                  <input
                    value={notes[item.id] ?? item.notes ?? ""}
                    onChange={(event) =>
                      setNotes((current) => ({ ...current, [item.id]: event.target.value }))
                    }
                    placeholder={copy.notes}
                    className="mt-3 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-slate-200"
                  />
                </div>
              ))}
            </div>
          </AdminCard>
        </div>

        <div className="space-y-5">
          <AdminCard title={copy.dashboard}>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {statRows.map((row) => (
                <div key={row.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                    {row.label}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-cyan-100">{String(row.value)}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Breakdown title={copy.devices} values={stats?.deviceTypes} />
              <Breakdown title={copy.browsers} values={stats?.browserTypes} />
            </div>
          </AdminCard>

          <AdminCard title={copy.feedback}>
            <div className="grid gap-3 sm:grid-cols-3">
              <FilterSelect label={copy.status} value={filters.status} onChange={(value) => handleFilterChange("status", value)} options={FEEDBACK_STATUSES} allLabel={copy.all} />
              <FilterSelect label={copy.category} value={filters.category} onChange={(value) => handleFilterChange("category", value)} options={FEEDBACK_CATEGORIES} allLabel={copy.all} />
              <FilterSelect label={copy.severity} value={filters.severity} onChange={(value) => handleFilterChange("severity", value)} options={FEEDBACK_SEVERITIES} allLabel={copy.all} />
            </div>
            <div className="mt-4 space-y-3">
              {feedback.length === 0 && (
                <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
                  {copy.emptyFeedback}
                </p>
              )}
              {feedback.map((item) => (
                <article key={item.id} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-cyan-100">
                    <span>{item.category}</span>
                    <span>{item.severity}</span>
                    <span>{item.status}</span>
                    <span>{item.deviceType}</span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{item.message}</p>
                  <textarea
                    value={notes[item.id] ?? item.internalNotes ?? ""}
                    onChange={(event) =>
                      setNotes((current) => ({ ...current, [item.id]: event.target.value }))
                    }
                    placeholder={copy.notes}
                    className="mt-3 min-h-20 w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm text-slate-200"
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleFeedbackStatus(item, "fixed")}
                      className="rounded-xl bg-cyan-200 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-slate-950"
                    >
                      {copy.fixed}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFeedbackStatus(item, "closed")}
                      className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-slate-200"
                    >
                      {copy.closed}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </AdminCard>
        </div>
      </div>
    </section>
  );
}

function AdminCard({ title, children }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-black/25 p-4 sm:p-5">
      <h3 className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-cyan-100">
        {title}
      </h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function FilterSelect({ label, value, onChange, options, allLabel }) {
  return (
    <label className="block">
      <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-xs text-cyan-50"
      >
        <option value="">{allLabel}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function Breakdown({ title, values = {} }) {
  const entries = Object.entries(values || {}).sort((a, b) => b[1] - a[1]);

  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
        {title}
      </p>
      <div className="mt-3 space-y-2">
        {entries.length === 0 && <p className="text-sm text-slate-400">-</p>}
        {entries.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-3 text-sm">
            <span className="truncate text-slate-300">{label}</span>
            <span className="font-mono text-cyan-100">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
