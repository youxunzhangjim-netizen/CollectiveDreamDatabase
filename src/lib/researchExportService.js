import { getLanguageName, normalizeLanguage } from "./language.js";
import { getDreamDateStatus, getVisibleDreamDate } from "./dreamDate.js";
import {
  isPublicPrivacySharingMode,
  normalizePrivacySharingMode,
} from "./privacyDefaults.js";
import {
  getCategoryLabel,
  getTagLabel,
  RECORD_TAGS,
  TAG_CATEGORY_ORDER,
} from "./tagTaxonomy.js";
import {
  normalizePublicDreamSketches,
} from "./dreamImageService.js";

export const RESEARCH_EXPORT_VERSION = "research-export-2026-06-27";
export const EXPORT_DETAIL_LEVELS = {
  DREAMS: "dreams",
  CODED: "coded",
  ANALYSIS: "analysis",
};

const EXPORT_COPY = {
  en: {
    methodologyTitle: "Collective Dream Observatory research export notes",
    scopeTitle: "Scope",
    scopeText:
      "Front-end research exports include public/readable records and aggregated pattern summaries visible in the archive. Private dreams and stats-only dreams are not exported with dream text from the browser UI.",
    privacyTitle: "Privacy safeguards",
    privacyItems: [
      "Owner IDs, emails, authentication IDs, and exact account identifiers are not exported.",
      "Age is exported as a range when available.",
      "Hidden dream dates remain blank in record exports.",
      "Small groups in the collective patterns dashboard are suppressed before export.",
    ],
    limitationsTitle: "Limitations",
    limitationsItems: [
      "Dream reports are voluntary submissions and are not population-representative.",
      "Tags suggested by rules or AI are suggestions until confirmed by users, moderators, or researchers.",
      "Dream tags, statistics, and reflections are for exploration and research coding, not diagnosis.",
      "For full private stats-only inclusion, use a server-side aggregation pipeline rather than browser exports.",
    ],
    filtersTitle: "Filters",
    privacyNote:
      "Browser exports remove direct owner/auth identifiers. Private and statistics-only dream text should be exported only by the owner or through a server-side, consent-aware research pipeline.",
    diagnosisWarning:
      "Dream tags, titles, AI suggestions, statistics, and reflections are for self-exploration and research coding, not medical, psychological, or psychiatric diagnosis.",
    statsOnlyMethodology:
      "Stats-only records contribute non-identifying metadata and tags, not original dream text.",
    biasReportText:
      "Public readable dreams and stats-only private dreams may differ in sensitivity and topic distribution.",
  },
  zh: {
    methodologyTitle: "集體夢境觀測站研究匯出說明",
    scopeTitle: "範圍",
    scopeText:
      "前端研究匯出只包含檔案庫中可公開閱讀的紀錄，以及目前可見的整體模式摘要。私人夢境與只加入統計的夢境，不會從瀏覽器 UI 匯出夢境原文。",
    privacyTitle: "隱私保護",
    privacyItems: [
      "不匯出擁有者 ID、電子郵件、認證 ID 或精確帳戶識別碼。",
      "可用年齡會轉成區間匯出。",
      "被使用者隱藏的夢境日期會保持空白。",
      "集體模式中的小群體統計會先被隱藏，再匯出。",
    ],
    limitationsTitle: "限制",
    limitationsItems: [
      "夢境報告來自自願提交者，不代表整體人口。",
      "規則或 AI 建議的標籤，在使用者、管理者或研究者確認前都只是建議。",
      "夢境標籤、統計與反思用於探索與研究編碼，不是診斷。",
      "若要納入私人但只同意統計的夢境，應使用伺服器端聚合流程，而非瀏覽器匯出。",
    ],
    filtersTitle: "篩選條件",
    privacyNote:
      "瀏覽器匯出會移除直接的擁有者／認證識別碼。私人與僅供統計的夢境原文，只應由本人匯出，或透過伺服器端且尊重同意的研究流程提供。",
    diagnosisWarning:
      "夢境標籤、標題、AI 建議、統計與反思僅用於自我探索與研究編碼，不是醫療、心理或精神科診斷。",
    statsOnlyMethodology:
      "僅供統計的紀錄只貢獻非識別中繼資料與標籤，不包含原始夢境文字。",
    biasReportText:
      "可公開閱讀的夢與僅供統計的私人夢，可能在敏感度與主題分布上不同。",
  },
  es: {
    methodologyTitle: "Notas de exportación del Observatorio Colectivo de Sueños",
    scopeTitle: "Alcance",
    scopeText:
      "Las exportaciones de investigación del navegador incluyen registros públicos/legibles y resúmenes agregados visibles en el archivo. Los sueños privados y los sueños solo estadísticos no se exportan con texto desde la interfaz del navegador.",
    privacyTitle: "Salvaguardas de privacidad",
    privacyItems: [
      "No se exportan IDs de propietario, correos, IDs de autenticación ni identificadores exactos de cuenta.",
      "La edad se exporta como rango cuando está disponible.",
      "Las fechas ocultas de sueños permanecen en blanco.",
      "Los grupos pequeños del panel de patrones colectivos se suprimen antes de exportar.",
    ],
    limitationsTitle: "Limitaciones",
    limitationsItems: [
      "Los relatos de sueños son contribuciones voluntarias y no representan a toda la población.",
      "Las etiquetas sugeridas por reglas o IA son sugerencias hasta que las confirme el usuario, moderador o investigador.",
      "Las etiquetas, estadísticas y reflexiones de sueños son para exploración y codificación de investigación, no diagnóstico.",
      "Para incluir sueños privados solo estadísticos, usa una canalización de agregación del lado del servidor, no exportaciones del navegador.",
    ],
    filtersTitle: "Filtros",
    privacyNote:
      "Las exportaciones del navegador eliminan identificadores directos de propietario/autenticación. El texto de sueños privados o solo estadísticos debe exportarse solo por el propietario o mediante una canalización de investigación del servidor con consentimiento.",
    diagnosisWarning:
      "Las etiquetas, títulos, sugerencias de IA, estadísticas y reflexiones de sueños sirven para autoexploración y codificación de investigación; no son diagnósticos médicos, psicológicos ni psiquiátricos.",
    statsOnlyMethodology:
      "Los registros solo estadísticos aportan metadatos y etiquetas no identificables, no el texto original del sueño.",
    biasReportText:
      "Los sueños públicos legibles y los sueños privados solo estadísticos pueden diferir en sensibilidad y distribución temática.",
  },
};

export function exportResearchRecordsCsv(records = [], options = {}) {
  const payload = buildResearchRecordsPayload(records, options);
  return downloadBlob(
    toCsv(payload.records),
    makeFilename("collective-dream-research-records", "csv"),
    "text/csv;charset=utf-8"
  );
}

export function exportResearchRecordsJson(records = [], options = {}) {
  const payload = buildResearchRecordsPayload(records, options);
  return downloadBlob(
    JSON.stringify(payload, null, 2),
    makeFilename("collective-dream-research-records", "json"),
    "application/json;charset=utf-8"
  );
}

export function exportPatternSummaryJson(patternStats = {}, options = {}) {
  const payload = {
    metadata: buildMetadata({
      type: "collective_patterns_summary",
      sampleSize: Number(patternStats?.sampleSize || 0),
      options,
    }),
    filters: sanitizeFilters(options.filters || {}),
    patterns: patternStats || {},
  };

  return downloadBlob(
    JSON.stringify(payload, null, 2),
    makeFilename("collective-dream-pattern-summary", "json"),
    "application/json;charset=utf-8"
  );
}

export function exportTagCodebookCsv(tags = [], options = {}) {
  const language = normalizeLanguage(options.language || "en");
  const rows = buildTagCodebookRows(tags, language);
  return downloadBlob(
    toCsv(rows),
    makeFilename(`collective-dream-codebook-${language}`, "csv"),
    "text/csv;charset=utf-8"
  );
}

export function exportMethodologyMarkdown(options = {}) {
  const language = normalizeLanguage(options.language || "en");
  const copy = EXPORT_COPY[language] || EXPORT_COPY.en;
  const stats = options.stats || {};
  const filters = sanitizeFilters(options.filters || {});
  const lines = [
    `# ${copy.methodologyTitle}`,
    "",
    `Version: ${RESEARCH_EXPORT_VERSION}`,
    `Generated: ${new Date().toISOString()}`,
    `Visible sample size: ${Number(stats.sampleSize || 0)}`,
    `Date range: ${stats.dateRange || "unknown"}`,
    "",
    `## ${copy.scopeTitle}`,
    "",
    copy.scopeText,
    "",
    copy.statsOnlyMethodology,
    "",
    copy.biasReportText,
    "",
    `## ${copy.privacyTitle}`,
    "",
    ...copy.privacyItems.map((item) => `- ${item}`),
    "",
    `## ${copy.limitationsTitle}`,
    "",
    ...copy.limitationsItems.map((item) => `- ${item}`),
    "",
    `## ${copy.filtersTitle}`,
    "",
    "```json",
    JSON.stringify(filters, null, 2),
    "```",
  ];

  return downloadBlob(
    lines.join("\n"),
    makeFilename(`collective-dream-methodology-${language}`, "md"),
    "text/markdown;charset=utf-8"
  );
}

export function exportPersonalDreamsCsv(records = [], options = {}) {
  const payload = buildPersonalRecordsPayload(records, options);
  return downloadBlob(
    toCsv(payload.records),
    makeFilename("my-dream-map-private-export", "csv"),
    "text/csv;charset=utf-8"
  );
}

export function exportPersonalDreamsJson(records = [], options = {}) {
  const payload = buildPersonalRecordsPayload(records, options);
  return downloadBlob(
    JSON.stringify(payload, null, 2),
    makeFilename("my-dream-map-private-export", "json"),
    "application/json;charset=utf-8"
  );
}

// Backward-compatible helpers for earlier UI code.
export function buildResearchExport(records = [], options = {}) {
  return buildResearchRecordsPayload(records, options);
}

export function downloadResearchExport(records = [], options = {}) {
  return options.format === "json"
    ? exportResearchRecordsJson(records, options)
    : exportResearchRecordsCsv(records, options);
}

export function downloadResearchCodebook(language = "en") {
  return exportMethodologyMarkdown({ language });
}

function buildResearchRecordsPayload(records = [], options = {}) {
  const language = normalizeLanguage(options.language || "en");
  const researchSignals = Array.isArray(options.researchSignals)
    ? options.researchSignals
    : [];
  const publicRows = records
    .filter((record) => record && isResearchReadable(record))
    .map((record, index) => sanitizePublicDreamForResearch(record, index, language));
  const signalRows = researchSignals
    .filter((signal) => signal && isResearchSignalReadable(signal))
    .map((signal, index) =>
      sanitizeResearchSignalForExport(signal, publicRows.length + index, language)
    );
  const exportableRows = [...publicRows, ...signalRows];
  const signalSummary = buildResearchSignalsSummary(researchSignals);

  return {
    metadata: buildMetadata({
      type: "public_research_records",
      sampleSize: exportableRows.length,
      options: { ...options, language, detailLevel: EXPORT_DETAIL_LEVELS.ANALYSIS },
    }),
    filters: sanitizeFilters(options.filters || {}),
    methodology: buildMethodologySummary(language),
    aggregateStatistics: {
      publicDreams: publicRows.length,
      researchSignals: signalRows.length,
      sharingModes: countValues(exportableRows.map((row) => row.sharing_mode)),
      languages: countValues(exportableRows.map((row) => row.language)),
      dreamLengthBuckets: countValues(exportableRows.map((row) => row.dream_length_bucket)),
      sensitivityBuckets: countValues(exportableRows.map((row) => row.sensitivity_bucket)),
      adultContent: countValues(
        exportableRows.map((row) => (row.adult_content ? "adult" : "non_adult"))
      ),
    },
    researchSignalsSummary: signalSummary,
    biasAndCoverageReport: buildBiasAndCoverageReport({
      language,
      publicRows,
      signalRows,
      signalSummary,
    }),
    taxonomyCodebook: buildTagCodebookRows(Object.values(RECORD_TAGS), language),
    records: exportableRows,
  };
}

function buildPersonalRecordsPayload(records = [], options = {}) {
  const language = normalizeLanguage(options.language || "en");
  const detailLevel = normalizeExportDetailLevel(options.detailLevel || options.exportDetail);
  const sanitizedRecords = records
    .filter(Boolean)
    .map((record, index) => sanitizeRecordForPersonalExport(record, index, language, detailLevel));

  return {
    metadata: buildMetadata({
      type: "private_personal_records",
      sampleSize: sanitizedRecords.length,
      options: { ...options, language, detailLevel },
    }),
    records: sanitizedRecords,
  };
}

function buildMetadata({ type, sampleSize, options = {} }) {
  const language = normalizeLanguage(options.language || "en");
  const copy = EXPORT_COPY[language] || EXPORT_COPY.en;
  return {
    exportVersion: RESEARCH_EXPORT_VERSION,
    type,
    exportedAt: new Date().toISOString(),
    sampleSize,
    language,
    detailLevel: normalizeExportDetailLevel(options.detailLevel || options.exportDetail),
    filtersActive: hasActiveFilters(options.filters),
    privacyNote: copy.privacyNote,
    diagnosisWarning: copy.diagnosisWarning,
  };
}

function normalizeExportDetailLevel(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return Object.values(EXPORT_DETAIL_LEVELS).includes(normalized)
    ? normalized
    : EXPORT_DETAIL_LEVELS.ANALYSIS;
}


function isPublicResearchExportable(record) {
  const sharingMode = normalizePrivacySharingMode(record?.sharingMode);

  return Boolean(
    record?.visibility === "public" ||
      record?.isPublic === true ||
      isPublicPrivacySharingMode(sharingMode)
  );
}

function sanitizePublicDreamForResearch(record, index, language) {
  const publicText = getPublicRecordText(record);
  const tags = normalizeTags(record.tags || record.publicTags);
  const tagSlugs = tags.map((tag) => tag.slug).filter(Boolean);
  const publicDate = getPublicDateBucket(record);

  return {
    export_row: index + 1,
    record_id_hash: getRecordHash(record, index),
    source_type: "public_dream",
    sharing_mode: normalizePrivacySharingMode(record.sharingMode || record.sharing_mode),
    language: normalizeLanguage(
      record.publicLanguage || record.originalLanguage || record.original_language || "en"
    ),
    date_bucket: publicDate,
    period: record.publicPeriod || record.period || "",
    dream_length_bucket: getDreamLengthBucket(publicText),
    title_source: record.titleSource || record.title_source || "public_record",
    tag_source: record.tagSource || record.tagsSource || record.tags_source || "public_tags",
    tags: tagSlugs.join(" | "),
    tag_labels: tags.map((tag) => getTagLabel(tag, language)).filter(Boolean).join(" | "),
    adult_content: Boolean(record.adultContent || record.adult_content),
    sensitivity_bucket: getPublicSensitivityBucket(record),
    public_text: publicText,
    public_title: getPublicRecordTitle(record),
    public_sketch_urls: getPublicSketchUrls(record).join(" | "),
    public_consent: record.publicConsent !== false,
    ...buildCategoryColumns(tags, language),
  };
}

function sanitizeResearchSignalForExport(signal, index) {
  const tags = [
    ...(signal.tagSlugs || []),
    ...(signal.selectedTagSlugs || []),
    ...(signal.confirmedTagSlugs || []),
  ];

  return {
    export_row: index + 1,
    record_id_hash: signal.recordIdHash || signal.signalId || "",
    source_type: "research_signal",
    sharing_mode: normalizePrivacySharingMode(signal.sharingMode),
    language: normalizeLanguage(signal.language || "en"),
    date_bucket: signal.monthBucket || signal.yearBucket || "",
    period: signal.period || "",
    dream_length_bucket: signal.dreamLengthBucket || "",
    title_source: signal.titleSource || "",
    tag_source: signal.tagSource || "",
    tags: [...new Set(tags)].filter(Boolean).join(" | "),
    adult_content: Boolean(signal.adultContent),
    sensitivity_bucket: signal.sensitivityLevelBucket || "",
    public_text: "",
    public_title: "",
    public_sketch_urls: "",
    confirmed_by_user: Boolean(signal.confirmedByUser),
    has_unconfirmed_ai_tags: Boolean(signal.hasUnconfirmedAiTags),
    emotion_tags: (signal.emotionTags || []).join(" | "),
    setting_tags: (signal.settingTags || []).join(" | "),
    entity_tags: (signal.entityTags || []).join(" | "),
    dream_type_tags: (signal.dreamTypeTags || []).join(" | "),
    psychological_observation_tags: (signal.psychologicalObservationTags || []).join(" | "),
  };
}

function getPublicSketchUrls(record) {
  if (record?.publicConsent === false) return [];

  return normalizePublicDreamSketches(record)
    .map((sketch) => sketch.thumbnailUrl || sketch.imageUrl)
    .filter(Boolean);
}

function sanitizeRecordForPersonalExport(record, index, language, detailLevel = EXPORT_DETAIL_LEVELS.ANALYSIS) {
  const dreamText = getRecordText(record);
  const tags = normalizeTags(record.tags || record.publicTags);
  const dateStatus = getRecordDateStatus(record);
  const baseRecord = {
    export_row: index + 1,
    private_record_id: record.id || record.dream_id || record.dreamId || `private-${index + 1}`,
    title: getRecordTitle(record),
    dream_text: dreamText,
    dream_date: dateStatus === "hidden" ? "" : getRecordDate(record),
    dream_date_status: dateStatus,
    original_language: normalizeLanguage(record.originalLanguage || record.original_language || "en"),
    original_language_label: getLanguageName(
      normalizeLanguage(record.originalLanguage || record.original_language || "en"),
      language
    ),
    word_count: countWords(dreamText),
    character_count: dreamText.length,
  };

  if (detailLevel === EXPORT_DETAIL_LEVELS.DREAMS) {
    return baseRecord;
  }

  const codedRecord = {
    ...baseRecord,
    visibility: record.visibility || (record.isPublic ? "public" : "private"),
    sharing_mode: record.sharingMode || record.sharing_mode || "private",
    included_in_research_stats: Boolean(record.includedInResearchStats || record.included_in_research_stats),
    adult_content: Boolean(record.adultContent || record.adult_content || Number(record.minimumViewerAge || 0) >= 18),
    age_at_dream: record.ageAtDream || record.age_at_dream || "",
    tag_slugs: tags.map((tag) => tag.slug).filter(Boolean).join(" | "),
    tag_labels: tags.map((tag) => getTagLabel(tag, language)).filter(Boolean).join(" | "),
    ...buildCategoryColumns(tags, language),
  };

  if (detailLevel === EXPORT_DETAIL_LEVELS.CODED) {
    return codedRecord;
  }

  return {
    ...codedRecord,
    title_source: record.titleSource || record.title_source || "unknown",
    title_confidence: clampNumber(record.titleConfidence || record.title_confidence),
    tags_source: record.tagsSource || record.tags_source || "user_or_legacy",
    tags_reviewed_by_user: Boolean(record.tagsReviewedByUser || record.tags_reviewed_by_user),
    suggested_tags_json: JSON.stringify(record.suggestedTags || record.suggested_tags || []),
    import_batch_id: record.importBatchId || record.import_batch_id || "",
    source_file_name: record.sourceFileName || record.source_file_name || "",
    source_order_index: record.sourceOrderIndex ?? record.source_order_index ?? "",
  };
}

function buildTagCodebookRows(tags = [], language) {
  const officialTags = Object.values(RECORD_TAGS).map((tag) => ({
    slug: tag.slug,
    label: getTagLabel(tag, language),
    category: tag.category,
    category_label: getCategoryLabel(tag.category, language),
    source: "official_taxonomy",
    use_in_research: tag.category === "Content" ? "safety_filter" : "yes",
  }));

  const runtimeTags = normalizeTags(tags)
    .filter((tag) => !officialTags.some((official) => official.slug === tag.slug))
    .map((tag) => ({
      slug: tag.slug,
      label: getTagLabel(tag, language),
      category: tag.category || "Custom",
      category_label: getCategoryLabel(tag.category || "Custom", language),
      source: tag.source || "runtime_or_custom",
      use_in_research: tag.category === "Custom" ? "needs_review" : "yes",
    }));

  return [...officialTags, ...runtimeTags].sort((a, b) => {
    const categoryDelta = TAG_CATEGORY_ORDER.indexOf(a.category) - TAG_CATEGORY_ORDER.indexOf(b.category);
    if (categoryDelta !== 0) return categoryDelta;
    return a.label.localeCompare(b.label);
  });
}

function buildCategoryColumns(tags, language) {
  return TAG_CATEGORY_ORDER.reduce((columns, category) => {
    const key = `${toSnakeCase(category)}_tags`;
    columns[key] = tags
      .filter((tag) => tag.category === category)
      .map((tag) => getTagLabel(tag, language))
      .filter(Boolean)
      .join(" | ");
    return columns;
  }, {});
}

function normalizeTags(tags = []) {
  if (!Array.isArray(tags)) return [];
  return tags
    .map((tag) => {
      if (!tag) return null;
      if (typeof tag === "string") {
        const official = RECORD_TAGS[tag];
        return official || { slug: tag, labelEn: tag, category: "Custom" };
      }
      const official = RECORD_TAGS[tag.slug];
      return {
        ...official,
        ...tag,
        slug: tag.slug || official?.slug || tag.id || "",
        category: tag.category || official?.category || "Custom",
      };
    })
    .filter((tag) => tag?.slug);
}

function buildResearchSignalsSummary(signals = []) {
  const safeSignals = signals.filter(Boolean);

  return {
    sampleSize: safeSignals.length,
    signalVersions: countValues(safeSignals.map((signal) => signal.signalVersion)),
    languages: countValues(safeSignals.map((signal) => signal.language)),
    monthBuckets: countValues(safeSignals.map((signal) => signal.monthBucket)),
    yearBuckets: countValues(safeSignals.map((signal) => signal.yearBucket)),
    periods: countValues(safeSignals.map((signal) => signal.period)),
    dreamLengthBuckets: countValues(safeSignals.map((signal) => signal.dreamLengthBucket)),
    sensitivityBuckets: countValues(safeSignals.map((signal) => signal.sensitivityLevelBucket)),
    sharingModes: countValues(safeSignals.map((signal) => signal.sharingMode)),
    importSourceTypes: countValues(safeSignals.map((signal) => signal.importSourceType)),
    titleSources: countValues(safeSignals.map((signal) => signal.titleSource)),
    tagSources: countValues(safeSignals.map((signal) => signal.tagSource)),
    unconfirmedAiTags: countValues(
      safeSignals.map((signal) => (signal.hasUnconfirmedAiTags ? "present" : "none"))
    ),
    adultContent: countValues(
      safeSignals.map((signal) => (signal.adultContent ? "adult" : "non_adult"))
    ),
    tagSlugs: countValues(safeSignals.flatMap((signal) => signal.tagSlugs || [])),
    selectedTagSlugs: countValues(safeSignals.flatMap((signal) => signal.selectedTagSlugs || [])),
    confirmedTagSlugs: countValues(safeSignals.flatMap((signal) => signal.confirmedTagSlugs || [])),
    aiSuggestedTagSlugs: countValues(safeSignals.flatMap((signal) => signal.aiSuggestedTagSlugs || [])),
    emotionTags: countValues(safeSignals.flatMap((signal) => signal.emotionTags || [])),
    settingTags: countValues(safeSignals.flatMap((signal) => signal.settingTags || [])),
    entityTags: countValues(safeSignals.flatMap((signal) => signal.entityTags || [])),
    dreamTypeTags: countValues(safeSignals.flatMap((signal) => signal.dreamTypeTags || [])),
    psychologicalObservationTags: countValues(
      safeSignals.flatMap((signal) => signal.psychologicalObservationTags || [])
    ),
  };
}

function buildMethodologySummary(language) {
  const copy = EXPORT_COPY[language] || EXPORT_COPY.en;

  return {
    notes: [
      copy.scopeText,
      copy.statsOnlyMethodology,
      copy.privacyNote,
      copy.diagnosisWarning,
    ],
    allowedSources: [
      "PublicDreams with public consent",
      "ResearchSignals without dream text",
      "Aggregate statistics",
      "Taxonomy/codebook",
      "Bias and coverage report",
    ],
    prohibitedFields: [
      "private dream text",
      "private title",
      "exact ownerId",
      "email",
      "private account metadata",
      "raw diary import files",
      "unredacted sensitive notes",
      "exact timestamp without explicit consent",
    ],
  };
}

function buildBiasAndCoverageReport({ language, publicRows = [], signalRows = [], signalSummary = {} }) {
  const copy = EXPORT_COPY[language] || EXPORT_COPY.en;
  const statsOnlyRows = signalRows.filter((row) => row.sharing_mode === "stats_only");

  return {
    statement: copy.biasReportText,
    publicReadableDreams: publicRows.length,
    statsOnlySignals: statsOnlyRows.length,
    totalSignalRows: signalRows.length,
    adultPublicDreams: publicRows.filter((row) => row.adult_content).length,
    adultSignalRows: signalRows.filter((row) => row.adult_content).length,
    sensitivityBuckets: {
      publicDreams: countValues(publicRows.map((row) => row.sensitivity_bucket)),
      researchSignals: signalSummary.sensitivityBuckets || {},
    },
    caution:
      "Do not overclaim universal conclusions from voluntary public and stats-only submissions.",
  };
}

function countValues(values = []) {
  return values
    .filter((value) => value !== "" && value != null)
    .reduce((counts, value) => {
      const key = String(value);
      counts[key] = (counts[key] || 0) + 1;
      return counts;
    }, {});
}

function isResearchReadable(record) {
  return isPublicResearchExportable(record) && record?.publicConsent !== false;
}

function isResearchSignalReadable(signal) {
  const sharingMode = normalizePrivacySharingMode(signal?.sharingMode);
  return sharingMode === "stats_only" || isPublicPrivacySharingMode(sharingMode);
}

function getPublicRecordText(record = {}) {
  return String(record.publicText || record.public_text || "");
}

function getPublicRecordTitle(record = {}) {
  return String(record.publicTitle || record.public_title || "");
}

function getPublicDateBucket(record = {}) {
  return String(
    record.dateBucket ||
      record.date_bucket ||
      record.publicDate ||
      record.public_date ||
      ""
  ).slice(0, 16);
}

function getPublicSensitivityBucket(record = {}) {
  if (record.sensitivityLevelBucket || record.sensitivity_bucket) {
    return record.sensitivityLevelBucket || record.sensitivity_bucket;
  }

  const warnings = Array.isArray(record.contentWarnings) ? record.contentWarnings : [];
  if (warnings.includes("high-sensitivity")) return "high";
  if (warnings.length > 0) return "medium";
  return "not_exported";
}

function getDreamLengthBucket(text = "") {
  const wordCount = countWords(text);
  if (wordCount === 0) return "empty";
  if (wordCount < 80) return "short";
  if (wordCount < 260) return "medium";
  if (wordCount < 800) return "long";
  return "very_long";
}

function getRecordHash(record = {}, index = 0) {
  return stableHashString(record.id || record.dream_id || record.recordIdHash || `public-${index + 1}`);
}

function getRecordTitle(record) {
  const originalLanguage = normalizeLanguage(record.originalLanguage || record.original_language || "en");
  return (
    record.originalTitle ||
    record.original_title ||
    record.publicTitle ||
    getLocalizedValue(record, "title", originalLanguage) ||
    record.title ||
    record.titleEn ||
    record.title_en ||
    getUntitledRecordLabel(originalLanguage)
  );
}

function getUntitledRecordLabel(language) {
  if (language === "zh") return "未命名夢境";
  if (language === "es") return "Sueño sin título";
  return "Untitled Dream";
}

function getRecordText(record) {
  const originalLanguage = normalizeLanguage(record.originalLanguage || record.original_language || "en");
  return String(
    record.originalText ||
      record.original_text ||
      record.publicText ||
      getLocalizedValue(record, "text", originalLanguage) ||
      record.dreamText ||
      record.dream_text ||
      record.text ||
      ""
  );
}

function getLocalizedValue(record, field, language) {
  const keys = {
    title: {
      en: ["titleEn", "title_en", "title"],
      zh: ["titleZh", "title_zh"],
      es: ["titleEs", "title_es"],
    },
    text: {
      en: ["textEn", "text_en", "dream_text_en", "dreamText", "dream_text", "text"],
      zh: ["textZh", "text_zh", "dream_text_zh"],
      es: ["textEs", "text_es", "dream_text_es"],
    },
  };

  return (keys[field]?.[language] || []).map((key) => record?.[key]).find(Boolean) || "";
}

function getRecordDateStatus(record) {
  const raw = record.dreamDateStatus || record.dream_date_status;
  if (raw) return raw;
  return getDreamDateStatus(record.dreamDate || record.dream_date);
}

function getRecordDate(record) {
  const visible = getVisibleDreamDate(record.dreamDate || record.dream_date, getRecordDateStatus(record));
  return visible ? String(visible).slice(0, 10) : "";
}

function createResearchRecordId(record, index) {
  const seed = String(record.pseudoId || record.pseudo_id || record.id || record.dream_id || index + 1)
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 12)
    .toUpperCase()
    .padEnd(8, "0");
  return `CDO-${seed}`;
}

function stableHashString(value = "") {
  const input = String(value || "");
  let hash = 2166136261;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return `h${(hash >>> 0).toString(36)}`;
}

function getAgeGroup(value) {
  const age = Number(value);
  if (!Number.isFinite(age) || age <= 0) return "";
  if (age < 13) return "0-12";
  if (age < 18) return "13-17";
  if (age < 25) return "18-24";
  if (age < 35) return "25-34";
  if (age < 45) return "35-44";
  if (age < 55) return "45-54";
  if (age < 65) return "55-64";
  return "65+";
}

function countWords(text) {
  const trimmed = String(text || "").trim();
  if (!trimmed) return 0;
  const tokens = trimmed.split(/\s+/u).filter(Boolean);
  if (tokens.length > 1) return tokens.length;
  return [...trimmed].length;
}

function createExcerpt(text, limit = 240) {
  const trimmed = String(text || "").trim();
  return trimmed.length > limit ? `${trimmed.slice(0, limit)}...` : trimmed;
}

function toCsv(rows) {
  const normalizedRows = Array.isArray(rows) ? rows : [];
  if (normalizedRows.length === 0) return "";
  const headers = [...new Set(normalizedRows.flatMap((row) => Object.keys(row || {})))];
  return [headers, ...normalizedRows.map((row) => headers.map((header) => row?.[header] ?? ""))]
    .map((row) => row.map(escapeCsvCell).join(","))
    .join("\n");
}

function escapeCsvCell(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function downloadBlob(content, filename, type) {
  if (typeof window === "undefined" || typeof document === "undefined") return null;
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  return { filename, bytes: blob.size };
}

function makeFilename(base, extension) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `${base}-${timestamp}.${extension}`;
}

function sanitizeFilters(filters = {}) {
  return {
    query: filters.query ? "active" : "",
    selectedTagSlugs: Array.isArray(filters.selectedTagSlugs) ? filters.selectedTagSlugs : [],
    matchMode: filters.matchMode || "",
    sortMode: filters.sortMode || "",
  };
}

function hasActiveFilters(filters = {}) {
  return Boolean(
    filters.query ||
      (Array.isArray(filters.selectedTagSlugs) && filters.selectedTagSlugs.length > 0) ||
      filters.matchMode ||
      filters.sortMode
  );
}

function clampNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.min(1, Math.max(0, number));
}

function toSnakeCase(value) {
  return String(value || "")
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
}
