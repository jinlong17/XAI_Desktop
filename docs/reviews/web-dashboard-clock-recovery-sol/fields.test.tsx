/**
 * Mode `fields` (contract r2 section 12): per field, every section 5 item 5 failure kind with Retry (H1, H2); source
 * truth for every section 5 item 2 malformed value and a key-scoped throwing getItem, with Reload only (H4); a valid
 * choice over a malformed source is a failed draft that never overwrites; targeted Discard with zero writes and zero
 * sibling reads; both fields unresolved; one field failing while the other succeeds; a conflict plus an unrelated
 * quota failure; late completions after unmount ignored; no success claim; EN and ZH wording.
 *
 * Every failure here is a business assertion tagged H1/H2/H3/H4 or §5.x. Faults are scoped to the Clock key a case
 * names (seed rule 10); seeds are in-domain except in the source-truth cases, which use exactly the section 5 item 2
 * values. Conflicts are created only by an unobserved external change after mount (consistency matrix row 4).
 */
import { afterEach, beforeEach, expect, it } from "vitest";
import {
  action, assertSelfCheck, block, blockState, bytes, choose, clockWrites, DEFAULTS, exportButton, expectQuiet, external, FAILED,
  failChoice, fault, fieldWrites, fired, flush, hold, KEY, LOCK, lockState, locks, mark, MALFORMED, mountClock, nativeSet, NONE,
  nonNavigationBus, pre, productStorageEvents, quota, region, rejections, seed, seedMalformed, setup, shown, SOURCE, successClaim,
  teardown, touches, W, warns, writes, type Field, type Lang, click, need, clockRoot,
} from "./fixture";

beforeEach(() => { setup(); });
afterEach(() => { teardown(); });

it("FIXTURE F-B002 this file's storage wrappers record and delegate exactly once, never re-enter Storage and never call accountScope helpers", () => {
  assertSelfCheck();
});

const sibling = (field: Field): Field => (field === "style" ? "timezone" : "style");
const H = (field: Field): string => (field === "style" ? "H1" : "H2");

type Kind = "quota" | "setItem throws" | "write-time getItem throws" | "missing Web Lock" | "rejected Web Lock";
const KINDS: readonly Kind[] = ["quota", "setItem throws", "write-time getItem throws", "missing Web Lock", "rejected Web Lock"];

/** Arms one failure kind after mount; returns how to remove it before Retry. */
function armFailure(field: Field, kind: Kind): { off(): void; observe(): void } {
  if (kind === "quota" || kind === "setItem throws") {
    const injected = quota(field, { generic: kind === "setItem throws" });
    return { off: () => injected.off(), observe: () => fired(injected, `${kind} on ${KEY[field]}`) };
  }
  if (kind === "write-time getItem throws") {
    const injected = fault({ op: "get", key: KEY[field], label: `${KEY[field]} write-time read throws` });
    return { off: () => injected.off(), observe: () => fired(injected, `${kind} on ${KEY[field]}`) };
  }
  if (kind === "missing Web Lock") {
    lockState.missing = true;
    return { off: () => { lockState.missing = false; }, observe: () => pre((navigator as unknown as { locks?: unknown }).locks === undefined, "navigator.locks is missing") };
  }
  locks().deny(LOCK[field]);
  return { off: () => locks().allow(LOCK[field]), observe: () => pre(true, "the per-key lock is denied") };
}

async function failureAndRetry(field: Field, baseline: string, latest: string, kind: Kind, lang: Lang = "en"): Promise<void> {
  seed(field, baseline);
  await mountClock({ lang });
  const failure = armFailure(field, kind);
  const from = mark();
  choose(field, latest);
  await flush();
  failure.observe();
  expect(bytes(field), `§5.5/§16 a ${kind} failure leaves the stored bytes unchanged (never written unfenced)`).toBe(baseline);
  expect(shown(field), `${H(field)} §5.5 the latest choice stays displayed after a ${kind} failure`).toBe(latest);
  expect(blockState(field, lang), `${H(field)} §5.7 a settled failure shows "${W[lang].notSaved(W[lang].label[field])}" with Retry and Discard`).toStrictEqual(FAILED);
  expect(blockState(sibling(field), lang), "the sibling has no block").toStrictEqual(NONE);
  const exportControl = need(exportButton(lang), `${H(field)} §8 the inline Export renders for a settled unsuccessful draft`);
  const recovery = need(region(), `${H(field)} §5 the recovery region [data-testid="clock-recovery"] renders`);
  const sub = clockRoot().querySelector(".clock-sub");
  pre(sub, "the .clock-sub line is present");
  expect({
    afterSub: Boolean(sub.compareDocumentPosition(recovery) & Node.DOCUMENT_POSITION_FOLLOWING),
    noDrag: recovery.hasAttribute("data-no-drag"),
    blockInside: recovery.contains(block(field)),
    exportInside: recovery.contains(exportControl),
  }, "§5 stable selectors: the region follows .clock-sub, carries data-no-drag and holds the block and Export").toStrictEqual({ afterSub: true, noDrag: true, blockInside: true, exportInside: true });
  expect(successClaim(), "§5.7 no success claim").toBe(false);
  expect(warns(), "§7.4 the unload warning is active for an actual draft").toBe(true);
  expect(productStorageEvents(from), "§10.7 zero StorageEvents").toEqual([]);
  expect(nonNavigationBus(from), "§10.7 zero bus events").toEqual([]);
  failure.off();
  const retried = mark();
  click(need(action(field, "retry", lang), `${H(field)} Retry ${W[lang].label[field]}`));
  await flush();
  expect(fieldWrites(retried, field), "§5.5 a successful Retry makes exactly one write with the exact bytes").toEqual([latest]);
  expect(bytes(field)).toBe(latest);
  expect(shown(field)).toBe(latest);
  expect(blockState(field, lang), "the block unmounts after the success").toStrictEqual(NONE);
  expect(region(), "§5.7 the absence of a region is the only success state").toBeNull();
  expect(successClaim(), "§5.7 no success claim after Retry").toBe(false);
  expect(warns(), "§7.4 no unload warning once the draft clears").toBe(false);
  expectQuiet(`${field} ${kind}`);
}

for (const kind of KINDS) {
  it(`H1 §5.5 style: a ${kind} failure keeps "analog" displayed with Retry and Discard; Retry writes it once`, async () => {
    await failureAndRetry("style", "classic", "analog", kind);
  });
}
for (const kind of KINDS) {
  it(`H2 §5.5 timezone city: a ${kind} failure keeps "tokyo" displayed with Retry and Discard; Retry writes it once`, async () => {
    await failureAndRetry("timezone", "local", "tokyo", kind);
  });
}
it("H2 §5.5 timezone Local time: a quota failure over a city baseline keeps Local time displayed; Retry writes \"local\" once", async () => {
  await failureAndRetry("timezone", "sydney", "local", "quota");
});
it("H1 §5 ZH: a quota failure shows the ZH block (时钟样式未保存。, 重试/放弃 时钟样式) and the ZH Export", async () => {
  await failureAndRetry("style", "split", "minimal", "quota", "zh");
});
it("H2 §5 ZH: a quota failure shows the ZH block (时钟时区未保存。, 重试/放弃 时钟时区)", async () => {
  await failureAndRetry("timezone", "local", "hk", "quota", "zh");
});

// ---------------------------------------------------------------------------
// Source truth (contract section 5 item 2): malformed bytes and a key-scoped throwing read
// ---------------------------------------------------------------------------

const REPAIR: Readonly<Record<Field, string>> = { style: "analog", timezone: "tokyo" };

async function sourceOnly(field: Field, lang: Lang, prepare: () => (() => void) | void, repair: () => Promise<void>, repaired: string, tag: string): Promise<void> {
  const disarm = prepare();
  const from = mark();
  await mountClock({ lang });
  expect(shown(field), `§5.2 ${tag}: the default displays`).toBe(DEFAULTS[field]);
  expect(shown(sibling(field)), "the sibling displays its default").toBe(DEFAULTS[sibling(field)]);
  expect(blockState(field, lang), `H4 §5.2 ${tag}: the field shows the source message with Reload only`).toStrictEqual(SOURCE);
  expect(blockState(sibling(field), lang)).toStrictEqual(NONE);
  expect(exportButton(lang), "§8 a source-only issue never renders the inline Export").toBeNull();
  expect(warns(), "§5.2 no unload warning for a source-only issue").toBe(false);
  expect(writes(from), "§5.2 mount never rewrites, purges or normalizes the bytes").toEqual([]);
  expect(successClaim(), "no success claim").toBe(false);
  if (disarm) disarm();
  await repair();
  const reload = action(field, "reload", lang);
  if (reload) click(reload);
  await flush();
  expect(shown(field), `§9 row j ${tag}: after the repair, Reload shows the repaired value`).toBe(repaired);
  expect(blockState(field, lang)).toStrictEqual(NONE);
  expect(region()).toBeNull();
  expect(writes(from), "zero writes across mount, repair and Reload").toEqual([]);
  expectQuiet(tag);
}

for (const field of ["style", "timezone"] as const) {
  for (const value of MALFORMED[field]) {
    it(`H4 §5.2 ${KEY[field]}=${JSON.stringify(value)} displays the default with the source message and Reload only, no hold, no write; Reload after a repair shows it`, async () => {
      await sourceOnly(field, "en", () => { seedMalformed(field, value); }, () => external(KEY[field], REPAIR[field]), REPAIR[field], `malformed ${JSON.stringify(value)}`);
    });
  }
  it(`H4 §5.2 a getItem that throws for ${KEY[field]} only makes that field unavailable with Reload only; Reload after the fault clears shows the stored value`, async () => {
    await sourceOnly(field, "en", () => {
      seed(field, REPAIR[field]);
      const failing = fault({ op: "get", key: KEY[field], label: `${KEY[field]} read throws` });
      return () => failing.off();
    }, async () => undefined, REPAIR[field], "key-scoped throwing read");
  });
}
it("H4 §5 ZH: a malformed style shows 已保存的时钟样式不可用… with 重新读取 时钟样式 only", async () => {
  await sourceOnly("style", "zh", () => { seedMalformed("style", "bogus"); }, () => external(KEY.style, "split"), "split", "zh malformed style");
});
it("H4 §5 ZH: a malformed timezone shows 已保存的时钟时区不可用… with 重新读取 时钟时区 only", async () => {
  await sourceOnly("timezone", "zh", () => { seedMalformed("timezone", "UTC+8"); }, () => external(KEY.timezone, "paris"), "paris", "zh malformed timezone");
});

for (const field of ["style", "timezone"] as const) {
  const choice = field === "style" ? "minimal" : "berlin";
  it(`§5.2/A5 ${field}: a valid choice over malformed bytes is a failed draft that never overwrites them; Discard returns to source-only`, async () => {
    const malformed = MALFORMED[field][0]!;
    seedMalformed(field, malformed);
    await mountClock();
    const from = mark();
    choose(field, choice);
    await flush();
    expect(bytes(field), "A5 §5.2 the malformed bytes are never silently overwritten").toBe(malformed);
    expect(shown(field), "the valid choice stays displayed").toBe(choice);
    expect(blockState(field), "§5.7 a failed draft over an unavailable source shows the failed-draft block").toStrictEqual(FAILED);
    need(exportButton(), "§8 the inline Export renders for the failed draft");
    expect(warns(), "the unload warning protects the draft").toBe(true);
    const discarded = mark();
    click(need(action(field, "discard"), `§5.8 Discard ${W.en.label[field]}`));
    await flush();
    expect(clockWrites(discarded), "§5.8 Discard makes zero set/remove attempts").toEqual([]);
    expect(blockState(field), "§5.7 Discard returns the field to source-only").toStrictEqual(SOURCE);
    expect(shown(field), "the default displays again").toBe(DEFAULTS[field]);
    expect(bytes(field), "the malformed bytes are kept").toBe(malformed);
    expect(writes(from), "zero writes overall").toEqual([]);
    expect(warns()).toBe(false);
    expectQuiet(`${field} choice over malformed`);
  });
}

// ---------------------------------------------------------------------------
// Targeted Discard, independent settlement
// ---------------------------------------------------------------------------

for (const field of ["style", "timezone"] as const) {
  it(`§5.8 targeted Discard of ${field}: zero set/remove attempts, zero reads of the sibling key, display returns to the committed value`, async () => {
    seed("style", "split");
    seed("timezone", "london");
    await mountClock();
    const baseline = field === "style" ? "split" : "london";
    const injected = await failChoice(field, field === "style" ? "analog" : "dubai");
    injected.off();
    const discarded = mark();
    click(need(action(field, "discard"), `§5.8 Discard ${W.en.label[field]}`));
    await flush();
    expect(clockWrites(discarded), "§5.8 zero set/remove attempts on both Clock keys").toEqual([]);
    expect(touches(discarded, KEY[sibling(field)]), "§5.8 zero reads of the sibling key").toEqual([]);
    expect(shown(field), "§10.3 the display returns to the committed bytes").toBe(baseline);
    expect(bytes(field)).toBe(baseline);
    expect(blockState(field)).toStrictEqual(NONE);
    expect(region()).toBeNull();
    expect(warns()).toBe(false);
    expectQuiet(`discard ${field}`);
  });
}

it("§5.7 both fields unresolved at once: two failed-draft blocks, one inline Export, the unload warning", async () => {
  seed("style", "classic");
  seed("timezone", "local");
  await mountClock();
  await failChoice("style", "analog");
  await failChoice("timezone", "sf");
  expect({ style: shown("style"), timezone: shown("timezone") }, "H1 H2 §5.5 both failed choices stay displayed").toStrictEqual({ style: "analog", timezone: "sf" });
  expect({ style: blockState("style"), timezone: blockState("timezone") }, "§5.7 both fields show their own failed-draft block").toStrictEqual({ style: FAILED, timezone: FAILED });
  need(exportButton(), "§8 one inline Export");
  expect(document.querySelectorAll('[data-testid="clock-export-draft"]').length, "exactly one Export").toBe(1);
  const styleBlock = block("style");
  const timezoneBlock = block("timezone");
  pre(styleBlock && timezoneBlock, "both blocks present");
  expect(Boolean(styleBlock.compareDocumentPosition(timezoneBlock) & Node.DOCUMENT_POSITION_FOLLOWING), "the style block precedes the timezone block (field order)").toBe(true);
  expect(warns()).toBe(true);
  expect({ style: bytes("style"), timezone: bytes("timezone") }).toStrictEqual({ style: "classic", timezone: "local" });
  expectQuiet("both unresolved");
});

it("§5.7 one field failing while the other succeeds: the success never retries, rewrites, discards or rereads the sibling", async () => {
  seed("style", "classic");
  seed("timezone", "local");
  await mountClock();
  await failChoice("style", "analog");
  const from = mark();
  choose("timezone", "paris");
  await flush();
  expect(bytes("timezone"), "the timezone choice succeeds").toBe("paris");
  expect(touches(from, KEY.style), "§5.7 the sibling's key is not touched by the success").toEqual([]);
  expect(shown("style"), "H1 the failed style choice stays displayed").toBe("analog");
  expect({ style: blockState("style"), timezone: blockState("timezone") }, "§5.7 only the failed field shows a block").toStrictEqual({ style: FAILED, timezone: NONE });
  expectQuiet("independent settlement");
});

it("§5.7 a conflict on style coexists with an unrelated timezone quota failure; each settles independently and Retry never overwrites the conflict", async () => {
  seed("style", "classic");
  seed("timezone", "local");
  await mountClock();
  const lock = await hold(LOCK.style);
  choose("style", "analog");
  await flush();
  expect(bytes("style"), "H3 the held per-key lock serializes the style write").toBe("classic");
  nativeSet.call(localStorage, KEY.style, "minimal");
  pre(bytes("style") === "minimal", "an unobserved external replacement after mount (matrix row 4)");
  const timezoneQuota = quota("timezone");
  choose("timezone", "tokyo");
  await flush();
  fired(timezoneQuota, "timezone write");
  await lock.release();
  expect(bytes("style"), "§5.6 the external style bytes are preserved").toBe("minimal");
  expect({ style: blockState("style"), timezone: blockState("timezone") }, "§5.7 both fields unresolved").toStrictEqual({ style: FAILED, timezone: FAILED });
  timezoneQuota.off();
  click(need(action("timezone", "retry"), "§5.5 Retry Clock timezone"));
  await flush();
  expect(bytes("timezone"), "the timezone Retry succeeds independently").toBe("tokyo");
  expect(bytes("style"), "the style conflict is untouched").toBe("minimal");
  expect(blockState("style"), "the style conflict stays recoverable").toStrictEqual(FAILED);
  expect(blockState("timezone")).toStrictEqual(NONE);
  const retried = mark();
  click(need(action("style", "retry"), "§5.6 Retry Clock style"));
  await flush();
  expect(fieldWrites(retried, "style"), "§5.6 Retry never gains authority to overwrite the conflict").toEqual([]);
  expect(bytes("style")).toBe("minimal");
  expectQuiet("conflict plus quota");
});

it("§5.8/§7.9 a late completion after unmount is ignored: the held write never lands, no error and no unhandled rejection", async () => {
  seed("style", "classic");
  const view = await mountClock();
  const lock = await hold(LOCK.style);
  choose("style", "analog");
  await flush();
  expect(bytes("style"), "H3 the held per-key lock keeps the bytes unchanged").toBe("classic");
  view.unmount();
  const from = mark();
  await lock.release();
  expect(fieldWrites(from, "style"), "§7.9 held work of an unmounted widget is refused (matrix row 5: held work)").toEqual([]);
  expect(bytes("style")).toBe("classic");
  expect(warns(), "§7.9 the unload listener is removed on unmount").toBe(false);
  expect(rejections.map(String)).toEqual([]);
  expectQuiet("late after unmount");
});
