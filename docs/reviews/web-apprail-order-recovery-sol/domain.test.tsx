/**
 * Mode `domain` (contract r1 section 12): every section 5 item 2 value at load on the three host-row-a routes (no
 * route error, the default display, the source status with Reload only, zero writes; H1, H7, H8, H10); a drag over
 * malformed bytes (a refused failed draft, Retry refused again, Discard back to the default display, bytes
 * unchanged); a malformed value written by a second document while the App runs, idle and drafted; Reload after an
 * external repair. Malformed seeds come only from the section 5 item 2 table (seed rule).
 *
 * Composition: the production route table in a memory router; only `useWebAuthSession` is substituted.
 */
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { fireEvent, within } from "@testing-library/react";
import {
  actionsShown, closePanel, configureApp, configureRegistrations, DEFAULT_ORDER, displayOf, drag, encode, external, failedDrop, fault, fired,
  flush, go, KEY, mark, message, messageRole, mountApp, nativeSet, need, observe, openPanel, panelAction, pre, RAIL_IDS, railIds, railSuccessClaim,
  railWrites, raw, REVERSED, ROUTES, routeError, runtimeErrors, seedKey, seedMalformed, seedOrder, SELF_CHECK_DELEGATION, setup, status,
  statusNamed, storageSelfCheck, teardown, uiLang, W, warns, writes,
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

const DEFAULT_DISPLAY = displayOf(DEFAULT_ORDER, RAIL_IDS);

it("FIXTURE F-B002 this file's storage wrappers record and delegate exactly once, never re-enter Storage and never call accountScope helpers", () => {
  const result = storageSelfCheck();
  observe("F-B002 self-check", result);
  pre(result.nested === 0 && result.tripwire === 0 && JSON.stringify(result.delegatedPerCall) === JSON.stringify(SELF_CHECK_DELEGATION), `F-B002 self-check: ${JSON.stringify(result)}`);
});

/** Contract section 5 item 2, with the hypothesis each class tests at the before product. */
const TABLE: ReadonlyArray<{ readonly bytes: string; readonly hypothesis: "H1" | "H7" | "H8"; readonly cls: string }> = [
  { bytes: "{}", hypothesis: "H1", cls: "not iterable" },
  { bytes: '{"tasks":1}', hypothesis: "H1", cls: "not iterable" },
  { bytes: "1", hypothesis: "H1", cls: "not iterable" },
  { bytes: "0", hypothesis: "H1", cls: "not iterable" },
  { bytes: "-1", hypothesis: "H1", cls: "not iterable" },
  { bytes: "true", hypothesis: "H1", cls: "not iterable" },
  { bytes: "false", hypothesis: "H1", cls: "not iterable" },
  { bytes: '"tasks"', hypothesis: "H7", cls: "a string" },
  { bytes: "[1]", hypothesis: "H7", cls: "a non-string element" },
  { bytes: '["tasks",2]', hypothesis: "H7", cls: "a non-string element" },
  { bytes: "[null]", hypothesis: "H7", cls: "a non-string element" },
  { bytes: '[["tasks"]]', hypothesis: "H7", cls: "a non-string element" },
  { bytes: '["tasks","tasks"]', hypothesis: "H8", cls: "a repeated string" },
  { bytes: '["board","tasks","board"]', hypothesis: "H8", cls: "a repeated string" },
  { bytes: "null", hypothesis: "H7", cls: "null literal" },
  { bytes: "[tasks", hypothesis: "H7", cls: "unparsable" },
  { bytes: "", hypothesis: "H7", cls: "unparsable (empty string)" },
];

/** The source state on the current route: no throw, default display, source status with Reload only. */
function expectSourceState(tag: string, route: string, openThePanel: boolean): void {
  expect(routeError(), `${tag}: ${route} must not render the route error boundary`).toBeNull();
  const shown = railIds();
  expect(shown, `${tag}: ${route} displays D(DEFAULT_RAIL_ORDER, R) (no duplicate, no filtered remainder)`).toEqual(DEFAULT_DISPLAY);
  const button = need(statusNamed("source"), `${tag}: ${route} shows the Topbar rail status with the source accessible name "${W[uiLang()].statusSource}"`);
  expect(button.getAttribute("aria-controls"), `${tag}: the status controls the panel`).toBe("rail-order-panel");
  if (openThePanel) {
    openPanel(tag);
    expect(message(), `${tag}: the source message`).toBe(W[uiLang()].unavailable);
    expect(messageRole(), `${tag}: the source message is an alert`).toBe("alert");
    expect(actionsShown(), `${tag}: Reload only`).toEqual(["reload"]);
    panelAction("reload", tag);
    closePanel();
  }
  expect(railSuccessClaim(), `${tag}: no success claim`).toBe(false);
  expect(warns(), `${tag}: no unload warning in a source-only state`).toBe(false);
}

for (const entry of TABLE) {
  it(`${entry.hypothesis} §5.2 ${JSON.stringify(entry.bytes)} (${entry.cls}) at load: no route error on the three routes, the default display, the source status with Reload only, zero writes`, async () => {
    seedMalformed(entry.bytes);
    const from = mark();
    const first = await mountApp(ROUTES[0]);
    // Iteration 2 (observation only): what every host-row-a route and a reload show, recorded before any assertion.
    const sweep: Array<{ route: string; routeError: string | null; rail: string[] | null; status: boolean }> = [];
    const look = (route: string) => { sweep.push({ route, routeError: routeError(), rail: routeError() ? null : railIds(), status: status() !== null }); };
    for (const [index, route] of ROUTES.entries()) {
      if (index > 0) await go(first, route);
      look(route);
    }
    first.unmount();
    const app = await mountApp(ROUTES[1]);
    look(`${ROUTES[1]} after a reload`);
    observe(`at load ${JSON.stringify(entry.bytes)}`, sweep);
    for (const [index, route] of ROUTES.entries()) {
      await go(app, route);
      expectSourceState(`${entry.hypothesis} ${JSON.stringify(entry.bytes)}`, route, index === 0);
    }
    expect(railWrites(from), "§5.2: mount and navigation never rewrite, purge or normalize the bytes").toEqual([]);
    expect(raw(), "§5.2: the malformed bytes are unchanged").toBe(entry.bytes);
  });
}

it("H10 §5.2 a throwing getItem(xai_rail_order) at load: the default display, the source status with Reload only, zero writes", async () => {
  seedOrder(REVERSED);
  const unreadable = fault({ op: "get", key: KEY, label: "xai_rail_order unreadable" });
  const from = mark();
  const app = await mountApp(ROUTES[0]);
  fired(unreadable, "the rail-order read");
  observe("unreadable at load", { routeError: routeError(), rail: railIds() });
  for (const [index, route] of ROUTES.entries()) {
    if (index > 0) await go(app, route);
    expectSourceState("H10 unreadable", route, index === 0);
  }
  expect(railWrites(from), "§5.2: zero writes").toEqual([]);
  expect(raw(), "the bytes are unchanged").toBe(encode(REVERSED));
});

it("H1 §5.2 the source status and panel in Chinese for `{}`", async () => {
  seedMalformed("{}");
  seedKey("xai_pref_lang", JSON.stringify("zh"));
  await mountApp("/app/tasks");
  expect(routeError(), "H1: no route error").toBeNull();
  pre(uiLang() === "zh", "the UI is in Chinese");
  need(statusNamed("source", "zh"), `the ZH source accessible name "${W.zh.statusSource}"`);
  const root = openPanel("ZH");
  expect(root.getAttribute("role"), "the panel is a dialog").toBe("dialog");
  expect((within(document.body).queryAllByRole("dialog", { name: W.zh.panel }) as HTMLElement[]).includes(root), `the panel's accessible name is "${W.zh.panel}"`).toBe(true);
  expect(message(), "the ZH source message").toBe(W.zh.unavailable);
  const reload = panelAction("reload", "ZH", "zh");
  expect((reload.textContent ?? "").includes(W.zh.reload.label), `visible label "${W.zh.reload.label}"`).toBe(true);
});

// ---------------------------------------------------------------------------
// A5: a drag over malformed bytes is actual work, never a silent overwrite
// ---------------------------------------------------------------------------

async function dragOverSource(tag: string, check: () => void): Promise<void> {
  check();
  const from = mark();
  const before = raw();
  const initial = railIds();
  const order = await drag(initial[0]!, [initial[3]!]);
  check();
  expect(raw(), `${tag}: the malformed bytes are never overwritten by a drag`).toBe(before);
  expect(initial, `${tag}: the drag started from D(DEFAULT_RAIL_ORDER, R)`).toEqual(DEFAULT_DISPLAY);
  expect(railIds(), `${tag}: the dropped order stays displayed as a draft`).toEqual(order);
  need(statusNamed("draft"), `${tag}: the status shows the draft accessible name "${W.en.statusDraft}" once the refused set settled`);
  openPanel(tag);
  expect(message(), `${tag}: "${W.en.notSaved}"`).toBe(W.en.notSaved);
  expect(actionsShown(), `${tag}: Retry, Discard and Export for a draft; no Reload while a draft exists (§5.7)`).toEqual(["retry", "discard", "export"]);
  expect(warns(), `${tag}: the unload warning while the draft exists`).toBe(true);
  expect(railSuccessClaim(), `${tag}: no success claim`).toBe(false);
  const retryFrom = mark();
  fireEvent.click(panelAction("retry", tag));
  await flush();
  expect(railWrites(retryFrom), `${tag}: Retry is refused again with zero set attempts`).toEqual([]);
  expect(railIds(), `${tag}: the draft is still displayed after the refused Retry`).toEqual(order);
  expect(message(), `${tag}: still "${W.en.notSaved}"`).toBe(W.en.notSaved);
  const discardFrom = mark();
  fireEvent.click(panelAction("discard", tag));
  await flush();
  expect(railWrites(discardFrom), `${tag}: Discard makes zero set or remove attempts`).toEqual([]);
  expect(railIds(), `${tag}: Discard returns to the default display`).toEqual(DEFAULT_DISPLAY);
  need(statusNamed("source"), `${tag}: after Discard the source status returns (rule b)`);
  expect(warns(), `${tag}: no unload warning after Discard`).toBe(false);
  expect(railWrites(from), `${tag}: zero set or remove attempts over the whole case`).toEqual([]);
  expect(raw(), `${tag}: the bytes are unchanged`).toBe(before);
}

it("H1 A5 a drag over `{}` is a refused failed draft: Retry refused again, Discard back to the default display, bytes unchanged", async () => {
  seedMalformed("{}");
  await mountApp("/app/tasks");
  await dragOverSource("H1 A5 {}", () => { expect(routeError(), "H1: no route error before or after the drag").toBeNull(); });
});

it("H7 A5 a drag over `[1]` never overwrites the malformed bytes: a refused failed draft with Retry, Discard and Export", async () => {
  seedMalformed("[1]");
  await mountApp("/app/tasks");
  await dragOverSource("H7 A5 [1]", () => undefined);
});

it("H8 A5 a drag over `[\"tasks\",\"tasks\"]` never overwrites the malformed bytes", async () => {
  seedMalformed('["tasks","tasks"]');
  await mountApp("/app/tasks");
  await dragOverSource("H8 A5 duplicate", () => undefined);
});

it("H10 A5 a drag over an unreadable source is a failed draft, never a silent no-op", async () => {
  seedOrder(REVERSED);
  const unreadable = fault({ op: "get", key: KEY, label: "xai_rail_order unreadable" });
  await mountApp("/app/tasks");
  fired(unreadable, "the rail-order read");
  const from = mark();
  const initial = railIds();
  const order = await drag(initial[0]!, [initial[3]!]);
  expect(railIds(), "H10: the dropped order stays displayed as a draft").toEqual(order);
  expect(initial, "H10: the drag started from the default display").toEqual(DEFAULT_DISPLAY);
  need(statusNamed("draft"), "H10: the draft status");
  openPanel("H10 drag");
  expect(actionsShown(), "H10: Retry, Discard and Export").toEqual(["retry", "discard", "export"]);
  expect(railWrites(from).filter(entry => !entry.endsWith("!")), "H10: nothing is written while the source is unreadable").toEqual([]);
  expect(raw(), "the bytes are unchanged").toBe(encode(REVERSED));
});

// ---------------------------------------------------------------------------
// Section 10 item 4: malformed values written by a second document while the App runs
// ---------------------------------------------------------------------------

for (const bytes of ["{}", "1", '["tasks","tasks"]', "[1]"]) {
  it(`§10.4 ${JSON.stringify(bytes)} written by another document while the rail is idle: no throw, the default display, the source status, zero writes`, async () => {
    seedOrder(REVERSED);
    await mountApp("/app/tasks");
    pre(JSON.stringify(railIds()) === JSON.stringify(REVERSED), "the idle rail shows the committed custom order");
    const from = mark();
    await external(KEY, bytes);
    observe(`external ${JSON.stringify(bytes)}`, { routeError: routeError(), rail: routeError() ? null : railIds() });
    expect(routeError(), "§10.4/H1: the running App must not render the route error boundary").toBeNull();
    expect(railIds(), "§10.4: the default display").toEqual(DEFAULT_DISPLAY);
    need(statusNamed("source"), "§10.4: the source status");
    expect(railWrites(from), "§10.4: zero writes").toEqual([]);
    expect(raw(), "the other document's bytes are preserved").toBe(bytes);
    expect(runtimeErrors, "zero runtime errors").toEqual([]);
  });
}

it("§10.4 `{}` written by another document over a failed draft becomes a preserved conflict: Retry refused, bytes kept, Discard shows the source state", async () => {
  seedOrder(REVERSED);
  await mountApp("/app/tasks");
  const { order, quota } = await failedDrop(REVERSED[0]!, [REVERSED[4]!]);
  fired(quota, "the rail write");
  expect(railIds(), "H2: the failed drop stays displayed").toEqual(order);
  quota.off();
  await external(KEY, "{}");
  expect(routeError(), "§10.4: no route error").toBeNull();
  expect(railIds(), "§10.4: the drafted order stays displayed").toEqual(order);
  need(statusNamed("draft"), "§10.4: the draft status is kept");
  const from = mark();
  fireEvent.click(panelAction("retry", "§10.4 conflict"));
  await flush();
  fireEvent.click(panelAction("retry", "§10.4 conflict again"));
  await flush();
  expect(railWrites(from), "§10.4/§5.5: repeated Retry never gains authority to overwrite").toEqual([]);
  expect(raw(), "the other document's malformed bytes are preserved").toBe("{}");
  fireEvent.click(panelAction("discard", "§10.4 conflict"));
  await flush();
  expect(railWrites(from), "Discard makes zero attempts").toEqual([]);
  expect(railIds(), "Discard returns to the default display").toEqual(DEFAULT_DISPLAY);
  need(statusNamed("source"), "the source status after Discard");
});

// ---------------------------------------------------------------------------
// Section 5 item 7 / host row p: Reload after an external repair
// ---------------------------------------------------------------------------

it("H1 §5.7 an external repair behind the App, then Reload: the status disappears and the committed order displays, with no write", async () => {
  seedMalformed("{}");
  await mountApp("/app/tasks");
  expect(routeError(), "H1: no route error").toBeNull();
  need(statusNamed("source"), "H1: the source status before the repair");
  nativeSet.call(localStorage, KEY, encode(REVERSED));
  pre(raw() === encode(REVERSED), "the repair is present (no event: an unobserved external change)");
  const from = mark();
  fireEvent.click(panelAction("reload", "§5.7 Reload"));
  await flush();
  expect(writes(from).filter(entry => entry.includes(KEY)), "§5.7: Reload makes zero set or remove attempts").toEqual([]);
  expect(status(), "§5.7: the status disappears").toBeNull();
  expect(railIds(), "§5.7: the committed order displays").toEqual([...REVERSED]);
});

it("H7 §5.7 a repair committed by another document over `\"tasks\"`, then Reload if offered: the committed order displays, no status, no write", async () => {
  seedMalformed('"tasks"');
  await mountApp("/app/tasks");
  need(statusNamed("source"), "H7: the source status before the repair");
  const from = mark();
  await external(KEY, encode(REVERSED));
  if (status()) {
    fireEvent.click(panelAction("reload", "§5.7 Reload after an observed repair"));
    await flush();
  }
  expect(status(), "§5.7: no status after the repair").toBeNull();
  expect(railIds(), "§5.7: the committed order displays").toEqual([...REVERSED]);
  expect(railWrites(from), "§5.7: zero writes").toEqual([]);
});
