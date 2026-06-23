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

const LANGUAGE_NAMES = {
  en: {
    en: "English",
    zh: "英文",
    es: "inglés",
  },
  zh: {
    en: "Traditional Chinese",
    zh: "繁體中文",
    es: "chino tradicional",
  },
  es: {
    en: "Spanish",
    zh: "西班牙文",
    es: "español",
  },
};

export function isSupportedLanguage(language) {
  return SUPPORTED_LANGUAGES.includes(language);
}

export function normalizeLanguage(language) {
  return isSupportedLanguage(language) ? language : "en";
}

export function getLanguageName(language, interfaceLanguage = "en") {
  const normalizedLanguage = normalizeLanguage(language);
  const normalizedInterfaceLanguage = normalizeLanguage(interfaceLanguage);

  return (
    LANGUAGE_NAMES[normalizedLanguage]?.[normalizedInterfaceLanguage] ||
    LANGUAGE_NAMES[normalizedLanguage]?.en ||
    normalizedLanguage.toUpperCase()
  );
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
