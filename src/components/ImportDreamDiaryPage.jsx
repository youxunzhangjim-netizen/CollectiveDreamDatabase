import { useEffect, useMemo, useState } from "react";
import {
  createDreamDiaryImport,
  DIARY_FILE_ACCEPT,
  DIARY_IMPORT_MODES,
  MAX_DIARY_FILE_BYTES,
  MAX_IMPORT_DRAFTS,
  parseDiaryFileText,
  readDiaryFile,
  refreshDraftSuggestions,
  validateDiaryFile,
} from "../lib/dreamDiaryImportService.js";
import { getOrCreateUserProfile } from "../lib/profileService.js";
import { getLanguageName, LANGUAGE_OPTIONS, normalizeLanguage } from "../lib/language.js";
import { getTagLabel, RECORD_TAGS } from "../lib/tagTaxonomy.js";
import LanguageMenu from "./LanguageMenu.jsx";

const IMPORT_COPY = {
  en: {
    documentTitle: "Import Dream Diary",
    database: "Research Archive",
    recordButton: "Record Dream",
    account: "Account",
    languageLabel: "Switch interface language",
    englishLabel: "English interface",
    chineseLabel: "Traditional Chinese interface",
    spanishLabel: "Spanish interface",
    kicker: "Bulk private import",
    title: "Import your dream diary",
    subtitle:
      "Upload an existing dream diary and attach it to your account. Review every split, title, tag, and sharing mode before saving.",
    uploadTitle: "1. Upload or paste diary text",
    uploadText:
      "Accepted formats: TXT, Markdown (.md), CSV, and JSON. For DOCX, Notion, Google Docs, Apple Notes, or phone notes, export or copy as plain text/Markdown first.",
    fileLabel: "Diary file",
    fileButton: "Choose diary file",
    fileEmpty: "No file selected",
    fileSelected: ({ name }) => `Selected: ${name}`,
    pasteLabel: "Or paste diary text",
    pastePlaceholder: "Paste many dreams here if you do not have a text file...",
    parserMode: "Parsing mode",
    modes: {
      auto: "Auto detect",
      date_headings: "Date / heading sections",
      blank_lines: "One dream per blank block",
      csv: "CSV columns",
      json: "JSON array / object",
    },
    originalLanguage: "Default original language",
    parseButton: "Preview dreams",
    refreshButton: "Suggest titles & tags again",
    importButton: "Import selected as private dreams",
    importButtonGeneric: "Import selected dreams",
    importingButton: "Importing...",
    sharingTitle: "Sharing after import",
    sharingText:
      "Diary imports require an account so the records can appear in My Dream Map and be edited later.",
    sharingPrivate: "Keep private",
    sharingAnonymous: "Share publicly as anonymous",
    sharingAccount: "Share publicly with account",
    accountRequired: "Sign in with an account before importing a diary. Guest sessions can record one dream, but bulk diary import is account-only.",
    signInToImport: "Sign in to import",
    reviewTitle: "2. Review drafts before import",
    reviewText:
      "Choose whether this batch stays private, publishes anonymously, or publishes with account attribution. Titles and tags are suggestions only; weak or far-fetched tags should be removed before research use.",
    selectedCount: ({ selected, total }) => `${selected}/${total} selected`,
    noDrafts: "No draft dreams yet. Upload or paste text, then preview.",
    titleLabel: "Title",
    textLabel: "Dream text",
    dateLabel: "Dream date",
    timeLabel: "Clock time",
    periodLabel: "Time of day",
    unknownDate: "Date unknown",
    noPeriod: "Not sure",
    periodOptions: {
      morning: "Morning",
      afternoon: "Afternoon",
      evening: "Evening",
      night: "Night",
    },
    language: "Language",
    boundary: "Boundary confidence",
    sourceLines: "Source lines",
    includeDraft: "Include",
    deleteDraft: "Delete",
    splitDraft: "Split by blank lines",
    mergePrevious: "Merge with previous",
    suggestedTags: "Suggested tags with evidence",
    noTags: "No strong evidence-based tags found.",
    privacyTitle: "Privacy first",
    privacyText:
      "Bulk imports are tied to your account so you can edit or delete them later. If you choose public sharing, the selected identity mode is applied to every imported dream.",
    disclaimerTitle: "Not a diagnosis",
    disclaimerText:
      "Automatic titles and tags describe visible dream content. They are not medical, psychological, or psychiatric diagnosis.",
    fileTooLarge: "The diary file is too large. Use a file under 5 MB or split it into smaller files.",
    unsupportedFormat: "Use TXT, Markdown, CSV, or JSON for this importer.",
    readFailed: "The file could not be read.",
    parseFailed: "The diary could not be parsed. Check the format or use blank-line mode.",
    importNeedsDrafts: "Select at least one dream to import.",
    importStarted: "Importing dream records...",
    importComplete: ({ count }) => `${count} dreams imported.`,
    translationComplete: ({ count }) => `${count} diary versions attached as recorder translations.`,
    skippedComplete: ({ count }) => `${count} duplicate dreams skipped.`,
    importErrors: ({ count }) => `${count} drafts could not be imported. Review the messages and try again.`,
    firstImportError: ({ message }) => `First error: ${message}`,
    sharingWarning:
      "Some dreams were imported but stayed private because sharing could not be updated.",
    storageWarning:
      "Original file storage was not available, but parsed private records can still be saved.",
    importFailed: "Import could not be completed. Review the drafts and try again.",
    permissionDenied:
      "The archive could not save these dreams yet. Refresh after the newest deployment and try again.",
    titleSourceLabels: {
      user: "user edited",
      imported_heading: "imported heading",
      rule_neutral_tags: "content title",
      rule_neutral_tag: "content title",
      first_phrase: "first phrase",
      untitled: "untitled",
      import_review: "reviewed import",
    },
    openDashboard: "Open My Dream Map",
    importingLabel: "Importing...",
    titleSourceLabel: "Title source",
    confidenceLabel: "Confidence",
    titleSources: {
      imported_heading: "Imported heading",
      rule_neutral_tags: "Neutral tags",
      rule_neutral_tag: "Neutral tag",
      first_phrase: "First phrase",
      untitled: "Untitled fallback",
      import_review: "Import review",
      user: "User edited",
      blank: "Blank",
    },
    maxNotice: ({ max }) => `For safety and review quality, one import is limited to ${max} dreams.`,
  },
  zh: {
    documentTitle: "匯入夢境日記",
    database: "研究檔案庫",
    recordButton: "記錄夢境",
    account: "帳戶",
    languageLabel: "切換介面語言",
    englishLabel: "英文介面",
    chineseLabel: "繁體中文介面",
    spanishLabel: "西班牙文介面",
    kicker: "批次私人匯入",
    title: "匯入你的夢境日記",
    subtitle:
      "上傳既有夢境日記並連到你的帳戶。儲存前可以檢查每一則夢的切分、標題、標籤與公開方式。",
    uploadTitle: "1. 上傳或貼上日記文字",
    uploadText:
      "支援格式：TXT、Markdown（.md）、CSV、JSON。DOCX、Notion、Google Docs、Apple Notes 或手機備忘錄，請先匯出或複製成純文字／Markdown。",
    fileLabel: "日記檔案",
    fileButton: "選擇日記檔案",
    fileEmpty: "尚未選擇檔案",
    fileSelected: ({ name }) => `已選擇：${name}`,
    pasteLabel: "或貼上日記文字",
    pastePlaceholder: "如果沒有文字檔，也可以把多則夢境貼在這裡...",
    parserMode: "解析模式",
    modes: {
      auto: "自動偵測",
      date_headings: "依日期／標題分段",
      blank_lines: "每個空白段落一則夢",
      csv: "CSV 欄位",
      json: "JSON 陣列／物件",
    },
    originalLanguage: "預設原始語言",
    parseButton: "預覽夢境",
    refreshButton: "重新建議標題與標籤",
    importButton: "匯入選取項為私人夢境",
    importButtonGeneric: "匯入選取夢境",
    importingButton: "正在匯入...",
    sharingTitle: "匯入後的公開方式",
    sharingText: "日記匯入需要登入帳戶，這樣紀錄才會出現在「我的夢境地圖」並可在之後修改。",
    sharingPrivate: "保持私人",
    sharingAnonymous: "匿名公開",
    sharingAccount: "以帳戶公開",
    accountRequired: "請先登入帳戶再匯入日記。訪客可以記錄單則夢境，但批次日記匯入只限帳戶使用。",
    signInToImport: "登入後匯入",
    reviewTitle: "2. 匯入前檢查草稿",
    reviewText:
      "選擇這批夢境要保持私人、匿名公開，或以帳戶署名公開。標題與標籤只是建議；過度詮釋或牽強的標籤應先移除，再用於研究。",
    selectedCount: ({ selected, total }) => `已選 ${selected}/${total}`,
    noDrafts: "尚無夢境草稿。請上傳或貼上文字後預覽。",
    titleLabel: "標題",
    textLabel: "夢境文字",
    dateLabel: "夢境日期",
    unknownDate: "日期不確定",
    language: "語言",
    boundary: "切分信心",
    sourceLines: "來源行數",
    includeDraft: "包含",
    deleteDraft: "刪除",
    splitDraft: "依空白行切分",
    mergePrevious: "與上一則合併",
    suggestedTags: "含證據的建議標籤",
    noTags: "沒有找到足夠明確的證據標籤。",
    privacyTitle: "隱私優先",
    privacyText:
      "批次匯入會連到你的帳戶，之後可以修改或刪除。若選擇公開，所選身份模式會套用到每一則匯入夢境。",
    disclaimerTitle: "這不是診斷",
    disclaimerText:
      "自動標題與標籤只描述夢中可見內容，不是醫療、心理或精神科診斷。",
    fileTooLarge: "日記檔太大。請使用 5 MB 以下檔案，或拆成較小檔案。",
    unsupportedFormat: "此匯入器請使用 TXT、Markdown、CSV 或 JSON。",
    readFailed: "無法讀取檔案。",
    parseFailed: "無法解析日記。請檢查格式，或改用空白段落模式。",
    importNeedsDrafts: "請至少選取一則夢境匯入。",
    importStarted: "正在匯入夢境紀錄...",
    importComplete: ({ count }) => `已匯入 ${count} 則夢境。`,
    skippedComplete: ({ count }) => `已略過 ${count} 則重複夢境。`,
    importErrors: ({ count }) => `${count} 則草稿無法匯入。請檢查訊息後再試。`,
    firstImportError: ({ message }) => `第一個錯誤：${message}`,
    sharingWarning: "部分夢境已匯入，但公開狀態無法更新，因此保留為私人。",
    storageWarning: "原始檔案儲存尚不可用，但解析後的私人紀錄仍可儲存。",
    importFailed: "匯入無法完成。請檢查草稿後再試一次。",
    permissionDenied: "目前尚無法儲存這批夢境。請在最新版本部署完成後重新整理，再試一次。",
    titleSourceLabels: {
      user: "使用者編輯",
      imported_heading: "原始標題",
      rule_neutral_tags: "內容標題",
      rule_neutral_tag: "內容標題",
      first_phrase: "首句擷取",
      untitled: "未命名",
      import_review: "匯入檢查",
    },
    openDashboard: "開啟我的夢境地圖",
    importingLabel: "匯入中...",
    titleSourceLabel: "標題來源",
    confidenceLabel: "信心",
    titleSources: {
      imported_heading: "匯入標題",
      rule_neutral_tags: "中性標籤",
      rule_neutral_tag: "中性標籤",
      first_phrase: "首句片語",
      untitled: "無標題備用",
      import_review: "匯入檢查",
      user: "使用者編輯",
      blank: "空白",
    },
    maxNotice: ({ max }) => `為了安全與檢查品質，每次匯入最多 ${max} 則夢。`,
  },
  es: {
    documentTitle: "Importar diario de sueños",
    database: "Archivo de investigación",
    recordButton: "Registrar sueño",
    account: "Cuenta",
    languageLabel: "Cambiar idioma de la interfaz",
    englishLabel: "Interfaz en inglés",
    chineseLabel: "Interfaz en chino tradicional",
    spanishLabel: "Interfaz en español",
    kicker: "Importación privada por lotes",
    title: "Importa tu diario de sueños",
    subtitle:
      "Sube un diario existente y vincúlalo a tu cuenta. Revisa cada división, título, etiqueta y modo de compartir antes de guardar.",
    uploadTitle: "1. Sube o pega el texto del diario",
    uploadText:
      "Formatos aceptados: TXT, Markdown (.md), CSV y JSON. Para DOCX, Notion, Google Docs, Apple Notes o notas del teléfono, exporta o copia primero como texto plano/Markdown.",
    fileLabel: "Archivo del diario",
    fileButton: "Seleccionar archivo",
    fileEmpty: "Ningún archivo seleccionado",
    fileSelected: ({ name }) => `Seleccionado: ${name}`,
    pasteLabel: "O pega texto del diario",
    pastePlaceholder: "Pega varios sueños aquí si no tienes un archivo de texto...",
    parserMode: "Modo de análisis",
    modes: {
      auto: "Detectar automáticamente",
      date_headings: "Secciones por fecha/título",
      blank_lines: "Un sueño por bloque vacío",
      csv: "Columnas CSV",
      json: "Arreglo JSON / objeto",
    },
    originalLanguage: "Idioma original por defecto",
    parseButton: "Previsualizar sueños",
    refreshButton: "Sugerir títulos y etiquetas otra vez",
    importButton: "Importar seleccionados como privados",
    importButtonGeneric: "Importar sueños seleccionados",
    importingButton: "Importando...",
    sharingTitle: "Modo de compartir",
    sharingText:
      "La importación de diario requiere una cuenta para que los registros aparezcan en Mi mapa de sueños y puedan editarse después.",
    sharingPrivate: "Mantener privado",
    sharingAnonymous: "Compartir público anónimo",
    sharingAccount: "Compartir público con cuenta",
    accountRequired: "Inicia sesión con una cuenta antes de importar un diario. Las sesiones invitadas pueden registrar un sueño, pero la importación por lotes requiere cuenta.",
    signInToImport: "Iniciar sesión para importar",
    reviewTitle: "2. Revisa borradores antes de importar",
    reviewText:
      "Elige si este lote queda privado, se publica de forma anónima o se publica con atribución de cuenta. Los títulos y etiquetas son sugerencias; elimina etiquetas débiles o forzadas antes de usarlas en investigación.",
    selectedCount: ({ selected, total }) => `${selected}/${total} seleccionados`,
    noDrafts: "Aún no hay borradores. Sube o pega texto y previsualiza.",
    titleLabel: "Título",
    textLabel: "Texto del sueño",
    dateLabel: "Fecha del sueño",
    unknownDate: "Fecha desconocida",
    language: "Idioma",
    boundary: "Confianza de división",
    sourceLines: "Líneas fuente",
    includeDraft: "Incluir",
    deleteDraft: "Eliminar",
    splitDraft: "Dividir por líneas vacías",
    mergePrevious: "Unir con anterior",
    suggestedTags: "Etiquetas sugeridas con evidencia",
    noTags: "No se encontraron etiquetas fuertes basadas en evidencia.",
    privacyTitle: "Privacidad primero",
    privacyText:
      "Las importaciones por lotes quedan vinculadas a tu cuenta para que puedas editarlas o eliminarlas después. Si eliges compartir públicamente, el modo de identidad seleccionado se aplica a cada sueño importado.",
    disclaimerTitle: "No es un diagnóstico",
    disclaimerText:
      "Los títulos y etiquetas automáticos describen contenido visible del sueño. No son diagnósticos médicos, psicológicos ni psiquiátricos.",
    fileTooLarge: "El archivo es demasiado grande. Usa un archivo menor de 5 MB o divídelo.",
    unsupportedFormat: "Usa TXT, Markdown, CSV o JSON para este importador.",
    readFailed: "No se pudo leer el archivo.",
    parseFailed: "No se pudo analizar el diario. Revisa el formato o usa el modo de bloques vacíos.",
    importNeedsDrafts: "Selecciona al menos un sueño para importar.",
    importStarted: "Importando registros de sueños...",
    importComplete: ({ count }) => `${count} sueños importados.`,
    skippedComplete: ({ count }) => `${count} sueños duplicados omitidos.`,
    importErrors: ({ count }) => `${count} borradores no se pudieron importar. Revisa los mensajes e inténtalo de nuevo.`,
    firstImportError: ({ message }) => `Primer error: ${message}`,
    sharingWarning:
      "Algunos sueños se importaron pero quedaron privados porque no se pudo actualizar el modo público.",
    storageWarning: "El almacenamiento del archivo original no está disponible, pero los registros privados procesados se pueden guardar.",
    importFailed: "La importación no se pudo completar. Revisa los borradores e inténtalo de nuevo.",
    permissionDenied:
      "El archivo todavía no pudo guardar estos sueños. Actualiza después del despliegue más reciente e inténtalo de nuevo.",
    titleSourceLabels: {
      user: "editado por usuario",
      imported_heading: "título importado",
      rule_neutral_tags: "título de contenido",
      rule_neutral_tag: "título de contenido",
      first_phrase: "primera frase",
      untitled: "sin título",
      import_review: "importación revisada",
    },
    openDashboard: "Abrir Mi mapa de sueños",
    importingLabel: "Importando...",
    titleSourceLabel: "Fuente del título",
    confidenceLabel: "Confianza",
    titleSources: {
      imported_heading: "Encabezado importado",
      rule_neutral_tags: "Etiquetas neutras",
      rule_neutral_tag: "Etiqueta neutra",
      first_phrase: "Primera frase",
      untitled: "Sin título",
      import_review: "Revisión de importación",
      user: "Editado por usuario",
      blank: "Vacío",
    },
    maxNotice: ({ max }) => `Por seguridad y calidad de revisión, cada importación se limita a ${max} sueños.`,
  },
};

const MODE_OPTIONS = [
  DIARY_IMPORT_MODES.AUTO,
  DIARY_IMPORT_MODES.DATE_HEADINGS,
  DIARY_IMPORT_MODES.BLANK_LINES,
  DIARY_IMPORT_MODES.CSV,
  DIARY_IMPORT_MODES.JSON,
];

const DREAM_PERIOD_OPTIONS = ["morning", "afternoon", "evening", "night"];
const DREAM_SEQUENCE_OPTIONS = [1, 2, 3, 4, 5, 6];

const IMPORT_TIME_COPY = {
  en: {
    timeLabel: "Clock time",
    periodLabel: "Time of day",
    sequenceLabel: "Dream order",
    noPeriod: "Not sure",
    translationComplete: ({ count }) =>
      `${count} diary versions attached as recorder translations.`,
    formatTitle: "Diary upload format",
    formatText:
      "Best for translation linking: include dreamKey for the same dream across language files. If dreamKey is absent, include dreamDate plus either dreamTime or dreamPeriod, and keep dreamSequence as 1 unless it is the second or later dream in that same period.",
    formatColumns:
      "CSV columns: dreamKey,date,time,period,sequence,language,title,text,tags,adultContent",
    promptTitle: "Copyable AI formatting prompt",
    promptText:
      "Convert my dream diary into CSV for import. Do not invent, beautify, summarize, moralize, censor, or rewrite dream content. Preserve first-person wording and original details. Only structure the diary into columns: dreamKey,date,time,period,sequence,language,title,text,tags,adultContent. Use dreamKey as a stable ID for the same dream across different language versions, such as dream-001. Use date as YYYY-MM-DD when known, time as HH:mm when known, period as morning/afternoon/evening/night when stated, sequence as 1 by default unless the diary clearly says second/third dream in the same period, language as en/zh/es. If the diary has no title, you may add a short factual neutral title based only on the dream content; leave title blank if still unclear. Put tags in the tags column separated by semicolons, using concrete content, emotion, weather, style, era, perspective, dream-type, and psychological-observable labels present in the diary. If no existing tag fits a clearly present detail, add a short new tag label in the same tags column. adultContent is true only when explicit adult content appears. Keep the text column as close to the original diary words as possible.",
    copyPrompt: "Copy prompt",
    copiedPrompt: "Copied",
    periods: {
      morning: "Morning",
      afternoon: "Afternoon",
      evening: "Evening",
      night: "Night",
    },
    sequences: {
      1: "First dream",
      2: "Second dream",
      3: "Third dream",
      4: "Fourth dream",
      5: "Fifth dream",
      6: "Sixth dream",
    },
  },
  zh: {
    timeLabel: "夢境時間",
    periodLabel: "時段",
    sequenceLabel: "第幾個夢",
    noPeriod: "不確定",
    translationComplete: ({ count }) => `已連結 ${count} 份不同語言日記版本。`,
    formatTitle: "日記上傳格式",
    formatText:
      "若要連結不同語言版本，最好為同一個夢填入相同 dreamKey。若沒有 dreamKey，請提供夢境日期，並填入精確時間或時段；同一時段若沒有特別說明，夢序預設為第一個夢。",
    formatColumns:
      "CSV 欄位：dreamKey,date,time,period,sequence,language,title,text,tags,adultContent",
    promptTitle: "可複製的 AI 格式整理提示詞",
    promptText:
      "請把我的夢境日記整理成可匯入的 CSV。不要創造、修飾、摘要、美化、道德化、審查或改寫夢境內容。保留第一人稱與原始細節。只整理成欄位：dreamKey,date,time,period,sequence,language,title,text,tags,adultContent。dreamKey 是同一個夢在不同語言版本中的穩定 ID，例如 dream-001。date 用 YYYY-MM-DD；time 若知道用 HH:mm；period 只用 morning/afternoon/evening/night；若同一時段沒有明確說第幾個夢，sequence 預設為 1；language 用 en/zh/es。若原日記沒有標題，可以只根據夢境內容加一個短而中性的事實標題；仍不清楚就留空。tags 欄位用分號分隔，盡量使用日記中可見的具體內容、情緒、天氣、風格、時代、視角、夢境類型與心理觀察標籤。若現有標籤沒有符合某個清楚出現的細節，可以在同一欄新增短的新標籤。adultContent 只有明確成人內容才填 true。text 欄位要盡量保留原本日記文字。",
    copyPrompt: "複製提示詞",
    copiedPrompt: "已複製",
    periods: {
      morning: "早晨",
      afternoon: "下午",
      evening: "傍晚",
      night: "夜晚",
    },
    sequences: {
      1: "第一個夢",
      2: "第二個夢",
      3: "第三個夢",
      4: "第四個夢",
      5: "第五個夢",
      6: "第六個夢",
    },
  },
  es: {
    timeLabel: "Hora",
    periodLabel: "Momento del dia",
    sequenceLabel: "Orden del sueno",
    noPeriod: "No seguro",
    translationComplete: ({ count }) =>
      `${count} versiones del diario vinculadas como traducciones del autor.`,
    formatTitle: "Formato de subida del diario",
    formatText:
      "Para vincular versiones traducidas: usa el mismo dreamKey para el mismo sueño. Si no hay dreamKey, incluye dreamDate y dreamTime o dreamPeriod; deja dreamSequence en 1 salvo que sea el segundo o tercer sueno del mismo momento.",
    formatColumns:
      "Columnas CSV: dreamKey,date,time,period,sequence,language,title,text,tags,adultContent",
    promptTitle: "Prompt copiable para IA",
    promptText:
      "Convierte mi diario de sueños en CSV para importar. No inventes, embellezcas, resumas, moralices, censures ni reescribas el contenido del sueño. Conserva la primera persona y los detalles originales. Solo organiza el diario en columnas: dreamKey,date,time,period,sequence,language,title,text,tags,adultContent. Usa dreamKey como ID estable para el mismo sueño en distintas versiones de idioma, por ejemplo dream-001. Usa date como YYYY-MM-DD cuando se conozca, time como HH:mm cuando se conozca, period como morning/afternoon/evening/night cuando aparezca, sequence como 1 por defecto salvo que el diario diga claramente segundo/tercer sueño en el mismo periodo, language como en/zh/es. Si no hay título, puedes añadir un título breve, factual y neutral basado solo en el contenido del sueño; deja title vacío si no está claro. En tags, separa etiquetas con punto y coma y usa contenido concreto, emociones, clima, estilo, época, perspectiva, tipo de sueño y observables psicológicos presentes en el diario. Si ninguna etiqueta existente encaja con un detalle claro, añade una etiqueta nueva y breve en la misma columna tags. adultContent true solo si hay contenido adulto explícito. Mantén la columna text lo más cercana posible a las palabras originales.",
    copyPrompt: "Copiar prompt",
    copiedPrompt: "Copiado",
    periods: {
      morning: "Manana",
      afternoon: "Tarde",
      evening: "Atardecer",
      night: "Noche",
    },
    sequences: {
      1: "Primer sueno",
      2: "Segundo sueno",
      3: "Tercer sueno",
      4: "Cuarto sueno",
      5: "Quinto sueno",
      6: "Sexto sueno",
    },
  },
};

export default function ImportDreamDiaryPage({
  language = "zh",
  setLanguage = () => {},
  currentUser,
  onOpenDatabase,
  onOpenDashboard,
  onOpenAuth,
  onOpenRecorder,
}) {
  const copy = IMPORT_COPY[language] || IMPORT_COPY.zh;
  const [file, setFile] = useState(null);
  const [rawText, setRawText] = useState("");
  const [parserMode, setParserMode] = useState(DIARY_IMPORT_MODES.AUTO);
  const [defaultLanguage, setDefaultLanguage] = useState(normalizeLanguage(language));
  const [drafts, setDrafts] = useState([]);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [promptCopied, setPromptCopied] = useState(false);
  const [sharingMode, setSharingMode] = useState("private");
  const timeCopy = getImportTimeCopy(language);
  const hasImportAccount = Boolean(currentUser?.uid && !currentUser.isAnonymous);
  const sharingOptions = [
    { value: "private", label: copy.sharingPrivate },
    { value: "public_anonymous", label: copy.sharingAnonymous },
    { value: "public_pseudonym", label: copy.sharingAccount },
  ];

  const selectedCount = useMemo(
    () => drafts.filter((draft) => draft.selected !== false).length,
    [drafts]
  );

  useEffect(() => {
    document.title = copy.documentTitle;
  }, [copy.documentTitle]);

  function getFileErrorMessage(code) {
    if (code === "too-large") return copy.fileTooLarge;
    if (code === "unsupported-format") return copy.unsupportedFormat;
    return copy.readFailed;
  }

  async function handleFileChange(event) {
    const nextFile = event.target.files?.[0] || null;
    setError("");
    setNotice("");
    setResult(null);
    setFile(nextFile);

    if (!nextFile) return;
    if (!hasImportAccount) {
      setError(copy.accountRequired);
      return;
    }

    const validationCode = validateDiaryFile(nextFile);
    if (validationCode) {
      setError(getFileErrorMessage(validationCode));
      return;
    }

    try {
      const text = await readDiaryFile(nextFile);
      setRawText(text);
      parseDrafts(text, nextFile.name, parserMode);
    } catch (readError) {
      setError(getFileErrorMessage(readError?.code));
    }
  }

  function parseDrafts(text = rawText, fileName = file?.name || "pasted-diary.txt", mode = parserMode) {
    setError("");
    setNotice("");
    setResult(null);

    if (!hasImportAccount) {
      setError(copy.accountRequired);
      return;
    }

    try {
      const parsedDrafts = parseDiaryFileText(text, {
        mode,
        language: defaultLanguage,
        fileName,
      });
      setDrafts(parsedDrafts);
      setNotice(copy.maxNotice({ max: MAX_IMPORT_DRAFTS }));
    } catch {
      setError(copy.parseFailed);
    }
  }

  function updateDraft(id, patch) {
    setDrafts((current) =>
      current.map((draft) => (draft.id === id ? { ...draft, ...patch } : draft))
    );
  }

  function refreshAllSuggestions() {
    setDrafts((current) =>
      current.map((draft, index) =>
        refreshDraftSuggestions(draft, index, draft.originalLanguage || defaultLanguage)
      )
    );
  }

  function toggleDraftTag(draftId, slug) {
    setDrafts((current) =>
      current.map((draft) => {
        if (draft.id !== draftId) return draft;
        const selected = new Set(draft.selectedTagSlugs || []);
        if (selected.has(slug)) selected.delete(slug);
        else selected.add(slug);
        return {
          ...draft,
          selectedTagSlugs: [...selected],
          tagsReviewedByUser: true,
        };
      })
    );
  }

  function removeDraft(id) {
    setDrafts((current) => current.filter((draft) => draft.id !== id));
  }

  function splitDraft(id) {
    setDrafts((current) => {
      const index = current.findIndex((draft) => draft.id === id);
      if (index < 0) return current;
      const draft = current[index];
      const splitDrafts = parseDiaryFileText(draft.rawText, {
        mode: DIARY_IMPORT_MODES.BLANK_LINES,
        language: draft.originalLanguage || defaultLanguage,
        fileName: "split.txt",
      });

      if (splitDrafts.length <= 1) return current;

      return [
        ...current.slice(0, index),
        ...splitDrafts.map((item, itemIndex) => ({
          ...item,
          sourceOrderIndex: draft.sourceOrderIndex + itemIndex / 100,
        })),
        ...current.slice(index + 1),
      ].map((item, itemIndex) => ({ ...item, orderIndex: itemIndex }));
    });
  }

  function mergeWithPrevious(id) {
    setDrafts((current) => {
      const index = current.findIndex((draft) => draft.id === id);
      if (index <= 0) return current;
      const previous = current[index - 1];
      const currentDraft = current[index];
      const mergedRawText = [previous.rawText, currentDraft.rawText].filter(Boolean).join("\n\n");
      const merged = refreshDraftSuggestions(
        {
          ...previous,
          rawText: mergedRawText,
          title: previous.title || currentDraft.title,
          userEditedTitle: Boolean(previous.userEditedTitle),
          boundaryConfidence: Math.min(previous.boundaryConfidence || 0.5, currentDraft.boundaryConfidence || 0.5),
          boundaryReason: "user_merged",
          sourceLineEnd: currentDraft.sourceLineEnd || previous.sourceLineEnd,
        },
        index - 1,
        previous.originalLanguage || defaultLanguage
      );

      return [
        ...current.slice(0, index - 1),
        merged,
        ...current.slice(index + 1),
      ].map((item, itemIndex) => ({ ...item, orderIndex: itemIndex }));
    });
  }

  async function copyFormatPrompt() {
    setPromptCopied(false);
    try {
      await navigator.clipboard.writeText(timeCopy.promptText);
      setPromptCopied(true);
      window.setTimeout(() => setPromptCopied(false), 1800);
    } catch {
      setError(timeCopy.promptText);
    }
  }

  async function handleImportSelected() {
    setError("");
    setNotice("");
    setResult(null);

    const selectedDrafts = drafts.filter((draft) => draft.selected !== false);
    if (selectedDrafts.length === 0) {
      setError(copy.importNeedsDrafts);
      setNotice("");
      return;
    }

    if (!hasImportAccount) {
      setError(copy.accountRequired);
      return;
    }

    setNotice(copy.importStarted);
    setImporting(true);

    try {
      const submissionUser = currentUser;
      const profile = await getOrCreateUserProfile(submissionUser).catch(() => null);

      const importResult = await createDreamDiaryImport({
        currentUser: submissionUser,
        file,
        rawText,
        drafts: selectedDrafts,
        profile,
        parserMode,
        sourceFormat: parserMode,
        fileName: file?.name || "pasted-diary.txt",
        sharingMode,
      });

      setResult(importResult);
      const translationCount = importResult.linkedTranslationRecords?.length || 0;
      const skippedCount = importResult.skippedDrafts?.length || 0;
      const translationNotice =
        translationCount > 0
          ? ` ${getImportTimeCopy(language).translationComplete({ count: translationCount })}`
          : "";
      const skippedNotice =
        skippedCount > 0 ? ` ${copy.skippedComplete({ count: skippedCount })}` : "";
      const sharingWarningCount = [
        ...(importResult.importedRecords || []),
        ...(importResult.linkedTranslationRecords || []),
      ].filter((record) => record?.sharingUpdateError).length;
      const sharingWarning = sharingWarningCount > 0 ? ` ${copy.sharingWarning}` : "";
      setNotice(
        `${copy.importComplete({ count: importResult.importedRecords.length })}${translationNotice}${skippedNotice}${sharingWarning}`
      );
      if (importResult.failedDrafts.length > 0) {
        const firstError = String(
          importResult.failedDrafts.find((item) => item?.error)?.error || ""
        ).slice(0, 500);
        setError(
          [
            copy.importErrors({ count: importResult.failedDrafts.length }),
            firstError
              ? copy.firstImportError({
                  message: getImportDisplayError(firstError, copy),
                })
              : "",
          ]
            .filter(Boolean)
            .join(" ")
        );
      }
      if (importResult.storageUploadError) {
        setNotice(`${copy.importComplete({ count: importResult.importedRecords.length })}${translationNotice}${skippedNotice}${sharingWarning} ${copy.storageWarning}`);
      }
    } catch (importError) {
      setError(getImportDisplayError(importError, copy));
      setNotice("");
    } finally {
      setImporting(false);
    }
  }

  return (
    <main className="relative min-h-screen w-full max-w-full overflow-x-hidden bg-[#030407] text-zinc-100 selection:bg-cyan-300/30 selection:text-cyan-50">
      <ImportBackground />

      <div className="relative mx-auto w-full max-w-7xl overflow-x-hidden px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        <header className="mb-5 flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <button type="button" onClick={onOpenDatabase} className="group flex min-w-0 items-center gap-3 self-start">
            <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-cyan-300/30 bg-cyan-300/10 shadow-[0_0_24px_rgba(34,211,238,.16)] sm:h-10 sm:w-10">
              <span className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,.35),transparent_55%)]" />
              <span className="relative font-mono text-sm font-bold text-cyan-100">C∴</span>
            </span>
            <span className="min-w-0">
              <span className="block font-mono text-xs uppercase tracking-[0.36em] text-cyan-200/80">CDO</span>
              <span className="block truncate text-sm font-semibold text-zinc-100">{copy.database}</span>
            </span>
          </button>

          <div className="grid w-full grid-cols-2 gap-2 min-[460px]:grid-cols-3 sm:flex sm:w-auto sm:flex-wrap sm:items-center">
            {onOpenRecorder && (
              <button
                type="button"
                onClick={onOpenRecorder}
                className="min-w-0 rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-3 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-300/15 sm:px-4 sm:text-xs sm:tracking-[0.18em]"
              >
                {copy.recordButton}
              </button>
            )}
            {currentUser?.uid && (
              <button
                type="button"
                onClick={onOpenDashboard}
                className="cdo-mobile-label min-w-0 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-100 transition hover:border-fuchsia-300/35 hover:bg-fuchsia-300/10 sm:px-4 sm:text-xs sm:tracking-[0.18em]"
              >
                {copy.account}
              </button>
            )}
            <LanguageMenu language={language} setLanguage={setLanguage} copy={copy} />
          </div>
        </header>

        <section className="mb-6 overflow-hidden rounded-3xl border border-cyan-300/15 bg-zinc-950/70 shadow-terminal backdrop-blur">
          <div className="grid gap-0 lg:grid-cols-[1.25fr_.75fr]">
            <div className="p-6 sm:p-8 lg:p-10">
              <p className="cdo-kicker">{copy.kicker}</p>
              <h1 className="mt-3 max-w-4xl break-words text-3xl font-semibold text-zinc-50 sm:text-5xl">{copy.title}</h1>
              <p className="cdo-body-copy mt-4 max-w-3xl">{copy.subtitle}</p>
            </div>
            <aside className="border-t border-white/10 bg-black/30 p-6 sm:p-8 lg:border-l lg:border-t-0">
              <InfoNotice title={copy.privacyTitle} text={copy.privacyText} />
              <div className="mt-4" />
              <InfoNotice title={copy.disclaimerTitle} text={copy.disclaimerText} tone="fuchsia" />
            </aside>
          </div>
        </section>

        <section className="mb-6 grid gap-5 lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)]">
          <div className="rounded-3xl border border-white/10 bg-zinc-950/65 p-5 backdrop-blur">
            <h2 className="cdo-panel-heading">{copy.uploadTitle}</h2>
            <p className="cdo-body-copy mt-3">{copy.uploadText}</p>

            <div className="mt-5">
              <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">{copy.fileLabel}</span>
              <label
                htmlFor="dream-diary-file"
                className={[
                  "flex cursor-pointer flex-col gap-3 rounded-2xl border border-cyan-300/15 bg-black/40 px-4 py-4 font-mono text-xs text-cyan-50 transition hover:border-cyan-300/40 sm:flex-row sm:items-center sm:justify-between",
                  !hasImportAccount ? "cursor-not-allowed opacity-50" : "",
                ].join(" ")}
              >
                <span className="inline-flex shrink-0 items-center justify-center rounded-xl bg-cyan-300 px-3 py-2 font-bold uppercase tracking-[0.14em] text-zinc-950">
                  {copy.fileButton}
                </span>
                <span className="min-w-0 truncate text-zinc-400">
                  {file ? copy.fileSelected({ name: file.name }) : copy.fileEmpty}
                </span>
                <input
                  id="dream-diary-file"
                  type="file"
                  accept={DIARY_FILE_ACCEPT}
                  onChange={handleFileChange}
                  disabled={!hasImportAccount}
                  className="sr-only"
                />
              </label>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-600">≤ {Math.round(MAX_DIARY_FILE_BYTES / 1024 / 1024)} MB</p>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">{copy.parserMode}</span>
                <select
                  value={parserMode}
                  onChange={(event) => setParserMode(event.target.value)}
                  disabled={!hasImportAccount}
                  className="w-full rounded-2xl border border-cyan-300/15 bg-black/40 px-4 py-3 font-mono text-sm text-cyan-50 outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20"
                >
                  {MODE_OPTIONS.map((mode) => (
                    <option key={mode} value={mode}>{copy.modes[mode]}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">{copy.originalLanguage}</span>
                <select
                  value={defaultLanguage}
                  onChange={(event) => setDefaultLanguage(event.target.value)}
                  disabled={!hasImportAccount}
                  className="w-full rounded-2xl border border-cyan-300/15 bg-black/40 px-4 py-3 font-mono text-sm text-cyan-50 outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20"
                >
                  {LANGUAGE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="mt-4 block">
              <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">{copy.pasteLabel}</span>
              <textarea
                value={rawText}
                onChange={(event) => setRawText(event.target.value)}
                placeholder={copy.pastePlaceholder}
                disabled={!hasImportAccount}
                className="min-h-44 w-full resize-y rounded-2xl border border-cyan-300/15 bg-black/40 px-4 py-3 font-mono text-sm leading-6 text-cyan-50 outline-none transition placeholder:text-zinc-600 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20"
              />
            </label>

            <button
              type="button"
              onClick={() => parseDrafts()}
              disabled={!hasImportAccount}
              className="mt-4 w-full rounded-2xl border border-cyan-300/35 bg-cyan-300 px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.18em] text-zinc-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {copy.parseButton}
            </button>

            <section className="mt-4 rounded-2xl border border-fuchsia-300/15 bg-fuchsia-300/5 p-4">
              <h3 className="cdo-card-heading">
                {timeCopy.formatTitle}
              </h3>
              <p className="cdo-body-copy mt-2">
                {timeCopy.formatText}
              </p>
              <code className="mt-3 block overflow-x-auto rounded-xl border border-white/10 bg-black/45 p-3 font-mono text-[11px] leading-5 text-cyan-100">
                {timeCopy.formatColumns}
              </code>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="cdo-metric-label">
                  {timeCopy.promptTitle}
                </p>
                <button
                  type="button"
                  onClick={copyFormatPrompt}
                  className="rounded-xl border border-fuchsia-300/25 bg-fuchsia-300/10 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-fuchsia-100 transition hover:border-fuchsia-300/45 hover:bg-fuchsia-300/15"
                >
                  {promptCopied ? timeCopy.copiedPrompt : timeCopy.copyPrompt}
                </button>
              </div>
              <p className="mt-3 max-h-28 overflow-y-auto rounded-xl border border-white/10 bg-black/30 p-3 text-xs leading-5 text-zinc-400">
                {timeCopy.promptText}
              </p>
            </section>
          </div>

          <div className="rounded-3xl border border-white/10 bg-zinc-950/65 p-5 backdrop-blur">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="cdo-panel-heading">{copy.reviewTitle}</h2>
                <p className="cdo-body-copy mt-3 max-w-3xl">{copy.reviewText}</p>
              </div>
              <span className="rounded-full border border-cyan-300/20 bg-cyan-300/5 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-cyan-100">
                {copy.selectedCount({ selected: selectedCount, total: drafts.length })}
              </span>
            </div>

            <section className="mt-4 rounded-2xl border border-cyan-300/15 bg-cyan-300/5 p-4">
              <h3 className="cdo-card-heading">
                {copy.sharingTitle}
              </h3>
              <p className="cdo-body-copy mt-2">
                {copy.sharingText}
              </p>
              <div className="mt-3 grid gap-2 md:grid-cols-3">
                {sharingOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSharingMode(option.value)}
                    disabled={option.value === "public_pseudonym" && !hasImportAccount}
                    className={[
                      "min-w-0 rounded-xl border px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] transition disabled:cursor-not-allowed disabled:opacity-45",
                      sharingMode === option.value
                        ? "border-cyan-300/35 bg-cyan-300/10 text-cyan-100"
                        : "border-white/10 bg-white/[0.03] text-zinc-400 hover:border-fuchsia-300/30 hover:text-fuchsia-100",
                    ].join(" ")}
                  >
                    <span className="block truncate">{option.label}</span>
                  </button>
                ))}
              </div>
              {!hasImportAccount && (
                <div className="mt-3 rounded-xl border border-amber-300/20 bg-amber-300/5 p-3">
                  <p className="text-xs leading-5 text-amber-100/90">
                    {copy.accountRequired}
                  </p>
                  <button
                    type="button"
                    onClick={onOpenAuth || onOpenDashboard}
                    className="mt-3 rounded-xl border border-amber-300/30 bg-amber-300/10 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-amber-100 transition hover:border-amber-300/50"
                  >
                    {copy.signInToImport}
                  </button>
                </div>
              )}
            </section>

            <div className="cdo-mobile-stack-actions mt-4 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={refreshAllSuggestions}
                disabled={drafts.length === 0}
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.16em] text-zinc-100 transition hover:border-fuchsia-300/35 hover:bg-fuchsia-300/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {copy.refreshButton}
              </button>
              <button
                type="button"
                onClick={handleImportSelected}
                disabled={importing || selectedCount === 0 || !hasImportAccount}
                className="rounded-2xl border border-cyan-300/35 bg-cyan-300 px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.16em] text-zinc-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {importing ? copy.importingLabel : copy.importButtonGeneric || copy.importButton}
              </button>
            </div>

            {(notice || error || result) && (
              <div className="mt-4 space-y-2">
                {notice && <p className="rounded-2xl border border-cyan-300/20 bg-cyan-300/5 p-3 font-mono text-xs leading-5 text-cyan-100">{notice}</p>}
                {error && <p className="rounded-2xl border border-red-300/20 bg-red-400/5 p-3 font-mono text-xs leading-5 text-red-100">{error}</p>}
                {result?.batchId && (
                  <button
                    type="button"
                    onClick={onOpenDashboard}
                    className="rounded-2xl border border-fuchsia-300/25 bg-fuchsia-300/10 px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.16em] text-fuchsia-100 transition hover:border-fuchsia-300/45 hover:bg-fuchsia-300/15"
                  >
                    {copy.openDashboard}
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        {drafts.length === 0 ? (
          <section className="rounded-3xl border border-dashed border-cyan-300/20 bg-cyan-300/5 p-10 text-center">
            <p className="font-mono text-sm uppercase tracking-[0.24em] text-cyan-100">{copy.noDrafts}</p>
          </section>
        ) : (
          <section className="space-y-5">
            {drafts.map((draft, index) => (
              <DraftCard
                key={draft.id}
                draft={draft}
                index={index}
                language={language}
                copy={copy}
                onUpdate={(patch) => updateDraft(draft.id, patch)}
                onToggleTag={(slug) => toggleDraftTag(draft.id, slug)}
                onDelete={() => removeDraft(draft.id)}
                onSplit={() => splitDraft(draft.id)}
                onMergePrevious={() => mergeWithPrevious(draft.id)}
              />
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

function DraftCard({ draft, index, language, copy, onUpdate, onToggleTag, onDelete, onSplit, onMergePrevious }) {
  const selectedTagSet = new Set(draft.selectedTagSlugs || []);
  const confidence = Math.round(Number(draft.boundaryConfidence || 0) * 100);
  const timeCopy = getImportTimeCopy(language);

  return (
    <article className="rounded-3xl border border-white/10 bg-zinc-950/70 p-5 shadow-[0_14px_48px_rgba(0,0,0,.28)] backdrop-blur">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <label className="flex items-center gap-3 rounded-2xl border border-cyan-300/20 bg-cyan-300/5 px-4 py-3">
          <input
            type="checkbox"
            checked={draft.selected !== false}
            onChange={(event) => onUpdate({ selected: event.target.checked })}
            className="h-4 w-4 accent-cyan-300"
          />
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-cyan-100">{copy.includeDraft} #{index + 1}</span>
        </label>
        <div className="grid w-full gap-2 min-[520px]:grid-cols-3 lg:w-auto">
          <button type="button" onClick={onSplit} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-300 transition hover:border-cyan-300/35 hover:text-cyan-100">{copy.splitDraft}</button>
          <button type="button" onClick={onMergePrevious} disabled={index === 0} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-300 transition hover:border-fuchsia-300/35 hover:text-fuchsia-100 disabled:cursor-not-allowed disabled:opacity-40">{copy.mergePrevious}</button>
          <button type="button" onClick={onDelete} className="rounded-xl border border-red-300/20 bg-red-400/5 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-red-100 transition hover:border-red-300/45 hover:bg-red-400/10">{copy.deleteDraft}</button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <label className="block xl:col-span-2">
          <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">{copy.titleLabel}</span>
          <input
            value={draft.title || ""}
            onChange={(event) => onUpdate({ title: event.target.value, userEditedTitle: true, titleSource: "user", titleConfidence: 1 })}
            className="w-full rounded-2xl border border-cyan-300/15 bg-black/40 px-4 py-3 font-mono text-sm text-cyan-50 outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20"
          />
        </label>

        <label className="block">
          <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">{copy.dateLabel}</span>
          <input
            type="date"
            value={draft.detectedDate || ""}
            onChange={(event) => onUpdate({ detectedDate: event.target.value, dreamDateStatus: event.target.value ? "known" : "unknown" })}
            className="w-full rounded-2xl border border-cyan-300/15 bg-black/40 px-4 py-3 font-mono text-sm text-cyan-50 outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20"
          />
          {!draft.detectedDate && <p className="mt-2 text-xs text-zinc-500">{copy.unknownDate}</p>}
        </label>

        <label className="block">
          <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">{timeCopy.timeLabel}</span>
          <input
            type="time"
            value={draft.dreamTime || draft.detectedTime || ""}
            onChange={(event) => onUpdate({ dreamTime: event.target.value, detectedTime: event.target.value })}
            className="w-full rounded-2xl border border-cyan-300/15 bg-black/40 px-4 py-3 font-mono text-sm text-cyan-50 outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20"
          />
        </label>

        <label className="block">
          <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">{timeCopy.periodLabel}</span>
          <select
            value={draft.dreamPeriod || ""}
            onChange={(event) => onUpdate({ dreamPeriod: event.target.value })}
            className="w-full rounded-2xl border border-cyan-300/15 bg-black/40 px-4 py-3 font-mono text-sm text-cyan-50 outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20"
          >
            <option value="">{timeCopy.noPeriod}</option>
            {DREAM_PERIOD_OPTIONS.map((period) => (
              <option key={period} value={period}>{timeCopy.periods[period]}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">{timeCopy.sequenceLabel}</span>
          <select
            value={draft.dreamSequence || 1}
            onChange={(event) => onUpdate({ dreamSequence: Number(event.target.value) })}
            className="w-full rounded-2xl border border-cyan-300/15 bg-black/40 px-4 py-3 font-mono text-sm text-cyan-50 outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20"
          >
            {DREAM_SEQUENCE_OPTIONS.map((sequence) => (
              <option key={sequence} value={sequence}>{timeCopy.sequences[sequence]}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">{copy.language}</span>
          <select
            value={draft.originalLanguage || "en"}
            onChange={(event) => onUpdate({ originalLanguage: event.target.value })}
            className="w-full rounded-2xl border border-cyan-300/15 bg-black/40 px-4 py-3 font-mono text-sm text-cyan-50 outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20"
          >
            {LANGUAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{getLanguageName(option.value, language)}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="mt-4 block">
        <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">{copy.textLabel}</span>
        <textarea
          value={draft.rawText || ""}
          onChange={(event) => onUpdate({ rawText: event.target.value })}
          className="min-h-48 w-full resize-y rounded-2xl border border-cyan-300/15 bg-black/40 px-4 py-3 font-mono text-sm leading-6 text-cyan-50 outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20"
        />
      </label>

      <div className="mt-4 flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">
        <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">{copy.boundary}: {confidence}%</span>
        {(draft.sourceLineStart || draft.sourceLineEnd) && (
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">{copy.sourceLines}: {draft.sourceLineStart || "?"}-{draft.sourceLineEnd || "?"}</span>
        )}
        <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">{getTitleSourceLabel(copy, draft.titleSource)} / {Math.round(Number(draft.titleConfidence || 0) * 100)}%</span>
      </div>

      <section className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-fuchsia-200/70">{copy.suggestedTags}</p>
        {draft.suggestedTags?.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {draft.suggestedTags.map((tag) => {
              const checked = selectedTagSet.has(tag.slug);
              const tagLabel = getTagLabel(RECORD_TAGS[tag.slug] || tag, language);
              return (
                <label
                  key={`${draft.id}-${tag.slug}`}
                  className={[
                    "max-w-full cursor-pointer rounded-2xl border px-3 py-2 text-left transition",
                    checked
                      ? "border-cyan-300/35 bg-cyan-300/10 text-cyan-100"
                      : "border-white/10 bg-white/[0.03] text-zinc-400 hover:border-fuchsia-300/30 hover:text-fuchsia-100",
                  ].join(" ")}
                >
                  <span className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggleTag(tag.slug)}
                      className="mt-1 h-3.5 w-3.5 shrink-0 accent-cyan-300"
                    />
                    <span>
                      <span className="block font-mono text-[11px] font-bold uppercase tracking-[0.12em]">#{tagLabel} · {Math.round(tag.confidence * 100)}%</span>
                      {tag.evidence && <span className="mt-1 block max-w-md text-xs leading-5 text-zinc-500">{tag.evidence}</span>}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        ) : (
          <p className="mt-3 text-sm text-zinc-500">{copy.noTags}</p>
        )}
      </section>
    </article>
  );
}

function getTitleSourceLabel(copy, source) {
  const key = String(source || "untitled");
  return copy.titleSourceLabels?.[key] || key.replaceAll("_", " ");
}

function getImportTimeCopy(language) {
  return IMPORT_TIME_COPY[normalizeLanguage(language)] || IMPORT_TIME_COPY.zh;
}

function getImportDisplayError(error, copy) {
  const message =
    typeof error === "string"
      ? error
      : error?.message || error?.code || "";

  if (/permission|insufficient|missing/i.test(message)) {
    return copy.permissionDenied || copy.importFailed;
  }

  return message || copy.importFailed;
}

function InfoNotice({ title, text, tone = "cyan" }) {
  const toneClass =
    tone === "fuchsia"
      ? "border-fuchsia-300/20 bg-fuchsia-300/5 text-fuchsia-100"
      : "border-cyan-300/20 bg-cyan-300/5 text-cyan-100";

  return (
    <section className={`rounded-2xl border p-4 ${toneClass}`}>
      <h3 className="cdo-card-heading">{title}</h3>
      <p className="cdo-body-copy mt-2">{text}</p>
    </section>
  );
}

function ImportBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute left-1/2 top-[-22rem] h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute bottom-[-16rem] right-[-10rem] h-[36rem] w-[36rem] rounded-full bg-fuchsia-500/10 blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] bg-[size:44px_44px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,.10),transparent_34rem)]" />
    </div>
  );
}
