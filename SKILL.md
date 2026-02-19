---
name: vibeads
description: "Contextual dev tool discovery for Claude Code -- surfaces relevant a16z portfolio tools based on what you're building"
---

# vibeads

Contextual dev tool discovery for Claude Code. While Claude Code works, vibeads watches what you're building and recommends relevant tools from the a16z portfolio -- no generic ads, just data-driven, comparative recommendations.

## When to Use This Skill

Use this skill when the user:
- Wants to discover relevant developer tools while coding
- Asks about alternatives to their current tech stack
- Wants contextual tool recommendations based on their project
- Is looking for auth, database, AI, payments, monitoring, or security tools
- Mentions wanting to find better tools for their workflow
- Asks about a16z portfolio developer tools

## Installation

```bash
npm install -g vibeads
```

That's it. One command. Hooks and status line are automatically configured.

Or run without installing:

```bash
npx vibeads init
```

## How It Works

vibeads installs Claude Code hooks that analyze your workflow:

- **PostToolUse hook**: Keyword-matches tool input against 20 a16z portfolio companies. Surfaces recommendations via spinner verbs and status line.
- **SessionStart hook**: Scans your `package.json` and config files to identify stack gaps and suggest alternatives.
- **Status line**: Shows the latest recommendation with ANSI colors and clickable links.

## Recommendation Tiers

1. **Status Line** -- Always-visible recommendation at the bottom of the terminal
2. **Spinner Verbs** -- Comparative data during tool execution
3. **Context Injection** -- Claude naturally mentions relevant tools (20% of matches)
4. **Stack Analysis** -- Project scan on session start identifying gaps and alternatives

## Portfolio Coverage (20 companies)

Auth, databases, payments, AI models, AI inference, voice AI, security, mobile, design, dev tools, data, monitoring, creative tools, and more.

## Commands

```bash
npx vibeads dashboard   # View impression stats and detected stack
npx vibeads uninstall   # Remove all hooks and data
```

All data stored locally. No external API calls. No telemetry.
