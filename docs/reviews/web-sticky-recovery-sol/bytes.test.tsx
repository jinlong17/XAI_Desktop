/**
 * Fixture validity, positive controls and contract section 10 item 1 (exact bytes for all 25 domain values).
 *
 * Every case in this file is expected to PASS at 2023526 and must keep passing on the fixed product.
 * FIXTURE cases prove the lock fixture, the Storage injector, the real accountScope transitions, the
 * host registry and the download harness work; their failures are PRECONDITION failures only.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { accountScope, lifecycleForKey, ownershipForKey, PREF_REGISTRY } from "@repo/plugin-web-storage";
import {
  activate, attempts, blocking, bytes, bytesAll, cases, choose, color, denyAllStorage, discardAllButton, discardOf, download, exportButton,
  fault, flush, font, guard, hold, host, keyLock, lockAccount, lockState, locks, locksInstalled, mark, mount, nativeGet, pin, pre, raw,
  registerDepartureGuard, rejections, reloadOf, restore, retryOf, says, seed, setup, shown, shownAll, spacing, stickyKeys, stickyWrites,
  storageInstalled, store, teardown, toggle, W, warns, type Guard, type Value,
} from "./fixture";

beforeEach(() => { setup(); });
afterEach(() => { teardown(); });

const expectCleanRecovery = (ui: ReturnType<typeof mount>) => {
  for (const entry of cases) {
    expect(retryOf(ui, entry), `${entry.field}: no Retry in a clean state`).toBeNull();
    expect(discardOf(ui, entry), `${entry.field}: no Discard in a clean state`).toBeNull();
    expect(reloadOf(ui, entry), `${entry.field}: no Reload in a clean state`).toBeNull();
  }
  expect(exportButton(ui), "no Export control in a clean state").toBeNull();
  expect(discardAllButton(ui), "no Discard all control in a clean state").toBeNull();
  expect(blocking(), "a clean state never blocks departure").toBe(false);
  expect(warns(), "a clean state never warns on beforeunload").toBe(false);
  expect(says(W.en.saved), "a clean mount makes no Saved claim").toBe(false);
};

it("FIXTURE storage injector logs every get/set/remove attempt before delegating; faults fire, count, arm and disarm", () => {
  pre(storageInstalled(), "injector installed on Storage.prototype");
  const probe = "sticky-sol-probe";
  const from = mark();
  localStorage.setItem(probe, "1");
  localStorage.getItem(probe);
  localStorage.removeItem(probe);
  pre(attempts(from).map(item => `${item.op}:${item.key}`).join() === `set:${probe},get:${probe},remove:${probe}`, "attempts are logged in call order");
  const quota = fault({ op: "set", key: probe, label: "probe quota" });
  let threw = false;
  try { localStorage.setItem(probe, "2"); } catch { threw = true; }
  const last = store.log.at(-1);
  pre(threw && quota.fired === 1 && last?.op === "set" && last.value === "2" && last.threw, "a faulted setItem attempt is logged before it throws");
  pre(nativeGet.call(localStorage, probe) === null, "a faulted setItem never reaches storage");
  const readback = fault({ op: "get", key: probe, afterSet: { key: probe, value: "3" }, times: 1, label: "probe readback" });
  pre(localStorage.getItem(probe) === null && readback.fired === 0, "an afterSet read fault stays unarmed before its write");
  quota.off();
  localStorage.setItem(probe, "3");
  threw = false;
  try { localStorage.getItem(probe); } catch { threw = true; }
  pre(threw && readback.fired === 1, "the afterSet read fault fires on the next read of that key");
  pre(localStorage.getItem(probe) === "3", "a times-limited fault is exhausted after it fires");
  const denial = denyAllStorage();
  pre(denial.fired === 3, "total denial probe fired for get, set and remove");
  denial.off();
  pre(localStorage.getItem(probe) === "3", "a disarmed fault no longer fires");
  pre(sessionStorage.getItem(probe) === null && attempts(from).every(item => item.key === probe), "only localStorage attempts are logged");
});

it("FIXTURE Web Lock fixture is exclusive, asynchronous and observable; deny and missing capability are explicit", async () => {
  pre(locksInstalled(), "fixture installed as navigator.locks");
  const manager = locks();
  pre(navigator.locks === (manager.api as unknown), "navigator.locks returns the fixture API");
  const name = keyLock(color);
  const other = keyLock(font);
  const order: string[] = [];
  const holder = await hold(name);
  const waiting = navigator.locks.request(name, { mode: "exclusive" }, () => { order.push("held-name"); return "a"; });
  const independent = navigator.locks.request(other, { mode: "exclusive" }, () => { order.push("other-name"); return "b"; });
  pre(order.length === 0, "lock callbacks are never invoked synchronously");
  await flush(4);
  pre(order.join() === "other-name", "an independent name is granted while the held name waits");
  pre(manager.heldBy(name) === "test" && manager.waiting(name, "product") === 1, "the held name keeps exactly one product waiter");
  await holder.release();
  pre((await waiting) === "a" && (await independent) === "b" && order.join() === "other-name,held-name", "the waiter is granted only after the holder releases");
  let openShared!: () => void;
  const gate = new Promise<void>(resolve => { openShared = resolve; });
  const sharedOne = navigator.locks.request(other, { mode: "shared" }, () => gate);
  const sharedTwo = navigator.locks.request(other, { mode: "shared" }, () => gate);
  const exclusive = navigator.locks.request(other, { mode: "exclusive" }, () => "exclusive");
  await flush(2);
  pre(manager.heldBy(other) === "shared" && manager.waiting(other) === 1, "shared holders coexist while an exclusive request waits");
  openShared();
  await Promise.all([sharedOne, sharedTwo]);
  pre((await exclusive) === "exclusive", "the exclusive request is granted after the shared holders release");
  const before = manager.log.length;
  manager.deny(name);
  let rejected = "";
  try { await navigator.locks.request(name, { mode: "exclusive" }, () => 1); } catch (error) { rejected = String((error as Error).message); }
  pre(/lock/.test(rejected) && manager.rejectedFor(name, before) === 1, "a denied name rejects with a lock error and is recorded");
  manager.allow(name);
  lockState.missing = true;
  pre(navigator.locks === undefined, "the missing capability is explicit and on purpose only");
  lockState.missing = false;
  pre(manager.errors.length === 0, "no unsupported lock request shape was seen");
});

it("FIXTURE real accountScope transitions keep Sticky keys unscoped; the host registry and download harness observe", async () => {
  const a = accountScope.capture();
  pre(a.kind === "account" && a.accountId === "sticky-sol-A" && a.generation === "g1", "setup activates account A generation g1");
  const unscoped = () => cases.every(entry => accountScope.physicalKey(entry.key) === entry.key);
  pre(unscoped(), "Sticky keys are unscoped under A");
  pre(accountScope.physicalKey("xai_pref_smart_lists").startsWith("xai:account:v1:sticky-sol-A:"), "an account-owned control key is scoped under the real A scope");
  const b = activate("sticky-sol-B", "gB");
  pre(b.epoch > a.epoch && unscoped(), "A→B advances the epoch; Sticky keys stay unscoped");
  const locked = lockAccount();
  pre(locked.epoch > b.epoch && unscoped(), "B→locked advances the epoch; Sticky keys stay unscoped");
  const back = activate("sticky-sol-A", "g1");
  const renewed = activate("sticky-sol-A", "g2");
  pre(renewed.epoch > back.epoch && renewed.accountId === back.accountId && renewed.generation !== back.generation, "same-account generation change advances the epoch");
  const first: Guard = { token: {}, label: "probe", isBlocking: () => true, isCurrent: () => true, exportDraft() {}, discardDraft() {} };
  const second: Guard = { ...first, token: {} };
  const offFirst = registerDepartureGuard(first);
  registerDepartureGuard(second);
  offFirst();
  pre(guard() === second, "an old token's cleanup never clears a newer registration (coordinator semantics)");
  pre(blocking(), "blocking() mirrors the coordinator's isCurrent && isBlocking");
  host.current = null;
  const harness = download();
  const anchor = document.createElement("a");
  anchor.download = "probe.json";
  anchor.href = URL.createObjectURL(new Blob(['{"probe":1}'], { type: "application/json" }));
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(anchor.getAttribute("href")!);
  pre(harness.created.length === 1 && harness.clicks.length === 1 && harness.clicks[0]!.connected && harness.revoked[0] === harness.created[0] && harness.anchorsInDocument().length === 0, "the harness observes URL creation, append, click and revoke");
  pre(JSON.stringify(await harness.json(0)) === '{"probe":1}', "the harness reads Blob contents");
  const handler = (event: Event) => event.preventDefault();
  window.addEventListener("beforeunload", handler);
  pre(warns(), "a canceled beforeunload is reported as a warning");
  window.removeEventListener("beforeunload", handler);
  pre(!warns(), "an uncanceled beforeunload is not a warning");
});

it("PC §2/§10 registry codec, default, schema, category, device ownership, lifecycle and unscoped key for all five", () => {
  for (const entry of cases) {
    const registered = PREF_REGISTRY[entry.key as keyof typeof PREF_REGISTRY];
    expect(registered, `${entry.key} registered`).toBeTruthy();
    expect({ codec: registered.codec, default: registered.default, schemaVersion: registered.schemaVersion, category: registered.category }, entry.key)
      .toStrictEqual({ codec: typeof entry.default === "boolean" ? "boolean" : "string", default: entry.default, schemaVersion: 1, category: "pref" });
    expect(ownershipForKey(entry.key), `${entry.key} ownership`).toBe("device");
    expect(lifecycleForKey(entry.key), `${entry.key} lifecycle`).toMatchObject({ ownership: "device", dataClass: "device-preference", exportScope: "device-recovery", accountDeletion: "retain", legacyMigration: "retain-on-device" });
    expect(accountScope.physicalKey(entry.key), `${entry.key} physical key`).toBe(entry.key);
    expect(keyLock(entry), `${entry.key} per-key lock name`).toBe(`xai:pref:v1:${entry.key}`);
  }
  expect(cases.reduce((total, entry) => total + entry.domain.length, 0), "13 + 4 + 2 + 2 + 4 domain values").toBe(25);
});

describe.each(cases)("PC §10.1 $field", entry => {
  it(`PC §10.1 ${entry.field}: every domain value persists exact codec bytes at the unscoped device key`, async () => {
    const ui = mount();
    await flush();
    const from = mark();
    const sequence: readonly Value[] = entry.kind === "switch" ? [!entry.default, entry.default] : entry.domain;
    for (const value of sequence) {
      if (entry.kind === "switch") toggle(ui, entry);
      else choose(ui, entry, value);
      await flush();
      expect(shown(ui, entry), `${entry.field}=${raw(value)} displayed`).toBe(value);
      expect(bytes(entry), `${entry.field}=${raw(value)} exact bytes`).toBe(raw(value));
    }
    expect(new Set(sequence.map(raw)).size, "the sequence covers the whole domain").toBe(entry.domain.length);
    const writes = attempts(from, undefined, ["set", "remove"]);
    expect(writes.filter(item => item.key !== entry.key).map(item => item.key), "writes only target the unscoped device key").toEqual([]);
    expect(writes.filter(item => item.op === "remove").length, "no value is converted to removal").toBe(0);
    expect(Object.keys(localStorage).filter(key => key.includes("xai_pref_sticky")), "no scoped or alias copy of the key exists").toEqual([entry.key]);
    expect(rejections, "no unhandled rejection").toEqual([]);
  });
});

it("PC §5.1 absent sources: registry defaults displayed, zero set/remove attempts on mount and rerenders, clean state", async () => {
  for (const entry of cases) pre(bytes(entry) === null, `${entry.key} absent before mount`);
  const from = mark();
  const ui = mount();
  await flush();
  ui.rerenderPane();
  await flush();
  ui.rerenderPane("zh");
  await flush();
  ui.rerenderPane("en");
  await flush();
  expect(stickyWrites(from), "absent mount and rerenders make zero set/remove attempts").toEqual([]);
  expect(shownAll(ui), "registry defaults are display values").toStrictEqual({ color: "sun", font: "large", pin_default: true, restore_size: false, grid_spacing: "normal" });
  expect(bytesAll(), "absent keys stay absent").toStrictEqual({ color: null, font: null, pin_default: null, restore_size: null, grid_spacing: null });
  expectCleanRecovery(ui);
  expect(rejections).toEqual([]);
});

it("PC §5.1 valid non-default sources, including the random sentinel, display exactly with zero set/remove attempts", async () => {
  const stored = { color: "random", font: "small", pin_default: "false", restore_size: "true", grid_spacing: "none" } as const;
  for (const entry of cases) seed(entry, stored[entry.field]);
  const from = mark();
  const ui = mount();
  await flush();
  ui.rerenderPane();
  await flush();
  expect(stickyWrites(from), "valid mount and rerender make zero set/remove attempts").toEqual([]);
  expect(shownAll(ui), "stored values displayed; random is the literal sentinel").toStrictEqual({ color: "random", font: "small", pin_default: false, restore_size: true, grid_spacing: "none" });
  expect(bytesAll(), "bytes never rewritten or resolved").toStrictEqual(stored);
  expectCleanRecovery(ui);
});

it("PC §5.4 choosing a value equal to the registry default stores it and never converts it to removal", async () => {
  const first = mount();
  await flush();
  const from = mark();
  choose(first, color, "sun");
  choose(first, font, "large");
  choose(first, spacing, "normal");
  await flush();
  expect({ color: bytes(color), font: bytes(font), grid_spacing: bytes(spacing) }, "absent string fields store the chosen default").toStrictEqual({ color: "sun", font: "large", grid_spacing: "normal" });
  first.unmount();
  seed(color, "sky");
  seed(font, "small");
  seed(pin, "false");
  seed(restore, "true");
  seed(spacing, "large");
  const second = mount();
  await flush();
  choose(second, color, "sun");
  choose(second, font, "large");
  toggle(second, pin);
  toggle(second, restore);
  choose(second, spacing, "normal");
  await flush();
  expect(bytesAll(), "non-default sources store the chosen defaults").toStrictEqual({ color: "sun", font: "large", pin_default: "true", restore_size: "false", grid_spacing: "normal" });
  expect(attempts(from, stickyKeys, ["remove"]).length, "no removal attempt").toBe(0);
});

it("PC §9 a standalone render({lang}) without a guard still renders and edits", async () => {
  const ui = mount("en", { guard: false });
  await flush();
  choose(ui, color, "mint");
  toggle(ui, pin);
  await flush();
  expect(bytes(color)).toBe("mint");
  expect(bytes(pin)).toBe("false");
  expect(host.registered.length, "no host registration without the optional prop").toBe(0);
});
