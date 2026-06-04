# Design Snapshot — xai-web-countdown

> Decision crystal. Rationale lives in
> `docs/reviews/xai-web-countdown/20260523-discovery-review.md`. This file is
> intentionally short — it locks the picked option + frozen assumptions only.

## Selected Option

**Bundle:** S-A (single `target_date` ISO string · auto-flipped direction) +
D-B/D-C (midnight `setTimeout` + `visibilitychange` for live recompute) +
events-NONE (no `web:countdown:*` channels in v1) + U-A (native `<dialog>`
modal for create/edit/delete) + I-A (bundled CSS gradient presets persisted
as `"preset:<id>"`).

`@repo/plugin-web-countdown` is a leaf React package registering one slot into
`apps/web/src/routes/modules/shellRegistrations.tsx`. All cards persist
through `usePref("xai_countdowns")`. No edits to `@repo/plugin-web-storage`,
`@repo/core`, or `@repo/xai-web-event-bus` source files in this row.

## Review Doc Path

`docs/reviews/xai-web-countdown/20260523-discovery-review.md`

## Review Date / Version

2026-05-23 · v1 (W2 row #17 · parallel-Agent dispatch with siblings #13 / #19)

## Frozen Assumptions (10)

1. **Package name** — `@repo/plugin-web-countdown` (per ADR-0007 §S4 port map
   row `module-countdown.jsx`). Lives at `packages/plugin-web-countdown/`.
   Planning docs live under `packages/xai-web-countdown/docs/` per project
   convention (row-slug for planning artifacts; package-slug for the runtime
   package). When the build phase scaffolds the runtime package it MUST use
   `packages/plugin-web-countdown/`.

2. **Public surface (index.ts)** — exports `CountdownModule` (the route
   element), `countdownWebModuleRegistration` (`WebModuleSlotRegistration`
   produced by this package), type `CountdownCard`, type `CountdownVariant`,
   const `IMAGE_PRESETS`. Nothing else. `src/internal/` is package-private
   per CLAUDE.md §Code Boundaries.

3. **Card schema (locked, byte-for-byte storage shape)**

   ```ts
   type CountdownVariant = "image" | "light";
   interface CountdownCard {
     id: string;                   // createId-style, e.g. "cd_<base36>"
     title: { en: string; zh: string };
     target_date: string;          // ISO 8601 calendar date "YYYY-MM-DD"
     variant: CountdownVariant;    // "image" → gradient bg; "light" → light card
     cover_url: string | null;     // null when variant="light";
                                   // "preset:<id>" for bundled gradient
                                   // (future: real URL when user-upload lands)
   }
   ```

   Validated at storage boundary via `isCountdownCard(x)` predicate inside
   `src/internal/validate.ts`. Invalid entries from corrupted localStorage are
   filtered out with a DEV `console.warn` (silent in prod).

4. **Persistence flow** — single hook call in `CountdownModule`:
   `const [cards, setCards] = usePref("xai_countdowns")` from
   `@repo/plugin-web-storage`. **Zero** direct `localStorage.*` calls.
   The registry default (`[]`) is consumed as-is; no schema migrations declared
   for v1. The `proposed: true` flag on the registry entry stays (we are NOT
   renaming the key — `xai_countdowns` is kept).

5. **Live remaining-days strategy** — composable `useDaysUntil(target_date)`
   hook in `src/internal/useDaysUntil.ts`:
   - On mount: compute `days = floor((targetLocalMidnight - todayLocalMidnight) / 86400000)`.
   - Schedule one `setTimeout` per *module-level* hook (not per card) to fire
     at next local midnight + 1s. Callback recomputes for all visible cards
     (via a shared "today" date state) and reschedules. One timer, N cards.
   - `addEventListener("visibilitychange")` calls the same recompute on tab
     visibility return.
   - Cleanup clears timeout and removes listener on unmount.

6. **Direction handling** — derived at render time:
   `if (days >= 0) → countdown.days_until {label}` else
   `→ countdown.days_since {label}` with `days = Math.abs(days)`. The display
   label is `formatTargetLabel(target_date, lang)` produced by
   `src/internal/formatTargetLabel.ts` (returns `M/D` for current-year, `M/D/YY`
   for other years, per the prototype's compact format).

7. **Cross-module communication** — NONE in v1. No `emitWebEvent` calls.
   Future rows (Statistics #20, Dashboard widgets #11) may add channels in
   their own row; we intentionally do not declare `web:countdown:*` keys in
   `packages/core/src/types/events.ts`.

8. **UX surface (Add / Edit / Delete)** — native HTML `<dialog>` element
   opened via `dialogRef.current.showModal()`. Backdrop is a sibling `<div>`
   absolute-positioned scrim (NOT `::backdrop`) for cross-vendor parity. Form
   contents: Title (EN + ZH side-by-side), Target Date (`<input type="date">`),
   Variant (`<input type="radio">` × 2), Cover Preset picker (3-column grid of
   gradient swatches, visible only when variant="image"), Cancel + Save buttons,
   Delete button (only when editing an existing card). Modal closes on
   Escape or backdrop click.

9. **Image presets (cover_url values for variant="image")** — bundled in
   `src/internal/presets.ts`:

   | id | gradient | label_en | label_zh |
   |---|---|---|---|
   | `dusk` | `linear-gradient(160deg, #6c5b4b, #2c241e)` | "Dusk" | "暮色" |
   | `midnight` | `linear-gradient(160deg, #2a3d6b, #0e1a3a)` | "Midnight" | "夜空" |
   | `sand` | `linear-gradient(160deg, #cfb6a8, #8e7568)` | "Sand" | "沙色" |
   | `forest` | `linear-gradient(160deg, #3d5a3d, #1a2e1a)` | "Forest" | "森林" |
   | `peach` | `linear-gradient(160deg, #ffb38a, #c97058)` | "Peach" | "暖橙" |
   | `lavender` | `linear-gradient(160deg, #9a8ec7, #564b8a)` | "Lavender" | "薰衣草" |

   Storage form: `cover_url = "preset:<id>"`. Renderer:
   `if cover_url?.startsWith("preset:")` → look up table; else use
   `cover_url` directly via `background-image: url(<cover_url>)`. The
   `preset:` prefix is a stable contract — never rename.

10. **CSS surface** — port `web design/layout.css` lines 950–1019 (countdown
    block) into `packages/plugin-web-countdown/src/styles.css`. Tokens
    (`--bg-panel`, `--border-1`, `--r-lg`, `--shadow-2`, `--accent`,
    `--accent-ink`, `--fs-sm`, `--fs-xs`, `--text-2`, `--text-3`,
    `--font-mono`, `--dur-fast`, `--ease-out`) are already provided by
    `@repo/plugin-web-tokens` via the host's global `tokens.css` side-effect
    import. Module CSS is loaded via `import "./styles.css"` at the top of
    `src/index.ts` (Vite handles side-effect CSS).

## Out of Scope

- **User-upload of cover images** — deferred to DESIGN.md §13 Future.
- **Notification on countdown reaching zero** — `web-notifications` not in
  this roadmap.
- **Drag-reorder of cards** — prototype doesn't include reorder; not in
  acceptance signal. Cards render in insertion order.
- **Multi-card import/export** — not in acceptance signal.
- **Lunar / non-Gregorian calendar support** — prototype's `2/6 正月初一`
  compound string is intentionally not reproduced; ISO-only.
- **Editing emoji** — prototype hard-codes emoji by id (`🎏`/`🎈`/`🏮`); we
  drop emoji entirely from v1 (no emoji field in schema).
- **Statistics aggregation** — Statistics #20 reads its own counters; if it
  wants countdown counts later, it adds a `web:countdown:*` channel in its
  own row (this row does not pre-declare).
- **Persistence-registry type narrowing** — `Countdown = unknown` in
  `@repo/plugin-web-storage` stays as declared; tightening is a future
  persistence-contract follow-up row.

## Dependency Overview

```
@repo/plugin-web-countdown          (this row)
  ├── @repo/core                     (workspace:* — types only: WebModuleId)
  ├── @repo/plugin-web-tokens        (workspace:* — useI18n; CSS already in apps/web bundle via host)
  ├── @repo/plugin-web-storage       (workspace:* — usePref("xai_countdowns"))
  └── @repo/xai-web-shell            (workspace:* — type WebModuleSlotRegistration; type only)

devDeps:
  ├── @repo/eslint-config
  ├── @repo/typescript-config
  ├── @types/react ^19
  ├── @types/react-dom ^19
  ├── @testing-library/react ^16
  ├── jsdom ^26
  └── vitest ^3.2.1

peerDeps:
  └── react ^19, react-dom ^19
```

Host consumer (`apps/web/`) takes a workspace dep on `@repo/plugin-web-countdown`
and replaces the existing `placeholder("countdown", ...)` row in
`apps/web/src/routes/modules/shellRegistrations.tsx` with the imported
`countdownWebModuleRegistration` constant from this package.

## ADR Anchors

- `docs/adr/0007-xai-web-console-build-form.md` §S4 (port mapping row 17 — `module-countdown.jsx` → `packages/plugin-web-countdown/`)
- `docs/adr/0007-xai-web-console-build-form.md` §S5 (JSX→TSX 10 rules — full conformance)
- `docs/adr/0007-xai-web-console-build-form.md` §S7 (cross-module via `@repo/core/events` only — but this row emits nothing in v1)
- `docs/adr/0007-xai-web-console-build-form.md` §S8 (`xai_countdowns` proposed key kept; v1 uses it verbatim)

---

## V2 Countdown System Upgrade — 2026-06-04

### Product intent

Upgrade Countdown from a simple card grid into a formal time-planning module:
default presets, full post-create editing, multiple display styles, composable
countdown/progress modules, card/list/timeline/calendar/history views, and
history-safe persistence under the existing `xai_countdowns` key.

### Reference synthesis

- Apple HIG picker guidance: keep date/time editing in context and use compact
or graphical date entry according to space. Countdown V2 keeps native date/time
inputs inside the edit dialog instead of route-switching.
- Apple HIG progress guidance: countdown progress is determinate because start
and target dates are known. V2 uses exact clamped progress ratios and avoids
spinners for time progress.
- Notion-style progress: V2 includes a segmented Notion bar plus standard linear
and ring progress styles, all derived from the same `start_date` → target range.
- Mainstream countdown apps: V2 adds default date presets, per-card colors/icons,
pin/hide/copy/delete, progress bars, and history restore/copy flows.

### New UX surfaces

- Default presets: Christmas, New Year's Day, New year, Spring Festival,
  end of this month, start of next month, next year, quarter end, end of year.
- Views: Cards, Compact list, Timeline, Calendar, History.
- Card modules: countdown only, progress only, or countdown + progress.
- Layout options: stacked (top/bottom) or split (left/right).
- Display styles: digital, date, progress, Notion bar, ring, minimal, big number,
  festival, timeline, compact.
- History: deleted, hidden, and completed records can be restored or copied as
  a new countdown.

### Visual direction

Quiet Apple/Linear-style utility UI: restrained neutral surfaces, low-saturation
accent tokens, compact controls, tabular numbers, clear progress hierarchy, and
responsive grid/list density. No emoji field; icon choices use local light-line
SVG glyphs to match adjacent Web modules.
