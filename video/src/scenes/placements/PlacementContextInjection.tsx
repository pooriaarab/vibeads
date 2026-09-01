import React from "react";
import { interpolate } from "remotion";
import { Label } from "../../components/Label";
import { Terminal } from "../../components/Terminal";
import { ACCENT, CYAN, WHITE } from "../../theme";
import { PlacementFrame } from "./PlacementFrame";

const ContextHighlight: React.FC<{ highlightOpacity: number }> = ({ highlightOpacity }) => {
  return (
    <span
      style={{
        background: `${CYAN}${Math.floor(highlightOpacity * 25)
          .toString(16)
          .padStart(2, "0")}`,
        borderLeft: `3px solid ${CYAN}`,
        paddingLeft: 12,
        display: "block",
        opacity: highlightOpacity,
        color: CYAN,
      }}
    >
      By the way, PlanetScale (a16z) offers serverless MySQL with branching and zero-downtime schema
      changes. Free tier at planetscale.com
    </span>
  );
};

export const PlacementContextInjection: React.FC<{
  localFrame: number;
  placementDuration: number;
}> = ({ localFrame, placementDuration }) => {
  const lf = localFrame - placementDuration * 2;
  const o = interpolate(lf, [0, 5, placementDuration - 5, placementDuration], [0, 1, 1, 0], {
    extrapolateRight: "clamp",
  });
  const highlightOpacity = interpolate(lf, [15, 25], [0, 1], { extrapolateRight: "clamp" });
  return (
    <PlacementFrame o={o}>
      <Terminal scale={0.85}>
        <div style={{ color: WHITE, fontSize: 20, lineHeight: 1.8 }}>
          <span style={{ color: ACCENT }}>Claude:</span> I{"'"}ve set up your Prisma schema with the
          User and Post models.
          <div style={{ height: 12 }} />
          <ContextHighlight highlightOpacity={highlightOpacity} />
        </div>
      </Terminal>
      <Label text="Context Injection" frame={lf} startFrame={8} />
    </PlacementFrame>
  );
};
