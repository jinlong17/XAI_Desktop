/**
 * Parent-role jsdom host before oracles for the Dashboard Clock caller (CP-CLOCK-01, control-plane batch 69; contract
 * docs/reviews/web-dashboard-clock-recovery-contract/contract.md r2, section 14 item E3). Executed only through
 * ./verify-fixed.mjs, which copies this file and ./host-fixture.tsx into an immutable `git archive` of the requested
 * product revision.
 *
 * Authority: contract r2 section 3 (as-is facts), section 5 (wording, stable selectors, field states), section 6
 * (participation, combined guard, labels, release-once), section 7 (protection model, sign-out sequence, removal, drag
 * ghost), section 9 host rows a-q, section 12 (rules 8-16, "Parent host baseline", the consistency matrix, "Validity and
 * positive controls", H1-H8); ../20260908-full-product-audit/CURRENT-CONTROL-PLANE.md "本轮唯一任务" (batch 69) and the
 * controller's CP-CLOCK-01 rulings (ruling 1: "zero storage attempts" for the drag ghost means zero set/remove
 * attempts; reads are only recorded).
 *
 * Composition: the production `App` in the apps/web/src/main.tsx module order (observability runtime, AppProviders,
 * the router module, the service-worker module, @repo/plugin-web-tokens, global.css) and the production route table
 * `webHostRouteObjects`, rendered by RouterProvider from "react-router" over a fresh memory data router per mount. The
 * ONLY synthetic input is the auth session: useWebAuthSession is substituted with an authenticated session for account
 * A. Each case selects App.handleSignOut's branch: "coordinator" (a generation coordinator that records its sign-outs)
 * or "fallback" (no coordinator, no client; clearSessionStorage records). Not executed, as in the accepted precedents:
 * AppProviders' component tree, bootstrapObservability(), registerServiceWorker() and StrictMode; the module-level
 * production router instance is disposed unrendered. There is no network.
 *
 * Every business oracle states the fixed-product requirement. At f9eb4b1 the rows b-h, j, k, m, n, the drafted half of
 * row i and the OK half of row q are expected to fail on a business assertion (correct FAILs); the FIXTURE cases, the
 * clean control and rows a, l, o, p, the idle half of row i, the lock-independence run of row c and the Cancel half of
 * row q must PASS on every product. "PRECONDITION:" errors are fixture or selector failures and never product results.
 * Each case checks the Topbar census (rule 11) at its start and before its business assertions, and records the
 * window.confirm recorder by class (rule 12); the teardown writes one "census-recorder" observation per case.
 */
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { fireEvent } from "@testing-library/react";
import { accountScope } from "@repo/plugin-web-storage";
import {
  CLOCK_KEYS, DASHBOARD, DEFAULTS, DIALOG, FAILED, FIELDS, HEADER_DRAFT, HEADER_EXPORT, HEADER_ORIGINAL, IDENTITY_KEY, KEY, LOCK,
  MALFORMED, NO_DIALOG, NO_HISTORY_MUTATION, NONE, OTHER, OWNER, RAIL_KEY, RAIL_LOCK, SELF_CHECK_EXPECTED, SOURCE, STYLES, TASKS,
  CALENDAR, THEME_LOCK, TZS, W, ZERO_CONFIRMS,
  action, blockState, blockerMessages, bus, bytesOf, census, choose, click, clickRail, clockMounted, clockRoot, clockSnapshot,
  configureApp, confirmer, confirmsByClass, controlsEnabled, coordinator, coordinatorState, departures, dialog, dialogButton,
  dialogFor, dialogState, downloadJson, downloadNames, downloads, dragRail, drags, endWidgetDrag, envelope, exportButton, external,
  faceText, failChoice, failHeaderSave, fault, fired, flush, ghost, go, headerRetry, historyMark, historyMutations, hold,
  identityInvalidated, locks, mark, mountApp, mountRaw, moveWidgetDrag, navigationEvents, need, networkAttempts, noteKey, observed,
  pre, probeUnload, productStorageEvents, railLabels, railStatusAny, raw, readsSince, redirects, region, removeClockButton,
  routeError, runtimeErrors, scopeSummary, seedClock, seedMalformed, setup, shown, signOut, startWidgetDrag, storageSelfCheck,
  successClaim, teardown, waitReal, writesSince, appearanceStatus, type AppHandle, type Fault, type Field,
} from "./host-fixture";
// The unchanged CmdK reader (contract section 9 row a: "readModuleStates() returns those bytes").
import { readModuleStates } from "../../../packages/xai-web-cmdk/src/internal/readModuleStates";

// ---------------------------------------------------------------------------------------------------
// The only synthetic input: the auth-session hook (both App.handleSignOut branches)
// ---------------------------------------------------------------------------------------------------

const auth = vi.hoisted(() => {
  const counters = { hookCalls: 0, captures: 0, coordinatorSignOuts: 0, clearSessionStorage: 0, refreshSession: 0 };
  const coordinator = {
    capture: () => { counters.captures += 1; return { owner: "clock-host-parent-A", generation: "g1" }; },
    signOut: async () => { counters.coordinatorSignOuts += 1; return { status: "applied" as const }; },
    bootstrap: async () => undefined,
  };
  const value: Record<string, unknown> = {
    state: "authenticated",
    session: { user: { id: "clock-host-parent-A" } },
    client: null,
    coordinator,
    authError: null,
    signOutFailed: false,
    reportSignOutFailure: undefined,
    deviceId: null,
    syncVersion: "2026-05",
    refreshSession: async () => { counters.refreshSession += 1; return null; },
    ensureDeviceIdentity: async () => "clock-host-device",
    clearSessionStorage: async () => { counters.clearSessionStorage += 1; },
    setSession: () => undefined,
  };
  return { counters, value, coordinator };
});
vi.mock("../../../packages/web-auth-device-session/src/session", async importOriginal => {
  const actual = await importOriginal<Record<string, unknown>>();
  return { ...actual, useWebAuthSession: () => { auth.counters.hookCalls += 1; return auth.value; } };
});

// apps/web/src/main.tsx module order (module evaluation only; see the header for what is not executed).
import "../../../apps/web/src/observability/runtime";
import "../../../apps/web/src/providers/AppProviders";
import { router as productionRouterInstance, webHostRouteObjects } from "../../../apps/web/src/routes/router";
import "../../../apps/web/src/service-worker/register";
import "@repo/plugin-web-tokens";
import "../../../apps/web/src/styles/global.css";

const productionRouterAtImport = productionRouterInstance.state.location.pathname;
productionRouterInstance.dispose();
configureApp(webHostRouteObjects, () => ({ hookCalls: auth.counters.hookCalls }));

type Branch = "coordinator" | "fallback";
const BRANCHES: readonly Branch[] = ["coordinator", "fallback"];
function useBranch(branch: Branch): void {
  auth.value.coordinator = branch === "coordinator" ? auth.coordinator : null;
  auth.value.client = null;
}
beforeEach(() => {
  setup();
  for (const key of Object.keys(auth.counters) as Array<keyof typeof auth.counters>) auth.counters[key] = 0;
  useBranch("coordinator");
});
afterEach(() => { teardown(expect.getState().currentTestName ?? "unknown"); });

// ---------------------------------------------------------------------------------------------------
// Shared steps
// ---------------------------------------------------------------------------------------------------

/** The in-domain committed baseline of most cases. */
const BASE: Readonly<Record<Field, string>> = { style: "classic", timezone: "local" };
/** The choice each failure case makes (distinct from the baseline, in-domain). */
const CHOICE: Readonly<Record<Field, string>> = { style: "analog", timezone: "tokyo" };

/** Seeds the in-domain baseline and mounts the production App on the Dashboard; census at start. */
async function dashboard(options: { seed?: Partial<Record<Field, string>> | null; entries?: readonly string[]; index?: number } = {}): Promise<AppHandle> {
  if (options.seed !== null) {
    const seed = { ...BASE, ...(options.seed ?? {}) };
    for (const field of FIELDS) seedClock(field, seed[field]);
  }
  const app = await mountApp(options.entries ?? [DASHBOARD], options.index);
  census("mount");
  if (app.pathname() === DASHBOARD) pre(clockMounted(), "the Clock widget is mounted on the Dashboard");
  return app;
}
const held = (app: AppHandle): boolean => app.pathname() === DASHBOARD;
function outcome(branch: Branch): { identityInvalidated: boolean; redirected: boolean; backendSignOuts: number } {
  return {
    identityInvalidated: identityInvalidated(),
    redirected: redirects.includes("/"),
    backendSignOuts: branch === "coordinator" ? auth.counters.coordinatorSignOuts : auth.counters.clearSessionStorage,
  };
}
const NO_SIGN_OUT = { identityInvalidated: false, redirected: false, backendSignOuts: 0 } as const;
const SIGNED_OUT = { identityInvalidated: true, redirected: true, backendSignOuts: 1 } as const;
/** Starts a sign-out with queued confirm answers; returns the new confirm records. */
async function signOutAnswering(answers: readonly boolean[]): Promise<typeof confirmer.calls> {
  confirmer.answers.splice(0, confirmer.answers.length, ...answers);
  confirmer.fallback = false;
  const before = confirmer.calls.length;
  await signOut();
  return confirmer.calls.slice(before);
}
function quiet(tag: string): void {
  expect(runtimeErrors, `${tag}: zero runtime errors`).toEqual([]);
  expect(blockerMessages, `${tag}: no "Invalid blocker state transition"`).toEqual([]);
}

// ---------------------------------------------------------------------------------------------------
// FIXTURE validity (must PASS on every product)
// ---------------------------------------------------------------------------------------------------

it("FX1 F-B002 self-check: the Storage wrappers record and delegate exactly once; faulted attempts (including the key-scoped Clock faults) never delegate; no nested Storage call and no accountScope helper call", () => {
  const result = storageSelfCheck();
  observed("FX1 F-B002 self-check", result);
  const { styleBytesAfterFault: _bytes, ...compared } = result;
  pre(JSON.stringify(compared) === JSON.stringify(SELF_CHECK_EXPECTED), `F-B002 self-check: ${JSON.stringify(result)}`);
  pre(LOCK.style === "xai:pref:v1:xai_clock_style" && LOCK.timezone === "xai:pref:v1:xai_clock_tz", `the per-key lock names (${LOCK.style}, ${LOCK.timezone})`);
});

it("FX2 the Web Lock fixture: asynchronous grants and a test hold keeps a product request waiting until release", async () => {
  const manager = locks();
  const name = "clock-host-fx2";
  let ran = false;
  const first = navigator.locks.request(`${name}-async`, async () => { ran = true; });
  pre(!ran, "grants are asynchronous");
  await first;
  pre(ran, "the asynchronous grant ran");
  const held = await hold(name);
  const order: string[] = [];
  const waiting = navigator.locks.request(name, { mode: "exclusive" }, async () => { order.push("product"); });
  await flush(4);
  pre(order.length === 0 && manager.waiting(name, "product") === 1, "a test-held lock keeps the product request waiting");
  await held.release();
  await waiting;
  pre(order.join(",") === "product", "the product request ran after the release");
  pre(manager.errors.length === 0, `no unsupported request shape (${manager.errors.join("; ")})`);
});

it("FX3 composition and drivers: the production App from the archive with only the auth hook substituted; the Dashboard with the Header, the Clock and the Mini Calendar; the coordinator probe reads the Header's guard; DesktopPet; the recorder, downloads, bus and history counters work; no network", async () => {
  pre(productionRouterAtImport === "/", `the module-level production router was created at "/" and disposed (${productionRouterAtImport})`);
  const app = await dashboard();
  pre(auth.counters.hookCalls > 0, "the substituted useWebAuthSession served the production App");
  pre(document.querySelector(".module-dashboard .dash-head") !== null, "the accepted DashHeader is mounted");
  pre(document.querySelector(".mc-jump") !== null, "the Mini Calendar open action is mounted");
  pre(document.querySelector(".pet-wrap") !== null, "DesktopPet is mounted");
  const probe = coordinator();
  // With no blocking participant the label is the first current participant's (Header or Clock; contract section 6
  // item 6, controller ruling 3), so either is accepted here.
  pre(probe.guard !== null && [W.header, W.participant].includes(String(probe.guard.label)) && probe.intent === null, `the coordinator probe reads the registered guard (${JSON.stringify({ label: probe.guard?.label, version: probe.version })})`);
  pre(networkAttempts() === 0, `no network attempt (${networkAttempts()})`);
  pre(window.confirm("FX3 probe") === false && confirmer.calls.at(-1)?.kind === "other", "the window.confirm recorder records, classifies and answers");
  confirmer.calls.length = 0;
  const anchor = document.createElement("a");
  anchor.download = "fx3.json";
  anchor.href = URL.createObjectURL(new Blob(["{\"fx3\":1}"]));
  anchor.click();
  pre(JSON.stringify(await downloadJson("fx3.json")) === "{\"fx3\":1}", "the download harness records the click and the blob");
  downloads.clicks.length = 0;
  downloads.created.length = 0;
  const before = historyMark(app);
  const busFrom = bus.length;
  await clickRail("tasks");
  pre(app.pathname() === TASKS && historyMutations(app, before).navigations === 1, "a rail click is one router commit");
  pre(JSON.stringify(navigationEvents(busFrom)) === JSON.stringify([{ moduleId: "tasks", source: "app-rail" }]), `the bus recorder sees the navigation event (${JSON.stringify(navigationEvents(busFrom))})`);
  pre(coordinatorState() === null, "off the Dashboard no coordinator is mounted");
  observed("FX3 composition", { scope: scopeSummary(), hookCalls: auth.counters.hookCalls, network: networkAttempts(), productionRouterAtImport, coordinator: { label: probe.guard?.label, version: probe.version } });
});

// ---------------------------------------------------------------------------------------------------
// Clean positive control (must PASS at f9eb4b1)
// ---------------------------------------------------------------------------------------------------

it("PC clean control (coordinator branch): zero-write mount displaying the committed bytes; no recovery region, no unload warning; an AppRail click and Back navigate unheld with the f9eb4b1 navigation event; sign-out without drafts asks nothing and completes", async () => {
  const before = mark();
  const app = await dashboard({ seed: { style: "split", timezone: "sydney" } });
  census("PC clean");
  expect(writesSince(before), "PC §5.1 row a: mounting the production App on the Dashboard makes zero set/remove attempts on every key").toEqual([]);
  expect({ style: shown("style"), timezone: shown("timezone"), region: region() !== null, blocks: [blockState("style"), blockState("timezone")], exportButton: exportButton() !== null },
    "PC §5.7 the committed bytes are displayed; clean: no recovery region, no block, no Export").toStrictEqual({ style: "split", timezone: "sydney", region: false, blocks: [NONE, NONE], exportButton: false });
  expect(probeUnload(), "PC §7.4 no beforeunload warning in a clean state; zero storage attempts").toStrictEqual({ warned: false, attempts: 0 });
  expect(successClaim(), "PC §5.7 no success claim").toBe(false);
  const nav = historyMark(app);
  const busFrom = bus.length;
  await clickRail("tasks");
  expect({ path: app.pathname(), dialog: dialogState(), departures: departures(app, nav) }, "PC row d/rule 16: a clean AppRail click is one navigation and no dialog").toStrictEqual({ path: TASKS, dialog: NO_DIALOG, departures: ["PUSH:/app/tasks"] });
  expect(navigationEvents(busFrom), "PC §10.7 the navigation-caused shell event as at f9eb4b1").toEqual([{ moduleId: "tasks", source: "app-rail" }]);
  await go(app, -1);
  census("PC back");
  expect({ path: app.pathname(), style: shown("style"), timezone: shown("timezone") }, "PC Back returns to the Dashboard with the committed bytes").toStrictEqual({ path: DASHBOARD, style: "split", timezone: "sydney" });
  const signFrom = mark();
  const records = await signOutAnswering([]);
  census("PC sign-out");
  expect({ confirms: confirmsByClass(records), dialog: dialogState().open, outcome: outcome("coordinator") }, "PC §7.5 rule 12: without drafts sign-out makes zero confirms of every class and completes").toStrictEqual({ confirms: ZERO_CONFIRMS, dialog: false, outcome: SIGNED_OUT });
  expect(writesSince(signFrom, CLOCK_KEYS), "PC the sign-out makes zero set/remove attempts on both Clock keys").toEqual([]);
  expect(productStorageEvents(), "PC §10.7 zero product StorageEvents").toEqual([]);
  quiet("PC");
});

// ---------------------------------------------------------------------------------------------------
// Row a: success for all 17 values; CmdK reads the committed bytes (must PASS at f9eb4b1)
// ---------------------------------------------------------------------------------------------------

it("a §9 row a: each of the 17 values through the UI stores exact bytes with exactly one write and no recovery region; readModuleStates() returns those bytes; reopening CmdK and querying the style finds the Clock", async () => {
  await dashboard({ seed: null });
  pre(raw(KEY.style) === null && raw(KEY.timezone) === null, "both Clock keys are absent before the choices");
  expect({ style: shown("style"), timezone: shown("timezone") }, "row a §5.1 absent bytes display the defaults").toStrictEqual(DEFAULTS);
  const results: unknown[] = [];
  for (const field of FIELDS) {
    for (const value of field === "style" ? STYLES : TZS) {
      const from = mark();
      await choose(field, value);
      census(`row a ${field}=${value}`);
      const states = readModuleStates() as unknown as { dashboard: { clockStyle: unknown; clockTz: unknown } };
      const fact = { field, value, writes: writesSince(from), bytes: bytesOf(field), shown: shown(field), region: region() !== null, cmdk: field === "style" ? states.dashboard.clockStyle : states.dashboard.clockTz, popover: clockRoot().querySelector(".clk-tz-popover") !== null };
      results.push(fact);
      expect(fact, `row a §5.4 §10.1: ${field} ${value} through the UI`).toStrictEqual({ field, value, writes: [`set:${KEY[field]}=${value}`], bytes: value, shown: value, region: false, cmdk: value, popover: false });
    }
  }
  observed("row a values", results);
  // Reopen CmdK through the Topbar search box and query the stored style.
  const search = document.querySelector<HTMLElement>("header.topbar .search-box");
  pre(search, "the Topbar search box is mounted");
  fireEvent.click(search);
  await flush();
  const modal = document.querySelector<HTMLElement>('.cmdk-modal[role="dialog"]');
  pre(modal, "the command palette opened");
  const input = modal.querySelector<HTMLInputElement>("input.cmdk-input");
  pre(input, "the palette input is mounted");
  fireEvent.change(input, { target: { value: "analog" } });
  await flush();
  const labels = Array.from(modal.querySelectorAll('[role="option"] .cmdk-row-label')).map(element => (element.textContent ?? "").trim());
  observed("row a CmdK query analog", { labels, bytes: raw(KEY.style) });
  expect(labels, "row a §10.2: after reopening CmdK a query matching the stored style finds the Clock").toContain("Clock");
  fireEvent.keyDown(input, { key: "Escape" });
  await flush();
  pre(document.querySelector(".cmdk-modal") === null, "the command palette closed");
  census("row a end");
  expect(productStorageEvents(), "row a §10.7 zero Clock StorageEvents").toEqual([]);
  quiet("row a");
});

// ---------------------------------------------------------------------------------------------------
// Row b: failure and Retry, per key (correct FAIL at f9eb4b1: H1, H2)
// ---------------------------------------------------------------------------------------------------

for (const field of FIELDS) {
  it(`b §9 row b ${field}: a quota failure keeps the choice displayed with the block (Retry, Discard); a successful Retry makes exactly one write and removes the block (H1/H2)`, async () => {
    await dashboard();
    const quota = await failChoice(field, CHOICE[field]);
    census(`row b ${field} failed`);
    observed(`row b ${field} after the failed choice`, { shown: shown(field), bytes: bytesOf(field), block: blockState(field), region: region() !== null, unload: probeUnload() });
    expect(shown(field), `${field === "style" ? "H1" : "H2"} §5.5 row b: the latest choice stays displayed after the failed write`).toBe(CHOICE[field]);
    expect(blockState(field), "§5.7 row b: the settled-unsuccessful block with Retry and Discard").toStrictEqual(FAILED);
    expect({ bytes: bytesOf(field), enabled: controlsEnabled(), success: successClaim() }, "§5.5 the bytes keep the baseline; controls enabled; no success claim").toStrictEqual({ bytes: BASE[field], enabled: true, success: false });
    quota.off();
    const from = mark();
    await click(need(action(field, "retry"), `Retry ${W.label[field]}`));
    census(`row b ${field} retried`);
    expect({ writes: writesSince(from, CLOCK_KEYS), bytes: bytesOf(field), block: blockState(field), region: region() !== null }, "row b: a successful Retry makes exactly one write with exact bytes and removes the block").toStrictEqual({ writes: [`set:${KEY[field]}=${CHOICE[field]}`], bytes: CHOICE[field], block: NONE, region: false });
    quiet(`row b ${field}`);
  });
}

// ---------------------------------------------------------------------------------------------------
// Row c: a write held behind the real per-key lock (correct FAIL at f9eb4b1: H3) and lock independence (PASS)
// ---------------------------------------------------------------------------------------------------

for (const field of FIELDS) {
  it(`c §9 row c ${field}: while the write is held behind the real per-key lock there is no block, the controls stay enabled and no write lands; an AppRail click is held under "Clock"; on release one write and one release to the AppRail target (H3)`, async () => {
    const app = await dashboard();
    const lock = await hold(LOCK[field]);
    const from = mark();
    await choose(field, CHOICE[field]);
    census(`row c ${field} held`);
    observed(`row c ${field} while held`, { shown: shown(field), writes: writesSince(from, CLOCK_KEYS), bytes: bytesOf(field), block: blockState(field), lock: locks().heldBy(LOCK[field]), waiting: locks().waiting(LOCK[field], "product") });
    expect({ shown: shown(field), block: blockState(field), region: region() !== null, enabled: controlsEnabled() }, "§5.4 row c: the choice displays immediately; pending shows no block; controls stay enabled").toStrictEqual({ shown: CHOICE[field], block: NONE, region: false, enabled: true });
    expect(writesSince(from, CLOCK_KEYS), "H3 §5.4 row c: no write lands while the real per-key lock is held").toEqual([]);
    const nav = historyMark(app);
    await clickRail("tasks");
    census(`row c ${field} rail click`);
    expect({ held: held(app), dialog: dialogState() }, "H5 §7.3 row c: the AppRail click is held under \"Clock\"").toStrictEqual({ held: true, dialog: dialogFor(W.participant) });
    await lock.release();
    census(`row c ${field} released`);
    expect({ writes: writesSince(from, CLOCK_KEYS), bytes: bytesOf(field), departures: departures(app, nav), dialog: dialogState().open }, "§6.8 row c rule 16: on release exactly one write and one release to the AppRail target").toStrictEqual({ writes: [`set:${KEY[field]}=${CHOICE[field]}`], bytes: CHOICE[field], departures: ["PUSH:/app/tasks"], dialog: false });
    quiet(`row c ${field}`);
  });
}

it("c §9 row c lock independence (positive control): while prefMutationLockName(\"xai_rail_order\") and prefMutationLockName(\"xai_pref_theme\") are held, each Clock choice still completes with exactly one write", async () => {
  await dashboard();
  const rail = await hold(RAIL_LOCK);
  const theme = await hold(THEME_LOCK);
  for (const field of FIELDS) {
    const from = mark();
    await choose(field, CHOICE[field]);
    census(`row c independence ${field}`);
    expect({ writes: writesSince(from, CLOCK_KEYS), bytes: bytesOf(field), shown: shown(field), block: blockState(field) }, `§7.1 row c: a held rail-order or Appearance per-key lock does not delay the ${field} write`).toStrictEqual({ writes: [`set:${KEY[field]}=${CHOICE[field]}`], bytes: CHOICE[field], shown: CHOICE[field], block: NONE });
  }
  pre(locks().heldBy(RAIL_LOCK) === "test" && locks().heldBy(THEME_LOCK) === "test", "both foreign locks stayed held by the test throughout");
  await rail.release();
  await theme.release();
  census("row c independence end");
  quiet("row c independence");
});

// ---------------------------------------------------------------------------------------------------
// Row d: failure, then an AppRail click (correct FAIL at f9eb4b1: H5)
// ---------------------------------------------------------------------------------------------------

it("d §9 row d: after a failed Clock choice an AppRail click is held; Stay keeps everything with zero history mutations; dialog Discard makes zero set/remove attempts on both keys and navigates once (H5)", async () => {
  const app = await dashboard();
  await failChoice("style", CHOICE.style);
  const nav = historyMark(app);
  const busFrom = bus.length;
  await clickRail("tasks");
  census("row d clicked");
  observed("row d after the AppRail click", { path: app.pathname(), dialog: dialogState(), departures: departures(app, nav), navigation: navigationEvents(busFrom) });
  expect({ held: held(app), dialog: dialogState() }, "H5 §7.3 row d: the AppRail click is held under \"Clock\"").toStrictEqual({ held: true, dialog: dialogFor(W.participant) });
  await click(dialogButton(DIALOG.stay));
  census("row d stay");
  expect({ mutations: historyMutations(app, nav), block: blockState("style"), shown: shown("style") }, "row d Stay: zero history mutations; the draft is kept").toStrictEqual({ mutations: NO_HISTORY_MUTATION, block: FAILED, shown: CHOICE.style });
  await clickRail("tasks");
  pre(dialog(), "the next AppRail click is held again");
  const from = mark();
  await click(dialogButton(DIALOG.discard));
  census("row d discard");
  expect({ writes: writesSince(from, CLOCK_KEYS), departures: departures(app, nav), bytes: bytesOf("style") }, "§6.7 row d rule 16: dialog Discard writes nothing on either Clock key and navigates once").toStrictEqual({ writes: [], departures: ["PUSH:/app/tasks"], bytes: BASE.style });
  quiet("row d");
});

// ---------------------------------------------------------------------------------------------------
// Row e: failure, then Back and Forward (correct FAIL at f9eb4b1: H5)
// ---------------------------------------------------------------------------------------------------

it("e §9 row e Back: after a failed Clock choice, Back is held (POP); a successful Retry releases exactly once to the location an ordinary Back reaches (H5)", async () => {
  const app = await dashboard({ entries: [TASKS] });
  const target = app.location();
  await clickRail("dashboard");
  pre(app.pathname() === DASHBOARD && clockMounted(), "an ordinary rail navigation reached the Dashboard");
  census("row e back mounted");
  const quota = await failChoice("style", CHOICE.style);
  const nav = historyMark(app);
  await go(app, -1);
  census("row e back");
  observed("row e after Back", { path: app.pathname(), dialog: dialogState(), departures: departures(app, nav) });
  expect({ held: held(app), dialog: dialogState() }, "H5 §7.3 row e: Back is held under \"Clock\"").toStrictEqual({ held: true, dialog: dialogFor(W.participant) });
  quota.off();
  await click(need(action("style", "retry"), "Retry Clock style"));
  census("row e back retried");
  expect({ departures: departures(app, nav), location: app.location(), bytes: bytesOf("style") }, "§6.8 row e rule 16: a successful Retry releases exactly once; {pathname,key,state} equals an ordinary Back").toStrictEqual({ departures: ["POP:/app/tasks"], location: target, bytes: CHOICE.style });
  quiet("row e back");
});

it("e §9 row e Forward: after a failed Clock choice, Forward is held (POP); a successful Retry releases exactly once to the location an ordinary Forward reaches (H5)", async () => {
  const app = await dashboard();
  await clickRail("tasks");
  const target = app.location();
  pre(target.pathname === TASKS, "an ordinary rail navigation reached Tasks");
  await go(app, -1);
  pre(app.pathname() === DASHBOARD && clockMounted(), "an ordinary Back returned to the Dashboard");
  census("row e forward mounted");
  const quota = await failChoice("timezone", CHOICE.timezone);
  const nav = historyMark(app);
  await go(app, 1);
  census("row e forward");
  observed("row e after Forward", { path: app.pathname(), dialog: dialogState(), departures: departures(app, nav) });
  expect({ held: held(app), dialog: dialogState() }, "H5 §7.3 row e: Forward is held under \"Clock\"").toStrictEqual({ held: true, dialog: dialogFor(W.participant) });
  quota.off();
  await click(need(action("timezone", "retry"), "Retry Clock timezone"));
  census("row e forward retried");
  expect({ departures: departures(app, nav), location: app.location(), bytes: bytesOf("timezone") }, "§6.8 row e rule 16: a successful Retry releases exactly once; {pathname,key,state} equals an ordinary Forward").toStrictEqual({ departures: ["POP:/app/tasks"], location: target, bytes: CHOICE.timezone });
  quiet("row e forward");
});

// ---------------------------------------------------------------------------------------------------
// Row f: failure, then a widget goTo (correct FAIL at f9eb4b1: H5)
// ---------------------------------------------------------------------------------------------------

it("f §9 row f: after a failed Clock choice the Mini Calendar's open action is held; Stay keeps the Dashboard; Discard navigates once (H5)", async () => {
  const app = await dashboard();
  await failChoice("timezone", CHOICE.timezone);
  const jump = document.querySelector<HTMLElement>(".mc-jump");
  pre(jump, "the Mini Calendar open action is mounted");
  const nav = historyMark(app);
  const busFrom = bus.length;
  fireEvent.click(jump);
  await flush(24);
  census("row f goTo");
  observed("row f after goTo", { path: app.pathname(), dialog: dialogState(), departures: departures(app, nav), navigation: navigationEvents(busFrom) });
  expect({ held: held(app), dialog: dialogState() }, "H5 §7.3 row f: the widget goTo is held under \"Clock\"").toStrictEqual({ held: true, dialog: dialogFor(W.participant) });
  await click(dialogButton(DIALOG.stay));
  census("row f stay");
  expect({ path: app.pathname(), mutations: historyMutations(app, nav) }, "row f Stay keeps the Dashboard").toStrictEqual({ path: DASHBOARD, mutations: NO_HISTORY_MUTATION });
  fireEvent.click(need(document.querySelector<HTMLElement>(".mc-jump"), "the Mini Calendar open action"));
  await flush(24);
  const from = mark();
  await click(dialogButton(DIALOG.discard));
  census("row f discard");
  expect({ writes: writesSince(from, CLOCK_KEYS), departures: departures(app, nav) }, "row f rule 16: Discard writes nothing on either Clock key and navigates once").toStrictEqual({ writes: [], departures: ["PUSH:/app/calendar"] });
  quiet("row f");
});

// ---------------------------------------------------------------------------------------------------
// Row g: sign-out with a Clock draft and no rail or Appearance draft, both branches (correct FAIL at f9eb4b1: H5)
// ---------------------------------------------------------------------------------------------------

for (const branch of BRANCHES) {
  it(`g §9 row g ${branch}: sign-out with a Clock draft and no rail or Appearance draft; zero confirms of every class; the coordinator dialog "Clock": Stay resolves false; a second attempt with Discard writes nothing and invalidates identity (H5)`, async () => {
    useBranch(branch);
    const app = await dashboard();
    await failChoice("style", CHOICE.style);
    const scopeBefore = accountScope.capture();
    const nav = historyMark(app);
    const records = await signOutAnswering([]);
    census(`row g ${branch} attempt 1`);
    observed(`row g ${branch} attempt 1`, { confirms: confirmsByClass(records), dialog: dialogState(), outcome: outcome(branch), scope: scopeSummary(), redirects: [...redirects] });
    expect(confirmsByClass(records), "§7.5 rule 12 row g: the rail and Appearance steps make zero confirms of every class before the coordinator dialog").toStrictEqual(ZERO_CONFIRMS);
    expect(dialogState(), "H5 §7.5 row g: the coordinator dialog appears for the Clock").toStrictEqual(dialogFor(W.participant));
    await click(dialogButton(DIALOG.stay));
    census(`row g ${branch} stay`);
    expect({ outcome: outcome(branch), sameScope: accountScope.capture() === scopeBefore, mutations: historyMutations(app, nav), block: blockState("style") }, "§7.5 row g Stay: resolves false; identity intact; zero history mutations; the draft is kept").toStrictEqual({ outcome: NO_SIGN_OUT, sameScope: true, mutations: NO_HISTORY_MUTATION, block: FAILED });
    const from = mark();
    const second = await signOutAnswering([]);
    pre(dialog(), "the second sign-out attempt shows the coordinator dialog");
    const commitsBefore = app.commits.length;
    await click(dialogButton(DIALOG.discard));
    census(`row g ${branch} discard`);
    expect({ confirms: confirmsByClass([...records, ...second]), writes: writesSince(from, CLOCK_KEYS), outcome: outcome(branch), routerCommits: app.commits.length - commitsBefore }, "§7.5 row g rule 16: Discard writes nothing on either Clock key; one identity invalidation; no router commit; the recorder stays empty").toStrictEqual({ confirms: ZERO_CONFIRMS, writes: [], outcome: SIGNED_OUT, routerCommits: 0 });
    quiet(`row g ${branch}`);
  });
}

// ---------------------------------------------------------------------------------------------------
// Row h: beforeunload (correct FAIL at f9eb4b1: H5)
// ---------------------------------------------------------------------------------------------------

it("h §9 row h settled: no warning in the clean state; a settled Clock draft warns with zero storage attempts in the handler; Discard removes the warning (H5)", async () => {
  await dashboard();
  census("row h clean");
  expect(probeUnload(), "§7.4 row h: no warning in the clean state").toStrictEqual({ warned: false, attempts: 0 });
  await failChoice("style", CHOICE.style);
  census("row h settled");
  const settled = probeUnload();
  observed("row h settled", { settled, block: blockState("style") });
  expect(settled, "H5 §7.4 row h: a settled Clock draft warns; zero storage attempts in the handler").toStrictEqual({ warned: true, attempts: 0 });
  await click(need(action("style", "discard"), "Discard Clock style"));
  census("row h discarded");
  expect(probeUnload(), "§7.4 row h: the warning is removed when the drafts clear").toStrictEqual({ warned: false, attempts: 0 });
  quiet("row h settled");
});

it("h §9 row h pending: a pending Clock choice held behind the real per-key lock warns with zero storage attempts in the handler; after the write lands there is no warning (H5)", async () => {
  await dashboard();
  const lock = await hold(LOCK.timezone);
  await choose("timezone", CHOICE.timezone);
  census("row h pending");
  const pending = probeUnload();
  observed("row h pending", { pending, bytes: bytesOf("timezone"), block: blockState("timezone") });
  expect(pending, "H5 §7.4 row h: a pending Clock draft warns; zero storage attempts in the handler").toStrictEqual({ warned: true, attempts: 0 });
  await lock.release();
  census("row h released");
  expect({ unload: probeUnload(), bytes: bytesOf("timezone") }, "§7.4 row h: after the write lands the warning is removed").toStrictEqual({ unload: { warned: false, attempts: 0 }, bytes: CHOICE.timezone });
  quiet("row h pending");
});

// ---------------------------------------------------------------------------------------------------
// Row i: cross-document (idle half PASS at f9eb4b1; drafted half correct FAIL)
// ---------------------------------------------------------------------------------------------------

it("i §9 row i idle (positive control, H7): an idle Clock updates live when another document commits each field, with zero writes and no recovery region", async () => {
  await dashboard();
  const from = mark();
  await external(KEY.style, "minimal");
  census("row i idle style");
  expect({ shown: shown("style"), region: region() !== null }, "H7 §10.5 row i: the idle style follows document B live").toStrictEqual({ shown: "minimal", region: false });
  await external(KEY.timezone, "sydney");
  census("row i idle timezone");
  expect({ shown: shown("timezone"), region: region() !== null }, "H7 §10.5 row i: the idle timezone follows document B live").toStrictEqual({ shown: "sydney", region: false });
  await external(KEY.style, null);
  census("row i idle removal");
  expect(shown("style"), "H7 row i: a removal by document B displays the default").toBe(DEFAULTS.style);
  expect(writesSince(from), "row i: the idle document A makes zero set/remove attempts").toEqual([]);
  quiet("row i idle");
});

it("i §9 row i drafted: a drafted field in document A becomes a preserved conflict when document B commits that field; A keeps its draft displayed with the block; Retry never overwrites B's bytes (H1/H2)", async () => {
  await dashboard();
  for (const field of FIELDS) {
    const quota = await failChoice(field, CHOICE[field]);
    quota.off();
    const external_ = field === "style" ? "minimal" : "sydney";
    await external(KEY[field], external_);
    census(`row i drafted ${field}`);
    observed(`row i drafted ${field} after document B`, { shown: shown(field), bytes: bytesOf(field), block: blockState(field) });
    expect({ shown: shown(field), block: blockState(field), bytes: bytesOf(field) }, `§5.6 §10.5 row i: the drafted ${field} keeps the draft displayed as a preserved conflict; B's bytes stay`).toStrictEqual({ shown: CHOICE[field], block: FAILED, bytes: external_ });
    const from = mark();
    await click(need(action(field, "retry"), `Retry ${W.label[field]}`));
    census(`row i drafted ${field} retried`);
    expect({ writes: writesSince(from, CLOCK_KEYS).filter(entry => !entry.endsWith("!threw")), bytes: bytesOf(field), block: blockState(field).present }, `§5.6 row i: Retry never overwrites document B's ${field}`).toStrictEqual({ writes: [], bytes: external_, block: true });
    await click(need(action(field, "discard"), `Discard ${W.label[field]}`));
  }
  quiet("row i drafted");
});

// ---------------------------------------------------------------------------------------------------
// Row j: malformed bytes and a key-scoped throwing read at load (correct FAIL at f9eb4b1: H4)
// ---------------------------------------------------------------------------------------------------

const REPAIR: Readonly<Record<Field, string>> = { style: "split", timezone: "paris" };
const SOURCE_CASES: ReadonlyArray<{ field: Field; label: string; arm: () => Fault | null }> = [
  ...FIELDS.flatMap(field => MALFORMED[field].map(value => ({ field, label: `${KEY[field]}=${JSON.stringify(value)}`, arm: () => { seedMalformed(field, value); return null; } }))),
  ...FIELDS.map(field => ({ field, label: `${KEY[field]} getItem throws (key-scoped)`, arm: () => { seedClock(field, BASE[field]); return fault("get", KEY[field], `${KEY[field]} read denied`); } })),
];
for (const entry of SOURCE_CASES) {
  it(`j §9 row j ${entry.label}: no route error; the default displayed; the source block with Reload only; no hold, no unload warning, zero writes; after document B repairs the bytes, Reload shows them (H4)`, async () => {
    const other = entry.field === "style" ? "timezone" : "style";
    seedClock(other, BASE[other]);
    const readFault = entry.arm();
    const from = mark();
    const app = await mountRaw([DASHBOARD]);
    expect(routeError(), `§5.2 §10.4 row j: ${entry.label} at load renders no route error`).toBeNull();
    pre(clockMounted(), "the Clock widget is mounted on the Dashboard");
    census(`row j ${entry.label}`);
    if (readFault) fired(readFault, "the key-scoped throwing read at load");
    const state = { shown: shown(entry.field), block: blockState(entry.field), sibling: blockState(other), exportButton: exportButton() !== null, unload: probeUnload(), writes: writesSince(from, CLOCK_KEYS) };
    observed(`row j ${entry.label}`, { ...state, bytes: raw(KEY[entry.field]), dialog: dialogState().open });
    expect(state.shown, "§5.2 row j: the field displays its default").toBe(DEFAULTS[entry.field]);
    expect(state.block, "H4 §5.2 §5.7 row j: the source block with Reload only").toStrictEqual(SOURCE);
    expect({ sibling: state.sibling, exportButton: state.exportButton, unload: state.unload, writes: state.writes }, "§5.2 row j: no sibling issue, no Export, no unload warning, zero writes").toStrictEqual({ sibling: NONE, exportButton: false, unload: { warned: false, attempts: 0 }, writes: [] });
    readFault?.off();
    await external(KEY[entry.field], REPAIR[entry.field]);
    await click(need(action(entry.field, "reload"), `Reload ${W.label[entry.field]}`));
    census(`row j ${entry.label} reloaded`);
    expect({ shown: shown(entry.field), block: blockState(entry.field), writes: writesSince(from, CLOCK_KEYS) }, "§5.8 row j: after document B repairs the bytes, Reload shows them; zero writes").toStrictEqual({ shown: REPAIR[entry.field], block: NONE, writes: [] });
    const nav = historyMark(app);
    await clickRail("tasks");
    census(`row j ${entry.label} rail click`);
    expect(departures(app, nav), "§6.7 matrix row 3: a source-only issue never holds an AppRail click").toEqual(["PUSH:/app/tasks"]);
    quiet(`row j ${entry.label}`);
  });
}

// ---------------------------------------------------------------------------------------------------
// Row k: combined Header and Clock (correct FAIL at f9eb4b1: H6)
// ---------------------------------------------------------------------------------------------------

it("k §9 row k1: a failed Header save and a failed Clock choice hold an AppRail click under \"Dashboard\"; dialog Export calls each participant's export once (two files); dialog Discard discards both with zero Clock writes and navigates once (H6)", async () => {
  const app = await dashboard();
  await failHeaderSave();
  await failChoice("style", CHOICE.style);
  const nav = historyMark(app);
  await clickRail("tasks");
  census("row k1 held");
  observed("row k1 held", { held: held(app), dialog: dialogState(), guard: coordinator().guard?.label });
  expect(held(app), "§6.6 row k1: the AppRail click is held").toBe(true);
  expect(dialogState(), "H6 §6.6 row k1: two blocking participants are labelled \"Dashboard\"").toStrictEqual(dialogFor(W.combined));
  const downloadFrom = downloads.clicks.length;
  await click(dialogButton(DIALOG.exportDraft));
  census("row k1 export");
  expect([...downloadNames(downloadFrom)].sort(), "H6 §8 row k1: one dialog Export downloads each participant's file exactly once").toEqual(["clock-draft.json", "dashboard-note-draft.json"]);
  expect({ clock: await downloadJson("clock-draft.json", downloadFrom), header: await downloadJson("dashboard-note-draft.json", downloadFrom) }, "§8 row k1: the Clock envelope and the Header's accepted format").toStrictEqual({ clock: envelope({ style: CHOICE.style }), header: HEADER_EXPORT });
  expect(held(app), "§7.3 Export never releases navigation").toBe(true);
  const from = mark();
  await click(dialogButton(DIALOG.discard));
  census("row k1 discard");
  expect({ writes: writesSince(from, [...CLOCK_KEYS, noteKey]), departures: departures(app, nav), note: raw(noteKey), style: bytesOf("style") }, "H6 §6.6 row k1 rule 16: dialog Discard discards both drafts with zero writes and navigates once").toStrictEqual({ writes: [], departures: ["PUSH:/app/tasks"], note: HEADER_ORIGINAL, style: BASE.style });
  quiet("row k1");
});

it("k §9 row k2: with a failed Header save and a failed Clock choice the hold is labelled \"Dashboard\"; a Clock Retry success keeps the hold, now \"Dashboard header\"; a Header Retry success releases it exactly once (H6)", async () => {
  const app = await dashboard();
  const noteQuota = await failHeaderSave();
  const clockQuota = await failChoice("timezone", CHOICE.timezone);
  const nav = historyMark(app);
  await clickRail("tasks");
  census("row k2 held");
  observed("row k2 held", { held: held(app), dialog: dialogState(), guard: coordinator().guard?.label });
  expect(held(app), "§6.6 row k2: the AppRail click is held").toBe(true);
  expect(dialogState(), "H6 §6.6 row k2: two blocking participants are labelled \"Dashboard\"").toStrictEqual(dialogFor(W.combined));
  clockQuota.off();
  await click(need(action("timezone", "retry"), "Retry Clock timezone"));
  census("row k2 clock retried");
  expect({ held: held(app), dialog: dialogState(), bytes: bytesOf("timezone") }, "§6.8 row k2: a Clock Retry success keeps the hold, now labelled by the Header").toStrictEqual({ held: true, dialog: dialogFor(W.header), bytes: CHOICE.timezone });
  noteQuota.off();
  fireEvent.click(headerRetry());
  await flush(24);
  census("row k2 header retried");
  expect({ departures: departures(app, nav), note: raw(noteKey) }, "§6.8 row k2 rule 16: a Header Retry success releases the hold exactly once").toStrictEqual({ departures: ["PUSH:/app/tasks"], note: HEADER_DRAFT });
  quiet("row k2");
});

// ---------------------------------------------------------------------------------------------------
// Row l: Header-only equivalence (must PASS at f9eb4b1)
// ---------------------------------------------------------------------------------------------------

it("l §9 row l (positive control): a failed Header save only holds an AppRail click under \"Dashboard header\"; dialog Export downloads one Header file; dialog Discard proceeds once with zero Clock writes", async () => {
  const app = await dashboard();
  await failHeaderSave();
  const nav = historyMark(app);
  const busFrom = bus.length;
  await clickRail("tasks");
  census("row l held");
  expect({ held: held(app), dialog: dialogState() }, "§6.6 row l: Header-only, the hold is labelled \"Dashboard header\"").toStrictEqual({ held: true, dialog: dialogFor(W.header) });
  expect(navigationEvents(busFrom), "§10.7 the navigation-caused shell event as at f9eb4b1").toEqual([{ moduleId: "tasks", source: "app-rail" }]);
  const downloadFrom = downloads.clicks.length;
  await click(dialogButton(DIALOG.exportDraft));
  census("row l export");
  expect({ names: downloadNames(downloadFrom), header: await downloadJson("dashboard-note-draft.json", downloadFrom), held: held(app) }, "§6.6 row l: dialog Export downloads exactly the Header file; navigation stays held").toStrictEqual({ names: ["dashboard-note-draft.json"], header: HEADER_EXPORT, held: true });
  const from = mark();
  await click(dialogButton(DIALOG.discard));
  census("row l discard");
  expect({ writes: writesSince(from, [...CLOCK_KEYS, noteKey]), departures: departures(app, nav), note: raw(noteKey) }, "§6.6 row l rule 16: dialog Discard proceeds once; zero writes").toStrictEqual({ writes: [], departures: ["PUSH:/app/tasks"], note: HEADER_ORIGINAL });
  quiet("row l");
});

it("l §9 row l (positive control): a failed Header save only, then a successful Header Retry auto-releases the held AppRail click exactly once", async () => {
  const app = await dashboard();
  const noteQuota = await failHeaderSave();
  const nav = historyMark(app);
  await clickRail("tasks");
  census("row l retry held");
  expect({ held: held(app), dialog: dialogState() }, "§6.6 row l: held under \"Dashboard header\"").toStrictEqual({ held: true, dialog: dialogFor(W.header) });
  noteQuota.off();
  const from = mark();
  fireEvent.click(headerRetry());
  await flush(24);
  census("row l header retried");
  expect({ departures: departures(app, nav), note: raw(noteKey), clockWrites: writesSince(from, CLOCK_KEYS), dialog: dialog() !== null }, "§6.8 row l rule 16: a Header Retry success releases exactly once").toStrictEqual({ departures: ["PUSH:/app/tasks"], note: HEADER_DRAFT, clockWrites: [], dialog: false });
  quiet("row l retry");
});

// ---------------------------------------------------------------------------------------------------
// Row m: widget removal with a failed Clock draft (correct FAIL at f9eb4b1: H1/H5)
// ---------------------------------------------------------------------------------------------------

it("m §9 row m: with a failed Clock draft (block and unload warning), a successful removal discards it with zero Clock writes, removes the participant and the warning; the next AppRail click is not held (A7)", async () => {
  const app = await dashboard();
  await failChoice("style", CHOICE.style);
  census("row m failed");
  const before = { block: blockState("style"), unload: probeUnload() };
  observed("row m before removal", { ...before, guard: coordinator().guard?.label, version: coordinator().version });
  expect(before, "H1 H5 §7.6 row m: a failed Clock draft exists before the removal (block and unload warning)").toStrictEqual({ block: FAILED, unload: { warned: true, attempts: 0 } });
  const from = mark();
  await click(removeClockButton());
  pre(!clockMounted(), "the Clock widget was removed (the order write succeeded)");
  census("row m removed");
  expect({ writes: writesSince(from, CLOCK_KEYS), unload: probeUnload(), dialog: dialog() !== null, guard: coordinator().guard?.label ?? null }, "§7.6 row m: zero Clock set/remove attempts; no warning; no dialog; no Clock participant (the Header labels the guard)").toStrictEqual({ writes: [], unload: { warned: false, attempts: 0 }, dialog: false, guard: W.header });
  const nav = historyMark(app);
  await clickRail("tasks");
  census("row m rail click");
  expect(departures(app, nav), "§7.6 matrix row 6 row m: the next AppRail click is not held").toEqual(["PUSH:/app/tasks"]);
  quiet("row m");
});

// ---------------------------------------------------------------------------------------------------
// Row n: widget drag with a failed Clock draft (correct FAIL at f9eb4b1: H1/H5)
// ---------------------------------------------------------------------------------------------------

it("n §9 row n: over a pointer drag of the Clock widget the ghost makes zero set/remove attempts (reads recorded) and adds no participant registration; after the drop the block is still shown and departure is still held", async () => {
  const app = await dashboard();
  await failChoice("style", CHOICE.style);
  census("row n failed");
  const versionBefore = coordinator().version;
  const from = mark();
  await startWidgetDrag();
  const during = { ghost: ghost() !== null, ghostClock: ghost()?.querySelector(".w-clock-body") !== null, version: coordinator().version };
  await moveWidgetDrag();
  await endWidgetDrag();
  census("row n dropped");
  const drag = { writes: writesSince(from, CLOCK_KEYS), reads: readsSince(from, CLOCK_KEYS), versionDuring: during.version, versionAfter: coordinator().version, orderWrites: writesSince(from, ["xai_dash_order"]) };
  observed("row n over the drag", { during, ...drag, versionBefore });
  pre(during.ghost && during.ghostClock, "the ghost rendered a second Clock during the drag");
  expect({ writes: drag.writes, registrations: drag.versionAfter - versionBefore }, "§7.7 row n (ruling 1): the ghost makes zero set/remove attempts and adds no participant registration over the drag").toStrictEqual({ writes: [], registrations: 0 });
  expect({ block: blockState("style"), shown: shown("style") }, "H1 §7.7 row n: after the drop the source block is still shown with the draft").toStrictEqual({ block: FAILED, shown: CHOICE.style });
  await clickRail("tasks");
  census("row n rail click");
  expect({ held: held(app), dialog: dialogState() }, "H5 §7.7 row n: departure is still held under \"Clock\"").toStrictEqual({ held: true, dialog: dialogFor(W.participant) });
  quiet("row n");
});

// ---------------------------------------------------------------------------------------------------
// Row o: forced scope change from a second document (must PASS at f9eb4b1; REL-09)
// ---------------------------------------------------------------------------------------------------

it("o §9 row o (positive control): a forced scope change through the identity channel from a second document remounts App; the Clock displays the committed bytes, with no recovery region, no success claim, zero Clock writes and zero runtime errors", async () => {
  await dashboard({ seed: { style: "split", timezone: "tokyo" } });
  const quota = await failChoice("style", "minimal");
  quota.off();
  const epochBefore = scopeSummary().epoch;
  const from = mark();
  await external(IDENTITY_KEY, JSON.stringify({ accountId: OTHER, nonce: "clock-host-o-1" }));
  const away = { clock: clockMounted(), gate: document.querySelector(".account-data-gate") !== null, scope: scopeSummary() };
  await external(IDENTITY_KEY, JSON.stringify({ accountId: OWNER, nonce: "clock-host-o-2" }));
  await flush(24);
  const after = scopeSummary();
  observed("row o forced scope change", { away, after, epochBefore, refreshSession: auth.counters.refreshSession, writes: writesSince(from) });
  pre(!away.clock && after.kind === "account" && after.accountId === OWNER && after.epoch > epochBefore && clockMounted(), `the identity channel forced A -> ${OTHER} -> A and App remounted (${JSON.stringify({ away, after, epochBefore })})`);
  census("row o remounted");
  expect({ style: shown("style"), timezone: shown("timezone"), region: region() !== null, success: successClaim(), writes: writesSince(from, CLOCK_KEYS), routeError: routeError() }, "§7.2 REL-09 row o: after the remount the committed bytes are displayed; no recovery region, no success claim, zero Clock writes").toStrictEqual({ style: "split", timezone: "tokyo", region: false, success: false, writes: [], routeError: null });
  quiet("row o");
});

// ---------------------------------------------------------------------------------------------------
// Row p: ticks (must PASS at f9eb4b1)
// ---------------------------------------------------------------------------------------------------

it("p §9 row p (positive control): over at least three ticks without edits there are zero participant re-registrations and zero set/remove attempts; with a draft present, zero additional re-registrations across the ticks", async () => {
  await dashboard();
  await flush(24);
  const clean = { version: coordinator().version, guard: coordinator().guard, face: faceText(), from: mark() };
  await waitReal(3300);
  census("row p clean ticks");
  const cleanAfter = { version: coordinator().version, sameGuard: coordinator().guard === clean.guard, face: faceText(), writes: writesSince(clean.from), clockReads: readsSince(clean.from, CLOCK_KEYS) };
  pre(cleanAfter.face !== clean.face, `the Clock face ticked (${clean.face} -> ${cleanAfter.face})`);
  expect({ registrations: cleanAfter.version - clean.version, sameGuard: cleanAfter.sameGuard, writes: cleanAfter.writes }, "§6.7 matrix row 11 row p: ticks alone make zero re-registrations and zero set/remove attempts").toStrictEqual({ registrations: 0, sameGuard: true, writes: [] });
  await failChoice("style", CHOICE.style);
  await flush(24);
  const drafted = { version: coordinator().version, guard: coordinator().guard, face: faceText(), from: mark() };
  await waitReal(3300);
  census("row p drafted ticks");
  const draftedAfter = { version: coordinator().version, sameGuard: coordinator().guard === drafted.guard, face: faceText(), writes: writesSince(drafted.from), clockReads: readsSince(drafted.from, CLOCK_KEYS) };
  pre(draftedAfter.face !== drafted.face, `the Clock face ticked with the draft present (${drafted.face} -> ${draftedAfter.face})`);
  observed("row p", { clean: { ...clean, guard: clean.guard?.label }, cleanAfter, drafted: { ...drafted, guard: drafted.guard?.label }, draftedAfter });
  expect({ registrations: draftedAfter.version - drafted.version, sameGuard: draftedAfter.sameGuard, writes: draftedAfter.writes }, "§6.7 row p: with a draft present, zero additional re-registrations and zero new set/remove attempts across the ticks").toStrictEqual({ registrations: 0, sameGuard: true, writes: [] });
  quiet("row p");
});

// ---------------------------------------------------------------------------------------------------
// Row q: sign-out with a rail draft and a Clock draft, both branches (Cancel half PASS; OK half correct FAIL)
// ---------------------------------------------------------------------------------------------------

/** Row q setup: a rail draft from one rail drag whose drop write fails (quota scoped to xai_rail_order), then a failed Clock choice. */
async function railAndClockDrafts(): Promise<{ app: AppHandle; railQuota: Fault; clockQuota: Fault }> {
  const app = await dashboard();
  pre(raw(RAIL_KEY) === null, "xai_rail_order is absent (seed rule 10)");
  const railQuota = fault("set", RAIL_KEY, "rail order drop write denied");
  await dragRail(0, 3);
  await flush(24);
  fired(railQuota, "the rail drop write");
  pre(raw(RAIL_KEY) === null, "the denied rail write left xai_rail_order absent");
  census("row q rail draft", "failed-closed");
  const clockQuota = await failChoice("style", CHOICE.style);
  census("row q clock draft", "failed-closed");
  return { app, railQuota, clockQuota };
}
interface CancelFacts { confirms: Record<string, number>; firstKind: string | null; dialog: boolean; clock: unknown; guardVersion: number; sameGuard: boolean; clockWrites: string[]; clockReads: number; downloads: number; rail: string[]; railStatus: boolean; mutations: unknown; sameScope: boolean; outcome: unknown }
/** Attempt 1: Cancel at the rail prompt. Returns the facts the contract names. */
async function cancelAtRail(app: AppHandle, branch: Branch): Promise<CancelFacts> {
  const clockBefore = clockSnapshot();
  const probe = coordinator();
  const railBefore = railLabels();
  const scopeBefore = accountScope.capture();
  const nav = historyMark(app);
  const from = mark();
  const downloadFrom = downloads.clicks.length;
  const records = await signOutAnswering([false]);
  census("row q attempt 1", "failed-closed");
  const facts: CancelFacts = {
    confirms: confirmsByClass(records),
    firstKind: records[0]?.kind ?? null,
    dialog: dialog() !== null,
    clock: clockSnapshot(),
    guardVersion: coordinator().version - probe.version,
    sameGuard: coordinator().guard === probe.guard,
    clockWrites: writesSince(from, CLOCK_KEYS),
    clockReads: readsSince(from, CLOCK_KEYS),
    downloads: downloads.clicks.length - downloadFrom,
    rail: railLabels(),
    railStatus: railStatusAny() !== null,
    mutations: historyMutations(app, nav),
    sameScope: accountScope.capture() === scopeBefore,
    outcome: outcome(branch),
  };
  observed(`row q ${branch} attempt 1 (Cancel at the rail prompt)`, { ...facts, clockBefore });
  expect({ confirms: facts.confirms, firstKind: facts.firstKind, dialog: facts.dialog }, "§7.5 rule 12 row q attempt 1: exactly one confirm, the rail text; zero Appearance or other confirms; no coordinator dialog").toStrictEqual({ confirms: { rail: 1, appearance: 0, other: 0 }, firstKind: "rail", dialog: false });
  expect({ clock: facts.clock, guardVersion: facts.guardVersion, sameGuard: facts.sameGuard, clockWrites: facts.clockWrites, downloads: facts.downloads }, "§7.5 row q attempt 1: the Clock is untouched (state, registration, zero Clock set/remove attempts, no export or discard)").toStrictEqual({ clock: clockBefore, guardVersion: 0, sameGuard: true, clockWrites: [], downloads: 0 });
  expect({ rail: facts.rail, railStatus: facts.railStatus, mutations: facts.mutations, sameScope: facts.sameScope, outcome: facts.outcome }, "§7.5 row q attempt 1: the rail draft and its status are kept; zero history mutations; identity intact").toStrictEqual({ rail: railBefore, railStatus: true, mutations: NO_HISTORY_MUTATION, sameScope: true, outcome: NO_SIGN_OUT });
  return facts;
}

for (const branch of BRANCHES) {
  it(`q §9 row q ${branch} Cancel half (positive control): with a rail draft and a Clock draft, the rail confirm comes first; Cancel there asks nothing else, opens no coordinator dialog and leaves the Clock, the rail draft and identity untouched`, async () => {
    useBranch(branch);
    const { app } = await railAndClockDrafts();
    await cancelAtRail(app, branch);
    quiet(`row q ${branch} Cancel`);
  });

  it(`q §9 row q ${branch} OK half: after Cancel, OK at the rail prompt discards the rail draft with zero writes and asks no Appearance confirm; the coordinator dialog "Clock" appears and Stay resolves false; a third attempt asks nothing and dialog Discard writes nothing and invalidates identity once (H5)`, async () => {
    useBranch(branch);
    const { app, railQuota } = await railAndClockDrafts();
    await cancelAtRail(app, branch);
    railQuota.off();
    const scopeBefore = accountScope.capture();
    const nav = historyMark(app);
    const from = mark();
    const records = await signOutAnswering([true]);
    census("row q attempt 2");
    observed(`row q ${branch} attempt 2 (OK at the rail prompt)`, { confirms: confirmsByClass(records), dialog: dialogState(), railWrites: writesSince(from, [RAIL_KEY]), railStatus: railStatusAny() !== null, outcome: outcome(branch), scope: scopeSummary() });
    expect({ confirms: confirmsByClass(records), railWrites: writesSince(from, [RAIL_KEY]), railStatus: railStatusAny() !== null, appearanceStatus: appearanceStatus() !== null }, "§7.5 rule 12 row q attempt 2: one rail confirm; OK discards the rail draft with zero writes and its status unmounts; zero Appearance confirms").toStrictEqual({ confirms: { rail: 1, appearance: 0, other: 0 }, railWrites: [], railStatus: false, appearanceStatus: false });
    expect(dialogState(), "H5 §7.5 row q attempt 2: the coordinator dialog appears for the Clock").toStrictEqual(dialogFor(W.participant));
    await click(dialogButton(DIALOG.stay));
    census("row q attempt 2 stay");
    expect({ outcome: outcome(branch), sameScope: accountScope.capture() === scopeBefore, mutations: historyMutations(app, nav), block: blockState("style") }, "§7.5 row q attempt 2 Stay: resolves false; identity intact; the Clock draft is kept").toStrictEqual({ outcome: NO_SIGN_OUT, sameScope: true, mutations: NO_HISTORY_MUTATION, block: FAILED });
    const third = mark();
    const thirdRecords = await signOutAnswering([]);
    pre(dialog(), "the third sign-out attempt shows the coordinator dialog");
    const commitsBefore = app.commits.length;
    await click(dialogButton(DIALOG.discard));
    census("row q attempt 3 discard");
    expect({ confirms: confirmsByClass(thirdRecords), writes: writesSince(third, CLOCK_KEYS), outcome: outcome(branch), routerCommits: app.commits.length - commitsBefore }, "§7.5 rule 16 row q attempt 3: zero confirms; dialog Discard writes nothing on either Clock key; one identity invalidation; no router commit").toStrictEqual({ confirms: ZERO_CONFIRMS, writes: [], outcome: SIGNED_OUT, routerCommits: 0 });
    quiet(`row q ${branch} OK`);
  });
}
