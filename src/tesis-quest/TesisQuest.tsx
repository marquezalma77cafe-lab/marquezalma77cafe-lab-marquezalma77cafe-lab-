import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import "@fontsource/press-start-2p/400.css";
import {
  COFFEE,
  DOC,
  HEART,
  PLAYER_A,
  PLAYER_B,
  PLAYER_JUMP,
  PixelSprite,
  SLIME,
  SLIME_SQUASH,
  iconPalette,
  playerPalette,
  slimePalette,
} from "./sprites";
import {
  CLEAR,
  END_FRAMES,
  END_START,
  JUMP_START,
  LAND,
  LEVELS,
  LEVEL_FRAMES,
  Level,
  STOMP,
  TITLE_FRAMES,
  TOTAL_FRAMES,
  levelStart,
} from "./timeline";

const FONT = '"Press Start 2P", monospace';
const INK = "#1a1423";
const SCROLL = 8;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const pixelText = (size: number, color = "#fff", shadow = INK): React.CSSProperties => ({
  fontFamily: FONT,
  fontSize: size,
  color,
  lineHeight: 1.5,
  textShadow: `${size / 6}px ${size / 6}px 0 ${shadow}`,
});

// Mundo del juego (ocupa y=440..1360 en el lienzo de 1080x1920)
const WORLD_TOP = 440;
const WORLD_H = 920;
const GROUND_Y = 700; // relativo al mundo
const PX = 11;
const PLAYER_W = 16 * PX;
const PLAYER_H = 20 * PX;
const PLAYER_X = 230;

const Hud: React.FC<{ frame: number }> = ({ frame }) => {
  const levelIdx = Math.min(
    LEVELS.length - 1,
    Math.max(0, Math.floor((frame - TITLE_FRAMES) / LEVEL_FRAMES))
  );
  const cleared = LEVELS.reduce(
    (n, _, i) => n + (frame >= levelStart(i) + STOMP ? 1 : 0),
    0
  );
  const score = cleared * 1000 + Math.floor(Math.max(0, frame - TITLE_FRAMES) / 3) * 10;
  const coffee = interpolate(frame, [TITLE_FRAMES, END_START], [1, 0.12], clamp);
  const progress = Math.round((cleared / LEVELS.length) * 100);
  return (
    <div
      style={{
        position: "absolute",
        top: 70,
        left: 50,
        right: 50,
        display: "flex",
        flexDirection: "column",
        gap: 26,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <div style={pixelText(26, "#ffd166")}>DOCTORANDA</div>
          <div style={{ ...pixelText(34), marginTop: 10 }}>
            {String(score).padStart(6, "0")}
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={pixelText(26, "#ffd166")}>VIDAS</div>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            {[0, 1, 2].map((i) => (
              <PixelSprite key={i} grid={HEART} palette={iconPalette} px={6} />
            ))}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={pixelText(26, "#ffd166")}>NIVEL</div>
          <div style={{ ...pixelText(34), marginTop: 10 }}>1-{levelIdx + 1}</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <PixelSprite grid={COFFEE} palette={iconPalette} px={6} />
        <Bar value={coffee} color={coffee < 0.3 ? "#e63946" : "#b5835a"} />
        <PixelSprite grid={DOC} palette={iconPalette} px={6} />
        <Bar value={progress / 100} color="#6abe30" label={`${progress}%`} />
      </div>
    </div>
  );
};

const Bar: React.FC<{ value: number; color: string; label?: string }> = ({
  value,
  color,
  label,
}) => (
  <div
    style={{
      flex: 1,
      height: 38,
      border: `6px solid #fff`,
      background: INK,
      position: "relative",
      boxShadow: `4px 4px 0 ${INK}`,
    }}
  >
    <div style={{ width: `${value * 100}%`, height: "100%", background: color }} />
    {label ? (
      <div
        style={{
          ...pixelText(16),
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {label}
      </div>
    ) : null}
  </div>
);

const Background: React.FC<{ frame: number; level: Level }> = ({ frame, level }) => {
  const off = frame * SCROLL;
  const buildings = Array.from({ length: 14 }, (_, i) => ({
    w: 120 + ((i * 53) % 90),
    h: 160 + ((i * 97) % 220),
  }));
  const skylineW = buildings.reduce((s, b) => s + b.w + 20, 0);
  const renderSkyline = (shift: number) =>
    buildings.map((b, i) => {
      const x = buildings.slice(0, i).reduce((s, c) => s + c.w + 20, 0) + shift;
      return (
        <div
          key={`${shift}-${i}`}
          style={{
            position: "absolute",
            left: x,
            bottom: WORLD_H - GROUND_Y,
            width: b.w,
            height: b.h,
            background: "rgba(26,20,35,0.35)",
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent 0 18px, rgba(255,230,150,0.35) 18px 34px, transparent 34px 52px), repeating-linear-gradient(0deg, transparent 0 22px, rgba(26,20,35,0.5) 22px 40px)",
          }}
        />
      );
    });
  const skyShift = -((off * 0.4) % skylineW);
  const cloudShift = off * 0.15;
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${level.sky[0]}, ${level.sky[1]})`,
        overflow: "hidden",
      }}
    >
      {[0, 1, 2, 3].map((i) => {
        const x = ((i * 380 - cloudShift) % 1500 + 1500) % 1500 - 250;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: 90 + (i % 2) * 150,
              width: 220,
              height: 60,
              background: "#fff",
              boxShadow: `40px -40px 0 -4px #fff, 110px -30px 0 -8px #fff, 0 10px 0 0 rgba(26,20,35,0.15)`,
            }}
          />
        );
      })}
      {renderSkyline(skyShift)}
      {renderSkyline(skyShift + skylineW)}
      {/* Suelo de ladrillos */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: GROUND_Y,
          bottom: 0,
          backgroundColor: "#c84c0c",
          backgroundImage:
            "linear-gradient(#e09050 0 10px, transparent 10px), repeating-linear-gradient(0deg, #1a1423 0 6px, transparent 6px 70px), repeating-linear-gradient(90deg, #1a1423 0 6px, transparent 6px 110px)",
          backgroundPosition: `${-off}px 0`,
          borderTop: `8px solid ${INK}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: GROUND_Y - 14,
          height: 22,
          backgroundImage: `repeating-linear-gradient(90deg, #6abe30 0 44px, #4b8f22 44px 88px)`,
          backgroundPosition: `${-off}px 0`,
          borderTop: `6px solid ${INK}`,
        }}
      />
    </AbsoluteFill>
  );
};

const Typewriter: React.FC<{ text: string; frame: number; speed?: number }> = ({
  text,
  frame,
  speed = 1.4,
}) => {
  const n = Math.max(0, Math.floor(frame * speed));
  return <>{text.slice(0, n)}</>;
};

const DialogueBox: React.FC<{ speaker: string; color: string; children: React.ReactNode }> = ({
  speaker,
  color,
  children,
}) => (
  <div
    style={{
      position: "absolute",
      left: 50,
      right: 50,
      top: 1430,
      height: 360,
      background: INK,
      border: "8px solid #fff",
      boxShadow: `0 0 0 8px ${INK}, 12px 12px 0 8px rgba(0,0,0,0.4)`,
      padding: "44px 40px",
    }}
  >
    <div
      style={{
        ...pixelText(24, INK, "transparent"),
        position: "absolute",
        top: -30,
        left: 30,
        background: color,
        padding: "12px 18px",
        border: `6px solid ${INK}`,
      }}
    >
      {speaker}
    </div>
    <div style={{ ...pixelText(36), lineHeight: 1.7 }}>{children}</div>
  </div>
);

const LevelScene: React.FC<{ level: Level; index: number }> = ({ level, index }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const globalFrame = levelStart(index) + f;

  // Jugadora: correr, saltar sobre el enemigo y rebotar
  let playerY = GROUND_Y - PLAYER_H;
  let sprite = Math.floor(f / 4) % 2 === 0 ? PLAYER_A : PLAYER_B;
  const scale = level.boss ? 1.5 : 1;
  const enemyW = 14 * PX * scale;
  const enemyH = 10 * PX * scale;
  const enemyTop = GROUND_Y - enemyH;
  if (f >= JUMP_START && f < STOMP) {
    const p = (f - JUMP_START) / (STOMP - JUMP_START);
    playerY = interpolate(p, [0, 1], [GROUND_Y - PLAYER_H, enemyTop - PLAYER_H]) - 300 * 4 * p * (1 - p);
    sprite = PLAYER_JUMP;
  } else if (f >= STOMP && f < LAND) {
    const p = (f - STOMP) / (LAND - STOMP);
    playerY = interpolate(p, [0, 1], [enemyTop - PLAYER_H, GROUND_Y - PLAYER_H]) - 220 * 4 * p * (1 - p);
    sprite = PLAYER_JUMP;
  }
  const shake = f >= STOMP && f < STOMP + 8 ? Math.sin(f * 3) * 12 : 0;

  // Enemigo: entra por la derecha, llega a los pies de la jugadora en STOMP
  const meetX = PLAYER_X + PLAYER_W / 2 - enemyW / 2;
  const enemyX =
    f < STOMP
      ? interpolate(f, [0, STOMP], [1150, meetX])
      : meetX - (f - STOMP) * SCROLL;
  const squashed = f >= STOMP;
  const enemyHop = squashed ? 0 : Math.abs(Math.sin(f / 5)) * 22;
  const enemyOpacity = interpolate(f, [STOMP + 12, STOMP + 30], [1, 0], clamp);

  // Título del nivel
  const titleIn = spring({ frame: f, fps, config: { damping: 14 } });

  // Ítem que sale del enemigo
  const itemT = f - STOMP;
  const itemRise = spring({ frame: itemT, fps, config: { damping: 10, mass: 0.6 } });
  const itemOpacity = interpolate(itemT, [0, 4, 60, 70], [0, 1, 1, 0], clamp);

  const clearT = f - CLEAR;
  const clearScale = spring({ frame: clearT, fps, config: { damping: 8, stiffness: 180 } });

  const fade = interpolate(f, [0, 6, LEVEL_FRAMES - 6, LEVEL_FRAMES], [1, 0, 0, 1], clamp);

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: WORLD_TOP,
          left: 0,
          width: 1080,
          height: WORLD_H,
          overflow: "hidden",
          transform: `translateY(${shake}px)`,
          borderTop: `10px solid ${INK}`,
          borderBottom: `10px solid ${INK}`,
        }}
      >
        <Background frame={globalFrame} level={level} />

        {/* Enemigo */}
        <div
          style={{
            position: "absolute",
            left: enemyX,
            top: squashed ? GROUND_Y - 5 * PX * scale : enemyTop - enemyHop,
            opacity: enemyOpacity,
          }}
        >
          {!squashed ? (
            <div
              style={{
                ...pixelText(level.boss ? 22 : 20, "#fff"),
                position: "absolute",
                bottom: enemyH + 24,
                left: enemyW / 2,
                transform: "translateX(-50%)",
                whiteSpace: "nowrap",
                background: INK,
                padding: "10px 14px",
                border: `4px solid ${level.slime}`,
              }}
            >
              {level.boss ? "JEFE: " : ""}
              {level.enemy}
            </div>
          ) : null}
          <PixelSprite
            grid={squashed ? SLIME_SQUASH : SLIME}
            palette={slimePalette(level.slime)}
            px={PX * scale}
          />
        </div>

        {/* Jugadora */}
        <div style={{ position: "absolute", left: PLAYER_X, top: playerY }}>
          <PixelSprite grid={sprite} palette={playerPalette} px={PX} />
        </div>

        {/* Ítem conseguido */}
        {itemT >= 0 ? (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: interpolate(itemRise, [0, 1], [GROUND_Y - 120, 120]),
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 18,
              opacity: itemOpacity,
            }}
          >
            <div style={pixelText(40, "#ffd166")}>+1000</div>
            <div
              style={{
                ...pixelText(26, INK, "transparent"),
                background: "#ffd166",
                border: `6px solid ${INK}`,
                padding: "16px 20px",
                maxWidth: 900,
                textAlign: "center",
              }}
            >
              ★ {level.item} ★
            </div>
          </div>
        ) : null}

        {/* ¡Nivel superado! */}
        {clearT >= 0 ? (
          <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
            <div
              style={{
                ...pixelText(58, "#fff"),
                transform: `scale(${clearScale}) rotate(-4deg)`,
                background: "#e63946",
                border: `10px solid ${INK}`,
                padding: "28px 34px",
                textAlign: "center",
                marginTop: 220,
              }}
            >
              ¡NIVEL
              <br />
              SUPERADO!
            </div>
          </AbsoluteFill>
        ) : null}
      </div>

      {/* Tarjeta de título del nivel */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 290,
          display: "flex",
          justifyContent: "center",
          transform: `translateX(${interpolate(titleIn, [0, 1], [-1100, 0])}px)`,
        }}
      >
        <div
          style={{
            ...pixelText(level.title.length > 20 ? 30 : 38, "#fff"),
            textAlign: "center",
            maxWidth: 1000,
          }}
        >
          <span style={{ color: "#ffd166" }}>NIVEL {index + 1}</span>
          <br />
          {level.title}
        </div>
      </div>

      {/* Diálogos */}
      {f < STOMP + 4 ? (
        <DialogueBox speaker={level.boss ? "JEFE FINAL" : level.enemy} color={level.slime}>
          <Typewriter text={level.enemyLine} frame={f - 4} />
        </DialogueBox>
      ) : (
        <DialogueBox speaker="DOCTORANDA" color="#e63946">
          <Typewriter text={level.reply} frame={f - STOMP - 4} />
        </DialogueBox>
      )}

      <AbsoluteFill style={{ background: "#000", opacity: fade, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

const TitleScreen: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = spring({ frame: f, fps, config: { damping: 9 } });
  const blink = Math.floor(f / 8) % 2 === 0;
  const pressed = f > 62;
  const fade = interpolate(f, [TITLE_FRAMES - 8, TITLE_FRAMES], [0, 1], clamp);
  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(circle at 50% 40%, #3f3f74, #1a1423 70%)",
        alignItems: "center",
      }}
    >
      {Array.from({ length: 40 }, (_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: (i * 173) % 1080,
            top: (i * 311) % 1920,
            width: 8,
            height: 8,
            background: "#fff",
            opacity: (Math.sin(f / 6 + i) + 1) / 2,
          }}
        />
      ))}
      <div
        style={{
          marginTop: 360,
          transform: `scale(${logo})`,
          textAlign: "center",
        }}
      >
        <div style={{ ...pixelText(120, "#ffd166", "#e63946"), letterSpacing: 6 }}>TESIS</div>
        <div style={{ ...pixelText(120, "#fff", "#e63946"), letterSpacing: 6 }}>QUEST</div>
        <div style={{ ...pixelText(30, "#9fc3ff"), marginTop: 40 }}>
          LA DOCTORANDA Y EL
          <br />
          PROTOCOLO DE INVESTIGACIÓN
        </div>
      </div>
      <div style={{ marginTop: 110, transform: `translateY(${-Math.abs(Math.sin(f / 6)) * 40}px)` }}>
        <PixelSprite grid={PLAYER_A} palette={playerPalette} px={16} />
      </div>
      <div
        style={{
          ...pixelText(44, pressed ? "#ffd166" : "#fff"),
          marginTop: 110,
          opacity: pressed ? (Math.floor(f / 3) % 2 ? 1 : 0.2) : blink ? 1 : 0,
        }}
      >
        ▶ PRESS START
      </div>
      <div style={{ ...pixelText(20, "#847e87"), position: "absolute", bottom: 80 }}>
        © 2026 POSGRADO GAMES
      </div>
      <AbsoluteFill style={{ background: "#000", opacity: fade }} />
    </AbsoluteFill>
  );
};

const STATS: [string, string][] = [
  ["CAFÉS CONSUMIDOS", "347"],
  ["VERSIONES DEL PROTOCOLO", "27"],
  ["CRISIS EXISTENCIALES", "12"],
  ["VECES QUE SE RINDIÓ", "0"],
];

const EndScreen: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f, fps, config: { damping: 7, stiffness: 160 } });
  const confettiColors = ["#e63946", "#ffd166", "#6abe30", "#639bff", "#d77bba"];
  const fadeIn = interpolate(f, [0, 8], [1, 0], clamp);
  const fadeOut = interpolate(f, [END_FRAMES - 15, END_FRAMES], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: "#1a1423", alignItems: "center", overflow: "hidden" }}>
      {Array.from({ length: 70 }, (_, i) => {
        const x = (i * 157) % 1080;
        const y = ((i * 97) % 600) - 700 + f * (9 + (i % 5) * 2);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + Math.sin(f / 8 + i) * 30,
              top: y % 2100,
              width: 18,
              height: 18,
              background: confettiColors[i % confettiColors.length],
            }}
          />
        );
      })}
      <div style={{ marginTop: 230, transform: `scale(${pop})`, textAlign: "center" }}>
        <div style={pixelText(40, "#ffd166")}>★ GAME CLEAR ★</div>
        <div
          style={{
            ...pixelText(76, "#fff"),
            marginTop: 40,
            background: "#e63946",
            border: `10px solid #fff`,
            padding: "30px 30px",
          }}
        >
          ¡PROTOCOLO
          <br />
          APROBADO!
        </div>
      </div>
      <div style={{ marginTop: 60, transform: `translateY(${-Math.abs(Math.sin(f / 5)) * 50}px)` }}>
        <PixelSprite grid={PLAYER_JUMP} palette={playerPalette} px={14} />
      </div>
      <div style={{ marginTop: 50, width: 940, display: "flex", flexDirection: "column", gap: 26 }}>
        {STATS.map(([k, v], i) => {
          const o = interpolate(f, [20 + i * 12, 28 + i * 12], [0, 1], clamp);
          return (
            <div
              key={k}
              style={{ display: "flex", justifyContent: "space-between", opacity: o }}
            >
              <span style={pixelText(26, "#9fc3ff")}>{k}</span>
              <span style={pixelText(26, "#fff")}>{v}</span>
            </div>
          );
        })}
      </div>
      <div
        style={{
          ...pixelText(28, "#ffd166"),
          position: "absolute",
          bottom: 150,
          textAlign: "center",
          opacity: interpolate(f, [80, 90], [0, 1], clamp) * (Math.floor(f / 10) % 2 ? 1 : 0.6),
        }}
      >
        SIGUIENTE NIVEL:
        <br />
        TRABAJO DE CAMPO...
        <br />
        <span style={{ color: "#fff", fontSize: 22 }}>¿INSERTAR CAFÉ PARA CONTINUAR?</span>
      </div>
      <AbsoluteFill style={{ background: "#000", opacity: Math.max(fadeIn, fadeOut) }} />
    </AbsoluteFill>
  );
};

export const TesisQuest: React.FC = () => {
  const frame = useCurrentFrame();
  const inLevels = frame >= TITLE_FRAMES && frame < END_START;
  return (
    <AbsoluteFill style={{ background: "#1a1423" }}>
      <Audio src={staticFile("audio/tesis-quest-chiptune.wav")} />
      <Sequence durationInFrames={TITLE_FRAMES}>
        <TitleScreen />
      </Sequence>
      {LEVELS.map((level, i) => (
        <Sequence key={i} from={levelStart(i)} durationInFrames={LEVEL_FRAMES}>
          <LevelScene level={level} index={i} />
        </Sequence>
      ))}
      {inLevels ? <Hud frame={frame} /> : null}
      <Sequence from={END_START} durationInFrames={END_FRAMES}>
        <EndScreen />
      </Sequence>
      {/* Scanlines de pantalla retro */}
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.12) 0 2px, transparent 2px 5px)",
        }}
      />
    </AbsoluteFill>
  );
};

export const TESIS_QUEST_FRAMES = TOTAL_FRAMES;
