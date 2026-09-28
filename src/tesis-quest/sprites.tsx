import React, { useMemo } from "react";

type Palette = Record<string, string>;

export const PixelSprite: React.FC<{
  grid: string[];
  palette: Palette;
  px: number;
  style?: React.CSSProperties;
}> = ({ grid, palette, px, style }) => {
  const rects = useMemo(() => {
    const out: React.ReactNode[] = [];
    grid.forEach((row, y) => {
      [...row].forEach((c, x) => {
        const fill = palette[c];
        if (fill) {
          out.push(
            <rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} fill={fill} />
          );
        }
      });
    });
    return out;
  }, [grid, palette]);
  const w = Math.max(...grid.map((r) => r.length));
  return (
    <svg
      width={w * px}
      height={grid.length * px}
      viewBox={`0 0 ${w} ${grid.length}`}
      shapeRendering="crispEdges"
      style={style}
    >
      {rects}
    </svg>
  );
};

// La doctoranda: cabello castaño, lentes, suéter rojo y su laptop.
const HEAD = [
  ".....KKKKKK.....",
  "...KKHHHHHHKK...",
  "..KHHHHHHHHHHK..",
  "..KHHSSSSSSHHK..",
  ".KHHSGGGSGGGHHK.",
  ".KHHSGEGSGEGHHK.",
  ".KHHSSSSSSSSHHK.",
  ".KHHSSSMMSSSHHK.",
  ".KHHKSSSSSSKHHK.",
  "..KHKKRRRRKKHK..",
  "...KRRRRRRRRK...",
  "..KRRRRRRRRRRK..",
  ".KSRRRRRRRRRLLK.",
  ".KSKRRRRRRRKLLK.",
  "..K.KRRRRRRKLLK.",
  "....KBBBBBBK....",
];

export const PLAYER_A = [
  ...HEAD,
  "....KBBKKBBK....",
  "...KBBK..KBBK...",
  "...KDDK..KDDK...",
  "...KKKK..KKKK...",
];

export const PLAYER_B = [
  ...HEAD,
  "....KBBBBBBK....",
  ".....KBBBBK.....",
  ".....KDDDDK.....",
  ".....KKKKKK.....",
];

export const PLAYER_JUMP = [
  ...HEAD.slice(0, 11),
  ".KSRRRRRRRRRLLK.",
  "KSKRRRRRRRRKLLK.",
  "KK..KRRRRRRKLLK.",
  "....KBBBBBBK....",
  "...KBBKKKBBBK...",
  "..KBBK...KBBK...",
  "..KDDK....KDDK..",
  "..KKK......KKK..",
];

export const playerPalette: Palette = {
  K: "#1a1423",
  H: "#6b3a1e",
  S: "#f4c69b",
  G: "#1a1423",
  E: "#ffffff",
  M: "#c2413b",
  R: "#e63946",
  B: "#2f5da8",
  D: "#3b2a20",
  L: "#9aa4b1",
};

export const SLIME = [
  "....KKKKKK....",
  "..KKCCCCCCKK..",
  ".KCCCCCCCCCCK.",
  ".KCWWCCCCWWCK.",
  "KCCWKCCCCWKCCK",
  "KCCCCCCCCCCCCK",
  "KCCCKKKKKKCCCK",
  "KCCCKTTTTKCCCK",
  "KCCCCCCCCCCCCK",
  ".KKKKKKKKKKKK.",
];

export const SLIME_SQUASH = [
  "..KKKKKKKKKK..",
  ".KCCCCCCCCCCK.",
  "KCCKKCCCCKKCCK",
  "KCCCCCCCCCCCCK",
  ".KKKKKKKKKKKK.",
];

export const slimePalette = (c: string): Palette => ({
  K: "#1a1423",
  C: c,
  W: "#ffffff",
  T: "#ffffff",
});

export const HEART = [
  ".KK.KK.",
  "KRRKRRK",
  "KRRRRRK",
  ".KRRRK.",
  "..KRK..",
  "...K...",
];

export const COFFEE = [
  "..W.W...",
  ".W.W....",
  "KKKKKKK.",
  "KCCCCCKK",
  "KCCCCCK.K",
  "KCCCCCKK",
  ".KKKKK..",
];

export const DOC = [
  "KKKKKK..",
  "KWWWWKK.",
  "KWLLWWK.",
  "KWWWWWK.",
  "KWLLLWK.",
  "KWWWWWK.",
  "KWLLLWK.",
  "KKKKKKK.",
];

export const iconPalette: Palette = {
  K: "#1a1423",
  R: "#e63946",
  W: "#ffffff",
  C: "#8a5a3b",
  L: "#9aa4b1",
};

export const BELL = [
  "....KK....",
  "...KYYK...",
  "..KYYYYK..",
  "..KYYYYK..",
  ".KYYYYYYK.",
  ".KYYYYYYK.",
  "KYYYYYYYYK",
  "KKKKKKKKKK",
  "....KK....",
];

export const CURSOR = [
  "K.........",
  "KK........",
  "KWK.......",
  "KWWK......",
  "KWWWK.....",
  "KWWWWK....",
  "KWWWWWK...",
  "KWWWWWWK..",
  "KWWWKKKKK.",
  "KWKWK.....",
  "KK.KWK....",
  "....KWK...",
  "....KK....",
];

export const brandPalette = { K: "#1a1423", Y: "#ffd166", W: "#ffffff" };
