import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { AiChatModule } from '../../../packages/plugin-web-ai-chat/src/AiChatModule.js';
import * as stream from '../../../packages/plugin-web-ai-chat/src/internal/claudeStreamAdapter.js';
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
it('does not tell the model that a tool succeeded when no business subscriber replies', async () => {
  const calls: unknown[] = [];
  vi.spyOn(stream, 'streamCompleteChat').mockImplementation(async function* (request) {
    calls.push(request);
    if (!request.priorMessages) yield { accumulated: 'Proposed task', done: true, toolUse: { id: 'no-subscriber-proof', name: 'create_task', input: { title: 'Cannot persist without owner subscriber', bucket: 'nodate' } } };
    else yield { accumulated: 'Acknowledgement', done: true };
  });
  const { container } = render(<AiChatModule lang="en"/>);
  await act(async () => {
    fireEvent.change(container.querySelector('.ai-input')!, { target: { value: 'Create task' } });
    fireEvent.keyDown(container.querySelector('.ai-input')!, { key: 'Enter' });
  });
  await act(async () => { fireEvent.click(container.querySelector('.ai-confirmation-confirm')!); await new Promise(resolve => setTimeout(resolve, 1700)); });
  expect(calls).toHaveLength(1);
  expect(screen.getByRole('alert').textContent).toMatch(/not saved|not confirmed|failed/i);
  expect(container.querySelector('.ai-confirmation-card')).not.toBeNull();
});
