/**
 * Mode `bytes` (contract section 12): fixture validity, the 16 exact values of section 10 item 1, absent
 * defaults, zero-write mounts, lifecycle classification, and the declined/working Reset positive controls.
 *
 * Every case in this file is expected to PASS at f359be6 and must keep passing on the fixed product.
 * FIXTURE cases prove the Storage injector, the exclusive Web Lock fixture, real accountScope transitions,
 * the host registry, the download harness, the window.confirm recorder and the StorageEvent counter work;
 * their failures are PRECONDITION failures only.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  accountScope, LOCAL_DATA_LIFECYCLE, LOCAL_KEY_OWNERSHIP, lifecycleForKey, ownershipForKey, PREF_REGISTRY,
} from "@repo/plugin-web-storage";
import { featureIdOrder, featurePrefKey, isFeatureId } from "@repo/plugin-web-settings-features-panel";
import {
  activate, attempts, blocking, board, bytes, bytesAll, clickReset, confirmer, denyAllStorage, discardAllButton, discardOf, dispatched,
  download, exportButton, fault, FIELDS, featureWrites, flush, guard, hold, host, IDS, keyLock, KEYS, lockAccount, lockState, locks,
  locksInstalled, mark, mount, nativeGet, nullStorageEvents, OWNER_A, OWNER_B, pre, raw, registerDepartureGuard, rejections, reloadOf,
  removesOn, retryOf, says, seed, setup, shown, shownAll, storageInstalled, store, switchOf, teardown, toggle, W, warns, type Field, type FieldId,
  type Guard,
} from "./fixture";

beforeEach(() => { setup(); });
afterEach(() => { teardown(); });

/** Reads a fault counter without TypeScript narrowing it to an earlier asserted literal. */
const firedOf = (target: { fired: number }): number => target.fired;
const allOf = (value: boolean | null | string) => Object.fromEntries(IDS.map(id => [id, value])) as Record<FieldId, boolean | null | string>;

const expectCleanRecovery = (ui: ReturnType<typeof mount>) => {
  for (const field of FIELDS) {
    expect(retryOf(ui, field), `${field.id}: no Retry in a clean state`).toBeNull();
    expect(discardOf(ui, field), `${field.id}: no Discard in a clean state`).toBeNull();
    expect(reloadOf(ui, field), `${field.id}: no Reload in a clean state`).toBeNull();
  }
  expect(exportButton(ui), "no Export control in a clean state").toBeNull();
  expect(discardAllButton(ui), "no Discard all control in a clean state").toBeNull();
  expect(blocking(), "a clean state never blocks departure").toBe(false);
  expect(warns(), "a clean state never warns on beforeunload").toBe(false);
  expect(says(W.en.saved), "a clean mount makes no Saved claim").toBe(false);
  expect(says(W.en.restored), "a clean mount makes no Defaults restored claim").toBe(false);
};

it("FIXTURE storage injector logs every get/set/remove attempt before delegating; faults fire, count, arm (after set or remove) and disarm", () => {
  pre(storageInstalled(), "injector installed on Storage.prototype");
  const probe = "features-sol-probe";
  const from = mark();
  localStorage.setItem(probe, "1");
  localStorage.getItem(probe);
  localStorage.removeItem(probe);
  pre(attempts(from).map(item => `${item.op}:${item.key}`).join() === `set:${probe},get:${probe},remove:${probe}`, "attempts are logged in call order");
  const quota = fault({ op: "set", key: probe, label: "probe quota" });
  let threw = false;
  try { localStorage.setItem(probe, "2"); } catch (error) { threw = (error as DOMException).name === "QuotaExceededError"; }
  const last = store.log.at(-1);
  pre(threw && quota.fired === 1 && last?.op === "set" && last.value === "2" && last.threw, "a faulted setItem attempt is logged before it throws a QuotaExceededError");
  pre(nativeGet.call(localStorage, probe) === null, "a faulted setItem never reaches storage");
  const readAfterSet = fault({ op: "get", key: probe, after: { op: "set", key: probe, value: "3" }, times: 1, label: "probe read after set" });
  pre(localStorage.getItem(probe) === null && firedOf(readAfterSet) === 0, "an after-set read fault stays unarmed before its write");
  quota.off();
  localStorage.setItem(probe, "3");
  threw = false;
  try { localStorage.getItem(probe); } catch { threw = true; }
  pre(threw && firedOf(readAfterSet) === 1, "the after-set read fault fires on the next read of that key");
  pre(localStorage.getItem(probe) === "3", "a times-limited fault is exhausted after it fires");
  const readAfterRemove = fault({ op: "get", key: probe, after: { op: "remove", key: probe }, times: 1, label: "probe read after remove" });
  pre(localStorage.getItem(probe) === "3" && firedOf(readAfterRemove) === 0, "an after-remove read fault stays unarmed before the removal");
  localStorage.removeItem(probe);
  threw = false;
  try { localStorage.getItem(probe); } catch { threw = true; }
  pre(threw && firedOf(readAfterRemove) === 1 && nativeGet.call(localStorage, probe) === null, "the after-remove read fault fires on the next read after a real removal");
  const removeFault = fault({ op: "remove", key: probe, label: "probe remove" });
  localStorage.setItem(probe, "4");
  threw = false;
  try { localStorage.removeItem(probe); } catch { threw = true; }
  pre(threw && removeFault.fired === 1 && nativeGet.call(localStorage, probe) === "4", "a faulted removeItem is logged, throws and never removes");
  removeFault.off();
  const denial = denyAllStorage();
  pre(denial.fired === 3, "total denial probe fired for get, set and remove");
  denial.off();
  pre(localStorage.getItem(probe) === "4", "a disarmed fault no longer fires");
  pre(sessionStorage.getItem(probe) === null && attempts(from).every(item => item.key === probe), "only localStorage attempts are logged");
});

it("FIXTURE Web Lock fixture is exclusive, asynchronous and observable; deny and missing capability are explicit", async () => {
  pre(locksInstalled(), "fixture installed as navigator.locks");
  const manager = locks();
  pre(navigator.locks === (manager.api as unknown), "navigator.locks returns the fixture API");
  const name = keyLock(board);
  const other = keyLock(FIELDS[0]!);
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

it("FIXTURE real accountScope transitions keep the 8 keys unscoped; host registry, download harness, confirm recorder and StorageEvent counter observe", async () => {
  const a = accountScope.capture();
  pre(a.kind === "account" && a.accountId === OWNER_A && a.generation === "g1", "setup activates account A generation g1");
  const unscoped = () => FIELDS.every(field => accountScope.physicalKey(field.key) === field.key);
  pre(unscoped(), "the 8 keys are unscoped under A");
  pre(accountScope.physicalKey("xai_pref_smart_lists").startsWith(`xai:account:v1:${OWNER_A}:`), "an account-owned control key is scoped under the real A scope");
  const b = activate(OWNER_B, "gB");
  pre(b.epoch > a.epoch && unscoped(), "A→B advances the epoch; the 8 keys stay unscoped");
  const locked = lockAccount();
  pre(locked.epoch > b.epoch && unscoped(), "B→locked advances the epoch; the 8 keys stay unscoped");
  const back = activate(OWNER_A, "g1");
  const renewed = activate(OWNER_A, "g2");
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
  confirmer.answer = false;
  pre(window.confirm("probe question") === false && confirmer.calls.at(-1) === "probe question", "window.confirm is recorded and answered by the recorder");
  confirmer.answer = true;
  pre(window.confirm("second probe") === true, "the recorder returns the chosen answer");
  confirmer.calls.length = 0;
  const seen: Array<string | null> = [];
  const listener = (event: Event) => { seen.push((event as StorageEvent).key); };
  window.addEventListener("storage", listener);
  const start = dispatched.length;
  window.dispatchEvent(new StorageEvent("storage", { key: null, storageArea: localStorage }));
  window.dispatchEvent(new StorageEvent("storage", { key: "xai_probe", storageArea: localStorage }));
  window.removeEventListener("storage", listener);
  pre(nullStorageEvents(start) === 1 && dispatched.length - start === 2 && seen.join() === ",xai_probe", "the StorageEvent counter records key:null and keyed events and still delivers them to listeners");
  dispatched.length = 0;
});

it("PC §2 §10.11 the 8 keys: product id order and key mapping, boolean codec, default true, schema 1, category pref, device ownership, lifecycle and per-key lock", () => {
  expect([...featureIdOrder], "featureIdOrder is the contract's display order").toEqual([...IDS]);
  for (const field of FIELDS) {
    expect(featurePrefKey(field.id), `${field.id} physical key derivation`).toBe(field.key);
    expect(isFeatureId(field.id), `${field.id} is a FeatureId`).toBe(true);
    const registered = PREF_REGISTRY[field.key as keyof typeof PREF_REGISTRY];
    expect(registered, `${field.key} registered`).toBeTruthy();
    expect({ codec: registered.codec, default: registered.default, schemaVersion: registered.schemaVersion, category: registered.category }, field.key)
      .toStrictEqual({ codec: "boolean", default: true, schemaVersion: 1, category: "pref" });
    expect(ownershipForKey(field.key), `${field.key} ownership`).toBe("device");
    expect(LOCAL_KEY_OWNERSHIP[field.key], `${field.key} explicit ownership row`).toBe("device");
    expect(lifecycleForKey(field.key), `${field.key} lifecycle`).toMatchObject({ ownership: "device", dataClass: "device-preference", exportScope: "device-recovery", accountDeletion: "retain", legacyMigration: "retain-on-device" });
    expect(LOCAL_DATA_LIFECYCLE.find(entry => entry.key === field.key), `${field.key} declared lifecycle row`).toMatchObject({ exportScope: "device-recovery", accountDeletion: "retain", legacyMigration: "retain-on-device" });
    expect(accountScope.physicalKey(field.key), `${field.key} physical key equals the logical key`).toBe(field.key);
    expect(keyLock(field), `${field.key} per-key lock name`).toBe(`xai:pref:v1:${field.key}`);
  }
  expect(KEYS.length, "8 keys").toBe(8);
});

describe.each(FIELDS)("PC §10.1 $id", field => {
  it(`PC §10.1 ${field.id}: both values persist exact codec bytes at the unscoped device key; on stores "true", never a removal`, async () => {
    const ui = mount();
    await flush();
    const from = mark();
    for (const value of [false, true]) {
      toggle(ui, field);
      await flush();
      expect(shown(ui, field), `${field.id}=${raw(value)} displayed (aria-checked)`).toBe(value);
      expect(switchOf(ui, field).classList.contains("on"), `${field.id}=${raw(value)} displayed (on class)`).toBe(value);
      expect(bytes(field), `${field.id}=${raw(value)} exact bytes`).toBe(raw(value));
    }
    const writes = attempts(from, undefined, ["set", "remove"]);
    expect(writes.filter(item => item.key !== field.key).map(item => item.key), "writes only target the unscoped device key").toEqual([]);
    expect(writes.filter(item => item.op === "remove").length, "turning a module back on is never converted to removal").toBe(0);
    expect(Object.keys(localStorage).filter(key => key.includes("xai_pref_features")), "no scoped or alias copy of the key exists").toEqual([field.key]);
    expect(rejections, "no unhandled rejection").toEqual([]);
  });
});

it("PC §5.1 absent sources: all 8 display the default on with zero set/remove attempts on mount and rerenders; clean state", async () => {
  for (const field of FIELDS) pre(bytes(field) === null, `${field.key} absent before mount`);
  const from = mark();
  const ui = mount();
  await flush();
  ui.rerenderPane();
  await flush();
  ui.rerenderPane("zh");
  await flush();
  ui.rerenderPane("en");
  await flush();
  expect(featureWrites(from), "absent mount and rerenders make zero set/remove attempts").toEqual([]);
  expect(shownAll(ui), "the registry default (on) is a display value").toStrictEqual(allOf(true));
  expect(bytesAll(), "absent keys stay absent").toStrictEqual(allOf(null));
  expectCleanRecovery(ui);
  expect(rejections).toEqual([]);
});

it("PC §5.1 valid stored true/false sources display exactly with zero set/remove attempts; clean state", async () => {
  const stored: Record<FieldId, string> = { tasks: "false", board: "true", dashboard: "false", calendar: "true", matrix: "false", pomodoro: "true", habits: "false", meditation: "true" };
  for (const field of FIELDS) seed(field, stored[field.id]);
  const from = mark();
  const ui = mount();
  await flush();
  ui.rerenderPane();
  await flush();
  expect(featureWrites(from), "valid mount and rerender make zero set/remove attempts").toEqual([]);
  expect(shownAll(ui), "stored values displayed").toStrictEqual(Object.fromEntries(FIELDS.map(field => [field.id, stored[field.id] === "true"])));
  expect(bytesAll(), "bytes never rewritten").toStrictEqual(stored);
  expectCleanRecovery(ui);
});

it("PC §9 a standalone render({lang}) without a guard still renders and edits", async () => {
  const ui = mount("en", { guard: false });
  await flush();
  toggle(ui, board);
  await flush();
  expect(bytes(board)).toBe("false");
  expect(shown(ui, board)).toBe(false);
  expect(host.registered.length, "no host registration without the optional prop").toBe(0);
});

it("PC §6 a declined reset confirmation makes zero get/set/remove attempts and changes nothing", async () => {
  seed(board, "false");
  seed(FIELDS[3]!, "false");
  const ui = mount();
  await flush();
  const displayed = shownAll(ui);
  const before = bytesAll();
  const events = dispatched.length;
  const from = mark();
  clickReset(ui, false);
  const during = attempts(from).map(item => `${item.op}:${item.key}`);
  expect(during, "from activation until the declined action returns: zero get, set or remove attempts on every key").toEqual([]);
  await flush();
  expect(featureWrites(from), "no set/remove attempt after the declined confirmation").toEqual([]);
  expect(shownAll(ui), "no state change").toStrictEqual(displayed);
  expect(bytesAll(), "no byte change").toStrictEqual(before);
  expect(dispatched.length - events, "no StorageEvent is dispatched").toBe(0);
});

it("PC §6 an accepted reset removes all 8 keys, displays on, and never writes true", async () => {
  for (const field of FIELDS) seed(field, "false");
  const ui = mount();
  await flush();
  const from = mark();
  clickReset(ui, true);
  await flush(24);
  expect(bytesAll(), "all 8 keys absent").toStrictEqual(allOf(null));
  expect(shownAll(ui), "all 8 display the default on").toStrictEqual(allOf(true));
  for (const field of FIELDS) expect(removesOn(from, field), `${field.id}: exactly one remove attempt`).toBe(1);
  expect(attempts(from, KEYS, ["set"]).length, "reset never writes true (or anything)").toBe(0);
  expect(rejections).toEqual([]);
});
