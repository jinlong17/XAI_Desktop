# Organizer — Dev Log

## Status Panel

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

## TODO
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
