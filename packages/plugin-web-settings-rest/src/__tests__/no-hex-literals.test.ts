/**
 * NH1 — No hex literals in src ts and tsx files (test.md §3 P1/P2/P3)
 *
 * Scans all TypeScript source files in this package and asserts that no
 * hex color literals (#rgb, #rrggbb, etc.) appear in the code.
 * The ONLY allowed location for hex literals is src/styles.css
 * (where they are expressed as OKLCH approximations anyway).
 *
 * This test guards the Frozen Assumption #7 + NH1 from design.md §8.
 */
import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "fs";
import { resolve, extname, relative } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SRC_DIR = resolve(__dirname, "..");

/** Regex for hex color literals in JS/TS context (not in comments). */
const HEX_PATTERN = /#[0-9a-fA-F]{3,8}\b/g;

function collectFiles(dir: string, exts: string[]): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = resolve(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      results.push(...collectFiles(full, exts));
    } else if (exts.includes(extname(full))) {
      results.push(full);
    }
  }
  return results;
}

describe("NH1: no hex literals in src/**/*.{ts,tsx}", () => {
  it("all TypeScript files are free of hex color literals", () => {
    const files = collectFiles(SRC_DIR, [".ts", ".tsx"]);
    const violations: { file: string; matches: string[] }[] = [];

    for (const file of files) {
      // Skip test files themselves (they may reference hex in test assertions)
      if (file.includes("__tests__")) continue;

      const content = readFileSync(file, "utf-8");
      // Strip single-line comments before scanning
      const stripped = content.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
      const matches: string[] = [];
      let m: RegExpExecArray | null;
      HEX_PATTERN.lastIndex = 0;
      while ((m = HEX_PATTERN.exec(stripped)) !== null) {
        matches.push(m[0]);
      }
      if (matches.length > 0) {
        violations.push({ file: relative(SRC_DIR, file), matches });
      }
    }

    expect(
      violations,
      `Hex color literals found in TSX/TS files:\n${violations.map((v) => `  ${v.file}: ${v.matches.join(", ")}`).join("\n")}`,
    ).toHaveLength(0);
  });
});
