## Codex Cross-vendor Review

**Feature**: repository-v0-contract  
**Commit(s)**: 744d578  
**Reviewer**: codex feature-review (cross-vendor) · gpt-5.4 high  
**Verdict**: REVISE

### Strengths (max 4 bullets)
- `packages/core-data/src/entities.ts` gives a clean canonical TS surface for the eight intended G2.1 entities, and `docs/contracts/data-repository-v0.md` §3.1 matches that table row-for-row.
- Boundary discipline is good: the contract stays in `@repo/core-data`, adds no plugin-to-plugin coupling, and does not violate architecture red lines #4/#8/#9.
- `Repo<T>` now freezes the important cross-driver surface (`listByIndex`, `metadata`, `transaction`, `migrate`) early enough for G2.2-G2.6 to build against one seam.
- The reusable contract harness is a solid start, and the discriminated `RepoEntity` union is directly usable from plugin code via `entityType` switches without extra narrowing helpers.

### Gaps & risks (max 6 bullets, severity-tagged)
- [P1] `packages/core-data/src/repo-utils.ts` does not actually enforce the documented `entityType` invariant. `assertRepoRecord()` only checks for `"."`, so invalid values that should fail the frozen contract still pass; this contradicts the stated `^[a-z]+\.[a-z_]+$` rule and the “helpers reject bad records with E3005” requirement.
- [P1] Clipboard’s device-local guarantee is only type-level. Runtime code accepts a malformed `"clipboard.item"` record with `syncScope: "account-sync"`, so a casted or decoded payload could cross the later sync boundary despite docs saying this invariant is enforced.
- [P1] `packages/core-data/tests/repository-contract.ts` under-covers the contract it claims to be canonical for. It does not test corrupted storage handling, wrong-key/encrypted-driver failure, or runtime sync-scope enforcement, yet `docs/contracts/data-repository-v0.md` lists those as required driver proofs.
- [P2] Doc/code alignment is incomplete outside §3.1: the same contract doc still lists `productivity.pomodoro_session`, `widgets.widget`, and `account.device` in the earlier entity table, which makes the v0 surface read broader than the code actually freezes.
- [P2] Workflow hygiene is close but not finished: `packages/repository-v0-contract/docs/dev_log.md` leaves the Work Log commit column as “pending commit” even though `744d578` exists.
- [P2] The naming rule intentionally accepts future `sync.outbox`, but would reject hyphenated second segments such as `productivity.todo-list`; if hyphenated slugs are ever desired, that needs an explicit contract decision rather than silent drift.

### Concrete next-phase targets (max 6 bullets)
- Add `assertRepoEntity`-level runtime validation for regex-conformant `entityType` values and entity-specific `syncScope` rules, especially `clipboard.item`.
- Extend the canonical contract suite with negative cases for corrupted JSON rows, invalid record payloads, and migration/version errors that must surface as `E3005`/`E3006`.
- Split encrypted-driver obligations into an opt-in contract block so SQLCipher/wrong-key behavior is actually testable before G2.3/G2.6 claims compliance.
- Reconcile `docs/contracts/data-repository-v0.md` so non-G2.1 entities are either removed from v0 tables or explicitly marked deferred.
- Update `packages/repository-v0-contract/docs/dev_log.md` Work Log to record `744d578`.
- Add a tiny exported helper such as `isRepoEntityType`/`assertRepoEntityType` for plugin code that decodes untyped payloads.

### Out of scope confirmed
- SQLCipher PRAGMA application and real wrong-key runtime proof remain deferred to later G2 rows.
- Live Supabase / two-Mac sync smoke, real outbox/network E2E, and signed-runtime/MAS sandbox evidence remain deferred.
- `plugin-organizer` localStorage runtime cut-over and real macOS Finder/runtime smoke are still valid deferred gates, not regressions in this review.