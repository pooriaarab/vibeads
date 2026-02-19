import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync, chmodSync } from "fs";
import { join, dirname } from "path";
import { homedir } from "os";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLAUDE_SETTINGS = join(homedir(), ".claude", "settings.json");
const VIBEADS_DIR = join(homedir(), ".vibeads");

export async function init() {
  console.log("");
  console.log("vibeads -- contextual dev tool discovery for Claude Code");
  console.log("Powered by a16z portfolio");
  console.log("");

  // Create vibeads directories
  mkdirSync(join(VIBEADS_DIR, "hooks"), { recursive: true });
  mkdirSync(join(VIBEADS_DIR, "src", "matcher"), { recursive: true });
  mkdirSync(join(VIBEADS_DIR, "src", "tracker"), { recursive: true });
  mkdirSync(join(VIBEADS_DIR, "src", "data"), { recursive: true });

  // Copy source files to ~/.vibeads/ for persistence
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

  chmodSync(join(VIBEADS_DIR, "hooks/post-tool.js"), "755");
  chmodSync(join(VIBEADS_DIR, "hooks/session-start.js"), "755");
  chmodSync(join(VIBEADS_DIR, "src/statusline.js"), "755");

  console.log("  Copied hook scripts to ~/.vibeads/");

  // Read existing Claude settings
  let settings = {};
  if (existsSync(CLAUDE_SETTINGS)) {
    settings = JSON.parse(readFileSync(CLAUDE_SETTINGS, "utf-8"));
  }

  // Add hooks (preserve existing hooks)
  if (!settings.hooks) settings.hooks = {};

  // PostToolUse hook
  if (!settings.hooks.PostToolUse) settings.hooks.PostToolUse = [];
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

  // Add status line
  settings.statusLine = {
    type: "command",
    command: `node ${join(VIBEADS_DIR, "src/statusline.js")}`,
  };

  // Write settings back
  writeFileSync(CLAUDE_SETTINGS, JSON.stringify(settings, null, 2));
  console.log("  Added hooks to ~/.claude/settings.json");

  // Create initial config
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

  // Initialize empty impressions
  if (!existsSync(join(VIBEADS_DIR, "impressions.json"))) {
    writeFileSync(
      join(VIBEADS_DIR, "impressions.json"),
      JSON.stringify({ impressions: [], stats: {} }, null, 2)
    );
  }

  console.log("  Loaded 20 a16z portfolio companies");
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
