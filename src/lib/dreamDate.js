export const DREAM_DATE_STATUS = {
  KNOWN: "known",
  UNKNOWN: "unknown",
  HIDDEN: "hidden",
};

function hasOwnValue(record, key) {
  return Object.prototype.hasOwnProperty.call(record || {}, key);
}

export function normalizeDreamDateStatus(status, dreamDate = "") {
  const normalizedStatus = String(status || "").trim().toLowerCase();
  const normalizedDate = String(dreamDate || "").trim();

  if (normalizedStatus === DREAM_DATE_STATUS.HIDDEN) {
    return DREAM_DATE_STATUS.HIDDEN;
  }

  if (normalizedStatus === DREAM_DATE_STATUS.UNKNOWN) {
    return DREAM_DATE_STATUS.UNKNOWN;
  }

  return normalizedDate ? DREAM_DATE_STATUS.KNOWN : DREAM_DATE_STATUS.UNKNOWN;
}

export function getDreamDateValue(record) {
  const hasExplicitDreamDate =
    hasOwnValue(record, "dreamDate") ||
    hasOwnValue(record, "dream_date") ||
    hasOwnValue(record, "dreamDateStatus") ||
    hasOwnValue(record, "dream_date_status");

  if (hasExplicitDreamDate) {
    return String(record?.dreamDate || record?.dream_date || "").trim();
  }

  return String(record?.dreamDate || record?.dream_date || record?.date || "").trim();
}

export function getDreamDateStatus(record) {
  return normalizeDreamDateStatus(
    record?.dreamDateStatus || record?.dream_date_status,
    getDreamDateValue(record)
  );
}

export function getVisibleDreamDate(record) {
  return getDreamDateStatus(record) === DREAM_DATE_STATUS.KNOWN
    ? getDreamDateValue(record)
    : "";
}
