import LanguageMenu from "./LanguageMenu.jsx";

const PAGE_ORDER = [
  "privacy",
  "terms",
  "guidelines",
  "removal",
  "diagnosis",
  "support",
  "account-deletion",
];

const COPY = {
  en: {
    title: "Trust, Safety & Data Rights",
    subtitle:
      "Plain-language policies for the Collective Dream Observatory and its research archive.",
    back: "Back to archive",
    languageLabel: "Switch interface language",
    englishLabel: "English",
    chineseLabel: "Traditional Chinese",
    spanishLabel: "Spanish",
    pages: {
      privacy: {
        title: "Privacy Policy",
        body: [
          "Private Records are owner-only and may include full dream text, private titles, import metadata, and account-related metadata.",
          "PublicDreams are sanitized public-readable documents and must not include private dream text, email, raw diary imports, private notes, or direct owner IDs.",
          "ResearchSignals contain non-identifying metadata and tags for authorized statistics. They do not contain original dream text, private titles, images, sketches, or exact owner IDs.",
        ],
      },
      terms: {
        title: "Terms of Service",
        body: [
          "By using the platform, you remain responsible for the content you submit and for avoiding private real names, complete addresses, and identifying details unless you have permission.",
          "You retain copyright in your dream text while granting the Observatory permission to store, display, and analyze records according to your selected privacy settings.",
          "The platform may remove or hide content that violates safety, privacy, or legal standards.",
        ],
      },
      guidelines: {
        title: "Community Guidelines",
        body: [
          "Record dreams honestly. Do not invent or beautify records for literary effect.",
          "Use relationship descriptions such as my parent, coworker, or friend instead of private real names.",
          "Mark adult, violent, highly sensitive, or identity-revealing dreams before sharing them publicly.",
        ],
      },
      removal: {
        title: "Content Removal Policy",
        body: [
          "Anyone may report a dream or recorder when content appears private, harmful, illegal, spammy, or misclassified.",
          "Reported content is hidden from the reporter immediately and enters moderation review.",
          "Moderators may set records to pending_review, approved, hidden, removed, adult_review, or sensitive_review.",
        ],
      },
      diagnosis: {
        title: "Not Diagnosis Disclaimer",
        body: [
          "Dream tags, charts, statistics, and reflections are for self-reflection and research coding.",
          "They are not medical, psychological, psychiatric, legal, financial, or safety diagnosis.",
          "If a dream relates to immediate danger or distress, seek qualified local help rather than relying on this platform.",
        ],
      },
      support: {
        title: "Support Contact",
        body: [
          "For reports, suggestions, access problems, or data-rights requests, contact collectivedreamdatabase@gmail.com.",
          "Include the public dream ID when reporting public content. Do not include passwords or private authentication data.",
        ],
      },
      "account-deletion": {
        title: "Account Deletion",
        body: [
          "Signed-in users can export dreams, delete individual dreams, delete all dreams, request deletion, or delete the account from the Account & Trust Center.",
          "Deleting an account attempts to remove private Records, PublicDreams mirrors, ResearchSignals, saved references, local drafts, and the Firebase Auth account.",
          "Firebase may require recent login before the authentication account can be deleted.",
        ],
      },
    },
  },
  zh: {
    title: "信任、安全與資料權利",
    subtitle: "集體夢境觀測站與研究檔案庫的簡明政策。",
    back: "回到檔案庫",
    languageLabel: "切換介面語言",
    englishLabel: "英文",
    chineseLabel: "繁體中文",
    spanishLabel: "西班牙文",
    pages: {
      privacy: {
        title: "隱私政策",
        body: [
          "私人 Records 只限擁有者讀取，可包含完整夢境文字、私人標題、匯入資訊與帳戶相關資料。",
          "PublicDreams 是經過整理的公開可讀文件，不應包含私人夢境原文、電子郵件、原始日記匯入、私人備註或直接擁有者 ID。",
          "ResearchSignals 只包含已授權統計使用的非識別中繼資料與標籤，不包含夢境原文、私人標題、圖片、草圖或精確擁有者 ID。",
        ],
      },
      terms: {
        title: "服務條款",
        body: [
          "使用平台時，你需對自己提交的內容負責，並避免公開私人真名、完整地址與可識別細節，除非你已取得同意。",
          "你保留夢境文字著作權，同時依你選擇的隱私設定授權觀測站儲存、顯示與分析紀錄。",
          "平台可移除或隱藏違反安全、隱私或法律標準的內容。",
        ],
      },
      guidelines: {
        title: "社群準則",
        body: [
          "請誠實記錄夢境，不要為了文學效果創造或美化紀錄。",
          "請用我的家人、同事、朋友等關係描述取代私人真實姓名。",
          "公開分享前，請標記成人、暴力、高敏感或可能透露身分的夢境。",
        ],
      },
      removal: {
        title: "內容移除政策",
        body: [
          "任何人都可以回報看似涉及隱私、有害、違法、垃圾內容或分類錯誤的夢境或記錄者。",
          "被回報的內容會立即從回報者視圖隱藏，並進入審核。",
          "管理者可將紀錄設為 pending_review、approved、hidden、removed、adult_review 或 sensitive_review。",
        ],
      },
      diagnosis: {
        title: "非診斷聲明",
        body: [
          "夢境標籤、圖表、統計與反思只用於自我觀察與研究編碼。",
          "它們不是醫療、心理、精神科、法律、財務或安全診斷。",
          "如果夢境涉及立即危險或嚴重困擾，請尋求合格的當地協助。",
        ],
      },
      support: {
        title: "支援聯絡",
        body: [
          "若需回報、建議、帳戶協助或資料權利請求，請聯絡 collectivedreamdatabase@gmail.com。",
          "回報公開內容時請附上公開夢境 ID。不要提供密碼或私人驗證資料。",
        ],
      },
      "account-deletion": {
        title: "帳戶刪除",
        body: [
          "登入使用者可在帳戶與信任中心匯出夢境、刪除單一夢境、刪除全部夢境、提出刪除請求或刪除帳戶。",
          "刪除帳戶會嘗試移除私人 Records、PublicDreams 鏡像、ResearchSignals、收藏參照、本機草稿與 Firebase Auth 帳戶。",
          "Firebase 可能要求近期登入後才能刪除驗證帳戶。",
        ],
      },
    },
  },
  es: {
    title: "Confianza, seguridad y derechos de datos",
    subtitle:
      "Políticas claras para el Observatorio Colectivo de Sueños y su archivo de investigación.",
    back: "Volver al archivo",
    languageLabel: "Cambiar idioma",
    englishLabel: "Inglés",
    chineseLabel: "Chino tradicional",
    spanishLabel: "Español",
    pages: {
      privacy: {
        title: "Política de privacidad",
        body: [
          "Los Records privados solo son del propietario y pueden incluir texto completo, títulos privados, metadatos de importación y datos de cuenta.",
          "PublicDreams son documentos públicos sanitizados y no deben incluir texto privado, correo, diarios sin procesar, notas privadas ni IDs directos del propietario.",
          "ResearchSignals contiene metadatos y etiquetas no identificables para estadísticas autorizadas. No contiene texto original, títulos privados, imágenes, bocetos ni IDs exactos.",
        ],
      },
      terms: {
        title: "Términos de servicio",
        body: [
          "Al usar la plataforma, eres responsable del contenido que envías y de evitar nombres reales privados, direcciones completas y detalles identificables sin permiso.",
          "Conservas el copyright de tu texto y autorizas al Observatorio a almacenar, mostrar y analizar registros según tu privacidad elegida.",
          "La plataforma puede retirar u ocultar contenido que viole normas de seguridad, privacidad o legales.",
        ],
      },
      guidelines: {
        title: "Normas de la comunidad",
        body: [
          "Registra sueños con honestidad. No inventes ni embellezcas registros por efecto literario.",
          "Usa relaciones como mi familiar, colega o amigo en vez de nombres reales privados.",
          "Marca sueños adultos, violentos, sensibles o identificables antes de compartirlos públicamente.",
        ],
      },
      removal: {
        title: "Política de retirada de contenido",
        body: [
          "Cualquier persona puede reportar sueños o registradores por privacidad, daño, ilegalidad, spam o mala clasificación.",
          "El contenido reportado se oculta inmediatamente para quien reporta y entra en revisión.",
          "Moderadores pueden marcar registros como pending_review, approved, hidden, removed, adult_review o sensitive_review.",
        ],
      },
      diagnosis: {
        title: "Descargo: no es diagnóstico",
        body: [
          "Etiquetas, gráficos, estadísticas y reflexiones son para autoobservación y codificación de investigación.",
          "No son diagnóstico médico, psicológico, psiquiátrico, legal, financiero ni de seguridad.",
          "Si un sueño se relaciona con peligro inmediato o angustia, busca ayuda local calificada.",
        ],
      },
      support: {
        title: "Contacto de soporte",
        body: [
          "Para reportes, sugerencias, problemas de acceso o derechos de datos, contacta collectivedreamdatabase@gmail.com.",
          "Incluye el ID público del sueño al reportar contenido. No envíes contraseñas ni datos privados de autenticación.",
        ],
      },
      "account-deletion": {
        title: "Eliminación de cuenta",
        body: [
          "Usuarios con sesión pueden exportar sueños, eliminar sueños individuales, eliminar todos, solicitar eliminación o borrar la cuenta desde el Centro de cuenta y confianza.",
          "Eliminar una cuenta intenta retirar Records privados, espejos PublicDreams, ResearchSignals, referencias guardadas, borradores locales y la cuenta Firebase Auth.",
          "Firebase puede requerir un inicio de sesión reciente antes de eliminar la cuenta de autenticación.",
        ],
      },
    },
  },
};

export default function LegalInfoPage({
  page = "privacy",
  language = "zh",
  setLanguage = () => {},
  onBack = () => {},
}) {
  const copy = COPY[language] || COPY.zh;
  const activePage = PAGE_ORDER.includes(page) ? page : "privacy";
  const activeContent = copy.pages[activePage] || copy.pages.privacy;

  return (
    <main className="min-h-screen bg-[#030407] px-4 py-6 text-zinc-100 selection:bg-cyan-300/30 selection:text-cyan-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onBack}
            className="self-start rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.16em] text-cyan-100 transition hover:border-cyan-300/45"
          >
            {copy.back}
          </button>
          <LanguageMenu language={language} setLanguage={setLanguage} copy={copy} />
        </header>

        <section className="rounded-3xl border border-cyan-300/15 bg-zinc-950/75 p-6 shadow-terminal backdrop-blur sm:p-8">
          <p className="cdo-kicker">{copy.title}</p>
          <h1 className="mt-4 text-3xl font-semibold text-zinc-50 sm:text-5xl">
            {activeContent.title}
          </h1>
          <p className="cdo-body-copy mt-4 max-w-3xl">{copy.subtitle}</p>

          <nav className="mt-7 flex gap-2 overflow-x-auto pb-2">
            {PAGE_ORDER.map((item) => (
              <a
                key={item}
                href={`/${item}`}
                className={[
                  "shrink-0 rounded-full border px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] transition",
                  item === activePage
                    ? "border-cyan-300/45 bg-cyan-300 text-zinc-950"
                    : "border-white/10 bg-white/[0.03] text-zinc-400 hover:border-cyan-300/35 hover:text-cyan-100",
                ].join(" ")}
              >
                {copy.pages[item].title}
              </a>
            ))}
          </nav>

          <div className="mt-8 space-y-4">
            {activeContent.body.map((paragraph) => (
              <p
                key={paragraph}
                className="rounded-2xl border border-white/10 bg-black/25 p-5 text-base leading-8 text-slate-300"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
