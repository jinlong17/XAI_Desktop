import { beforeEach, expect, it } from "vitest";
import { accountScope, createAccountScopeController, createScopedStorage, generationKey, generationMarkerKey } from "../internal/accountScope.js";
import { deleteAccountLocalDataAccount } from "../internal/accountDataLifecycle.js";
import { migrateAccount, readGeneration, type MigrationLock } from "../internal/accountMigration.js";
import { removePrefAccount, removePrefAutosave, setPrefAccount, setPrefAutosave, setPrefAutosaveAccount } from "../internal/storage.js";

const shared = async <T>(_name: string, mode: "shared" | "exclusive", run: () => Promise<T>) => {
  expect(mode).toBe("shared");
  return run();
};
const exclusive: MigrationLock = async (_name, run) => run();

beforeEach(() => localStorage.clear());

function active(accountId = "A", generation = "one") {
  const scope = accountScope.activate(accountScope.lock(accountId), generation);
  localStorage.setItem(generationMarkerKey(accountId), JSON.stringify({ generation, migrationId: "fixture", previous: null }));
  return scope;
}

it("coordinates an account pref write and removal under the captured account lock", async () => {
  const scope = active();
  expect(await setPrefAccount("xai_ai_convos", [], { scope, lock: shared })).toEqual({ ok: true });
  expect(await removePrefAccount("xai_ai_convos", { scope, lock: shared })).toEqual({ ok: true });
});

it("refuses a stale captured account writer without targeting the next account", async () => {
  const scope = active("A");
  active("B");
  expect(await setPrefAccount("xai_ai_convos", [], { scope, lock: shared })).toEqual({ ok: false, reason: "account-changed" });
  expect(localStorage.getItem(generationKey("B", "one", "xai_ai_convos"))).toBeNull();
});

it("returns a typed lock refusal for an account autosave", async () => {
  const scope = active();
  const unavailable = async () => { throw new Error("lock unavailable"); };
  expect(await setPrefAutosaveAccount("coordinated", { ok: true }, { scope, lock: unavailable })).toEqual({ ok: false, reason: "lock-unavailable" });
});

it("exposes a coordinated async scoped-storage surface while retaining the sync surface", async () => {
  active();
  const scoped = createScopedStorage(localStorage);
  expect(await scoped.setItemAccount("xai_ai_convos", "raw", shared)).toEqual({ ok: true });
  expect(scoped.getItem("xai_ai_convos")).toBe("raw");
});

it("deletes captured account data only after exclusive coordination", async () => {
  const scope = active();
  localStorage.setItem(generationKey("A", "one", "xai_ai_convos"), "A");
  const lock = async <T>(_name: string, mode: "shared" | "exclusive", run: () => Promise<T>) => {
    expect(mode).toBe("exclusive");
    return run();
  };
  expect(await deleteAccountLocalDataAccount(scope, localStorage, lock)).toEqual({ ok: true });
  expect(localStorage.getItem(generationKey("A", "one", "xai_ai_convos"))).toBeNull();
});

it("refuses publication when an acknowledged old-generation source changes during secret staging", async () => {
  const accountId = "migration";
  localStorage.setItem(generationMarkerKey(accountId), JSON.stringify({ generation: "old", migrationId: "old", previous: null }));
  localStorage.setItem(generationKey(accountId, "old", "xai_ai_convos"), "[]");
  const controller = createAccountScopeController();
  const transition = controller.lock(accountId);
  await expect(migrateAccount({ storage: localStorage, controller, transition, choice: "empty", lock: exclusive, newId: () => "next", secrets: {
    stage: async () => { localStorage.setItem(generationKey(accountId, "old", "xai_ai_convos"), "[\"latest\"]"); }, verify: async () => {},
  } })).rejects.toThrow(/source changed/);
  expect(readGeneration(localStorage, accountId)?.generation).toBe("old");
  expect(localStorage.getItem(generationKey(accountId, "old", "xai_ai_convos"))).toBe("[\"latest\"]");
});

for (const mutation of ["add", "remove"] as const) {
  it(`refuses publication when the complete public-autosave source key set changes during ${mutation}`, async () => {
    const accountId = `key-set-${mutation}`;
    const logicalKey = "xai_pref_key_set";
    const physicalKey = generationKey(accountId, "old", logicalKey);
    localStorage.setItem(generationMarkerKey(accountId), JSON.stringify({ generation: "old", migrationId: "old", previous: null }));
    if (mutation === "remove") localStorage.setItem(physicalKey, JSON.stringify({ before: true }));
    const writerScope = accountScope.activate(accountScope.lock(accountId), "old");
    const controller = createAccountScopeController();
    await expect(migrateAccount({ storage: localStorage, controller, transition: controller.lock(accountId), choice: "empty", lock: exclusive, newId: () => mutation, secrets: {
      stage: async () => {
        if (mutation === "add") expect(setPrefAutosave("key_set", { added: true }, { scope: writerScope })).toBe(true);
        else removePrefAutosave("key_set", writerScope);
      },
      verify: async () => {},
    } })).rejects.toThrow(/source changed/);
    expect(readGeneration(localStorage, accountId)?.generation).toBe("old");
    expect(localStorage.getItem(physicalKey)).toBe(mutation === "add" ? JSON.stringify({ added: true }) : null);
  });
}
