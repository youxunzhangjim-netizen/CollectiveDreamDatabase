import { useEffect, useMemo, useState } from "react";
import {
  collectRecordForUser,
  saveRecordForUser,
  updateOwnedRecordMetadata,
} from "../lib/recordsService.js";
import { LANGUAGE_OPTIONS } from "../lib/language.js";

const DETAIL_COPY = {
  en: {
    languageLabel: "Switch interface language",
    englishLabel: "English interface",
    chineseLabel: "Traditional Chinese interface",
    spanishLabel: "Spanish interface",
    back: "Back",
    dashboard: "Account",
    collect: "Collect Dream",
    collected: "Collected",
    saveMetadata: "Save Dream Metadata",
    creatorPanel: "Creator Metadata",
    dreamDate: "Dream Date",
    ageAtDream: "Age at Dream",
    agePlaceholder: "Optional",
    creator: "Creator",
    recordDate: "Record Date",
    visibility: "Visibility",
    privateRecord: "Private",
    publicRecord: "Public",
    recordText: "Dream Record",
    emptyRecordBody: "No dream text has been archived for this record yet.",
    metadataSaved: "Dream metadata saved",
    signInToCollect: "Sign in to collect this dream",
    recorderRulesTitle: "Recorder Rules",
    recorderRules: [
      "Record only dreams you personally observed or have permission to archive.",
      "Creators may store the dream date and their age at the time of the dream.",
      "Account age display is optional and controlled by the account owner.",
      "Public records can be read by guests; private records stay owner-controlled.",
    ],
  },
  zh: {
    languageLabel: "切換介面語言",
    englishLabel: "英文介面",
    chineseLabel: "繁體中文介面",
    spanishLabel: "西班牙文介面",
    back: "返回",
    dashboard: "帳戶",
    collect: "收藏夢境",
    collected: "已收藏",
    saveMetadata: "儲存夢境資料",
    creatorPanel: "創作者資料",
    dreamDate: "夢境日期",
    ageAtDream: "做夢時年齡",
    agePlaceholder: "選填",
    creator: "創作者",
    recordDate: "紀錄日期",
    visibility: "可見性",
    privateRecord: "私人",
    publicRecord: "公開",
    recordText: "夢境紀錄",
    emptyRecordBody: "此紀錄尚未歸檔夢境內文。",
    metadataSaved: "夢境資料已儲存",
    signInToCollect: "登入後可收藏此夢境",
    recorderRulesTitle: "記錄者規則",
    recorderRules: [
      "只記錄你親自經歷，或已獲得同意可歸檔的夢境。",
      "創作者可以保存夢境日期與做夢當下的年齡。",
      "帳戶年齡是否公開顯示，由帳戶擁有者自行決定。",
      "公開紀錄可由訪客閱讀；私人紀錄仍由擁有者控制。",
    ],
  },
  es: {
    languageLabel: "Cambiar idioma de la interfaz",
    englishLabel: "Interfaz en inglés",
    chineseLabel: "Interfaz en chino tradicional",
    spanishLabel: "Interfaz en español",
    back: "Volver",
    dashboard: "Cuenta",
    collect: "Coleccionar Sueño",
    collected: "Coleccionado",
    saveMetadata: "Guardar Metadatos",
    creatorPanel: "Metadatos del Creador",
    dreamDate: "Fecha del Sueño",
    ageAtDream: "Edad en el Sueño",
    agePlaceholder: "Opcional",
    creator: "Creador",
    recordDate: "Fecha del Registro",
    visibility: "Visibilidad",
    privateRecord: "Privado",
    publicRecord: "Público",
    recordText: "Registro del Sueño",
    emptyRecordBody: "Este registro aún no tiene texto de sueño archivado.",
    metadataSaved: "Metadatos guardados",
    signInToCollect: "Inicia sesión para coleccionar este sueño",
    recorderRulesTitle: "Reglas para Registrar",
    recorderRules: [
      "Registra solo sueños que observaste personalmente o que tienes permiso para archivar.",
      "Los creadores pueden guardar la fecha del sueño y su edad en ese momento.",
      "La edad de la cuenta es opcional y la controla la persona propietaria.",
      "Los registros públicos pueden leerse como invitado; los privados siguen bajo control del dueño.",
    ],
  },
};

export default function DreamRecordPage({
  record,
  currentUser,
  language = "zh",
  setLanguage = () => {},
  onBack,
  onOpenDashboard,
}) {
  const copy = DETAIL_COPY[language] || DETAIL_COPY.zh;
  const normalizedRecord = useMemo(() => normalizeDreamRecord(record), [record]);
  const isOwner = Boolean(
    currentUser?.uid &&
      normalizedRecord.ownerId &&
      currentUser.uid === normalizedRecord.ownerId
  );
  const [dreamDate, setDreamDate] = useState(normalizedRecord.dreamDate || "");
  const [ageAtDream, setAgeAtDream] = useState(normalizedRecord.ageAtDream || "");
  const [status, setStatus] = useState("");
  const [collecting, setCollecting] = useState(false);
  const title = getLocalizedRecordTitle(normalizedRecord, language);
  const body = getLocalizedRecordText(normalizedRecord, language);

  useEffect(() => {
    document.title = title || "Dream Record";
  }, [title]);

  async function handleCollect() {
    if (!currentUser?.uid) {
      setStatus(copy.signInToCollect);
      return;
    }

    setCollecting(true);
    setStatus("");

    try {
      await Promise.all([
        saveRecordForUser(currentUser, normalizedRecord),
        collectRecordForUser(currentUser, normalizedRecord),
      ]);
      setStatus(copy.collected);
    } catch (error) {
      setStatus(error.message);
    } finally {
      setCollecting(false);
    }
  }

  async function handleSaveMetadata() {
    setStatus("");

    try {
      await updateOwnedRecordMetadata(currentUser, normalizedRecord.id, {
        dreamDate,
        ageAtDream,
      });
      setStatus(copy.metadataSaved);
    } catch (error) {
      setStatus(error.message);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030407] text-zinc-100 selection:bg-cyan-300/30 selection:text-cyan-50">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-20rem] h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute bottom-[-14rem] right-[-10rem] h-[34rem] w-[34rem] rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] bg-[size:44px_44px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.2em] text-cyan-100 transition hover:border-cyan-300/35 hover:bg-cyan-300/10"
          >
            {copy.back}
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <LanguageToggle language={language} setLanguage={setLanguage} copy={copy} />
            <button
              type="button"
              onClick={onOpenDashboard}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.2em] text-zinc-100 transition hover:border-fuchsia-300/35 hover:bg-fuchsia-300/10"
            >
              {copy.dashboard}
            </button>
            <button
              type="button"
              onClick={handleCollect}
              disabled={collecting}
              className="rounded-xl border border-cyan-300/35 bg-cyan-300 px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.2em] text-zinc-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {collecting ? "..." : copy.collect}
            </button>
          </div>
        </header>

        <section className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/75 shadow-terminal backdrop-blur">
          <div className="grid gap-0 lg:grid-cols-[1.2fr_.8fr]">
            <article className="p-6 sm:p-8">
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.38em] text-cyan-200/70">
                {copy.recordText}
              </p>
              <h1 className="text-4xl font-semibold text-zinc-50 sm:text-5xl">
                {title}
              </h1>
              <p className="mt-5 max-w-3xl text-sm leading-7 text-zinc-300 sm:text-base">
                {body || copy.emptyRecordBody}
              </p>

              {status && (
                <p className="mt-6 rounded-2xl border border-cyan-300/20 bg-cyan-300/5 p-4 font-mono text-xs uppercase tracking-[0.16em] text-cyan-100">
                  {status}
                </p>
              )}
            </article>

            <aside className="border-t border-white/10 bg-black/30 p-6 sm:p-8 lg:border-l lg:border-t-0">
              <div className="space-y-3">
                <InfoRow label={copy.creator} value={normalizedRecord.pseudoId || "--"} />
                <InfoRow
                  label={copy.recordDate}
                  value={normalizedRecord.dreamDate || normalizedRecord.date || "--"}
                />
                <InfoRow
                  label={copy.ageAtDream}
                  value={
                    normalizedRecord.ageAtDream
                      ? String(normalizedRecord.ageAtDream)
                      : "--"
                  }
                />
                <InfoRow
                  label={copy.visibility}
                  value={
                    normalizedRecord.visibility === "private"
                      ? copy.privateRecord
                      : copy.publicRecord
                  }
                />
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="mb-3 font-mono text-xs uppercase tracking-[0.24em] text-fuchsia-200/70">
                  {copy.recorderRulesTitle}
                </p>
                <ul className="space-y-2 text-sm leading-6 text-zinc-300">
                  {copy.recorderRules.map((rule) => (
                    <li key={rule} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {isOwner && (
                <div className="mt-6 rounded-2xl border border-cyan-300/15 bg-cyan-300/5 p-4">
                  <p className="mb-4 font-mono text-xs uppercase tracking-[0.26em] text-cyan-200/70">
                    {copy.creatorPanel}
                  </p>
                  <label className="mb-3 block">
                    <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                      {copy.dreamDate}
                    </span>
                    <input
                      type="date"
                      value={dreamDate}
                      onChange={(event) => setDreamDate(event.target.value)}
                      className="w-full rounded-2xl border border-cyan-300/15 bg-black/40 px-4 py-3 font-mono text-sm text-cyan-50 outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                      {copy.ageAtDream}
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={ageAtDream}
                      onChange={(event) => setAgeAtDream(event.target.value)}
                      placeholder={copy.agePlaceholder}
                      className="w-full rounded-2xl border border-cyan-300/15 bg-black/40 px-4 py-3 font-mono text-sm text-cyan-50 outline-none transition placeholder:text-zinc-600 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleSaveMetadata}
                    className="mt-4 w-full rounded-2xl border border-fuchsia-300/35 bg-fuchsia-300 px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.2em] text-zinc-950 transition hover:bg-fuchsia-200"
                  >
                    {copy.saveMetadata}
                  </button>
                </div>
              )}
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}

function normalizeDreamRecord(record) {
  return {
    id: record?.id || record?.dream_id || record?.recordId || "",
    title: record?.title || "Untitled Record",
    titleZh: record?.titleZh || record?.title_zh || record?.title || "未命名紀錄",
    titleEs: record?.titleEs || record?.title_es || record?.title || "Registro sin título",
    text: record?.dream_text || record?.text || record?.excerpt || "",
    textZh: record?.dream_text_zh || record?.textZh || record?.excerpt_zh || record?.excerpt || "",
    textEs: record?.dream_text_es || record?.textEs || record?.excerpt_es || record?.excerpt || "",
    date: record?.dream_date || record?.date || "",
    dreamDate: record?.dreamDate || record?.dream_date || record?.date || "",
    ageAtDream: record?.ageAtDream || "",
    ownerId: record?.ownerId || record?.creatorId || "",
    pseudoId: record?.pseudo_id || record?.pseudoId || record?.creatorId || "",
    visibility: record?.visibility || (record?.isPublic === false ? "private" : "public"),
  };
}

function getLocalizedRecordTitle(record, language) {
  if (language === "zh") return record.titleZh || record.title;
  if (language === "es") return record.titleEs || record.title;

  return record.title;
}

function getLocalizedRecordText(record, language) {
  if (language === "zh") return record.textZh || record.text;
  if (language === "es") return record.textEs || record.text;

  return record.text;
}

function LanguageToggle({ language, setLanguage, copy }) {
  return (
    <div
      className="relative flex h-11 shrink-0 items-center overflow-hidden rounded-xl border border-cyan-300/30 bg-cyan-300/10 p-1 shadow-[0_0_24px_rgba(34,211,238,.16)]"
      role="group"
      aria-label={copy.languageLabel}
    >
      <span className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,.35),transparent_55%)]" />
      {LANGUAGE_OPTIONS.map((option) => {
        const active = language === option.value;
        const title =
          option.value === "zh"
            ? copy.chineseLabel
            : option.value === "es"
              ? copy.spanishLabel
              : copy.englishLabel;

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            title={title}
            onClick={() => setLanguage(option.value)}
            className={[
              "relative z-10 flex h-8 min-w-9 items-center justify-center rounded-lg px-2 font-mono text-xs font-bold transition",
              active
                ? "bg-cyan-200 text-zinc-950 shadow-[0_0_18px_rgba(34,211,238,.25)]"
                : "text-cyan-100/70 hover:bg-white/10 hover:text-cyan-50",
            ].join(" ")}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </p>
      <p className="mt-2 break-words font-mono text-sm text-cyan-100">{value}</p>
    </div>
  );
}
