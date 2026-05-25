# XAI v1 Track D Log

> **PAUSED (2026-05-24, per Web P0 Priority Override).** Web Console (`docs/workflow/roadmap/xai-web-console.md`) is the active roadmap. Do NOT start new work on this roadmap. SHIPPED rows remain authoritative for their domain; in-flight items: complete-or-park. Resumes only after P0 Web gap-closure ships and ADR-0009 (Web → Desktop Pivot Plan) is Accepted. Full rationale: `docs/reviews/web-priority-pivot-and-repo-cleanup/20260524-brief.md`.

## 2026-05-20 Checkpoint

- Branch: `codex/track-d-repo-integration`
- Scope completed: Repository v0 adapters/providers for labels, productivity, clipboard, project, console, widgets, calendar, pet, and ai-cube.
- Scope completed: organizer one-click desktop organization, folder mapping mock watcher, Finder tag UI/client/command stubs, create-task event bridge, encrypted export/import service.
- Contract blockers recorded in `docs/reviews/create-task-from-grid/proposed-contract-changes.md`, `docs/reviews/folder-grid-source/proposed-contract-changes.md`, `docs/reviews/finder-tag-read-write/proposed-contract-changes.md`, and `docs/reviews/export-import/proposed-contract-changes.md`.
- Verification so far: targeted `check-types` passed for all 10 touched plugin packages.

## Incidents

- Workspace package symlinks were missing for newly added workspace deps in Track B packages. To avoid `pnpm install`, package tsconfigs gained local `paths` mappings for `@repo/core-data` and `@repo/core/hooks`.
- `core/src/types/events.ts` is frozen, so `organizer:grid:create-task` is emitted/listened through local typed wrappers over `@repo/core/events`; formal EventMap addition is proposed, not edited.
- Finder tag write is a validated mock/no-op because robust macOS tag write needs a platform contract and command registration outside the allowed `commands/` ownership.
