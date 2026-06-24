import { useState } from "react";

const FOOTER_COPY = {
  en: {
    license:
      "All dream records are shared under the Creative Commons Attribution-NonCommercial (CC BY-NC) License unless otherwise specified by the author.",
    terms: "Terms & Disclaimer",
    modalTitle: "Terms & Disclaimer",
    modalText:
      "Collective Dream Database stores user-generated dream records for public reading and research context. The platform is not responsible for user-generated content, private information submitted by users, or interpretations made from the records.",
    close: "Close",
  },
  zh: {
    license:
      "除非作者另有指定，所有夢境紀錄皆以 Creative Commons Attribution-NonCommercial (CC BY-NC) 授權分享。",
    terms: "條款與免責聲明",
    modalTitle: "條款與免責聲明",
    modalText:
      "集體夢境資料庫儲存使用者產生的夢境紀錄，供公開閱讀與研究脈絡使用。本平台不對使用者產生內容、使用者提交的私人資訊，或他人對紀錄做出的詮釋負責。",
    close: "關閉",
  },
  es: {
    license:
      "Todos los registros de sueños se comparten bajo la licencia Creative Commons Attribution-NonCommercial (CC BY-NC), salvo que el autor especifique lo contrario.",
    terms: "Términos y descargo",
    modalTitle: "Términos y descargo",
    modalText:
      "Collective Dream Database almacena registros de sueños generados por usuarios para lectura pública y contexto de investigación. La plataforma no se responsabiliza por contenido generado por usuarios, información privada enviada por usuarios ni interpretaciones realizadas a partir de los registros.",
    close: "Cerrar",
  },
};

export default function Footer({ language = "zh" }) {
  const [modalOpen, setModalOpen] = useState(false);
  const copy = FOOTER_COPY[language] || FOOTER_COPY.zh;

  return (
    <>
      <footer className="relative border-t border-white/10 bg-[#030407] px-4 py-5 text-zinc-500 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 text-xs leading-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-4xl">{copy.license}</p>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="self-start rounded-full border border-cyan-300/20 bg-cyan-300/5 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-100 transition hover:border-cyan-300/45 hover:bg-cyan-300/10 sm:self-auto"
          >
            {copy.terms}
          </button>
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
