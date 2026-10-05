/**
 * F-APP-2 — guard for the selected accent swatch's keyboard focus, and for the
 * batch 49 same-class audit of the Appearance pane and the Topbar status.
 *
 * `.accent-sw.active { outline: 2px solid var(--text-1); outline-offset: 2px }`
 * exists twice, in plugin-web-tokens/src/layout.css and in this package's
 * styles.css. At (0,2,0) it outranks the global `button:focus-visible` ring in
 * tokens.css at (0,1,1) and does not change with focus, so a focused selected
 * swatch looked exactly like an unfocused one. styles.css appends a pane-scoped
 * rule that draws the global ring 2px further out and keeps the selection ring,
 * in its colour and width, as a box-shadow inside it.
 *
 * jsdom computes no cascade and cannot judge :focus-visible or pixels; the
 * native E15 run is that oracle. This file guards the rules: the new rule
 * exists at the top level with exactly those declarations, its ring equals the
 * global ring, its box-shadow repeats the selection ring, its selector outranks
 * every rule that sets a swatch's outline or box-shadow, and it reaches exactly
 * the selected swatch. The audit guard renders the real pane (clean, after a
 * failed write, and with an unreadable stored value) with the Topbar status and
 * checks that the only outline rules reaching any of their controls at or above
 * the global ring's specificity are the two known roots (F-APP-1, F-APP-2),
 * each outranked on every control it reaches by a pane `:focus-visible` rule
 * that draws the global ring. The tokens and settings-shell stylesheets are
 * only read.
 */
import * as React from "react";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppearancePane } from "../AppearancePane.js";
import { AppearanceProvider, useAppearanceController } from "../internal/appearanceController.js";
import { AppearanceStatus } from "../internal/AppearanceStatus.js";
import { flushAppearance, installAppearanceLockFixture } from "./appearanceLockFixture.js";

const here = dirname(fileURLToPath(import.meta.url));
const readCss = (relativePath: string): string =>
  readFileSync(resolve(here, relativePath), "utf-8");

const FOCUS_SELECTOR = ".appearance-pane .accent-sw.active:focus-visible";
const SELECTION_SELECTOR = ".accent-sw.active";
const GLOBAL_RING_SELECTOR = "button:focus-visible";
const RING_OUTLINE = "2px solid color-mix(in oklch, var(--accent) 58%, transparent)";
const DECLARATIONS = {
  outline: RING_OUTLINE,
  "outline-offset": "4px",
  "box-shadow": "0 0 0 2px var(--text-1)",
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
      if (!prelude.startsWith("@") && !open.some((outer) => /^@(-webkit-)?keyframes/i.test(outer))) {
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

/** The selector with its user-action pseudo-classes removed: what it can reach in some interaction state. */
function anyInteractionState(selector: string): string {
  return selector
    .replace(/(^|[\s>+~])((?::(?:hover|focus-visible|focus-within|focus|active))+)/g, "$1*")
    .replace(/:(?:hover|focus-visible|focus-within|focus|active)(?![\w-])/g, "");
}

const SHEETS = {
  "plugin-web-tokens/src/tokens.css": parseRules(readCss("../../../plugin-web-tokens/src/tokens.css")),
  "plugin-web-tokens/src/layout.css": parseRules(readCss("../../../plugin-web-tokens/src/layout.css")),
  "plugin-web-settings-shell/src/styles.css": parseRules(readCss("../../../plugin-web-settings-shell/src/styles.css")),
  "xai-web-settings-appearance/src/styles.css": parseRules(readCss("../styles.css")),
} as const;
type SheetName = keyof typeof SHEETS;
const paneRules = SHEETS["xai-web-settings-appearance/src/styles.css"];

interface SelectorEntry { sheet: SheetName; selector: string; rule: CssRule }
const entries = (keep: (rule: CssRule) => boolean): SelectorEntry[] =>
  (Object.keys(SHEETS) as SheetName[]).flatMap((sheet) =>
    SHEETS[sheet].filter(keep).flatMap((rule) =>
      rule.selectors.filter((selector) => !selector.includes("::")).map((selector) => ({ sheet, selector, rule }))));
const setsOutline = (rule: CssRule): boolean => [...rule.declarations.keys()].some((property) => property.startsWith("outline"));
const setsOutlineOrShadow = (rule: CssRule): boolean =>
  setsOutline(rule) || rule.declarations.has("box-shadow");
const reaches = (element: Element, selector: string): boolean => element.matches(anyInteractionState(selector));
/** A pane-level focus ring: a :focus-visible rule that draws exactly the global ring. */
const isFocusRing = ({ selector, rule }: SelectorEntry): boolean =>
  selector.endsWith(":focus-visible") && rule.declarations.get("outline") === RING_OUTLINE;

beforeEach(() => {
  installAppearanceLockFixture();
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.removeAttribute("data-density");
  document.documentElement.removeAttribute("data-bg-tone");
  document.documentElement.removeAttribute("data-rail-pos");
  document.documentElement.style.cssText = "";
});

/** One controller with the pane and the Topbar status as its views, as App mounts them. */
function Host(): React.ReactElement {
  const controller = useAppearanceController();
  return (
    <AppearanceProvider controller={controller}>
      <div className="topbar-controls">
        <AppearanceStatus onReview={() => undefined} />
      </div>
      <AppearancePane lang="en" />
    </AppearanceProvider>
  );
}

const focusableControls = (root: HTMLElement): HTMLElement[] =>
  Array.from(root.querySelectorAll<HTMLElement>(".appearance-pane button, .appearance-pane input, button.appearance-status"));

/**
 * Same-class scan: outline rules that reach a control at or above the global
 * ring's specificity and are not themselves a pane focus ring. Each must be
 * outranked on that control by a pane focus ring that also reaches it.
 */
function maskingRules(root: HTMLElement): { masking: Set<string>; unrepaired: string[]; controls: number } {
  const globalSpecificity = specificity(GLOBAL_RING_SELECTOR);
  const outlineEntries = entries(setsOutline);
  const paneRings = outlineEntries.filter((entry) => entry.sheet === "xai-web-settings-appearance/src/styles.css" && isFocusRing(entry));
  const masking = new Set<string>();
  const unrepaired: string[] = [];
  const controls = focusableControls(root);
  for (const control of controls) {
    for (const entry of outlineEntries) {
      if (!reaches(control, entry.selector) || isFocusRing(entry)) continue;
      const own = specificity(entry.selector);
      if (compareSpecificity(own, globalSpecificity) < 0) continue;
      masking.add(`${entry.sheet} | ${entry.selector}`);
      const repaired = paneRings.some((ring) => reaches(control, ring.selector) && compareSpecificity(specificity(ring.selector), own) > 0);
      if (!repaired) unrepaired.push(`${entry.sheet} | ${entry.selector} on ${control.outerHTML.slice(0, 80)}`);
    }
  }
  return { masking, unrepaired, controls: controls.length };
}

const KNOWN_ROOTS = [
  "plugin-web-tokens/src/layout.css | .accent-sw.active",
  'plugin-web-tokens/src/layout.css | .slider-row input[type="range"]',
  "xai-web-settings-appearance/src/styles.css | .accent-sw.active",
];

describe("F-APP-2 selected accent swatch focus ring", () => {
  it("styles.css has one top-level rule for the focused selected swatch: the global ring further out, the selection ring as a box-shadow", () => {
    const rules = paneRules.filter((rule) => rule.selectors.includes(FOCUS_SELECTOR));
    expect(rules).toHaveLength(1);
    expect(rules[0]?.selectors).toEqual([FOCUS_SELECTOR]);
    expect(rules[0]?.atRules).toEqual([]);
    expect(Object.fromEntries(rules[0]?.declarations ?? [])).toEqual(DECLARATIONS);
  });

  it("its outline is the global button:focus-visible ring, and its box-shadow repeats the selection ring inside it", () => {
    const globalRules = SHEETS["plugin-web-tokens/src/tokens.css"].filter((rule) => rule.selectors.includes(GLOBAL_RING_SELECTOR));
    expect(globalRules).toHaveLength(1);
    expect(globalRules[0]?.atRules).toEqual([]);
    expect(globalRules[0]?.declarations.get("outline")).toBe(RING_OUTLINE);

    // The selection ring, in both copies: 2px solid var(--text-1) at offset 2px.
    const selection = entries((rule) => rule.selectors.includes(SELECTION_SELECTOR) && setsOutline(rule));
    expect(selection.map((entry) => entry.sheet).sort()).toEqual([
      "plugin-web-tokens/src/layout.css",
      "xai-web-settings-appearance/src/styles.css",
    ]);
    for (const { rule } of selection) {
      expect(rule.declarations.get("outline")).toBe("2px solid var(--text-1)");
      expect(rule.declarations.get("outline-offset")).toBe("2px");
    }

    // Selection stays perceivable: same colour and width, drawn as a box-shadow at the swatch edge.
    const [width, , colour] = "2px solid var(--text-1)".split(" ");
    expect(DECLARATIONS["box-shadow"]).toBe(`0 0 0 ${width} ${colour}`);
    // Focus differs from the unfocused selection: the ring moves from 2px to 4px out, and a
    // 2px gap separates it from the box-shadow ring (spread 2px < offset 4px).
    const offset = Number.parseFloat(DECLARATIONS["outline-offset"]);
    const spread = Number.parseFloat(width ?? "");
    expect(offset).toBeGreaterThan(2);
    expect(offset - spread).toBe(2);
  });

  it("its selector outranks every rule that sets a swatch's outline or box-shadow; none of those uses !important or sets a box-shadow", () => {
    const { container } = render(<AppearancePane lang="en" />);
    const swatches = Array.from(container.querySelectorAll(".appearance-pane .accent-sw"));
    expect(swatches).toHaveLength(6);
    const competitors = entries(setsOutlineOrShadow).filter((entry) =>
      entry.selector !== FOCUS_SELECTOR && swatches.some((swatch) => reaches(swatch, entry.selector)));
    expect(competitors.map(({ sheet, selector }) => `${sheet} | ${selector}`).sort()).toEqual([
      "plugin-web-tokens/src/layout.css | .accent-sw",
      "plugin-web-tokens/src/layout.css | .accent-sw.active",
      "plugin-web-tokens/src/tokens.css | button:focus-visible",
      "xai-web-settings-appearance/src/styles.css | .accent-sw",
      "xai-web-settings-appearance/src/styles.css | .accent-sw.active",
    ]);

    const ours = specificity(FOCUS_SELECTOR);
    expect(ours).toEqual([0, 4, 0]);
    expect(specificity(SELECTION_SELECTOR)).toEqual([0, 2, 0]);
    expect(specificity(GLOBAL_RING_SELECTOR)).toEqual([0, 1, 1]);
    for (const { selector, rule } of competitors) {
      expect(compareSpecificity(ours, specificity(selector))).toBeGreaterThan(0);
      for (const value of rule.declarations.values()) expect(value).not.toContain("!important");
      // No existing swatch box-shadow is replaced; if one is added, compose it into the F-APP-2 rule.
      expect(rule.declarations.has("box-shadow")).toBe(false);
    }
  });

  it("without :focus-visible the selector reaches exactly the selected swatch, whichever is selected", async () => {
    const { container } = render(<AppearancePane lang="en" />);
    await flushAppearance();
    const reached = () => Array.from(container.querySelectorAll(FOCUS_SELECTOR.replace(/:focus-visible$/, "")));
    expect(reached().map((element) => element.getAttribute("aria-label"))).toEqual(["Sage"]);
    fireEvent.click(screen.getByRole("button", { name: "Ocean" }));
    await flushAppearance();
    expect(reached().map((element) => element.getAttribute("aria-label"))).toEqual(["Ocean"]);
  });
});

describe("batch 49 same-class audit: pane controls and the Topbar status", () => {
  it("clean pane: the only outline rules at or above the global ring are the two known roots, each outranked by its pane fix", async () => {
    const { container } = render(<Host />);
    await flushAppearance();
    expect(screen.queryByTestId("appearance-status")).toBeNull();
    const { masking, unrepaired, controls } = maskingRules(container);
    // 2 language + 3 theme + 2 density + 6 swatches + hue + 6 tones + 4 rail + font scale + Retry all + Reset.
    expect(controls).toBe(27);
    expect(screen.getByTestId("appearance-retry-all").getAttribute("aria-disabled")).toBe("true");
    expect([...masking].sort()).toEqual(KNOWN_ROOTS);
    expect(unrepaired).toEqual([]);
  });

  it("after a failed write (recovery Retry/Discard, Retry all enabled, Export, Discard all, Topbar status) nothing else masks the ring", async () => {
    const nativeSet = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key: string, value: string) {
      if (this === localStorage && key === "xai_pref_theme") throw new DOMException("quota", "QuotaExceededError");
      return nativeSet.call(this, key, value);
    });
    const { container } = render(<Host />);
    await flushAppearance();
    const dark = screen.getAllByRole("button", { name: "Dark" }).find((element) => element.classList.contains("theme-card"));
    if (dark === undefined) throw new Error("no Dark theme card");
    fireEvent.click(dark);
    await flushAppearance();
    for (const name of ["Retry Theme", "Discard Theme"]) expect(screen.getByRole("button", { name })).toBeInTheDocument();
    expect(screen.getByTestId("appearance-retry-all").getAttribute("aria-disabled")).toBeNull();
    for (const id of ["appearance-export-draft", "appearance-discard-all", "appearance-status"]) expect(screen.getByTestId(id)).toBeInTheDocument();
    const { masking, unrepaired, controls } = maskingRules(container);
    expect(controls).toBe(32);
    expect([...masking].sort()).toEqual(KNOWN_ROOTS);
    expect(unrepaired).toEqual([]);
  });

  it("with an unreadable stored value (Reload only) nothing else masks the ring", async () => {
    localStorage.setItem("xai_rail_pos", "diagonal");
    const { container } = render(<Host />);
    await flushAppearance();
    expect(container.querySelector('[data-appearance-recovery="railPos"] button')?.textContent).toBe("Reload");
    const { masking, unrepaired, controls } = maskingRules(container);
    expect(controls).toBe(28);
    expect([...masking].sort()).toEqual(KNOWN_ROOTS);
    expect(unrepaired).toEqual([]);
  });
});
