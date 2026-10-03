/**
 * Gate "All5 ordinary fields" (contract section 13): H1, H2, H3, H4, H7 (pane layer) and H8.
 *
 * Every business assertion states the fixed-product requirement from the contract. It is expected to
 * FAIL at 2023526 wherever the tagged hypothesis holds, and must PASS unchanged on the fixed product.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, fireEvent } from "@testing-library/react";
import {
  blocking, button, byField, bytes, bytesAll, cases, chooseAlt, choose, color, discardAllButton, discardOf, download, envelope, expectSingleDownload,
  exportButton, fault, fired, flush, font, fontSelect, guard, hold, keyLock, lockState, locks, malformFont, mark, mount, msg, nativeSet, need, others,
  pin, pre, raw, rejections, reloadOf, restore, retryOf, says, seed, setup, shown, shownAll, spacing, stickyWrites, switchOf, teardown, toggle,
  touches, unload, W, warns, writesOn, type FieldCase, type FieldId,
} from "./fixture";

beforeEach(() => { setup(); });
afterEach(() => { teardown(); });

const sourceTag = (entry: FieldCase) => (entry.kind === "switch" ? "H2" : "H3");

describe.each(cases)("$field", entry => {
  it(`H1 ${entry.field}: a failed write keeps the latest choice with failed feedback, Retry, Discard, guard and warning; Retry saves exact bytes`, async () => {
    seed(entry, raw(entry.seed));
    const ui = mount();
    await flush();
    const quota = fault({ op: "set", key: entry.key, label: `${entry.field} quota` });
    chooseAlt(ui, entry);
    await flush();
    fired(quota, `${entry.field} write`);
    expect(shown(ui, entry), `H1: ${entry.field} keeps displaying the latest choice after its write failed`).toBe(entry.alt);
    expect(bytes(entry), "the previous bytes remain after the failed write").toBe(raw(entry.seed));
    expect(says(msg.notSaved(entry)), `H8: "${msg.notSaved(entry)}" failed feedback`).toBe(true);
    const retry = need(retryOf(ui, entry), `H8: Retry ${entry.label}`);
    need(discardOf(ui, entry), `H8: Discard ${entry.label}`);
    expect(blocking(), "H7: the departure guard blocks while the failed choice is unsaved").toBe(true);
    expect(warns(), "H7: beforeunload warns while the failed choice is unsaved").toBe(true);
    expect(says(W.en.saved), "no false Saved while work is unresolved").toBe(false);
    quota.off();
    const from = mark();
    fireEvent.click(retry);
    await flush();
    expect(writesOn(from, entry), "Retry writes exactly the latest bytes once").toEqual([raw(entry.alt)]);
    expect(bytes(entry)).toBe(raw(entry.alt));
    expect(shown(ui, entry)).toBe(entry.alt);
    expect(retryOf(ui, entry), "the matching latest success clears the field's recovery").toBeNull();
    expect(says(msg.notSaved(entry)), "the failed feedback clears after the latest success").toBe(false);
    expect(blocking(), "no departure block after the latest success").toBe(false);
    expect(warns(), "no beforeunload warning after the latest success").toBe(false);
    expect(says(W.en.saved), "a genuine latest success with no outstanding issue shows Saved").toBe(true);
    expect(rejections, "no unhandled rejection").toEqual([]);
  });

  it(`H2 ${entry.field}: a throwing read shows the default with a Reload-only source alert; Reload repairs with zero writes and no Saved`, async () => {
    seed(entry, raw(entry.seed));
    const denied = fault({ op: "get", key: entry.key, label: `${entry.field} read denied` });
    const from = mark();
    const ui = mount();
    await flush();
    fired(denied, `${entry.field} mount read`);
    expect(shown(ui, entry), "an unavailable source displays the registry default").toBe(entry.default);
    expect(says(msg.unavailable(entry)), `H2: "${msg.unavailable(entry)}" source alert`).toBe(true);
    const reload = need(reloadOf(ui, entry), `H2: Reload ${entry.label}`);
    expect(retryOf(ui, entry), "source-only: no Retry").toBeNull();
    expect(discardOf(ui, entry), "source-only: no Discard").toBeNull();
    expect(exportButton(ui), "source-only: no export").toBeNull();
    expect(blocking(), "source-only: no departure guard block").toBe(false);
    expect(warns(), "source-only: no beforeunload warning").toBe(false);
    expect(says(W.en.saved), "no Saved claim").toBe(false);
    expect(stickyWrites(from), "mount never rewrites or purges the source").toEqual([]);
    denied.off();
    const repair = mark();
    fireEvent.click(reload);
    await flush();
    expect(stickyWrites(repair), "Reload makes zero set/remove attempts").toEqual([]);
    expect(touches(repair, others(entry)), "Reload rereads only its own field").toEqual([]);
    expect(shown(ui, entry), "Reload shows the stored value").toBe(entry.seed);
    expect(says(msg.unavailable(entry)), "Reload clears the source alert").toBe(false);
    expect(says(W.en.saved), "a source-only repair never claims a save by itself").toBe(false);
    expect(bytes(entry)).toBe(raw(entry.seed));
  });
});

const invalidSources: ReadonlyArray<readonly [FieldId, string]> = [
  ["color", "purple"], ["color", "Sun"], ["color", " sun"], ["color", ""],
  ["font", "huge"], ["font", "tiny"], ["font", ""],
  ["grid_spacing", "huge"], ["grid_spacing", "tiny"], ["grid_spacing", ""],
  ["pin_default", "TRUE"], ["pin_default", "1"], ["pin_default", ""],
  ["restore_size", "yes"], ["restore_size", "0"], ["restore_size", " false"],
];

it.each(invalidSources)("H2/H3 %s=%j: out-of-domain bytes display the default with a Reload-only alert; mount and Reload never normalize them", async (field, stored) => {
  const entry = byField(field);
  seed(entry, stored);
  const from = mark();
  const ui = mount();
  await flush();
  const tag = sourceTag(entry);
  expect(shown(ui, entry), `${tag}: an invalid source displays the registry default, never the stored bytes`).toBe(entry.default);
  expect(says(msg.unavailable(entry)), `${tag}: "${msg.unavailable(entry)}" source alert`).toBe(true);
  const reload = need(reloadOf(ui, entry), `${tag}: Reload ${entry.label}`);
  expect(retryOf(ui, entry), "source-only: no Retry").toBeNull();
  expect(discardOf(ui, entry), "source-only: no Discard").toBeNull();
  expect(exportButton(ui), "source-only: no export").toBeNull();
  expect(blocking(), "source-only: no departure guard block").toBe(false);
  expect(warns(), "source-only: no beforeunload warning").toBe(false);
  expect(says(W.en.saved), "no Saved claim").toBe(false);
  fireEvent.click(reload);
  await flush();
  expect(says(msg.unavailable(entry)), "Reload of still-invalid bytes keeps the alert").toBe(true);
  expect(stickyWrites(from), "mount and Reload never rewrite, purge or normalize").toEqual([]);
  expect(bytes(entry)).toBe(stored);
});

it.each(["injected", "empty", "unmatched"] as const)("H4 font %s option value: the prior value stays with an independent input error; zero writes; sibling work untouched", async variant => {
  seed(font, "normal");
  seed(pin, "TRUE");
  seed(color, "sky");
  const ui = mount();
  await flush();
  const quota = fault({ op: "set", key: color.key, label: "color quota" });
  choose(ui, color, "mint");
  await flush();
  fired(quota, "color write");
  const from = mark();
  malformFont(ui, variant);
  await flush();
  expect(bytes(font), `H4: a malformed font value (${variant}) is never persisted`).toBe("normal");
  expect(stickyWrites(from), "malformed DOM input makes zero set/remove attempts").toEqual([]);
  expect(fontSelect(ui).value, "the prior valid font stays displayed").toBe("normal");
  expect(says(msg.invalid(font)), `"${msg.invalid(font)}" input error`).toBe(true);
  expect(says(msg.notSaved(color)), "the color draft is not cleared").toBe(true);
  need(retryOf(ui, color), "the color draft keeps its Retry");
  expect(says(msg.unavailable(pin)), "the pin source alert is not cleared").toBe(true);
  expect(says(W.en.saved), "no Saved while an input error exists").toBe(false);
  choose(ui, font, "xl");
  await flush();
  expect(says(msg.invalid(font)), "a valid choice clears the font input error").toBe(false);
  expect(bytes(font)).toBe("xl");
  need(retryOf(ui, color), "the valid font choice leaves the color draft");
  expect(says(msg.unavailable(pin)), "the valid font choice leaves the pin source alert").toBe(true);
});

it("H3 §5.2 a valid choice over invalid color bytes is a failed draft that never overwrites them; Discard is zero-write and returns to Reload-only", async () => {
  seed(color, "purple");
  const ui = mount();
  await flush();
  choose(ui, color, "mint");
  await flush();
  expect(shown(ui, color), "the valid choice is displayed as the latest draft").toBe("mint");
  expect(bytes(color), "H3/§5.2: a valid edit never silently overwrites an invalid source").toBe("purple");
  expect(says(msg.notSaved(color)), "failed feedback").toBe(true);
  const retry = need(retryOf(ui, color), "H8: Retry Default Color");
  need(discardOf(ui, color), "H8: Discard Default Color");
  expect(blocking(), "the draft is guarded").toBe(true);
  expect(warns(), "the draft warns on beforeunload").toBe(true);
  const harness = download();
  fireEvent.click(need(exportButton(ui), "H8: Export Sticky Note draft"));
  await flush(2);
  await expectSingleDownload(harness, envelope({ color: "mint" }), "draft over an invalid source");
  const retried = mark();
  fireEvent.click(retry);
  await flush();
  expect(writesOn(retried, color), "Retry never gains authority over the invalid source").toEqual([]);
  expect(bytes(color)).toBe("purple");
  const from = mark();
  fireEvent.click(need(discardOf(ui, color), "Discard Default Color after Retry"));
  await flush();
  expect(stickyWrites(from), "Discard makes zero set/remove attempts").toEqual([]);
  expect(bytes(color)).toBe("purple");
  expect(shown(ui, color), "after Discard the invalid source displays the default").toBe("sun");
  need(reloadOf(ui, color), "the source-only Reload returns");
  expect(retryOf(ui, color)).toBeNull();
  expect(blocking()).toBe(false);
  expect(warns()).toBe(false);
});

it("H2 §5.2 a valid toggle over an unavailable pin source is a failed draft; bytes untouched; Discard returns to Reload-only", async () => {
  seed(pin, "true");
  const denied = fault({ op: "get", key: pin.key, label: "pin read denied" });
  const ui = mount();
  await flush();
  fired(denied, "pin mount read");
  const from = mark();
  toggle(ui, pin);
  await flush();
  expect(shown(ui, pin), "H1/H2: the toggle keeps displaying the latest intent").toBe(false);
  expect(bytes(pin), "the unreadable source is never overwritten").toBe("true");
  expect(says(msg.notSaved(pin)), "failed feedback").toBe(true);
  need(retryOf(ui, pin), "H8: Retry Pin by Default");
  const discard = need(discardOf(ui, pin), "H8: Discard Pin by Default");
  expect(blocking()).toBe(true);
  expect(warns()).toBe(true);
  fireEvent.click(discard);
  await flush();
  expect(stickyWrites(from), "neither the edit nor Discard writes the unreadable source").toEqual([]);
  expect(shown(ui, pin), "the unreadable source displays the default").toBe(true);
  need(reloadOf(ui, pin), "the source-only Reload returns while reads are still denied");
  expect(blocking()).toBe(false);
  expect(warns()).toBe(false);
});

it("§5.8 Reload refuses at invocation time to erase the same field's actual draft", async () => {
  seed(restore, "yes");
  const ui = mount();
  await flush();
  const reload = need(reloadOf(ui, restore), "H2: Reload Restore Default Size");
  const control = switchOf(ui, restore);
  act(() => { control.click(); reload.click(); });
  await flush();
  expect(shown(ui, restore), "the actual draft survives a same-turn Reload").toBe(true);
  expect(bytes(restore), "the invalid source is untouched").toBe("yes");
  need(retryOf(ui, restore), "the draft keeps Retry Restore Default Size");
  expect(blocking(), "the draft stays guarded").toBe(true);
  const later = reloadOf(ui, restore);
  if (later) {
    fireEvent.click(later);
    await flush();
    expect(shown(ui, restore), "a later Reload also refuses to erase the draft").toBe(true);
    need(retryOf(ui, restore), "the draft keeps Retry after a later Reload");
  }
  const harness = download();
  act(() => { guard()?.exportDraft(); });
  await flush(2);
  await expectSingleDownload(harness, envelope({ restore_size: true }), "draft after a refused Reload");
});

it("§5.7 all five unresolved at once; a targeted Retry never touches siblings; Discard all is zero-write and visits only drafts", async () => {
  const ui = mount();
  await flush();
  const quotas = cases.map(entry => fault({ op: "set", key: entry.key, label: `${entry.field} quota` }));
  choose(ui, color, "mint");
  choose(ui, font, "xl");
  toggle(ui, pin);
  toggle(ui, restore);
  choose(ui, spacing, "xl");
  await flush();
  cases.forEach((entry, index) => fired(quotas[index]!, `${entry.field} write`));
  expect(shownAll(ui), "H1: all five latest choices stay displayed").toStrictEqual({ color: "mint", font: "xl", pin_default: false, restore_size: true, grid_spacing: "xl" });
  for (const entry of cases) {
    expect(says(msg.notSaved(entry)), `${entry.field} failed feedback`).toBe(true);
    need(retryOf(ui, entry), `H8: Retry ${entry.label}`);
    need(discardOf(ui, entry), `H8: Discard ${entry.label}`);
  }
  need(exportButton(ui), "H8: Export Sticky Note draft");
  need(discardAllButton(ui), "H8: Discard all changes");
  expect(blocking()).toBe(true);
  expect(warns()).toBe(true);
  expect(says(W.en.saved)).toBe(false);
  quotas[1]!.off();
  const retried = mark();
  fireEvent.click(need(retryOf(ui, font), "Retry Font Size"));
  await flush();
  expect(bytes(font), "the targeted Retry saves its field").toBe("xl");
  expect(retryOf(ui, font), "the retried field is resolved").toBeNull();
  expect(touches(retried, others(font)), "a successful field never retries, rewrites or rereads a sibling").toEqual([]);
  for (const entry of others(font)) need(retryOf(ui, entry), `${entry.field} stays unresolved`);
  expect(says(W.en.saved), "no general Saved while siblings are unresolved").toBe(false);
  expect(blocking()).toBe(true);
  const discarded = mark();
  fireEvent.click(need(discardAllButton(ui), "Discard all changes after a partial Retry"));
  await flush();
  expect(stickyWrites(discarded), "Discard all makes zero set/remove attempts").toEqual([]);
  expect(touches(discarded, [font]), "Discard all visits only actual current drafts").toEqual([]);
  expect(shownAll(ui), "Discard all returns each draft to its stored value").toStrictEqual({ color: "sun", font: "xl", pin_default: true, restore_size: false, grid_spacing: "normal" });
  for (const entry of cases) expect(retryOf(ui, entry), `${entry.field} recovery cleared`).toBeNull();
  expect(blocking()).toBe(false);
  expect(warns()).toBe(false);
  expect(bytesAll(), "only the retried field was ever written").toStrictEqual({ color: null, font: "xl", pin_default: null, restore_size: null, grid_spacing: null });
});

it("§5.7 a color conflict coexists with an unrelated font quota failure; each settles independently and Retry never overwrites the conflict", async () => {
  seed(color, "sky");
  seed(font, "small");
  const ui = mount();
  await flush();
  const lock = await hold(keyLock(color));
  choose(ui, color, "mint");
  await flush();
  expect(bytes(color), "H6: the held per-key lock serializes the color write").toBe("sky");
  nativeSet.call(localStorage, color.key, "graphite");
  const quota = fault({ op: "set", key: font.key, label: "font quota" });
  choose(ui, font, "xl");
  await flush();
  fired(quota, "font write");
  await lock.release();
  expect(bytes(color), "the external replacement is preserved").toBe("graphite");
  expect(shown(ui, color), "the latest color choice stays displayed").toBe("mint");
  need(retryOf(ui, color), "the conflict keeps Retry Default Color");
  need(discardOf(ui, color), "the conflict keeps Discard Default Color");
  expect(says(msg.notSaved(font)), "font failed feedback").toBe(true);
  const fontRetry = need(retryOf(ui, font), "Retry Font Size");
  expect(blocking()).toBe(true);
  expect(says(W.en.saved)).toBe(false);
  quota.off();
  const retried = mark();
  fireEvent.click(fontRetry);
  await flush();
  expect(bytes(font)).toBe("xl");
  expect(retryOf(ui, font)).toBeNull();
  expect(touches(retried, [color]), "the font Retry never touches the conflicting color").toEqual([]);
  need(retryOf(ui, color), "the color conflict remains");
  expect(bytes(color)).toBe("graphite");
  expect(says(W.en.saved), "no general Saved while the conflict remains").toBe(false);
  const again = mark();
  fireEvent.click(need(retryOf(ui, color), "Retry Default Color on the conflict"));
  await flush();
  expect(writesOn(again, color), "a repeated Retry never gains authority to overwrite").toEqual([]);
  expect(bytes(color)).toBe("graphite");
  need(retryOf(ui, color), "the conflict stays preserved after Retry");
  expect(blocking()).toBe(true);
});

it("§5.7 a failed string field and a successful boolean settle independently", async () => {
  seed(color, "sky");
  seed(pin, "false");
  const ui = mount();
  await flush();
  const quota = fault({ op: "set", key: color.key, label: "color quota" });
  choose(ui, color, "mint");
  toggle(ui, pin);
  await flush();
  fired(quota, "color write");
  expect(shown(ui, color), "H1: the failed color keeps the latest choice").toBe("mint");
  expect(bytes(pin), "the boolean saves independently").toBe("true");
  expect(shown(ui, pin)).toBe(true);
  expect(retryOf(ui, pin), "the successful boolean has no recovery").toBeNull();
  expect(says(msg.notSaved(pin))).toBe(false);
  const retry = need(retryOf(ui, color), "H8: Retry Default Color");
  expect(says(W.en.saved), "no general Saved while the color draft exists").toBe(false);
  expect(blocking()).toBe(true);
  quota.off();
  fireEvent.click(retry);
  await flush();
  expect(bytes(color)).toBe("mint");
  expect(blocking()).toBe(false);
  expect(says(W.en.saved)).toBe(true);
});

it("§5.7 a failed boolean field and a successful string settle independently", async () => {
  seed(pin, "false");
  seed(spacing, "large");
  const ui = mount();
  await flush();
  const quota = fault({ op: "set", key: pin.key, label: "pin quota" });
  toggle(ui, pin);
  choose(ui, spacing, "xl");
  await flush();
  fired(quota, "pin write");
  expect(shown(ui, pin), "H1: the failed boolean keeps the latest intent").toBe(true);
  expect(bytes(spacing), "the string saves independently").toBe("xl");
  expect(shown(ui, spacing)).toBe("xl");
  expect(retryOf(ui, spacing), "the successful string has no recovery").toBeNull();
  const retry = need(retryOf(ui, pin), "H8: Retry Pin by Default");
  expect(says(W.en.saved), "no general Saved while the pin draft exists").toBe(false);
  expect(blocking()).toBe(true);
  quota.off();
  fireEvent.click(retry);
  await flush();
  expect(bytes(pin)).toBe("true");
  expect(blocking()).toBe(false);
  expect(says(W.en.saved)).toBe(true);
});

it("§5.8 a targeted Discard is zero-write, rereads only its field and leaves sibling work exportable", async () => {
  seed(color, "sky");
  seed(restore, "true");
  const ui = mount();
  await flush();
  const colorQuota = fault({ op: "set", key: color.key, label: "color quota" });
  const restoreQuota = fault({ op: "set", key: restore.key, label: "restore quota" });
  choose(ui, color, "mint");
  toggle(ui, restore);
  await flush();
  fired(colorQuota, "color write");
  fired(restoreQuota, "restore write");
  expect(shown(ui, color), "H1: the failed color keeps the latest choice").toBe("mint");
  expect(shown(ui, restore), "H1: the failed restore keeps the latest intent").toBe(false);
  const discard = need(discardOf(ui, color), "H8: Discard Default Color");
  const from = mark();
  fireEvent.click(discard);
  await flush();
  expect(stickyWrites(from), "Discard makes zero set/remove attempts").toEqual([]);
  expect(touches(from, others(color)), "Discard never reads or writes a sibling").toEqual([]);
  expect(shown(ui, color), "Discard rereads the stored color").toBe("sky");
  expect(retryOf(ui, color)).toBeNull();
  expect(says(msg.notSaved(color))).toBe(false);
  need(retryOf(ui, restore), "the sibling draft keeps its Retry");
  expect(blocking()).toBe(true);
  const harness = download();
  fireEvent.click(need(exportButton(ui), "Export Sticky Note draft"));
  await flush(2);
  await expectSingleDownload(harness, envelope({ restore_size: false }), "sparse export after a targeted discard");
});

it("H8 §5.7 Saved appears only after a genuine latest success with no pending work or input error", async () => {
  seed(color, "sky");
  const ui = mount();
  await flush();
  expect(says(W.en.saved), "a clean mount makes no Saved claim").toBe(false);
  choose(ui, color, "mint");
  await flush();
  expect(bytes(color)).toBe("mint");
  expect(says(W.en.saved), "H8: a genuine latest success shows the Saved status").toBe(true);
  const lock = await hold(keyLock(color));
  choose(ui, color, "coral");
  await flush();
  expect(says(msg.saving(color)), "pending feedback while the operation is held").toBe(true);
  expect(says(W.en.saved), "no Saved while an operation is pending").toBe(false);
  await lock.release();
  expect(bytes(color)).toBe("coral");
  expect(says(W.en.saved), "Saved returns after the latest success").toBe(true);
  malformFont(ui, "injected");
  await flush();
  expect(says(msg.invalid(font)), "input error shown").toBe(true);
  expect(says(W.en.saved), "no Saved while an input error exists").toBe(false);
  choose(ui, font, "xl");
  await flush();
  expect(says(W.en.saved), "Saved after the input error is cleared by a successful choice").toBe(true);
});

it("H2 §5.7 a sibling source error suppresses Saved even after a successful edit", async () => {
  seed(pin, "TRUE");
  const ui = mount();
  await flush();
  choose(ui, color, "mint");
  await flush();
  expect(bytes(color)).toBe("mint");
  expect(says(msg.unavailable(pin)), "H2: the pin source alert").toBe(true);
  expect(says(W.en.saved), "no general Saved while a sibling source error exists").toBe(false);
  expect(retryOf(ui, color), "the successful color has no recovery").toBeNull();
  expect(blocking(), "a source-only sibling never blocks").toBe(false);
});

it("§5.7/§5.8 a sibling source-only Reload repair clears its alert without claiming Saved or acknowledging failed work", async () => {
  seed(pin, "TRUE");
  seed(color, "sky");
  const ui = mount();
  await flush();
  const quota = fault({ op: "set", key: color.key, label: "color quota" });
  choose(ui, color, "mint");
  await flush();
  fired(quota, "color write");
  const reload = need(reloadOf(ui, pin), "H2: Reload Pin by Default");
  nativeSet.call(localStorage, pin.key, "false");
  const from = mark();
  fireEvent.click(reload);
  await flush();
  expect(stickyWrites(from), "Reload makes zero set/remove attempts").toEqual([]);
  expect(touches(from, others(pin)), "Reload rereads only its own field").toEqual([]);
  expect(says(msg.unavailable(pin)), "the repaired source alert clears").toBe(false);
  expect(shown(ui, pin)).toBe(false);
  expect(says(msg.notSaved(color)), "source repair never acknowledges the failed color").toBe(true);
  need(retryOf(ui, color), "the failed color keeps Retry");
  expect(says(W.en.saved)).toBe(false);
  expect(blocking()).toBe(true);
});

it("§5.8 Discard all visits only actual drafts: source-only and input-error siblings are untouched", async () => {
  seed(color, "sky");
  seed(pin, "TRUE");
  const ui = mount();
  await flush();
  const quota = fault({ op: "set", key: color.key, label: "color quota" });
  choose(ui, color, "mint");
  await flush();
  fired(quota, "color write");
  malformFont(ui, "injected");
  await flush();
  const discardAll = need(discardAllButton(ui), "H8: Discard all changes");
  const from = mark();
  fireEvent.click(discardAll);
  await flush();
  expect(stickyWrites(from), "Discard all makes zero set/remove attempts").toEqual([]);
  expect(touches(from, others(color)), "Discard all never visits non-draft fields").toEqual([]);
  expect(shown(ui, color), "the color draft returns to its stored value").toBe("sky");
  expect(retryOf(ui, color)).toBeNull();
  expect(says(msg.unavailable(pin)), "the source-only alert remains").toBe(true);
  need(reloadOf(ui, pin), "the source-only Reload remains");
  expect(bytes(pin)).toBe("TRUE");
  expect(blocking()).toBe(false);
});

it.each(["missing", "rejected"] as const)("H6 §5.5 a %s Web Lock capability keeps the latest color with failed feedback and no write; Retry after restoration saves", async variant => {
  seed(color, "sky");
  const ui = mount();
  await flush();
  const manager = locks();
  const accessesBefore = lockState.accesses;
  const requestsBefore = manager.log.length;
  if (variant === "missing") lockState.missing = true;
  else manager.deny(keyLock(color));
  choose(ui, color, "mint");
  await flush();
  if (variant === "missing") expect(lockState.accesses - accessesBefore, "H6: the write consults the Web Lock capability").toBeGreaterThan(0);
  else expect(manager.rejectedFor(keyLock(color), requestsBefore), "H6: the write requests the per-key Web Lock").toBeGreaterThan(0);
  expect(shown(ui, color), "the latest choice stays displayed").toBe("mint");
  expect(bytes(color), "no write without the per-key lock").toBe("sky");
  expect(says(msg.notSaved(color)), "failed feedback").toBe(true);
  const retry = need(retryOf(ui, color), "H8: Retry Default Color");
  expect(says(W.en.saved)).toBe(false);
  expect(blocking()).toBe(true);
  expect(rejections, "no unhandled rejection").toEqual([]);
  lockState.missing = false;
  manager.allow(keyLock(color));
  fireEvent.click(retry);
  await flush();
  expect(bytes(color)).toBe("mint");
  expect(retryOf(ui, color)).toBeNull();
  expect(blocking()).toBe(false);
  expect(says(W.en.saved)).toBe(true);
});

it("H7 a failed choice registers a blocking Sticky Note guard and a beforeunload warning; source-only and input-error-only states never warn", async () => {
  seed(pin, "TRUE");
  seed(color, "sky");
  const ui = mount();
  await flush();
  expect(blocking(), "a source-only state never blocks").toBe(false);
  expect(unload().warned, "a source-only state never warns").toBe(false);
  malformFont(ui, "injected");
  await flush();
  expect(blocking(), "an input-error-only state never blocks").toBe(false);
  expect(unload().warned, "an input-error-only state never warns").toBe(false);
  const quota = fault({ op: "set", key: color.key, label: "color quota" });
  choose(ui, color, "mint");
  await flush();
  fired(quota, "color write");
  const current = need(guard(), "H7: StickyPaneContent registers the optional departure guard");
  expect(current.label, "the guard label is Sticky Note, never the Smart Lists fallback").toBe("Sticky Note");
  expect(current.isCurrent(), "H7: the registered guard is current").toBe(true);
  expect(current.isBlocking(), "H7: the guard blocks while a failed choice is unsaved").toBe(true);
  const warning = unload();
  expect(warning.warned, "H7: beforeunload warns while a failed choice is unsaved").toBe(true);
  expect(warning.attempts, "the beforeunload handler makes zero storage attempts").toBe(0);
  fireEvent.click(need(discardOf(ui, color), "Discard Default Color"));
  await flush();
  expect(blocking(), "no block after the draft is discarded").toBe(false);
  expect(unload().warned, "no warning after the draft is discarded").toBe(false);
});

it("H8 an uncertain write exposes Retry, Discard, Export and Discard all instead of a silent success", async () => {
  seed(color, "sky");
  const ui = mount();
  await flush();
  const readback = fault({ op: "get", key: color.key, afterSet: { key: color.key, value: "navy" }, times: 1, label: "post-write color read" });
  choose(ui, color, "navy");
  await flush();
  fired(readback, "post-write color read");
  pre(bytes(color) === "navy", "the uncertain write physically reached storage");
  expect(shown(ui, color), "the latest choice stays displayed").toBe("navy");
  const retry = need(retryOf(ui, color), "H8: Retry Default Color");
  need(discardOf(ui, color), "H8: Discard Default Color");
  need(exportButton(ui), "H8: Export Sticky Note draft");
  need(discardAllButton(ui), "H8: Discard all changes");
  expect(says(W.en.saved), "no false Saved for an unverified write").toBe(false);
  fireEvent.click(retry);
  await flush();
  expect(retryOf(ui, color), "Retry verifies the uncertain write").toBeNull();
  expect(bytes(color)).toBe("navy");
});

it("§5 ZH wording: source alert, failed feedback, per-field and pane actions, input error, Saved, pending and guard label", async () => {
  seed(restore, "yes");
  seed(color, "sky");
  const ui = mount("zh");
  await flush();
  expect(says(msg.unavailable(restore, "zh")), "ZH source alert").toBe(true);
  const reload = need(button(ui, "重新读取 恢复默认尺寸"), "ZH Reload action");
  const quota = fault({ op: "set", key: color.key, label: "color quota" });
  choose(ui, color, "mint");
  await flush();
  fired(quota, "color write");
  expect(says("默认颜色未保存。"), "ZH failed feedback").toBe(true);
  const retry = need(button(ui, "重试 默认颜色"), "ZH Retry action");
  need(button(ui, "放弃 默认颜色"), "ZH Discard action");
  need(button(ui, "导出便签草稿"), "ZH Export action");
  need(button(ui, "放弃全部更改"), "ZH Discard all action");
  expect(guard()?.label, "ZH guard label").toBe("便签");
  malformFont(ui, "injected");
  await flush();
  expect(says("字体大小格式无效。"), "ZH input error").toBe(true);
  quota.off();
  fireEvent.click(retry);
  await flush();
  choose(ui, font, "xl");
  await flush();
  nativeSet.call(localStorage, restore.key, "true");
  fireEvent.click(reload);
  await flush();
  expect(says("便签设置已保存。"), "ZH Saved status").toBe(true);
  const lock = await hold(keyLock(spacing));
  choose(ui, spacing, "xl");
  await flush();
  expect(says("默认网格间距正在保存。"), "ZH pending feedback").toBe(true);
  await lock.release();
});

it("§5 ZH export failure status", async () => {
  seed(color, "sky");
  const ui = mount("zh");
  await flush();
  const quota = fault({ op: "set", key: color.key, label: "color quota" });
  choose(ui, color, "mint");
  await flush();
  fired(quota, "color write");
  expect(shown(ui, color), "H1: the failed color keeps the latest choice").toBe("mint");
  const exportZh = need(button(ui, "导出便签草稿"), "ZH Export action");
  const harness = download();
  let thrown = 0;
  harness.hooks.create = () => { thrown += 1; throw new Error("url setup"); };
  fireEvent.click(exportZh);
  await flush(2);
  pre(thrown === 1, "object URL setup fault armed and observed");
  expect(says("导出失败，请重试。"), "ZH export failure status").toBe(true);
  need(button(ui, "重试 默认颜色"), "the draft is kept after a failed export");
});
