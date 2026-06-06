/**
 * TT-NO-SECRET-BUNDLE — built-bundle secret guard (Phase 5).
 *
 * HC-CRITICAL (AC-3): after `vite build`, NO service-role token, provider secret,
 * Stripe secret key, or provider-key-shaped/masked literal may appear in the
 * built apps/admin browser bundle (`dist/**`). This is the build-OUTPUT guard
 * that complements TT-NO-SECRET-SRC (source guard).
 *
 * Self-building & hermetic: if `dist/` is absent (fresh checkout / CI before the
 * build step), this test runs `vite build` itself so the assertion always has a
 * real bundle to scan. Build is invoked with a generous timeout.
 *
 * Extends the precedent at
 *   packages/plugin-web-settings-rest/src/__tests__/no-stripe-js-bundle.test.ts
 * from a source-only scan to a built-output scan (the admin slice's stricter
 * AC-3 requirement).
 *
 * Design authority: apps/admin/docs/design.md assumption #7; test.md §3.
 */
import { describe, it, expect, beforeAll } from "vitest";
import { execSync } from "child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// apps/admin/src/__tests__ → apps/admin
const ADMIN_ROOT = join(__dirname, "..", "..");
const DIST = join(ADMIN_ROOT, "dist");
const ASSETS = join(DIST, "assets");

/** Recursively collect built text assets (.js / .css / .html). */
function collectBundleFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectBundleFiles(full));
    else if (/\.(js|css|html)$/.test(entry.name)) out.push(full);
  }
  return out;
}

function distLooksBuilt(): boolean {
  return existsSync(ASSETS) && readdirSync(ASSETS).some((f) => f.endsWith(".js"));
}

// Secret / key-shaped literals that must NEVER reach the browser bundle.
// NOTE: each pattern ends with a concrete character class so this guard's own
// documentation comments cannot match it.
const BUNDLE_SECRET_PATTERNS: Array<{ name: string; pattern: RegExp }> = [
  { name: "Stripe test secret key", pattern: /sk_test_[A-Za-z0-9]/ },
  { name: "Stripe live secret key", pattern: /sk_live_[A-Za-z0-9]/ },
  { name: "Supabase service-role assignment", pattern: /SUPABASE_SERVICE_ROLE_KEY\s*[=:]\s*["']?[A-Za-z0-9]/ },
  { name: "service_role bearer literal", pattern: /service_role["']?\s*:\s*["'][A-Za-z0-9]/ },
  { name: "OpenAI-style secret key (sk- prefix + body)", pattern: /sk-[A-Za-z0-9]{8,}/ },
  { name: "Anthropic-style secret key (sk-ant- prefix)", pattern: /sk-ant-[A-Za-z0-9-]{6,}/ },
  { name: "Google API key (AIza prefix + body)", pattern: /AIza[A-Za-z0-9_-]{6,}/ },
  { name: "masked provider key (bullet mask)", pattern: /[A-Za-z-]{2,}•{3,}/ },
];

describe("TT-NO-SECRET-BUNDLE: no secret material in the built apps/admin bundle", () => {
  let files: string[] = [];

  beforeAll(() => {
    if (!distLooksBuilt()) {
      // Hermetic build: produce dist/ so the scan has a real bundle.
      execSync("pnpm exec vite build", { cwd: ADMIN_ROOT, stdio: "ignore" });
    }
    files = collectBundleFiles(DIST);
  }, 180_000);

  it("TT-NO-SECRET-BUNDLE-EXISTS: a built JS bundle is present to scan", () => {
    const js = files.filter((f) => f.endsWith(".js"));
    expect(js.length, "no built .js found under apps/admin/dist — build did not produce a bundle").toBeGreaterThan(0);
  });

  for (const { name, pattern } of BUNDLE_SECRET_PATTERNS) {
    it(`TT-NO-SECRET-BUNDLE: zero "${name}" across dist/**`, () => {
      const hits: string[] = [];
      for (const f of files) {
        const content = readFileSync(f, "utf-8");
        if (pattern.test(content)) hits.push(f.replace(ADMIN_ROOT, "apps/admin"));
      }
      expect(
        hits,
        `Secret/key pattern "${name}" found in built bundle: ${hits.join(", ")} — HC-CRITICAL: a secret reached the browser bundle. Remove it, purge git history, rotate the credential.`,
      ).toHaveLength(0);
    });
  }

  it("TT-NO-SECRET-BUNDLE-FRESH: dist assets are non-empty (sanity)", () => {
    const js = files.filter((f) => f.endsWith(".js"));
    for (const f of js) {
      expect(statSync(f).size, `${f} is empty`).toBeGreaterThan(0);
    }
  });
});
