# Async preference engine — independent bounded rejection

Astra, Web, 2026-09-09. **Do not accept the engine slice at `5ed93291714f94f42678b9223ee98440f796209f`.** The independent fixed-archive run has **21 tests: 11 PASS, 10 FAIL**, grouped into the four repair contracts below. They are existing requirements of [a82efa0](../web-d2-async-pref-contract/contract.md), not an expansion into hooks, Board or account deletion.

This review only changes its own evidence directory. Product source was taken from `git archive 5ed9329`, with the independent test copied into that temporary package. Installed dependencies are symlinked; no live product source is overlaid. `04d036b` changes the pane validator reference and is not the reviewed engine revision. Parent-reported native pane/functional results at that later snapshot remain useful evidence for their stated scope; they do not discharge the failures here.

## Reproduction and provenance

Run from the repository root:

```sh
python3 docs/reviews/web-d2-async-pref-astra-engine/run.py 5ed9329
```

[Independent before log](independent-5ed9329-before.log) records the full commit, archive directory, independent test SHA-256, each assertion name and exit code 1. [Test source](engine.test.ts) exercises the actual public implementations of `mutatePref` and all four explicit Account APIs, real jsdom localStorage with exact-key fault injection, and the existing migration API. There are no mocked product success responses. The named shared/exclusive lock simulator preserves account/key nesting and contention; it is not native Web Locks evidence.

The first launcher used a nonexistent root-level Vitest binary. [Preserved initial runner failure](runner-initial-missing-binary.log) is harness-only: it executed no product tests. The committed runner uses the installed storage-package Vitest binary, and the substantive before log is from that corrected runner. No failed business assertion was changed to obtain the 11 controls.

## Four bounded repair groups

| Group | Independent failures and fixed-source cause | Minimum repair ownership/contract |
| --- | --- | --- |
| **P1 — registered key/codec binding (2 FAIL)** | On an absent `xai_pref_collab_default_share`, both `mutatePref({codec: 'json', next: 'edit'})` and `setPrefAutosaveAccount('collab_default_share', 'edit', {codec: 'json'})` report success. `prefMutation.ts:60–71` trusts the supplied codec; `storage.ts` autosave wrapper independently defaults/selects its codec. This permits JSON encoding of a registry string preference. | Terra: `prefMutation.ts` and the four `storage.ts` adapters. Resolve registered-key codec centrally and reject disagreement before any mutation, including absent initialization and reset. Open-ended suffix validation must not bypass registered binding. Preserve the same physical key; do not rewrite its format or change registry ownership. |
| **P1 — public schema/source refusal (3 FAIL)** | `setPrefAccount('xai_pref_collab_show_avatars', {})` reports success through boolean coercion. The registered account default-share setter also accepts the existing invalid source `corrupt-permission`, and its reset reports success rather than preserving that invalid source. `storage.ts:233,272` uses `encode(...) !== null` as the validator, so runtime shape/domain validation supplied by a stricter caller can be bypassed via another participating public API. | Terra: central storage-owned codec/value validation and the wrappers. Reject wrong runtime primitive types rather than coercing them. Use one declared validator for the selected `comment/edit/view` preference across engine and public set/remove/autosave paths. Do not infer arbitrary JSON domain schemas solely from registry defaults; keep known legitimate structured callers working and use explicit domain validators where required. Lock coordination without consistent source/schema validation is insufficient. |
| **P2 — binding validation/result contract (3 FAIL)** | `mutatePref` passes an invalid absent default into a functional updater and succeeds if the updater returns a valid value (`prefMutation.ts:84–87`). Reset of an absent key directly returns an invalid default as a successful snapshot (`:75`). An unclassified key throws before the result-catching block (`ownershipForKey` at `:65`, catch starts at `:98`), so its Promise rejects instead of returning typed invalid refusal. | Terra: validate binding/default before updater execution and before reset/no-op success; place key/ownership validation inside the typed error boundary. Invalid bindings must neither execute an updater nor mutate/publish. Keep genuine physical absence distinct from invalid/unavailable storage. Dynamic autosave removal that intentionally has no domain value needs an explicit absent-result representation or validated default contract; do not make `undefined` a general validation bypass to retain the old adapter. |
| **P2 — uncertain readback reconciliation (2 FAIL)** | Exact-key get fault after the actual set/remove causes a truthful first refusal, with no notification. After fault removal, the same public set/remove retry reports success, but the existing subscriber is called zero times. The independent tests verify the physical intended value/removal and then require one notification. Early no-op returns at `prefMutation.ts:75,90` have no recovery of a prior unannounced commit. Existing sibling hooks can remain stale despite successful retry. | Terra: keep enough narrowly scoped uncertain-commit attribution in the shared engine to verify the intended raw result and publish one reconciliation on successful retry. Bind it to physical key, owner/generation and intended bytes/removal; revalidate admission/source on retry, and invalidate stale attribution on an external replacement. Preserve zero-write/zero-notification ordinary no-op behavior. No rollback of unknown bytes, receipt journal, or silent conflict overwrite. This must work through public wrappers even though their legacy result union maps readback uncertainty to `storage`. |

The first three groups assert refusal as the primary oracle; the failure log records the actual success/rejection disagreement. Source inspection identifies the coercion/encoding/removal route. The last group additionally observes real persisted bytes and absent notifications before its final failed assertion. None of these failures requires a provider or browser crash hypothesis.

## Valid controls retained

The 11 passing tests establish the following bounded behavior at this fixed revision:

- Valid absent creation, expected-raw conflict refusal, valid reset and ordinary no-op preserve their byte/publication contract when the supplied binding is correct.
- Strict supplied validators reject a physical `null` string for the permission domain; invalid updater output, a throwing updater and exact-source read failure do not write.
- Generic canonical mutation and registered canonical public set/reset refuse and preserve the original bytes.
- All **four** public pref/autosave set/remove APIs request account shared coordination and wait behind the **same full physical-key exclusive lock**. The test checks each actual request and final ordered outcomes, not only helper names.
- Two independently submitted functional mutations through the named lock manager preserve both increments using current persisted input.
- Three separately queued key-lock cases refuse after owner, full generation marker or tombstone changes, before changing the preference bytes.
- Account/key lock rejection has no fallback write; the device branch requires only its key lock and remains independent of current account marker state.
- A throwing observer does not convert a successful save into failure or prevent the next observer from receiving the committed value.
- A successful async write before migration is copied into the published generation. A separately scheduled write submitted while migration holds account exclusive remains pending, then refuses its old generation after publication. The fixture never awaits the shared writer inside the exclusive migration callback.

These checks confirm useful implementation work; they do not outweigh the ten failures. The run is deliberately bounded once the engine is already unacceptable. It does not claim full storage-package/C37/shared8 coverage, all value codecs, real cross-process locks, hook-session recovery or the actual Settings UI. The parent owns separate native/UI evidence and Sol owns the parallel hook/session work.

## Repair handoff and acceptance chain

Terra may change `packages/plugin-web-storage/src/internal/prefMutation.ts`, the four async adapters in `internal/storage.ts`, a small storage-owned binding/validation helper if needed, and storage engine tests. Preserve exported Promise result compatibility, account→key lock order and canonical refusal. Sol's `usePrefAsync`/`usePrefAutosaveAsync` session/reset/projection work is separate ownership: coordinate interface changes with Sol instead of patching those files here. Keep the selected enum validation consistent through the shared storage boundary; a pane-only validator cannot protect other public writers.

Re-run these exact 21 assertions against a fixed repair archive, retaining this before log. All ten refusal/reconciliation assertions must pass without weakening the eleven controls. Add only repair-specific tests for legitimate same-codec public calls, uncertain retry versus external replacement, and any new binding validator representation. Then run the affected storage regression suites/types and shared C/D1/D2 contract tests as required by the implementation changes. Integrate with the independently reviewed hooks and real pane only after each ownership slice is fixed.

No product or parent test was changed; no push. Full async-pref batch, D2, AI-02 and REL-05 remain open. Already accepted Settings durable deletion and Board detail are not reopened by this review.
