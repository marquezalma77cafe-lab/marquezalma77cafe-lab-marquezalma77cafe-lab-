import { Composition } from "remotion";
import { TeacherPositiveMessage } from "./TeacherPositiveMessage";

export const FPS = 30;
export const DURATION_IN_FRAMES = 270;

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="TeacherPositiveMessage"
      component={TeacherPositiveMessage}
      durationInFrames={DURATION_IN_FRAMES}
      fps={FPS}
      width={1080}
      height={1920}
    />
  );
};
