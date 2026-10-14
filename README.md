# vibeads

[![npm version](https://img.shields.io/npm/v/vibeads)](https://www.npmjs.com/package/vibeads)
[![Downloads/month](https://img.shields.io/npm/dm/vibeads)](https://www.npmjs.com/package/vibeads)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](https://opensource.org/license/mit)

[Package](https://www.npmjs.com/package/vibeads) · [Setup](#send-your-first-recommendation) · [Commands](#runtime-surfaces) · [Compare](#compare)

vibeads is an open-source developer-tool discovery package for Claude Code users. It matches tool activity and project signals against a bundled catalog. Recommendations appear through hooks, spinner text, and a terminal status line.

## Install

```bash
npm install -g vibeads
```

Use Node.js with ES module support; repository CI uses Node.js 22. The package has zero runtime dependencies.
Installation runs `vibeads init` automatically. It changes `~/.claude/settings.json` and writes files under `~/.vibeads/`.
Back up your Claude Code settings before installation if you need to restore an existing status line.

## Send your first recommendation

```bash
vibeads init
vibeads dashboard
```

No environment variables, credentials, or `.env` loading are required.
Success prints `Ready! Start a Claude Code session to see recommendations.`
The dashboard prints `vibeads Stats`, impression totals, and configured tiers.
Start a Claude Code session in a project with `package.json` to trigger stack analysis.
The status line shows a catalog company and its URL; without a recent match, it selects a random entry.

## How it works

```text
Claude Code SessionStart -> project files -> stack profile -> suggestions
Claude Code PostToolUse -> keyword match -> recommendation + local impression
                                         -> spinner settings + occasional context
Stored recommendation -> terminal status line
Local impression file -> dashboard
```

The matcher reads tool names, commands, paths, selected input fields, and the working directory.
Matching and impression tracking make no network requests. Vendor links open external sites when you follow them.

## Why it exists

Claude Code supports custom status lines, and ccstatusline provides configurable session widgets.
vibeads uses those terminal surfaces for catalog-based developer-tool suggestions.
It also uses project dependencies and configuration filenames to suggest alternatives or flag possible stack gaps.

## Compare

Scope checked on 2026-10-14 against [Claude Code status lines](https://code.claude.com/docs/en/statusline) and [ccstatusline](https://github.com/sirmalloc/ccstatusline).

| Scope | vibeads | Claude Code custom status line | ccstatusline |
|---|---|---|---|
| Main purpose | Catalog recommendations | User-defined terminal output | Configurable session widgets |
| Configuration | Installer writes hooks and settings | Script and settings entry | Interactive configuration |
| Runs locally | Yes | Yes | Yes |

## Coverage

The matcher reads 20 entries from `src/data/portfolio.json`.
Every row below is catalog-only: no vendor API adapter, account setup, or delivery integration is included.

| Catalog company | Status |
|---|---|
| Clerk | catalog-only |
| PlanetScale | catalog-only |
| Stripe | catalog-only |
| Replicate | catalog-only |
| Groq | catalog-only |
| Fal.ai | catalog-only |
| ElevenLabs | catalog-only |
| Mistral | catalog-only |
| Arcjet | catalog-only |
| Rork | catalog-only |
| Figma | catalog-only |
| Stainless | catalog-only |
| PagerDuty | catalog-only |
| Hex | catalog-only |
| Databricks | catalog-only |
| Runware | catalog-only |
| Flora AI | catalog-only |
| Hedra | catalog-only |
| Cursor | catalog-only |
| Replit | catalog-only |

Source inspection verifies the inventory. No vendor credentials or current catalog pricing claims were verified for this rewrite.
The catalog groups these companies under an a16z label; that label does not establish an endorsement.

## Common use cases

1. Claude Code users: show developer-tool suggestions alongside coding activity.
2. Next.js builders: use package dependencies and configuration filenames as recommendation signals.
3. Prisma users: surface database catalog entries after matching commands or file activity.
4. Tool evaluators: inspect locally recorded recommendation counts through the dashboard.

## Features

- **Keyword matching:** selects the highest weighted substring match from the catalog.
- **Stack analysis:** checks dependencies and selected configuration filenames at startup or resume.
- **Status line:** renders a recent recommendation or a random catalog fallback.
- **Spinner text:** places the matched company's copy three times before other catalog entries.
- **Local dashboard:** summarizes recorded matches and the latest detected stack.

See [setup](#send-your-first-recommendation) and [commands](#runtime-surfaces) for usage.

## Runtime surfaces

| Command | Behavior |
|---|---|
| `vibeads init` | Copy hook files, write settings, and initialize local data |
| `vibeads dashboard` | Print local impression and stack summaries |
| `vibeads uninstall` | Remove vibeads hooks and local data |

The package exposes one bin, `vibeads`. It has no declared library exports or Model Context Protocol (MCP) server.
`SessionStart` matches startup and resume. `PostToolUse` matches Bash, Write, Edit, and Read.
The installer also configures `statusLine` and `spinnerVerbs`.

## Delivery and behavior limits

- Initialization replaces your configured status line. Uninstall removes the vibeads status line without restoring its predecessor.
- Existing spinner settings are saved when present. Repeated initialization can replace that backup with vibeads settings.
- Hooks contain a fixed 20% random context-injection test. A match does not guarantee that Claude mentions the recommendation.
- Stored tier flags and `contextInjectionRate` are not runtime controls; the hook code does not read them.
- Stack gaps are heuristics. Five gap detectors exist, but only auth, monitoring, and security gaps have recommendation mappings.
- Dashboard impressions count recorded post-tool matches. They do not prove views, clicks, purchases, or successful integrations.
- Local logs include command or path summaries. Impression data has no retention limit in the implementation.
- Catalog copy can become stale. Check vendor documentation before relying on pricing, credits, or performance statements.

## Integration guides

This README contains the package setup; there is no separate public documentation site.
For host configuration details, read [Claude Code's status-line guide](https://code.claude.com/docs/en/statusline).

### Uninstall

```bash
vibeads uninstall
```

This removes vibeads hook entries and deletes `~/.vibeads/`, including its impression history.

## Status

Version 0.4.0 is an early release. Interfaces and catalog content can change before 1.0.
Public case studies are not yet published. Report problems in [GitHub issues](https://github.com/pooriaarab/vibeads/issues).

### Development and releases

CI checks JavaScript syntax and validates the npm package. No `ci:local` script or automated unit-test suite is defined.
Publishing runs from version tags through the npm publish workflow and requires the repository's npm token.
The `video/` directory contains a separate Remotion demo, not another runtime integration.

## FAQ

### Which integrations are verified?

vibeads includes Claude Code hook and status-line configuration. Its 20 companies are recommendation catalog entries; no vendor API integration is credential-verified.

### Does vibeads provide a managed advertising service?

vibeads runs locally and stores its own data under `~/.vibeads/`. It does not provide a hosted campaign manager or conversion service.

### How is vibeads different from a Claude Code custom status line?

vibeads installs catalog matching and project-analysis hooks alongside a status-line script. [Claude Code custom status lines](https://code.claude.com/docs/en/statusline) run scripts you configure yourself.

### How is vibeads different from ccstatusline?

vibeads focuses on developer-tool recommendations. [ccstatusline](https://github.com/sirmalloc/ccstatusline) focuses on configurable terminal widgets for session information.

### Does vibeads send my code to a recommendation server?

vibeads makes no network requests for matching or tracking. Local impression records can contain command and file-path summaries.

### Does vibeads need an API key?

vibeads requires no API keys. Claude Code itself has its own installation and account requirements.

### Can I control the context-injection rate through config.json?

vibeads stores a rate in its configuration but the hook uses a fixed 0.2 probability. Changing that stored value does not change the hook's behavior.

### Will uninstall restore my previous status line?

vibeads removes its own status-line setting. It does not back up or restore the prior status line.

## License

MIT.
