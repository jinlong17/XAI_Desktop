/**
 * Sticky native VISUAL + KEYBOARD fixture: CP-STICKY-01 batch 15, parent-role visual/keyboard verification
 * (verification only; it repairs nothing and accepts nothing).
 *
 * Bundled by ./verify-visual.mjs from stdin with resolveDir = an immutable `git archive` of the fixed product
 * (and, for the as-is geometry comparison only, of the before product 2023526). Every product module imported
 * below comes from that archive; no product code is mocked. Composition = the batch-9 composition of
 * ./native-host.tsx (that file is neither imported nor changed):
 *   - the production Shell (AppRail + Topbar) inside WebShellProvider with the production
 *     webShellModuleRegistrations;
 *   - the production ComposedSettings (sidebar + DepartureCoordinator + settingsDeparture) under React Router's
 *     production createBrowserRouter, mounted with RouterProvider from "react-router/dom" as in
 *     apps/web/src/main.tsx, starting at /app/settings/sticky; synthetic account, no auth gate;
 *   - the real Sticky pane, usePrefAutosaveAsync hook, mutatePref engine, registry, codec and accountScope.
 * The language is the build-time constant __STICKY_VISUAL_LANG__ ("en" | "zh"), passed to WebShellProvider
 * and Shell the way the production App passes its `lang` state.
 *
 * Fixture-owned instruments only:
 *   - attempt-level Storage log: every getItem/setItem/removeItem attempt is recorded before any fault decision
 *     and before delegation; per-key setItem denial (DOMException SecurityError);
 *   - a capture-phase input/focus trace (keydown/keypress/keyup/click/change/input/focusin) with isTrusted;
 *   - read-only geometry, hit-test, overflow, scroll and focus probes;
 *   - one optional, removable tabindex on the pane description, used only as the Space-scroll positive control.
 * Fixture seeding and physical reads use the captured native Storage functions and are never counted.
 */
import * as React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter } from "react-router";
// The production entry (apps/web/src/main.tsx) mounts RouterProvider from "react-router/dom".
import { RouterProvider } from "react-router/dom";
import { accountScope, generationMarkerKey } from "./packages/plugin-web-storage/src/index";
import { WebShellProvider, Shell } from "./packages/xai-web-shell/src/index";
import { webShellModuleRegistrations } from "./apps/web/src/routes/modules/shellRegistrations";
import { composedSettingsRegistration } from "./apps/web/src/routes/modules/composedSettingsRegistration";
import "./packages/plugin-web-tokens/src/index";
import "./apps/web/src/styles/global.css";

declare const __STICKY_VISUAL_LANG__: string;
const LANG: "en" | "zh" = __STICKY_VISUAL_LANG__ === "zh" ? "zh" : "en";

type Field = "color" | "font" | "pin_default" | "restore_size" | "grid_spacing";
const FIELDS: readonly Field[] = ["color", "font", "pin_default", "restore_size", "grid_spacing"];
const keyOf = (field: Field): string => `xai_pref_sticky_${field}`;
const STICKY_KEYS = FIELDS.map(keyOf);
const COPY = {
  en: {
    labels: { color: "Default Color", font: "Font Size", pin_default: "Pin by Default", restore_size: "Restore Default Size", grid_spacing: "Default Grid Spacing" },
    retry: "Retry", discard: "Discard", reload: "Reload",
    exportDraft: "Export Sticky Note draft", discardAll: "Discard all changes",
    dialog: ["Stay", "Export current draft", "Discard local changes and leave"],
  },
  zh: {
    labels: { color: "默认颜色", font: "字体大小", pin_default: "默认置顶", restore_size: "恢复默认尺寸", grid_spacing: "默认网格间距" },
    retry: "重试", discard: "放弃", reload: "重新读取",
    exportDraft: "导出便签草稿", discardAll: "放弃全部更改",
    dialog: ["留下", "导出当前草稿", "放弃本地更改并离开"],
  },
}[LANG] as {
  labels: Record<Field, string>; retry: string; discard: string; reload: string;
  exportDraft: string; discardAll: string; dialog: string[];
};
const DIALOG_IDS = ["stay", "export", "discard-leave"];
const OWNER_A = "sticky-visual-A";
const GENERATION = "g1";

let sequence = 0;
const next = (): number => ++sequence;
const round = (value: number): number => Math.round(value * 100) / 100;

// ---------------------------------------------------------------------------------------------------
// Attempt-level Storage instrumentation (recorded BEFORE any fault decision or delegation)
// ---------------------------------------------------------------------------------------------------
type Attempt = { seq: number; op: string; area: string; key: string | null; value?: string; outcome: string };
const proto = Storage.prototype;
const native = { get: proto.getItem, set: proto.setItem, remove: proto.removeItem };
const realLocal = window.localStorage;
const attempts: Attempt[] = [];
const deniedSet = new Set<string>();
const areaOf = (area: unknown): string => (area === realLocal ? "local" : "other");
const logAttempt = (op: string, area: unknown, key: string | null, value?: string): Attempt => {
  const entry: Attempt = { seq: next(), op, area: areaOf(area), key, outcome: "ok" };
  if (value !== undefined) entry.value = value;
  attempts.push(entry);
  return entry;
};
proto.getItem = function getItem(this: Storage, key: string): string | null {
  logAttempt("get", this, String(key));
  return native.get.call(this, key);
};
proto.setItem = function setItem(this: Storage, key: string, value: string): void {
  const name = String(key);
  const entry = logAttempt("set", this, name, String(value));
  if (deniedSet.has(name)) {
    entry.outcome = "denied";
    throw new DOMException("fixture denied write", "SecurityError");
  }
  native.set.call(this, key, value);
};
proto.removeItem = function removeItem(this: Storage, key: string): void {
  logAttempt("remove", this, String(key));
  native.remove.call(this, key);
};
const physical = (): Record<Field, string | null> =>
  Object.fromEntries(FIELDS.map((field) => [field, native.get.call(realLocal, keyOf(field))])) as Record<Field, string | null>;

// ---------------------------------------------------------------------------------------------------
// Element descriptors (one vocabulary for traces, probes and the runner's expected lists)
// ---------------------------------------------------------------------------------------------------
const TARGET_SELECTOR = "button, select, input, textarea, a[href], [tabindex], [role=button], [role=switch]";
const tagClass = (element: Element): string =>
  element.tagName.toLowerCase() + [...element.classList].map((name) => `.${name}`).join("");
const fieldByLabel = (label: string | null): Field | null =>
  (FIELDS.find((field) => COPY.labels[field] === label) ?? null);
function describe(element: Element | null): string {
  if (!element) return "none";
  if (element === document.body) return "body";
  if (element === document.documentElement) return "html";
  const el = element as HTMLElement;
  if (el.classList.contains("settings-departure-dialog")) return "dialog";
  const dialog = el.closest(".settings-departure-dialog");
  if (dialog && el.tagName === "BUTTON") {
    const index = [...dialog.querySelectorAll("button")].indexOf(el as HTMLButtonElement);
    const text = (el.textContent ?? "").trim();
    return COPY.dialog[index] === text ? `dialog:${DIALOG_IDS[index]}` : `dialog-button:${text}`;
  }
  if (el.closest(".sticky-pane")) {
    if (el.hasAttribute("data-color-id")) return `color:${el.getAttribute("data-color-id")}`;
    if (el.hasAttribute("data-spacing-id")) return `spacing:${el.getAttribute("data-spacing-id")}`;
    if (el.tagName === "SELECT") return el.getAttribute("aria-label") === COPY.labels.font ? "font" : `select:${el.getAttribute("aria-label")}`;
    if (el.getAttribute("role") === "switch") {
      const field = fieldByLabel(el.getAttribute("aria-label"));
      return field ? `switch:${field}` : `switch-unknown:${el.getAttribute("aria-label")}`;
    }
    if (el.tagName === "BUTTON") {
      const name = (el.getAttribute("aria-label") ?? el.textContent ?? "").trim();
      if (el.closest(".sticky-recovery-field")) {
        for (const field of FIELDS) {
          if (name === `${COPY.retry} ${COPY.labels[field]}`) return `retry:${field}`;
          if (name === `${COPY.discard} ${COPY.labels[field]}`) return `discard:${field}`;
          if (name === `${COPY.reload} ${COPY.labels[field]}`) return `reload:${field}`;
        }
      }
      if (el.closest(".sticky-recovery-actions")) {
        if (name === COPY.exportDraft) return "export";
        if (name === COPY.discardAll) return "discard-all";
      }
      return `pane-button:${name}`;
    }
    return `pane-other:${tagClass(el)}`;
  }
  if (el.classList.contains("list-row") && el.closest(".settings-sidebar")) return `sidebar:${(el.textContent ?? "").trim()}`;
  if (el.closest(".app-rail")) return `rail:${el.getAttribute("aria-label") ?? (el.textContent ?? "").trim().slice(0, 24)}`;
  if (el.closest(".topbar")) return `topbar:${el.getAttribute("aria-label") ?? (el.textContent ?? "").trim().slice(0, 24)}`;
  return `other:${tagClass(el)}`;
}
const targetOf = (element: Element | null): Element | null => (element ? element.closest(TARGET_SELECTOR) ?? element : null);
const allTargets = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>(TARGET_SELECTOR)];
const find = (desc: string): HTMLElement | null => allTargets().find((element) => describe(element) === desc) ?? null;
const paneControlElements = (): HTMLElement[] =>
  [...document.querySelectorAll<HTMLElement>(".sticky-pane button, .sticky-pane select, .sticky-pane input, .sticky-pane textarea, .sticky-pane a[href], .sticky-pane [tabindex]")];

// ---------------------------------------------------------------------------------------------------
// Capture-phase input and focus trace (isTrusted recorded for every event)
// ---------------------------------------------------------------------------------------------------
type InputTrace = { seq: number; type: string; trusted: boolean; target: string; key?: string; value?: string; focusVisible?: boolean };
const events: InputTrace[] = [];
for (const type of ["keydown", "keypress", "keyup", "click", "change", "input", "focusin"]) {
  document.addEventListener(type, (event) => {
    const target = targetOf(event.target as Element | null);
    const entry: InputTrace = { seq: next(), type, trusted: event.isTrusted, target: describe(target) };
    if (event instanceof KeyboardEvent) entry.key = event.key;
    if (target instanceof HTMLSelectElement) entry.value = target.value;
    if (type === "focusin" && target instanceof HTMLElement) entry.focusVisible = target.matches(":focus-visible");
    events.push(entry);
  }, true);
}

// ---------------------------------------------------------------------------------------------------
// Geometry, hit-test, overflow, scroll and focus probes (read-only except scrollIntoView)
// ---------------------------------------------------------------------------------------------------
const EPS = 0.01;
const box = (rect: DOMRect) => ({
  left: round(rect.left), top: round(rect.top), right: round(rect.right), bottom: round(rect.bottom),
  width: round(rect.width), height: round(rect.height),
});
const ROUND_POINTS = [[0.5, 0.5], [0.3, 0.3], [0.7, 0.3], [0.3, 0.7], [0.7, 0.7]];
const BOX_POINTS = [[0.5, 0.5], [0.15, 0.25], [0.85, 0.25], [0.15, 0.75], [0.85, 0.75]];
function probe(desc: string, scroll = true) {
  const element = find(desc);
  if (!element) return { desc, found: false };
  if (scroll) element.scrollIntoView({ block: "center", inline: "nearest" });
  const rect = element.getBoundingClientRect();
  const detail = document.querySelector(".settings-detail")?.getBoundingClientRect() ?? null;
  const dialog = element.closest(".settings-departure-dialog")?.getBoundingClientRect() ?? null;
  const points = desc.startsWith("color:") || desc.startsWith("switch:") ? ROUND_POINTS : BOX_POINTS;
  const hits = points.map(([fx, fy]) => {
    const hit = document.elementFromPoint(rect.left + rect.width * fx!, rect.top + rect.height * fy!);
    return { fx, fy, ok: Boolean(hit && (hit === element || element.contains(hit))), hit: describe(targetOf(hit)) };
  });
  const style = getComputedStyle(element);
  const result: Record<string, unknown> = {
    desc, found: true, rect: box(rect),
    centerHit: hits[0]!.ok, allHit: hits.every((hit) => hit.ok), centerTarget: hits[0]!.hit,
    inViewport: rect.left >= -EPS && rect.top >= -EPS && rect.right <= innerWidth + EPS && rect.bottom <= innerHeight + EPS,
    inDetail: detail ? rect.left >= detail.left - EPS && rect.right <= detail.right + EPS : null,
    detailGap: detail ? { left: round(rect.left - detail.left), right: round(detail.right - rect.right) } : null,
    inDialog: dialog ? rect.left >= dialog.left - EPS && rect.right <= dialog.right + EPS && rect.top >= dialog.top - EPS && rect.bottom <= dialog.bottom + EPS : null,
    visible: style.visibility === "visible" && style.display !== "none" && Number(style.opacity) > 0,
    overflow: { sw: element.scrollWidth, cw: element.clientWidth, sh: element.scrollHeight, ch: element.clientHeight },
    tabIndex: element.tabIndex,
    disabled: (element as HTMLButtonElement).disabled === true,
  };
  if (!result.allHit) result.hits = hits;
  return result;
}
function chainOf(start: Element | null) {
  const chain: Array<{ name: string; overflowX: string; overflowY: string; scrollWidth: number; clientWidth: number; scrollHeight: number; clientHeight: number; scrollLeft: number; scrollTop: number }> = [];
  for (let node = start; node; node = node.parentElement) {
    const style = getComputedStyle(node);
    chain.push({
      name: tagClass(node), overflowX: style.overflowX, overflowY: style.overflowY,
      scrollWidth: node.scrollWidth, clientWidth: node.clientWidth, scrollHeight: node.scrollHeight, clientHeight: node.clientHeight,
      scrollLeft: round(node.scrollLeft), scrollTop: round(node.scrollTop),
    });
  }
  return chain;
}
function layout() {
  const root = document.documentElement;
  const detail = document.querySelector(".settings-detail") as HTMLElement | null;
  const pane = document.querySelector(".sticky-pane") as HTMLElement | null;
  const dialog = document.querySelector(".settings-departure-dialog") as HTMLElement | null;
  return {
    viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio },
    document: { scrollWidth: root.scrollWidth, clientWidth: root.clientWidth, bodyScrollWidth: document.body.scrollWidth, scrollX: round(scrollX), scrollY: round(scrollY) },
    detail: detail ? { rect: box(detail.getBoundingClientRect()), scrollWidth: detail.scrollWidth, clientWidth: detail.clientWidth, scrollLeft: round(detail.scrollLeft), padding: getComputedStyle(detail).padding } : null,
    pane: pane ? { rect: box(pane.getBoundingClientRect()), scrollWidth: pane.scrollWidth, clientWidth: pane.clientWidth } : null,
    dialog: dialog ? { rect: box(dialog.getBoundingClientRect()), scrollWidth: dialog.scrollWidth, clientWidth: dialog.clientWidth } : null,
    chain: chainOf(pane),
  };
}
/** Largest vertical overflow of any vertical scroll container around the pane (for full-pane captures). */
function verticalOverflow(): number {
  let most = Math.max(0, document.documentElement.scrollHeight - document.documentElement.clientHeight);
  for (const entry of chainOf(document.querySelector(".sticky-pane"))) {
    if (/(auto|scroll)/.test(entry.overflowY)) most = Math.max(most, entry.scrollHeight - entry.clientHeight);
  }
  return most;
}
function geometry() {
  const pane = document.querySelector(".sticky-pane");
  if (!pane) return null;
  const css = (element: Element, names: string[]) => {
    const style = getComputedStyle(element);
    return Object.fromEntries(names.map((name) => [name, style.getPropertyValue(name)]));
  };
  const swatches = [...pane.querySelectorAll("[data-color-id]")].map((element) => {
    const rect = element.getBoundingClientRect();
    return {
      id: element.getAttribute("data-color-id"), w: round(rect.width), h: round(rect.height),
      inlineStyle: element.getAttribute("style"), pressed: element.getAttribute("aria-pressed"),
      css: css(element, ["width", "height", "border-top-width", "border-radius", "padding-top", "background-color", "background-image"]),
    };
  });
  const cards = [...pane.querySelectorAll("[data-spacing-id]")].map((element) => {
    const rect = element.getBoundingClientRect();
    return {
      id: element.getAttribute("data-spacing-id"), w: round(rect.width), h: round(rect.height), pressed: element.getAttribute("aria-pressed"),
      label: (element.textContent ?? "").trim(),
      css: css(element, ["min-width", "padding-top", "padding-right", "padding-bottom", "padding-left", "border-top-width", "border-radius"]),
    };
  });
  const select = pane.querySelector("select");
  const toggles = [...pane.querySelectorAll('[role="switch"]')].map((element) => {
    const rect = element.getBoundingClientRect();
    const knob = element.querySelector(".toggle-knob");
    const knobRect = knob?.getBoundingClientRect() ?? null;
    const row = element.closest(".setting-row");
    const rowBox = row?.getBoundingClientRect() ?? null;
    const rowStyle = row ? getComputedStyle(row) : null;
    const px = (value: string | undefined): number => Number.parseFloat(value ?? "0") || 0;
    // Alignment is measured against the row's CONTENT box, so a row border that appears or disappears with a
    // following sibling (`.setting-row:last-child`) does not count as a switch alignment change; it is recorded.
    const rowRect = rowBox && rowStyle ? {
      left: rowBox.left + px(rowStyle.borderLeftWidth) + px(rowStyle.paddingLeft),
      right: rowBox.right - px(rowStyle.borderRightWidth) - px(rowStyle.paddingRight),
      top: rowBox.top + px(rowStyle.borderTopWidth) + px(rowStyle.paddingTop),
      bottom: rowBox.bottom - px(rowStyle.borderBottomWidth) - px(rowStyle.paddingBottom),
      height: rowBox.height - px(rowStyle.borderTopWidth) - px(rowStyle.paddingTop) - px(rowStyle.borderBottomWidth) - px(rowStyle.paddingBottom),
    } : null;
    return {
      field: fieldByLabel(element.getAttribute("aria-label")), checked: element.getAttribute("aria-checked"), className: element.className,
      w: round(rect.width), h: round(rect.height),
      knob: knobRect ? {
        w: round(knobRect.width), h: round(knobRect.height),
        dx: round(knobRect.left - rect.left), dy: round(knobRect.top - rect.top),
        dxRight: round(rect.right - knobRect.right), dyBottom: round(rect.bottom - knobRect.bottom),
        transform: getComputedStyle(knob!).transform, animations: knob!.getAnimations().length,
      } : null,
      inRow: rowRect ? { left: round(rect.left - rowRect.left), right: round(rowRect.right - rect.right), top: round(rect.top - rowRect.top), bottom: round(rowRect.bottom - rect.bottom), centerDy: round((rect.top + rect.height / 2) - (rowRect.top + rowRect.height / 2)) } : null,
      row: rowBox && rowStyle ? { height: round(rowBox.height), borderBottom: rowStyle.borderBottomWidth, lastChild: row!.parentElement?.lastElementChild === row } : null,
      css: css(element, ["width", "height", "min-height", "border-radius", "background-color"]),
    };
  });
  const colorVars = Object.fromEntries(["sun", "peach", "coral", "sky", "indigo", "lilac", "mint", "white", "silver", "graphite", "navy", "midnight"]
    .map((id) => [id, getComputedStyle(pane).getPropertyValue(`--sticky-note-color-${id}`).trim()]));
  return {
    swatches, cards, toggles, colorVars,
    select: select ? { w: round(select.getBoundingClientRect().width), h: round(select.getBoundingClientRect().height), value: select.value } : null,
    spacingOrder: cards.map((card) => card.id), colorOrder: swatches.map((swatch) => swatch.id),
  };
}
/** Pairwise overlap (area > 0.5 px²) between sibling parts that must never collide. */
function overlapReport() {
  const area = (a: DOMRect, b: DOMRect): number =>
    Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  const groups: Array<{ name: string; parts: Element[] }> = [];
  const pane = document.querySelector(".sticky-pane");
  if (pane) {
    groups.push({ name: "pane-children", parts: [...pane.children] });
    pane.querySelectorAll(".setting-block").forEach((block, index) => groups.push({ name: `section-children#${index}`, parts: [...block.children] }));
    groups.push({ name: "swatches", parts: [...pane.querySelectorAll("[data-color-id]")] });
    groups.push({ name: "cards", parts: [...pane.querySelectorAll("[data-spacing-id]")] });
    pane.querySelectorAll(".setting-row").forEach((row, index) => groups.push({ name: `setting-row#${index}`, parts: [...row.children] }));
    pane.querySelectorAll(".sticky-recovery-field").forEach((block, index) =>
      groups.push({ name: `recovery#${index}`, parts: [block.querySelector(".sticky-recovery-text")!, ...block.querySelectorAll("button")].filter(Boolean) }));
    const actions = pane.querySelector(".sticky-recovery-actions");
    if (actions) groups.push({ name: "actions", parts: [...actions.children] });
  }
  const dialog = document.querySelector(".settings-departure-dialog");
  if (dialog) groups.push({ name: "dialog", parts: [...dialog.children] });
  return groups.map((group) => {
    const overlaps: Array<{ a: string; b: string; area: number }> = [];
    const rects = group.parts.map((part) => part.getBoundingClientRect());
    for (let i = 0; i < rects.length; i += 1) {
      for (let j = i + 1; j < rects.length; j += 1) {
        const shared = area(rects[i]!, rects[j]!);
        if (shared > 0.5) overlaps.push({ a: describe(targetOf(group.parts[i]!)), b: describe(targetOf(group.parts[j]!)), area: round(shared) });
      }
    }
    return { name: group.name, parts: group.parts.length, overlaps };
  });
}
/** Text boxes that must not clip: recovery messages, the export error and the dialog message. */
function textClip() {
  return [...document.querySelectorAll(".sticky-pane .sticky-recovery-text > span, .sticky-pane .sticky-recovery-actions p, .sticky-pane .sticky-recovery-saved, .settings-departure-dialog p")]
    .map((element) => ({ text: (element.textContent ?? "").trim().slice(0, 60), sw: element.scrollWidth, cw: element.clientWidth, sh: element.scrollHeight, ch: element.clientHeight }));
}
function scrollState() {
  return {
    x: round(scrollX), y: round(scrollY),
    chain: chainOf(document.querySelector(".sticky-pane")).map((entry) => ({ name: entry.name, top: entry.scrollTop, left: entry.scrollLeft })),
  };
}
function focusInfo() {
  const element = document.activeElement as HTMLElement | null;
  if (!element || element === document.body) return { desc: describe(element) };
  const style = getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
  return {
    desc: describe(element), focusVisible: element.matches(":focus-visible"),
    outline: { style: style.outlineStyle, width: style.outlineWidth, color: style.outlineColor, offset: style.outlineOffset },
    rect: box(rect),
    inViewport: rect.left >= -EPS && rect.top >= -EPS && rect.right <= innerWidth + EPS && rect.bottom <= innerHeight + EPS,
    centerHit: Boolean(hit && (hit === element || element.contains(hit))),
    inPane: Boolean(element.closest(".sticky-pane")), inDialog: Boolean(element.closest(".settings-departure-dialog")),
  };
}

// ---------------------------------------------------------------------------------------------------
// Synthetic account (device keys must not care) and the actual composition
// ---------------------------------------------------------------------------------------------------
native.set.call(realLocal, generationMarkerKey(OWNER_A), JSON.stringify({ generation: GENERATION, migrationId: "sticky-visual", previous: null }));
accountScope.activate(accountScope.lock(OWNER_A), GENERATION);

if (!location.pathname.startsWith("/app/")) history.replaceState(null, "", "/app/settings/sticky");
const Composed = composedSettingsRegistration.children[0]!.render;
function Destination(): React.ReactElement {
  return <div className="native-destination">Destination outside Settings</div>;
}
const router = createBrowserRouter([
  {
    path: "/app",
    element: <Shell lang={LANG} setLang={() => {}} theme="light" setTheme={() => {}} density="comfortable" setDensity={() => {}} />,
    children: [
      { path: "settings/*", element: <Composed /> },
      { path: ":moduleId/*", element: <Destination /> },
    ],
  },
]);

const text = (element: Element | null | undefined): string => (element?.textContent ?? "").trim();
const app = createRoot(document.getElementById("app")!);
let scrollProbe: HTMLElement | null = null;

const verify = {
  instance: crypto.randomUUID(),
  lang: LANG,
  fields: FIELDS,
  keys: STICKY_KEYS,
  router,
  mark: () => sequence,
  physical,
  seedRaw: (field: Field, raw: string | null) => {
    if (raw === null) native.remove.call(realLocal, keyOf(field));
    else native.set.call(realLocal, keyOf(field), raw);
    return native.get.call(realLocal, keyOf(field));
  },
  clearSticky: () => { for (const key of STICKY_KEYS) native.remove.call(realLocal, key); return physical(); },
  denySet: (target: "sticky" | Field[]) => {
    for (const key of target === "sticky" ? STICKY_KEYS : target.map(keyOf)) deniedSet.add(key);
    return [...deniedSet];
  },
  restore: () => { deniedSet.clear(); return [...deniedSet]; },
  /** Positive control for the Storage injector: one patched getItem through the page's real localStorage. */
  probeStorage: () => {
    const before = attempts.length;
    window.localStorage.getItem(keyOf("color"));
    return { logged: attempts.length - before, last: attempts.at(-1) ?? null };
  },
  attemptsAfter: (mark: number) => attempts.filter((entry) => entry.seq > mark),
  eventsAfter: (mark: number) => events.filter((entry) => entry.seq > mark),
  displayed: () => {
    const pane = document.querySelector(".sticky-pane");
    if (!pane) return null;
    return {
      color: [...pane.querySelectorAll("[data-color-id]")].filter((element) => element.getAttribute("aria-pressed") === "true").map((element) => element.getAttribute("data-color-id")),
      font: (pane.querySelector("select") as HTMLSelectElement | null)?.value ?? null,
      pin_default: find("switch:pin_default")?.getAttribute("aria-checked") ?? null,
      restore_size: find("switch:restore_size")?.getAttribute("aria-checked") ?? null,
      grid_spacing: [...pane.querySelectorAll("[data-spacing-id]")].filter((element) => element.getAttribute("aria-pressed") === "true").map((element) => element.getAttribute("data-spacing-id")),
    };
  },
  /** Controls whose ARIA state disagrees with their visual state (.active swatch/card, .on switch). */
  ariaVisualMismatches: () => {
    const pane = document.querySelector(".sticky-pane");
    if (!pane) return ["no-pane"];
    const mismatches: string[] = [];
    pane.querySelectorAll("[data-color-id], [data-spacing-id]").forEach((element) => {
      if ((element.getAttribute("aria-pressed") === "true") !== element.classList.contains("active")) mismatches.push(describe(element));
    });
    pane.querySelectorAll('[role="switch"]').forEach((element) => {
      if ((element.getAttribute("aria-checked") === "true") !== element.classList.contains("on")) mismatches.push(describe(element));
    });
    return mismatches;
  },
  recovery: () => [...document.querySelectorAll(".sticky-pane .sticky-recovery-field")].map((element) => ({
    text: text(element.querySelector(".sticky-recovery-text")),
    buttons: [...element.querySelectorAll("button")].map((button) => (button.getAttribute("aria-label") ?? text(button)).trim()),
    visibleButtons: [...element.querySelectorAll("button")].map((button) => text(button)),
  })),
  paneActions: () => {
    const actions = document.querySelector(".sticky-pane .sticky-recovery-actions");
    return actions ? { buttons: [...actions.querySelectorAll("button")].map(text), alert: actions.querySelector('[role="alert"]') ? text(actions.querySelector('[role="alert"]')) : null } : null;
  },
  saved: () => (document.querySelector(".sticky-pane .sticky-recovery-saved") ? text(document.querySelector(".sticky-pane .sticky-recovery-saved")) : null),
  dialog: () => {
    const dialog = document.querySelector('.settings-departure-dialog[role="dialog"]');
    return dialog ? { label: dialog.getAttribute("aria-label"), text: text(dialog.querySelector("p")), buttons: [...dialog.querySelectorAll("button")].map(text) } : null;
  },
  paneId: () => document.querySelector(".settings-detail")?.getAttribute("data-pane") ?? null,
  location: () => ({ pathname: router.state.location.pathname, key: router.state.location.key, state: router.state.location.state ?? null }),
  navigate: (path: string) => { void router.navigate(path); return true; },
  paneControls: () => paneControlElements().map((element) => ({ desc: describe(element), tabIndex: element.tabIndex, disabled: (element as HTMLButtonElement).disabled === true })),
  sidebarRows: () => [...document.querySelectorAll(".settings-sidebar .list-row")].map((row) => describe(row)),
  probe,
  probeAll: (descs: string[]) => descs.map((desc) => probe(desc)),
  layout,
  verticalOverflow,
  overlapReport,
  textClip,
  geometry,
  scrollState,
  focusInfo,
  activeDesc: () => describe(document.activeElement),
  /** Programmatic focus: used only to place the typeahead target during visual-state setup. */
  focusTarget: (desc: string) => {
    const element = find(desc);
    if (!element) return false;
    element.scrollIntoView({ block: "center", inline: "nearest" });
    element.focus();
    return document.activeElement === element;
  },
  blurActive: () => { (document.activeElement as HTMLElement | null)?.blur?.(); return describe(document.activeElement); },
  /** Waits for fonts, two frames and no running animations (bounded). */
  settle: async () => {
    await document.fonts.ready;
    let frames = 0;
    for (; frames < 90; frames += 1) {
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      if (document.getAnimations().filter((animation) => animation.playState === "running").length === 0) break;
    }
    return { frames, running: document.getAnimations().filter((animation) => animation.playState === "running").length, fonts: document.fonts.status };
  },
  /** Space-scroll positive control: a removable tabindex on the pane description (fixture-owned, temporary). */
  armScrollProbe: () => {
    scrollProbe = document.querySelector(".sticky-pane .pane-sub");
    if (!scrollProbe) return null;
    scrollProbe.setAttribute("tabindex", "-1");
    scrollProbe.setAttribute("data-visual-scroll-probe", "1");
    scrollProbe.focus();
    return document.activeElement === scrollProbe;
  },
  disarmScrollProbe: () => {
    if (!scrollProbe) return false;
    scrollProbe.blur();
    scrollProbe.removeAttribute("tabindex");
    scrollProbe.removeAttribute("data-visual-scroll-probe");
    scrollProbe = null;
    return document.querySelectorAll("[data-visual-scroll-probe]").length === 0;
  },
  /** Restores every scroll container around the pane to a recorded state. */
  restoreScroll: (state: { chain: Array<{ top: number; left: number }> }) => {
    let node: Element | null = document.querySelector(".sticky-pane");
    for (const entry of state.chain) {
      if (!node) break;
      node.scrollTop = entry.top;
      node.scrollLeft = entry.left;
      node = node.parentElement;
    }
    return scrollState();
  },
};
(window as unknown as { verify: typeof verify }).verify = verify;

app.render(
  <WebShellProvider modules={webShellModuleRegistrations} lang={LANG} railPos="left" petOn={false} setPetOn={() => {}}>
    <RouterProvider router={router} />
  </WebShellProvider>,
);
