// @vitest-environment jsdom
/**
 * Cross-package smoke test for @repo/xai-web-event-bus.
 *
 * Validates the seed-brief acceptance signal:
 *   "Two distinct module placeholders subscribe + emit through the bus."
 *
 * Scenarios A1, A2, A3 from test.md §5 "Acceptance smoke".
 * Run via: pnpm --filter @repo/web test
 */
import React from 'react';
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

// Import from the package root (index.ts public surface only)
import { emitWebEvent, onWebEvent } from '@repo/xai-web-event-bus';
import { EmitterFixture, ListenerFixture } from '@repo/xai-web-event-bus/src/__fixtures__';

afterEach(() => {
  cleanup();
});

describe('event-bus cross-package smoke', () => {
  it('A1: ModuleA emits web:shell:module-change; ModuleB listener observes typed payload', async () => {
    const received = vi.fn();

    render(
      <>
        <EmitterFixture />
        <ListenerFixture onReceive={received} />
      </>,
    );

    const emitBtn = screen.getByTestId('emitter');
    act(() => { emitBtn.click(); });

    expect(received).toHaveBeenCalledOnce();
    expect(received).toHaveBeenCalledWith(
      expect.objectContaining({ moduleId: 'calendar', source: 'programmatic' }),
    );

    const listener = screen.getByTestId('listener');
    expect(listener.getAttribute('data-module-id')).toBe('calendar');
  });

  it('A2: ModuleA unmounts mid-test; ModuleB still listens; third source emits → B observes', () => {
    const h = vi.fn();

    const { unmount: unmountA } = render(<EmitterFixture />);
    render(<ListenerFixture onReceive={h} />);

    // Unmount A
    unmountA();

    // A third programmatic emitter fires
    act(() => {
      emitWebEvent('web:shell:module-change', { moduleId: 'dashboard', source: 'shortcut' });
    });

    expect(h).toHaveBeenCalledOnce();
    expect(h).toHaveBeenCalledWith(
      expect.objectContaining({ moduleId: 'dashboard', source: 'shortcut' }),
    );
  });

  it('A3: ModuleB unmounts; ModuleA re-emits → no observer increments; no throw (no-op safe)', () => {
    const h = vi.fn();

    render(<EmitterFixture />);
    const { unmount: unmountB } = render(<ListenerFixture onReceive={h} />);

    // Unmount listener
    unmountB();

    // Emit after listener is gone — must not throw
    expect(() => {
      act(() => {
        emitWebEvent('web:shell:module-change', { moduleId: 'tasks', source: 'programmatic' });
      });
    }).not.toThrow();

    expect(h).not.toHaveBeenCalled();
  });

  it('A4 (bonus): onWebEvent imperative unsubscribe works from consumer context', () => {
    const handler = vi.fn();
    const off = onWebEvent('web:shell:module-change', handler);

    act(() => {
      emitWebEvent('web:shell:module-change', { moduleId: 'board', source: 'restore' });
    });
    expect(handler).toHaveBeenCalledOnce();

    off();

    act(() => {
      emitWebEvent('web:shell:module-change', { moduleId: 'ai', source: 'programmatic' });
    });
    expect(handler).toHaveBeenCalledOnce(); // still 1, not 2
  });
});
