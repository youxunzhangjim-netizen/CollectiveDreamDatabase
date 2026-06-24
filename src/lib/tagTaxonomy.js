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
  "Psychological Observables",
  "Dream Analysis",
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
    "Psychological Observables": "Psychological observables",
    "Dream Analysis": "Dream analysis",
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
    "Psychological Observables": "心理觀察項",
    "Dream Analysis": "夢境分析觀察項",
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
    "Psychological Observables": "Observables psicológicos",
    "Dream Analysis": "Análisis del sueño",
    Custom: "Personalizadas",
    Content: "Seguridad",
  },
};

export const RECORD_TAGS = {
  "cyberpunk-city": tag("environment-cyberpunk-city", "Environment", "Cyberpunk City", "賽博龐克城市", "Ciudad cyberpunk"),
  "endless-water": tag("environment-endless-water", "Environment", "Endless Water", "無盡水域", "Aguas infinitas"),
  school: tag("environment-school", "Environment", "School", "學校", "Escuela"),
  ocean: tag("environment-ocean", "Environment", "Ocean", "海洋", "Océano"),
  "giant-architecture": tag("environment-giant-architecture", "Environment", "Giant Architecture", "巨大建築", "Arquitectura gigante"),
  "non-human": tag("entity-non-human", "Entities", "Non-human", "非人類", "No humano"),
  family: tag("entity-family", "Entities", "Family", "家人", "Familia"),
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
  overcast: tag("weather-overcast", "Weather", "Overcast", "陰天", "Cielo cubierto"),
  cloudy: tag("weather-cloudy", "Weather", "Cloudy", "多雲", "Nublado"),
  rain: tag("weather-rain", "Weather", "Rain", "雨", "Lluvia"),
  drizzle: tag("weather-drizzle", "Weather", "Drizzle", "毛毛雨", "Llovizna"),
  storm: tag("weather-storm", "Weather", "Storm", "暴風雨", "Tormenta"),
  thunder: tag("weather-thunder", "Weather", "Thunder", "雷聲", "Trueno"),
  lightning: tag("weather-lightning", "Weather", "Lightning", "閃電", "Relámpago"),
  typhoon: tag("weather-typhoon", "Weather", "Typhoon", "颱風", "Tifón"),
  snow: tag("weather-snow", "Weather", "Snow", "雪", "Nieve"),
  fog: tag("weather-fog", "Weather", "Fog", "霧", "Niebla"),
  haze: tag("weather-haze", "Weather", "Haze", "霾", "Calima"),
  mist: tag("weather-mist", "Weather", "Mist", "薄霧", "Neblina"),
  hail: tag("weather-hail", "Weather", "Hail", "冰雹", "Granizo"),
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
  superpowers: tag("dream-type-superpowers", "Dream Types", "Superpowers", "超能力", "Superpoderes"),
  chase: tag("dream-type-chase", "Dream Types", "Chase / Pursuit", "逃亡／追逐", "Huida / persecución"),
  exam: tag("dream-type-exam", "Dream Types", "Exam", "考試", "Examen"),
  lost: tag("dream-type-lost", "Dream Types", "Lost", "迷路", "Perdido"),
  visitation: tag("dream-type-visitation", "Dream Types", "Visitation", "來訪", "Visitación"),
  "prophetic-feeling": tag("dream-type-prophetic-feeling", "Dream Types", "Prophetic feeling", "預知感", "Sensación profética"),
  "body-transformation": tag("dream-type-body-transformation", "Dream Types", "Body transformation", "身體變形", "Transformación corporal"),
  "impossible-space": tag("dream-type-impossible-space", "Dream Types", "Impossible space", "不可能空間", "Espacio imposible"),
  disaster: tag("dream-type-disaster", "Dream Types", "Disaster", "災難", "Desastre"),
  "war-conflict": tag("dream-type-war-conflict", "Dream Types", "War / Conflict", "戰爭", "Guerra / conflicto"),
  romance: tag("dream-type-romance", "Dream Types", "Romance", "戀愛", "Romance"),
  "sexual-dream": tag("dream-type-sexual-dream", "Dream Types", "Sexual dream", "性夢", "Sueño sexual"),
  "daily-life": tag("dream-type-daily-life", "Dream Types", "Daily life", "日常生活", "Vida cotidiana"),

  "first-person": tag("perspective-first-person", "Perspective", "First person", "第一人稱", "Primera persona"),
  "second-person": tag("perspective-second-person", "Perspective", "Second person", "第二人稱", "Segunda persona"),
  "third-person": tag("perspective-third-person", "Perspective", "Third person", "第三人稱", "Tercera persona"),
  "shifting-perspective": tag("perspective-shifting-perspective", "Perspective", "Shifting perspective", "視角轉換", "Perspectiva cambiante"),
  "observer-view": tag("perspective-observer-view", "Perspective", "Observer view", "旁觀視角", "Vista de observador"),
  "out-of-body": tag("perspective-out-of-body", "Perspective", "Out of body", "離體視角", "Fuera del cuerpo"),

  "psychology-agency": tag("psychology-agency", "Psychological Observables", "Agency", "行動主導感", "Agencia"),
  "psychology-control-loss": tag("psychology-control-loss", "Psychological Observables", "Loss of control", "失控感", "Pérdida de control"),
  "psychology-vulnerability": tag("psychology-vulnerability", "Psychological Observables", "Vulnerability", "脆弱感", "Vulnerabilidad"),
  "psychology-conflict": tag("psychology-conflict", "Psychological Observables", "Conflict", "衝突", "Conflicto"),
  "psychology-intimacy": tag("psychology-intimacy", "Psychological Observables", "Intimacy", "親密感", "Intimidad"),
  "psychology-separation": tag("psychology-separation", "Psychological Observables", "Separation", "分離", "Separación"),
  "psychology-social-judgment": tag("psychology-social-judgment", "Psychological Observables", "Social judgment", "社會評價感", "Juicio social"),
  "psychology-responsibility": tag("psychology-responsibility", "Psychological Observables", "Responsibility", "責任感", "Responsabilidad"),
  "psychology-protection": tag("psychology-protection", "Psychological Observables", "Protection", "保護", "Protección"),
  "psychology-avoidance": tag("psychology-avoidance", "Psychological Observables", "Avoidance", "迴避", "Evitación"),
  "psychology-reunion": tag("psychology-reunion", "Psychological Observables", "Reunion", "重逢", "Reencuentro"),
  "psychology-identity-question": tag("psychology-identity-question", "Psychological Observables", "Identity question", "身分疑問", "Pregunta de identidad"),
  "psychology-boundary-crossing": tag("psychology-boundary-crossing", "Psychological Observables", "Boundary crossing", "界線跨越", "Cruce de límites"),
  "psychology-trust-mistrust": tag("psychology-trust-mistrust", "Psychological Observables", "Trust / mistrust", "信任／不信任", "Confianza / desconfianza"),
  "psychology-power-difference": tag("psychology-power-difference", "Psychological Observables", "Power difference", "權力差異", "Diferencia de poder"),

  "analysis-memory-fragment": tag("analysis-memory-fragment", "Dream Analysis", "Memory fragment", "記憶碎片", "Fragmento de memoria"),
  "analysis-scene-shift": tag("analysis-scene-shift", "Dream Analysis", "Scene shift", "場景轉換", "Cambio de escena"),
  "analysis-time-distortion": tag("analysis-time-distortion", "Dream Analysis", "Time distortion", "時間扭曲", "Distorsión temporal"),
  "analysis-impossible-logic": tag("analysis-impossible-logic", "Dream Analysis", "Impossible logic", "不可能邏輯", "Lógica imposible"),
  "analysis-symbolic-object": tag("analysis-symbolic-object", "Dream Analysis", "Symbolic object", "象徵物件", "Objeto simbólico"),
  "analysis-repeated-symbol": tag("analysis-repeated-symbol", "Dream Analysis", "Repeated symbol", "重複象徵", "Símbolo repetido"),
  "analysis-threshold-door": tag("analysis-threshold-door", "Dream Analysis", "Threshold / door", "門檻／門", "Umbral / puerta"),
  "analysis-mirror": tag("analysis-mirror", "Dream Analysis", "Mirror", "鏡子", "Espejo"),
  "analysis-double-self": tag("analysis-double-self", "Dream Analysis", "Double self", "另一個自己", "Doble yo"),
  "analysis-familiar-place-changed": tag("analysis-familiar-place-changed", "Dream Analysis", "Familiar place changed", "熟悉地點變形", "Lugar familiar cambiado"),
  "analysis-language-speech": tag("analysis-language-speech", "Dream Analysis", "Language / speech", "語言／說話", "Lenguaje / habla"),
  "analysis-body-sensation": tag("analysis-body-sensation", "Dream Analysis", "Body sensation", "身體感覺", "Sensación corporal"),
  "analysis-sound-focus": tag("analysis-sound-focus", "Dream Analysis", "Sound focus", "聲音焦點", "Foco sonoro"),
  "analysis-color-focus": tag("analysis-color-focus", "Dream Analysis", "Color focus", "顏色焦點", "Foco de color"),
  "analysis-number-symbol": tag("analysis-number-symbol", "Dream Analysis", "Number / symbol", "數字／符號", "Número / símbolo"),
  "analysis-map-coordinate": tag("analysis-map-coordinate", "Dream Analysis", "Map / coordinate", "地圖／座標", "Mapa / coordenada"),
  "analysis-ritual": tag("analysis-ritual", "Dream Analysis", "Ritual", "儀式", "Ritual"),
  "analysis-message-received": tag("analysis-message-received", "Dream Analysis", "Message received", "收到訊息", "Mensaje recibido"),
  "analysis-choice-point": tag("analysis-choice-point", "Dream Analysis", "Choice point", "選擇點", "Punto de elección"),
};

export const RECORDER_TAG_GROUPS = [
  { category: "Environment", slugs: ["cyberpunk-city", "endless-water", "school", "ocean", "giant-architecture"] },
  { category: "Entities", slugs: ["non-human", "family"] },
  { category: "Anomalies", slugs: ["gravity-reversal", "time-stop"] },
  { category: "Emotions", slugs: ["awe", "fear", "calm", "grief", "desire", "confusion", "joy", "anxiety", "shame", "anger", "sadness", "loneliness", "nostalgia", "love", "surprise", "disgust", "relief", "wonder", "guilt", "curiosity", "dread", "peace", "excitement", "embarrassment", "helplessness"] },
  { category: "Styles", slugs: ["american-comics", "realistic", "fantasy", "cartoon", "anime", "film-noir", "surrealism", "pixel-art", "watercolor", "glitch", "horror", "documentary"] },
  { category: "Eras", slugs: ["ancient", "medieval", "early-modern", "industrial", "modern", "retro", "future", "post-apocalyptic", "timeless", "childhood-era"] },
  { category: "Weather", slugs: ["sunny", "overcast", "cloudy", "rain", "drizzle", "storm", "thunder", "lightning", "typhoon", "snow", "fog", "haze", "mist", "hail", "wind", "humid", "heat", "cold", "night-sky", "eclipse"] },
  { category: "Dream Types", slugs: ["lucid", "recurring", "nightmare", "false-awakening", "sleep-paralysis", "flying", "falling", "superpowers", "chase", "exam", "lost", "visitation", "prophetic-feeling", "body-transformation", "impossible-space", "disaster", "war-conflict", "romance", "sexual-dream", "daily-life"] },
  { category: "Perspective", slugs: ["first-person", "second-person", "third-person", "shifting-perspective", "observer-view", "out-of-body"] },
  { category: "Psychological Observables", slugs: ["psychology-agency", "psychology-control-loss", "psychology-vulnerability", "psychology-conflict", "psychology-intimacy", "psychology-separation", "psychology-social-judgment", "psychology-responsibility", "psychology-protection", "psychology-avoidance", "psychology-reunion", "psychology-identity-question", "psychology-boundary-crossing", "psychology-trust-mistrust", "psychology-power-difference"] },
  { category: "Dream Analysis", slugs: ["analysis-memory-fragment", "analysis-scene-shift", "analysis-time-distortion", "analysis-impossible-logic", "analysis-symbolic-object", "analysis-repeated-symbol", "analysis-threshold-door", "analysis-mirror", "analysis-double-self", "analysis-familiar-place-changed", "analysis-language-speech", "analysis-body-sensation", "analysis-sound-focus", "analysis-color-focus", "analysis-number-symbol", "analysis-map-coordinate", "analysis-ritual", "analysis-message-received", "analysis-choice-point"] },
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

export function buildRecordTags(selectedTagSlugs = [], customTagEntries = [], adultContent = false) {
  const slugs = new Set(
    selectedTagSlugs.filter((slug) => RECORD_TAGS[slug]).map((slug) => String(slug))
  );

  if (adultContent) {
    slugs.add("adult-content");
  }

  const builtInTags = [...slugs].map((slug) => RECORD_TAGS[slug]).filter(Boolean);
  const existingNames = new Set(
    Object.values(RECORD_TAGS).flatMap((item) => [
      item.slug,
      normalizeTagName(item.name),
      normalizeTagName(item.name_zh),
      normalizeTagName(item.name_es),
    ])
  );
  const customTags = [];

  customTagEntries.forEach((entry) => {
    const normalizedEntry = normalizeCustomTagEntry(entry);
    const normalizedLabel = normalizedEntry.label;
    const normalizedKey = normalizeTagName(normalizedLabel);
    const categoryPrefix = makeCustomTagSlug(normalizedEntry.category);
    const baseSlug = makeCustomTagSlug(normalizedLabel);
    const slug = `${categoryPrefix}-${baseSlug}`;

    if (!normalizedLabel || existingNames.has(normalizedKey) || slugs.has(slug)) return;

    existingNames.add(normalizedKey);
    slugs.add(slug);
    customTags.push({
      id: `custom-${slug}`,
      category: normalizedEntry.category,
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

export function normalizeCustomTagEntry(entry) {
  if (typeof entry === "string") {
    return {
      label: normalizeCustomTagLabel(entry),
      category: "Custom",
    };
  }

  const category = TAG_CATEGORY_ORDER.includes(entry?.category)
    ? entry.category
    : "Custom";

  return {
    label: normalizeCustomTagLabel(entry?.label),
    category,
  };
}

export function tagExists(labelOrSlug, selectedCustomEntries = []) {
  const normalized = normalizeTagName(labelOrSlug);

  return (
    Boolean(RECORD_TAGS[makeCustomTagSlug(labelOrSlug)]) ||
    Object.values(RECORD_TAGS).some((tagData) =>
      [tagData.slug, tagData.name, tagData.name_zh, tagData.name_es]
        .map(normalizeTagName)
        .includes(normalized)
    ) ||
    selectedCustomEntries.some((entry) => {
      const normalizedEntry = normalizeCustomTagEntry(entry);
      return normalizeTagName(normalizedEntry.label) === normalized;
    })
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
