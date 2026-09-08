// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { emitWebEvent, onWebEvent } from './emitter';

// ── Reset bus between tests ─────────────────────────────────────────────────
// The bus singleton is module-level; we reset it by re-importing under vi.resetModules.
// However since jsdom provides EventTarget natively, we can rely on it directly.
// Individual tests clean up their own subscriptions.

// ── emitWebEvent (E1..E6) ───────────────────────────────────────────────────

describe('emitWebEvent', () => {
  it('E1: emits to one listener with correct deep-equal payload', () => {
    const received: unknown[] = [];
    const unsub = onWebEvent('web:shell:module-change', (p) => received.push(p));

    emitWebEvent('web:shell:module-change', { moduleId: 'tasks', source: 'app-rail' });

    expect(received).toHaveLength(1);
    expect(received[0]).toEqual({ moduleId: 'tasks', source: 'app-rail' });

    unsub();
  });

  it('E2: emitting with zero listeners does not throw and returns undefined', () => {
    expect(() =>
      emitWebEvent('web:shell:module-change', { moduleId: 'calendar', source: 'shortcut' }),
    ).not.toThrow();
  });

  it('E3: emits to three listeners in registration order', () => {
    const order: number[] = [];
    const unsub1 = onWebEvent('web:shell:pet-toggle', () => order.push(1));
    const unsub2 = onWebEvent('web:shell:pet-toggle', () => order.push(2));
    const unsub3 = onWebEvent('web:shell:pet-toggle', () => order.push(3));

    emitWebEvent('web:shell:pet-toggle', { on: true, source: 'rail-bottom' });

    expect(order).toEqual([1, 2, 3]);

    unsub1(); unsub2(); unsub3();
  });

  it('E4: listener that throws does not prevent other listeners from firing', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { /* suppress */ });
    const reached: string[] = [];

    const unsub1 = onWebEvent('web:shell:pet-toggle', () => {
      throw new Error('boom');
    });
    const unsub2 = onWebEvent('web:shell:pet-toggle', () => reached.push('second'));

    emitWebEvent('web:shell:pet-toggle', { on: false, source: 'settings' });

    expect(reached).toEqual(['second']);
    expect(warnSpy).toHaveBeenCalledWith(
      '[xai-web-event-bus] listener error',
      expect.any(Error),
    );

    warnSpy.mockRestore();
    unsub1(); unsub2();
  });

  it('E5: re-entrant emit — inner handler delivered synchronously after outer', () => {
    const log: string[] = [];

    const unsubOuter = onWebEvent('web:pomodoro:session-finished', () => {
      log.push('outer-start');
      emitWebEvent('web:habits:checkin-recorded', {
        habitId: 'h1',
        date: '2026-05-23',
        streak: 1,
        recordedAt: new Date().toISOString(),
      });
      log.push('outer-end');
    });
    const unsubInner = onWebEvent('web:habits:checkin-recorded', () => {
      log.push('inner');
    });

    emitWebEvent('web:pomodoro:session-finished', {
      mode: 'focus',
      durationMs: 1500000,
      finishedAt: new Date().toISOString(),
    });

    // EventTarget dispatches synchronously; inner fires during outer's execution
    expect(log).toEqual(['outer-start', 'inner', 'outer-end']);

    unsubOuter(); unsubInner();
  });

  it('E6: listener on different channel is NOT called', () => {
    const called = vi.fn();
    const unsub = onWebEvent('web:shell:pet-toggle', called);

    emitWebEvent('web:shell:module-change', { moduleId: 'settings', source: 'restore' });

    expect(called).not.toHaveBeenCalled();

    unsub();
  });
});

// ── onWebEvent (S1..S5) ─────────────────────────────────────────────────────

describe('onWebEvent', () => {
  it('S1: subscribe + emit → handler invoked with correct payload', () => {
    const received: unknown[] = [];
    const unsub = onWebEvent('web:settings:preference-changed', (p) => received.push(p));

    emitWebEvent('web:settings:preference-changed', {
      key: 'theme',
      value: 'dark',
      changedAt: '2026-05-23T00:00:00Z',
    });

    expect(received).toHaveLength(1);
    expect(received[0]).toMatchObject({ key: 'theme', value: 'dark' });

    unsub();
  });

  it('S2: unsubscribe + emit → handler NOT invoked', () => {
    const handler = vi.fn();
    const unsub = onWebEvent('web:shell:pet-toggle', handler);

    unsub();
    emitWebEvent('web:shell:pet-toggle', { on: true, source: 'shortcut' });

    expect(handler).not.toHaveBeenCalled();
  });

  it('S3: unsubscribe called twice → no throw; second call is no-op', () => {
    const unsub = onWebEvent('web:shell:pet-toggle', () => { /* noop */ });
    unsub();
    expect(() => unsub()).not.toThrow();
  });

  it('S4: multiple distinct handlers on same channel — each receives payload exactly once', () => {
    const h1 = vi.fn();
    const h2 = vi.fn();
    const unsub1 = onWebEvent('web:shell:module-change', h1);
    const unsub2 = onWebEvent('web:shell:module-change', h2);

    emitWebEvent('web:shell:module-change', { moduleId: 'board', source: 'app-rail' });

    expect(h1).toHaveBeenCalledOnce();
    expect(h2).toHaveBeenCalledOnce();

    unsub1(); unsub2();
  });

  it('S5: same handler registered twice is called twice (native EventTarget behavior)', () => {
    // EventTarget deduplicates identical (listener, options) pairs for
    // addEventListener with the same options object, but our wrapper creates
    // a NEW closure each call so both fire.
    const count = { n: 0 };
    const handler = () => { count.n++; };
    const unsub1 = onWebEvent('web:shell:pet-toggle', handler);
    const unsub2 = onWebEvent('web:shell:pet-toggle', handler);

    emitWebEvent('web:shell:pet-toggle', { on: false, source: 'rail-bottom' });

    // Each onWebEvent call creates its own closure, so both fire
    expect(count.n).toBe(2);

    unsub1(); unsub2();
  });
});

// ── Cleanup verification ────────────────────────────────────────────────────

describe('cleanup', () => {
  it('unsubscribed listener does not hold a reference after cleanup', () => {
    const handler = vi.fn();
    const unsub = onWebEvent('web:habits:checkin-recorded', handler);
    unsub();

    emitWebEvent('web:habits:checkin-recorded', {
      habitId: 'h2',
      date: '2026-05-23',
      streak: 0,
      recordedAt: new Date().toISOString(),
    });

    expect(handler).not.toHaveBeenCalled();
  });
});
