# Async preference engine repair — fixed independent follow-up

Astra, Web, 2026-09-09. Product fixed at `2c5dc319126541085e7620c4c9ae23413db2c816`. **The original four repair groups now pass their original 21 assertions, but the engine remains not accepted because four necessary repair-boundary assertions still fail.** These are within [a82efa0](../web-d2-async-pref-contract/contract.md); hooks/session and the real Settings pane remain separate ownership.

## Independent evidence

| Fixed run | Result | Raw evidence |
| --- | --- | --- |
| Original engine assertions, unchanged test source | 21/21 PASS | [original21](independent-2c5dc31-original21.log) |
| Repair-specific defaults/codec/reset and external-replacement controls | 3 PASS / 4 FAIL | [repair boundaries](independent-2c5dc31-repair-boundaries.log) |
| C primitive contract | 29/29 PASS | [C contract](c-primitive-independent-astra-engine-2c5dc31.log) |
| C additional boundaries | 8/8 PASS | [C boundaries](c-primitive-boundaries-astra-engine-2c5dc31.log) |
| D1 shared writer | 8/8 PASS | [shared writer](d1-shared-independent-astra-engine-2c5dc31.log) |
| D2 foundation | 14/14 PASS | [foundation](d2-foundation-independent-astra-engine-2c5dc31.log) |
| D2 deletion admission | 2/2 PASS | [admission](d2-deletion-admission-astra-engine-2c5dc31.log) |
| Storage package | 21 files, 174/174 PASS | [package](c-storage-package-astra-engine-2c5dc31.log) |

These are independent Astra executions against git archives, not the author’s 21/174 output. Source dependencies are installed dependencies; all product imports resolve inside the archive. The established C/D1/D2 runner logic and independent fixtures were reused without business-assertion changes; the wrapper only redirects new logs into this directory. Package output includes existing React `act`/storage-fault warnings and exited 0. Test layers are not added together as a coverage metric. No additional independent type-check claim is made.

The original `engine.test.ts` and `independent-5ed9329-before.log` have no diff against `20da766`; the original 10 FAIL / 11 controls remain preserved. Terra’s append in the previous report is explicitly headed and now additionally marked **author-only, not Astra acceptance**. It retains the author’s actual claims while this file records the independent verdict.

Reproduce:

```sh
python3 docs/reviews/web-d2-async-pref-astra-engine/run.py 2c5dc31
python3 docs/reviews/web-d2-async-pref-astra-engine/run.py 2c5dc31 repair-boundaries.test.ts
python3 docs/reviews/web-d2-async-pref-astra-engine/run-regressions.py 2c5dc31
```

## Remaining failures and minimum ownership

1. **P2 — `allowAbsentDefault` is a public bypass for registered defaults.** The new guard in `prefMutation.ts` skips all default validation whenever `reset && allowAbsentDefault`. Calling the actual exported engine for registered `xai_pref_collab_default_share`, with `defaultValue: 'invalid'` and both flags, returns `{ok: true, value: 'invalid', source: 'absent'}`. The comment says only dynamic autosave removal may use this representation, but the implementation does not enforce that condition. Constrain the exception to a valid, unregistered pref binding, reset operation and the precise permitted absent representation. Registered reset must always use a valid domain default; an arbitrary public flag cannot waive validation.

2. **P2 — the new default-validation stage can reject the Promise.** A validator that throws now escapes at the pre-lock default check, outside the result-catching block. The repair test requires a resolved typed refusal and receives `Error: validator fault`. Binding/default/current/output validators must all be contained by the engine’s typed error boundary, with no mutation or notification on failure. Do not remove runtime validation to avoid the exception.

3. **P2 — same-key registered autosave reset publishes an invalid default.** A legitimate `setPrefAutosaveAccount('collab_default_share', 'edit', {codec: 'string', validate})` succeeds. Its corresponding public removal succeeds and physically removes the key, but the same-key subscriber receives **`undefined`**, not registry default `comment`. `storage.ts` currently always passes `defaultValue: undefined, allowAbsentDefault: true` for autosave removal, including registered keys. Resolve registered defaults consistently with `removePrefAccount`; keep explicit undefined absence only for a legitimate dynamic binding. This is an engine/publication defect shown by an actual subscriber, not a claim about untested hook UI behavior.

4. **P1 — dynamic primitive codec coercion remains accepted.** `setPrefAutosaveAccount('repair_dynamic_string', {bad: true}, {codec: 'string'})` reports success. The dynamic fallback still relies on encodability, while `validateRegisteredPrefValue` returns true for an unregistered key. Runtime primitive validation must be shared across registered and dynamic bindings: a string codec requires a string, boolean requires boolean, number requires a finite number. Apply it before default/output encoding and source mutation; a provided validator supplements, rather than overrides, this primitive boundary. Preserve legitimate dynamic JSON behavior and explicit domain validators; do not infer arbitrary JSON schemas from registry defaults.

Terra owns `internal/prefMutation.ts`, the four explicit Account adapters in `internal/storage.ts`, and the necessary shared validation/engine tests. Sol retains `usePrefAsync`/`usePrefAutosaveAsync` session/reset/projection ownership. Coordinate public result changes with Sol if needed, but these four fixes do not require editing hooks or the pane. Do not change registry ownership, physical keys, canonical admission, lifecycle locks or production activation.

## Repair controls preserved

The original 21 PASS retains all earlier successful controls plus the original refused-codec/source/default/key and uncertain-readback assertions. The three added passing tests specifically establish:

- Legitimate registered string and boolean writes, dynamic JSON `[]` creation, and dynamic removal still succeed with correct raw bytes.
- After an uncertain physical write, observing an external replacement clears old reconciliation attribution. An old raw-baseline retry refuses without replacing the external value or notifying; a later ordinary equal-value no-op does not revive the old attribution.
- A changed persistent generation marker refuses an uncertain retry before notification. With valid same-owner admission, identical intended bytes reconcile once, and the next ordinary no-op publishes nothing.

No wider investigation is needed for this rejected snapshot. The next fixed repair must pass the unchanged original 21 and new seven tests, preserve the listed regression evidence, and add only tests necessary for the actual narrow fix. Parent’s separately scoped native pane/functional/owner checks are not replaced or negated here.

Only owned review fixtures/runners/reports/logs changed; Sol’s dirty hook files were protected. No product, ledger or parent tests changed, and no push was performed. This remains an engine-only verdict: the full async preference batch, D2, AI-02 and REL-05 stay open, with already accepted Settings deletion and Board detail unchanged.
