# Design Snapshot — xai-web-tokens-and-i18n

> Workflow row: `docs/workflow/roadmap/xai-web-console.md` #2 · Wave W1 · Foundation
> Discovery review: `docs/reviews/xai-web-tokens-and-i18n/20260523-discovery-review.md`
> Seed brief: `docs/reviews/xai-web-tokens-and-i18n/20260523-roadmap-seed.md`
> Gating ADR: `docs/adr/0007-xai-web-console-build-form.md` §S4 port mapping table
> Source PRD: `web design/DESIGN.md` §5 (Tokens), §7 (Personalisation), §8 (i18n), §10.2 (style truth source)
> Owner: `@repo/plugin-web-tokens` (npm package per ADR-0007 §S4)
> Doc tracking dir: `packages/xai-web-tokens-and-i18n/docs/` (Wave 1 roadmap dispatch convention)
> Status: PLAN_DRAFT → NEEDS_REVIEW
> Updated: 2026-05-23

---

## Decision Snapshot

- **Selected Option**: A (Google Fonts `<link>` in `apps/web/index.html`) + E (`{ t, s }` dual i18n hook surface) + F (barrel re-export with typed `apply*` helpers). See discovery review §3.
- **Review Doc Path**: `docs/reviews/xai-web-tokens-and-i18n/20260523-discovery-review.md`
- **Review Date**: 2026-05-23
- **Implementation Package**: `packages/plugin-web-tokens/` (npm name `@repo/plugin-web-tokens`)
- **Doc Tracking Package**: `packages/xai-web-tokens-and-i18n/docs/` (this directory; workflow source of truth)

## Frozen Assumptions

These assumptions are locked by this feature-plan; any change requires a new discovery pass.

1. **Token names + values** — every CSS variable name and oklch() / hex / px value in `packages/plugin-web-tokens/src/tokens.css` is a byte-for-byte port of `web design/tokens.css` (424 lines). Variable additions are permitted only if they preserve all 88 existing variable names with identical values. Any deviation is a discovery-review-level decision, not a build-phase decision.
2. **Layout primitives co-located** — `layout.css` lives in the same package as `tokens.css` per ADR-0007 §S4. Future split into a separate `@repo/plugin-web-layout` is permitted but is a follow-up ADR, not this row.
3. **i18n hook surface** — `useI18n(lang: Lang): { t: I18NBundle, s: (path: string) => string }`. Both `t` (structurally typed bundle) and `s()` (dotted-string accessor) MUST exist. Missing-key `s()` returns the path string itself and logs a console warning in dev. Empty implementation of `t` is not acceptable.
4. **i18n key paths** — `I18N.en.module.key` / `I18N.zh.module.key` dotted shape is preserved verbatim from `web design/i18n.js`. Module port can mechanically reuse string keys. The `weekdays_short` array is kept as `Array<string>` (length 7, Sun..Sat).
5. **Font families** — `'Manrope', 'Noto Sans SC', -apple-system, sans-serif` for sans; `'JetBrains Mono', ui-monospace, monospace` for mono. Loaded from Google Fonts via `<link>` tags in `apps/web/index.html`. Weights: Manrope 400/500/600/700/800, Noto Sans SC 400/500/600/700, JetBrains Mono 400/500/600.
6. **`data-*`-driven personalisation** — light/dark/system theme, density (Comfortable/Compact), font-scale (0.85..1.15), accent-hue (0..360), bg-tone (default/cream/mist/lavender/peach/graphite), rail-pos (left/right/top/bottom) are all driven by `data-*` attributes or inline `--accent-hue` / `font-size` on `<html>`, matching `web design/app.jsx`. The `apply*` helpers in `index.ts` are the canonical write path.
7. **No new state library** — `useI18n` is a pure hook (no Context provider required, but a thin `LangContext` MAY be added if `xai-web-shell` later prefers it; this row does NOT define the context). The hook is stateless: each call returns a fresh `{ t, s }` derived from the `lang` argument. Per ADR-0007 JSX→TSX rule #10.
8. **Out of scope** — `apps/web/src/App.tsx` (owned by row #5), `WebPrefRegistry`/`usePref` (row #3), `web:*` events (row #4), `window.MOCK.*` data (split across rows #6..#19 per ADR-0007 §S4).

## Dependency Overview

```
                ┌────────────────────────────────────────┐
                │   @repo/plugin-web-tokens (this row)   │
                │   ├── tokens.css   (88 CSS vars)       │
                │   ├── layout.css   (shell skeleton)    │
                │   ├── i18n.ts      (EN + ZH bundles)   │
                │   ├── useI18n      (hook)              │
                │   └── apply*       (DOM data-* setters)│
                └────────────────────────────────────────┘
                            ▲                  ▲
                            │                  │
                  side-effect CSS    typed import (no runtime dep)
                            │                  │
              ┌─────────────┴──────┐     ┌─────┴────────────────┐
              │ apps/web (host)    │     │ xai-web-shell (#5)   │
              │ main.tsx imports   │     │ Topbar/AppRail call  │
              │ once               │     │ useI18n + apply*     │
              └────────────────────┘     └──────────────────────┘
                                                ▲
                                                │
                                  every W2 module (#6..#19)
                                  imports useI18n only
```

**Upstream deps**: NONE. This row is foundational — no other workspace package is imported. React 19 (peer) is the only runtime dep.

**Downstream consumers** (advisory; consumed via npm workspace `@repo/plugin-web-tokens`):
- `apps/web/` (host shell) — imports `@repo/plugin-web-tokens` once in `main.tsx` for CSS side-effect + types.
- `xai-web-shell` (#5) — `useI18n`, `applyTheme`, `applyDensity`, `applyFontScale`, `applyAccentHue`, `applyBgTone`, `applyRailPos`.
- `xai-web-settings-appearance` (#22) — same `apply*` set + `useI18n` for setting-pane labels.
- All W2 modules (#6..#19) — `useI18n` only (read-only).

**No cross-plugin imports.** Per CLAUDE.md Code Boundaries: every cross-package consumer pulls only from the `@repo/plugin-web-tokens` index barrel.

**Cross-window contract**: NONE in this row. Tokens are global CSS variables (single-window scope by design). Language is passed as a prop / hook arg; cross-window lang propagation is the host shell's concern.

## File Tree (target)

```
packages/plugin-web-tokens/
  package.json                       # name=@repo/plugin-web-tokens, type=module, sideEffects=["./src/tokens.css","./src/layout.css"]
  manifest.json                      # plugin metadata (optional for Web plugins; placeholder)
  tsconfig.json                      # extends @repo/typescript-config/react-library.json
  src/
    index.ts                         # barrel: side-effect CSS + type re-exports + useI18n + apply*
    tokens.css                       # verbatim port of web design/tokens.css
    layout.css                       # verbatim port of web design/layout.css
    i18n.ts                          # EN + ZH bundles as const + I18NBundle type + useI18n hook
    apply.ts                         # applyTheme / applyDensity / applyFontScale / applyAccentHue / applyBgTone / applyRailPos
    types.ts                         # Lang / Theme / Density / BgTone / RailPos primitive unions
    __tests__/
      useI18n.test.ts                # dotted-path s() + structural t + missing-key warning
      apply.test.ts                  # data-* attribute and --accent-hue inline-style assertions
      tokens-smoke.test.ts           # getComputedStyle of ~15 sentinel tokens equals expected oklch / px

apps/web/index.html                  # +3 Google Fonts <link> + 1 <link rel="preconnect">
apps/web/src/main.tsx                # NO CHANGE in P1/P2; P3 OPTIONAL: switch global.css import to @repo/plugin-web-tokens
apps/web/src/styles/global.css       # P3 OPTIONAL: deprecate the 23-line placeholder
```

## Token Inventory (sentinel set; full port = 88 vars)

These 15 variables MUST round-trip across the port (smoke test P3 asserts):

| Var | Value | Origin |
|---|---|---|
| `--bg-app` | `oklch(96.5% 0.018 158)` | tokens.css L9 |
| `--bg-rail` | `oklch(63% 0.08 165)` | tokens.css L10 |
| `--accent-hue` | `165` | tokens.css L32 |
| `--accent-chroma` | `0.10` | tokens.css L33 |
| `--accent` | `oklch(60% var(--accent-chroma) var(--accent-hue))` | tokens.css L34 |
| `--text-1` | `oklch(22% 0.012 220)` | tokens.css L19 |
| `--fs-md` | `13.5px` | tokens.css L82 |
| `--s-4` | `16px` | tokens.css L93 |
| `--r-md` | `8px` | tokens.css L65 |
| `--shadow-2` | `0 4px 14px oklch(40% 0.02 220 / 0.06), 0 1px 2px oklch(40% 0.02 220 / 0.04)` | tokens.css L72 |
| `--dur-fast` | `140ms` | tokens.css L110 |
| `--ease-out` | `cubic-bezier(.22, 1, .36, 1)` | tokens.css L108 |
| `--rail-w` | `56px` | tokens.css L100 |
| `--topbar-h` | `48px` | tokens.css L105 |
| `--font-sans` | `'Manrope', 'Noto Sans SC', -apple-system, sans-serif` | tokens.css L76 |

Compact-density override (`[data-density="compact"]`): `--row-h: 30px`, `--card-pad-y: 7px`, `--fs-md: 12.5px` — also smoke-tested.

Dark-theme override (`[data-theme="dark"]`): `--bg-app: oklch(20% 0.012 200)`, `--text-1: oklch(96% 0.005 200)` — smoke-tested.

## i18n Bundle Inventory

Both languages port:
- `app_name` (top-level string)
- `nav` (14 module nav labels)
- `common` (~50 entries: today, tomorrow, weekdays, months, actions)
- `weekdays_short` (Array<string> length 7)
- 12 module namespaces: `tasks`, `habits`, `pomo`, `cal`, `matrix`, `countdown`, `settings`, `tag`, `avatar`, `board`, `dashboard`, `meditation`, `statistics`, `pet`
- `quotes` (Array<{author, text}> — 7 EN + 7 ZH)

Total: 13 top-level module keys × 2 languages.

`I18N` is declared `as const` so TS can derive `I18NBundle = typeof I18N["en"]` and downstream callers get full IntelliSense on `t.habits.title`. The ZH bundle is required to have the same key shape; type system enforces this (compile error if a key is missing).

## What is OUT of scope

- `apps/web/src/App.tsx` root composition — owned by `xai-web-shell` (#5).
- The `<html>` data-* attribute *application timing* (when in React lifecycle to call `applyTheme`) — this row only ships the **functions**; row #5 wires them.
- `window.MOCK.*` ports — owned by individual W2 module rows per ADR-0007 §S4.
- `WebPrefRegistry` / `usePref` — owned by row #3.
- `web:*` typed events — owned by row #4.
- `@repo/plugin-productivity` / `@repo/plugin-console` dead-dep cleanup — out of all xai-web-* rows per ADR-0007.

## Reasoning highlights

- **Why one package not three** — ADR-0007 §S4 explicit decision; CSS-only files have no JS surface needing separation; co-location avoids three near-empty packages and three Turborepo cache keys.
- **Why dual `{t, s}` API** — DESIGN.md §8 mandates `s(path)`; seed brief mentions both `t` and `s`; modern TypeScript can give compile-time leaf access via `t` while keeping `s` for runtime keys. Honoring both costs ~5 LOC.
- **Why Google Fonts `<link>` not Fontsource** — DESIGN.md §5.2 is explicit; CSP shape additive change is small and known-good (web-security-csp-sentry already shipped); deviation would require a paragraph in DESIGN.md update which is out of scope.
- **Why no Context for lang** — DESIGN.md §8 shows `useI18n(lang)` taking lang as a parameter; the hook does not own state. Row #5 (shell) owns `lang` state and passes it down. Avoids forcing every downstream module to wrap in a provider.
