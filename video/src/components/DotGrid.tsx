import React from "react";
import { interpolate } from "remotion";
import { CYAN } from "../theme";

const GridDot: React.FC<{
  i: number;
  cols: number;
  elapsed: number;
  count: number;
  color: string;
}> = ({ i, cols, elapsed, count, color }) => {
  const row = Math.floor(i / cols);
  const col = i % cols;
  const dotDelay = (i / count) * 10;
  const dotOpacity = interpolate(elapsed - dotDelay, [0, 5], [0, 0.8], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: col * 8,
        top: row * 8,
        width: 5,
        height: 5,
        borderRadius: "50%",
        background: color,
        opacity: dotOpacity,
      }}
    />
  );
};

export const DotGrid: React.FC<{
  count: number;
  frame: number;
  startFrame: number;
  color?: string;
}> = ({ count, frame, startFrame, color = CYAN }) => {
  const elapsed = frame - startFrame;
  const cols = Math.ceil(Math.sqrt(count * 2));
  const rows = Math.ceil(count / cols);
  const visibleDots = Math.min(
    Math.floor(
      interpolate(elapsed, [0, 40], [0, count], {
        extrapolateRight: "clamp",
      }),
    ),
    count,
  );

  const dots: React.ReactNode[] = [];
  for (let i = 0; i < visibleDots; i++) {
    dots.push(<GridDot key={i} i={i} cols={cols} elapsed={elapsed} count={count} color={color} />);
  }

  return (
    <div
      style={{
        position: "relative",
        width: cols * 8,
        height: rows * 8,
      }}
    >
      {dots}
    </div>
  );
};
