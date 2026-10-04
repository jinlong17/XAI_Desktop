/**
 * CP-STICKY-01 batch 13 (post-F1 reruns): fixture for the double-Back race check and the declared
 * coordinator behaviour changes (contract §9 rows g, k, l). Verification only; it repairs nothing,
 * accepts nothing and changes no product file.
 *
 * Bundled by ./verify-f1-race.mjs from stdin with resolveDir = an immutable `git archive` of the
 * candidate. Every product module comes from that archive; nothing is mocked. The composition and the
 * instruments are those of the frozen batch-10 fixture ./f1-host.tsx (neither imported nor changed):
 * the production Shell + WebShellProvider + webShellModuleRegistrations, the production ComposedSettings
 * (sidebar + DepartureCoordinator + settingsDeparture), createBrowserRouter mounted with RouterProvider
 * from "react-router/dom", synthetic accounts, no auth gate, and the frozen ./f1-prelude.js commit
 * observer (window.__f1, shared sequence).
 *
 * Instruments kept from ./f1-host.tsx (all log, then delegate): attempt-level Storage with a per-key
 * setItem fault; Web Lock request trace; capture-phase click trace (trusted flag); pushState/replaceState
 * wrappers and popstate trace; router.subscribe trace with blocker proceed()/reset() wrappers that record
 * the router's LIVE blocker before delegating (this subscription precedes RouterProvider's);
 * sequence-stamped console.error trace; React Router default error element detector.
 *
 * Added for this check (patterns of ../web-sticky-recovery-native/native-host.tsx, not imported):
 *   - real accountScope transitions A -> B -> locked -> A (row k);
 *   - window add/removeEventListener("beforeunload") tracking (row l);
 *   - the router's original navigate reference, to prove the coordinator wrapper is removed (row l);
 *   - root unmount (row l) and a router blocker-map view (no phantom entry after unmount);
 *   - Navigation API entry view (history-stack integrity next to CDP);
 *   - armClickOnNextBlocked(name): a one-shot router subscriber, registered after RouterProvider's, that
 *     fires when the router publishes a NEW "blocked" blocker object and synchronously dispatches
 *     HTMLElement.click() on the named departure-dialog button. RouterProvider has only scheduled its
 *     (transition) render at that instant, so the click lands after the second Back and before React
 *     renders the new blocker. The record proves it: the committed coordinator blocker id differs from
 *     the live router blocker id at click time. The click is script-dispatched (isTrusted=false).
 *   - syncClicks(targets): several script clicks in one task (Stay plus a pane edit), used to force a
 *     guard re-registration while the rendered blocker snapshot is still the stale "blocked" one.
 */
import * as React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { accountScope, generationMarkerKey } from "./packages/plugin-web-storage/src/index";
import { WebShellProvider, Shell } from "./packages/xai-web-shell/src/index";
import { webShellModuleRegistrations } from "./apps/web/src/routes/modules/shellRegistrations";
import { composedSettingsRegistration } from "./apps/web/src/routes/modules/composedSettingsRegistration";
import "./packages/plugin-web-tokens/src/index";
import "./apps/web/src/styles/global.css";

type F1 = {
  seq: number;
  next: () => number;
  idOf: (object: unknown) => number | null;
  live: () => { id: number | null; state: string } | null;
  router: unknown;
  commits: Array<{ seq: number; coord?: { b: number | null; s: string | null; gv: number | null; iv: number | null } | null; live?: unknown }>;
  post: Array<{ seq: number }>;
  hookErrors: number;
};
const f1 = (window as unknown as { __f1?: F1 }).__f1;
if (!f1) throw new Error("f1-prelude.js must run before the fixture bundle");
const next = (): number => f1.next();
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value ?? null)) as T;
const OWNER_A = "f1-race-A";
const OWNER_B = "f1-race-B";
const LOCKED_ID = "f1-race-locked";
const GENERATION = "g1";

// ---------------------------------------------------------------------------------------------------
// Attempt-level Storage instrumentation (recorded BEFORE any fault decision or delegation)
// ---------------------------------------------------------------------------------------------------
type Attempt = { seq: number; op: string; key: string | null; value?: string; outcome: string };
const proto = Storage.prototype;
const native = { get: proto.getItem, set: proto.setItem, remove: proto.removeItem };
const realLocal = window.localStorage;
const attempts: Attempt[] = [];
const deniedSet = new Set<string>();
proto.getItem = function getItem(this: Storage, key: string): string | null {
  if (this === realLocal) attempts.push({ seq: next(), op: "get", key: String(key), outcome: "ok" });
  return native.get.call(this, key);
};
proto.setItem = function setItem(this: Storage, key: string, value: string): void {
  const name = String(key);
  const entry: Attempt = { seq: next(), op: "set", key: name, value: String(value), outcome: "ok" };
  if (this === realLocal) attempts.push(entry);
  if (this === realLocal && deniedSet.has(name)) {
    entry.outcome = "denied";
    throw new DOMException("fixture denied write", "SecurityError");
  }
  native.set.call(this, key, value);
};
proto.removeItem = function removeItem(this: Storage, key: string): void {
  if (this === realLocal) attempts.push({ seq: next(), op: "remove", key: String(key), outcome: "ok" });
  native.remove.call(this, key);
};

// ---------------------------------------------------------------------------------------------------
// Web Lock request trace (application requests)
// ---------------------------------------------------------------------------------------------------
const lockLog: Array<{ seq: number; name: string; mode: string }> = [];
const nativeRequest = LockManager.prototype.request;
LockManager.prototype.request = function request(this: LockManager, name: string, ...rest: unknown[]) {
  const options = rest.length > 1 && rest[0] !== null && typeof rest[0] === "object" ? (rest[0] as { mode?: string }) : {};
  lockLog.push({ seq: next(), name: String(name), mode: options.mode ?? "exclusive" });
  return (nativeRequest as (...args: unknown[]) => Promise<unknown>).call(this, name, ...rest);
} as typeof LockManager.prototype.request;

// ---------------------------------------------------------------------------------------------------
// Click trace (capture phase; trusted flag kept)
// ---------------------------------------------------------------------------------------------------
const clicks: Array<{ seq: number; trusted: boolean; target: string }> = [];
document.addEventListener("click", (event) => {
  const target = event.target as Element | null;
  const control = target?.closest?.("button,[role=switch],.list-row");
  if (!control?.closest?.(".settings-detail, .settings-departure-dialog, .settings-sidebar")) return;
  clicks.push({ seq: next(), trusted: event.isTrusted, target: (control.getAttribute("aria-label") ?? control.textContent ?? "").trim().slice(0, 80) });
}, true);

// ---------------------------------------------------------------------------------------------------
// History instrumentation: pushState/replaceState (log, then delegate) and popstate
// ---------------------------------------------------------------------------------------------------
type HistoryCall = { seq: number; method: "pushState" | "replaceState"; url: string; key: string | null };
const historyCalls: HistoryCall[] = [];
const pops: Array<{ seq: number; path: string; key: string | null }> = [];
const keyOfState = (state: unknown): string | null =>
  state !== null && typeof state === "object" && typeof (state as { key?: unknown }).key === "string" ? (state as { key: string }).key : null;
const protoPush = History.prototype.pushState;
const protoReplace = History.prototype.replaceState;
history.pushState = function pushState(this: History, state: unknown, unused: string, url?: string | URL | null): void {
  historyCalls.push({ seq: next(), method: "pushState", url: String(url ?? ""), key: keyOfState(state) });
  protoPush.call(this, state, unused, url);
};
history.replaceState = function replaceState(this: History, state: unknown, unused: string, url?: string | URL | null): void {
  historyCalls.push({ seq: next(), method: "replaceState", url: String(url ?? ""), key: keyOfState(state) });
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
  pops.push({ seq: next(), path: location.pathname, key: keyOfState((event as PopStateEvent).state) });
});

// ---------------------------------------------------------------------------------------------------
// Runtime-error localisation
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
const errorUi: Array<{ seq: number; path: string }> = [];
let errorUiShown = false;
// Departure-dialog presence transitions (open/close), so a re-opened dialog is never missed.
const dialogLog: Array<{ seq: number; open: boolean; live: { id: number | null; state: string } | null }> = [];
let dialogOpen = false;
new MutationObserver(() => {
  const heading = [...document.querySelectorAll("#app h2")].find((element) => (element.textContent ?? "").includes("Unexpected Application Error"));
  if (heading && !errorUiShown) {
    errorUiShown = true;
    errorUi.push({ seq: next(), path: location.pathname });
  } else if (!heading) {
    errorUiShown = false;
  }
  const open = document.querySelector('.settings-departure-dialog[role="dialog"]') !== null;
  if (open !== dialogOpen) {
    dialogOpen = open;
    dialogLog.push({ seq: next(), open, live: f1.live() });
  }
}).observe(document.getElementById("app")!, { childList: true, subtree: true });

// ---------------------------------------------------------------------------------------------------
// Real accountScope transitions (device keys do not depend on them; the guard's decision token does)
// ---------------------------------------------------------------------------------------------------
type ScopeView = { scopeKind: string; accountId: string | null; generation: string | null; epoch: number };
const viewScope = (scope: ReturnType<typeof accountScope.capture>): ScopeView =>
  ({ scopeKind: scope.kind, accountId: scope.accountId, generation: scope.generation, epoch: scope.epoch });
function activate(owner: string): ScopeView {
  native.set.call(realLocal, generationMarkerKey(owner), JSON.stringify({ generation: GENERATION, migrationId: "f1-race", previous: null }));
  return viewScope(accountScope.activate(accountScope.lock(owner), GENERATION));
}
activate(OWNER_A);

// ---------------------------------------------------------------------------------------------------
// Actual composition
// ---------------------------------------------------------------------------------------------------
if (!location.pathname.startsWith("/app/")) history.replaceState(null, "", "/app/settings/hotkeys");
const Composed = composedSettingsRegistration.children[0]!.render;
const router = createBrowserRouter([
  {
    path: "/app",
    element: <Shell lang="en" setLang={() => {}} theme="light" setTheme={() => {}} density="comfortable" setDensity={() => {}} />,
    children: [{ path: "settings/*", element: <Composed /> }],
  },
]);
f1.router = router;
const originalNavigate = router.navigate;

// Router trace + blocker method wrappers (this subscription precedes RouterProvider's).
type Blocker = { state: string; proceed?: (...args: unknown[]) => unknown; reset?: (...args: unknown[]) => unknown };
type BlockerCall = { seq: number; op: "proceed" | "reset"; blocker: number | null; liveBlocker: number | null; liveState: string | null; path: string; threw?: string };
const blockerCalls: BlockerCall[] = [];
const wrappedBlockers = new WeakSet<object>();
const wrapBlocker = (blocker: Blocker): void => {
  if (blocker.state !== "blocked" || wrappedBlockers.has(blocker)) return;
  wrappedBlockers.add(blocker);
  const id = f1.idOf(blocker);
  for (const op of ["proceed", "reset"] as const) {
    const original = blocker[op];
    if (typeof original !== "function") continue;
    blocker[op] = function wrappedBlockerMethod(this: unknown, ...args: unknown[]): unknown {
      const live = f1.live();
      const entry: BlockerCall = { seq: next(), op, blocker: id, liveBlocker: live?.id ?? null, liveState: live?.state ?? null, path: location.pathname };
      blockerCalls.push(entry);
      try {
        return original.apply(this, args);
      } catch (error) {
        entry.threw = String((error as Error)?.message ?? error).slice(0, 200);
        throw error;
      }
    };
  }
};
type RouterTrace = { seq: number; key: string; path: string; action: string; blockers: string[] };
type Commit = { seq: number; key: string; pathname: string; state: unknown; action: string };
const routerLog: RouterTrace[] = [];
const commits: Commit[] = [];
let lastKey = router.state.location.key;
router.subscribe((state) => {
  state.blockers.forEach((blocker) => wrapBlocker(blocker as unknown as Blocker));
  const entry: RouterTrace = {
    seq: next(),
    key: state.location.key,
    path: state.location.pathname,
    action: String(state.historyAction),
    blockers: [...state.blockers.values()].map((blocker) => `${f1.idOf(blocker)}:${blocker.state}`),
  };
  routerLog.push(entry);
  if (state.location.key !== lastKey) {
    lastKey = state.location.key;
    commits.push({ seq: entry.seq, key: state.location.key, pathname: state.location.pathname, state: clone(state.location.state ?? null), action: String(state.historyAction) });
  }
});

const text = (element: Element | null | undefined): string => (element?.textContent ?? "").replace(/\s+/g, " ").trim();
const after = <T extends { seq: number }>(list: readonly T[], mark: number): T[] => list.filter((entry) => entry.seq > mark);
const lastCommittedCoordinator = () => {
  for (let index = f1.commits.length - 1; index >= 0; index -= 1) {
    const entry = f1.commits[index]!;
    if (entry.coord) return { seq: entry.seq, b: entry.coord.b, s: entry.coord.s, gv: entry.coord.gv, iv: entry.coord.iv };
  }
  return null;
};
const dialogButton = (name: string): HTMLElement | null =>
  [...document.querySelectorAll<HTMLElement>('.settings-departure-dialog[role="dialog"] button')].find((button) => text(button) === name) ?? null;
const scriptTarget = (target: string): HTMLElement | null => {
  // "dialog:<name>" = departure dialog button; "switch:<aria-label>" = a pane switch.
  const [kind, ...rest] = target.split(":");
  const name = rest.join(":");
  if (kind === "dialog") return dialogButton(name);
  if (kind === "switch") return document.querySelector<HTMLElement>(`.settings-detail [role="switch"][aria-label="${name}"]`);
  return null;
};

// One-shot "click on the next new blocked blocker" arm (registered after RouterProvider's subscriber).
type ArmRecord = {
  seq: number; name: string; found: boolean; armedLive: number | null;
  live: { id: number | null; state: string } | null; committedCoordinator: ReturnType<typeof lastCommittedCoordinator>;
  beforeRender: boolean; dialogAfterClick: boolean; error?: string;
};
const armLog: ArmRecord[] = [];
let armUnsubscribe: (() => void) | null = null;
const syncLog: Array<{ seq: number; targets: string[]; found: boolean[]; live: { id: number | null; state: string } | null; committedCoordinator: ReturnType<typeof lastCommittedCoordinator> }> = [];

const verify = {
  router,
  mark: () => f1.seq,
  denySet: (key: string) => { deniedSet.add(key); },
  restore: () => { deniedSet.clear(); },
  physical: (key: string) => native.get.call(realLocal, key),
  location: () => ({ pathname: router.state.location.pathname, key: router.state.location.key, state: clone(router.state.location.state ?? null) }),
  windowPath: () => location.pathname,
  historyStateKey: () => keyOfState(history.state),
  paneId: () => document.querySelector(".settings-detail")?.getAttribute("data-pane") ?? null,
  dialog: () => {
    const dialog = document.querySelector('.settings-departure-dialog[role="dialog"]');
    return dialog ? { label: dialog.getAttribute("aria-label"), text: text(dialog.querySelector("p")), buttons: [...dialog.querySelectorAll("button")].map(text) } : null;
  },
  alerts: () => [...document.querySelectorAll('.settings-detail [role="alert"]')].map(text),
  buttons: () => [...document.querySelectorAll(".settings-detail button[aria-label]")].map((button) => button.getAttribute("aria-label")),
  switchState: (label: string) => document.querySelector(`.settings-detail [role="switch"][aria-label="${label}"]`)?.getAttribute("aria-checked") ?? null,
  live: () => f1.live(),
  blockers: () => [...router.state.blockers.entries()].map(([key, blocker]) => ({ key, id: f1.idOf(blocker), state: blocker.state })),
  committedCoordinator: () => lastCommittedCoordinator(),
  /** The coordinator has committed (and flushed passive effects for) the router's live blocked blocker. */
  liveBlockerRendered: () => {
    const live = f1.live();
    const committed = lastCommittedCoordinator();
    const lastPost = f1.post.length ? f1.post[f1.post.length - 1]!.seq : 0;
    return Boolean(live && live.state === "blocked" && committed && committed.b === live.id && committed.s === "blocked" && lastPost > committed.seq);
  },
  navEntries: () => {
    const navigation = (window as unknown as { navigation?: { entries: () => Array<{ key: string; id: string; url: string; index: number }>; currentEntry: { index: number } | null } }).navigation;
    if (!navigation) return null;
    return { entries: navigation.entries().map((entry) => ({ key: entry.key, id: entry.id, path: new URL(entry.url).pathname })), index: navigation.currentEntry?.index ?? null };
  },
  armClickOnNextBlocked: (name: string) => {
    armUnsubscribe?.();
    const armedLive = f1.live()?.id ?? null;
    let fired = false;
    armUnsubscribe = router.subscribe((state) => {
      if (fired) return;
      const blocked = [...state.blockers.values()].find((blocker) => blocker.state === "blocked");
      if (!blocked || f1.idOf(blocked) === armedLive) return;
      fired = true;
      const entry: ArmRecord = {
        seq: next(), name, found: false, armedLive, live: f1.live(), committedCoordinator: lastCommittedCoordinator(),
        beforeRender: false, dialogAfterClick: false,
      };
      entry.beforeRender = Boolean(entry.live && entry.committedCoordinator && entry.committedCoordinator.b !== entry.live.id);
      const button = dialogButton(name);
      entry.found = button !== null;
      armLog.push(entry);
      try {
        button?.click();
      } catch (error) {
        entry.error = String((error as Error)?.message ?? error).slice(0, 200);
      }
      entry.dialogAfterClick = document.querySelector('.settings-departure-dialog[role="dialog"]') !== null;
      queueMicrotask(() => { armUnsubscribe?.(); armUnsubscribe = null; });
    });
    return armedLive;
  },
  armLog: () => armLog.map((entry) => ({ ...entry })),
  syncClicks: (targets: string[]) => {
    const elements = targets.map(scriptTarget);
    syncLog.push({ seq: next(), targets, found: elements.map((element) => element !== null), live: f1.live(), committedCoordinator: lastCommittedCoordinator() });
    for (const element of elements) element?.click();
    return elements.map((element) => element !== null);
  },
  syncLog: () => syncLog.map((entry) => ({ ...entry })),
  activateA: () => activate(OWNER_A),
  activateB: () => activate(OWNER_B),
  lockScope: () => viewScope(accountScope.lock(LOCKED_ID)),
  scope: () => viewScope(accountScope.capture()),
  unloadActive: () => unloadListeners.size,
  navigateWrapped: () => router.navigate !== originalNavigate,
  window: (mark: number) => ({
    attempts: after(attempts, mark).filter((entry) => entry.op !== "get"),
    locks: after(lockLog, mark),
    clicks: after(clicks, mark),
    history: after(historyCalls, mark),
    pops: after(pops, mark),
    commits: after(commits, mark),
    router: after(routerLog, mark),
    blockerCalls: after(blockerCalls, mark),
    react: after(f1.commits, mark),
    post: after(f1.post, mark),
    consoleErrors: after(consoleErrors, mark),
    errorUi: after(errorUi, mark),
    unload: after(unloadLog, mark),
    arm: after(armLog, mark),
    sync: after(syncLog, mark),
    dialogs: after(dialogLog, mark),
  }),
  hookErrors: () => f1.hookErrors,
  reactCommitsObserved: () => f1.commits.length,
  coordinatorObserved: () => f1.commits.some((entry) => entry.coord != null),
  mounted: () => mounted,
  unmount: () => {
    app.unmount();
    mounted = false;
    return document.getElementById("app")?.childElementCount ?? -1;
  },
};
(window as unknown as { verify: typeof verify }).verify = verify;

let mounted = true;
const app = createRoot(document.getElementById("app")!);
app.render(
  <WebShellProvider modules={webShellModuleRegistrations} lang="en" railPos="left" petOn={false} setPetOn={() => {}}>
    <RouterProvider router={router} />
  </WebShellProvider>,
);
