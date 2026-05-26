# Roadmap Manifest — xai-web-console-gap-closure

- Roadmap Source: `docs/reviews/web-priority-pivot-and-repo-cleanup/20260524-gap-closure-source.md` (9 rows decomposed from user-audited 7 known gaps; Gap 6 pre-split into 6a/6b/6c per init AskUserQuestion 2026-05-24)
- Source Code Reference: `apps/web/` + `packages/{xai-web-*, plugin-web-*}/` (24/24 SHIPPED baseline from `xai-web-console.md`) + `packages/xai-web-deploy-cloudflare/` (SHIPPED) + `packages/web-auth-device-session/` (SHIPPED platform spine)
- Init Path: `decompose` (source doc already proposed 7 partitions; init validated + pre-split Gap 6 per ambiguity AskUserQuestion)
- Generated: 2026-05-24
- Default Automation Mode: A-Claude (inherited from `xai-web-console.md` per 2026-05-23 user override)
- Default Dependency Semantics: `shipped`
- Default Verify Cross-vendor: `yes` (inherited; Codex `gpt-5.5-thinking medium` primary, Cursor fallback)
- Cross-vendor Verifier Order: primary Codex `gpt-5.5-thinking effort=medium`; fallback Cursor (when Codex quota exhausted). Per-row cross-vendor verify gate mandatory unless row note explicitly defers per ADR-0009.
- Wave Concurrency Cap: 3 (default)
- BG Direct Verified: unreliable-for-feature-loops (2026-05-24 smoke test session f1cecd32 PASSED — `claude --bg` launches successfully from inside Claude Code parent session; HOWEVER 3 real wave-1 dispatches at the same date all died/stalled within 5 min during nested subagent execution: roadmap-w1-ai-chat session 287a81aa died after spawning feature-plan + WebSearch; roadmap-w1-cmdk session 5ca506f5 died after spawning feature-plan + WebFetch; roadmap-w1-calendar session a3f50f04 stalled at "waiting" before EnterWorktree completed. **Conclusion: bg-direct OK for shallow tasks; UNSAFE for `/xai-feature-full-loop` nested chains. Use serial or emit dispatch for feature loops on this machine until root cause identified.**)
- Manifest Review: REQUIRED (init stops here; review boundaries + dependency graph before run)
- Authority Override: this manifest **does NOT supersede** `xai-web-console.md` or ADR-0009; it adds 9 new rows on top of the SHIPPED 24-row baseline.
- Authority Anchor: ADR-0009 §D2-G3 (P1 launch gate requires ≥5/9 SHIPPED here; ADR uses 5/7 since it was written before this manifest's Gap 6 split; the 5/9 mapping treats 6a/6b/6c as a single "Gap 6" for gate-counting purposes).
- Interop with xai-web-console.md: all 24 rows there are SHIPPED and treated as deps. No row in this manifest re-implements anything from there.
- Interop with web-ticktick-parity.md: platform spine rows (web-auth-device-session, web-security-csp-sentry, web-encrypted-indexeddb-cache) are REUSED as deps. PAUSED UI rows on that roadmap are not affected.

## Features

| # | Slug | Source | Depends On | Dep Semantics | Status | Automation Mode | Verify Cross-vendor | Last Run | Note |
|---|------|--------|------------|---------------|--------|-----------------|---------------------|----------|------|
| 1 | xai-web-pomodoro-counters-test-fix | docs/reviews/xai-web-pomodoro-counters-test-fix/20260524-roadmap-seed.md | — | — | SHIPPED | (default) | (default) | 2026-05-24 | W0 · test-only fix · plugin-web-pomodoro · pipeline validator · SHIPPED 2026-05-24 (commits 1a9ba10/235eca1/3035a85/6efb275 pushed to origin/main); 122/122 plugin + 100/100 web tests pass. Pipeline-validator confirmed end-to-end (bug-diagnose → bug-fix → bug-verify → roadmap-loop reconcile → ship). |
| 2 | xai-web-ai-chat-real-llm-adapter | docs/reviews/xai-web-ai-chat-real-llm-adapter/20260524-roadmap-seed.md | xai-web-pomodoro-counters-test-fix | ready_to_ship | SHIPPED | (default) | (default) | 2026-05-25 | W1 · SHIPPED 2026-05-25 (commits 86403e8/6b910eb/9209aa4/d26b63e/2c13ed4/477cfb2/8b9dc2f/ade513b pushed to origin/main). 146+93+101+88 tests pass; ADR-0008 §S3 D3 amended as wave 1+2+3 CSP binding precedent. 5 deferred residual risks (R1 manual smoke / R2 cross-vendor cold-read / R3 web-auth-device-session PLUGIN_MAP row / R4 Vite dev no _headers / R5 OpenAI base URL not in CSP) documented in verify-report + Ship Report. |
| 3 | xai-web-cmdk-search | docs/reviews/xai-web-cmdk-search/20260524-roadmap-seed.md | xai-web-pomodoro-counters-test-fix | ready_to_ship | SHIPPED | (default) | (default) | 2026-05-25 | W1 · SHIPPED 2026-05-25 (commits 74ce9bb/59d7989/1b3efda/6575054/f8ef2e1/8caad35/3b9c200/99acf36/612074b pushed to origin/main). 137+85+106 tests pass; PB1 p95=0.001ms (50ms budget); escapeHtml 12-case + rendered-DOM XSS guards; 11 pure-fn adapters; Codex cold-read XSS audit + cross-vendor manual smoke deferred 24h per ADR-0008 carve-out (documented in verify-checklist + cross-vendor-smoke reviews). |
| 4 | xai-web-calendar-week-day-views | docs/reviews/xai-web-calendar-week-day-views/20260524-roadmap-seed.md | xai-web-pomodoro-counters-test-fix | ready_to_ship | SHIPPED | (default) | (default) | 2026-05-25 | W1 · SHIPPED 2026-05-25 (commits b5a7033/bd90327/2de234a/bfe66ea/73490bf/cdb80a8/22144e0 pushed to origin/main). 197+88+106 tests pass; PB-EXT-1 perf OK; HC1-HC11 + 5 acceptance signals all met; Week 7×24 + Day 1×24 + pill-segmented toggle + xai_calendar_view persistence + activeDate SoT refactor + ComingSoonPanel deleted; 4 deferred residuals (XVENDOR-EXT 24h / Codex 5 cold-read 24h / MAY_2026_ANCHOR carryover / jsdom scrollTop presence-only). |
| 5 | xai-web-dashboard-add-widget-picker | docs/reviews/xai-web-dashboard-add-widget-picker/20260524-roadmap-seed.md | xai-web-pomodoro-counters-test-fix | ready_to_ship | SHIPPED | (default) | (default) | 2026-05-25 | W1 LAST · SHIPPED 2026-05-25 (commits 4379897/be9b652/57d93ad/903717b/bf37d13 pushed to origin/main). 151+93+106 tests pass; HC1-HC10 + REC-1 emit-before-close + REC-2 backdrop-click mirror; native `<dialog>` picker; duplicate prevention. **WAVE 1 COMPLETE — 5/5 SHIPPED.** Cross-vendor smoke deferred 24h per ADR-0008 carve-out (must complete before xai-web-deploy-cloudflare reaches READY_TO_SHIP). |
| 6 | xai-web-board-filter-share-map | docs/reviews/xai-web-board-filter-share-map/20260524-roadmap-seed.md | xai-web-ai-chat-real-llm-adapter | ready_to_ship | READY_TO_SHIP | (default) | (default) | 2026-05-25 | W2 first · xai-web-board-{core,views,workspaces} extension · serial complete 2026-05-25 (feature-plan → review APPROVED 2 recs → auto-build P1-P7 389ee17/cfff4c5/ba0a2f0/f60502b/7c28d4c/e086c7c/abc138e → verify-1 BLOCKED on 5 nits → feature-build patch 11360d9/fb5bb98/f9750ef → verify-2 PASS); 516/516 tests pass (108+126+173+109); Leaflet 149.90 KB lazy-chunk verified via real Vite manifest; OSM tile CSP allowlist via ADR-0008 §S3 D3 SECOND amendment; FilterPopover + ShareModal + MapView w/ pins + empty-state; cross-vendor smoke deferred 24h per ADR-0008 carve-out. Awaiting human ship. |
| 7 | xai-web-settings-integrations-3rd-party | docs/reviews/xai-web-settings-integrations-3rd-party/20260524-roadmap-seed.md | xai-web-ai-chat-real-llm-adapter | ready_to_ship | PENDING | (default) | (default) | — | W2 · plugin-web-settings-rest Integrations pane extension · 3 OAuth providers (Notion/GCal/Linear) PKCE stub · CSP+OAuth callback pattern setter for sibling rows · stub-mode only (no real token exchange) |
| 8 | xai-web-settings-premium-stripe | docs/reviews/xai-web-settings-premium-stripe/20260524-roadmap-seed.md | xai-web-ai-chat-real-llm-adapter, xai-web-settings-integrations-3rd-party | ready_to_ship | PENDING | (default) | (default) | — | W2 · plugin-web-settings-rest Premium pane extension · Stripe Payment Link stub (no SK in client, no webhook backend) · gold-badge UI · disclosure banner mandatory · depends on Gap 2 CSP + Gap 7 OAuth pattern |
| 9 | xai-web-settings-account-delete-wire | docs/reviews/xai-web-settings-account-delete-wire/20260524-roadmap-seed.md | — | — | PENDING | (default) | (default) | — | W2 · plugin-web-settings-rest Account-delete wire to web-auth-device-session (SHIPPED) · 2-step modal + type-DELETE gate · mock-auth path + real-auth path · smallest of 6a/6b/6c sub-rows · NO dep on Gap 2/7 (pure account-flow wiring) |

## Decomposition Rationale

### R1. Source and init path

`Init Path: decompose`. The source doc (`20260524-gap-closure-source.md`) is a brief that already proposed 7 candidate features with slugs, scopes, dependencies, estimates, and risks. The init pass therefore did not need to invent partitions from a raw PRD — but it DID need to validate the proposed partitions against project structural truth (PLUGIN_MAP entries for affected packages, existing `xai_*` storage key registry, existing `web:*` event channel families) AND adjudicate one genuine ambiguity flagged in the source doc.

### R2. Why this manifest, not amendments to xai-web-console.md

The xai-web-console.md row set (24 rows) is SHIPPED and serves as a stable baseline for ADR-0009 D1-G1 (Web 24/24 SHIPPED gate). Re-opening that manifest to add 7-9 new rows would:

1. Make "24/24 SHIPPED" obsolete as a verifiable assertion (next gate-check would have to scan for "all rows SHIPPED" instead of "24/24").
2. Mix the original parallel-build ship batches with single-feature gap-closure work, blurring per-wave attribution.
3. Risk regression of the careful PR-2 drift reconciliation work (commit 1e46ba6).

Separate manifest avoids all three. Cross-references handled by the `Authority Anchor` + `Interop with xai-web-console.md` header lines.

### R3. AskUserQuestion ambiguity resolution

**Q (2026-05-24 init):** Gap 6 (Settings Integrations + Paywall) granularity — pre-split into 3 sub-rows (Integrations / Premium / Account-delete) vs single row?

**A:** **拆成 3 sub-rows.** Resulting rows: #7 xai-web-settings-integrations-3rd-party (Notion/GCal/Linear OAuth stub) + #8 xai-web-settings-premium-stripe (Stripe Payment Link stub) + #9 xai-web-settings-account-delete-wire (account-delete wire to web-auth-device-session). All three live in `plugin-web-settings-rest` (SHIPPED #24) and extend disjoint UI surfaces — concurrent-edit conflict risk is low because the three panes are file-disjoint.

**Rationale for pre-split:** Source doc estimated Gap 6 at 3-4 days, the largest of the 7 gaps. Pre-splitting reduces ship-blast-radius (one Stripe checkout flow failing won't block Account-delete shipping), enables partial ship of higher-priority sub-rows (Account-delete is arguably most important — wires to real backend), and aligns with the project's preference for 1-row-1-purpose ship cycles (per ADR-0007 §S4 build-form pattern).

### R4. Dependency graph

Six edges in this manifest:

```
#1 (pomodoro test fix, W0)
  ▼ (ready_to_ship — proves pipeline before W1 dispatch)
#2 (AI LLM adapter)  #3 (Cmd-K)  #4 (Calendar W&D)  #5 (Dashboard Add-Widget)   — W1, 4 parallel
                                  ▼ (#2 ready_to_ship — CSP+secrets pattern setter)
                                  #6 (Board Filter+Share+Map)   — W2
                                  #7 (Settings Integrations OAuth stub)    — W2 (CSP pattern)
                                  ▼ (#2 + #7 ready_to_ship — CSP + OAuth pattern setters)
                                  #8 (Settings Premium Stripe)   — W2
                                  #9 (Settings Account-delete)   — W2 (no dep on #2/#7; pure account-flow wire)
```

**Edge rationale:**

- `#1 → #2..#5`: `ready_to_ship` (not `shipped`). #1 proves the gap-closure roadmap pipeline works end-to-end (smallest scope, test-only); W1 can start planning once #1 is READY but doesn't need #1 to be physically merged. The point of #1-first is operational confidence in the pipeline, not data dependency.
- `#2 → #6/#7`: `ready_to_ship`. #2 (LLM adapter) is the first row to widen `connect-src` CSP for an external HTTPS API and establish the IndexedDB+WebCrypto secret-storage pattern. #6 (Map tiles) and #7 (OAuth) both need CSP widening; building after #2's pattern is locked saves rework. `ready_to_ship` lets them start planning once #2 reaches READY.
- `#2 + #7 → #8`: `ready_to_ship`. #8 (Stripe) layers on both #2 (CSP for js.stripe.com + api.stripe.com) and #7 (OAuth-style redirect-callback pattern, though Stripe is not OAuth). Easier to land once both patterns exist.
- `#9` has **no deps** on this manifest's rows (it wires to web-auth-device-session SHIPPED in xai-web-console.md / web-ticktick-parity platform spine). Could ship anytime in W2. Listed last for cosmetic ordering only.

### R5. AutomationMode / Verify Cross-vendor defaults

Per source doc §1 Authority Override (which inherits from xai-web-console.md):
- Default Automation Mode: `A-Claude` (user-locked 2026-05-23; no per-row picker fired during init)
- Default Verify Cross-vendor: `yes` (strict; cross-vendor cold-read mandatory per ADR-0009 §D2-G2)
- All 9 row cells show `(default)`. The user may hand-edit individual rows post-init.

### R6. Frozen assumptions + open uncertainties

**Frozen (from source doc + ADR-0009):**

1. P1 launch gate counts 6a/6b/6c as a SINGLE "Gap 6" for the 5/7 threshold (ADR-0009 §D2-G3 wording predates the split). To unblock P1, at least 5 of the 7 original-gap categories must SHIP (Gap 6 satisfied if ANY of 6a/6b/6c ships).
2. Web-only scope. No desktop / Tauri / native code in this roadmap.
3. xai-web-console.md 24/24 SHIPPED baseline is immutable for this roadmap's duration.

**Frozen guesses (recorded for hand-edit if wrong):**

1. Map view library: Leaflet (~150KB) preferred over OpenLayers (~250KB); confirm in #6 feature-plan.
2. Settings integration providers (3 only): Notion + Google Calendar + Linear; chosen to span representative OAuth flavors (personal-account / Google OAuth / org-account-Linear). Hand-edit #7 seed brief if you want to swap.
3. Stripe Checkout shape: Payment Link redirect (simpler) over embedded; confirm in #8 feature-plan.
4. AI LLM adapter default: Anthropic Claude Messages API; OpenAI-compatible as secondary. User-configurable in Settings → AI.

**Open uncertainties (for feature-plan to surface):**

1. CSP `connect-src` widening: amend ADR-0008 §D3 in-place OR write new ADR? Decide in #2 feature-plan.
2. xai-web-shell topbar modification (#3): coexists with deploy banner from xai-web-deploy-cloudflare? Confirm in #3 feature-plan.
3. Card schema extension for `location` field (#6): backwards compat across boards already in `xai_boards_v2`? Confirm in #6 feature-plan.

### R7. Wave plan

```
W0 — 1 row    │ #1 pomodoro-counters-test-fix (pipeline validator)
              ▼ (ready_to_ship)
W1 — 4 rows   │ #2 ai-chat-real-llm-adapter
              │ #3 cmdk-search
              │ #4 calendar-week-day-views
              │ #5 dashboard-add-widget-picker
              ▼ (#2 ready_to_ship — CSP + secret-storage pattern setter)
W2 — 4 rows   │ #6 board-filter-share-map         (depends on #2)
              │ #7 settings-integrations-3rd-party (depends on #2)
              │ #8 settings-premium-stripe         (depends on #2 + #7)
              │ #9 settings-account-delete-wire    (no dep, ships anytime in W2)
```

3 dependency layers ⇒ approximately 3 batch-ship windows. With Wave Concurrency Cap=3 and `dispatch: bg`, W1 runs in 2 sub-windows (3+1) and W2 runs in 2 sub-windows (3+1).

---

## Handoff

### Status

- Workflow: `roadmap-loop init (decompose path)` complete; manifest written; **awaiting human review gate**.
- Manifest: `docs/workflow/roadmap/xai-web-console-gap-closure.md`
- Seed Briefs: 9 files under `docs/reviews/xai-web-{pomodoro-counters-test-fix, ai-chat-real-llm-adapter, cmdk-search, calendar-week-day-views, dashboard-add-widget-picker, board-filter-share-map, settings-integrations-3rd-party, settings-premium-stripe, settings-account-delete-wire}/20260524-roadmap-seed.md`
- Init does NOT auto-continue into run — per skill hard constraint #8.

### Blockers

None during init. Two material caveats for human reviewer:

1. **ADR-0009 §D2-G3 gate-counting:** the gate threshold (5/7) was written when source doc had 7 gaps. After 6a/6b/6c split, manifest has 9 rows. R6 §1 above proposes: count 6a/6b/6c as a SINGLE "Gap 6" — so 5/7 still maps to "5 of the 7 original-gap categories ship; Gap 6 satisfied if ANY of 6a/6b/6c ships." If you prefer 5/9 (stricter) or 7/9 (most strict), edit this manifest's header `Authority Anchor` line + ADR-0009 §D2-G3 in the same commit.

2. **CSP widening governance:** rows #2, #6, #7, #8 all widen `connect-src` / `frame-src` / `img-src`. Pre-decide: amend ADR-0008 §D3 in-place (single follow-up commit per amendment) OR write 4 small ADRs (0010 / 0011 / 0012 / 0013). Recommend amendment-in-place for first 2-3, then re-evaluate.

### Summary

9-row gap-closure manifest for the Web Console, decomposed (via validation + 1 pre-split) from the 2026-05-24 user-audited 7 known gaps. 1 W0 pipeline-validator (test-only fix) + 4 W1 parallel high-priority + 4 W2 dependent. Reuses 24 SHIPPED `xai-web-console.md` rows + `xai-web-deploy-cloudflare` + `web-auth-device-session` platform spine as deps. Cross-references ADR-0009 §D2-G3 for P1 launch gate counting.

### Next Step

Two-step gate before `mode: run` can fire:

**Step 1 — human review (REQUIRED):**

1. Read `docs/workflow/roadmap/xai-web-console-gap-closure.md` (this file).
2. Read each of the 9 `docs/reviews/<slug>/20260524-roadmap-seed.md`.
3. Confirm feature boundaries + dependency graph + Decomposition Rationale §R3/R6 (especially the Gap 6 pre-split + ADR-0009 gate-counting clarification + frozen guesses).
4. Hand-edit any rows you want to retitle, re-scope, re-order, or change `Dep Semantics` on.
5. If you want 5/9 or 7/9 gate threshold instead of 5/7 (with Gap 6 as single category), edit this manifest header `Authority Anchor` line AND ADR-0009 §D2-G3 in the same commit (per R6 §1).

**Step 2 — fire run mode (after Step 1):**

Copy-paste into the same Claude window (or a fresh one):

```text
/xai-roadmap-loop
mode: run
manifest: docs/workflow/roadmap/xai-web-console-gap-closure.md
dispatch: bg
```

(Use `dispatch: emit` if `claude --bg` is unavailable on this machine, or `dispatch: serial` if you want a single transcript with no parallelism. Skill §3.2 will fire a Chinese AskUserQuestion to lock the choice before any background session launches.)

Run mode will dispatch Wave 0 (just #1 pomodoro-counters-test-fix) on its own. After it reaches READY_TO_SHIP and you ship it manually, re-run the same command to unlock Wave 1 (4 parallel rows under Concurrency Cap=3, so first 3 launch + #5 queued as QUEUED_BG).
