export const TAG_CATEGORY_ORDER = [
  "Environment",
  "Entities",
  "Anomalies",
  "Emotions",
  "Styles",
  "Eras",
  "Weather",
  "Dream Types",
  "Perspective",
  "Custom",
  "Content",
];

export const TAG_CATEGORY_LABELS = {
  en: {
    All: "All categories",
    Environment: "Environment",
    Entities: "Entities",
    Anomalies: "Anomalies",
    Emotions: "Emotions",
    Styles: "Styles / vibes",
    Eras: "Era",
    Weather: "Weather",
    "Dream Types": "Dream types",
    Perspective: "Point of view",
    Custom: "Custom",
    Content: "Content safety",
  },
  zh: {
    All: "全部類別",
    Environment: "環境",
    Entities: "實體",
    Anomalies: "異常",
    Emotions: "情緒",
    Styles: "風格／氛圍",
    Eras: "時代",
    Weather: "天氣",
    "Dream Types": "夢境類型",
    Perspective: "視角",
    Custom: "自訂",
    Content: "內容安全",
  },
  es: {
    All: "Todas las categorías",
    Environment: "Entorno",
    Entities: "Entidades",
    Anomalies: "Anomalías",
    Emotions: "Emociones",
    Styles: "Estilos / vibra",
    Eras: "Época",
    Weather: "Clima",
    "Dream Types": "Tipos de sueño",
    Perspective: "Punto de vista",
    Custom: "Personalizadas",
    Content: "Seguridad",
  },
};

export const RECORD_TAGS = {
  "cyberpunk-city": tag("environment-cyberpunk-city", "Environment", "Cyberpunk City", "賽博龐克城市", "Ciudad cyberpunk"),
  "endless-water": tag("environment-endless-water", "Environment", "Endless Water", "無盡水域", "Aguas infinitas"),
  "non-human": tag("entity-non-human", "Entities", "Non-human", "非人類", "No humano"),
  "gravity-reversal": tag("anomaly-gravity-reversal", "Anomalies", "Gravity Reversal", "重力反轉", "Inversión de gravedad"),
  "time-stop": tag("anomaly-time-stop", "Anomalies", "Time Stop", "時間停止", "Tiempo detenido"),
  "adult-content": tag("content-adult-content", "Content", "Adult content", "成人內容", "Contenido adulto"),

  awe: tag("emotion-awe", "Emotions", "Awe", "敬畏", "Asombro"),
  fear: tag("emotion-fear", "Emotions", "Fear", "恐懼", "Miedo"),
  calm: tag("emotion-calm", "Emotions", "Calm", "平靜", "Calma"),
  grief: tag("emotion-grief", "Emotions", "Grief", "悲傷", "Duelo"),
  desire: tag("emotion-desire", "Emotions", "Desire", "渴望", "Deseo"),
  confusion: tag("emotion-confusion", "Emotions", "Confusion", "困惑", "Confusión"),
  joy: tag("emotion-joy", "Emotions", "Joy", "喜悅", "Alegría"),
  anxiety: tag("emotion-anxiety", "Emotions", "Anxiety", "焦慮", "Ansiedad"),
  shame: tag("emotion-shame", "Emotions", "Shame", "羞恥", "Vergüenza"),
  anger: tag("emotion-anger", "Emotions", "Anger", "憤怒", "Ira"),
  sadness: tag("emotion-sadness", "Emotions", "Sadness", "悲哀", "Tristeza"),
  loneliness: tag("emotion-loneliness", "Emotions", "Loneliness", "孤獨", "Soledad"),
  nostalgia: tag("emotion-nostalgia", "Emotions", "Nostalgia", "懷舊", "Nostalgia"),
  love: tag("emotion-love", "Emotions", "Love", "愛", "Amor"),
  surprise: tag("emotion-surprise", "Emotions", "Surprise", "驚訝", "Sorpresa"),
  disgust: tag("emotion-disgust", "Emotions", "Disgust", "厭惡", "Asco"),
  relief: tag("emotion-relief", "Emotions", "Relief", "釋然", "Alivio"),
  wonder: tag("emotion-wonder", "Emotions", "Wonder", "驚奇", "Maravilla"),
  guilt: tag("emotion-guilt", "Emotions", "Guilt", "罪惡感", "Culpa"),
  curiosity: tag("emotion-curiosity", "Emotions", "Curiosity", "好奇", "Curiosidad"),
  dread: tag("emotion-dread", "Emotions", "Dread", "恐慌預感", "Pavor"),
  peace: tag("emotion-peace", "Emotions", "Peace", "安寧", "Paz"),
  excitement: tag("emotion-excitement", "Emotions", "Excitement", "興奮", "Entusiasmo"),
  embarrassment: tag("emotion-embarrassment", "Emotions", "Embarrassment", "尷尬", "Bochorno"),
  helplessness: tag("emotion-helplessness", "Emotions", "Helplessness", "無助", "Impotencia"),

  "american-comics": tag("style-american-comics", "Styles", "American comics", "美式漫畫", "Cómic americano"),
  realistic: tag("style-realistic", "Styles", "Realistic", "寫實", "Realista"),
  fantasy: tag("style-fantasy", "Styles", "Fantasy", "奇幻", "Fantasía"),
  cartoon: tag("style-cartoon", "Styles", "Cartoon", "卡通", "Dibujo animado"),
  anime: tag("style-anime", "Styles", "Anime", "動畫", "Anime"),
  "film-noir": tag("style-film-noir", "Styles", "Film noir", "黑色電影", "Cine negro"),
  surrealism: tag("style-surrealism", "Styles", "Surrealism", "超現實", "Surrealismo"),
  "pixel-art": tag("style-pixel-art", "Styles", "Pixel art", "像素風", "Pixel art"),
  watercolor: tag("style-watercolor", "Styles", "Watercolor", "水彩", "Acuarela"),
  glitch: tag("style-glitch", "Styles", "Glitch", "故障感", "Glitch"),
  horror: tag("style-horror", "Styles", "Horror", "恐怖", "Terror"),
  documentary: tag("style-documentary", "Styles", "Documentary", "紀錄片感", "Documental"),

  ancient: tag("era-ancient", "Eras", "Ancient", "古代", "Antigua"),
  medieval: tag("era-medieval", "Eras", "Medieval", "中世紀", "Medieval"),
  "early-modern": tag("era-early-modern", "Eras", "Early modern", "近代早期", "Edad moderna temprana"),
  industrial: tag("era-industrial", "Eras", "Industrial", "工業時代", "Industrial"),
  modern: tag("era-modern", "Eras", "Modern", "現代", "Moderna"),
  retro: tag("era-retro", "Eras", "Retro", "復古", "Retro"),
  future: tag("era-future", "Eras", "Future", "未來", "Futuro"),
  "post-apocalyptic": tag("era-post-apocalyptic", "Eras", "Post-apocalyptic", "末日後", "Postapocalíptica"),
  timeless: tag("era-timeless", "Eras", "Timeless", "無時代感", "Fuera del tiempo"),
  "childhood-era": tag("era-childhood-era", "Eras", "Childhood era", "童年時期", "Época de infancia"),

  sunny: tag("weather-sunny", "Weather", "Sunny", "晴天", "Soleado"),
  rain: tag("weather-rain", "Weather", "Rain", "雨", "Lluvia"),
  storm: tag("weather-storm", "Weather", "Storm", "暴風雨", "Tormenta"),
  snow: tag("weather-snow", "Weather", "Snow", "雪", "Nieve"),
  fog: tag("weather-fog", "Weather", "Fog", "霧", "Niebla"),
  wind: tag("weather-wind", "Weather", "Wind", "風", "Viento"),
  humid: tag("weather-humid", "Weather", "Humid", "潮濕", "Húmedo"),
  heat: tag("weather-heat", "Weather", "Heat", "炎熱", "Calor"),
  cold: tag("weather-cold", "Weather", "Cold", "寒冷", "Frío"),
  "night-sky": tag("weather-night-sky", "Weather", "Night sky", "夜空", "Cielo nocturno"),
  eclipse: tag("weather-eclipse", "Weather", "Eclipse", "日月食", "Eclipse"),

  lucid: tag("dream-type-lucid", "Dream Types", "Lucid", "清醒夢", "Lúcido"),
  recurring: tag("dream-type-recurring", "Dream Types", "Recurring", "重複夢", "Recurrente"),
  nightmare: tag("dream-type-nightmare", "Dream Types", "Nightmare", "惡夢", "Pesadilla"),
  "false-awakening": tag("dream-type-false-awakening", "Dream Types", "False awakening", "假醒", "Falso despertar"),
  "sleep-paralysis": tag("dream-type-sleep-paralysis", "Dream Types", "Sleep paralysis", "睡眠癱瘓", "Parálisis del sueño"),
  flying: tag("dream-type-flying", "Dream Types", "Flying", "飛行", "Volar"),
  falling: tag("dream-type-falling", "Dream Types", "Falling", "墜落", "Caída"),
  chase: tag("dream-type-chase", "Dream Types", "Chase", "追逐", "Persecución"),
  exam: tag("dream-type-exam", "Dream Types", "Exam", "考試", "Examen"),
  lost: tag("dream-type-lost", "Dream Types", "Lost", "迷路", "Perdido"),
  visitation: tag("dream-type-visitation", "Dream Types", "Visitation", "來訪", "Visitación"),
  "prophetic-feeling": tag("dream-type-prophetic-feeling", "Dream Types", "Prophetic feeling", "預知感", "Sensación profética"),
  "body-transformation": tag("dream-type-body-transformation", "Dream Types", "Body transformation", "身體變形", "Transformación corporal"),
  "impossible-space": tag("dream-type-impossible-space", "Dream Types", "Impossible space", "不可能空間", "Espacio imposible"),

  "first-person": tag("perspective-first-person", "Perspective", "First person", "第一人稱", "Primera persona"),
  "second-person": tag("perspective-second-person", "Perspective", "Second person", "第二人稱", "Segunda persona"),
  "third-person": tag("perspective-third-person", "Perspective", "Third person", "第三人稱", "Tercera persona"),
  "shifting-perspective": tag("perspective-shifting-perspective", "Perspective", "Shifting perspective", "視角轉換", "Perspectiva cambiante"),
  "observer-view": tag("perspective-observer-view", "Perspective", "Observer view", "旁觀視角", "Vista de observador"),
  "out-of-body": tag("perspective-out-of-body", "Perspective", "Out of body", "離體視角", "Fuera del cuerpo"),
};

export const RECORDER_TAG_GROUPS = [
  { category: "Emotions", slugs: ["awe", "fear", "calm", "grief", "desire", "confusion", "joy", "anxiety", "shame", "anger", "sadness", "loneliness", "nostalgia", "love", "surprise", "disgust", "relief", "wonder", "guilt", "curiosity", "dread", "peace", "excitement", "embarrassment", "helplessness"] },
  { category: "Styles", slugs: ["american-comics", "realistic", "fantasy", "cartoon", "anime", "film-noir", "surrealism", "pixel-art", "watercolor", "glitch", "horror", "documentary"] },
  { category: "Eras", slugs: ["ancient", "medieval", "early-modern", "industrial", "modern", "retro", "future", "post-apocalyptic", "timeless", "childhood-era"] },
  { category: "Weather", slugs: ["sunny", "rain", "storm", "snow", "fog", "wind", "humid", "heat", "cold", "night-sky", "eclipse"] },
  { category: "Dream Types", slugs: ["lucid", "recurring", "nightmare", "false-awakening", "sleep-paralysis", "flying", "falling", "chase", "exam", "lost", "visitation", "prophetic-feeling", "body-transformation", "impossible-space"] },
  { category: "Perspective", slugs: ["first-person", "second-person", "third-person", "shifting-perspective", "observer-view", "out-of-body"] },
];

export function getCategoryLabel(category, language = "en") {
  return TAG_CATEGORY_LABELS[language]?.[category] || TAG_CATEGORY_LABELS.en[category] || category;
}

export function getTagLabel(tagOrSlug, language = "en") {
  const tagData = typeof tagOrSlug === "string" ? RECORD_TAGS[tagOrSlug] : tagOrSlug;

  if (!tagData) return tagOrSlug || "";
  if (language === "zh") return tagData.name_zh || tagData.nameZh || tagData.name;
  if (language === "es") return tagData.name_es || tagData.nameEs || tagData.name;

  return tagData.name;
}

export function buildRecordTags(selectedTagSlugs = [], customTagLabels = [], adultContent = false) {
  const slugs = new Set(
    selectedTagSlugs.filter((slug) => RECORD_TAGS[slug]).map((slug) => String(slug))
  );

  if (adultContent) {
    slugs.add("adult-content");
  }

  const builtInTags = [...slugs].map((slug) => RECORD_TAGS[slug]).filter(Boolean);
  const existingNames = new Set(
    builtInTags.flatMap((item) => [
      item.slug,
      normalizeTagName(item.name),
      normalizeTagName(item.name_zh),
      normalizeTagName(item.name_es),
    ])
  );
  const customTags = [];

  customTagLabels.forEach((label) => {
    const normalizedLabel = normalizeCustomTagLabel(label);
    const normalizedKey = normalizeTagName(normalizedLabel);
    const slug = makeCustomTagSlug(normalizedLabel);

    if (!normalizedLabel || existingNames.has(normalizedKey) || slugs.has(slug)) return;

    existingNames.add(normalizedKey);
    slugs.add(slug);
    customTags.push({
      id: `custom-${slug}`,
      category: "Custom",
      name: normalizedLabel,
      name_zh: normalizedLabel,
      name_es: normalizedLabel,
      slug,
      custom: true,
    });
  });

  return [...builtInTags, ...customTags];
}

export function getTagSlugsByCategory(tags = [], category) {
  return tags.filter((tagData) => tagData.category === category).map((tagData) => tagData.slug);
}

export function normalizeCustomTagLabel(value) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, 40);
}

export function tagExists(labelOrSlug, selectedCustomLabels = []) {
  const normalized = normalizeTagName(labelOrSlug);

  return (
    Boolean(RECORD_TAGS[makeCustomTagSlug(labelOrSlug)]) ||
    Object.values(RECORD_TAGS).some((tagData) =>
      [tagData.slug, tagData.name, tagData.name_zh, tagData.name_es]
        .map(normalizeTagName)
        .includes(normalized)
    ) ||
    selectedCustomLabels.some((label) => normalizeTagName(label) === normalized)
  );
}

function tag(id, category, name, nameZh, nameEs) {
  return {
    id,
    category,
    name,
    name_zh: nameZh,
    name_es: nameEs,
    slug: id.replace(/^(emotion|style|era|weather|dream-type|perspective|environment|entity|anomaly|content)-/, ""),
  };
}

function normalizeTagName(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, "-");
}

function makeCustomTagSlug(value) {
  return normalizeTagName(value)
    .replace(/[^a-z0-9\u4e00-\u9fff-]+/gi, "")
    .replace(/^-+|-+$/g, "");
}
