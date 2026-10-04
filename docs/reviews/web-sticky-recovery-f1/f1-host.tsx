/**
 * CP-STICKY-01 batch 10 (F1 impact review): bounded reproduction fixture. Verification only; it repairs
 * nothing, accepts nothing and changes no product file.
 *
 * Bundled by ./verify-f1.mjs from stdin with resolveDir = an immutable `git archive` of the candidate.
 * Every product module below comes from that archive; nothing is mocked. The composition follows the
 * batch-9 Sticky host fixture (../web-sticky-recovery-native/native-host.tsx, neither imported nor
 * changed): the production Shell + WebShellProvider + webShellModuleRegistrations, the production
 * ComposedSettings (sidebar + DepartureCoordinator + settingsDeparture), createBrowserRouter mounted with
 * RouterProvider from "react-router/dom" as in apps/web/src/main.tsx, synthetic accounts, no auth gate.
 * The pane under test is selected only by the route (/app/settings/<pane>).
 *
 * Fixture instruments (all log, then delegate):
 *   - attempt-level Storage tracing with a per-key setItem fault (counted before the fault decision);
 *   - Web Lock request tracing (application requests only);
 *   - history.pushState/replaceState wrappers and a popstate trace;
 *   - a router.subscribe trace (location commits and every blocker state, by object id);
 *   - router blocker proceed()/reset() wrappers: the fixture subscribes before RouterProvider, so each
 *     new "blocked" blocker object is wrapped before React state receives it; each call records the
 *     blocker's object id and the router's LIVE blocker (id, state) immediately before delegating;
 *   - a sequence-stamped console.error trace and a React Router default error element detector;
 *   - capture-phase trusted click trace for the Settings detail, sidebar and departure dialog;
 *   - the React commit observer lives in ./f1-prelude.js (window.__f1), sharing the same sequence.
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
  commits: Array<{ seq: number }>;
  post: Array<{ seq: number }>;
  hookErrors: number;
};
const f1 = (window as unknown as { __f1?: F1 }).__f1;
if (!f1) throw new Error("f1-prelude.js must run before the fixture bundle");
const next = (): number => f1.next();
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value ?? null)) as T;
const OWNER = "f1-host-A";
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
// Trusted click trace (capture phase)
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
new MutationObserver(() => {
  const heading = [...document.querySelectorAll("#app h2")].find((element) => (element.textContent ?? "").includes("Unexpected Application Error"));
  if (heading && !errorUiShown) {
    errorUiShown = true;
    errorUi.push({ seq: next(), path: location.pathname });
  } else if (!heading) {
    errorUiShown = false;
  }
}).observe(document.getElementById("app")!, { childList: true, subtree: true });

// ---------------------------------------------------------------------------------------------------
// Synthetic active account (device keys do not depend on it; the guard's decision token does)
// ---------------------------------------------------------------------------------------------------
native.set.call(realLocal, generationMarkerKey(OWNER), JSON.stringify({ generation: GENERATION, migrationId: "f1-host", previous: null }));
accountScope.activate(accountScope.lock(OWNER), GENERATION);

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
  }),
  hookErrors: () => f1.hookErrors,
  reactCommitsObserved: () => f1.commits.length,
  coordinatorObserved: () => f1.commits.some((entry) => (entry as { coord?: unknown }).coord != null),
};
(window as unknown as { verify: typeof verify }).verify = verify;

createRoot(document.getElementById("app")!).render(
  <WebShellProvider modules={webShellModuleRegistrations} lang="en" railPos="left" petOn={false} setPetOn={() => {}}>
    <RouterProvider router={router} />
  </WebShellProvider>,
);
