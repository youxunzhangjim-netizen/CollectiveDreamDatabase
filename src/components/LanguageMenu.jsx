import { useEffect, useRef, useState } from "react";
import { getLanguageName, LANGUAGE_OPTIONS } from "../lib/language.js";

export default function LanguageMenu({ language, setLanguage, copy }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const activeLanguage = LANGUAGE_OPTIONS.find((option) => option.value === language);

  useEffect(() => {
    function handlePointerDown(event) {
      if (!menuRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  return (
    <div ref={menuRef} className="relative min-w-0 shrink-0">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={copy.languageLabel}
        onClick={() => setOpen((current) => !current)}
        className="relative flex h-9 w-full min-w-16 items-center justify-center gap-2 overflow-hidden rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-2.5 font-mono text-[10px] font-bold text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,.16)] transition hover:border-cyan-300/50 hover:bg-cyan-300/15 sm:h-11 sm:w-auto sm:min-w-20 sm:px-3 sm:text-xs"
      >
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,.35),transparent_55%)]" />
        <GlobeGridIcon className="relative h-4 w-4" />
        <span className="relative">{activeLanguage?.label || language.toUpperCase()}</span>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={copy.languageLabel}
          className="absolute right-0 z-50 mt-2 max-h-72 w-48 overflow-y-auto rounded-2xl border border-cyan-300/25 bg-zinc-950/95 p-2 shadow-[0_18px_60px_rgba(0,0,0,.45),0_0_28px_rgba(34,211,238,.12)] backdrop-blur"
        >
          {LANGUAGE_OPTIONS.map((option) => {
            const active = language === option.value;
            const title = getLanguageTitle(option.value, language, copy);

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={active}
                title={title}
                onClick={() => {
                  setLanguage(option.value);
                  setOpen(false);
                }}
                className={[
                  "mb-1 flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left font-mono text-xs font-bold uppercase tracking-[0.14em] transition last:mb-0",
                  active
                    ? "border-cyan-300/45 bg-cyan-200 text-zinc-950 shadow-[0_0_18px_rgba(34,211,238,.20)]"
                    : "border-white/10 bg-white/[0.03] text-cyan-100/80 hover:border-cyan-300/35 hover:bg-cyan-300/10 hover:text-cyan-50",
                ].join(" ")}
              >
                <span>{option.label}</span>
                <span className="truncate pl-3 text-[10px] normal-case tracking-normal opacity-75">
                  {title}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function getLanguageTitle(language, interfaceLanguage, copy) {
  if (language === "zh") return copy.chineseLabel;
  if (language === "es") return copy.spanishLabel;
  if (language === "en") return copy.englishLabel;

  return getLanguageName(language, interfaceLanguage);
}

function GlobeGridIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M3.8 12h16.4M12 3.5c2.1 2.25 3.2 5.08 3.2 8.5S14.1 18.25 12 20.5M12 3.5C9.9 5.75 8.8 8.58 8.8 12s1.1 6.25 3.2 8.5M5.7 6.6c1.58.9 3.68 1.4 6.3 1.4s4.72-.5 6.3-1.4M5.7 17.4c1.58-.9 3.68-1.4 6.3-1.4s4.72.5 6.3 1.4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.35"
      />
    </svg>
  );
}
