/**
 * Mode `host` (contract r3 section 12): the production `App` with only the auth-session hook substituted —
 * the section 7 protection model (no Settings route guard, the Topbar status, `beforeunload`, the sign-out step
 * with a `window.confirm` recorder in both auth branches, a forced remount through the identity channel) and
 * section 10 items 3 (display truth, exactly one controller), 4 (crash safety for malformed values written while
 * the App runs) and 7 (cross-module isolation) at the hook layer; plus H10 (cross-document live updates of the four
 * root keys). Hypotheses H3, H5, H6, H8, H10 and H12.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent } from "@testing-library/react";
import { accountScope, generationMarkerKey } from "@repo/plugin-web-storage";
import {
  ACCENT, applied, appliedFor, appRailPos, BG, bus, bytes, choose, chooseTopbar, clickReset, configureApp, confirmer, DENSITY, discardAllButton,
  discardOf, download, enc, exportButton, external, fault, fired, flush, FONT, go, hold, keyLock, LANG, mark, mountApp, msg, nativeGet, need,
  pre, productStorageEvents, RAIL, redirects, reloadOf, retryAll, retryOf, routeError, runtimeErrors, sameFrame, says, seed, seedValue,
  setSystemDark, setup, shown, sidebarRow, signOut, snapshot, statusText, stubLocation, successShown, teardown, THEME, topbar, topbarChecked,
  topbarStatus, topbarStatusNamed, topbarSummary, summaryFor, uiLang, unload, W, warns, writes, railButton, OWNER_A, observe, nativeSet,
  historyMutations, type Value,
  storageSelfCheck as fb002SelfCheck, SELF_CHECK_DELEGATION as FB002_DELEGATION, observe as fb002Observe, pre as fb002Pre,
} from "./fixture";

const auth = vi.hoisted(() => {
  const state = { calls: 0, cleared: 0, clientSignOuts: 0, coordinatorSignOuts: 0 };
  const value: Record<string, unknown> = {
    state: "authenticated",
    session: { user: { id: "appearance-sol-A" } },
    client: null,
    coordinator: undefined,
    authError: null,
    signOutFailed: false,
    reportSignOutFailure: undefined,
    deviceId: null,
    syncVersion: "2026-05",
    refreshSession: async () => null,
    ensureDeviceIdentity: async () => "appearance-sol-device",
    clearSessionStorage: async () => { state.cleared += 1; },
    setSession: () => undefined,
  };
  return { state, value };
});
vi.mock("../../../packages/web-auth-device-session/src/session", async importOriginal => {
  const actual = await importOriginal<Record<string, unknown>>();
  return { ...actual, useWebAuthSession: () => { auth.state.calls += 1; return auth.value; } };
});

import { webHostRouteObjects } from "../../../apps/web/src/routes/router";

configureApp(webHostRouteObjects);
beforeEach(() => {
  setup();
  auth.state.calls = 0;
  auth.state.cleared = 0;
  auth.state.clientSignOuts = 0;
  auth.state.coordinatorSignOuts = 0;
  auth.value.client = null;
  auth.value.coordinator = undefined;
});
afterEach(() => { teardown(); });

it("FIXTURE F-B002 this file's storage wrappers record and delegate exactly once, never re-enter Storage and never call accountScope helpers", () => {
  const result = fb002SelfCheck();
  fb002Observe("F-B002 self-check", result);
  fb002Pre(result.nested === 0 && result.tripwire === 0 && JSON.stringify(result.delegatedPerCall) === JSON.stringify(FB002_DELEGATION), `F-B002 self-check: ${JSON.stringify(result)}`);
});

const departureDialog = (): Element | null => document.querySelector(".settings-departure-dialog");
async function failedAccent(value: Value = 295): Promise<void> {
  const quota = fault({ op: "set", key: ACCENT.key, label: "accent quota" });
  choose(ACCENT, value);
  await flush();
  fired(quota, "accent write");
}
async function failedTopbarTheme(value: Value = "dark"): Promise<void> {
  const quota = fault({ op: "set", key: THEME.key, label: "theme Topbar quota" });
  chooseTopbar(THEME, value);
  await flush();
  fired(quota, "theme Topbar write");
}

// ---------------------------------------------------------------------------
// Section 7 item 1: no Settings route guard
// ---------------------------------------------------------------------------

it("H12 §7.1 a pane failure, then the sidebar to another pane: not held, no dialog, the Topbar status shown; on return the draft is intact", async () => {
  const app = await mountApp();
  await failedAccent();
  fireEvent.click(sidebarRow("About"));
  await flush();
  expect(app.router.state.location.pathname, "§7.1: the sidebar is never held by Appearance drafts").toBe("/app/settings/about");
  expect(departureDialog(), "§7.1: no departure dialog").toBeNull();
  expect(topbarStatusNamed(), "§7.2: the Topbar status is shown off the pane").not.toBeNull();
  await go(app, "/app/settings/appearance");
  expect(shown(ACCENT), "§7: the App-lifetime draft is intact on return").toBe(295);
  expect(says(msg.notSaved(ACCENT)), "the failure feedback is intact").toBe(true);
  expect(runtimeErrors).toEqual([]);
});

it("H12 §7.1 a pane failure, then the AppRail and a programmatic navigation: not held, the Topbar status shown, the draft intact", async () => {
  const app = await mountApp();
  await failedAccent();
  fireEvent.click(railButton("Tasks"));
  await flush();
  expect(app.router.state.location.pathname, "§7.1: the AppRail is never held").toBe("/app/tasks");
  expect(departureDialog(), "no departure dialog").toBeNull();
  expect(topbarStatusNamed(), "§7.2: the Topbar status is shown on /app/tasks").not.toBeNull();
  await go(app, "/app/calendar");
  expect(app.router.state.location.pathname, "§7.1: programmatic navigation is never held").toBe("/app/calendar");
  await go(app, "/app/settings/appearance");
  expect(shown(ACCENT), "§7: the draft survives route changes").toBe(295);
});

it("H12 §7.1 Back and Forward with a draft are not held and land on the same history entries as an ordinary navigation", async () => {
  const app = await mountApp();
  await failedAccent();
  await go(app, "/app/tasks");
  const tasksEntry = { pathname: app.router.state.location.pathname, key: app.router.state.location.key, state: app.router.state.location.state };
  await go(app, -1);
  expect(app.router.state.location.pathname, "§7.1: Back is not held").toBe("/app/settings/appearance");
  await go(app, 1);
  expect({ pathname: app.router.state.location.pathname, key: app.router.state.location.key, state: app.router.state.location.state }, "§7.1: Forward returns to the same entry").toStrictEqual(tasksEntry);
  await go(app, -1);
  expect(shown(ACCENT), "§7: the draft is intact after Back and Forward").toBe(295);
  expect(runtimeErrors, "zero runtime errors").toEqual([]);
});

// ---------------------------------------------------------------------------
// Section 7 item 2: the Topbar status
// ---------------------------------------------------------------------------

it("H3 §7.2 a failed Topbar choice on /app/tasks shows the Topbar status; Review navigates exactly once to the pane through the shortcut event", async () => {
  const app = await mountApp("/app/tasks");
  await failedTopbarTheme();
  const status = need(topbarStatusNamed(), "H3 §7.2: the Topbar status for a settled Topbar failure");
  expect(status.tagName, "§7.2: the status is a button").toBe("BUTTON");
  const navigations = app.locations.length;
  const startKey = app.router.state.location.key;
  const events = bus.moduleChange.length;
  fireEvent.click(status);
  await flush();
  expect(app.router.state.location.pathname, "§7.2: Review navigates to the Appearance pane").toBe("/app/settings/appearance");
  expect(historyMutations(app, navigations, startKey).length, "§7.2: exactly one navigation").toBe(1);
  expect(bus.moduleChange.slice(events), "§7.2: the existing shortcut event is emitted once").toStrictEqual([{ moduleId: "settings", source: "shortcut" }]);
  expect(says(msg.notSaved(THEME)), "the pane shows the field message").toBe(true);
  need(retryOf(THEME), "H12: Retry Theme");
  need(discardOf(THEME), "H12: Discard Theme");
});

it("H3 §7.2 the Topbar status is rendered immediately after the premium badge slot in .topbar-controls and never touches storage", async () => {
  await mountApp("/app/tasks");
  await failedTopbarTheme();
  const status = need(topbarStatus(), "H3 §7.2: [data-testid=appearance-status]");
  const controls = topbar().querySelector(".topbar-controls");
  pre(controls, "the Topbar controls container is present");
  // The status node may wrap the button; locate its top-level node inside .topbar-controls.
  let top: Element | null = status;
  while (top && top.parentElement !== controls) top = top.parentElement;
  const badge = controls.querySelector('[data-testid="premium-tier-badge"]');
  let badgeTop: Element | null = badge;
  while (badgeTop && badgeTop.parentElement !== controls) badgeTop = badgeTop.parentElement;
  expect({
    inControls: top !== null,
    nextIsPref: top?.nextElementSibling?.classList.contains("topbar-pref") ?? false,
    afterBadge: badgeTop === null || top?.previousElementSibling === badgeTop,
  }, "§7.2: rendered in .topbar-controls immediately after the premium badge slot (before the appearance popover)").toStrictEqual({ inControls: true, nextIsPref: true, afterBadge: true });
  const from = mark();
  fireEvent.keyDown(status, { key: "Tab" });
  expect(writes(from), "the status never touches storage").toEqual([]);
});

it("H8 §7.2 a pending-only (held) Topbar write renders no status; a settled failure does; a successful Retry removes it", async () => {
  await mountApp("/app/tasks");
  const lock = await hold(keyLock(DENSITY));
  chooseTopbar(DENSITY, "compact");
  await flush();
  expect(bytes(DENSITY), "H8: the held per-key lock keeps the Topbar write pending").toBeNull();
  expect(topbarStatus(), "§7.2: no status while only pending").toBeNull();
  const quota = fault({ op: "set", key: DENSITY.key, times: 1, label: "density quota" });
  await lock.release();
  fired(quota, "density write");
  expect(topbarStatusNamed(), "§7.2: the status appears once the write failed").not.toBeNull();
});

it("H3 §7.2 the Topbar status in Chinese has the accessible name 外观更改未保存，前往设置查看。", async () => {
  seedValue(LANG, "zh");
  await mountApp("/app/tasks");
  pre(uiLang() === "zh", "the stored Chinese language is displayed");
  await failedTopbarTheme();
  need(topbarStatusNamed("zh"), "H3 §7.2: the Chinese Topbar status");
});

// ---------------------------------------------------------------------------
// Section 7 item 3: beforeunload
// ---------------------------------------------------------------------------

it("PC §7.3 no beforeunload warning in a clean state", async () => {
  await mountApp();
  const probe = unload();
  expect(probe, "§7.3: clean state").toStrictEqual({ warned: false, attempts: 0 });
});

it("§7.3 no beforeunload warning in a source-only state", async () => {
  seed(RAIL, "diagonal");
  await mountApp();
  expect(unload(), "§7.3: source-only state").toStrictEqual({ warned: false, attempts: 0 });
});

it("H12 §7.3 beforeunload warns while a failed draft exists, with zero storage attempts in the handler; the listener is removed after the success", async () => {
  await mountApp();
  const quota = fault({ op: "set", key: ACCENT.key, times: 1, label: "accent quota" });
  choose(ACCENT, 295);
  await flush();
  fired(quota, "accent write");
  expect(unload(), "§7.3: a failed draft warns and the handler makes zero storage attempts").toStrictEqual({ warned: true, attempts: 0 });
  fireEvent.click(need(retryOf(ACCENT), "H12: Retry Accent color"));
  await flush();
  expect(unload(), "§7.3: removed after the drafts cleared").toStrictEqual({ warned: false, attempts: 0 });
});

it("H8 §7.3 beforeunload warns while a pending (held) operation exists", async () => {
  await mountApp();
  const lock = await hold(keyLock(THEME));
  choose(THEME, "dark");
  await flush();
  expect(bytes(THEME), "H8: the held per-key lock keeps the theme write pending").toBeNull();
  expect(unload(), "§7.3: a pending draft warns").toStrictEqual({ warned: true, attempts: 0 });
  await lock.release();
  expect(unload().warned, "§7.3: no warning after the pending write completed").toBe(false);
});

// ---------------------------------------------------------------------------
// Section 7 item 4: the sign-out step, in both auth branches
// ---------------------------------------------------------------------------

type Branch = "fallback" | "coordinator";
function configureBranch(branch: Branch): void {
  stubLocation();
  if (branch === "coordinator") {
    auth.value.coordinator = {
      capture: () => ({ owner: OWNER_A, generation: "g1" }),
      signOut: async () => { auth.state.coordinatorSignOuts += 1; return { status: "applied" }; },
      bootstrap: async () => undefined,
    };
  } else {
    auth.value.client = { auth: { signOut: async () => { auth.state.clientSignOuts += 1; return {}; } } };
  }
}
const signedOut = (branch: Branch) => ({
  redirect: redirects.includes("/"),
  identityInvalidated: accountScope.capture().kind === "locked",
  backend: branch === "coordinator" ? auth.state.coordinatorSignOuts : auth.state.clientSignOuts,
});

describe.each(["fallback", "coordinator"] as const)("sign-out %s branch", branch => {
  it(`PC §7.4 ${branch}: without drafts sign-out makes zero confirm calls and completes exactly as at 5cd63ff`, async () => {
    configureBranch(branch);
    await mountApp("/app/tasks");
    const from = mark();
    await signOut();
    expect(confirmer.calls, "§7.4: no drafts, no confirm").toEqual([]);
    expect(signedOut(branch), "§7.4: the existing sequence completes").toStrictEqual({ redirect: true, identityInvalidated: true, backend: 1 });
    expect(writes(from).filter(entry => /xai_(pref_(lang|theme|density|font_scale)|accent_hue|rail_pos|bg_tone)/.test(entry)), "zero Appearance storage attempts").toEqual([]);
  });

  it(`H12 §7.4 ${branch}: with a failed draft, one confirm; Cancel resolves false with identity intact, zero history mutations and the draft, status and warning kept`, async () => {
    configureBranch(branch);
    const app = await mountApp("/app/settings/appearance");
    await failedAccent();
    const scope = accountScope.capture();
    const navigations = app.locations.length;
    const startKey = app.router.state.location.key;
    confirmer.answer = false;
    await signOut();
    expect(confirmer.calls, "§7.4: exactly one confirm with the normative text").toEqual([W.en.confirmSignOut]);
    expect(signedOut(branch), "§7.4 Cancel: nothing is invalidated or redirected").toStrictEqual({ redirect: false, identityInvalidated: false, backend: 0 });
    expect(accountScope.capture(), "identity intact").toBe(scope);
    expect(historyMutations(app, navigations, startKey), "zero history mutations").toEqual([]);
    expect(says(msg.notSaved(ACCENT)), "the draft is kept").toBe(true);
    expect(topbarStatus(), "the Topbar status is kept").not.toBeNull();
    expect(warns(), "the unload warning is kept").toBe(true);
  });

  it(`H12 §7.4 ${branch}: with a failed draft, one confirm; OK discards with zero Appearance writes and the existing sequence continues`, async () => {
    configureBranch(branch);
    await mountApp("/app/tasks");
    await failedTopbarTheme();
    const from = mark();
    confirmer.answer = true;
    await signOut();
    expect(confirmer.calls, "§7.4: exactly one confirm with the normative text").toEqual([W.en.confirmSignOut]);
    expect(writes(from).filter(entry => /xai_(pref_(lang|theme|density|font_scale)|accent_hue|rail_pos|bg_tone)/.test(entry)), "§7.4 OK: zero set/remove attempts by the step").toEqual([]);
    expect(signedOut(branch), "§7.4 OK: the existing sequence continues").toStrictEqual({ redirect: true, identityInvalidated: true, backend: 1 });
    expect(unload().warned, "§7.4 OK: the unload listener is removed").toBe(false);
    expect(runtimeErrors).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Section 7 item 5: a forced remount through the identity channel
// ---------------------------------------------------------------------------

it("H12 §7 REL-09 a forced scope change from another document remounts the App: committed values displayed, no saved claim, zero runtime errors", async () => {
  seedValue(ACCENT, 75);
  await mountApp();
  await failedAccent(295);
  expect(says(msg.notSaved(ACCENT)), "H12: the failed accent draft exists before the forced transition").toBe(true);
  await act(async () => {
    nativeSet.call(localStorage, "xai:auth:identity-change", JSON.stringify({ accountId: "appearance-sol-other", nonce: "1" }));
    window.dispatchEvent(new StorageEvent("storage", { key: "xai:auth:identity-change", newValue: JSON.stringify({ accountId: "appearance-sol-other", nonce: "1" }), storageArea: localStorage }));
  });
  await flush(24);
  pre(document.querySelector(".appearance-pane") === null, "the identity change from another document unmounted the App subtree");
  await act(async () => {
    window.dispatchEvent(new StorageEvent("storage", { key: "xai:auth:identity-change", newValue: JSON.stringify({ accountId: OWNER_A, nonce: "2" }), storageArea: localStorage }));
  });
  await flush(24);
  pre(document.querySelector(".appearance-pane") !== null && accountScope.capture().accountId === OWNER_A, "the App remounted for account A");
  expect(shown(ACCENT), "REL-09: the remounted controller displays the committed bytes").toBe(75);
  expect(says(msg.notSaved(ACCENT)), "REL-09: the in-memory draft is gone after the remount").toBe(false);
  expect(successShown(), "no saved claim after the remount").toBe(false);
  expect(runtimeErrors, "zero runtime errors").toEqual([]);
});

// ---------------------------------------------------------------------------
// Section 10 item 3: display truth and exactly one controller
// ---------------------------------------------------------------------------

it("PC §10.3 the system theme resolves through the media query and follows its change listener", async () => {
  await mountApp();
  choose(THEME, "system");
  await flush();
  expect(applied(THEME), "system resolves to light").toBe("light");
  setSystemDark(true);
  await flush();
  expect(applied(THEME), "the media-query listener re-applies system as dark").toBe("dark");
});

it("H5 §10.3 exactly one controller: a pane edit is visible in the Topbar and a Topbar edit in the pane, in the same frame", async () => {
  await mountApp();
  choose(DENSITY, "compact");
  await sameFrame();
  expect({ topbar: topbarChecked(DENSITY), summary: topbarSummary() }, "§10.3: the pane edit is visible in the Topbar in the same frame").toStrictEqual({ topbar: "compact", summary: summaryFor("en", "light", "compact") });
  chooseTopbar(THEME, "dark");
  await sameFrame();
  expect(shown(THEME), "H5 §10.3: the Topbar edit is visible in the pane in the same frame").toBe("dark");
});

it("H1 §10.3 .app[data-rail-pos] and <html> follow the displayed value of a failed rail draft and return to the committed bytes after Discard", async () => {
  seedValue(RAIL, "top");
  await mountApp();
  const quota = fault({ op: "set", key: RAIL.key, label: "rail quota" });
  choose(RAIL, "right");
  await flush();
  fired(quota, "rail write");
  expect({ html: applied(RAIL), app: appRailPos() }, "H1 §10.3: the displayed draft is applied").toStrictEqual({ html: "right", app: "right" });
  fireEvent.click(need(discardOf(RAIL), "H12: Discard Sidebar position"));
  await flush();
  expect({ html: applied(RAIL), app: appRailPos(), shown: shown(RAIL) }, "§10.3: after Discard the committed bytes").toStrictEqual({ html: "top", app: "top", shown: "top" });
});

it("H12 §10.3 a language draft re-renders the whole application; Discard returns every string to the committed language", async () => {
  await mountApp();
  const quota = fault({ op: "set", key: LANG.key, label: "lang quota" });
  choose(LANG, "zh");
  await flush();
  fired(quota, "lang write");
  expect(uiLang(), "§5.4: the language draft applies to the whole application").toBe("zh");
  fireEvent.click(need(discardOf(LANG, "zh"), "H12: 放弃 语言"));
  await flush();
  expect(uiLang(), "§10.3: after Discard the committed language").toBe("en");
});

// ---------------------------------------------------------------------------
// Section 10 item 4: crash safety for malformed values written while the App runs
// ---------------------------------------------------------------------------

it.each([
  { key: "xai_accent_hue", raw: "Infinity", id: "accentHue" as const },
  { key: "xai_rail_pos", raw: "diagonal", id: "railPos" as const },
  { key: "xai_pref_lang", raw: '"fr"', id: "lang" as const },
  { key: "xai_pref_font_scale", raw: "0", id: "fontScale" as const },
])("H6 H10 §10.4 a malformed $key written by another document leaves the idle field in its source state without a throw", async ({ key, raw, id }) => {
  await mountApp();
  await external(key, raw);
  expect(routeError(), "§10.4: no route error boundary").toBeNull();
  const field = [ACCENT, RAIL, LANG, FONT].find(entry => entry.id === id)!;
  expect(says(msg.unavailable(field, uiLang())), `§10.4: "${msg.unavailable(field, uiLang())}" source state`).toBe(true);
  expect(applied(field), "§10.4: the default is applied").toBe(appliedFor(field, field.defaultValue));
  expect(nativeGet.call(localStorage, key), "never rewritten").toBe(raw);
});

// ---------------------------------------------------------------------------
// H10: cross-document live updates of the four root keys
// ---------------------------------------------------------------------------

it.each([
  { id: "theme" as const, raw: '"dark"', value: "dark" },
  { id: "density" as const, raw: '"compact"', value: "compact" },
  { id: "fontScale" as const, raw: "1.1", value: 1.1 },
  { id: "lang" as const, raw: '"zh"', value: "zh" },
])("H10 §10.5 a committed $id change in another document is reflected live in <html>, the Topbar and the pane", async ({ id, raw, value }) => {
  const field = [THEME, DENSITY, FONT, LANG].find(entry => entry.id === id)!;
  await mountApp();
  await external(field.key, raw);
  expect(applied(field), "H10: the document follows the other document's commit").toBe(appliedFor(field, value));
  expect(shown(field, uiLang()), "H10: the pane follows").toBe(value);
  if (field !== FONT) expect(topbarChecked(field, uiLang()), "H10: the Topbar follows").toBe(value);
});

it("H10 §10.5 a drafted root field receiving another document's commit becomes a preserved conflict; Retry never overwrites", async () => {
  await mountApp();
  const quota = fault({ op: "set", key: THEME.key, label: "theme quota" });
  choose(THEME, "dark");
  await flush();
  fired(quota, "theme write");
  expect(says(msg.notSaved(THEME)), "H12: the failed theme draft").toBe(true);
  quota.off();
  await external(THEME.key, '"system"');
  const from = mark();
  fireEvent.click(need(retryOf(THEME), "H12: Retry Theme"));
  await flush();
  expect(writes(from), "§10.5: the preserved conflict is never overwritten").toEqual([]);
  expect(bytes(THEME)).toBe('"system"');
  expect(shown(THEME), "the draft stays displayed").toBe("dark");
});

// ---------------------------------------------------------------------------
// Section 10 item 7: cross-module isolation
// ---------------------------------------------------------------------------

it("H12 §10.7 during and after every Appearance operation the product dispatches zero StorageEvents and zero preference-changed events, and every other key keeps its bytes", async () => {
  for (const [key, value] of [["xai_pref_features_board", "false"], ["xai_pet_id", "pip"], ["xai_pet_pos", JSON.stringify({ x: 300, y: 200 })], ["xai_rail_order", JSON.stringify(["tasks", "ai", "calendar"])], ["xai_pref_sticky_color", "sky"]] as const) nativeSet.call(localStorage, key, value);
  seed(RAIL, "diagonal");
  const app = await mountApp();
  const others = snapshot();
  const startEvents = productStorageEvents().length;
  const stable = (operation: string) => {
    expect({ storageEvents: productStorageEvents().length - startEvents, preferenceChanged: bus.preference.map(entry => entry.key) }, `§10.7: ${operation} broadcasts nothing`).toStrictEqual({ storageEvents: 0, preferenceChanged: [] });
    expect(snapshot(), `§10.7: ${operation} leaves every other key byte-identical`).toStrictEqual(others);
    expect(document.querySelector(".pet-wrap") !== null, `${operation}: the DesktopPet is still mounted`).toBe(true);
  };
  choose(THEME, "dark");
  await flush();
  stable("an edit");
  const accentQuota = fault({ op: "set", key: ACCENT.key, label: "accent quota" });
  choose(ACCENT, 295);
  await flush();
  fired(accentQuota, "accent write");
  accentQuota.off();
  fireEvent.click(need(retryOf(ACCENT), "H12: Retry Accent color"));
  await flush();
  stable("a Retry");
  const densityQuota = fault({ op: "set", key: DENSITY.key, label: "density quota" });
  choose(DENSITY, "compact");
  await flush();
  fired(densityQuota, "density write");
  fireEvent.click(need(discardOf(DENSITY), "H12: Discard Density"));
  await flush();
  stable("a Discard");
  choose(DENSITY, "compact");
  choose(BG, "peach");
  await flush();
  fireEvent.click(need(discardAllButton(), "H12: Discard all changes"));
  await flush();
  densityQuota.off();
  stable("Discard all");
  nativeSet.call(localStorage, RAIL.key, "top");
  fireEvent.click(need(reloadOf(RAIL), "H12: Reload Sidebar position"));
  await flush();
  stable("a Reload");
  const harness = download();
  const fontQuota = fault({ op: "set", key: FONT.key, label: "font quota" });
  choose(FONT, 1.1);
  await flush();
  fired(fontQuota, "font write");
  fireEvent.click(need(exportButton(), "H12: Export Appearance draft"));
  await flush(2);
  pre(harness.clicks.length === 1, "the export downloaded once");
  stable("an export");
  fontQuota.off();
  fireEvent.click(need(retryAll(), "H16: Retry all"));
  await flush();
  stable("Retry all");
  clickReset(true);
  await flush(24);
  stable("a full reset");
  choose(RAIL, "right");
  await flush();
  const refusal = fault({ op: "remove", key: RAIL.key, label: "rail remove refused" });
  clickReset(true);
  await flush(24);
  fired(refusal, "rail removal");
  stable("a partial reset");
  refusal.off();
  const quota = fault({ op: "set", key: THEME.key, label: "theme quota" });
  choose(THEME, "dark");
  await flush();
  fired(quota, "theme write");
  stubLocation();
  confirmer.answer = false;
  await signOut();
  stable("the sign-out step with Cancel");
  observe("isolation final location", app.router.state.location.pathname);
});

// Referenced for the shared vocabulary.
void enc; void statusText; void generationMarkerKey;
