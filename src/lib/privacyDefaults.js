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

export const PRIVACY_ONBOARDING_CHOICES = {
  PRIVATE: "private",
  STATS_ONLY: "stats_only",
  DREAM_BY_DREAM: "dream_by_dream",
};

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

function getProfilePrivacySource(profile = {}) {
  const nested =
    profile.privacySettings && typeof profile.privacySettings === "object"
      ? profile.privacySettings
      : {};

  return {
    ...nested,
    ...profile,
  };
}

export function normalizePrivacySettings(profile = {}, currentUser = null) {
  const source = getProfilePrivacySource(profile);
  const defaultSharingMode = normalizePrivacySharingMode(
    source.defaultSharingMode || DEFAULT_PRIVACY_SETTINGS.defaultSharingMode
  );
  const derivedConsents = getConsentsForSharingMode(defaultSharingMode);
  const sensitivityAutoSkipThreshold = Number(source.sensitivityAutoSkipThreshold);

  return {
    ...DEFAULT_PRIVACY_SETTINGS,
    defaultSharingMode,
    defaultResearchConsent:
      typeof source.defaultResearchConsent === "boolean"
        ? source.defaultResearchConsent
        : derivedConsents.defaultResearchConsent,
    defaultPublicConsent:
      typeof source.defaultPublicConsent === "boolean"
        ? source.defaultPublicConsent
        : derivedConsents.defaultPublicConsent,
    defaultIncludeInResearchStats:
      typeof source.defaultIncludeInResearchStats === "boolean"
        ? source.defaultIncludeInResearchStats
        : derivedConsents.defaultIncludeInResearchStats,
    defaultPseudonym:
      source.defaultPseudonym == null
        ? null
        : String(source.defaultPseudonym).trim().slice(0, 120) || null,
    defaultApplyToImports:
      source.defaultApplyToImports === undefined
        ? DEFAULT_PRIVACY_SETTINGS.defaultApplyToImports
        : Boolean(source.defaultApplyToImports),
    defaultApplyToSingleDreams:
      source.defaultApplyToSingleDreams === undefined
        ? DEFAULT_PRIVACY_SETTINGS.defaultApplyToSingleDreams
        : Boolean(source.defaultApplyToSingleDreams),
    requireReviewBeforePublic:
      source.requireReviewBeforePublic === undefined
        ? DEFAULT_PRIVACY_SETTINGS.requireReviewBeforePublic
        : Boolean(source.requireReviewBeforePublic),
    skipAdultContentForBulkPublic:
      source.skipAdultContentForBulkPublic === undefined
        ? DEFAULT_PRIVACY_SETTINGS.skipAdultContentForBulkPublic
        : Boolean(source.skipAdultContentForBulkPublic),
    skipHighSensitivityForBulkPublic:
      source.skipHighSensitivityForBulkPublic === undefined
        ? DEFAULT_PRIVACY_SETTINGS.skipHighSensitivityForBulkPublic
        : Boolean(source.skipHighSensitivityForBulkPublic),
    sensitivityAutoSkipThreshold: Number.isFinite(sensitivityAutoSkipThreshold)
      ? Math.max(1, Math.min(4, sensitivityAutoSkipThreshold))
      : DEFAULT_PRIVACY_SETTINGS.sensitivityAutoSkipThreshold,
    privacyDefaultsUpdatedBy:
      source.privacyDefaultsUpdatedBy || currentUser?.uid || "",
  };
}

export function getOnboardingChoiceForSharingMode(value) {
  const sharingMode = normalizePrivacySharingMode(value);

  if (sharingMode === PRIVACY_SHARING_MODES.STATS_ONLY) {
    return PRIVACY_ONBOARDING_CHOICES.STATS_ONLY;
  }

  if (sharingMode === PRIVACY_SHARING_MODES.PRIVATE) {
    return PRIVACY_ONBOARDING_CHOICES.PRIVATE;
  }

  return PRIVACY_ONBOARDING_CHOICES.DREAM_BY_DREAM;
}

export function getSharingModeForOnboardingChoice(value) {
  if (value === PRIVACY_ONBOARDING_CHOICES.STATS_ONLY) {
    return PRIVACY_SHARING_MODES.STATS_ONLY;
  }

  return PRIVACY_SHARING_MODES.PRIVATE;
}

export function normalizePrivacyOnboardingChoice(value) {
  return Object.values(PRIVACY_ONBOARDING_CHOICES).includes(value)
    ? value
    : PRIVACY_ONBOARDING_CHOICES.PRIVATE;
}

export function buildPrivacySettingsMap(
  profile = {},
  currentUser = null,
  { includeTimestamp = false, serverTimestampValue = null } = {}
) {
  const settings = normalizePrivacySettings(profile, currentUser);
  const onboardingChoice = normalizePrivacyOnboardingChoice(
    profile.privacyOnboardingChoice ||
      profile.privacySettings?.onboardingChoice ||
      getOnboardingChoiceForSharingMode(settings.defaultSharingMode)
  );
  const map = {
    ...settings,
    onboardingChoice,
    onboardingCompleted: Boolean(
      profile.privacyOnboardingCompleted ||
        profile.privacySettings?.onboardingCompleted
    ),
    updatedBy: currentUser?.uid || settings.privacyDefaultsUpdatedBy || "",
  };

  if (includeTimestamp && serverTimestampValue) {
    map.updatedAt = serverTimestampValue;
  }

  return map;
}
