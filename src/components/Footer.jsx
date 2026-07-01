import { useState } from "react";

const FOOTER_COPY = {
  en: {
    license:
      "Collective Dream Observatory hosts the Collective Dream Database research archive. Dream records are shared under the Creative Commons Attribution-NonCommercial (CC BY-NC) License unless otherwise specified by the author.",
    terms: "Terms & Disclaimer",
    modalTitle: "Terms & Disclaimer",
    modalText:
      "Collective Dream Observatory stores user-generated dream records for private reflection, anonymous public reading, and research context. The platform is not responsible for user-generated content, private information submitted by users, or interpretations made from the records.",
    close: "Close",
    links: [
      ["Privacy", "/privacy"],
      ["Terms", "/terms"],
      ["Guidelines", "/guidelines"],
      ["Removal", "/removal"],
      ["Not diagnosis", "/diagnosis"],
      ["Support", "/support"],
      ["Delete account", "/account-deletion"],
    ],
  },
  zh: {
    license:
      "集體夢境觀測站承載「集體夢境資料庫」研究檔案模組。除非作者另有指定，所有夢境紀錄皆以 Creative Commons Attribution-NonCommercial (CC BY-NC) 授權分享。",
    terms: "條款與免責聲明",
    modalTitle: "條款與免責聲明",
    modalText:
      "集體夢境觀測站儲存使用者產生的夢境紀錄，供私人回顧、匿名公開閱讀與研究脈絡使用。本平台不對使用者產生內容、使用者提交的私人資訊，或他人對紀錄做出的詮釋負責。",
    close: "關閉",
    links: [
      ["隱私", "/privacy"],
      ["條款", "/terms"],
      ["社群準則", "/guidelines"],
      ["內容移除", "/removal"],
      ["非診斷", "/diagnosis"],
      ["支援", "/support"],
      ["刪除帳戶", "/account-deletion"],
    ],
  },
  es: {
    license:
      "El Observatorio Colectivo de Sueños aloja la Base de Datos Colectiva de Sueños como archivo de investigación. Los registros se comparten bajo la licencia Creative Commons Attribution-NonCommercial (CC BY-NC), salvo que el autor especifique lo contrario.",
    terms: "Términos y descargo",
    modalTitle: "Términos y descargo",
    modalText:
      "El Observatorio Colectivo de Sueños almacena registros generados por usuarios para reflexión privada, lectura pública anónima y contexto de investigación. La plataforma no se responsabiliza por contenido generado por usuarios, información privada enviada por usuarios ni interpretaciones realizadas a partir de los registros.",
    close: "Cerrar",
    links: [
      ["Privacidad", "/privacy"],
      ["Términos", "/terms"],
      ["Normas", "/guidelines"],
      ["Retirada", "/removal"],
      ["No diagnóstico", "/diagnosis"],
      ["Soporte", "/support"],
      ["Eliminar cuenta", "/account-deletion"],
    ],
  },
};

export default function Footer({ language = "zh" }) {
  const [modalOpen, setModalOpen] = useState(false);
  const copy = FOOTER_COPY[language] || FOOTER_COPY.zh;

  return (
    <>
      <footer className="relative border-t border-white/10 bg-[#030407] px-4 py-5 text-zinc-500 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-xs leading-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <p className="max-w-4xl">{copy.license}</p>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="self-start rounded-full border border-cyan-300/20 bg-cyan-300/5 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-100 transition hover:border-cyan-300/45 hover:bg-cyan-300/10"
            >
              {copy.terms}
            </button>
          </div>
          <nav className="flex flex-wrap gap-2" aria-label={copy.terms}>
            {copy.links.map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-400 transition hover:border-cyan-300/30 hover:text-cyan-100"
              >
                {label}
              </a>
            ))}
          </nav>
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
