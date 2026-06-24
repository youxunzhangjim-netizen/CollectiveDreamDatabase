import {
  collection,
  doc,
  getDocs,
  increment,
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

  const writes = [...normalizedEntries.values()].map((entry) => {
    const tagData = normalizeSharedTag({
      slug: entry.slug,
      category: entry.category,
      name: entry.label,
      name_zh: entry.label,
      name_es: entry.label,
    });

    if (!tagData) return null;

    return setDoc(
      doc(db, CUSTOM_TAGS_COLLECTION, tagData.slug),
      {
        ...tagData,
        status: "active",
        createdBy: currentUser.uid,
        updatedBy: currentUser.uid,
        lastUsedBy: currentUser.uid,
        updatedAt: serverTimestamp(),
        lastUsedAt: serverTimestamp(),
        usageCount: increment(1),
      },
      { merge: true }
    ).then(() => tagData);
  });

  return Promise.all(writes.filter(Boolean));
}
