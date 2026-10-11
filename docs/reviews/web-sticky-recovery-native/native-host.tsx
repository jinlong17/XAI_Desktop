/**
 * Sticky native HOST fixture: CP-STICKY-01 batch 9, parent-role host verification (verification only).
 *
 * Bundled by ./verify-host.mjs from stdin with resolveDir = an immutable `git archive` of the fixed
 * candidate; every product module imported below comes from that archive (no product code is mocked).
 * The composition is the batch-8 composition of ./native.tsx (that file is neither imported nor changed):
 *   - the production Shell (AppRail + Topbar) inside WebShellProvider with the production
 *     webShellModuleRegistrations;
 *   - the production ComposedSettings (sidebar + DepartureCoordinator + settingsDeparture) under React
 *     Router's production createBrowserRouter, mounted with RouterProvider from "react-router/dom" as in
 *     apps/web/src/main.tsx (batch 8 used the "react-router" export); synthetic accounts, no auth gate;
 *   - the real Sticky pane, usePrefAutosaveAsync hook, mutatePref engine, registry, codec, accountScope.
 *
 * Fixture-owned instruments (the batch-8 Storage / Web Lock / export / event instruments, plus):
 *   - history.pushState / history.replaceState own-property wrappers that log, then delegate, and a
 *     popstate trace;
 *   - a router.subscribe trace with location-commit detection (a commit is a new router location key);
 *   - the router's original navigate reference, to prove the coordinator wrapper is removed on unmount;
 *   - window add/removeEventListener("beforeunload") tracking (active listener set);
 *   - Navigation API entry snapshots (key / id / path / index) for history-stack integrity;
 *   - a value-specific setItem fault (the latest value only) and a fixture "middle" request for the real
 *     prefMutationLockName(key), queued behind the engine's own request;
 *   - root unmount.
 * Fixture setup reads/writes use the captured native Storage functions and are never counted.
 */
import * as React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter } from "react-router";
// The production entry (apps/web/src/main.tsx) mounts RouterProvider from "react-router/dom".
import { RouterProvider } from "react-router/dom";
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
const LABELS: Record<Field, string> = {
  color: "Default Color",
  font: "Font Size",
  pin_default: "Pin by Default",
  restore_size: "Restore Default Size",
  grid_spacing: "Default Grid Spacing",
};
const OWNER_A = "sticky-host-A";
const OWNER_B = "sticky-host-B";
const LOCKED_ID = "sticky-host-locked";
const GENERATION = "g1";

// ---------------------------------------------------------------------------------------------------
// Global sequence shared by every trace, so attempts, locks, history calls and events share one mark.
// ---------------------------------------------------------------------------------------------------
let sequence = 0;
const next = (): number => ++sequence;
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value ?? null)) as T;

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
  setValue: new Map<string, Set<string>>(),
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
  return native.get.call(this, key);
};
proto.setItem = function setItem(this: Storage, key: string, value: string): void {
  const name = String(key);
  const raw = String(value);
  const entry = logAttempt("set", this, name, raw);
  if (faults.all || faults.set.has(name)) refuse(entry, "denied", "fixture denied write");
  if (faults.setValue.get(name)?.has(raw)) refuse(entry, "denied-value", "fixture denied the latest value");
  native.set.call(this, key, value);
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
// Web Lock tracing; real per-key lock hold/release and a "middle" request queued behind the engine
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
type FixtureLock = { name: string; release: () => void; done: Promise<unknown>; acquired: boolean };
const fixtureRequest = (field: Field): FixtureLock => {
  const name = prefMutationLockName(keyOf(field));
  let release!: () => void;
  const gate = new Promise<void>((resolve) => { release = resolve; });
  const lock: FixtureLock = { name, release, done: Promise.resolve(), acquired: false };
  fixtureLocking = true;
  try {
    lock.done = navigator.locks.request(name, { mode: "exclusive" }, () => { lock.acquired = true; return gate; });
  } finally {
    fixtureLocking = false;
  }
  return lock;
};
const held = new Map<Field, FixtureLock>();
const middles = new Map<Field, FixtureLock>();
async function hold(field: Field): Promise<string> {
  if (held.has(field)) throw new Error(`fixture lock already held for ${field}`);
  const lock = fixtureRequest(field);
  held.set(field, lock);
  for (let attempt = 0; attempt < 200 && !lock.acquired; attempt += 1) await new Promise((resolve) => setTimeout(resolve, 5));
  if (!lock.acquired) throw new Error(`fixture lock for ${field} was never acquired`);
  return lock.name;
}
async function release(field: Field): Promise<void> {
  const lock = held.get(field);
  if (!lock) throw new Error(`fixture lock not held for ${field}`);
  lock.release();
  await lock.done;
  held.delete(field);
}
/** Queued (not awaited): acquires only after every earlier request for the same real lock name. */
function queueMiddle(field: Field): string {
  if (middles.has(field)) throw new Error(`middle request already queued for ${field}`);
  const lock = fixtureRequest(field);
  middles.set(field, lock);
  return lock.name;
}
async function releaseMiddle(field: Field): Promise<void> {
  const lock = middles.get(field);
  if (!lock) throw new Error(`middle request not queued for ${field}`);
  lock.release();
  await lock.done;
  middles.delete(field);
}
async function lockQuery(): Promise<{ held: string[]; pending: string[] }> {
  const snapshot = await navigator.locks.query();
  return {
    held: (snapshot.held ?? []).map((lock) => String(lock.name)),
    pending: (snapshot.pending ?? []).map((lock) => String(lock.name)),
  };
}

// ---------------------------------------------------------------------------------------------------
// Export tracing: object URLs, the export anchor's click, its DOM insertion/removal
// ---------------------------------------------------------------------------------------------------
const EXPORT_NAME = "sticky-draft.json";
const urlTrace = { createAttempts: 0, created: [] as string[], revoked: [] as string[] };
const clickTrace = { attempts: 0, hrefs: [] as string[] };
const anchorTrace = { added: [] as string[], removed: [] as string[] };
const nativeCreate = URL.createObjectURL;
const nativeRevoke = URL.revokeObjectURL;
URL.createObjectURL = function createObjectURL(object: Blob | MediaSource): string {
  urlTrace.createAttempts += 1;
  const url = nativeCreate.call(URL, object);
  urlTrace.created.push(url);
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
// Trusted-input event trace (capture phase: Sticky pane, departure dialog, Settings sidebar, AppRail)
// ---------------------------------------------------------------------------------------------------
type InputTrace = { seq: number; type: string; trusted: boolean; target: string; key?: string; value?: string };
const events: InputTrace[] = [];
const describe = (element: Element | null): string => {
  const control = element?.closest?.("[data-color-id],[data-spacing-id],[role=switch],select,button,.list-row");
  if (!control) return element ? element.tagName.toLowerCase() + (element.classList.contains("settings-departure-dialog") ? ".settings-departure-dialog" : "") : "none";
  if (control.hasAttribute("data-color-id")) return `color:${control.getAttribute("data-color-id")}`;
  if (control.hasAttribute("data-spacing-id")) return `spacing:${control.getAttribute("data-spacing-id")}`;
  if (control.getAttribute("role") === "switch") return `switch:${control.getAttribute("aria-label")}`;
  if (control.tagName === "SELECT") return `select:${control.getAttribute("aria-label")}`;
  if (control.classList.contains("list-row")) return `sidebar:${(control.textContent ?? "").trim()}`;
  if (control.closest(".app-rail")) return `rail:${control.getAttribute("aria-label") ?? ""}`;
  if (control.closest(".settings-departure-dialog")) return `dialog:${(control.textContent ?? "").trim()}`;
  return `button:${(control.getAttribute("aria-label") ?? control.textContent ?? "").trim()}`;
};
for (const type of ["click", "keydown", "change"]) {
  document.addEventListener(type, (event) => {
    const target = event.target as Element | null;
    if (!target?.closest?.(".sticky-pane, .settings-departure-dialog, .settings-sidebar, .app-rail")) return;
    const entry: InputTrace = { seq: next(), type, trusted: event.isTrusted, target: describe(target) };
    if (event instanceof KeyboardEvent) entry.key = event.key;
    if (target instanceof HTMLSelectElement) entry.value = target.value;
    events.push(entry);
  }, true);
}

// ---------------------------------------------------------------------------------------------------
// History instrumentation: pushState/replaceState (log, then delegate) and popstate
// ---------------------------------------------------------------------------------------------------
type HistoryCall = { seq: number; method: "pushState" | "replaceState"; url: string; key: string | null; idx: number | null; usr: unknown };
type PopTrace = { seq: number; path: string; key: string | null; idx: number | null };
const historyCalls: HistoryCall[] = [];
const pops: PopTrace[] = [];
const routerHistoryState = (state: unknown): { key?: string; idx?: number; usr?: unknown } | null =>
  state !== null && typeof state === "object" ? (state as { key?: string; idx?: number; usr?: unknown }) : null;
const protoPush = History.prototype.pushState;
const protoReplace = History.prototype.replaceState;
history.pushState = function pushState(this: History, state: unknown, unused: string, url?: string | URL | null): void {
  const parsed = routerHistoryState(state);
  historyCalls.push({ seq: next(), method: "pushState", url: String(url ?? ""), key: parsed?.key ?? null, idx: parsed?.idx ?? null, usr: clone(parsed?.usr ?? null) });
  protoPush.call(this, state, unused, url);
};
history.replaceState = function replaceState(this: History, state: unknown, unused: string, url?: string | URL | null): void {
  const parsed = routerHistoryState(state);
  historyCalls.push({ seq: next(), method: "replaceState", url: String(url ?? ""), key: parsed?.key ?? null, idx: parsed?.idx ?? null, usr: clone(parsed?.usr ?? null) });
  protoReplace.call(this, state, unused, url);
};

// ---------------------------------------------------------------------------------------------------
// beforeunload listener tracking (window add/remove), installed before React mounts
// ---------------------------------------------------------------------------------------------------
const unloadListeners = new Set<unknown>();
const unloadLog: Array<{ seq: number; op: "add" | "remove"; active: number }> = [];
const nativeAddListener = window.addEventListener;
const nativeRemoveListener = window.removeEventListener;
window.addEventListener = function addEventListener(this: Window, type: string, listener: unknown, options?: unknown): void {
  if (type === "beforeunload" && listener) {
    unloadListeners.add(listener);
    unloadLog.push({ seq: next(), op: "add", active: unloadListeners.size });
  }
  (nativeAddListener as (...args: unknown[]) => void).call(this, type, listener, options);
} as typeof window.addEventListener;
window.removeEventListener = function removeEventListener(this: Window, type: string, listener: unknown, options?: unknown): void {
  if (type === "beforeunload" && listener) {
    unloadListeners.delete(listener);
    unloadLog.push({ seq: next(), op: "remove", active: unloadListeners.size });
  }
  (nativeRemoveListener as (...args: unknown[]) => void).call(this, type, listener, options);
} as typeof window.removeEventListener;
window.addEventListener("popstate", (event) => {
  const parsed = routerHistoryState((event as PopStateEvent).state);
  pops.push({ seq: next(), path: location.pathname, key: parsed?.key ?? null, idx: parsed?.idx ?? null });
});

// ---------------------------------------------------------------------------------------------------
// Runtime-error localization: a sequence-stamped console.error trace (delegating, so CDP still sees
// every call) and a detector for React Router's default error element replacing the composed UI.
// ---------------------------------------------------------------------------------------------------
const consoleErrors: Array<{ seq: number; path: string; text: string }> = [];
const nativeConsoleError = console.error;
console.error = function error(...args: unknown[]): void {
  consoleErrors.push({
    seq: next(),
    path: location.pathname,
    text: args.map((value) => (value instanceof Error ? `${value.name}: ${value.message}` : String(value))).join(" ").replace(/\s+/g, " ").slice(0, 300),
  });
  nativeConsoleError.apply(console, args);
};
const errorUi: Array<{ seq: number; path: string; text: string }> = [];
let errorUiShown = false;
new MutationObserver(() => {
  const heading = [...document.querySelectorAll("#app h2")].find((element) => (element.textContent ?? "").includes("Unexpected Application Error"));
  if (heading && !errorUiShown) {
    errorUiShown = true;
    errorUi.push({ seq: next(), path: location.pathname, text: (heading.parentElement?.textContent ?? "").replace(/\s+/g, " ").slice(0, 300) });
  } else if (!heading) {
    errorUiShown = false;
  }
}).observe(document.getElementById("app")!, { childList: true, subtree: true });

// ---------------------------------------------------------------------------------------------------
// Real accountScope transitions (device keys must not care; the host decision must renew)
// ---------------------------------------------------------------------------------------------------
type ScopeView = { kind: string; accountId: string | null; generation: string | null; epoch: number };
const viewScope = (scope: ReturnType<typeof accountScope.capture>): ScopeView =>
  ({ kind: scope.kind, accountId: scope.accountId, generation: scope.generation, epoch: scope.epoch });
function activate(owner: string): ScopeView {
  native.set.call(realLocal, generationMarkerKey(owner), JSON.stringify({ generation: GENERATION, migrationId: "sticky-host", previous: null }));
  return viewScope(accountScope.activate(accountScope.lock(owner), GENERATION));
}
activate(OWNER_A);

// ---------------------------------------------------------------------------------------------------
// Actual composition
// ---------------------------------------------------------------------------------------------------
if (!location.pathname.startsWith("/app/")) history.replaceState(null, "", "/app/settings/hotkeys");
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
const originalNavigate = router.navigate;

// Router trace: every notification, and a commit whenever the router location key changes.
type RouterTrace = { seq: number; key: string; path: string; action: string; navigation: string; blockers: string[] };
type Commit = { seq: number; key: string; pathname: string; search: string; hash: string; state: unknown; action: string };
const routerLog: RouterTrace[] = [];
const commits: Commit[] = [];
let lastKey = router.state.location.key;
router.subscribe((state) => {
  const entry: RouterTrace = {
    seq: next(),
    key: state.location.key,
    path: state.location.pathname,
    action: String(state.historyAction),
    navigation: state.navigation.state,
    blockers: [...state.blockers.values()].map((blocker) => blocker.state),
  };
  routerLog.push(entry);
  if (state.location.key !== lastKey) {
    lastKey = state.location.key;
    commits.push({
      seq: entry.seq,
      key: state.location.key,
      pathname: state.location.pathname,
      search: state.location.search,
      hash: state.location.hash,
      state: clone(state.location.state ?? null),
      action: String(state.historyAction),
    });
  }
});

type NavEntry = { key: string; id: string; url: string | null; index: number };
const navigationApi = (window as unknown as { navigation?: { entries(): NavEntry[]; currentEntry: NavEntry | null } }).navigation;
const pathOf = (url: string | null): string | null => {
  if (url === null) return null;
  try { return new URL(url).pathname; } catch { return url; }
};

const text = (element: Element | null | undefined): string => (element?.textContent ?? "").trim();
const recoveryBlock = (field: Field): HTMLElement | null =>
  ([...document.querySelectorAll(".sticky-pane .sticky-recovery-field")] as HTMLElement[])
    .find((element) => text(element.querySelector(".sticky-recovery-text")).includes(LABELS[field])) ?? null;
const scrollContainerOf = (element: Element): Element => {
  let node: Element | null = element.parentElement;
  while (node) {
    const style = getComputedStyle(node);
    if (/(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight + 1) return node;
    node = node.parentElement;
  }
  return document.scrollingElement ?? document.documentElement;
};

const app = createRoot(document.getElementById("app")!);
let mounted = true;

const verify = {
  instance: crypto.randomUUID(),
  fields: FIELDS,
  keys: STICKY_KEYS,
  owners: { A: OWNER_A, B: OWNER_B, locked: LOCKED_ID },
  router,
  lockName: (field: Field) => prefMutationLockName(keyOf(field)),
  mark: () => sequence,
  physical,
  /** Fixture seeding with the captured native functions (never counted as application attempts). */
  seedRaw: (field: Field, raw: string | null) => {
    if (raw === null) native.remove.call(realLocal, keyOf(field));
    else native.set.call(realLocal, keyOf(field), raw);
    return native.get.call(realLocal, keyOf(field));
  },
  attemptsAfter: (mark: number) => attempts.filter((entry) => entry.seq > mark),
  locksAfter: (mark: number) => lockLog.filter((entry) => entry.seq > mark),
  eventsAfter: (mark: number) => events.filter((entry) => entry.seq > mark),
  historyAfter: (mark: number) => historyCalls.filter((entry) => entry.seq > mark),
  historyAll: () => historyCalls.slice(),
  popsAfter: (mark: number) => pops.filter((entry) => entry.seq > mark),
  commitsAfter: (mark: number) => commits.filter((entry) => entry.seq > mark),
  routerAfter: (mark: number) => routerLog.filter((entry) => entry.seq > mark),
  unloadAfter: (mark: number) => unloadLog.filter((entry) => entry.seq > mark),
  consoleErrorsAfter: (mark: number) => consoleErrors.filter((entry) => entry.seq > mark),
  errorUiAfter: (mark: number) => errorUi.filter((entry) => entry.seq > mark),
  unloadActive: () => unloadListeners.size,
  /** Positive control for the listener tracker: one add, one remove of a fixture-owned no-op listener. */
  unloadSelfTest: () => {
    const before = unloadListeners.size;
    const noop = () => {};
    window.addEventListener("beforeunload", noop);
    const during = unloadListeners.size;
    window.removeEventListener("beforeunload", noop);
    return { before, during, after: unloadListeners.size };
  },
  denyGet: (target: "sticky" | Field[]) => { for (const key of resolveKeys(target)) faults.get.add(key); },
  denySet: (target: "sticky" | Field[]) => { for (const key of resolveKeys(target)) faults.set.add(key); },
  denySetValue: (field: Field, raw: string) => {
    const key = keyOf(field);
    const values = faults.setValue.get(key) ?? new Set<string>();
    values.add(raw);
    faults.setValue.set(key, values);
  },
  restore: () => {
    faults.all = false;
    faults.get.clear();
    faults.set.clear();
    faults.remove.clear();
    faults.setValue.clear();
  },
  faults: () => ({
    all: faults.all,
    get: [...faults.get],
    set: [...faults.set],
    remove: [...faults.remove],
    setValue: [...faults.setValue.entries()].map(([key, values]) => [key, [...values]]),
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
  queueMiddle,
  releaseMiddle,
  middleAcquired: (field: Field) => middles.get(field)?.acquired ?? null,
  lockQuery,
  activateA: () => activate(OWNER_A),
  activateB: () => activate(OWNER_B),
  lockScope: () => viewScope(accountScope.lock(LOCKED_ID)),
  scope: () => viewScope(accountScope.capture()),
  urlTrace: () => clone(urlTrace),
  clickTrace: () => clone(clickTrace),
  anchorTrace: () => clone(anchorTrace),
  anchorsInDom: () => document.querySelectorAll(`a[download="${EXPORT_NAME}"]`).length,
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
  focusInDialog: () => Boolean(document.activeElement?.closest?.(".settings-departure-dialog")),
  paneId: () => document.querySelector(".settings-detail")?.getAttribute("data-pane") ?? null,
  stickyMounted: () => Boolean(document.querySelector(".sticky-pane")),
  sidebarRows: () => [...document.querySelectorAll(".settings-sidebar .list-row")].map((row) => {
    const rect = row.getBoundingClientRect();
    const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    return { label: text(row), active: row.getAttribute("data-active"), uncovered: Boolean(hit && row.contains(hit)) };
  }),
  location: () => ({ pathname: router.state.location.pathname, key: router.state.location.key, search: router.state.location.search, hash: router.state.location.hash, state: clone(router.state.location.state ?? null) }),
  windowPath: () => location.pathname,
  historyState: () => clone(history.state),
  historyLength: () => history.length,
  navEntries: () => (navigationApi ? navigationApi.entries().map((entry) => ({ key: entry.key, id: entry.id, path: pathOf(entry.url), index: entry.index })) : null),
  navCurrent: () => (navigationApi?.currentEntry ? { key: navigationApi.currentEntry.key, id: navigationApi.currentEntry.id, path: pathOf(navigationApi.currentEntry.url), index: navigationApi.currentEntry.index } : null),
  navigationApiPresent: () => Boolean(navigationApi),
  historyWrapped: () => history.pushState !== protoPush && history.replaceState !== protoReplace,
  navigateWrapped: () => router.navigate !== originalNavigate,
  visibility: () => document.visibilityState,
  /** Measures one field's recovery block against its scroll container and the viewport. */
  recoveryGeometry: (field: Field) => {
    const block = recoveryBlock(field);
    if (!block) return null;
    const container = scrollContainerOf(block);
    const rect = block.getBoundingClientRect();
    const box = container === document.scrollingElement || container === document.documentElement
      ? { top: 0, bottom: innerHeight }
      : container.getBoundingClientRect();
    const visibleTop = Math.max(box.top, 0);
    const visibleBottom = Math.min(box.bottom, innerHeight);
    return {
      top: Math.round(rect.top),
      bottom: Math.round(rect.bottom),
      visibleTop: Math.round(visibleTop),
      visibleBottom: Math.round(visibleBottom),
      container: container === document.scrollingElement ? "document" : `${container.tagName.toLowerCase()}.${[...container.classList].join(".")}`,
      scrollTop: Math.round(container.scrollTop),
      scrollHeight: container.scrollHeight,
      clientHeight: container.clientHeight,
      offscreen: rect.bottom <= visibleTop || rect.top >= visibleBottom,
    };
  },
  /** Scrolls the Sticky pane's scroll container to its end (the recovery blocks near the top leave view). */
  scrollPaneToEnd: () => {
    const pane = document.querySelector(".sticky-pane");
    if (!pane) return null;
    const container = scrollContainerOf(pane);
    container.scrollTop = container.scrollHeight;
    return { scrollTop: Math.round(container.scrollTop), scrollHeight: container.scrollHeight, clientHeight: container.clientHeight };
  },
  injectFontOption: (value: string, label: string) => {
    const select = document.querySelector('.sticky-pane select[aria-label="Font Size"]') as HTMLSelectElement | null;
    if (!select) return null;
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    option.setAttribute("data-host-injected", "1");
    select.appendChild(option);
    return [...select.options].map((entry) => entry.value);
  },
  removeInjected: () => {
    const nodes = document.querySelectorAll("[data-host-injected]");
    nodes.forEach((node) => node.remove());
    return nodes.length;
  },
  signouts: {} as Record<string, string>,
  signout(tag: string) {
    verify.signouts[tag] = "pending";
    void requestSettingsDeparture("sign-out").then((value) => { verify.signouts[tag] = String(value); });
  },
  mounted: () => mounted,
  unmount: () => {
    app.unmount();
    mounted = false;
    return document.getElementById("app")?.childElementCount ?? -1;
  },
};
(window as unknown as { verify: typeof verify }).verify = verify;

app.render(
  <WebShellProvider modules={webShellModuleRegistrations} lang="en" railPos="left" petOn={false} setPetOn={() => {}}>
    <RouterProvider router={router} />
  </WebShellProvider>,
);
