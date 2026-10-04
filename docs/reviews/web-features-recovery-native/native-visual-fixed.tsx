/**
 * Features native VISUAL + KEYBOARD fixture: CP-FEATURES-01 batch 29, contract §9 "Responsive presentation" and
 * "Keyboard" (§14 E14, E15). Parent-role visual and keyboard verifier; verification only. It repairs nothing,
 * accepts nothing and changes no product file. No earlier fixture in this directory is imported or modified;
 * the composition below follows ./native-fixed.tsx (production App), the probes follow
 * ../web-sticky-recovery-native/native-visual.tsx (the accepted Sticky E14/E15 equivalent).
 *
 * Bundled by ./verify-visual-fixed.mjs from stdin with resolveDir = an immutable `git archive` of the fixed product
 * (and, for the geometry comparison only, of the before product f359be6). Every product module imported below comes
 * from that archive (pinned, guarded). Composition = apps/web/src/main.tsx, the production App composition:
 *   - module (and stylesheet) order of main.tsx: AppProviders, the router module, @repo/plugin-web-tokens,
 *     apps/web/src/styles/global.css;
 *   - the production router instance under RouterProvider from "react-router/dom": /app/settings/features renders
 *     ProtectedAppRouteElement -> App (AccountStorageGate -> AccountDataGate -> WebShellProvider + Shell with AppRail
 *     and Topbar, DesktopPet, CommandPalette) -> ComposedSettings (sidebar, DepartureCoordinator, settingsDeparture)
 *     -> the real Features pane, its hook, engine, registry and codec;
 *   - the production WebAuthSessionProvider with onIdentityChange = the production invalidateAccountIdentity.
 * The ONLY synthetic input is the auth session (a client whose auth.getSession resolves one session for a synthetic
 * account), as in ./native-fixed.tsx. The language is the user's stored `xai_pref_lang`, seeded by the runner on a
 * product-free seed page; the build-time constant __FEATURES_VISUAL_LANG__ only selects the expected wording below.
 *
 * Fixture-owned instruments (installed in this module's body, i.e. after module evaluation and before render):
 *   - attempt-level Storage log: every getItem/setItem/removeItem attempt is recorded before any fault decision and
 *     before delegation; per-key setItem and removeItem denial (DOMException SecurityError, never reaches storage);
 *   - a window.confirm recorder (the dialog itself stays native and is answered by the runner through CDP);
 *   - a capture-phase input/focus trace (keydown/keypress/keyup/click/focusin) with isTrusted;
 *   - read-only geometry, hit-test, overflow, overlap, text-clip, scroll and focus probes (scrollIntoView only);
 *   - one optional, removable tabindex on the pane intro, used only as the Space-scroll positive control.
 * Physical reads and seeds use the captured native Storage functions and are never counted.
 */
import "./apps/web/src/providers/AppProviders";
import { router } from "./apps/web/src/routes/router";
import "@repo/plugin-web-tokens";
import "./apps/web/src/styles/global.css";
import * as React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router/dom";
import { WebAuthSessionProvider } from "@repo/web-auth-device-session/web";
import { invalidateAccountIdentity } from "./apps/web/src/providers/AccountStorageGate";
import { accountScope, generationMarkerKey } from "@repo/plugin-web-storage";
import { featureIdOrder, featurePrefKey } from "@repo/plugin-web-settings-features-panel";
import { I18N } from "@repo/plugin-web-tokens";

declare const __FEATURES_VISUAL_LANG__: string;
const LANG: "en" | "zh" = __FEATURES_VISUAL_LANG__ === "zh" ? "zh" : "en";

type Id = "tasks" | "board" | "dashboard" | "calendar" | "matrix" | "pomodoro" | "habits" | "meditation";
const IDS = [...featureIdOrder] as Id[];
const keyOf = (id: Id): string => featurePrefKey(id);
const FEATURE_KEYS = IDS.map(keyOf);
const NAV = I18N[LANG].nav as unknown as Record<string, string>;
const LABELS = Object.fromEntries(IDS.map((id) => [id, NAV[id]])) as Record<Id, string>;
const COPY = {
  en: {
    retry: "Retry", discard: "Discard", reload: "Reload",
    exportDraft: "Export Features draft", discardAll: "Discard all changes", reset: "Reset to defaults",
    dialog: ["Stay", "Export current draft", "Discard local changes and leave"],
  },
  zh: {
    retry: "重试", discard: "放弃", reload: "重新读取",
    exportDraft: "导出功能草稿", discardAll: "放弃全部更改", reset: "恢复默认",
    dialog: ["留下", "导出当前草稿", "放弃本地更改并离开"],
  },
}[LANG];
const DIALOG_IDS = ["stay", "export", "discard-leave"];
const OWNER = "features-visual-A";

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
const deniedRemove = new Set<string>();
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
  if (this === realLocal && deniedSet.has(name)) {
    entry.outcome = "denied";
    throw new DOMException("fixture denied write", "SecurityError");
  }
  native.set.call(this, key, value);
};
proto.removeItem = function removeItem(this: Storage, key: string): void {
  const name = String(key);
  const entry = logAttempt("remove", this, name);
  if (this === realLocal && deniedRemove.has(name)) {
    entry.outcome = "denied";
    throw new DOMException("fixture denied remove", "SecurityError");
  }
  native.remove.call(this, key);
};
const physical = (): Record<Id, string | null> =>
  Object.fromEntries(IDS.map((id) => [id, native.get.call(realLocal, keyOf(id))])) as Record<Id, string | null>;

// window.confirm recorder: the native dialog stays in place (the runner answers it through CDP).
type ConfirmEntry = { seq: number; message: string; result: boolean | null; returnSeq: number | null };
const confirms: ConfirmEntry[] = [];
const nativeConfirm = window.confirm;
window.confirm = function confirm(message?: string): boolean {
  const entry: ConfirmEntry = { seq: next(), message: String(message), result: null, returnSeq: null };
  confirms.push(entry);
  const result = nativeConfirm.call(window, message);
  entry.result = result;
  entry.returnSeq = next();
  return result;
};

// ---------------------------------------------------------------------------------------------------
// Element descriptors (one vocabulary for traces, probes and the runner's expected lists)
// ---------------------------------------------------------------------------------------------------
const TARGET_SELECTOR = "button, select, input, textarea, a[href], [tabindex], [role=button], [role=switch]";
const tagClass = (element: Element): string =>
  element.tagName.toLowerCase() + [...element.classList].map((name) => `.${name}`).join("");
const text = (element: Element | null | undefined): string => (element?.textContent ?? "").replace(/\s+/g, " ").trim();
function describe(element: Element | null): string {
  if (!element) return "none";
  if (element === document.body) return "body";
  if (element === document.documentElement) return "html";
  const el = element as HTMLElement;
  if (el.classList.contains("settings-departure-dialog")) return "dialog";
  const dialog = el.closest(".settings-departure-dialog");
  if (dialog) {
    if (el.tagName === "BUTTON") {
      const index = [...dialog.querySelectorAll("button")].indexOf(el as HTMLButtonElement);
      return COPY.dialog[index] === text(el) ? `dialog:${DIALOG_IDS[index]}` : `dialog-button:${text(el)}`;
    }
    return `dialog-part:${tagClass(el)}`;
  }
  if (el.closest(".pet-wrap")) return `pet:${tagClass(el)}`;
  if (el.closest(".features-pane")) {
    const card = el.closest("[data-feature-id]");
    const cardId = card?.getAttribute("data-feature-id") ?? null;
    if (el.getAttribute("role") === "switch") return cardId ? `switch:${cardId}` : `switch-unknown:${el.getAttribute("aria-label")}`;
    if (el.tagName === "BUTTON") {
      const name = (el.getAttribute("aria-label") ?? text(el)).trim();
      if (el.closest(".features-recovery-field")) {
        for (const id of IDS) {
          if (name === `${COPY.retry} ${LABELS[id]}`) return `retry:${id}`;
          if (name === `${COPY.discard} ${LABELS[id]}`) return `discard:${id}`;
          if (name === `${COPY.reload} ${LABELS[id]}`) return `reload:${id}`;
        }
      }
      if (el.closest(".features-recovery-actions")) {
        if (name === COPY.exportDraft) return "export";
        if (name === COPY.discardAll) return "discard-all";
      }
      if (el.getAttribute("data-testid") === "features-reset-defaults") return name === COPY.reset ? "reset" : `reset-unexpected-name:${name}`;
      // The before product's shared SettingsFooter (f359be6 only).
      if (el.closest(".pane-footer")) return el.getAttribute("data-testid") === "settings-footer-reset" ? "footer:reset" : "footer:save";
      return `pane-button:${name}`;
    }
    return `pane-other:${tagClass(el)}${cardId ? `@${cardId}` : ""}`;
  }
  if (el.classList.contains("list-row") && el.closest(".settings-sidebar")) return `sidebar:${text(el)}`;
  if (el.closest(".app-rail")) return `rail:${el.getAttribute("aria-label") ?? text(el).slice(0, 24)}`;
  if (el.closest(".topbar")) return `topbar:${el.getAttribute("aria-label") ?? text(el).slice(0, 24)}`;
  return `other:${tagClass(el)}`;
}
const targetOf = (element: Element | null): Element | null => (element ? element.closest(TARGET_SELECTOR) ?? element : null);
const allTargets = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>(TARGET_SELECTOR)];
const find = (desc: string): HTMLElement | null => allTargets().find((element) => describe(element) === desc) ?? null;
const paneControlElements = (): HTMLElement[] =>
  [...document.querySelectorAll<HTMLElement>(".features-pane button, .features-pane select, .features-pane input, .features-pane textarea, .features-pane a[href], .features-pane [tabindex]")];

// ---------------------------------------------------------------------------------------------------
// Capture-phase input and focus trace (isTrusted recorded for every event)
// ---------------------------------------------------------------------------------------------------
type InputTrace = { seq: number; type: string; trusted: boolean; target: string; key?: string; focusVisible?: boolean };
const events: InputTrace[] = [];
for (const type of ["keydown", "keypress", "keyup", "click", "focusin"]) {
  document.addEventListener(type, (event) => {
    const target = targetOf(event.target as Element | null);
    const entry: InputTrace = { seq: next(), type, trusted: event.isTrusted, target: describe(target) };
    if (event instanceof KeyboardEvent) entry.key = event.key;
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
// The shared Toggle is a rounded 46x44 shape: its inset points stay inside the rounded outline.
const ROUND_POINTS = [[0.5, 0.5], [0.3, 0.3], [0.7, 0.3], [0.3, 0.7], [0.7, 0.7]];
const BOX_POINTS = [[0.5, 0.5], [0.15, 0.25], [0.85, 0.25], [0.15, 0.75], [0.85, 0.75]];
const px = (value: string | undefined): number => Number.parseFloat(value ?? "0") || 0;
function contentBox(element: Element) {
  const rect = element.getBoundingClientRect();
  const style = getComputedStyle(element);
  return {
    left: round(rect.left + px(style.borderLeftWidth) + px(style.paddingLeft)),
    right: round(rect.right - px(style.borderRightWidth) - px(style.paddingRight)),
  };
}
function probe(desc: string, scroll = true) {
  const element = find(desc);
  if (!element) return { desc, found: false };
  if (scroll) element.scrollIntoView({ block: "center", inline: "nearest" });
  const rect = element.getBoundingClientRect();
  const detailElement = document.querySelector(".settings-detail");
  const detail = detailElement?.getBoundingClientRect() ?? null;
  const detailContent = detailElement ? contentBox(detailElement) : null;
  const dialog = element.closest(".settings-departure-dialog")?.getBoundingClientRect() ?? null;
  const points = desc.startsWith("switch:") ? ROUND_POINTS : BOX_POINTS;
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
    inDetailContent: detailContent ? rect.left >= detailContent.left - EPS && rect.right <= detailContent.right + EPS : null,
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
  const pane = document.querySelector(".features-pane") as HTMLElement | null;
  const block = pane?.querySelector(":scope > .setting-block") as HTMLElement | null;
  const grid = pane?.querySelector(".features-grid") as HTMLElement | null;
  const dialog = document.querySelector(".settings-departure-dialog") as HTMLElement | null;
  return {
    viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio },
    document: { scrollWidth: root.scrollWidth, clientWidth: root.clientWidth, bodyScrollWidth: document.body.scrollWidth, scrollX: round(scrollX), scrollY: round(scrollY) },
    detail: detail ? { rect: box(detail.getBoundingClientRect()), content: contentBox(detail), scrollWidth: detail.scrollWidth, clientWidth: detail.clientWidth, scrollLeft: round(detail.scrollLeft), padding: getComputedStyle(detail).padding, pane: detail.getAttribute("data-pane") } : null,
    pane: pane ? { rect: box(pane.getBoundingClientRect()), scrollWidth: pane.scrollWidth, clientWidth: pane.clientWidth } : null,
    block: block ? { rect: box(block.getBoundingClientRect()), scrollWidth: block.scrollWidth, clientWidth: block.clientWidth, paddingLeft: getComputedStyle(block).paddingLeft, paddingRight: getComputedStyle(block).paddingRight } : null,
    grid: grid ? { rect: box(grid.getBoundingClientRect()), scrollWidth: grid.scrollWidth, clientWidth: grid.clientWidth, columns: getComputedStyle(grid).gridTemplateColumns, gap: getComputedStyle(grid).columnGap } : null,
    dialog: dialog ? { rect: box(dialog.getBoundingClientRect()), scrollWidth: dialog.scrollWidth, clientWidth: dialog.clientWidth } : null,
    chain: chainOf(pane),
  };
}
/** Pane layout for capture fidelity: horizontal boxes in viewport coordinates, vertical positions relative to the
 *  pane top (scroll-independent), and the grid tracks. A full-pane capture must reproduce it exactly. */
function captureGeometry() {
  const pane = document.querySelector(".features-pane");
  const detail = document.querySelector(".settings-detail");
  if (!pane || !detail) return null;
  const top = pane.getBoundingClientRect().top;
  const rel = (element: Element) => {
    const rect = element.getBoundingClientRect();
    return [describe(targetOf(element)), round(rect.left), round(rect.right), round(rect.top - top), round(rect.height)];
  };
  const detailRect = detail.getBoundingClientRect();
  return {
    detail: [round(detailRect.left), round(detailRect.right)],
    grid: getComputedStyle(pane.querySelector(".features-grid")!).gridTemplateColumns,
    parts: [pane, ...pane.querySelectorAll(".setting-block, .feat-card, .feat-thumb, .features-recovery-field, .features-recovery-actions, .features-recovery-footer, .pane-footer, button")].map(rel),
  };
}
/** The vertical scroll container around the pane that shows a classic (space-taking) scrollbar, if any. */
function classicScroller(): { element: HTMLElement; scrollbar: number } | null {
  for (let node = document.querySelector(".features-pane")?.parentElement ?? null; node; node = node.parentElement) {
    const style = getComputedStyle(node);
    if (!/(auto|scroll)/.test(style.overflowY)) continue;
    const scrollbar = node.offsetWidth - node.clientWidth - px(style.borderLeftWidth) - px(style.borderRightWidth);
    if (scrollbar > 0) return { element: node as HTMLElement, scrollbar };
  }
  return null;
}
/** Full-pane captures grow the viewport height, which removes the scroll container's classic scrollbar and would
 *  widen the content (crossing the grid's two-column threshold at 768 and 1024 px). Pinning the scrollbar gutter
 *  (capture-only, removed right after) keeps the realistic content width; the runner verifies the geometry. */
function pinScrollbarGutter() {
  const scroller = classicScroller();
  if (!scroller) return { pinned: false, scrollbar: 0 };
  scroller.element.setAttribute("data-visual-capture-scroller", "1");
  const tag = document.createElement("style");
  tag.setAttribute("data-visual-capture", "1");
  tag.textContent = "[data-visual-capture-scroller] { scrollbar-gutter: stable; }";
  document.head.appendChild(tag);
  return { pinned: true, scrollbar: scroller.scrollbar, scroller: tagClass(scroller.element) };
}
function unpinScrollbarGutter() {
  document.querySelectorAll("style[data-visual-capture]").forEach((tag) => tag.remove());
  document.querySelectorAll("[data-visual-capture-scroller]").forEach((element) => element.removeAttribute("data-visual-capture-scroller"));
  return document.querySelectorAll("style[data-visual-capture], [data-visual-capture-scroller]").length === 0;
}
/** Largest vertical overflow of any vertical scroll container around the pane (for full-pane captures). */
function verticalOverflow(): number {
  let most = Math.max(0, document.documentElement.scrollHeight - document.documentElement.clientHeight);
  for (const entry of chainOf(document.querySelector(".features-pane"))) {
    if (/(auto|scroll)/.test(entry.overflowY)) most = Math.max(most, entry.scrollHeight - entry.clientHeight);
  }
  return most;
}
function geometry() {
  const pane = document.querySelector(".features-pane");
  if (!pane) return null;
  const css = (element: Element, names: string[]) => {
    const style = getComputedStyle(element);
    return Object.fromEntries(names.map((name) => [name, style.getPropertyValue(name)]));
  };
  const grid = pane.querySelector(".features-grid")!;
  const cards = [...grid.querySelectorAll(".feat-card")].map((card) => {
    const rect = card.getBoundingClientRect();
    const thumb = card.querySelector(".feat-thumb")?.getBoundingClientRect() ?? null;
    const head = card.querySelector(".feat-head")?.getBoundingClientRect() ?? null;
    return {
      id: card.getAttribute("data-feature-id"), w: round(rect.width), h: round(rect.height), left: round(rect.left), right: round(rect.right),
      head: head ? { w: round(head.width), h: round(head.height) } : null,
      thumb: thumb ? { w: round(thumb.width), h: round(thumb.height) } : null,
      name: text(card.querySelector(".feat-name")), recovery: card.querySelector(".features-recovery-field") !== null,
      css: css(card, ["padding-top", "padding-right", "padding-bottom", "padding-left", "border-top-width", "border-radius", "row-gap"]),
    };
  });
  const switches = [...pane.querySelectorAll('[data-feature-id] [role="switch"]')].map((element) => {
    const rect = element.getBoundingClientRect();
    const knob = element.querySelector(".toggle-knob");
    const knobRect = knob?.getBoundingClientRect() ?? null;
    const card = element.closest(".feat-card")!;
    const cardContent = contentBox(card);
    const cardRect = card.getBoundingClientRect();
    return {
      id: element.closest("[data-feature-id]")!.getAttribute("data-feature-id"), checked: element.getAttribute("aria-checked"), className: element.className,
      label: element.getAttribute("aria-label"), w: round(rect.width), h: round(rect.height),
      knob: knobRect ? {
        w: round(knobRect.width), h: round(knobRect.height), dx: round(knobRect.left - rect.left), dy: round(knobRect.top - rect.top),
        transform: getComputedStyle(knob!).transform, animations: knob!.getAnimations().length,
      } : null,
      inCard: { right: round(cardContent.right - rect.right), top: round(rect.top - cardRect.top) },
      css: css(element, ["width", "height", "min-height", "border-radius", "background-color"]),
    };
  });
  const gridStyle = getComputedStyle(grid);
  const reset = (pane.querySelector('[data-testid="features-reset-defaults"]') ?? pane.querySelector('[data-testid="settings-footer-reset"]'))?.getBoundingClientRect() ?? null;
  return {
    cards, switches,
    tracks: gridStyle.gridTemplateColumns.split(/\s+/).map((value) => round(Number.parseFloat(value))),
    gridColumns: gridStyle.gridTemplateColumns, gridGap: gridStyle.columnGap,
    order: cards.map((card) => card.id),
    reset: reset ? { w: round(reset.width), h: round(reset.height) } : null,
  };
}
/** Pairwise overlap (area > 0.5 px²) between sibling parts that must never collide. */
function overlapReport() {
  const area = (a: DOMRect, b: DOMRect): number =>
    Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  const groups: Array<{ name: string; parts: Element[] }> = [];
  const pane = document.querySelector(".features-pane");
  if (pane) {
    groups.push({ name: "pane-children", parts: [...pane.children] });
    groups.push({ name: "cards", parts: [...pane.querySelectorAll(".feat-card")] });
    pane.querySelectorAll(".feat-card").forEach((card) => {
      const id = card.getAttribute("data-feature-id");
      groups.push({ name: `card-children@${id}`, parts: [...card.children] });
      const head = card.querySelector(".feat-head");
      if (head) groups.push({ name: `head-children@${id}`, parts: [...head.children] });
      const field = card.querySelector(".features-recovery-field");
      if (field) groups.push({ name: `recovery@${id}`, parts: [...field.children] });
    });
    const actions = pane.querySelector(".features-recovery-actions");
    if (actions) groups.push({ name: "actions", parts: [...actions.children] });
    const footer = pane.querySelector(".features-recovery-footer") ?? pane.querySelector(".pane-footer");
    if (footer) groups.push({ name: "footer", parts: [...footer.children] });
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
/** Text boxes that must not clip: card name/description, recovery messages, status, export error, dialog message. */
function textClip() {
  return [...document.querySelectorAll(".features-pane .feat-name, .features-pane .feat-desc, .features-pane .features-recovery-text, .features-pane .features-recovery-error, .features-pane .features-recovery-status, .features-pane .pane-title, .features-pane .pane-intro, .settings-departure-dialog p")]
    .map((element) => ({ text: text(element).slice(0, 60), sw: element.scrollWidth, cw: element.clientWidth, sh: element.scrollHeight, ch: element.clientHeight }));
}
function scrollState() {
  return {
    x: round(scrollX), y: round(scrollY),
    chain: chainOf(document.querySelector(".features-pane")).map((entry) => ({ name: entry.name, top: entry.scrollTop, left: entry.scrollLeft })),
  };
}
/** Focus scrolling snaps scroll offsets to whole CSS pixels while this layout has fractional card heights, so a
 *  focused control may end up a sub-pixel (< 1 px) past the scrollport edge; that is tolerated, and the actual
 *  overhang is reported for every focus stop. */
const FOCUS_VIEW_TOLERANCE = 0.999;
function focusInfo() {
  const element = document.activeElement as HTMLElement | null;
  if (!element || element === document.body) return { desc: describe(element) };
  const style = getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
  const overhang = round(Math.max(0, -rect.left, -rect.top, rect.right - innerWidth, rect.bottom - innerHeight));
  return {
    desc: describe(element), focusVisible: element.matches(":focus-visible"),
    outline: { style: style.outlineStyle, width: style.outlineWidth, color: style.outlineColor, offset: style.outlineOffset },
    rect: box(rect), overhang,
    inViewport: overhang <= FOCUS_VIEW_TOLERANCE,
    centerHit: Boolean(hit && (hit === element || element.contains(hit))), centerTarget: describe(targetOf(hit)),
    inPane: Boolean(element.closest(".features-pane")), inDialog: Boolean(element.closest(".settings-departure-dialog")),
  };
}

// ---------------------------------------------------------------------------------------------------
// Synthetic auth session (the only synthetic input) and the production App composition
// ---------------------------------------------------------------------------------------------------
const now = new Date("2026-10-04T00:00:00.000Z").toISOString();
const session = {
  access_token: "features-visual-access-token",
  refresh_token: "features-visual-refresh-token",
  token_type: "bearer",
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  user: {
    id: OWNER, aud: "authenticated", role: "authenticated", email: "features-visual-a@example.invalid",
    app_metadata: { provider: "email", providers: ["email"] }, user_metadata: {}, identities: [],
    created_at: now, updated_at: now, is_anonymous: false,
  },
};
const authCalls = { getSession: 0, onAuthStateChange: 0, signOut: 0 };
const syntheticClient = {
  auth: {
    getSession: async () => { authCalls.getSession += 1; return { data: { session }, error: null }; },
    onAuthStateChange: () => { authCalls.onAuthStateChange += 1; return { data: { subscription: { unsubscribe: () => {} } } }; },
    signOut: async () => { authCalls.signOut += 1; return { error: null }; },
  },
};

let scrollProbe: HTMLElement | null = null;
const verify = {
  composition: "production-app",
  instance: crypto.randomUUID(),
  lang: LANG,
  ids: IDS,
  keys: FEATURE_KEYS,
  labels: LABELS,
  petLabel: NAV.pet,
  markerKey: generationMarkerKey(OWNER),
  authCalls: () => ({ ...authCalls }),
  scope: () => {
    const scope = accountScope.capture();
    return { kind: scope.kind, accountId: scope.accountId, generation: scope.generation, epoch: scope.epoch };
  },
  mark: () => sequence,
  physical,
  seedRaw: (id: Id, raw: string | null) => {
    if (raw === null) native.remove.call(realLocal, keyOf(id));
    else native.set.call(realLocal, keyOf(id), raw);
    return native.get.call(realLocal, keyOf(id));
  },
  denySet: (target: "all" | Id[]) => {
    for (const key of target === "all" ? FEATURE_KEYS : target.map(keyOf)) deniedSet.add(key);
    return [...deniedSet];
  },
  allowSet: (target: Id[]) => { for (const id of target) deniedSet.delete(keyOf(id)); return [...deniedSet]; },
  denyRemove: (target: "all" | Id[]) => {
    for (const key of target === "all" ? FEATURE_KEYS : target.map(keyOf)) deniedRemove.add(key);
    return [...deniedRemove];
  },
  restore: () => { deniedSet.clear(); deniedRemove.clear(); return { set: [...deniedSet], remove: [...deniedRemove] }; },
  /** Positive control for the Storage injector: one patched getItem through the page's real localStorage. */
  probeStorage: () => {
    const before = attempts.length;
    window.localStorage.getItem(keyOf("tasks"));
    return { logged: attempts.length - before, last: attempts.at(-1) ?? null };
  },
  attemptsAfter: (mark: number) => attempts.filter((entry) => entry.seq > mark),
  eventsAfter: (mark: number) => events.filter((entry) => entry.seq > mark),
  confirmsAfter: (mark: number) => confirms.filter((entry) => entry.seq > mark),
  displayed: () => Object.fromEntries(IDS.map((id) => [id, document.querySelector(`.features-pane [data-feature-id="${id}"] [role="switch"]`)?.getAttribute("aria-checked") ?? null])),
  /** Switches whose ARIA state disagrees with their visual state (.on class) or whose name disagrees with it. */
  ariaVisualMismatches: () => {
    const mismatches: string[] = [];
    document.querySelectorAll('.features-pane [data-feature-id] [role="switch"]').forEach((element) => {
      const checked = element.getAttribute("aria-checked") === "true";
      if (checked !== element.classList.contains("on")) mismatches.push(`${describe(element)}:class`);
      if (!(element.getAttribute("aria-label") ?? "").endsWith(checked ? "— on" : "— off")) mismatches.push(`${describe(element)}:name`);
    });
    return mismatches;
  },
  recovery: () => [...document.querySelectorAll(".features-pane .features-recovery-field")].map((element) => ({
    id: element.closest("[data-feature-id]")?.getAttribute("data-feature-id") ?? null,
    text: text(element.querySelector(".features-recovery-text")),
    role: element.querySelector(".features-recovery-text")?.getAttribute("role") ?? null,
    buttons: [...element.querySelectorAll("button")].map((button) => (button.getAttribute("aria-label") ?? text(button)).trim()),
    visibleButtons: [...element.querySelectorAll("button")].map((button) => text(button)),
  })),
  paneActions: () => {
    const actions = document.querySelector(".features-pane .features-recovery-actions");
    return actions ? { buttons: [...actions.querySelectorAll("button")].map(text), alert: actions.querySelector('[role="alert"]') ? text(actions.querySelector('[role="alert"]')) : null } : null;
  },
  status: () => {
    const status = document.querySelector(".features-pane .features-recovery-status");
    return status ? text(status) : null;
  },
  resetButtons: () => [...document.querySelectorAll('.features-pane [data-testid="features-reset-defaults"]')].map(text),
  saveFooter: () => document.querySelector(".features-pane .pane-footer, .features-pane .pane-save") !== null,
  title: () => text(document.querySelector(".features-pane .pane-title")),
  dialog: () => {
    const dialog = document.querySelector('.settings-departure-dialog[role="dialog"]');
    return dialog ? { label: dialog.getAttribute("aria-label"), text: text(dialog.querySelector("p")), buttons: [...dialog.querySelectorAll("button")].map(text) } : null;
  },
  pet: () => {
    const wrap = document.querySelector(".pet-wrap");
    return wrap ? { present: true, rect: box(wrap.getBoundingClientRect()) } : { present: false };
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
  captureGeometry,
  pinScrollbarGutter,
  unpinScrollbarGutter,
  overlapReport,
  textClip,
  geometry,
  scrollState,
  focusInfo,
  activeDesc: () => describe(document.activeElement),
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
  /** Space-scroll positive control: a removable tabindex on the pane intro (fixture-owned, temporary). */
  armScrollProbe: () => {
    scrollProbe = document.querySelector(".features-pane .pane-intro");
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
    let node: Element | null = document.querySelector(".features-pane");
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

createRoot(document.getElementById("root")!).render(
  <WebAuthSessionProvider client={syntheticClient as never} onIdentityChange={invalidateAccountIdentity}>
    <RouterProvider router={router} />
  </WebAuthSessionProvider>,
);
