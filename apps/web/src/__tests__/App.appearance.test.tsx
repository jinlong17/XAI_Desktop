import { prepareAccountFixture } from "./accountFixture.js";
/**
 * App.appearance.test.tsx — APP-AP1..APP-AP12 (CP-APPEARANCE-01).
 *
 * The App-scoped Appearance controller in the production `/app` composition
 * (production route table in a memory router; only the auth session and the
 * route gates are substituted, as in router.integration.test.tsx). Real
 * storage hook, engine, registry and codecs; jsdom gets an exclusive Web Lock
 * fixture and attempt-logging Storage spies.
 *
 * Contract r3 §11 dispositions: the Topbar persistence tests (TP1-Persist …
 * TP3b-Persist) are asserted here at App level, and TP-Persist-Quota-Safe is
 * replaced by APP-AP2 (a failing write keeps the choice displayed and applied
 * and shows the Topbar status). Existing App tests stay unchanged.
 */

import { transferableAbortController } from "node:util";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import type { PropsWithChildren } from "react";
import { accountScope, prefMutationLockName } from "@repo/plugin-web-storage";
import { onWebEvent } from "@repo/xai-web-event-bus";
import { webHostRouteObjects } from "../routes/router";
import { readLocalPref } from "../App";

const auth = vi.hoisted(() => {
  const state = {
    client: null as null | { auth: { signOut: () => Promise<unknown> } },
    coordinator: undefined as undefined | { capture: () => { owner: string; generation: string }; signOut: () => Promise<{ status: string }>; bootstrap: () => Promise<void> },
    clientSignOuts: 0,
    coordinatorSignOuts: 0,
    cleared: 0,
  };
  return state;
});

vi.mock("@repo/web-auth-device-session/web", async () => {
  const actual = await vi.importActual<typeof import("@repo/web-auth-device-session/web")>("@repo/web-auth-device-session/web");
  return {
    ...actual,
    AppRouteGate: ({ children }: PropsWithChildren) => <>{children}</>,
    AuthRouteGate: ({ children }: PropsWithChildren) => <>{children}</>,
    useDeviceBoundFetch: () => async () => new Response(JSON.stringify({ rows: [] }), { status: 200 }),
    useWebAuthSession: () => ({
      state: "authenticated",
      session: { user: { id: "host-test-account" } },
      get client() { return auth.client; },
      get coordinator() { return auth.coordinator; },
      clearSessionStorage: async () => { auth.cleared += 1; },
      reportSignOutFailure: undefined,
      deviceId: "app-appearance-device",
      syncVersion: "2026-05",
      refreshSession: async () => null,
      ensureDeviceIdentity: async () => "app-appearance-device",
      setSession: () => undefined,
    }),
  };
});

// ---- Exclusive asynchronous Web Lock fixture (jsdom has none) ----------------

type Waiter = { readonly owner: "test" | "product"; readonly enter: () => void };
let lockQueues = new Map<string, { held: boolean; queue: Waiter[] }>();
let lockRequests: string[] = [];
function lockState(name: string) {
  let state = lockQueues.get(name);
  if (!state) { state = { held: false, queue: [] }; lockQueues.set(name, state); }
  return state;
}
function drain(name: string): void {
  const state = lockState(name);
  if (state.held || state.queue.length === 0) return;
  state.held = true;
  state.queue.shift()!.enter();
}
function enqueue<T>(owner: "test" | "product", name: string, run: () => unknown): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    lockState(name).queue.push({
      owner,
      enter: () => {
        Promise.resolve().then(run).then(
          (value) => { lockState(name).held = false; queueMicrotask(() => drain(name)); resolve(value as T); },
          (error: unknown) => { lockState(name).held = false; queueMicrotask(() => drain(name)); reject(error); },
        );
      },
    });
    queueMicrotask(() => drain(name));
  });
}
async function hold(name: string): Promise<{ release(): Promise<void> }> {
  let open!: () => void;
  let entered!: () => void;
  const ready = new Promise<void>((resolve) => { entered = resolve; });
  const gate = new Promise<void>((resolve) => { open = resolve; });
  const task = enqueue<void>("test", name, () => { entered(); return gate; });
  await ready;
  return { async release() { await act(async () => { open(); await task; }); await flush(); } };
}

// ---- Attempt-logging Storage spies -----------------------------------------------

const nativeGet = Storage.prototype.getItem;
const nativeSet = Storage.prototype.setItem;
const nativeRemove = Storage.prototype.removeItem;
const APPEARANCE_KEYS = ["xai_pref_lang", "xai_pref_theme", "xai_pref_density", "xai_pref_font_scale", "xai_accent_hue", "xai_rail_pos", "xai_bg_tone"];
let attempts: Array<{ op: "get" | "set" | "remove"; key: string; value?: string }> = [];
let failSet = new Set<string>();
const appearanceWrites = (from: number) => attempts.slice(from)
  .filter((item) => item.op !== "get" && APPEARANCE_KEYS.includes(item.key))
  .map((item) => (item.op === "set" ? `set:${item.key}=${item.value}` : `remove:${item.key}`));
const raw = (key: string) => nativeGet.call(localStorage, key);

async function flush(rounds = 16): Promise<void> {
  await act(async () => {
    for (let index = 0; index < rounds; index += 1) await new Promise<void>((resolve) => setTimeout(resolve, 0));
  });
}

let preferenceEvents: unknown[] = [];
let moduleChanges: Array<{ moduleId: string; source: string }> = [];
let offEvents: Array<() => void> = [];
const assignMock = vi.fn();
let savedLocation: PropertyDescriptor | undefined;
const nativeShowModal = HTMLDialogElement.prototype.showModal;
const nativeClose = HTMLDialogElement.prototype.close;

beforeEach(() => {
  // A data-router navigation builds a Request; Node's fetch only accepts Node's AbortSignal.
  vi.stubGlobal("AbortController", transferableAbortController().constructor);
  localStorage.clear();
  prepareAccountFixture();
  attempts = [];
  failSet = new Set();
  lockQueues = new Map();
  lockRequests = [];
  auth.client = null;
  auth.coordinator = undefined;
  auth.clientSignOuts = 0;
  auth.coordinatorSignOuts = 0;
  auth.cleared = 0;
  assignMock.mockClear();
  for (const name of ["data-theme", "data-density", "data-rail-pos", "data-bg-tone"]) document.documentElement.removeAttribute(name);
  document.documentElement.style.cssText = "";
  Object.defineProperty(navigator, "locks", {
    configurable: true,
    get: () => ({
      request: (name: string, options: unknown, callback?: () => unknown) => {
        lockRequests.push(name);
        return enqueue("product", name, (typeof options === "function" ? options : callback) as () => unknown);
      },
    }),
  });
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(function (this: Storage, key: string) {
    if (this === localStorage) attempts.push({ op: "get", key });
    return nativeGet.call(this, key);
  });
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key: string, value: string) {
    if (this === localStorage) {
      attempts.push({ op: "set", key, value });
      if (failSet.has(key)) throw new DOMException("quota", "QuotaExceededError");
    }
    return nativeSet.call(this, key, value);
  });
  vi.spyOn(Storage.prototype, "removeItem").mockImplementation(function (this: Storage, key: string) {
    if (this === localStorage) attempts.push({ op: "remove", key });
    return nativeRemove.call(this, key);
  });
  preferenceEvents = [];
  moduleChanges = [];
  offEvents = [
    onWebEvent("web:settings:preference-changed", (detail) => { preferenceEvents.push(detail); }),
    onWebEvent("web:shell:module-change", (detail) => { moduleChanges.push({ moduleId: String(detail.moduleId), source: String(detail.source) }); }),
  ];
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) { this.setAttribute("open", ""); };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) { this.removeAttribute("open"); };
  savedLocation = Object.getOwnPropertyDescriptor(window, "location");
  const original = window.location;
  Object.defineProperty(window, "location", {
    configurable: true,
    writable: true,
    value: { href: original.href, origin: original.origin, protocol: original.protocol, host: original.host, hostname: original.hostname, port: original.port, pathname: original.pathname, search: original.search, hash: original.hash, assign: assignMock, replace: vi.fn(), reload: vi.fn() },
  });
});

afterEach(() => {
  cleanup();
  for (const off of offEvents.splice(0)) off();
  delete (navigator as unknown as { locks?: unknown }).locks;
  HTMLDialogElement.prototype.showModal = nativeShowModal;
  HTMLDialogElement.prototype.close = nativeClose;
  if (savedLocation) Object.defineProperty(window, "location", savedLocation);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

async function mountApp(path: string) {
  const router = createMemoryRouter(webHostRouteObjects, { initialEntries: [path] });
  const view = render(<RouterProvider router={router} />);
  await flush(24);
  return { router, view };
}
const topbar = () => document.querySelector<HTMLElement>("header.topbar")!;
function openTopbar(): HTMLElement {
  if (!topbar().querySelector('[role="dialog"]')) fireEvent.click(topbar().querySelector(".topbar-pref-trigger")!);
  return topbar().querySelector<HTMLElement>('[role="dialog"]')!;
}
const chooseTopbar = (name: string) => fireEvent.click(within(openTopbar()).getByRole("menuitemradio", { name }));
const checked = (name: string) => within(openTopbar()).getByRole("menuitemradio", { name }).getAttribute("aria-checked");
const topbarStatus = () => topbar().querySelector<HTMLElement>('[data-testid="appearance-status"]');
const pane = () => document.querySelector<HTMLElement>('.settings-detail[data-pane="appearance"] .appearance-pane');
const routeError = () => Array.from(document.querySelectorAll("h1")).some((heading) => (heading.textContent ?? "").startsWith("Route Error"));
function unload() {
  const from = attempts.length;
  const event = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(event);
  return { warned: event.defaultPrevented, attempts: attempts.length - from };
}
async function signOut(): Promise<void> {
  const rail = document.querySelector<HTMLElement>(".app-rail")!;
  if (!document.querySelector('.avatar-menu[role="menu"]')) fireEvent.click(rail.querySelector(".rail-avatar")!);
  fireEvent.click(document.querySelector(".avm-item.danger")!);
  await act(async () => { fireEvent.click(document.querySelector(".xai-sign-out-dialog__btn--confirm")!); });
  await flush(24);
}

describe("Topbar persistence at App level (replaces TP1-Persist … TP3b-Persist)", () => {
  it("APP-AP1 — every Topbar choice persists today's exact bytes through the controller; mounting writes nothing", async () => {
    const from = attempts.length;
    await mountApp("/app/tasks");
    expect(appearanceWrites(from)).toEqual([]);
    const cases: Array<readonly [string, string, string]> = [
      ["中文", "xai_pref_lang", '"zh"'],
      ["English", "xai_pref_lang", '"en"'],
      ["Dark", "xai_pref_theme", '"dark"'],
      ["System", "xai_pref_theme", '"system"'],
      ["Light", "xai_pref_theme", '"light"'],
      ["Compact", "xai_pref_density", '"compact"'],
      ["Comfortable", "xai_pref_density", '"comfortable"'],
    ];
    for (const [name, key, bytes] of cases) {
      const start = attempts.length;
      chooseTopbar(name);
      await flush();
      expect(raw(key), `${name} → ${key}`).toBe(bytes);
      expect(appearanceWrites(start), `${name} writes once`).toEqual([`set:${key}=${bytes}`]);
      expect(readLocalPref(key, null), `${name} reads back through the unchanged readLocalPref`).toBe(JSON.parse(bytes));
    }
    expect(lockRequests.filter((name) => name === prefMutationLockName("xai_pref_theme")).length).toBe(3);
    expect(topbarStatus()).toBeNull();
    expect(preferenceEvents).toEqual([]);
  });

  it("APP-AP2 — a failing Topbar write keeps the choice checked and applied and shows the Topbar status (replaces TP-Persist-Quota-Safe)", async () => {
    await mountApp("/app/tasks");
    failSet.add("xai_pref_theme");
    expect(() => chooseTopbar("Dark")).not.toThrow();
    await flush();
    expect(checked("Dark")).toBe("true");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(raw("xai_pref_theme")).toBeNull();
    const status = topbarStatus();
    expect(status).not.toBeNull();
    expect(status!.getAttribute("aria-label")).toBe("Appearance changes not saved. Review them in Settings.");
    expect(unload()).toEqual({ warned: true, attempts: 0 });
  });

  it("APP-AP2b — a Topbar write held behind the real per-key lock shows no status and keeps the options enabled; after release exactly one write", async () => {
    await mountApp("/app/tasks");
    const held = await hold(prefMutationLockName("xai_pref_density"));
    const from = attempts.length;
    chooseTopbar("Compact");
    await flush();
    expect(raw("xai_pref_density")).toBeNull();
    expect(checked("Compact")).toBe("true");
    expect(document.documentElement.getAttribute("data-density")).toBe("compact");
    expect(topbarStatus()).toBeNull();
    expect(unload().warned).toBe(true);
    await held.release();
    expect(appearanceWrites(from)).toEqual(['set:xai_pref_density="compact"']);
    expect(topbarStatus()).toBeNull();
    expect(unload().warned).toBe(false);
  });
});

describe("one App-scoped controller", () => {
  it("APP-AP3 — a pane edit is visible in the Topbar and a Topbar edit in the pane in the same act", async () => {
    await mountApp("/app/settings/appearance");
    expect(pane()).not.toBeNull();
    fireEvent.click(within(pane()!).getByRole("button", { name: "Compact" }));
    expect(checked("Compact")).toBe("true");
    chooseTopbar("Dark");
    const darkCard = within(pane()!).getAllByRole("button", { name: "Dark" }).find((element) => element.classList.contains("theme-card"))!;
    expect(darkCard.classList.contains("active")).toBe(true);
    await flush();
    expect([raw("xai_pref_density"), raw("xai_pref_theme")]).toEqual(['"compact"', '"dark"']);
    expect(preferenceEvents).toEqual([]);
  });

  it("APP-AP4 — Review on the Topbar status emits the shortcut event once and navigates once to the pane, which shows the field message", async () => {
    const { router } = await mountApp("/app/tasks");
    failSet.add("xai_pref_density");
    chooseTopbar("Compact");
    await flush();
    fireEvent.click(topbar().querySelector(".topbar-pref-trigger")!);
    const keys: string[] = [];
    const unsubscribe = router.subscribe((state) => { keys.push(state.location.key); });
    const startKey = router.state.location.key;
    fireEvent.click(topbarStatus()!);
    await flush();
    unsubscribe();
    expect(router.state.location.pathname).toBe("/app/settings/appearance");
    expect(new Set(keys.filter((key) => key !== startKey)).size).toBe(1);
    expect(moduleChanges).toEqual([{ moduleId: "settings", source: "shortcut" }]);
    expect(within(pane()!).getByText("Density was not saved.")).toBeTruthy();
    failSet.clear();
    fireEvent.click(within(pane()!).getByRole("button", { name: "Retry Density" }));
    await flush();
    expect(raw("xai_pref_density")).toBe('"compact"');
    expect(topbarStatus()).toBeNull();
    expect(unload().warned).toBe(false);
  });

  it("APP-AP5 — the Settings sidebar is never held by Appearance drafts (no route guard); the draft survives the round trip", async () => {
    const { router } = await mountApp("/app/settings/appearance");
    failSet.add("xai_accent_hue");
    fireEvent.click(within(pane()!).getByRole("button", { name: "Ocean" }));
    await flush();
    await act(async () => { await router.navigate("/app/settings/about"); });
    await flush();
    expect(router.state.location.pathname).toBe("/app/settings/about");
    expect(document.querySelector(".settings-departure-dialog")).toBeNull();
    expect(topbarStatus()).not.toBeNull();
    await act(async () => { await router.navigate("/app/settings/appearance"); });
    await flush();
    expect(within(pane()!).getByText("Accent color was not saved.")).toBeTruthy();
    expect((within(pane()!).getByRole("slider", { name: "Accent hue" }) as HTMLInputElement).value).toBe("230");
  });
});

describe("the sign-out step before requestSettingsDeparture", () => {
  it("APP-AP6 — fallback branch without drafts: zero confirm and the existing sequence completes", async () => {
    auth.client = { auth: { signOut: async () => { auth.clientSignOuts += 1; return {}; } } };
    const confirm = vi.spyOn(window, "confirm");
    await mountApp("/app/tasks");
    await signOut();
    expect(confirm).not.toHaveBeenCalled();
    expect({ backend: auth.clientSignOuts, cleared: auth.cleared, redirect: assignMock.mock.calls.map((call) => call[0]) }).toEqual({ backend: 1, cleared: 1, redirect: ["/"] });
  });

  it("APP-AP7 — fallback branch with a failed draft: one confirm; Cancel keeps identity, draft, status and warning; OK discards with zero writes and continues", async () => {
    auth.client = { auth: { signOut: async () => { auth.clientSignOuts += 1; return {}; } } };
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    await mountApp("/app/tasks");
    failSet.add("xai_pref_theme");
    chooseTopbar("Dark");
    await flush();
    const scope = accountScope.capture();
    await signOut();
    expect(confirm.mock.calls).toEqual([["Some appearance changes are not saved. Sign out and discard them?"]]);
    expect(accountScope.capture()).toBe(scope);
    expect({ backend: auth.clientSignOuts, redirect: assignMock.mock.calls.length }).toEqual({ backend: 0, redirect: 0 });
    expect(topbarStatus()).not.toBeNull();
    expect(unload().warned).toBe(true);
    confirm.mockReturnValue(true);
    const from = attempts.length;
    await signOut();
    expect(confirm).toHaveBeenCalledTimes(2);
    expect(appearanceWrites(from)).toEqual([]);
    expect({ backend: auth.clientSignOuts, redirect: assignMock.mock.calls.map((call) => call[0]), locked: accountScope.capture().kind }).toEqual({ backend: 1, redirect: ["/"], locked: "locked" });
    expect(unload().warned).toBe(false);
  });

  it("APP-AP8 — coordinator branch with a failed draft: Cancel resolves false before the coordinator is asked to sign out", async () => {
    auth.coordinator = {
      capture: () => ({ owner: "host-test-account", generation: "fixture" }),
      signOut: async () => { auth.coordinatorSignOuts += 1; return { status: "applied" }; },
      bootstrap: async () => undefined,
    };
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    await mountApp("/app/settings/appearance");
    failSet.add("xai_rail_pos");
    fireEvent.click(within(pane()!).getByRole("button", { name: "Right" }));
    await flush();
    await signOut();
    expect(confirm).toHaveBeenCalledTimes(1);
    expect({ backend: auth.coordinatorSignOuts, redirect: assignMock.mock.calls.length, kind: accountScope.capture().kind }).toEqual({ backend: 0, redirect: 0, kind: "account" });
    expect(within(pane()!).getByText("Sidebar position was not saved.")).toBeTruthy();
  });
});

describe("crash safety and the retired event path", () => {
  const CRASHING: ReadonlyArray<readonly [string, string]> = [
    ["xai_pref_lang", '"fr"'], ["xai_pref_lang", "null"], ["xai_pref_lang", "1"], ["xai_pref_lang", '"EN"'],
    ["xai_pref_font_scale", "0"], ["xai_pref_font_scale", "-1"], ["xai_pref_font_scale", "null"],
    ["xai_pref_font_scale", '"big"'], ["xai_pref_font_scale", '"1"'], ["xai_accent_hue", "Infinity"],
  ];
  it.each(CRASHING)("APP-AP9 — %s=%s at load leaves /app rendering with defaults, zero writes and the bytes kept", async (key, value) => {
    nativeSet.call(localStorage, key, value);
    const from = attempts.length;
    await mountApp("/app/settings/appearance");
    expect(routeError()).toBe(false);
    expect(pane()).not.toBeNull();
    expect(document.documentElement.style.fontSize).toBe("16px");
    expect(document.documentElement.style.getPropertyValue("--accent-hue")).toBe("165");
    expect(topbar().querySelector(".topbar-pref-trigger")!.getAttribute("title")).toBe("Appearance");
    expect(appearanceWrites(from)).toEqual([]);
    expect(raw(key)).toBe(value);
  });

  it("APP-AP10 — an Infinity accent written by another document while the App runs leaves the field source-only without a throw", async () => {
    await mountApp("/app/settings/appearance");
    nativeSet.call(localStorage, "xai_accent_hue", "Infinity");
    await act(async () => {
      window.dispatchEvent(new StorageEvent("storage", { key: "xai_accent_hue", oldValue: null, newValue: "Infinity", storageArea: localStorage }));
    });
    await flush();
    expect(routeError()).toBe(false);
    expect(within(pane()!).getByText("Saved Accent color is unavailable. Reload it; this is not a new unsaved change.")).toBeTruthy();
    expect(document.documentElement.style.getPropertyValue("--accent-hue")).toBe("165");
    expect(raw("xai_accent_hue")).toBe("Infinity");
  });

  it("APP-AP11 — a committed root change in another document is reflected live in <html>, the Topbar and the pane", async () => {
    await mountApp("/app/settings/appearance");
    nativeSet.call(localStorage, "xai_pref_theme", '"dark"');
    await act(async () => {
      window.dispatchEvent(new StorageEvent("storage", { key: "xai_pref_theme", oldValue: null, newValue: '"dark"', storageArea: localStorage }));
    });
    await flush();
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(checked("Dark")).toBe("true");
    expect(within(pane()!).getAllByRole("button", { name: "Dark" }).find((element) => element.classList.contains("theme-card"))!.classList.contains("active")).toBe(true);
  });

  it("APP-AP12 — Appearance edits, Retry all and Reset emit no web:settings:preference-changed and App writes nothing raw", async () => {
    await mountApp("/app/settings/appearance");
    vi.spyOn(window, "confirm").mockReturnValue(true);
    failSet.add("xai_bg_tone");
    fireEvent.click(within(pane()!).getByRole("button", { name: "Mist" }));
    await flush();
    failSet.clear();
    fireEvent.click(screen.getByTestId("appearance-retry-all"));
    await flush();
    expect(raw("xai_bg_tone")).toBe("mist");
    fireEvent.click(screen.getByTestId("appearance-reset-defaults"));
    await flush();
    expect(APPEARANCE_KEYS.filter((key) => key !== "xai_pref_lang").map(raw)).toEqual([null, null, null, null, null, null]);
    expect(screen.getByTestId("appearance-status-line").textContent).toBe("Defaults restored.");
    expect(preferenceEvents).toEqual([]);
  });
});
