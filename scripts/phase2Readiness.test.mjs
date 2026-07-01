import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  buildPublicDreamDocument,
  buildResearchSignalDocument,
  DREAM_SHARING_MODES,
} from "../src/lib/recordsService.js";
import {
  filterRecordsForViewer,
  MODERATION_STATUSES,
} from "../src/lib/moderationService.js";

function readText(file) {
  return readFileSync(file, "utf8");
}

const appSource = readText("src/App.jsx");
const dashboardSource = readText("src/components/UserDashboard.jsx");
const archiveSource = readText("src/components/CollectiveDreamDashboard.jsx");
const detailSource = readText("src/components/DreamRecordPage.jsx");
const readinessSource = readText("src/components/AccountReadinessPanel.jsx");
const legalSource = readText("src/components/LegalInfoPage.jsx");
const footerSource = readText("src/components/Footer.jsx");
const dataRightsSource = readText("src/lib/dataRightsService.js");
const moderationSource = readText("src/lib/moderationService.js");
const exportSource = readText("src/lib/researchExportService.js");
const profileSource = readText("src/lib/profileService.js");
const rulesSource = readText("firestore.rules");

assert.ok(appSource.includes("LegalInfoPage"));
assert.ok(appSource.includes("/privacy"));
assert.ok(appSource.includes("/account-deletion"));

assert.ok(dashboardSource.includes("exportPersonalDreamsCsv"));
assert.ok(dashboardSource.includes("exportPersonalDreamsJson"));
assert.ok(dashboardSource.includes("deleteOwnedRecord"));
assert.ok(dashboardSource.includes("AccountReadinessPanel"));

assert.ok(dataRightsSource.includes("deleteAllOwnedDreams"));
assert.ok(dataRightsSource.includes("deleteAccountAndData"));
assert.ok(dataRightsSource.includes("AccountDeletionRequests"));
assert.ok(dataRightsSource.includes("clearLocalDraftsForAccount"));
assert.ok(dataRightsSource.includes("fetchConsentHistory"));

assert.ok(moderationSource.includes("reportDream"));
assert.ok(moderationSource.includes("reportPublicRecorder"));
assert.ok(moderationSource.includes("blockPublicRecorder"));
assert.ok(moderationSource.includes("hideRecordForViewer"));
assert.ok(moderationSource.includes("ModerationReports"));
assert.deepEqual(MODERATION_STATUSES, [
  "pending_review",
  "approved",
  "hidden",
  "removed",
  "adult_review",
  "sensitive_review",
]);

assert.ok(archiveSource.includes("submitDreamReport"));
assert.ok(archiveSource.includes("fetchViewerModerationState"));
assert.ok(archiveSource.includes("filterRecordsForViewer"));
assert.ok(archiveSource.includes("onReportDream"));
assert.ok(detailSource.includes("reportPublicRecorder"));
assert.ok(detailSource.includes("blockPublicRecorder"));
assert.ok(detailSource.includes("signInToReport"));

assert.ok(readinessSource.includes("Account & Trust Center"));
assert.ok(readinessSource.includes("帳戶與信任中心"));
assert.ok(readinessSource.includes("Centro de cuenta y confianza"));
assert.ok(readinessSource.includes("xl:grid-cols-3"));
assert.ok(readinessSource.includes("group-open:rotate-180"));

assert.ok(legalSource.includes("Privacy Policy"));
assert.ok(legalSource.includes("隱私政策"));
assert.ok(legalSource.includes("Política de privacidad"));
assert.ok(legalSource.includes("Community Guidelines"));
assert.ok(legalSource.includes("Content Removal Policy"));
assert.ok(legalSource.includes("Not Diagnosis Disclaimer"));
assert.ok(legalSource.includes("Support Contact"));
assert.ok(legalSource.includes("sm:flex-row"));
assert.ok(footerSource.includes("/privacy"));
assert.ok(footerSource.includes("/support"));

assert.ok(profileSource.includes("privacy_defaults_changed"));
assert.ok(profileSource.includes("ConsentEvents"));
assert.ok(rulesSource.includes("match /ModerationReports/{reportId}"));
assert.ok(rulesSource.includes("match /AccountDeletionRequests/{requestId}"));
assert.ok(rulesSource.includes("match /hiddenRecords/{recordId}"));
assert.ok(rulesSource.includes("match /blockedUsers/{recorderId}"));
assert.ok(rulesSource.includes("validModerationStatus"));
assert.ok(rulesSource.includes("validModerationReportData"));
assert.ok(rulesSource.includes("validPublicDreamMirror"));
assert.ok(rulesSource.includes("noForbiddenPublicDreamFields"));

assert.ok(exportSource.includes("sanitizeResearchSignalForExport"));
assert.ok(exportSource.includes("Stats-only records contribute non-identifying metadata"));
assert.ok(exportSource.includes("public_text"));
assert.ok(exportSource.includes("^\\s*[=+\\-@]"));
assert.ok(!exportSource.includes("privateText"));

const privateRecord = {
  id: "phase2-dream",
  dream_id: "phase2-dream",
  ownerId: "owner-1",
  originalLanguage: "en",
  publicLanguage: "en",
  originalTitle: "Private title should not leak",
  title: "Private title should not leak",
  dream_text: "Private dream text should not leak from stats-only signals.",
  originalText: "Private dream text should not leak from stats-only signals.",
  tags: [{ slug: "fear", category: "Emotions" }],
  adultContent: false,
  researchConsent: true,
  includedInResearchStats: true,
  publicConsent: false,
  isPublic: false,
  visibility: "private",
  sharingMode: DREAM_SHARING_MODES.STATS_ONLY,
};

const statsSignal = buildResearchSignalDocument(
  privateRecord,
  DREAM_SHARING_MODES.STATS_ONLY,
  "owner-1"
);
const statsMirror = buildPublicDreamDocument(
  privateRecord,
  {},
  DREAM_SHARING_MODES.STATS_ONLY
);

assert.ok(statsSignal);
assert.equal(statsMirror, null);
assert.equal(JSON.stringify(statsSignal).includes(privateRecord.dream_text), false);
assert.equal(JSON.stringify(statsSignal).includes(privateRecord.title), false);
assert.equal("ownerId" in statsSignal, false);
assert.equal("publicText" in statsSignal, false);

const publicMirror = buildPublicDreamDocument(
  {
    ...privateRecord,
    publicConsent: true,
    isPublic: true,
    visibility: "public",
    sharingMode: DREAM_SHARING_MODES.ANONYMOUS_PUBLIC,
  },
  {},
  DREAM_SHARING_MODES.ANONYMOUS_PUBLIC
);

assert.ok(publicMirror);
assert.equal(publicMirror.publicConsent, true);
assert.equal(publicMirror.sharingMode, DREAM_SHARING_MODES.ANONYMOUS_PUBLIC);
assert.equal("ownerId" in publicMirror, false);
assert.equal("email" in publicMirror, false);
assert.equal("dream_text" in publicMirror, false);
assert.equal("privateNotes" in publicMirror, false);
assert.equal("sketches" in publicMirror, false);

const filtered = filterRecordsForViewer(
  [
    { dream_id: "visible", publicRecorderKey: "recorder-a" },
    { dream_id: "hidden", publicRecorderKey: "recorder-a" },
    { dream_id: "blocked", publicRecorderKey: "recorder-b" },
  ],
  {
    hiddenRecordIds: new Set(["hidden"]),
    blockedRecorderKeys: new Set(["recorder-b"]),
  }
);

assert.deepEqual(filtered.map((record) => record.dream_id), ["visible"]);

console.log("phase 2 production readiness tests passed");
