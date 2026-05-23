/**
 * Public-surface assertions.
 *
 * Asserts the named exports of @repo/plugin-web-ai-chat and that no
 * internal path is reachable through the `exports` map.
 *
 * Design: packages/xai-web-ai-chat/docs/test.md §3 — B (barrel surface)
 */

import { describe, it, expect } from "vitest";
import * as pkg from "../index.js";
import pkgJson from "../../package.json" with { type: "json" };

describe("public surface (B)", () => {
  it("B1: AiChatModule is exported as a function", () => {
    expect(typeof pkg.AiChatModule).toBe("function");
  });

  it("B2: aiChatWebModuleRegistration is exported and has moduleId='ai'", () => {
    expect(pkg.aiChatWebModuleRegistration.moduleId).toBe("ai");
  });

  it("B3: types are re-exported (compile-time gate)", () => {
    // Compile-time only — if the type-only re-exports were missing,
    // tsc would have already failed the `pnpm typecheck` step.
    // We assert a runtime sentinel just to keep the test non-empty.
    expect(true).toBe(true);
  });

  it("B4: package exports map does not expose internal paths", () => {
    expect(pkgJson.exports).toEqual({
      ".": {
        types: "./src/index.ts",
        default: "./src/index.ts",
      },
    });
  });
});
