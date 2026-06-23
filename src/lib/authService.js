import {
  createUserWithEmailAndPassword,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth, googleProvider, isFirebaseConfigured } from "./firebaseClient.js";

function requireAuthClient() {
  if (!isFirebaseConfigured || !auth) {
    throw new Error("Secure access is not available yet.");
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
  return signInWithPopup(requireAuthClient(), googleProvider);
}

export async function loginAnonymously() {
  return signInAnonymously(requireAuthClient());
}

export async function logout() {
  return signOut(requireAuthClient());
}
