/**
 * Mode `downstream` (contract section 12): section 10 items 2–6 in a production `App` mount.
 *
 * Composition: the production route table `webHostRouteObjects` (apps/web/src/routes/router.tsx) in a memory
 * router, so `/app/*` renders the production `ProtectedAppRouteElement` → `App` (AccountStorageGate,
 * AccountDataGate, CommandPaletteProvider, WebShellProvider, Shell with AppRail and Topbar, DesktopPet,
 * CommandPalette) and `/app/<module>` renders the production `AppRouteElement` with the production
 * registrations (ComposedSettings with the real Features pane; `withDisabledFallback` route guards).
 *
 * Only the auth-session hook is substituted: `useWebAuthSession` of
 * packages/web-auth-device-session/src/session.tsx returns a synthetic authenticated session for account A
 * with `client: null` and no coordinator. Every importer (App, AccountStorageGate, AppRouteGate) receives it;
 * everything else in that module is the original. There is no network client: fetch, XMLHttpRequest,
 * WebSocket and EventSource are replaced by recorders that refuse. The event bus, storage, shell, pet, CmdK
 * and features modules are real and come from the archive (the runner's module-pin record proves it).
 * jsdom shims: Node's AbortController (router Requests), ResizeObserver, requestAnimationFrame, matchMedia.
 */
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, fireEvent, render, within } from "@testing-library/react";
import { transferableAbortController } from "node:util";
import { createMemoryRouter, RouterProvider } from "react-router";
import { accountScope } from "@repo/plugin-web-storage";
import { onWebEvent } from "@repo/xai-web-event-bus";
import { I18N } from "@repo/plugin-web-tokens";
import { webHostRouteObjects } from "../../../apps/web/src/routes/router";
import { webShellModuleRegistrations } from "../../../apps/web/src/routes/modules/shellRegistrations";
import {
  board, bytes, bytesAll, calendar, confirmer, dashboard, dispatched, fault, featureWrites, FIELDS, fired, flush, habits, hold, IDS, keyLock,
  mark, matrix, meditation, msg, nativeGet, nativeSet, need, nullStorageEvents, OWNER_A, pre, seed, seedKey, setup, tasks, teardown,
  unrelatedSnapshot, W, type Field, type FieldId,
} from "./fixture";

const auth = vi.hoisted(() => {
  const state = { calls: 0 };
  const value = {
    state: "authenticated" as const,
    session: { user: { id: "features-sol-A" } },
    client: null,
    coordinator: undefined,
    authError: null,
    signOutFailed: false,
    reportSignOutFailure: undefined,
    deviceId: null,
    syncVersion: "2026-05",
    refreshSession: async () => null,
    ensureDeviceIdentity: async () => "features-sol-device",
    clearSessionStorage: async () => undefined,
    setSession: () => undefined,
  };
  return { state, value };
});

vi.mock("../../../packages/web-auth-device-session/src/session", async importOriginal => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    useWebAuthSession: () => {
      auth.state.calls += 1;
      return auth.value;
    },
  };
});

// ---------------------------------------------------------------------------
// Harness
// ---------------------------------------------------------------------------

const SETTINGS = "/app/settings/features";
const network = { fetch: 0, xhr: 0, socket: 0, eventSource: 0 };
const routers: Array<ReturnType<typeof createMemoryRouter>> = [];
const NAV = I18N.en.nav as unknown as Record<string, string>;
const RAIL_IDS: string[] = webShellModuleRegistrations.filter(entry => entry.showInRail !== false).map(entry => entry.moduleId);
const CUSTOM_ORDER: string[] = [...RAIL_IDS].reverse();
const labelOfModule = (id: string): string => NAV[id] ?? id;
const allOf = (value: boolean | null | string) => Object.fromEntries(IDS.map(id => [id, value])) as Record<FieldId, boolean | null | string>;

beforeEach(() => {
  setup();
  auth.state.calls = 0;
  network.fetch = 0;
  network.xhr = 0;
  network.socket = 0;
  network.eventSource = 0;
  const root = document.documentElement;
  for (const name of ["data-theme", "data-density", "data-rail-pos", "data-bg-tone"]) root.removeAttribute(name);
  root.style.cssText = "";
  vi.stubGlobal("AbortController", transferableAbortController().constructor);
  vi.stubGlobal("ResizeObserver", class { observe(): void {} unobserve(): void {} disconnect(): void {} });
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => setTimeout(() => callback(performance.now()), 0));
  vi.stubGlobal("cancelAnimationFrame", (handle: number) => clearTimeout(handle));
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: false, media: query, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false }));
  vi.stubGlobal("fetch", () => { network.fetch += 1; return Promise.reject(new TypeError("features-sol: network disabled")); });
  vi.stubGlobal("XMLHttpRequest", class { constructor() { network.xhr += 1; throw new TypeError("features-sol: network disabled"); } });
  vi.stubGlobal("WebSocket", class { constructor() { network.socket += 1; throw new TypeError("features-sol: network disabled"); } });
  vi.stubGlobal("EventSource", class { constructor() { network.eventSource += 1; throw new TypeError("features-sol: network disabled"); } });
});
afterEach(() => {
  try { teardown(); } finally {
    for (const router of routers.splice(0)) router.dispose();
  }
});

interface App { readonly router: ReturnType<typeof createMemoryRouter>; unmount(): void }
async function mountApp(path = SETTINGS): Promise<App> {
  const router = createMemoryRouter(webHostRouteObjects, { initialEntries: [path] });
  routers.push(router);
  const result = render(<RouterProvider router={router} />);
  await flush(24);
  return { router, unmount: () => result.unmount() };
}
async function navigate(app: App, path: string): Promise<void> {
  await act(async () => { await app.router.navigate(path); });
  await flush(12);
}
function pane(): HTMLElement | null {
  return document.querySelector<HTMLElement>('.settings-detail[data-pane="features"] .features-pane');
}
function appSwitch(field: Field): HTMLElement {
  const root = pane();
  pre(root, "the Features pane is mounted in the production Settings detail");
  const found = root.querySelectorAll<HTMLElement>(`[data-feature-id="${field.id}"] [role="switch"]`);
  pre(found.length === 1, `exactly one switch at [data-feature-id="${field.id}"] [role="switch"] (got ${found.length})`);
  return found[0]!;
}
function appShown(field: Field): boolean | string {
  const checked = appSwitch(field).getAttribute("aria-checked");
  return checked === "true" ? true : checked === "false" ? false : `aria-checked:${String(checked)}`;
}
const railLabels = (): string[] => Array.from(document.querySelectorAll<HTMLElement>(".app-rail .rail-items .rail-btn")).map(element => element.getAttribute("aria-label") ?? "");
const inRail = (field: Field): boolean => railLabels().includes(labelOfModule(field.id));
/** The production Settings detail that hosts the Features pane (pane controls and recovery UI live inside it). */
function detail(): HTMLElement {
  const element = document.querySelector<HTMLElement>('.settings-detail[data-pane="features"]');
  pre(element, "the production Settings detail shows the Features pane");
  return element;
}
const appButton = (name: string): HTMLButtonElement | null => (within(detail()).queryAllByRole("button", { name })[0] as HTMLButtonElement | undefined) ?? null;
const says = (message: string): boolean => (document.body.textContent ?? "").replace(/\s+/g, " ").includes(message);
function appReset(answer: boolean): void {
  const found = within(detail()).queryAllByRole("button", { name: W.en.reset });
  pre(found.length === 1, `exactly one "${W.en.reset}" button by role and name in the App (got ${found.length})`);
  confirmer.answer = answer;
  const before = confirmer.calls.length;
  fireEvent.click(found[0]!);
  expect(confirmer.calls.length - before, "§6: one Reset to defaults activation asks window.confirm exactly once").toBe(1);
}
function openPalette(): void {
  act(() => { fireEvent.keyDown(window, { key: "k", code: "KeyK", ctrlKey: true }); });
  pre(document.querySelector(".cmdk-modal") !== null, "the production CmdK palette opened on Ctrl+K");
}
function paletteLabels(): string[] {
  const modal = document.querySelector(".cmdk-modal");
  pre(modal, "the CmdK palette is open");
  return Array.from(modal.querySelectorAll(".cmdk-row-label")).map(element => element.textContent ?? "");
}
function closePalette(): void {
  const scrim = document.querySelector(".cmdk-scrim");
  pre(scrim, "the CmdK scrim is present");
  act(() => { fireEvent.keyDown(scrim, { key: "Escape" }); });
  pre(document.querySelector(".cmdk-scrim") === null, "the CmdK palette closed");
}
function seedAppearanceRailAndPet(): void {
  seedKey("xai_accent_hue", "210");
  seedKey("xai_bg_tone", "sage");
  seedKey("xai_rail_pos", "right");
  seedKey("xai_rail_order", JSON.stringify(CUSTOM_ORDER));
  seedKey("xai_pet_id", "pip");
  seedKey("xai_pet_pos", JSON.stringify({ x: 300, y: 200 }));
}
interface Display { accentHue: string; bgTone: string | null; railPosAttr: string | null; railDataPos: string | null; railOrder: string[]; petAnim: string | null; petTransform: string | null }
function display(): Display {
  const root = document.documentElement;
  const body = document.querySelector<HTMLElement>(".pet-wrap .pet-body");
  return {
    accentHue: root.style.getPropertyValue("--accent-hue"),
    bgTone: root.getAttribute("data-bg-tone"),
    railPosAttr: root.getAttribute("data-rail-pos"),
    railDataPos: document.querySelector(".app-rail")?.getAttribute("data-pos") ?? null,
    railOrder: railLabels(),
    petAnim: body ? Array.from(body.classList).find(name => name.startsWith("pet-anim-")) ?? null : null,
    petTransform: document.querySelector<HTMLElement>(".pet-wrap")?.style.transform ?? null,
  };
}
const SEEDED_DISPLAY: Display = {
  accentHue: "210",
  bgTone: "sage",
  railPosAttr: "right",
  railDataPos: "right",
  railOrder: CUSTOM_ORDER.map(labelOfModule),
  petAnim: "pet-anim-hop",
  petTransform: "translate(300px, 200px)",
};
const APPEARANCE_KEYS = ["xai_accent_hue", "xai_bg_tone", "xai_rail_pos", "xai_rail_order", "xai_pet_id", "xai_pet_pos"];
const appearanceBytes = () => Object.fromEntries(APPEARANCE_KEYS.map(key => [key, nativeGet.call(localStorage, key)]));
const reorder = (items: string[], fromId: string, toId: string): string[] => {
  const next = [...items];
  const fromIndex = next.indexOf(fromId);
  const toIndex = next.indexOf(toId);
  next.splice(fromIndex, 1);
  next.splice(toIndex, 0, fromId);
  return next;
};

// ---------------------------------------------------------------------------
// Fixture validity and positive controls
// ---------------------------------------------------------------------------

it("FIXTURE the production App composition mounts at /app/settings/features with only the auth-session hook substituted, real modules and no network", async () => {
  await mountApp();
  pre(auth.state.calls > 0, "the substituted useWebAuthSession served the production App and its gates");
  pre(pane() !== null, "the real Features pane renders in the production Settings detail");
  pre(RAIL_IDS.length === 14 && railLabels().length === RAIL_IDS.length, `the production AppRail renders every rail module (${railLabels().length}/${RAIL_IDS.length})`);
  pre(document.querySelector(".pet-wrap") !== null, "the production DesktopPet renders");
  const scope = accountScope.capture();
  pre(scope.kind === "account" && scope.accountId === OWNER_A, "the production AccountDataGate activated account A");
  const seen: unknown[] = [];
  const off = onWebEvent("web:search:invoked", detail => { seen.push(detail); });
  openPalette();
  off();
  pre(seen.length === 1, "the real event bus carried the production CmdK web:search:invoked event");
  pre(paletteLabels().includes("Tasks") && paletteLabels().includes("Settings"), "the production CmdK lists module jumps");
  closePalette();
  pre(network.fetch + network.xhr + network.socket + network.eventSource === 0, `no network request was attempted (fetch ${network.fetch}, xhr ${network.xhr}, socket ${network.socket}, eventSource ${network.eventSource})`);
});

it("PC §5.1 App readers and route guards make zero set/remove attempts on the 8 keys at mount, absent and stored", async () => {
  const from = mark();
  const first = await mountApp();
  await navigate(first, "/app/tasks");
  expect(featureWrites(from), "absent: zero set/remove attempts from the App readers and the Tasks route guard").toEqual([]);
  first.unmount();
  seed(tasks, "false");
  seed(calendar, "true");
  const stored = mark();
  const second = await mountApp();
  await navigate(second, "/app/tasks");
  expect(document.querySelector('.disabled-feature-fallback[data-feature-id="tasks"]'), "the Tasks route guard renders the fallback for stored false").not.toBeNull();
  await navigate(second, "/app/calendar");
  expect(featureWrites(stored), "stored: zero set/remove attempts from the App readers and route guards").toEqual([]);
});

it("PC §10.2 a committed off removes the rail entry and a committed on restores it, for all 8, with zero key:null dispatches", async () => {
  await mountApp();
  const start = dispatched.length;
  for (const field of FIELDS) {
    pre(inRail(field), `${field.label} is in the rail before its toggle`);
    fireEvent.click(appSwitch(field));
    await flush();
    expect(bytes(field), `${field.id} off committed`).toBe("false");
    expect(inRail(field), `§10.2: a committed off removes ${field.label} from the rail`).toBe(false);
    fireEvent.click(appSwitch(field));
    await flush();
    expect(bytes(field), `${field.id} on committed`).toBe("true");
    expect(inRail(field), `§10.2: a committed on restores ${field.label}`).toBe(true);
  }
  expect(nullStorageEvents(start), "toggles dispatch no key:null StorageEvent").toBe(0);
});

it("PC §10.3 a deep link to an off module renders DisabledFeatureFallback; after an on commit the original module renders", async () => {
  seed(matrix, "false");
  const app = await mountApp();
  await navigate(app, "/app/matrix");
  expect(app.router.state.location.pathname).toBe("/app/matrix");
  expect(document.querySelector('.disabled-feature-fallback[data-feature-id="matrix"]'), "§10.3: an off module's route renders DisabledFeatureFallback").not.toBeNull();
  expect(document.querySelector(".module-matrix"), "the original Matrix module does not render while off").toBeNull();
  await navigate(app, SETTINGS);
  fireEvent.click(appSwitch(matrix));
  await flush();
  expect(bytes(matrix), "Matrix on committed").toBe("true");
  await navigate(app, "/app/matrix");
  expect(app.router.state.location.pathname, "a clean Features pane never holds navigation").toBe("/app/matrix");
  expect(document.querySelector(".disabled-feature-fallback"), "§10.3: after an on commit the fallback is gone").toBeNull();
  expect(document.querySelector(".module-matrix"), "§10.3: the original Matrix module renders").not.toBeNull();
});

it("PC §10.4 at palette open CmdK excludes an off module and includes it after an on commit", async () => {
  seed(matrix, "false");
  await mountApp();
  openPalette();
  const labels = paletteLabels();
  expect(labels.includes("Matrix"), "§10.4: an off module is excluded at palette open").toBe(false);
  for (const field of FIELDS.filter(entry => entry !== matrix)) expect(labels.includes(field.label), `${field.label} included`).toBe(true);
  closePalette();
  fireEvent.click(appSwitch(matrix));
  await flush();
  expect(bytes(matrix)).toBe("true");
  openPalette();
  expect(paletteLabels().includes("Matrix"), "§10.4: an on commit includes the module at the next palette open").toBe(true);
  closePalette();
});

it("§10.2 a full reset restores all 8 rail entries", async () => {
  for (const field of FIELDS) seed(field, "false");
  await mountApp();
  pre(FIELDS.every(field => !inRail(field)), "all 8 modules are hidden from the rail before the reset");
  appReset(true);
  await flush(30);
  expect(bytesAll(), "all 8 keys absent").toStrictEqual(allOf(null));
  expect(FIELDS.filter(field => !inRail(field)).map(field => field.id), "§10.2: a full reset restores all 8 rail entries").toEqual([]);
});

// ---------------------------------------------------------------------------
// Readers reflect committed bytes only (§10.2, §10.4)
// ---------------------------------------------------------------------------

it("H3 §10.2 a toggle held behind the real per-key lock leaves the rail unchanged until it commits", async () => {
  await mountApp();
  const lock = await hold(keyLock(board));
  fireEvent.click(appSwitch(board));
  await flush();
  expect(appShown(board), "the pane shows the latest choice immediately").toBe(false);
  expect(bytes(board), "H3: the held per-key lock keeps the Boards bytes unchanged").toBeNull();
  expect(inRail(board), "§10.2: a pending toggle leaves the rail unchanged").toBe(true);
  await lock.release();
  expect(bytes(board)).toBe("false");
  expect(inRail(board), "§10.2: the rail updates once the toggle commits").toBe(false);
});

it("H1 §10.2 a failed toggle leaves the rail unchanged; a successful Retry updates it", async () => {
  seed(calendar, "false");
  await mountApp();
  pre(!inRail(calendar), "Calendar is off in the rail before the toggle");
  const quota = fault({ op: "set", key: calendar.key, label: "calendar quota" });
  fireEvent.click(appSwitch(calendar));
  await flush();
  fired(quota, "calendar write");
  expect(inRail(calendar), "§10.2: a failed toggle leaves the rail unchanged").toBe(false);
  expect(bytes(calendar)).toBe("false");
  expect(appShown(calendar), "H1: the pane keeps the latest choice").toBe(true);
  const retry = need(appButton("Retry Calendar"), "H9: Retry Calendar");
  quota.off();
  fireEvent.click(retry);
  await flush();
  expect(bytes(calendar)).toBe("true");
  expect(inRail(calendar), "§10.2: a successful Retry updates the rail").toBe(true);
});

it("H3 §10.4 CmdK reflects committed bytes only: a held toggle and a failed toggle leave search membership unchanged", async () => {
  await mountApp();
  const lock = await hold(keyLock(matrix));
  fireEvent.click(appSwitch(matrix));
  await flush();
  expect(bytes(matrix), "H3: the held per-key lock keeps the Matrix bytes unchanged").toBeNull();
  const quota = fault({ op: "set", key: calendar.key, label: "calendar quota" });
  fireEvent.click(appSwitch(calendar));
  await flush();
  fired(quota, "calendar write");
  openPalette();
  const labels = paletteLabels();
  expect(labels.includes("Matrix"), "§10.4: a pending off leaves Matrix searchable").toBe(true);
  expect(labels.includes("Calendar"), "§10.4: a failed off leaves Calendar searchable").toBe(true);
  closePalette();
  await lock.release();
  expect(bytes(matrix)).toBe("false");
  openPalette();
  expect(paletteLabels().includes("Matrix"), "§10.4: the committed off excludes Matrix at the next palette open").toBe(false);
  closePalette();
});

it("H5 §10.2 a partial reset restores only the modules whose removal succeeded; the pane reports the failure and Retry restores the rest", async () => {
  seed(board, "false");
  seed(calendar, "false");
  const refusal = fault({ op: "remove", key: calendar.key, label: "calendar remove refused" });
  await mountApp();
  pre(!inRail(board) && !inRail(calendar), "Boards and Calendar are hidden before the reset");
  appReset(true);
  await flush(30);
  fired(refusal, "calendar remove");
  expect(bytes(board), "the Boards removal succeeded").toBeNull();
  expect(bytes(calendar), "the refused Calendar removal left its bytes").toBe("false");
  expect(inRail(board), "§10.2: the succeeded reset restores Boards in the rail").toBe(true);
  expect(inRail(calendar), "§10.2: the refused reset leaves Calendar off in the rail (committed bytes only)").toBe(false);
  expect(says(msg.notReset(calendar)), `H5: the pane reports "${msg.notReset(calendar)}"`).toBe(true);
  const retry = need(appButton("Retry Calendar"), "H5/H9: Retry Calendar");
  refusal.off();
  fireEvent.click(retry);
  await flush();
  expect(bytes(calendar)).toBeNull();
  expect(inRail(calendar), "a successful reset Retry restores Calendar in the rail").toBe(true);
});

// ---------------------------------------------------------------------------
// Cross-module isolation (§10.5, §10.6) and H6 in the production composition
// ---------------------------------------------------------------------------

it("D2 §10.5 zero key:null StorageEvents, and unchanged appearance, rail and pet, through toggle, full reset, Discard, Reload, Retry, Discard all and partial reset", async () => {
  seedAppearanceRailAndPet();
  seed(meditation, "TRUE");
  await mountApp();
  const start = dispatched.length;
  /** Displayed values that no Features operation may change: everything but the 8 toggleable rail entries. */
  const invariant = () => {
    const shownNow = display();
    return { ...shownNow, railOrder: shownNow.railOrder.filter(label => !FIELDS.some(field => field.label === label)), bytes: appearanceBytes() };
  };
  const baseline = invariant();
  pre(baseline.railOrder.length === RAIL_IDS.length - FIELDS.length && baseline.accentHue === "210" && baseline.petAnim === "pet-anim-hop", "the App displays the seeded appearance, the 6 fixed rail entries in custom order and the seeded pet");
  const stable = (operation: string) => {
    expect(nullStorageEvents(start), `D2: ${operation} dispatches no key:null StorageEvent`).toBe(0);
    expect(invariant(), `§10.5: ${operation} leaves accent hue, background tone, rail position, fixed AppRail order, DesktopPet and their bytes unchanged`).toStrictEqual(baseline);
  };
  fireEvent.click(appSwitch(board));
  await flush();
  expect(bytes(board)).toBe("false");
  stable("toggle");
  appReset(true);
  await flush(30);
  stable("a full Reset to defaults");
  fireEvent.click(need(appButton("Discard Meditation"), "H9: Discard Meditation (reset refused over invalid bytes)"));
  await flush();
  stable("Discard");
  nativeSet.call(localStorage, meditation.key, "true");
  fireEvent.click(need(appButton("Reload Meditation"), "H2/H9: Reload Meditation"));
  await flush();
  stable("Reload");
  const tasksQuota = fault({ op: "set", key: tasks.key, label: "tasks quota" });
  fireEvent.click(appSwitch(tasks));
  await flush();
  fired(tasksQuota, "tasks write");
  tasksQuota.off();
  fireEvent.click(need(appButton("Retry Tasks"), "H9: Retry Tasks"));
  await flush();
  stable("Retry");
  const habitsQuota = fault({ op: "set", key: habits.key, label: "habits quota" });
  const dashboardQuota = fault({ op: "set", key: dashboard.key, label: "dashboard quota" });
  fireEvent.click(appSwitch(habits));
  fireEvent.click(appSwitch(dashboard));
  await flush();
  fired(habitsQuota, "habits write");
  fired(dashboardQuota, "dashboard write");
  fireEvent.click(need(appButton(W.en.discardAll), "H9: Discard all changes"));
  await flush();
  habitsQuota.off();
  dashboardQuota.off();
  stable("Discard all");
  fireEvent.click(appSwitch(calendar));
  await flush();
  expect(bytes(calendar)).toBe("false");
  const refusal = fault({ op: "remove", key: calendar.key, label: "calendar remove refused" });
  appReset(true);
  await flush(30);
  fired(refusal, "calendar remove");
  stable("a partial reset");
  refusal.off();
  fireEvent.click(need(appButton("Retry Calendar"), "H9: Retry Calendar"));
  await flush();
  expect(bytes(calendar)).toBeNull();
  stable("a reset Retry");
});

it("H6 §10.5 after a full reset the App's accent hue, background tone, rail position, AppRail order and DesktopPet id and position, and their bytes, are unchanged", async () => {
  seedAppearanceRailAndPet();
  // Stored "true": the reset performs a real removal while rail membership stays constant (all 14 entries).
  seed(board, "true");
  await mountApp();
  const before = display();
  pre(JSON.stringify(before) === JSON.stringify(SEEDED_DISPLAY), `the App displays the seeded appearance, rail order and pet: ${JSON.stringify(before)}`);
  const bytesBefore = appearanceBytes();
  appReset(true);
  await flush(30);
  pre(bytes(board) === null, "the reset ran");
  expect(display(), "H6: no displayed appearance, rail or pet value changes after the reset").toStrictEqual(before);
  expect(appearanceBytes(), "the appearance, rail and pet bytes are unchanged").toStrictEqual(bytesBefore);
});

it("§10.5 §7 a Features reset never interrupts the App: no account-scope relock, no account-gate screen, no remount of the rail, pet or Features pane", async () => {
  seedAppearanceRailAndPet();
  seed(board, "false");
  await mountApp();
  const rail = document.querySelector(".app-rail");
  const pet = document.querySelector(".pet-wrap");
  const paneElement = pane();
  const scope = accountScope.capture();
  pre(rail && pet && paneElement, "rail, pet and Features pane mounted");
  const records: MutationRecord[] = [];
  const observer = new MutationObserver(list => { records.push(...list); });
  observer.observe(document.body, { childList: true, subtree: true });
  appReset(true);
  await flush(30);
  records.push(...observer.takeRecords());
  observer.disconnect();
  pre(bytes(board) === null, "the reset ran");
  const gateShown = records.some(record => Array.from(record.addedNodes).some(node => node instanceof Element && (node.matches(".account-data-gate") || node.querySelector(".account-data-gate") !== null)));
  expect({
    accountScopeChanged: accountScope.capture() !== scope,
    accountGateShown: gateShown,
    railRemounted: !rail.isConnected,
    petRemounted: !pet.isConnected,
    paneRemounted: !paneElement.isConnected,
  }, "§10.5/§7: displayed values are never interrupted during a Features reset (no relock, gate screen or remount)").toStrictEqual({
    accountScopeChanged: false,
    accountGateShown: false,
    railRemounted: false,
    petRemounted: false,
    paneRemounted: false,
  });
});

it("H6 §10.5 an AppRail drag-reorder after a reset persists an order derived from the stored custom order", async () => {
  seedAppearanceRailAndPet();
  seed(board, "false");
  await mountApp();
  appReset(true);
  await flush(30);
  pre(bytes(board) === null, "the reset ran");
  const buttons = Array.from(document.querySelectorAll<HTMLElement>(".app-rail .rail-items .rail-btn"));
  pre(buttons.length === RAIL_IDS.length, "every rail module is rendered after the reset");
  const transfer = { effectAllowed: "", dropEffect: "", setData() {}, getData() { return ""; } };
  fireEvent.dragStart(buttons[0]!, { dataTransfer: transfer });
  fireEvent.dragOver(buttons[2]!, { dataTransfer: transfer });
  fireEvent.dragEnd(buttons[0]!, { dataTransfer: transfer });
  await flush();
  const persisted = nativeGet.call(localStorage, "xai_rail_order");
  pre(persisted !== null && persisted !== JSON.stringify(CUSTOM_ORDER), "the drag-reorder persisted a changed rail order");
  expect(JSON.parse(persisted), "H6: the drag persists an order derived from the stored custom order, not the default order").toEqual(reorder(CUSTOM_ORDER, CUSTOM_ORDER[0]!, CUSTOM_ORDER[2]!));
});

it("§10.6 in the production App a full reset leaves every key other than the 8 byte-identical", async () => {
  seedAppearanceRailAndPet();
  seedKey("xai_pref_lang", JSON.stringify("en"));
  seedKey("xai_pref_sticky_color", "sky");
  for (const field of FIELDS) seed(field, "false");
  await mountApp();
  const before = unrelatedSnapshot();
  appReset(true);
  await flush(30);
  pre(bytes(board) === null, "the reset ran");
  expect(unrelatedSnapshot(), "§10.6: every key other than the 8 keeps its exact bytes").toStrictEqual(before);
});
