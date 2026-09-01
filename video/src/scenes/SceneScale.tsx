import React from "react";
import { AbsoluteFill } from "remotion";
import { BG } from "../theme";
import { S6_START } from "../timings";
import { ScaleDevelopers } from "./scale/ScaleDevelopers";
import { ScaleLayers } from "./scale/ScaleLayers";
import { ScalePortfolio } from "./scale/ScalePortfolio";
import { ScaleZeroLines } from "./scale/ScaleZeroLines";

export const SceneScale: React.FC<{ frame: number }> = ({ frame }) => {
  const localFrame = frame - S6_START;

  // Layout: 4 visual blocks in a 2x2 grid
  const row1Y = 250;
  const row2Y = 620;
  const col1X = 340;
  const col2X = 1100;

  return (
    <AbsoluteFill
      style={{
        background: BG,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <AbsoluteFill>
        <ScaleDevelopers localFrame={localFrame} left={col1X} top={row1Y} />
        <ScalePortfolio localFrame={localFrame} left={col2X} top={row1Y} />
        <ScaleLayers localFrame={localFrame} left={col1X} top={row2Y} />
        <ScaleZeroLines localFrame={localFrame} left={col2X} top={row2Y} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
