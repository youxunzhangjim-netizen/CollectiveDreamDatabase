import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { deleteCurrentAccount } from "./authService.js";
import { db, isFirebaseConfigured } from "./firebaseClient.js";
import {
  deleteOwnedRecord,
  fetchOwnedRecords,
  logConsentEvent,
} from "./recordsService.js";
import { clearOfflineDreamDrafts } from "./offlineDreamDraftService.js";

function requireFirestore() {
  if (!isFirebaseConfigured || !db) {
    throw new Error("Account data tools are not available yet.");
  }

  return db;
}

export async function fetchConsentHistory(currentUser) {
  if (!currentUser?.uid) return [];

  const firestore = requireFirestore();
  const snapshot = await getDocs(
    query(collection(firestore, "ConsentEvents"), where("ownerId", "==", currentUser.uid))
  );

  return snapshot.docs
    .map((eventDoc) => ({ id: eventDoc.id, ...eventDoc.data() }))
    .sort((a, b) => getTimestampMillis(b.createdAt) - getTimestampMillis(a.createdAt));
}

export async function deleteAllOwnedDreams(currentUser) {
  if (!currentUser?.uid) return { deletedCount: 0, failedCount: 0 };

  const records = await fetchOwnedRecords(currentUser);
  const results = await Promise.allSettled(
    records.map((record) => deleteOwnedRecord(currentUser, record.id || record.dream_id))
  );
  const deletedCount = results.filter((result) => result.status === "fulfilled").length;
  const failedCount = results.length - deletedCount;

  await logConsentEvent(currentUser, {
    type: "data_rights_delete_all_dreams",
    action: "delete_all_dreams",
    deletedCount,
    failedCount,
    source: "account_dashboard",
  }).catch(() => {});

  return { deletedCount, failedCount };
}

export async function clearLocalDraftsForAccount(currentUser) {
  await clearOfflineDreamDrafts({ ownerId: currentUser?.uid || "" });

  if (currentUser?.uid) {
    await logConsentEvent(currentUser, {
      type: "data_rights_clear_local_drafts",
      action: "clear_local_offline_drafts",
      source: "account_dashboard",
    }).catch(() => {});
  }
}

export async function requestAccountDeletion(currentUser, note = "") {
  if (!currentUser?.uid) return null;

  const firestore = requireFirestore();
  const requestRef = doc(collection(firestore, "AccountDeletionRequests"));

  await setDoc(requestRef, {
    id: requestRef.id,
    ownerId: currentUser.uid,
    userId: currentUser.uid,
    email: currentUser.email || "",
    status: "requested",
    note: String(note || "").slice(0, 2000),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return requestRef.id;
}

export async function deleteAccountAndData(currentUser) {
  if (!currentUser?.uid) {
    throw new Error("A signed-in account is required to delete account data.");
  }

  const firestore = requireFirestore();
  const deletionRequestId = await requestAccountDeletion(
    currentUser,
    "User initiated account deletion from the dashboard."
  );
  const dreamResult = await deleteAllOwnedDreams(currentUser);

  await cleanupKnownUserSubcollections(currentUser);
  await deleteDoc(doc(firestore, "users", currentUser.uid)).catch(() => {});

  try {
    await deleteCurrentAccount(currentUser);
    if (deletionRequestId) {
      await setDoc(
        doc(firestore, "AccountDeletionRequests", deletionRequestId),
        {
          status: "completed",
          dreamDeletion: dreamResult,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      ).catch(() => {});
    }
  } catch (error) {
    if (deletionRequestId) {
      await setDoc(
        doc(firestore, "AccountDeletionRequests", deletionRequestId),
        {
          status: "requires_recent_login",
          dreamDeletion: dreamResult,
          authDeletionError: error?.code || error?.message || "auth_delete_failed",
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      ).catch(() => {});
    }

    throw error;
  }

  return {
    deletionRequestId,
    ...dreamResult,
  };
}

async function cleanupKnownUserSubcollections(currentUser) {
  const firestore = requireFirestore();
  const uid = currentUser.uid;

  await Promise.allSettled([
    deleteSubcollection(collection(firestore, "users", uid, "savedRecords")),
    deleteSubcollection(collection(firestore, "users", uid, "following")),
    deleteSubcollection(collection(firestore, "users", uid, "hiddenRecords")),
    deleteSubcollection(collection(firestore, "users", uid, "blockedUsers")),
    deleteSubcollection(collection(firestore, "users", uid, "collections", "liked-dreams", "records")),
  ]);
}

async function deleteSubcollection(collectionRef) {
  const snapshot = await getDocs(collectionRef).catch(() => ({ docs: [] }));
  await Promise.allSettled(snapshot.docs.map((item) => deleteDoc(item.ref)));
}

function getTimestampMillis(value) {
  if (!value) return 0;
  if (typeof value.toMillis === "function") return value.toMillis();
  if (Number.isFinite(value.seconds)) return value.seconds * 1000;

  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}
