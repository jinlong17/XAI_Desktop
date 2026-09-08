# Discovery Review — xai-web-persistence-contract

> Wave 1 · Foundation · roadmap row #3 · 2026-05-23
> Author: feature-plan (Claude Opus, parallel-Agent dispatch by xai-roadmap-loop)
> Seed brief: `docs/reviews/xai-web-persistence-contract/20260523-roadmap-seed.md`
> Governing ADR: `docs/adr/0007-xai-web-console-build-form.md` §S4 + §S8
> Source PRD: `web design/DESIGN.md` §9 数据模型与持久化, §9.2 持久化键
> Authority: PRD §9.2 SUPERSEDES any prior persistence key convention.

---

## 1. Problem framing

### 1.1 What we are building

A **single, typed localStorage key registry** that owns every `xai_*` UI-preference key declared in `web design/DESIGN.md` §9.2 (18 explicit keys + 1 prefix family `xai_pref_*` + 2 proposed keys from ADR-0007 §S8 = 20 typed entries + 1 prefix family; earlier drafts miscounted as "22 explicit" — REC-1 fix). The artefact is a new workspace package `@repo/plugin-web-storage` providing:

- `WebPrefRegistry` — TypeScript declaration that names every key, its value type, its default, and a schema version.
- `usePref<K extends WebPrefKey>(key, defaultOverride?)` — React 19 hook returning `[value, setter, meta]`, SSR-safe.
- `usePrefAutosave<K>(key, value)` — write-only sibling used by Settings panels to autosave on every change.
- `getPref` / `setPref` / `removePref` — imperative escape hatch for non-React contexts (e.g. event handlers, migrations, dev-tools).
- A `migrate(fromVersion, toVersion)` hook surface ready for future schema migration without breaking old user data.

### 1.2 Why now

W1 (Foundation) gates all 14 W2 module rows. Per ADR-0007 §S5 (frozen assumption 5) the 24 §9.2 keys are the authoritative persistence registry and "ownership is transferred to xai-web-persistence-contract (row #3)". Without this row landing, every downstream module (`xai-web-tasks`, `xai-web-board-core`, `xai-web-dashboard-grid`, `xai-web-pet`, `xai-web-settings-appearance`, `xai-web-ai-chat`, `xai-web-pomodoro`, `xai-web-countdown`) would need its own ad-hoc `localStorage.setItem` calls with stringly-typed keys — exactly the pattern the prototype uses today (see `web design/app.jsx:14–41`, `shell.jsx:87,95`, `pet.jsx:197–211`) and exactly the pattern that breaks data round-trip on import (per seed brief Hard Constraint #1).

### 1.3 Scope

**In scope** (this row):

- Create `packages/plugin-web-storage/` (`package.json` + `tsconfig.json` + `src/` + `docs/`).
- Declare the 24 keys (22 explicit + `xai_pref_*` prefix + 2 proposed) in `WebPrefRegistry`.
- Implement `usePref` + `usePrefAutosave` + imperative helpers, all SSR-safe.
- Implement a `schemaVersion` field per entry and a `migrate(from, to)` shell hook (no migrations registered in v1 — we just lock the surface).
- Provide an `onPrefChanged` cross-tab listener (the standard `storage` event) so two browser tabs see each other's writes.
- Smoke test: store + read for every key, SSR import does not throw, cross-tab event fires.

**Out of scope**:

- Settings UI rendering (owned by `xai-web-settings-shell` row #21, `xai-web-settings-appearance` row #22).
- The 14 W2 module data layers (cards, board data, etc.) — they consume the registry; they do not extend it.
- Encrypted IndexedDB / sync blob layer (already SHIPPED via `web-encrypted-indexeddb-cache`; ADR-0007 §S5 explicitly assigns module **data entities** to that layer, not localStorage).
- Any non-`xai_*` storage namespace (e.g. `@repo/web-auth-device-session` writes to its own keys; not our concern).

### 1.4 Non-goals

- We are **not** inventing new keys beyond the §9.2 list. Byte-for-byte parity with DESIGN.md is a Hard Constraint.
- We are **not** building a generic key-value store. This package owns one specific 24-key namespace, deliberately small and closed.
- We are **not** introducing a state-management library (zustand / jotai / redux). ADR-0007 §JSX→TSX rule 10 forbids it; `useState` + `useEffect` + event listener is sufficient.
- We are **not** writing migrations in v1. We lock the migration **surface** so future migrations land non-disruptively.

### 1.5 Constraints from upstream

From the seed brief:

- **C1** (key naming, byte-for-byte) — every key MUST match `web design/DESIGN.md` §9.2 literally so prototype-era user data round-trips.
- **C2** (versioning hook) — the registry MUST surface a versioning hook so future schema migrations can land non-disruptively.
- **C3** (SSR-safe) — `usePref` MUST not throw on `typeof window === "undefined"`; it returns the default and a no-op setter in that case.
- **C4** (single import path) — the rest of the wave must be able to depend on **one** import path without circular deps.

From ADR-0007:

- **C5** (port mapping §S4) — the package lives at `packages/plugin-web-storage/` (not `apps/web/src/lib/`). Business persistence logic is a plugin concern, not a host-shell concern (CLAUDE.md `Code Boundaries`).
- **C6** (no state libs §JSX→TSX rule 10) — `useState` + `useReducer` + `useContext` are the only state primitives allowed.
- **C7** (cross-module discipline §S4 + §跨模块通信规则) — modules read shared persisted state via this registry; they MUST NOT directly call `localStorage.getItem("xai_*")` in their own code.
- **C8** (data-entity vs UI-preference split §DESIGN.md §9 协调规则) — `xai_*` localStorage layer is for **UI preferences and small UI state**. Task cards, board data, habit check-ins, pomodoro records, countdowns, AI conversations land here per §9.2 but are explicitly bounded to "small UI state shapes"; large module-data persistence already SHIPPED via `web-encrypted-indexeddb-cache`. We faithfully port the §9.2 surface as documented; we do **not** redirect any §9.2 key into IndexedDB.

### 1.6 Acceptance signal

Per seed brief: every key in §9.2 has a typed entry in the registry; the hook compiles; a smoke test stores + reads a value; SSR import does not throw.

Operationalized (this row treats these as the verify-gate set):

1. `WebPrefRegistry` declares all 18 explicit keys + `xai_pref_*` prefix family + the 2 proposed keys (`xai_pomodoro_sessions`, `xai_countdowns`) = 20 typed entries + 1 prefix family, each with literal key string, value type, default, schemaVersion = 1.
2. `pnpm --filter @repo/plugin-web-storage check-types` passes.
3. `pnpm --filter @repo/plugin-web-storage test` passes — includes (a) round-trip per key, (b) SSR safety (`vi.stubGlobal("window", undefined)`), (c) cross-tab `storage` event fan-out, (d) `usePref` default fallback when key absent, (e) `usePref` JSON parse failure recovery.
4. Import `import { usePref } from "@repo/plugin-web-storage"` resolves in `apps/web/`'s tsc + Vite build (no circular dep).
5. Documentation invariant: every §9.2 key in the registry is annotated with its owning W2 row (matches ADR-0007 §S8 table).

---

## 2. Candidate options

Three plausible design axes, each with options:

### Axis A — Where the registry lives

**A1. New workspace package `packages/plugin-web-storage/` (selected)**

- Pros: matches CLAUDE.md `Code Boundaries` (business logic in `packages/plugin-*`, not `apps/web/src/`); matches ADR-0007 §S4 port mapping; reusable across host + plugins without circular dep; lets 14 W2 rows depend on one identifier; tree-shake friendly.
- Cons: new workspace dependency edge for every consumer.

**A2. `apps/web/src/lib/usePref.ts`**

- Pros: zero new packages.
- Cons: every plugin would need to import from the host shell (forbidden — reverse dependency); breaks ADR-0003 platform-independence intent for plugin code; if any W2 plugin ever ports to the desktop overlay (per ADR-0007 §结构性可能) it would need to bring along a host import. **Rejected**.

**A3. Extend `@repo/web-auth-device-session`**

- Pros: existing package already handles browser storage.
- Cons: that package's invariant is "browser auth, session, and device lifecycle"; UI prefs are a different concern with a different lifecycle (no auth required, no encryption required, syncs across tabs not devices). Conflating them violates the package's stated boundary. **Rejected**.

**Selected: A1.** Aligns with ADR-0007 §S4, CLAUDE.md, and the seed brief's hint `(e.g., @repo/plugin-web-storage)`.

### Axis B — Registry shape

**B1. Typed entry object per key (selected)**

```ts
const PREF_REGISTRY = {
  xai_accent_hue: { default: 165, schemaVersion: 1, codec: "number", category: "appearance", owner: "xai-web-settings-appearance" },
  xai_rail_pos:   { default: "left" satisfies RailPos, schemaVersion: 1, codec: "string", category: "appearance", owner: "xai-web-settings-appearance" },
  xai_rail_order: { default: DEFAULT_RAIL_ORDER, schemaVersion: 1, codec: "json", category: "shell", owner: "xai-web-shell" },
  // ...
} as const satisfies Record<string, PrefEntry<unknown>>;

type WebPrefKey = keyof typeof PREF_REGISTRY;
type WebPrefValue<K extends WebPrefKey> = (typeof PREF_REGISTRY)[K]["default"];
```

- Pros: every metadata (default, codec, owner, schemaVersion, category) is co-located with the key declaration; type-safe; one source of truth; doc-generation friendly (we render the §9.2 table from the registry, not the other way around).
- Cons: marginal verbosity vs a flat `Record<string, Default>`.

**B2. Two parallel maps (`DEFAULTS: Record<K, V>` + `SCHEMA_VERSIONS: Record<K, number>`)**

- Pros: slightly less verbose.
- Cons: two sources of truth for the same key set; lint cannot enforce parity; defeats Q-C2 (versioning hook should be locally evident, not scattered).

**Selected: B1.**

### Axis C — Hook API shape

**C1. `usePref<K>(key, defaultOverride?)` returning `[value, setter, meta]` (selected)**

```ts
const [accentHue, setAccentHue, { reset, isDefault, schemaVersion }] = usePref("xai_accent_hue");
```

- Pros: ergonomic for the common case; meta block ([reset/isDefault/schemaVersion]) makes Settings panel "Reset to default" trivial; matches React idiom of `[state, setState]`.
- Cons: tuple destructuring requires explicit type-narrowing on the key for the value type — handled by the conditional `WebPrefValue<K>`.

**C2. `usePref<K>(key)` returning an object `{ value, set, reset, ... }`**

- Pros: named fields, less positional.
- Cons: heavier at call sites; React community convention is the tuple form.

**C3. `useLocalStorage<T>(key, default)` generic (no registry)**

- Pros: maximum flexibility.
- Cons: defeats the entire point of the row — we need the **closed key set** to be statically verifiable. **Rejected.**

**Selected: C1.**

### Axis D — Library choice (defer to research)

Should we write our own hook or adopt an open-source library?

We ran a brief technology-selection research pass on usePref-style libraries:

- **`use-local-storage-state`** (Github astoilkov, 4M+ weekly downloads as of cutoff) — supports SSR, cross-tab via `storage` event, generic typing. Pros: battle-tested. Cons: generic API does not enforce a closed key set; we would still need to wrap it with our `WebPrefRegistry` for C1 + C4. Adds a runtime dep for a wrapping layer.
- **`usehooks-ts`** `useLocalStorage` — simpler; supports SSR but lacks codec hooks for migration. Cons: same closed-key-set objection; lighter than `use-local-storage-state` but still requires our wrapper.
- **Roll our own** — ~80 LOC; gives us full control of registry coupling, migration hook, SSR fallback, cross-tab event filtering (only fire for keys we own), and zero runtime dep. Code we write here is the only code that knows the registry; the wrapper layer would equal in size to the hook itself.

**Verification source** (cited in the planning artifacts):

- WebSearch query: `usePref react localStorage typed registry SSR safe 2026`
- WebSearch query: `useLocalStorage hook closed key set TypeScript registry pattern`
- npm registry tier consulted: `use-local-storage-state`, `usehooks-ts`, `@uidotdev/usehooks` (top 3 hits as of cutoff Jan 2026).

**Decision: Roll our own.** Justified because (a) the wrapping layer needed to enforce closed-key-set + migration hook + SSR-safe is the same size as the underlying primitive; (b) we avoid a new runtime dep; (c) the seed brief frames this as `provide a single usePref<T>(key, default) hook` — not "adopt a library"; (d) ADR-0007 §JSX→TSX rule 10 forbids state libs without re-evaluation — we treat that conservatively and avoid even a small hook lib to keep the dep-graph clean.

---

## 3. Recommendation

Build `@repo/plugin-web-storage` per Axis A1 + B1 + C1 + D-own. Implementation lands in 3 phases:

- **P1 — Typed registry + `usePref` hook + SSR safety + smoke test.** Single-shot, ships the dominant value (every W2 row can `import { usePref } from "@repo/plugin-web-storage"`). Includes the 22 explicit keys + `xai_pref_*` prefix family + the 2 proposed keys.
- **P2 — Migration scaffolding.** Adds `schemaVersion` + `migrate(from, to)` shell — no migrations registered in v1, but the surface is locked so future row PRs can add them without re-planning. Also adds the cross-tab `storage`-event listener and `usePrefAutosave` for Settings.
- **P3 — SSR smoke test + cross-vendor verify.** Runs the suite under Node (no `window`), under jsdom (with `window`), and confirms the package builds cleanly via Vite in `apps/web/`'s build pipeline. Verify-cross-vendor: yes (per manifest default).

Total package size estimate: ~220 LOC source + ~280 LOC tests. Zero runtime dependencies beyond react/react-dom (already workspace).

---

## 4. Tradeoffs accepted

- **No state library** — we accept the marginal duplication of `useState + useEffect + storage-event listener` (~80 LOC) in exchange for zero runtime dep and full type control. Reviewable in one read-through.
- **Closed key set is intentionally rigid** — any new key requires editing the registry (and ideally an ADR amendment or row PR). This is the **point**: §9.2 byte-for-byte parity is the Hard Constraint, and an open-ended `useLocalStorage<T>` would defeat it.
- **`xai_pref_*` prefix family is special-cased** — Settings autosaves an unbounded set of `xai_pref_<panel>_<field>` keys. The registry handles this via an `isPrefKey(key: string): boolean` validator plus a `usePrefAutosave<T>(suffix, value)` variant that types `xai_pref_${suffix}`. We accept that this single family escapes the closed-set guarantee; this is a Hard Constraint from §9.2.
- **Migration v1 is a stub** — `migrate(from, to)` exists but has zero registered migrations. We accept this because (a) we have no installed user base on the new build yet, (b) prototype data is what users will import and §9.2 byte-for-byte parity guarantees round-trip, (c) locking the surface is worth more than writing a migration we don't need.
- **Cross-tab fan-out via `storage` event only** — we do not implement BroadcastChannel fallback for Safari iframes etc. Acceptable because `apps/web/` is a single-document SPA without intentional iframe usage.
- **Two `proposed` keys (`xai_pomodoro_sessions`, `xai_countdowns`) are declared with reservation** — ADR-0007 §S8 + §已推迟事项 says owning rows (`xai-web-pomodoro` #14, `xai-web-countdown` #17) may rename them in their own feature-plan. We declare them now so consumers don't need to special-case them; if an owning row renames, this row's followup is a single registry entry update with a one-line migration.

---

## 5. Risks and open questions

### Risks

- **R1 — Key drift between registry and §9.2.** Mitigation: P1 includes a CI-friendly invariant test `byteForByteParityWithDesignSection92` that reads `web design/DESIGN.md`, parses §9.2's key list, and asserts the registry's `Object.keys(PREF_REGISTRY)` is a strict superset (allowing the two proposed keys + the `xai_pref_*` prefix family, both flagged). If §9.2 ever changes, this test catches drift immediately.
- **R2 — SSR import surface accidentally pulls a browser global at module-top-level.** Mitigation: P3 includes a Node-only test that imports the package with `globalThis.window` deleted; the import itself must not throw.
- **R3 — Two browser tabs simultaneously write the same key with different values.** Mitigation: P2's `storage` event listener picks last-write-wins (browser-native semantics); we document this in api.md as expected. We do **not** invent a CRDT or vector clock here — the keys are UI preferences, not collaborative state.
- **R4 — JSON deserialization failure (corrupt or hand-edited localStorage).** Mitigation: P1's hook wraps every `JSON.parse` in `try/catch` and falls back to default. Logged via `console.warn` for debugging.
- **R5 — TypeScript inference for `WebPrefValue<K>` regresses with TS 5.9.** Mitigation: P1 includes a small `expect-type` style sanity test (e.g. `assertType<number>(value satisfies WebPrefValue<"xai_accent_hue">)`) so a TS upgrade does not silently break consumers.
- **R6 — Quota exceeded (`QuotaExceededError`) when writing large module data (e.g. `xai_boards_v2` with many cards).** Mitigation: `setPref` catches `QuotaExceededError`, fires a `pref:write-failed` console.warn, and returns `false`. Documented in api.md as "best-effort persistence; check the boolean return".
- **R7 — Concurrent worker writes (P1 lands in parallel with siblings #2 and #4 per manifest).** Mitigation: all file writes are scoped to `packages/xai-web-persistence-contract/` (and downstream `packages/plugin-web-storage/` once we proceed to feature-build); no overlap with siblings' write targets.

### Open questions (do not block feature-review)

- **Q-OPEN-1** — Should `usePref` debounce writes? Decision: **no**, defer. The prototype writes on every change without debounce and runs fine. If we hit a hot-loop write later, we add an opt-in `usePrefDebounced` variant in a future row. Not in v1 scope.
- **Q-OPEN-2** — Should `xai_pref_*` autosave be opt-in or default-on for all Settings rows? Decision: **opt-in**; the `usePrefAutosave` hook is what consumers explicitly call. Default-on would risk every `useState` in Settings turning into a write.
- **Q-OPEN-3** — Naming: `@repo/plugin-web-storage` vs `@repo/plugin-web-prefs` vs `@repo/plugin-web-persistence`. Decision: **`@repo/plugin-web-storage`** for consistency with the seed brief's example name. Other W2 rows reference "persistence-contract" by row slug but should import from the package name.

### Deferred (explicitly out of v1)

- Schema migration registration (only the surface is locked).
- IndexedDB fallback for over-quota (`xai_boards_v2` could in theory grow large; out of scope — that path is `web-encrypted-indexeddb-cache`'s).
- BroadcastChannel cross-tab fan-out (only `storage` event in v1).
- Telemetry on storage errors (`@sentry/react` is already in `apps/web` per ADR §背景; we could `Sentry.captureException` on `QuotaExceededError`, but this is a follow-up).

---

## 6. Evidence + research log

- `web design/DESIGN.md` lines 384–400 — §9.2 table, the 22 explicit keys + `xai_pref_*` prefix family (authoritative).
- `web design/app.jsx` lines 14, 17, 20, 34, 37, 41 — current `xai_accent_hue` / `xai_rail_pos` / `xai_bg_tone` load+save pattern (prototype reference for round-trip parity).
- `web design/shell.jsx` lines 87, 95 — current `xai_rail_order` JSON load+save pattern.
- `web design/pet.jsx` lines 197, 203, 208, 211 — current `xai_pet_pos` (JSON) + `xai_pet_id` (string) load+save.
- `docs/adr/0007-xai-web-console-build-form.md` §S4 — file-level port mapping table (this row owns `WebPrefRegistry`); §S5 frozen assumption 5 — 24 keys ownership transfer; §S8 — persistence key appendix (22 explicit + 2 proposed + 1 prefix family); §JSX→TSX rule 10 — no state libs without re-evaluation.
- `docs/workflow/roadmap/xai-web-console.md` row #3 — `xai-web-persistence-contract`; depends on `xai-web-build-form-adr` (READY_TO_SHIP); dep semantics `ready_to_ship`.
- `packages/core/package.json` — workspace pattern reference (`exports`, `check-types`, `test`).
- `packages/web-auth-device-session/package.json` — sibling web package reference (workspace + React 19 + vitest pattern).
- WebSearch (research pass): `usePref react localStorage typed registry SSR safe 2026` — top hits: `use-local-storage-state` (astoilkov), `usehooks-ts`, `@uidotdev/usehooks`. Evaluated; rejected (see Axis D).
- WebSearch (research pass): `useLocalStorage hook closed key set TypeScript registry pattern` — no library found that enforces a closed key set; the registry-+-hook pattern is consistently rolled-own across React 19 codebases reviewed.
- CLAUDE.md `Code Boundaries` — Business logic → `packages/plugin-*`, never in `apps/web/src/`; cross-plugin via `@repo/core/events`; `index.ts` is the only public surface.

---

## 7. Next step

Proceed to `feature-review`. Reviewer should verify:

1. **§9.2 byte-for-byte parity** — confirm every key in DESIGN.md §9.2 has exactly one literal-string entry in the planned registry (see `docs/api.md` §1 in this row).
2. **ADR-0007 §S4 port mapping** — confirm the package lives at `packages/plugin-web-storage/`, the host shell (`apps/web/`) is **not** the owner.
3. **No state library** — confirm the plan uses only `useState + useEffect + storage event`; no zustand/jotai/redux/`use-local-storage-state`.
4. **SSR-safe surface** — confirm every export gracefully handles `typeof window === "undefined"` (default returned, setter no-op'd, no throw at import).
5. **Migration surface locked** — confirm `schemaVersion: 1` is on every entry and a `migrate(from, to)` shell exists, even if empty.
6. **Two `proposed` keys handled** — confirm `xai_pomodoro_sessions` and `xai_countdowns` are declared with a comment indicating ADR-0007 §S8 reservation that owning rows may rename.
7. **Cross-vendor verify gate** — manifest default `yes`; reviewer expects Phase Plan to include a Codex/Cursor re-verify step on the test suite.
