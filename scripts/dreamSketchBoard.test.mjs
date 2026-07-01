import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  buildPublicDreamDocument,
  buildResearchSignalDocument,
  DREAM_SHARING_MODES,
} from "../src/lib/recordsService.js";
import {
  normalizeDreamSketches,
  normalizePublicDreamSketches,
  normalizePublicDreamVisualAttachments,
} from "../src/lib/dreamImageService.js";

const sketchSource = readFileSync("src/components/DreamSketchBoard.jsx", "utf8");
const recordPageSource = readFileSync("src/components/RecordDreamPage.jsx", "utf8");
const detailPageSource = readFileSync("src/components/DreamRecordPage.jsx", "utf8");
const exportSource = readFileSync("src/lib/researchExportService.js", "utf8");

const baseRecord = {
  id: "dream-sketch-test",
  dream_id: "dream-sketch-test",
  ownerId: "owner-1",
  originalLanguage: "en",
  publicLanguage: "en",
  title: "Dream with sketch",
  originalTitle: "Dream with sketch",
  publicTitle: "Dream with sketch",
  dream_text: "I saw a blue hallway and drew the map later.",
  originalText: "I saw a blue hallway and drew the map later.",
  publicText: "I saw a blue hallway and drew the map later.",
  tags: [{ slug: "hallway", category: "Environment" }],
  adultContent: false,
  publicConsent: true,
  researchConsent: true,
  includedInResearchStats: true,
  isPublic: true,
  visibility: "public",
  sharingMode: DREAM_SHARING_MODES.ANONYMOUS_PUBLIC,
};

const privateSketch = {
  id: "sketch-1",
  type: "dream_sketch",
  storageProvider: "supabase",
  storagePath: "users/owner-1/dream-sketches/dream-sketch-test/sketch-1.webp",
  thumbnailStoragePath:
    "users/owner-1/dream-sketches/dream-sketch-test/sketch-1-thumb.webp",
  layerStoragePath:
    "users/owner-1/dream-sketches/dream-sketch-test/sketch-1-layers.json",
  imageUrl: "https://cdn.example.com/public/sketch-1.webp",
  thumbnailUrl: "https://cdn.example.com/public/sketch-1-thumb.webp",
  width: 900,
  height: 900,
  mimeType: "image/webp",
  publicAllowed: true,
  researchAllowed: true,
  adultContent: false,
  sensitivityLevel: 1,
  altText: "A rough blue hallway map.",
  textLabels: [
    {
      text: "door",
      x: 120,
      y: 200,
      fontSize: 24,
      color: "#e0faff",
    },
  ],
};

{
  assert.match(sketchSource, /onPointerDown=\{beginPointer\}/);
  assert.match(sketchSource, /onPointerMove=\{movePointer\}/);
  assert.match(sketchSource, /window\.devicePixelRatio/);
  assert.match(sketchSource, /touch-none/);
  assert.match(sketchSource, /document\.body\.style\.overflow = "hidden"/);
  assert.match(sketchSource, /setRedoStack/);
  assert.match(sketchSource, /setUndoStack/);
  assert.match(sketchSource, /window\.confirm\(copy\.clearConfirm\)/);
  assert.match(sketchSource, /drawTextLayer/);
  assert.match(sketchSource, /createFillLayer/);
  assert.match(sketchSource, /drawFillLayer/);
  assert.match(sketchSource, /applyFloodFill/);
  assert.match(sketchSource, /createShapeLayer/);
  assert.match(sketchSource, /drawShapeLayer/);
  assert.match(sketchSource, /SHAPE_TOOLS/);
  assert.match(sketchSource, /shapeFillEnabled/);
  assert.match(sketchSource, /activeShapeRef/);
  assert.match(sketchSource, /lg:flex lg:flex-wrap/);
  assert.match(sketchSource, /lg:h-\[calc\(100dvh-1\.5rem\)\]/);
  assert.match(sketchSource, /max-w-\[118rem\]/);
  assert.match(sketchSource, /lg:grid-cols-\[minmax\(24rem,30rem\)_minmax\(0,1fr\)\]/);
  assert.match(sketchSource, /lg:h-full lg:max-h-none/);
  assert.match(sketchSource, /lg:overflow-visible/);
  assert.match(sketchSource, /min-w-\[16rem\]/);
  assert.match(sketchSource, /max-w-\[72rem\]/);
  assert.match(sketchSource, /lg:max-h-\[calc\(100dvh-10\.5rem\)\]/);
  assert.match(sketchSource, /lg:hidden/);
  assert.match(sketchSource, /tool === "fill"/);
  assert.match(sketchSource, /copy\.geometric/);
  assert.match(sketchSource, /value="rectangle"/);
  assert.match(sketchSource, /value="triangle"/);
  assert.match(sketchSource, /value="ellipse"/);
  assert.match(sketchSource, /value="line"/);
  assert.match(sketchSource, /textLabels/);
  assert.match(sketchSource, /aria-label/);
  assert.match(sketchSource, /Sketches are private by default\./);
  assert.match(sketchSource, /草圖預設為私人。/);
  assert.match(sketchSource, /Los bocetos son privados por defecto\./);
  assert.match(sketchSource, /altTextPlaceholder/);
  assert.match(sketchSource, /aiAnalysisAllowed/);
  assert.match(sketchSource, /memoryOnly/);
}

{
  assert.match(recordPageSource, /const \[sketchDrafts, setSketchDrafts\] = useState\(\[\]\)/);
  assert.match(recordPageSource, /sketchFiles: sketchDrafts/);
  assert.match(recordPageSource, /sketchUploadError/);
  assert.match(recordPageSource, /pendingSketchRecord/);
}

{
  const normalized = normalizeDreamSketches({ sketches: [privateSketch] });
  assert.equal(normalized.length, 1);
  assert.equal(normalized[0].publicAllowed, true);
  assert.equal(normalized[0].researchAllowed, true);
  assert.equal(normalized[0].memoryOnly, false);
  assert.equal(normalized[0].aiAnalysisAllowed, false);
  assert.equal(normalized[0].textLabels[0].text, "door");
}

{
  const defaultPrivate = normalizeDreamSketches({
    sketches: ["https://cdn.example.com/public/legacy-sketch.webp"],
  })[0];

  assert.equal(defaultPrivate.publicAllowed, false);
  assert.equal(defaultPrivate.researchAllowed, false);
  assert.equal(defaultPrivate.memoryOnly, false);
  assert.equal(defaultPrivate.aiAnalysisAllowed, false);
}

{
  const noSketchMirror = buildPublicDreamDocument(
    {
      ...baseRecord,
      includeSketchesWhenPublic: false,
      sketchConsent: {
        allowPrivateStorage: true,
        allowPublicDisplay: false,
        allowResearchUse: false,
        allowAiAnalysis: false,
      },
      sketches: [privateSketch],
    },
    {},
    DREAM_SHARING_MODES.ANONYMOUS_PUBLIC
  );

  assert.equal(noSketchMirror.publicSketches, undefined);
  assert.equal(normalizePublicDreamSketches(noSketchMirror).length, 0);
}

{
  const publicMirror = buildPublicDreamDocument(
    {
      ...baseRecord,
      includeSketchesWhenPublic: true,
      sketchConsent: {
        allowPrivateStorage: true,
        allowPublicDisplay: true,
        allowResearchUse: true,
        allowAiAnalysis: false,
      },
      sketches: [privateSketch],
    },
    {},
    DREAM_SHARING_MODES.ANONYMOUS_PUBLIC
  );

  assert.equal(publicMirror.publicSketches.length, 1);
  assert.equal(publicMirror.publicSketches[0].imageUrl, privateSketch.imageUrl);
  assert.equal(publicMirror.publicSketches[0].storagePath, undefined);
  assert.equal(publicMirror.publicSketches[0].thumbnailStoragePath, undefined);
  assert.equal(publicMirror.publicSketches[0].layerStoragePath, undefined);
  assert.equal(publicMirror.publicSketches[0].layerData, undefined);
  assert.equal(normalizePublicDreamSketches(publicMirror).length, 1);
  assert.equal(
    normalizePublicDreamVisualAttachments(publicMirror, { includeImages: false })[0]
      .kind,
    "sketch"
  );
}

{
  const memoryOnlyMirror = buildPublicDreamDocument(
    {
      ...baseRecord,
      includeSketchesWhenPublic: true,
      sketchConsent: {
        allowPrivateStorage: true,
        allowPublicDisplay: true,
        allowResearchUse: true,
        allowAiAnalysis: true,
      },
      sketches: [{ ...privateSketch, memoryOnly: true }],
    },
    {},
    DREAM_SHARING_MODES.ANONYMOUS_PUBLIC
  );

  assert.equal(memoryOnlyMirror.publicSketches, undefined);
}

{
  const statsOnlyMirror = buildPublicDreamDocument(
    {
      ...baseRecord,
      isPublic: false,
      visibility: "private",
      publicConsent: false,
      sharingMode: DREAM_SHARING_MODES.STATS_ONLY,
      includeSketchesWhenPublic: true,
      sketchConsent: {
        allowPrivateStorage: true,
        allowPublicDisplay: true,
        allowResearchUse: true,
        allowAiAnalysis: true,
      },
      sketches: [privateSketch],
    },
    {},
    DREAM_SHARING_MODES.STATS_ONLY
  );

  assert.equal(statsOnlyMirror, null);
}

{
  const signal = buildResearchSignalDocument(
    {
      ...baseRecord,
      isPublic: false,
      visibility: "private",
      sharingMode: DREAM_SHARING_MODES.STATS_ONLY,
      publicConsent: false,
      researchConsent: true,
      includedInResearchStats: true,
      sketchConsent: {
        allowPrivateStorage: true,
        allowPublicDisplay: false,
        allowResearchUse: true,
        allowAiAnalysis: true,
      },
      sketches: [privateSketch],
    },
    DREAM_SHARING_MODES.STATS_ONLY,
    "owner-1"
  );

  assert.equal(signal.sketchMetadataAllowed, true);
  assert.equal(signal.sketchCountBucket, "one");
  assert.equal(signal.sketchHasTextLabels, true);
  assert.equal(signal.sketchTextLabelCountBucket, "one");
  assert.equal(signal.sketchAiAnalysisAllowed, true);
  assert.equal(JSON.stringify(signal).includes(privateSketch.imageUrl), false);
  assert.equal(JSON.stringify(signal).includes(privateSketch.storagePath), false);
  assert.equal(JSON.stringify(signal).includes("door"), false);
}

{
  assert.match(detailPageSource, /function handleRemoveSketch/);
  assert.match(detailPageSource, /sketches = normalizeDreamSketches\(normalizedRecord\)\.filter/);
  assert.match(detailPageSource, /copy\.sketchTextReviewReminder/);
  assert.match(detailPageSource, /copy\.sketchMemoryToggle/);
  assert.match(detailPageSource, /copy\.sketchAiToggle/);
}

{
  assert.match(exportSource, /normalizePublicDreamSketches\(record\)/);
  assert.doesNotMatch(exportSource, /storagePath.*public_sketch_urls/s);
}

console.log("dream sketch board tests passed");
