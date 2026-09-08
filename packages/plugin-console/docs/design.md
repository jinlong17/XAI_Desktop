# plugin-console — Design

## Decision Snapshot

| Field | Value |
|---|---|
| Selected Option | Option C — `plugin-console` owns the platform-neutral three-pane shell, `@repo/core` owns shared Console contracts/registry/events, and business plugins export `ConsoleView` slots |
| Review Doc Path | `docs/reviews/plugin-console/20260521-discovery-review.md` |
| Review Date/Version | 2026-05-21 |
| Feature Type | Cross-layer parity refactor (`plugin-console` + `@repo/core` + desktop host + Tauri windowing) |
| Source Brief | `docs/reviews/plugin-console/20260521-feature-brief.md` |

## Frozen Assumptions

- Workflow target is `plugin-console`; `console-ticktick-parity` remains a review alias, not the canonical package/feature unit.
- `plugin-console` owns only shell concerns: layout, state orchestration, keyboard flow, slot rendering, search/notification/settings containers, and shell-level theming.
- Business logic for Todo, Pomodoro, Habits, Matrix, and Labels stays in `plugin-productivity` / `plugin-labels`; `plugin-console` must not absorb it.
- `@repo/core` owns only shared Console contracts: manifest typing, `ConsoleView*` types, typed `console:*` events, and PluginRegistry slot accessors.
- `apps/desktop/src/` and `apps/desktop/src-tauri/` own only console window routing and native window commands; no business logic may be introduced there.
- Phase 2 shell work will build against Contract Mock providers for productivity, labels, and account state; real module exports replace mocks in later phases before verify.
- Calendar/widgets may appear only as disabled placeholders in sidebar IA this round; `plugin-project` board/table, Web host shell, and advanced Todo fields remain out of scope.
- Shared UI extraction into `@repo/ui` is allowed only for clearly generic split-pane or shell primitives; shell-specific layout stays in `plugin-console`.

## Dependency Overview

- Stable upstream: `@repo/core`
- In-Dev upstream requiring mock-first discipline: `@repo/core-data`, `@repo/ui`, `plugin-account`
- Authority-missing upstreams in `docs/PLUGIN_MAP.md`: `plugin-productivity`, `plugin-labels`
- Integration rule for those authority-missing plugins: Phase 2 may use Contract Mock only; Phase 3/4 real ConsoleView integration cannot start until owning tracks register them in `docs/PLUGIN_MAP.md` and provide an explicit dependency state
- Host/runtime integration points: `apps/desktop/src/main.tsx`, `apps/desktop/src/App.tsx`, `apps/desktop/src-tauri/src/commands/window.rs`, `apps/desktop/src-tauri/src/lib.rs`
- Governance/docs touchpoints: `docs/PLUGIN_MAP.md`, `docs/adr/0003-three-faces-architecture.md`, `docs/planning/sub-prds/console/PRD.md`

## Phase Resolution

### Phase 1 — Freeze Console contracts and registration boundary

- Extend `@repo/core` for `ConsoleView` contracts, console slot registry accessors, manifest typings, and typed `console:*` events.
- Correct the `plugin-console` manifest model and add the minimum `PLUGIN_MAP` registration for `plugin-console`.
- Keep this phase contract-first and independently reviewable.

### Phase 2 — Build desktop console shell and window lifecycle

- Rebuild `plugin-console` from the current two-pane scaffold to the three-pane host shell.
- Add host routing plus Tauri open/close/focus/frame commands and persisted shell state.
- Keep module content mocked behind frozen contracts.

### Phase 3 — Integrate `plugin-productivity` ConsoleViews

- Precondition: `plugin-productivity` has a canonical row in `docs/PLUGIN_MAP.md`; until then this phase is not executable.
- Export and register ConsoleViews for Todo, Pomodoro, Habits, and Matrix.
- Wire keyboard-first flows, search provider participation, and shell-host capability usage.

### Phase 4 — Integrate `plugin-labels` and shell extension slots

- Precondition: `plugin-labels` has a canonical row in `docs/PLUGIN_MAP.md`; until then this phase is not executable.
- Export and register label ConsoleView, sidebar entries, settings sections, and notification/search contributions as needed.
- Replace label mocks and close end-to-end module parity for Phase 2 scope.

### Phase 5 — Reconcile overlay consistency and readiness gates

- Complete revision/ack/reconcile flows and search timeout/error handling.
- Record deferred real-macOS gates for windowing, menu bar, multi-Space, and Stage Manager behavior.
