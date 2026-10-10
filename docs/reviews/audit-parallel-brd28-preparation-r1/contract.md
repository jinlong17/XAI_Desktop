# BRD-28 preparation r1 — full Board backup, validation, trial-restore and rollback proposal

**UNADOPTED / NEEDS FRESH INDEPENDENT FULL CONTRACT REVIEW.** Workflow C, module **web**. This is preparation **1/3**, one static integrity pass; every runtime/test/build/lint/browser/native/server/qualification/probe/vendor invocation is **0**. Two documentary ADD paths only. No implementation, product choice, schema/key grant, caller acceptance or formal closure is made.

## 1. Fixed identity and complete original obligation

- Direct parent: `7b890e0f027c5a1d258954bfc002731b23950c15`; supplied isolated worktree `/Users/lijinlong/.codex/worktrees/audit-parallel-brd28-preparation-20261010/XAI_Desktop`, clean at entry.
- Registration: `9d8245d929518907b73674b0ab9b5e0ec221e23a`, exact `docs/reviews/20260908-full-product-audit/parallel-control-r1/task-brd28-preparation-r1.json`.
- Fixed preparation input `ead710ffa47c45f6d5e0ce3bad3c7fcdb4ff9473`; additional task-card source `acd21f9b15a735e2202ca9553aff54b3e3b46e17`; original mapping/ledger source `e041c2bc293b70db367444c62c4300231976dbf7`; runtime P0 `f9eb4b1f207bc4b46f547b90afc250424b3c8695`. No source follows later root HEAD.
- Original action: **将Board导入导出合同接成可用备份入口或明确尚无UI**
- Original acceptance: **导出预览、schema/引用校验、试恢复和错误回滚可验证**
- P2 / 决策 / web / 当前范围; sources `02-tasks-time-boards.md;05-visual-ux-audit.md`; primary workflow C; formal pending; item evidence `[]`. Empty item evidence does not imply zero historical runs.
- Original goal SHA-256 `40f9dcad8a5930725ce16685bac45b7bebfd0e4b2a5e30ba912c69441f20b615`; AGENTS, CLAUDE, shared workflow/multi-machine policy, authority-overlay and goal-C apply. The overlay replaces only the stated global serial/ff restrictions. Worker does not push/fetch/sync-check; root owns preservation and receive.
- Full 312 ordered original task fields, unique attribution, all 39 reversible raw module labels (30 `web（project-system）`, nine `web（跨模块验证索引）`) and exact original_module are preserved. Formal totals remain **13 completed / 3 verification_pending / 3 in_progress / 293 pending, 299 unclosed**. All 933 original evidence entries plus exactly six TT-08 additions = **939** at parent. All 118 gated rows remain gated. The ranked inventory is static discovery, never an implementation grant.
- P0→parent under apps/packages/package.json/pnpm-lock.yaml differs only in four TT-08 owning docs, `packages/plugin-web-time-tracker/docs/{api,design,dev_log,test}.md`. Runtime Board/storage/host/CSS parity is asserted separately; there is no blanket whole-product-tree equality claim.

The “明确尚无UI” alternative is a truthful capability statement, **not a deletion of any acceptance clause**. This proposal keeps export preview, complete schema/reference verification, actual trial restore and failure rollback as separate mandatory evidence rows. No no-UI disclosure alone can be accepted as the full BRD-28 result.

## 2. Existing source authority and minimal unresolved choice

Owning row #13 design/API/test/dev_log, `docs/reviews/xai-web-board-export-import/20260603-discovery-review.md`, roadmap `docs/workflow/roadmap/xai-web-project-module.md` and source PRD `docs/reviews/xai-web-project-module/20260603-audit-and-prd.md` establish:
1. Board-core owns the data contract and public helpers.
2. That delivered row deliberately selected **Option C, helpers**, rejected active UI **for that row**, and left UI placement, encrypted envelope, merge/replace confirmation and backend key material to later work.
3. “SHIPPED” refers to that data contract, not a user backup product.
4. Current BRD-28 explicitly requires the broader acceptance above; the older row cannot waive it.

Settled current disclosure: the active Board surface has recovery-draft downloads but no Board backup-file preview/upload/trial-restore/commit/rollback flow through the three Board export/import helpers. The account surface has a different local export and an unowned-local-data migration manager. Neither is a Board backup importer. No encrypted/cloud backup claim is supported.

**Review-only unresolved product boundary Q-B28:** the original item permits either a new usable backup entry or an explicit no-UI capability branch, while the existing owner decision defers entry placement and destructive merge/replace policy. This author does not choose a new placement, merge policy, automatic removal policy, payload migration or encryption requirement. Fresh independent review must first determine whether the complete API/trial evidence proposal below satisfies the no-UI alternative while truthfully retaining unsupported live restore, or whether the full acceptance requires a separately owner-authorized user-facing restore flow. Only the latter established conflict may become the smallest root-consolidated owner choice about exposing that flow. There is **no draft user question**, no request to reconfirm already-settled behavior, and no automatic product grant. Until that is resolved, BRD-28 remains pending, with all acceptance rows open.

Technical defects (graph inconsistency, missing locks, account fencing, unknown metadata or unsupported schema) are not product preferences. Conservative preserve/refuse behavior can be proposed and reviewed without inventing a user policy.

## 3. Actual producer/writer/reader/consumer and reachable route closure

All paths relative to repo. Manifest coverage is preservation; it is not a claim of semantic review or execution of every corpus file.

| Surface and exact source | Fixed-source finding and consequence |
| --- | --- |
| `packages/plugin-web-board-core/src/internal/exportImport.ts`; public `src/index.ts` exports at 195–202; `src/__tests__/exportImport.test.ts` EI1–EI8 and index-barrel tests | createBoardExportPayload reads one raw dataset, rejects malformed/empty data, wraps legacy array in v1 envelope, preserves an existing envelope object and produces normalized Board and logical projections. readBoardExportPayload checks kind/version/storageKey/source tag, separately valid boards/storageValue and logical-record shapes. It compares sorted IDs only. boardImportStorageValueFromPayload re-reads storageValue and returns its boards, with no storage write. Public availability does not establish a user operation. |
| Same exportImport functions | No check equates payload.boards with storageValue.boards. ID equality does not compare logical payload/content/position/parent/type-specific references; record collection validates any of three entityType values in every collection. String-joined ID comparison is not proof of unique identities or safe delimiter handling. This is a source-grounded gap, not a newly executed failing test. |
| `core/src/internal/storageContract.ts`, `isBoardArray.ts`, `types.ts` | Nonempty arrays/v1 envelopes are accepted. readBoardStorage is not a whole-graph validator. Guard checks field shapes, many IDs merely strings, legacy count fields merely numbers; it does not prove uniqueness, referential integrity or capsule semantics. projectBoardStorageEntities creates project.board/list/card records, listIds/cardIds/positions and payloads; checklistItems wins over legacy counts including empty array. Logical syncScope=account-sync is metadata, not active cloud sync. |
| `core/src/internal/persistence.ts`; BoardModule and Workspaces | Missing/corrupt/empty data may render seed fallback. Never export fallback as if saved user data, and never use a mounted fallback or mount automation as the original backup preimage. Preserve pre-mount raw bytes and post-mount state separately. preserveBoardStorageFormat spreads envelope metadata, but export reader reconstructs the top-level payload fields and can discard unknown top-level payload metadata. Arrays and envelopes have different preservation rules. |
| `packages/plugin-web-board-workspaces/src/registration.tsx`; `apps/web/src/routes/modules/shellRegistrations.tsx`, router/RouteGateElements, `App.tsx`, `providers/AccountStorageGate.tsx` | Actual `/app/board` registers Workspaces through withDisabledFallback; account gate wraps the business subtree and keys it by account/generation/epoch. A standalone BoardModule or a test-only panel does not prove the registered app is reachable. Disabled feature/deep link and account locked states remain in coverage. |
| `BoardWorkspacesModule.tsx` lines341–355, writeActiveBoard/writeLists, deleteBoard, reset, move/updateCard; core `BoardModule.tsx` | Dataset, active ID, workspace directory, panels, inbox, per-board view/filter and task data are distinct keys. Many ordinary operations write via synchronous setters. Workspace/delete/reset can mutate several related keys. Backup of xai_boards_v2 alone does not preserve those directories or cross-key relationships. |
| `internal/useBoardDetailSaveRecovery.ts`, create/composer/workspace recovery hooks; `BoardCardDetailModal.tsx`, `CardDetailDialog.tsx` | Captured owner/physical key/source/target/proposal, stable retry/read-back and draft-only export are already meaningful accepted contracts. The detail modal calls onExportAppend; parent supplies recovery snapshot and returns Boolean separately from save. Four recovery exports (board create, composer, detail, workspace) do not call the Board backup payload helpers and do not support file restore. Preserve full original source/intent, latest draft, collision and deleted-target handling. |
| `internal/taskLinkCommand.ts`; Tasks store | saveLink writes Board intent before awaited task mutation and Board acknowledgement afterwards. This is ordered recovery, explicitly not a cross-key transaction. Any restore/delete/rollback must fence queued acknowledgements and not create/delete Tasks merely from imported taskLink IDs. BRD-18 and task-link ownership remain separate. |
| `packages/xai-web-cmdk/src/adapters/board.ts`, buildIndex, provider; shell/search snapshot and host routes | Adapter consumes an array snapshot and returns module/card search hits; it does not call a backup/import helper. An envelope reaching this array-only adapter must be tested through its actual snapshot producer, not assumed compatible. Fixed tracked source search for `import-data` / `Import data` across apps and packages found no active file-import action spelling; no nonexistent command is promoted into a route. Search/navigation behavior, registry and deep-link fallback are future real-host evidence requirements. |
| `packages/plugin-web-settings-rest/src/panes/accountPane.tsx` | Actual button “Export this account's local data” captures scope, calls exportAccountLocalData and downloads account-records JSON. Exact current wording: **“Download requested. Check your browser downloads; this is not a cloud backup.”** Omission variant reports excluded credential data. Exact scope warning: **“Device layout, unassigned old data and migration archives are excluded. The file includes a scope manifest; direct import and restore are not currently supported.”** click()/Blob setup is not saved-file acknowledgement. |
| Account pane → requestAccountDataManagement → `packages/plugin-web-storage/src/AccountDataGate.tsx` | “Manage local data import and rollback” dispatches the management event; the gate locks the account and inspects unowned local keys, displays categories, calls migrateAccount('empty'/'import') and offers Undo this import. No backup-file reader or Board payload parser is reached. This flow may unmount pending Board UI before it can protect memory drafts; reachability needs technical review. |
| `storage/src/internal/accountMigration.ts` | Under exclusive lifecycle lock: validate selected registered legacy keys, refuse populated-category conflicts, archive originals, write prepared journal/candidate generation, reassert scope/source/marker after awaits, publish generation marker last. rollbackAccount restores previous generation marker after journal checks; it retains candidate records. It does not prove safe rollback after arbitrary newer writes or a Board backup-file transaction. |
| `core/src/internal/accountMigration.ts` | Validator for xai_boards_v2 is isBoardArray, not readBoardStorage. Accepted envelope helper format therefore does not automatically pass account migration. Do not silently migrate array/envelope or replace validator without separate scope. |
| `storage/src/internal/accountDataLifecycle.ts`, accountScope/scopedStorage/accountCoordination/canonical mutation; Settings delete orchestrator | Account export copies captured generation-owned raw strings, excluding credentials/device/other accounts/archives; generic exporter intentionally can export captured owner even if auth changes, so UI must maintain capability checks. Deletion has durable receipts and lifecycle locks, but source explicitly retains uncoordinated synchronous callers. A local Board lock does not coordinate all writers/removal/migrations. |
| Card/Table/detail/BoardCalendar/Timeline/Planner, `xai-web-calendar/src/internal/boardCalendarFeed.ts`; `plugin-project` Desktop adapters | All must see the same post-restore Board projection without lost dates/counts/links. Desktop plugin-project has separate entities, keys and adapters; it is a protected comparison, never an alternate Web importer. Release-site export/import mock routes are separate inactive product surfaces. |

Exact related key census to preserve, not automatically enlarge the backup format: xai_boards_v2, xai_board_workspaces, xai_active_board, xai_board_panels, xai_board_inbox, xai_board_view_by_id, xai_board_filter_by_id, and linked xai_task_cols. Catalog IDs belong to their Board; Workspace IDs and Tasks are external to the single-dataset payload. A preview must say what is included, unresolved and excluded.

## 4. Complete proposed contract and acceptance matrix

All cells below are **future oracles, unrun**. An absent UI is a truthful finding, never a substitute for an actual safety assertion. The staged technical proposal has read-only parsing/preview/dry-run, isolated trial restoration with injected errors and verified rollback, then—only if separately authorized—a production commit adapter using the reviewed ownership/lifecycle contract. Do not expose hidden tooling to users or claim an isolated adapter is a shipped flow.

### 4.1 Preview, shape and graph admission

Read input without invoking mount/automation/default factories. Freeze raw bytes, file size/hash, explicit payload kind/version and current destination raw digest/generation. Preview counts and identities from the **same validated canonical source** that would be restored, not the independently supplied payload.boards projection. Show backup scope, dates, active/archived counts, excluded keys, unresolved references, invalid rows and proposed effects. No data normalization, migration, task creation, automatic unlink, destructive repair or persistence occurs during parse/preview/dry-run.

Validation must independently compare storageValue.boards, payload.boards and complete logicalEntities records, preserving payload order where meaningful and validating records collection consistency. Detect duplicate/empty/delimiter-bearing identifiers and ambiguous identity domains without conflating IDs reused legally in distinct owner scopes. Exact finite identifier/size/depth bounds require reviewed owning contracts; no arbitrary author-picked limit or silent truncation. Unknown ordinary metadata must be retained losslessly in raw backup and roundtrip; unsupported control/version/capsule fields must refuse execution with recoverable source. Do not stringify away undefined/property-presence claims that JSON cannot represent; raw JSON/properties must be compared under an explicit representation rule.

Whole graph: board.workspaceId → workspace directory; board listIds/actual lists, list.parent/position/cardIds/actual cards; card project/list references and IDs; label/member references to the same Board catalogs; taskLink references/pending intents to actual account Task records and reciprocal source identity; activeBoard/panel/sidebar/view/filter/inbox references across owned keys; checklist row IDs and current derived counts; attachment/activity identity and dates; archived/deleted targets; and any independently adopted recovery capsule's immutable receipt/index/incarnation graph. External HTTP attachments are links, not downloaded content or provider authorization. Missing workspace/task/catalog metadata cannot be silently synthesized or removed. Board-only payload must disclose unresolved external references; live restore blocks until exact reviewed reconciliation policy exists.

### 4.2 Trial restore, commit uncertainty and rollback

A dry-run is **zero physical writes/removes/events**, including hidden journal/seed/automatic-normalization writes. It produces a stable content-addressed proposal with scope/hash/validation result and a diff, without allocating an executable foreign token. A trial restore is separately executed against an isolated supplied storage adapter using the actual import converter and consumers; it verifies resulting data, reload and graph, injects each write/read/verification failure and proves exact rollback/isolation. It is labeled “trial”; it cannot prove a live-host restore is delivered.

If live restore is separately approved, freeze one exact operation ID, captured account/kind/physical key/generation/epoch, source/destination digests and accepted proposal. Acquire the reviewed lifecycle/dataset locks **before authoritative reads**, reassert scope and source after every await, refuse competing writes or stale proposal, and never hold locks while awaiting a person. All Board ordinary writers, detail/create/composer, automation, task-link's delayed acknowledgement, migrations and deletion paths must participate or be proven fenced. Missing locks refuse; no unfenced fallback. Existing setItem/read-back is not compare-and-swap.

No merge/replace mode is assumed. The proposal must show its exact mode, affected keys and conflict outcomes only after owner/source authority resolves them. New production multi-key backup needs a separately reviewed transaction protocol; do not call sequential writes atomic or repurpose global account migration as a convenient transaction. Keep old data/receipts untouched until candidate validation succeeds, retain the failed candidate/journal as appropriate, and disclose whether canonical visibility changed. Success needs exact read-back plus current capability, not a toast, allocated ID or Boolean setter return.

For one-key writes, on an uncertain acknowledgement read first: exact proposal already present → acknowledge without a duplicate write; exact original present → eligible retry of same ID; changed/newer bytes or uncertain lineage → conflict, no overwrite. Rollback may restore only an operation-owned state whose source/target versions and generation still match the reviewed precondition. Newer edits, queued acknowledgements, delete/recreate, account switch, generation change or ABA uncertainty must block destructive inverse. It must never restore an old whole-board snapshot over newer data. Failure to roll back is a visible **recovery-required** state with retained original/candidate evidence, not success. Forced termination after denied persistence cannot guarantee preservation of memory-only input.

### 4.3 Business matrix

| ID | Full before + fixed oracle and source-grounded purpose |
| --- | --- |
| B01 capability/reachability | Actual /app/board, settings/account, CmdK/deep links and feature-disabled/locked states; each visible export/manage command traced to exact public implementation. Preserve honest no-UI disclosure and test absence of misleading restore/backup claims. No release-site mock or recovery draft counted as full backup. |
| B02 export preview and download | Arrays/envelopes, active/archived/multiple boards, empty/invalid raw source, unknown metadata; preview bytes match exported content and declared scope. Native disk filename/hash/content verified, denied read/Blob/URL/anchor and cancel failures visible, no “backup saved” from click. Draft remains pending; no persistence success implied. |
| B03 schema/version/adversarial file | Wrong kind/version/key/source, malformed JSON/object/arrays, empty boards, inconsistent/duplicate IDs, invalid counts/date/shape, size/depth/encoding boundary, missing vs null vs absent values. Preserve source; no seed/clamp/truncation writes. All finite limits need exact reviewed basis before runtime. |
| B04 full graph/three representations | Change same-ID payload fields/parent/type/positions/records; mismatch payload.boards against storageValue; dangling workspace/list/card/label/member/task references; active/views/filters/inbox; duplicate identities, archived/deleted targets, external links. Reject or classify unresolved according to reviewed policy; no silent orphan deletion or task resurrection. |
| B05 dry-run | Parse/preview/proposal perform zero writes/removes/events across all keys, markers/journals/capsules; repeat is deterministic, cancel leaves bytes and UI data unchanged. Compare source pre-mount versus post-mount to identify automation, not erase it. |
| B06 trial restore + roundtrip | Actual helpers and consumers against isolated storage, legacy array/v1 envelope, manual checklist items/legacy aggregate, annotations and unknown metadata, all entities and external-reference reports; read→export→parse→trial→reload consistency. Unknown capsule/format refuses; imported ownership tokens never authorize writes. |
| B07 commit and error rollback | Every storage step fails independently (quota/security/read denial/read-back denial/partial or uncertain commit), rollback step also fails, duplicate click/retry, interruption before/after visibility. Source/candidate retained and exact uncertainty exposed. Verified rollback restores only its own unchanged state; latest edits never overwritten. Live-host variant required if live backup restore is authorized. |
| B08 account/generation/queued writers | A→B→locked→A' and real second document; actual marker/physical scope/epoch after awaits; new generation, deletion tombstone, task-link late ack, ordinary-field/automation concurrency. No cross-owner read/display/write leak; foreign tokens historical; same account name is not same capability. |
| B09 newer writes and deletion | Preview-to-commit race, edit after restore before rollback, board/list/card deletion/archive/recreate/same-ID, reset/account-delete/import manager; no resurrection or stale snapshot overwrite, no recovery capsule reactivation. Controlled loss has explicit export acknowledgement or reviewed destructive discard; failed download never enables destruction. |
| B10 source/migration/metadata compatibility | isBoardArray migration versus v1-envelope reader, preserved unknown envelope/Board/payload metadata and field presence; inspect/import categories/rollback preserve originals and all other account/device data. No automatic key/schema/encryption/merge policy. |
| B11 real consumers | Registered Workspaces, core public helpers, detail/Card/Table/Calendar/Timeline/Planner/CmdK and Task-link agree on current state after dry-run/restore/reload; no consumer can silently strip capsule/history or resolve foreign IDs by guessed account. Actual source producers included. |
| B12 native/visual/trusted keyboard | New document, actual second document, real account generation states; EN/ZH 375/414/768/1024/1440, themes, long/error/conflict/no-data/loading/read-only states, applicable 44×44, containment, focused controls, Tab order and Enter/Space once; manually reviewed screenshots, qualified per-stop focus, trusted drag where applicable. |
| B13 full regression/protection | Frozen original failure logs, exact reviewed patch, package/host/storage/accepted callers and all judging copies, actual cross-vendor evidence, fresh complete acceptance and root reconciliation/inventory. No runtime claim from this preparation. |

“Read-only” availability must remain useful: inspect/export retained original bytes where captured capability allows; unavailable source cannot be fabricated. When account ownership changes, mask old content and fence late callbacks. UI disability does not prove callbacks are fenced.

## 5. BRD-12, REL dependencies and protected lifecycle

Exact BRD-12 basis: proposal `5fa4cccb106d10e16562e0a8d6f3b103495607b1` and conditional full review `cdb8820b434aa7f2adb9cc5ad5f14118eb24230c`. They are **documentary conditional approval**, not schema/key adoption. In particular review T1–T4 require complete writers/locks, exact capsule/schema, migration/import/export and actual host/global-loss reachability. This document does not consume or adopt the ongoing writer-lifecycle impact draft, even if its filename exists at parent. Future use requires the exact independently reviewed impact source and root adoption receipt, plus source-delta applicability against this contract. A future implementation card must pin those SHAs and concrete fields; names such as checklistRecovery remain conceptual here.

Preserve immutable X receipts, separate terminal U index/link and current Y writer ownership if that schema is eventually adopted. Export/import must not strip history, copy foreign live capabilities, reuse incarnations by ID, resurrect retired inverses, or turn X→U→Y into executable stale U. Restore must retain current historical terminal state or refuse unprovable reconciliation; it cannot silently replace newer history with an older backup. Capsule retirement, quota eviction, lifetime, new key or schema migration is not authorized. Unsupported/colliding capsules are losslessly recoverable but non-executable. Explicit dataset/Board/account destruction requires the separately reviewed protection reachable at the actual global action, not merely a local hook.

REL-04 remains verification_pending: complete entity→key ownership inventory and account export/delete coverage is distinct from Board-only payload. REL-05 remains in_progress: no false persistence success; preserve drafts on quota/access/database failure with Retry/export. Account lifecycle locks, deletion receipts, migration archives and generation ownership remain shared protected dependencies. All synchronous, asynchronous and raw writers must be source-inventoried before a proposed lock can claim exclusion. Worktree separation does not remove semantic conflicts with BRD-12, BRD-18/task-link, ordinary Board recovery, list lifecycle, REL-03/04/05/06 and shared storage.

## 6. Exact finite conditional paths and next grants

**Only writable now:**
- `docs/reviews/audit-parallel-brd28-preparation-r1/contract.md`
- `docs/reviews/audit-parallel-brd28-preparation-r1/inputs.sha256`

Candidate *documentary disclosure and API safety* paths for a later card, selected individually after full review, not current permission:
- `packages/xai-web-board-export-import/docs/design.md`
- `packages/xai-web-board-export-import/docs/api.md`
- `packages/xai-web-board-export-import/docs/test.md`
- `packages/xai-web-board-export-import/docs/dev_log.md`
- `packages/plugin-web-board-core/src/internal/exportImport.ts`
- `packages/plugin-web-board-core/src/__tests__/exportImport.test.ts`
- `packages/plugin-web-board-core/src/__tests__/index-barrel.test.ts`

A new public preview API would additionally require separately selected `packages/plugin-web-board-core/src/index.ts` and `packages/plugin-web-board-core/docs/api.md`. This finite list does **not** cover live restore/rollback, whole-graph cross-key protocol, UI or BRD-12 adoption. Those are unresolved technical impact scopes, not an invitation to edit adjacent modules. Source proven candidate impact files, currently read-only: `packages/plugin-web-board-core/src/internal/storageContract.ts`, `internal/isBoardArray.ts`, `internal/accountMigration.ts`, `src/types.ts`; `packages/plugin-web-board-workspaces/src/BoardWorkspacesModule.tsx`, `internal/taskLinkCommand.ts`; `packages/plugin-web-storage/src/AccountDataGate.tsx`, `internal/accountMigration.ts`, `internal/accountDataLifecycle.ts`, `internal/scopedStorage.ts`, `internal/accountCoordination.ts`; `packages/plugin-web-settings-rest/src/panes/accountPane.tsx`; `apps/web/src/providers/AccountStorageGate.tsx`. No production candidate is implicitly authorized through this list.

Proposed fresh review outputs: `docs/reviews/audit-parallel-brd28-contract-review-r1/review.md` and `inputs.sha256`. Proposed subsequent technical admission outputs: `docs/reviews/audit-parallel-brd28-source-impact-r1/impact.md` and `inputs.sha256`. Proposed oracle-source files only after admission: `docs/reviews/audit-parallel-brd28-oracles-r1/contract.test.ts`, `host.test.tsx`, `verify-fixed.mjs`, `verify-native.mjs`, `oracle.md`, `inputs.sha256`. Runtime artifact paths must be enumerated by a separate exact card after permanent-unit budget reconciliation; none are invented or executed now.

Protected: every other path, all product/tests/runners/CSS/tokens/config/lockfiles, original sources/failures/evidence, storage registry and global lifecycle, App/router/shell, Header/Clock/AppRail, Desktop/plugin/adapters, global control/ledgers/inventory and all other worktrees. No commit hook that triggers tests/review, no child, push/fetch/merge/rebase/promote/deploy/release/D3. Stop on input/dirty drift, unsupported decision, needed protected change or runtime need. Technical gaps are reported for independent review; this author does not self-adopt.

## 7. Permanent actual execution histories and costs

Actual units are identified by runner, assertion purpose, source/fixture lineage and mode, not BRD-28 label, file path, actor, vendor or worktree. Formal cap remains **3 per actual unit**, with refusal/precondition/launch attempts preserved, separate development/probe history. Unknown classification is **unknown**, never 0/3. A valid exact evidence packet is reused after source/applicability review; never repeat it to manufacture a new timestamp.

- Original row13 `128f4be` verification in owning dev_log records board-core focused10/full169/typecheck/lint, settings-rest focused11/full240, Web tests116/typecheck/build. Settings-rest typecheck retained inherited failures (Supabase/import.meta.env/NodeNext and old strictness), not PASS. Exact invocations are reproduced in owning test.md and dev_log; no complete process-level receipt was located there, so cumulative unit/formal/probe count is unknown. Historical SHIPPED does not allocate BRD-28 runtime.
- Original rejected append unit: seven retained artifacts, five diagnosis and two Sol original-three. Main-checkout before plus six archive-root processes WglhJo/W5CtBq/GTCwVQ/eM1BXW/lL8iHn/IepdNM. Three assertions per process do not mean three processes. Source command shape `node docs/reviews/web-board-detail-save-diagnosis/verify-fixed.mjs <revision> independent <label>`; preserves d7f1987/c201a1d failures and 5c6ed8e/99c36b0 fixed receipts.
- Independent detail unit: `node docs/reviews/web-board-detail-astra-final/verify-fixed.mjs 99c36b0 [independent|author-tests-rerun] [label]`; calibration vR4Xvt 4/5, QNw9Ce 5/8, fixed H1Ap2r 8/8, separate author-tests 0NW1Ae 20/20. Original failures remain; legacy-synthesis expectations require reviewed versioned correction for BRD-12, not deletion.
- Native detail download/retry/reload: `node docs/reviews/web-board-detail-sol-fix/verify-native.mjs <revision> <label>`, source PID14575/15385/17812/18500 for four Chrome sessions, proposal IDs and disk payloads. Source transport is historical, not automatically qualified for new native work. Four sessions do not become a fresh BRD backup budget.
- Board package unit: `node docs/reviews/web-board-detail-sol-fix/verify-package.mjs <revision> <label>`; before8105cc9 309 PASS/9 FAIL, after5c6ed8e and final99c36b0 326 PASS/9 FAIL; lpCkP7/zYQAbA/qnu7yE and later BmWgbG. The Task-link fixture directory's before-package99c36b0 is a byte-identical copy of final99c36b0 and must not double-count a process. Fixture correction8ab38ed focused15/90skipped, full336; parent package336 is distinct. Exact tool/mode receipts below retain failures and launch identity; classification remains unknown.
- Task-link D1 source runner `web-board-workspace-astra-review/verify-d1-board.mjs` preserves parent-baseline/boundaries/repair mode histories and fixture copies. Native source command `node docs/reviews/web-board-tasklink-native/verify-native.mjs 49a55e5 parent-admitted-fixture`; initial PID23393 omitted test-only canonical admission, earlier before-fixture one-byte log corresponds documented Chrome startup refusal, admitted PID23613 supplies3 checks. Blank output is not zero launch cost. These are synthetic-account/test-admitted controls, not production rollout.
- Shared lifecycle/account migration/export and D2 histories are retained in the complete fixed evidence corpus and REL-02/03 reviewed documents. No end-to-end new backup restore history is asserted absent solely because no BRD-28 item evidence exists. Reuse of any shared unit requires mode-level permanent cost reconciliation first.
- Clock Q1 focus1/3, six other units0/3, development2 invocations/83 checks; retention validation3/3 exhausted,145 assertions/41 of42 executions, final14/14 not qualification. Source-review R1–R6 and impact2 remain blocked. B70/refusal/calibration histories remain immutable. M+G+B is only its adopted conditional sequence; methods blocked affect their dependent units, not unrelated static preparation. REL unknown vendor histories and TT-08 three actual vendor runs confer no BRD allowance.

Source-grounded **candidate new assertion purposes**, never automatic 0/3: N-G compares all three Board payload representations and complete reference graph (old EI checks IDs/shape only); N-T asserts true zero-write preview then actual isolated trial restoration and rollback faults; N-C asserts foreign-capability/retired-capsule fencing and newer-write-safe inverse after approved schema/restore protocol. Native download, account-host, package, migration and accepted-caller portions remain reused units. Before runtime a fresh reviewer must bind exact drivers/cases/source deltas, separate overlaps and register formal/probe totals; unknown or exhausted units stay frozen.

This worker ran **preparation1/3/static1 only**, no runtime/test/build/lint/browser/native/server/qualification/probe/vendor/child. Read-only inspection commands may exit nonzero for absent guessed directory/revision/optional grep; these are retained as search failures, not semantic PASS or runtime attempts. One ambiguous short revision 5fa was replaced by log-discovered full immutable identities before the integrity pass. No failed semantic checker is rerun.

## 8. Complete evidence chain and full canonical G1

| ID | Mandatory next evidence; none produced as runtime here |
| --- | --- |
| R01 | Fresh independent full contract review: original action and every acceptance clause, existing authority, Q-B28 disposition, exact schema/graph/metadata/restore boundaries, BRD12 dependency, permanent costs and finite scope. |
| R02 | Independently reviewed source-qualified oracle/driver; immutable raw pre-mount/source/destination, real host registration, helpers/public barrel and all B01–B13 cases; positive/negative controls; zero unexpected PRECONDITION. Exact before failures committed before implementation. |
| R03 | Valid real App/native before, account host and trusted controls; no fake import route, test fixture or no-UI text substituted for actual capability evidence. |
| R04 | Separate implementation grant after technical admission/owner boundary and valid before; exact paths/SHA/author logs; unchanged old artifacts and versioned reviewed oracle corrections. |
| R05 | Fresh independent fixed full B01–B13 evidence, all shapes/whole graph/trial/rollback/storage faults/identity generations/newer writers/unknown metadata/capsule retirement; no sampled replacement. |
| R06 | Actual host/native new document and second document, downloaded bytes and visible truthful acknowledgement, account and guarded-departure paths; actual provider evidence wherever claimed. |
| R07 | Manual bilingual five-width/theme screenshots, per-stop qualified focus, trusted keyboard and applicable targets; source selector and CSS invariance. |
| R08 | Focused and full Board-core/workspaces/views tests/typecheck/lint; Web host tests/check-types/lint and CmdK; storage types/lifecycle/migration/deletion/export; actual dependent Card/detail/Table/Calendar/Timeline/Planner/task-link/creator/composer/automation; immutable P0 controls. Historical known failures adjudicated, never all-green labels. |
| R09 | Full canonical Clock r2 §14 E1–E25, complete E24 judging copies and required F1/affected/native controls. Each item has source applicability, producing commit, artifact path, full hash and verdict. Below retains the full canonical matrix rather than a BRD summary substitute. |
| R10 | Actual different-vendor verification, then fresh independent Astra full original-scope acceptance; independent Codex is not cross-vendor. Re-derive hashes and inspect actual images/downloads; missing evidence blocks. |
| R11 | Root-only serialized receive/preservation/append-only reconciliation against all312 ordered source fields, all939 current evidence and unchanged formal states; remote ancestry and sync receipt. |
| R12 | Fresh independent integrated inventory, residuals and permanent cost refresh; caller acceptance does not close formal item/REL/deployment/release automatically. |

No blanket reuse or blanket rerun: exact valid historical evidence can be reused only with fixed source and assertion applicability; affected changes revoke invariance-based exemptions. Full canonical source remains immutable. Budget/measurement inability blocks dependent evidence instead of lowering standards. Later evidence cannot replace missing before or a failed judging copy. Native runners require own isolated server, streamed immutable archive/requested-resolved SHA/archive bytes/lockfile/@repo guards, output-collision refusal, preserved exit codes, CDP pipe/trusted input/passive key audit/no nativeVirtualKeyCode, and frozen pixelFocusWalk or fully qualified independently adopted replacement. Global control/current accepted contracts and original failures remain protected.

## 9. Static preparation receipt

All input identities and full original/mapped/execution preservation are validated before either output write. Both complete output buffers are constructed first. Manifest binds full raw Git blobs/trees and the original external goal. Broad corpus preservation does not claim all-file semantic review. Outputs have no circular self-hash; final handoff carries count/hash/direct parent/exact paths/clean receipt.

No semantic checker failure occurred before the single integrity pass; any failure in that pass stops without retry or writing outputs. Checks not completed are UNRUN, never inferred PASS. No product or runtime grants were exercised. Scope unchanged; root alone may receive and independently review this proposal. Next bounded step is fresh full BRD-28 contract review, not automatic adoption, implementation or a user question.

## 10. Exact canonical Clock r2 section 14 retained verbatim

Source path `docs/reviews/web-dashboard-clock-recovery-contract/contract.md`, hash `214dc7582ff866cf76482b8883cc284edba8fa180f88bbf940fcaa7ab32cf0ae`. Historical instructions/counts below are reference obligations, not permission for this worker to execute them.

## 14. Required evidence checklist

This list is the single source for gate evidence (lesson G1). It is contiguous, E1–E25. The final-regression receipt (E25) must list every ID with its producing commit, artifact paths and SHA-256 before acceptance starts.

| ID | Evidence item | Producer | Revision(s) | Gates |
| --- | --- | --- | --- | --- |
| E1 | Sol oracle files and runner frozen with a SHA-256 receipt; the lockfile gate recorded; the archive byte count and streaming or buffer method; the F-B002 spy self-check; the in-domain seed table; the §12 consistency matrix with case references | Sol | `f9eb4b1` | 1–4 |
| E2 | Sol before logs for the six §12 modes. Per-case outcomes for H1–H6 as exercised; positive controls PASS (H7, H8, D1, D10; D5's zero-confirm recorder). Zero precondition failures | Sol | `f9eb4b1` | 1–4, 6 |
| E3 | Parent jsdom host before log (production `App`): <ul><li>Correct FAILs: rows b–h, j, k, m and n, the drafted half of row i, and the OK half of row q.</li><li>PASS: rows a, l, o and p, the idle half of row i, the lock-independence run of row c, the Cancel half of row q, and a clean control.</li><li>Every row's Topbar census and recorder.</li><li>The cross-caller domain scan (§12).</li></ul> | Parent | `f9eb4b1` | 3, 5 |
| E4 | Native before, production `App`, pipe transport: H1–H5 in EN and ZH; H9 per-stop focus measurements with the frozen `pixelFocusWalk` (identity hashes asserted); H10 sizes; widget and pet geometry at every width, including 768×1024; provenance; the K-1 key audit | Parent | `f9eb4b1` | 5, 6, 8 |
| E5 | The new Clock F1-shape runner and host fixture (the frozen prelude reused read-only and hash-checked; pipe transport; no `nativeVirtualKeyCode`; key audit; streamed archive); `selfcheck` harness-valid; the `clock` before log, c1–c5 | Parent | `f9eb4b1` | 5, 7 |
| E6 | Terra's fixed SHA. `git diff --name-only f9eb4b1 <fixed> -- apps packages package.json pnpm-lock.yaml` lists only §11 product files. Terra's own package-run logs and `implementation.md` in the reserved `docs/reviews/web-dashboard-clock-recovery-terra/`, with SHA-256 | Terra | fixed | all |
| E7 | Sol fixed reruns with unchanged oracle hashes: all six modes PASS, with zero `PRECONDITION` lines | Sol | fixed | 1–4, 6 |
| E8 | Parent jsdom host fixed rerun PASS: every row a–q and the clean control | Parent | fixed | 3, 5 |
| E9 | Native controls: 17 values by trusted input with exact bytes; new-document reload with zero mount writes; source-only per key with Reload; a native held lock; uncertainty with one write; a second-document conflict; per-field failure, Retry and Discard | Parent | fixed | 1, 2, 5 |
| E10 | Native export: the seven §8 disk shapes under total denial (counters, URL, anchor, unload warning, hold, and absent Topbar statuses), plus one setup failure | Parent | fixed | 4 |
| E11 | Native host matrix rows a–q with history counters, runtime-error gates, the Topbar census, the CDP dialog recorder, the trusted-drag record (row q) and the K-1 key audit; rows g and q in both auth branches | Parent | fixed | 3, 5 |
| E12 | Native downstream and isolation: CmdK committed bytes; zero Clock-attributed `StorageEvent` and bus events, with navigation-caused events equal to `f9eb4b1`; the other-key snapshot unchanged, including `xai_rail_order`; clean-state `.module-dashboard`, `.app-rail` and `.topbar` invariance against `f9eb4b1` (EN/ZH; 375 and 1440; popover closed and open; frozen page clock) | Parent | fixed and `f9eb4b1` | 6 |
| E13 | EN/ZH five-width visual: pet-hidden hit-tests (narrow widths via the resize procedure, with pet-hidden asserted after the resize); the pet-on R-PET run; 44×44 for new targets; containment; overflow; the selector audit (append-only, scopes, class-usage control, non-collision with shell selectors); the manually reviewed screenshots of §9; viewport heights recorded | Parent | fixed (pet captures also `f9eb4b1`) | 8 |
| E14 | Keyboard and focus: Tab order, Enter/Space once, the focus targets, the per-stop `pixelFocusWalk` comparison in walk states 1–4 across selection states and themes (F-APP-1/2), the recorded open-popover Tab-out probe (§9), the K-1 audit | Parent | fixed | 8 |
| E15 | **F1 regression**, 16 invocations: <ul><li>`verify-f1.mjs` sticky, more and collaborate;</li><li>`verify-f1-callers.mjs` selfcheck, notifications, date-time, smart-lists, header and pomodoro;</li><li>`verify-f1-race.mjs` race;</li><li>`verify-f1-features.mjs` selfcheck and features;</li><li>the Appearance F1-shape `selfcheck` and `appearance` modes through the K-1 copy `../web-native-keyinput-k1/verify-f1-appearance-k1.mjs` (`e9fbc590…`; at `f9eb4b1`, 135/135 harness-valid and a1–a4 `fixed-pass`, 123/123);</li><li>**the rail F1-shape** `../web-apprail-order-recovery-f1/verify-f1-railorder.mjs` (`6385b648…`) `selfcheck` (harness-valid, 165 checks at `f9eb4b1`) and `railorder` (`verdict=fixed-pass`, f1–f3, 104 checks at `f9eb4b1`).</li></ul> All PASS with no `Invalid blocker state transition`. Runner hashes are unchanged, except where the capacity rule applies (Rules) | Parent or final verifier | fixed | 7 |
| E16 | Clock F1-shape fixed log PASS for c1–c5 under the release-once reading: one release per expected release, zero non-live blocker calls, one location commit per navigation release, one identity invalidation per sign-out release, zero runtime errors, no `Invalid blocker state transition`, and the c5 ordering (rail confirm first; zero Clock calls on Cancel) | Parent or final verifier | fixed | 5, 7 |
| E17 | **Header affected-caller rerun,** at the fixed SHA and, as a control, at `f9eb4b1`. Counts and record sequences must equal the accepted receipts: <ul><li>**Host suite:** departure 5/5, advanced 5/5, followon 2/2. The frozen `../web-dashboard-header-departure-independent/verify-fixed.mjs` (`840225ac…`) refuses with `ENOBUFS` at 100 MiB, so the judging runner is the accepted buffer copy `../web-apprail-order-recovery-final/host-suites/web-dashboard-header-departure-independent/verify-fixed.mjs` (`56645cbb…`).</li><li>**Native suite:** `../web-dashboard-header-departure-native/verify-native.mjs` (`7af1a8fd…`), the 18 modes of `affected-callers-f359be6.md` §3.7, with record sequences equal to the accepted ones.</li><li>**Astra and Sol suites,** as unchanged controls with counts equal to their accepted receipts: `../web-dashboard-header-departure-astra/verify-fixed.mjs` (`30e3f804…`) and `../web-dashboard-header-departure-sol/verify-fixed.mjs` (`bb5f8937…`).</li><li>The native, Astra and Sol runners also use 100 MiB buffers. Each runs first as frozen; on refusal it runs through a **pre-registered buffer copy** (Rules) under `web-dashboard-clock-recovery-final/header-copies/`.</li></ul> | Parent or final verifier | fixed and `f9eb4b1` | 3, 9 |
| E18 | §10 item 9 search at the fixed SHA, with per-file counts compared to `f9eb4b1` | Final verifier | `f9eb4b1` and fixed | 6, 9 |
| E19 | §10 item 8 protected-path empty diff against `f9eb4b1` | Final verifier | `f9eb4b1..fixed` | 6, 9 |
| E20 | Storage check-types plus the Sol lifecycle assertion for both keys | Sol and final verifier | fixed | 6, 9 |
| E21 | `xai-web-dashboard-widgets` full test, typecheck and lint from the fixed archive, plus its unchanged tests at `f9eb4b1` as a before control | Final verifier | fixed and `f9eb4b1` | 9 |
| E22 | `xai-web-dashboard-grid` full test, typecheck and lint, plus its unchanged tests at `f9eb4b1` as a before control. The package tree is identical to `73b4eb9`'s, where it was 25 files / 228 tests | Final verifier | fixed and `f9eb4b1` | 9 |
| E23 | Web package test (30 files / 196 tests at `f9eb4b1`, including `App.railorder` 18 and every §10 item 10 web test), check-types and lint; CmdK package test | Final verifier | fixed | 9 |
| E24 | **Accepted-caller suites,** with counts compared to the AppRail final regression at `f9eb4b1` (`review-final-regressions-f9eb4b1.md` §3–§6; runners and commands as there). Each judging copy runs beside its frozen original as §12 predicts. The rows are listed after this table | Final verifier | fixed | 9 |
| E25 | Final-regression receipt enumerating E1–E24: producing commit, artifact paths, SHA-256, verdict; the §12 prediction table filled with observed outcomes; every capacity copy with its diff and its refusal transcript | Final verifier | — | 9 |

**E24 rows** (each count is the AppRail final regression at `f9eb4b1`):
- **AppRail (new in r2):**
  - Sol eight modes through `../web-apprail-order-recovery-sol/verify-fixed.mjs` (`e944cb22…`): `bytes` 26, `domain` 31, `merge` 21, `drag` 18, `field` 24, `continuity-export` 22, `host` 33 and `original` 123;
  - parent host through `../web-apprail-order-recovery-independent/verify-fixed.mjs` (`646bf047…`): 31/31;
  - **C-RD1** 15/15, judging Features `downstream` case 014.
- **Appearance:**
  - Sol `bytes` 65, `fields` 89, `reset` 34, `queues` 56, `host` 33, `retry-all` 48 and `original` 187;
  - `continuity-export`: frozen 24/26 (006, 007), recorded, **and** the OE copy `../web-appearance-recovery-oracle-erratum/verify-erratum.mjs … corrected` 26/26, judging;
  - parent host 33; package 11 files / 137.
- **Features:**
  - Sol `bytes` 17, `fields` 49, `reset` 31, `queues` 40, `continuity-export` 26 and `original` 6;
  - `downstream` three ways: frozen 13/15 and C-FD1 14/15, both recorded, and C-RD1 15/15, judging;
  - host 40; package 7 files / 45; reader tests 5 files / 17.
- **More:**
  - Sol `fields` 22, `reset` 20, `queues` 14 and `owner-export` 13; `original` 15; host 11;
  - `boundaries`: frozen, recorded as it falls, **and** the C-FB002 copy `../web-more-recovery-fb002/verify-fb002.mjs … corrected full` 10/10, judging.
- **Others:**
  - Sticky: Sol 109, original 10, host 28;
  - Notifications: Sol 41, Astra boundaries 24, Astra host 15, parent host 12;
  - Date & Time 7;
  - the Smart Lists, Collaborate and Pomodoro host suites through the accepted buffer copies in `../web-apprail-order-recovery-final/host-suites/`, with the per-mode counts of that receipt's §6;
  - settings-shell 11 files / 54; settings-rest 44 files / 314.

**Rules.**
- E1–E5 must be committed before Terra starts.
- E25 is produced last and enumerates every other item.
- A later item cannot substitute for a missing earlier one.
- Acceptance re-derives at least one hash per item and BLOCKS on any absent ID.
- **Judging copies.** The frozen More `boundaries`, Features `downstream` (cases 012 and 014) and Appearance `continuity-export` (cases 006 and 007) failures are judged by their copies: C-FB002, C-RD1 and OE. C-FD1 runs beside them with its predicted outcome and judges nothing. A judging copy that fails is a regression.
- **K-1 and transport.** Every native runner written for this caller uses pipe transport, sends no `nativeVirtualKeyCode` and audits keys (K-1). Reused frozen runners that send none run unchanged, with their frozen transport (AppRail acceptance §6 item 10).
- **Drags.** Native drags use trusted CDP input only (§12 rule 14).
- **Product-delta preconditions.** A reused frozen runner may refuse at a precondition bound to an earlier caller's product delta. The verifier then commits that refusal log, and runs a copy that replaces only that precondition with a stricter one naming this caller's §11 delta. This follows the Appearance and AppRail E24/E25 precedents, and the deviation is disclosed for acceptance. Every other precondition and assertion stays unchanged.
- **Capacity copies (pre-registered; AppRail acceptance §6 item 10).**
  - **When.** A reused frozen runner aborts with `ENOBUFS` (or any buffer-capacity error) while reading `git archive`, before any test runs.
  - **What the verifier does.** It commits the refusal transcript. It then runs a copy that differs from the frozen runner only in the archive buffer (sized from the measured archive, at least twice its size, or replaced by streaming) and, if the copy lives in a deeper directory, in its `root` depth, plus a header comment.
  - **Requirements.** The copy's diff against the frozen runner is committed. Staged test and fixture files must be byte-identical to the frozen ones. Counts must equal the accepted receipts and the `f9eb4b1` control.
  - **Pre-registered for:** the four Dashboard Header runners (E17), whose 100 MiB buffer is below the `f9eb4b1` archive.
  - **Applies on refusal to:** the three 200 MiB F1 runners `verify-f1.mjs`, `verify-f1-callers.mjs` and `verify-f1-race.mjs` (E15). Their buffer, 209,715,200 bytes, exceeds the 173,905,920-byte archive at the r2 docs head, but later evidence may outgrow it.
  - **Status.** The copy procedure is not a contract revision and needs no separate ruling batch; acceptance reviews each copy.
- **Not rerun.** The Features native host and downstream suites (Features E12/E13) and the AppRail native E9–E14 are not rerun. Their subjects (Features rail departures and drags, and AppRail's own surfaces) are outside the Dashboard packages, and the empty shell, `App.tsx` and tokens diff (E19) plus the `.app-rail`/`.topbar` invariance (E12) bound them. If either bound fails, they must be rerun.


## 11. Full original BRD-28 record and current TT-08 additions

```json
{
  "id": "BRD-28",
  "priority": "P2",
  "kind": "决策",
  "action": "将Board导入导出合同接成可用备份入口或明确尚无UI",
  "acceptance": "导出预览、schema/引用校验、试恢复和错误回滚可验证",
  "status": "待复核/待办",
  "module": "web",
  "gate": "当前范围",
  "source": "02-tasks-time-boards.md;05-visual-ux-audit.md",
  "primary_workflow": "C",
  "original_module": "web",
  "formal_state": "pending",
  "retained_execution_record": {
    "id": "BRD-28",
    "status": "pending",
    "evidence": []
  },
  "fixed_input_sha": "e041c2bc293b70db367444c62c4300231976dbf7",
  "product_sha": "f9eb4b1f207bc4b46f547b90afc250424b3c8695",
  "gate_obligations": [
    "existing-owner-rule-or-minimal-decision:BRD-28"
  ],
  "source_section": "BRD",
  "acceptance_evidence": {
    "business_acceptance": "导出预览、schema/引用校验、试恢复和错误回滚可验证",
    "existing": [],
    "required_future": [
      "fixed-source contract and before evidence",
      "implementation commit and exact scoped patch where needed",
      "independent frozen verification and affected regressions",
      "independent Astra full-scope acceptance",
      "controller evidence reconciliation with unchanged formal states",
      "inventory refresh and remote ancestry/sync receipt"
    ]
  },
  "tasks": [
    "BRD-28/prepare",
    "BRD-28/contract-review",
    "BRD-28/before",
    "BRD-28/implement",
    "BRD-28/verify",
    "BRD-28/accept",
    "BRD-28/reconcile",
    "BRD-28/inventory"
  ],
  "execution_state": "needs_fixed_scope_discovery"
}
```

```json
{
  "id": "TT-08",
  "status": "pending",
  "evidence": [
    "commit:c5874e5f6e803aa391ef2e5fb677e4bab592f4ef",
    "../audit-parallel-tt08-final-acceptance-r1/acceptance.md",
    "sha256:1c2d4b8ec5cf22d8a97c2519adba4cb4078b4500a9be2d94ee2889c3c46a68ca",
    "commit:f475cf5d0598dcb18e0e75e2e025969e7c16b056",
    "../audit-parallel-tt08-vendor-verification-r3/receipt.md",
    "commit:b4c33120bde198214bbe3bf76ead543b5f139c3a"
  ]
}
```

### All 39 reversible original module labels

| ID | original_module |
| --- | --- |
| GOV-01 | web（project-system） |
| GOV-02 | web（project-system） |
| GOV-03 | web（project-system） |
| GOV-04 | web（project-system） |
| GOV-05 | web（project-system） |
| GOV-06 | web（project-system） |
| GOV-07 | web（project-system） |
| GOV-08 | web（project-system） |
| GOV-09 | web（project-system） |
| GOV-10 | web（project-system） |
| GOV-11 | web（project-system） |
| GOV-12 | web（project-system） |
| GOV-13 | web（project-system） |
| GOV-14 | web（project-system） |
| GOV-15 | web（project-system） |
| GOV-16 | web（project-system） |
| SK-01 | web（project-system） |
| SK-02 | web（project-system） |
| SK-03 | web（project-system） |
| SK-04 | web（project-system） |
| SK-05 | web（project-system） |
| SK-06 | web（project-system） |
| SK-07 | web（project-system） |
| SK-08 | web（project-system） |
| SK-09 | web（project-system） |
| SK-10 | web（project-system） |
| SK-11 | web（project-system） |
| SK-12 | web（project-system） |
| SK-13 | web（project-system） |
| SK-14 | web（project-system） |
| QA-01 | web（跨模块验证索引） |
| QA-02 | web（跨模块验证索引） |
| QA-03 | web（跨模块验证索引） |
| QA-04 | web（跨模块验证索引） |
| QA-05 | web（跨模块验证索引） |
| QA-06 | web（跨模块验证索引） |
| QA-07 | web（跨模块验证索引） |
| QA-08 | web（跨模块验证索引） |
| QA-09 | web（跨模块验证索引） |

## 12. Raw historical artifact receipt

The full raw bytes and original runners are manifest-bound. Recorded results are historical and not new executions. Artifact rows are not process counts; byte-identical duplicates below are one preserved content identity, and launch/refusal details may require the linked review even where a log is blank.

| Artifact | Bytes | SHA-256 | Recorded process/case hints |
| --- | ---: | --- | --- |
| `docs/reviews/web-board-detail-astra-final/author-tests-rerun-99c36b0.log` | 2042 | `de51fa52e4193e76185749a51f22702a034304d8ec5185d9b88c29da6f9fd5d6` | revision=99c36b0; exit=0; xai-detail-review-0NW1Ae; Tests  20 passed (20) |
| `docs/reviews/web-board-detail-astra-final/independent-99c36b0.log` | 608 | `5e6eaf70675778d9ca342c19f158db5ab45c4f7ca1fe50afc287ebc4ba997b20` | revision=99c36b0; exit=0; xai-detail-review-H1Ap2r; Tests  8 passed (8) |
| `docs/reviews/web-board-detail-astra-final/oracle-calibration-99c36b0.log` | 2373 | `e9869e5ffee8ed4918d37a3b9948ae80dcc8f4541f0a6f7c0bc19dfb8783f638` | revision=99c36b0; exit=1; xai-detail-review-vR4Xvt; Tests  1 failed / 4 passed (5); Tests 1 ⎯⎯⎯⎯⎯⎯⎯ |
| `docs/reviews/web-board-detail-astra-final/view-fixture-calibration-99c36b0.log` | 5643 | `f755355170f7cad3c04c4176e644fc0ba03e2e6c8350f4b1c4ee13ec5333beab` | revision=99c36b0; exit=1; xai-detail-review-QNw9Ce; Tests  3 failed / 5 passed (8); Tests 3 ⎯⎯⎯⎯⎯⎯⎯ |
| `docs/reviews/web-board-detail-save-diagnosis/before.log` | 4553 | `e4e1ae1f1e9002e707e91c3b4e654c26ee8732edea99d2001bb0281420e10df7` | Tests 3 ⎯⎯⎯⎯⎯⎯⎯; Tests  3 failed (3) |
| `docs/reviews/web-board-detail-save-diagnosis/independent-parent-after-5c6ed8e.log` | 1045 | `9b7a64571a8509890046a2fbf5fdd00c8cd95e11c73c213cb353fd8ea74a4065` | revision=5c6ed8e; exit=0; xai-detail-review-GTCwVQ; Tests  3 passed (3) |
| `docs/reviews/web-board-detail-save-diagnosis/independent-parent-c201a1d.log` | 3236 | `29b94a53b218939e5b4c6d60e5c6bcc263de0f562d34f114a678598bf2cd3d2d` | revision=c201a1d; exit=1; xai-detail-review-W5CtBq; Tests  3 failed (3); Tests 3 ⎯⎯⎯⎯⎯⎯⎯ |
| `docs/reviews/web-board-detail-save-diagnosis/independent-parent-final-99c36b0.log` | 1045 | `a74583569ca3778f2530c45354410cabbc2e078b698d14ed892e1f5a0e312939` | revision=99c36b0; exit=0; xai-detail-review-eM1BXW; Tests  3 passed (3) |
| `docs/reviews/web-board-detail-save-diagnosis/independent.log` | 3236 | `8747e908956204a02259ddd6b93974d2583fadc7b9289d350e562b46f43ab615` | revision=d7f1987; exit=1; xai-detail-review-WglhJo; Tests  3 failed (3); Tests 3 ⎯⎯⎯⎯⎯⎯⎯ |
| `docs/reviews/web-board-detail-sol-fix/after-5c6ed8e.log` | 42724 | `011619b9a3263ff874745e826132e157d457486103b995194f2bdbc66ce19b81` | revision=5c6ed8e; exit=1; mode='board' 15ms; mode='card' 15ms; Tests  9 failed / 326 passed (335); Tests 9 ⎯⎯⎯⎯⎯⎯⎯ |
| `docs/reviews/web-board-detail-sol-fix/before-8105cc9.log` | 41348 | `88ed98c2082fd5baff0fd20a325e6494d63c3cc30359be28ad8625b1bb9f19cd` | revision=8105cc9; exit=1; mode='board' 15ms; mode='card' 32ms; Tests  9 failed / 309 passed (318); Tests 9 ⎯⎯⎯⎯⎯⎯⎯ |
| `docs/reviews/web-board-detail-sol-fix/final-99c36b0.log` | 42848 | `2ef82b2d5413135c6d50205ebe9bc9bb5351c66c7b96ee48db3a5c413a5c4bf2` | revision=99c36b0; exit=1; mode='board' 51ms; mode='card' 31ms; Tests  9 failed / 326 passed (335); Tests 9 ⎯⎯⎯⎯⎯⎯⎯ |
| `docs/reviews/web-board-detail-sol-fix/focused-final-99c36b0.log` | 2159 | `03148555c870176dcd44f236a8613cec864b58724ef33e744f05355968c692dc` | revision=99c36b0; Tests  20 passed (20) |
| `docs/reviews/web-board-detail-sol-fix/native-5c6ed8e.log` | 872 | `2ab891bf7ffa1d459798c4613c2c609a893f9ed8d2d245009ae8b0fd94fdaad5` | 14575 |
| `docs/reviews/web-board-detail-sol-fix/native-99c36b0-parent-independent.log` | 871 | `21ed2d0dc55e626a524487bc6915c6753cdb861fb1fd87975b33cb055be77c78` | 17812 |
| `docs/reviews/web-board-detail-sol-fix/native-99c36b0-parent-visual.log` | 871 | `dc27417de8003d898575a8d1248f6a98fe837cbbb51f7220d0a4db19bc3f6dd3` | 18500 |
| `docs/reviews/web-board-detail-sol-fix/native-99c36b0.log` | 871 | `901e7c6edfda6ad5928a6794e2d2749ba654ad2687361de76d0967fe2faaea4e` | 15385 |
| `docs/reviews/web-board-detail-sol-fix/original-three-after-5c6ed8e.log` | 1045 | `b5294b21ac2f8cc86c8744e44b92d76a1e99507258daf6f149baa8edad05111f` | revision=5c6ed8e; exit=0; xai-detail-review-lL8iHn; Tests  3 passed (3) |
| `docs/reviews/web-board-detail-sol-fix/original-three-final-99c36b0.log` | 1045 | `6fe43e39714cf90267963f3f16813b9836bcb45844254d0fce29d791d1b25678` | revision=99c36b0; exit=0; xai-detail-review-IepdNM; Tests  3 passed (3) |
| `docs/reviews/web-board-detail-sol-fix/parent-tasklink-fixed-8ab38ed.log` | 12054 | `c895a34325475b440110700737ad91e2efcd2f879bb47f1f4abfb25836e8c929` | revision=8ab38ed; exit=0; Tests  336 passed (336) |
| `docs/reviews/web-board-tasklink-native/native-49a55e5-parent-admitted-fixture.log` | 456 | `a9c7f5654c6bf6ac2e50c5b221c42609af187c0e288ef30de7c21e6111dec7f4` | 23613 |
| `docs/reviews/web-board-tasklink-native/native-49a55e5-parent-before-fixture-repair.log` | 1 | `01ba4719c80b6fe911b091a7c05124b64eeece964e09c058ef8f9805daca546b` | No process verdict in artifact; source review required, never zero cost |
| `docs/reviews/web-board-tasklink-native/native-49a55e5-parent-initial.log` | 59 | `9970ac33ccf0da85343be4010152f33e6097a541cd4006613ff577b2e2e9663a` | 23393 |
| `docs/reviews/web-board-tasklink-sol-fixture-fix/after-focused-8ab38ed.log` | 18099 | `89d466756d4f958e485822195860e7dd09244f13b23342be1e7a91ba8cd0ac38` | mode='board'; mode='card'; Tests  15 passed / 90 skipped (105) |
| `docs/reviews/web-board-tasklink-sol-fixture-fix/after-package-8ab38ed.log` | 10969 | `dc8431b976d92c39a0ff9a91db2126c675bb3aab03fcc19056b243d93ff40c3c` | Tests  336 passed (336) |
| `docs/reviews/web-board-tasklink-sol-fixture-fix/before-package-99c36b0.log` | 42848 | `2ef82b2d5413135c6d50205ebe9bc9bb5351c66c7b96ee48db3a5c413a5c4bf2` | revision=99c36b0; exit=1; mode='board' 51ms; mode='card' 31ms; Tests  9 failed / 326 passed (335); Tests 9 ⎯⎯⎯⎯⎯⎯⎯ |
| `docs/reviews/web-board-tasklink-sol-fixture-fix/lint-8ab38ed.log` | 193 | `28642457417e442ab2cbf1b7879e9b0b1c9a41cfb54df78a7b1756fda4056e22` | No process verdict in artifact; source review required, never zero cost |
| `docs/reviews/web-board-tasklink-sol-fixture-fix/typecheck-8ab38ed.log` | 185 | `372dbabd7bcc2aed60b945d0e1ddff9aeda70c3f4b8f52a832c2fbd9f015cacc` | No process verdict in artifact; source review required, never zero cost |

Byte-identical historical duplicate groups:
- `2ef82b2d5413135c6d50205ebe9bc9bb5351c66c7b96ee48db3a5c413a5c4bf2`: `docs/reviews/web-board-detail-sol-fix/final-99c36b0.log`, `docs/reviews/web-board-tasklink-sol-fixture-fix/before-package-99c36b0.log`. No extra process inferred.

## 13. Single-pass integrity result and exact output preparation

Static integrity checks completed once: 312 ordered task rows from original sections.tasks; all original fields and original_module; unique workflow attribution A29/B117/C126/D40; 39 exact reversible labels; full retained original execution records; original933/current939 evidence; TT-08-only six additions; formal13/3/3/293 and299unclosed; exact registration and parent; four-TT08-doc-only P0 delta; unchanged checkout inputs; canonical Clock hash. Rehashed all **20349 inherited identities**, with zero mismatch, and added fixed-parent/current required inputs for **25729 manifest entries** over **4320 unique Git objects**.

Both complete buffers were constructed before either file write. Output hashes are in the handoff to avoid circular self-hashing. Static PASS refers only to these explicit integrity assertions, not contract approval, product behavior or any runtime check. All runtime/test/build/lint/browser/native/server/qualification/probe/vendor checks remain UNRUN (0 each). No semantic failure was retried. Failed exploratory reads (missing guessed paths/abbreviated revision and unmatched optional globs) remain disclosed; no evidence runner was launched.
