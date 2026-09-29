import { Composition, Folder } from "remotion";
import { TeacherPositiveMessage } from "./TeacherPositiveMessage";
import { FRASES, LIENZO, VIDEO } from "./frases/config";
import {
  FraseFija,
  FrasesOverlay,
  VideoConFrases,
  calcularMetadata,
  calcularMetadataFija,
} from "./frases/FrasesOverlay";

export const FPS = 30;
export const DURATION_IN_FRAMES = 270;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TeacherPositiveMessage"
        component={TeacherPositiveMessage}
        durationInFrames={DURATION_IN_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
      />
      <Folder name="Frases">
        <Composition
          id="FrasesOverlay"
          component={FrasesOverlay}
          calculateMetadata={calcularMetadata}
          durationInFrames={1}
          fps={LIENZO.fps}
          width={LIENZO.ancho}
          height={LIENZO.alto}
        />
        {VIDEO ? (
          <Composition
            id="VideoConFrases"
            component={VideoConFrases}
            calculateMetadata={calcularMetadata}
            durationInFrames={1}
            fps={LIENZO.fps}
            width={LIENZO.ancho}
            height={LIENZO.alto}
          />
        ) : null}
        {FRASES.map((_, i) => (
          <Composition
            key={i}
            id={`Frase-${String(i + 1).padStart(2, "0")}`}
            component={FraseFija}
            calculateMetadata={calcularMetadataFija}
            defaultProps={{ indice: i }}
            durationInFrames={1}
            fps={LIENZO.fps}
            width={LIENZO.ancho}
            height={LIENZO.alto}
          />
        ))}
      </Folder>
    </>
  );
};
