import { beforeEach, expect, it, vi } from 'vitest';
import { accountScope } from '@repo/plugin-web-storage';
import { beginAccountLocalDeletion, readAccountDeletionReceipt, resumeAccountLocalDeletion } from '@recovery-under-test';
vi.mock('@repo/plugin-web-ai-chat', () => ({ clearAccountAiSecrets: vi.fn(async () => undefined) }));
beforeEach(() => { localStorage.clear(); });
function begin() {
  const scope = accountScope.activate(accountScope.lock('A'), 'business-A');
  return beginAccountLocalDeletion(scope, 'auth-A');
}
it('auth storage failure must reject and leave a recoverable receipt', async () => {
  const receipt = begin();
  await expect(resumeAccountLocalDeletion(receipt, async () => { throw new Error('auth IDB failure'); })).rejects.toThrow('auth IDB failure');
  expect(readAccountDeletionReceipt('A')?.phase).not.toBe('complete');
});
it('reload retry cleans the original auth generation after B becomes current', async () => {
  begin(); accountScope.activate(accountScope.lock('B'), 'business-B');
  const clearAuth = vi.fn(async () => undefined);
  await resumeAccountLocalDeletion(readAccountDeletionReceipt('A')!, clearAuth);
  expect(clearAuth).toHaveBeenCalledWith({ owner: 'A', generation: 'auth-A' });
  expect(accountScope.capture().accountId).toBe('B');
});
it('missing auth cleanup cannot produce a complete receipt', async () => {
  await expect(resumeAccountLocalDeletion(begin())).rejects.toThrow();
  expect(readAccountDeletionReceipt('A')?.phase).not.toBe('complete');
});
