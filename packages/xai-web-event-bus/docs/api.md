# API Contract — xai-web-event-bus

> Interface contracts for the Web-only typed event bus. All event names use `web:<module>:<verb>-<noun>` per ADR-0007 §S7.

## Public Surface

The only allowed entry point is the package root `index.ts`. Importing from `src/internal/` is forbidden by CLAUDE.md §"Code Boundaries".

```ts
// packages/xai-web-event-bus/src/index.ts
export { emitWebEvent } from './emitter';
export { useWebEventListener } from './listener';
export { onWebEvent } from './emitter';            // non-React subscription
export type { WebEventMap, WebEventKey } from './events';
```

`WebEventMap` is a sub-projection of the global `EventMap` in `packages/core/src/types/events.ts`, narrowed to keys with the `web:` prefix. The actual EventMap entries live in `@repo/core`; this package only exports a type alias for ergonomic downstream use.

---

## 1. EventMap additions (host file: `@repo/core/types/events.ts`)

Five entries are appended to the existing `EventMap` interface. The append is the responsibility of feature-build phase P1.

```ts
interface EventMap {
  // ... existing organizer:* / console:* / project:* / labels:* / productivity:* / app:* / account:* entries ...

  // Web shell navigation + deep-links + pet toggle (owner: xai-web-shell row #5)
  'web:shell:module-change': {
    /** Target module id (e.g. "tasks" | "calendar" | "dashboard" | "settings"). */
    moduleId: WebModuleId;
    /** Optional deep-link payload — e.g. MiniCal → Calendar focus date in "YYYY-MM-DD". */
    focusDate?: string;
    /** Optional detail entity id (e.g. board card id, task id) — module-specific opaque string. */
    detailId?: string;
    /** What triggered the change. */
    source: 'app-rail' | 'mini-cal' | 'shortcut' | 'restore' | 'programmatic';
  };
  'web:shell:pet-toggle': {
    /** New on/off state after the toggle. */
    on: boolean;
    /** Where the toggle originated. */
    source: 'rail-bottom' | 'settings' | 'shortcut';
  };

  // Settings live-broadcast (owner: xai-web-settings-appearance row #22)
  'web:settings:preference-changed': {
    /** Discriminated key — see WebPreferenceKey below. */
    key: WebPreferenceKey;
    /** Type narrows on `key` via the discriminated union (see WebPreferenceChange). */
    value: WebPreferenceValue;
    /** ISO timestamp of when the change was committed. */
    changedAt: string;
  };

  // Pomodoro session completion (owner: xai-web-pomodoro row #14) — declaration only in W1
  'web:pomodoro:session-finished': {
    /** Mode that just finished. */
    mode: 'focus' | 'short-break' | 'long-break';
    /** Duration in ms of the just-finished session. */
    durationMs: number;
    /** ISO timestamp at completion. */
    finishedAt: string;
  };

  // Habits check-in (owner: xai-web-habits row #15) — declaration only in W1
  'web:habits:checkin-recorded': {
    /** Habit id whose check-in was just recorded. */
    habitId: string;
    /** UTC day key the check-in applied to (YYYY-MM-DD). */
    date: string;
    /** Post-checkIn streak value. */
    streak: number;
    /** ISO timestamp at check-in. */
    recordedAt: string;
  };
}

// Supporting types (also added to packages/core/src/types/events.ts)
export type WebModuleId =
  | 'tasks' | 'habits' | 'pomodoro' | 'calendar' | 'matrix'
  | 'countdown' | 'settings' | 'board' | 'dashboard' | 'meditation'
  | 'statistics' | 'ai' | 'search';

export type WebPreferenceKey =
  | 'theme' | 'density' | 'fontScale' | 'accentHue'
  | 'railPos' | 'bgTone' | 'lang';

export type WebPreferenceValue =
  | 'light' | 'dark' | 'system'                              // theme
  | 'comfortable' | 'compact'                                // density
  | number                                                   // fontScale | accentHue
  | 'left' | 'right' | 'top' | 'bottom'                      // railPos
  | 'default' | 'sage' | 'cream' | 'mist' | 'lavender' | 'peach' | 'graphite' // bgTone
  | 'en' | 'zh';                                             // lang
```

> **Note for feature-review:** the `value` field above is a loose union. Phase P1 will refine it into a discriminated `WebPreferenceChange` union (one variant per `WebPreferenceKey`) so downstream listeners get key→value type narrowing. The loose form is in this draft so the contract is reviewable end-to-end first.

---

## 2. Runtime exports (host file: `packages/xai-web-event-bus/src/`)

### 2.1 `emitWebEvent`

```ts
/**
 * Type-safe synchronous emitter for Web-only `web:*` events.
 * Returns void; never throws when there are no listeners (no-op safe).
 * Synchronous in v1 — listeners run before emit resolves; differs from
 * desktop `emitEvent` which is async (Tauri IPC). This is intentional:
 * UI live-broadcast (Settings → theme change) must be one render tick.
 */
export function emitWebEvent<K extends WebEventKey>(
  event: K,
  payload: WebEventMap[K],
): void;
```

**Error semantics:**
- Zero listeners → no-op, no warn, no throw.
- Listener throws → the bus catches and logs via `console.warn('[xai-web-event-bus] listener error', err)`; other listeners on the same channel still fire. Mirrors `EventTarget.dispatchEvent` behavior under React error boundaries.
- Server-side rendering (no `EventTarget`) → no-op. The package detects `typeof EventTarget === 'undefined'` and short-circuits, so SSR builds (future) do not break.

**Idempotency:** Calling `emitWebEvent` twice with identical payloads delivers twice. No dedup. Consumers requiring dedup (e.g. Statistics aggregator) must implement it themselves.

### 2.2 `onWebEvent` (non-React subscription)

```ts
/**
 * Imperative subscription. Returns an unsubscribe function.
 * Used by tests, by non-React modules, and as the foundation for useWebEventListener.
 */
export function onWebEvent<K extends WebEventKey>(
  event: K,
  handler: (payload: WebEventMap[K]) => void,
): () => void;
```

**Cleanup contract:** the returned unsubscriber is idempotent (calling twice is a no-op). After unsubscribe, the handler reference is released so it can be garbage-collected.

### 2.3 `useWebEventListener` (React hook)

```ts
/**
 * Type-safe React hook for subscribing to a Web event.
 * Auto-cleans on unmount via useEffect return.
 * The handler is wrapped in a stable ref so consumers do not need to memoize it
 * (re-subscribes only on `event` change, not on every render).
 */
export function useWebEventListener<K extends WebEventKey>(
  event: K,
  handler: (payload: WebEventMap[K]) => void,
): void;
```

**Lifecycle:**
- Subscribes on mount.
- Re-subscribes if `event` key changes (rare).
- **Does not** re-subscribe on every handler reference change (uses internal ref to avoid that footgun — matches React docs "useEffectEvent" pattern, polyfilled with `useRef` + `useLayoutEffect` for React 19 compat).
- Unsubscribes on unmount → no memory leak.

---

## 3. Permission / Idempotency / Ordering Notes

| Concern | Stance |
|---|---|
| **Authorization** | None. Pure in-process. Web app is single-user single-tab. |
| **Ordering** | FIFO per channel — listeners receive events in `dispatchEvent` order (browser-spec guaranteed for `EventTarget`). |
| **Re-entrancy** | A listener can call `emitWebEvent` from inside its own handler. `EventTarget` synchronously fans out; we do not introduce queueing. If a re-entrant emit creates a loop, the offending plugin is at fault (will be caught by feature-verify smoke). |
| **Concurrency** | Single JS event loop. No mutex / atomic concerns. |
| **Cross-tab** | **NOT supported in v1.** ADR-0006 pins Web as single-tab SPA. A future row may introduce a BroadcastChannel adapter; this v1 ships only same-document delivery. |
| **Cross-process to Tauri** | **NOT supported.** `apps/web/` does not embed Tauri. Desktop and Web bus runtimes are siblings sharing the type layer only. |

---

## 4. Upstream Interfaces (what this package depends on)

- `@repo/core/types/events` → reads `EventMap`, extracts the `web:*` keys via:
  ```ts
  type WebEventKey = Extract<keyof EventMap, `web:${string}`>;
  type WebEventMap = { [K in WebEventKey]: EventMap[K] };
  ```
- `react@^19.2.0` (peer) → for `useEffect` + `useRef` + `useLayoutEffect` inside the hook.
- No Tauri imports. ADR-0003 Plugin platform-neutrality is preserved (this package is browser-only by design, but does not negatively constrain the Plugin API surface for Overlay/Console reuse — Overlay/Console would use the existing Tauri-bound `@repo/core/events`).

---

## 5. Downstream Interfaces (what depends on this package)

| Consumer row | Channels used | Phase scope |
|---|---|---|
| `xai-web-shell` (#5) | emits `web:shell:module-change`, `web:shell:pet-toggle` | W1 (W1 ships the emitter call sites in App.tsx + AppRail.tsx) |
| `xai-web-settings-appearance` (#22) | emits `web:settings:preference-changed` | W4 |
| `xai-web-dashboard-widgets` (#11) | MiniCal → emits `web:shell:module-change` with `source:"mini-cal", focusDate, moduleId:"calendar"` | W2 |
| `xai-web-calendar` (#12) | listens `web:shell:module-change` filtered to `moduleId === 'calendar'` to scroll to `focusDate` | W2 |
| `xai-web-pomodoro` (#14) | emits `web:pomodoro:session-finished` | W2 |
| `xai-web-habits` (#15) | emits `web:habits:checkin-recorded` | W2 |
| `xai-web-statistics` (#20) | listens to all aggregated channels above | W3 |

---

## 6. Versioning & Compatibility

- `EventMap` is treated as a public TypeScript surface for all plugin packages. Adding a new `web:*` key is backwards compatible. **Changing the shape** of an existing `web:*` payload is a breaking change and requires either (a) a typed migration ADR or (b) introducing a `web:<module>:<verb>-<noun>-v2` channel alongside.
- This v1 plan only **adds** entries to `EventMap`; it does not modify desktop entries.
- `WebPreferenceValue` will become a discriminated union in P1 implementation; the loose-union form shown here is the contract under review.

---

## 7. Smoke Acceptance (gates feature-verify)

The acceptance signal from the seed brief is reified as:

1. Two distinct module placeholders (`<Emitter>` + `<Listener>` test fixtures) wired through the bus deliver typed payloads correctly.
2. An unmounted `useWebEventListener` consumer must release its handler — assertion: after `unmount`, an emit with one watch counter shows zero increments.
3. `emitWebEvent('web:shell:module-change', …)` with zero listeners must not throw — assertion: `expect(() => emitWebEvent(...)).not.toThrow()`.
4. TS `tsc --noEmit` rejects `emitWebEvent('web:shell:module-change', { moduleId: 123 })` (wrong type) — captured as a `@ts-expect-error` test.
