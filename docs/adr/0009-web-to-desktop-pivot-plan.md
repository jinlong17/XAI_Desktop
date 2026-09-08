# ADR-0009: Web → Desktop Pivot Plan — Priority Order + P1 Gating + Surface Scope Matrix

| 字段 | 值 |
|------|---|
| 状态 | Accepted |
| 日期 | 2026-05-24 |
| 决策者 | Jinlong (project owner) + Claude (priority-pivot brief author) |
| Supersedes | none (formalizes the informal 2026-05-23 Authority Override in `docs/workflow/roadmap/xai-web-console.md` L14) |
| Superseded by | none |

---

## S1 — 概述 / Header

This ADR formalizes the cross-surface priority shift that took effect informally on
**2026-05-23** (recorded as "Authority Override" in the line-14 frontmatter of
`docs/workflow/roadmap/xai-web-console.md`) and was propagated into the top-of-stack
project docs across three PRs on **2026-05-24**.

Four sub-decisions:

| Sub-decision | Selected option |
|---|---|
| **D1** — Active surface priority order | **P0 Web Console → P1 Desktop Client → P2 Organizer Plugins & Tools** |
| **D2** — P1 (Desktop) launch gating | **Web gap-closure SHIPPED + cross-vendor smoke evidence + 0 P0 drift** |
| **D3** — Surface scope authority for `SYSTEM_ARCHITECTURE.md` §3-§10 | **Per-rule applicability matrix (§S6 below); desktop = full; web = subset + replacements** |
| **D4** — Operational rules during P0 period | **No-new-work on P1/P2; in-flight: complete-or-park; SHIPPED rows remain authoritative for their domain** |

Source brief: `docs/reviews/web-priority-pivot-and-repo-cleanup/20260524-brief.md`
PR-1 (priority banners): commit `7b00285`
PR-2 (drift reconcile): commit `1e46ba6`
PR-3 (paused roadmap banners): commit `9cebb89`
Related ADRs: ADR-0003 (three-faces architecture), ADR-0006 (web-face hybrid reuse boundary), ADR-0007 (xai-web-console build form), ADR-0008 (cloudflare deploy target + CSP)

---

## S2 — 背景

### Problem

Between 2026-05-12 (initial PRD-v1 authoring) and 2026-05-23 (xai-web-console
roadmap 24/24 SHIPPED), the project's center of gravity moved from "macOS desktop
overlay" to "Web Console". The shift was driven by:

1. A high-fidelity Claude-Artifact React prototype (`web design/DESIGN.md`) that
   crystallized the product's preferred form.
2. Successful 24-row parallel ship of `xai-web-*` packages registered into
   `apps/web/` (Vite SPA), now deployed to Cloudflare Pages.
3. Recognition that the Tauri overlay (P1) and organizer plugins (P2) should
   be **layered on top of** a working Web product, not in parallel.

The 2026-05-23 Authority Override declared this shift but landed only in one
roadmap file. By 2026-05-24, four "read-most" docs (CLAUDE.md, SYSTEM_ARCHITECTURE.md,
PRD-v1.md, PLUGIN_MAP.md) and 19 paused roadmap files still carried desktop-first
narrative. Three docs-only PRs (7b00285 / 1e46ba6 / 9cebb89) propagated the override
and reconciled 6 sources of drift. **This ADR formalizes what those PRs implemented**
so the priority order, gating, and scope matrix have a stable authority anchor.

### User requirement (project owner, 2026-05-23 → 2026-05-24)

1. Treat the Web Console as the **only active surface** until its known gaps are
   closed.
2. Defer all Desktop / Tauri / overlay / sync-v1 / G0/G1 native foundation work
   until P1 starts (after P0 closure).
3. Defer organizer plugins (P2) until after P1 reaches beta.
4. Keep paused docs and code in place — do not delete; do not move; just mark.
5. Provide a single authority anchor every banner / doc / agent can cite.

### Codebase context

- `apps/web/` (Vite SPA) + `packages/{xai-web-*, plugin-web-*}/` (~28 packages,
  24 modules + platform shims) are SHIPPED and deployed.
- `apps/desktop/` (Tauri 2 shell) + `packages/plugin-{organizer, account, console,
  productivity, ai-cube, calendar, labels, project, ...}/` are intact and untouched.
- ~50 sync-v1 crypto/security packages (W0/W1/W2/W3) are SHIPPED and frozen.
- 10 G0/G1 native foundation packages are at Blocked/Testing — frozen.
- `xai-web-console.md` is the active roadmap; 19 other roadmaps are paused.

### Related ADRs

- **ADR-0003** (three-faces architecture): Overlay / Console / Web as three sibling
  surfaces. This ADR does not change the three-face model — it sets the **temporal
  priority** among the three faces.
- **ADR-0006** (web-face hybrid reuse boundary): Already narrowed ADR-0003 to allow
  Web to diverge from Console UI direct-reuse. This ADR builds on that.
- **ADR-0007** (xai-web-console build form): Decided to port `web design/` as
  TypeScript+Vite under `packages/plugin-web-*`. This ADR makes the resulting
  surface the P0 anchor.
- **ADR-0008** (cloudflare deploy + CSP): First public URL for the SHIPPED Web
  Console. This ADR makes "0 SHIPPED → deploy → gap-closure" the canonical P0
  closure path.

---

## S3 — 方案 (Options Analyzed)

### Option A — Formalize three-tier priority via ADR (chosen)

Declare a single 3-tier order with explicit gating between tiers. Every banner,
PRD, PLUGIN_MAP row, and dev_log cites this ADR by number.

Pros:
- One authority anchor; no per-doc divergence.
- Gating conditions are explicit and testable.
- Surface Scope Matrix removes the "does §5 apply to web?" ambiguity that drove
  the 2026-05-24 PR-1 edits.

Cons:
- ADR commitment makes it harder to flip priorities again — a future swap needs
  a follow-up ADR.
- Surface Scope Matrix needs to be kept in sync with `SYSTEM_ARCHITECTURE.md`.

### Option B — Keep informal per-file banners; do NOT write an ADR

Continue the 2026-05-24 PR-1+PR-2+PR-3 pattern: each file carries its own
PAUSED/SUPERSEDED banner, all pointing to a brief.

Pros:
- No new ADR overhead.
- Banner copy can drift per-file if context demands.

Cons:
- No single authority anchor for "what's the priority order".
- New roadmaps, sub-PRDs, or plugins added in P0 period would need to write
  their own banner inline with no canonical template.
- "Brief" is not an ADR — it's a planning artifact, not a decision record. New
  agents reading the project would not find an "Accepted" record of the pivot.

### Option C — Move paused content out of `docs/` and `packages/` to `archive/`

Physical archive of all P1/P2 docs + code into `docs/archive/2026-Q2-pre-web-pivot/`
and `packages/archive/`.

Pros:
- Strong physical signal that P1/P2 is dormant.

Cons:
- Cross-links from xai-web-console.md, PRD-v1.md, sub-PRDs, and 60+ dev_logs
  would all break.
- High blast radius; rollback expensive.
- Premature — P1 may resume in 4-8 weeks; physical archive optimizes for the
  wrong horizon.
- Explicitly out of scope per 2026-05-24 brief §3 PR-5 ("only after C17 closure
  AND P1 starts").

---

## S4 — 决策

**Accept Option A.** This ADR declares the priority order, the P1 gating conditions,
and the Surface Scope Matrix. The 2026-05-23 informal Authority Override is hereby
formalized.

### D1 — Active surface priority order

```
P0  Web Console            Active, gap-closure mode
P1  Desktop Client         Paused, awaiting Web P0 closure
P2  Organizer Plugins      Paused, awaiting P1 beta
```

- **P0 scope:** `apps/web/` + `packages/{xai-web-*, plugin-web-*}/` (28 packages
  + 24 modules + 6 platform shims) + their direct dependencies in `@repo/core`
  + `@repo/core-data` web-side seams + Cloudflare deploy infra (`apps/web/deploy/*`,
  `wrangler.toml`).
- **P1 scope:** `apps/desktop/` + `packages/plugin-{account, console, productivity,
  ai-cube, calendar, labels, project}/` + supporting Tauri stack
  (`packages/{sync-v1 W0/W1/W2/W3 crypto, G0/G1 native foundation}/`).
- **P2 scope:** `packages/plugin-{organizer, clipboard, widgets, meditation, pet}/`
  + organizer-adjacent tooling.

A package in P1/P2 may still be **bug-fixed in place** if a defect blocks P0
(e.g., a shared `@repo/core` event-bus seam needs widening). But no new feature
work or refactor on P1/P2 packages is permitted during P0 period.

### D2 — P1 launch gating

Desktop work (P1) may not start until **all** of the following are SHIPPED:

| # | Gate | Evidence required |
|---|---|---|
| G1 | Web Console 24/24 SHIPPED in manifest + PLUGIN_MAP + every package dev_log | `awk` scan of all three sources confirms zero rows at `READY_TO_SHIP` / `READY_FOR_VERIFY` / `In-Dev` |
| G2 | Cloudflare Pages deploy live + 24h cross-vendor smoke evidence | `xai-web-deploy-cloudflare` dev_log Ship Report references real `packages/xai-web-shell/docs/test.md` §Manual Verification entries with PASS/FAIL per browser (Chrome/Safari/Firefox/iOS), per ADR-0008 + xai-web-console.md L17 carve-out |
| G3 | Web 7 known gaps either SHIPPED or formally moved to "P0.5 deferred" with a written rationale | At least 5/7 must be SHIPPED. The 7 known gaps (per 2026-05-24 brief §4.2): (a) AI real-LLM adapter; (b) Cmd-K search; (c) Calendar Week+Day view; (d) Board Filter+Share+Map views; (e) Dashboard Add-Widget picker; (f) Settings integrations + paywall actions; (g) Pomodoro derivedCounters test fix |
| G4 | This ADR (0009) is Accepted | `docs/adr/0009-web-to-desktop-pivot-plan.md` committed and pushed |
| G5 | No drift on P0 manifest / PLUGIN_MAP / dev_log triad | Drift-scan script (or manual verify) reports zero discrepancy |

When all 5 gates pass, the project owner authors a follow-up ADR (ADR-0010 candidate
title: "P1 Desktop Client Resume Plan") explicitly flipping the priority order
to `P1 active → P2 paused → P0 maintenance-only`. ADR-0010 supersedes this ADR's D1.

### D3 — Surface scope authority for `SYSTEM_ARCHITECTURE.md` §3-§10

`SYSTEM_ARCHITECTURE.md` was authored 2026-05-14 for the desktop surface only.
Its §3-§10 constraints DO NOT all apply uniformly to web. The Surface Scope
Matrix below is the canonical adjudication:

| Rule | Desktop (P1) | Web (P0) | Notes |
|---|---|---|---|
| §3 三层边界 (Host / Plugin / Core / UI) | applies | applies (Shell / xai-web-\* / Core) | Web tri-layer per §12 of SYSTEM_ARCHITECTURE.md |
| §4 #1 — no business logic in Host | applies | applies | |
| §4 #2 — no cross-Plugin internal imports | applies | applies | |
| §4 #3 — Plugin↔Plugin via typed events | applies | applies (web:\* via xai-web-event-bus) | |
| §4 #4 — no `@tauri-apps/api` in plugin | applies | **N/A** | Web never uses Tauri |
| §4 #5 — Tauri event payload typed in `@repo/core/types` | applies | replaced by `web:*` EventMap in xai-web-event-bus | |
| §4 #6 — `manifest.json` is plugin entry | applies | applies for `plugin-web-*` only; `xai-web-shims` (event-bus, shell, persistence-contract) are not plugins → no manifest required | |
| §4 #7 — no `console.log` in production | applies | applies | |
| §4 #8 — unidirectional dep `Host → Plugin → Core/UI` | applies | applies (`apps/web` → `xai-web-*` → `core`) | |
| §4 #9 — `index.ts` is sole public surface | applies | applies | |
| §4 #10 — plugin internal layout is free | applies | applies | |
| §4 #11 — generic UI in `@repo/ui` / business UI inside plugin | applies | applies | |
| §4 #12 — no runtime dynamic loading | applies | applies | |
| §5 多窗口架构 (main/control/grid windows) | applies | **N/A** | Web is single-window browser tab |
| §6 跨窗口通信 | applies | **N/A** | |
| §7 状态持久化 (`xai-desktop-layout` localStorage key) | applies | **replaced** — web has its own 24 `xai_*` keys owned by xai-web-persistence-contract per DESIGN.md §9.2 |
| §8 DnD (`@dnd-kit/core`) | applies | **N/A** — web packages MUST NOT add `@dnd-kit/core`; web uses native HTML5 DnD per-package |
| §9 Rust 后端模块结构 | applies | **N/A** | |
| §10 新建 Plugin 标准路径 | applies | replaced by per-row "build-form ADR" pattern (see ADR-0007 §S4 port mapping) |
| §11 明确排除项 | applies (post-2026-05-24: web entry deleted) | not applicable (web is P0) |
| §12 Web Console Boundary | not applicable | **canonical for web** (added 2026-05-24 PR-1) |

For ambiguity not covered above: defer to ADR-0006 + ADR-0007 + this ADR's S5
"Consequences". Future precedent should land as either an additional row in this
matrix (via amendment commit) or a new ADR.

### D4 — Operational rules during P0 period

- **New work on P1/P2:** prohibited. Includes new feature plans, new dev_logs,
  new packages, new ADRs scoped to desktop/sync/organizer.
- **In-flight items on P1/P2:** complete-or-park at the package owner's discretion.
  Parked items must update their dev_log Workflow State to `PARKED_PRE_WEB_PIVOT`
  with a 1-line reason. Completed items follow normal Workflow V2 ship path; the
  ship commit must cite this ADR.
- **Bug-fix on P1/P2 SHIPPED rows blocking P0:** permitted under `bug-fix` workflow,
  same vendor preference rules apply. Ship commit cites this ADR's "blocks P0"
  carve-out.
- **Cross-cut changes (e.g., `@repo/core`):** if a change touches both P0 web
  and any P1/P2 surface, the P0 motivation must dominate the commit message Why
  block. P1/P2 side effects are documented but not the driver.
- **PLUGIN_MAP discipline:** P0 rows must stay at `Stable` once SHIPPED. P1/P2
  rows stay at their existing state (no forced flip to Deferred — the section
  banner in PLUGIN_MAP suffices).
- **Roadmap discipline:** the 19 paused roadmaps (5 sync-v1 + 10 xai-v1 + 3
  xai-g0/g1/g2 + 1 web-ticktick-parity SUPERSEDED-IN-PART) retain their PAUSED
  banner until the P1 launch ADR (ADR-0010 candidate) flips them.
- **xai-web-console.md discipline:** active. New rows for P0 gap-closure go into
  a separate manifest (`xai-web-console-gap-closure.md`, see §S5) to keep the
  original 24-row record stable as a SHIPPED baseline.

---

## S5 — 后果 (Consequences)

### Positive

- **Single authority anchor.** Any banner, PRD, PLUGIN_MAP row, dev_log, or
  agent prompt can cite `ADR-0009` instead of a brief or roadmap header line.
- **Testable P1 gates.** D2's 5 gates are evidence-driven; the P1 launch
  decision becomes mechanical rather than judgment-based.
- **Resolves §3-§10 ambiguity.** Surface Scope Matrix removes the recurring
  question "does this desktop rule apply to my web package".
- **Cleanup contained.** The 2026-05-24 docs-only PRs (7b00285, 1e46ba6,
  9cebb89) are now anchored to an Accepted decision; no further reorganization
  is implied.

### Negative

- **Friction to revert.** A future pivot back toward desktop (or to a new
  surface) requires a new ADR, not just a brief or roadmap header edit.
- **Surface Scope Matrix maintenance.** Whenever SYSTEM_ARCHITECTURE.md §3-§10
  changes, the matrix in D3 must be updated in the same commit. Lint rule TBD.
- **Risk of orphaned P1/P2 in-flight work.** If a developer parks rather than
  completes, the parked state must be picked up later. Mitigation: D4 mandates
  a 1-line reason in the parked dev_log.

### Neutral

- **Web-ticktick-parity roadmap retains its name** even though half its UI rows
  are SUPERSEDED. Renaming would break too many cross-links; the
  SUPERSEDED-IN-PART banner is enough.
- **`web design/` source-of-truth retained.** Per ADR-0007, the Claude-Artifact
  prototype remains the design basis. This ADR does not change that.

---

## S6 — Implementation notes (already landed)

This ADR's decisions were implemented in three preceding commits (each can be
reverted independently if needed):

| Commit | Scope | What landed |
|---|---|---|
| `7b00285` PR-1 | 7 files + 1 new brief | Priority banners on CLAUDE.md / SYSTEM_ARCHITECTURE.md (added §12 Web Console Boundary + deleted §11 "do not clean apps/web") / PRD-v1.md / 3 sub-PRDs / PLUGIN_MAP.md. Brief at `docs/reviews/web-priority-pivot-and-repo-cleanup/20260524-brief.md`. |
| `1e46ba6` PR-2 | 3 files | xai-web-console manifest 9 rows + PLUGIN_MAP 7 rows flipped to SHIPPED/Stable with commit-hash evidence; plugin-web-settings-rest dev_log Workflow State block reconciled. |
| `9cebb89` PR-3 | 19 files | PAUSED / SUPERSEDED-IN-PART banner on every paused/superseded roadmap file. |

**Follow-up work (not landed by this ADR):**

- **C17 Web gap-closure manifest.** Per D2-G3, the 7 known gaps need a roadmap.
  Recommended path: run `xai-feature-brief` × 7 (one per gap) then
  `xai-roadmap-loop init` to produce
  `docs/workflow/roadmap/xai-web-console-gap-closure.md`. Manifest review then
  feeds `xai-roadmap-loop run` for wave dispatch.
- **ADR-0010 (P1 Desktop Client Resume Plan).** Authored when D2 gates pass.
  Will supersede this ADR's D1 and unblock `apps/desktop/` work.
- **Surface Scope Matrix lint rule.** When `SYSTEM_ARCHITECTURE.md` §3-§10 is
  amended, fail CI unless this ADR's D3 matrix is updated in the same commit.
  Implementation TBD — could be a `pnpm check-arch-matrix` script or a CI grep
  guard.

---

## S7 — Acceptance / Review

- **Proposed by:** Claude (Opus 4.7 1M) as part of the 2026-05-24
  priority-pivot brief → PR-1+PR-2+PR-3 sequence.
- **Reviewed by:** Jinlong (project owner) via interactive sign-off on PR-1
  ("1b"), PR-2 ("a"), PR-3 ("a"), and the post-PR-3 "a→d→b→c" execution
  authorization.
- **Status:** Accepted on 2026-05-24, same day as the PRs that implement it.
- **Effective:** immediately. All P0/P1/P2 boundaries described in D1/D2/D3/D4
  are in force as of this commit.
