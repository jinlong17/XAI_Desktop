# Async preferences — final acceptance of the defined a82 slice

Astra, Web, 2026-09-09. **Accept the currently defined a82 async-pref slice at `20a4591f1418e07e57208bbe4567d8f183c5ffd3`: shared preference engine, explicit registered and dynamic async hooks, and the existing Collaborate default-share consumer.** All six hook failures from `2bd330a` are resolved under their original independent assertions. The dynamic binding is implemented and independently exercised. No remaining defect was established in this defined slice, and no additional generalization is needed to accept it.

This closes this limited acceptance task, not full D2, AI-02, REL-05, every open-ended business schema or remaining callers. Dashboard note integration is its separate [9aac0ea batch](../web-d2-dashboard-note-contract/contract.md); its newer product changes and Terra's dirty files were excluded. The parent owns status/ledger updates; none was edited here.

## Independent fixed evidence

All new executions below used git archives. The independent hook runner copies only review tests and the named lock fixture. Original package tests/types run without that test overlay; Settings imports and type paths explicitly resolve all workspace packages inside its archive. No live Dashboard or storage source was used as product evidence.

| Layer | Result and provenance | Evidence |
| --- | --- | --- |
| Original Astra hook supplement | **9/9 PASS**, unchanged assertions | [original9](independent-20a4591-original9.log) |
| Original functional diagnostic | **PASS**, unchanged scenario | [diagnostic](functional-diagnosis-20a4591.log) |
| New dynamic binding boundary/control checks | **5/5 PASS**, Astra-authored | [dynamic log](independent-20a4591-dynamic-final.log), [test source](dynamic-final.test.tsx) |
| Original author hook contract, independently rerun | **17/17 PASS** | [hook suite](independent-20a4591-author-hooks.log) |
| Fixed Storage package/types | **22 files, 193/193 PASS; types exit 0** | [package](independent-20a4591-package.log), [types](independent-20a4591-types.log) |
| Fixed Settings package/types | **42 files, 282/282 PASS; types exit 0** | [package](independent-20a4591-settings-package.log), [types](independent-20a4591-settings-types.log) |
| Accepted engine dependency | Existing independent acceptance at **6504589**; relevant engine/adapters/coordination/C source blobs unchanged at 20a4591 | [engine acceptance](../web-d2-async-pref-astra-engine/review-6504589.md), [source identity](engine-identity-20a4591.txt) |
| Parent fixed integration (`41950a7`) | Hook2, dynamic3, native5 and whole-Chrome persisted reopen5 PASS | [parent review](../web-d2-async-pref-native/parent-20a4591-review.md), [raw native evidence](../web-d2-async-pref-native/native-20a4591-repair.json) |

The parent native evidence records actual PID **52702 → 52777**, SIGTERM with observed process exit, and separate initial/reopen checks. It includes held-account-lock waiting, quota/latest draft, two-document functional increments, pending A→B with device controls usable, and readback-uncertain Retry without a second write. This is explicitly attributed parent evidence; Astra did not rerun Chrome here. Persisted reopen does not prove crash-durable unsaved drafts or background/provider continuity. Component, native and package counts are not combined as coverage.

The original d6184ee 6 FAIL / 3 PASS log and functional diagnostic remain unchanged, as do all engine before logs. The package logs retain React environment/expected storage warnings and exit 0. Author evidence `2c375a0` was inspected but is not the source of these independent PASS labels.

## Six repairs, checked by source and original assertions

- **Stale autosave draft after reset/projection:** the wrapper now uses the shared controller's value, eliminating its second stale draft store. Both original reset-failure and post-reset pending assertions retain the latest correct value.
- **Registered domain projection:** `prefCodecValidator` composes strict codec and registered domain validation; the registered hook and autosave resolver retain that boundary when an optional caller validator is supplied. The corrupt default-share source now projects invalid/error rather than valid.
- **Validator exceptions:** guarded hook validation returns a typed invalid outcome on edit, while bad stored values remain a source error. A thrown input validator no longer escapes synchronously.
- **Device/account distinction:** binding identity uses a device identity for device keys; live/enqueue scope checks remain mandatory for account keys. The original queued device write survives A→B and remains on the device physical key. Account unmount/owner isolation controls remain green.
- **False functional conflict:** after a successful request with no queued draft, a differing observed raw value is reread/projected as the latest committed state, rather than marking the already-applied operation failed. The original diagnostic now shows physical `167`, first hook `167/idle`, second `167/saved`; a subsequent physical `170` event yields both `170/idle`. Both increments still occur once. If an absolute queued request has a real stale baseline, the engine's next locked comparison remains in force; the original dirty-conflict/reload control still passes.

The engine remains the accepted implementation. No repair changed physical preference format, canonical receipt storage, lifecycle lock order or production activation.

## a82 acceptance matrix resolved from evidence

This table supersedes historical “awaiting verification” labels only for this fixed slice. It does not modify the parent-owned [tracking matrix](../web-d2-async-pref-contract/acceptance-status.md).

| Explicit contract area | Outcome / evidence boundary |
| --- | --- |
| Registered key/codec/domain schema and strict source/default refusal | Satisfied by accepted engine original21/repair7 and current registered hook domain/exception assertions. Configuration-invalid dynamic bindings intentionally fail before hook state; user edit/storage failures return typed outcomes. |
| Four public async APIs on one physical-key lock; functional latest; no-op/reset | Accepted engine evidence retained with source identity. Current hook functional, ordered reset and reset-failure oracles pass. |
| Owner, marker, tombstone, account→key ordering, device branch and migration | Accepted engine controls retained; original/current hook disposal/owner checks plus current registered and dynamic device tests pass. Native lock and owner evidence is separate from simulated migration interleavings. No all-writer migration claim. |
| Promise results, pending and later edits, active duplicate Retry | Current independent nine plus independently run original17 pass. The select stays in the existing live-save flow, and pending/failed state cannot be inferred from Promise truthiness. |
| Session/key changes, unmount/remount, reset→new edit, old completion | Original17 and independent nine pass. Dynamic pending suffix change independently refuses old work while leaving the new key untouched until its own edit. |
| Same-tab/storage-event projection, clean adoption, dirty conflict and explicit reload | Original functional diagnostic and dirty/reload assertion now pass; original17 retains sibling/reload coverage. Reads use physical state rather than trusting the event's stale payload. |
| Uncertain readback, original-baseline retry token and once-only notification | Accepted engine token13 remains valid. Current independent reset/duplicate-retry case passes, original17 tests set retry/sibling behavior, and parent actual pane uncertainty passes with one physical write. |
| Dynamic suffix/codec/default/validator binding | Current independent five plus parent dynamic3/original17 pass: malformed suffix/config and registered-codec mismatch refuse, actual account string preserves absence until edit, explicit empty remains valid, reset removes, JSON invalid source/output refuse, reload adopts valid empty, key change invalidates pending work. Dynamic device pending work survives account switch. This validates the API contract, not arbitrary caller-specific schemas. |
| Initial source/default and no mount write | Dynamic string and parent dynamic3 verify physical absence remains absent. No generic mount normalization is introduced. Existing malformed/null source tests and engine refusal remain preserved. |
| Real Collaborate account default-share integration | Parent native5 and Settings package confirm actual select, Saving, quota/latest retry, correct string bytes and owner behavior. This is an existing real consumer of the shared path; the dynamic overload is not falsely described as already used by every caller. |
| Device toggles and EN/ZH existing UI | Settings tests and parent owner-switch/native controls preserve these. No new export/reset product feature was required for Collaborate. |
| Whole Chrome reopen | Parent five persisted checkpoints pass at the same fixed revision; only already-saved state is established. |
| Original sync signatures/canonical refusal/admission | Engine source identity and storage regression preserve compatibility. No old setter is secretly converted to Promise semantics, and no canonical generic write or activation bypass is accepted. |
| Package/types | Fixed Storage193 and Settings282/types independently pass. These support, rather than replace, behavioral evidence. |
| Other callers, global reset, scoped raw/direct business/provider/timer writers and universal old-client rollout | Explicitly outside this acceptance; remain open in D2. They were never prerequisites to accepting this bounded first consumer/hook batch. |

## Reproducible handoff and limits

```sh
python3 docs/reviews/web-d2-async-pref-astra-hooks/run.py 20a4591
python3 docs/reviews/web-d2-async-pref-astra-hooks/run.py 20a4591 functional-diagnosis.test.tsx
python3 docs/reviews/web-d2-async-pref-astra-hooks/run.py 20a4591 dynamic-final.test.tsx
python3 docs/reviews/web-d2-async-pref-astra-hooks/run-package.py 20a4591
python3 docs/reviews/web-d2-async-pref-astra-hooks/run-settings.py 20a4591
```

Terra may use this accepted dependency for the separately specified Dashboard account-note integration. That caller must still satisfy its frozen editor baseline, explicit Save/Enter/blur, empty-string Clear, draft/export/beforeunload and device-offset boundaries; parent caller-native successes are not inherited acceptance of those requirements.

Process-local uncertainty tokens are not durable command receipts, raw baselines have the previously stated ABA boundary, and new Web Locks cannot stop old direct writers. No provider, deployment or universal rollout gate was tested or opened. Only owned review files, fixtures and logs were committed; no product, parent tests, shared status table or ledger changed, and no push was performed. Full D2/AI-02/REL-05 remain open.
