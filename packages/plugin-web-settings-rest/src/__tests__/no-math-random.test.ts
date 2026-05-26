/**
 * TT-PKCE-NO-MATH-RANDOM — Source-text guard: zero Math.random occurrences
 * in OAuth-related internal modules (test.md §5.6)
 *
 * Also guards no localStorage. in oauthState.ts (test.md §5.7).
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const INTERNAL_DIR = resolve(__dirname, "../internal");

const OAUTH_MODULES = [
  "pkce.ts",
  "oauthState.ts",
  "buildAuthorizeUrl.ts",
  "integrationConnectButton.tsx",
  "integrationDisconnectButton.tsx",
  "integrationStubBanner.tsx",
];

/** Read file contents — returns "" if file doesn't exist yet. */
function readModule(name: string): string {
  try {
    return readFileSync(resolve(INTERNAL_DIR, name), "utf-8");
  } catch {
    return "";
  }
}

describe("TT-PKCE-NO-MATH-RANDOM: no Math.random in OAuth modules", () => {
  for (const moduleName of OAUTH_MODULES) {
    it(`${moduleName} contains zero occurrences of Math.random`, () => {
      const content = readModule(moduleName);
      // Remove comments before scanning
      const stripped = content
        .replace(/\/\/.*$/gm, "")
        .replace(/\/\*[\s\S]*?\*\//g, "");
      expect(
        stripped,
        `${moduleName} must not use Math.random — use crypto.getRandomValues instead (HC10)`,
      ).not.toContain("Math.random");
    });
  }
});

describe("No-localStorage guard for code_verifier", () => {
  it("oauthState.ts does NOT contain localStorage. (code_verifier must be in sessionStorage only)", () => {
    const content = readModule("oauthState.ts");
    // Remove comments
    const stripped = content
      .replace(/\/\/.*$/gm, "")
      .replace(/\/\*[\s\S]*?\*\//g, "");
    expect(
      stripped,
      "oauthState.ts must not use localStorage — code_verifier must live in sessionStorage only (HC10)",
    ).not.toContain("localStorage.");
  });
});
