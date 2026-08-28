import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { SceneClose } from "./scenes/SceneClose";
import { SceneDeadSpace } from "./scenes/SceneDeadSpace";
import { SceneHook } from "./scenes/SceneHook";
import { SceneInstall } from "./scenes/SceneInstall";
import { ScenePlacements } from "./scenes/ScenePlacements";
import { SceneReveal } from "./scenes/SceneReveal";
import { SceneScale } from "./scenes/SceneScale";
import { SceneWait } from "./scenes/SceneWait";
import {
  S1_END,
  S1_START,
  S2_END,
  S2_START,
  S3_END,
  S3_START,
  S4_END,
  S4_START,
  S5_END,
  S5_START,
  S6_END,
  S6_START,
  S7_END,
  S7_START,
  S8_END,
  S8_START,
} from "./timings";

// Every scene reads the ABSOLUTE frame, so each one takes `frame` as a prop.
// A scene must never call useCurrentFrame() itself: it renders inside a
// <Sequence>, so the hook would hand it a sequence-relative frame and shift
// every animation.
const SCENES: readonly {
  readonly title: string;
  readonly from: number;
  readonly to: number;
  readonly Scene: React.FC<{ frame: number }>;
}[] = [
  { title: "1: THE HOOK (0-3s)", from: S1_START, to: S1_END, Scene: SceneHook },
  { title: "2: THE WAIT (3-7s)", from: S2_START, to: S2_END, Scene: SceneWait },
  { title: "3: THE DEAD SPACE (7-10s)", from: S3_START, to: S3_END, Scene: SceneDeadSpace },
  { title: "4: THE REVEAL (10-14s)", from: S4_START, to: S4_END, Scene: SceneReveal },
  { title: "5: THE PLACEMENTS (14-20s)", from: S5_START, to: S5_END, Scene: ScenePlacements },
  { title: "6: THE SCALE (20-24s)", from: S6_START, to: S6_END, Scene: SceneScale },
  { title: "7: THE INSTALL (24-27s)", from: S7_START, to: S7_END, Scene: SceneInstall },
  { title: "8: THE CLOSE (27-30s)", from: S8_START, to: S8_END, Scene: SceneClose },
];

export const VibeadsDemo: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {/* Background music */}
      <Audio
        src={staticFile("audio/music.mp3")}
        volume={(f) => {
          // Duck during narration (scenes 2-6), louder on intro/outro
          if (f < S2_START || f > S6_END) return 0.35;
          return 0.12;
        }}
      />

      {/* Narration - starts at scene 2 */}
      <Sequence from={S2_START}>
        <Audio src={staticFile("audio/narration.mp3")} volume={1} />
      </Sequence>

      {SCENES.map(({ title, from, to, Scene }) => (
        <Sequence key={title} from={from} durationInFrames={to - from}>
          <Scene frame={frame} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
