/**
 * Parent-role actual-host before oracles for the Settings Features caller (CP-FEATURES-01, control-plane
 * batch 23, contract section 14 item E3). Executed only through ./verify-fixed.mjs, which copies this file into
 * an immutable `git archive` of the requested product revision.
 *
 * Authority: ../web-features-recovery-contract/contract.md sections 3 (items 5, 6, 8 and 12), 5 (normative
 * wording), 6 (reset), 7 (continuity), 9 (guard, host matrix, beforeunload) and 12 ("Parent host baseline",
 * "Validity and positive controls", H8, with H1 and H5 at host level); ../20260908-full-product-audit/
 * CURRENT-CONTROL-PLANE.md, CP-FEATURES-01 (including the AccountDataGate source fact) and batch 23.
 *
 * Composition under test, all taken from the archive and none of it mocked:
 *   - the production router factory createBrowserRouter over jsdom's History, so browser Back and Forward are
 *     real POP traversals that reach the coordinator's blocker;
 *   - under /app, the production AccountDataGate (mounted as AccountStorageGate mounts it, for a signed-in
 *     account with a committed generation marker) around WebShellProvider (production
 *     webShellModuleRegistrations) and the production Shell, whose Outlet renders the child routes;
 *   - the production ComposedSettings (composedSettingsRegistration), its DepartureCoordinator and the
 *     requestSettingsDeparture("sign-out") preflight that App.handleSignOut awaits;
 *   - the real Features pane, its shared SettingsFooter, legacy usePref/setPref, the async storage hook and
 *     engine, registry, codec and accountScope.
 * Test-owned fixtures: an attempt-logging localStorage injector whose set/remove faults fire before delegation,
 * an exclusive FIFO Web Lock manager installed as navigator.locks, a window.confirm recorder, a StorageEvent
 * dispatch counter, pushState/replaceState counters, a runtime-error recorder and jsdom shims (Node's
 * AbortController for router Requests, ResizeObserver, requestAnimationFrame).
 *
 * Every business oracle states the fixed-product requirement. At f359be6 they are expected to fail wherever H1,
 * H5 and H8 hold. A `PRECONDITION:` error is a fixture or selector failure and is never a product result.
 * `OBSERVED` console lines record facts (notably what the reset's key:null StorageEvent does to AccountDataGate);
 * they are never assertions.
 */
import * as React from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, within } from "@testing-library/react";
import { transferableAbortController } from "node:util";
import { createBrowserRouter, RouterProvider, useBlocker, useParams } from "react-router";
import { Shell, WebShellProvider } from "@repo/xai-web-shell";
import { AccountDataGate, accountScope, generationMarkerKey } from "@repo/plugin-web-storage";
import { featureIdOrder, featurePrefKey } from "@repo/plugin-web-settings-features-panel";
import { I18N } from "@repo/plugin-web-tokens";
import { webShellModuleRegistrations } from "../../../apps/web/src/routes/modules/shellRegistrations";
import { composedSettingsRegistration } from "../../../apps/web/src/routes/modules/composedSettingsRegistration";
import { requestSettingsDeparture } from "../../../apps/web/src/routes/modules/settingsDeparture";

// ---------------------------------------------------------------------------------------------------
// Scenario constants
// ---------------------------------------------------------------------------------------------------

const FEATURES = "/app/settings/features";
const HOTKEYS = "/app/settings/hotkeys";
const TASKS = "/app/tasks";
const DASHBOARD = "/app/dashboard";
/** Coordinator dialog name for the required guard label "Features" (contract sections 5 and 9). */
const DIALOG = "Unsaved Features draft";
/** The existing visible label of Reset to defaults (contract sections 2, 5 and 6). */
const RESET = "Reset to defaults";
const OWNER = "features-host-parent-A";
const GENERATION = "g1";

type FieldId = "tasks" | "board" | "dashboard" | "calendar" | "matrix" | "pomodoro" | "habits" | "meditation";
type Bytes = "true" | "false";
interface FieldCase {
  readonly field: FieldId;
  /** EN module label (`nav.<id>`, contract sections 2 and 5). */
  readonly label: string;
  /** Exact unscoped device key (`xai_pref_features_<id>`). */
  readonly key: string;
  /** Valid stored bytes seeded before mount; alternating, so both toggle directions are exercised. */
  readonly seed: Bytes;
  /** The valid latest choice (the inverse of the seed) whose physical write is denied. */
  readonly next: Bytes;
}

const FIELDS: readonly FieldCase[] = [
  { field: "tasks", label: "Tasks", key: "xai_pref_features_tasks", seed: "true", next: "false" },
  { field: "board", label: "Boards", key: "xai_pref_features_board", seed: "false", next: "true" },
  { field: "dashboard", label: "Dashboard", key: "xai_pref_features_dashboard", seed: "true", next: "false" },
  { field: "calendar", label: "Calendar", key: "xai_pref_features_calendar", seed: "false", next: "true" },
  { field: "matrix", label: "Matrix", key: "xai_pref_features_matrix", seed: "true", next: "false" },
  { field: "pomodoro", label: "Pomodoro", key: "xai_pref_features_pomodoro", seed: "false", next: "true" },
  { field: "habits", label: "Habits", key: "xai_pref_features_habits", seed: "true", next: "false" },
  { field: "meditation", label: "Meditation", key: "xai_pref_features_meditation", seed: "false", next: "true" },
];
const FEATURE_KEYS = FIELDS.map(entry => entry.key);
/** Representative failed toggle for every H8 navigation form. */
const BOARD = FIELDS[1]!;
/** The key whose removeItem is denied in the failed Reset to defaults. */
const CALENDAR = FIELDS[3]!;

// ---------------------------------------------------------------------------------------------------
// Validity helpers
// ---------------------------------------------------------------------------------------------------

function pre(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`PRECONDITION: ${message}`);
}

function need<T>(value: T | null | undefined, message: string): T {
  pre(value !== null && value !== undefined, message);
  return value as T;
}

async function flush(rounds = 12): Promise<void> {
  await act(async () => {
    for (let round = 0; round < rounds; round += 1) await new Promise(resolve => setTimeout(resolve, 0));
  });
}

/** Bounded wait for fixture progress (never used to wait out a business assertion). */
async function until(predicate: () => boolean, rounds = 60): Promise<boolean> {
  for (let round = 0; round < rounds && !predicate(); round += 1) await flush(1);
  return predicate();
}

/** A fact recorded in the log; never an assertion. */
function observed(label: string, fact: unknown): void {
  console.info(`OBSERVED ${label} ${JSON.stringify(fact)}`);
}

// ---------------------------------------------------------------------------------------------------
// Attempt-logging localStorage injector (attempts are recorded before delegation; faults never delegate)
// ---------------------------------------------------------------------------------------------------

type StorageOp = "get" | "set" | "remove";
interface Attempt {
  readonly op: StorageOp;
  readonly key: string;
  readonly value?: string;
  threw: boolean;
}

const nativeGet = Storage.prototype.getItem;
const nativeSet = Storage.prototype.setItem;
const nativeRemove = Storage.prototype.removeItem;
const attempts: Attempt[] = [];
const deniedSets = new Set<string>();
const deniedRemoves = new Set<string>();

function installStorageInjector(): void {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(function getItem(this: Storage, key: string) {
    if (this === window.localStorage) attempts.push({ op: "get", key: String(key), threw: false });
    return nativeGet.call(this, key);
  });
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(function setItem(this: Storage, key: string, value: string) {
    if (this !== window.localStorage) return nativeSet.call(this, key, value);
    const attempt: Attempt = { op: "set", key: String(key), value: String(value), threw: false };
    attempts.push(attempt);
    if (deniedSets.has(String(key))) {
      attempt.threw = true;
      throw new DOMException(`host fixture denied setItem(${String(key)})`, "QuotaExceededError");
    }
    return nativeSet.call(this, key, value);
  });
  vi.spyOn(Storage.prototype, "removeItem").mockImplementation(function removeItem(this: Storage, key: string) {
    if (this !== window.localStorage) return nativeRemove.call(this, key);
    const attempt: Attempt = { op: "remove", key: String(key), threw: false };
    attempts.push(attempt);
    if (deniedRemoves.has(String(key))) {
      attempt.threw = true;
      throw new DOMException(`host fixture denied removeItem(${String(key)})`, "SecurityError");
    }
    return nativeRemove.call(this, key);
  });
}

const raw = (key: string): string | null => nativeGet.call(window.localStorage, key);
const featureWrites = (from = 0): Attempt[] => attempts.slice(from).filter(entry => entry.op !== "get" && FEATURE_KEYS.includes(entry.key));
const accountWrites = (from = 0): Attempt[] => attempts.slice(from).filter(entry => entry.op !== "get" && /^xai:(account|demo):/.test(entry.key));

// ---------------------------------------------------------------------------------------------------
// Exclusive FIFO Web Lock manager (shared cohorts; any other request shape is rejected and recorded)
// ---------------------------------------------------------------------------------------------------

type LockMode = "shared" | "exclusive";
interface LockState {
  readers: number;
  writer: boolean;
  readonly queue: Array<{ readonly mode: LockMode; readonly enter: () => void }>;
}

function createLockManager() {
  const states = new Map<string, LockState>();
  const requests: Array<{ readonly name: string; readonly mode: LockMode }> = [];
  const unsupported: string[] = [];
  function request<T>(name: string, options: unknown, callback?: unknown): Promise<T> {
    const run = (typeof options === "function" ? options : callback) as ((lock: unknown) => T | Promise<T>) | undefined;
    const settings = (typeof options === "object" && options !== null ? options : {}) as Record<string, unknown>;
    const mode = (settings.mode ?? "exclusive") as LockMode;
    const extra = Object.keys(settings).filter(key => key !== "mode");
    if (typeof run !== "function" || extra.length > 0 || (mode !== "shared" && mode !== "exclusive")) {
      unsupported.push(`${String(name)} ${JSON.stringify(Object.keys(settings))}`);
      return Promise.reject(new DOMException("unsupported Web Lock request shape in the host fixture", "NotSupportedError"));
    }
    requests.push({ name, mode });
    const state = states.get(name) ?? { readers: 0, writer: false, queue: [] };
    states.set(name, state);
    const drain = (): void => {
      while (state.queue.length > 0 && !state.writer) {
        const next = state.queue[0]!;
        if (next.mode === "exclusive" && state.readers > 0) return;
        state.queue.shift();
        next.enter();
        if (next.mode === "exclusive") return;
      }
    };
    return new Promise<T>((resolve, reject) => {
      state.queue.push({
        mode,
        enter: () => {
          if (mode === "shared") state.readers += 1;
          else state.writer = true;
          const release = (): void => {
            if (mode === "shared") state.readers -= 1;
            else state.writer = false;
            drain();
          };
          // Grants are asynchronous, as in a browser.
          Promise.resolve()
            .then(() => run({ name, mode }))
            .then(value => { release(); resolve(value as T); }, error => { release(); reject(error); });
        },
      });
      drain();
    });
  }
  return { request, requests, unsupported };
}

let locks = createLockManager();

// ---------------------------------------------------------------------------------------------------
// window.confirm recorder, StorageEvent dispatch counter, history write counters, runtime-error recorder
// ---------------------------------------------------------------------------------------------------

const confirmCalls: string[] = [];
let confirmAnswer = true;
function recordConfirm(message?: string): boolean {
  confirmCalls.push(String(message));
  return confirmAnswer;
}
let savedConfirm: typeof window.confirm | null = null;

const storageEvents: Array<{ readonly key: string | null }> = [];
const nativeDispatch = window.dispatchEvent;
function countingDispatch(this: unknown, event: Event): boolean {
  if (event instanceof StorageEvent) storageEvents.push({ key: event.key });
  return nativeDispatch.call(window, event);
}

let historyCounters: { readonly push: { mock: { calls: unknown[] } }; readonly replace: { mock: { calls: unknown[] } } } | null = null;
const historyWrites = (): number => (historyCounters ? historyCounters.push.mock.calls.length + historyCounters.replace.mock.calls.length : 0);

const runtimeErrors: string[] = [];
function onWindowError(event: ErrorEvent): void {
  runtimeErrors.push(`window error: ${event.error instanceof Error ? event.error.message : String(event.message)}`);
}
function onUnhandledRejection(reason: unknown): void {
  runtimeErrors.push(`unhandled rejection: ${reason instanceof Error ? reason.message : String(reason)}`);
}

// ---------------------------------------------------------------------------------------------------
// Actual host: production AccountDataGate + WebShellProvider + Shell + ComposedSettings behind the production
// browser router factory
// ---------------------------------------------------------------------------------------------------

const ComposedSettings = need(
  composedSettingsRegistration.children.find(child => child.path === "*"),
  "composedSettingsRegistration exposes its splat child",
).render as unknown as React.ComponentType;
const noop = (): void => {};

function HostFrame(): React.ReactElement {
  return (
    <AccountDataGate accountId={OWNER} authenticated demo={false} lang="en">
      <WebShellProvider modules={webShellModuleRegistrations} lang="en" railPos="left" petOn={false} setPetOn={noop}>
        <Shell lang="en" setLang={noop} theme="light" setTheme={noop} density="comfortable" setDensity={noop} />
      </WebShellProvider>
    </AccountDataGate>
  );
}

function ModuleDestination(): React.ReactElement {
  const { moduleId } = useParams();
  return <div data-testid="module-destination">{moduleId}</div>;
}

const routers: Array<ReturnType<typeof createBrowserRouter>> = [];

async function mountHost(path: string) {
  window.history.replaceState(null, "", path);
  const router = createBrowserRouter([
    {
      path: "/app",
      element: <HostFrame />,
      children: [
        { path: "settings/*", element: <ComposedSettings /> },
        { path: ":moduleId/*", element: <ModuleDestination /> },
      ],
    },
  ]);
  routers.push(router);
  const ui = render(<RouterProvider router={router} />);
  await flush();
  pre(router.state.location.pathname === path, `router mounted at ${path}; saw ${router.state.location.pathname}`);
  return { ui, router };
}
type Host = Awaited<ReturnType<typeof mountHost>>;

// ---------------------------------------------------------------------------------------------------
// Features controls (stable selectors only) and the host's departure producers
// ---------------------------------------------------------------------------------------------------

function featuresPane(): HTMLElement {
  return need(
    document.querySelector<HTMLElement>('section.settings-detail[data-pane="features"]'),
    "the Features pane is mounted in the production .settings-detail section",
  );
}

function only<T extends Element>(nodes: ArrayLike<T>, what: string): T {
  pre(nodes.length === 1, `exactly one ${what}; found ${nodes.length}`);
  return nodes[0]!;
}

const switchOf = (entry: FieldCase): HTMLElement =>
  only(featuresPane().querySelectorAll<HTMLElement>(`[data-feature-id="${entry.field}"] [role="switch"]`), `[data-feature-id="${entry.field}"] [role="switch"]`);

/** The value the switch currently presents to the user, in stored-byte form. */
const displayed = (entry: FieldCase): string => switchOf(entry).getAttribute("aria-checked") ?? "(no aria-checked)";

/** One valid user edit through the field's real switch. */
function edit(entry: FieldCase): void {
  fireEvent.click(switchOf(entry));
}

function resetControl(): HTMLElement {
  return only(within(featuresPane()).queryAllByRole("button", { name: RESET }), `"${RESET}" button (role and name) in the Features pane`);
}

/** Activates Reset to defaults with an accepted confirmation (the recorder answers true). */
function acceptedReset(): void {
  confirmAnswer = true;
  fireEvent.click(resetControl());
}

function sidebarRow(name: string): HTMLElement {
  const sidebar = need(document.querySelector<HTMLElement>(".settings-sidebar"), "the production Settings sidebar is mounted");
  return only(within(sidebar).queryAllByRole("button", { name }), `Settings sidebar row "${name}"`);
}

function railButton(name: string): HTMLElement {
  const rail = need(document.querySelector<HTMLElement>(".app-rail"), "the production AppRail is mounted");
  return only(within(rail).queryAllByRole("button", { name }), `AppRail button "${name}"`);
}

/** Route, URL, host chrome, active account, gate state, lock fixture and dialog state. */
function expectHostReady(host: Host, path: string, when: string): void {
  pre(host.router.state.location.pathname === path, `${when}: router at ${path}; saw ${host.router.state.location.pathname}`);
  pre(window.location.pathname === path, `${when}: URL at ${path}; saw ${window.location.pathname}`);
  pre(document.querySelector(".settings-sidebar") !== null || !path.startsWith("/app/settings"), `${when}: the production Settings sidebar is mounted`);
  pre(document.querySelector(".app-rail") !== null, `${when}: the production AppRail is mounted`);
  const scope = accountScope.capture();
  pre(scope.kind === "account" && scope.accountId === OWNER && scope.generation === GENERATION,
    `${when}: AccountDataGate has account ${OWNER} generation ${GENERATION} active in the real accountScope; saw ${JSON.stringify(scope)}`);
  pre(document.querySelector(".account-data-gate") === null, `${when}: the account gate screen is not shown`);
  pre((navigator as unknown as { locks?: unknown }).locks === locks, `${when}: the exclusive Web Lock fixture is navigator.locks`);
  pre(host.ui.queryByRole("dialog") === null, `${when}: no dialog is open`);
}

/** expectHostReady on Features, plus every seeded byte present and displayed by its switch. */
function expectFeaturesReady(host: Host, when: string): void {
  expectHostReady(host, FEATURES, when);
  featuresPane();
  for (const entry of FIELDS) {
    pre(raw(entry.key) === entry.seed, `${when}: seeded bytes ${entry.key}=${entry.seed} present; saw ${String(raw(entry.key))}`);
    pre(displayed(entry) === entry.seed, `${when}: the ${entry.label} switch displays its seeded ${entry.seed}; saw ${displayed(entry)}`);
  }
}

/** Arms a physical setItem denial for the field's key, edits once and proves the armed fault fired. */
async function failedEdit(entry: FieldCase): Promise<void> {
  deniedSets.add(entry.key);
  const start = attempts.length;
  edit(entry);
  const fired = (): boolean => attempts.slice(start).some(item => item.op === "set" && item.key === entry.key && item.threw);
  pre(await until(fired), `the armed setItem fault on ${entry.key} fired (a write attempt was observed and thrown)`);
  await flush();
  pre(raw(entry.key) === entry.seed, `the denied write left ${entry.key} at its seeded bytes ${entry.seed}; saw ${String(raw(entry.key))}`);
  pre(locks.unsupported.length === 0, `no unsupported Web Lock request shape was seen: ${locks.unsupported.join("; ")}`);
}

async function requestSignOut(): Promise<{ outcome: unknown }> {
  const box: { outcome: unknown } = { outcome: "pending" };
  await act(async () => {
    void requestSettingsDeparture("sign-out").then(value => { box.outcome = value; });
  });
  await flush();
  return box;
}

/** jsdom has no BeforeUnloadEvent; a warning is a canceled cancelable event (accepted-caller convention). */
function dispatchBeforeUnload(): { prevented: boolean; storageAttempts: number } {
  const start = attempts.length;
  const event = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(event);
  return { prevented: event.defaultPrevented, storageAttempts: attempts.length - start };
}

interface DepartureStart {
  readonly location: { readonly pathname: string; readonly key: string; readonly state: unknown };
  readonly historyLength: number;
  readonly historyEntry: string;
  readonly historyWrites: number;
  readonly attempts: number;
  readonly errors: number;
}

/** Router location identity, history stack and counters immediately before a departure. */
function departureStart(host: Host): DepartureStart {
  const { pathname, key, state } = host.router.state.location;
  return {
    location: { pathname, key, state },
    historyLength: window.history.length,
    historyEntry: JSON.stringify(window.history.state),
    historyWrites: historyWrites(),
    attempts: attempts.length,
    errors: runtimeErrors.length,
  };
}

/**
 * Business oracle for a held departure: route, URL and decision dialog kept; Stay keeps the route, location
 * identity, history stack and the latest intent, with zero storage writes and zero runtime errors.
 */
async function expectHeldThenStay(host: Host, entry: FieldCase, expected: string, work: string, form: string, start: DepartureStart): Promise<void> {
  expect(host.router.state.location.pathname, `H8(host) ${form}: the router stays on Features while ${work} is unsaved`).toBe(FEATURES);
  expect(window.location.pathname, `H8(host) ${form}: the URL stays on Features`).toBe(FEATURES);
  const dialog = host.ui.queryByRole("dialog", { name: DIALOG });
  expect(dialog, `contract §9 ${form}: the held departure shows the decision dialog "${DIALOG}" (guard label Features, never the Smart Lists fallback)`).not.toBeNull();
  fireEvent.click(within(dialog!).getByRole("button", { name: "Stay" }));
  await flush();
  expect(host.ui.queryByRole("dialog"), `contract §9 row g ${form}: Stay closes the dialog`).toBeNull();
  expect(host.router.state.location.pathname, `contract §9 row g ${form}: Stay keeps the route`).toBe(FEATURES);
  expect(window.location.pathname, `contract §9 row g ${form}: Stay keeps the URL`).toBe(FEATURES);
  const { pathname, key, state } = host.router.state.location;
  expect({ pathname, key, state }, `contract §9 rows c/g ${form}: Stay keeps the router location {pathname,key,state}`).toStrictEqual(start.location);
  expect({ length: window.history.length, entry: JSON.stringify(window.history.state), writes: historyWrites() - start.historyWrites },
    `contract §9 rows c/g ${form}: the history stack stays intact (same length and entry, zero pushState/replaceState)`)
    .toStrictEqual({ length: start.historyLength, entry: start.historyEntry, writes: 0 });
  expect(displayed(entry), `contract §5/§6 ${form}: the latest ${entry.label} intent (${expected}) stays displayed after Stay`).toBe(expected);
  expect(featureWrites(start.attempts), `contract §8 ${form}: the departure and Stay make zero Features set/remove attempts`).toEqual([]);
  expect(runtimeErrors.slice(start.errors), `contract §9 ${form}: zero runtime errors`).toEqual([]);
}

// ---------------------------------------------------------------------------------------------------
// Observation of host-level effects (facts for the receipt; never asserted in business cases)
// ---------------------------------------------------------------------------------------------------

interface HostObservation {
  readonly confirmCalls: number;
  readonly confirmMessages: readonly string[];
  readonly featureSetAttempts: number;
  readonly featureRemoveAttempts: ReadonlyArray<{ readonly key: string; readonly threw: boolean }>;
  readonly bytesAfter: Readonly<Record<string, string | null>>;
  readonly nullKeyStorageEvents: number;
  readonly keyedStorageEvents: readonly string[];
  readonly scopeChanged: boolean;
  readonly scopeTransitions: ReadonlyArray<{ readonly kind: string; readonly accountId: string | null; readonly generation: string | null; readonly epochDelta: number }>;
  readonly accountGateShown: boolean;
  readonly remounted: { readonly featuresPane: boolean; readonly settingsSidebar: boolean; readonly appRail: boolean; readonly originalSwitchesDetached: number };
  readonly ariaCheckedMutationsOnOriginalSwitches: ReadonlyArray<{ readonly field: string; readonly oldValue: string | null; readonly lastValue: string | null }>;
  readonly displayedAfter: Readonly<Record<string, string>>;
  readonly dialogOpen: boolean;
}

function watchHost(host: Host): { finish: () => HostObservation } {
  const scopeBefore = accountScope.capture();
  const transitions: Array<HostObservation["scopeTransitions"][number]> = [];
  const unsubscribe = accountScope.subscribe(() => {
    const now = accountScope.capture();
    transitions.push({ kind: now.kind, accountId: now.accountId, generation: now.generation, epochDelta: now.epoch - scopeBefore.epoch });
  });
  const records: MutationRecord[] = [];
  const observer = new MutationObserver(list => { records.push(...list); });
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["aria-checked"], attributeOldValue: true });
  const pane = featuresPane();
  const sidebar = need(document.querySelector(".settings-sidebar"), "the production Settings sidebar is mounted before the watched step");
  const rail = need(document.querySelector(".app-rail"), "the production AppRail is mounted before the watched step");
  const originals = FIELDS.map(entry => ({ field: entry.field, element: switchOf(entry) }));
  const eventsFrom = storageEvents.length;
  const attemptsFrom = attempts.length;
  const confirmFrom = confirmCalls.length;
  return {
    finish(): HostObservation {
      records.push(...observer.takeRecords());
      observer.disconnect();
      unsubscribe();
      const gateShown = records.some(record => Array.from(record.addedNodes).some(node =>
        node instanceof Element && (node.matches(".account-data-gate") || node.querySelector(".account-data-gate") !== null)));
      const aria = records.filter(record => record.type === "attributes").flatMap(record => {
        const hit = originals.find(item => item.element === record.target);
        return hit ? [{ field: hit.field, oldValue: record.oldValue, lastValue: hit.element.getAttribute("aria-checked") }] : [];
      });
      const events = storageEvents.slice(eventsFrom);
      const own = attempts.slice(attemptsFrom).filter(item => FEATURE_KEYS.includes(item.key));
      const paneNow = document.querySelector('section.settings-detail[data-pane="features"]');
      return {
        confirmCalls: confirmCalls.length - confirmFrom,
        confirmMessages: confirmCalls.slice(confirmFrom),
        featureSetAttempts: own.filter(item => item.op === "set").length,
        featureRemoveAttempts: own.filter(item => item.op === "remove").map(item => ({ key: item.key, threw: item.threw })),
        bytesAfter: Object.fromEntries(FIELDS.map(entry => [entry.field, raw(entry.key)])),
        nullKeyStorageEvents: events.filter(event => event.key === null).length,
        keyedStorageEvents: events.filter(event => event.key !== null).map(event => String(event.key)),
        scopeChanged: accountScope.capture() !== scopeBefore,
        scopeTransitions: transitions,
        accountGateShown: gateShown,
        remounted: {
          featuresPane: !pane.isConnected,
          settingsSidebar: !sidebar.isConnected,
          appRail: !rail.isConnected,
          originalSwitchesDetached: originals.filter(item => !item.element.isConnected).length,
        },
        ariaCheckedMutationsOnOriginalSwitches: aria,
        displayedAfter: paneNow ? Object.fromEntries(FIELDS.map(entry => [entry.field, displayed(entry)])) : {},
        dialogOpen: host.ui.queryByRole("dialog") !== null,
      };
    },
  };
}

// ---------------------------------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------------------------------

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  window.history.replaceState(null, "", "/");
  attempts.length = 0;
  deniedSets.clear();
  deniedRemoves.clear();
  confirmCalls.length = 0;
  confirmAnswer = true;
  storageEvents.length = 0;
  runtimeErrors.length = 0;
  // A signed-in account A with a committed generation marker. The scope starts locked for A, as after auth
  // publishes the identity, so the real AccountDataGate activates it once at mount. The 8 keys stay unscoped.
  nativeSet.call(window.localStorage, generationMarkerKey(OWNER), JSON.stringify({ generation: GENERATION, migrationId: "fixture", previous: null }));
  accountScope.lock(OWNER);
  for (const entry of FIELDS) nativeSet.call(window.localStorage, entry.key, entry.seed);
  vi.stubGlobal("AbortController", transferableAbortController().constructor);
  vi.stubGlobal("ResizeObserver", class { observe(): void {} unobserve(): void {} disconnect(): void {} });
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => setTimeout(() => callback(performance.now()), 0));
  vi.stubGlobal("cancelAnimationFrame", (handle: number) => clearTimeout(handle));
  locks = createLockManager();
  Object.defineProperty(navigator, "locks", { configurable: true, value: locks });
  installStorageInjector();
  savedConfirm = window.confirm;
  (window as unknown as { confirm: unknown }).confirm = recordConfirm;
  (window as unknown as { dispatchEvent: unknown }).dispatchEvent = countingDispatch;
  historyCounters = { push: vi.spyOn(window.history, "pushState"), replace: vi.spyOn(window.history, "replaceState") };
  window.addEventListener("error", onWindowError);
  process.on("unhandledRejection", onUnhandledRejection);
});

afterEach(async () => {
  await flush(4);
  // A registered window "error" listener stops Vitest's jsdom environment from escalating window errors, so
  // every recorded runtime error is printed for the log (the runner counts these lines).
  if (runtimeErrors.length > 0) console.warn(`RUNTIME-ERRORS ${String(expect.getState().currentTestName)} ${JSON.stringify(runtimeErrors)}`);
  cleanup();
  for (const router of routers.splice(0)) router.dispose();
  window.removeEventListener("error", onWindowError);
  process.off("unhandledRejection", onUnhandledRejection);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  historyCounters = null;
  (window as unknown as { dispatchEvent: unknown }).dispatchEvent = nativeDispatch;
  if (savedConfirm) (window as unknown as { confirm: unknown }).confirm = savedConfirm;
  delete (navigator as unknown as { locks?: unknown }).locks;
  deniedSets.clear();
  deniedRemoves.clear();
  attempts.length = 0;
  accountScope.lock();
  window.localStorage.clear();
  window.history.replaceState(null, "", "/");
});

// ---------------------------------------------------------------------------------------------------
// FIXTURE validity (no product behavior is asserted here)
// ---------------------------------------------------------------------------------------------------

it("FIXTURE field table matches the archive; storage injector, Web Lock, confirm, StorageEvent, history and error recorders work", async () => {
  pre(JSON.stringify(FIELDS.map(entry => entry.field)) === JSON.stringify(featureIdOrder), `the field table follows the archive's featureIdOrder ${JSON.stringify(featureIdOrder)}`);
  pre(FIELDS.every(entry => featurePrefKey(entry.field) === entry.key), "each field's key equals the archive's featurePrefKey");
  pre(FIELDS.every(entry => I18N.en.nav[entry.field] === entry.label), "each field's label equals the archive's EN nav label");
  pre(FIELDS.every(entry => entry.seed !== entry.next && raw(entry.key) === entry.seed), "each field is seeded with valid bytes and its latest choice inverts the seed");

  const probe = "xai_host_fixture_probe";
  deniedSets.add(probe);
  let thrown: unknown = null;
  try { window.localStorage.setItem(probe, "denied"); } catch (error) { thrown = error; }
  pre(thrown instanceof DOMException && thrown.name === "QuotaExceededError", "an armed setItem throws QuotaExceededError");
  pre(attempts.at(-1)?.op === "set" && attempts.at(-1)?.key === probe && attempts.at(-1)?.threw === true, "the denied set attempt is logged with threw=true");
  pre(raw(probe) === null, "a denied write never reaches storage");
  deniedSets.delete(probe);
  window.localStorage.setItem(probe, "allowed");
  pre(raw(probe) === "allowed" && attempts.at(-1)?.threw === false, "a disarmed write delegates and is logged");
  deniedRemoves.add(probe);
  thrown = null;
  try { window.localStorage.removeItem(probe); } catch (error) { thrown = error; }
  pre(thrown instanceof DOMException && attempts.at(-1)?.op === "remove" && attempts.at(-1)?.threw === true, "an armed removeItem throws and is logged with threw=true");
  pre(raw(probe) === "allowed", "a denied remove never reaches storage");
  deniedRemoves.delete(probe);
  window.localStorage.getItem(probe);
  pre(attempts.at(-1)?.op === "get" && attempts.at(-1)?.key === probe, "reads are logged");
  window.localStorage.removeItem(probe);
  pre(attempts.at(-1)?.op === "remove" && attempts.at(-1)?.threw === false && raw(probe) === null, "a disarmed remove delegates and is logged");
  const beforeSession = attempts.length;
  window.sessionStorage.setItem(probe, "session");
  window.sessionStorage.removeItem(probe);
  pre(attempts.length === beforeSession, "sessionStorage operations are not counted");

  pre((navigator as unknown as { locks?: unknown }).locks === locks, "the lock fixture is installed as navigator.locks");
  const order: string[] = [];
  let releaseFirst!: () => void;
  const first = navigator.locks.request("fixture-probe", { mode: "exclusive" }, () => new Promise<void>(resolve => { order.push("first"); releaseFirst = resolve; }));
  await flush(2);
  const second = navigator.locks.request("fixture-probe", { mode: "exclusive" }, () => { order.push("second"); });
  const independent = navigator.locks.request("fixture-other", { mode: "exclusive" }, () => { order.push("independent"); });
  await flush();
  pre(order.join(",") === "first,independent", `a held name keeps its waiter queued while another name is granted; saw ${order.join(",")}`);
  releaseFirst();
  await Promise.all([first, second, independent]);
  pre(order.join(",") === "first,independent,second", `the waiter is granted only after release; saw ${order.join(",")}`);
  let rejected = false;
  await navigator.locks.request("fixture-probe", { ifAvailable: true }, () => undefined).catch(() => { rejected = true; });
  pre(rejected && locks.unsupported.length === 1, "an unsupported request shape is rejected and recorded");
  locks.unsupported.length = 0;

  confirmAnswer = false;
  pre(window.confirm("probe?") === false && confirmCalls.at(-1) === "probe?", "window.confirm is the recorder and returns the chosen answer");
  confirmAnswer = true;
  const fromEvents = storageEvents.length;
  window.dispatchEvent(new StorageEvent("storage", { key: null, storageArea: window.localStorage }));
  window.dispatchEvent(new StorageEvent("storage", { key: probe, storageArea: window.localStorage }));
  window.dispatchEvent(new Event("xai-host-fixture-probe"));
  pre(JSON.stringify(storageEvents.slice(fromEvents)) === JSON.stringify([{ key: null }, { key: probe }]), "dispatched StorageEvents are counted with their keys; other events are not");
  const fromWrites = historyWrites();
  window.history.pushState(null, "", "/fixture/push");
  window.history.replaceState(null, "", "/");
  pre(historyWrites() - fromWrites === 2, "pushState and replaceState are counted");
  const fromErrors = runtimeErrors.length;
  window.dispatchEvent(new ErrorEvent("error", { error: new Error("fixture probe"), message: "fixture probe" }));
  pre(runtimeErrors.length - fromErrors === 1, "window error events are recorded");
  runtimeErrors.length = fromErrors;
});

it("FIXTURE jsdom browser history reaches the production router factory as a blockable POP", async () => {
  window.history.replaceState(null, "", "/fixture/a");
  const seen: { blocker: ReturnType<typeof useBlocker> | null } = { blocker: null };
  function Guarded(): React.ReactElement {
    seen.blocker = useBlocker(({ currentLocation, nextLocation }) => currentLocation.pathname !== nextLocation.pathname);
    return <p>guarded</p>;
  }
  const router = createBrowserRouter([
    { path: "/fixture/a", element: <p>a</p> },
    { path: "/fixture/b", element: <Guarded /> },
  ]);
  routers.push(router);
  render(<RouterProvider router={router} />);
  await act(async () => { await router.navigate("/fixture/b"); });
  await flush();
  pre(router.state.location.pathname === "/fixture/b" && window.history.state?.idx === 1, "a pushed entry carries the router's history index");
  const entry = JSON.stringify(window.history.state);
  const writes = historyWrites();
  await act(async () => { window.history.back(); });
  await flush();
  pre(seen.blocker?.state === "blocked", `a browser Back reaches useBlocker as a blocked POP; saw ${String(seen.blocker?.state)}`);
  pre(router.state.location.pathname === "/fixture/b", "a blocked POP keeps the router location");
  pre(window.location.pathname === "/fixture/b", "a blocked POP restores the URL");
  pre(JSON.stringify(window.history.state) === entry, "a blocked POP restores the same history entry");
  pre(historyWrites() === writes, "a blocked POP is restored without pushState/replaceState");
  await act(async () => { seen.blocker?.proceed?.(); });
  await flush();
  pre(router.state.location.pathname === "/fixture/a" && window.location.pathname === "/fixture/a", "proceeding the blocked POP reaches the Back entry");
});

it("FIXTURE the host observers detect a real AccountDataGate relock and remount (generation-marker StorageEvent)", async () => {
  const host = await mountHost(FEATURES);
  expectFeaturesReady(host, "FIXTURE observer mount");
  const marker = generationMarkerKey(OWNER);
  const watch = watchHost(host);
  await act(async () => {
    window.dispatchEvent(new StorageEvent("storage", { key: marker, storageArea: window.localStorage, oldValue: raw(marker), newValue: raw(marker) }));
  });
  await flush();
  const seen = watch.finish();
  observed("FIXTURE-marker-event", seen);
  pre(seen.keyedStorageEvents.length === 1 && seen.keyedStorageEvents[0] === marker && seen.nullKeyStorageEvents === 0, "the counter saw exactly the one marker-key StorageEvent");
  pre(seen.scopeChanged && seen.scopeTransitions.map(step => step.kind).join(",") === "locked,account", `the scope recorder saw the relock and re-activation; saw ${JSON.stringify(seen.scopeTransitions)}`);
  pre(seen.accountGateShown, "the gate-screen detector saw the account gate rendered during the relock");
  pre(seen.remounted.featuresPane && seen.remounted.settingsSidebar && seen.remounted.appRail && seen.remounted.originalSwitchesDetached === FIELDS.length, "the remount detector saw the pane, sidebar, rail and switches replaced");
  pre(seen.featureSetAttempts === 0 && seen.featureRemoveAttempts.length === 0, "the relock made zero Features writes");
  expectFeaturesReady(host, "FIXTURE observer after the relock settled");
});

// ---------------------------------------------------------------------------------------------------
// Positive controls (must PASS at f359be6 and on the fixed product)
// ---------------------------------------------------------------------------------------------------

it("PC1 clean Features: zero Features writes at mount, an undisturbed host, no unload warning, sign-out and sidebar departure proceed", async () => {
  const host = await mountHost(FEATURES);
  expectFeaturesReady(host, "PC1 mount");
  expect(featureWrites(), "PC1: zero set/remove attempts on the 8 Features keys at mount").toEqual([]);
  const watch = watchHost(host);
  const unload = dispatchBeforeUnload();
  observed("PC1-beforeunload", unload);
  expect(unload.prevented, "PC1: a clean pane does not warn on beforeunload").toBe(false);
  const signOut = await requestSignOut();
  expect(signOut.outcome, "PC1: clean voluntary sign-out proceeds").toBe(true);
  expect(host.ui.queryByRole("dialog"), "PC1: clean sign-out shows no departure dialog").toBeNull();
  const quiet = watch.finish();
  expect({ scopeChanged: quiet.scopeChanged, accountGateShown: quiet.accountGateShown, remounted: quiet.remounted, nullKeyStorageEvents: quiet.nullKeyStorageEvents },
    "PC1: a clean flow leaves AccountDataGate and the host undisturbed (no relock, gate screen, remount or key:null event)")
    .toStrictEqual({ scopeChanged: false, accountGateShown: false, remounted: { featuresPane: false, settingsSidebar: false, appRail: false, originalSwitchesDetached: 0 }, nullKeyStorageEvents: 0 });
  fireEvent.click(sidebarRow("Hotkeys"));
  await flush();
  expect(host.router.state.location.pathname, "PC1: clean sidebar departure proceeds").toBe(HOTKEYS);
  expect(window.location.pathname, "PC1: clean sidebar departure updates the URL").toBe(HOTKEYS);
  expect(host.ui.queryByRole("dialog"), "PC1: clean departure shows no dialog").toBeNull();
  expect(featureWrites(), "PC1: still zero Features writes after departure").toEqual([]);
  expect(runtimeErrors, "PC1: zero runtime errors").toEqual([]);
});

it("PC2 unfaulted toggles of all 8 switches write exact unscoped bytes, and departure then proceeds", async () => {
  const host = await mountHost(FEATURES);
  expectFeaturesReady(host, "PC2 mount");
  const start = attempts.length;
  for (const entry of FIELDS) {
    edit(entry);
    await flush();
  }
  await until(() => FIELDS.every(entry => raw(entry.key) === entry.next));
  await flush();
  pre(locks.unsupported.length === 0, `no unsupported Web Lock request shape was seen: ${locks.unsupported.join("; ")}`);
  expect(FIELDS.map(entry => [entry.key, raw(entry.key)]), "PC2: each switch stores its exact bytes at its unscoped device key").toEqual(FIELDS.map(entry => [entry.key, entry.next]));
  expect(FIELDS.map(entry => displayed(entry)), "PC2: each switch displays the saved choice").toEqual(FIELDS.map(entry => entry.next));
  expect(accountWrites(start), "PC2: the toggles touch no account-scoped key").toEqual([]);
  fireEvent.click(sidebarRow("Hotkeys"));
  await flush();
  expect(host.router.state.location.pathname, "PC2: departure after verified saves proceeds").toBe(HOTKEYS);
  expect(host.ui.queryByRole("dialog"), "PC2: no departure dialog after verified saves").toBeNull();
  expect(runtimeErrors, "PC2: zero runtime errors").toEqual([]);
});

it("PC3 clean Features: programmatic, Back, Forward, relative-with-state, sidebar and AppRail navigation all proceed", async () => {
  const host = await mountHost(FEATURES);
  expectFeaturesReady(host, "PC3 mount");
  await act(async () => { void host.router.navigate(DASHBOARD); });
  await flush();
  expect(host.router.state.location.pathname, "PC3: clean programmatic module navigation proceeds").toBe(DASHBOARD);
  expect(host.ui.queryByTestId("module-destination")?.textContent, "PC3: the module destination renders outside Settings").toBe("dashboard");
  await act(async () => { window.history.back(); });
  await flush();
  expect(host.router.state.location.pathname, "PC3: a clean browser Back returns to Features").toBe(FEATURES);
  expectFeaturesReady(host, "PC3 after Back");
  await act(async () => { window.history.forward(); });
  await flush();
  expect(host.router.state.location.pathname, "PC3: a clean browser Forward proceeds").toBe(DASHBOARD);
  await act(async () => { window.history.back(); });
  await flush();
  expectFeaturesReady(host, "PC3 after the second Back");
  const state = { from: "features-host-relative" };
  await act(async () => { void host.router.navigate("../hotkeys", { relative: "path", state }); });
  await flush();
  expect(host.router.state.location.pathname, "PC3: clean relative navigation proceeds").toBe(HOTKEYS);
  expect(host.router.state.location.state, "PC3: clean relative navigation carries its state").toStrictEqual(state);
  fireEvent.click(sidebarRow("Features"));
  await flush();
  expect(host.router.state.location.pathname, "PC3: the sidebar row returns to Features").toBe(FEATURES);
  expectFeaturesReady(host, "PC3 after the sidebar return");
  fireEvent.click(railButton("Tasks"));
  await flush();
  expect(host.router.state.location.pathname, "PC3: a clean AppRail Tasks departure proceeds").toBe(TASKS);
  expect(host.ui.queryByRole("dialog"), "PC3: clean departures show no dialog").toBeNull();
  expect(featureWrites(), "PC3: zero Features writes across clean departures").toEqual([]);
  expect(runtimeErrors, "PC3: zero runtime errors").toEqual([]);
});

it("PC4 an accepted, unfaulted Reset to defaults removes all 8 keys without writing, and departure then proceeds", async () => {
  const host = await mountHost(FEATURES);
  expectFeaturesReady(host, "PC4 mount");
  const watch = watchHost(host);
  const start = attempts.length;
  acceptedReset();
  await until(() => FIELDS.every(entry => raw(entry.key) === null));
  await flush();
  const seen = watch.finish();
  observed("PC4-clean-reset", seen);
  expect(seen.confirmCalls, "PC4: one activation asks window.confirm exactly once").toBe(1);
  expect(FIELDS.map(entry => [entry.key, raw(entry.key)]), "PC4: the accepted reset removes all 8 keys").toEqual(FIELDS.map(entry => [entry.key, null]));
  expect(featureWrites(start).filter(item => item.op === "set"), "PC4: the reset never writes default bytes").toEqual([]);
  expectHostReady(host, FEATURES, "PC4 after the reset settled");
  featuresPane();
  const signOut = await requestSignOut();
  expect(signOut.outcome, "PC4: sign-out after a completed reset proceeds").toBe(true);
  expect(host.ui.queryByRole("dialog"), "PC4: no dialog after a completed reset").toBeNull();
  fireEvent.click(sidebarRow("Hotkeys"));
  await flush();
  expect(host.router.state.location.pathname, "PC4: departure after a completed reset proceeds").toBe(HOTKEYS);
  expect(host.ui.queryByRole("dialog"), "PC4: no departure dialog after a completed reset").toBeNull();
  expect(runtimeErrors, "PC4: zero runtime errors").toEqual([]);
});

// ---------------------------------------------------------------------------------------------------
// Per field: latest choice (H1 at host level), route outcome and voluntary sign-out outcome (H8)
// ---------------------------------------------------------------------------------------------------

it.each(FIELDS)("F-a $field: a denied physical write keeps the latest choice displayed [H1 host]", async entry => {
  const host = await mountHost(FEATURES);
  expectFeaturesReady(host, "F-a mount");
  await failedEdit(entry);
  expect(displayed(entry), `H1(host) ${entry.label}: the latest choice ${entry.next} stays displayed after its physical write failed`).toBe(entry.next);
  expect(runtimeErrors, `contract §5 ${entry.label}: a failed toggle raises zero runtime errors`).toEqual([]);
});

it.each(FIELDS)("F-b $field: a Settings sidebar departure is held after a denied write [H8 route]", async entry => {
  const host = await mountHost(FEATURES);
  expectFeaturesReady(host, "F-b mount");
  await failedEdit(entry);
  const start = departureStart(host);
  fireEvent.click(sidebarRow("Hotkeys"));
  await flush();
  await expectHeldThenStay(host, entry, entry.next, `the failed ${entry.label} choice`, "Settings sidebar row", start);
});

it.each(FIELDS)("F-c $field: voluntary sign-out is held and resolves false on Stay after a denied write [H8 sign-out]", async entry => {
  const host = await mountHost(FEATURES);
  expectFeaturesReady(host, "F-c mount");
  await failedEdit(entry);
  const start = departureStart(host);
  const signOut = await requestSignOut();
  expect(signOut.outcome, `H8(host) sign-out ${entry.label}: voluntary sign-out stays pending behind the departure decision while the failed choice is unsaved`).toBe("pending");
  const dialog = host.ui.queryByRole("dialog", { name: DIALOG });
  expect(dialog, `contract §9 row e ${entry.label}: the held sign-out shows the decision dialog "${DIALOG}"`).not.toBeNull();
  fireEvent.click(within(dialog!).getByRole("button", { name: "Stay" }));
  await flush();
  expect(signOut.outcome, `contract §9 row e ${entry.label}: sign-out resolves false on Stay`).toBe(false);
  expect(host.ui.queryByRole("dialog"), `contract §9 row e ${entry.label}: Stay closes the dialog`).toBeNull();
  expect(host.router.state.location.pathname, `contract §9 row e ${entry.label}: Stay keeps the route`).toBe(FEATURES);
  const scope = accountScope.capture();
  expect({ kind: scope.kind, accountId: scope.accountId }, `contract §7 ${entry.label}: Stay keeps the signed-in account`).toStrictEqual({ kind: "account", accountId: OWNER });
  expect(displayed(entry), `contract §5/§7 ${entry.label}: the latest choice stays displayed after Stay`).toBe(entry.next);
  expect(featureWrites(start.attempts), `contract §8 ${entry.label}: sign-out and Stay make zero Features set/remove attempts`).toEqual([]);
  expect(runtimeErrors.slice(start.errors), `contract §9 row e ${entry.label}: zero runtime errors`).toEqual([]);
});

// ---------------------------------------------------------------------------------------------------
// H8 navigation forms on the representative failed field (Boards). The sidebar form is F-b board and the
// sign-out form is F-c board.
// ---------------------------------------------------------------------------------------------------

it("N-rail board: an AppRail module button departure is held [H8 AppRail]", async () => {
  const host = await mountHost(FEATURES);
  expectFeaturesReady(host, "N-rail mount");
  await failedEdit(BOARD);
  const start = departureStart(host);
  fireEvent.click(railButton("Tasks"));
  await flush();
  await expectHeldThenStay(host, BOARD, BOARD.next, "the failed Boards choice", "AppRail Tasks button", start);
});

it("N-programmatic board: programmatic module navigation is held [H8 programmatic]", async () => {
  const host = await mountHost(FEATURES);
  expectFeaturesReady(host, "N-programmatic mount");
  await failedEdit(BOARD);
  const start = departureStart(host);
  await act(async () => { void host.router.navigate(DASHBOARD); });
  await flush();
  await expectHeldThenStay(host, BOARD, BOARD.next, "the failed Boards choice", `router.navigate("${DASHBOARD}")`, start);
});

it("N-back-pop board: a browser Back traversal (POP through the blocker) is held [H8 Back]", async () => {
  const host = await mountHost(HOTKEYS);
  await act(async () => { await host.router.navigate(FEATURES); });
  await flush();
  pre(window.history.state?.idx === 1, `Features is history entry 1 above Hotkeys; saw ${JSON.stringify(window.history.state)}`);
  expectFeaturesReady(host, "N-back-pop setup");
  await failedEdit(BOARD);
  const start = departureStart(host);
  await act(async () => { window.history.back(); });
  await flush();
  await expectHeldThenStay(host, BOARD, BOARD.next, "the failed Boards choice", "browser Back (history POP)", start);
});

it("N-forward-pop board: a browser Forward traversal (POP through the blocker) is held [H8 Forward]", async () => {
  const host = await mountHost(FEATURES);
  await act(async () => { await host.router.navigate(HOTKEYS); });
  await flush();
  pre(host.router.state.location.pathname === HOTKEYS && window.history.state?.idx === 1, `Hotkeys was pushed as entry 1; saw ${host.router.state.location.pathname} ${JSON.stringify(window.history.state)}`);
  await act(async () => { window.history.back(); });
  await flush();
  pre(window.history.state?.idx === 0, `back on Features entry 0 with a Forward entry; saw ${JSON.stringify(window.history.state)}`);
  expectFeaturesReady(host, "N-forward-pop setup");
  await failedEdit(BOARD);
  const start = departureStart(host);
  await act(async () => { window.history.forward(); });
  await flush();
  await expectHeldThenStay(host, BOARD, BOARD.next, "the failed Boards choice", "browser Forward (history POP)", start);
});

it("N-back-delta board: programmatic history Back router.navigate(-1) is held [H8 Back]", async () => {
  const host = await mountHost(HOTKEYS);
  await act(async () => { await host.router.navigate(FEATURES); });
  await flush();
  pre(window.history.state?.idx === 1, `Features is history entry 1 above Hotkeys; saw ${JSON.stringify(window.history.state)}`);
  expectFeaturesReady(host, "N-back-delta setup");
  await failedEdit(BOARD);
  const start = departureStart(host);
  await act(async () => { void host.router.navigate(-1); });
  await flush();
  await expectHeldThenStay(host, BOARD, BOARD.next, "the failed Boards choice", "router.navigate(-1)", start);
});

it("N-forward-delta board: programmatic history Forward router.navigate(1) is held [H8 Forward]", async () => {
  const host = await mountHost(FEATURES);
  await act(async () => { await host.router.navigate(HOTKEYS); });
  await flush();
  pre(host.router.state.location.pathname === HOTKEYS && window.history.state?.idx === 1, `Hotkeys was pushed as entry 1; saw ${host.router.state.location.pathname} ${JSON.stringify(window.history.state)}`);
  await act(async () => { window.history.back(); });
  await flush();
  pre(window.history.state?.idx === 0, `back on Features entry 0 with a Forward entry; saw ${JSON.stringify(window.history.state)}`);
  expectFeaturesReady(host, "N-forward-delta setup");
  await failedEdit(BOARD);
  const start = departureStart(host);
  await act(async () => { void host.router.navigate(1); });
  await flush();
  await expectHeldThenStay(host, BOARD, BOARD.next, "the failed Boards choice", "router.navigate(1)", start);
});

it("N-relative board: path-relative navigation with state is held [H8 relative]", async () => {
  const host = await mountHost(FEATURES);
  expectFeaturesReady(host, "N-relative mount");
  await failedEdit(BOARD);
  const start = departureStart(host);
  await act(async () => { void host.router.navigate("../hotkeys", { relative: "path", state: { from: "features-host-relative" } }); });
  await flush();
  await expectHeldThenStay(host, BOARD, BOARD.next, "the failed Boards choice", 'router.navigate("../hotkeys", { relative: "path", state })', start);
});

it("N-beforeunload board: a cancelable beforeunload warns synchronously with zero storage attempts [H8 beforeunload]", async () => {
  const host = await mountHost(FEATURES);
  expectFeaturesReady(host, "N-beforeunload mount");
  await failedEdit(BOARD);
  const unload = dispatchBeforeUnload();
  observed("N-beforeunload-board", unload);
  expect(unload.prevented, "H8(host) beforeunload: the failed Boards choice makes a cancelable beforeunload warn (event canceled)").toBe(true);
  expect(unload.storageAttempts, "contract §9: the beforeunload handler makes zero storage attempts").toBe(0);
});

// ---------------------------------------------------------------------------------------------------
// One failed Reset to defaults (Calendar's removeItem denied): route outcome [H5/H8 host]; the host-level
// effect of the reset (including AccountDataGate's reaction to its key:null StorageEvent) is recorded only.
// ---------------------------------------------------------------------------------------------------

it("R-route calendar: after an accepted Reset to defaults whose Calendar removal is denied, a sidebar departure is held [H5/H8 route]", async () => {
  const host = await mountHost(FEATURES);
  expectFeaturesReady(host, "R-route mount");
  deniedRemoves.add(CALENDAR.key);
  const watch = watchHost(host);
  const start = attempts.length;
  acceptedReset();
  const fired = (): boolean => attempts.slice(start).some(item => item.op === "remove" && item.key === CALENDAR.key && item.threw);
  pre(await until(fired), `the armed removeItem fault on ${CALENDAR.key} fired (a remove attempt was observed and thrown)`);
  const others = FIELDS.filter(entry => entry !== CALENDAR);
  pre(await until(() => others.every(entry => raw(entry.key) === null)), "the accepted reset removed the seven unfaulted keys (the reset ran)");
  await flush();
  pre(raw(CALENDAR.key) === CALENDAR.seed, `the denied remove left ${CALENDAR.key} at its seeded bytes ${CALENDAR.seed}; saw ${String(raw(CALENDAR.key))}`);
  pre(locks.unsupported.length === 0, `no unsupported Web Lock request shape was seen: ${locks.unsupported.join("; ")}`);
  observed("R-route-failed-reset", watch.finish());
  expectHostReady(host, FEATURES, "R-route after the reset settled");
  featuresPane();
  const departure = departureStart(host);
  fireEvent.click(sidebarRow("Hotkeys"));
  await flush();
  await expectHeldThenStay(host, CALENDAR, "true", "the failed Calendar reset", "failed reset, then Settings sidebar row", departure);
});
