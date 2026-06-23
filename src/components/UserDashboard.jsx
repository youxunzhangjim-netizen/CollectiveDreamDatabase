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
import { LANGUAGE_OPTIONS } from "../lib/language.js";

const DASHBOARD_COPY = {
  en: {
    documentTitle: "Personal Dream Console",
    languageLabel: "Switch interface language",
    englishLabel: "English interface",
    chineseLabel: "Traditional Chinese interface",
    spanishLabel: "Spanish interface",
    databaseButton: "Public Database",
    consoleLabel: "Authenticated User Console",
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
    observationCount: "Observations",
    savedCount: "Saved",
    identityStatus: "Identity Mask",
    activeStatus: "Active",
    lastSync: "Last Sync",
    recordsLoading: "Decrypting personal records",
    accountDetails: "Account Details",
    countryLabel: "Country",
    countryPlaceholder: "Taiwan, United States...",
    ageLabel: "Age",
    agePlaceholder: "Optional",
    showAgeLabel: "Show age publicly",
    saveProfile: "Save Profile",
    profileSaved: "Profile saved",
    joinedDate: "Joined",
    hiddenAge: "Hidden",
  },
  zh: {
    documentTitle: "個人夢境終端",
    languageLabel: "切換介面語言",
    englishLabel: "英文介面",
    chineseLabel: "繁體中文介面",
    spanishLabel: "西班牙文介面",
    databaseButton: "公開資料庫",
    consoleLabel: "已驗證使用者終端",
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
    observationCount: "觀測",
    savedCount: "已儲存",
    identityStatus: "身分遮罩",
    activeStatus: "啟用中",
    lastSync: "最後同步",
    accountDetails: "帳戶資料",
    countryLabel: "國家／地區",
    countryPlaceholder: "台灣、美國...",
    ageLabel: "年齡",
    agePlaceholder: "選填",
    showAgeLabel: "公開顯示年齡",
    saveProfile: "儲存個人資料",
    profileSaved: "個人資料已儲存",
    joinedDate: "加入日期",
    hiddenAge: "已隱藏",
  },
  es: {
    documentTitle: "Consola personal de sueños",
    languageLabel: "Cambiar idioma de la interfaz",
    englishLabel: "Interfaz en inglés",
    chineseLabel: "Interfaz en chino tradicional",
    spanishLabel: "Interfaz en español",
    databaseButton: "Base pública",
    consoleLabel: "Consola de usuario autenticado",
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
    observationCount: "Observaciones",
    savedCount: "Guardados",
    identityStatus: "Máscara de identidad",
    activeStatus: "Activa",
    lastSync: "Última sincronización",
    recordsLoading: "Descifrando registros personales",
    accountDetails: "Datos de la cuenta",
    countryLabel: "País / región",
    countryPlaceholder: "Taiwán, Estados Unidos...",
    ageLabel: "Edad",
    agePlaceholder: "Opcional",
    showAgeLabel: "Mostrar edad públicamente",
    saveProfile: "Guardar perfil",
    profileSaved: "Perfil guardado",
    joinedDate: "Fecha de ingreso",
    hiddenAge: "Oculta",
  },
};

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
    if (displayUser.pseudoId) {
      return displayUser.pseudoId.replace("DREAMER-", "").slice(0, 2);
    }

    return displayUser.email.slice(0, 2).toUpperCase();
  }, [displayUser.email, displayUser.pseudoId]);

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
              {displayUser.avatarUrl ? (
                <img
                  src={displayUser.avatarUrl}
                  alt=""
                  className="h-20 w-20 rounded-2xl border border-cyan-300/30 object-cover"
                />
              ) : (
                <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-cyan-300/30 bg-cyan-300/10 shadow-[0_0_34px_rgba(34,211,238,.16)]">
                  <span className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,.35),transparent_58%)]" />
                  <span className="relative font-mono text-xl font-bold text-cyan-100">
                    {avatarText}
                  </span>
                </div>
              )}

              <div className="min-w-0">
                <p className="font-mono text-xs uppercase tracking-[0.34em] text-cyan-200/70">
                  {copy.consoleLabel}
                </p>
                <h1 className="mt-2 truncate text-2xl font-semibold text-zinc-50 sm:text-3xl">
                  {displayUser.email}
                </h1>
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
                </div>
              </div>
            </div>

            <div className="grid gap-3 border-t border-white/10 bg-black/30 p-5 sm:grid-cols-2 lg:grid-cols-4 lg:border-l lg:border-t-0 lg:p-7">
              <StatusBlock label={copy.observationCount} value={String(observations.length)} />
              <StatusBlock label={copy.savedCount} value={String(savedRecords.length)} />
              <StatusBlock label={copy.collectionsTab} value={String(collectionRecords.length)} />
              <StatusBlock label={copy.identityStatus} value={copy.activeStatus} />
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

            <div className="grid gap-3 lg:grid-cols-[1fr_.65fr_auto_auto] lg:items-end">
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
              (language === "zh" ? "正在解密個人紀錄" : "Decrypting personal records")
            }
          />
        ) : activeItems.length > 0 ? (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {activeItems.map((item) => (
              <RecordCard
                key={item.id}
                item={item}
                language={language}
                actionLabel={
                  activeTab === "observations" ? copy.deleteButton : copy.removeButton
                }
                onOpen={() => onOpenRecord?.(item)}
                onRemove={() => handleRemove(item.id)}
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
      avatarUrl: "",
      country: "",
      age: "",
      showAge: false,
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
    avatarUrl: user.photoURL || "",
    country: profile?.country || "",
    age: profile?.age || "",
    showAge: Boolean(profile?.showAge),
  };
}

function normalizeRecordItem(item, index) {
  const accents = ["cyan", "fuchsia", "violet"];
  const id = item.id || item.recordId;

  return {
    id,
    recordId: item.recordId || id,
    dream_id: item.dream_id || item.recordId || id,
    title: item.title || item.recordId || "Untitled Record",
    titleZh: item.titleZh || item.title_zh || item.title || item.recordId || "未命名紀錄",
    titleEs: item.titleEs || item.title_es || item.title || item.recordId || "Registro sin título",
    text: item.dream_text || item.text || item.excerpt || "",
    textZh: item.dream_text_zh || item.textZh || item.excerpt_zh || item.excerpt || "",
    textEs: item.dream_text_es || item.textEs || item.excerpt_es || item.excerpt || "",
    dreamDate: item.dreamDate || item.dream_date || item.date || "",
    ageAtDream: item.ageAtDream || "",
    ownerId: item.ownerId || item.creatorId || "",
    creatorId: item.creatorId || item.ownerId || "",
    pseudoId: item.pseudoId || item.pseudo_id || "",
    visibility: item.visibility || (item.isPublic === false ? "private" : "public"),
    date: formatRecordDate(item.dream_date || item.date || item.createdAt || item.savedAt),
    hash: item.hash || `VX-${String(id || "record").slice(0, 8).toUpperCase()}`,
    accent: item.accent || accents[index % accents.length],
  };
}

function formatRecordDate(value) {
  if (!value) return "2026-06-23";
  if (typeof value === "string") return value.slice(0, 10);
  if (typeof value.toDate === "function") return value.toDate().toISOString().slice(0, 10);
  if (value instanceof Date) return value.toISOString().slice(0, 10);

  return "2026-06-23";
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

function RecordCard({ item, language, actionLabel, onOpen, onRemove }) {
  const style = ACCENT_STYLES[item.accent] || ACCENT_STYLES.cyan;
  const title =
    language === "zh" ? item.titleZh : language === "es" ? item.titleEs : item.title;

  return (
    <article
      onClick={onOpen}
      className={[
        "cursor-pointer overflow-hidden rounded-3xl border bg-zinc-950/80 backdrop-blur transition duration-300 hover:-translate-y-1",
        style.border,
        style.glow,
      ].join(" ")}
    >
      <div className="relative h-44 border-b border-white/10" style={{ background: style.gradient }}>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px)] bg-[size:28px_28px] opacity-20" />
        <div className="absolute bottom-4 left-4 rounded-xl border border-white/10 bg-black/45 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-100 backdrop-blur">
          {item.hash}
        </div>
        <span className={`absolute right-4 top-4 h-3 w-3 rounded-full ${style.dot}`} />
      </div>

      <div className="p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500">
            {item.date}
          </span>
        </div>
        <h2 className="min-h-14 text-xl font-semibold text-zinc-50">{title}</h2>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
          className="mt-5 w-full rounded-xl border border-red-300/20 bg-red-400/5 px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.2em] text-red-100 transition hover:border-red-300/45 hover:bg-red-400/10"
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
