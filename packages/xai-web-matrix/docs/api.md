# API Contract — xai-web-matrix

> Companion to `design.md`. Public surface declared from `packages/xai-web-matrix/src/index.ts` only.
> Cross-package contracts (registry entry + EventMap entry) declared in their canonical files; this doc enumerates the byte-for-byte additions.

---

## 1. Public surface — `@repo/plugin-web-matrix`

```ts
// packages/xai-web-matrix/src/index.ts
export { MatrixModule, default } from "./MatrixModule.js";
export { matrixSlotRegistration } from "./registration.js";
export { MATRIX_STORAGE_KEY } from "./constants.js";

// ---- Types (re-exported for downstream tests + future xai-web-tasks join) ----
export type { MatrixCard, MatrixState, Quadrant, MatrixModuleProps } from "./types.js";
```

`index.ts` is the **only** allowed import path for consumers. Importing from
`@repo/plugin-web-matrix/src/internal/*` is forbidden per CLAUDE.md "Code
Boundaries".

### 1.1 Exported types

```ts
// packages/xai-web-matrix/src/types.ts

import type { Lang } from "@repo/plugin-web-tokens";

/** Four-quadrant priority signal. Same string literal as event-channel payload. */
export type Quadrant = "q1" | "q2" | "q3" | "q4";

/** A card displayed inside a matrix quadrant. */
export interface MatrixCard {
  /** Stable opaque id; consumer must not reuse across cards. */
  readonly id: string;
  /** Bilingual title. Both langs MUST be present. */
  readonly title: { en: string; zh: string };
  /** Optional ISO-like display date for the EN locale (matches prototype `t.date`). */
  readonly date?: string;
  /** Optional ZH-locale display date string (matches prototype `t.dateZh`). */
  readonly dateZh?: string;
  /** Optional tag/label class — matches the prototype's `t.tag` field. */
  readonly tag?: string;
  /** Reserved for a future xai-web-tasks join — undefined in v1. */
  readonly taskId?: string;
}

/** Persisted matrix shape. Single JSON blob in `xai_matrix_state`. */
export interface MatrixState {
  readonly schemaVersion: 1;
  readonly q1: readonly MatrixCard[];
  readonly q2: readonly MatrixCard[];
  readonly q3: readonly MatrixCard[];
  readonly q4: readonly MatrixCard[];
}

/** Props for `<MatrixModule/>`. */
export interface MatrixModuleProps {
  /** Active UI language. Drives `useI18n(lang)` inside the module. */
  lang: Lang;
}
```

### 1.2 Exported components

```ts
// MatrixModule.tsx

/**
 * Eisenhower 2×2 matrix view.
 *
 * - Renders four colored-top-bar quadrants (Q1 red, Q2 amber, Q3 blue, Q4 accent).
 * - Cards drag between quadrants; the move persists to localStorage via usePref.
 * - On every drag-between or keyboard-move, emits `web:matrix:priority-tagged`.
 * - Empty quadrants render the bilingual `common.no_tasks` hint.
 *
 * State is read+written from the shared registry key `xai_matrix_state`.
 */
export function MatrixModule(props: MatrixModuleProps): JSX.Element;
export default MatrixModule;
```

### 1.3 Exported constants

```ts
// constants.ts
/**
 * The WebPrefKey used by MatrixModule. Re-exported so tests can clear
 * localStorage atomically by key without string-literal duplication.
 */
export const MATRIX_STORAGE_KEY: "xai_matrix_state" = "xai_matrix_state";
```

### 1.4 Exported registration

```ts
// registration.tsx
import type { WebModuleSlotRegistration } from "@repo/xai-web-shell";

/** Slot registration for the Web Console rail. */
export const matrixSlotRegistration: WebModuleSlotRegistration;
```

Schema (matches `WebModuleSlotRegistration` interface from
`packages/xai-web-shell/src/types.ts` lines 57–66):

| Field | Value | Source of truth |
|---|---|---|
| `moduleId` | `"matrix"` | Already a literal in `WebModuleId` (`packages/core/src/types/events.ts` line 7). |
| `label` | `"Matrix"` | Mirrors existing placeholder. |
| `defaultChildPath` | `""` | Mirrors existing placeholder. |
| `children` | `[{ path: "", render: MatrixSlotHost }, { path: "*", render: MatrixSlotHost }]` | `MatrixSlotHost` wraps `<MatrixModule lang={useWebShell().lang} />`. |
| `icon` | `"grid4"` | Already in `WebShellIconName` enum. |
| `railOrder` | `6` | Mirrors existing placeholder. |
| `i18nKey` | `"nav.matrix"` | Already in `@repo/plugin-web-tokens` bundle (`I18N.en.nav.matrix = "Matrix"`, `I18N.zh.nav.matrix = "四象限"`). |
| `showInRail` | `true` | Mirrors existing placeholder. |

### 1.5 Internal-only (not exported via index.ts)

| File | Purpose |
|---|---|
| `src/Quadrant.tsx` | One quadrant section + colored top-bar. |
| `src/Group.tsx` | Collapsible group inside a quadrant body. |
| `src/Card.tsx` | Draggable card row. |
| `src/internal/seed.ts` | Typed initial cards (replaces `window.MOCK`). |
| `src/internal/icons.tsx` | 3 inline SVG glyphs (`plus`, `dots`, `chevD`). |
| `src/internal/drag.ts` | `onCardDropped` reducer; HTML5 DnD handlers. |
| `src/internal/usePersistedMatrix.ts` | `usePref<MatrixState>` wrapper with seed hydration. |
| `src/internal/quadrant-color.ts` | `quadrantColorToken(q): "--red" | "--amber" | "--blue" | "--accent"`. |
| `src/internal/move.ts` | Pure reducers used by tests: `moveCardTo(state, cardId, target) → { next, from }`. |
| `src/matrix.css` | Side-effect CSS (tokens-only). |

---

## 2. Cross-package additive contracts

### 2.1 `PREF_REGISTRY` entry (write in P2)

Target file: `packages/plugin-web-storage/src/internal/registry.ts`.

Append (after `xai_countdowns`, line 319):

```ts
// ---- Matrix (§S8 — declared by xai-web-matrix #13) -------------------------
// Opaque storage type; canonical declarations live in @repo/plugin-web-matrix.
export type MatrixStateBlob = unknown;

xai_matrix_state: {
  key: "xai_matrix_state",
  codec: "json",
  default: { schemaVersion: 1, q1: [], q2: [], q3: [], q4: [] } as MatrixStateBlob,
  schemaVersion: 1,
  owner: "xai-web-matrix",
  category: "module",
} satisfies PrefEntry<MatrixStateBlob>,
```

Notes:

- Same `unknown`-alias pattern as `BoardsState = unknown` / `Countdown = unknown`
  (registry.ts lines 85, 91). Consumers cast through this row's typed surface.
- `WebPrefKey` derives `xai_matrix_state` automatically (no other edit required).
- No new exports needed from `@repo/plugin-web-storage`'s `index.ts`.

### 2.2 `EventMap` entry (write in P2)

Target file: `packages/core/src/types/events.ts`.

Step 1 — add a supporting type at the top of the file (after `WebPreferenceChange`,
around line 27):

```ts
/** Eisenhower quadrant id used by web:matrix:* channels. */
export type WebMatrixQuadrant = 'q1' | 'q2' | 'q3' | 'q4';
```

Step 2 — append to the `EventMap` interface (after `web:habits:checkin-recorded`,
line 215):

```ts
// Matrix priority-tagged (owner: xai-web-matrix row #13) — declaration only in W2
'web:matrix:priority-tagged': {
  /** Card id whose quadrant just changed. */
  cardId: string;
  /** Source quadrant; null is reserved (v1 never emits null). */
  from: WebMatrixQuadrant | null;
  /** Destination quadrant. */
  to: WebMatrixQuadrant;
  /** ISO timestamp at the moment of the drag-end / kbd-move commit. */
  taggedAt: string;
};
```

Notes:

- `WebMatrixQuadrant` is re-exported through `@repo/core/types` to stay
  consistent with `WebModuleId` / `WebPreferenceChange` patterns.
- `@repo/xai-web-event-bus`'s `WebEventMap` (which is
  `Extract<keyof EventMap, "web:${string}">`) automatically picks up the new
  channel — no edit needed there.

---

## 3. Host wiring (write in P1)

Target file: `apps/web/src/routes/modules/shellRegistrations.tsx`.

Change to line 49 (and a new top-of-file import):

```ts
// Top of file
import { matrixSlotRegistration } from "@repo/plugin-web-matrix";

// In webShellModuleRegistrations array
matrixSlotRegistration,                                           // replaces placeholder("matrix", "Matrix", "grid4", 6)
```

No other host-level change. The router (`apps/web/src/routes/router.tsx`) reads
`webShellModuleRegistrations` and auto-mounts every registration's `children`
under `/app/<moduleId>/*`. No edits required outside `shellRegistrations.tsx`.

### 3.1 apps/web/package.json — add workspace dep

Append `"@repo/plugin-web-matrix": "workspace:*"` to `dependencies`. Same
single-line additive change pattern shell row #5 used.

---

## 4. Error semantics

`MatrixModule` is a leaf UI component — it does not return `Result<T, E>` style
values. Error surfaces:

| Failure mode | Behavior |
|---|---|
| `localStorage.getItem("xai_matrix_state")` returns `null` | `usePref` returns its registered `default` (`{ schemaVersion: 1, q1: [], q2: [], q3: [], q4: [] }`); module proceeds to seed-hydrate from `internal/seed.ts`. |
| Stored value JSON.parse fails | `usePref` falls back to default (same as above). Logged via the storage layer's existing DEV warning. |
| Stored `schemaVersion !== 1` | v1 treats as a default reset (`internal/usePersistedMatrix.ts` checks `state.schemaVersion === 1` and falls back if not). v2 will register a migration via `migrate.ts`. |
| Drop event without a `cardId` payload (e.g. drag from outside the matrix module) | `onDrop` early-returns; no state change, no event emit. |
| Drag-end with `from === to` | Reducer returns `{ next: state, from: to }`; state setter is **not** called (`Object.is(state, next)` guard); no event emit. |
| Card id not found in current state at drop time | Reducer returns `{ next: state, from: null }`; state setter **not** called; no event emit. |
| `emitWebEvent` throws | Caller swallows + DEV-warns (matches `@repo/xai-web-event-bus` emitter semantics). State change still persists. |

No exceptions are thrown out of `MatrixModule` for any user-driven interaction.

---

## 5. Idempotency

| Operation | Idempotent? | Notes |
|---|---|---|
| Re-rendering with the same `state` | Yes — React reconciliation is the guarantee. |
| Calling `moveCardTo(state, cardId, X)` with `cardId` already in quadrant `X` | Yes — returns `{ next: state, from: "X" }`; the equality check ensures no setState. |
| Reload after a drag | Yes — `usePref` reads the persisted blob, no UI flicker. |
| Cross-tab `storage` event arriving with the same state | Yes — `usePref` compares before applying. |

---

## 6. Permission / capabilities

None — this module does NOT use the host capability layer
(`ConsoleViewCapabilities` from `@repo/core/types`). It is a pure browser-only
component reading + writing localStorage via `@repo/plugin-web-storage`.

The shell's `capabilities` prop (passed into `render`) is **ignored** by
`MatrixSlotHost` — explicit destructuring `({ capabilities: _capabilities })`
documents the intent.

---

## 7. Performance budget

| Metric | Budget | Rationale |
|---|---|---|
| First render | < 10 ms (jsdom) | 4 quadrants × small card lists; no heavy computation. |
| Drag-drop reducer + setState + persist + emit | < 5 ms p99 | One filter + one push + one JSON.stringify of ≤ ~1 KB blob. |
| Re-render on `usePref` setState | < 5 ms (jsdom) | Single state tree; React reconciliation. |
| Bundle size (production gzip, this package only) | < 8 KB | Per the prototype's 88 LOC + small CSS + 3 inline SVGs. |

These are documented; the verify gate does not enforce them programmatically
in v1 (no perf-budget CI). Listed for future-row sanity checks.

---

## 8. Public-surface stability

Per the W1/W2 convention, this package's public surface is "Production" once
`ship` flips dev_log to SHIPPED. Until then, the surface is "In-Dev" and may
change between phases without notice — but the **shape** declared above is the
target.

Backward-compat rules after ship:

- Adding new fields to `MatrixCard` (e.g. `taskId`) is non-breaking provided
  they are optional.
- Adding new quadrants (e.g. a 5th "later" bin) is breaking — would require
  a v2 schema migration AND an EventMap update.
- Changing the persistence key name is breaking — would require a v1→v2
  migration entry in `internal/migrate.ts`.
- Removing any exported name is breaking — would require deprecation row.
