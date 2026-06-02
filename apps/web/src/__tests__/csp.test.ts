/**
 * CSP source-text guards for apps/web/public/_headers.
 *
 * CSP1 — `connect-src` includes https://api.anthropic.com (gap-closure #2, amended 2026-05-25)
 * CSP2 — `connect-src` + `img-src` include https://tile.openstreetmap.org (gap-closure #6 MapView, amended 2026-05-25)
 * CSP3 — `connect-src` includes https://api.notion.com AND https://oauth2.googleapis.com AND https://api.linear.app (gap-closure #7 Integrations OAuth stub, amended 2026-05-25)
 * CSP4 — `connect-src` includes https://js.stripe.com AND https://checkout.stripe.com AND https://buy.stripe.com (gap-closure #8 Premium Stripe stub, amended 2026-05-26)
 * CSP4-SCRIPT-SRC-CLEAN — `script-src` does NOT include any Stripe CDN URL (no Stripe.js bundle)
 * CSP4-FRAME-SRC-CLEAN — `frame-src` is NOT present in the CSP (no embedded Checkout iframe)
 *
 * These are the binding precedent guards for wave 1+2+3 CSP rows per
 * ADR-0008 §S3 D3. If any guard fails, the CSP was narrowed without
 * updating the ADR and this test file.
 *
 * Test strategy: packages/xai-web-ai-chat/docs/test.md §7.4 CSP1
 *               packages/plugin-web-board-views/docs/test.md §S15.5 CSP2
 *               packages/plugin-web-settings-rest/docs/test.md §5.3 P5 CSP3
 *               packages/plugin-web-settings-rest/docs/test.md §6.5 P5 CSP4
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// From apps/web/src/__tests__/ → apps/web/public/_headers
const HEADERS_PATH = resolve(__dirname, "../../public/_headers");

describe("CSP source-text guards", () => {
  it("CSP1: connect-src includes https://api.anthropic.com", () => {
    const content = readFileSync(HEADERS_PATH, "utf-8");
    // Extract the CSP line.
    const cspLine = content
      .split("\n")
      .find((l) => l.includes("Content-Security-Policy:"));
    expect(
      cspLine,
      "_headers does not contain a Content-Security-Policy directive",
    ).toBeTruthy();
    expect(
      cspLine,
      "connect-src does not include https://api.anthropic.com — CSP was narrowed without updating ADR-0008 §S3 D3",
    ).toContain("https://api.anthropic.com");
  });

  it("CSP2: connect-src + img-src both include https://tile.openstreetmap.org (MapView OSM tiles)", () => {
    const content = readFileSync(HEADERS_PATH, "utf-8");
    const cspLine = content
      .split("\n")
      .find((l) => l.includes("Content-Security-Policy:"));
    expect(
      cspLine,
      "_headers does not contain a Content-Security-Policy directive",
    ).toBeTruthy();
    // connect-src must allow tile fetch requests
    expect(
      cspLine,
      "connect-src does not include https://tile.openstreetmap.org — MapView OSM tiles are blocked; update ADR-0008 §S3 D3 + _headers",
    ).toContain("https://tile.openstreetmap.org");
    // img-src must allow tile images (Leaflet loads tiles as <img> elements)
    // img-src appears before connect-src in the directive order — verify
    // independently by checking the full CSP string contains the OSM origin
    // in an img-src context
    const imgSrcMatch = cspLine?.match(/img-src[^;]*/);
    expect(
      imgSrcMatch?.[0],
      "img-src does not include https://tile.openstreetmap.org — Leaflet tile images are blocked; update ADR-0008 §S3 D3 + _headers",
    ).toContain("https://tile.openstreetmap.org");
  });

  it("CSP3: connect-src includes OAuth token endpoints for Notion, GCal, and Linear (gap-closure #7)", () => {
    const content = readFileSync(HEADERS_PATH, "utf-8");
    const cspLine = content
      .split("\n")
      .find((l) => l.includes("Content-Security-Policy:"));
    expect(
      cspLine,
      "_headers does not contain a Content-Security-Policy directive",
    ).toBeTruthy();
    expect(
      cspLine,
      "connect-src does not include https://api.notion.com — Notion OAuth token endpoint is blocked; update ADR-0008 §S3 D3 + _headers",
    ).toContain("https://api.notion.com");
    expect(
      cspLine,
      "connect-src does not include https://oauth2.googleapis.com — Google Calendar OAuth token endpoint is blocked; update ADR-0008 §S3 D3 + _headers",
    ).toContain("https://oauth2.googleapis.com");
    expect(
      cspLine,
      "connect-src does not include https://api.linear.app — Linear OAuth token endpoint is blocked; update ADR-0008 §S3 D3 + _headers",
    ).toContain("https://api.linear.app");
  });

  it("CSP4 (codex finding #3 row #8): connect-src does NOT include Stripe hostnames — pure redirect mode needs ZERO Stripe entries (gap-closure #8 Premium Stripe stub)", () => {
    // Original P5 _headers added 3 Stripe hostnames to connect-src. Codex
    // cross-vendor cold-read 2026-05-26 found that wrong: pure Payment Link
    // redirect mode only navigates the browser to `buy.stripe.com` (governed
    // by navigate-to / form-action / default-src, NOT connect-src). No
    // Stripe.js loaded, no fetch to api.stripe.com or any Stripe domain.
    // Fix: remove all 3 Stripe hostnames from connect-src. If v1.1 introduces
    // a real backend "verify subscription" fetch, that's a separate ADR-0008
    // amendment.
    const content = readFileSync(HEADERS_PATH, "utf-8");
    const cspLine = content
      .split("\n")
      .find((l) => l.includes("Content-Security-Policy:"));
    expect(
      cspLine,
      "_headers does not contain a Content-Security-Policy directive",
    ).toBeTruthy();
    expect(
      cspLine,
      "connect-src still contains https://js.stripe.com — redirect-only mode does NOT need Stripe.js endpoint; remove from _headers (codex finding #3 row #8)",
    ).not.toContain("https://js.stripe.com");
    expect(
      cspLine,
      "connect-src still contains https://checkout.stripe.com — redirect-only mode does NOT iframe Checkout; remove from _headers (codex finding #3 row #8)",
    ).not.toContain("https://checkout.stripe.com");
    expect(
      cspLine,
      "connect-src still contains https://buy.stripe.com — Payment Link navigation is governed by navigate-to/form-action, NOT connect-src; remove from _headers (codex finding #3 row #8)",
    ).not.toContain("https://buy.stripe.com");
  });

  it("CSP4-SCRIPT-SRC-CLEAN: script-src does NOT include any Stripe CDN URL (no Stripe.js bundle)", () => {
    const content = readFileSync(HEADERS_PATH, "utf-8");
    const cspLine = content
      .split("\n")
      .find((l) => l.includes("Content-Security-Policy:"));
    expect(
      cspLine,
      "_headers does not contain a Content-Security-Policy directive",
    ).toBeTruthy();
    // Extract script-src segment
    const scriptSrcMatch = cspLine?.match(/script-src[^;]*/);
    expect(
      scriptSrcMatch?.[0],
      "script-src must not contain js.stripe.com — Stripe.js MUST NOT be loaded from CDN in v1 stub",
    ).not.toContain("js.stripe.com");
  });

  it("CSP4-FRAME-SRC-CLEAN: frame-src is NOT present in the CSP (no embedded Checkout iframe)", () => {
    const content = readFileSync(HEADERS_PATH, "utf-8");
    const cspLine = content
      .split("\n")
      .find((l) => l.includes("Content-Security-Policy:"));
    expect(
      cspLine,
      "_headers does not contain a Content-Security-Policy directive",
    ).toBeTruthy();
    // frame-src must not be present at all — same-tab redirect requires no iframe
    expect(
      cspLine,
      "frame-src must NOT be present in the CSP — embedded Checkout iframe is not used in v1 stub; update ADR-0008 §S3 D3 reasoning if this changes",
    ).not.toContain("frame-src");
  });

  it("CSP5: connect-src includes https://generativelanguage.googleapis.com (Gemini via openai-compatible provider)", () => {
    // Gemini is reachable through the SHIPPED openai-compatible provider path
    // (base URL https://generativelanguage.googleapis.com/v1beta/openai/). The
    // adapter issues fetch/XHR (connect-src) to that host, so it must be
    // allowlisted or production (Cloudflare Pages enforces _headers) blocks it.
    const content = readFileSync(HEADERS_PATH, "utf-8");
    const cspLine = content
      .split("\n")
      .find((l) => l.includes("Content-Security-Policy:"));
    expect(
      cspLine,
      "_headers does not contain a Content-Security-Policy directive",
    ).toBeTruthy();
    expect(
      cspLine,
      "connect-src does not include https://generativelanguage.googleapis.com — Gemini (openai-compatible) requests are blocked; update ADR-0008 §S3 D3 + _headers",
    ).toContain("https://generativelanguage.googleapis.com");
  });

  it("CSP6: connect-src includes supported OpenAI-compatible and Sentry ingest hosts", () => {
    const content = readFileSync(HEADERS_PATH, "utf-8");
    const cspLine = content
      .split("\n")
      .find((l) => l.includes("Content-Security-Policy:"));
    expect(cspLine).toBeTruthy();
    expect(cspLine).toContain("https://api.openai.com");
    expect(cspLine).toContain("https://api.groq.com");
    expect(cspLine).toContain("https://*.ingest.sentry.io");
  });

  it("CSP7: connect-src includes Open-Meteo forecast and geocoding hosts", () => {
    const content = readFileSync(HEADERS_PATH, "utf-8");
    const cspLine = content
      .split("\n")
      .find((l) => l.includes("Content-Security-Policy:"));
    expect(cspLine).toBeTruthy();
    expect(cspLine).toContain("https://api.open-meteo.com");
    expect(cspLine).toContain("https://geocoding-api.open-meteo.com");
  });
});
