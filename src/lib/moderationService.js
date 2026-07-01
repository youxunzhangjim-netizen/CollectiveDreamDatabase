import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebaseClient.js";

export const MODERATION_STATUSES = [
  "pending_review",
  "approved",
  "hidden",
  "removed",
  "adult_review",
  "sensitive_review",
];

export const REPORT_REASONS = [
  "privacy",
  "harassment",
  "adult_content",
  "self_harm",
  "violence",
  "spam",
  "copyright",
  "other",
];

function requireFirestore() {
  if (!isFirebaseConfigured || !db) {
    throw new Error("Moderation tools are not available yet.");
  }

  return db;
}

export function normalizeModerationStatus(value) {
  return MODERATION_STATUSES.includes(value) ? value : "pending_review";
}

export function normalizeReportReason(value) {
  return REPORT_REASONS.includes(value) ? value : "other";
}

export function getPublicRecorderKey(record = {}) {
  return String(
    record.publicRecorderKey ||
      record.recorderPublicKey ||
      record.recorderHash ||
      record.publicRecorderId ||
      record.pseudoId ||
      record.pseudo_id ||
      record.pseudonym ||
      record.authorName ||
      record.anonymousLabel ||
      ""
  ).trim();
}

export async function hideRecordForViewer(currentUser, recordId, metadata = {}) {
  if (!currentUser?.uid || !recordId) return;

  const firestore = requireFirestore();
  const hideRef = doc(
    firestore,
    "users",
    currentUser.uid,
    "hiddenRecords",
    String(recordId)
  );

  await setDoc(
    hideRef,
    {
      ownerId: currentUser.uid,
      recordId: String(recordId),
      source: metadata.source || "manual",
      reason: normalizeReportReason(metadata.reason),
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function unhideRecordForViewer(currentUser, recordId) {
  if (!currentUser?.uid || !recordId) return;

  await deleteDoc(
    doc(requireFirestore(), "users", currentUser.uid, "hiddenRecords", String(recordId))
  );
}

export async function blockPublicRecorder(currentUser, recorderKey, metadata = {}) {
  if (!currentUser?.uid || !recorderKey) return;

  const firestore = requireFirestore();
  const safeRecorderKey = String(recorderKey).slice(0, 160);

  await setDoc(
    doc(firestore, "users", currentUser.uid, "blockedUsers", safeRecorderKey),
    {
      ownerId: currentUser.uid,
      recorderKey: safeRecorderKey,
      displayName: limitString(metadata.displayName || "", 160),
      source: metadata.source || "manual",
      reason: normalizeReportReason(metadata.reason),
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function unblockPublicRecorder(currentUser, recorderKey) {
  if (!currentUser?.uid || !recorderKey) return;

  await deleteDoc(
    doc(requireFirestore(), "users", currentUser.uid, "blockedUsers", String(recorderKey))
  );
}

export async function reportDream(currentUser, record = {}, report = {}) {
  if (!currentUser?.uid) {
    throw new Error("A signed-in or guest session is required to report content.");
  }

  const firestore = requireFirestore();
  const recordId = String(record.id || record.recordId || record.dream_id || "");

  if (!recordId) {
    throw new Error("A record id is required to report a dream.");
  }

  const reportRef = doc(collection(firestore, "ModerationReports"));
  const reason = normalizeReportReason(report.reason);
  const publicRecorderKey = getPublicRecorderKey(record);

  await setDoc(reportRef, {
    id: reportRef.id,
    reporterId: currentUser.uid,
    targetType: "dream",
    recordId,
    publicRecorderKey,
    publicTitle: limitString(
      record.publicTitle || record.originalTitle || record.title || "",
      220
    ),
    reason,
    note: limitString(report.note || "", 2000),
    status: "pending_review",
    moderationStatus: "pending_review",
    reporterAction: "hidden_from_reporter",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await hideRecordForViewer(currentUser, recordId, {
    reason,
    source: "report",
  });

  return reportRef.id;
}

export async function reportPublicRecorder(currentUser, record = {}, report = {}) {
  if (!currentUser?.uid) {
    throw new Error("A signed-in or guest session is required to report a recorder.");
  }

  const publicRecorderKey = getPublicRecorderKey(record);

  if (!publicRecorderKey) {
    throw new Error("This record does not expose a public recorder key.");
  }

  const firestore = requireFirestore();
  const reportRef = doc(collection(firestore, "ModerationReports"));
  const reason = normalizeReportReason(report.reason);

  await setDoc(reportRef, {
    id: reportRef.id,
    reporterId: currentUser.uid,
    targetType: "user",
    recordId: String(record.id || record.recordId || record.dream_id || ""),
    publicRecorderKey,
    displayName: limitString(
      record.authorName ||
        record.creatorDisplayName ||
        record.pseudonym ||
        record.anonymousLabel ||
        "",
      160
    ),
    reason,
    note: limitString(report.note || "", 2000),
    status: "pending_review",
    moderationStatus: "pending_review",
    reporterAction: "blocked_from_reporter",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await blockPublicRecorder(currentUser, publicRecorderKey, {
    reason,
    source: "report",
    displayName: record.authorName || record.creatorDisplayName || "",
  });

  return reportRef.id;
}

export async function fetchViewerModerationState(currentUser) {
  if (!currentUser?.uid) {
    return {
      hiddenRecordIds: new Set(),
      blockedRecorderKeys: new Set(),
    };
  }

  const firestore = requireFirestore();
  const [hiddenSnapshot, blockedSnapshot] = await Promise.all([
    getDocs(collection(firestore, "users", currentUser.uid, "hiddenRecords")).catch(
      () => ({ docs: [] })
    ),
    getDocs(collection(firestore, "users", currentUser.uid, "blockedUsers")).catch(
      () => ({ docs: [] })
    ),
  ]);

  return {
    hiddenRecordIds: new Set(
      hiddenSnapshot.docs
        .map((item) => item.data()?.recordId || item.id)
        .filter(Boolean)
    ),
    blockedRecorderKeys: new Set(
      blockedSnapshot.docs
        .map((item) => item.data()?.recorderKey || item.id)
        .filter(Boolean)
    ),
  };
}

export function filterRecordsForViewer(records = [], viewerState = {}) {
  const hiddenRecordIds = viewerState.hiddenRecordIds || new Set();
  const blockedRecorderKeys = viewerState.blockedRecorderKeys || new Set();

  return records.filter((record) => {
    const recordId = String(record.id || record.recordId || record.dream_id || "");
    const recorderKey = getPublicRecorderKey(record);

    return !hiddenRecordIds.has(recordId) && !blockedRecorderKeys.has(recorderKey);
  });
}

export async function fetchModerationReports({ status = "" } = {}) {
  const firestore = requireFirestore();
  const reportsRef = collection(firestore, "ModerationReports");
  const reportsQuery = status
    ? query(reportsRef, where("status", "==", status))
    : query(reportsRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(reportsQuery);

  return snapshot.docs.map((reportDoc) => ({
    id: reportDoc.id,
    ...reportDoc.data(),
  }));
}

export async function updateModerationReportStatus(reportId, updates = {}) {
  if (!reportId) return;

  const firestore = requireFirestore();
  const status = normalizeModerationStatus(updates.status);
  const patch = {
    status,
    moderationStatus: status,
    moderatorNote: limitString(updates.moderatorNote || "", 2000),
    updatedAt: serverTimestamp(),
  };

  await setDoc(doc(firestore, "ModerationReports", reportId), patch, { merge: true });

  if (updates.recordId) {
    await setDoc(
      doc(firestore, "PublicDreams", updates.recordId),
      {
        moderationStatus: status,
        moderationUpdatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }
}

function limitString(value, maxLength) {
  return String(value || "").slice(0, maxLength);
}
