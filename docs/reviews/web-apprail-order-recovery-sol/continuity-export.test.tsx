/**
 * Mode `continuity-export` (contract r1 section 12): section 7 lifetime at the Sol layer — a standalone AppRail (its
 * own controller, A3) under a real accountScope without the gate: A→B, A→locked, locked→A and a same-account epoch
 * change, each with a held device-key lock; unmount refusal; no account machinery and an unrelated held account
 * lifecycle lock never delaying a rail write — and section 8 apart from the native disk shapes: the memory-only export
 * under total storage denial for the five shapes (all visible, Boards hidden with `board` kept at its stored index,
 * malformed `{}`, a Retry held behind the real lock, after navigating away and back), setup failures EN and ZH, the
 * export-failure line cleared by the next panel action, and an unmount during setup.
 */
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { fireEvent } from "@testing-library/react";
import { accountLifecycleLockName } from "@repo/plugin-web-storage";
import {
  accountTouches, activate, attempts, BOARD_AT_2, configureApp, configureRegistrations, DEFAULT_ORDER, denyAllStorage, download, drag, encode,
  envelope, expectSingleDownload, failedDrop, fired, flush, go, hold, KEY, LOCK, lockAccount, locks, mark, merge, message, mountApp,
  mountStandalone, need, observe, openPanel, OWNER_A, OWNER_B, panel, panelAction, pre, RAIL_IDS, railIds, railWrites, raw, rejections,
  REVERSED, routeError, runtimeErrors, seedHidden, seedKey, seedMalformed, seedOrder, SELF_CHECK_DELEGATION, setup, status, statusNamed,
  storageSelfCheck, stubBlob, teardown, uiLang, user, visible, W, warns,
} from "./fixture";

const auth = vi.hoisted(() => {
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
    clearSessionStorage: async () => undefined,
    setSession: () => undefined,
  };
  return { value };
});
vi.mock("../../../packages/web-auth-device-session/src/session", async importOriginal => {
  const actual = await importOriginal<Record<string, unknown>>();
  return { ...actual, useWebAuthSession: () => auth.value };
});

import { webHostRouteObjects } from "../../../apps/web/src/routes/router";
import { webShellModuleRegistrations } from "../../../apps/web/src/routes/modules/shellRegistrations";

configureApp(webHostRouteObjects);
configureRegistrations(webShellModuleRegistrations);
beforeEach(() => { setup(); });
afterEach(() => { teardown(); });

it("FIXTURE F-B002 this file's storage wrappers record and delegate exactly once, never re-enter Storage and never call accountScope helpers", () => {
  const result = storageSelfCheck();
  observe("F-B002 self-check", result);
  pre(result.nested === 0 && result.tripwire === 0 && JSON.stringify(result.delegatedPerCall) === JSON.stringify(SELF_CHECK_DELEGATION), `F-B002 self-check: ${JSON.stringify(result)}`);
});

const X = REVERSED[0]!;
const Y1 = REVERSED[3]!;

// ---------------------------------------------------------------------------
// Section 7 lifetime at the Sol layer (standalone controller, real accountScope, no gate)
// ---------------------------------------------------------------------------

async function heldAcross(tag: string, transition: () => void, start?: () => void): Promise<void> {
  start?.();
  seedOrder(REVERSED);
  await mountStandalone();
  const lock = await hold(LOCK);
  const from = mark();
  const order = await drag(X, [Y1]);
  expect(raw(), `H6 ${tag}: the held per-key lock keeps the bytes unchanged`).toBe(encode(REVERSED));
  expect(railIds(), `${tag}: the draft displays`).toEqual(order);
  transition();
  await flush();
  expect(railIds(), `§7 ${tag}: the draft survives the scope change`).toEqual(order);
  await lock.release();
  expect(railWrites(from), `§7 ${tag}: the held operation completes with exactly one write of the A2 merge`).toEqual([encode(merge(REVERSED, RAIL_IDS, order)!)]);
  expect(railIds(), `${tag}: the committed order displays`).toEqual(order);
  expect(rejections, "no unhandled rejection").toEqual([]);
}

it("H6 §7 Sol layer: a draft and a held operation survive A→B", async () => {
  await heldAcross("A→B", () => { activate(OWNER_B, "g1"); });
});

it("H6 §7 Sol layer: a draft and a held operation survive A→locked", async () => {
  await heldAcross("A→locked", () => { lockAccount(); });
});

it("H6 §7 Sol layer: a draft and a held operation survive locked→A", async () => {
  await heldAcross("locked→A", () => { activate(OWNER_A, "g1"); }, () => { lockAccount(); });
});

it("H6 §7 Sol layer: a draft and a held operation survive a same-account epoch change", async () => {
  await heldAcross("epoch", () => { activate(OWNER_A, "g2"); });
});

it("H6 §7.6 Sol layer: unmount while held — old callbacks refuse on release, based on live disposal state", async () => {
  seedOrder(REVERSED);
  const view = await mountStandalone();
  const lock = await hold(LOCK);
  await drag(X, [Y1]);
  expect(raw(), "H6: the held per-key lock keeps the bytes unchanged").toBe(encode(REVERSED));
  view.unmount();
  const from = mark();
  await lock.release();
  expect(railWrites(from), "§7.6: zero writes after unmount").toEqual([]);
  expect(runtimeErrors, "zero runtime errors").toEqual([]);
  expect(rejections, "no unhandled rejection").toEqual([]);
});

it("PC §7 an unrelated held account lifecycle lock never delays a rail write", async () => {
  seedOrder(REVERSED);
  await mountApp("/app/tasks");
  const accountLock = await hold(accountLifecycleLockName(OWNER_A));
  const order = await drag(X, [Y1]);
  expect(raw(), "§7: the rail write completed while the account lifecycle lock is held").toBe(encode(merge(REVERSED, RAIL_IDS, order)!));
  await accountLock.release();
});

it("PC §7 the rail never touches account machinery: no account or demo physical key, no account lifecycle lock, only its own per-key lock", async () => {
  seedOrder(REVERSED);
  await mountApp("/app/tasks");
  const from = mark();
  const before = locks().log.length;
  await drag(X, [Y1]);
  await drag(REVERSED[5]!, [REVERSED[2]!], null);
  const names = locks().productNames(before);
  observe("product lock names during rail operations", names);
  expect(accountTouches(from), "§7: zero attempts on xai:account:v1:* / xai:demo:v1:* keys").toEqual([]);
  expect(names.filter(name => name !== LOCK), "§7: no lock other than the rail's per-key lock").toEqual([]);
});

// ---------------------------------------------------------------------------
// Section 8: memory-only export under total storage denial
// ---------------------------------------------------------------------------

async function exportUnderDenial(tag: string, expected: readonly string[]): Promise<void> {
  const control = panelAction("export", tag);
  expect((control.textContent ?? "").includes(W[uiLang()].export.label), `${tag}: visible label "${W[uiLang()].export.label}"`).toBe(true);
  const harness = download();
  const denial = denyAllStorage();
  const from = mark();
  await user().click(control);
  await flush(2);
  expect(attempts(from), `${tag}: zero getItem, setItem or removeItem attempts during the export`).toEqual([]);
  denial.off();
  await expectSingleDownload(harness, envelope(expected), tag);
  expect(warns(), `${tag}: the unload warning stays active`).toBe(true);
  expect(status(), `${tag}: the status stays shown`).not.toBeNull();
  expect(document.activeElement?.getAttribute("data-testid"), `${tag}: after Export focus stays on Export`).toBe("rail-order-export");
}

it("H2 §8 shape 1: a failed drop with every module visible exports the A2 merge in the set envelope", async () => {
  seedOrder(REVERSED);
  await mountApp("/app/tasks");
  const { order, quota } = await failedDrop(X, [Y1]);
  fired(quota, "the rail write");
  expect(railIds(), "H2: the failed drop stays displayed").toEqual(order);
  await exportUnderDenial("shape 1", merge(REVERSED, RAIL_IDS, order)!);
  expect(raw(), "Export never saves").toBe(encode(REVERSED));
});

it("H2 §8 shape 2: a failed drop with Boards hidden exports a value that keeps `board` at its stored index", async () => {
  seedOrder(BOARD_AT_2);
  seedHidden(["board"]);
  await mountApp("/app/tasks");
  const shown = railIds();
  const { order } = await failedDrop(shown[0]!, [shown[4]!]);
  expect(railIds(), "H2: the failed drop stays displayed").toEqual(order);
  const expected = merge(BOARD_AT_2, visible(["board"]), order)!;
  pre(expected[2] === "board", "the expected value keeps board at index 2");
  await exportUnderDenial("shape 2", expected);
});

it("H1 §8 shape 3: a failed drop over `{}` exports the merge over DEFAULT_RAIL_ORDER", async () => {
  seedMalformed("{}");
  await mountApp("/app/tasks");
  expect(routeError(), "H1: no route error").toBeNull();
  const shown = railIds();
  const order = await drag(shown[0]!, [shown[2]!]);
  need(statusNamed("draft"), "A5: the refused drag is a failed draft");
  await exportUnderDenial("shape 3", merge(DEFAULT_ORDER, RAIL_IDS, order)!);
  expect(raw(), "the malformed bytes are unchanged").toBe("{}");
});

it("H2 §8 shape 4: an export while a Retry is held behind the real per-key lock", async () => {
  seedOrder(REVERSED);
  await mountApp("/app/tasks");
  const { order, quota } = await failedDrop(X, [Y1]);
  expect(railIds(), "H2: the failed drop stays displayed").toEqual(order);
  quota.off();
  const lock = await hold(LOCK);
  fireEvent.click(panelAction("retry", "held Retry"));
  await flush();
  await exportUnderDenial("shape 4", merge(REVERSED, RAIL_IDS, order)!);
  await lock.release();
  expect(raw(), "the held Retry commits after release").toBe(encode(merge(REVERSED, RAIL_IDS, order)!));
});

it("H2 §8 shape 5: an export after navigating to another route and back (App lifetime)", async () => {
  seedOrder(REVERSED);
  const app = await mountApp("/app/tasks");
  const { order } = await failedDrop(X, [Y1]);
  expect(railIds(), "H2: the failed drop stays displayed").toEqual(order);
  await go(app, "/app/calendar");
  need(statusNamed("draft"), "§7: the status shows on /app/calendar");
  await go(app, "/app/tasks");
  expect(railIds(), "§7: the draft survives route changes").toEqual(order);
  await exportUnderDenial("shape 5", merge(REVERSED, RAIL_IDS, order)!);
});

it("PC §8 Export is offered only while a draft exists: no status in a clean state", async () => {
  seedOrder(REVERSED);
  await mountApp("/app/tasks");
  expect(status(), "no status, so no Export, in a clean state").toBeNull();
  expect(document.querySelector('[data-testid="rail-order-export"]'), "no Export control").toBeNull();
});

for (const stage of ["blob", "url", "append", "click"] as const) {
  it(`H2 §8 a ${stage} setup failure shows the localized export error, keeps the draft, warning and status, and cleans up`, async () => {
    seedOrder(REVERSED);
    await mountApp("/app/tasks");
    const { order } = await failedDrop(X, [Y1]);
    expect(railIds(), "H2: the failed drop stays displayed").toEqual(order);
    const control = panelAction("export", `${stage} failure`);
    const NativeBlob = globalThis.Blob;
    const harness = download();
    let thrown = 0;
    const failOnce = (what: string) => () => { thrown += 1; throw new Error(`${what} setup`); };
    if (stage === "blob") { stubBlob(harness); harness.hooks.blob = phase => { if (phase === "before") failOnce("blob")(); }; }
    if (stage === "url") harness.hooks.create = failOnce("url");
    if (stage === "append") harness.hooks.beforeAppend = failOnce("append");
    if (stage === "click") harness.hooks.click = failOnce("click");
    fireEvent.click(control);
    await flush(2);
    pre(thrown === 1, `the export reached the ${stage} stage`);
    expect(panel()?.textContent?.includes(W.en.exportFailed), `"${W.en.exportFailed}" in the panel after a ${stage} failure`).toBe(true);
    expect(harness.anchorsInDocument().length, "the anchor is removed").toBe(0);
    expect(harness.revoked, "every created object URL is revoked").toEqual(harness.created);
    need(statusNamed("draft"), "the draft status is kept after a failed export");
    expect(warns(), "the unload warning is kept").toBe(true);
    expect(railIds(), "the draft stays displayed").toEqual(order);
    harness.hooks = {};
    vi.stubGlobal("Blob", NativeBlob);
    const retried = download();
    fireEvent.click(panelAction("export", `${stage} export again`));
    await flush(2);
    await expectSingleDownload(retried, envelope(merge(REVERSED, RAIL_IDS, order)!), `export after a ${stage} failure`);
  });
}

it("H2 §8 a setup failure in Chinese shows 导出失败，请重试。; the next panel action clears the line", async () => {
  seedOrder(REVERSED);
  seedKey("xai_pref_lang", JSON.stringify("zh"));
  await mountApp("/app/tasks");
  pre(uiLang() === "zh", "the UI is in Chinese");
  const { order } = await failedDrop(X, [Y1]);
  expect(railIds(), "H2: the failed drop stays displayed").toEqual(order);
  const control = panelAction("export", "ZH export", "zh");
  const harness = download();
  harness.hooks.create = () => { throw new Error("url setup"); };
  fireEvent.click(control);
  await flush(2);
  expect(panel()?.textContent?.includes(W.zh.exportFailed), "导出失败，请重试。").toBe(true);
  expect(harness.revoked).toEqual(harness.created);
  fireEvent.click(panelAction("retry", "ZH Retry clears the export line", "zh"));
  await flush();
  expect(panel()?.textContent?.includes(W.zh.exportFailed) ?? false, "§7.2: the export-failure line is cleared by the next panel action").toBe(false);
  expect(message(), "the failure message after the refused Retry").toBe(W.zh.notSaved);
});

for (const stage of ["blob", "url", "append"] as const) {
  it(`H2 §8 an unmount during ${stage} setup cancels the click and cleans up`, async () => {
    seedOrder(REVERSED);
    const app = await mountApp("/app/tasks");
    const { order } = await failedDrop(X, [Y1]);
    expect(railIds(), "H2: the failed drop stays displayed").toEqual(order);
    const control = panelAction("export", `unmount during ${stage}`);
    const harness = download();
    let unmounted = false;
    const unmount = () => { if (!unmounted) { unmounted = true; app.unmount(); } };
    if (stage === "blob") { stubBlob(harness); harness.hooks.blob = phase => { if (phase === "after") unmount(); }; }
    if (stage === "url") harness.hooks.create = unmount;
    if (stage === "append") harness.hooks.afterAppend = unmount;
    fireEvent.click(control);
    await flush(2);
    pre(unmounted, `the unmount happened during ${stage}`);
    expect(harness.clicks.length, "§8: an unmount during setup cancels the click").toBe(0);
    expect(harness.anchorsInDocument().length, "the anchor is removed").toBe(0);
    expect(harness.revoked, "every created object URL is revoked").toEqual(harness.created);
    expect(runtimeErrors, "zero runtime errors").toEqual([]);
    expect(raw(), "the export never saves").toBe(encode(REVERSED));
    expect(attempts(0, [KEY], ["remove"]), "never removes").toEqual([]);
  });
}
