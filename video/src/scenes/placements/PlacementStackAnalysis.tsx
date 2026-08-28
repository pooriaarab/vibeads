import React from "react";
import { interpolate } from "remotion";
import { Label } from "../../components/Label";
import { Terminal } from "../../components/Terminal";
import { CYAN, ORANGE } from "../../theme";
import { PlacementFrame } from "./PlacementFrame";

const StackWarning: React.FC<{
  opacity: number;
  children: React.ReactNode;
}> = ({ opacity, children }) => {
  return (
    <div style={{ color: ORANGE, opacity }}>
      {children}
    </div>
  );
};

// The three "missing from your stack" lines, in the order they fade in.
// `text` keeps its leading space: the warning sign is rendered as a separate
// JSX child, exactly as before, so the DOM text nodes stay unchanged.
const STACK_WARNINGS: readonly {
  readonly fadeIn: [number, number];
  readonly text: string;
}[] = [
  {
    fadeIn: [8, 15],
    text: " missing: No auth detected. Clerk gives you drop-in auth with 10K free MAU",
  },
  {
    fadeIn: [15, 22],
    text: " missing: No monitoring. PagerDuty free tier covers 5 users",
  },
  {
    fadeIn: [22, 29],
    text: " missing: No rate limiting. Arcjet adds security in 3 lines",
  },
];

export const PlacementStackAnalysis: React.FC<{
  localFrame: number;
  placementDuration: number;
}> = ({ localFrame, placementDuration }) => {
  const lf = localFrame - placementDuration * 3;
  const o = interpolate(
    lf,
    [0, 5, placementDuration - 5, placementDuration],
    [0, 1, 1, 0],
    { extrapolateRight: "clamp" }
  );
  return (
    <PlacementFrame o={o}>
      <Terminal scale={0.85}>
        <div
          style={{
            color: CYAN,
            fontSize: 18,
            marginBottom: 12,
          }}
        >
          [vibeads] Tech stack analysis:
        </div>
        <div
          style={{
            fontSize: 17,
            lineHeight: 2,
            fontFamily: "'SF Mono', monospace",
          }}
        >
          {STACK_WARNINGS.map((warning) => (
            <StackWarning
              key={warning.text}
              opacity={interpolate(lf, warning.fadeIn, [0, 1], {
                extrapolateRight: "clamp",
              })}
            >
              {"\u26A0"}
              {warning.text}
            </StackWarning>
          ))}
        </div>
      </Terminal>
      <Label
        text="Stack Analysis"
        frame={lf}
        startFrame={8}
      />
    </PlacementFrame>
  );
};
