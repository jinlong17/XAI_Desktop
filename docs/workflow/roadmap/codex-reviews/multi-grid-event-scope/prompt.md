# Codex Feature Post-merge Review

You are acting as the `feature-review` subagent (Codex inline, cross-vendor verify pass).
Your job is to audit a Track A feature that has already been built and committed to
`codex/track-a-desktop-foundation`. The original executor was Claude Code; you provide an
independent cross-vendor verdict.

## Hard output contract

Output ONLY the markdown block below — no preamble, no follow-up, no chatter. Keep total
length under 600 words.

```md
## Codex Cross-vendor Review

**Feature**: multi-grid-event-scope
**Commit(s)**: 78aef01 59da1e5 44345cf 653219b
**Reviewer**: codex feature-review (cross-vendor) · gpt-5.4 high
**Verdict**: APPROVED | REVISE | BLOCKED

### Strengths (max 4 bullets)
- …

### Gaps & risks (max 6 bullets, severity-tagged)
- [P0|P1|P2] …

### Concrete next-phase targets (max 6 bullets)
- …

### Out of scope confirmed
- …
```

## How to evaluate

1. Read the listed dev_log and contract docs to understand the *intended* scope.
2. Run `git show --stat 78aef01 59da1e5 44345cf 653219b` mentally — review the diff for the listed files.
3. Score against:
   - **Contract integrity** (red lines #4 / #8 / #9 in `docs/SYSTEM_ARCHITECTURE.md` §4)
   - **Test coverage adequacy** (boundary, error, concurrency, capability)
   - **Doc-code alignment** (`docs/contracts/*` matches actual surface)
   - **Security boundary** (raw key bytes, capability allow-list, IPC payload)
   - **Workflow V2 hygiene** (dev_log Status Panel, Work Log row, commit message Why/What/Scope/Risk)
   - **Future-proofing** (does the design accommodate the next 1-2 G2/G3 rows?)
4. Verdict guidance:
   - **APPROVED**: ship-ready; gaps are P2-only and recorded.
   - **REVISE**: at least one P1 issue worth fixing before next phase.
   - **BLOCKED**: at least one P0 issue (broken contract, missing test on critical path, security regression).
5. Concrete next-phase targets must be small, mergeable items (each ≤ half a day).
6. Out-of-scope: confirm which deferred gates remain valid (live Supabase, MAS sandbox, real
   macOS Finder smoke, etc.) — call them out so the next agent does not re-investigate.

## Feature-specific context

Feature ID: G1.4 / multi-grid-event-scope
Branch: codex/track-a-desktop-foundation
Commits under review:
- 653219b — docs(ship): manifest promotion (Track A)
- 78aef01 — feat(multi-grid-event-scope): migrate grid events to scoped contract
- 59da1e5 — docs(roadmap): finalize G1.4 build checkpoint
- 44345cf — docs(G1.4): mark scoped grid events ready

Files involved:
- packages/plugin-organizer/src/gridEvents.ts (event constants + guards)
- packages/plugin-organizer/src/gridEvents.test.ts (4 guard tests)
- packages/core/src/types/events.ts (EventMap update)
- docs/contracts/events-v0.md
- packages/multi-grid-event-scope/docs/dev_log.md → SHIPPED
- docs/workflow/roadmap/xai-g1-native-foundation.md row #4 (SHIPPED)

Intended scope:
- Migrate Grid runtime events to scoped namespace `organizer:grid:*` and
  `organizer:file:drop`.
- Migrate Control window create requests to `organizer:grid:create-request`.
- Preserve legacy create-request aliases as listeners only (compatibility).
- Add runtime guards rejecting missing `gridId` / malformed payloads.

Cross-vendor checklist:
1. Are all legacy event strings removed from production code (only compatibility
   constants remain)? Grep for legacy `grid:create-request`, `grid:moved`, etc.
2. EventMap in `packages/core/src/types/events.ts` matches the runtime constants?
3. Are guard tests adequate (missing gridId, invalid payload, cross-grid leak)?
4. Should Control window be allowed to listen on `organizer:grid:*` from non-Control
   windows (i.e. did the migration accidentally open the surface)?
5. Manifest promotion to SHIPPED defensible? Dev_log records right commits?
6. Deferred: manual two-Grid runtime smoke + cross-vendor verify — still valid.
