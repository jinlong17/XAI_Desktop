// Scratch-only diagnostic probe (not evidence, never committed): how does the case-002 getItem spy behave?
import { afterEach, beforeEach, it, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { accountScope, ownershipForKey } from "@repo/plugin-web-storage";
import { accountCases, deviceCases, nativeSet, physical, setup } from "./fixture";

beforeEach(setup); afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it("DIAG probe", () => {
  const invalid = deviceCases[1]!, unavailable = accountCases[0]!;
  console.log(`DIAG ownership default_tag=${ownershipForKey(unavailable.key)} date_recognition=${ownershipForKey(deviceCases[3]!.key)} scope=${JSON.stringify(accountScope.capture())}`);
  nativeSet.call(localStorage, physical(invalid), "invalid-bool");
  const base = Storage.prototype.getItem;
  let depth = 0, maxDepth = 0;
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(function (this: Storage, key) { depth += 1; maxDepth = Math.max(maxDepth, depth); try { if (String(key) === physical(unavailable)) throw new Error("unavailable"); return base.call(this, key); } finally { depth -= 1; } });
  for (const probeKey of ["xai_pref_more_win_type", "xai_pref_more_date_recognition", physical(deviceCases[0]!)]) {
    maxDepth = 0;
    let outcome: string;
    try { outcome = `value=${JSON.stringify(localStorage.getItem(probeKey))}`; } catch (error) { outcome = `threw ${(error as Error)?.constructor?.name}: ${String((error as Error)?.message).slice(0, 80)}`; }
    console.log(`DIAG getItem(${probeKey}) ${outcome} maxDepth=${maxDepth}`);
  }
});
