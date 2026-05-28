import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const DIST_ROOT = resolve("./dist");
const TARGET_EXTENSIONS = [".js", ".map"];
const FORBIDDEN_PATTERNS = [/@tauri-apps\/api/, /__TAURI__/];

function collectFiles(root) {
  const files = [];

  function walk(current) {
    for (const entry of readdirSync(current)) {
      const next = join(current, entry);
      const stat = statSync(next);
      if (stat.isDirectory()) {
        walk(next);
        continue;
      }

      if (TARGET_EXTENSIONS.some((ext) => next.endsWith(ext))) {
        files.push(next);
      }
    }
  }

  walk(root);
  return files;
}

function findViolations(filePath) {
  const content = readFileSync(filePath, "utf8");
  const matches = [];
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(content)) {
      matches.push(pattern.source);
    }
  }
  return matches;
}

const files = collectFiles(DIST_ROOT);
const violations = [];

for (const file of files) {
  const matchedPatterns = findViolations(file);
  if (matchedPatterns.length > 0) {
    violations.push({
      file,
      matchedPatterns,
    });
  }
}

if (violations.length > 0) {
  console.error("[browser-safety-assert-dist] forbidden patterns found in built artifacts:");
  for (const violation of violations) {
    console.error(`- ${violation.file} -> ${violation.matchedPatterns.join(", ")}`);
  }
  process.exit(1);
}

console.log("[browser-safety-assert-dist] dist artifacts are browser-safe");
