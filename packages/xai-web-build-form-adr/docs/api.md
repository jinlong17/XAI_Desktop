# xai-web-build-form-adr — ADR Contract (api.md surrogate)

> This feature ships ONE markdown file. There is no runtime API, no Tauri
> command, no typed event. The "API" of this feature is the SHAPE of the
> Accepted ADR file. This doc enumerates the required sections, their
> acceptance criteria, and the cross-doc links that must resolve.

## ADR file identity

| Field | Value |
|---|---|
| Path | `docs/adr/0007-xai-web-console-build-form.md` |
| Number | **0007** (next free after `0006-web-face-hybrid-reuse-boundary.md` per `Glob docs/adr/*.md` 2026-05-23) |
| Title | `ADR-0007: XAI Web Console — Build-form & port mapping (Vite + TS migration)` |
| Status at acceptance | **Accepted** (NOT Draft; hard constraint from seed brief) |
| Date | 2026-05-23 (or the actual acceptance date if review slips a day) |
| Decision-makers | Jinlong (project owner) + Claude (`feature-plan` → `feature-review`) |
| Supersedes | none (additive — refines ADR-0003 and ADR-0006, does not overrule them) |
| Superseded by | none |

## Required ADR sections (acceptance criteria per section)

The ADR body MUST contain each of the following sections in this order. Each
section lists a binary acceptance criterion the reviewer applies.

### S1. Header table

- AC-S1-1: Header table has exactly the four rows (`状态`, `日期`,
  `决策者`, plus optional `Supersedes` / `Superseded by`) matching the
  format used by ADR-0003 and ADR-0006.
- AC-S1-2: `状态` cell reads `Accepted` at acceptance time (Phase 2 gate).
  During Phase 1 draft authoring it MAY read `Proposed`.

### S2. 背景 (Background)

- AC-S2-1: Cites `web design/DESIGN.md` v1.0 (the prototype design spec) and
  notes the 24KB / 14 modules surface area.
- AC-S2-2: Cites `web design/index.html` lines 16–18 specifically (the
  `react@18.3.1` + `react-dom@18.3.1` + `@babel/standalone@7.29.0` script
  tags that the migration removes).
- AC-S2-3: Cites `apps/web/package.json` v0.1.0 lines 25–47 (existing deps
  including `react@^19.2.0`, `vite@^7.0.4`, `@vitejs/plugin-react@^4.6.0`,
  `@repo/plugin-console`, `@repo/plugin-productivity`,
  `@repo/web-auth-device-session`).
- AC-S2-4: Cites ADR-0003 and ADR-0006 by file path and notes how this ADR
  refines (does not overrule) them.
- AC-S2-5: Cites `docs/workflow/roadmap/xai-web-console.md` rationale R2 / R3
  / R6 for context on the platform-spine-reuse decision.
- AC-S2-6: Notes the staleness caveat for `docs/PLUGIN_MAP.md` (per
  `web-ticktick-parity` rationale R3).
- AC-S2-7: States the central question the ADR answers: "How does the
  Babel-in-browser prototype migrate into the production Vite+TS apps/web
  shell + new packages, and how does it interop with the SHIPPED
  `web-ticktick-parity` platform spine?"

### S3. 方案 (Alternatives)

The ADR MUST enumerate four alternatives with explicit 优点/缺点 lists:

- AC-S3-A: Option A — Keep Babel-standalone flat files in
  `apps/web/public/`. Rejected with stated reasons (no types, no Sentry, no
  CSP, blocks device-id injection).
- AC-S3-B: Option B — Port to `apps/web/src/modules/<name>/` only (no new
  packages). Rejected with stated reasons (violates Code Boundaries rule,
  blocks future overlay/console reuse).
- AC-S3-C: Option C — Vite+TS migration to `apps/web/src/` shell + new
  `packages/plugin-web-<module>/` per business slice. **Selected.**
- AC-S3-D: Option D — Extend existing `@repo/plugin-productivity` and
  `@repo/plugin-console`. Rejected with stated reasons (UI surface
  divergence, risk of regression in already-deployed plugins; future merge
  documented as a follow-up possibility).

### S4. 决策 (Decision)

- AC-S4-1: States `选择方案 C` (or English equivalent) explicitly.
- AC-S4-2: Re-states the Frozen Assumptions from `design.md` §"Frozen
  Assumptions" inline in the ADR (so a reader of the ADR alone gets the full
  contract). Specifically each of the 10 assumptions appears as a numbered
  bullet.
- AC-S4-3: Calls out the consume-don't-replace rule for the 10 SHIPPED
  `web-ticktick-parity` rows by name.
- AC-S4-4: Calls out the four SUPERSEDED PENDING rows by name and recommends
  hand-edit to `BLOCKED_EXTERNAL`.

### S5. 后果 (Consequences)

- AC-S5-1: Positive consequences — type safety, source maps for Sentry,
  CSP-clean ship, tree-shake, reuse of platform spine, parallel-shipable
  module rows, Three-Faces architecture preserved (per ADR-0003).
- AC-S5-2: Negative consequences — 20 new packages to wire up, downstream
  rows must do JSX→TSX work, `@repo/plugin-productivity` /
  `@repo/plugin-console` may end up as dead deps, AI Chat
  `window.claude.complete` adapter is deferred, four `web-ticktick-parity`
  rows need hand-pause.
- AC-S5-3: Explicit "deferred" list naming every open question the ADR
  does NOT resolve (AI Chat adapter, Pomodoro/Countdown key names, whether
  `@repo/plugin-productivity` is eventually retired).

### S6. Implementation Rules (实施规则)

Mirrors ADR-0006's "实施规则" section style. The ADR MUST include:

- AC-S6-1: The JSX→TSX strategy as a numbered list (10 rules from
  `design.md`).
- AC-S6-2: The cross-module communication rule (one paragraph + naming
  convention `web:<module>:<verb>-<noun>` + explicit "no
  `@repo/plugin-web-events` package" decision).
- AC-S6-3: The localStorage key registry hand-off — the 24 keys are listed
  in an appendix; ownership transfers to row #3
  (`xai-web-persistence-contract`).
- AC-S6-4: The DESIGN.md §9 "zero network dependency" vs. platform spine
  reconciliation rule (UI prefs → localStorage; durable data → encrypted
  IndexedDB + sync blob).

### S7. File-by-file port mapping table

- AC-S7-1: Table rendered as a markdown table with columns: Prototype file
  / Type / Target path / Owning row / Notes.
- AC-S7-2: Every prototype file listed in `web design/DESIGN.md` §10.1 (the
  18-row file structure) is mapped. Cross-check: `Glob web design/*.{jsx,js,css,html}`
  produces the same set.
- AC-S7-3: Every owning row referenced in the table is a real row in
  `docs/workflow/roadmap/xai-web-console.md` (#2..#24).
- AC-S7-4: New-package count totals **20** (matches `design.md` total).

### S8. Persistence keys appendix

- AC-S8-1: Lists the 24 keys from DESIGN.md §9.2 verbatim (key name +
  content).
- AC-S8-2: Includes the two manifest-R6 proposed keys
  (`xai_pomodoro_sessions`, `xai_countdowns`) clearly labelled as proposed.
- AC-S8-3: Notes that ownership transfers to row #3.

### S9. Traceability to xai-web-console roadmap

- AC-S9-1: Lists each downstream row #2..#24 by slug and points to the
  ADR section / table row that constrains it.
- AC-S9-2: Each manifest row's seed brief at
  `docs/reviews/xai-web-*/20260523-roadmap-seed.md` can cite an ADR anchor
  (verified by a manual link check — see test.md TC-T1).

### S10. 相关 (Related)

- AC-S10-1: Lists `docs/adr/0003-three-faces-architecture.md`,
  `docs/adr/0006-web-face-hybrid-reuse-boundary.md`,
  `docs/workflow/roadmap/xai-web-console.md`,
  `docs/reviews/xai-web-build-form-adr/20260523-roadmap-seed.md`,
  `docs/reviews/xai-web-build-form-adr/20260523-discovery-review.md`,
  `web design/DESIGN.md`, `web design/index.html`,
  `apps/web/package.json`, `docs/PLUGIN_MAP.md` (with staleness caveat),
  `docs/workflow/roadmap/web-ticktick-parity.md`.

## Cross-doc link contract

The ADR is the citable source. Downstream rows (#2..#24) cite the ADR by:

- File path: `docs/adr/0007-xai-web-console-build-form.md`
- Section anchor: e.g. `#s7-file-by-file-port-mapping-table`,
  `#s8-persistence-keys-appendix`, `#s6-implementation-rules`

The ADR MUST NOT change anchor IDs after acceptance (would break downstream
citations). If a typo fix is needed post-acceptance, prefer keeping the
heading text stable; if a heading must move, add an HTML anchor alias.

## Error semantics

This feature has no runtime; the only failure modes are documentation
failures, all caught by `feature-review`:

- **Missing section** — reviewer returns `REVISE` with the missing section
  named.
- **Status left as `Draft` or `Proposed` at Phase 2 close** — reviewer
  returns `REVISE`; hard constraint.
- **Port mapping row points to a non-existent roadmap row** — reviewer
  returns `REVISE`.
- **ADR conflicts with ADR-0003 or ADR-0006** — reviewer returns `REVISE`
  (per Verify Cross-vendor policy this is checked by an independent
  cross-vendor read).

## Permission / idempotency notes

- ADR file is write-once after acceptance (per `docs/adr/` convention; new
  decisions get a new ADR + Supersedes link, not an in-place edit).
- This feature's `feature-plan` and `feature-review` phases may write to
  `docs/adr/0007-…` and `packages/xai-web-build-form-adr/docs/*` only.
- This feature MUST NOT touch `docs/workflow/roadmap/xai-web-console.md` —
  only the roadmap-loop driver writes that file (per dispatch contract).
- This feature MUST NOT touch `docs/workflow/roadmap/web-ticktick-parity.md`
  — that hand-edit is documented as a human follow-up, not done by this
  agent.
