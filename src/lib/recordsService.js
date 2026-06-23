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
import { LANGUAGE_OPTIONS, normalizeLanguage } from "./language.js";

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

const RECORD_TAGS = {
  awe: {
    id: "emotion-awe",
    category: "Emotions",
    name: "Awe",
    name_zh: "敬畏",
    name_es: "Asombro",
    slug: "awe",
  },
  fear: {
    id: "emotion-fear",
    category: "Emotions",
    name: "Fear",
    name_zh: "恐懼",
    name_es: "Miedo",
    slug: "fear",
  },
  calm: {
    id: "emotion-calm",
    category: "Emotions",
    name: "Calm",
    name_zh: "平靜",
    name_es: "Calma",
    slug: "calm",
  },
  grief: {
    id: "emotion-grief",
    category: "Emotions",
    name: "Grief",
    name_zh: "悲傷",
    name_es: "Duelo",
    slug: "grief",
  },
  desire: {
    id: "emotion-desire",
    category: "Emotions",
    name: "Desire",
    name_zh: "渴望",
    name_es: "Deseo",
    slug: "desire",
  },
  confusion: {
    id: "emotion-confusion",
    category: "Emotions",
    name: "Confusion",
    name_zh: "困惑",
    name_es: "Confusion",
    slug: "confusion",
  },
  "adult-content": {
    id: "content-adult",
    category: "Content",
    name: "Adult content",
    name_zh: "成人內容",
    name_es: "Contenido adulto",
    slug: "adult-content",
  },
};

export async function fetchOwnedRecords(currentUser) {
  if (!currentUser?.uid) return [];

  const recordsQuery = query(
    collection(requireFirestore(), "Records"),
    where("ownerId", "==", currentUser.uid)
  );

  const snapshot = await getDocs(recordsQuery);
  return mapRecordSnapshot(snapshot);
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
  const title =
    String(draft?.title || "").trim() ||
    createTitleFromDreamText(dreamText, originalLanguage);
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
      ? profile?.displayName || currentUser.displayName || currentUser.email || ""
      : "";
  const creatorAvatarUrl =
    recordIdentityMode === "account"
      ? profile?.avatarUrl || currentUser.photoURL || ""
      : "";
  const emotionTags = Array.isArray(draft?.emotionTags)
    ? draft.emotionTags.filter((tag) => RECORD_TAGS[tag])
    : [];
  const tagSlugs = adultContent
    ? [...new Set([...emotionTags, "adult-content"])]
    : [...new Set(emotionTags)];
  const tags = tagSlugs.map((slug) => RECORD_TAGS[slug]).filter(Boolean);
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

  const record = {
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
    creatorAvatarUrl,
    pseudoId: buildPseudoId(recordRef.id),
    adultContent,
    minimumViewerAge: adultContent ? 18 : 0,
    emotionTags,
    tags,
    anomaly_tag_slugs: tags
      .filter((tag) => tag.category === "Anomalies")
      .map((tag) => tag.slug),
    signal_coherence: 50,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(recordRef, record);

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
    translations,
    date: record?.dream_date || record?.date || "",
    dreamDate: record?.dreamDate || record?.dream_date || record?.date || "",
    creatorId: record?.ownerId || record?.creatorId || "",
    recordIdentityMode,
    creatorDisplayName:
      recordIdentityMode === "account"
        ? record?.creatorDisplayName || record?.displayName || ""
        : "",
    creatorAvatarUrl:
      recordIdentityMode === "account"
        ? record?.creatorAvatarUrl || record?.avatarUrl || ""
        : "",
    pseudoId: record?.pseudo_id || record?.pseudoId || "",
    visibility: record?.visibility || (record?.isPublic === false ? "private" : "public"),
    adultContent,
    anonymousLocked: Boolean(record?.anonymousLocked),
    minimumViewerAge:
      record?.minimumViewerAge ||
      record?.minimum_viewer_age ||
      (adultContent ? 18 : 0),
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

function createTitleFromDreamText(text, language) {
  const trimmedText = String(text || "").replace(/\s+/g, " ").trim();

  if (!trimmedText) {
    if (language === "zh") return "未命名夢境";
    if (language === "es") return "Sueño sin título";
    return "Untitled Dream";
  }

  return trimmedText.length > 42 ? `${trimmedText.slice(0, 42)}...` : trimmedText;
}

function createExcerpt(text) {
  const trimmedText = String(text || "").trim();
  return trimmedText.length > 220 ? `${trimmedText.slice(0, 220)}...` : trimmedText;
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
    metadata.creatorAvatarUrl =
      recordIdentityMode === "account" ? updates.creatorAvatarUrl || "" : "";
  }

  await setDoc(doc(requireFirestore(), "Records", recordId), metadata, { merge: true });
}
