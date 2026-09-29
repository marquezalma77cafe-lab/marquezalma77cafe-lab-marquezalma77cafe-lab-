import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ESCALONADO, ESTILO, Frase as FraseConfig } from "./config";

const SALIDA_SEG = 0.4;
const SEG_POR_LETRA = 0.035;

const limpiar = (palabra: string) =>
  palabra.replace(/[.,;:!¡?¿…"'()]/g, "").toLowerCase();

type Unidad = {
  palabra: string;
  linea: number;
  indice: number;
  letrasAntes: number;
};

const partir = (texto: string): Unidad[] => {
  const unidades: Unidad[] = [];
  let letras = 0;
  texto.split("\n").forEach((linea, l) => {
    linea
      .split(" ")
      .filter(Boolean)
      .forEach((palabra) => {
        unidades.push({
          palabra,
          linea: l,
          indice: unidades.length,
          letrasAntes: letras,
        });
        letras += palabra.length + 1;
      });
  });
  return unidades;
};

const Palabra: React.FC<{
  texto: string;
  resaltada: boolean;
  tamano: number;
  style: React.CSSProperties;
}> = ({ texto, resaltada, tamano, style }) => {
  const borde = Math.round(tamano * 0.16);
  if (resaltada) {
    return (
      <span
        style={{
          ...style,
          display: "inline-block",
          color: ESTILO.colorBorde,
          backgroundColor: ESTILO.colorResaltado,
          border: `${Math.round(borde / 2)}px solid ${ESTILO.colorBorde}`,
          borderRadius: tamano * 0.22,
          padding: `0 ${tamano * 0.22}px`,
          margin: `0 ${tamano * 0.12}px`,
        }}
      >
        {texto}
      </span>
    );
  }
  // Dos capas: el borde blanco detrás y el relleno rojo encima,
  // así el borde grueso no se come la letra.
  return (
    <span
      style={{
        ...style,
        display: "inline-block",
        position: "relative",
        margin: `0 ${tamano * 0.12}px`,
      }}
    >
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          color: ESTILO.colorBorde,
          WebkitTextStroke: `${borde}px ${ESTILO.colorBorde}`,
        }}
      >
        {texto}
      </span>
      <span style={{ position: "relative", color: ESTILO.colorTexto }}>
        {texto}
      </span>
    </span>
  );
};

export const Frase: React.FC<{
  frase: FraseConfig;
  /** true = se muestra completa y quieta (para los PNG). */
  congelada?: boolean;
}> = ({ frase, congelada = false }) => {
  const frameReal = useCurrentFrame();
  const { fps, width, durationInFrames } = useVideoConfig();
  const animacion = frase.animacion ?? "palabra";
  const escala = width / 1080;
  const tamano = (frase.tamano ?? ESTILO.tamano) * escala;
  const unidades = partir(frase.texto);
  const resaltar = new Set((frase.resaltar ?? []).map(limpiar));

  // En modo congelado usamos un frame donde todo ya entró.
  const frame = congelada ? fps * 60 : frameReal;
  const salida = congelada
    ? 1
    : interpolate(
        frame,
        [durationInFrames - SALIDA_SEG * fps, durationInFrames],
        [1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      );

  const entradaPop = spring({
    frame,
    fps,
    config: { damping: 9, stiffness: 160, mass: 0.7 },
  });

  const letrasVisibles = Math.floor(frame / (SEG_POR_LETRA * fps));

  const estiloUnidad = (u: Unidad): React.CSSProperties => {
    if (animacion === "pop") return {};
    if (animacion === "maquina") {
      return { opacity: letrasVisibles >= u.letrasAntes ? 1 : 0 };
    }
    const orden = animacion === "linea" ? u.linea : u.indice;
    const p = spring({
      frame: frame - orden * ESCALONADO * fps * (animacion === "linea" ? 3 : 1),
      fps,
      config: { damping: 14, stiffness: 140 },
    });
    if (animacion === "linea") {
      return {
        opacity: p,
        transform: `translateX(${interpolate(p, [0, 1], [-80, 0]) * escala}px)`,
      };
    }
    return {
      opacity: interpolate(p, [0, 0.4], [0, 1], { extrapolateRight: "clamp" }),
      transform: `translateY(${interpolate(p, [0, 1], [50, 0]) * escala}px) scale(${interpolate(p, [0, 1], [0.6, 1])})`,
      filter: `blur(${interpolate(p, [0, 1], [8, 0]) * escala}px)`,
    };
  };

  const textoUnidad = (u: Unidad) => {
    if (animacion !== "maquina") return u.palabra;
    const visibles = Math.max(0, letrasVisibles - u.letrasAntes);
    return u.palabra.slice(0, visibles) || " ";
  };

  const lineas = unidades.reduce<Unidad[][]>((acc, u) => {
    (acc[u.linea] ??= []).push(u);
    return acc;
  }, []);

  const posicion = frase.posicion ?? "centro";
  const justify =
    posicion === "arriba"
      ? "flex-start"
      : posicion === "abajo"
        ? "flex-end"
        : "center";

  return (
    <AbsoluteFill
      style={{
        justifyContent: justify,
        alignItems: "center",
        // Márgenes pensados para Reels/TikTok: sin chocar con la UI.
        paddingTop: "16%",
        paddingBottom: "22%",
      }}
    >
      <div
        style={{
          width: "90%",
          textAlign: "center",
          fontFamily: `"${ESTILO.fuente}", sans-serif`,
          fontWeight: ESTILO.peso,
          fontSize: tamano,
          lineHeight: 1.3,
          opacity: salida,
          transform:
            animacion === "pop"
              ? `scale(${entradaPop})`
              : `translateY(${(1 - salida) * -20 * escala}px)`,
          filter: `drop-shadow(0 ${6 * escala}px ${10 * escala}px rgba(0,0,0,0.35))`,
        }}
      >
        {lineas.map((linea, l) => (
          <div key={l}>
            {linea.map((u) => (
              <Palabra
                key={u.indice}
                texto={textoUnidad(u)}
                resaltada={resaltar.has(limpiar(u.palabra))}
                tamano={tamano}
                style={estiloUnidad(u)}
              />
            ))}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
