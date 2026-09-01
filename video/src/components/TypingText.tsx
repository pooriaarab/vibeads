import React from "react";
import { CYAN, GREEN } from "../theme";

const TypingCursor: React.FC<{
  showCursor: boolean;
  isDone: boolean;
  cursorVisible: boolean;
}> = ({ showCursor, isDone, cursorVisible }) => {
  if (!(showCursor && (!isDone || cursorVisible))) {
    return null;
  }

  return (
    <span
      style={{
        color: CYAN,
        opacity: cursorVisible ? 1 : 0,
      }}
    >
      {"\u2588"}
    </span>
  );
};

export const TypingText: React.FC<{
  text: string;
  frame: number;
  startFrame?: number;
  charsPerFrame?: number;
  color?: string;
  fontSize?: number;
  fontWeight?: string;
  showCursor?: boolean;
}> = ({
  text,
  frame,
  startFrame = 0,
  charsPerFrame = 0.8,
  color = GREEN,
  fontSize = 28,
  fontWeight = "400",
  showCursor = true,
}) => {
  const elapsed = Math.max(0, frame - startFrame);
  const chars = Math.min(Math.floor(elapsed * charsPerFrame), text.length);
  const displayText = text.slice(0, chars);
  const cursorVisible = Math.floor(frame / 15) % 2 === 0;
  const isDone = chars >= text.length;

  return (
    <span
      style={{
        fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
        fontSize,
        fontWeight,
        color,
        whiteSpace: "pre",
      }}
    >
      {displayText}
      <TypingCursor showCursor={showCursor} isDone={isDone} cursorVisible={cursorVisible} />
    </span>
  );
};
