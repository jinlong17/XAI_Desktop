# Plugin Labels Design

## Scope

`@repo/plugin-labels` owns the local label entity, label store, and reusable React UI for selecting and displaying labels.

## Decisions

- Data access is hidden behind `DataAdapter<Label>`.
- `LocalStorageAdapter<Label>` is the mock-first default and can be replaced with a Repository adapter later.
- Consumers store label IDs, not embedded label snapshots.
- The package has no dependency on other in-development plugins.

## W0.B Decision Snapshot — labels:* typed events emit (2026-05-23)

| Field | Value |
|---|---|
| Selected Option | Action-coupled emit at `useLabelStore.{createLabel,updateLabel,deleteLabel}` mutation outlets; declare three additive `EventMap` keys in `packages/core/src/types/events.ts`. |
| Review Doc Path | `docs/reviews/plugin-labels/20260523-discovery-review.md` |
| Review Date / Version | 2026-05-23 (v1) |
| Frozen Assumptions | (a) `@repo/core/events` is Stable; (b) `EventMap` is the only authoritative cross-window contract; (c) `Label.deletedAt?` exists in `src/types.ts` but only `RepoAdapter` honours it (LocalStorageAdapter hard-deletes); (d) emit fires *after* successful adapter mutation; (e) `.catch(() => undefined)` swallows non-Tauri rejection at every emit site. |
| Sibling pattern reused | `plugin-productivity` W0.B (shipped 2026-05-23, commits `7ee5d6f`..`99b3de9`) — `EventMap` declaration + `vi.mock("@repo/core/events")` test pattern + `.catch(() => undefined)` swallow. |
| Out of scope | UI changes; edits to `plugin-console`, `plugin-account`, `plugin-productivity`, `plugin-project`, `plugin-calendar`, `apps/desktop/**`; Tauri/Rust changes; `packages/core/src/events/{emitter,listener,index}.ts`; PLUGIN_MAP row 75 status change (W0.C handles promotion). |
| Predecessor | 2026-05-20 Track B Codex (`READY_FOR_VERIFY`) — its "Known gaps" line is converted into active scope by this row. Historical Work Log preserved in `dev_log.md`. |
| ADR-lite needed | No (additive to typed-event contract governed by `docs/adr/0003-three-faces-architecture.md`). |

## Dependency overview

| Dep | State (per `docs/PLUGIN_MAP.md`) | Used how |
|---|---|---|
| `@repo/core/events` (`emitEvent`) | Stable | Imported by `useLabelStore.tsx` only; called at three mutation outlets. |
| `@repo/core/types` (`EventMap`) | Stable | Augmented with three additive entries — declaration only; no behavioural change in core. |
| `@repo/core-data` (`Repo`, `RepoRecord`) | In-Dev | Indirect, via the existing `Label`/`RepoAdapter` surface. Not extended by this row. |
| `plugin-productivity` | In-Dev | Pattern source only (no runtime coupling). |

## Cross-window contract delta (additive only)

After `productivity:habit-reminder` (currently line 91 of `packages/core/src/types/events.ts`), append three new `EventMap` keys: `labels:created`, `labels:updated`, `labels:deleted`. No existing key is modified or renamed. See `api.md` for the full payload schema.
