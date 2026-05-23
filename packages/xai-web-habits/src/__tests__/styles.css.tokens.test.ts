/**
 * AC-TOKENS-1: styles.css contains zero hex color literals.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const cssPath = join(__dirname, "..", "styles.css");
const css = readFileSync(cssPath, "utf-8");

describe("styles.css tokens", () => {
  it("AC-TOKENS-1: contains zero hex color literals (#rrggbb or #rgb)", () => {
    const hexPattern = /#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/;
    expect(hexPattern.test(css)).toBe(false);
  });

  it("AC-TOKENS-1: references var(--accent)", () => {
    expect(css).toContain("var(--accent)");
  });

  it("AC-TOKENS-1: references var(--blue)", () => {
    expect(css).toContain("var(--blue)");
  });

  it("AC-TOKENS-1: references var(--amber)", () => {
    expect(css).toContain("var(--amber)");
  });

  it("AC-TOKENS-1: references var(--red)", () => {
    expect(css).toContain("var(--red)");
  });

  it("AC-TOKENS-1: references var(--bg-panel)", () => {
    expect(css).toContain("var(--bg-panel)");
  });

  it("AC-TOKENS-1: references var(--text-1)", () => {
    expect(css).toContain("var(--text-1)");
  });
});
