import { useEffect, useState } from "react";
import AuthPanel from "./components/AuthPanel.jsx";
import CollectiveDreamDashboard from "./components/CollectiveDreamDashboard.jsx";
import DreamRecordPage from "./components/DreamRecordPage.jsx";
import UserDashboard from "./components/UserDashboard.jsx";
import { useAuth } from "./hooks/useAuth.js";
import { logout } from "./lib/authService.js";
import {
  getHtmlLang,
  getLanguageFromStorage,
  isSupportedLanguage,
  saveLanguageToStorage,
} from "./lib/language.js";
import {
  getOrCreateUserProfile,
  savePreferredLanguage,
} from "./lib/profileService.js";
import { fetchRecordById } from "./lib/recordsService.js";

export default function App() {
  const [language, setLanguageState] = useState(getLanguageFromStorage);
  const [activeView, setActiveView] = useState("auth");
  const [lastListView, setLastListView] = useState("database");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const { currentUser, loading: authLoading } = useAuth();

  useEffect(() => {
    document.documentElement.lang = getHtmlLang(language);
  }, [language]);

  useEffect(() => {
    if (!currentUser?.uid) return;

    let ignore = false;

    async function syncPreferredLanguage() {
      try {
        const profile = await getOrCreateUserProfile(currentUser);

        if (!ignore && isSupportedLanguage(profile?.preferredLanguage)) {
          setLanguageState(profile.preferredLanguage);
          saveLanguageToStorage(profile.preferredLanguage);
        }
      } catch {
        // Keep the locally selected language if the profile is not available yet.
      }
    }

    syncPreferredLanguage();

    return () => {
      ignore = true;
    };
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && activeView === "auth") {
      setActiveView("dashboard");
    }

    if (!currentUser && activeView === "dashboard") {
      setActiveView("auth");
    }
  }, [activeView, currentUser]);

  function handleAuthenticated() {
    setActiveView("dashboard");
  }

  function handleLanguageChange(nextLanguage) {
    if (!isSupportedLanguage(nextLanguage)) return;

    setLanguageState(nextLanguage);
    saveLanguageToStorage(nextLanguage);

    if (currentUser?.uid) {
      savePreferredLanguage(currentUser, nextLanguage).catch(() => {});
    }
  }

  async function handleSignOut() {
    await logout();
    setSelectedRecord(null);
    setActiveView("auth");
  }

  async function openDreamRecord(record, sourceView = activeView) {
    setSelectedRecord(record);
    setLastListView(sourceView);
    setActiveView("dream");

    const recordId = record?.id || record?.recordId || record?.dream_id;
    if (!recordId) return;

    try {
      const fullRecord = await fetchRecordById(recordId);

      if (!fullRecord) return;

      setSelectedRecord((current) => {
        const currentId = current?.id || current?.recordId || current?.dream_id;

        if (currentId !== recordId) return current;

        return {
          ...current,
          ...fullRecord,
          id: fullRecord.id || recordId,
        };
      });
    } catch {
      // Keep the record reference visible if Firestore does not have the full row.
    }
  }

  if (authLoading) {
    return <AuthLoadingScreen language={language} />;
  }

  if (activeView === "database") {
    return (
      <CollectiveDreamDashboard
        language={language}
        setLanguage={handleLanguageChange}
        currentUser={currentUser}
        onOpenAuth={() => setActiveView(currentUser ? "dashboard" : "auth")}
        onOpenRecord={(record) => openDreamRecord(record, "database")}
      />
    );
  }

  if (selectedRecord && activeView === "dream") {
    return (
      <DreamRecordPage
        record={selectedRecord}
        currentUser={currentUser}
        language={language}
        setLanguage={handleLanguageChange}
        onBack={() => setActiveView(lastListView)}
        onOpenDashboard={() => setActiveView(currentUser ? "dashboard" : "auth")}
      />
    );
  }

  if (currentUser && activeView === "dashboard") {
    return (
      <UserDashboard
        language={language}
        setLanguage={handleLanguageChange}
        user={currentUser}
        onSignOut={handleSignOut}
        onOpenDatabase={() => setActiveView("database")}
        onOpenRecord={(record) => openDreamRecord(record, "dashboard")}
      />
    );
  }

  return (
    <AuthPanel
      language={language}
      setLanguage={handleLanguageChange}
      onAuthenticated={handleAuthenticated}
      onOpenDatabase={() => setActiveView("database")}
    />
  );
}

function AuthLoadingScreen({ language }) {
  const label =
    language === "zh"
      ? "正在同步身分狀態"
      : language === "es"
        ? "Sincronizando identidad"
        : "Syncing identity state";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#030407] text-zinc-100">
      <div className="rounded-3xl border border-cyan-300/20 bg-zinc-950/75 p-8 text-center shadow-terminal">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-cyan-200 border-t-transparent" />
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-cyan-100">
          {label}
        </p>
      </div>
    </main>
  );
}
