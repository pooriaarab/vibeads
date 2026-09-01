---
schema: design-context/v1
surface: developer-ui
sources:
  - src/statusline.js
  - src/dashboard.js
  - src/hooks/session-start.js
  - video/src/theme.ts
  - video/src/components/Terminal.tsx
---

# vibeads design

## Overview

vibeads has two designed surfaces.
The shipped product renders status, setup, analysis, and dashboard text.
The Remotion project renders a separate 1920 by 1080 demo.

Preserve terminal compatibility in shipped output.
Use the demo theme only inside `video/`.
Do not make the demo appear to prove unshipped behavior.

## Colors

The shipped status line uses three ANSI roles from `src/statusline.js`:

- Cyan `\x1b[36m` marks the matched company name.
- Bright black `\x1b[90m` marks badges, attribution, and the URL.
- Reset `\x1b[0m` returns text to the user's terminal theme.

Other shipped output uses the terminal's default colors.
Do not add backgrounds or fixed black and white foregrounds.

The demo palette comes from `video/src/theme.ts`:

- Canvas: `BG` `#0d1117`.
- Raised canvas: `BG_LIGHTER` `#161b22`.
- Action and glow: `CYAN` `#58a6ff`.
- Success: `GREEN` `#3fb950`.
- Warning: `ORANGE` `#f0883e`.
- Error: `RED` `#f85149`.
- Primary text: `WHITE` `#e6edf3`.
- Secondary text: `GRAY` `#8b949e`.
- Dividers: `DIM` `#484f58`.
- Secondary accent: `ACCENT` `#bc8cff`.

## Typography

Shipped output inherits the user's monospace terminal font.
Use plain text and ANSI color for hierarchy.
Keep URLs intact and preserve product names from the catalog.

The demo terminal uses `SF Mono`, then `Fira Code`, then monospace.
The demo body uses 22px text with a `1.7` line height.
Status and title text use 14px.
Labels and metric captions use the system font.

## Layout

The status recommendation uses exactly two lines.
The first line contains name, optional badge, attribution, separator, and copy.
The second line starts with two spaces and contains the linked URL.

Stack analysis starts with `[vibeads]` on its own line.
Each recommendation starts with two spaces and `- `.
Dashboard values align their labels with fixed spaces.

The demo composition is 1920 by 1080 at 30 frames per second.
Its terminal is 1400px wide and centered by each scene.
The terminal body uses `30px 36px` padding.

## Elevation & Depth

Elevation does not apply to shipped terminal output.

The demo terminal uses `0 25px 80px rgba(0,0,0,0.6)`.
Status glows use cyan with low alpha.
Highlight boxes use a frame-driven border glow.
Do not introduce these effects into the CLI.

## Shapes

Shipped output uses text delimiters instead of containers.
Use ` -- ` between recommendation metadata and its description.
Use `[Speedrun]`, `(a16z)`, and `[vibeads]` for metadata.

The demo terminal uses a 16px outer radius.
Its traffic lights are 14px circles.
Highlight boxes use an 8px radius and a 2px border.

## Components

- `src/statusline.js` renders the two-line recommendation.
- `src/hooks/session-start.js` renders up to three stack suggestions.
- `src/dashboard.js` renders local impression and stack summaries.
- `video/src/components/Terminal.tsx` owns the demo terminal frame.
- `video/src/components/Spinner.tsx` owns its ten-frame spinner sequence.
- `video/src/components/TypingText.tsx` owns typing and cursor timing.
- `video/src/components/HighlightBox.tsx` owns the pulsing callout.
- `video/src/components/StatBlock.tsx` owns metric captions.

Keep shipped output silent on internal errors where current hooks require it.
Keep the demo's motion tied to Remotion frame values.

## Do's and Don'ts

- Do preserve the status line's two-line structure.
- Don't add extra promotional lines to that component.
- Do use catalog copy for names, URLs, and recommendation facts.
- Don't invent a metric or free-tier claim in interface code.
- Do let ordinary CLI output inherit the terminal palette.
- Don't apply the demo palette to user terminals.
- Do keep video timing deterministic from the frame number.
- Don't use timers or runtime randomness in demo components.
- Do label plans as plans when shown in media.
- Don't present a prototype or demo as a shipped feature.
