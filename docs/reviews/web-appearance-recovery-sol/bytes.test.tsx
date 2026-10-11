/**
 * Mode `bytes` (contract r3 section 12): all 40 values of section 10 item 1 with exact bytes through the production
 * App (33 pane values, 7 Topbar values); absent defaults; zero-write mounts of App, pane and Topbar; the lifecycle
 * classification of the seven keys; byte compatibility with the unchanged readLocalPref, NotFoundPage and
 * AccountStorageGate readers. Also the fixture-validity proofs (F-B002 self-check, Web Lock fixture, harness).
 *
 * Almost every case here is a positive control that must PASS at 5cd63ff and on the fixed product. Composition:
 * the production route table in a memory router; only `useWebAuthSession` is substituted (account A, no network).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import {
  accountScope, generationKey, LOCAL_KEY_OWNERSHIP, lifecycleForKey, ownershipForKey, prefMutationLockName, PREF_REGISTRY,
} from "@repo/plugin-web-storage";
import { onWebEvent } from "@repo/xai-web-event-bus";
import {
  ACCENT, ACCENT_SLIDER_VALUES, appRailPos, applied, appliedFor, attempts, BG, bus, byId, bytes, bytesAll, choose, chooseTopbar, closeTopbar,
  confirmer, configureApp, createLockManager, DENSITY, denyAllStorage, dispatched, download, enc, external, fault, FIELDS, flush, FONT,
  go, hold, KEYS, LANG, lockState, locks, mark, media, mountApp, nativeGet, nativeSet, networkAttempts, observe, openTopbar, OWNER_A, OWNER_B,
  pane, pre, RAIL, readout, rejections, routeError, seedValue, SELF_CHECK_DELEGATION, setSlider, setSystemDark, setup, shown,
  storageSelfCheck, store, summaryFor, teardown, THEME, TONE_HUE, topbarChecked, topbarSummary, uiLang, unload, VALUES, writes,
  type Field, type FieldId, type Value,
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
import { readLocalPref } from "../../../apps/web/src/App";
import { NotFoundPage } from "../../../apps/web/src/pages/NotFoundPage";
import { AccountStorageGate } from "../../../apps/web/src/providers/AccountStorageGate";

configureApp(webHostRouteObjects);
beforeEach(() => {
  setup();
  auth.state.calls = 0;
  auth.value.state = "authenticated";
});
afterEach(() => { teardown(); });

/** A different valid value to start from, so that the choice is a real change. */
function baselineFor(field: Field, value: Value): Value {
  const candidates = field.id === "accentHue" ? [...VALUES.accentHue, ...ACCENT_SLIDER_VALUES] : VALUES[field.id];
  const other = candidates.find(candidate => enc(field, candidate) !== enc(field, value));
  pre(other !== undefined, `a baseline other than ${String(value)} exists for ${field.id}`);
  return other;
}
/** A range input only reports a change to a different value: move to another stop first when needed. */
async function slide(field: Field, value: Value): Promise<void> {
  if (shown(field) === value) {
    setSlider(field, field === FONT ? (value === 1.05 ? 1.1 : 1.05) : (value === 200 ? 210 : 200));
    await flush();
  }
  setSlider(field, value);
}
const displayedAll = (): Record<FieldId, Value | string> => Object.fromEntries(FIELDS.map(field => [field.id, shown(field)])) as Record<FieldId, Value | string>;
const appliedAll = (): Record<FieldId, Value | string | null> => Object.fromEntries(FIELDS.map(field => [field.id, applied(field)])) as Record<FieldId, Value | string | null>;
const DEFAULTS: Record<FieldId, Value> = { lang: "en", theme: "light", density: "comfortable", fontScale: 1, accentHue: 165, railPos: "left", bgTone: "default" };
/** Read fault state through calls so that TypeScript does not narrow mutable counters between steps. */
const firedCount = (entry: { fired: number }): number => entry.fired;
const armedOf = (entry: { armed: boolean }): boolean => entry.armed;
const ALL_ABSENT: Record<FieldId, null> = { lang: null, theme: null, density: null, fontScale: null, accentHue: null, railPos: null, bgTone: null };

// ---------------------------------------------------------------------------
// Fixture validity (FIXTURE cases use PRECONDITION failures only)
// ---------------------------------------------------------------------------

it("FIXTURE F-B002 the storage wrappers record and delegate exactly once, never re-enter Storage and never call accountScope helpers", () => {
  const result = storageSelfCheck();
  observe("F-B002 self-check", result);
  pre(result.nested === 0, `no nested Storage call from inside a wrapper (got ${result.nested})`);
  pre(result.tripwire === 0, `no accountScope.physicalKey/capture call from inside a wrapper (got ${result.tripwire})`);
  pre(JSON.stringify(result.delegatedPerCall) === JSON.stringify(SELF_CHECK_DELEGATION), `each wrapper delegated exactly once and faulted attempts never delegated: ${JSON.stringify(result.delegatedPerCall)}`);
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
  localStorage.setItem("probe", "3");
  pre(nativeGet.call(localStorage, "probe") === "3", "a one-shot fault stops after firing");
  const afterRemove = fault({ op: "get", key: "probe", times: 1, after: { op: "remove", key: "probe" }, label: "read after remove" });
  pre(localStorage.getItem("probe") === "3" && firedCount(afterRemove) === 0, "an after-remove read fault stays unarmed before the removal");
  localStorage.removeItem("probe");
  let readThrew = false;
  try { localStorage.getItem("probe"); } catch { readThrew = true; }
  pre(readThrew && firedCount(afterRemove) === 1, "the after-remove read fault fires once after the removal");
  nativeSet.call(localStorage, "probe", "4");
  const removal = fault({ op: "remove", key: "probe", times: 1, label: "remove refused" });
  try { localStorage.removeItem("probe"); } catch { /* by design */ }
  pre(removal.fired === 1 && nativeGet.call(localStorage, "probe") === "4", "a faulted removeItem never removes");
  const afterSet = fault({ op: "get", key: "probe", times: 1, after: { op: "set", key: "probe", value: "5" }, label: "read after set" });
  localStorage.setItem("probe", "6");
  pre(armedOf(afterSet) === false, "an after-set fault keyed to a value stays unarmed for another value");
  localStorage.setItem("probe", "5");
  pre(armedOf(afterSet) === true, "the after-set fault arms after its exact value");
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
  const shared: string[] = [];
  let openShared!: () => void;
  const sharedGate = new Promise<void>(resolve => { openShared = resolve; });
  const s1 = manager.api.request("s", { mode: "shared" }, async () => { shared.push("s1"); await sharedGate; });
  const s2 = manager.api.request("s", { mode: "shared" }, async () => { shared.push("s2"); await sharedGate; });
  const ex = manager.api.request("s", { mode: "exclusive" }, async () => { shared.push("ex"); });
  await flush(2);
  pre(JSON.stringify(shared) === JSON.stringify(["s1", "s2"]), "shared holders coexist while an exclusive request waits");
  openShared();
  await Promise.all([s1, s2, ex]);
  pre(shared.at(-1) === "ex", "the exclusive request runs after the shared holders");
  manager.deny("d");
  let rejected = false;
  try { await manager.api.request("d", async () => undefined); } catch { rejected = true; }
  pre(rejected && manager.rejectedFor("d") === 1, "a denied name rejects the product request");
  // Programmed hold: grant one acquisition normally, hold the next.
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
  // A programmed hold never shares a name another holder already holds.
  let openBusy!: () => void;
  const busyGate = new Promise<void>(resolve => { openBusy = resolve; });
  const holder = manager.api.request("q", async () => { await busyGate; });
  await flush(2);
  pre(manager.heldBy("q") === "product", "a product request holds q");
  const busyPlan = manager.plan("q", 0);
  const queued: string[] = [];
  const queuedRequest = manager.api.request("q", async () => { queued.push("queued"); });
  await flush(2);
  pre(busyPlan.triggered && !busyPlan.held, "the programmed hold waits while another holder holds the name (exclusive semantics)");
  openBusy();
  await holder;
  await flush(2);
  pre(busyPlan.held && manager.heldBy("q") === "test" && queued.length === 0, "the programmed hold engages once the name frees and the product request waits behind it");
  await busyPlan.release();
  await queuedRequest;
  pre(JSON.stringify(queued) === JSON.stringify(["queued"]), "the waiting product request is granted after the programmed hold");
  pre(locks() === lockState.manager, "the per-test manager is installed as navigator.locks");
  const named = prefMutationLockName(THEME.key);
  const testHold = await hold(named);
  pre(locks().heldBy(named) === "test", "the test can exclusively hold a real per-key lock name");
  await testHold.release();
  lockState.missing = true;
  pre(navigator.locks === undefined, "the missing capability is explicit");
  lockState.missing = false;
  pre(navigator.locks !== undefined, "the capability is restored");
});

it("FIXTURE accountScope transitions, confirm recorder, StorageEvent counter, bus spy, unload probe, download harness and media query are observable", async () => {
  const a = accountScope.capture();
  pre(a.kind === "account" && a.accountId === OWNER_A, "setup activated account A");
  nativeSet.call(localStorage, `xai:account:v1:${OWNER_B}:committed-generation`, JSON.stringify({ generation: "g1", migrationId: "appearance-sol", previous: null }));
  const b = accountScope.activate(accountScope.lock(OWNER_B), "g1");
  pre(b.epoch > a.epoch && accountScope.physicalKey(THEME.key) === THEME.key && generationKey(OWNER_B, "g1", "xai_task_cols").startsWith("xai:account:v1:"), "a real A→B transition advances the epoch while device keys stay unscoped");
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
  pre(window.matchMedia("(prefers-color-scheme: dark)").matches === false, "the media query starts light");
  setSystemDark(true);
  pre(window.matchMedia("(prefers-color-scheme: dark)").matches === true && media.dark, "the media query is controllable");
  pre(seen.length === 0 && rejections.length === 0, "no stray events or rejections");
});

it("FIXTURE the production App mounts at /app/settings/appearance with only the auth-session hook substituted, real modules and no network", async () => {
  const app = await mountApp();
  pre(auth.state.calls > 0, "the substituted useWebAuthSession served the production App and its gates");
  pre(routeError() === null, "no route error at a clean mount");
  pre(pane() !== null && document.querySelector(".settings-detail[data-pane='appearance']") !== null, "the real Appearance pane renders in the production Settings detail");
  pre(document.querySelector("header.topbar .topbar-pref-trigger") !== null, "the production Topbar renders the appearance trigger");
  pre(document.querySelector(".app-rail") !== null && document.querySelector(".app[data-rail-pos]") !== null, "the production Shell and AppRail render");
  pre(document.querySelector(".pet-wrap") !== null, "the production DesktopPet renders");
  const scope = accountScope.capture();
  pre(scope.kind === "account" && scope.accountId === OWNER_A, "the production AccountDataGate activated account A");
  pre(uiLang() === "en", "the UI starts in English");
  openTopbar();
  closeTopbar();
  pre(app.router.state.location.pathname === "/app/settings/appearance", "the memory router serves the production route table");
  pre(networkAttempts() === 0, `no network request was attempted (${networkAttempts()})`);
});

// ---------------------------------------------------------------------------
// Positive controls: classification, absent defaults, zero-write mounts
// ---------------------------------------------------------------------------

it("PC §2 §10.11 lifecycle: the seven keys are device preferences with device-recovery export, retain and retain-on-device; physical key = logical key", () => {
  for (const field of FIELDS) {
    const lifecycle = lifecycleForKey(field.key);
    expect(ownershipForKey(field.key), `${field.key} ownership`).toBe("device");
    expect(LOCAL_KEY_OWNERSHIP[field.key], `${field.key} has an explicit device entry`).toBe("device");
    expect({ ownership: lifecycle.ownership, dataClass: lifecycle.dataClass, exportScope: lifecycle.exportScope, accountDeletion: lifecycle.accountDeletion, legacyMigration: lifecycle.legacyMigration }, `${field.key} lifecycle`).toStrictEqual({ ownership: "device", dataClass: "device-preference", exportScope: "device-recovery", accountDeletion: "retain", legacyMigration: "retain-on-device" });
    expect(accountScope.physicalKey(field.key), `${field.key} physical key equals the logical key`).toBe(field.key);
    expect(prefMutationLockName(field.key), `${field.key} per-key lock name`).toBe(`xai:pref:v1:${encodeURIComponent(field.key)}`);
  }
  const registry = PREF_REGISTRY as unknown as Record<string, { codec: string; default: unknown } | undefined>;
  expect({ accent: registry.xai_accent_hue?.codec, accentDefault: registry.xai_accent_hue?.default, rail: registry.xai_rail_pos?.codec, railDefault: registry.xai_rail_pos?.default, bg: registry.xai_bg_tone?.codec, bgDefault: registry.xai_bg_tone?.default }, "§2 registry entries of the three registered keys").toStrictEqual({ accent: "number", accentDefault: 165, rail: "string", railDefault: "left", bg: "string", bgDefault: "default" });
  for (const field of [LANG, THEME, DENSITY, FONT]) expect(registry[field.key], `${field.key} stays unregistered (open-ended suffix path, A4)`).toBeUndefined();
});

it("PC §5.1 absence displays and applies every default on the pane, the document and the Topbar", async () => {
  await mountApp();
  expect(displayedAll(), "§5.1 the pane displays the seven defaults").toStrictEqual(DEFAULTS);
  expect(appliedAll(), "§5.1 the document applies the seven defaults").toStrictEqual({ lang: "en", theme: "light", density: "comfortable", fontScale: 1, accentHue: 165, railPos: "left", bgTone: "default" });
  expect(appRailPos(), ".app[data-rail-pos] default").toBe("left");
  expect(readout(ACCENT), "accent readout").toBe("165°");
  expect(readout(FONT), "font scale readout").toBe("100%");
  expect(topbarSummary(), "Topbar summary").toBe(summaryFor("en", "light", "comfortable"));
  expect({ lang: topbarChecked(LANG), theme: topbarChecked(THEME), density: topbarChecked(DENSITY) }, "Topbar checked defaults").toStrictEqual({ lang: "en", theme: "light", density: "comfortable" });
  expect(bytesAll(), "absent stays absent").toStrictEqual(ALL_ABSENT);
});

it("PC §5.1 loading the App on the Appearance route, opening and closing the Topbar popover, unmounting and reloading make zero set/remove attempts on every key (absent)", async () => {
  const from = mark();
  const first = await mountApp();
  openTopbar();
  closeTopbar();
  openTopbar();
  closeTopbar();
  first.unmount();
  await flush();
  const second = await mountApp();
  openTopbar();
  closeTopbar();
  second.unmount();
  await flush();
  expect(writes(from), "§5.1 zero set/remove attempts on every key").toEqual([]);
  expect(bytesAll(), "nothing was written").toStrictEqual(ALL_ABSENT);
});

it("PC §5.1 with valid stored bytes for all seven keys the App mount, popover and reload make zero set/remove attempts on every key", async () => {
  const stored: Record<FieldId, Value> = { lang: "zh", theme: "dark", density: "compact", fontScale: 1.1, accentHue: 230, railPos: "right", bgTone: "mist" };
  for (const field of FIELDS) seedValue(field, stored[field.id]);
  const from = mark();
  const first = await mountApp();
  openTopbar();
  closeTopbar();
  first.unmount();
  await flush();
  await mountApp();
  observe("stored-valid display", { pane: displayedAll(), document: appliedAll(), topbar: topbarSummary() });
  expect(writes(from), "§5.1 zero set/remove attempts on every key").toEqual([]);
  expect(bytesAll(), "stored bytes unchanged").toStrictEqual(Object.fromEntries(FIELDS.map(field => [field.id, enc(field, stored[field.id])])));
});

it("PC §5.1 loading the App on /app/tasks, navigating to the pane and back makes zero set/remove attempts on the seven keys", async () => {
  const from = mark();
  const app = await mountApp("/app/tasks");
  openTopbar();
  closeTopbar();
  await go(app, "/app/settings/appearance");
  await go(app, "/app/tasks");
  observe("other-key writes on /app/tasks (outside the unit)", writes(from).filter(entry => !KEYS.some(key => entry.includes(`:${key}=`) || entry.endsWith(`:${key}`))));
  expect(attempts(from, KEYS, ["set", "remove"]).map(item => `${item.op}:${item.key}`), "§5.1 zero set/remove attempts on the seven keys").toEqual([]);
});

// ---------------------------------------------------------------------------
// Exact bytes for all 40 values (section 10 item 1)
// ---------------------------------------------------------------------------

const paneValues: Array<{ field: FieldId; value: Value; via: "control" | "slider" }> = [
  ...VALUES.lang.map(value => ({ field: "lang" as const, value, via: "control" as const })),
  ...VALUES.theme.map(value => ({ field: "theme" as const, value, via: "control" as const })),
  ...VALUES.density.map(value => ({ field: "density" as const, value, via: "control" as const })),
  ...VALUES.fontScale.map(value => ({ field: "fontScale" as const, value, via: "slider" as const })),
  ...VALUES.accentHue.map(value => ({ field: "accentHue" as const, value, via: "control" as const })),
  ...ACCENT_SLIDER_VALUES.map(value => ({ field: "accentHue" as const, value, via: "slider" as const })),
  ...VALUES.railPos.map(value => ({ field: "railPos" as const, value, via: "control" as const })),
  ...VALUES.bgTone.map(value => ({ field: "bgTone" as const, value, via: "control" as const })),
];

describe("§10.1 pane values (33)", () => {
  it("covers exactly 33 pane values", () => { expect(paneValues.length).toBe(33); });
  it.each(paneValues)("PC §10.1 pane $field=$value ($via) persists exact bytes and displays and applies the choice", async ({ field: id, value, via }) => {
    const field = byId(id);
    if (via === "control") {
      const baseline = baselineFor(field, value);
      seedValue(field, baseline);
      if (field === BG) seedValue(ACCENT, TONE_HUE[String(baseline)]!);
    }
    await mountApp();
    const from = mark();
    if (via === "slider") await slide(field, value);
    else choose(field, value);
    await flush();
    expect(bytes(field), `§10.1 ${field.key} exact bytes`).toBe(enc(field, value));
    if (field === BG) expect(bytes(ACCENT), `§10.1 ${String(value)} pairs its accent bytes`).toBe(enc(ACCENT, TONE_HUE[String(value)]!));
    expect(shown(field), "the pane displays the choice").toBe(value);
    expect(applied(field), "the document applies the choice").toBe(appliedFor(field, value));
    expect(writes(from).filter(entry => entry.endsWith("!threw")), "no write threw").toEqual([]);
  });
});

const topbarValues: Array<{ field: FieldId; value: Value }> = [
  ...VALUES.lang.map(value => ({ field: "lang" as const, value })),
  ...VALUES.theme.map(value => ({ field: "theme" as const, value })),
  ...VALUES.density.map(value => ({ field: "density" as const, value })),
];

describe("§10.1 Topbar values (7)", () => {
  it("covers exactly 7 Topbar values", () => { expect(topbarValues.length).toBe(7); });
  it.each(topbarValues)("PC §10.1 Topbar $field=$value persists exact bytes and the Topbar and document show it", async ({ field: id, value }) => {
    const field = byId(id);
    seedValue(field, baselineFor(field, value));
    await mountApp();
    chooseTopbar(field, value);
    await flush();
    expect(bytes(field), `§10.1 ${field.key} exact bytes`).toBe(enc(field, value));
    expect(topbarChecked(field), "the Topbar shows the choice").toBe(value);
    expect(applied(field), "the document applies the choice").toBe(appliedFor(field, value));
  });
});

describe("§5.4 a value equal to the default is stored, never converted to removal", () => {
  it.each(FIELDS.map(field => ({ id: field.id })))("PC §5.4 $id: choosing the default from absent stores its bytes", async ({ id }) => {
    const field = byId(id);
    await mountApp();
    if (field === FONT) {
      setSlider(FONT, 1.05);
      await flush();
      setSlider(FONT, 1);
    } else {
      choose(field, field.defaultValue);
    }
    await flush();
    expect(bytes(field), `§5.4 ${field.key} stores the default value`).toBe(enc(field, field.defaultValue));
    if (field === BG) expect(bytes(ACCENT), "the Sage tone pairs its accent bytes").toBe("165");
  });
});

// ---------------------------------------------------------------------------
// Byte compatibility with the unchanged readers (section 10 item 2)
// ---------------------------------------------------------------------------

async function gateLanguage(): Promise<string> {
  auth.value.state = "loading";
  const view = render(<AccountStorageGate><div /></AccountStorageGate>);
  await flush(4);
  const status = view.container.querySelector(".account-data-gate [role='status']")?.textContent ?? "";
  view.unmount();
  auth.value.state = "authenticated";
  return status;
}

describe("§10.2 root values written through the App are read identically by the unchanged readers in a new document", () => {
  it.each([LANG, THEME, DENSITY, FONT].map(field => ({ id: field.id })))("PC §10.2 $id: readLocalPref, NotFoundPage (theme) and AccountStorageGate (language) read every written value", async ({ id }) => {
    const field = byId(id);
    for (const value of VALUES[field.id]) {
      seedValue(field, baselineFor(field, value));
      const app = await mountApp();
      if (field === FONT) await slide(FONT, value);
      else choose(field, value);
      await flush();
      pre(bytes(field) === enc(field, value), `the App wrote ${field.key}=${enc(field, value)}`);
      app.unmount();
      await flush();
      expect(readLocalPref(field.key, field.defaultValue), `§10.2 readLocalPref(${field.key}) reads ${String(value)}`).toBe(value);
      if (field === THEME) {
        document.documentElement.removeAttribute("data-theme");
        const page = render(<NotFoundPage />);
        await flush(2);
        expect(document.documentElement.getAttribute("data-theme"), `§10.2 NotFoundPage applies ${String(value)}`).toBe(value === "system" ? (media.dark ? "dark" : "light") : value);
        page.unmount();
      }
      if (field === LANG) {
        expect(await gateLanguage(), `§10.2 AccountStorageGate reads ${String(value)}`).toBe(value === "zh" ? "正在确认账户…" : "Waiting for your account…");
        accountScope.activate(accountScope.lock(OWNER_A), "g1");
      }
    }
  });
});

it("PC §10.5 the registered keys still follow a committed change from another document (accent, rail, background)", async () => {
  await mountApp();
  await external(ACCENT.key, "230");
  await external(RAIL.key, "right");
  await external(BG.key, "mist");
  expect({ accent: applied(ACCENT), rail: applied(RAIL), bg: applied(BG), app: appRailPos() }, "§10.5 registered keys propagate live").toStrictEqual({ accent: 230, rail: "right", bg: "mist", app: "right" });
});

it("§10.3 valid stored bytes are displayed by the pane and the Topbar and applied to the document at mount", async () => {
  const stored: Record<FieldId, Value> = { lang: "zh", theme: "dark", density: "compact", fontScale: 1.1, accentHue: 230, railPos: "right", bgTone: "mist" };
  for (const field of FIELDS) seedValue(field, stored[field.id]);
  await mountApp();
  expect(displayedAll(), "§10.3 the pane displays the stored values").toStrictEqual(stored);
  expect(appliedAll(), "§10.3 the document applies the stored values").toStrictEqual({ lang: "zh", theme: "dark", density: "compact", fontScale: 1.1, accentHue: 230, railPos: "right", bgTone: "mist" });
  expect({ lang: topbarChecked(LANG), theme: topbarChecked(THEME), density: topbarChecked(DENSITY) }, "§10.3 the Topbar shows the stored values").toStrictEqual({ lang: "zh", theme: "dark", density: "compact" });
});
