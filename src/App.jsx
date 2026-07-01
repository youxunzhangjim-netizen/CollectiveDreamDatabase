import { useEffect, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import AuthPanel from "./components/AuthPanel.jsx";
import BetaGate from "./components/BetaGate.jsx";
import BetaOnboarding from "./components/BetaOnboarding.jsx";
import CollectiveDreamDashboard from "./components/CollectiveDreamDashboard.jsx";
import DreamRecordPage from "./components/DreamRecordPage.jsx";
import FeedbackWidget from "./components/FeedbackWidget.jsx";
import Footer from "./components/Footer.jsx";
import ImportDreamDiaryPage from "./components/ImportDreamDiaryPage.jsx";
import LegalInfoPage from "./components/LegalInfoPage.jsx";
import OfflineStatusBanner from "./components/OfflineStatusBanner.jsx";
import PWAInstallPrompt from "./components/PWAInstallPrompt.jsx";
import PWAUpdatePrompt from "./components/PWAUpdatePrompt.jsx";
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
import {
  clearOfflineDreamDrafts,
  listOfflineDreamDrafts,
} from "./lib/offlineDreamDraftService.js";
import { getNativePlatform, isNativeAppShell } from "./lib/nativeApp.js";
import { fetchRecordById } from "./lib/recordsService.js";
import {
  fetchBetaState,
  trackSafeAnalyticsEvent,
} from "./lib/betaService.js";

export default function App() {
  const [language, setLanguageState] = useState(getLanguageFromStorage);
  const [appearance, setAppearance] = useState(getAppearanceFromStorage);
  const [activeView, setActiveView] = useState(getInitialViewFromPathname);
  const [legalPage, setLegalPage] = useState(getInitialLegalPageFromPathname);
  const [lastListView, setLastListView] = useState("database");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [appProfile, setAppProfile] = useState(null);
  const [betaState, setBetaState] = useState({
    config: { enabled: false },
    access: null,
    allowed: true,
    reason: "loading",
  });
  const [betaLoading, setBetaLoading] = useState(true);
  const { currentUser, loading: authLoading } = useAuth();
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(error) {
      console.warn("[CollectiveDreamObservatory PWA]", error);
    },
  });

  useEffect(() => {
    document.documentElement.lang = getHtmlLang(language);
  }, [language]);

  useEffect(() => {
    document.documentElement.dataset.appearance = appearance;
  }, [appearance]);

  useEffect(() => {
    const platform = getNativePlatform();
    if (isNativeAppShell()) {
      document.documentElement.dataset.nativePlatform = platform;
      document.documentElement.classList.add("cdo-native-shell");
    } else {
      delete document.documentElement.dataset.nativePlatform;
      document.documentElement.classList.remove("cdo-native-shell");
    }
  }, []);

  useEffect(() => {
    if (!currentUser?.uid) {
      setAppProfile(null);
      return undefined;
    }

    let ignore = false;

    async function syncAccountProfile() {
      try {
        const profile = await getOrCreateUserProfile(currentUser);
        const storedLanguage = getStoredLanguagePreference();

        if (ignore) return;
        setAppProfile(profile);

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

    syncAccountProfile();

    return () => {
      ignore = true;
    };
  }, [currentUser]);

  useEffect(() => {
    let ignore = false;

    async function syncBetaState() {
      setBetaLoading(true);
      try {
        const nextState = await fetchBetaState(currentUser, appProfile);
        if (!ignore) setBetaState(nextState);
      } catch {
        if (!ignore) {
          setBetaState({
            config: { enabled: false },
            access: null,
            allowed: true,
            reason: "unavailable",
          });
        }
      } finally {
        if (!ignore) setBetaLoading(false);
      }
    }

    syncBetaState();

    return () => {
      ignore = true;
    };
  }, [
    currentUser?.uid,
    currentUser?.email,
    appProfile?.isAdmin,
    appProfile?.role,
    appProfile?.betaAccessGranted,
  ]);

  useEffect(() => {
    if (authLoading) return;
    trackSafeAnalyticsEvent("app_opened", { currentUser, language }).catch(() => {});
    // Fire once after auth resolves so this stays product-level, not route-level.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);

  useEffect(() => {
    if (authLoading) return;

    const eventByView = {
      database: "public_archive_opened",
      record: "record_page_opened",
      import: "diary_import_started",
      dashboard: "my_dream_map_opened",
    };
    const eventName = eventByView[activeView];
    if (!eventName) return;

    trackSafeAnalyticsEvent(eventName, { currentUser, language }).catch(() => {});
  }, [activeView, authLoading, currentUser, language]);

  useEffect(() => {
    if (currentUser && !currentUser.isAnonymous && activeView === "auth") {
      setActiveView("dashboard");
    }

    if (!currentUser && activeView === "dashboard") {
      setActiveView("auth");
    }
  }, [activeView, currentUser]);

  function handleAuthenticated() {
    setActiveView("dashboard");
  }

  async function refreshBetaState() {
    const nextState = await fetchBetaState(currentUser, appProfile);
    setBetaState(nextState);
  }

  function handleAccountDeleted() {
    setSelectedRecord(null);
    setActiveView("auth");
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
    try {
      const localDrafts = await listOfflineDreamDrafts({
        ownerId: currentUser?.uid || "",
      });

      if (localDrafts.length > 0) {
        const keepDrafts = window.confirm(getSignOutDraftWarning(language));
        if (!keepDrafts) {
          await clearOfflineDreamDrafts({ ownerId: currentUser?.uid || "" });
        }
      }
    } catch {
      // Sign-out should still work if IndexedDB is unavailable.
    }

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

  function openImporter() {
    trackSafeAnalyticsEvent("diary_import_started", { currentUser, language }).catch(() => {});
    setActiveView("import");
  }

  function trackDreamSave(record = {}) {
    const sharingMode = record.sharingMode || record.requestedSharingMode || "private";
    const eventName =
      sharingMode === "stats_only"
        ? "dream_saved_stats_only"
        : sharingMode === "anonymous_public" || sharingMode === "redacted_public"
          ? "dream_shared_anonymous"
          : sharingMode === "pseudonym_public"
            ? "dream_shared_pseudonym"
            : "dream_saved_private";

    trackSafeAnalyticsEvent(eventName, {
      currentUser,
      language,
      metadata: {
        sharingMode,
        hasImages: Boolean(record.imageUrls?.length || record.images?.length),
        hasSketch: Boolean(record.sketches?.length),
      },
    }).catch(() => {});
  }

  function renderShell(content) {
    const showBetaOnboarding =
      Boolean(currentUser?.uid) &&
      betaState?.allowed &&
      betaState?.config?.enabled &&
      appProfile &&
      appProfile.betaOnboardingCompleted !== true;

    return (
      <>
        <AppearanceToggle
          language={language}
          appearance={appearance}
          setAppearance={handleAppearanceChange}
        />
        <OfflineStatusBanner language={language} />
        <PWAUpdatePrompt
          language={language}
          visible={needRefresh}
          onUpdate={() => {
            window.dispatchEvent(new CustomEvent("cdo:save-current-record-draft"));
            updateServiceWorker(true);
          }}
          onDismiss={() => setNeedRefresh(false)}
        />
        <PWAInstallPrompt language={language} />
        <FeedbackWidget language={language} currentUser={currentUser} />
        {showBetaOnboarding && (
          <BetaOnboarding
            language={language}
            currentUser={currentUser}
            onDone={() =>
              setAppProfile((current) => ({
                ...(current || {}),
                betaOnboardingCompleted: true,
              }))
            }
          />
        )}
        {content}
        <Footer language={language} />
      </>
    );
  }

  if (authLoading) {
    return renderShell(<AuthLoadingScreen language={language} />);
  }

  if (betaLoading && activeView !== "legal" && activeView !== "auth") {
    return renderShell(<AuthLoadingScreen language={language} />);
  }

  if (
    betaState?.config?.enabled &&
    betaState?.allowed !== true &&
    activeView !== "legal" &&
    activeView !== "auth"
  ) {
    return renderShell(
      <BetaGate
        language={language}
        currentUser={currentUser}
        onOpenAuth={() => setActiveView("auth")}
        onRedeemed={refreshBetaState}
      />
    );
  }

  if (activeView === "database") {
    return renderShell(
      <CollectiveDreamDashboard
          language={language}
          setLanguage={handleLanguageChange}
          currentUser={currentUser}
          onOpenAuth={() => setActiveView(currentUser ? "dashboard" : "auth")}
          onOpenRecorder={() => setActiveView("record")}
          onOpenImporter={openImporter}
          onOpenRecord={(record) => openDreamRecord(record, "database")}
        />
    );
  }

  if (activeView === "legal") {
    return renderShell(
      <LegalInfoPage
        page={legalPage}
        language={language}
        setLanguage={handleLanguageChange}
        onBack={() => setActiveView(lastListView || "database")}
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
          onOpenAuth={() => setActiveView("auth")}
          onOpenRecorder={() => setActiveView("record")}
          onImported={(record) => {
            trackSafeAnalyticsEvent("diary_import_completed", {
              currentUser,
              language,
              metadata: { importedCount: 1 },
            }).catch(() => {});
            openDreamRecord(record, "import");
          }}
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
          onOpenImporter={openImporter}
          onSubmitted={(record) => {
            trackDreamSave(record);
            openDreamRecord(record, "record");
          }}
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
          onOpenImporter={openImporter}
          onOpenRecord={(record) => openDreamRecord(record, "dashboard")}
          onAccountDeleted={handleAccountDeleted}
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
        onOpenImporter={openImporter}
      />
  );
}

function getInitialViewFromPathname() {
  if (typeof window === "undefined") return "database";

  const pathname = window.location.pathname.toLowerCase();
  if (getLegalPageFromPathname(pathname)) return "legal";
  if (pathname.startsWith("/record")) return "record";
  if (pathname.startsWith("/import")) return "import";
  if (pathname.startsWith("/dashboard")) return "dashboard";
  if (pathname.startsWith("/account")) return "dashboard";
  if (pathname.startsWith("/explore")) return "database";
  if (pathname.startsWith("/patterns")) return "database";
  return "database";
}

function getInitialLegalPageFromPathname() {
  if (typeof window === "undefined") return "privacy";

  return getLegalPageFromPathname(window.location.pathname) || "privacy";
}

function getLegalPageFromPathname(pathname = "") {
  const normalized = pathname.toLowerCase().replace(/\/+$/, "") || "/";

  if (normalized.startsWith("/privacy")) return "privacy";
  if (normalized.startsWith("/terms")) return "terms";
  if (normalized.startsWith("/community-guidelines")) return "guidelines";
  if (normalized.startsWith("/guidelines")) return "guidelines";
  if (normalized.startsWith("/content-removal")) return "removal";
  if (normalized.startsWith("/removal")) return "removal";
  if (normalized.startsWith("/not-diagnosis")) return "diagnosis";
  if (normalized.startsWith("/diagnosis")) return "diagnosis";
  if (normalized.startsWith("/support")) return "support";
  if (normalized.startsWith("/contact")) return "support";
  if (normalized.startsWith("/account/delete")) return "account-deletion";
  if (normalized.startsWith("/account-deletion")) return "account-deletion";

  return "";
}

function getSignOutDraftWarning(language) {
  if (language === "es") {
    return "Hay borradores locales guardados en este dispositivo. Aceptar los mantiene; Cancelar los borra antes de cerrar sesión.";
  }

  if (language === "zh") {
    return "此裝置有本機夢境草稿。按「確定」會保留；按「取消」會先清除再登出。";
  }

  return "Local dream drafts are stored on this device. OK keeps them; Cancel clears them before signing out.";
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
