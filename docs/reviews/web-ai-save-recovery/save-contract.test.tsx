import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { AiChatModule } from '../../../packages/plugin-web-ai-chat/src/AiChatModule.js';
import * as stream from '../../../packages/plugin-web-ai-chat/src/internal/claudeStreamAdapter.js';
import { accountScope } from '../../../packages/plugin-web-storage/src/index.js';

afterEach(cleanup);
async function failedSeed() {
  vi.spyOn(stream, 'streamCompleteChat').mockImplementation(async function* (request) {
    yield { accumulated: 'Generated response for ' + request.text, done: true };
  });
  const { container } = render(<AiChatModule lang="en" />);
  const key = accountScope.physicalKey('xai_ai_convos');
  const original = Storage.prototype.setItem;
  const fault = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function(this: Storage, name, value) {
    if (name === key) throw new DOMException('quota', 'QuotaExceededError');
    original.call(this, name, value);
  });
  async function send(value: string) {
    await act(async () => {
      fireEvent.change(container.querySelector('.ai-input')!, { target: { value } });
      fireEvent.keyDown(container.querySelector('.ai-input')!, { key: 'Enter' });
    });
  }
  await send('first request');
  expect(container.querySelectorAll('.ai-msg').length).toBeGreaterThan(0);
  expect(localStorage.getItem(key)).toBeNull();
  return { key, fault, send };
}
it('shows an unsaved result when the initial conversation cannot be persisted', async () => {
  await failedSeed();
  expect(screen.getByRole('alert').textContent).toMatch(/not saved|unsaved/i);
});
it('does not silently keep an empty store after storage recovers and another message is sent', async () => {
  const { key, fault, send } = await failedSeed();
  fault.mockRestore();
  await send('second request');
  const records = JSON.parse(localStorage.getItem(key) ?? '[]');
  expect(records).toHaveLength(1);
  expect(records[0].messages.some((message: { text: string }) => message.text.includes('second request'))).toBe(true);
});
