# vibeads

Contextual dev tool discovery for Claude Code -- powered by a16z portfolio.

While Claude Code works, vibeads shows you relevant a16z portfolio tools based on what you're building. No generic ads -- data-driven, comparative recommendations that actually help you ship faster.

## Install

```
npm install -g vibeads
```

That's it. One command. The hooks and status line are automatically configured in your `~/.claude/settings.json`.

Alternatively, run without installing:

```
npx vibeads init
```

## What it does

vibeads watches what you're building and recommends relevant tools from the a16z portfolio across 5 placement tiers:

**Tier 1: Status Line** -- Always-visible recommendation at the bottom of your terminal.

```
Clerk (a16z) -- Drop-in auth for React/Next.js. 5 lines of code. Free up to 10K MAU.
  https://clerk.com?ref=vibeads
```

**Tier 2: Spinner Verbs** -- During tool execution, sharp comparative data appears as status messages.

```
Matching your stack with a16z portfolio...
```

**Tier 3: Context Injection** -- Occasionally, Claude itself mentions a relevant tool naturally in its response (20% of matches).

**Tier 4: Stack Analysis** -- On session start, vibeads scans your `package.json` and config files to identify your stack and recommend alternatives or fill gaps.

```
[vibeads] Tech stack analysis for this project:
  - missing: No auth detected. Clerk gives you drop-in auth with 10K free MAU
  - alternative: Using OpenAI? Groq runs Llama/Mixtral at 50x the speed
  - missing: No rate limiting. Arcjet adds security middleware in 3 lines
```

## How matching works

vibeads uses keyword matching on Claude Code hook inputs (tool names, commands, file paths, content). When you run `npm install prisma`, it matches PlanetScale. When you write auth code, it matches Clerk. 20 a16z portfolio companies mapped across databases, auth, AI, payments, monitoring, security, design, and more.

Spinner copy is data-driven and comparative -- no marketing fluff:

```
next-auth: 200+ lines of config. Clerk: 5 lines. Free up to 10K MAU.
OpenAI API: 500ms avg latency. Groq: 10ms. 50x faster LLM inference.
DIY rate limiting: fragile + hours. Arcjet: 3 lines. Free 10K req/mo.
```

## Dashboard

```
npx vibeads dashboard
```

```
vibeads Stats
----------------
Impressions today:     47
Total impressions:     312
Tools discovered:      12

Top Recommendations:
  clerk: 89 impressions
  planetscale: 67 impressions
  groq: 45 impressions

Detected Stack:
  database: prisma
  framework: nextjs
  auth: next-auth

Stack Gaps:        monitoring, security

Active tiers:      statusLine, spinnerVerbs, systemMessage, stackAnalysis
```

## Uninstall

```
npx vibeads uninstall
```

Cleanly removes all hooks from `~/.claude/settings.json` and deletes `~/.vibeads/`.

## a16z Portfolio Companies (20)

| Company | Category | Speedrun | What They Do |
|---------|----------|----------|-------------|
| Clerk | Auth | | Drop-in auth for React/Next.js |
| PlanetScale | Database | | Serverless MySQL with branching |
| Stripe | Payments | | Payment infrastructure for 3.1M+ businesses |
| Replicate | AI Models | | Run open-source ML models via API |
| Groq | AI Inference | | 50x faster LLM inference via LPU chips |
| Fal.ai | AI Inference | | Sub-second image generation API |
| ElevenLabs | Voice AI | | Human-quality AI voice in 29 languages |
| Mistral | AI Models | | Open-weight LLMs at 70% lower cost |
| Arcjet | Security | | Rate limiting and bot protection for Node.js |
| Rork | Mobile | Yes | AI mobile app builder for React Native |
| Figma | Design | | Collaborative design platform |
| Stainless | Dev Tools | | Auto-generate type-safe SDKs from OpenAPI |
| PagerDuty | Monitoring | | Incident management and on-call alerting |
| Hex | Data | | Collaborative SQL and Python notebooks |
| Databricks | Data | | Unified lakehouse for ETL, analytics, and ML |
| Runware | AI API | | Fastest image generation API at scale |
| Flora AI | Creative | Yes | AI creative design tool |
| Hedra | Video | | AI talking-head video generation |
| Cursor | Dev Tools | | AI-native code editor |
| Replit | Dev Tools | | Cloud IDE with instant deploys |

## How it works (technical)

vibeads is an npm package that installs Claude Code hooks:

- **PostToolUse hook**: Runs after every Bash/Write/Edit/Read tool call. Keyword-matches tool input against the a16z portfolio. Writes the current recommendation to `~/.vibeads/current-recommendation.json` for the status line and records impressions.
- **SessionStart hook**: Analyzes your project's `package.json` and config files on session start. Identifies stack gaps and suggests a16z alternatives. Output is injected into Claude's context.
- **Status line**: Reads the latest recommendation and renders it with ANSI colors and OSC 8 clickable links.

All data is stored locally in `~/.vibeads/`. No external API calls. No telemetry.

## License

MIT
