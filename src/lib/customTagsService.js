import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebaseClient.js";
import {
  makeSharedTagSlug,
  normalizeCustomTagEntry,
  normalizeSharedTag,
} from "./tagTaxonomy.js";

const CUSTOM_TAGS_COLLECTION = "customTags";

export async function fetchSharedCustomTags() {
  if (!isFirebaseConfigured || !db) return [];

  const snapshot = await getDocs(collection(db, CUSTOM_TAGS_COLLECTION));

  return snapshot.docs
    .map((tagDoc) =>
      normalizeSharedTag({
        id: tagDoc.id,
        ...tagDoc.data(),
      })
    )
    .filter(Boolean);
}

export async function upsertSharedCustomTags(currentUser, customTagEntries = []) {
  if (!isFirebaseConfigured || !db || !currentUser?.uid) return [];

  const normalizedEntries = new Map();

  customTagEntries.forEach((entry) => {
    const normalizedEntry = normalizeCustomTagEntry(entry);
    if (!normalizedEntry.label) return;

    const slug = makeSharedTagSlug(normalizedEntry.category, normalizedEntry.label);
    normalizedEntries.set(slug, {
      ...normalizedEntry,
      slug,
    });
  });

  const writes = [...normalizedEntries.values()].map(async (entry) => {
    const tagRef = doc(db, CUSTOM_TAGS_COLLECTION, entry.slug);
    const existingSnapshot = await getDoc(tagRef);
    const existingTag = existingSnapshot.exists()
      ? normalizeSharedTag({
          id: existingSnapshot.id,
          ...existingSnapshot.data(),
        })
      : null;
    const incomingTag = normalizeSharedTag({
      slug: entry.slug,
      category: entry.category,
      name: entry.originalLabel,
      name_en: entry.nameEn,
      name_zh: entry.nameZh,
      name_es: entry.nameEs,
      originalLabel: entry.originalLabel,
      originalLanguage: entry.originalLanguage,
    });

    if (!incomingTag) return null;

    const tagData = normalizeSharedTag({
      ...incomingTag,
      name: existingTag?.name || incomingTag.name,
      name_en: existingTag?.name_en || incomingTag.name_en,
      name_zh: existingTag?.name_zh || incomingTag.name_zh,
      name_es: existingTag?.name_es || incomingTag.name_es,
      originalLabel: existingTag?.originalLabel || incomingTag.originalLabel,
      originalLanguage:
        existingTag?.originalLanguage || incomingTag.originalLanguage,
    });

    return setDoc(
      tagRef,
      {
        ...tagData,
        status: "active",
        ...(existingSnapshot.exists() ? {} : { createdBy: currentUser.uid }),
        updatedBy: currentUser.uid,
        lastUsedBy: currentUser.uid,
        updatedAt: serverTimestamp(),
        lastUsedAt: serverTimestamp(),
      },
      { merge: true }
    ).then(() => tagData);
  });

  return Promise.all(writes.filter(Boolean));
}
