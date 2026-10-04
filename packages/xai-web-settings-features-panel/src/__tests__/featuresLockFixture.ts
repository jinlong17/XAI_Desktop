/**
 * Features-local test fixtures.
 *
 * jsdom has no Web Locks, and the Features writes hold the real per-key lock
 * (`prefMutationLockName("xai_pref_features_<id>")`). This exclusive,
 * asynchronous FIFO lock manager lets a test hold a real lock name, deny one,
 * or remove the capability. It uninstalls itself when the test finishes.
 */
import { act } from "@testing-library/react";
import { onTestFinished } from "vitest";

type LockMode = "shared" | "exclusive";
type LockCallback = (lock: { readonly name: string; readonly mode: LockMode }) => unknown;
interface Waiter { readonly mode: LockMode; readonly owner: "test" | "product"; readonly enter: () => void }
interface LockState { readers: number; writer: boolean; readonly queue: Waiter[] }

export interface FeaturesLockFixture {
  /** Product requests made so far, in order. */
  readonly requests: string[];
  /** Takes `name` exclusively for the test; resolves once held. */
  hold(name: string): Promise<{ release(): Promise<void> }>;
  /** Product waiters queued behind `name`. */
  waiting(name: string): number;
  deny(name: string): void;
  allow(name: string): void;
  /** Removes (true) or restores (false) the `navigator.locks` capability. */
  setMissing(missing: boolean): void;
}

/** Lets the async hook, engine and lock grants settle inside act(). */
export async function flushFeatures(rounds = 12): Promise<void> {
  await act(async () => {
    for (let index = 0; index < rounds; index += 1) await new Promise<void>((resolve) => setTimeout(resolve, 0));
  });
}

export function installFeaturesLockFixture(): FeaturesLockFixture {
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
  const enqueue = <T>(owner: "test" | "product", name: string, mode: LockMode, run: LockCallback): Promise<T> => {
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
      if (denied.has(name)) return Promise.reject(new Error(`features fixture: web lock request rejected (${name})`));
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
          await flushFeatures();
        },
      };
    },
    waiting(name) {
      return (states.get(name)?.queue ?? []).filter((waiter) => waiter.owner === "product").length;
    },
    deny(name) { denied.add(name); },
    allow(name) { denied.delete(name); },
    setMissing(next) { missing = next; },
  };
}
