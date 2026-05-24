# Roadmap Manifest — xai-web-console

- Roadmap Source: web design/DESIGN.md (Claude-Artifact React prototype, 14 modules + tokens + i18n + persistence, acceptance checklist §12)
- Source Code Reference: web design/{index.html, app.jsx, shell.jsx, module-*.jsx, pet.jsx, tokens.css, layout.css, i18n.js, board-data.js}
- Init Path: decompose
- Generated: 2026-05-23
- Default Automation Mode: A-Claude    # user override 2026-05-23 — see _portable/04-automation-loop.md §3
- Default Dependency Semantics: shipped
- Default Verify Cross-vendor: yes      # 2026-05-23 user override; strict cross-vendor verify gate
- Cross-vendor Verifier Order: 2026-05-23 user override — primary: Codex (gpt-5.5-thinking, effort=medium). Fallback when Codex quota exhausted: Cursor. (Applies to every row's cross-vendor verify gate. Current SHIPPED rows had cross-vendor cold-read by Claude Opus 4.7 1M as same-vendor compromise; the queued ship-time manual smoke + the next batches' cross-vendor verify will use this Codex→Cursor order.)
- Wave Concurrency Cap: 3                # bg dispatch default; raise deliberately only after quota/worktree review
- BG Direct Verified: unknown            # set yes only after a local smoke test
- Manifest Review: REQUIRED              # init stops here; review boundaries + dependency graph before run
- Authority Override (2026-05-23): web design/DESIGN.md SUPERSEDES any conflicting prior PRD (sync-v1, plugin-organizer, grid-window, web-ticktick-parity PRDs). Desktop / Tauri / organizer / sync-v1 work is paused for the duration of this roadmap.
- Interop with web-ticktick-parity: REUSE shipped platform spine (web-architecture-adr-lite, web-plugin-map-contract-reconcile, web-sync-crypto-contract-preflight, web-release-site-archive-vite-shell, web-auth-device-session, web-browser-e2e-crypto-runtime, web-encrypted-indexeddb-cache, web-console-host-router, web-security-csp-sentry). PAUSE conflicting PENDING rows: web-productivity-habits-pomodoro, web-project-label-calendar, web-search-keyboard-theme, web-statistics-views (these are SUPERSEDED by xai-web-{pomodoro,habits,calendar,board-*,statistics,settings-*}).

## Features

| # | Slug | Source | Depends On | Dep Semantics | Status | Automation Mode | Verify Cross-vendor | Last Run | Note |
|---|------|--------|------------|---------------|--------|-----------------|---------------------|----------|------|
| 1 | xai-web-build-form-adr | docs/reviews/xai-web-build-form-adr/20260523-roadmap-seed.md | — | — | SHIPPED | (default) | (default) | 2026-05-23 | W0 · ADR-0007 Accepted; 3 commits (f167310/c4f1f1b/fe8444a) pushed 2026-05-23; all 13 verify gates PASS; SHIPPED. |
| 2 | xai-web-tokens-and-i18n | docs/reviews/xai-web-tokens-and-i18n/20260523-roadmap-seed.md | xai-web-build-form-adr | ready_to_ship | SHIPPED | (default) | (default) | 2026-05-23 | W1 · @repo/plugin-web-tokens; 3 commits (e44bbc3/c9079c9/6c556e6); 50/50 tests pass; 12/12 verify gates PASS; SHIPPED 2026-05-23 (pushed in row #1 ship batch b0f4fdd..65fcd97). |
| 3 | xai-web-persistence-contract | docs/reviews/xai-web-persistence-contract/20260523-roadmap-seed.md | xai-web-build-form-adr | ready_to_ship | READY_TO_SHIP | (default) | (default) | 2026-05-23 | W1 · @repo/plugin-web-storage; 3 commits (ce6270c/0109326/3085911); 70/70 tests pass; 11/11 verify gates PASS. |
| 4 | xai-web-event-bus | docs/reviews/xai-web-event-bus/20260523-roadmap-seed.md | xai-web-build-form-adr | ready_to_ship | READY_TO_SHIP | (default) | (default) | 2026-05-23 | W1 · @repo/xai-web-event-bus + 5 web:* in @repo/core; 2 commits (a798384/0cb8e27); 18+4+37/59 tests pass; 13/13 verify gates PASS. |
| 5 | xai-web-shell | docs/reviews/xai-web-shell/20260523-roadmap-seed.md | xai-web-build-form-adr, xai-web-tokens-and-i18n, xai-web-persistence-contract, xai-web-event-bus | ready_to_ship | READY_TO_SHIP | (default) | (default) | 2026-05-23 | W1b · @repo/xai-web-shell; 5 commits (5a1ef24/d4a6777/b5b5fa6/b75db5f/7da2733); 84+46 tests pass; vite build green; 17/17 verify gates PASS. |
| 6 | xai-web-tasks | docs/reviews/xai-web-tasks/20260523-roadmap-seed.md | xai-web-shell | ready_to_ship | READY_TO_SHIP | (default) | (default) | 2026-05-23 | W2b · @repo/plugin-web-tasks; 3 commits (3c0d6bd/e5ac21b/bbaae81); 40/40 tests pass; 14/14 verify gates PASS. |
| 7 | xai-web-board-core | docs/reviews/xai-web-board-core/20260523-roadmap-seed.md | xai-web-shell | ready_to_ship | READY_TO_SHIP | (default) | (default) | 2026-05-23 | W2d · @repo/plugin-web-board-core; 4 commits (f991cba/8226aae/cc52060/24567e9); 104/104 tests pass; 7/7 verify gates PASS. |
| 8 | xai-web-board-views | docs/reviews/xai-web-board-views/20260523-roadmap-seed.md | xai-web-board-core | ready_to_ship | READY_TO_SHIP | (default) | (default) | 2026-05-23 | W2e · @repo/plugin-web-board-views; 4 commits (0649c0b/1114cba/0f6ca12/d2594b7); 90/90 tests pass; 17/17 verify gates PASS. |
| 9 | xai-web-board-workspaces | docs/reviews/xai-web-board-workspaces/20260523-roadmap-seed.md | xai-web-board-core | ready_to_ship | READY_TO_SHIP | (default) | (default) | 2026-05-23 | W2e · @repo/plugin-web-board-workspaces; 4 commits (214f28f/a107980/fdd1521/05734c3); 135/135 tests pass; 6/6 verify gates PASS. |
| 10 | xai-web-dashboard-grid | docs/reviews/xai-web-dashboard-grid/20260523-roadmap-seed.md | xai-web-shell | ready_to_ship | READY_TO_SHIP | (default) | (default) | 2026-05-23 | W2d · @repo/plugin-web-dashboard-grid; 4 commits (2d9655f/7691f97/7daa255/78e1b43); 104+54+8 tests pass; 15/15 verify gates PASS. |
| 11 | xai-web-dashboard-widgets | docs/reviews/xai-web-dashboard-widgets/20260523-roadmap-seed.md | xai-web-dashboard-grid | ready_to_ship | READY_TO_SHIP | (default) | (default) | 2026-05-23 | W2e · @repo/plugin-web-dashboard-widgets; 4 commits (9a78d17/b4bcf22/95bbdc8/e9891de); 93+104+70+54 tests pass; 15/15 verify gates PASS. |
| 12 | xai-web-calendar | docs/reviews/xai-web-calendar/20260523-roadmap-seed.md | xai-web-shell | ready_to_ship | READY_TO_SHIP | (default) | (default) | 2026-05-23 | W2c · @repo/plugin-web-calendar; 5 commits (b9c5267/19616e2/9a69d75/e32cd0a/f3a9194); 90/90 tests pass; 17/17 verify gates PASS. |
| 13 | xai-web-matrix | docs/reviews/xai-web-matrix/20260523-roadmap-seed.md | xai-web-shell | ready_to_ship | READY_TO_SHIP | (default) | (default) | 2026-05-23 | W2a · @repo/plugin-web-matrix; 4 commits (439cd9c/3161a3c/b9e1143/a0cf47e); 54/54 tests pass; 15/15 verify gates PASS. |
| 14 | xai-web-pomodoro | docs/reviews/xai-web-pomodoro/20260523-roadmap-seed.md | xai-web-shell | ready_to_ship | READY_TO_SHIP | (default) | (default) | 2026-05-23 | W2b · @repo/plugin-web-pomodoro; 4 commits (13038fc/4f794fd/1b1ce4c/8e173db); 122/122 tests pass; 14/14 verify gates PASS. |
| 15 | xai-web-habits | docs/reviews/xai-web-habits/20260523-roadmap-seed.md | xai-web-shell | ready_to_ship | READY_TO_SHIP | (default) | (default) | 2026-05-23 | W2b · @repo/plugin-web-habits; 4 commits (d096f37/6d39407/3b4f63d/d391268); 118/118 tests pass; 17/17 verify gates PASS. |
| 16 | xai-web-meditation | docs/reviews/xai-web-meditation/20260523-roadmap-seed.md | xai-web-shell | ready_to_ship | READY_TO_SHIP | (default) | (default) | 2026-05-23 | W2c · @repo/plugin-web-meditation; 3 commits (812c009/dcd9abd/710b995); 95/95 tests pass; 14/14 verify gates PASS. |
| 17 | xai-web-countdown | docs/reviews/xai-web-countdown/20260523-roadmap-seed.md | xai-web-shell | ready_to_ship | READY_TO_SHIP | (default) | (default) | 2026-05-23 | W2a · @repo/plugin-web-countdown; 5 commits (ead2916/bf01ff4/a6de6a0/e78aeee); 110/110 tests pass; 14/14 verify gates PASS. |
| 18 | xai-web-ai-chat | docs/reviews/xai-web-ai-chat/20260523-roadmap-seed.md | xai-web-shell | ready_to_ship | READY_TO_SHIP | (default) | (default) | 2026-05-23 | W2c · @repo/plugin-web-ai-chat; 5 commits (fa748a1/a94c91b/9a69d75/8e1f5e8/8c758e8); Option A no-op claude.complete adapter; 84/84 plugin + 51/51 web tests pass. |
| 19 | xai-web-pet | docs/reviews/xai-web-pet/20260523-roadmap-seed.md | xai-web-shell | ready_to_ship | READY_TO_SHIP | (default) | (default) | 2026-05-23 | W2a · @repo/plugin-web-pet; 4 commits (67d2aa1/8c37023/5fb9e7b/9537b65); 129/129 tests pass; 17/17 verify gates PASS. |
| 20 | xai-web-statistics | docs/reviews/xai-web-statistics/20260523-roadmap-seed.md | xai-web-tasks, xai-web-pomodoro, xai-web-habits | ready_to_ship | READY_TO_SHIP | (default) | (default) | 2026-05-23 | W3 · @repo/plugin-web-statistics; 4 commits (8226aae/363999f/4f26fca/8483382); 124/124 tests pass; verify gates PASS. |
| 21 | xai-web-settings-shell | docs/reviews/xai-web-settings-shell/20260523-roadmap-seed.md | xai-web-shell | ready_to_ship | READY_TO_SHIP | (default) | (default) | 2026-05-23 | W4a · @repo/plugin-web-settings-shell; 4 commits (3cb7e6a/f637a3d/39da7af/46ebcf6); 49/49 tests pass; verify gates PASS. |

| 22 | xai-web-settings-appearance | docs/reviews/xai-web-settings-appearance/20260523-roadmap-seed.md | xai-web-settings-shell | ready_to_ship | READY_TO_SHIP | (default) | (default) | 2026-05-23 | W4b · @repo/plugin-web-settings-appearance; 2 commits (61f6177/17f9f18); 50+67 tests pass; 20/20 verify gates PASS. |
| 23 | xai-web-settings-features-panel | docs/reviews/xai-web-settings-features-panel/20260523-roadmap-seed.md | xai-web-settings-shell, xai-web-tasks, xai-web-board-core, xai-web-dashboard-grid, xai-web-calendar, xai-web-matrix, xai-web-pomodoro, xai-web-habits, xai-web-meditation | ready_to_ship | READY_TO_SHIP | (default) | (default) | 2026-05-23 | W4b · @repo/plugin-web-settings-features-panel; 4 commits (85761cd/79cd0e7/9822c42/e69e249); 23+6 tests pass; verify gates PASS. |
| 24 | xai-web-settings-rest | docs/reviews/xai-web-settings-rest/20260523-roadmap-seed.md | xai-web-settings-shell | ready_to_ship | READY_TO_SHIP | (default) | (default) | 2026-05-23 | W4b · @repo/plugin-web-settings-rest; 5 commits (bf6492e/81fbc61/72bb4de/479f314/5abeb4d); 81/81 tests pass; 19/19 verify gates PASS. |

## Decomposition Rationale

### R1. Source and init path

`Init Path: decompose`. The source is `web design/DESIGN.md` — a structured Claude-Artifact React prototype PRD (24KB) plus 14 module JSX files (~340KB total) implementing it. DESIGN.md is reviewed and feature-complete as a *design spec* (its §12 acceptance checklist marks all 28 items `[x]`), but the artifact is Babel-in-browser flat files with no build, no TypeScript, no tests, and no integration with the project's existing `apps/web/` Vite app. The user's intent (2026-05-23) is to port the prototype's design fidelity into the production build under `apps/web/` + new `packages/plugin-web-*` packages while reusing the SHIPPED platform spine from the in-progress `web-ticktick-parity` roadmap.

### R2. Authority override + roadmap interop

User override on 2026-05-23 names `web design/DESIGN.md` as the new top-priority PRD: it supersedes any conflicting prior PRD (sync-v1, plugin-organizer, grid-window, and — implicitly — the `docs/planning/sub-prds/web/PRD.md` that drives `web-ticktick-parity`). Desktop / Tauri / organizer / sync-v1 work is paused for this roadmap's duration.

The user did NOT name `web-ticktick-parity` explicitly. After AskUserQuestion (2026-05-23), the decomposition treats `web-ticktick-parity` as **platform spine to reuse, not work to redo**:

- **REUSE (SHIPPED rows, treated as dependencies, not re-listed in xai-web-console):** web-architecture-adr-lite, web-plugin-map-contract-reconcile, web-sync-crypto-contract-preflight, web-release-site-archive-vite-shell, web-auth-device-session, web-browser-e2e-crypto-runtime, web-encrypted-indexeddb-cache, web-console-host-router, web-security-csp-sentry, web-todo-first-slice.
- **PAUSE (PENDING rows superseded by xai-web-console UI surfaces):** web-productivity-habits-pomodoro, web-project-label-calendar, web-search-keyboard-theme, web-statistics-views. These are superseded by xai-web-{pomodoro,habits,calendar,board-core,board-views,board-workspaces,statistics,settings-*}. A human should hand-edit those manifest rows to `BLOCKED_EXTERNAL` with `Note: superseded by xai-web-console` after this manifest passes review.
- **DEFERRED (independent infra concerns, neither paused nor scheduled here):** web-sync-blob-driver, web-realtime-metadata-sync, web-offline-outbox-conflicts, web-responsive-mobile, web-device-management-revoke, web-export-delete-privacy, web-pwa-sw-release, web-i18n-seo-landing, web-deploy-ci-browser-matrix, web-ga-acceptance-suite, web-external-env-provisioning. These remain owned by web-ticktick-parity and continue independently when that roadmap resumes.

### R3. Structural context read

- `docs/PLUGIN_MAP.md` — read; lists packages/plugin-productivity, plugin-console, plugin-project, plugin-labels, plugin-calendar already in the tree. The build-form ADR (#1) must decide whether xai-web-* rows extend those existing plugin packages or create new ones (recommendation: new `packages/plugin-web-<module>/` per row, since the prototype's design fidelity meaningfully diverges from prior plugin specs).
- `apps/web/package.json` — read; Vite SPA, type module, already depends on `@repo/plugin-console` + `@repo/plugin-productivity` + `@repo/web-auth-device-session`. The build-form ADR must decide whether xai-web-* modules live under `apps/web/src/modules/<name>/` or under new `packages/plugin-web-<module>/` with apps/web depending on each.
- `web design/DESIGN.md` §9.2 — 24 localStorage keys form the canonical persistence contract; key #3 (xai-web-persistence-contract) owns the registry.
- `web design/DESIGN.md` §5 — tokens.css is the canonical design-system source of truth; key #2 (xai-web-tokens-and-i18n) owns the port.
- CLAUDE.md `Code Boundaries` — Plugin-to-plugin interaction MUST go through `@repo/core/events`. Key #4 (xai-web-event-bus) ensures this discipline in the new modules.

### R4. Feature boundaries

Rows are cut so each is a plausible single `xai-feature-full-loop` run with one dominant ownership boundary:

- **W0 (1 row)** — build-form-adr decides the port mapping; gates every downstream row.
- **W1 (4 rows, parallel)** — tokens-and-i18n, persistence-contract, event-bus, shell. Foundation. Shell depends on the other three because it consumes them at compile time.
- **W2 (14 rows, parallel)** — every leaf module. board and dashboard pre-split into core+views+workspaces and grid+widgets respectively per AskUserQuestion 2026-05-23 (granularity decision: pre-split). board-views, board-workspaces, and dashboard-widgets carry a `ready_to_ship` edge to their core/grid sibling so they can start once the core API is locked.
- **W3 (1 row)** — statistics aggregates Tasks/Pomodoro/Habits data; `ready_to_ship` edges so all three modules need their data shape (not the full ship) before statistics can plan.
- **W4 (4 rows)** — settings split into chassis + 3 pane families. features-panel needs every module's slot registration to render the on/off list; uses `ready_to_ship` edges to start as soon as each module's contract is locked, not after batch ship.

### R5. Dependency edges

- All W1 rows depend on #1 (build-form-adr, shipped) — the ADR's port mapping must be Accepted before any code lands.
- All W2 module rows depend on #5 (shell, shipped) — they need a host to register into. They do NOT depend on each other (true independence) so wave 2 dispatches all 14 rows in parallel under the cap.
- Board+Dashboard splits use `ready_to_ship` between core+views/grid+widgets so the second half can start once the core's contract is locked, even if the core ships separately.
- statistics (#20) uses `ready_to_ship` on tasks/pomodoro/habits — the data-shape contract is what statistics needs, not the full UI ship.
- settings-features-panel (#23) uses `ready_to_ship` on the 8 toggleable modules — it renders their slot info, not their behavior.

### R6. Granularity & assumptions recorded

- **AskUserQuestion 2026-05-23 (granularity):** user chose to pre-split board → core/views/workspaces, dashboard → grid/widgets, settings → shell/appearance/features-panel/rest. Manifest carries 24 rows instead of 17. Rationale: parallelism + clearer single-run scoping, accepted dependency-edge complexity.
- **AskUserQuestion 2026-05-23 (build form):** user chose Vite+TS migration. Build-form ADR (#1) records the port mapping; standalone Babel form will not ship.
- **AskUserQuestion 2026-05-23 (relationship to web-ticktick-parity):** user chose REUSE platform spine + replace UI; conflicting PENDING rows on web-ticktick-parity are paused (see R2).
- **Mode default:** Default Automation Mode is `A-Claude` per user override 2026-05-23 (not asked per-row; user explicit value bypassed §2c picker).
- **Verify Cross-vendor default:** `yes` per user override 2026-05-23.
- **Guess (not user-confirmed):** new packages live under `packages/plugin-web-<module>/`; build-form ADR (#1) may overrule.
- **Guess (not user-confirmed):** AI Chat's `window.claude.complete` adapter strategy under Vite/non-Claude-Artifact runtime is left to the ai-chat row's feature-plan; ADR may pre-decide.
- **Guess (not user-confirmed):** Pomodoro session persistence key `xai_pomodoro_sessions` and Countdown persistence key `xai_countdowns` are seed-brief proposals; feature-plan rows may rename.
- **Open uncertainty:** whether `@repo/plugin-productivity` and `@repo/plugin-console` (already deps of apps/web) get replaced, extended, or sidelined by the new packages/plugin-web-*. This is the ADR's job to settle in row #1.

### R6.5 Dep semantics relaxation (2026-05-23, mid-run §A4.5)

Rows #2-#5 dep semantics on row #1 (xai-web-build-form-adr) flipped from
`shipped` → `ready_to_ship` because row #1 is an ADR-only artifact whose
"ship" is just `git push` of three doc-only commits (f167310/c4f1f1b/fe8444a).
ADR-0007 is Accepted; downstream W1 features can cite it now without waiting
for the push. This is the roadmap author's tradeoff per portable §A4.5 — it
removes ~one human round-trip between W0 and W1 batch-ship windows.

### R7. Wave plan

```
W0 — 1 row    │ #1 build-form-adr
              ▼ (shipped)
W1 — 4 rows   │ #2 tokens, #3 persistence, #4 event-bus, #5 shell
                                                            ▼ (shipped)
W2 — 14 rows  │ #6 tasks, #7 board-core, #8 board-views (rts), #9 board-workspaces (rts),
              │ #10 dashboard-grid, #11 dashboard-widgets (rts),
              │ #12 calendar, #13 matrix, #14 pomodoro, #15 habits,
              │ #16 meditation, #17 countdown, #18 ai-chat, #19 pet
              ▼ (ready_to_ship on tasks/pomodoro/habits)
W3 — 1 row    │ #20 statistics
              ▼ (ready_to_ship on modules)
W4 — 4 rows   │ #21 settings-shell ▶ #22 appearance + #23 features-panel + #24 rest
```

Five dependency layers ⇒ approximately 5 batch-ship windows. With Wave Concurrency Cap=3 and `dispatch: bg`, W2 runs in ~5 sequential bg-windows of 3 features each (~14 features ÷ 3 cap). With `dispatch: emit` and full human parallelism the W2 wall-clock is min(14, available human-paste-windows) × per-feature time.

---

## Handoff

### Status
- Workflow: roadmap-loop init (decompose path) complete; manifest written; awaiting human review gate.
- Manifest: docs/workflow/roadmap/xai-web-console.md
- Seed Briefs: 24 files under docs/reviews/xai-web-*/20260523-roadmap-seed.md
- Init does NOT auto-continue into run — human review of feature boundaries + dependency graph is required per skill §2c.

### Blockers
None during init. Two material caveats to surface for the human reviewer:
1. Conflicting PENDING rows on `web-ticktick-parity` (web-productivity-habits-pomodoro, web-project-label-calendar, web-search-keyboard-theme, web-statistics-views) need a hand-edit to `BLOCKED_EXTERNAL` Note: superseded by xai-web-console — this skill does not write other manifests.
2. The ADR row (#1) decides whether new packages live under `packages/plugin-web-*/` or extend existing `@repo/plugin-productivity` / `@repo/plugin-console`. Downstream rows assume new packages until the ADR ships and may need re-scoping if the ADR chooses the extend path.

### Summary
24-row roadmap manifest for xai-web-console, decomposed from `web design/DESIGN.md` along plugin-boundary lines. 1 ADR + 4 foundation rows + 14 parallel module rows + 1 aggregator + 4 settings rows across 5 dependency waves. Reuses 10 SHIPPED rows from `web-ticktick-parity` as platform spine; pauses 4 conflicting PENDING rows on that roadmap.

### Next Step

Two-step gate before `mode: run` can fire:

**Step 1 — human review (REQUIRED):**
1. Read `docs/workflow/roadmap/xai-web-console.md`.
2. Read each `docs/reviews/xai-web-*/20260523-roadmap-seed.md` (24 files).
3. Confirm feature boundaries + dependency graph + Decomposition Rationale §R2/R6 (especially the platform-spine reuse and the build-form ADR scope).
4. Hand-edit any rows you want to retitle, re-scope, re-order, or change `Dep Semantics` on.
5. Hand-edit conflicting `web-ticktick-parity` rows to `BLOCKED_EXTERNAL` with `Note: superseded by xai-web-console` (this skill cannot do that — it writes only its own manifest).

**Step 2 — fire run mode (after Step 1):**

Copy-paste into a fresh Claude window:

```text
/xai-roadmap-loop
mode: run
manifest: docs/workflow/roadmap/xai-web-console.md
dispatch: bg
```

(Use `dispatch: emit` if your Claude Code does not have `claude --bg` / Agent View, or `dispatch: serial` if you want a single transcript with no parallelism. The skill's §3.2 confirmation gate will fire a Chinese AskUserQuestion to lock the choice before any background session launches.)

Run mode will then dispatch wave 0 (build-form-adr) on its own. After it reaches READY_TO_SHIP and you ship it manually, re-run the same command to unlock wave 1.
