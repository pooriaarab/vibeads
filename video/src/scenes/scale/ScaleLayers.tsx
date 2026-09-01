import React from "react";
import { spring } from "remotion";
import { StatBlock, StatCaption } from "../../components/StatBlock";
import { ACCENT, CYAN, GREEN, ORANGE } from "../../theme";

const ScaleLayer: React.FC<{ i: number; localFrame: number }> = ({ i, localFrame }) => {
  const layerDelay = i * 5 + 30;
  const layerProgress = spring({
    frame: Math.max(0, localFrame - layerDelay),
    fps: 30,
    config: { damping: 15, stiffness: 180 },
  });
  const colors = [CYAN, GREEN, ACCENT, ORANGE, "#f778ba"];
  return (
    <div
      style={{
        position: "absolute",
        left: i * 8,
        top: i * 18,
        width: 180 - i * 10,
        height: 30,
        borderRadius: 6,
        background: `${colors[i]}30`,
        border: `2px solid ${colors[i]}`,
        opacity: layerProgress,
        transform: `translateY(${(1 - layerProgress) * 20}px)`,
      }}
    />
  );
};

export const ScaleLayers: React.FC<{
  localFrame: number;
  left: number;
  top: number;
}> = ({ localFrame, left, top }) => {
  return (
    <StatBlock left={left} top={top}>
      <div style={{ position: "relative", width: 200, height: 120 }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <ScaleLayer key={i} i={i} localFrame={localFrame} />
        ))}
      </div>
      <StatCaption
        localFrame={localFrame}
        value="5"
        caption="ad placements"
        valueRange={[55, 65]}
        captionRange={[60, 70]}
      />
    </StatBlock>
  );
};
