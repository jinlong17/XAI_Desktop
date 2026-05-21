# Organizer — Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | plugin-organizer |
| Title | F3 Organizer UX rebuild |
| Roadmap | desktop-ux-rebuild · F3 |
| Status | READY_FOR_VERIFY |
| Current Phase | FEATURE_VERIFY |
| Suggested Next | feature-verify |
| Automation Mode | A-Claude |
| Verify Cross-vendor | no |
| Executor | `Codex` / `feature-auto-build` |
| Updated | 2026-05-21 04:16 PDT |
| Blockers | None |
| Concurrent Stream | G3 organizer-loop carry-forward remains active; see snapshot below |

## F3 Summary

- Canonical target stays `plugin-organizer`.
- F3 is planned as a bounded organizer UX rebuild over the active organizer stream, not a reset of G3 work.
- The revised plan now matches the live `{ gridId, rect }` / `{ gridId }` window-command contract, preserves bookmark-gated Finder semantics, and assigns explicit file/module ownership per phase.

## F3 Coordination Strategy

1. Preserve all existing G3 TODO items and Work Log rows verbatim in this file.
2. Use this Status Panel for the current F3 planning state, while keeping a separate G3 snapshot for historical continuity.
3. Treat overlapping organizer files as shared ownership territory during build; F3 phases must avoid “cleanup” changes that silently close or erase unrelated G3 carry-forward items.

## F3 Phase Plan

| Phase | Owned files/modules | Exit criteria | Guardrails |
|---|---|---|---|
| F3-P1 | `packages/plugin-organizer/src/OrganizerGridContent.tsx`, `packages/plugin-organizer/src/SmartContainer.tsx`, `packages/plugin-organizer/src/GridItem.tsx`, `packages/plugin-organizer/src/resize-handles.css` | no red border/opacity shell; no G0 fallback/telemetry/banner/count residue in production | no hook, host, or Rust edits |
| F3-P2 | `packages/plugin-organizer/src/SmartContainer.tsx`, `packages/plugin-organizer/src/GridItem.tsx`, `packages/plugin-organizer/src/OrganizerGridContent.tsx` | header/menu IA matches plan and PRD menu coverage is complete | no `useMultiWindowGrids` or host-bridge churn |
| F3-P3 | `packages/plugin-organizer/src/SmartContainer.tsx`, `packages/plugin-organizer/src/OrganizerLayer.tsx`, `packages/plugin-organizer/src/hooks/useMultiWindowGrids.ts`, `packages/plugin-organizer/src/hooks/useGridWindow.ts`, `packages/plugin-organizer/src/OrganizerGridContent.tsx`, `apps/desktop/src/windows/GridWindow.tsx`, `apps/desktop/src/windows/ControlWindow.tsx` | move drag emits only on commit; resize path respects throttled/commit budget; host callers stay aligned with `{ gridId, rect }` | no event payload changes; no `create_grid_window` / `update_grid_window` / `close_grid_window` signature changes |
| F3-P4 | `packages/plugin-organizer/src/GridItem.tsx`, `packages/plugin-organizer/src/OrganizerGridContent.tsx`, `packages/plugin-organizer/src/SmartContainer.tsx`, additive organizer thumbnail helper(s), additive Rust seam under `apps/desktop/src-tauri/src/commands/`, `apps/desktop/src-tauri/src/lib.rs`, `apps/desktop/src-tauri/capabilities/AUDIT.md`, `docs/contracts/tauri-commands-v0.md` | edge behavior and real thumbnails verified on macOS | additive only; preserve live window/finder/bookmark command shapes and semantics |

## F3 Risks

- `@repo/ui` dependency truth is temporarily split between parent-session F1 handoff and local `PLUGIN_MAP.md`.
- Native thumbnails may require additive Rust work plus authorization/cache discipline.
- G3 carry-forward items and F3 polish overlap around organizer window flows, so phased build boundaries must stay explicit.

## Concurrent Stream Snapshot — G3

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | plugin-organizer |
| Title | G3 Organizer-loop utilities + Finder commands |
| Roadmap | xai-v1 · G3 (organizer-loop) |
| Status | ACTIVE — multiple G3 features landed via Track A unattended batch |
| Current Phase | feature-build (batched) → feature-verify done; carry-forward P1s open |
| Suggested Next | address remaining G3 P1s (incl. P1-Delta path-authorization closure) |
| Automation Mode | D-Codex (Track A unattended) |
| Verify Cross-vendor | yes (Codex feature-review verdict: REVISE — see `docs/workflow/roadmap/codex-reviews/g3-organizer-batch/output.md`) |
| Executor | Claude Code / Track A |
| Updated | 2026-05-20 PDT |
| Blockers | G3-batch deviation accepted post-hoc (see Process Note in `docs/workflow/roadmap/codex-reviews/g3-organizer-batch/PROCESS-NOTE.md`); future sub-feature batches must be split per the one-phase-per-run rule |

## F3 Planned TODO

- [x] F3-P1 remove G0 fallback panel, Finder telemetry panel, multi-window banner, and grid-count badge from production organizer flows
- [x] F3-P1 delete or formally wire `resize-handles.css`
- [x] F3-P1 replace residual organizer debug styling with `@repo/ui/tokens` / `@repo/ui/icons`
- [x] F3-P1 eliminate uncontrolled production `console.*` usage in organizer flows
- [x] F3-P2 add direct close affordance and full PRD §5.1.2 grid/item context menus
- [x] F3-P3 coalesce `ORGANIZER_GRID_UPDATE_EVENT` emissions to commit-only or throttled-live budget
- [x] F3-P3 debounce folded hover expansion and tighten resize-handle motion/visuals
- [x] F3-P4 add edge snap/hide behavior
- [x] F3-P4 implement native-thumbnail seam with graceful fallback

## G3 Carry-forward TODO

- [ ] 迁移 OrganizerLayer 从 apps/desktop/src/plugins/ 到 plugin 内部 (Wave 2)
- [ ] 迁移 useMultiWindowGrids 从 apps/desktop/src/hooks/ 到 plugin 内部 (Wave 2)
- [ ] 迁移 useGridWindow 从 apps/desktop/src/hooks/ 到 plugin 内部 (Wave 2)
- [ ] 替换 Tauri 事件调用为 @repo/core/events 类型安全版本 (Wave 2)
- [ ] 注册到 PluginRegistry (Wave 2)
- [ ] 添加 Vitest 单元测试 (Wave 3)
- [ ] Zustand store 替代 React Context + localStorage (Wave 3)
- [ ] G3-E1 folder-inference regression fix (Codex P1 carry-forward — `inferKindFromPath` misclassifies real folder drops without trailing slash)
- [x] G3-E3 Finder capability/audit entry follow-up (`apps/desktop/src-tauri/capabilities/AUDIT.md` updated under P0-Echo)
- [ ] G3-E3 open-panel bookmark registration (TODO in `packages/plugin-organizer/src/hooks/useFileDrop.ts`) — register user-initiated `Open…` paths in `BookmarkRegistry` alongside drag-drop paths
- [ ] G3 coverage gaps: `data:` / custom-scheme URL rejection tests; multi-grid same-rule stability test; command-blocking / shell-failure behavior test

## Known Issues

- SmartContainer 477 行过于膨胀，需要拆分
- 缺少 Vitest 覆盖 Control→Main create-grid 事件路由
- G3-batch (commit `533391e`) bundled 5 features into one `feature-build` commit; deviation accepted post-hoc (see Process Note)
- G3-E3 `reveal_in_finder` / `open_path` originally accepted any absolute path; closed in P1-Delta (lexical root gate). Codex re-review escalated to P0 because the lexical gate is not honest provenance; P0-Echo (bookmark registry) closes it for real — see Work Log row.
- F3 thumbnail work is not approved to change existing organizer/finder/window contracts; additive seam only.

## Review Notes

- Previous blockers are resolved: the revised docs now match the live window lifecycle payloads (`create_grid_window` / `update_grid_window` use `{ gridId, rect }`; `close_grid_window` uses `{ gridId }`) and preserve the existing bookmark-gated Finder/open-path `{ input: { path } }` semantics.
- Phase ownership is now explicit enough for `feature-build`: each F3 phase names the overlapping organizer files, host bridge callers, and additive Rust/doc seam without erasing the preserved G3 snapshot or carry-forward TODOs.
- The additive-only thumbnail rule and unchanged event/window/finder contracts remain clear across discovery, design, API, and test artifacts.
- Re-verify after `3416bd4` / `55369ba` confirms the previous `useFileDrop.ts` console-noise blocker is fixed and the explicit `Delete Grid` label is present in `SmartContainer.tsx`.
- Remaining blocker: `apps/desktop/src/App.tsx` still renders the "Multi-Window Mode - Grids render in separate windows" banner in production, so the F3 cleanup acceptance for banner residue is still not met.
- Remaining blocker: `packages/plugin-organizer/src/SmartContainer.tsx` routes both `Delete Grid` and `Close Grid` to `onClose(data.id)`, and `OrganizerGridContent` + `useMultiWindowGrids` still map that close event to `deleteGrid`, so PRD delete vs. close behavior is not actually separated.
- Manual macOS verification for multi-grid drag/resize/collapse, edge snap/hide, and thumbnail behavior remains pending even though automated checks are green.

## Revision Response

- `api.md` now documents the live TS/Rust window payloads as `{ gridId, rect }` and `{ gridId }`, and preserves the existing `{ input: { path } }` bookmark-gated Finder/open-path semantics.
- The F3 phase plan now assigns explicit ownership for `SmartContainer.tsx`, `OrganizerGridContent.tsx`, `GridItem.tsx`, `useMultiWindowGrids.ts`, `useGridWindow.ts`, host bridge callers, and the additive Rust thumbnail seam.
- G3 history, TODOs, and the concurrent-stream snapshot remain preserved verbatim.

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-13 | feature-plan (initial) | 初始化四件套文档，基于 REFACTORING_PLAN v1.0 | — | — |
| 2026-05-19 | bug-fix | Tauri v2 默认不暴露 `window.__TAURI__`；修复 `isTauri()` 检测；ControlWindow `+ New Grid` 路由到 `main` + 同 `gridId` 兜底 `create_grid_window`. | — | — |
| 2026-05-20 PDT | feature-build (Claude Code, Track A — G3 batch, unattended) | Landed G3-E1 (folder/URL drop classifier + bulk adapter), G3-S3 (auto-classify rules), G3-E2 (organizer-loop deterministic seams), G3-E3 (Finder commands + `reveal_in_finder` / `open_path`), G3-E4 (item-health evaluator). **Deviation from one-phase-per-run rule** — 5 features in one commit. See Process Note. | `533391e` | feature-review (Codex) |
| 2026-05-20 PDT | feature-review (Codex cross-vendor) | Verdict: REVISE. Flagged P1s: folder-inference shape, path-authorization gap, missing Workflow V2 hygiene; P2s on capability audit and coverage. Output captured in `docs/workflow/roadmap/codex-reviews/g3-organizer-batch/output.md`. | `533391e` | feature-build (carry-forward fixes — split by issue) |
| 2026-05-20 PDT | bug-fix (Claude Code, Track A, P1-Delta) | G3-E3 path-authorization closure: replaced `validate_path` with `validate_user_path` in `apps/desktop/src-tauri/src/commands/finder.rs`; rejects `..`, relative paths, and paths outside `/Users/`, `/Applications/`, `/Volumes/`, `/tmp/`; added 4 cargo tests (dotdot / etc-root / user-home / Applications). Doc updated in `docs/contracts/tauri-commands-v0.md` §4. Carry-forward P1 closed. | _pending P1-D commit_ | continue G3 carry-forward (folder-inference, capability/audit entry, coverage gaps) |
| 2026-05-20 PDT | bug-fix (Claude Code, Track A, P0-Echo) | G3-E3 P0 honest-provenance closure: Codex re-reviewed the P1-Delta lexical gate and escalated to P0 (any `/Users/` path was still admitted; contract requires drop/open-panel or authorized bookmark). Added `apps/desktop/src-tauri/src/commands/bookmarks.rs` with `BookmarkRegistry: Mutex<HashSet<PathBuf>>` + `register_path_bookmark` / `clear_path_bookmark` IPC commands; rewired `reveal_in_finder` / `open_path` to consult the registry after the lexical gate (unbookmarked → `E3004 no user-authorized bookmark`). TS side: `finderClient.ts` now exposes `registerBookmark` / `clearBookmark`; `useFileDrop` accepts optional `finderClient` and registers every dropped path. Contract doc §4 restored "user drop/open panel or authorized bookmark" and dropped the deferred-enforcement caveat. `capabilities/AUDIT.md` adds new rows. Tests: 5 cargo bookmarks tests + 2 new finder tests (reveal_rejects_unbookmarked_path / reveal_allows_bookmarked_path) + 4 vitest finderClient tests; all green plus `pnpm --filter desktop build`. Open-panel bookmark registration tracked as TODO. | _pending P0-E commit_ | Codex re-verify of P0-Echo; G3-E3 returns to READY_TO_SHIP after green re-review |
| 2026-05-20 PDT | Track D worker (Codex) | Added G3-S4 one-click desktop organizer, G3-S5 folder mapping mock watcher, G3-S6 Finder tag read/write UI + Tauri command stubs, G5-S7 organizer create-task event emitter, and G8-S4 encrypted export/import service. `core/src/types` and `docs/contracts` remained frozen; proposed contract changes recorded under `docs/reviews/*`. | — | Track D verify |
| 2026-05-21 03:21 | `gpt-5.4` inline `feature-plan` | Planned F3 organizer UX rebuild from the desktop-ux-rebuild program brief. Created a feature-specific brief and discovery review, rewrote organizer design/api/test docs around F3 constraints, and preserved concurrent G3 history via a dedicated snapshot instead of destructive overwrite. | — | feature-review |
| 2026-05-21 03:27 PDT | `gpt-5.4` / `feature-review` | Reviewed the F3 planning artifacts and returned REVISE. Blockers: `api.md` does not match the live window-command contract (`{ gridId, rect }`), and the phase plan is still outcome-only rather than assigning explicit file/module ownership for overlapping G3/F3 organizer files and the additive thumbnail seam. | — | feature-plan |
| 2026-05-21 03:31 PDT | `Codex` / `feature-plan` | Revised F3 planning artifacts after review. Corrected `api.md` to the live window and Finder/bookmark runtime contracts, rewrote the discovery/design/test docs around additive-only thumbnail rules, and converted the F3 phase plan into an explicit file/module ownership map while preserving the G3 snapshot and carry-forward TODOs. | — | feature-review |
| 2026-05-21 03:37 PDT | `Codex` / `feature-review` | Reviewed the revised F3 planning artifacts against the live organizer/window/finder code paths and approved the plan. Confirmed the corrected `{ gridId, rect }` / `{ gridId }` window lifecycle contracts, preserved bookmark-gated `{ input: { path } }` Finder semantics, explicit phase ownership, and intact G3 snapshot/carry-forward history. | — | feature-build |
| 2026-05-21 03:49 PDT | `Codex` / `feature-auto-build` | F3-P1 complete. Removed G0 fallback/scoped telemetry residue from `OrganizerGridContent`, rewired `resize-handles.css` to live handle classes, and aligned `SmartContainer` + `GridItem` visual language to `@repo/ui/tokens` / `@repo/ui/icons` with production log cleanup in organizer flows. Tests: `pnpm --filter @repo/plugin-organizer check-types`; `pnpm --filter @repo/plugin-organizer test` (63 passed). | `f95c0ae` | continue F3-P2 |
| 2026-05-21 03:51 PDT | `Codex` / `feature-auto-build` | F3-P2 complete. Added direct close affordance in header, expanded grid-level context menu (rename/view/lock/fold/settings/close), and added item-level action menu parity (open/reveal/create-task/remove) while preserving existing command and event payload contracts. Tests: `pnpm --filter @repo/plugin-organizer check-types`; `pnpm --filter @repo/plugin-organizer test` (63 passed). | `4844ed9` | continue F3-P3 |
| 2026-05-21 03:54 PDT | `Codex` / `feature-auto-build` | F3-P3 complete. Drag updates now emit on commit only, rect updates use a 120ms throttle budget for resize/live paths, folded hover expansion is debounced, and multi-window synchronizer/bridge logging noise was removed. Evidence: `ORGANIZER_GRID_UPDATE_EVENT` cadence moved to throttled/commit path with trailing flush. Tests: `pnpm --filter @repo/plugin-organizer check-types`; `pnpm --filter @repo/plugin-organizer test` (63 passed); `pnpm --filter desktop build`. | `2824e30` | continue F3-P4 |
| 2026-05-21 03:58 PDT | `Codex` / `feature-auto-build` | F3-P4 complete. Implemented edge snap/hide commit behavior in `SmartContainer`; added thumbnail helper/cache + `GridItem` async preview upgrade; added additive Rust `generate_file_thumbnail` seam (bookmark-gated + `validate_user_path` + `qlmanage`) and registered it in `lib.rs`; updated capability/contract docs. Evidence: command shape `{ input: { path, maxSize? } }` added without modifying existing finder/window command signatures. Tests: `pnpm --filter @repo/plugin-organizer check-types`; `pnpm --filter @repo/plugin-organizer test` (65 passed); `pnpm --filter desktop build`; `(cd apps/desktop/src-tauri && cargo test)` (44 passed). | `2e404ac` | feature-verify |
| 2026-05-21 04:02 PDT | `Codex` / `feature-verify` | Verification BLOCKED after reviewing commits `f95c0ae`, `4844ed9`, `2824e30`, `2e404ac`, and `75b991b`. Automated checks passed (`pnpm --filter @repo/plugin-organizer check-types`, `pnpm --filter @repo/plugin-organizer test`, `pnpm --filter desktop build`, `cargo test`), and the additive thumbnail/window/finder contracts remain intact. Remaining blockers: `packages/plugin-organizer/src/hooks/useFileDrop.ts` still emits production `console.log` noise, and `SmartContainer`'s grid menu still lacks the documented PRD §5.1.2 Delete action (`docs/reviews/desktop-ux-rebuild/20260521-feature-brief.md`). Real macOS manual verification for multi-grid drag/resize/collapse, edge snap/hide, and thumbnails remains pending after code fixes. | `f95c0ae`, `4844ed9`, `2824e30`, `2e404ac`, `75b991b` | feature-build |
| 2026-05-21 04:10 PDT | `Codex` / `feature-auto-build` | Blocker-fix pass complete for verify findings only: removed production `console.log` noise from `useFileDrop.ts` (`dragenter`, `dragleave`, `drop`, listener-registration paths) and added explicit `Delete Grid` action in SmartContainer grid context menu while preserving existing direct close affordance and `Close Grid` action semantics. Evidence: static grep returns `NO_CONSOLE_NOISE` for `useFileDrop.ts`; `SmartContainer.tsx` now contains both `Delete Grid` and `Close Grid` entries. | `3416bd4` | feature-verify |
| 2026-05-21 04:11 PDT | `Codex` / `feature-verify` | Re-verified commits `f95c0ae`, `4844ed9`, `2824e30`, `2e404ac`, `75b991b`, `3416bd4`, and `55369ba`. Automated checks passed again: `pnpm --filter @repo/plugin-organizer check-types`, `pnpm --filter @repo/plugin-organizer test` (65 passed), `pnpm --filter desktop build`, and `cargo test` (44 passed). Remaining blockers: `apps/desktop/src/App.tsx` still renders the production multi-window banner, and `SmartContainer`'s `Delete Grid` / `Close Grid` actions still collapse to the same delete path through `OrganizerGridContent` + `useMultiWindowGrids`. Manual macOS verification for multi-grid drag/resize/collapse, edge snap/hide, and thumbnails is still pending. | `f95c0ae`, `4844ed9`, `2824e30`, `2e404ac`, `75b991b`, `3416bd4`, `55369ba` | feature-build |
| 2026-05-21 04:16 PDT | `Codex` / `feature-auto-build` | Second blocker-fix pass complete for verify findings only. Removed the production multi-window banner from `apps/desktop/src/App.tsx`. Separated delete vs close semantics: `SmartContainer` now routes `Delete Grid` through explicit `onDelete` and keeps `Close Grid`/direct close on `onClose`; `OrganizerGridContent` emits `organizer:grid:delete` for delete while keeping `organizer:grid:close` for close-window; `useMultiWindowGrids` now maps close events to `closeWindow(gridId)` and delete events to `onGridDelete(gridId)`. Existing payload shapes remain `{ gridId }`, and no Tauri command signatures changed. Tests: `pnpm --filter @repo/plugin-organizer check-types`; `pnpm --filter @repo/plugin-organizer test` (65 passed); `pnpm --filter desktop build`. Evidence: static grep confirms banner string removed in `App.tsx` and separate delete/close paths wired in organizer files. | _pending blocker-fix commit_ | feature-verify |
