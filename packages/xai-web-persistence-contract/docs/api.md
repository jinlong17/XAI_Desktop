# API Contract — `@repo/plugin-web-storage`

> Row: `xai-web-persistence-contract` (#3)
> Status: SHIPPED + 1 BUGFIX (2026-05-24 — xai_pref_* read-path opened)
> Public surface only. Implementation details (file layout, helper functions) live in `src/internal/` and are NOT exported.
> Source PRD: `web design/DESIGN.md` §9.2
> Governing ADR: `docs/adr/0007-xai-web-console-build-form.md` §S4 + §S8

---

## 1. Key Registry — `WebPrefRegistry`

The registry IS the §9.2 table. Byte-for-byte parity is a Hard Constraint.

### 1.1 Explicit keys (18)

| Key (literal) | Codec | Type | Default | Owner row | §9.2 line |
|---|---|---|---|---|---|
| `xai_accent_hue` | number | `number` | `165` | xai-web-settings-appearance | 388 |
| `xai_rail_pos` | string | `"left" \| "right" \| "top" \| "bottom"` | `"left"` | xai-web-settings-appearance | 389 |
| `xai_bg_tone` | string | `"default" \| "sage" \| "cream" \| "mist" \| "lavender" \| "peach" \| "graphite"` | `"default"` | xai-web-settings-appearance | 390 |
| `xai_rail_order` | json | `RailItemId[]` | `["tasks","board","dashboard","calendar","matrix","pomodoro","habits","meditation","countdown","ai","statistics","settings"]` | xai-web-shell | 391 |
| `xai_pet_pos` | json | `{ x: number; y: number }` | `{ x: 24, y: 520 }` | xai-web-pet | 392 |
| `xai_pet_id` | string | `"mochi" \| "pip" \| "sprout" \| "lumi" \| "drip" \| "pebble" \| "star" \| "ember"` | `"mochi"` | xai-web-pet | 392 |
| `xai_task_cols` | json | `Record<string, boolean>` (column collapsed/expanded) | `{}` | xai-web-tasks | 393 |
| `xai_boards_v2` | json | `BoardsState` (board+card schema; declared by xai-web-board-core) | `null` | xai-web-board-core | 394 |
| `xai_active_board` | string | `string` (board id) | `""` | xai-web-board-core | 394 |
| `xai_board_panels` | json | `BoardPanelState[]` (declared by xai-web-board-core) | `[]` | xai-web-board-core | 395 |
| `xai_board_inbox` | json | `InboxCard[]` (declared by xai-web-board-core) | `[]` | xai-web-board-core | 395 |
| `xai_dash_order` | json | `DashWidgetId[]` (declared by xai-web-dashboard-grid) | `["clock","minicalendar","worldclocks","weather","stickies","mail","upcoming","stats"]` | xai-web-dashboard-grid | 396 |
| `xai_clock_style` | string | `"analog" \| "digital" \| "minimal"` | `"analog"` | xai-web-dashboard-widgets | 397 |
| `xai_clock_tz` | string | `string` (IANA tz) | `"local"` | xai-web-dashboard-widgets | 397 |
| `xai_zones` | json | `string[]` (IANA tz list) | `[]` | xai-web-dashboard-widgets | 398 |
| `xai_ai_convos` | json | `AiConvo[]` (declared by xai-web-ai-chat) | `[]` | xai-web-ai-chat | 399 |
| `xai_ai_insights` | boolean | `boolean` | `true` | xai-web-ai-chat | 399 |
| `xai_ai_voice` | boolean | `boolean` | `false` | xai-web-ai-chat | 399 |

### 1.2 Proposed keys (2) — ADR-0007 §S8 reservation

These two keys are declared with the same shape as §1.1 but carry a `proposed: true` flag. ADR-0007 §已推迟事项 explicitly says the owning rows may rename them in their own feature-plan. If renamed, this row's followup is a single registry entry update + a one-line migration registered via `migrate`.

| Key (literal) | Codec | Type | Default | Owner row | Status |
|---|---|---|---|---|---|
| `xai_pomodoro_sessions` | json | `PomodoroSession[]` (declared by xai-web-pomodoro) | `[]` | xai-web-pomodoro | proposed |
| `xai_countdowns` | json | `Countdown[]` (declared by xai-web-countdown) | `[]` | xai-web-countdown | proposed |

### 1.3 Open-ended prefix family (1)

| Prefix | Codec hint | Owner |
|---|---|---|
| `xai_pref_*` | (per-call) | xai-web-settings-shell / -appearance / -features-panel / -rest (every Settings panel can call `usePrefAutosave`) |

The `xai_pref_*` family does NOT have a single declared type. Each consumer provides its own type via the `usePrefAutosave<T>(suffix, value)` type parameter. The registry exposes an `isPrefKey(key: string): key is \`xai_pref_${string}\`` runtime validator.

### 1.4 Per-entry shape — `PrefEntry<T>`

```ts
export type PrefCodec = "string" | "number" | "boolean" | "json";

export interface PrefEntry<T> {
  /** The literal localStorage key. */
  readonly key: string;
  /** How the value is serialized. */
  readonly codec: PrefCodec;
  /** The value returned when the key is absent or the stored value cannot be decoded. */
  readonly default: T;
  /** Bumped when the value shape changes; future rows register migrations against this. */
  readonly schemaVersion: number;
  /** Owner row slug, for documentation / lint. */
  readonly owner: string;
  /** Source category — matches §9.2 grouping. */
  readonly category: "appearance" | "shell" | "pet" | "module" | "pref";
  /** True if the key is reserved by ADR-0007 §S8 as renameable. */
  readonly proposed?: true;
}
```

### 1.5 The registry object

```ts
export const PREF_REGISTRY: {
  readonly xai_accent_hue: PrefEntry<number>;
  readonly xai_rail_pos: PrefEntry<RailPos>;
  readonly xai_bg_tone: PrefEntry<BgTone>;
  // ... all 20 entries from §1.1 + §1.2
} = { /* ... */ } as const;

export type WebPrefKey = keyof typeof PREF_REGISTRY;
export type WebPrefValue<K extends WebPrefKey> = (typeof PREF_REGISTRY)[K]["default"];
```

---

## 2. React hook — `usePref`

### 2.1 Signature

```ts
export function usePref<K extends WebPrefKey>(
  key: K,
  defaultOverride?: WebPrefValue<K>,
): readonly [
  value: WebPrefValue<K>,
  setValue: (next: WebPrefValue<K> | ((prev: WebPrefValue<K>) => WebPrefValue<K>)) => void,
  meta: PrefMeta<WebPrefValue<K>>,
];

export interface PrefMeta<T> {
  readonly schemaVersion: number;
  readonly isDefault: boolean;     // true when value is the registry default (and no key in storage)
  readonly reset: () => void;       // setValue(default) + removePref
}
```

### 2.2 Semantics

- **Initial value**: try `localStorage.getItem(key)`; if present and decode succeeds, use it. Otherwise use `defaultOverride ?? PREF_REGISTRY[key].default`.
- **Set**: writes synchronously to localStorage via `setPref`, fires same-tab subscribers immediately, and lets the browser's `storage` event fan-out to other tabs.
- **Functional updates**: `setValue(prev => prev + 1)` works the same as `useState`.
- **Cross-tab reactivity**: an internal `useEffect` listens to `window.addEventListener("storage", ...)` and updates `value` when another tab writes the same key. Same-tab updates use an internal pub/sub (because `storage` event does NOT fire in the originating tab).
- **JSON parse failure**: caught; logged via `console.warn("[plugin-web-storage] decode failed for <key>:", err)`; falls back to default.
- **SSR fallback**: when `typeof window === "undefined"`, `value` is the default, `setValue` is a no-op (logs once via `console.warn`), `meta.isDefault === true`, `meta.reset` is a no-op.

### 2.3 Example

```ts
import { usePref } from "@repo/plugin-web-storage";

function AccentSlider() {
  const [hue, setHue, { reset, isDefault }] = usePref("xai_accent_hue");
  return (
    <>
      <input type="range" min={0} max={360} value={hue} onChange={(e) => setHue(Number(e.target.value))} />
      {!isDefault && <button onClick={reset}>Reset</button>}
    </>
  );
}
```

---

## 3. Settings autosave hook — `usePrefAutosave`

### 3.1 Signature

```ts
export function usePrefAutosave<T>(
  suffix: string,                       // becomes the suffix of `xai_pref_${suffix}`
  value: T,                              // the live React state to persist on change
  options?: { codec?: PrefCodec },     // default: "json"; provide "string"/"number"/"boolean" for primitives
): void;
```

### 3.2 Semantics

- Writes `xai_pref_${suffix}` to localStorage on every change to `value` (via `useEffect`).
- Does NOT read the key; consumers are expected to seed their React state from **`getPrefAutosave<T>(suffix, options?)`** (see §4.5) at mount. The older wording "seed from `getPref`" was inaccurate — `getPref` only accepts registered `WebPrefKey` values; the typed read for arbitrary `xai_pref_*` suffixes lives in `getPrefAutosave`.
- Throws (compile-time TS error) if `suffix.includes("/")` or contains characters that would break `isPrefKey` regex; runtime validates in dev.
- SSR fallback: silently no-ops when `typeof window === "undefined"`.

### 3.3 Why a separate hook

Per Discovery §5 Q-OPEN-2: making `xai_pref_*` autosave opt-in (not bundled into `usePref`) avoids accidentally turning every `useState` in Settings into a persistent write. Consumers explicitly opt in.

### 3.4 Example

```ts
import { usePrefAutosave, getPrefAutosave } from "@repo/plugin-web-storage";

function AppearancePanel() {
  // Seed from the previously-autosaved value on mount, fall back to the
  // panel-local default.
  const [density, setDensity] = useState<"comfortable" | "compact">(
    () =>
      getPrefAutosave<"comfortable" | "compact">("appearance_density", {
        codec: "string",
        defaultValue: "comfortable",
      }) ?? "comfortable",
  );
  usePrefAutosave("appearance_density", density, { codec: "string" });
  // ...
}
```

---

## 4. Imperative helpers

For non-React contexts (event handlers, migrations, dev-tools).

### 4.1 `getPref`

```ts
export function getPref<K extends WebPrefKey>(key: K): WebPrefValue<K>;
```

- Reads localStorage; decodes via the registry codec; returns the default on absent / decode-failure / SSR.

### 4.2 `setPref`

```ts
export function setPref<K extends WebPrefKey>(key: K, value: WebPrefValue<K>): boolean;
```

- Encodes via the registry codec; writes localStorage; fires same-tab subscribers. Returns `true` on success, `false` on SSR no-op or `QuotaExceededError`. Catches `QuotaExceededError` and logs via `console.warn`; never throws.

### 4.3 `removePref`

```ts
export function removePref<K extends WebPrefKey>(key: K): void;
```

- Calls `localStorage.removeItem(key)`. Same-tab subscribers re-read and observe `default`. SSR no-op.

### 4.4 `isPrefKey`

```ts
export function isPrefKey(s: string): s is `xai_pref_${string}`;
```

- Runtime guard for the `xai_pref_*` open-ended family. Used by `usePrefAutosave` and by dev-tools when iterating `localStorage`.

### 4.5 `getPrefAutosave` — typed read for the `xai_pref_*` family

```ts
export interface GetPrefAutosaveOptions<T> {
  /** Codec used to deserialize. Must match the codec passed to `usePrefAutosave`. Default: "json". */
  codec?: PrefCodec;
  /** Value returned when the key is absent, decode fails, or running under SSR. */
  defaultValue?: T;
}

export function getPrefAutosave<T>(
  suffix: string,
  options?: GetPrefAutosaveOptions<T>,
): T | undefined;
```

- Typed read for arbitrary `xai_pref_${suffix}` keys written by `usePrefAutosave` (or by `setPrefAutosave` below).
- Returns `options.defaultValue` (or `undefined` if none) when the key is absent, the stored value cannot be decoded with the given codec, or the function runs during SSR.
- The codec MUST match the codec passed to the corresponding `usePrefAutosave` call. There is no per-key registry for the `xai_pref_*` family — the consumer pair (`usePrefAutosave` write + `getPrefAutosave` read) is the authoritative contract for that suffix.
- Suffix validation matches `usePrefAutosave`: `suffix` MUST NOT contain `/`. In dev/test it throws; in production it warns and returns the default.

### 4.6 `setPrefAutosave` — imperative write companion

```ts
export interface SetPrefAutosaveOptions {
  /** Codec used to serialize. Default: "json". Must match the reader's codec. */
  codec?: PrefCodec;
}

export function setPrefAutosave<T>(
  suffix: string,
  value: T,
  options?: SetPrefAutosaveOptions,
): boolean;
```

- Imperative write for `xai_pref_${suffix}` keys. Mirrors `setPref` semantics: compare-before-write, same-tab pub/sub on change, SSR returns `false` + one-line warn, `QuotaExceededError` returns `false`, suffix validation identical to `usePrefAutosave`.
- Primary use case: non-React contexts (event handlers, migrations, dev-tools) that need to mutate an autosave key without mounting a hook. React consumers should keep using `usePrefAutosave`.

### 4.7 `removePrefAutosave` — imperative remove

```ts
export function removePrefAutosave(suffix: string): void;
```

- Removes `xai_pref_${suffix}` from localStorage and publishes `undefined` to same-tab subscribers. SSR no-op. No return value (no failure mode worth surfacing).

---

## 5. SSR fallback table

| Surface | Browser behavior | SSR (`typeof window === "undefined"`) behavior |
|---|---|---|
| `usePref(key)` initial value | localStorage value or default | default |
| `usePref(key)` setter | writes localStorage + fires subs | logs once via `console.warn("[plugin-web-storage] setPref called during SSR; no-op")`, returns void |
| `usePref(key)` meta.isDefault | reflects actual state | always `true` |
| `usePref(key)` meta.reset | resets to default + writes | no-op |
| `usePrefAutosave(suffix, value)` | writes on change | no-op (no `useEffect` runs at SSR; safe by React semantics, but we also defend in the body) |
| `getPref(key)` | localStorage or default | default |
| `setPref(key, v)` | writes; returns `true`/`false` | returns `false` |
| `removePref(key)` | removes | no-op |
| `isPrefKey(s)` | pure regex | pure regex (no window access) |
| `getPrefAutosave(suffix, opts)` | localStorage value or `opts.defaultValue` | returns `opts.defaultValue` (or `undefined`) |
| `setPrefAutosave(suffix, v, opts)` | writes; returns `true`/`false` | returns `false` + one-line warn |
| `removePrefAutosave(suffix)` | removes + publishes `undefined` to same-tab subs | no-op |
| `migrate(from, to)` | runs registered migrations (v1: none) | no-op |
| **Module import** | safe | safe — no top-level `window` / `localStorage` access |

---

## 6. Migration surface — `migrate` (v1 stub)

### 6.1 Signature

```ts
export function migrate(fromVersion: number, toVersion: number): void;
```

### 6.2 v1 semantics

- v1 has zero registered migrations. `migrate(from, to)` is callable for forward-compatibility and returns `void` immediately.
- Owning rows that need a migration in a future row PR register one via a `registerMigration(opts: { key: WebPrefKey; from: number; to: number; up: (raw: unknown) => unknown }): void` helper. **`registerMigration` is NOT exported in v1** — the surface is held in reserve. Adding it is a follow-up row PR (not feature-plan-blocking).
- Called by `apps/web/src/main.tsx` (host shell) once at app boot, after registry import but before React mount. Host shell wiring is part of `xai-web-shell` row #5; this row only exports the helper.

### 6.3 Why v1 has no migrations

Discovery §4 — we have no installed user base on the new build yet, prototype data round-trips because of byte-for-byte parity, and locking the surface is worth more than writing speculative migrations.

---

## 7. Error semantics

| Failure mode | Where | Behavior | Logging |
|---|---|---|---|
| `JSON.parse` failure on read | `getPref` / `usePref` initial value | Fall back to default; the corrupt value remains in localStorage until next `setPref` | `console.warn("[plugin-web-storage] decode failed for <key>:", err)` once per session per key |
| `QuotaExceededError` on write | `setPref` | Return `false`; value remains the prior value in storage (browser-native) | `console.warn("[plugin-web-storage] quota exceeded for <key>")` per write |
| `localStorage` unavailable (e.g. Safari Private Mode old) | `setPref` / `getPref` | All operations silently no-op; `usePref` returns default | One-shot `console.warn` on first access |
| Cross-tab event for unknown key | `storage` listener | Ignored | None |
| Type mismatch (caller passes wrong type) | `setPref` | TypeScript compile error; no runtime guard in v1 | n/a |
| Codec mismatch (e.g. `codec: "number"` but stored value is `"abc"`) | `getPref` / `usePref` initial | Fall back to default | Same as JSON parse failure |

No surface throws. All errors are absorbed and reported via `console.warn`.

---

## 8. Permission and idempotency notes

- **Permission**: no special permission. localStorage is the standard browser API; no `navigator.permissions` query required. Safari Private Mode old behavior (quota = 0) is treated as "unavailable" per §7.
- **Idempotency**: `setPref(k, v)` is idempotent — writing the same value twice is a no-op from the consumer's perspective (we do compare-before-write to avoid spurious `storage` events). `removePref(k)` followed by a second `removePref(k)` is a no-op.
- **Atomicity**: localStorage is synchronous and atomic per-key (browser-guaranteed). Multi-key writes are NOT transactional — if you write key A then key B and the second throws, A is committed. v1 does not provide a transaction API; if a future row needs multi-key atomicity, it can be added as `withTransaction(() => { ... })` in a follow-up row PR.

---

## 9. Package exports — `package.json`

```json
{
  "name": "@repo/plugin-web-storage",
  "version": "0.0.0",
  "type": "module",
  "private": true,
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "import": "./src/index.ts"
    }
  },
  "scripts": {
    "check-types": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0"
  },
  "devDependencies": {
    "@repo/typescript-config": "workspace:*",
    "@types/react": "19.2.2",
    "@types/react-dom": "19.2.2",
    "jsdom": "^25.0.0",
    "typescript": "5.9.2",
    "vitest": "^3.2.1"
  }
}
```

Single export at `.`; no subpath exports. Consumers do `import { usePref, setPref, isPrefKey, type WebPrefKey } from "@repo/plugin-web-storage"`.

---

## 10. Interface stability

- **Stable** (v1+ unchanged across all subsequent rows unless an ADR amendment): `WebPrefKey`, `WebPrefValue<K>`, `PrefEntry<T>`, `PrefCodec`, `usePref`, `getPref`, `setPref`, `removePref`, `isPrefKey`, `usePrefAutosave`, `PREF_REGISTRY` literal key set.
- **Stable from 2026-05-24 BUGFIX** (added to close the Codex cross-vendor BLOCKED on the `xai_pref_*` read-path): `getPrefAutosave`, `setPrefAutosave`, `removePrefAutosave`, `GetPrefAutosaveOptions<T>`, `SetPrefAutosaveOptions`. These are the typed read/write/remove for the open-ended `xai_pref_*` family; they mirror `usePrefAutosave` semantics for non-React seed/mutate contexts.
- **Reserved** (may be added without an ADR amendment): `registerMigration`, `withTransaction`, `usePrefDebounced`, `subscribePref` (lower-level imperative subscriber). Adding any of these is a future row PR.
- **Renameable** (per ADR-0007 §S8 reservation): the two `proposed: true` keys. Renaming triggers a migration registered via the (future) `registerMigration` helper.
