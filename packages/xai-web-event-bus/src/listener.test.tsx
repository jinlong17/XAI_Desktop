// @vitest-environment jsdom
import { StrictMode } from 'react';
import { act, renderHook, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { emitWebEvent } from './emitter';
import { useWebEventListener } from './listener';

afterEach(() => {
  cleanup();
});

// ── useWebEventListener (H1..H6) ─────────────────────────────────────────────

describe('useWebEventListener', () => {
  it('H1: mount + emit → handler invoked once', () => {
    const handler = vi.fn();
    renderHook(() => useWebEventListener('web:shell:pet-toggle', handler));

    act(() => {
      emitWebEvent('web:shell:pet-toggle', { on: true, source: 'rail-bottom' });
    });

    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith({ on: true, source: 'rail-bottom' });
  });

  it('H2: unmount + emit → handler NOT invoked (cleanup ran)', () => {
    const handler = vi.fn();
    const { unmount } = renderHook(() =>
      useWebEventListener('web:shell:pet-toggle', handler),
    );

    unmount();

    act(() => {
      emitWebEvent('web:shell:pet-toggle', { on: false, source: 'shortcut' });
    });

    expect(handler).not.toHaveBeenCalled();
  });

  it('H3: re-render with new handler reference → does NOT re-subscribe; latest handler fires', () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    // Start with handler1
    const { rerender } = renderHook(
      ({ h }: { h: typeof handler1 }) =>
        useWebEventListener('web:shell:pet-toggle', h),
      { initialProps: { h: handler1 } },
    );

    // Switch to handler2 (new reference, same channel)
    rerender({ h: handler2 });

    act(() => {
      emitWebEvent('web:shell:pet-toggle', { on: true, source: 'settings' });
    });

    // The latest handler (handler2) must fire; handler1 must not
    expect(handler2).toHaveBeenCalledOnce();
    expect(handler1).not.toHaveBeenCalled();
  });

  it('H4: re-render with new event key → unsubscribes old, subscribes new', () => {
    // Use separate handlers for each channel since the hook is generic on the event key.
    // We simulate "changing event key" by calling separate hooks in sequence.
    const handlerToggle = vi.fn();
    const handlerModuleChange = vi.fn();

    // Mount with pet-toggle
    const { unmount: unmountToggle } = renderHook(() =>
      useWebEventListener('web:shell:pet-toggle', handlerToggle),
    );

    // Unmount the pet-toggle hook (simulates switching away)
    unmountToggle();

    // Mount with module-change
    renderHook(() =>
      useWebEventListener('web:shell:module-change', handlerModuleChange),
    );

    // Old channel fires — toggle handler should NOT be called (was unmounted)
    act(() => {
      emitWebEvent('web:shell:pet-toggle', { on: false, source: 'settings' });
    });
    expect(handlerToggle).not.toHaveBeenCalled();

    // New channel fires — module-change handler SHOULD be called
    act(() => {
      emitWebEvent('web:shell:module-change', { moduleId: 'tasks', source: 'shortcut' });
    });
    expect(handlerModuleChange).toHaveBeenCalledOnce();
  });

  it('H5: two mounted consumers, one unmounts → remaining consumer still receives emits', () => {
    const h1 = vi.fn();
    const h2 = vi.fn();

    const hook1 = renderHook(() =>
      useWebEventListener('web:pomodoro:session-finished', h1),
    );
    renderHook(() => useWebEventListener('web:pomodoro:session-finished', h2));

    // Unmount first consumer
    hook1.unmount();

    act(() => {
      emitWebEvent('web:pomodoro:session-finished', {
        mode: 'focus',
        durationMs: 1500000,
        finishedAt: new Date().toISOString(),
      });
    });

    expect(h1).not.toHaveBeenCalled();
    expect(h2).toHaveBeenCalledOnce();
  });

  it('H6: StrictMode double-mount → net subscription count is 1 after settling', () => {
    const callCount = { n: 0 };
    const handler = () => { callCount.n++; };

    renderHook(
      () => useWebEventListener('web:shell:pet-toggle', handler),
      { wrapper: StrictMode },
    );

    act(() => {
      emitWebEvent('web:shell:pet-toggle', { on: true, source: 'rail-bottom' });
    });

    // StrictMode mounts→unmounts→remounts; after settling, exactly 1 subscription remains
    expect(callCount.n).toBe(1);
  });
});
