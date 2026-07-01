import { clear, createStore, del, entries, get, set } from "idb-keyval";

export const OFFLINE_DRAFT_STATUS = {
  SAVED_LOCALLY: "saved_locally",
  WAITING_FOR_CONNECTION: "waiting_for_connection",
  READY_TO_UPLOAD: "ready_to_upload",
  UPLOADING: "uploading",
  UPLOADED: "uploaded",
  UPLOAD_FAILED: "upload_failed",
};

const draftStore = createStore("cdo-offline-dream-drafts", "drafts");

export async function saveOfflineDreamDraft(draft, options = {}) {
  const now = new Date().toISOString();
  const id = options.id || draft?.id || createDraftId();
  const existing = await get(id, draftStore);
  const entry = {
    id,
    ownerId: options.ownerId || existing?.ownerId || "",
    ownerKey: options.ownerKey || existing?.ownerKey || "device",
    interfaceLanguage:
      options.interfaceLanguage || existing?.interfaceLanguage || "zh",
    source: options.source || existing?.source || "recording_page",
    status:
      options.status ||
      existing?.status ||
      OFFLINE_DRAFT_STATUS.SAVED_LOCALLY,
    draft: {
      ...(existing?.draft || {}),
      ...(draft || {}),
    },
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    uploadedAt: options.uploadedAt || existing?.uploadedAt || "",
    lastError: options.lastError || "",
  };

  await set(id, entry, draftStore);
  return entry;
}

export async function listOfflineDreamDrafts(options = {}) {
  const allEntries = await entries(draftStore);
  const ownerId = options.ownerId || "";
  const drafts = allEntries
    .map(([, value]) => value)
    .filter((draft) => draft?.id)
    .filter((draft) => !ownerId || !draft.ownerId || draft.ownerId === ownerId)
    .sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")));

  return drafts;
}

export async function getOfflineDreamDraft(id) {
  if (!id) return null;
  return get(id, draftStore);
}

export async function updateOfflineDreamDraftStatus(id, status, patch = {}) {
  if (!id) return null;

  const existing = await get(id, draftStore);
  if (!existing) return null;

  const next = {
    ...existing,
    ...patch,
    status,
    updatedAt: new Date().toISOString(),
  };

  await set(id, next, draftStore);
  return next;
}

export async function deleteOfflineDreamDraft(id) {
  if (!id) return;
  await del(id, draftStore);
}

export async function clearOfflineDreamDrafts(options = {}) {
  const ownerId = options.ownerId || "";

  if (!ownerId) {
    await clear(draftStore);
    return;
  }

  const drafts = await listOfflineDreamDrafts({ ownerId });
  await Promise.all(drafts.map((draft) => del(draft.id, draftStore)));
}

export function hasOfflineDraftContent(draft = {}) {
  return Boolean(
    String(draft.dreamText || "").trim() ||
      String(draft.title || "").trim() ||
      Array.isArray(draft.selectedTagSlugs) && draft.selectedTagSlugs.length > 0 ||
      Array.isArray(draft.imageFiles) && draft.imageFiles.length > 0 ||
      Array.isArray(draft.sketchFiles) && draft.sketchFiles.length > 0
  );
}

function createDraftId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `offline-draft-${crypto.randomUUID()}`;
  }

  return `offline-draft-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
