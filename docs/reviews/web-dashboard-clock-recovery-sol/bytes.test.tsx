/**
 * Mode `bytes` (contract r2 section 12): all 17 values with exact bytes through the widget; absent defaults; the
 * default value from absence is stored (never removal); display truth for every seeded in-domain value (bytes written
 * by `f9eb4b1` display identically); zero-write mounts of the widget (ticks, language, the popover), of
 * `DashboardModule` with the real registrations, and of the drag ghost; cross-document live update of an idle widget
 * (H7); lifecycle classification of both keys; byte compatibility with the CmdK reader and adapter.
 *
 * Every case in this file is a positive control that must PASS at `f9eb4b1` (contract section 12 "Validity and
 * positive controls"): H7 and H8 are expected to be refuted (PASS).
 */
import { afterEach, beforeEach, expect, it } from "vitest";
import { lifecycleForKey } from "@repo/plugin-web-storage";
import { readModuleStates } from "../../../packages/xai-web-cmdk/src/internal/readModuleStates";
import { dashboardAdapter } from "../../../packages/xai-web-cmdk/src/adapters/dashboard";
import {
  assertSelfCheck, attempts, classicText, clockRoot, clockWrites, closePopover, DASH_ORDER_KEY, DEFAULTS, DOMAIN, endWidgetDrag,
  expectedClassic, expectQuiet, external, fieldWrites, ghostClock, KEY, lockSelfCheck, mark, mountClock, mountModule, moveWidgetDrag,
  NOW, observe, openPopover, popover, pre, productStorageEvents, nonNavigationBus, recorder, region, seed, seedKey, setup, shown,
  shownStyle, shownTz, startWidgetDrag, STYLE_KEY, STYLE_TITLE, STYLES, styleButton, teardown, TZ_KEY, TZ_LABEL, TZS, choose, writes,
  type Field, bytes, flush,
} from "./fixture";

beforeEach(() => { setup(); });
afterEach(() => { teardown(); });

it("FIXTURE F-B002 this file's storage wrappers record and delegate exactly once, never re-enter Storage and never call accountScope helpers", () => {
  assertSelfCheck();
});

it("FIXTURE the Web Lock fixture is exclusive: a test hold makes a product request wait until release", async () => {
  const result = await lockSelfCheck();
  observe("lock self-check", result);
  pre(result.waitedWhileHeld && result.grantedAfter, `lock fixture self-check: ${JSON.stringify(result)}`);
});

// A different in-domain baseline for each value, so every choice is an actual change (seed rule).
const baselineFor = (field: Field, value: string): string => {
  const domain = DOMAIN[field];
  return domain[(domain.indexOf(value) + 1) % domain.length]!;
};

it("H8 §5.1 absent bytes display Classic and Local time with no recovery region; the widget mount writes nothing", async () => {
  const from = mark();
  await mountClock();
  expect({ style: shownStyle(), timezone: shownTz() }, "§5.1 absence displays the defaults").toStrictEqual({ style: "classic", timezone: "local" });
  expect(region(), "§5.7 clean state renders no recovery region").toBeNull();
  expect(writes(from), "H8 §5.1 mounting the widget makes zero set/remove attempts on every key").toEqual([]);
  expect({ style: bytes("style"), timezone: bytes("timezone") }, "absence stays absence").toStrictEqual({ style: null, timezone: null });
  expectQuiet("absent mount");
});

for (const value of STYLES) {
  it(`§10.1 style "${value}" through the UI writes exactly "${value}" and displays it (baseline ${baselineFor("style", value)})`, async () => {
    seed("style", baselineFor("style", value));
    await mountClock();
    const from = mark();
    choose("style", value);
    // Writes may be asynchronous (contract A4); the oracle waits for settlement.
    await flush();
    expect(bytes("style"), `§10.1 exact bytes for style ${value}`).toBe(value);
    expect(fieldWrites(from, "style"), "exactly one set attempt with the exact bytes").toEqual([value]);
    expect(fieldWrites(from, "timezone"), "the sibling key is not written").toEqual([]);
    expect(writes(from).filter(entry => !entry.startsWith(`set:${STYLE_KEY}=`)), "no other key is written").toEqual([]);
    expect(shownStyle(), "§10.3 the face and aria-selected show the stored value").toBe(value);
    expect(region(), "no recovery region after a success").toBeNull();
    expect(productStorageEvents(), "§10.7 zero StorageEvents dispatched").toEqual([]);
    expect(nonNavigationBus(), "§10.7 zero event-bus events").toEqual([]);
    expectQuiet(`style ${value}`);
  });
}

for (const value of TZS) {
  it(`§10.1 timezone "${value}" through the popover writes exactly "${value}", closes the popover and displays it (baseline ${baselineFor("timezone", value)})`, async () => {
    seed("timezone", baselineFor("timezone", value));
    await mountClock();
    const from = mark();
    choose("timezone", value);
    await flush();
    expect(bytes("timezone"), `§10.1 exact bytes for timezone ${value}`).toBe(value);
    expect(fieldWrites(from, "timezone"), "exactly one set attempt with the exact bytes").toEqual([value]);
    expect(fieldWrites(from, "style"), "the sibling key is not written").toEqual([]);
    expect(writes(from).filter(entry => !entry.startsWith(`set:${TZ_KEY}=`)), "no other key is written").toEqual([]);
    expect(popover(), "§2 preserve: the popover closes after a choice").toBeNull();
    expect(shownTz(), "§10.3 the trigger label and .clock-sub show the stored value").toBe(value);
    expect(classicText(), "§10.3 the displayed time follows the timezone (static offsets)").toBe(expectedClassic(value));
    expect(region(), "no recovery region after a success").toBeNull();
    expect(productStorageEvents(), "§10.7 zero StorageEvents dispatched").toEqual([]);
    expect(nonNavigationBus(), "§10.7 zero event-bus events").toEqual([]);
    expectQuiet(`timezone ${value}`);
  });
}

it("§5.4 choosing a value equal to the default from absence stores it (never converted to removal)", async () => {
  await mountClock();
  const from = mark();
  choose("style", "classic");
  await flush();
  choose("timezone", "local");
  await flush();
  expect({ style: bytes("style"), timezone: bytes("timezone") }, "§5.4 the defaults are stored as bytes").toStrictEqual({ style: "classic", timezone: "local" });
  expect(clockWrites(from), "exactly one set per key, no removal").toEqual([`set:${STYLE_KEY}=classic`, `set:${TZ_KEY}=local`]);
  expect(region()).toBeNull();
  expectQuiet("default from absence");
});

for (const field of ["style", "timezone"] as const) {
  for (const value of DOMAIN[field]) {
    it(`§10.2 bytes written by f9eb4b1 display identically: seeded ${KEY[field]}="${value}" displays "${value}" with zero writes`, async () => {
      seed(field, value);
      const from = mark();
      await mountClock();
      expect(shown(field), `§10.2 seeded ${value} displays`).toBe(value);
      expect(shown(field === "style" ? "timezone" : "style"), "the absent sibling displays its default").toBe(DEFAULTS[field === "style" ? "timezone" : "style"]);
      if (field === "timezone") expect(classicText(), "the displayed time follows the seeded timezone").toBe(expectedClassic(value));
      expect(region(), "a valid seed is clean").toBeNull();
      expect(writes(from), "H8 zero writes on mount").toEqual([]);
      expectQuiet(`seed ${field} ${value}`);
    });
  }
}

it("§10.3 ZH labels: the style buttons' accessible names and the timezone labels are the protected tokens", async () => {
  seed("timezone", "shanghai");
  await mountClock({ lang: "zh" });
  for (const id of STYLES) expect(styleButton(id).getAttribute("title"), `ZH title of ${id}`).toBe(STYLE_TITLE.zh[id]);
  expect((clockRoot().querySelector(".clock-sub")?.textContent ?? "").trim()).toBe(TZ_LABEL.zh.shanghai);
  const open = openPopover();
  expect((open.querySelector('.popover-item[data-tz-id="local"]')?.textContent ?? "").includes(TZ_LABEL.zh.local)).toBe(true);
  closePopover();
  expectQuiet("zh labels");
});

it("H8 §5.1 ticks, a language change and opening/closing the popover make zero writes on every key", async () => {
  seed("style", "analog");
  seed("timezone", "tokyo");
  const view = await mountClock();
  const from = mark();
  for (let second = 1; second <= 3; second += 1) await view.setNow(new Date(NOW.getTime() + second * 1000));
  await view.setLang("zh");
  await view.setLang("en");
  openPopover();
  closePopover();
  expect(popover(), "the scrim click closes the popover").toBeNull();
  openPopover();
  closePopover();
  expect(writes(from), "H8 zero set/remove attempts").toEqual([]);
  expect({ style: shownStyle(), timezone: shownTz() }).toStrictEqual({ style: "analog", timezone: "tokyo" });
  expect(region()).toBeNull();
  expectQuiet("ticks and popover");
});

it("H8 §5.1 mounting DashboardModule with the real registrations makes zero writes (with and without a departure registration)", async () => {
  seedKey(DASH_ORDER_KEY, JSON.stringify(["clock"]));
  seed("style", "split");
  const from = mark();
  const plain = await mountModule();
  expect(shownStyle(), "the Clock renders inside the module").toBe("split");
  plain.unmount();
  const record = recorder();
  await mountModule({ record });
  expect(writes(from), "H8 zero set/remove attempts on every key across both module mounts").toEqual([]);
  expect(region()).toBeNull();
  expectQuiet("module mount");
});

it("H8 §7.7 the drag ghost renders the committed bytes and makes zero writes over a widget drag", async () => {
  seedKey(DASH_ORDER_KEY, JSON.stringify(["clock"]));
  seed("style", "analog");
  seed("timezone", "tokyo");
  await mountModule();
  const from = mark();
  await startWidgetDrag();
  const ghost = ghostClock();
  pre(ghost, "the ghost renders a second Clock instance");
  expect({ style: shownStyle(ghost), timezone: shownTz(ghost) }, "§7.7 the ghost displays the committed bytes").toStrictEqual({ style: "analog", timezone: "tokyo" });
  await moveWidgetDrag();
  await endWidgetDrag();
  observe("ghost read attempts on the Clock keys during the drag (recorded, not asserted; matrix row 9)", attempts(from, [STYLE_KEY, TZ_KEY], ["get"]).length);
  expect(writes(from), "H8 §7.7 zero set/remove attempts over the whole widget drag").toEqual([]);
  expect({ style: shownStyle(), timezone: shownTz() }, "the source widget is unchanged").toStrictEqual({ style: "analog", timezone: "tokyo" });
  expectQuiet("ghost");
});

it("H7 §10.5 an idle Clock follows committed changes and removals from another document live, with zero writes", async () => {
  seed("style", "classic");
  seed("timezone", "local");
  await mountClock();
  const from = mark();
  await external(STYLE_KEY, "split");
  await external(TZ_KEY, "paris");
  expect({ style: shownStyle(), timezone: shownTz() }, "H7 both fields follow the other document").toStrictEqual({ style: "split", timezone: "paris" });
  await external(STYLE_KEY, null);
  await external(TZ_KEY, null);
  expect({ style: shownStyle(), timezone: shownTz() }, "H7 a removal displays the defaults").toStrictEqual({ style: "classic", timezone: "local" });
  expect(writes(from), "H7 zero writes while following").toEqual([]);
  expect(region(), "no recovery region for an idle widget").toBeNull();
  expectQuiet("cross-document");
});

it("§10.11 lifecycleForKey classifies both keys as device-preference, device-recovery, retain and retain-on-device", () => {
  for (const key of [STYLE_KEY, TZ_KEY]) {
    const lifecycle = lifecycleForKey(key);
    expect({ ownership: lifecycle.ownership, dataClass: lifecycle.dataClass, exportScope: lifecycle.exportScope, accountDeletion: lifecycle.accountDeletion, legacyMigration: lifecycle.legacyMigration }, `lifecycle of ${key}`)
      .toStrictEqual({ ownership: "device", dataClass: "device-preference", exportScope: "device-recovery", accountDeletion: "retain", legacyMigration: "retain-on-device" });
  }
});

it("§10.2 byte compatibility: values chosen through the UI are read back by the unchanged CmdK reader, and a style query finds the Clock", async () => {
  seed("style", "classic");
  seed("timezone", "local");
  await mountClock();
  choose("style", "analog");
  await flush();
  choose("timezone", "new_york");
  await flush();
  pre(bytes("style") === "analog" && bytes("timezone") === "new_york", "the choices reached storage");
  const states = readModuleStates() as unknown as { dashboard: { clockStyle: unknown; clockTz: unknown } };
  expect({ clockStyle: states.dashboard.clockStyle, clockTz: states.dashboard.clockTz }, "§10.2 CmdK reads the committed bytes").toStrictEqual({ clockStyle: "analog", clockTz: "new_york" });
  const hits = dashboardAdapter("analog", states.dashboard as never).map(hit => hit.id);
  expect(hits, "a style query finds the Clock").toContain("dashboard:clock");
  expectQuiet("cmdk");
});
