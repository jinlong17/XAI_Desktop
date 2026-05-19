# XAI v1 Deferred Gates — 2026-05-19

## Entry 1

- Feature: xai-g0-window-spike manifest
- Gate: G0
- Deferred gate: Manifest review
- Why deferred: The run is operating in 24h unattended mode and no human review is available.
- Risk: The manifest decomposition may need human adjustment before later G0 production-risk tasks, especially tasks involving native window behavior, MAS sandbox strategy, and product fallback decisions.
- What was done instead: Initialized a conservative serial manifest directly from `docs/planning/execution/G0-window-spike.md`, with each execution-pack task mapped to one feature. Only the low-risk G0.1 evidence-anchor task is eligible before human review.
- Later human action: Review `docs/workflow/roadmap/xai-g0-window-spike.md` against roadmap-prompts §6 checklist before authorizing G0.2+.
- Suggested verification command / environment: `sed -n '1,220p' docs/workflow/roadmap/xai-g0-window-spike.md`
- Files/commits affected: docs/workflow/roadmap/xai-g0-window-spike.md; commit pending

## Entry 2

- Feature: window-ground-truth
- Gate: G0
- Deferred gate: Cross-vendor feature-review
- Why deferred: The runtime override requires a serial Codex conductor with no spawn/bg dispatch, and no separate reviewer is available in unattended mode.
- Risk: The same executor planned and reviewed the low-risk G0.1 docs/evidence setup, so review independence is weaker than normal Workflow V2.
- What was done instead: Performed an inline review against discovery/design/api/test/dev_log gates and limited scope to branch/evidence documentation only.
- Later human action: Review `docs/reviews/window-ground-truth/20260519-discovery-review.md` and `packages/window-ground-truth/docs/dev_log.md` before treating G0.1 as externally reviewed.
- Suggested verification command / environment: `sed -n '1,140p' packages/window-ground-truth/docs/dev_log.md`
- Files/commits affected: packages/window-ground-truth/docs/dev_log.md; docs/workflow/roadmap/xai-v1.deferred-gates.md; commit pending
