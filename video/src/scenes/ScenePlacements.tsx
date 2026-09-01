import React from "react";
import { AbsoluteFill } from "remotion";
import { S5_START } from "../timings";
import { PlacementContextInjection } from "./placements/PlacementContextInjection";
import { PlacementSpinnerVerbs } from "./placements/PlacementSpinnerVerbs";
import { PlacementStackAnalysis } from "./placements/PlacementStackAnalysis";
import { PlacementStatusLine } from "./placements/PlacementStatusLine";

const PlacementContent: React.FC<{
  localFrame: number;
  placementDuration: number;
}> = ({ localFrame, placementDuration }) => {
  if (localFrame < placementDuration) {
    return <PlacementSpinnerVerbs localFrame={localFrame} placementDuration={placementDuration} />;
  }

  if (localFrame < placementDuration * 2) {
    return <PlacementStatusLine localFrame={localFrame} placementDuration={placementDuration} />;
  }

  if (localFrame < placementDuration * 3) {
    return (
      <PlacementContextInjection localFrame={localFrame} placementDuration={placementDuration} />
    );
  }

  return <PlacementStackAnalysis localFrame={localFrame} placementDuration={placementDuration} />;
};

export const ScenePlacements: React.FC<{ frame: number }> = ({ frame }) => {
  const localFrame = frame - S5_START;
  const placementDuration = 45; // 1.5s each

  return (
    <AbsoluteFill
      style={{
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <PlacementContent localFrame={localFrame} placementDuration={placementDuration} />
    </AbsoluteFill>
  );
};
