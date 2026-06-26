import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebaseClient.js";
import {
  getPrimaryDreamImageUrl,
  normalizeDreamImages,
  uploadDreamImages,
} from "./dreamImageService.js";
import { upsertSharedCustomTags } from "./customTagsService.js";
import {
  DREAM_DATE_STATUS,
  getDreamDateStatus,
  getVisibleDreamDate,
  normalizeDreamDateStatus,
} from "./dreamDate.js";
import { normalizeLanguage } from "./language.js";
import { buildRecordTags, getTagSlugsByCategory } from "./tagTaxonomy.js";

function requireFirestore() {
  if (!isFirebaseConfigured || !db) {
    throw new Error("Archive storage is not available yet.");
  }

  return db;
}

function mapRecordSnapshot(snapshot) {
  return snapshot.docs.map((recordDoc) => ({
    id: recordDoc.id,
    ...recordDoc.data(),
  }));
}

export const DREAM_SHARING_MODES = {
  PRIVATE: "private",
  PUBLIC_ANONYMOUS: "public_anonymous",
  PUBLIC_PSEUDONYM: "public_pseudonym",
  STATS_ONLY: "stats_only",
};

export const DREAM_PERIODS = ["morning", "afternoon", "evening", "night"];

const PUBLIC_SHARING_MODES = new Set([
  DREAM_SHARING_MODES.PUBLIC_ANONYMOUS,
  DREAM_SHARING_MODES.PUBLIC_PSEUDONYM,
]);

function normalizeSharingMode(value) {
  return Object.values(DREAM_SHARING_MODES).includes(value)
    ? value
    : DREAM_SHARING_MODES.PRIVATE;
}

function getSharingVisibility(sharingMode) {
  if (sharingMode === DREAM_SHARING_MODES.STATS_ONLY) return "stats_only";
  if (PUBLIC_SHARING_MODES.has(sharingMode)) return "public";

  return "private";
}

function getRecordIdentityForSharing(sharingMode, fallback = "anonymous") {
  if (sharingMode === DREAM_SHARING_MODES.PUBLIC_PSEUDONYM) return "account";
  if (sharingMode === DREAM_SHARING_MODES.PUBLIC_ANONYMOUS) return "anonymous";

  return fallback === "account" ? "account" : "anonymous";
}

function shouldIncludeInResearchStats(sharingMode, explicitValue) {
  if (typeof explicitValue === "boolean") return explicitValue;

  return sharingMode === DREAM_SHARING_MODES.STATS_ONLY || PUBLIC_SHARING_MODES.has(sharingMode);
}

function getTimestampMillis(value) {
  if (!value) return 0;
  if (typeof value.toMillis === "function") return value.toMillis();

  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

export function calculateDreamSignalCoherence({
  dreamText = "",
  title = "",
  dreamDate = "",
  dreamTime = "",
  dreamPeriod = "",
  dreamSequence = 1,
  ageAtDream = "",
  tags = [],
} = {}) {
  const text = String(dreamText || "").trim();
  const normalizedTags = Array.isArray(tags) ? tags.filter(Boolean) : [];
  const tagCategories = new Set(
    normalizedTags.map((tag) => tag.category).filter(Boolean)
  );
  const tagSlugs = new Set(normalizedTags.map((tag) => tag.slug).filter(Boolean));
  let score = 0;

  if (text.length >= 40) score += 12;
  if (text.length >= 180) score += 10;
  if (text.length >= 600) score += 8;
  if (text.length >= 1500) score += 4;

  if (String(title || "").trim()) score += 4;
  if (String(dreamDate || "").trim()) score += 8;
  if (String(dreamTime || dreamPeriod || "").trim()) score += 4;
  if (Number(dreamSequence || 1) > 1) score += 2;
  if (Number.isFinite(Number(ageAtDream)) && Number(ageAtDream) > 0) score += 3;

  score += Math.min(24, tagCategories.size * 4);
  if (tagCategories.has("Emotions")) score += 8;
  if (tagCategories.has("Psychological Observables")) score += 8;
  if (tagCategories.has("Dream Analysis")) score += 8;
  if (tagCategories.has("Perspective")) score += 4;
  if (tagCategories.has("Dream Types")) score += 4;
  if (tagSlugs.has("nightmare") || tagSlugs.has("lucid")) score += 3;
  if (normalizedTags.some((tag) => tag.custom)) score += 3;

  return Math.max(8, Math.min(96, Math.round(score)));
}

export async function fetchOwnedRecords(currentUser) {
  if (!currentUser?.uid) return [];

  const recordsQuery = query(
    collection(requireFirestore(), "Records"),
    where("ownerId", "==", currentUser.uid)
  );

  const snapshot = await getDocs(recordsQuery);
  return mapRecordSnapshot(snapshot);
}

export async function fetchPublicRecords({ includeAdult = false } = {}) {
  const recordsCollection = collection(requireFirestore(), "Records");
  const publicRecordsQuery = includeAdult
    ? query(recordsCollection, where("isPublic", "==", true))
    : query(
        recordsCollection,
        where("isPublic", "==", true),
        where("adultContent", "==", false),
        where("minimumViewerAge", "==", 0)
      );

  const snapshot = await getDocs(publicRecordsQuery);

  return mapRecordSnapshot(snapshot).sort(
    (a, b) => getTimestampMillis(b.createdAt) - getTimestampMillis(a.createdAt)
  );
}

export async function createDreamRecord(currentUser, draft, profile = null) {
  if (!currentUser?.uid) {
    throw new Error("A signed-in or guest session is required to save a record.");
  }

  const dreamText = limitString(draft?.dreamText || draft?.originalText || "", 120000);

  if (!dreamText) {
    throw new Error("Dream text is required.");
  }

  const firestore = requireFirestore();
  const recordRef = doc(collection(firestore, "Records"));
  const originalLanguage = normalizeLanguage(draft?.originalLanguage || "zh");
  const title = normalizeOptionalTitle(draft?.title, dreamText);
  const excerpt = createExcerpt(dreamText);
  const submittedDreamDate = String(draft?.dreamDate || "").trim();
  const dreamDateStatus = normalizeDreamDateStatus(
    draft?.dreamDateStatus,
    submittedDreamDate
  );
  const dreamDate =
    dreamDateStatus === DREAM_DATE_STATUS.KNOWN ? submittedDreamDate : "";
  const dreamTime = normalizeDreamTime(draft?.dreamTime || draft?.dream_time);
  const dreamPeriod = normalizeDreamPeriod(draft?.dreamPeriod || draft?.dream_period);
  const dreamSequence = normalizeDreamSequence(draft?.dreamSequence || draft?.dream_sequence);
  const dreamDateTime = buildDreamDateTime(dreamDate, dreamTime);
  const ageAtDream =
    draft?.ageAtDream === "" || draft?.ageAtDream == null
      ? ""
      : Math.max(0, Number(draft.ageAtDream));
  const adultContent = Boolean(draft?.adultContent);
  const accountBacked = !currentUser.isAnonymous;
  const requestedSharingMode = normalizeSharingMode(draft?.sharingMode);
  const sharingMode = DREAM_SHARING_MODES.PRIVATE;
  const visibility = getSharingVisibility(sharingMode);
  const isPublic = false;
  const recordIdentityMode = getRecordIdentityForSharing(
    sharingMode,
    accountBacked && draft?.recordIdentityMode === "account" ? "account" : "anonymous"
  );
  const creatorDisplayName =
    recordIdentityMode === "account"
      ? profile?.displayName || currentUser.displayName || ""
      : "";
  const creatorEmail =
    recordIdentityMode === "account" && profile?.showEmail
      ? currentUser.email || ""
      : "";
  const tags = buildRecordTags(
    draft?.selectedTagSlugs || draft?.emotionTags || [],
    draft?.customTagLabels || [],
    adultContent,
    draft?.sharedTags || []
  );
  const environmentTags = getTagSlugsByCategory(tags, "Environment");
  const entityTags = getTagSlugsByCategory(tags, "Entities");
  const anomalyTags = getTagSlugsByCategory(tags, "Anomalies");
  const emotionTags = getTagSlugsByCategory(tags, "Emotions");
  const styleTags = getTagSlugsByCategory(tags, "Styles");
  const eraTags = getTagSlugsByCategory(tags, "Eras");
  const weatherTags = getTagSlugsByCategory(tags, "Weather");
  const dreamTypeTags = getTagSlugsByCategory(tags, "Dream Types");
  const perspectiveTags = getTagSlugsByCategory(tags, "Perspective");
  const psychologicalObservableTags = getTagSlugsByCategory(
    tags,
    "Psychological Observables"
  );
  const dreamAnalysisTags = getTagSlugsByCategory(tags, "Dream Analysis");
  const customTags = tags.filter((tag) => tag.custom).map((tag) => tag.slug);
  const signalCoherence = calculateDreamSignalCoherence({
    dreamText,
    title,
    dreamDate,
    dreamTime,
    dreamPeriod,
    dreamSequence,
    ageAtDream,
    tags,
  });
  const languageFields = buildOriginalLanguageFields(
    originalLanguage,
    title,
    dreamText,
    excerpt
  );
  const translationFields = buildRecorderTranslationFields(
    draft?.translations || draft?.translationVersions,
    originalLanguage
  );
  const coreRecord = {
    id: recordRef.id,
    dream_id: recordRef.id,
    ownerId: currentUser.uid,
    creatorId: currentUser.uid,
    anonymousLocked: false,
    visibility,
    isPublic,
    sharingMode,
    requestedSharingMode,
    includedInResearchStats: false,
    researchConsent: false,
    publicConsent: false,
    consentVersion: "privacy-first-2026-06",
    analysisDisclaimerAccepted: true,
    originalLanguage,
    originalTitle: title,
    originalText: dreamText,
    originalExcerpt: excerpt,
    title,
    dream_text: dreamText,
    excerpt,
    ...languageFields,
    ...translationFields,
    dreamDate,
    dream_date: dreamDate,
    dreamDateStatus,
    dream_date_status: dreamDateStatus,
    dreamTime,
    dream_time: dreamTime,
    dreamPeriod,
    dream_period: dreamPeriod,
    dreamSequence,
    dream_sequence: dreamSequence,
    dreamDateTime,
    dream_date_time: dreamDateTime,
    ageAtDream: Number.isFinite(ageAtDream) ? ageAtDream : "",
    recordIdentityMode,
    attributionMode: recordIdentityMode,
    creatorDisplayName,
    creatorEmail,
    creatorCountry: "",
    creatorCountryRegion: "",
    pseudoId: buildPseudoId(recordRef.id),
    adultContent,
    minimumViewerAge: adultContent ? 18 : 0,
    signal_coherence: signalCoherence,
    sourceType: draft?.sourceType || (draft?.importBatchId ? "diary_import" : "single_record"),
    importBatchId: draft?.importBatchId || "",
    importDraftId: draft?.importDraftId || "",
    importMatchKey: draft?.importMatchKey || "",
    sourceFileName: draft?.sourceFileName || "",
    sourceFormat: draft?.sourceFormat || "",
    sourceOrderIndex:
      draft?.sourceOrderIndex === 0 || draft?.sourceOrderIndex
        ? Number(draft.sourceOrderIndex)
        : null,
    sourceLineStart: draft?.sourceLineStart || null,
    sourceLineEnd: draft?.sourceLineEnd || null,
    titleSource: draft?.titleSource || (title ? "user" : "blank"),
    titleConfidence: Number(draft?.titleConfidence || (title ? 1 : 0)),
    tagsSource: draft?.tagsSource || "user_selected",
    tagsReviewedByUser: Boolean(draft?.tagsReviewedByUser),
    suggestedTags: sanitizeSuggestedTags(draft?.suggestedTags),
    parserVersion: draft?.parserVersion || "",
    autoTaggerVersion: draft?.autoTaggerVersion || "",
    importedAt: draft?.importedAt || "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(recordRef, coreRecord);

  let images = [];
  let imageUploadError = null;

  try {
    images = await uploadDreamImages(draft?.imageFiles || [], {
      ownerId: currentUser.uid,
      recordId: recordRef.id,
    });
  } catch (error) {
    imageUploadError = {
      code: error?.code || "storage/upload-failed",
      message: error?.message || "Picture upload failed.",
    };
  }

  const imageUrls = images.map((image) => image.url).filter(Boolean);
  const thumbnailUrl = imageUrls[0] || "";
  const optionalRecord = {
    images,
    dreamImages: images,
    imageUrls,
    pictureUrls: imageUrls,
    thumbnailUrl,
    thumbnail_url: thumbnailUrl,
    generated_image_url: thumbnailUrl,
    environmentTags,
    entityTags,
    anomalyTags,
    emotionTags,
    styleTags,
    eraTags,
    weatherTags,
    dreamTypeTags,
    perspectiveTags,
    psychologicalObservableTags,
    dreamAnalysisTags,
    customTags,
    tags,
    anomaly_tag_slugs: anomalyTags,
    updatedAt: serverTimestamp(),
  };

  let metadataMergeError = null;
  let customTagCatalogError = null;

  try {
    await setDoc(recordRef, optionalRecord, { merge: true });
  } catch (error) {
    metadataMergeError = {
      code: error?.code || "metadata/merge-failed",
      message: error?.message || "Record metadata merge failed.",
    };
  }

  try {
    await upsertSharedCustomTags(currentUser, draft?.customTagLabels || []);
  } catch (error) {
    customTagCatalogError = {
      code: error?.code || "custom-tags/share-failed",
      message: error?.message || "Custom tag catalog update failed.",
    };
  }

  const record = {
    ...coreRecord,
    ...optionalRecord,
    imageUploadError,
    metadataMergeError,
    customTagCatalogError,
  };

  return {
    ...record,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function fetchSavedRecords(currentUser) {
  if (!currentUser?.uid) return [];

  const savedQuery = query(
    collection(requireFirestore(), "users", currentUser.uid, "savedRecords"),
    orderBy("savedAt", "desc")
  );

  const snapshot = await getDocs(savedQuery);
  return hydrateRecordReferences(mapRecordSnapshot(snapshot));
}

export async function fetchCollectionRecords(currentUser, collectionId = "liked-dreams") {
  if (!currentUser?.uid) return [];

  const collectionQuery = query(
    collection(
      requireFirestore(),
      "users",
      currentUser.uid,
      "collections",
      collectionId,
      "records"
    ),
    orderBy("collectedAt", "desc")
  );

  const snapshot = await getDocs(collectionQuery);
  return hydrateRecordReferences(mapRecordSnapshot(snapshot));
}

async function hydrateRecordReferences(records) {
  return Promise.all(
    records.map(async (record) => {
      const recordId = record?.recordId || record?.id || record?.dream_id;

      if (!recordId) return record;

      try {
        const liveRecord = await fetchRecordById(recordId);
        if (!liveRecord) return record;

        return {
          ...record,
          ...liveRecord,
          recordId,
          savedAt: record.savedAt,
          collectedAt: record.collectedAt,
          collectionId: record.collectionId,
        };
      } catch {
        return record;
      }
    })
  );
}

export async function fetchFollowingRecorders(currentUser) {
  if (!currentUser?.uid || currentUser.isAnonymous) return [];

  const followingQuery = query(
    collection(requireFirestore(), "users", currentUser.uid, "following"),
    orderBy("followedAt", "desc")
  );

  const snapshot = await getDocs(followingQuery);
  return mapRecordSnapshot(snapshot);
}

export async function followRecorderForUser(currentUser, recorder) {
  if (!currentUser?.uid || currentUser.isAnonymous) {
    throw new Error("A signed-in account is required to follow recorders.");
  }

  const recorderId = recorder?.recorderId || recorder?.creatorId || recorder?.ownerId;

  if (!recorderId) {
    throw new Error("This record does not expose a followable recorder.");
  }

  if (recorderId === currentUser.uid) {
    throw new Error("You are already the owner of this recorder identity.");
  }

  const firestore = requireFirestore();
  const followingRef = collection(firestore, "users", currentUser.uid, "following");
  const followRef = doc(followingRef, recorderId);
  const existingFollow = await getDoc(followRef);

  if (!existingFollow.exists()) {
    const currentFollowing = await getDocs(followingRef);

    if (currentFollowing.size >= 10) {
      throw new Error("You can follow up to ten recorders.");
    }
  }

  await setDoc(
    followRef,
    {
      recorderId,
      ownerId: currentUser.uid,
      displayName: recorder?.creatorDisplayName || recorder?.displayName || "",
      email: recorder?.creatorEmail || "",
      followedAt: existingFollow.exists()
        ? existingFollow.data().followedAt || serverTimestamp()
        : serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function unfollowRecorderForUser(currentUser, recorderId) {
  if (!currentUser?.uid || currentUser.isAnonymous || !recorderId) return;

  await deleteDoc(
    doc(requireFirestore(), "users", currentUser.uid, "following", recorderId)
  );
}

export async function fetchRecordById(recordId) {
  if (!recordId) return null;

  const recordSnapshot = await getDoc(doc(requireFirestore(), "Records", recordId));

  if (!recordSnapshot.exists()) return null;

  return {
    id: recordSnapshot.id,
    ...recordSnapshot.data(),
  };
}

function normalizeRecordReference(record) {
  const recordId = typeof record === "string" ? record : record?.id || record?.dream_id;

  if (!recordId) {
    throw new Error("recordId is required.");
  }

  const originalLanguage = normalizeLanguage(
    record?.originalLanguage || record?.original_language || "en"
  );
  const recordIdentityMode =
    record?.recordIdentityMode === "account" || record?.attributionMode === "account"
      ? "account"
      : "anonymous";
  const adultContent = Boolean(
    record?.adultContent ||
      record?.adult_content ||
      record?.isAdult ||
      record?.is_adult
  );
  const images = normalizeDreamImages(record);
  const imageUrls = images.map((image) => image.url).filter(Boolean);
  const thumbnailUrl = getPrimaryDreamImageUrl(record);
  const dreamDateStatus = getDreamDateStatus(record);
  const dreamDate = getVisibleDreamDate(record);
  const visibility =
    record?.visibility || (record?.isPublic === false ? "private" : "public");
  const isPublic =
    typeof record?.isPublic === "boolean" ? record.isPublic : visibility === "public";

  return {
    recordId,
    title: record?.title || "",
    titleEn: record?.titleEn || record?.title_en || "",
    titleZh: record?.titleZh || record?.title_zh || "",
    titleEs: record?.titleEs || record?.title_es || "",
    text: record?.dream_text || record?.text || record?.excerpt || "",
    textEn:
      record?.dream_text_en || record?.textEn || record?.text_en || record?.excerpt_en || "",
    textZh: record?.dream_text_zh || record?.textZh || record?.excerpt_zh || "",
    textEs: record?.dream_text_es || record?.textEs || record?.excerpt_es || "",
    originalLanguage,
    originalTitle:
      record?.originalTitle ||
      record?.original_title ||
      getLanguageSpecificValue(record, "title", originalLanguage),
    originalText:
      record?.originalText ||
      record?.original_text ||
      getLanguageSpecificValue(record, "text", originalLanguage),
    translationLanguages: normalizeTranslationLanguages(record?.translationLanguages),
    translationSource: record?.translationSource || "",
    images,
    dreamImages: images,
    imageUrls,
    pictureUrls: imageUrls,
    thumbnailUrl,
    thumbnail_url: thumbnailUrl,
    generated_image_url: thumbnailUrl,
    date: dreamDate,
    dreamDate,
    dreamDateStatus,
    dream_date_status: dreamDateStatus,
    dreamTime: normalizeDreamTime(record?.dreamTime || record?.dream_time),
    dream_time: normalizeDreamTime(record?.dreamTime || record?.dream_time),
    dreamPeriod: normalizeDreamPeriod(record?.dreamPeriod || record?.dream_period),
    dream_period: normalizeDreamPeriod(record?.dreamPeriod || record?.dream_period),
    dreamSequence: normalizeDreamSequence(record?.dreamSequence || record?.dream_sequence),
    dream_sequence: normalizeDreamSequence(record?.dreamSequence || record?.dream_sequence),
    dreamDateTime:
      record?.dreamDateTime ||
      record?.dream_date_time ||
      buildDreamDateTime(
        dreamDate,
        normalizeDreamTime(record?.dreamTime || record?.dream_time)
      ),
    creatorId: record?.ownerId || record?.creatorId || "",
    authorName: record?.authorName || record?.creatorDisplayName || "",
    recordIdentityMode,
    creatorDisplayName:
      recordIdentityMode === "account"
        ? record?.creatorDisplayName || record?.displayName || ""
        : "",
    creatorEmail:
      recordIdentityMode === "account" ? record?.creatorEmail || "" : "",
    pseudoId: record?.pseudo_id || record?.pseudoId || "",
    visibility,
    isPublic,
    sharingMode:
      record?.sharingMode ||
      (visibility === "stats_only"
        ? DREAM_SHARING_MODES.STATS_ONLY
        : isPublic
          ? recordIdentityMode === "account"
            ? DREAM_SHARING_MODES.PUBLIC_PSEUDONYM
            : DREAM_SHARING_MODES.PUBLIC_ANONYMOUS
          : DREAM_SHARING_MODES.PRIVATE),
    includedInResearchStats: Boolean(
      record?.includedInResearchStats || record?.researchConsent
    ),
    adultContent,
    anonymousLocked: Boolean(record?.anonymousLocked),
    minimumViewerAge:
      record?.minimumViewerAge ||
      record?.minimum_viewer_age ||
      (adultContent ? 18 : 0),
    tags: Array.isArray(record?.tags) ? record.tags : [],
    environmentTags: Array.isArray(record?.environmentTags) ? record.environmentTags : [],
    entityTags: Array.isArray(record?.entityTags) ? record.entityTags : [],
    anomalyTags: Array.isArray(record?.anomalyTags)
      ? record.anomalyTags
      : Array.isArray(record?.anomaly_tag_slugs)
        ? record.anomaly_tag_slugs
        : [],
    emotionTags: Array.isArray(record?.emotionTags) ? record.emotionTags : [],
    styleTags: Array.isArray(record?.styleTags) ? record.styleTags : [],
    eraTags: Array.isArray(record?.eraTags) ? record.eraTags : [],
    weatherTags: Array.isArray(record?.weatherTags) ? record.weatherTags : [],
    dreamTypeTags: Array.isArray(record?.dreamTypeTags) ? record.dreamTypeTags : [],
    perspectiveTags: Array.isArray(record?.perspectiveTags)
      ? record.perspectiveTags
      : [],
    psychologicalObservableTags: Array.isArray(record?.psychologicalObservableTags)
      ? record.psychologicalObservableTags
      : [],
    dreamAnalysisTags: Array.isArray(record?.dreamAnalysisTags)
      ? record.dreamAnalysisTags
      : [],
    customTags: Array.isArray(record?.customTags) ? record.customTags : [],
    sourceType: record?.sourceType || (record?.importBatchId ? "diary_import" : "single_record"),
    importBatchId: record?.importBatchId || "",
    importDraftId: record?.importDraftId || "",
    sourceFileName: record?.sourceFileName || "",
    sourceFormat: record?.sourceFormat || "",
    sourceOrderIndex:
      record?.sourceOrderIndex === 0 || record?.sourceOrderIndex
        ? Number(record.sourceOrderIndex)
        : null,
    sourceLineStart: record?.sourceLineStart || null,
    sourceLineEnd: record?.sourceLineEnd || null,
    titleSource: record?.titleSource || "",
    titleConfidence: Number(record?.titleConfidence || 0),
    tagsSource: record?.tagsSource || "",
    tagsReviewedByUser: Boolean(record?.tagsReviewedByUser),
    suggestedTags: Array.isArray(record?.suggestedTags) ? record.suggestedTags : [],
    parserVersion: record?.parserVersion || "",
    autoTaggerVersion: record?.autoTaggerVersion || "",
    importedAt: record?.importedAt || "",
  };
}

function getLanguageSpecificValue(record, field, language) {
  const normalizedLanguage = normalizeLanguage(language);
  const fields = {
    title: {
      en: ["titleEn", "title_en", "title"],
      zh: ["titleZh", "title_zh"],
      es: ["titleEs", "title_es"],
    },
    text: {
      en: ["dream_text_en", "textEn", "text_en", "dream_text", "text"],
      zh: ["dream_text_zh", "textZh", "text_zh"],
      es: ["dream_text_es", "textEs", "text_es"],
    },
    excerpt: {
      en: ["excerptEn", "excerpt_en", "excerpt"],
      zh: ["excerpt_zh", "excerptZh"],
      es: ["excerpt_es", "excerptEs"],
    },
  };

  return (
    fields[field]?.[normalizedLanguage]
      ?.map((key) => record?.[key])
      .find(Boolean) || ""
  );
}

function buildOriginalLanguageFields(language, title, text, excerpt) {
  if (language === "zh") {
    return {
      titleZh: title,
      title_zh: title,
      textZh: text,
      dream_text_zh: text,
      excerptZh: excerpt,
      excerpt_zh: excerpt,
    };
  }

  if (language === "es") {
    return {
      titleEs: title,
      title_es: title,
      textEs: text,
      dream_text_es: text,
      excerptEs: excerpt,
      excerpt_es: excerpt,
    };
  }

  return {
    titleEn: title,
    title_en: title,
    textEn: text,
    text_en: text,
    excerptEn: excerpt,
    excerpt_en: excerpt,
  };
}

function buildRecorderTranslationFields(
  translations,
  originalLanguage,
  existingTranslationLanguages = []
) {
  const normalizedOriginalLanguage = normalizeLanguage(originalLanguage);
  const fields = {};
  const translationLanguages = normalizeTranslationLanguages(existingTranslationLanguages).filter(
    (language) => language !== normalizedOriginalLanguage
  );
  const translationMap =
    translations && typeof translations === "object" && !Array.isArray(translations)
      ? translations
      : {};

  for (const [language, value] of Object.entries(translationMap)) {
    const normalizedLanguage = normalizeLanguage(language);
    if (normalizedLanguage === normalizedOriginalLanguage) continue;

    const text = limitString(
      value?.dreamText || value?.text || value?.originalText || "",
      120000
    );
    const title = limitString(value?.title || "", 220);
    if (!text && !title) continue;

    const excerpt = createExcerpt(text || title);
    Object.assign(fields, buildOriginalLanguageFields(normalizedLanguage, title, text, excerpt));
    translationLanguages.push(normalizedLanguage);
  }

  const uniqueTranslationLanguages = [...new Set(translationLanguages)];

  if (uniqueTranslationLanguages.length > 0) {
    fields.translationLanguages = uniqueTranslationLanguages;
    fields.translationSource = "recorder_provided";
  }

  return fields;
}

function normalizeTranslationLanguages(value) {
  if (!Array.isArray(value)) return [];

  return [...new Set(value.map(normalizeLanguage))];
}

function mergeRecordTagSets(existingTags = [], additionalTags = []) {
  const merged = new Map();

  [...existingTags, ...additionalTags].forEach((tag) => {
    if (!tag?.slug) return;
    merged.set(tag.slug, {
      ...merged.get(tag.slug),
      ...tag,
    });
  });

  return [...merged.values()];
}

function normalizeDreamTime(value) {
  const rawValue = String(value || "").trim();
  const match = rawValue.match(/^([01]?\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?$/);
  if (!match) return "";

  return `${match[1].padStart(2, "0")}:${match[2]}`;
}

function normalizeDreamPeriod(value) {
  const normalizedValue = String(value || "").trim().toLowerCase();
  return DREAM_PERIODS.includes(normalizedValue) ? normalizedValue : "";
}

function normalizeDreamSequence(value) {
  const parsed = Number(value || 1);
  if (!Number.isFinite(parsed)) return 1;

  return Math.max(1, Math.min(12, Math.round(parsed)));
}

function buildDreamDateTime(dreamDate, dreamTime) {
  return dreamDate && dreamTime ? `${dreamDate}T${dreamTime}` : "";
}

function normalizeOptionalTitle(title, dreamText) {
  const trimmedTitle = String(title || "").trim();
  const trimmedText = String(dreamText || "").trim();

  if (!trimmedTitle) return "";

  const sentenceMatch = trimmedText.match(/^(.{1,180}?[.!?。！？])(?:\s|$)/u);
  const firstSentence = sentenceMatch?.[1]?.trim() || "";

  if (firstSentence && trimmedTitle === firstSentence) return "";

  return limitString(trimmedTitle, 220);
}

function limitString(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}


function sanitizeSuggestedTags(suggestedTags = []) {
  if (!Array.isArray(suggestedTags)) return [];

  return suggestedTags.slice(0, 24).map((tag) => ({
    slug: String(tag?.slug || "").slice(0, 120),
    label: String(tag?.label || "").slice(0, 80),
    category: String(tag?.category || "").slice(0, 80),
    confidence: Number.isFinite(Number(tag?.confidence))
      ? Math.max(0, Math.min(1, Number(tag.confidence)))
      : 0,
    evidence: String(tag?.evidence || "").slice(0, 160),
    tagType: String(tag?.tagType || "direct_content").slice(0, 40),
    source: String(tag?.source || "").slice(0, 80),
    needsReview: Boolean(tag?.needsReview),
  })).filter((tag) => tag.slug);
}

function createExcerpt(text) {
  const trimmedText = String(text || "").trim();
  return trimmedText.length > 220 ? `${trimmedText.slice(0, 220)}...` : trimmedText;
}

function buildPseudoId(recordId) {
  const seed = String(recordId || "dream")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 8)
    .toUpperCase()
    .padEnd(8, "0");

  return `DREAM-${seed}`;
}

export async function saveRecordForUser(currentUser, record) {
  if (!currentUser?.uid) {
    throw new Error("A signed-in user is required to save records.");
  }

  const recordReference = normalizeRecordReference(record);

  const savedRecordRef = doc(
    requireFirestore(),
    "users",
    currentUser.uid,
    "savedRecords",
    recordReference.recordId
  );

  await setDoc(
    savedRecordRef,
    {
      ...recordReference,
      ownerId: currentUser.uid,
      savedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function collectRecordForUser(
  currentUser,
  record,
  collectionId = "liked-dreams"
) {
  if (!currentUser?.uid) {
    throw new Error("A signed-in user is required to collect records.");
  }

  const recordReference = normalizeRecordReference(record);
  const firestore = requireFirestore();

  await setDoc(
    doc(firestore, "users", currentUser.uid, "collections", collectionId),
    {
      collectionId,
      name: collectionId === "liked-dreams" ? "Liked Dreams" : collectionId,
      ownerId: currentUser.uid,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  await setDoc(
    doc(
      firestore,
      "users",
      currentUser.uid,
      "collections",
      collectionId,
      "records",
      recordReference.recordId
    ),
    {
      ...recordReference,
      ownerId: currentUser.uid,
      collectionId,
      collectedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function removeSavedRecord(currentUser, recordId) {
  if (!currentUser?.uid || !recordId) return;

  await deleteDoc(
    doc(requireFirestore(), "users", currentUser.uid, "savedRecords", recordId)
  );
}

export async function removeCollectedRecord(
  currentUser,
  recordId,
  collectionId = "liked-dreams"
) {
  if (!currentUser?.uid || !recordId) return;

  await deleteDoc(
    doc(
      requireFirestore(),
      "users",
      currentUser.uid,
      "collections",
      collectionId,
      "records",
      recordId
    )
  );
}

export async function deleteOwnedRecord(currentUser, recordId) {
  if (!currentUser?.uid || !recordId) return;

  await deleteDoc(doc(requireFirestore(), "Records", recordId));
}

export async function updateOwnedRecordSharing(
  currentUser,
  recordId,
  updates = {},
  profile = null
) {
  if (!currentUser?.uid || !recordId) return;

  const sharingMode = normalizeSharingMode(updates.sharingMode);
  const visibility = getSharingVisibility(sharingMode);
  const isPublic = visibility === "public";
  const recordIdentityMode = getRecordIdentityForSharing(
    sharingMode,
    updates.recordIdentityMode
  );
  const includedInResearchStats = shouldIncludeInResearchStats(
    sharingMode,
    updates.includedInResearchStats
  );
  const creatorDisplayName =
    recordIdentityMode === "account"
      ? profile?.displayName || currentUser.displayName || ""
      : "";
  const creatorEmail =
    recordIdentityMode === "account" && profile?.showEmail
      ? currentUser.email || ""
      : "";

  await setDoc(
    doc(requireFirestore(), "Records", recordId),
    {
      visibility,
      isPublic,
      sharingMode,
      includedInResearchStats,
      researchConsent: includedInResearchStats,
      publicConsent: isPublic,
      recordIdentityMode,
      attributionMode: recordIdentityMode,
      creatorDisplayName,
      creatorEmail,
      sharingUpdatedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function updateOwnedRecordMetadata(currentUser, recordId, updates) {
  if (!currentUser?.uid || !recordId) return;

  const metadata = {
    updatedAt: serverTimestamp(),
  };

  if ("title" in updates || "dreamText" in updates) {
    const originalLanguage = normalizeLanguage(updates.originalLanguage || "zh");
    const dreamText = limitString(updates.dreamText || "", 120000);
    const title = normalizeOptionalTitle(updates.title, dreamText);

    if (!dreamText) {
      throw new Error("Dream text is required.");
    }

    const excerpt = createExcerpt(dreamText);

    Object.assign(
      metadata,
      {
        originalLanguage,
        originalTitle: title,
        originalText: dreamText,
        originalExcerpt: excerpt,
        title,
        dream_text: dreamText,
        excerpt,
      },
      buildOriginalLanguageFields(originalLanguage, title, dreamText, excerpt)
    );
  }

  if ("dreamDate" in updates || "dreamDateStatus" in updates) {
    const submittedDreamDate = String(updates.dreamDate || "").trim();
    const dreamDateStatus = normalizeDreamDateStatus(
      updates.dreamDateStatus,
      submittedDreamDate
    );
    const dreamDate =
      dreamDateStatus === DREAM_DATE_STATUS.KNOWN ? submittedDreamDate : "";

    metadata.dreamDate = dreamDate;
    metadata.dream_date = dreamDate;
    metadata.dreamDateStatus = dreamDateStatus;
    metadata.dream_date_status = dreamDateStatus;
  }

  if (
    "dreamTime" in updates ||
    "dreamPeriod" in updates ||
    "dreamSequence" in updates ||
    "dreamDate" in updates
  ) {
    const dreamTime = normalizeDreamTime(updates.dreamTime || updates.dream_time);
    const dreamPeriod = normalizeDreamPeriod(updates.dreamPeriod || updates.dream_period);
    const dreamSequence = normalizeDreamSequence(
      updates.dreamSequence || updates.dream_sequence
    );
    const effectiveDreamDate =
      "dreamDate" in metadata
        ? metadata.dreamDate
        : String(updates.dreamDate || "").trim();

    metadata.dreamTime = dreamTime;
    metadata.dream_time = dreamTime;
    metadata.dreamPeriod = dreamPeriod;
    metadata.dream_period = dreamPeriod;
    metadata.dreamSequence = dreamSequence;
    metadata.dream_sequence = dreamSequence;
    metadata.dreamDateTime = buildDreamDateTime(effectiveDreamDate, dreamTime);
    metadata.dream_date_time = metadata.dreamDateTime;
  }

  if ("translations" in updates || "translationVersions" in updates) {
    const originalLanguage = normalizeLanguage(updates.originalLanguage || "zh");
    const translationFields = buildRecorderTranslationFields(
      updates.translations || updates.translationVersions,
      originalLanguage,
      updates.existingTranslationLanguages
    );

    metadata.translationLanguages = translationFields.translationLanguages || [];
    metadata.translationSource =
      metadata.translationLanguages.length > 0 ? "recorder_provided" : "";

    Object.assign(metadata, translationFields);
  }

  if ("ageAtDream" in updates) {
    metadata.ageAtDream =
      updates.ageAtDream === "" || updates.ageAtDream == null
        ? ""
        : Math.max(0, Number(updates.ageAtDream));
  }

  if ("adultContent" in updates) {
    metadata.adultContent = Boolean(updates.adultContent);
    metadata.minimumViewerAge = updates.adultContent
      ? Math.max(18, Number(updates.minimumViewerAge || 18))
      : 0;
  }

  if ("recordIdentityMode" in updates) {
    const recordIdentityMode =
      updates.recordIdentityMode === "account" ? "account" : "anonymous";

    metadata.recordIdentityMode = recordIdentityMode;
    metadata.attributionMode = recordIdentityMode;
    metadata.creatorDisplayName =
      recordIdentityMode === "account" ? updates.creatorDisplayName || "" : "";
    metadata.creatorEmail =
      recordIdentityMode === "account" && updates.showEmail
        ? updates.creatorEmail || ""
        : "";
  }

  if ("selectedTagSlugs" in updates || "customTagLabels" in updates) {
    const tags = buildRecordTags(
      updates.selectedTagSlugs || [],
      updates.customTagLabels || [],
      Boolean(metadata.adultContent ?? updates.adultContent),
      updates.sharedTags || []
    );

    metadata.environmentTags = getTagSlugsByCategory(tags, "Environment");
    metadata.entityTags = getTagSlugsByCategory(tags, "Entities");
    metadata.anomalyTags = getTagSlugsByCategory(tags, "Anomalies");
    metadata.tags = tags;
    metadata.emotionTags = getTagSlugsByCategory(tags, "Emotions");
    metadata.styleTags = getTagSlugsByCategory(tags, "Styles");
    metadata.eraTags = getTagSlugsByCategory(tags, "Eras");
    metadata.weatherTags = getTagSlugsByCategory(tags, "Weather");
    metadata.dreamTypeTags = getTagSlugsByCategory(tags, "Dream Types");
    metadata.perspectiveTags = getTagSlugsByCategory(tags, "Perspective");
    metadata.psychologicalObservableTags = getTagSlugsByCategory(
      tags,
      "Psychological Observables"
    );
    metadata.dreamAnalysisTags = getTagSlugsByCategory(tags, "Dream Analysis");
    metadata.customTags = tags.filter((tag) => tag.custom).map((tag) => tag.slug);
    metadata.anomaly_tag_slugs = metadata.anomalyTags;
    metadata.signal_coherence = calculateDreamSignalCoherence({
      dreamText: existingRecord.originalText || existingRecord.dream_text || "",
      title: existingRecord.originalTitle || existingRecord.title || "",
      dreamDate: existingRecord.dreamDate || existingRecord.dream_date || "",
      dreamTime: existingRecord.dreamTime || existingRecord.dream_time || "",
      dreamPeriod: existingRecord.dreamPeriod || existingRecord.dream_period || "",
      dreamSequence: existingRecord.dreamSequence || existingRecord.dream_sequence || 1,
      ageAtDream: existingRecord.ageAtDream,
      tags,
    });
  }

  if (
    "title" in updates ||
    "dreamText" in updates ||
    "dreamDate" in updates ||
    "dreamDateStatus" in updates ||
    "dreamTime" in updates ||
    "dreamPeriod" in updates ||
    "dreamSequence" in updates ||
    "ageAtDream" in updates ||
    "selectedTagSlugs" in updates ||
    "customTagLabels" in updates
  ) {
    metadata.signal_coherence = calculateDreamSignalCoherence({
      dreamText: metadata.dream_text || updates.dreamText || "",
      title: metadata.title || updates.title || "",
      dreamDate: metadata.dreamDate || updates.dreamDate || "",
      dreamTime: metadata.dreamTime || updates.dreamTime || "",
      dreamPeriod: metadata.dreamPeriod || updates.dreamPeriod || "",
      dreamSequence: metadata.dreamSequence || updates.dreamSequence || 1,
      ageAtDream: metadata.ageAtDream ?? updates.ageAtDream,
      tags: metadata.tags || updates.tags || [],
    });
  }

  await setDoc(doc(requireFirestore(), "Records", recordId), metadata, { merge: true });

  if ("customTagLabels" in updates) {
    await upsertSharedCustomTags(currentUser, updates.customTagLabels || []).catch(
      () => {}
    );
  }
}

export async function addRecorderTranslationToRecord(currentUser, recordId, translation) {
  if (!currentUser?.uid || !recordId) return null;

  const recordRef = doc(requireFirestore(), "Records", recordId);
  const snapshot = await getDoc(recordRef);

  if (!snapshot.exists()) {
    throw new Error("The original dream record was not found.");
  }

  const existingRecord = { id: snapshot.id, ...snapshot.data() };

  if (existingRecord.ownerId !== currentUser.uid) {
    throw new Error("Only the owner can attach translation versions to this dream.");
  }

  const originalLanguage = normalizeLanguage(existingRecord.originalLanguage || "zh");
  const translationLanguage = normalizeLanguage(
    translation?.language || translation?.originalLanguage || "en"
  );

  if (translationLanguage === originalLanguage) {
    throw new Error("This language is already the original dream language.");
  }

  const dreamText = limitString(
    translation?.dreamText || translation?.originalText || translation?.text || "",
    120000
  );
  const title = limitString(translation?.title || "", 220);

  if (!dreamText && !title) {
    throw new Error("A translation version needs title or dream words.");
  }

  const excerpt = createExcerpt(dreamText || title);
  const translationLanguages = new Set(
    normalizeTranslationLanguages(existingRecord.translationLanguages)
  );
  translationLanguages.add(translationLanguage);

  const metadata = {
    ...buildOriginalLanguageFields(translationLanguage, title, dreamText, excerpt),
    translationLanguages: [...translationLanguages],
    translationSource: "recorder_provided",
    updatedAt: serverTimestamp(),
  };

  const hasAdditionalTags =
    Array.isArray(translation?.selectedTagSlugs) && translation.selectedTagSlugs.length > 0 ||
    Array.isArray(translation?.customTagLabels) && translation.customTagLabels.length > 0 ||
    Array.isArray(translation?.sharedTags) && translation.sharedTags.length > 0;

  if (hasAdditionalTags) {
    const additionalTags = buildRecordTags(
      translation.selectedTagSlugs || [],
      translation.customTagLabels || [],
      Boolean(existingRecord.adultContent),
      translation.sharedTags || []
    );
    const tags = mergeRecordTagSets(existingRecord.tags || [], additionalTags);

    metadata.tags = tags;
    metadata.environmentTags = getTagSlugsByCategory(tags, "Environment");
    metadata.entityTags = getTagSlugsByCategory(tags, "Entities");
    metadata.anomalyTags = getTagSlugsByCategory(tags, "Anomalies");
    metadata.emotionTags = getTagSlugsByCategory(tags, "Emotions");
    metadata.styleTags = getTagSlugsByCategory(tags, "Styles");
    metadata.eraTags = getTagSlugsByCategory(tags, "Eras");
    metadata.weatherTags = getTagSlugsByCategory(tags, "Weather");
    metadata.dreamTypeTags = getTagSlugsByCategory(tags, "Dream Types");
    metadata.perspectiveTags = getTagSlugsByCategory(tags, "Perspective");
    metadata.psychologicalObservableTags = getTagSlugsByCategory(
      tags,
      "Psychological Observables"
    );
    metadata.dreamAnalysisTags = getTagSlugsByCategory(tags, "Dream Analysis");
    metadata.customTags = tags.filter((tag) => tag.custom).map((tag) => tag.slug);
    metadata.anomaly_tag_slugs = metadata.anomalyTags;
  }

  await setDoc(recordRef, metadata, { merge: true });

  if (Array.isArray(translation?.customTagLabels) && translation.customTagLabels.length > 0) {
    await upsertSharedCustomTags(currentUser, translation.customTagLabels).catch(() => {});
  }

  return {
    ...existingRecord,
    ...metadata,
    id: recordId,
    updatedAt: new Date().toISOString(),
  };
}
