/**
 * CP-APPRAIL-01 batch 58 (contract r1 §12 "Rail F1-shape before", §15 E5; reruns unchanged for E16): AppRail order
 * F1-shape host fixture. Verification only; it repairs nothing, accepts nothing and changes no product file.
 *
 * A copy of ../web-appearance-recovery-f1/f1-appearance-host.tsx (SHA-256
 * 19b4601f971c8892e674651244541f7e9635027dc5fe2cb56187a9a71a3dadef, checked by the runner; the original is read,
 * never modified) with only these changes: this header; the synthetic account, session, marker-migration and
 * confirm-probe names (f1-appearance -> f1-railorder); the Appearance-only label imports (dark, ocean)
 * replaced by the rail labels (nav) of the archive's own I18N; a PASSIVE capture-phase drag recorder (dragstart,
 * dragenter, dragover, dragleave, drop, dragend with isTrusted; it never calls preventDefault or stopPropagation);
 * and read-only verify fields for the rail (button names, the rail-order Topbar status of contract §5, the lock name of
 * xai_rail_order) plus `drags` in the windowed view.
 *
 * Bundled by ./verify-f1-railorder.mjs from stdin with resolveDir = an immutable `git archive` of the revision
 * under test. Every product module below comes from that archive; nothing is mocked or patched.
 *
 * Composition (contract r1 §9 "Composition"; rail cases f1–f3 need App.handleSignOut, the AppRail and the coordinator):
 *   - the production App composition of apps/web/src/main.tsx, as in ../web-appearance-recovery-native/native-app.tsx:
 *     the main.tsx module order (observability runtime, AppProviders, router module, service-worker module,
 *     @repo/plugin-web-tokens, global.css; evaluated only), the production router INSTANCE of router.tsx
 *     (createBrowserRouter(webHostRouteObjects)) under RouterProvider from "react-router/dom", and the production
 *     WebAuthSessionProvider with onIdentityChange = the production invalidateAccountIdentity;
 *   - so /app/* renders ProtectedAppRouteElement -> App (AccountStorageGate -> AccountDataGate -> Shell with AppRail,
 *     AvatarMenu/SignOutConfirmDialog and Topbar, DesktopPet, CommandPalette) and /app/settings/* renders the
 *     production ComposedSettings with the DepartureCoordinator and the settingsDeparture delegate that
 *     App.handleSignOut awaits; the coordinator is the one the frozen F1 runners observe
 *     (../web-sticky-recovery-f1/f1-host.tsx and ../web-features-recovery-f1/f1-features-host.tsx, neither imported
 *     nor changed).
 * The ONLY synthetic input is the auth session: the provider receives a client whose auth.getSession resolves one
 * authenticated session for a synthetic account (the legacy provider branch; App.handleSignOut therefore takes its
 * fallback branch: requestSettingsDeparture("sign-out") -> invalidateAccountIdentity(null) -> client.auth.signOut()
 * -> clearSessionStorage() -> window.location.assign("/")). Fixture setup writes the account's committed
 * generation marker (uninstrumented) before the first render so the production AccountDataGate can activate it.
 *
 * The frozen ../web-sticky-recovery-f1/f1-prelude.js (React commit observer, window.__f1) runs before this bundle
 * and is reused read-only; every instrument below shares its sequence. Fixture instruments (all log, then delegate):
 *   - attempt-level Storage tracing with per-key setItem (QuotaExceededError) and removeItem (SecurityError) faults,
 *     recorded before the fault decision; a fault never reaches storage;
 *   - a Web Lock request trace; history.pushState/replaceState wrappers and a popstate trace;
 *   - a router-level navigate trace: a wrapper installed on the production router before RouterProvider renders, so
 *     the DepartureCoordinator's own navigate wrapper delegates to it; a call reaching it is a navigation that
 *     reached the router (a held programmatic intent is replayed through it exactly once on release);
 *   - a router.subscribe trace (location commits and every blocker state, by object id) and blocker proceed()/reset()
 *     wrappers that record the blocker's id and the router's LIVE blocker (id, state) immediately before delegating;
 *   - the instrumented window.dispatchEvent (StorageEvent keys), a sequence-stamped console.error trace and an error UI
 *     detector (React Router's default error element and the production RouteErrorBoundary heading);
 *   - an account-scope transition log, auth call counters (getSession, signOut) and a capture-phase trusted click trace;
 *   - fixture self-tests (faults, dispatch counter, confirm) that touch only the probe key xai_f1_selftest.
 */
import "./apps/web/src/observability/runtime";
import "./apps/web/src/providers/AppProviders";
import { router } from "./apps/web/src/routes/router";
import "./apps/web/src/service-worker/register";
import "@repo/plugin-web-tokens";
import "./apps/web/src/styles/global.css";
import * as React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router/dom";
import { WebAuthSessionProvider } from "@repo/web-auth-device-session/web";
import { invalidateAccountIdentity } from "./apps/web/src/providers/AccountStorageGate";
import { accountScope, generationMarkerKey, prefMutationLockName } from "@repo/plugin-web-storage";
import { I18N } from "@repo/plugin-web-tokens";

type F1 = {
  seq: number;
  next: () => number;
  idOf: (object: unknown) => number | null;
  live: () => { id: number | null; state: string } | null;
  router: unknown;
  commits: Array<{ seq: number; coord?: unknown }>;
  post: Array<{ seq: number }>;
  hookErrors: number;
};
const f1 = (window as unknown as { __f1?: F1 }).__f1;
if (!f1) throw new Error("the frozen f1-prelude.js must run before the fixture bundle");
const next = (): number => f1.next();
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value ?? null)) as T;
const OWNER = "f1-railorder-A";
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
const deniedRemove = new Set<string>();
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
    throw new DOMException("fixture denied write", "QuotaExceededError");
  }
  native.set.call(this, key, value);
};
proto.removeItem = function removeItem(this: Storage, key: string): void {
  const name = String(key);
  const entry: Attempt = { seq: next(), op: "remove", key: name, outcome: "ok" };
  if (this === realLocal) attempts.push(entry);
  if (this === realLocal && deniedRemove.has(name)) {
    entry.outcome = "denied";
    throw new DOMException("fixture denied remove", "SecurityError");
  }
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
// Instrumented window.dispatchEvent (StorageEvent counter)
// ---------------------------------------------------------------------------------------------------
const storageDispatches: Array<{ seq: number; key: string | null }> = [];
const nativeDispatch = window.dispatchEvent;
window.dispatchEvent = function dispatchEvent(this: Window, event: Event): boolean {
  if (event instanceof StorageEvent) storageDispatches.push({ seq: next(), key: event.key });
  return nativeDispatch.call(this, event);
};

// ---------------------------------------------------------------------------------------------------
// Trusted click trace (capture phase, every control)
// ---------------------------------------------------------------------------------------------------
const clicks: Array<{ seq: number; trusted: boolean; target: string }> = [];
document.addEventListener("click", (event) => {
  const target = event.target as Element | null;
  const control = target?.closest?.("button,[role=switch],[role=menuitemradio],.list-row,a");
  if (!control) return;
  clicks.push({ seq: next(), trusted: event.isTrusted, target: (control.getAttribute("aria-label") ?? control.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 80) });
}, true);

// ---------------------------------------------------------------------------------------------------
// PASSIVE drag recorder (capture phase; never preventDefault or stopPropagation; contract r1 §6 item 8)
// ---------------------------------------------------------------------------------------------------
type DragEntry = { seq: number; type: string; trusted: boolean; target: string | null; inRailItems: boolean; railButton: boolean };
const drags: DragEntry[] = [];
for (const type of ["dragstart", "dragenter", "dragover", "dragleave", "drop", "dragend"]) {
  window.addEventListener(type, (event) => {
    const element = event.target instanceof Element ? event.target : null;
    const control = element?.closest?.("button") ?? null;
    drags.push({
      seq: next(), type, trusted: event.isTrusted,
      target: control ? (control.getAttribute("aria-label") ?? control.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 80) : element ? element.tagName.toLowerCase() : null,
      inRailItems: Boolean(element?.closest?.(".app-rail .rail-items")),
      railButton: Boolean(control && control.classList.contains("rail-btn") && control.closest(".app-rail .rail-items")),
    });
  }, true);
}

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
const errorUi: Array<{ seq: number; path: string; text: string }> = [];
let errorUiShown = false;
new MutationObserver(() => {
  const heading = [...document.querySelectorAll("#app h1, #app h2")].find((element) => /Unexpected Application Error|^Route Error \(/.test((element.textContent ?? "").trim()));
  if (heading && !errorUiShown) {
    errorUiShown = true;
    errorUi.push({ seq: next(), path: location.pathname, text: (heading.closest("main")?.textContent ?? heading.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 200) });
  } else if (!heading) {
    errorUiShown = false;
  }
}).observe(document.getElementById("app")!, { childList: true, subtree: true });

// ---------------------------------------------------------------------------------------------------
// The only synthetic input: the auth session. Fixture setup: the account's committed generation marker.
// ---------------------------------------------------------------------------------------------------
if (native.get.call(realLocal, generationMarkerKey(OWNER)) === null) {
  native.set.call(realLocal, generationMarkerKey(OWNER), JSON.stringify({ generation: GENERATION, migrationId: "f1-railorder-host", previous: null }));
}
const now = new Date("2026-10-04T00:00:00.000Z").toISOString();
const session = {
  access_token: "f1-railorder-access-token",
  refresh_token: "f1-railorder-refresh-token",
  token_type: "bearer",
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  user: {
    id: OWNER, aud: "authenticated", role: "authenticated", email: "f1-railorder-a@example.invalid",
    app_metadata: { provider: "email", providers: ["email"] }, user_metadata: {}, identities: [],
    created_at: now, updated_at: now, is_anonymous: false,
  },
};
const authCalls: Array<{ seq: number; call: string }> = [];
const syntheticClient = {
  auth: {
    getSession: async () => { authCalls.push({ seq: next(), call: "getSession" }); return { data: { session }, error: null }; },
    onAuthStateChange: () => { authCalls.push({ seq: next(), call: "onAuthStateChange" }); return { data: { subscription: { unsubscribe: () => {} } } }; },
    signOut: async () => { authCalls.push({ seq: next(), call: "signOut" }); return { error: null }; },
  },
};
type ScopeEntry = { seq: number; kind: string; accountId: string | null; generation: string | null; epoch: number };
const scopeLog: ScopeEntry[] = [];
const recordScope = (): void => {
  const scope = accountScope.capture();
  scopeLog.push({ seq: next(), kind: scope.kind, accountId: scope.accountId, generation: scope.generation, epoch: scope.epoch });
};
recordScope();
accountScope.subscribe(recordScope);

// ---------------------------------------------------------------------------------------------------
// The production router instance: router-level navigate trace, router trace and blocker wrappers
// (installed before RouterProvider renders, so they precede the product's own subscribers and wrappers)
// ---------------------------------------------------------------------------------------------------
f1.router = router;
type NavigateCall = { seq: number; to: string; toPath: string | null; replace: boolean; path: string };
const navigateCalls: NavigateCall[] = [];
const routerNavigate = router.navigate;
router.navigate = function routerLevelNavigateTrace(this: unknown, ...args: unknown[]) {
  const [to, options] = args as [unknown, { replace?: boolean } | undefined];
  const toPath = typeof to === "string" ? to.split(/[?#]/)[0] ?? null
    : to !== null && typeof to === "object" && typeof (to as { pathname?: unknown }).pathname === "string" ? (to as { pathname: string }).pathname : null;
  navigateCalls.push({ seq: next(), to: typeof to === "number" ? `delta:${to}` : typeof to === "string" ? to : JSON.stringify(to), toPath, replace: Boolean(options?.replace), path: location.pathname });
  return Reflect.apply(routerNavigate, router, args);
} as typeof router.navigate;
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
const nameOf = (element: Element): string => (element.getAttribute("aria-label") ?? element.textContent ?? "").replace(/\s+/g, " ").trim();
const after = <T extends { seq: number }>(list: readonly T[], mark: number): T[] => list.filter((entry) => entry.seq > mark);
const PROBE_KEY = "xai_f1_selftest";
const KEYS = ["xai_pref_lang", "xai_pref_theme", "xai_pref_density", "xai_pref_font_scale", "xai_accent_hue", "xai_rail_pos", "xai_bg_tone"] as const;
const MORE_KEY = "xai_pref_more_launch_at_login";
const RAIL_KEY = "xai_rail_order";

const verify = {
  router,
  owner: OWNER,
  markerKey: generationMarkerKey(OWNER),
  keys: [...KEYS],
  moreKey: MORE_KEY,
  railKey: RAIL_KEY,
  lockNames: Object.fromEntries([...KEYS, MORE_KEY, RAIL_KEY].map((key) => [key, prefMutationLockName(key)])),
  labels: {
    appearance: { en: (I18N.en.settings as unknown as Record<string, string>).appearance, zh: (I18N.zh.settings as unknown as Record<string, string>).appearance },
    signOut: { en: (I18N.en.avatar as unknown as Record<string, string>).sign_out, zh: (I18N.zh.avatar as unknown as Record<string, string>).sign_out },
    nav: { en: { ...(I18N.en.nav as unknown as Record<string, string>) }, zh: { ...(I18N.zh.nav as unknown as Record<string, string>) } },
  },
  /** The rail module buttons in DOM order (accessible names). */
  railNames: () => [...document.querySelectorAll(".app-rail .rail-items .rail-btn")].map((element) => element.getAttribute("aria-label")),
  /** The contract r1 §5 Topbar rail-order status (absent at the before revision by construction of the contract). */
  railOrderStatus: () => {
    const element = document.querySelector('[data-testid="rail-order-status"]');
    if (!element) return null;
    return { name: nameOf(element), text: text(element), tag: element.tagName.toLowerCase(), inTopbarControls: Boolean(element.closest(".topbar-controls")) };
  },
  mark: () => f1.seq,
  denySet: (key: string) => { deniedSet.add(key); },
  denyRemove: (key: string) => { deniedRemove.add(key); },
  allow: (key: string) => { deniedSet.delete(key); deniedRemove.delete(key); },
  restore: () => { deniedSet.clear(); deniedRemove.clear(); },
  faults: () => ({ set: [...deniedSet], remove: [...deniedRemove] }),
  /** Uninstrumented seeding (fixture setup; never counted as an application attempt). */
  seed: (key: string, value: string | null) => { if (value === null) native.remove.call(realLocal, key); else native.set.call(realLocal, key, value); },
  physical: (key: string) => native.get.call(realLocal, key),
  location: () => ({ pathname: router.state.location.pathname, key: router.state.location.key, state: clone(router.state.location.state ?? null) }),
  windowPath: () => location.pathname,
  historyStateKey: () => keyOfState(history.state),
  paneId: () => document.querySelector(".settings-detail")?.getAttribute("data-pane") ?? null,
  ready: () => Boolean(document.querySelector(".app header.topbar")) && !document.querySelector(".account-data-gate") && accountScope.capture().kind === "account",
  dialog: () => {
    const dialog = document.querySelector('.settings-departure-dialog[role="dialog"]');
    return dialog ? { label: dialog.getAttribute("aria-label"), text: text(dialog.querySelector("p")), buttons: [...dialog.querySelectorAll("button")].map(text) } : null;
  },
  signOutDialogOpen: () => Boolean((document.querySelector("dialog.xai-sign-out-dialog") as HTMLDialogElement | null)?.open),
  avatarMenuOpen: () => Boolean(document.querySelector(".avatar-menu")),
  topbarPopoverOpen: () => Boolean(document.querySelector('.topbar #topbar-pref-panel[role="dialog"]')),
  appearanceStatus: () => {
    const element = document.querySelector('[data-testid="appearance-status"]');
    if (!element) return null;
    const controls = element.closest(".topbar-controls");
    return { name: nameOf(element), text: text(element), tag: element.tagName.toLowerCase(), inTopbarControls: Boolean(controls) };
  },
  alerts: () => [...document.querySelectorAll('.settings-detail [role="alert"],.settings-detail [role="status"]')].map(text),
  detailText: () => text(document.querySelector(".settings-detail")),
  buttons: () => [...document.querySelectorAll(".settings-detail button")].map(nameOf),
  scope: () => {
    const scope = accountScope.capture();
    return { kind: scope.kind, accountId: scope.accountId, generation: scope.generation, epoch: scope.epoch };
  },
  authCalls: () => authCalls.map((entry) => entry.call),
  window: (mark: number) => ({
    attempts: after(attempts, mark).filter((entry) => entry.op !== "get"),
    locks: after(lockLog, mark),
    clicks: after(clicks, mark),
    history: after(historyCalls, mark),
    pops: after(pops, mark),
    commits: after(commits, mark),
    router: after(routerLog, mark),
    blockerCalls: after(blockerCalls, mark),
    navigateCalls: after(navigateCalls, mark),
    storageDispatches: after(storageDispatches, mark),
    react: after(f1.commits, mark),
    post: after(f1.post, mark),
    consoleErrors: after(consoleErrors, mark),
    errorUi: after(errorUi, mark),
    scope: after(scopeLog, mark),
    auth: after(authCalls, mark),
    drags: after(drags, mark),
  }),
  hookErrors: () => f1.hookErrors,
  reactCommitsObserved: () => f1.commits.length,
  coordinatorObserved: () => f1.commits.some((entry) => entry.coord != null),
  /** Fixture self-test on the probe key only: set/remove faults throw and never reach storage; delegation works. */
  probeFaults: () => {
    const mark = f1.seq;
    const out: Record<string, unknown> = {};
    deniedSet.add(PROBE_KEY);
    try { localStorage.setItem(PROBE_KEY, "1"); out.setDeniedThrew = false; } catch (error) { out.setDeniedThrew = error instanceof DOMException && error.name === "QuotaExceededError"; }
    out.setDeniedNeverStored = native.get.call(realLocal, PROBE_KEY) === null;
    deniedSet.delete(PROBE_KEY);
    localStorage.setItem(PROBE_KEY, "1");
    out.setDelegated = native.get.call(realLocal, PROBE_KEY) === "1";
    deniedRemove.add(PROBE_KEY);
    try { localStorage.removeItem(PROBE_KEY); out.removeDeniedThrew = false; } catch (error) { out.removeDeniedThrew = error instanceof DOMException && error.name === "SecurityError"; }
    out.removeDeniedKeptBytes = native.get.call(realLocal, PROBE_KEY) === "1";
    deniedRemove.delete(PROBE_KEY);
    localStorage.removeItem(PROBE_KEY);
    out.removeDelegated = native.get.call(realLocal, PROBE_KEY) === null;
    out.attemptsLogged = after(attempts, mark).filter((entry) => entry.key === PROBE_KEY && entry.op !== "get").map((entry) => `${entry.op}:${entry.outcome}`);
    return out;
  },
  /** Dispatch counter self-test with a keyed probe event (no listener in this host reacts to PROBE_KEY). */
  probeDispatch: () => {
    const mark = f1.seq;
    window.dispatchEvent(new StorageEvent("storage", { key: PROBE_KEY, storageArea: localStorage }));
    return after(storageDispatches, mark).map((entry) => String(entry.key));
  },
  confirmResult: null as boolean | null,
  probeConfirm: () => { verify.confirmResult = window.confirm("f1 railorder selfcheck: dialog plumbing probe"); return verify.confirmResult; },
};
(window as unknown as { verify: typeof verify }).verify = verify;

createRoot(document.getElementById("app")!).render(
  <WebAuthSessionProvider client={syntheticClient as never} onIdentityChange={invalidateAccountIdentity}>
    <RouterProvider router={router} />
  </WebAuthSessionProvider>,
);
