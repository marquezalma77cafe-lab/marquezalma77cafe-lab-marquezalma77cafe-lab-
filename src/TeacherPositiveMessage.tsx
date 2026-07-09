import React from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
const poppins =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif';

const SCENE_1_DURATION = 160;
const SCENE_2_START = 140;
const CROSSFADE = 20;

const KenBurns: React.FC<{
  src: string;
  durationInFrames: number;
  direction: "in" | "out";
  fadeIn?: number;
  fadeOut?: number;
}> = ({ src, durationInFrames, direction, fadeIn = 0, fadeOut = 0 }) => {
  const frame = useCurrentFrame();
  const progress = frame / durationInFrames;
  const scale =
    direction === "in"
      ? interpolate(progress, [0, 1], [1, 1.15])
      : interpolate(progress, [0, 1], [1.15, 1]);
  const translateX = interpolate(progress, [0, 1], [0, direction === "in" ? -20 : 20]);

  const opacityIn = fadeIn
    ? interpolate(frame, [0, fadeIn], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;
  const opacityOut = fadeOut
    ? interpolate(
        frame,
        [durationInFrames - fadeOut, durationInFrames],
        [1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      )
    : 1;

  return (
    <AbsoluteFill style={{ opacity: Math.min(opacityIn, opacityOut) }}>
      <Img
        src={src}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale}) translateX(${translateX}px)`,
        }}
      />
    </AbsoluteFill>
  );
};

const Scrim: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.05) 35%, rgba(0,0,0,0.55) 68%, rgba(0,0,0,0.85) 100%)",
    }}
  />
);

const MessageOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const kickerOpacity = interpolate(frame, [20, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const kickerY = interpolate(frame, [20, 35], [16, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const headlineSpring = spring({
    frame: frame - 42,
    fps,
    config: { damping: 200, mass: 0.6 },
  });
  const headlineOpacity = interpolate(headlineSpring, [0, 1], [0, 1]);
  const headlineY = interpolate(headlineSpring, [0, 1], [24, 0]);

  const subtitleOpacity = interpolate(frame, [100, 118], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subtitleY = interpolate(frame, [100, 118], [16, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const fadeOut = interpolate(frame, [248, 270], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        padding: "0 72px 190px 72px",
        opacity: fadeOut,
      }}
    >
      <div
        style={{
          opacity: kickerOpacity,
          transform: `translateY(${kickerY}px)`,
          color: "#FFD866",
          fontFamily: poppins,
          fontWeight: 600,
          fontSize: 30,
          letterSpacing: 4,
          textTransform: "uppercase",
          marginBottom: 22,
          textAlign: "center",
        }}
      >
        Educar es transformar
      </div>

      <div
        style={{
          opacity: headlineOpacity,
          transform: `translateY(${headlineY}px)`,
          color: "white",
          fontFamily: poppins,
          fontWeight: 700,
          fontSize: 62,
          lineHeight: 1.2,
          textAlign: "center",
          textShadow: "0 6px 24px rgba(0,0,0,0.45)",
        }}
      >
        Cada pregunta que haces hoy
        <br />
        construye a la persona
        <br />
        que serás mañana.
      </div>

      <div
        style={{
          opacity: subtitleOpacity,
          transform: `translateY(${subtitleY}px)`,
          color: "rgba(255,255,255,0.9)",
          fontFamily: poppins,
          fontWeight: 500,
          fontSize: 32,
          marginTop: 30,
          textAlign: "center",
        }}
      >
        Sigue aprendiendo. Sigue creciendo.
      </div>
    </AbsoluteFill>
  );
};

export const TeacherPositiveMessage: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Sequence from={0} durationInFrames={SCENE_1_DURATION}>
        <KenBurns
          src={staticFile("images/classroom-1.jpg")}
          durationInFrames={SCENE_1_DURATION}
          direction="in"
          fadeOut={CROSSFADE}
        />
      </Sequence>

      <Sequence from={SCENE_2_START}>
        <KenBurns
          src={staticFile("images/classroom-2.jpg")}
          durationInFrames={270 - SCENE_2_START}
          direction="out"
          fadeIn={CROSSFADE}
        />
      </Sequence>

      <Scrim />
      <MessageOverlay />
    </AbsoluteFill>
  );
};
