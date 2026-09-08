import { describe, expect, it, vi } from "vitest";

import { createRuntimeSessionController } from "../src/internal/session";
import { buildUnlockFixture, hexToBytes, utf8 } from "./fixtures";

describe("runtime session lifecycle", () => {
  it("emits unlock then lock and keeps repeated lock idempotent", async () => {
    const session = createRuntimeSessionController();
    const fixture = await buildUnlockFixture();
    const transitions: string[] = [];
    session.subscribe((transition) => {
      transitions.push(`${transition.from}->${transition.to}:${transition.reason}`);
    });

    await session.unlock(fixture.input);
    await session.lock("manual");
    await session.lock("manual");

    expect(session.getState().status).toBe("locked");
    expect(transitions).toEqual([
      "locked->unlocking:unlock",
      "unlocking->unlocked:unlock",
      "unlocked->locked:manual",
    ]);
  });

  it("locks on idle timeout and rejects cryptographic work while locked", async () => {
    vi.useFakeTimers();
    const session = createRuntimeSessionController();
    const fixture = await buildUnlockFixture({
      masterPassword: utf8("pw"),
      secretKey: utf8("secret"),
      dekBytes: hexToBytes("00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff"),
    });

    session.configureIdleLock({ timeoutMs: 20 });
    await session.unlock(fixture.input);

    vi.advanceTimersByTime(20);
    await vi.runOnlyPendingTimersAsync();

    expect(session.getState().status).toBe("locked");
    await expect(session.withActiveDek(async () => 1)).rejects.toMatchObject({ code: "E_WEB_CRYPTO_LOCKED" });
    vi.useRealTimers();
  });
});
