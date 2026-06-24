const crypto = require("node:crypto");
const { initializeApp } = require("firebase-admin/app");
const { FieldPath, FieldValue, getFirestore } = require("firebase-admin/firestore");
const { logger } = require("firebase-functions");
const { defineSecret } = require("firebase-functions/params");
const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const { onRequest } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const { Translate } = require("@google-cloud/translate").v2;

const REGION = "asia-east1";
const TRANSLATION_BACKFILL_KEY = defineSecret("TRANSLATION_BACKFILL_KEY");

setGlobalOptions({ region: REGION });
initializeApp();

const db = getFirestore();
const translate = new Translate();
const SUPPORTED_LANGUAGES = ["en", "zh", "es"];
const GOOGLE_LANGUAGE_CODES = {
  en: "en",
  zh: "zh-TW",
  es: "es",
};
const TRANSLATION_PROVIDER = "google-cloud-translate-v2";
const TRANSLATION_ENGINE_VERSION = 2;
const TRANSLATION_GLOSSARY_VERSION = 1;
const TRANSLATION_PLACEHOLDER_REPAIR_VERSION = 1;
const TRANSLATION_GLOSSARY = [
  {
    sourceLanguage: "zh",
    source: "佛地魔",
    targets: {
      en: "Voldemort",
      es: "Voldemort",
    },
  },
];
const CUSTOM_TAG_CATEGORIES = new Set([
  "Environment",
  "Entities",
  "Anomalies",
  "Emotions",
  "Styles",
  "Eras",
  "Weather",
  "Dream Types",
  "Perspective",
  "Psychological Observables",
  "Dream Analysis",
  "Custom",
]);

exports.translateDreamRecord = onDocumentWritten(
  {
    document: "Records/{recordId}",
    region: REGION,
    timeoutSeconds: 120,
    memory: "256MiB",
  },
  async (event) => {
    const after = event.data?.after;

    if (!after?.exists) return;

    await publishCustomTagsFromRecord({
      recordId: event.params.recordId,
      record: after.data(),
    });

    const result = await translateRecordData({
      recordId: event.params.recordId,
      record: after.data(),
      ref: after.ref,
    });

    if (result.status === "translated") {
      logger.info("Translated dream record.", {
        recordId: event.params.recordId,
        sourceLanguage: result.sourceLanguage,
        languages: SUPPORTED_LANGUAGES,
      });
    }
  }
);

exports.backfillDreamTranslations = onRequest(
  {
    region: REGION,
    timeoutSeconds: 540,
    memory: "512MiB",
    secrets: [TRANSLATION_BACKFILL_KEY],
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Use POST." });
      return;
    }

    const expectedKey = TRANSLATION_BACKFILL_KEY.value();
    const providedKey = getRequestValue(req, "key") || req.get("x-backfill-key");

    if (!expectedKey || providedKey !== expectedKey) {
      res.status(403).json({ error: "Missing or invalid backfill key." });
      return;
    }

    const requestedLimit = Number(getRequestValue(req, "limit") || 200);
    const limit = Math.min(
      Math.max(Number.isFinite(requestedLimit) ? requestedLimit : 200, 1),
      500
    );
    const startAfter = String(getRequestValue(req, "startAfter") || "").trim();
    const force = getBooleanRequestValue(req, "force");

    let recordsQuery = db
      .collection("Records")
      .orderBy(FieldPath.documentId())
      .limit(limit);

    if (startAfter) {
      recordsQuery = recordsQuery.startAfter(startAfter);
    }

    const snapshot = await recordsQuery.get();
    const response = {
      scanned: snapshot.size,
      translated: 0,
      skipped: 0,
      failed: 0,
      errors: [],
      nextStartAfter: snapshot.docs.at(-1)?.id || "",
      complete: snapshot.size < limit,
    };

    for (const doc of snapshot.docs) {
      try {
        const result = await translateRecordData({
          recordId: doc.id,
          record: doc.data(),
          ref: doc.ref,
          force,
        });

        if (result.status === "translated") {
          response.translated += 1;
        } else {
          response.skipped += 1;
        }
      } catch (error) {
        response.failed += 1;
        response.errors.push({
          recordId: doc.id,
          message: error.message,
        });
        logger.error("Backfill failed for dream record.", {
          recordId: doc.id,
          error: error.message,
        });
      }
    }

    res.json(response);
  }
);

exports.backfillCustomTags = onRequest(
  {
    region: REGION,
    timeoutSeconds: 540,
    memory: "512MiB",
    secrets: [TRANSLATION_BACKFILL_KEY],
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Use POST." });
      return;
    }

    const expectedKey = TRANSLATION_BACKFILL_KEY.value();
    const providedKey = getRequestValue(req, "key") || req.get("x-backfill-key");

    if (!expectedKey || providedKey !== expectedKey) {
      res.status(403).json({ error: "Missing or invalid backfill key." });
      return;
    }

    const requestedLimit = Number(getRequestValue(req, "limit") || 200);
    const limit = Math.min(
      Math.max(Number.isFinite(requestedLimit) ? requestedLimit : 200, 1),
      500
    );
    const startAfter = String(getRequestValue(req, "startAfter") || "").trim();

    let recordsQuery = db
      .collection("Records")
      .orderBy(FieldPath.documentId())
      .limit(limit);

    if (startAfter) {
      recordsQuery = recordsQuery.startAfter(startAfter);
    }

    const snapshot = await recordsQuery.get();
    const response = {
      scanned: snapshot.size,
      tagsPublished: 0,
      failed: 0,
      errors: [],
      nextStartAfter: snapshot.docs.at(-1)?.id || "",
      complete: snapshot.size < limit,
    };

    for (const doc of snapshot.docs) {
      try {
        response.tagsPublished += await publishCustomTagsFromRecord({
          recordId: doc.id,
          record: doc.data(),
        });
      } catch (error) {
        response.failed += 1;
        response.errors.push({
          recordId: doc.id,
          message: error.message,
        });
        logger.error("Custom tag backfill failed for dream record.", {
          recordId: doc.id,
          error: error.message,
        });
      }
    }

    res.json(response);
  }
);

async function translateRecordData({ recordId, record, ref, force = false }) {
  const original = getOriginalDreamFields(record);

  if (!original.text) {
    return {
      status: "skipped",
      reason: "missing-text",
      recordId,
      sourceLanguage: original.language,
    };
  }

  const sourceHash = makeSourceHash(original);
  const existingTranslations = record.translations || {};

  if (!force && !needsTranslation(record, sourceHash, existingTranslations)) {
    return {
      status: "skipped",
      reason: "current",
      recordId,
      sourceLanguage: original.language,
    };
  }

  const translations = {};

  for (const language of SUPPORTED_LANGUAGES) {
    if (language === original.language) {
      translations[language] = {
        title: original.title,
        excerpt: original.excerpt,
        text: original.text,
        dream_text: original.text,
      };
      continue;
    }

    translations[language] = await translateDreamFields(original, language);
  }

  await ref.set(
    {
      translations,
      ...buildTranslatedLanguageFields(translations),
      translationState: "ready",
      translationMeta: {
        provider: TRANSLATION_PROVIDER,
        status: "ready",
        engineVersion: TRANSLATION_ENGINE_VERSION,
        glossaryVersion: TRANSLATION_GLOSSARY_VERSION,
        placeholderRepairVersion: TRANSLATION_PLACEHOLDER_REPAIR_VERSION,
        sourceHash,
        sourceLanguage: original.language,
        languages: SUPPORTED_LANGUAGES,
        translatedAt: FieldValue.serverTimestamp(),
      },
    },
    { merge: true }
  );

  return {
    status: "translated",
    recordId,
    sourceLanguage: original.language,
  };
}

async function publishCustomTagsFromRecord({ recordId, record }) {
  const customTags = getCustomTagsFromRecord(record);

  if (customTags.length === 0) return 0;

  await Promise.all(
    customTags.map((tagData) =>
      db
        .collection("customTags")
        .doc(tagData.slug)
        .set(
          {
            ...tagData,
            status: "active",
            custom: true,
            shared: true,
            sourceRecordIds: FieldValue.arrayUnion(recordId),
            lastSeenInRecordId: recordId,
            updatedAt: FieldValue.serverTimestamp(),
            lastUsedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        )
    )
  );

  return customTags.length;
}

function getCustomTagsFromRecord(record) {
  const customSlugs = new Set(Array.isArray(record?.customTags) ? record.customTags : []);
  const tags = Array.isArray(record?.tags) ? record.tags : [];
  const customTags = new Map();

  tags.forEach((tagData) => {
    const isCustom = tagData?.custom === true || customSlugs.has(tagData?.slug);
    const normalized = normalizeCustomTag(tagData, isCustom);

    if (normalized) {
      customTags.set(normalized.slug, normalized);
    }
  });

  return [...customTags.values()];
}

function normalizeCustomTag(tagData, isCustom) {
  if (!isCustom) return null;

  const category = CUSTOM_TAG_CATEGORIES.has(tagData?.category)
    ? tagData.category
    : "Custom";
  const name = normalizeCustomTagLabel(
    tagData?.name || tagData?.label || tagData?.name_zh || tagData?.name_es
  );

  if (!name || category === "Content") return null;

  const slug = tagData?.slug
    ? makeSlug(tagData.slug)
    : makeSharedTagSlug(category, name);

  if (!slug) return null;

  return {
    id: tagData?.id || `custom-${slug}`,
    slug,
    category,
    name,
    name_zh: normalizeCustomTagLabel(tagData?.name_zh || tagData?.nameZh || name),
    name_es: normalizeCustomTagLabel(tagData?.name_es || tagData?.nameEs || name),
  };
}

function getOriginalDreamFields(record) {
  const language = normalizeLanguage(
    record.originalLanguage || record.original_language || "zh"
  );
  const title = getFirstPresentString(record, [
    "originalTitle",
    "original_title",
    ...getLanguageFieldKeys("title", language),
    "title",
  ]);
  const text = getFirstPresentString(record, [
    "originalText",
    "original_text",
    ...getLanguageFieldKeys("text", language),
    "dream_text",
    "text",
  ]);

  return {
    language,
    title,
    text,
    excerpt: createExcerpt(text),
  };
}

function getFirstPresentString(record, keys) {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(record || {}, key)) {
      return String(record[key] || "").trim();
    }
  }

  return "";
}

function getLanguageFieldKeys(field, language) {
  const fields = {
    title: {
      en: ["title_en", "titleEn", "title"],
      zh: ["title_zh", "titleZh"],
      es: ["title_es", "titleEs"],
    },
    text: {
      en: ["dream_text_en", "text_en", "textEn", "dream_text", "text"],
      zh: ["dream_text_zh", "textZh", "text_zh"],
      es: ["dream_text_es", "textEs", "text_es"],
    },
  };

  return fields[field]?.[language] || [];
}

function normalizeLanguage(language) {
  return SUPPORTED_LANGUAGES.includes(language) ? language : "zh";
}

function getRequestValue(req, key) {
  const bodyValue = req.body && typeof req.body === "object" ? req.body[key] : undefined;
  const queryValue = req.query?.[key];
  const value = bodyValue ?? queryValue;

  return Array.isArray(value) ? value[0] : value;
}

function getBooleanRequestValue(req, key) {
  const value = getRequestValue(req, key);

  return value === true || value === "true" || value === "1";
}

function normalizeCustomTagLabel(value) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, 40);
}

function makeSharedTagSlug(category, label) {
  return [category, label].map(makeSlug).filter(Boolean).join("-");
}

function makeSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\u4e00-\u9fff-]+/gi, "")
    .replace(/^-+|-+$/g, "");
}

function makeSourceHash(original) {
  return crypto
    .createHash("sha256")
    .update(
      JSON.stringify({
        provider: TRANSLATION_PROVIDER,
        engineVersion: TRANSLATION_ENGINE_VERSION,
        glossaryVersion: TRANSLATION_GLOSSARY_VERSION,
        languages: SUPPORTED_LANGUAGES,
        language: original.language,
        title: original.title,
        text: original.text,
      })
    )
    .digest("hex");
}

function needsTranslation(record, sourceHash, existingTranslations) {
  if (record.translationState === "queued" || record.translationMeta?.status === "queued") {
    return true;
  }

  if (record.translationMeta?.sourceHash !== sourceHash) {
    return true;
  }

  const original = getOriginalDreamFields(record);

  return SUPPORTED_LANGUAGES.some((language) => {
    const translation = existingTranslations[language] || {};
    const translatedText = translation.text || translation.dream_text || "";

    if (!translatedText) return true;

    return (
      record.translationMeta?.placeholderRepairVersion !==
        TRANSLATION_PLACEHOLDER_REPAIR_VERSION &&
      language !== original.language &&
      isSameMeaninglessPlaceholder(translatedText, original.text)
    );
  });
}

function isSameMeaninglessPlaceholder(translatedText, sourceText) {
  return normalizeComparableText(translatedText) === normalizeComparableText(sourceText);
}

function normalizeComparableText(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function buildTranslatedLanguageFields(translations) {
  const fields = {};

  SUPPORTED_LANGUAGES.forEach((language) => {
    const translation = translations[language] || {};
    const title = translation.title || "";
    const text = translation.text || translation.dream_text || "";
    const excerpt = translation.excerpt || createExcerpt(text);

    if (language === "zh") {
      Object.assign(fields, {
        titleZh: title,
        title_zh: title,
        textZh: text,
        text_zh: text,
        dream_text_zh: text,
        excerptZh: excerpt,
        excerpt_zh: excerpt,
      });
      return;
    }

    if (language === "es") {
      Object.assign(fields, {
        titleEs: title,
        title_es: title,
        textEs: text,
        text_es: text,
        dream_text_es: text,
        excerptEs: excerpt,
        excerpt_es: excerpt,
      });
      return;
    }

    Object.assign(fields, {
      titleEn: title,
      title_en: title,
      textEn: text,
      text_en: text,
      dream_text_en: text,
      excerptEn: excerpt,
      excerpt_en: excerpt,
    });
  });

  return fields;
}

async function translateDreamFields(original, targetLanguage) {
  const sourceCode = GOOGLE_LANGUAGE_CODES[original.language] || original.language;
  const targetCode = GOOGLE_LANGUAGE_CODES[targetLanguage] || targetLanguage;
  const values = [];
  const keys = [];

  if (original.title) {
    keys.push("title");
    values.push(applyTranslationGlossary(original.title, original.language, targetLanguage));
  }

  keys.push("text");
  values.push(applyTranslationGlossary(original.text, original.language, targetLanguage));

  const [translatedValues] = await translate.translate(values, {
    from: sourceCode,
    to: targetCode,
    format: "text",
  });
  const translatedArray = Array.isArray(translatedValues)
    ? translatedValues
    : [translatedValues];
  const translated = {};

  keys.forEach((key, index) => {
    translated[key] = String(translatedArray[index] || "");
  });

  const text = translated.text || "";

  return {
    title: translated.title || "",
    excerpt: createExcerpt(text),
    text,
    dream_text: text,
  };
}

function applyTranslationGlossary(value, sourceLanguage, targetLanguage) {
  return TRANSLATION_GLOSSARY.reduce((current, entry) => {
    if (entry.sourceLanguage !== sourceLanguage) return current;

    const replacement = entry.targets[targetLanguage];
    if (!replacement) return current;

    return current.split(entry.source).join(replacement);
  }, String(value || ""));
}

function createExcerpt(value) {
  const text = String(value || "").trim();
  return text.length > 220 ? `${text.slice(0, 220)}...` : text;
}
