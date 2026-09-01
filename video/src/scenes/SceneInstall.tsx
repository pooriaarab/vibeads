import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { Terminal } from "../components/Terminal";
import { TypingText } from "../components/TypingText";
import { CYAN, GRAY, GREEN, WHITE } from "../theme";
import { S7_START } from "../timings";

const InstallResults: React.FC<{
  line2Opacity: number;
  line3Opacity: number;
  line4Opacity: number;
}> = ({ line2Opacity, line3Opacity, line4Opacity }) => {
  return (
    <>
      <div style={{ height: 20 }} />
      <div
        style={{
          color: CYAN,
          opacity: line2Opacity,
          fontSize: 20,
        }}
      >
        vibeads {"\u2014"} contextual dev tool discovery for Claude Code
      </div>
      <div
        style={{
          color: GRAY,
          opacity: line3Opacity,
          fontSize: 18,
        }}
      >
        Powered by a16z portfolio
      </div>
      <div style={{ height: 12 }} />
      <div
        style={{
          color: GREEN,
          opacity: line4Opacity,
          fontSize: 22,
          fontWeight: "600",
        }}
      >
        {"\u2714"} Ready!
      </div>
    </>
  );
};

const InstallTerminal: React.FC<{
  localFrame: number;
  line1Done: boolean;
  line2Opacity: number;
  line3Opacity: number;
  line4Opacity: number;
}> = ({ localFrame, line1Done, line2Opacity, line3Opacity, line4Opacity }) => {
  return (
    <Terminal scale={1}>
      <div>
        <span style={{ color: GRAY }}>$ </span>
        <TypingText
          text="npm install -g vibeads"
          frame={localFrame}
          startFrame={5}
          charsPerFrame={0.8}
          color={WHITE}
          fontSize={24}
          showCursor={!line1Done}
        />
      </div>
      {line1Done && (
        <InstallResults
          line2Opacity={line2Opacity}
          line3Opacity={line3Opacity}
          line4Opacity={line4Opacity}
        />
      )}
    </Terminal>
  );
};

export const SceneInstall: React.FC<{ frame: number }> = ({ frame }) => {
  const localFrame = frame - S7_START;

  const line1Done = localFrame > 50;
  const line2Opacity = interpolate(localFrame, [52, 58], [0, 1], {
    extrapolateRight: "clamp",
  });
  const line3Opacity = interpolate(localFrame, [60, 66], [0, 1], {
    extrapolateRight: "clamp",
  });
  const line4Opacity = interpolate(localFrame, [68, 74], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <InstallTerminal
        localFrame={localFrame}
        line1Done={line1Done}
        line2Opacity={line2Opacity}
        line3Opacity={line3Opacity}
        line4Opacity={line4Opacity}
      />
    </AbsoluteFill>
  );
};
