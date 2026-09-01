import React from "react";
import { AbsoluteFill, interpolate, spring } from "remotion";
import { HighlightBox } from "../components/HighlightBox";
import { Spinner } from "../components/Spinner";
import { Terminal } from "../components/Terminal";
import { DIM, RED, WHITE } from "../theme";
import { S3_START } from "../timings";

const DeadSpaceCut1: React.FC<{
  localFrame: number;
  cutDuration: number;
}> = ({ localFrame, cutDuration }) => {
  const cutOpacity = interpolate(localFrame, [0, 3, cutDuration - 3, cutDuration], [0, 1, 1, 0], {
    extrapolateRight: "clamp",
  });
  return (
    <div style={{ opacity: cutOpacity }}>
      <Terminal scale={0.8}>
        <HighlightBox color={RED} frame={localFrame}>
          <Spinner text="Thinking..." frame={localFrame} color={DIM} />
        </HighlightBox>
      </Terminal>
    </div>
  );
};

const DeadSpaceCut2: React.FC<{
  localFrame: number;
  cutDuration: number;
}> = ({ localFrame, cutDuration }) => {
  const cutOpacity = interpolate(
    localFrame - cutDuration,
    [0, 3, cutDuration - 3, cutDuration],
    [0, 1, 1, 0],
    { extrapolateRight: "clamp" },
  );
  return (
    <div style={{ opacity: cutOpacity }}>
      <Terminal scale={0.8} showStatusLine statusLine="">
        <div style={{ color: DIM }}>
          <Spinner text="Reading project..." frame={localFrame} color={DIM} />
        </div>
      </Terminal>
    </div>
  );
};

const DeadSpaceCut3: React.FC<{
  localFrame: number;
  cutDuration: number;
}> = ({ localFrame, cutDuration }) => {
  const cutOpacity = interpolate(
    localFrame - cutDuration * 2,
    [0, 3, cutDuration - 3, cutDuration],
    [0, 1, 1, 0],
    { extrapolateRight: "clamp" },
  );
  return (
    <div style={{ opacity: cutOpacity }}>
      <Terminal scale={0.8}>
        <div style={{ color: DIM, fontSize: 18 }}>Starting session...</div>
        <div style={{ height: 200 }} />
      </Terminal>
    </div>
  );
};

const DeadSpaceText: React.FC<{
  localFrame: number;
  cutDuration: number;
}> = ({ localFrame, cutDuration }) => {
  const textProgress = spring({
    frame: localFrame - cutDuration * 3,
    fps: 30,
    config: { damping: 10, stiffness: 150 },
  });

  return (
    <div
      style={{
        fontSize: 120,
        fontWeight: "900",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: WHITE,
        letterSpacing: 12,
        transform: `scale(${0.5 + textProgress * 0.5})`,
        opacity: textProgress,
        textShadow: `0 0 40px ${RED}60, 0 0 80px ${RED}30`,
      }}
    >
      DEAD TIME
    </div>
  );
};

const DeadSpaceCuts: React.FC<{
  localFrame: number;
  cutDuration: number;
}> = ({ localFrame, cutDuration }) => {
  if (localFrame < cutDuration) {
    return <DeadSpaceCut1 localFrame={localFrame} cutDuration={cutDuration} />;
  }

  if (localFrame < cutDuration * 2) {
    return <DeadSpaceCut2 localFrame={localFrame} cutDuration={cutDuration} />;
  }

  if (localFrame < cutDuration * 3) {
    return <DeadSpaceCut3 localFrame={localFrame} cutDuration={cutDuration} />;
  }

  return <DeadSpaceText localFrame={localFrame} cutDuration={cutDuration} />;
};

export const SceneDeadSpace: React.FC<{ frame: number }> = ({ frame }) => {
  const localFrame = frame - S3_START;
  const cutDuration = 25; // ~0.83s each

  return (
    <AbsoluteFill
      style={{
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <DeadSpaceCuts localFrame={localFrame} cutDuration={cutDuration} />
    </AbsoluteFill>
  );
};
