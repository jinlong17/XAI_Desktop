# B1 canonical compatibility — Astra independent review

Module: Web. Fixed baseline `fb3ae2f3e9f4def7c2c40fad04b5a1e588f7830b`; removal repair `7b584b3da756549f7a4fdd49dd427917c575992d`. Product came from immutable git archives; Terra's concurrent B2 edits were excluded. This review owns documentation/test artifacts only.

**Bounded verdict: accept B1 reader compatibility plus the `7b584b3` removal repair as the foundation for B2–D.** Baseline `fb3ae2f` alone fails protected-removal preservation. No additional B1 blocker was found in the independent boundary checks. This is not approval to activate canonical envelopes in public Web, nor acceptance of domain validation, all-writer coordination, durable replay, reset UX, B2–D, or complete AI-02.

## Evidence

Run `node docs/reviews/web-board-workspace-astra-review/verify-b1.mjs <revision>`.

| Fixed revision | New independent assertions | Existing storage package rerun |
| --- | --- | --- |
| `fb3ae2f` | 13/13 PASS, `b1-independent-fb3ae2f.log` | 17 files, 136/136 PASS, `b1-storage-package-fb3ae2f.log` |
| `7b584b3` | Same 13/13 PASS, `b1-independent-7b584b3.log` | 17 files, 137/137 PASS, `b1-storage-package-7b584b3.log` |

The new assertions use real jsdom Storage and React mounts. They cover missing versus decoded legacy null/empty/primitive values, byte-preserving read-only behavior, malformed and maximum-safe revision, receipt count 512/513, ID length 192/193 and control characters, invalid receipt shape, inherited-property lookup rejection, protected readable removal/write rejection, stale/locked owner, ordinary legacy write/read/removal, migration domain-validator input, initial/remounted hook projection, rejected setter state preservation, and domain-valued same-tab publication. The author's existing cross-tab StorageEvent projection test was independently rerun in the package suite; no new native-browser or production-deployment claim is made.

The four `*-harness-setup-attempt.log` files preserve unsuccessful first attempts: the independent suite could not resolve React DOM, and the package suite omitted its `clearMocks`/`restoreMocks` settings, leaking a quota mock into three subsequent migration tests. The corrected runner supplies the React DOM alias and mirrors the package's restoration settings. Product assertions were not weakened. These setup results are not product regressions or part of PASS totals.

The separate parent-authored independent preservation evidence remains authoritative for the removal defect: [review](../web-canonical-remove-read-failure/review.md), original `independent.log` (1 correct FAIL/1 control PASS, evidence `1831585`), and `independent-7b584b3.log` (same assertions 2/2 PASS, evidence `96df149`). I reviewed the exact repair: `storage.ts:240–255` now reads protected keys within a try/catch and returns before any removal if reading fails. It no longer authorizes removal from `readRawPref`'s lossy null. This review did not duplicate that fault fixture.

## Source and semantic boundaries

- `canonicalCommandState.ts:71–95,108–124` separates physical absence from parsed content, JSON damage, unsupported envelope version, and unavailable scope/storage. The decoder itself never writes or seeds. Safe integer revision, own data field, receipt map/count and receipt fields are checked. `98–104` uses own-property receipt lookup, including safe treatment of JSON `__proto__` keys covered in the existing suite.
- `legacy` means “no recognized canonical envelope,” **not “valid domain dataset.”** JSON `null`, primitives, arrays, and objects with an unrecognized format tag all retain their value in that state. Likewise `envelope` confirms outer/receipt shape but does not validate `data`; `{data:null}` can be structurally accepted. Tasks/Calendar must validate the projected payload before seed, write, migration, or command execution. Valid-empty, absent, and domain-invalid cannot be conflated. The generic cast `<T>` is not a runtime validator.
- `storage.ts:24–40,150–160` and `usePref.ts:174–185` deliberately expose the legacy-compatible data projection. `getPref`/`usePref` can still project corrupt/unsupported data to their old defaults. They must not become authoritative pre-write or recovery readers. Later writers must use the result-bearing snapshot and domain guard. Current legacy writes preserve readable recognized envelopes, corrupt canonical headers, unsupported versions, syntax-invalid JSON and JSON null; ordinary noncanonical legacy values remain on the old compatibility path.
- `accountMigrationValidation.ts:24–30` unwraps only for the owner validator; it does not replace the original raw bytes. Independent tests prove both legacy and envelope feed the same validator and invalid projected data is rejected. They do not prove B2's actual Tasks/Calendar validator registrations or complete migration/import/export flows; that is explicitly subsequent work.
- `usePref.ts:213–221` still updates local reset state unconditionally after void `removePref`, even if protected removal is refused. This is a known D reset/result-propagation obligation, not a claim that B1 implements the future reset UX. Same-tab publication expects domain data; a future canonical writer must publish the projection, not the envelope.

## Remaining gates

The original six durable replay failures remain correct and were not rerun or relabeled here. B2–D must enforce domain shapes for both legacy and envelope data, make all participating writers preserve receipts under one serialization protocol, define overflow/revision exhaustion without lossy eviction, propagate commit/reset failures, and pass the original durable replay plus concurrency/fault assertions. This decoder's capacity checks do not themselves define or prove a safe writer overflow policy.

Public activation also remains blocked by the separately documented old-runtime gate: [runtime activation diagnosis](20260909-runtime-activation-gate-diagnosis.md), commit `7c59d3f`. New Web Locks cannot prevent old JavaScript's direct localStorage writes. No production drain, cache upgrade, or rollback compatibility mechanism has been implemented or independently verified by this review. Existing bounded Board workspace acceptance remains unchanged; REL-05 and complete Board/AI-02 remain open.
