import { getLanguageName, normalizeLanguage } from "./language.js";
import { getDreamDateStatus, getVisibleDreamDate } from "./dreamDate.js";
import {
  getCategoryLabel,
  getTagLabel,
  RECORD_TAGS,
  TAG_CATEGORY_ORDER,
} from "./tagTaxonomy.js";

export const RESEARCH_EXPORT_VERSION = "research-export-2026-06-24";
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
  const detailLevel = normalizeExportDetailLevel(options.detailLevel || options.exportDetail);
  const exportableRecords = records
    .filter((record) => record && isResearchReadable(record))
    .map((record, index) => sanitizeRecordForResearch(record, index, language, detailLevel));

  return {
    metadata: buildMetadata({
      type: "public_research_records",
      sampleSize: exportableRecords.length,
      options: { ...options, language, detailLevel },
    }),
    filters: sanitizeFilters(options.filters || {}),
    records: exportableRecords,
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
  return Boolean(
    record?.visibility === "public" ||
      record?.isPublic === true ||
      record?.sharingMode === "public_anonymous" ||
      record?.sharingMode === "public_pseudonym"
  );
}

function sanitizeRecordForResearch(record, index, language, detailLevel = EXPORT_DETAIL_LEVELS.ANALYSIS) {
  const dreamText = getRecordText(record);
  const tags = normalizeTags(record.tags);
  const tagSlugs = tags.map((tag) => tag.slug).filter(Boolean);
  const tagLabels = tags.map((tag) => getTagLabel(tag, language)).filter(Boolean);
  const dateStatus = getRecordDateStatus(record);
  const dreamDate = dateStatus === "hidden" ? "" : getRecordDate(record);
  const baseRecord = {
    export_row: index + 1,
    research_record_id: createResearchRecordId(record, index),
    title: getRecordTitle(record),
    dream_text: dreamText,
    original_language: normalizeLanguage(record.originalLanguage || record.original_language || "en"),
    original_language_label: getLanguageName(
      normalizeLanguage(record.originalLanguage || record.original_language || "en"),
      language
    ),
    dream_date: dreamDate,
    dream_date_status: dateStatus,
    word_count: countWords(dreamText),
    character_count: dreamText.length,
  };

  if (detailLevel === EXPORT_DETAIL_LEVELS.DREAMS) {
    return baseRecord;
  }

  const codedRecord = {
    ...baseRecord,
    excerpt: createExcerpt(dreamText),
    age_group_at_dream: getAgeGroup(record.ageAtDream || record.age_at_dream),
    adult_content: Boolean(
      record.adultContent ||
        record.adult_content ||
        Number(record.minimumViewerAge || record.minimum_viewer_age || 0) >= 18
    ),
    sharing_mode: record.sharingMode || record.sharing_mode || "public_anonymous",
    included_in_research_stats: Boolean(
      record.includedInResearchStats || record.included_in_research_stats || record.researchConsent || record.isPublic
    ),
    public_consent: Boolean(record.publicConsent || record.public_consent || record.isPublic),
    research_consent: Boolean(record.researchConsent || record.research_consent || record.includedInResearchStats),
    tag_slugs: tagSlugs.join(" | "),
    tag_labels: tagLabels.join(" | "),
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
    source_type: record.importBatchId || record.import_batch_id ? "diary_import" : "single_record",
    source_format: record.sourceFormat || record.source_format || "",
    parser_version: record.importParserVersion || record.parserVersion || record.parser_version || "",
    auto_tagger_version: record.autoTaggerVersion || record.auto_tagger_version || "",
  };
}

function sanitizeRecordForPersonalExport(record, index, language, detailLevel = EXPORT_DETAIL_LEVELS.ANALYSIS) {
  const dreamText = getRecordText(record);
  const tags = normalizeTags(record.tags);
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

function isResearchReadable(record) {
  if (record.visibility === "private") return false;
  if (record.isPublic === false && record.visibility !== "public") return false;
  return true;
}

function getRecordTitle(record) {
  const originalLanguage = normalizeLanguage(record.originalLanguage || record.original_language || "en");
  return (
    record.originalTitle ||
    record.original_title ||
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
