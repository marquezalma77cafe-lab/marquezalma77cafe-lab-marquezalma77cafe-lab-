// Tiempos compartidos entre el video y el generador de música (scripts/music.py).
export const FPS = 30;
export const TITLE_FRAMES = 90;
export const LEVEL_FRAMES = 150;
export const END_FRAMES = 180;
export const SUB_FRAMES = 150;
export const SUB_CLICK = 62; // frame local del clic en «Suscríbete»

// Momentos clave dentro de cada nivel (frames locales).
export const JUMP_START = 55;
export const STOMP = 78;
export const LAND = 102;
export const CLEAR = 108;

export type Level = {
  title: string;
  enemy: string;
  enemyLine: string;
  reply: string;
  item: string;
  sky: [string, string];
  slime: string;
  boss?: boolean;
};

export const LEVELS: Level[] = [
  {
    title: "PLANTEAMIENTO DEL PROBLEMA",
    enemy: "PREGUNTA VAGA",
    enemyLine: "¿Y... cuál es tu problema de investigación?",
    reply: "¡Delimitado, pertinente y viable!",
    item: "PREGUNTA DE INVESTIGACIÓN",
    sky: ["#5c94fc", "#9fc3ff"],
    slime: "#6abe30",
  },
  {
    title: "MARCO TEÓRICO",
    enemy: "1,247 PDFs SIN LEER",
    enemyLine: "Te faltan los autores clásicos...",
    reply: "¡Estado del arte actualizado!",
    item: "REFERENCIAS APA 7",
    sky: ["#f28c28", "#ffd27f"],
    slime: "#d95763",
  },
  {
    title: "OBJETIVOS E HIPÓTESIS",
    enemy: "OBJETIVO AMBIGUO",
    enemyLine: "«Conocer»... «entender»... «reflexionar»...",
    reply: "Verbos medibles: analizar, evaluar.",
    item: "HIPÓTESIS",
    sky: ["#3f3f74", "#847e87"],
    slime: "#639bff",
  },
  {
    title: "METODOLOGÍA",
    enemy: "SESGO DE SELECCIÓN",
    enemyLine: "¿Tu muestra es representativa?",
    reply: "¡Diseño, muestra e instrumentos!",
    item: "DISEÑO METODOLÓGICO",
    sky: ["#306082", "#5fcde4"],
    slime: "#fbf236",
  },
  {
    title: "CRONOGRAMA",
    enemy: "PLAZO IMPOSIBLE",
    enemyLine: "La entrega es en tres días.",
    reply: "Diagrama de Gantt: ¡activado!",
    item: "CRONOGRAMA",
    sky: ["#76428a", "#d77bba"],
    slime: "#df7126",
  },
  {
    title: "COMITÉ DE ÉTICA",
    enemy: "FORMATO FALTANTE",
    enemyLine: "Falta el consentimiento informado.",
    reply: "¡Firmado, sellado y anexado!",
    item: "DICTAMEN APROBADO",
    sky: ["#37946e", "#99e550"],
    slime: "#ac3232",
  },
  {
    title: "REVISIÓN DEL COMITÉ TUTORAL",
    enemy: "CORRECCIONES v27_FINAL_FINAL",
    enemyLine: "Solo unos «cambios menores»...",
    reply: "¡Ya quedó! (ahora sí, de verdad)",
    item: "VISTO BUENO",
    sky: ["#222034", "#663931"],
    slime: "#8f00ff",
    boss: true,
  },
];

export const levelStart = (i: number) => TITLE_FRAMES + i * LEVEL_FRAMES;
export const END_START = levelStart(LEVELS.length);
export const SUB_START = END_START + END_FRAMES;
export const TOTAL_FRAMES = SUB_START + SUB_FRAMES;
