# Discovery Review — xai-web-build-form-adr (2026-05-23)

> Feature: `xai-web-build-form-adr` (Wave 0 of `xai-web-console` roadmap).
> Mode: Fresh. Executor: `feature-plan` (Claude Opus 4.7 1M).
> Seed brief: `docs/reviews/xai-web-build-form-adr/20260523-roadmap-seed.md`
> Manifest row: `docs/workflow/roadmap/xai-web-console.md` #1.

## 1. Problem framing

The XAI Console prototype lives at `web design/` as 18 Babel-in-browser flat
files (DESIGN.md §10.1):

```
index.html  tokens.css  layout.css  i18n.js  board-data.js
icons.jsx  shell.jsx  app.jsx  pet.jsx
module-tasks.jsx  module-board.jsx  module-dashboard.jsx
module-calendar.jsx  module-matrix.jsx  module-pomodoro.jsx
module-habits.jsx  module-countdown.jsx  module-meditation.jsx
module-statistics.jsx  module-ai.jsx  module-settings.jsx
```

It does not build. It runs by loading React+ReactDOM+Babel-Standalone from
CDN and transpiling each `<script type="text/babel">` tag in-browser (see
`web design/index.html` lines 16–18). DESIGN.md §10.2 confirms: "React 18.3.1
+ ReactDOM 18.3.1 (CDN), Babel Standalone 7.29.0".

Meanwhile, `apps/web/package.json` (v0.1.0) is already a production-grade
Vite 7 + React 19 + TS 5.9 SPA with `@vitejs/plugin-react`,
`@repo/web-auth-device-session`, `@repo/plugin-console`,
`@repo/plugin-productivity`, and `@sentry/react`. The
`web-ticktick-parity` roadmap has SHIPPED ten platform-spine rows
(`web-architecture-adr-lite`, `web-plugin-map-contract-reconcile`,
`web-sync-crypto-contract-preflight`, `web-release-site-archive-vite-shell`,
`web-auth-device-session`, `web-browser-e2e-crypto-runtime`,
`web-encrypted-indexeddb-cache`, `web-console-host-router`,
`web-security-csp-sentry`, `web-todo-first-slice`).

The user's 2026-05-23 override (manifest header line 13) says: **port the
prototype's design fidelity into the production Vite+TS shell + new
`packages/plugin-web-*` packages, and reuse the platform spine.**

The ADR's job is to **lock the port mapping and the migration rules** so
every downstream `xai-web-*` row (#2..#24) has an unambiguous, citable
contract.

Five concrete questions the ADR must settle:

- Q1. Each prototype file → which exact target path?
- Q2. JSX → TSX strategy: window-globals, Babel removal, React-version
  bump, CSS handling?
- Q3. Each module = a new `packages/plugin-web-<module>/` package OR an
  `apps/web/src/modules/<name>/` folder OR an extension of
  `@repo/plugin-productivity` / `@repo/plugin-console`?
- Q4. Cross-module communication: typed event bus via `@repo/core/events`
  OR a new `@repo/plugin-web-events` package OR direct imports?
- Q5. localStorage key registry: where does the 24-key contract from
  DESIGN.md §9.2 live, and how does it interop with the SHIPPED encrypted
  IndexedDB + sync blob spine?

## 2. Candidate options

### Option A — Babel-in-browser flat files in `apps/web/public/`

Drop the prototype into `apps/web/public/` and serve it. No TS, no build.

**Pros:**
- Zero migration work.
- Closest to the as-designed artifact.

**Cons:**
- No type safety; the whole codebase relies on `window.I18N`,
  `window.BOARDS`, and JSX-via-Babel-standalone.
- Sentry source-map upload (`apps/web/package.json` has 8
  `sourcemaps:*` scripts) cannot index untyped untranspiled files.
- Cannot satisfy the CSP nonce path used by `web-security-csp-sentry`
  (shipped).
- Blocks `@repo/web-auth-device-session` device-id injection (the
  shipped auth uses ES module imports the prototype cannot reach).
- DESIGN.md "click `+`" / Cmd-K / drag handlers all rely on full React
  19 strict-mode behavior; React 18 + Babel-standalone diverges.

**Verdict: rejected.** Even if it were viable, it conflicts with the
SHIPPED platform spine the user explicitly told us to reuse.

### Option B — `apps/web/src/modules/<name>/` folders only

Port each `.jsx` to `apps/web/src/modules/<name>/<Component>.tsx`. No new
packages; everything sits inside the host shell.

**Pros:**
- One package to wire up.
- No workspace dep churn.

**Cons:**
- Violates CLAUDE.md `Code Boundaries`: "Business logic → `packages/plugin-*`,
  never in `apps/desktop/src/`". The symmetric rule for the web host shell
  is implied: `apps/web/src/` is a host shell, not a business-logic
  reservoir.
- Blocks future overlay reuse — if any module ever needs to be loaded by
  the desktop overlay (per ADR-0003 three-faces architecture), it would
  need to be re-extracted into a package.
- Makes statistics aggregator's data shape contract harder to express —
  it would import from sibling folders inside the same host shell, where
  the ADR-0003 platform-independence discipline cannot be checked.

**Verdict: rejected.** Architectural debt with no upside.

### Option C — Vite+TS migration to `apps/web/src/` shell + new `packages/plugin-web-<module>/` packages

Each business module ships as a standalone workspace package. Host shell at
`apps/web/src/` registers them. Tokens + i18n + icons get small dedicated
packages.

**Pros:**
- Matches the established CLAUDE.md / ADR-0003 / ADR-0006 plugin discipline.
- Each module row in W2 (14 rows) is a clean single-package single-run
  unit.
- Statistics row can declare typed event/repository deps explicitly.
- Future Three-Faces reuse (overlay / console / web) preserved per
  ADR-0003.
- Tree-shake-friendly: only modules registered by the host shell ship.

**Cons:**
- 20 new packages to wire up (package.json + manifest.json + tsconfig.json
  + docs four-doc set each). This is real bookkeeping cost.
- Workspace-resolution graph grows; pnpm + Turborepo handle this fine but
  CI cache invalidation patterns shift.
- `@repo/plugin-productivity` / `@repo/plugin-console` (already deps of
  `apps/web/package.json`) may end up as dead deps. ADR documents this as
  a future cleanup, not a v1 blocker.

**Verdict: selected.** Aligns with the prevailing architecture and gives
the W2 parallel-shipable shape the manifest assumes.

### Option D — Extend existing `@repo/plugin-productivity` and `@repo/plugin-console`

Push Tasks / Pomodoro / Habits / Calendar / Board into the existing
plugins. Reuse their shipped surfaces.

**Pros:**
- Minimum new packages.
- Reuses code already in production.
- Keeps `@repo/plugin-productivity` / `@repo/plugin-console` as live deps
  of `apps/web`.

**Cons:**
- The `web design/DESIGN.md` v1.0 surfaces diverge meaningfully from the
  prior Console PRD on which `@repo/plugin-productivity` /
  `@repo/plugin-console` were built. Examples:
  - DESIGN.md §4.3 boards have 6 views including Timeline gantt and Map
    placeholder. Prior Console PRD did not specify those.
  - DESIGN.md §4.4 dashboard uses FLIP-drag macOS Stage Manager animation
    at 380ms — not in prior PRD.
  - DESIGN.md §4 has 4 rail positions (Left/Right/Top/Bottom Dock) with
    independent visual variants — not in prior plugin-console.
- Retrofitting puts the shipped plugins at regression risk during the
  parallel W2 ship.
- AskUserQuestion 2026-05-23 (manifest R6) records that the user expected
  "new packages under packages/plugin-web-<module>/" as the baseline guess.

**Verdict: rejected for v1.** Documented in ADR §Consequences as a
possible future merge once both plugin families have stabilized.

## 3. Recommendation

**Adopt Option C.** Author the ADR as Accepted with the file-by-file port
mapping table (frozen in `design.md`) and the 10 frozen assumptions. Phase
the work as P1 (draft ADR), P2 (review + flip to Accepted), P3 (traceability
appendix + roadmap pause recommendation).

## 4. External research

The seed brief is purely architectural; no library selection required. The
toolchain is fixed by `apps/web/package.json` (Vite + React + TS already
in place). The only "candidate library" question is whether to introduce a
state library (zustand / jotai / redux); the recommendation is **no** for
this migration — the prototype runs fine on `useState` + `useReducer` +
`useContext` + typed events.

**No external research required.** All evidence is internal repo files cited
above.

## 5. Risks and open questions

- **R1 (medium):** `docs/PLUGIN_MAP.md` is potentially stale (per
  `web-ticktick-parity` rationale R3). The ADR cites it with a staleness
  caveat; downstream rows must re-verify each plugin's actual status at
  consume time. **Mitigation:** ADR §Consequences names this risk; row
  #2..#24 each include a status re-check in their own discovery.
- **R2 (low):** ADR cannot edit `docs/workflow/roadmap/web-ticktick-parity.md`
  to pause the four superseded rows. **Mitigation:** ADR §Consequences
  lists the four rows by name and recommends a hand-edit. The Handoff also
  surfaces this so the human reviewer sees it immediately.
- **R3 (low):** AI Chat's `window.claude.complete` adapter has no Vite-era
  successor identified yet. **Mitigation:** ADR records this as an open
  question deferred to row #18 (`xai-web-ai-chat`)'s own feature-plan.
- **R4 (low):** Pomodoro and Countdown persistence key names are
  manifest-R6 proposals (`xai_pomodoro_sessions`, `xai_countdowns`).
  **Mitigation:** ADR records them as proposed-not-frozen; owning rows
  may rename without re-opening the ADR.
- **R5 (medium):** DESIGN.md §9 reads "zero network dependency"; the
  platform spine has sync. **Mitigation:** ADR resolves this explicitly —
  UI prefs → localStorage; durable data → encrypted IndexedDB + sync blob.
  Both layers are "local-first"; DESIGN.md's promise is preserved in spirit.
- **R6 (low):** `@repo/plugin-productivity` and `@repo/plugin-console`
  may become dead deps in `apps/web/package.json`. **Mitigation:** ADR
  §Consequences notes this and defers the dep cleanup to a future
  `web-ticktick-parity` review row, not v1.
- **R7 (low):** Cross-vendor verify gate (Verify Cross-vendor=yes) may
  surface a different reading of ADR-0003 / ADR-0006. **Mitigation:**
  ADR §S6 (Implementation Rules) explicitly cites both prior ADRs and
  affirms ADR-0007 refines but does not overrule them.

## 6. Open questions for the reviewer

- **Q-Rev-1:** Is the 20-new-package count acceptable, or should
  `plugin-web-icons` and `plugin-web-tokens` be merged into one
  `plugin-web-foundation` package? (design.md keeps them separate;
  reviewer may direct a merge.)
- **Q-Rev-2:** Should the ADR explicitly retire `@repo/plugin-productivity`
  / `@repo/plugin-console` deps from `apps/web/package.json`, or leave that
  to a future cleanup row? (design.md picks "future cleanup".)
- **Q-Rev-3:** Should `@repo/plugin-web-events` actually exist (a thin
  re-export of `@repo/core/events` typed for `web:*` events)? design.md
  rejects this on indirection grounds; reviewer may overrule if they want
  a clearer web-scoped namespace.
- **Q-Rev-4:** Should the four `web-ticktick-parity` pause-recommendations
  be promoted from "hand-edit recommendation in ADR §Consequences" to a
  formal SHIP-BLOCKING item for the human reviewer? (design.md treats it
  as advisory; reviewer may want a stricter gate.)
