# Discovery Review — xai-web-tokens-and-i18n

> Roadmap row: `docs/workflow/roadmap/xai-web-console.md` #2 · Wave W1 · Foundation
> Seed brief: `docs/reviews/xai-web-tokens-and-i18n/20260523-roadmap-seed.md`
> Gating ADR: `docs/adr/0007-xai-web-console-build-form.md` (Accepted 2026-05-23, READY_TO_SHIP per #1)
> Source PRD: `web design/DESIGN.md` §5 (Tokens), §7 (Personalisation), §8 (i18n), §10.2 (style truth source)
> Source code: `web design/tokens.css` (424 lines), `web design/layout.css`, `web design/i18n.js` (637 lines incl. MOCK)
> Generated: 2026-05-23
> Executor: feature-plan (Claude Opus)
> Parallel siblings: #3 `xai-web-persistence-contract`, #4 `xai-web-event-bus` (concurrent feature-plan; no shared writes)

---

## 1. Problem framing

ADR-0007 §S4 (port mapping table) freezes the target paths for this row:

| Prototype file | Target path | Notes (per ADR-0007) |
|---|---|---|
| `web design/tokens.css` | `packages/plugin-web-tokens/src/tokens.css` + `index.ts` re-export | Side-effect CSS import + typed token-name TS module |
| `web design/layout.css` | `packages/plugin-web-tokens/src/layout.css` (same package) | "Same package — both are pure CSS infra, no JS interface; co-location avoids a second micro-package" |
| `web design/i18n.js` | `packages/plugin-web-tokens/src/i18n.ts` + `useI18n` hook | Eliminate window-global; typed `Record<Lang, Record<Module, Record<Key, string>>>`; `useI18n(lang)` returns `{ s(key) }` per DESIGN.md §8 |

Open decisions left to **this** row's feature-plan (ADR-0007 does not lock them):

1. **Package name and slug.** ADR-0007 §S4 names `@repo/plugin-web-tokens` (singular). Roadmap doc-tracking dir is `packages/xai-web-tokens-and-i18n/`. Decision: doc tracking dir = `packages/xai-web-tokens-and-i18n/docs/` (per dispatch instruction); implementation package = `packages/plugin-web-tokens/` per ADR §S4. **This is intentional duality**: ADR §S4 freezes the npm package name; the roadmap dispatch freezes the doc folder. Both must exist simultaneously and link to each other.
2. **i18n hook surface.** DESIGN.md §8 says `const { s } = useI18n(lang); s("habits.title")`. Seed brief says "returns `t` and `s(path)`". We resolve to surface BOTH: `s(path)` (dotted-string accessor, lossy-typed string return) AND `t` (the raw bundle for the active language, structurally typed). See §3.
3. **Font loading mechanism.** Two viable options (see §2.A).
4. **MOCK data placement.** `web design/i18n.js` co-locates `window.MOCK` (BOARDS / habits / countdowns / etc.) with `window.I18N`. ADR-0007 §S4 splits these: `board-data.js` (→ `packages/plugin-web-board-core/src/seed/board-data.ts`) ≠ `i18n.js`. Decision: this row ports **`window.I18N` only** + the `quotes` arrays (which are pure i18n text, owned by EN/ZH bundles). `window.MOCK.*` is **out of scope** for this row and is owned by each downstream module's feature-plan via ADR-0007 §S4.

Out of scope for this row (per ADR-0007 §S4 ownership):
- `apps/web/src/App.tsx` root composition — owned by `xai-web-shell` (row #5).
- `<html>` data-* attribute application — only utility hooks; the runtime wiring lives in `xai-web-shell` per ADR-0007 §S4 `app.jsx` row.
- All `window.MOCK.*` mock data — split across `xai-web-board-core`, `xai-web-tasks`, `xai-web-habits`, etc.
- `WebPrefRegistry` / `usePref()` — owned by row #3 `xai-web-persistence-contract` (ADR-0007 frozen assumption §5).
- `web:<module>:<verb>-<noun>` event channel declarations — owned by row #4 `xai-web-event-bus`.

## 2. Candidate options

### Option A — Font loading: Google Fonts `<link>` in `apps/web/index.html` (selected)

Add three Google Fonts `<link rel="preconnect">` + `<link rel="stylesheet">` tags to `apps/web/index.html` for Manrope (400/500/600/700/800), Noto Sans SC (400/500/600/700), JetBrains Mono (400/500/600).

**Pros**
- Matches `web design/index.html` mechanism exactly (per DESIGN.md §5.2 expectations).
- `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` is the recommended pattern (parallel DNS + TLS).
- Zero build-time impact; CSP only needs `style-src https://fonts.googleapis.com` + `font-src https://fonts.gstatic.com`.
- Web research (2026): Google Fonts `<link>` remains the simplest path; the official guidance still recommends it for sites that don't ship offline. See [Google Fonts: Getting Started](https://developers.google.com/fonts/docs/getting_started).

**Cons**
- External CDN dependency at runtime (acceptable: matches prototype; `apps/web/` is already CDN-fed for Sentry).
- CSP must permit `fonts.googleapis.com` (style-src) and `fonts.gstatic.com` (font-src). `web-security-csp-sentry` already SHIPPED; we audit but expect no change.
- Web fonts FOUT before first paint. Mitigated by `font-display: swap` (Google Fonts default since 2021).

### Option B — Font loading: `@fontsource/manrope` + `@fontsource/noto-sans-sc` + `@fontsource/jetbrains-mono` self-hosted

Install three Fontsource packages, import as `@fontsource/manrope/400.css` etc. in `tokens.css` (via `@import`) or in `index.ts`.

**Pros**
- No external runtime CDN call. CSP can remain strict (no `font-src` whitelist needed).
- Tree-shakable per weight.
- Offline PWA / service-worker friendlier (already SHIPPED via `web-todo-first-slice` etc.).
- Web research (2026): Fontsource v5 supports modern formats (woff2 only), maintained at github.com/fontsource/fontsource, MIT licensed, ~10M weekly downloads. See [Fontsource v5 release notes](https://fontsource.org/docs/getting-started/introduction).

**Cons**
- Adds ~3 deps + 3 weight files × 3 families ≈ 9 imports to manage; bundle weight grows (~120KB of woff2).
- DESIGN.md §5.2 explicitly lists Google Fonts; deviation requires note.
- Migration cost if user later wants the prototype's exact Google rendering.

### Option C — Font loading: `<link>` via `<head>` injected by `tokens.css` `@import url('https://fonts.googleapis.com/...')`

Put Google Fonts URL inside `tokens.css` as `@import` at the top of file.

**Pros**
- One file owns all design-system inputs.

**Cons**
- `@import` in CSS blocks parallel download (well-known anti-pattern — see [MDN: @import performance note](https://developer.mozilla.org/en-US/docs/Web/CSS/@import#performance)).
- Cannot use `preconnect`.
- Slower FCP than `<link>` in head.

**Decision: A (Google Fonts `<link>` in `apps/web/index.html`)**.

Rationale: matches prototype-PRD (DESIGN.md §5.2 mandate), zero novel infrastructure, CSP additive change is small and `web-security-csp-sentry` is SHIPPED so we know its shape. Option B is recorded as a clean follow-up if the project later moves to fully-offline / strict-CSP posture; the migration would be local to this single package.

### Option D — i18n hook surface: `s(path)` only (DESIGN.md §8 literal)

Return only `s(path)` accessor.

**Pros**
- Matches DESIGN.md §8 verbatim.
- Smallest API surface.

**Cons**
- Loses the seed brief's `t` surface ("returns `t` and `s(path)`").
- TypeScript can't follow `s("habits.title")` to its leaf string literal without literal-type tricks; complete autocomplete via dotted-string requires template-literal types and significant compile-time cost (web research 2026: TypeScript template-literal-type i18n libraries like `typesafe-i18n` and `tolgee` ship dotted-path autocomplete but require codegen). We accept lossy `string` return + structural `t` for typed leaf access.

### Option E — i18n hook surface: `{ t, s }` dual API (selected)

Return `{ t, s }` where:
- `t: I18NBundle[Lang]` — the active language bundle (structurally typed for `t.habits.title`, `t.common.today`, etc.). Used when caller wants type-safe direct access.
- `s(path: string): string` — dotted-path accessor (`s("habits.title")` → string). Used when caller wants DESIGN.md §8 verbatim or has a runtime-computed key. Missing-key behaviour returns the path string itself plus a console warning (parity with prototype's empty-string-then-fall-through behaviour, observable for debugging).

**Pros**
- Honours both DESIGN.md §8 and seed brief.
- Typed-access (`t.habits.title`) gives compile-time guarantee; `s()` gives runtime flexibility.
- Pattern echoed in many production i18n libs (`react-i18next`'s `t` + `i18next.t`).
- Web research (2026): `react-i18next` (~6M weekly downloads, MIT, actively maintained), `formatjs/react-intl` (~2M weekly, also MIT) both expose dotted-path string accessors — pattern is industry standard. See [react-i18next docs](https://react.i18next.com/) and [FormatJS react-intl](https://formatjs.io/docs/react-intl/).

**Cons**
- Two patterns to teach. We mitigate with one example in `api.md` showing when to use which.

### Option F — i18n module structure: barrel re-export with namespaces (recommended pattern)

`packages/plugin-web-tokens/src/index.ts` exports:
- Side-effect: `import "./tokens.css"; import "./layout.css";` — applies CSS variables globally.
- `useI18n(lang)` hook.
- `applyTheme`, `applyDensity`, `applyFontScale`, `applyAccentHue`, `applyBgTone`, `applyRailPos` — small typed helpers that set the corresponding `data-*` attribute or CSS variable on `document.documentElement`. These are utility primitives consumed by `xai-web-shell` (row #5) and `xai-web-settings-appearance` (row #22). They have no upstream module deps and live here because they belong to the design-system layer.
- Type re-exports: `Lang = "en" | "zh"`, `I18NBundle`, `I18NKey<M>`, `Theme`, `Density`, `BgTone`, `RailPos`.

**Decision: F (barrel re-export + typed utilities).** Pattern is conventional for monorepo design-system packages and gives a single import surface for downstream consumers.

## 3. Recommended approach

Selected combination: **A + E + F**.

Implementation package: `packages/plugin-web-tokens/`. Doc tracking package: `packages/xai-web-tokens-and-i18n/docs/` (per Wave 1 dispatch, both exist; doc dir is the workflow source of truth for this row).

Public surface (TypeScript):

```ts
// @repo/plugin-web-tokens — index.ts
import "./tokens.css";       // side-effect: defines all CSS variables
import "./layout.css";       // side-effect: defines .app + .app-rail + module shells

export type Lang = "en" | "zh";
export type Theme = "light" | "dark" | "system";
export type Density = "comfortable" | "compact";
export type BgTone = "default" | "cream" | "mist" | "lavender" | "peach" | "graphite";
export type RailPos = "left" | "right" | "top" | "bottom";

export interface I18NBundle { /* full typed tree: app_name, nav, common, weekdays_short, ... */ }
export const I18N: Record<Lang, I18NBundle>;

export function useI18n(lang: Lang): {
  t: I18NBundle;
  s: (path: string) => string;
};

export function applyTheme(theme: Theme): void;
export function applyDensity(density: Density): void;
export function applyFontScale(scale: number): void;   // 0.85..1.15
export function applyAccentHue(hue: number): void;     // 0..360
export function applyBgTone(tone: BgTone): void;
export function applyRailPos(pos: RailPos): void;
```

Token names (`--bg-app`, `--accent`, `--accent-hue`, `--fs-md`, `--s-4`, `--r-md`, `--shadow-2`, `--dur-fast`, `--ease-out`, `--rail-w`, `--topbar-h`, etc.) ported **verbatim** from `web design/tokens.css`. The oklch() values are copied byte-for-byte; visual diff is the smoke test.

Font loading: Add three Google Fonts `<link>` tags + one `<link rel="preconnect">` to `apps/web/index.html` (head). Weights per DESIGN.md §5.2:
- Manrope: 400, 500, 600, 700, 800
- Noto Sans SC: 400, 500, 600, 700
- JetBrains Mono: 400, 500, 600

`@font-face` declarations are NOT added to `tokens.css` — Google Fonts ships them. `tokens.css` only references the families by name in `--font-sans` and `--font-mono`.

### Cross-vendor verify hook (per roadmap default `Verify Cross-vendor: yes`)

Strict cross-vendor verify gate stays opt-in for the verify phase. For planning purposes we record:
- Codex equivalence check: same `packages/plugin-web-tokens/src/{tokens.css,layout.css,i18n.ts,index.ts}` files, identical TS types, identical CSS variable names. Codex executor runs the same Vitest suite.
- Cursor equivalence check: same.
- Verify gate condition: byte-equal `tokens.css` + `layout.css` payloads across vendors; type-check parity; identical `useI18n` API shape.

## 4. Tradeoffs (summary table)

| Axis | Selected | Rejected | Reason |
|---|---|---|---|
| Font delivery | Google Fonts `<link>` | Fontsource self-host / CSS `@import` | DESIGN.md §5.2 mandate + tested CSP shape |
| i18n hook | `{ t, s }` | `s` only | Seed brief + structural type access |
| Package layout | tokens + layout + i18n co-located | three micro-packages | ADR-0007 §S4 mandate |
| CSS approach | side-effect import of raw `.css` | CSS Modules / styled-components | ADR-0007 JSX→TSX rule #9 (forbidden) |
| Token type-safety | string literals only via re-export | full template-literal autocomplete | Codegen cost not worth it for this row |
| Mock data port | i18n only (incl. `quotes` arrays) | bundle `window.MOCK` here | ADR-0007 §S4 splits `board-data.js` etc. into other rows |

## 5. Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Token drift (oklch values mis-typed) | Low | High (visual regression) | Phase P3 smoke test renders a token-swatch route; vitest diffs against snapshot of `:root` getComputedStyle for ~15 sentinel tokens. |
| CSP blocks Google Fonts | Medium | High (no fonts) | Audit current `apps/web/src/security/cspPolicy.ts` in P1; add `style-src https://fonts.googleapis.com` + `font-src https://fonts.gstatic.com` if missing. Coordinate with `web-security-csp-sentry`. |
| `useI18n` returning string on missing key swallows bugs | Low | Medium | Console warn in dev when key not found; tests assert warning fired. |
| Co-locating `layout.css` mixes "design-system primitives" with "shell layout" (semantic) | Low | Low | Acceptable per ADR-0007 §S4 explicit decision. Future split possible without API change. |
| Doc-dir vs npm-package-name duality confuses readers | Medium | Low | Both `design.md` files (this dir AND `packages/plugin-web-tokens/docs/` if created later) link to each other. Builder phase MAY create a sym-doc-pointer in the implementation package; not in scope here. |
| FOUT on cold load shifts layout | Medium | Low | `font-display: swap` is Google Fonts default since 2021. Manrope and Noto Sans SC have similar x-heights; CLS impact <0.05 expected. |
| `t` typed access requires deep `as const` discipline | Low | Medium | Phase P2 declares `I18N = { en: {...}, zh: {...} } as const`; types derived via `typeof` and key constraints. |
| Concurrent sibling rows (#3, #4) edit shared files | None | — | Confirmed: this row writes only `apps/web/index.html` (header `<link>` block additions, no overlap with #3/#4) + `packages/plugin-web-tokens/**`. No shared file with #3 (`packages/plugin-web-persistence-*`) or #4 (`packages/core/src/types/events.ts`). |

## 6. Open questions (none blocking)

- **Q1 (advisory)**: Should `apps/web/src/styles/global.css` be removed (the existing 23-line placeholder) once `tokens.css` lands? Decision deferred to P3 — likely yes, with `main.tsx` import switching from `./styles/global.css` to `@repo/plugin-web-tokens`. Not blocking; can be a one-liner change in P3.
- **Q2 (advisory)**: Does the typed-event-bus rule require us to register a `web:tokens:lang-change` event when language flips? Decision: NO. Language state is owned by `xai-web-shell` (`app.jsx` row), not by tokens. The hook is read-only against the `lang` parameter. Cross-window propagation (if any) is a `xai-web-shell` concern.
- **Q3 (advisory)**: Does `i18n.ts` export `quotes` as part of `I18NBundle`? YES — `quotes` is part of DESIGN.md §8 i18n contract (text content varies per language); see `web design/i18n.js` lines 157–164 (EN) and 351–358 (ZH). It is the only `window.I18N`-resident array port.

## 7. Web research evidence (per dispatch §technology selection rule)

Queries performed (2026-05-23):

- "Google Fonts 2026 preconnect best practice" → confirmed `<link rel="preconnect">` to `fonts.googleapis.com` AND `fonts.gstatic.com` (with `crossorigin`) remains best practice; `font-display: swap` is default. Source: [Google Fonts docs](https://developers.google.com/fonts/docs/getting_started).
- "fontsource v5 monorepo react vite 2026" → `@fontsource/*` v5 packages support woff2-only modern subset; vite-friendly via direct CSS import. License MIT, ~10M weekly downloads. Source: [Fontsource v5 release notes](https://fontsource.org/docs/getting-started/introduction).
- "react-i18next vs formatjs intl 2026" → both actively maintained, both expose dotted-path accessors. We do NOT adopt either: our scope is too small and DESIGN.md §8 is too prescriptive to justify the dep. Pattern is industry-standard, validating Option E.
- "typescript template literal type i18n autocomplete 2026 typesafe-i18n" → libraries exist but require codegen; not justified for 2-language static bundle. Source: [typesafe-i18n](https://github.com/ivanhofer/typesafe-i18n).
- "oklch color browser support 2026 caniuse" → ~94% global support as of Q2 2026 (Safari 15.4+, Chrome 111+, Firefox 113+). Acceptable for a desktop-class console; this is also already accepted by DESIGN.md §5.1 (prototype uses oklch throughout). Source: [caniuse.com oklch](https://caniuse.com/?search=oklch).

No external dep is being added by this row. The technology research confirms that our zero-dep, prototype-fidelity approach is industry-aligned, not an anti-pattern.

## 8. Recommendation

**Adopt Option A + E + F as the implementation plan.** Three-phase build:

- **P1** — Port `tokens.css` + `layout.css` byte-for-byte into `packages/plugin-web-tokens/src/`. Wire Google Fonts `<link>` into `apps/web/index.html`. Confirm CSP allows Google Fonts. Skeleton `index.ts` re-exports CSS as side-effect.
- **P2** — Port `i18n.js` → `i18n.ts` with full `I18NBundle` typing (`as const` chain). Implement `useI18n(lang)` returning `{ t, s }`. Add typed `apply*` helpers for `data-*` attributes. Vitest unit tests for `s()` dotted-path resolution + missing-key warning.
- **P3** — Smoke route under `apps/web/src/pages/` (transient — may be merged into existing routes or deleted post-verify) renders sample text in EN + ZH + a sentinel token swatch grid. Vitest assertion: `getComputedStyle(document.documentElement).getPropertyValue("--accent-hue")` matches expected; both `t.app_name` strings render correctly. Optionally remove `apps/web/src/styles/global.css` placeholder.

Status after this discovery: ready for `feature-review` to challenge the plan; this document is the input to review.

---

## Sources

- [Google Fonts Getting Started](https://developers.google.com/fonts/docs/getting_started)
- [Fontsource v5 release notes](https://fontsource.org/docs/getting-started/introduction)
- [react-i18next docs](https://react.i18next.com/)
- [FormatJS react-intl](https://formatjs.io/docs/react-intl/)
- [typesafe-i18n](https://github.com/ivanhofer/typesafe-i18n)
- [caniuse oklch](https://caniuse.com/?search=oklch)
- [MDN: @import performance note](https://developer.mozilla.org/en-US/docs/Web/CSS/@import#performance)
