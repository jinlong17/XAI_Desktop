/**
 * CSP1 — source-text guard for apps/web/public/_headers.
 *
 * Asserts that the deployed CSP `connect-src` directive includes
 * https://api.anthropic.com. This is the binding precedent for
 * wave 1+2+3 CSP rows per ADR-0008 §S3 D3 (amended 2026-05-25).
 *
 * If this test fails, the CSP was narrowed without updating this guard.
 *
 * Test strategy: packages/xai-web-ai-chat/docs/test.md §7.4 CSP1
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// From apps/web/src/__tests__/ → apps/web/public/_headers
const HEADERS_PATH = resolve(__dirname, "../../public/_headers");

describe("CSP source-text guard (CSP1)", () => {
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
});
