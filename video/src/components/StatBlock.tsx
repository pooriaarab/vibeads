import React from "react";
import { interpolate } from "remotion";
import { GRAY, WHITE } from "../theme";

// One cell of the scene-6 stat grid: a visual, then a big number and a caption.
export const StatBlock: React.FC<{
  left: number;
  top: number;
  children: React.ReactNode;
}> = ({ left, top, children }) => {
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {children}
    </div>
  );
};

export const StatCaption: React.FC<{
  localFrame: number;
  value: string;
  caption: string;
  valueRange: readonly [number, number];
  captionRange: readonly [number, number];
}> = ({ localFrame, value, caption, valueRange, captionRange }) => {
  return (
    <>
      <div
        style={{
          color: WHITE,
          fontFamily: "system-ui",
          fontSize: 32,
          fontWeight: "700",
          marginTop: 20,
          opacity: interpolate(localFrame, valueRange, [0, 1], {
            extrapolateRight: "clamp",
          }),
        }}
      >
        {value}
      </div>
      <div
        style={{
          color: GRAY,
          fontFamily: "system-ui",
          fontSize: 18,
          opacity: interpolate(localFrame, captionRange, [0, 1], {
            extrapolateRight: "clamp",
          }),
        }}
      >
        {caption}
      </div>
    </>
  );
};
