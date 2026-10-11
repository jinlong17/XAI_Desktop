/**
 * Mode `host` (contract r1 section 12): the section 7 protection model in the production `App` with only the
 * auth-session hook substituted — status render conditions (A8), the status button, panel states and focus targets,
 * `beforeunload`, the sign-out step in both auth branches with a `window.confirm` recorder (alone, with an Appearance
 * draft, with both, Cancel and OK), no route guard, a forced remount through the identity channel (REL-09), Features
 * toggles never writing the order (section 5 item 9), the Topbar slot order, one controller (section 10 item 3) and
 * cross-module isolation (section 10 item 7). Its business failures at 419e56d are H9.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, within } from "@testing-library/react";
import { accountScope } from "@repo/plugin-web-storage";
import {
  actionsShown, appearanceDraft, bus, closePanel, configureApp, configureRegistrations, confirmer, displayOf, download, drag, encode, failedDrop,
  fault, featureButton, featureKey, featureSwitch, fired, flush, go, hold, KEY, LOCK, mark, merge, message, mountApp, nativeGet, nativeSet,
  need, observe, openPanel, OWNER_A, panel, panelAction, panelOpen, pre, prefTrigger, productStorageEvents, RAIL_IDS, railButton, railIds,
  railWrites, raw, redirects, REVERSED, runtimeErrors, sameFrame, seedHidden, seedKey, seedOrder, SELF_CHECK_DELEGATION, setup, sidebarRow,
  signOut, snapshot, status, statusNamed, storageSelfCheck, stubLocation, teardown, uiLang, unload, user, visible, W, warns, historyMutations,
  railTouches, writes,
} from "./fixture";

const auth = vi.hoisted(() => {
  const state = { calls: 0, cleared: 0, clientSignOuts: 0, coordinatorSignOuts: 0 };
  const value: Record<string, unknown> = {
    state: "authenticated",
    session: { user: { id: "apprail-sol-A" } },
    client: null,
    coordinator: undefined,
    authError: null,
    signOutFailed: false,
    reportSignOutFailure: undefined,
    deviceId: null,
    syncVersion: "2026-05",
    refreshSession: async () => null,
    ensureDeviceIdentity: async () => "apprail-sol-device",
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
import { webShellModuleRegistrations } from "../../../apps/web/src/routes/modules/shellRegistrations";

configureApp(webHostRouteObjects);
configureRegistrations(webShellModuleRegistrations);
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
  const result = storageSelfCheck();
  observe("F-B002 self-check", result);
  pre(result.nested === 0 && result.tripwire === 0 && JSON.stringify(result.delegatedPerCall) === JSON.stringify(SELF_CHECK_DELEGATION), `F-B002 self-check: ${JSON.stringify(result)}`);
});

const X = REVERSED[0]!;
const Y1 = REVERSED[3]!;
async function mounted(path = "/app/tasks"): Promise<Awaited<ReturnType<typeof mountApp>>> {
  seedOrder(REVERSED);
  const app = await mountApp(path);
  pre(JSON.stringify(railIds()) === JSON.stringify(REVERSED), "the rail shows the seeded custom order (all modules visible)");
  return app;
}
/** A settled unsuccessful rail draft (quota) with the H9 business requirement that the status exists. */
async function railDraft(tag: string): Promise<{ order: string[] }> {
  const { order, quota } = await failedDrop(X, [Y1]);
  fired(quota, `${tag}: the rail write`);
  need(statusNamed("draft"), `H9 ${tag}: the Topbar rail status for an unsaved rail order`);
  expect(railIds(), `H2 ${tag}: the failed drop stays displayed`).toEqual(order);
  return { order };
}
/** The same unsaved rail order without checks, for the sign-out cases whose first business assertion is the confirm list (H9). */
async function railDraftUnchecked(tag: string): Promise<{ order: string[] }> {
  const { order, quota } = await failedDrop(X, [Y1]);
  fired(quota, `${tag}: the rail write`);
  return { order };
}
const statusRoot = (): Element | null => {
  const button = status();
  const controls = document.querySelector(".topbar .topbar-controls");
  if (!button || !controls) return null;
  let node: Element | null = button;
  while (node && node.parentElement !== controls) node = node.parentElement;
  return node;
};

// ---------------------------------------------------------------------------
// A8: status render conditions
// ---------------------------------------------------------------------------

it("PC A8 no status and no unload warning in a clean state", async () => {
  await mounted();
  expect(status(), "A8: no status node in a clean state").toBeNull();
  expect(warns(), "§7.3: no warning in a clean state").toBe(false);
});

it("H9 A8 a pending-only first attempt shows no status; once it settles unsuccessful the status renders; a successful Retry removes it", async () => {
  await mounted();
  const lock = await hold(LOCK);
  const quota = fault({ op: "set", key: KEY, label: "rail quota" });
  const order = await drag(X, [Y1]);
  expect(raw(), "H6: the held lock keeps the bytes unchanged").toBe(encode(REVERSED));
  expect(status(), "A8: a pending-only first attempt renders no status").toBeNull();
  expect(warns(), "§7.3: the pending draft warns").toBe(true);
  await lock.release();
  fired(quota, "the rail write after release");
  need(statusNamed("draft"), "H9 A8 rule (a): the status renders once the draft settled unsuccessful");
  quota.off();
  fireEvent.click(panelAction("retry", "Retry"));
  await flush();
  expect(status(), "A8: the status disappears after the verified success (the disappearance is the success signal)").toBeNull();
  expect(raw(), "the Retry committed").toBe(encode(merge(REVERSED, RAIL_IDS, order)!));
});

// ---------------------------------------------------------------------------
// Section 7 item 2: the status button and the panel
// ---------------------------------------------------------------------------

it("H9 §7.2 the status is a native button with aria-expanded and aria-controls; pointer activation toggles the panel exactly once, keeps focus and touches no storage", async () => {
  await mounted();
  await railDraft("status button");
  const button = status()!;
  expect(button.tagName, "§7.2: a native button").toBe("BUTTON");
  expect(button.getAttribute("type"), "type=button").toBe("button");
  expect(button.getAttribute("aria-expanded"), "closed initially").toBe("false");
  expect(button.getAttribute("aria-controls"), "controls the panel").toBe("rail-order-panel");
  const from = mark();
  await user().click(button);
  expect(button.getAttribute("aria-expanded"), "one click opens").toBe("true");
  const root = need(panelOpen() ? panel() : null, "the panel is open");
  expect(root.id, "id rail-order-panel").toBe("rail-order-panel");
  expect(root.getAttribute("role"), "role dialog").toBe("dialog");
  expect((within(document.body).queryAllByRole("dialog", { name: W.en.panel }) as HTMLElement[]).includes(root), `the panel is labelled "${W.en.panel}"`).toBe(true);
  expect(root.getAttribute("aria-modal") === "true", "the panel is non-modal").toBe(false);
  expect(document.activeElement, "focus stays on the status button").toBe(button);
  await user().click(button);
  expect(button.getAttribute("aria-expanded"), "a second click closes").toBe("false");
  expect(panelOpen(), "the panel is closed").toBe(false);
  expect(attempts(from), "§7.2: toggling the panel makes zero storage attempts").toEqual([]);
});

/** Section 7.2 "no storage attempt": no get/set/remove on xai_rail_order and no set/remove on any key. */
function attempts(from: number): string[] { return railTouches(from).concat(writes(from)); }

it("H9 §7.2 Enter and Space on the status each toggle the panel exactly once", async () => {
  await mounted();
  await railDraft("keyboard");
  const button = status()!;
  button.focus();
  const keys = user();
  await keys.keyboard("{Enter}");
  expect(button.getAttribute("aria-expanded"), "Enter opens exactly once").toBe("true");
  await keys.keyboard(" ");
  expect(button.getAttribute("aria-expanded"), "Space closes exactly once").toBe("false");
  await keys.keyboard(" ");
  expect(button.getAttribute("aria-expanded"), "Space opens exactly once").toBe("true");
});

it("H9 §7.2 the panel follows the button in DOM order inside one status root, so Tab reaches Retry, Discard and Export next, then the appearance trigger", async () => {
  await mounted();
  await railDraft("tab order");
  const button = status()!;
  await user().click(button);
  const root = need(statusRoot(), "the status root inside .topbar-controls");
  const opened = need(panel(), "the open panel");
  expect(root.contains(opened), "§7.2: the panel is inside the status root").toBe(true);
  expect(Boolean(button.compareDocumentPosition(opened) & Node.DOCUMENT_POSITION_FOLLOWING), "the panel follows the button in DOM order").toBe(true);
  const keys = user();
  const stops: string[] = [];
  for (let index = 0; index < 4; index += 1) {
    await keys.tab();
    const active = document.activeElement as HTMLElement | null;
    stops.push(active?.getAttribute("data-testid") ?? active?.className ?? "none");
  }
  expect(stops, "§9 Tab order: the panel actions, then the appearance trigger").toEqual(["rail-order-retry", "rail-order-discard", "rail-order-export", "topbar-pref-trigger"]);
});

it("H9 §7.2 Escape closes the panel and returns focus to the status button", async () => {
  await mounted();
  await railDraft("Escape");
  const button = status()!;
  await user().click(button);
  const retry = panelAction("retry", "Escape");
  retry.focus();
  await user().keyboard("{Escape}");
  expect(panelOpen(), "§7.2: Escape closes the panel").toBe(false);
  expect(document.activeElement, "§7.2: focus returns to the status button").toBe(status());
});

it("H9 §7.2 a mousedown outside the status root closes the panel; focus moves only when it was inside the panel", async () => {
  await mounted();
  await railDraft("outside mousedown");
  const button = status()!;
  await user().click(button);
  const outside = document.querySelector<HTMLElement>(".app-main") ?? document.body;
  fireEvent.mouseDown(outside);
  expect(panelOpen(), "§7.2: a mousedown outside closes the panel").toBe(false);
  expect(document.activeElement, "focus is not moved when it was on the status button").toBe(button);
  await user().click(button);
  panelAction("retry", "outside mousedown").focus();
  fireEvent.mouseDown(outside);
  expect(panelOpen(), "closed again").toBe(false);
  expect(document.activeElement, "§7.2: focus inside the panel moves to the status button").toBe(status());
});

it("H9 §7.2 a keyboard Retry that succeeds unmounts the status and moves focus to .topbar-pref-trigger, never <body>", async () => {
  await mounted();
  const { order, quota } = await failedDrop(X, [Y1]);
  need(statusNamed("draft"), "H9: the status");
  expect(railIds(), "H2: the failed drop stays displayed").toEqual(order);
  quota.off();
  const retry = panelAction("retry", "keyboard Retry");
  retry.focus();
  await user().keyboard("{Enter}");
  await flush();
  expect(status(), "the status unmounted after the success").toBeNull();
  expect(document.activeElement, "§7.2/§9: focus lands on .topbar-pref-trigger").toBe(prefTrigger());
});

it("H9 §7.2 placement: the status root sits immediately after the Appearance status and before .topbar-pref", async () => {
  await mounted();
  await appearanceDraft();
  await railDraft("placement");
  const root = need(statusRoot(), "the status root is a child of .topbar-controls");
  expect(root.nextElementSibling?.classList.contains("topbar-pref"), "§7.2: immediately before .topbar-pref").toBe(true);
  const previous = root.previousElementSibling;
  expect(previous?.getAttribute("data-testid") === "appearance-status" || previous?.querySelector('[data-testid="appearance-status"]') !== null, "§7.2: immediately after the appearanceStatus slot").toBe(true);
});

it("H9 §7.2 the status in Chinese: the draft accessible name and the panel name", async () => {
  seedOrder(REVERSED);
  seedKey("xai_pref_lang", JSON.stringify("zh"));
  await mountApp("/app/tasks");
  pre(uiLang() === "zh", "the UI is in Chinese");
  const { order } = await failedDrop(X, [Y1]);
  need(statusNamed("draft", "zh"), `H9: "${W.zh.statusDraft}"`);
  expect(railIds(), "H2: the failed drop stays displayed").toEqual(order);
  const root = openPanel("ZH");
  expect((within(document.body).queryAllByRole("dialog", { name: W.zh.panel }) as HTMLElement[]).includes(root), `the panel is labelled "${W.zh.panel}"`).toBe(true);
});

// ---------------------------------------------------------------------------
// Section 7 item 1: no route guard
// ---------------------------------------------------------------------------

it("H9 §7.1 with a failed draft a rail click and the Settings sidebar are not held; the status shows on every route; the draft is intact", async () => {
  const app = await mounted();
  const { order } = await railDraft("no route guard");
  fireEvent.click(railButton("calendar"));
  await flush();
  expect(app.router.state.location.pathname, "§7.1: a rail click is never held by rail drafts").toBe("/app/calendar");
  need(statusNamed("draft"), "§7.2: the status shows on /app/calendar");
  await go(app, "/app/settings/appearance");
  fireEvent.click(sidebarRow("About"));
  await flush();
  expect(app.router.state.location.pathname, "§7.1: the Settings sidebar is not held").toBe("/app/settings/about");
  expect(document.querySelector(".settings-departure-dialog"), "no departure dialog").toBeNull();
  need(statusNamed("draft"), "§7.2: the status shows in Settings");
  expect(railIds(), "§7: the App-lifetime draft is intact").toEqual(order);
  expect(runtimeErrors, "zero runtime errors").toEqual([]);
});

it("H9 §7.1 Back and Forward with a failed draft are not held and land on the same history entries as an ordinary navigation", async () => {
  const app = await mounted();
  const { order } = await railDraft("Back/Forward");
  await go(app, "/app/calendar");
  const entry = { pathname: app.router.state.location.pathname, key: app.router.state.location.key, state: app.router.state.location.state };
  await go(app, -1);
  expect(app.router.state.location.pathname, "§7.1: Back is not held").toBe("/app/tasks");
  await go(app, 1);
  expect({ pathname: app.router.state.location.pathname, key: app.router.state.location.key, state: app.router.state.location.state }, "§7.1: Forward returns to the same entry").toStrictEqual(entry);
  expect(railIds(), "the draft is intact").toEqual(order);
});

// ---------------------------------------------------------------------------
// Section 7 item 3: beforeunload
// ---------------------------------------------------------------------------

it("H9 §7.3 beforeunload warns while a failed rail draft exists, with zero storage attempts in the handler; it is removed after Discard", async () => {
  await mounted();
  await failedDrop(X, [Y1]);
  const probe = unload();
  expect(probe, "H9 §7.3: an unsaved rail order warns, with zero attempts in the handler").toStrictEqual({ warned: true, attempts: 0 });
  fireEvent.click(panelAction("discard", "Discard"));
  await flush();
  expect(unload().warned, "§7.3: no warning after the draft clears").toBe(false);
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
const appearanceStatus = (): Element | null => document.querySelector('header.topbar [data-testid="appearance-status"]');

describe.each(["fallback", "coordinator"] as const)("sign-out %s branch", branch => {
  it(`PC §7.4 ${branch}: without drafts sign-out makes zero confirm calls and completes as at 419e56d`, async () => {
    configureBranch(branch);
    await mounted();
    const from = mark();
    await signOut();
    expect(confirmer.calls, "§7.4: no drafts, no confirm").toEqual([]);
    expect(signedOut(branch), "§7.4: the existing sequence completes").toStrictEqual({ redirect: true, identityInvalidated: true, backend: 1 });
    expect(railWrites(from), "zero rail attempts").toEqual([]);
  });

  it(`PC §7.4 ${branch}: with an Appearance draft only, the confirm list is exactly the Appearance text`, async () => {
    configureBranch(branch);
    await mounted();
    await appearanceDraft();
    confirmer.answer = true;
    await signOut();
    expect(confirmer.calls, "§7.4: the rail step makes no confirm without a rail draft").toEqual([W.en.appearanceConfirm]);
    expect(signedOut(branch), "the sequence completes").toStrictEqual({ redirect: true, identityInvalidated: true, backend: 1 });
  });

  it(`H9 §7.4 ${branch}: with a failed rail draft, Cancel resolves false: one rail confirm, identity intact, zero history mutations, the draft, status and warning kept`, async () => {
    configureBranch(branch);
    const app = await mounted();
    const { order } = await railDraftUnchecked(`${branch} Cancel`);
    const scope = accountScope.capture();
    const navigations = app.locations.length;
    const startKey = app.router.state.location.key;
    confirmer.answer = false;
    await signOut();
    observe(`${branch} sign-out with an unsaved rail order, Cancel answered`, { confirms: confirmer.calls, outcome: signedOut(branch) });
    expect(confirmer.calls, "H9 §7.4: exactly one confirm with the rail text").toEqual([W.en.confirmSignOut]);
    expect(signedOut(branch), "§7.4 Cancel: nothing is invalidated or redirected").toStrictEqual({ redirect: false, identityInvalidated: false, backend: 0 });
    expect(accountScope.capture(), "identity intact").toBe(scope);
    expect(historyMutations(app, navigations, startKey), "zero history mutations").toEqual([]);
    expect(railIds(), "the draft is kept").toEqual(order);
    expect(status(), "the status is kept").not.toBeNull();
    expect(warns(), "the unload warning is kept").toBe(true);
  });

  it(`H9 §7.4 ${branch}: with a failed rail draft, OK discards it with zero writes and the existing sequence continues`, async () => {
    configureBranch(branch);
    await mounted();
    await railDraftUnchecked(`${branch} OK`);
    const from = mark();
    confirmer.answer = true;
    await signOut();
    observe(`${branch} sign-out with an unsaved rail order, OK answered`, { confirms: confirmer.calls, outcome: signedOut(branch) });
    expect(confirmer.calls, "H9 §7.4: exactly one confirm with the rail text").toEqual([W.en.confirmSignOut]);
    expect(railWrites(from), "§7.4 OK: zero set or remove attempts").toEqual([]);
    expect(signedOut(branch), "§7.4 OK: the existing sequence continues").toStrictEqual({ redirect: true, identityInvalidated: true, backend: 1 });
    expect(unload().warned, "§7.4 OK: the unload listener is removed").toBe(false);
    expect(runtimeErrors, "zero runtime errors").toEqual([]);
  });

  it(`H9 §7.4 ${branch}: with rail and Appearance drafts the confirm list is [rail, Appearance]; OK and OK proceeds`, async () => {
    configureBranch(branch);
    await mounted();
    await appearanceDraft();
    await railDraftUnchecked(`${branch} both OK`);
    confirmer.answers.push(true, true);
    await signOut();
    expect(confirmer.calls, "H9 §7.4: rail first, then Appearance").toEqual([W.en.confirmSignOut, W.en.appearanceConfirm]);
    expect(signedOut(branch), "OK and OK proceeds").toStrictEqual({ redirect: true, identityInvalidated: true, backend: 1 });
  });

  it(`H9 §7.4 ${branch}: OK at the rail step then Cancel at the Appearance step resolves false with the rail draft discarded and the Appearance draft kept`, async () => {
    configureBranch(branch);
    await mounted();
    await appearanceDraft();
    await railDraftUnchecked(`${branch} OK then Cancel`);
    const from = mark();
    confirmer.answers.push(true, false);
    await signOut();
    expect(confirmer.calls, "H9 §7.4: rail first, then Appearance").toEqual([W.en.confirmSignOut, W.en.appearanceConfirm]);
    expect(signedOut(branch), "the Appearance Cancel stops sign-out").toStrictEqual({ redirect: false, identityInvalidated: false, backend: 0 });
    expect(railWrites(from), "the rail discard made zero writes").toEqual([]);
    expect(status(), "§7.4: the rail draft was discarded").toBeNull();
    expect(railIds(), "the committed rail order displays").toEqual([...REVERSED]);
    expect(appearanceStatus(), "§7.4: the Appearance draft is kept").not.toBeNull();
  });

  it(`H9 §7.4 ${branch}: Cancel at the rail step never asks the Appearance step`, async () => {
    configureBranch(branch);
    await mounted();
    await appearanceDraft();
    await railDraftUnchecked(`${branch} rail Cancel`);
    confirmer.answers.push(false);
    await signOut();
    expect(confirmer.calls, "H9 §7.4: only the rail confirm").toEqual([W.en.confirmSignOut]);
    expect(appearanceStatus(), "the Appearance draft is untouched").not.toBeNull();
    expect(status(), "the rail draft is kept").not.toBeNull();
  });
});

it("H9 §7.4 the rail sign-out confirmation in Chinese", async () => {
  configureBranch("fallback");
  seedOrder(REVERSED);
  seedKey("xai_pref_lang", JSON.stringify("zh"));
  await mountApp("/app/tasks");
  pre(uiLang() === "zh", "the UI is in Chinese");
  const { order } = await failedDrop(X, [Y1]);
  confirmer.answer = false;
  await signOut("zh");
  expect(confirmer.calls, "H9 §7.4: the ZH rail confirmation").toEqual([W.zh.confirmSignOut]);
  expect(railIds(), "the draft is kept after Cancel").toEqual(order);
});

// ---------------------------------------------------------------------------
// Section 7 item 5: a forced remount through the identity channel (REL-09)
// ---------------------------------------------------------------------------

it("H9 §7 REL-09 a forced scope change from another document remounts the App: the committed order displays, no status, zero runtime errors", async () => {
  await mounted();
  await railDraft("forced remount");
  await act(async () => {
    nativeSet.call(localStorage, "xai:auth:identity-change", JSON.stringify({ accountId: "apprail-sol-other", nonce: "1" }));
    window.dispatchEvent(new StorageEvent("storage", { key: "xai:auth:identity-change", newValue: JSON.stringify({ accountId: "apprail-sol-other", nonce: "1" }), storageArea: localStorage }));
  });
  await flush(24);
  pre(document.querySelector(".app-rail") === null, "the identity change from another document unmounted the App subtree");
  await act(async () => {
    window.dispatchEvent(new StorageEvent("storage", { key: "xai:auth:identity-change", newValue: JSON.stringify({ accountId: OWNER_A, nonce: "2" }), storageArea: localStorage }));
  });
  await flush(24);
  pre(document.querySelector(".app-rail") !== null && accountScope.capture().accountId === OWNER_A, "the App remounted for account A");
  expect(railIds(), "REL-09: the remounted rail displays the committed order").toEqual([...REVERSED]);
  expect(status(), "REL-09: the in-memory draft is gone after the remount").toBeNull();
  expect(runtimeErrors, "zero runtime errors").toEqual([]);
});

// ---------------------------------------------------------------------------
// Section 5 item 9: Features toggles never write the order
// ---------------------------------------------------------------------------

it("PC §5.9 a Features toggle success, a toggle failure with Retry and Reset to defaults make zero attempts on xai_rail_order; the rail follows R", async () => {
  seedOrder(REVERSED);
  seedHidden([]);
  await mountApp("/app/settings/features");
  const from = mark();
  fireEvent.click(featureSwitch("board"));
  await flush(24);
  pre(nativeGet.call(localStorage, featureKey("board")) === "false", "the Features pane turned Boards off");
  expect(railIds(), "§5.9: the rail displays D(S, R)").toEqual(displayOf(REVERSED, visible(["board"])));
  const quota = fault({ op: "set", key: featureKey("habits"), label: "habits feature quota" });
  fireEvent.click(featureSwitch("habits"));
  await flush(24);
  fired(quota, "the Features habits write");
  quota.off();
  const retry = featureButton("Retry Habits");
  pre(retry, "the Features pane offers Retry Habits");
  fireEvent.click(retry);
  await flush(24);
  pre(nativeGet.call(localStorage, featureKey("habits")) === "false", "the Features Retry committed Habits off");
  expect(railIds(), "§5.9: the rail follows R after the Retry").toEqual(displayOf(REVERSED, visible(["board", "habits"])));
  const reset = featureButton("Reset to defaults");
  pre(reset, "the Features pane offers Reset to defaults");
  confirmer.answer = true;
  fireEvent.click(reset);
  await flush(24);
  expect(railIds(), "§5.9: the rail follows R after the Features reset").toEqual([...REVERSED]);
  expect(railWrites(from), "§5.9: zero set or remove attempts on xai_rail_order").toEqual([]);
  expect(raw(), "the stored order is unchanged").toBe(encode(REVERSED));
});

// ---------------------------------------------------------------------------
// Section 10 items 3 and 7: one controller and isolation
// ---------------------------------------------------------------------------

it("H9 §10.3 exactly one controller: Discard updates the rail and removes the status in the same frame", async () => {
  await mounted();
  await railDraft("one controller");
  fireEvent.click(panelAction("discard", "same-frame Discard"));
  await sameFrame();
  expect({ rail: railIds(), status: status() === null }, "§10.3: rail and status change together").toStrictEqual({ rail: [...REVERSED], status: true });
});

it("H9 §10.7 every rail operation dispatches zero StorageEvents and zero preference-changed events, and every other key keeps its bytes", async () => {
  seedKey("xai_pref_features_board", "true");
  seedKey("xai_accent_hue", "230");
  seedKey("xai_pet_id", "pip");
  await mounted();
  const before = snapshot();
  const events = productStorageEvents().length;
  await drag(REVERSED[2]!, [REVERSED[6]!], null);
  const committed = await drag(X, [Y1]);
  expect(productStorageEvents(events), "§10.7: zero StorageEvents after a drag and a cancelled drag").toEqual([]);
  expect(raw(), "the drag committed").toBe(encode(merge(REVERSED, RAIL_IDS, committed)!));
  const quota = fault({ op: "set", key: KEY, label: "rail quota" });
  await drag(committed[4]!, [committed[1]!]);
  fired(quota, "the rail write");
  need(statusNamed("draft"), "H9: the status for the failed drop");
  fireEvent.click(panelAction("retry", "isolation Retry"));
  await flush();
  const harness = download();
  fireEvent.click(panelAction("export", "isolation Export"));
  await flush(2);
  observe("isolation export clicks", harness.clicks.length);
  fireEvent.click(panelAction("discard", "isolation Discard"));
  await flush();
  expect(productStorageEvents(events), "§10.7: zero StorageEvents across every operation").toEqual([]);
  expect(bus.preference, "§10.7: zero web:settings:preference-changed events").toEqual([]);
  expect(snapshot(), "§10.7: every key other than xai_rail_order keeps its bytes").toStrictEqual(before);
  closePanel();
  expect(actionsShown(), "no panel after Discard").toEqual([]);
  expect(message(), "no message").toBeNull();
});
