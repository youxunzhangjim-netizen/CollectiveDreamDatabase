const crypto = require("node:crypto");
const { initializeApp } = require("firebase-admin/app");
const { FieldValue } = require("firebase-admin/firestore");
const { logger } = require("firebase-functions");
const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const { Translate } = require("@google-cloud/translate").v2;

initializeApp();

const translate = new Translate();
const SUPPORTED_LANGUAGES = ["en", "zh", "es"];
const GOOGLE_LANGUAGE_CODES = {
  en: "en",
  zh: "zh-TW",
  es: "es",
};
const TRANSLATION_PROVIDER = "google-cloud-translate-v2";

exports.translateDreamRecord = onDocumentWritten(
  {
    document: "Records/{recordId}",
    region: "us-central1",
    timeoutSeconds: 120,
    memory: "256MiB",
  },
  async (event) => {
    const after = event.data?.after;

    if (!after?.exists) return;

    const record = after.data();
    const original = getOriginalDreamFields(record);

    if (!original.text) {
      logger.info("Skipping translation because record has no text.", {
        recordId: event.params.recordId,
      });
      return;
    }

    const sourceHash = makeSourceHash(original);
    const existingTranslations = record.translations || {};

    if (!needsTranslation(record, sourceHash, existingTranslations)) {
      return;
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

    await after.ref.set(
      {
        translations,
        translationMeta: {
          provider: TRANSLATION_PROVIDER,
          sourceHash,
          sourceLanguage: original.language,
          languages: SUPPORTED_LANGUAGES,
          translatedAt: FieldValue.serverTimestamp(),
        },
      },
      { merge: true }
    );

    logger.info("Translated dream record.", {
      recordId: event.params.recordId,
      sourceLanguage: original.language,
      languages: SUPPORTED_LANGUAGES,
    });
  }
);

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
      en: ["title", "title_en", "titleEn"],
      zh: ["title_zh", "titleZh"],
      es: ["title_es", "titleEs"],
    },
    text: {
      en: ["dream_text", "text", "text_en", "textEn"],
      zh: ["dream_text_zh", "textZh", "text_zh"],
      es: ["dream_text_es", "textEs", "text_es"],
    },
  };

  return fields[field]?.[language] || [];
}

function normalizeLanguage(language) {
  return SUPPORTED_LANGUAGES.includes(language) ? language : "zh";
}

function makeSourceHash(original) {
  return crypto
    .createHash("sha256")
    .update(
      JSON.stringify({
        provider: TRANSLATION_PROVIDER,
        languages: SUPPORTED_LANGUAGES,
        language: original.language,
        title: original.title,
        text: original.text,
      })
    )
    .digest("hex");
}

function needsTranslation(record, sourceHash, existingTranslations) {
  if (record.translationMeta?.sourceHash !== sourceHash) {
    return true;
  }

  return SUPPORTED_LANGUAGES.some((language) => {
    const translation = existingTranslations[language] || {};
    return !translation.text && !translation.dream_text;
  });
}

async function translateDreamFields(original, targetLanguage) {
  const sourceCode = GOOGLE_LANGUAGE_CODES[original.language] || original.language;
  const targetCode = GOOGLE_LANGUAGE_CODES[targetLanguage] || targetLanguage;
  const values = [];
  const keys = [];

  if (original.title) {
    keys.push("title");
    values.push(original.title);
  }

  keys.push("text");
  values.push(original.text);

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

function createExcerpt(value) {
  const text = String(value || "").trim();
  return text.length > 220 ? `${text.slice(0, 220)}...` : text;
}
