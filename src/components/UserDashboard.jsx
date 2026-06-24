import { useEffect, useMemo, useState } from "react";
import {
  deleteOwnedRecord,
  fetchCollectionRecords,
  fetchOwnedRecords,
  fetchSavedRecords,
  removeCollectedRecord,
  removeSavedRecord,
} from "../lib/recordsService.js";
import {
  createDefaultProfile,
  getOrCreateUserProfile,
  saveUserProfile,
} from "../lib/profileService.js";
import {
  getLanguageName,
  LANGUAGE_OPTIONS,
  normalizeLanguage,
} from "../lib/language.js";
import {
  getPrimaryDreamImageUrl,
  normalizeDreamImages,
} from "../lib/dreamImageService.js";
import {
  getDreamDateStatus,
  getVisibleDreamDate,
} from "../lib/dreamDate.js";
import { getTagLabel, RECORD_TAGS } from "../lib/tagTaxonomy.js";
import LanguageMenu from "./LanguageMenu.jsx";

const DASHBOARD_COPY = {
  en: {
    documentTitle: "Personal Dream Console",
    languageLabel: "Switch interface language",
    englishLabel: "English interface",
    chineseLabel: "Traditional Chinese interface",
    spanishLabel: "Spanish interface",
    databaseButton: "Public Database",
    recordButton: "Record Dream",
    consoleLabel: "Account Console",
    memberSince: "Member since",
    signOut: "Sign Out",
    observationsTab: "My Observations",
    savedTab: "Saved Records",
    collectionsTab: "Collections",
    observationsEmpty: "No records found in your personal database.",
    savedEmpty: "No saved records found in your private archive.",
    collectionsEmpty: "No collected dreams found in your liked collection.",
    deleteButton: "Delete",
    removeButton: "Remove",
    lockedButton: "Locked",
    observationCount: "Observations",
    savedCount: "Saved",
    identityStatus: "Preferred language",
    activeStatus: "Active",
    accountEmailHidden: "Account email hidden",
    privateAccountLabel: "Private account",
    lastSync: "Last Sync",
    recordsLoading: "Loading personal records",
    accountDetails: "Account Details",
    displayNameLabel: "Public Name",
    displayNamePlaceholder: "Dream researcher name",
    countryLabel: "Country",
    countryPlaceholder: "Taiwan, United States...",
    ageLabel: "Age",
    agePlaceholder: "Optional",
    showEmailLabel: "Show email publicly",
    showAgeLabel: "Show age publicly",
    biologicalSexLabel: "Biological Sex",
    biologicalSexPlaceholder: "Prefer not to say",
    showBiologicalSexLabel: "Show biological sex publicly",
    preferredLanguageLabel: "Preferred Language",
    biologicalSexOptions: {
      female: "Female",
      male: "Male",
      intersex: "Intersex",
      notListed: "Not listed",
      preferNotToSay: "Prefer not to say",
    },
    saveProfile: "Save Profile",
    profileSaved: "Profile saved",
    joinedDate: "Joined",
    hiddenAge: "Hidden",
    originalLanguageLabel: "Original language",
    unknownDate: "Date unknown",
    hiddenDate: "Date hidden",
    analysisTitle: "Personal Upload Analysis",
    analysisText:
      "A private summary of the dreams uploaded from this account for self-study and pattern tracking.",
    analysisTotal: "Uploaded",
    analysisAdult: "Mature tagged",
    analysisDreamTypeLead: "Leading dream type",
    analysisPsychologyLead: "Leading psyche signal",
    analysisAnalysisLead: "Leading analysis marker",
    analysisLanguageLead: "Leading language",
    analysisEmotionLead: "Leading emotion",
    analysisAverageAge: "Avg dream age",
    analysisNoData: "No data yet",
  },
  zh: {
    documentTitle: "個人夢境終端",
    languageLabel: "切換介面語言",
    englishLabel: "英文介面",
    chineseLabel: "繁體中文介面",
    spanishLabel: "西班牙文介面",
    databaseButton: "公開資料庫",
    recordButton: "記錄夢境",
    consoleLabel: "帳戶終端",
    memberSince: "會員起始日",
    signOut: "登出",
    observationsTab: "我的觀測",
    savedTab: "已儲存紀錄",
    collectionsTab: "收藏集",
    observationsEmpty: "你的個人資料庫中尚無紀錄。",
    savedEmpty: "你的私人檔案庫中尚無已儲存紀錄。",
    collectionsEmpty: "你的收藏集中尚無夢境紀錄。",
    deleteButton: "刪除",
    removeButton: "移除",
    lockedButton: "已鎖定",
    observationCount: "觀測",
    savedCount: "已儲存",
    identityStatus: "偏好語言",
    activeStatus: "啟用中",
    accountEmailHidden: "帳戶電子郵件已隱藏",
    privateAccountLabel: "私人帳戶",
    lastSync: "最後同步",
    recordsLoading: "正在載入個人紀錄",
    accountDetails: "帳戶資料",
    displayNameLabel: "公開名稱",
    displayNamePlaceholder: "夢境研究者名稱",
    countryLabel: "國家／地區",
    countryPlaceholder: "台灣、美國...",
    ageLabel: "年齡",
    agePlaceholder: "選填",
    showEmailLabel: "公開顯示電子郵件",
    showAgeLabel: "公開顯示年齡",
    biologicalSexLabel: "生理性別",
    biologicalSexPlaceholder: "不透露",
    showBiologicalSexLabel: "公開顯示生理性別",
    preferredLanguageLabel: "偏好語言",
    biologicalSexOptions: {
      female: "女性",
      male: "男性",
      intersex: "雙性",
      notListed: "未列出",
      preferNotToSay: "不透露",
    },
    saveProfile: "儲存個人資料",
    profileSaved: "個人資料已儲存",
    joinedDate: "加入日期",
    hiddenAge: "已隱藏",
    originalLanguageLabel: "原始語言",
    unknownDate: "日期不確定",
    hiddenDate: "日期已隱藏",
    analysisTitle: "個人上傳分析",
    analysisText: "只根據此帳戶上傳的夢境建立的私人摘要，可用於自我研究與模式追蹤。",
    analysisTotal: "已上傳",
    analysisAdult: "成人標記",
    analysisDreamTypeLead: "主要夢境類型",
    analysisPsychologyLead: "主要心理訊號",
    analysisAnalysisLead: "主要分析標記",
    analysisLanguageLead: "主要語言",
    analysisEmotionLead: "主要情緒",
    analysisAverageAge: "平均夢中年齡",
    analysisNoData: "尚無資料",
  },
  es: {
    documentTitle: "Consola personal de sueños",
    languageLabel: "Cambiar idioma de la interfaz",
    englishLabel: "Interfaz en inglés",
    chineseLabel: "Interfaz en chino tradicional",
    spanishLabel: "Interfaz en español",
    databaseButton: "Base pública",
    recordButton: "Registrar sueño",
    consoleLabel: "Consola de cuenta",
    memberSince: "Miembro desde",
    signOut: "Cerrar sesión",
    observationsTab: "Mis observaciones",
    savedTab: "Registros guardados",
    collectionsTab: "Colecciones",
    observationsEmpty: "No hay registros en tu base personal.",
    savedEmpty: "No hay registros guardados en tu archivo privado.",
    collectionsEmpty: "Aún no hay sueños en tu colección.",
    deleteButton: "Eliminar",
    removeButton: "Quitar",
    lockedButton: "Bloqueado",
    observationCount: "Observaciones",
    savedCount: "Guardados",
    identityStatus: "Idioma preferido",
    activeStatus: "Activa",
    accountEmailHidden: "Correo de cuenta oculto",
    privateAccountLabel: "Cuenta privada",
    lastSync: "Última sincronización",
    recordsLoading: "Cargando registros personales",
    accountDetails: "Datos de la cuenta",
    displayNameLabel: "Nombre público",
    displayNamePlaceholder: "Nombre de investigación",
    countryLabel: "País / región",
    countryPlaceholder: "Taiwán, Estados Unidos...",
    ageLabel: "Edad",
    agePlaceholder: "Opcional",
    showEmailLabel: "Mostrar correo públicamente",
    showAgeLabel: "Mostrar edad públicamente",
    biologicalSexLabel: "Sexo biológico",
    biologicalSexPlaceholder: "Prefiero no decirlo",
    showBiologicalSexLabel: "Mostrar sexo biológico públicamente",
    preferredLanguageLabel: "Idioma preferido",
    biologicalSexOptions: {
      female: "Femenino",
      male: "Masculino",
      intersex: "Intersexual",
      notListed: "No listado",
      preferNotToSay: "Prefiero no decirlo",
    },
    saveProfile: "Guardar perfil",
    profileSaved: "Perfil guardado",
    joinedDate: "Fecha de ingreso",
    hiddenAge: "Oculta",
    originalLanguageLabel: "Idioma original",
    unknownDate: "Fecha desconocida",
    hiddenDate: "Fecha oculta",
    analysisTitle: "Análisis personal",
    analysisText:
      "Resumen privado de los sueños subidos desde esta cuenta para estudio propio y seguimiento de patrones.",
    analysisTotal: "Subidos",
    analysisAdult: "Madurez marcada",
    analysisDreamTypeLead: "Tipo principal",
    analysisPsychologyLead: "Señal psíquica principal",
    analysisAnalysisLead: "Marcador principal",
    analysisLanguageLead: "Idioma principal",
    analysisEmotionLead: "Emoción principal",
    analysisAverageAge: "Edad media",
    analysisNoData: "Sin datos",
  },
};

const BIOLOGICAL_SEX_OPTIONS = [
  "preferNotToSay",
  "female",
  "male",
  "intersex",
  "notListed",
];

const MOCK_OBSERVATIONS = [
  {
    id: "obs-001",
    title: "Neon Rain Rising From the Street",
    titleZh: "霓虹雨從街面升起",
    date: "2026-06-12",
    hash: "VX-20000000",
    accent: "cyan",
  },
  {
    id: "obs-002",
    title: "A City Suspended Under Water",
    titleZh: "懸在水下的城市",
    date: "2026-06-04",
    hash: "VX-20000004",
    accent: "fuchsia",
  },
  {
    id: "obs-003",
    title: "The Non-Human Archivist",
    titleZh: "非人類檔案管理者",
    date: "2026-05-29",
    hash: "VX-20000005",
    accent: "violet",
  },
];

const MOCK_SAVED_RECORDS = [
  {
    id: "saved-001",
    title: "The Station Clock Refused to Move",
    titleZh: "車站時鐘拒絕前進",
    date: "2026-06-08",
    hash: "VX-20000003",
    accent: "cyan",
  },
  {
    id: "saved-002",
    title: "The Ocean With No Shoreline",
    titleZh: "沒有海岸線的海",
    date: "2026-06-10",
    hash: "VX-20000002",
    accent: "fuchsia",
  },
];

const ACCENT_STYLES = {
  cyan: {
    border: "border-cyan-300/25",
    glow: "shadow-[0_0_32px_rgba(34,211,238,.10)]",
    dot: "bg-cyan-300",
    gradient:
      "radial-gradient(circle at 20% 20%, rgba(34,211,238,.32), transparent 28%), linear-gradient(135deg, #05060a 0%, #101827 54%, #030407 100%)",
  },
  fuchsia: {
    border: "border-fuchsia-300/25",
    glow: "shadow-[0_0_32px_rgba(217,70,239,.10)]",
    dot: "bg-fuchsia-300",
    gradient:
      "radial-gradient(circle at 82% 26%, rgba(217,70,239,.30), transparent 30%), linear-gradient(135deg, #05060a 0%, #17101f 54%, #030407 100%)",
  },
  violet: {
    border: "border-violet-300/25",
    glow: "shadow-[0_0_32px_rgba(167,139,250,.10)]",
    dot: "bg-violet-300",
    gradient:
      "radial-gradient(circle at 40% 10%, rgba(167,139,250,.30), transparent 32%), linear-gradient(135deg, #05060a 0%, #111827 54%, #030407 100%)",
  },
};

export default function UserDashboard({
  language = "zh",
  setLanguage = () => {},
  user,
  onSignOut,
  onOpenDatabase,
  onOpenRecorder,
  onOpenRecord,
}) {
  const copy = DASHBOARD_COPY[language] || DASHBOARD_COPY.zh;
  const [activeTab, setActiveTab] = useState("observations");
  const [profile, setProfile] = useState(() =>
    user ? createDefaultProfile(user) : null
  );
  const [profileDraft, setProfileDraft] = useState(() =>
    user ? createDefaultProfile(user) : null
  );
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileNotice, setProfileNotice] = useState("");
  const [observations, setObservations] = useState([]);
  const [savedRecords, setSavedRecords] = useState([]);
  const [collectionRecords, setCollectionRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordsError, setRecordsError] = useState("");
  const activeItems =
    activeTab === "observations"
      ? observations
      : activeTab === "saved"
        ? savedRecords
        : collectionRecords;
  const emptyMessage =
    activeTab === "observations"
      ? copy.observationsEmpty
      : activeTab === "saved"
        ? copy.savedEmpty
        : copy.collectionsEmpty;
  const displayUser = normalizeDashboardUser(user, profile);
  const personalAnalysis = useMemo(
    () => buildPersonalDreamAnalysis(observations, language, copy),
    [copy, language, observations]
  );

  useEffect(() => {
    document.title = copy.documentTitle;
  }, [copy.documentTitle]);

  useEffect(() => {
    setProfile((current) =>
      current ? { ...current, preferredLanguage: language } : current
    );
    setProfileDraft((current) =>
      current ? { ...current, preferredLanguage: language } : current
    );
  }, [language]);

  useEffect(() => {
    if (!user?.uid) return undefined;

    let ignore = false;

    async function loadRecords() {
      setRecordsLoading(true);
      setRecordsError("");

      try {
        const [profileData, ownedItems, savedItems, collectionItems] = await Promise.all([
          getOrCreateUserProfile(user),
          fetchOwnedRecords(user),
          fetchSavedRecords(user),
          fetchCollectionRecords(user),
        ]);

        if (ignore) return;

        setProfile(profileData);
        setProfileDraft(profileData);
        setObservations(ownedItems.map((item, index) => normalizeRecordItem(item, index)));
        setSavedRecords(
          savedItems.map((item, index) => normalizeRecordItem(item, index + 1))
        );
        setCollectionRecords(
          collectionItems.map((item, index) => normalizeRecordItem(item, index + 2))
        );
      } catch (error) {
        if (!ignore) {
          setRecordsError(error.message);
        }
      } finally {
        if (!ignore) {
          setRecordsLoading(false);
        }
      }
    }

    loadRecords();

    return () => {
      ignore = true;
    };
  }, [user]);

  const avatarText = useMemo(() => {
    if (displayUser.displayName) {
      return displayUser.displayName.slice(0, 2).toUpperCase();
    }

    if (displayUser.pseudoId) {
      return displayUser.pseudoId.replace("DREAMER-", "").slice(0, 2);
    }

    return "CD";
  }, [displayUser.displayName, displayUser.pseudoId]);

  async function handleSaveProfile() {
    if (!profileDraft) return;

    setProfileSaving(true);
    setProfileNotice("");

    try {
      await saveUserProfile(user, profileDraft);
      setProfile(profileDraft);
      setProfileNotice(copy.profileSaved);
    } catch (error) {
      setProfileNotice(error.message);
    } finally {
      setProfileSaving(false);
    }
  }

  async function handleRemove(id) {
    if (activeTab === "observations") {
      const record = observations.find((item) => item.id === id);

      if (record?.anonymousLocked) return;

      await deleteOwnedRecord(user, id);
      setObservations((current) => current.filter((item) => item.id !== id));
      return;
    }

    if (activeTab === "collections") {
      await removeCollectedRecord(user, id);
      setCollectionRecords((current) => current.filter((item) => item.id !== id));
      return;
    }

    await removeSavedRecord(user, id);
    setSavedRecords((current) => current.filter((item) => item.id !== id));
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030407] text-zinc-100 selection:bg-cyan-300/30 selection:text-cyan-50">
      <DashboardBackground />

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-center lg:justify-between">
          <button
            type="button"
            onClick={onOpenDatabase}
            className="group flex items-center gap-3 self-start"
          >
            <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-cyan-300/30 bg-cyan-300/10 shadow-[0_0_24px_rgba(34,211,238,.16)]">
              <span className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,.35),transparent_55%)]" />
              <span className="relative font-mono text-sm font-bold text-cyan-100">C∴</span>
            </span>
            <span>
              <span className="block font-mono text-xs uppercase tracking-[0.36em] text-cyan-200/80">
                CDDB
              </span>
              <span className="block text-sm font-semibold text-zinc-100">
                {copy.databaseButton}
              </span>
            </span>
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onOpenRecorder}
              className="rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.18em] text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-300/15"
            >
              {copy.recordButton}
            </button>
            <LanguageToggle language={language} setLanguage={setLanguage} copy={copy} />
            <button
              type="button"
              onClick={onSignOut}
              className="rounded-xl border border-red-300/25 bg-red-400/5 px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.2em] text-red-100 transition hover:border-red-300/45 hover:bg-red-400/10"
            >
              {copy.signOut}
            </button>
          </div>
        </header>

        <section className="mb-6 overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/75 shadow-terminal backdrop-blur">
          <div className="grid gap-0 lg:grid-cols-[1.2fr_.8fr]">
            <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-7">
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-cyan-300/30 bg-cyan-300/10 shadow-[0_0_34px_rgba(34,211,238,.16)]">
                <span className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,.35),transparent_58%)]" />
                <span className="relative font-mono text-xl font-bold text-cyan-100">
                  {avatarText}
                </span>
              </div>

              <div className="min-w-0">
                <p className="font-mono text-xs uppercase tracking-[0.34em] text-cyan-200/70">
                  {copy.consoleLabel}
                </p>
                <h1 className="mt-2 truncate text-2xl font-semibold text-zinc-50 sm:text-3xl">
                  {displayUser.displayName || displayUser.pseudoId || copy.privateAccountLabel}
                </h1>
                <p className="mt-2 truncate font-mono text-xs uppercase tracking-[0.18em] text-zinc-500">
                  {displayUser.showEmail && displayUser.email
                    ? displayUser.email
                    : copy.accountEmailHidden}
                </p>
                <p className="mt-2 font-mono text-xs uppercase tracking-[0.18em] text-zinc-500">
                  {displayUser.pseudoId} / {copy.memberSince} {displayUser.memberSince}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <ProfilePill label={copy.countryLabel} value={displayUser.country || "--"} />
                  <ProfilePill
                    label={copy.ageLabel}
                    value={
                      displayUser.showAge && displayUser.age
                        ? String(displayUser.age)
                        : copy.hiddenAge
                    }
                  />
                  <ProfilePill
                    label={copy.biologicalSexLabel}
                    value={
                      displayUser.showBiologicalSex && displayUser.biologicalSex
                        ? getBiologicalSexLabel(displayUser.biologicalSex, copy)
                        : copy.hiddenAge
                    }
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-3 border-t border-white/10 bg-black/30 p-5 sm:grid-cols-2 lg:grid-cols-4 lg:border-l lg:border-t-0 lg:p-7">
              <StatusBlock label={copy.observationCount} value={String(observations.length)} />
              <StatusBlock label={copy.savedCount} value={String(savedRecords.length)} />
              <StatusBlock label={copy.collectionsTab} value={String(collectionRecords.length)} />
              <StatusBlock
                label={copy.identityStatus}
                value={getLanguageName(displayUser.preferredLanguage || language, language)}
              />
            </div>
          </div>
        </section>

        {profileDraft && (
          <section className="mb-6 rounded-3xl border border-white/10 bg-zinc-950/60 p-4 backdrop-blur sm:p-5">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-mono text-xs uppercase tracking-[0.32em] text-cyan-200/70">
                {copy.accountDetails}
              </p>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-zinc-500">
                {copy.joinedDate}: {displayUser.memberSince}
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                  {copy.displayNameLabel}
                </span>
                <input
                  value={profileDraft.displayName || ""}
                  onChange={(event) =>
                    setProfileDraft((current) => ({
                      ...current,
                      displayName: event.target.value,
                    }))
                  }
                  placeholder={copy.displayNamePlaceholder}
                  className="w-full rounded-2xl border border-cyan-300/15 bg-black/40 px-4 py-3 font-mono text-sm text-cyan-50 outline-none transition placeholder:text-zinc-600 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20"
                />
              </label>

              <label className="block">
                <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                  {copy.countryLabel}
                </span>
                <input
                  value={profileDraft.country || ""}
                  onChange={(event) =>
                    setProfileDraft((current) => ({
                      ...current,
                      country: event.target.value,
                    }))
                  }
                  placeholder={copy.countryPlaceholder}
                  className="w-full rounded-2xl border border-cyan-300/15 bg-black/40 px-4 py-3 font-mono text-sm text-cyan-50 outline-none transition placeholder:text-zinc-600 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20"
                />
              </label>

              <label className="block">
                <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                  {copy.ageLabel}
                </span>
                <input
                  type="number"
                  min="0"
                  value={profileDraft.age || ""}
                  onChange={(event) =>
                    setProfileDraft((current) => ({
                      ...current,
                      age: event.target.value,
                    }))
                  }
                  placeholder={copy.agePlaceholder}
                  className="w-full rounded-2xl border border-cyan-300/15 bg-black/40 px-4 py-3 font-mono text-sm text-cyan-50 outline-none transition placeholder:text-zinc-600 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20"
                />
              </label>

              <label className="block">
                <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                  {copy.biologicalSexLabel}
                </span>
                <select
                  value={profileDraft.biologicalSex || "preferNotToSay"}
                  onChange={(event) =>
                    setProfileDraft((current) => ({
                      ...current,
                      biologicalSex: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-cyan-300/15 bg-black/40 px-4 py-3 font-mono text-sm text-cyan-50 outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20"
                >
                  {BIOLOGICAL_SEX_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {copy.biologicalSexOptions[option] || copy.biologicalSexPlaceholder}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                  {copy.preferredLanguageLabel}
                </span>
                <select
                  value={profileDraft.preferredLanguage || language}
                  onChange={(event) => {
                    const nextLanguage = event.target.value;
                    setProfileDraft((current) => ({
                      ...current,
                      preferredLanguage: nextLanguage,
                    }));
                    setLanguage(nextLanguage);
                  }}
                  className="w-full rounded-2xl border border-cyan-300/15 bg-black/40 px-4 py-3 font-mono text-sm text-cyan-50 outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20"
                >
                  {LANGUAGE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} / {getLanguageName(option.value, language)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <label className="flex min-h-12 items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={Boolean(profileDraft.showEmail)}
                    onChange={(event) =>
                      setProfileDraft((current) => ({
                        ...current,
                        showEmail: event.target.checked,
                      }))
                    }
                    className="h-4 w-4 accent-cyan-300"
                  />
                  <span className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-300">
                    {copy.showEmailLabel}
                  </span>
                </label>
                <label className="flex min-h-12 items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={Boolean(profileDraft.showAge)}
                    onChange={(event) =>
                      setProfileDraft((current) => ({
                        ...current,
                        showAge: event.target.checked,
                      }))
                    }
                    className="h-4 w-4 accent-cyan-300"
                  />
                  <span className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-300">
                    {copy.showAgeLabel}
                  </span>
                </label>
                <label className="flex min-h-12 items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={Boolean(profileDraft.showBiologicalSex)}
                    onChange={(event) =>
                      setProfileDraft((current) => ({
                        ...current,
                        showBiologicalSex: event.target.checked,
                      }))
                    }
                    className="h-4 w-4 accent-cyan-300"
                  />
                  <span className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-300">
                    {copy.showBiologicalSexLabel}
                  </span>
                </label>
              </div>

              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={profileSaving}
                className="rounded-2xl border border-cyan-300/35 bg-cyan-300 px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.2em] text-zinc-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {profileSaving ? "..." : copy.saveProfile}
              </button>
            </div>

            {profileNotice && (
              <p className="mt-3 font-mono text-xs uppercase tracking-[0.18em] text-cyan-100">
                {profileNotice}
              </p>
            )}
          </section>
        )}

        <PersonalAnalysisPanel stats={personalAnalysis} copy={copy} />

        <section className="mb-6 flex flex-col gap-4 rounded-3xl border border-white/10 bg-zinc-950/60 p-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div className="grid grid-cols-3 rounded-2xl border border-white/10 bg-black/40 p-1 sm:w-[36rem]">
            <TabButton
              active={activeTab === "observations"}
              onClick={() => setActiveTab("observations")}
            >
              {copy.observationsTab}
            </TabButton>
            <TabButton active={activeTab === "saved"} onClick={() => setActiveTab("saved")}>
              {copy.savedTab}
            </TabButton>
            <TabButton
              active={activeTab === "collections"}
              onClick={() => setActiveTab("collections")}
            >
              {copy.collectionsTab}
            </TabButton>
          </div>

          <p className="font-mono text-xs uppercase tracking-[0.22em] text-zinc-500">
            {copy.lastSync}: 2026-06-23 03:18
          </p>
        </section>

        {recordsError && (
          <div className="mb-6 rounded-2xl border border-amber-300/20 bg-amber-300/5 p-4 font-mono text-xs leading-6 text-amber-100">
            {recordsError}
          </div>
        )}

        {recordsLoading ? (
          <LoadingState
            label={
              copy.recordsLoading ||
              (language === "zh" ? "正在載入個人紀錄" : "Loading personal records")
            }
          />
        ) : activeItems.length > 0 ? (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {activeItems.map((item) => (
              <RecordCard
                key={item.id}
                item={item}
                language={language}
                copy={copy}
                actionLabel={
                  activeTab === "observations"
                    ? item.anonymousLocked
                      ? copy.lockedButton
                      : copy.deleteButton
                    : copy.removeButton
                }
                onOpen={() => onOpenRecord?.(item)}
                onRemove={() => handleRemove(item.id)}
                locked={activeTab === "observations" && item.anonymousLocked}
              />
            ))}
          </section>
        ) : (
          <EmptyState message={emptyMessage} />
        )}
      </div>
    </main>
  );
}

function normalizeDashboardUser(user, profile) {
  if (!user) {
    return {
      email: "dreamer@example.com",
      pseudoId: "DREAMER-7F3A9C",
      memberSince: "2026-06-23",
      displayName: "",
      country: "",
      age: "",
      showEmail: false,
      showAge: false,
      biologicalSex: "",
      showBiologicalSex: false,
      preferredLanguage: "zh",
    };
  }

  const uidSeed = user.uid?.slice(0, 6).toUpperCase().padEnd(6, "0") || "000000";
  const createdAt = user.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toISOString().slice(0, 10)
    : "2026-06-23";

  return {
    email: user.email || "anonymous@collective.local",
    pseudoId: `DREAMER-${uidSeed}`,
    memberSince: profile?.joinedAt || createdAt,
    displayName: profile?.displayName || user.displayName || "",
    country: profile?.country || "",
    age: profile?.age || "",
    showEmail: Boolean(profile?.showEmail),
    showAge: Boolean(profile?.showAge),
    biologicalSex: profile?.biologicalSex || "",
    showBiologicalSex: Boolean(profile?.showBiologicalSex),
    preferredLanguage: normalizeLanguage(profile?.preferredLanguage || "zh"),
  };
}

function getBiologicalSexLabel(value, copy) {
  return copy.biologicalSexOptions?.[value] || copy.biologicalSexPlaceholder || "--";
}

function normalizeRecordItem(item, index) {
  const accents = ["cyan", "fuchsia", "violet"];
  const id = item.id || item.recordId;
  const originalLanguage = normalizeLanguage(
    item.originalLanguage || item.original_language || "en"
  );
  const title = item.title || "";
  const titleZh = item.titleZh || item.title_zh || "";
  const titleEs = item.titleEs || item.title_es || "";
  const text = item.dream_text || item.text || item.excerpt || "";
  const textZh = item.dream_text_zh || item.textZh || item.excerpt_zh || item.excerpt || "";
  const textEs = item.dream_text_es || item.textEs || item.excerpt_es || item.excerpt || "";
  const images = normalizeDreamImages(item);
  const imageUrls = images.map((image) => image.url).filter(Boolean);
  const thumbnailUrl = getPrimaryDreamImageUrl(item);
  const dreamDate = getVisibleDreamDate(item);
  const dreamDateStatus = getDreamDateStatus(item);

  return {
    id,
    recordId: item.recordId || id,
    dream_id: item.dream_id || item.recordId || id,
    originalLanguage,
    originalTitle:
      item.originalTitle ||
      item.original_title ||
      getLanguageSpecificRecordValue({ title, titleZh, titleEs }, "title", originalLanguage),
    originalText:
      item.originalText ||
      item.original_text ||
      getLanguageSpecificRecordValue({ text, textZh, textEs }, "text", originalLanguage),
    translations: item.translations || {},
    title,
    titleZh,
    titleEs,
    text,
    textZh,
    textEs,
    images,
    dreamImages: images,
    imageUrls,
    pictureUrls: imageUrls,
    thumbnailUrl,
    thumbnail_url: thumbnailUrl,
    generated_image_url: thumbnailUrl,
    dreamDate,
    dreamDateStatus,
    dream_date_status: dreamDateStatus,
    ageAtDream: item.ageAtDream || "",
    ownerId: item.ownerId || item.creatorId || "",
    creatorId: item.creatorId || item.ownerId || "",
    anonymousLocked: Boolean(item.anonymousLocked),
    recordIdentityMode:
      item.recordIdentityMode === "account" || item.attributionMode === "account"
        ? "account"
        : "anonymous",
    creatorDisplayName: item.creatorDisplayName || "",
    pseudoId: item.pseudoId || item.pseudo_id || "",
    visibility: item.visibility || (item.isPublic === false ? "private" : "public"),
    tags: Array.isArray(item.tags) ? item.tags : [],
    environmentTags: Array.isArray(item.environmentTags) ? item.environmentTags : [],
    entityTags: Array.isArray(item.entityTags) ? item.entityTags : [],
    anomalyTags: Array.isArray(item.anomalyTags)
      ? item.anomalyTags
      : Array.isArray(item.anomaly_tag_slugs)
        ? item.anomaly_tag_slugs
        : [],
    emotionTags: Array.isArray(item.emotionTags) ? item.emotionTags : [],
    styleTags: Array.isArray(item.styleTags) ? item.styleTags : [],
    eraTags: Array.isArray(item.eraTags) ? item.eraTags : [],
    weatherTags: Array.isArray(item.weatherTags) ? item.weatherTags : [],
    dreamTypeTags: Array.isArray(item.dreamTypeTags) ? item.dreamTypeTags : [],
    perspectiveTags: Array.isArray(item.perspectiveTags) ? item.perspectiveTags : [],
    psychologicalObservableTags: Array.isArray(item.psychologicalObservableTags)
      ? item.psychologicalObservableTags
      : [],
    dreamAnalysisTags: Array.isArray(item.dreamAnalysisTags)
      ? item.dreamAnalysisTags
      : [],
    customTags: Array.isArray(item.customTags) ? item.customTags : [],
    adultContent: Boolean(item.adultContent || item.adult_content || item.isAdult || item.is_adult),
    minimumViewerAge: item.minimumViewerAge || item.minimum_viewer_age || 0,
    date: formatRecordDate(dreamDate),
    hash: item.hash || `VX-${String(id || "record").slice(0, 8).toUpperCase()}`,
    accent: item.accent || accents[index % accents.length],
  };
}

function getLanguageSpecificRecordValue(record, field, language) {
  const normalizedLanguage = normalizeLanguage(language);

  if (field === "title") {
    if (normalizedLanguage === "zh") return record.titleZh || record.title_zh || "";
    if (normalizedLanguage === "es") return record.titleEs || record.title_es || "";
    return record.title || record.titleEn || record.title_en || "";
  }

  if (normalizedLanguage === "zh") return record.textZh || record.text_zh || "";
  if (normalizedLanguage === "es") return record.textEs || record.text_es || "";
  return record.text || record.textEn || record.text_en || "";
}

function formatRecordDate(value) {
  if (!value) return "";
  if (typeof value === "string") return value.slice(0, 10);
  if (typeof value.toDate === "function") return value.toDate().toISOString().slice(0, 10);
  if (value instanceof Date) return value.toISOString().slice(0, 10);

  return "";
}

function getRecordDateDisplay(item, copy) {
  if (item.dreamDateStatus === "hidden") return copy.hiddenDate;
  return item.date || copy.unknownDate;
}

function buildPersonalDreamAnalysis(items, language, copy) {
  const languageCounts = new Map();
  const emotionCounts = new Map();
  const dreamTypeCounts = new Map();
  const psychologyCounts = new Map();
  const analysisCounts = new Map();
  let adultCount = 0;
  let ageTotal = 0;
  let ageCount = 0;

  items.forEach((item) => {
    const originalLanguage = normalizeLanguage(item.originalLanguage);
    languageCounts.set(originalLanguage, (languageCounts.get(originalLanguage) || 0) + 1);

    if (item.adultContent || Number(item.minimumViewerAge || 0) >= 18) {
      adultCount += 1;
    }

    const ageAtDream = Number(item.ageAtDream);
    if (Number.isFinite(ageAtDream) && ageAtDream > 0) {
      ageTotal += ageAtDream;
      ageCount += 1;
    }

    getEmotionLabels(item, language).forEach((emotion) => {
      emotionCounts.set(emotion, (emotionCounts.get(emotion) || 0) + 1);
    });

    getCategoryTagLabels(item, "Dream Types", language).forEach((label) => {
      dreamTypeCounts.set(label, (dreamTypeCounts.get(label) || 0) + 1);
    });

    getCategoryTagLabels(item, "Psychological Observables", language).forEach((label) => {
      psychologyCounts.set(label, (psychologyCounts.get(label) || 0) + 1);
    });

    getCategoryTagLabels(item, "Dream Analysis", language).forEach((label) => {
      analysisCounts.set(label, (analysisCounts.get(label) || 0) + 1);
    });
  });

  const leadingLanguage = getTopMapEntry(languageCounts);
  const leadingEmotion = getTopMapEntry(emotionCounts);
  const leadingDreamType = getTopMapEntry(dreamTypeCounts);
  const leadingPsychology = getTopMapEntry(psychologyCounts);
  const leadingAnalysis = getTopMapEntry(analysisCounts);

  return {
    total: items.length,
    adultCount,
    leadingLanguage: leadingLanguage
      ? getLanguageName(leadingLanguage, language)
      : copy.analysisNoData,
    leadingEmotion: leadingEmotion || copy.analysisNoData,
    leadingDreamType: leadingDreamType || copy.analysisNoData,
    leadingPsychology: leadingPsychology || copy.analysisNoData,
    leadingAnalysis: leadingAnalysis || copy.analysisNoData,
    averageAge: ageCount > 0 ? Math.round(ageTotal / ageCount) : copy.analysisNoData,
  };
}

function getEmotionLabels(item, language) {
  const labels = [];
  const seen = new Set();

  function addLabel(key, label) {
    if (!label || seen.has(key)) return;
    seen.add(key);
    labels.push(label);
  }

  item.tags
    ?.filter((tag) => tag.category === "Emotions")
    .forEach((tag) => {
      const key = tag.slug || tag.name;

      if (language === "zh") {
        addLabel(key, tag.name_zh || tag.nameZh || tag.name);
        return;
      }

      if (language === "es") {
        addLabel(key, tag.name_es || tag.nameEs || tag.name);
        return;
      }

      addLabel(key, tag.name);
    });

  item.emotionTags?.forEach((emotion) => {
    addLabel(emotion, getEmotionFallbackLabel(emotion, language));
  });

  return labels;
}

function getCategoryTagLabels(item, category, language) {
  const labels = [];
  const seen = new Set();

  item.tags
    ?.filter((tag) => tag.category === category)
    .forEach((tag) => {
      const key = tag.slug || tag.name;
      if (!key || seen.has(key)) return;
      seen.add(key);
      labels.push(getTagLabel(tag, language));
    });

  return labels;
}

function getEmotionFallbackLabel(emotion, language) {
  if (RECORD_TAGS[emotion]) {
    return getTagLabel(RECORD_TAGS[emotion], language);
  }

  const labels = {
    awe: { en: "Awe", zh: "敬畏", es: "Asombro" },
    fear: { en: "Fear", zh: "恐懼", es: "Miedo" },
    calm: { en: "Calm", zh: "平靜", es: "Calma" },
    grief: { en: "Grief", zh: "悲傷", es: "Duelo" },
    desire: { en: "Desire", zh: "渴望", es: "Deseo" },
    confusion: { en: "Confusion", zh: "困惑", es: "Confusión" },
  };

  return labels[emotion]?.[language] || labels[emotion]?.en || emotion;
}

function getTopMapEntry(map) {
  let topKey = "";
  let topValue = 0;

  map.forEach((value, key) => {
    if (value > topValue) {
      topKey = key;
      topValue = value;
    }
  });

  return topKey;
}

function DashboardBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute left-1/2 top-[-22rem] h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute bottom-[-16rem] right-[-10rem] h-[36rem] w-[36rem] rounded-full bg-fuchsia-500/10 blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] bg-[size:44px_44px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,.10),transparent_34rem)]" />
    </div>
  );
}

function LanguageToggle({ language, setLanguage, copy }) {
  return <LanguageMenu language={language} setLanguage={setLanguage} copy={copy} />;
}

function PersonalAnalysisPanel({ stats, copy }) {
  return (
    <section className="mb-6 rounded-3xl border border-cyan-300/15 bg-zinc-950/60 p-4 shadow-[0_0_34px_rgba(34,211,238,.06)] backdrop-blur sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.32em] text-cyan-200/70">
            {copy.analysisTitle}
          </p>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
            {copy.analysisText}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatusBlock label={copy.analysisTotal} value={String(stats.total)} />
        <StatusBlock label={copy.analysisAdult} value={String(stats.adultCount)} />
        <StatusBlock label={copy.analysisLanguageLead} value={stats.leadingLanguage} />
        <StatusBlock label={copy.analysisEmotionLead} value={stats.leadingEmotion} />
        <StatusBlock label={copy.analysisDreamTypeLead} value={stats.leadingDreamType} />
        <StatusBlock label={copy.analysisPsychologyLead} value={stats.leadingPsychology} />
        <StatusBlock label={copy.analysisAnalysisLead} value={stats.leadingAnalysis} />
        <StatusBlock label={copy.analysisAverageAge} value={String(stats.averageAge)} />
      </div>
    </section>
  );
}

function ProfilePill({ label, value }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-300">
      <span className="text-zinc-500">{label}: </span>
      <span className="text-cyan-100">{value}</span>
    </span>
  );
}

function StatusBlock({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </p>
      <p className="mt-2 truncate font-mono text-sm font-semibold text-cyan-100">
        {value}
      </p>
    </div>
  );
}

function TabButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={[
        "rounded-xl px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.18em] transition",
        active
          ? "bg-fuchsia-300 text-zinc-950 shadow-[0_0_20px_rgba(217,70,239,.18)]"
          : "text-zinc-500 hover:bg-white/5 hover:text-fuchsia-100",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function RecordCard({ item, language, copy, actionLabel, onOpen, onRemove, locked = false }) {
  const [thumbnailFailed, setThumbnailFailed] = useState(false);
  const style = ACCENT_STYLES[item.accent] || ACCENT_STYLES.cyan;
  const title =
    normalizeLanguage(language) === item.originalLanguage
      ? item.originalTitle || item.title
      : item.translations?.[language]?.title ||
        (language === "zh" ? item.titleZh : language === "es" ? item.titleEs : item.title);
  const showThumbnail = Boolean(item.thumbnailUrl && !thumbnailFailed);

  return (
    <article
      onClick={onOpen}
      className={[
        "cursor-pointer overflow-hidden rounded-3xl border bg-zinc-950/80 backdrop-blur transition duration-300 hover:-translate-y-1",
        style.border,
        style.glow,
      ].join(" ")}
    >
      {showThumbnail && (
        <div className="relative h-44 border-b border-white/10 bg-black">
          <img
            src={item.thumbnailUrl}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover opacity-90"
            onError={() => setThumbnailFailed(true)}
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px)] bg-[size:28px_28px] opacity-20" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-zinc-950/90 to-transparent" />
          <div className="absolute bottom-4 left-4 rounded-xl border border-white/10 bg-black/45 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-100 backdrop-blur">
            {item.hash}
          </div>
          <span className={`absolute right-4 top-4 h-3 w-3 rounded-full ${style.dot}`} />
        </div>
      )}

      <div className="p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500">
            {getRecordDateDisplay(item, copy)}
          </span>
        </div>
        {title && <h2 className="text-xl font-semibold text-zinc-50">{title}</h2>}
        <p className="mt-3 inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-cyan-100">
          {copy.originalLanguageLabel}: {getLanguageName(item.originalLanguage, language)}
        </p>

        <button
          type="button"
          disabled={locked}
          onClick={(event) => {
            event.stopPropagation();
            if (locked) return;
            onRemove();
          }}
          className={[
            "mt-5 w-full rounded-xl border px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.2em] transition",
            locked
              ? "cursor-not-allowed border-white/10 bg-white/[0.03] text-zinc-500"
              : "border-red-300/20 bg-red-400/5 text-red-100 hover:border-red-300/45 hover:bg-red-400/10",
          ].join(" ")}
        >
          {actionLabel}
        </button>
      </div>
    </article>
  );
}

function LoadingState({ label }) {
  return (
    <section className="rounded-3xl border border-cyan-300/20 bg-cyan-300/5 p-10 text-center shadow-[0_0_40px_rgba(34,211,238,.06)]">
      <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-cyan-200 border-t-transparent" />
      <p className="font-mono text-sm uppercase tracking-[0.24em] text-cyan-100">
        {label}
      </p>
    </section>
  );
}

function EmptyState({ message }) {
  return (
    <section className="rounded-3xl border border-dashed border-cyan-300/20 bg-cyan-300/5 p-10 text-center shadow-[0_0_40px_rgba(34,211,238,.06)]">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/25 bg-black/40">
        <span className="font-mono text-lg text-cyan-100">∅</span>
      </div>
      <p className="font-mono text-sm uppercase tracking-[0.24em] text-cyan-100">
        {message}
      </p>
    </section>
  );
}
