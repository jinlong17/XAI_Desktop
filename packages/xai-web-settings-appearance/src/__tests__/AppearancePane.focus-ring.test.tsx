/**
 * F-APP-1 — guard for the Font scale slider's keyboard focus ring.
 *
 * plugin-web-tokens/src/layout.css sets `.slider-row input[type="range"]
 * { outline: none }` at (0,2,1). That outranks the global
 * `input:focus-visible` ring in tokens.css at (0,1,1), so the focused Font
 * scale slider showed no focus. styles.css appends a pane-scoped rule that
 * restores the same ring.
 *
 * jsdom computes no cascade and cannot judge :focus-visible or whether a ring
 * is visible; the native E15 run is that oracle. This file guards the rule
 * itself: it exists at the top level with the global ring's declarations, its
 * selector outranks every layout.css rule that sets the slider's outline, and
 * without :focus-visible it reaches exactly the Font scale slider in the
 * rendered pane. The tokens stylesheets are only read.
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppearancePane } from "../AppearancePane.js";

const here = dirname(fileURLToPath(import.meta.url));
const readCss = (relativePath: string): string =>
  readFileSync(resolve(here, relativePath), "utf-8");

const FOCUS_SELECTOR = '.appearance-pane .slider-row input[type="range"]:focus-visible';
const LAYOUT_SELECTOR = '.slider-row input[type="range"]';
const GLOBAL_RING_SELECTOR = "input:focus-visible";
const RING = {
  outline: "2px solid color-mix(in oklch, var(--accent) 58%, transparent)",
  "outline-offset": "2px",
};

interface CssRule {
  selectors: string[];
  declarations: Map<string, string>;
  /** Preludes of the enclosing at-rules, outermost first. */
  atRules: string[];
}

function parseDeclarations(body: string): Map<string, string> {
  const declarations = new Map<string, string>();
  for (const part of body.split(";")) {
    const colon = part.indexOf(":");
    if (colon === -1) continue;
    declarations.set(
      part.slice(0, colon).trim().toLowerCase(),
      part.slice(colon + 1).trim().replace(/\s+/g, " "),
    );
  }
  return declarations;
}

/** Style rules of a flat stylesheet (no nesting, no braces inside strings). */
function parseRules(cssText: string): CssRule[] {
  const css = cssText.replace(/\/\*[\s\S]*?\*\//g, "");
  const rules: CssRule[] = [];
  const open: string[] = [];
  let start = 0;
  for (let i = 0; i < css.length; i += 1) {
    const ch = css[i];
    if (ch === "{") {
      open.push(css.slice(start, i).trim());
      start = i + 1;
    } else if (ch === "}") {
      const prelude = open.pop();
      if (prelude === undefined) throw new Error("unbalanced '}' in stylesheet");
      if (!prelude.startsWith("@")) {
        rules.push({
          selectors: prelude.split(",").map((selector) => selector.trim().replace(/\s+/g, " ")),
          declarations: parseDeclarations(css.slice(start, i)),
          atRules: [...open],
        });
      }
      start = i + 1;
    } else if (ch === ";" && open.length === 0) {
      start = i + 1; // a top-level statement such as @import
    }
  }
  if (open.length !== 0) throw new Error("unbalanced '{' in stylesheet");
  return rules;
}

type Specificity = [ids: number, classes: number, types: number];

/**
 * Specificity of a selector without functional pseudo-classes. Those throw,
 * so a change to :where() / :is() / :not() fails loudly instead of miscounting.
 */
function specificity(selector: string): Specificity {
  if (/[(),]/.test(selector)) throw new Error(`unsupported selector: ${selector}`);
  let rest = selector;
  const take = (pattern: RegExp): number => {
    const count = rest.match(pattern)?.length ?? 0;
    rest = rest.replace(pattern, " ");
    return count;
  };
  const attributes = take(/\[[^\]]*\]/g);
  const ids = take(/#[\w-]+/g);
  const pseudoElements = take(/::[\w-]+/g);
  const classes = take(/\.[\w-]+/g);
  const pseudoClasses = take(/:[\w-]+/g);
  const types = take(/[a-z][\w-]*/gi);
  return [ids, classes + attributes + pseudoClasses, types + pseudoElements];
}

function compareSpecificity(a: Specificity, b: Specificity): number {
  return a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
}

const paneRules = parseRules(readCss("../styles.css"));
const layoutRules = parseRules(readCss("../../../plugin-web-tokens/src/layout.css"));
const tokenRules = parseRules(readCss("../../../plugin-web-tokens/src/tokens.css"));

describe("F-APP-1 Font scale slider focus ring", () => {
  it("styles.css has one top-level rule for the focused Font scale slider that declares only the ring", () => {
    const rules = paneRules.filter((rule) => rule.selectors.includes(FOCUS_SELECTOR));
    expect(rules).toHaveLength(1);
    expect(rules[0]?.selectors).toEqual([FOCUS_SELECTOR]);
    expect(rules[0]?.atRules).toEqual([]);
    expect(Object.fromEntries(rules[0]?.declarations ?? [])).toEqual(RING);
  });

  it("the ring equals the global input:focus-visible ring in tokens.css", () => {
    const globalRules = tokenRules.filter((rule) => rule.selectors.includes(GLOBAL_RING_SELECTOR));
    expect(globalRules).toHaveLength(1);
    expect(globalRules[0]?.atRules).toEqual([]);
    expect(globalRules[0]?.declarations.get("outline")).toBe(RING.outline);
    expect(globalRules[0]?.declarations.get("outline-offset")).toBe(RING["outline-offset"]);
  });

  it("its selector outranks every layout.css rule that sets the outline of the range input in .slider-row", () => {
    const targetsSlider = (selector: string): boolean =>
      /\.slider-row(?![\w-])/.test(selector) &&
      /input\[type=["']?range["']?\]/.test(selector) &&
      !selector.includes("::");
    const competitors = layoutRules.flatMap((rule) =>
      [...rule.declarations.keys()].some((property) => property.startsWith("outline"))
        ? rule.selectors.filter(targetsSlider).map((selector) => ({ selector, rule }))
        : [],
    );

    // The root cause: outline: none at (0,2,1), above the global ring's (0,1,1).
    // If tokens stops removing the outline, revisit the pane rule with that change.
    const rootCause = competitors.find(({ selector }) => selector === LAYOUT_SELECTOR);
    expect(rootCause?.rule.declarations.get("outline")).toBe("none");
    expect(specificity(LAYOUT_SELECTOR)).toEqual([0, 2, 1]);
    expect(specificity(GLOBAL_RING_SELECTOR)).toEqual([0, 1, 1]);

    const ours = specificity(FOCUS_SELECTOR);
    expect(ours).toEqual([0, 4, 1]);
    for (const { selector, rule } of competitors) {
      expect(compareSpecificity(ours, specificity(selector))).toBeGreaterThan(0);
      for (const [property, value] of rule.declarations) {
        if (property.startsWith("outline")) expect(value).not.toContain("!important");
      }
    }
  });

  it("without :focus-visible the selector reaches exactly the Font scale slider", () => {
    const { container } = render(<AppearancePane lang="en" />);
    expect(container.querySelectorAll('.appearance-pane input[type="range"]')).toHaveLength(2);
    const reached = container.querySelectorAll(FOCUS_SELECTOR.replace(/:focus-visible$/, ""));
    expect(reached).toHaveLength(1);
    expect(reached[0]).toHaveAttribute("aria-label", "Font scale");
  });
});
