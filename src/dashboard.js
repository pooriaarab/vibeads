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

  const config = JSON.parse(
    readFileSync(join(VIBEADS_DIR, "config.json"), "utf-8")
  );
  const activeTiers = Object.entries(config.tiers)
    .filter(([, v]) => v)
    .map(([k]) => k);
  console.log(`Active tiers:      ${activeTiers.join(", ")}`);
  console.log("");
}
