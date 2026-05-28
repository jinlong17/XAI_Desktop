# desktop-last-data-cache-polish — Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | desktop-last-data-cache-polish |
| Title | Phase 2 Desktop Last-known Data Cache Polish |
| Current Phase | FEATURE_REVIEW |
| Status | APPROVED |
| Suggested Next | feature-build |
| Automation Mode | B-Codex |
| Verify Cross-vendor | yes |
| Executor | feature-review (Codex, gpt-5.4 inline) |
| Updated | 2026-05-28 06:27 PDT |
| Brief | `docs/reviews/desktop-last-data-cache-polish/20260528-feature-brief.md` |
| Discovery Review | `docs/reviews/desktop-last-data-cache-polish/20260528-discovery-review.md` |
| Risks | The main implementation risk is over-correcting seeded demo behavior and accidentally regressing the live/browser demo path; the opposite risk is leaving any seeded desktop-offline path in place so demo data is still mistaken for last-known cache. The new unreadable-cache mode reduces the false-positive shell risk, but real macOS offline relaunch verification is still required after build. |
| Blockers | — |

## Phase Plan

### Phase 1 — Shared Desktop-offline Cache Status Seam

Status: PLANNED

- Add a browser-safe shell-level cache indicator for `desktop-phase1-offline`.
- Use lightweight `absent | readable | unreadable` checks for tasks/boards/habits, plus existing tracked-key presence for the already-safe persisted readers.
- Freeze `bannerMode = hidden | cached | empty | unreadable`; do not add authoritative freshness metadata.
- Keep live Web runtime visually unchanged.

### Phase 2 — Tasks and Board Safe Fallback

Status: PLANNED

- Replace desktop-offline seed/demo fallback with absent/corrupt-specific behavior in:
  - `@repo/plugin-web-tasks`
  - `@repo/plugin-web-board-workspaces`
- Preserve valid cached-state rendering.
- Freeze: absent/empty cache -> safe empty state; unreadable cache -> explicit unreadable-copy/state.
- Preserve browser/live demo behavior.

### Phase 3 — Habits Seed-hydration Override

Status: PLANNED

- Prevent first-launch habits seeding in desktop offline runtime when no valid cache exists.
- Freeze: default/absent cache -> safe empty state; unreadable cache -> explicit unreadable-copy/state.
- Keep browser/live seeded behavior unchanged.

### Phase 4 — Regression and Launch Verification

Status: PLANNED

- Add cached-present / cache-absent / cache-corrupt regression tests.
- Re-run web build and desktop app-bundle build.
- Record manual macOS offline relaunch expectations.

## Explicit Phase 3 Deferrals

- no canonical local-first store
- no migration/import bridge
- no offline edit queue
- no reconnect sync
- no conflict model
- no authoritative last-sync / last-updated metadata

## Revision Response

- Chosen contract: the shared shell seam now owns an explicit `unreadable` banner mode for malformed tasks/boards/habits payloads, while the affected modules must render explicit unreadable-cache copy/state instead of silently falling back.
- Naming correction: public package references are now `@repo/plugin-web-tasks` and `@repo/plugin-web-habits`; filesystem paths remain `packages/xai-web-tasks/` and `packages/xai-web-habits/` where file-level planning is needed.
- Boundary held: the revise pass keeps Phase 2 scoped to current runtime-profile and localStorage seams only; it does not introduce repository, migration, sync, queue, conflict, freshness, or SQLite/storage-engine drift.

## Review Notes

Verdict: APPROVED.

Review findings:

- Prior blockers are resolved across discovery/design/api/test/dev_log: the shared shell contract now freezes `bannerMode = hidden | cached | empty | unreadable`, gives `unreadable` precedence when targeted cached payloads are malformed, and requires explicit unreadable-cache UI in the affected tasks/boards/habits modules instead of silent fallback.
- Public package naming is aligned to repo truth for the seeded targets: `@repo/plugin-web-tasks` and `@repo/plugin-web-habits`, with filesystem-path references kept separate where needed.
- Phase 2 boundary remains intact: no repository, migration/import, edit queue, sync, conflict, freshness timestamp, SQLite, or storage-engine drift is introduced by the plan.
- Build caution: keep unreadable detection behind package-owned/public predicates rather than cross-package internal imports; real macOS offline relaunch remains a required verify-stage check.

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-28 06:11 PDT | feature-plan (Codex, gpt-5.4 inline) | Fresh plan: normalized the roadmap seed into a canonical feature brief, inspected the shipped offline-auth/runtime-profile seams plus current persisted-data modules, identified seeded desktop-offline truthfulness gaps in tasks/boards/habits, and wrote discovery/design/api/test/dev_log artifacts. Recommended a shared shell-level desktop-offline cache indicator plus targeted desktop-only safe empty/corrupt fallbacks, with all true local-first storage architecture explicitly deferred to Phase 3. | — | feature-review |
| 2026-05-28 06:18 PDT | feature-review (Codex, gpt-5.4 inline) | Review verdict: REVISE. The Phase 2 boundary is correct, but build should not proceed until the plan freezes the corrupt-cache user-visible contract and aligns task/habits package naming to repo truth. Current docs allow a misleading shell-level "cached" signal for malformed local data and repeatedly cite nonexistent public packages (`@repo/xai-web-tasks`, `@repo/xai-web-habits`) instead of `@repo/plugin-web-tasks` and `@repo/plugin-web-habits`. | — | feature-plan |
| 2026-05-28 06:21 PDT | feature-plan (Codex, gpt-5.4 inline) | Revise pass: adopted a concrete Phase 2 corrupt-cache contract with shared `bannerMode = hidden | cached | empty | unreadable`, requiring lightweight unreadable detection for the three seeded targets and explicit unreadable-cache module UI for corrupt tasks/boards/habits payloads. Corrected public package naming to `@repo/plugin-web-tasks` and `@repo/plugin-web-habits`, kept filesystem paths explicit, and preserved all Phase 2 deferrals (no repository, migration, queue, sync, conflict, freshness, or SQLite drift). | — | feature-review |
| 2026-05-28 06:27 PDT | feature-review (Codex, gpt-5.4 inline) | Review verdict: APPROVED. Confirmed the prior blockers are closed across discovery/design/api/test/dev_log, the shared unreadable-cache contract is concrete without requiring brittle cross-package internal imports, fallback rules stay Phase 2-only and preserve browser/live behavior, and the test plan covers cached/empty/unreadable plus launch non-blocking and real-macOS residual verification. | — | feature-build |
