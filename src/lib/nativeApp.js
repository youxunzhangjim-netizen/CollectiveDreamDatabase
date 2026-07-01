export function getNativePlatform() {
  if (typeof window === "undefined") return "web";

  const capacitor = window.Capacitor;
  if (capacitor?.getPlatform) {
    return capacitor.getPlatform();
  }

  if (capacitor?.isNativePlatform?.()) {
    return "native";
  }

  return "web";
}

export function isNativeAppShell() {
  const platform = getNativePlatform();
  return platform === "android" || platform === "ios" || platform === "native";
}
