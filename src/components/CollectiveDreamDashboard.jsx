import { useEffect, useMemo, useState } from "react";
import {
  DREAM_TRANSLATIONS,
  FALLBACK_DREAMS,
  FALLBACK_TAGS,
  TAG_TRANSLATIONS,
} from "../data/fallbackDreams.js";
import { isSupabaseConfigured, supabase } from "../lib/supabaseClient.js";

const CATEGORY_STYLES = {
  Environment:
    "border-cyan-300/20 bg-cyan-300/10 text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,.08)]",
  Entities:
    "border-violet-300/20 bg-violet-300/10 text-violet-100 shadow-[0_0_18px_rgba(167,139,250,.08)]",
  Anomalies:
    "border-fuchsia-300/25 bg-fuchsia-300/10 text-fuchsia-100 shadow-[0_0_18px_rgba(217,70,239,.10)]",
};

const CATEGORY_DOT_STYLES = {
  Environment: "bg-cyan-300",
  Entities: "bg-violet-300",
  Anomalies: "bg-fuchsia-300",
};

const CATEGORY_LABELS = {
  en: {
    All: "All categories",
    Environment: "Environment",
    Entities: "Entities",
    Anomalies: "Anomalies",
  },
  zh: {
    All: "全部類別",
    Environment: "環境",
    Entities: "實體",
    Anomalies: "異常",
  },
};

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
    searchPlaceholder: "Search dreams, pseudo-IDs, anomalies...",
    languageLabel: "Switch interface language",
    englishLabel: "English interface",
    chineseLabel: "Traditional Chinese interface",
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
      loading: "Connecting to Supabase",
      live: "Live Supabase dataset",
      fallback: "Local fallback dataset",
    },
    loadError: "Supabase returned an error, so the UI is showing local fallback data:",
    schemaFocus: "Schema Focus",
    anomalySearch: "Anomaly-tag search",
    ontologyConsistency: "Ontology consistency",
    identityExposure: "Identity exposure",
    databaseNote: "Database note",
    databaseNoteText:
      "The junction table uses a reverse index on tag_id and dream_id, so anomaly queries can locate matching dream rows without scanning the whole observation archive.",
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
    searchPlaceholder: "搜尋夢境、匿名 ID、異常現象...",
    languageLabel: "切換介面語言",
    englishLabel: "英文介面",
    chineseLabel: "繁體中文介面",
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
      loading: "連線至 Supabase",
      live: "即時 Supabase 資料集",
      fallback: "本機備用資料集",
    },
    loadError: "Supabase 回傳錯誤，因此介面改顯示本機備用資料：",
    schemaFocus: "架構焦點",
    anomalySearch: "異常標籤搜尋",
    ontologyConsistency: "本體一致性",
    identityExposure: "身分暴露",
    databaseNote: "資料庫備註",
    databaseNoteText:
      "關聯表在 tag_id 與 dream_id 上使用反向索引，因此異常查詢能快速找到相符的夢境列，而不必掃描整個觀測檔案。",
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
  },
};

const INITIAL_LOAD_STATE = isSupabaseConfigured ? "loading" : "fallback";

export default function CollectiveDreamDashboard() {
  const [language, setLanguage] = useState("en");
  const [dreams, setDreams] = useState(FALLBACK_DREAMS);
  const [tags, setTags] = useState(FALLBACK_TAGS);
  const [query, setQuery] = useState("");
  const [selectedTagSlugs, setSelectedTagSlugs] = useState([]);
  const [matchMode, setMatchMode] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortMode, setSortMode] = useState("coherence");
  const [loadState, setLoadState] = useState(INITIAL_LOAD_STATE);
  const [loadError, setLoadError] = useState(null);
  const copy = UI_COPY[language];

  useEffect(() => {
    document.documentElement.lang = language === "zh" ? "zh-Hant" : "en";
    document.title = copy.documentTitle;
  }, [copy.documentTitle, language]);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    let ignore = false;

    async function loadDatabase() {
      setLoadState("loading");
      setLoadError(null);

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

      if (ignore) return;

      if (dreamResponse.error || tagResponse.error) {
        setLoadState("fallback");
        setLoadError(dreamResponse.error?.message || tagResponse.error?.message);
        return;
      }

      setDreams(dreamResponse.data.map(normalizeDreamCard));
      setTags(tagResponse.data);
      setLoadState("live");
    }

    loadDatabase();

    return () => {
      ignore = true;
    };
  }, []);

  const visibleTags = useMemo(() => {
    if (categoryFilter === "All") return tags;
    return tags.filter((tag) => tag.category === categoryFilter);
  }, [tags, categoryFilter]);

  const filteredDreams = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return dreams
      .filter((dream) => {
        const dreamTagSlugs = dream.tags.map((tag) => tag.slug);
        const dreamTagNames = dream.tags
          .map((tag) => `${tag.name} ${getTagName(tag, language)}`)
          .join(" ");
        const dreamCategories = dream.tags
          .map((tag) => `${tag.category} ${getCategoryLabel(tag.category, language)}`)
          .join(" ");

        const searchableText = [
          dream.title,
          getDreamTitle(dream, language),
          dream.excerpt,
          getDreamExcerpt(dream, language),
          dream.dream_text,
          getDreamText(dream, language),
          dream.pseudo_id,
          dreamTagNames,
          dreamTagSlugs.join(" "),
          dreamCategories,
        ]
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
            language === "zh" ? "zh-Hant" : "en"
          );
        }

        return b.signal_coherence - a.signal_coherence;
      });
  }, [dreams, query, selectedTagSlugs, matchMode, categoryFilter, sortMode, language]);

  const activeAnomalyCount = selectedTagSlugs.filter((slug) => {
    const tag = tags.find((item) => item.slug === slug);
    return tag?.category === "Anomalies";
  }).length;

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

        <ObservationGrid dreams={filteredDreams} language={language} copy={copy} />
      </section>
    </main>
  );
}

function normalizeDreamCard(row) {
  const tags = Array.isArray(row.tags) ? row.tags : [];
  const excerpt =
    row.excerpt ||
    (row.dream_text ? `${row.dream_text.slice(0, 220)}${row.dream_text.length > 220 ? "…" : ""}` : "");

  return {
    dream_id: row.dream_id || row.id,
    title: row.title,
    title_zh: row.title_zh || row.titleZh,
    excerpt,
    excerpt_zh: row.excerpt_zh || row.excerptZh,
    dream_text: row.dream_text,
    dream_text_zh: row.dream_text_zh || row.dreamTextZh,
    dream_date: row.dream_date,
    generated_image_url: row.generated_image_url,
    pseudo_id: row.pseudo_id,
    signal_coherence: row.signal_coherence || 50,
    tags,
    anomaly_tag_slugs: row.anomaly_tag_slugs || tags.filter((tag) => tag.category === "Anomalies").map((tag) => tag.slug),
  };
}

function getDreamTranslation(dream) {
  return DREAM_TRANSLATIONS[dream.dream_id] || {};
}

function getDreamTitle(dream, language) {
  if (language !== "zh") return dream.title;
  return getDreamTranslation(dream).title || dream.title_zh || dream.title;
}

function getDreamExcerpt(dream, language) {
  if (language !== "zh") return dream.excerpt;
  return getDreamTranslation(dream).excerpt || dream.excerpt_zh || dream.excerpt;
}

function getDreamText(dream, language) {
  if (language !== "zh") return dream.dream_text;
  return getDreamTranslation(dream).dream_text || dream.dream_text_zh || dream.dream_text;
}

function getTagName(tag, language) {
  if (language !== "zh") return tag.name;
  return TAG_TRANSLATIONS[tag.slug]?.zh || tag.name_zh || tag.nameZh || tag.name;
}

function getCategoryLabel(category, language) {
  return CATEGORY_LABELS[language]?.[category] || category;
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

function TopNav({ query, setQuery, language, setLanguage, copy }) {
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
            <NavButton>{copy.mobileSubmit}</NavButton>
          </div>
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <NavButton active>{copy.globalDatabase}</NavButton>
          <NavButton>{copy.submitObservation}</NavButton>
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
  const options = [
    { value: "en", label: "En", title: copy.englishLabel },
    { value: "zh", label: "中", title: copy.chineseLabel },
  ];

  return (
    <div
      className="relative flex h-11 shrink-0 items-center overflow-hidden rounded-xl border border-cyan-300/30 bg-cyan-300/10 p-1 shadow-[0_0_24px_rgba(34,211,238,.16)]"
      role="group"
      aria-label={copy.languageLabel}
    >
      <span className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,.35),transparent_55%)]" />

      {options.map((option) => {
        const active = language === option.value;

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            title={option.title}
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
            <option value="All">{CATEGORY_LABELS[language].All}</option>
            <option value="Environment">{CATEGORY_LABELS[language].Environment}</option>
            <option value="Entities">{CATEGORY_LABELS[language].Entities}</option>
            <option value="Anomalies">{CATEGORY_LABELS[language].Anomalies}</option>
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

function ObservationGrid({ dreams, language, copy }) {
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
        <ObservationCard key={dream.dream_id} dream={dream} language={language} copy={copy} />
      ))}
    </section>
  );
}

function ObservationCard({ dream, language, copy }) {
  return (
    <article className="group mb-5 inline-block w-full break-inside-avoid overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/80 shadow-[0_0_0_1px_rgba(34,211,238,.04),0_18px_60px_rgba(0,0,0,.35)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-cyan-300/35 hover:shadow-[0_0_46px_rgba(34,211,238,.12)]">
      <ObservationThumbnail dream={dream} language={language} copy={copy} />

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
          {getDreamTitle(dream, language)}
        </h2>

        <p className="mt-3 text-sm leading-7 text-zinc-300">
          {getDreamExcerpt(dream, language)}
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
        </div>
      </div>
    </article>
  );
}

function ObservationThumbnail({ dream, language, copy }) {
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
      {dream.generated_image_url ? (
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

function NavButton({ children, active = false }) {
  return (
    <a
      href="#"
      className={[
        "rounded-full px-4 py-2 font-mono text-xs uppercase tracking-[0.18em] transition",
        active
          ? "border border-cyan-300/30 bg-cyan-300/10 text-cyan-50 shadow-[0_0_18px_rgba(34,211,238,.12)]"
          : "border border-white/10 bg-white/[0.03] text-zinc-400 hover:border-fuchsia-300/30 hover:text-fuchsia-100",
      ].join(" ")}
    >
      {children}
    </a>
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
