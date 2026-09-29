// Renderiza las frases de src/frases/config.ts en out/frases/:
//   - frase-XX.png            cuadro completo, la frase en su posición
//   - frase-XX-recortada.png  solo el texto, para colocarlo donde quieras
//   - frases-overlay.mov      todas animadas, transparente (ProRes 4444)
//   - frases-overlay.webm     todas animadas, transparente (VP8 con alfa)
//   - video-con-frases.mp4    tu video con las frases (si hay VIDEO)
//
// Uso:  npm run frases             → todo
//       npm run frases -- png      → solo los PNG
//       npm run frases -- overlay  → solo los overlays transparentes
//       npm run frases -- video    → solo el video final
import { bundle } from "@remotion/bundler";
import { getCompositions, renderMedia, renderStill } from "@remotion/renderer";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { recortarPng } from "./recortar-png.mjs";

const raiz = path.resolve(import.meta.dirname, "..");
const salida = path.join(raiz, "out", "frases");
mkdirSync(salida, { recursive: true });

const pedido = process.argv[2] ?? "todo";
const quiere = (x) => pedido === "todo" || pedido === x;

const progreso = (nombre) => {
  let ultimo = -1;
  return ({ progress }) => {
    const pct = Math.floor(progress * 10) * 10;
    if (pct !== ultimo) console.log(`  ${nombre}: ${(ultimo = pct)}%`);
  };
};

console.log("Preparando proyecto…");
const serveUrl = await bundle({ entryPoint: path.join(raiz, "src/index.ts") });
const comps = await getCompositions(serveUrl);
const buscar = (id) => comps.find((c) => c.id === id);

if (quiere("png")) {
  const frases = comps.filter((c) => /^Frase-\d+$/.test(c.id));
  console.log(`\nPNG transparentes (${frases.length}):`);
  for (const c of frases) {
    const nombre = c.id.toLowerCase();
    const png = path.join(salida, `${nombre}.png`);
    await renderStill({ serveUrl, composition: c, output: png, imageFormat: "png", overwrite: true });
    const r = recortarPng(png, path.join(salida, `${nombre}-recortada.png`));
    console.log(`  ✓ ${nombre}.png${r ? ` + ${nombre}-recortada.png (${r.w}×${r.h})` : ""}`);
  }
}

if (quiere("overlay")) {
  const c = buscar("FrasesOverlay");
  console.log("\nOverlays animados con fondo transparente:");
  await renderMedia({
    serveUrl, composition: c, codec: "prores", proResProfile: "4444",
    imageFormat: "png", pixelFormat: "yuva444p10le", muted: true,
    outputLocation: path.join(salida, "frases-overlay.mov"),
    onProgress: progreso("frases-overlay.mov"),
  });
  await renderMedia({
    serveUrl, composition: c, codec: "vp8",
    imageFormat: "png", pixelFormat: "yuva420p", muted: true,
    outputLocation: path.join(salida, "frases-overlay.webm"),
    onProgress: progreso("frases-overlay.webm"),
  });
}

if (quiere("video")) {
  const c = buscar("VideoConFrases");
  if (!c) {
    console.log("\n(Sin video: pon VIDEO en src/frases/config.ts para generar video-con-frases.mp4)");
  } else {
    console.log("\nVideo final:");
    await renderMedia({
      serveUrl, composition: c, codec: "h264",
      outputLocation: path.join(salida, "video-con-frases.mp4"),
      onProgress: progreso("video-con-frases.mp4"),
    });
    }
}

console.log(`\nListo → ${path.relative(raiz, salida)}/`);
