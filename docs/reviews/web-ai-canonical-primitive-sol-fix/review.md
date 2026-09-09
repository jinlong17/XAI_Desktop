# Sol author record — canonical durable command primitive

## Scope and decision

Module: **web**. Author: **Sol**. Implementation baseline at final verification: `6793145`. This batch changes only the canonical storage primitive, its public exports, and focused tests. It does not connect the six Tasks/Calendar subscribers, enable the primitive in production, or coordinate the remaining UI/migration writers.

The C primitive is ready for a non-author review. **Full AI-02 remains open.** Durable six-operation replay, all-writer coordination, native cross-tab/crash tests, and production activation remain later gates.

## Public contract

`commitCanonicalCommand<T>` accepts a canonical key, captured account scope, receipt channel/request ID, validated semantic operation, domain validator, optional absent-only initializer, and a synchronous mutator. It returns a resolved discriminated result:

```ts
type CanonicalCommitResult =
  | { ok: true; targetId: string; replay: boolean }
  | { ok: false; reason:
      | 'activation-disabled' | 'lock-unavailable' | 'lock-failed'
      | 'invalid' | 'account-changed' | 'recovery-required'
      | 'missing-data' | 'request-conflict' | 'not-found'
      | 'capacity' | 'storage' };
```

Activation defaults to closed. Tests opt in through `setCanonicalCommandActivationForTests`; no production caller is activated in this batch. The primitive requires Web Locks and has no unlocked fallback.

## Implemented invariants

- The operation signature recursively sorts plain-object keys, preserves array order, and rejects sparse arrays, cycles, non-finite numbers, non-JSON values, exotic objects, throwing proxies, and oversized signatures.
- Receipt identity is the JSON tuple of channel and request ID. Both parts are bounded and control-character-free. Own-property lookup and null-prototype receipt copies preserve literal `__proto__` entries.
- The named exclusive lock is acquired before owner checks and physical reads. Under the lock, the primitive verifies the exact captured scope, deletion tombstone, and full committed-generation marker. A missing marker is never treated as valid.
- Physical absence may use an explicit initializer. Present `null`, invalid JSON, unsupported envelopes, malformed envelopes, and invalid domains never fall back to initialization.
- A known receipt is resolved before target mutation. An identical operation replays its stored target without changing bytes; changed content returns `request-conflict`.
- Receipt capacity and maximum safe revision are checked after known-replay lookup and before mutation. A known replay therefore remains available at capacity.
- Existing data, initialized data, mutator output, and the JSON-round-tripped persisted domain are validated. Throwing or malformed runtime inputs and mutator results resolve as controlled failures.
- The final owner, tombstone, generation marker, and physical key are rechecked immediately before the sole `localStorage.setItem`. Data and success receipt are encoded in one envelope write. Quota failure preserves the exact original bytes.

## Author verification

Focused primitive tests cover closed activation, semantic canonicalization, malformed runtime values, lock absence/rejection, marker/tombstone/owner changes, controlled initialization, corrupt-state refusal, mutator validation, replay/conflict, `__proto__`, receipt and revision capacity, quota preservation, final rechecks, and delayed-lock owner changes.

- `focused.log`: 15/15 focused tests passed.
- `storage-package.log`: 18/18 files and 153/153 storage-package tests passed.
- `types.log`: package TypeScript check passed.
- `git diff --check` passed for the exact implementation/test paths before evidence creation.

These are author tests. Astra's prepared non-author primitive suite remains the independent acceptance gate for this commit.
