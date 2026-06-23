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

function requireFirestore() {
  if (!isFirebaseConfigured || !db) {
    throw new Error("Firestore is not configured. Add VITE_FIREBASE_* values first.");
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

  return {
    recordId,
    title: record?.title || "",
    titleZh: record?.titleZh || record?.title_zh || "",
    titleEs: record?.titleEs || record?.title_es || "",
    text: record?.dream_text || record?.text || record?.excerpt || "",
    textZh: record?.dream_text_zh || record?.textZh || record?.excerpt_zh || "",
    textEs: record?.dream_text_es || record?.textEs || record?.excerpt_es || "",
    date: record?.dream_date || record?.date || "",
    dreamDate: record?.dreamDate || record?.dream_date || record?.date || "",
    creatorId: record?.ownerId || record?.creatorId || "",
    pseudoId: record?.pseudo_id || record?.pseudoId || "",
    visibility: record?.visibility || (record?.isPublic === false ? "private" : "public"),
  };
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

  await setDoc(doc(requireFirestore(), "Records", recordId), metadata, { merge: true });
}
