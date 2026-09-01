import React from "react";
import { CYAN, GRAY, WHITE } from "../theme";

export const Spinner: React.FC<{
  text: string;
  frame: number;
  color?: string;
  glowing?: boolean;
}> = ({ text, frame, color = CYAN, glowing = false }) => {
  const spinChars = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  const idx = Math.floor(frame / 3) % spinChars.length;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        textShadow: glowing ? `0 0 15px ${color}60, 0 0 30px ${color}30` : "none",
      }}
    >
      <span style={{ color, fontSize: 24 }}>{spinChars[idx]}</span>
      <span
        style={{
          color: glowing ? WHITE : GRAY,
          fontSize: 22,
          fontFamily: "'SF Mono', 'Fira Code', monospace",
        }}
      >
        {text}
      </span>
    </div>
  );
};
