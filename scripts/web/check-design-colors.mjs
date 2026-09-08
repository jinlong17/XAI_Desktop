#!/usr/bin/env node
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync
} from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "../..");
const baselinePath = resolve(repoRoot, "docs/workflow/project/web-color-literal-baseline.json");
const tokenSource = "packages/plugin-web-tokens/src/tokens.css";
const sourceRoots = ["apps/web/src", "packages"];
const writeBaseline = process.argv.includes("--write-baseline");

const colorLiteralPattern =
  /#[0-9a-fA-F]{3,8}\b|\b(?:rgb|rgba|hsl|hsla|oklch|oklab|lab|lch)\([^;{}]*?\)|(?<![-\w])(?:white|black)(?![-\w])/g;

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

function walk(dir, output = []) {
  for (const name of readdirSync(dir)) {
    if (["node_modules", "dist", ".turbo", "coverage"].includes(name)) continue;
    const absolute = resolve(dir, name);
    const stat = statSync(absolute);
    if (stat.isDirectory()) {
      walk(absolute, output);
    } else if (absolute.endsWith(".css")) {
      output.push(absolute);
    }
  }
  return output;
}

function isWebCss(relativePath) {
  if (!relativePath.endsWith(".css")) return false;
  if (relativePath === tokenSource) return false;
  return (
    relativePath.startsWith("apps/web/src/") ||
    /^packages\/(?:plugin-web-|xai-web-)[^/]+\/src\//.test(relativePath)
  );
}

function maskComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, match => match.replace(/[^\n]/g, " "));
}

function lineInfo(text, index) {
  let line = 1;
  let lineStart = 0;
  for (let i = 0; i < index; i += 1) {
    if (text.charCodeAt(i) === 10) {
      line += 1;
      lineStart = i + 1;
    }
  }
  const lineEnd = text.indexOf("\n", index);
  const raw = text.slice(lineStart, lineEnd === -1 ? text.length : lineEnd);
  return {
    line,
    column: index - lineStart + 1,
    context: raw.trim().replace(/\s+/g, " ")
  };
}

function isTokenDerivedLiteral(value) {
  return /^(?:rgb|rgba|hsl|hsla|oklch|oklab|lab|lch)\(/.test(value) && /\bvar\(/.test(value);
}

function violationId({ file, value, context }) {
  return createHash("sha256")
    .update(`${file}\0${value}\0${context}`)
    .digest("hex")
    .slice(0, 16);
}

function collectViolations() {
  const absoluteFiles = sourceRoots.flatMap(root => walk(resolve(repoRoot, root)));
  const violations = [];

  for (const absolute of absoluteFiles) {
    const file = relative(repoRoot, absolute);
    if (!isWebCss(file)) continue;

    const text = readFileSync(absolute, "utf8");
    const masked = maskComments(text);
    for (const match of masked.matchAll(colorLiteralPattern)) {
      const value = match[0];
      if (isTokenDerivedLiteral(value)) continue;
      const info = lineInfo(text, match.index ?? 0);
      const violation = {
        file,
        line: info.line,
        column: info.column,
        value,
        context: info.context
      };
      violation.id = violationId(violation);
      violations.push(violation);
    }
  }

  return violations.sort((a, b) => {
    if (a.file !== b.file) return a.file.localeCompare(b.file);
    if (a.line !== b.line) return a.line - b.line;
    return a.column - b.column;
  });
}

function groupByFile(violations) {
  const groups = new Map();
  for (const violation of violations) {
    groups.set(violation.file, (groups.get(violation.file) ?? 0) + 1);
  }
  return [...groups.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([file, count]) => ({ file, count }));
}

function writeBaselineFile(violations) {
  const baseline = {
    schema_version: 1,
    policy:
      "Web CSS may define raw color literals only in packages/plugin-web-tokens/src/tokens.css. This file quarantines pre-existing legacy literals so new feature work cannot add more.",
    token_source: tokenSource,
    generated_at: new Date().toISOString(),
    violation_count: violations.length,
    files: groupByFile(violations),
    ids: violations.map(item => item.id)
  };
  mkdirSync(dirname(baselinePath), { recursive: true });
  writeFileSync(baselinePath, `${JSON.stringify(baseline, null, 2)}\n`);
  console.log(
    `wrote ${relative(repoRoot, baselinePath)} with ${violations.length} legacy color literal entries`
  );
}

function readBaseline() {
  if (!existsSync(baselinePath)) {
    fail(
      [
        `missing ${relative(repoRoot, baselinePath)}`,
        "Run: pnpm web:check-colors -- --write-baseline",
        "Then review the generated baseline before committing."
      ].join("\n")
    );
    return null;
  }
  return JSON.parse(readFileSync(baselinePath, "utf8"));
}

function summarize(violations, limit = 20) {
  return violations
    .slice(0, limit)
    .map(
      item =>
        `${item.file}:${item.line}:${item.column} ${item.value}\n  ${item.context}`
    )
    .join("\n");
}

const current = collectViolations();

if (writeBaseline) {
  writeBaselineFile(current);
  process.exit(0);
}

const baseline = readBaseline();
if (!baseline) process.exit(process.exitCode ?? 1);

const baselineIds = new Set(
  baseline.ids ?? (baseline.violations ?? []).map(item => item.id)
);
const currentIds = new Set(current.map(item => item.id));
const added = current.filter(item => !baselineIds.has(item.id));
const removed = [...baselineIds].filter(id => !currentIds.has(id));

if (added.length > 0) {
  fail(
    [
      `Web design color policy failed: ${added.length} new raw color literal(s) found outside ${tokenSource}.`,
      "",
      summarize(added),
      "",
      "Fix by adding or reusing semantic tokens in packages/plugin-web-tokens/src/tokens.css.",
      "Only update docs/workflow/project/web-color-literal-baseline.json when intentionally accepting legacy debt."
    ].join("\n")
  );
} else {
  console.log(
    `verified Web color policy: 0 new raw colors; ${current.length} legacy entries remain quarantined`
  );
}

if (removed.length > 0) {
  console.log(
    `note: ${removed.length} legacy color entries were removed; refresh baseline with pnpm web:check-colors -- --write-baseline after review`
  );
}
