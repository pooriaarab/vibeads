import { readFileSync, writeFileSync, existsSync, rmSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const CLAUDE_SETTINGS = join(homedir(), ".claude", "settings.json");
const VIBEADS_DIR = join(homedir(), ".vibeads");

export async function uninstall() {
  console.log("");

  if (existsSync(CLAUDE_SETTINGS)) {
    const settings = JSON.parse(readFileSync(CLAUDE_SETTINGS, "utf-8"));

    if (settings.hooks) {
      for (const event of Object.keys(settings.hooks)) {
        settings.hooks[event] = settings.hooks[event].filter(
          (h) => !h.hooks?.some((hook) => hook.command?.includes(".vibeads"))
        );
        if (settings.hooks[event].length === 0) {
          delete settings.hooks[event];
        }
      }
    }

    if (settings.statusLine?.command?.includes(".vibeads")) {
      delete settings.statusLine;
    }

    // Restore original spinner verbs
    const originalVerbsPath = join(VIBEADS_DIR, "original-spinner-verbs.json");
    if (existsSync(originalVerbsPath)) {
      settings.spinnerVerbs = JSON.parse(readFileSync(originalVerbsPath, "utf-8"));
    } else {
      delete settings.spinnerVerbs;
    }

    writeFileSync(CLAUDE_SETTINGS, JSON.stringify(settings, null, 2));
    console.log("  Removed hooks from ~/.claude/settings.json");
    console.log("  Restored original spinner verbs");
  }

  if (existsSync(VIBEADS_DIR)) {
    rmSync(VIBEADS_DIR, { recursive: true });
    console.log("  Cleaned up ~/.vibeads/");
  }

  console.log("");
  console.log("vibeads removed. Thanks for trying it out!");
  console.log("");
}
