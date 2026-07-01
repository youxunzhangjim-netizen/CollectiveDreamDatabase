import { OFFLINE_DRAFT_STATUS } from "../lib/offlineDreamDraftService.js";

const DRAFT_COPY = {
  en: {
    title: "Offline drafts",
    description:
      "Local drafts are private on this device. They are not public until upload succeeds and you confirm sharing.",
    empty: "No local drafts on this device.",
    restore: "Restore",
    upload: "Upload",
    delete: "Delete",
    clear: "Clear local drafts",
    clearConfirm: "Clear all local dream drafts from this device?",
    deviceWarning: "Stored only on this device.",
    statuses: {
      [OFFLINE_DRAFT_STATUS.SAVED_LOCALLY]: "Saved locally",
      [OFFLINE_DRAFT_STATUS.WAITING_FOR_CONNECTION]: "Waiting for connection",
      [OFFLINE_DRAFT_STATUS.READY_TO_UPLOAD]: "Ready to upload",
      [OFFLINE_DRAFT_STATUS.UPLOADING]: "Uploading",
      [OFFLINE_DRAFT_STATUS.UPLOADED]: "Uploaded",
      [OFFLINE_DRAFT_STATUS.UPLOAD_FAILED]: "Upload failed — retry",
    },
  },
  zh: {
    title: "離線草稿",
    description:
      "本機草稿只保存在此裝置。上傳成功並確認分享前，不會公開。",
    empty: "此裝置目前沒有本機草稿。",
    restore: "還原",
    upload: "上傳",
    delete: "刪除",
    clear: "清除本機草稿",
    clearConfirm: "要清除此裝置上的所有夢境草稿嗎？",
    deviceWarning: "只儲存在此裝置。",
    statuses: {
      [OFFLINE_DRAFT_STATUS.SAVED_LOCALLY]: "已儲存在本機",
      [OFFLINE_DRAFT_STATUS.WAITING_FOR_CONNECTION]: "等待連線",
      [OFFLINE_DRAFT_STATUS.READY_TO_UPLOAD]: "可上傳",
      [OFFLINE_DRAFT_STATUS.UPLOADING]: "上傳中",
      [OFFLINE_DRAFT_STATUS.UPLOADED]: "已上傳",
      [OFFLINE_DRAFT_STATUS.UPLOAD_FAILED]: "上傳失敗 — 可重試",
    },
  },
  es: {
    title: "Borradores sin conexión",
    description:
      "Los borradores locales son privados en este dispositivo. No son públicos hasta que la subida funcione y confirmes cómo compartirlos.",
    empty: "No hay borradores locales en este dispositivo.",
    restore: "Restaurar",
    upload: "Subir",
    delete: "Eliminar",
    clear: "Borrar borradores locales",
    clearConfirm: "¿Borrar todos los borradores locales de este dispositivo?",
    deviceWarning: "Guardado solo en este dispositivo.",
    statuses: {
      [OFFLINE_DRAFT_STATUS.SAVED_LOCALLY]: "Guardado localmente",
      [OFFLINE_DRAFT_STATUS.WAITING_FOR_CONNECTION]: "Esperando conexión",
      [OFFLINE_DRAFT_STATUS.READY_TO_UPLOAD]: "Listo para subir",
      [OFFLINE_DRAFT_STATUS.UPLOADING]: "Subiendo",
      [OFFLINE_DRAFT_STATUS.UPLOADED]: "Subido",
      [OFFLINE_DRAFT_STATUS.UPLOAD_FAILED]: "Error al subir — reintentar",
    },
  },
};

export default function OfflineDraftsPanel({
  language = "zh",
  drafts = [],
  busyId = "",
  onRestore = () => {},
  onUpload = () => {},
  onDelete = () => {},
  onClear = () => {},
}) {
  const copy = DRAFT_COPY[language] || DRAFT_COPY.zh;

  return (
    <details className="rounded-3xl border border-cyan-300/15 bg-zinc-950/75 p-5 shadow-terminal backdrop-blur">
      <summary className="cursor-pointer list-none">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.24em] text-cyan-100">
              {copy.title}
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              {copy.description}
            </p>
          </div>
          <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-2.5 py-1 font-mono text-[10px] font-bold text-cyan-100">
            {drafts.length}
          </span>
        </div>
      </summary>

      <div className="mt-4 space-y-3">
        {drafts.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm leading-6 text-zinc-400">
            {copy.empty}
          </p>
        ) : (
          drafts.map((draft) => (
            <article
              key={draft.id}
              className="rounded-2xl border border-white/10 bg-black/30 p-4"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-100">
                    {draft.draft?.title || draft.draft?.dreamText || copy.title}
                  </p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-cyan-100">
                    {copy.statuses[draft.status] || copy.statuses.saved_locally}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    {copy.deviceWarning} {formatDraftDate(draft.updatedAt, language)}
                  </p>
                  {draft.lastError && (
                    <p className="mt-2 rounded-xl border border-red-300/20 bg-red-400/5 p-2 font-mono text-[10px] leading-5 text-red-100">
                      {draft.lastError}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <DraftButton onClick={() => onRestore(draft)} disabled={busyId === draft.id}>
                  {copy.restore}
                </DraftButton>
                <DraftButton onClick={() => onUpload(draft)} disabled={busyId === draft.id}>
                  {busyId === draft.id ? "..." : copy.upload}
                </DraftButton>
                <DraftButton danger onClick={() => onDelete(draft.id)} disabled={busyId === draft.id}>
                  {copy.delete}
                </DraftButton>
              </div>
            </article>
          ))
        )}

        {drafts.length > 0 && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm(copy.clearConfirm)) onClear();
            }}
            className="w-full rounded-2xl border border-red-300/20 bg-red-400/5 px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-red-100 transition hover:border-red-300/45 hover:bg-red-400/10"
          >
            {copy.clear}
          </button>
        )}
      </div>
    </details>
  );
}

function DraftButton({ children, danger = false, ...props }) {
  return (
    <button
      type="button"
      {...props}
      className={[
        "rounded-xl border px-3 py-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] transition disabled:cursor-not-allowed disabled:opacity-50",
        danger
          ? "border-red-300/20 bg-red-400/5 text-red-100 hover:border-red-300/45"
          : "border-cyan-300/25 bg-cyan-300/10 text-cyan-100 hover:border-cyan-300/45",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function formatDraftDate(value, language) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  try {
    return new Intl.DateTimeFormat(
      language === "zh" ? "zh-Hant-TW" : language === "es" ? "es" : "en",
      { dateStyle: "medium", timeStyle: "short" }
    ).format(date);
  } catch {
    return date.toISOString().slice(0, 16).replace("T", " ");
  }
}
