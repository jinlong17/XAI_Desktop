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

**Feature**: grid-shell-organizer-content
**Commit(s)**: 26d9f57 03ca86a 3751f43 653219b
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
2. Run `git show --stat 26d9f57 03ca86a 3751f43 653219b` mentally — review the diff for the listed files.
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

Feature ID: G1.2 / grid-shell-organizer-content
Branch: codex/track-a-desktop-foundation
Commits under review:
- 653219b — docs(ship): promote G1.2 and G1.4 manifest rows to SHIPPED (current Track A ship)
- 26d9f57 — feat(grid-shell-organizer-content): expose Organizer grid content (production refactor, pre-Track-A)
- 03ca86a — docs(ship): mark G0.1-G0.5 and G1.1+G1.6 as SHIPPED (manifest ledger)
- 3751f43 — docs(G1.2): mark grid shell split ready (dev_log → READY_TO_SHIP)

Files involved:
- packages/plugin-organizer/src/OrganizerGridContent.tsx (extracted from Host GridWindow)
- packages/plugin-organizer/src/index.ts (public export of OrganizerGridContent)
- apps/desktop/src/windows/GridWindow.tsx (thinned to native shell only)
- docs/contracts/plugin-organizer-public-api-v0.md
- packages/grid-shell-organizer-content/docs/dev_log.md (Status: SHIPPED on Track A)
- docs/workflow/roadmap/xai-g1-native-foundation.md row #2 (SHIPPED)

Intended scope:
- Move Grid window content / state / event / drop behavior out of the Host's
  `GridWindow.tsx` into a public `OrganizerGridContent` component owned by
  plugin-organizer. Host keeps native shell responsibilities only (settings provider,
  DnD provider, AppKit drag handoff).

Cross-vendor checklist:
1. Is the public Organizer API surface (only `OrganizerGridContent` + types) sufficient
   for the Host to import without leaking internals?
2. Does `apps/desktop/src/windows/GridWindow.tsx` still contain any business logic that
   should live in plugin-organizer? Grep for SmartContainer / GridBox / DesktopItem /
   useFileDrop / Organizer internal imports — confirm they are absent.
3. Are deferred gates (cross-vendor verify, manual two-Grid native runtime smoke)
   correctly listed and still valid?
4. Is the manifest promotion to SHIPPED defensible — does the dev_log record the right
   commit references and Work Log row?
5. Workflow hygiene: commit message Why/What/Scope/Risk/Docs/Tests present?
6. Architecture red line #4 (host depends on plugin only via public surface): violated
   anywhere?
