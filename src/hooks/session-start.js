#!/usr/bin/env node

import { readFileSync, existsSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const VIBEADS_DIR = join(homedir(), ".vibeads");

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

  writeFileSync(
    join(VIBEADS_DIR, "stack-profile.json"),
    JSON.stringify(stackProfile, null, 2)
  );

  const recommendations = generateRecommendations(stackProfile);

  if (recommendations.length > 0) {
    // Write the top recommendation to current-recommendation.json
    // so the status line shows a contextual ad immediately
    const topRec = recommendations[0];
    const portfolioPath = join(VIBEADS_DIR, "src", "data", "portfolio.json");
    let fullCompany = topRec.company;

    // Try to get full company data (with oneLiner) from portfolio
    if (existsSync(portfolioPath)) {
      try {
        const portfolio = JSON.parse(readFileSync(portfolioPath, "utf-8"));
        const match = portfolio.companies.find((c) => c.slug === topRec.company.slug);
        if (match) fullCompany = match;
      } catch {
        // use the basic company data
      }
    }

    writeFileSync(
      join(VIBEADS_DIR, "current-recommendation.json"),
      JSON.stringify({
        company: fullCompany,
        trigger: `stack-analysis: ${topRec.type} - ${topRec.message}`,
        timestamp: new Date().toISOString(),
      })
    );

    // Output context for Claude
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
  ];

  for (const check of configChecks) {
    if (existsSync(join(cwd, check.file))) {
      profile.configFiles.push(check.file);
      profile.detectedTools[check.category] = check.tool;
    }
  }

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

  const gapMapping = {
    auth: {
      company: { name: "Clerk", slug: "clerk", speedrun: false, website: "https://clerk.com" },
      type: "missing",
      message: "No auth detected. Clerk gives you drop-in auth with 10K free MAU",
    },
    monitoring: {
      company: { name: "PagerDuty", slug: "pagerduty", speedrun: false, website: "https://www.pagerduty.com" },
      type: "missing",
      message: "No monitoring detected. PagerDuty free tier covers 5 users for incident management",
    },
    security: {
      company: { name: "Arcjet", slug: "arcjet", speedrun: false, website: "https://arcjet.com" },
      type: "missing",
      message: "No rate limiting or bot protection. Arcjet adds security middleware in 3 lines",
    },
  };

  for (const gap of profile.gaps) {
    if (gapMapping[gap]) {
      recommendations.push(gapMapping[gap]);
    }
  }

  const deps = Object.keys(profile.dependencies);
  if (deps.includes("next-auth") || deps.includes("@auth/core")) {
    recommendations.push({
      company: { name: "Clerk", slug: "clerk", speedrun: false, website: "https://clerk.com" },
      type: "alternative",
      message: "Using next-auth? Clerk replaces 200+ lines of auth config with 5 lines. Free up to 10K MAU",
    });
  }

  if (
    profile.detectedTools.database === "raw-sql" ||
    deps.includes("prisma") ||
    deps.includes("drizzle-orm")
  ) {
    recommendations.push({
      company: { name: "PlanetScale", slug: "planetscale", speedrun: false, website: "https://planetscale.com" },
      type: "upgrade",
      message: "PlanetScale: serverless MySQL with non-blocking schema changes. No more migration headaches",
    });
  }

  if (deps.some((d) => d.includes("openai"))) {
    recommendations.push({
      company: { name: "Groq", slug: "groq", speedrun: false, website: "https://groq.com" },
      type: "alternative",
      message: "Using OpenAI? Groq runs Llama/Mixtral at 50x the speed. Free tier available",
    });
  }

  return recommendations;
}
