// ============================================================
//  FRASES SOBRE VIDEO — edita solo este archivo
// ============================================================
//
//  1. Pon tu video en  public/videos/  (ej. public/videos/mi-video.mp4)
//  2. Escribe el nombre en VIDEO (o deja null para solo generar las frases)
//  3. Escribe tus frases abajo, con el segundo en que deben aparecer
//  4. Ejecuta:  npm run frases
//
//  Resultado en la carpeta out/frases/:
//    - frase-01.png, frase-02.png…   → cada frase sola, fondo transparente
//    - frases-overlay.mov            → todas las frases animadas, fondo
//                                      transparente (ProRes 4444, para
//                                      Premiere / Final Cut / DaVinci)
//    - frases-overlay.webm           → igual, en WebM con transparencia
//                                      (para web / CapCut)
//    - video-con-frases.mp4          → tu video con las frases ya encima
// ============================================================

export type Animacion =
  | "palabra" // las palabras entran una por una, escalonadas
  | "linea" // las líneas entran una por una, deslizándose
  | "maquina" // efecto máquina de escribir, letra por letra
  | "pop"; // la frase completa aparece con un rebote

export type Posicion = "arriba" | "centro" | "abajo";

export type Frase = {
  /** Texto de la frase. Usa \n para forzar un salto de línea. */
  texto: string;
  /** Segundo del video en que empieza a aparecer. */
  inicio: number;
  /** Cuántos segundos se queda en pantalla (incluye la entrada). */
  duracion: number;
  animacion?: Animacion;
  posicion?: Posicion;
  /** Palabras que se destacan en caja roja con letra blanca. */
  resaltar?: string[];
  /** Tamaño de letra en px sobre un video de 1080 de ancho. */
  tamano?: number;
};

export type Estilo = {
  colorTexto: string;
  colorBorde: string;
  colorResaltado: string;
  fuente: "Poppins";
  peso: 700 | 800;
  tamano: number;
};

// Estilo de marca: rojo #C41230, borde blanco, Poppins.
export const ESTILO: Estilo = {
  colorTexto: "#C41230",
  colorBorde: "#FFFFFF",
  colorResaltado: "#C41230",
  fuente: "Poppins",
  peso: 800,
  tamano: 84,
};

/** Archivo dentro de public/, o null si solo quieres las frases transparentes. */
export const VIDEO: string | null = null; // ej. "videos/mi-video.mp4"

/** Tamaño del lienzo si no hay video (si hay video se usa el del video). */
export const LIENZO = { ancho: 1080, alto: 1920, fps: 30 };

/** Tiempo (s) entre palabra y palabra / línea y línea al entrar. */
export const ESCALONADO = 0.12;

export const FRASES: Frase[] = [
  {
    texto: "Tu tesis no necesita\nmás horas…",
    inicio: 0.5,
    duracion: 3.5,
    animacion: "palabra",
    posicion: "arriba",
  },
  {
    texto: "necesita un MÉTODO",
    inicio: 4.2,
    duracion: 3,
    animacion: "pop",
    posicion: "centro",
    resaltar: ["MÉTODO"],
    tamano: 96,
  },
  {
    texto: "Pregunta clara.\nHipótesis sólida.\nEvidencia real.",
    inicio: 7.5,
    duracion: 4.5,
    animacion: "linea",
    posicion: "centro",
  },
  {
    texto: "Ciencia aplicada al Derecho",
    inicio: 12.3,
    duracion: 3.5,
    animacion: "maquina",
    posicion: "abajo",
    resaltar: ["Derecho"],
  },
];
