# desktop-overlay-host-v2 - Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | desktop-overlay-host-v2 |
| Title | Optional Desktop Overlay Host V2 |
| Current Phase | FEATURE_REVIEW |
| Status | APPROVED |
| Suggested Next | feature-auto-build |
| Automation Mode | B-Codex |
| Verify Cross-vendor | yes |
| Executor | feature-review (Codex, gpt-5 inline) |
| Updated | 2026-05-29 06:37 PDT |
| Brief | `docs/reviews/desktop-overlay-host-v2/20260529-feature-brief.md` |
| Discovery Review | `docs/reviews/desktop-overlay-host-v2/20260529-discovery-review.md` |
| Risks | The repo intentionally preserves overlay/control/grid code, but key seams remain misleading unless the plan is explicit about current truth: `apps/desktop/src-tauri/src/commands/window.rs` is dormant source until `lib.rs` re-registers it and restores state management, `apps/desktop/src/main.tsx` still exposes legacy overlay routes, and `packages/plugin-organizer/src/OrganizerLayer.tsx` bundles organizer orchestration that must not silently expand row `#19` into rows `#20` or `#21`. Transparent desktop-level behavior remains high-risk because real macOS focus, click-through, and monitor-topology behavior cannot be trusted from repo-only evidence. |
| Blockers | None. Row `#18` is `SHIPPED`, so row `#19` is dependency-unblocked. |

## Roadmap Context

- Manifest: `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md`
- Row: `#19`
- Seed: `docs/reviews/desktop-overlay-host-v2/20260528-roadmap-seed.md`
- Dependency baseline:
  - row `#18` `desktop-phase3-integrated-rc-gate` is `SHIPPED`
  - row `#20` remains separate and must not be implicitly folded into this host row

## Phase Plan

### Phase 1 - Asset and contract normalization

Status: PLANNED

- freeze the keep/refactor/drop inventory for legacy overlay/control/grid assets
- normalize direct-import and active-vs-quarantined contract mismatches in the implementation plan
- record the current dormant-command truth for `commands/window.rs`
- define overlay-disabled command/error semantics before any bootstrap returns
- classify `OrganizerLayer.tsx` explicitly so host restoration stays separate from organizer restoration

### Phase 2 - Host-mode gate and persisted selection

Status: PLANNED

- extend host-owned config with explicit `hostMode`
- keep default mode `normal`
- wire startup branching so overlay bootstrap can run only when explicitly selected
- re-register `commands::window::*` in `lib.rs` together with `GridWindowsState` / `ConsoleWindowFrameState`
- keep the re-registered command handlers fail-closed in `normal`

### Phase 3 - Overlay capability and event hardening

Status: PLANNED

- keep default capabilities `main`-only
- add overlay-only capability/runtime checks for control/grid/console lifecycle
- move preserved organizer overlay events toward typed core wrappers where practical
- only extract a thinner host/window orchestration seam from `OrganizerLayer.tsx` if row `#19` needs it; defer Smart Container and organizer-surface work to rows `#20` and `#21`

### Phase 4 - Safety verification and residual-risk capture

Status: PLANNED

- verify normal-mode no-regression
- verify overlay-specific startup/focus/click-through behavior
- verify multi-monitor placement and monitor-change recovery
- record explicit real-macOS residuals before any ship decision

## Explicit Deferrals

- no default-host replacement
- no organizer product-scope expansion
- no silent reactivation of overlay startup in `lib.rs`
- no ship action in this planning pass

## Review Focus

- Does the plan keep overlay-v2 strictly optional and preserve the current normal host as default?
- Are the keep/refactor/drop decisions concrete enough for build to act on safely?
- Is the host-mode/config/command/capability gating explicit enough to prevent runtime leakage into normal mode?
- Are transparent/focus/multi-monitor and data-boundary risks separated clearly enough between repo-side and real-macOS verification?
- Does the plan avoid collapsing row `#19` into row `#20` organizer-scope work?

## Review Notes

- Approved after re-review. The planning set now matches repo truth that `apps/desktop/src-tauri/src/commands/window.rs` is dormant until `apps/desktop/src-tauri/src/lib.rs` re-registers `commands::window::*` and restores `GridWindowsState` / `ConsoleWindowFrameState`, and Phase 2 explicitly covers that re-registration under `hostMode`.
- `packages/plugin-organizer/src/OrganizerLayer.tsx` is now explicitly classified as refactor-before-reuse only, keeping row `#19` limited to optional host restoration while rows `#20` and `#21` retain Smart Container and organizer-restoration scope.
- Recommended build path remains safe and reviewable: normal mode stays default, overlay mode is opt-in, default capabilities remain `main`-only, and overlay-specific focus/click-through/multi-monitor risks are isolated into explicit manual macOS verification.

## Revision Response

- Discovery, design, API, and test docs now state that `commands/window.rs` is dormant today because `lib.rs` does not register `commands::window::*` and does not manage `GridWindowsState` / `ConsoleWindowFrameState`.
- The revised plan explicitly says row `#19` re-registers those handlers and states during build, then keeps them fail-closed unless `hostMode = overlay_v2`.
- `packages/plugin-organizer/src/OrganizerLayer.tsx` is now classified as refactor-before-reuse only. Row `#19` does not mount it as-is; at most it may extract a thinner orchestration seam, while row `#20` stays Smart Container scope and row `#21` stays organizer-restoration scope.

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-29 06:20 PDT | feature-plan (Codex, gpt-5 inline) | Fresh planning pass. Read the roadmap row, seed, workflow/ADR authority, shipped Phase 1 and Phase 3 docs, current host/config seams, and quarantined overlay/control/grid code. Produced the feature brief, discovery review, and docs quartet for an optional overlay-v2 host that keeps the normal window as default, adds explicit host-mode gating, and classifies reused legacy assets with keep/refactor/drop decisions plus transparent/focus/multi-monitor/data-boundary guardrails. | — | feature-review |
| 2026-05-29 06:28 PDT | feature-review (Codex, gpt-5 inline) | Review pass found two blocking plan gaps. The discovery/docs overstate the current window-command runtime surface because `commands/window.rs` is not registered in `lib.rs` today, and the keep/refactor/drop matrix still does not classify `packages/plugin-organizer/src/OrganizerLayer.tsx`, one of the main quarantined overlay assets. Returned the row to `feature-plan` with concrete revision notes. | — | feature-plan |
| 2026-05-29 06:31 PDT | feature-plan (Codex, gpt-5 inline) | Revise pass. Verified `commands/window.rs`, `commands/mod.rs`, `lib.rs`, `ControlWindow.tsx`, `useGridWindow.ts`, and `OrganizerLayer.tsx` against current source truth. Updated the brief, discovery review, and docs quartet to treat window commands as dormant until `lib.rs` re-registers them under the overlay-capable runtime plan, and classified `OrganizerLayer.tsx` as refactor-before-reuse so row `#19` stays separate from rows `#20` and `#21`. | — | feature-review |
| 2026-05-29 06:37 PDT | feature-review (Codex, gpt-5 inline) | Re-review approved. Confirmed the revised plan now reflects repo truth for dormant `commands::window::*`, explicit `lib.rs` re-registration under `hostMode`, `OrganizerLayer.tsx` refactor-before-reuse classification, optional overlay-only host restoration, and real package/test surfaces for the future build. | — | feature-auto-build |
