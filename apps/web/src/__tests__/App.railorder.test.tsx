import { prepareAccountFixture } from "./accountFixture.js";
/**
 * App.railorder.test.tsx — APP-RO1..APP-RO9 (CP-APPRAIL-01).
 *
 * The App-scoped rail-order controller in the production `/app` composition
 * (production route table in a memory router; only the auth session and the
 * route gates are substituted, as in App.appearance.test.tsx). Real storage
 * hook, engine, registry and codecs; an exclusive Web Lock fixture and
 * attempt-logging Storage spies.
 *
 * Covers the App wiring of contract r1 §11 item 10: exactly one controller,
 * the Topbar `railOrderStatus` slot after the Appearance status, crash safety
 * at load, no route guard, and the sign-out step immediately before the
 * Appearance step in both auth branches (alone, with an Appearance draft, with
 * both drafts; rail Cancel never asks the Appearance step).
 */

import { transferableAbortController } from "node:util";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, within } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import type { PropsWithChildren } from "react";
import { accountScope } from "@repo/plugin-web-storage";
import { webHostRouteObjects } from "../routes/router";

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
      deviceId: "app-railorder-device",
      syncVersion: "2026-05",
      refreshSession: async () => null,
      ensureDeviceIdentity: async () => "app-railorder-device",
      setSession: () => undefined,
    }),
  };
});

// ---- Exclusive asynchronous Web Lock fixture (jsdom has none) ----------------

type Waiter = { readonly enter: () => void };
let lockQueues = new Map<string, { held: boolean; queue: Waiter[] }>();
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
function enqueue<T>(name: string, run: () => unknown): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    lockState(name).queue.push({
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

// ---- Attempt-logging Storage spies -----------------------------------------------

const KEY = "xai_rail_order";
const nativeGet = Storage.prototype.getItem;
const nativeSet = Storage.prototype.setItem;
const nativeRemove = Storage.prototype.removeItem;
let attempts: Array<{ op: "get" | "set" | "remove"; key: string; value?: string }> = [];
let failSet = new Set<string>();
const railWrites = (from: number) => attempts.slice(from).filter((item) => item.key === KEY && item.op !== "get").map((item) => `${item.op}:${item.value ?? ""}`);
const raw = () => nativeGet.call(localStorage, KEY);

async function flush(rounds = 16): Promise<void> {
  await act(async () => {
    for (let index = 0; index < rounds; index += 1) await new Promise<void>((resolve) => setTimeout(resolve, 0));
  });
}

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
      request: (name: string, options: unknown, callback?: () => unknown) =>
        enqueue(name, (typeof options === "function" ? options : callback) as () => unknown),
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
const railStatus = () => topbar().querySelector<HTMLElement>('[data-testid="rail-order-status"]');
const appearanceStatus = () => topbar().querySelector<HTMLElement>('[data-testid="appearance-status"]');
const routeError = () => Array.from(document.querySelectorAll("h1")).some((heading) => (heading.textContent ?? "").startsWith("Route Error"));
const railButtons = () => Array.from(document.querySelectorAll<HTMLElement>(".app-rail .rail-items .rail-btn"));
const railLabels = () => railButtons().map((button) => button.getAttribute("aria-label"));
function unload() {
  const event = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(event);
  return event.defaultPrevented;
}

/** One rail gesture: dragStart → dragEnter/dragOver on the third button → drop → dragEnd. */
async function railDrag(): Promise<(string | null)[]> {
  const transfer = { effectAllowed: "uninitialized", dropEffect: "none", types: [], files: [], items: [], setData: () => undefined, getData: () => "", clearData: () => undefined, setDragImage: () => undefined };
  const source = railButtons()[0]!;
  fireEvent.dragStart(source, { dataTransfer: transfer });
  fireEvent.dragEnter(railButtons()[2]!, { dataTransfer: transfer });
  fireEvent.dragOver(railButtons()[2]!, { dataTransfer: transfer });
  const preview = railLabels();
  fireEvent.drop(railButtons()[2]!, { dataTransfer: transfer });
  fireEvent.dragEnd(source, { dataTransfer: transfer });
  await flush();
  return preview;
}
/** A failed rail draft: the rail write throws QuotaExceededError. */
async function railDraft(): Promise<(string | null)[]> {
  failSet.add(KEY);
  const preview = await railDrag();
  expect(railStatus()).not.toBeNull();
  return preview;
}
/** A failed Appearance draft through the Topbar quick switcher. */
async function appearanceDraft(): Promise<void> {
  failSet.add("xai_pref_theme");
  fireEvent.click(topbar().querySelector(".topbar-pref-trigger")!);
  fireEvent.click(within(topbar().querySelector<HTMLElement>('[role="dialog"]')!).getByRole("menuitemradio", { name: "Dark" }));
  await flush();
  fireEvent.click(topbar().querySelector(".topbar-pref-trigger")!);
  expect(appearanceStatus()).not.toBeNull();
}
async function signOut(): Promise<void> {
  const rail = document.querySelector<HTMLElement>(".app-rail")!;
  if (!document.querySelector('.avatar-menu[role="menu"]')) fireEvent.click(rail.querySelector(".rail-avatar")!);
  fireEvent.click(document.querySelector(".avm-item.danger")!);
  await act(async () => { fireEvent.click(document.querySelector(".xai-sign-out-dialog__btn--confirm")!); });
  await flush(24);
}

const RAIL_TEXT = "Your sidebar order change is not saved. Sign out and discard it?";
const APPEARANCE_TEXT = "Some appearance changes are not saved. Sign out and discard them?";

type Branch = "fallback" | "coordinator";
function configure(branch: Branch): void {
  if (branch === "coordinator") {
    auth.coordinator = {
      capture: () => ({ owner: "host-test-account", generation: "fixture" }),
      signOut: async () => { auth.coordinatorSignOuts += 1; return { status: "applied" }; },
      bootstrap: async () => undefined,
    };
  } else {
    auth.client = { auth: { signOut: async () => { auth.clientSignOuts += 1; return {}; } } };
  }
}
const backend = (branch: Branch) => (branch === "coordinator" ? auth.coordinatorSignOuts : auth.clientSignOuts);

describe("the App-scoped rail-order controller", () => {
  it("APP-RO1 — one controller: a failed drop shows the dropped order and the Topbar status after the Appearance slot, on every route", async () => {
    const { router } = await mountApp("/app/tasks");
    const preview = await railDraft();
    expect(railLabels()).toEqual(preview);
    const root = railStatus()!.parentElement!;
    expect(root.parentElement?.classList.contains("topbar-controls")).toBe(true);
    expect(root.nextElementSibling?.classList.contains("topbar-pref")).toBe(true);
    await act(async () => { await router.navigate("/app/settings/appearance"); });
    await flush();
    expect(router.state.location.pathname).toBe("/app/settings/appearance");
    expect(railStatus()).not.toBeNull();
    expect(railLabels()).toEqual(preview);
    expect(unload()).toBe(true);
  });

  it.each(["{}", "1", '["tasks","tasks"]', "null"])("APP-RO2 — %s at load: no route error, the default display, the source status, zero writes", async (bytes) => {
    nativeSet.call(localStorage, KEY, bytes);
    const from = attempts.length;
    await mountApp("/app/settings/appearance");
    expect(routeError()).toBe(false);
    expect(railLabels()[0]).toBe("Tasks");
    expect(railStatus()?.getAttribute("aria-label")).toBe("Saved sidebar order is unavailable. Review it.");
    expect(railWrites(from)).toEqual([]);
    expect(raw()).toBe(bytes);
  });

  it("APP-RO3 — a successful drop writes once and shows no status; the clean App has no rail status", async () => {
    await mountApp("/app/tasks");
    expect(railStatus()).toBeNull();
    const from = attempts.length;
    const preview = await railDrag();
    // Absent bytes: Tasks moves onto Dashboard's slot; with every id visible the write is P (A2 P6).
    const expected = ["board", "dashboard", "tasks", "calendar", "matrix", "pomodoro", "timetrack", "habits", "meditation", "countdown", "ai", "statistics", "bookkeeping", "metrics"];
    expect(preview.slice(0, 3)).toEqual(["Boards", "Dashboard", "Tasks"]);
    expect(railWrites(from)).toEqual([`set:${JSON.stringify(expected)}`]);
    expect(raw()).toBe(JSON.stringify(expected));
    expect(railStatus()).toBeNull();
    expect(unload()).toBe(false);
  });
});

describe.each(["fallback", "coordinator"] as const)("the sign-out step (%s branch)", (branch) => {
  it(`APP-RO4 ${branch} — no drafts: zero confirm and the existing sequence completes`, async () => {
    configure(branch);
    const confirm = vi.spyOn(window, "confirm");
    await mountApp("/app/tasks");
    await signOut();
    expect(confirm).not.toHaveBeenCalled();
    expect({ backend: backend(branch), redirect: assignMock.mock.calls.map((call) => call[0]) }).toEqual({ backend: 1, redirect: ["/"] });
  });

  it(`APP-RO5 ${branch} — an Appearance draft only: the confirm list is exactly the Appearance text`, async () => {
    configure(branch);
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    await mountApp("/app/tasks");
    await appearanceDraft();
    await signOut();
    expect(confirm.mock.calls).toEqual([[APPEARANCE_TEXT]]);
    expect(backend(branch)).toBe(1);
  });

  it(`APP-RO6 ${branch} — a rail draft: Cancel resolves false with nothing invalidated; OK discards with zero writes and continues`, async () => {
    configure(branch);
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    await mountApp("/app/tasks");
    const preview = await railDraft();
    const scope = accountScope.capture();
    await signOut();
    expect(confirm.mock.calls).toEqual([[RAIL_TEXT]]);
    expect(accountScope.capture()).toBe(scope);
    expect({ backend: backend(branch), redirect: assignMock.mock.calls.length }).toEqual({ backend: 0, redirect: 0 });
    expect(railLabels()).toEqual(preview);
    expect(railStatus()).not.toBeNull();
    expect(unload()).toBe(true);
    confirm.mockReturnValue(true);
    const from = attempts.length;
    await signOut();
    expect(confirm).toHaveBeenCalledTimes(2);
    expect(railWrites(from)).toEqual([]);
    expect({ backend: backend(branch), redirect: assignMock.mock.calls.map((call) => call[0]) }).toEqual({ backend: 1, redirect: ["/"] });
  });

  it(`APP-RO7 ${branch} — rail and Appearance drafts: [rail, Appearance]; OK and OK proceeds`, async () => {
    configure(branch);
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    await mountApp("/app/tasks");
    await appearanceDraft();
    await railDraft();
    await signOut();
    expect(confirm.mock.calls).toEqual([[RAIL_TEXT], [APPEARANCE_TEXT]]);
    expect(backend(branch)).toBe(1);
  });

  it(`APP-RO8 ${branch} — rail OK then Appearance Cancel: false, the rail draft discarded with zero writes, the Appearance draft kept`, async () => {
    configure(branch);
    const confirm = vi.spyOn(window, "confirm").mockReturnValueOnce(true).mockReturnValueOnce(false);
    await mountApp("/app/tasks");
    await appearanceDraft();
    await railDraft();
    const from = attempts.length;
    await signOut();
    expect(confirm.mock.calls).toEqual([[RAIL_TEXT], [APPEARANCE_TEXT]]);
    expect(backend(branch)).toBe(0);
    expect(railWrites(from)).toEqual([]);
    expect(railStatus()).toBeNull();
    expect(appearanceStatus()).not.toBeNull();
  });

  it(`APP-RO9 ${branch} — rail Cancel never asks the Appearance step`, async () => {
    configure(branch);
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    await mountApp("/app/tasks");
    await appearanceDraft();
    await railDraft();
    await signOut();
    expect(confirm.mock.calls).toEqual([[RAIL_TEXT]]);
    expect(appearanceStatus()).not.toBeNull();
    expect(railStatus()).not.toBeNull();
  });
});
