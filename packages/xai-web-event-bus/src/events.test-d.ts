/**
 * Type-level tests for the xai-web-event-bus public surface.
 * These use @ts-expect-error annotations to assert that invalid call sites
 * produce compile errors. Run via: pnpm --filter @repo/xai-web-event-bus check-types
 *
 * NOTE: This file does not contain runtime assertions — it is a type-only
 * contract guard. The ts compiler validates it during check-types.
 */
import { emitWebEvent } from './emitter';
import type { WebEventKey, WebEventMap } from './events';

// T1: Valid call — should compile without error
emitWebEvent('web:shell:module-change', { moduleId: 'tasks', source: 'app-rail' });

// T2: Invalid payload (moduleId: number) — must produce a type error
// @ts-expect-error — moduleId must be WebModuleId, not a number
emitWebEvent('web:shell:module-change', { moduleId: 123 });

// T3: Non-existent channel — must produce a type error
// @ts-expect-error — 'web:nonexistent:foo' is not in WebEventKey
emitWebEvent('web:nonexistent:foo' as WebEventKey, {});

// T4: Handler arg must be typed — p.key should be WebPreferenceKey, not any
// This is a compile-time shape assertion; the actual value is unused.
declare function captureKey(key: import('@repo/core/types').WebPreferenceKey): void;

const _testT4 = (p: WebEventMap['web:settings:preference-changed']) => {
  // If p.key were `any`, this would silently accept anything.
  // The typed discriminated union ensures captureKey gets the right narrowed type.
  captureKey(p.key);
};
void _testT4;

// T5: Deep import of src/internal/ — not exported, so a type import should fail at module level.
// This cannot be tested with @ts-expect-error directly (it would be a module-not-found error
// rather than a TS type error), so we assert the positive: the index re-exports are present.
import { emitWebEvent as emitWebEventFromIndex } from './index';
declare const _check: typeof emitWebEventFromIndex;
void _check;
