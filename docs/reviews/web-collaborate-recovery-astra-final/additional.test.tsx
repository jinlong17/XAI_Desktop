import { it, expect, vi } from 'vitest';
import { fireEvent } from '@testing-library/react';
import { fixture, device, key, nativeGet, nativeSet, mount, choose, flush } from '../web-collaborate-recovery-independent/fixture';

fixture();

for (const source of ['invalid', 'unavailable']) {
  it(`does not show aggregate Saved while the avatars source remains ${source} after a sibling save`, async () => {
    if (source === 'invalid') nativeSet.call(localStorage, device[0], 'invalid-boolean');
    else vi.spyOn(Storage.prototype, 'getItem').mockImplementation(function (this: Storage, k: string) {
      if (k === device[0]) throw new DOMException('denied', 'SecurityError');
      return nativeGet.call(this, k);
    });
    const ui = mount();
    await flush();
    choose(ui, 0, 'edit');
    await flush();
    expect(nativeGet.call(localStorage, key)).toBe('edit');
    expect(ui.q.getByRole('alert').textContent).toContain('Saved value needs recovery');
    expect(ui.q.getByRole('button', { name: /reload.*avatars/i })).toBeTruthy();
    expect(ui.q.queryByRole('button', { name: /export/i })).toBeNull();
    const event = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    // contract: aggregate status must not say Saved while a field remains failed.
    expect(ui.q.queryByRole('status')?.textContent ?? '').not.toMatch(/^Saved$/i);
  });
}

it('keeps Saved feedback for fully healthy successful fields', async () => {
  const ui = mount(); await flush();
  choose(ui, 0, 'view');
  fireEvent.click(ui.q.getAllByRole('switch')[0]);
  fireEvent.click(ui.q.getAllByRole('switch')[1]);
  await flush();
  expect([key, ...device].map(k => nativeGet.call(localStorage, k))).toEqual(['view', 'false', 'false']);
  expect(ui.q.getByRole('status').textContent).toBe('Saved');
  expect(ui.q.queryByRole('alert')).toBeNull();
});

it('can show Saved again after read-only source repair without rewriting successful siblings', async () => {
  nativeSet.call(localStorage, device[0], 'invalid-boolean');
  const ui = mount(); await flush();
  choose(ui, 0, 'edit'); await flush();
  nativeSet.call(localStorage, device[0], 'false');
  const writes = vi.spyOn(Storage.prototype, 'setItem');
  fireEvent.click(ui.q.getByRole('button', { name: /reload.*avatars/i })); await flush();
  expect(writes).not.toHaveBeenCalled();
  expect(ui.q.getAllByRole('switch')[0].getAttribute('aria-checked')).toBe('false');
  expect(nativeGet.call(localStorage, key)).toBe('edit');
  expect(ui.q.queryByRole('alert')).toBeNull();
  expect(ui.q.getByRole('status').textContent).toBe('Saved');
});

it('clears failed export feedback on a new valid edit while preserving current draft and exact retry value', async () => {
  const ui = mount(); await flush();
  const fail = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, k: string, value: string) {
    if (k === device[0]) throw new DOMException('quota', 'QuotaExceededError');
    nativeSet.call(this, k, value);
  });
  fireEvent.click(ui.q.getAllByRole('switch')[0]); await flush();
  vi.stubGlobal('URL', class extends URL { static createObjectURL() { throw Error('setup failed'); } static revokeObjectURL() {} });
  fireEvent.click(ui.q.getByRole('button', { name: /export/i }));
  expect(ui.container.textContent).toMatch(/could not export/i);
  fireEvent.click(ui.q.getAllByRole('switch')[0]); await flush();
  expect(ui.container.textContent).not.toMatch(/could not export/i);
  expect(ui.q.getAllByRole('switch')[0].getAttribute('aria-checked')).toBe('true');
  expect(nativeGet.call(localStorage, device[0])).toBeNull();
  fail.mockRestore();
  fireEvent.click(ui.q.getByRole('button', { name: /retry.*avatars/i })); await flush();
  expect(nativeGet.call(localStorage, device[0])).toBe('true');
  expect(ui.q.queryByRole('button', { name: /export/i })).toBeNull();
});
