import { useEffect, useMemo, useRef, useState } from "react";
import { trackSafeAnalyticsEvent } from "../lib/betaService.js";

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

const BACKGROUND_COLORS = {
  dark: "#05070a",
  white: "#f8fafc",
  transparent: "transparent",
};

const SHAPE_TOOLS = new Set(["rectangle", "triangle", "ellipse", "line"]);
const FILL_TOLERANCE = 26;
const MAX_HISTORY = 40;
const MAX_STROKE_POINTS = 1600;
const LAYER_VERSION = "dream-sketch-2026.1";

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
    placeText: "Tap the sketch to place this label, or select an existing label to edit it.",
    selectText: "Select text",
    deleteText: "Delete selected text",
    undo: "Undo",
    redo: "Redo",
    draw: "Brush",
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
    background: "Background",
    dark: "Dark",
    white: "White",
    transparent: "Transparent",
    showGrid: "Faint grid",
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
    visualLimit: "This dream already has four visual attachments.",
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
    placeText: "點一下草圖放置標籤；選取既有標籤可編輯。",
    selectText: "選取文字",
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
    background: "背景",
    dark: "深色",
    white: "白色",
    transparent: "透明",
    showGrid: "淡格線",
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
    visualLimit: "這則夢境已經有四個視覺附件。",
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
    placeText: "Toca el boceto para colocar la etiqueta, o selecciona una para editarla.",
    selectText: "Seleccionar texto",
    deleteText: "Borrar etiqueta",
    undo: "Deshacer",
    redo: "Rehacer",
    draw: "Pincel",
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
    background: "Fondo",
    dark: "Oscuro",
    white: "Blanco",
    transparent: "Transparente",
    showGrid: "Cuadrícula tenue",
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
    visualLimit: "Este sueño ya tiene cuatro adjuntos visuales.",
  },
};

Object.assign(SKETCH_COPY.en, {
  geometric: "Shapes",
  title: "Sketch the dream",
  subtitle:
    "Draw a rough scene, symbol, map, creature, or place from the dream. It does not need to look good.",
  privacy: "Sketches are private by default.",
  privacyWarning:
    "Sketches can reveal private places, people, bodies, symbols, names, handwriting, or intimate details. Keep them private unless you are sure.",
  publishTextOnly: "You can publish the dream text without publishing the sketch.",
  includePublic: "Include this sketch if I publish this dream",
  keepPrivate: "Keep sketch private",
  personalMemory: "Use sketch only for personal memory",
  allowResearch: "Allow this sketch to contribute to research metadata",
  allowAi: "Allow AI to analyze sketch for suggested tags",
  aiOffDefault: "Optional and off by default.",
  textReviewReminder: "This sketch contains text. Review it before making it public.",
  altText: "Alt text",
  altTextPlaceholder: "Briefly describe this sketch for accessibility",
  open: "Open sketch board",
  addText: "Add text",
  fill: "Fill",
  rectangle: "Rectangle",
  triangle: "Triangle",
  ellipse: "Circle / ellipse",
  line: "Line",
  shapeFill: "Fill shape interior",
  frameThickness: "Brush / frame",
  clear: "Clear",
  save: "Save sketch",
  preview: "Preview sketch",
});

Object.assign(SKETCH_COPY.zh, {
  geometric: "幾何圖形",
  title: "畫下這個夢",
  subtitle:
    "你可以粗略畫下夢中的場景、符號、地圖、生物或地方。不需要畫得好，只要能幫你記住夢。",
  privacy: "草圖預設為私人。",
  privacyWarning:
    "草圖可能露出私人地點、人物、身體、符號、名字、筆跡或親密細節。除非你確定，否則請保持私人。",
  publishTextOnly: "你可以公開夢的文字，而不公開草圖。",
  includePublic: "如果公開這則夢，也顯示這張草圖",
  keepPrivate: "保持草圖私人",
  personalMemory: "只作為個人記憶",
  allowResearch: "允許這張草圖提供研究中繼資料",
  allowAi: "允許 AI 分析草圖並建議標籤",
  aiOffDefault: "選用功能，預設關閉。",
  textReviewReminder: "這張草圖含有文字。公開前請再次檢查。",
  altText: "替代文字",
  altTextPlaceholder: "簡短描述這張草圖，方便無障礙閱讀",
  collapsedHint: "選用畫圖工具",
  open: "開啟畫板",
  close: "關閉",
  addText: "加入文字",
  fill: "填色",
  rectangle: "矩形",
  triangle: "三角形",
  ellipse: "圓形／橢圓",
  line: "直線",
  shapeFill: "填滿形狀內部",
  frameThickness: "筆刷／框線",
  labelText: "文字內容",
  placeText: "點一下畫布放置文字，或選取既有文字來編輯。",
  selectText: "選取文字",
  deleteText: "刪除選取文字",
  undo: "復原",
  redo: "重做",
  draw: "筆刷",
  eraser: "橡皮擦",
  clear: "清除",
  save: "儲存草圖",
  remove: "移除草圖",
  preview: "預覽草圖",
  brushSize: "筆刷",
  opacity: "透明度",
  format: "格式",
  color: "顏色",
  background: "背景",
  dark: "深色",
  white: "白色",
  transparent: "透明",
  showGrid: "淡格線",
  canvasSize: "畫布尺寸",
  phone: "手機",
  square: "方形",
  vertical: "直式",
  horizontal: "橫式",
  saved: "草圖已暫存到這則夢。",
  noSketch: "尚未儲存草圖。",
  previewTitle: "草圖預覽",
  clearConfirm: "要清空畫板嗎？",
  removeConfirm: "要從這則夢移除草圖嗎？",
  closeConfirm: "尚未儲存最新草圖變更，仍要關閉嗎？",
  saveFailed: "草圖無法準備完成，請再試一次。",
  visualLimit: "這則夢已經有四個視覺附件。",
});

Object.assign(SKETCH_COPY.es, {
  geometric: "Formas",
  title: "Dibuja este sueño",
  subtitle:
    "Dibuja una escena, símbolo, mapa, criatura o lugar del sueño. No tiene que verse perfecto; solo tiene que ayudarte a recordarlo.",
  privacy: "Los bocetos son privados por defecto.",
  privacyWarning:
    "Los bocetos pueden revelar lugares privados, personas, cuerpos, símbolos, nombres, escritura a mano o detalles íntimos. Mantenlos privados salvo que estés seguro.",
  publishTextOnly: "Puedes publicar el texto del sueño sin publicar el boceto.",
  includePublic: "Incluir este boceto si publico este sueño",
  keepPrivate: "Mantener el boceto privado",
  personalMemory: "Usar el boceto solo como memoria personal",
  allowResearch: "Permitir que este boceto aporte metadatos de investigación",
  allowAi: "Permitir que la IA analice el boceto para sugerir etiquetas",
  aiOffDefault: "Opcional y desactivado por defecto.",
  textReviewReminder: "Este boceto contiene texto. Revísalo antes de hacerlo público.",
  altText: "Texto alternativo",
  altTextPlaceholder: "Describe brevemente este boceto para accesibilidad",
  open: "Abrir tablero de dibujo",
  addText: "Añadir texto",
  fill: "Rellenar",
  rectangle: "Rectángulo",
  triangle: "Triángulo",
  ellipse: "Círculo / elipse",
  line: "Línea",
  shapeFill: "Rellenar interior",
  frameThickness: "Pincel / marco",
  clear: "Borrar",
  save: "Guardar boceto",
  preview: "Vista previa",
});

export default function DreamSketchBoard({
  language = "zh",
  currentUser = null,
  initialSketches = [],
  source = "recording_page",
  defaultExpanded,
  onSaveSketch = () => {},
  onSketchChange = () => {},
  onRemoveSketch = () => {},
  disabled = false,
  disabledReason = "",
}) {
  const copy = SKETCH_COPY[language] || SKETCH_COPY.zh;
  const initialSketch = useMemo(
    () => normalizeInitialSketch(initialSketches),
    [initialSketches]
  );
  const initialLayerData = useMemo(
    () => normalizeLayerData(initialSketch?.layerData),
    [initialSketch]
  );
  const initialExpanded = useMemo(() => {
    if (typeof defaultExpanded === "boolean") return defaultExpanded;
    if (typeof window === "undefined") return false;
    return window.matchMedia("(min-width: 1024px)").matches;
  }, [defaultExpanded]);
  const [expanded, setExpanded] = useState(initialExpanded);
  const [modalOpen, setModalOpen] = useState(false);
  const [sketch, setSketch] = useState(initialSketch);
  const [layers, setLayers] = useState(initialLayerData.layers);
  const [backgroundMode, setBackgroundMode] = useState(initialLayerData.backgroundMode);
  const [showGrid, setShowGrid] = useState(initialLayerData.showGrid);
  const [publicAllowed, setPublicAllowed] = useState(Boolean(initialSketch?.publicAllowed));
  const [researchAllowed, setResearchAllowed] = useState(Boolean(initialSketch?.researchAllowed));
  const [memoryOnly, setMemoryOnly] = useState(Boolean(initialSketch?.memoryOnly));
  const [aiAnalysisAllowed, setAiAnalysisAllowed] = useState(
    Boolean(initialSketch?.aiAnalysisAllowed || initialSketch?.allowAiAnalysis)
  );
  const [altText, setAltText] = useState(initialSketch?.altText || "");
  const [tool, setTool] = useState("brush");
  const [brushSize, setBrushSize] = useState(8);
  const [opacity, setOpacity] = useState(1);
  const [shapeFillEnabled, setShapeFillEnabled] = useState(false);
  const [exportMimeType, setExportMimeType] = useState("image/png");
  const [color, setColor] = useState(PALETTE[1]);
  const [canvasMode, setCanvasMode] = useState(() =>
    initialSketch ? getCanvasModeFromLayerData(initialLayerData) : getDefaultCanvasMode()
  );
  const [labelDraft, setLabelDraft] = useState("");
  const [selectedTextId, setSelectedTextId] = useState("");
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [dirty, setDirty] = useState(false);
  const [notice, setNotice] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const canvasRef = useRef(null);
  const baseImageRef = useRef(null);
  const activeStrokeRef = useRef(null);
  const activeShapeRef = useRef(null);
  const dragTextRef = useRef(null);

  const canvasSize = CANVAS_SIZES[canvasMode] || CANVAS_SIZES.phone;
  const hasSketch = Boolean(sketch?.previewUrl || sketch?.imageUrl || sketch?.thumbnailUrl);
  const textLayers = layers.filter((layer) => layer.type === "text");
  const selectedText = textLayers.find((layer) => layer.id === selectedTextId);
  const hasTextLabels =
    textLayers.length > 0 ||
    (Array.isArray(sketch?.textLabels) && sketch.textLabels.length > 0);
  const openDisabled = Boolean(disabled && !hasSketch);

  useEffect(() => {
    const nextSketch = normalizeInitialSketch(initialSketches);
    const nextLayerData = normalizeLayerData(nextSketch?.layerData);
    setSketch(nextSketch);
    setLayers(nextLayerData.layers);
    setBackgroundMode(nextLayerData.backgroundMode);
    setShowGrid(nextLayerData.showGrid);
    setCanvasMode(nextSketch ? getCanvasModeFromLayerData(nextLayerData) : getDefaultCanvasMode());
    setPublicAllowed(Boolean(nextSketch?.publicAllowed));
    setResearchAllowed(Boolean(nextSketch?.researchAllowed));
    setMemoryOnly(Boolean(nextSketch?.memoryOnly));
    setAiAnalysisAllowed(Boolean(nextSketch?.aiAnalysisAllowed || nextSketch?.allowAiAnalysis));
    setAltText(nextSketch?.altText || "");
    setSelectedTextId("");
    setUndoStack([]);
    setRedoStack([]);
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

    const imageUrl = sketch?.imageUrl || sketch?.previewUrl || "";
    if (!imageUrl || layers.length > 0) {
      baseImageRef.current = null;
      renderDisplayCanvas();
      return;
    }

    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      baseImageRef.current = image;
      renderDisplayCanvas();
    };
    image.onerror = () => {
      baseImageRef.current = null;
      renderDisplayCanvas();
    };
    image.src = imageUrl;
  }, [modalOpen, sketch, canvasMode]);

  useEffect(() => {
    if (modalOpen) renderDisplayCanvas();
  }, [layers, backgroundMode, showGrid, modalOpen, canvasMode]);

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (sketch?.previewUrl?.startsWith("blob:")) URL.revokeObjectURL(sketch.previewUrl);
    },
    [previewUrl, sketch]
  );

  function openBoard() {
    if (openDisabled) {
      setNotice(disabledReason || copy.visualLimit);
      return;
    }

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

  function pushUndoSnapshot(nextLayers = layers) {
    setUndoStack((current) => [
      ...current.slice(-(MAX_HISTORY - 1)),
      cloneLayers(nextLayers),
    ]);
    setRedoStack([]);
  }

  function handleUndo() {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setRedoStack((stack) => [...stack.slice(-(MAX_HISTORY - 1)), cloneLayers(layers)]);
    setUndoStack((stack) => stack.slice(0, -1));
    setLayers(previous);
    setSelectedTextId("");
    setDirty(true);
  }

  function handleRedo() {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack((stack) => [...stack.slice(-(MAX_HISTORY - 1)), cloneLayers(layers)]);
    setRedoStack((stack) => stack.slice(0, -1));
    setLayers(next);
    setSelectedTextId("");
    setDirty(true);
  }

  function handleClear() {
    if (typeof window !== "undefined" && !window.confirm(copy.clearConfirm)) return;
    pushUndoSnapshot();
    setLayers([]);
    setSelectedTextId("");
    setDirty(true);
  }

  function getCanvasPoint(event) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: clamp(((event.clientX - rect.left) / rect.width) * canvasSize.width, 0, canvasSize.width),
      y: clamp(((event.clientY - rect.top) / rect.height) * canvasSize.height, 0, canvasSize.height),
    };
  }

  function beginPointer(event) {
    if (openDisabled) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);

    const point = getCanvasPoint(event);
    const hitText = findTextLayerAtPoint(layers, point);

    if ((tool === "select" || tool === "text") && hitText) {
      pushUndoSnapshot();
      setSelectedTextId(hitText.id);
      setLabelDraft(hitText.text);
      dragTextRef.current = {
        id: hitText.id,
        offsetX: point.x - hitText.x,
        offsetY: point.y - hitText.y,
      };
      return;
    }

    if (tool === "text") {
      const trimmedLabel = labelDraft.trim();
      if (!trimmedLabel) return;

      pushUndoSnapshot();
      const label = createTextLayer({
        text: trimmedLabel,
        x: point.x,
        y: point.y,
        fontSize: Math.max(14, Math.min(48, brushSize * 3)),
        color,
      });
      setLayers((current) => [...current, label]);
      setSelectedTextId(label.id);
      setLabelDraft(label.text);
      setDirty(true);
      return;
    }

    if (tool === "fill") {
      pushUndoSnapshot();
      const fillLayer = createFillLayer({
        x: point.x,
        y: point.y,
        color,
        opacity,
        tolerance: FILL_TOLERANCE,
      });
      setLayers((current) => [...current, fillLayer]);
      setSelectedTextId("");
      setDirty(true);
      return;
    }

    if (SHAPE_TOOLS.has(tool)) {
      pushUndoSnapshot();
      const shape = createShapeLayer({
        shape: tool,
        start: point,
        end: point,
        color,
        strokeWidth: brushSize,
        opacity,
        fillColor: shapeFillEnabled && tool !== "line" ? color : "",
        fillOpacity: shapeFillEnabled && tool !== "line" ? Math.min(0.55, opacity) : 0,
      });
      activeShapeRef.current = { id: shape.id };
      setLayers((current) => [...current, shape]);
      setSelectedTextId("");
      setDirty(true);
      return;
    }

    pushUndoSnapshot();
    const stroke = createStrokeLayer({
      tool: tool === "eraser" ? "eraser" : "brush",
      color,
      size: brushSize,
      opacity,
      points: [point],
    });
    activeStrokeRef.current = { id: stroke.id, lastPoint: point };
    setLayers((current) => [...current, stroke]);
    setSelectedTextId("");
    setDirty(true);
  }

  function movePointer(event) {
    if (dragTextRef.current) {
      event.preventDefault();
      const point = getCanvasPoint(event);
      const drag = dragTextRef.current;
      setLayers((current) =>
        current.map((layer) =>
          layer.id === drag.id
            ? {
                ...layer,
                x: clamp(point.x - drag.offsetX, 0, canvasSize.width),
                y: clamp(point.y - drag.offsetY, 0, canvasSize.height),
              }
            : layer
        )
      );
      setDirty(true);
      return;
    }

    const activeShape = activeShapeRef.current;
    if (activeShape) {
      event.preventDefault();
      const point = getCanvasPoint(event);
      setLayers((current) =>
        current.map((layer) =>
          layer.id === activeShape.id && layer.type === "shape"
            ? { ...layer, x2: point.x, y2: point.y }
            : layer
        )
      );
      setDirty(true);
      return;
    }

    const activeStroke = activeStrokeRef.current;
    if (!activeStroke) return;
    event.preventDefault();
    const point = getCanvasPoint(event);

    if (!shouldAddPoint(activeStroke.lastPoint, point)) return;

    activeStrokeRef.current = { ...activeStroke, lastPoint: point };
    setLayers((current) =>
      current.map((layer) =>
        layer.id === activeStroke.id
          ? {
              ...layer,
              points: [...layer.points, point].slice(-MAX_STROKE_POINTS),
            }
          : layer
      )
    );
    setDirty(true);
  }

  function endPointer(event) {
    event?.currentTarget?.releasePointerCapture?.(event.pointerId);
    activeStrokeRef.current = null;
    activeShapeRef.current = null;
    dragTextRef.current = null;
  }

  function beginLabelDrag(event, label) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    pushUndoSnapshot();
    const point = getCanvasPoint(event);
    setTool("select");
    setSelectedTextId(label.id);
    setLabelDraft(label.text);
    dragTextRef.current = {
      id: label.id,
      offsetX: point.x - label.x,
      offsetY: point.y - label.y,
    };
  }

  function updateSelectedText(value) {
    setLabelDraft(value);
    if (!selectedTextId) return;
    setLayers((current) =>
      current.map((layer) =>
        layer.id === selectedTextId
          ? { ...layer, text: value.slice(0, 80) }
          : layer
      )
    );
    setDirty(true);
  }

  function deleteSelectedText() {
    if (!selectedTextId) return;
    pushUndoSnapshot();
    setLayers((current) => current.filter((layer) => layer.id !== selectedTextId));
    setSelectedTextId("");
    setLabelDraft("");
    setDirty(true);
  }

  function updateSketchPrivacy(patch) {
    setSketch((current) => {
      const next = current ? { ...current, ...patch } : current;
      onSketchChange(next);
      return next;
    });
  }

  function applyPrivacyChoice(choice) {
    if (choice === "public") {
      setPublicAllowed(true);
      setMemoryOnly(false);
      updateSketchPrivacy({ publicAllowed: true, memoryOnly: false });
      if (hasTextLabels) setNotice(copy.textReviewReminder);
      return;
    }

    if (choice === "memory") {
      setPublicAllowed(false);
      setResearchAllowed(false);
      setAiAnalysisAllowed(false);
      setMemoryOnly(true);
      updateSketchPrivacy({
        publicAllowed: false,
        researchAllowed: false,
        aiAnalysisAllowed: false,
        allowAiAnalysis: false,
        memoryOnly: true,
      });
      return;
    }

    setPublicAllowed(false);
    if (choice === "private") {
      updateSketchPrivacy({ publicAllowed: false, memoryOnly: false });
    }
  }

  function updateBackground(nextMode) {
    setBackgroundMode(nextMode);
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
      const thumbnailBlob = await renderThumbnailBlob(mimeType);
      const id = sketch?.id || createClientId();
      const extension = mimeType === "image/webp" ? "webp" : "png";
      const file = new File([blob], `${id}.${extension}`, { type: mimeType });
      const thumbnailFile = new File([thumbnailBlob], `${id}-thumb.${extension}`, {
        type: mimeType,
      });
      const layerData = serializeLayerData();
      const layerFile = new File(
        [JSON.stringify(layerData)],
        `${id}-layers.json`,
        { type: "application/json" }
      );
      const previewObjectUrl = URL.createObjectURL(blob);
      const sketchPayload = {
        id,
        type: "dream_sketch",
        file,
        thumbnailFile,
        layerFile,
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
        textLabels: textLayers.map(({ id: _id, type: _type, ...label }) => label),
        layerData,
        publicAllowed,
        researchAllowed,
        memoryOnly,
        aiAnalysisAllowed,
        allowAiAnalysis: aiAnalysisAllowed,
        adultContent: false,
        sensitivityLevel: null,
        altText: altText.trim() || sketch?.altText || null,
      };

      await onSaveSketch(sketchPayload);
      trackSafeAnalyticsEvent("sketch_created", {
        currentUser,
        language,
        metadata: { source },
      }).catch(() => {});
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
    setLayers([]);
    setSelectedTextId("");
    setLabelDraft("");
    setNotice(copy.noSketch);
    setDirty(false);
  }

  async function renderSketchBlob(mimeType) {
    const output = renderLayersToCanvas({
      canvasSize,
      layers,
      baseImage: baseImageRef.current,
      backgroundMode,
      showGrid,
      includeText: true,
    });

    return canvasToBlob(output, mimeType);
  }

  async function renderThumbnailBlob(mimeType) {
    const output = renderLayersToCanvas({
      canvasSize,
      layers,
      baseImage: baseImageRef.current,
      backgroundMode,
      showGrid,
      includeText: true,
    });
    const maxSide = 420;
    const ratio = Math.min(maxSide / output.width, maxSide / output.height, 1);
    const thumbnail = document.createElement("canvas");
    thumbnail.width = Math.max(1, Math.round(output.width * ratio));
    thumbnail.height = Math.max(1, Math.round(output.height * ratio));
    thumbnail.getContext("2d").drawImage(output, 0, 0, thumbnail.width, thumbnail.height);

    return canvasToBlob(thumbnail, mimeType);
  }

  function serializeLayerData() {
    return {
      version: LAYER_VERSION,
      width: canvasSize.width,
      height: canvasSize.height,
      backgroundMode,
      showGrid,
      layers: normalizeLayersForStorage(layers),
    };
  }

  function renderDisplayCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pixelRatio =
      typeof window !== "undefined" ? Math.max(1, window.devicePixelRatio || 1) : 1;
    canvas.width = Math.round(canvasSize.width * pixelRatio);
    canvas.height = Math.round(canvasSize.height * pixelRatio);
    canvas.style.aspectRatio = `${canvasSize.width} / ${canvasSize.height}`;
    const context = canvas.getContext("2d");
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    drawLayers(context, {
      width: canvasSize.width,
      height: canvasSize.height,
      layers: layers.filter((layer) => layer.type !== "text"),
      baseImage: baseImageRef.current,
      backgroundMode,
      showGrid,
      includeText: false,
    });
  }

  return (
    <section className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.04] p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="group flex min-w-0 items-start gap-3 text-left"
          aria-expanded={expanded}
          aria-label={copy.title}
        >
          <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-300/10 font-mono text-cyan-100">
            {expanded ? "v" : ">"}
          </span>
          <span>
            <span className="cdo-card-heading block">{copy.title}</span>
            <span className="cdo-body-copy mt-2 block">{copy.subtitle}</span>
            <span className="mt-2 block font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-200/70">
              {openDisabled ? disabledReason || copy.visualLimit : hasSketch ? copy.saved : copy.collapsedHint}
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={openBoard}
          disabled={openDisabled}
          aria-label={copy.open}
          className="shrink-0 rounded-xl border border-cyan-300/35 bg-cyan-300 px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {copy.open}
        </button>
      </div>

      {expanded && (
        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="space-y-4">
            <div className="space-y-3 rounded-2xl border border-white/10 bg-black/25 p-4 text-sm leading-relaxed text-slate-300">
              <p className="font-semibold text-slate-100">{copy.privacy}</p>
              <p>{copy.privacyWarning}</p>
              <p className="text-cyan-100/85">{copy.publishTextOnly}</p>
              {hasTextLabels && publicAllowed && (
                <p className="rounded-xl border border-amber-300/25 bg-amber-300/10 p-3 text-amber-100">
                  {copy.textReviewReminder}
                </p>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <SketchActionButton onClick={() => applyPrivacyChoice("private")}>
                {copy.keepPrivate}
              </SketchActionButton>
              <SketchActionButton
                active={publicAllowed && !memoryOnly}
                onClick={() => applyPrivacyChoice("public")}
              >
                {copy.includePublic}
              </SketchActionButton>
              <SketchActionButton
                active={memoryOnly}
                onClick={() => applyPrivacyChoice("memory")}
              >
                {copy.personalMemory}
              </SketchActionButton>
            </div>
            <SketchToggle
              checked={publicAllowed}
              label={copy.includePublic}
              onChange={(checked) => {
                setPublicAllowed(checked);
                if (checked) setMemoryOnly(false);
                if (checked && hasTextLabels) setNotice(copy.textReviewReminder);
                updateSketchPrivacy({
                  publicAllowed: checked,
                  memoryOnly: checked ? false : memoryOnly,
                });
              }}
            />
            <SketchToggle
              checked={researchAllowed}
              label={copy.allowResearch}
              onChange={(checked) => {
                setResearchAllowed(checked);
                if (checked) setMemoryOnly(false);
                updateSketchPrivacy({
                  researchAllowed: checked,
                  memoryOnly: checked ? false : memoryOnly,
                });
              }}
            />
            <SketchToggle
              checked={aiAnalysisAllowed}
              label={`${copy.allowAi} (${copy.aiOffDefault})`}
              onChange={(checked) => {
                setAiAnalysisAllowed(checked);
                if (checked) setMemoryOnly(false);
                updateSketchPrivacy({
                  aiAnalysisAllowed: checked,
                  allowAiAnalysis: checked,
                  memoryOnly: checked ? false : memoryOnly,
                });
              }}
            />
            <label className="block">
              <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                {copy.altText}
              </span>
              <input
                value={altText}
                onChange={(event) => {
                  const nextAltText = event.target.value.slice(0, 280);
                  setAltText(nextAltText);
                  updateSketchPrivacy({ altText: nextAltText });
                }}
                placeholder={copy.altTextPlaceholder}
                className="w-full rounded-xl border border-cyan-300/15 bg-black/40 px-3 py-3 text-sm text-cyan-50 outline-none placeholder:text-slate-600 focus:border-cyan-300/50"
              />
            </label>
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
                {openDisabled ? disabledReason || copy.visualLimit : copy.noSketch}
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 p-3">
              <button
                type="button"
                onClick={openBoard}
                disabled={openDisabled}
                aria-label={copy.preview}
                className="rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {copy.preview}
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={!hasSketch}
                aria-label={copy.remove}
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
        <div className="fixed inset-0 z-[90] overflow-hidden bg-black/95 p-0 text-zinc-100 backdrop-blur">
          <div className="mx-auto flex h-[100dvh] w-screen max-w-none flex-col overflow-hidden border-cyan-300/20 bg-zinc-950 shadow-terminal md:border">
            <div className="shrink-0 flex items-start justify-between gap-3 border-b border-white/10 p-3 sm:p-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-200/70">
                  {copy.title}
                </p>
                <p className="mt-1 hidden max-w-3xl text-xs leading-relaxed text-slate-400 sm:block md:hidden">
                  {copy.subtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={closeBoard}
                aria-label={copy.close}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-100"
              >
                {copy.close}
              </button>
            </div>

            <div className="grid min-h-0 flex-1 gap-0 md:grid-cols-[minmax(18rem,24rem)_minmax(0,1fr)] 2xl:grid-cols-[minmax(20rem,26rem)_minmax(0,1fr)]">
              <div className="order-2 max-h-[44vh] overflow-y-auto border-t border-white/10 bg-black/35 p-3 sm:p-4 md:order-1 md:max-h-none md:min-h-0 md:self-stretch md:overflow-visible md:border-r md:border-t-0 md:p-3 lg:p-4">
                <SketchToolbar
                  copy={copy}
                  tool={tool}
                  setTool={setTool}
                  brushSize={brushSize}
                  setBrushSize={setBrushSize}
                  opacity={opacity}
                  setOpacity={setOpacity}
                  shapeFillEnabled={shapeFillEnabled}
                  setShapeFillEnabled={setShapeFillEnabled}
                  exportMimeType={exportMimeType}
                  setExportMimeType={setExportMimeType}
                  color={color}
                  setColor={setColor}
                  labelDraft={labelDraft}
                  setLabelDraft={selectedText ? updateSelectedText : setLabelDraft}
                  selectedText={selectedText}
                  onDeleteText={deleteSelectedText}
                  canvasMode={canvasMode}
                  setCanvasMode={setCanvasMode}
                  backgroundMode={backgroundMode}
                  setBackgroundMode={updateBackground}
                  showGrid={showGrid}
                  setShowGrid={(checked) => {
                    setShowGrid(checked);
                    setDirty(true);
                  }}
                  onUndo={handleUndo}
                  onRedo={handleRedo}
                  onClear={handleClear}
                  onPreview={handlePreview}
                  undoDisabled={undoStack.length === 0}
                  redoDisabled={redoStack.length === 0}
                />
              </div>

              <div className="order-1 flex min-h-[34rem] flex-col bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,.12),transparent_42%),#05070a] md:order-2 md:min-h-0">
                <div className="hidden shrink-0 justify-end gap-3 border-b border-white/10 bg-zinc-950/95 p-3 md:flex md:flex-wrap md:items-center">
                  <div className="flex shrink-0 flex-wrap items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleRemove}
                      disabled={!hasSketch}
                      aria-label={copy.remove}
                      className="min-h-11 min-w-32 rounded-xl border border-red-300/25 bg-red-400/5 px-4 py-3 text-center font-mono text-[10px] font-bold uppercase leading-4 tracking-[0.14em] text-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {copy.remove}
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving || openDisabled}
                      aria-label={copy.save}
                      className="min-h-11 min-w-36 rounded-xl border border-cyan-300/35 bg-cyan-300 px-4 py-3 text-center font-mono text-[10px] font-bold uppercase leading-4 tracking-[0.14em] text-zinc-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {saving ? "..." : copy.save}
                    </button>
                  </div>
                </div>
                <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-auto overscroll-contain p-3 sm:p-4 md:p-5">
                  <div className="mx-auto flex w-full max-w-[96rem] justify-center">
                    <div
                      className="relative inline-block max-w-full touch-none select-none align-top"
                      style={{ maxWidth: `${canvasSize.width}px` }}
                      onPointerMove={movePointer}
                      onPointerUp={endPointer}
                      onPointerCancel={endPointer}
                    >
                      <canvas
                        ref={canvasRef}
                        onPointerDown={beginPointer}
                        onPointerMove={movePointer}
                        onPointerUp={endPointer}
                        onPointerCancel={endPointer}
                        className="block h-auto max-h-[calc(100dvh-17rem)] w-auto max-w-full touch-none rounded-2xl border border-cyan-300/25 bg-black shadow-[0_0_32px_rgba(34,211,238,.14)] sm:max-h-[calc(100dvh-15rem)] md:max-h-[calc(100dvh-8.5rem)]"
                      />
                      {textLayers.map((label) => (
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
                            touchAction: "none",
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

                <div className="sticky bottom-0 grid gap-3 border-t border-white/10 bg-zinc-950/95 p-3 sm:grid-cols-2 sm:p-4 md:hidden">
                  <button
                    type="button"
                    onClick={handleRemove}
                    disabled={!hasSketch}
                    aria-label={copy.remove}
                    className="rounded-xl border border-red-300/25 bg-red-400/5 px-5 py-4 font-mono text-xs font-bold uppercase tracking-[0.16em] text-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {copy.remove}
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || openDisabled}
                    aria-label={copy.save}
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
  shapeFillEnabled,
  setShapeFillEnabled,
  exportMimeType,
  setExportMimeType,
  color,
  setColor,
  labelDraft,
  setLabelDraft,
  selectedText,
  onDeleteText,
  canvasMode,
  setCanvasMode,
  backgroundMode,
  setBackgroundMode,
  showGrid,
  setShowGrid,
  onUndo,
  onRedo,
  onClear,
  onPreview,
  undoDisabled,
  redoDisabled,
}) {
  const activeShapeTool = SHAPE_TOOLS.has(tool) ? tool : "";

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2 xl:grid-cols-3">
        <ToolButton active={tool === "brush"} onClick={() => setTool("brush")}>
          {copy.draw}
        </ToolButton>
        <ToolButton active={tool === "eraser"} onClick={() => setTool("eraser")}>
          {copy.eraser}
        </ToolButton>
        <ToolButton active={tool === "fill"} onClick={() => setTool("fill")}>
          {copy.fill}
        </ToolButton>
        <ToolButton active={tool === "text"} onClick={() => setTool("text")}>
          {copy.addText}
        </ToolButton>
        <ToolButton active={tool === "select"} onClick={() => setTool("select")}>
          {copy.selectText}
        </ToolButton>
      </div>

      <label className="block rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
        <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          {copy.geometric || copy.rectangle}
        </span>
        <select
          value={activeShapeTool}
          onChange={(event) => {
            if (event.target.value) setTool(event.target.value);
          }}
          className={[
            "w-full rounded-xl border px-3 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.12em] outline-none",
            activeShapeTool
              ? "border-cyan-300/40 bg-cyan-300 text-zinc-950"
              : "border-cyan-300/15 bg-black/40 text-cyan-50",
          ].join(" ")}
        >
          <option value="">{copy.geometric || copy.rectangle}</option>
          <option value="rectangle">{copy.rectangle}</option>
          <option value="ellipse">{copy.ellipse}</option>
          <option value="triangle">{copy.triangle}</option>
          <option value="line">{copy.line}</option>
        </select>
      </label>

      <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
        <ToolButton onClick={onUndo} disabled={undoDisabled}>
          {copy.undo}
        </ToolButton>
        <ToolButton onClick={onRedo} disabled={redoDisabled}>
          {copy.redo}
        </ToolButton>
        <ToolButton onClick={onPreview}>{copy.preview}</ToolButton>
        <ToolButton onClick={onClear} danger>
          {copy.clear}
        </ToolButton>
      </div>

      <label className="block">
        <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          {copy.frameThickness || copy.brushSize}
        </span>
        <input
          type="range"
          min="2"
          max="36"
          value={brushSize}
          onChange={(event) => setBrushSize(Number(event.target.value))}
          className="w-full accent-cyan-300"
        />
      </label>

      <SketchToggle
        checked={shapeFillEnabled}
        label={copy.shapeFill}
        onChange={setShapeFillEnabled}
      />

      <label className="block">
        <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          {copy.opacity}
        </span>
        <input
          type="range"
          min="0.15"
          max="1"
          step="0.05"
          value={opacity}
          onChange={(event) => setOpacity(Number(event.target.value))}
          className="w-full accent-fuchsia-300"
        />
      </label>

      <div>
        <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          {copy.color}
        </p>
        <div className="grid grid-cols-7 gap-2">
          {PALETTE.map((swatch) => (
            <button
              key={swatch}
              type="button"
              onClick={() => setColor(swatch)}
              className={[
                "h-7 rounded-full border transition",
                color === swatch ? "border-white ring-2 ring-cyan-300/50" : "border-white/20",
              ].join(" ")}
              style={{ backgroundColor: swatch }}
              aria-label={`${copy.color} ${swatch}`}
            />
          ))}
        </div>
      </div>

      <label className="block rounded-xl border border-fuchsia-300/15 bg-fuchsia-300/5 p-2.5">
        <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-fuchsia-100">
          {copy.labelText}
        </span>
        <input
          value={labelDraft}
          onChange={(event) => setLabelDraft(event.target.value)}
          className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2.5 font-mono text-sm text-cyan-50 outline-none"
        />
        <span className="mt-2 block text-xs leading-5 text-slate-300">
          {copy.placeText}
        </span>
        <button
          type="button"
          onClick={onDeleteText}
          disabled={!selectedText}
          className="mt-2 w-full rounded-xl border border-red-300/20 bg-red-400/5 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-red-100 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {copy.deleteText}
        </button>
      </label>

      <div className="grid grid-cols-1 gap-2 xl:grid-cols-3">
        <label className="block">
          <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            {copy.format}
          </span>
          <select
            value={exportMimeType}
            onChange={(event) => setExportMimeType(event.target.value)}
            className="w-full rounded-xl border border-cyan-300/15 bg-black/40 px-3 py-2.5 font-mono text-xs text-cyan-50 outline-none"
          >
            <option value="image/png">{copy.png}</option>
            <option value="image/webp">{copy.webp}</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            {copy.canvasSize}
          </span>
          <select
            value={canvasMode}
            onChange={(event) => setCanvasMode(event.target.value)}
            className="w-full rounded-xl border border-cyan-300/15 bg-black/40 px-3 py-2.5 font-mono text-xs text-cyan-50 outline-none"
          >
            {Object.keys(CANVAS_SIZES).map((mode) => (
              <option key={mode} value={mode}>
                {copy[mode]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            {copy.background}
          </span>
          <select
            value={backgroundMode}
            onChange={(event) => setBackgroundMode(event.target.value)}
            className="w-full rounded-xl border border-cyan-300/15 bg-black/40 px-3 py-2.5 font-mono text-xs text-cyan-50 outline-none"
          >
            <option value="dark">{copy.dark}</option>
            <option value="white">{copy.white}</option>
            <option value="transparent">{copy.transparent}</option>
          </select>
        </label>
      </div>

      <SketchToggle
        checked={showGrid}
        label={copy.showGrid}
        onChange={setShowGrid}
      />
    </div>
  );
}

function ToolButton({ active = false, danger = false, disabled = false, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={typeof children === "string" ? children : undefined}
      className={[
        "min-h-10 rounded-xl border px-2.5 py-2.5 font-mono text-[10px] font-bold uppercase leading-4 tracking-[0.14em] transition",
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

function SketchActionButton({ active = false, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={typeof children === "string" ? children : undefined}
      className={[
        "min-h-12 rounded-2xl border px-4 py-3 text-left text-sm font-semibold leading-snug transition",
        active
          ? "border-cyan-300/45 bg-cyan-300/20 text-cyan-50"
          : "border-white/10 bg-black/25 text-slate-300 hover:border-cyan-300/35 hover:text-cyan-50",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function SketchToggle({ checked, label, onChange }) {
  return (
    <label className="flex min-h-12 items-center justify-between gap-4 rounded-xl border border-white/10 bg-black/25 px-3 py-2.5">
      <span className="text-sm font-semibold leading-5 text-slate-200">
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

function normalizeLayerData(layerData) {
  if (!layerData || typeof layerData !== "object" || Array.isArray(layerData)) {
    return {
      version: LAYER_VERSION,
      width: CANVAS_SIZES.phone.width,
      height: CANVAS_SIZES.phone.height,
      backgroundMode: "dark",
      showGrid: true,
      layers: [],
    };
  }

  return {
    version: layerData.version || LAYER_VERSION,
    width: Number(layerData.width || CANVAS_SIZES.phone.width),
    height: Number(layerData.height || CANVAS_SIZES.phone.height),
    backgroundMode: ["dark", "white", "transparent"].includes(layerData.backgroundMode)
      ? layerData.backgroundMode
      : "dark",
    showGrid: layerData.showGrid !== false,
    layers: Array.isArray(layerData.layers)
      ? layerData.layers.map(normalizeLayer).filter(Boolean)
      : [],
  };
}

function normalizeLayer(layer) {
  if (!layer || typeof layer !== "object") return null;
  if (layer.type === "text") {
    const text = String(layer.text || "").trim().slice(0, 80);
    if (!text) return null;
    return {
      id: String(layer.id || createClientId()).slice(0, 120),
      type: "text",
      text,
      x: clamp(Number(layer.x || 0), 0, 2000),
      y: clamp(Number(layer.y || 0), 0, 2000),
      fontSize: clamp(Number(layer.fontSize || 24), 10, 80),
      color: normalizeHexColor(layer.color, "#e0faff"),
    };
  }

  if (layer.type === "fill") {
    return {
      id: String(layer.id || createClientId()).slice(0, 120),
      type: "fill",
      x: clamp(Number(layer.x || 0), 0, 2000),
      y: clamp(Number(layer.y || 0), 0, 2000),
      color: normalizeHexColor(layer.color, "#67e8f9"),
      opacity: clamp(Number(layer.opacity || 1), 0.05, 1),
      tolerance: clamp(Number(layer.tolerance || FILL_TOLERANCE), 0, 80),
    };
  }

  if (layer.type === "shape") {
    const shape = SHAPE_TOOLS.has(layer.shape) ? layer.shape : "rectangle";

    return {
      id: String(layer.id || createClientId()).slice(0, 120),
      type: "shape",
      shape,
      x1: clamp(Number(layer.x1 || 0), 0, 2000),
      y1: clamp(Number(layer.y1 || 0), 0, 2000),
      x2: clamp(Number(layer.x2 || 0), 0, 2000),
      y2: clamp(Number(layer.y2 || 0), 0, 2000),
      color: normalizeHexColor(layer.color, "#67e8f9"),
      strokeWidth: clamp(Number(layer.strokeWidth || layer.size || 4), 1, 80),
      opacity: clamp(Number(layer.opacity || 1), 0.05, 1),
      fillColor: shape !== "line" ? normalizeOptionalHexColor(layer.fillColor) : "",
      fillOpacity:
        shape !== "line" ? clamp(Number(layer.fillOpacity || 0), 0, 1) : 0,
    };
  }

  if (layer.type !== "stroke") return null;
  const points = Array.isArray(layer.points)
    ? layer.points
        .slice(0, MAX_STROKE_POINTS)
        .map((point) => ({
          x: clamp(Number(point?.x || 0), 0, 2000),
          y: clamp(Number(point?.y || 0), 0, 2000),
        }))
    : [];

  if (points.length === 0) return null;

  return {
    id: String(layer.id || createClientId()).slice(0, 120),
    type: "stroke",
    tool: layer.tool === "eraser" ? "eraser" : "brush",
    color: normalizeHexColor(layer.color, "#67e8f9"),
    size: clamp(Number(layer.size || 8), 1, 80),
    opacity: clamp(Number(layer.opacity || 1), 0.05, 1),
    points,
  };
}

function getCanvasModeFromLayerData(layerData) {
  const width = Number(layerData?.width || 0);
  const height = Number(layerData?.height || 0);
  const match = Object.entries(CANVAS_SIZES).find(
    ([, size]) => Math.abs(size.width - width) <= 4 && Math.abs(size.height - height) <= 4
  );

  return match?.[0] || "phone";
}

function getDefaultCanvasMode() {
  if (typeof window === "undefined") return "phone";
  return window.matchMedia("(min-width: 1024px)").matches ? "horizontal" : "phone";
}

function createStrokeLayer({ tool, color, size, opacity, points }) {
  return {
    id: createClientId(),
    type: "stroke",
    tool,
    color,
    size,
    opacity,
    points,
  };
}

function createTextLayer({ text, x, y, fontSize, color }) {
  return {
    id: createClientId(),
    type: "text",
    text: text.slice(0, 80),
    x,
    y,
    fontSize,
    color,
  };
}

function createFillLayer({ x, y, color, opacity, tolerance }) {
  return {
    id: createClientId(),
    type: "fill",
    x,
    y,
    color,
    opacity,
    tolerance,
  };
}

function createShapeLayer({
  shape,
  start,
  end,
  color,
  strokeWidth,
  opacity,
  fillColor,
  fillOpacity,
}) {
  return {
    id: createClientId(),
    type: "shape",
    shape,
    x1: start.x,
    y1: start.y,
    x2: end.x,
    y2: end.y,
    color,
    strokeWidth,
    opacity,
    fillColor,
    fillOpacity,
  };
}

function renderLayersToCanvas(options) {
  const canvas = document.createElement("canvas");
  canvas.width = options.canvasSize.width;
  canvas.height = options.canvasSize.height;
  const context = canvas.getContext("2d");
  drawLayers(context, {
    width: canvas.width,
    height: canvas.height,
    ...options,
  });
  return canvas;
}

function drawLayers(
  context,
  { width, height, layers, baseImage, backgroundMode, showGrid, includeText }
) {
  context.clearRect(0, 0, width, height);
  drawBackground(context, width, height, backgroundMode, showGrid);

  if (baseImage) {
    const fit = getContainedRect(baseImage.width, baseImage.height, width, height);
    context.drawImage(baseImage, fit.x, fit.y, fit.width, fit.height);
  }

  layers.forEach((layer) => {
    if (layer.type === "text") {
      if (includeText) drawTextLayer(context, layer);
      return;
    }

    if (layer.type === "fill") {
      drawFillLayer(context, layer, width, height);
      return;
    }

    if (layer.type === "shape") {
      drawShapeLayer(context, layer);
      return;
    }

    drawStrokeLayer(context, layer, backgroundMode);
  });
}

function drawBackground(context, width, height, backgroundMode, showGrid) {
  const color = BACKGROUND_COLORS[backgroundMode] || BACKGROUND_COLORS.dark;
  if (color !== "transparent") {
    context.fillStyle = color;
    context.fillRect(0, 0, width, height);
  }

  if (!showGrid) return;

  context.save();
  context.strokeStyle =
    backgroundMode === "white" ? "rgba(15,23,42,.10)" : "rgba(125,249,255,.10)";
  context.lineWidth = 1;
  for (let x = 0; x <= width; x += 40) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }
  for (let y = 0; y <= height; y += 40) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }
  context.restore();
}

function drawStrokeLayer(context, layer, backgroundMode) {
  const points = layer.points || [];
  if (points.length === 0) return;

  context.save();
  context.lineCap = "round";
  context.lineJoin = "round";
  context.lineWidth = layer.size;
  context.globalAlpha = layer.opacity;
  if (layer.tool === "eraser" && backgroundMode === "transparent") {
    context.globalCompositeOperation = "destination-out";
    context.strokeStyle = "#000000";
  } else {
    context.globalCompositeOperation = "source-over";
    context.strokeStyle =
      layer.tool === "eraser"
        ? backgroundMode === "white"
          ? BACKGROUND_COLORS.white
          : BACKGROUND_COLORS.dark
        : layer.color;
  }
  context.beginPath();
  context.moveTo(points[0].x, points[0].y);
  points.slice(1).forEach((point) => context.lineTo(point.x, point.y));
  if (points.length === 1) {
    context.lineTo(points[0].x + 0.01, points[0].y + 0.01);
  }
  context.stroke();
  context.restore();
}

function drawShapeLayer(context, layer) {
  const x = Math.min(layer.x1, layer.x2);
  const y = Math.min(layer.y1, layer.y2);
  const width = Math.abs(layer.x2 - layer.x1);
  const height = Math.abs(layer.y2 - layer.y1);

  context.save();
  context.lineCap = "round";
  context.lineJoin = "round";
  context.lineWidth = layer.strokeWidth;
  context.strokeStyle = layer.color;

  context.beginPath();
  if (layer.shape === "line") {
    context.moveTo(layer.x1, layer.y1);
    context.lineTo(layer.x2, layer.y2);
  } else if (layer.shape === "ellipse") {
    context.ellipse(
      x + width / 2,
      y + height / 2,
      Math.max(width / 2, 0.5),
      Math.max(height / 2, 0.5),
      0,
      0,
      Math.PI * 2
    );
  } else if (layer.shape === "triangle") {
    context.moveTo(layer.x1 + (layer.x2 - layer.x1) / 2, layer.y1);
    context.lineTo(layer.x2, layer.y2);
    context.lineTo(layer.x1, layer.y2);
    context.closePath();
  } else {
    context.rect(x, y, Math.max(width, 0.5), Math.max(height, 0.5));
  }

  if (layer.fillColor && layer.shape !== "line") {
    context.save();
    context.globalAlpha = layer.fillOpacity;
    context.fillStyle = layer.fillColor;
    context.fill();
    context.restore();
  }

  context.globalAlpha = layer.opacity;
  context.stroke();
  context.restore();
}

function drawFillLayer(context, layer, width, height) {
  const canvas = context.canvas;
  const pixelWidth = canvas.width;
  const pixelHeight = canvas.height;

  if (!pixelWidth || !pixelHeight) return;

  const seedX = clamp(
    Math.round((Number(layer.x || 0) / width) * pixelWidth),
    0,
    pixelWidth - 1
  );
  const seedY = clamp(
    Math.round((Number(layer.y || 0) / height) * pixelHeight),
    0,
    pixelHeight - 1
  );
  const fillColor = hexToRgb(layer.color || "#67e8f9");
  const imageData = context.getImageData(0, 0, pixelWidth, pixelHeight);

  applyFloodFill(imageData, seedX, seedY, {
    ...fillColor,
    opacity: clamp(Number(layer.opacity || 1), 0.05, 1),
    tolerance: clamp(Number(layer.tolerance || FILL_TOLERANCE), 0, 80),
  });
  context.putImageData(imageData, 0, 0);
}

function applyFloodFill(imageData, startX, startY, fill) {
  const { data, width, height } = imageData;
  const startIndex = (startY * width + startX) * 4;
  const target = {
    r: data[startIndex],
    g: data[startIndex + 1],
    b: data[startIndex + 2],
    a: data[startIndex + 3],
  };

  if (colorsWithinTolerance(target, { ...fill, a: 255 }, fill.tolerance)) return;

  const stack = [[startX, startY]];

  while (stack.length > 0) {
    const [x, y] = stack.pop();
    if (x < 0 || y < 0 || x >= width || y >= height) continue;

    const index = (y * width + x) * 4;
    const current = {
      r: data[index],
      g: data[index + 1],
      b: data[index + 2],
      a: data[index + 3],
    };

    if (!colorsWithinTolerance(current, target, fill.tolerance)) continue;

    data[index] = Math.round(fill.r * fill.opacity + current.r * (1 - fill.opacity));
    data[index + 1] = Math.round(fill.g * fill.opacity + current.g * (1 - fill.opacity));
    data[index + 2] = Math.round(fill.b * fill.opacity + current.b * (1 - fill.opacity));
    data[index + 3] = Math.max(current.a, Math.round(255 * fill.opacity));

    stack.push([x + 1, y]);
    stack.push([x - 1, y]);
    stack.push([x, y + 1]);
    stack.push([x, y - 1]);
  }
}

function colorsWithinTolerance(a, b, tolerance) {
  return (
    Math.abs(a.r - b.r) <= tolerance &&
    Math.abs(a.g - b.g) <= tolerance &&
    Math.abs(a.b - b.b) <= tolerance &&
    Math.abs(a.a - b.a) <= tolerance
  );
}

function drawTextLayer(context, label) {
  context.save();
  context.font = `${Math.max(10, Number(label.fontSize || 24))}px ui-monospace, SFMono-Regular, Menlo, monospace`;
  context.fillStyle = label.color || "#e0faff";
  context.shadowColor = "rgba(0,0,0,.85)";
  context.shadowBlur = 8;
  context.fillText(label.text, Number(label.x || 0), Number(label.y || 0));
  context.restore();
}

function findTextLayerAtPoint(layers, point) {
  return [...layers]
    .reverse()
    .find((layer) => {
      if (layer.type !== "text") return false;
      const width = Math.max(40, String(layer.text || "").length * layer.fontSize * 0.62);
      const height = layer.fontSize * 1.4;
      return (
        point.x >= layer.x - 12 &&
        point.x <= layer.x + width + 12 &&
        point.y >= layer.y - height &&
        point.y <= layer.y + 12
      );
    });
}

function normalizeLayersForStorage(layers) {
  return layers.map(normalizeLayer).filter(Boolean);
}

function cloneLayers(layers) {
  return JSON.parse(JSON.stringify(layers || []));
}

function shouldAddPoint(previous, next) {
  if (!previous) return true;
  const distance = Math.hypot(previous.x - next.x, previous.y - next.y);
  return distance >= 1.5;
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

function normalizeHexColor(value, fallback) {
  return /^#[0-9a-f]{6}$/i.test(String(value || "")) ? String(value) : fallback;
}

function normalizeOptionalHexColor(value) {
  return /^#[0-9a-f]{6}$/i.test(String(value || "")) ? String(value) : "";
}

function hexToRgb(value) {
  const normalized = normalizeHexColor(value, "#67e8f9").slice(1);

  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
}

function clamp(value, min, max) {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
}

function createClientId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
