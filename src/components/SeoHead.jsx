import { useEffect } from "react";

export const SITE_URL = "https://collectivedreamdatabase.vercel.app";

const DEFAULT_DESCRIPTION =
  "A privacy-first dream journal, public dream archive, and collective dream research platform. Record dreams privately, share anonymously, explore dreams from around the world, and contribute to anonymous collective dream statistics.";

const ROUTE_META = {
  database: {
    path: "/",
    title: "Collective Dream Observatory - Record Dreams, Explore Collective Imagination",
    description: DEFAULT_DESCRIPTION,
  },
  explore: {
    path: "/explore",
    title: "Explore Dreams - Collective Dream Observatory",
    description:
      "Read public dream records shared anonymously by dreamers around the world, with privacy-first labels, tags, and collective context.",
  },
  record: {
    path: "/record",
    title: "Record Dream - Collective Dream Observatory",
    description:
      "Quickly record a dream with text, optional images, sketches, tags, privacy settings, and anonymous research contribution choices.",
  },
  import: {
    path: "/import",
    title: "Import Dream Diary - Collective Dream Observatory",
    description:
      "Import structured dream diary files into your private dream map, then choose privacy, public sharing, and research contribution settings.",
  },
  patterns: {
    path: "/patterns",
    title: "Collective Patterns - Collective Dream Observatory",
    description:
      "Explore aggregate dream statistics, recurring symbols, emotions, languages, and privacy-safe research signals.",
  },
  dashboard: {
    path: "/dashboard",
    title: "My Dream Map - Collective Dream Observatory",
    description:
      "Open your private dream dashboard to review records, manage privacy settings, export data, and explore personal dream patterns.",
  },
  research: {
    path: "/research",
    title: "Research Archive - Collective Dream Observatory",
    description:
      "Learn how the Collective Dream Observatory separates private records, public dream documents, and anonymous research signals.",
  },
  auth: {
    path: "/account",
    title: "Account - Collective Dream Observatory",
    description:
      "Sign in, create an account, or continue as a guest to record dreams with privacy-first controls.",
  },
  dream: {
    path: "/explore",
    title: "Dream Record - Collective Dream Observatory",
    description:
      "Read a public dream record with original-language text, tags, attribution, and privacy-aware context.",
  },
};

const LEGAL_META = {
  privacy: {
    path: "/privacy",
    title: "Privacy Policy - Collective Dream Observatory",
    description:
      "How private dream records, public dream documents, and anonymous research signals are separated and protected.",
  },
  terms: {
    path: "/terms",
    title: "Terms of Service - Collective Dream Observatory",
    description:
      "Terms for using Collective Dream Observatory, including user-generated dream records, copyright, and public display consent.",
  },
  guidelines: {
    path: "/community-guidelines",
    title: "Community Guidelines - Collective Dream Observatory",
    description:
      "Guidelines for honest dream recording, privacy-aware public sharing, reporting, moderation, and sensitive content.",
  },
  removal: {
    path: "/content-removal",
    title: "Content Removal Policy - Collective Dream Observatory",
    description:
      "How users can report public dreams and request content review, privacy protection, or removal.",
  },
  diagnosis: {
    path: "/not-diagnosis",
    title: "Not Diagnosis Disclaimer - Collective Dream Observatory",
    description:
      "Dream tags, charts, and statistics are for self-reflection and research coding, not medical or psychological diagnosis.",
  },
  support: {
    path: "/support",
    title: "Support - Collective Dream Observatory",
    description:
      "Contact Collective Dream Observatory for support, reports, suggestions, access problems, and data-rights requests.",
  },
  "account-deletion": {
    path: "/account/delete",
    title: "Account Deletion - Collective Dream Observatory",
    description:
      "Learn how to export dreams, delete dream records, clear local drafts, and request account deletion.",
  },
};

export default function SeoHead({ activeView = "database", legalPage = "", language = "en" }) {
  useEffect(() => {
    const resolvedView = resolveView(activeView);
    const meta = resolvedView === "legal"
      ? LEGAL_META[legalPage] || LEGAL_META.privacy
      : ROUTE_META[resolvedView] || ROUTE_META.database;
    const url = `${SITE_URL}${meta.path}`;
    const locale = language === "zh" ? "zh-Hant" : language === "es" ? "es" : "en";

    document.title = meta.title;
    setMeta("description", meta.description);
    setMeta("robots", isPrivateAppRoute(meta.path) ? "noindex,nofollow" : "index,follow");
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", meta.title);
    setMeta("twitter:description", meta.description);
    setMeta("twitter:image", `${SITE_URL}/og-image.png`);
    setProperty("og:type", "website");
    setProperty("og:site_name", "Collective Dream Observatory");
    setProperty("og:title", meta.title);
    setProperty("og:description", meta.description);
    setProperty("og:image", `${SITE_URL}/og-image.png`);
    setProperty("og:url", url);
    setProperty("og:locale", locale);
    setLink("canonical", url);
    setAlternate("en", `${SITE_URL}${meta.path}?lang=en`);
    setAlternate("zh-Hant", `${SITE_URL}${meta.path}?lang=zh`);
    setAlternate("es", `${SITE_URL}${meta.path}?lang=es`);
    setAlternate("x-default", `${SITE_URL}${meta.path}`);
  }, [activeView, legalPage, language]);

  return null;
}

function resolveView(activeView) {
  if (typeof window === "undefined") return activeView;

  const pathname = window.location.pathname.toLowerCase();
  if (pathname.startsWith("/explore")) return "explore";
  if (pathname.startsWith("/patterns")) return "patterns";
  if (pathname.startsWith("/research")) return "research";
  return activeView;
}

function isPrivateAppRoute(path) {
  return path === "/dashboard" || path === "/account";
}

function setMeta(name, content) {
  let element = document.head.querySelector(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("name", name);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function setProperty(property, content) {
  let element = document.head.querySelector(`meta[property="${property}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("property", property);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function setLink(rel, href) {
  let element = document.head.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
}

function setAlternate(hreflang, href) {
  let element = document.head.querySelector(`link[rel="alternate"][hreflang="${hreflang}"]`);
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", "alternate");
    element.setAttribute("hreflang", hreflang);
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
}
