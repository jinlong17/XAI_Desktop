# Test Strategy — xai-web-tokens-and-i18n

> Owner package: `@repo/plugin-web-tokens`
> Status: PLAN_DRAFT
> Updated: 2026-05-23
> Verify Cross-vendor: yes (per roadmap default)

This row is foundational (no upstream module deps); test strategy focuses on **portability fidelity**, **type-system enforcement**, and **DOM-mutation correctness**.

---

## Mock strategy

| Layer | Mocked? | Why |
|---|---|---|
| `window.matchMedia` (used by `applyTheme("system")`) | YES | jsdom does not implement `matchMedia` by default; tests stub it via `vi.stubGlobal("matchMedia", ...)` to control system theme branch. |
| `document.documentElement` attributes | NO | Verified directly against jsdom's real `<html>` element. |
| `console.warn` (missing-key warning) | YES | Spy via `vi.spyOn(console, "warn")` to assert call shape + args; restore in `afterEach`. |
| `import.meta.env.DEV` | YES | Forced to `true` in test setup so missing-key warning path is exercised. Production-only path tested separately by toggling. |
| Google Fonts CDN | NOT loaded | jsdom does not download external CSS; tests assert `<link>` tag PRESENCE in `apps/web/index.html` via fs read, not via runtime CSSOM. |
| `react-dom` / React 19 | NOT mocked | `useI18n` is a thin sync hook; tested via `renderHook` (`@testing-library/react`) or by calling the implementation function in a test wrapper. |
| `localStorage` | NOT touched | This row does NOT read or write localStorage. `xai_accent_hue` etc. are owned by row #5 (shell) and row #3 (persistence). |

No external HTTP and no Tauri calls — this is a Web-only design-system package.

## Unit coverage (Vitest)

### A. `i18n.test.ts` — `useI18n` semantics (10 scenarios)

| # | Name | Action | Expected |
|---|---|---|---|
| AC-I1 | EN typed access | `useI18n("en").t.app_name` | `"XAI Console"` |
| AC-I2 | ZH typed access | `useI18n("zh").t.app_name` | `"XAI 工作台"` |
| AC-I3 | EN nested module | `useI18n("en").t.habits.title` | `"Habits"` |
| AC-I4 | ZH nested module | `useI18n("zh").t.matrix.urgent_important` | `"紧急 · 重要"` |
| AC-I5 | EN dotted path | `s("nav.tasks")` | `"Tasks"` |
| AC-I6 | ZH dotted path | `s("settings.font_scale")` | `"字体大小"` |
| AC-I7 | Array index | `s("common.weekdays_short.0")` (EN) | `"Sun"` |
| AC-I8 | Quotes array element | `s("quotes.0.author")` (EN) | `"Lao Tzu"` |
| AC-I9 | Missing key returns path + warns | `s("nope.missing")` | returns `"nope.missing"`; `console.warn` called once with key+lang args |
| AC-I10 | Empty path returns "" + warns | `s("")` | returns `""`; `console.warn` called once |

### B. `apply.test.ts` — DOM helpers (12 scenarios)

| # | Name | Action | Expected DOM state |
|---|---|---|---|
| AC-A1 | `applyTheme("light")` | call | `<html data-theme="light">` |
| AC-A2 | `applyTheme("dark")` | call | `<html data-theme="dark">` |
| AC-A3 | `applyTheme("system")` w/ light media | stub matchMedia returns matches=false | `<html data-theme="light">` |
| AC-A4 | `applyTheme("system")` w/ dark media | stub matchMedia returns matches=true | `<html data-theme="dark">` |
| AC-A5 | `applyDensity("compact")` | call | `<html data-density="compact">` |
| AC-A6 | `applyDensity("comfortable")` | call | `<html data-density="comfortable">` |
| AC-A7 | `applyFontScale(0.85)` | call | `<html style="font-size: 13.6px">` (0.85 × 16) |
| AC-A8 | `applyFontScale(1.15)` | call | `<html style="font-size: 18.4px">` |
| AC-A9 | `applyFontScale(NaN)` | call | throws `RangeError` |
| AC-A10 | `applyAccentHue(295)` | call | `<html>` inline-style has `--accent-hue: 295` |
| AC-A11 | `applyBgTone("cream")` | call | `<html data-bg-tone="cream">` |
| AC-A12 | `applyBgTone("default")` | call after `applyBgTone("cream")` | `<html>` has NO `data-bg-tone` attribute |

Plus 1 rail-pos sanity test:
| AC-A13 | `applyRailPos("right")` | call | `<html data-rail-pos="right">` |

### C. `tokens-smoke.test.ts` — CSS variable port fidelity (15 + 3 + 2 = 20 scenarios)

Uses `getComputedStyle(document.documentElement)` after `import "@repo/plugin-web-tokens"` is exercised once per test file.

| # | Name | Var | Expected (substring or strict match) |
|---|---|---|---|
| AC-T1 | `--bg-app` light | `--bg-app` | matches `oklch(96.5% 0.018 158)` (whitespace-tolerant) |
| AC-T2 | `--accent-hue` default | `--accent-hue` | `"165"` |
| AC-T3 | `--accent-chroma` | `--accent-chroma` | `"0.10"` (or `"0.1"`) |
| AC-T4 | `--text-1` | `--text-1` | matches `oklch(22% 0.012 220)` |
| AC-T5 | `--fs-md` comfortable | `--fs-md` | `"13.5px"` |
| AC-T6 | `--s-4` | `--s-4` | `"16px"` |
| AC-T7 | `--r-md` | `--r-md` | `"8px"` |
| AC-T8 | `--shadow-2` | `--shadow-2` | non-empty string, matches `/14px/` |
| AC-T9 | `--dur-fast` | `--dur-fast` | `"140ms"` |
| AC-T10 | `--ease-out` | `--ease-out` | `"cubic-bezier(.22, 1, .36, 1)"` (whitespace-tolerant) |
| AC-T11 | `--rail-w` | `--rail-w` | `"56px"` |
| AC-T12 | `--topbar-h` | `--topbar-h` | `"48px"` |
| AC-T13 | `--font-sans` | `--font-sans` | matches `/Manrope/` AND `/Noto Sans SC/` |
| AC-T14 | `--font-mono` | `--font-mono` | matches `/JetBrains Mono/` |
| AC-T15 | Total token count | iterate `document.documentElement.style` rules indirectly | ≥ 88 variables defined |

Compact override scenarios (3):
| AC-T16 | After `applyDensity("compact")`, `--fs-md` | `"12.5px"` |
| AC-T17 | After `applyDensity("compact")`, `--row-h` | `"30px"` |
| AC-T18 | After `applyDensity("compact")`, `--card-pad-y` | `"7px"` |

Dark theme override (2):
| AC-T19 | After `applyTheme("dark")`, `--bg-app` | matches `oklch(20% 0.012 200)` |
| AC-T20 | After `applyTheme("dark")`, `--text-1` | matches `oklch(96% 0.005 200)` |

> **Note on jsdom limitations**: jsdom does NOT parse CSS variables into `getComputedStyle` for all properties. Mitigation: read via `document.documentElement.style.getPropertyValue("--bg-app")` after either (a) confirming jsdom v26 supports custom properties in inline-style reads, or (b) using a `style` element with `:root{...}` content injected via test setup. If neither works, fall back to **fs-level** parsing: read `packages/plugin-web-tokens/src/tokens.css` as text and assert substring presence of every sentinel value — this still catches token drift but loses the cascade test. Builder phase will pick the implementation that passes; both produce the same drift-detection guarantee.

### D. Negative / type tests (3 scenarios — compile-time, no runtime)

| # | Name | Action | Expected |
|---|---|---|---|
| AC-N1 | `t.nope` (missing key on typed bundle) | reference in test file as `// @ts-expect-error` | TS compile fails without the directive |
| AC-N2 | `useI18n("fr")` (bad lang) | reference as `// @ts-expect-error` | TS compile fails without the directive |
| AC-N3 | `applyDensity("ultra")` (bad density) | reference as `// @ts-expect-error` | TS compile fails without the directive |

These are surfaced via `tsc --noEmit` in the package's `check-types` script (Turborepo task).

### E. Index barrel smoke (2 scenarios)

| # | Name | Action | Expected |
|---|---|---|---|
| AC-E1 | Single import applies CSS | `import "@repo/plugin-web-tokens"` (no other reference) | sentinel token `--accent-hue` is queryable on `<html>` |
| AC-E2 | Repeated imports idempotent | import twice in two files | `--accent-hue` value unchanged; no duplicate `<style>` element |

## Contract coverage

- **Type contract** — `check-types` (tsc) in CI runs `pnpm --filter @repo/plugin-web-tokens check-types` and MUST pass. The `// @ts-expect-error` negatives in §D enforce that the type system actually catches the bad cases.
- **CSS-name contract** — fs-level assertion in `tokens-smoke.test.ts` reads `packages/plugin-web-tokens/src/tokens.css` text and asserts presence of each sentinel substring (the 15 listed in `design.md` token inventory).
- **i18n-shape contract** — `i18n.test.ts` includes the structural test: TypeScript `satisfies` ensures every EN key has a ZH counterpart (compile-time only — `I18N satisfies Record<Lang, I18NBundle>` will fail if ZH is missing a leaf).

## Cross-vendor verify gate (per roadmap default `yes`)

Verify phase MUST confirm:

1. `tokens.css` byte-equal across Claude/Codex/Cursor outputs.
2. `layout.css` byte-equal across all three.
3. `i18n.ts` semantically equal: same key set, same string values; whitespace tolerance permitted.
4. Same `useI18n` / `apply*` API signature on all three.
5. Same vitest suite passes on all three (run `pnpm --filter @repo/plugin-web-tokens test` in each vendor's worktree).
6. `tsc --noEmit` passes on all three.

Verify executor records vendor diff in feature-verify report.

## E2E / regression scenarios

This row has no GA acceptance suite beyond the unit tests. P3 ships a **smoke route under `apps/web/src/`** (e.g. `apps/web/src/pages/TokensSmokePage.tsx` reachable at `/_smoke/tokens` for dev only, gated behind `import.meta.env.DEV`) that renders:

- All 88 CSS variables as a swatch / chip grid.
- A 2-column EN / ZH text panel showing `t.app_name`, `t.nav.*`, `t.habits.title`, `t.dashboard.good_morning`, `t.matrix.urgent_important`, `t.quotes[0]`.
- Light/Dark/Compact/Comfortable toggle that calls `applyTheme/Density`.

The smoke route is **transient infrastructure**: it MAY be deleted at the end of P3 or kept as a `/_smoke/*` permanent fixture (builder phase decides; the cost of keeping is ~150 LOC). If deleted, the unit tests in §A/§B/§C remain the only guard.

## Acceptance criteria for `feature-verify`

- [ ] `pnpm --filter @repo/plugin-web-tokens test` — all scenarios in §A + §B + §C + §E pass.
- [ ] `pnpm --filter @repo/plugin-web-tokens check-types` — passes (including `@ts-expect-error` negatives in §D).
- [ ] `pnpm --filter @repo/plugin-web-tokens build` — produces a publishable artifact (CSS preserved, types `.d.ts` emitted).
- [ ] `apps/web/index.html` includes the three Google Fonts `<link>` tags + `<link rel="preconnect">`.
- [ ] `apps/web/src/main.tsx` imports `@repo/plugin-web-tokens` (or its CSS) — confirms host-shell wiring.
- [ ] Manual smoke (P3 route) renders EN + ZH text with Manrope + Noto Sans SC visible; Compact toggle shrinks row heights; Dark toggle inverts surface; accent hue slider changes accent color live.
- [ ] CSP audit: `apps/web/src/security/cspPolicy.ts` either already permits `https://fonts.googleapis.com` (style-src) + `https://fonts.gstatic.com` (font-src) OR has been updated to permit them in P1. No CSP report in dev console for fonts.
- [ ] Cross-vendor verify (if enabled) — see §Cross-vendor verify gate.

## Acceptance criteria for `ship`

All `feature-verify` ACs plus:

- [ ] `dev_log.md` Status = `READY_TO_SHIP`.
- [ ] Commit messages follow `type(scope): summary` per `docs/conventions/COMMIT_CONVENTION.md` with bodies including Why / What / Scope / Risk / Docs / Tests.
- [ ] Scope diff confined to `packages/plugin-web-tokens/**` + `apps/web/index.html` (header `<link>` block additions) + `packages/xai-web-tokens-and-i18n/docs/**` + `docs/reviews/xai-web-tokens-and-i18n/**` + (P3 optional) `apps/web/src/main.tsx` + `apps/web/src/styles/global.css` + `apps/web/src/pages/TokensSmokePage.tsx` + `apps/web/src/routes/router.tsx` smoke-route insert.
- [ ] No edits to `packages/core/**`, `apps/desktop/**`, `packages/plugin-*` other than `plugin-web-tokens`.
- [ ] No edits to `docs/workflow/roadmap/xai-web-console.md` (roadmap-driver constraint).
- [ ] PLUGIN_MAP.md row addition is deferred to a separate roadmap maintenance step; this row does not edit PLUGIN_MAP.md (per ADR-0007 frozen assumption §8).

## Failure-mode handling

| Failure | Likely cause | Recovery |
|---|---|---|
| jsdom rejects `oklch()` in `getComputedStyle` | jsdom version | Fall back to fs-level substring assertion in §C. |
| `pnpm --filter @repo/plugin-web-tokens test` cannot find `jsdom` | new package not yet in workspace devDeps | Add `jsdom` + `@types/jsdom` to `plugin-web-tokens` `devDependencies`; run `pnpm install`. |
| Vite dev server can't load `@repo/plugin-web-tokens` | sideEffects field misformed | Ensure `"sideEffects": ["./src/tokens.css", "./src/layout.css"]` is exact (array, not boolean). |
| CSP blocks Google Fonts in dev | dev nonce + style-src too strict | Update `apps/web/src/security/cspPolicy.ts` style-src to add `https://fonts.googleapis.com`; font-src to add `https://fonts.gstatic.com`. Re-run `pnpm dev`. |
| `--accent-hue` not picked up by `:root` | CSS specificity / declaration order | Confirm `:root { --accent-hue: 165; }` precedes the `oklch(... var(--accent-hue))` references; matches `web design/tokens.css` order. |
