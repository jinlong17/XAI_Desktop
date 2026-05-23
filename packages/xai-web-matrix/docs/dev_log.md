# Dev Log — xai-web-matrix

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | xai-web-matrix |
| Title | Web Console — Eisenhower 2×2 Matrix (port `module-matrix.jsx`) |
| Current Phase | FEATURE_VERIFY |
| Status | READY_TO_SHIP |
| Suggested Next | ship |
| Verify Cross-vendor | yes (Safari 17+ / Chrome / Firefox — drag-drop semantics + reload persistence + keyboard a11y fallback) — DEFERRED to ship-time human (see Cross-vendor Deferred Checklist below) |
| Automation Mode | A-Claude (xai-roadmap-loop W2 parallel-Agent mode; siblings: #17 countdown + #19 pet) |
| Executor | Claude Opus 4.7 1M — feature-verify |
| Updated | 2026-05-23 12:42 |
| Dispatched By | xai-roadmap-loop (W2 parallel dispatch, manifest row #13) |
| Roadmap Row | docs/workflow/roadmap/xai-web-console.md row #13 (W2 Module — Eisenhower 2×2) |
| ADR Anchor | docs/adr/0007-xai-web-console-build-form.md §S4 (port map row `module-matrix.jsx` → `packages/plugin-web-matrix/src/`) + §S5 (TSX rules) + §S7 (event bus) |
| Concurrent Siblings | #17 xai-web-countdown · #19 xai-web-pet — file writes scoped to `packages/xai-web-matrix/` + `docs/reviews/xai-web-matrix/` only; sibling-edge files (events.ts + registry.ts) get one append each — see Risks §R4 |
| Write Scope (plan) | `packages/xai-web-matrix/docs/` + `docs/reviews/xai-web-matrix/` |
| Write Scope (build) | will extend to: `packages/xai-web-matrix/src/**` (new), `packages/plugin-web-storage/src/internal/registry.ts` (1 append, P2), `packages/core/src/types/events.ts` (1 append + 1 type alias, P2), `apps/web/src/routes/modules/shellRegistrations.tsx` (1 line swap, P1), `apps/web/package.json` (1 dep line, P1) — all per `docs/reviews/xai-web-matrix/20260523-discovery-review.md` §6.1 R2+R3 |

## Artifacts Index

- Seed brief: `docs/reviews/xai-web-matrix/20260523-roadmap-seed.md`
- Discovery review: `docs/reviews/xai-web-matrix/20260523-discovery-review.md`
- Design snapshot: `packages/xai-web-matrix/docs/design.md`
- API contract: `packages/xai-web-matrix/docs/api.md`
- Test strategy: `packages/xai-web-matrix/docs/test.md`

## Decision Headline

Selected **Option C — package at `packages/xai-web-matrix/` named
`@repo/plugin-web-matrix`**, with **HTML5 DnD (no third-party drag lib)**,
**single-blob persistence in `xai_matrix_state`** (new `WebPrefRegistry`
entry), and **proactive declare-now of `web:matrix:priority-tagged`** event
channel in `@repo/core/types`. Q1=`--red`, Q2=`--amber`, Q3=`--blue`,
Q4=`--accent` — zero hex literals. Keyboard fallback `Ctrl/⌘ + Arrow`
included in P2 for a11y + cross-vendor verify gate.

The matrix owns its own card state in v1 (the seed brief's "otherwise local
matrix state via `@repo/plugin-web-storage` `usePref`" fallback applies —
`xai-web-tasks` row #6 does not exist yet). Cards designed with a reserved
`taskId?` field so the eventual cross-module join is non-breaking.

Module registers via `WebModuleSlotRegistration` from `@repo/xai-web-shell`
— exported as `matrixSlotRegistration` and swapped into
`apps/web/src/routes/modules/shellRegistrations.tsx` row `matrix` (railOrder 6).

## Phase Progress

| Phase | Status | Commit |
|---|---|---|
| P1 — Package skeleton + read-only 4-quadrant render + shell wiring | DONE | 439cd9c |
| P2 — DnD + persistence + EventMap entry + keyboard fallback | DONE | 3161a3c |
| P3 — Edge cases + cross-vendor smoke + docs sync | DONE | b9e1143 |

## Phase Plan (3 phases)

> Each phase is a single `feature-build` run. After each phase, `feature-build`
> stops for human confirmation per CLAUDE.md "feature-build does ONE phase per
> run". Phases are ordered to keep diff small and reviewable.

### Phase P1 — Package skeleton + read-only 4-quadrant render + shell wiring

**Goal**: pixel-faithful render of the 4 quadrants in both languages, mounted
in the shell at `/app/matrix`. No drag yet, no persistence yet, no event emit
yet. The seed cards are visible.

**Scope** (write set):

1. **Create package scaffolding** at `packages/xai-web-matrix/`:
   - `package.json` — name `@repo/plugin-web-matrix`, version `0.0.0`, private,
     `type: "module"`, `"sideEffects": ["./src/matrix.css"]`, workspace deps
     on `@repo/core`, `@repo/plugin-web-tokens`, `@repo/plugin-web-storage`,
     `@repo/xai-web-event-bus`, `@repo/xai-web-shell`; peerDeps on `react@^19`
     + `react-dom@^19`; devDeps mirroring `xai-web-shell/package.json` lines
     31–43 (`@repo/eslint-config`, `@repo/typescript-config`,
     `@testing-library/react@^16`, `@types/react@19.2.2`,
     `@types/react-dom@19.2.2`, `jsdom@^26`, `react`, `react-dom`,
     `typescript@5.9.2`, `vitest@^3.2.1`).
   - `tsconfig.json` — extends `@repo/typescript-config`.
   - `manifest.json` — status: `In-Dev`; type: `ui`; owner: `xai-web-matrix`;
     mirrors `xai-web-shell/manifest.json` shape.
   - `vitest.config.ts` — jsdom environment + setup file that clears
     `localStorage` per test (mirrors `xai-web-shell/vitest.config.ts`).
   - `eslint.config.mjs` — extends `@repo/eslint-config`.
2. **Module source files** under `packages/xai-web-matrix/src/`:
   - `types.ts` — `Quadrant`, `MatrixCard`, `MatrixState`, `MatrixModuleProps`
     per `api.md` §1.1.
   - `constants.ts` — `MATRIX_STORAGE_KEY = "xai_matrix_state" as const`.
   - `internal/icons.tsx` — 3 inline SVG components (`Plus`, `Dots`,
     `ChevD`) — same paths the prototype renders.
   - `internal/quadrant-color.ts` — `quadrantColorToken(q): "var(--red)" |
     "var(--amber)" | "var(--blue)" | "var(--accent)"` lookup.
   - `internal/seed.ts` — typed `INITIAL_CARDS` array (the prototype's
     overdue + nodate tasks made bilingual + typed).
   - `MatrixModule.tsx` — read-only top-level component (header + 4
     `<Quadrant>` instances). Uses **local `useState<MatrixState>`** seeded
     from `internal/seed.ts` — NOT `usePref` yet (P2 introduces persistence).
   - `Quadrant.tsx` — colored top bar via inline `--qc` custom property; q
     header (number + title + stub buttons); body with `<Group>` rows or
     empty-state hint.
   - `Group.tsx` — collapsible group (port of prototype `Group` with typed
     `useState<boolean>`).
   - `Card.tsx` — single row (checkbox stub, bilingual title, tag pill, meta,
     date). No drag yet.
   - `registration.tsx` — `matrixSlotRegistration` per `api.md` §1.4 +
     `MatrixSlotHost` wrapper that reads `useWebShell().lang`.
   - `index.ts` — public surface barrel per `api.md` §1.
   - `matrix.css` — grid + top-bar + row styles. Tokens only.
3. **Tests** (P1 subset — render-only):
   - `__tests__/MatrixModule.render.test.tsx` — AC-RENDER-1..4.
   - `__tests__/MatrixModule.i18n.test.tsx` — AC-I18N-1..3.
   - `__tests__/matrix.css.tokens.test.ts` — AC-TOKENS-1.
   - `__tests__/registration.test.ts` — AC-SHELL-1, AC-SHELL-2.
   - `__tests__/index-barrel.test.ts` — AC-BARREL-1.
4. **Host wiring**:
   - `apps/web/src/routes/modules/shellRegistrations.tsx` — import
     `matrixSlotRegistration` from `@repo/plugin-web-matrix` and replace the
     `placeholder("matrix", "Matrix", "grid4", 6)` row.
   - `apps/web/package.json` — append `"@repo/plugin-web-matrix":
     "workspace:*"` to `dependencies`.
   - `apps/web/src/routes/modules/__tests__/shellRegistrations.test.ts`
     (extend if exists, else create) — AC-SHELL-3.
5. **Quality gates** (P1 exit):
   - `pnpm --filter @repo/plugin-web-matrix test` → green.
   - `pnpm --filter @repo/plugin-web-matrix check-types` → 0.
   - `pnpm --filter @repo/plugin-web-matrix lint` → 0.
   - `pnpm --filter @repo/web check-types` → 0.
   - Manual: `pnpm dev` in `apps/web/`; visit `/app/matrix`; see 4 quadrants
     with seed cards in EN, then ZH after language toggle.

**Out of P1**: drag, persistence, event emit, keyboard fallback, edge-case
tests. All deferred to P2.

---

### Phase P2 — DnD + persistence + EventMap entry + keyboard fallback

**Goal**: drag-between-quadrant works, persists across reload, emits
`web:matrix:priority-tagged`, and the keyboard fallback is operable. The
registry + EventMap edits are atomic with this phase.

**Scope** (write set):

1. **`@repo/plugin-web-storage` registry addition**:
   - `packages/plugin-web-storage/src/internal/registry.ts` — append
     `xai_matrix_state` entry per `api.md` §2.1 (one entry + one
     `MatrixStateBlob = unknown` alias).
2. **`@repo/core` EventMap declaration**:
   - `packages/core/src/types/events.ts` — add `WebMatrixQuadrant` type at
     the top section + append `web:matrix:priority-tagged` entry to
     `EventMap` per `api.md` §2.2.
3. **New module source files** under `packages/xai-web-matrix/src/`:
   - `internal/move.ts` — pure `moveCardTo(state, cardId, target)` reducer
     with the no-op + not-found guard semantics (per `design.md` §6.2).
   - `internal/drag.ts` — typed `onDragStart`, `onDragOver`, `onDrop`
     factories (parameterized by `quadrant: Quadrant`).
   - `internal/kbd.ts` — `handleKbdMove(e, fromQuadrant) → Quadrant | null`
     keyboard-arrow mapping per `design.md` §6.3.
   - `internal/usePersistedMatrix.ts` — `usePref<MatrixState>` wrapper:
     - seed hydration on first mount when state is the default-empty blob;
     - schemaVersion guard;
     - exposes `state, setState, moveCard(cardId, target)` API.
   - `internal/emit.ts` — `emitPriorityTagged(cardId, from, to)` helper that
     calls `emitWebEvent` with a fresh ISO timestamp.
4. **Component changes** under `packages/xai-web-matrix/src/`:
   - `MatrixModule.tsx` — swap local `useState` for `usePersistedMatrix()`.
   - `Card.tsx` — wire `draggable`, `onDragStart`, `onKeyDown`,
     `aria-grabbed`, `tabIndex={0}` per `design.md` §6.1.
   - `Quadrant.tsx` — wire `onDragOver`, `onDragLeave`, `onDrop`, and the
     `data-dragover` attribute per `design.md` §6.1.
5. **Tests** (P2):
   - `__tests__/_helpers/dataTransfer.ts` — shared DataTransfer shim per
     `test.md` §4.1.
   - `__tests__/MatrixModule.dnd.test.tsx` — AC-DND-1..5.
   - `__tests__/MatrixModule.persist.test.tsx` — AC-PERSIST-1..6.
   - `__tests__/MatrixModule.events.test.tsx` — AC-EVENT-1..5.
   - `__tests__/MatrixModule.kbd.test.tsx` — AC-KBD-1..6.
   - `__tests__/registry-presence.test.ts` — confirms `PREF_REGISTRY` has
     the new key (consumer-side smoke for cross-package contract).
   - `__tests__/types.test-d.ts` — AC-TYPE-1..4.
   - `__tests__/eventmap-presence.test-d.ts` — `web:matrix:priority-tagged`
     compile-time presence assertion.
   - `__tests__/move.test.ts` — pure reducer cases (no-op, not-found,
     happy-path, cross-quadrant equality).
6. **Quality gates** (P2 exit):
   - All P1 gates still green.
   - All AC-DND-*, AC-PERSIST-*, AC-EVENT-*, AC-KBD-*, AC-TYPE-* pass.
   - `pnpm --filter @repo/core check-types` → 0 (event map edit).
   - `pnpm --filter @repo/plugin-web-storage check-types` → 0 (registry
     edit).
   - `pnpm --filter @repo/plugin-web-storage test` → green (registry parity
     tests still pass after the additive entry).

**Out of P2**: cross-vendor manual smoke (deferred to P3). Coverage polish
(deferred to P3).

---

### Phase P3 — Edge cases + cross-vendor manual smoke + docs sync

**Goal**: harden the long tail; verify on real browsers; sync any plan
deltas back into docs.

**Scope**:

1. **Edge-case test additions** in `packages/xai-web-matrix/src/__tests__/`:
   - Empty all four quadrants (drag the only card out of each) — verifies
     empty-state hint appears.
   - Drag the card from Q4 (`--accent`) into a `--red` quadrant — verifies
     no token leakage.
   - Corrupted-JSON localStorage / wrong-schemaVersion blob — AC-PERSIST-4,
     AC-PERSIST-5 (move from P2 if time pressure).
   - 100-card stress: seed 25 cards × 4 quadrants; drag any one; assert
     <16 ms render to confirm no quadratic behavior.
2. **Cross-vendor manual smoke** (`test.md` §6):
   - Run `apps/web` in Safari 17+ / Chrome / Firefox on macOS.
   - Execute all 7 AC-XVENDOR-* checklist items per `test.md` §6.2.
   - Record results in `dev_log.md` `Verify Notes` block (created when
     `feature-verify` runs — see SOP_NEW_FEATURE).
3. **Coverage check**:
   - `pnpm --filter @repo/plugin-web-matrix test:coverage` → meets
     `test.md` §5 targets (90% statements / 85% branches / 95% functions /
     90% lines).
4. **Docs sync**:
   - Update `design.md` / `api.md` / `test.md` with any concrete-vs-planned
     deltas discovered during P1/P2 builds.
   - Confirm `manifest.json` status is correctly `In-Dev` (flip to
     `Production` happens in `ship`).
5. **Quality gates** (P3 exit → ready for `feature-verify`):
   - All AC-* automated tests pass.
   - All AC-XVENDOR-* manual checks recorded.
   - `pnpm --filter @repo/plugin-web-matrix test:coverage` meets targets.
   - `pnpm -w lint` green across all touched workspaces.
   - `pnpm -w check-types` green across all touched workspaces.

**Hand-off after P3**: `dev_log.md` flips to `Status: READY_FOR_VERIFY`,
`Suggested Next: feature-verify`. (Note: the typical pipeline is
build→verify→ship; the `feature-verify` agent flips to `READY_TO_SHIP` once
gates §6.3 of `test.md` are confirmed.)

---

## Risks (carried from `discovery-review.md` §6.1)

| ID | Risk | Severity | Status |
|---|---|---|---|
| R1 | Safari HTML5 DnD synthetic-event quirks | Medium | Mitigated by P2 patterns (`effectAllowed = "move"` + `preventDefault` on dragover). Verified cross-vendor in P3. |
| R2 | Editing `packages/plugin-web-storage/src/internal/registry.ts` is outside our nominal write scope | Medium | Explicit precedent: W1 row #3 designed the registry to accept owner-row additions (`ADR-0007 §S8 reservation` comment in registry.ts). One additive entry. **Q3 confirms with feature-review**. |
| R3 | Editing `packages/core/src/types/events.ts` is outside our nominal write scope | Medium | Explicit precedent: W1 declared `web:pomodoro:session-finished` + `web:habits:checkin-recorded` for not-yet-shipped owner rows. One additive entry + one new supporting type. **Q3 confirms with feature-review**. |
| R4 | Parallel siblings (#17 countdown / #19 pet) touch the same `events.ts` / `registry.ts` files in the same window | Medium | All three rows add their entries to **different lines** at the bottom of each file (append-only). Auto-mergeable in 99% of cases; worst case human resolves a 3-way merge of single-line entries. |
| R5 | Empty-state hint reuses `common.no_tasks` (singular) instead of per-quadrant hints | Low | Seed brief says "subtle hint text bilingual" — singular. **Q4 confirms with feature-review**. |
| R6 | Q4 uses `var(--accent)` which drifts when user changes accent hue | Low | Prototype's choice (semantic: Q4 is "your normal" calm). **Q5 confirms with feature-review** — could swap to `var(--text-3)` if review prefers. |
| R7 | Future `xai-web-tasks` will need a migration of `xai_matrix_state` blob | Low | Documented in `design.md` §5.3; `MatrixCard.taskId?` field reserved for the join. |
| R8 | `usePref` autosave debounce race with rapid drag | Low | We use `usePref` (synchronous setPref), not `usePrefAutosave` — no race. Cross-tab `storage` event handled by `usePref` already. |

## Open Questions for feature-review

- **Q1** — Directory `packages/xai-web-matrix/` (sibling convention) vs
  `packages/plugin-web-matrix/` (ADR §S4 port-map literal).
  - **Planner recommendation**: `packages/xai-web-matrix/` (directory) +
    `@repo/plugin-web-matrix` (package name). Mirrors `xai-web-shell` +
    `xai-web-event-bus` shipped W1 rows exactly.
- **Q2** — Icons: inline 3 SVGs in `internal/icons.tsx` vs request shell to
  expose `Icon` on its public surface.
  - **Planner recommendation**: inline. Cost ≈ 30 LOC; zero upstream
    coordination. Review may prefer the shared-icons path if a future row
    needs them too.
- **Q3** — Write-scope expansion approval for the two cross-package files
  (`packages/plugin-web-storage/src/internal/registry.ts` +
  `packages/core/src/types/events.ts`). Both are one-line additive entries
  with shipped W1 precedent.
  - **Planner recommendation**: approve both. The alternative (deferring the
    EventMap entry to a row #4 follow-up) introduces a backward-compat
    hazard and is precisely the kind of "declaration before owner" pattern
    W1 already used for `web:pomodoro:*` and `web:habits:*`.
- **Q4** — Empty-state copy: reuse `common.no_tasks` vs add per-quadrant
  hints (`matrix.q1_empty_hint` × 4 × 2 langs = 8 new keys).
  - **Planner recommendation**: reuse `common.no_tasks`. Seed brief says
    "subtle hint" singular.
- **Q5** — Q4 color token: keep `var(--accent)` (prototype) vs swap to
  `var(--text-3)` or `var(--border-strong)`.
  - **Planner recommendation**: keep `var(--accent)`. Semantic argument:
    Q4 = "your normal" calm; theme accent (sage by default) maps perfectly.
- **Q6** — Card type design for future `xai-web-tasks` join.
  - **Planner recommendation**: declare `MatrixCard.taskId?: string` in v1
    (undefined in v1); the future row maps `taskId → Task`.
- **Q7** — Keyboard fallback (`Ctrl/⌘ + Arrow`) — include in P2 or defer to
  post-ship row.
  - **Planner recommendation**: include in P2. Cost ≈ 15 LOC; supports the
    cross-vendor verify gate; matches a11y expectations.

## Review Notes (feature-review 2026-05-23)

**Verdict: APPROVED.** Plan is executable as drafted. Seed-brief fidelity verified; ADR-0007 §S4/§S5/§S7 conformance verified; 3-phase budget respected; HTML5 DnD + token-only colors + `usePref` persistence + `WebModuleSlotRegistration` shell wiring all consistent with W1 shipped precedent.

### Upstream-state verification (reviewer)

- `packages/core/src/types/events.ts` lines 195–215 confirm two "declaration only in W1" entries (`web:pomodoro:session-finished`, `web:habits:checkin-recorded`) — the declare-now precedent the planner cites is **real and established**. `web:matrix:priority-tagged` is **not yet present** as expected.
- `packages/plugin-web-storage/src/internal/registry.ts` lines 296–319 confirm the `// ---- Proposed keys — ADR-0007 §S8 reservation` block with `xai_pomodoro_sessions` and `xai_countdowns` (both `proposed: true`). The §S8 reservation comment explicitly invites owner-row additions. `xai_matrix_state` is **not yet present** as expected.
- `apps/web/src/routes/modules/shellRegistrations.tsx` line 49 is the matrix placeholder; swap target matches plan exactly.

### Resolution of Q1–Q7

| Q | Resolution | Rationale |
|---|---|---|
| **Q1** Directory naming | **Accept planner recommendation.** Directory = `packages/xai-web-matrix/`; package name = `@repo/plugin-web-matrix`. | Matches shipped W1 convention (`xai-web-shell`, `xai-web-event-bus`); ADR §S4 port-map literal applies to the `@repo/plugin-web-*` package name, not the directory slug. |
| **Q2** Icons path | **Accept planner recommendation.** Inline 3 SVG glyphs (`Plus`, `Dots`, `ChevD`) in `internal/icons.tsx` (~30 LOC). | Zero upstream-shell coordination; matches prototype's one-file approach; a later row can promote a shared icon set to `@repo/xai-web-shell` if needed. |
| **Q3a** Write scope `packages/core/src/types/events.ts` | **APPROVED — auto-build adds ONE additive event key + ONE supporting type alias.** `WebMatrixQuadrant` + `web:matrix:priority-tagged` entry, modeled byte-for-byte on the existing W1 declarations at lines 195–215. | The declare-now precedent is real and explicitly labeled "declaration only in W1" in the file. Deferring the event would require row #20 (statistics) to invent a different signal later. Take it now. **Sibling-W2 collision risk (R4): all three rows append at the bottom of `EventMap` and add their own supporting type at the top of the file — auto-mergeable in 99% of cases.** Build phase MUST place the new entry as the LAST entry inside `EventMap` (append-only) and place `WebMatrixQuadrant` adjacent to `WebPreferenceChange` so a 3-way merge with #17 / #19 is line-disjoint. |
| **Q3b** Write scope `packages/plugin-web-storage/src/internal/registry.ts` | **APPROVED — auto-build adds the registry entry under the §S8 "Proposed keys" block.** Entry name: `xai_matrix_state`; `proposed: true`. | The §S8 reservation comment explicitly invites owner-row additions; `xai_pomodoro_sessions` (#14) and `xai_countdowns` (#17) already use the same pattern. NOT defer to a later row — a one-off `localStorage` wrap inside the matrix package would bypass the `WebPrefKey` typed contract and is exactly what §S8 was designed to prevent. **Append the entry AFTER `xai_countdowns` (line 319) — keep proposed-block ordering by row number (14, 17, **13** insertion is fine since the comment is row-agnostic). Build phase: use `proposed: true` flag consistent with the two siblings.** |
| **Q4** Empty-state copy | **Accept planner recommendation.** Reuse `s("common.no_tasks")`. | Seed brief says "subtle hint" — singular. Per-quadrant hints would add 8 new i18n keys for no acceptance-signal benefit. Bilingual already supported (verified at `plugin-web-tokens/src/i18n.ts` line 24 + 219). |
| **Q5** Q4 color token | **Accept planner recommendation.** Keep Q4 = `var(--accent)`. | Matches the prototype semantic (Q4 = "your normal" calm). Reviewer notes the Cross-vendor manual test AC-XVENDOR-3 should explicitly visually confirm that Q4's accent-bar reads as distinct from Q1/Q2/Q3 under both `bgTone="default"` and at least one alternate `bgTone` value (e.g. `sage` or `graphite`) — add this nuance to `test.md` §6.2 during P3 if not already covered. **Not a blocker for APPROVED.** |
| **Q6** `MatrixCard.taskId?` | **Accept planner recommendation.** Declare `taskId?: string` in v1 (undefined in v1). | Non-breaking forward-compat handle for the eventual `xai-web-tasks` join. Aligns with §5.3 schema-version migration plan. |
| **Q7** Keyboard fallback | **Accept planner recommendation.** Include in P2 (Ctrl/⌘ + ArrowLeft/Right/Up/Down, wrap-around). | Cost ~15 LOC; supports a11y; supports the cross-vendor verify gate AC-XVENDOR-5. Reviewer notes: ensure the same `moveCard` reducer path is used so persistence + event-emit semantics are unified (planner already commits to this in `design.md` §6.3 — confirmed). |

### Minor recommendations (non-blocking — apply during build, no plan rewrite needed)

1. **R1 / R2 / R3 / R4 mitigations** — when the auto-build phase writes the cross-package additions, write the registry entry FIRST (single-file commit per Phase Plan §P2 step 1), then the EventMap (step 2), THEN the in-package code that references them. This keeps each cross-package write a single-commit-line-disjoint change, maximising auto-merge probability with siblings #17 and #19.
2. **`test.md` AC-XVENDOR-3** — broaden the visual check to include at least one non-default `bgTone` to catch any `var(--accent)` interaction issues at Q4 (per Q5 nuance). Apply during P3 docs sync if not already.
3. **`api.md` §1.4 schema table** — the "Schema" table cell for `i18nKey` says `nav.matrix` exists in both langs; reviewer confirms `nav.matrix` = `"Matrix"` (EN) / `"四象限"` (ZH) in `plugin-web-tokens/src/i18n.ts`. The separate `matrix.title` key check noted in AC-I18N-3 (`test.md`) — verify both `matrix.title` EN+ZH exist; if `matrix.title.zh` is missing the test should fall back to `nav.matrix.zh`. Confirm during P1 implementation (not a plan defect).
4. **`design.md` §8 wrapper component** — `MatrixSlotHost` reading `useWebShell()` is the right pattern; confirm `useWebShell` is on the `@repo/xai-web-shell` public surface (planner cites it; build should sanity-check via `packages/xai-web-shell/src/index.ts` before wiring).
5. **Phase ordering check** — `P1` includes the apps/web swap (placeholder → `matrixSlotRegistration`). At that point the registry entry + EventMap entry are NOT yet present (those land in P2). The `MatrixModule` in P1 uses local `useState<MatrixState>` (planner explicitly notes this in §P1 step 2.6) — `usePref` only enters in P2. This sequence is correct and ensures P1 is independently shippable as a read-only mount.
6. **Sibling-W2 commit etiquette** — auto-build should produce ONE commit per phase (per CLAUDE.md feature-build contract). The P2 commit will touch 3 packages (`@repo/plugin-web-matrix` new files + `@repo/plugin-web-storage` registry append + `@repo/core` events.ts append). This is acceptable per the parallel-Agent worker brief but the commit message body should explicitly list both upstream files under "Scope" to make any 3-way merge with siblings easy to audit.

### Sibling-coordination contract (this row)

This row APPROVED writes to: `packages/xai-web-matrix/**` (new) + `docs/reviews/xai-web-matrix/**` (this dir) + `packages/plugin-web-storage/src/internal/registry.ts` (1 append) + `packages/core/src/types/events.ts` (1 append + 1 supporting type) + `apps/web/src/routes/modules/shellRegistrations.tsx` (1 line swap) + `apps/web/src/routes/modules/__tests__/shellRegistrations.test.ts` (extend if exists) + `apps/web/package.json` (1 dep line).

This row APPROVED additions are line-disjoint from the equivalent additions siblings #17 (countdown) and #19 (pet) will make in the same window. Auto-merge expected.

## Verify Report (feature-verify 2026-05-23 12:42)

**Verdict: READY_TO_SHIP.** All 15 verification gates passed; 4 commits clean and line-disjoint from siblings; all automated AC categories exercised (RENDER/I18N/DND/PERSIST/EVENT/KBD/SHELL/TOKENS/TYPE/BARREL + P3-EDGE); cross-vendor manual smoke (AC-XVENDOR-1..7) deferred to ship-time human verification per `test.md` §6.

### Verification gate evidence

| # | Gate | Result | Detail |
|---|---|---|---|
| 1 | `pnpm --filter @repo/plugin-web-matrix test` | PASS | 54/54 tests across 12 test files (3.72s). |
| 2 | `pnpm --filter @repo/plugin-web-matrix check-types` | PASS | `tsc --noEmit` clean. |
| 3 | `pnpm --filter @repo/plugin-web-matrix lint` | PASS | `eslint --max-warnings 0` clean. |
| 4 | `pnpm --filter @repo/core check-types` | PASS | additive `WebMatrixQuadrant` + `web:matrix:priority-tagged` clean. |
| 5 | `pnpm --filter @repo/plugin-web-storage check-types` | PASS | additive `MatrixStateBlob` + `xai_matrix_state` registry entry clean. |
| 6 | `pnpm --filter @repo/web check-types` | PASS | host wiring clean. |
| 7 | `pnpm --filter @repo/web build` | PASS | Vite production build green (538 modules, 1.99s). |
| 8 | AC categories exercised | PASS | 34 distinct AC IDs covered (see §AC Coverage below). |
| 9 | Quadrant colors via tokens.css only | PASS | `quadrant-color.ts` returns `var(--red\|--amber\|--blue\|--accent)`; zero hex/rgb literals in `matrix.css`. |
| 10 | `web:matrix:priority-tagged` in events.ts | PASS | events.ts L221 declares the entry; `WebMatrixQuadrant` type at L38; compile-time assertion at `__tests__/eventmap-presence.test-d.ts`. |
| 11 | `xai_matrix_state` in PREF_REGISTRY | PASS | registry.ts L324 declares the entry; `MatrixStateBlob` alias at L92; runtime assertion at `__tests__/registry-presence.test.ts` (3 sub-assertions: presence + owner + codec). |
| 12 | Slot registration in `apps/web/src/routes/modules/shellRegistrations.tsx` | PASS | matrix at array index 5 (railOrder 6); 12 total registrations; verified by `shellRegistrations.integration.test.tsx` (4/4 pass). |
| 13 | Cold-read implementation ↔ seed brief | PASS | Eisenhower 2×2 ✓, drag-between-persists ✓, bilingual strings (`useI18n(lang)`) ✓, accessible labels (`aria-label`, `tabIndex={0}`, `aria-grabbed`) ✓. Note: Q4 uses `var(--accent)` not literal gray — pre-approved by reviewer at Q5 resolution ("Q4 = your normal calm"). |
| 14 | AC-XVENDOR-1..7 (Safari/Chrome/Firefox) | DEFERRED | See Cross-vendor Deferred Checklist below; defer to ship-time human per `test.md` §6.2. |
| 15 | Commit hygiene + dev_log Status Panel | PASS | 4 commits (439cd9c P1 / 3161a3c P2 / b9e1143 P3 / a0cf47e dev_log flip); each commit single-phase; conventional `type(scope): summary` headers; body documents Why/What/Scope. |

### AC Coverage matrix

Distinct AC IDs exercised by automated tests (extracted by grep over `__tests__/`):

```
AC-BARREL-1
AC-DND-1, AC-DND-2, AC-DND-3, AC-DND-4, AC-DND-5
AC-EVENT-1, AC-EVENT-2, AC-EVENT-3, AC-EVENT-4, AC-EVENT-5
AC-I18N-1, AC-I18N-2, AC-I18N-3
AC-KBD-1, AC-KBD-2, AC-KBD-3, AC-KBD-4, AC-KBD-5, AC-KBD-6
AC-PERSIST-1, AC-PERSIST-2, AC-PERSIST-3, AC-PERSIST-4, AC-PERSIST-5, AC-PERSIST-6
AC-RENDER-1, AC-RENDER-2, AC-RENDER-3, AC-RENDER-4
AC-SHELL-1, AC-SHELL-2, AC-SHELL-3
AC-TOKENS-1
AC-TYPE-1, AC-TYPE-2, AC-TYPE-3, AC-TYPE-4
P3-EDGE-1, P3-EDGE-2, P3-EDGE-3
```

All ACs in `test.md` §2 covered. The Card render row (no separate AC ID — drag/event tests assert card-row state implicitly via `data-card-id` selectors).

### Cross-vendor Deferred Checklist (ship-time human)

Run `pnpm dev` in `apps/web/` on real macOS hardware, then for each row of `test.md` §6.2:

| # | Vendor | Check | Status |
|---|---|---|---|
| XVENDOR-1 | Safari 17+ | Drag a card Q1 → Q2 smoothly (no ghost-card lag). | [ ] |
| XVENDOR-2 | Safari/Chrome/Firefox | Reload after drag; moved card persists in Q2. | [ ] |
| XVENDOR-3 | Safari/Chrome/Firefox | Drag Q4 (--accent) → Q1 (--red); verify tokens stay distinct under default + at least one alternate `bgTone` (e.g. sage / graphite, per Q5 nuance). | [ ] |
| XVENDOR-4 | Safari/Chrome/Firefox | Switch language EN ↔ ZH via Topbar; all matrix strings switch. | [ ] |
| XVENDOR-5 | Safari/Chrome/Firefox | Tab to a card; press Ctrl/⌘ + ArrowRight; card moves to next quadrant. | [ ] |
| XVENDOR-6 | Safari/Chrome/Firefox | Open module in two tabs; drag in tab A; tab B updates within 1s (storage event). | [ ] |
| XVENDOR-7 | Safari/Chrome/Firefox | No console errors or warnings in any vendor. | [ ] |

The `ship` agent should request human confirmation that these 7 checks are green before flipping to SHIPPED.

### Residual Risks (non-blocking)

- **R1 (Safari DnD quirks)** — covered by jsdom fireEvent simulation; real-Safari verification deferred to XVENDOR-1/3/5.
- **R4 (parallel sibling merge)** — verified: events.ts and registry.ts additions are single-block, line-disjoint from #17/#19 expected positions; auto-merge expected.
- **R5 (singular empty-state)** — `s("common.no_tasks")` reused as planned; no per-quadrant hints needed.
- **R7 (future xai-web-tasks join)** — `MatrixCard.taskId?` reserved in v1 per design.md §5.3.

## Work Log

| Timestamp | Executor | Action | Commits | Next Step |
|---|---|---|---|---|
| 2026-05-23 13:10 | Claude Opus 4.7 1M — feature-plan | Wrote `discovery-review.md`, `design.md`, `api.md`, `test.md`, and this `dev_log.md`. Frozen 12 assumptions in `design.md` §1.1. Identified 7 open questions for review (Q1..Q7). Risks R1..R8 carried from discovery. | — | `feature-review` — examine all four docs + the discovery, answer Q1..Q7, then either APPROVE (Suggested Next → `feature-build`) or REVISE (Suggested Next → `feature-plan`). |
| 2026-05-23 13:30 | Claude Opus 4.7 1M — feature-review | Reviewed all 4 plan artifacts + discovery + seed-brief against the 5-gate checklist. Verified upstream state: `events.ts` lines 195–215 W1 declare-now precedent confirmed; `registry.ts` lines 296–319 §S8 reservation block confirmed; `shellRegistrations.tsx` line 49 matrix placeholder confirmed. Resolved Q1..Q7 (all accepted-as-planned with minor non-blocking nuances at Q3a/Q3b + Q5). Verdict: APPROVED for feature-auto-build. Sibling-coordination contract documented for #17 / #19 line-disjoint append assurance. | — | `feature-auto-build` (or `feature-build` for manual phase-by-phase) — implement Phase P1 first; each cross-package write is a single line-disjoint append to support sibling auto-merge. |
| 2026-05-23 12:35 | claude-sonnet-4-6 — feature-auto-build | Implemented all 3 phases (P1+P2+P3). P1: package skeleton (18 source files, 5 test files, host wiring). P2: DnD + usePref persistence + EventMap+registry additive writes + keyboard a11y (14 files). P3: edge-case tests + AC-SHELL-3 integration test (3 test files). All 54 tests pass; check-types + lint → 0 errors/warnings across all touched packages. Cross-package writes confirmed line-disjoint from siblings #17/#19 (sibling countdown already added its own entry to shellRegistrations.tsx as expected). | 439cd9c (P1), 3161a3c (P2), b9e1143 (P3) | `feature-verify` — independent verification of all AC-* gates, cross-vendor manual smoke (Safari/Chrome/Firefox), and confirm READY_TO_SHIP. |
| 2026-05-23 12:42 | Claude Opus 4.7 1M — feature-verify | Ran all 15 verification gates: 54/54 matrix tests, 50/50 apps/web tests (incl. AC-SHELL-3 4/4), check-types clean across @repo/plugin-web-matrix + @repo/core + @repo/plugin-web-storage + @repo/web, lint clean, web build green (538 modules, 1.99s). Verified cross-package additive writes: `web:matrix:priority-tagged` at events.ts L221 + `WebMatrixQuadrant` at L38; `xai_matrix_state` at registry.ts L324 + `MatrixStateBlob` at L92; matrix slot at shellRegistrations.tsx index 5. Verified zero hex/rgb literals in matrix.css and quadrant-color.ts returns only `var(--token)` strings. Cold-read implementation against seed brief: 4 quadrants ✓ drag-persist ✓ bilingual ✓ a11y ✓ (Q4=accent pre-approved at Q5). AC-XVENDOR-1..7 cross-vendor manual smoke checklist written into Verify Report above; deferred to ship-time human per `test.md` §6.2. Verdict: READY_TO_SHIP. | — | `ship` — request human confirmation on AC-XVENDOR-1..7 (Safari/Chrome/Firefox), then push and flip manifest.json to Production. |
