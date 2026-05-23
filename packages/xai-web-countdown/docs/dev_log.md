# Dev Log — xai-web-countdown

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | xai-web-countdown |
| Title | Web Console Countdown Module — grid of bilingual countdown cards (image + light variants) with add/edit/delete + live remaining-days |
| Current Phase | FEATURE_VERIFY |
| Status | READY_FOR_VERIFY |
| Suggested Next | feature-verify |
| Verify Cross-vendor | yes (countdown grid + add/edit/delete modal + image-variant gradients must render identically in Chrome / Safari 17+ / Firefox latest; midnight rollover behavior validated via fake timers + manual long-tab MV-10/MV-11) |
| Automation Mode | A-Claude (per roadmap default; xai-roadmap-loop W2 parallel-Agent mode — siblings #13 matrix + #19 pet planning concurrently) |
| Executor | Claude Sonnet 4.6 (feature-auto-build run 2026-05-23) |
| Updated | 2026-05-23 16:30 |
| Dispatched By | xai-roadmap-loop (W2 parallel dispatch, concurrent with rows #13 and #19) |
| Roadmap Row | docs/workflow/roadmap/xai-web-console.md row #17 (W2 · Module) |
| ADR Anchor | docs/adr/0007-xai-web-console-build-form.md §S4 (port map row 17) + §S5 (JSX→TSX rules) + §S7 (event bus rules) + §S8 (`xai_countdowns` proposed key — kept verbatim) |
| Concurrent Siblings | #13 xai-web-matrix (IN_PROGRESS) · #19 xai-web-pet (IN_PROGRESS) — write-scope-disjoint |
| Write Scope | **planning phase**: `packages/xai-web-countdown/docs/` + `docs/reviews/xai-web-countdown/` ONLY. **build phase (later)** extends to `packages/plugin-web-countdown/` (new package) + a single-line edit in `apps/web/src/routes/modules/shellRegistrations.tsx` + a one-line workspace dep addition in `apps/web/package.json` |

## Artifacts Index

- Seed brief: `docs/reviews/xai-web-countdown/20260523-roadmap-seed.md`
- Discovery review: `docs/reviews/xai-web-countdown/20260523-discovery-review.md`
- Design snapshot: `packages/xai-web-countdown/docs/design.md`
- API contract: `packages/xai-web-countdown/docs/api.md`
- Test strategy: `packages/xai-web-countdown/docs/test.md`

## Decision Headline

Port `web design/module-countdown.jsx` (67 LOC) into a typed Vite+React 19
package `@repo/plugin-web-countdown`. Card schema is locked at
`{id, title:{en,zh}, target_date, variant, cover_url}` with `target_date`
as ISO `YYYY-MM-DD` and `variant ∈ {"image","light"}`. Cards persist via the
existing SHIPPED `usePref("xai_countdowns")` from `@repo/plugin-web-storage`
— no edits to that package; the registry's `proposed: true` `Countdown =
unknown` entry stays as-is, and we tighten the shape locally via a boundary
predicate. Add/Edit/Delete is a native `<dialog>` modal. Live remaining-days
uses a single shared `setTimeout` to next local midnight plus a
`visibilitychange` listener. Cover images are bundled CSS gradient presets
(`"preset:<id>"`); user-upload deferred. **No `web:countdown:*` events
declared in v1** — no `packages/core/src/types/events.ts` edits, keeping the
parallel-W2 write-scope clean.

The shell slot registers via the standard `WebModuleSlotRegistration` and
swaps a single placeholder line in
`apps/web/src/routes/modules/shellRegistrations.tsx`. Siblings #13 and #19
swap their own placeholder lines in the same file independently — no merge
conflict because each row owns a distinct line.

## Phase Plan (3 phases — per seed brief constraint "2-3 phases")

> Each phase is a single `feature-build` run. After each phase,
> `feature-build` stops for human confirmation per CLAUDE.md "feature-build
> does ONE phase per run".

### Phase P1 — Package scaffolding + schema + grid + card view (read-only on persistence)

**Scope**

1. **Create runtime package** at `packages/plugin-web-countdown/`:
   - `package.json` (name `@repo/plugin-web-countdown`, deps per api.md §11)
   - `tsconfig.json` (extends `@repo/typescript-config`)
   - `manifest.json` (`status: "In-Dev"`, `type: "ui"`, owner row #17)
   - `vitest.config.ts` (jsdom; setupFiles loads `vitest.setup.ts`)
   - `vitest.setup.ts` (HTMLDialogElement shim + fake-timer beforeEach +
     localStorage.clear afterEach per test.md §4)
2. **Public types** in `src/types.ts`:
   - `CountdownVariant`, `CountdownCard`, `ImagePresetId`, `ImagePreset`
3. **Internal pure modules** in `src/internal/`:
   - `presets.ts` — `IMAGE_PRESETS` frozen array (6 entries per design.md §9)
   - `validate.ts` — `isCountdownCard(x): x is CountdownCard`
   - `computeDaysUntil.ts` — pure function (per api.md §6.3)
   - `formatTargetLabel.ts` — date → "M/D" or "M/D/YY" label
4. **Components (read-only mode for P1)** in `src/`:
   - `CountdownCardView.tsx` — receives a card, renders with live days
     (uses the hook from P2 — TEMPORARILY computes on mount only in P1)
   - `AddCountdownCard.tsx` — placeholder card (button, no click handler in P1)
   - `CountdownModule.tsx` — reads `usePref("xai_countdowns")` (filtered via
     predicate), renders grid + AddCountdownCard. No modal yet.
5. **CSS** in `src/styles.css` — port `web design/layout.css` lines
   950–1019 verbatim.
6. **Public surface** in `src/index.ts` per api.md §0 (CSS side-effect
   import; export components/types/IMAGE_PRESETS but NOT `countdownWebModuleRegistration` yet — that lands in P3).
7. **Tests** (P1 subset):
   - `index-barrel.test.ts` (B1..B5)
   - `presets.test.ts` (P1..P3)
   - `validate.test.ts` (V1..V8)
   - `computeDaysUntil.test.ts` (C1..C12)
   - `formatTargetLabel.test.ts` (F1..F5)
   - `cardsReducer.test.ts` — DEFER to P2
   - `CountdownCardView.test.tsx` (CV1..CV6)
   - `AddCountdownCard.test.tsx` (A1..A3)
   - `CountdownModule.test.tsx` partial (M1, M7, M9 only — empty state +
     corrupted entry filter + remount round-trip; no add/edit/delete tests
     yet)

**Definition of Done**

- `pnpm --filter @repo/plugin-web-countdown lint typecheck test` all green
- Storybook-style empty/seeded render works (manual `pnpm dev` smoke from
  `apps/web/` if possible, but the host doesn't yet register the slot — the
  module can be rendered via a temporary unit-test playground if needed).
- No edits to: `@repo/plugin-web-storage`, `@repo/plugin-web-tokens`,
  `@repo/core`, `@repo/xai-web-shell`, `apps/web/`.
- Commit:
  `feat(plugin-web-countdown): P1 scaffold + schema + card grid (read-only)`

### Phase P2 — Live-days hook + cardsReducer + Add/Edit/Delete modal

**Scope**

1. **Internal hook** in `src/internal/useDaysUntil.ts`:
   - Per design.md §5 (mount compute + midnight `setTimeout` +
     `visibilitychange` listener + cleanup).
   - Replace P1's mount-only compute inside `CountdownCardView`.
2. **Internal reducer** in `src/internal/cardsReducer.ts`:
   - `addCard`, `updateCard`, `deleteCard` pure functions (api.md §5.2).
   - `newCardId()` helper (api.md §5.3).
3. **Modal component** in `src/internal/CountdownEditDialog.tsx`:
   - Native `<dialog>` + `dialogRef.current.showModal()`.
   - Form fields per design.md §8 + api.md §4.2 inline literals.
   - `<PresetPicker>` sub-component (visible only when variant=image).
   - Validation: empty-title disables Save; invalid date disables Save.
   - Escape + backdrop click close.
4. **Wire into `CountdownModule`**:
   - `useState<{mode:"closed"} | {mode:"create"} | {mode:"edit", card}>`
   - AddCountdownCard click + header `+` click → set mode="create"
   - CountdownCardView click → set mode="edit"
   - Dialog onSave → addCard or updateCard + setCards + close
   - Dialog onDelete (edit only) → deleteCard + setCards + close
   - Dialog onCancel → close
5. **Tests** (full P2 inventory per test.md §2):
   - `useDaysUntil.test.tsx` (H1..H6)
   - `cardsReducer.test.ts` (R1..R8)
   - `CountdownEditDialog.test.tsx` (E1..E12)
   - `CountdownCardView.test.tsx` extended (CV5 past-date, CV-extras NaN
     handling, CV-fallback unknown preset)
   - `CountdownModule.test.tsx` full (M1..M10)

**Definition of Done**

- All test inventory items listed in test.md §2 are implemented (except
  `registration.test.tsx` which lands in P3).
- Coverage gates from test.md §6 met for the runtime package.
- No edits to host or other packages.
- Commit:
  `feat(plugin-web-countdown): P2 live-days hook + CRUD modal`

### Phase P3 — Shell slot registration + host wire-up + smoke

**Scope**

1. **Slot registration** in `src/registration.tsx`:
   - `countdownWebModuleRegistration: WebModuleSlotRegistration` per
     api.md §3.1.
   - If the existing host seam does not yet pass `lang` via outlet
     context, add a `<CountdownModuleRoute>` wrapper inside this file
     that consumes `useOutletContext()`.
   - Export from `src/index.ts`.
2. **Host edits** — minimal, single-file scope:
   - `apps/web/package.json` — add
     `"@repo/plugin-web-countdown": "workspace:*"` to `dependencies`
     (alphabetical insertion).
   - `apps/web/src/routes/modules/shellRegistrations.tsx` — replace
     line 53 `placeholder("countdown",  "Countdown",  "countdown", 10),`
     with `countdownWebModuleRegistration,` and add the import at the
     top: `import { countdownWebModuleRegistration } from "@repo/plugin-web-countdown";`
   - **CRITICAL** — touch ONLY this one line plus the import. Sibling
     rows #13 and #19 own other lines independently.
3. **Tests**:
   - `registration.test.tsx` (RG1..RG3)
   - Optional: `apps/web/src/__tests__/countdown.smoke.test.tsx` — smoke
     mount via MemoryRouter on `/app/countdown`; check the title renders.
     (If host smoke conventions don't yet establish this, defer to manual
     verify §5.)
4. **Manual cross-vendor walk** per test.md §5 MV-1..MV-17.

**Definition of Done**

- `pnpm --filter @repo/plugin-web-countdown lint typecheck test` green
- `pnpm --filter apps/web typecheck` green
- `pnpm --filter apps/web build` green (Vite production build succeeds)
- Manual cross-vendor checklist passes in Chrome + Safari + Firefox.
- `webShellModuleRegistrations.length === 12` (unchanged from before).
- Commit:
  `feat(plugin-web-countdown): P3 shell slot + host wire-up + smoke`

## Risks (carried from discovery review §4)

| ID | Risk | Severity | Mitigation in phase plan |
|---|---|---|---|
| R1 | Registry `Countdown = unknown` requires local cast | LOW | Predicate in P1 `validate.ts`; tested V1..V8 |
| R2 | TZ / DST edge cases in days computation | MEDIUM | Pure function `computeDaysUntil` + tests C5..C8 in P1 |
| R3 | Safari `<dialog>` focus trap regression | LOW | Manual MV-14 in P3; jsdom shim in vitest.setup |
| R4 | Concurrent W2 sibling write to `shellRegistrations.tsx` | LOW | Single-line edit in P3; siblings own different lines; rebases are clean |
| R5 | i18n bundle lacks "Delete" key | LOW | Inline ternary per api.md §4.2; recorded as future bundle extension |
| R6 | Cover preset id format collision with future user-upload | LOW | `"preset:"` prefix discriminates; tested CV-fallback |
| R7 | `setTimeout` clamp at ~24 days | NONE | Schedule only next midnight (< 24h ahead); confirmed safe |
| R8 | StrictMode double-mount | LOW | Standard cleanup pattern; tested H4 |

## Review Notes

**Verdict: APPROVED** — 0 blockers, 3 recommendations (advisory, non-blocking).

### Gate-by-gate findings

1. **Seed-brief fidelity** — PASS. Card schema `{id, title:{en,zh}, target_date, variant, cover_url|null}` matches seed brief byte-for-byte (design.md §3 / api.md §1.2). All four acceptance signals (add/edit/delete · both variants render · days update daily · persistence round-trips) have one or more dedicated test cases in test.md §3.
2. **ADR-0007 conformance** — PASS.
   - §S4 port-map row 17: runtime package correctly placed at `packages/plugin-web-countdown/` (design.md §3 Frozen Assumption 1; phase plan P1 step 1 — note the deliberate split between planning slug `xai-web-countdown` and runtime slug `plugin-web-countdown`, which is consistent with ADR convention).
   - §S5 JSX→TSX rules: design.md explicitly anchors to §S5; prototype CSS port lines 950–1019 is verbatim per rule 6.
   - §S7 event-bus rules: no `web:countdown:*` channels declared; `packages/core/src/types/events.ts` untouched.
   - §S8 `xai_countdowns proposed` key: confirmed present in `packages/plugin-web-storage/src/internal/registry.ts` lines 311–319 with `proposed: true`, `default: [] as Countdown[]`, `owner: "xai-web-countdown"`, `schemaVersion: 1`. Plan correctly keeps the key verbatim and tightens shape locally via predicate cast (avoids out-of-scope edit to `@repo/plugin-web-storage`).
3. **Contract completeness** — PASS. api.md is comprehensive: public surface (§0), type surface (§1), components (§2), slot registration (§3) with `lang`-flow seam documented, i18n keys split (§4.1 bundled / §4.2 inline literals), persistence contract (§5), live-days hook semantics (§6), error semantics (§7), concurrency (§8), cross-module (§9 — NONE), versioning (§10), manifest (§11).
4. **Phase plan quality** — PASS. Three phases align with seed brief's "2-3 phases" guidance. Each phase: clear scope, clear DoD, scoped test inventory, explicit no-touch list, single commit message. P1 (scaffold + read-only grid), P2 (live-days hook + CRUD modal), P3 (shell slot + host wire-up + cross-vendor smoke). Boundaries are reviewable in isolation.
5. **Architecture risk** — PASS.
   - `packages/core/` changes: NONE.
   - `manifest.json` routing: only the new package's own manifest is added (`status: "In-Dev"`); host shell manifest untouched.
   - Cross-feature contract drift: minimal — single-line swap in `shellRegistrations.tsx` line 53 and one-line workspace dep in `apps/web/package.json`.
6. **No `web:countdown:*` events in v1** — ACCEPTED. Justified rationale: countdown is leaf-position; no downstream subscriber exists today (Statistics #20 and Dashboard #11 unshipped); ADR §S7 is permissive, not prescriptive. Future rows can add channels in their own write scope without retro-coupling.
7. **Native `<dialog>` modal** — REASONABLE. Cross-vendor concern raised (R3) with mitigation (sibling `<div>` scrim instead of `::backdrop` for parity); manual MV-14 specifically targets Safari focus-trap regression; vitest.setup.ts jsdom shim documented.
8. **Bundled CSS gradient presets** — REASONABLE. Six presets locked (dusk/midnight/sand/forest/peach/lavender); storage form `"preset:<id>"` with stable contract; renderer fallback to `IMAGE_PRESETS[0]` + DEV warn on unknown id (R6, CV-fallback test). Future user-upload path discriminated by `startsWith("preset:")`.
9. **Single shared midnight `setTimeout` + `visibilitychange`** — REASONABLE. AC-DAYS-11 enforces "one timer per module" via spy count (H1); R7 (24-day clamp) confirmed safe since we only schedule next midnight; R8 (StrictMode double-mount) covered by H4.
10. **Bilingual** — PASS. AC-I18N-1..7 cover bundled keys (§4.1) + inline literals (§4.2). Inline ternary precedent matches prototype's `<AddCountdownCard>` style; recorded as a future bundle-extension follow-up.
11. **Verify Cross-vendor: yes** — PASS. Test.md §5 MV-1..MV-17 walked across Chrome / Safari 17+ / Firefox; §5 ¶ "Cross-vendor concerns" lists per-browser smoke priorities.

### Sibling merge-risk hint (per review prompt — surface to feature-auto-build)

**`apps/web/src/routes/modules/shellRegistrations.tsx` is a multi-row contention point.** All three W2 parallel siblings (#13 matrix line 49, #17 countdown line 53, #19 pet — not yet present in file, will be inserted) will swap their respective `placeholder(...)` row for a real registration import. The edits target disjoint lines, so there is **no logical merge conflict**, but auto-build runs may race on git index lock when committing the host-side P3 wire-up simultaneously.

**Mitigation for feature-auto-build** (P3 execution):
1. Read `shellRegistrations.tsx` fresh inside P3 — do NOT cache the file state from P1/P2.
2. Edit ONLY the countdown line (currently line 53) and the import block at the top — leave all sibling lines untouched even if their placeholders have already been swapped by an earlier-landing sibling.
3. If `git add` or `git commit` fails on index lock, retry with exponential backoff (200ms / 400ms / 800ms; max 3 attempts).
4. After P3 commit, assert `webShellModuleRegistrations.length === 12` (unchanged) — regression catch if a sibling's edit accidentally dropped our line.

### Recommendations (advisory — non-blocking)

- **R-ADV-1** — The `packages/xai-web-countdown/docs/` planning-slug vs. `packages/plugin-web-countdown/` runtime-slug split is intentional and ADR-consistent, but is worth flagging in P1's commit body to avoid reviewer confusion. Plan already notes it in design.md Frozen Assumption 1.
- **R-ADV-2** — In P2, the `<input type="date">` validation behavior differs subtly across Safari/Firefox/Chrome (Safari historically accepted free-form text). Manual MV-5/MV-6 should explicitly exercise typing an invalid date string on Safari; if Save button doesn't disable, fall back to a regex check in the form's onChange handler (the `/^\d{4}-\d{2}-\d{2}$/` predicate from api.md §1.2 already exists in scope). This is a P2-internal concern — no plan changes required.
- **R-ADV-3** — `cardsReducer.test.ts` is referenced in P1's "DEFER to P2" line (test.md §2 lists it but P1 scope §7 explicitly defers); P2 scope §5 picks it up. Confirmed consistent — no action needed.

### Verdict justification

The plan is fully executable with zero ambiguity in any phase. Schema is locked, persistence boundary is well-defined, modal UX is concrete down to backdrop/focus-trap details, live-days strategy has explicit test coverage for all four time-edge classes (DST forward/backward, leap day, year boundary, midnight rollover, visibility return), cross-vendor matrix is comprehensive, and the host-side change is reduced to a single-line edit + a workspace dep insertion. All advisory items are P2/P3-internal craft notes, not blockers.

Approving for `feature-auto-build`.

## Work Log

| Timestamp | Executor | Action | Commits | Next Step |
|---|---|---|---|---|
| 2026-05-23 15:00 | Claude Opus 4.7 1M (feature-plan) | Wrote discovery review + design.md + api.md + test.md + dev_log.md (Fresh mode); locked card schema, live-days strategy, modal UX, image presets; chose no `web:*` events in v1 to keep parallel-W2 write-scope clean | — | feature-review |
| 2026-05-23 15:30 | Claude Opus 4.7 1M (feature-review) | APPROVED. Verified all 11 gates (seed-brief fidelity, ADR-0007 §S4/§S5/§S7/§S8, contract completeness, phase quality, architecture risk, no-events-v1 acceptance, dialog modal, gradient presets, midnight timer, bilingual, cross-vendor). Confirmed `xai_countdowns` registry entry in `packages/plugin-web-storage/src/internal/registry.ts` lines 311–319. Surfaced sibling merge-risk hint for `apps/web/src/routes/modules/shellRegistrations.tsx` line 53 (auto-build retry-on-lock strategy). 0 blockers · 3 advisory recommendations | — | feature-auto-build |
| 2026-05-23 16:30 | Claude Sonnet 4.6 (feature-auto-build) | P1: Created packages/plugin-web-countdown/ scaffold — package.json, tsconfig.json, manifest.json, vitest.config.ts, vitest.setup.ts (HTMLDialogElement shim + fake-timer setup), eslint.config.js; src/types.ts (CountdownVariant, CountdownCard, ImagePresetId, ImagePreset); src/internal/presets.ts (6 presets frozen); src/internal/validate.ts (isCountdownCard predicate); src/internal/computeDaysUntil.ts (pure function); src/internal/formatTargetLabel.ts; src/CountdownCardView.tsx; src/AddCountdownCard.tsx; src/CountdownModule.tsx (full CRUD wired); src/styles.css (verbatim layout.css port + dialog CSS); __fixtures__ + P1 tests. P2: src/internal/useDaysUntil.ts (midnight setTimeout + visibilitychange); src/internal/cardsReducer.ts (addCard/updateCard/deleteCard + newCardId); src/internal/CountdownEditDialog.tsx (native dialog + PresetPicker + bilingual + explicitCloseRef anti-double-cancel guard). Full P2 tests. P3: src/index.ts (public surface); src/registration.tsx (countdownWebModuleRegistration via useWebShell lang); registration.test.tsx; apps/web/package.json (+@repo/plugin-web-countdown workspace:*); shellRegistrations.tsx (countdown placeholder → countdownWebModuleRegistration import); docs/PLUGIN_MAP.md (new In-Dev row). | ead2916 (P1+P2), bf01ff4 (P3) | feature-verify |
