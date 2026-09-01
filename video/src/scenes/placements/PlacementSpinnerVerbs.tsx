import React from "react";
import { interpolate } from "remotion";
import { HighlightBox } from "../../components/HighlightBox";
import { Label } from "../../components/Label";
import { Spinner } from "../../components/Spinner";
import { Terminal } from "../../components/Terminal";
import { CYAN, DIM } from "../../theme";
import { PlacementFrame } from "./PlacementFrame";

export const PlacementSpinnerVerbs: React.FC<{
  localFrame: number;
  placementDuration: number;
}> = ({ localFrame, placementDuration }) => {
  const o = interpolate(
    localFrame,
    [0, 5, placementDuration - 5, placementDuration],
    [0, 1, 1, 0],
    { extrapolateRight: "clamp" },
  );
  return (
    <PlacementFrame o={o}>
      <Terminal scale={0.85}>
        <div style={{ color: DIM, fontSize: 18, marginBottom: 16 }}>
          Writing src/components/Button.tsx...
        </div>
        <HighlightBox color={CYAN} frame={localFrame}>
          <Spinner
            text="Ship schema changes with zero downtime. Try PlanetScale."
            frame={localFrame}
            color={CYAN}
            glowing
          />
        </HighlightBox>
      </Terminal>
      <Label text="Spinner Verbs" frame={localFrame} startFrame={8} />
    </PlacementFrame>
  );
};
