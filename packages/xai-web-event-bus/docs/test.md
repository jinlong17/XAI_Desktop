# Test Strategy — xai-web-event-bus

> Test plan for the typed Web event bus. The acceptance signal from the seed brief is the verify gate: two-module subscribe/emit + payload typing + unmount cleanup.

## Test Layers

| Layer | Tool | Where | Run command |
|---|---|---|---|
| Type-level | `tsc --noEmit` + `@ts-expect-error` blocks | `src/**/*.test-d.ts` | `pnpm --filter @repo/xai-web-event-bus check-types` |
| Unit (runtime) | Vitest + jsdom | `src/**/*.test.ts(x)` | `pnpm --filter @repo/xai-web-event-bus test` |
| React hook | Vitest + jsdom + @testing-library/react | `src/listener.test.tsx` | (same as unit) |
| Cross-package smoke | Vitest in `apps/web/` consumer | `apps/web/src/__tests__/event-bus.smoke.test.tsx` | `pnpm --filter @repo/web test` |
| Manual verify (cross-vendor=yes) | `pnpm --filter @repo/web dev` | apps/web in browser | human verifies live |

## Mock / Fixture Strategy

- **No Tauri mocks needed.** Unlike desktop `@repo/core/events` tests (which mock `@tauri-apps/api/event`), the Web bus uses native `EventTarget` available in jsdom natively. This is a deliberate simplification over the W0.B `plugin-project` test approach.
- **Test EventMap projection:** unit tests import `WebEventMap` from `src/events.ts` to drive type assertions. They do NOT import from `@repo/core` directly inside the bus's own unit tests — the test should still pass even if `@repo/core/types/events` is not built yet (it only consumes the type alias).
- **Fake module placeholders:** two minimal React components (`<EmitterFixture>` + `<ListenerFixture>`) are inlined inside the consumer smoke test at `apps/web/src/__tests__/event-bus.smoke.test.tsx`. They are intentionally consumer-owned scaffolding — NOT exposed by this package — because `index.ts` is the only allowed public surface (api.md §"Public Surface"). Earlier versions exported a `./src/__fixtures__` subpath; this was removed in the 2026-05-24 contract-conformance fix.

## Unit Coverage Matrix (Vitest)

### 1. `emitWebEvent` — runtime emitter

| # | Scenario | Assertion |
|---|---|---|
| E1 | Emit with one listener registered | listener called once with exact payload (deep-equal) |
| E2 | Emit with zero listeners | does not throw; returns `undefined` |
| E3 | Emit with three listeners | all three called in registration order |
| E4 | Listener throws | other listeners still called; warn captured via `vi.spyOn(console, 'warn')` |
| E5 | Re-entrant emit (listener emits inside handler) | inner handler delivered synchronously after outer handler completes |
| E6 | Emit to unrelated channel | listener on different channel NOT called |

### 2. `onWebEvent` — imperative subscription

| # | Scenario | Assertion |
|---|---|---|
| S1 | Subscribe + emit | handler invoked with payload |
| S2 | Unsubscribe + emit | handler NOT invoked |
| S3 | Unsubscribe called twice | no throw; second call is no-op |
| S4 | Multiple distinct handlers on same channel | each receives the payload exactly once |
| S5 | Same handler registered twice | called twice (EventTarget native behavior — documented, not deduped) |

### 3. `useWebEventListener` — React hook

| # | Scenario | Assertion |
|---|---|---|
| H1 | Mount + emit | handler invoked once |
| H2 | Unmount + emit | handler NOT invoked (cleanup ran) — guards against the seed brief's "no memory leaks on unmount" requirement |
| H3 | Re-render with new handler reference (same channel) | does NOT re-subscribe (uses ref); latest handler invoked |
| H4 | Re-render with new `event` key | unsubscribes old key, subscribes new key |
| H5 | Two mounted consumers, one unmounts | remaining consumer still receives emits |
| H6 | StrictMode double-mount (React 19) | net subscriptions count is 1 after settled |

### 4. Type-level (`*.test-d.ts` with `tsd` or `@ts-expect-error`)

| # | Scenario | Assertion |
|---|---|---|
| T1 | `emitWebEvent('web:shell:module-change', { moduleId: 'tasks', source: 'app-rail' })` | compiles |
| T2 | `emitWebEvent('web:shell:module-change', { moduleId: 123 })` | `@ts-expect-error` triggers |
| T3 | `emitWebEvent('web:nonexistent:foo', {})` | `@ts-expect-error` triggers (unknown channel) |
| T4 | `useWebEventListener('web:settings:preference-changed', (p) => p.key)` | `p.key` is typed `WebPreferenceKey`, not `any` |
| T5 | Importing `EmitterInternal` from `@repo/xai-web-event-bus/src/internal/*` | `@ts-expect-error` (not in package exports) |

### 5. Acceptance smoke (cross-package — lives in `apps/web/`)

This satisfies the seed brief's "two distinct module placeholders subscribe + emit through the bus" requirement.

| # | Scenario | Assertion |
|---|---|---|
| A1 | `<ModuleA>` emits `web:shell:module-change`, `<ModuleB>` listens | B observes the payload typed |
| A2 | `<ModuleA>` unmounts mid-test, `<ModuleB>` still listens, third source emits | B still observes |
| A3 | `<ModuleB>` unmounts, `<ModuleA>` re-emits | no observer increments; no warn (no-op safe) |

---

## Lint / Static Checks

- `@typescript-eslint/no-explicit-any` — enforced strict in `packages/xai-web-event-bus/eslint.config.js` so payload definitions cannot regress to `any`.
- `no-restricted-imports` — enforced in `packages/xai-web-event-bus/eslint.config.js` to forbid deep imports such as `@repo/xai-web-event-bus/src/internal/*`, `@repo/xai-web-event-bus/src/__fixtures__*`, or any other subpath. Public surface is `index.ts` only.
- `package.json` `exports` field — structural enforcement. Only `.` is exported; any other subpath fails module resolution under Node's exports protocol (which Vite/Vitest/TS5 all honor).
- `tsc --noEmit` is the contract-of-record for type checks (T1–T5 in §4 cover the type-level boundary).

## Coverage Target

- Statements / branches: >= 90% within `packages/xai-web-event-bus/src/`. The bus surface is tiny (three exports + EventTarget plumbing); high coverage is cheap.

## Manual Verify (Cross-vendor: yes — per row #4 manifest)

After feature-build phase P3 completes:

1. `pnpm install` at repo root (workspace link picks up new package).
2. `pnpm --filter @repo/web dev` → open http://localhost:3000.
3. Open browser devtools console. Run:
   ```js
   const { onWebEvent, emitWebEvent } = await import('/node_modules/@repo/xai-web-event-bus/src/index.ts');
   const off = onWebEvent('web:shell:module-change', console.log);
   emitWebEvent('web:shell:module-change', { moduleId: 'calendar', source: 'programmatic' });
   // expect: {moduleId: 'calendar', source: 'programmatic'} logged
   off();
   emitWebEvent('web:shell:module-change', { moduleId: 'tasks', source: 'programmatic' });
   // expect: nothing logged (no throw)
   ```
4. Cross-vendor signal: confirm the same JS snippet runs identically under (a) Chrome stable, (b) Safari 17+, (c) Firefox latest. `EventTarget` is universally supported, but the verify gate is explicit per manifest.

## Out-of-Scope (defer)

- Performance benchmarks (no perf bar for v1 — UI broadcast is sub-ms).
- Cross-tab BroadcastChannel adapter tests.
- Fuzzing the EventMap for accidental `any` leaks (covered by `no-explicit-any` lint).

## Test Status Tracking

The dev_log.md `Work Log` will append a row each time tests are run with PASS/FAIL summary. Phase P3 must record vitest output and `tsc --noEmit` output.
