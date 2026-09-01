import React from "react";
import { interpolate, spring } from "remotion";
import { StatBlock, StatCaption } from "../../components/StatBlock";
import { ACCENT, CYAN, GREEN, ORANGE } from "../../theme";

const PortfolioDot: React.FC<{ i: number; localFrame: number }> = ({ i, localFrame }) => {
  const colors = [CYAN, GREEN, ACCENT, ORANGE, "#f778ba"];
  const delay = i * 2;
  const dotOpacity = interpolate(localFrame - delay, [10, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dotScale = spring({
    frame: Math.max(0, localFrame - delay - 10),
    fps: 30,
    config: { damping: 12, stiffness: 200 },
  });
  return (
    <div
      style={{
        width: 28,
        height: 28,
        borderRadius: "50%",
        background: colors[i % colors.length],
        opacity: dotOpacity,
        transform: `scale(${dotScale})`,
        boxShadow: `0 0 10px ${colors[i % colors.length]}40`,
      }}
    />
  );
};

export const ScalePortfolio: React.FC<{
  localFrame: number;
  left: number;
  top: number;
}> = ({ localFrame, left, top }) => {
  return (
    <StatBlock left={left} top={top}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          width: 200,
          gap: 12,
          justifyContent: "center",
        }}
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <PortfolioDot key={i} i={i} localFrame={localFrame} />
        ))}
      </div>
      <StatCaption
        localFrame={localFrame}
        value="20"
        caption="portfolio companies"
        valueRange={[40, 50]}
        captionRange={[45, 55]}
      />
    </StatBlock>
  );
};
