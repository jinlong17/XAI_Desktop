/**
 * TT-CSP-GUARD — admin surface CSP source-text guard.
 *
 * Validates that apps/admin/public/_headers carries:
 *   1. A Content-Security-Policy directive.
 *   2. A tight connect-src limited to 'self' (no provider/OAuth/Stripe/OSM origins).
 *   3. frame-ancestors 'none' (clickjacking protection).
 *   4. ADR-0008-parity non-CSP security headers (HSTS / nosniff / DENY / Referrer / Permissions).
 *
 * This is the binding precedent guard for the admin _headers — cloned from
 * the apps/web/src/__tests__/csp.test.ts pattern (precedent source:
 * packages/plugin-web-settings-rest/src/__tests__/no-stripe-secret-key.test.ts).
 *
 * ADR-0008 §S6 extension protocol: any future admin _headers change must
 *   (1) amend design.md ADR-lite #1 record,
 *   (2) extend this guard with a new named test,
 *   (3) update the CSP line in public/_headers.
 *
 * Design authority: apps/admin/docs/design.md §ADR-lite #1.
 * Test strategy: apps/admin/docs/test.md §3 (TT-CSP-GUARD).
 * Phase: P1 (scaffold + deploy boundary).
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// From apps/admin/src/__tests__/ → apps/admin/public/_headers
const HEADERS_PATH = resolve(__dirname, "../../public/_headers");

describe("TT-CSP-GUARD: admin _headers CSP source-text guard", () => {
  it("TT-CSP-GUARD-EXISTS: _headers contains a Content-Security-Policy directive", () => {
    const content = readFileSync(HEADERS_PATH, "utf-8");
    const cspLine = content
      .split("\n")
      .find((l) => l.includes("Content-Security-Policy:"));
    expect(
      cspLine,
      "apps/admin/public/_headers must contain a Content-Security-Policy directive"
    ).toBeTruthy();
  });

  it("TT-CSP-GUARD-CONNECT-SELF: connect-src is limited to 'self' (no external provider/OAuth/Stripe/OSM origins)", () => {
    const content = readFileSync(HEADERS_PATH, "utf-8");
    const cspLine = content
      .split("\n")
      .find((l) => l.includes("Content-Security-Policy:"));
    expect(cspLine, "_headers has no CSP line").toBeTruthy();

    const connectSrcMatch = cspLine!.match(/connect-src([^;]*)/);
    expect(
      connectSrcMatch,
      "CSP has no connect-src directive"
    ).toBeTruthy();

    const connectSrcValue = connectSrcMatch![1] ?? "";
    expect(
      connectSrcValue,
      "connect-src must include 'self'"
    ).toContain("'self'");

    // Admin CSP must NOT contain external provider origins this slice.
    // If real Supabase auth is wired (row #2), its host is the only allowed addition
    // and must follow the ADR-0008 extension protocol (amend record + extend _headers + write guard).
    const forbiddenOrigins = [
      "api.anthropic.com",
      "api.openai.com",
      "api.groq.com",
      "js.stripe.com",
      "checkout.stripe.com",
      "buy.stripe.com",
      "tile.openstreetmap.org",
      "api.notion.com",
      "oauth2.googleapis.com",
      "api.linear.app",
    ];
    for (const origin of forbiddenOrigins) {
      expect(
        connectSrcValue,
        `connect-src must NOT include ${origin} — admin surface is isolated; add only via ADR-0008 extension protocol`
      ).not.toContain(origin);
    }
  });

  it("TT-CSP-GUARD-FRAME-ANCESTORS: frame-ancestors 'none' prevents clickjacking", () => {
    const content = readFileSync(HEADERS_PATH, "utf-8");
    const cspLine = content
      .split("\n")
      .find((l) => l.includes("Content-Security-Policy:"));
    expect(cspLine, "_headers has no CSP line").toBeTruthy();
    expect(
      cspLine,
      "CSP must contain frame-ancestors 'none'"
    ).toContain("frame-ancestors 'none'");
  });

  it("TT-CSP-GUARD-HSTS: Strict-Transport-Security header present", () => {
    const content = readFileSync(HEADERS_PATH, "utf-8");
    expect(
      content,
      "_headers must contain Strict-Transport-Security"
    ).toContain("Strict-Transport-Security:");
  });

  it("TT-CSP-GUARD-NOSNIFF: X-Content-Type-Options: nosniff present", () => {
    const content = readFileSync(HEADERS_PATH, "utf-8");
    expect(content).toContain("X-Content-Type-Options: nosniff");
  });

  it("TT-CSP-GUARD-XFRAME: X-Frame-Options: DENY present", () => {
    const content = readFileSync(HEADERS_PATH, "utf-8");
    expect(content).toContain("X-Frame-Options: DENY");
  });

  it("TT-CSP-GUARD-REFERRER: Referrer-Policy present", () => {
    const content = readFileSync(HEADERS_PATH, "utf-8");
    expect(content).toContain("Referrer-Policy:");
  });

  it("TT-CSP-GUARD-PERMISSIONS: Permissions-Policy present", () => {
    const content = readFileSync(HEADERS_PATH, "utf-8");
    expect(content).toContain("Permissions-Policy:");
  });

  it("TT-CSP-GUARD-OBJECT-SRC: object-src 'none' (no plugin/embed attack surface)", () => {
    const content = readFileSync(HEADERS_PATH, "utf-8");
    const cspLine = content
      .split("\n")
      .find((l) => l.includes("Content-Security-Policy:"));
    expect(cspLine, "_headers has no CSP line").toBeTruthy();
    expect(
      cspLine,
      "CSP must contain object-src 'none'"
    ).toContain("object-src 'none'");
  });
});
