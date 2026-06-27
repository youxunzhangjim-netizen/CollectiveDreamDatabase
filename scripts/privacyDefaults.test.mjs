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
};

assert.equal(
  normalizePrivacySharingMode('ㄝ"redacted_public"'),
  DREAM_SHARING_MODES.REDACTED_PUBLIC,
  "normalizes stray typo characters around redacted_public"
);

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
}

{
  const publicMirror = buildPublicDreamDocument(
    baseRecord,
    {},
    DREAM_SHARING_MODES.ANONYMOUS_PUBLIC
  );

  assert.ok(publicMirror);
  assert.equal(publicMirror.creatorEmail, "");
  assert.equal(publicMirror.creatorDisplayName, "");
  assert.equal("ownerId" in publicMirror, false);
}

{
  const publicMirror = buildPublicDreamDocument(
    baseRecord,
    { defaultPseudonym: "Night Archivist", displayName: "Real Account Name" },
    DREAM_SHARING_MODES.PSEUDONYM_PUBLIC
  );

  assert.equal(publicMirror.creatorDisplayName, "Night Archivist");
  assert.equal(publicMirror.authorName, "Night Archivist");
  assert.equal(publicMirror.creatorEmail, "");
  assert.equal("ownerId" in publicMirror, false);
}

{
  const publicMirror = buildPublicDreamDocument(
    {
      ...baseRecord,
      publicTitle: "Safe title",
      publicText: "Safe public wording only.",
    },
    {},
    DREAM_SHARING_MODES.REDACTED_PUBLIC
  );

  assert.equal(publicMirror.title, "Safe title");
  assert.equal(publicMirror.dream_text, "Safe public wording only.");
  assert.notEqual(publicMirror.dream_text, baseRecord.originalText);
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
