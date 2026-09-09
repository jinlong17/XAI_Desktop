# Test Strategy — `@repo/plugin-web-storage`

> Row: `xai-web-persistence-contract` (#3)
> Status: PLAN_DRAFT
> Test runner: Vitest 3.x (workspace-pinned)
> DOM env: `jsdom` for browser-shaped suites; default Node env for SSR suite
> Verify Cross-vendor: yes (per manifest default)

---

## 1. Unit coverage

All tests live in `packages/plugin-web-storage/src/__tests__/`. Co-located with source (vitest convention used by other workspace packages e.g. `packages/plugin-project/src/__tests__/useProjectStore.test.tsx`).

### 1.1 Registry parity — `registry.test.ts`

**Why**: Hard Constraint #1 (byte-for-byte parity with DESIGN.md §9.2).

| AC ID | Scenario | Asserts |
|---|---|---|
| AC-REG-1 | All 18 explicit §9.2 keys exist in `PREF_REGISTRY` | `Object.keys(PREF_REGISTRY)` superset of the literal list |
| AC-REG-2 | Both proposed keys exist with `proposed: true` | `PREF_REGISTRY.xai_pomodoro_sessions.proposed === true` and same for `xai_countdowns` |
| AC-REG-3 | All entries have `schemaVersion: 1` in v1 | `Object.values(PREF_REGISTRY).every(e => e.schemaVersion === 1)` |
| AC-REG-4 | Codec set is the closed union | every `entry.codec` is one of `"string" \| "number" \| "boolean" \| "json"` |
| AC-REG-5 | Owner row is non-empty | every `entry.owner.length > 0` |
| AC-REG-6 | No accidental duplicate keys | `Object.keys(...).length === new Set(Object.keys(...)).size` |
| AC-REG-7 | Default type matches codec | `codec === "number"` ⇒ `typeof default === "number"`; `codec === "boolean"` ⇒ `typeof default === "boolean"`; `codec === "string"` ⇒ `typeof default === "string"`; `codec === "json"` ⇒ no assertion (any shape) |
| AC-REG-8 | Static parity with DESIGN.md §9.2 | A second test (`registry-parity-design-md.test.ts`) reads `web design/DESIGN.md` at test time, regex-extracts `xai_*` from §9.2 table, and asserts the registry contains every extracted name. Catches drift if §9.2 is edited. |

### 1.2 `getPref` / `setPref` / `removePref` — `imperative.test.ts`

| AC ID | Scenario | Asserts |
|---|---|---|
| AC-IMP-1 | `getPref("xai_accent_hue")` with empty storage returns `165` | default fallback |
| AC-IMP-2 | `setPref("xai_accent_hue", 200)` then `getPref` returns `200` | round-trip number |
| AC-IMP-3 | `setPref("xai_rail_pos", "right")` then `getPref` returns `"right"` | round-trip string |
| AC-IMP-4 | `setPref("xai_ai_insights", false)` then `getPref` returns `false` | round-trip boolean |
| AC-IMP-5 | `setPref("xai_rail_order", ["board","tasks"])` then `getPref` returns the array | round-trip json |
| AC-IMP-6 | `removePref("xai_accent_hue")` then `getPref` returns default | remove |
| AC-IMP-7 | `getPref` with corrupt JSON in storage returns default + warns | `localStorage.setItem("xai_zones", "{not json")` ⇒ `getPref("xai_zones")` returns `[]`; `console.warn` called once |
| AC-IMP-8 | `getPref` with type-mismatched value (e.g. `"abc"` for `xai_accent_hue` number codec) returns default | parse-int fail → fall back |
| AC-IMP-9 | `setPref` returns `true` on success | success path |
| AC-IMP-10 | `setPref` returns `false` on `QuotaExceededError` (mocked) | `vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new DOMException("...", "QuotaExceededError"); })` |
| AC-IMP-11 | `setPref` with identical-to-current value does NOT call `localStorage.setItem` | compare-before-write idempotency |

### 1.3 `usePref` hook — `usePref.test.tsx`

Uses jsdom + `act` + `createRoot` (same pattern as `packages/plugin-project/src/__tests__/useProjectStore.test.tsx`).

| AC ID | Scenario | Asserts |
|---|---|---|
| AC-HOOK-1 | Initial render with empty storage returns default | `[value, ...] = usePref("xai_accent_hue")` ⇒ `value === 165` |
| AC-HOOK-2 | Initial render with seeded storage returns seeded value | seed `localStorage.setItem("xai_accent_hue", "200")` first ⇒ `value === 200` |
| AC-HOOK-3 | `setValue(220)` updates state + writes localStorage | after `act(() => setValue(220))`: `value === 220`; `localStorage.getItem("xai_accent_hue") === "200"`... wait, `"220"` |
| AC-HOOK-4 | Functional updater `setValue(prev => prev + 1)` works | from 165 ⇒ 166 |
| AC-HOOK-5 | `meta.isDefault` is `true` when key absent | empty storage ⇒ `meta.isDefault === true` |
| AC-HOOK-6 | `meta.isDefault` flips to `false` after `setValue` | after set ⇒ `meta.isDefault === false` |
| AC-HOOK-7 | `meta.reset()` restores default and removes key | after reset ⇒ `value === 165`, `localStorage.getItem("xai_accent_hue") === null`, `meta.isDefault === true` |
| AC-HOOK-8 | Cross-tab `storage` event updates value | dispatch `new StorageEvent("storage", { key: "xai_accent_hue", newValue: "300", storageArea: localStorage })` ⇒ `value === 300` after `act` |
| AC-HOOK-9 | `storage` event with `key === null` (clear all) resets to default | dispatch with `key: null` ⇒ value back to 165 |
| AC-HOOK-10 | Two hook instances in same tab observe same-tab writes | render two `usePref("xai_accent_hue")` consumers; setValue from one ⇒ second observes update via internal pub/sub |
| AC-HOOK-11 | `defaultOverride` parameter takes precedence over registry default when storage is empty | `usePref("xai_accent_hue", 99)` ⇒ initial `value === 99` |
| AC-HOOK-12 | JSON parse failure on initial mount logs and returns default | seed `localStorage.setItem("xai_zones", "{broken")` ⇒ hook returns `[]`; `console.warn` called |

### 1.4 `usePrefAutosave` — `usePrefAutosave.test.tsx`

| AC ID | Scenario | Asserts |
|---|---|---|
| AC-AUTO-1 | First render writes `xai_pref_${suffix}` | `usePrefAutosave("appearance_density", "compact")` ⇒ `localStorage.getItem("xai_pref_appearance_density") === '"compact"'` (json codec default) |
| AC-AUTO-2 | Subsequent value changes write again | re-render with `"comfortable"` ⇒ stored value updates |
| AC-AUTO-3 | Same value does NOT write twice (idempotency) | re-render with same value ⇒ `setItem` spy not called second time |
| AC-AUTO-4 | `options.codec: "string"` writes raw string | `usePrefAutosave("x", "abc", { codec: "string" })` ⇒ stored value is `"abc"`, not `'"abc"'` |
| AC-AUTO-5 | `isPrefKey("xai_pref_x") === true`; `isPrefKey("xai_accent_hue") === false`; `isPrefKey("random") === false` | regex guard |

### 1.5 `migrate` stub — `migrate.test.ts`

| AC ID | Scenario | Asserts |
|---|---|---|
| AC-MIG-1 | `migrate(1, 2)` returns `void` and does not throw | callable forward-compat |
| AC-MIG-2 | `migrate(1, 1)` returns `void` (no-op) | identity case |
| AC-MIG-3 | Importing `migrate` from `@repo/plugin-web-storage` resolves | export sanity |

---

## 2. Contract coverage

### 2.1 Type-level assertions — `types.test-d.ts` (or inline via `expectTypeOf`)

| AC ID | Scenario | Asserts |
|---|---|---|
| AC-TYPE-1 | `WebPrefValue<"xai_accent_hue">` is `number` | `expectTypeOf<WebPrefValue<"xai_accent_hue">>().toEqualTypeOf<number>()` |
| AC-TYPE-2 | `WebPrefValue<"xai_rail_pos">` is the literal union | `expectTypeOf<...>().toEqualTypeOf<"left" \| "right" \| "top" \| "bottom">()` |
| AC-TYPE-3 | `usePref("xai_clock_style")` returns `[ClockStyle, ...]` | tuple type-check |
| AC-TYPE-4 | `setPref("xai_accent_hue", "abc")` is a TS error | `@ts-expect-error` annotation |
| AC-TYPE-5 | `usePref("not_a_key")` is a TS error | `@ts-expect-error` annotation |
| AC-TYPE-6 | `usePrefAutosave("x/y", value)` is a TS error if suffix contains `/` | runtime + branded-type check (best-effort; TS template-literal narrowing) |

### 2.2 SSR contract — `ssr.test.ts`

Runs in default Node env (no jsdom). Imports must not touch browser globals at module top-level.

| AC ID | Scenario | Asserts |
|---|---|---|
| AC-SSR-1 | `import * as api from "@repo/plugin-web-storage"` does not throw in Node | bare import |
| AC-SSR-2 | `getPref("xai_accent_hue")` in Node returns `165` | default fallback |
| AC-SSR-3 | `setPref("xai_accent_hue", 200)` in Node returns `false` and does not throw | SSR no-op |
| AC-SSR-4 | `removePref("xai_accent_hue")` in Node does not throw | SSR no-op |
| AC-SSR-5 | `isPrefKey("xai_pref_x")` works in Node (pure function) | no window dependency |
| AC-SSR-6 | `migrate(1, 1)` in Node does not throw | no window dependency |

`usePref` and `usePrefAutosave` are NOT exercised in the Node suite (they require `useState` + `useEffect` which need a renderer); they are covered by the jsdom suites §1.3 / §1.4 and rely on their own `typeof window` guards inside the `useEffect` body.

---

## 3. End-to-end / smoke

### 3.1 Cross-package consumer smoke — `consumer.test.tsx`

Validates that downstream W2 rows can actually import + use the package without circular dep.

| AC ID | Scenario | Asserts |
|---|---|---|
| AC-E2E-1 | `import { usePref } from "@repo/plugin-web-storage"` resolves under `pnpm --filter @repo/plugin-web-storage check-types` | type-check pass |
| AC-E2E-2 | Vite build of `apps/web` succeeds when `apps/web/package.json` adds `@repo/plugin-web-storage` as a dep | `pnpm --filter @repo/web build` exit 0 (smoke; full wiring into `apps/web` is row #5's job — this test only confirms the package builds, does not wire it) |
| AC-E2E-3 | Mock consumer component using `usePref("xai_pet_id")` mounts in jsdom | renders without error |

### 3.2 Drift detection — `parity-design-md.test.ts`

Reads `web design/DESIGN.md` at test runtime and enforces §9.2 parity. Catches PRD edits that would break the registry.

| AC ID | Scenario | Asserts |
|---|---|---|
| AC-PARITY-1 | All `xai_*` keys listed in §9.2 (lines 384–400) are members of `PREF_REGISTRY` (after excluding the `xai_pref_*` prefix and the two proposed-only entries) | regex extraction + Set comparison |
| AC-PARITY-2 | No `xai_*` key in `PREF_REGISTRY` is missing from §9.2 (other than `xai_pref_*` prefix family and the two proposed) | reverse comparison |

---

## 4. Mock strategy

- **`localStorage`**: rely on jsdom's built-in implementation; reset between tests via `beforeEach(() => localStorage.clear())`. No manual mock library; jsdom is sufficient.
- **`console.warn`**: `vi.spyOn(console, "warn").mockImplementation(() => undefined)` per test that asserts warning behavior; restore in `afterEach`.
- **`StorageEvent`**: dispatch via `window.dispatchEvent(new StorageEvent("storage", { ... }))`; jsdom supports this constructor as of jsdom 25.
- **`QuotaExceededError`**: `vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new DOMException("Quota", "QuotaExceededError"); })` scoped to a single test, restored after.
- **SSR env**: separate test file with `// @vitest-environment node` directive (vitest convention). No mock needed — `typeof window === "undefined"` is genuinely true in Node.
- **Type-level assertions**: Vitest 3 supports `expectTypeOf` from `expect-type` (transitive via `vitest`); no extra dep. Co-located with runtime tests.

No fixture files. Defaults are sourced from the registry under test (this is the contract).

---

## 5. Out-of-scope tests

- Performance tests (no perf budget defined; localStorage IO is ms-level, irrelevant at scale).
- Real-browser tests (Playwright / Cypress) — `apps/web` E2E suite owns those; we don't duplicate.
- Multi-window typed-event tests — Frozen Assumption §3.10: storage layer does NOT integrate with `@repo/core/events` in v1.
- Encrypted storage tests — out of scope (SHIPPED `web-encrypted-indexeddb-cache` owns that path).
- Quota stress tests beyond AC-IMP-10 — we trust browser quota enforcement; one happy-path test of the error handler is sufficient.

---

## 6. Acceptance criteria (verify-gate input)

The `feature-verify` agent should run, in order, and require all to pass:

1. `pnpm --filter @repo/plugin-web-storage check-types` — exit 0
2. `pnpm --filter @repo/plugin-web-storage test` — exit 0; all ACs (§1.1–§3.2) green
3. `pnpm --filter @repo/web build` — exit 0 (Vite build sanity; AC-E2E-2)
4. **Cross-vendor re-verify** (per manifest `Verify Cross-vendor: yes`): re-run §1 (vitest) using Codex or Cursor in addition to Claude; both runs must agree on pass/fail. Mechanism: `bg-codex-pull` or equivalent dispatch. Documented in `dev_log.md` Phase Plan P3.
5. No new TS / ESLint warnings introduced in `packages/plugin-web-storage/`.

Minimum AC count target: **≥ 30** distinct scenarios across §1 + §2 + §3 (current draft has 35: 8 reg + 11 imp + 12 hook + 5 auto + 3 mig + 6 type + 6 SSR + 3 E2E + 2 parity — though SSR overlaps slightly with imperative; effective unique count is ~35). Comfortably exceeds the ≥10 floor used by sibling W0.B rows.

---

## 7. Quality bar

- Each phase's tests are co-located with that phase's source files.
- All tests are deterministic — no `await new Promise(r => setTimeout(r, ...))` hacks; use `act` for React state flushes.
- No `console.log` left in test files (lint should catch).
- `// @ts-expect-error` annotations are commented with the reason inline (per sibling-row convention).
- Snapshot tests are not used (no UI in this package).

## REL-03 regression evidence

Added storage scope, stale-hook/autosave, generation migration, marker quota failure, secret-stage failure, interrupted-candidate recovery, legacy byte preservation, rollback, captured-owner export/delete and tombstone tests. Three standalone repositories (Time Tracker, Bookkeeping, Metric Tracker) exercise A → B → A plus rejected stale A writes. Owner migration guard integration is executable using `pnpm --filter @repo/plugin-web-storage exec vitest run --root ../.. --config docs/reviews/web-account-data-isolation/migration-guards.config.mjs`. No live Supabase credentials are required; these tests do not prove a cross-vendor or production-auth release gate.
