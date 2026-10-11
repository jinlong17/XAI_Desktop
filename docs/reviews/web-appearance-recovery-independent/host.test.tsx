/**
 * Parent-role jsdom host before oracles for the Settings Appearance caller (CP-APPEARANCE-01, control-plane batch 38;
 * contract docs/reviews/web-appearance-recovery-contract/contract.md r3, section 14 item E3). Executed only through
 * ./verify-fixed.mjs, which copies this file and ./host-fixture.tsx into an immutable `git archive` of the requested
 * product revision.
 *
 * Authority: contract r3 section 4 (A2 with A2.1-A2.7, A5), section 5 (normative wording and stable selectors),
 * section 6, section 7 (protection model), section 9 (host rows a-s), section 12 ("Parent host baseline", the F-B002
 * rule, "Validity and positive controls", H11, H16, H17); ../20260908-full-product-audit/CURRENT-CONTROL-PLANE.md,
 * "本轮唯一任务" (batch 38).
 *
 * Composition: the production `App` in the apps/web/src/main.tsx module order (observability runtime, AppProviders,
 * the router module, the service-worker module, @repo/plugin-web-tokens, global.css) and the production route table
 * `webHostRouteObjects`, rendered by RouterProvider from "react-router" (main.tsx uses the "react-router/dom" wrapper,
 * which only adds flushSync). Every case renders a fresh data router over that route table (createMemoryRouter at the
 * case's path, as in the frozen Sol harness; main.tsx renders the same table through createBrowserRouter). The ONLY
 * synthetic input is the auth session: useWebAuthSession is substituted with an authenticated session for account A
 * whose generation coordinator records its sign-outs (App.handleSignOut's coordinator branch, the
 * live-configuration branch). Differences from main.tsx: AppProviders'
 * component tree (WebAuthSessionProvider, DeviceSessionBridge, the deletion-recovery and todo-runtime bridges) is not
 * rendered because the hook is substituted; bootstrapObservability() and registerServiceWorker() are not called;
 * StrictMode is not used (contract section 15 retained exclusion); the module-level production router instance is
 * never rendered and is disposed. There is no network: fetch, XHR, WebSocket and EventSource refuse and are counted.
 *
 * Every business oracle states the fixed-product requirement. At 5cd63ff they are expected to fail wherever H11, H16
 * and H17 hold (correct FAILs); the FIXTURE cases and the one clean positive control (PC) must PASS on every
 * product. A failing case must fail on its business assertion: "PRECONDITION:" errors are fixture or selector
 * failures and never product results.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent } from "@testing-library/react";
import { accountScope } from "@repo/plugin-web-storage";
import {
  ACCENT, APPEARANCE_KEYS, BG, CALENDAR, DENSITY, FONT, LANG, OWNER, RAIL, SELF_CHECK_EXPECTED, SETTINGS_ABOUT,
  SETTINGS_APPEARANCE, SHELL, TASKS, THEME, W,
  NO_HISTORY_MUTATION,
  applied, bottomButtons, choose, chooseTopbar, closeTopbar, configureApp, confirmer, departureDialog, discardOf, fault,
  fired, flush, historyCounters, historyMark, historyMutations, hold, isDisabledState, isEnabledState, labelOf, locks, mark,
  mountApp, navigateTo, need, networkAttempts, observed, paneOrNull, pre, probeUnload, railButton, raw, rawAll,
  recoveryBlock, redirects, resetButton, retryAll, retryAllState, retryOf, routeError, runtimeErrors, says, scopeSummary,
  seed, setup, shownInPane, sidebarRow, signOut, signOutOutcome, slider, statusText, storageSelfCheck, teardown,
  topbarChecked, topbarStatusAny, topbarStatusNamed, touchesSince, uiLang, user, writesSince,
  type Fault, type Field, type Lang, type Value,
} from "./host-fixture";

// ---------------------------------------------------------------------------------------------------
// The only synthetic input: the auth-session hook (coordinator branch of App.handleSignOut)
// ---------------------------------------------------------------------------------------------------

const auth = vi.hoisted(() => {
  const counters = { hookCalls: 0, captures: 0, coordinatorSignOuts: 0, clearSessionStorage: 0 };
  const coordinator = {
    capture: () => { counters.captures += 1; return { owner: "appearance-host-parent-A", generation: "g1" }; },
    signOut: async () => { counters.coordinatorSignOuts += 1; return { status: "applied" as const }; },
    bootstrap: async () => undefined,
  };
  const value = {
    state: "authenticated",
    session: { user: { id: "appearance-host-parent-A" } },
    client: null,
    coordinator,
    authError: null,
    signOutFailed: false,
    reportSignOutFailure: undefined,
    deviceId: null,
    syncVersion: "2026-05",
    refreshSession: async () => null,
    ensureDeviceIdentity: async () => "appearance-host-device",
    clearSessionStorage: async () => { counters.clearSessionStorage += 1; },
    setSession: () => undefined,
  };
  return { counters, value };
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

// The module-level production instance (createBrowserRouter(webHostRouteObjects)) is never rendered here; dispose it
// so that it stops listening to jsdom's History.
const productionRouterAtImport = productionRouterInstance.state.location.pathname;
productionRouterInstance.dispose();
configureApp(webHostRouteObjects, () => ({ hookCalls: auth.counters.hookCalls }));

beforeEach(() => {
  setup();
  auth.counters.hookCalls = 0;
  auth.counters.captures = 0;
  auth.counters.coordinatorSignOuts = 0;
  auth.counters.clearSessionStorage = 0;
});
afterEach(() => { teardown(expect.getState().currentTestName ?? "unknown"); });

// ---------------------------------------------------------------------------------------------------
// Shared steps
// ---------------------------------------------------------------------------------------------------

interface PaneCase { readonly field: Field; readonly choice: Value }
interface TopbarCase { readonly field: Field; readonly choice: Value }
/** Each field's failed pane edit from absent (default) bytes, in the display order. */
const PANE_CASES: readonly PaneCase[] = [
  { field: LANG, choice: "zh" },
  { field: THEME, choice: "dark" },
  { field: DENSITY, choice: "compact" },
  { field: ACCENT, choice: 295 },
  { field: BG, choice: "peach" },
  { field: RAIL, choice: "right" },
  { field: FONT, choice: 1.1 },
];
const TOPBAR_CASES: readonly TopbarCase[] = [
  { field: LANG, choice: "zh" },
  { field: THEME, choice: "dark" },
  { field: DENSITY, choice: "compact" },
];
const NO_SIGN_OUT = { identityInvalidated: false, redirected: false, backendSignOuts: 0 } as const;
const SIGNED_OUT = { identityInvalidated: true, redirected: true, backendSignOuts: 1 } as const;

/** A pane edit whose physical write is denied (QuotaExceededError on setItem of the field's key), proven to fire. */
async function failPaneEdit(entry: PaneCase): Promise<Fault> {
  const quota = fault("set", entry.field.key, `${entry.field.id} pane write denied`);
  choose(entry.field, entry.choice, "en");
  await flush();
  fired(quota, `${entry.field.id} pane write`);
  return quota;
}
/** A Topbar choice whose physical write is denied, proven to fire; the popover is closed afterwards. */
async function failTopbarChoice(entry: TopbarCase): Promise<Fault> {
  const quota = fault("set", entry.field.key, `${entry.field.id} Topbar write denied`);
  chooseTopbar(entry.field, entry.choice, "en");
  await flush();
  fired(quota, `${entry.field.id} Topbar write`);
  closeTopbar();
  return quota;
}
function observeAfterFailure(tag: string, entry: PaneCase | TopbarCase): void {
  const lang = uiLang();
  observed(`${tag} after the failed ${entry.field.id} choice`, {
    choice: entry.choice,
    bytes: raw(entry.field.key),
    uiLang: lang,
    paneShows: paneOrNull() ? shownInPane(entry.field, lang) : "pane not mounted",
    applied: applied(entry.field),
    paneMessage: paneOrNull() ? says(W[lang].notSaved(labelOf(entry.field, lang))) : "pane not mounted",
    topbarStatus: topbarStatusAny() !== null,
    unload: probeUnload(),
  });
}
async function clickAndSettle(element: HTMLElement): Promise<void> {
  fireEvent.click(element);
  await flush();
}
/** Sign-out with the given window.confirm answer; returns the facts the oracles compare. */
async function signOutWith(answer: boolean, lang: Lang): Promise<{ confirms: string[]; outcome: ReturnType<typeof signOutOutcome> }> {
  confirmer.answer = answer;
  const before = confirmer.calls.length;
  await signOut(lang);
  return { confirms: confirmer.calls.slice(before), outcome: signOutOutcome(auth.counters.coordinatorSignOuts) };
}
function returnedDraft(entry: PaneCase | TopbarCase, lang: Lang) {
  return {
    shows: shownInPane(entry.field, lang),
    block: recoveryBlock(entry.field) !== null,
    message: says(W[lang].notSaved(labelOf(entry.field, lang))),
    retry: retryOf(entry.field, lang) !== null,
    discard: discardOf(entry.field, lang) !== null,
  };
}
const RA = (lang: Lang, tag: string): HTMLButtonElement => need(retryAll(lang), `${tag}: Retry all ("${W[lang].retryAll}") is rendered in the Appearance pane (A2.2: always rendered while the pane is mounted)`);

// ---------------------------------------------------------------------------------------------------
// FIXTURE validity (must PASS on every product)
// ---------------------------------------------------------------------------------------------------

it("FX1 F-B002 self-check: the Storage wrappers record and delegate exactly once, faulted attempts never delegate, no nested Storage call and no accountScope helper call", () => {
  const result = storageSelfCheck();
  observed("FX1 F-B002 self-check", result);
  pre(JSON.stringify(result) === JSON.stringify(SELF_CHECK_EXPECTED), `F-B002 self-check: ${JSON.stringify(result)}`);
});

it("FX2 the Web Lock fixture: asynchronous grants, a test hold keeps a product request waiting until release, shared cohorts, ifAvailable", async () => {
  const manager = locks();
  const name = "appearance-host-fx2";
  let syncRan = false;
  const first = navigator.locks.request(`${name}-async`, async () => { syncRan = true; });
  pre(!syncRan, "grants are asynchronous");
  await first;
  pre(syncRan, "the asynchronous grant ran");
  const held = await hold(name);
  const order: string[] = [];
  const waiting = navigator.locks.request(name, { mode: "exclusive" }, async () => { order.push("product"); });
  await flush(4);
  pre(order.length === 0 && manager.waiting(name, "product") === 1, "a test-held lock keeps the product request waiting");
  await held.release();
  await waiting;
  pre(order.join(",") === "product", "the product request ran after the release");
  const shared: string[] = [];
  let openShared!: () => void;
  const sharedGate = new Promise<void>(resolve => { openShared = resolve; });
  const s1 = navigator.locks.request(`${name}-shared`, { mode: "shared" }, async () => { shared.push("s1"); await sharedGate; });
  const s2 = navigator.locks.request(`${name}-shared`, { mode: "shared" }, async () => { shared.push("s2"); });
  const ex = navigator.locks.request(`${name}-shared`, { mode: "exclusive" }, async () => { shared.push("x"); });
  await flush(4);
  pre(shared.join(",") === "s1,s2", `shared holders coexist and the exclusive request waits (${shared.join(",")})`);
  openShared();
  await Promise.all([s1, s2, ex]);
  pre(shared.join(",") === "s1,s2,x", "the exclusive request ran after the shared cohort");
  const blocker = await hold(`${name}-if`);
  const unavailable = await navigator.locks.request(`${name}-if`, { ifAvailable: true }, async (lock: unknown) => lock);
  pre(unavailable === null, "ifAvailable yields null while the name is held");
  await blocker.release();
  pre(manager.errors.length === 0, `no unsupported request shape (${manager.errors.join("; ")})`);
});

it("FX3 composition: the production App from the archive with only the auth-session hook substituted; account A g1; Shell, Settings, the Appearance pane and DesktopPet; no network; the location stub delegates reads and the history counters see a router navigation", async () => {
  pre(auth.value.session.user.id === OWNER, "the substituted session identifies the fixture owner");
  pre(productionRouterAtImport === "/", `the module-level production router was created at "/" and disposed (${productionRouterAtImport})`);
  const app = await mountApp(SETTINGS_APPEARANCE);
  pre(auth.counters.hookCalls > 0, "the substituted useWebAuthSession served the production App");
  pre(document.querySelector(".settings-sidebar") !== null && document.querySelector(".pet-wrap") !== null, "the Settings sidebar and the App-level DesktopPet are mounted");
  pre(routeError() === null, "no route error boundary");
  pre(networkAttempts() === 0, `no network attempt (${networkAttempts()})`);
  pre(window.location.pathname === SETTINGS_APPEARANCE, "location reads are delegated to the real Location");
  const before = historyMark(app);
  fireEvent.click(sidebarRow(SHELL.en.about));
  await flush();
  const moved = historyMutations(app, before);
  pre(app.pathname() === SETTINGS_ABOUT && moved.navigations === 1 && moved.locationChanged && moved.pushes === 0 && moved.replaces === 0, `a sidebar navigation is one router commit and no direct History API call (${JSON.stringify(moved)})`);
  observed("FX3 composition", { scope: scopeSummary(), hookCalls: auth.counters.hookCalls, network: networkAttempts(), historyCounters: { ...historyCounters }, productionRouterAtImport });
});

// ---------------------------------------------------------------------------------------------------
// One clean positive control (must PASS at 5cd63ff)
// ---------------------------------------------------------------------------------------------------

it("PC clean state: zero-write mount, no indicator outside the pane, no unload warning; successful pane and Topbar edits persist exact bytes; the sidebar is not held; sign-out without drafts asks nothing and completes", async () => {
  const mountFrom = mark();
  const app = await mountApp(SETTINGS_APPEARANCE);
  expect(writesSince(mountFrom), "PC §5.1: mounting the production App on the Appearance route makes zero set/remove attempts on every key").toEqual([]);
  expect(topbarStatusAny(), "PC §7.2: no Topbar status in a clean state").toBeNull();
  expect(probeUnload(), "PC §7.3: no beforeunload warning in a clean state; zero storage attempts").toStrictEqual({ warned: false, attempts: 0 });
  choose(ACCENT, 295, "en");
  await flush();
  expect(raw(ACCENT.key), "PC: a successful pane edit persists its exact bytes").toBe("295");
  chooseTopbar(DENSITY, "compact", "en");
  await flush();
  closeTopbar();
  expect(raw(DENSITY.key), "PC: a successful Topbar choice persists its exact bytes").toBe(JSON.stringify("compact"));
  expect(topbarStatusAny(), "PC §7.2: still no Topbar status after successful edits").toBeNull();
  expect(probeUnload().warned, "PC §7.3: no unload warning after successful edits").toBe(false);
  await clickAndSettle(sidebarRow(SHELL.en.about));
  expect({ path: app.pathname(), dialog: departureDialog() }, "PC A5: the Settings sidebar is not held").toStrictEqual({ path: SETTINGS_ABOUT, dialog: null });
  await clickAndSettle(sidebarRow(SHELL.en.appearance));
  expect(shownInPane(ACCENT, "en"), "PC: the committed accent is displayed on return").toBe(295);
  const signFrom = mark();
  const result = await signOutWith(false, "en");
  observed("PC sign-out without drafts", { ...result, scope: scopeSummary(), redirects: [...redirects] });
  expect(result, "PC §7.4: without drafts sign-out asks no window.confirm and completes (identity invalidated, redirect, auth sign-out)").toStrictEqual({ confirms: [], outcome: SIGNED_OUT });
  expect(writesSince(signFrom, APPEARANCE_KEYS), "PC §7.4: the sign-out makes zero set/remove attempts on the seven Appearance keys").toEqual([]);
  expect(runtimeErrors, "PC: zero runtime errors").toEqual([]);
});

// ---------------------------------------------------------------------------------------------------
// Each Appearance field's failed edit: its Settings-sidebar route outcome and its sign-out outcome
// ---------------------------------------------------------------------------------------------------

for (const entry of PANE_CASES) describe(`pane field ${entry.field.id}`, () => {
  const id = entry.field.id;

  it(`F-route ${id}: a failed pane ${id} edit, then the Settings sidebar to About: not held, no dialog, the Topbar status shown (H11); on return the draft is intact`, async () => {
    const app = await mountApp(SETTINGS_APPEARANCE);
    await failPaneEdit(entry);
    observeAfterFailure(`F-route ${id}`, entry);
    const lang = uiLang();
    await clickAndSettle(sidebarRow(SHELL[lang].about));
    observed(`F-route ${id} after the sidebar`, { path: app.pathname(), dialog: departureDialog() !== null, topbarStatus: topbarStatusAny() !== null, unload: probeUnload() });
    expect(app.pathname(), "A5 §7.1 row d: the Settings sidebar is never held by Appearance drafts (no Settings route guard)").toBe(SETTINGS_ABOUT);
    expect(departureDialog(), "A5 §7.1 row d: no departure dialog").toBeNull();
    expect(topbarStatusNamed(lang), `H11 A5 §7.2 row d: an indicator outside the pane, the Topbar status "${W[lang].statusName}", is shown for the failed ${id} draft`).not.toBeNull();
    await clickAndSettle(sidebarRow(SHELL[lang].appearance));
    expect(app.pathname()).toBe(SETTINGS_APPEARANCE);
    expect(returnedDraft(entry, lang), `A5 §7 row d: on return the App-lifetime ${id} draft is intact (displayed, "${W[lang].notSaved(labelOf(entry.field, lang))}", Retry and Discard)`).toStrictEqual({ shows: entry.choice, block: true, message: true, retry: true, discard: true });
    expect(runtimeErrors, "zero runtime errors").toEqual([]);
  });

  it(`F-signout ${id}: a failed pane ${id} edit, then sign-out from the Appearance pane: one confirm; Cancel resolves false (H11)`, async () => {
    const app = await mountApp(SETTINGS_APPEARANCE);
    await failPaneEdit(entry);
    observeAfterFailure(`F-signout ${id}`, entry);
    const lang = uiLang();
    const scopeBefore = accountScope.capture();
    const history = historyMark(app);
    const from = mark();
    const result = await signOutWith(false, lang);
    observed(`F-signout ${id}`, { ...result, scope: scopeSummary(), redirects: [...redirects] });
    expect(result, `H11 A5 §7.4 row g: sign-out from the Appearance pane with the failed ${id} draft asks one window.confirm with the normative text, and Cancel resolves false (identity intact, no redirect, no auth sign-out)`).toStrictEqual({ confirms: [W[lang].confirmSignOut], outcome: NO_SIGN_OUT });
    expect(accountScope.capture(), "§7.4 row g: identity intact (the same account scope)").toBe(scopeBefore);
    expect(historyMutations(app, history), "§7.4 row g: zero history mutations").toStrictEqual(NO_HISTORY_MUTATION);
    expect({ message: says(W[lang].notSaved(labelOf(entry.field, lang))), status: topbarStatusNamed(lang) !== null, unload: probeUnload().warned }, "§7.4 Cancel: the draft, the Topbar status and the unload warning are kept").toStrictEqual({ message: true, status: true, unload: true });
    expect(writesSince(from, APPEARANCE_KEYS), "§7.4: the sign-out step makes zero Appearance set/remove attempts").toEqual([]);
    expect(runtimeErrors, "zero runtime errors").toEqual([]);
  });
});

// ---------------------------------------------------------------------------------------------------
// Each Topbar field's failed choice: an AppRail outcome and a sign-out-from-/app/tasks outcome
// ---------------------------------------------------------------------------------------------------

for (const entry of TOPBAR_CASES) describe(`Topbar field ${entry.field.id}`, () => {
  const id = entry.field.id;

  it(`T-rail ${id}: a failed Topbar ${id} choice on /app/tasks, then the AppRail to Calendar: not held, the Topbar status shown (H11); the choice stays displayed and applied; Review opens the pane with the field message`, async () => {
    const app = await mountApp(TASKS);
    await failTopbarChoice(entry);
    observeAfterFailure(`T-rail ${id}`, entry);
    const lang = uiLang();
    await clickAndSettle(railButton(SHELL[lang].calendar));
    observed(`T-rail ${id} after the AppRail`, { path: app.pathname(), dialog: departureDialog() !== null, topbarStatus: topbarStatusAny() !== null, unload: probeUnload() });
    expect(app.pathname(), "A5 §7.1 row e: the AppRail is never held by Appearance drafts").toBe(CALENDAR);
    expect(departureDialog(), "A5 §7.1 row e: no departure dialog").toBeNull();
    const status = topbarStatusNamed(lang);
    expect(status, `H11 A5 §7.2 rows b/e: an indicator outside the pane, the Topbar status "${W[lang].statusName}", is shown for the failed Topbar ${id} choice`).not.toBeNull();
    const shownNow = { checked: topbarChecked(entry.field, lang), applied: applied(entry.field) };
    closeTopbar();
    expect(shownNow, "row b: the Topbar choice stays displayed and applied").toStrictEqual({ checked: entry.choice, applied: entry.choice });
    const history = historyMark(app);
    await clickAndSettle(status!);
    expect({ path: app.pathname(), navigations: historyMutations(app, history).navigations }, "row b: Review navigates exactly once to the Appearance pane").toStrictEqual({ path: SETTINGS_APPEARANCE, navigations: 1 });
    expect(returnedDraft(entry, lang), `row b: the pane shows "${W[lang].notSaved(labelOf(entry.field, lang))}" with Retry and Discard`).toStrictEqual({ shows: entry.choice, block: true, message: true, retry: true, discard: true });
    expect(runtimeErrors, "zero runtime errors").toEqual([]);
  });

  it(`T-signout ${id}: a failed Topbar ${id} choice on /app/tasks, then sign-out from /app/tasks: one confirm; Cancel resolves false (H11)`, async () => {
    const app = await mountApp(TASKS);
    await failTopbarChoice(entry);
    observeAfterFailure(`T-signout ${id}`, entry);
    const lang = uiLang();
    const scopeBefore = accountScope.capture();
    const history = historyMark(app);
    const from = mark();
    const result = await signOutWith(false, lang);
    observed(`T-signout ${id}`, { ...result, scope: scopeSummary(), redirects: [...redirects] });
    expect(result, `H11 A5 §7.4 row g: sign-out from /app/tasks with the failed Topbar ${id} choice asks one window.confirm with the normative text, and Cancel resolves false (identity intact, no redirect, no auth sign-out)`).toStrictEqual({ confirms: [W[lang].confirmSignOut], outcome: NO_SIGN_OUT });
    expect(accountScope.capture(), "§7.4 row g: identity intact").toBe(scopeBefore);
    expect(historyMutations(app, history), "§7.4 row g: zero history mutations").toStrictEqual(NO_HISTORY_MUTATION);
    expect({ applied: applied(entry.field), status: topbarStatusNamed(lang) !== null, unload: probeUnload().warned }, "§7.4 Cancel: the choice stays applied; the Topbar status and the unload warning are kept").toStrictEqual({ applied: entry.choice, status: true, unload: true });
    expect(writesSince(from, APPEARANCE_KEYS), "§7.4: the sign-out step makes zero Appearance set/remove attempts").toEqual([]);
    expect(runtimeErrors, "zero runtime errors").toEqual([]);
  });
});

// ---------------------------------------------------------------------------------------------------
// A failed reset with its route outcome
// ---------------------------------------------------------------------------------------------------

it("R-route: Reset to defaults accepted with the Sidebar position removal denied, then the Settings sidebar to About: not held, no dialog, the Topbar status shown (H11); on return the reset draft is intact", async () => {
  seed(RAIL.key, "right");
  seed(ACCENT.key, "295");
  seed(THEME.key, JSON.stringify("dark"));
  const app = await mountApp(SETTINGS_APPEARANCE);
  const refusal = fault("remove", RAIL.key, "rail removal denied");
  const asked = confirmer.calls.length;
  const from = mark();
  confirmer.answer = true;
  fireEvent.click(resetButton("en"));
  await flush(24);
  pre(confirmer.calls.length === asked + 1, `the Reset to defaults activation asked window.confirm once and was accepted (${confirmer.calls.length - asked})`);
  fired(refusal, "the Sidebar position removal");
  observed("R-route after the failed reset", { confirm: confirmer.calls[confirmer.calls.length - 1], writes: writesSince(from), bytes: rawAll(), paneShowsRail: shownInPane(RAIL, "en"), notReset: says(W.en.notReset(labelOf(RAIL, "en"))), topbarStatus: topbarStatusAny() !== null, unload: probeUnload() });
  await clickAndSettle(sidebarRow(SHELL.en.about));
  observed("R-route after the sidebar", { path: app.pathname(), dialog: departureDialog() !== null, topbarStatus: topbarStatusAny() !== null });
  expect(app.pathname(), "A5 §7.1 row d: the Settings sidebar is never held by a failed reset item").toBe(SETTINGS_ABOUT);
  expect(departureDialog(), "A5 §7.1: no departure dialog").toBeNull();
  expect(topbarStatusNamed("en"), `H11 A5 §7.2: an indicator outside the pane, the Topbar status "${W.en.statusName}", is shown for the failed reset item`).not.toBeNull();
  await clickAndSettle(sidebarRow(SHELL.en.appearance));
  expect({ block: recoveryBlock(RAIL) !== null, message: says(W.en.notReset(labelOf(RAIL, "en"))), shows: shownInPane(RAIL, "en"), retry: retryOf(RAIL, "en") !== null, discard: discardOf(RAIL, "en") !== null }, "§6 §7 row d: on return the reset draft is intact, displaying the default with its message, Retry and Discard").toStrictEqual({ block: true, message: true, shows: "left", retry: true, discard: true });
  expect(runtimeErrors, "zero runtime errors").toEqual([]);
});

// ---------------------------------------------------------------------------------------------------
// H11 at the host layer: no indicator outside the pane, sign-out from any route, beforeunload
// ---------------------------------------------------------------------------------------------------

it("H11-a indicator: with a failed pane accent edit and a failed Topbar theme choice, an indicator outside the pane is shown on another Settings pane, on the AppRail destination and on a programmatic destination", async () => {
  const app = await mountApp(SETTINGS_APPEARANCE);
  await failPaneEdit({ field: ACCENT, choice: 295 });
  await failTopbarChoice({ field: THEME, choice: "dark" });
  observeAfterFailure("H11-a", { field: THEME, choice: "dark" });
  const seen: Record<string, { path: string; indicator: boolean }> = {};
  await clickAndSettle(sidebarRow(SHELL.en.about));
  seen.settingsAbout = { path: app.pathname(), indicator: topbarStatusNamed("en") !== null };
  await clickAndSettle(railButton(SHELL.en.tasks));
  seen.railTasks = { path: app.pathname(), indicator: topbarStatusNamed("en") !== null };
  await navigateTo(app, CALENDAR);
  seen.programmaticCalendar = { path: app.pathname(), indicator: topbarStatusNamed("en") !== null };
  observed("H11-a indicator by route", seen);
  expect(seen, `H11 A5 §7.2: with unsaved failed Appearance work an indicator outside the pane (the Topbar status "${W.en.statusName}") is shown on every route`).toStrictEqual({
    settingsAbout: { path: SETTINGS_ABOUT, indicator: true },
    railTasks: { path: TASKS, indicator: true },
    programmaticCalendar: { path: CALENDAR, indicator: true },
  });
  expect(runtimeErrors, "zero runtime errors").toEqual([]);
});

it("H11-b beforeunload after a failed pane theme edit: warns on the pane and after leaving it, with zero storage attempts in the handler", async () => {
  const app = await mountApp(SETTINGS_APPEARANCE);
  await failPaneEdit({ field: THEME, choice: "dark" });
  observeAfterFailure("H11-b", { field: THEME, choice: "dark" });
  const onPane = probeUnload();
  await clickAndSettle(railButton(SHELL.en.tasks));
  const offPane = { path: app.pathname(), ...probeUnload() };
  observed("H11-b beforeunload", { onPane, offPane });
  expect({ onPane, offPane }, "H11 A5 §7.3 row i: with a failed pane draft a cancelable beforeunload warns on every route, with zero storage attempts in the handler").toStrictEqual({ onPane: { warned: true, attempts: 0 }, offPane: { path: TASKS, warned: true, attempts: 0 } });
  expect(runtimeErrors, "zero runtime errors").toEqual([]);
});

it("H11-c beforeunload after a failed Topbar density choice on /app/tasks: warns there and on the AppRail destination, with zero storage attempts in the handler", async () => {
  const app = await mountApp(TASKS);
  await failTopbarChoice({ field: DENSITY, choice: "compact" });
  observeAfterFailure("H11-c", { field: DENSITY, choice: "compact" });
  const onTasks = probeUnload();
  await clickAndSettle(railButton(SHELL.en.calendar));
  const onCalendar = { path: app.pathname(), ...probeUnload() };
  observed("H11-c beforeunload", { onTasks, onCalendar });
  expect({ onTasks, onCalendar }, "H11 A5 §7.3 row i: with a failed Topbar draft a cancelable beforeunload warns on every route, with zero storage attempts in the handler").toStrictEqual({ onTasks: { warned: true, attempts: 0 }, onCalendar: { path: CALENDAR, warned: true, attempts: 0 } });
  expect(runtimeErrors, "zero runtime errors").toEqual([]);
});

it("H11-d sign-out from another Settings pane (About, with the Appearance pane unmounted) after a failed pane font-scale edit: one confirm; Cancel resolves false", async () => {
  const app = await mountApp(SETTINGS_APPEARANCE);
  await failPaneEdit({ field: FONT, choice: 1.1 });
  observeAfterFailure("H11-d", { field: FONT, choice: 1.1 });
  await clickAndSettle(sidebarRow(SHELL.en.about));
  expect({ path: app.pathname(), paneMounted: paneOrNull() !== null }, "A5 §7.1: the sidebar is not held; the sign-out starts on About with the Appearance pane unmounted").toStrictEqual({ path: SETTINGS_ABOUT, paneMounted: false });
  const scopeBefore = accountScope.capture();
  const history = historyMark(app);
  const result = await signOutWith(false, "en");
  observed("H11-d sign-out from About", { ...result, scope: scopeSummary(), redirects: [...redirects] });
  expect(result, "H11 A5 §7.4 row g: sign-out from another Settings pane with the failed font-scale draft asks one window.confirm with the normative text, and Cancel resolves false").toStrictEqual({ confirms: [W.en.confirmSignOut], outcome: NO_SIGN_OUT });
  expect(accountScope.capture(), "§7.4: identity intact").toBe(scopeBefore);
  expect(historyMutations(app, history), "§7.4: zero history mutations").toStrictEqual(NO_HISTORY_MUTATION);
  expect(runtimeErrors, "zero runtime errors").toEqual([]);
});

// ---------------------------------------------------------------------------------------------------
// H16: a failed Topbar theme choice and a failed pane accent edit, then the expected Retry all
// ---------------------------------------------------------------------------------------------------

it("H16-a full success: one trusted Retry all writes each failed key once and nothing else; the Topbar status is hidden while the pass is open and absent after; beforeunload removed; Retry all disabled with focus kept; 'Appearance settings saved.' only after the last completion; sign-out then asks nothing", async () => {
  const app = await mountApp(SETTINGS_APPEARANCE);
  const themeQuota = await failTopbarChoice({ field: THEME, choice: "dark" });
  const accentQuota = await failPaneEdit({ field: ACCENT, choice: 295 });
  observed("H16-a before Retry all", { bytes: rawAll(), topbarStatus: topbarStatusAny() !== null, unload: probeUnload(), bottom: bottomButtons() });
  themeQuota.off();
  accentQuota.off();
  const button = RA("en", "H16-a");
  const accentLock = await hold(ACCENT.lock);
  const history = historyMark(app);
  const from = mark();
  const u = user();
  await u.click(button);
  await flush();
  const whileOpen = { topbarStatus: topbarStatusAny() !== null, line: statusText(), disabled: isDisabledState(button), describedByStatus: retryAllState(button).describedByStatus, unload: probeUnload().warned, writes: writesSince(from) };
  observed("H16-a while the pass is open", whileOpen);
  expect(whileOpen, "H16 A2.2 A2.4 A2.6 §7.2 row o: while the pass is open (accent held behind its real lock) the Topbar status is hidden, the in-flight line describes the disabled button, unload still warns, and only the theme was written").toStrictEqual({ topbarStatus: false, line: W.en.retrying, disabled: true, describedByStatus: true, unload: true, writes: [`set:${THEME.key}=${JSON.stringify("dark")}`] });
  await accentLock.release();
  expect(writesSince(from).sort(), "H16 A2.3 row o: exactly one write per failed key, zero on every other key").toEqual([`set:${ACCENT.key}=295`, `set:${THEME.key}=${JSON.stringify("dark")}`].sort());
  const after = { topbarStatus: topbarStatusAny() !== null, unload: probeUnload().warned, state: retryAllState(button), focus: document.activeElement === button, line: statusText(), bytes: { theme: raw(THEME.key), accent: raw(ACCENT.key) } };
  observed("H16-a after the pass", after);
  expect(after, "H16 A2.2 A2.4 A2.5 §7.2 §7.3 row o: after the full success the Topbar status is absent, beforeunload is removed, Retry all stays rendered and disabled with no description, focus stays on it and 'Appearance settings saved.' appears").toMatchObject({
    topbarStatus: false,
    unload: false,
    state: { ariaDisabled: "true", disabledAttr: false, describedBy: null },
    focus: true,
    line: W.en.saved,
    bytes: { theme: JSON.stringify("dark"), accent: "295" },
  });
  expect(historyMutations(app, history), "row o: zero history mutations").toStrictEqual(NO_HISTORY_MUTATION);
  const signFrom = mark();
  const result = await signOutWith(false, "en");
  expect(result, "H16 §7.4: after the full success no draft remains, so sign-out asks nothing and completes").toStrictEqual({ confirms: [], outcome: SIGNED_OUT });
  expect(writesSince(signFrom, APPEARANCE_KEYS), "§7.4: zero Appearance set/remove attempts by the sign-out").toEqual([]);
  expect(runtimeErrors, "zero runtime errors").toEqual([]);
});

it("H16-b partial: with the accent still denied one trusted Retry all attempts each failed key once; the count line, the Topbar status returns, unload warns, focus stays on the enabled button; sign-out asks once and Cancel resolves false", async () => {
  const app = await mountApp(SETTINGS_APPEARANCE);
  const themeQuota = await failTopbarChoice({ field: THEME, choice: "dark" });
  const accentQuota = await failPaneEdit({ field: ACCENT, choice: 295 });
  themeQuota.off();
  const button = RA("en", "H16-b");
  const accentFiredBefore = accentQuota.fired;
  const from = mark();
  const u = user();
  await u.click(button);
  await flush();
  expect(writesSince(from).sort(), "H16 A2.3 row p: exactly one attempt per failed key (the accent's denied again), zero on every other key").toEqual([`set:${ACCENT.key}=295!threw`, `set:${THEME.key}=${JSON.stringify("dark")}`].sort());
  fired(accentQuota, "the still-denied accent write during the pass", accentFiredBefore + 1);
  const after = { line: statusText(), topbarStatus: topbarStatusNamed("en") !== null, unload: probeUnload().warned, enabled: isEnabledState(button), focus: document.activeElement === button, describedByStatus: retryAllState(button).describedByStatus };
  observed("H16-b after the partial pass", after);
  expect(after, "H16 A2.2 A2.4 A2.5 row p: the count line, the Topbar status returns, beforeunload still warns, Retry all stays enabled, described by the count line, with focus on it").toStrictEqual({ line: W.en.count(1), topbarStatus: true, unload: true, enabled: true, focus: true, describedByStatus: true });
  const history = historyMark(app);
  const result = await signOutWith(false, "en");
  expect(result, "H16 §7.4: the unresolved accent draft makes sign-out ask once; Cancel resolves false").toStrictEqual({ confirms: [W.en.confirmSignOut], outcome: NO_SIGN_OUT });
  expect(historyMutations(app, history), "§7.4: zero history mutations").toStrictEqual(NO_HISTORY_MUTATION);
  expect(says(W.en.notSaved(labelOf(ACCENT, "en"))), "§7.4 Cancel: the accent draft is kept").toBe(true);
  expect(runtimeErrors, "zero runtime errors").toEqual([]);
});

it("H16-c open pass: sign-out while a member is held behind its real lock asks once; Cancel resolves false and the pass settles; afterwards no Topbar status, no unload warning and 'Appearance settings saved.'", async () => {
  const app = await mountApp(SETTINGS_APPEARANCE);
  const themeQuota = await failTopbarChoice({ field: THEME, choice: "dark" });
  const accentQuota = await failPaneEdit({ field: ACCENT, choice: 295 });
  themeQuota.off();
  accentQuota.off();
  const button = RA("en", "H16-c");
  const accentLock = await hold(ACCENT.lock);
  const from = mark();
  const u = user();
  await u.click(button);
  await flush();
  expect({ line: statusText(), topbarStatus: topbarStatusAny() !== null }, "H16 A2.4 rule 1 §7.2: the pass is open and the Topbar status is hidden").toStrictEqual({ line: W.en.retrying, topbarStatus: false });
  const history = historyMark(app);
  const result = await signOutWith(false, "en");
  observed("H16-c sign-out during the open pass", { ...result, scope: scopeSummary() });
  expect(result, "H16 A2.6 §7.4 row r: pending members are drafts, so sign-out asks once; Cancel resolves false").toStrictEqual({ confirms: [W.en.confirmSignOut], outcome: NO_SIGN_OUT });
  expect(historyMutations(app, history), "row r: zero history mutations").toStrictEqual(NO_HISTORY_MUTATION);
  await accentLock.release();
  const after = { writes: writesSince(from).sort(), topbarStatus: topbarStatusAny() !== null, unload: probeUnload().warned, line: statusText(), disabled: isDisabledState(button) };
  observed("H16-c after the pass settled", after);
  expect(after, "H16 A2.6 row r: after Cancel the pass settled (one write per member), no Topbar status, no unload warning, 'Appearance settings saved.', Retry all disabled").toStrictEqual({ writes: [`set:${ACCENT.key}=295`, `set:${THEME.key}=${JSON.stringify("dark")}`].sort(), topbarStatus: false, unload: false, line: W.en.saved, disabled: true });
  expect(runtimeErrors, "zero runtime errors").toEqual([]);
});

// ---------------------------------------------------------------------------------------------------
// H17: the clean state has a rendered, disabled Retry all that is a Tab stop and inert
// ---------------------------------------------------------------------------------------------------

it("H17 clean state: Retry all is rendered and disabled (aria-disabled=\"true\", no disabled attribute, no description), a Tab stop, and a click, Enter and Space make zero storage attempts and keep focus", async () => {
  await mountApp(SETTINGS_APPEARANCE);
  observed("H17 the pane's bottom buttons in the clean state", bottomButtons());
  const button = RA("en", "H17");
  expect(retryAllState(button), "H17 A2.2 row s: disabled through aria-disabled only, with no description").toMatchObject({ ariaDisabled: "true", disabledAttr: false, describedBy: null, type: "button", testid: "appearance-retry-all" });
  expect(button.tabIndex, "A2.2: never tabindex=-1").toBeGreaterThanOrEqual(0);
  const u = user();
  act(() => { slider(FONT, "en").focus(); });
  let tabs = 0;
  while (document.activeElement !== button && tabs < 10) {
    await u.tab();
    tabs += 1;
  }
  observed("H17 tabs from the font-scale slider to Retry all", { tabs, reached: document.activeElement === button });
  expect(document.activeElement, "H17 A2.2 A2.7 row s: Retry all is a Tab stop while disabled").toBe(button);
  const line = statusText();
  const from = mark();
  const lockFrom = locks().log.length;
  const focus: Record<string, boolean> = {};
  await u.keyboard("{Enter}");
  await flush();
  focus.enter = document.activeElement === button;
  await u.keyboard(" ");
  await flush();
  focus.space = document.activeElement === button;
  await u.click(button);
  await flush();
  focus.click = document.activeElement === button;
  const facts = {
    writesEveryKey: writesSince(from),
    appearanceAttempts: touchesSince(from, APPEARANCE_KEYS),
    operations: locks().productRequests(lockFrom),
    focus,
    stillDisabled: isDisabledState(button),
    line: statusText(),
  };
  observed("H17 disabled activations", facts);
  expect(facts, "H17 A2.2 A2.7 row s: a click, Enter and Space on the disabled Retry all make zero storage attempts and zero operations, keep focus on it and change nothing").toStrictEqual({
    writesEveryKey: [],
    appearanceAttempts: [],
    operations: 0,
    focus: { enter: true, space: true, click: true },
    stillDisabled: true,
    line,
  });
  expect([W.en.retrying, W.en.count(1), W.en.exportFailed].includes(statusText() ?? ""), "§5.9: the clean-state status line shows no in-flight, count or export-failure line").toBe(false);
  expect(runtimeErrors, "zero runtime errors").toEqual([]);
});

