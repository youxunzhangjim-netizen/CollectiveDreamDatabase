const AUTH_ERROR_MESSAGES = {
  "auth/unauthorized-domain": {
    en: "This website domain is not allowed for Google sign-in. Add the current Vercel domain to the allowed authentication domains, then try again.",
    zh: "目前的網站網域尚未允許使用 Google 登入。請把這個 Vercel 網域加入驗證允許網域後再試一次。",
    es: "Este dominio del sitio no permite iniciar sesión con Google. Añade el dominio actual de Vercel a los dominios de autenticación permitidos e inténtalo otra vez.",
  },
  "auth/popup-blocked": {
    en: "The Google sign-in window was blocked. Allow pop-ups for this site, or try again so the app can use redirect sign-in.",
    zh: "Google 登入視窗被瀏覽器阻擋。請允許此網站的彈出視窗，或再試一次讓系統改用重新導向登入。",
    es: "El navegador bloqueó la ventana de Google. Permite ventanas emergentes para este sitio o inténtalo de nuevo para usar redirección.",
  },
  "auth/operation-not-supported-in-this-environment": {
    en: "This browser cannot open the Google sign-in window here. Try again, or open the site in a normal browser tab.",
    zh: "這個瀏覽環境無法開啟 Google 登入視窗。請再試一次，或用一般瀏覽器分頁開啟網站。",
    es: "Este navegador no puede abrir la ventana de Google aquí. Inténtalo otra vez o abre el sitio en una pestaña normal.",
  },
  "auth/account-exists-with-different-credential": {
    en: "This email already uses another sign-in method. Sign in with the original method first, then connect Google later.",
    zh: "這個電子郵件已經使用另一種登入方式。請先用原本的方法登入，之後再連接 Google。",
    es: "Este correo ya usa otro método de acceso. Entra primero con el método original y conecta Google después.",
  },
  "auth/app-not-authorized": {
    en: "This app is not authorized for the current authentication setup. Check the site domain and project configuration.",
    zh: "目前的網站尚未通過驗證設定授權。請檢查網站網域與專案設定。",
    es: "Esta app no está autorizada con la configuración actual. Revisa el dominio del sitio y la configuración del proyecto.",
  },
  "auth/api-key-not-valid": {
    en: "The deployed site is using an invalid access key. Check the Vercel environment variables and redeploy.",
    zh: "目前部署的網站使用了無效的存取金鑰。請檢查 Vercel 環境變數並重新部署。",
    es: "El sitio desplegado usa una clave de acceso inválida. Revisa las variables de entorno de Vercel y vuelve a desplegar.",
  },
  "auth/invalid-api-key": {
    en: "The deployed site is using an invalid access key. Check the Vercel environment variables and redeploy.",
    zh: "目前部署的網站使用了無效的存取金鑰。請檢查 Vercel 環境變數並重新部署。",
    es: "El sitio desplegado usa una clave de acceso inválida. Revisa las variables de entorno de Vercel y vuelve a desplegar.",
  },
  "auth/configuration-not-found": {
    en: "Authentication is not fully configured for this project. Enable the Google provider and check the project settings.",
    zh: "此專案的登入設定尚未完成。請啟用 Google 登入方式並檢查專案設定。",
    es: "La autenticación no está completa para este proyecto. Activa el proveedor de Google y revisa la configuración.",
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
