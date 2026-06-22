export const TAG_TRANSLATIONS = {
  "cyberpunk-city": {
    zh: "賽博龐克城市",
  },
  "endless-water": {
    zh: "無盡水域",
  },
  "non-human": {
    zh: "非人類",
  },
  "gravity-reversal": {
    zh: "重力反轉",
  },
  "time-stop": {
    zh: "時間停止",
  },
};

export const DREAM_TRANSLATIONS = {
  "20000000-0000-4000-8000-000000000001": {
    title: "霓虹雨從街面升起",
    excerpt:
      "觀測者站在一條小巷裡，雨水從路面往上爬升。每一滴雨都映出同一座高塔的不同版本。",
    dream_text:
      "觀測者站在一條小巷裡，雨水從路面往上爬升。每一滴雨都映出同一座高塔的不同版本。行人沒有面孔地移動，交通號誌以不可能的順序閃爍。",
  },
  "20000000-0000-4000-8000-000000000002": {
    title: "沒有海岸線的海",
    excerpt:
      "一片黑色海洋延伸在紫色天空下。受試者漂浮在水面之上，無法判斷表面究竟是液體還是玻璃。",
    dream_text:
      "一片黑色海洋延伸在紫色天空下。受試者漂浮在水面之上，無法判斷表面究竟是液體還是玻璃。海浪底下有個聲音反覆念出同一組座標。",
  },
  "20000000-0000-4000-8000-000000000003": {
    title: "車站時鐘拒絕前進",
    excerpt:
      "火車站裡擠滿人群，但每位乘客都凍結在動作之間。只有車站時鐘像是活著，在玻璃後方輕輕呼吸。",
    dream_text:
      "火車站裡擠滿人群，但每位乘客都凍結在動作之間。只有車站時鐘像是活著，在玻璃後方輕輕呼吸。觀測者不認識任何人，卻知道每一個名字。",
  },
  "20000000-0000-4000-8000-000000000004": {
    title: "懸在水下的城市",
    excerpt:
      "城市倒掛在透明海洋之下。車輛沿著橋樑底面行駛，魚群從辦公室窗戶之間穿過。",
    dream_text:
      "城市倒掛在透明海洋之下。車輛沿著橋樑底面行駛，魚群從辦公室窗戶之間穿過。觀測者確信這個場景正被其他人歸檔。",
  },
  "20000000-0000-4000-8000-000000000005": {
    title: "非人類檔案管理者",
    excerpt:
      "一個由瓷器與觸角構成的高大身影，要求觀測者依天氣分類記憶。檔案櫃裡裝滿潮濕的沙。",
    dream_text:
      "一個由瓷器與觸角構成的高大身影，要求觀測者依天氣分類記憶。檔案櫃裡裝滿潮濕的沙。每個抽屜都通往同一間淹水的公寓。",
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
    name: "Endless Water",
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
    tags: [tagsBySlug["cyberpunk-city"], tagsBySlug["gravity-reversal"], tagsBySlug["non-human"]],
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
    tags: [tagsBySlug["endless-water"], tagsBySlug["time-stop"]],
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
    tags: [tagsBySlug["time-stop"], tagsBySlug["non-human"]],
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
    tags: [tagsBySlug["cyberpunk-city"], tagsBySlug["endless-water"], tagsBySlug["gravity-reversal"]],
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
    tags: [tagsBySlug["non-human"], tagsBySlug["endless-water"]],
    anomaly_tag_slugs: [],
  },
];
