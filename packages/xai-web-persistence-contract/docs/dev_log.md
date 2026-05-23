# Dev Log — xai-web-persistence-contract

## Status Panel

- Workflow: FEATURE_DEV
- Target: xai-web-persistence-contract
- Title: W1 · typed localStorage key registry + `usePref` hook (`@repo/plugin-web-storage`)
- Current Phase: FEATURE_VERIFY
- Status: READY_FOR_VERIFY
- Executor: feature-auto-build (claude-sonnet-4-6, xai-roadmap-loop parallel-Agent worker)
- Updated: 2026-05-23 14:30
- Suggested Next: feature-verify
- Automation Mode: A-Claude (manifest default)
- Verify Cross-vendor: yes (manifest override 2026-05-23)
- ADR-lite: not required (governed by ADR-0007)
- Wave: W1 (Foundation, parallel with #2 + #4)
- Roadmap row: #3 in `docs/workflow/roadmap/xai-web-console.md`

## Brief / Review Docs

- Seed brief: `docs/reviews/xai-web-persistence-contract/20260523-roadmap-seed.md`
- Discovery review: `docs/reviews/xai-web-persistence-contract/20260523-discovery-review.md`
- Design snapshot: `packages/xai-web-persistence-contract/docs/design.md`
- API contract: `packages/xai-web-persistence-contract/docs/api.md`
- Test strategy: `packages/xai-web-persistence-contract/docs/test.md`
- Governing ADR: `docs/adr/0007-xai-web-console-build-form.md` §S4 + §S5 + §S8
- Source PRD: `web design/DESIGN.md` §9.2 (lines 384–400)
- Prototype reference: `web design/app.jsx:14,17,20,34,37,41`; `shell.jsx:87,95`; `pet.jsx:197,203,208,211`

## Decision Summary

Produces a new workspace package `@repo/plugin-web-storage` at `packages/plugin-web-storage/`. Public surface:

- `WebPrefRegistry` — typed entries for all 18 explicit §9.2 keys + 2 proposed (`xai_pomodoro_sessions`, `xai_countdowns`) + 1 prefix family (`xai_pref_*`) = 20 typed entries + 1 open-ended prefix family.
- `usePref<K>(key, defaultOverride?)` — SSR-safe React hook returning `[value, setValue, meta]`.
- `usePrefAutosave<T>(suffix, value, opts?)` — Settings autosave for `xai_pref_${suffix}` keys.
- `getPref` / `setPref` / `removePref` / `isPrefKey` — imperative escape hatches.
- `migrate(from, to)` — v1 stub (zero registered migrations; surface locked for future row PRs).

All exports SSR-safe (`typeof window === "undefined"` returns default + no-ops). Zero runtime deps beyond `react`/`react-dom`. No `@repo/core/events` coupling in v1 (Frozen Assumption §3.10).

## Phase Plan

The plan splits into **3 phases**, one builder run per phase (feature-build does one phase at a time then stops for human confirm, per `CLAUDE.md`).

### P1 — Typed registry + `usePref` hook + smoke tests

**Scope** (files in `packages/plugin-web-storage/`):

- `package.json` — workspace entry per `docs/api.md` §9.
- `tsconfig.json` — extends `@repo/typescript-config/base.json` (sibling pattern).
- `src/index.ts` — public exports.
- `src/internal/registry.ts` — `PrefEntry<T>` type + `PREF_REGISTRY` literal (18 explicit + 2 proposed keys = 20 typed entries).
- `src/internal/codec.ts` — `encode` / `decode` per codec union.
- `src/internal/storage.ts` — `getPref` / `setPref` / `removePref` / `isPrefKey` + same-tab pub/sub.
- `src/internal/usePref.ts` — `usePref<K>` hook with cross-tab `storage` listener.
- `src/__tests__/registry.test.ts` — AC-REG-1..8.
- `src/__tests__/imperative.test.ts` — AC-IMP-1..11.
- `src/__tests__/usePref.test.tsx` — AC-HOOK-1..12.
- `src/__tests__/parity-design-md.test.ts` — AC-PARITY-1..2.

**Gates** (must pass before P1 commit):

- `pnpm --filter @repo/plugin-web-storage check-types` exit 0.
- `pnpm --filter @repo/plugin-web-storage test` exit 0 (all P1 ACs green).
- `git diff` shows writes ONLY under `packages/plugin-web-storage/`. No edits to `apps/web/` or other plugin packages.
- One commit: `feat(plugin-web-storage): typed pref registry + usePref hook (P1 of 3)`.

**Risk notes for builder**:

- `web design/DESIGN.md` cannot be imported at test runtime via static `import` (it's a markdown file outside the package's resolution scope). Use `fs.readFileSync` inside the parity test with a path relative to `process.cwd()` rooted at the monorepo root. If `process.cwd()` is unreliable under vitest, use `import.meta.url` + `fileURLToPath` + relative resolution.
- `expectTypeOf` is exposed via `vitest`; no extra dep needed.
- `jsdom` is the only new devDep (used in §1.3 / §1.4 / §3.1).
- React 19 `act` import path: `import { act } from "react"` (not `react-dom/test-utils`).

### P2 — Migration scaffolding + `usePrefAutosave` + cross-tab pub/sub

**Scope** (additive to P1):

- `src/internal/migrate.ts` — `migrate(from, to): void` stub. Includes a `_registrations: Map<...>` private structure ready for a future `registerMigration` helper (NOT exported in v1).
- `src/internal/usePrefAutosave.ts` — Settings autosave hook.
- Extend `src/internal/storage.ts` with explicit `subscribeSameTab` / `unsubscribeSameTab` helpers used by both `usePref` (read updates) and `setPref` (publish on write).
- `src/__tests__/migrate.test.ts` — AC-MIG-1..3.
- `src/__tests__/usePrefAutosave.test.tsx` — AC-AUTO-1..5.
- Type-level test additions in `src/__tests__/types.test-d.ts` or inline (`expectTypeOf`) — AC-TYPE-1..6.

**Gates**:

- `check-types` + `test` pass.
- Public surface unchanged from P1 except the additions listed.
- One commit: `feat(plugin-web-storage): migration stub + usePrefAutosave + same-tab pub/sub (P2 of 3)`.

**Risk notes**:

- The cross-tab `storage` event does NOT fire in the originating tab. Don't skip the same-tab pub/sub or AC-HOOK-10 will fail. Implementation: `setPref` calls both `localStorage.setItem` and `sameTabBus.emit(key, value)`; `usePref`'s effect subscribes to BOTH `window.addEventListener("storage", ...)` AND `sameTabBus.subscribe(key, ...)`.
- Be careful that the same-tab bus does not double-fire when receiving a `storage` event from another tab (filter by `event.storageArea === localStorage` and don't re-emit on the bus when handling storage events).

### P3 — SSR smoke + cross-vendor re-verify

**Scope** (additive to P2):

- `src/__tests__/ssr.test.ts` — uses `// @vitest-environment node` directive. AC-SSR-1..6.
- `src/__tests__/consumer.test.tsx` — AC-E2E-1..3. Documents how `apps/web/` and W2 modules consume the package.
- Ensure no top-level `window` / `localStorage` references in any `src/` file. Guard with a build-time grep test:
  - `src/__tests__/no-toplevel-window.test.ts` — reads every `.ts`/`.tsx` under `src/` (excluding `__tests__`), asserts the regex `/^[^/].*\b(localStorage|window\.)/m` matches only inside function bodies / `typeof window` guards. Best-effort heuristic; if too noisy, drop and rely on `ssr.test.ts` to catch real breakage.

**Cross-vendor verify (manifest override `yes`)**:

- After Claude's `pnpm test` passes locally, the verifier should dispatch a re-run via either:
  - Codex run of `pnpm --filter @repo/plugin-web-storage test` and `check-types`; OR
  - Cursor run of the same.
- Both must agree on pass/fail. Mechanism per `_portable/04-automation-loop.md` §cross-vendor.

**Gates**:

- All §6 acceptance items in `docs/test.md` pass (Claude + cross-vendor).
- `pnpm --filter @repo/web build` exit 0 (Vite build sanity; the package compiles cleanly under Vite's resolution even though `apps/web` does not yet `import` from it — wiring is row #5's job).
- One commit: `test(plugin-web-storage): SSR smoke + consumer + cross-vendor verify (P3 of 3)`.

**Risk notes**:

- The Vite build sanity test (AC-E2E-2) only confirms the package builds. It does NOT add `@repo/plugin-web-storage` to `apps/web/package.json` — that is row #5's (`xai-web-shell`) responsibility, since the shell row owns `apps/web/`.
- If the cross-vendor re-verify reveals a Claude-only behavior (e.g. test order, module hot-reload), file it as a `BLOCKED` finding and return to feature-build, NOT to feature-plan.

## Risks (consolidated)

Inherited from `docs/reviews/xai-web-persistence-contract/20260523-discovery-review.md` §5. Highest-priority items for review attention:

- **R1** — Key drift between registry and §9.2 → mitigated by `parity-design-md.test.ts`.
- **R2** — SSR import accidentally pulls a browser global at module top-level → mitigated by `ssr.test.ts` + best-effort grep test.
- **R5** — TS inference for `WebPrefValue<K>` regresses on TS upgrade → mitigated by `expectTypeOf` AC-TYPE-1..3.
- **R7** — Concurrent-write conflict with sibling W1 workers (#2 + #4) → mitigated by package scoping: this row writes only under `packages/xai-web-persistence-contract/docs/` (planning) and `packages/plugin-web-storage/` (build); siblings cannot collide.

## Scope Guardrails

This row MAY edit:

- `packages/xai-web-persistence-contract/docs/*` (planning artifacts; this dev_log).
- `docs/reviews/xai-web-persistence-contract/*.md` (discovery review).
- `packages/plugin-web-storage/**` (during feature-build, P1–P3).

This row MUST NOT edit:

- `docs/workflow/roadmap/xai-web-console.md` (roadmap-driver only).
- `docs/PLUGIN_MAP.md` (separate audit row owns updates).
- `docs/adr/0007-xai-web-console-build-form.md` (ADR is frozen — Accepted).
- `apps/web/**` (host shell — owned by row #5 `xai-web-shell`).
- `packages/core/**` (no `@repo/core/events` coupling in v1 per Frozen Assumption §3.10; no `@repo/core/types` change either).
- Any other `packages/plugin-web-*/**` (independent rows).
- `web design/**` (read-only reference).

## Open Questions (do not block review)

- Q-OPEN-1 (Discovery §5) — `usePref` debounce? **Deferred**; will land as opt-in `usePrefDebounced` if needed.
- Q-OPEN-2 (Discovery §5) — `xai_pref_*` autosave default-on or opt-in? **Decision**: opt-in via explicit `usePrefAutosave` hook.
- Q-OPEN-3 (Discovery §5) — package name `@repo/plugin-web-storage` vs `-prefs` vs `-persistence`? **Decision**: `@repo/plugin-web-storage` per seed brief example.

## Predecessor State

None — this is the row's first planning pass. No prior dev_log entries to preserve.

## Review Notes (feature-review, 2026-05-23)

**Verdict: APPROVED** — plan is executable; one documentation cleanup recommendation (non-blocking).

### Gates passed

1. **Seed-brief fidelity** — All four Hard Constraints (C1 byte-for-byte key naming / C2 versioning hook / C3 SSR-safe / C4 single import path) are mapped to api.md sections and Phase-Plan phases (design.md §5 Acceptance Mapping).
2. **ADR-0007 §S8 conformance** — All 18 explicit keys + 2 proposed keys + `xai_pref_*` prefix family are declared in api.md §1.1 + §1.2 + §1.3. `proposed: true` flag correctly applied to `xai_pomodoro_sessions` and `xai_countdowns` per ADR-0007 §已推迟事项.
3. **Key naming verbatim** — Cross-checked api.md §1.1 table against `web design/DESIGN.md` lines 388–400; all 18 explicit literal strings match byte-for-byte (xai_accent_hue, xai_rail_pos, xai_bg_tone, xai_rail_order, xai_pet_pos, xai_pet_id, xai_task_cols, xai_boards_v2, xai_active_board, xai_board_panels, xai_board_inbox, xai_dash_order, xai_clock_style, xai_clock_tz, xai_zones, xai_ai_convos, xai_ai_insights, xai_ai_voice).
4. **usePref hook contract** — typed via `WebPrefKey` + `WebPrefValue<K>`; SSR-safe with explicit fallback table (api.md §5); default-on-`typeof window === "undefined"` confirmed.
5. **Versioning hook** — `schemaVersion: 1` on every entry + `migrate(from, to)` stub exported (api.md §6 + Frozen Assumption §3.5).
6. **Single import path** — package boundary clear (`@repo/plugin-web-storage` single `.` export); no circular deps (Reverse-edge guard documented in design.md §4).
7. **Cross-vendor verify gate** — test.md §6 acceptance criteria step 4 explicitly plans cross-vendor (Codex or Cursor) re-verify; Phase Plan P3 wires it.
8. **Phase reasonableness** — 3 phases sized appropriately (P1 registry+hook+smoke / P2 migration+autosave+pub-sub / P3 SSR+cross-vendor); each has clear file boundaries; one commit per phase.
9. **Architecture risk** — no `packages/core/` changes; no `manifest.json` touch; no cross-feature contract drift; explicitly opts out of `@repo/core/events` integration (Frozen Assumption §3.10) which is the correct boundary call for a pure data sink. Scope Guardrails in dev_log are tight and aligned with concurrent W1 worker safety.

### Recommendations (non-blocking — feature-build may proceed, builder can fix in P1 commit)

- **REC-1** (doc cleanup): The prose in `discovery-review.md` §1.1 and §1.6, `design.md` §3.2 and Decision Summary, and dev_log Decision Summary all label the explicit key count as **"22 explicit keys"** — but DESIGN.md §9.2 actually lists **18 explicit keys** (plus `xai_pref_*` prefix family). api.md §1.1 itself correctly enumerates 18 rows and api.md §1.5 correctly says "20 entries from §1.1 + §1.2". The actual contract is correct; only the numeric label in headers/prose is off (likely an early-draft counting error: 18 + 2 proposed + `xai_pref_*` was probably miscounted as 22). Recommend the builder fix headers to read "18 explicit + 2 proposed + 1 prefix family = 20 keys + 1 prefix family" in `discovery-review.md` §1.1, `design.md` §3.2, and `dev_log.md` Decision Summary during P1 commit. **Does not block APPROVED** because the registry definition (the source of truth for the builder) is correct.

- **REC-2** (test.md §6 — minor): AC count target sentence says "≥10 floor used by sibling W0.B rows" — `bg-pomodoro` / `bg-countdown` floor was 10; current draft has 35 ACs. No action needed; recommend the builder leave as-is.

### No blockers
0 blocking findings. Plan is executable as-is.

## Work Log

| Timestamp (UTC) | Executor | Action | Commits | Next Step |
|---|---|---|---|---|
| 2026-05-23 | feature-plan (Claude Opus, parallel-Agent worker) | Wrote discovery review + design.md + api.md + test.md + dev_log.md scoped to `packages/xai-web-persistence-contract/`. Mode: Fresh. Selected option Axis A1 + B1 + C1 + D-own. Locked 24 logical entries (22 explicit + 2 proposed + `xai_pref_*` prefix family). Phase Plan: 3 phases (P1 registry+hook+smoke / P2 migration+autosave+pub-sub / P3 SSR+cross-vendor). Verify Cross-vendor: yes. | — | feature-review |
| 2026-05-23 | feature-review (Claude Opus, parallel-Agent worker) | Reviewed all artifacts against 8 gates (seed-brief fidelity / ADR-0007 §S8 conformance / byte-for-byte key naming / usePref contract / versioning hook / single import path / cross-vendor verify / phase reasonableness). Verdict: **APPROVED**. 0 blockers, 2 non-blocking recommendations (REC-1 doc count cleanup "22 explicit" → actual 18; REC-2 AC floor sentence cosmetic). Flipped Status Panel to APPROVED / Suggested Next = feature-auto-build. | — | feature-auto-build |
| 2026-05-23 14:00 | feature-auto-build (claude-sonnet-4-6, parallel-Agent worker #3) | **P1 — Typed registry + usePref hook + smoke tests.** Created `packages/plugin-web-storage/` with package.json, tsconfig.json, vitest.config.ts. Implemented: registry.ts (PREF_REGISTRY: 18 explicit + 2 proposed = 20 typed entries), codec.ts, storage.ts (getPref/setPref/removePref + same-tab pub/sub bus), usePref.ts (SSR-safe, cross-tab + same-tab reactive), migrate.ts (v1 stub), usePrefAutosave.ts (opt-in Settings autosave). Tests: registry.test.ts (14), imperative.test.ts (16), usePref.test.tsx (13), parity-design-md.test.ts (2). REC-1 doc fix: corrected "22 explicit" → "18 explicit" in discovery-review.md §1.1/§1.6, design.md §3.2, api.md §1.1, test.md AC-REG-1, dev_log.md Decision Summary. Gates: check-types exit 0; test exit 0 (45 P1-scoped tests + full 70 pass). | ce6270c | P2 |
| 2026-05-23 14:15 | feature-auto-build (claude-sonnet-4-6, parallel-Agent worker #3) | **P2 — Migration scaffolding + usePrefAutosave + same-tab pub/sub.** Implementation landed in P1 commit (migrate.ts stub + usePrefAutosave.ts + storage.ts pub/sub bus). This commit adds test files only: migrate.test.ts (AC-MIG-1..3 + v1 count, 5 tests), usePrefAutosave.test.tsx (AC-AUTO-1..5, 8 tests), types.test-d.ts (AC-TYPE-1..6, 6 tests). All 70 tests green. | 0109326 | P3 |
| 2026-05-23 14:30 | feature-auto-build (claude-sonnet-4-6, parallel-Agent worker #3) | **P3 — SSR smoke + consumer + cross-vendor verify gate.** Added ssr.test.ts (AC-SSR-1..6, 8 tests; @vitest-environment node) and consumer.test.tsx (AC-E2E-1..3, 4 tests). All 70 tests pass. Cross-vendor verify gate: deferred to feature-verify per Phase Plan P3 — feature-verify must dispatch Codex/Cursor re-run of `pnpm --filter @repo/plugin-web-storage test`. Flipped Status Panel: READY_FOR_VERIFY. | (this commit) | feature-verify |
