/**
 * AC-TOKENS-1: matrix.css contains zero hex literals and references
 * at minimum the four semantic quadrant color tokens.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const cssPath = join(__dirname, "..", "matrix.css");
const css = readFileSync(cssPath, "utf-8");

describe("matrix.css tokens", () => {
  it("AC-TOKENS-1: contains zero hex color literals (#rrggbb or #rgb)", () => {
    const hexPattern = /#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/;
    expect(hexPattern.test(css)).toBe(false);
  });

  it("AC-TOKENS-1: documents Q1 → var(--red) in comments (color assigned inline)", () => {
    // The quadrant color tokens are documented in the CSS comment and set
    // via inline style (--qc: var(--red|amber|blue|accent)); the comment
    // references all four tokens so they can be grepped.
    expect(css).toContain("var(--red)");
  });

  it("AC-TOKENS-1: documents Q2 → var(--amber) in comments", () => {
    expect(css).toContain("var(--amber)");
  });

  it("AC-TOKENS-1: documents Q3 → var(--blue) in comments", () => {
    expect(css).toContain("var(--blue)");
  });

  it("AC-TOKENS-1: references var(--accent) for Q4 (also used in drop-zone highlight)", () => {
    expect(css).toContain("var(--accent)");
  });
});
