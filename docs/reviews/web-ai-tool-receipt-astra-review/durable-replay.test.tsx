import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { accountScope } from '../../../packages/plugin-web-storage/src/index.js';
import { emitWebEvent, onWebEvent, type ToolWriteChannel, type WebEventMap } from '../../../packages/xai-web-event-bus/src/index.js';
import { useTaskCreateRequestSubscriber } from '../../../packages/xai-web-tasks/src/internal/aiCreateSubscriber.js';
import { useTaskMutateRequestSubscriber } from '../../../packages/xai-web-tasks/src/internal/aiMutateSubscriber.js';
import { useCalendarCreateRequestSubscriber } from '../../../packages/xai-web-calendar/src/internal/aiCreateSubscriber.js';
import { useCalendarMutateRequestSubscriber } from '../../../packages/xai-web-calendar/src/internal/aiMutateSubscriber.js';

function Subscribers() {
  useTaskCreateRequestSubscriber(); useTaskMutateRequestSubscriber();
  useCalendarCreateRequestSubscriber(); useCalendarMutateRequestSubscriber();
  return null;
}
afterEach(cleanup);

// Correct desired assertions intentionally FAIL at daff8ef. This is an account
// lifecycle integration, NOT a simulated claim of native browser reload coverage.
it.each(['tasks:create', 'tasks:update', 'tasks:delete', 'calendar:create', 'calendar:update', 'calendar:delete'])(
  '%s replays the committed receipt across a new epoch in the SAME durable generation without rewriting data', name => {
    const task = name.startsWith('tasks');
    const scope = accountScope.capture();
    const key = accountScope.physicalKey(task ? 'xai_task_cols' : 'xai_calendar_events');
    const initial = task
      ? [{ id: 'nodate', tasks: [{ id: 'existing', title: { en: 'Initial', zh: 'Initial' } }] }]
      : { existing: { id: 'existing', title: 'Initial', startISO: '2026-09-09T09:00', endISO: '2026-09-09T10:00', colorPreset: 'mint', recurrence: null, createdAt: '2026-09-09T00:00:00Z', updatedAt: '2026-09-09T00:00:00Z' } };
    localStorage.setItem(key, JSON.stringify(initial));
    const channel = `web:${name}-requested` as ToolWriteChannel;
    const payload = {
      requestId: `durable-${name}`, attemptId: 'first', owner: scope, requestedAt: '2026-09-09T00:00:00Z',
      ...(name.endsWith('create')
        ? task ? { title: 'Created once', bucket: 'nodate' } : { title: 'Created once', date: '2026-09-09', startTime: '11:00', durationMin: 30 }
        : { id: 'existing', ...(name.endsWith('update') ? { patch: { title: 'Tool committed' } } : {}) }),
    };
    let receipt: WebEventMap['web:ai:tool-write-receipt'] | undefined;
    const off = onWebEvent('web:ai:tool-write-receipt', r => { receipt = r; });
    const first = render(<Subscribers/>);
    emitWebEvent(channel, payload as never);
    expect(receipt?.ok).toBe(true);
    const targetId = receipt?.targetId;
    first.unmount();

    // Model acknowledgement could have been lost. An independent later edit is
    // legitimate and must not be overwritten by replaying an already-committed update.
    if (name.endsWith('update')) {
      const state = JSON.parse(localStorage.getItem(key)!);
      if (task) state[0].tasks[0].title = { en: 'Later human edit', zh: 'Later human edit' };
      else state.existing.title = 'Later human edit';
      localStorage.setItem(key, JSON.stringify(state));
    }
    const beforeReplay = localStorage.getItem(key);
    const next = accountScope.activate(accountScope.lock(scope.accountId), scope.generation!, scope.kind === 'demo');
    expect(next.epoch).not.toBe(scope.epoch);
    expect(accountScope.physicalKey(task ? 'xai_task_cols' : 'xai_calendar_events')).toBe(key);
    render(<Subscribers/>);
    receipt = undefined;
    try {
      emitWebEvent(channel, { ...payload, owner: next, attemptId: 'recovery' } as never);
      expect(receipt?.ok, 'committed replay must return success even after original target was deleted').toBe(true);
      expect(receipt?.targetId, 'replay must return the original committed target').toBe(targetId);
      expect(localStorage.getItem(key), 'replay must not create again or overwrite a later human edit').toBe(beforeReplay);
    } finally { off(); }
  },
);
