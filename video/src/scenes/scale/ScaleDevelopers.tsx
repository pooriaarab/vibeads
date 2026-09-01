import React from "react";
import { DotGrid } from "../../components/DotGrid";
import { StatBlock, StatCaption } from "../../components/StatBlock";
import { CYAN } from "../../theme";

export const ScaleDevelopers: React.FC<{
  localFrame: number;
  left: number;
  top: number;
}> = ({ localFrame, left, top }) => {
  return (
    <StatBlock left={left} top={top}>
      <DotGrid count={400} frame={localFrame} startFrame={0} color={CYAN} />
      <StatCaption
        localFrame={localFrame}
        value="3,000,000+"
        caption="developers"
        valueRange={[20, 30]}
        captionRange={[25, 35]}
      />
    </StatBlock>
  );
};
