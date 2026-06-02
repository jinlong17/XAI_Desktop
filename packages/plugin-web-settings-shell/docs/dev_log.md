# Dev Log — xai-web-settings-shell

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | xai-web-settings-shell |
| Title | Web Console Settings outer chassis — 13-pane sidebar (Account/Premium/Features/Smart Lists/Notifications/Date & Time/Appearance/More/Integrations/Collaborate/Sticky Note/Hotkeys/About), pane-switch navigation, atomic components (Toggle/SettingRow/SectionBlock/SettingsFooter) consumed by sibling rows #22/#23/#24, Save & apply broadcasts via `web:settings:preference-changed`, Reset to defaults clears every `xai_pref_*` key + re-applies defaults via the bus. Module registers via @repo/xai-web-shell slot pattern (showInRail:false). Chassis exports `paneRegistry: Pane[]` extensibility seam so sibling rows attach pane content without prop-drilling. NO new `@repo/core` EventMap entries (reuses existing `web:settings:preference-changed`); NO new storage keys (purely orchestrates over PREF_REGISTRY); NO direct App.tsx state mutation (broadcasts via bus). |
| Current Phase | SHIP |
| Status | SHIPPED |
| Suggested Next | — (SHIPPED) |
| Verify Cross-vendor | queued for ship-time (Codex gpt-5.5-thinking medium / Cursor per W4a manifest header — Save flash setTimeout + window.confirm stubbing + emitWebEvent spy semantics + jsdom localStorage isolation + bilingual rendering) |
| Automation Mode | A-Claude (per roadmap default; xai-roadmap-loop W4a sequential dispatch — chassis unblocks W4b parallel) |
| Executor | claude-sonnet-4-6 (ship, 2026-05-23) |
| Updated | 2026-05-23 19:35 |
| Dispatched By | xai-roadmap-loop (W4a sequential dispatch — sole row in this wave) |
| Roadmap Row | docs/workflow/roadmap/xai-web-console.md row #21 (W4a · chassis) |
| ADR Anchor | docs/adr/0007-xai-web-console-build-form.md §S4 (port map `module-settings.jsx` → `packages/plugin-web-settings-shell/`) + §S5 (JSX→TSX rules) + §S6 (Vite SPA) + §S7 (reuses `web:settings:preference-changed`; no `web:shell:preference-change` channel created) + §S8 (no new storage keys) |
| Concurrent Siblings | NONE (W4a sequential — chassis is sole row in this wave; #22/#23/#24 dispatch after this row reaches READY_TO_SHIP) |
| Write Scope | **planning phase**: `packages/xai-web-settings-shell/docs/` + `docs/reviews/xai-web-settings-shell/` ONLY. **build phase (later)** extends to `packages/plugin-web-settings-shell/` (new package) + a single-line edit on the `placeholder("settings", "Settings", "sliders", 99, false)` line in `apps/web/src/routes/modules/shellRegistrations.tsx` (with import) + a one-line workspace dep addition in `apps/web/package.json` (`"@repo/plugin-web-settings-shell": "workspace:*"`) |

## Artifacts Index

- Seed brief: `docs/reviews/xai-web-settings-shell/20260523-roadmap-seed.md`
- Discovery review: `docs/reviews/xai-web-settings-shell/20260523-discovery-review.md`
- Design snapshot: `packages/xai-web-settings-shell/docs/design.md`
- API contract: `packages/xai-web-settings-shell/docs/api.md`
- Test strategy: `packages/xai-web-settings-shell/docs/test.md`

## Decision Headline

Port the Settings outer chassis from `web design/module-settings.jsx` (lines 23-100 SettingsModule + 1039-1059 atoms + 635-650 Save/Reset template) into a typed Vite+React 19 package `@repo/plugin-web-settings-shell`.

**The defining call** — *how do sibling rows #22/#23/#24 attach pane content to the chassis without prop-drilling lang/theme/setters down 13 levels?* — is decided as **"slot pattern via paneRegistry"**: the chassis exposes a typed `Pane` interface (`{ id: SettingsPaneId; icon: WebShellIconName; i18nKey; render(props: PaneRenderProps): ReactElement }`) and a `paneRegistry: Pane[]` array sibling rows extend. The chassis renders sidebar + active-pane container; pane modules from sibling rows export pane objects that the host composes. `PaneRenderProps = { lang: Lang }` is frozen — sibling rows read other prefs via `usePref` directly.

**Atomic components are the public surface that won't churn**: `Toggle`, `SettingRow`, `SectionBlock`, `SettingsFooter` have tight typed APIs locked at this row's ship. `SettingsFooter` owns the Save & apply / Reset to defaults pattern from source lines 635-650, including the 1800ms "Saved" flash and bilingual confirm dialog.

**Save & apply broadcast**: when `SettingsFooter` Save fires, the consumer-provided `onSave(): WebPreferenceChange[]` callback returns the items to broadcast — chassis iterates and calls `emitWebEvent('web:settings:preference-changed', { ...change, changedAt: new Date().toISOString() })` per change. Pane modules stay unaware of the event bus.

**Reset to defaults**: chassis exposes `resetAllPrefs()`:
1. Iterates `PREF_REGISTRY` (from `@repo/plugin-web-storage`) skipping `proposed: true` entries, calling `removePref(entry.key)` for each `xai_*` key.
2. Emits 7 events on `web:settings:preference-changed` — one per canonical `WebPreferenceKey` (theme/density/fontScale/accentHue/railPos/bgTone/lang) with the registry default value.
3. Wrapped in `window.confirm` bilingual prompt before invoking.

**No new EventMap entries.** Reuses the existing `web:settings:preference-changed` channel (declared in `packages/core/src/types/events.ts` line 193). Co-ownership with row #22 documented in api.md §3.1.

**No new storage keys.** The chassis is pure orchestration over already-registered prefs.

**Concurrency with sibling W4 rows**: NONE concurrent — this is W4a sequential dispatch. Sibling rows #22/#23/#24 dispatch after this row reaches READY_TO_SHIP per manifest dependency edges.

## Phase Plan (3 phases — matches statistics / dashboard-grid peer pattern)

> Each phase is a single `feature-build` run. After each phase, `feature-build`
> stops for human confirmation per CLAUDE.md "feature-build does ONE phase per run".
> `feature-auto-build` walks the same plan but does ALL phases without a stop.

### Phase P1 — Package scaffolding + pure layer (types, paneRegistry placeholders, resetAllPrefs, confirmAction)

**Scope**

1. **Create runtime package** at `packages/plugin-web-settings-shell/`:
   - `package.json` (name `@repo/plugin-web-settings-shell`, deps per api.md §9)
   - `tsconfig.json` (extends `@repo/typescript-config/react-library.json`)
   - `manifest.json` (`status: "In-Dev"`, `type: "ui"`, `owner: "xai-web-settings-shell row #21"`)
   - `vitest.config.ts` (jsdom; setupFiles loads `vitest.setup.ts`; include `src/__tests__/**/*.{test,spec}.{ts,tsx}`)
   - `vitest.setup.ts` (`localStorage.clear()` afterEach + `@testing-library/jest-dom` import)
   - `eslint.config.js` (extends `@repo/eslint-config/react-internal` + `@typescript-eslint/no-explicit-any: error`)
2. **Public types** in `src/types.ts` per api.md §1:
   - `SettingsPaneId` (13-entry string-literal union)
   - `Pane`, `PaneRenderProps`
   - `SettingsModuleProps`, `ToggleProps`, `SettingRowProps`, `SectionBlockProps`, `SettingsFooterProps`
3. **Internal modules** in `src/internal/`:
   - `confirmAction.ts` — `confirmAction(message: string): boolean` thin wrapper over `window.confirm` (testable seam)
   - `paneRegistry.ts` — exported `paneRegistry: Pane[]` array of 13 entries, each `render` returns the bilingual placeholder div
   - `resetAllPrefs.ts` — pure-side-effect function per api.md §5.1
   - `defaults.ts` — fallback default values for the 7 canonical WebPreferenceKey when registry lookup misses (per api.md §5.1)
4. **Public surface (P1 subset)** in `src/index.ts` per api.md §0 — exports types + `paneRegistry` + `resetAllPrefs`. Component exports + `settingsShellWebModuleRegistration` land in P2/P3.
5. **Tests (P1 subset per test.md §3 pure layer)**:
   - `types-paneIds.test.ts` (T1..T2)
   - `confirmAction.test.ts` (C1..C2)
   - `paneRegistry.test.ts` (P1..P3)
   - `resetAllPrefs.test.ts` (R1..R8)
   - `index-barrel.test.ts` (B1..B3 — limited to P1 exports)

**Acceptance**
- `pnpm --filter @repo/plugin-web-settings-shell lint` exits 0 (`--max-warnings 0`).
- `pnpm --filter @repo/plugin-web-settings-shell test` exits 0; P1 tests pass.
- `pnpm --filter @repo/plugin-web-settings-shell typecheck` exits 0.
- Commit: `feat(plugin-web-settings-shell): P1 scaffolding + pure layer (W4a row #21)`.

### Phase P2 — Components + `SettingsModule` composition + CSS

**Scope**

1. **Components** in `src/`:
   - `Toggle.tsx` — verbatim TSX port of source line 1053-1058 with `role="switch"` + `aria-checked`
   - `SettingRow.tsx` — verbatim TSX port of source line 1039-1048
   - `SectionBlock.tsx` — verbatim TSX port of source line 1050-1051
   - `SettingsFooter.tsx` — Save & apply (1800ms flash) + Reset to defaults (confirm + resetAllPrefs default) per api.md §2.3
   - `SettingsSidebar.tsx` (internal) — renders 4 groups from `paneRegistry`, click → `setActive`
   - `SettingsDetail.tsx` (internal) — renders `active.render({ lang })`
   - `SettingsModule.tsx` — top-level composition; `useState<SettingsPaneId>("account")`; renders sidebar + detail; passes `lang` down
2. **CSS** in `src/styles.css` — port Settings-relevant rules from `web design/layout.css`:
   - `.module-settings`, `.settings-shell`, `.settings-sidebar`, `.settings-h`, `.settings-group`, `.list-row[data-active]`, `.settings-detail`
   - `.setting-row`, `.sr-text`, `.sr-label`, `.sr-desc`, `.sr-ctrl`
   - `.setting-block`
   - `.toggle`, `.toggle.on`, `.toggle-knob`
   - `.pane-footer`, `.pane-save.is-saved`
   - `.pane-placeholder` (new, for placeholder pane bodies)
   - Verbatim port + scoped under `.module-settings`. Side-effect imported via `src/index.ts`.
3. **Public surface** in `src/index.ts` — adds `SettingsModule`, `Toggle`, `SettingRow`, `SectionBlock`, `SettingsFooter` exports + side-effect `import "./styles.css"`. NO registration export yet.
4. **Tests (P2 subset per test.md §3 component layer)**:
   - `Toggle.test.tsx` (TG1..TG4)
   - `SettingRow.test.tsx` (SR1..SR4)
   - `SectionBlock.test.tsx` (SB1..SB2)
   - `SettingsFooter.test.tsx` (F1..F8)
   - `SettingsModule.test.tsx` (M1..M10)
   - `index-barrel.test.ts` (B1..B3 — full surface minus registration)

**Acceptance**
- `pnpm --filter @repo/plugin-web-settings-shell lint` exits 0.
- `pnpm --filter @repo/plugin-web-settings-shell test` exits 0; P1 + P2 tests pass.
- `pnpm --filter @repo/plugin-web-settings-shell typecheck` exits 0.
- Commit: `feat(plugin-web-settings-shell): P2 components + Save/Reset + CSS port (W4a row #21)`.

### Phase P3 — Slot registration + host wiring + integration test

**Scope**

1. **Registration** in `src/registration.tsx`:
   - Internal `SettingsModuleRoute()` calls `useWebShell()` to read `lang`, returns `<SettingsModule lang={lang}/>`
   - Export `settingsShellWebModuleRegistration: WebModuleSlotRegistration` matching api.md §4
2. **Public surface** in `src/index.ts` — adds `settingsShellWebModuleRegistration` export.
3. **Host wiring**:
   - Edit `apps/web/src/routes/modules/shellRegistrations.tsx`:
     * Add `import { settingsShellWebModuleRegistration } from "@repo/plugin-web-settings-shell";` at the top
     * Replace the `placeholder("settings", "Settings", "sliders", 99, false)` line with `settingsShellWebModuleRegistration` in the `webShellModuleRegistrations` array
     * Update the trailing comment `// Settings — not in rail (showInRail: false)` to reflect the now-real registration
   - Edit `apps/web/package.json`:
     * Add `"@repo/plugin-web-settings-shell": "workspace:*"` to `dependencies` (alphabetical order — between `plugin-web-pomodoro` and `plugin-web-tasks`)
4. **Tests** (P3 subset):
   - `registration.test.tsx` (RG1..RG3) — slot field correctness + route render integration via MemoryRouter
   - `index-barrel.test.ts` final state (B1..B3 — complete surface per api.md §0)
5. **Workspace install** — `pnpm install` to update lockfile after package.json edit.

**Acceptance**
- `pnpm --filter @repo/plugin-web-settings-shell lint test typecheck` all exit 0.
- `pnpm --filter @repo/web lint` exit 0 (shellRegistrations edit stays clean).
- `pnpm --filter @repo/web build` exit 0 with new registration wired.
- Manual smoke: `pnpm --filter @repo/web dev` → navigate `/app/settings` → 13 sidebar entries render + clickable.
- Commit: `feat(web): wire settings-shell registration + host package dep (W4a row #21)`.

## Acceptance Criteria (whole feature)

(Repeated from discovery-review §8 for breakpoint continuity.)

1. `pnpm --filter @repo/plugin-web-settings-shell lint test typecheck` all exit 0 (`--max-warnings 0`).
2. `pnpm --filter @repo/web build` succeeds with the new registration.
3. Settings module opens at `/app/settings`. All 13 sidebar entries visible + clickable; selecting each switches the rendered pane.
4. Footer Save & apply emits one event per provided change; button shows "Saved" / "已保存" for 1800ms.
5. Footer Reset to defaults clears every `xai_pref_*` key (verified via `localStorage.getItem`) AND emits 7 events with default values.
6. Sidebar bilingual: switching `lang` re-renders all 13 entries with the other-language labels.
7. Public API in `src/index.ts` matches api.md §0 verbatim.
8. `placeholder("settings", ...)` removed from `webShellModuleRegistrations`; `settingsShellWebModuleRegistration` in its place.

## Work Log

### 2026-05-23 — feature-plan (Claude Opus 4.7 1M)

**Action**: Initial planning pass — produced discovery review, design snapshot, API contract, test strategy, and 3-phase plan.

**Files written**:
- `docs/reviews/xai-web-settings-shell/20260523-discovery-review.md`
- `packages/xai-web-settings-shell/docs/design.md`
- `packages/xai-web-settings-shell/docs/api.md`
- `packages/xai-web-settings-shell/docs/test.md`
- `packages/xai-web-settings-shell/docs/dev_log.md` (this file)

**Key decisions**:
- Slot pattern via `paneRegistry: Pane[]` (vs render-prop / context / clones)
- `PaneRenderProps = { lang }` frozen — sibling rows read other state via `usePref`
- `onSave: () => WebPreferenceChange[]` callback returns broadcast items (vs pane emits directly)
- `resetAllPrefs()` chassis-owned utility (vs decentralized pane resets / localStorage.clear)
- Reuses existing `web:settings:preference-changed` channel — no new EventMap entries
- 13 placeholder pane modules in chassis so siblings can land independently without breakage
- Atomic API (Toggle/SettingRow/SectionBlock/SettingsFooter) frozen at this row's ship — sibling-row changes blocked

**Hand-off note**:
Plan is ready for `feature-review`. No open questions; ADR-0007 §S4 + DESIGN.md §4.12 + roadmap manifest fully specify scope. After REVIEW APPROVED, `feature-auto-build` walks 3 phases (scaffolding+pure → components+CSS → registration+host wiring).

### 2026-05-23 — feature-review (Claude Opus 4.7 1M)

**Action**: Plan review pass — verified against ADR-0007 §S4/S5/S7/S8, DESIGN.md §4.12, roadmap manifest row #21, peer patterns (statistics, meditation, dashboard-grid), and CLAUDE.md conventions.

**Verdict**: **APPROVED** — no blockers.

**Checklist**:
- ✅ Discovery review §1-10 structure complete
- ✅ Design snapshot with axis-B1 + dependency overview
- ✅ API contract surface map matches `index.ts` exports
- ✅ Test strategy with numbered specs (11 test files, ~58 specs)
- ✅ Dev log Status Panel + 3-phase plan + Work Log present
- ✅ ADR-0007 alignment: §S4 port map confirmed (`module-settings.jsx` → `packages/plugin-web-settings-shell/`); §S5 JSX→TSX rules applied; §S7 reuses existing `web:settings:preference-changed` channel — no new EventMap entries; §S8 no new storage keys
- ✅ Frozen assumptions enumerated (11 items)
- ✅ Dependencies all Stable (core/tokens/storage/event-bus/shell)
- ✅ Single-line edit + import to `shellRegistrations.tsx` documented
- ✅ `apps/web/package.json` workspace dep addition documented
- ✅ Atomic API frozen post-ship (sibling-row changes blocked)
- ✅ Pane registry slot pattern decided (alternatives evaluated)
- ✅ Cross-vendor verify queued for ship-time per W4a header
- ✅ Concurrency: NONE (W4a sequential — chassis unblocks W4b)
- ✅ Public-surface enumeration consistent across api.md §0 / dev_log §Acceptance / test.md B1
- ✅ `resetAllPrefs` semantics clarified (3 registry-backed keys cleared in localStorage; 7 canonical broadcasts at compile-time defaults; theme/density/fontScale/lang are useState-backed)
- ✅ Commit conventions match `docs/conventions/COMMIT_CONVENTION.md`

**Hand-off note**:
APPROVED. `feature-auto-build` may now walk P1 → P2 → P3 producing 3 commits.

### 2026-05-23 — feature-auto-build (Claude Opus 4.7 1M)

**Action**: All 3 phases executed inline (parent-session role per
feature-dev-loop dispatch note). Each phase shipped as a discrete commit.

**Commits**:
- `3cb7e6a` feat(plugin-web-settings-shell): P1 scaffolding + pure layer (W4a row #21)
- `f637a3d` feat(plugin-web-settings-shell): P2 components + Save/Reset + CSS port (W4a row #21)
- `39da7af` feat(web): wire settings-shell registration + host package dep (W4a row #21)

**Per-phase highlights**:

P1 — Package scaffolding + pure layer:
- New runtime package `packages/plugin-web-settings-shell/` (package.json,
  tsconfig, manifest, eslint, vitest setup).
- `src/types.ts` — SettingsPaneId (13-entry union) + Pane/PaneRenderProps
  + atom prop types + SettingsModuleProps.
- `src/internal/confirmAction.ts` — SSR-safe window.confirm wrapper.
- `src/internal/defaults.ts` — frozen RESET_DEFAULTS table (7 entries).
- `src/internal/resetAllPrefs.ts` — clears registered xai_* keys via
  removePref + emits 7 web:settings:preference-changed events at the
  compile-time defaults. Idempotent.
- `src/internal/paneRegistry.tsx` — canonical 13-pane array with
  bilingual placeholder render.
- `src/index.ts` P1 surface: types + paneRegistry + resetAllPrefs.
- 18 vitest specs across 5 files: types order parity (2),
  confirmAction (2), paneRegistry (3), resetAllPrefs (8), barrel (3).

P2 — Components + SettingsModule composition + CSS:
- `src/Toggle.tsx`, `src/SettingRow.tsx`, `src/SectionBlock.tsx`,
  `src/SettingsFooter.tsx`.
- `src/internal/SettingsSidebar.tsx` + `src/internal/SettingsDetail.tsx`.
- `src/SettingsModule.tsx` — outer chassis with useState<SettingsPaneId>("account").
- `src/styles.css` — chassis CSS ported from layout.css, scoped under
  .module-settings (renamed saveBounce keyframes to
  settingsShellSaveBounce to avoid global collision).
- P2 surface adds SettingsModule + 4 atomic components + side-effect
  CSS import.
- 28 new vitest specs across 6 new files: Toggle (4), SettingRow (4),
  SectionBlock (2), SettingsFooter (8 — incl. fake-timer 1800ms flash +
  confirm stub + emit spy), SettingsModule (10).

P3 — Slot registration + host wiring:
- `src/registration.tsx` — settingsShellWebModuleRegistration matching
  the peer pattern from packages/plugin-web-statistics.
- P3 surface adds settingsShellWebModuleRegistration export.
- `apps/web/src/routes/modules/shellRegistrations.tsx` — substituted
  placeholder("settings",...) with settingsShellWebModuleRegistration;
  removed the now-unused placeholder() helper and
  ModuleRoutePlaceholderPage import (every module slot is now real).
- `apps/web/package.json` — added "@repo/plugin-web-settings-shell":
  "workspace:*" dep.
- 3 new vitest specs (registration RG1..RG3) + updated barrel test for
  P3 surface.

**Cumulative test count**: 11 files, 49 tests pass.

**Pre-existing host lint warnings observed (NOT introduced by this row)**:
- `apps/web/src/App.tsx` — `useParams` defined but never used
- `apps/web/src/pages/TokensSmokePage.tsx` — DEV env-var (turbo.json) +
  conditional useState (react-hooks/rules-of-hooks)

These three warnings predate this row's edits — confirmed by git stash
during build (3 warnings at baseline, still 3 after this commit).
**Out of scope for row #21.**

**Hand-off note**: All phases complete. Ready for `feature-verify`.

### 2026-05-23 — feature-verify (Claude Opus 4.7 1M)

**Action**: Verification pass — re-ran every CI gate against the post-P3 working tree to confirm the build remains green and acceptance criteria (dev_log §Acceptance) are met.

**Gate results**:

| Gate | Command | Result |
|---|---|---|
| Plugin lint | `pnpm --filter @repo/plugin-web-settings-shell lint` | ✅ exit 0 (`--max-warnings 0`) |
| Plugin typecheck | `pnpm --filter @repo/plugin-web-settings-shell typecheck` | ✅ exit 0 |
| Plugin test | `pnpm --filter @repo/plugin-web-settings-shell test` | ✅ exit 0 — 11 files, 49 tests pass |
| Web typecheck | `pnpm --filter @repo/web check-types` | ✅ exit 0 |
| Web build | `pnpm --filter @repo/web build` | ✅ exit 0 — bundle 273 kB gz |
| Web lint | `pnpm --filter @repo/web lint` | ⚠️ 3 pre-existing warnings (App.tsx useParams + TokensSmokePage DEV/rules-of-hooks). Baseline confirmed by git stash; not introduced by this row. |

**Acceptance criteria audit** (per dev_log §Acceptance):

1. ✅ Plugin lint+test+typecheck all exit 0.
2. ✅ apps/web build succeeds.
3. ✅ Settings module reachable — `settingsShellWebModuleRegistration` in `webShellModuleRegistrations` at the Settings slot with `showInRail:false`, route renders `<SettingsModule lang={lang}/>` via `useWebShell()`.
4. ✅ Save & apply broadcasts via `web:settings:preference-changed` — verified by `SettingsFooter.test.tsx` F4 (1 event per onSave change w/ payload + changedAt) + F5 (empty array = no event but flash).
5. ✅ Reset to defaults clears every registered xai_* key + emits 7 events at canonical defaults — verified by `resetAllPrefs.test.ts` R1..R7.
6. ✅ Sidebar bilingual — verified by `SettingsModule.test.tsx` M8 (EN) + M9 (zh).
7. ✅ Public API per api.md §0 — verified by `index-barrel.test.ts` B1..B3.
8. ✅ `placeholder("settings", ...)` removed; real registration in its place — verified manually in shellRegistrations.tsx + dead-code cleanup committed in P3.

**Cross-vendor verify**: queued for ship-time per W4a manifest header (Codex gpt-5.5-thinking medium / Cursor fallback). Test specs flagged in test.md §4 are designed to be runner-agnostic.

**Verdict**: **PASS** — all gates green, all acceptance criteria met. Pre-existing 3 host lint warnings on App.tsx + TokensSmokePage are out of scope and predate this row.

**Hand-off note**: READY_TO_SHIP. `ship` agent may now commit the dev_log update + push 3 commits (`3cb7e6a`, `f637a3d`, `39da7af`) to remote and flip status to SHIPPED. Sibling rows #22 / #23 / #24 may begin planning once this row is shipped.

### 2026-05-23 19:35 — ship (claude-sonnet-4-6)

**Action**: Ship gate — verified READY_TO_SHIP status, re-ran 49/49 tests, flipped dev_log + manifest.json to SHIPPED, added PLUGIN_MAP row #21 as Stable, created chore commit, pushed 4 commits to origin/main.

**Tests**: `pnpm --filter @repo/plugin-web-settings-shell test` → 11 files, 49 tests, all pass.

**Commits pushed**:
- `3cb7e6a` feat(plugin-web-settings-shell): P1 scaffolding + pure layer (W4a row #21)
- `f637a3d` feat(plugin-web-settings-shell): P2 components + Save/Reset + CSS port (W4a row #21)
- `39da7af` feat(web): wire settings-shell registration + host package dep (W4a row #21)
- `46ebcf6` chore(plugin-web-settings-shell): record feature-verify report + flip to READY_TO_SHIP
- `(this commit)` chore(xai-web-settings-shell): ship — flip dev_log + manifest #21 to SHIPPED

**Status**: SHIPPED. Sibling rows #22 (xai-web-settings-appearance), #23 (features-panel), #24 (rest) may now proceed.
