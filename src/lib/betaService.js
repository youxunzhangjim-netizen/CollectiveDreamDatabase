import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebaseClient.js";
import { normalizeLanguage } from "./language.js";
import { normalizeSharingMode } from "./recordsService.js";

export const BETA_ACCESS_CONFIG_ID = "public";
export const BETA_APP_VERSION = "2026.phase3";

export const FEEDBACK_CATEGORIES = [
  "bug_report",
  "privacy_concern",
  "translation_issue",
  "feature_suggestion",
  "confusing_ui",
  "import_problem",
  "moderation_issue",
];

export const FEEDBACK_SEVERITIES = ["low", "medium", "high", "critical"];
export const FEEDBACK_STATUSES = ["new", "reviewing", "fixed", "closed"];

export const ANALYTICS_EVENTS = [
  "app_opened",
  "pwa_installed",
  "record_page_opened",
  "dream_saved_private",
  "dream_saved_stats_only",
  "dream_shared_anonymous",
  "dream_shared_pseudonym",
  "dream_unpublished",
  "diary_import_started",
  "diary_import_completed",
  "offline_draft_saved",
  "offline_draft_uploaded",
  "sketch_created",
  "public_archive_opened",
  "collective_patterns_opened",
  "my_dream_map_opened",
  "research_export_started",
  "report_dream_clicked",
  "block_user_clicked",
  "account_deletion_started",
  "account_deletion_completed",
];

export const BETA_CHECKLIST_ITEMS = [
  "pwa_install_verified",
  "offline_draft_verified",
  "private_dream_verified",
  "stats_only_verified",
  "public_sharing_verified",
  "report_block_verified",
  "delete_export_verified",
  "import_verified",
  "mobile_layout_verified",
  "research_export_privacy_verified",
  "translations_reviewed",
];

const SAFE_ANALYTICS_METADATA_KEYS = new Set([
  "sharingMode",
  "source",
  "status",
  "category",
  "severity",
  "count",
  "recordSource",
  "draftStatus",
  "hasSketch",
  "hasImages",
  "importedCount",
  "failedCount",
  "format",
]);

function requireFirestore() {
  if (!isFirebaseConfigured || !db) {
    throw new Error("Beta services are not available yet.");
  }

  return db;
}

export function normalizeFeedbackCategory(value) {
  return FEEDBACK_CATEGORIES.includes(value) ? value : "bug_report";
}

export function normalizeFeedbackSeverity(value) {
  return FEEDBACK_SEVERITIES.includes(value) ? value : "medium";
}

export function normalizeFeedbackStatus(value) {
  return FEEDBACK_STATUSES.includes(value) ? value : "new";
}

export function isAdminProfile(profile = {}) {
  return Boolean(profile?.isAdmin || profile?.role === "admin");
}

export function getAnonymousSessionId() {
  if (typeof window === "undefined") return "server";

  const key = "cdo_anonymous_session_id";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;

  const next =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? `anon-${crypto.randomUUID()}`
      : `anon-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  window.localStorage.setItem(key, next);
  return next;
}

export function hashIdentifier(value = "") {
  const normalized = String(value || "").trim().toLowerCase();
  let hash = 2166136261;

  for (let index = 0; index < normalized.length; index += 1) {
    hash ^= normalized.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return `h${(hash >>> 0).toString(36)}`;
}

export function normalizeInviteCode(value = "") {
  return String(value || "").trim().replace(/\s+/g, "-").toUpperCase();
}

export function normalizeBetaOnboardingChoice(value = "") {
  return ["private", "stats_only", "anonymous_public", "dream_by_dream"].includes(value)
    ? value
    : "anonymous_public";
}

export function createDefaultBetaConfig() {
  return {
    id: BETA_ACCESS_CONFIG_ID,
    enabled: false,
    allowPublicPages: true,
    onboardingVersion: BETA_APP_VERSION,
    updatedAt: "",
  };
}

export function shouldAllowBetaAccess({
  config = createDefaultBetaConfig(),
  currentUser = null,
  profile = null,
  access = null,
} = {}) {
  if (!config?.enabled) return { allowed: true, reason: "beta_disabled" };
  if (isAdminProfile(profile)) return { allowed: true, reason: "admin_bypass" };
  if (access?.granted === true) return { allowed: true, reason: access.grantSource || "granted" };
  if (profile?.betaAccessGranted === true) return { allowed: true, reason: "profile_granted" };
  if (!currentUser?.uid) return { allowed: false, reason: "sign_in_required" };

  return { allowed: false, reason: "invite_required" };
}

export async function fetchBetaConfig() {
  const firestore = requireFirestore();
  const snapshot = await getDoc(doc(firestore, "BetaConfig", BETA_ACCESS_CONFIG_ID));

  if (!snapshot.exists()) return createDefaultBetaConfig();

  return {
    ...createDefaultBetaConfig(),
    ...snapshot.data(),
    id: snapshot.id,
  };
}

export async function saveBetaConfig(currentUser, updates = {}) {
  if (!currentUser?.uid) throw new Error("An admin account is required.");

  const firestore = requireFirestore();
  await setDoc(
    doc(firestore, "BetaConfig", BETA_ACCESS_CONFIG_ID),
    {
      id: BETA_ACCESS_CONFIG_ID,
      enabled: Boolean(updates.enabled),
      allowPublicPages:
        updates.allowPublicPages === undefined ? true : Boolean(updates.allowPublicPages),
      onboardingVersion: updates.onboardingVersion || BETA_APP_VERSION,
      updatedBy: currentUser.uid,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function fetchBetaAccess(currentUser) {
  if (!currentUser?.uid) return null;

  const snapshot = await getDoc(doc(requireFirestore(), "BetaAccess", currentUser.uid));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

export async function grantAllowedEmailIfAvailable(currentUser) {
  if (!currentUser?.uid || !currentUser.email) return null;

  const firestore = requireFirestore();
  const emailHash = hashIdentifier(currentUser.email);
  const allowedSnapshot = await getDoc(doc(firestore, "BetaAllowedEmails", emailHash));

  if (!allowedSnapshot.exists() || allowedSnapshot.data()?.active === false) return null;

  const access = {
    userId: currentUser.uid,
    granted: true,
    grantSource: "allowed_email",
    emailHash,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(doc(firestore, "BetaAccess", currentUser.uid), access, { merge: true });
  return access;
}

export async function redeemBetaInviteCode(currentUser, inviteCode) {
  if (!currentUser?.uid) {
    throw new Error("Sign in before redeeming a beta invite.");
  }

  const normalizedCode = normalizeInviteCode(inviteCode);
  if (!normalizedCode) throw new Error("Enter a beta invite code.");

  const firestore = requireFirestore();
  const codeHash = hashIdentifier(normalizedCode);
  const inviteSnapshot = await getDoc(doc(firestore, "BetaInviteCodes", codeHash));

  if (!inviteSnapshot.exists() || inviteSnapshot.data()?.active === false) {
    throw new Error("This beta invite code is not active.");
  }

  const access = {
    userId: currentUser.uid,
    granted: true,
    grantSource: "invite_code",
    codeHash,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(doc(firestore, "BetaAccess", currentUser.uid), access, { merge: true });
  return access;
}

export async function fetchBetaState(currentUser, profile = null) {
  if (!isFirebaseConfigured || !db) {
    return {
      config: createDefaultBetaConfig(),
      access: null,
      allowed: true,
      reason: "not_configured",
    };
  }

  const config = await fetchBetaConfig().catch(() => createDefaultBetaConfig());
  let access = await fetchBetaAccess(currentUser).catch(() => null);

  if (!access && currentUser?.email) {
    access = await grantAllowedEmailIfAvailable(currentUser).catch(() => null);
  }

  return {
    config,
    access,
    ...shouldAllowBetaAccess({ config, currentUser, profile, access }),
  };
}

export async function createBetaInviteCode(currentUser, inviteCode, metadata = {}) {
  const normalizedCode = normalizeInviteCode(inviteCode);
  if (!normalizedCode) throw new Error("Invite code is required.");

  const codeHash = hashIdentifier(normalizedCode);

  await setDoc(
    doc(requireFirestore(), "BetaInviteCodes", codeHash),
    {
      codeHash,
      active: metadata.active !== false,
      label: String(metadata.label || "").slice(0, 120),
      createdBy: currentUser?.uid || "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return { codeHash };
}

export async function addBetaAllowedEmail(currentUser, email) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    throw new Error("Email is required.");
  }

  const emailHash = hashIdentifier(normalizedEmail);

  await setDoc(
    doc(requireFirestore(), "BetaAllowedEmails", emailHash),
    {
      emailHash,
      active: true,
      createdBy: currentUser?.uid || "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return { emailHash };
}

export async function markBetaOnboardingComplete(
  currentUser,
  choice = "anonymous_public",
  version = BETA_APP_VERSION
) {
  if (!currentUser?.uid) return;

  const betaOnboardingChoice = normalizeBetaOnboardingChoice(choice);

  await setDoc(
    doc(requireFirestore(), "users", currentUser.uid),
    {
      uid: currentUser.uid,
      betaOnboardingCompleted: true,
      betaOnboardingVersion: version,
      privacySettings: {
        betaOnboardingChoice,
        betaOnboardingCompleted: true,
        betaOnboardingVersion: version,
      },
      betaOnboardingCompletedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export function getDeviceType() {
  if (typeof navigator === "undefined") return "server";
  const ua = navigator.userAgent || "";
  if (/ipad|tablet|kindle/i.test(ua)) return "tablet";
  if (/mobi|android|iphone|ipod/i.test(ua)) return "mobile";
  return "desktop";
}

export function isPwaStandalone() {
  if (typeof window === "undefined") return false;
  return Boolean(
    window.matchMedia?.("(display-mode: standalone)")?.matches ||
      window.navigator?.standalone
  );
}

export function getBrowserInfo() {
  if (typeof navigator === "undefined") return "server";
  return String(navigator.userAgent || "").slice(0, 240);
}

export function getCurrentRoute() {
  if (typeof window === "undefined") return "/";
  return `${window.location.pathname || "/"}${window.location.hash || ""}`.slice(0, 200);
}

export function sanitizeAnalyticsMetadata(metadata = {}) {
  const safe = {};

  Object.entries(metadata || {}).forEach(([key, value]) => {
    if (!SAFE_ANALYTICS_METADATA_KEYS.has(key)) return;
    if (value == null) return;

    if (typeof value === "boolean") {
      safe[key] = value;
    } else if (typeof value === "number") {
      safe[key] = Math.max(0, Math.min(1000000, value));
    } else {
      safe[key] = String(value).slice(0, 120);
    }
  });

  return safe;
}

export async function trackSafeAnalyticsEvent(eventName, options = {}) {
  if (!ANALYTICS_EVENTS.includes(eventName)) return null;
  if (!isFirebaseConfigured || !db) return null;

  const firestore = requireFirestore();
  const currentUser = options.currentUser || null;
  const sessionId = options.sessionId || getAnonymousSessionId();
  const eventRef = doc(collection(firestore, "ProductAnalytics"));
  const payload = {
    id: eventRef.id,
    eventName,
    userIdHash: currentUser?.uid ? hashIdentifier(currentUser.uid) : "",
    anonymousSessionId: currentUser?.uid ? "" : hashIdentifier(sessionId),
    timestamp: serverTimestamp(),
    route: String(options.route || getCurrentRoute()).slice(0, 200),
    language: normalizeLanguage(options.language || "zh"),
    deviceType: options.deviceType || getDeviceType(),
    browserInfo: String(options.browserInfo || getBrowserInfo()).slice(0, 240),
    pwaStandalone: Boolean(options.pwaStandalone ?? isPwaStandalone()),
    appVersion: BETA_APP_VERSION,
    metadata: sanitizeAnalyticsMetadata(options.metadata || {}),
  };

  await setDoc(eventRef, payload).catch(() => {});
  return payload;
}

export async function submitFeedback({
  currentUser = null,
  language = "zh",
  category = "bug_report",
  severity = "medium",
  message = "",
  screenshotUrl = "",
  allowSupportAccess = false,
  pageRoute = "",
} = {}) {
  const text = String(message || "").trim();
  if (text.length < 4) throw new Error("Feedback message is too short.");

  const firestore = requireFirestore();
  const feedbackRef = doc(collection(firestore, "Feedback"));
  const payload = {
    feedbackId: feedbackRef.id,
    userId: currentUser?.uid || "anonymous",
    userIdHash: currentUser?.uid ? hashIdentifier(currentUser.uid) : "",
    pageRoute: String(pageRoute || getCurrentRoute()).slice(0, 200),
    language: normalizeLanguage(language),
    deviceType: getDeviceType(),
    browserInfo: getBrowserInfo(),
    pwaStandalone: isPwaStandalone(),
    category: normalizeFeedbackCategory(category),
    severity: normalizeFeedbackSeverity(severity),
    message: text.slice(0, 4000),
    screenshotUrl: String(screenshotUrl || "").slice(0, 1200),
    screenshotPrivate: Boolean(screenshotUrl) && !allowSupportAccess,
    allowSupportAccess: Boolean(allowSupportAccess),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    status: "new",
  };

  await setDoc(feedbackRef, payload);

  return payload;
}

export async function fetchFeedbackItems(filters = {}) {
  const firestore = requireFirestore();
  let feedbackQuery = query(collection(firestore, "Feedback"), orderBy("createdAt", "desc"), limit(100));

  if (filters.status && FEEDBACK_STATUSES.includes(filters.status)) {
    feedbackQuery = query(collection(firestore, "Feedback"), where("status", "==", filters.status), limit(100));
  }

  const snapshot = await getDocs(feedbackQuery);
  return snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }))
    .filter((item) =>
      (!filters.category || item.category === filters.category) &&
      (!filters.severity || item.severity === filters.severity)
    )
    .sort((a, b) => getTimestampMillis(b.createdAt) - getTimestampMillis(a.createdAt));
}

export async function updateFeedbackStatus(feedbackId, updates = {}) {
  if (!feedbackId) return;

  const patch = {
    status: normalizeFeedbackStatus(updates.status),
    internalNotes: String(updates.internalNotes || "").slice(0, 2000),
    updatedAt: serverTimestamp(),
  };

  await updateDoc(doc(requireFirestore(), "Feedback", feedbackId), patch);
}

export async function fetchBetaChecklist() {
  const snapshot = await getDocs(collection(requireFirestore(), "BetaChecklist"));
  const docs = Object.fromEntries(snapshot.docs.map((item) => [item.id, item.data()]));

  return BETA_CHECKLIST_ITEMS.map((id) => ({
    id,
    status: docs[id]?.status || "not_started",
    notes: docs[id]?.notes || "",
    updatedAt: docs[id]?.updatedAt || "",
  }));
}

export async function updateBetaChecklistItem(currentUser, itemId, updates = {}) {
  if (!BETA_CHECKLIST_ITEMS.includes(itemId)) return;

  await setDoc(
    doc(requireFirestore(), "BetaChecklist", itemId),
    {
      id: itemId,
      status: ["not_started", "in_progress", "verified", "blocked"].includes(updates.status)
        ? updates.status
        : "not_started",
      notes: String(updates.notes || "").slice(0, 1000),
      updatedBy: currentUser?.uid || "",
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function fetchBetaDashboardStats() {
  const firestore = requireFirestore();
  const [
    usersSnapshot,
    recordsSnapshot,
    publicSnapshot,
    signalsSnapshot,
    importSnapshot,
    feedbackSnapshot,
    reportsSnapshot,
    deletionsSnapshot,
    analyticsSnapshot,
  ] = await Promise.all([
    getDocs(collection(firestore, "users")),
    getDocs(collection(firestore, "Records")),
    getDocs(collection(firestore, "PublicDreams")),
    getDocs(collection(firestore, "ResearchSignals")),
    getDocs(collection(firestore, "ImportBatches")).catch(() => ({ docs: [] })),
    getDocs(collection(firestore, "Feedback")).catch(() => ({ docs: [] })),
    getDocs(collection(firestore, "ModerationReports")).catch(() => ({ docs: [] })),
    getDocs(collection(firestore, "AccountDeletionRequests")).catch(() => ({ docs: [] })),
    getDocs(query(collection(firestore, "ProductAnalytics"), limit(500))).catch(() => ({ docs: [] })),
  ]);

  const records = recordsSnapshot.docs.map((item) => item.data());
  const feedback = feedbackSnapshot.docs.map((item) => item.data());
  const reports = reportsSnapshot.docs.map((item) => item.data());
  const analytics = analyticsSnapshot.docs.map((item) => item.data());
  const sharingCounts = countBy(records, (record) => normalizeSharingMode(record.sharingMode));

  return {
    totalBetaUsers: usersSnapshot.size,
    activeUsers: new Set(
      analytics
        .map((event) => event.userIdHash || event.anonymousSessionId)
        .filter(Boolean)
    ).size,
    dreamsRecorded: recordsSnapshot.size,
    dreamsPrivate: sharingCounts.private || 0,
    dreamsStatsOnly: sharingCounts.stats_only || 0,
    dreamsPublic: publicSnapshot.size,
    diaryImportsCompleted: importSnapshot.docs.filter((item) => {
      const data = item.data();
      return Number(data.importedCount || data.importedRecordCount || 0) > 0;
    }).length,
    offlineDraftsUploaded: analytics.filter((event) => event.eventName === "offline_draft_uploaded").length,
    feedbackCount: feedbackSnapshot.size,
    openCriticalBugs: feedback.filter(
      (item) => item.status !== "closed" && item.status !== "fixed" && item.severity === "critical"
    ).length,
    reportsSubmitted: reportsSnapshot.size,
    moderationQueueSize: reports.filter(
      (item) => item.status === "pending_review" || item.status === "new"
    ).length,
    accountDeletionsTested: deletionsSnapshot.size,
    deviceTypes: countBy(analytics, (event) => event.deviceType || "unknown"),
    browserTypes: countBy(analytics, (event) => getBrowserFamily(event.browserInfo)),
    publicDreams: publicSnapshot.size,
    researchSignals: signalsSnapshot.size,
  };
}

function getBrowserFamily(browserInfo = "") {
  const info = String(browserInfo || "");
  if (/edg/i.test(info)) return "edge";
  if (/chrome|crios/i.test(info)) return "chrome";
  if (/safari/i.test(info)) return "safari";
  if (/firefox|fxios/i.test(info)) return "firefox";
  return "other";
}

function countBy(items = [], getter = () => "") {
  return items.reduce((counts, item) => {
    const key = getter(item) || "unknown";
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
}

function getTimestampMillis(value) {
  if (!value) return 0;
  if (typeof value.toMillis === "function") return value.toMillis();
  if (Number.isFinite(value.seconds)) return value.seconds * 1000;

  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}
