/**
 * F1 regression for the shared departure coordinator (CP-STICKY-01, batch 12).
 *
 * React Router 7 hands blocker updates to React inside a transition, while a guard
 * registration renders at default priority. The coordinator can therefore render a
 * fresh guardVersion together with a "blocked" snapshot that the router has already
 * proceeded or reset. These tests force that window with the real browser router over
 * jsdom History and pin the rule: the coordinator binds, publishes, proceeds or resets
 * a blocker only while that exact object is the router's live "blocked" blocker, and
 * settles each blocker at most once. PUSH departures, which the coordinator holds
 * without a blocker, are unchanged.
 */
import * as React from "react";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { MockInstance } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { RouterProvider, UNSAFE_DataRouterStateContext, createBrowserRouter, useParams } from "react-router";
import type { Blocker, DataRouter } from "react-router";
import { DepartureCoordinator } from "../departureCoordinator.js";
import type { DepartureGuard } from "../departureCoordinator.js";

type BlockedBlocker = Extract<Blocker, { state: "blocked" }>;
type SignOutDelegate = { readonly requestDeparture: (reason: "sign-out") => Promise<boolean> };
type Place = { readonly pathname: string; readonly key: string; readonly state: unknown };
type BlockerCall = {
  readonly seq: number;
  readonly op: "proceed" | "reset";
  readonly blocker: number;
  readonly liveBlocker: number | null;
  readonly liveState: string | null;
  readonly registrations: number;
  threw?: string;
};
type Commit = { readonly seq: number; readonly pathname: string; readonly key: string; readonly state: unknown; readonly action: string };
/** One commit of the coordinator's subtree: the blocker snapshot React rendered next to the router's live blocker. */
type CoordinatorRender = {
  readonly seq: number;
  readonly blocker: number | null;
  readonly state: string | null;
  readonly liveBlocker: number | null;
  readonly liveState: string | null;
  readonly registrations: number;
};

const STAY = "Stay";
const DISCARD = "Discard local changes and leave";
const noop = (): void => {};

const fixture = {
  seq: 0,
  router: null as DataRouter | null,
  blocking: false,
  current: true,
  registrations: 0,
  discards: 0,
  coordinatorMounts: 0,
  /** The guarded pane's draft notification; it re-registers the guard on the next passive flush. */
  changed: noop as () => void,
  /** Armed per test: one caller notification that lands synchronously right after the coordinator settles a blocker. */
  afterSettle: null as (() => void) | null,
  signOut: null as SignOutDelegate | null,
  blocked: [] as number[],
  calls: [] as BlockerCall[],
  commits: [] as Commit[],
  renders: [] as CoordinatorRender[],
  pops: 0,
  errors: [] as string[],
};

const ids = new WeakMap<object, number>();
let lastId = 0;
function idOf(value: object): number {
  let id = ids.get(value);
  if (id === undefined) {
    lastId += 1;
    id = lastId;
    ids.set(value, id);
  }
  return id;
}
const next = (): number => (fixture.seq += 1);
const liveBlocker = (): Blocker | null => (fixture.router ? [...fixture.router.state.blockers.values()].at(-1) ?? null : null);

/** Wraps a blocked blocker before React receives it: each call records the router's live blocker, then delegates. */
function wrapSettlers(blocker: BlockedBlocker): void {
  for (const op of ["proceed", "reset"] as const) {
    const original = blocker[op];
    blocker[op] = () => {
      const live = liveBlocker();
      const call: BlockerCall = {
        seq: next(),
        op,
        blocker: idOf(blocker),
        liveBlocker: live && idOf(live),
        liveState: live?.state ?? null,
        registrations: fixture.registrations,
      };
      fixture.calls.push(call);
      try {
        original();
      } catch (error) {
        call.threw = error instanceof Error ? error.message : String(error);
        throw error;
      }
      const notify = fixture.afterSettle;
      fixture.afterSettle = null;
      notify?.();
    };
  }
}

/** Subscribes before RouterProvider does, so every blocked blocker is wrapped before React state holds it. */
function instrument(router: DataRouter): void {
  const wrapped = new WeakSet<object>();
  let lastKey = router.state.location.key;
  router.subscribe((state) => {
    for (const blocker of state.blockers.values()) {
      if (blocker.state !== "blocked" || wrapped.has(blocker)) continue;
      wrapped.add(blocker);
      fixture.blocked.push(idOf(blocker));
      wrapSettlers(blocker);
    }
    if (state.location.key !== lastKey) {
      lastKey = state.location.key;
      fixture.commits.push({
        seq: next(),
        pathname: state.location.pathname,
        key: state.location.key,
        state: state.location.state ?? null,
        action: state.historyAction,
      });
    }
  });
}

/** Rendered inside the coordinator: re-renders with every coordinator render and records its blocker snapshot. */
function CoordinatorProbe(): null {
  const routerState = React.useContext(UNSAFE_DataRouterStateContext);
  const snapshot = routerState ? [...routerState.blockers.values()].at(-1) ?? null : null;
  const registrations = fixture.registrations;
  React.useEffect(() => {
    fixture.coordinatorMounts += 1;
  }, []);
  React.useLayoutEffect(() => {
    const live = liveBlocker();
    fixture.renders.push({
      seq: next(),
      blocker: snapshot && idOf(snapshot),
      state: snapshot?.state ?? null,
      liveBlocker: live && idOf(live),
      liveState: live?.state ?? null,
      registrations,
    });
  });
  return null;
}

/** A guarded pane with the Settings callers' shape: every draft change re-registers the guard. */
function GuardedPane({ registerDepartureGuard }: { readonly registerDepartureGuard: (guard: DepartureGuard) => () => void }): React.ReactElement {
  const [version, setVersion] = React.useState(0);
  const [token] = React.useState(() => ({}));
  React.useLayoutEffect(() => {
    fixture.changed = () => setVersion((value) => value + 1);
    return () => {
      fixture.changed = noop;
    };
  }, []);
  React.useEffect(() => {
    fixture.registrations += 1;
    return registerDepartureGuard({
      token,
      label: "Sticky Note",
      isCurrent: () => fixture.current,
      isBlocking: () => fixture.current && fixture.blocking,
      exportDraft: noop,
      discardDraft: () => {
        fixture.discards += 1;
        fixture.blocking = false;
        setVersion((value) => value + 1);
      },
    });
  }, [registerDepartureGuard, token, version]);
  return <p data-testid="guarded-pane">draft {version}</p>;
}

function registerSignOut(delegate: SignOutDelegate): () => void {
  fixture.signOut = delegate;
  return () => {
    if (fixture.signOut === delegate) fixture.signOut = null;
  };
}

/** Mirrors ComposedSettings: one coordinator for every /app/settings/* pane. */
function SettingsRoute(): React.ReactElement {
  const pane = useParams()["*"];
  return (
    <DepartureCoordinator lang="en" registerSignOutDelegate={registerSignOut}>
      {({ registerDepartureGuard }) => (
        <>
          <CoordinatorProbe />
          {pane === "guarded"
            ? <GuardedPane registerDepartureGuard={registerDepartureGuard} />
            : <p data-testid="plain-pane">{pane}</p>}
        </>
      )}
    </DepartureCoordinator>
  );
}

async function flush(rounds = 12): Promise<void> {
  await act(async () => {
    for (let round = 0; round < rounds; round += 1) await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

async function until(predicate: () => boolean, rounds = 40): Promise<void> {
  for (let round = 0; round < rounds && !predicate(); round += 1) await flush(1);
}

const place = (router: DataRouter): Place => ({
  pathname: router.state.location.pathname,
  key: router.state.location.key,
  state: router.state.location.state ?? null,
});
const dialog = (): HTMLElement | null => screen.queryByRole("dialog");
const click = (name: string): void => {
  fireEvent.click(screen.getByRole("button", { name }));
};
const blockerCalls = (calls: readonly BlockerCall[]) =>
  calls.map(({ op, blocker, liveBlocker, liveState, threw }) => ({ op, blocker, liveBlocker, liveState, threw }));
const liveCall = (op: BlockerCall["op"], blocker: number) => ({ op, blocker, liveBlocker: blocker, liveState: "blocked", threw: undefined });

let pushState: MockInstance;
let replaceState: MockInstance;
const routers: DataRouter[] = [];
const onPop = (): void => {
  fixture.pops += 1;
};

type Mark = { readonly seq: number; readonly pops: number; readonly push: number; readonly replace: number; readonly stack: number };
const mark = (): Mark => ({
  seq: fixture.seq,
  pops: fixture.pops,
  push: pushState.mock.calls.length,
  replace: replaceState.mock.calls.length,
  stack: window.history.length,
});
const since = (start: Mark) => ({
  calls: fixture.calls.filter((call) => call.seq > start.seq),
  commits: fixture.commits.filter((commit) => commit.seq > start.seq),
  pops: fixture.pops - start.pops,
  history: { push: pushState.mock.calls.length - start.push, replace: replaceState.mock.calls.length - start.replace },
});

/**
 * Commits after `call` that rendered the blocker it settled as still "blocked" while the router had moved on,
 * after a later guard registration: the window in which F1 re-ran the blocker effect on a stale snapshot.
 */
const staleRendersAfter = (call: BlockerCall): CoordinatorRender[] =>
  fixture.renders.filter((entry) => entry.seq > call.seq
    && entry.blocker === call.blocker
    && entry.state === "blocked"
    && (entry.liveBlocker !== entry.blocker || entry.liveState !== "blocked")
    && entry.registrations > call.registrations);

/** History: start -> P (with state) -> S (the guarded pane). */
async function mountGuarded(): Promise<{ router: DataRouter; P: Place; S: Place }> {
  window.history.replaceState(null, "", "/app/settings/start");
  const router = createBrowserRouter([{ path: "/app/settings/*", element: <SettingsRoute /> }]);
  routers.push(router);
  fixture.router = router;
  instrument(router);
  render(<RouterProvider router={router} />);
  await flush();
  await act(async () => {
    await router.navigate("/app/settings/plain", { state: { token: "P" } });
  });
  const P = place(router);
  await act(async () => {
    await router.navigate("/app/settings/guarded");
  });
  await flush();
  const S = place(router);
  expect(screen.getByTestId("guarded-pane")).toBeTruthy();
  expect(P.key).not.toBe(S.key);
  // The draft becomes dirty; the caller notifies as the Settings panes do.
  fixture.blocking = true;
  await act(async () => {
    fixture.changed();
  });
  await flush();
  return { router, P, S };
}

/** Browser Back from S is held: dialog open, URL and router location kept, a live blocked blocker. */
async function holdBack(router: DataRouter, S: Place): Promise<number> {
  const blockedBefore = fixture.blocked.length;
  const start = mark();
  await act(async () => {
    window.history.back();
  });
  await flush();
  expect(fixture.blocked.length, "the Back reached the router as a blocked POP").toBe(blockedBefore + 1);
  const held = fixture.blocked.at(-1)!;
  const current = liveBlocker();
  expect(current && idOf(current), "the held blocker is the router's live blocker").toBe(held);
  expect(current?.state).toBe("blocked");
  expect(dialog(), "the departure dialog is open").not.toBeNull();
  expect(place(router)).toEqual(S);
  expect(window.location.pathname).toBe(S.pathname);
  expect(since(start).commits).toEqual([]);
  return held;
}

/** Contract §9 / review §4.1 business assertions for a released POP. */
function expectReleasedPop(router: DataRouter, target: Place, start: Mark): void {
  const observed = since(start);
  expect(place(router), "the POP reached the intended entry with key and state").toEqual(target);
  expect(window.location.pathname).toBe(target.pathname);
  expect(observed.commits.map(({ pathname, key, state, action }) => ({ pathname, key, state, action })), "exactly one POP commit")
    .toEqual([{ ...target, action: "POP" }]);
  expect(observed.history, "no pushState or replaceState for a POP release").toEqual({ push: 0, replace: 0 });
  expect(observed.pops, "exactly one release popstate").toBe(1);
  expect(window.history.length, "the history stack is unchanged").toBe(start.stack);
  expect(dialog(), "the dialog is closed").toBeNull();
  expectNoRuntimeErrors();
}

function expectNoRuntimeErrors(): void {
  expect(fixture.errors, "no console.error").toEqual([]);
  expect(screen.queryByText(/Unexpected Application Error/), "no router error element").toBeNull();
  expect(fixture.coordinatorMounts, "the coordinator subtree was never recreated").toBe(1);
}

// React Router builds a fetch Request for every navigation, and Node's Request rejects jsdom's
// AbortSignal; navigations here use Node's AbortController, as the Sticky host oracle does.
let NodeAbortController: typeof AbortController;
beforeAll(async () => {
  const util = "node:util";
  const { transferableAbortController } = (await import(/* @vite-ignore */ util)) as { transferableAbortController: () => AbortController };
  NodeAbortController = transferableAbortController().constructor as typeof AbortController;
});

beforeEach(() => {
  vi.stubGlobal("AbortController", NodeAbortController);
  Object.assign(fixture, {
    seq: 0,
    router: null,
    blocking: false,
    current: true,
    registrations: 0,
    discards: 0,
    coordinatorMounts: 0,
    changed: noop,
    afterSettle: null,
    signOut: null,
    blocked: [],
    calls: [],
    commits: [],
    renders: [],
    pops: 0,
    errors: [],
  });
  pushState = vi.spyOn(window.history, "pushState");
  replaceState = vi.spyOn(window.history, "replaceState");
  vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
    fixture.errors.push(args.map(String).join(" ").slice(0, 300));
  });
  window.addEventListener("popstate", onPop);
});

afterEach(async () => {
  await flush(4);
  cleanup();
  for (const router of routers.splice(0)) router.dispose();
  window.removeEventListener("popstate", onPop);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("DepartureCoordinator settles each router blocker once, and only while it is live", () => {
  it.each(["Retry", "completion"] as const)(
    "a %s-released Back proceeds the live blocker exactly once when the guard re-registers before the router transition renders",
    async (release) => {
      const { router, P, S } = await mountGuarded();
      const held = await holdBack(router, S);
      const start = mark();
      if (release === "Retry") {
        // Retry starts: the caller notifies while its draft still blocks.
        await act(async () => {
          fixture.changed();
        });
        await flush();
        expect(dialog(), "a Retry in flight keeps holding").not.toBeNull();
        expect(since(start).calls).toEqual([]);
      }
      // The save settles (draft cleared, caller notifies). One more notification lands right after the
      // release proceed, while React still renders the proceeded blocker as "blocked".
      fixture.afterSettle = () => fixture.changed();
      await act(async () => {
        fixture.blocking = false;
        fixture.changed();
      });
      await until(() => place(router).key === P.key);
      await flush();
      const { calls } = since(start);
      expect(blockerCalls(calls), "one proceed() on the live blocked blocker, no reset(), nothing throws").toEqual([liveCall("proceed", held)]);
      expect(staleRendersAfter(calls[0]!).length, "precondition: a guard registration rendered with the stale blocked snapshot")
        .toBeGreaterThan(0);
      expectReleasedPop(router, P, start);
    },
  );

  it("a discard-released Back whose discard re-registers the guard proceeds the live blocker exactly once", async () => {
    const { router, P, S } = await mountGuarded();
    const held = await holdBack(router, S);
    const start = mark();
    click(DISCARD);
    await until(() => place(router).key === P.key);
    await flush();
    const { calls } = since(start);
    expect(fixture.discards).toBe(1);
    expect(blockerCalls(calls)).toEqual([liveCall("proceed", held)]);
    expect(staleRendersAfter(calls[0]!).length, "precondition: the discard re-registration rendered with the stale snapshot")
      .toBeGreaterThan(0);
    expectReleasedPop(router, P, start);
  });

  it("Stay followed by a re-registration never republishes the reset blocker; a fresh Back prompts and releases once", async () => {
    const { router, P, S } = await mountGuarded();
    const held = await holdBack(router, S);
    const start = mark();
    fixture.afterSettle = () => fixture.changed();
    click(STAY);
    await flush();
    const stayed = since(start);
    expect(blockerCalls(stayed.calls), "one reset() on the live blocked blocker").toEqual([liveCall("reset", held)]);
    expect(staleRendersAfter(stayed.calls[0]!).length, "precondition: a guard registration rendered with the stale snapshot")
      .toBeGreaterThan(0);
    expect(dialog(), "Stay closes the dialog and it does not reopen").toBeNull();
    expect(place(router)).toEqual(S);
    expect(window.location.pathname).toBe(S.pathname);
    expect(stayed.commits).toEqual([]);
    expect(stayed.history).toEqual({ push: 0, replace: 0 });
    expect(window.history.length).toBe(start.stack);
    expectNoRuntimeErrors();

    const fresh = await holdBack(router, S);
    expect(fresh).not.toBe(held);
    const release = mark();
    click(DISCARD);
    await until(() => place(router).key === P.key);
    await flush();
    expect(blockerCalls(since(release).calls)).toEqual([liveCall("proceed", fresh)]);
    expectReleasedPop(router, P, release);
  });

  it("a second Back while the dialog is open rebinds the held intent to the live blocker", async () => {
    const { router, P, S } = await mountGuarded();
    const first = await holdBack(router, S);
    const second = await holdBack(router, S);
    expect(second).not.toBe(first);
    const start = mark();
    click(DISCARD);
    await until(() => place(router).key === P.key);
    await flush();
    expect(blockerCalls(since(start).calls), "the replaced blocker is never touched").toEqual([liveCall("proceed", second)]);
    expectReleasedPop(router, P, start);
  });

  it("an epoch change resets the held blocker once and fresh protection still guards", async () => {
    const { router, S } = await mountGuarded();
    const held = await holdBack(router, S);
    const start = mark();
    fixture.afterSettle = () => fixture.changed();
    await act(async () => {
      fixture.current = false;
      fixture.changed();
    });
    await flush();
    const cancelled = since(start);
    expect(blockerCalls(cancelled.calls), "the old intent resets its live blocker exactly once").toEqual([liveCall("reset", held)]);
    expect(staleRendersAfter(cancelled.calls[0]!).length, "precondition: a guard registration rendered with the stale snapshot")
      .toBeGreaterThan(0);
    expect(dialog()).toBeNull();
    expect(place(router)).toEqual(S);
    expect(cancelled.commits).toEqual([]);
    expect(cancelled.history).toEqual({ push: 0, replace: 0 });

    // A fresh registration for the new epoch guards again.
    fixture.current = true;
    await act(async () => {
      fixture.changed();
    });
    await flush();
    const fresh = await holdBack(router, S);
    const stay = mark();
    click(STAY);
    await flush();
    expect(blockerCalls(since(stay).calls)).toEqual([liveCall("reset", fresh)]);
    expect(dialog()).toBeNull();
    expect(place(router)).toEqual(S);
    expectNoRuntimeErrors();
  });

  it("a Back during a pending sign-out is reset once on the live blocker and the sign-out still resolves on Stay", async () => {
    const { router, S } = await mountGuarded();
    let outcome: boolean | null = null;
    await act(async () => {
      void fixture.signOut!.requestDeparture("sign-out").then((allow) => {
        outcome = allow;
      });
    });
    await flush();
    expect(dialog()).not.toBeNull();
    const start = mark();
    await act(async () => {
      window.history.back();
    });
    await flush();
    const blocked = fixture.blocked.at(-1)!;
    const observed = since(start);
    expect(blockerCalls(observed.calls), "first intent wins: the Back is reset on its live blocker").toEqual([liveCall("reset", blocked)]);
    expect(place(router)).toEqual(S);
    expect(window.location.pathname).toBe(S.pathname);
    expect(observed.commits).toEqual([]);
    expect(dialog(), "the sign-out prompt stays open").not.toBeNull();
    click(STAY);
    await flush();
    expect(outcome).toBe(false);
    expect(dialog()).toBeNull();
    expectNoRuntimeErrors();
  });

  it("unmounting with a held Back never touches the blocker React Router already removed", async () => {
    const { router, S } = await mountGuarded();
    await holdBack(router, S);
    const start = mark();
    cleanup();
    await flush();
    expect(blockerCalls(since(start).calls)).toEqual([]);
    expect(fixture.errors).toEqual([]);
  });

  it.each(["Retry", "discard"] as const)(
    "a %s-released programmatic PUSH stays held without a blocker and commits exactly once",
    async (release) => {
      const { router, S } = await mountGuarded();
      const blockedBefore = fixture.blocked.length;
      const start = mark();
      await act(async () => {
        void router.navigate("/app/settings/next", { state: { token: "N" } });
      });
      await flush();
      expect(dialog(), "the PUSH is held").not.toBeNull();
      expect(place(router)).toEqual(S);
      expect(since(start).history).toEqual({ push: 0, replace: 0 });
      if (release === "Retry") {
        // The save settles and the caller notifies, then one trailing notification follows.
        await act(async () => {
          fixture.blocking = false;
          fixture.changed();
        });
        await act(async () => {
          fixture.changed();
        });
      } else {
        click(DISCARD);
      }
      await until(() => place(router).pathname === "/app/settings/next");
      await flush();
      const observed = since(start);
      expect(observed.commits.map(({ pathname, state, action }) => ({ pathname, state, action })), "exactly one PUSH commit")
        .toEqual([{ pathname: "/app/settings/next", state: { token: "N" }, action: "PUSH" }]);
      expect(observed.history, "exactly one pushState and no replaceState").toEqual({ push: 1, replace: 0 });
      expect(observed.calls, "a PUSH never reaches the router blocker").toEqual([]);
      expect(fixture.blocked.length).toBe(blockedBefore);
      expect(fixture.discards).toBe(release === "discard" ? 1 : 0);
      expect(dialog()).toBeNull();
      expectNoRuntimeErrors();
    },
  );
});
