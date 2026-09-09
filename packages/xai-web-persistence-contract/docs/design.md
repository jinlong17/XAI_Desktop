# Design Snapshot — xai-web-persistence-contract

> Roadmap row #3 · Wave 1 · Foundation
> Status: PLAN_DRAFT (pending `feature-review`)
> Owner row: `xai-web-persistence-contract`
> Producing package: `@repo/plugin-web-storage` (path: `packages/plugin-web-storage/`)
> Governing ADR: [`docs/adr/0007-xai-web-console-build-form.md`](../../../docs/adr/0007-xai-web-console-build-form.md) §S4 + §S5 + §S8
> Source PRD: [`web design/DESIGN.md`](../../../web%20design/DESIGN.md) §9 数据模型与持久化, §9.2 持久化键
> Discovery: [`docs/reviews/xai-web-persistence-contract/20260523-discovery-review.md`](../../../docs/reviews/xai-web-persistence-contract/20260523-discovery-review.md)
> Seed brief: [`docs/reviews/xai-web-persistence-contract/20260523-roadmap-seed.md`](../../../docs/reviews/xai-web-persistence-contract/20260523-roadmap-seed.md)

---

## 1. Selected Option

**Build a new workspace package `@repo/plugin-web-storage` (located at `packages/plugin-web-storage/`) that exports a typed `WebPrefRegistry`, a SSR-safe `usePref` hook, a `usePrefAutosave` Settings sibling, and an imperative `getPref/setPref/removePref` escape hatch. Migration surface (`schemaVersion`, `migrate(from, to)`) is locked but holds zero registered migrations in v1.**

| Field | Value |
|------|-------|
| Selected Option | Axis A1 (new workspace package) + B1 (typed entry per key) + C1 (`[value, setter, meta]` tuple) + D-own (roll our own hook, zero runtime deps) |
| Package Name | `@repo/plugin-web-storage` |
| Package Path | `packages/plugin-web-storage/` |
| Production Owner Row | row #3 `xai-web-persistence-contract` |
| Consumer Rows | #2, #4, #5, #6, #7, #10, #11, #14, #15, #17, #18, #19, #22 (every row that touches a `xai_*` key) |
| Public Surface | `WebPrefRegistry`, `WebPrefKey`, `WebPrefValue<K>`, `usePref`, `usePrefAutosave`, `getPref`, `setPref`, `removePref`, `isPrefKey`, `migrate` (no registered migrations) |
| Frozen Assumptions | see §3 |
| Review Doc | `docs/reviews/xai-web-persistence-contract/20260523-discovery-review.md` |
| Review Date | 2026-05-23 |

---

## 2. Why this option

Three pressures converge:

1. **Seed brief Hard Constraint #1** — every key MUST match DESIGN.md §9.2 byte-for-byte so prototype-era user data round-trips. A closed, typed registry is the only structure that lets us assert this statically (lint + test) and visually (the registry IS §9.2, in code).
2. **ADR-0007 §S4 + CLAUDE.md `Code Boundaries`** — business persistence is plugin territory, not host territory. A new package at `packages/plugin-web-storage/` matches the established pattern; `apps/web/src/lib/` would force every W2 plugin to reverse-import from the host shell.
3. **Seed brief Hard Constraint #4** — the rest of W1/W2 must depend on **one** import path without circular deps. Package boundary is the cleanest way: `apps/web/` and every `packages/plugin-web-*` consumer points at `@repo/plugin-web-storage`; the storage package has zero downstream knowledge.

Rejected alternatives are recorded in `docs/reviews/.../20260523-discovery-review.md` §2: location in host shell (A2 rejected), conflation with `@repo/web-auth-device-session` (A3 rejected), parallel default+version maps (B2 rejected), object-shape hook (C2 rejected), generic `useLocalStorage<T>` (C3 rejected), adopting `use-local-storage-state` library (D-adopt rejected).

---

## 3. Frozen Assumptions

These assumptions are locked by this planning row. Changing any of them requires either a discovery revision (back to `feature-plan`) or an ADR-0007 amendment.

1. **Package name and path** — `@repo/plugin-web-storage` at `packages/plugin-web-storage/`. Single public entry: `src/index.ts`. No `src/internal/` re-exports.
2. **20 + 1 logical entries** — 18 explicit keys from DESIGN.md §9.2 + 2 proposed keys from ADR-0007 §S8 (`xai_pomodoro_sessions`, `xai_countdowns`) + `xai_pref_*` prefix family (= 20 typed entries + 1 open-ended prefix family). Exact list in `docs/api.md` §1.
3. **Key names are byte-for-byte parity with DESIGN.md §9.2** — no abbreviations, no aliasing, no namespace prefix change.
4. **Codec set is closed** — `"string"` | `"number"` | `"boolean"` | `"json"`. No `"date"`, no `"binary"`, no codec plugin system. Adding a codec requires this row to revise.
5. **`schemaVersion: 1` for all entries in v1.** No registered migrations. `migrate(from, to)` is a public function returning `void` immediately; future rows may register migrations via a `registerMigration` helper added in a follow-up row PR.
6. **SSR fallback semantics** — when `typeof window === "undefined"`: `getPref(k)` returns `default`; `setPref(k, v)` returns `false` (no-op); `usePref(k)` returns `[default, no-op setter, { isDefault: true, schemaVersion, reset: no-op }]`; `migrate` is a no-op.
7. **Cross-tab fan-out** — via the browser `storage` event only. No BroadcastChannel fallback in v1. Same-tab `setPref` mutations trigger an internal pub/sub so React subscribers in the same tab see updates immediately (because `storage` only fires for *other* tabs).
8. **`xai_pref_*` is the single open-ended prefix family.** All other keys are members of a closed `WebPrefKey` union. `usePrefAutosave<T>(suffix, value)` types `xai_pref_${suffix}` and bypasses the closed-set check.
9. **No runtime dep beyond `react@^19.2.0` + `react-dom@^19.2.0`.** No `use-local-storage-state`, no `usehooks-ts`, no `zustand`/`jotai`/`redux` (ADR-0007 §JSX→TSX rule 10).
10. **No `core/events` integration in v1.** Storage writes do **not** emit typed events. Cross-module reactions to a preference change happen via `usePref` reactivity (each consumer subscribes to its own key); the typed event bus (`xai-web-event-bus` row #4) is reserved for domain events (`web:tasks:card-completed`, etc.), not preference flips. This keeps the storage layer purely a data sink. Documented in `docs/api.md` §6.

---

## 4. Dependency Overview

### Upstream (this row depends on)

- `xai-web-build-form-adr` row #1 — ADR-0007 must be Accepted before this row can implement (per manifest `Depends On: xai-web-build-form-adr`, semantics `ready_to_ship`). Status as of 2026-05-23: READY_TO_SHIP (manifest #1 note).
- `web design/DESIGN.md` §9.2 — source of truth for key names. Locked at v1.0 per ADR-0007 §S5.
- `apps/web/package.json` — confirms React 19 + Vite 7 + TS 5.9 toolchain (we inherit from monorepo workspace root; no per-package version pin needed).
- `packages/web-auth-device-session/package.json` — pattern reference for `"type": "module"`, `exports`, `check-types`, vitest scripts.
- `packages/core/package.json` — workspace conventions reference. (We do **not** depend on `@repo/core` itself at runtime; we are a pure-leaf package.)

### Downstream (consumers after this row ships)

Every W2 row that touches a `xai_*` key (from ADR-0007 §S8 table):

- `xai-web-shell` (row #5) — `xai_rail_order`
- `xai-web-tasks` (row #6) — `xai_task_cols`
- `xai-web-board-core` (row #7) — `xai_boards_v2`, `xai_active_board`, `xai_board_panels`, `xai_board_inbox`
- `xai-web-dashboard-grid` (row #10) — `xai_dash_order`
- `xai-web-dashboard-widgets` (row #11) — `xai_clock_style`, `xai_clock_tz`, `xai_zones`
- `xai-web-pomodoro` (row #14) — `xai_pomodoro_sessions` (proposed)
- `xai-web-habits` (row #15) — no dedicated key; may use `xai_pref_habits_*`
- `xai-web-countdown` (row #17) — `xai_countdowns` (proposed)
- `xai-web-ai-chat` (row #18) — `xai_ai_convos`, `xai_ai_insights`, `xai_ai_voice`
- `xai-web-pet` (row #19) — `xai_pet_pos`, `xai_pet_id`
- `xai-web-settings-appearance` (row #22) — `xai_accent_hue`, `xai_rail_pos`, `xai_bg_tone` + opens `xai_pref_*` autosave
- `xai-web-settings-shell` (row #21) — wires `usePrefAutosave` for Settings panels (Hard Constraint from §9.2)

### Sibling W1 rows (this run, parallel)

- `xai-web-tokens-and-i18n` (row #2) — independent; no shared files with this row.
- `xai-web-event-bus` (row #4) — independent; this row deliberately stays out of `@repo/core/events` (Frozen Assumption §3.10).

Concurrent-write safety: this row scopes all writes to `packages/xai-web-persistence-contract/docs/` during planning, and to `packages/plugin-web-storage/` during feature-build. Siblings cannot collide.

### Reverse-edge guard (CLAUDE.md `Code Boundaries`)

- `@repo/plugin-web-storage` MUST NOT import from `apps/web/` or any other `packages/plugin-web-*` package.
- `@repo/plugin-web-storage` MAY import from `react` / `react-dom`.
- `@repo/plugin-web-storage` MUST NOT import `@tauri-apps/api` (ADR-0003 platform independence; this is a Web-face plugin).

---

## 5. Acceptance Mapping (Seed Brief → Plan Phases)

| Seed Hard Constraint | Plan section | Phase | Verified by |
|---|---|---|---|
| C1 — Key names byte-for-byte parity | `docs/api.md` §1 (full key table) | P1 | `byteForByteParityWithDesignSection92` test |
| C2 — Versioning hook | `docs/api.md` §4 (`schemaVersion` + `migrate`) | P2 | Type-level + runtime smoke (`migrate(1, 2)` is callable no-op) |
| C3 — SSR-safe | `docs/api.md` §5 (SSR fallback table) | P1 + P3 | Node-only test with `globalThis.window` deleted |
| C4 — Single import path | `package.json` `exports` field | P1 | `apps/web` + `packages/plugin-web-*` import resolves with no circular dep |
| Acceptance signal — every key has typed entry + smoke test + SSR import OK | `docs/test.md` §1 + §3 | P1 + P3 | Full vitest pass |

---

## 6. Risks / Watchlist (from discovery)

Inherited verbatim from `docs/reviews/xai-web-persistence-contract/20260523-discovery-review.md` §5. R1 + R2 + R5 + R7 are the highest priority for `feature-review` scrutiny.

---

## 7. Out of Scope (Explicit)

- Settings UI panels (owned by row #21 / #22).
- Encrypted persistence / sync blob (owned by SHIPPED `web-encrypted-indexeddb-cache`).
- Event-bus integration for preference changes (Frozen Assumption §3.10).
- Migration registration for v1 (only the surface is locked).
- Telemetry / `Sentry.captureException` on storage errors (deferred to a future row).
- BroadcastChannel cross-tab fan-out (deferred to a future row).
- Debouncing of writes (deferred to a future row as opt-in `usePrefDebounced`).

## REL-03 ownership and migration

The runtime starts locked until authentication and committed generation resolution complete. Mounted account hooks capture the current immutable scope and cannot write after it changes. The host mounts `AccountDataGate`; its presentation belongs to the storage package. Unowned data is never automatically assigned to the next login. Empty/import/postpone are explicit choices, with raw archives, candidate journals and rollback. The generation marker is the sole visibility commit after local and encrypted-store verification. This implements local account isolation only and does not unfreeze account cloud sync.
