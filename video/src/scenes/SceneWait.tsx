import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { HighlightBox } from "../components/HighlightBox";
import { Spinner } from "../components/Spinner";
import { Terminal } from "../components/Terminal";
import { ACCENT, DIM, GRAY, ORANGE, WHITE } from "../theme";
import { S2_START } from "../timings";

const WaitHighlight: React.FC<{
  localFrame: number;
  currentSpinner: string;
}> = ({ localFrame, currentSpinner }) => {
  return (
    <HighlightBox
      color={`${ORANGE}${Math.floor(
        interpolate(
          Math.sin(localFrame * 0.08),
          [-1, 1],
          [30, 80]
        )
      )
        .toString(16)
        .padStart(2, "0")}`}
      frame={localFrame}
    >
      <Spinner
        text={currentSpinner}
        frame={localFrame}
        color={DIM}
      />
    </HighlightBox>
  );
};

export const SceneWait: React.FC<{ frame: number }> = ({ frame }) => {
  const localFrame = frame - S2_START;
  // Slow zoom effect
  const zoom = interpolate(localFrame, [0, 120], [1, 1.15], {
    extrapolateRight: "clamp",
  });

  const spinnerTexts = [
    "Thinking...",
    "Reading files...",
    "Analyzing codebase...",
  ];
  const currentSpinner =
    spinnerTexts[
      Math.floor(localFrame / 40) % spinnerTexts.length
    ];

  return (
    <AbsoluteFill
      style={{
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Terminal scale={zoom}>
        <div style={{ color: GRAY, marginBottom: 8 }}>
          <span style={{ color: ACCENT }}>{">"}</span>{" "}
          <span style={{ color: WHITE }}>build me an app</span>
        </div>
        <div style={{ height: 20 }} />
        <div style={{ color: DIM, fontSize: 18, marginBottom: 16 }}>
          Claude is working...
        </div>
        <WaitHighlight
          localFrame={localFrame}
          currentSpinner={currentSpinner}
        />
      </Terminal>
    </AbsoluteFill>
  );
};
