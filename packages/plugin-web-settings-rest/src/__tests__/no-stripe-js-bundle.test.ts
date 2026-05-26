/**
 * no-stripe-js-bundle.test.ts — TT-NO-STRIPE-JS source-text guard
 *
 * HC4: Stripe.js MUST NOT be bundled (no @stripe/stripe-js import and
 * no https://js.stripe.com/ CDN script tag in source). Same-tab Payment Link
 * redirect is the only permitted Stripe interaction in v1 (A1 + B1 decisions).
 *
 * If this test fails, the Stripe.js bundle has been accidentally introduced —
 * revert the import/CDN script and re-evaluate against the discovery §3
 * decision rationale before re-adding.
 *
 * Design home: packages/plugin-web-settings-rest/docs/design.md §FA-2 (A1)
 * Test strategy: packages/plugin-web-settings-rest/docs/test.md §6.6
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

const PKG_SRC = join(__dirname, "..");

// Match actual import statements referencing @stripe/stripe-js or the CDN URL.
// Comments that document the constraint (e.g. "NO @stripe/stripe-js import") are
// not matched because they don't contain the `from` or `require(` keyword pattern.
// Pattern: from "@stripe/stripe-js" or require("@stripe/stripe-js") or import("@stripe/stripe-js")
const STRIPE_JS_IMPORT_PATTERN = /(?:from|require\(|import\()\s*['"]@stripe\/stripe-js['"]/;

describe("TT-NO-STRIPE-JS: no Stripe.js bundle in source", () => {
  const files = collectSourceFiles(PKG_SRC).filter(
    (f) => !f.includes("no-stripe-js-bundle"),
  );

  it("TT-NO-STRIPE-JS-1: zero actual @stripe/stripe-js import statements in all .ts/.tsx source files", () => {
    const matches: string[] = [];
    for (const f of files) {
      const content = readFileSync(f, "utf-8");
      if (STRIPE_JS_IMPORT_PATTERN.test(content)) {
        matches.push(f);
      }
    }
    expect(
      matches,
      `@stripe/stripe-js import found in: ${matches.join(", ")} — Stripe.js MUST NOT be bundled in v1 stub; use Payment Link redirect instead (A1 decision)`,
    ).toHaveLength(0);
  });

  it("TT-NO-STRIPE-JS-2: zero occurrences of https://js.stripe.com/ CDN script in all .ts/.tsx source files", () => {
    const matches: string[] = [];
    for (const f of files) {
      const content = readFileSync(f, "utf-8");
      if (content.includes("https://js.stripe.com/")) {
        matches.push(f);
      }
    }
    expect(
      matches,
      `https://js.stripe.com/ CDN reference found in: ${matches.join(", ")} — Stripe.js MUST NOT be loaded from CDN in v1 stub; use Payment Link redirect instead (A1 decision)`,
    ).toHaveLength(0);
  });
});
