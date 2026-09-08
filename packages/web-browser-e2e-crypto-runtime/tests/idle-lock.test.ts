import { describe, expect, it, vi } from "vitest";

import { createIdleLockController, createLockTransitionStore } from "../src/internal/idle-lock";

describe("lock transition store", () => {
  it("emits observable unlock and first lock transitions", () => {
    let now = 10;
    const store = createLockTransitionStore({ nowMs: () => now });
    const transitions: string[] = [];
    const unsubscribe = store.subscribe((transition) => {
      transitions.push(`${transition.from}->${transition.to}:${transition.reason}:${transition.at}`);
    });

    store.transitionToUnlocking();
    now = 20;
    store.transitionToUnlocked(7, 1000);
    now = 30;
    expect(store.lock("manual")).not.toBeNull();
    expect(store.lock("idle")).toBeNull();
    unsubscribe();
    store.transitionToUnlocking();

    expect(transitions).toEqual([
      "locked->unlocking:unlock:10",
      "unlocking->unlocked:unlock:20",
      "unlocked->locked:manual:30",
    ]);
  });

  it("removes listeners idempotently through the unsubscribe seam", () => {
    const store = createLockTransitionStore();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    unsubscribe();
    unsubscribe();
    store.transitionToUnlocking();

    expect(listener).not.toHaveBeenCalled();
  });
});

describe("idle lock controller", () => {
  it("schedules and replaces a single idle callback", () => {
    vi.useFakeTimers();
    let now = 1000;
    const onIdle = vi.fn();
    const controller = createIdleLockController({ nowMs: () => now });

    controller.configure({ timeoutMs: 500, onIdle });
    expect(controller.getDeadlineMs()).toBe(1500);

    now = 1200;
    controller.bump();
    expect(controller.getDeadlineMs()).toBe(1700);

    vi.advanceTimersByTime(499);
    expect(onIdle).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onIdle).toHaveBeenCalledTimes(1);
    expect(controller.getDeadlineMs()).toBeNull();

    vi.useRealTimers();
  });
});
