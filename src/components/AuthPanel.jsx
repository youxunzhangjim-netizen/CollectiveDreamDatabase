import { useEffect, useState } from "react";
import {
  loginAnonymously,
  loginWithEmail,
  loginWithGoogle,
  signupWithEmail,
} from "../lib/authService.js";
import {
  getKnownAuthErrorMessage,
  reportAuthError,
} from "../lib/authErrorMessages.js";
import LanguageMenu from "./LanguageMenu.jsx";

const AUTH_COPY = {
  en: {
    documentTitle: "Access Collective Dream Database",
    languageLabel: "Switch interface language",
    englishLabel: "English interface",
    chineseLabel: "Traditional Chinese interface",
    spanishLabel: "Spanish interface",
    databaseButton: "Public Database",
    recordButton: "Record Dream",
    eyebrow: "Secure Identity Gateway",
    title: "Access the Collective Dream Database",
    subtitle:
      "Authenticate into your private observation console with email, password, Google, or guest access.",
    loginTab: "Login",
    signupTab: "Sign up",
    emailLabel: "Email",
    emailPlaceholder: "dreamer@example.com",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter access phrase",
    showPassword: "Show password",
    hidePassword: "Hide password",
    loginButton: "Access Database",
    signupButton: "Initialize Profile",
    googleButton: "Continue with Google",
    loadingLogin: "Checking access",
    loadingSignup: "Initializing profile",
    loadingGoogle: "Opening Google gateway",
    loadingGuest: "Opening guest access",
    switchToSignup: "Need an identity profile?",
    switchToLogin: "Already initialized?",
    switchSignupAction: "Create account",
    switchLoginAction: "Return to login",
    guestButton: "Continue as Guest",
    emailRequired: "Enter an email address before continuing.",
    passwordRequired: "Enter a password before continuing.",
    authUnavailable: "This access method is not available yet. Try another option.",
    invalidLogin: "The email or password does not match an active profile.",
    emailInUse: "This email already has a profile. Return to login instead.",
    weakPassword: "Use a stronger password with at least 6 characters.",
    popupClosed: "The sign-in window was closed before access was confirmed.",
    networkError: "The secure access channel is offline. Try again soon.",
    genericAuthError: "Access could not be confirmed. Try again or use guest access.",
    signalA: "Encrypted channel",
    signalB: "Session firewall",
    signalC: "Identity mask",
  },
  zh: {
    documentTitle: "進入集體夢境資料庫",
    languageLabel: "切換介面語言",
    englishLabel: "英文介面",
    chineseLabel: "繁體中文介面",
    spanishLabel: "西班牙文介面",
    databaseButton: "公開資料庫",
    recordButton: "記錄夢境",
    eyebrow: "安全身分閘道",
    title: "進入集體夢境資料庫",
    subtitle:
      "登入你的私人觀測終端，可使用電子郵件、密碼、Google 或訪客通道。",
    loginTab: "登入",
    signupTab: "註冊",
    emailLabel: "電子郵件",
    emailPlaceholder: "dreamer@example.com",
    passwordLabel: "密碼",
    passwordPlaceholder: "輸入存取密語",
    showPassword: "顯示密碼",
    hidePassword: "隱藏密碼",
    loginButton: "存取資料庫",
    signupButton: "初始化個人檔案",
    googleButton: "使用 Google 繼續",
    loadingLogin: "正在確認存取權限",
    loadingSignup: "正在初始化檔案",
    loadingGoogle: "正在開啟 Google 閘道",
    loadingGuest: "正在開啟訪客通道",
    switchToSignup: "需要建立身分檔案？",
    switchToLogin: "已完成初始化？",
    switchSignupAction: "建立帳戶",
    switchLoginAction: "返回登入",
    guestButton: "以訪客身分繼續",
    emailRequired: "請先輸入電子郵件地址。",
    passwordRequired: "請先輸入密碼。",
    authUnavailable: "此存取方式尚未啟用，請改用其他選項。",
    invalidLogin: "電子郵件或密碼與現有檔案不相符。",
    emailInUse: "此電子郵件已建立檔案，請返回登入。",
    weakPassword: "請使用至少 6 個字元的更安全密碼。",
    popupClosed: "登入視窗在確認前已關閉。",
    networkError: "安全存取通道暫時離線，請稍後再試。",
    genericAuthError: "無法確認存取權限，請重試或改用訪客通道。",
    signalA: "加密通道",
    signalB: "工作階段防火牆",
    signalC: "身分遮罩",
  },
  es: {
    documentTitle: "Acceso a la Base de Sueños Colectivos",
    languageLabel: "Cambiar idioma de la interfaz",
    englishLabel: "Interfaz en inglés",
    chineseLabel: "Interfaz en chino tradicional",
    spanishLabel: "Interfaz en español",
    databaseButton: "Base pública",
    recordButton: "Registrar sueño",
    eyebrow: "Puerta segura de identidad",
    title: "Accede a la Base de Sueños Colectivos",
    subtitle:
      "Entra en tu consola privada con correo, contraseña, Google o acceso invitado.",
    loginTab: "Iniciar sesión",
    signupTab: "Crear cuenta",
    emailLabel: "Correo",
    emailPlaceholder: "dreamer@example.com",
    passwordLabel: "Contraseña",
    passwordPlaceholder: "Introduce la frase de acceso",
    showPassword: "Mostrar contraseña",
    hidePassword: "Ocultar contraseña",
    loginButton: "Acceder",
    signupButton: "Inicializar perfil",
    googleButton: "Continuar con Google",
    loadingLogin: "Confirmando acceso",
    loadingSignup: "Inicializando perfil",
    loadingGoogle: "Abriendo Google",
    loadingGuest: "Abriendo acceso invitado",
    switchToSignup: "¿Necesitas un perfil?",
    switchToLogin: "¿Ya tienes perfil?",
    switchSignupAction: "Crear cuenta",
    switchLoginAction: "Volver al inicio",
    guestButton: "Continuar como invitado",
    emailRequired: "Introduce un correo antes de continuar.",
    passwordRequired: "Introduce una contraseña antes de continuar.",
    authUnavailable: "Este método de acceso aún no está disponible. Prueba otra opción.",
    invalidLogin: "El correo o la contraseña no coincide con un perfil activo.",
    emailInUse: "Este correo ya tiene un perfil. Vuelve al inicio de sesión.",
    weakPassword: "Usa una contraseña más fuerte de al menos 6 caracteres.",
    popupClosed: "La ventana de acceso se cerró antes de confirmar.",
    networkError: "El canal seguro está desconectado. Inténtalo de nuevo pronto.",
    genericAuthError: "No se pudo confirmar el acceso. Intenta otra vez o entra como invitado.",
    signalA: "Canal cifrado",
    signalB: "Cortafuegos de sesión",
    signalC: "Máscara de identidad",
  },
};

export default function AuthPanel({
  language = "zh",
  setLanguage = () => {},
  onAuthenticated,
  onOpenDatabase,
  onOpenRecorder,
}) {
  const copy = AUTH_COPY[language] || AUTH_COPY.zh;
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");
  const isLogin = mode === "login";
  const primaryLabel = isLogin ? copy.loginButton : copy.signupButton;

  useEffect(() => {
    document.title = copy.documentTitle;
  }, [copy.documentTitle]);

  function getAuthErrorMessage(error) {
    if (!error?.code) return copy.genericAuthError;

    const knownMessage = getKnownAuthErrorMessage(error, language);
    if (knownMessage) return knownMessage;

    const errorMessages = {
      "auth/operation-not-allowed": copy.authUnavailable,
      "auth/admin-restricted-operation": copy.authUnavailable,
      "auth/invalid-credential": copy.invalidLogin,
      "auth/wrong-password": copy.invalidLogin,
      "auth/user-not-found": copy.invalidLogin,
      "auth/email-already-in-use": copy.emailInUse,
      "auth/weak-password": copy.weakPassword,
      "auth/popup-closed-by-user": copy.popupClosed,
      "auth/cancelled-popup-request": copy.popupClosed,
      "auth/network-request-failed": copy.networkError,
    };

    return errorMessages[error.code] || copy.genericAuthError;
  }

  async function runFirebaseAuth(action) {
    setError("");

    if (action !== "google" && action !== "guest" && !email.trim()) {
      setError(copy.emailRequired);
      return;
    }

    if (action !== "google" && action !== "guest" && !password.trim()) {
      setError(copy.passwordRequired);
      return;
    }

    setLoading(action);

    try {
      const credential =
        action === "login"
          ? await loginWithEmail(email, password)
          : action === "signup"
            ? await signupWithEmail(email, password)
            : action === "guest"
              ? await loginAnonymously()
              : await loginWithGoogle();

      if (credential?.user) {
        onAuthenticated?.(credential.user);
      }
    } catch (error) {
      reportAuthError("main access", error);
      setError(getAuthErrorMessage(error));
    } finally {
      setLoading("");
    }
  }

  async function handleLogin() {
    await runFirebaseAuth("login");
  }

  async function handleSignup() {
    await runFirebaseAuth("signup");
  }

  async function handleGoogleAuth() {
    await runFirebaseAuth("google");
  }

  async function handleGuestAuth() {
    await runFirebaseAuth("guest");
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (isLogin) {
      handleLogin();
      return;
    }

    handleSignup();
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030407] text-zinc-100 selection:bg-cyan-300/30 selection:text-cyan-50">
      <AuthBackground />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onOpenDatabase}
            className="group flex items-center gap-3"
          >
            <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-cyan-300/30 bg-cyan-300/10 shadow-[0_0_24px_rgba(34,211,238,.16)]">
              <span className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,.35),transparent_55%)]" />
              <span className="relative font-mono text-sm font-bold text-cyan-100">C∴</span>
            </span>

            <span className="hidden text-left sm:block">
              <span className="block font-mono text-xs uppercase tracking-[0.36em] text-cyan-200/80">
                CDDB
              </span>
              <span className="block text-sm font-semibold text-zinc-100">
                {copy.databaseButton}
              </span>
            </span>
          </button>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={onOpenRecorder}
              className="rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.18em] text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-300/15"
            >
              {copy.recordButton}
            </button>
            <LanguageToggle language={language} setLanguage={setLanguage} copy={copy} />
          </div>
        </header>

        <section className="grid flex-1 items-center gap-8 py-10 lg:grid-cols-[1.05fr_.95fr]">
          <div className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.42em] text-cyan-200/70">
              {copy.eyebrow}
            </p>
            <h1 className="mt-5 text-4xl font-semibold text-zinc-50 sm:text-5xl lg:text-6xl">
              {copy.title}
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-zinc-300 sm:text-base">
              {copy.subtitle}
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <SignalTile label={copy.signalA} value="AES-256" />
              <SignalTile label={copy.signalB} value="ACTIVE" />
              <SignalTile label={copy.signalC} value="ON" />
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/75 shadow-terminal backdrop-blur"
          >
            <div className="border-b border-white/10 bg-black/30 p-4">
              <div className="grid grid-cols-2 rounded-2xl border border-white/10 bg-black/40 p-1">
                <ModeButton active={isLogin} onClick={() => setMode("login")}>
                  {copy.loginTab}
                </ModeButton>
                <ModeButton active={!isLogin} onClick={() => setMode("signup")}>
                  {copy.signupTab}
                </ModeButton>
              </div>
            </div>

            <div className="space-y-5 p-5 sm:p-7">
              <label className="block">
                <span className="mb-2 block font-mono text-xs uppercase tracking-[0.22em] text-zinc-400">
                  {copy.emailLabel}
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={copy.emailPlaceholder}
                  autoComplete="email"
                  className="w-full rounded-2xl border border-cyan-300/15 bg-black/40 px-4 py-3 font-mono text-sm text-cyan-50 outline-none transition placeholder:text-zinc-600 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20"
                />
              </label>

              <label className="block">
                <span className="mb-2 block font-mono text-xs uppercase tracking-[0.22em] text-zinc-400">
                  {copy.passwordLabel}
                </span>
                <span className="relative block">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={copy.passwordPlaceholder}
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    className="w-full rounded-2xl border border-cyan-300/15 bg-black/40 py-3 pl-4 pr-12 font-mono text-sm text-cyan-50 outline-none transition placeholder:text-zinc-600 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    title={showPassword ? copy.hidePassword : copy.showPassword}
                    aria-label={showPassword ? copy.hidePassword : copy.showPassword}
                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl text-cyan-100/70 transition hover:bg-cyan-300/10 hover:text-cyan-50"
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </span>
              </label>

              {error && (
                <div className="rounded-2xl border border-red-300/20 bg-red-400/5 p-3 font-mono text-xs leading-5 text-red-100">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={Boolean(loading)}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-cyan-300/35 bg-cyan-300 px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.22em] text-zinc-950 shadow-[0_0_28px_rgba(34,211,238,.18)] transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading === "login" || loading === "signup" ? <LoadingSpinner dark /> : null}
                {loading === "login"
                  ? copy.loadingLogin
                  : loading === "signup"
                    ? copy.loadingSignup
                    : primaryLabel}
              </button>

              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={Boolean(loading)}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-zinc-100 transition hover:border-fuchsia-300/35 hover:bg-fuchsia-300/10 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading === "google" ? <LoadingSpinner /> : <GoogleMark />}
                {loading === "google" ? copy.loadingGoogle : copy.googleButton}
              </button>

              <button
                type="button"
                onClick={handleGuestAuth}
                disabled={Boolean(loading)}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-cyan-300/20 bg-cyan-300/5 px-4 py-3 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100 transition hover:border-cyan-300/40 hover:bg-cyan-300/10 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading === "guest" ? <LoadingSpinner /> : null}
                {loading === "guest" ? copy.loadingGuest : copy.guestButton}
              </button>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5 text-sm">
                <span className="text-zinc-500">
                  {isLogin ? copy.switchToSignup : copy.switchToLogin}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setMode(isLogin ? "signup" : "login");
                  }}
                  className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-100 transition hover:text-cyan-300"
                >
                  {isLogin ? copy.switchSignupAction : copy.switchLoginAction}
                </button>
              </div>

            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

function AuthBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute left-[-10rem] top-[-14rem] h-[34rem] w-[34rem] rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute bottom-[-16rem] right-[-12rem] h-[38rem] w-[38rem] rounded-full bg-fuchsia-500/10 blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] bg-[size:42px_42px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,.10),transparent_34rem)]" />
    </div>
  );
}

function LanguageToggle({ language, setLanguage, copy }) {
  return <LanguageMenu language={language} setLanguage={setLanguage} copy={copy} />;
}

function ModeButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={[
        "rounded-xl px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.2em] transition",
        active
          ? "bg-cyan-300 text-zinc-950 shadow-[0_0_20px_rgba(34,211,238,.18)]"
          : "text-zinc-500 hover:bg-white/5 hover:text-cyan-100",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function SignalTile({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
        {label}
      </p>
      <p className="mt-2 font-mono text-sm font-semibold text-cyan-100">{value}</p>
    </div>
  );
}

function LoadingSpinner({ dark = false }) {
  return (
    <span
      className={[
        "h-4 w-4 animate-spin rounded-full border-2 border-t-transparent",
        dark ? "border-zinc-950" : "border-cyan-100",
      ].join(" ")}
      aria-hidden="true"
    />
  );
}

function GoogleMark() {
  return (
    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 font-mono text-xs font-bold text-zinc-950">
      G
    </span>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="none">
      <path
        d="M2.8 12s3.3-6 9.2-6 9.2 6 9.2 6-3.3 6-9.2 6-9.2-6-9.2-6Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="none">
      <path
        d="m4 4 16 16M9.9 5.5A10.3 10.3 0 0 1 12 5.3c5.9 0 9.2 6.7 9.2 6.7a15.3 15.3 0 0 1-3 3.8M7.3 7.2A15 15 0 0 0 2.8 12S6.1 18.7 12 18.7a9.5 9.5 0 0 0 4-.9"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
      <path
        d="M9.9 9.9a3.2 3.2 0 0 0 4.2 4.2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}
