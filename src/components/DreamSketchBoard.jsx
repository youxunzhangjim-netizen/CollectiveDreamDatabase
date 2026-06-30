import { useEffect, useMemo, useRef, useState } from "react";

const CANVAS_SIZES = {
  phone: { width: 720, height: 1080 },
  square: { width: 900, height: 900 },
  vertical: { width: 760, height: 1040 },
  horizontal: { width: 1120, height: 720 },
};

const PALETTE = [
  "#e0faff",
  "#67e8f9",
  "#f0abfc",
  "#fde68a",
  "#86efac",
  "#fb7185",
  "#111827",
];

const BACKGROUND_COLOR = "#05070a";
const MAX_HISTORY = 24;

const SKETCH_COPY = {
  en: {
    title: "Sketch the dream",
    subtitle:
      "Draw a rough image, map, symbol, creature, place, or scene from the dream. It does not need to look good.",
    privacy:
      "Sketches are private by default. You can decide later whether this image is shown if the dream becomes public.",
    includePublic: "Include this sketch if I publish this dream",
    allowResearch: "Allow this sketch to contribute to research metadata",
    collapsedHint: "Optional drawing tool",
    open: "Open sketch board",
    close: "Close",
    addText: "Add text label",
    labelText: "Label text",
    placeText: "Tap the sketch to place this label.",
    deleteText: "Delete selected text",
    undo: "Undo",
    redo: "Redo",
    draw: "Draw",
    eraser: "Eraser",
    clear: "Clear",
    save: "Save sketch",
    remove: "Remove sketch",
    preview: "Preview sketch",
    brushSize: "Brush",
    opacity: "Opacity",
    format: "Format",
    png: "PNG",
    webp: "WebP",
    color: "Color",
    canvasSize: "Canvas size",
    phone: "Phone",
    square: "Square",
    vertical: "Vertical",
    horizontal: "Horizontal",
    saved: "Sketch saved for this dream.",
    noSketch: "No sketch saved.",
    previewTitle: "Sketch preview",
    clearConfirm: "Clear the sketch board?",
    removeConfirm: "Remove this sketch from the dream?",
    closeConfirm: "Close without saving the latest sketch changes?",
    saveFailed: "The sketch could not be prepared. Try again.",
  },
  zh: {
    title: "畫下夢境",
    subtitle:
      "可以畫夢中的粗略影像、地圖、符號、生物、場所或場景。不需要畫得好看。",
    privacy:
      "草圖預設為私人。之後若夢境公開，你仍可決定是否一起顯示這張圖。",
    includePublic: "若我公開這個夢，也包含這張草圖",
    allowResearch: "允許這張草圖貢獻研究中繼資料",
    collapsedHint: "選用繪圖工具",
    open: "開啟畫板",
    close: "關閉",
    addText: "加入文字標籤",
    labelText: "標籤文字",
    placeText: "點一下草圖即可放置標籤。",
    deleteText: "刪除選取標籤",
    undo: "復原",
    redo: "重做",
    draw: "畫筆",
    eraser: "橡皮擦",
    clear: "清除",
    save: "儲存草圖",
    remove: "移除草圖",
    preview: "預覽草圖",
    brushSize: "筆刷",
    opacity: "透明度",
    format: "格式",
    png: "PNG",
    webp: "WebP",
    color: "顏色",
    canvasSize: "畫布尺寸",
    phone: "手機",
    square: "方形",
    vertical: "直式",
    horizontal: "橫式",
    saved: "草圖已暫存到這則夢境。",
    noSketch: "尚未儲存草圖。",
    previewTitle: "草圖預覽",
    clearConfirm: "要清空畫板嗎？",
    removeConfirm: "要從這則夢境移除草圖嗎？",
    closeConfirm: "尚未儲存最新草圖變更，仍要關閉嗎？",
    saveFailed: "草圖無法準備完成，請再試一次。",
  },
  es: {
    title: "Dibuja el sueño",
    subtitle:
      "Dibuja una imagen, mapa, símbolo, criatura, lugar o escena del sueño. No necesita verse bien.",
    privacy:
      "Los bocetos son privados por defecto. Puedes decidir después si esta imagen se muestra cuando el sueño sea público.",
    includePublic: "Incluir este boceto si publico este sueño",
    allowResearch: "Permitir que este boceto aporte metadatos de investigación",
    collapsedHint: "Herramienta opcional de dibujo",
    open: "Abrir tablero",
    close: "Cerrar",
    addText: "Añadir etiqueta",
    labelText: "Texto de etiqueta",
    placeText: "Toca el boceto para colocar esta etiqueta.",
    deleteText: "Borrar etiqueta",
    undo: "Deshacer",
    redo: "Rehacer",
    draw: "Dibujar",
    eraser: "Borrador",
    clear: "Limpiar",
    save: "Guardar boceto",
    remove: "Quitar boceto",
    preview: "Vista previa",
    brushSize: "Pincel",
    opacity: "Opacidad",
    format: "Formato",
    png: "PNG",
    webp: "WebP",
    color: "Color",
    canvasSize: "Tamaño",
    phone: "Teléfono",
    square: "Cuadrado",
    vertical: "Vertical",
    horizontal: "Horizontal",
    saved: "Boceto guardado para este sueño.",
    noSketch: "No hay boceto guardado.",
    previewTitle: "Vista previa del boceto",
    clearConfirm: "¿Limpiar el tablero?",
    removeConfirm: "¿Quitar este boceto del sueño?",
    closeConfirm: "¿Cerrar sin guardar los últimos cambios del boceto?",
    saveFailed: "No se pudo preparar el boceto. Inténtalo otra vez.",
  },
};

export default function DreamSketchBoard({
  language = "zh",
  initialSketches = [],
  source = "recording_page",
  defaultExpanded,
  onSaveSketch = () => {},
  onSketchChange = () => {},
  onRemoveSketch = () => {},
  disabled = false,
}) {
  const copy = SKETCH_COPY[language] || SKETCH_COPY.zh;
  const initialExpanded = useMemo(() => {
    if (typeof defaultExpanded === "boolean") return defaultExpanded;
    if (typeof window === "undefined") return false;
    return window.matchMedia("(min-width: 1024px)").matches;
  }, [defaultExpanded]);
  const [expanded, setExpanded] = useState(initialExpanded);
  const [modalOpen, setModalOpen] = useState(false);
  const [sketch, setSketch] = useState(() => normalizeInitialSketch(initialSketches));
  const [publicAllowed, setPublicAllowed] = useState(Boolean(sketch?.publicAllowed));
  const [researchAllowed, setResearchAllowed] = useState(Boolean(sketch?.researchAllowed));
  const [tool, setTool] = useState("draw");
  const [brushSize, setBrushSize] = useState(8);
  const [opacity, setOpacity] = useState(1);
  const [exportMimeType, setExportMimeType] = useState("image/png");
  const [color, setColor] = useState(PALETTE[1]);
  const [canvasMode, setCanvasMode] = useState("phone");
  const [labelDraft, setLabelDraft] = useState("");
  const [textLabels, setTextLabels] = useState([]);
  const [selectedTextId, setSelectedTextId] = useState("");
  const [drawing, setDrawing] = useState(false);
  const [dragLabel, setDragLabel] = useState(null);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [dirty, setDirty] = useState(false);
  const [notice, setNotice] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const canvasRef = useRef(null);
  const lastPointRef = useRef(null);

  const canvasSize = CANVAS_SIZES[canvasMode] || CANVAS_SIZES.phone;
  const hasSketch = Boolean(sketch?.previewUrl || sketch?.imageUrl || sketch?.thumbnailUrl);

  useEffect(() => {
    const nextSketch = normalizeInitialSketch(initialSketches);
    setSketch(nextSketch);
    setPublicAllowed(Boolean(nextSketch?.publicAllowed));
    setResearchAllowed(Boolean(nextSketch?.researchAllowed));
  }, [initialSketches]);

  useEffect(() => {
    if (!modalOpen) return undefined;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [modalOpen]);

  useEffect(() => {
    if (!modalOpen) return;
    resetCanvas();
  }, [modalOpen, canvasMode]);

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (sketch?.previewUrl?.startsWith("blob:")) URL.revokeObjectURL(sketch.previewUrl);
    },
    [previewUrl, sketch]
  );

  function openBoard() {
    if (disabled) return;
    setNotice("");
    setModalOpen(true);
  }

  function closeBoard() {
    if (dirty && typeof window !== "undefined" && !window.confirm(copy.closeConfirm)) {
      return;
    }

    setModalOpen(false);
    setDirty(false);
  }

  function resetCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    const context = canvas.getContext("2d");
    context.fillStyle = BACKGROUND_COLOR;
    context.fillRect(0, 0, canvas.width, canvas.height);

    setTextLabels(sketch?.textLabels || []);
    setSelectedTextId("");
    setUndoStack([]);
    setRedoStack([]);
    setPreviewUrl("");

    const imageUrl = sketch?.imageUrl || sketch?.previewUrl || "";
    if (!imageUrl) return;

    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      const fit = getContainedRect(image.width, image.height, canvas.width, canvas.height);
      context.drawImage(image, fit.x, fit.y, fit.width, fit.height);
    };
    image.src = imageUrl;
  }

  function pushUndoSnapshot() {
    const snapshot = canvasRef.current?.toDataURL("image/png");
    if (!snapshot) return;
    setUndoStack((current) => [...current.slice(-(MAX_HISTORY - 1)), snapshot]);
    setRedoStack([]);
  }

  function restoreSnapshot(snapshot) {
    const canvas = canvasRef.current;
    if (!canvas || !snapshot) return;
    const context = canvas.getContext("2d");
    const image = new Image();
    image.onload = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
    };
    image.src = snapshot;
  }

  function handleUndo() {
    if (undoStack.length === 0) return;
    const current = canvasRef.current?.toDataURL("image/png");
    const previous = undoStack[undoStack.length - 1];
    setUndoStack((stack) => stack.slice(0, -1));
    if (current) setRedoStack((stack) => [...stack.slice(-(MAX_HISTORY - 1)), current]);
    restoreSnapshot(previous);
    setDirty(true);
  }

  function handleRedo() {
    if (redoStack.length === 0) return;
    const current = canvasRef.current?.toDataURL("image/png");
    const next = redoStack[redoStack.length - 1];
    setRedoStack((stack) => stack.slice(0, -1));
    if (current) setUndoStack((stack) => [...stack.slice(-(MAX_HISTORY - 1)), current]);
    restoreSnapshot(next);
    setDirty(true);
  }

  function handleClear() {
    if (typeof window !== "undefined" && !window.confirm(copy.clearConfirm)) return;
    pushUndoSnapshot();
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    context.fillStyle = BACKGROUND_COLOR;
    context.fillRect(0, 0, canvas.width, canvas.height);
    setTextLabels([]);
    setSelectedTextId("");
    setDirty(true);
  }

  function getCanvasPoint(event) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  function beginDraw(event) {
    if (disabled) return;
    event.preventDefault();

    if (tool === "text") {
      const trimmedLabel = labelDraft.trim();
      if (!trimmedLabel) return;
      const point = getCanvasPoint(event);
      const label = {
        id: createClientId(),
        text: trimmedLabel.slice(0, 80),
        x: point.x,
        y: point.y,
        fontSize: Math.max(14, Math.min(42, brushSize * 3)),
        color,
      };
      setTextLabels((labels) => [...labels, label]);
      setSelectedTextId(label.id);
      setLabelDraft("");
      setDirty(true);
      return;
    }

    pushUndoSnapshot();
    const point = getCanvasPoint(event);
    lastPointRef.current = point;
    setDrawing(true);
    drawLine(point, point);
  }

  function movePointer(event) {
    if (dragLabel) {
      event.preventDefault();
      const point = getCanvasPoint(event);
      setTextLabels((labels) =>
        labels.map((label) =>
          label.id === dragLabel.id
            ? {
                ...label,
                x: point.x - dragLabel.offsetX,
                y: point.y - dragLabel.offsetY,
              }
            : label
        )
      );
      setDirty(true);
      return;
    }

    if (!drawing || !lastPointRef.current) return;
    event.preventDefault();
    const point = getCanvasPoint(event);
    drawLine(lastPointRef.current, point);
    lastPointRef.current = point;
  }

  function endPointer() {
    setDrawing(false);
    setDragLabel(null);
    lastPointRef.current = null;
  }

  function drawLine(from, to) {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    context.save();
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = brushSize;
    context.globalAlpha = opacity;
    context.strokeStyle = tool === "eraser" ? BACKGROUND_COLOR : color;
    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(to.x, to.y);
    context.stroke();
    context.restore();
    setDirty(true);
  }

  function beginLabelDrag(event, label) {
    event.preventDefault();
    event.stopPropagation();
    const point = getCanvasPoint(event);
    setSelectedTextId(label.id);
    setDragLabel({
      id: label.id,
      offsetX: point.x - label.x,
      offsetY: point.y - label.y,
    });
  }

  function deleteSelectedText() {
    if (!selectedTextId) return;
    setTextLabels((labels) => labels.filter((label) => label.id !== selectedTextId));
    setSelectedTextId("");
    setDirty(true);
  }

  async function handlePreview() {
    try {
      const blob = await renderSketchBlob("image/png");
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(blob));
    } catch {
      setNotice(copy.saveFailed);
    }
  }

  async function handleSave() {
    setSaving(true);
    setNotice("");

    try {
      const mimeType = exportMimeType;
      const blob = await renderSketchBlob(mimeType);
      const thumbnailBlob = await renderThumbnailBlob();
      const id = sketch?.id || createClientId();
      const extension = mimeType === "image/webp" ? "webp" : "png";
      const file = new File([blob], `${id}.${extension}`, { type: mimeType });
      const thumbnailFile = new File([thumbnailBlob], `${id}-thumbnail.png`, {
        type: "image/png",
      });
      const previewObjectUrl = URL.createObjectURL(blob);
      const sketchPayload = {
        id,
        type: "dream_sketch",
        file,
        thumbnailFile,
        previewUrl: previewObjectUrl,
        imageUrl: previewObjectUrl,
        thumbnailUrl: previewObjectUrl,
        width: canvasSize.width,
        height: canvasSize.height,
        mimeType,
        fileSizeBytes: blob.size,
        createdAt: sketch?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source,
        title: null,
        caption: null,
        textLabels: textLabels.map(({ id: _id, ...label }) => label),
        publicAllowed,
        researchAllowed,
        adultContent: false,
        sensitivityLevel: null,
        altText: null,
      };

      await onSaveSketch(sketchPayload);
      if (sketch?.previewUrl?.startsWith("blob:")) URL.revokeObjectURL(sketch.previewUrl);
      setSketch(sketchPayload);
      setDirty(false);
      setNotice(copy.saved);
      setModalOpen(false);
    } catch {
      setNotice(copy.saveFailed);
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    if (!hasSketch) return;
    if (typeof window !== "undefined" && !window.confirm(copy.removeConfirm)) return;
    await onRemoveSketch(sketch);
    if (sketch?.previewUrl?.startsWith("blob:")) URL.revokeObjectURL(sketch.previewUrl);
    setSketch(null);
    setTextLabels([]);
    setSelectedTextId("");
    setNotice(copy.noSketch);
    setDirty(false);
  }

  async function renderSketchBlob(mimeType) {
    const canvas = canvasRef.current;
    if (!canvas) throw new Error("Canvas is not ready.");

    const output = document.createElement("canvas");
    output.width = canvas.width;
    output.height = canvas.height;
    const context = output.getContext("2d");
    context.drawImage(canvas, 0, 0);
    drawTextLabels(context, textLabels);

    return canvasToBlob(output, mimeType);
  }

  async function renderThumbnailBlob() {
    const blob = await renderSketchBlob("image/png");
    const image = await loadImage(URL.createObjectURL(blob));
    const maxSide = 420;
    const ratio = Math.min(maxSide / image.width, maxSide / image.height, 1);
    const thumbnail = document.createElement("canvas");
    thumbnail.width = Math.max(1, Math.round(image.width * ratio));
    thumbnail.height = Math.max(1, Math.round(image.height * ratio));
    thumbnail.getContext("2d").drawImage(image, 0, 0, thumbnail.width, thumbnail.height);

    return canvasToBlob(thumbnail, "image/png");
  }

  const selectedLabel = textLabels.find((label) => label.id === selectedTextId);

  return (
    <section className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.04] p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="group flex min-w-0 items-start gap-3 text-left"
          aria-expanded={expanded}
        >
          <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-300/10 font-mono text-cyan-100">
            {expanded ? "⌄" : "›"}
          </span>
          <span>
            <span className="cdo-card-heading block">{copy.title}</span>
            <span className="cdo-body-copy mt-2 block">{copy.subtitle}</span>
            <span className="mt-2 block font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-200/70">
              {hasSketch ? copy.saved : copy.collapsedHint}
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={openBoard}
          disabled={disabled}
          className="shrink-0 rounded-xl border border-cyan-300/35 bg-cyan-300 px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {copy.open}
        </button>
      </div>

      {expanded && (
        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="space-y-4">
            <p className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm leading-relaxed text-slate-300">
              {copy.privacy}
            </p>
            <SketchToggle
              checked={publicAllowed}
              label={copy.includePublic}
              onChange={(checked) => {
                setPublicAllowed(checked);
                setSketch((current) => {
                  const next = current ? { ...current, publicAllowed: checked } : current;
                  onSketchChange(next);
                  return next;
                });
              }}
            />
            <SketchToggle
              checked={researchAllowed}
              label={copy.allowResearch}
              onChange={(checked) => {
                setResearchAllowed(checked);
                setSketch((current) => {
                  const next = current ? { ...current, researchAllowed: checked } : current;
                  onSketchChange(next);
                  return next;
                });
              }}
            />
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
            {hasSketch ? (
              <img
                src={sketch.thumbnailUrl || sketch.previewUrl || sketch.imageUrl}
                alt={copy.previewTitle}
                className="aspect-[4/3] w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center p-5 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                {copy.noSketch}
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 p-3">
              <button
                type="button"
                onClick={openBoard}
                className="rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-100"
              >
                {copy.preview}
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={!hasSketch || disabled}
                className="rounded-xl border border-red-300/20 bg-red-400/5 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-red-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {copy.remove}
              </button>
            </div>
          </div>
        </div>
      )}

      {notice && (
        <p className="mt-4 rounded-xl border border-cyan-300/20 bg-cyan-300/5 p-3 font-mono text-xs leading-5 text-cyan-100">
          {notice}
        </p>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 p-0 text-zinc-100 backdrop-blur sm:p-4">
          <div className="mx-auto flex h-full max-w-7xl flex-col overflow-hidden border-cyan-300/20 bg-zinc-950 shadow-terminal sm:rounded-3xl sm:border">
            <div className="flex items-start justify-between gap-3 border-b border-white/10 p-4 sm:p-5">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-200/70">
                  {copy.title}
                </p>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">
                  {copy.subtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={closeBoard}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-100"
              >
                {copy.close}
              </button>
            </div>

            <div className="grid min-h-0 flex-1 gap-0 lg:grid-cols-[18rem_minmax(0,1fr)]">
              <div className="order-2 max-h-[44vh] overflow-y-auto border-t border-white/10 bg-black/35 p-4 lg:order-1 lg:max-h-none lg:border-r lg:border-t-0">
                <SketchToolbar
                  copy={copy}
                  tool={tool}
                  setTool={setTool}
                  brushSize={brushSize}
                  setBrushSize={setBrushSize}
                  opacity={opacity}
                  setOpacity={setOpacity}
                  exportMimeType={exportMimeType}
                  setExportMimeType={setExportMimeType}
                  color={color}
                  setColor={setColor}
                  labelDraft={labelDraft}
                  setLabelDraft={setLabelDraft}
                  selectedLabel={selectedLabel}
                  onDeleteText={deleteSelectedText}
                  canvasMode={canvasMode}
                  setCanvasMode={setCanvasMode}
                  onUndo={handleUndo}
                  onRedo={handleRedo}
                  onClear={handleClear}
                  onPreview={handlePreview}
                  undoDisabled={undoStack.length === 0}
                  redoDisabled={redoStack.length === 0}
                />
              </div>

              <div className="order-1 flex min-h-0 flex-col bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,.12),transparent_42%),#05070a] lg:order-2">
                <div className="min-h-0 flex-1 overflow-auto p-3 sm:p-5">
                  <div className="mx-auto w-full max-w-5xl">
                    <div
                      className="relative mx-auto touch-none select-none"
                      style={{ maxWidth: `${canvasSize.width}px` }}
                      onPointerMove={movePointer}
                      onPointerUp={endPointer}
                      onPointerCancel={endPointer}
                    >
                      <canvas
                        ref={canvasRef}
                        onPointerDown={beginDraw}
                        onPointerMove={movePointer}
                        onPointerUp={endPointer}
                        onPointerCancel={endPointer}
                        className="block h-auto w-full touch-none rounded-2xl border border-cyan-300/25 bg-black shadow-[0_0_32px_rgba(34,211,238,.14)]"
                      />
                      {textLabels.map((label) => (
                        <button
                          key={label.id}
                          type="button"
                          onPointerDown={(event) => beginLabelDrag(event, label)}
                          className={[
                            "absolute rounded-md border px-2 py-1 font-mono shadow-lg",
                            selectedTextId === label.id
                              ? "border-fuchsia-300 bg-fuchsia-300/20"
                              : "border-cyan-300/20 bg-black/40",
                          ].join(" ")}
                          style={{
                            left: `${(label.x / canvasSize.width) * 100}%`,
                            top: `${(label.y / canvasSize.height) * 100}%`,
                            color: label.color,
                            fontSize: `${Math.max(12, label.fontSize * 0.7)}px`,
                            transform: "translate(-10%, -70%)",
                          }}
                        >
                          {label.text}
                        </button>
                      ))}
                    </div>
                  </div>

                  {previewUrl && (
                    <div className="mx-auto mt-4 max-w-3xl rounded-2xl border border-fuchsia-300/20 bg-fuchsia-300/5 p-4">
                      <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-fuchsia-100">
                        {copy.previewTitle}
                      </p>
                      <img
                        src={previewUrl}
                        alt={copy.previewTitle}
                        className="w-full rounded-xl border border-white/10"
                      />
                    </div>
                  )}
                </div>

                <div className="sticky bottom-0 grid gap-3 border-t border-white/10 bg-zinc-950/95 p-3 sm:grid-cols-[1fr_auto_auto] sm:p-4">
                  <p className="self-center text-sm leading-relaxed text-slate-300">
                    {copy.privacy}
                  </p>
                  <button
                    type="button"
                    onClick={handleRemove}
                    disabled={!hasSketch || disabled}
                    className="rounded-xl border border-red-300/25 bg-red-400/5 px-5 py-4 font-mono text-xs font-bold uppercase tracking-[0.16em] text-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {copy.remove}
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || disabled}
                    className="rounded-xl border border-cyan-300/35 bg-cyan-300 px-5 py-4 font-mono text-xs font-bold uppercase tracking-[0.16em] text-zinc-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {saving ? "..." : copy.save}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function SketchToolbar({
  copy,
  tool,
  setTool,
  brushSize,
  setBrushSize,
  opacity,
  setOpacity,
  exportMimeType,
  setExportMimeType,
  color,
  setColor,
  labelDraft,
  setLabelDraft,
  selectedLabel,
  onDeleteText,
  canvasMode,
  setCanvasMode,
  onUndo,
  onRedo,
  onClear,
  onPreview,
  undoDisabled,
  redoDisabled,
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <ToolButton active={tool === "draw"} onClick={() => setTool("draw")}>
          {copy.draw}
        </ToolButton>
        <ToolButton active={tool === "eraser"} onClick={() => setTool("eraser")}>
          {copy.eraser}
        </ToolButton>
        <ToolButton active={tool === "text"} onClick={() => setTool("text")}>
          {copy.addText}
        </ToolButton>
        <ToolButton onClick={onPreview}>{copy.preview}</ToolButton>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <ToolButton onClick={onUndo} disabled={undoDisabled}>
          {copy.undo}
        </ToolButton>
        <ToolButton onClick={onRedo} disabled={redoDisabled}>
          {copy.redo}
        </ToolButton>
        <ToolButton onClick={onClear} danger>
          {copy.clear}
        </ToolButton>
        <ToolButton onClick={onDeleteText} disabled={!selectedLabel} danger>
          {copy.deleteText}
        </ToolButton>
      </div>

      <label className="block">
        <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          {copy.brushSize}
        </span>
        <input
          type="range"
          min="2"
          max="28"
          value={brushSize}
          onChange={(event) => setBrushSize(Number(event.target.value))}
          className="w-full accent-cyan-300"
        />
      </label>

      <label className="block">
        <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          {copy.opacity}
        </span>
        <input
          type="range"
          min="0.2"
          max="1"
          step="0.1"
          value={opacity}
          onChange={(event) => setOpacity(Number(event.target.value))}
          className="w-full accent-fuchsia-300"
        />
      </label>

      <div>
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          {copy.color}
        </p>
        <div className="grid grid-cols-7 gap-2">
          {PALETTE.map((swatch) => (
            <button
              key={swatch}
              type="button"
              onClick={() => setColor(swatch)}
              className={[
                "h-8 rounded-full border transition",
                color === swatch ? "border-white ring-2 ring-cyan-300/50" : "border-white/20",
              ].join(" ")}
              style={{ backgroundColor: swatch }}
              aria-label={`${copy.color} ${swatch}`}
            />
          ))}
        </div>
      </div>

      <label className="block">
        <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          {copy.format}
        </span>
        <select
          value={exportMimeType}
          onChange={(event) => setExportMimeType(event.target.value)}
          className="w-full rounded-xl border border-cyan-300/15 bg-black/40 px-3 py-3 font-mono text-xs text-cyan-50 outline-none"
        >
          <option value="image/png">{copy.png}</option>
          <option value="image/webp">{copy.webp}</option>
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          {copy.canvasSize}
        </span>
        <select
          value={canvasMode}
          onChange={(event) => setCanvasMode(event.target.value)}
          className="w-full rounded-xl border border-cyan-300/15 bg-black/40 px-3 py-3 font-mono text-xs text-cyan-50 outline-none"
        >
          {Object.keys(CANVAS_SIZES).map((mode) => (
            <option key={mode} value={mode}>
              {copy[mode]}
            </option>
          ))}
        </select>
      </label>

      {tool === "text" && (
        <label className="block rounded-2xl border border-fuchsia-300/15 bg-fuchsia-300/5 p-3">
          <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-fuchsia-100">
            {copy.labelText}
          </span>
          <input
            value={labelDraft}
            onChange={(event) => setLabelDraft(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-3 font-mono text-sm text-cyan-50 outline-none"
          />
          <span className="mt-2 block text-xs leading-relaxed text-slate-300">
            {copy.placeText}
          </span>
        </label>
      )}
    </div>
  );
}

function ToolButton({ active = false, danger = false, disabled = false, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "min-h-11 rounded-xl border px-3 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] transition",
        active
          ? "border-cyan-300/40 bg-cyan-300 text-zinc-950"
          : danger
            ? "border-red-300/25 bg-red-400/5 text-red-100 hover:border-red-300/45"
            : "border-white/10 bg-white/[0.04] text-zinc-200 hover:border-cyan-300/35 hover:text-cyan-100",
        disabled ? "cursor-not-allowed opacity-45" : "",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function SketchToggle({ checked, label, onChange }) {
  return (
    <label className="flex min-h-14 items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
      <span className="text-sm font-semibold leading-relaxed text-slate-200">
        {label}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 shrink-0 accent-cyan-300"
      />
    </label>
  );
}

function normalizeInitialSketch(initialSketches) {
  return Array.isArray(initialSketches) && initialSketches.length > 0
    ? initialSketches[0]
    : null;
}

function drawTextLabels(context, labels) {
  labels.forEach((label) => {
    context.save();
    context.font = `${Math.max(10, Number(label.fontSize || 24))}px ui-monospace, SFMono-Regular, Menlo, monospace`;
    context.fillStyle = label.color || "#e0faff";
    context.shadowColor = "rgba(0,0,0,.85)";
    context.shadowBlur = 8;
    context.fillText(label.text, Number(label.x || 0), Number(label.y || 0));
    context.restore();
  });
}

function getContainedRect(sourceWidth, sourceHeight, targetWidth, targetHeight) {
  const ratio = Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight);
  const width = sourceWidth * ratio;
  const height = sourceHeight * ratio;

  return {
    width,
    height,
    x: (targetWidth - width) / 2,
    y: (targetHeight - height) / 2,
  };
}

function canvasToBlob(canvas, mimeType) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas export failed."));
      },
      mimeType,
      0.92
    );
  });
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = reject;
    image.src = url;
  });
}

function createClientId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
