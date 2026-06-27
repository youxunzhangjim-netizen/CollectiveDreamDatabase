const AUTH_ERROR_MESSAGES = {
  "auth/unauthorized-domain": {
    en: "External account sign-in is not allowed from this site yet. Try email login or guest access.",
    zh: "這個網站目前尚未允許外部帳戶登入。請先使用電子郵件登入或訪客模式。",
    es: "El acceso con cuentas externas aún no está permitido desde este sitio. Usa correo o acceso invitado.",
  },
  "auth/popup-blocked": {
    en: "The sign-in window was blocked. Allow pop-ups for this site or try again.",
    zh: "登入視窗被瀏覽器阻擋。請允許此網站的彈出視窗，或再試一次。",
    es: "El navegador bloqueó la ventana de acceso. Permite ventanas emergentes o inténtalo otra vez.",
  },
  "auth/operation-not-supported-in-this-environment": {
    en: "This browser cannot open external sign-in here. Try a normal browser tab.",
    zh: "這個瀏覽環境無法開啟外部帳戶登入。請改用一般瀏覽器分頁。",
    es: "Este navegador no puede abrir el acceso externo aquí. Prueba una pestaña normal.",
  },
  "auth/account-exists-with-different-credential": {
    en: "This email already uses another sign-in method. Sign in with that method first.",
    zh: "這個電子郵件已使用另一種登入方式。請先用原本的方法登入。",
    es: "Este correo ya usa otro método de acceso. Entra primero con ese método.",
  },
  "auth/app-not-authorized": {
    en: "This sign-in method is not ready yet. Try another option.",
    zh: "這個登入方式目前尚未準備好。請先改用其他方式。",
    es: "Este método de acceso aún no está listo. Prueba otra opción.",
  },
  "auth/api-key-not-valid": {
    en: "Account access is not ready yet. Try guest access for now.",
    zh: "帳戶登入目前尚未準備好。你可以先使用訪客模式。",
    es: "El acceso de cuenta aún no está listo. Usa acceso invitado por ahora.",
  },
  "auth/invalid-api-key": {
    en: "Account access is not ready yet. Try guest access for now.",
    zh: "帳戶登入目前尚未準備好。你可以先使用訪客模式。",
    es: "El acceso de cuenta aún no está listo. Usa acceso invitado por ahora.",
  },
  "auth/configuration-not-found": {
    en: "This sign-in method is not ready yet. Try another option.",
    zh: "這個登入方式目前尚未準備好。請先改用其他方式。",
    es: "Este método de acceso aún no está listo. Prueba otra opción.",
  },
};

export function getKnownAuthErrorMessage(error, language = "zh") {
  const code = error?.code;
  if (!code) return "";

  const messages = AUTH_ERROR_MESSAGES[code];
  return messages?.[language] || messages?.en || "";
}

export function reportAuthError(scope, error) {
  if (typeof console === "undefined") return;

  console.error(`[CollectiveDreamDatabase auth] ${scope}`, {
    code: error?.code,
    message: error?.message,
  });
}
