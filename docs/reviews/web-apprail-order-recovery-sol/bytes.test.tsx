/**
 * Mode `bytes` (contract r1 section 12): zero-write mounts of the production App and of a standalone AppRail; the
 * absent and `[]` displays; exact bytes of drops (section 10 item 1), including P6 over absent bytes and `[]`, and the
 * R-1 cases with hidden, unknown and non-rail ids; byte compatibility through the unchanged legacy `getPref` and
 * `exportDeviceRecoveryData()`; the lifecycle classification; H11 (cross-document live update). Also the
 * fixture-validity proofs (F-B002 self-check, Storage injector, Web Lock fixture, harness, drag driver).
 *
 * Composition: the production route table in a memory router; only `useWebAuthSession` is substituted (account A,
 * no network). The standalone AppRail runs inside the real WebShellProvider with the production registrations.
 */
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { fireEvent } from "@testing-library/react";
import {
  accountScope, exportDeviceRecoveryData, generationKey, getPref, LOCAL_KEY_OWNERSHIP, lifecycleForKey, ownershipForKey, PREF_REGISTRY,
} from "@repo/plugin-web-storage";
import { onWebEvent } from "@repo/xai-web-event-bus";
import {
  attempts, BOARD_AT_2, bus, confirmer, configureApp, configureRegistrations, createLockManager, DEFAULT_ORDER, denyAllStorage, dispatched,
  displayOf, download, drag, dragEnd, dragOver, dragStart, drop, encode, external, fault, flush, go, hold, KEY, LOCK, LOCK_EXPECTED, lockState,
  locks, mark, merge, modulesFor, NAV, mountApp, mountStandalone, moveBefore, nativeGet, nativeSet, networkAttempts, observe, OWNER_A, OWNER_B,
  pre, propertyFailures, RAIL_IDS, railButtons, railIds, railWrites, raw, rejections, REVERSED, routeError, seedHidden, seedKey, seedOrder,
  SELF_CHECK_DELEGATION, setup, status, storageSelfCheck, store, teardown, TOGGLEABLE, transfer, unload, visible, warns, writes,
} from "./fixture";

const auth = vi.hoisted(() => {
  const state = { calls: 0 };
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
});
afterEach(() => { teardown(); });

const DEFAULT_DISPLAY = displayOf(DEFAULT_ORDER, RAIL_IDS);
const railKeyWrites = (from: number): string[] => attempts(from, [KEY], ["set", "remove"]).map(item => `${item.op}:${item.value ?? ""}`);

// ---------------------------------------------------------------------------
// Fixture validity (FIXTURE cases use PRECONDITION failures only)
// ---------------------------------------------------------------------------

it("FIXTURE F-B002 the storage wrappers record and delegate exactly once, never re-enter Storage and never call accountScope helpers", () => {
  const result = storageSelfCheck();
  observe("F-B002 self-check", result);
  pre(result.nested === 0, `no nested Storage call from inside a wrapper (got ${result.nested})`);
  pre(result.tripwire === 0, `no accountScope.physicalKey/capture call from inside a wrapper (got ${result.tripwire})`);
  pre(JSON.stringify(result.delegatedPerCall) === JSON.stringify(SELF_CHECK_DELEGATION), `each wrapper delegated exactly once and faulted attempts never delegated: ${JSON.stringify(result.delegatedPerCall)}`);
  pre(LOCK === LOCK_EXPECTED, `the per-key lock name was precomputed outside the wrappers (${LOCK})`);
});

it("FIXTURE the attempt-counting Storage injector logs before delegation, faults precisely and proves firing", () => {
  const from = mark();
  localStorage.setItem("probe", "1");
  localStorage.getItem("probe");
  localStorage.removeItem("probe");
  pre(JSON.stringify(attempts(from).map(item => `${item.op}:${item.key}${item.value !== undefined ? `=${item.value}` : ""}`)) === JSON.stringify(["set:probe=1", "get:probe", "remove:probe"]), "attempts are logged in call order with key and value");
  const quota = fault({ op: "set", key: "probe", times: 1, label: "probe quota" });
  let quotaName = "";
  try { localStorage.setItem("probe", "2"); } catch (error) { quotaName = (error as DOMException).name; }
  pre(quotaName === "QuotaExceededError" && quota.fired === 1 && nativeGet.call(localStorage, "probe") === null && store.log.at(-1)?.threw === true, "a faulted setItem throws QuotaExceededError, is logged as thrown and never reaches storage");
  const generic = fault({ op: "set", key: "probe", times: 1, generic: true, label: "probe generic" });
  let genericName = "";
  try { localStorage.setItem("probe", "2"); } catch (error) { genericName = (error as Error).constructor.name; }
  pre(genericName === "Error" && generic.fired === 1 && nativeGet.call(localStorage, "probe") === null, "a generic setItem fault throws a plain Error and never reaches storage");
  localStorage.setItem("probe", "3");
  pre(nativeGet.call(localStorage, "probe") === "3", "a one-shot fault stops after firing");
  const afterSet = fault({ op: "get", key: "probe", times: 1, after: { op: "set", key: "probe", value: "5" }, label: "read after set" });
  localStorage.setItem("probe", "6");
  pre(afterSet.armed === false, "an after-set fault keyed to a value stays unarmed for another value");
  localStorage.setItem("probe", "5");
  let readThrew = false;
  try { localStorage.getItem("probe"); } catch { readThrew = true; }
  pre(readThrew && afterSet.fired === 1, "the after-set read fault arms after its exact value and fires once");
  const valueFault = fault({ op: "set", key: "probe", value: "9", times: 1, label: "value-specific" });
  localStorage.setItem("probe", "8");
  let valueThrew = false;
  try { localStorage.setItem("probe", "9"); } catch { valueThrew = true; }
  pre(valueFault.fired === 1 && valueThrew && nativeGet.call(localStorage, "probe") === "8", "a value-specific write fault fires only for its value");
  const before = mark();
  sessionStorage.setItem("probe", "x");
  sessionStorage.getItem("probe");
  pre(mark() === before, "only localStorage attempts are counted");
  const denial = denyAllStorage();
  denial.off();
  localStorage.setItem("probe", "7");
  pre(nativeGet.call(localStorage, "probe") === "7", "a disarmed fault stops firing");
});

it("FIXTURE the exclusive Web Lock fixture serves async grants, holds, programmed holds, denial and a missing capability", async () => {
  const manager = createLockManager();
  const order: string[] = [];
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  const first = manager.api.request("n", { mode: "exclusive" }, async () => { order.push("first"); await gate; });
  pre(order.length === 0, "grants are asynchronous");
  await flush(2);
  const second = manager.api.request("n", { mode: "exclusive" }, async () => { order.push("second"); });
  const independent = manager.api.request("m", async () => { order.push("independent"); });
  await flush(2);
  pre(JSON.stringify(order) === JSON.stringify(["first", "independent"]) && manager.waiting("n", "product") === 1, "a held name keeps one queued product waiter while an independent name is granted at once");
  release();
  await Promise.all([first, second, independent]);
  pre(JSON.stringify(order) === JSON.stringify(["first", "independent", "second"]), "the waiter is granted only after release");
  manager.deny("d");
  let rejected = false;
  try { await manager.api.request("d", async () => undefined); } catch { rejected = true; }
  pre(rejected && manager.rejectedFor("d") === 1, "a denied name rejects the product request");
  const plan = manager.plan("p", 1);
  const steps: string[] = [];
  await manager.api.request("p", async () => { steps.push("granted-1"); });
  pre(steps.length === 1 && !plan.triggered, "the programmed plan grants the first acquisition normally");
  const heldRequest = manager.api.request("p", async () => { steps.push("granted-2"); });
  await flush(4);
  pre(plan.triggered && plan.held && steps.length === 1 && manager.heldBy("p") === "test" && manager.waiting("p", "product") === 1, "the plan holds the next acquisition behind an exclusive test hold");
  await plan.release();
  await heldRequest;
  pre(JSON.stringify(steps) === JSON.stringify(["granted-1", "granted-2"]), "the held acquisition is granted after the plan is released");
  pre(locks() === lockState.manager, "the per-test manager is installed as navigator.locks");
  const testHold = await hold(LOCK);
  pre(locks().heldBy(LOCK) === "test", "the test can exclusively hold the real per-key lock name of xai_rail_order");
  await testHold.release();
  lockState.missing = true;
  pre(navigator.locks === undefined, "the missing capability is explicit");
  lockState.missing = false;
  pre(navigator.locks !== undefined, "the capability is restored");
});

it("FIXTURE accountScope transitions, confirm recorder, StorageEvent counter, bus spy, unload probe and download harness are observable", async () => {
  const a = accountScope.capture();
  pre(a.kind === "account" && a.accountId === OWNER_A, "setup activated account A");
  nativeSet.call(localStorage, `xai:account:v1:${OWNER_B}:committed-generation`, JSON.stringify({ generation: "g1", migrationId: "apprail-sol", previous: null }));
  const b = accountScope.activate(accountScope.lock(OWNER_B), "g1");
  pre(b.epoch > a.epoch && accountScope.physicalKey(KEY) === KEY && generationKey(OWNER_B, "g1", "xai_task_cols").startsWith("xai:account:v1:"), "a real A→B transition advances the epoch while xai_rail_order stays an unscoped device key");
  confirmer.answer = false;
  pre(window.confirm("probe") === false && confirmer.calls.at(-1) === "probe", "window.confirm is recorded and answered");
  const before = dispatched.length;
  await external("probe-key", "1");
  pre(dispatched.length === before + 1 && nativeGet.call(localStorage, "probe-key") === "1", "an oracle StorageEvent is counted and its bytes are written natively");
  const seen: unknown[] = [];
  const off = onWebEvent("web:settings:preference-changed", detail => { seen.push(detail); });
  pre(bus.preference.length === 0, "the bus spy starts empty");
  off();
  const plain = unload();
  pre(plain.warned === false && plain.attempts === 0, "no beforeunload warning without a listener");
  const canceling = (event: Event) => { event.preventDefault(); };
  window.addEventListener("beforeunload", canceling);
  pre(unload().warned === true, "a canceling beforeunload listener is detected as a warning");
  window.removeEventListener("beforeunload", canceling);
  const assigning = (event: Event) => { (event as unknown as { returnValue: string }).returnValue = "unsaved"; };
  window.addEventListener("beforeunload", assigning);
  pre(unload().warned === true, "a returnValue-assigning beforeunload listener is detected as a warning");
  window.removeEventListener("beforeunload", assigning);
  const harness = download();
  const url = URL.createObjectURL(new Blob(["{}"]));
  const anchor = document.createElement("a");
  anchor.download = "x.json";
  anchor.href = url;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  pre(harness.created.length === 1 && harness.clicks.length === 1 && harness.revoked[0] === url && harness.anchorsInDocument().length === 0, "object URL, anchor append, click and revoke are observed");
  pre(seen.length === 0 && rejections.length === 0, "no stray events or rejections");
});

it("FIXTURE the production App mounts with only the auth-session hook substituted, real modules and no network", async () => {
  await mountApp("/app/tasks");
  pre(auth.state.calls > 0, "the substituted useWebAuthSession served the production App and its gates");
  pre(routeError() === null, "no route error at a clean mount");
  pre(document.querySelector("header.topbar .topbar-pref-trigger") !== null, "the production Topbar renders the appearance trigger");
  pre(document.querySelector(".app-rail .rail-items") !== null && document.querySelector(".app[data-rail-pos]") !== null, "the production Shell and AppRail render");
  pre(document.querySelector(".app-rail .rail-bottom .rail-btn") !== null, "the rail-bottom pet button renders outside .rail-items");
  pre(document.querySelector(".pet-wrap") !== null, "the production DesktopPet renders");
  const scope = accountScope.capture();
  pre(scope.kind === "account" && scope.accountId === OWNER_A, "the production AccountDataGate activated account A");
  pre(networkAttempts() === 0, "no network attempt");
  const production = webShellModuleRegistrations.filter(entry => entry.showInRail !== false).map(entry => entry.moduleId);
  pre(JSON.stringify(production) === JSON.stringify(RAIL_IDS), `the production rail registry equals the contract's 14 ids in order (${production.join(",")})`);
  pre(webShellModuleRegistrations.find(entry => entry.moduleId === "settings")?.showInRail === false, "settings is registered with showInRail false");
  pre(JSON.stringify(modulesFor(["board"]).map((entry: { moduleId: string }) => entry.moduleId).filter(id => RAIL_IDS.includes(id))) === JSON.stringify(visible(["board"])), "the real Features filter removes exactly the hidden module");
});

it("FIXTURE the drag driver fires dragStart → dragEnter → dragOver → drop → dragEnd on the real rail nodes with one DataTransfer stub", async () => {
  await mountApp("/app/tasks");
  const seen: Array<{ type: string; label: string; transfer: boolean }> = [];
  const types = ["dragstart", "dragenter", "dragover", "drop", "dragend"];
  const record = (event: Event) => { seen.push({ type: event.type, label: (event.target as HTMLElement).getAttribute?.("aria-label") ?? (event.target as HTMLElement).className, transfer: Boolean((event as DragEvent).dataTransfer) }); };
  for (const type of types) document.addEventListener(type, record, { capture: true, passive: true });
  try {
    const order = railIds();
    const gesture = dragStart(order[0]!);
    dragOver(gesture, order[0]!, order[2]!);
    drop(gesture, order[0]!);
    dragEnd(gesture, order[0]!);
    await flush();
    pre(JSON.stringify(seen.map(entry => entry.type)) === JSON.stringify(types), `the full event sequence reached the document in order: ${JSON.stringify(seen.map(entry => entry.type))}`);
    pre(seen.every(entry => entry.transfer), "every drag event carries the DataTransfer stub");
    pre(seen[0]!.label === "Tasks" && seen[1]!.label === "Dashboard" && Object.values(NAV.en).includes(seen[2]!.label), "dragstart fired on the source button, dragenter on the hovered slot's button (Dashboard) and dragover on the button displayed at that slot");
    pre(JSON.stringify(gesture.expected) === JSON.stringify(moveBefore(order, order[0]!, order[2]!)), "the oracle's expected preview is the section 6 item 2 reorder");
    const stub = transfer();
    stub.setData("text/plain", "probe");
    pre(stub.getData("text/plain") === "probe" && JSON.stringify(stub.types) === JSON.stringify(["text/plain"]), "the DataTransfer stub stores and returns data");
  } finally {
    for (const type of types) document.removeEventListener(type, record, { capture: true });
  }
});

// ---------------------------------------------------------------------------
// Classification, defaults and displays (positive controls)
// ---------------------------------------------------------------------------

it("PC §2/§10.11 lifecycle classification, registry entry, device ownership and the per-key lock name are unchanged", () => {
  const lifecycle = lifecycleForKey(KEY);
  expect({ ownership: lifecycle.ownership, dataClass: lifecycle.dataClass, exportScope: lifecycle.exportScope, accountDeletion: lifecycle.accountDeletion, legacyMigration: lifecycle.legacyMigration }, "§10.11: device-preference, device-recovery, retain, retain-on-device").toStrictEqual({
    ownership: "device", dataClass: "device-preference", exportScope: "device-recovery", accountDeletion: "retain", legacyMigration: "retain-on-device",
  });
  expect(ownershipForKey(KEY), "device key").toBe("device");
  expect(LOCAL_KEY_OWNERSHIP[KEY], "LOCAL_KEY_OWNERSHIP classifies the key as device").toBe("device");
  expect(accountScope.physicalKey(KEY), "physical key = logical key").toBe(KEY);
  const entry = PREF_REGISTRY[KEY];
  expect({ key: entry.key, codec: entry.codec, schemaVersion: entry.schemaVersion, owner: entry.owner, category: entry.category, default: entry.default }, "§2: json codec, schemaVersion 1, owner xai-web-shell, category shell, the 12 defaults").toStrictEqual({
    key: KEY, codec: "json", schemaVersion: 1, owner: "xai-web-shell", category: "shell", default: [...DEFAULT_ORDER],
  });
  expect(LOCK, "the per-key lock name").toBe(LOCK_EXPECTED);
});

it("PC §3.7 absent bytes display the 12 defaults then Bookkeeping and Metrics, with no status and no unload warning", async () => {
  await mountApp("/app/tasks");
  expect(railIds(), "absent: D(DEFAULT_RAIL_ORDER, R)").toEqual(DEFAULT_DISPLAY);
  expect(status(), "no rail-order status for absent bytes").toBeNull();
  expect(warns(), "no unload warning in a clean state").toBe(false);
  expect(raw(), "the key stays absent").toBeNull();
});

it("PC §3.7 `[]` displays all 14 modules in R order with XAI Chat first, with no status", async () => {
  seedOrder([]);
  await mountApp("/app/tasks");
  expect(railIds(), "[]: R order").toEqual([...RAIL_IDS]);
  expect(status(), "`[]` is in-domain: no status").toBeNull();
  expect(raw(), "the bytes are unchanged").toBe("[]");
});

it("PC §10.2 a value written by the before product is read identically: a seeded custom order displays as D(S, R)", async () => {
  seedOrder(REVERSED);
  const first = await mountApp("/app/tasks");
  expect(railIds(), "the stored custom order").toEqual([...REVERSED]);
  first.unmount();
  seedOrder(["ghost-module", "dashboard", "settings", "tasks"]);
  await mountApp("/app/tasks");
  expect(railIds(), "unknown and non-rail ids are skipped for display").toEqual(displayOf(["ghost-module", "dashboard", "settings", "tasks"], RAIL_IDS));
  expect(railIds().slice(0, 2), "unknown and non-rail ids are skipped for display; the visible ids follow in S order").toEqual(["dashboard", "tasks"]);
  expect(status(), "in-domain unknown and non-rail ids: no status").toBeNull();
});

// ---------------------------------------------------------------------------
// Section 5 item 1: zero-write mounts and re-renders
// ---------------------------------------------------------------------------

it("PC §5.1 loading the production App on the three host-row-a routes, the Topbar popover and a reload make zero attempts to write", async () => {
  const from = mark();
  const app = await mountApp("/app/tasks");
  await go(app, "/app/settings/appearance");
  const appearanceFrom = mark();
  const trigger = document.querySelector<HTMLElement>(".topbar .topbar-pref-trigger");
  pre(trigger, "the Topbar appearance trigger is present");
  fireEvent.click(trigger);
  await flush();
  fireEvent.click(trigger);
  await flush();
  expect(writes(appearanceFrom), "§5.1: on the Appearance route, opening and closing the Topbar popover writes no key").toEqual([]);
  await go(app, "/app/dashboard");
  app.unmount();
  await mountApp("/app/settings/appearance");
  expect(railKeyWrites(from), "§5.1: zero set/remove attempts on xai_rail_order across the three routes, the popover and a reload").toEqual([]);
  expect(raw(), "absent bytes stay absent").toBeNull();
  expect(railIds(), "the default display after the reload").toEqual(DEFAULT_DISPLAY);
  observe("other-key writes during the zero-write mount", writes(from).filter(entry => !entry.includes(KEY)));
});

it("PC §5.1 a seeded custom order is displayed on every route with zero attempts to write and unchanged bytes", async () => {
  seedOrder(REVERSED);
  const from = mark();
  const app = await mountApp("/app/dashboard");
  for (const route of ["/app/settings/appearance", "/app/tasks", "/app/settings/features"]) {
    await go(app, route);
    expect(railIds(), `the custom order on ${route}`).toEqual([...REVERSED]);
  }
  expect(railKeyWrites(from), "§5.1: zero set/remove attempts on xai_rail_order").toEqual([]);
  expect(raw(), "bytes unchanged").toBe(encode(REVERSED));
});

it("PC §5.1 AppRail re-renders caused by a Features toggle, a rail-position change and a language change from another document make zero attempts", async () => {
  seedOrder(REVERSED);
  seedHidden([]);
  await mountApp("/app/tasks");
  const from = mark();
  await external("xai_pref_features_board", "false");
  expect(railIds(), "the rail follows R after a Features toggle").toEqual(displayOf(REVERSED, visible(["board"])));
  await external("xai_rail_pos", "top");
  await external("xai_pref_lang", JSON.stringify("zh"));
  expect(railIds(), "the rail keeps the stored order after the position and language changes").toEqual(displayOf(REVERSED, visible(["board"])));
  observe("after language and position changes", { lang: document.querySelector(".app-rail .rail-items .rail-btn")?.getAttribute("aria-label"), pos: document.querySelector(".app-rail")?.getAttribute("data-pos") });
  expect(railKeyWrites(from), "§5.1/§5.9: zero set/remove attempts on xai_rail_order").toEqual([]);
  expect(raw(), "bytes unchanged").toBe(encode(REVERSED));
});

it("PC §5.1 a standalone AppRail mounts with zero attempts to write, absent and seeded", async () => {
  const from = mark();
  const absent = await mountStandalone();
  expect(railIds(), "standalone absent: the default display").toEqual(DEFAULT_DISPLAY);
  absent.unmount();
  seedOrder(REVERSED);
  const seeded = await mountStandalone(["habits"]);
  expect(railIds(), "standalone seeded with Habits hidden").toEqual(displayOf(REVERSED, visible(["habits"])));
  seeded.setHidden([]);
  await flush();
  expect(railIds(), "standalone re-render with every module visible").toEqual([...REVERSED]);
  expect(railKeyWrites(from), "§5.1: zero set/remove attempts on xai_rail_order").toEqual([]);
});

// ---------------------------------------------------------------------------
// Section 10 item 1: exact bytes of drops
// ---------------------------------------------------------------------------

async function exactDrop(stored: readonly string[] | null, hidden: readonly string[], from: string, targets: readonly string[], tag: string): Promise<void> {
  if (hidden.length) seedHidden(hidden);
  if (stored !== null) seedOrder(stored);
  await mountApp("/app/tasks");
  const base = stored ?? DEFAULT_ORDER;
  const rail = visible(hidden);
  pre(JSON.stringify(railIds()) === JSON.stringify(displayOf(base, rail)), `${tag}: the rail displays D(S, R) before the drag`);
  const start = mark();
  const order = await drag(from, targets);
  const expected = merge(base, rail, order);
  pre(expected !== null && JSON.stringify(order) !== JSON.stringify(displayOf(base, rail)), `${tag}: the gesture changes the order and P is a permutation of D(S, R)`);
  expect(railIds(), `${tag}: the rail displays the dropped order P`).toEqual(order);
  expect(raw(), `${tag}: the stored bytes are exactly the A2 merge`).toBe(encode(expected));
  const written = attempts(start, [KEY], ["set"]).filter(item => !item.threw);
  expect(written.at(-1)?.value, `${tag}: the last successful setItem wrote the A2 merge bytes`).toBe(encode(expected));
  const decoded: unknown = JSON.parse(raw() ?? "null");
  expect(propertyFailures(base, rail, order, decoded), `${tag}: P1–P4 hold for the written value`).toEqual([]);
}

it("PC §10.1 P6 an all-visible drop over a stored custom order writes exactly P", async () => {
  await exactDrop(REVERSED, [], REVERSED[0]!, [REVERSED[3]!], "P6 REVERSED");
  expect(JSON.parse(raw()!), "P6: S' = P when every element of S is visible").toEqual(railIds());
});

it("PC §10.1 P6 an all-visible drop over absent bytes writes exactly P (12 defaults plus Bookkeeping and Metrics)", async () => {
  await exactDrop(null, [], "tasks", ["calendar"], "P6 absent");
  expect(JSON.parse(raw()!), "P6 over absent bytes: S' = P").toEqual(railIds());
});

it("PC §10.1 P6 an all-visible drop over `[]` writes exactly P", async () => {
  await exactDrop([], [], "ai", ["matrix"], "P6 []");
  expect(JSON.parse(raw()!), "P6 over []: S' = P").toEqual(railIds());
});

it("PC §10.1 P6 a two-step all-visible drop writes the final preview", async () => {
  await exactDrop(REVERSED, [], REVERSED[5]!, [REVERSED[1]!, REVERSED[9]!], "P6 two-step");
});

it("H5 §10.1 P2 a drop with Boards hidden keeps `board` at its stored index 2", async () => {
  await exactDrop(BOARD_AT_2, ["board"], "calendar", ["matrix"], "H5 one hidden");
});

it("H5 §10.1 P2 a drop with three modules hidden keeps each at its stored index", async () => {
  await exactDrop(REVERSED, ["board", "habits", "pomodoro"], REVERSED[0]!, [REVERSED[4]!], "H5 three hidden");
});

it("H5 §10.1 P2 an unknown id (`ghost-module`) in the stored order keeps its index", async () => {
  const stored = ["tasks", "ghost-module", ...RAIL_IDS.filter(id => id !== "tasks")];
  await exactDrop(stored, [], "tasks", ["calendar"], "H5 unknown id");
});

it("H5 §10.1 P2 `settings` in the stored order keeps its index", async () => {
  const stored = ["dashboard", "settings", ...RAIL_IDS.filter(id => id !== "dashboard")];
  await exactDrop(stored, [], "dashboard", ["habits"], "H5 settings");
});

it("H5 §10.1 P7 over absent bytes with Boards hidden, `board` keeps its default index 1", async () => {
  await exactDrop(null, ["board"], "tasks", ["matrix"], "P7 absent");
  expect((JSON.parse(raw() ?? "[]") as string[])[1], "P7: board keeps index 1 of DEFAULT_RAIL_ORDER").toBe("board");
});

// ---------------------------------------------------------------------------
// Section 10 item 2: byte compatibility; H11 cross-document
// ---------------------------------------------------------------------------

it("PC §10.2 bytes written by a drop decode identically through the unchanged legacy getPref and appear verbatim in exportDeviceRecoveryData()", async () => {
  seedOrder(REVERSED);
  await mountApp("/app/tasks");
  const order = await drag(REVERSED[2]!, [REVERSED[7]!]);
  const bytesNow = raw();
  pre(bytesNow === encode(order), "the drop committed (P6)");
  expect(getPref(KEY), "§10.2: legacy getPref decodes the written bytes").toEqual(order);
  const exported = exportDeviceRecoveryData();
  expect(exported.device.records[KEY], "§10.2: the device recovery export copies the raw bytes verbatim").toBe(bytesNow);
});

it("H11 PC a committed order in another document updates an idle rail live; a removal there displays the default", async () => {
  seedOrder(REVERSED);
  await mountApp("/app/tasks");
  const from = mark();
  const other = [...REVERSED].reverse();
  await external(KEY, encode(other));
  expect(railIds(), "H11: the idle rail follows the other document's committed order").toEqual(other);
  expect(status(), "no status for a valid external order").toBeNull();
  await external(KEY, null);
  expect(railIds(), "§3.8: a removal in the other document displays the default").toEqual(DEFAULT_DISPLAY);
  expect(railKeyWrites(from), "following another document makes zero attempts to write").toEqual([]);
  expect(warns(), "no unload warning").toBe(false);
});

it("PC §2 the rail buttons keep their markup: .rail-btn.has-tip with data-tip, aria-label and draggable; the pet button stays outside .rail-items", async () => {
  await mountApp("/app/tasks");
  const buttons = railButtons();
  pre(buttons.length === RAIL_IDS.length, "14 rail buttons");
  expect(buttons.every(button => button.classList.contains("has-tip") && button.getAttribute("data-tip") === button.getAttribute("aria-label") && button.getAttribute("draggable") === "true" && button.getAttribute("type") === "button"), "§2 Preserve: rail button markup").toBe(true);
  expect(document.querySelectorAll(".app-rail .rail-items .rail-btn[aria-label='Pet']").length, "the pet toggle is not a rail item").toBe(0);
  expect(TOGGLEABLE.length, "eight toggleable ids").toBe(8);
});
