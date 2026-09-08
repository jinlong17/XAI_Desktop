## Codex Cross-vendor Review

**Feature**: grid-shell-organizer-content
**Commit(s)**: 26d9f57 03ca86a 3751f43 653219b
**Reviewer**: codex feature-review (cross-vendor) · gpt-5.4 high
**Verdict**: BLOCKED

### Strengths (max 4 bullets)
- Host thinning is real: `apps/desktop/src/windows/GridWindow.tsx` now renders through `OrganizerGridContent` and no longer imports `SmartContainer`, `GridBox`, `DesktopItem`, `useFileDrop`, or Organizer internal paths.
- The extracted component keeps the intended shell/content split clear: Host owns providers and native drag handoff; Organizer owns grid UI, drop behavior, and window-scoped state/event handling.
- Ship ledger hygiene is mostly coherent: `dev_log`, manifest row #2, and deferred-gate entries all point back to `26d9f57` and the later docs-only promotion commits.
- Validation evidence is at least reproducible: `pnpm --filter @repo/plugin-organizer check-types` and `pnpm --filter desktop build` pass, and the deferred manual smoke is explicitly tracked.

### Gaps & risks (max 6 bullets, severity-tagged)
- [P0] `packages/plugin-organizer/src/OrganizerGridContent.tsx` directly imports `@tauri-apps/api/event` and `@tauri-apps/api/window`, violating `docs/SYSTEM_ARCHITECTURE.md` red line #4 (`Plugin` must not call Tauri APIs directly; use `@repo/core/hooks`/adapter surface). This is a contract-integrity break introduced by the refactor.
- [P1] `packages/plugin-organizer/src/index.ts` exposes a much broader public surface than the contract implies (`SmartContainer`, `useFileDrop`, window hooks, etc.). The Host currently behaves, but the package API still leaves easy escape hatches, so the “only `OrganizerGridContent` + types” boundary is not actually enforced.
- [P1] Test coverage is thin for an extraction that moved event/listener/drop logic: there is no focused automated regression for `gridId` scoping, close/update isolation, duplicate drop suppression, or listener cleanup; only typecheck/build/grep plus deferred manual smoke.
- [P2] Workflow hygiene is inconsistent across the reviewed set: `653219b` has proper `Why/What/Scope/Risk`, but `26d9f57`, `03ca86a`, and `3751f43` do not.
- [P2] `docs/contracts/plugin-organizer-public-api-v0.md` is still marked `Status | Draft` even though the feature was promoted to `SHIPPED`, which weakens doc-code-state alignment.

### Concrete next-phase targets (max 6 bullets)
- Replace direct Tauri calls inside `OrganizerGridContent` with a Core-owned hook/adapter layer and re-review against red line #4.
- Split or narrow the Host-facing Organizer export surface so Grid window consumers get only `OrganizerGridContent` and its prop/types contract.
- Add focused automated tests for grid-scoped update/close/drop behavior and duplicate-drop guard behavior.
- Run the deferred manual two-Grid macOS smoke after the adapter fix and record the result in `packages/grid-shell-organizer-content/docs/dev_log.md`.
- Promote the public API contract from `Draft` to an accepted/shipped state once the API boundary is actually enforced.

### Out of scope confirmed
- Manual native two-Grid runtime smoke, including Finder path drop behavior, remains a valid deferred gate and should not be skipped.
- MAS sandbox / Apple-signing validation remains an external G0.6 gate and is not reopened by this review.
- G2/G3 repository, live Supabase, and security-handle gates remain deferred and should stay out of this G1.2 closure pass.