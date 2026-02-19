#!/usr/bin/env node

import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const command = process.argv[2];

async function main() {
  switch (command) {
    case "init": {
      const { init } = await import("../src/install.js");
      await init();
      break;
    }
    case "uninstall": {
      const { uninstall } = await import("../src/uninstall.js");
      await uninstall();
      break;
    }
    case "dashboard": {
      const { dashboard } = await import("../src/dashboard.js");
      await dashboard();
      break;
    }
    default:
      console.log(`vibeads -- contextual dev tool discovery for Claude Code

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
