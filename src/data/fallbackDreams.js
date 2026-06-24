export const TAG_TRANSLATIONS = {
  "cyberpunk-city": {
    zh: "賽博龐克城市",
    es: "Ciudad cyberpunk",
  },
  "endless-water": {
    zh: "水域",
    es: "Área de agua",
  },
  "non-human": {
    zh: "非人類",
    es: "No humano",
  },
  "gravity-reversal": {
    zh: "重力反轉",
    es: "Inversión de gravedad",
  },
  "time-stop": {
    zh: "時間停止",
    es: "Tiempo detenido",
  },
  "adult-content": {
    zh: "成人內容",
    es: "Contenido adulto",
  },
  awe: {
    zh: "敬畏",
    es: "Asombro",
  },
  fear: {
    zh: "恐懼",
    es: "Miedo",
  },
  longing: {
    zh: "渴望",
    es: "Anhelo",
  },
  confusion: {
    zh: "困惑",
    es: "Confusión",
  },
  calm: {
    zh: "平靜",
    es: "Calma",
  },
};

export const FALLBACK_TAGS = [
  {
    id: "10000000-0000-4000-8000-000000000001",
    category: "Environment",
    name: "Cyberpunk City",
    slug: "cyberpunk-city",
  },
  {
    id: "10000000-0000-4000-8000-000000000002",
    category: "Environment",
    name: "Water Area",
    slug: "endless-water",
  },
  {
    id: "10000000-0000-4000-8000-000000000003",
    category: "Entities",
    name: "Non-human",
    slug: "non-human",
  },
  {
    id: "10000000-0000-4000-8000-000000000004",
    category: "Anomalies",
    name: "Gravity Reversal",
    slug: "gravity-reversal",
  },
  {
    id: "10000000-0000-4000-8000-000000000005",
    category: "Anomalies",
    name: "Time Stop",
    slug: "time-stop",
  },
  {
    id: "10000000-0000-4000-8000-000000000006",
    category: "Content",
    name: "Adult Content",
    slug: "adult-content",
  },
  {
    id: "10000000-0000-4000-8000-000000000007",
    category: "Emotions",
    name: "Awe",
    slug: "awe",
  },
  {
    id: "10000000-0000-4000-8000-000000000008",
    category: "Emotions",
    name: "Fear",
    slug: "fear",
  },
  {
    id: "10000000-0000-4000-8000-000000000009",
    category: "Emotions",
    name: "Longing",
    slug: "longing",
  },
  {
    id: "10000000-0000-4000-8000-000000000010",
    category: "Emotions",
    name: "Confusion",
    slug: "confusion",
  },
  {
    id: "10000000-0000-4000-8000-000000000011",
    category: "Emotions",
    name: "Calm",
    slug: "calm",
  },
];

const tagsBySlug = Object.fromEntries(FALLBACK_TAGS.map((tag) => [tag.slug, tag]));

export const FALLBACK_DREAMS = [
  {
    dream_id: "20000000-0000-4000-8000-000000000001",
    title: "Neon Rain Rising From the Street",
    excerpt:
      "The observer stood in an alley where rain climbed upward from the pavement. Every drop reflected a different version of the same tower.",
    dream_text:
      "The observer stood in an alley where rain climbed upward from the pavement. Every drop reflected a different version of the same tower. Pedestrians moved without faces, and the traffic lights blinked in an impossible sequence.",
    dream_date: "2026-06-12",
    generated_image_url: null,
    pseudo_id: "DREAMER-7F3A9C",
    signal_coherence: 91,
    tags: [tagsBySlug["cyberpunk-city"], tagsBySlug["gravity-reversal"], tagsBySlug["non-human"], tagsBySlug["awe"], tagsBySlug["confusion"]],
    anomaly_tag_slugs: ["gravity-reversal"],
  },
  {
    dream_id: "20000000-0000-4000-8000-000000000002",
    title: "The Ocean With No Shoreline",
    excerpt:
      "A black sea extended beneath a violet sky. The subject floated above the water, unable to determine whether the surface was liquid or glass.",
    dream_text:
      "A black sea extended beneath a violet sky. The subject floated above the water, unable to determine whether the surface was liquid or glass. A voice beneath the waves repeated the same coordinates.",
    dream_date: "2026-06-10",
    generated_image_url: null,
    pseudo_id: "DREAMER-C0BALT",
    signal_coherence: 76,
    tags: [tagsBySlug["endless-water"], tagsBySlug["time-stop"], tagsBySlug["calm"], tagsBySlug["longing"]],
    anomaly_tag_slugs: ["time-stop"],
  },
  {
    dream_id: "20000000-0000-4000-8000-000000000003",
    title: "The Station Clock Refused to Move",
    excerpt:
      "The train station was full, but every passenger was frozen between gestures. Only the station clock appeared alive, breathing softly behind glass.",
    dream_text:
      "The train station was full, but every passenger was frozen between gestures. Only the station clock appeared alive, breathing softly behind glass. The observer recognized nobody and yet knew every name.",
    dream_date: "2026-06-08",
    generated_image_url: null,
    pseudo_id: "DREAMER-0B11QUE",
    signal_coherence: 84,
    tags: [tagsBySlug["time-stop"], tagsBySlug["non-human"], tagsBySlug["fear"], tagsBySlug["confusion"]],
    anomaly_tag_slugs: ["time-stop"],
  },
  {
    dream_id: "20000000-0000-4000-8000-000000000004",
    title: "A City Suspended Under Water",
    excerpt:
      "The city hung upside down beneath a transparent ocean. Vehicles moved along the underside of bridges while fish passed between office windows.",
    dream_text:
      "The city hung upside down beneath a transparent ocean. Vehicles moved along the underside of bridges while fish passed between office windows. The observer felt certain the scene was being archived by someone else.",
    dream_date: "2026-06-04",
    generated_image_url: null,
    pseudo_id: "DREAMER-NULL9",
    signal_coherence: 88,
    tags: [tagsBySlug["cyberpunk-city"], tagsBySlug["endless-water"], tagsBySlug["gravity-reversal"], tagsBySlug["awe"]],
    anomaly_tag_slugs: ["gravity-reversal"],
  },
  {
    dream_id: "20000000-0000-4000-8000-000000000005",
    title: "The Non-Human Archivist",
    excerpt:
      "A tall figure made of porcelain and antennae asked the observer to classify memories by weather. The filing cabinets contained wet sand.",
    dream_text:
      "A tall figure made of porcelain and antennae asked the observer to classify memories by weather. The filing cabinets contained wet sand. Each drawer opened into the same flooded apartment.",
    dream_date: "2026-05-29",
    generated_image_url: null,
    pseudo_id: "DREAMER-MNEME4",
    signal_coherence: 69,
    tags: [tagsBySlug["non-human"], tagsBySlug["endless-water"], tagsBySlug["fear"]],
    anomaly_tag_slugs: [],
  },
];
