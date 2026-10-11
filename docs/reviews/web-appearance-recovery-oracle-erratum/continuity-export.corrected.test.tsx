/**
 * Mode `continuity-export` (contract r3 section 12): section 7's Sol-layer lifetime and unmount refusal, and
 * section 8 apart from the native disk shapes.
 *
 * Sol layer (section 7 "Sol layer"): the controller is mounted without the account gate — a standalone
 * `appearancePane.render({ lang })`, which owns its controller (A3) — under real accountScope transitions A→B,
 * A→locked, locked→A and a same-account epoch change. Export shapes 1–8 run in the production App under total
 * storage denial (attempt-level counters, one object URL created and revoked, the anchor removed, the warning and
 * the Topbar status kept); setup failures and unmount cancellation follow section 8. Hypotheses H1, H8 and H12.
 */
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, fireEvent } from "@testing-library/react";
import { accountLifecycleLockName, accountScope } from "@repo/plugin-web-storage";
import { appearancePane } from "@repo/plugin-web-settings-appearance";
import {
  ACCENT, activate, attempts, BG, bytes, choose, chooseTopbar, clickReset, configureApp, DENSITY, denyAllStorage, download, envelope,
  expectSingleDownload, exportButton, fault, FIELDS, fired, flush, FONT, go, hold, keyLock, LANG, lockAccount, locks, mark, mountApp,
  mountStandalone, msg, need, OWNER_A, OWNER_B, pre, RAIL, rejections, RESET, RESET_FIELDS, retryOf, says, seed, seedValue, SET, setSlider,
  setup, shown, sidebarRow, stubBlob, teardown, THEME, topbarStatus, uiLang, unload, usePaneRoot, W, warns, writesOn, accountTouches, discardAllButton,
  type Field, type FieldId, type Value,
  storageSelfCheck as fb002SelfCheck, SELF_CHECK_DELEGATION as FB002_DELEGATION, observe as fb002Observe, pre as fb002Pre,
} from "./fixture";

const auth = vi.hoisted(() => {
  const state = { calls: 0 };
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
    clearSessionStorage: async () => undefined,
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
beforeEach(() => { setup(); });
afterEach(() => { teardown(); });

it("FIXTURE F-B002 this file's storage wrappers record and delegate exactly once, never re-enter Storage and never call accountScope helpers", () => {
  const result = fb002SelfCheck();
  fb002Observe("F-B002 self-check", result);
  fb002Pre(result.nested === 0 && result.tripwire === 0 && JSON.stringify(result.delegatedPerCall) === JSON.stringify(FB002_DELEGATION), `F-B002 self-check: ${JSON.stringify(result)}`);
});

const CHOICE: Record<FieldId, Value> = { lang: "zh", theme: "dark", density: "compact", accentHue: 230, bgTone: "mist", railPos: "right", fontScale: 1.1 };
function standalone(): ReturnType<typeof mountStandalone> {
  const view = mountStandalone(appearancePane.render({ lang: "en" }));
  usePaneRoot(view.container as HTMLElement);
  return view;
}
const perKeyOnly = (from = 0): string[] => locks().productNames(from).filter(name => !name.startsWith("xai:pref:v1:"));
async function pick(field: Field, value: Value): Promise<void> {
  if (field === FONT) {
    if (shown(FONT) === value) { setSlider(FONT, value === 1.05 ? 1.1 : 1.05); await flush(); }
    setSlider(FONT, value);
    return;
  }
  choose(field, value);
}

// ---------------------------------------------------------------------------
// Section 7 Sol layer: lifetime under real accountScope transitions (standalone controller, no gate)
// ---------------------------------------------------------------------------

it("H1 H8 §7 A→B→locked→A: a failed registered draft and a held device operation survive every transition; the held write completes exactly once; Retry still saves", async () => {
  standalone();
  await flush();
  const quota = fault({ op: "set", key: ACCENT.key, label: "accent quota" });
  choose(ACCENT, 295);
  await flush();
  fired(quota, "accent write");
  const lock = await hold(keyLock(RAIL));
  const from = mark();
  choose(RAIL, "right");
  await flush();
  expect(shown(ACCENT), "H1: the failed accent choice stays displayed").toBe(295);
  expect(says(msg.notSaved(ACCENT)), "H12: the failed accent draft").toBe(true);
  expect(bytes(RAIL), "H8: the held per-key lock keeps the rail write pending").toBeNull();
  expect(says(msg.saving(RAIL)), "the held rail operation is pending").toBe(true);
  const steps: Array<[string, () => void]> = [
    ["A→B", () => { activate(OWNER_B, "g1"); }],
    ["B→locked", () => { lockAccount("appearance-sol-locked"); }],
    ["locked→A", () => { activate(OWNER_A, "g1"); }],
  ];
  for (const [label, transition] of steps) {
    act(() => { transition(); });
    await flush();
    expect(shown(ACCENT), `§7 ${label}: the failed accent draft is still displayed`).toBe(295);
    expect(says(msg.notSaved(ACCENT)), `§7 ${label}: the failed accent draft survives`).toBe(true);
    expect(says(msg.saving(RAIL)), `§7 ${label}: the held rail operation survives`).toBe(true);
    expect(locks().heldBy(keyLock(RAIL)), `§7 ${label}: the rail operation still waits behind the real held lock`).toBe("test");
  }
  await lock.release();
  expect(writesOn(from, RAIL), "§7: the held write completes exactly once").toEqual(["right"]);
  quota.off();
  fireEvent.click(need(retryOf(ACCENT), "H12: Retry Accent color"));
  await flush();
  expect(bytes(ACCENT), "the surviving draft still saves").toBe("295");
  expect(accountTouches(), "§7: no account physical key or marker is touched").toEqual([]);
  expect(perKeyOnly(), "§7: no account lifecycle or other lock is requested").toEqual([]);
  expect(rejections).toEqual([]);
});

it("H8 H12 §7 a same-account epoch change keeps a held root-field operation; it writes exactly once after release", async () => {
  standalone();
  await flush();
  const lock = await hold(keyLock(THEME));
  const from = mark();
  choose(THEME, "dark");
  await flush();
  expect(bytes(THEME), "H8: the held per-key lock keeps the theme write pending").toBeNull();
  expect(says(msg.saving(THEME)), `H12: "${msg.saving(THEME)}"`).toBe(true);
  act(() => { activate(OWNER_A, "g2"); });
  await flush();
  expect(says(msg.saving(THEME)), "§7: the held operation survives the same-account epoch change").toBe(true);
  expect(shown(THEME), "the latest choice is still displayed").toBe("dark");
  await lock.release();
  expect(writesOn(from, THEME), "§7: exactly one write after release").toEqual([JSON.stringify("dark")]);
  expect(says(msg.saving(THEME))).toBe(false);
});

it("H8 H9 §7 an admitted reset batch with a held removal and a refused removal continues across A→B", async () => {
  for (const field of RESET_FIELDS) seedValue(field, CHOICE[field.id]);
  standalone();
  await flush();
  const lock = await hold(keyLock(ACCENT));
  const refusal = fault({ op: "remove", key: RAIL.key, label: "rail remove refused" });
  clickReset(true, "en");
  await flush(24);
  expect(bytes(ACCENT), "H8: the held per-key lock keeps the accent removal pending").toBe("230");
  expect(says(msg.resetting(ACCENT)), `H12: "${msg.resetting(ACCENT)}"`).toBe(true);
  fired(refusal, "rail removal");
  expect(says(msg.notReset(RAIL)), `H9: "${msg.notReset(RAIL)}"`).toBe(true);
  act(() => { activate(OWNER_B, "g1"); });
  await flush();
  expect(says(msg.resetting(ACCENT)), "§7: the pending reset survives A→B").toBe(true);
  expect(says(msg.notReset(RAIL)), "§7: the reset draft survives A→B").toBe(true);
  await lock.release();
  expect(bytes(ACCENT), "§7: the admitted batch continued after A→B").toBeNull();
  refusal.off();
  fireEvent.click(need(retryOf(RAIL), "H12: Retry Sidebar position"));
  await flush();
  expect(bytes(RAIL)).toBeNull();
  expect(accountTouches(), "no account key touched").toEqual([]);
});

it("INV §7 edits and a reset across A→B never touch account keys, markers or account lifecycle locks", async () => {
  standalone();
  await flush();
  const from = mark();
  const lockFrom = locks().log.length;
  choose(ACCENT, 295);
  choose(RAIL, "right");
  await flush();
  act(() => { activate(OWNER_B, "g1"); });
  await flush();
  choose(BG, "peach");
  await flush();
  clickReset(true, "en");
  await flush(24);
  expect(accountTouches(from), "§7: no account physical key or marker is read, written or removed").toEqual([]);
  expect(perKeyOnly(lockFrom), "§7: only per-key locks are requested for these fields").toEqual([]);
});

it("INV §7 an unrelated held account lifecycle lock never delays a device edit or a reset", async () => {
  const accountLock = await hold(accountLifecycleLockName(OWNER_A));
  seedValue(RAIL, "top");
  seedValue(BG, "peach");
  standalone();
  await flush();
  choose(ACCENT, 295);
  await flush();
  expect(bytes(ACCENT), "§7: a device edit is not serialized behind an unrelated account lock").toBe("295");
  clickReset(true, "en");
  await flush(24);
  expect({ accent: bytes(ACCENT), rail: bytes(RAIL), bg: bytes(BG) }, "§7: a device reset is not serialized behind an unrelated account lock").toStrictEqual({ accent: null, rail: null, bg: null });
  await accountLock.release();
});

it("§7.3 §7.6 unmount removes the unload listener and detaches old callbacks; committed writes and removals are never undone", async () => {
  seedValue(RAIL, "top");
  const view = standalone();
  await flush();
  clickReset(true, "en");
  await flush(24);
  pre(bytes(RAIL) === null, "a committed removal before unmount");
  choose(ACCENT, 295);
  await flush();
  pre(bytes(ACCENT) === "295", "a committed write before unmount");
  const quota = fault({ op: "set", key: BG.key, label: "bg quota" });
  choose(BG, "mist");
  await flush();
  fired(quota, "bg write");
  expect(warns(), "§7.3: beforeunload warns while a draft exists").toBe(true);
  const retry = need(retryOf(BG), "H12: Retry Background palette");
  view.unmount();
  const harness = download();
  const from = mark();
  expect(unload().warned, "§7.6: the beforeunload listener was removed on unmount").toBe(false);
  retry.click();
  await flush();
  expect(attempts(from), "§7.6: detached callbacks make zero storage attempts").toEqual([]);
  expect(harness.created.length + harness.clicks.length, "a detached export never downloads").toBe(0);
  expect(bytes(ACCENT), "unmount never undoes committed writes").toBe("230");
  expect(bytes(RAIL), "unmount never undoes committed removals").toBeNull();
});

// ---------------------------------------------------------------------------
// Section 8: memory-only export shapes under total storage denial (production App)
// ---------------------------------------------------------------------------

async function exportUnderDenial(tag: string, expected: unknown, lang = uiLang()): Promise<void> {
  const control = need(exportButton(lang), `H12: ${W[lang].exportDraft}`);
  const statusShown = topbarStatus() !== null;
  const denial = denyAllStorage();
  const harness = download();
  const from = mark();
  fireEvent.click(control);
  await flush(2);
  expect(attempts(from).map(item => `${item.op}:${item.key}`), `${tag}: memory-only export: zero getItem/setItem/removeItem attempts under total denial`).toEqual([]);
  await expectSingleDownload(harness, expected, tag);
  expect(warns(), `${tag}: the unload warning is still active`).toBe(true);
  if (statusShown) expect(topbarStatus(), `${tag}: the Topbar status is still shown`).not.toBeNull();
  denial.off();
}

it("H3 H12 §8 shape 1: a sparse set left by a Topbar failure (theme)", async () => {
  await mountApp();
  const quota = fault({ op: "set", key: THEME.key, label: "theme quota" });
  chooseTopbar(THEME, "dark");
  await flush();
  fired(quota, "theme Topbar write");
  await exportUnderDenial("shape 1", envelope({ theme: SET("dark") }));
});

it("H1 H12 §8 shape 2: a sparse registered set (accent)", async () => {
  await mountApp();
  const quota = fault({ op: "set", key: ACCENT.key, label: "accent quota" });
  choose(ACCENT, 295);
  await flush();
  fired(quota, "accent write");
  await exportUnderDenial("shape 2", envelope({ accentHue: SET(295) }));
});

it("H1 H12 §8 shape 3: a background choice with both writes failing exports both entries", async () => {
  await mountApp();
  const tone = fault({ op: "set", key: BG.key, label: "tone quota" });
  const hue = fault({ op: "set", key: ACCENT.key, label: "hue quota" });
  choose(BG, "mist");
  await flush();
  fired(tone, "tone write");
  fired(hue, "hue write");
  await exportUnderDenial("shape 3", envelope({ bgTone: SET("mist"), accentHue: SET(230) }));
});

it("H9 H12 §8 shape 4: mixed set and reset entries", async () => {
  seedValue(RAIL, "top");
  await mountApp();
  const refusal = fault({ op: "remove", key: RAIL.key, label: "rail remove refused" });
  const resetFrom = mark();
  clickReset(true);
  await flush(24);
  expect(writesOn(resetFrom, RAIL), "H9 §6: the reset attempts one removal of xai_rail_pos").toEqual(["<remove>!"]);
  fired(refusal, "rail removal");
  const quota = fault({ op: "set", key: THEME.key, label: "theme quota" });
  choose(THEME, "dark");
  await flush();
  fired(quota, "theme write");
  await exportUnderDenial("shape 4", envelope({ theme: SET("dark"), railPos: RESET }));
});

it("H8 H12 §8 shape 5: all six pending resets behind held locks", async () => {
  for (const field of RESET_FIELDS) seedValue(field, CHOICE[field.id]);
  await mountApp();
  const holds = [];
  for (const field of RESET_FIELDS) holds.push(await hold(keyLock(field)));
  clickReset(true);
  await flush();
  expect(RESET_FIELDS.map(field => bytes(field)), "H8: every removal waits behind its held per-key lock").toEqual(RESET_FIELDS.map(field => field.encode(CHOICE[field.id])));
  await exportUnderDenial("shape 5", envelope({ theme: RESET, density: RESET, fontScale: RESET, accentHue: RESET, railPos: RESET, bgTone: RESET }));
  for (const held of holds) await held.release();
});

it("H1 H2 H12 §8 shape 6: all seven sets including language", async () => {
  await mountApp();
  const quotas = FIELDS.map(field => fault({ op: "set", key: field.key, label: `${field.id} quota` }));
  for (const field of FIELDS) { await pick(field, CHOICE[field.id]); await flush(); }
  for (const [index, field] of FIELDS.entries()) fired(quotas[index]!, `${field.id} write`);
  await exportUnderDenial("shape 6", envelope({ lang: SET("zh"), theme: SET("dark"), density: SET("compact"), accentHue: SET(230), bgTone: SET("mist"), railPos: SET("right"), fontScale: SET(1.1) }));
});

it("H8 H12 §8 shape 7: an export while one operation is held behind a real lock includes it and saves, retries or discards nothing", async () => {
  await mountApp();
  const lock = await hold(keyLock(THEME));
  const from = mark();
  choose(THEME, "dark");
  await flush();
  expect(bytes(THEME), "H8: the held per-key lock keeps the theme write pending").toBeNull();
  await exportUnderDenial("shape 7", envelope({ theme: SET("dark") }));
  await lock.release();
  expect(writesOn(from, THEME), "§8: export never saves, retries or discards: the held write happens exactly once after release").toEqual([JSON.stringify("dark")]);
});

it("H1 H12 §8 shape 8: an export after navigating away from the pane and back (App-lifetime drafts)", async () => {
  const app = await mountApp();
  const quota = fault({ op: "set", key: ACCENT.key, label: "accent quota" });
  choose(ACCENT, 295);
  await flush();
  fired(quota, "accent write");
  fireEvent.click(sidebarRow("About"));
  await flush();
  await go(app, "/app/tasks");
  await go(app, "/app/settings/appearance");
  expect(shown(ACCENT), "§7: the App-lifetime draft survives navigation").toBe(295);
  await exportUnderDenial("shape 8", envelope({ accentHue: SET(295) }));
});

it("H12 §8 the export excludes saved, default and source-only fields", async () => {
  seed(RAIL, "diagonal");
  await mountApp();
  choose(ACCENT, 295);
  await flush();
  pre(bytes(ACCENT) === "295", "the accent edit saved");
  const quota = fault({ op: "set", key: DENSITY.key, label: "density quota" });
  choose(DENSITY, "compact");
  await flush();
  fired(quota, "density write");
  await exportUnderDenial("exclusions", envelope({ density: SET("compact") }));
});

it("INV §8 without an actual draft there is no Export and no Discard all control", async () => {
  seed(RAIL, "diagonal");
  await mountApp();
  choose(ACCENT, 295);
  await flush();
  expect(exportButton(), "no Export control without actual drafts").toBeNull();
  expect(discardAllButton(), "no Discard all control without actual drafts").toBeNull();
});

it.each(["blob", "url", "append", "click"] as const)("H12 §8 a %s setup failure shows the localized export error, keeps drafts, warning and Topbar status, and cleans up", async stage => {
  await mountApp();
  const quota = fault({ op: "set", key: ACCENT.key, label: "accent quota" });
  choose(ACCENT, 295);
  await flush();
  fired(quota, "accent write");
  const control = need(exportButton(), "H12: Export Appearance draft");
  const harness = download();
  let thrown = 0;
  const failOnce = (what: string) => () => { thrown += 1; throw new Error(`${what} setup`); };
  if (stage === "blob") { stubBlob(harness); harness.hooks.blob = phase => { if (phase === "before") failOnce("blob")(); }; }
  if (stage === "url") harness.hooks.create = failOnce("url");
  if (stage === "append") harness.hooks.beforeAppend = failOnce("append");
  if (stage === "click") harness.hooks.click = failOnce("click");
  fireEvent.click(control);
  await flush(2);
  expect(thrown, `the export reached the ${stage} stage`).toBe(1);
  expect(says(W.en.exportFailed), `"${W.en.exportFailed}" after a ${stage} failure`).toBe(true);
  expect(harness.anchorsInDocument().length, "the anchor is removed").toBe(0);
  expect(harness.revoked, "every created object URL is revoked").toEqual(harness.created);
  need(retryOf(ACCENT), "the draft is kept after a failed export");
  expect(warns(), "the unload warning is kept after a failed export").toBe(true);
  expect(topbarStatus(), "the Topbar status is kept after a failed export").not.toBeNull();
  harness.hooks = {};
  vi.unstubAllGlobals();
  const retried = download();
  fireEvent.click(need(exportButton(), "Export Appearance draft after a failed export"));
  await flush(2);
  await expectSingleDownload(retried, envelope({ accentHue: SET(295) }), `export retry after a ${stage} failure`);
});

it("H12 §8 a setup failure in Chinese shows 导出失败，请重试。", async () => {
  seedValue(LANG, "zh");
  await mountApp();
  pre(uiLang() === "zh", "the stored Chinese language is displayed");
  const quota = fault({ op: "set", key: ACCENT.key, label: "accent quota" });
  choose(ACCENT, 295, "zh");
  await flush();
  fired(quota, "accent write");
  const control = need(exportButton("zh"), "H12: 导出外观草稿");
  const harness = download();
  harness.hooks.create = () => { throw new Error("url setup"); };
  fireEvent.click(control);
  await flush(2);
  expect(says(W.zh.exportFailed), "导出失败，请重试。").toBe(true);
  expect(harness.revoked).toEqual(harness.created);
});

it.each(["blob", "url", "append"] as const)("H12 §8 an unmount during %s cancels the click and cleans up (standalone controller)", async stage => {
  const view = standalone();
  await flush();
  const quota = fault({ op: "set", key: ACCENT.key, label: "accent quota" });
  choose(ACCENT, 295);
  await flush();
  fired(quota, "accent write");
  const control = need(exportButton("en"), "H12: Export Appearance draft");
  const harness = download();
  let unmounted = 0;
  const unmount = () => { unmounted += 1; view.unmount(); };
  if (stage === "blob") { stubBlob(harness); harness.hooks.blob = phase => { if (phase === "after") unmount(); }; }
  if (stage === "url") harness.hooks.create = unmount;
  if (stage === "append") harness.hooks.afterAppend = unmount;
  fireEvent.click(control);
  await flush(2);
  expect(unmounted, `the export reached the ${stage} stage`).toBe(1);
  expect(harness.clicks.length, "§8: the export never clicks after unmount").toBe(0);
  expect(harness.revoked, "every created object URL is revoked").toEqual(harness.created);
  expect(harness.anchorsInDocument().length, "the anchor is removed").toBe(0);
});

it("H12 §8 an export after an A→B transition (standalone controller) still exports the surviving device draft", async () => {
  standalone();
  await flush();
  const quota = fault({ op: "set", key: ACCENT.key, label: "accent quota" });
  choose(ACCENT, 295);
  await flush();
  fired(quota, "accent write");
  act(() => { activate(OWNER_B, "g1"); });
  await flush();
  pre(accountScope.capture().accountId === OWNER_B, "account B is active");
  const control = need(exportButton("en"), "H12: Export Appearance draft");
  const denial = denyAllStorage();
  const harness = download();
  const from = mark();
  fireEvent.click(control);
  await flush(2);
  expect(attempts(from), "memory-only export").toEqual([]);
  await expectSingleDownload(harness, envelope({ accentHue: SET(295) }), "export after A→B");
  denial.off();
});
