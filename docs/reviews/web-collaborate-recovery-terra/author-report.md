# Collaborate recovery — Terra author evidence

## Scope

Implemented only the contract-owned Collaborate pane, its local i18n/styles and
focused tests, plus the permitted Settings-host display metadata and shared
44px dialog-button minimum size. No storage registry, ownership map, shared
async engine, auth/routing arbitration, global reset, timers, or Smart Lists
recovery behavior was changed.

## Implementation coverage

- The three actual controls use `usePrefAutosaveAsync`: `default_share` stays
  account-scoped and each boolean stays on its independent device key.
- Per-field caller drafts retain a latest user value across pending/error/
  conflict/uncertain results; retry and discard/reload target only that field.
- An account epoch revokes the old account draft and all old guard/export
  capabilities while preserving device drafts and operations.
- The departure guard and `beforeunload` block only real current drafts.
  Collaborate supplies non-sensitive localized display metadata to the existing
  composed host guard; no route-state-machine branch was added.
- Export is memory-derived and emits the exact `collaborate-draft.json` schema
  with separate `account` and `device` objects; setup failure leaves drafts
  intact.

## Author verification matrix

| Contract area | Author evidence | Status |
| --- | --- | --- |
| Three producers / no seed | Focused test activates both ownership domains, changes both booleans and `default_share`, and checks all three independent persisted values. It asserts device keys start absent before the first edit. | PASS |
| Strict source and forged values | Registered async validators are passed for exact booleans and closed `default_share`; no direct setter/raw write remains. | Code inspected; native negative oracle pending |
| Lock, latest, partial and retry | Each producer calls the accepted per-key async binding; caller drafts retain values and Retry targets the named field. | Code inspected; lock/partial stress oracle pending |
| Source/conflict/discard | Recovery UI distinguishes source repair from current local failure and calls only the named binding's reload/retry. | Code inspected; external-source oracle pending |
| Uncertainty | Caller preserves its draft until the hook's explicit successful result; retry delegates unchanged-token reconciliation to the accepted engine. | Code inspected; actual readback-denial oracle pending |
| Mixed scope / A to B | Account draft and composite capability token are revoked on epoch; device sessions stay stable and remain exportable/guarded in the new epoch. | Code inspected; pending/uncertain/old-callback actual oracle pending |
| Export / unload | Export is built only from validated memory drafts with exact account/device shape and real Blob/URL/anchor cleanup. `beforeunload` is installed only for current drafts. The follow-up adds export availability while a device lock is held. | Focused pending-lock test PASS; parent fixed-hash native rerun pending |
| Actual composed host | The existing guard state machine is reused. Optional localized label only changes displayed metadata; dialog controls have 44px minimum inline and block target dimensions. | Typecheck PASS; parent real host oracle pending |
| Presentation | Recovery actions wrap and have 44px block size; shared departure buttons now also have 44px minimum inline size. | Code inspected; parent 375px visual oracle pending |

- `pnpm --filter @repo/plugin-web-settings-rest test` — PASS: 43 files,
  287 tests. Existing `MorePaneContent` act warnings were emitted by an
  unrelated test and did not fail the run.
- `pnpm --filter @repo/plugin-web-settings-shell test` — PASS: 11 files,
  54 tests. Existing canonical-removal diagnostic messages were expected by
  the reset tests and did not fail the run.
- `pnpm --filter @repo/plugin-web-settings-rest typecheck` — PASS.
- `pnpm --filter @repo/plugin-web-settings-shell typecheck` — PASS.
- `pnpm --filter @repo/web check-types` — PASS.
- Focused `collaboratePane.test.tsx` covers all three live producers, verifies
  no absent device sibling is seeded, and holds the real device-key lock to
  verify that a pending draft still exposes Export.
- Parent-owned native runs reported the original six real-browser modes PASS on
  `2bbc696`; the follow-up test first reproduced pure-pending Export failure,
  then PASSed it on `2b02dd3` with actual disk JSON containing only
  `show_avatars:false`, followed by raw false persistence and unload release.
  Parent is rerunning the six baseline modes on `2b02dd3`.
- Independent contract scenario 24 then found a separate UI-only gap: a pure
  pending draft retained its Export action but did not render the localized
  export-setup failure. The follow-up author test holds the same device key,
  makes `URL.createObjectURL` throw, and verifies the error plus retained false
  selection. Independent rerun remains required.
- Independent real-composed-host mounting then exposed one bounded defect, not
  seven business failures: a newly allocated guard on each pane render caused
  `registerDepartureGuard` to loop through host state updates. The pane now
  keeps its guard operations stable through current-value refs while retaining
  epoch-token changes and draft-version host notification. A focused stateful
  registration callback test passes; the independent router-host suite must
  rerun this exact commit.
- The subsequent independent mixed-scope contract run found that the stabilized
  old guard delegated to current callbacks and could discard a surviving device
  draft after A to B. Each guard operation now checks its own captured composite
  token before reading current state. The focused regression holds a device
  operation, changes account epoch, and proves the old guard is inert while the
  false device selection remains visible. Independent rerun remains required.
- Native 375px visual evidence then found the all-field recovery action stack
  pushed Export below the first viewport despite valid 44px targets. The pane
  now groups each field's status with compact visible Retry/Discard controls,
  retains full per-field accessible names, and uses a mobile-first grid that
  expands only from 768px. The parent must verify the required five viewport
  widths and the first-viewport Export placement.
- The next independent ABA lock case found that a prior successful `edit`
  completion could clear a later same-value `edit` draft whose own key
  admission had failed. Each user edit now creates a distinct draft identity;
  success and Retry clear only that exact draft. The focused producer test
  performs `edit → view → edit`, admits the first key request, rejects the
  second, and verifies Not saved plus Export remain for the final `edit`.

## Independent validation still required

The parent-owned real Chrome fixture must finish its rerun after product commit
`2b02dd3`.
It owns the fixed-before comparisons and actual-disk export modes, full-storage
denial, mixed-owner pending/uncertainty/old-capability cases, partial success,
and composed-host departure behavior. Package tests and typechecks do not
replace those browser oracles. This report does not accept REL-05, REL-09, or
the broader D2 program.
