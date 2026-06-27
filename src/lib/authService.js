import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  linkWithCredential,
  sendPasswordResetEmail,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updatePassword,
} from "firebase/auth";
import {
  auth,
  googleProvider,
  isFirebaseConfigured,
  microsoftProvider,
} from "./firebaseClient.js";

const OAUTH_REDIRECT_FALLBACK_CODES = new Set([
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
  return loginWithProvider(googleProvider);
}

export async function loginWithMicrosoft() {
  return loginWithProvider(microsoftProvider);
}

async function loginWithProvider(provider) {
  const authClient = requireAuthClient();

  try {
    return await signInWithPopup(authClient, provider);
  } catch (error) {
    if (OAUTH_REDIRECT_FALLBACK_CODES.has(error?.code)) {
      await signInWithRedirect(authClient, provider);
      return null;
    }

    throw error;
  }
}

export async function requestPasswordReset(email) {
  return sendPasswordResetEmail(requireAuthClient(), String(email || "").trim());
}

export async function setAccountPassword(currentUser, password) {
  if (!currentUser?.email) {
    throw new Error("A verified account email is required.");
  }

  const normalizedPassword = String(password || "");
  const hasPasswordProvider = currentUser.providerData?.some(
    (provider) => provider.providerId === "password"
  );

  if (hasPasswordProvider) {
    await updatePassword(currentUser, normalizedPassword);
    return currentUser;
  }

  const credential = EmailAuthProvider.credential(
    currentUser.email,
    normalizedPassword
  );
  const result = await linkWithCredential(currentUser, credential);
  return result.user;
}

export async function loginAnonymously() {
  return signInAnonymously(requireAuthClient());
}

export async function logout() {
  return signOut(requireAuthClient());
}
