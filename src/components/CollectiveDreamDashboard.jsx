import { useEffect, useMemo, useState } from "react";
import { TAG_TRANSLATIONS } from "../data/fallbackDreams.js";
import {
  getHtmlLang,
  getLanguageName,
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
import { fetchSharedCustomTags } from "../lib/customTagsService.js";
import {
  collectRecordForUser,
  fetchFollowingRecorders,
  fetchPublicRecords,
  followRecorderForUser,
  saveRecordForUser,
  unfollowRecorderForUser,
} from "../lib/recordsService.js";
import {
  exportMethodologyMarkdown,
  exportPatternSummaryJson,
  exportResearchRecordsCsv,
  exportResearchRecordsJson,
  exportTagCodebookCsv,
  EXPORT_DETAIL_LEVELS,
} from "../lib/researchExportService.js";
import { getOrCreateUserProfile } from "../lib/profileService.js";
import {
  getCategoryLabel as getTaxonomyCategoryLabel,
  RECORD_TAGS,
  TAG_CATEGORY_ORDER,
} from "../lib/tagTaxonomy.js";
import LanguageMenu from "./LanguageMenu.jsx";

const CATEGORY_STYLES = {
  Environment:
    "border-cyan-300/20 bg-cyan-300/10 text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,.08)]",
  Entities:
    "border-violet-300/20 bg-violet-300/10 text-violet-100 shadow-[0_0_18px_rgba(167,139,250,.08)]",
  Anomalies:
    "border-fuchsia-300/25 bg-fuchsia-300/10 text-fuchsia-100 shadow-[0_0_18px_rgba(217,70,239,.10)]",
  Emotions:
    "border-emerald-300/20 bg-emerald-300/10 text-emerald-100 shadow-[0_0_18px_rgba(110,231,183,.08)]",
  Styles:
    "border-sky-300/20 bg-sky-300/10 text-sky-100 shadow-[0_0_18px_rgba(125,211,252,.08)]",
  Eras:
    "border-indigo-300/20 bg-indigo-300/10 text-indigo-100 shadow-[0_0_18px_rgba(129,140,248,.08)]",
  Weather:
    "border-teal-300/20 bg-teal-300/10 text-teal-100 shadow-[0_0_18px_rgba(45,212,191,.08)]",
  "Dream Types":
    "border-rose-300/20 bg-rose-300/10 text-rose-100 shadow-[0_0_18px_rgba(251,113,133,.08)]",
  Perspective:
    "border-lime-300/20 bg-lime-300/10 text-lime-100 shadow-[0_0_18px_rgba(190,242,100,.08)]",
  "Psychological Observables":
    "border-pink-300/20 bg-pink-300/10 text-pink-100 shadow-[0_0_18px_rgba(249,168,212,.08)]",
  "Dream Analysis":
    "border-blue-300/20 bg-blue-300/10 text-blue-100 shadow-[0_0_18px_rgba(147,197,253,.08)]",
  Custom:
    "border-zinc-300/20 bg-zinc-300/10 text-zinc-100 shadow-[0_0_18px_rgba(212,212,216,.08)]",
  Content:
    "border-amber-300/25 bg-amber-300/10 text-amber-100 shadow-[0_0_18px_rgba(251,191,36,.10)]",
};

const CATEGORY_DOT_STYLES = {
  Environment: "bg-cyan-300",
  Entities: "bg-violet-300",
  Anomalies: "bg-fuchsia-300",
  Emotions: "bg-emerald-300",
  Styles: "bg-sky-300",
  Eras: "bg-indigo-300",
  Weather: "bg-teal-300",
  "Dream Types": "bg-rose-300",
  Perspective: "bg-lime-300",
  "Psychological Observables": "bg-pink-300",
  "Dream Analysis": "bg-blue-300",
  Custom: "bg-zinc-300",
  Content: "bg-amber-300",
};

const DEFAULT_TAGS = Object.values(RECORD_TAGS);
const PAGE_SIZE = 20;
const MIN_PRIVACY_GROUP_COUNT = 3;
const REPORT_SUGGESTION_MAILTO =
  "mailto:collectivedreamdatabase@gmail.com?subject=Collective%20Dream%20Observatory%20Report%20or%20Suggestion";

const UI_COPY = {
  en: {
    documentTitle: "Collective Dream Observatory",
    homeLabel: "Collective Dream Observatory home",
    terminalName: "Collective Dream Observatory",
    mobileDatabase: "Archive",
    mobileSubmit: "Submit",
    mobileReportSuggestion: "Report",
    globalDatabase: "Research Archive",
    submitObservation: "Record Dream",
    importDiary: "Import Diary",
    loginButton: "Login",
    accountButton: "Account",
    reportSuggestion: "Report",
    searchLabel: "Search dream observations",
    searchPlaceholder: "Search dreams, pseudo-IDs, emotions, anomalies...",
    languageLabel: "Switch interface language",
    englishLabel: "English interface",
    chineseLabel: "Traditional Chinese interface",
    spanishLabel: "Spanish interface",
    heroKicker: "Private dream recording // Anonymous sharing // Research archive",
    heroTitle: "Collective Dream Observatory",
    heroText:
      "Record your dreams. Explore the world's imagination.",
    heroSubtext:
      "A global platform where people can record dreams privately, share them anonymously, read unusual dreams from around the world, and contribute to collective dream statistics. Discover strange images, recurring symbols, emotional patterns, and creative visions across cultures — not as fixed meanings, but as living traces of human imagination.",
    audienceKicker: "Two ways to enter",
    audienceTitle: "A home for everyday dreamers and professional researchers",
    audienceText:
      "The Observatory is built for quick morning notes, strange public reading, personal pattern discovery, and careful cross-cultural research.",
    dreamerAudienceTitle: "For everyday dreamers",
    dreamerAudienceText:
      "Record dreams fast, keep them private, share anonymously when you want, explore unusual dreams worldwide, and watch your own symbols and moods gather into a personal dream map.",
    researcherAudienceTitle: "For researchers",
    researcherAudienceText:
      "Use structured data, tags, filters, aggregated statistics, sample size, methodology notes, cross-cultural comparison, and export-ready archive views.",
    homeSections: [
      {
        title: "Record",
        text: "Capture dream words quickly after waking, with optional dates, tags, privacy choices, and images.",
      },
      {
        title: "Explore",
        text: "Read strange, beautiful, unsettling, and ordinary dreams from around the world without exposing private identity.",
      },
      {
        title: "Patterns",
        text: "Follow recurring emotions, settings, symbols, perspectives, weather, eras, and dream types across the collective archive.",
      },
      {
        title: "My Dream Map",
        text: "Signed-in dreamers can review their own uploaded dreams and see personal patterns emerge over time.",
      },
      {
        title: "Research Archive",
        text: "The Collective Dream Database module supports tags, filters, aggregate statistics, methodology, sample size awareness, and researcher exports.",
      },
    ],
    accessLabel: "Viewing",
    accessValue: "Anonymous",
    datasetLabel: "Dataset",
    visibleLabel: "Visible",
    anomalyFiltersLabel: "Anomaly filters",
    loadStates: {
      loading: "Connecting to live archive",
      live: "Live research archive",
      fallback: "Live archive unavailable",
      empty: "No public records yet",
    },
    loadError: "The public records are temporarily unavailable.",
    schemaFocus: "Pattern Focus",
    anomalySearch: "Emotion tagging",
    ontologyConsistency: "Psychological observables",
    analysisMarkerCoverage: "Analysis markers",
    databaseNote: "Research archive note",
    databaseNoteText:
      "Tags help researchers compare feeling, setting, behavior, and recurring dream patterns.",
    schemaNote: ({ total, emotionCount, psychologyCount, analysisCount }) =>
      total === 0
        ? "No public dream records are loaded yet, so these analysis values are zero."
        : `Based on ${total} loaded dream records: ${emotionCount} include emotion tags, ${psychologyCount} include psychological observables, and ${analysisCount} include dream-analysis markers.`,
    filterTitle: "Advanced Tag Filtering",
    filterText:
      "Filter by ontology category or combine specific tags. Match all is best for narrow anomaly research; match any is best for discovery.",
    matchAll: "Match all",
    matchAny: "Match any",
    categorySelectLabel: "Filter tags by category",
    sortSelectLabel: "Sort dreams",
    sortCoherence: "Sort: Coherence",
    sortNewest: "Sort: Newest",
    sortOldest: "Sort: Oldest",
    sortTitle: "Sort: Title",
    selectedLabel: "selected",
    clearFilters: "Clear filters",
    noMatchesTitle: "No matching dream observations",
    noMatchesText:
      "Remove a tag, switch from match all to match any, or broaden the search query to restore the signal.",
    noRecordsTitle: "No public dream records yet",
    noRecordsText: "The Collective Dream Database research archive is ready for the first real submitted record.",
    generatedImage: "Generated Image",
    generatedImageAlt: "Generated visual for dream titled",
    visualHash: "Visual hash",
    signalCoherence: "Signal coherence",
    originalLanguageLabel: "Original language",
    unknownDate: "Date unknown",
    adultContentLabel: "Adult content",
    adultRestrictedTitle: "Age-restricted dream",
    adultGuestPrompt:
      "This record may include adult content. Confirm you are 18 or older to read this record.",
    adultAccountPrompt:
      "Only accounts with a saved age of 18 or older can open this record.",
    confirmAdult: "I am 18+",
    denyAdult: "Not now",
    imageHiddenForGuest: "Images are hidden for guests",
    wordsOnlyForGuest: "Words-only guest view",
    researchTitle: "Research Archive Signals",
    researchText:
      "A live snapshot for collective analysis: structured tags, filters, language origin, maturity gates, sample shape, and recurring emotional patterns.",
    researchTotal: "Total records",
    researchVisible: "Visible now",
    researchAdultRestricted: "Mature gated",
    researchAverageCoherence: "Avg coherence",
    researchEmotionLead: "Leading emotion",
    researchLanguageLead: "Leading original language",
    exportTitle: "Research exports",
    exportText: "Download the current public/readable archive view for professional analysis. Exports remove direct account identifiers and reflect the filters currently active in the browser.",
    exportCsv: "Records CSV",
    exportJson: "Records JSON",
    exportPatterns: "Patterns JSON",
    exportCodebook: "Tag codebook",
    exportMethodology: "Method notes",
    exportPrivacyNote: "Private and stats-only dreams are not exported from the browser; they require server-side aggregation with consent checks.",
    exportScopeLabel: "Export content",
    exportScopeDreams: "Dreams only",
    exportScopeCoded: "Dreams + tags",
    exportScopeAnalysis: "Full research",
    patternDashboardTitle: "Collective Patterns",
    patternDashboardText:
      "Aggregated dream statistics for public, readable records. Private and stats-only records need a server-side aggregation pipeline before they can appear here safely.",
    patternSampleSize: "Sample size",
    patternDateRange: "Date range",
    patternFilters: "Filters",
    patternMissingData: "Missing dates",
    patternSmallSampleWarning: ({ count }) =>
      `Sample size is ${count}. Treat charts as exploration, not research evidence, until N ≥ 10.`,
    patternSuppressed: "Small groups below privacy threshold are hidden.",
    patternNoData: "No aggregate data yet",
    patternAllLoaded: "All loaded records",
    patternFiltered: "Current filters applied",
    patternEmotions: "Common emotions",
    patternSymbols: "Recurring symbols",
    patternDreamTypes: "Dream types",
    patternLanguages: "Languages",
    patternCountries: "Countries / regions",
    patternLucidNightmare: "Nightmare / lucid ratio",
    patternDreamLength: "Dream length",
    patternCooccurrence: "Tag co-occurrence",
    patternNightmare: "Nightmare",
    patternLucid: "Lucid",
    patternRecords: "records",
    noResearchData: "Not enough signal yet",
    collectDream: "Collect",
    collectedDream: "Collected",
    expandPanel: "Expand",
    collapsePanel: "Collapse",
    showTags: "Show tags",
    hideTags: "Hide tags",
    signInToCollect: "Sign in to collect",
    followRecorder: "Follow recorder",
    followingRecorder: "Following",
    signInToFollow: "Sign in to follow",
    followLimitReached: "You can follow up to ten recorders.",
    publicEmailLabel: "Public email",
    recordedBy: "Recorded by",
    anonymousObserver: "Anonymous Observer",
    pageLabel: "Page",
    pageOf: "of",
    showingLabel: "Showing",
    previousPage: "Previous",
    nextPage: "Next",
  },
  zh: {
    documentTitle: "集體夢境觀測站",
    homeLabel: "集體夢境觀測站首頁",
    terminalName: "集體夢境觀測站",
    mobileDatabase: "檔案庫",
    mobileSubmit: "提交",
    mobileReportSuggestion: "回報",
    globalDatabase: "研究檔案庫",
    submitObservation: "記錄夢境",
    importDiary: "匯入日記",
    loginButton: "登入",
    accountButton: "帳戶",
    reportSuggestion: "回報",
    searchLabel: "搜尋夢境觀測",
    searchPlaceholder: "搜尋夢境、匿名 ID、情緒、異常現象...",
    languageLabel: "切換介面語言",
    englishLabel: "英文介面",
    chineseLabel: "繁體中文介面",
    spanishLabel: "西班牙文介面",
    heroKicker: "私人夢境記錄 // 匿名分享 // 研究檔案庫",
    heroTitle: "集體夢境觀測站",
    heroText:
      "記錄你的夢，探索世界的想像。",
    heroSubtext:
      "一個全球夢境平台。人們可以在這裡私人記錄夢境、匿名分享夢境、閱讀來自世界各地的奇異夢境，並讓夢加入集體統計。探索跨文化的奇異影像、重複符號、情緒模式與創造性幻象——不是為了把夢固定成單一解釋，而是為了觀測人類想像留下的活生生痕跡。",
    audienceKicker: "兩種進入方式",
    audienceTitle: "同時為一般做夢者與專業研究者設計",
    audienceText:
      "觀測站支援醒來後快速記錄、匿名閱讀、個人模式整理，也支援可被檢視的跨文化研究流程。",
    dreamerAudienceTitle: "給一般做夢者",
    dreamerAudienceText:
      "快速記錄夢境、保留私人草稿、選擇匿名分享、閱讀世界各地的奇異夢境，並逐步看見自己的符號、情緒與場景模式。",
    researcherAudienceTitle: "給研究者",
    researcherAudienceText:
      "使用結構化資料、標籤、篩選、整體統計、樣本數、研究方法註記、跨文化比較與未來資料匯出視角。",
    homeSections: [
      {
        title: "記錄",
        text: "醒來後快速寫下夢境文字，並可選擇日期、標籤、公開身份、隱私與圖片。",
      },
      {
        title: "探索",
        text: "閱讀來自世界各地奇異、美麗、不安或日常的夢境，同時保護記錄者的私人身份。",
      },
      {
        title: "集體模式",
        text: "觀測情緒、場景、符號、視角、天氣、時代與夢境類型在集體檔案中的重複與差異。",
      },
      {
        title: "我的夢境地圖",
        text: "登入後可回看自己上傳的夢，讓個人的夢境模式隨時間慢慢浮現。",
      },
      {
        title: "研究檔案庫",
        text: "「集體夢境資料庫」模組支援標籤、篩選、整體統計、研究方法、樣本數意識與研究匯出。",
      },
    ],
    accessLabel: "瀏覽",
    accessValue: "匿名",
    datasetLabel: "資料集",
    visibleLabel: "可見",
    anomalyFiltersLabel: "異常篩選",
    loadStates: {
      loading: "連線至即時檔案庫",
      live: "即時研究檔案庫",
      fallback: "即時檔案庫無法使用",
      empty: "尚無公開紀錄",
    },
    loadError: "公開紀錄暫時無法讀取。",
    schemaFocus: "心理模式焦點",
    anomalySearch: "情緒標記",
    ontologyConsistency: "心理觀察項",
    analysisMarkerCoverage: "夢境分析標記",
    databaseNote: "研究檔案庫備註",
    databaseNoteText:
      "標籤可以協助比較感受、場景、行為與反覆出現的夢境模式。",
    schemaNote: ({ total, emotionCount, psychologyCount, analysisCount }) =>
      total === 0
        ? "尚未載入公開夢境紀錄，因此分析值為 0。"
        : `根據目前載入的 ${total} 筆夢境紀錄計算：${emotionCount} 筆含情緒標籤，${psychologyCount} 筆含心理觀察項，${analysisCount} 筆含夢境分析標記。`,
    filterTitle: "進階標籤篩選",
    filterText:
      "可依本體類別篩選，或組合特定標籤。全部符合適合精準的異常研究；任一符合適合探索。",
    matchAll: "全部符合",
    matchAny: "任一符合",
    categorySelectLabel: "依類別篩選標籤",
    sortSelectLabel: "排序夢境",
    sortCoherence: "排序：一致性",
    sortNewest: "排序：最新",
    sortOldest: "排序：最舊",
    sortTitle: "排序：標題",
    selectedLabel: "已選",
    clearFilters: "清除篩選",
    noMatchesTitle: "沒有相符的夢境觀測",
    noMatchesText: "移除標籤、改用任一符合，或放寬搜尋字詞以恢復訊號。",
    noRecordsTitle: "尚無公開夢境紀錄",
    noRecordsText: "「集體夢境資料庫」研究檔案庫已準備好接收第一筆真實提交的紀錄。",
    generatedImage: "生成影像",
    generatedImageAlt: "夢境生成視覺，標題為",
    visualHash: "視覺雜湊",
    signalCoherence: "訊號一致性",
    originalLanguageLabel: "原始語言",
    unknownDate: "日期不確定",
    adultContentLabel: "成人內容",
    adultRestrictedTitle: "年齡限制夢境",
    adultGuestPrompt: "此紀錄可能包含成人內容。請確認你已滿 18 歲，才能閱讀此紀錄。",
    adultAccountPrompt: "只有已儲存年齡且年滿 18 歲的帳戶可以開啟此紀錄。",
    confirmAdult: "我已滿 18 歲",
    denyAdult: "暫不閱讀",
    imageHiddenForGuest: "訪客不顯示圖片",
    wordsOnlyForGuest: "訪客文字模式",
    researchTitle: "研究檔案庫訊號",
    researchText: "供集體分析使用的即時概覽：結構化標籤、篩選、原始語言、成人內容門檻、樣本形狀與重複情緒模式。",
    researchTotal: "總紀錄",
    researchVisible: "目前可見",
    researchAdultRestricted: "成人門檻",
    researchAverageCoherence: "平均一致性",
    researchEmotionLead: "主要情緒",
    researchLanguageLead: "主要原始語言",
    exportTitle: "研究匯出",
    exportText: "下載目前公開／可讀取的檔案庫視圖，用於專業分析。匯出會移除直接帳戶識別資訊，並依照目前瀏覽器中的篩選條件產生。",
    exportCsv: "紀錄 CSV",
    exportJson: "紀錄 JSON",
    exportPatterns: "模式 JSON",
    exportCodebook: "標籤碼本",
    exportMethodology: "方法說明",
    exportPrivacyNote: "私人夢境與僅統計夢境不會從瀏覽器匯出；它們需要具同意檢查的伺服器端聚合。",
    exportScopeLabel: "匯出內容",
    exportScopeDreams: "只匯出夢",
    exportScopeCoded: "夢與標籤",
    exportScopeAnalysis: "完整研究欄位",
    patternDashboardTitle: "集體模式",
    patternDashboardText:
      "根據公開且可讀取的夢境紀錄建立整體統計。私人與只加入統計的紀錄，需要伺服器端聚合流程才能安全顯示於此。",
    patternSampleSize: "樣本數",
    patternDateRange: "日期範圍",
    patternFilters: "篩選條件",
    patternMissingData: "缺少日期",
    patternSmallSampleWarning: ({ count }) =>
      `目前樣本數為 ${count}。在 N ≥ 10 前，圖表只能作為探索，不應作為研究證據。`,
    patternSuppressed: "低於隱私門檻的小群體已隱藏。",
    patternNoData: "尚無整體資料",
    patternAllLoaded: "所有已載入紀錄",
    patternFiltered: "已套用目前篩選",
    patternEmotions: "常見情緒",
    patternSymbols: "重複符號",
    patternDreamTypes: "夢境類型",
    patternLanguages: "語言",
    patternCountries: "國家／地區",
    patternLucidNightmare: "惡夢／清醒夢比例",
    patternDreamLength: "夢境長度",
    patternCooccurrence: "標籤共現",
    patternNightmare: "惡夢",
    patternLucid: "清醒夢",
    patternRecords: "筆紀錄",
    noResearchData: "訊號尚不足",
    collectDream: "收藏",
    collectedDream: "已收藏",
    expandPanel: "展開",
    collapsePanel: "收合",
    showTags: "展開標籤",
    hideTags: "收合標籤",
    signInToCollect: "登入後可收藏",
    followRecorder: "追蹤記錄者",
    followingRecorder: "追蹤中",
    signInToFollow: "登入後可追蹤",
    followLimitReached: "最多可追蹤十位記錄者。",
    publicEmailLabel: "公開電子郵件",
    recordedBy: "記錄者",
    anonymousObserver: "匿名觀察者",
    pageLabel: "頁",
    pageOf: "／",
    showingLabel: "顯示",
    previousPage: "上一頁",
    nextPage: "下一頁",
  },
  es: {
    documentTitle: "Observatorio Colectivo de Sueños",
    homeLabel: "Inicio del Observatorio Colectivo de Sueños",
    terminalName: "Observatorio Colectivo de Sueños",
    mobileDatabase: "Archivo",
    mobileSubmit: "Enviar",
    mobileReportSuggestion: "Reporte",
    globalDatabase: "Archivo de investigación",
    submitObservation: "Registrar sueño",
    importDiary: "Importar diario",
    loginButton: "Iniciar sesión",
    accountButton: "Cuenta",
    reportSuggestion: "Reporte",
    searchLabel: "Buscar observaciones de sueños",
    searchPlaceholder: "Buscar sueños, pseudo-ID, emociones, anomalías...",
    languageLabel: "Cambiar idioma de la interfaz",
    englishLabel: "Interfaz en inglés",
    chineseLabel: "Interfaz en chino tradicional",
    spanishLabel: "Interfaz en español",
    heroKicker: "Registro privado // Intercambio anónimo // Archivo de investigación",
    heroTitle: "Observatorio Colectivo de Sueños",
    heroText:
      "Registra tus sueños. Explora la imaginación del mundo.",
    heroSubtext:
      "Una plataforma global donde las personas pueden registrar sueños en privado, compartirlos de forma anónima, leer sueños inusuales de todo el mundo y contribuir a estadísticas colectivas. Descubre imágenes extrañas, símbolos recurrentes, patrones emocionales y visiones creativas entre culturas — no como significados fijos, sino como huellas vivas de la imaginación humana.",
    audienceKicker: "Dos formas de entrar",
    audienceTitle: "Diseñado para soñadores cotidianos e investigadores profesionales",
    audienceText:
      "El Observatorio sirve para notas rápidas al despertar, lectura anónima, patrones personales y análisis intercultural con metodología clara.",
    dreamerAudienceTitle: "Para soñadores cotidianos",
    dreamerAudienceText:
      "Registra sueños con facilidad, mantenlos privados, compártelos de forma anónima, lee sueños extraños del mundo y observa cómo aparecen tus propios símbolos y estados de ánimo.",
    researcherAudienceTitle: "Para investigadores",
    researcherAudienceText:
      "Trabaja con datos estructurados, etiquetas, filtros, estadísticas agregadas, tamaño de muestra, notas metodológicas, análisis intercultural y vistas preparadas para exportación.",
    homeSections: [
      {
        title: "Registrar",
        text: "Captura las palabras del sueño al despertar, con fechas, etiquetas, privacidad, identidad pública e imágenes opcionales.",
      },
      {
        title: "Explorar",
        text: "Lee sueños extraños, bellos, inquietantes u ordinarios de todo el mundo sin exponer identidades privadas.",
      },
      {
        title: "Patrones",
        text: "Observa emociones, escenarios, símbolos, perspectivas, clima, épocas y tipos de sueño en el archivo colectivo.",
      },
      {
        title: "Mi mapa de sueños",
        text: "Con una cuenta, revisa tus propios sueños subidos y descubre patrones personales a lo largo del tiempo.",
      },
      {
        title: "Archivo de investigación",
        text: "El módulo Base de Datos Colectiva de Sueños admite etiquetas, filtros, estadísticas, metodología, tamaño de muestra y exportaciones de investigación.",
      },
    ],
    accessLabel: "Vista",
    accessValue: "Anónimo",
    datasetLabel: "Datos",
    visibleLabel: "Visible",
    anomalyFiltersLabel: "Filtros de anomalía",
    loadStates: {
      loading: "Conectando con el archivo activo",
      live: "Archivo de investigación activo",
      fallback: "Archivo activo no disponible",
      empty: "Aún no hay registros públicos",
    },
    loadError:
      "Los registros públicos no están disponibles por ahora.",
    schemaFocus: "Enfoque de patrones",
    anomalySearch: "Etiquetado emocional",
    ontologyConsistency: "Observables psicológicos",
    analysisMarkerCoverage: "Marcadores de análisis",
    databaseNote: "Nota del archivo de investigación",
    databaseNoteText:
      "Las etiquetas ayudan a comparar sentimientos, escenas, conductas y patrones recurrentes.",
    schemaNote: ({ total, emotionCount, psychologyCount, analysisCount }) =>
      total === 0
        ? "Aún no hay registros públicos cargados, así que estos valores son cero."
        : `Calculado desde ${total} registros cargados: ${emotionCount} incluyen emociones, ${psychologyCount} incluyen observables psicológicos y ${analysisCount} incluyen marcadores de análisis.`,
    filterTitle: "Filtrado Avanzado",
    filterText:
      "Filtra por categoría ontológica o combina etiquetas específicas. Coincidir todo sirve para investigación precisa; coincidir cualquiera sirve para exploración.",
    matchAll: "Coincidir todo",
    matchAny: "Cualquiera",
    categorySelectLabel: "Filtrar etiquetas por categoría",
    sortSelectLabel: "Ordenar sueños",
    sortCoherence: "Orden: Coherencia",
    sortNewest: "Orden: Más reciente",
    sortOldest: "Orden: Más antiguo",
    sortTitle: "Orden: Título",
    selectedLabel: "seleccionadas",
    clearFilters: "Limpiar filtros",
    noMatchesTitle: "No hay observaciones coincidentes",
    noMatchesText:
      "Quita una etiqueta, cambia a cualquiera o amplía la búsqueda para recuperar la señal.",
    noRecordsTitle: "Aún no hay registros públicos",
    noRecordsText: "La Base de Datos Colectiva de Sueños está lista para el primer registro real enviado.",
    generatedImage: "Imagen generada",
    generatedImageAlt: "Visual generado para el sueño titulado",
    visualHash: "Hash visual",
    signalCoherence: "Coherencia de señal",
    originalLanguageLabel: "Idioma original",
    unknownDate: "Fecha desconocida",
    adultContentLabel: "Contenido adulto",
    adultRestrictedTitle: "Sueño con restricción de edad",
    adultGuestPrompt:
      "Este registro puede incluir contenido adulto. Confirma que tienes 18 años o más para leerlo.",
    adultAccountPrompt:
      "Solo las cuentas con una edad guardada de 18 años o más pueden abrir este registro.",
    confirmAdult: "Tengo 18+",
    denyAdult: "Ahora no",
    imageHiddenForGuest: "Las imágenes están ocultas para invitados",
    wordsOnlyForGuest: "Vista de invitado solo texto",
    researchTitle: "Señales del archivo de investigación",
    researchText:
      "Una vista para análisis colectivo: etiquetas estructuradas, filtros, idioma original, límites de madurez, forma de muestra y patrones emocionales recurrentes.",
    researchTotal: "Registros",
    researchVisible: "Visibles ahora",
    researchAdultRestricted: "Madurez filtrada",
    researchAverageCoherence: "Coherencia media",
    researchEmotionLead: "Emoción principal",
    researchLanguageLead: "Idioma original principal",
    exportTitle: "Exportaciones de investigación",
    exportText: "Descarga la vista pública/legible actual del archivo para análisis profesional. Las exportaciones eliminan identificadores directos de cuenta y reflejan los filtros activos en el navegador.",
    exportCsv: "Registros CSV",
    exportJson: "Registros JSON",
    exportPatterns: "Patrones JSON",
    exportCodebook: "Codebook de etiquetas",
    exportMethodology: "Notas metodológicas",
    exportPrivacyNote: "Los sueños privados y solo-estadísticos no se exportan desde el navegador; requieren agregación del servidor con verificación de consentimiento.",
    exportScopeLabel: "Contenido exportado",
    exportScopeDreams: "Solo sueños",
    exportScopeCoded: "Sueños + etiquetas",
    exportScopeAnalysis: "Investigación completa",
    patternDashboardTitle: "Patrones colectivos",
    patternDashboardText:
      "Estadísticas agregadas basadas en registros públicos y legibles. Los registros privados o solo estadísticos necesitan agregación del servidor para aparecer aquí con seguridad.",
    patternSampleSize: "Tamaño de muestra",
    patternDateRange: "Rango de fechas",
    patternFilters: "Filtros",
    patternMissingData: "Fechas faltantes",
    patternSmallSampleWarning: ({ count }) =>
      `El tamaño de muestra es ${count}. Usa los gráficos como exploración, no evidencia de investigación, hasta N ≥ 10.`,
    patternSuppressed: "Los grupos pequeños bajo el umbral de privacidad están ocultos.",
    patternNoData: "Aún no hay datos agregados",
    patternAllLoaded: "Todos los registros cargados",
    patternFiltered: "Filtros actuales aplicados",
    patternEmotions: "Emociones comunes",
    patternSymbols: "Símbolos recurrentes",
    patternDreamTypes: "Tipos de sueño",
    patternLanguages: "Idiomas",
    patternCountries: "Países / regiones",
    patternLucidNightmare: "Pesadilla / lúcido",
    patternDreamLength: "Longitud del sueño",
    patternCooccurrence: "Coocurrencia de etiquetas",
    patternNightmare: "Pesadilla",
    patternLucid: "Lúcido",
    patternRecords: "registros",
    noResearchData: "Señal insuficiente",
    collectDream: "Coleccionar",
    collectedDream: "Coleccionado",
    expandPanel: "Expandir",
    collapsePanel: "Contraer",
    showTags: "Ver etiquetas",
    hideTags: "Ocultar etiquetas",
    signInToCollect: "Inicia sesión para coleccionar",
    followRecorder: "Seguir registrador",
    followingRecorder: "Siguiendo",
    signInToFollow: "Inicia sesión para seguir",
    followLimitReached: "Puedes seguir hasta diez registradores.",
    publicEmailLabel: "Correo público",
    recordedBy: "Registrado por",
    anonymousObserver: "Observador anónimo",
    pageLabel: "Página",
    pageOf: "de",
    showingLabel: "Mostrando",
    previousPage: "Anterior",
    nextPage: "Siguiente",
  },
};

const INITIAL_LOAD_STATE = "loading";
const EMPTY_LOAD_STATE = "empty";

export default function CollectiveDreamDashboard({
  language: selectedLanguage,
  setLanguage: setSelectedLanguage,
  currentUser,
  onOpenAuth,
  onOpenRecorder,
  onOpenImporter,
  onOpenRecord,
}) {
  const [localLanguage, setLocalLanguage] = useState("zh");
  const language = selectedLanguage || localLanguage;
  const setLanguage = setSelectedLanguage || setLocalLanguage;
  const [dreams, setDreams] = useState([]);
  const [tags, setTags] = useState(() => DEFAULT_TAGS);
  const [query, setQuery] = useState("");
  const [selectedTagSlugs, setSelectedTagSlugs] = useState([]);
  const [matchMode, setMatchMode] = useState("all");
  const [sortMode, setSortMode] = useState("newest");
  const [activeSection, setActiveSection] = useState("explore");
  const [expandedPanels, setExpandedPanels] = useState({
    patterns: false,
    research: false,
    filters: false,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [loadState, setLoadState] = useState(INITIAL_LOAD_STATE);
  const [loadError, setLoadError] = useState(null);
  const [viewerProfile, setViewerProfile] = useState(null);
  const [followingRecorders, setFollowingRecorders] = useState([]);
  const [adultConfirmations, setAdultConfirmations] = useState({});
  const copy = UI_COPY[language] || UI_COPY.zh;
  const canSeeImages = Boolean(currentUser?.uid && !currentUser.isAnonymous);
  const isAgeVerifiedAdult = Number(viewerProfile?.age || 0) >= 18;
  const canLoadAdultRecords = Boolean(canSeeImages && isAgeVerifiedAdult);

  useEffect(() => {
    document.documentElement.lang = getHtmlLang(language);
    document.title = copy.documentTitle;
  }, [copy.documentTitle, language]);

  useEffect(() => {
    let ignore = false;

    async function loadDatabase() {
      setLoadState("loading");
      setLoadError(null);

      const loadErrors = [];
      let firestoreDreams = [];
      let sharedTags = [];

      try {
        [firestoreDreams, sharedTags] = await Promise.all([
          fetchPublicRecords({
            includeAdult: canLoadAdultRecords,
          }),
          fetchSharedCustomTags(),
        ]);
      } catch (error) {
        loadErrors.push(error.message);
      }

      if (ignore) return;

      const liveDreams = mergeDreamSets(firestoreDreams.map(normalizeDreamCard));

      if (liveDreams.length === 0) {
        setLoadState(loadErrors.length > 0 ? "fallback" : EMPTY_LOAD_STATE);
        setLoadError(loadErrors[0] || null);
        setDreams([]);
        setTags(mergeTagSets(DEFAULT_TAGS, sharedTags));
        return;
      }

      setDreams(liveDreams);
      setTags(
        mergeTagSets(
          DEFAULT_TAGS,
          sharedTags,
          liveDreams.flatMap((dream) => dream.tags)
        )
      );
      setLoadError(loadErrors[0] || null);
      setLoadState("live");
    }

    loadDatabase();

    return () => {
      ignore = true;
    };
  }, [canLoadAdultRecords]);

  useEffect(() => {
    if (!currentUser?.uid) {
      setViewerProfile(null);
      return undefined;
    }

    let ignore = false;

    async function loadViewerProfile() {
      try {
        const profile = await getOrCreateUserProfile(currentUser);
        if (!ignore) setViewerProfile(profile);
      } catch {
        if (!ignore) setViewerProfile(null);
      }
    }

    loadViewerProfile();

    return () => {
      ignore = true;
    };
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser?.uid || currentUser.isAnonymous) {
      setFollowingRecorders([]);
      return undefined;
    }

    let ignore = false;

    async function loadFollowingRecorders() {
      try {
        const records = await fetchFollowingRecorders(currentUser);
        if (!ignore) setFollowingRecorders(records);
      } catch {
        if (!ignore) setFollowingRecorders([]);
      }
    }

    loadFollowingRecorders();

    return () => {
      ignore = true;
    };
  }, [currentUser]);

  function canAccessAdultDream(dream) {
    if (!isAdultDream(dream)) return true;
    if (isAgeVerifiedAdult) return true;

    return Boolean(adultConfirmations[dream.dream_id]);
  }

  const filteredDreams = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return dreams
      .filter((dream) => {
        const adultRestricted = isAdultDream(dream) && !canAccessAdultDream(dream);
        const dreamTagSlugs = dream.tags.map((tag) => tag.slug);
        const dreamTagNames = dream.tags
          .map((tag) => `${tag.name} ${getTagName(tag, language)}`)
          .join(" ");
        const dreamCategories = dream.tags
          .map((tag) => `${tag.category} ${getCategoryLabel(tag.category, language)}`)
          .join(" ");

        const searchableText = (adultRestricted
          ? [
              dream.pseudo_id,
              copy.adultRestrictedTitle,
              copy.adultContentLabel,
              dreamTagNames,
              dreamTagSlugs.join(" "),
              dreamCategories,
            ]
          : [
              dream.title,
              dream.originalTitle,
              dream.originalText,
              getLanguageName(dream.originalLanguage, language),
              getDreamTitle(dream, language),
              getDreamTitle(dream, dream.originalLanguage),
              dream.excerpt,
              getDreamExcerpt(dream, language),
              getDreamExcerpt(dream, dream.originalLanguage),
              dream.dream_text,
              getDreamText(dream, language),
              getDreamText(dream, dream.originalLanguage),
              dream.pseudo_id,
              dreamTagNames,
              dreamTagSlugs.join(" "),
              dreamCategories,
            ])
          .join(" ")
          .toLowerCase();

        const matchesSearch = needle.length === 0 || searchableText.includes(needle);

        const matchesTags =
          selectedTagSlugs.length === 0 ||
          (matchMode === "all"
            ? selectedTagSlugs.every((slug) => dreamTagSlugs.includes(slug))
            : selectedTagSlugs.some((slug) => dreamTagSlugs.includes(slug)));

        return matchesSearch && matchesTags;
      })
      .sort((a, b) => {
        if (sortMode === "newest") {
          return compareDreamDateOrder(a, b, "desc");
        }

        if (sortMode === "oldest") {
          return compareDreamDateOrder(a, b, "asc");
        }

        if (sortMode === "title") {
          return getDreamTitle(a, language).localeCompare(
            getDreamTitle(b, language),
            language === "zh" ? "zh-Hant" : language === "es" ? "es" : "en"
          );
        }

        return b.signal_coherence - a.signal_coherence;
      });
  }, [
    adultConfirmations,
    copy.adultContentLabel,
    copy.adultRestrictedTitle,
    dreams,
    query,
    selectedTagSlugs,
    matchMode,
    sortMode,
    language,
    isAgeVerifiedAdult,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, selectedTagSlugs, matchMode, sortMode]);

  const totalPages = Math.max(1, Math.ceil(filteredDreams.length / PAGE_SIZE));
  const boundedCurrentPage = Math.min(currentPage, totalPages);
  const paginatedDreams = filteredDreams.slice(
    (boundedCurrentPage - 1) * PAGE_SIZE,
    boundedCurrentPage * PAGE_SIZE
  );

  useEffect(() => {
    if (currentPage !== boundedCurrentPage) {
      setCurrentPage(boundedCurrentPage);
    }
  }, [boundedCurrentPage, currentPage]);

  const activeAnomalyCount = selectedTagSlugs.filter((slug) => {
    const tag = tags.find((item) => item.slug === slug);
    return tag?.category === "Anomalies";
  }).length;
  const researchStats = useMemo(
    () => buildResearchStats(dreams, filteredDreams, language),
    [dreams, filteredDreams, language]
  );
  const collectivePatternStats = useMemo(
    () =>
      buildCollectivePatternStats({
        dreams: filteredDreams,
        allDreams: dreams,
        language,
        filtersActive: Boolean(query.trim() || selectedTagSlugs.length > 0),
      }),
    [dreams, filteredDreams, language, query, selectedTagSlugs]
  );
  const schemaStats = useMemo(() => buildSchemaStats(dreams), [dreams]);
  const tagCounts = useMemo(() => buildTagCounts(dreams), [dreams]);
  const followingRecorderIds = useMemo(
    () => new Set(followingRecorders.map((item) => item.recorderId || item.id)),
    [followingRecorders]
  );

  function toggleTag(slug) {
    setSelectedTagSlugs((current) =>
      current.includes(slug)
        ? current.filter((item) => item !== slug)
        : [...current, slug]
    );
  }

  function scrollToSection(sectionId) {
    if (typeof window === "undefined") return;

    window.setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  }

  function togglePanel(panelKey) {
    setExpandedPanels((current) => ({
      ...current,
      [panelKey]: !current[panelKey],
    }));
  }

  function handleHomeSection(section, index) {
    const mode = ["record", "explore", "patterns", "dream-map", "research"][index];

    if (mode === "record") {
      onOpenRecorder?.();
      return;
    }

    if (mode === "dream-map") {
      onOpenAuth?.();
      return;
    }

    setActiveSection(mode);

    if (mode === "patterns") {
      setExpandedPanels((current) => ({ ...current, patterns: true }));
      scrollToSection("collective-patterns");
    }
    if (mode === "research") {
      setExpandedPanels((current) => ({ ...current, research: true }));
      scrollToSection("research-archive");
    }
    if (mode === "explore") scrollToSection("dream-explore");
  }

  async function handleToggleFollow(dream) {
    const recorderId = getRecorderId(dream);

    if (!currentUser?.uid || currentUser.isAnonymous) {
      throw new Error(copy.signInToFollow);
    }

    if (!recorderId || recorderId === currentUser.uid) return false;

    if (followingRecorderIds.has(recorderId)) {
      await unfollowRecorderForUser(currentUser, recorderId);
      setFollowingRecorders((current) =>
        current.filter((item) => (item.recorderId || item.id) !== recorderId)
      );
      return false;
    }

    if (followingRecorders.length >= 10) {
      throw new Error(copy.followLimitReached);
    }

    await followRecorderForUser(currentUser, {
      recorderId,
      creatorDisplayName: dream.creatorDisplayName,
      creatorEmail: dream.creatorEmail,
    });
    setFollowingRecorders((current) => [
      {
        id: recorderId,
        recorderId,
        displayName: dream.creatorDisplayName || "",
        email: dream.creatorEmail || "",
      },
      ...current,
    ]);
    return true;
  }

  return (
    <main className="min-h-screen bg-[#030407] text-zinc-100 selection:bg-cyan-300/30 selection:text-cyan-50">
      <BackgroundField />

        <TopNav
          query={query}
          setQuery={setQuery}
          language={language}
          setLanguage={setLanguage}
          copy={copy}
          currentUser={currentUser}
          viewerProfile={viewerProfile}
          onOpenAuth={onOpenAuth}
          onOpenRecorder={onOpenRecorder}
          onOpenImporter={onOpenImporter}
        />

      <section className="relative mx-auto max-w-7xl px-4 pb-20 pt-9 sm:px-6 sm:pt-10 lg:px-8">
        <HeroPanel
          total={dreams.length}
          visible={filteredDreams.length}
          loadState={loadState}
          loadError={loadError}
          activeAnomalyCount={activeAnomalyCount}
          schemaStats={schemaStats}
          copy={copy}
        />

        <HomePathways
          copy={copy}
          activeSection={activeSection}
          onSelectSection={handleHomeSection}
        />

        <CollectivePatternsPanel
          stats={collectivePatternStats}
          copy={copy}
          expanded={expandedPanels.patterns}
          onToggle={() => togglePanel("patterns")}
        />

        <ResearchPanel
          stats={researchStats}
          copy={copy}
          records={filteredDreams}
          patternStats={collectivePatternStats}
          tags={tags}
          language={language}
          expanded={expandedPanels.research}
          onToggle={() => togglePanel("research")}
          exportFilters={{
            query,
            selectedTagSlugs,
            matchMode,
            sortMode,
          }}
        />

        <FilterPanel
          tags={tags}
          tagCounts={tagCounts}
          selectedTagSlugs={selectedTagSlugs}
          toggleTag={toggleTag}
          clearTags={() => setSelectedTagSlugs([])}
          matchMode={matchMode}
          setMatchMode={setMatchMode}
          sortMode={sortMode}
          setSortMode={setSortMode}
          language={language}
          copy={copy}
          expanded={expandedPanels.filters}
          onToggle={() => togglePanel("filters")}
        />

        <ObservationGrid
          dreams={paginatedDreams}
          totalDreamCount={dreams.length}
          language={language}
          copy={copy}
          currentUser={currentUser}
          followingRecorderIds={followingRecorderIds}
          canSeeImages={canSeeImages}
          isAgeVerifiedAdult={isAgeVerifiedAdult}
          canAccessAdultDream={canAccessAdultDream}
          onToggleFollow={handleToggleFollow}
          onConfirmAdultDream={(dreamId) =>
            setAdultConfirmations((current) => ({ ...current, [dreamId]: true }))
          }
          onOpenRecord={onOpenRecord}
        />

        <PaginationControls
          currentPage={boundedCurrentPage}
          totalPages={totalPages}
          totalItems={filteredDreams.length}
          pageSize={PAGE_SIZE}
          copy={copy}
          onPageChange={setCurrentPage}
        />
      </section>
    </main>
  );
}

function normalizeDreamCard(row) {
  const rowTags = Array.isArray(row.tags) ? row.tags : [];
  const adultContent =
    Boolean(row.adultContent || row.adult_content || row.isAdult || row.is_adult) ||
    rowTags.some((tag) => tag.slug === "adult-content" || tag.slug === "adult_content");
  const tags = adultContent ? ensureAdultTag(rowTags) : rowTags;
  const originalLanguage = normalizeLanguage(
    row.originalLanguage || row.original_language || "en"
  );
  const excerpt =
    row.excerpt ||
    (row.dream_text ? createExcerpt(row.dream_text) : "");
  const originalTitle =
    row.originalTitle ||
    row.original_title ||
    getLanguageSpecificValue(row, "title", originalLanguage) ||
    row.title ||
    "";
  const originalText =
    row.originalText ||
    row.original_text ||
    getLanguageSpecificValue(row, "dream_text", originalLanguage) ||
    row.dream_text ||
    row.text ||
    "";
  const images = normalizeDreamImages(row);
  const imageUrls = images.map((image) => image.url).filter(Boolean);
  const thumbnailUrl = getPrimaryDreamImageUrl(row);
  const dreamDate = getVisibleDreamDate(row);
  const dreamDateStatus = getDreamDateStatus(row);
  const anomalyTags = Array.isArray(row.anomalyTags)
    ? row.anomalyTags
    : row.anomaly_tag_slugs ||
      tags.filter((tag) => tag.category === "Anomalies").map((tag) => tag.slug);

  return {
    dream_id: row.dream_id || row.id,
    id: row.id || row.dream_id,
    ownerId: row.ownerId || row.creatorId || "",
    creatorId: row.creatorId || row.ownerId || "",
    authorName: row.authorName || row.creatorDisplayName || row.displayName || "",
    anonymousLocked: Boolean(row.anonymousLocked),
    recordIdentityMode:
      row.recordIdentityMode === "account" || row.attributionMode === "account"
        ? "account"
        : "anonymous",
    creatorDisplayName: row.creatorDisplayName || "",
    creatorEmail: row.creatorEmail || "",
    creatorCountry: row.creatorCountry || row.creatorCountryRegion || "",
    visibility: row.visibility || (row.isPublic === false ? "private" : "public"),
    isPublic: typeof row.isPublic === "boolean" ? row.isPublic : row.visibility === "public",
    sharingMode:
      row.sharingMode ||
      (row.visibility === "stats_only"
        ? "stats_only"
        : row.isPublic
          ? row.recordIdentityMode === "account" || row.attributionMode === "account"
            ? "public_pseudonym"
            : "public_anonymous"
          : "private"),
    includedInResearchStats: Boolean(
      row.includedInResearchStats || row.researchConsent
    ),
    originalLanguage,
    originalTitle,
    originalText,
    originalExcerpt:
      row.originalExcerpt ||
      row.original_excerpt ||
      getLanguageSpecificValue(row, "excerpt", originalLanguage) ||
      createExcerpt(originalText),
    translationLanguages: normalizeTranslationLanguages(row.translationLanguages),
    translationSource: row.translationSource || "",
    title: row.title || "",
    titleEn: row.titleEn || row.title_en || "",
    title_en: row.title_en || row.titleEn || "",
    titleZh: row.titleZh || row.title_zh || "",
    title_zh: row.title_zh || row.titleZh,
    titleEs: row.titleEs || row.title_es || "",
    title_es: row.title_es || row.titleEs,
    excerpt,
    excerptEn: row.excerptEn || row.excerpt_en || "",
    excerpt_en: row.excerpt_en || row.excerptEn || "",
    excerptZh: row.excerptZh || row.excerpt_zh || "",
    excerpt_zh: row.excerpt_zh || row.excerptZh,
    excerptEs: row.excerptEs || row.excerpt_es || "",
    excerpt_es: row.excerpt_es || row.excerptEs,
    dream_text: row.dream_text || row.dreamText || row.text || row.originalText,
    dream_text_en: row.dream_text_en || row.dreamTextEn || row.textEn || row.text_en || "",
    textEn: row.textEn || row.dream_text_en || row.text_en || "",
    dream_text_zh: row.dream_text_zh || row.dreamTextZh || row.textZh || row.text_zh || "",
    textZh: row.textZh || row.dream_text_zh || row.text_zh || "",
    dream_text_es: row.dream_text_es || row.dreamTextEs || row.textEs || row.text_es || "",
    textEs: row.textEs || row.dream_text_es || row.text_es || "",
    dream_date: dreamDate,
    dreamDate,
    dreamDateStatus,
    dream_date_status: dreamDateStatus,
    dreamTime: normalizeDreamTime(row.dreamTime || row.dream_time),
    dream_time: normalizeDreamTime(row.dreamTime || row.dream_time),
    dreamPeriod: normalizeDreamPeriod(row.dreamPeriod || row.dream_period),
    dream_period: normalizeDreamPeriod(row.dreamPeriod || row.dream_period),
    dreamSequence: normalizeDreamSequence(row.dreamSequence || row.dream_sequence),
    dream_sequence: normalizeDreamSequence(row.dreamSequence || row.dream_sequence),
    adultContent,
    minimumViewerAge: row.minimumViewerAge || row.minimum_viewer_age || (adultContent ? 18 : 0),
    images,
    dreamImages: images,
    imageUrls,
    pictureUrls: imageUrls,
    thumbnailUrl,
    thumbnail_url: thumbnailUrl,
    generated_image_url: thumbnailUrl,
    environmentTags: Array.isArray(row.environmentTags) ? row.environmentTags : [],
    entityTags: Array.isArray(row.entityTags) ? row.entityTags : [],
    anomalyTags,
    emotionTags: Array.isArray(row.emotionTags) ? row.emotionTags : [],
    dreamTypeTags: Array.isArray(row.dreamTypeTags) ? row.dreamTypeTags : [],
    pseudo_id: row.pseudo_id || row.pseudoId || "",
    pseudoId: row.pseudoId || row.pseudo_id || "",
    signal_coherence: row.signal_coherence || 50,
    tags,
    anomaly_tag_slugs: anomalyTags,
  };
}

function ensureAdultTag(tags) {
  if (tags.some((tag) => tag.slug === "adult-content")) return tags;

  const adultTag = RECORD_TAGS["adult-content"];
  return adultTag ? [...tags, adultTag] : tags;
}

function isAdultDream(dream) {
  return (
    Boolean(dream.adultContent || dream.adult_content || dream.isAdult || dream.is_adult) ||
    Number(dream.minimumViewerAge || dream.minimum_viewer_age || 0) >= 18 ||
    dream.tags?.some((tag) => tag.slug === "adult-content" || tag.slug === "adult_content")
  );
}

function getDreamTitle(dream, language = "") {
  const requestedLanguage = normalizeLanguage(language || dream.originalLanguage);
  const originalLanguage = normalizeLanguage(dream.originalLanguage);

  if (
    requestedLanguage !== originalLanguage &&
    hasRecorderTranslation(dream, requestedLanguage)
  ) {
    return getLanguageSpecificValue(dream, "title", requestedLanguage) || "";
  }

  return (
    dream.originalTitle ||
    getLanguageSpecificValue(dream, "title", originalLanguage) ||
    dream.title ||
    ""
  );
}

function getDreamExcerpt(dream, language = "") {
  const requestedLanguage = normalizeLanguage(language || dream.originalLanguage);
  const originalLanguage = normalizeLanguage(dream.originalLanguage);

  if (
    requestedLanguage !== originalLanguage &&
    hasRecorderTranslation(dream, requestedLanguage)
  ) {
    return (
      getLanguageSpecificValue(dream, "excerpt", requestedLanguage) ||
      createExcerpt(getDreamText(dream, requestedLanguage)) ||
      ""
    );
  }

  return (
    dream.originalExcerpt ||
    createExcerpt(getDreamText(dream, originalLanguage)) ||
    dream.excerpt ||
    ""
  );
}

function getDreamText(dream, language = "") {
  const requestedLanguage = normalizeLanguage(language || dream.originalLanguage);
  const originalLanguage = normalizeLanguage(dream.originalLanguage);

  if (
    requestedLanguage !== originalLanguage &&
    hasRecorderTranslation(dream, requestedLanguage)
  ) {
    return getLanguageSpecificValue(dream, "dream_text", requestedLanguage) || "";
  }

  return (
    dream.originalText ||
    getLanguageSpecificValue(dream, "dream_text", originalLanguage) ||
    dream.dream_text ||
    dream.text ||
    ""
  );
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

function getDreamAuthorName(dream, copy) {
  return (
    dream.authorName ||
    dream.creatorDisplayName ||
    dream.displayName ||
    copy.anonymousObserver
  );
}

function getLanguageSpecificValue(record, field, language) {
  const normalizedLanguage = normalizeLanguage(language);
  const fieldMap = {
    title: {
      en: ["title_en", "titleEn", "title"],
      zh: ["title_zh", "titleZh"],
      es: ["title_es", "titleEs"],
    },
    excerpt: {
      en: ["excerpt_en", "excerptEn", "excerpt"],
      zh: ["excerpt_zh", "excerptZh"],
      es: ["excerpt_es", "excerptEs"],
    },
    dream_text: {
      en: ["dream_text_en", "text_en", "textEn", "dream_text", "dreamText", "text"],
      zh: ["dream_text_zh", "dreamTextZh", "textZh", "text_zh"],
      es: ["dream_text_es", "dreamTextEs", "textEs", "text_es"],
    },
  };

  const keys = fieldMap[field]?.[normalizedLanguage] || [];
  return keys.map((key) => record?.[key]).find(Boolean) || "";
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

function createExcerpt(value) {
  if (!value) return "";
  return value.length > 220 ? `${value.slice(0, 220)}...` : value;
}

function getDreamDateMillis(dream) {
  const parsed = new Date(getVisibleDreamDate(dream)).getTime();

  return Number.isFinite(parsed) ? parsed : null;
}

function compareDreamDateOrder(a, b, direction = "desc") {
  const first = getDreamDateMillis(a);
  const second = getDreamDateMillis(b);

  if (first == null && second == null) return 0;
  if (first == null) return 1;
  if (second == null) return -1;

  return direction === "asc" ? first - second : second - first;
}

function getTagName(tag, language) {
  const canonicalTag = RECORD_TAGS[tag.slug];

  if (language === "zh") {
    return TAG_TRANSLATIONS[tag.slug]?.zh || canonicalTag?.name_zh || tag.name_zh || tag.nameZh || tag.name;
  }

  if (language === "es") {
    return TAG_TRANSLATIONS[tag.slug]?.es || canonicalTag?.name_es || tag.name_es || tag.nameEs || tag.name;
  }

  return canonicalTag?.name || tag.name;
}

function getCategoryLabel(category, language) {
  return getTaxonomyCategoryLabel(category, language);
}

function mergeTagSets(...tagSets) {
  const merged = new Map();

  tagSets.flat().forEach((tag) => {
    if (!tag?.slug) return;
    merged.set(tag.slug, {
      ...merged.get(tag.slug),
      ...tag,
    });
  });

  return [...merged.values()];
}

function mergeDreamSets(...dreamSets) {
  const merged = new Map();

  dreamSets.flat().forEach((dream) => {
    const id = dream?.dream_id || dream?.id;
    if (!id) return;

    merged.set(id, {
      ...merged.get(id),
      ...dream,
    });
  });

  return [...merged.values()];
}

function buildCollectivePatternStats({ dreams, allDreams, language, filtersActive }) {
  const emotionCounts = new Map();
  const symbolCounts = new Map();
  const dreamTypeCounts = new Map();
  const languageCounts = new Map();
  const countryCounts = new Map();
  const cooccurrenceCounts = new Map();
  const lengthBinCounts = new Map();
  const datedDreams = [];
  let missingDateCount = 0;
  let lucidCount = 0;
  let nightmareCount = 0;

  dreams.forEach((dream) => {
    const originalLanguage = normalizeLanguage(dream.originalLanguage);
    incrementCount(languageCounts, getLanguageName(originalLanguage, language));

    const dreamDate = dream.dreamDateStatus === "hidden" ? "" : dream.dreamDate || dream.dream_date || "";
    const parsedDate = new Date(dreamDate).getTime();
    if (Number.isFinite(parsedDate)) {
      datedDreams.push(parsedDate);
    } else {
      missingDateCount += 1;
    }

    const country = String(dream.creatorCountry || dream.creatorCountryRegion || "").trim();
    if (country) incrementCount(countryCounts, country);

    const dreamText = getDreamText(dream);
    incrementCount(lengthBinCounts, getDreamLengthBin(dreamText));

    if (hasDreamSlug(dream, "lucid")) lucidCount += 1;
    if (hasDreamSlug(dream, "nightmare")) nightmareCount += 1;

    const visibleTagLabels = [];

    dream.tags?.forEach((tag) => {
      if (!tag?.slug) return;
      const label = getTagName(tag, language);
      visibleTagLabels.push(label);

      if (tag.category === "Emotions") incrementCount(emotionCounts, label);
      if (tag.category === "Dream Types") incrementCount(dreamTypeCounts, label);
      if (["Anomalies", "Dream Analysis", "Entities", "Environment"].includes(tag.category)) {
        incrementCount(symbolCounts, label);
      }
    });

    const uniqueLabels = [...new Set(visibleTagLabels)].slice(0, 18);
    for (let leftIndex = 0; leftIndex < uniqueLabels.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < uniqueLabels.length; rightIndex += 1) {
        const pair = [uniqueLabels[leftIndex], uniqueLabels[rightIndex]].sort().join(" + ");
        incrementCount(cooccurrenceCounts, pair);
      }
    }
  });

  const dateRange = buildDateRangeLabel(datedDreams);
  const suppressedCount = [
    emotionCounts,
    symbolCounts,
    dreamTypeCounts,
    countryCounts,
    cooccurrenceCounts,
  ].reduce((total, map) => total + countSuppressedGroups(map), 0);

  return {
    sampleSize: dreams.length,
    totalLoaded: allDreams.length,
    filtersActive,
    dateRange,
    missingDateCount,
    suppressedCount,
    emotions: toPrivacySafeEntries(emotionCounts),
    symbols: toPrivacySafeEntries(symbolCounts),
    dreamTypes: toPrivacySafeEntries(dreamTypeCounts),
    languages: toPrivacySafeEntries(languageCounts, 1),
    countries: toPrivacySafeEntries(countryCounts),
    cooccurrences: toPrivacySafeEntries(cooccurrenceCounts),
    lengthBins: toSortedLengthBins(lengthBinCounts),
    lucidCount,
    nightmareCount,
  };
}

function incrementCount(map, key) {
  if (!key) return;
  map.set(key, (map.get(key) || 0) + 1);
}

function hasDreamSlug(dream, slug) {
  return (
    dream.tags?.some((tag) => tag.slug === slug) ||
    dream.dreamTypeTags?.includes(slug) ||
    false
  );
}

function getDreamLengthBin(text) {
  const trimmed = String(text || "").trim();
  if (!trimmed) return "0";

  const tokenCount = trimmed.split(/\s+/u).filter(Boolean).length;
  const approximateCount = tokenCount <= 1 ? trimmed.length : tokenCount;

  if (approximateCount < 50) return "1–49";
  if (approximateCount < 150) return "50–149";
  if (approximateCount < 300) return "150–299";
  if (approximateCount < 600) return "300–599";

  return "600+";
}

function buildDateRangeLabel(timestamps) {
  if (!timestamps.length) return "";

  const sorted = [...timestamps].sort((a, b) => a - b);
  const start = new Date(sorted[0]).toISOString().slice(0, 10);
  const end = new Date(sorted[sorted.length - 1]).toISOString().slice(0, 10);

  return start === end ? start : `${start} – ${end}`;
}

function toPrivacySafeEntries(map, minimumCount = MIN_PRIVACY_GROUP_COUNT, limit = 8) {
  return [...map.entries()]
    .filter(([, count]) => count >= minimumCount)
    .sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])))
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }));
}

function countSuppressedGroups(map, minimumCount = MIN_PRIVACY_GROUP_COUNT) {
  return [...map.values()].filter((count) => count > 0 && count < minimumCount).length;
}

function toSortedLengthBins(map) {
  const order = ["0", "1–49", "50–149", "150–299", "300–599", "600+"];
  return order
    .map((label) => ({ label, count: map.get(label) || 0 }))
    .filter((item) => item.count > 0);
}

function buildResearchStats(dreams, visibleDreams, language) {
  const emotionCounts = new Map();
  const languageCounts = new Map();
  let coherenceTotal = 0;

  dreams.forEach((dream) => {
    coherenceTotal += Number(dream.signal_coherence || 0);
    const originalLanguage = normalizeLanguage(dream.originalLanguage);
    languageCounts.set(originalLanguage, (languageCounts.get(originalLanguage) || 0) + 1);

    dream.tags
      ?.filter((tag) => tag.category === "Emotions")
      .forEach((tag) => {
        const tagName = getTagName(tag, language);
        emotionCounts.set(tagName, (emotionCounts.get(tagName) || 0) + 1);
      });
  });

  const leadingLanguage = getTopMapEntry(languageCounts);

  return {
    total: dreams.length,
    visible: visibleDreams.length,
    adultRestricted: dreams.filter(isAdultDream).length,
    averageCoherence:
      dreams.length === 0 ? 0 : Math.round(coherenceTotal / dreams.length),
    leadingEmotion: getTopMapEntry(emotionCounts),
    leadingLanguage: leadingLanguage
      ? getLanguageName(leadingLanguage, language)
      : "",
  };
}

function buildSchemaStats(dreams) {
  const total = dreams.length;
  const emotionCount = dreams.filter(hasEmotionTags).length;
  const psychologyCount = dreams.filter(hasPsychologyTags).length;
  const analysisCount = dreams.filter(hasDreamAnalysisTags).length;

  return {
    total,
    emotionCount,
    psychologyCount,
    analysisCount,
    anomalySearch: toPercent(emotionCount, total),
    ontologyConsistency: toPercent(psychologyCount, total),
    analysisMarkerCoverage: toPercent(analysisCount, total),
  };
}

function hasEmotionTags(dream) {
  return dream.tags?.some((tag) => tag.category === "Emotions") || false;
}

function hasPsychologyTags(dream) {
  return (
    dream.tags?.some((tag) => tag.category === "Psychological Observables") ||
    false
  );
}

function hasDreamAnalysisTags(dream) {
  return (
    dream.tags?.some((tag) => tag.category === "Dream Analysis") ||
    false
  );
}

function toPercent(value, total) {
  if (total <= 0) return 0;
  return Math.round((value / total) * 100);
}

function buildTagCounts(dreams) {
  const counts = new Map();

  dreams.forEach((dream) => {
    dream.tags?.forEach((tag) => {
      if (!tag?.slug) return;
      counts.set(tag.slug, (counts.get(tag.slug) || 0) + 1);
    });
  });

  return counts;
}

function getRecorderId(dream) {
  return dream?.creatorId || dream?.ownerId || "";
}

function getAccountNavLabel(currentUser, viewerProfile, copy) {
  if (!currentUser?.uid) return copy.accountButton;

  const displayName = String(
    viewerProfile?.displayName || currentUser.displayName || ""
  ).trim();

  if (displayName) return displayName;
  if (currentUser.isAnonymous) return copy.accountButton;

  const uidSeed = currentUser.uid
    .slice(0, 6)
    .toUpperCase()
    .padEnd(6, "0");

  return `DREAMER-${uidSeed}`;
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

function BackgroundField() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute left-1/2 top-[-20rem] h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute bottom-[-12rem] right-[-8rem] h-[34rem] w-[34rem] rounded-full bg-fuchsia-500/10 blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] bg-[size:44px_44px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,.10),transparent_34rem)]" />
    </div>
  );
}

function TopNav({
  query,
  setQuery,
  language,
  setLanguage,
  copy,
  currentUser,
  viewerProfile,
  onOpenAuth,
  onOpenRecorder,
  onOpenImporter,
}) {
  const accountLabel = getAccountNavLabel(currentUser, viewerProfile, copy);

  function openReportSuggestion() {
    window.location.href = REPORT_SUGGESTION_MAILTO;
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-cyan-300/10 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-2 px-3 py-2 sm:px-5 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-center lg:px-8 lg:py-3 xl:grid-cols-[auto_minmax(0,1fr)_minmax(18rem,32rem)]">
        <div className="flex items-center justify-between gap-3 lg:block">
          <a href="#" className="group flex min-w-0 items-center gap-3" aria-label={copy.homeLabel}>
            <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-cyan-300/30 bg-cyan-300/10 shadow-[0_0_24px_rgba(34,211,238,.16)] sm:h-10 sm:w-10">
              <span className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,.35),transparent_55%)]" />
              <span className="relative font-mono text-sm font-bold text-cyan-100">C∴</span>
            </span>

            <span className="min-w-0">
              <span className="block font-mono text-xs uppercase tracking-[0.32em] text-cyan-200/80 sm:tracking-[0.38em]">
                CDO
              </span>
              <span className="hidden truncate text-sm font-semibold text-zinc-100 min-[420px]:block">
                {copy.terminalName}
              </span>
            </span>
          </a>

          <div className="lg:hidden">
            <LanguageToggle language={language} setLanguage={setLanguage} copy={copy} />
          </div>
        </div>

        <div className="cdo-mobile-scroll-nav -mx-1 px-1 lg:hidden">
          <NavButton active>{copy.mobileDatabase}</NavButton>
          <NavButton onClick={onOpenRecorder || onOpenAuth}>
            {copy.mobileSubmit}
          </NavButton>
          <NavButton onClick={onOpenImporter || onOpenAuth}>
            {copy.importDiary}
          </NavButton>
          <NavButton onClick={onOpenAuth} fixed>
            {accountLabel}
          </NavButton>
          <NavButton onClick={openReportSuggestion}>
            {copy.mobileReportSuggestion}
          </NavButton>
        </div>

        <div className="hidden min-w-0 flex-wrap items-center justify-start gap-2 lg:flex xl:flex-nowrap xl:justify-center">
          <NavButton active>{copy.globalDatabase}</NavButton>
          <NavButton onClick={onOpenRecorder || onOpenAuth}>
            {copy.submitObservation}
          </NavButton>
          <NavButton onClick={onOpenImporter || onOpenAuth}>
            {copy.importDiary}
          </NavButton>
          <NavButton onClick={onOpenAuth} fixed>
            {accountLabel}
          </NavButton>
          <NavButton onClick={openReportSuggestion}>
            {copy.reportSuggestion}
          </NavButton>
        </div>

        <div className="grid gap-2 lg:col-span-2 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center xl:col-span-1">
          <label className="relative block flex-1">
            <span className="sr-only">{copy.searchLabel}</span>
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-200/60" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={copy.searchPlaceholder}
              className="w-full rounded-xl border border-cyan-300/15 bg-zinc-950/80 py-2.5 pl-10 pr-4 font-mono text-sm text-cyan-50 outline-none transition placeholder:text-zinc-500 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20 sm:rounded-2xl lg:py-3"
            />
          </label>

          <div className="hidden lg:block">
            <LanguageToggle language={language} setLanguage={setLanguage} copy={copy} />
          </div>
        </div>
      </div>
    </nav>
  );
}

function LanguageToggle({ language, setLanguage, copy }) {
  return <LanguageMenu language={language} setLanguage={setLanguage} copy={copy} />;
}

function HeroPanel({
  total,
  visible,
  loadState,
  loadError,
  activeAnomalyCount,
  schemaStats,
  copy,
}) {
  const loadCopy = copy.loadStates[loadState];

  return (
    <header className="mb-8 overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/70 shadow-terminal backdrop-blur">
      <div className="grid gap-0 lg:grid-cols-[1.45fr_.55fr]">
        <div className="relative p-7 sm:p-9 lg:p-12">
          <div className="absolute right-8 top-8 hidden h-28 w-28 rounded-full border border-cyan-300/20 bg-cyan-300/5 blur-sm lg:block" />

          <p className="mb-4 font-mono text-xs uppercase tracking-[0.42em] text-cyan-200/70">
            {copy.heroKicker}
          </p>

          <h1 className="max-w-4xl break-words text-3xl font-semibold text-zinc-50 sm:text-5xl lg:text-6xl">
            {copy.heroTitle}
          </h1>

          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base sm:leading-8">
            {copy.heroText}
          </p>
          {copy.heroSubtext && (
            <p className="mt-5 max-w-3xl text-sm leading-relaxed text-slate-300">
              {copy.heroSubtext}
            </p>
          )}

          <div className="mt-9 flex flex-wrap gap-4">
            <StatusPill label={copy.accessLabel} value={copy.accessValue} />
            <StatusPill label={copy.datasetLabel} value={loadCopy} pulse={loadState === "live" || loadState === "loading"} />
            <StatusPill label={copy.visibleLabel} value={`${visible}/${total}`} />
            <StatusPill label={copy.anomalyFiltersLabel} value={String(activeAnomalyCount)} />
          </div>

          {loadError && (
            <p className="mt-5 max-w-3xl rounded-2xl border border-amber-300/20 bg-amber-300/5 p-4 font-mono text-xs leading-6 text-amber-100/80">
              {copy.loadError}
            </p>
          )}
        </div>

        <aside className="border-t border-white/10 bg-black/30 p-7 sm:p-9 lg:border-l lg:border-t-0">
          <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/5 p-6">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-cyan-200/70">
              {copy.schemaFocus}
            </p>

            <div className="mt-5 space-y-5">
              <SignalRow label={copy.anomalySearch} value={schemaStats.anomalySearch} />
              <SignalRow
                label={copy.ontologyConsistency}
                value={schemaStats.ontologyConsistency}
              />
              <SignalRow
                label={copy.analysisMarkerCoverage}
                value={schemaStats.analysisMarkerCoverage}
                inverse
              />
            </div>

            <div className="mt-7 rounded-xl border border-white/10 bg-black/30 p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                {copy.databaseNote}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                {copy.schemaNote?.(schemaStats) || copy.databaseNoteText}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </header>
  );
}

function HomePathways({ copy, activeSection, onSelectSection }) {
  const sections = copy.homeSections || [];
  const sectionModes = ["record", "explore", "patterns", "dream-map", "research"];

  return (
    <section className="mb-8 rounded-3xl border border-cyan-300/15 bg-zinc-950/65 p-5 shadow-[0_12px_50px_rgba(0,0,0,.28)] backdrop-blur sm:p-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-xs uppercase tracking-[0.32em] text-cyan-200/70">
            {copy.audienceKicker}
          </p>
          <h2 className="mt-3 max-w-3xl text-2xl font-semibold text-zinc-50 sm:text-3xl">
            {copy.audienceTitle}
          </h2>
          <p className="mt-3 line-clamp-2 max-w-3xl text-sm leading-relaxed text-slate-300">
            {copy.audienceText}
          </p>
        </div>
      </div>

      <div className="mt-7 grid gap-6 lg:grid-cols-2">
        <AudienceCard
          title={copy.dreamerAudienceTitle}
          text={copy.dreamerAudienceText}
          accent="cyan"
        />
        <AudienceCard
          title={copy.researcherAudienceTitle}
          text={copy.researcherAudienceText}
          accent="fuchsia"
        />
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {sections.map((section, index) => {
          const mode = sectionModes[index];
          const active = activeSection === mode;

          return (
            <button
              key={section.title}
              type="button"
              aria-pressed={active}
              onClick={() => onSelectSection?.(section, index)}
              className={[
                "min-w-0 rounded-2xl border p-5 text-left transition hover:border-cyan-300/30 hover:bg-cyan-300/[0.04]",
                active
                  ? "border-cyan-300/35 bg-cyan-300/10 shadow-[0_0_28px_rgba(34,211,238,.08)]"
                  : "border-white/10 bg-black/30",
              ].join(" ")}
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-cyan-200/70 sm:tracking-[0.2em]">
                {section.title}
              </p>
              <p className="cdo-mobile-readable-text mt-4 text-sm leading-relaxed text-slate-300">
                {section.text}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function AudienceCard({ title, text, accent }) {
  const accentClass =
    accent === "fuchsia"
      ? "border-fuchsia-300/20 bg-fuchsia-300/5"
      : "border-cyan-300/20 bg-cyan-300/5";

  return (
    <article className={`rounded-2xl border p-6 ${accentClass}`}>
      <h3 className="text-lg font-semibold text-zinc-50">{title}</h3>
      <p className="mt-4 text-sm leading-relaxed text-slate-300">{text}</p>
    </article>
  );
}

function ResearchPanel({
  stats,
  copy,
  records = [],
  patternStats,
  tags = [],
  language,
  exportFilters,
  expanded,
  onToggle,
}) {
  const [exportDetail, setExportDetail] = useState(EXPORT_DETAIL_LEVELS.ANALYSIS);
  const exportDetailOptions = [
    { value: EXPORT_DETAIL_LEVELS.DREAMS, label: copy.exportScopeDreams },
    { value: EXPORT_DETAIL_LEVELS.CODED, label: copy.exportScopeCoded },
    { value: EXPORT_DETAIL_LEVELS.ANALYSIS, label: copy.exportScopeAnalysis },
  ];

  return (
    <section id="research-archive" className="mb-8 scroll-mt-28 rounded-3xl border border-white/10 bg-zinc-950/60 p-5 shadow-[0_12px_50px_rgba(0,0,0,.30)] backdrop-blur sm:p-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-xs uppercase tracking-[0.32em] text-cyan-200/70">
            {copy.researchTitle}
          </p>
          <p className="mt-3 line-clamp-2 max-w-3xl text-sm leading-relaxed text-slate-300">
            {copy.researchText}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <CompactSummaryPill label={copy.researchTotal} value={String(stats.total)} />
            <CompactSummaryPill label={copy.researchVisible} value={String(stats.visible)} />
            <CompactSummaryPill label={copy.exportTitle} value={`N=${records.length}`} />
          </div>
        </div>
        <CollapseToggle expanded={expanded} copy={copy} onClick={onToggle} />
      </div>

      {expanded && (
        <>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <ResearchMetric label={copy.researchTotal} value={String(stats.total)} />
        <ResearchMetric label={copy.researchVisible} value={String(stats.visible)} />
        <ResearchMetric
          label={copy.researchAdultRestricted}
          value={String(stats.adultRestricted)}
        />
        <ResearchMetric
          label={copy.researchAverageCoherence}
          value={`${stats.averageCoherence}%`}
        />
        <ResearchMetric
          label={copy.researchEmotionLead}
          value={stats.leadingEmotion || copy.noResearchData}
        />
        <ResearchMetric
          label={copy.researchLanguageLead}
          value={stats.leadingLanguage || copy.noResearchData}
        />
      </div>

      <div className="mt-5 rounded-2xl border border-cyan-300/15 bg-cyan-300/5 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-cyan-100">{copy.exportTitle}</p>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">{copy.exportText}</p>
            <p className="mt-2 text-xs leading-5 text-zinc-500">{copy.exportPrivacyNote}</p>
          </div>
          <span className="rounded-full border border-cyan-300/20 bg-black/30 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-cyan-100">N={records.length}</span>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-3">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            {copy.exportScopeLabel}
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
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

        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <ExportButton disabled={records.length === 0} onClick={() => exportResearchRecordsCsv(records, { language, filters: exportFilters, detailLevel: exportDetail })}>{copy.exportCsv}</ExportButton>
          <ExportButton disabled={records.length === 0} onClick={() => exportResearchRecordsJson(records, { language, filters: exportFilters, detailLevel: exportDetail })}>{copy.exportJson}</ExportButton>
          <ExportButton disabled={!patternStats} onClick={() => exportPatternSummaryJson(patternStats, { language, filters: exportFilters })}>{copy.exportPatterns}</ExportButton>
          <ExportButton onClick={() => exportTagCodebookCsv(tags, { language, filters: exportFilters })}>{copy.exportCodebook}</ExportButton>
          <ExportButton onClick={() => exportMethodologyMarkdown({ stats: patternStats, filters: exportFilters, language, detailLevel: exportDetail })}>{copy.exportMethodology}</ExportButton>
        </div>
      </div>
        </>
      )}
    </section>
  );
}

function ExportButton({ children, onClick, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-100 transition hover:border-cyan-300/35 hover:bg-cyan-300/10 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function CollapseToggle({ expanded, copy, onClick }) {
  return (
    <button
      type="button"
      aria-expanded={expanded}
      onClick={onClick}
      className="shrink-0 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-100 transition hover:border-cyan-300/45 hover:bg-cyan-300/15"
    >
      {expanded ? copy.collapsePanel : copy.expandPanel}
    </button>
  );
}

function CompactSummaryPill({ label, value }) {
  return (
    <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-400">
      <span className="shrink-0 text-zinc-500">{label}</span>
      <span className="truncate text-cyan-100">{value}</span>
    </span>
  );
}

function ResearchMetric({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </p>
      <p className="mt-2 truncate font-mono text-sm font-semibold text-cyan-100">
        {value}
      </p>
    </div>
  );
}

function CollectivePatternsPanel({ stats, copy, expanded, onToggle }) {
  const sampleTooSmall = stats.sampleSize > 0 && stats.sampleSize < 10;

  return (
    <section id="collective-patterns" className="mb-8 scroll-mt-28 rounded-3xl border border-cyan-300/15 bg-zinc-950/60 p-5 shadow-[0_12px_50px_rgba(0,0,0,.30)] backdrop-blur sm:p-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-xs uppercase tracking-[0.32em] text-cyan-200/70">
            {copy.patternDashboardTitle}
          </p>
          <p className="mt-3 line-clamp-2 max-w-3xl text-sm leading-relaxed text-slate-300">
            {copy.patternDashboardText}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <CompactSummaryPill label={copy.patternSampleSize} value={`N=${stats.sampleSize}`} />
            <CompactSummaryPill label={copy.patternDateRange} value={stats.dateRange || copy.patternNoData} />
            <CompactSummaryPill
              label={copy.patternFilters}
              value={stats.filtersActive ? copy.patternFiltered : copy.patternAllLoaded}
            />
          </div>
        </div>
        <CollapseToggle expanded={expanded} copy={copy} onClick={onToggle} />
      </div>

      {expanded && (
        <>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ResearchMetric label={copy.patternSampleSize} value={`N=${stats.sampleSize}`} />
        <ResearchMetric label={copy.patternDateRange} value={stats.dateRange || copy.patternNoData} />
        <ResearchMetric label={copy.patternFilters} value={stats.filtersActive ? copy.patternFiltered : copy.patternAllLoaded} />
        <ResearchMetric label={copy.patternMissingData} value={String(stats.missingDateCount)} />
      </div>

      {(sampleTooSmall || stats.suppressedCount > 0) && (
        <div className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-300/5 p-5 text-sm leading-relaxed text-amber-100">
          {sampleTooSmall && <p>{copy.patternSmallSampleWarning({ count: stats.sampleSize })}</p>}
          {stats.suppressedCount > 0 && <p>{copy.patternSuppressed}</p>}
        </div>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <PatternBarList
          title={copy.patternEmotions}
          items={stats.emotions}
          total={stats.sampleSize}
          empty={copy.patternNoData}
        />
        <PatternBarList
          title={copy.patternSymbols}
          items={stats.symbols}
          total={stats.sampleSize}
          empty={copy.patternNoData}
        />
        <PatternBarList
          title={copy.patternDreamTypes}
          items={stats.dreamTypes}
          total={stats.sampleSize}
          empty={copy.patternNoData}
        />
        <PatternBarList
          title={copy.patternLanguages}
          items={stats.languages}
          total={stats.sampleSize}
          empty={copy.patternNoData}
        />
        <PatternBarList
          title={copy.patternCountries}
          items={stats.countries}
          total={stats.sampleSize}
          empty={copy.patternNoData}
        />
        <PatternBarList
          title={copy.patternLucidNightmare}
          items={[
            { label: copy.patternNightmare, count: stats.nightmareCount },
            { label: copy.patternLucid, count: stats.lucidCount },
          ].filter((item) => item.count > 0)}
          total={stats.sampleSize}
          empty={copy.patternNoData}
        />
        <PatternBarList
          title={copy.patternDreamLength}
          items={stats.lengthBins}
          total={stats.sampleSize}
          empty={copy.patternNoData}
        />
        <PatternBarList
          title={copy.patternCooccurrence}
          items={stats.cooccurrences}
          total={stats.sampleSize}
          empty={copy.patternNoData}
        />
      </div>
        </>
      )}
    </section>
  );
}

function PatternBarList({ title, items = [], total, empty }) {
  const maxCount = Math.max(1, ...items.map((item) => item.count || 0));

  return (
    <section className="rounded-2xl border border-white/10 bg-black/30 p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-zinc-300">
          {title}
        </p>
        <span className="rounded-full border border-cyan-300/20 bg-cyan-300/5 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-cyan-100">
          N={total}
        </span>
      </div>

      {items.length > 0 ? (
        <div className="mt-5 space-y-4">
          {items.map((item) => (
            <div key={item.label}>
              <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                <span className="truncate text-zinc-300">{item.label}</span>
                <span className="font-mono text-xs text-cyan-100">{item.count}</span>
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
        <p className="mt-5 text-sm leading-relaxed text-slate-400">{empty}</p>
      )}
    </section>
  );
}

function FilterPanel({
  tags,
  tagCounts,
  selectedTagSlugs,
  toggleTag,
  clearTags,
  matchMode,
  setMatchMode,
  sortMode,
  setSortMode,
  language,
  copy,
  expanded,
  onToggle,
}) {
  const [expandedCategories, setExpandedCategories] = useState({});
  const tagGroups = useMemo(
    () =>
      TAG_CATEGORY_ORDER.map((category) => ({
        category,
        tags: tags.filter((tag) => tag.category === category),
      })).filter((group) => group.tags.length > 0),
    [tags]
  );

  function toggleCategory(category) {
    setExpandedCategories((current) => ({
      ...current,
      [category]: !current[category],
    }));
  }

  const activeTagCount = selectedTagSlugs.length;
  const sortLabel =
    sortMode === "title"
      ? copy.sortTitle
      : sortMode === "coherence"
        ? copy.sortCoherence
        : sortMode === "oldest"
          ? copy.sortOldest
          : copy.sortNewest;

  return (
    <section className="mb-8 rounded-3xl border border-white/10 bg-zinc-950/60 p-5 shadow-[0_12px_50px_rgba(0,0,0,.30)] backdrop-blur sm:p-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-xs uppercase tracking-[0.32em] text-fuchsia-200/70">
            {copy.filterTitle}
          </p>
          <p className="mt-3 line-clamp-2 max-w-2xl text-sm leading-relaxed text-slate-300">
            {copy.filterText}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <CompactSummaryPill
              label={copy.selectedLabel}
              value={String(activeTagCount)}
            />
            <CompactSummaryPill
              label={copy.patternFilters}
              value={matchMode === "all" ? copy.matchAll : copy.matchAny}
            />
            <CompactSummaryPill label={copy.sortSelectLabel} value={sortLabel} />
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
          {activeTagCount > 0 && (
            <button
              type="button"
              onClick={clearTags}
              className="rounded-full border border-red-300/20 bg-red-400/5 px-4 py-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-red-100 transition hover:border-red-300/40 hover:bg-red-400/10"
            >
              {copy.clearFilters}
            </button>
          )}
          <CollapseToggle expanded={expanded} copy={copy} onClick={onToggle} />
        </div>
      </div>

      {expanded && (
        <>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
          <SegmentButton active={matchMode === "all"} onClick={() => setMatchMode("all")}>
            {copy.matchAll}
          </SegmentButton>
          <SegmentButton active={matchMode === "any"} onClick={() => setMatchMode("any")}>
            {copy.matchAny}
          </SegmentButton>

          <select
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value)}
            className="col-span-2 rounded-xl border border-white/10 bg-black/40 px-4 py-2 font-mono text-xs uppercase tracking-[0.18em] text-zinc-200 outline-none transition focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-300/20 sm:col-span-1 sm:rounded-full"
            aria-label={copy.sortSelectLabel}
          >
            <option value="coherence">{copy.sortCoherence}</option>
            <option value="newest">{copy.sortNewest}</option>
            <option value="oldest">{copy.sortOldest}</option>
            <option value="title">{copy.sortTitle}</option>
          </select>
        </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {tagGroups.map(({ category, tags: categoryTags }) => {
          const expanded = Boolean(expandedCategories[category]);
          const activeCount = categoryTags.filter((tag) =>
            selectedTagSlugs.includes(tag.slug)
          ).length;

          return (
            <div
              key={category}
              className="overflow-hidden rounded-2xl border border-white/10 bg-black/25"
            >
              <button
                type="button"
                aria-expanded={expanded}
                onClick={() => toggleCategory(category)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-white/[0.04]"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span
                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                      CATEGORY_DOT_STYLES[category] || "bg-zinc-300"
                    }`}
                  />
                  <span className="truncate font-mono text-xs uppercase tracking-[0.2em] text-zinc-100">
                    {getCategoryLabel(category, language)}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                  {activeCount > 0 && (
                    <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-2 py-1 text-cyan-100">
                      {activeCount} {copy.selectedLabel}
                    </span>
                  )}
                  <span>{categoryTags.length}</span>
                  <span className="text-cyan-100">{expanded ? "-" : "+"}</span>
                </span>
              </button>

              {expanded && (
                <div className="overflow-x-auto border-t border-white/10 p-4">
                  <div className="flex flex-nowrap gap-3 pb-1">
                    {categoryTags.map((tag) => {
                      const active = selectedTagSlugs.includes(tag.slug);
                      const tagName = getTagName(tag, language);
                      const tagCount = tagCounts.get(tag.slug) || 0;

                      return (
                        <button
                          key={tag.id || tag.slug}
                          type="button"
                          aria-pressed={active}
                          onClick={() => toggleTag(tag.slug)}
                          className={[
                            "max-w-[12rem] shrink-0 truncate whitespace-nowrap rounded-full border px-3 py-2 font-mono text-xs uppercase tracking-[0.18em] transition sm:max-w-[16rem]",
                            active
                              ? CATEGORY_STYLES[tag.category]
                              : "border-white/10 bg-white/[0.03] text-zinc-400 hover:border-cyan-300/35 hover:text-cyan-100",
                          ].join(" ")}
                          title={`${getCategoryLabel(tag.category, language)}: ${tagName}`}
                        >
                          #{tagName}
                          <span className="ml-2 rounded-full bg-black/25 px-1.5 py-0.5 text-[10px] text-zinc-300">
                            {tagCount}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedTagSlugs.length > 0 && (
        <button
          type="button"
          onClick={clearTags}
          className="mt-5 rounded-full border border-red-300/20 bg-red-400/5 px-4 py-2.5 font-mono text-xs uppercase tracking-[0.18em] text-red-200/80 transition hover:border-red-300/40 hover:bg-red-400/10"
        >
          {copy.clearFilters}
        </button>
      )}
        </>
      )}
    </section>
  );
}

function ObservationGrid({
  dreams,
  totalDreamCount,
  language,
  copy,
  currentUser,
  followingRecorderIds,
  canSeeImages,
  isAgeVerifiedAdult,
  canAccessAdultDream,
  onConfirmAdultDream,
  onToggleFollow,
  onOpenRecord,
}) {
  if (dreams.length === 0) {
    const emptyDatabase = totalDreamCount === 0;

    return (
      <section id="dream-explore" className="scroll-mt-28 rounded-3xl border border-dashed border-cyan-300/20 bg-cyan-300/5 p-10 text-center sm:p-12">
        <p className="font-mono text-sm uppercase tracking-[0.25em] text-cyan-100">
          {emptyDatabase ? copy.noRecordsTitle : copy.noMatchesTitle}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-slate-300">
          {emptyDatabase ? copy.noRecordsText : copy.noMatchesText}
        </p>
      </section>
    );
  }

  return (
    <section id="dream-explore" className="scroll-mt-28 columns-1 gap-6 sm:columns-2 xl:columns-3 2xl:columns-4">
      {dreams.map((dream) => (
        <ObservationCard
          key={dream.dream_id}
          dream={dream}
          language={language}
          copy={copy}
          currentUser={currentUser}
          followingRecorderIds={followingRecorderIds}
          canSeeImages={canSeeImages}
          isAgeVerifiedAdult={isAgeVerifiedAdult}
          canAccessAdultDream={canAccessAdultDream}
          onConfirmAdultDream={onConfirmAdultDream}
          onToggleFollow={onToggleFollow}
          onOpenRecord={onOpenRecord}
        />
      ))}
    </section>
  );
}

function PaginationControls({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  copy,
  onPageChange,
}) {
  if (totalItems <= pageSize) return null;

  const firstVisible = (currentPage - 1) * pageSize + 1;
  const lastVisible = Math.min(currentPage * pageSize, totalItems);

  return (
    <nav className="mt-8 flex flex-col gap-4 rounded-2xl border border-white/10 bg-zinc-950/70 p-5 font-mono text-xs uppercase tracking-[0.16em] text-zinc-300 sm:flex-row sm:items-center sm:justify-between">
      <p>
        {copy.showingLabel} {firstVisible}-{lastVisible} / {totalItems}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="rounded-full border border-white/10 bg-black/30 px-3 py-2 transition enabled:hover:border-cyan-300/35 enabled:hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {copy.previousPage}
        </button>
        <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-cyan-100">
          {copy.pageLabel} {currentPage} {copy.pageOf} {totalPages}
        </span>
        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="rounded-full border border-white/10 bg-black/30 px-3 py-2 transition enabled:hover:border-cyan-300/35 enabled:hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {copy.nextPage}
        </button>
      </div>
    </nav>
  );
}

function ObservationCard({
  dream,
  language,
  copy,
  currentUser,
  followingRecorderIds,
  canSeeImages,
  isAgeVerifiedAdult,
  canAccessAdultDream,
  onConfirmAdultDream,
  onToggleFollow,
  onOpenRecord,
}) {
  const [collectStatus, setCollectStatus] = useState("");
  const [followStatus, setFollowStatus] = useState("");
  const [tagsExpanded, setTagsExpanded] = useState(false);
  const adultDream = isAdultDream(dream);
  const adultAccessible = canAccessAdultDream(dream);
  const guestAdultGate = adultDream && !adultAccessible && !isAgeVerifiedAdult;
  const displayTitle = guestAdultGate
    ? copy.adultRestrictedTitle
    : getDreamTitle(dream, language);
  const canShowThumbnail = Boolean(canSeeImages && getPrimaryDreamImageUrl(dream));
  const recorderId = getRecorderId(dream);
  const canShowFollow =
    !guestAdultGate &&
    dream.recordIdentityMode === "account" &&
    recorderId &&
    recorderId !== currentUser?.uid;
  const showDreamDate = dream.dreamDateStatus !== "hidden";
  const isFollowingRecorder = Boolean(
    recorderId && followingRecorderIds?.has(recorderId)
  );
  const canToggleTags = dream.tags.length > 3;

  async function handleCollect(event) {
    event.stopPropagation();

    if (adultDream && !adultAccessible) {
      setCollectStatus(
        currentUser?.uid && !currentUser.isAnonymous
          ? copy.adultAccountPrompt
          : copy.adultGuestPrompt
      );
      return;
    }

    if (!currentUser?.uid) {
      setCollectStatus(copy.signInToCollect);
      return;
    }

    const recordReference = {
      ...dream,
      id: dream.dream_id,
      originalLanguage: normalizeLanguage(dream.originalLanguage),
      originalTitle: dream.originalTitle || getDreamTitle(dream, dream.originalLanguage),
      originalText: dream.originalText || getDreamText(dream, dream.originalLanguage),
      recordIdentityMode: dream.recordIdentityMode || "anonymous",
      adultContent: adultDream,
      minimumViewerAge: adultDream ? 18 : 0,
      authorName: getDreamAuthorName(dream, copy),
      date: dream.dream_date,
      dreamDate: dream.dreamDate || dream.dream_date || "",
      dreamDateStatus: dream.dreamDateStatus,
      pseudoId: dream.pseudo_id,
    };

    try {
      await Promise.all([
        saveRecordForUser(currentUser, recordReference),
        collectRecordForUser(currentUser, recordReference),
      ]);
      setCollectStatus(copy.collectedDream);
    } catch (error) {
      setCollectStatus(error.message);
    }
  }

  async function handleFollow(event) {
    event.stopPropagation();
    setFollowStatus("");

    if (!currentUser?.uid || currentUser.isAnonymous) {
      setFollowStatus(copy.signInToFollow);
      return;
    }

    try {
      await onToggleFollow?.(dream);
      setFollowStatus("");
    } catch (error) {
      setFollowStatus(error.message || copy.followLimitReached);
    }
  }

  return (
    <article
      onClick={() => {
        if (guestAdultGate) return;

        onOpenRecord?.({
          ...dream,
          id: dream.dream_id,
          originalLanguage: normalizeLanguage(dream.originalLanguage),
          originalTitle: dream.originalTitle || getDreamTitle(dream, dream.originalLanguage),
          originalText: dream.originalText || getDreamText(dream, dream.originalLanguage),
          recordIdentityMode: dream.recordIdentityMode || "anonymous",
          adultContent: adultDream,
          minimumViewerAge: adultDream ? 18 : 0,
          authorName: getDreamAuthorName(dream, copy),
          date: dream.dream_date,
          dreamDate: dream.dreamDate || dream.dream_date || "",
          dreamDateStatus: dream.dreamDateStatus,
          pseudoId: dream.pseudo_id,
        });
      }}
      className="group mb-6 inline-block w-full cursor-pointer break-inside-avoid overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/80 shadow-[0_0_0_1px_rgba(34,211,238,.04),0_18px_60px_rgba(0,0,0,.35)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-cyan-300/35 hover:shadow-[0_0_46px_rgba(34,211,238,.12)]"
    >
      {guestAdultGate ? (
        <AdultGatePanel
          copy={copy}
          currentUser={currentUser}
          onConfirm={() => onConfirmAdultDream(dream.dream_id)}
        />
      ) : canShowThumbnail ? (
        <ObservationThumbnail
          dream={dream}
          language={language}
          copy={copy}
          canSeeImages={canSeeImages}
        />
      ) : (
        null
      )}

      <div className="p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-cyan-200/70">
            {dream.pseudo_id}
          </span>
          {showDreamDate && (
            <span className="rounded-full border border-fuchsia-300/20 bg-fuchsia-300/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-fuchsia-100">
              {dream.dream_date || copy.unknownDate}
            </span>
          )}
        </div>

        {displayTitle && (
          <h2 className="text-xl font-semibold tracking-[-0.03em] text-zinc-50">
            {displayTitle}
          </h2>
        )}
        {!guestAdultGate && (
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500">
            {copy.recordedBy} @{getDreamAuthorName(dream, copy)}
          </p>
        )}
        <p className="mt-3 inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-cyan-100">
          {copy.originalLanguageLabel}: {getLanguageName(dream.originalLanguage, language)}
        </p>
        {adultDream && (
          <p className="ml-0 mt-3 inline-flex rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-amber-100 sm:ml-2">
            {copy.adultContentLabel} 18+
          </p>
        )}

        <p className="mt-4 text-sm leading-relaxed text-slate-300">
          {guestAdultGate ? copy.adultGuestPrompt : getDreamExcerpt(dream, language)}
        </p>

        {!guestAdultGate && dream.recordIdentityMode === "account" && (
          <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-4">
            <p className="break-words font-mono text-xs uppercase tracking-[0.16em] text-cyan-100">
              {dream.creatorDisplayName || dream.pseudo_id}
            </p>
            {dream.creatorEmail && (
              <p className="mt-1 break-words font-mono text-[11px] text-zinc-500">
                {copy.publicEmailLabel}: {dream.creatorEmail}
              </p>
            )}
            {canShowFollow && (
              <button
                type="button"
                onClick={handleFollow}
                className="mt-3 rounded-xl border border-fuchsia-300/25 bg-fuchsia-300/10 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-fuchsia-100 transition hover:border-fuchsia-300/45 hover:bg-fuchsia-300/15"
              >
                {isFollowingRecorder ? copy.followingRecorder : copy.followRecorder}
              </button>
            )}
            {followStatus && (
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-amber-100">
                {followStatus}
              </p>
            )}
          </div>
        )}

        {dream.tags.length > 0 && (
          <div className="mt-6">
            <div
              className={[
                "flex gap-2 overflow-hidden transition-[max-height] duration-300",
                tagsExpanded
                  ? "max-h-64 flex-wrap overflow-y-auto pr-1"
                  : "max-h-9 flex-nowrap overflow-x-auto overflow-y-hidden pb-1",
              ].join(" ")}
            >
              {dream.tags.map((tag) => (
                <TagBadge key={`${dream.dream_id}-${tag.slug}`} tag={tag} language={language} />
              ))}
            </div>

            {canToggleTags && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setTagsExpanded((current) => !current);
                }}
                className="mt-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400 transition hover:border-cyan-300/35 hover:text-cyan-100"
              >
                {tagsExpanded ? copy.hideTags : `${copy.showTags} (${dream.tags.length})`}
              </button>
            )}
          </div>
        )}

        <div className="mt-6 border-t border-white/10 pt-5">
          <div className="mb-2 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.18em]">
            <span className="text-zinc-500">{copy.signalCoherence}</span>
            <span className="text-cyan-100">{dream.signal_coherence}%</span>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="cdo-gradient-bar h-full rounded-full"
              style={{ width: `${dream.signal_coherence}%` }}
            />
          </div>
          <button
            type="button"
            onClick={handleCollect}
            className="mt-4 w-full rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 font-mono text-xs font-bold uppercase tracking-[0.18em] text-cyan-100 transition hover:border-cyan-300/45 hover:bg-cyan-300/15"
          >
            {collectStatus || copy.collectDream}
          </button>
        </div>
      </div>
    </article>
  );
}

function AdultGatePanel({ copy, currentUser, onConfirm }) {
  const accountNeedsSavedAge = Boolean(currentUser?.uid && !currentUser.isAnonymous);

  return (
    <div className="relative flex min-h-48 flex-col justify-center border-b border-amber-300/20 bg-amber-300/5 p-5">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(251,191,36,.08)_1px,transparent_1px),linear-gradient(rgba(251,191,36,.07)_1px,transparent_1px)] bg-[size:28px_28px] opacity-20" />
      <div className="relative">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-amber-100">
          {copy.adultRestrictedTitle}
        </p>
        <p className="mt-3 text-sm leading-6 text-zinc-300">
          {accountNeedsSavedAge ? copy.adultAccountPrompt : copy.adultGuestPrompt}
        </p>
        {!accountNeedsSavedAge && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onConfirm();
              }}
              className="rounded-xl border border-amber-300/35 bg-amber-300 px-3 py-2 font-mono text-xs font-bold uppercase tracking-[0.16em] text-zinc-950 transition hover:bg-amber-200"
            >
              {copy.confirmAdult}
            </button>
            <button
              type="button"
              onClick={(event) => event.stopPropagation()}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 font-mono text-xs font-bold uppercase tracking-[0.16em] text-zinc-300"
            >
              {copy.denyAdult}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ObservationThumbnail({ dream, language, copy, canSeeImages }) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = getPrimaryDreamImageUrl(dream);

  if (!canSeeImages || !imageUrl || imageFailed) return null;

  return (
    <div className="relative h-48 overflow-hidden border-b border-white/10 bg-black">
      <img
        src={imageUrl}
        alt={`${copy.generatedImageAlt} ${getDreamTitle(dream, language)}`}
        className="h-full w-full object-cover opacity-90"
        onError={() => setImageFailed(true)}
      />

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px)] bg-[size:28px_28px] opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,.24),transparent_42%)]" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent" />

      <div className="absolute left-4 top-4 rounded-full border border-cyan-300/20 bg-black/50 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-100 backdrop-blur">
        {copy.generatedImage}
      </div>

      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-400">
            {copy.visualHash}
          </p>
          <p className="mt-1 font-mono text-xs text-cyan-100">
            VX-{String(dream.dream_id).slice(0, 8).toUpperCase()}
          </p>
        </div>

        <div className="h-10 w-10 rounded-full border border-cyan-300/30 bg-cyan-300/10 shadow-[0_0_24px_rgba(34,211,238,.18)]" />
      </div>
    </div>
  );
}

function NavButton({ children, active = false, onClick, fixed = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "cdo-mobile-label min-h-10 min-w-0 rounded-xl px-2.5 py-2 font-mono text-[10px] uppercase tracking-[0.08em] transition sm:min-h-10 sm:rounded-full sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.16em] lg:min-w-[4.8rem] lg:px-3 xl:px-4",
        fixed ? "overflow-hidden sm:w-36 lg:w-32 xl:w-36" : "",
        active
          ? "border border-cyan-300/30 bg-cyan-300/10 text-cyan-50 shadow-[0_0_18px_rgba(34,211,238,.12)]"
          : "border border-white/10 bg-white/[0.03] text-zinc-400 hover:border-fuchsia-300/30 hover:text-fuchsia-100",
      ].join(" ")}
    >
      <span className="block max-w-full truncate sm:max-w-[9rem] lg:max-w-[7rem] xl:max-w-none">{children}</span>
    </button>
  );
}

function SegmentButton({ children, active, onClick }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={[
        "rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-[0.18em] transition",
        active
          ? "border-fuchsia-300/40 bg-fuchsia-300/10 text-fuchsia-50"
          : "border-white/10 bg-black/30 text-zinc-400 hover:border-cyan-300/30 hover:text-cyan-100",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function StatusPill({ label, value, pulse = false }) {
  return (
    <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">
      {pulse && (
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-200" />
        </span>
      )}
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </span>
      <span className="font-mono text-xs uppercase tracking-[0.16em] text-cyan-100">
        {value}
      </span>
    </div>
  );
}

function SignalRow({ label, value, inverse = false }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-400">
          {label}
        </span>
        <span className="font-mono text-xs text-cyan-100">{value}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className={[
            "h-full rounded-full",
            inverse
              ? "bg-gradient-to-r from-zinc-600 to-cyan-300/70"
              : "bg-gradient-to-r from-cyan-300 to-fuchsia-400",
          ].join(" ")}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function TagBadge({ tag, language }) {
  return (
    <span
      className={[
        "inline-flex max-w-[11rem] shrink-0 truncate whitespace-nowrap rounded-full border px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.16em] sm:max-w-[14rem]",
        CATEGORY_STYLES[tag.category] || "border-white/10 bg-white/[0.03] text-zinc-300",
      ].join(" ")}
    >
      #{getTagName(tag, language)}
    </span>
  );
}

function SearchIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none">
      <path
        d="m21 21-4.35-4.35M10.8 18.6a7.8 7.8 0 1 1 0-15.6 7.8 7.8 0 0 1 0 15.6Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
