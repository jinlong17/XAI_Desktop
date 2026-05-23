/**
 * Tests for styles.css token parity with web design/layout.css:849-856.
 * AC-TOKENS-1, AC-TOKENS-2.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const stylesPath = resolve(__dirname, "../styles.css");
const css = readFileSync(stylesPath, "utf-8");

describe("styles.css event-color tokens", () => {
  it("AC-TOKENS-1: light-mode ev-mint rule has exact oklch values", () => {
    expect(css).toContain(
      ".cal-event.ev-mint   { background: oklch(94% 0.04 165); color: oklch(38% 0.10 165); border-left-color: oklch(58% 0.10 165); }",
    );
  });

  it("AC-TOKENS-1: light-mode ev-amber rule has exact oklch values", () => {
    expect(css).toContain(
      ".cal-event.ev-amber  { background: oklch(94% 0.04 70);  color: oklch(40% 0.10 60);  border-left-color: oklch(65% 0.13 70); }",
    );
  });

  it("AC-TOKENS-1: light-mode ev-blue rule has exact oklch values", () => {
    expect(css).toContain(
      ".cal-event.ev-blue   { background: oklch(94% 0.04 245); color: oklch(40% 0.10 245); border-left-color: oklch(60% 0.12 245); }",
    );
  });

  it("AC-TOKENS-1: light-mode ev-violet rule has exact oklch values", () => {
    expect(css).toContain(
      ".cal-event.ev-violet { background: oklch(94% 0.04 295); color: oklch(40% 0.10 295); border-left-color: oklch(60% 0.12 295); }",
    );
  });

  it("AC-TOKENS-2: dark-mode overrides match layout.css:853-856 byte-for-byte", () => {
    expect(css).toContain(
      `[data-theme="dark"] .cal-event.ev-mint   { background: oklch(28% 0.05 165); color: oklch(85% 0.08 165); }`,
    );
    expect(css).toContain(
      `[data-theme="dark"] .cal-event.ev-amber  { background: oklch(28% 0.05 60);  color: oklch(85% 0.08 60); }`,
    );
    expect(css).toContain(
      `[data-theme="dark"] .cal-event.ev-blue   { background: oklch(28% 0.05 245); color: oklch(85% 0.08 245); }`,
    );
    expect(css).toContain(
      `[data-theme="dark"] .cal-event.ev-violet { background: oklch(28% 0.05 295); color: oklch(85% 0.08 295); }`,
    );
  });

  it("no hex fallbacks anywhere in styles.css (tokens-only)", () => {
    // Should never see a raw #xxxxxx for the event chip colors. Token tokens.css
    // does use `#ffffff` for surfaces; we just verify event-chip rules use oklch.
    const evMatches = css.match(/\.cal-event\.ev-(mint|amber|blue|violet)[^}]*}/g) ?? [];
    for (const m of evMatches) {
      expect(m).not.toMatch(/#[0-9a-fA-F]{3,6}\b/);
    }
  });
});
