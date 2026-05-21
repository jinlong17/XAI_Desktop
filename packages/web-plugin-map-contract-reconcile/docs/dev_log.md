# web-plugin-map-contract-reconcile — Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | web-plugin-map-contract-reconcile |
| Title | Web plugin map and package contract reconciliation |
| Status | READY_FOR_VERIFY |
| Current Phase | FEATURE_VERIFY |
| Suggested Next | feature-verify |
| Automation Mode | A-Claude |
| Verify Cross-vendor | no |
| Executor | feature-auto-build (gpt-5.3-codex inline) |
| Updated | 2026-05-21 12:13 PDT |
| Blockers | None |

## Source Context

- Roadmap manifest: `docs/workflow/roadmap/web-ticktick-parity.md`
- Source seed: `docs/reviews/web-plugin-map-contract-reconcile/20260521-roadmap-seed.md`
- Governing ADR: `docs/adr/0006-web-face-hybrid-reuse-boundary.md`

## Phase Plan

### Phase 1 — Audit package truth and stale naming

Status: DONE.

- Compare `docs/PLUGIN_MAP.md` with live package manifests and package-local docs.
- Identify stale standalone rows and missing real package registrations relevant to Web planning.
- Confirm the `ADR-0006` hybrid-reuse boundary that later rows must follow.

Gate:
- One evidence-backed package map exists for Console, Productivity, Project, Labels, Calendar, Account, Core, and Core Data.

### Phase 2 — Reconcile dependency authority and Web eligibility docs

Status: DONE.

- Update `docs/PLUGIN_MAP.md` so later Web rows stop depending on stale package names.
- Add an explicit Web planning contract section describing current build eligibility semantics.
- Align the Web dev-plan prerequisite anchor to that authority and remove fake `manifest.windows.web` assumptions.

Gate:
- A reviewer can answer "which package owns this capability?" and "is it currently Web-build-eligible?" without consulting implementation code.

### Phase 3 — Review handoff

Status: DONE.

- Freeze the docs-only scope, residual risks, and next-step review gate.

Gate:
- Planning artifacts are ready for `feature-review`.

## Risks

- Package-local docs for several plugins use older non-V2 status language; `docs/PLUGIN_MAP.md` must remain the authority until those packages are reconciled.
- The repo still has broader package-map debt outside this Web-focused slice; this feature only fixes the rows required to unblock Web planning.
- Later Web rows may still need additional contract notes if they discover browser-only deviations from Console PRD behavior.

## Review Notes

- Approved. The planning set satisfies the roadmap seed: scope stays docs-only, `ADR-0006`'s hybrid host-shell/view-layer stance is captured accurately, `docs/PLUGIN_MAP.md` now names the real Web-relevant package owners and current non-Web-ready status, and the Web dev-plan defers current package truth to that authority.
- Recommendation: in a later docs cleanup, clarify when `docs/PLUGIN_MAP.md` dependency cells are conceptual planning dependencies versus manifest-authoritative runtime dependencies so future rows do not over-read them.

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-21 12:05 PDT | feature-plan (Codex inline) | Fresh planning pass from the roadmap seed: audited live manifests and package docs, created the discovery/design/api/test/dev_log set for `web-plugin-map-contract-reconcile`, reconciled `docs/PLUGIN_MAP.md` to real Web-relevant package truth, and aligned the Web dev-plan prerequisite anchor to `ADR-0006` plus current package authority. | — | feature-review |
| 2026-05-21 12:11 PDT | feature-review (Codex inline) | Review pass approved the docs-only package-map reconciliation. Verified the stale standalone Todo/Pomodoro/Habits assumption is removed from authority docs, `ADR-0006` hybrid boundary is reflected in design/API/test notes, and the Web planning anchor now defers package truth and Web eligibility to `docs/PLUGIN_MAP.md`. | — | feature-build |
| 2026-05-21 12:13 PDT | feature-auto-build (gpt-5.3-codex inline) | Docs-only build completion: revalidated discovery/design/api/test/dev_log presence and reran the contract grep checks from `test.md` against `docs/PLUGIN_MAP.md` and `docs/planning/sub-prds/web/dev-plan.md`; no runtime/manifests/source changes required. Updated status to `READY_FOR_VERIFY`. | 69866cf | feature-verify |
