import { act } from "@testing-library/react";
import { vi } from "vitest";
import {
  accountScope,
  generationMarkerKey,
  setCanonicalCommandActivationForTests,
} from "@repo/plugin-web-storage";

/**
 * Per-name lock queues, mirroring Web Locks semantics.
 *
 * Account-scoped canonical writes nest: the shared account lifecycle lock is
 * held while the per-dataset lock is requested inside it. A single global
 * queue would make the inner request wait on the outer request's own result
 * and deadlock, so each lock name owns its queue. Same-name requests stay
 * serialized, which is what the idempotency and ordering tests rely on.
 */
const lockTails = new Map<string, Promise<unknown>>();

function requestLock<T>(name: string, run: () => Promise<T>): Promise<T> {
  const previous = lockTails.get(name) ?? Promise.resolve();
  const result = previous.then(run);
  lockTails.set(name, result.then(() => undefined, () => undefined));
  return result;
}

export function enableCanonicalSubscriberTests(): void {
  const scope = accountScope.capture();
  localStorage.setItem(generationMarkerKey(scope.accountId!), JSON.stringify({
    generation: scope.generation,
    migrationId: "subscriber-test",
    previous: null,
  }));
  setCanonicalCommandActivationForTests(true);
  lockTails.clear();
  // Native Web Locks accepts both `request(name, run)` and
  // `request(name, options, run)`; browserAccountLock uses the latter.
  vi.stubGlobal("navigator", {
    locks: {
      request: vi.fn((name: string, optionsOrRun: unknown, maybeRun?: () => Promise<unknown>) =>
        requestLock(name, (typeof optionsOrRun === "function" ? optionsOrRun : maybeRun!) as () => Promise<unknown>)),
    },
  });
}

export function disableCanonicalSubscriberTests(): void {
  setCanonicalCommandActivationForTests(false);
  vi.unstubAllGlobals();
}

export async function settleCanonicalCommands(): Promise<void> {
  await act(async () => {
    // Draining one generation of queues can enqueue the next (nested locks),
    // so settle repeatedly until no new work is queued.
    for (let pass = 0; pass < 5; pass += 1) {
      await Promise.all([...lockTails.values()]);
      await Promise.resolve();
    }
  });
}
