/**
 * TT-NO-TELEMETRY-SECRET — telemetry-DSN guard (row #6 P2, AC-3).
 *
 * The observability scaffold is no-op + secret-free; this guard PROVES no Sentry DSN (or bare
 * ingest host) ever reaches admin source or the built browser bundle:
 *   TT-NO-TELEMETRY-SECRET-SRC     no Sentry-DSN-shaped literal and no bare `ingest.sentry.io`
 *                                 host in apps/admin/src/** (excluding this guard's own file).
 *   TT-NO-TELEMETRY-SECRET-BUNDLE  same scan over apps/admin/dist/** after build; self-building.
 *
 * This COMPLEMENTS (does not replace) no-secret.test.ts / no-secret-bundle.test.ts /
 * no-provider-key.test.ts — those carry no Sentry pattern, so the DSN shape here is a genuine
 * addition. The patterns end with a concrete char class so this guard's own comments can't match.
 *
 * Crux (ADR-0008 §S6): the web CSP added `https://*.ingest.sentry.io`; the admin surface must
 * NOT inherit it. Keeping the ingest host out of src + dist is the runtime corollary of the
 * TT-CSP-NO-WILDCARD assertion (csp.test.ts).
 *
 * Scan scope (SRC): runtime source only — `*.test.ts(x)` guard files are EXCLUDED. Several sibling
 * guards (csp.test.ts, env-no-secret.test.ts) legitimately name the Sentry host inside a detection
 * pattern or doc comment; those are test guards, not shipped runtime code, and are never bundled.
 * The BUNDLE scan below is the authoritative "nothing reached the browser" check (test files are
 * not part of dist/**), so excluding test files from the SRC pass loses no real coverage.
 *
 * Authority: apps/admin/docs/deploy-observability/{api.md §5, test.md §5}.
 */
import { beforeAll, describe, expect, it } from "vitest";
import { execSync } from "child_process";
import { existsSync, readFileSync, readdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// apps/admin/src/__tests__ → apps/admin
const ADMIN_ROOT = join(__dirname, "..", "..");
const SRC = join(ADMIN_ROOT, "src");
const DIST = join(ADMIN_ROOT, "dist");
const ASSETS = join(DIST, "assets");

// Sentry-DSN shape: https://<publicKey>@<org/host>.ingest.sentry.io/<projectId>
// plus the bare ingest host (which would be the connect-src target).
const TELEMETRY_SECRET_PATTERNS: Array<{ name: string; pattern: RegExp }> = [
  {
    name: "Sentry DSN (key@org.ingest.sentry.io/projectId)",
    pattern: /https:\/\/[a-z0-9]+@[a-z0-9.-]+\.ingest\.sentry\.io\/[0-9]+/i,
  },
  {
    name: "bare Sentry ingest host (ingest.sentry.io)",
    pattern: /\bingest\.sentry\.io\b/i,
  },
];

function collectSourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectSourceFiles(full));
    else if (/\.(ts|tsx)$/.test(entry.name)) out.push(full);
  }
  return out;
}

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

describe("TT-NO-TELEMETRY-SECRET-SRC: no Sentry DSN/ingest host in apps/admin/src (AC-3)", () => {
  // Runtime source only — exclude test guards (they legitimately name the host in patterns/comments
  // and are never bundled; the BUNDLE scan is the authoritative browser-exposure check).
  const files = collectSourceFiles(SRC).filter((f) => !/\.test\.(ts|tsx)$/.test(f));

  for (const { name, pattern } of TELEMETRY_SECRET_PATTERNS) {
    it(`zero "${name}" across src/**`, () => {
      const hits: string[] = [];
      for (const f of files) {
        if (pattern.test(readFileSync(f, "utf-8"))) hits.push(f.replace(ADMIN_ROOT + "/", ""));
      }
      expect(
        hits,
        `Telemetry secret/host "${name}" found in: ${hits.join(", ")} — the observability scaffold must stay no-op + DSN-free; wiring a real sink is an operator step (runbook §Promotion Gate).`,
      ).toHaveLength(0);
    });
  }
});

describe("TT-NO-TELEMETRY-SECRET-BUNDLE: no Sentry DSN/ingest host in built apps/admin bundle (AC-3)", () => {
  let files: string[] = [];

  beforeAll(() => {
    if (!distLooksBuilt()) {
      execSync("pnpm exec vite build", { cwd: ADMIN_ROOT, stdio: "ignore" });
    }
    files = collectBundleFiles(DIST);
  }, 180_000);

  it("a built JS bundle is present to scan", () => {
    expect(files.filter((f) => f.endsWith(".js")).length, "no built .js under apps/admin/dist").toBeGreaterThan(0);
  });

  for (const { name, pattern } of TELEMETRY_SECRET_PATTERNS) {
    it(`zero "${name}" across dist/**`, () => {
      const hits: string[] = [];
      for (const f of files) {
        if (pattern.test(readFileSync(f, "utf-8"))) hits.push(f.replace(ADMIN_ROOT + "/", ""));
      }
      expect(
        hits,
        `Telemetry secret/host "${name}" found in built bundle: ${hits.join(", ")} — a DSN/ingest host reached the browser. Remove it; it requires an operator-approved ADR-0008 CSP extension that this slice does not perform.`,
      ).toHaveLength(0);
    });
  }
});
