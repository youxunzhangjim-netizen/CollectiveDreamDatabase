import { useEffect, useMemo, useState } from "react";
import {
  deleteOwnedRecord,
  fetchCollectionRecords,
  fetchOwnedRecords,
  fetchSavedRecords,
  removeCollectedRecord,
  removeSavedRecord,
  calculateDreamSignalCoherence,
  updateOwnedRecordSharing,
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
import {
  exportPersonalDreamsCsv,
  exportPersonalDreamsJson,
  EXPORT_DETAIL_LEVELS,
} from "../lib/researchExportService.js";
import { suggestTagsForDream } from "../lib/dreamDiaryImportService.js";
import LanguageMenu from "./LanguageMenu.jsx";

const DASHBOARD_COPY = {
  en: {
    documentTitle: "Personal Dream Console",
    languageLabel: "Switch interface language",
    englishLabel: "English interface",
    chineseLabel: "Traditional Chinese interface",
    spanishLabel: "Spanish interface",
    databaseButton: "Research Archive",
    recordButton: "Record Dream",
    importButton: "Import Diary",
    exportCsvButton: "Export My CSV",
    exportJsonButton: "Export My JSON",
    exportScopeLabel: "Export content",
    exportScopeDreams: "Dream diary only",
    exportScopeCoded: "Dreams + tags",
    exportScopeAnalysis: "Full private fields",
    bulkShareTitle: "Share private observations",
    bulkShareText:
      "Apply one public sharing mode to every dream in My Observations. You can still edit individual dreams later.",
    shareAllAnonymous: "Share all anonymously",
    shareAllAccount: "Share all with account",
    bulkSharing: "Updating sharing...",
    bulkShareAnonymousDone: ({ count }) => `${count} dreams are now public as anonymous records.`,
    bulkShareAccountDone: ({ count }) => `${count} dreams are now public with account attribution.`,
    bulkShareFailed: "Some dreams could not be updated. Please try again.",
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
    timeOrderLabel: "Dream order",
    timeNewest: "Newest first",
    timeOldest: "Oldest first",
    sortUpdated: "Recently amended",
    sortName: "Name A-Z",
    sortAuthor: "Recorder name",
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
    recordedBy: "Recorded by",
    anonymousObserver: "Anonymous Observer",
    unknownDate: "Date unknown",
    hiddenDate: "Date hidden",
    tagSuggestionHint: "New tag suggestions available",
    analysisTitle: "My Dream Map",
    analysisText:
      "A private pattern dashboard for self-reflection. It highlights recurring places, entities, symbols, emotions, lucid/nightmare frequency, similar dreams, and gentle questions generated locally from your tags and counts, not AI diagnosis.",
    analysisTotal: "Uploaded",
    analysisAdult: "Mature tagged",
    analysisFrequency: "Dream frequency",
    analysisRecurringPlaces: "Recurring places",
    analysisRecurringEntities: "Recurring people/entities",
    analysisCommonSymbols: "Common symbols",
    analysisLucidNightmare: "Lucid / nightmare",
    analysisSimilarDreams: "Similar dreams",
    analysisReflectionQuestions: "Questions for reflection",
    analysisPsychologyPatterns: "Psychological observables",
    analysisAnalysisMarkers: "Dream-analysis markers",
    analysisWeatherPatterns: "Weather / atmosphere",
    analysisPerspectivePatterns: "Viewpoint patterns",
    analysisStylePatterns: "Visual style",
    analysisEraPatterns: "Era / time setting",
    analysisDreamTypeLead: "Leading dream type",
    analysisPsychologyLead: "Leading psyche signal",
    analysisAnalysisLead: "Leading analysis marker",
    analysisLanguageLead: "Leading language",
    analysisEmotionLead: "Leading emotion",
    analysisAverageAge: "Avg dream age",
    analysisNoData: "No data yet",
    analysisVisualsButton: "Open visual map",
    analysisVisualsTitle: "Personal analysis visual map",
    analysisVisualsText:
      "A local diagram view generated from your own dream records, tags, dates, language, and descriptive markers. It is for reflection, not diagnosis.",
    closeVisuals: "Close",
  },
  zh: {
    documentTitle: "個人夢境終端",
    languageLabel: "切換介面語言",
    englishLabel: "英文介面",
    chineseLabel: "繁體中文介面",
    spanishLabel: "西班牙文介面",
    databaseButton: "研究檔案庫",
    recordButton: "記錄夢境",
    importButton: "匯入日記",
    exportCsvButton: "匯出 CSV",
    exportJsonButton: "匯出 JSON",
    exportScopeLabel: "匯出內容",
    exportScopeDreams: "只匯出夢境日記",
    exportScopeCoded: "夢境與標籤",
    exportScopeAnalysis: "完整私人欄位",
    bulkShareTitle: "批次公開私人觀測",
    bulkShareText: "把「我的觀測」中的所有夢境套用同一種公開方式。之後仍可逐則修改。",
    shareAllAnonymous: "全部匿名公開",
    shareAllAccount: "全部以帳戶公開",
    bulkSharing: "正在更新公開狀態...",
    bulkShareAnonymousDone: ({ count }) => `已將 ${count} 則夢境設為匿名公開。`,
    bulkShareAccountDone: ({ count }) => `已將 ${count} 則夢境設為帳戶署名公開。`,
    bulkShareFailed: "部分夢境無法更新，請再試一次。",
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
    timeOrderLabel: "夢境排序",
    timeNewest: "最新在前",
    timeOldest: "最舊在前",
    sortUpdated: "最近修改",
    sortName: "名稱 A-Z",
    sortAuthor: "記錄者名稱",
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
    recordedBy: "記錄者",
    anonymousObserver: "匿名觀察者",
    unknownDate: "日期不確定",
    hiddenDate: "日期已隱藏",
    tagSuggestionHint: "可加入新的標籤建議",
    analysisTitle: "我的夢境地圖",
    analysisText: "只根據此帳戶夢境建立的私人模式儀表板，用於自我反思。它會整理重複場景、人物／實體、符號、情緒、清醒夢／惡夢、相似夢境與反思問題；這些問題由標籤與次數在本機規則生成，不是 AI 診斷。",
    analysisTotal: "已上傳",
    analysisAdult: "成人標記",
    analysisFrequency: "夢境頻率",
    analysisRecurringPlaces: "重複場景",
    analysisRecurringEntities: "重複人物／實體",
    analysisCommonSymbols: "常見符號",
    analysisLucidNightmare: "清醒夢／惡夢",
    analysisSimilarDreams: "相似夢境",
    analysisReflectionQuestions: "反思問題",
    analysisPsychologyPatterns: "心理觀察項",
    analysisAnalysisMarkers: "夢境分析標記",
    analysisWeatherPatterns: "天氣／氣氛",
    analysisPerspectivePatterns: "視角模式",
    analysisStylePatterns: "視覺風格",
    analysisEraPatterns: "時代／時間背景",
    analysisDreamTypeLead: "主要夢境類型",
    analysisPsychologyLead: "主要心理訊號",
    analysisAnalysisLead: "主要分析標記",
    analysisLanguageLead: "主要語言",
    analysisEmotionLead: "主要情緒",
    analysisAverageAge: "平均夢中年齡",
    analysisNoData: "尚無資料",
    analysisVisualsButton: "開啟視覺圖表",
    analysisVisualsTitle: "個人分析視覺圖",
    analysisVisualsText:
      "由你的夢境記錄、標籤、日期、語言與描述性標記在本機產生的圖表視圖，用於自我反思，不是診斷。",
    closeVisuals: "關閉",
  },
  es: {
    documentTitle: "Consola personal de sueños",
    languageLabel: "Cambiar idioma de la interfaz",
    englishLabel: "Interfaz en inglés",
    chineseLabel: "Interfaz en chino tradicional",
    spanishLabel: "Interfaz en español",
    databaseButton: "Archivo de investigación",
    recordButton: "Registrar sueño",
    importButton: "Importar diario",
    exportCsvButton: "Exportar CSV",
    exportJsonButton: "Exportar JSON",
    exportScopeLabel: "Contenido exportado",
    exportScopeDreams: "Solo diario",
    exportScopeCoded: "Sueños + etiquetas",
    exportScopeAnalysis: "Campos privados completos",
    bulkShareTitle: "Compartir observaciones privadas",
    bulkShareText:
      "Aplica un modo público a todos los sueños de Mis observaciones. Luego puedes editar cada sueño por separado.",
    shareAllAnonymous: "Compartir todo anónimo",
    shareAllAccount: "Compartir todo con cuenta",
    bulkSharing: "Actualizando...",
    bulkShareAnonymousDone: ({ count }) => `${count} sueños ahora son públicos como registros anónimos.`,
    bulkShareAccountDone: ({ count }) => `${count} sueños ahora son públicos con atribución de cuenta.`,
    bulkShareFailed: "Algunos sueños no se pudieron actualizar. Inténtalo de nuevo.",
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
    timeOrderLabel: "Orden de sueños",
    timeNewest: "Más reciente primero",
    timeOldest: "Más antiguo primero",
    sortUpdated: "Modificado reciente",
    sortName: "Nombre A-Z",
    sortAuthor: "Nombre del registrador",
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
    recordedBy: "Registrado por",
    anonymousObserver: "Observador anónimo",
    unknownDate: "Fecha desconocida",
    hiddenDate: "Fecha oculta",
    tagSuggestionHint: "Hay nuevas etiquetas sugeridas",
    analysisTitle: "Mi mapa de sueños",
    analysisText:
      "Panel privado de patrones para autorreflexión. Destaca lugares, entidades, símbolos, emociones, sueños lúcidos/pesadillas, sueños similares y preguntas generadas localmente desde etiquetas y conteos, no como diagnóstico de IA.",
    analysisTotal: "Subidos",
    analysisAdult: "Madurez marcada",
    analysisFrequency: "Frecuencia",
    analysisRecurringPlaces: "Lugares recurrentes",
    analysisRecurringEntities: "Personas/entidades",
    analysisCommonSymbols: "Símbolos comunes",
    analysisLucidNightmare: "Lúcido / pesadilla",
    analysisSimilarDreams: "Sueños similares",
    analysisReflectionQuestions: "Preguntas de reflexión",
    analysisPsychologyPatterns: "Observables psicológicos",
    analysisAnalysisMarkers: "Marcadores de análisis onírico",
    analysisWeatherPatterns: "Clima / atmósfera",
    analysisPerspectivePatterns: "Patrones de punto de vista",
    analysisStylePatterns: "Estilo visual",
    analysisEraPatterns: "Época / tiempo",
    analysisDreamTypeLead: "Tipo principal",
    analysisPsychologyLead: "Señal psíquica principal",
    analysisAnalysisLead: "Marcador principal",
    analysisLanguageLead: "Idioma principal",
    analysisEmotionLead: "Emoción principal",
    analysisAverageAge: "Edad media",
    analysisNoData: "Sin datos",
    analysisVisualsButton: "Abrir mapa visual",
    analysisVisualsTitle: "Mapa visual de análisis personal",
    analysisVisualsText:
      "Una vista de diagramas local generada desde tus propios registros, etiquetas, fechas, idioma y marcadores descriptivos. Es para reflexión, no diagnóstico.",
    closeVisuals: "Cerrar",
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
  onOpenImporter,
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
  const [bulkSharingMode, setBulkSharingMode] = useState("");
  const [bulkShareNotice, setBulkShareNotice] = useState("");
  const [exportDetail, setExportDetail] = useState(EXPORT_DETAIL_LEVELS.ANALYSIS);
  const [timeOrder, setTimeOrder] = useState("desc");
  const exportDetailOptions = [
    { value: EXPORT_DETAIL_LEVELS.DREAMS, label: copy.exportScopeDreams },
    { value: EXPORT_DETAIL_LEVELS.CODED, label: copy.exportScopeCoded },
    { value: EXPORT_DETAIL_LEVELS.ANALYSIS, label: copy.exportScopeAnalysis },
  ];
  const activeItems =
    activeTab === "observations"
      ? observations
      : activeTab === "saved"
        ? savedRecords
        : collectionRecords;
  const orderedActiveItems = useMemo(
    () =>
      [...activeItems].sort((a, b) => {
        if (timeOrder === "updated") {
          return compareNullableMillis(getRecordUpdatedMillis(a), getRecordUpdatedMillis(b), "desc");
        }

        if (timeOrder === "name") {
          return getDisplayItemTitle(a, language).localeCompare(
            getDisplayItemTitle(b, language),
            language === "zh" ? "zh-Hant" : language === "es" ? "es" : "en"
          );
        }

        if (timeOrder === "author") {
          return getItemAuthorName(a, copy).localeCompare(
            getItemAuthorName(b, copy),
            language === "zh" ? "zh-Hant" : language === "es" ? "es" : "en"
          );
        }

        const first = getRecordSortMillis(a);
        const second = getRecordSortMillis(b);

        return compareNullableMillis(first, second, timeOrder === "asc" ? "asc" : "desc");
      }),
    [activeItems, copy, language, timeOrder]
  );
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
  const lastSyncLabel = useMemo(() => formatLastSync(language), [language]);

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

  async function handleShareAll(sharingMode) {
    if (!user?.uid || observations.length === 0 || bulkSharingMode) return;

    setBulkSharingMode(sharingMode);
    setBulkShareNotice(copy.bulkSharing);

    try {
      const results = await Promise.allSettled(
        observations.map((record) =>
          updateOwnedRecordSharing(user, record.id, { sharingMode }, profile).then(
            () => record.id
          )
        )
      );
      const successfulIds = new Set(
        results
          .filter((result) => result.status === "fulfilled")
          .map((result) => result.value)
      );
      const sharingPatch = buildDashboardSharingPatch(sharingMode, user, profile);

      if (successfulIds.size > 0) {
        setObservations((current) =>
          current.map((item) =>
            successfulIds.has(item.id) ? { ...item, ...sharingPatch } : item
          )
        );
      }

      setBulkShareNotice(
        successfulIds.size === observations.length
          ? sharingMode === "public_pseudonym"
            ? copy.bulkShareAccountDone({ count: successfulIds.size })
            : copy.bulkShareAnonymousDone({ count: successfulIds.size })
          : copy.bulkShareFailed
      );
    } catch {
      setBulkShareNotice(copy.bulkShareFailed);
    } finally {
      setBulkSharingMode("");
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

      <div className="relative mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        <header className="mb-5 flex flex-col gap-3 border-b border-white/10 pb-4 lg:mb-6 lg:flex-row lg:items-center lg:justify-between lg:pb-5">
          <button
            type="button"
            onClick={onOpenDatabase}
            className="group flex min-w-0 items-center gap-3 self-start"
          >
            <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-cyan-300/30 bg-cyan-300/10 shadow-[0_0_24px_rgba(34,211,238,.16)] sm:h-10 sm:w-10">
              <span className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,.35),transparent_55%)]" />
              <span className="relative font-mono text-sm font-bold text-cyan-100">C∴</span>
            </span>
            <span className="min-w-0">
              <span className="block font-mono text-xs uppercase tracking-[0.36em] text-cyan-200/80">
                CDO
              </span>
              <span className="block truncate text-sm font-semibold text-zinc-100">
                {copy.databaseButton}
              </span>
            </span>
          </button>

          <div className="cdo-mobile-scroll-nav sm:grid sm:w-auto sm:grid-cols-4 sm:items-center sm:gap-3">
            <button
              type="button"
              onClick={onOpenRecorder}
              className="cdo-mobile-label min-w-0 rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-3 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-300/15 sm:px-4 sm:text-xs sm:tracking-[0.18em]"
            >
              {copy.recordButton}
            </button>
            <button
              type="button"
              onClick={onOpenImporter}
              className="cdo-mobile-label min-w-0 rounded-xl border border-fuchsia-300/25 bg-fuchsia-300/10 px-3 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-fuchsia-100 transition hover:border-fuchsia-300/45 hover:bg-fuchsia-300/15 sm:px-4 sm:text-xs sm:tracking-[0.18em]"
            >
              {copy.importButton}
            </button>
            <LanguageToggle language={language} setLanguage={setLanguage} copy={copy} />
            <button
              type="button"
              onClick={onSignOut}
              className="cdo-mobile-label col-span-2 min-w-0 rounded-xl border border-red-300/25 bg-red-400/5 px-3 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-red-100 transition hover:border-red-300/45 hover:bg-red-400/10 sm:col-span-1 sm:px-4 sm:text-xs sm:tracking-[0.2em]"
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

            <div className="border-t border-white/10 bg-black/30 p-5 lg:border-l lg:border-t-0 lg:p-7">
              <div className="grid gap-3 sm:grid-cols-2">
                <StatusBlock label={copy.observationCount} value={String(observations.length)} />
                <StatusBlock label={copy.savedCount} value={String(savedRecords.length)} />
                <StatusBlock label={copy.collectionsTab} value={String(collectionRecords.length)} />
                <StatusBlock
                  label={copy.identityStatus}
                  value={getLanguageName(displayUser.preferredLanguage || language, language)}
                />
              </div>

              <div className="mt-4 rounded-2xl border border-cyan-300/15 bg-cyan-300/5 p-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-100">
                  {copy.bulkShareTitle}
                </p>
                <p className="mt-2 text-xs leading-5 text-zinc-400">
                  {copy.bulkShareText}
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => handleShareAll("public_anonymous")}
                    disabled={observations.length === 0 || Boolean(bulkSharingMode)}
                    className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-100 transition hover:border-cyan-300/50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {bulkSharingMode === "public_anonymous"
                      ? copy.bulkSharing
                      : copy.shareAllAnonymous}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShareAll("public_pseudonym")}
                    disabled={
                      observations.length === 0 ||
                      Boolean(bulkSharingMode) ||
                      Boolean(user?.isAnonymous)
                    }
                    className="rounded-2xl border border-fuchsia-300/25 bg-fuchsia-300/10 px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-fuchsia-100 transition hover:border-fuchsia-300/45 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {bulkSharingMode === "public_pseudonym"
                      ? copy.bulkSharing
                      : copy.shareAllAccount}
                  </button>
                </div>
                {bulkShareNotice && (
                  <p className="mt-3 rounded-xl border border-white/10 bg-black/25 p-3 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-300">
                    {bulkShareNotice}
                  </p>
                )}
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-3">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                  {copy.exportScopeLabel}
                </p>
                <div className="grid gap-2 min-[520px]:grid-cols-3">
                  {exportDetailOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setExportDetail(option.value)}
                      className={[
                        "min-w-0 rounded-xl border px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] transition",
                        exportDetail === option.value
                          ? "border-cyan-300/35 bg-cyan-300/10 text-cyan-100"
                          : "border-white/10 bg-white/[0.03] text-zinc-400 hover:border-fuchsia-300/30 hover:text-fuchsia-100",
                      ].join(" ")}
                    >
                      <span className="block truncate">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="cdo-mobile-stack-actions mt-3 grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => exportPersonalDreamsCsv(observations, { language, detailLevel: exportDetail })}
                  disabled={observations.length === 0}
                  className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.18em] text-cyan-100 transition hover:border-cyan-300/50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {copy.exportCsvButton}
                </button>
                <button
                  type="button"
                  onClick={() => exportPersonalDreamsJson(observations, { language, detailLevel: exportDetail })}
                  disabled={observations.length === 0}
                  className="rounded-2xl border border-fuchsia-300/25 bg-fuchsia-300/10 px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.18em] text-fuchsia-100 transition hover:border-fuchsia-300/45 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {copy.exportJsonButton}
                </button>
              </div>
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

          <div className="flex flex-col gap-3 sm:items-end">
            <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-3 py-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                {copy.timeOrderLabel}
              </span>
              <select
                value={timeOrder}
                onChange={(event) => setTimeOrder(event.target.value)}
                className="rounded-xl border border-cyan-300/15 bg-black/40 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-50 outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20"
              >
                <option value="desc">{copy.timeNewest}</option>
                <option value="asc">{copy.timeOldest}</option>
                <option value="updated">{copy.sortUpdated}</option>
                <option value="name">{copy.sortName}</option>
                <option value="author">{copy.sortAuthor}</option>
              </select>
            </label>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-zinc-500">
              {copy.lastSync}: {lastSyncLabel}
            </p>
          </div>
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
        ) : orderedActiveItems.length > 0 ? (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {orderedActiveItems.map((item) => (
              <RecordCard
                key={item.id}
                item={item}
                language={language}
                copy={copy}
                actionLabel={
                  activeTab === "observations"
                    ? copy.deleteButton
                    : copy.removeButton
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

function formatLastSync(language) {
  const date = new Date();
  if (Number.isNaN(date.getTime())) return "—";

  const locale = language === "zh" ? "zh-Hant-TW" : language === "es" ? "es" : "en";

  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  } catch {
    return date.toISOString().slice(0, 16).replace("T", " ");
  }
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

function buildDashboardSharingPatch(sharingMode, user, profile) {
  const isPublic = sharingMode === "public_anonymous" || sharingMode === "public_pseudonym";
  const recordIdentityMode = sharingMode === "public_pseudonym" ? "account" : "anonymous";

  return {
    visibility: isPublic ? "public" : "private",
    isPublic,
    sharingMode,
    includedInResearchStats: isPublic || sharingMode === "stats_only",
    researchConsent: isPublic || sharingMode === "stats_only",
    publicConsent: isPublic,
    recordIdentityMode,
    attributionMode: recordIdentityMode,
    creatorDisplayName:
      recordIdentityMode === "account" ? profile?.displayName || user?.displayName || "" : "",
    creatorEmail:
      recordIdentityMode === "account" && profile?.showEmail ? user?.email || "" : "",
  };
}

function normalizeRecordItem(item, index) {
  const accents = ["cyan", "fuchsia", "violet"];
  const id = item.id || item.recordId;
  const originalLanguage = normalizeLanguage(
    item.originalLanguage || item.original_language || "en"
  );
  const title = item.title || "";
  const titleEn = item.titleEn || item.title_en || "";
  const titleZh = item.titleZh || item.title_zh || "";
  const titleEs = item.titleEs || item.title_es || "";
  const text = item.dream_text || item.text || item.excerpt || "";
  const textEn = item.dream_text_en || item.textEn || item.text_en || item.excerpt_en || "";
  const textZh = item.dream_text_zh || item.textZh || item.excerpt_zh || item.excerpt || "";
  const textEs = item.dream_text_es || item.textEs || item.excerpt_es || item.excerpt || "";
  const images = normalizeDreamImages(item);
  const imageUrls = images.map((image) => image.url).filter(Boolean);
  const thumbnailUrl = getPrimaryDreamImageUrl(item);
  const dreamDate = getVisibleDreamDate(item);
  const dreamDateStatus = getDreamDateStatus(item);
  const tags = Array.isArray(item.tags) ? item.tags : [];
  const signalCoherence = calculateDreamSignalCoherence({
    dreamText:
      item.originalText ||
      item.original_text ||
      getLanguageSpecificRecordValue({ text, textEn, textZh, textEs }, "text", originalLanguage),
    title:
      item.originalTitle ||
      item.original_title ||
      getLanguageSpecificRecordValue({ title, titleEn, titleZh, titleEs }, "title", originalLanguage),
    dreamDate,
    dreamTime: item.dreamTime || item.dream_time,
    dreamPeriod: item.dreamPeriod || item.dream_period,
    dreamSequence: item.dreamSequence || item.dream_sequence,
    ageAtDream: item.ageAtDream,
    tags,
  });

  return {
    id,
    recordId: item.recordId || id,
    dream_id: item.dream_id || item.recordId || id,
    originalLanguage,
    originalTitle:
      item.originalTitle ||
      item.original_title ||
      getLanguageSpecificRecordValue(
        { title, titleEn, titleZh, titleEs },
        "title",
        originalLanguage
      ),
    originalText:
      item.originalText ||
      item.original_text ||
      getLanguageSpecificRecordValue(
        { text, textEn, textZh, textEs },
        "text",
        originalLanguage
      ),
    translationLanguages: normalizeTranslationLanguages(item.translationLanguages),
    translationSource: item.translationSource || "",
    title,
    titleEn,
    titleZh,
    titleEs,
    text,
    textEn,
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
    dreamTime: normalizeDreamTime(item.dreamTime || item.dream_time),
    dream_time: normalizeDreamTime(item.dreamTime || item.dream_time),
    dreamPeriod: normalizeDreamPeriod(item.dreamPeriod || item.dream_period),
    dream_period: normalizeDreamPeriod(item.dreamPeriod || item.dream_period),
    dreamSequence: normalizeDreamSequence(item.dreamSequence || item.dream_sequence),
    dream_sequence: normalizeDreamSequence(item.dreamSequence || item.dream_sequence),
    ageAtDream: item.ageAtDream || "",
    ownerId: item.ownerId || item.creatorId || "",
    creatorId: item.creatorId || item.ownerId || "",
    anonymousLocked: Boolean(item.anonymousLocked),
    recordIdentityMode:
      item.recordIdentityMode === "account" || item.attributionMode === "account"
        ? "account"
        : "anonymous",
    creatorDisplayName: item.creatorDisplayName || "",
    authorName: item.authorName || item.creatorDisplayName || "",
    pseudoId: item.pseudoId || item.pseudo_id || "",
    visibility: item.visibility || (item.isPublic === false ? "private" : "public"),
    isPublic: typeof item.isPublic === "boolean" ? item.isPublic : item.visibility === "public",
    sharingMode:
      item.sharingMode ||
      (item.visibility === "stats_only"
        ? "stats_only"
        : item.isPublic
          ? item.recordIdentityMode === "account" || item.attributionMode === "account"
            ? "public_pseudonym"
            : "public_anonymous"
          : "private"),
    includedInResearchStats: Boolean(
      item.includedInResearchStats || item.researchConsent
    ),
    tags,
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
    signal_coherence: signalCoherence,
    createdAt: item.createdAt || item.created_at || "",
    updatedAt: item.updatedAt || item.updated_at || item.sharingUpdatedAt || "",
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
    return record.titleEn || record.title_en || record.title || "";
  }

  if (normalizedLanguage === "zh") return record.textZh || record.text_zh || "";
  if (normalizedLanguage === "es") return record.textEs || record.text_es || "";
  return record.textEn || record.text_en || record.dream_text_en || record.text || "";
}

function formatRecordDate(value) {
  if (!value) return "";
  if (typeof value === "string") return value.slice(0, 10);
  if (typeof value.toDate === "function") return value.toDate().toISOString().slice(0, 10);
  if (value instanceof Date) return value.toISOString().slice(0, 10);

  return "";
}

function normalizeDreamTime(value) {
  const rawValue = String(value || "").trim();
  const match = rawValue.match(/^([01]?\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?$/);
  if (!match) return "";

  return `${match[1].padStart(2, "0")}:${match[2]}`;
}

function normalizeDreamPeriod(value) {
  const normalizedValue = String(value || "").trim().toLowerCase();
  return ["morning", "afternoon", "evening", "night"].includes(normalizedValue)
    ? normalizedValue
    : "";
}

function normalizeDreamSequence(value) {
  const parsed = Number(value || 1);
  if (!Number.isFinite(parsed)) return 1;

  return Math.max(1, Math.min(12, Math.round(parsed)));
}

function getRecordDateDisplay(item, copy) {
  if (item.dreamDateStatus === "hidden") return copy.hiddenDate;
  return item.date || copy.unknownDate;
}

function getMissingSuggestedTags(item, language) {
  const text = getOriginalItemText(item);
  if (!text) return [];

  const existingSlugs = new Set((item.tags || []).map((tag) => tag.slug).filter(Boolean));

  return suggestTagsForDream(text, item.originalLanguage || language)
    .filter(
      (tag) =>
        tag.confidence >= 0.85 &&
        tag.tagType !== "interpretive_suggestion" &&
        !existingSlugs.has(tag.slug)
    )
    .map((tag) => ({
      ...tag,
      label: getTagLabel(RECORD_TAGS[tag.slug] || tag, language),
    }))
    .slice(0, 6);
}

function getRecordSortMillis(item) {
  const date = formatRecordDate(item.dreamDate || item.date);
  if (!date) return null;

  const time = normalizeDreamTime(item.dreamTime || item.dream_time);
  const parsed = new Date(time ? `${date}T${time}:00` : `${date}T00:00:00`).getTime();

  return Number.isFinite(parsed) ? parsed : null;
}

function getRecordTimestampMillis(value) {
  if (!value) return null;
  if (typeof value.toMillis === "function") return value.toMillis();
  if (Number.isFinite(value?.seconds)) return value.seconds * 1000;

  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : null;
}

function getRecordUpdatedMillis(item) {
  return getRecordTimestampMillis(item.updatedAt || item.sharingUpdatedAt || item.createdAt);
}

function compareNullableMillis(first, second, direction = "desc") {
  if (first == null && second == null) return 0;
  if (first == null) return 1;
  if (second == null) return -1;

  return direction === "asc" ? first - second : second - first;
}

function buildPersonalDreamAnalysis(items, language, copy) {
  const languageCounts = new Map();
  const emotionCounts = new Map();
  const dreamTypeCounts = new Map();
  const psychologyCounts = new Map();
  const analysisCounts = new Map();
  const placeCounts = new Map();
  const entityCounts = new Map();
  const symbolCounts = new Map();
  const weatherCounts = new Map();
  const perspectiveCounts = new Map();
  const styleCounts = new Map();
  const eraCounts = new Map();
  const monthCounts = new Map();
  let adultCount = 0;
  let ageTotal = 0;
  let ageCount = 0;
  let lucidCount = 0;
  let nightmareCount = 0;

  items.forEach((item) => {
    const originalLanguage = normalizeLanguage(item.originalLanguage);
    languageCounts.set(originalLanguage, (languageCounts.get(originalLanguage) || 0) + 1);

    const monthKey = getDreamMonthKey(item);
    if (monthKey) {
      monthCounts.set(monthKey, (monthCounts.get(monthKey) || 0) + 1);
    }

    if (item.adultContent || Number(item.minimumViewerAge || 0) >= 18) {
      adultCount += 1;
    }

    const ageAtDream = Number(item.ageAtDream);
    if (Number.isFinite(ageAtDream) && ageAtDream > 0) {
      ageTotal += ageAtDream;
      ageCount += 1;
    }

    getEmotionLabels(item, language).forEach((emotion) => {
      incrementMap(emotionCounts, emotion);
    });

    getCategoryTagLabels(item, "Dream Types", language).forEach((label) => {
      incrementMap(dreamTypeCounts, label);
    });

    getCategoryTagLabels(item, "Psychological Observables", language).forEach((label) => {
      incrementMap(psychologyCounts, label);
    });

    getCategoryTagLabels(item, "Dream Analysis", language).forEach((label) => {
      incrementMap(analysisCounts, label);
      incrementMap(symbolCounts, label);
    });

    getCategoryTagLabels(item, "Environment", language).forEach((label) => {
      incrementMap(placeCounts, label);
    });

    getCategoryTagLabels(item, "Entities", language).forEach((label) => {
      incrementMap(entityCounts, label);
    });

    getCategoryTagLabels(item, "Anomalies", language).forEach((label) => {
      incrementMap(symbolCounts, label);
    });

    getCategoryTagLabels(item, "Weather", language).forEach((label) => {
      incrementMap(weatherCounts, label);
    });

    getCategoryTagLabels(item, "Perspective", language).forEach((label) => {
      incrementMap(perspectiveCounts, label);
    });

    getCategoryTagLabels(item, "Styles", language).forEach((label) => {
      incrementMap(styleCounts, label);
    });

    getCategoryTagLabels(item, "Eras", language).forEach((label) => {
      incrementMap(eraCounts, label);
    });

    if (hasTagSlug(item, "lucid")) lucidCount += 1;
    if (hasTagSlug(item, "nightmare")) nightmareCount += 1;
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
    dreamFrequency: toTopEntries(monthCounts, 6),
    recurringPlaces: toTopEntries(placeCounts, 5),
    recurringEntities: toTopEntries(entityCounts, 5),
    commonSymbols: toTopEntries(symbolCounts, 5),
    psychologyPatterns: toTopEntries(psychologyCounts, 6),
    analysisMarkers: toTopEntries(analysisCounts, 6),
    weatherPatterns: toTopEntries(weatherCounts, 5),
    perspectivePatterns: toTopEntries(perspectiveCounts, 5),
    stylePatterns: toTopEntries(styleCounts, 5),
    eraPatterns: toTopEntries(eraCounts, 5),
    lucidCount,
    nightmareCount,
    similarDreams: findSimilarDreamPairs(items, language).slice(0, 3),
    reflectionQuestions: buildReflectionQuestions({
      copy,
      language,
      places: toTopEntries(placeCounts, 2),
      entities: toTopEntries(entityCounts, 2),
      emotions: toTopEntries(emotionCounts, 2),
      symbols: toTopEntries(symbolCounts, 2),
    }),
  };
}

function incrementMap(map, key) {
  if (!key) return;
  map.set(key, (map.get(key) || 0) + 1);
}

function toTopEntries(map, limit = 5) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])))
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }));
}

function getDreamMonthKey(item) {
  const value = item.dreamDate || item.date || "";
  if (!value || item.dreamDateStatus === "hidden") return "";

  const text = String(value).slice(0, 7);
  return /^\d{4}-\d{2}$/.test(text) ? text : "";
}

function hasTagSlug(item, slug) {
  return (
    item.tags?.some((tag) => tag.slug === slug) ||
    item.dreamTypeTags?.includes(slug) ||
    false
  );
}

function findSimilarDreamPairs(items, language) {
  const pairs = [];

  for (let leftIndex = 0; leftIndex < items.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < items.length; rightIndex += 1) {
      const left = items[leftIndex];
      const right = items[rightIndex];
      const leftSlugs = new Set((left.tags || []).map((tag) => tag.slug).filter(Boolean));
      const rightSlugs = new Set((right.tags || []).map((tag) => tag.slug).filter(Boolean));
      const overlap = [...leftSlugs].filter((slug) => rightSlugs.has(slug));

      if (overlap.length < 2) continue;

      pairs.push({
        leftTitle: getOriginalItemTitle(left) || formatRecordDate(left.dreamDate) || left.id,
        rightTitle: getOriginalItemTitle(right) || formatRecordDate(right.dreamDate) || right.id,
        overlapCount: overlap.length,
        tags: overlap
          .slice(0, 3)
          .map((slug) => getTagLabel(RECORD_TAGS[slug] || { slug, name: slug }, language)),
      });
    }
  }

  return pairs.sort((a, b) => b.overlapCount - a.overlapCount);
}

function buildReflectionQuestions({ copy, language, places, entities, emotions, symbols }) {
  const noData = copy.analysisNoData;
  const topPlace = places[0]?.label;
  const topEntity = entities[0]?.label;
  const topEmotion = emotions[0]?.label;
  const topSymbol = symbols[0]?.label;

  if (language === "zh") {
    return [
      topPlace ? `「${topPlace}」反覆出現時，通常伴隨什麼現實中的狀態或關係？` : noData,
      topEntity ? `當「${topEntity}」出現時，你在夢中比較像是靠近、逃避、照顧，還是觀察？` : noData,
      topEmotion ? `最近帶有「${topEmotion}」的夢，是在增加、減少，還是集中於某段時間？` : noData,
      topSymbol ? `「${topSymbol}」像是一個物件、場景規則，還是一種選擇點？` : noData,
    ].filter((item) => item && item !== noData).slice(0, 4);
  }

  if (language === "es") {
    return [
      topPlace ? `Cuando aparece “${topPlace}”, ¿qué estado o relación de la vida diaria suele acompañarlo?` : noData,
      topEntity ? `Cuando aparece “${topEntity}”, ¿te acercas, huyes, cuidas u observas?` : noData,
      topEmotion ? `¿Los sueños con “${topEmotion}” están aumentando, disminuyendo o concentrados en un periodo?` : noData,
      topSymbol ? `¿“${topSymbol}” funciona como objeto, regla del escenario o punto de decisión?` : noData,
    ].filter((item) => item && item !== noData).slice(0, 4);
  }

  return [
    topPlace ? `When “${topPlace}” repeats, what waking-life state or relationship usually surrounds it?` : noData,
    topEntity ? `When “${topEntity}” appears, are you approaching, avoiding, caring, or observing?` : noData,
    topEmotion ? `Are dreams tagged “${topEmotion}” increasing, decreasing, or clustered in one period?` : noData,
    topSymbol ? `Does “${topSymbol}” act like an object, a scene rule, or a choice point?` : noData,
  ].filter((item) => item && item !== noData).slice(0, 4);
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
  const [visualsOpen, setVisualsOpen] = useState(false);

  return (
    <section className="mb-8 rounded-3xl border border-cyan-300/15 bg-zinc-950/60 p-5 shadow-[0_0_34px_rgba(34,211,238,.06)] backdrop-blur sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.32em] text-cyan-200/70">
            {copy.analysisTitle}
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300">
            {copy.analysisText}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setVisualsOpen(true)}
          className="self-start rounded-full border border-fuchsia-300/25 bg-fuchsia-300/10 px-4 py-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-fuchsia-100 transition hover:border-fuchsia-300/45 hover:bg-fuchsia-300/15 sm:self-end"
        >
          {copy.analysisVisualsButton}
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatusBlock label={copy.analysisTotal} value={String(stats.total)} />
        <StatusBlock label={copy.analysisAdult} value={String(stats.adultCount)} />
        <StatusBlock label={copy.analysisLanguageLead} value={stats.leadingLanguage} />
        <StatusBlock label={copy.analysisEmotionLead} value={stats.leadingEmotion} />
        <StatusBlock label={copy.analysisDreamTypeLead} value={stats.leadingDreamType} />
        <StatusBlock label={copy.analysisPsychologyLead} value={stats.leadingPsychology} />
        <StatusBlock label={copy.analysisAnalysisLead} value={stats.leadingAnalysis} />
        <StatusBlock label={copy.analysisAverageAge} value={String(stats.averageAge)} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <MiniList title={copy.analysisFrequency} items={stats.dreamFrequency} empty={copy.analysisNoData} />
        <MiniList title={copy.analysisRecurringPlaces} items={stats.recurringPlaces} empty={copy.analysisNoData} />
        <MiniList title={copy.analysisRecurringEntities} items={stats.recurringEntities} empty={copy.analysisNoData} />
        <MiniList title={copy.analysisCommonSymbols} items={stats.commonSymbols} empty={copy.analysisNoData} />
        <MiniList title={copy.analysisPsychologyPatterns} items={stats.psychologyPatterns} empty={copy.analysisNoData} />
        <MiniList title={copy.analysisAnalysisMarkers} items={stats.analysisMarkers} empty={copy.analysisNoData} />
        <MiniList title={copy.analysisWeatherPatterns} items={stats.weatherPatterns} empty={copy.analysisNoData} />
        <MiniList title={copy.analysisPerspectivePatterns} items={stats.perspectivePatterns} empty={copy.analysisNoData} />
        <StatusBlock
          label={copy.analysisLucidNightmare}
          value={`${stats.lucidCount || 0} / ${stats.nightmareCount || 0}`}
        />
        <SimilarDreamList
          title={copy.analysisSimilarDreams}
          items={stats.similarDreams}
          empty={copy.analysisNoData}
        />
      </div>

      <ReflectionList
        title={copy.analysisReflectionQuestions}
        questions={stats.reflectionQuestions}
        empty={copy.analysisNoData}
      />

      {visualsOpen && (
        <PersonalVisualModal
          stats={stats}
          copy={copy}
          onClose={() => setVisualsOpen(false)}
        />
      )}
    </section>
  );
}

function PersonalVisualModal({ stats, copy, onClose }) {
  const visualGroups = [
    { title: copy.analysisFrequency, items: stats.dreamFrequency },
    { title: copy.analysisPsychologyPatterns, items: stats.psychologyPatterns },
    { title: copy.analysisAnalysisMarkers, items: stats.analysisMarkers },
    { title: copy.analysisWeatherPatterns, items: stats.weatherPatterns },
    { title: copy.analysisPerspectivePatterns, items: stats.perspectivePatterns },
    { title: copy.analysisStylePatterns, items: stats.stylePatterns },
    { title: copy.analysisEraPatterns, items: stats.eraPatterns },
    { title: copy.analysisCommonSymbols, items: stats.commonSymbols },
  ];
  const orbitItems = [
    ...(stats.recurringPlaces || []).slice(0, 2),
    ...(stats.recurringEntities || []).slice(0, 2),
    ...(stats.psychologyPatterns || []).slice(0, 3),
    ...(stats.analysisMarkers || []).slice(0, 3),
  ].slice(0, 10);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 p-3 backdrop-blur-md sm:p-6">
      <section className="mx-auto min-h-[calc(100vh-1.5rem)] max-w-6xl rounded-3xl border border-cyan-300/20 bg-zinc-950/95 p-5 shadow-[0_0_80px_rgba(34,211,238,.16)] sm:min-h-0 sm:p-7">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-cyan-200/70">
              {copy.analysisVisualsTitle}
            </p>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300">
              {copy.analysisVisualsText}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <ProfilePill label={copy.analysisTotal} value={String(stats.total)} />
              <ProfilePill label={copy.analysisEmotionLead} value={stats.leadingEmotion} />
              <ProfilePill label={copy.analysisPsychologyLead} value={stats.leadingPsychology} />
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="self-start rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-200 transition hover:border-cyan-300/35 hover:text-cyan-100"
          >
            {copy.closeVisuals}
          </button>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_1.2fr]">
          <PersonalVisualOrbit items={orbitItems} empty={copy.analysisNoData} />
          <div className="grid gap-4 sm:grid-cols-2">
            {visualGroups.map((group) => (
              <PersonalVisualBarCard
                key={group.title}
                title={group.title}
                items={group.items}
                total={Math.max(1, stats.total)}
                empty={copy.analysisNoData}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function PersonalVisualOrbit({ items = [], empty }) {
  return (
    <div className="relative min-h-[22rem] overflow-hidden rounded-3xl border border-cyan-300/15 bg-black/35 p-5">
      <div className="absolute inset-6 rounded-full border border-cyan-300/10" />
      <div className="absolute inset-16 rounded-full border border-fuchsia-300/10" />
      <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/25 bg-cyan-300/10 shadow-[0_0_38px_rgba(34,211,238,.16)]" />
      <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-200 shadow-[0_0_20px_rgba(103,232,249,.9)]" />

      {items.length > 0 ? (
        <div className="relative grid min-h-[19rem] grid-cols-2 content-between gap-3 sm:grid-cols-3">
          {items.map((item, index) => (
            <span
              key={`${item.label}-${index}`}
              className="rounded-2xl border border-white/10 bg-zinc-950/80 px-3 py-2 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-slate-200 shadow-[0_0_24px_rgba(0,0,0,.25)]"
            >
              <span className="block truncate">{item.label}</span>
              <span className="mt-1 block text-cyan-100">{item.count}</span>
            </span>
          ))}
        </div>
      ) : (
        <p className="relative flex min-h-[19rem] items-center justify-center text-sm leading-relaxed text-slate-400">
          {empty}
        </p>
      )}
    </div>
  );
}

function PersonalVisualBarCard({ title, items = [], total, empty }) {
  const maxCount = Math.max(1, ...items.map((item) => item.count || 0));

  return (
    <section className="rounded-2xl border border-white/10 bg-black/30 p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-300">
          {title}
        </p>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-cyan-100">
          N={total}
        </span>
      </div>

      {items.length > 0 ? (
        <div className="mt-4 space-y-3">
          {items.slice(0, 6).map((item) => (
            <div key={item.label}>
              <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                <span className="truncate text-slate-300">{item.label}</span>
                <span className="font-mono text-cyan-100">{item.count}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="cdo-gradient-bar h-full rounded-full"
                  style={{ width: `${Math.max(6, Math.round((item.count / maxCount) * 100))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm leading-relaxed text-slate-400">{empty}</p>
      )}
    </section>
  );
}

function MiniList({ title, items = [], empty }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
        {title}
      </p>
      {items.length > 0 ? (
        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-3">
              <span className="truncate text-sm text-zinc-300">{item.label}</span>
              <span className="rounded-full border border-cyan-300/20 bg-cyan-300/5 px-2 py-1 font-mono text-[10px] text-cyan-100">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm leading-relaxed text-slate-400">{empty}</p>
      )}
    </div>
  );
}

function SimilarDreamList({ title, items = [], empty }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
        {title}
      </p>
      {items.length > 0 ? (
        <div className="mt-4 space-y-4">
          {items.map((item) => (
            <div key={`${item.leftTitle}-${item.rightTitle}`} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm leading-relaxed text-slate-300">
                {item.leftTitle} ↔ {item.rightTitle}
              </p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-cyan-100">
                {item.tags.join(" / ")}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm leading-relaxed text-slate-400">{empty}</p>
      )}
    </div>
  );
}

function ReflectionList({ title, questions = [], empty }) {
  return (
    <div className="mt-6 rounded-2xl border border-fuchsia-300/15 bg-fuchsia-300/5 p-5">
      <p className="font-mono text-xs uppercase tracking-[0.26em] text-fuchsia-200/70">
        {title}
      </p>
      {questions.length > 0 ? (
        <ul className="mt-4 grid gap-4 md:grid-cols-2">
          {questions.map((question) => (
            <li key={question} className="rounded-xl border border-white/10 bg-black/25 p-4 text-sm leading-relaxed text-slate-300">
              {question}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm leading-relaxed text-slate-400">{empty}</p>
      )}
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
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
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
  const title = getDisplayItemTitle(item, language);
  const body = getDisplayItemText(item, language);
  const showThumbnail = Boolean(item.thumbnailUrl && !thumbnailFailed);
  const missingSuggestedTags = getMissingSuggestedTags(item, language).slice(0, 3);
  const suggestionTitle =
    missingSuggestedTags.length > 0
      ? `${copy.tagSuggestionHint}: ${missingSuggestedTags.map((tag) => tag.label).join(", ")}`
      : "";

  return (
    <article
      onClick={onOpen}
      className={[
        "cdo-record-card cursor-pointer overflow-hidden rounded-3xl border bg-zinc-950/80 backdrop-blur transition duration-300 hover:-translate-y-1",
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

      <div className="p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500">
            {getRecordDateDisplay(item, copy)}
          </span>
          {missingSuggestedTags.length > 0 && (
            <span
              className="inline-flex shrink-0 items-center gap-1"
              title={suggestionTitle}
              aria-label={suggestionTitle}
            >
              {missingSuggestedTags.map((tag) => (
                <span
                  key={tag.slug}
                  className="h-2 w-2 rounded-full bg-cyan-200 shadow-[0_0_12px_rgba(103,232,249,.85)]"
                />
              ))}
            </span>
          )}
        </div>
        {title && <h2 className="text-xl font-semibold text-zinc-50">{title}</h2>}
        <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500">
          {copy.recordedBy} @{getItemAuthorName(item, copy)}
        </p>
        {body && (
          <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-slate-300">
            {body}
          </p>
        )}
        <p className="mt-4 inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-cyan-100">
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
            "mt-6 w-full rounded-xl border px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.2em] transition",
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

function getOriginalItemTitle(item) {
  const originalLanguage = normalizeLanguage(item.originalLanguage);

  return (
    item.originalTitle ||
    getLanguageSpecificRecordValue(item, "title", originalLanguage) ||
    item.title ||
    ""
  );
}

function getDisplayItemTitle(item, language) {
  const requestedLanguage = normalizeLanguage(language);
  const originalLanguage = normalizeLanguage(item.originalLanguage);

  if (
    requestedLanguage !== originalLanguage &&
    hasRecorderTranslation(item, requestedLanguage)
  ) {
    return getLanguageSpecificRecordValue(item, "title", requestedLanguage) || "";
  }

  return getOriginalItemTitle(item);
}

function getOriginalItemText(item) {
  const originalLanguage = normalizeLanguage(item.originalLanguage);

  return (
    item.originalText ||
    getLanguageSpecificRecordValue(item, "text", originalLanguage) ||
    item.text ||
    ""
  );
}

function getDisplayItemText(item, language) {
  const requestedLanguage = normalizeLanguage(language);
  const originalLanguage = normalizeLanguage(item.originalLanguage);

  if (
    requestedLanguage !== originalLanguage &&
    hasRecorderTranslation(item, requestedLanguage)
  ) {
    return getLanguageSpecificRecordValue(item, "text", requestedLanguage) || "";
  }

  return getOriginalItemText(item);
}

function hasRecorderTranslation(record, language) {
  if (record.translationSource !== "recorder_provided") return false;

  return normalizeTranslationLanguages(record.translationLanguages).includes(
    normalizeLanguage(language)
  );
}

function normalizeTranslationLanguages(value) {
  if (!Array.isArray(value)) return [];

  return [...new Set(value.map(normalizeLanguage))];
}

function getItemAuthorName(item, copy) {
  return (
    item.authorName ||
    item.creatorDisplayName ||
    item.displayName ||
    copy.anonymousObserver
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
