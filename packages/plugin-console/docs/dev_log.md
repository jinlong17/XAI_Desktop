# plugin-console — Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | plugin-console |
| Title | Console TickTick parity host shell |
| Status | APPROVED |
| Current Phase | FEATURE_BUILD |
| Suggested Next | feature-auto-build |
| Automation Mode | A-Claude |
| Verify Cross-vendor | no |
| Executor | feature-auto-build (Codex, gpt-5.3-codex) |
| Updated | 2026-05-21 11:24 PDT |
| Blockers | Phase 3/4 remain gated until owning tracks register `plugin-productivity` and `plugin-labels` in `docs/PLUGIN_MAP.md`; Phase 2 and mock-safe Phase 5 remain executable. |

## Legacy Context

The prior `plugin-console` docs described a two-pane scaffold and incorrectly treated that package as `READY_FOR_VERIFY`. That state is superseded by this V2 parity plan; the current feature target is the full three-pane Console shell aligned to the Console PRD and the 2026-05-21 audit/brief set.

## Phase Plan

### Phase 1 — Freeze Console contracts and registration boundary

Status: DONE.

- Add `ConsoleView` types, registry slot accessors, manifest typing, and typed `console:*` events under `@repo/core`.
- Align `plugin-console/manifest.json` with `windows.console` and console sidebar metadata expectations.
- Register `plugin-console` in `docs/PLUGIN_MAP.md` without attempting broad PLUGIN_MAP cleanup.

Gate:
- Reviewer can point to one frozen cross-plugin Console contract surface and one canonical manifest/registry rule set.

### Phase 2 — Build desktop console shell and native window lifecycle

Status: PLANNED.

- Rebuild `plugin-console` into the Sidebar/List/Detail shell with persisted pane widths, nav state, theme/density/font scale state, search/notification/settings containers, and placeholder/error matrices.
- Add desktop route registration plus Tauri console window commands for open/close/focus/get/set frame.
- Use Contract Mock providers for business modules and account sync state.
- Require `pnpm --filter desktop build` as the explicit host-routing automated gate for this phase.

Gate:
- Console window opens independently from overlay and restores shell state without real business integrations yet.

### Phase 3 — Integrate `plugin-productivity` ConsoleViews

Status: BLOCKED_BY_AUTHORITY.

- Precondition: owning track adds a canonical `plugin-productivity` row to `docs/PLUGIN_MAP.md` with an explicit state and dependency note.
- Until that precondition is met, retain productivity mocks and do not treat package-local code readiness as dependency authority.
- Export/register ConsoleViews for tasks, pomodoro, habits, and matrix once the authority gate is cleared.
- Wire keyboard-first flows, search participation, and shell capability usage without breaking plugin boundaries.

Gate:
- All `plugin-productivity` Phase 2 modules are usable inside the Console shell with real plugin exports, and the dependency state is traceable to `docs/PLUGIN_MAP.md`.

### Phase 4 — Integrate `plugin-labels` and shell extension slots

Status: BLOCKED_BY_AUTHORITY.

- Precondition: owning track adds a canonical `plugin-labels` row to `docs/PLUGIN_MAP.md` with an explicit state and dependency note.
- Until that precondition is met, retain label mocks and do not treat package-local code readiness as dependency authority.
- Export/register Labels ConsoleView plus required search/settings/sidebar contributions once the authority gate is cleared.
- Replace remaining label mocks and close the last user-facing module gap in the planned scope.

Gate:
- Labels are fully usable inside Console and reachable through keyboard navigation and Cmd+K, and the dependency state is traceable to `docs/PLUGIN_MAP.md`.

### Phase 5 — Reconcile overlay consistency and readiness gates

Status: PLANNED.

- Finish revision/ack/reconcile wiring between Console and overlay listeners.
- Harden timeout/error/degrade behavior and capture deferred real-macOS verification gates.

Gate:
- Automated checks can validate contract behavior, and deferred manual gates are explicit for later verify/ship.

## Risks

- `@repo/core` contract changes can create breaking churn if `ConsoleViewProps` or registry slot shapes are not frozen early.
- `@repo/ui` is still In-Dev; any shared split-pane primitives must stay minimal to avoid scope inflation.
- `plugin-productivity` and `plugin-labels` are currently authority-missing from `docs/PLUGIN_MAP.md`; if their owning tracks do not reconcile that table, Console parity will stall after the mock-backed shell phase.
- Tauri menu bar / multi-Space / Stage Manager behavior still needs real hardware verification and may force host-level adjustments late.
- The current repo already contains PLUGIN_MAP drift and pre-V2 console docs; reviewers need to judge only the scoped parity fixes in this feature.

## Review Notes

- Blocker: the planning set treats `plugin-productivity` and `plugin-labels` as `READY_FOR_VERIFY` dependencies in the brief/discovery/design docs, but `docs/PLUGIN_MAP.md` does not list either plugin at all. Because PLUGIN_MAP is the repo's dependency authority, the plan currently lacks a canonical status source for Phase 3/4 integration and for when Contract Mock retirement is allowed.
- Required revision: update the planning artifacts so dependency status language is anchored to `docs/PLUGIN_MAP.md`. Either add the minimum PLUGIN_MAP rows needed for `plugin-productivity` / `plugin-labels` with non-stable states plus mock-first guidance, or explicitly make Phase 3/4 contingent on a separate PLUGIN_MAP reconciliation by the owning tracks before real integration begins.
- Recommendation: extend `packages/plugin-console/docs/test.md` with a desktop host typecheck/build check covering the planned `apps/desktop/src/` route changes, so Phase 2 host wiring has an explicit automated gate in addition to package checks and `cargo test`.

## Review Notes — Round 2 (feature-review, APPROVED)

- Verdict: APPROVED. The Revise pass resolved the Round 1 blocker correctly and the planning set is executable with no blocking ambiguity.
- Verified against repo ground truth:
  - `docs/PLUGIN_MAP.md` genuinely lists neither `plugin-productivity`, `plugin-labels`, nor `plugin-console`/`console` — the discovery report's authority-gap claim is accurate, not assumed.
  - `packages/plugin-productivity/` and `packages/plugin-labels/` exist on disk as real packages (`@repo/plugin-productivity`, `@repo/plugin-labels`), matching the docs' "directories exist but unregistered" framing.
  - `packages/plugin-console/manifest.json` confirms `windows.control=true` and `enabled=false`, matching discovery §1 evidence verbatim.
  - `pnpm --filter desktop build` uses a valid filter — the desktop app package is named `desktop`.
- Dependency claims are consistent across all six docs: brief, discovery, design, api, test, and dev_log all treat `plugin-productivity`/`plugin-labels` as authority-missing dependencies; Phase 3/4 are `BLOCKED_BY_AUTHORITY` with explicit `PLUGIN_MAP.md` preconditions owned by the respective tracks.
- api.md is internally consistent with design.md (ConsoleView contract family, ConsoleViewProps, typed `console:*` events, manifest typings all aligned), and test.md covers the API contract (registry/manifest/Tauri-command/event/host-routing contract sections).
- Phase 2 host-routing gate `pnpm --filter desktop build` is concretely specified in both test.md automated checks and the dev_log Phase 2 block.
- Recommendation (non-blocking): a separate `pnpm --filter desktop check-types` was suggested in Round 1; the plan added the build gate instead. The build gate subsumes route-wiring typecheck, so this is acceptable. Optionally add the desktop typecheck during Phase 2 build for faster feedback.
- Findings summary: 0 blockers, 1 recommendation.

## Revision Response

- Resolved by revising the brief/discovery/design/api/test/dev_log set so `plugin-productivity` and `plugin-labels` are now treated as authority-missing dependencies, not as implicitly ready integration targets.
- Phase 3 and Phase 4 now carry explicit `docs/PLUGIN_MAP.md` preconditions owned by those tracks; Phase 2 remains executable with Contract Mock.
- Added `pnpm --filter desktop build` to the automated checks and called it out as the Phase 2 host-routing gate.

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-21 03:22 PDT | feature-plan (Codex inline) | Continue plan: canonicalized the feature target to `plugin-console`, created the canonical brief/discovery pair, replaced the old scaffold docs with a contract-first parity plan, resolved the Contract Mock sequencing, and split the oversized scope into five independently reviewable build phases. | — | feature-review |
| 2026-05-21 03:30 PDT | feature-review (Codex inline) | Review pass: returned REVISE because Phase 3/4 dependency readiness for `plugin-productivity` and `plugin-labels` is not grounded in `docs/PLUGIN_MAP.md`, and added one test-plan recommendation for host route verification. | — | feature-plan |
| 2026-05-21 03:33 PDT | feature-plan (Codex inline) | Revise plan: reconciled all planning docs to `docs/PLUGIN_MAP.md`, converted `plugin-productivity` and `plugin-labels` into explicit authority-gated Phase 3/4 dependencies, and added `pnpm --filter desktop build` as the Phase 2 host-routing gate. | — | feature-review |
| 2026-05-21 04:05 PDT | feature-review (Claude Code, claude-opus-4-7) | Cross-executor review pass (Codex plan -> Claude review): verified the authority-gap dependency claims against repo ground truth (PLUGIN_MAP.md, package dirs, manifest.json, desktop filter), confirmed api.md/design.md consistency and test.md contract coverage, and confirmed Phase 2/3/4 gates are concrete. Verdict APPROVED, 0 blockers / 1 recommendation. Flipped Status Panel to APPROVED. | — | feature-build |
| 2026-05-21 11:24 PDT | feature-auto-build (Codex, gpt-5.3-codex) | Phase 1 — Freeze Console contracts and registration boundary: added `@repo/core` Console contracts (`ConsoleView*` types, `windows.console`, `ui.consoleSidebar`, typed `console:*` events), added PluginRegistry Console slot accessors, aligned `plugin-console/manifest.json` with console window/sidebar metadata, and added `plugin-console` row to `docs/PLUGIN_MAP.md` without touching productivity/labels authority rows. | pending (Phase 1 commit in progress) | feature-auto-build |
