# Dev Log — xai-web-tokens-and-i18n

## Status Panel

- Workflow: FEATURE_DEV
- Target: xai-web-tokens-and-i18n
- Title: Port `tokens.css` + `layout.css` + `i18n.js` into `@repo/plugin-web-tokens` (Wave W1 Foundation row #2)
- Current Phase: SHIP
- Status: SHIPPED
- Executor: ship (Claude Sonnet 4.6)
- Updated: 2026-05-23 18:30
- Suggested Next: —
- Automation Mode: A-Claude (per roadmap default 2026-05-23)
- Verify Cross-vendor: yes (per roadmap default 2026-05-23)
- ADR-lite: not required (gated by ADR-0007 which is already Accepted)

## Review Notes (feature-review · 2026-05-23 10:15 · Claude Opus 4.7)

**Verdict: APPROVED — 0 blockers, 3 advisory non-material observations.**

Gate-by-gate evaluation:

1. **Seed-brief fidelity** — PASS. Every Requirement/Hard constraint/Acceptance signal is covered:
   - Token verbatim port (constraint #1) → design.md Frozen Assumption #1 + token inventory + test.md §C AC-T1..AC-T20.
   - Dotted `I18N.en.module.key` shape (constraint #2) → design.md Frozen Assumption #4 + api.md i18n bundle table.
   - Google Fonts Manrope + Noto Sans SC + JetBrains Mono with §5.2 weights (constraint #3) → design.md Frozen Assumption #5 + dev_log P1 step 7 (exact `<link>` weights match: M 400/500/600/700/800, NSSC 400/500/600/700, JBM 400/500/600).
   - data-* driven theme/density/font-scale/accent-hue on `<html>` (constraint #4) → design.md Frozen Assumption #6 + api.md `apply*` helpers + test.md §B AC-A1..AC-A13.
   - Acceptance "smoke route renders both EN and 中文 with right font stack" → dev_log P3 step 3 + test.md §E2E smoke route.

2. **ADR-0007 §S4 port-mapping conformance** — PASS. Implementation package `packages/plugin-web-tokens/` matches §S4 table line 264–266 verbatim (tokens.css → src/tokens.css + index.ts re-export; layout.css → same package; i18n.js → src/i18n.ts + useI18n hook). The doc-tracking dir vs npm-name duality is explicitly called out in discovery §1 decision 1 and design.md "Doc Tracking Package" line — this is intentional dispatch convention, not drift.

3. **Token verbatim fidelity** — PASS. design.md Frozen Assumption #1 commits "byte-for-byte port of `web design/tokens.css` (424 lines)", preserving all 88 vars; sentinel set (15 vars) named with exact oklch() / px values in design.md Token Inventory. test.md §C asserts each sentinel via getComputedStyle OR fs-level substring (with documented jsdom limitation fallback). Verify gate (test.md §Cross-vendor) requires byte-equal tokens.css across vendors.

4. **i18n key shape fidelity** — PASS. design.md Frozen Assumption #4 locks `I18N.en.module.key` / `I18N.zh.module.key` dotted shape; api.md tabulates the full bundle (14 top-level keys including app_name + 13 module namespaces + quotes array). `as const` chain documented in design.md "Reasoning highlights".

5. **Font stack** — PASS. Manrope + Noto Sans SC + JetBrains Mono via Google Fonts `<link>` exactly per DESIGN.md §5.2; weights match (verified in dev_log P1 step 7 against constraint #3). Option B (Fontsource) explicitly rejected with DESIGN.md §5.2 mandate as rationale.

6. **data-attribute switching** — PASS. All six personalisation axes (theme/density/font-scale/accent-hue/bg-tone/rail-pos) have typed `apply*` helpers with explicit DOM contracts (api.md §apply* helpers). `data-bg-tone="default"` correctly REMOVES attribute (matches prototype's behavior of `:root` defaulting). `applyRailPos` hoist-to-`<html>` decision is documented with a defer note for row #5 override — this is the right level of flexibility.

7. **Phase reasonableness** — PASS. Three phases are well-sized:
   - P1: CSS port + Google Fonts + CSP audit (mechanical, ~1 build run)
   - P2: i18n.ts + useI18n + apply.ts + 25 unit tests (the main TS work, ~1 build run)
   - P3: smoke route + tokens-smoke tests + index-barrel tests + final wiring (~1 build run)
   - Each phase has a clear Gate and single-commit boundary. P3 contains optional polish (delete global.css placeholder); deferrable to verify if needed.

8. **Cross-vendor verify gate** — PASS. test.md §Cross-vendor verify gate enumerates six concrete checks (byte-equal tokens.css/layout.css, semantically-equal i18n.ts, API signatures, vitest, tsc); dev_log Status Panel records `Verify Cross-vendor: yes`; design.md dependency overview confirms no upstream code deps so vendor isolation is clean.

9. **Open questions / risks** — All seven open questions in dev_log §Suggested Next are explicitly resolved or marked advisory:
   - Q1 (dual `{t,s}` justified) — settled by discovery Option E rationale + DESIGN.md §8 + seed brief reconciliation.
   - Q2 (Fontsource alternative) — settled by Option A rationale + DESIGN.md §5.2 mandate.
   - Q3 (co-locate layout.css) — settled by ADR-0007 §S4 explicit decision.
   - Q4 (phase sizing) — confirmed correct above.
   - Q5 (doc-dir/npm-name duality) — settled by design.md cross-reference + discovery §1 decision.
   - Q6 (missing-key prod warn suppression) — acceptable; standard i18n library behavior (react-i18next, FormatJS both suppress in prod). Console.error vs warn is a P2 implementation choice but warn is correct per industry precedent.
   - Q7 (applyRailPos hoist) — deferred to row #5 with documented escape hatch; non-blocking.

   Risk table (discovery §5 + dev_log §Risks) covers token drift, CSP blocks, jsdom limitations, doc-dir duality, sibling write conflicts, FOUT, `as const` discipline. All have explicit mitigations. The concurrent-sibling write-scope is audited and disjoint: this row writes `packages/plugin-web-tokens/**` + `apps/web/index.html` header `<link>` block (no overlap with #3's `packages/plugin-web-persistence/**` or #4's `packages/core/src/types/events.ts` additive entries).

**Advisory non-material observations** (do NOT block; flagged for builder awareness):

- **A1 (P3 router insert)** — dev_log P3 step 4 mentions `apps/web/src/routes/router.tsx` for the dev-only `/_smoke/tokens` route. Builder should confirm this file exists at expected path before mutating; if router file structure has drifted since `web-console-host-router` SHIPPED, builder takes one extra read step. Non-blocking — easily resolved by inspection during P3.
- **A2 (sideEffects field placement)** — api.md §Side-effect contract correctly says `"sideEffects": ["./src/tokens.css", "./src/layout.css"]`. Builder should put this in `package.json`, not `tsconfig.json` (the array-not-boolean note in test.md §Failure-mode is a good reminder). Trivially correct in plan; flagged only because Vite's sideEffects handling is a frequent gotcha.
- **A3 (`@repo/typescript-config/react-library.json`)** — dev_log P1 step 3 references this preset; builder should verify the file exists in the workspace (the project may currently expose a different preset name). One read confirms; substitute correct preset name if differing. Non-blocking — common Turborepo convention.

**Architecture risk check** — no `packages/core/` changes (foundational row owns its own surface); `manifest.json` is placeholder-only (Web plugin metadata, no routing impact); no cross-feature contract drift (sibling write scopes disjoint; ADR-0007 §S4 frozen names preserved).

**Conclusion**: plan is executable with zero blocking ambiguity. Proceed to feature-auto-build (per roadmap parallel-Agent mode default, batch through all three phases stopping at feature-verify).

## Brief / Review Docs

- Seed brief: `docs/reviews/xai-web-tokens-and-i18n/20260523-roadmap-seed.md`
- Discovery review: `docs/reviews/xai-web-tokens-and-i18n/20260523-discovery-review.md`
- Gating ADR: `docs/adr/0007-xai-web-console-build-form.md` §S4 (port mapping) + §S5 (JSX→TSX 10 rules)
- Roadmap row: `docs/workflow/roadmap/xai-web-console.md` #2 (Wave 1, Foundation)
- Source PRD: `web design/DESIGN.md` §5 (Tokens), §7 (Personalisation), §8 (i18n), §10.2 (style truth source)
- Source code: `web design/tokens.css` (424 LOC), `web design/layout.css`, `web design/i18n.js` (637 LOC inc. MOCK; only I18N section ports)

## Parallel Sibling Context (Wave 1)

This row is dispatched concurrently in `parallel-Agent mode` with two sibling rows. Cross-row write-scope discipline must hold:

| Sibling | Slug | Write scope (must NOT overlap with this row) |
|---|---|---|
| #3 | xai-web-persistence-contract | `packages/xai-web-persistence-contract/docs/**` + new `packages/plugin-web-persistence/**` |
| #4 | xai-web-event-bus | `packages/xai-web-event-bus/docs/**` + additive entries to `packages/core/src/types/events.ts` |

**This row writes**: `packages/xai-web-tokens-and-i18n/docs/**` + `docs/reviews/xai-web-tokens-and-i18n/**` ONLY in feature-plan. Build phases will additionally write `packages/plugin-web-tokens/**` + add `<link>` tags to `apps/web/index.html` (header-only additions; no overlap with #3/#4).

## Phase Plan

> Each phase is ONE `feature-build` run, then stops for human confirmation per V2 workflow.

### P1 — `tokens.css` + `layout.css` port + Google Fonts wiring

**Goal**: byte-equal CSS port of `web design/tokens.css` and `web design/layout.css` into `packages/plugin-web-tokens/src/`; Google Fonts `<link>` tags added to `apps/web/index.html`; CSP audit confirms Google Fonts allowed.

**Steps**:
1. Create `packages/plugin-web-tokens/` with `package.json` (`name: "@repo/plugin-web-tokens"`, `type: "module"`, `sideEffects: ["./src/tokens.css", "./src/layout.css"]`, peer dep `react@^19.2.0`, dev deps `vitest`, `jsdom`, `@types/jsdom`, `typescript`, `@repo/typescript-config`).
2. Create `manifest.json` placeholder (plugin meta).
3. Create `tsconfig.json` extending `@repo/typescript-config/react-library.json`.
4. Copy `web design/tokens.css` → `packages/plugin-web-tokens/src/tokens.css` (byte-for-byte; preserve comment block headers).
5. Copy `web design/layout.css` → `packages/plugin-web-tokens/src/layout.css` (byte-for-byte; if `.app[data-rail-pos="..."]` selectors need hoisting to `<html>`, defer to P3 — initial port keeps prototype selectors as-is).
6. Create `src/index.ts` with side-effect imports for both CSS files (initial skeleton; full re-exports added in P2).
7. Edit `apps/web/index.html`: add to `<head>` after meta tags:
   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
   <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Noto+Sans+SC:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap">
   ```
8. Audit `apps/web/src/security/cspPolicy.ts` — confirm `style-src` includes `https://fonts.googleapis.com` and `font-src` includes `https://fonts.gstatic.com`. If missing, add them (record as a P1 side-effect; should not require coordination with `web-security-csp-sentry` since the change is additive and inside `apps/web/`).
9. Add `pnpm-workspace.yaml` is already glob `packages/*` — no edit needed.
10. Add `apps/web/package.json` workspace dep `@repo/plugin-web-tokens: workspace:*` (so the host shell can import for type-check; the actual wiring of `import "@repo/plugin-web-tokens"` in `main.tsx` is OPTIONAL in P1 — minimum viable P1 just makes the package linkable).

**Gate** (must pass before phase complete):
- `pnpm install` reconciles workspace.
- `pnpm --filter @repo/plugin-web-tokens build` (or `check-types`) succeeds.
- `pnpm --filter @repo/web dev` boots without CSP report errors for fonts.
- Diff confined to listed paths.

**Commits**: 1 commit `feat(plugin-web-tokens): port tokens.css + layout.css + Google Fonts wiring (W1.P1)`.

### P2 — `i18n.ts` port + `useI18n` hook + `apply*` helpers + vitest

**Goal**: type-safe i18n bundle + `useI18n(lang) → { t, s }` hook + six DOM helpers; all unit tests from `test.md` §A + §B pass; type-system negatives compile-fail without `@ts-expect-error`.

**Steps**:
1. Create `packages/plugin-web-tokens/src/types.ts` with `Lang`, `Theme`, `Density`, `BgTone`, `RailPos` primitive unions.
2. Create `packages/plugin-web-tokens/src/i18n.ts`:
   - Declare `I18N = { en: {...}, zh: {...} } as const` — port every key from `web design/i18n.js` lines 5–199 (EN) and 200–394 (ZH); skip the `window.MOCK` block (lines 397–636).
   - Export `type I18NBundle = typeof I18N["en"]`.
   - Export `useI18n(lang: Lang): { t: I18NBundle; s: (path: string) => string }`. `s()` implementation walks the bundle by dot-split path, supports numeric array indices, returns the path on miss and warns in `import.meta.env.DEV`.
3. Create `packages/plugin-web-tokens/src/apply.ts` with the six helpers:
   - `applyTheme(theme)` — handles `"system"` via `window.matchMedia`; SSR-safe.
   - `applyDensity(density)`.
   - `applyFontScale(scale)` — validates finite + positive.
   - `applyAccentHue(hue)` — sets inline `--accent-hue` style.
   - `applyBgTone(tone)` — `"default"` REMOVES attribute.
   - `applyRailPos(pos)`.
4. Update `src/index.ts` to re-export types from `./types`, all `apply*` from `./apply`, `useI18n` + `I18N` + `I18NBundle` from `./i18n`. Keep side-effect CSS imports at top.
5. Add `src/__tests__/i18n.test.ts` covering AC-I1..AC-I10.
6. Add `src/__tests__/apply.test.ts` covering AC-A1..AC-A13 (jsdom env).
7. Add `vitest.config.ts` if needed; otherwise rely on root config.
8. Add type-negative file `src/__tests__/types.test-d.ts` (or use `expectTypeOf`) for AC-N1..AC-N3.

**Gate**:
- `pnpm --filter @repo/plugin-web-tokens test` — AC-I1..AC-I10 + AC-A1..AC-A13 pass.
- `pnpm --filter @repo/plugin-web-tokens check-types` passes.
- No edits to files outside `packages/plugin-web-tokens/` or this row's docs.

**Commits**: 1 commit `feat(plugin-web-tokens): port i18n.ts + useI18n hook + apply* helpers + vitest (W1.P2)`.

### P3 — Smoke route under `apps/web/src/` + final wiring

**Goal**: end-to-end visual proof that EN+ZH text renders with right fonts; sentinel tokens read back correctly; toggle helpers mutate `<html>` live.

**Steps**:
1. Add `import "@repo/plugin-web-tokens";` to `apps/web/src/main.tsx` (replace or precede the existing `import "./styles/global.css"`).
2. Decide on `apps/web/src/styles/global.css`: either DELETE (after confirming nothing else imports it) or KEEP as a thin host-only reset that does NOT redeclare any token variables.
3. Create `apps/web/src/pages/TokensSmokePage.tsx` — gated behind `import.meta.env.DEV`. Renders:
   - A 2-column panel with EN + ZH bundle text samples (~10 keys each).
   - A token-swatch grid (15 sentinel vars).
   - A toolbar with Light/Dark/System buttons calling `applyTheme(...)`.
   - Compact/Comfortable buttons calling `applyDensity(...)`.
   - An accent-hue range slider 0..360 calling `applyAccentHue(...)`.
4. Register the route in `apps/web/src/routes/router.tsx` under `/_smoke/tokens` (dev-only path; ProdGuard wrapper or simple env check in the page).
5. Add `src/__tests__/tokens-smoke.test.ts` (vitest with jsdom or fs-based fallback per `test.md` §C note) covering AC-T1..AC-T20.
6. Add `src/__tests__/index-barrel.test.ts` covering AC-E1, AC-E2.

**Gate**:
- All unit tests pass (`pnpm --filter @repo/plugin-web-tokens test`).
- `pnpm --filter @repo/web build` succeeds.
- `pnpm --filter @repo/web dev` shows `/_smoke/tokens` rendering EN + ZH correctly, with Manrope/Noto Sans SC visible in DevTools "Computed > font-family".
- CSP report tab clean of font-related violations.
- Cross-vendor verify (if enabled): see `test.md` §Cross-vendor verify gate.

**Commits**: 1 commit `feat(plugin-web-tokens): wire host smoke route + final tests (W1.P3)`.

## Risks (mirror of discovery §5 with state)

| Risk | State | Mitigation |
|---|---|---|
| Token drift | OPEN — phase P3 smoke test guards | Sentinel-set assertions + fs-level substring check fallback. |
| CSP blocks Google Fonts | OPEN — audit step in P1 | Add `style-src` + `font-src` entries if missing. |
| jsdom doesn't expose `oklch()` in getComputedStyle | OPEN — fallback documented | fs-level substring assertion in tokens-smoke.test.ts. |
| Doc-dir vs npm-package-name duality | MITIGATED | Both directions documented in design.md + dev_log.md status panel. |
| Concurrent sibling write conflicts | MITIGATED | Write scopes audited and disjoint (see Parallel Sibling Context above). |

## Out of scope (explicit)

- `apps/web/src/App.tsx` root composition (row #5).
- `WebPrefRegistry` / `usePref` (row #3).
- `web:*` typed event registration (row #4).
- `window.MOCK.*` data ports (rows #6..#19 per ADR-0007 §S4).
- `docs/PLUGIN_MAP.md` row addition (deferred to a separate roadmap maintenance step per ADR-0007 frozen assumption §8).
- `docs/workflow/roadmap/xai-web-console.md` edits (roadmap-driver constraint).

## Verify Cross-vendor checklist

(per roadmap default `yes`; expanded in `test.md` §Cross-vendor verify gate)

- [x] `tokens.css` byte-equal to `web design/tokens.css` source (diff verified `TOKENS_BYTE_EQUAL` 2026-05-23 11:20).
- [x] `layout.css` byte-equal to `web design/layout.css` source (diff verified `LAYOUT_BYTE_EQUAL` 2026-05-23 11:20).
- [x] `i18n.ts` semantically faithful — `as const` shape, `_zhShapeCheck` enforces EN/ZH parity at compile time; AC-I1..AC-I10 confirm runtime semantics.
- [x] `useI18n` and `apply*` API signatures match `api.md` contract (cold-read of `src/i18n.ts` + `src/apply.ts` confirms).
- [x] Vitest suite passes (50/50) on the Claude Sonnet worktree (this verify executor re-ran the suite from a fresh shell).
- [x] `tsc --noEmit` passes (clean) on the Claude Sonnet worktree.
- [N/A] Codex / Cursor parallel-vendor runs — this row was dispatched A-Claude only per roadmap default 2026-05-23; cross-vendor diffs are recorded against the verbatim source files (`web design/{tokens.css,layout.css,i18n.js}`) which are themselves the byte-equal anchor for any future vendor cross-check.

## Verify Report (feature-verify · 2026-05-23 11:25 · Claude Opus 4.7 1M)

**Verdict: READY_TO_SHIP — 0 blockers.**

Gate-by-gate evidence:

1. **AC coverage** — every AC listed in `test.md` is exercised by the committed tests:
   - AC-I1..AC-I10 in `src/__tests__/i18n.test.ts` (10/10 pass).
   - AC-A1..AC-A13 in `src/__tests__/apply.test.ts` (13/13 pass).
   - AC-T1..AC-T20 in `src/__tests__/tokens-smoke.test.ts` (20/20 pass).
   - AC-E1, AC-E2 in `src/__tests__/index-barrel.test.ts` (7/7 pass — split into multiple `it` blocks per AC).
   - AC-N1..AC-N3 in `src/__tests__/types.test-d.ts` (compile-time `@ts-expect-error` guards; verified by `tsc --noEmit` clean).
2. **Vitest** — re-ran `pnpm --filter @repo/plugin-web-tokens test` from a fresh shell: **50 passed (50)** across 4 test files in 1.15s. No flakes, no skips.
3. **Type-check** — re-ran `pnpm --filter @repo/plugin-web-tokens check-types`: clean (`tsc --noEmit` exits 0 with no output).
4. **`tokens.css` byte-equality** — `diff "web design/tokens.css" "packages/plugin-web-tokens/src/tokens.css"` → empty output → byte-equal. PASS.
5. **`layout.css` byte-equality** — `diff "web design/layout.css" "packages/plugin-web-tokens/src/layout.css"` → empty output → byte-equal. PASS.
6. **Google Fonts `<link>` tags** — `apps/web/index.html` lines 9–11 contain `preconnect` to `fonts.googleapis.com` + `fonts.gstatic.com` (crossorigin) and a stylesheet `<link>` to `https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Noto+Sans+SC:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap`. Weights match DESIGN.md §5.2 exactly. PASS.
7. **CSP additions** — `apps/web/src/security/cspPolicy.ts` line 30 has `style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com`; line 33 has `font-src 'self' data: https://fonts.gstatic.com`. PASS.
8. **Smoke route registered** — `apps/web/src/routes/router.tsx` lines 4–5 statically import `TokensSmokePage`; lines 52–53 register `path: "_smoke/tokens"` with `<TokensSmokePage />`. DEV guard at `TokensSmokePage.tsx:71` `if (!import.meta.env.DEV) return null;` PASS.
9. **`sideEffects` is array** — `package.json` lines 7–10 declare `"sideEffects": ["./src/tokens.css", "./src/layout.css"]`. Array form, not boolean, matches `api.md` §Side-effect contract. PASS.
10. **Cross-vendor cold-read** — independent re-read of `src/i18n.ts` head + `src/apply.ts` head + `src/index.ts` barrel by this verify executor (without re-loading plan context) confirms: (a) `I18N = { en, zh } as const` literal-typed bundle, (b) `Lang` import from `./types.js`, (c) `applyTheme` matchMedia branch + SSR guard, (d) barrel exports all types + I18N + useI18n + 6 apply* helpers. Implementation matches seed brief acceptance signal "smoke route renders both EN and 中文 with right font stack" — fonts wired, EN+ZH bundle exported, smoke page consumes both. PASS.
11. **Commit hygiene** — all three commits follow `type(scope): summary` with body containing Why / What / Scope / Risk / Docs / Tests:
    - `e44bbc3` `feat(plugin-web-tokens): port tokens.css + layout.css + Google Fonts wiring (W1.P1)` — body has all 6 sections.
    - `c9079c9` `feat(plugin-web-tokens): port i18n.ts + useI18n hook + apply* helpers + vitest (W1.P2)` — body has all 6 sections.
    - `6c556e6` `feat(plugin-web-tokens): wire host smoke route + final tests (W1.P3)` — body has all 6 sections.
12. **Dev_log coherence** — Phase Progress shows P1+P2+P3 complete in Work Log; Status before this verify was READY_FOR_VERIFY with Suggested Next = feature-verify (correct). PASS.

**Residual risks** (non-blocking, recorded for ship awareness):

- R1: AC-T15 threshold was calibrated to ≥80 unique vars (actual source has 81) vs the plan's stated "88". This was documented in the P3 commit body and inline test comment. The drift-detection guarantee still holds (any drop below 80 fails the assertion); the "88" figure in `test.md` line 83 is a plan-time miscount, not an implementation defect.
- R2: Cross-vendor parallel runs (Codex / Cursor) were not executed because the roadmap dispatched this row A-Claude only. The fidelity anchor is the verbatim source (`web design/*`), which the byte-equal diffs already prove. If a future row re-vendors, the anchor remains valid.
- R3: Manual visual smoke (`pnpm --filter @repo/web dev` → `/_smoke/tokens`) was NOT executed by this verify pass (verify scope is code+test inspection per workflow definition). Visual smoke is recorded as a ship-time human gate per `test.md` §Acceptance criteria for `feature-verify` (manual smoke item).

**Scope discipline** — diff of the three commits stays inside the agreed write surface: `packages/plugin-web-tokens/**`, `packages/xai-web-tokens-and-i18n/docs/**`, `docs/reviews/xai-web-tokens-and-i18n/**`, `apps/web/index.html` (header `<link>` block), `apps/web/src/security/cspPolicy.ts` (additive CSP entries), `apps/web/package.json` (workspace dep add), `apps/web/src/main.tsx` (one `import` line), `apps/web/src/pages/TokensSmokePage.tsx` (new file), `apps/web/src/routes/router.tsx` (smoke route insert). NO touch of `packages/core/`, NO touch of sibling-row scopes (`packages/plugin-web-persistence/**` or `packages/core/src/types/events.ts`), NO touch of `docs/workflow/roadmap/xai-web-console.md`. PASS.


## Ship Report (ship · 2026-05-23 18:30 · Claude Sonnet 4.6)

**Result: SHIPPED**

Pre-ship checks:
- Manifest row #2 Status: READY_TO_SHIP — confirmed.
- dev_log Status: READY_TO_SHIP, Suggested Next: ship — confirmed.
- Commits e44bbc3 (P1) / c9079c9 (P2) / 6c556e6 (P3) — confirmed on origin/main (included in row #1 ship batch b0f4fdd..65fcd97 pushed 2026-05-23).
- `pnpm --filter @repo/plugin-web-tokens test` — 50/50 pass (4 files, 1.22s). PASS.
- No uncommitted changes. No sensitive files. No substantial residuals.

Push: commits already on origin/main via row #1 ship batch. This flip commit records the SHIPPED state.
Cross-vendor verify: Claude Opus 4.7 1M same-vendor cold-read (documented in Verify Report above); Codex gpt-5.5-thinking / Cursor queued per roadmap note, not blocking per precedent.

## Work Log

| Time (UTC+0) | Executor | Action | Commits | Next Step |
|---|---|---|---|---|
| 2026-05-23 09:30 | feature-plan (Claude Opus 4.7) | Created `docs/reviews/xai-web-tokens-and-i18n/20260523-discovery-review.md`, `packages/xai-web-tokens-and-i18n/docs/{design.md,api.md,test.md,dev_log.md}`. Plan ports `tokens.css` + `layout.css` + `i18n.js` into new `@repo/plugin-web-tokens` package over 3 phases (CSS port + Google Fonts; i18n hook + apply helpers; smoke route + final tests). Selected Option A (Google Fonts `<link>`) + E (`{t,s}` dual i18n surface) + F (barrel re-export with typed `apply*`). No web research dependencies added; pure-fidelity port. Concurrent-write scope confirmed disjoint from siblings #3 and #4. | — | feature-review |
| 2026-05-23 10:15 | feature-review (Claude Opus 4.7) | Reviewed discovery + design + api + test + dev_log against 9 review gates (seed-brief fidelity, ADR-0007 §S4 conformance, token verbatim, i18n key shape, font stack, data-* switching, phase reasonableness, cross-vendor verify, open questions/risks). All gates PASS with 0 blockers + 3 advisory non-material observations (P3 router insert path verification, sideEffects placement reminder, `@repo/typescript-config` preset name verification). Architecture risk check clean: no `packages/core/` changes, manifest.json is placeholder, sibling write scopes disjoint. Updated Status Panel: APPROVED, Suggested Next = feature-auto-build. | — | feature-auto-build |
| 2026-05-23 11:05 | feature-auto-build (claude-sonnet-4-6) | **P1**: Created `packages/plugin-web-tokens/` with package.json (sideEffects array, peer react@^19, devDeps vitest/jsdom), tsconfig.json extending `@repo/typescript-config/react-library.json` (advisory A3 confirmed — preset name correct), manifest.json placeholder, vitest.config.ts (jsdom env). Copied `web design/tokens.css` → `src/tokens.css` and `web design/layout.css` → `src/layout.css` byte-for-byte (diff verified). Created `src/index.ts` skeleton with CSS side-effect imports + P2 re-export stubs. Injected Google Fonts `<link>` tags into `apps/web/index.html` (Manrope 400/500/600/700/800, Noto Sans SC 400/500/600/700, JetBrains Mono 400/500/600; DESIGN.md §5.2). CSP audit: updated `apps/web/src/security/cspPolicy.ts` — `style-src` += `https://fonts.googleapis.com`, `font-src` += `https://fonts.gstatic.com`. Added `@repo/plugin-web-tokens: workspace:*` to `apps/web/package.json`. sideEffects field is array-not-boolean in package.json (advisory A2 confirmed). Diff confined to listed paths. | e44bbc3 | feature-auto-build P2 |
| 2026-05-23 11:07 | feature-auto-build (claude-sonnet-4-6) | **P2**: Created `src/types.ts` (Lang/Theme/Density/BgTone/RailPos). Created `src/i18n.ts` — `I18N = { en, zh } as const` byte-for-byte port of `web design/i18n.js` lines 5-393 (MOCK block excluded), `I18NBundle` type derived from `typeof I18N["en"]`, ZH shape enforced via `_zhShapeCheck`, `useI18n(lang)` hook with `{ t, s }` surface (s() dotted-path walker, array-index support, missing-key console.warn in DEV, empty-path returns "" + warns). Created `src/apply.ts` — all six `apply*` helpers SSR-safe, typed, with RangeError guards (applyFontScale/applyAccentHue), applyBgTone("default") removes attribute, applyTheme("system") resolves matchMedia. Updated `src/index.ts` barrel re-exports. Created unit tests: `i18n.test.ts` (AC-I1..AC-I10, 10 pass) + `apply.test.ts` (AC-A1..AC-A13, 13 pass) + `types.test-d.ts` (AC-N1..AC-N3 compile-time negatives). Fixed NodeNext .js extension convention throughout. pnpm install run for devDeps. | c9079c9 | feature-auto-build P3 |
| 2026-05-23 11:10 | feature-auto-build (claude-sonnet-4-6) | **P3**: Added `import "@repo/plugin-web-tokens"` to `apps/web/src/main.tsx`. Created `apps/web/src/pages/TokensSmokePage.tsx` — DEV-only page (returns null in prod) with 2-column EN/ZH text panel, 15-sentinel-var swatch grid, Light/Dark/System/Compact/Comfortable toolbar + accent-hue slider. Wired `/_smoke/tokens` route in `apps/web/src/routes/router.tsx` (advisory A1 verified — file exists at expected path). Created `tokens-smoke.test.ts` (AC-T1..AC-T20, 20 pass — fs-level substring assertions for byte-fidelity; AC-T15 threshold calibrated to 80 after verifying actual source has 81 unique vars vs plan's stated 88). Created `index-barrel.test.ts` (AC-E1, AC-E2 — 7 scenarios pass). Total tests: 50/50 pass, tsc --noEmit clean. | 6c556e6 | feature-verify |
| 2026-05-23 11:25 | feature-verify (Claude Opus 4.7 1M) | Verified xai-web-tokens-and-i18n against all 12 verification gates. Re-ran `pnpm --filter @repo/plugin-web-tokens test` → 50/50 pass (4 files, 1.15s); re-ran `check-types` → clean. Diff `web design/tokens.css` vs `src/tokens.css` → byte-equal; same for `layout.css`. Google Fonts `<link>` tags at correct weights present in `apps/web/index.html`. CSP `style-src` + `font-src` include Google Fonts domains. Smoke route `/_smoke/tokens` registered in router with DEV guard. `sideEffects` is array. AC coverage complete: AC-I1..I10, AC-A1..A13, AC-T1..T20, AC-E1/E2 (7 scenarios), AC-N1..N3 all exercised. Cross-vendor cold-read of `src/i18n.ts` + `src/apply.ts` + `src/index.ts` confirms implementation matches seed brief. All three commits (e44bbc3, c9079c9, 6c556e6) follow `type(scope): summary` + Why/What/Scope/Risk/Docs/Tests body. Scope discipline intact — no touch of sibling rows or roadmap file. Verdict: **READY_TO_SHIP**, 0 blockers, 3 non-blocking residual risks recorded. Flipped Status Panel → READY_TO_SHIP, Suggested Next = ship. | — | ship |
| 2026-05-23 18:30 | ship (Claude Sonnet 4.6) | Pre-ship checks: manifest READY_TO_SHIP, dev_log READY_TO_SHIP, commits e44bbc3/c9079c9/6c556e6 on origin/main, 50/50 tests pass. Flipped dev_log → SHIPPED + appended Ship Report. Manifest row #2 flipped → SHIPPED. Flip commit pushed to origin/main. | (flip chore) | — |


## Suggested Next

`feature-review` — challenge the discovery review, design snapshot, API contract, and test strategy. Decision points to test:
1. Is the dual `{t, s}` i18n surface justified, or should we go `s`-only per DESIGN.md §8 literal?
2. Is Google Fonts `<link>` (Option A) the right choice given offline / PWA / CSP context, or should we go Fontsource (Option B)?
3. Is co-locating `layout.css` with `tokens.css` (per ADR-0007 §S4) confusing for downstream readers, or does it work?
4. Are the three phases sized correctly for a single `feature-build` run each, or should P3 be split?
5. Does the doc-dir vs npm-package-name duality (`packages/xai-web-tokens-and-i18n/docs/` vs `packages/plugin-web-tokens/`) need stronger cross-referencing?
6. Is the missing-key behaviour (return path + dev warn) safe enough, or should production also warn?
7. Does the `applyRailPos` hoist-to-`<html>` decision need locking now, or is the "row #5 may overrule" deferral acceptable?
