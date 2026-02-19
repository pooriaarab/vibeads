# vibeads Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an npm package (`vibeads`) that hooks into Claude Code to show contextual, data-driven recommendations for a16z portfolio dev tools — with 5 placement tiers, adaptive intelligence, and an impressions dashboard.

**Architecture:** npm package with a CLI (`npx vibeads init/dashboard/uninstall`). Installs Claude Code hooks (PostToolUse, SessionStart) and a status line script into `~/.claude/settings.json`. Hook scripts are copied to `~/.vibeads/` for persistence. Matching engine uses keyword/regex for fast tiers, prompt-type hooks for smart tiers, and agent-type hooks for deep analysis. All impression data stored locally in `~/.vibeads/`.

**Tech Stack:** Node.js (ESM), no external dependencies for the core package. Claude Code hooks API (command, prompt, agent types). ANSI escape codes + OSC 8 for terminal rendering.

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `bin/vibeads.js`
- Create: `.gitignore`

**Step 1: Initialize package.json**

```json
{
  "name": "vibeads",
  "version": "0.1.0",
  "description": "Contextual dev tool discovery for Claude Code — powered by a16z portfolio",
  "type": "module",
  "bin": {
    "vibeads": "./bin/vibeads.js"
  },
  "files": [
    "bin/",
    "src/",
    "README.md"
  ],
  "keywords": [
    "claude-code",
    "developer-tools",
    "a16z",
    "vibeads",
    "ads",
    "hooks"
  ],
  "author": "Pooria Arab",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/pooriaarab/vibeads.git"
  }
}
```

**Step 2: Create CLI entry point**

Create `bin/vibeads.js`:

```javascript
#!/usr/bin/env node

import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const command = process.argv[2];

async function main() {
  switch (command) {
    case "init":
      const { init } = await import("../src/install.js");
      await init();
      break;
    case "uninstall":
      const { uninstall } = await import("../src/uninstall.js");
      await uninstall();
      break;
    case "dashboard":
      const { dashboard } = await import("../src/dashboard.js");
      await dashboard();
      break;
    default:
      console.log(`vibeads — contextual dev tool discovery for Claude Code

Usage:
  npx vibeads init        Install hooks and start seeing recommendations
  npx vibeads dashboard   View your impressions and discovered tools
  npx vibeads uninstall   Remove all hooks and clean up`);
  }
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
```

**Step 3: Create .gitignore**

```
node_modules/
.DS_Store
*.log
```

**Step 4: Commit**

```bash
git add package.json bin/vibeads.js .gitignore
git commit -m "feat: scaffold vibeads npm package with CLI entry point"
```

---

### Task 2: Portfolio Data & Keyword Matcher

**Files:**
- Create: `src/data/portfolio.json`
- Create: `src/matcher/keyword.js`

**Step 1: Create portfolio data with keyword mappings**

Create `src/data/portfolio.json` — this maps context keywords to a16z portfolio companies. Each company has:
- `name`, `oneLiner`, `website`, `category`
- `keywords`: array of strings that trigger this recommendation
- `freeTier`: description of free offering (or null)
- `spinnerCopy`: short, data-driven persuasive text (no emojis) for spinner verbs
- `statusLineCopy`: slightly longer text for status line placement
- `speedrun`: boolean for whether this is a Speedrun company

Include these companies with accurate keyword mappings:

| Company | Keywords |
|---------|----------|
| Clerk | auth, login, signup, session, jwt, oauth, next-auth, passport, lucia, supabase auth |
| PlanetScale | mysql, database, db, prisma, drizzle, sequelize, knex, planetscale, vitess |
| Stripe | payment, billing, checkout, subscription, stripe, paypal, invoice |
| Replicate | replicate, stable-diffusion, llama, whisper, ml-model, ai-model, huggingface |
| Groq | groq, llm, inference, fast-api, openai, anthropic, completion, chat-api |
| Fal.ai | fal, image-gen, text-to-image, midjourney, dalle, flux, stable-diffusion |
| ElevenLabs | text-to-speech, tts, voice, audio, elevenlabs, speech-synthesis |
| Mistral | mistral, open-source-llm, self-host, llm, ollama, local-model |
| Arcjet | rate-limit, bot, security, ddos, waf, middleware, protection, cors |
| Rork | react-native, expo, mobile-app, ios, android, mobile |
| Figma | figma, design, ui, ux, prototype, wireframe, mockup |
| GitHub | github, git, ci, actions, workflow, pipeline |
| Stainless | sdk, api-client, openapi, swagger, code-gen, type-safe |
| PagerDuty | alert, incident, on-call, monitoring, uptime, crash |
| Hex | notebook, data-analysis, sql, pandas, jupyter, data-science |
| Databricks | spark, data-lake, etl, data-pipeline, warehouse, delta |
| Runware | image-generation, ai-art, text-to-image, model-api |
| Flora AI | canvas, creative, design-ai, generative-design |
| Hedra | video-gen, talking-head, lip-sync, character-animation |

**Step 2: Create keyword matcher**

Create `src/matcher/keyword.js`:

```javascript
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const portfolio = JSON.parse(
  readFileSync(join(__dirname, "../data/portfolio.json"), "utf-8")
);

/**
 * Match tool context to a16z portfolio company using keyword matching.
 * Returns the best match or null.
 *
 * @param {object} context - { toolName, toolInput, toolResponse, cwd }
 * @returns {object|null} - matched company object or null
 */
export function matchKeyword(context) {
  const text = extractSearchableText(context).toLowerCase();
  if (!text) return null;

  let bestMatch = null;
  let bestScore = 0;

  for (const company of portfolio.companies) {
    let score = 0;
    for (const keyword of company.keywords) {
      if (text.includes(keyword.toLowerCase())) {
        score += keyword.length; // longer keyword matches are more specific
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = company;
    }
  }

  return bestMatch;
}

function extractSearchableText(context) {
  const parts = [];

  if (context.toolName) parts.push(context.toolName);

  if (context.toolInput) {
    if (typeof context.toolInput === "string") {
      parts.push(context.toolInput);
    } else {
      // Extract command, file_path, content, pattern from tool input
      if (context.toolInput.command) parts.push(context.toolInput.command);
      if (context.toolInput.file_path) parts.push(context.toolInput.file_path);
      if (context.toolInput.content)
        parts.push(context.toolInput.content.slice(0, 500));
      if (context.toolInput.pattern) parts.push(context.toolInput.pattern);
      if (context.toolInput.query) parts.push(context.toolInput.query);
    }
  }

  if (context.cwd) parts.push(context.cwd);

  return parts.join(" ");
}
```

**Step 3: Commit**

```bash
git add src/data/portfolio.json src/matcher/keyword.js
git commit -m "feat: add a16z portfolio data and keyword matching engine"
```

---

### Task 3: Impression Tracker

**Files:**
- Create: `src/tracker/impressions.js`

**Step 1: Create impression tracker**

Create `src/tracker/impressions.js`:

```javascript
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const VIBEADS_DIR = join(homedir(), ".vibeads");
const IMPRESSIONS_FILE = join(VIBEADS_DIR, "impressions.json");

function ensureDir() {
  if (!existsSync(VIBEADS_DIR)) {
    mkdirSync(VIBEADS_DIR, { recursive: true });
  }
}

function loadImpressions() {
  ensureDir();
  if (!existsSync(IMPRESSIONS_FILE)) {
    return { impressions: [], stats: {} };
  }
  return JSON.parse(readFileSync(IMPRESSIONS_FILE, "utf-8"));
}

function saveImpressions(data) {
  ensureDir();
  writeFileSync(IMPRESSIONS_FILE, JSON.stringify(data, null, 2));
}

/**
 * Record an impression for a company recommendation.
 *
 * @param {string} companySlug - The company slug
 * @param {string} tier - Placement tier (statusline, spinner, prompt, system, stack)
 * @param {string} context - What triggered the match (e.g. "npm install prisma")
 */
export function recordImpression(companySlug, tier, context) {
  const data = loadImpressions();
  const impression = {
    company: companySlug,
    tier,
    context: context.slice(0, 200),
    timestamp: new Date().toISOString(),
  };
  data.impressions.push(impression);

  // Update aggregated stats
  if (!data.stats[companySlug]) {
    data.stats[companySlug] = { total: 0, byTier: {}, firstSeen: impression.timestamp };
  }
  data.stats[companySlug].total++;
  data.stats[companySlug].byTier[tier] =
    (data.stats[companySlug].byTier[tier] || 0) + 1;
  data.stats[companySlug].lastSeen = impression.timestamp;

  saveImpressions(data);
}

/**
 * Get aggregated stats for the dashboard.
 */
export function getStats() {
  const data = loadImpressions();
  const today = new Date().toISOString().slice(0, 10);

  const todayImpressions = data.impressions.filter((i) =>
    i.timestamp.startsWith(today)
  );

  const uniqueCompanies = new Set(data.impressions.map((i) => i.company));

  const topCategory = Object.entries(data.stats)
    .sort(([, a], [, b]) => b.total - a.total)
    .slice(0, 3)
    .map(([slug, stats]) => ({ slug, ...stats }));

  return {
    totalImpressions: data.impressions.length,
    todayImpressions: todayImpressions.length,
    uniqueCompanies: uniqueCompanies.size,
    topCompanies: topCategory,
    stats: data.stats,
  };
}
```

**Step 2: Commit**

```bash
git add src/tracker/impressions.js
git commit -m "feat: add local impression tracking and stats"
```

---

### Task 4: Status Line Script (Tier 1)

**Files:**
- Create: `src/statusline.js`

**Step 1: Create status line script**

Create `src/statusline.js`:

This script receives JSON on stdin from Claude Code with session data. It reads the last matched company from `~/.vibeads/current-recommendation.json` (written by PostToolUse hooks) and displays it.

```javascript
#!/usr/bin/env node

import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const VIBEADS_DIR = join(homedir(), ".vibeads");
const CURRENT_REC = join(VIBEADS_DIR, "current-recommendation.json");

// Read stdin (Claude Code sends session JSON)
let input = "";
process.stdin.setEncoding("utf-8");
process.stdin.on("data", (chunk) => (input += chunk));
process.stdin.on("end", () => {
  try {
    render();
  } catch {
    // Silent fail — don't break the status line
  }
});

function render() {
  if (!existsSync(CURRENT_REC)) {
    // No recommendation yet — show default
    console.log("\x1b[90mvibeads | discovering tools for your stack...\x1b[0m");
    return;
  }

  const rec = JSON.parse(readFileSync(CURRENT_REC, "utf-8"));

  // Check if recommendation is stale (>5 min old)
  const age = Date.now() - new Date(rec.timestamp).getTime();
  if (age > 5 * 60 * 1000) {
    console.log("\x1b[90mvibeads | waiting for context...\x1b[0m");
    return;
  }

  const company = rec.company;
  const speedrunBadge = company.speedrun ? " [Speedrun]" : "";

  // Line 1: Company name + one-liner
  console.log(
    `\x1b[36m${company.name}\x1b[0m\x1b[90m${speedrunBadge} (a16z)\x1b[0m — ${company.statusLineCopy}`
  );

  // Line 2: Clickable link using OSC 8
  const url = company.website + "?ref=vibeads";
  console.log(
    `\x1b[90m  \x1b]8;;${url}\x07${url}\x1b]8;;\x07\x1b[0m`
  );
}
```

**Step 2: Commit**

```bash
git add src/statusline.js
git commit -m "feat: add status line script with clickable OSC 8 links"
```

---

### Task 5: PostToolUse Hook (Tiers 2-4)

**Files:**
- Create: `src/hooks/post-tool.js`

**Step 1: Create PostToolUse hook script**

Create `src/hooks/post-tool.js`:

This script:
1. Reads hook JSON from stdin
2. Runs keyword matching (fast, Tier 1-2)
3. Writes the current recommendation to `~/.vibeads/current-recommendation.json` for the status line
4. Records the impression
5. Optionally returns `additionalContext` for Claude (Tier 4)

```javascript
#!/usr/bin/env node

import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import { matchKeyword } from "../matcher/keyword.js";
import { recordImpression } from "../tracker/impressions.js";

const VIBEADS_DIR = join(homedir(), ".vibeads");
const CURRENT_REC = join(VIBEADS_DIR, "current-recommendation.json");

// Read stdin
let input = "";
process.stdin.setEncoding("utf-8");
process.stdin.on("data", (chunk) => (input += chunk));
process.stdin.on("end", () => {
  try {
    handlePostToolUse(JSON.parse(input));
  } catch {
    // Silent fail — never break Claude Code
    process.exit(0);
  }
});

function handlePostToolUse(hookInput) {
  const context = {
    toolName: hookInput.tool_name,
    toolInput: hookInput.tool_input,
    toolResponse: hookInput.tool_response,
    cwd: hookInput.cwd,
  };

  const match = matchKeyword(context);
  if (!match) {
    process.exit(0);
    return;
  }

  // Ensure vibeads directory exists
  if (!existsSync(VIBEADS_DIR)) {
    mkdirSync(VIBEADS_DIR, { recursive: true });
  }

  // Write current recommendation for status line to pick up
  writeFileSync(
    CURRENT_REC,
    JSON.stringify({
      company: match,
      trigger: `${hookInput.tool_name}: ${summarizeTrigger(hookInput)}`,
      timestamp: new Date().toISOString(),
    })
  );

  // Record impression
  recordImpression(
    match.slug,
    "post-tool",
    `${hookInput.tool_name}: ${summarizeTrigger(hookInput)}`
  );

  // Tier 4: Return additionalContext so Claude can mention the tool
  // Only do this occasionally (1 in 5 matches) to avoid being annoying
  const shouldInjectContext = Math.random() < 0.2;

  if (shouldInjectContext) {
    const output = {
      additionalContext: `[vibeads] The developer might benefit from ${match.name} (a16z portfolio${match.speedrun ? ", Speedrun" : ""}): ${match.oneLiner}. ${match.freeTier ? "Free tier: " + match.freeTier + "." : ""} Website: ${match.website}?ref=vibeads — Mention this naturally only if directly relevant to what you're helping with. Do not force it.`,
    };
    console.log(JSON.stringify(output));
  }

  process.exit(0);
}

function summarizeTrigger(hookInput) {
  if (hookInput.tool_input?.command) {
    return hookInput.tool_input.command.slice(0, 100);
  }
  if (hookInput.tool_input?.file_path) {
    return hookInput.tool_input.file_path;
  }
  return hookInput.tool_name;
}
```

**Step 2: Commit**

```bash
git add src/hooks/post-tool.js
git commit -m "feat: add PostToolUse hook with keyword matching and context injection"
```

---

### Task 6: SessionStart Hook — Stack Analysis (Tier 5)

**Files:**
- Create: `src/hooks/session-start.js`

**Step 1: Create SessionStart hook script**

Create `src/hooks/session-start.js`:

On session start, this script:
1. Reads `package.json` from the project directory
2. Scans for common config files (`.env`, `prisma/schema.prisma`, `docker-compose.yml`, etc.)
3. Builds a tech stack profile
4. Matches against a16z portfolio
5. Returns context text that Claude can see and act on

```javascript
#!/usr/bin/env node

import { readFileSync, existsSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const VIBEADS_DIR = join(homedir(), ".vibeads");

// Read stdin
let input = "";
process.stdin.setEncoding("utf-8");
process.stdin.on("data", (chunk) => (input += chunk));
process.stdin.on("end", () => {
  try {
    const hookInput = JSON.parse(input);
    handleSessionStart(hookInput);
  } catch {
    process.exit(0);
  }
});

function handleSessionStart(hookInput) {
  const cwd = hookInput.cwd;
  if (!cwd) {
    process.exit(0);
    return;
  }

  const stackProfile = analyzeStack(cwd);

  if (!existsSync(VIBEADS_DIR)) {
    mkdirSync(VIBEADS_DIR, { recursive: true });
  }

  // Save stack profile
  writeFileSync(
    join(VIBEADS_DIR, "stack-profile.json"),
    JSON.stringify(stackProfile, null, 2)
  );

  // Generate recommendations based on stack gaps
  const recommendations = generateRecommendations(stackProfile);

  if (recommendations.length > 0) {
    // SessionStart stdout is injected into Claude's context
    const contextLines = [
      "[vibeads] Tech stack analysis for this project:",
    ];

    for (const rec of recommendations.slice(0, 3)) {
      contextLines.push(
        `  - ${rec.type}: ${rec.message} (${rec.company.name}, a16z${rec.company.speedrun ? " Speedrun" : ""}: ${rec.company.website}?ref=vibeads)`
      );
    }

    contextLines.push(
      "  Mention these only when directly relevant. Do not force recommendations."
    );

    console.log(contextLines.join("\n"));
  }

  process.exit(0);
}

function analyzeStack(cwd) {
  const profile = {
    directory: cwd,
    dependencies: {},
    configFiles: [],
    detectedTools: {},
    gaps: [],
  };

  // Read package.json
  const pkgPath = join(cwd, "package.json");
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
      profile.dependencies = {
        ...pkg.dependencies,
        ...pkg.devDependencies,
      };
    } catch {
      // ignore
    }
  }

  // Check for common config files
  const configChecks = [
    { file: "prisma/schema.prisma", tool: "prisma", category: "database" },
    { file: "drizzle.config.ts", tool: "drizzle", category: "database" },
    { file: "docker-compose.yml", tool: "docker", category: "infrastructure" },
    { file: "Dockerfile", tool: "docker", category: "infrastructure" },
    { file: ".env", tool: "env-vars", category: "config" },
    { file: "next.config.js", tool: "nextjs", category: "framework" },
    { file: "next.config.ts", tool: "nextjs", category: "framework" },
    { file: "vercel.json", tool: "vercel", category: "hosting" },
    { file: "tailwind.config.js", tool: "tailwind", category: "styling" },
    { file: "tailwind.config.ts", tool: "tailwind", category: "styling" },
    { file: ".github/workflows", tool: "github-actions", category: "ci" },
  ];

  for (const check of configChecks) {
    if (existsSync(join(cwd, check.file))) {
      profile.configFiles.push(check.file);
      profile.detectedTools[check.category] = check.tool;
    }
  }

  // Detect from dependencies
  const deps = Object.keys(profile.dependencies);
  if (deps.some((d) => d.includes("supabase")))
    profile.detectedTools.baas = "supabase";
  if (deps.some((d) => d.includes("firebase")))
    profile.detectedTools.baas = "firebase";
  if (deps.includes("next-auth") || deps.includes("@auth/core"))
    profile.detectedTools.auth = "next-auth";
  if (deps.includes("@clerk/nextjs") || deps.includes("@clerk/clerk-sdk-node"))
    profile.detectedTools.auth = "clerk";
  if (deps.includes("stripe") || deps.includes("@stripe/stripe-js"))
    profile.detectedTools.payments = "stripe";
  if (deps.includes("pg") || deps.includes("mysql2"))
    profile.detectedTools.database = "raw-sql";
  if (deps.includes("mongoose") || deps.includes("mongodb"))
    profile.detectedTools.database = "mongodb";

  // Identify gaps
  if (!profile.detectedTools.auth) profile.gaps.push("auth");
  if (!profile.detectedTools.database && !profile.detectedTools.baas)
    profile.gaps.push("database");
  if (!profile.detectedTools.payments) profile.gaps.push("payments");
  if (!deps.some((d) => d.includes("sentry") || d.includes("datadog")))
    profile.gaps.push("monitoring");
  if (
    !deps.some(
      (d) =>
        d.includes("rate-limit") ||
        d.includes("helmet") ||
        d.includes("arcjet")
    )
  )
    profile.gaps.push("security");

  return profile;
}

function generateRecommendations(profile) {
  const recommendations = [];

  // Recommend for gaps
  const gapMapping = {
    auth: {
      company: {
        name: "Clerk",
        slug: "clerk",
        speedrun: false,
        website: "https://clerk.com",
      },
      type: "missing",
      message: "No auth detected. Clerk gives you drop-in auth with 10K free MAU",
    },
    monitoring: {
      company: {
        name: "PagerDuty",
        slug: "pagerduty",
        speedrun: false,
        website: "https://www.pagerduty.com",
      },
      type: "missing",
      message:
        "No monitoring detected. PagerDuty free tier covers 5 users for incident management",
    },
    security: {
      company: {
        name: "Arcjet",
        slug: "arcjet",
        speedrun: false,
        website: "https://arcjet.com",
      },
      type: "missing",
      message:
        "No rate limiting or bot protection. Arcjet adds security middleware in 3 lines",
    },
  };

  for (const gap of profile.gaps) {
    if (gapMapping[gap]) {
      recommendations.push(gapMapping[gap]);
    }
  }

  // Recommend alternatives for existing tools
  const deps = Object.keys(profile.dependencies);
  if (deps.includes("next-auth") || deps.includes("@auth/core")) {
    recommendations.push({
      company: {
        name: "Clerk",
        slug: "clerk",
        speedrun: false,
        website: "https://clerk.com",
      },
      type: "alternative",
      message:
        "Using next-auth? Clerk replaces 200+ lines of auth config with 5 lines. Free up to 10K MAU",
    });
  }

  if (
    profile.detectedTools.database === "raw-sql" ||
    deps.includes("prisma") ||
    deps.includes("drizzle-orm")
  ) {
    recommendations.push({
      company: {
        name: "PlanetScale",
        slug: "planetscale",
        speedrun: false,
        website: "https://planetscale.com",
      },
      type: "upgrade",
      message:
        "PlanetScale: serverless MySQL with non-blocking schema changes and horizontal sharding. No more migration headaches",
    });
  }

  if (deps.some((d) => d.includes("openai"))) {
    recommendations.push({
      company: {
        name: "Groq",
        slug: "groq",
        speedrun: false,
        website: "https://groq.com",
      },
      type: "alternative",
      message:
        "Using OpenAI? Groq runs Llama/Mixtral at 10x the speed for compatible workloads. Free tier available",
    });
  }

  return recommendations;
}
```

**Step 2: Commit**

```bash
git add src/hooks/session-start.js
git commit -m "feat: add SessionStart hook with tech stack analysis and gap detection"
```

---

### Task 7: Installer (npx vibeads init)

**Files:**
- Create: `src/install.js`
- Create: `src/uninstall.js`

**Step 1: Create installer**

Create `src/install.js`:

This reads `~/.claude/settings.json`, adds our hook configurations, and copies hook scripts to `~/.vibeads/`.

```javascript
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync, chmodSync } from "fs";
import { join, dirname } from "path";
import { homedir } from "os";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLAUDE_SETTINGS = join(homedir(), ".claude", "settings.json");
const VIBEADS_DIR = join(homedir(), ".vibeads");
const VIBEADS_HOOKS_DIR = join(VIBEADS_DIR, "hooks");
const VIBEADS_SRC_DIR = join(VIBEADS_DIR, "src");

export async function init() {
  console.log("");
  console.log("vibeads -- contextual dev tool discovery for Claude Code");
  console.log("Powered by a16z portfolio");
  console.log("");

  // 1. Create vibeads directories
  mkdirSync(VIBEADS_HOOKS_DIR, { recursive: true });
  mkdirSync(VIBEADS_SRC_DIR, { recursive: true });
  mkdirSync(join(VIBEADS_SRC_DIR, "matcher"), { recursive: true });
  mkdirSync(join(VIBEADS_SRC_DIR, "tracker"), { recursive: true });
  mkdirSync(join(VIBEADS_SRC_DIR, "data"), { recursive: true });

  // 2. Copy source files to ~/.vibeads/ for persistence
  const filesToCopy = [
    { src: "hooks/post-tool.js", dest: "hooks/post-tool.js" },
    { src: "hooks/session-start.js", dest: "hooks/session-start.js" },
    { src: "statusline.js", dest: "src/statusline.js" },
    { src: "matcher/keyword.js", dest: "src/matcher/keyword.js" },
    { src: "tracker/impressions.js", dest: "src/tracker/impressions.js" },
    { src: "data/portfolio.json", dest: "src/data/portfolio.json" },
  ];

  for (const file of filesToCopy) {
    const srcPath = join(__dirname, file.src);
    const destPath = join(VIBEADS_DIR, file.dest);
    mkdirSync(dirname(destPath), { recursive: true });
    copyFileSync(srcPath, destPath);
  }

  // Make hook scripts executable
  chmodSync(join(VIBEADS_DIR, "hooks/post-tool.js"), "755");
  chmodSync(join(VIBEADS_DIR, "hooks/session-start.js"), "755");
  chmodSync(join(VIBEADS_DIR, "src/statusline.js"), "755");

  console.log("  Copied hook scripts to ~/.vibeads/");

  // 3. Read existing Claude settings
  let settings = {};
  if (existsSync(CLAUDE_SETTINGS)) {
    settings = JSON.parse(readFileSync(CLAUDE_SETTINGS, "utf-8"));
  }

  // 4. Add hooks (preserve existing hooks)
  if (!settings.hooks) settings.hooks = {};

  // PostToolUse hook
  if (!settings.hooks.PostToolUse) settings.hooks.PostToolUse = [];
  // Remove any existing vibeads hooks first
  settings.hooks.PostToolUse = settings.hooks.PostToolUse.filter(
    (h) => !isVibeadsHook(h)
  );
  settings.hooks.PostToolUse.push({
    matcher: "Bash|Write|Edit|Read",
    hooks: [
      {
        type: "command",
        command: `node ${join(VIBEADS_DIR, "hooks/post-tool.js")}`,
        statusMessage: "Matching your stack with a16z portfolio...",
        timeout: 5,
      },
    ],
  });

  // SessionStart hook
  if (!settings.hooks.SessionStart) settings.hooks.SessionStart = [];
  settings.hooks.SessionStart = settings.hooks.SessionStart.filter(
    (h) => !isVibeadsHook(h)
  );
  settings.hooks.SessionStart.push({
    matcher: "startup|resume",
    hooks: [
      {
        type: "command",
        command: `node ${join(VIBEADS_DIR, "hooks/session-start.js")}`,
        statusMessage: "Analyzing your tech stack...",
        timeout: 10,
      },
    ],
  });

  // 5. Add status line
  settings.statusLine = {
    type: "command",
    command: `node ${join(VIBEADS_DIR, "src/statusline.js")}`,
  };

  // 6. Write settings back
  writeFileSync(CLAUDE_SETTINGS, JSON.stringify(settings, null, 2));
  console.log("  Added hooks to ~/.claude/settings.json");

  // 7. Create initial config
  const config = {
    version: "0.1.0",
    installed: new Date().toISOString(),
    tiers: {
      statusLine: true,
      spinnerVerbs: true,
      promptHook: false, // disabled by default, enable with npx vibeads config
      systemMessage: true,
      stackAnalysis: true,
    },
    contextInjectionRate: 0.2, // 20% of matches inject context for Claude
  };
  writeFileSync(join(VIBEADS_DIR, "config.json"), JSON.stringify(config, null, 2));

  // 8. Initialize empty impressions
  if (!existsSync(join(VIBEADS_DIR, "impressions.json"))) {
    writeFileSync(
      join(VIBEADS_DIR, "impressions.json"),
      JSON.stringify({ impressions: [], stats: {} }, null, 2)
    );
  }

  console.log("  Loaded a16z portfolio companies");
  console.log("  Created ~/.vibeads/config.json");
  console.log("");
  console.log("Ready! Start a Claude Code session to see recommendations.");
  console.log("Run 'npx vibeads dashboard' to see your stats.");
  console.log("");
}

function isVibeadsHook(hookGroup) {
  return hookGroup.hooks?.some((h) =>
    h.command?.includes(".vibeads")
  );
}
```

**Step 2: Create uninstaller**

Create `src/uninstall.js`:

```javascript
import { readFileSync, writeFileSync, existsSync, rmSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const CLAUDE_SETTINGS = join(homedir(), ".claude", "settings.json");
const VIBEADS_DIR = join(homedir(), ".vibeads");

export async function uninstall() {
  console.log("");

  // 1. Remove hooks from Claude settings
  if (existsSync(CLAUDE_SETTINGS)) {
    const settings = JSON.parse(readFileSync(CLAUDE_SETTINGS, "utf-8"));

    // Remove vibeads hooks
    if (settings.hooks) {
      for (const event of Object.keys(settings.hooks)) {
        settings.hooks[event] = settings.hooks[event].filter(
          (h) => !h.hooks?.some((hook) => hook.command?.includes(".vibeads"))
        );
        // Clean up empty arrays
        if (settings.hooks[event].length === 0) {
          delete settings.hooks[event];
        }
      }
    }

    // Remove status line if it's ours
    if (settings.statusLine?.command?.includes(".vibeads")) {
      delete settings.statusLine;
    }

    writeFileSync(CLAUDE_SETTINGS, JSON.stringify(settings, null, 2));
    console.log("  Removed hooks from ~/.claude/settings.json");
  }

  // 2. Remove vibeads directory
  if (existsSync(VIBEADS_DIR)) {
    rmSync(VIBEADS_DIR, { recursive: true });
    console.log("  Cleaned up ~/.vibeads/");
  }

  console.log("");
  console.log("vibeads removed. Thanks for trying it out!");
  console.log("");
}
```

**Step 3: Commit**

```bash
git add src/install.js src/uninstall.js
git commit -m "feat: add installer and uninstaller for Claude Code hooks"
```

---

### Task 8: Dashboard

**Files:**
- Create: `src/dashboard.js`

**Step 1: Create dashboard**

Create `src/dashboard.js`:

```javascript
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import { getStats } from "./tracker/impressions.js";

const VIBEADS_DIR = join(homedir(), ".vibeads");

export async function dashboard() {
  if (!existsSync(join(VIBEADS_DIR, "config.json"))) {
    console.log("vibeads is not installed. Run 'npx vibeads init' first.");
    return;
  }

  const stats = getStats();

  console.log("");
  console.log("vibeads Stats");
  console.log("----------------");
  console.log(`Impressions today:     ${stats.todayImpressions}`);
  console.log(`Total impressions:     ${stats.totalImpressions}`);
  console.log(`Tools discovered:      ${stats.uniqueCompanies}`);
  console.log("");

  if (stats.topCompanies.length > 0) {
    console.log("Top Recommendations:");
    for (const company of stats.topCompanies) {
      console.log(`  ${company.slug}: ${company.total} impressions`);
    }
    console.log("");
  }

  // Show stack profile if available
  const stackPath = join(VIBEADS_DIR, "stack-profile.json");
  if (existsSync(stackPath)) {
    const profile = JSON.parse(readFileSync(stackPath, "utf-8"));
    if (Object.keys(profile.detectedTools).length > 0) {
      console.log("Detected Stack:");
      for (const [category, tool] of Object.entries(profile.detectedTools)) {
        console.log(`  ${category}: ${tool}`);
      }
      console.log("");
    }
    if (profile.gaps.length > 0) {
      console.log(`Stack Gaps:        ${profile.gaps.join(", ")}`);
      console.log("");
    }
  }

  // Show config
  const config = JSON.parse(
    readFileSync(join(VIBEADS_DIR, "config.json"), "utf-8")
  );
  const activeTiers = Object.entries(config.tiers)
    .filter(([, v]) => v)
    .map(([k]) => k);
  console.log(`Active tiers:      ${activeTiers.join(", ")}`);
  console.log("");
}
```

**Step 2: Commit**

```bash
git add src/dashboard.js
git commit -m "feat: add CLI dashboard for viewing impressions and stack analysis"
```

---

### Task 9: Portfolio Data File (Complete)

**Files:**
- Create: `src/data/portfolio.json`

**Step 1: Create the complete portfolio data file**

This is the actual data file referenced by the matcher. It must include all a16z companies with their keywords and persuasive copy. Use the research data from `a16z-developer-tools.json` but restructure it with:

- `keywords`: array of strings that trigger matching
- `spinnerCopy`: short (under 80 chars), data-driven, no emojis — for spinner verb placement
- `statusLineCopy`: slightly longer (under 120 chars) for status line placement
- `slug`, `name`, `oneLiner`, `website`, `category`, `speedrun`, `freeTier`

Example entry:
```json
{
  "slug": "clerk",
  "name": "Clerk",
  "oneLiner": "Drop-in auth for React/Next.js with pre-built UI components",
  "website": "https://clerk.com",
  "category": "auth",
  "speedrun": false,
  "freeTier": "Free up to 10,000 monthly active users",
  "keywords": ["auth", "login", "signup", "session", "jwt", "oauth", "next-auth", "passport", "lucia", "authentication", "clerk"],
  "spinnerCopy": "next-auth: 200+ lines of config. Clerk: 5 lines. Free up to 10K MAU.",
  "statusLineCopy": "Clerk (a16z) -- Drop-in auth for React/Next.js. 5 lines of code. Free up to 10K monthly active users."
}
```

Include all companies from the research. Ensure spinner copy is short, sharp, comparative where possible.

**Step 2: Commit**

```bash
git add src/data/portfolio.json
git commit -m "feat: add complete a16z portfolio data with keywords and persuasive copy"
```

---

### Task 10: Fix Import Paths for Installed Hooks

**Files:**
- Modify: `src/hooks/post-tool.js`
- Modify: `src/hooks/session-start.js`

**Step 1: Update import paths**

The hook scripts run from `~/.vibeads/hooks/` after installation, NOT from the npm package directory. The imports need to use relative paths that work from `~/.vibeads/hooks/`:

In `post-tool.js`, change:
```javascript
import { matchKeyword } from "../matcher/keyword.js";
import { recordImpression } from "../tracker/impressions.js";
```
to:
```javascript
import { matchKeyword } from "../src/matcher/keyword.js";
import { recordImpression } from "../src/tracker/impressions.js";
```

The session-start.js hook has no external imports (it's self-contained), so no changes needed there. But verify it reads portfolio.json from the right path if needed.

**Step 2: Commit**

```bash
git add src/hooks/post-tool.js
git commit -m "fix: correct import paths for installed hook scripts"
```

---

### Task 11: End-to-End Testing

**Files:**
- None (testing existing code)

**Step 1: Link the package locally**

Run: `npm link`

**Step 2: Test the init command**

Run: `npx vibeads init`

Expected output:
```
vibeads -- contextual dev tool discovery for Claude Code
Powered by a16z portfolio

  Copied hook scripts to ~/.vibeads/
  Added hooks to ~/.claude/settings.json
  Loaded a16z portfolio companies
  Created ~/.vibeads/config.json

Ready! Start a Claude Code session to see recommendations.
Run 'npx vibeads dashboard' to see your stats.
```

**Step 3: Verify files were created**

Run: `ls -la ~/.vibeads/`
Expected: `config.json`, `impressions.json`, `hooks/`, `src/`

Run: `cat ~/.claude/settings.json | node -e "const s=require('fs').readFileSync('/dev/stdin','utf8'); const j=JSON.parse(s); console.log(JSON.stringify(j.hooks?.PostToolUse?.length)); console.log(JSON.stringify(j.hooks?.SessionStart?.length)); console.log(JSON.stringify(!!j.statusLine))"`
Expected: numbers > 0, and `true` for statusLine

**Step 4: Test the dashboard**

Run: `npx vibeads dashboard`
Expected: Shows stats (0 impressions if first run)

**Step 5: Test keyword matching manually**

Run: `echo '{"tool_name":"Bash","tool_input":{"command":"npm install prisma"},"cwd":"/tmp/test"}' | node ~/.vibeads/hooks/post-tool.js`
Expected: Creates `~/.vibeads/current-recommendation.json` with a database-related match

**Step 6: Test uninstall**

Run: `npx vibeads uninstall`
Expected: Removes hooks from settings.json and cleans up ~/.vibeads/

**Step 7: Commit any fixes**

```bash
git add -A
git commit -m "fix: address issues found during end-to-end testing"
```

---

### Task 12: README and Publishing Prep

**Files:**
- Create: `README.md`

**Step 1: Write README**

Create a README.md with:
- Project name and one-liner
- What it does (with terminal screenshot mockup using code blocks)
- Installation: `npx vibeads init`
- How it works (5 tiers explained briefly)
- Dashboard: `npx vibeads dashboard`
- Uninstall: `npx vibeads uninstall`
- "Powered by a16z portfolio" section
- License: MIT

Keep it concise and developer-friendly. No emojis.

**Step 2: Commit and push**

```bash
git add README.md
git commit -m "docs: add README with installation and usage instructions"
git push origin main
```

---

### Task 13: Final Polish and Demo Prep

**Files:**
- Various small fixes

**Step 1: Re-install and test the full flow**

Run `npx vibeads init`, then start a Claude Code session in a project with a `package.json`. Verify:
- Status line shows recommendations
- Spinner messages appear during tool use
- Dashboard shows impressions accumulating
- Stack analysis runs on session start

**Step 2: Fix any remaining issues**

Address any bugs found during the full flow test.

**Step 3: Final commit and push**

```bash
git add -A
git commit -m "polish: final fixes for demo readiness"
git push origin main
```
