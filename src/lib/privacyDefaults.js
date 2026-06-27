export const PRIVACY_SHARING_MODES = {
  PRIVATE: "private",
  STATS_ONLY: "stats_only",
  ANONYMOUS_PUBLIC: "anonymous_public",
  PSEUDONYM_PUBLIC: "pseudonym_public",
  REDACTED_PUBLIC: "redacted_public",
  PUBLIC_ANONYMOUS: "public_anonymous",
  PUBLIC_PSEUDONYM: "public_pseudonym",
};

export const DEFAULT_PRIVACY_SETTINGS = {
  defaultSharingMode: PRIVACY_SHARING_MODES.PRIVATE,
  defaultResearchConsent: false,
  defaultPublicConsent: false,
  defaultIncludeInResearchStats: false,
  defaultPseudonym: null,
  defaultApplyToImports: true,
  defaultApplyToSingleDreams: true,
  requireReviewBeforePublic: true,
  skipAdultContentForBulkPublic: true,
  skipHighSensitivityForBulkPublic: true,
  sensitivityAutoSkipThreshold: 3,
};

export const ACCOUNT_DEFAULT_SHARING_MODE = "account_default";

const LEGACY_SHARING_MODE_ALIASES = {
  public_anonymous: PRIVACY_SHARING_MODES.ANONYMOUS_PUBLIC,
  public_pseudonym: PRIVACY_SHARING_MODES.PSEUDONYM_PUBLIC,
};

const VALID_SHARING_MODES = new Set([
  PRIVACY_SHARING_MODES.PRIVATE,
  PRIVACY_SHARING_MODES.STATS_ONLY,
  PRIVACY_SHARING_MODES.ANONYMOUS_PUBLIC,
  PRIVACY_SHARING_MODES.PSEUDONYM_PUBLIC,
  PRIVACY_SHARING_MODES.REDACTED_PUBLIC,
]);

const PUBLIC_SHARING_MODES = new Set([
  PRIVACY_SHARING_MODES.ANONYMOUS_PUBLIC,
  PRIVACY_SHARING_MODES.PSEUDONYM_PUBLIC,
  PRIVACY_SHARING_MODES.REDACTED_PUBLIC,
]);

export function normalizePrivacySharingMode(value) {
  const rawValue = String(value || "")
    .replace(/[ㄝ"'`]/g, "")
    .trim()
    .toLowerCase();
  const normalizedValue = LEGACY_SHARING_MODE_ALIASES[rawValue] || rawValue;

  return VALID_SHARING_MODES.has(normalizedValue)
    ? normalizedValue
    : PRIVACY_SHARING_MODES.PRIVATE;
}

export function isPublicPrivacySharingMode(value) {
  return PUBLIC_SHARING_MODES.has(normalizePrivacySharingMode(value));
}

export function getConsentsForSharingMode(value) {
  const sharingMode = normalizePrivacySharingMode(value);
  const isPublic = isPublicPrivacySharingMode(sharingMode);
  const research = sharingMode === PRIVACY_SHARING_MODES.STATS_ONLY || isPublic;

  return {
    defaultResearchConsent: research,
    defaultPublicConsent: isPublic,
    defaultIncludeInResearchStats: research,
  };
}

export function normalizePrivacySettings(profile = {}, currentUser = null) {
  const defaultSharingMode = normalizePrivacySharingMode(
    profile.defaultSharingMode || DEFAULT_PRIVACY_SETTINGS.defaultSharingMode
  );
  const derivedConsents = getConsentsForSharingMode(defaultSharingMode);
  const sensitivityAutoSkipThreshold = Number(profile.sensitivityAutoSkipThreshold);

  return {
    ...DEFAULT_PRIVACY_SETTINGS,
    defaultSharingMode,
    defaultResearchConsent:
      typeof profile.defaultResearchConsent === "boolean"
        ? profile.defaultResearchConsent
        : derivedConsents.defaultResearchConsent,
    defaultPublicConsent:
      typeof profile.defaultPublicConsent === "boolean"
        ? profile.defaultPublicConsent
        : derivedConsents.defaultPublicConsent,
    defaultIncludeInResearchStats:
      typeof profile.defaultIncludeInResearchStats === "boolean"
        ? profile.defaultIncludeInResearchStats
        : derivedConsents.defaultIncludeInResearchStats,
    defaultPseudonym:
      profile.defaultPseudonym == null
        ? null
        : String(profile.defaultPseudonym).trim().slice(0, 120) || null,
    defaultApplyToImports:
      profile.defaultApplyToImports === undefined
        ? DEFAULT_PRIVACY_SETTINGS.defaultApplyToImports
        : Boolean(profile.defaultApplyToImports),
    defaultApplyToSingleDreams:
      profile.defaultApplyToSingleDreams === undefined
        ? DEFAULT_PRIVACY_SETTINGS.defaultApplyToSingleDreams
        : Boolean(profile.defaultApplyToSingleDreams),
    requireReviewBeforePublic:
      profile.requireReviewBeforePublic === undefined
        ? DEFAULT_PRIVACY_SETTINGS.requireReviewBeforePublic
        : Boolean(profile.requireReviewBeforePublic),
    skipAdultContentForBulkPublic:
      profile.skipAdultContentForBulkPublic === undefined
        ? DEFAULT_PRIVACY_SETTINGS.skipAdultContentForBulkPublic
        : Boolean(profile.skipAdultContentForBulkPublic),
    skipHighSensitivityForBulkPublic:
      profile.skipHighSensitivityForBulkPublic === undefined
        ? DEFAULT_PRIVACY_SETTINGS.skipHighSensitivityForBulkPublic
        : Boolean(profile.skipHighSensitivityForBulkPublic),
    sensitivityAutoSkipThreshold: Number.isFinite(sensitivityAutoSkipThreshold)
      ? Math.max(1, Math.min(4, sensitivityAutoSkipThreshold))
      : DEFAULT_PRIVACY_SETTINGS.sensitivityAutoSkipThreshold,
    privacyDefaultsUpdatedBy:
      profile.privacyDefaultsUpdatedBy || currentUser?.uid || "",
  };
}
