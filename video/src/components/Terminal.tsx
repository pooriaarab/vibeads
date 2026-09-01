import React from "react";
import { BG, CYAN, DIM, GRAY, GREEN, ORANGE, RED, WHITE } from "../theme";

const TrafficLight: React.FC<{ color: string }> = ({ color }) => {
  return (
    <div
      style={{
        width: 14,
        height: 14,
        borderRadius: "50%",
        background: color,
      }}
    />
  );
};

const TerminalTitleBar: React.FC = () => {
  return (
    <div
      style={{
        background: "#1c2128",
        padding: "14px 20px",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <TrafficLight color={RED} />
      <TrafficLight color={ORANGE} />
      <TrafficLight color={GREEN} />
      <span
        style={{
          color: GRAY,
          fontFamily: "system-ui",
          fontSize: 14,
          marginLeft: 12,
        }}
      >
        claude — ~/my-app
      </span>
    </div>
  );
};

const TerminalStatusLine: React.FC<{
  statusLine?: string;
  statusLineGlow?: boolean;
}> = ({ statusLine, statusLineGlow = false }) => {
  return (
    <div
      style={{
        background: "#1c2128",
        padding: "10px 20px",
        borderTop: `1px solid ${DIM}`,
        fontFamily: "'SF Mono', 'Fira Code', monospace",
        fontSize: 14,
        color: statusLineGlow ? CYAN : GRAY,
        textShadow: statusLineGlow ? `0 0 10px ${CYAN}40, 0 0 20px ${CYAN}20` : "none",
        transition: "all 0.3s",
      }}
    >
      {statusLine || ""}
    </div>
  );
};

const TerminalBody: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div
      style={{
        background: BG,
        padding: "30px 36px",
        minHeight: 400,
        fontFamily: "'SF Mono', 'Fira Code', monospace",
        fontSize: 22,
        lineHeight: 1.7,
        color: WHITE,
        flex: 1,
      }}
    >
      {children}
    </div>
  );
};

export const Terminal: React.FC<{
  children: React.ReactNode;
  scale?: number;
  statusLine?: string;
  showStatusLine?: boolean;
  statusLineGlow?: boolean;
}> = ({ children, scale = 1, statusLine, showStatusLine = false, statusLineGlow = false }) => {
  return (
    <div
      style={{
        width: 1400,
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 25px 80px rgba(0,0,0,0.6)",
        transform: `scale(${scale})`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <TerminalTitleBar />
      <TerminalBody>{children}</TerminalBody>
      {showStatusLine && (
        <TerminalStatusLine statusLine={statusLine} statusLineGlow={statusLineGlow} />
      )}
    </div>
  );
};
