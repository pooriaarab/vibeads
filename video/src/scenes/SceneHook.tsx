import React from "react";
import { AbsoluteFill } from "remotion";
import { Terminal } from "../components/Terminal";
import { TypingText } from "../components/TypingText";
import { BG, CYAN, GRAY, GREEN, WHITE } from "../theme";

export const SceneHook: React.FC<{ frame: number }> = ({ frame }) => {
  return (
    <AbsoluteFill
      style={{
        background: BG,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Terminal scale={0.9}>
        <div style={{ marginBottom: 12 }}>
          <span style={{ color: CYAN, fontSize: 18 }}>~/my-app</span>
          <span style={{ color: GRAY, fontSize: 18 }}> on </span>
          <span style={{ color: GREEN, fontSize: 18 }}>main</span>
        </div>
        <div
          style={{
            fontFamily: "'SF Mono', 'Fira Code', monospace",
            fontSize: 32,
          }}
        >
          <span style={{ color: GRAY }}>$ </span>
          <TypingText
            text='claude "build me an app"'
            frame={frame}
            startFrame={5}
            charsPerFrame={0.8}
            color={WHITE}
            fontSize={32}
          />
        </div>
      </Terminal>
    </AbsoluteFill>
  );
};
