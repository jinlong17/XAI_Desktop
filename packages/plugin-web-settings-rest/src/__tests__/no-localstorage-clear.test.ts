/**
 * no-localstorage-clear.test.ts — DEL-WILDCARD-GUARD source-text guard
 *
 * Asserts ZERO occurrences of `localStorage.clear()` in:
 *   packages/plugin-web-settings-rest/src/**\/*.{ts,tsx}
 *   packages/web-auth-device-session/src/**\/*.{ts,tsx}
 *
 * This is HC3 (no wildcard wipe) enforcement at source level.
 * Any future regression that swaps the registry-list iteration for a
 * wildcard wipe will fail this test.
 *
 * test.md §7.6 DEL-WILDCARD-GUARD
 */
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(__dirname, "../../../../");

function collectSourceFiles(dir: string): string[] {
  const files: string[] = [];
  const entries = readdirSync(dir);
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      // Skip __tests__ dirs — test files may call localStorage.clear() for cleanup (test.md §2 Mock Strategy)
      if (entry === "__tests__") continue;
      files.push(...collectSourceFiles(fullPath));
    } else if (
      (entry.endsWith(".ts") || entry.endsWith(".tsx")) &&
      // Exclude setup files which use localStorage.clear() for afterEach cleanup
      !entry.startsWith("vitest.setup") &&
      !entry.endsWith(".test.ts") &&
      !entry.endsWith(".test.tsx") &&
      !entry.endsWith(".spec.ts") &&
      !entry.endsWith(".spec.tsx")
    ) {
      files.push(fullPath);
    }
  }
  return files;
}

const SETTINGS_REST_SRC = resolve(ROOT, "packages/plugin-web-settings-rest/src");
const WEB_AUTH_SRC = resolve(ROOT, "packages/web-auth-device-session/src");

/**
 * Match localStorage.clear() as a non-comment call.
 * This strips single-line (//) and block (/* ... *\/) comment lines before checking,
 * to avoid false positives from "NEVER localStorage.clear()" guard comments.
 */
function stripLineComments(content: string): string {
  return content
    .split("\n")
    .map((line) => {
      const trimmed = line.trimStart();
      // Skip lines that start with // (single-line comment)
      if (trimmed.startsWith("//")) return "";
      // Strip trailing // comments (naive but sufficient for this guard)
      const inlineCommentIdx = line.indexOf("//");
      if (inlineCommentIdx >= 0) return line.slice(0, inlineCommentIdx);
      return line;
    })
    .join("\n");
}

describe("DEL-WILDCARD-GUARD: no localStorage.clear() in source files", () => {
  it("DEL-WILDCARD-GUARD-1: zero localStorage.clear() occurrences in plugin-web-settings-rest/src/**", () => {
    const files = collectSourceFiles(SETTINGS_REST_SRC);
    const matches: string[] = [];
    for (const file of files) {
      const raw = readFileSync(file, "utf-8");
      const content = stripLineComments(raw);
      if (content.includes("localStorage.clear()")) {
        matches.push(file.replace(ROOT, "").replace(/^\//, ""));
      }
    }
    expect(matches).toEqual([]);
  });

  it("DEL-WILDCARD-GUARD-2: zero localStorage.clear() occurrences in web-auth-device-session/src/**", () => {
    const files = collectSourceFiles(WEB_AUTH_SRC);
    const matches: string[] = [];
    for (const file of files) {
      const raw = readFileSync(file, "utf-8");
      const content = stripLineComments(raw);
      if (content.includes("localStorage.clear()")) {
        matches.push(file.replace(ROOT, "").replace(/^\//, ""));
      }
    }
    expect(matches).toEqual([]);
  });
});
