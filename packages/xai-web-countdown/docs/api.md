# API Contract — xai-web-countdown

> The single public surface of `@repo/plugin-web-countdown`. Consumers
> (`apps/web/src/routes/modules/shellRegistrations.tsx` + `apps/web/src/App.tsx`
> transitively) MUST go through `index.ts`. `src/internal/*` is package-private
> per CLAUDE.md §Code Boundaries.

---

## §0 Public Surface (`src/index.ts`)

```ts
// Side-effect CSS — applied once globally when this package is first imported.
import "./styles.css";

// ---- Components ------------------------------------------------------------
export { CountdownModule } from "./CountdownModule";

// ---- Slot registration (consumed by apps/web shellRegistrations.tsx) -------
export { countdownWebModuleRegistration } from "./registration";

// ---- Public types ----------------------------------------------------------
export type {
  CountdownCard,
  CountdownVariant,
  ImagePresetId,
  ImagePreset,
} from "./types";

// ---- Constants -------------------------------------------------------------
export { IMAGE_PRESETS } from "./internal/presets";
```

Nothing else is exported. Deep imports from `src/internal/*` produce a type
error in consumers (enforced by `package.json` `"exports"` field).

---

## §1 Type Surface

### §1.1 `CountdownVariant`

```ts
export type CountdownVariant = "image" | "light";
```

- `"image"` — card uses a colored / gradient background (the prototype's
  `tone:"light"` looking rendering; cover_url must be non-null).
- `"light"` — card uses the default light panel background (`var(--bg-panel)`)
  with accent-colored numerals (the prototype's `tone:"dark"` style; cover_url
  must be `null`).

### §1.2 `CountdownCard`

```ts
export interface CountdownCard {
  /** Stable id. Generated via `cd_<base36(rand)>` on creation. */
  id: string;
  /** Bilingual title — both keys required. Empty string allowed but not whitespace. */
  title: { en: string; zh: string };
  /**
   * ISO 8601 calendar date `"YYYY-MM-DD"` (NOT a full ISO timestamp).
   * Interpreted as local midnight in the user's TZ at render time.
   * Validation: `/^\d{4}-\d{2}-\d{2}$/` AND `new Date(y, m-1, d)` round-trip.
   */
  target_date: string;
  /** See §1.1. */
  variant: CountdownVariant;
  /**
   * Cover spec.
   *   - When variant="light": MUST be null.
   *   - When variant="image": MUST be either:
   *       * "preset:<id>" where <id> matches an IMAGE_PRESETS entry, OR
   *       * (future) a real URL — out of scope for v1 but the parser tolerates it.
   */
  cover_url: string | null;
}
```

### §1.3 `ImagePresetId`, `ImagePreset`, `IMAGE_PRESETS`

```ts
export type ImagePresetId =
  | "dusk" | "midnight" | "sand" | "forest" | "peach" | "lavender";

export interface ImagePreset {
  readonly id: ImagePresetId;
  /** CSS gradient string usable directly as `background-image`. */
  readonly gradient: string;
  readonly label_en: string;
  readonly label_zh: string;
}

export const IMAGE_PRESETS: readonly ImagePreset[];
```

The array is frozen at module load. Order is the display order in the
modal's preset grid.

---

## §2 Components

### §2.1 `CountdownModule`

```ts
import type { Lang } from "@repo/plugin-web-tokens";

export interface CountdownModuleProps {
  /** Active language. Drives useI18n bundle. */
  lang: Lang;
}

export function CountdownModule(props: CountdownModuleProps): JSX.Element;
```

Behavior:

- Renders the module header (title + chevron + `+` + `…` icon buttons; the
  `…` button is a no-op stub for v1 per prototype).
- Renders the card grid: one `<CountdownCardView>` per persisted card +
  one `<AddCountdownCard>` at the end.
- Header `+` button opens the create modal (same as clicking the
  AddCountdownCard slot).
- Clicking an existing card opens the edit modal pre-filled.
- Consumes:
  - `useI18n(lang)` from `@repo/plugin-web-tokens` (read-only, pure).
  - `usePref("xai_countdowns")` from `@repo/plugin-web-storage` (state +
    setter; persistence is automatic).
  - Internal `useDaysUntil(target_date)` for live recompute.
- Emits no `web:*` events in v1.

### §2.2 Internal components (NOT exported)

- `CountdownCardView` — visual card.
- `AddCountdownCard` — placeholder card / "Add" button.
- `CountdownEditDialog` — `<dialog>`-backed modal with form.
- `PresetPicker` — 3-column gradient swatch grid.

These live under `src/internal/` and are deliberately not in the public surface.

---

## §3 Slot Registration

### §3.1 `countdownWebModuleRegistration`

```ts
import type { WebModuleSlotRegistration } from "@repo/xai-web-shell";

export const countdownWebModuleRegistration: WebModuleSlotRegistration;
```

Shape:

```ts
{
  moduleId: "countdown",
  label: "Countdown",
  defaultChildPath: "",
  children: [
    { path: "",   render: () => <CountdownModule lang={…} /> },
    { path: "*",  render: () => <CountdownModule lang={…} /> },
  ],
  icon: "countdown",         // already in WebShellIconName
  railOrder: 10,             // matches existing placeholder
  i18nKey: "nav.countdown",  // exists in @repo/plugin-web-tokens bundle
  showInRail: true,
}
```

**How `lang` flows in:** the host already passes `lang` through the
`<WebShellProvider lang={lang}>` and the `Shell` component reads it from
`useWebShell()` to forward into the module pane via `<Outlet context={...}>`.
The `render` function reads it via `useOutletContext<{ lang: Lang }>()`.
This matches the pattern used by future module rows.

If the existing seam does not yet pass `lang` via outlet context, the
build phase adds a thin `<CountdownModuleRoute>` wrapper inside
`packages/plugin-web-countdown/src/registration.tsx` that consumes
`useOutletContext` and unwraps it. The wrapper is package-private; the
exported registration constant is the same shape regardless.

### §3.2 Consumer change (host responsibility — out of this package)

`apps/web/src/routes/modules/shellRegistrations.tsx` line currently reading:

```ts
placeholder("countdown",  "Countdown",  "countdown", 10),
```

is replaced (in P3) with:

```ts
countdownWebModuleRegistration,
```

(import added at top of file). No other line in `shellRegistrations.tsx`
changes — sibling W2 rows are free to swap their own placeholder line
independently.

---

## §4 i18n Keys

### §4.1 Keys read from `@repo/plugin-web-tokens` (already in bundle)

| Key | EN | ZH |
|---|---|---|
| `countdown.title` | "Countdown" | "倒计时" |
| `countdown.days_until` | "Days until" | "距离" |
| `countdown.days_since` | "Days since" | "已过" |
| `common.cancel` | "Cancel" | "取消" |
| `common.save` | "Save" | "保存" |
| `common.add` | "Add" | "添加" |

### §4.2 Inline literals (NOT bundled — matches prototype style)

These follow the prototype's `<AddCountdownCard>` precedent of hard-coding the
add-card label via `lang === "zh" ? "..." : "..."`. The discovery review §R5
documents why we don't extend the bundle from this row.

| Use site | EN | ZH |
|---|---|---|
| AddCountdownCard label | "Add Countdown" | "新建倒计时" |
| Modal title (create) | "New Countdown" | "新建倒计时" |
| Modal title (edit) | "Edit Countdown" | "编辑倒计时" |
| Form label "Title (EN)" | "Title (English)" | "标题（英文）" |
| Form label "Title (ZH)" | "Title (Chinese)" | "标题（中文）" |
| Form label "Target date" | "Target date" | "目标日期" |
| Form label "Variant" | "Style" | "样式" |
| Variant option "image" | "Image" | "图片" |
| Variant option "light" | "Light" | "浅色" |
| Form label "Cover" | "Cover" | "封面" |
| Button "Delete" | "Delete" | "删除" |
| Validation error | "Title cannot be empty" | "标题不能为空" |
| Validation error | "Invalid date format" | "日期格式无效" |

Future row may migrate these into the bundle; v1 keeps them local to avoid
touching `@repo/plugin-web-tokens` from this row's write scope.

---

## §5 Persistence Contract

### §5.1 Storage shape

Key `xai_countdowns` (registry entry already declared in
`@repo/plugin-web-storage/src/internal/registry.ts` lines 311–319, `proposed: true`).

```ts
// localStorage["xai_countdowns"] (JSON-encoded):
//   CountdownCard[]
```

The registry declares the value as `unknown[]`. Our boundary cast:

```ts
const [rawCards, setRawCards] = usePref("xai_countdowns");
const cards: CountdownCard[] = useMemo(() => {
  if (!Array.isArray(rawCards)) return [];
  return rawCards.filter(isCountdownCard);
}, [rawCards]);
```

The `isCountdownCard(x: unknown): x is CountdownCard` predicate lives in
`src/internal/validate.ts`. Invalid entries log a DEV `console.warn` and are
silently dropped.

### §5.2 Mutation API (internal — exposed only to this package's components)

```ts
// All return new arrays — never mutate in place. usePref's setter performs
// stable JSON-equality check before writing to localStorage.

function addCard(prev: CountdownCard[], draft: Omit<CountdownCard, "id">): CountdownCard[];
function updateCard(prev: CountdownCard[], id: string, patch: Partial<CountdownCard>): CountdownCard[];
function deleteCard(prev: CountdownCard[], id: string): CountdownCard[];
```

These live in `src/internal/cardsReducer.ts` and are pure functions (no
storage IO inside them).

### §5.3 ID generation

```ts
function newCardId(): string {
  return "cd_" + Math.floor(Math.random() * 36 ** 8).toString(36).padStart(8, "0");
}
```

No uniqueness guarantee beyond `Math.random()`; on collision, `addCard`
re-rolls. Collision probability is negligible at human-scale card counts.

### §5.4 No migration in v1

Schema version stays `1` per registry entry. No `registerMigration` call.

---

## §6 Live-Days Hook

### §6.1 `useDaysUntil(target_date: string): number`

Internal hook (not in public surface). Returns:

- A non-negative integer if `target_date` is today or in the future.
- A negative integer if `target_date` is in the past (UI flips to "days
  since" with `Math.abs(days)`).

### §6.2 Recompute triggers

1. **On mount** — synchronous initial computation.
2. **At next local midnight** — single shared `setTimeout` per module
   instance (NOT per card) computed from `msUntilLocalMidnight()`. On fire:
   recompute "today" anchor, reschedule next 24h.
3. **On `visibilitychange` (visible)** — recompute anchor immediately.
4. **On unmount** — `clearTimeout` + `removeEventListener` cleanup.

### §6.3 Computation (deterministic, testable)

```ts
function computeDaysUntil(target_date: string, now: Date): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(target_date);
  if (!m) return NaN;
  const [, y, mo, d] = m;
  const targetLocalMidnight = new Date(+y, +mo - 1, +d).setHours(0, 0, 0, 0);
  const todayLocalMidnight  = new Date(now).setHours(0, 0, 0, 0);
  return Math.floor((targetLocalMidnight - todayLocalMidnight) / 86_400_000);
}
```

Pure function in `src/internal/computeDaysUntil.ts`. Test cases enumerated
in `docs/test.md` §3 (DST forward/backward, leap day, year boundary, today,
yesterday, +N, -N).

---

## §7 Error Semantics

| Error condition | Behavior |
|---|---|
| `usePref` returns non-array (corrupted localStorage) | Coerce to `[]`, DEV warn, no UI crash |
| `usePref` returns array with invalid entries | Filter via `isCountdownCard`, DEV warn per dropped entry, no UI crash |
| `target_date` doesn't match `/^\d{4}-\d{2}-\d{2}$/` | `useDaysUntil` returns `NaN`; card shows `—` instead of a number |
| `cover_url = "preset:<unknown>"` | Fallback to `IMAGE_PRESETS[0].gradient` ("dusk") + DEV warn |
| Modal form: empty Title EN AND empty Title ZH | Inline validation error; Save button disabled |
| Modal form: invalid date input | Native `<input type="date">` enforces format; if string still invalid, Save button disabled |
| Storage quota exceeded on `setPref` | `usePref` setter throws; we catch in our setter wrapper and DEV warn — the form modal stays open so user can retry |
| StrictMode double-mount in dev | Timer cleanup handles double-mount; no double-emit |

---

## §8 Concurrency / Idempotency

- No async network calls. All operations are synchronous DOM/storage actions.
- `setPref` writes are batched by React's state update cycle; no
  optimistic-then-revert flow.
- StorageEvent (cross-tab sync) is handled by `usePref` already (per
  `@repo/plugin-web-storage` SHIPPED contract); no extra logic needed here.

---

## §9 Cross-module Communication

NONE in v1. No `emitWebEvent` calls. No `useWebEventListener` subscriptions.
No EventMap entries added to `@repo/core`.

If a future row wants to surface countdowns elsewhere (e.g. Dashboard widget),
that row owns the event channel declaration and the listener; this package
remains side-effect-free w.r.t. the bus.

---

## §10 Versioning

- Package version: `0.0.0` initially. Bumped to `0.1.0` on first ship.
- Public surface stability: §0 lines are SemVer-tracked. Internal
  reorganization (moving files inside `src/internal/`) is patch-level.
- Storage schema version: `1` (per registry entry); a future bump is a
  separate row.

---

## §11 Manifest / package.json contract

```json
{
  "name": "@repo/plugin-web-countdown",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "sideEffects": ["./src/styles.css", "./src/index.ts"],
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "default": "./src/index.ts"
    }
  },
  "scripts": {
    "lint": "eslint .",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "dependencies": {
    "@repo/core": "workspace:*",
    "@repo/plugin-web-tokens": "workspace:*",
    "@repo/plugin-web-storage": "workspace:*",
    "@repo/xai-web-shell": "workspace:*"
  },
  "devDependencies": {
    "@repo/eslint-config": "workspace:*",
    "@repo/typescript-config": "workspace:*",
    "@testing-library/react": "^16.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "jsdom": "^26.0.0",
    "vitest": "^3.2.1"
  }
}
```

`manifest.json`:

```json
{
  "name": "plugin-web-countdown",
  "status": "In-Dev",
  "type": "ui",
  "owner": "xai-web-countdown row #17"
}
```
