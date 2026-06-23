import { useEffect, useMemo, useRef, useState } from "react";
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
import { auth } from "../lib/firebaseClient.js";
import { LANGUAGE_OPTIONS } from "../lib/language.js";
import { getOrCreateUserProfile } from "../lib/profileService.js";
import { createDreamRecord } from "../lib/recordsService.js";
import {
  getCategoryLabel,
  getTagLabel,
  normalizeCustomTagLabel,
  RECORDER_TAG_GROUPS,
  RECORD_TAGS,
  tagExists,
} from "../lib/tagTaxonomy.js";

const RECORD_COPY = {
  en: {
    documentTitle: "Record a Dream",
    languageLabel: "Switch interface language",
    englishLabel: "English interface",
    chineseLabel: "Traditional Chinese interface",
    spanishLabel: "Spanish interface",
    database: "Database",
    account: "Account",
    guest: "Guest",
    accountLinked: "Linked account",
    guestMode: "Anonymous record",
    kicker: "Fast Wake Recording",
    title: "Record the dream before it fades.",
    subtitle:
      "Start with the words. Login is optional before publishing; if you login here, this draft will attach to your account automatically.",
    dreamTextLabel: "Dream words",
    dreamTextPlaceholder:
      "Write fragments, scenes, feelings, places, dialogue, colors, sounds... exact order is not required.",
    optionalTitle: "Outline / main idea (optional)",
    titlePlaceholder: "Dreams do not need a topic; leave blank if none is clear",
    dreamDate: "Dream date",
    originalLanguage: "Original language",
    ageAtDream: "Age at dream",
    agePlaceholder: "Optional",
    tagSectionTitle: "Dream tags",
    customTags: "Custom tags",
    customTagPlaceholder: "Add a missing tag to this type",
    addCustomTag: "Add tag",
    duplicateTag: "A matching tag already exists.",
    customTagHelp: "Add only when the existing options in this type do not match.",
    adultContent: "Includes adult content",
    recordIdentity: "Public recorder identity",
    recordAsAccount: "Show account",
    recordAsAnonymous: "Hide identity",
    submitAccount: "Publish to My Account",
    submitAnonymous: "Publish Anonymously",
    submitting: "Publishing record",
    textRequired: "Write at least a few words before publishing.",
    publishError: "The record could not be published. Check your connection and try again.",
    publishPermissionDenied:
      "The archive permission blocked publishing. Please paste the latest Firestore rules, then try again.",
    publishAuthMismatch:
      "Your account session was still syncing. Try publishing once more.",
    publishUnavailable:
      "The archive is not reachable right now. Try again in a moment.",
    publishInvalidData:
      "One record field was rejected before publishing. Diagnostic code:",
    accountEditable:
      "Account-backed records can be edited or deleted later from your account.",
    anonymousLocked:
      "Anonymous records become public archive entries and cannot be edited or deleted later.",
    authTitle: "Optional account link",
    authText:
      "You can login or create an account without leaving this draft. After login, publishing will attach the dream to that account.",
    loginTab: "Login",
    signupTab: "Sign up",
    email: "Email",
    password: "Password",
    showPassword: "Show password",
    hidePassword: "Hide password",
    loginButton: "Login here",
    signupButton: "Create account",
    googleButton: "Continue with Google",
    loadingLogin: "Checking account",
    loadingSignup: "Creating account",
    loadingGoogle: "Opening Google",
    linkedNotice: "Account linked. This draft will publish to your account.",
    emailRequired: "Enter an email address.",
    passwordRequired: "Enter a password.",
    authError: "Account access could not be confirmed. The draft is still here.",
    rulesTitle: "Recording standards",
    rules: [
      "Dream records need written words; images are optional.",
      "First-person wording such as I, me, and my is welcome; dreamers do not need to rewrite their own voice.",
      "Record the actual feelings, views, sensory details, and uncertainty you remember.",
      "Do not invent, imagine, or reshape the dream to satisfy morals, expectations, beauty, fluency, or literary style.",
      "You may choose more precise words or add annotations for the dream itself, but keep the record honest, true, and free to your own nature.",
      "Keep private real names out of the public record. Use relations or descriptions like my mom, a coworker, or an old friend.",
      "Places are allowed, but do not publish a complete detailed address.",
      "Names of public works, celebrities, or public figures already visible on wiki pages or popular internet sources may be recorded.",
      "Keep the original words in the language you used, then label that original language.",
      "Mark adult content so age limits can protect readers.",
    ],
  },
  zh: {
    documentTitle: "記錄夢境",
    languageLabel: "切換介面語言",
    englishLabel: "英文介面",
    chineseLabel: "繁體中文介面",
    spanishLabel: "西班牙文介面",
    database: "資料庫",
    account: "帳戶",
    guest: "訪客",
    accountLinked: "已連結帳戶",
    guestMode: "匿名記錄",
    kicker: "醒來快速記錄",
    title: "先把夢寫下來，趁它還沒消散。",
    subtitle:
      "先寫文字。發布前可以選擇登入；如果你在這裡登入，這份草稿會自動連到你的帳戶。",
    dreamTextLabel: "夢境文字",
    dreamTextPlaceholder:
      "寫下片段、場景、感覺、地點、對話、顏色、聲音……不需要一開始就整理成完整順序。",
    optionalTitle: "大綱主旨（選填）",
    titlePlaceholder: "夢不一定需要主題；不清楚就留空",
    dreamDate: "夢境日期",
    originalLanguage: "原始語言",
    ageAtDream: "做夢時年齡",
    agePlaceholder: "選填",
    tagSectionTitle: "夢境標籤",
    customTags: "自訂標籤",
    customTagPlaceholder: "在此類型新增缺少的標籤",
    addCustomTag: "新增標籤",
    duplicateTag: "已經有相同或相近的標籤。",
    customTagHelp: "只有在此類型的現有選項不符合時才新增。",
    adultContent: "包含成人內容",
    recordIdentity: "公開記錄身分",
    recordAsAccount: "顯示帳戶",
    recordAsAnonymous: "隱藏身分",
    submitAccount: "發布到我的帳戶",
    submitAnonymous: "匿名發布",
    submitting: "正在發布記錄",
    textRequired: "發布前請至少寫下幾個字。",
    publishError: "記錄無法發布。請檢查連線後再試一次。",
    publishPermissionDenied: "資料庫權限擋住發布。請貼上最新 Firestore 規則後再試一次。",
    publishAuthMismatch: "你的帳戶狀態還在同步。請再按一次發布。",
    publishUnavailable: "資料庫目前無法連線。請稍後再試。",
    publishInvalidData: "有一個紀錄欄位在發布前被拒絕。診斷代碼：",
    accountEditable: "連到帳戶的記錄之後可以在帳戶中修改或刪除。",
    anonymousLocked: "匿名記錄發布後會成為公開檔案項目，之後不能修改或刪除。",
    authTitle: "選用帳戶連結",
    authText:
      "你可以在不離開草稿的情況下登入或建立帳戶。登入後，發布會自動連到該帳戶。",
    loginTab: "登入",
    signupTab: "註冊",
    email: "電子郵件",
    password: "密碼",
    showPassword: "顯示密碼",
    hidePassword: "隱藏密碼",
    loginButton: "在此登入",
    signupButton: "建立帳戶",
    googleButton: "使用 Google 繼續",
    loadingLogin: "正在確認帳戶",
    loadingSignup: "正在建立帳戶",
    loadingGoogle: "正在開啟 Google",
    linkedNotice: "帳戶已連結。這份草稿會發布到你的帳戶。",
    emailRequired: "請輸入電子郵件。",
    passwordRequired: "請輸入密碼。",
    authError: "無法確認帳戶存取；草稿仍然保留在這裡。",
    rulesTitle: "記錄標準",
    rules: [
      "夢境記錄必須有文字；圖片可以有，但不是必要。",
      "可以自然使用「我」、「我的」等第一人稱，不需要改寫掉自己的語氣。",
      "請記錄你實際記得的感受、視角、感官細節與不確定之處。",
      "不要為了道德、期待、美感、流暢或文學效果而創造、想像或改寫夢境。",
      "你可以為夢本身選用更準確的詞語或加註，但記錄應保持誠實、真實，並讓自己的自然狀態自由存在。",
      "公開記錄中不要寫私人真實姓名。必要時用關係或描述替代，例如我媽媽、同事、老朋友。",
      "可以寫地點，但不要公開完整詳細地址。",
      "已在維基或熱門網路來源公開可見的作品、名人或公眾人物名稱可以記錄。",
      "保留你最初使用語言的原文，並標示原始語言。",
      "如果包含成人內容，請加上標記，讓年齡限制保護讀者。",
    ],
  },
  es: {
    documentTitle: "Registrar un Sueño",
    languageLabel: "Cambiar idioma de la interfaz",
    englishLabel: "Interfaz en inglés",
    chineseLabel: "Interfaz en chino tradicional",
    spanishLabel: "Interfaz en español",
    database: "Base",
    account: "Cuenta",
    guest: "Invitado",
    accountLinked: "Cuenta vinculada",
    guestMode: "Registro anónimo",
    kicker: "Registro rápido al despertar",
    title: "Registra el sueño antes de que se desvanezca.",
    subtitle:
      "Empieza con las palabras. Iniciar sesión es opcional antes de publicar; si entras aquí, el borrador se conectará automáticamente a tu cuenta.",
    dreamTextLabel: "Palabras del sueño",
    dreamTextPlaceholder:
      "Escribe fragmentos, escenas, sensaciones, lugares, diálogos, colores, sonidos... no hace falta ordenarlo todo al inicio.",
    optionalTitle: "Esquema / idea principal (opcional)",
    titlePlaceholder: "El sueño no necesita tema; déjalo vacío si no está claro",
    dreamDate: "Fecha del sueño",
    originalLanguage: "Idioma original",
    ageAtDream: "Edad en el sueño",
    agePlaceholder: "Opcional",
    tagSectionTitle: "Etiquetas del sueño",
    customTags: "Etiquetas personalizadas",
    customTagPlaceholder: "Añade una etiqueta faltante a este tipo",
    addCustomTag: "Añadir etiqueta",
    duplicateTag: "Ya existe una etiqueta equivalente.",
    customTagHelp: "Añade solo cuando las opciones de este tipo no encajan.",
    adultContent: "Incluye contenido adulto",
    recordIdentity: "Identidad pública",
    recordAsAccount: "Mostrar cuenta",
    recordAsAnonymous: "Ocultar identidad",
    submitAccount: "Publicar en mi cuenta",
    submitAnonymous: "Publicar anónimo",
    submitting: "Publicando registro",
    textRequired: "Escribe al menos unas palabras antes de publicar.",
    publishError: "No se pudo publicar el registro. Revisa la conexión e inténtalo otra vez.",
    publishPermissionDenied:
      "El permiso del archivo bloqueó la publicación. Pega las reglas Firestore más recientes e inténtalo otra vez.",
    publishAuthMismatch:
      "La sesión de tu cuenta todavía se estaba sincronizando. Intenta publicar una vez más.",
    publishUnavailable:
      "El archivo no está disponible ahora. Inténtalo de nuevo en un momento.",
    publishInvalidData:
      "Un campo del registro fue rechazado antes de publicar. Código:",
    accountEditable:
      "Los registros conectados a una cuenta se pueden editar o eliminar más tarde.",
    anonymousLocked:
      "Los registros anónimos quedan como entradas públicas y no se pueden editar ni eliminar después.",
    authTitle: "Vincular cuenta opcional",
    authText:
      "Puedes iniciar sesión o crear cuenta sin salir del borrador. Después, la publicación se conectará a esa cuenta.",
    loginTab: "Entrar",
    signupTab: "Crear",
    email: "Correo",
    password: "Contraseña",
    showPassword: "Mostrar contraseña",
    hidePassword: "Ocultar contraseña",
    loginButton: "Entrar aquí",
    signupButton: "Crear cuenta",
    googleButton: "Continuar con Google",
    loadingLogin: "Confirmando cuenta",
    loadingSignup: "Creando cuenta",
    loadingGoogle: "Abriendo Google",
    linkedNotice: "Cuenta vinculada. Este borrador se publicará en tu cuenta.",
    emailRequired: "Introduce un correo.",
    passwordRequired: "Introduce una contraseña.",
    authError: "No se pudo confirmar la cuenta. El borrador sigue aquí.",
    rulesTitle: "Reglas de registro",
    rules: [
      "Los registros necesitan texto escrito; las imágenes son opcionales.",
      "Puedes usar primera persona como yo, me y mi; no hace falta quitar tu propia voz.",
      "Registra los sentimientos, vistas, detalles sensoriales e incertidumbres que realmente recuerdas.",
      "No inventes, imagines ni rehagas el sueño para ajustarlo a la moral, expectativas, belleza, fluidez o estilo literario.",
      "Puedes usar palabras más precisas o añadir anotaciones sobre el sueño mismo, pero mantén el registro honesto, verdadero y libre para tu propia naturaleza.",
      "No publiques nombres reales privados. Usa relaciones o descripciones como mi mamá, un colega o una vieja amistad.",
      "Puedes incluir lugares, pero no una dirección completa y detallada.",
      "Se pueden registrar obras, celebridades o figuras públicas ya visibles en wikis o fuentes populares de internet.",
      "Conserva las palabras originales en el idioma que usaste y etiqueta ese idioma original.",
      "Marca el contenido adulto para que el límite de edad proteja a los lectores.",
    ],
  },
};

export default function RecordDreamPage({
  language = "zh",
  setLanguage = () => {},
  currentUser,
  onOpenDatabase,
  onOpenDashboard,
  onSubmitted,
}) {
  const copy = RECORD_COPY[language] || RECORD_COPY.zh;
  const textAreaRef = useRef(null);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [dreamText, setDreamText] = useState("");
  const [title, setTitle] = useState("");
  const [dreamDate, setDreamDate] = useState(today);
  const [originalLanguage, setOriginalLanguage] = useState(language || "zh");
  const [ageAtDream, setAgeAtDream] = useState("");
  const [adultContent, setAdultContent] = useState(false);
  const [selectedTagSlugs, setSelectedTagSlugs] = useState([]);
  const [customTagDrafts, setCustomTagDrafts] = useState({});
  const [customTagEntries, setCustomTagEntries] = useState([]);
  const [tagNotices, setTagNotices] = useState({});
  const [recordIdentityMode, setRecordIdentityMode] = useState("anonymous");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState("");
  const [authError, setAuthError] = useState("");
  const [authNotice, setAuthNotice] = useState("");
  const accountBacked = Boolean(currentUser?.uid && !currentUser.isAnonymous);

  useEffect(() => {
    document.title = copy.documentTitle;
  }, [copy.documentTitle]);

  useEffect(() => {
    textAreaRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!accountBacked) {
      setRecordIdentityMode("anonymous");
    }
  }, [accountBacked]);

  function toggleTag(slug) {
    setSelectedTagSlugs((current) =>
      current.includes(slug)
        ? current.filter((item) => item !== slug)
        : [...current, slug]
    );
  }

  function updateCustomTagDraft(category, value) {
    setCustomTagDrafts((current) => ({ ...current, [category]: value }));
    setTagNotices((current) => ({ ...current, [category]: "" }));
  }

  function addCustomTag(category) {
    const label = normalizeCustomTagLabel(customTagDrafts[category]);

    if (!label) return;

    if (tagExists(label, customTagEntries)) {
      setTagNotices((current) => ({ ...current, [category]: copy.duplicateTag }));
      return;
    }

    setCustomTagEntries((current) => [...current, { label, category }]);
    setCustomTagDrafts((current) => ({ ...current, [category]: "" }));
    setTagNotices((current) => ({ ...current, [category]: "" }));
  }

  function removeCustomTag(category, label) {
    setCustomTagEntries((current) =>
      current.filter((item) => item.category !== category || item.label !== label)
    );
  }

  function getAuthErrorMessage(error) {
    if (!error?.code) return copy.authError;

    const knownMessage = getKnownAuthErrorMessage(error, language);
    if (knownMessage) return knownMessage;

    if (
      [
        "auth/operation-not-allowed",
        "auth/admin-restricted-operation",
        "auth/invalid-credential",
        "auth/wrong-password",
        "auth/user-not-found",
        "auth/email-already-in-use",
        "auth/weak-password",
        "auth/popup-closed-by-user",
        "auth/cancelled-popup-request",
        "auth/network-request-failed",
      ].includes(error.code)
    ) {
      return copy.authError;
    }

    return copy.authError;
  }

  async function runAccountAction(action) {
    setAuthError("");
    setAuthNotice("");

    if (action !== "google" && !email.trim()) {
      setAuthError(copy.emailRequired);
      return;
    }

    if (action !== "google" && !password.trim()) {
      setAuthError(copy.passwordRequired);
      return;
    }

    setAuthLoading(action);

    try {
      let credential = null;

      if (action === "login") {
        credential = await loginWithEmail(email, password);
      } else if (action === "signup") {
        credential = await signupWithEmail(email, password);
      } else {
        credential = await loginWithGoogle();
      }

      if (action === "google" && !credential?.user) {
        return;
      }

      setAuthNotice(copy.linkedNotice);
    } catch (error) {
      reportAuthError("recorder account link", error);
      setAuthError(getAuthErrorMessage(error));
    } finally {
      setAuthLoading("");
    }
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    await runAccountAction(authMode);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError("");

    if (!dreamText.trim()) {
      setSubmitError(copy.textRequired);
      textAreaRef.current?.focus();
      return;
    }

    setSubmitting(true);

    try {
      let submissionUser = auth?.currentUser || currentUser;

      if (!submissionUser?.uid) {
        const credential = await loginAnonymously();
        submissionUser = credential.user;
      }

      if (!submissionUser.isAnonymous) {
        await submissionUser.getIdToken(true).catch(() => {});
      }

      let profile = null;

      if (!submissionUser.isAnonymous) {
        try {
          profile = await getOrCreateUserProfile(submissionUser);
        } catch {
          profile = null;
        }
      }

      const record = await createDreamRecord(
        submissionUser,
        {
          dreamText,
          title,
          dreamDate,
          originalLanguage,
          ageAtDream,
          adultContent,
          selectedTagSlugs,
          customTagLabels: customTagEntries,
          recordIdentityMode,
        },
        profile
      );

      onSubmitted?.(record);
    } catch (error) {
      setSubmitError(getPublishErrorMessage(error, copy));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030407] text-zinc-100 selection:bg-cyan-300/30 selection:text-cyan-50">
      <RecorderBackground />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <button
            type="button"
            onClick={onOpenDatabase}
            className="group flex items-center gap-3"
          >
            <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-cyan-300/30 bg-cyan-300/10 shadow-[0_0_24px_rgba(34,211,238,.16)]">
              <span className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,.35),transparent_55%)]" />
              <span className="relative font-mono text-sm font-bold text-cyan-100">C∴</span>
            </span>
            <span>
              <span className="block font-mono text-xs uppercase tracking-[0.36em] text-cyan-200/80">
                CDDB
              </span>
              <span className="block text-sm font-semibold text-zinc-100">
                {copy.database}
              </span>
            </span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {currentUser?.uid && (
              <button
                type="button"
                onClick={onOpenDashboard}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.18em] text-zinc-100 transition hover:border-fuchsia-300/35 hover:bg-fuchsia-300/10"
              >
                {accountBacked ? copy.account : copy.guest}
              </button>
            )}
            <LanguageToggle language={language} setLanguage={setLanguage} copy={copy} />
          </div>
        </header>

        <section className="grid flex-1 gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(20rem,.55fr)]">
          <form
            onSubmit={handleSubmit}
            className="flex min-h-0 flex-col overflow-hidden rounded-3xl border border-cyan-300/15 bg-zinc-950/75 shadow-terminal backdrop-blur"
          >
            <div className="border-b border-white/10 bg-black/30 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.34em] text-cyan-200/70">
                    {copy.kicker}
                  </p>
                  <h1 className="mt-3 text-3xl font-semibold text-zinc-50 sm:text-4xl">
                    {copy.title}
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
                    {copy.subtitle}
                  </p>
                </div>
                <SessionBadge copy={copy} accountBacked={accountBacked} />
              </div>
            </div>

            <div className="flex-1 space-y-5 p-5 sm:p-6">
              <label className="block">
                <span className="mb-2 block font-mono text-xs uppercase tracking-[0.22em] text-cyan-100">
                  {copy.dreamTextLabel}
                </span>
                <textarea
                  ref={textAreaRef}
                  value={dreamText}
                  onChange={(event) => setDreamText(event.target.value)}
                  placeholder={copy.dreamTextPlaceholder}
                  className="min-h-[22rem] w-full resize-y rounded-2xl border border-cyan-300/20 bg-black/45 px-4 py-4 font-mono text-base leading-8 text-cyan-50 outline-none transition placeholder:text-zinc-600 focus:border-cyan-300/55 focus:ring-2 focus:ring-cyan-300/20"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                    {copy.optionalTitle}
                  </span>
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder={copy.titlePlaceholder}
                    className="w-full rounded-2xl border border-cyan-300/15 bg-black/40 px-4 py-3 font-mono text-sm text-cyan-50 outline-none transition placeholder:text-zinc-600 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                    {copy.dreamDate}
                  </span>
                  <input
                    type="date"
                    value={dreamDate}
                    onChange={(event) => setDreamDate(event.target.value)}
                    className="w-full rounded-2xl border border-cyan-300/15 bg-black/40 px-4 py-3 font-mono text-sm text-cyan-50 outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                    {copy.originalLanguage}
                  </span>
                  <select
                    value={originalLanguage}
                    onChange={(event) => setOriginalLanguage(event.target.value)}
                    className="w-full rounded-2xl border border-cyan-300/15 bg-black/40 px-4 py-3 font-mono text-sm text-cyan-50 outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20"
                  >
                    {LANGUAGE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                    {copy.ageAtDream}
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={ageAtDream}
                    onChange={(event) => setAgeAtDream(event.target.value)}
                    placeholder={copy.agePlaceholder}
                    className="w-full rounded-2xl border border-cyan-300/15 bg-black/40 px-4 py-3 font-mono text-sm text-cyan-50 outline-none transition placeholder:text-zinc-600 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20"
                  />
                </label>
              </div>

              <div className="space-y-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                  {copy.tagSectionTitle}
                </p>

                <div className="max-h-[28rem] space-y-3 overflow-y-auto rounded-2xl border border-white/10 bg-black/25 p-3 pr-2 [scrollbar-color:rgba(34,211,238,.45)_rgba(255,255,255,.08)] [scrollbar-width:thin]">
                  {RECORDER_TAG_GROUPS.map((group) => (
                    <TagGroup
                      key={group.category}
                      group={group}
                      language={language}
                      selectedTagSlugs={selectedTagSlugs}
                      onToggleTag={toggleTag}
                      copy={copy}
                      customTagValue={customTagDrafts[group.category] || ""}
                      customTags={customTagEntries.filter(
                        (entry) => entry.category === group.category
                      )}
                      tagNotice={tagNotices[group.category] || ""}
                      onCustomTagChange={(value) =>
                        updateCustomTagDraft(group.category, value)
                      }
                      onAddCustomTag={() => addCustomTag(group.category)}
                      onRemoveCustomTag={(label) =>
                        removeCustomTag(group.category, label)
                      }
                    />
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <label className="flex min-h-14 items-center gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/5 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={adultContent}
                    onChange={(event) => setAdultContent(event.target.checked)}
                    className="h-4 w-4 accent-amber-300"
                  />
                  <span className="font-mono text-xs uppercase tracking-[0.16em] text-amber-100">
                    {copy.adultContent}
                  </span>
                </label>

                {accountBacked && (
                  <div>
                    <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                      {copy.recordIdentity}
                    </p>
                    <div className="grid grid-cols-2 rounded-2xl border border-white/10 bg-black/40 p-1">
                      <ModeButton
                        active={recordIdentityMode === "account"}
                        onClick={() => setRecordIdentityMode("account")}
                      >
                        {copy.recordAsAccount}
                      </ModeButton>
                      <ModeButton
                        active={recordIdentityMode === "anonymous"}
                        onClick={() => setRecordIdentityMode("anonymous")}
                      >
                        {copy.recordAsAnonymous}
                      </ModeButton>
                    </div>
                  </div>
                )}
              </div>

              <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-zinc-300">
                {accountBacked ? copy.accountEditable : copy.anonymousLocked}
              </p>

              {submitError && (
                <p className="rounded-2xl border border-red-300/25 bg-red-400/5 p-4 font-mono text-xs leading-5 text-red-100">
                  {submitError}
                </p>
              )}
            </div>

            <div className="border-t border-white/10 bg-black/35 p-5">
              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-cyan-300/35 bg-cyan-300 px-4 py-4 font-mono text-xs font-bold uppercase tracking-[0.22em] text-zinc-950 shadow-[0_0_28px_rgba(34,211,238,.18)] transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting && <LoadingSpinner dark />}
                {submitting
                  ? copy.submitting
                  : accountBacked
                    ? copy.submitAccount
                    : copy.submitAnonymous}
              </button>
            </div>
          </form>

          <aside className="space-y-5">
            <section className="rounded-3xl border border-white/10 bg-zinc-950/75 p-5 shadow-terminal backdrop-blur">
              <p className="font-mono text-xs uppercase tracking-[0.26em] text-cyan-200/70">
                {copy.authTitle}
              </p>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                {accountBacked ? copy.linkedNotice : copy.authText}
              </p>

              {!accountBacked && (
                <form onSubmit={handleAuthSubmit} className="mt-5 space-y-4">
                  <div className="grid grid-cols-2 rounded-2xl border border-white/10 bg-black/40 p-1">
                    <ModeButton
                      active={authMode === "login"}
                      onClick={() => {
                        setAuthError("");
                        setAuthMode("login");
                      }}
                    >
                      {copy.loginTab}
                    </ModeButton>
                    <ModeButton
                      active={authMode === "signup"}
                      onClick={() => {
                        setAuthError("");
                        setAuthMode("signup");
                      }}
                    >
                      {copy.signupTab}
                    </ModeButton>
                  </div>

                  <label className="block">
                    <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                      {copy.email}
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      autoComplete="email"
                      className="w-full rounded-2xl border border-cyan-300/15 bg-black/40 px-4 py-3 font-mono text-sm text-cyan-50 outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                      {copy.password}
                    </span>
                    <span className="relative block">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        autoComplete={authMode === "login" ? "current-password" : "new-password"}
                        className="w-full rounded-2xl border border-cyan-300/15 bg-black/40 py-3 pl-4 pr-12 font-mono text-sm text-cyan-50 outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20"
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

                  {authError && (
                    <p className="rounded-2xl border border-red-300/20 bg-red-400/5 p-3 font-mono text-xs leading-5 text-red-100">
                      {authError}
                    </p>
                  )}
                  {authNotice && (
                    <p className="rounded-2xl border border-cyan-300/20 bg-cyan-300/5 p-3 font-mono text-xs leading-5 text-cyan-100">
                      {authNotice}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={Boolean(authLoading)}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl border border-cyan-300/35 bg-cyan-300 px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.18em] text-zinc-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {(authLoading === "login" || authLoading === "signup") && (
                      <LoadingSpinner dark />
                    )}
                    {authLoading === "login"
                      ? copy.loadingLogin
                      : authLoading === "signup"
                        ? copy.loadingSignup
                        : authMode === "login"
                          ? copy.loginButton
                          : copy.signupButton}
                  </button>

                  <button
                    type="button"
                    onClick={() => runAccountAction("google")}
                    disabled={Boolean(authLoading)}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-zinc-100 transition hover:border-fuchsia-300/35 hover:bg-fuchsia-300/10 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {authLoading === "google" ? <LoadingSpinner /> : <GoogleMark />}
                    {authLoading === "google" ? copy.loadingGoogle : copy.googleButton}
                  </button>
                </form>
              )}
            </section>

            <section className="rounded-3xl border border-white/10 bg-black/45 p-5 backdrop-blur">
              <p className="font-mono text-xs uppercase tracking-[0.26em] text-fuchsia-200/70">
                {copy.rulesTitle}
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-zinc-300">
                {copy.rules.map((rule) => (
                  <li key={rule} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}

function SessionBadge({ copy, accountBacked }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
        {accountBacked ? copy.accountLinked : copy.guestMode}
      </p>
      <p className="mt-2 font-mono text-sm font-semibold text-cyan-100">
        {accountBacked ? copy.accountEditable : copy.anonymousLocked}
      </p>
    </div>
  );
}

function TagGroup({
  group,
  language,
  selectedTagSlugs,
  onToggleTag,
  copy,
  customTagValue,
  customTags,
  tagNotice,
  onCustomTagChange,
  onAddCustomTag,
  onRemoveCustomTag,
}) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.025] p-3">
      <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-200/70">
        {getCategoryLabel(group.category, language)}
      </p>
      <div className="flex flex-wrap gap-2">
        {group.slugs.map((slug) => {
          const active = selectedTagSlugs.includes(slug);
          const tagData = RECORD_TAGS[slug];

          return (
            <button
              key={slug}
              type="button"
              aria-pressed={active}
              onClick={() => onToggleTag(slug)}
              className={[
                "rounded-full border px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.12em] transition",
                active
                  ? "border-fuchsia-300/40 bg-fuchsia-300/15 text-fuchsia-100"
                  : "border-white/10 bg-white/[0.03] text-zinc-400 hover:border-cyan-300/35 hover:text-cyan-100",
              ].join(" ")}
            >
              #{getTagLabel(tagData || slug, language)}
            </button>
          );
        })}
      </div>
      <div className="mt-3 border-t border-white/10 pt-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={customTagValue}
            onChange={(event) => onCustomTagChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onAddCustomTag();
              }
            }}
            placeholder={copy.customTagPlaceholder}
            className="min-w-0 flex-1 rounded-xl border border-cyan-300/15 bg-black/40 px-3 py-2 font-mono text-xs text-cyan-50 outline-none transition placeholder:text-zinc-600 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20"
          />
          <button
            type="button"
            onClick={onAddCustomTag}
            className="rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-300/15"
          >
            {copy.addCustomTag}
          </button>
        </div>
        <p className="mt-2 text-xs leading-5 text-zinc-500">
          {tagNotice || copy.customTagHelp}
        </p>
        {customTags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {customTags.map((entry) => (
              <button
                key={`${entry.category}-${entry.label}`}
                type="button"
                onClick={() => onRemoveCustomTag(entry.label)}
                className="rounded-full border border-fuchsia-300/25 bg-fuchsia-300/10 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-fuchsia-100 transition hover:border-red-300/40 hover:bg-red-400/10"
              >
                #{entry.label} x
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function getPublishErrorMessage(error, copy) {
  const code = error?.code || "";

  if (code === "permission-denied" || code === "firestore/permission-denied") {
    return copy.publishPermissionDenied;
  }

  if (
    code === "auth/user-token-expired" ||
    code === "auth/user-disabled" ||
    code === "unauthenticated"
  ) {
    return copy.publishAuthMismatch;
  }

  if (
    code === "unavailable" ||
    code === "deadline-exceeded" ||
    code === "firestore/unavailable" ||
    code === "auth/network-request-failed"
  ) {
    return copy.publishUnavailable;
  }

  if (code === "invalid-argument" || code === "failed-precondition") {
    return `${copy.publishInvalidData} ${code}`;
  }

  if (code) {
    return `${copy.publishError} (${code})`;
  }

  return copy.publishError;
}

function LanguageToggle({ language, setLanguage, copy }) {
  return (
    <div
      className="relative flex h-11 shrink-0 items-center overflow-hidden rounded-xl border border-cyan-300/30 bg-cyan-300/10 p-1 shadow-[0_0_24px_rgba(34,211,238,.16)]"
      role="group"
      aria-label={copy.languageLabel}
    >
      <span className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,.35),transparent_55%)]" />
      {LANGUAGE_OPTIONS.map((option) => {
        const active = language === option.value;
        const title =
          option.value === "zh"
            ? copy.chineseLabel
            : option.value === "es"
              ? copy.spanishLabel
              : copy.englishLabel;

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            title={title}
            onClick={() => setLanguage(option.value)}
            className={[
              "relative z-10 flex h-8 min-w-9 items-center justify-center rounded-lg px-2 font-mono text-xs font-bold transition",
              active
                ? "bg-cyan-200 text-zinc-950 shadow-[0_0_18px_rgba(34,211,238,.25)]"
                : "text-cyan-100/70 hover:bg-white/10 hover:text-cyan-50",
            ].join(" ")}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function ModeButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={[
        "rounded-xl px-3 py-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] transition",
        active
          ? "bg-cyan-300 text-zinc-950 shadow-[0_0_18px_rgba(34,211,238,.18)]"
          : "text-zinc-500 hover:bg-white/5 hover:text-cyan-100",
      ].join(" ")}
    >
      {children}
    </button>
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

function RecorderBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute left-1/2 top-[-18rem] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute bottom-[-14rem] right-[-10rem] h-[36rem] w-[36rem] rounded-full bg-fuchsia-500/10 blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] bg-[size:42px_42px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,.10),transparent_34rem)]" />
    </div>
  );
}
