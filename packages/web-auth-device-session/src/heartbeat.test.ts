import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createHeartbeatScheduler } from "./heartbeat";

type VisibilityHandler = () => void;

function createDocumentStub(initial: VisibilityState = "visible") {
  let handler: VisibilityHandler | null = null;
  let state: VisibilityState = initial;

  return {
    get visibilityState() {
      return state;
    },
    set visibilityState(value: VisibilityState) {
      state = value;
    },
    addEventListener(event: string, cb: VisibilityHandler) {
      if (event === "visibilitychange") {
        handler = cb;
      }
    },
    removeEventListener(event: string) {
      if (event === "visibilitychange") {
        handler = null;
      }
    },
    emitVisibilityChange() {
      handler?.();
    }
  } as unknown as Document & { emitVisibilityChange(): void; visibilityState: VisibilityState };
}

describe("createHeartbeatScheduler", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("ticks immediately and on interval", async () => {
    const onTick = vi.fn(async () => {});
    const scheduler = createHeartbeatScheduler({ onTick, intervalMs: 1000 });

    scheduler.start();
    expect(onTick).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(3000);
    expect(onTick).toHaveBeenCalledTimes(4);

    scheduler.stop();
    await vi.advanceTimersByTimeAsync(2000);
    expect(onTick).toHaveBeenCalledTimes(4);
  });

  it("ticks on visibility resume", () => {
    const documentStub = createDocumentStub("hidden");
    const onTick = vi.fn(async () => {});

    const scheduler = createHeartbeatScheduler({
      onTick,
      intervalMs: 60_000,
      documentRef: documentStub
    });

    scheduler.start();
    expect(onTick).toHaveBeenCalledTimes(1);

    documentStub.visibilityState = "visible";
    documentStub.emitVisibilityChange();
    expect(onTick).toHaveBeenCalledTimes(2);
  });
});
