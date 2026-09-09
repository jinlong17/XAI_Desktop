import { act } from "@testing-library/react";
import { vi } from "vitest";
import {
  accountScope,
  generationMarkerKey,
  setCanonicalCommandActivationForTests,
} from "@repo/plugin-web-storage";

let lockTail: Promise<void> = Promise.resolve();

export function enableCanonicalSubscriberTests(): void {
  const scope = accountScope.capture();
  localStorage.setItem(generationMarkerKey(scope.accountId!), JSON.stringify({
    generation: scope.generation,
    migrationId: "subscriber-test",
    previous: null,
  }));
  setCanonicalCommandActivationForTests(true);
  lockTail = Promise.resolve();
  vi.stubGlobal("navigator", {
    locks: {
      request: vi.fn(<T>(_name: string, callback: () => Promise<T>): Promise<T> => {
        const result = lockTail.then(callback);
        lockTail = result.then(() => undefined, () => undefined);
        return result;
      }),
    },
  });
}

export function disableCanonicalSubscriberTests(): void {
  setCanonicalCommandActivationForTests(false);
  vi.unstubAllGlobals();
}

export async function settleCanonicalCommands(): Promise<void> {
  await act(async () => {
    await lockTail;
    await Promise.resolve();
  });
}
