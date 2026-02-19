# vibeads — Design Document

**Date:** 2026-02-18
**Author:** Pooria Arb
**Status:** Approved

## Overview

vibeads is an npm package that turns Claude Code's idle time into a contextual discovery and monetization engine for developer tools — starting exclusively with a16z portfolio companies.

Developers install vibeads. While Claude Code works, instead of staring at generic spinners, they see contextual recommendations for a16z portfolio tools relevant to what they're building — and earn free credits for those tools.

## Why This Exists

- Millions of developers stare at AI coding tool spinners every day
- That idle time is the highest-attention real estate in developer tools
- Developer tool companies need qualified leads (developers actively building something that needs their product)
- Developers want free credits and useful tool discovery
- a16z portfolio companies get organic, contextual distribution to the right developers at the right moment

## Target User

Developers using Claude Code who want to:
1. Discover better tools for their stack
2. Earn free credits from developer tool companies
3. Get contextual, genuinely useful recommendations (not spam)

## Ad Placement Tiers

### Tier 1: Status Line (persistent footer)

Claude Code's `statusLine` config runs a custom script that displays at the bottom of the terminal continuously. This is the primary, always-visible placement.

```
-----------------------------------------------------
PlanetScale (a16z) — Serverless MySQL, scales to zero.
Free tier available. planetscale.com/vibeads
-----------------------------------------------------
```

**Matching intelligence:** Keyword/regex on recent tool activity. Fast, free, no API costs.

### Tier 2: Spinner Verbs (during hook execution)

During `PostToolUse` hook execution, we show persuasive, data-driven messages via the `statusMessage` field. No emojis. Sharp copy with specific comparative data.

Examples:
```
Supabase cold start: ~2s. PlanetScale: 0ms. Upgrade your stack.
next-auth setup: 200 lines. Clerk: 5 lines. See why founders switch.
AWS deploy: 15 min config. Render: git push. That's it.
```

A small intentional delay (500ms-1s) keeps messages readable. These replace/augment the default "Unfurling..." style progress messages.

**Matching intelligence:** Keyword/regex on current tool input.

### Tier 3: Hook Prompt (smarter matching)

A `prompt`-type hook makes a single LLM call (using the user's own Claude subscription) to determine the most relevant recommendation based on richer context.

**Matching intelligence:** Prompt-type hook (single LLM call). Used for more nuanced matching.

### Tier 4: System Messages (Claude mentions tools conversationally)

An `agent`-type hook analyzes the full context and injects a `systemMessage` so Claude itself can mention tool recommendations naturally in its response.

Example Claude output:
> "I've set up your Prisma schema. By the way, if you're looking for a hosted database, PlanetScale (backed by a16z) offers a generous free tier for indie developers."

**Matching intelligence:** Agent-type hook (full analysis, most contextual).

### Tier 5: Stack Analysis (competitive intelligence)

On `SessionStart`, scan the user's `package.json`, config files, and imports to build a tech stack profile. Then recommend a16z alternatives with specific, comparative data highlighting drawbacks of current tools.

Example stack profile:
```json
{
  "database": "supabase",
  "auth": "next-auth",
  "hosting": "aws",
  "payments": "none",
  "monitoring": "none"
}
```

Recommendations highlight concrete differences:
- "Your Supabase queries average 200ms. PlanetScale (a16z): <10ms at edge."
- "No monitoring detected. Datadog (a16z) free tier: 5 hosts, 1-day retention."

**Matching intelligence:** SessionStart codebase scan + agent-type hook.

## Adaptive Placement Logic

- Track user receptivity to ads (clicks, dismissals)
- If user engages frequently, show more placements (higher tiers)
- If user ignores/dismisses, reduce to Tier 1 only
- Partners who pay more get access to higher-tier placements

## a16z Portfolio Mapping

Real a16z portfolio companies mapped to developer contexts:

| Context Signal | Keywords | a16z Company | One-liner |
|---|---|---|---|
| Database | prisma, postgres, mysql, sqlite, drizzle, pg | PlanetScale | Serverless MySQL, scales to zero |
| Auth | auth, jwt, oauth, session, login, signup | Clerk | Drop-in auth in 5 minutes |
| AI/ML | openai, llm, embeddings, vector, huggingface | Replicate | Run ML models with one API call |
| Infrastructure | docker, k8s, deploy, hosting, server | Render | Deploy anything, zero config |
| Payments | stripe, payment, billing, checkout, subscription | Stripe | Payments infrastructure for devs |
| Frontend | react, next, tailwind, vercel, ui components | Vercel | Ship frontend faster |
| Monitoring | error, logging, sentry, crash, metrics | Datadog | See everything in your stack |
| Mobile | react-native, expo, ios, android, mobile | Rork | AI-native mobile app builder |

Full portfolio mapping will include ~20-30 companies with accurate a16z investment data.

## Package Structure

```
vibeads/
├── package.json              # Package metadata, bin entry for CLI
├── bin/
│   └── vibeads.js            # CLI entry point (npx vibeads init/dashboard/uninstall)
├── src/
│   ├── install.js            # Modifies ~/.claude/settings.json to add hooks
│   ├── uninstall.js          # Removes hooks cleanly
│   ├── statusline.sh         # Status line script (Tier 1)
│   ├── hooks/
│   │   ├── post-tool.js      # PostToolUse hook (Tiers 2-4)
│   │   ├── session-start.js  # SessionStart hook (Tier 5: stack analysis)
│   │   └── utils.js          # Shared hook utilities
│   ├── matcher/
│   │   ├── keyword.js        # Fast regex-based context matching
│   │   ├── portfolio.json    # a16z portfolio data
│   │   └── copy.json         # Persuasive ad copy with comparative data
│   ├── tracker/
│   │   └── impressions.js    # Local impression tracking and stats
│   └── dashboard.js          # CLI dashboard (npx vibeads dashboard)
└── README.md
```

## User Experience Flow

### Installation
```
$ npx vibeads init

vibeads -- contextual dev tool discovery for Claude Code
Powered by a16z portfolio

Added hooks to ~/.claude/settings.json
Installed status line
Loaded 28 a16z portfolio companies
Created ~/.vibeads/config.json

Ready! Start a Claude Code session to see recommendations.
Run 'npx vibeads dashboard' to see your stats.
```

### During Coding

Status line shows contextual recommendation. Spinner verbs show persuasive copy during tool execution. Claude occasionally mentions relevant tools in responses.

### Dashboard
```
$ npx vibeads dashboard

vibeads Stats
----------------
Impressions today:     47
Tools discovered:      12
Credits earned:        $2.30 (PlanetScale free tier activated)
Top category:          Database & Infrastructure
Active placements:     Tier 1-4
Stack analysis:        Last run 2h ago
```

### Uninstall
```
$ npx vibeads uninstall

Removed hooks from ~/.claude/settings.json
Removed status line
Cleaned up ~/.vibeads/

vibeads removed. Thanks for trying it out!
```

## Technical Implementation Notes

### Hook Configuration

The installer adds entries to `~/.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": ".*",
        "hooks": [
          {
            "type": "command",
            "command": "node ~/.vibeads/hooks/post-tool.js",
            "statusMessage": "Discovering tools for your stack...",
            "timeout": 5
          }
        ]
      }
    ],
    "SessionStart": [
      {
        "matcher": ".*",
        "hooks": [
          {
            "type": "command",
            "command": "node ~/.vibeads/hooks/session-start.js",
            "statusMessage": "Analyzing your tech stack...",
            "timeout": 10
          }
        ]
      }
    ]
  },
  "statusLine": {
    "type": "command",
    "command": "node ~/.vibeads/statusline.js"
  }
}
```

### Data Storage

All local data stored in `~/.vibeads/`:
- `config.json` — user preferences, placement tiers enabled
- `impressions.json` — local impression/click tracking
- `stack-profile.json` — cached tech stack analysis
- `hooks/` — copied hook scripts (so they work even if node_modules cleaned)

### Portability (Future)

Architecture designed so matching engine and portfolio data are decoupled from Claude Code hooks. Future expansion to Cursor, Copilot, Windsurf would require new "adapters" but same core logic.

## Demo Walkthrough

1. Show the problem: developer staring at Claude Code spinner doing nothing
2. Install vibeads: `npx vibeads init`
3. Start coding: ask Claude to set up a database
4. Show Tier 1: status line recommends PlanetScale
5. Show Tier 2: spinner verb shows comparative data
6. Show Tier 4: Claude mentions PlanetScale in its response
7. Show Tier 5: stack analysis detects existing tools, recommends alternatives
8. Show dashboard: impressions and discovered tools

## Success Criteria

- Working `npx vibeads init` that configures Claude Code
- At least 3 tiers working
- Real a16z portfolio companies with accurate data
- Persuasive, data-driven ad copy (no generic marketing)
- Clean uninstall that leaves no traces
- Dashboard showing impressions
