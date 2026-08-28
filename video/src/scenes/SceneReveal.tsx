import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { HighlightBox } from "../components/HighlightBox";
import { Spinner } from "../components/Spinner";
import { Terminal } from "../components/Terminal";
import { ACCENT, CYAN, DIM, GRAY, WHITE } from "../theme";
import { S4_START } from "../timings";

const RevealTerminal: React.FC<{
  localFrame: number;
  zoom: number;
  spinnerReveal: number;
  statusReveal: number;
}> = ({ localFrame, zoom, spinnerReveal, statusReveal }) => {
  return (
    <Terminal
      scale={zoom}
      showStatusLine={statusReveal > 0}
      statusLine={
        statusReveal > 0
          ? "Clerk (a16z) \u2014 Drop-in auth for React/Next.js. Free up to 10K MAU.  https://clerk.com"
          : ""
      }
      statusLineGlow={true}
    >
      <div style={{ color: GRAY, marginBottom: 8 }}>
        <span style={{ color: ACCENT }}>{">"}</span>{" "}
        <span style={{ color: WHITE }}>build me an app</span>
      </div>
      <div style={{ height: 20 }} />
      <div style={{ color: DIM, fontSize: 18, marginBottom: 16 }}>
        Claude is working...
      </div>
      <div style={{ opacity: spinnerReveal }}>
        <HighlightBox color={CYAN} frame={localFrame}>
          <Spinner
            text="Add auth in 5 lines with Clerk. Free up to 10K users."
            frame={localFrame}
            color={CYAN}
            glowing={true}
          />
        </HighlightBox>
      </div>
    </Terminal>
  );
};

export const SceneReveal: React.FC<{ frame: number }> = ({ frame }) => {
  const localFrame = frame - S4_START;
  const zoom = interpolate(localFrame, [0, 60, 90, 120], [1.3, 1.3, 1.1, 1], {
    extrapolateRight: "clamp",
  });
  const spinnerReveal = interpolate(localFrame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });
  const statusReveal = interpolate(localFrame, [50, 70], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <RevealTerminal
        localFrame={localFrame}
        zoom={zoom}
        spinnerReveal={spinnerReveal}
        statusReveal={statusReveal}
      />
    </AbsoluteFill>
  );
};
