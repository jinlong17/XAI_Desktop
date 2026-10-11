# Async preference engine — Terra repair evidence

Web, 2026-09-09. This repair addresses the four bounded rejection groups in the
[Astra engine review](../web-d2-async-pref-astra-engine/review.md) against the
unchanged [D2 async preference contract](../web-d2-async-pref-contract/contract.md).
It does not close D2, AI-02, or REL-05.

## Product change

Fixed product commit: `2c5dc319126541085e7620c4c9ae23413db2c816`
(`fix(storage): harden async preference mutation boundaries`). Only these product
files changed:

- `packages/plugin-web-storage/src/internal/prefMutation.ts`
- `packages/plugin-web-storage/src/internal/storage.ts`

The mutation boundary now resolves a registered key's codec before locking or
writing, rejects a codec mismatch, and validates registered primitive values at
runtime. `xai_pref_collab_default_share` additionally accepts only `comment`,
`edit`, and `view`. JSON remains open-shaped deliberately; no schema was inferred
from registry defaults. Invalid supplied defaults are refused before an updater
runs. An unclassified key returns `{ ok: false, reason: "invalid" }` rather than
rejecting its Promise.

The engine records only an unannounced post-write/readback uncertainty by physical
key and intended raw value. A later identical absolute write or reset reconciles
only when current bytes still equal that intended raw state, publishes once, and
clears the marker. A mismatching external value clears the marker; ordinary no-op
continues to write and publish zero times. Existing `AccountWriteResult` remains
unchanged, including its mapping of readback uncertainty to `storage`.

## Verification

`python3 docs/reviews/web-d2-async-pref-astra-engine/run.py 2c5dc319126541085e7620c4c9ae23413db2c816`
ran Astra's unmodified fixed-archive test source: **21/21 PASS**. The exact raw
result is preserved in [fixed-2c5dc31-after.log](fixed-2c5dc31-after.log); the
original 5ed before log remains untouched.

Additional regression evidence:

- `pnpm --filter @repo/plugin-web-storage check-types` — PASS.
- `pnpm --filter @repo/plugin-web-storage test -- --run src/__tests__/prefMutation.test.ts src/__tests__/accountCoordination.test.ts` — 14/14 PASS.
- `pnpm --filter @repo/plugin-web-storage test` — 174/174 PASS.

The package test run emitted pre-existing jsdom `act(...)` environment notices and
expected storage-fault warnings; Vitest exited 0.

## Scope limits

This is an engine and adapter repair only. Sol owns async hook/session behavior
and the Settings pane. Native Web Locks, real two-document UI behavior, all hook
consumers, and release gates require their separately scoped evidence.
