import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  ANALYTICS_EVENTS,
  FEEDBACK_CATEGORIES,
  FEEDBACK_SEVERITIES,
  FEEDBACK_STATUSES,
  normalizeBetaOnboardingChoice,
  normalizeInviteCode,
  sanitizeAnalyticsMetadata,
  shouldAllowBetaAccess,
} from "../src/lib/betaService.js";
import {
  buildPublicDreamDocument,
  buildResearchSignalDocument,
  DREAM_SHARING_MODES,
} from "../src/lib/recordsService.js";

function readText(file) {
  return readFileSync(file, "utf8");
}

const appSource = readText("src/App.jsx");
const betaServiceSource = readText("src/lib/betaService.js");
const betaGateSource = readText("src/components/BetaGate.jsx");
const onboardingSource = readText("src/components/BetaOnboarding.jsx");
const feedbackSource = readText("src/components/FeedbackWidget.jsx");
const betaAdminSource = readText("src/components/BetaAdminPanel.jsx");
const dashboardSource = readText("src/components/UserDashboard.jsx");
const recordSource = readText("src/components/RecordDreamPage.jsx");
const detailSource = readText("src/components/DreamRecordPage.jsx");
const archiveSource = readText("src/components/CollectiveDreamDashboard.jsx");
const pwaSource = readText("src/components/PWAInstallPrompt.jsx");
const rulesSource = readText("firestore.rules");

assert.equal(normalizeInviteCode(" dream obs 001 "), "DREAM-OBS-001");
assert.equal(normalizeBetaOnboardingChoice("stats_only"), "stats_only");
assert.equal(normalizeBetaOnboardingChoice("bad-value"), "anonymous_public");
assert.equal(shouldAllowBetaAccess({ config: { enabled: false } }).allowed, true);
assert.equal(
  shouldAllowBetaAccess({
    config: { enabled: true },
    profile: { isAdmin: true },
  }).reason,
  "admin_bypass"
);
assert.equal(
  shouldAllowBetaAccess({
    config: { enabled: true },
    currentUser: { uid: "tester" },
    access: { granted: true, grantSource: "invite_code" },
  }).allowed,
  true
);
assert.equal(
  shouldAllowBetaAccess({
    config: { enabled: true },
    currentUser: { uid: "tester" },
  }).reason,
  "invite_required"
);

const sanitized = sanitizeAnalyticsMetadata({
  sharingMode: "stats_only",
  count: 132,
  dreamText: "private dream text",
  privateTitle: "private title",
  storagePath: "private/path",
  format: "csv",
});

assert.deepEqual(sanitized, {
  sharingMode: "stats_only",
  count: 132,
  format: "csv",
});

assert.ok(FEEDBACK_CATEGORIES.includes("privacy_concern"));
assert.ok(FEEDBACK_SEVERITIES.includes("critical"));
assert.ok(FEEDBACK_STATUSES.includes("fixed"));
assert.ok(ANALYTICS_EVENTS.includes("offline_draft_uploaded"));
assert.ok(ANALYTICS_EVENTS.includes("account_deletion_completed"));

assert.ok(appSource.includes("BetaGate"));
assert.ok(appSource.includes("BetaOnboarding"));
assert.ok(appSource.includes("FeedbackWidget"));
assert.ok(appSource.includes("fetchBetaState"));
assert.ok(appSource.includes("activeView !== \"legal\""));
assert.ok(appSource.includes("activeView !== \"auth\""));
assert.ok(appSource.includes("dream_saved_stats_only"));
assert.ok(appSource.includes("diary_import_completed"));

assert.ok(betaServiceSource.includes("BetaConfig"));
assert.ok(betaServiceSource.includes("BetaInviteCodes"));
assert.ok(betaServiceSource.includes("BetaAllowedEmails"));
assert.ok(betaServiceSource.includes("BetaAccess"));
assert.ok(betaServiceSource.includes("Feedback"));
assert.ok(betaServiceSource.includes("ProductAnalytics"));
assert.ok(betaServiceSource.includes("BETA_CHECKLIST_ITEMS"));
assert.ok(betaServiceSource.includes("fetchBetaDashboardStats"));
assert.ok(betaServiceSource.includes("privacySettings"));
assert.ok(betaServiceSource.includes("betaOnboardingChoice"));

assert.ok(betaGateSource.includes("redeemBetaInviteCode"));
assert.ok(betaGateSource.includes("Collective Dream Observatory is in invite-only beta"));
assert.ok(betaGateSource.includes("集體夢境觀測站目前為邀請制測試"));
assert.ok(betaGateSource.includes("beta con invitación"));
assert.ok(betaGateSource.includes("sm:"));
assert.ok(betaGateSource.includes("/privacy"));
assert.ok(betaGateSource.includes("/support"));

assert.ok(onboardingSource.includes("Choose how your dreams can contribute"));
assert.ok(onboardingSource.includes("你不需要公開夢境文字"));
assert.ok(onboardingSource.includes("No necesitas publicar"));
assert.ok(onboardingSource.includes("markBetaOnboardingComplete"));
assert.ok(onboardingSource.includes("sm:grid-cols-3"));

assert.ok(feedbackSource.includes("submitFeedback"));
assert.ok(feedbackSource.includes("privacy concerns"));
assert.ok(feedbackSource.includes("translation issues"));
assert.ok(feedbackSource.includes("Please avoid pasting private dream text"));
assert.ok(feedbackSource.includes("fixed bottom-"));
assert.ok(feedbackSource.includes("sm:items-center"));

assert.ok(betaAdminSource.includes("fetchBetaDashboardStats"));
assert.ok(betaAdminSource.includes("fetchFeedbackItems"));
assert.ok(betaAdminSource.includes("updateFeedbackStatus"));
assert.ok(betaAdminSource.includes("updateBetaChecklistItem"));
assert.ok(betaAdminSource.includes("isAdminProfile"));
assert.ok(betaAdminSource.includes("lg:flex-row"));
assert.ok(betaAdminSource.includes("sm:grid-cols-2"));
assert.ok(betaAdminSource.includes("deviceTypes"));
assert.ok(betaAdminSource.includes("browserTypes"));

assert.ok(dashboardSource.includes("BetaAdminPanel"));
assert.ok(dashboardSource.includes("research_export_started"));
assert.ok(recordSource.includes("offline_draft_saved"));
assert.ok(recordSource.includes("offline_draft_uploaded"));
assert.ok(recordSource.includes("currentUser={currentUser}"));
assert.ok(detailSource.includes("report_dream_clicked"));
assert.ok(detailSource.includes("block_user_clicked"));
assert.ok(archiveSource.includes("report_dream_clicked"));
assert.ok(pwaSource.includes("pwa_installed"));

assert.ok(rulesSource.includes("match /BetaConfig/{configId}"));
assert.ok(rulesSource.includes("match /BetaInviteCodes/{codeHash}"));
assert.ok(rulesSource.includes("match /BetaAllowedEmails/{emailHash}"));
assert.ok(rulesSource.includes("match /BetaAccess/{userId}"));
assert.ok(rulesSource.includes("match /Feedback/{feedbackId}"));
assert.ok(rulesSource.includes("match /ProductAnalytics/{eventId}"));
assert.ok(rulesSource.includes("match /BetaChecklist/{itemId}"));
assert.ok(rulesSource.includes("allow read: if isAdmin()"));
assert.ok(rulesSource.includes("validAnalyticsData"));
assert.ok(rulesSource.includes("noForbiddenSupportOrAnalyticsFields"));
assert.ok(rulesSource.includes("dreamText"));

const statsOnlyDream = {
  id: "beta-stats-only",
  dream_id: "beta-stats-only",
  ownerId: "owner-beta",
  originalLanguage: "en",
  language: "en",
  dream_text: "This private dream text must not leak.",
  title: "Private beta title",
  tags: [{ slug: "fear", category: "Emotions" }],
  publicConsent: false,
  researchConsent: true,
  includedInResearchStats: true,
  isPublic: false,
  visibility: "private",
  sharingMode: DREAM_SHARING_MODES.STATS_ONLY,
};

const statsOnlySignal = buildResearchSignalDocument(
  statsOnlyDream,
  DREAM_SHARING_MODES.STATS_ONLY,
  "owner-beta"
);
const statsOnlyPublic = buildPublicDreamDocument(
  statsOnlyDream,
  {},
  DREAM_SHARING_MODES.STATS_ONLY
);

assert.ok(statsOnlySignal);
assert.equal(statsOnlyPublic, null);
assert.equal(JSON.stringify(statsOnlySignal).includes(statsOnlyDream.dream_text), false);
assert.equal(JSON.stringify(statsOnlySignal).includes(statsOnlyDream.title), false);
assert.equal("ownerId" in statsOnlySignal, false);
assert.equal("publicText" in statsOnlySignal, false);

console.log("phase 3 closed beta readiness tests passed");
