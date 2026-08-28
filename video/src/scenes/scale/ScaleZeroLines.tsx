import React from "react";
import { interpolate } from "remotion";
import { StatBlock, StatCaption } from "../../components/StatBlock";
import { BG_LIGHTER, DIM, GREEN } from "../../theme";

export const ScaleZeroLines: React.FC<{
  localFrame: number;
  left: number;
  top: number;
}> = ({ localFrame, left, top }) => {
  return (
    <StatBlock left={left} top={top}>
      <div
        style={{
          background: BG_LIGHTER,
          borderRadius: 12,
          padding: "20px 30px",
          border: `1px solid ${DIM}`,
          opacity: interpolate(localFrame, [50, 60], [0, 1], {
            extrapolateRight: "clamp",
          }),
        }}
      >
        <span
          style={{
            fontFamily: "'SF Mono', monospace",
            fontSize: 20,
            color: GREEN,
          }}
        >
          $ npm install -g vibeads
        </span>
      </div>
      <StatCaption
        localFrame={localFrame}
        value="0"
        caption="lines of code to install"
        valueRange={[65, 75]}
        captionRange={[70, 80]}
      />
    </StatBlock>
  );
};
