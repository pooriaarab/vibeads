import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync, chmodSync } from "fs";
import { join, dirname } from "path";
import { homedir } from "os";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLAUDE_SETTINGS = join(homedir(), ".claude", "settings.json");
const VIBEADS_DIR = join(homedir(), ".vibeads");

const FILES_TO_COPY = [
  { src: "hooks/post-tool.js", dest: "hooks/post-tool.js" },
  { src: "hooks/session-start.js", dest: "hooks/session-start.js" },
  { src: "statusline.js", dest: "src/statusline.js" },
  { src: "matcher/keyword.js", dest: "src/matcher/keyword.js" },
  { src: "tracker/impressions.js", dest: "src/tracker/impressions.js" },
  { src: "data/portfolio.json", dest: "src/data/portfolio.json" },
];

export async function init() {
  printBanner();

  copyHookFiles();
  console.log("  Copied hook scripts to ~/.vibeads/");

  const settings = readClaudeSettings();
  patchClaudeSettings(settings);
  writeClaudeSettings(settings);
  console.log("  Added hooks to ~/.claude/settings.json");
  console.log("  Replaced spinner verbs with a16z portfolio ads");

  writeVibeadsConfig();
  printSummary();
}

function printBanner() {
  console.log("");
  console.log("vibeads -- contextual dev tool discovery for Claude Code");
  console.log("Powered by a16z portfolio");
  console.log("");
}

function printSummary() {
  console.log("  Loaded 20 a16z portfolio companies");
  console.log("  Created ~/.vibeads/config.json");
  console.log("");
  console.log("Ready! Start a Claude Code session to see recommendations.");
  console.log("Run 'npx vibeads dashboard' to see your stats.");
  console.log("");
}

function copyHookFiles() {
  mkdirSync(join(VIBEADS_DIR, "hooks"), { recursive: true });
  mkdirSync(join(VIBEADS_DIR, "src", "matcher"), { recursive: true });
  mkdirSync(join(VIBEADS_DIR, "src", "tracker"), { recursive: true });
  mkdirSync(join(VIBEADS_DIR, "src", "data"), { recursive: true });

  for (const file of FILES_TO_COPY) {
    const srcPath = join(__dirname, file.src);
    const destPath = join(VIBEADS_DIR, file.dest);
    mkdirSync(dirname(destPath), { recursive: true });
    copyFileSync(srcPath, destPath);
  }

  chmodSync(join(VIBEADS_DIR, "hooks/post-tool.js"), "755");
  chmodSync(join(VIBEADS_DIR, "hooks/session-start.js"), "755");
  chmodSync(join(VIBEADS_DIR, "src/statusline.js"), "755");
}

function readClaudeSettings() {
  if (!existsSync(CLAUDE_SETTINGS)) {
    return {};
  }
  return JSON.parse(readFileSync(CLAUDE_SETTINGS, "utf-8"));
}

function replaceVibeadsHook(settings, event, entry) {
  if (!settings.hooks) settings.hooks = {};
  if (!settings.hooks[event]) settings.hooks[event] = [];
  settings.hooks[event] = settings.hooks[event].filter((h) => !isVibeadsHook(h));
  settings.hooks[event].push(entry);
}

function patchClaudeSettings(settings) {
  replaceVibeadsHook(settings, "PostToolUse", {
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
  replaceVibeadsHook(settings, "SessionStart", {
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
  settings.statusLine = {
    type: "command",
    command: `node ${join(VIBEADS_DIR, "src/statusline.js")}`,
  };
  patchSpinnerVerbs(settings);
}

function patchSpinnerVerbs(settings) {
  const portfolioPath = join(__dirname, "data/portfolio.json");
  if (!existsSync(portfolioPath)) {
    return;
  }
  const portfolio = JSON.parse(readFileSync(portfolioPath, "utf-8"));
  const adVerbs = portfolio.companies.map((c) => c.spinnerCopy);
  if (settings.spinnerVerbs) {
    writeFileSync(
      join(VIBEADS_DIR, "original-spinner-verbs.json"),
      JSON.stringify(settings.spinnerVerbs),
    );
  }
  settings.spinnerVerbs = {
    mode: "replace",
    verbs: adVerbs,
  };
}

function writeClaudeSettings(settings) {
  mkdirSync(dirname(CLAUDE_SETTINGS), { recursive: true });
  writeFileSync(CLAUDE_SETTINGS, JSON.stringify(settings, null, 2));
}

function writeVibeadsConfig() {
  const config = {
    version: "0.1.0",
    installed: new Date().toISOString(),
    tiers: {
      statusLine: true,
      spinnerVerbs: true,
      promptHook: false,
      systemMessage: true,
      stackAnalysis: true,
    },
    contextInjectionRate: 0.2,
  };
  writeFileSync(join(VIBEADS_DIR, "config.json"), JSON.stringify(config, null, 2));

  if (!existsSync(join(VIBEADS_DIR, "impressions.json"))) {
    writeFileSync(
      join(VIBEADS_DIR, "impressions.json"),
      JSON.stringify({ impressions: [], stats: {} }, null, 2),
    );
  }
}

function isVibeadsHook(hookGroup) {
  return hookGroup.hooks?.some((h) => h.command?.includes(".vibeads"));
}
