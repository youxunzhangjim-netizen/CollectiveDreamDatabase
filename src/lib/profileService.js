import { collection, doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebaseClient.js";
import { isSupportedLanguage } from "./language.js";
import {
  buildPrivacySettingsMap,
  getConsentsForSharingMode,
  getSharingModeForOnboardingChoice,
  normalizePrivacyOnboardingChoice,
  normalizePrivacySettings,
} from "./privacyDefaults.js";

function requireFirestore() {
  if (!isFirebaseConfigured || !db) {
    throw new Error("Account storage is not available yet.");
  }

  return db;
}

function formatAuthJoinedAt(currentUser) {
  if (!currentUser?.metadata?.creationTime) return "2026-06-23";
  return new Date(currentUser.metadata.creationTime).toISOString().slice(0, 10);
}

const PRIVACY_PROFILE_FIELDS = [
  "defaultSharingMode",
  "defaultResearchConsent",
  "defaultPublicConsent",
  "defaultIncludeInResearchStats",
  "defaultPseudonym",
  "defaultApplyToImports",
  "defaultApplyToSingleDreams",
  "requireReviewBeforePublic",
  "skipAdultContentForBulkPublic",
  "skipHighSensitivityForBulkPublic",
  "sensitivityAutoSkipThreshold",
  "privacyOnboardingChoice",
  "privacyOnboardingCompleted",
  "privacySettings",
];

function includesPrivacyProfileChange(updates = {}) {
  return PRIVACY_PROFILE_FIELDS.some((field) =>
    Object.prototype.hasOwnProperty.call(updates, field)
  );
}

export function createDefaultProfile(currentUser) {
  const privacySettings = normalizePrivacySettings({}, currentUser);
  const privacySettingsMap = buildPrivacySettingsMap(
    {
      ...privacySettings,
      privacyOnboardingCompleted: true,
      privacyOnboardingChoice: "stats_only",
    },
    currentUser
  );

  return {
    uid: currentUser.uid,
    email: currentUser.email || "",
    displayName: currentUser.displayName || "",
    joinedAt: formatAuthJoinedAt(currentUser),
    country: "",
    age: "",
    showAge: false,
    showEmail: false,
    biologicalSex: "",
    showBiologicalSex: false,
    preferredLanguage: "zh",
    ...privacySettings,
    privacySettings: privacySettingsMap,
    privacyOnboardingCompleted: true,
    privacyOnboardingChoice: "stats_only",
  };
}

export async function getOrCreateUserProfile(currentUser) {
  if (!currentUser?.uid) return null;

  const profileRef = doc(requireFirestore(), "users", currentUser.uid);
  const defaultProfile = createDefaultProfile(currentUser);
  let snapshot = null;

  try {
    snapshot = await getDoc(profileRef);
  } catch (error) {
    return {
      ...defaultProfile,
      profileLoadError: error?.message || "Account profile could not be loaded.",
    };
  }

  if (snapshot?.exists()) {
    const profileData = {
      ...defaultProfile,
      ...snapshot.data(),
      uid: currentUser.uid,
    };
    const privacySettings = normalizePrivacySettings(profileData, currentUser);

    return {
      ...profileData,
      ...privacySettings,
      privacySettings: buildPrivacySettingsMap(profileData, currentUser),
      uid: currentUser.uid,
    };
  }

  try {
    await setDoc(
      profileRef,
      {
        ...defaultProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    return {
      ...defaultProfile,
      profileWritePending: true,
      profileWriteError: error?.message || "Account profile could not be created yet.",
    };
  }

  return defaultProfile;
}

export async function saveUserProfile(currentUser, updates) {
  if (!currentUser?.uid) {
    throw new Error("A signed-in user is required to update an account profile.");
  }

  const normalizedAge =
    updates.age === "" || updates.age == null ? "" : Math.max(0, Number(updates.age));
  const privacySettings = normalizePrivacySettings(updates, currentUser);
  const privacyOnboardingChoice = normalizePrivacyOnboardingChoice(
    updates.privacyOnboardingChoice || updates.privacySettings?.onboardingChoice
  );
  const privacyOnboardingCompleted = Boolean(
    updates.privacyOnboardingCompleted ||
      updates.privacySettings?.onboardingCompleted
  );
  const privacySettingsMap = buildPrivacySettingsMap(
    {
      ...updates,
      ...privacySettings,
      privacyOnboardingChoice,
      privacyOnboardingCompleted,
    },
    currentUser,
    { includeTimestamp: true, serverTimestampValue: serverTimestamp() }
  );

  const profileRef = doc(requireFirestore(), "users", currentUser.uid);

  await setDoc(
    profileRef,
    {
      uid: currentUser.uid,
      email: currentUser.email || "",
      displayName: updates.displayName || "",
      country: updates.country || "",
      age: Number.isFinite(normalizedAge) ? normalizedAge : "",
      showEmail: Boolean(updates.showEmail),
      showAge: Boolean(updates.showAge),
      biologicalSex: updates.biologicalSex || "",
      showBiologicalSex: Boolean(updates.showBiologicalSex),
      ...privacySettings,
      privacySettings: privacySettingsMap,
      privacyOnboardingChoice,
      privacyOnboardingCompleted,
      privacyDefaultsUpdatedBy: currentUser.uid,
      privacyDefaultsUpdatedAt: serverTimestamp(),
      preferredLanguage: isSupportedLanguage(updates.preferredLanguage)
        ? updates.preferredLanguage
        : "zh",
      joinedAt: updates.joinedAt || formatAuthJoinedAt(currentUser),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  if (includesPrivacyProfileChange(updates)) {
    await setDoc(doc(collection(requireFirestore(), "ConsentEvents")), {
      ownerId: currentUser.uid,
      userId: currentUser.uid,
      type: "privacy_defaults_changed",
      source: "account_profile",
      sharingMode: privacySettings.defaultSharingMode,
      publicConsent: privacySettings.defaultPublicConsent,
      researchConsent: privacySettings.defaultResearchConsent,
      includedInResearchStats: privacySettings.defaultIncludeInResearchStats,
      defaultApplyToImports: privacySettings.defaultApplyToImports,
      defaultApplyToSingleDreams: privacySettings.defaultApplyToSingleDreams,
      requireReviewBeforePublic: privacySettings.requireReviewBeforePublic,
      createdAt: serverTimestamp(),
    }).catch(() => {});
  }
}

export async function savePrivacyOnboardingChoice(currentUser, profile, choice) {
  if (!currentUser?.uid) {
    throw new Error("A signed-in user is required to save privacy settings.");
  }

  const privacyOnboardingChoice = normalizePrivacyOnboardingChoice(choice);
  const defaultSharingMode = getSharingModeForOnboardingChoice(privacyOnboardingChoice);
  const consents = getConsentsForSharingMode(defaultSharingMode);
  const nextProfile = {
    ...(profile || createDefaultProfile(currentUser)),
    defaultSharingMode,
    ...consents,
    defaultApplyToSingleDreams: true,
    defaultApplyToImports: true,
    requireReviewBeforePublic: true,
    privacyOnboardingChoice,
    privacyOnboardingCompleted: true,
  };

  await saveUserProfile(currentUser, nextProfile);

  return {
    ...nextProfile,
    ...normalizePrivacySettings(nextProfile, currentUser),
    privacySettings: buildPrivacySettingsMap(nextProfile, currentUser),
  };
}

export async function savePreferredLanguage(currentUser, language) {
  if (!currentUser?.uid || !isSupportedLanguage(language)) return;

  await setDoc(
    doc(requireFirestore(), "users", currentUser.uid),
    {
      uid: currentUser.uid,
      email: currentUser.email || "",
      preferredLanguage: language,
      joinedAt: formatAuthJoinedAt(currentUser),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
