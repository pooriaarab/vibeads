import { Composition } from "remotion";
import { VibeadsDemo } from "./VibeadsDemo";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="VibeadsDemo"
      component={VibeadsDemo}
      durationInFrames={900}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
