import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const portfolio = JSON.parse(
  readFileSync(join(__dirname, "../data/portfolio.json"), "utf-8")
);

export function matchKeyword(context) {
  const text = extractSearchableText(context).toLowerCase();
  if (!text) return null;

  let bestMatch = null;
  let bestScore = 0;

  for (const company of portfolio.companies) {
    let score = 0;
    for (const keyword of company.keywords) {
      if (text.includes(keyword.toLowerCase())) {
        score += keyword.length;
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
