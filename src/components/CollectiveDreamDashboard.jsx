import { useEffect, useMemo, useState } from "react";
import {
  DREAM_TRANSLATIONS,
  FALLBACK_DREAMS,
  FALLBACK_TAGS,
  TAG_TRANSLATIONS,
} from "../data/fallbackDreams.js";
import {
  getHtmlLang,
  getLanguageName,
  LANGUAGE_OPTIONS,
  normalizeLanguage,
} from "../lib/language.js";
import {
  getPrimaryDreamImageUrl,
  normalizeDreamImages,
} from "../lib/dreamImageService.js";
import { isSupabaseConfigured, supabase } from "../lib/supabaseClient.js";
import {
  collectRecordForUser,
  fetchPublicRecords,
  saveRecordForUser,
} from "../lib/recordsService.js";
import { getOrCreateUserProfile } from "../lib/profileService.js";
import {
  getCategoryLabel as getTaxonomyCategoryLabel,
  RECORD_TAGS,
  TAG_CATEGORY_ORDER,
} from "../lib/tagTaxonomy.js";

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

const CATEGORY_FILTERS = ["All", ...TAG_CATEGORY_ORDER];
const DEFAULT_TAGS = Object.values(RECORD_TAGS);

const UI_COPY = {
  en: {
    documentTitle: "Collective Dream Database",
    homeLabel: "Collective Dream Database home",
    terminalName: "Dream Observation Terminal",
    mobileDatabase: "Database",
    mobileSubmit: "Submit",
    globalDatabase: "Global Database",
    submitObservation: "Submit Observation",
    searchLabel: "Search dream observations",
    searchPlaceholder: "Search dreams, pseudo-IDs, emotions, anomalies...",
    languageLabel: "Switch interface language",
    englishLabel: "English interface",
    chineseLabel: "Traditional Chinese interface",
    spanishLabel: "Spanish interface",
    heroKicker: "Classified Research Interface // Collective Dream Logs",
    heroTitle: "Collective Dream Database",
    heroText:
      "Anonymous dream observations are normalized into an ontology of environments, entities, and anomalies. The interface is built for rapid visual scanning while preserving the sober structure of a research archive.",
    accessLabel: "Access",
    accessValue: "Anonymous",
    datasetLabel: "Dataset",
    visibleLabel: "Visible",
    anomalyFiltersLabel: "Anomaly filters",
    loadStates: {
      loading: "Connecting to live archive",
      live: "Live archive dataset",
      fallback: "Local fallback dataset",
    },
    loadError: "The live archive is unavailable, so local fallback data is shown:",
    schemaFocus: "Schema Focus",
    anomalySearch: "Anomaly-tag search",
    ontologyConsistency: "Ontology consistency",
    identityExposure: "Identity exposure",
    databaseNote: "Database note",
    databaseNoteText:
      "Tags help researchers locate related dream signals quickly while keeping identity exposure low.",
    filterTitle: "Advanced Tag Filtering",
    filterText:
      "Filter by ontology category or combine specific tags. Match all is best for narrow anomaly research; match any is best for discovery.",
    matchAll: "Match all",
    matchAny: "Match any",
    categorySelectLabel: "Filter tags by category",
    sortSelectLabel: "Sort dreams",
    sortCoherence: "Sort: Coherence",
    sortNewest: "Sort: Newest",
    sortTitle: "Sort: Title",
    clearFilters: "Clear filters",
    noMatchesTitle: "No matching dream observations",
    noMatchesText:
      "Remove a tag, switch from match all to match any, or broaden the search query to restore the signal.",
    generatedImage: "Generated Image",
    generatedImageAlt: "Generated visual for dream titled",
    visualHash: "Visual hash",
    signalCoherence: "Signal coherence",
    originalLanguageLabel: "Original language",
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
    researchTitle: "Collective Research Signals",
    researchText:
      "A live snapshot for collective analysis: emotion labels, language origin, maturity gates, and coherence patterns.",
    researchTotal: "Total records",
    researchVisible: "Visible now",
    researchAdultRestricted: "Mature gated",
    researchAverageCoherence: "Avg coherence",
    researchEmotionLead: "Leading emotion",
    researchLanguageLead: "Leading original language",
    noResearchData: "Not enough signal yet",
    collectDream: "Collect",
    collectedDream: "Collected",
    signInToCollect: "Sign in to collect",
  },
  zh: {
    documentTitle: "集體夢境資料庫",
    homeLabel: "集體夢境資料庫首頁",
    terminalName: "夢境觀測終端",
    mobileDatabase: "資料庫",
    mobileSubmit: "提交",
    globalDatabase: "全球資料庫",
    submitObservation: "提交觀測",
    searchLabel: "搜尋夢境觀測",
    searchPlaceholder: "搜尋夢境、匿名 ID、情緒、異常現象...",
    languageLabel: "切換介面語言",
    englishLabel: "英文介面",
    chineseLabel: "繁體中文介面",
    spanishLabel: "西班牙文介面",
    heroKicker: "機密研究介面 // 集體夢境紀錄",
    heroTitle: "集體夢境資料庫",
    heroText:
      "匿名夢境觀測會被整理成環境、實體與異常現象的本體分類。此介面保留研究檔案的嚴謹結構，同時方便快速視覺掃描。",
    accessLabel: "存取",
    accessValue: "匿名",
    datasetLabel: "資料集",
    visibleLabel: "可見",
    anomalyFiltersLabel: "異常篩選",
    loadStates: {
      loading: "連線至即時檔案庫",
      live: "即時檔案庫資料集",
      fallback: "本機備用資料集",
    },
    loadError: "即時檔案庫暫時無法使用，因此改顯示本機備用資料：",
    schemaFocus: "架構焦點",
    anomalySearch: "異常標籤搜尋",
    ontologyConsistency: "本體一致性",
    identityExposure: "身分暴露",
    databaseNote: "資料庫備註",
    databaseNoteText:
      "標籤能協助研究者快速定位相關夢境訊號，同時降低身分暴露。",
    filterTitle: "進階標籤篩選",
    filterText:
      "可依本體類別篩選，或組合特定標籤。全部符合適合精準的異常研究；任一符合適合探索。",
    matchAll: "全部符合",
    matchAny: "任一符合",
    categorySelectLabel: "依類別篩選標籤",
    sortSelectLabel: "排序夢境",
    sortCoherence: "排序：一致性",
    sortNewest: "排序：最新",
    sortTitle: "排序：標題",
    clearFilters: "清除篩選",
    noMatchesTitle: "沒有相符的夢境觀測",
    noMatchesText: "移除標籤、改用任一符合，或放寬搜尋字詞以恢復訊號。",
    generatedImage: "生成影像",
    generatedImageAlt: "夢境生成視覺，標題為",
    visualHash: "視覺雜湊",
    signalCoherence: "訊號一致性",
    originalLanguageLabel: "原始語言",
    adultContentLabel: "成人內容",
    adultRestrictedTitle: "年齡限制夢境",
    adultGuestPrompt: "此紀錄可能包含成人內容。請確認你已滿 18 歲，才能閱讀此紀錄。",
    adultAccountPrompt: "只有已儲存年齡且年滿 18 歲的帳戶可以開啟此紀錄。",
    confirmAdult: "我已滿 18 歲",
    denyAdult: "暫不閱讀",
    imageHiddenForGuest: "訪客不顯示圖片",
    wordsOnlyForGuest: "訪客文字模式",
    researchTitle: "集體研究訊號",
    researchText: "供集體分析使用的即時概覽：情緒標籤、原始語言、成人內容門檻與一致性模式。",
    researchTotal: "總紀錄",
    researchVisible: "目前可見",
    researchAdultRestricted: "成人門檻",
    researchAverageCoherence: "平均一致性",
    researchEmotionLead: "主要情緒",
    researchLanguageLead: "主要原始語言",
    noResearchData: "訊號尚不足",
    collectDream: "收藏",
    collectedDream: "已收藏",
    signInToCollect: "登入後可收藏",
  },
  es: {
    documentTitle: "Base de Sueños Colectivos",
    homeLabel: "Inicio de la Base de Sueños Colectivos",
    terminalName: "Terminal de Observación de Sueños",
    mobileDatabase: "Base",
    mobileSubmit: "Enviar",
    globalDatabase: "Base global",
    submitObservation: "Enviar observación",
    searchLabel: "Buscar observaciones de sueños",
    searchPlaceholder: "Buscar sueños, pseudo-ID, emociones, anomalías...",
    languageLabel: "Cambiar idioma de la interfaz",
    englishLabel: "Interfaz en inglés",
    chineseLabel: "Interfaz en chino tradicional",
    spanishLabel: "Interfaz en español",
    heroKicker: "Interfaz de investigación clasificada // Registros colectivos",
    heroTitle: "Base de Sueños Colectivos",
    heroText:
      "Las observaciones anónimas de sueños se organizan en una ontología de entornos, entidades y anomalías. La interfaz permite una lectura visual rápida sin perder la estructura sobria de un archivo de investigación.",
    accessLabel: "Acceso",
    accessValue: "Anónimo",
    datasetLabel: "Datos",
    visibleLabel: "Visible",
    anomalyFiltersLabel: "Filtros de anomalía",
    loadStates: {
      loading: "Conectando con el archivo activo",
      live: "Archivo activo",
      fallback: "Datos locales de respaldo",
    },
    loadError:
      "El archivo activo no está disponible, por eso se muestran datos locales:",
    schemaFocus: "Enfoque del Esquema",
    anomalySearch: "Búsqueda por etiquetas",
    ontologyConsistency: "Consistencia ontológica",
    identityExposure: "Exposición de identidad",
    databaseNote: "Nota de base de datos",
    databaseNoteText:
      "Las etiquetas ayudan a localizar señales relacionadas con rapidez y reducen la exposición de identidad.",
    filterTitle: "Filtrado Avanzado",
    filterText:
      "Filtra por categoría ontológica o combina etiquetas específicas. Coincidir todo sirve para investigación precisa; coincidir cualquiera sirve para exploración.",
    matchAll: "Coincidir todo",
    matchAny: "Cualquiera",
    categorySelectLabel: "Filtrar etiquetas por categoría",
    sortSelectLabel: "Ordenar sueños",
    sortCoherence: "Orden: Coherencia",
    sortNewest: "Orden: Más reciente",
    sortTitle: "Orden: Título",
    clearFilters: "Limpiar filtros",
    noMatchesTitle: "No hay observaciones coincidentes",
    noMatchesText:
      "Quita una etiqueta, cambia a cualquiera o amplía la búsqueda para recuperar la señal.",
    generatedImage: "Imagen generada",
    generatedImageAlt: "Visual generado para el sueño titulado",
    visualHash: "Hash visual",
    signalCoherence: "Coherencia de señal",
    originalLanguageLabel: "Idioma original",
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
    researchTitle: "Señales de Investigación Colectiva",
    researchText:
      "Una vista para análisis colectivo: emociones, idioma original, límites de madurez y patrones de coherencia.",
    researchTotal: "Registros",
    researchVisible: "Visibles ahora",
    researchAdultRestricted: "Madurez filtrada",
    researchAverageCoherence: "Coherencia media",
    researchEmotionLead: "Emoción principal",
    researchLanguageLead: "Idioma original principal",
    noResearchData: "Señal insuficiente",
    collectDream: "Coleccionar",
    collectedDream: "Coleccionado",
    signInToCollect: "Inicia sesión para coleccionar",
  },
};

const INITIAL_LOAD_STATE = "loading";

export default function CollectiveDreamDashboard({
  language: selectedLanguage,
  setLanguage: setSelectedLanguage,
  currentUser,
  onOpenAuth,
  onOpenRecorder,
  onOpenRecord,
}) {
  const [localLanguage, setLocalLanguage] = useState("zh");
  const language = selectedLanguage || localLanguage;
  const setLanguage = setSelectedLanguage || setLocalLanguage;
  const [dreams, setDreams] = useState(FALLBACK_DREAMS);
  const [tags, setTags] = useState(() => mergeTagSets(DEFAULT_TAGS, FALLBACK_TAGS));
  const [query, setQuery] = useState("");
  const [selectedTagSlugs, setSelectedTagSlugs] = useState([]);
  const [matchMode, setMatchMode] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortMode, setSortMode] = useState("newest");
  const [loadState, setLoadState] = useState(INITIAL_LOAD_STATE);
  const [loadError, setLoadError] = useState(null);
  const [viewerProfile, setViewerProfile] = useState(null);
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
      let supabaseDreams = [];
      let supabaseTags = [];

      try {
        firestoreDreams = await fetchPublicRecords({
          includeAdult: canLoadAdultRecords,
        });
      } catch (error) {
        loadErrors.push(error.message);
      }

      if (isSupabaseConfigured && supabase) {
        const [dreamResponse, tagResponse] = await Promise.all([
          supabase
            .from("v_dream_cards")
            .select("*")
            .order("dream_date", { ascending: false })
            .limit(100),
          supabase
            .from("tags")
            .select("id, category, name, slug")
            .order("category", { ascending: true })
            .order("name", { ascending: true }),
        ]);

        if (dreamResponse.error || tagResponse.error) {
          loadErrors.push(dreamResponse.error?.message || tagResponse.error?.message);
        } else {
          supabaseDreams = dreamResponse.data || [];
          supabaseTags = tagResponse.data || [];
        }
      }

      if (ignore) return;

      const liveDreams = mergeDreamSets(
        firestoreDreams.map(normalizeDreamCard),
        supabaseDreams.map(normalizeDreamCard)
      );

      if (liveDreams.length === 0) {
        setLoadState("fallback");
        setLoadError(loadErrors[0] || null);
        setDreams(FALLBACK_DREAMS);
        setTags(mergeTagSets(DEFAULT_TAGS, FALLBACK_TAGS));
        return;
      }

      setDreams(liveDreams);
      setTags(
        mergeTagSets(
          DEFAULT_TAGS,
          FALLBACK_TAGS,
          supabaseTags,
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

  const visibleTags = useMemo(() => {
    if (categoryFilter === "All") return tags;
    return tags.filter((tag) => tag.category === categoryFilter);
  }, [tags, categoryFilter]);
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
              dream.excerpt,
              getDreamExcerpt(dream, language),
              dream.dream_text,
              getDreamText(dream, language),
              dream.pseudo_id,
              dreamTagNames,
              dreamTagSlugs.join(" "),
              dreamCategories,
            ])
          .join(" ")
          .toLowerCase();

        const matchesSearch = needle.length === 0 || searchableText.includes(needle);
        const matchesCategory =
          categoryFilter === "All" ||
          dream.tags.some((tag) => tag.category === categoryFilter);

        const matchesTags =
          selectedTagSlugs.length === 0 ||
          (matchMode === "all"
            ? selectedTagSlugs.every((slug) => dreamTagSlugs.includes(slug))
            : selectedTagSlugs.some((slug) => dreamTagSlugs.includes(slug)));

        return matchesSearch && matchesCategory && matchesTags;
      })
      .sort((a, b) => {
        if (sortMode === "newest") {
          return new Date(b.dream_date).getTime() - new Date(a.dream_date).getTime();
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
    categoryFilter,
    sortMode,
    language,
    isAgeVerifiedAdult,
  ]);

  const activeAnomalyCount = selectedTagSlugs.filter((slug) => {
    const tag = tags.find((item) => item.slug === slug);
    return tag?.category === "Anomalies";
  }).length;
  const researchStats = useMemo(
    () => buildResearchStats(dreams, filteredDreams, language),
    [dreams, filteredDreams, language]
  );

  function toggleTag(slug) {
    setSelectedTagSlugs((current) =>
      current.includes(slug)
        ? current.filter((item) => item !== slug)
        : [...current, slug]
    );
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
        onOpenAuth={onOpenAuth}
        onOpenRecorder={onOpenRecorder}
      />

      <section className="relative mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <HeroPanel
          total={dreams.length}
          visible={filteredDreams.length}
          loadState={loadState}
          loadError={loadError}
          activeAnomalyCount={activeAnomalyCount}
          copy={copy}
        />

        <ResearchPanel stats={researchStats} copy={copy} />

        <FilterPanel
          tags={visibleTags}
          selectedTagSlugs={selectedTagSlugs}
          toggleTag={toggleTag}
          clearTags={() => setSelectedTagSlugs([])}
          matchMode={matchMode}
          setMatchMode={setMatchMode}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          sortMode={sortMode}
          setSortMode={setSortMode}
          language={language}
          copy={copy}
        />

        <ObservationGrid
          dreams={filteredDreams}
          language={language}
          copy={copy}
          currentUser={currentUser}
          canSeeImages={canSeeImages}
          isAgeVerifiedAdult={isAgeVerifiedAdult}
          canAccessAdultDream={canAccessAdultDream}
          onConfirmAdultDream={(dreamId) =>
            setAdultConfirmations((current) => ({ ...current, [dreamId]: true }))
          }
          onOpenRecord={onOpenRecord}
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

  return {
    dream_id: row.dream_id || row.id,
    id: row.id || row.dream_id,
    ownerId: row.ownerId || row.creatorId || "",
    creatorId: row.creatorId || row.ownerId || "",
    anonymousLocked: Boolean(row.anonymousLocked),
    recordIdentityMode:
      row.recordIdentityMode === "account" || row.attributionMode === "account"
        ? "account"
        : "anonymous",
    creatorDisplayName: row.creatorDisplayName || "",
    creatorAvatarUrl: row.creatorAvatarUrl || "",
    originalLanguage,
    originalTitle,
    originalText,
    originalExcerpt:
      row.originalExcerpt ||
      row.original_excerpt ||
      getLanguageSpecificValue(row, "excerpt", originalLanguage) ||
      createExcerpt(originalText),
    translations: row.translations || {},
    title: row.title || "",
    title_zh: row.title_zh || row.titleZh,
    title_es: row.title_es || row.titleEs,
    excerpt,
    excerpt_zh: row.excerpt_zh || row.excerptZh,
    excerpt_es: row.excerpt_es || row.excerptEs,
    dream_text: row.dream_text || row.dreamText || row.text || row.originalText,
    dream_text_zh: row.dream_text_zh || row.dreamTextZh,
    dream_text_es: row.dream_text_es || row.dreamTextEs,
    dream_date: row.dream_date || row.dreamDate || row.date || "",
    dreamDate: row.dreamDate || row.dream_date || row.date || "",
    adultContent,
    minimumViewerAge: row.minimumViewerAge || row.minimum_viewer_age || (adultContent ? 18 : 0),
    images,
    dreamImages: images,
    imageUrls,
    pictureUrls: imageUrls,
    thumbnailUrl,
    thumbnail_url: thumbnailUrl,
    generated_image_url: thumbnailUrl,
    pseudo_id: row.pseudo_id || row.pseudoId || "",
    pseudoId: row.pseudoId || row.pseudo_id || "",
    signal_coherence: row.signal_coherence || 50,
    tags,
    anomaly_tag_slugs: row.anomaly_tag_slugs || tags.filter((tag) => tag.category === "Anomalies").map((tag) => tag.slug),
  };
}

function ensureAdultTag(tags) {
  if (tags.some((tag) => tag.slug === "adult-content")) return tags;

  const adultTag = FALLBACK_TAGS.find((tag) => tag.slug === "adult-content");
  return adultTag ? [...tags, adultTag] : tags;
}

function isAdultDream(dream) {
  return (
    Boolean(dream.adultContent || dream.adult_content || dream.isAdult || dream.is_adult) ||
    Number(dream.minimumViewerAge || dream.minimum_viewer_age || 0) >= 18 ||
    dream.tags?.some((tag) => tag.slug === "adult-content" || tag.slug === "adult_content")
  );
}

function getDreamTranslation(dream, language) {
  const translation = DREAM_TRANSLATIONS[dream.dream_id] || {};

  if (language === "es") return translation.es || {};
  if (language === "zh") return translation;

  return {};
}

function getStoredTranslation(dream, language) {
  const normalizedLanguage = normalizeLanguage(language);
  const translations = dream.translations || {};

  return translations[normalizedLanguage] || {};
}

function getDreamTitle(dream, language) {
  const normalizedLanguage = normalizeLanguage(language);

  if (normalizeLanguage(dream.originalLanguage) === normalizedLanguage) {
    return (
      dream.originalTitle ||
      getLanguageSpecificValue(dream, "title", normalizedLanguage) ||
      dream.title ||
      ""
    );
  }

  return (
    getStoredTranslation(dream, normalizedLanguage).title ||
    getDreamTranslation(dream, normalizedLanguage).title ||
    getLanguageSpecificValue(dream, "title", normalizedLanguage) ||
    dream.originalTitle ||
    dream.title ||
    ""
  );
}

function getDreamExcerpt(dream, language) {
  const normalizedLanguage = normalizeLanguage(language);

  if (normalizeLanguage(dream.originalLanguage) === normalizedLanguage) {
    return (
      dream.originalExcerpt ||
      createExcerpt(dream.originalText) ||
      getLanguageSpecificValue(dream, "excerpt", normalizedLanguage) ||
      dream.excerpt
    );
  }

  return (
    getStoredTranslation(dream, normalizedLanguage).excerpt ||
    getDreamTranslation(dream, normalizedLanguage).excerpt ||
    getLanguageSpecificValue(dream, "excerpt", normalizedLanguage) ||
    createExcerpt(getDreamText(dream, normalizedLanguage)) ||
    dream.excerpt
  );
}

function getDreamText(dream, language) {
  const normalizedLanguage = normalizeLanguage(language);

  if (normalizeLanguage(dream.originalLanguage) === normalizedLanguage) {
    return (
      dream.originalText ||
      getLanguageSpecificValue(dream, "dream_text", normalizedLanguage) ||
      dream.dream_text
    );
  }

  return (
    getStoredTranslation(dream, normalizedLanguage).text ||
    getStoredTranslation(dream, normalizedLanguage).dream_text ||
    getDreamTranslation(dream, normalizedLanguage).dream_text ||
    getLanguageSpecificValue(dream, "dream_text", normalizedLanguage) ||
    dream.originalText ||
    dream.dream_text
  );
}

function getLanguageSpecificValue(record, field, language) {
  const normalizedLanguage = normalizeLanguage(language);
  const fieldMap = {
    title: {
      en: ["title", "title_en", "titleEn"],
      zh: ["title_zh", "titleZh"],
      es: ["title_es", "titleEs"],
    },
    excerpt: {
      en: ["excerpt", "excerpt_en", "excerptEn"],
      zh: ["excerpt_zh", "excerptZh"],
      es: ["excerpt_es", "excerptEs"],
    },
    dream_text: {
      en: ["dream_text", "dreamText", "text", "text_en", "textEn"],
      zh: ["dream_text_zh", "dreamTextZh", "textZh", "text_zh"],
      es: ["dream_text_es", "dreamTextEs", "textEs", "text_es"],
    },
  };

  const keys = fieldMap[field]?.[normalizedLanguage] || [];
  return keys.map((key) => record?.[key]).find(Boolean) || "";
}

function createExcerpt(value) {
  if (!value) return "";
  return value.length > 220 ? `${value.slice(0, 220)}...` : value;
}

function buildDreamTranslations(dream) {
  return Object.fromEntries(
    LANGUAGE_OPTIONS.map((option) => [
      option.value,
      {
        title: getDreamTitle(dream, option.value),
        excerpt: getDreamExcerpt(dream, option.value),
        text: getDreamText(dream, option.value),
      },
    ])
  );
}

function getTagName(tag, language) {
  if (language === "zh") {
    return TAG_TRANSLATIONS[tag.slug]?.zh || tag.name_zh || tag.nameZh || tag.name;
  }

  if (language === "es") {
    return TAG_TRANSLATIONS[tag.slug]?.es || tag.name_es || tag.nameEs || tag.name;
  }

  return tag.name;
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
  onOpenAuth,
  onOpenRecorder,
}) {
  return (
    <nav className="sticky top-0 z-40 border-b border-cyan-300/10 bg-black/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <a href="#" className="group flex items-center gap-3" aria-label={copy.homeLabel}>
            <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-cyan-300/30 bg-cyan-300/10 shadow-[0_0_24px_rgba(34,211,238,.16)]">
              <span className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,.35),transparent_55%)]" />
              <span className="relative font-mono text-sm font-bold text-cyan-100">C∴</span>
            </span>

            <span>
              <span className="block font-mono text-xs uppercase tracking-[0.38em] text-cyan-200/80">
                CDDB
              </span>
              <span className="block text-sm font-semibold text-zinc-100">
                {copy.terminalName}
              </span>
            </span>
          </a>

          <div className="flex gap-2 lg:hidden">
            <NavButton active>{copy.mobileDatabase}</NavButton>
            <NavButton onClick={onOpenRecorder || onOpenAuth}>
              {copy.mobileSubmit}
            </NavButton>
          </div>
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <NavButton active>{copy.globalDatabase}</NavButton>
          <NavButton onClick={onOpenRecorder || onOpenAuth}>
            {copy.submitObservation}
          </NavButton>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:w-[34rem]">
          <label className="relative block flex-1">
            <span className="sr-only">{copy.searchLabel}</span>
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-200/60" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={copy.searchPlaceholder}
              className="w-full rounded-2xl border border-cyan-300/15 bg-zinc-950/80 py-3 pl-10 pr-4 font-mono text-sm text-cyan-50 outline-none transition placeholder:text-zinc-500 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20"
            />
          </label>

          <LanguageToggle language={language} setLanguage={setLanguage} copy={copy} />
        </div>
      </div>
    </nav>
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

function HeroPanel({ total, visible, loadState, loadError, activeAnomalyCount, copy }) {
  const loadCopy = copy.loadStates[loadState];

  return (
    <header className="mb-6 overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/70 shadow-terminal backdrop-blur">
      <div className="grid gap-0 lg:grid-cols-[1.45fr_.55fr]">
        <div className="relative p-6 sm:p-8 lg:p-10">
          <div className="absolute right-8 top-8 hidden h-28 w-28 rounded-full border border-cyan-300/20 bg-cyan-300/5 blur-sm lg:block" />

          <p className="mb-4 font-mono text-xs uppercase tracking-[0.42em] text-cyan-200/70">
            {copy.heroKicker}
          </p>

          <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-zinc-50 sm:text-5xl lg:text-6xl">
            {copy.heroTitle}
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-300 sm:text-base">
            {copy.heroText}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <StatusPill label={copy.accessLabel} value={copy.accessValue} />
            <StatusPill label={copy.datasetLabel} value={loadCopy} pulse={loadState === "live" || loadState === "loading"} />
            <StatusPill label={copy.visibleLabel} value={`${visible}/${total}`} />
            <StatusPill label={copy.anomalyFiltersLabel} value={String(activeAnomalyCount)} />
          </div>

          {loadError && (
            <p className="mt-5 max-w-3xl rounded-2xl border border-amber-300/20 bg-amber-300/5 p-4 font-mono text-xs leading-6 text-amber-100/80">
              {copy.loadError} {loadError}
            </p>
          )}
        </div>

        <aside className="border-t border-white/10 bg-black/30 p-6 sm:p-8 lg:border-l lg:border-t-0">
          <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/5 p-5">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-cyan-200/70">
              {copy.schemaFocus}
            </p>

            <div className="mt-5 space-y-5">
              <SignalRow label={copy.anomalySearch} value={94} />
              <SignalRow label={copy.ontologyConsistency} value={88} />
              <SignalRow label={copy.identityExposure} value={9} inverse />
            </div>

            <div className="mt-6 rounded-xl border border-white/10 bg-black/30 p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                {copy.databaseNote}
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-300">
                {copy.databaseNoteText}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </header>
  );
}

function ResearchPanel({ stats, copy }) {
  return (
    <section className="mb-6 rounded-3xl border border-white/10 bg-zinc-950/60 p-4 shadow-[0_12px_50px_rgba(0,0,0,.30)] backdrop-blur sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.32em] text-cyan-200/70">
            {copy.researchTitle}
          </p>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
            {copy.researchText}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
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
    </section>
  );
}

function ResearchMetric({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </p>
      <p className="mt-2 truncate font-mono text-sm font-semibold text-cyan-100">
        {value}
      </p>
    </div>
  );
}

function FilterPanel({
  tags,
  selectedTagSlugs,
  toggleTag,
  clearTags,
  matchMode,
  setMatchMode,
  categoryFilter,
  setCategoryFilter,
  sortMode,
  setSortMode,
  language,
  copy,
}) {
  return (
    <section className="mb-6 rounded-3xl border border-white/10 bg-zinc-950/60 p-4 shadow-[0_12px_50px_rgba(0,0,0,.30)] backdrop-blur sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.32em] text-fuchsia-200/70">
            {copy.filterTitle}
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            {copy.filterText}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <SegmentButton active={matchMode === "all"} onClick={() => setMatchMode("all")}>
            {copy.matchAll}
          </SegmentButton>
          <SegmentButton active={matchMode === "any"} onClick={() => setMatchMode("any")}>
            {copy.matchAny}
          </SegmentButton>

          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="rounded-full border border-white/10 bg-black/40 px-4 py-2 font-mono text-xs uppercase tracking-[0.18em] text-zinc-200 outline-none transition focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-300/20"
            aria-label={copy.categorySelectLabel}
          >
            {CATEGORY_FILTERS.map((category) => (
              <option key={category} value={category}>
                {getCategoryLabel(category, language)}
              </option>
            ))}
          </select>

          <select
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value)}
            className="rounded-full border border-white/10 bg-black/40 px-4 py-2 font-mono text-xs uppercase tracking-[0.18em] text-zinc-200 outline-none transition focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-300/20"
            aria-label={copy.sortSelectLabel}
          >
            <option value="coherence">{copy.sortCoherence}</option>
            <option value="newest">{copy.sortNewest}</option>
            <option value="title">{copy.sortTitle}</option>
          </select>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {tags.map((tag) => {
          const active = selectedTagSlugs.includes(tag.slug);
          const tagName = getTagName(tag, language);

          return (
            <button
              key={tag.id || tag.slug}
              type="button"
              aria-pressed={active}
              onClick={() => toggleTag(tag.slug)}
              className={[
                "rounded-full border px-3 py-2 font-mono text-xs uppercase tracking-[0.18em] transition",
                active
                  ? CATEGORY_STYLES[tag.category]
                  : "border-white/10 bg-white/[0.03] text-zinc-400 hover:border-cyan-300/35 hover:text-cyan-100",
              ].join(" ")}
              title={`${getCategoryLabel(tag.category, language)}: ${tagName}`}
            >
              <span className={`mr-2 inline-block h-1.5 w-1.5 rounded-full ${CATEGORY_DOT_STYLES[tag.category]}`} />
              #{tagName}
            </button>
          );
        })}

        {selectedTagSlugs.length > 0 && (
          <button
            type="button"
            onClick={clearTags}
            className="rounded-full border border-red-300/20 bg-red-400/5 px-3 py-2 font-mono text-xs uppercase tracking-[0.18em] text-red-200/80 transition hover:border-red-300/40 hover:bg-red-400/10"
          >
            {copy.clearFilters}
          </button>
        )}
      </div>
    </section>
  );
}

function ObservationGrid({
  dreams,
  language,
  copy,
  currentUser,
  canSeeImages,
  isAgeVerifiedAdult,
  canAccessAdultDream,
  onConfirmAdultDream,
  onOpenRecord,
}) {
  if (dreams.length === 0) {
    return (
      <section className="rounded-3xl border border-dashed border-cyan-300/20 bg-cyan-300/5 p-10 text-center">
        <p className="font-mono text-sm uppercase tracking-[0.25em] text-cyan-100">
          {copy.noMatchesTitle}
        </p>
        <p className="mt-3 text-sm text-zinc-400">
          {copy.noMatchesText}
        </p>
      </section>
    );
  }

  return (
    <section className="columns-1 gap-5 sm:columns-2 xl:columns-3 2xl:columns-4">
      {dreams.map((dream) => (
        <ObservationCard
          key={dream.dream_id}
          dream={dream}
          language={language}
          copy={copy}
          currentUser={currentUser}
          canSeeImages={canSeeImages}
          isAgeVerifiedAdult={isAgeVerifiedAdult}
          canAccessAdultDream={canAccessAdultDream}
          onConfirmAdultDream={onConfirmAdultDream}
          onOpenRecord={onOpenRecord}
        />
      ))}
    </section>
  );
}

function ObservationCard({
  dream,
  language,
  copy,
  currentUser,
  canSeeImages,
  isAgeVerifiedAdult,
  canAccessAdultDream,
  onConfirmAdultDream,
  onOpenRecord,
}) {
  const [collectStatus, setCollectStatus] = useState("");
  const adultDream = isAdultDream(dream);
  const adultAccessible = canAccessAdultDream(dream);
  const guestAdultGate = adultDream && !adultAccessible && !isAgeVerifiedAdult;

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
      originalTitle: dream.originalTitle || getDreamTitle(dream, normalizeLanguage(dream.originalLanguage)),
      originalText: dream.originalText || getDreamText(dream, normalizeLanguage(dream.originalLanguage)),
      translations: buildDreamTranslations(dream),
      recordIdentityMode: dream.recordIdentityMode || "anonymous",
      adultContent: adultDream,
      minimumViewerAge: adultDream ? 18 : 0,
      titleZh: getDreamTitle(dream, "zh"),
      titleEs: getDreamTitle(dream, "es"),
      textZh: getDreamText(dream, "zh"),
      textEs: getDreamText(dream, "es"),
      date: dream.dream_date,
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

  return (
    <article
      onClick={() => {
        if (guestAdultGate) return;

        onOpenRecord?.({
          ...dream,
          id: dream.dream_id,
          originalLanguage: normalizeLanguage(dream.originalLanguage),
          originalTitle: dream.originalTitle || getDreamTitle(dream, normalizeLanguage(dream.originalLanguage)),
          originalText: dream.originalText || getDreamText(dream, normalizeLanguage(dream.originalLanguage)),
          translations: buildDreamTranslations(dream),
          recordIdentityMode: dream.recordIdentityMode || "anonymous",
          adultContent: adultDream,
          minimumViewerAge: adultDream ? 18 : 0,
          titleZh: getDreamTitle(dream, "zh"),
          titleEs: getDreamTitle(dream, "es"),
          textZh: getDreamText(dream, "zh"),
          textEs: getDreamText(dream, "es"),
          date: dream.dream_date,
          pseudoId: dream.pseudo_id,
        });
      }}
      className="group mb-5 inline-block w-full cursor-pointer break-inside-avoid overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/80 shadow-[0_0_0_1px_rgba(34,211,238,.04),0_18px_60px_rgba(0,0,0,.35)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-cyan-300/35 hover:shadow-[0_0_46px_rgba(34,211,238,.12)]"
    >
      {guestAdultGate ? (
        <AdultGatePanel
          copy={copy}
          currentUser={currentUser}
          onConfirm={() => onConfirmAdultDream(dream.dream_id)}
        />
      ) : (
        <ObservationThumbnail
          dream={dream}
          language={language}
          copy={copy}
          canSeeImages={canSeeImages}
        />
      )}

      <div className="p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-cyan-200/70">
            {dream.pseudo_id}
          </span>
          <span className="rounded-full border border-fuchsia-300/20 bg-fuchsia-300/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-fuchsia-100">
            {dream.dream_date}
          </span>
        </div>

        <h2 className="text-xl font-semibold tracking-[-0.03em] text-zinc-50">
          {guestAdultGate ? copy.adultRestrictedTitle : getDreamTitle(dream, language)}
        </h2>
        <p className="mt-2 inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-cyan-100">
          {copy.originalLanguageLabel}: {getLanguageName(dream.originalLanguage, language)}
        </p>
        {adultDream && (
          <p className="ml-0 mt-2 inline-flex rounded-full border border-amber-300/25 bg-amber-300/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-amber-100 sm:ml-2">
            {copy.adultContentLabel} 18+
          </p>
        )}

        <p className="mt-3 text-sm leading-7 text-zinc-300">
          {guestAdultGate ? copy.adultGuestPrompt : getDreamExcerpt(dream, language)}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {dream.tags.map((tag) => (
            <TagBadge key={`${dream.dream_id}-${tag.slug}`} tag={tag} language={language} />
          ))}
        </div>

        <div className="mt-5 border-t border-white/10 pt-4">
          <div className="mb-2 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.18em]">
            <span className="text-zinc-500">{copy.signalCoherence}</span>
            <span className="text-cyan-100">{dream.signal_coherence}%</span>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-sky-300 to-fuchsia-400"
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
  const anomalyIntensity = Math.max(0.12, Math.min(0.52, dream.signal_coherence / 210));
  const background = {
    background: `
      radial-gradient(circle at 18% 20%, rgba(34,211,238,${anomalyIntensity}), transparent 28%),
      radial-gradient(circle at 88% 72%, rgba(217,70,239,${anomalyIntensity * 0.85}), transparent 34%),
      linear-gradient(135deg, #05060a 0%, #101827 52%, #030407 100%)
    `,
  };

  return (
    <div className="relative h-48 overflow-hidden border-b border-white/10 bg-black">
      {canSeeImages && dream.generated_image_url ? (
        <img
          src={dream.generated_image_url}
          alt={`${copy.generatedImageAlt} ${getDreamTitle(dream, language)}`}
          className="h-full w-full object-cover opacity-90"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <div className="absolute inset-0" style={background} />
      )}

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px)] bg-[size:28px_28px] opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,.24),transparent_42%)]" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent" />

      <div className="absolute left-4 top-4 rounded-full border border-cyan-300/20 bg-black/50 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-100 backdrop-blur">
        {canSeeImages ? copy.generatedImage : copy.wordsOnlyForGuest}
      </div>

      {!canSeeImages && (
        <div className="absolute right-4 top-4 max-w-[11rem] rounded-xl border border-amber-300/20 bg-black/50 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-amber-100 backdrop-blur">
          {copy.imageHiddenForGuest}
        </div>
      )}

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

function NavButton({ children, active = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-full px-4 py-2 font-mono text-xs uppercase tracking-[0.18em] transition",
        active
          ? "border border-cyan-300/30 bg-cyan-300/10 text-cyan-50 shadow-[0_0_18px_rgba(34,211,238,.12)]"
          : "border border-white/10 bg-white/[0.03] text-zinc-400 hover:border-fuchsia-300/30 hover:text-fuchsia-100",
      ].join(" ")}
    >
      {children}
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
        "rounded-full border px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.16em]",
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
