/**
 * TT-ENV-NO-SECRET — admin env-file secret guard (row #6 P1, AC-2).
 *
 * A `VITE_`-prefixed variable is inlined into the browser bundle at build time, so an
 * env file is a direct browser-exposure surface. This guard asserts:
 *   TT-ENV-NO-SECRET-VALUE   no committed apps/admin/.env* file contains a secret-shaped
 *                            literal (Stripe key / sk- key / Google AIza key / service_role /
 *                            Sentry DSN shape).
 *   TT-ENV-NO-SECRET-VARNAME no `VITE_`-prefixed variable NAME matches *_SECRET / *_KEY /
 *                            *_TOKEN / *_DSN / *SERVICE_ROLE* — such a name would imply a
 *                            credential is being shipped to the browser.
 *
 * Allow-list (non-secret flags, design.md / .env.example): VITE_ADMIN_MOCK_CLAIM,
 * VITE_ADMIN_AUTH_MODE.
 *
 * Complements (does not replace) no-secret.test.ts (src scan) and no-secret-bundle.test.ts
 * (dist scan). Patterns end with a concrete char class so this guard's own comments can't match.
 *
 * Design authority: apps/admin/docs/deploy-observability/{api.md §4.2, test.md §4}.
 */
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// apps/admin/src/__tests__ → apps/admin
const ADMIN_ROOT = join(__dirname, "..", "..");

/** All committed env files at the admin root: .env, .env.example, .env.local, .env.* */
function envFiles(): string[] {
  return readdirSync(ADMIN_ROOT, { withFileTypes: true })
    .filter((e) => e.isFile() && /^\.env(\..+)?$/.test(e.name))
    .map((e) => join(ADMIN_ROOT, e.name));
}

const SECRET_VALUE_PATTERNS: Array<{ name: string; pattern: RegExp }> = [
  { name: "Stripe test secret key", pattern: /sk_test_[A-Za-z0-9]/ },
  { name: "Stripe live secret key", pattern: /sk_live_[A-Za-z0-9]/ },
  { name: "OpenAI/Anthropic-style secret key (sk- prefix)", pattern: /sk-[A-Za-z0-9]{8,}/ },
  { name: "Google API key (AIza prefix)", pattern: /AIza[A-Za-z0-9_-]{6,}/ },
  { name: "Supabase service-role assignment", pattern: /service_role[A-Za-z0-9_]*\s*[=:]\s*["']?[A-Za-z0-9]/ },
  { name: "Sentry DSN (key@org.ingest.sentry.io/projectId)", pattern: /https:\/\/[a-z0-9]+@[a-z0-9.-]+\.ingest\.sentry\.io\/[0-9]+/i },
];

// VITE_ var-name suffixes/substrings that imply a credential is being exposed.
const SECRET_VARNAME_PATTERN = /^VITE_[A-Z0-9_]*(?:_SECRET|_KEY|_TOKEN|_DSN)\b|^VITE_[A-Z0-9_]*SERVICE_ROLE/;
// Known non-secret flags that are intentionally browser-exposed.
const ALLOWED_VITE_VARS = new Set(["VITE_ADMIN_MOCK_CLAIM", "VITE_ADMIN_AUTH_MODE"]);

describe("TT-ENV-NO-SECRET: admin env files expose no secret to the browser (AC-2)", () => {
  const files = envFiles();

  it("there is at least one committed env template to scan (.env.example)", () => {
    expect(existsSync(join(ADMIN_ROOT, ".env.example")), "apps/admin/.env.example must exist").toBe(true);
    expect(files.length, "expected at least one .env* file at apps/admin root").toBeGreaterThan(0);
  });

  for (const { name, pattern } of SECRET_VALUE_PATTERNS) {
    it(`TT-ENV-NO-SECRET-VALUE: zero "${name}" across apps/admin/.env*`, () => {
      const hits: string[] = [];
      for (const f of files) {
        if (pattern.test(readFileSync(f, "utf-8"))) hits.push(f.replace(ADMIN_ROOT + "/", ""));
      }
      expect(
        hits,
        `Secret-shaped value "${name}" found in: ${hits.join(", ")} — env files must never carry a real secret; rotate + purge if present.`,
      ).toHaveLength(0);
    });
  }

  it("TT-ENV-NO-SECRET-VARNAME: no VITE_ variable name implies a secret (allow-list: MOCK_CLAIM, AUTH_MODE)", () => {
    const offenders: string[] = [];
    for (const f of files) {
      const content = readFileSync(f, "utf-8");
      for (const rawLine of content.split("\n")) {
        // Consider both active `VITE_X=...` and commented `# VITE_X=...` declarations.
        const line = rawLine.replace(/^\s*#\s*/, "").trim();
        const varMatch = line.match(/^(VITE_[A-Z0-9_]+)\s*=/);
        const varName = varMatch?.[1];
        if (!varName) continue;
        if (ALLOWED_VITE_VARS.has(varName)) continue;
        if (SECRET_VARNAME_PATTERN.test(varName)) {
          offenders.push(`${f.replace(ADMIN_ROOT + "/", "")}: ${varName}`);
        }
      }
    }
    expect(
      offenders,
      `Secret-named VITE_ variable(s) found: ${offenders.join(", ")} — a VITE_ var is shipped to the browser; a *_SECRET/_KEY/_TOKEN/_DSN/SERVICE_ROLE name implies a leaked credential. Move it server-side.`,
    ).toHaveLength(0);
  });
});
