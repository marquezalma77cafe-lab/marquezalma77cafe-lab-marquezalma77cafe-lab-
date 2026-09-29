# Frases con fondo transparente sobre video

Crea frases con el estilo de marca (rojo `#C41230`, borde blanco, Poppins),
les quita el fondo y las anima entrando de forma escalonada para montarlas
sobre cualquier video.

## Cómo se usa

1. **Escribe las frases** en `src/frases/config.ts` (lista `FRASES`):

   ```ts
   {
     texto: "Tu tesis no necesita\nmás horas…", // \n = salto de línea
     inicio: 0.5,          // segundo en que aparece
     duracion: 3.5,        // segundos en pantalla
     animacion: "palabra", // "palabra" | "linea" | "maquina" | "pop"
     posicion: "arriba",   // "arriba" | "centro" | "abajo"
     resaltar: ["tesis"],  // palabras en caja roja con letra blanca
     tamano: 84,           // opcional
   }
   ```

2. **(Opcional) Pon tu video** en `public/videos/` y escribe su nombre en
   `VIDEO`, por ejemplo `export const VIDEO = "videos/mi-reel.mp4";`.
   Las frases toman el tamaño y la duración del video automáticamente.

3. **Genera todo:**

   ```bash
   npm install
   npm run frases
   ```

## Qué obtienes (en `out/frases/`)

| Archivo | Para qué sirve |
| --- | --- |
| `frase-XX-recortada.png` | Solo la frase, fondo transparente, ajustada al texto. Arrástrala a CapCut, Canva, Instagram o donde sea. |
| `frase-XX.png` | Cuadro completo 9:16 con la frase ya en su posición (arriba/centro/abajo). |
| `frases-overlay.mov` | Todas las frases **animadas** con transparencia (ProRes 4444). Para Premiere, Final Cut o DaVinci: ponlo en la pista de encima del video. |
| `frases-overlay.webm` | Lo mismo en WebM con transparencia (más ligero; web y algunos editores). |
| `video-con-frases.mp4` | Tu video con las frases ya montadas y el audio original. Solo si pusiste `VIDEO`. |

Para generar solo una parte: `npm run frases -- png`, `npm run frases -- overlay`
o `npm run frases -- video`.

## Animaciones

- **palabra** — cada palabra sube y se enfoca, una tras otra.
- **linea** — cada línea entra deslizándose, una tras otra (ideal para listas).
- **maquina** — letra por letra, como máquina de escribir.
- **pop** — la frase entera aparece con un rebote.

El ritmo del escalonado se ajusta con `ESCALONADO` (segundos entre palabras).
Todas las frases salen con un desvanecido suave al terminar su `duracion`.

## Vista previa en vivo

`npm start` abre Remotion Studio; en la carpeta **Frases** puedes ver y
reproducir `FrasesOverlay`, `VideoConFrases` y cada frase por separado.
