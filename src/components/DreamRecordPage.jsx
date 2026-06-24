import { useEffect, useMemo, useState } from "react";
import {
  collectRecordForUser,
  saveRecordForUser,
  updateOwnedRecordMetadata,
} from "../lib/recordsService.js";
import {
  getLanguageName,
  normalizeLanguage,
} from "../lib/language.js";
import {
  getPrimaryDreamImageUrl,
  normalizeDreamImages,
} from "../lib/dreamImageService.js";
import { fetchSharedCustomTags } from "../lib/customTagsService.js";
import {
  getDreamDateStatus,
  getVisibleDreamDate,
} from "../lib/dreamDate.js";
import { getOrCreateUserProfile } from "../lib/profileService.js";
import {
  getCategoryLabel,
  getTagLabel,
  mergeRecorderTagGroups,
  normalizeCustomTagLabel,
  RECORDER_TAG_GROUPS,
  RECORD_TAGS,
  tagExists,
} from "../lib/tagTaxonomy.js";
import LanguageMenu from "./LanguageMenu.jsx";

const EDITABLE_TAG_SLUGS = new Set(
  RECORDER_TAG_GROUPS.flatMap((group) => group.slugs)
);
const EDITABLE_TAG_CATEGORIES = new Set(
  RECORDER_TAG_GROUPS.map((group) => group.category)
);

const DETAIL_COPY = {
  en: {
    languageLabel: "Switch interface language",
    englishLabel: "English interface",
    chineseLabel: "Traditional Chinese interface",
    spanishLabel: "Spanish interface",
    back: "Back",
    dashboard: "Account",
    collect: "Collect Dream",
    collected: "Collected",
    saveMetadata: "Save Dream Metadata",
    creatorPanel: "Creator Metadata",
    topicLabel: "Outline / main idea",
    topicPlaceholder: "Leave blank if the dream has no clear topic",
    dreamTextLabel: "Dream words",
    dreamTextPlaceholder: "Edit the dream record words",
    contentRequired: "Dream records need at least a few words.",
    dreamDate: "Dream Date",
    useTodayDate: "Use today",
    unknownDreamDate: "Date unknown",
    hideDreamDate: "Do not show date",
    hiddenDreamDate: "Date hidden",
    ageAtDream: "Age at Dream",
    agePlaceholder: "Optional",
    markAdultContent: "Mark as adult content",
    recordIdentity: "Record Identity",
    recordAsAccount: "Use account",
    recordAsAnonymous: "Stay anonymous",
    recordTags: "Record Tags",
    customTagPlaceholder: "Add a missing tag to this type",
    addCustomTag: "Add tag",
    duplicateTag: "A matching tag already exists.",
    customTagHelp: "Add only when the existing options in this type do not match.",
    anonymousCreator: "Anonymous recorder",
    creator: "Creator",
    recordDate: "Record Date",
    visibility: "Visibility",
    privateRecord: "Private",
    publicRecord: "Public",
    recordText: "Dream Record",
    pictureGallery: "Dream Pictures",
    imageHiddenForGuest: "Pictures are hidden for guests. Sign in to view dream images.",
    emptyRecordBody: "No dream text has been archived for this record yet.",
    originalLanguage: "Original Language",
    recordedBy: "Recorded by",
    anonymousObserver: "Anonymous Observer",
    adultContentLabel: "Adult content",
    adultRestrictedTitle: "Age-restricted dream",
    adultGuestPrompt:
      "This record may include adult content. Confirm you are 18 or older to read this record.",
    adultAccountPrompt:
      "Only accounts with a saved age of 18 or older can open this record.",
    confirmAdult: "I am 18+",
    denyAdult: "Not now",
    metadataSaved: "Dream metadata saved",
    signInToCollect: "Sign in to collect this dream",
    recorderRulesTitle: "Recording Standards",
    recorderRules: [
      "Record only dreams you personally observed or were clearly allowed to record.",
      "First-person wording such as I, me, and my is allowed and does not count as exposing a private real name.",
      "Record the actual feelings, views, sensory details, and uncertainty you remember.",
      "Do not invent, imagine, or reshape the dream to satisfy morals, expectations, beauty, fluency, or literary style.",
      "You may choose more precise words or add annotations for the dream itself, but keep the record honest, true, and free to your own nature.",
      "Keep the original words exactly as recorded and label the original language.",
      "Dream records need written words; images are optional and never required.",
      "Places can be included, but do not publish complete detailed addresses or private real names. Use relationships or descriptions such as my mom, my coworker, or a childhood friend when needed.",
      "Names of works, celebrities, or public figures already visible on wiki pages or popular internet sources may be recorded.",
      "Creators may store the dream date and their age at the time of the dream.",
      "Account age display is optional and controlled by the account owner.",
      "Public records can be read by guests; private records stay owner-controlled.",
    ],
  },
  zh: {
    languageLabel: "切換介面語言",
    englishLabel: "英文介面",
    chineseLabel: "繁體中文介面",
    spanishLabel: "西班牙文介面",
    back: "返回",
    dashboard: "帳戶",
    collect: "收藏夢境",
    collected: "已收藏",
    saveMetadata: "儲存夢境資料",
    creatorPanel: "創作者資料",
    topicLabel: "大綱主旨",
    topicPlaceholder: "如果夢沒有清楚主題，請留空",
    dreamTextLabel: "夢境文字",
    dreamTextPlaceholder: "修改夢境記錄文字",
    contentRequired: "夢境記錄至少需要幾個字。",
    dreamDate: "夢境日期",
    useTodayDate: "使用今天",
    unknownDreamDate: "日期不確定",
    hideDreamDate: "不顯示日期",
    hiddenDreamDate: "日期已隱藏",
    ageAtDream: "做夢時年齡",
    agePlaceholder: "選填",
    markAdultContent: "標記為成人內容",
    recordIdentity: "紀錄身分",
    recordAsAccount: "使用帳戶",
    recordAsAnonymous: "保持匿名",
    recordTags: "紀錄標籤",
    customTagPlaceholder: "在此類型新增缺少的標籤",
    addCustomTag: "新增標籤",
    duplicateTag: "已經有相同或相近的標籤。",
    customTagHelp: "只有在此類型的現有選項不符合時才新增。",
    anonymousCreator: "匿名記錄者",
    creator: "創作者",
    recordDate: "紀錄日期",
    visibility: "可見性",
    privateRecord: "私人",
    publicRecord: "公開",
    recordText: "夢境紀錄",
    pictureGallery: "夢境圖片",
    imageHiddenForGuest: "訪客不顯示圖片。登入後可查看夢境影像。",
    emptyRecordBody: "此紀錄尚未歸檔夢境內文。",
    originalLanguage: "原始語言",
    recordedBy: "記錄者",
    anonymousObserver: "匿名觀察者",
    adultContentLabel: "成人內容",
    adultRestrictedTitle: "年齡限制夢境",
    adultGuestPrompt: "此紀錄可能包含成人內容。請確認你已滿 18 歲，才能閱讀此紀錄。",
    adultAccountPrompt: "只有已儲存年齡且年滿 18 歲的帳戶可以開啟此紀錄。",
    confirmAdult: "我已滿 18 歲",
    denyAdult: "暫不閱讀",
    metadataSaved: "夢境資料已儲存",
    signInToCollect: "登入後可收藏此夢境",
    recorderRulesTitle: "記錄標準",
    recorderRules: [
      "只記錄你親自經歷，或已獲得同意可歸檔的夢境。",
      "可以使用「我」、「我的」等第一人稱，這不算暴露私人真實姓名。",
      "請記錄你實際記得的感受、視角、感官細節與不確定之處。",
      "不要為了道德、期待、美感、流暢或文學效果而創造、想像或改寫夢境。",
      "你可以為夢本身選用更準確的詞語或加註，但記錄應保持誠實、真實，並讓自己的自然狀態自由存在。",
      "保留夢境最初記錄語言的原文，並標示原始語言。",
      "夢境紀錄必須有文字內容；圖片可以有，但不是必要。",
      "可以記錄地點，但不要公開完整詳細地址或私人真實姓名。必要時請用關係或描述替代，例如我媽媽、我的同事、童年朋友。",
      "已在維基或熱門網路來源上公開可見的作品名稱、名人或公眾人物名稱可以記錄。",
      "創作者可以保存夢境日期與做夢當下的年齡。",
      "帳戶年齡是否公開顯示，由帳戶擁有者自行決定。",
      "公開紀錄可由訪客閱讀；私人紀錄仍由擁有者控制。",
    ],
  },
  es: {
    languageLabel: "Cambiar idioma de la interfaz",
    englishLabel: "Interfaz en inglés",
    chineseLabel: "Interfaz en chino tradicional",
    spanishLabel: "Interfaz en español",
    back: "Volver",
    dashboard: "Cuenta",
    collect: "Coleccionar Sueño",
    collected: "Coleccionado",
    saveMetadata: "Guardar Metadatos",
    creatorPanel: "Metadatos del Creador",
    topicLabel: "Esquema / idea principal",
    topicPlaceholder: "Déjalo vacío si el sueño no tiene tema claro",
    dreamTextLabel: "Palabras del sueño",
    dreamTextPlaceholder: "Edita las palabras del registro",
    contentRequired: "Los registros necesitan al menos unas palabras.",
    dreamDate: "Fecha del Sueño",
    useTodayDate: "Usar hoy",
    unknownDreamDate: "Fecha desconocida",
    hideDreamDate: "No mostrar fecha",
    hiddenDreamDate: "Fecha oculta",
    ageAtDream: "Edad en el Sueño",
    agePlaceholder: "Opcional",
    markAdultContent: "Marcar como contenido adulto",
    recordIdentity: "Identidad del Registro",
    recordAsAccount: "Usar cuenta",
    recordAsAnonymous: "Seguir anónimo",
    recordTags: "Etiquetas del registro",
    customTagPlaceholder: "Añade una etiqueta faltante a este tipo",
    addCustomTag: "Añadir etiqueta",
    duplicateTag: "Ya existe una etiqueta equivalente.",
    customTagHelp: "Añade solo cuando las opciones de este tipo no encajan.",
    anonymousCreator: "Registrador anónimo",
    creator: "Creador",
    recordDate: "Fecha del Registro",
    visibility: "Visibilidad",
    privateRecord: "Privado",
    publicRecord: "Público",
    recordText: "Registro del Sueño",
    pictureGallery: "Imágenes del sueño",
    imageHiddenForGuest:
      "Las imágenes están ocultas para invitados. Inicia sesión para verlas.",
    emptyRecordBody: "Este registro aún no tiene texto de sueño archivado.",
    originalLanguage: "Idioma Original",
    recordedBy: "Registrado por",
    anonymousObserver: "Observador anónimo",
    adultContentLabel: "Contenido adulto",
    adultRestrictedTitle: "Sueño con restricción de edad",
    adultGuestPrompt:
      "Este registro puede incluir contenido adulto. Confirma que tienes 18 años o más para leerlo.",
    adultAccountPrompt:
      "Solo las cuentas con una edad guardada de 18 años o más pueden abrir este registro.",
    confirmAdult: "Tengo 18+",
    denyAdult: "Ahora no",
    metadataSaved: "Metadatos guardados",
    signInToCollect: "Inicia sesión para coleccionar este sueño",
    recorderRulesTitle: "Reglas de registro",
    recorderRules: [
      "Registra solo sueños que observaste personalmente o que tienes permiso para archivar.",
      "La primera persona como yo, me y mi está permitida y no cuenta como exponer un nombre real privado.",
      "Registra los sentimientos, vistas, detalles sensoriales e incertidumbres que realmente recuerdas.",
      "No inventes, imagines ni rehagas el sueño para ajustarlo a la moral, expectativas, belleza, fluidez o estilo literario.",
      "Puedes usar palabras más precisas o añadir anotaciones sobre el sueño mismo, pero mantén el registro honesto, verdadero y libre para tu propia naturaleza.",
      "Conserva las palabras originales tal como fueron registradas y etiqueta el idioma original.",
      "Los registros necesitan texto escrito; las imágenes son opcionales y nunca obligatorias.",
      "Puedes incluir lugares, pero no publiques direcciones completas ni nombres reales privados. Cuando sea necesario, usa relaciones o descripciones como mi mamá, mi colega o una amistad de la infancia.",
      "Se pueden registrar nombres de obras, celebridades o figuras públicas que ya aparecen en wikis o fuentes populares de internet.",
      "Los creadores pueden guardar la fecha del sueño y su edad en ese momento.",
      "La edad de la cuenta es opcional y la controla la persona propietaria.",
      "Los registros públicos pueden leerse como invitado; los privados siguen bajo control del dueño.",
    ],
  },
};

export default function DreamRecordPage({
  record,
  currentUser,
  language = "zh",
  setLanguage = () => {},
  onBack,
  onOpenDashboard,
}) {
  const copy = DETAIL_COPY[language] || DETAIL_COPY.zh;
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [localRecord, setLocalRecord] = useState(record);
  const normalizedRecord = useMemo(() => normalizeDreamRecord(localRecord), [localRecord]);
  const isOwner = Boolean(
    currentUser?.uid &&
      normalizedRecord.ownerId &&
      currentUser.uid === normalizedRecord.ownerId &&
      !normalizedRecord.anonymousLocked
  );
  const [titleDraft, setTitleDraft] = useState(normalizedRecord.originalTitle || "");
  const [dreamTextDraft, setDreamTextDraft] = useState(
    normalizedRecord.originalText || ""
  );
  const [dreamDate, setDreamDate] = useState(normalizedRecord.dreamDate || "");
  const [dreamDateStatus, setDreamDateStatus] = useState(
    normalizedRecord.dreamDateStatus
  );
  const [ageAtDream, setAgeAtDream] = useState(normalizedRecord.ageAtDream || "");
  const [adultContent, setAdultContent] = useState(
    isAdultRecord(normalizedRecord)
  );
  const [recordIdentityMode, setRecordIdentityMode] = useState(
    normalizedRecord.recordIdentityMode
  );
  const [selectedTagSlugs, setSelectedTagSlugs] = useState(() =>
    getEditableSelectedTagSlugs(normalizedRecord)
  );
  const [customTagDrafts, setCustomTagDrafts] = useState({});
  const [customTagEntries, setCustomTagEntries] = useState(() =>
    getCustomTagEntries(normalizedRecord)
  );
  const [sharedTags, setSharedTags] = useState([]);
  const [tagNotices, setTagNotices] = useState({});
  const [profile, setProfile] = useState(null);
  const [adultConfirmed, setAdultConfirmed] = useState(false);
  const [status, setStatus] = useState("");
  const [collecting, setCollecting] = useState(false);
  const title = getOriginalRecordTitle(normalizedRecord);
  const body = getOriginalRecordText(normalizedRecord);
  const originalLanguage = normalizeLanguage(normalizedRecord.originalLanguage);
  const adultRecord = isAdultRecord(normalizedRecord);
  const ageVerifiedAdult = Number(profile?.age || 0) >= 18;
  const adultAllowed = !adultRecord || ageVerifiedAdult || adultConfirmed;
  const canSeeImages = Boolean(currentUser?.uid && !currentUser.isAnonymous);
  const dreamImages = normalizedRecord.images || [];
  const pageTitle = adultAllowed ? title : copy.adultRestrictedTitle;
  const tagGroups = useMemo(() => mergeRecorderTagGroups(sharedTags), [sharedTags]);
  const tagLookup = useMemo(
    () =>
      Object.fromEntries(
        [...Object.values(RECORD_TAGS), ...sharedTags].map((tagData) => [
          tagData.slug,
          tagData,
        ])
      ),
    [sharedTags]
  );

  useEffect(() => {
    setLocalRecord(record);
  }, [record]);

  useEffect(() => {
    document.title = pageTitle || "Dream Record";
  }, [pageTitle]);

  useEffect(() => {
    let ignore = false;

    fetchSharedCustomTags()
      .then((tags) => {
        if (!ignore) setSharedTags(tags);
      })
      .catch(() => {
        if (!ignore) setSharedTags([]);
      });

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    setTitleDraft(normalizedRecord.originalTitle || "");
    setDreamTextDraft(normalizedRecord.originalText || "");
    setDreamDate(normalizedRecord.dreamDate || "");
    setDreamDateStatus(normalizedRecord.dreamDateStatus);
    setAgeAtDream(normalizedRecord.ageAtDream || "");
    setAdultContent(isAdultRecord(normalizedRecord));
    setRecordIdentityMode(normalizedRecord.recordIdentityMode);
    setSelectedTagSlugs(getEditableSelectedTagSlugs(normalizedRecord));
    setCustomTagDrafts({});
    setCustomTagEntries(getCustomTagEntries(normalizedRecord));
    setTagNotices({});
    setAdultConfirmed(false);
  }, [normalizedRecord]);

  useEffect(() => {
    if (!currentUser?.uid) return undefined;

    let ignore = false;

    async function loadProfile() {
      try {
        const profileData = await getOrCreateUserProfile(currentUser);
        if (!ignore) setProfile(profileData);
      } catch {
        if (!ignore) setProfile(null);
      }
    }

    loadProfile();

    return () => {
      ignore = true;
    };
  }, [currentUser]);

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

    if (tagExists(label, customTagEntries, sharedTags)) {
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

  async function handleCollect() {
    if (!currentUser?.uid) {
      setStatus(copy.signInToCollect);
      return;
    }

    if (!adultAllowed) {
      setStatus(
        currentUser?.uid && !currentUser.isAnonymous
          ? copy.adultAccountPrompt
          : copy.adultGuestPrompt
      );
      return;
    }

    setCollecting(true);
    setStatus("");

    try {
      await Promise.all([
        saveRecordForUser(currentUser, normalizedRecord),
        collectRecordForUser(currentUser, normalizedRecord),
      ]);
      setStatus(copy.collected);
    } catch (error) {
      setStatus(error.message);
    } finally {
      setCollecting(false);
    }
  }

  async function handleSaveMetadata() {
    setStatus("");

    const nextTitle = titleDraft.trim();
    const nextDreamText = dreamTextDraft.trim();

    if (!nextDreamText) {
      setStatus(copy.contentRequired);
      return;
    }

    try {
      await updateOwnedRecordMetadata(currentUser, normalizedRecord.id, {
        title: nextTitle,
        dreamText: nextDreamText,
        originalLanguage,
        dreamDate,
        dreamDateStatus,
        ageAtDream,
        adultContent,
        minimumViewerAge: adultContent ? 18 : 0,
        recordIdentityMode,
        creatorDisplayName: profile?.displayName || currentUser?.displayName || "",
        creatorEmail: profile?.showEmail ? currentUser?.email || "" : "",
        showEmail: Boolean(profile?.showEmail),
        selectedTagSlugs,
        customTagLabels: customTagEntries,
        sharedTags,
      });
      setLocalRecord((current) =>
        mergeRecordEdits(current, {
          title: nextTitle,
          dreamText: nextDreamText,
          originalLanguage,
          dreamDate,
          dreamDateStatus,
          ageAtDream,
          adultContent,
          minimumViewerAge: adultContent ? 18 : 0,
          recordIdentityMode,
          creatorDisplayName: profile?.displayName || currentUser?.displayName || "",
          creatorEmail: profile?.showEmail ? currentUser?.email || "" : "",
          showEmail: Boolean(profile?.showEmail),
        })
      );
      setStatus(copy.metadataSaved);
    } catch (error) {
      setStatus(error.message);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030407] text-zinc-100 selection:bg-cyan-300/30 selection:text-cyan-50">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-20rem] h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute bottom-[-14rem] right-[-10rem] h-[34rem] w-[34rem] rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] bg-[size:44px_44px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        <header className="mb-5 grid gap-2 sm:mb-6 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onBack}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-100 transition hover:border-cyan-300/35 hover:bg-cyan-300/10 sm:text-xs sm:tracking-[0.2em]"
          >
            {copy.back}
          </button>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
            <LanguageToggle language={language} setLanguage={setLanguage} copy={copy} />
            <button
              type="button"
              onClick={onOpenDashboard}
              className="min-w-0 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-100 transition hover:border-fuchsia-300/35 hover:bg-fuchsia-300/10 sm:px-4 sm:text-xs sm:tracking-[0.2em]"
            >
              {copy.dashboard}
            </button>
            <button
              type="button"
              onClick={handleCollect}
              disabled={collecting}
              className="col-span-2 rounded-xl border border-cyan-300/35 bg-cyan-300 px-3 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70 sm:col-span-1 sm:px-4 sm:text-xs sm:tracking-[0.2em]"
            >
              {collecting ? "..." : copy.collect}
            </button>
          </div>
        </header>

        <section className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/75 shadow-terminal backdrop-blur">
          <div className="grid gap-0 lg:grid-cols-[1.2fr_.8fr]">
            <article className="p-6 sm:p-8">
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.38em] text-cyan-200/70">
                {copy.recordText}
              </p>
              {pageTitle && (
                <h1 className="break-words text-3xl font-semibold text-zinc-50 sm:text-5xl">
                  {pageTitle}
                </h1>
              )}
              {adultAllowed && (
                <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500">
                  {copy.recordedBy} @{getRecordAuthorName(normalizedRecord, copy)}
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-cyan-300/20 bg-cyan-300/5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-cyan-100">
                  {copy.originalLanguage}: {getLanguageName(originalLanguage, language)}
                </span>
                {adultRecord && (
                  <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-amber-100">
                    {copy.adultContentLabel} 18+
                  </span>
                )}
              </div>
              {!adultAllowed ? (
                <AdultGatePanel
                  copy={copy}
                  currentUser={currentUser}
                  onConfirm={() => setAdultConfirmed(true)}
                />
              ) : (
                <>
                  {dreamImages.length > 0 && (
                    <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <p className="mb-4 font-mono text-xs uppercase tracking-[0.24em] text-cyan-200/70">
                        {copy.pictureGallery}
                      </p>
                      {canSeeImages ? (
                        <div className="grid gap-3 sm:grid-cols-2">
                          {dreamImages.map((image, index) => (
                            <img
                              key={image.path || image.url || index}
                              src={image.url}
                              alt={`${copy.pictureGallery} ${index + 1}`}
                              className="aspect-[4/3] w-full rounded-xl border border-cyan-300/15 object-cover"
                              onError={(event) => {
                                event.currentTarget.style.display = "none";
                              }}
                            />
                          ))}
                        </div>
                      ) : (
                        <p className="rounded-xl border border-amber-300/20 bg-amber-300/5 p-4 font-mono text-xs uppercase tracking-[0.14em] text-amber-100">
                          {copy.imageHiddenForGuest}
                        </p>
                      )}
                    </section>
                  )}

                  <p className="mt-5 max-w-3xl text-sm leading-7 text-zinc-300 sm:text-base">
                    {body || copy.emptyRecordBody}
                  </p>
                </>
              )}

              {status && (
                <p className="mt-6 rounded-2xl border border-cyan-300/20 bg-cyan-300/5 p-4 font-mono text-xs uppercase tracking-[0.16em] text-cyan-100">
                  {status}
                </p>
              )}
            </article>

            <aside className="border-t border-white/10 bg-black/30 p-6 sm:p-8 lg:border-l lg:border-t-0">
              <div className="space-y-3">
                <CreatorIdentity copy={copy} record={normalizedRecord} />
                <InfoRow
                  label={copy.recordDate}
                  value={getDreamDateDisplay(normalizedRecord, copy)}
                />
                <InfoRow
                  label={copy.ageAtDream}
                  value={
                    normalizedRecord.ageAtDream
                      ? String(normalizedRecord.ageAtDream)
                      : "--"
                  }
                />
                <InfoRow
                  label={copy.originalLanguage}
                  value={getLanguageName(originalLanguage, language)}
                />
                <InfoRow
                  label={copy.visibility}
                  value={
                    normalizedRecord.visibility === "private"
                      ? copy.privateRecord
                      : copy.publicRecord
                  }
                />
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="mb-3 font-mono text-xs uppercase tracking-[0.24em] text-fuchsia-200/70">
                  {copy.recorderRulesTitle}
                </p>
                <ul className="space-y-2 text-sm leading-6 text-zinc-300">
                  {copy.recorderRules.map((rule) => (
                    <li key={rule} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {isOwner && (
                <div className="mt-6 rounded-2xl border border-cyan-300/15 bg-cyan-300/5 p-4">
                  <p className="mb-4 font-mono text-xs uppercase tracking-[0.26em] text-cyan-200/70">
                    {copy.creatorPanel}
                  </p>
                  <label className="mb-3 block">
                    <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                      {copy.topicLabel}
                    </span>
                    <input
                      value={titleDraft}
                      onChange={(event) => setTitleDraft(event.target.value)}
                      placeholder={copy.topicPlaceholder}
                      className="w-full rounded-2xl border border-cyan-300/15 bg-black/40 px-4 py-3 font-mono text-sm text-cyan-50 outline-none transition placeholder:text-zinc-600 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20"
                    />
                  </label>
                  <label className="mb-3 block">
                    <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                      {copy.dreamTextLabel}
                    </span>
                    <textarea
                      value={dreamTextDraft}
                      onChange={(event) => setDreamTextDraft(event.target.value)}
                      placeholder={copy.dreamTextPlaceholder}
                      className="min-h-48 w-full resize-y rounded-2xl border border-cyan-300/15 bg-black/40 px-4 py-3 font-mono text-sm leading-7 text-cyan-50 outline-none transition placeholder:text-zinc-600 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20"
                    />
                  </label>
                  <label className="mb-3 block">
                    <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                      {copy.dreamDate}
                    </span>
                    <input
                      type="date"
                      value={dreamDate}
                      onChange={(event) => {
                        setDreamDate(event.target.value);
                        setDreamDateStatus(event.target.value ? "known" : "unknown");
                      }}
                      className="w-full rounded-2xl border border-cyan-300/15 bg-black/40 px-4 py-3 font-mono text-sm text-cyan-50 outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20"
                    />
                    <div className="mt-2 grid gap-2 sm:grid-cols-3">
                      <button
                        type="button"
                        onClick={() => {
                          setDreamDate(today);
                          setDreamDateStatus("known");
                        }}
                        className={[
                          "rounded-xl border px-3 py-2 font-mono text-xs font-bold transition",
                          dreamDateStatus === "known" && dreamDate === today
                            ? "border-cyan-300/35 bg-cyan-300 text-zinc-950"
                            : "border-white/10 bg-white/[0.03] text-zinc-400 hover:border-cyan-300/35 hover:text-cyan-100",
                        ].join(" ")}
                      >
                        {copy.useTodayDate}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDreamDate("");
                          setDreamDateStatus("unknown");
                        }}
                        className={[
                          "rounded-xl border px-3 py-2 font-mono text-xs font-bold transition",
                          dreamDateStatus === "unknown"
                            ? "border-cyan-300/35 bg-cyan-300 text-zinc-950"
                            : "border-white/10 bg-white/[0.03] text-zinc-400 hover:border-cyan-300/35 hover:text-cyan-100",
                        ].join(" ")}
                      >
                        {copy.unknownDreamDate}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDreamDate("");
                          setDreamDateStatus("hidden");
                        }}
                        className={[
                          "rounded-xl border px-3 py-2 font-mono text-xs font-bold transition",
                          dreamDateStatus === "hidden"
                            ? "border-cyan-300/35 bg-cyan-300 text-zinc-950"
                            : "border-white/10 bg-white/[0.03] text-zinc-400 hover:border-cyan-300/35 hover:text-cyan-100",
                        ].join(" ")}
                      >
                        {copy.hideDreamDate}
                      </button>
                    </div>
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
                  <label className="mt-4 flex min-h-12 items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={adultContent}
                      onChange={(event) => setAdultContent(event.target.checked)}
                      className="h-4 w-4 accent-amber-300"
                    />
                    <span className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-300">
                      {copy.markAdultContent}
                    </span>
                  </label>
                  <div className="mt-4">
                    <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                      {copy.recordIdentity}
                    </p>
                    <div className="grid grid-cols-2 rounded-2xl border border-white/10 bg-black/40 p-1">
                      <IdentityModeButton
                        active={recordIdentityMode === "account"}
                        onClick={() => setRecordIdentityMode("account")}
                      >
                        {copy.recordAsAccount}
                      </IdentityModeButton>
                      <IdentityModeButton
                        active={recordIdentityMode === "anonymous"}
                        onClick={() => setRecordIdentityMode("anonymous")}
                      >
                        {copy.recordAsAnonymous}
                      </IdentityModeButton>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                      {copy.recordTags}
                    </p>
                    <div className="max-h-[24rem] space-y-3 overflow-y-auto rounded-2xl border border-white/10 bg-black/25 p-3 pr-2 [scrollbar-color:rgba(34,211,238,.45)_rgba(255,255,255,.08)] [scrollbar-width:thin]">
                      {tagGroups.map((group) => (
                        <EditableTagGroup
                          key={group.category}
                          group={group}
                          language={language}
                          selectedTagSlugs={selectedTagSlugs}
                          onToggleTag={toggleTag}
                          tagLookup={tagLookup}
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
                  <button
                    type="button"
                    onClick={handleSaveMetadata}
                    className="mt-4 w-full rounded-2xl border border-fuchsia-300/35 bg-fuchsia-300 px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.2em] text-zinc-950 transition hover:bg-fuchsia-200"
                  >
                    {copy.saveMetadata}
                  </button>
                </div>
              )}
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}

function normalizeDreamRecord(record) {
  const originalLanguage = normalizeLanguage(
    record?.originalLanguage || record?.original_language || "en"
  );
  const title = record?.title || "";
  const titleEn = record?.titleEn || record?.title_en || "";
  const titleZh = record?.titleZh || record?.title_zh || "";
  const titleEs = record?.titleEs || record?.title_es || "";
  const text = record?.dream_text || record?.text || record?.excerpt || "";
  const textEn =
    record?.dream_text_en || record?.textEn || record?.text_en || record?.excerpt_en || "";
  const textZh = record?.dream_text_zh || record?.textZh || record?.excerpt_zh || record?.excerpt || "";
  const textEs = record?.dream_text_es || record?.textEs || record?.excerpt_es || record?.excerpt || "";
  const images = normalizeDreamImages(record);
  const imageUrls = images.map((image) => image.url).filter(Boolean);
  const thumbnailUrl = getPrimaryDreamImageUrl(record);
  const dreamDate = getVisibleDreamDate(record);
  const dreamDateStatus = getDreamDateStatus(record);

  return {
    id: record?.id || record?.dream_id || record?.recordId || "",
    originalLanguage,
    originalTitle:
      record?.originalTitle ||
      record?.original_title ||
      getLanguageSpecificRecordValue(
        { title, titleEn, titleZh, titleEs },
        "title",
        originalLanguage
      ),
    originalText:
      record?.originalText ||
      record?.original_text ||
      getLanguageSpecificRecordValue(
        { text, textEn, textZh, textEs },
        "text",
        originalLanguage
      ),
    title,
    titleEn,
    titleZh,
    titleEs,
    text,
    textEn,
    textZh,
    textEs,
    images,
    dreamImages: images,
    imageUrls,
    pictureUrls: imageUrls,
    thumbnailUrl,
    thumbnail_url: thumbnailUrl,
    generated_image_url: thumbnailUrl,
    date: dreamDate,
    dreamDate,
    dreamDateStatus,
    dream_date_status: dreamDateStatus,
    ageAtDream: record?.ageAtDream || "",
    ownerId: record?.ownerId || record?.creatorId || "",
    anonymousLocked: Boolean(record?.anonymousLocked),
    recordIdentityMode:
      record?.recordIdentityMode === "account" || record?.attributionMode === "account"
        ? "account"
        : "anonymous",
    creatorDisplayName: record?.creatorDisplayName || "",
    authorName: record?.authorName || record?.creatorDisplayName || "",
    creatorEmail: record?.creatorEmail || "",
    pseudoId: record?.pseudo_id || record?.pseudoId || record?.creatorId || "",
    visibility: record?.visibility || (record?.isPublic === false ? "private" : "public"),
    tags: Array.isArray(record?.tags) ? record.tags : [],
    environmentTags: Array.isArray(record?.environmentTags) ? record.environmentTags : [],
    entityTags: Array.isArray(record?.entityTags) ? record.entityTags : [],
    anomalyTags: Array.isArray(record?.anomalyTags)
      ? record.anomalyTags
      : Array.isArray(record?.anomaly_tag_slugs)
        ? record.anomaly_tag_slugs
        : [],
    emotionTags: Array.isArray(record?.emotionTags) ? record.emotionTags : [],
    styleTags: Array.isArray(record?.styleTags) ? record.styleTags : [],
    eraTags: Array.isArray(record?.eraTags) ? record.eraTags : [],
    weatherTags: Array.isArray(record?.weatherTags) ? record.weatherTags : [],
    dreamTypeTags: Array.isArray(record?.dreamTypeTags) ? record.dreamTypeTags : [],
    perspectiveTags: Array.isArray(record?.perspectiveTags)
      ? record.perspectiveTags
      : [],
    psychologicalObservableTags: Array.isArray(record?.psychologicalObservableTags)
      ? record.psychologicalObservableTags
      : [],
    dreamAnalysisTags: Array.isArray(record?.dreamAnalysisTags)
      ? record.dreamAnalysisTags
      : [],
    customTags: Array.isArray(record?.customTags) ? record.customTags : [],
    adultContent: Boolean(
      record?.adultContent ||
        record?.adult_content ||
        record?.isAdult ||
        record?.is_adult
    ),
    minimumViewerAge: record?.minimumViewerAge || record?.minimum_viewer_age || 0,
  };
}

function isAdultRecord(record) {
  return Boolean(record.adultContent) || Number(record.minimumViewerAge || 0) >= 18;
}

function getDreamDateDisplay(record, copy) {
  if (record.dreamDateStatus === "hidden") return copy.hiddenDreamDate;
  return record.dreamDate || copy.unknownDreamDate;
}

function getOriginalRecordTitle(record) {
  const originalLanguage = normalizeLanguage(record.originalLanguage);

  return (
    record.originalTitle ||
    getLanguageSpecificRecordValue(record, "title", originalLanguage) ||
    record.title ||
    ""
  );
}

function getOriginalRecordText(record) {
  const originalLanguage = normalizeLanguage(record.originalLanguage);

  return (
    record.originalText ||
    getLanguageSpecificRecordValue(record, "text", originalLanguage) ||
    record.text ||
    ""
  );
}

function getRecordAuthorName(record, copy) {
  return (
    record.authorName ||
    record.creatorDisplayName ||
    record.displayName ||
    copy.anonymousObserver
  );
}

function getLanguageSpecificRecordValue(record, field, language) {
  const normalizedLanguage = normalizeLanguage(language);

  if (field === "title") {
    if (normalizedLanguage === "zh") return record.titleZh || record.title_zh || "";
    if (normalizedLanguage === "es") return record.titleEs || record.title_es || "";
    return record.titleEn || record.title_en || record.title || "";
  }

  if (normalizedLanguage === "zh") {
    return record.textZh || record.text_zh || record.dream_text_zh || "";
  }

  if (normalizedLanguage === "es") {
    return record.textEs || record.text_es || record.dream_text_es || "";
  }

  return record.textEn || record.text_en || record.dream_text_en || record.text || record.dream_text || "";
}

function getEditableSelectedTagSlugs(record) {
  const slugs = new Set();

  record.tags
    ?.filter((tag) => !tag.custom && EDITABLE_TAG_SLUGS.has(tag.slug))
    .forEach((tag) => slugs.add(tag.slug));

  [
    record.environmentTags,
    record.entityTags,
    record.anomalyTags,
    record.emotionTags,
    record.styleTags,
    record.eraTags,
    record.weatherTags,
    record.dreamTypeTags,
    record.perspectiveTags,
    record.psychologicalObservableTags,
    record.dreamAnalysisTags,
  ]
    .flat()
    .filter((slug) => EDITABLE_TAG_SLUGS.has(slug))
    .forEach((slug) => slugs.add(slug));

  return [...slugs];
}

function getCustomTagEntries(record) {
  return (record.tags || [])
    .filter((tag) => tag.custom && EDITABLE_TAG_CATEGORIES.has(tag.category))
    .map((tag) => ({
      category: tag.category,
      label: tag.name || tag.name_zh || tag.name_es || tag.slug,
    }));
}

function mergeRecordEdits(record, updates) {
  const excerpt = createLocalExcerpt(updates.dreamText);
  const languageFields = buildLocalLanguageFields(
    updates.originalLanguage,
    updates.title,
    updates.dreamText,
    excerpt
  );

  return {
    ...record,
    ...languageFields,
    originalLanguage: updates.originalLanguage,
    originalTitle: updates.title,
    originalText: updates.dreamText,
    originalExcerpt: excerpt,
    title: updates.title,
    dream_text: updates.dreamText,
    excerpt,
    dreamDate: updates.dreamDate || "",
    dream_date: updates.dreamDate || "",
    dreamDateStatus: updates.dreamDateStatus,
    dream_date_status: updates.dreamDateStatus,
    ageAtDream:
      updates.ageAtDream === "" || updates.ageAtDream == null
        ? ""
        : Math.max(0, Number(updates.ageAtDream)),
    adultContent: Boolean(updates.adultContent),
    minimumViewerAge: updates.minimumViewerAge || 0,
    recordIdentityMode: updates.recordIdentityMode,
    attributionMode: updates.recordIdentityMode,
    creatorDisplayName:
      updates.recordIdentityMode === "account" ? updates.creatorDisplayName || "" : "",
    creatorEmail:
      updates.recordIdentityMode === "account" && updates.showEmail
        ? updates.creatorEmail || ""
        : "",
  };
}

function buildLocalLanguageFields(language, title, text, excerpt) {
  if (language === "zh") {
    return {
      titleZh: title,
      title_zh: title,
      textZh: text,
      dream_text_zh: text,
      excerptZh: excerpt,
      excerpt_zh: excerpt,
    };
  }

  if (language === "es") {
    return {
      titleEs: title,
      title_es: title,
      textEs: text,
      dream_text_es: text,
      excerptEs: excerpt,
      excerpt_es: excerpt,
    };
  }

  return {
    titleEn: title,
    title_en: title,
    textEn: text,
    text_en: text,
    excerptEn: excerpt,
    excerpt_en: excerpt,
  };
}

function createLocalExcerpt(text) {
  const trimmedText = String(text || "").trim();
  return trimmedText.length > 220 ? `${trimmedText.slice(0, 220)}...` : trimmedText;
}

function EditableTagGroup({
  group,
  language,
  selectedTagSlugs,
  onToggleTag,
  tagLookup,
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
          const tagData = tagLookup?.[slug] || RECORD_TAGS[slug];

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
        <div className="flex flex-col gap-2">
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
            className="w-full rounded-xl border border-cyan-300/15 bg-black/40 px-3 py-2 font-mono text-xs text-cyan-50 outline-none transition placeholder:text-zinc-600 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20"
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

function LanguageToggle({ language, setLanguage, copy }) {
  return <LanguageMenu language={language} setLanguage={setLanguage} copy={copy} />;
}

function CreatorIdentity({ copy, record }) {
  const showAccountIdentity =
    record.recordIdentityMode === "account" && record.creatorDisplayName;
  const displayName = showAccountIdentity
    ? record.creatorDisplayName
    : record.pseudoId || copy.anonymousCreator;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
        {copy.creator}
      </p>
      <div className="mt-3 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 font-mono text-xs font-bold text-cyan-100">
          {displayName.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="break-words font-mono text-sm text-cyan-100">{displayName}</p>
          {showAccountIdentity && record.creatorEmail && (
            <p className="mt-1 break-words font-mono text-[11px] text-zinc-500">
              {record.creatorEmail}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function AdultGatePanel({ copy, currentUser, onConfirm }) {
  const accountNeedsSavedAge = Boolean(currentUser?.uid && !currentUser.isAnonymous);

  return (
    <section className="mt-7 rounded-2xl border border-amber-300/20 bg-amber-300/5 p-5">
      <p className="font-mono text-xs uppercase tracking-[0.24em] text-amber-100">
        {copy.adultRestrictedTitle}
      </p>
      <p className="mt-3 text-sm leading-6 text-zinc-300">
        {accountNeedsSavedAge ? copy.adultAccountPrompt : copy.adultGuestPrompt}
      </p>
      {!accountNeedsSavedAge && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl border border-amber-300/35 bg-amber-300 px-3 py-2 font-mono text-xs font-bold uppercase tracking-[0.16em] text-zinc-950 transition hover:bg-amber-200"
          >
            {copy.confirmAdult}
          </button>
          <button
            type="button"
            className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 font-mono text-xs font-bold uppercase tracking-[0.16em] text-zinc-300"
          >
            {copy.denyAdult}
          </button>
        </div>
      )}
    </section>
  );
}

function IdentityModeButton({ active, children, onClick }) {
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

function InfoRow({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </p>
      <p className="mt-2 break-words font-mono text-sm text-cyan-100">{value}</p>
    </div>
  );
}
