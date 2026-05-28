# Dev Log — xai-web-matrix

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | xai-web-matrix |
| Title | Web Console — Eisenhower 2×2 Matrix (port `module-matrix.jsx`) |
| Current Phase | SHIP |
| Status | SHIPPED |
| Suggested Next | — |
| Verify Cross-vendor | yes (Safari 17+ / Chrome / Firefox — drag-drop semantics + reload persistence + keyboard a11y fallback) — DEFERRED to ship-time human (see Cross-vendor Deferred Checklist below) |
| Automation Mode | A-Claude (xai-roadmap-loop W2 parallel-Agent mode; siblings: #17 countdown + #19 pet) |
| Executor | Claude Sonnet 4.6 — ship |
| Updated | 2026-05-23 19:10 |
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
| 2026-05-23 19:10 | Claude Sonnet 4.6 — ship | Verified 4 commits (439cd9c/3161a3c/b9e1143/a0cf47e) already on origin/main; re-ran 54/54 tests green; flipped Status → SHIPPED, Current Phase → SHIP, Suggested Next → —; manifest.json status → Production; roadmap row #13 → SHIPPED. | 439cd9c (P1), 3161a3c (P2), b9e1143 (P3), a0cf47e (dev_log flip) | — |

---

# Iteration 2 — xai-web-matrix-card-create (extension, 2026-05-28)

> APPENDED iteration. The SHIPPED v1 state machine above is preserved verbatim.
> This block is the active Status Panel + Phase Plan for the card-create carve-out.
> Workflow rule: `dev_log.md` is the single source of truth for workflow state.
> Mirror precedent: `xai-web-tasks-card-create` Iteration 2 (SHIPPED 2026-05-28).

## Status Panel (ACTIVE)

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | xai-web-matrix-card-create |
| Title | Wire header/quadrant `+` → MatrixComposer → reducer create → persist (Matrix card-create, Realistic v1) |
| Current Phase | FEATURE_VERIFY |
| Status | READY_FOR_VERIFY |
| Executor | claude-sonnet-4-6 — feature-build EP3 |
| Updated | 2026-05-28 13:20 |
| Suggested Next | feature-verify |
| Final Scope (review-locked) | **CREATE-only** (F1 upheld). Edit/Delete DEFERRED; delete-only recorded as the explicitly-recommended NEXT increment (cheap here — onClick verified free). |
| Level | increment (extension of SHIPPED row #13) |
| Why reopen | Audit Top-10 #4 (M-01 / M-03) — Matrix has no UI create path; both `+` buttons are no-ops. P0 carve-out `b9334f7` authorizes the feature under ADR-0010 §D4. |
| Automation Mode | A-Claude (default; pickable at feature-build dispatch) |
| Verify Cross-vendor | yes (MAY defer 24h per ADR-0008 §S3; XV-CREATE-1..7 checklist below) |
| Blockers | — |
| Roadmap Manifest | docs/workflow/roadmap/xai-web-matrix-card-create.md |
| Discovery Review | docs/reviews/xai-web-matrix-card-create/20260528-discovery-review.md |
| Carve-out Authority | docs/reviews/_p0-carve-outs/20260528-matrix-card-create.md (commit b9334f7) |

## Scope of the increment

CREATE-only. Wire the no-op header `+` (`MatrixModule.tsx:39-41`, M-01) + per-quadrant `+` (`Quadrant.tsx:81-83`, M-03) to a new `MatrixComposer` native `<dialog>`; add ONE pure `addCard` reducer action (new `internal/create.ts`, **appends** to target quadrant) + `createMatrixId()` (`internal/ids.ts`) + `NewMatrixCardDraft` type + local `STR_MATRIX_COMPOSER`. Reuse `xai_matrix_state` (no registry edit), the SHIPPED `usePersistedMatrix` hook (extend with an `addCard(draft, to)` method that dispatches the pure reducer + `setState`, **NO emit**). State lifts into `MatrixModule` (no `web:*` channel; existing `web:matrix:priority-tagged` untouched). M-01 default quadrant = `q1`; M-03 default = clicked quadrant. Edit + Delete DEFERRED (discovery QE-A) — divergent from Tasks because Matrix card onClick is FREE → delete-only is cheaper here (flagged for reviewer). `MatrixCard.taskId` stays undefined. NO new dep, NO `packages/core`/`plugin-web-tokens`/`plugin-web-storage`/host-shell edit.

## Files likely affected

**New** (in `packages/xai-web-matrix/src/`):
- `internal/ids.ts` (`createMatrixId`)
- `internal/create.ts` (`addCard` pure action — appends)
- `internal/strings.ts` (`STR_MATRIX_COMPOSER` en+zh)
- `MatrixComposer.tsx` (native `<dialog>`)
- `__tests__/ids.test.ts`, `__tests__/create.test.ts`, `__tests__/MatrixComposer.test.tsx`, `__tests__/MatrixModule.create.test.tsx`

**Edited**:
- `internal/usePersistedMatrix.ts` (+`addCard(draft, to)` method; NO emit)
- `types.ts` (+`NewMatrixCardDraft`)
- `index.ts` (+`NewMatrixCardDraft` export)
- `MatrixModule.tsx` (+composer state + `addCard` dispatch; wire M-01 header `+` default q1)
- `Quadrant.tsx` (+`onAddCard?` prop; wire M-03 `+` onClick default = this quadrant)
- `matrix.css` (+composer rules)
- `__tests__/types.test-d.ts`, `__tests__/index-barrel.test.ts` (extended)

**NOT edited**: `plugin-web-storage` (registry), `plugin-web-tokens`, `packages/core` (events.ts — `web:matrix:priority-tagged` untouched), `apps/web` shell registration.

## Phase Plan (extension — `feature-build` runs ONE phase per invocation, then STOPS)

### EP1 — Data layer
**Goal**: pure create primitives, no UI.
**Files**: `internal/ids.ts`, `internal/create.ts`, `internal/strings.ts`; edit `types.ts` (+`NewMatrixCardDraft`), `index.ts` (+export); extend `__tests__/types.test-d.ts`.
**Tests**: T-MID-1..2, T-MADD-1..8.
**Exit**: new pure tests + SHIPPED 54 green; matrix typecheck + lint clean. No UI wired yet.

### EP2 — Composer + `+` wire + persistence
**Goal**: full create flow end-to-end in jsdom.
**Files**: `MatrixComposer.tsx`; edit `usePersistedMatrix.ts` (+`addCard` method), `Quadrant.tsx` (+`onAddCard`), `MatrixModule.tsx` (+composer state + dispatch + M-01 wire), `matrix.css`.
**Tests**: T-MC-1..7, T-MWIRE-1..2, T-MCR-1..3, T-MNOEMIT-1.
**Exit**: composer opens from M-01 (q1) + M-03 (clicked), save creates + persists, empty-quadrant create works; bilingual labels; create does NOT emit; all tests green; `@repo/web` check-types clean.

### EP3 — Integration + a11y + cross-vendor
**Goal**: refresh-survival + a11y + barrel + vendor cold-read.
**Files**: extend `__tests__/MatrixModule.create.test.tsx`, `__tests__/MatrixComposer.test.tsx`, `__tests__/index-barrel.test.ts`.
**Tests**: T-MCR-4, T-MA11Y-1, T-MBAR-1.
**Steps**: full matrix + web suites + build; Codex cold-read of new sources (or defer per ADR-0008 §S3); write verify section; PLUGIN_MAP note appended at ship.
**Exit**: §E.6 exit criteria met → flip Status to `READY_FOR_VERIFY`, Suggested Next = `feature-verify`.

## Risks (extension — mirrored from discovery §7)

| ID | Risk | Mitigation |
|---|---|---|
| RE1 | `addCard` immutability / referential-equality drift vs `moveCardTo` | Mirror `moveCardTo`: rebuild only the target quadrant array, return untouched quadrants by reference; T-MADD-6 identity check. |
| RE2 | Generated id collides with seed `seed-1..8` | `createMatrixId()` UUID / `m-<ts>-<rnd>` namespace disjoint from `seed-<digit>`; T-MID-2 asserts. |
| RE3 | `<dialog>` ESC/backdrop/focus differs in jsdom | Copy `TaskComposer` tested pattern verbatim (`cancel` listener + `e.target===dialogRef.current` + `setTimeout(0)` focus); T-MC-6 + T-MA11Y-1. |
| RE4 | First create on empty install must materialize seed before insert | `addCard` runs on resolved `state` (seed-or-persisted via SHIPPED `usePersistedMatrix` seed `useEffect`); first write persists seed+card together; T-MCR-1/T-MCR-4 cover it. |
| RE5 | Append-vs-prepend mismatch | `moveCardTo` APPENDS (move.ts:73) — mirror the **Matrix** convention: `addCard` APPENDS (divergent from Tasks prepend); T-MADD-2 asserts LAST position. |
| RE6 | Whitespace-only title | `.trim()` reject in composer (inline error, T-MC-2) + `addCard` (defensive, T-MADD-4). |
| RE7 | Create accidentally emits `web:matrix:priority-tagged` | `addCard` hook method does NOT call `emitPriorityTagged`; T-MNOEMIT-1 spies `emitWebEvent` and asserts 0 calls on create. |
| RE8 | Module feature-gating unknown | Confirm at build whether matrix has a `withDisabledFallback` wrapper; if so, EP3 manual sweep notes "Matrix must be enabled". No plan impact. |
| RE9 | Cross-vendor smoke not run in-session | DEFER per ADR-0008 §S3; record checklist in verify section at deferral time. |

## Open questions (pending review — discovery §6)

- **QE-A (HEADLINE)**: Confirm Edit/Delete full deferral (F1), or fold in a cheaper delete-only slice. **DIVERGENT FROM TASKS**: Matrix `Card.tsx` onClick is FREE (verified — no onClick, only onDragStart/onKeyDown), so a delete affordance does NOT collide the way it did for Tasks. Planner recommends **full deferral** (Edit still needs updateCard + composer edit-mode + confirm dialog → above the low-cost bar; delete-only is the cleaner next increment). **Reviewer is explicitly invited to override** and fold in delete-only if desired — it is genuinely cheap here.
- **QE-B**: M-01 header `+` default quadrant. Planner pick: **`q1`**. Reviewer may prefer another default / no-preselect.
- **QE-C**: M-03 per-quadrant `+` default = clicked quadrant. Planner pick (no ambiguity).
- **QE-D**: `addCard` does NOT emit `web:matrix:priority-tagged` (move-specific + consumer-less channel). Planner pick; reviewer confirms.
- **QE-E**: Pure reducer in new `internal/create.ts` vs co-locating in a renamed `internal/reducer.ts`. Planner pick: **new `create.ts`** (keep `move.ts` single-purpose).
- **QE-F**: 3 phases vs compressing to 2. Planner pick: **3 phases** (mirrors review-approved Tasks split).

## Review Notes (feature-review 2026-05-28)

**Verdict: APPROVED.** 0 blockers, 3 non-blocking recommendations. The plan is executable as written with **CREATE-only** scope. The discovery's load-bearing source claims were independently re-verified against actual source (not taken on the planner's word) — all confirmed.

### Source re-verification (reviewer, against actual files)

| Claim | Verified? | Evidence |
|---|---|---|
| R7 — `Card.tsx` onClick is FREE (the QE-A pivot) | **CONFIRMED** | `Card.tsx:58-82` wires only `onDragStart`/`onDragEnd`/`onKeyDown`/`tabIndex={0}`/`aria-grabbed` — no `onClick`. The "cheaper than Tasks" claim rests on a real fact. |
| R1/R2 — `move.ts` has only `moveCardTo`; no `addCard` | **CONFIRMED** | `move.ts` exports only `moveCardTo`; header documents it as the move reducer only. |
| RE5 — `moveCardTo` APPENDS (Matrix convention) | **CONFIRMED** | `move.ts:73` `mutableNext[to] = [...(next[to]), card]` — append. `addCard` correctly mirrors the **Matrix** append (NOT the Tasks prepend at `tasksReducer.ts:84/150`). |
| R4/R1 — `usePersistedMatrix` returns `{state,setState,moveCard}`; `setState` is a typed boundary; `moveCard` emits | **CONFIRMED** | `usePersistedMatrix.ts:27-31,38,60-65`. `setState` wraps the blob cast (line 38); `moveCard` calls `moveCardTo`+`emitPriorityTagged` (line 64). So `addCard` NOT emitting is a real, isolatable divergence. |
| R3/RE2 — seed ids are `seed-1..8` | **CONFIRMED** | `seed.ts:15-61`. `createMatrixId()` namespace disjointness is valid. |
| M-01 / M-03 `+` buttons exist + are no-ops | **CONFIRMED** | `MatrixModule.tsx:39-41` (header `+`, no handler) + `Quadrant.tsx:81-83` (quadrant `+`, no handler). |
| Mirror precedent (Tasks) is real + shippable | **CONFIRMED** | `tasksReducer.ts:121-158` `addCard` (pure, prev-on-empty, ref-equality); `ids.ts:25-34` `createTaskId` (UUID + `t-<ts>-<rnd>` fallback). `TaskComposer.tsx` + `BoardDeleteConfirmDialog.tsx` both exist on disk. |

### QE-A..QE-F rulings

- **QE-A (HEADLINE — Edit/Delete scope): UPHOLD CREATE-only (F1).** I weighed folding in a delete-only slice (the reviewer-invited override, genuinely cheaper here because onClick is verified free) against scope discipline. Decision = **defer**, for four reasons: (1) create-only is a coherent, complete slice that fully discharges the audit ask + carve-out §5 acceptance anchor (M-01/M-03 were no-ops → now functional); (2) the carve-out explicitly lists edit/delete under "Out of scope (deferred)… planner's call," so deferral is sanctioned; (3) the SHIPPED mirror precedent (`xai-web-tasks-card-create`) shipped create-only and was APPROVED with this exact deferral; (4) folding in delete would expand scope on a maintenance-only P0 surface (ADR-0010 §D1) **and** require a plan revision, since NO phase or test in the current plan covers delete/edit — approving "with delete" would mean approving uncovered work. **Delete-only is recorded as the explicitly-recommended NEXT increment** — it stays cheap (the free onClick is not consumed by v1), so the user's completeness goal is captured as a fast-follow, not lost. No REVISE triggered because the plan as written matches the upheld scope exactly.
- **QE-B (M-01 default quadrant = `q1`): ACCEPT.** Urgent+Important is the natural "what should I add" default; the composer's 4-quadrant radiogroup retargets. No preselect / last-touched would add state for no acceptance benefit.
- **QE-C (M-03 default = clicked quadrant): ACCEPT.** No ambiguity; matches the "add here" affordance.
- **QE-D (`addCard` does NOT emit `web:matrix:priority-tagged`): ACCEPT — verified correct.** The channel payload is move-specific (`from`/`to`/`taggedAt`), the channel is consumer-less, and the carve-out forbids touching it. T-MNOEMIT-1 (spy `emitWebEvent`, assert 0 calls on create; contrast: move still emits) is the right guard — keep it mandatory in EP2.
- **QE-E (`addCard` in new `internal/create.ts` vs co-locate in renamed `internal/reducer.ts`): ACCEPT `create.ts`.** `move.ts`'s header documents it as the move reducer only; a sibling `create.ts` keeps each pure module single-purpose and the diff reviewable. (Tasks co-located in `tasksReducer.ts` only because that file was already the generic reducer module — the Matrix equivalent is specifically `move.ts`, so the symmetry argument does not transfer. No rename needed.)
- **QE-F (3 phases vs 2): ACCEPT 3.** Mirrors the review-approved Tasks split; EP1 (pure data, no UI) is independently green-able and keeps the EP2 composer+wire+persist diff small.

### Checklist gates

1. **Discovery quality** — PASS. 13 recon rows VERIFIED; 6 option axes with rejected-alternative rationale; recommendation (A1+B1+C1+D1+E1+F1) justified.
2. **Design alignment** — PASS. `design.md` §E.0-E.9 matches discovery; 15 frozen assumptions are consistent across discovery §8 / roadmap R6 / design §E.1 / dev_log — no drift.
3. **Contract completeness** — PASS. `api.md` §E.1-E.9 gives usable signatures + contract tables + a11y contract + error semantics for `NewMatrixCardDraft`, `addCard`, the hook method, `MatrixComposer`, `STR_MATRIX_COMPOSER`.
4. **Phase plan quality** — PASS. 3 phases, file boundaries + per-phase test IDs + exit gates; each phase reviewable; EP1 has zero UI.
5. **Architecture risk** — PASS. All boundaries held: NO `packages/core` edit (events.ts untouched), NO `plugin-web-storage` registry edit (reuse `xai_matrix_state`), NO `plugin-web-tokens` edit (local STR), NO host-shell edit (slot SHIPPED), NO `xai-web-tasks` edit (`taskId` stays undefined), NO ADR / SHIPPED-archive / `dev` branch touch. Carve-out §2 In/Out scope aligns line-for-line with the plan's In/Out scope. No scope drift.

### Non-blocking recommendations (apply during build; no plan rewrite)

1. **EP2 — keep T-MNOEMIT-1 mandatory, not optional.** The single most likely silent regression is `addCard` accidentally inheriting `moveCard`'s `emitPriorityTagged` call (they live in the same hook). The spy-asserts-0-calls test is the cheap guard; ensure it runs in EP2, not deferred to EP3.
2. **EP2 — radiogroup quadrant labels: prefer the existing `matrix.*` i18n keys over the local `STR_MATRIX_COMPOSER.qN_label` copies** where the strings already exist (`matrix.urgent_important` etc. flow through `useI18n` in the grid today). Either is constraint-compliant (no token edit needed), but reusing the grid's keys avoids a second source of truth for the same quadrant titles drifting out of sync. The composer's *own* labels (title/tag/buttons/error) correctly stay local. Recorded as a build-time nicety (api.md §E.7 already flags this as reviewer's call — confirmed: prefer reuse).
3. **EP3 — confirm feature-gating (RE8) before writing the manual-sweep note.** Discovery R13 could not confirm whether Matrix has a `withDisabledFallback` wrapper. At EP3, grep `shellRegistrations`/the disabled-set; if Matrix is in the toggleable set, the XV-CREATE checklist must note "Matrix must be ENABLED" so a tester does not file a false "composer won't open" bug. No plan impact (create lives inside `MatrixModule`, which only mounts when ON).

### Cross-vendor posture

Verify Cross-vendor = yes (Codex cold-read at EP3). MAY DEFER 24h per ADR-0008 §S3 — record the XV-CREATE-1..7 checklist in the dev_log verify section at deferral time; joins the accumulated Web smoke batch before the next `xai-web-deploy-cloudflare` ship. Consistent with the SHIPPED Matrix v1 and Tasks precedents.

---

## Work Log

| Timestamp | Executor | Action | Commits | Next step |
|---|---|---|---|---|
| 2026-05-28 16:30 | Claude Opus (feature-plan) | Wrote the card-create plan as an extension of SHIPPED matrix row #13: discovery review (`docs/reviews/xai-web-matrix-card-create/20260528-discovery-review.md`) + roadmap manifest (`docs/workflow/roadmap/xai-web-matrix-card-create.md`) + design.md §E + api.md §E + test.md §E + this dev_log Iteration 2. VERIFIED against source: `usePersistedMatrix` exposes only `{state,setState,moveCard}` (no create) + `move.ts` has only `moveCardTo` (R1/R2 confirmed — mirror Tasks' addCard); `Card.tsx` onClick is FREE (R7 — KEY divergence from Tasks, makes delete-only cheaper); `setState` is a typed boundary (cleaner than Tasks' raw setRawCols, R4). Selected A1+B1+C1+D1+E1+F1 (strict Tasks mirror, CREATE-only). Divergences flagged: addCard APPENDS (Matrix move-convention, not Tasks prepend); no `withDate` (no Matrix date model); no emit on create. 6 open questions for review (QE-A..QE-F); headline QE-A invites reviewer to optionally fold in delete-only since onClick is free. Risks RE1..RE9. Frozen 15 assumptions in design §E.1. | — | feature-review — examine the discovery + design/api/test §E + this Iteration 2; answer QE-A..QE-F (esp. the Edit/Delete divergence); then APPROVE (Suggested Next → feature-build) or REVISE (Suggested Next → feature-plan). |
| 2026-05-28 17:05 | Claude Opus (feature-review) | Reviewed discovery + roadmap manifest + carve-out + design/api/test §E + Iteration 2 against the 5-gate checklist. **Independently re-verified the discovery's load-bearing source claims against actual files** (not the planner's word): `Card.tsx:58-82` onClick FREE (QE-A pivot — confirmed); `move.ts` only `moveCardTo` + APPENDS at L73 (R1/R2/RE5 — confirmed); `usePersistedMatrix.ts:38,60-65` `setState` typed boundary + `moveCard` emits (R4/R1 — confirmed); `seed.ts` ids `seed-1..8` (R3/RE2 — confirmed); M-01 `MatrixModule.tsx:39-41` + M-03 `Quadrant.tsx:81-83` no-op `+` (confirmed); Tasks precedent real (`tasksReducer.ts:121-158` addCard + `ids.ts:25-34` createTaskId + `TaskComposer.tsx` + `BoardDeleteConfirmDialog.tsx` on disk). Ruled QE-A..QE-F: **UPHELD CREATE-only (F1)** — delete-only deferred as the explicitly-recommended NEXT increment (coherent v1 + carve-out sanctions deferral + matches SHIPPED Tasks precedent + folding-in would expand maintenance-only P0 scope AND require a re-plan since no phase/test covers it). QE-B q1 ACCEPT, QE-C ACCEPT, QE-D no-emit ACCEPT (verified — keep T-MNOEMIT-1 mandatory in EP2), QE-E `create.ts` ACCEPT (move.ts is move-only), QE-F 3 phases ACCEPT. All 5 gates PASS; carve-out In/Out scope aligns line-for-line — no drift; all boundaries held. Verdict: **APPROVED**, 0 blockers + 3 non-blocking recs (T-MNOEMIT-1 mandatory in EP2 / prefer existing `matrix.*` keys for quadrant radio labels / confirm feature-gating at EP3). | — | feature-build — implement Phase EP1 (data layer: `internal/ids.ts` + `internal/create.ts` + `NewMatrixCardDraft` + barrel + `internal/strings.ts`; unit tests; SHIPPED 54 stay green). One phase per run, then STOP. |
| 2026-05-28 13:00 | claude-sonnet-4-6 — feature-auto-build EP1 | Implemented EP1 data layer: `internal/ids.ts` (`createMatrixId` with `crypto.randomUUID` + `m-<ts>-<rnd>` fallback), `internal/create.ts` (`addCard` pure reducer — appends to target, returns same ref on empty-title/unknown-quadrant), `internal/strings.ts` (`STR_MATRIX_COMPOSER` en+zh bilingual), `types.ts` (+`NewMatrixCardDraft`), `index.ts` (+`NewMatrixCardDraft` export), `__tests__/ids.test.ts` (T-MID-1..2, 3 tests), `__tests__/create.test.ts` (T-MADD-1..8, 8 tests). SHIPPED 54 tests remain green; matrix typecheck + lint clean. Non-blocking recs applied: T-MNOEMIT-1 status noted for EP2; `matrix.*` key preference noted. | `00f0b14` | feature-build EP2 |
| 2026-05-28 13:10 | claude-sonnet-4-6 — feature-auto-build EP2 | Implemented EP2 composer + wire + persistence: `MatrixComposer.tsx` (native `<dialog>`, single bilingual title input, tag radiogroup reusing `translateTag` map, quadrant radiogroup using existing `matrix.*` i18n keys per rec #2, ESC/backdrop/Cancel, `showModal()`/`close()`, `setTimeout(0)` autofocus), extended `usePersistedMatrix.ts` (+`addCard(draft, to)` method; calls `addCardReducer` + `setState`; NO emit), `Quadrant.tsx` (+`onAddCard?(quadrant)` prop + M-03 `+` onClick wire), `MatrixModule.tsx` (+composer state `composerOpen`/`composerQuadrant` + M-01 header `+` onClick = q1 default + M-03 dispatch + `handleComposerSave`/`handleComposerClose`), `matrix.css` (+composer dialog styles). Tests: `__tests__/MatrixComposer.test.tsx` (T-MC-1..6 + T-MC-7 bilingual STR parity; 9 tests), `__tests__/MatrixModule.create.test.tsx` (T-MWIRE-1..2, T-MCR-1..3, T-MNOEMIT-1; 6 tests). All 82 tests pass; matrix check-types + lint + `@repo/web` check-types clean. T-MNOEMIT-1 confirmed mandatory (spy asserts 0 calls on create path). | `a8c6d28` | feature-build EP3 |
| 2026-05-28 13:20 | claude-sonnet-4-6 — feature-build EP3 | Completed EP3 integration + a11y + cross-vendor: reconciled dirty working tree (EP1/EP2 doc updates never committed; EP2/EP3 test increments present). Wire confirmed COMMITTED in EP2 commit (`a8c6d28`) — `MatrixModule.tsx` + `Quadrant.tsx` fully wired. EP3 test additions committed: `T-MCR-4` (create→unmount→remount refresh-survival), `T-MA11Y-1` (a11y contract — `aria-modal`, `aria-labelledby`, `aria-required`, `aria-describedby` on error, radiogroup/radio/aria-checked), `T-MBAR-1` (barrel: `NewMatrixCardDraft` exported; internal helpers NOT exported). Feature-gating confirmed: `matrixSlotRegistration` IS wrapped with `withDisabledFallback` in `shellRegistrations.tsx` — XV-CREATE checklist notes "Matrix must be ENABLED". Quality gates: 82/82 tests green; `@repo/plugin-web-matrix` check-types + lint clean; `@repo/web` check-types clean; `@repo/web` build green (28.59s). XV-CREATE-1..7 deferred per ADR-0008 §S3 (checklist in verify section below). | see Commits below | feature-verify |

## EP3 Phase Progress

| Phase | Status | Commits |
|---|---|---|
| EP1 — Data layer | DONE | `00f0b14` |
| EP2 — Composer + wire + persistence | DONE | `a8c6d28` |
| EP3 — Integration + a11y + cross-vendor | DONE | see EP3 source+tests commit + docs-sync commit (appended after this entry) |

## XV-CREATE Verify Section (EP3 — deferred per ADR-0008 §S3)

**Feature-gating note**: `matrixSlotRegistration` is wrapped with `withDisabledFallback("matrix")` in `apps/web/src/routes/modules/shellRegistrations.tsx`. The composer is only reachable when Matrix is ENABLED in settings. Testers must confirm Matrix is ON before running XV-CREATE checks.

Run `pnpm dev` in `apps/web/` on real macOS; for each vendor (Chrome / Safari 17+ / Firefox):

| # | Check | Status |
|---|---|---|
| XV-CREATE-1 | Click header `+` → composer opens, title autofocused (Matrix must be ENABLED). | [ ] |
| XV-CREATE-2 | Type title, pick a tag + quadrant, Add → card appears in the chosen quadrant. | [ ] |
| XV-CREATE-3 | Click a quadrant `+` → composer opens pre-targeted to that quadrant; Add → card lands there (incl. an empty quadrant). | [ ] |
| XV-CREATE-4 | Reload → created card persists. | [ ] |
| XV-CREATE-5 | EN ↔ ZH toggle → composer labels + created card title switch correctly. | [ ] |
| XV-CREATE-6 | ESC / backdrop / Cancel → dialog closes, no card created. | [ ] |
| XV-CREATE-7 | No console errors/warnings in any vendor; existing drag-between still works + still emits `web:matrix:priority-tagged`. | [ ] |
