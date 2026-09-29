import React from "react";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  OffthreadVideo,
  Sequence,
  continueRender,
  delayRender,
  staticFile,
  useVideoConfig,
} from "remotion";
import { getVideoMetadata } from "@remotion/media-utils";
import { FRASES, LIENZO, VIDEO } from "./config";
import { Frase } from "./Frase";

// Carga Poppins desde public/fonts para que funcione sin internet.
const cargarFuentes = (() => {
  let promesa: Promise<void> | null = null;
  return () => {
    if (typeof document === "undefined") return Promise.resolve();
    promesa ??= Promise.all(
      [700, 800].map((peso) =>
        new FontFace(
          "Poppins",
          `url(${staticFile(`fonts/poppins-latin-${peso}-normal.woff2`)}) format("woff2")`,
          { weight: String(peso) }
        )
          .load()
          .then((f) => {
            document.fonts.add(f);
          })
      )
    ).then(() => undefined);
    return promesa;
  };
})();

const useFuentes = () => {
  const [handle] = React.useState(() => delayRender("Cargando Poppins"));
  React.useEffect(() => {
    cargarFuentes().then(() => continueRender(handle));
  }, [handle]);
};

/** Todas las frases, escalonadas en el tiempo, sobre fondo transparente. */
export const FrasesOverlay: React.FC = () => {
  useFuentes();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      {FRASES.map((frase, i) => (
        <Sequence
          key={i}
          from={Math.round(frase.inicio * fps)}
          durationInFrames={Math.round(frase.duracion * fps)}
          name={`Frase ${i + 1}`}
        >
          <Frase frase={frase} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

/** Tu video con las frases encima. */
export const VideoConFrases: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {VIDEO ? <OffthreadVideo src={staticFile(VIDEO)} /> : null}
      <FrasesOverlay />
    </AbsoluteFill>
  );
};

/** Una sola frase, completa y quieta, para exportar como PNG transparente. */
export const FraseFija: React.FC<{ indice: number }> = ({ indice }) => {
  useFuentes();
  return <Frase frase={FRASES[indice]} congelada />;
};

const finFrases = () =>
  Math.max(1, ...FRASES.map((f) => f.inicio + f.duracion));

const dimensiones = async () => {
  if (!VIDEO) {
    return {
      width: LIENZO.ancho,
      height: LIENZO.alto,
      fps: LIENZO.fps,
      durationInFrames: Math.ceil(finFrases() * LIENZO.fps),
    };
  }
  const meta = await getVideoMetadata(staticFile(VIDEO));
  // Remotion necesita dimensiones pares.
  const par = (n: number) => Math.round(n / 2) * 2;
  return {
    width: par(meta.width),
    height: par(meta.height),
    fps: LIENZO.fps,
    durationInFrames: Math.ceil(
      Math.max(meta.durationInSeconds, finFrases()) * LIENZO.fps
    ),
  };
};

export const calcularMetadata: CalculateMetadataFunction<
  Record<string, unknown>
> = () => dimensiones();

export const calcularMetadataFija: CalculateMetadataFunction<{
  indice: number;
}> = async () => ({ ...(await dimensiones()), durationInFrames: 1 });
