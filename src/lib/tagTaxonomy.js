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
  "endless-water": tag("environment-endless-water", "Environment", "Water Area", "水域", "Área de agua"),
  school: tag("environment-school", "Environment", "School", "學校", "Escuela"),
  ocean: tag("environment-ocean", "Environment", "Ocean", "海洋", "Océano"),
  "giant-architecture": tag("environment-giant-architecture", "Environment", "Giant Architecture", "巨大建築", "Arquitectura gigante"),
  "train-station": tag("environment-train-station", "Environment", "Train Station", "火車站", "Estación de tren"),
  "subway-station": tag("environment-subway-station", "Environment", "Subway Station", "捷運站", "Estación de metro"),
  airport: tag("environment-airport", "Environment", "Airport", "機場", "Aeropuerto"),
  "bus-station": tag("environment-bus-station", "Environment", "Bus Station", "公車站", "Estación de autobús"),
  mountain: tag("environment-mountain", "Environment", "Mountain", "山", "Montaña"),
  countryside: tag("environment-countryside", "Environment", "Countryside", "鄉村", "Campo"),
  forest: tag("environment-forest", "Environment", "Forest", "森林", "Bosque"),
  city: tag("environment-city", "Environment", "City", "城市", "Ciudad"),
  town: tag("environment-town", "Environment", "Town", "城鎮", "Pueblo"),
  village: tag("environment-village", "Environment", "Village", "村莊", "Aldea"),
  home: tag("environment-home", "Environment", "Home", "家", "Hogar"),
  apartment: tag("environment-apartment", "Environment", "Apartment", "公寓", "Apartamento"),
  bedroom: tag("environment-bedroom", "Environment", "Bedroom", "臥室", "Dormitorio"),
  bathroom: tag("environment-bathroom", "Environment", "Bathroom", "浴室", "Baño"),
  kitchen: tag("environment-kitchen", "Environment", "Kitchen", "廚房", "Cocina"),
  hallway: tag("environment-hallway", "Environment", "Hallway", "走廊", "Pasillo"),
  elevator: tag("environment-elevator", "Environment", "Elevator", "電梯", "Ascensor"),
  stairs: tag("environment-stairs", "Environment", "Stairs", "樓梯", "Escaleras"),
  rooftop: tag("environment-rooftop", "Environment", "Rooftop", "屋頂", "Azotea"),
  basement: tag("environment-basement", "Environment", "Basement", "地下室", "Sótano"),
  office: tag("environment-office", "Environment", "Office", "辦公室", "Oficina"),
  hospital: tag("environment-hospital", "Environment", "Hospital", "醫院", "Hospital"),
  mall: tag("environment-mall", "Environment", "Mall", "購物中心", "Centro comercial"),
  market: tag("environment-market", "Environment", "Market", "市場", "Mercado"),
  restaurant: tag("environment-restaurant", "Environment", "Restaurant", "餐廳", "Restaurante"),
  hotel: tag("environment-hotel", "Environment", "Hotel", "旅館", "Hotel"),
  library: tag("environment-library", "Environment", "Library", "圖書館", "Biblioteca"),
  museum: tag("environment-museum", "Environment", "Museum", "博物館", "Museo"),
  laboratory: tag("environment-laboratory", "Environment", "Laboratory", "實驗室", "Laboratorio"),
  factory: tag("environment-factory", "Environment", "Factory", "工廠", "Fábrica"),
  warehouse: tag("environment-warehouse", "Environment", "Warehouse", "倉庫", "Almacén"),
  farm: tag("environment-farm", "Environment", "Farm", "農場", "Granja"),
  garden: tag("environment-garden", "Environment", "Garden", "花園", "Jardín"),
  field: tag("environment-field", "Environment", "Field", "田野", "Campo abierto"),
  park: tag("environment-park", "Environment", "Park", "公園", "Parque"),
  river: tag("environment-river", "Environment", "River", "河流", "Río"),
  lake: tag("environment-lake", "Environment", "Lake", "湖", "Lago"),
  beach: tag("environment-beach", "Environment", "Beach", "海灘", "Playa"),
  island: tag("environment-island", "Environment", "Island", "島嶼", "Isla"),
  desert: tag("environment-desert", "Environment", "Desert", "沙漠", "Desierto"),
  cave: tag("environment-cave", "Environment", "Cave", "洞穴", "Cueva"),
  road: tag("environment-road", "Environment", "Road", "道路", "Carretera"),
  bridge: tag("environment-bridge", "Environment", "Bridge", "橋", "Puente"),
  tunnel: tag("environment-tunnel", "Environment", "Tunnel", "隧道", "Túnel"),
  temple: tag("environment-temple", "Environment", "Temple / Shrine", "寺廟／神社", "Templo / santuario"),
  church: tag("environment-church", "Environment", "Church", "教堂", "Iglesia"),
  cemetery: tag("environment-cemetery", "Environment", "Cemetery", "墓地", "Cementerio"),
  ruins: tag("environment-ruins", "Environment", "Ruins", "遺跡", "Ruinas"),
  castle: tag("environment-castle", "Environment", "Castle", "城堡", "Castillo"),
  "amusement-park": tag("environment-amusement-park", "Environment", "Amusement Park", "遊樂園", "Parque de diversiones"),
  "train-car": tag("environment-train-car", "Environment", "Train Car", "火車車廂", "Vagón de tren"),
  ship: tag("environment-ship", "Environment", "Ship", "船", "Barco"),
  spaceship: tag("environment-spaceship", "Environment", "Spaceship", "太空船", "Nave espacial"),
  "non-human": tag("entity-non-human", "Entities", "Non-human", "非人類", "No humano"),
  family: tag("entity-family", "Entities", "Family", "家人", "Familia"),
  stranger: tag("entity-stranger", "Entities", "Stranger", "陌生人", "Persona desconocida"),
  friend: tag("entity-friend", "Entities", "Friend", "朋友", "Amistad"),
  partner: tag("entity-partner", "Entities", "Partner", "伴侶", "Pareja"),
  "ex-partner": tag("entity-ex-partner", "Entities", "Ex-partner", "前任伴侶", "Expareja"),
  child: tag("entity-child", "Entities", "Child", "小孩", "Niño/a"),
  baby: tag("entity-baby", "Entities", "Baby", "嬰兒", "Bebé"),
  teacher: tag("entity-teacher", "Entities", "Teacher", "老師", "Docente"),
  classmate: tag("entity-classmate", "Entities", "Classmate", "同學", "Compañero/a de clase"),
  coworker: tag("entity-coworker", "Entities", "Coworker", "同事", "Colega"),
  boss: tag("entity-boss", "Entities", "Boss", "主管", "Jefe/a"),
  police: tag("entity-police", "Entities", "Police", "警察", "Policía"),
  doctor: tag("entity-doctor", "Entities", "Doctor", "醫生", "Médico/a"),
  soldier: tag("entity-soldier", "Entities", "Soldier", "士兵", "Soldado/a"),
  crowd: tag("entity-crowd", "Entities", "Crowd", "人群", "Multitud"),
  animal: tag("entity-animal", "Entities", "Animal", "動物", "Animal"),
  pet: tag("entity-pet", "Entities", "Pet", "寵物", "Mascota"),
  snake: tag("entity-snake", "Entities", "Snake", "蛇", "Serpiente"),
  lion: tag("entity-lion", "Entities", "Lion", "獅子", "León"),
  tiger: tag("entity-tiger", "Entities", "Tiger", "老虎", "Tigre"),
  cat: tag("entity-cat", "Entities", "Cat", "貓", "Gato"),
  dog: tag("entity-dog", "Entities", "Dog", "狗", "Perro"),
  wolf: tag("entity-wolf", "Entities", "Wolf", "狼", "Lobo"),
  bear: tag("entity-bear", "Entities", "Bear", "熊", "Oso"),
  bird: tag("entity-bird", "Entities", "Bird", "鳥", "Ave"),
  fish: tag("entity-fish", "Entities", "Fish", "魚", "Pez"),
  horse: tag("entity-horse", "Entities", "Horse", "馬", "Caballo"),
  deer: tag("entity-deer", "Entities", "Deer", "鹿", "Ciervo"),
  insect: tag("entity-insect", "Entities", "Insect", "昆蟲", "Insecto"),
  spider: tag("entity-spider", "Entities", "Spider", "蜘蛛", "Araña"),
  monster: tag("entity-monster", "Entities", "Monster", "怪物", "Monstruo"),
  ghost: tag("entity-ghost", "Entities", "Ghost", "鬼魂", "Fantasma"),
  "deceased-person": tag("entity-deceased-person", "Entities", "Deceased person", "已故者", "Persona fallecida"),
  celebrity: tag("entity-celebrity", "Entities", "Celebrity", "名人", "Celebridad"),
  robot: tag("entity-robot", "Entities", "Robot", "機器人", "Robot"),
  alien: tag("entity-alien", "Entities", "Alien", "外星人", "Extraterrestre"),
  deity: tag("entity-deity", "Entities", "Deity / spirit", "神明／靈體", "Deidad / espíritu"),
  double: tag("entity-double", "Entities", "Double / lookalike", "分身／相似者", "Doble / parecido"),
  "gravity-reversal": tag("anomaly-gravity-reversal", "Anomalies", "Gravity Reversal", "重力反轉", "Inversión de gravedad"),
  "time-stop": tag("anomaly-time-stop", "Anomalies", "Time Stop", "時間停止", "Tiempo detenido"),
  "time-loop": tag("anomaly-time-loop", "Anomalies", "Time Loop", "時間循環", "Bucle temporal"),
  "time-skip": tag("anomaly-time-skip", "Anomalies", "Time Skip", "時間跳躍", "Salto temporal"),
  teleportation: tag("anomaly-teleportation", "Anomalies", "Teleportation", "瞬間移動", "Teletransportación"),
  levitation: tag("anomaly-levitation", "Anomalies", "Levitation", "漂浮", "Levitación"),
  invisibility: tag("anomaly-invisibility", "Anomalies", "Invisibility", "隱形", "Invisibilidad"),
  "shape-shifting": tag("anomaly-shape-shifting", "Anomalies", "Shape-shifting", "變形", "Cambio de forma"),
  "size-distortion": tag("anomaly-size-distortion", "Anomalies", "Size Distortion", "大小扭曲", "Distorsión de tamaño"),
  "endless-place": tag("anomaly-endless-place", "Anomalies", "Endless Place", "無盡場域", "Lugar infinito"),
  "impossible-door": tag("anomaly-impossible-door", "Anomalies", "Impossible Door", "不可能的門", "Puerta imposible"),
  "object-animation": tag("anomaly-object-animation", "Anomalies", "Animated object", "物件活化", "Objeto animado"),
  duplication: tag("anomaly-duplication", "Anomalies", "Duplication", "複製／分裂", "Duplicación"),
  "identity-swap": tag("anomaly-identity-swap", "Anomalies", "Identity swap", "身分交換", "Intercambio de identidad"),
  "language-glitch": tag("anomaly-language-glitch", "Anomalies", "Language glitch", "語言故障", "Fallo de lenguaje"),
  "memory-erasure": tag("anomaly-memory-erasure", "Anomalies", "Memory erasure", "記憶消失", "Borrado de memoria"),
  "sudden-appearance": tag("anomaly-sudden-appearance", "Anomalies", "Sudden appearance", "突然出現", "Aparición súbita"),
  "vanishing-object": tag("anomaly-vanishing-object", "Anomalies", "Vanishing object", "物件消失", "Objeto desaparecido"),
  "physics-break": tag("anomaly-physics-break", "Anomalies", "Physics break", "物理規則破裂", "Ruptura física"),
  "dream-within-dream": tag("anomaly-dream-within-dream", "Anomalies", "Dream within dream", "夢中夢", "Sueño dentro de sueño"),
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
  panic: tag("emotion-panic", "Emotions", "Panic", "驚慌", "Pánico"),
  urgency: tag("emotion-urgency", "Emotions", "Urgency", "急迫感", "Urgencia"),
  hope: tag("emotion-hope", "Emotions", "Hope", "希望", "Esperanza"),
  tenderness: tag("emotion-tenderness", "Emotions", "Tenderness", "溫柔", "Ternura"),
  jealousy: tag("emotion-jealousy", "Emotions", "Jealousy", "嫉妒", "Celos"),
  betrayal: tag("emotion-betrayal", "Emotions", "Betrayal", "背叛感", "Traición"),
  trust: tag("emotion-trust", "Emotions", "Trust", "信任", "Confianza"),
  suspense: tag("emotion-suspense", "Emotions", "Suspense", "懸疑感", "Suspenso"),
  freedom: tag("emotion-freedom", "Emotions", "Freedom", "自由感", "Libertad"),
  attraction: tag("emotion-attraction", "Emotions", "Attraction", "吸引", "Atracción"),
  disappointment: tag("emotion-disappointment", "Emotions", "Disappointment", "失望", "Decepción"),
  compassion: tag("emotion-compassion", "Emotions", "Compassion", "憐憫／同情", "Compasión"),
  homesickness: tag("emotion-homesickness", "Emotions", "Homesickness", "思鄉", "Nostalgia del hogar"),
  pride: tag("emotion-pride", "Emotions", "Pride", "自豪", "Orgullo"),
  numbness: tag("emotion-numbness", "Emotions", "Numbness", "麻木", "Entumecimiento"),

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
  cinematic: tag("style-cinematic", "Styles", "Cinematic", "電影感", "Cinematográfico"),
  "live-action": tag("style-live-action", "Styles", "Live action", "真人影像感", "Acción real"),
  "video-game": tag("style-video-game", "Styles", "Video game", "電玩感", "Videojuego"),
  monochrome: tag("style-monochrome", "Styles", "Monochrome", "單色", "Monocromo"),
  neon: tag("style-neon", "Styles", "Neon", "霓虹", "Neón"),
  "oil-painting": tag("style-oil-painting", "Styles", "Oil painting", "油畫", "Pintura al óleo"),
  sketch: tag("style-sketch", "Styles", "Sketch", "素描", "Boceto"),
  claymation: tag("style-claymation", "Styles", "Claymation", "黏土動畫", "Animación con plastilina"),
  "low-poly": tag("style-low-poly", "Styles", "Low poly", "低多邊形", "Low poly"),
  "stop-motion": tag("style-stop-motion", "Styles", "Stop motion", "定格動畫", "Stop motion"),
  photoreal: tag("style-photoreal", "Styles", "Photoreal", "照片寫實", "Fotorrealista"),
  "vintage-film": tag("style-vintage-film", "Styles", "Vintage film", "老電影感", "Película antigua"),

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
  prehistoric: tag("era-prehistoric", "Eras", "Prehistoric", "史前", "Prehistórica"),
  mythic: tag("era-mythic", "Eras", "Mythic", "神話時代", "Mítica"),
  colonial: tag("era-colonial", "Eras", "Colonial", "殖民時期", "Colonial"),
  wartime: tag("era-wartime", "Eras", "Wartime", "戰時", "Tiempo de guerra"),
  "1980s": tag("era-1980s", "Eras", "1980s", "1980 年代", "Años 80"),
  "1990s": tag("era-1990s", "Eras", "1990s", "1990 年代", "Años 90"),
  "2000s": tag("era-2000s", "Eras", "2000s", "2000 年代", "Años 2000"),
  "near-future": tag("era-near-future", "Eras", "Near future", "近未來", "Futuro cercano"),
  "far-future": tag("era-far-future", "Eras", "Far future", "遙遠未來", "Futuro lejano"),
  "alternate-history": tag("era-alternate-history", "Eras", "Alternate history", "架空歷史", "Historia alternativa"),

  sunny: tag("weather-sunny", "Weather", "Sunny", "晴天", "Soleado"),
  daytime: tag("weather-daytime", "Weather", "Daytime", "白天", "Día"),
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
  dawn: tag("weather-dawn", "Weather", "Dawn", "黎明", "Amanecer"),
  dusk: tag("weather-dusk", "Weather", "Dusk", "黃昏", "Anochecer"),
  sunset: tag("weather-sunset", "Weather", "Sunset", "夕陽", "Puesta de sol"),
  moonlight: tag("weather-moonlight", "Weather", "Moonlight", "月光", "Luz de luna"),
  "starry-sky": tag("weather-starry-sky", "Weather", "Starry sky", "星空", "Cielo estrellado"),
  rainbow: tag("weather-rainbow", "Weather", "Rainbow", "彩虹", "Arcoíris"),
  flood: tag("weather-flood", "Weather", "Flood", "洪水", "Inundación"),
  heatwave: tag("weather-heatwave", "Weather", "Heatwave", "熱浪", "Ola de calor"),
  freezing: tag("weather-freezing", "Weather", "Freezing", "結冰", "Congelante"),
  ashfall: tag("weather-ashfall", "Weather", "Ashfall", "落灰", "Caída de ceniza"),
  sandstorm: tag("weather-sandstorm", "Weather", "Sandstorm", "沙塵暴", "Tormenta de arena"),
  "meteor-shower": tag("weather-meteor-shower", "Weather", "Meteor shower", "流星雨", "Lluvia de meteoros"),
  aurora: tag("weather-aurora", "Weather", "Aurora", "極光", "Aurora"),

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
  rescue: tag("dream-type-rescue", "Dream Types", "Rescue", "救援", "Rescate"),
  hiding: tag("dream-type-hiding", "Dream Types", "Hiding", "躲藏", "Esconderse"),
  searching: tag("dream-type-searching", "Dream Types", "Searching", "尋找", "Búsqueda"),
  traveling: tag("dream-type-traveling", "Dream Types", "Traveling", "旅行", "Viaje"),
  reunion: tag("dream-type-reunion", "Dream Types", "Reunion", "重逢", "Reencuentro"),
  competition: tag("dream-type-competition", "Dream Types", "Competition", "比賽", "Competencia"),
  performance: tag("dream-type-performance", "Dream Types", "Performance", "表演", "Actuación"),
  party: tag("dream-type-party", "Dream Types", "Party", "聚會", "Fiesta"),
  shopping: tag("dream-type-shopping", "Dream Types", "Shopping", "購物", "Compras"),
  work: tag("dream-type-work", "Dream Types", "Work", "工作", "Trabajo"),
  driving: tag("dream-type-driving", "Dream Types", "Driving", "開車", "Conducir"),
  underwater: tag("dream-type-underwater", "Dream Types", "Underwater", "水下", "Bajo el agua"),
  death: tag("dream-type-death", "Dream Types", "Death", "死亡", "Muerte"),
  birth: tag("dream-type-birth", "Dream Types", "Birth", "誕生", "Nacimiento"),
  "being-late": tag("dream-type-being-late", "Dream Types", "Being late", "遲到", "Llegar tarde"),
  "losing-teeth": tag("dream-type-losing-teeth", "Dream Types", "Losing teeth", "掉牙", "Perder dientes"),
  "public-nudity": tag("dream-type-public-nudity", "Dream Types", "Public nudity", "公開裸露", "Desnudez pública"),
  invasion: tag("dream-type-invasion", "Dream Types", "Invasion", "入侵", "Invasión"),
  trial: tag("dream-type-trial", "Dream Types", "Trial / judgment", "審判", "Juicio"),
  mission: tag("dream-type-mission", "Dream Types", "Mission", "任務", "Misión"),

  "first-person": tag("perspective-first-person", "Perspective", "First person", "第一人稱", "Primera persona"),
  "second-person": tag("perspective-second-person", "Perspective", "Second person", "第二人稱", "Segunda persona"),
  "third-person": tag("perspective-third-person", "Perspective", "Third person", "第三人稱", "Tercera persona"),
  "shifting-perspective": tag("perspective-shifting-perspective", "Perspective", "Shifting perspective", "視角轉換", "Perspectiva cambiante"),
  "observer-view": tag("perspective-observer-view", "Perspective", "Observer view", "旁觀視角", "Vista de observador"),
  "out-of-body": tag("perspective-out-of-body", "Perspective", "Out of body", "離體視角", "Fuera del cuerpo"),
  "camera-view": tag("perspective-camera-view", "Perspective", "Camera view", "鏡頭視角", "Vista de cámara"),
  "top-down": tag("perspective-top-down", "Perspective", "Top-down view", "俯視視角", "Vista cenital"),
  "split-screen": tag("perspective-split-screen", "Perspective", "Split screen", "分割畫面", "Pantalla dividida"),
  "fixed-scene": tag("perspective-fixed-scene", "Perspective", "Fixed scene", "固定場景視角", "Escena fija"),
  "multiple-selves": tag("perspective-multiple-selves", "Perspective", "Multiple selves", "多個自己視角", "Múltiples yo"),
  "body-camera": tag("perspective-body-camera", "Perspective", "Body camera", "身體攝影機視角", "Cámara corporal"),

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
  "psychology-attachment": tag("psychology-attachment", "Psychological Observables", "Attachment", "依附", "Apego"),
  "psychology-abandonment": tag("psychology-abandonment", "Psychological Observables", "Abandonment", "被拋下", "Abandono"),
  "psychology-secrecy": tag("psychology-secrecy", "Psychological Observables", "Secrecy", "秘密", "Secreto"),
  "psychology-surveillance": tag("psychology-surveillance", "Psychological Observables", "Surveillance", "被監視感", "Vigilancia"),
  "psychology-performance-pressure": tag("psychology-performance-pressure", "Psychological Observables", "Performance pressure", "表現壓力", "Presión de desempeño"),
  "psychology-choice-paralysis": tag("psychology-choice-paralysis", "Psychological Observables", "Choice paralysis", "選擇停滯", "Parálisis de elección"),
  "psychology-belonging": tag("psychology-belonging", "Psychological Observables", "Belonging", "歸屬感", "Pertenencia"),
  "psychology-alienation": tag("psychology-alienation", "Psychological Observables", "Alienation", "疏離感", "Alienación"),
  "psychology-moral-tension": tag("psychology-moral-tension", "Psychological Observables", "Moral tension", "道德拉扯", "Tensión moral"),
  "psychology-temptation": tag("psychology-temptation", "Psychological Observables", "Temptation", "誘惑", "Tentación"),
  "psychology-grief-processing": tag("psychology-grief-processing", "Psychological Observables", "Grief processing", "哀傷處理", "Procesamiento del duelo"),
  "psychology-self-protection": tag("psychology-self-protection", "Psychological Observables", "Self-protection", "自我保護", "Autoprotección"),

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
  "analysis-recurring-place": tag("analysis-recurring-place", "Dream Analysis", "Recurring place", "重複地點", "Lugar recurrente"),
  "analysis-recurring-person": tag("analysis-recurring-person", "Dream Analysis", "Recurring person", "重複人物", "Persona recurrente"),
  "analysis-emotional-shift": tag("analysis-emotional-shift", "Dream Analysis", "Emotional shift", "情緒轉折", "Cambio emocional"),
  "analysis-threat-source": tag("analysis-threat-source", "Dream Analysis", "Threat source", "威脅來源", "Fuente de amenaza"),
  "analysis-unresolved-ending": tag("analysis-unresolved-ending", "Dream Analysis", "Unresolved ending", "未解結尾", "Final no resuelto"),
  "analysis-task-loop": tag("analysis-task-loop", "Dream Analysis", "Task loop", "任務循環", "Bucle de tarea"),
  "analysis-forbidden-area": tag("analysis-forbidden-area", "Dream Analysis", "Forbidden area", "禁區", "Zona prohibida"),
  "analysis-hidden-room": tag("analysis-hidden-room", "Dream Analysis", "Hidden room", "隱藏房間", "Habitación oculta"),
  "analysis-object-loss": tag("analysis-object-loss", "Dream Analysis", "Object loss", "物品遺失", "Pérdida de objeto"),
  "analysis-chase-path": tag("analysis-chase-path", "Dream Analysis", "Chase path", "追逐路徑", "Ruta de persecución"),
};

export const RECORDER_TAG_GROUPS = [
  {
    category: "Environment",
    slugs: [
      "cyberpunk-city",
      "school",
      "ocean",
      "giant-architecture",
      "train-station",
      "subway-station",
      "airport",
      "bus-station",
      "mountain",
      "countryside",
      "forest",
      "city",
      "town",
      "village",
      "home",
      "apartment",
      "bedroom",
      "bathroom",
      "kitchen",
      "hallway",
      "elevator",
      "stairs",
      "rooftop",
      "basement",
      "office",
      "hospital",
      "mall",
      "market",
      "restaurant",
      "hotel",
      "library",
      "museum",
      "laboratory",
      "factory",
      "warehouse",
      "farm",
      "garden",
      "field",
      "park",
      "river",
      "lake",
      "beach",
      "island",
      "desert",
      "cave",
      "road",
      "bridge",
      "tunnel",
      "temple",
      "church",
      "cemetery",
      "ruins",
      "castle",
      "amusement-park",
      "train-car",
      "ship",
      "spaceship",
    ],
  },
  { category: "Entities", slugs: ["non-human", "family", "stranger", "friend", "partner", "ex-partner", "child", "baby", "teacher", "classmate", "coworker", "boss", "police", "doctor", "soldier", "crowd", "animal", "pet", "snake", "lion", "tiger", "cat", "dog", "wolf", "bear", "bird", "fish", "horse", "deer", "insect", "spider", "monster", "ghost", "deceased-person", "celebrity", "robot", "alien", "deity", "double"] },
  { category: "Anomalies", slugs: ["gravity-reversal", "time-stop", "time-loop", "time-skip", "teleportation", "levitation", "invisibility", "shape-shifting", "size-distortion", "endless-place", "impossible-door", "object-animation", "duplication", "identity-swap", "language-glitch", "memory-erasure", "sudden-appearance", "vanishing-object", "physics-break", "dream-within-dream"] },
  { category: "Emotions", slugs: ["awe", "fear", "calm", "grief", "desire", "confusion", "joy", "anxiety", "shame", "anger", "sadness", "loneliness", "nostalgia", "love", "surprise", "disgust", "relief", "wonder", "guilt", "curiosity", "dread", "peace", "excitement", "embarrassment", "helplessness", "panic", "urgency", "hope", "tenderness", "jealousy", "betrayal", "trust", "suspense", "freedom", "attraction", "disappointment", "compassion", "homesickness", "pride", "numbness"] },
  { category: "Styles", slugs: ["american-comics", "realistic", "fantasy", "cartoon", "anime", "film-noir", "surrealism", "pixel-art", "watercolor", "glitch", "horror", "documentary", "cinematic", "live-action", "video-game", "monochrome", "neon", "oil-painting", "sketch", "claymation", "low-poly", "stop-motion", "photoreal", "vintage-film"] },
  { category: "Eras", slugs: ["ancient", "medieval", "early-modern", "industrial", "modern", "retro", "future", "post-apocalyptic", "timeless", "childhood-era", "prehistoric", "mythic", "colonial", "wartime", "1980s", "1990s", "2000s", "near-future", "far-future", "alternate-history"] },
  { category: "Weather", slugs: ["sunny", "daytime", "overcast", "cloudy", "rain", "drizzle", "storm", "thunder", "lightning", "typhoon", "snow", "fog", "haze", "mist", "hail", "wind", "humid", "heat", "cold", "night-sky", "eclipse", "dawn", "dusk", "sunset", "moonlight", "starry-sky", "rainbow", "flood", "heatwave", "freezing", "ashfall", "sandstorm", "meteor-shower", "aurora"] },
  { category: "Dream Types", slugs: ["lucid", "recurring", "nightmare", "false-awakening", "sleep-paralysis", "flying", "falling", "superpowers", "chase", "exam", "lost", "visitation", "prophetic-feeling", "body-transformation", "impossible-space", "disaster", "war-conflict", "romance", "sexual-dream", "daily-life", "rescue", "hiding", "searching", "traveling", "reunion", "competition", "performance", "party", "shopping", "work", "driving", "underwater", "death", "birth", "being-late", "losing-teeth", "public-nudity", "invasion", "trial", "mission"] },
  { category: "Perspective", slugs: ["first-person", "second-person", "third-person", "shifting-perspective", "observer-view", "out-of-body", "camera-view", "top-down", "split-screen", "fixed-scene", "multiple-selves", "body-camera"] },
  { category: "Psychological Observables", slugs: ["psychology-agency", "psychology-control-loss", "psychology-vulnerability", "psychology-conflict", "psychology-intimacy", "psychology-separation", "psychology-social-judgment", "psychology-responsibility", "psychology-protection", "psychology-avoidance", "psychology-reunion", "psychology-identity-question", "psychology-boundary-crossing", "psychology-trust-mistrust", "psychology-power-difference", "psychology-attachment", "psychology-abandonment", "psychology-secrecy", "psychology-surveillance", "psychology-performance-pressure", "psychology-choice-paralysis", "psychology-belonging", "psychology-alienation", "psychology-moral-tension", "psychology-temptation", "psychology-grief-processing", "psychology-self-protection"] },
  { category: "Dream Analysis", slugs: ["analysis-memory-fragment", "analysis-scene-shift", "analysis-time-distortion", "analysis-impossible-logic", "analysis-symbolic-object", "analysis-repeated-symbol", "analysis-threshold-door", "analysis-mirror", "analysis-double-self", "analysis-familiar-place-changed", "analysis-language-speech", "analysis-body-sensation", "analysis-sound-focus", "analysis-color-focus", "analysis-number-symbol", "analysis-map-coordinate", "analysis-ritual", "analysis-message-received", "analysis-choice-point", "analysis-recurring-place", "analysis-recurring-person", "analysis-emotional-shift", "analysis-threat-source", "analysis-unresolved-ending", "analysis-task-loop", "analysis-forbidden-area", "analysis-hidden-room", "analysis-object-loss", "analysis-chase-path"] },
];

export function getCategoryLabel(category, language = "en") {
  return TAG_CATEGORY_LABELS[language]?.[category] || TAG_CATEGORY_LABELS.en[category] || category;
}

export function getTagLabel(tagOrSlug, language = "en") {
  const tagData = typeof tagOrSlug === "string" ? RECORD_TAGS[tagOrSlug] : tagOrSlug;

  if (!tagData) return tagOrSlug || "";
  const fallbackLabel =
    tagData.originalLabel ||
    tagData.name ||
    tagData.name_en ||
    tagData.nameEn ||
    tagData.name_zh ||
    tagData.nameZh ||
    tagData.name_es ||
    tagData.nameEs ||
    "";

  if (language === "zh") {
    return tagData.name_zh || tagData.nameZh || fallbackLabel;
  }
  if (language === "es") {
    return tagData.name_es || tagData.nameEs || fallbackLabel;
  }

  return tagData.name_en || tagData.nameEn || fallbackLabel;
}

export function buildRecordTags(
  selectedTagSlugs = [],
  customTagEntries = [],
  adultContent = false,
  sharedTags = []
) {
  const sharedTagMap = new Map(
    normalizeSharedTags(sharedTags).map((tagData) => [tagData.slug, tagData])
  );
  const slugs = new Set(
    selectedTagSlugs
      .map((slug) => String(slug))
      .filter((slug) => RECORD_TAGS[slug] || sharedTagMap.has(slug))
  );

  if (adultContent) {
    slugs.add("adult-content");
  }

  const selectedTags = [...slugs]
    .map((slug) => RECORD_TAGS[slug] || sharedTagMap.get(slug))
    .filter(Boolean);
  const existingNames = new Set(
    [...Object.values(RECORD_TAGS), ...sharedTagMap.values()].flatMap((item) => [
      item.slug,
      normalizeTagName(item.name),
      normalizeTagName(item.name_en),
      normalizeTagName(item.name_zh),
      normalizeTagName(item.name_es),
      normalizeTagName(item.originalLabel),
    ])
  );
  const customTags = [];

  customTagEntries.forEach((entry) => {
    const normalizedEntry = normalizeCustomTagEntry(entry);
    const normalizedLabel = normalizedEntry.label;
    const normalizedKey = normalizeTagName(normalizedLabel);
    const slug = makeSharedTagSlug(normalizedEntry.category, normalizedLabel);

    if (!normalizedLabel || existingNames.has(normalizedKey) || slugs.has(slug)) return;

    existingNames.add(normalizedKey);
    slugs.add(slug);
    customTags.push({
      id: `custom-${slug}`,
      category: normalizedEntry.category,
      name: normalizedEntry.originalLabel,
      name_en: normalizedEntry.nameEn,
      name_zh: normalizedEntry.nameZh,
      name_es: normalizedEntry.nameEs,
      originalLabel: normalizedEntry.originalLabel,
      originalLanguage: normalizedEntry.originalLanguage,
      translationStatus: normalizedEntry.translationStatus,
      slug,
      custom: true,
    });
  });

  return [...selectedTags, ...customTags];
}

export function getTagSlugsByCategory(tags = [], category) {
  return tags.filter((tagData) => tagData.category === category).map((tagData) => tagData.slug);
}

export function normalizeCustomTagLabel(value) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, 40);
}

export function normalizeCustomTagEntry(entry) {
  if (typeof entry === "string") {
    const label = normalizeCustomTagLabel(entry);
    const originalLanguage = inferTagLanguage(label);

    return {
      label,
      category: "Custom",
      originalLabel: label,
      originalLanguage,
      nameEn: originalLanguage === "en" ? label : "",
      nameZh: originalLanguage === "zh" ? label : "",
      nameEs: originalLanguage === "es" ? label : "",
      translationStatus: "pending",
    };
  }

  const category = TAG_CATEGORY_ORDER.includes(entry?.category)
    ? entry.category
    : "Custom";
  const label = normalizeCustomTagLabel(
    entry?.label ||
      entry?.originalLabel ||
      entry?.name ||
      entry?.name_en ||
      entry?.name_zh ||
      entry?.name_es
  );
  const originalLanguage = normalizeTagLanguage(
    entry?.language || entry?.originalLanguage,
    label
  );
  const nameEn =
    normalizeCustomTagLabel(entry?.name_en || entry?.nameEn) ||
    (originalLanguage === "en" ? label : "");
  const nameZh =
    normalizeCustomTagLabel(entry?.name_zh || entry?.nameZh) ||
    (originalLanguage === "zh" ? label : "");
  const nameEs =
    normalizeCustomTagLabel(entry?.name_es || entry?.nameEs) ||
    (originalLanguage === "es" ? label : "");

  return {
    label,
    category,
    originalLabel: normalizeCustomTagLabel(entry?.originalLabel) || label,
    originalLanguage,
    nameEn,
    nameZh,
    nameEs,
    translationStatus: nameEn && nameZh && nameEs ? "complete" : "pending",
  };
}

export function tagExists(labelOrSlug, selectedCustomEntries = [], sharedTags = []) {
  const normalized = normalizeTagName(labelOrSlug);

  return (
    Boolean(RECORD_TAGS[makeCustomTagSlug(labelOrSlug)]) ||
    Object.values(RECORD_TAGS).some((tagData) =>
      [
        tagData.slug,
        tagData.name,
        tagData.name_en,
        tagData.name_zh,
        tagData.name_es,
        tagData.originalLabel,
      ]
        .map(normalizeTagName)
        .includes(normalized)
    ) ||
    normalizeSharedTags(sharedTags).some((tagData) =>
      [
        tagData.slug,
        tagData.name,
        tagData.name_en,
        tagData.name_zh,
        tagData.name_es,
        tagData.originalLabel,
      ]
        .map(normalizeTagName)
        .includes(normalized)
    ) ||
    selectedCustomEntries.some((entry) => {
      const normalizedEntry = normalizeCustomTagEntry(entry);
      return normalizeTagName(normalizedEntry.label) === normalized;
    })
  );
}

export function mergeRecorderTagGroups(sharedTags = []) {
  const sharedTagsByCategory = normalizeSharedTags(sharedTags).reduce((groups, tagData) => {
    if (!groups.has(tagData.category)) groups.set(tagData.category, []);
    groups.get(tagData.category).push(tagData.slug);
    return groups;
  }, new Map());

  return RECORDER_TAG_GROUPS.map((group) => {
    const sharedSlugs = sharedTagsByCategory.get(group.category) || [];
    const slugs = [...new Set([...group.slugs, ...sharedSlugs])];

    return {
      ...group,
      slugs,
    };
  });
}

export function normalizeSharedTags(sharedTags = []) {
  return sharedTags.map(normalizeSharedTag).filter(Boolean);
}

export function normalizeSharedTag(tagData) {
  const category = TAG_CATEGORY_ORDER.includes(tagData?.category)
    ? tagData.category
    : "Custom";
  const originalLabel = normalizeCustomTagLabel(
    tagData?.originalLabel ||
      tagData?.name ||
      tagData?.label ||
      tagData?.name_en ||
      tagData?.name_zh ||
      tagData?.name_es
  );

  if (!originalLabel || category === "Content") return null;

  const slug = tagData?.slug
    ? makeCustomTagSlug(tagData.slug)
    : makeSharedTagSlug(category, originalLabel);
  const originalLanguage = normalizeTagLanguage(
    tagData?.originalLanguage,
    originalLabel
  );
  let nameEn = normalizeCustomTagLabel(tagData?.name_en || tagData?.nameEn);
  let nameZh = normalizeCustomTagLabel(tagData?.name_zh || tagData?.nameZh);
  let nameEs = normalizeCustomTagLabel(tagData?.name_es || tagData?.nameEs);
  const copiedLegacyLabels =
    !tagData?.originalLanguage &&
    nameZh &&
    nameEs &&
    originalLabel === nameZh &&
    nameZh === nameEs &&
    (!nameEn || nameEn === originalLabel);

  // Older custom tags copied one label into every language. Keep it only as
  // the original label so the other fields remain available for real translations.
  if (copiedLegacyLabels) {
    nameEn = originalLanguage === "en" ? originalLabel : "";
    nameZh = originalLanguage === "zh" ? originalLabel : "";
    nameEs = originalLanguage === "es" ? originalLabel : "";
  } else {
    if (!nameEn && originalLanguage === "en") nameEn = originalLabel;
    if (!nameZh && originalLanguage === "zh") nameZh = originalLabel;
    if (!nameEs && originalLanguage === "es") nameEs = originalLabel;
  }

  return {
    id: tagData?.id || `custom-${slug}`,
    category,
    name: originalLabel,
    name_en: nameEn,
    name_zh: nameZh,
    name_es: nameEs,
    originalLabel,
    originalLanguage,
    translationStatus: nameEn && nameZh && nameEs ? "complete" : "pending",
    slug,
    custom: true,
    shared: true,
  };
}

function normalizeTagLanguage(language, label = "") {
  if (["en", "zh", "es"].includes(language)) return language;
  return inferTagLanguage(label);
}

function inferTagLanguage(label = "") {
  if (/[\u3400-\u9fff]/u.test(label)) return "zh";
  if (/[áéíóúüñ¿¡]/iu.test(label)) return "es";
  return "en";
}

export function makeSharedTagSlug(category, label) {
  const categoryPrefix = makeCustomTagSlug(category);
  const baseSlug = makeCustomTagSlug(label);

  return [categoryPrefix, baseSlug].filter(Boolean).join("-");
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

export function makeCustomTagSlug(value) {
  return normalizeTagName(value)
    .replace(/[^a-z0-9\u4e00-\u9fff-]+/gi, "")
    .replace(/^-+|-+$/g, "");
}
