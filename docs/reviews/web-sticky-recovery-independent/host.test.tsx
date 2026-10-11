/**
 * Parent-role actual-host before oracles for the Settings Sticky Note caller
 * (CP-STICKY-01, control-plane batch 5). Executed only through ./verify-fixed.mjs, which copies this
 * file into an immutable `git archive` of the requested product revision.
 *
 * Authority: ../web-sticky-recovery-contract/contract.md sections 3.9 (Settings host facts), 5, 7, 9 and
 * 12 ("Parent host baseline", "Validity and positive controls", hypotheses H1 and H7).
 *
 * Composition under test, all taken from the archive and none of it mocked:
 *   - the production Shell inside WebShellProvider with the production webShellModuleRegistrations;
 *   - the production ComposedSettings (composedSettingsRegistration), its DepartureCoordinator and the
 *     requestSettingsDeparture sign-out preflight that App.handleSignOut awaits;
 *   - the production router factory createBrowserRouter over jsdom's History, so browser Back and Forward
 *     are real POP traversals that reach the coordinator's blocker;
 *   - the real Sticky pane, storage hook and engine, registry, codec and accountScope.
 * Test-owned fixtures: an attempt-logging localStorage injector whose faults fire before delegation, an
 * exclusive FIFO Web Lock manager installed as navigator.locks, and jsdom shims (Node's AbortController
 * for router Requests, ResizeObserver, requestAnimationFrame).
 *
 * Every oracle states the fixed-product requirement. At 2023526 they are expected to fail wherever H1/H7
 * hold. A `PRECONDITION:` error is a fixture or selector failure and is never a product result.
 */
import * as React from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, within } from "@testing-library/react";
import { transferableAbortController } from "node:util";
import { createBrowserRouter, RouterProvider, useBlocker, useParams } from "react-router";
import { Shell, WebShellProvider } from "@repo/xai-web-shell";
import { accountScope, generationMarkerKey } from "@repo/plugin-web-storage";
import { webShellModuleRegistrations } from "../../../apps/web/src/routes/modules/shellRegistrations";
import { composedSettingsRegistration } from "../../../apps/web/src/routes/modules/composedSettingsRegistration";
import { requestSettingsDeparture } from "../../../apps/web/src/routes/modules/settingsDeparture";

// ---------------------------------------------------------------------------------------------------
// Scenario constants
// ---------------------------------------------------------------------------------------------------

const STICKY = "/app/settings/sticky";
const HOTKEYS = "/app/settings/hotkeys";
const TASKS = "/app/tasks";
const DASHBOARD = "/app/dashboard";
/** Coordinator dialog name for the required guard label "Sticky Note" (contract section 9). */
const DIALOG = "Unsaved Sticky Note draft";
const OWNER = "sticky-host-parent-A";
const GENERATION = "g1";

type FieldId = "color" | "font" | "pin_default" | "restore_size" | "grid_spacing";
interface FieldCase {
  readonly field: FieldId;
  readonly key: string;
  /** Valid non-default bytes seeded before mount, so the mount display proves the physical key. */
  readonly seed: string;
  /** The valid latest choice whose physical write is denied. */
  readonly next: string;
}

const FIELDS: readonly FieldCase[] = [
  { field: "color", key: "xai_pref_sticky_color", seed: "sky", next: "mint" },
  { field: "font", key: "xai_pref_sticky_font", seed: "normal", next: "xl" },
  { field: "pin_default", key: "xai_pref_sticky_pin_default", seed: "false", next: "true" },
  { field: "restore_size", key: "xai_pref_sticky_restore_size", seed: "true", next: "false" },
  { field: "grid_spacing", key: "xai_pref_sticky_grid_spacing", seed: "large", next: "xl" },
];
const STICKY_KEYS = FIELDS.map(entry => entry.key);
const COLOR = FIELDS[0]!;

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

// ---------------------------------------------------------------------------------------------------
// Attempt-logging localStorage injector (attempts are recorded before delegation)
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
    if (this === window.localStorage) attempts.push({ op: "remove", key: String(key), threw: false });
    return nativeRemove.call(this, key);
  });
}

const raw = (key: string): string | null => nativeGet.call(window.localStorage, key);
const stickyWrites = (): Attempt[] => attempts.filter(entry => entry.op !== "get" && STICKY_KEYS.includes(entry.key));

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
// Actual host: production Shell + ComposedSettings behind the production browser router factory
// ---------------------------------------------------------------------------------------------------

const ComposedSettings = need(
  composedSettingsRegistration.children.find(child => child.path === "*"),
  "composedSettingsRegistration exposes its splat child",
).render as unknown as React.ComponentType;

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
      element: (
        <Shell lang="en" setLang={() => {}} theme="light" setTheme={() => {}} density="comfortable" setDensity={() => {}} />
      ),
      children: [
        { path: "settings/*", element: <ComposedSettings /> },
        { path: ":moduleId/*", element: <ModuleDestination /> },
      ],
    },
  ]);
  routers.push(router);
  const ui = render(
    <WebShellProvider modules={webShellModuleRegistrations} lang="en" railPos="left" petOn={false} setPetOn={() => {}}>
      <RouterProvider router={router} />
    </WebShellProvider>,
  );
  await flush();
  pre(router.state.location.pathname === path, `router mounted at ${path}; saw ${router.state.location.pathname}`);
  return { ui, router };
}
type Host = Awaited<ReturnType<typeof mountHost>>;

// ---------------------------------------------------------------------------------------------------
// Sticky controls (stable selectors only: data-color-id, data-spacing-id, the select's aria-label and
// the switch names) and the host's departure producers
// ---------------------------------------------------------------------------------------------------

function stickyPane(): HTMLElement {
  return need(
    document.querySelector<HTMLElement>('section.settings-detail[data-pane="sticky"]'),
    "the Sticky pane is mounted in the production .settings-detail section",
  );
}

function only<T extends Element>(nodes: ArrayLike<T>, what: string): T {
  pre(nodes.length === 1, `exactly one ${what}; found ${nodes.length}`);
  return nodes[0]!;
}

const swatch = (id: string): HTMLElement =>
  only(stickyPane().querySelectorAll<HTMLElement>(`[data-color-id="${id}"]`), `[data-color-id="${id}"] swatch`);
const card = (id: string): HTMLElement =>
  only(stickyPane().querySelectorAll<HTMLElement>(`[data-spacing-id="${id}"]`), `[data-spacing-id="${id}"] card`);
const fontSelect = (): HTMLSelectElement =>
  only(stickyPane().querySelectorAll<HTMLSelectElement>('select[aria-label="Font Size"]'), 'select[aria-label="Font Size"]');
const toggle = (name: string): HTMLElement =>
  only(within(stickyPane()).queryAllByRole("switch", { name }), `switch named "${name}"`);

function pressedId(attribute: "data-color-id" | "data-spacing-id", count: number): string {
  const all = Array.from(stickyPane().querySelectorAll(`[${attribute}]`));
  pre(all.length === count, `${count} [${attribute}] controls rendered; found ${all.length}`);
  const pressed = all.filter(node => node.getAttribute("aria-pressed") === "true").map(node => node.getAttribute(attribute) ?? "");
  return pressed.length === 1 ? pressed[0]! : `pressed[${pressed.join(",")}]`;
}

/** The value the control currently presents to the user, in stored-byte form. */
function displayed(entry: FieldCase): string {
  switch (entry.field) {
    case "color": return pressedId("data-color-id", 13);
    case "font": return fontSelect().value;
    case "pin_default": return toggle("Pin by Default").getAttribute("aria-checked") ?? "(no aria-checked)";
    case "restore_size": return toggle("Restore Default Size").getAttribute("aria-checked") ?? "(no aria-checked)";
    case "grid_spacing": return pressedId("data-spacing-id", 4);
  }
}

/** One valid user edit through the field's real control. */
function edit(entry: FieldCase): void {
  switch (entry.field) {
    case "color": fireEvent.click(swatch(entry.next)); return;
    case "font": fireEvent.change(fontSelect(), { target: { value: entry.next } }); return;
    case "pin_default": fireEvent.click(toggle("Pin by Default")); return;
    case "restore_size": fireEvent.click(toggle("Restore Default Size")); return;
    case "grid_spacing": fireEvent.click(card(entry.next)); return;
  }
}

function sidebarRow(name: string): HTMLElement {
  const sidebar = need(document.querySelector<HTMLElement>(".settings-sidebar"), "the production Settings sidebar is mounted");
  return only(within(sidebar).queryAllByRole("button", { name }), `Settings sidebar row "${name}"`);
}

function railButton(name: string): HTMLElement {
  const rail = need(document.querySelector<HTMLElement>(".app-rail"), "the production AppRail is mounted");
  return only(within(rail).queryAllByRole("button", { name }), `AppRail button "${name}"`);
}

/** Pane mounted at the expected path, host chrome present, scope and lock fixture live, seeds displayed. */
function expectStickyReady(host: Host, when: string): void {
  pre(host.router.state.location.pathname === STICKY, `${when}: router at ${STICKY}; saw ${host.router.state.location.pathname}`);
  pre(window.location.pathname === STICKY, `${when}: URL at ${STICKY}; saw ${window.location.pathname}`);
  pre(document.querySelector(".settings-sidebar") !== null, `${when}: the production Settings sidebar is mounted`);
  pre(document.querySelector(".app-rail") !== null, `${when}: the production AppRail is mounted`);
  stickyPane();
  const scope = accountScope.capture();
  pre(scope.kind === "account" && scope.accountId === OWNER, `${when}: account ${OWNER} is the active real accountScope`);
  pre((navigator as unknown as { locks?: unknown }).locks === locks, `${when}: the exclusive Web Lock fixture is navigator.locks`);
  pre(host.ui.queryByRole("dialog") === null, `${when}: no dialog is open before the scenario`);
  for (const entry of FIELDS) {
    pre(raw(entry.key) === entry.seed, `${when}: seeded bytes ${entry.key}=${entry.seed} present; saw ${String(raw(entry.key))}`);
    pre(displayed(entry) === entry.seed, `${when}: ${entry.field} displays its seeded ${entry.seed}; saw ${displayed(entry)}`);
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

/** Business oracle for a held departure: route, URL and decision dialog kept; Stay keeps everything. */
async function expectHeldThenStay(host: Host, entry: FieldCase, form: string): Promise<void> {
  expect(host.router.state.location.pathname, `H7(host) ${form}: the router stays on Sticky while the failed ${entry.field} choice is unsaved`).toBe(STICKY);
  expect(window.location.pathname, `H7(host) ${form}: the URL stays on Sticky`).toBe(STICKY);
  const dialog = host.ui.queryByRole("dialog", { name: DIALOG });
  expect(dialog, `contract §9 ${form}: the held departure shows the decision dialog "${DIALOG}" (guard label Sticky Note)`).not.toBeNull();
  fireEvent.click(within(dialog!).getByRole("button", { name: "Stay" }));
  await flush();
  expect(host.ui.queryByRole("dialog"), `contract §9 ${form}: Stay closes the dialog`).toBeNull();
  expect(host.router.state.location.pathname, `contract §9 ${form}: Stay keeps the route`).toBe(STICKY);
  expect(window.location.pathname, `contract §9 ${form}: Stay keeps the URL`).toBe(STICKY);
  expect(displayed(entry), `contract §5 ${form}: the latest ${entry.field} choice stays displayed after Stay`).toBe(entry.next);
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
  // A signed-in account A, as in the voluntary sign-out path; the five Sticky keys stay unscoped.
  nativeSet.call(window.localStorage, generationMarkerKey(OWNER), JSON.stringify({ generation: GENERATION, migrationId: "fixture", previous: null }));
  accountScope.activate(accountScope.lock(OWNER), GENERATION);
  for (const entry of FIELDS) nativeSet.call(window.localStorage, entry.key, entry.seed);
  vi.stubGlobal("AbortController", transferableAbortController().constructor);
  vi.stubGlobal("ResizeObserver", class { observe(): void {} unobserve(): void {} disconnect(): void {} });
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => setTimeout(() => callback(performance.now()), 0));
  vi.stubGlobal("cancelAnimationFrame", (handle: number) => clearTimeout(handle));
  locks = createLockManager();
  Object.defineProperty(navigator, "locks", { configurable: true, value: locks });
  installStorageInjector();
});

afterEach(async () => {
  await flush(4);
  cleanup();
  for (const router of routers.splice(0)) router.dispose();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  delete (navigator as unknown as { locks?: unknown }).locks;
  deniedSets.clear();
  attempts.length = 0;
  window.localStorage.clear();
  window.history.replaceState(null, "", "/");
});

// ---------------------------------------------------------------------------------------------------
// FIXTURE validity (no product behavior is asserted here)
// ---------------------------------------------------------------------------------------------------

it("FIXTURE storage injector fires before delegation and the Web Lock fixture is exclusive", async () => {
  const probe = "xai_host_fixture_probe";
  deniedSets.add(probe);
  let thrown: unknown = null;
  try { window.localStorage.setItem(probe, "denied"); } catch (error) { thrown = error; }
  pre(thrown instanceof DOMException && thrown.name === "QuotaExceededError", "an armed setItem throws QuotaExceededError");
  pre(attempts.at(-1)?.op === "set" && attempts.at(-1)?.key === probe && attempts.at(-1)?.threw === true, "the denied attempt is logged with threw=true");
  pre(raw(probe) === null, "a denied write never reaches storage");
  deniedSets.delete(probe);
  window.localStorage.setItem(probe, "allowed");
  pre(raw(probe) === "allowed" && attempts.at(-1)?.threw === false, "a disarmed write delegates and is logged");
  window.localStorage.getItem(probe);
  pre(attempts.at(-1)?.op === "get" && attempts.at(-1)?.key === probe, "reads are logged");
  window.localStorage.removeItem(probe);
  pre(attempts.at(-1)?.op === "remove" && raw(probe) === null, "removes are logged and delegate");
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
  order.length = 0;
  let releaseShared!: () => void;
  const sharedFirst = navigator.locks.request("fixture-shared", { mode: "shared" }, () => new Promise<void>(resolve => { order.push("s1"); releaseShared = resolve; }));
  await flush(2);
  const sharedSecond = navigator.locks.request("fixture-shared", { mode: "shared" }, () => { order.push("s2"); });
  const exclusiveAfter = navigator.locks.request("fixture-shared", { mode: "exclusive" }, () => { order.push("x"); });
  await flush();
  pre(order.join(",") === "s1,s2", `shared holders coexist while an exclusive request waits; saw ${order.join(",")}`);
  releaseShared();
  await Promise.all([sharedFirst, sharedSecond, exclusiveAfter]);
  pre(order.join(",") === "s1,s2,x", `the exclusive request is granted after the shared holders release; saw ${order.join(",")}`);
  let rejected = false;
  await navigator.locks.request("fixture-probe", { ifAvailable: true }, () => undefined).catch(() => { rejected = true; });
  pre(rejected && locks.unsupported.length === 1, "an unsupported request shape is rejected and recorded");
  locks.unsupported.length = 0;
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
  await act(async () => { window.history.back(); });
  await flush();
  pre(seen.blocker?.state === "blocked", `a browser Back reaches useBlocker as a blocked POP; saw ${String(seen.blocker?.state)}`);
  pre(router.state.location.pathname === "/fixture/b", "a blocked POP keeps the router location");
  pre(window.location.pathname === "/fixture/b", "a blocked POP restores the URL");
  pre(JSON.stringify(window.history.state) === entry, "a blocked POP restores the same history entry");
  await act(async () => { seen.blocker?.proceed?.(); });
  await flush();
  pre(router.state.location.pathname === "/fixture/a" && window.location.pathname === "/fixture/a", "proceeding the blocked POP reaches the Back entry");
});

// ---------------------------------------------------------------------------------------------------
// Positive controls (must PASS at 2023526 and on the fixed product)
// ---------------------------------------------------------------------------------------------------

it("PC1 clean Sticky: zero Sticky writes at mount, no unload warning, sign-out and sidebar departure proceed", async () => {
  const host = await mountHost(STICKY);
  expectStickyReady(host, "PC1 mount");
  expect(stickyWrites(), "PC1: zero set/remove attempts on the five Sticky keys at mount").toEqual([]);
  const unload = dispatchBeforeUnload();
  expect(unload.prevented, "PC1: a clean pane does not warn on beforeunload").toBe(false);
  const signOut = await requestSignOut();
  expect(signOut.outcome, "PC1: clean voluntary sign-out proceeds").toBe(true);
  expect(host.ui.queryByRole("dialog"), "PC1: clean sign-out shows no departure dialog").toBeNull();
  fireEvent.click(sidebarRow("Hotkeys"));
  await flush();
  expect(host.router.state.location.pathname, "PC1: clean sidebar departure proceeds").toBe(HOTKEYS);
  expect(window.location.pathname, "PC1: clean sidebar departure updates the URL").toBe(HOTKEYS);
  expect(host.ui.queryByRole("dialog"), "PC1: clean departure shows no dialog").toBeNull();
  expect(stickyWrites(), "PC1: still zero Sticky writes after departure").toEqual([]);
});

it("PC2 unfaulted edits of all five fields write exact unscoped bytes and departure then proceeds", async () => {
  const host = await mountHost(STICKY);
  expectStickyReady(host, "PC2 mount");
  for (const entry of FIELDS) {
    edit(entry);
    await flush();
  }
  await until(() => FIELDS.every(entry => raw(entry.key) === entry.next));
  pre(locks.unsupported.length === 0, `no unsupported Web Lock request shape was seen: ${locks.unsupported.join("; ")}`);
  expect(FIELDS.map(entry => [entry.key, raw(entry.key)]), "PC2: each field's exact bytes are stored at its unscoped key").toEqual(FIELDS.map(entry => [entry.key, entry.next]));
  expect(FIELDS.map(entry => displayed(entry)), "PC2: each control displays the saved choice").toEqual(FIELDS.map(entry => entry.next));
  await flush();
  fireEvent.click(sidebarRow("Hotkeys"));
  await flush();
  expect(host.router.state.location.pathname, "PC2: departure after verified saves proceeds").toBe(HOTKEYS);
  expect(host.ui.queryByRole("dialog"), "PC2: no departure dialog after verified saves").toBeNull();
});

it("PC3 clean Sticky: programmatic module navigation, browser Back and the AppRail leave or return freely", async () => {
  const host = await mountHost(STICKY);
  expectStickyReady(host, "PC3 mount");
  await act(async () => { void host.router.navigate(DASHBOARD); });
  await flush();
  expect(host.router.state.location.pathname, "PC3: clean programmatic module navigation proceeds").toBe(DASHBOARD);
  expect(host.ui.queryByTestId("module-destination")?.textContent, "PC3: the module destination renders outside Settings").toBe("dashboard");
  await act(async () => { window.history.back(); });
  await flush();
  expect(host.router.state.location.pathname, "PC3: a clean browser Back returns to Sticky").toBe(STICKY);
  expectStickyReady(host, "PC3 after Back");
  fireEvent.click(railButton("Tasks"));
  await flush();
  expect(host.router.state.location.pathname, "PC3: a clean AppRail Tasks departure proceeds").toBe(TASKS);
  expect(host.ui.queryByRole("dialog"), "PC3: clean departures show no dialog").toBeNull();
  expect(stickyWrites(), "PC3: zero Sticky writes across clean departures").toEqual([]);
});

// ---------------------------------------------------------------------------------------------------
// Per field: latest choice (H1 at host level), route outcome and voluntary sign-out outcome (H7)
// ---------------------------------------------------------------------------------------------------

it.each(FIELDS)("F-a $field: a denied physical write keeps the latest choice displayed [H1 host]", async entry => {
  const host = await mountHost(STICKY);
  expectStickyReady(host, "F-a mount");
  await failedEdit(entry);
  expect(displayed(entry), `H1(host) ${entry.field}: the latest choice ${entry.next} stays displayed after its physical write failed`).toBe(entry.next);
});

it.each(FIELDS)("F-b $field: a Settings sidebar departure is held after a denied write [H7 route]", async entry => {
  const host = await mountHost(STICKY);
  expectStickyReady(host, "F-b mount");
  await failedEdit(entry);
  fireEvent.click(sidebarRow("Hotkeys"));
  await flush();
  await expectHeldThenStay(host, entry, "Settings sidebar row");
});

it.each(FIELDS)("F-c $field: voluntary sign-out is held and resolves false on Stay after a denied write [H7 sign-out]", async entry => {
  const host = await mountHost(STICKY);
  expectStickyReady(host, "F-c mount");
  await failedEdit(entry);
  const signOut = await requestSignOut();
  expect(signOut.outcome, `H7(host) sign-out ${entry.field}: voluntary sign-out stays pending behind the departure decision while the failed choice is unsaved`).toBe("pending");
  const dialog = host.ui.queryByRole("dialog", { name: DIALOG });
  expect(dialog, `contract §9 row e ${entry.field}: the held sign-out shows the decision dialog "${DIALOG}"`).not.toBeNull();
  fireEvent.click(within(dialog!).getByRole("button", { name: "Stay" }));
  await flush();
  expect(signOut.outcome, `contract §9 row e ${entry.field}: sign-out resolves false on Stay`).toBe(false);
  expect(host.ui.queryByRole("dialog"), `contract §9 row e ${entry.field}: Stay closes the dialog`).toBeNull();
  expect(host.router.state.location.pathname, `contract §9 row e ${entry.field}: Stay keeps the route`).toBe(STICKY);
  expect(displayed(entry), `contract §5 ${entry.field}: the latest choice stays displayed after Stay`).toBe(entry.next);
});

// ---------------------------------------------------------------------------------------------------
// H7 navigation forms on the representative failed field (color). The sidebar form is F-b color.
// ---------------------------------------------------------------------------------------------------

it("N-rail color: an AppRail module button departure is held [H7 AppRail]", async () => {
  const host = await mountHost(STICKY);
  expectStickyReady(host, "N-rail mount");
  await failedEdit(COLOR);
  fireEvent.click(railButton("Tasks"));
  await flush();
  await expectHeldThenStay(host, COLOR, "AppRail Tasks button");
});

it("N-programmatic color: programmatic module navigation is held [H7 programmatic]", async () => {
  const host = await mountHost(STICKY);
  expectStickyReady(host, "N-programmatic mount");
  await failedEdit(COLOR);
  await act(async () => { void host.router.navigate(DASHBOARD); });
  await flush();
  await expectHeldThenStay(host, COLOR, `router.navigate("${DASHBOARD}")`);
});

it("N-back-pop color: a browser Back traversal (POP through the blocker) is held [H7 Back]", async () => {
  const host = await mountHost(HOTKEYS);
  await act(async () => { await host.router.navigate(STICKY); });
  await flush();
  pre(window.history.state?.idx === 1, `Sticky is history entry 1 above Hotkeys; saw ${JSON.stringify(window.history.state)}`);
  expectStickyReady(host, "N-back-pop setup");
  await failedEdit(COLOR);
  await act(async () => { window.history.back(); });
  await flush();
  await expectHeldThenStay(host, COLOR, "browser Back (history POP)");
});

it("N-forward-pop color: a browser Forward traversal (POP through the blocker) is held [H7 Forward]", async () => {
  const host = await mountHost(STICKY);
  await act(async () => { await host.router.navigate(HOTKEYS); });
  await flush();
  pre(host.router.state.location.pathname === HOTKEYS && window.history.state?.idx === 1, `Hotkeys was pushed as entry 1; saw ${host.router.state.location.pathname} ${JSON.stringify(window.history.state)}`);
  await act(async () => { window.history.back(); });
  await flush();
  pre(window.history.state?.idx === 0, `back on Sticky entry 0 with a Forward entry; saw ${JSON.stringify(window.history.state)}`);
  expectStickyReady(host, "N-forward-pop setup");
  await failedEdit(COLOR);
  await act(async () => { window.history.forward(); });
  await flush();
  await expectHeldThenStay(host, COLOR, "browser Forward (history POP)");
});

it("N-back-delta color: programmatic history Back router.navigate(-1) is held [H7 Back]", async () => {
  const host = await mountHost(HOTKEYS);
  await act(async () => { await host.router.navigate(STICKY); });
  await flush();
  pre(window.history.state?.idx === 1, `Sticky is history entry 1 above Hotkeys; saw ${JSON.stringify(window.history.state)}`);
  expectStickyReady(host, "N-back-delta setup");
  await failedEdit(COLOR);
  await act(async () => { void host.router.navigate(-1); });
  await flush();
  await expectHeldThenStay(host, COLOR, "router.navigate(-1)");
});

it("N-forward-delta color: programmatic history Forward router.navigate(1) is held [H7 Forward]", async () => {
  const host = await mountHost(STICKY);
  await act(async () => { await host.router.navigate(HOTKEYS); });
  await flush();
  pre(host.router.state.location.pathname === HOTKEYS && window.history.state?.idx === 1, `Hotkeys was pushed as entry 1; saw ${host.router.state.location.pathname} ${JSON.stringify(window.history.state)}`);
  await act(async () => { window.history.back(); });
  await flush();
  pre(window.history.state?.idx === 0, `back on Sticky entry 0 with a Forward entry; saw ${JSON.stringify(window.history.state)}`);
  expectStickyReady(host, "N-forward-delta setup");
  await failedEdit(COLOR);
  await act(async () => { void host.router.navigate(1); });
  await flush();
  await expectHeldThenStay(host, COLOR, "router.navigate(1)");
});

it("N-relative color: path-relative navigation with state is held [H7 relative]", async () => {
  const host = await mountHost(STICKY);
  expectStickyReady(host, "N-relative mount");
  await failedEdit(COLOR);
  await act(async () => { void host.router.navigate("../hotkeys", { relative: "path", state: { from: "sticky-host-relative" } }); });
  await flush();
  await expectHeldThenStay(host, COLOR, 'router.navigate("../hotkeys", { relative: "path", state })');
});

it("N-beforeunload color: a cancelable beforeunload warns synchronously with zero storage attempts [H7 beforeunload]", async () => {
  const host = await mountHost(STICKY);
  expectStickyReady(host, "N-beforeunload mount");
  await failedEdit(COLOR);
  const unload = dispatchBeforeUnload();
  expect(unload.prevented, "H7(host) beforeunload: the failed color choice makes a cancelable beforeunload warn (event canceled)").toBe(true);
  expect(unload.storageAttempts, "contract §9: the beforeunload handler makes zero storage attempts").toBe(0);
});
