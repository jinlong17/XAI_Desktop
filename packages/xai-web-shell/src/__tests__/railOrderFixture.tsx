/**
 * Rail-order test fixtures (CP-APPRAIL-01).
 *
 * - An exclusive, asynchronous FIFO Web Lock manager (pattern:
 *   xai-web-settings-features-panel/src/__tests__/featuresLockFixture.ts).
 *   jsdom has no Web Locks, and every rail write holds the real per-key lock
 *   `prefMutationLockName("xai_rail_order")`; a pass-through stub could not
 *   prove a held lock. A test can hold a real lock name, deny one, or remove
 *   the capability.
 * - An attempt-counting Storage injector that records each localStorage
 *   attempt, then delegates exactly once (never re-entering Storage), with
 *   per-key set or get faults.
 * - A harness that mounts AppRail with the real Topbar and RailOrderStatus
 *   around one provided controller, and an HTML5 drag driver that fires the
 *   full dragStart → dragEnter → dragOver → drop → dragEnd sequence on the
 *   real DOM nodes with a DataTransfer stub.
 *
 * Everything installed here uninstalls itself when the test finishes.
 */
import { act, fireEvent, render } from "@testing-library/react";
import { onTestFinished, vi } from "vitest";
import { I18N } from "@repo/plugin-web-tokens";
import type { Lang } from "@repo/plugin-web-tokens";
import { AppRail } from "../AppRail.js";
import { Topbar } from "../Topbar.js";
import { WebShellProvider } from "../registry.js";
import { RailOrderProvider, useRailOrderController } from "../internal/railOrderController.js";
import { RailOrderStatus } from "../internal/RailOrderStatus.js";
import type { RailOrderController, WebModuleSlotRegistration, WebShellIconName } from "../types.js";

export const KEY = "xai_rail_order";
export const LOCK = "xai:pref:v1:xai_rail_order";

// ---- Web Locks --------------------------------------------------------------

type LockMode = "shared" | "exclusive";
type LockCallback = (lock: { readonly name: string; readonly mode: LockMode }) => unknown;
interface Waiter { readonly mode: LockMode; readonly owner: "test" | "product"; readonly enter: () => void }
interface LockState { readers: number; writer: boolean; readonly queue: Waiter[] }

export interface RailLockFixture {
  /** Product requests made so far, in order. */
  readonly requests: string[];
  /** Takes `name` exclusively for the test; resolves once held. */
  hold(name: string): Promise<{ release(): Promise<void> }>;
  deny(name: string): void;
  allow(name: string): void;
  /** Removes (true) or restores (false) the `navigator.locks` capability. */
  setMissing(missing: boolean): void;
}

/** Lets the async hook, engine and lock grants settle inside act(). */
export async function flush(rounds = 12): Promise<void> {
  await act(async () => {
    for (let index = 0; index < rounds; index += 1) await new Promise<void>((resolve) => setTimeout(resolve, 0));
  });
}

export function installRailLocks(): RailLockFixture {
  const states = new Map<string, LockState>();
  const denied = new Set<string>();
  const requests: string[] = [];
  let missing = false;
  const stateOf = (name: string): LockState => {
    let state = states.get(name);
    if (!state) {
      state = { readers: 0, writer: false, queue: [] };
      states.set(name, state);
    }
    return state;
  };
  const drain = (state: LockState): void => {
    while (state.queue.length > 0 && !state.writer) {
      const next = state.queue[0]!;
      if (next.mode === "exclusive" && state.readers > 0) return;
      state.queue.shift();
      next.enter();
      if (next.mode === "exclusive") return;
    }
  };
  const enqueue = <T,>(owner: "test" | "product", name: string, mode: LockMode, run: LockCallback): Promise<T> => {
    const state = stateOf(name);
    return new Promise<T>((resolve, reject) => {
      state.queue.push({
        mode,
        owner,
        enter: () => {
          if (mode === "shared") state.readers += 1;
          else state.writer = true;
          const release = (): void => {
            if (mode === "shared") state.readers -= 1;
            else state.writer = false;
            drain(state);
          };
          // Grants are asynchronous, as in a browser.
          Promise.resolve()
            .then(() => run({ name, mode }))
            .then((value) => { release(); resolve(value as T); }, (error: unknown) => { release(); reject(error); });
        },
      });
      queueMicrotask(() => drain(state));
    });
  };
  const manager = {
    request<T>(name: string, options: { mode?: LockMode } | LockCallback, callback?: LockCallback): Promise<T> {
      const run = (typeof options === "function" ? options : callback) as LockCallback;
      const mode: LockMode = typeof options === "object" && options.mode === "shared" ? "shared" : "exclusive";
      requests.push(name);
      if (denied.has(name)) return Promise.reject(new Error(`rail fixture: web lock request rejected (${name})`));
      return enqueue<T>("product", name, mode, run);
    },
  };
  Object.defineProperty(navigator, "locks", { configurable: true, get: () => (missing ? undefined : manager) });
  onTestFinished(() => {
    delete (navigator as unknown as { locks?: unknown }).locks;
  });
  return {
    requests,
    async hold(name) {
      let open!: () => void;
      let entered!: () => void;
      const ready = new Promise<void>((resolve) => { entered = resolve; });
      const gate = new Promise<void>((resolve) => { open = resolve; });
      const task = enqueue<void>("test", name, "exclusive", () => { entered(); return gate; });
      await ready;
      return {
        async release() {
          await act(async () => { open(); await task; });
          await flush();
        },
      };
    },
    deny(name) { denied.add(name); },
    allow(name) { denied.delete(name); },
    setMissing(next) { missing = next; },
  };
}

// ---- Storage attempts and faults ---------------------------------------------

export interface Attempt { readonly op: "get" | "set" | "remove"; readonly key: string; readonly value?: string; readonly threw: boolean }
export interface StorageProbe {
  readonly log: Attempt[];
  /** Arms a fault: every matching attempt throws until `off()` (or `times` attempts). */
  fault(op: "get" | "set", key: string, options?: { times?: number; generic?: boolean }): { off(): void; fired(): number };
  /** Rail-key set/remove attempts since `from`, as stored values (`<remove>`, a trailing `!` when it threw). */
  railWrites(from: number): string[];
  /** Every attempt on any key since `from`. */
  all(from: number): Attempt[];
  mark(): number;
}

export const nativeGet = Storage.prototype.getItem;
export const nativeSet = Storage.prototype.setItem;
export const nativeRemove = Storage.prototype.removeItem;
export const raw = (): string | null => nativeGet.call(localStorage, KEY);
export const seed = (bytes: string): void => { nativeSet.call(localStorage, KEY, bytes); };

export function installStorageProbe(): StorageProbe {
  const log: Attempt[] = [];
  const faults: Array<{ op: "get" | "set"; key: string; remaining: number; generic: boolean; count: number }> = [];
  const faultFor = (op: "get" | "set", key: string) => {
    const match = faults.find((entry) => entry.op === op && entry.key === key && entry.remaining > 0);
    if (!match) return null;
    match.remaining -= 1;
    match.count += 1;
    return match;
  };
  const spies = [
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(function getItem(this: Storage, key: string) {
      if (this !== localStorage) return nativeGet.call(this, key);
      const match = faultFor("get", key);
      log.push({ op: "get", key, threw: match !== null });
      if (match) throw new DOMException("denied read", "SecurityError");
      return nativeGet.call(this, key);
    }),
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(function setItem(this: Storage, key: string, value: string) {
      if (this !== localStorage) return nativeSet.call(this, key, value);
      const match = faultFor("set", key);
      log.push({ op: "set", key, value, threw: match !== null });
      if (match) throw match.generic ? new Error("setItem failed") : new DOMException("quota", "QuotaExceededError");
      return nativeSet.call(this, key, value);
    }),
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(function removeItem(this: Storage, key: string) {
      if (this !== localStorage) return nativeRemove.call(this, key);
      log.push({ op: "remove", key, threw: false });
      return nativeRemove.call(this, key);
    }),
  ];
  onTestFinished(() => { for (const spy of spies) spy.mockRestore(); });
  return {
    log,
    fault(op, key, options = {}) {
      const entry = { op, key, remaining: options.times ?? Number.POSITIVE_INFINITY, generic: options.generic === true, count: 0 };
      faults.push(entry);
      return { off: () => { entry.remaining = 0; }, fired: () => entry.count };
    },
    railWrites(from) {
      return log.slice(from)
        .filter((item) => item.key === KEY && item.op !== "get")
        .map((item) => (item.op === "set" ? item.value! : "<remove>") + (item.threw ? "!" : ""));
    },
    all(from) { return log.slice(from); },
    mark() { return log.length; },
  };
}

// ---- Modules, labels and the mounted harness -----------------------------------

/** The production rail ids in railOrder order (contract §2). */
export const RAIL_IDS = ["ai", "tasks", "board", "dashboard", "calendar", "matrix", "pomodoro", "timetrack", "bookkeeping", "metrics", "habits", "meditation", "countdown", "statistics"] as const;
export const DEFAULT_ORDER = ["tasks", "board", "dashboard", "calendar", "matrix", "pomodoro", "timetrack", "habits", "meditation", "countdown", "ai", "statistics"] as const;
export const REVERSED: readonly string[] = [...RAIL_IDS].reverse();

const ICONS: Readonly<Record<string, WebShellIconName>> = {
  ai: "sparkle", tasks: "check", board: "kanban", dashboard: "layout", calendar: "calendar", matrix: "grid4", pomodoro: "timer",
  timetrack: "timer", bookkeeping: "wallet", metrics: "target", habits: "pin", meditation: "leaf", countdown: "countdown", statistics: "chart",
};

/** The rail registrations without `hidden` (the Features filter), plus settings (showInRail false). */
export function modules(hidden: readonly string[] = []): WebModuleSlotRegistration[] {
  const list: WebModuleSlotRegistration[] = RAIL_IDS.filter((id) => !hidden.includes(id)).map((id, index) => ({
    moduleId: id,
    label: id,
    defaultChildPath: "",
    children: [],
    icon: ICONS[id] ?? "kanban",
    railOrder: index + 1,
    i18nKey: `nav.${id}`,
    showInRail: true,
  }) as unknown as WebModuleSlotRegistration);
  list.push({ moduleId: "settings", label: "settings", defaultChildPath: "", children: [], icon: "sliders", railOrder: 99, i18nKey: "nav.settings", showInRail: false } as unknown as WebModuleSlotRegistration);
  return list;
}
export const visible = (hidden: readonly string[] = []): string[] => RAIL_IDS.filter((id) => !hidden.includes(id));

const idOf = (label: string): string => {
  for (const lang of ["en", "zh"] as const) {
    const entry = Object.entries(I18N[lang].nav).find(([, text]) => text === label);
    if (entry) return entry[0];
  }
  return `?${label}`;
};
export const railButtons = (): HTMLElement[] => Array.from(document.querySelectorAll<HTMLElement>(".app-rail .rail-items .rail-btn"));
export const railIds = (): string[] => railButtons().map((button) => idOf(button.getAttribute("aria-label") ?? ""));
export function railButton(id: string): HTMLElement {
  const index = railIds().indexOf(id);
  if (index < 0) throw new Error(`PRECONDITION: rail button ${id} is displayed`);
  return railButtons()[index]!;
}

export interface Harness {
  readonly clicks: string[];
  /** The latest controller rendered by the harness. */
  controller(): RailOrderController;
  setHidden(hidden: readonly string[]): void;
  unmount(): void;
}

/** AppRail + the real Topbar with `<RailOrderStatus />`, around ONE provided controller (as App composes them). */
export async function mountHarness(options: { hidden?: readonly string[]; lang?: Lang } = {}): Promise<Harness> {
  const clicks: string[] = [];
  const lang = options.lang ?? "en";
  let latest: RailOrderController | null = null;
  const noop = (): void => undefined;
  function Host({ hidden }: { hidden: readonly string[] }) {
    const controller = useRailOrderController({ lang });
    latest = controller;
    return (
      <RailOrderProvider controller={controller}>
        <WebShellProvider modules={modules(hidden)} lang={lang} railPos="left" petOn={false} setPetOn={noop}>
          <AppRail
            activeModuleId={null}
            onModuleClick={(id) => { clicks.push(id); }}
            onPetToggle={noop}
            onAvatarOpenSettings={noop}
            onAvatarOpenStatistics={noop}
          />
          <Topbar
            lang={lang}
            setLang={noop}
            theme="light"
            setTheme={noop}
            density="comfortable"
            setDensity={noop}
            onOpenSettings={noop}
            railOrderStatus={<RailOrderStatus />}
          />
          <main className="app-main"><input aria-label="outside field" /></main>
        </WebShellProvider>
      </RailOrderProvider>
    );
  }
  const view = render(<Host hidden={options.hidden ?? []} />);
  await flush();
  return {
    clicks,
    controller: () => {
      if (latest === null) throw new Error("PRECONDITION: the harness rendered");
      return latest;
    },
    setHidden: (hidden) => view.rerender(<Host hidden={hidden} />),
    unmount: () => view.unmount(),
  };
}

/** A standalone AppRail inside the real WebShellProvider (no provider: AppRail owns its controller). */
export async function mountStandalone(hidden: readonly string[] = []): Promise<{ unmount(): void }> {
  const noop = (): void => undefined;
  const view = render(
    <WebShellProvider modules={modules(hidden)} lang="en" railPos="left" petOn={false} setPetOn={noop}>
      <AppRail activeModuleId={null} onModuleClick={noop} onPetToggle={noop} onAvatarOpenSettings={noop} onAvatarOpenStatistics={noop} />
    </WebShellProvider>,
  );
  await flush();
  return { unmount: () => view.unmount() };
}

// ---- HTML5 drag driver ---------------------------------------------------------

function transfer() {
  const data = new Map<string, string>();
  return {
    effectAllowed: "uninitialized",
    dropEffect: "none",
    get types() { return Array.from(data.keys()); },
    files: [],
    items: [],
    setData(type: string, value: string) { data.set(type, value); },
    getData(type: string) { return data.get(type) ?? ""; },
    clearData() { data.clear(); },
    setDragImage() {},
  };
}
export type DropTarget = string | "gap" | "outside" | null;
export interface Gesture { readonly transfer: ReturnType<typeof transfer>; readonly from: string }

export function dragStart(from: string): Gesture {
  const gesture = { transfer: transfer(), from };
  fireEvent.dragStart(railButton(from), { dataTransfer: gesture.transfer });
  return gesture;
}
/** dragEnter then dragOver on the button displayed at `to`'s slot (re-read after each event, like a browser). */
export function dragOver(gesture: Gesture, to: string): void {
  const slot = railIds().indexOf(to);
  if (slot < 0) throw new Error(`PRECONDITION: hover target ${to} displayed`);
  fireEvent.dragEnter(railButtons()[slot]!, { dataTransfer: gesture.transfer });
  fireEvent.dragOver(railButtons()[slot]!, { dataTransfer: gesture.transfer });
}
export function drop(gesture: Gesture, target: Exclude<DropTarget, null>): void {
  if (target === "outside") {
    const main = document.querySelector<HTMLElement>(".app-main") ?? document.body;
    fireEvent.dragOver(main, { dataTransfer: gesture.transfer });
    fireEvent.drop(main, { dataTransfer: gesture.transfer });
    return;
  }
  const element = target === "gap" ? document.querySelector<HTMLElement>(".app-rail .rail-items")! : railButton(target);
  fireEvent.drop(element, { dataTransfer: gesture.transfer });
}
export function dragEnd(gesture: Gesture): void {
  fireEvent.dragEnd(railButton(gesture.from), { dataTransfer: gesture.transfer });
}
/** A full gesture; `dropOn` null cancels (no drop). Returns the displayed order right before dragEnd. */
export async function drag(from: string, targets: readonly string[], dropOn: DropTarget = targets.at(-1) ?? "gap"): Promise<string[]> {
  const gesture = dragStart(from);
  for (const to of targets) dragOver(gesture, to);
  const preview = railIds();
  if (dropOn !== null) drop(gesture, dropOn);
  dragEnd(gesture);
  await flush();
  return preview;
}

// ---- The Topbar status and panel -----------------------------------------------

export const status = (): HTMLButtonElement | null => document.querySelector<HTMLButtonElement>('header.topbar [data-testid="rail-order-status"]');
export const panel = (): HTMLElement | null => document.querySelector<HTMLElement>('[data-testid="rail-order-panel"]');
export const message = (): string | null => document.querySelector('[data-testid="rail-order-message"]')?.textContent ?? null;
export const messageRole = (): string | null => document.querySelector('[data-testid="rail-order-message"]')?.getAttribute("role") ?? null;
export const action = (kind: "retry" | "discard" | "export" | "reload"): HTMLButtonElement | null =>
  document.querySelector<HTMLButtonElement>(`[data-testid="rail-order-${kind}"]`);
export const actionsShown = (): string[] => (["retry", "discard", "export", "reload"] as const).filter((kind) => action(kind) !== null);
export function openPanel(): HTMLElement {
  const button = status();
  if (!button) throw new Error("the rail-order status is rendered");
  if (!panel()) fireEvent.click(button);
  const opened = panel();
  if (!opened) throw new Error("the rail-order panel opens");
  return opened;
}
export const prefTrigger = (): HTMLElement | null => document.querySelector<HTMLElement>(".topbar .topbar-pref-trigger");

/** Dispatches a cancelable beforeunload; a warning is a canceled event. */
export function warns(): boolean {
  const event = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(event);
  return event.defaultPrevented;
}

/** Simulates another document's committed write: native bytes change, then a StorageEvent arrives. */
export async function external(key: string, value: string | null): Promise<void> {
  const oldValue = nativeGet.call(localStorage, key);
  if (value === null) nativeRemove.call(localStorage, key);
  else nativeSet.call(localStorage, key, value);
  await act(async () => { window.dispatchEvent(new StorageEvent("storage", { key, oldValue, newValue: value, storageArea: localStorage })); });
  await flush();
}
