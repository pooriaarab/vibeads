#!/usr/bin/env node

import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const VIBEADS_DIR = join(homedir(), ".vibeads");
const CURRENT_REC = join(VIBEADS_DIR, "current-recommendation.json");

let input = "";
process.stdin.setEncoding("utf-8");
process.stdin.on("data", (chunk) => (input += chunk));
process.stdin.on("end", () => {
  try {
    render();
  } catch {
    // Silent fail -- don't break the status line
  }
});

function render() {
  if (!existsSync(CURRENT_REC)) {
    console.log("\x1b[90mvibeads | discovering tools for your stack...\x1b[0m");
    return;
  }

  const rec = JSON.parse(readFileSync(CURRENT_REC, "utf-8"));

  const age = Date.now() - new Date(rec.timestamp).getTime();
  if (age > 5 * 60 * 1000) {
    console.log("\x1b[90mvibeads | waiting for context...\x1b[0m");
    return;
  }

  const company = rec.company;
  const speedrunBadge = company.speedrun ? " [Speedrun]" : "";
  const url = company.website + "?ref=vibeads";

  // Line 1: Company name + one-liner (no duplication)
  console.log(
    `\x1b[36m${company.name}\x1b[0m\x1b[90m${speedrunBadge} (a16z)\x1b[0m -- ${company.oneLiner}`
  );

  // Line 2: Clickable link using OSC 8 (Cmd+click in iTerm2/Kitty/WezTerm)
  console.log(
    `\x1b[90m  \x1b]8;;${url}\x07${url}\x1b]8;;\x07\x1b[0m`
  );
}
