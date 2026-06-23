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

export async function fetchOwnedRecords(currentUser) {
  if (!currentUser?.uid) return [];

  const recordsQuery = query(
    collection(requireFirestore(), "Records"),
    where("ownerId", "==", currentUser.uid)
  );

  const snapshot = await getDocs(recordsQuery);
  return mapRecordSnapshot(snapshot);
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
