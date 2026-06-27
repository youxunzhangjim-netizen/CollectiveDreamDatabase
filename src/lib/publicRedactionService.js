const FAMILY_PATTERNS = [
  {
    pattern: /\b(my\s+)?(older|younger|little|big)?\s*(mother|mom|mum|father|dad|sister|brother|wife|husband|girlfriend|boyfriend|daughter|son|aunt|uncle|cousin|grandmother|grandfather|grandma|grandpa)\s+(home|house|apartment)\b/giu,
    replacement: "a family member's home",
    reason: "family_identifier",
  },
  {
    pattern: /\b(my\s+)?(older|younger|little|big)?\s*(mother|mom|mum|father|dad|sister|brother|wife|husband|girlfriend|boyfriend|daughter|son|aunt|uncle|cousin|grandmother|grandfather|grandma|grandpa)\b/giu,
    replacement: "a family member",
    reason: "family_identifier",
  },
  {
    pattern: /(我的)?(媽媽|母親|爸爸|父親|姐姐|姊姊|妹妹|哥哥|弟弟|太太|妻子|丈夫|男友|女友|兒子|女兒|阿姨|叔叔|舅舅|表哥|表姐|祖母|祖父|奶奶|爺爺)(家裡|家中|住家|公寓|宿舍|住處)/gu,
    replacement: "一位家人的住處",
    reason: "family_identifier",
  },
  {
    pattern: /(我的)?(媽媽|母親|爸爸|父親|姐姐|姊姊|妹妹|哥哥|弟弟|太太|妻子|丈夫|男友|女友|兒子|女兒|阿姨|叔叔|舅舅|表哥|表姐|祖母|祖父|奶奶|爺爺)/gu,
    replacement: "一位家人",
    reason: "family_identifier",
  },
  {
    pattern: /\b(mi\s+)?(madre|mamá|padre|papá|hermana|hermano|esposa|marido|novia|novio|hija|hijo|tía|tío|prima|primo|abuela|abuelo)\b/giu,
    replacement: "un familiar",
    reason: "family_identifier",
  },
];

const PRIVACY_PATTERNS = [
  {
    pattern: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/giu,
    replacement: "[private email]",
    reason: "email",
  },
  {
    pattern: /\b(?:\+?\d[\d\s().-]{7,}\d)\b/gu,
    replacement: "[private phone]",
    reason: "phone",
  },
  {
    pattern: /\b\d{1,6}\s+[A-Z][\p{L}\p{M}'-]+(?:\s+[A-Z][\p{L}\p{M}'-]+){0,4}\s+(Street|St\.|Road|Rd\.|Avenue|Ave\.|Lane|Ln\.|Drive|Dr\.|Boulevard|Blvd\.)\b/giu,
    replacement: "a private address",
    reason: "specific_address",
  },
  ...FAMILY_PATTERNS,
  {
    pattern: /\b[A-Z][\p{L}\p{M}'-]+\s+(home|house|apartment|school|university|college|company|office|workplace)\b/gu,
    replacement: "a private place",
    reason: "private_place",
  },
  {
    pattern: /[\p{L}\p{M}]{2,}(學校|大學|公司|辦公室|住家|家裡|公寓|宿舍)/gu,
    replacement: "一個私人地點",
    reason: "private_place",
  },
  {
    pattern: /\b[A-Z][\p{L}\p{M}'-]+\s+[A-Z][\p{L}\p{M}'-]+\b/gu,
    replacement: "a private person",
    reason: "possible_real_name_review",
  },
];

const FICTION_OR_PUBLIC_NAMES = new Set([
  "Voldemort",
  "Harry Potter",
  "Batman",
  "Superman",
  "Spider Man",
  "Spider-Man",
]);

export function buildSuggestedPublicVersion(record = {}) {
  const sourceText = getPrivateDreamText(record);
  const sourceTitle = getPrivateDreamTitle(record);
  const changes = [];
  let publicText = sourceText;
  let publicTitle = sourceTitle;

  for (const rule of PRIVACY_PATTERNS) {
    publicText = replaceWithTracking(publicText, rule, changes);
    publicTitle = replaceWithTracking(publicTitle, rule, changes);
  }

  publicText = cleanupRedactionText(publicText);
  publicTitle = cleanupRedactionText(publicTitle);

  return {
    publicTitle: publicTitle.trim(),
    publicText: publicText.trim(),
    changes: dedupeChanges(changes),
  };
}

export function getPrivateDreamText(record = {}) {
  return String(record.originalText || record.dream_text || record.dreamText || record.text || "");
}

export function getPrivateDreamTitle(record = {}) {
  return String(record.originalTitle || record.title || "");
}

function replaceWithTracking(input, rule, changes) {
  if (!input) return "";

  return input.replace(rule.pattern, (match) => {
    const trimmed = String(match || "").trim();
    if (!trimmed || FICTION_OR_PUBLIC_NAMES.has(trimmed)) return match;
    if (rule.reason === "possible_real_name_review" && !looksLikeRealName(trimmed)) {
      return match;
    }

    changes.push({
      original: trimmed,
      replacement: rule.replacement,
      reason: rule.reason,
    });

    return preserveLeadingSpace(match, rule.replacement);
  });
}

function looksLikeRealName(value) {
  if (FICTION_OR_PUBLIC_NAMES.has(value)) return false;
  if (/\b(Street|Road|Avenue|Lane|Drive|School|University|Company)\b/i.test(value)) return false;
  return value.split(/\s+/).length === 2;
}

function preserveLeadingSpace(match, replacement) {
  const leading = String(match).match(/^\s*/)?.[0] || "";
  const trailing = String(match).match(/\s*$/)?.[0] || "";
  return `${leading}${replacement}${trailing}`;
}

function cleanupRedactionText(text) {
  return String(text || "")
    .replace(/\ba family\s+a private place\b/giu, "a family member's home")
    .replace(/\ba family member\s+home\b/giu, "a family member's home")
    .replace(/\ba family member's\s+a private place\b/giu, "a family member's home")
    .replace(/一位家人(家裡|家中|住家|公寓|宿舍|住處)/gu, "一位家人的住處");
}

function dedupeChanges(changes) {
  const seen = new Set();
  return changes.filter((change) => {
    const key = `${change.original}::${change.replacement}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
