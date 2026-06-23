import {
  dreamImagesBucket,
  isSupabaseConfigured,
  supabase,
} from "./supabaseClient.js";

export const MAX_DREAM_IMAGES = 4;
export const MAX_DREAM_IMAGE_BYTES = 8 * 1024 * 1024;
export const DREAM_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

const ALLOWED_DREAM_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

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

export async function uploadProfileImage(file, { ownerId }) {
  const validationCode = validateDreamImageFile(file);

  if (validationCode) {
    throwStorageError(
      `storage/${validationCode}`,
      "The selected profile picture cannot be uploaded."
    );
  }

  if (!isSupabaseConfigured || !supabase) {
    throwStorageError(
      "storage/not-configured",
      "Picture storage is not configured."
    );
  }

  const path = createProfileImagePath({ ownerId, file });
  const { error } = await supabase.storage
    .from(dreamImagesBucket)
    .upload(path, file, {
      cacheControl: "31536000",
      contentType: file.type,
      upsert: true,
    });

  if (error) {
    throwStorageError("storage/upload-failed", error.message);
  }

  const { data } = supabase.storage.from(dreamImagesBucket).getPublicUrl(path);

  return {
    path,
    url: data?.publicUrl || "",
    name: file.name || "profile-picture",
    size: file.size,
    type: file.type,
  };
}

export function normalizeDreamImages(record) {
  const images = Array.isArray(record?.images)
    ? record.images
    : Array.isArray(record?.dreamImages)
      ? record.dreamImages
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

function createDreamImagePath({ ownerId, recordId, file, index }) {
  const extension = getFileExtension(file);
  const randomId =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return [
    "dream-records",
    sanitizePathPart(ownerId || "guest"),
    sanitizePathPart(recordId || "record"),
    `${Date.now()}-${index + 1}-${randomId}.${extension}`,
  ].join("/");
}

function createProfileImagePath({ ownerId, file }) {
  const extension = getFileExtension(file);

  return [
    "profile-images",
    sanitizePathPart(ownerId || "user"),
    `avatar.${extension}`,
  ].join("/");
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
  return "jpg";
}

function sanitizePathPart(value) {
  return String(value || "unknown")
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .slice(0, 80);
}

function throwStorageError(code, message) {
  const error = new Error(message);
  error.code = code;
  throw error;
}
