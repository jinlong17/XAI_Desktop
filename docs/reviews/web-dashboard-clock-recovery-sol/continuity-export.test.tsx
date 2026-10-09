/**
 * Mode `continuity-export` (contract r2 section 12): section 7 item 1 (no account machinery; an unrelated held account
 * lifecycle lock, and held `xai_rail_order` and `xai_pref_theme` per-key locks, never delay a Clock write — positive
 * controls at `f9eb4b1`), the Sol-layer lifetime (A→B, A→locked, locked→A and a same-account epoch change, each with a
 * held device-key lock; a failed draft surviving a scope change), unmount refusal of old participant callbacks, and
 * section 8 apart from the native disk shapes: memory-only export under total storage denial (style, timezone city,
 * timezone Local time over a city, both fields, a pending sibling), setup and click failures EN and ZH with the error
 * cleared by the next Clock action, liveness rechecks with unmount during Blob, URL and append time, and export never
 * saving, discarding or retrying.
 *
 * Seeds are in-domain (rule 10). Total denial is armed only after the draft is established (section 8).
 */
import { afterEach, beforeEach, expect, it } from "vitest";
import { act } from "@testing-library/react";
import { accountLifecycleLockName } from "@repo/plugin-web-storage";
import {
  accountTouches, action, activate, assertSelfCheck, attempts, blockState, bytes, choose, click, denyAllStorage, download, envelope,
  expectClockDownload, expectQuiet, exportButton, exportErrorShown, FAILED, failChoice, fieldWrites, flush, hold, LOCK, lockAccount, locks,
  mark, mountClock, need, NONE, OWNER_A, OWNER_B, pre, RAIL_LOCK, recorder, region, rejections, seed, setup, shown, stubBlob, teardown,
  THEME_LOCK, W, warns, writes, type Field, type Lang,
} from "./fixture";

beforeEach(() => { setup(); });
afterEach(() => { teardown(); });

it("FIXTURE F-B002 this file's storage wrappers record and delegate exactly once, never re-enter Storage and never call accountScope helpers", () => {
  assertSelfCheck();
});

// ---------------------------------------------------------------------------
// Section 7 item 1: no account machinery; lock independence (positive controls at f9eb4b1)
// ---------------------------------------------------------------------------

it("§7.1 (positive control) Clock choices touch no account key, request no account lifecycle lock and request only their own per-key locks", async () => {
  seed("style", "classic");
  seed("timezone", "local");
  await mountClock();
  const from = mark();
  const lockFrom = locks().log.length;
  choose("style", "analog");
  await flush();
  choose("timezone", "tokyo");
  await flush();
  expect({ style: bytes("style"), timezone: bytes("timezone") }).toStrictEqual({ style: "analog", timezone: "tokyo" });
  expect(accountTouches(from), "§7.1 zero attempts on xai:account:v1:* / xai:demo:v1:* keys").toEqual([]);
  const names = locks().productNames(lockFrom);
  expect(names.filter(name => name !== LOCK.style && name !== LOCK.timezone), "§7.1 no lock other than the two Clock per-key locks (no account lifecycle lock)").toEqual([]);
  expectQuiet("no account machinery");
});

it("§7.1 (positive control) an unrelated held account lifecycle lock does not delay a Clock choice", async () => {
  seed("style", "classic");
  await mountClock();
  const lifecycle = await hold(accountLifecycleLockName(OWNER_A));
  choose("style", "split");
  await flush();
  expect(bytes("style"), "§7.1 the Clock write completes while the account lifecycle lock is held").toBe("split");
  expect(shown("style")).toBe("split");
  expect(blockState("style")).toStrictEqual(NONE);
  await lifecycle.release();
  expectQuiet("account lock independence");
});

it("§7.1 host row c (positive control) held xai_rail_order and xai_pref_theme per-key locks do not delay a Clock choice: exactly one write", async () => {
  seed("timezone", "local");
  await mountClock();
  const rail = await hold(RAIL_LOCK);
  const theme = await hold(THEME_LOCK);
  const from = mark();
  choose("timezone", "singapore");
  await flush();
  expect(fieldWrites(from, "timezone"), "§7.1 exactly one write while both other per-key locks are held").toEqual(["singapore"]);
  expect(bytes("timezone")).toBe("singapore");
  await rail.release();
  await theme.release();
  expectQuiet("per-key lock independence");
});

// ---------------------------------------------------------------------------
// Section 7 item 2: Sol-layer lifetime with a held device-key lock
// ---------------------------------------------------------------------------

async function heldAcross(tag: string, transition: () => void, start?: () => void): Promise<void> {
  start?.();
  seed("style", "classic");
  await mountClock();
  const lock = await hold(LOCK.style);
  const from = mark();
  choose("style", "minimal");
  await flush();
  expect(bytes("style"), `H3 ${tag}: the held per-key lock keeps the bytes unchanged`).toBe("classic");
  transition();
  await flush();
  expect(shown("style"), `§7.2 ${tag}: the pending choice survives the scope change`).toBe("minimal");
  expect(warns(), `§7.2 ${tag}: the pending draft still warns`).toBe(true);
  await lock.release();
  expect(fieldWrites(from, "style"), `§7.2 ${tag}: the held operation completes with exactly one write`).toEqual(["minimal"]);
  expect(bytes("style")).toBe("minimal");
  expect(blockState("style")).toStrictEqual(NONE);
  expect(rejections.map(String), "no unhandled rejection").toEqual([]);
  expectQuiet(`lifetime ${tag}`);
}

it("H3 §7.2 Sol layer: a pending choice and its held operation survive A→B", async () => {
  await heldAcross("A→B", () => { activate(OWNER_B, "g1"); });
});
it("H3 §7.2 Sol layer: a pending choice and its held operation survive A→locked", async () => {
  await heldAcross("A→locked", () => { lockAccount(); });
});
it("H3 §7.2 Sol layer: a pending choice and its held operation survive locked→A", async () => {
  await heldAcross("locked→A", () => { activate(OWNER_A, "g1"); }, () => { lockAccount(); });
});
it("H3 §7.2 Sol layer: a pending choice and its held operation survive a same-account epoch change", async () => {
  await heldAcross("epoch", () => { activate(OWNER_A, "g2"); });
});

it("H1 §7.2 Sol layer: a failed draft survives A→B with its block, and its Retry still writes once", async () => {
  seed("style", "classic");
  await mountClock();
  const injected = await failChoice("style", "analog");
  activate(OWNER_B, "g1");
  await flush();
  expect(shown("style"), "H1 the failed choice stays displayed").toBe("analog");
  expect(blockState("style"), "§7.2 device bindings are not refused on a scope change: the block survives").toStrictEqual(FAILED);
  injected.off();
  const from = mark();
  click(need(action("style", "retry"), "§5.5 Retry Clock style"));
  await flush();
  expect(fieldWrites(from, "style")).toEqual(["analog"]);
  expect(blockState("style")).toStrictEqual(NONE);
  expectQuiet("failed draft across scope");
});

it("§7.9 unmount refusal: the participant unregisters on unmount and its old export and discard callbacks refuse (zero downloads, zero writes)", async () => {
  seed("style", "classic");
  const record = recorder();
  const view = await mountClock({ register: record.register });
  await failChoice("style", "analog");
  const guard = need(record.current(), "§6.7 the Clock participant registered through the provided registration");
  expect(record.blocking(), "§6.7 a failed draft blocks").toBe(true);
  view.unmount();
  expect(record.current(), "§7.9 the participant unregistered on unmount").toBeNull();
  const harness = download();
  const from = mark();
  act(() => { guard.exportDraft(); guard.discardDraft(); });
  await flush();
  expect({ isCurrent: guard.isCurrent(), isBlocking: guard.isBlocking() }, "§7.9 old callbacks refuse, based on live disposal state").toStrictEqual({ isCurrent: false, isBlocking: false });
  expect(harness.clicks, "§7.9 zero downloads after unmount").toEqual([]);
  expect(writes(from), "zero writes").toEqual([]);
  expectQuiet("unmount refusal");
});

// ---------------------------------------------------------------------------
// Section 8: memory-only export under total denial
// ---------------------------------------------------------------------------

async function exportUnderDenial(tag: string, expected: Partial<Record<Field, string>>, lang: Lang = "en"): Promise<void> {
  const button = need(exportButton(lang), `H1 H2 §8 ${tag}: the inline Export renders for a settled unsuccessful draft`);
  const regionBefore = region()?.textContent ?? null;
  const harness = download();
  const denial = denyAllStorage();
  const from = mark();
  click(button);
  await flush();
  expect(attempts(from), `§8 ${tag}: export makes zero getItem/setItem/removeItem attempts on any key`).toEqual([]);
  await expectClockDownload(harness, envelope(expected), tag);
  expect(warns(), `§8 ${tag}: the unload warning stays active`).toBe(true);
  expect(region()?.textContent ?? null, `§8 ${tag}: the recovery region is unchanged`).toBe(regionBefore);
  expect(exportErrorShown(lang), "no export error").toBe(false);
  denial.off();
  expectQuiet(`export ${tag}`);
}

it("H1 §8 shape 1: a style draft left by a quota failure exports exactly the style envelope from memory under total denial", async () => {
  seed("style", "classic");
  await mountClock();
  await failChoice("style", "analog");
  await exportUnderDenial("style", { style: "analog" });
});

it("H2 §8 shape 2: a timezone city draft exports from memory under total denial", async () => {
  seed("timezone", "local");
  await mountClock();
  await failChoice("timezone", "shanghai");
  await exportUnderDenial("timezone city", { timezone: "shanghai" });
});

it("H2 §8 shape 3: a timezone Local time draft over a city baseline exports \"local\"", async () => {
  seed("timezone", "london");
  await mountClock();
  await failChoice("timezone", "local");
  await exportUnderDenial("timezone local", { timezone: "local" });
});

it("H1 H2 §8 shape 4: both fields export in one envelope (style, then timezone)", async () => {
  seed("style", "split");
  seed("timezone", "local");
  await mountClock();
  await failChoice("style", "minimal");
  await failChoice("timezone", "berlin");
  await exportUnderDenial("both fields", { style: "minimal", timezone: "berlin" });
});

it("H1 §8 the inline Export includes a pending sibling (timezone held behind its lock) beside the failed style draft", async () => {
  seed("style", "classic");
  seed("timezone", "local");
  await mountClock();
  await failChoice("style", "analog");
  const lock = await hold(LOCK.timezone);
  choose("timezone", "hk");
  await flush();
  expect(bytes("timezone"), "H3 the timezone waits behind its held lock").toBe("local");
  await exportUnderDenial("pending sibling", { style: "analog", timezone: "hk" });
  await lock.release();
});

it("H1 §8 ZH: the inline Export is named 导出时钟草稿 and exports the same envelope", async () => {
  seed("style", "classic");
  await mountClock({ lang: "zh" });
  await failChoice("style", "split");
  await exportUnderDenial("zh", { style: "split" }, "zh");
});

for (const lang of ["en", "zh"] as const) {
  it(`H1 §8 ${lang.toUpperCase()}: a createObjectURL failure shows the localized export error in the Clock region, keeps drafts, hold and warning; the next Clock action clears it`, async () => {
    seed("style", "classic");
    await mountClock({ lang });
    await failChoice("style", "analog");
    const button = need(exportButton(lang), "H1 §8 the inline Export");
    const harness = download();
    harness.hooks.create = () => { throw new Error("clock-sol createObjectURL fails"); };
    const from = mark();
    click(button);
    await flush();
    expect(exportErrorShown(lang), `§8 the localized export error "${W[lang].exportError}" shows in the Clock recovery region`).toBe(true);
    expect(harness.clicks, "no download click").toEqual([]);
    expect(harness.anchorsInDocument().length, "§8 the anchor is removed").toBe(0);
    expect(blockState("style", lang), "§8 drafts are kept").toStrictEqual(FAILED);
    expect(warns(), "§8 the unload warning stays").toBe(true);
    expect(writes(from), "§8 export never saves, discards or retries").toEqual([]);
    harness.hooks.create = undefined;
    click(need(exportButton(lang), "Export again"));
    await flush();
    expect(harness.clicks.map(entry => entry.download), "the second Export downloads").toEqual(["clock-draft.json"]);
    expect(exportErrorShown(lang), "§8 the error clears at the next Clock action").toBe(false);
    expectQuiet(`setup failure ${lang}`);
  });
}

it("H1 §8 a click failure shows the export error; the object URL is revoked and the anchor removed; drafts are kept", async () => {
  seed("style", "classic");
  await mountClock();
  await failChoice("style", "minimal");
  const button = need(exportButton(), "H1 §8 the inline Export");
  const harness = download();
  harness.hooks.click = () => { throw new Error("clock-sol anchor click fails"); };
  click(button);
  await flush();
  expect(exportErrorShown(), "§8 the export error shows").toBe(true);
  expect(harness.created.length, "one object URL").toBe(1);
  expect(harness.revoked, "§8 that URL is revoked best-effort").toEqual(harness.created);
  expect(harness.anchorsInDocument().length, "§8 the anchor is removed").toBe(0);
  expect(blockState("style")).toStrictEqual(FAILED);
  expectQuiet("click failure");
});

for (const phase of ["blob", "url", "append"] as const) {
  it(`H1 §8 liveness: an unmount during ${phase} time cancels the click; any created URL is revoked; nothing throws`, async () => {
    seed("style", "classic");
    const view = await mountClock();
    await failChoice("style", "analog");
    const button = need(exportButton(), "H1 §8 the inline Export");
    const harness = download();
    let unmounted = false;
    const unmountOnce = (): void => { if (!unmounted) { unmounted = true; view.unmount(); } };
    if (phase === "blob") { stubBlob(harness); harness.hooks.blob = moment => { if (moment === "after") unmountOnce(); }; }
    if (phase === "url") harness.hooks.create = () => { unmountOnce(); };
    if (phase === "append") harness.hooks.afterAppend = () => { unmountOnce(); };
    click(button);
    await flush();
    pre(unmounted, `the ${phase} hook ran during the export`);
    expect(harness.clicks, `§8 an unmount during ${phase} time cancels the click`).toEqual([]);
    expect(harness.revoked, "§8 every created URL is revoked").toEqual(harness.created);
    expect(harness.anchorsInDocument().length, "no anchor left behind").toBe(0);
    expect(rejections.map(String)).toEqual([]);
    expectQuiet(`unmount during ${phase}`);
  });
}

it("H1 §8 export never saves, discards or retries: after a successful export the draft, its block and its Retry remain and nothing was written", async () => {
  seed("style", "classic");
  await mountClock();
  await failChoice("style", "split");
  const harness = download();
  const from = mark();
  click(need(exportButton(), "H1 §8 the inline Export"));
  await flush();
  expect(harness.clicks.length, "one download").toBe(1);
  expect(writes(from), "§8 zero writes").toEqual([]);
  expect(blockState("style"), "§8 the draft and its block remain").toStrictEqual(FAILED);
  expect(bytes("style")).toBe("classic");
  expect(shown("style")).toBe("split");
  expectQuiet("export no side effects");
});
