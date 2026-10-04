/**
 * Sticky native fixture: CP-STICKY-01 batch 8, parent-role native verification (verification only).
 *
 * Bundled by ./verify-native.mjs from stdin with resolveDir = an immutable `git archive` of the fixed
 * candidate; every product module imported below comes from that archive (no product code is mocked).
 * Composition, following ../web-more-recovery-native/native.tsx:
 *   - the production Shell inside WebShellProvider with the production webShellModuleRegistrations;
 *   - the production ComposedSettings (DepartureCoordinator + settingsDeparture) under React Router's
 *     production createBrowserRouter, starting at /app/settings/sticky (no auth gate: synthetic accounts);
 *   - the real Sticky pane, usePrefAutosaveAsync hook, mutatePref engine, registry, codec and accountScope.
 *
 * Fixture-owned instruments only:
 *   - Storage.prototype getItem/setItem/removeItem/key/clear/length: EVERY attempt is logged before any
 *     fault decision and before delegation (attempt-level), for every Storage area;
 *   - faults: deny reads/writes/removes per key, deny everything, one-shot readback denial after the next
 *     successful write of a key (engine readback uncertainty);
 *   - LockManager.prototype.request: names logged before delegation; hold/release of the real
 *     prefMutationLockName("xai_pref_sticky_<field>") lock;
 *   - URL.createObjectURL/revokeObjectURL and export-anchor click tracing, a body MutationObserver for the
 *     export anchor, and one-shot createObjectURL or anchor-click failure hooks;
 *   - a capture-phase event trace that records whether input events were trusted.
 * The fixture's own setup reads/writes (generation markers, physical byte reads) use the captured native
 * Storage functions and are therefore never counted as application attempts.
 */
import * as React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import { accountScope, generationMarkerKey, prefMutationLockName } from "./packages/plugin-web-storage/src/index";
import { WebShellProvider, Shell } from "./packages/xai-web-shell/src/index";
import { webShellModuleRegistrations } from "./apps/web/src/routes/modules/shellRegistrations";
import { composedSettingsRegistration } from "./apps/web/src/routes/modules/composedSettingsRegistration";
import { requestSettingsDeparture } from "./apps/web/src/routes/modules/settingsDeparture";
import "./packages/plugin-web-tokens/src/index";
import "./apps/web/src/styles/global.css";

type Field = "color" | "font" | "pin_default" | "restore_size" | "grid_spacing";
const FIELDS: readonly Field[] = ["color", "font", "pin_default", "restore_size", "grid_spacing"];
const keyOf = (field: Field): string => `xai_pref_sticky_${field}`;
const STICKY_KEYS = FIELDS.map(keyOf);
const OWNER_A = "sticky-native-A";
const OWNER_B = "sticky-native-B";
const LOCKED_ID = "sticky-native-locked";
const GENERATION = "g1";

// ---------------------------------------------------------------------------------------------------
// Global sequence shared by every trace, so attempts, locks and events can be windowed by one mark.
// ---------------------------------------------------------------------------------------------------
let sequence = 0;
const next = (): number => ++sequence;

// ---------------------------------------------------------------------------------------------------
// Attempt-level Storage instrumentation (recorded BEFORE any fault decision or delegation)
// ---------------------------------------------------------------------------------------------------
type Attempt = { seq: number; op: string; area: string; key: string | null; value?: string; outcome: string };
const proto = Storage.prototype;
const native = { get: proto.getItem, set: proto.setItem, remove: proto.removeItem, key: proto.key, clear: proto.clear };
const lengthDescriptor = Object.getOwnPropertyDescriptor(proto, "length")!;
const realLocal = window.localStorage;
let realSession: Storage | null = null;
try { realSession = window.sessionStorage; } catch { realSession = null; }
const areaOf = (area: unknown): string => (area === realLocal ? "local" : area === realSession ? "session" : "other");
const attempts: Attempt[] = [];
const faults = {
  all: false,
  get: new Set<string>(),
  set: new Set<string>(),
  remove: new Set<string>(),
  readbackOnNextSet: new Set<string>(),
  readbackArmed: new Set<string>(),
};
const logAttempt = (op: string, area: unknown, key: string | null, value?: string): Attempt => {
  const entry: Attempt = { seq: next(), op, area: areaOf(area), key, outcome: "ok" };
  if (value !== undefined) entry.value = value;
  attempts.push(entry);
  return entry;
};
const refuse = (entry: Attempt, outcome: string, message: string): never => {
  entry.outcome = outcome;
  throw new DOMException(message, "SecurityError");
};
proto.getItem = function getItem(this: Storage, key: string): string | null {
  const name = String(key);
  const entry = logAttempt("get", this, name);
  if (faults.all || faults.get.has(name)) refuse(entry, "denied", "fixture denied read");
  if (faults.readbackArmed.has(name)) {
    faults.readbackArmed.delete(name);
    refuse(entry, "readback-denied", "fixture denied readback");
  }
  return native.get.call(this, key);
};
proto.setItem = function setItem(this: Storage, key: string, value: string): void {
  const name = String(key);
  const entry = logAttempt("set", this, name, String(value));
  if (faults.all || faults.set.has(name)) refuse(entry, "denied", "fixture denied write");
  native.set.call(this, key, value);
  if (faults.readbackOnNextSet.has(name)) {
    faults.readbackOnNextSet.delete(name);
    faults.readbackArmed.add(name);
  }
};
proto.removeItem = function removeItem(this: Storage, key: string): void {
  const name = String(key);
  const entry = logAttempt("remove", this, name);
  if (faults.all || faults.remove.has(name)) refuse(entry, "denied", "fixture denied remove");
  native.remove.call(this, key);
};
proto.key = function key(this: Storage, index: number): string | null {
  const entry = logAttempt("key", this, null);
  if (faults.all) refuse(entry, "denied", "fixture denied key");
  return native.key.call(this, index);
};
proto.clear = function clear(this: Storage): void {
  const entry = logAttempt("clear", this, null);
  if (faults.all) refuse(entry, "denied", "fixture denied clear");
  native.clear.call(this);
};
Object.defineProperty(proto, "length", {
  configurable: true,
  enumerable: lengthDescriptor.enumerable,
  get(this: Storage) {
    const entry = logAttempt("length", this, null);
    if (faults.all) refuse(entry, "denied", "fixture denied length");
    return lengthDescriptor.get!.call(this);
  },
});
const physical = (): Record<Field, string | null> =>
  Object.fromEntries(FIELDS.map((field) => [field, native.get.call(realLocal, keyOf(field))])) as Record<Field, string | null>;
const resolveKeys = (target: "sticky" | readonly Field[]): readonly string[] => (target === "sticky" ? STICKY_KEYS : target.map(keyOf));

// ---------------------------------------------------------------------------------------------------
// Web Lock tracing and real per-key lock hold/release
// ---------------------------------------------------------------------------------------------------
type LockEntry = { seq: number; name: string; mode: string; by: "app" | "fixture" };
const lockLog: LockEntry[] = [];
let fixtureLocking = false;
const nativeRequest = LockManager.prototype.request;
LockManager.prototype.request = function request(this: LockManager, name: string, ...rest: unknown[]) {
  const options = rest.length > 1 && rest[0] !== null && typeof rest[0] === "object" ? (rest[0] as { mode?: string }) : {};
  lockLog.push({ seq: next(), name: String(name), mode: options.mode ?? "exclusive", by: fixtureLocking ? "fixture" : "app" });
  return (nativeRequest as (...args: unknown[]) => Promise<unknown>).call(this, name, ...rest);
} as typeof LockManager.prototype.request;
const held = new Map<Field, { name: string; release: () => void; done: Promise<unknown> }>();
async function hold(field: Field): Promise<string> {
  if (held.has(field)) throw new Error(`fixture lock already held for ${field}`);
  const name = prefMutationLockName(keyOf(field));
  let release!: () => void;
  let entered!: () => void;
  const gate = new Promise<void>((resolve) => { release = resolve; });
  const ready = new Promise<void>((resolve) => { entered = resolve; });
  let done: Promise<unknown>;
  fixtureLocking = true;
  try {
    done = navigator.locks.request(name, { mode: "exclusive" }, () => { entered(); return gate; });
  } finally {
    fixtureLocking = false;
  }
  held.set(field, { name, release, done });
  await ready;
  return name;
}
async function release(field: Field): Promise<void> {
  const lock = held.get(field);
  if (!lock) throw new Error(`fixture lock not held for ${field}`);
  lock.release();
  await lock.done;
  held.delete(field);
}
async function lockQuery(): Promise<{ held: string[]; pending: string[] }> {
  const snapshot = await navigator.locks.query();
  return {
    held: (snapshot.held ?? []).map((lock) => String(lock.name)),
    pending: (snapshot.pending ?? []).map((lock) => String(lock.name)),
  };
}

// ---------------------------------------------------------------------------------------------------
// Export tracing: object URLs, the export anchor's click, its DOM insertion/removal, failure hooks
// ---------------------------------------------------------------------------------------------------
const EXPORT_NAME = "sticky-draft.json";
const urlTrace = { createAttempts: 0, createThrows: 0, created: [] as string[], revoked: [] as string[], blobs: [] as Array<{ size: number; type: string }> };
const clickTrace = { attempts: 0, throws: 0, hrefs: [] as string[] };
const anchorTrace = { added: [] as string[], removed: [] as string[] };
let failNextCreate = false;
let failNextClick = false;
const nativeCreate = URL.createObjectURL;
const nativeRevoke = URL.revokeObjectURL;
URL.createObjectURL = function createObjectURL(object: Blob | MediaSource): string {
  urlTrace.createAttempts += 1;
  if (failNextCreate) {
    failNextCreate = false;
    urlTrace.createThrows += 1;
    throw new Error("fixture createObjectURL failure");
  }
  const url = nativeCreate.call(URL, object);
  urlTrace.created.push(url);
  if (object instanceof Blob) urlTrace.blobs.push({ size: object.size, type: object.type });
  return url;
};
URL.revokeObjectURL = function revokeObjectURL(url: string): void {
  urlTrace.revoked.push(String(url));
  nativeRevoke.call(URL, url);
};
const nativeClick = HTMLElement.prototype.click;
Object.defineProperty(HTMLAnchorElement.prototype, "click", {
  configurable: true,
  writable: true,
  value: function click(this: HTMLAnchorElement): void {
    if (this.download === EXPORT_NAME) {
      clickTrace.attempts += 1;
      clickTrace.hrefs.push(this.href);
      if (failNextClick) {
        failNextClick = false;
        clickTrace.throws += 1;
        throw new Error("fixture anchor click failure");
      }
    }
    nativeClick.call(this);
  },
});
new MutationObserver((records) => {
  for (const record of records) {
    record.addedNodes.forEach((node) => { if (node instanceof HTMLAnchorElement && node.download === EXPORT_NAME) anchorTrace.added.push(node.href); });
    record.removedNodes.forEach((node) => { if (node instanceof HTMLAnchorElement && node.download === EXPORT_NAME) anchorTrace.removed.push(node.href); });
  }
}).observe(document.body, { childList: true });

// ---------------------------------------------------------------------------------------------------
// Trusted-input event trace (capture phase, Settings surface only)
// ---------------------------------------------------------------------------------------------------
type InputEvent = { seq: number; type: string; trusted: boolean; target: string; key?: string; value?: string };
const events: InputEvent[] = [];
const describe = (element: Element | null): string => {
  const control = element?.closest?.("[data-color-id],[data-spacing-id],[role=switch],select,button,.list-row");
  if (!control) return element ? element.tagName.toLowerCase() : "none";
  if (control.hasAttribute("data-color-id")) return `color:${control.getAttribute("data-color-id")}`;
  if (control.hasAttribute("data-spacing-id")) return `spacing:${control.getAttribute("data-spacing-id")}`;
  if (control.getAttribute("role") === "switch") return `switch:${control.getAttribute("aria-label")}`;
  if (control.tagName === "SELECT") return `select:${control.getAttribute("aria-label")}`;
  if (control.classList.contains("list-row")) return `sidebar:${(control.textContent ?? "").trim()}`;
  return `button:${(control.getAttribute("aria-label") ?? control.textContent ?? "").trim()}`;
};
for (const type of ["click", "keydown", "input", "change"]) {
  document.addEventListener(type, (event) => {
    const target = event.target as Element | null;
    if (!target?.closest?.(".sticky-pane, .settings-departure-dialog, .settings-sidebar")) return;
    const entry: InputEvent = { seq: next(), type, trusted: event.isTrusted, target: describe(target) };
    if (event instanceof KeyboardEvent) entry.key = event.key;
    if (target instanceof HTMLSelectElement) entry.value = target.value;
    events.push(entry);
  }, true);
}

// ---------------------------------------------------------------------------------------------------
// Real accountScope transitions (device keys must not care; the host decision must renew)
// ---------------------------------------------------------------------------------------------------
type ScopeView = { kind: string; accountId: string | null; generation: string | null; epoch: number };
const viewScope = (scope: ReturnType<typeof accountScope.capture>): ScopeView =>
  ({ kind: scope.kind, accountId: scope.accountId, generation: scope.generation, epoch: scope.epoch });
function activate(owner: string): ScopeView {
  native.set.call(realLocal, generationMarkerKey(owner), JSON.stringify({ generation: GENERATION, migrationId: "sticky-native", previous: null }));
  return viewScope(accountScope.activate(accountScope.lock(owner), GENERATION));
}
activate(OWNER_A);

// ---------------------------------------------------------------------------------------------------
// Actual composition
// ---------------------------------------------------------------------------------------------------
if (!location.pathname.startsWith("/app/")) history.replaceState(null, "", "/app/settings/sticky");
const Composed = composedSettingsRegistration.children[0]!.render;
function Destination(): React.ReactElement {
  return <div className="native-destination">Destination outside Settings</div>;
}
const router = createBrowserRouter([
  {
    path: "/app",
    element: <Shell lang="en" setLang={() => {}} theme="light" setTheme={() => {}} density="comfortable" setDensity={() => {}} />,
    children: [
      { path: "settings/*", element: <Composed /> },
      { path: ":moduleId/*", element: <Destination /> },
    ],
  },
]);

const text = (element: Element | null | undefined): string => (element?.textContent ?? "").trim();
const verify = {
  instance: crypto.randomUUID(),
  fields: FIELDS,
  keys: STICKY_KEYS,
  owners: { A: OWNER_A, B: OWNER_B, locked: LOCKED_ID },
  router,
  lockName: (field: Field) => prefMutationLockName(keyOf(field)),
  mark: () => sequence,
  physical,
  attemptsAfter: (mark: number) => attempts.filter((entry) => entry.seq > mark),
  attemptTotal: () => attempts.length,
  locksAfter: (mark: number) => lockLog.filter((entry) => entry.seq > mark),
  eventsAfter: (mark: number) => events.filter((entry) => entry.seq > mark),
  denyGet: (target: "sticky" | Field[]) => { for (const key of resolveKeys(target)) faults.get.add(key); },
  denySet: (target: "sticky" | Field[]) => { for (const key of resolveKeys(target)) faults.set.add(key); },
  denyRemove: (target: "sticky" | Field[]) => { for (const key of resolveKeys(target)) faults.remove.add(key); },
  denyAll: () => { faults.all = true; },
  uncertain: (field: Field) => { faults.readbackOnNextSet.add(keyOf(field)); },
  restore: () => {
    faults.all = false;
    faults.get.clear();
    faults.set.clear();
    faults.remove.clear();
    faults.readbackOnNextSet.clear();
    faults.readbackArmed.clear();
  },
  faults: () => ({
    all: faults.all,
    get: [...faults.get],
    set: [...faults.set],
    remove: [...faults.remove],
    readbackOnNextSet: [...faults.readbackOnNextSet],
    readbackArmed: [...faults.readbackArmed],
  }),
  /** Positive control: one patched getItem through the page's real localStorage object. */
  probe: (field: Field = "color") => {
    const before = attempts.length;
    let threw = false;
    try { window.localStorage.getItem(keyOf(field)); } catch { threw = true; }
    return { logged: attempts.length - before, threw, last: attempts.at(-1) ?? null };
  },
  hold,
  release,
  lockQuery,
  activateA: () => activate(OWNER_A),
  activateB: () => activate(OWNER_B),
  lockScope: () => viewScope(accountScope.lock(LOCKED_ID)),
  scope: () => viewScope(accountScope.capture()),
  urlTrace: () => JSON.parse(JSON.stringify(urlTrace)) as typeof urlTrace,
  clickTrace: () => JSON.parse(JSON.stringify(clickTrace)) as typeof clickTrace,
  anchorTrace: () => JSON.parse(JSON.stringify(anchorTrace)) as typeof anchorTrace,
  anchorsInDom: () => document.querySelectorAll(`a[download="${EXPORT_NAME}"]`).length,
  failNextCreate: () => { failNextCreate = true; },
  failNextClick: () => { failNextClick = true; },
  pendingFailures: () => ({ create: failNextCreate, click: failNextClick }),
  /** Synthetic cancelable beforeunload (BeforeUnloadEvent is not constructible); counts handler attempts. */
  warn: () => {
    const before = attempts.length;
    const event = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(event);
    return { warned: event.defaultPrevented, attempts: attempts.length - before };
  },
  displayed: () => {
    const pane = document.querySelector(".sticky-pane");
    if (!pane) return null;
    return {
      color: [...pane.querySelectorAll("[data-color-id]")].filter((element) => element.getAttribute("aria-pressed") === "true").map((element) => element.getAttribute("data-color-id")),
      font: (pane.querySelector('select[aria-label="Font Size"]') as HTMLSelectElement | null)?.value ?? null,
      pin_default: pane.querySelector('[role="switch"][aria-label="Pin by Default"]')?.getAttribute("aria-checked") ?? null,
      restore_size: pane.querySelector('[role="switch"][aria-label="Restore Default Size"]')?.getAttribute("aria-checked") ?? null,
      grid_spacing: [...pane.querySelectorAll("[data-spacing-id]")].filter((element) => element.getAttribute("aria-pressed") === "true").map((element) => element.getAttribute("data-spacing-id")),
    };
  },
  recovery: () => [...document.querySelectorAll(".sticky-pane .sticky-recovery-field")].map((element) => ({
    text: text(element.querySelector(".sticky-recovery-text")),
    buttons: [...element.querySelectorAll("button")].map((button) => (button.getAttribute("aria-label") ?? text(button)).trim()),
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
  location: () => ({ pathname: router.state.location.pathname, key: router.state.location.key, search: router.state.location.search, hash: router.state.location.hash, state: router.state.location.state ?? null }),
  signoutResult: "idle" as string,
  signout() {
    verify.signoutResult = "pending";
    void requestSettingsDeparture("sign-out").then((value) => { verify.signoutResult = String(value); });
  },
};
(window as unknown as { verify: typeof verify }).verify = verify;

const app = createRoot(document.getElementById("app")!);
app.render(
  <WebShellProvider modules={webShellModuleRegistrations} lang="en" railPos="left" petOn={false} setPetOn={() => {}}>
    <RouterProvider router={router} />
  </WebShellProvider>,
);
