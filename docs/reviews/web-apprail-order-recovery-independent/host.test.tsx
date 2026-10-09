/**
 * Parent-role jsdom host before oracles for the AppRail order caller (CP-APPRAIL-01, control-plane batch 57;
 * contract docs/reviews/web-apprail-order-recovery-contract/contract.md r1, section 15 item E3). Executed only through
 * ./verify-fixed.mjs, which copies this file and ./host-fixture.tsx into an immutable `git archive` of the requested
 * product revision.
 *
 * Authority: contract r1 R-1, A6 (route-independent protection: a Topbar status slot, an unload warning and a
 * sign-out step, rail first), A7 (one write per drop), A8 (status render condition), section 5 (normative wording
 * and stable selectors), section 6, section 7 (protection model), section 9 host rows a, d, g-l, o, section 12
 * ("Parent host baseline", the F-B002 rule, the seed and event-sequence rules, "Validity and positive controls", H1,
 * H2, H9); ../20260908-full-product-audit/CURRENT-CONTROL-PLANE.md "本轮唯一任务" (batch 57).
 *
 * Composition: the production `App` in the apps/web/src/main.tsx module order (observability runtime, AppProviders,
 * the router module, the service-worker module, @repo/plugin-web-tokens, global.css) and the production route table
 * `webHostRouteObjects`, rendered by RouterProvider from "react-router" over a fresh memory data router per mount
 * (main.tsx renders the same table through createBrowserRouter). The ONLY synthetic input is the auth session:
 * useWebAuthSession is substituted with an authenticated session for account A. Each case selects
 * App.handleSignOut's branch: "coordinator" (a generation coordinator that records its sign-outs) or "fallback"
 * (no coordinator, no client; clearSessionStorage records). Differences from main.tsx: AppProviders' component tree
 * is not rendered because the hook is substituted; bootstrapObservability() and registerServiceWorker() are not
 * called; StrictMode is not used (contract section 16 retained exclusion); the module-level production router
 * instance is never rendered and is disposed. There is no network: fetch, XHR, WebSocket and EventSource refuse and
 * are counted.
 *
 * Every business oracle states the fixed-product requirement. At 419e56d they are expected to fail wherever H1, H2
 * and H9 hold (correct FAILs); the FIXTURE cases and the clean positive controls (PC*) must PASS on every product. A
 * failing case must fail on a business assertion: "PRECONDITION:" errors are fixture or selector failures and never
 * product results. In each route case the "not held" route outcome is asserted before the H9 status, so a FAIL there
 * is the status, and the observed line records the route outcome.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent } from "@testing-library/react";
import { accountScope } from "@repo/plugin-web-storage";
import {
  AP, CALENDAR, DEFAULT_RAIL_ORDER, NO_HISTORY_MUTATION, RAIL_IDS, RAIL_KEY, REVERSED, SELF_CHECK_EXPECTED, SETTINGS_ABOUT,
  SETTINGS_APPEARANCE, SHELL, TASKS, W,
  appearanceDraft, appearanceStatus, back, configureApp, confirmer, departureDialog, discardAppearanceTheme, display, dragRail,
  encode, fault, fired, flush, hold, historyMark, historyMutations, identityInvalidated, locks, mark, merge, mountApp, mountRaw,
  networkAttempts, observed, pre, probeUnload, railButton, railIds, railItems, railStatusAny, railStatusNamed, raw,
  redirects, routeError, runtimeErrors, scopeSummary, seed, seedOrder, setup, sidebarRow, signOut, storageSelfCheck, teardown,
  writesSince, type AppHandle, type Fault,
} from "./host-fixture";

// ---------------------------------------------------------------------------------------------------
// The only synthetic input: the auth-session hook (both App.handleSignOut branches)
// ---------------------------------------------------------------------------------------------------

const auth = vi.hoisted(() => {
  const counters = { hookCalls: 0, captures: 0, coordinatorSignOuts: 0, clearSessionStorage: 0 };
  const coordinator = {
    capture: () => { counters.captures += 1; return { owner: "apprail-host-parent-A", generation: "g1" }; },
    signOut: async () => { counters.coordinatorSignOuts += 1; return { status: "applied" as const }; },
    bootstrap: async () => undefined,
  };
  const value: Record<string, unknown> = {
    state: "authenticated",
    session: { user: { id: "apprail-host-parent-A" } },
    client: null,
    coordinator,
    authError: null,
    signOutFailed: false,
    reportSignOutFailure: undefined,
    deviceId: null,
    syncVersion: "2026-05",
    refreshSession: async () => null,
    ensureDeviceIdentity: async () => "apprail-host-device",
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
function useBranch(branch: Branch): void {
  auth.value.coordinator = branch === "coordinator" ? auth.coordinator : null;
  auth.value.client = null;
}
beforeEach(() => {
  setup();
  auth.counters.hookCalls = 0;
  auth.counters.captures = 0;
  auth.counters.coordinatorSignOuts = 0;
  auth.counters.clearSessionStorage = 0;
  useBranch("coordinator");
});
afterEach(() => { teardown(expect.getState().currentTestName ?? "unknown"); });

// ---------------------------------------------------------------------------------------------------
// Shared steps
// ---------------------------------------------------------------------------------------------------

/** The drag used by every case (seed rule: REVERSED is in-domain, all 14 rail modules visible). */
const X = REVERSED[0]!;
const Y = REVERSED[3]!;
type Variant = "alone" | "with-appearance";
const VARIANTS: readonly Variant[] = ["alone", "with-appearance"];

/** Seeds REVERSED and mounts the production App at `path`; the rail must display the seeded order. */
async function mounted(path: string): Promise<AppHandle> {
  seedOrder(REVERSED);
  const app = await mountApp(path);
  pre(JSON.stringify(railIds()) === JSON.stringify(REVERSED), `the rail displays the seeded custom order (${railIds().join(",")})`);
  return app;
}
/**
 * A failed rail drag: the write of `xai_rail_order` is denied (QuotaExceededError on setItem, armed for every attempt
 * and proven to fire). Returns the expected dropped order P and the fixed-product expected bytes merge(S, R, P).
 */
async function failedDrag(tag: string): Promise<{ P: string[]; expectedBytes: string; quota: Fault }> {
  const quota = fault("set", RAIL_KEY, `${tag}: rail order write denied`);
  const record = await dragRail(X, Y);
  fired(quota, `${tag}: the rail write of the drag`);
  pre(raw() === encode(REVERSED), `${tag}: the denied write left the stored bytes unchanged`);
  const merged = merge(REVERSED, RAIL_IDS, record.expected);
  pre(merged, `${tag}: the dropped order is a permutation of the display`);
  return { P: record.expected, expectedBytes: encode(merged), quota };
}
async function prepare(variant: Variant, tag: string): Promise<{ P: string[] }> {
  if (variant === "with-appearance") await appearanceDraft();
  const { P } = await failedDrag(tag);
  return { P };
}
function railFacts() {
  return {
    rail: railIds(),
    bytes: raw(),
    railStatus: railStatusAny() !== null,
    railStatusNamedDraft: railStatusNamed("draft") !== null,
    appearanceStatus: appearanceStatus() !== null,
    unload: probeUnload(),
  };
}
async function clickAndSettle(element: HTMLElement): Promise<void> {
  fireEvent.click(element);
  await flush();
}
function outcome(branch: Branch): { identityInvalidated: boolean; redirected: boolean; backendSignOuts: number } {
  return {
    identityInvalidated: identityInvalidated(),
    redirected: redirects.includes("/"),
    backendSignOuts: branch === "coordinator" ? auth.counters.coordinatorSignOuts : auth.counters.clearSessionStorage,
  };
}
const NO_SIGN_OUT = { identityInvalidated: false, redirected: false, backendSignOuts: 0 } as const;
const SIGNED_OUT = { identityInvalidated: true, redirected: true, backendSignOuts: 1 } as const;
async function signOutAnswering(answers: readonly boolean[], branch: Branch): Promise<{ confirms: string[]; outcome: ReturnType<typeof outcome> }> {
  confirmer.answers.splice(0, confirmer.answers.length, ...answers);
  confirmer.fallback = false;
  const before = confirmer.calls.length;
  await signOut();
  return { confirms: confirmer.calls.slice(before), outcome: outcome(branch) };
}

// ---------------------------------------------------------------------------------------------------
// FIXTURE validity (must PASS on every product)
// ---------------------------------------------------------------------------------------------------

it("FX1 F-B002 self-check: the Storage wrappers record and delegate exactly once; faulted attempts (including the rail-order quota fault) never delegate; no nested Storage call and no accountScope helper call", () => {
  const result = storageSelfCheck();
  observed("FX1 F-B002 self-check", result);
  const { railBytesAfterFault: _bytes, ...compared } = result;
  pre(JSON.stringify(compared) === JSON.stringify(SELF_CHECK_EXPECTED), `F-B002 self-check: ${JSON.stringify(result)}`);
});

it("FX2 the Web Lock fixture: asynchronous grants and a test hold keeps a product request waiting until release", async () => {
  const manager = locks();
  const name = "apprail-host-fx2";
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

it("FX3 composition and drivers: the production App from the archive with only the auth hook substituted; the rail registry R; absent bytes display D(DEFAULT, R); the drag driver reaches the product handlers; the confirm recorder and the history counters work; no network", async () => {
  pre(productionRouterAtImport === "/", `the module-level production router was created at "/" and disposed (${productionRouterAtImport})`);
  const app = await mountApp(TASKS);
  pre(auth.counters.hookCalls > 0, "the substituted useWebAuthSession served the production App");
  pre(raw() === null, "no rail order is stored");
  pre(JSON.stringify(railIds()) === JSON.stringify(display(DEFAULT_RAIL_ORDER)), `absent bytes display D(DEFAULT_RAIL_ORDER, R) (${railIds().join(",")})`);
  pre([...railIds()].sort().join(",") === [...RAIL_IDS].sort().join(","), "the rail shows exactly the 14 rail modules of R");
  pre(document.querySelector(".pet-wrap") !== null && document.querySelector(".app-rail .rail-bottom") !== null, "DesktopPet and the rail bottom row are mounted");
  pre(networkAttempts() === 0, `no network attempt (${networkAttempts()})`);
  const before = historyMark(app);
  await clickAndSettle(railButton("calendar"));
  const moved = historyMutations(app, before);
  pre(app.pathname() === CALENDAR && moved.navigations === 1 && moved.pushes === 0 && moved.replaces === 0, `a rail click is one router commit and no direct History API call (${JSON.stringify(moved)})`);
  // The drag driver on a disposable key: with the write denied the gesture still reaches dragstart and dragend.
  const denied = fault("set", RAIL_KEY, "FX3 driver probe write denied");
  const record = await dragRail("tasks", "board");
  observed("FX3 driver probe", { record, writes: writesSince(0, [RAIL_KEY]), fired: denied.fired });
  denied.off();
  pre(record.draggingAtStart && record.payload === "tasks", "dragStart set the dragging class and the text/plain payload");
  pre(window.confirm("FX3 probe") === true && confirmer.calls.at(-1) === "FX3 probe", "the window.confirm recorder records and answers");
  observed("FX3 composition", { scope: scopeSummary(), hookCalls: auth.counters.hookCalls, network: networkAttempts(), productionRouterAtImport });
});

// ---------------------------------------------------------------------------------------------------
// Clean positive controls (must PASS at 419e56d)
// ---------------------------------------------------------------------------------------------------

it("PC clean state (coordinator branch): zero-write mount; no rail status and no unload warning; a successful drag stores exactly merge(S, R, P) = P with one rail write over the gesture and displays P; a rail click and Back navigate; sign-out without drafts asks nothing and completes", async () => {
  const mountFrom = mark();
  const app = await mounted(TASKS);
  expect(writesSince(mountFrom), "PC §5.1 row a: mounting the production App makes zero set/remove attempts on every key").toEqual([]);
  expect(railStatusAny(), "PC A8 row a: no rail status in a clean state").toBeNull();
  expect(probeUnload(), "PC §7.3 row l: no beforeunload warning in a clean state; zero storage attempts").toStrictEqual({ warned: false, attempts: 0 });
  const dragFrom = mark();
  const record = await dragRail(X, Y);
  const expectedBytes = encode(merge(REVERSED, RAIL_IDS, record.expected)!);
  observed("PC successful drag", { P: record.expected, writes: writesSince(dragFrom, [RAIL_KEY]), bytes: raw(), rail: railIds() });
  expect(expectedBytes, "PC A2 P6: with every module visible the merge equals the dropped order").toBe(encode(record.expected));
  expect(writesSince(dragFrom, [RAIL_KEY]), "PC A7 row b: one successful rail write over the gesture, with the merge bytes").toEqual([`set:${RAIL_KEY}=${expectedBytes}`]);
  expect({ bytes: raw(), rail: railIds() }, "PC row b: the bytes and the rail show the dropped order").toStrictEqual({ bytes: expectedBytes, rail: record.expected });
  expect({ status: railStatusAny(), unload: probeUnload().warned }, "PC A8 §7.3: no status and no unload warning after a successful drag").toStrictEqual({ status: null, unload: false });
  const navFrom = historyMark(app);
  await clickAndSettle(railButton("calendar"));
  expect({ path: app.pathname(), dialog: departureDialog(), navigations: historyMutations(app, navFrom).navigations }, "PC row g: a rail click navigates once and is not held").toStrictEqual({ path: CALENDAR, dialog: null, navigations: 1 });
  await back(app);
  expect(app.pathname(), "PC row g: Back returns to /app/tasks").toBe(TASKS);
  const signFrom = mark();
  const result = await signOutAnswering([], "coordinator");
  observed("PC sign-out without drafts (coordinator)", { ...result, scope: scopeSummary(), redirects: [...redirects] });
  expect(result, "PC §7.4 row h: without drafts sign-out asks no window.confirm and completes (identity invalidated, redirect, coordinator sign-out)").toStrictEqual({ confirms: [], outcome: SIGNED_OUT });
  expect(writesSince(signFrom, [RAIL_KEY]), "PC §7.4: the sign-out makes zero rail set/remove attempts").toEqual([]);
  expect(runtimeErrors, "PC: zero runtime errors").toEqual([]);
});

it("PC2 clean state (fallback branch): sign-out without drafts asks nothing and completes (session storage cleared, redirect)", async () => {
  useBranch("fallback");
  await mounted(TASKS);
  const result = await signOutAnswering([], "fallback");
  observed("PC2 sign-out without drafts (fallback)", { ...result, scope: scopeSummary(), redirects: [...redirects] });
  expect(result, "PC2 §7.4 row h: without drafts the fallback sign-out asks nothing and completes").toStrictEqual({ confirms: [], outcome: SIGNED_OUT });
  expect(runtimeErrors, "PC2: zero runtime errors").toEqual([]);
});

for (const branch of ["coordinator", "fallback"] as const) {
  it(`PC3 ${branch}: with an Appearance draft only (no rail draft) the confirm list is exactly the Appearance text; Cancel resolves false`, async () => {
    useBranch(branch);
    await mounted(TASKS);
    await appearanceDraft();
    const result = await signOutAnswering([false], branch);
    observed(`PC3 ${branch} sign-out with an Appearance draft only`, { ...result, scope: scopeSummary() });
    expect(result, "PC3 §7.4 row h: with an Appearance draft only, the confirm list is exactly the Appearance text and Cancel stops sign-out").toStrictEqual({ confirms: [AP.en.confirmSignOut], outcome: NO_SIGN_OUT });
    expect(runtimeErrors, "PC3: zero runtime errors").toEqual([]);
  });
}

// ---------------------------------------------------------------------------------------------------
// H2: the failed drag itself (with and without an Appearance draft)
// ---------------------------------------------------------------------------------------------------

for (const variant of VARIANTS) {
  it(`H2 ${variant}: a failed rail drag on /app/tasks keeps the dropped order displayed with the rail status and the unload warning; the bytes keep the committed order`, async () => {
    await mounted(TASKS);
    const { P } = await prepare(variant, `H2 ${variant}`);
    const facts = railFacts();
    observed(`H2 ${variant} after the failed drag`, { P, ...facts });
    expect(facts.rail, "H2 §5 item 4 row d: the latest dropped order stays displayed after the failed write").toEqual(P);
    expect(facts.bytes, "§5 item 4: the bytes keep the committed order").toBe(encode(REVERSED));
    expect(railStatusNamed("draft"), `H9 A8 row d: the Topbar rail status "${W.en.statusDraft}" after settlement`).not.toBeNull();
    expect(facts.unload, "§7.3 row l: the unload warning while the rail draft exists, zero storage attempts").toStrictEqual({ warned: true, attempts: 0 });
    expect(runtimeErrors, "zero runtime errors").toEqual([]);
  });
}

// ---------------------------------------------------------------------------------------------------
// Row g: route outcomes after a failed drag (AppRail click, Settings sidebar, Back), with and without Appearance
// ---------------------------------------------------------------------------------------------------

for (const variant of VARIANTS) describe(`route outcomes, ${variant}`, () => {
  it(`G-rail ${variant}: after a failed drag on /app/tasks an AppRail click to Calendar is not held (one navigation, no dialog); the rail status is shown there and the draft is intact (H9, H2)`, async () => {
    const app = await mounted(TASKS);
    const { P } = await prepare(variant, `G-rail ${variant}`);
    observed(`G-rail ${variant} after the failed drag`, railFacts());
    const nav = historyMark(app);
    await clickAndSettle(railButton("calendar"));
    const route = { path: app.pathname(), dialog: departureDialog() !== null, navigations: historyMutations(app, nav).navigations };
    observed(`G-rail ${variant} after the AppRail click`, { ...route, ...railFacts() });
    expect(route, "A6 §7.1 row g: the AppRail click is never held by a rail draft").toStrictEqual({ path: CALENDAR, dialog: false, navigations: 1 });
    expect(railStatusNamed("draft"), `H9 A6 §7.2 row g: the Topbar rail status "${W.en.statusDraft}" is shown on the destination`).not.toBeNull();
    expect(railIds(), "H2 row g: the draft stays intact (the dropped order displayed)").toEqual(P);
    expect(runtimeErrors, "zero runtime errors").toEqual([]);
  });

  it(`G-sidebar ${variant}: after a failed drag on /app/settings/appearance the Settings sidebar to About is not held (one navigation, no dialog); the rail status is shown there and the draft is intact (H9, H2)`, async () => {
    const app = await mounted(SETTINGS_APPEARANCE);
    const { P } = await prepare(variant, `G-sidebar ${variant}`);
    observed(`G-sidebar ${variant} after the failed drag`, railFacts());
    const nav = historyMark(app);
    await clickAndSettle(sidebarRow(SHELL.en.about));
    const route = { path: app.pathname(), dialog: departureDialog() !== null, navigations: historyMutations(app, nav).navigations };
    observed(`G-sidebar ${variant} after the Settings sidebar`, { ...route, ...railFacts() });
    expect(route, "A6 §7.1 row g: the Settings sidebar is never held by a rail draft").toStrictEqual({ path: SETTINGS_ABOUT, dialog: false, navigations: 1 });
    expect(railStatusNamed("draft"), `H9 A6 §7.2 row g: the Topbar rail status "${W.en.statusDraft}" is shown on the destination`).not.toBeNull();
    expect(railIds(), "H2 row g: the draft stays intact (the dropped order displayed)").toEqual(P);
    expect(runtimeErrors, "zero runtime errors").toEqual([]);
  });

  it(`G-back ${variant}: after a rail click to Calendar and a failed drag there, Back returns to /app/tasks unheld (no dialog); the rail status is shown there and the draft is intact (H9, H2)`, async () => {
    const app = await mounted(TASKS);
    await clickAndSettle(railButton("calendar"));
    pre(app.pathname() === CALENDAR, "the ordinary rail navigation to Calendar committed before the drag");
    const { P } = await prepare(variant, `G-back ${variant}`);
    observed(`G-back ${variant} after the failed drag`, railFacts());
    const nav = historyMark(app);
    await back(app);
    const route = { path: app.pathname(), dialog: departureDialog() !== null, navigations: historyMutations(app, nav).navigations };
    observed(`G-back ${variant} after Back`, { ...route, ...railFacts() });
    expect(route, "A6 §7.1 row g: Back is never held by a rail draft").toStrictEqual({ path: TASKS, dialog: false, navigations: 1 });
    expect(railStatusNamed("draft"), `H9 A6 §7.2 row g: the Topbar rail status "${W.en.statusDraft}" is shown after Back`).not.toBeNull();
    expect(railIds(), "H2 row g: the draft stays intact (the dropped order displayed)").toEqual(P);
    expect(runtimeErrors, "zero runtime errors").toEqual([]);
  });
});

// ---------------------------------------------------------------------------------------------------
// Row l: beforeunload after a failed drag (with and without Appearance)
// ---------------------------------------------------------------------------------------------------

it("U alone: after a failed drag a cancelable beforeunload warns on /app/tasks and after an AppRail navigation, with zero storage attempts in the handler (H9)", async () => {
  const app = await mounted(TASKS);
  await prepare("alone", "U alone");
  const onTasks = probeUnload();
  await clickAndSettle(railButton("calendar"));
  const onCalendar = { path: app.pathname(), ...probeUnload() };
  observed("U alone beforeunload", { onTasks, onCalendar, ...railFacts() });
  expect({ onTasks, onCalendar }, "H9 A6 §7.3 row l: while a rail draft exists a cancelable beforeunload warns on every route, with zero storage attempts in the handler").toStrictEqual({ onTasks: { warned: true, attempts: 0 }, onCalendar: { path: CALENDAR, warned: true, attempts: 0 } });
  expect(runtimeErrors, "zero runtime errors").toEqual([]);
});

it("U with-appearance: with an Appearance draft and a failed drag, unload warns; after the Appearance draft is discarded the rail draft alone still warns, with zero storage attempts in the handler (H9)", async () => {
  await mounted(SETTINGS_APPEARANCE);
  await prepare("with-appearance", "U with-appearance");
  const withBoth = probeUnload();
  observed("U with-appearance beforeunload with both drafts", { withBoth, ...railFacts() });
  const from = mark();
  await discardAppearanceTheme();
  pre(writesSince(from, [RAIL_KEY]).length === 0, "discarding the Appearance draft made no rail-order attempt");
  const railOnly = probeUnload();
  observed("U with-appearance beforeunload after the Appearance discard", { railOnly, ...railFacts() });
  expect(railOnly, "H9 A6 §7.3 row l: with only the rail draft left, a cancelable beforeunload still warns, with zero storage attempts in the handler").toStrictEqual({ warned: true, attempts: 0 });
  expect(runtimeErrors, "zero runtime errors").toEqual([]);
});

// ---------------------------------------------------------------------------------------------------
// Rows h-j: sign-out after a failed drag, both auth branches, with and without an Appearance draft
// ---------------------------------------------------------------------------------------------------

for (const branch of ["coordinator", "fallback"] as const) describe(`sign-out, ${branch} branch`, () => {
  it(`S-${branch} alone Cancel: from /app/tasks with a failed rail draft, one confirm with the rail text; Cancel resolves false with zero history mutations and identity intact (H9)`, async () => {
    useBranch(branch);
    const app = await mounted(TASKS);
    const { P } = await prepare("alone", `S-${branch} alone Cancel`);
    const scopeBefore = accountScope.capture();
    const nav = historyMark(app);
    const from = mark();
    const result = await signOutAnswering([false], branch);
    observed(`S-${branch} alone Cancel`, { ...result, scope: scopeSummary(), redirects: [...redirects], rail: railIds(), bytes: raw() });
    expect(result, "H9 A6 §7.4 row i: one window.confirm with the rail text; Cancel resolves false (identity intact, no redirect, no backend sign-out)").toStrictEqual({ confirms: [W.en.confirmSignOut], outcome: NO_SIGN_OUT });
    expect(accountScope.capture(), "row i: identity intact").toBe(scopeBefore);
    expect(historyMutations(app, nav), "row i: zero history mutations").toStrictEqual(NO_HISTORY_MUTATION);
    expect({ rail: railIds(), status: railStatusNamed("draft") !== null, unload: probeUnload().warned }, "§7.4 Cancel: the draft, the status and the warning are kept").toStrictEqual({ rail: P, status: true, unload: true });
    expect(writesSince(from, [RAIL_KEY]), "§7.4: the sign-out step makes zero rail set/remove attempts").toEqual([]);
    expect(runtimeErrors, "zero runtime errors").toEqual([]);
  });

  it(`S-${branch} alone OK: from /app/tasks with a failed rail draft, one confirm with the rail text; OK discards with zero writes and sign-out completes (H9)`, async () => {
    useBranch(branch);
    await mounted(TASKS);
    await prepare("alone", `S-${branch} alone OK`);
    const from = mark();
    const result = await signOutAnswering([true], branch);
    observed(`S-${branch} alone OK`, { ...result, scope: scopeSummary(), redirects: [...redirects], bytes: raw() });
    expect(result, "H9 A6 §7.4 row i: one window.confirm with the rail text; OK lets the sequence complete").toStrictEqual({ confirms: [W.en.confirmSignOut], outcome: SIGNED_OUT });
    expect(writesSince(from, [RAIL_KEY]), "§7.4 OK: the discard makes zero rail set/remove attempts").toEqual([]);
    expect(runtimeErrors, "zero runtime errors").toEqual([]);
  });

  it(`S-${branch} with-appearance rail Cancel: with a failed rail draft and an Appearance draft, the rail asks first; Cancel resolves false and the Appearance step is never asked (H9)`, async () => {
    useBranch(branch);
    const app = await mounted(TASKS);
    await prepare("with-appearance", `S-${branch} with-appearance rail Cancel`);
    const nav = historyMark(app);
    const result = await signOutAnswering([false], branch);
    observed(`S-${branch} with-appearance rail Cancel`, { ...result, scope: scopeSummary(), redirects: [...redirects] });
    expect(result, "H9 A6 §7.4 rows i/j: the rail confirm comes first; its Cancel resolves false without asking the Appearance step").toStrictEqual({ confirms: [W.en.confirmSignOut], outcome: NO_SIGN_OUT });
    expect(historyMutations(app, nav), "row i: zero history mutations").toStrictEqual(NO_HISTORY_MUTATION);
    expect({ rail: railStatusNamed("draft") !== null, appearance: appearanceStatus() !== null }, "§7.4 Cancel: both drafts are kept").toStrictEqual({ rail: true, appearance: true });
    expect(runtimeErrors, "zero runtime errors").toEqual([]);
  });

  it(`S-${branch} with-appearance OK, OK: the confirm list is exactly [rail text, Appearance text] and sign-out completes (H9)`, async () => {
    useBranch(branch);
    await mounted(TASKS);
    await prepare("with-appearance", `S-${branch} with-appearance OK OK`);
    const from = mark();
    const result = await signOutAnswering([true, true], branch);
    observed(`S-${branch} with-appearance OK OK`, { ...result, scope: scopeSummary(), redirects: [...redirects] });
    expect(result, "H9 A6 §7.4 row j: exactly two confirms, rail first; OK and OK proceed").toStrictEqual({ confirms: [W.en.confirmSignOut, AP.en.confirmSignOut], outcome: SIGNED_OUT });
    expect(writesSince(from, [RAIL_KEY]), "§7.4: zero rail set/remove attempts").toEqual([]);
    expect(runtimeErrors, "zero runtime errors").toEqual([]);
  });

  it(`S-${branch} with-appearance OK, Cancel: the confirm list is exactly [rail text, Appearance text]; sign-out resolves false with the rail draft discarded (zero writes) and the Appearance draft kept (H9)`, async () => {
    useBranch(branch);
    await mounted(TASKS);
    await prepare("with-appearance", `S-${branch} with-appearance OK Cancel`);
    const from = mark();
    const result = await signOutAnswering([true, false], branch);
    observed(`S-${branch} with-appearance OK Cancel`, { ...result, scope: scopeSummary(), redirects: [...redirects], ...railFacts() });
    expect(result, "H9 A6 §7.4 row j: exactly two confirms, rail first; OK then Cancel resolves false").toStrictEqual({ confirms: [W.en.confirmSignOut, AP.en.confirmSignOut], outcome: NO_SIGN_OUT });
    expect({ rail: railIds(), railStatus: railStatusAny(), appearance: appearanceStatus() !== null }, "§7.4 row j: the rail draft is discarded (committed order, no status) and the Appearance draft is kept").toStrictEqual({ rail: [...REVERSED], railStatus: null, appearance: true });
    expect(writesSince(from, [RAIL_KEY]), "§7.4 row j: the rail discard makes zero set/remove attempts").toEqual([]);
    expect(runtimeErrors, "zero runtime errors").toEqual([]);
  });
});

// ---------------------------------------------------------------------------------------------------
// H1: malformed (not iterable) bytes at load, with a reload, on /app/tasks and /app/settings/appearance
// ---------------------------------------------------------------------------------------------------

const H1_VALUES: ReadonlyArray<{ label: string; bytes: string; isClass: (value: unknown) => boolean }> = [
  { label: "{}", bytes: "{}", isClass: value => typeof value === "object" && value !== null && !Array.isArray(value) },
  { label: "1", bytes: "1", isClass: value => typeof value === "number" },
];
for (const value of H1_VALUES) {
  for (const path of [TASKS, SETTINGS_APPEARANCE]) {
    it(`H1 ${value.label} at ${path}: the App renders without the route error boundary, before and after a reload; the rail displays D(DEFAULT, R) with the source status; zero writes`, async () => {
      seed(RAIL_KEY, value.bytes);
      pre(value.isClass(JSON.parse(value.bytes)), `the seeded bytes ${value.bytes} are of the "not iterable" class (contract §5 item 2)`);
      const from = mark();
      const first = await mountRaw(path);
      const atLoad = { path: first.pathname(), routeError: routeError(), topbar: document.querySelector("header.topbar") !== null, rail: railItems() !== null, railStatus: railStatusAny() !== null };
      first.unmount();
      await flush();
      const second = await mountRaw(path);
      const afterReload = { path: second.pathname(), routeError: routeError(), topbar: document.querySelector("header.topbar") !== null, rail: railItems() !== null, railStatus: railStatusAny() !== null };
      observed(`H1 ${value.label} at ${path}`, { atLoad, afterReload, bytes: raw(), writes: writesSince(from) });
      expect(atLoad.routeError, `H1 §5 item 2 §10 item 4 row o: ${value.bytes} at load must not render the route error boundary on ${path}`).toBeNull();
      expect(afterReload.routeError, `H1 row o: nor after a reload on ${path}`).toBeNull();
      expect(railIds(), "§5 item 2 row o: the rail displays D(DEFAULT_RAIL_ORDER, R)").toEqual(display(DEFAULT_RAIL_ORDER));
      expect(railStatusNamed("source"), `A8 (b) row o: the source status "${W.en.statusSource}"`).not.toBeNull();
      expect({ writes: writesSince(from), bytes: raw() }, "§5 item 2: zero writes; the bytes are unchanged").toStrictEqual({ writes: [], bytes: value.bytes });
    });
  }
}
