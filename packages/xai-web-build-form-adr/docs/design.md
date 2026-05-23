# xai-web-build-form-adr — Design Snapshot

> ADR-only feature. The "product" of this feature is a single Accepted ADR file
> at `docs/adr/0007-xai-web-console-build-form.md`. No application code is
> written; downstream `xai-web-*` rows (tokens, persistence, event-bus, shell,
> 14 modules, statistics, settings) consume the ADR as their contract.

## Selected Option

**Option C — Vite + TS migration into `apps/web/src/` + new `packages/plugin-web-<module>/` packages, with the `web-ticktick-parity` platform spine reused intact and the four conflicting PENDING parity rows hand-paused.**

Rejected alternatives (recorded in the ADR body):

- **Option A** — Keep `web design/*.jsx` as Babel-standalone flat files and ship them from `apps/web/public/`. Rejected: no type safety, no Sentry source-maps, no tree-shake, no CSP nonce path, blocks `@repo/web-auth-device-session` device-id injection.
- **Option B** — Port modules into `apps/web/src/modules/<name>/` folders only (no new packages). Rejected: violates the CLAUDE.md `Code Boundaries` rule that requires business logic in `packages/plugin-*/`, not `apps/desktop/src/` (apps/web is the symmetric web host shell — same rule applies); also blocks any future overlay/console reuse.
- **Option D** — Extend existing `@repo/plugin-productivity` and `@repo/plugin-console` (already deps of `apps/web/package.json`) to absorb Tasks / Pomodoro / Habits / Calendar / Board. Rejected: the `web design/DESIGN.md` v1.0 surfaces diverge meaningfully from the prior Console PRD (e.g. 6-view boards, FLIP-drag dashboard, 4-rail-position shell, 8-pet desktop pet) and would force `plugin-productivity`/`plugin-console` to retrofit a richer interaction model under risk of regression. Recorded in ADR §Consequences as a future merge possibility, not a v1 path.

## Review Doc Path

- `docs/reviews/xai-web-build-form-adr/20260523-discovery-review.md`
- Roadmap seed: `docs/reviews/xai-web-build-form-adr/20260523-roadmap-seed.md`
- Manifest row: `docs/workflow/roadmap/xai-web-console.md` #1 (W0)

## Review Date / Version

- Discovery drafted: 2026-05-23 (this turn)
- ADR target version: ADR-0007 (next free number after `docs/adr/0006-web-face-hybrid-reuse-boundary.md` confirmed via `Glob docs/adr/*.md`)
- ADR target Status at acceptance: **Accepted** (per hard constraint — not Draft)

## Frozen Assumptions

These propositions are locked by this design snapshot and become hard inputs to
every downstream `xai-web-*` row. Changing any of them after the ADR is Accepted
requires opening a new ADR (or a recorded ADR amendment), not silently editing
this file.

1. **Toolchain** — `apps/web/` already runs Vite 7 + React 19 + TS 5.9 +
   `@vitejs/plugin-react` per `apps/web/package.json`. The migration target IS
   that toolchain. The standalone Babel CDN form (`web design/index.html` lines
   16–18) will NOT ship.
2. **Package layout** — Each business module gets its own
   `packages/plugin-web-<module>/` package with `package.json` +
   `manifest.json` + `src/index.ts` + `docs/` four-doc set. The `apps/web/`
   host shell consumes them via workspace deps.
3. **Host shell location** — `apps/web/src/` is the Vite SPA shell:
   `main.tsx` + router + provider tree + plugin registration. Zero business
   logic. Symmetric with `apps/desktop/src/`.
4. **Cross-module communication** — A new `@repo/core/events` channel family
   (`web:<module>:<event>` prefix) wraps the existing typed event layer in
   `packages/core/src/events/`. No direct plugin-to-plugin imports. A separate
   `@repo/plugin-web-events` package is NOT created (Option Rejected — adds
   indirection without architectural benefit; `@repo/core/events` already
   provides the typed bus).
5. **Persistence contract** — `web design/DESIGN.md` §9.2's 24 localStorage
   keys are the canonical persistence registry. Ownership transfers to
   `xai-web-persistence-contract` (row #3). This ADR enumerates the keys for
   traceability; row #3 declares the typed registry and `usePref` hook.
6. **Platform spine reuse** — The following SHIPPED `web-ticktick-parity` rows
   are consumed as-is and MUST NOT be reimplemented:
   `web-architecture-adr-lite`, `web-plugin-map-contract-reconcile`,
   `web-sync-crypto-contract-preflight`, `web-release-site-archive-vite-shell`,
   `web-auth-device-session`, `web-browser-e2e-crypto-runtime`,
   `web-encrypted-indexeddb-cache`, `web-console-host-router`,
   `web-security-csp-sentry`, `web-todo-first-slice`.
7. **Superseded parity rows** — These four PENDING `web-ticktick-parity` rows
   are SUPERSEDED by the equivalent `xai-web-*` rows:
   - `web-productivity-habits-pomodoro` → `xai-web-pomodoro` + `xai-web-habits`
   - `web-project-label-calendar` → `xai-web-board-core` + `xai-web-board-views` + `xai-web-board-workspaces` + `xai-web-calendar`
   - `web-search-keyboard-theme` → `xai-web-shell` (search keyboard) + `xai-web-settings-appearance` (theme)
   - `web-statistics-views` → `xai-web-statistics`

   The ADR recommends a hand-edit of those rows on the `web-ticktick-parity`
   manifest to `BLOCKED_EXTERNAL` with `Note: superseded by xai-web-console`.
   The ADR feature itself does NOT edit the other manifest (roadmap-loop
   driver constraint).
8. **PLUGIN_MAP.md staleness caveat** — Per `web-ticktick-parity` rationale
   R3, `docs/PLUGIN_MAP.md` may be stale; the ADR cites it but acknowledges
   downstream rows may need to verify each plugin's actual status against
   real source before consuming. The ADR does not edit PLUGIN_MAP.md.
9. **No new top-level packages outside the `plugin-web-*` namespace** — All
   new packages live under `packages/plugin-web-<module>/`. No new
   `@repo/core-*`, `@repo/ui-*`, or `@repo/web-*` packages are introduced by
   this ADR (the existing `@repo/web-auth-device-session` workspace package
   is reused as a dep of the host shell).
10. **ADR status at acceptance** — The ADR ends in **Accepted** (not Draft,
    not Proposed). Hard constraint from the seed brief.

## File-by-file Port Mapping (Frozen)

This table is the heart of the ADR — every downstream row will read it. The
ADR body re-prints it; this design.md snapshot includes the canonical version
so the ADR and this doc cannot drift.

| Prototype file (web design/) | Type | Target path | Owning row | Notes |
|---|---|---|---|---|
| `index.html` | HTML entry | `apps/web/index.html` (existing) extended | xai-web-shell | Existing Vite entry kept; standalone Babel scripts removed; Google Fonts `<link>` for Manrope + Noto Sans SC + JetBrains Mono added (or moved to CSS `@import`). |
| `tokens.css` | CSS variables | `packages/plugin-web-tokens/src/tokens.css` + `index.ts` re-export | xai-web-tokens-and-i18n | Shipped as a side-effect CSS import + a TS module of typed token names for autocomplete. |
| `layout.css` | CSS layout | `packages/plugin-web-tokens/src/layout.css` (co-located with tokens) | xai-web-tokens-and-i18n | Same package as tokens — both are pure CSS infra with no JS surface; co-location avoids a second tiny package. |
| `i18n.js` | Window global `window.I18N` + `useI18n` | `packages/plugin-web-tokens/src/i18n.ts` + `useI18n` hook | xai-web-tokens-and-i18n | Window-global eliminated. `I18N` exported as typed `Record<Lang, Record<Module, Record<Key, string>>>`. `useI18n(lang)` returns `{ s(key) }` per DESIGN.md §8. |
| `board-data.js` | Window global `window.BOARDS` MOCK | `packages/plugin-web-board-core/src/seed/board-data.ts` | xai-web-board-core | Becomes a typed seed module imported only by board-core's first-run seeding helper. Not a window global. |
| `icons.jsx` | SVG icon components | `packages/plugin-web-icons/src/index.tsx` | xai-web-shell (consumer) | New small package — pure SVG components used by every module. No business logic. |
| `shell.jsx` (`<AppRail>` `<Topbar>` `<AvatarMenu>`) | Shell components | `packages/plugin-web-shell/src/{AppRail,Topbar,AvatarMenu}.tsx` + `index.ts` | xai-web-shell | Module-switching state lives in host shell `apps/web/src/App.tsx`; AppRail emits `web:shell:module-change`. |
| `app.jsx` (`<App>`) | Root composition | `apps/web/src/App.tsx` (host shell) | xai-web-shell | Host shell only. Wires providers (theme / lang / persistence) + router + plugin registration. No module business logic inside. |
| `module-tasks.jsx` | Tasks UI + state | `packages/plugin-web-tasks/src/` | xai-web-tasks | 4-bucket time view + cross-column DnD date rewrite per DESIGN.md §4.2. |
| `module-board.jsx` | Boards + 6 views + workspaces | Pre-split: `packages/plugin-web-board-core/`, `packages/plugin-web-board-views/`, `packages/plugin-web-board-workspaces/` | xai-web-board-core / xai-web-board-views / xai-web-board-workspaces | Per manifest R6 granularity decision (2026-05-23 user). board-core ships Kanban view + schema + 10-color columns; views adds Table/Calendar/Dashboard/Timeline/Map; workspaces adds Switcher/Creator/PM-template/multi-panel. |
| `module-dashboard.jsx` | 12-col widget grid + 8 widgets | Pre-split: `packages/plugin-web-dashboard-grid/`, `packages/plugin-web-dashboard-widgets/` | xai-web-dashboard-grid / xai-web-dashboard-widgets | Grid ships the FLIP-drag 12-col container + widget slot registration; widgets ships Clock/MiniCal/WorldClocks/Weather/Stickies/Mail/Upcoming/3-stats. |
| `module-calendar.jsx` | Month view | `packages/plugin-web-calendar/src/` | xai-web-calendar | Month + 4-color event bands + deep-link from MiniCal widget per DESIGN.md §4.5. |
| `module-matrix.jsx` | Eisenhower 2×2 | `packages/plugin-web-matrix/src/` | xai-web-matrix | DESIGN.md §4.6. |
| `module-pomodoro.jsx` | Circular timer + history | `packages/plugin-web-pomodoro/src/` | xai-web-pomodoro | DESIGN.md §4.7. Persistence key `xai_pomodoro_sessions` (manifest R6 guess — feature-plan row may rename). |
| `module-habits.jsx` | Weekly check-off + diary | `packages/plugin-web-habits/src/` | xai-web-habits | DESIGN.md §4.8. |
| `module-meditation.jsx` | 5 scenes + 4 clocks + player | `packages/plugin-web-meditation/src/` | xai-web-meditation | DESIGN.md §4.9. |
| `module-countdown.jsx` | Countdown card grid | `packages/plugin-web-countdown/src/` | xai-web-countdown | DESIGN.md §4.10. Persistence key `xai_countdowns` (manifest R6 guess). |
| `module-statistics.jsx` | 7 visualizations | `packages/plugin-web-statistics/src/` | xai-web-statistics | DESIGN.md §4.11. Aggregator — reads from tasks/pomodoro/habits via typed events + repository reads. |
| `module-ai.jsx` | AI Chat + aurora + orb | `packages/plugin-web-ai-chat/src/` | xai-web-ai-chat | DESIGN.md §4.1. `window.claude.complete` adapter strategy under Vite is delegated to that row's feature-plan (manifest R6). |
| `module-settings.jsx` | 13-pane settings | Pre-split: `packages/plugin-web-settings-shell/`, `packages/plugin-web-settings-appearance/`, `packages/plugin-web-settings-features-panel/`, `packages/plugin-web-settings-rest/` | xai-web-settings-shell / -appearance / -features-panel / -rest | DESIGN.md §4.12. settings-shell ships the 13-pane chassis + atoms; appearance/features-panel/rest ship pane content. |
| `pet.jsx` | 8 pets + Picker + drag | `packages/plugin-web-pet/src/` | xai-web-pet | DESIGN.md §4.13. |

Total new packages: **20**
(`plugin-web-tokens`, `plugin-web-icons`, `plugin-web-shell`, `plugin-web-tasks`,
`plugin-web-board-core`, `plugin-web-board-views`, `plugin-web-board-workspaces`,
`plugin-web-dashboard-grid`, `plugin-web-dashboard-widgets`,
`plugin-web-calendar`, `plugin-web-matrix`, `plugin-web-pomodoro`,
`plugin-web-habits`, `plugin-web-meditation`, `plugin-web-countdown`,
`plugin-web-statistics`, `plugin-web-ai-chat`, `plugin-web-pet`,
`plugin-web-settings-shell`, plus 3 settings sub-panes which the ADR groups
under one settings-* family at the host shell registration site).

Plus the host shell extension in `apps/web/src/`.

## JSX → TSX Strategy

The ADR locks the following conversion rules so every module row applies them
uniformly:

1. **Rename** `.jsx` → `.tsx`. Component-per-file or component-family-per-file
   (e.g. `shell.jsx` → `AppRail.tsx` + `Topbar.tsx` + `AvatarMenu.tsx`).
2. **Remove** `<script src="https://unpkg.com/@babel/standalone…">`. Vite
   handles JSX transform via `@vitejs/plugin-react` (already in
   `apps/web/package.json` devDependencies).
3. **Remove** CDN React (`<script src="https://unpkg.com/react@18.3.1…">`).
   Workspace `react@^19.2.0` + `react-dom@^19.2.0` from
   `apps/web/package.json` is used everywhere. NOTE: prototype is on React 18
   conventions; React 19 has stable `use`, `useFormStatus`, automatic
   `forwardRef`, and stricter `act` — module rows must mind these when porting
   (e.g. drop manual `forwardRef`, prefer `useEffect` cleanups over class
   lifecycle patterns the prototype does not use anyway).
4. **Window globals → typed imports.** Every `window.I18N`, `window.BOARDS`,
   `window.<Component>` reference in the prototype is replaced by a typed
   import from the owning package. The ADR forbids any new `window.*`
   business globals (the only exception is the AI Chat row's documented
   `window.claude.complete` adapter, which is wrapped in a typed shim — see
   AI Chat row's feature-plan).
5. **`type="text/babel"` removed.** All `<script>` tags in `index.html` are
   removed (except the Vite entry `<script type="module" src="/src/main.tsx">`
   which already exists). Google Fonts `<link>` is preserved or moved to a
   CSS `@import` per host-shell row preference.
6. **`useState` / `useEffect` typing** — Every state field gets an explicit
   type; the ADR forbids `useState<any>`. For mock data (`window.BOARDS`),
   the seed module exports the same typed shape.
7. **Props typing** — Every component gets a typed `Props` interface. The
   ADR does NOT mandate `interface` vs `type`; module rows pick locally.
8. **No `defaultProps`** — React 19 deprecates `defaultProps` on function
   components. Use destructuring defaults.
9. **CSS imports** — Each module imports `tokens.css` and `layout.css`
   transitively via `@repo/plugin-web-tokens`. Modules may add their own
   side-effect CSS via Vite's standard CSS import — no CSS Modules / no
   `styled-components` (DESIGN.md §10.2 leaves the tokens layer as the sole
   style source of truth).
10. **No new state libraries** — `useState` + `useReducer` + `useContext` +
    typed event bus are the only state primitives. The ADR forbids
    `zustand` / `jotai` / `redux` / `@tanstack/store` in this migration
    (no need; prototype runs fine without them; can be revisited in a
    follow-up ADR if a row hits real pain).

## Cross-module Communication Rule

The ADR locks this single rule:

> Modules MUST communicate via the typed event bus at `@repo/core/events`
> (existing infra in `packages/core/src/events/`). Direct plugin-to-plugin
> imports across `packages/plugin-web-*/` boundaries are forbidden. Reading
> shared persistent state goes through the
> `xai-web-persistence-contract` registry (row #3), not direct
> `localStorage.getItem` calls outside that module.

Naming convention frozen by the ADR:

- `web:<module>:<verb>-<noun>` for module-originating events.
  Examples: `web:tasks:card-completed`, `web:pomodoro:session-finished`,
  `web:habits:checkin-recorded`, `web:shell:module-change`,
  `web:settings:preference-changed`.
- Statistics row subscribes to whichever events it needs (read-only consumer).
- AI Chat row, if it ever needs to react to user activity, subscribes to
  module events — never imports module code directly.

The ADR explicitly REJECTS introducing a separate
`@repo/plugin-web-events` package: `@repo/core/events` already provides the
typed bus, and a new package would only add a re-export indirection.

Cross-row contract: the `xai-web-event-bus` row (#4) is the canonical source
for the `web:*` event prefix family declarations (EventMap entries). It does
NOT introduce new bus infrastructure — it adds typed event entries to
`packages/core/src/types/events.ts`, mirroring the existing
`project:card-*` / `labels:*` patterns shipped in W0.B.

## localStorage Key Registry Hand-off

The ADR enumerates the 24 keys from DESIGN.md §9.2 (verbatim list — see the
"Persistence keys" appendix in the ADR body) and hands ownership to
`xai-web-persistence-contract` (row #3). That row will:

- Declare each key as a typed entry in a `WebPrefRegistry`.
- Implement `usePref(key)` returning a typed `[value, setter]`.
- Enforce schema-version migration if any module schema changes after first
  ship (currently no migrations are scheduled).

This ADR does NOT implement the registry. It only fixes the contract that the
registry exists, is the single typed access point for the 24 keys, and is
imported by every module that touches persistent state.

The ADR also lists, for traceability, the four key families per DESIGN.md §9:

1. **Shell / appearance** — `xai_accent_hue`, `xai_rail_pos`, `xai_bg_tone`,
   `xai_rail_order`
2. **Pet** — `xai_pet_pos`, `xai_pet_id`
3. **Module data** — `xai_task_cols`, `xai_boards_v2`, `xai_active_board`,
   `xai_board_panels`, `xai_board_inbox`, `xai_dash_order`,
   `xai_clock_style`, `xai_clock_tz`, `xai_zones`, `xai_ai_convos`,
   `xai_ai_insights`, `xai_ai_voice`
4. **Settings via usePref** — `xai_pref_*` family (variable number of keys
   under one prefix; counted as one logical entry)

Plus the two manifest-R6 guess keys (`xai_pomodoro_sessions`,
`xai_countdowns`) which the ADR formally proposes; their owning rows may
rename.

## Interop with `web-ticktick-parity` Platform Spine

The ADR records the consume-don't-replace rule and pins the exact reuse list
in Frozen Assumption §6 above. Two concrete consumption sites the ADR calls
out for downstream rows:

1. **`apps/web/src/main.tsx` (host shell)** — imports
   `@repo/web-auth-device-session` for device-id injection (shipped). The
   host shell row must keep this import intact.
2. **Encrypted IndexedDB cache + sync blob driver** — module rows that store
   real data (tasks/boards/habits/pomodoro/countdowns) read/write through the
   shipped repository contract (`@repo/core-data` or successor). The
   localStorage keys in §9.2 are for **UI preferences only**, NOT durable
   data. Durable data flows through the shipped platform spine.

The ADR explicitly NOTES that DESIGN.md §9 mentions "all preferences
persisted to localStorage, zero network dependency". The ADR reconciles this
with the platform spine by saying:

- UI **preferences** (24 keys) → localStorage (matches DESIGN.md).
- Module **data entities** (cards, tasks, boards, habit check-ins, pomodoro
  sessions, countdowns, AI convos) → encrypted IndexedDB + sync blob protocol
  (matches `web-ticktick-parity` spine). DESIGN.md's "local-first" promise is
  preserved — the spine is local-first.

This is the single conflict reconciliation the ADR makes between the
DESIGN.md PRD and the `web-ticktick-parity` PRD; downstream rows must respect
it.

## Dependency Overview

```
                ┌─────────────────────────────────────┐
                │  apps/web (Vite SPA host shell)     │
                │  - main.tsx / App.tsx / router      │
                │  - registers all plugin-web-*       │
                └────────────┬────────────────────────┘
                             │
       ┌─────────────────────┼─────────────────────┐
       │                     │                     │
┌──────▼──────┐    ┌─────────▼─────────┐    ┌──────▼──────┐
│ plugin-web- │    │ plugin-web-tokens │    │ plugin-web- │
│ shell       │    │ (+ i18n + layout) │    │ icons       │
└──────┬──────┘    └─────────┬─────────┘    └──────┬──────┘
       │                     │                     │
       │       ┌─────────────┴─────────────┐       │
       └───────▶  @repo/core/events (typed bus)    │
                 @repo/core (existing infra)       │
                 @repo/web-auth-device-session ◀───┘
                 @repo/plugin-console / -productivity (reused as-is or sidelined per ADR §Consequences)
                 [web-ticktick-parity SHIPPED spine] (consumed; not re-imported)

14 leaf modules (tasks, board-*, dashboard-*, calendar, matrix, pomodoro,
habits, meditation, countdown, ai-chat, pet) all depend on:
  - @repo/core/events (typed events)
  - @repo/plugin-web-tokens (tokens / i18n / layout)
  - @repo/plugin-web-icons (SVG icons)
  - host shell registers them; no direct module-to-module deps

statistics depends on: @repo/core/events (read-only) + the data shape
contracts of tasks/pomodoro/habits (ready_to_ship edges per manifest).

settings-shell depends on host shell + tokens + persistence-contract.
settings-{appearance,features-panel,rest} depend on settings-shell + their
relevant module's contract (ready_to_ship edges).
```

## Decision Risk Register

- **R-A1 (medium):** `@repo/plugin-productivity` and `@repo/plugin-console`
  already declared in `apps/web/package.json` may stay as dead deps after this
  migration. ADR documents this and leaves the cleanup to a future
  `web-ticktick-parity` review. Not a v1 blocker.
- **R-A2 (medium):** `docs/PLUGIN_MAP.md` may be stale. ADR cites it but
  warns each module row to verify status against actual `packages/plugin-*/`
  source at consume time.
- **R-A3 (low):** ADR cannot itself edit the `web-ticktick-parity` manifest
  to pause the four superseded rows. Recommended hand-edit is documented in
  the ADR §Consequences and surfaced in the Handoff.
- **R-A4 (low):** AI Chat's `window.claude.complete` adapter strategy under
  Vite is deferred to the ai-chat row. ADR records this as a known open
  question, not a blocker for the ADR acceptance.
- **R-A5 (low):** Pomodoro/Countdown persistence keys (`xai_pomodoro_sessions`
  / `xai_countdowns`) are seed-brief proposals; owning rows may rename. ADR
  records them as proposed-not-frozen.
- **R-A6 (medium):** DESIGN.md §9 "zero network dependency" wording vs.
  platform spine's sync requirement. ADR resolves this explicitly (see
  "Interop with web-ticktick-parity platform spine" above). If a reviewer
  reads DESIGN.md §9 literally, they may object to the spine reuse — the ADR
  cites this resolution.

---

## Phase Plan (recorded here AND in dev_log.md Status Panel)

This feature is documentation-only. Phases are scoped to ADR authoring:

- **P1 — Write ADR draft + port mapping table.** Author
  `docs/adr/0007-xai-web-console-build-form.md` with Status=Proposed. Include
  Background, all four alternatives (A/B/C/D), Decision, Consequences,
  Implementation Rules, full file-by-file port mapping table, JSX→TSX
  strategy, cross-module rule, localStorage hand-off, web-ticktick-parity
  interop, recommended pause action, and Risk Register. Gate: ADR draft
  exists, internal cross-references resolve, all 24 prototype files mapped.
- **P2 — Review pass + flip to Accepted.** `feature-review` reads ADR +
  design.md + api.md + test.md, validates traceability, and either approves
  (flip Status to Accepted in the same commit) or returns revision notes.
  Gate: reviewer verdict APPROVED.
- **P3 — Traceability appendix + roadmap recommendations.** Append the
  ADR's "Traceability to xai-web-console roadmap" section linking each
  downstream row #2..#24 to the relevant ADR section, plus the explicit
  recommendation for the human to hand-edit the 4 superseded
  `web-ticktick-parity` rows to `BLOCKED_EXTERNAL`. Gate: every downstream
  row's seed brief can cite an ADR section by anchor.

Verify Cross-vendor: yes (per manifest header). The ADR text + four-doc set
is reviewed under Cross-vendor verify policy (Claude + Codex / Cursor read
the ADR independently and confirm no conflict with existing ADR-0003 /
ADR-0006).
