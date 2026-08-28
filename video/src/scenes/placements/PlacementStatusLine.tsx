import React from "react";
import { interpolate } from "remotion";
import { Label } from "../../components/Label";
import { Spinner } from "../../components/Spinner";
import { Terminal } from "../../components/Terminal";
import { DIM } from "../../theme";
import { PlacementFrame } from "./PlacementFrame";

export const PlacementStatusLine: React.FC<{
  localFrame: number;
  placementDuration: number;
}> = ({ localFrame, placementDuration }) => {
  const lf = localFrame - placementDuration;
  const o = interpolate(
    lf,
    [0, 5, placementDuration - 5, placementDuration],
    [0, 1, 1, 0],
    { extrapolateRight: "clamp" }
  );
  return (
    <PlacementFrame o={o}>
      <Terminal
        scale={0.85}
        showStatusLine
        statusLine="Groq (a16z) \u2014 50x faster LLM inference. Free tier available.  https://groq.com"
        statusLineGlow
      >
        <div style={{ color: DIM, fontSize: 18 }}>
          Analyzing API response times...
        </div>
        <div style={{ height: 20 }} />
        <Spinner text="Checking dependencies..." frame={lf} color={DIM} />
      </Terminal>
      <Label text="Status Line" frame={lf} startFrame={8} />
    </PlacementFrame>
  );
};
