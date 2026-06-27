import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const viteEnv = import.meta.env || {};

function readEnv(name) {
  const nodeEnv = typeof process !== "undefined" ? process.env : {};
  return viteEnv[name] || nodeEnv?.[name] || "";
}

export const firebaseConfig = {
  apiKey: readEnv("VITE_FIREBASE_API_KEY"),
  authDomain: readEnv("VITE_FIREBASE_AUTH_DOMAIN"),
  projectId: readEnv("VITE_FIREBASE_PROJECT_ID"),
  storageBucket: readEnv("VITE_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: readEnv("VITE_FIREBASE_MESSAGING_SENDER_ID"),
  appId: readEnv("VITE_FIREBASE_APP_ID"),
};

const requiredConfig = [
  firebaseConfig.apiKey,
  firebaseConfig.authDomain,
  firebaseConfig.projectId,
  firebaseConfig.appId,
];

export const isFirebaseConfigured =
  requiredConfig.every(Boolean) &&
  !firebaseConfig.apiKey?.includes("your-") &&
  !firebaseConfig.projectId?.includes("your-");

export const firebaseApp = isFirebaseConfigured
  ? getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

export const auth = firebaseApp ? getAuth(firebaseApp) : null;
export const db = firebaseApp ? getFirestore(firebaseApp) : null;
export const isFirebaseStorageConfigured = Boolean(
  firebaseApp &&
    firebaseConfig.storageBucket &&
    !firebaseConfig.storageBucket.includes("your-")
);
export const storage = isFirebaseStorageConfigured ? getStorage(firebaseApp) : null;
export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: "select_account",
});
