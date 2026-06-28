const PROJECT_ID = "collectivedreamdatabase";
const DATABASE_PATH = `projects/${PROJECT_ID}/databases/(default)`;
const DOCUMENTS_URL = `https://firestore.googleapis.com/v1/${DATABASE_PATH}/documents`;

const translationGroups = [
  group("Animation", "動畫", "Animación", ["custom-animation"], ["custom-animacin"]),
  group("Animals", "動物", "Animales", ["custom-animals"], ["custom-animales"]),
  group("Antiquity", "古代", "Antigüedad", [], ["custom-antigedad"]),
  group("Sudden appearance", "突然出現", "Aparición repentina", [], ["custom-aparicin-repentina"]),
  group("Sunset", "日落", "Atardecer", [], ["custom-atardecer"]),
  group("Bodily sensation", "身體感覺", "Sensación corporal", ["custom-bodily-sensation"]),
  group("Body of water", "水域", "Cuerpo de agua", ["custom-body-of-water"], ["custom-cuerpo-de-agua"]),
  group("Mission loop", "任務循環", "Bucle de misión", ["custom-mission-loop"], ["custom-bucle-de-misin"]),
  group("Identity shift", "身分轉換", "Cambio de identidad", ["custom-identity-shift"], ["custom-cambio-de-identidad"]),
  group("Perspective shift", "視角轉換", "Cambio de perspectiva", ["custom-perspective-shift"], ["custom-cambio-de-perspectiva"]),
  group("Camera viewpoint", "攝影機視角", "Perspectiva de cámara", ["custom-camera-viewpoint"], ["custom-perspectiva-de-cmara"]),
  group("Path", "路徑", "Camino", [], ["custom-camino"]),
  group("Fields", "田野", "Campos", ["custom-fields"], ["custom-campos"]),
  group("Children", "兒童", "Niños", ["custom-children"], ["custom-nios"]),
  group("Cinematic feel", "電影感", "Sensación cinematográfica", ["custom-cinematic-feel"], ["custom-sensacin-cinematogrfica"]),
  group("Cyberpunk city", "賽博龐克城市", "Ciudad ciberpunk", [], ["custom-ciudad-ciberpunk"]),
  group("Colleagues", "同事", "Compañeros de trabajo", ["custom-colleagues"], ["custom-compaeros-de-trabajo"]),
  group("Deceased person", "已故者", "Persona fallecida", ["custom-deceased"], ["custom-fallecido"]),
  group("Power imbalance", "權力不對等", "Desequilibrio de poder", ["custom-power-imbalance"], ["custom-desequilibrio-de-poder"]),
  group("Sunny day", "晴天", "Día soleado", ["custom-sunny-day"], ["custom-da-soleado"]),
  group("Dream within a dream", "夢中夢", "Sueño dentro de un sueño", ["custom-dream-within-a-dream"], ["custom-sueo-dentro-de-un-sueo"]),
  group("Massive building", "巨型建築", "Edificio enorme", ["custom-massive-building"], ["custom-edificio-enorme"]),
  group("Emotion", "情緒", "Emoción", [], ["custom-emocin"]),
  group("Emotional numbness", "情感麻木", "Entumecimiento emocional", ["custom-emotional-numbness"], ["custom-entumecimiento-emocional"]),
  group("Color focus", "色彩焦點", "Enfoque en el color", [], ["custom-enfoque-en-el-color"]),
  group("Sound focus", "聲音焦點", "Enfoque sonoro", [], ["custom-enfoque-sonoro"]),
  group("Mythic age", "神話時代", "Época mítica", ["custom-mythic-age"], ["custom-poca-mtica"]),
  group("Escape / pursuit", "逃亡／追逐", "Escape / persecución", ["custom-escape--pursuit"]),
  group("Hiding", "躲藏", "Escondite", [], ["custom-escondite"]),
  group("Bus station", "公車站", "Estación de autobuses", [], ["custom-estacin-de-autobuses"]),
  group("Social evaluation", "社會評價", "Evaluación social", ["custom-social-evaluation"], ["custom-evaluacin-social"]),
  group("Language malfunction", "語言故障", "Fallo del lenguaje", ["custom-language-malfunction"], ["custom-fallo-del-lenguaje"]),
  group("Ghosts", "鬼魂", "Fantasmas", ["custom-ghosts"], ["custom-fantasmas"]),
  group("Feeling watched", "被監視感", "Sensación de ser observado", ["custom-feeling-watched"], ["custom-sensacin-de-ser-observado"]),
  group("Unresolved ending", "未解結局", "Final sin resolver", [], ["custom-final-sin-resolver"]),
  group("Gathering", "聚會", "Reunión", ["custom-gathering"], ["custom-reunin"]),
  group("Emotional shift", "情緒轉折", "Giro emocional", [], ["custom-giro-emocional"]),
  group("War", "戰爭", "Guerra", ["custom-war"], ["custom-guerra"]),
  group("Ice / freezing", "冰／結凍", "Hielo / congelación", ["custom-ice--freezing"], ["custom-hielo--congelacin"]),
  group("Helplessness", "無助", "Indefensión", [], ["custom-indefensin"]),
  group("Industrial age", "工業時代", "Era industrial", ["custom-industrial-age"]),
  group("Inn / hotel", "旅店／飯店", "Posada / hotel", ["custom-inn--hotel"], ["custom-posada--hotel"]),
  group("Insects", "昆蟲", "Insectos", ["custom-insects"], ["custom-insectos"]),
  group("Judgment", "評判", "Juicio", ["custom-judgment"]),
  group("Lost object", "遺失物品", "Objeto perdido", ["custom-lost-object"], ["custom-objeto-perdido"]),
  group("Lucid dream", "清醒夢", "Sueño lúcido", ["custom-lucid-dream"], ["custom-sueo-lcido"]),
  group("Map / coordinates", "地圖／座標", "Mapa / coordenadas", ["custom-map--coordinates"], ["custom-mapa--coordenadas"]),
  group("Metro station", "地鐵站", "Estación de metro", ["custom-metro-station"]),
  group("Numbers / symbols", "數字／符號", "Números / símbolos", ["custom-numbers--symbols"], ["custom-nmeros--smbolos"]),
  group("Ominous panic", "不祥的恐慌", "Pánico premonitorio", ["custom-ominous-panic"], ["custom-presentimiento-de-pnico"]),
  group("Out-of-body view", "離體視角", "Visión extracorporal", ["custom-out-of-body-view"], ["custom-visin-extracorporal"]),
  group("Overhead view", "俯視視角", "Vista desde arriba", ["custom-overhead-view"], ["custom-vista-desde-arriba"]),
  group("Amusement park", "遊樂園", "Parque de atracciones", [], ["custom-parque-de-atracciones"]),
  group("Peacefulness", "平靜", "Tranquilidad", ["custom-peacefulness"]),
  group("Sorrow", "悲傷", "Pena", ["custom-sorrow"], ["custom-pena"]),
  group("Pity / compassion", "憐憫／同情", "Piedad / compasión", ["custom-pity--compassion"], ["custom-piedad--compasin"]),
  group("Post-apocalyptic", "末日後", "Postapocalíptico", [], ["custom-postapocalptico"]),
  group("Performance pressure", "表現壓力", "Presión de rendimiento", [], ["custom-presin-de-rendimiento"]),
  group("Teacher", "老師", "Profesor", [], ["custom-profesor"]),
  group("Pursuit route", "追逐路線", "Ruta de persecución", ["custom-pursuit-route"]),
  group("Recurring symbol", "重複符號", "Símbolo recurrente", ["custom-recurring-symbol"], ["custom-smbolo-recurrente"]),
  group("Sense of freedom", "自由感", "Sensación de libertad", ["custom-sense-of-freedom"], ["custom-sensacin-de-libertad"]),
  group("Video-game feel", "電玩感", "Sensación de videojuego", ["custom-video-game-feel"], ["custom-sensacin-de-videojuego"]),
  group("Sense of agency", "自主感", "Sentido de agencia", ["custom-sense-of-agency"], ["custom-sentido-de-agencia"]),
  group("Sense of responsibility", "責任感", "Sentido de responsabilidad", ["custom-sense-of-responsibility"], ["custom-sentido-de-responsabilidad"]),
  group("Shopping center", "購物中心", "Centro comercial", ["custom-shopping-center"]),
  group("Soldiers", "士兵", "Soldados", ["custom-soldiers"], ["custom-soldados"]),
  group("Surreal", "超現實", "Surreal", ["custom-surreal"]),
  group("Time jump", "時間跳躍", "Salto temporal", ["custom-time-jump"]),
  group("Train carriage", "火車車廂", "Vagón de tren", ["custom-train-carriage"]),
  group("Transformation", "變形／轉化", "Transformación", ["custom-transformation"], ["custom-transformacin"]),
  group("Travel", "旅行", "Viaje", ["custom-travel"]),
  group("Flight", "飛行", "Vuelo", [], ["custom-vuelo"]),
  group("Pleasure", "享樂", "Placer", [], [], ["dream-types-享樂"]),
  group("Night", "夜晚", "Noche", [], [], ["weather-夜晚"]),
  group("Restroom", "廁所", "Baño", [], [], ["environment-廁所"]),
  group("Accident", "意外", "Accidente", [], [], ["dream-types-意外"]),
  group("Swimming pool", "泳池", "Piscina", [], [], ["environment-泳池"]),
  group("Hot spring", "溫泉", "Aguas termales", [], [], ["environment-溫泉"]),
  group("Grassland", "草原", "Pradera", [], [], ["environment-草原"]),
];

const translationsBySlug = new Map();

translationGroups.forEach(({ labels, sources }) => {
  Object.entries(sources).forEach(([originalLanguage, slugs]) => {
    slugs.forEach((slug) => {
      if (translationsBySlug.has(slug)) {
        throw new Error(`Duplicate translation mapping for ${slug}`);
      }
      translationsBySlug.set(slug, {
        ...labels,
        originalLanguage,
      });
    });
  });
});

const response = await fetch(`${DOCUMENTS_URL}/customTags?pageSize=300`);
if (!response.ok) {
  throw new Error(`Unable to read custom tags: ${response.status} ${await response.text()}`);
}

const documents = (await response.json()).documents || [];
const liveSlugs = documents.map((document) => document.fields?.slug?.stringValue).filter(Boolean);
const missingMappings = liveSlugs.filter((slug) => !translationsBySlug.has(slug));
const obsoleteMappings = [...translationsBySlug.keys()].filter((slug) => !liveSlugs.includes(slug));

if (missingMappings.length || obsoleteMappings.length) {
  console.error("Missing mappings:", missingMappings);
  console.error("Mappings without a live document:", obsoleteMappings);
  process.exitCode = 1;
} else if (!process.argv.includes("--apply")) {
  console.log(`Validated ${liveSlugs.length} live custom-tag translations. Run with --apply to write them.`);
} else {
  const accessToken = process.env.GOOGLE_OAUTH_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error("Set GOOGLE_OAUTH_ACCESS_TOKEN before using --apply.");
  }

  const writes = documents.map((document) => {
    const slug = document.fields.slug.stringValue;
    const currentName = document.fields.name.stringValue;
    const translation = translationsBySlug.get(slug);

    return {
      update: {
        name: document.name,
        fields: {
          name_en: stringField(translation.en),
          name_zh: stringField(translation.zh),
          name_es: stringField(translation.es),
          originalLabel: stringField(currentName),
          originalLanguage: stringField(translation.originalLanguage),
          translationStatus: stringField("complete"),
        },
      },
      updateMask: {
        fieldPaths: [
          "name_en",
          "name_zh",
          "name_es",
          "originalLabel",
          "originalLanguage",
          "translationStatus",
        ],
      },
    };
  });

  const writeResponse = await fetch(
    `https://firestore.googleapis.com/v1/${DATABASE_PATH}/documents:batchWrite`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "x-goog-user-project": PROJECT_ID,
      },
      body: JSON.stringify({ writes }),
    }
  );

  if (!writeResponse.ok) {
    throw new Error(`Unable to update custom tags: ${writeResponse.status} ${await writeResponse.text()}`);
  }

  const result = await writeResponse.json();
  console.log(`Updated ${result.writeResults?.length || 0} custom-tag documents.`);
}

function group(en, zh, es, enSlugs = [], esSlugs = [], zhSlugs = []) {
  return {
    labels: { en, zh, es },
    sources: {
      en: enSlugs,
      es: esSlugs,
      zh: zhSlugs,
    },
  };
}

function stringField(value) {
  return { stringValue: value };
}
