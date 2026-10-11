# Direct preference binding refresh at `46e2d96`

Fresh Luna static inventory after accepted TT-08 documentary caller reconciliation. Requested revision `46e2d967993d61f41706e15f69308d75ac1f0346` resolved via `git rev-parse 46e2d967993d61f41706e15f69308d75ac1f0346^{commit}` to the same full SHA. This inventory is static source evidence only.

## Run receipt

- Scanner: `docs/reviews/web-d2-pref-binding-inventory/scan.mjs`, SHA-256 `b9dfbec4aa3122c920293068a5fab76e3275728a44ec9e6f4b31f81719f2df61` (unchanged).
- Command, exactly once: `NODE_PATH=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop/node_modules node docs/reviews/web-d2-pref-binding-inventory/scan.mjs 46e2d967993d61f41706e15f69308d75ac1f0346`.
- Exit: `0`; stdout: `{"files":22,"bindings":47,"literalKeys":26,"dynamicSites":1,"setterBindings":30,"directlyInvokedSetters":27,"downstreamOnly":3,"readOnlyBindings":17}`; stderr empty. No diagnostics or retries.
- Runtime: Node `v22.23.3`; TypeScript `5.9.2` resolved read-only at `/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop/node_modules/.pnpm/typescript@5.9.2/node_modules/typescript/lib/typescript.js`, matching pnpm lock. No install; no main-checkout files written.
- Source read by the scanner: 319 tracked `packages/**/*.tsx` files at the immutable requested revision, excluding `__tests__`; direct identifier calls named `usePref` and syntactic setter references only.

## Complete ordered comparison

The generated result contains 47 rows, same boundary, identical field names, counts, and every ordered row field versus accepted `bindings-f9eb4b1.json`. Actual delta: **0 removed, 0 added, 0 changed**. The card predicted zero change; the observed comparison confirms it. Counts are {"files":22,"bindings":47,"literalKeys":26,"dynamicSites":1,"setterBindings":30,"directlyInvokedSetters":27,"downstreamOnly":3,"readOnlyBindings":17}.

## Reconciliation and scope

Three ledger files at the fixed reconciliation parent retain these SHA-256 identities:

- `ALL-TODO-CURRENT.md`: `59bf980531bfe869597aa0db9f1a7f09a850a7c9d03483e61e98f09ace1e5cf2` (unchanged at this fixed reconciled parent)
- `EXECUTION.md`: `f052f0072abd3ef3e15603c06c37386a7ba65128934c8b05c4f970220c825f38` (unchanged at this fixed reconciled parent)
- `EXECUTION.json`: `b11bd620c608b9d56ea1f0f879e0705278a1bda86f09cd09675f598552d181fc` (unchanged at this fixed reconciled parent)

The accepted TT-08 reconciliation states that only six TT-08 evidence references were appended; all original 312 IDs/order/status, metadata, non-TT-08 records and prior evidence remain preserved. Formal counts remain **13 completed / 3 verification_pending / 3 in_progress / 293 pending; 299 unclosed**. Documentary TT-08 caller acceptance is not formal-item closure, runtime or release acceptance.

P0 runtime evidence remains unchanged. Four package documents and the canonical PRD are intentionally different from P0 under the accepted TT-08 documentary scope. This scan does not revisit or extend those claims.

This is a narrow syntax inventory, not a full writer inventory, defect count, product acceptance, runtime test, or D2 closure. It excludes wrappers, indirect/raw writes, non-TSX files, `apps/`, alternate stores and side-effect consumers. Row presence or absence does not establish storage ownership, success/refusal behavior, recovery, or correctness. No product tests, runtime, browser, native, vendor, or probes were run.

Full SHA-256 identities for all 319 scanner source blobs and the governing acceptance, prior inventory, scanner, reconciliation task, current ledger files, task card, and TT-08 P0 documentary inputs are recorded in `inputs-46e2d96.sha256`.
