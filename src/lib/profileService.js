import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebaseClient.js";
import { isSupportedLanguage } from "./language.js";

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

export function createDefaultProfile(currentUser) {
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
  };
}

export async function getOrCreateUserProfile(currentUser) {
  if (!currentUser?.uid) return null;

  const profileRef = doc(requireFirestore(), "users", currentUser.uid);
  const snapshot = await getDoc(profileRef);
  const defaultProfile = createDefaultProfile(currentUser);

  if (snapshot.exists()) {
    return {
      ...defaultProfile,
      ...snapshot.data(),
      uid: currentUser.uid,
    };
  }

  await setDoc(
    profileRef,
    {
      ...defaultProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return defaultProfile;
}

export async function saveUserProfile(currentUser, updates) {
  if (!currentUser?.uid) {
    throw new Error("A signed-in user is required to update an account profile.");
  }

  const normalizedAge =
    updates.age === "" || updates.age == null ? "" : Math.max(0, Number(updates.age));

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
      preferredLanguage: isSupportedLanguage(updates.preferredLanguage)
        ? updates.preferredLanguage
        : "zh",
      joinedAt: updates.joinedAt || formatAuthJoinedAt(currentUser),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
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
