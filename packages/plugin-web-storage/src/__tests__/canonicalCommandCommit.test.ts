import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { accountPrefix, accountScope, generationMarkerKey, type AccountScope } from "../internal/accountScope.js";
import {
  canonicalCommandReceiptId,
  canonicalCommandSignature,
  commitCanonicalCommand,
  findCanonicalCommandReceipt,
  readCanonicalCommandState,
  setCanonicalCommandActivationForTests,
  type CanonicalCommandEnvelope,
  type CanonicalCommandInput,
  type CanonicalCommandReceipt,
} from "../internal/canonicalCommandState.js";

type Domain = { items: string[] };
const validate = (value: unknown): value is Domain => {
  return typeof value === "object"
    && value !== null
    && !Array.isArray(value)
    && Array.isArray((value as { items?: unknown }).items)
    && (value as { items: unknown[] }).items.every(item => typeof item === "string");
};
const channel = "web:tasks:create-requested";
const operation = { title: "Created", bucket: "nodate" };

function activate(accountId = "canonical-command", generation = "fixture"): AccountScope {
  const scope = accountScope.activate(accountScope.lock(accountId), generation);
  localStorage.setItem(generationMarkerKey(accountId), JSON.stringify({ generation, migrationId: "test-marker", previous: null }));
  return scope;
}

function physical(scope: AccountScope): string {
  return accountScope.physicalKey("xai_task_cols", scope);
}

function defaultInput(scope: AccountScope, overrides: Partial<CanonicalCommandInput<Domain>> = {}): CanonicalCommandInput<Domain> {
  return {
    key: "xai_task_cols",
    scope,
    channel,
    requestId: "request-1",
    operation,
    validate,
    mutate: data => ({ ok: true, data: { items: [...data.items, "Created"] }, targetId: "target-1" }),
    ...overrides,
  };
}

function receipt(signature = canonicalCommandSignature(operation)!): CanonicalCommandReceipt {
  return {
    operationVersion: 1,
    signature,
    result: { ok: true, targetId: "target-1" },
    committedAt: "2026-09-09T12:00:00.000Z",
  };
}

function envelope(data: Domain, receipts: Record<string, CanonicalCommandReceipt> = {}): CanonicalCommandEnvelope<Domain> {
  return { format: "xai-command-state", version: 1, revision: 3, data, receipts };
}

beforeEach(() => {
  localStorage.clear();
  setCanonicalCommandActivationForTests(true);
  vi.stubGlobal("navigator", {
    locks: {
      request: vi.fn(async (_name: string, callback: () => Promise<unknown>) => callback()),
    },
  });
});

afterEach(() => {
  setCanonicalCommandActivationForTests(false);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("canonical command C primitive", () => {
  it("is production-disabled by default and does not enter the lock", async () => {
    const scope = activate();
    const request = navigator.locks.request as ReturnType<typeof vi.fn>;
    setCanonicalCommandActivationForTests(false);
    await expect(commitCanonicalCommand(defaultInput(scope))).resolves.toEqual({ ok: false, reason: "activation-disabled" });
    expect(request).not.toHaveBeenCalled();
  });

  it("canonicalizes semantic object keys while preserving array order and rejects non-JSON semantics", () => {
    expect(canonicalCommandSignature({ z: 1, a: { y: [2, 1], x: true } }))
      .toBe(canonicalCommandSignature({ a: { x: true, y: [2, 1] }, z: 1 }));
    expect(canonicalCommandSignature({ a: [1, 2] })).not.toBe(canonicalCommandSignature({ a: [2, 1] }));
    expect(canonicalCommandSignature({ invalid: undefined })).toBeNull();
    expect(canonicalCommandSignature({ invalid: Number.NaN })).toBeNull();
    expect(canonicalCommandSignature(new Date())).toBeNull();
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;
    expect(canonicalCommandSignature(cyclic)).toBeNull();
    expect(canonicalCommandSignature(Array(1))).toBeNull();
    expect(canonicalCommandSignature(Array(1))).not.toBe(canonicalCommandSignature([]));
    expect(canonicalCommandSignature(new Proxy({}, { ownKeys: () => { throw new Error("proxy trap"); } }))).toBeNull();
    expect(canonicalCommandReceiptId(channel, "__proto__")).toBe(JSON.stringify([channel, "__proto__"]));
    expect(canonicalCommandReceiptId(channel, "bad\nrequest")).toBeNull();
  });

  it("turns malformed runtime input and throwing operation getters into controlled invalid results", async () => {
    const scope = activate();
    const request = navigator.locks.request as ReturnType<typeof vi.fn>;
    await expect(commitCanonicalCommand(defaultInput(scope, {
      requestId: 42 as unknown as string,
    }))).resolves.toEqual({ ok: false, reason: "invalid" });
    const throwingInput = new Proxy(defaultInput(scope), {
      get(target, property, receiver) {
        if (property === "operation") throw new Error("operation getter failed");
        return Reflect.get(target, property, receiver);
      },
    });
    await expect(commitCanonicalCommand(throwingInput)).resolves.toEqual({ ok: false, reason: "invalid" });
    expect(request).not.toHaveBeenCalled();
  });

  it("requires the persisted generation marker and deletion barrier inside the lock", async () => {
    const scope = activate();
    const key = physical(scope);
    localStorage.setItem(key, JSON.stringify({ items: [] }));
    const mutate = vi.fn(defaultInput(scope).mutate);

    localStorage.removeItem(generationMarkerKey(scope.accountId!));
    await expect(commitCanonicalCommand(defaultInput(scope, { mutate }))).resolves.toEqual({ ok: false, reason: "account-changed" });
    localStorage.setItem(generationMarkerKey(scope.accountId!), "bad marker");
    await expect(commitCanonicalCommand(defaultInput(scope, { mutate }))).resolves.toEqual({ ok: false, reason: "recovery-required" });
    localStorage.setItem(generationMarkerKey(scope.accountId!), JSON.stringify({ generation: "other", migrationId: "test", previous: null }));
    await expect(commitCanonicalCommand(defaultInput(scope, { mutate }))).resolves.toEqual({ ok: false, reason: "account-changed" });
    localStorage.setItem(generationMarkerKey(scope.accountId!), JSON.stringify({ generation: scope.generation, migrationId: "test", previous: null }));
    localStorage.setItem(`${accountPrefix(scope.accountId!)}deleted`, "true");
    await expect(commitCanonicalCommand(defaultInput(scope, { mutate }))).resolves.toEqual({ ok: false, reason: "account-changed" });
    expect(mutate).not.toHaveBeenCalled();
    expect(localStorage.getItem(key)).toBe(JSON.stringify({ items: [] }));
  });

  it("fails closed when the lock is unavailable or rejects", async () => {
    const scope = activate();
    vi.stubGlobal("navigator", {});
    await expect(commitCanonicalCommand(defaultInput(scope))).resolves.toEqual({ ok: false, reason: "lock-unavailable" });
    vi.stubGlobal("navigator", { locks: { request: vi.fn(async () => { throw new Error("lock rejected"); }) } });
    await expect(commitCanonicalCommand(defaultInput(scope))).resolves.toEqual({ ok: false, reason: "lock-failed" });
  });

  it("initializes only a physically absent domain and commits seed, mutation, and receipt in one write", async () => {
    const scope = activate();
    const key = physical(scope);
    const nativeSet = Storage.prototype.setItem;
    let writes = 0;
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, target: string, value: string) {
      if (target === key) writes += 1;
      return nativeSet.call(this, target, value);
    });
    await expect(commitCanonicalCommand(defaultInput(scope))).resolves.toEqual({ ok: false, reason: "missing-data" });
    const initialize = vi.fn((): Domain => ({ items: ["Seed"] }));
    await expect(commitCanonicalCommand(defaultInput(scope, { initialize }))).resolves.toEqual({ ok: true, targetId: "target-1", replay: false });
    expect(initialize).toHaveBeenCalledOnce();
    expect(writes).toBe(1);
    const parsed = JSON.parse(localStorage.getItem(key)!);
    expect(parsed).toMatchObject({ format: "xai-command-state", version: 1, revision: 1, data: { items: ["Seed", "Created"] } });
    const id = canonicalCommandReceiptId(channel, "request-1")!;
    expect(findCanonicalCommandReceipt(parsed, id)?.result.targetId).toBe("target-1");
  });

  it("never uses the initializer for present null, corrupt, unsupported, or invalid domain data", async () => {
    const scope = activate();
    const key = physical(scope);
    const initialize = vi.fn((): Domain => ({ items: [] }));
    const mutate = vi.fn(defaultInput(scope).mutate);
    const cases: Array<[string, string]> = [
      ["null", "recovery-required"],
      ["{bad", "recovery-required"],
      [JSON.stringify({ ...envelope({ items: [] }), version: 2 }), "recovery-required"],
      [JSON.stringify({ wrong: true }), "recovery-required"],
    ];
    for (const [raw, reason] of cases) {
      localStorage.setItem(key, raw);
      await expect(commitCanonicalCommand(defaultInput(scope, { initialize, mutate }))).resolves.toEqual({ ok: false, reason });
      expect(localStorage.getItem(key)).toBe(raw);
    }
    expect(initialize).not.toHaveBeenCalled();
    expect(mutate).not.toHaveBeenCalled();
  });

  it("validates the mutator result and does not classify mutator bugs as storage failures", async () => {
    const scope = activate();
    const key = physical(scope);
    const raw = JSON.stringify({ items: [] });
    localStorage.setItem(key, raw);
    await expect(commitCanonicalCommand(defaultInput(scope, {
      mutate: () => ({ ok: true, data: { items: [1] } as unknown as Domain, targetId: "bad" }),
    }))).resolves.toEqual({ ok: false, reason: "invalid" });
    await expect(commitCanonicalCommand(defaultInput(scope, {
      requestId: "throwing-mutator",
      mutate: () => { throw new TypeError("programmer error"); },
    }))).resolves.toEqual({ ok: false, reason: "invalid" });
    await expect(commitCanonicalCommand(defaultInput(scope, {
      requestId: "throwing-result",
      mutate: () => new Proxy({ ok: true, data: { items: [] }, targetId: "bad" }, {
        get(target, property, receiver) {
          if (property === "ok") throw new TypeError("result getter failed");
          return Reflect.get(target, property, receiver);
        },
      }) as unknown as ReturnType<CanonicalCommandInput<Domain>["mutate"]>,
    }))).resolves.toEqual({ ok: false, reason: "invalid" });
    const cyclicData = { items: ["valid-before-encoding"] } as Domain & { self?: unknown };
    cyclicData.self = cyclicData;
    await expect(commitCanonicalCommand(defaultInput(scope, {
      requestId: "cyclic-result",
      mutate: () => ({ ok: true, data: cyclicData, targetId: "bad" }),
    }))).resolves.toEqual({ ok: false, reason: "invalid" });
    expect(localStorage.getItem(key)).toBe(raw);
  });

  it("looks up a durable receipt before target mutation and rejects a changed operation", async () => {
    const scope = activate();
    const key = physical(scope);
    const id = canonicalCommandReceiptId(channel, "request-1")!;
    const raw = JSON.stringify(envelope({ items: [] }, { [id]: receipt() }));
    localStorage.setItem(key, raw);
    const mutate = vi.fn(() => ({ ok: false as const, reason: "not-found" as const }));
    await expect(commitCanonicalCommand(defaultInput(scope, { mutate }))).resolves.toEqual({ ok: true, targetId: "target-1", replay: true });
    await expect(commitCanonicalCommand(defaultInput(scope, { operation: { ...operation, title: "Changed" }, mutate }))).resolves.toEqual({ ok: false, reason: "request-conflict" });
    expect(mutate).not.toHaveBeenCalled();
    expect(localStorage.getItem(key)).toBe(raw);
  });

  it("preserves __proto__ receipts and safely stores a request whose id is __proto__", async () => {
    const scope = activate();
    const key = physical(scope);
    const legacyProtoReceipt = receipt("legacy-signature");
    const raw = `{"format":"xai-command-state","version":1,"revision":3,"data":{"items":[]},"receipts":{"__proto__":${JSON.stringify(legacyProtoReceipt)}}}`;
    localStorage.setItem(key, raw);
    await expect(commitCanonicalCommand(defaultInput(scope, { requestId: "__proto__" }))).resolves.toEqual({ ok: true, targetId: "target-1", replay: false });
    const parsed = JSON.parse(localStorage.getItem(key)!) as CanonicalCommandEnvelope<Domain>;
    expect(Object.hasOwn(parsed.receipts, "__proto__")).toBe(true);
    expect(findCanonicalCommandReceipt(parsed, "__proto__")).toEqual(legacyProtoReceipt);
    const composite = canonicalCommandReceiptId(channel, "__proto__")!;
    expect(findCanonicalCommandReceipt(parsed, composite)?.result.targetId).toBe("target-1");
  });

  it("serves known replay at receipt capacity but rejects a new identity before mutation", async () => {
    const scope = activate();
    const key = physical(scope);
    const id = canonicalCommandReceiptId(channel, "request-1")!;
    const receipts: Record<string, CanonicalCommandReceipt> = { [id]: receipt() };
    for (let index = 1; index < 512; index += 1) receipts[`old-${index}`] = receipt(`old-signature-${index}`);
    const raw = JSON.stringify(envelope({ items: [] }, receipts));
    localStorage.setItem(key, raw);
    const mutate = vi.fn(defaultInput(scope).mutate);
    await expect(commitCanonicalCommand(defaultInput(scope, { mutate }))).resolves.toMatchObject({ ok: true, replay: true });
    await expect(commitCanonicalCommand(defaultInput(scope, { requestId: "new-at-capacity", mutate }))).resolves.toEqual({ ok: false, reason: "capacity" });
    expect(mutate).not.toHaveBeenCalled();
    expect(localStorage.getItem(key)).toBe(raw);
  });

  it("serves a known replay at the maximum revision but refuses a new mutation before overflow", async () => {
    const scope = activate();
    const key = physical(scope);
    const id = canonicalCommandReceiptId(channel, "request-1")!;
    const raw = JSON.stringify({
      ...envelope({ items: [] }, { [id]: receipt() }),
      revision: Number.MAX_SAFE_INTEGER,
    });
    localStorage.setItem(key, raw);
    const mutate = vi.fn(defaultInput(scope).mutate);
    await expect(commitCanonicalCommand(defaultInput(scope, { mutate }))).resolves.toEqual({ ok: true, targetId: "target-1", replay: true });
    await expect(commitCanonicalCommand(defaultInput(scope, { requestId: "new-at-max-revision", mutate }))).resolves.toEqual({ ok: false, reason: "capacity" });
    expect(mutate).not.toHaveBeenCalled();
    expect(localStorage.getItem(key)).toBe(raw);
  });

  it("keeps exact legacy bytes when the sole envelope write hits quota", async () => {
    const scope = activate();
    const key = physical(scope);
    const raw = "{\n  \"items\": []\n}";
    localStorage.setItem(key, raw);
    const nativeSet = Storage.prototype.setItem;
    let attempts = 0;
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, target: string, value: string) {
      if (target === key) { attempts += 1; throw new DOMException("quota", "QuotaExceededError"); }
      return nativeSet.call(this, target, value);
    });
    await expect(commitCanonicalCommand(defaultInput(scope))).resolves.toEqual({ ok: false, reason: "storage" });
    expect(attempts).toBe(1);
    vi.restoreAllMocks();
    expect(localStorage.getItem(key)).toBe(raw);
  });

  it("rechecks owner, marker, and tombstone after mutation before writing", async () => {
    const scenarios: Array<[string, (scope: AccountScope) => void]> = [
      ["owner", () => { activate("other-account"); }],
      ["marker", scope => { localStorage.setItem(generationMarkerKey(scope.accountId!), JSON.stringify({ generation: "replaced", migrationId: "other", previous: scope.generation })); }],
      ["tombstone", scope => { localStorage.setItem(`${accountPrefix(scope.accountId!)}deleted`, "true"); }],
    ];
    for (const [name, invalidate] of scenarios) {
      const scope = activate(`final-check-${name}`);
      const key = physical(scope);
      const raw = JSON.stringify({ items: [] });
      localStorage.setItem(key, raw);
      const set = vi.spyOn(Storage.prototype, "setItem");
      await expect(commitCanonicalCommand(defaultInput(scope, {
        requestId: `request-${name}`,
        mutate: data => {
          invalidate(scope);
          return { ok: true, data: { items: [...data.items, name] }, targetId: name };
        },
      }))).resolves.toEqual({ ok: false, reason: "account-changed" });
      expect(set.mock.calls.filter(([target]) => target === key)).toHaveLength(0);
      expect(localStorage.getItem(key)).toBe(raw);
      set.mockRestore();
    }
  });

  it("checks the current owner only after acquiring the named exclusive lock", async () => {
    const scope = activate("waiting-owner");
    const key = physical(scope);
    localStorage.setItem(key, JSON.stringify({ items: [] }));
    let release: (() => void) | undefined;
    const gate = new Promise<void>(resolve => { release = resolve; });
    vi.stubGlobal("navigator", { locks: { request: vi.fn(async (_name: string, callback: () => Promise<unknown>) => { await gate; return callback(); }) } });
    const pending = commitCanonicalCommand(defaultInput(scope));
    activate("replacement-owner");
    release!();
    await expect(pending).resolves.toEqual({ ok: false, reason: "account-changed" });
    expect(localStorage.getItem(key)).toBe(JSON.stringify({ items: [] }));
  });
});
