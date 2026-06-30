import {
  dreamImagesBucket,
  isSupabaseConfigured,
  supabase,
} from "./supabaseClient.js";

export const MAX_DREAM_IMAGES = 4;
export const MAX_DREAM_IMAGE_BYTES = 8 * 1024 * 1024;
export const DREAM_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";
export const DREAM_SKETCH_ACCEPT = "image/png,image/webp";
export const MAX_DREAM_SKETCH_BYTES = 8 * 1024 * 1024;

const ALLOWED_DREAM_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const ALLOWED_DREAM_SKETCH_TYPES = new Set(["image/png", "image/webp"]);

export function validateDreamImageFile(file) {
  if (!file) return "missing";

  if (!ALLOWED_DREAM_IMAGE_TYPES.has(file.type)) {
    return "invalid-type";
  }

  if (file.size > MAX_DREAM_IMAGE_BYTES) {
    return "too-large";
  }

  return "";
}

export async function uploadDreamImages(files, { ownerId, recordId }) {
  const imageFiles = Array.from(files || []).filter(Boolean);

  if (imageFiles.length === 0) return [];

  if (!isSupabaseConfigured || !supabase) {
    throwStorageError(
      "storage/not-configured",
      "Picture storage is not configured."
    );
  }

  const uploadedImages = [];

  for (const [index, file] of imageFiles.entries()) {
    const validationCode = validateDreamImageFile(file);

    if (validationCode) {
      throwStorageError(
        `storage/${validationCode}`,
        "One selected picture cannot be uploaded."
      );
    }

    const path = createDreamImagePath({ ownerId, recordId, file, index });
    const { error } = await supabase.storage
      .from(dreamImagesBucket)
      .upload(path, file, {
        cacheControl: "31536000",
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      throwStorageError("storage/upload-failed", error.message);
    }

    const { data } = supabase.storage
      .from(dreamImagesBucket)
      .getPublicUrl(path);

    uploadedImages.push({
      path,
      url: data?.publicUrl || "",
      name: file.name || `dream-image-${index + 1}`,
      size: file.size,
      type: file.type,
    });
  }

  return uploadedImages;
}

export async function uploadDreamSketches(sketchDrafts, { ownerId, recordId }) {
  const drafts = Array.from(sketchDrafts || []).filter((draft) => draft?.file);

  if (drafts.length === 0) return [];

  if (!isSupabaseConfigured || !supabase) {
    throwStorageError(
      "storage/not-configured",
      "Sketch storage is not configured."
    );
  }

  const uploadedSketches = [];

  for (const [index, draft] of drafts.entries()) {
    const file = draft.file;
    const validationCode = validateDreamSketchFile(file);

    if (validationCode) {
      throwStorageError(
        `storage/${validationCode}`,
        "One dream sketch cannot be uploaded."
      );
    }

    const path = createDreamAssetPath({
      ownerId,
      recordId,
      file,
      index,
      assetFolder: "dream-records",
      subFolder: "sketches",
    });
    const imageUrl = await uploadSupabaseFile(path, file);
    let thumbnailUrl = imageUrl;
    let thumbnailPath = path;
    let layerStoragePath = "";
    let layerUploadError = null;

    if (draft.thumbnailFile) {
      const thumbnailValidationCode = validateDreamSketchFile(draft.thumbnailFile);
      if (!thumbnailValidationCode) {
        thumbnailPath = createDreamAssetPath({
          ownerId,
          recordId,
          file: draft.thumbnailFile,
          index,
          assetFolder: "dream-records",
          subFolder: "sketches/thumbnails",
        });
        thumbnailUrl = await uploadSupabaseFile(thumbnailPath, draft.thumbnailFile);
      }
    }

    if (draft.layerFile) {
      try {
        layerStoragePath = createDreamAssetPath({
          ownerId,
          recordId,
          file: draft.layerFile,
          index,
          assetFolder: "dream-records",
          subFolder: "sketches/layers",
          extensionOverride: "json",
        });
        await uploadSupabaseFile(layerStoragePath, draft.layerFile);
      } catch (error) {
        layerStoragePath = "";
        layerUploadError = {
          code: error?.code || "storage/upload-failed",
          message: error?.message || "Sketch layer data could not be uploaded.",
        };
      }
    }

    uploadedSketches.push({
      id: draft.id || createRandomId(),
      type: "dream_sketch",
      storageProvider: "supabase",
      storagePath: path,
      thumbnailStoragePath: thumbnailPath,
      layerStoragePath,
      layerMimeType: layerStoragePath ? "application/json" : "",
      layerUploadError,
      imageUrl,
      thumbnailUrl,
      width: normalizeDimension(draft.width),
      height: normalizeDimension(draft.height),
      mimeType: file.type === "image/webp" ? "image/webp" : "image/png",
      fileSizeBytes: Number.isFinite(Number(file.size)) ? Number(file.size) : null,
      createdAt: draft.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: ownerId || "",
      source: normalizeSketchSource(draft.source),
      title: normalizeNullableString(draft.title, 120),
      caption: normalizeNullableString(draft.caption, 280),
      textLabels: normalizeSketchTextLabels(draft.textLabels),
      layerData: normalizeSketchLayerData(draft.layerData),
      publicAllowed: Boolean(draft.publicAllowed),
      researchAllowed: Boolean(draft.researchAllowed),
      adultContent: Boolean(draft.adultContent),
      sensitivityLevel:
        draft.sensitivityLevel == null || draft.sensitivityLevel === ""
          ? null
          : Math.max(0, Math.min(4, Number(draft.sensitivityLevel))),
      altText: normalizeNullableString(draft.altText, 280),
    });
  }

  return uploadedSketches;
}

export function validateDreamSketchFile(file) {
  if (!file) return "missing";

  if (!ALLOWED_DREAM_SKETCH_TYPES.has(file.type)) {
    return "invalid-type";
  }

  if (file.size > MAX_DREAM_SKETCH_BYTES) {
    return "too-large";
  }

  return "";
}

export function normalizeDreamImages(record) {
  const images = Array.isArray(record?.images)
    ? record.images
    : Array.isArray(record?.dreamImages)
      ? record.dreamImages
      : Array.isArray(record?.publicImages)
        ? record.publicImages
        : [];
  const imageUrls = [
    ...(Array.isArray(record?.imageUrls) ? record.imageUrls : []),
    ...(Array.isArray(record?.pictureUrls) ? record.pictureUrls : []),
    record?.thumbnailUrl,
    record?.thumbnail_url,
    record?.generated_image_url,
  ].filter(Boolean);
  const normalizedImages = images
    .map((image, index) => normalizeDreamImage(image, index))
    .filter((image) => image.url || image.path);

  imageUrls.forEach((url, index) => {
    if (normalizedImages.some((image) => image.url === url)) return;
    normalizedImages.push({
      path: "",
      url,
      name: `dream-image-${index + 1}`,
      size: 0,
      type: "",
    });
  });

  return normalizedImages;
}

export function getPrimaryDreamImageUrl(record) {
  return normalizeDreamImages(record).find((image) => image.url)?.url || "";
}

export function normalizeDreamVisualAttachments(record) {
  const imageAttachments = normalizeDreamImages(record).map((image, index) => ({
    id: image.path || image.url || `dream-image-${index + 1}`,
    kind: "image",
    url: image.url,
    thumbnailUrl: image.url,
    alt: image.name || `Dream picture ${index + 1}`,
    source: image,
  }));
  const sketchAttachments = normalizeDreamSketches(record).map((sketch, index) => ({
    id: sketch.id || sketch.imageUrl || `dream-sketch-${index + 1}`,
    kind: "sketch",
    url: sketch.imageUrl,
    thumbnailUrl: sketch.thumbnailUrl || sketch.imageUrl,
    alt: sketch.altText || sketch.title || `Dream sketch ${index + 1}`,
    source: sketch,
  }));

  return [...imageAttachments, ...sketchAttachments]
    .filter((attachment) => attachment.thumbnailUrl || attachment.url)
    .slice(0, MAX_DREAM_IMAGES);
}

export function normalizeDreamSketches(record) {
  const sketches = Array.isArray(record?.sketches)
    ? record.sketches
    : Array.isArray(record?.publicSketches)
      ? record.publicSketches
      : [];

  return sketches
    .map((sketch, index) => normalizeDreamSketch(sketch, index))
    .filter((sketch) => sketch.imageUrl || sketch.thumbnailUrl);
}

export function getPrimaryDreamSketchUrl(record) {
  return (
    normalizeDreamSketches(record).find((sketch) => sketch.thumbnailUrl || sketch.imageUrl)
      ?.thumbnailUrl || ""
  );
}

function normalizeDreamImage(image, index) {
  if (typeof image === "string") {
    return {
      path: "",
      url: image,
      name: `dream-image-${index + 1}`,
      size: 0,
      type: "",
    };
  }

  return {
    path: image?.path || image?.storagePath || "",
    url: image?.url || image?.publicUrl || image?.src || "",
    name: image?.name || image?.fileName || `dream-image-${index + 1}`,
    size: Number(image?.size || 0),
    type: image?.type || image?.contentType || "",
  };
}

function normalizeDreamSketch(sketch, index) {
  if (typeof sketch === "string") {
    return {
      id: `dream-sketch-${index + 1}`,
      type: "dream_sketch",
      storageProvider: "other",
      storagePath: "",
      thumbnailStoragePath: "",
      layerStoragePath: "",
      layerMimeType: "",
      layerUploadError: null,
      imageUrl: sketch,
      thumbnailUrl: sketch,
      width: 0,
      height: 0,
      mimeType: "",
      fileSizeBytes: null,
      createdAt: "",
      updatedAt: "",
      createdBy: "",
      source: "edit_page",
      title: null,
      caption: null,
      textLabels: [],
      layerData: null,
      publicAllowed: false,
      researchAllowed: false,
      adultContent: false,
      sensitivityLevel: null,
      altText: null,
    };
  }

  return {
    id: sketch?.id || `dream-sketch-${index + 1}`,
    type: sketch?.type || "dream_sketch",
    storageProvider: sketch?.storageProvider || "other",
    storagePath: sketch?.storagePath || "",
    thumbnailStoragePath: sketch?.thumbnailStoragePath || "",
    layerStoragePath: sketch?.layerStoragePath || "",
    layerMimeType: sketch?.layerMimeType || "",
    layerUploadError: sketch?.layerUploadError || null,
    imageUrl: sketch?.imageUrl || sketch?.url || sketch?.publicUrl || "",
    thumbnailUrl: sketch?.thumbnailUrl || sketch?.imageUrl || sketch?.url || "",
    width: normalizeDimension(sketch?.width),
    height: normalizeDimension(sketch?.height),
    mimeType: sketch?.mimeType || sketch?.type || "",
    fileSizeBytes:
      sketch?.fileSizeBytes == null ? null : Number(sketch.fileSizeBytes),
    createdAt: sketch?.createdAt || "",
    updatedAt: sketch?.updatedAt || "",
    createdBy: sketch?.createdBy || "",
    source: normalizeSketchSource(sketch?.source),
    title: sketch?.title || null,
    caption: sketch?.caption || null,
    textLabels: normalizeSketchTextLabels(sketch?.textLabels),
    layerData: normalizeSketchLayerData(sketch?.layerData),
    publicAllowed: Boolean(sketch?.publicAllowed),
    researchAllowed: Boolean(sketch?.researchAllowed),
    adultContent: Boolean(sketch?.adultContent),
    sensitivityLevel:
      sketch?.sensitivityLevel == null || sketch?.sensitivityLevel === ""
        ? null
        : Math.max(0, Math.min(4, Number(sketch.sensitivityLevel))),
    altText: sketch?.altText || null,
  };
}

function createDreamImagePath({ ownerId, recordId, file, index }) {
  return createDreamAssetPath({
    ownerId,
    recordId,
    file,
    index,
    assetFolder: "dream-records",
  });
}

function createDreamAssetPath({
  ownerId,
  recordId,
  file,
  index,
  assetFolder,
  subFolder = "",
  extensionOverride = "",
}) {
  const extension = extensionOverride || getFileExtension(file);
  const randomId = createRandomId();

  return [
    assetFolder,
    sanitizePathPart(ownerId || "guest"),
    sanitizePathPart(recordId || "record"),
    ...String(subFolder || "")
      .split("/")
      .map((part) => sanitizePathPart(part))
      .filter(Boolean),
    `${Date.now()}-${index + 1}-${randomId}.${extension}`,
  ].join("/");
}

async function uploadSupabaseFile(path, file) {
  const { error } = await supabase.storage
    .from(dreamImagesBucket)
    .upload(path, file, {
      cacheControl: "31536000",
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throwStorageError("storage/upload-failed", error.message);
  }

  const { data } = supabase.storage
    .from(dreamImagesBucket)
    .getPublicUrl(path);

  return data?.publicUrl || "";
}

function getFileExtension(file) {
  const extensionFromName = String(file?.name || "")
    .split(".")
    .pop()
    ?.toLowerCase();

  if (extensionFromName && /^[a-z0-9]+$/.test(extensionFromName)) {
    return extensionFromName === "jpeg" ? "jpg" : extensionFromName;
  }

  if (file?.type === "image/png") return "png";
  if (file?.type === "image/webp") return "webp";
  if (file?.type === "image/gif") return "gif";
  if (file?.type === "application/json") return "json";
  return "jpg";
}

function sanitizePathPart(value) {
  return String(value || "unknown")
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .slice(0, 80);
}

function createRandomId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function normalizeSketchSource(value) {
  return ["recording_page", "edit_page", "import_review"].includes(value)
    ? value
    : "recording_page";
}

function normalizeNullableString(value, maxLength) {
  const normalized = String(value || "").trim().slice(0, maxLength);
  return normalized || null;
}

function normalizeDimension(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? Math.max(0, Math.round(number)) : 0;
}

function normalizeSketchTextLabels(labels = []) {
  if (!Array.isArray(labels)) return [];

  return labels
    .slice(0, 32)
    .map((label) => ({
      text: String(label?.text || "").trim().slice(0, 80),
      x: normalizeDimension(label?.x),
      y: normalizeDimension(label?.y),
      fontSize: Math.max(10, Math.min(80, Number(label?.fontSize || 24))),
      color: /^#[0-9a-f]{6}$/i.test(String(label?.color || ""))
        ? String(label.color)
        : "#e0faff",
    }))
    .filter((label) => label.text);
}

function normalizeSketchLayerData(layerData) {
  if (!layerData || typeof layerData !== "object" || Array.isArray(layerData)) {
    return null;
  }

  const layers = Array.isArray(layerData.layers)
    ? layerData.layers.slice(0, 240).map(normalizeSketchLayer).filter(Boolean)
    : [];

  return {
    version: "dream-sketch-2026.1",
    width: normalizeDimension(layerData.width),
    height: normalizeDimension(layerData.height),
    backgroundMode: ["dark", "white", "transparent"].includes(layerData.backgroundMode)
      ? layerData.backgroundMode
      : "dark",
    showGrid: layerData.showGrid !== false,
    layers,
  };
}

function normalizeSketchLayer(layer) {
  if (!layer || typeof layer !== "object") return null;

  if (layer.type === "text") {
    const label = normalizeSketchTextLabels([layer])[0];
    return label
      ? {
          id: String(layer.id || createRandomId()).slice(0, 120),
          type: "text",
          ...label,
        }
      : null;
  }

  if (layer.type !== "stroke") return null;

  const points = Array.isArray(layer.points)
    ? layer.points
        .slice(0, 1600)
        .map((point) => ({
          x: normalizeDimension(point?.x),
          y: normalizeDimension(point?.y),
        }))
    : [];

  if (points.length === 0) return null;

  return {
    id: String(layer.id || createRandomId()).slice(0, 120),
    type: "stroke",
    tool: layer.tool === "eraser" ? "eraser" : "brush",
    color: /^#[0-9a-f]{6}$/i.test(String(layer.color || ""))
      ? String(layer.color)
      : "#67e8f9",
    size: Math.max(1, Math.min(80, Number(layer.size || 8))),
    opacity: Math.max(0.05, Math.min(1, Number(layer.opacity || 1))),
    points,
  };
}

function throwStorageError(code, message) {
  const error = new Error(message);
  error.code = code;
  throw error;
}
