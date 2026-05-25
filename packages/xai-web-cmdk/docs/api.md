# API Contract — xai-web-cmdk

## §0 Public surface (src/index.ts)

The ONLY allowed import path. `src/internal/*` and `src/adapters/*` (individual
files) are forbidden per CLAUDE.md "Code Boundaries".

```ts
// Components
export { CommandPalette } from "./CommandPalette";
export { CommandPaletteProvider } from "./CommandPaletteProvider";
export { PaletteInput } from "./PaletteInput";          // test convenience; consumer apps use <CommandPalette/>
export { PaletteList } from "./PaletteList";            // test convenience
export { PaletteResultRow } from "./PaletteResultRow";  // test convenience

// Hook
export { useCommandPalette } from "./registration";

// Adapter registration (consumer modules can register additional adapters; v1 11 are bundled)
export { registerSearchAdapter } from "./internal/registry";

// Test helpers (gated by NODE_ENV — usable by sibling-package tests; not by production code)
export {
  getRegisteredAdapters,
  __resetCmdkRegistry,
} from "./internal/registry";

// Pure helpers — exported for sibling-package unit tests
export { escapeHtml } from "./internal/escapeHtml";
export { highlightMatch } from "./internal/highlightMatch";

// Types
export type {
  SearchHit,
  SearchHitKind,
  ModuleSearchAdapter,
  UseCommandPalette,
  CommandPaletteProps,
  CommandPaletteProviderProps,
} from "./types";
```

Sideways CSS import via `package.json` `"sideEffects": ["./src/styles.css"]`.

---

## §1 Types

### §1.1 SearchHitKind

```ts
export type SearchHitKind =
  | "module-jump"     // navigate to /app/<moduleId>; no entity highlight
  | "entity"          // navigate to /app/<moduleId>; emit entityId for module-side scrollIntoView
  | "settings-pane";  // navigate to /app/settings; emit entityId = paneId
```

### §1.2 SearchHit

```ts
export interface SearchHit {
  /** Stable hit id, formed as `${moduleId}:${entityId ?? "*"}`. Used as React key. */
  readonly id: string;
  /** Source module. */
  readonly moduleId: WebModuleId;
  /** Kind discriminator. */
  readonly kind: SearchHitKind;
  /** Entity id (card id, session id, pane id, etc.). Absent for "module-jump". */
  readonly entityId?: string;
  /** Display label — bilingual; renderer picks based on current lang. */
  readonly label: { readonly en: string; readonly zh: string };
  /** Optional sub-label for context (e.g., "Pomodoro · 25 min · 2026-05-10"). */
  readonly sub?: { readonly en: string; readonly zh: string };
  /** Score for ranking. Higher = better. Range [0, 100]. */
  readonly score: number;
  /**
   * Optional match-highlight metadata. Adapter populates `matchSpans` so the
   * renderer can wrap matched substrings with <mark>. If absent, renderer
   * falls back to a single-pass `escapeHtml(label)` with no <mark> wrapping.
   */
  readonly matchSpans?: ReadonlyArray<{ readonly start: number; readonly end: number; readonly source: "en" | "zh" }>;
}
```

### §1.3 ModuleSearchAdapter

```ts
export type ModuleSearchAdapter = (
  query: string,
  state: unknown,
) => readonly SearchHit[];
```

**Contract:**

- Pure function (no side effects, no I/O, no `Date.now()` calls beyond pure
  scoring — implementations should NOT depend on current time).
- Never throws. Wrap body in `try/catch`; return `[]` on failure.
- Receives `state` as `unknown` (boundary cast pattern). Adapter is responsible
  for runtime shape validation via predicate before reading.
- Query is **already lowercased** by the caller. Adapter MAY still normalize
  the candidate fields (lowercase, trim, NFKC normalize) for matching.
- Returns at most 20 hits (adapter-internal cap; aggregator additionally
  caps the overall result list to 50).
- Empty query returns up to 1 hit (the module-jump entry) — used to render
  "Jump to module" rows when the user opens the palette without typing.

### §1.4 UseCommandPalette

```ts
export interface UseCommandPalette {
  /** Open the palette. */
  open: (opts?: { source?: "shortcut" | "topbar-click" | "programmatic" }) => void;
  /** Close the palette. */
  close: () => void;
  /** Whether the palette is currently open. */
  isOpen: boolean;
  /** Current query string. */
  query: string;
  /** Set the query string. */
  setQuery: (next: string) => void;
}
```

### §1.5 CommandPaletteProps

```ts
export interface CommandPaletteProps {
  /** Lang used to render bilingual labels + i18n strings. */
  lang: "en" | "zh";
  /** Optional override for navigate; default uses `useNavigate()` from react-router. */
  navigate?: (path: string) => void;
}
```

### §1.6 CommandPaletteProviderProps

```ts
export interface CommandPaletteProviderProps {
  children: ReactNode;
}
```

---

## §2 EventMap extensions (declared in `@repo/core/types/events.ts`)

```ts
// Added by xai-web-cmdk-search row #3
'web:search:invoked': {
  /** What caused the palette to open. */
  source: 'shortcut' | 'topbar-click' | 'programmatic';
  /** ISO timestamp at the moment of open. */
  openedAt: string;
};

'web:search:jump': {
  /** Destination module. */
  moduleId: WebModuleId;
  /** Hit kind that was selected. */
  hitKind: 'module-jump' | 'entity' | 'settings-pane';
  /** Entity id when kind === "entity" | "settings-pane"; null for "module-jump". */
  entityId: string | null;
  /** Snapshot of the query text at jump time (lowercased; max 256 chars). */
  query: string;
  /** ISO timestamp at the moment of jump. */
  jumpedAt: string;
};
```

**Owner**: `@repo/xai-web-cmdk`. Consumers may `useWebEventListener` to
observe (no consumer ships in this row beyond the cmdk component itself).

---

## §3 registerSearchAdapter

```ts
export function registerSearchAdapter(
  moduleId: WebModuleId,
  adapter: ModuleSearchAdapter,
): void;
```

**Behaviour:**

- Adds (or replaces) the adapter for the given module id in the in-memory
  Map<WebModuleId, ModuleSearchAdapter>.
- Returns void.
- Replacing an existing adapter logs `console.warn` in `process.env.NODE_ENV === "development"` (helps debug accidental dual-registration) but does NOT throw — production behaviour is to silently replace (last-registration-wins).
- Test helper `__resetCmdkRegistry()` clears the Map; useful between tests.

---

## §4 useCommandPalette

React hook. Must be called from a descendant of `<CommandPaletteProvider/>`.

```ts
const { open, close, isOpen, query, setQuery } = useCommandPalette();
```

Throws `Error("useCommandPalette must be used within <CommandPaletteProvider>")`
if called outside provider. Tested as IB4.

---

## §5 readModuleStates (internal — exported for tests via the helper barrel)

```ts
// internal — re-exported for sibling-package tests if needed
export function readModuleStates(): Record<WebModuleId, unknown>;
```

Reads `localStorage` synchronously via `getPref` for all 11 known module
storage keys. Returns a frozen Record. Keys with no localStorage entry resolve
to their registry default per the SHIPPED `usePref` contract.

Mapping (frozen):

| moduleId | storage source(s) |
|---|---|
| `tasks` | `xai_task_cols` |
| `board` | `xai_boards_v2` + `xai_active_board` + `xai_board_panels` + `xai_board_inbox` (collected into one tuple) |
| `dashboard` | `xai_dash_order` + `xai_clock_style` + `xai_clock_tz` + `xai_zones` |
| `calendar` | (none — empty `{}`) |
| `matrix` | `xai_matrix_state` |
| `pomodoro` | `xai_pomodoro_sessions` |
| `habits` | `xai_habits_state` |
| `meditation` | `xai_meditation_prefs` |
| `countdown` | `xai_countdowns` |
| `statistics` | (none — empty `{}`) |
| `settings` | (paneRegistry imported from `@repo/plugin-web-settings-shell`; no localStorage read here) |

---

## §6 buildIndex (internal)

```ts
export function buildIndex(
  query: string,
  moduleStates: Record<WebModuleId, unknown>,
): readonly SearchHit[];
```

- Lowercases query.
- Iterates the 11 registered adapters in deterministic order (rail order from `xai_rail_order` registry default).
- For each adapter, invokes `adapter(lowerQuery, moduleStates[moduleId])`.
- Concatenates results.
- Sorts by `score` desc, then by `moduleId` asc (deterministic tie-break).
- Caps to 50 total hits.
- Returns frozen array.

---

## §7 escapeHtml (internal — also re-exported)

```ts
export function escapeHtml(s: string): string;
```

Maps:

| Input | Output |
|---|---|
| `&` | `&amp;` |
| `<` | `&lt;` |
| `>` | `&gt;` |
| `"` | `&quot;` |
| `'` | `&#39;` |

All other characters pass through unchanged. **No** allowlist of "safe" tags
— this is a pure escape, not a sanitizer.

---

## §8 highlightMatch (internal — also re-exported)

```ts
export function highlightMatch(text: string, query: string): string;
```

- Calls `escapeHtml(text)` first.
- Then wraps every case-insensitive occurrence of `escapeHtml(query)` with
  `<mark>...</mark>`.
- Returns the result string. Caller passes to `dangerouslySetInnerHTML`.
- **Important**: the substitution operates on the ALREADY-ESCAPED string, so
  user-injected `<script>` payloads in either `text` or `query` are inert.

---

## §9 navigateToHit (internal)

```ts
export function navigateToHit(
  hit: SearchHit,
  navigate: (path: string) => void,
  emit: (event: 'web:search:jump', payload: EventMap['web:search:jump']) => void,
  query: string,
): void;
```

- Builds path based on `hit.kind`:
  - `"module-jump"` → `/app/${hit.moduleId}`
  - `"entity"` → `/app/${hit.moduleId}` (the module consumes the jump event for entity scroll)
  - `"settings-pane"` → `/app/settings` (settings module consumes jump event for pane focus)
- Calls `emit("web:search:jump", { moduleId, hitKind: kind, entityId: entityId ?? null, query, jumpedAt: new Date().toISOString() })`.
- Calls `navigate(path)`.

---

## §10 keyboardCombo.matchesCmdK

```ts
export function matchesCmdK(e: KeyboardEvent): boolean;
```

Returns `true` iff:

- `e.key === "k"` OR `e.key === "K"` (case-insensitive).
- On macOS (`navigator.platform.startsWith("Mac")` OR `navigator.userAgent.includes("Mac")`): `e.metaKey === true && e.ctrlKey === false`.
- Otherwise: `e.ctrlKey === true && e.metaKey === false`.
- `e.altKey === false && e.shiftKey === false`.

Returns `false` if the event target is `contentEditable` OR a focused
`<textarea>` (so users can type "K" inside text inputs without triggering
the palette). The topbar input case does NOT apply because we are swapping
that input for a button in P4.

---

## §11 CSS class contract

| Class | Source | Used by |
|---|---|---|
| `.cmdk-scrim` | this package's `styles.css` | scrim overlay (DESIGN.md §6 `.modal-scrim` idiom) |
| `.cmdk-modal` | this package's `styles.css` | modal shell (DESIGN.md §6 `.card-modal` idiom) |
| `.cmdk-input` | this package's `styles.css` | monospace input (HC6) |
| `.cmdk-list` | this package's `styles.css` | `role="listbox"` result container |
| `.cmdk-row` | this package's `styles.css` | `role="option"` result row |
| `.cmdk-row.active` | this package's `styles.css` | currently-highlighted row (arrow-nav) |
| `.cmdk-mark` | this package's `styles.css` (or default `<mark>` browser styling) | match-highlight span |

All colors via existing tokens (`--bg-panel`, `--text-primary`, `--accent`,
`--border-1`); zero hex literals. Verified in P3 lint sweep.

---

## §12 Error semantics

| Failure mode | Behaviour |
|---|---|
| Adapter throws | Caught at boundary; that adapter's hits omitted; warn in dev, silent in prod |
| `localStorage` unavailable (SSR / private mode) | `readModuleStates` returns empty `{}` per moduleId; index is empty; palette shows "No results" |
| Malformed JSON in any `xai_*` key | `getPref` returns the registry default; adapter handles default state shape |
| `useCommandPalette` outside provider | Throws with descriptive message |
| Cmd+K while palette already open | No-op (`open` is idempotent when `isOpen === true`) |
| Esc while palette closed | No-op |
| Navigate while palette closed | No-op; component is unmounted |
| `dangerouslySetInnerHTML` content includes `<` (post-escape) | Impossible — `escapeHtml` runs first; the `<mark>` insertion is the ONLY raw HTML in the pipeline |

---

## §13 Idempotency

| Operation | Idempotent? |
|---|---|
| `open()` | Yes — second call when already open is no-op |
| `close()` | Yes |
| `registerSearchAdapter(id, fn)` | Last-wins (replaces) |
| Emit `web:search:invoked` | NOT idempotent — emitted once per `open()` call (first call only when `isOpen===false`) |
| Emit `web:search:jump` | NOT idempotent — emitted once per Enter/click |

---

## §14 Permissions

None. No `requestPermission` calls. No clipboard / notifications / fullscreen
APIs. Pure DOM + localStorage read.

---

## §15 Backwards compatibility

| SHIPPED API | Status |
|---|---|
| `<Topbar/>` from `@repo/xai-web-shell` | **Extended** — new optional prop `onOpenSearch?: () => void`. When undefined, renders the existing readOnly input (current behaviour); when provided, renders a button. 46 SHIPPED tests stay green (TP5 split into TP5a/TP5b). |
| `<Shell/>` from `@repo/xai-web-shell` | **Extended** — new optional prop `onOpenSearch?: () => void` passed through to `<Topbar/>`. Backwards-compatible default `undefined`. |
| `TopbarProps` exported type | Extended (additive optional field). Existing consumers compile. |
| `ShellProps` exported type | Extended (additive optional field). Existing consumers compile. |
| Storage registry | **Unchanged.** Zero new entries (HC2). |
| CSP | **Unchanged.** No new entries. |
| EventMap | **Extended** — 2 new entries (`web:search:invoked` + `web:search:jump`). Existing entries unchanged. |

---

## §16 Versioning

`@repo/xai-web-cmdk` ships at `0.0.0` matching sibling shim convention. Any
future breaking change to `SearchHit` shape requires:

1. New `SearchHitV2` type with the new shape.
2. Adapter contract updated to return either V1 or V2 hits.
3. Migration ADR.

No migration is expected in v1.
