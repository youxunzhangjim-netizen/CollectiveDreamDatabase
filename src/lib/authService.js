import {
  createUserWithEmailAndPassword,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from "firebase/auth";
import { auth, googleProvider, isFirebaseConfigured } from "./firebaseClient.js";

const GOOGLE_REDIRECT_FALLBACK_CODES = new Set([
  "auth/popup-blocked",
  "auth/operation-not-supported-in-this-environment",
]);

function requireAuthClient() {
  if (!isFirebaseConfigured || !auth) {
    throw new Error("Account login is not available yet.");
  }

  return auth;
}

export async function loginWithEmail(email, password) {
  return signInWithEmailAndPassword(requireAuthClient(), email, password);
}

export async function signupWithEmail(email, password) {
  return createUserWithEmailAndPassword(requireAuthClient(), email, password);
}

export async function loginWithGoogle() {
  const authClient = requireAuthClient();

  try {
    return await signInWithPopup(authClient, googleProvider);
  } catch (error) {
    if (GOOGLE_REDIRECT_FALLBACK_CODES.has(error?.code)) {
      await signInWithRedirect(authClient, googleProvider);
      return null;
    }

    throw error;
  }
}

export async function loginAnonymously() {
  return signInAnonymously(requireAuthClient());
}

export async function logout() {
  return signOut(requireAuthClient());
}
