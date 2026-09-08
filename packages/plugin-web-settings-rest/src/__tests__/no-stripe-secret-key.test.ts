/**
 * no-stripe-secret-key.test.ts — TT-NO-SK source-text guard
 *
 * HC3 CRITICAL: Stripe Secret Keys (sk_test_* / sk_live_*) MUST NEVER appear
 * in any client-side source file. This test walks all .ts/.tsx files under
 * packages/plugin-web-settings-rest/src/ and asserts zero matches.
 *
 * If this test fails, immediately rotate the key and remove it from all
 * commits via `git filter-repo` or BFG before merging.
 *
 * Design home: packages/plugin-web-settings-rest/docs/design.md §FA-12 (HC3)
 * Test strategy: packages/plugin-web-settings-rest/docs/test.md §6.5
 * Extension 2026-05-26 — Premium Pane Stripe Checkout Stub (gap-closure row #8)
 */
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** Recursively collect all .ts / .tsx files under a directory. */
function collectSourceFiles(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectSourceFiles(fullPath));
    } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

// Scan from package root (one level up from __tests__/)
const PKG_SRC = join(__dirname, "..");

// Match actual Stripe SK values: "sk_test_" or "sk_live_" followed by alphanumeric chars
// (real keys are typically 32+ chars: sk_test_4eC39HqLyjWDarjtT7). Comments that document
// the constraint (e.g. "No sk_test_* in this file") end with '*' and are NOT matched.
// Pattern: sk_test_ / sk_live_ followed by at least one alphanumeric character.
const SK_TEST_PATTERN = /sk_test_[A-Za-z0-9]/;
const SK_LIVE_PATTERN = /sk_live_[A-Za-z0-9]/;

describe("TT-NO-SK: no Stripe Secret Key in source", () => {
  const files = collectSourceFiles(PKG_SRC).filter(
    // Exclude this test file itself and any snapshot/fixture files
    (f) => !f.includes("no-stripe-secret-key"),
  );

  it("TT-NO-SK: zero actual sk_test_<value> keys in all .ts/.tsx source files", () => {
    const matches: string[] = [];
    for (const f of files) {
      const content = readFileSync(f, "utf-8");
      if (SK_TEST_PATTERN.test(content)) {
        matches.push(f);
      }
    }
    expect(
      matches,
      `Stripe test secret key (sk_test_<value>) found in: ${matches.join(", ")} — IMMEDIATE ACTION REQUIRED: rotate key + purge from git history`,
    ).toHaveLength(0);
  });

  it("TT-NO-SK: zero actual sk_live_<value> keys in all .ts/.tsx source files", () => {
    const matches: string[] = [];
    for (const f of files) {
      const content = readFileSync(f, "utf-8");
      if (SK_LIVE_PATTERN.test(content)) {
        matches.push(f);
      }
    }
    expect(
      matches,
      `Stripe live secret key (sk_live_<value>) found in: ${matches.join(", ")} — IMMEDIATE ACTION REQUIRED: rotate key + purge from git history`,
    ).toHaveLength(0);
  });
});
