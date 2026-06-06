/**
 * TT-ISO — admin deploy-isolation guard (row #6 P1, AC-1).
 *
 * Locks the deployment-isolation invariants so the admin surface keeps shipping on
 * its OWN Cloudflare Pages target, independent of apps/web, with no shared deploy
 * credentials checked into the repo. These are in-repo, hermetic assertions; the
 * runtime Cloudflare account separation is an operator/dashboard fact recorded in
 * apps/admin/docs/deploy-observability/release-operator-runbook.md (assumption #9).
 *
 * Invariants (api.md §3 / test.md §3):
 *   TT-ISO-PROJECT-NAME     admin wrangler `name` === "xai-admin-dashboard" AND !== web's "xai-web-console"
 *   TT-ISO-SELF-CONTAINED   admin wrangler has no [vars]/[[secrets]]/[secrets]/account_id/api-token literal
 *   TT-ISO-OUTPUT-DIR       admin pages_build_output_dir === "./dist" (its own output, not apps/web/dist)
 *   TT-ISO-HEADERS-PARITY   after build, dist/_headers content === public/_headers content (trimmed)
 *   TT-ISO-NO-CROSS-IMPORT  zero file under apps/web/src/** imports `apps/admin` OR `@repo/admin`
 *
 * REC-1 (feature-review): HEADERS-PARITY is self-building like no-secret-bundle.test.ts —
 *   it runs `vite build` in beforeAll ONLY if dist/ is absent, and compares TRIMMED content
 *   to avoid trailing-newline flakiness (the R3 mitigation, made explicit here).
 * REC-2 (feature-review): NO-CROSS-IMPORT scans apps/web/src/** for BOTH the relative/path
 *   specifier `apps/admin` AND the workspace package name `@repo/admin`. (@repo/admin is
 *   private:true, so a real import is also a workspace-resolution error, but the source-text
 *   form is asserted so the guard is self-evident.)
 *
 * Design authority: apps/admin/docs/deploy-observability/{design.md,api.md,test.md}.
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
// apps/admin → repo root
const REPO_ROOT = join(ADMIN_ROOT, "..", "..");

const WRANGLER_PATH = join(ADMIN_ROOT, "wrangler.toml");
const PUBLIC_HEADERS = join(ADMIN_ROOT, "public", "_headers");
const DIST = join(ADMIN_ROOT, "dist");
const DIST_HEADERS = join(DIST, "_headers");
const DIST_ASSETS = join(DIST, "assets");
const WEB_SRC = join(REPO_ROOT, "apps", "web", "src");

const ADMIN_PROJECT_NAME = "xai-admin-dashboard";
const WEB_PROJECT_NAME = "xai-web-console";

function distLooksBuilt(): boolean {
  return existsSync(DIST_ASSETS) && readdirSync(DIST_ASSETS).some((f) => f.endsWith(".js"));
}

/** Recursively collect all .ts / .tsx files under a directory. */
function collectSourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectSourceFiles(full));
    else if (/\.(ts|tsx)$/.test(entry.name)) out.push(full);
  }
  return out;
}

describe("TT-ISO: admin deploy isolation (AC-1)", () => {
  const wrangler = readFileSync(WRANGLER_PATH, "utf-8");

  it("TT-ISO-PROJECT-NAME: admin Pages project name is xai-admin-dashboard and not the web project name", () => {
    const nameMatch = wrangler.match(/^\s*name\s*=\s*"([^"]+)"/m);
    expect(nameMatch, "admin wrangler.toml must declare a `name`").toBeTruthy();
    const name = nameMatch![1];
    expect(name, "admin Pages project name").toBe(ADMIN_PROJECT_NAME);
    expect(
      name,
      "admin Pages project must NOT collide with the apps/web Cloudflare Pages project",
    ).not.toBe(WEB_PROJECT_NAME);
  });

  it("TT-ISO-SELF-CONTAINED: admin wrangler.toml has no shared deploy creds (no [vars]/[[secrets]]/account_id/token literal)", () => {
    // No environment-variable injection block.
    expect(/^\s*\[vars\]/m.test(wrangler), "admin wrangler.toml must not declare a [vars] block").toBe(false);
    // No secrets table in either TOML form.
    expect(/^\s*\[\[secrets\]\]/m.test(wrangler), "admin wrangler.toml must not declare a [[secrets]] table").toBe(false);
    expect(/^\s*\[secrets\]/m.test(wrangler), "admin wrangler.toml must not declare a [secrets] table").toBe(false);
    // No inline Cloudflare account id / API token literal (those belong to operator/CI env, never in-repo).
    expect(/^\s*account_id\s*=/m.test(wrangler), "admin wrangler.toml must not pin an inline account_id").toBe(false);
    expect(
      /(api_token|cloudflare_api_token|CLOUDFLARE_API_TOKEN)\s*=\s*["'][^"']+["']/i.test(wrangler),
      "admin wrangler.toml must not embed a Cloudflare API token literal",
    ).toBe(false);
  });

  it("TT-ISO-OUTPUT-DIR: admin builds into its own ./dist (not apps/web/dist)", () => {
    const outMatch = wrangler.match(/^\s*pages_build_output_dir\s*=\s*"([^"]+)"/m);
    expect(outMatch, "admin wrangler.toml must declare pages_build_output_dir").toBeTruthy();
    expect(outMatch![1], "admin build output dir").toBe("./dist");
  });

  describe("TT-ISO-HEADERS-PARITY: built dist/_headers matches public/_headers verbatim", () => {
    // REC-1: self-building + trimmed compare.
    beforeAll(() => {
      if (!distLooksBuilt()) {
        execSync("pnpm exec vite build", { cwd: ADMIN_ROOT, stdio: "ignore" });
      }
    }, 180_000);

    it("dist/_headers exists after build and equals public/_headers (trimmed)", () => {
      expect(existsSync(DIST_HEADERS), "apps/admin/dist/_headers must exist after build (Vite copies public/_headers)").toBe(true);
      const distHeaders = readFileSync(DIST_HEADERS, "utf-8").trim();
      const publicHeaders = readFileSync(PUBLIC_HEADERS, "utf-8").trim();
      expect(
        distHeaders,
        "dist/_headers must be a verbatim copy of public/_headers — any mutation is an isolation/CSP regression",
      ).toBe(publicHeaders);
    });
  });

  it("TT-ISO-NO-CROSS-IMPORT: apps/web/src never imports apps/admin or @repo/admin", () => {
    // REC-2: scan for BOTH the relative/path specifier and the workspace package name.
    const webFiles = collectSourceFiles(WEB_SRC);
    expect(webFiles.length, "expected apps/web/src to contain source files").toBeGreaterThan(0);

    const offenders: string[] = [];
    for (const f of webFiles) {
      const content = readFileSync(f, "utf-8");
      // Match an import/export/dynamic-import/require specifier that resolves to the admin app.
      // Both forms: a path containing "apps/admin" and the workspace package "@repo/admin".
      const pathSpecifier = /["'`][^"'`]*apps\/admin[^"'`]*["'`]/;
      const pkgSpecifier = /["'`]@repo\/admin(?:\/[^"'`]*)?["'`]/;
      if (pathSpecifier.test(content) || pkgSpecifier.test(content)) {
        offenders.push(f.replace(REPO_ROOT + "/", ""));
      }
    }
    expect(
      offenders,
      `apps/web/src must NOT import the admin surface (admin is physically isolated; not in the web module rail). Offending files: ${offenders.join(", ")}`,
    ).toHaveLength(0);
  });
});
