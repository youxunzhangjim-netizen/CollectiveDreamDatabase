import { useState } from "react";

const FOOTER_COPY = {
  en: {
    license:
      "Dream records stay owned by their authors. Public archive records use CC BY-NC unless the author specifies otherwise.",
    terms: "Disclaimer",
    modalTitle: "Terms & Disclaimer",
    modalText:
      "Collective Dream Observatory stores user-generated dream records for private reflection, anonymous public reading, and research context. The platform is not responsible for user-generated content, private information submitted by users, or interpretations made from the records.",
    close: "Close",
    links: [
      ["Policy", "/privacy"],
      ["Safety", "/guidelines"],
      ["Support", "/support"],
    ],
  },
  zh: {
    license:
      "夢境文字歸記錄者所有。公開檔案庫預設以 CC BY-NC 分享，除非作者另有指定。",
    terms: "免責聲明",
    modalTitle: "條款與免責聲明",
    modalText:
      "集體夢境觀測站儲存使用者產生的夢境紀錄，供私人回顧、匿名公開閱讀與研究脈絡使用。本平台不對使用者產生內容、使用者提交的私人資訊，或他人對紀錄做出的詮釋負責。",
    close: "關閉",
    links: [
      ["政策", "/privacy"],
      ["安全", "/guidelines"],
      ["支援", "/support"],
    ],
  },
  es: {
    license:
      "Los textos pertenecen a sus autores. Los registros públicos usan CC BY-NC salvo que el autor indique otra cosa.",
    terms: "Descargo",
    modalTitle: "Términos y descargo",
    modalText:
      "El Observatorio Colectivo de Sueños almacena registros generados por usuarios para reflexión privada, lectura pública anónima y contexto de investigación. La plataforma no se responsabiliza por contenido generado por usuarios, información privada enviada por usuarios ni interpretaciones realizadas a partir de los registros.",
    close: "Cerrar",
    links: [
      ["Política", "/privacy"],
      ["Seguridad", "/guidelines"],
      ["Soporte", "/support"],
    ],
  },
};

export default function Footer({ language = "zh" }) {
  const [modalOpen, setModalOpen] = useState(false);
  const copy = FOOTER_COPY[language] || FOOTER_COPY.zh;

  return (
    <>
      <footer className="relative border-t border-white/10 bg-[#030407] px-4 py-4 text-zinc-500 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 pl-24 text-xs leading-5 sm:pl-28 lg:items-end lg:pl-0 lg:text-right">
          <div className="flex w-full flex-col gap-2 lg:max-w-4xl lg:flex-row lg:items-center lg:justify-end">
            <p className="text-[11px] leading-5 text-zinc-500 lg:max-w-2xl">
              {copy.license}
            </p>
            <nav
              className="flex flex-wrap items-center gap-x-3 gap-y-1 lg:justify-end"
              aria-label={copy.modalTitle}
            >
              {copy.links.map(([label, href]) => (
                <a
                  key={href}
                  href={href}
                  className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-400 underline underline-offset-4 transition hover:text-cyan-100"
                >
                  {label}
                </a>
              ))}
            </nav>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="self-start font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-100 underline underline-offset-4 transition hover:text-cyan-50 lg:self-auto"
            >
              {copy.terms}
            </button>
          </div>
        </div>
      </footer>

      {modalOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4 backdrop-blur"
          role="dialog"
          aria-modal="true"
          aria-labelledby="terms-disclaimer-title"
        >
          <section className="w-full max-w-lg rounded-3xl border border-cyan-300/20 bg-zinc-950 p-6 shadow-[0_0_60px_rgba(34,211,238,.14)]">
            <p
              id="terms-disclaimer-title"
              className="font-mono text-xs uppercase tracking-[0.26em] text-cyan-200/80"
            >
              {copy.modalTitle}
            </p>
            <p className="mt-4 text-sm leading-7 text-zinc-300">{copy.modalText}</p>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="mt-6 w-full rounded-2xl border border-cyan-300/35 bg-cyan-300 px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.2em] text-zinc-950 transition hover:bg-cyan-200"
            >
              {copy.close}
            </button>
          </section>
        </div>
      )}
    </>
  );
}
