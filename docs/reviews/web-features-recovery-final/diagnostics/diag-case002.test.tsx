// Scratch-only diagnostic copy of More Sol boundaries case 002 (not evidence, never committed).
// It wraps the storage engine's mutatePref to print every request and result, then runs the case unchanged.
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, waitFor } from "@testing-library/react";
import { accountScope } from "@repo/plugin-web-storage";

vi.mock("../../../packages/plugin-web-storage/src/internal/prefMutation", async importOriginal => {
  const original = await importOriginal<typeof import("../../../packages/plugin-web-storage/src/internal/prefMutation")>();
  return {
    ...original,
    mutatePref: async (options: Parameters<typeof original.mutatePref>[0]) => {
      let defaultValid: unknown;
      try { defaultValid = options.validate(options.defaultValue as never); } catch (error) { defaultValid = `threw ${String(error)}`; }
      console.log(`DIAG call ${options.key} reset=${Boolean(options.reset)} defaultValid=${String(defaultValid)}`);
      const started = performance.now();
      const result = await original.mutatePref(options);
      console.log(`DIAG ${options.key} reset=${Boolean(options.reset)} expectedRaw=${JSON.stringify(options.expectedRaw)} defaultValid=${String(defaultValid)} result=${JSON.stringify(result)} ms=${(performance.now() - started).toFixed(1)}`);
      return result;
    },
  };
});

import { cases, deviceCases, accountCases, controlValue, download, expectedDraft, flush, guard, mount, nativeGet, nativeSet, physical, setup, encode } from "./fixture";

beforeEach(setup); afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
const reset = (ui: ReturnType<typeof mount>) => fireEvent.click(ui.getByTestId("more-reset-default"));

it("DIAG case 002 copy", async () => {
  const invalid = deviceCases[1]!, unavailable = accountCases[0]!; nativeSet.call(localStorage, physical(invalid), "invalid-bool"); const base = Storage.prototype.getItem;
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(function (this: Storage, key) { if (String(key) === physical(unavailable)) throw new Error("unavailable"); return base.call(this, key); }); const scopeBefore = accountScope.capture(); const ui = mount(); await flush(); const scopeMounted = accountScope.capture(); console.log(`DIAG mounted scope=${JSON.stringify(scopeMounted)} sameObject=${scopeBefore === scopeMounted} locks=${(navigator.locks as unknown as { calls: unknown[] }).calls?.length}`); reset(ui); console.log("DIAG reset clicked"); await flush(30); const scopeAfter = accountScope.capture(); console.log(`DIAG flushed scope=${JSON.stringify(scopeAfter)} sameObject=${scopeMounted === scopeAfter} lockCalls=${JSON.stringify((navigator.locks as unknown as { calls: Array<{ name: string }> }).calls?.map(call => call.name))}`);
  console.log(`DIAG recovery ${JSON.stringify(Array.from(ui.container.querySelectorAll(".more-recovery-field span")).map(node => node.textContent))}`);
  await waitFor(() => { for (const entry of cases) if (entry !== invalid && entry !== unavailable) expect(nativeGet.call(localStorage, physical(entry)), entry.field).toBeNull(); });
  expect(nativeGet.call(localStorage, physical(invalid))).toBe("invalid-bool"); expect(nativeGet.call(localStorage, physical(unavailable))).toBe(encode(unavailable.initial)); expect(controlValue(ui, invalid)).toBe(invalid.default); expect(controlValue(ui, unavailable)).toBe(unavailable.default); expect(guard()?.isBlocking()).toBe(true);
  const file = download(); guard()?.exportDraft(); expect(await file.read()).toEqual(expectedDraft([{ entry: invalid, operation: "reset" }, { entry: unavailable, operation: "reset" }]));
});
