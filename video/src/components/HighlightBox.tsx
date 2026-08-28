import React from "react";
import { ORANGE } from "../theme";

export const HighlightBox: React.FC<{
  children: React.ReactNode;
  color?: string;
  frame: number;
}> = ({ children, color = ORANGE, frame }) => {
  const pulse = Math.sin(frame * 0.15) * 0.3 + 0.7;

  return (
    <div
      style={{
        border: `2px solid ${color}`,
        borderRadius: 8,
        padding: "8px 16px",
        boxShadow: `0 0 ${20 * pulse}px ${color}${Math.floor(pulse * 60)
          .toString(16)
          .padStart(2, "0")}, inset 0 0 ${10 * pulse}px ${color}15`,
        display: "inline-block",
      }}
    >
      {children}
    </div>
  );
};
