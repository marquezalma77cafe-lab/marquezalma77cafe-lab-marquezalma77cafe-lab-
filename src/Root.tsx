import { Composition } from "remotion";
import { TeacherPositiveMessage } from "./TeacherPositiveMessage";
import { ChevroletAveoSaltillo } from "./ChevroletAveoSaltillo";

export const FPS = 30;
export const DURATION_IN_FRAMES = 270;

export const AVEO_FPS = 30;
export const AVEO_DURATION_IN_FRAMES = 300; // 10s @ 30fps

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
      <Composition
        id="ChevroletAveoSaltillo"
        component={ChevroletAveoSaltillo}
        durationInFrames={AVEO_DURATION_IN_FRAMES}
        fps={AVEO_FPS}
        width={1080}
        height={1920}
      />
    </>
  );
};
