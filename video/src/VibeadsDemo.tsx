import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
  Easing,
} from "remotion";

// ─── COLORS ───
const BG = "#0d1117";
const BG_LIGHTER = "#161b22";
const CYAN = "#58a6ff";
const GREEN = "#3fb950";
const ORANGE = "#f0883e";
const RED = "#f85149";
const WHITE = "#e6edf3";
const GRAY = "#8b949e";
const DIM = "#484f58";
const ACCENT = "#bc8cff";

// ─── SCENE TIMINGS (frames at 30fps) ───
const S1_START = 0;
const S1_END = 90; // 0-3s
const S2_START = 90;
const S2_END = 210; // 3-7s
const S3_START = 210;
const S3_END = 300; // 7-10s
const S4_START = 300;
const S4_END = 420; // 10-14s
const S5_START = 420;
const S5_END = 600; // 14-20s
const S6_START = 600;
const S6_END = 720; // 20-24s
const S7_START = 720;
const S7_END = 810; // 24-27s
const S8_START = 810;
const S8_END = 900; // 27-30s

// ─── COMPONENTS ───

const TypingText: React.FC<{
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
      {showCursor && (!isDone || cursorVisible) && (
        <span
          style={{
            color: CYAN,
            opacity: cursorVisible ? 1 : 0,
          }}
        >
          {"\u2588"}
        </span>
      )}
    </span>
  );
};

const Terminal: React.FC<{
  children: React.ReactNode;
  scale?: number;
  statusLine?: string;
  showStatusLine?: boolean;
  statusLineGlow?: boolean;
}> = ({
  children,
  scale = 1,
  statusLine,
  showStatusLine = false,
  statusLineGlow = false,
}) => {
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
      {/* Title bar */}
      <div
        style={{
          background: "#1c2128",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: RED,
          }}
        />
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: ORANGE,
          }}
        />
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: GREEN,
          }}
        />
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

      {/* Terminal body */}
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

      {/* Status line */}
      {showStatusLine && (
        <div
          style={{
            background: "#1c2128",
            padding: "10px 20px",
            borderTop: `1px solid ${DIM}`,
            fontFamily: "'SF Mono', 'Fira Code', monospace",
            fontSize: 14,
            color: statusLineGlow ? CYAN : GRAY,
            textShadow: statusLineGlow
              ? `0 0 10px ${CYAN}40, 0 0 20px ${CYAN}20`
              : "none",
            transition: "all 0.3s",
          }}
        >
          {statusLine || ""}
        </div>
      )}
    </div>
  );
};

const Spinner: React.FC<{
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
        textShadow: glowing
          ? `0 0 15px ${color}60, 0 0 30px ${color}30`
          : "none",
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

const HighlightBox: React.FC<{
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

const Label: React.FC<{
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

const DotGrid: React.FC<{
  count: number;
  frame: number;
  startFrame: number;
  color?: string;
}> = ({ count, frame, startFrame, color = CYAN }) => {
  const elapsed = frame - startFrame;
  const cols = Math.ceil(Math.sqrt(count * 2));
  const rows = Math.ceil(count / cols);
  const visibleDots = Math.min(
    Math.floor(interpolate(elapsed, [0, 40], [0, count], {
      extrapolateRight: "clamp",
    })),
    count
  );

  const dots: React.ReactNode[] = [];
  for (let i = 0; i < visibleDots; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const dotDelay = (i / count) * 10;
    const dotOpacity = interpolate(elapsed - dotDelay, [0, 5], [0, 0.8], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

    dots.push(
      <div
        key={i}
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

// ─── MAIN COMPOSITION ───

export const VibeadsDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {/* Background music */}
      <Audio
        src={staticFile("audio/music.mp3")}
        volume={(f) => {
          // Duck during narration (scenes 2-6), louder on intro/outro
          if (f < S2_START || f > S6_END) return 0.35;
          return 0.12;
        }}
      />

      {/* Narration - starts at scene 2 */}
      <Sequence from={S2_START}>
        <Audio src={staticFile("audio/narration.mp3")} volume={1} />
      </Sequence>

      {/* ═══ SCENE 1: THE HOOK (0-3s) ═══ */}
      <Sequence from={S1_START} durationInFrames={S1_END - S1_START}>
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
      </Sequence>

      {/* ═══ SCENE 2: THE WAIT (3-7s) ═══ */}
      <Sequence from={S2_START} durationInFrames={S2_END - S2_START}>
        <AbsoluteFill
          style={{
            background: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {(() => {
            const localFrame = frame - S2_START;
            // Slow zoom effect
            const zoom = interpolate(localFrame, [0, 120], [1, 1.15], {
              extrapolateRight: "clamp",
            });

            const spinnerTexts = [
              "Thinking...",
              "Reading files...",
              "Analyzing codebase...",
            ];
            const currentSpinner =
              spinnerTexts[
                Math.floor(localFrame / 40) % spinnerTexts.length
              ];

            return (
              <Terminal scale={zoom}>
                <div style={{ color: GRAY, marginBottom: 8 }}>
                  <span style={{ color: ACCENT }}>{">"}</span>{" "}
                  <span style={{ color: WHITE }}>build me an app</span>
                </div>
                <div style={{ height: 20 }} />
                <div style={{ color: DIM, fontSize: 18, marginBottom: 16 }}>
                  Claude is working...
                </div>
                <HighlightBox
                  color={`${ORANGE}${Math.floor(
                    interpolate(
                      Math.sin(localFrame * 0.08),
                      [-1, 1],
                      [30, 80]
                    )
                  )
                    .toString(16)
                    .padStart(2, "0")}`}
                  frame={localFrame}
                >
                  <Spinner
                    text={currentSpinner}
                    frame={localFrame}
                    color={DIM}
                  />
                </HighlightBox>
              </Terminal>
            );
          })()}
        </AbsoluteFill>
      </Sequence>

      {/* ═══ SCENE 3: THE DEAD SPACE (7-10s) ═══ */}
      <Sequence from={S3_START} durationInFrames={S3_END - S3_START}>
        <AbsoluteFill
          style={{
            background: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {(() => {
            const localFrame = frame - S3_START;
            const cutDuration = 25; // ~0.83s each

            // Three rapid cuts
            if (localFrame < cutDuration) {
              // Cut 1: Spinner
              const cutOpacity = interpolate(
                localFrame,
                [0, 3, cutDuration - 3, cutDuration],
                [0, 1, 1, 0],
                { extrapolateRight: "clamp" }
              );
              return (
                <div style={{ opacity: cutOpacity }}>
                  <Terminal scale={0.8}>
                    <HighlightBox color={RED} frame={localFrame}>
                      <Spinner
                        text="Thinking..."
                        frame={localFrame}
                        color={DIM}
                      />
                    </HighlightBox>
                  </Terminal>
                </div>
              );
            }

            if (localFrame < cutDuration * 2) {
              // Cut 2: Empty status bar
              const cutOpacity = interpolate(
                localFrame - cutDuration,
                [0, 3, cutDuration - 3, cutDuration],
                [0, 1, 1, 0],
                { extrapolateRight: "clamp" }
              );
              return (
                <div style={{ opacity: cutOpacity }}>
                  <Terminal
                    scale={0.8}
                    showStatusLine
                    statusLine=""
                  >
                    <div style={{ color: DIM }}>
                      <Spinner
                        text="Reading project..."
                        frame={localFrame}
                        color={DIM}
                      />
                    </div>
                  </Terminal>
                </div>
              );
            }

            if (localFrame < cutDuration * 3) {
              // Cut 3: Blank session
              const cutOpacity = interpolate(
                localFrame - cutDuration * 2,
                [0, 3, cutDuration - 3, cutDuration],
                [0, 1, 1, 0],
                { extrapolateRight: "clamp" }
              );
              return (
                <div style={{ opacity: cutOpacity }}>
                  <Terminal scale={0.8}>
                    <div style={{ color: DIM, fontSize: 18 }}>
                      Starting session...
                    </div>
                    <div style={{ height: 200 }} />
                  </Terminal>
                </div>
              );
            }

            // "DEAD TIME" text
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
          })()}
        </AbsoluteFill>
      </Sequence>

      {/* ═══ SCENE 4: THE REVEAL (10-14s) ═══ */}
      <Sequence from={S4_START} durationInFrames={S4_END - S4_START}>
        <AbsoluteFill
          style={{
            background: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {(() => {
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
          })()}
        </AbsoluteFill>
      </Sequence>

      {/* ═══ SCENE 5: THE PLACEMENTS (14-20s) ═══ */}
      <Sequence from={S5_START} durationInFrames={S5_END - S5_START}>
        <AbsoluteFill
          style={{
            background: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {(() => {
            const localFrame = frame - S5_START;
            const placementDuration = 45; // 1.5s each

            // Placement 1: Spinner Verbs
            if (localFrame < placementDuration) {
              const o = interpolate(
                localFrame,
                [0, 5, placementDuration - 5, placementDuration],
                [0, 1, 1, 0],
                { extrapolateRight: "clamp" }
              );
              return (
                <div style={{ opacity: o, position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Terminal scale={0.85}>
                    <div style={{ color: DIM, fontSize: 18, marginBottom: 16 }}>
                      Writing src/components/Button.tsx...
                    </div>
                    <HighlightBox color={CYAN} frame={localFrame}>
                      <Spinner
                        text="Ship schema changes with zero downtime. Try PlanetScale."
                        frame={localFrame}
                        color={CYAN}
                        glowing
                      />
                    </HighlightBox>
                  </Terminal>
                  <Label text="Spinner Verbs" frame={localFrame} startFrame={8} />
                </div>
              );
            }

            // Placement 2: Status Line
            if (localFrame < placementDuration * 2) {
              const lf = localFrame - placementDuration;
              const o = interpolate(
                lf,
                [0, 5, placementDuration - 5, placementDuration],
                [0, 1, 1, 0],
                { extrapolateRight: "clamp" }
              );
              return (
                <div style={{ opacity: o, position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Terminal
                    scale={0.85}
                    showStatusLine
                    statusLine="Groq (a16z) \u2014 50x faster LLM inference. Free tier available.  https://groq.com"
                    statusLineGlow
                  >
                    <div style={{ color: DIM, fontSize: 18 }}>
                      Analyzing API response times...
                    </div>
                    <div style={{ height: 20 }} />
                    <Spinner text="Checking dependencies..." frame={lf} color={DIM} />
                  </Terminal>
                  <Label text="Status Line" frame={lf} startFrame={8} />
                </div>
              );
            }

            // Placement 3: Context Injection
            if (localFrame < placementDuration * 3) {
              const lf = localFrame - placementDuration * 2;
              const o = interpolate(
                lf,
                [0, 5, placementDuration - 5, placementDuration],
                [0, 1, 1, 0],
                { extrapolateRight: "clamp" }
              );
              const highlightOpacity = interpolate(
                lf,
                [15, 25],
                [0, 1],
                { extrapolateRight: "clamp" }
              );
              return (
                <div style={{ opacity: o, position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Terminal scale={0.85}>
                    <div style={{ color: WHITE, fontSize: 20, lineHeight: 1.8 }}>
                      <span style={{ color: ACCENT }}>Claude:</span>{" "}
                      I{"'"}ve set up your Prisma schema with the User
                      and Post models.
                      <div style={{ height: 12 }} />
                      <span
                        style={{
                          background: `${CYAN}${Math.floor(highlightOpacity * 25)
                            .toString(16)
                            .padStart(2, "0")}`,
                          borderLeft: `3px solid ${CYAN}`,
                          paddingLeft: 12,
                          display: "block",
                          opacity: highlightOpacity,
                          color: CYAN,
                        }}
                      >
                        By the way, PlanetScale (a16z) offers serverless
                        MySQL with branching and zero-downtime schema
                        changes. Free tier at planetscale.com
                      </span>
                    </div>
                  </Terminal>
                  <Label
                    text="Context Injection"
                    frame={lf}
                    startFrame={8}
                  />
                </div>
              );
            }

            // Placement 4: Stack Analysis
            {
              const lf = localFrame - placementDuration * 3;
              const o = interpolate(
                lf,
                [0, 5, placementDuration - 5, placementDuration],
                [0, 1, 1, 0],
                { extrapolateRight: "clamp" }
              );
              const line1 = interpolate(lf, [8, 15], [0, 1], {
                extrapolateRight: "clamp",
              });
              const line2 = interpolate(lf, [15, 22], [0, 1], {
                extrapolateRight: "clamp",
              });
              const line3 = interpolate(lf, [22, 29], [0, 1], {
                extrapolateRight: "clamp",
              });
              return (
                <div style={{ opacity: o, position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Terminal scale={0.85}>
                    <div
                      style={{
                        color: CYAN,
                        fontSize: 18,
                        marginBottom: 12,
                      }}
                    >
                      [vibeads] Tech stack analysis:
                    </div>
                    <div
                      style={{
                        fontSize: 17,
                        lineHeight: 2,
                        fontFamily: "'SF Mono', monospace",
                      }}
                    >
                      <div style={{ color: ORANGE, opacity: line1 }}>
                        {"\u26A0"} missing: No auth detected. Clerk gives
                        you drop-in auth with 10K free MAU
                      </div>
                      <div style={{ color: ORANGE, opacity: line2 }}>
                        {"\u26A0"} missing: No monitoring. PagerDuty free
                        tier covers 5 users
                      </div>
                      <div style={{ color: ORANGE, opacity: line3 }}>
                        {"\u26A0"} missing: No rate limiting. Arcjet adds
                        security in 3 lines
                      </div>
                    </div>
                  </Terminal>
                  <Label
                    text="Stack Analysis"
                    frame={lf}
                    startFrame={8}
                  />
                </div>
              );
            }
          })()}
        </AbsoluteFill>
      </Sequence>

      {/* ═══ SCENE 6: THE SCALE (20-24s) ═══ */}
      <Sequence from={S6_START} durationInFrames={S6_END - S6_START}>
        <AbsoluteFill
          style={{
            background: BG,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {(() => {
            const localFrame = frame - S6_START;

            // Layout: 4 visual blocks in a 2x2 grid
            const row1Y = 250;
            const row2Y = 620;
            const col1X = 340;
            const col2X = 1100;

            return (
              <AbsoluteFill>
                {/* 3M developers - dot grid */}
                <div
                  style={{
                    position: "absolute",
                    left: col1X,
                    top: row1Y,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <DotGrid
                    count={400}
                    frame={localFrame}
                    startFrame={0}
                    color={CYAN}
                  />
                  <div
                    style={{
                      color: WHITE,
                      fontFamily: "system-ui",
                      fontSize: 32,
                      fontWeight: "700",
                      marginTop: 20,
                      opacity: interpolate(localFrame, [20, 30], [0, 1], {
                        extrapolateRight: "clamp",
                      }),
                    }}
                  >
                    3,000,000+
                  </div>
                  <div
                    style={{
                      color: GRAY,
                      fontFamily: "system-ui",
                      fontSize: 18,
                      opacity: interpolate(localFrame, [25, 35], [0, 1], {
                        extrapolateRight: "clamp",
                      }),
                    }}
                  >
                    developers
                  </div>
                </div>

                {/* 20 portfolio companies - colored circles */}
                <div
                  style={{
                    position: "absolute",
                    left: col2X,
                    top: row1Y,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      width: 200,
                      gap: 12,
                      justifyContent: "center",
                    }}
                  >
                    {Array.from({ length: 20 }).map((_, i) => {
                      const colors = [
                        CYAN,
                        GREEN,
                        ACCENT,
                        ORANGE,
                        "#f778ba",
                      ];
                      const delay = i * 2;
                      const dotOpacity = interpolate(
                        localFrame - delay,
                        [10, 18],
                        [0, 1],
                        {
                          extrapolateLeft: "clamp",
                          extrapolateRight: "clamp",
                        }
                      );
                      const dotScale = spring({
                        frame: Math.max(0, localFrame - delay - 10),
                        fps: 30,
                        config: { damping: 12, stiffness: 200 },
                      });
                      return (
                        <div
                          key={i}
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            background: colors[i % colors.length],
                            opacity: dotOpacity,
                            transform: `scale(${dotScale})`,
                            boxShadow: `0 0 10px ${colors[i % colors.length]}40`,
                          }}
                        />
                      );
                    })}
                  </div>
                  <div
                    style={{
                      color: WHITE,
                      fontFamily: "system-ui",
                      fontSize: 32,
                      fontWeight: "700",
                      marginTop: 20,
                      opacity: interpolate(localFrame, [40, 50], [0, 1], {
                        extrapolateRight: "clamp",
                      }),
                    }}
                  >
                    20
                  </div>
                  <div
                    style={{
                      color: GRAY,
                      fontFamily: "system-ui",
                      fontSize: 18,
                      opacity: interpolate(localFrame, [45, 55], [0, 1], {
                        extrapolateRight: "clamp",
                      }),
                    }}
                  >
                    portfolio companies
                  </div>
                </div>

                {/* 5 placements - stacked layers */}
                <div
                  style={{
                    position: "absolute",
                    left: col1X,
                    top: row2Y,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <div style={{ position: "relative", width: 200, height: 120 }}>
                    {[0, 1, 2, 3, 4].map((i) => {
                      const layerDelay = i * 5 + 30;
                      const layerProgress = spring({
                        frame: Math.max(0, localFrame - layerDelay),
                        fps: 30,
                        config: { damping: 15, stiffness: 180 },
                      });
                      const colors = [CYAN, GREEN, ACCENT, ORANGE, "#f778ba"];
                      return (
                        <div
                          key={i}
                          style={{
                            position: "absolute",
                            left: i * 8,
                            top: i * 18,
                            width: 180 - i * 10,
                            height: 30,
                            borderRadius: 6,
                            background: `${colors[i]}30`,
                            border: `2px solid ${colors[i]}`,
                            opacity: layerProgress,
                            transform: `translateY(${(1 - layerProgress) * 20}px)`,
                          }}
                        />
                      );
                    })}
                  </div>
                  <div
                    style={{
                      color: WHITE,
                      fontFamily: "system-ui",
                      fontSize: 32,
                      fontWeight: "700",
                      marginTop: 20,
                      opacity: interpolate(localFrame, [55, 65], [0, 1], {
                        extrapolateRight: "clamp",
                      }),
                    }}
                  >
                    5
                  </div>
                  <div
                    style={{
                      color: GRAY,
                      fontFamily: "system-ui",
                      fontSize: 18,
                      opacity: interpolate(localFrame, [60, 70], [0, 1], {
                        extrapolateRight: "clamp",
                      }),
                    }}
                  >
                    ad placements
                  </div>
                </div>

                {/* 0 lines - single terminal prompt */}
                <div
                  style={{
                    position: "absolute",
                    left: col2X,
                    top: row2Y,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      background: BG_LIGHTER,
                      borderRadius: 12,
                      padding: "20px 30px",
                      border: `1px solid ${DIM}`,
                      opacity: interpolate(localFrame, [50, 60], [0, 1], {
                        extrapolateRight: "clamp",
                      }),
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'SF Mono', monospace",
                        fontSize: 20,
                        color: GREEN,
                      }}
                    >
                      $ npm install -g vibeads
                    </span>
                  </div>
                  <div
                    style={{
                      color: WHITE,
                      fontFamily: "system-ui",
                      fontSize: 32,
                      fontWeight: "700",
                      marginTop: 20,
                      opacity: interpolate(localFrame, [65, 75], [0, 1], {
                        extrapolateRight: "clamp",
                      }),
                    }}
                  >
                    0
                  </div>
                  <div
                    style={{
                      color: GRAY,
                      fontFamily: "system-ui",
                      fontSize: 18,
                      opacity: interpolate(localFrame, [70, 80], [0, 1], {
                        extrapolateRight: "clamp",
                      }),
                    }}
                  >
                    lines of code to install
                  </div>
                </div>
              </AbsoluteFill>
            );
          })()}
        </AbsoluteFill>
      </Sequence>

      {/* ═══ SCENE 7: THE INSTALL (24-27s) ═══ */}
      <Sequence from={S7_START} durationInFrames={S7_END - S7_START}>
        <AbsoluteFill
          style={{
            background: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {(() => {
            const localFrame = frame - S7_START;

            const line1Done = localFrame > 50;
            const line2Opacity = interpolate(localFrame, [52, 58], [0, 1], {
              extrapolateRight: "clamp",
            });
            const line3Opacity = interpolate(localFrame, [60, 66], [0, 1], {
              extrapolateRight: "clamp",
            });
            const line4Opacity = interpolate(localFrame, [68, 74], [0, 1], {
              extrapolateRight: "clamp",
            });

            return (
              <Terminal scale={1}>
                <div>
                  <span style={{ color: GRAY }}>$ </span>
                  <TypingText
                    text="npm install -g vibeads"
                    frame={localFrame}
                    startFrame={5}
                    charsPerFrame={0.8}
                    color={WHITE}
                    fontSize={24}
                    showCursor={!line1Done}
                  />
                </div>
                {line1Done && (
                  <>
                    <div style={{ height: 20 }} />
                    <div
                      style={{
                        color: CYAN,
                        opacity: line2Opacity,
                        fontSize: 20,
                      }}
                    >
                      vibeads {"\u2014"} contextual dev tool discovery for
                      Claude Code
                    </div>
                    <div
                      style={{
                        color: GRAY,
                        opacity: line3Opacity,
                        fontSize: 18,
                      }}
                    >
                      Powered by a16z portfolio
                    </div>
                    <div style={{ height: 12 }} />
                    <div
                      style={{
                        color: GREEN,
                        opacity: line4Opacity,
                        fontSize: 22,
                        fontWeight: "600",
                      }}
                    >
                      {"\u2714"} Ready!
                    </div>
                  </>
                )}
              </Terminal>
            );
          })()}
        </AbsoluteFill>
      </Sequence>

      {/* ═══ SCENE 8: THE CLOSE (27-30s) ═══ */}
      <Sequence from={S8_START} durationInFrames={S8_END - S8_START}>
        <AbsoluteFill
          style={{
            background: "#000",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {(() => {
            const localFrame = frame - S8_START;
            const logoOpacity = interpolate(localFrame, [0, 20], [0, 1], {
              extrapolateRight: "clamp",
            });
            const subtitleOpacity = interpolate(
              localFrame,
              [20, 40],
              [0, 1],
              { extrapolateRight: "clamp" }
            );
            const linkOpacity = interpolate(localFrame, [40, 55], [0, 1], {
              extrapolateRight: "clamp",
            });

            return (
              <>
                <div
                  style={{
                    fontSize: 96,
                    fontWeight: "900",
                    fontFamily: "system-ui, -apple-system, sans-serif",
                    color: WHITE,
                    letterSpacing: 8,
                    opacity: logoOpacity,
                    textShadow: `0 0 40px ${CYAN}40`,
                  }}
                >
                  vibeads
                </div>
                <div
                  style={{
                    fontSize: 28,
                    fontFamily: "system-ui",
                    color: GRAY,
                    marginTop: 20,
                    opacity: subtitleOpacity,
                    letterSpacing: 4,
                  }}
                >
                  ads for the age of vibecoding
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontFamily: "'SF Mono', monospace",
                    color: DIM,
                    marginTop: 40,
                    opacity: linkOpacity,
                  }}
                >
                  github.com/pooriaarab/vibeads
                </div>
              </>
            );
          })()}
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
