import React from "react";
import { spring } from "remotion";
import { ACCENT } from "../theme";

export const Label: React.FC<{
  text: string;
  frame: number;
  startFrame: number;
}> = ({ text, frame, startFrame }) => {
  const progress = spring({
    frame: frame - startFrame,
    fps: 30,
    config: { damping: 15, stiffness: 200 },
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 30,
        right: 40,
        background: ACCENT,
        color: "#000",
        padding: "8px 20px",
        borderRadius: 6,
        fontSize: 18,
        fontWeight: "700",
        fontFamily: "system-ui",
        letterSpacing: 2,
        textTransform: "uppercase",
        transform: `translateX(${(1 - progress) * 100}px)`,
        opacity: progress,
        boxShadow: `0 0 20px ${ACCENT}40`,
      }}
    >
      {text}
    </div>
  );
};
