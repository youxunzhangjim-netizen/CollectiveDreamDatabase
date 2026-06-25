import {
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { ref as storageRef, uploadBytes } from "firebase/storage";
import { db, isFirebaseConfigured, isFirebaseStorageConfigured, storage } from "./firebaseClient.js";
import { normalizeLanguage } from "./language.js";
import { createDreamRecord } from "./recordsService.js";
import { getTagLabel, RECORD_TAGS } from "./tagTaxonomy.js";

export const DIARY_FILE_ACCEPT = ".txt,.md,.markdown,.csv,.json,text/plain,text/markdown,text/csv,application/json";
export const MAX_DIARY_FILE_BYTES = 5 * 1024 * 1024;
export const MAX_IMPORT_DRAFTS = 250;
export const IMPORT_PARSER_VERSION = "diary-import-parser-2026-06-24";
export const IMPORT_TAGGER_VERSION = "evidence-rule-tagger-2026-06-24";

export const DIARY_IMPORT_MODES = {
  AUTO: "auto",
  DATE_HEADINGS: "date_headings",
  BLANK_LINES: "blank_lines",
  CSV: "csv",
  JSON: "json",
};

const SUPPORTED_EXTENSIONS = new Set(["txt", "md", "markdown", "csv", "json"]);
const DIRECT_TAG_CATEGORIES = new Set([
  "Environment",
  "Entities",
  "Anomalies",
  "Emotions",
  "Styles",
  "Eras",
  "Weather",
  "Dream Types",
  "Perspective",
  "Content",
]);

const EXTRA_KEYWORDS = {
  home: ["house", "room", "rooms", "my place", "old home", "childhood home", "家", "房子", "房間", "老家", "casa", "hogar", "habitación"],
  school: ["classroom", "campus", "class", "teacher", "學校", "教室", "校園", "escuela", "aula", "clase"],
  ocean: ["sea", "waves", "海", "海邊", "大海", "mar", "olas"],
  city: ["street", "streets", "downtown", "城市", "街道", "ciudad", "calle"],
  forest: ["woods", "trees", "森林", "樹林", "bosque", "árboles"],
  train: ["railway", "火車", "tren"],
  "train-station": ["platform", "station", "車站", "月台", "estación", "andén"],
  family: ["mother", "father", "mom", "dad", "parent", "parents", "sister", "brother", "媽媽", "爸爸", "家人", "madre", "padre", "familia", "hermana", "hermano"],
  friend: ["friends", "friendship", "朋友", "amigo", "amiga", "amistad"],
  stranger: ["unknown person", "someone", "strangers", "陌生人", "alguien", "desconocido", "desconocida"],
  animal: ["creature", "beast", "動物", "生物", "animal", "criatura"],
  monster: ["creature", "beast", "怪物", "monstruo"],
  ghost: ["spirit", "apparition", "鬼", "靈", "fantasma", "espíritu"],
  flying: ["flew", "fly", "flight", "floating in the sky", "飛", "飛行", "volar", "volé", "vuelo"],
  falling: ["fell", "fall", "drop", "dropped", "墜落", "掉下", "caer", "caída", "caí"],
  chase: ["chased", "pursued", "running away", "逃跑", "追逐", "被追", "perseguir", "persecución", "huir"],
  lucid: ["lucid dream", "I knew I was dreaming", "realized I was dreaming", "清醒夢", "知道自己在做夢", "sueño lúcido", "sabía que estaba soñando"],
  recurring: ["again", "same dream", "recurring", "repeated", "重複夢", "又夢到", "recurrente", "se repite"],
  nightmare: ["nightmare", "bad dream", "terrifying", "惡夢", "噩夢", "可怕的夢", "pesadilla"],
  "false-awakening": ["woke up but", "false awakening", "假醒", "falso despertar"],
  "sleep-paralysis": ["could not move", "paralyzed", "sleep paralysis", "不能動", "鬼壓床", "parálisis del sueño"],
  underwater: ["under water", "underwater", "水下", "水裡", "bajo el agua"],
  rain: ["raining", "rainy", "下雨", "雨", "lluvia", "llovía"],
  snow: ["snowing", "下雪", "雪", "nieve", "nevaba"],
  storm: ["stormy", "暴風雨", "tormenta"],
  night: ["night", "dark sky", "晚上", "夜晚", "noche"],
  fear: ["scared", "afraid", "frightened", "terrified", "害怕", "恐懼", "miedo", "asustado", "asustada"],
  anxiety: ["anxious", "worried", "nervous", "焦慮", "緊張", "ansiedad", "ansioso", "ansiosa"],
  joy: ["happy", "happiness", "glad", "開心", "快樂", "喜悅", "feliz", "alegría"],
  sadness: ["sad", "crying", "tears", "難過", "悲傷", "哭", "triste", "llorando"],
  anger: ["angry", "furious", "mad", "生氣", "憤怒", "enojado", "enojada", "ira"],
  confusion: ["confused", "unclear", "strange logic", "困惑", "混亂", "confusión", "confundido", "confundida"],
  love: ["loved", "beloved", "愛", "amor"],
  death: ["dead", "died", "dying", "funeral", "死亡", "死掉", "葬禮", "muerte", "murió", "funeral"],
  exam: ["test", "exam", "考試", "examen"],
  work: ["job", "office", "working", "工作", "上班", "trabajo", "trabajar"],
  driving: ["car", "drive", "driving", "開車", "車子", "conducir", "auto", "coche"],
  "losing-teeth": ["tooth", "teeth", "掉牙", "牙齒", "diente", "dientes"],
  "public-nudity": ["naked", "nude", "裸露", "裸體", "desnudo", "desnuda"],
};

export function validateDiaryFile(file) {
  if (!file) return "missing";
  if (file.size > MAX_DIARY_FILE_BYTES) return "too-large";

  const extension = getFileExtension(file.name);
  if (!SUPPORTED_EXTENSIONS.has(extension)) return "unsupported-format";

  return "";
}

export async function readDiaryFile(file) {
  const validationCode = validateDiaryFile(file);
  if (validationCode) {
    const error = new Error(validationCode);
    error.code = validationCode;
    throw error;
  }

  if (typeof file.text === "function") {
    return file.text();
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("Cannot read file."));
    reader.readAsText(file);
  });
}

export function parseDiaryFileText(rawText, options = {}) {
  const text = normalizeLineEndings(rawText);
  const language = normalizeLanguage(options.language || "en");
  const fileName = options.fileName || "";
  const requestedMode = options.mode || DIARY_IMPORT_MODES.AUTO;
  const inferredFormat = inferImportFormat(fileName, text, requestedMode);

  let drafts = [];

  if (inferredFormat === DIARY_IMPORT_MODES.CSV) {
    drafts = parseCsvDiary(text, language);
  } else if (inferredFormat === DIARY_IMPORT_MODES.JSON) {
    drafts = parseJsonDiary(text, language);
  } else if (inferredFormat === DIARY_IMPORT_MODES.BLANK_LINES) {
    drafts = parseTextByBlankBlocks(text, language);
  } else {
    drafts = parseTextByHeadings(text, language, requestedMode);
  }

  if (drafts.length === 0 && text.trim()) {
    drafts = [makeDraftFromParts({ text: text.trim(), language, boundaryConfidence: 0.45 })];
  }

  return drafts
    .filter((draft) => draft.rawText.trim().length > 0)
    .slice(0, MAX_IMPORT_DRAFTS)
    .map((draft, index) => enhanceDraft(draft, index, language, inferredFormat));
}

export function refreshDraftSuggestions(draft, index = 0, language = "en") {
  return enhanceDraft(
    {
      ...draft,
      title: draft.userEditedTitle ? draft.title : draft.detectedTitle || draft.title || "",
      rawText: draft.rawText || draft.dreamText || "",
    },
    index,
    normalizeLanguage(draft.originalLanguage || language),
    draft.sourceFormat || DIARY_IMPORT_MODES.AUTO
  );
}

export async function createDreamDiaryImport({
  currentUser,
  file = null,
  rawText = "",
  drafts = [],
  profile = null,
  parserMode = DIARY_IMPORT_MODES.AUTO,
  sourceFormat = DIARY_IMPORT_MODES.AUTO,
  fileName = "dream-diary.txt",
}) {
  if (!currentUser?.uid) {
    throw new Error("A signed-in or guest session is required to import dreams.");
  }

  if (!isFirebaseConfigured || !db) {
    throw new Error("Archive storage is not available yet.");
  }

  const selectedDrafts = drafts.filter((draft) => draft?.selected !== false && draft?.rawText?.trim());

  if (selectedDrafts.length === 0) {
    throw new Error("Select at least one dream to import.");
  }

  if (selectedDrafts.length > MAX_IMPORT_DRAFTS) {
    throw new Error(`Import up to ${MAX_IMPORT_DRAFTS} dreams at once.`);
  }

  const firestore = db;
  const batchRef = doc(collection(firestore, "ImportBatches"));
  const safeFileName = sanitizeFileName(file?.name || fileName || "dream-diary.txt");
  const nowIso = new Date().toISOString();
  let storagePath = "";
  let storageUploadError = null;

  if (file && isFirebaseStorageConfigured && storage) {
    storagePath = [
      "users",
      sanitizePathPart(currentUser.uid),
      "dream-imports",
      batchRef.id,
      safeFileName,
    ].join("/");

    try {
      await uploadBytes(storageRef(storage, storagePath), file, {
        contentType: file.type || getContentTypeFromFileName(file.name),
        customMetadata: {
          ownerId: currentUser.uid,
          importBatchId: batchRef.id,
          originalFileName: safeFileName,
        },
      });
    } catch (error) {
      storageUploadError = {
        code: error?.code || "storage/upload-failed",
        message: error?.message || "Original diary file could not be uploaded.",
      };
      storagePath = "";
    }
  } else if (file) {
    storageUploadError = {
      code: "storage/not-configured",
      message: "Firebase Storage is not configured, so only parsed private records were saved.",
    };
  }

  await setDoc(batchRef, {
    id: batchRef.id,
    ownerId: currentUser.uid,
    status: "importing",
    privacyDefault: "private",
    originalFileName: safeFileName,
    originalFileType: file?.type || getContentTypeFromFileName(safeFileName),
    originalFileSize: file?.size || byteLength(rawText),
    originalStoragePath: storagePath,
    storageUploadError,
    parserMode,
    sourceFormat,
    parserVersion: IMPORT_PARSER_VERSION,
    autoTaggerVersion: IMPORT_TAGGER_VERSION,
    dreamCount: drafts.length,
    selectedCount: selectedDrafts.length,
    importedCount: 0,
    failedCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const importedRecords = [];
  const failedDrafts = [];

  for (const [selectedIndex, draft] of selectedDrafts.entries()) {
    const draftRef = doc(collection(firestore, "ImportBatches", batchRef.id, "DraftDreams"));
    const selectedTagSlugs = getSelectedTagSlugs(draft);
    const suggestedTags = normalizeSuggestedTags(draft.suggestedTags || draft.tagSuggestions || []);
    const title = getImportTitle(draft, selectedIndex);

    await setDoc(draftRef, {
      id: draftRef.id,
      ownerId: currentUser.uid,
      importBatchId: batchRef.id,
      orderIndex: Number.isFinite(draft.orderIndex) ? draft.orderIndex : selectedIndex,
      sourceOrderIndex: Number.isFinite(draft.sourceOrderIndex) ? draft.sourceOrderIndex : selectedIndex,
      rawText: String(draft.rawText || "").trim(),
      cleanedText: String(draft.cleanedText || draft.rawText || "").trim(),
      detectedDate: draft.detectedDate || "",
      dreamDateStatus: draft.dreamDateStatus || (draft.detectedDate ? "known" : "unknown"),
      detectedTitle: draft.detectedTitle || "",
      suggestedTitle: draft.suggestedTitle || "",
      title,
      titleSource: draft.titleSource || "import_review",
      titleConfidence: Number(draft.titleConfidence || 0),
      originalLanguage: normalizeLanguage(draft.originalLanguage || "en"),
      selectedTagSlugs,
      suggestedTags,
      tagsSource: draft.tagsSource || "rule_suggestions",
      tagsReviewedByUser: Boolean(draft.tagsReviewedByUser),
      boundaryConfidence: Number(draft.boundaryConfidence || 0),
      boundaryReason: draft.boundaryReason || "",
      sourceLineStart: draft.sourceLineStart || null,
      sourceLineEnd: draft.sourceLineEnd || null,
      status: "importing",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    try {
      const record = await createDreamRecord(
        currentUser,
        {
          dreamText: String(draft.rawText || "").trim(),
          title,
          dreamDate: draft.detectedDate || draft.dreamDate || "",
          dreamDateStatus: draft.dreamDateStatus || (draft.detectedDate ? "known" : "unknown"),
          originalLanguage: normalizeLanguage(draft.originalLanguage || "en"),
          ageAtDream: draft.ageAtDream || "",
          adultContent: Boolean(draft.adultContent),
          selectedTagSlugs,
          customTagLabels: [],
          sharedTags: draft.sharedTags || [],
          recordIdentityMode: "anonymous",
          sharingMode: "private",
          importBatchId: batchRef.id,
          importDraftId: draftRef.id,
          sourceType: "diary_import",
          sourceFileName: safeFileName,
          sourceFormat,
          sourceOrderIndex: Number.isFinite(draft.sourceOrderIndex) ? draft.sourceOrderIndex : selectedIndex,
          sourceLineStart: draft.sourceLineStart || null,
          sourceLineEnd: draft.sourceLineEnd || null,
          titleSource: draft.titleSource || "import_review",
          titleConfidence: Number(draft.titleConfidence || 0),
          tagsSource: draft.tagsSource || "rule_suggestions",
          tagsReviewedByUser: Boolean(draft.tagsReviewedByUser),
          suggestedTags,
          parserVersion: IMPORT_PARSER_VERSION,
          autoTaggerVersion: IMPORT_TAGGER_VERSION,
          importedAt: nowIso,
        },
        profile
      );

      importedRecords.push(record);
      await setDoc(
        draftRef,
        {
          status: "imported",
          importedRecordId: record.id || record.dream_id,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (error) {
      failedDrafts.push({ draft, error: error?.message || "Import failed." });
      await setDoc(
        draftRef,
        {
          status: "failed",
          importError: error?.message || "Import failed.",
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }
  }

  await setDoc(
    batchRef,
    {
      status: failedDrafts.length > 0 ? "completed_with_errors" : "imported",
      importedCount: importedRecords.length,
      failedCount: failedDrafts.length,
      completedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return {
    batchId: batchRef.id,
    importedRecords,
    failedDrafts,
    storageUploadError,
  };
}

function inferImportFormat(fileName, text, requestedMode) {
  if (requestedMode && requestedMode !== DIARY_IMPORT_MODES.AUTO) return requestedMode;

  const extension = getFileExtension(fileName);
  if (extension === "csv") return DIARY_IMPORT_MODES.CSV;
  if (extension === "json") return DIARY_IMPORT_MODES.JSON;

  const trimmed = text.trim();
  if ((trimmed.startsWith("[") || trimmed.startsWith("{")) && looksLikeJson(trimmed)) {
    return DIARY_IMPORT_MODES.JSON;
  }

  if (looksLikeCsv(trimmed)) return DIARY_IMPORT_MODES.CSV;

  return DIARY_IMPORT_MODES.DATE_HEADINGS;
}

function parseJsonDiary(text, language) {
  let parsed = null;
  try {
    parsed = JSON.parse(text);
  } catch {
    return parseTextByHeadings(text, language);
  }

  const entries = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed?.dreams)
      ? parsed.dreams
      : Array.isArray(parsed?.records)
        ? parsed.records
        : Array.isArray(parsed?.entries)
          ? parsed.entries
          : [];

  return entries.map((entry) =>
    makeDraftFromParts({
      text:
        entry?.dreamText ||
        entry?.dream_text ||
        entry?.text ||
        entry?.body ||
        entry?.content ||
        "",
      title: entry?.title || entry?.name || "",
      date: entry?.dreamDate || entry?.dream_date || entry?.date || "",
      language: normalizeLanguage(entry?.originalLanguage || entry?.language || language),
      adultContent: Boolean(entry?.adultContent || entry?.adult_content),
      boundaryConfidence: 0.95,
      boundaryReason: "json_entry",
    })
  );
}

function parseCsvDiary(text, language) {
  const rows = parseCsvRows(text).filter((row) => row.some((cell) => String(cell || "").trim()));
  if (rows.length === 0) return [];

  const headers = rows[0].map((header) => normalizeHeader(header));
  const hasHeader = headers.some((header) => ["text", "dreamtext", "dream_text", "dream", "content"].includes(header));
  const dataRows = hasHeader ? rows.slice(1) : rows;

  function getByHeader(row, names, fallbackIndex = -1) {
    if (hasHeader) {
      const index = headers.findIndex((header) => names.includes(header));
      if (index >= 0) return row[index] || "";
    }

    return fallbackIndex >= 0 ? row[fallbackIndex] || "" : "";
  }

  return dataRows.map((row) => {
    const text = getByHeader(row, ["text", "dreamtext", "dream_text", "dream", "content", "body"], hasHeader ? -1 : row.length - 1);
    const title = getByHeader(row, ["title", "name", "heading"], hasHeader ? -1 : 1);
    const date = getByHeader(row, ["date", "dreamdate", "dream_date", "recordeddate", "recorded_date"], hasHeader ? -1 : 0);
    const entryLanguage = getByHeader(row, ["language", "originallanguage", "original_language"], -1);
    const adult = getByHeader(row, ["adult", "adultcontent", "adult_content", "isadult"], -1);

    return makeDraftFromParts({
      text,
      title,
      date,
      language: normalizeLanguage(entryLanguage || language),
      adultContent: ["true", "1", "yes", "y"].includes(String(adult || "").trim().toLowerCase()),
      boundaryConfidence: 0.9,
      boundaryReason: "csv_row",
    });
  });
}

function parseTextByHeadings(text, language, requestedMode = DIARY_IMPORT_MODES.DATE_HEADINGS) {
  if (requestedMode === DIARY_IMPORT_MODES.BLANK_LINES) {
    return parseTextByBlankBlocks(text, language);
  }

  const lines = normalizeLineEndings(text).split("\n");
  const entries = [];
  let current = null;

  function startEntry(metadata = {}) {
    current = {
      lines: [],
      detectedDate: metadata.date || "",
      detectedTitle: metadata.title || "",
      sourceLineStart: metadata.lineNumber || null,
      boundaryConfidence: metadata.confidence || 0.8,
      boundaryReason: metadata.reason || "heading",
    };
  }

  function flush(lineNumber) {
    if (!current) return;
    const body = current.lines.join("\n").trim();
    if (body.length >= 12 || current.detectedTitle) {
      entries.push(
        makeDraftFromParts({
          text: body || current.detectedTitle,
          title: current.detectedTitle,
          date: current.detectedDate,
          language,
          boundaryConfidence: current.boundaryConfidence,
          boundaryReason: current.boundaryReason,
          sourceLineStart: current.sourceLineStart,
          sourceLineEnd: lineNumber,
        })
      );
    }
    current = null;
  }

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmed = line.trim();
    const heading = detectDiaryHeading(trimmed);
    const separator = /^(-{3,}|\*{3,}|_{3,})$/.test(trimmed);

    if (separator) {
      flush(lineNumber);
      return;
    }

    if (heading && (current?.lines?.join("\n").trim() || current?.detectedTitle)) {
      flush(lineNumber - 1);
      startEntry({ ...heading, lineNumber });
      if (heading.inlineText) current.lines.push(heading.inlineText);
      return;
    }

    if (heading && !current) {
      startEntry({ ...heading, lineNumber });
      if (heading.inlineText) current.lines.push(heading.inlineText);
      return;
    }

    if (!current) startEntry({ lineNumber, confidence: 0.45, reason: "continuous_text" });
    current.lines.push(line);
  });

  flush(lines.length);

  if (entries.length <= 1) {
    const blankEntries = parseTextByBlankBlocks(text, language);
    if (blankEntries.length > entries.length) return blankEntries;
  }

  return entries;
}

function parseTextByBlankBlocks(text, language) {
  return normalizeLineEndings(text)
    .split(/\n\s*\n+/u)
    .map((block) => block.trim())
    .filter((block) => block.length >= 12)
    .map((block) => {
      const heading = detectDiaryHeading(block.split("\n")[0]?.trim() || "");
      return makeDraftFromParts({
        text: heading?.inlineText ? [heading.inlineText, ...block.split("\n").slice(1)].join("\n") : block,
        title: heading?.title || "",
        date: heading?.date || extractDateFromText(block),
        language,
        boundaryConfidence: heading ? 0.78 : 0.55,
        boundaryReason: heading ? "blank_block_heading" : "blank_block",
      });
    });
}

function makeDraftFromParts({
  text,
  title = "",
  date = "",
  language = "en",
  adultContent = false,
  boundaryConfidence = 0.5,
  boundaryReason = "",
  sourceLineStart = null,
  sourceLineEnd = null,
}) {
  const rawText = String(text || "").trim();
  const detectedDate = normalizeDetectedDate(date || extractDateFromText(rawText));
  const detectedTitle = normalizeImportedTitle(title);

  return {
    rawText,
    detectedTitle,
    detectedDate,
    dreamDateStatus: detectedDate ? "known" : "unknown",
    originalLanguage: normalizeLanguage(language),
    adultContent,
    boundaryConfidence,
    boundaryReason,
    sourceLineStart,
    sourceLineEnd,
  };
}

function enhanceDraft(draft, index, language, sourceFormat) {
  const rawText = String(draft.rawText || draft.dreamText || "").trim();
  const originalLanguage = normalizeLanguage(draft.originalLanguage || language);
  const tagSuggestions = suggestTagsForDream(rawText, originalLanguage);
  const highConfidenceDirectSlugs = tagSuggestions
    .filter((tag) => tag.confidence >= 0.85 && tag.tagType !== "interpretive_suggestion")
    .map((tag) => tag.slug)
    .slice(0, 16);
  const suggestedTitleData = suggestNeutralTitle({
    text: rawText,
    language: originalLanguage,
    detectedTitle: draft.detectedTitle || draft.title,
    tagSuggestions,
    index,
  });

  return {
    id: draft.id || createLocalDraftId(index),
    orderIndex: index,
    sourceOrderIndex: Number.isFinite(draft.sourceOrderIndex) ? draft.sourceOrderIndex : index,
    selected: draft.selected !== false,
    rawText,
    detectedTitle: draft.detectedTitle || "",
    suggestedTitle: suggestedTitleData.text,
    title: draft.userEditedTitle ? draft.title : draft.title || suggestedTitleData.text,
    titleSource: draft.userEditedTitle ? "user" : suggestedTitleData.source,
    titleConfidence: suggestedTitleData.confidence,
    originalLanguage,
    detectedDate: draft.detectedDate || "",
    dreamDateStatus: draft.dreamDateStatus || (draft.detectedDate ? "known" : "unknown"),
    adultContent: Boolean(draft.adultContent || highConfidenceDirectSlugs.includes("adult-content")),
    boundaryConfidence: Number(draft.boundaryConfidence || 0),
    boundaryReason: draft.boundaryReason || "",
    sourceLineStart: draft.sourceLineStart || null,
    sourceLineEnd: draft.sourceLineEnd || null,
    sourceFormat,
    suggestedTags: tagSuggestions,
    selectedTagSlugs: Array.isArray(draft.selectedTagSlugs)
      ? draft.selectedTagSlugs
      : highConfidenceDirectSlugs,
    tagsSource: draft.tagsSource || "rule_suggestions",
    tagsReviewedByUser: Boolean(draft.tagsReviewedByUser),
  };
}

export function suggestTagsForDream(text, language = "en") {
  const normalizedText = normalizeSearchText(text);
  const results = [];

  Object.values(RECORD_TAGS).forEach((tagData) => {
    if (!DIRECT_TAG_CATEGORIES.has(tagData.category)) return;

    const terms = getTagTerms(tagData, language);
    const match = findBestTermMatch(text, normalizedText, terms);

    if (!match) return;

    const tagType = tagData.category === "Emotions" || tagData.category === "Dream Types"
      ? "experience_label"
      : "direct_content";
    const confidence = estimateTagConfidence(match.term, tagData, match.evidence);

    results.push({
      slug: tagData.slug,
      label: getTagLabel(tagData, language),
      category: tagData.category,
      confidence,
      evidence: match.evidence,
      tagType,
      source: "rule_keyword",
    });
  });

  return results
    .sort((a, b) => b.confidence - a.confidence || a.label.localeCompare(b.label))
    .slice(0, 24);
}

function getSelectedTagSlugs(draft) {
  if (Array.isArray(draft.selectedTagSlugs)) return [...new Set(draft.selectedTagSlugs)].filter(Boolean);

  return normalizeSuggestedTags(draft.suggestedTags || [])
    .filter((tag) => tag.confidence >= 0.85 && tag.tagType !== "interpretive_suggestion")
    .map((tag) => tag.slug);
}

function normalizeSuggestedTags(tags) {
  return (tags || [])
    .map((tag) => ({
      slug: String(tag?.slug || "").trim(),
      label: String(tag?.label || tag?.name || tag?.slug || "").trim(),
      category: String(tag?.category || "").trim(),
      confidence: Math.max(0, Math.min(1, Number(tag?.confidence || 0))),
      evidence: String(tag?.evidence || "").slice(0, 160),
      tagType: tag?.tagType || "direct_content",
      source: tag?.source || "rule_keyword",
    }))
    .filter((tag) => tag.slug);
}

function suggestNeutralTitle({ text, language, detectedTitle, tagSuggestions, index }) {
  const normalizedDetectedTitle = normalizeImportedTitle(detectedTitle);
  if (normalizedDetectedTitle) {
    return { text: normalizedDetectedTitle, source: "imported_heading", confidence: 0.92 };
  }

  const contentLabels = tagSuggestions
    .filter((tag) => ["Environment", "Entities", "Anomalies", "Dream Types", "Weather"].includes(tag.category))
    .filter((tag) => tag.confidence >= 0.86)
    .map((tag) => tag.label);
  const uniqueLabels = [...new Set(contentLabels)].slice(0, 2);

  if (uniqueLabels.length >= 2) {
    return {
      text: joinTitleParts(uniqueLabels, language),
      source: "rule_neutral_tags",
      confidence: 0.82,
    };
  }

  if (uniqueLabels.length === 1) {
    return {
      text: getSingleTagTitle(uniqueLabels[0], language),
      source: "rule_neutral_tag",
      confidence: 0.72,
    };
  }

  const firstLine = String(text || "")
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.length > 0 && !detectDiaryHeading(line));
  const firstPhrase = createPhraseTitle(firstLine, language);

  if (firstPhrase) {
    return { text: firstPhrase, source: "first_phrase", confidence: 0.62 };
  }

  return {
    text: getUntitledDreamTitle(language, index),
    source: "untitled",
    confidence: 0.35,
  };
}

function getTagTerms(tagData) {
  const baseTerms = [
    tagData.name,
    tagData.name_zh,
    tagData.name_es,
    tagData.slug,
    tagData.slug?.replace(/-/g, " "),
    ...(EXTRA_KEYWORDS[tagData.slug] || []),
  ];

  return [...new Set(baseTerms.map((term) => String(term || "").trim()).filter((term) => term.length >= 1))];
}

function findBestTermMatch(originalText, normalizedText, terms) {
  const sortedTerms = [...terms].sort((a, b) => b.length - a.length);

  for (const term of sortedTerms) {
    const normalizedTerm = normalizeSearchText(term);
    if (!normalizedTerm) continue;

    const matched = containsTerm(normalizedText, normalizedTerm);
    if (!matched) continue;

    return {
      term,
      evidence: extractEvidence(originalText, term),
    };
  }

  return null;
}

function containsTerm(haystack, needle) {
  if (!needle) return false;

  if (/^[a-z0-9\s-]+$/i.test(needle) && needle.length <= 3) {
    return new RegExp(`(^|[^a-z0-9])${escapeRegExp(needle)}([^a-z0-9]|$)`, "i").test(haystack);
  }

  if (/^[a-z0-9\s-]+$/i.test(needle)) {
    return new RegExp(`(^|[^a-z0-9])${escapeRegExp(needle)}([^a-z0-9]|$)`, "i").test(haystack);
  }

  return haystack.includes(needle);
}

function estimateTagConfidence(term, tagData, evidence) {
  const termLength = normalizeSearchText(term).length;
  let confidence = 0.78;

  if (termLength >= 8) confidence += 0.1;
  if (termLength >= 14) confidence += 0.04;
  if (tagData.category === "Content") confidence += 0.04;
  if (tagData.category === "Emotions") confidence -= 0.02;
  if (evidence && evidence.length <= 120) confidence += 0.02;

  return Math.max(0.65, Math.min(0.96, Number(confidence.toFixed(2))));
}

function extractEvidence(text, term) {
  const cleanText = normalizeLineEndings(text).replace(/\s+/g, " ").trim();
  const lowerText = cleanText.toLowerCase();
  const lowerTerm = String(term || "").toLowerCase();
  const index = lowerText.indexOf(lowerTerm);

  if (index < 0) return cleanText.slice(0, 120);

  const start = Math.max(0, index - 45);
  const end = Math.min(cleanText.length, index + lowerTerm.length + 45);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < cleanText.length ? "…" : "";

  return `${prefix}${cleanText.slice(start, end)}${suffix}`;
}

function detectDiaryHeading(line) {
  if (!line) return null;

  const markdownMatch = line.match(/^#{1,6}\s+(.+)$/u);
  const plainLine = markdownMatch ? markdownMatch[1].trim() : line;
  const date = extractDateFromText(plainLine, true);

  if (date && plainLine.length <= 80) {
    const title = normalizeImportedTitle(
      plainLine
        .replace(date.original || date.value, "")
        .replace(/^[-–—:：\s]+|[-–—:：\s]+$/gu, "")
    );
    return {
      date: date.value,
      title,
      confidence: 0.9,
      reason: "date_heading",
    };
  }

  const dreamHeading = plainLine.match(/^(?:dream|dream\s*#?\d+|夢|夢境|sueño|sueño\s*#?\d+)\s*[:：-]\s*(.*)$/iu);
  if (dreamHeading) {
    const inlineText = dreamHeading[1]?.trim() || "";
    return {
      title: inlineText.length <= 80 ? normalizeImportedTitle(inlineText) : "",
      inlineText: inlineText.length > 80 ? inlineText : "",
      confidence: 0.76,
      reason: "dream_heading",
    };
  }

  if (markdownMatch && plainLine.length <= 90) {
    return {
      title: normalizeImportedTitle(plainLine),
      confidence: 0.72,
      reason: "markdown_heading",
    };
  }

  return null;
}

function extractDateFromText(text, returnObject = false) {
  const value = String(text || "").trim();
  const patterns = [
    /\b(20\d{2}|19\d{2})[-/.年](0?[1-9]|1[0-2])[-/.月](0?[1-9]|[12]\d|3[01])日?\b/u,
    /\b(0?[1-9]|1[0-2])[-/](0?[1-9]|[12]\d|3[01])[-/](20\d{2}|19\d{2})\b/u,
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(0?[1-9]|[12]\d|3[01]),?\s+(20\d{2}|19\d{2})\b/iu,
  ];

  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (!match) continue;

    let normalized = "";
    if (/January|February|March|April|May|June|July|August|September|October|November|December/i.test(match[0])) {
      const date = new Date(match[0]);
      if (Number.isFinite(date.getTime())) normalized = date.toISOString().slice(0, 10);
    } else if (match[1]?.length === 4) {
      normalized = `${match[1]}-${String(match[2]).padStart(2, "0")}-${String(match[3]).padStart(2, "0")}`;
    } else {
      normalized = `${match[3]}-${String(match[1]).padStart(2, "0")}-${String(match[2]).padStart(2, "0")}`;
    }

    if (normalized) {
      return returnObject ? { value: normalized, original: match[0] } : normalized;
    }
  }

  return returnObject ? null : "";
}

function normalizeDetectedDate(value) {
  if (!value) return "";
  if (typeof value === "object" && value.value) return value.value;

  const date = extractDateFromText(String(value), true);
  if (date?.value) return date.value;

  const parsed = new Date(value);
  if (Number.isFinite(parsed.getTime())) return parsed.toISOString().slice(0, 10);

  return "";
}

function normalizeImportedTitle(value) {
  return String(value || "")
    .replace(/^#+\s*/u, "")
    .replace(/^[-–—:：\s]+|[-–—:：\s]+$/gu, "")
    .trim()
    .slice(0, 120);
}

function getImportTitle(draft, index) {
  const title = String(draft.title || draft.suggestedTitle || "").trim();
  if (title) return title.slice(0, 120);

  return getUntitledDreamTitle(draft.originalLanguage || "en", index);
}

function joinTitleParts(parts, language) {
  if (language === "zh") return parts.join("與");
  if (language === "es") return parts.join(" y ");
  return parts.join(" and ");
}

function getSingleTagTitle(label, language) {
  if (language === "zh") return `${label}夢境`;
  if (language === "es") return `Sueño de ${label}`;
  return `${label} Dream`;
}

function getUntitledDreamTitle(language, index) {
  const number = index + 1;
  if (language === "zh") return `未命名夢境 #${number}`;
  if (language === "es") return `Sueño sin título #${number}`;
  return `Untitled Dream #${number}`;
}

function createPhraseTitle(line, language) {
  if (!line) return "";
  const cleaned = line.replace(/^[-–—:：\s]+/u, "").trim();
  if (!cleaned || cleaned.length < 8) return "";

  if (language === "zh") {
    return cleaned.slice(0, 18);
  }

  const words = cleaned.split(/\s+/u).slice(0, 7).join(" ");
  return words.length > 6 ? words.replace(/[,.!?;:。！？；：]+$/u, "") : "";
}

function parseCsvRows(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let insideQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        cell += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }

    if (char === "," && !insideQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && nextChar === "\n") index += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  row.push(cell);
  rows.push(row);
  return rows;
}

function normalizeHeader(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "");
}

function looksLikeCsv(text) {
  const firstLine = text.split("\n")[0] || "";
  return /,/.test(firstLine) && /(dream|text|date|title)/i.test(firstLine);
}

function looksLikeJson(text) {
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
}

function normalizeSearchText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeLineEndings(value) {
  return String(value || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function getFileExtension(fileName = "") {
  return String(fileName).split(".").pop()?.toLowerCase() || "txt";
}

function getContentTypeFromFileName(fileName = "") {
  const extension = getFileExtension(fileName);
  if (extension === "csv") return "text/csv";
  if (extension === "json") return "application/json";
  if (extension === "md" || extension === "markdown") return "text/markdown";
  return "text/plain";
}

function sanitizePathPart(value) {
  return String(value || "unknown")
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .slice(0, 80);
}

function sanitizeFileName(value) {
  const cleaned = String(value || "dream-diary.txt")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);

  return cleaned || "dream-diary.txt";
}

function createLocalDraftId(index) {
  const randomPart =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);

  return `draft-${index + 1}-${randomPart}`;
}

function byteLength(value) {
  if (typeof Blob !== "undefined") return new Blob([value]).size;
  return new TextEncoder().encode(String(value || "")).length;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
