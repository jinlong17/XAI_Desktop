import { createTestLockManager } from "./webLocksHarness.js";
import { act } from "@testing-library/react";
import { vi } from "vitest";
import {
  accountScope,
  generationMarkerKey,
  setCanonicalCommandActivationForTests,
} from "@repo/plugin-web-storage";

let locks = createTestLockManager();

export function enableCanonicalSubscriberTests(): void {
  const scope = accountScope.capture();
  localStorage.setItem(generationMarkerKey(scope.accountId!), JSON.stringify({
    generation: scope.generation,
    migrationId: "subscriber-test",
    previous: null,
  }));
  setCanonicalCommandActivationForTests(true);
  locks = createTestLockManager();
  vi.stubGlobal("navigator", { locks });
}

export function disableCanonicalSubscriberTests(): void {
  setCanonicalCommandActivationForTests(false);
  vi.unstubAllGlobals();
}

export async function settleCanonicalCommands(): Promise<void> {
  await act(async () => {
    await locks.idle();
    await Promise.resolve();
  });
}
