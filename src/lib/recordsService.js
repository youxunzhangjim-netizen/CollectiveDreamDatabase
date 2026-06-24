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
import { LANGUAGE_OPTIONS, normalizeLanguage } from "./language.js";
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

function getTimestampMillis(value) {
  if (!value) return 0;
  if (typeof value.toMillis === "function") return value.toMillis();

  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
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
    throw new Error("A signed-in or guest session is required to publish a record.");
  }

  const dreamText = String(draft?.dreamText || draft?.originalText || "").trim();

  if (!dreamText) {
    throw new Error("Dream text is required.");
  }

  const firestore = requireFirestore();
  const recordRef = doc(collection(firestore, "Records"));
  const originalLanguage = normalizeLanguage(draft?.originalLanguage || "zh");
  const title = normalizeOptionalTitle(draft?.title, dreamText);
  const excerpt = createExcerpt(dreamText);
  const dreamDate = draft?.dreamDate || new Date().toISOString().slice(0, 10);
  const ageAtDream =
    draft?.ageAtDream === "" || draft?.ageAtDream == null
      ? ""
      : Math.max(0, Number(draft.ageAtDream));
  const adultContent = Boolean(draft?.adultContent);
  const accountBacked = !currentUser.isAnonymous;
  const recordIdentityMode =
    accountBacked && draft?.recordIdentityMode === "account"
      ? "account"
      : "anonymous";
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
    adultContent
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
  const languageFields = buildOriginalLanguageFields(
    originalLanguage,
    title,
    dreamText,
    excerpt
  );
  const translations = Object.fromEntries(
    LANGUAGE_OPTIONS.map((option) => [
      option.value,
      option.value === originalLanguage
        ? { title, excerpt, text: dreamText }
        : { title: "", excerpt: "", text: "" },
    ])
  );
  const coreRecord = {
    id: recordRef.id,
    dream_id: recordRef.id,
    ownerId: currentUser.uid,
    creatorId: currentUser.uid,
    anonymousLocked: Boolean(currentUser.isAnonymous),
    visibility: "public",
    isPublic: true,
    originalLanguage,
    originalTitle: title,
    originalText: dreamText,
    originalExcerpt: excerpt,
    title,
    dream_text: dreamText,
    excerpt,
    ...languageFields,
    translations,
    dreamDate,
    dream_date: dreamDate,
    ageAtDream: Number.isFinite(ageAtDream) ? ageAtDream : "",
    recordIdentityMode,
    attributionMode: recordIdentityMode,
    creatorDisplayName,
    creatorEmail,
    pseudoId: buildPseudoId(recordRef.id),
    adultContent,
    minimumViewerAge: adultContent ? 18 : 0,
    signal_coherence: 50,
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

  try {
    await setDoc(recordRef, optionalRecord, { merge: true });
  } catch (error) {
    metadataMergeError = {
      code: error?.code || "metadata/merge-failed",
      message: error?.message || "Record metadata merge failed.",
    };
  }

  const record = {
    ...coreRecord,
    ...optionalRecord,
    imageUploadError,
    metadataMergeError,
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
  return mapRecordSnapshot(snapshot);
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
  return mapRecordSnapshot(snapshot);
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
  const translations = normalizeRecordTranslations(record, originalLanguage);
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

  return {
    recordId,
    title: record?.title || "",
    titleZh: record?.titleZh || record?.title_zh || "",
    titleEs: record?.titleEs || record?.title_es || "",
    text: record?.dream_text || record?.text || record?.excerpt || "",
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
    images,
    dreamImages: images,
    imageUrls,
    pictureUrls: imageUrls,
    thumbnailUrl,
    thumbnail_url: thumbnailUrl,
    generated_image_url: thumbnailUrl,
    translations,
    date: record?.dream_date || record?.date || "",
    dreamDate: record?.dreamDate || record?.dream_date || record?.date || "",
    creatorId: record?.ownerId || record?.creatorId || "",
    recordIdentityMode,
    creatorDisplayName:
      recordIdentityMode === "account"
        ? record?.creatorDisplayName || record?.displayName || ""
        : "",
    creatorEmail:
      recordIdentityMode === "account" ? record?.creatorEmail || "" : "",
    pseudoId: record?.pseudo_id || record?.pseudoId || "",
    visibility: record?.visibility || (record?.isPublic === false ? "private" : "public"),
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
  };
}

function normalizeRecordTranslations(record, originalLanguage) {
  const existingTranslations =
    record?.translations && typeof record.translations === "object"
      ? record.translations
      : {};

  return Object.fromEntries(
    LANGUAGE_OPTIONS.map((option) => {
      const language = option.value;
      const existingTranslation = existingTranslations[language] || {};

      return [
        language,
        {
          title:
            existingTranslation.title ||
            getLanguageSpecificValue(record, "title", language) ||
            (language === originalLanguage
              ? record?.originalTitle || record?.original_title || ""
              : ""),
          text:
            existingTranslation.text ||
            existingTranslation.dream_text ||
            getLanguageSpecificValue(record, "text", language) ||
            (language === originalLanguage
              ? record?.originalText || record?.original_text || ""
              : ""),
          excerpt:
            existingTranslation.excerpt ||
            getLanguageSpecificValue(record, "excerpt", language),
        },
      ];
    })
  );
}

function getLanguageSpecificValue(record, field, language) {
  const normalizedLanguage = normalizeLanguage(language);
  const fields = {
    title: {
      en: ["title", "title_en", "titleEn"],
      zh: ["titleZh", "title_zh"],
      es: ["titleEs", "title_es"],
    },
    text: {
      en: ["dream_text", "text", "text_en", "textEn"],
      zh: ["dream_text_zh", "textZh", "text_zh"],
      es: ["dream_text_es", "textEs", "text_es"],
    },
    excerpt: {
      en: ["excerpt", "excerpt_en", "excerptEn"],
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

function normalizeOptionalTitle(title, dreamText) {
  const trimmedTitle = String(title || "").trim();
  const trimmedText = String(dreamText || "").trim();

  if (!trimmedTitle) return "";

  const sentenceMatch = trimmedText.match(/^(.{1,180}?[.!?。！？])(?:\s|$)/u);
  const firstSentence = sentenceMatch?.[1]?.trim() || "";

  if (firstSentence && trimmedTitle === firstSentence) return "";

  return trimmedTitle;
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

export async function updateOwnedRecordMetadata(currentUser, recordId, updates) {
  if (!currentUser?.uid || !recordId) return;

  const metadata = {
    updatedAt: serverTimestamp(),
  };

  if ("title" in updates || "dreamText" in updates) {
    const originalLanguage = normalizeLanguage(updates.originalLanguage || "zh");
    const dreamText = String(updates.dreamText || "").trim();
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
        translations: {
          [originalLanguage]: {
            title,
            excerpt,
            text: dreamText,
          },
        },
      },
      buildOriginalLanguageFields(originalLanguage, title, dreamText, excerpt)
    );
  }

  if ("dreamDate" in updates) {
    metadata.dreamDate = updates.dreamDate || "";
    metadata.dream_date = updates.dreamDate || "";
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
      Boolean(metadata.adultContent ?? updates.adultContent)
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
  }

  await setDoc(doc(requireFirestore(), "Records", recordId), metadata, { merge: true });
}
