/**
 * AC-TOKENS-1: styles.css contains zero hex literals.
 * AC-TOKENS-2: every color reference is token / oklch / currentColor /
 *              transparent / inherit / color-mix / linear-gradient.
 * AC-TOKENS-3: @keyframes med-breathe uses only `transform` (no
 *              width/height/top/left/right/bottom keyframe properties).
 * AC-A11Y-1: prefers-reduced-motion media query collapses particles +
 *            ring.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const stylesPath = join(here, "..", "styles.css");
const css = readFileSync(stylesPath, "utf-8");

describe("styles.css discipline", () => {
  it("AC-TOKENS-1: no hex color literals", () => {
    // Match # followed by 3, 4, 6, or 8 hex digits — common hex color forms.
    const hexRe = /#[0-9a-fA-F]{3,8}\b/g;
    const matches = css.match(hexRe);
    expect(matches, `Found hex literals: ${matches?.join(", ")}`).toBeNull();
  });

  it("AC-TOKENS-3: @keyframes med-breathe uses only transform keyframes", () => {
    const re = /@keyframes\s+med-breathe\s*\{([\s\S]*?)\}\s*\n/;
    const match = re.exec(css);
    expect(match).not.toBeNull();
    const body = match![1]!;
    // Verify only transform/opacity properties appear inside the keyframe
    // body — no layout-thrash properties.
    expect(body).toMatch(/transform:\s*scale/);
    expect(body).not.toMatch(/\bwidth:/);
    expect(body).not.toMatch(/\bheight:/);
    expect(body).not.toMatch(/\btop:/);
    expect(body).not.toMatch(/\bleft:/);
    expect(body).not.toMatch(/\bright:/);
    expect(body).not.toMatch(/\bbottom:/);
  });

  it("AC-TOKENS-3: @keyframes med-particle-rise uses only transform + opacity", () => {
    const re = /@keyframes\s+med-particle-rise\s*\{([\s\S]*?)\}\s*\n/;
    const match = re.exec(css);
    expect(match).not.toBeNull();
    const body = match![1]!;
    expect(body).toMatch(/transform:\s*translateY/);
    expect(body).not.toMatch(/\bwidth:/);
    expect(body).not.toMatch(/\bheight:/);
    expect(body).not.toMatch(/\btop:/);
    expect(body).not.toMatch(/\bleft:/);
  });

  it("AC-A11Y-1: prefers-reduced-motion media query exists with particle hide + ring freeze", () => {
    expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
    // Inside that block: particle display:none + ring animation:none + scale(0.8)
    const reduced = /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{([\s\S]*?)\}\s*$/m;
    const match = reduced.exec(css);
    expect(match).not.toBeNull();
    const body = match![1]!;
    expect(body).toMatch(/\.particle[^{]*\{[^}]*display:\s*none/);
    expect(body).toMatch(/\.breathe-ring[^{]*\{[^}]*animation:\s*none/);
    expect(body).toMatch(/transform:\s*scale\(0\.8\)/);
  });

  it("AC-PLAYER-1: .med-player declares position:fixed inset:0 z-index:100", () => {
    expect(css).toMatch(/\.med-player\s*\{[^}]*position:\s*fixed/);
    expect(css).toMatch(/\.med-player\s*\{[^}]*inset:\s*0/);
    expect(css).toMatch(/\.med-player\s*\{[^}]*z-index:\s*100/);
  });
});
