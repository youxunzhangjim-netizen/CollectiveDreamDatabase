export const APPEARANCE_OPTIONS = ["night", "morning"];

export function isSupportedAppearance(appearance) {
  return APPEARANCE_OPTIONS.includes(appearance);
}

export function getAppearanceFromStorage() {
  if (typeof window === "undefined") return "night";

  const storedAppearance = window.localStorage.getItem("cddb-appearance");
  return isSupportedAppearance(storedAppearance) ? storedAppearance : "night";
}

export function saveAppearanceToStorage(appearance) {
  if (typeof window === "undefined" || !isSupportedAppearance(appearance)) return;
  window.localStorage.setItem("cddb-appearance", appearance);
}
