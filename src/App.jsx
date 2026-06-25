import { useEffect, useState } from "react";
import AuthPanel from "./components/AuthPanel.jsx";
import CollectiveDreamDashboard from "./components/CollectiveDreamDashboard.jsx";
import DreamRecordPage from "./components/DreamRecordPage.jsx";
import Footer from "./components/Footer.jsx";
import ImportDreamDiaryPage from "./components/ImportDreamDiaryPage.jsx";
import RecordDreamPage from "./components/RecordDreamPage.jsx";
import UserDashboard from "./components/UserDashboard.jsx";
import { useAuth } from "./hooks/useAuth.js";
import { logout } from "./lib/authService.js";
import {
  getAppearanceFromStorage,
  isSupportedAppearance,
  saveAppearanceToStorage,
} from "./lib/appearance.js";
import {
  getHtmlLang,
  getLanguageFromStorage,
  getStoredLanguagePreference,
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
  const [appearance, setAppearance] = useState(getAppearanceFromStorage);
  const [activeView, setActiveView] = useState("database");
  const [lastListView, setLastListView] = useState("database");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const { currentUser, loading: authLoading } = useAuth();

  useEffect(() => {
    document.documentElement.lang = getHtmlLang(language);
  }, [language]);

  useEffect(() => {
    document.documentElement.dataset.appearance = appearance;
  }, [appearance]);

  useEffect(() => {
    if (!currentUser?.uid) return;

    let ignore = false;

    async function syncPreferredLanguage() {
      try {
        const profile = await getOrCreateUserProfile(currentUser);
        const storedLanguage = getStoredLanguagePreference();

        if (ignore) return;

        if (isSupportedLanguage(storedLanguage)) {
          setLanguageState(storedLanguage);
          savePreferredLanguage(currentUser, storedLanguage).catch(() => {});
          return;
        }

        if (isSupportedLanguage(profile?.preferredLanguage)) {
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

  function handleAppearanceChange(nextAppearance) {
    if (!isSupportedAppearance(nextAppearance)) return;

    setAppearance(nextAppearance);
    saveAppearanceToStorage(nextAppearance);
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

  function renderShell(content) {
    return (
      <>
        <AppearanceToggle
          language={language}
          appearance={appearance}
          setAppearance={handleAppearanceChange}
        />
        {content}
        <Footer language={language} />
      </>
    );
  }

  if (authLoading) {
    return renderShell(<AuthLoadingScreen language={language} />);
  }

  if (activeView === "database") {
    return renderShell(
      <CollectiveDreamDashboard
          language={language}
          setLanguage={handleLanguageChange}
          currentUser={currentUser}
          onOpenAuth={() => setActiveView(currentUser ? "dashboard" : "auth")}
          onOpenRecorder={() => setActiveView("record")}
          onOpenImporter={() => setActiveView("import")}
          onOpenRecord={(record) => openDreamRecord(record, "database")}
        />
    );
  }

  if (activeView === "import") {
    return renderShell(
      <ImportDreamDiaryPage
          language={language}
          setLanguage={handleLanguageChange}
          currentUser={currentUser}
          onOpenDatabase={() => setActiveView("database")}
          onOpenDashboard={() => setActiveView(currentUser ? "dashboard" : "auth")}
          onOpenRecorder={() => setActiveView("record")}
          onImported={(record) => openDreamRecord(record, "import")}
        />
    );
  }

  if (activeView === "record") {
    return renderShell(
      <RecordDreamPage
          language={language}
          setLanguage={handleLanguageChange}
          currentUser={currentUser}
          onOpenDatabase={() => setActiveView("database")}
          onOpenDashboard={() => setActiveView(currentUser ? "dashboard" : "auth")}
          onOpenImporter={() => setActiveView("import")}
          onSubmitted={(record) => openDreamRecord(record, "record")}
        />
    );
  }

  if (selectedRecord && activeView === "dream") {
    return renderShell(
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
    return renderShell(
      <UserDashboard
          language={language}
          setLanguage={handleLanguageChange}
          user={currentUser}
          onSignOut={handleSignOut}
          onOpenDatabase={() => setActiveView("database")}
          onOpenRecorder={() => setActiveView("record")}
          onOpenImporter={() => setActiveView("import")}
          onOpenRecord={(record) => openDreamRecord(record, "dashboard")}
        />
    );
  }

  return renderShell(
    <AuthPanel
        language={language}
        setLanguage={handleLanguageChange}
        onAuthenticated={handleAuthenticated}
        onOpenDatabase={() => setActiveView("database")}
        onOpenRecorder={() => setActiveView("record")}
        onOpenImporter={() => setActiveView("import")}
      />
  );
}

function AppearanceToggle({ language, appearance, setAppearance }) {
  const copy =
    language === "zh"
      ? { label: "切換明暗外觀", morning: "日間", night: "夜間" }
      : language === "es"
        ? { label: "Cambiar apariencia", morning: "Día", night: "Noche" }
        : { label: "Switch appearance", morning: "Day", night: "Night" };
  const morningMode = appearance === "morning";

  return (
    <div
      className={[
        "fixed bottom-3 left-3 z-50 flex items-center overflow-hidden rounded-xl border p-1 shadow-[0_0_24px_rgba(34,211,238,.16)] backdrop-blur sm:bottom-4 sm:left-4",
        morningMode
          ? "border-cyan-700/20 bg-white/75"
          : "border-cyan-300/30 bg-cyan-300/10",
      ].join(" ")}
      role="group"
      aria-label={copy.label}
    >
      {["morning", "night"].map((option) => {
        const active = appearance === option;

        return (
          <button
            key={option}
            type="button"
            aria-pressed={active}
            title={option === "morning" ? copy.morning : copy.night}
            onClick={() => setAppearance(option)}
            className={[
              "min-h-8 min-w-14 rounded-lg px-3 font-mono text-xs font-bold transition sm:min-w-16",
              active
                ? option === "night"
                  ? "bg-zinc-950 text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,.22)]"
                  : "bg-cyan-200 text-sky-950 shadow-[0_0_18px_rgba(34,211,238,.25)]"
                : morningMode
                  ? "text-slate-600 hover:bg-cyan-100/70 hover:text-sky-800"
                  : "text-cyan-100 hover:bg-white/10 hover:text-cyan-50",
            ].join(" ")}
          >
            {option === "morning" ? copy.morning : copy.night}
          </button>
        );
      })}
    </div>
  );
}

function AuthLoadingScreen({ language }) {
  const label =
    language === "zh"
      ? "正在載入帳戶"
      : language === "es"
        ? "Cargando cuenta"
        : "Loading account";

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
