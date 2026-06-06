/**
 * TT-NO-SECRET-SRC — admin surface source-text secret guard (Phase 1 scope: src/).
 *
 * HC-CRITICAL: No service-role token, provider secret, or Stripe secret key
 * may appear in apps/admin/src/**. This test walks all .ts/.tsx source files
 * and asserts zero matches for known secret patterns.
 *
 * Extends the precedent from:
 *   packages/plugin-web-settings-rest/src/__tests__/no-stripe-secret-key.test.ts
 *   (REC-1 from feature-review: the canonical precedent is in plugin-web-settings-rest,
 *    NOT in apps/web — path corrected here per review recommendation).
 *
 * Patterns guarded (same as the precedent, extended for admin context):
 *   - Stripe secret keys: sk_test_<alphanum> / sk_live_<alphanum>
 *   - Supabase service-role: SUPABASE_SERVICE_ROLE_KEY=<value> literals
 *   - Provider secret shapes: typical patterns (extend via ADR-0008 protocol)
 *
 * TT-NO-SECRET-BUNDLE (Phase 5 gate) extends this to scan dist/ after build.
 *
 * Design authority: apps/admin/docs/design.md §ADR-lite #1, assumption #7.
 * Test strategy: apps/admin/docs/test.md §3 (TT-NO-SECRET-SRC).
 * Phase: P1 (scaffold + deploy boundary).
 */
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Scan from apps/admin/src/ (one level up from __tests__/)
const ADMIN_SRC = join(__dirname, "..");

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

// Secret patterns (values, not documentation comments).
// Patterns end with alphanumeric char to avoid matching doc-comment descriptions
// like "sk_test_* must never appear" (which end with '*').
const SECRET_PATTERNS: Array<{ name: string; pattern: RegExp }> = [
  { name: "Stripe test secret key (sk_test_<value>)", pattern: /sk_test_[A-Za-z0-9]/ },
  { name: "Stripe live secret key (sk_live_<value>)", pattern: /sk_live_[A-Za-z0-9]/ },
  {
    name: "Supabase service-role key assignment (SUPABASE_SERVICE_ROLE_KEY=<value>)",
    // Matches assignment (=) followed by a non-whitespace, non-quote-close character.
    // Comment-form ("SUPABASE_SERVICE_ROLE_KEY must not appear") does NOT match.
    pattern: /SUPABASE_SERVICE_ROLE_KEY\s*=\s*[A-Za-z0-9]/,
  },
  {
    name: "Generic service-role bearer token (service_role:<value>)",
    pattern: /service_role:[A-Za-z0-9]/,
  },
];

describe("TT-NO-SECRET-SRC: no secret material in apps/admin/src", () => {
  const allFiles = collectSourceFiles(ADMIN_SRC).filter(
    // Exclude this test file itself (it documents the patterns)
    (f) => !f.includes("no-secret.test"),
  );

  for (const { name, pattern } of SECRET_PATTERNS) {
    it(`TT-NO-SECRET-SRC: zero "${name}" in all .ts/.tsx source files`, () => {
      const matches: string[] = [];
      for (const f of allFiles) {
        const content = readFileSync(f, "utf-8");
        if (pattern.test(content)) {
          matches.push(f);
        }
      }
      expect(
        matches,
        `Secret pattern "${name}" found in: ${matches.join(", ")} — IMMEDIATE ACTION REQUIRED: remove secret + purge from git history`,
      ).toHaveLength(0);
    });
  }
});
