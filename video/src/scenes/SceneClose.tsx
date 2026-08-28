import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { CYAN, DIM, GRAY, WHITE } from "../theme";
import { S8_START } from "../timings";

// The three closing lines, top to bottom, each fading in after the one above.
const CLOSE_LINES: readonly {
  readonly fadeIn: [number, number];
  readonly text: string;
  readonly style: React.CSSProperties;
}[] = [
  {
    fadeIn: [0, 20],
    text: "vibeads",
    style: {
      fontSize: 96,
      fontWeight: "900",
      fontFamily: "system-ui, -apple-system, sans-serif",
      color: WHITE,
      letterSpacing: 8,
      textShadow: `0 0 40px ${CYAN}40`,
    },
  },
  {
    fadeIn: [20, 40],
    text: "ads for the age of vibecoding",
    style: {
      fontSize: 28,
      fontFamily: "system-ui",
      color: GRAY,
      marginTop: 20,
      letterSpacing: 4,
    },
  },
  {
    fadeIn: [40, 55],
    text: "github.com/pooriaarab/vibeads",
    style: {
      fontSize: 18,
      fontFamily: "'SF Mono', monospace",
      color: DIM,
      marginTop: 40,
    },
  },
];

export const SceneClose: React.FC<{ frame: number }> = ({ frame }) => {
  const localFrame = frame - S8_START;

  return (
    <AbsoluteFill
      style={{
        background: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {CLOSE_LINES.map((line) => (
        <div
          key={line.text}
          style={{
            ...line.style,
            opacity: interpolate(localFrame, line.fadeIn, [0, 1], {
              extrapolateRight: "clamp",
            }),
          }}
        >
          {line.text}
        </div>
      ))}
    </AbsoluteFill>
  );
};
