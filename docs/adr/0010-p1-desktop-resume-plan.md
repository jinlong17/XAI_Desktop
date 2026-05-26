# ADR-0010 — P1 Desktop Client Resume Plan

## S1 — Header

| Field | Value |
|---|---|
| ADR # | 0010 |
| Title | P1 Desktop Client Resume Plan |
| Status | **DRAFT** — pending G2 (cross-vendor manual smoke) evidence from operator before Accepted |
| Date | 2026-05-26 |
| Author | Claude Opus 4.7 (1M context) — drafted at operator request after 9/9 gap-closure SHIPPED |
| Supersedes | ADR-0009 §D1 (priority order) once Accepted |
| Builds on | ADR-0009 §D2 (P1 launch gating), ADR-0007 (web build form), ADR-0008 §S3 (CSP) |
| Related | xai-g0-window-spike.md / xai-g1-native-foundation.md / xai-g2-data-security-foundation.md (PAUSED desktop roadmaps to be unfrozen by this ADR) |

---

## S2 — Background

ADR-0009 (2026-05-24) established a 5-gate `D2 — P1 launch gating` schedule for resuming Desktop (P1) work after Web (P0) gap-closure.

As of 2026-05-26, ADR-0009 §D2 gates evaluate:

| Gate | Status | Evidence |
|---|---|---|
| **G1** — Web Console 24/24 SHIPPED in manifest + PLUGIN_MAP + every package dev_log | ✅ **PASS** | `docs/workflow/roadmap/xai-web-console.md` 24/24 + `docs/workflow/roadmap/xai-web-console-gap-closure.md` 9/9 + PLUGIN_MAP rows all Stable + every package's dev_log `Status: SHIPPED` |
| **G2** — Cloudflare Pages deploy live + 24h cross-vendor smoke evidence | ⏳ **PENDING** | `xai-web-deploy-cloudflare` deployed (SHIPPED 2026-05-24); cross-vendor manual smoke matrix per-row PENDING — see `docs/reviews/_gap-closure-deferred/20260526-operator-action-items.md` Category 3 |
| **G3** — Web 7 known gaps SHIPPED or deferred with rationale | ✅ **PASS** | All 9 gap-closure rows SHIPPED (covers the 7 gaps + 2 sub-rows). Codex cold-read 4 PASS + 4 FINDINGS-RESOLVED |
| **G4** — ADR-0009 Accepted | ✅ **PASS** | `docs/adr/0009-web-to-desktop-pivot-plan.md` committed + pushed |
| **G5** — No drift on P0 manifest / PLUGIN_MAP / dev_log triad | ✅ **PASS** | All 3 sources reconciled per 2026-05-26 final-reconcile commit `1c021a1` |

**Net: 4 of 5 gates PASS. G2 is the sole blocker.** This ADR documents the resume plan so operator can flip Status=Accepted the moment G2 evidence is collected, without re-deliberating scope.

---

## S3 — Options Analyzed

### Option A — Flip priority NOW with G2-evidence-pending carve-out (CHOSEN, Status=DRAFT)

Draft this ADR with full priority-flip language, but Status=DRAFT until operator runs the smoke matrix per Category 3 and pastes evidence into the G2 row above. Once G2=PASS, operator flips Status=Accepted + makes a tiny "g2-evidence" commit citing this ADR.

**Pros:** Zero context-lost between gap-closure SHIPPED and P1 startup; P1 roadmap framework ready. Operator can do G2 anytime in the next 7 days without re-litigating any P1 decision.
**Cons:** ADR is officially DRAFT — anyone reading it before G2-evidence-paste may interpret it as approved.

### Option B — Wait until G2 fully passes before drafting

Don't write ADR-0010 yet. Operator runs G2 smoke first, then drafts ADR-0010 from scratch.

**Pros:** Strictly correct per ADR-0009 §D2 wording.
**Cons:** All scope decisions deferred to future-session context-lost; gap-closure momentum lost; high risk that future operator/AI mis-recalls the gating decision.

### Option C — Partial flip (planning OK, implementation gated on G2)

Flip ADR Status=Partial-Accepted: allow P1 planning work (new ADRs, new roadmap drafts) but block P1 implementation commits until G2.

**Pros:** Concrete progress while G2 pending.
**Cons:** "Partial" is not in the ADR Status enum; adds complexity; no real value over Option A's DRAFT-with-explicit-G2-row.

**Decision: A.** Establishes framework + operator path; clean Status enum (DRAFT/Accepted only).

---

## S4 — Decisions

### D1 — New priority order (active once this ADR Status=Accepted)

| Tier | Surface | Status under this ADR |
|---|---|---|
| **P1** | macOS Desktop client (Tauri overlay shell) | **Active** — primary focus, new dev work permitted |
| **P0** | Web Console (apps/web + xai-web-* + plugin-web-*) | **Maintenance-only** — bugfix permitted; new features need explicit P0 carve-out commit citing this ADR |
| **P2** | Desktop organizer plugins & tools (plugin-organizer, plugin-clipboard, etc.) | **Paused** — resumes when P1 enters beta |

This **supersedes ADR-0009 §D1** (the prior `P0 active → P1 paused → P2 paused` order).

### D2 — P1 roadmap re-activation

The following 19 paused roadmaps are evaluated for P1 reactivation:

| Roadmap | Action under this ADR | Rationale |
|---|---|---|
| `xai-g0-window-spike.md` (6 anchors) | **Unfreeze** — primary P1 entry | macOS window spike + click-through + Finder DnD + Spaces/multi-monitor + MAS sandbox. All G0.1-G0.6 anchors must reach SHIPPED with real macOS evidence before G1 starts. |
| `xai-g1-native-foundation.md` (~10 anchors) | **Unfreeze**, gated on G0 SHIPPED | Window command contract, multi-grid event scope, native DnD path-first, Tauri capability allowlist, host business residuals. |
| `xai-g2-data-security-foundation.md` (sync-v1 W0-W3) | **Stay PAUSED until G1 SHIPPED** | sync-v1 crypto stack (~50 packages) is wave 2; activate after G1. |
| `xai-v1.md` + `xai-v1.{tasks, deferred-gates, incidents, autorun, parallel-wave-plan, track-{b,c,d,e,f}-log}.md` (10 files) | **Unfreeze with re-review** | The xai-v1 manifest predates web-pivot. Owner must re-verify each track is still in scope before resuming. |
| `sync-v1.{md, tasks, deferred-gates, incidents, autorun}.md` (5 files) | **Stay PAUSED** — re-evaluate during G2 startup | Sync-v1 work is post-G1 per current sequencing. |
| `web-ticktick-parity.md` | **Stay SUPERSEDED-IN-PART** | Per ADR-0007: 4 rows superseded by xai-web-console; rest deferred. P0 maintenance only. |

### D3 — Re-emphasize SYSTEM_ARCHITECTURE.md §3-§10 as P1-active rules

ADR-0009 §D3 Surface Scope Matrix marked many SYSTEM_ARCHITECTURE.md rules as "applies" to desktop but "N/A" to web. Under this ADR, those desktop-targeted rules return to active enforcement for new P1 work:

- §3 三层边界 (Host/Plugin/Core/UI) — **ENFORCED for P1**
- §4 编码红线 #1-#12 — **ALL APPLY to P1** (including #4 `@tauri-apps/api`, #5 typed Tauri payload, #6 manifest.json)
- §5 多窗口架构 — **ACTIVE** (main / control / grid windows)
- §6 跨窗口通信 (Tauri events + @repo/core/events) — **ACTIVE**
- §7 状态持久化 (`xai-desktop-layout` localStorage key) — **ACTIVE** for desktop; web continues with its own 24 `xai_*` keys
- §8 DnD `@dnd-kit/core` — **ACTIVE for P1**; web packages still MUST NOT add this dep
- §9 Rust 后端模块结构 — **ACTIVE**
- §10 新建 Plugin 标准路径 — **ACTIVE**
- §11 明确排除项 — **ACTIVE** (web entry stays deleted per ADR-0009 D3)
- §12 Web Console Boundary — **STAYS canonical for web**

Per ADR-0009 §D3 matrix: any future ambiguity that affects both surfaces lands as a new matrix row or new ADR.

### D4 — Operational rules during P1 period

- **New work on P1:** **permitted** — new feature plans, new dev_logs, new packages, new ADRs scoped to desktop/sync/organizer.
- **New work on P0 web:** **maintenance-only** — bug-fix workflow permitted; new feature plans require an explicit P0 carve-out commit citing this ADR's D1.
- **In-flight items on P0/P1 from gap-closure period:** complete normally; ship commits no longer need to cite ADR-0009 P0 carve-out.
- **Bug-fix on P0 web SHIPPED rows:** permitted under bug-fix workflow without ADR citation (P0 is now maintenance-only, bug-fix is expected).
- **Cross-cut changes (e.g., `@repo/core`):** P1 motivation may dominate the commit Why block; P0 side-effects documented but not the driver.
- **PLUGIN_MAP discipline:** Update the "Current Priority" table at top of PLUGIN_MAP.md (added 2026-05-24 PR-2) to reflect new D1 order. The 19 paused roadmap banners are updated per D2 per-roadmap action.
- **Roadmap discipline:**
  - `xai-web-console.md` + `xai-web-console-gap-closure.md`: keep as SHIPPED archive; no new rows go here.
  - `xai-g0-window-spike.md` + `xai-g1-native-foundation.md` + `xai-v1.*`: unfreeze (drop PAUSED banner) and refresh the dev_log Status Panels of in-flight packages.

### D5 — G2 evidence acceptance protocol

To flip this ADR Status from DRAFT to Accepted, the operator must:

1. Run the per-row smoke matrix in `docs/reviews/_gap-closure-deferred/20260526-operator-action-items.md` Category 3 across Chrome 120+ / Safari 17+ / Firefox 121+ / iOS Safari 17+ on macOS 14 + iOS 17.
2. For each row in the 9-row gap-closure manifest, paste PASS/FAIL per scenario into the existing or newly-created `docs/reviews/<slug>/20260526-cross-vendor-smoke.md` file.
3. Update ADR-0009 §D2 G2 row from PENDING to PASS with a one-line evidence link.
4. Flip THIS ADR-0010 Status field from DRAFT to Accepted + add an "Acceptance Note" at the bottom citing the smoke evidence commits.
5. Commit the flip with: `docs(adr): ADR-0010 — Status flip DRAFT → Accepted (G2 evidence landed)`.
6. The flip commit triggers automatic D1 priority order activation: subsequent commits may treat P1 as the active surface.

**Fallback:** If operator does not complete G2 within 14 days (by 2026-06-09), the project owner reviews whether to (a) extend deadline, (b) downgrade rigor (e.g., Chrome+Safari only, deferring Firefox/iOS), or (c) abandon this ADR and re-author when G2 attention is available.

---

## S5 — Consequences

### Positive

- Zero context-loss between gap-closure SHIPPED and P1 startup.
- Operator has a single-commit path to Accept (flip Status field after smoke).
- All P1 roadmap re-activation decisions made in one place, future-Claude can read this and execute G0/G1/G2 dispatches.
- The Surface Scope Matrix in ADR-0009 §D3 becomes "re-symmetric" — desktop rules active again.

### Negative

- Status=DRAFT ADRs are conventionally avoided (most ADRs go Draft→Accepted in one commit). This one's DRAFT period is operator-paced.
- Risk that future AI/operator reads D1 priority flip and assumes it's active before G2 evidence lands; mitigated by Status field at top + explicit G2 row in S2 Background.
- If G2 reveals a real cross-vendor bug, P1 may not start as fast as expected. This is by design (G2 is meaningful, not formality).

### Neutral

- The 19 paused roadmaps stay paused until per-roadmap operator action under D2. No big-bang re-activation.
- `apps/desktop/` package set is untouched by this ADR; resumes naturally when P1 work starts.

---

## S6 — Implementation notes (already landed before this ADR)

- 2026-05-24 ADR-0009 created (Web P0 priority override).
- 2026-05-24 to 2026-05-26: `xai-web-console-gap-closure` manifest written + 9/9 SHIPPED.
- 2026-05-26 Codex cross-vendor cold-read: 4 PASS + 4 FINDINGS-RESOLVED.
- 2026-05-26 Codex finding fixes landed in commits `8798e42` / `040216c` / `22fb91f` / `2cc5d6f` / `062c9f8` + ` 6a31cb8`.

## S7 — Acceptance / Review

This ADR will be Accepted by the operator after G2 evidence is collected per §S4 D5. Until then, Status=DRAFT and D1 priority flip is NOT in effect.

**Cross-vendor review:** N/A while DRAFT. Once Status=Accepted, Codex cold-read this ADR's D1-D5 decisions per ADR-0008 §S3 D3 binding-precedent pattern.

---

## Acceptance Note

*(To be filled by operator on Status flip.)*
