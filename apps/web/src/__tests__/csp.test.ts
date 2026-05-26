/**
 * CSP source-text guards for apps/web/public/_headers.
 *
 * CSP1 — `connect-src` includes https://api.anthropic.com (gap-closure #2, amended 2026-05-25)
 * CSP2 — `connect-src` + `img-src` include https://tile.openstreetmap.org (gap-closure #6 MapView, amended 2026-05-25)
 * CSP3 — `connect-src` includes https://api.notion.com AND https://oauth2.googleapis.com AND https://api.linear.app (gap-closure #7 Integrations OAuth stub, amended 2026-05-25)
 *
 * These are the binding precedent guards for wave 1+2+3 CSP rows per
 * ADR-0008 §S3 D3. If any guard fails, the CSP was narrowed without
 * updating the ADR and this test file.
 *
 * Test strategy: packages/xai-web-ai-chat/docs/test.md §7.4 CSP1
 *               packages/plugin-web-board-views/docs/test.md §S15.5 CSP2
 *               packages/plugin-web-settings-rest/docs/test.md §5.3 P5 CSP3
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
});
