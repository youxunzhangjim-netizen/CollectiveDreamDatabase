import assert from "node:assert/strict";
import {
  ACCOUNT_DEFAULT_SHARING_MODE,
  normalizePrivacySettings,
  normalizePrivacySharingMode,
} from "../src/lib/privacyDefaults.js";
import {
  buildPublicDreamDocument,
  buildResearchSignalDocument,
  DREAM_SHARING_MODES,
  resolveNewRecordPrivacyState,
} from "../src/lib/recordsService.js";

const user = { uid: "user-1", isAnonymous: false, displayName: "Recorder" };
const anonymousUser = { uid: "guest-1", isAnonymous: true, displayName: "" };
const baseRecord = {
  id: "dream-1",
  ownerId: "user-1",
  originalLanguage: "en",
  originalTitle: "Private title",
  originalText: "Private words that should not leak from a redacted mirror.",
  dream_text: "Private words that should not leak from a redacted mirror.",
  title: "Private title",
  tags: [{ slug: "fear", category: "Emotions" }],
  adultContent: false,
  minimumViewerAge: 0,
  researchConsent: true,
  includedInResearchStats: true,
  sourceType: "single_record",
  titleSource: "user",
  tagsSource: "user_selected",
};

assert.equal(
  normalizePrivacySharingMode('ㄝ"redacted_public"'),
  DREAM_SHARING_MODES.REDACTED_PUBLIC,
  "normalizes stray typo characters around redacted_public"
);

{
  const defaults = normalizePrivacySettings({});
  const state = resolveNewRecordPrivacyState({ currentUser: user, profile: defaults });

  assert.equal(defaults.defaultSharingMode, DREAM_SHARING_MODES.STATS_ONLY);
  assert.equal(defaults.defaultResearchConsent, true);
  assert.equal(defaults.defaultPublicConsent, false);
  assert.equal(defaults.defaultIncludeInResearchStats, true);
  assert.equal(state.sharingMode, DREAM_SHARING_MODES.STATS_ONLY);
  assert.equal(state.visibility, "private");
  assert.equal(state.publicConsent, false);
  assert.equal(state.includedInResearchStats, true);
}

{
  const state = resolveNewRecordPrivacyState({
    currentUser: anonymousUser,
    draft: {
      sourceType: "single_record",
    },
  });

  assert.equal(state.sharingMode, DREAM_SHARING_MODES.ANONYMOUS_PUBLIC);
  assert.equal(state.visibility, "public");
  assert.equal(state.isPublic, true);
  assert.equal(state.researchConsent, true);
  assert.equal(state.publicConsent, true);
}

{
  const profile = normalizePrivacySettings({
    defaultSharingMode: DREAM_SHARING_MODES.STATS_ONLY,
  });
  const state = resolveNewRecordPrivacyState({ currentUser: user, profile });

  assert.equal(state.sharingMode, DREAM_SHARING_MODES.STATS_ONLY);
  assert.equal(state.visibility, "private");
  assert.equal(state.includedInResearchStats, true);
  assert.equal(state.publicConsent, false);
}

{
  const profile = normalizePrivacySettings({
    privacySettings: {
      defaultSharingMode: DREAM_SHARING_MODES.STATS_ONLY,
      defaultApplyToSingleDreams: true,
    },
  });
  const state = resolveNewRecordPrivacyState({ currentUser: user, profile });

  assert.equal(state.sharingMode, DREAM_SHARING_MODES.STATS_ONLY);
  assert.equal(state.defaultPrivacyApplied, true);
  assert.equal(state.privacyDefaultSource, "single_record");
}

{
  const profile = normalizePrivacySettings({
    defaultSharingMode: DREAM_SHARING_MODES.STATS_ONLY,
  });
  const state = resolveNewRecordPrivacyState({
    currentUser: user,
    profile,
    draft: {
      sourceType: "diary_import",
      sharingMode: ACCOUNT_DEFAULT_SHARING_MODE,
    },
  });

  assert.equal(state.sharingMode, DREAM_SHARING_MODES.STATS_ONLY);
  assert.equal(state.privacyDefaultSource, "diary_import");
}

{
  const profile = normalizePrivacySettings({
    defaultSharingMode: DREAM_SHARING_MODES.ANONYMOUS_PUBLIC,
    requireReviewBeforePublic: true,
  });
  const state = resolveNewRecordPrivacyState({ currentUser: user, profile });

  assert.equal(state.sharingMode, DREAM_SHARING_MODES.STATS_ONLY);
  assert.equal(state.requestedSharingMode, DREAM_SHARING_MODES.ANONYMOUS_PUBLIC);
  assert.equal(state.visibility, "private");
  assert.equal(state.isPublic, false);
  assert.equal(state.publicReviewStatus, "pending_review");
}

{
  const researchSignal = buildResearchSignalDocument(
    baseRecord,
    DREAM_SHARING_MODES.STATS_ONLY
  );
  const publicMirror = buildPublicDreamDocument(
    baseRecord,
    {},
    DREAM_SHARING_MODES.STATS_ONLY
  );

  assert.ok(researchSignal);
  assert.equal(publicMirror, null);
  assert.equal("dream_text" in researchSignal, false);
  assert.equal("title" in researchSignal, false);
  assert.equal("recordId" in researchSignal, false);
  assert.equal("ownerId" in researchSignal, false);
  assert.equal("publicText" in researchSignal, false);
  assert.equal(researchSignal.signalVersion, "2026.1");
  assert.equal(researchSignal.language, "en");
  assert.deepEqual(researchSignal.selectedTagSlugs, ["fear"]);
  assert.deepEqual(researchSignal.emotionTags, ["fear"]);
  assert.equal(researchSignal.importSourceType, "single_record");
  assert.equal(researchSignal.titleSource, "user");
  assert.ok(researchSignal.recordIdHash);
}

{
  const researchSignal = buildResearchSignalDocument(
    {
      ...baseRecord,
      researchConsent: false,
      includedInResearchStats: true,
    },
    DREAM_SHARING_MODES.STATS_ONLY
  );

  assert.equal(researchSignal, null);
}

{
  const publicMirror = buildPublicDreamDocument(
    baseRecord,
    {},
    DREAM_SHARING_MODES.ANONYMOUS_PUBLIC
  );

  assert.ok(publicMirror);
  assert.equal(publicMirror.publicText, baseRecord.originalText);
  assert.equal(publicMirror.anonymousLabel, "Anonymous Observer");
  assert.equal("creatorEmail" in publicMirror, false);
  assert.equal("creatorDisplayName" in publicMirror, false);
  assert.equal("dream_text" in publicMirror, false);
  assert.equal("originalText" in publicMirror, false);
  assert.equal("ownerId" in publicMirror, false);
}

{
  const publicMirror = buildPublicDreamDocument(
    baseRecord,
    { defaultPseudonym: "Night Archivist", displayName: "Real Account Name" },
    DREAM_SHARING_MODES.PSEUDONYM_PUBLIC
  );

  assert.equal(publicMirror.pseudonym, "Night Archivist");
  assert.equal(publicMirror.anonymousLabel, "");
  assert.equal("creatorEmail" in publicMirror, false);
  assert.equal("creatorDisplayName" in publicMirror, false);
  assert.equal("ownerId" in publicMirror, false);
}

{
  const publicMirror = buildPublicDreamDocument(
    {
      ...baseRecord,
      publicTitle: "Safe title",
      publicText: "Safe public wording only.",
      redactionStatus: "user_confirmed",
    },
    {},
    DREAM_SHARING_MODES.REDACTED_PUBLIC
  );

  assert.equal(publicMirror.publicTitle, "Safe title");
  assert.equal(publicMirror.publicText, "Safe public wording only.");
  assert.notEqual(publicMirror.publicText, baseRecord.originalText);
  assert.equal("dream_text" in publicMirror, false);
}

{
  const publicMirror = buildPublicDreamDocument(
    baseRecord,
    {},
    DREAM_SHARING_MODES.REDACTED_PUBLIC
  );

  assert.equal(publicMirror, null);
}

console.log("privacy defaults tests passed");
