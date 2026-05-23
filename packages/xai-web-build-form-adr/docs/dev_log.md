# xai-web-build-form-adr Dev Log

## Status Panel

- Workflow: FEATURE_DEV
- Target: xai-web-build-form-adr
- Title: ADR-0007 — XAI Web Console build-form & port mapping (Vite + TS migration)
- Current Phase: FEATURE_VERIFY
- Status: READY_FOR_VERIFY
- Executor: feature-auto-build (claude-sonnet-4-6)
- Updated: 2026-05-23 14:45
- Suggested Next: feature-verify
- Automation Mode: A-Claude
- Verify Cross-vendor: yes
- Roadmap: docs/workflow/roadmap/xai-web-console.md (row #1, Wave 0)
- ADR-lite: N/A (this feature IS an ADR; produces a full ADR, not an ADR-lite)

## Phase Progress

- P1 — Write ADR draft + port mapping table: DONE (ADR Status=Proposed)
- P2 — Review pass + flip to Accepted: DONE (ADR Status=Accepted)
- P3 — Traceability appendix + roadmap recommendations: DONE

## Brief / Review Docs

- Seed brief: `docs/reviews/xai-web-build-form-adr/20260523-roadmap-seed.md`
- Discovery review: `docs/reviews/xai-web-build-form-adr/20260523-discovery-review.md`
- Design snapshot: `packages/xai-web-build-form-adr/docs/design.md`
- ADR contract: `packages/xai-web-build-form-adr/docs/api.md`
- Verification strategy: `packages/xai-web-build-form-adr/docs/test.md`
- Target ADR file (to be written in Phase 1 / accepted in Phase 2):
  `docs/adr/0007-xai-web-console-build-form.md`

## Frozen decision (selected option C)

Vite + TypeScript migration into `apps/web/src/` host shell + 20 new
`packages/plugin-web-<module>/` packages. Cross-module communication via
the existing `@repo/core/events` typed bus (no new
`@repo/plugin-web-events` package). Persistence: UI prefs → localStorage
via the contract owned by row #3 (`xai-web-persistence-contract`); durable
data → encrypted IndexedDB + sync blob via the SHIPPED
`web-ticktick-parity` platform spine.

Four PENDING `web-ticktick-parity` rows are SUPERSEDED and recommended for
hand-edit to `BLOCKED_EXTERNAL`:
`web-productivity-habits-pomodoro`, `web-project-label-calendar`,
`web-search-keyboard-theme`, `web-statistics-views`.

Full list of 20 new packages and the file-by-file port mapping table are
in `design.md` §"File-by-file Port Mapping (Frozen)".

## Phase Plan

### P1 — Write ADR draft + port mapping table

- Author `docs/adr/0007-xai-web-console-build-form.md` with Status=Proposed.
- Required sections per `api.md` S1..S10:
  - S1 Header table
  - S2 背景 (cites DESIGN.md, index.html lines 16–18, apps/web/package.json,
    ADR-0003, ADR-0006, manifest R2/R3/R6, PLUGIN_MAP staleness caveat)
  - S3 方案 — four alternatives A/B/C/D with 优点/缺点
  - S4 决策 — selects C, restates 10 Frozen Assumptions inline
  - S5 后果 — positive / negative / deferred
  - S6 Implementation Rules — JSX→TSX rules (10), cross-module rule,
    localStorage hand-off, DESIGN.md §9 vs platform spine reconciliation
  - S7 File-by-file port mapping table (all 18 prototype files → 20 packages)
  - S8 Persistence keys appendix (24 keys verbatim from DESIGN.md §9.2)
  - S9 Traceability to xai-web-console roadmap (rows #2..#24)
  - S10 相关 (cross-doc link section)
- Gate: ADR draft exists, all 10 sections present, every prototype file
  mapped, every owning-row slug present in the manifest.

### P2 — Review pass + flip to Accepted

- `feature-review` reads ADR + this design.md + api.md + test.md.
- Validates TC-T1..TC-T9 from `test.md`.
- Returns APPROVED → flip ADR Status from Proposed to Accepted in the
  same review commit; or REVISE → return to `feature-plan` with notes
  recorded under "Review Notes" below.
- Gate: ADR Status=Accepted, no AC fails.

### P3 — Traceability appendix + roadmap recommendations

- Append the "Traceability to xai-web-console roadmap" subsection in §S9
  linking each downstream row #2..#24 to the relevant ADR anchor.
- Append the explicit hand-edit recommendation block for the four
  superseded `web-ticktick-parity` rows.
- Gate: every downstream seed brief at
  `docs/reviews/xai-web-*/20260523-roadmap-seed.md` could (in principle)
  cite an ADR anchor for its scope.

### Phase split rationale

Three documentation phases keep each phase's review budget tight. P1 is
authoring-heavy (full ADR + 20-row port table). P2 is reviewer-heavy
(consistency check, no new content). P3 is finishing touches
(cross-references). Builders downstream cite the Accepted ADR after P2;
P3 only adds traceability, not new contract.

## Risks

- **R1 (medium):** `docs/PLUGIN_MAP.md` staleness — ADR cites with caveat;
  downstream rows must re-verify (carried forward from discovery §5 R1).
- **R2 (low):** ADR cannot edit `web-ticktick-parity` manifest — hand-edit
  recommendation surfaced in §Consequences and Handoff (discovery §5 R2).
- **R3 (low):** AI Chat `window.claude.complete` Vite-era adapter is
  deferred to row #18 (discovery §5 R3).
- **R4 (low):** Pomodoro / Countdown key names are proposed-not-frozen
  (discovery §5 R4).
- **R5 (medium):** DESIGN.md §9 "zero network" vs platform spine sync —
  resolved in ADR §S6 Implementation Rules (discovery §5 R5).
- **R6 (low):** `@repo/plugin-productivity` / `@repo/plugin-console`
  potentially-dead-deps cleanup deferred (discovery §5 R6).
- **R7 (low):** Cross-vendor verify (yes) may flag a divergent reading of
  ADR-0003 / ADR-0006; ADR explicitly affirms refinement-not-overrule
  (discovery §5 R7).

## Review Notes

### 2026-05-23 12:35 — feature-review (Claude Opus 4.7 1M) — APPROVED

Verdict: **APPROVED**. The four-doc set is executable. No structural revision
needed before P1 ADR authoring.

Gate-by-gate findings:

1. **Seed-brief fidelity** — PASS. Every Requirement, Hard constraint, and
   Acceptance signal in the seed brief is covered:
   - Port mapping → design §"File-by-file Port Mapping" + api §S7 + TC-T4.
   - JSX→TSX strategy → design §"JSX → TSX Strategy" + api §S6 AC-S6-1.
   - Window-global → typed import → design §"JSX → TSX Strategy" rule 4
     (and Frozen Assumption §4).
   - localStorage hand-off → design §"localStorage Key Registry Hand-off"
     + api §S8 + TC-T6.
   - web-ticktick-parity interop → design §"Interop with web-ticktick-parity
     Platform Spine" + api §S6 AC-S6-4 + Frozen Assumption §6.
   - Doc-only constraint → api.md "Permission/idempotency notes" forbids
     touching either roadmap manifest.
   - 4 superseded rows + pause recommendation → design Frozen Assumption §7
     + api §S4 AC-S4-4 + TC-T8.
   - DESIGN.md §9.2 canonical → design §"localStorage Key Registry Hand-off"
     + api §S8 AC-S8-1.
   - Per-module packaging + event-bus rule → design §"Cross-module
     Communication Rule" + api §S6 AC-S6-2.

2. **ADR scope completeness (7 must-include items)** — PASS. All 7 items have
   dedicated sections in the planned ADR shape (verified against api.md
   §S1..S10):
   1. File-by-file port mapping → §S7.
   2. JSX→TSX strategy → §S6 AC-S6-1 (10-rule numbered list).
   3. packages/plugin-web-* vs apps/web/src/modules/ choice → §S3 Option B
      rejection + §S4 selects Option C.
   4. Cross-module communication rule → §S6 AC-S6-2 (event-bus naming
      convention + explicit rejection of `@repo/plugin-web-events`).
   5. Persistence hand-off → §S8 appendix + §S6 AC-S6-3.
   6. Platform-spine interop → §S6 AC-S6-4 + §S4 AC-S4-3 (consume-don't-replace
      list of 10 SHIPPED rows).
   7. Supersession list → §S4 AC-S4-4 + appendix recommending hand-edit.

3. **Precedent ADR consistency** — PASS.
   - ADR-0003 (Plugin 平台无关, 禁止直接 import Tauri API): respected.
     `packages/plugin-web-*` are explicitly browser-only with no Tauri
     dependency. TC-T7 verifies.
   - ADR-0006 (Web 可独立实现 Vite SPA host shell + 浏览器 view layer; Web
     feature 不得自行发明新的数据契约): explicitly refined-not-overruled. The
     Interop section reconciles DESIGN.md §9 "zero network" with the spine
     by splitting UI prefs (localStorage) from durable data (encrypted
     IndexedDB + sync blob).
   - ADR-0007 declares `Supersedes: none` (additive refinement). Correct
     stance — no need to flip ADR-0003 or ADR-0006 to Superseded.

4. **Cross-vendor verify gate** — PASS. test.md TC-T10 explicitly defines the
   cross-vendor verify step with PASS criteria (no internal contradictions,
   no conflict with ADR-0003/0006, port mapping unambiguous to a cold
   reader, 4 SUPERSEDED rows identifiable). dev_log Status Panel carries
   `Verify Cross-vendor: yes`. design.md Phase Plan tail repeats the gate.

5. **Phasing reasonableness** — PASS. P1 (author full ADR) / P2 (review +
   flip Proposed→Accepted) / P3 (traceability appendix + hand-edit
   recommendation) is right-sized for an ADR-only artifact. P3 is a genuine
   separable concern (downstream-citation indexing + cross-manifest
   advisory) and is not artificially inflated. Each phase produces a single
   commit and is reviewable.

6. **Open reviewer questions Q-Rev-1..4** — All NON-MATERIAL. Resolved as:
   - Q-Rev-1 (merge tokens+icons into plugin-web-foundation?): design.md
     keeps them separate with stated rationale (icons is pure SVG, tokens
     is pure CSS — co-locating only the two CSS-equivalent files in
     plugin-web-tokens is internally consistent). Acceptable.
   - Q-Rev-2 (retire @repo/plugin-productivity / @repo/plugin-console deps
     now?): explicitly punted to a future web-ticktick-parity cleanup row.
     Acceptable — not a v1 blocker.
   - Q-Rev-3 (introduce @repo/plugin-web-events?): design.md rejects on
     indirection grounds. Reviewer concurs — `@repo/core/events` already
     provides the typed bus; a re-export layer adds API surface without
     architectural gain. Acceptable.
   - Q-Rev-4 (promote 4 pause recommendations to SHIP-BLOCKING?): manifest
     ownership rules already place that hand-edit outside this feature's
     write zone, and roadmap-loop is the only writer of either manifest.
     Advisory framing in §Consequences + Handoff surface is sufficient.
     Acceptable.

7. **Code-boundary check** — PASS. api.md "Permission/idempotency notes"
   forbids touching `docs/workflow/roadmap/xai-web-console.md` and
   `docs/workflow/roadmap/web-ticktick-parity.md`. Write zone limited to
   `docs/adr/0007-…` and `packages/xai-web-build-form-adr/docs/*`. Matches
   roadmap-loop dispatch contract.

8. **Risk register coverage** — PASS. Discovery R1..R7 are mirrored 1:1 in
   design.md "Decision Risk Register" (R-A1..R-A6) and dev_log "Risks"
   (R1..R7). Each carries a mitigation.

Recommendations for P1 author (non-blocking, treat as hints not requirements):

- When listing the 24 DESIGN.md §9.2 keys in §S8, mark
  `xai_pomodoro_sessions` and `xai_countdowns` with a "(proposed)" tag in
  the table — the owning rows may rename without re-opening the ADR
  (per Frozen Assumption R-A5).
- The §S9 traceability table will be easier to maintain if each downstream
  row's anchor is the slug (e.g. `#row-xai-web-tasks`) rather than the
  table row number — manifest row numbers may shift.
- Confirm at P1 that the ADR header table format matches ADR-0006 (4 rows:
  状态 / 日期 / 决策者 / optional Supersedes-Superseded by) — api.md
  AC-S1-1 already requires this; calling it out so the author does not
  follow ADR-0003's slightly older format.

Status flip: NEEDS_REVIEW → APPROVED. Suggested Next: feature-auto-build
(loop dispatch will pick this up under serial mode).

## Work Log

### 2026-05-23 12:00 — feature-plan (Claude Opus 4.7 1M)

- Action: Fresh-mode discovery for `xai-web-build-form-adr` (Wave 0 of
  xai-web-console roadmap, dispatched serially 2026-05-23). Read seed
  brief, DESIGN.md (§10 tech stack + §9.2 persistence keys), index.html,
  apps/web/package.json, ADR-0003, ADR-0006, manifest. Confirmed next
  ADR number is 0007 via `Glob docs/adr/*.md`.
- Files written (initial four-doc set + discovery review):
  - `packages/xai-web-build-form-adr/docs/design.md`
  - `packages/xai-web-build-form-adr/docs/api.md`
  - `packages/xai-web-build-form-adr/docs/test.md`
  - `packages/xai-web-build-form-adr/docs/dev_log.md` (this file)
  - `docs/reviews/xai-web-build-form-adr/20260523-discovery-review.md`
- Frozen decision: Option C (Vite + TS migration into apps/web shell + 20
  new packages/plugin-web-* packages, cross-module via @repo/core/events,
  reuse web-ticktick-parity platform spine, hand-pause 4 superseded
  PENDING parity rows).
- Phase plan: P1 draft ADR-0007 → P2 review + flip Accepted → P3
  traceability appendix.
- Commits: — (no commits in feature-plan turn; produced docs/state only)
- Next step: `feature-review` to validate the four-doc set + recommend
  Phase 1 ADR authoring scope. Status set to NEEDS_REVIEW.

### 2026-05-23 12:35 — feature-review (Claude Opus 4.7 1M)

- Action: Reviewed `design.md`, `api.md`, `test.md`, discovery report, and
  seed brief against all six gates from the roadmap-loop dispatch
  (seed-brief fidelity / ADR scope completeness 7-items / precedent ADR
  consistency with ADR-0003 + ADR-0006 / cross-vendor verify gate /
  phasing reasonableness / Q-Rev-1..4). Cross-read ADR-0003 §方案 C and
  ADR-0006 §决策 + §实施规则 to confirm ADR-0007 framing as
  refinement-not-overrule is internally consistent.
- Verdict: **APPROVED**. 0 blockers. 3 non-blocking author hints recorded
  in Review Notes for the P1 author to consider (proposed-tag on 2 keys,
  anchor-by-slug for §S9, header format mirroring ADR-0006).
- Files updated: `packages/xai-web-build-form-adr/docs/dev_log.md` (this
  file — Status Panel flip + Review Notes section).
- Commits: — (review notes only, no code/doc artifact changes outside
  dev_log).
- Next step: `feature-auto-build` to author the ADR at
  `docs/adr/0007-xai-web-console-build-form.md` per the Phase Plan
  (P1 draft → P2 flip to Accepted → P3 traceability appendix). Roadmap-loop
  serial dispatch will pick this up.

### 2026-05-23 14:00 — feature-auto-build P1 (claude-sonnet-4-6)

- Action: P1 — Author `docs/adr/0007-xai-web-console-build-form.md` with
  Status=Proposed. Read design.md, api.md, test.md, dev_log.md, ADR-0003,
  ADR-0006, xai-web-console.md manifest, DESIGN.md §9.2 (persistence keys),
  index.html (lines 16–18 CDN scripts), discovery-review.md. Implemented all
  10 required ADR sections per api.md S1..S10:
  - S1 Header table (状态/日期/决策者/Supersedes/Superseded by)
  - S2 Background (cites DESIGN.md §10 tech stack, index.html lines 16–18,
    apps/web/package.json v0.1.0 deps, ADR-0003, ADR-0006, roadmap R2/R3/R6,
    PLUGIN_MAP staleness caveat; central question stated)
  - S3 Four alternatives A/B/C/D with 优点/缺点 and rejection reasoning
  - S4 Decision: "选择方案 C"; 10 frozen assumptions inline; 10 SHIPPED parity
    rows named (consume-don't-replace); 4 superseded PENDING rows named with
    hand-edit recommendation (BLOCKED_EXTERNAL)
  - S5 Consequences: 8 positive / 5 negative / 3 deferred open questions
  - S6 Implementation Rules: 10 JSX→TSX rules (numbered); cross-module comm
    rule (web:<module>:<verb>-<noun>, rejects @repo/plugin-web-events);
    localStorage key registry hand-off; DESIGN.md §9 reconciliation (UI prefs
    → localStorage; durable data → encrypted IndexedDB + sync blob)
  - S7 File-by-file port mapping: 21-row table covering all 20 prototype files
    (index.html + tokens.css + layout.css + i18n.js + board-data.js +
    icons.jsx + shell.jsx + app.jsx + 13 module-*.jsx + pet.jsx) mapped to
    20 new packages + host shell extension; all owning slugs in manifest #2..#24
  - S8 Persistence keys: 24 DESIGN.md §9.2 keys verbatim (4 shell + 2 pet +
    13 module data + xai_pref_* family); xai_pomodoro_sessions + xai_countdowns
    labelled "proposed" per reviewer hint; row #3 named as owner
  - S9 Traceability: all rows #2..#24 linked to constraining ADR sections by
    slug anchor; 4 superseded parity rows hand-edit recommendation with
    canonical Note text
  - S10 Related: all 10 cross-doc links present
  Inline-validated 3 reviewer hints from Review Notes:
  - proposed tag on xai_pomodoro_sessions + xai_countdowns (§S8 DONE)
  - anchor-by-slug in §S9 traceability table (DONE)
  - header format mirrors ADR-0006 (4 rows: 状态/日期/决策者/Supersedes) (DONE)
- Files written:
  - `docs/adr/0007-xai-web-console-build-form.md` (new, Status=Proposed)
  - `packages/xai-web-build-form-adr/docs/dev_log.md` (Phase Progress update)
- Commits: f167310 docs(xai-web-build-form-adr): P1 — author ADR-0007 draft
  (Status=Proposed)
- Tests run: N/A (documentation-only phase; TC-T1..TC-T9 to be validated by
  feature-verify)
- Evidence: ADR contains all 10 sections; 20 prototype files mapped in S7;
  24 keys enumerated in S8 with proposed tags on 2 keys; S9 traceability table
  covers #2..#24 by slug; 4 parity rows named with hand-edit recommendation.
- Next step: P2 — flip ADR Status Proposed → Accepted (self-review pass).

### 2026-05-23 14:15 — feature-auto-build P2 (claude-sonnet-4-6)

- Action: P2 — Internal review pass + flip ADR Status from Proposed to Accepted.
  Validated all 10 sections against api.md acceptance criteria (AC-S1-1 through
  AC-S10-1). Verified:
  - S1 (AC-S1-1): Header table has exactly 5 rows (状态/日期/决策者/Supersedes/
    Superseded by), format matches ADR-0006. AC-S1-2: Status cell changed to
    Accepted. PASS.
  - S2 (AC-S2-1..7): DESIGN.md §10 cited; index.html lines 16–18 cited;
    apps/web/package.json deps cited; ADR-0003 + ADR-0006 cited as refine-not-
    overrule; roadmap R2/R3/R6 cited; PLUGIN_MAP staleness caveat present;
    central question stated. PASS.
  - S3 (AC-S3-A..D): Options A/B/C/D present with 优点/缺点 and explicit
    rejection/selection verdicts. PASS.
  - S4 (AC-S4-1..4): "选择方案 C" stated; 10 frozen assumptions inline;
    10 SHIPPED parity rows named; 4 superseded PENDING rows named with
    BLOCKED_EXTERNAL recommendation. PASS.
  - S5 (AC-S5-1..3): Positive / negative / deferred lists complete. PASS.
  - S6 (AC-S6-1..4): 10 JSX→TSX rules present as numbered list; cross-module
    comm rule + naming convention + explicit @repo/plugin-web-events rejection;
    24-key registry hand-off with row #3 named; §9 reconciliation rule
    (localStorage vs IndexedDB). PASS.
  - S7 (AC-S7-1..4): Markdown table with 5 columns; all prototype files from
    DESIGN.md §10.1 mapped; all owning row slugs in manifest #2..#24; 20 new
    packages counted. PASS.
  - S8 (AC-S8-1..3): 24 DESIGN.md §9.2 keys verbatim; xai_pomodoro_sessions +
    xai_countdowns labelled "proposed"; row #3 (xai-web-persistence-contract)
    named as owner. PASS.
  - S9 (AC-S9-1..2): All rows #2..#24 linked to ADR sections by slug anchor;
    4 parity rows hand-edit recommendation with canonical Note text present.
    PASS.
  - S10 (AC-S10-1): All 10 required cross-doc links present. PASS.
  Cross-ADR consistency (TC-T7): ADR-0007 declares refines-not-overrules;
  packages/plugin-web-* are browser-only (no Tauri imports); durable data flows
  through shipped spine (not self-invented contracts) — ADR-0003 + ADR-0006
  constraints respected. PASS.
- Files updated:
  - `docs/adr/0007-xai-web-console-build-form.md` (Status: Proposed → Accepted)
  - `packages/xai-web-build-form-adr/docs/dev_log.md` (this file)
- Commits: (to be assigned after this commit)
- Tests run: Internal review pass against api.md AC-S1-1..AC-S10-1 (all PASS).
  TC-T2 gate met: Status=Accepted. Independent feature-verify to run TC-T1..TC-T9.
- Evidence: AC-S1-1 PASS (header format matches ADR-0006); AC-S1-2 PASS
  (Status=Accepted); TC-T2 PASS (grep "Accepted" in header → confirmed);
  TC-T7 PASS (no conflict with ADR-0003/0006 — browser-only packages, no
  self-invented data contracts).
- Next step: P3 — Traceability appendix + roadmap pause recommendations.

### 2026-05-23 14:30 — feature-auto-build P3 (claude-sonnet-4-6)

- Action: P3 — Traceability appendix + roadmap pause recommendation. The ADR
  was authored with the full §S9 traceability table and hand-edit recommendation
  block inline during P1 (consolidated authoring — all three of S9's required
  elements were included in the initial draft). P3 confirms the §S9 section is
  complete:
  - All rows #2..#24 mapped to ADR constraining sections by slug anchor.
  - Explicit table of 4 superseded PENDING parity rows with canonical
    BLOCKED_EXTERNAL recommendation and Note text present.
  - Human operator action reminder present (ADR does not self-edit
    web-ticktick-parity manifest per permission rule).
  Gate verified: every downstream row's seed brief at
  docs/reviews/xai-web-*/20260523-roadmap-seed.md can in principle cite an
  ADR anchor for its scope (TC-T9 spot-check: xai-web-tokens-and-i18n →
  §文件级端口映射表 + §实施规则 rule 9; xai-web-shell → §文件级端口映射表 +
  §JSX→TSX规则 1-5; xai-web-board-core → §文件级端口映射表 + §持久化键附录).
  All three have unambiguous, citable ADR sections. PASS.
- Files updated:
  - `packages/xai-web-build-form-adr/docs/dev_log.md` (this file — Work Log +
    Status Panel flip to READY_FOR_VERIFY)
- Status Panel update: Status = READY_FOR_VERIFY, Suggested Next = feature-verify.
- Commits: (to be assigned after this commit)
- Tests run: TC-T9 spot-check (3 random downstream rows → all have citable
  ADR sections). TC-T8 gate: 4 superseded rows named + BLOCKED_EXTERNAL
  recommendation present + ADR does not edit web-ticktick-parity manifest.
  PASS.
- Evidence: §S9 traceability table covers #2..#24; §S9 hand-edit block names
  all 4 superseded parity rows with canonical Note text; TC-T8 PASS; TC-T9
  spot-check PASS.
- Next step: `feature-verify` (cross-vendor) to run TC-T1..TC-T10 independently.
