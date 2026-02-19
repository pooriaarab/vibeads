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

export function recordImpression(companySlug, tier, context) {
  const data = loadImpressions();
  const impression = {
    company: companySlug,
    tier,
    context: context.slice(0, 200),
    timestamp: new Date().toISOString(),
  };
  data.impressions.push(impression);

  if (!data.stats[companySlug]) {
    data.stats[companySlug] = { total: 0, byTier: {}, firstSeen: impression.timestamp };
  }
  data.stats[companySlug].total++;
  data.stats[companySlug].byTier[tier] =
    (data.stats[companySlug].byTier[tier] || 0) + 1;
  data.stats[companySlug].lastSeen = impression.timestamp;

  saveImpressions(data);
}

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
