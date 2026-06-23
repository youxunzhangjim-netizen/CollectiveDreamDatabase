export const SUPPORTED_LANGUAGES = ["en", "zh", "es"];

export const LANGUAGE_OPTIONS = [
  {
    value: "en",
    label: "En",
  },
  {
    value: "zh",
    label: "中",
  },
  {
    value: "es",
    label: "Es",
  },
];

export function isSupportedLanguage(language) {
  return SUPPORTED_LANGUAGES.includes(language);
}

export function getHtmlLang(language) {
  if (language === "zh") return "zh-Hant";
  if (language === "es") return "es";
  return "en";
}

export function getLanguageFromStorage() {
  if (typeof window === "undefined") return "zh";

  const storedLanguage = window.localStorage.getItem("cddb-language");
  return isSupportedLanguage(storedLanguage) ? storedLanguage : "zh";
}

export function saveLanguageToStorage(language) {
  if (typeof window === "undefined" || !isSupportedLanguage(language)) return;
  window.localStorage.setItem("cddb-language", language);
}
