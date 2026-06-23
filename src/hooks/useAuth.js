import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, isFirebaseConfigured } from "../lib/firebaseClient.js";

export function useAuth() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setCurrentUser(null);
      setLoading(false);
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setCurrentUser(user);
        setAuthError(null);
        setLoading(false);
      },
      (error) => {
        setAuthError(error);
        setCurrentUser(null);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  return {
    currentUser,
    loading,
    authError,
    isFirebaseConfigured,
  };
}
