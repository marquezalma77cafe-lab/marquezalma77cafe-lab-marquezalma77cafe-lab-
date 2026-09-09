import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

/**
 * Chevrolet Aveo rojo — Centro Histórico de Saltillo
 *
 * Fuente disponible: una única fotografía de referencia (auto + conductora +
 * Catedral de Santiago / Plaza de Armas). No hay metraje real de calle
 * Victoria ni de la Alameda Zaragoza, y este entorno no cuenta con
 * generación ni composición de video fotorrealista — así que en vez de
 * simular un recorrido que no podemos respaldar con imagen real, esto se
 * trabaja como un plano único de estilo comercial automotriz: cámara lenta
 * en movimiento (Ken Burns + parallax sutil), luz dorada de atardecer, grano
 * de película y desenfoque de movimiento en el piso para vender velocidad,
 * todo fiel al fotograma real que sí tenemos.
 */

const REFERENCE_IMAGE = staticFile("images/chevrolet-aveo-saltillo-reference.png");

const clamp = (frame: number, range: number[], output: number[]) =>
  interpolate(frame, range, output, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

// Grano de película: textura de ruido generada in-line, sin assets externos.
const FilmGrain: React.FC = () => {
  const frame = useCurrentFrame();
  // Alterna dos offsets para dar una sensación de grano "vivo" sin parpadeo violento.
  const shift = Math.sin(frame * 0.9) * 1.5;
  return (
    <AbsoluteFill style={{ mixBlendMode: "overlay", opacity: 0.22 }}>
      <svg width="100%" height="100%">
        <filter id="grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="2"
            stitchTiles="stitch"
            seed={3}
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect
          width="100%"
          height="100%"
          filter="url(#grain)"
          transform={`translate(${shift} ${-shift})`}
        />
      </svg>
    </AbsoluteFill>
  );
};

// Barrido de luz dorada, como un reflejo de sol de atardecer cruzando el cuadro.
const GoldenFlare: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const x = clamp(frame, [0, durationInFrames], [-40, 140]);
  const opacity = clamp(
    frame,
    [0, 30, durationInFrames - 40, durationInFrames],
    [0, 0.5, 0.35, 0]
  );
  return (
    <AbsoluteFill
      style={{
        opacity,
        background: `linear-gradient(115deg, transparent ${x - 22}%, rgba(255,214,140,0.55) ${x}%, transparent ${x + 22}%)`,
        mixBlendMode: "screen",
      }}
    />
  );
};

// Corrección de color: cálida, dorada, tipo "golden hour" comercial automotriz.
const GoldenHourGrade: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const intensity = clamp(frame, [0, durationInFrames], [0.28, 0.42]);
  return (
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, rgba(255,196,120,0.35) 0%, rgba(255,140,80,0.08) 38%, rgba(30,10,20,0.05) 62%, rgba(20,8,18,0.5) 100%)",
        mixBlendMode: "soft-light",
        opacity: intensity,
      }}
    />
  );
};

// Viñeta cinematográfica que se cierra levemente hacia el final para dirigir
// la mirada hacia la conductora.
const Vignette: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const strength = clamp(frame, [0, durationInFrames], [0.55, 0.78]);
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 46% 46%, transparent 38%, rgba(0,0,0,${strength}) 100%)`,
      }}
    />
  );
};

// Líneas de desenfoque de movimiento en la franja inferior (asfalto),
// sugiriendo que el auto avanza sin necesitar metraje real de las ruedas.
const MotionStreaks: React.FC = () => {
  const frame = useCurrentFrame();
  const offset = (frame * 46) % 220;
  return (
    <AbsoluteFill
      style={{
        maskImage:
          "linear-gradient(to top, black 0%, black 14%, transparent 30%)",
        WebkitMaskImage:
          "linear-gradient(to top, black 0%, black 14%, transparent 30%)",
      }}
    >
      <AbsoluteFill
        style={{
          opacity: 0.34,
          filter: "blur(6px)",
          backgroundImage:
            "repeating-linear-gradient(100deg, rgba(255,255,255,0.9) 0px, rgba(255,255,255,0.9) 3px, transparent 3px, transparent 34px)",
          backgroundPositionX: `${-offset}px`,
          transform: "scaleX(1.4)",
        }}
      />
    </AbsoluteFill>
  );
};

const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  // Ken Burns lento con easing suave (no lineal) — cámara "avanzando" con la
  // calle, leve deriva diagonal para simular perspectiva de calzada.
  const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  });
  const scale = interpolate(progress, [0, 1], [1.04, 1.22]);
  const translateX = interpolate(progress, [0, 1], [6, -18]);
  const translateY = interpolate(progress, [0, 1], [10, -6]);

  // Entrada suave: un breve desenfoque que aclara en foco, como el primer
  // fotograma de un anuncio automotriz.
  const introBlur = clamp(frame, [0, 18], [6, 0]);
  const introOpacity = clamp(frame, [0, 14], [0, 1]);

  // Cierre: fundido final a negro en los últimos frames.
  const outOpacity = clamp(
    frame,
    [durationInFrames - 22, durationInFrames],
    [1, 0]
  );

  const frameOpacity = Math.min(introOpacity, outOpacity);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0704", opacity: frameOpacity }}>
      <AbsoluteFill
        style={{
          filter: `blur(${introBlur}px) saturate(1.08) contrast(1.04)`,
          transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
        }}
      >
        <Img
          src={REFERENCE_IMAGE}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AbsoluteFill>

      <MotionStreaks />
      <GoldenFlare />
      <GoldenHourGrade />
      <Vignette />
      <FilmGrain />
    </AbsoluteFill>
  );
};

export const ChevroletAveoSaltillo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Scene />
    </AbsoluteFill>
  );
};
