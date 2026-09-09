import { accountScope, type AccountScope } from '@repo/plugin-web-storage';
import { emitWebEvent, onWebEvent, type WebEventMap } from '@repo/xai-web-event-bus';
import type { WriteEventSpec } from './toolRegistry.js';

export function requestToolWrite(spec: WriteEventSpec, requestId: string, scope: AccountScope): Promise<{ ok: boolean; reason?: string }> {
  if (!accountScope.isReady(scope)) return Promise.resolve({ ok: false, reason: 'account-changed' });
  const attemptId = crypto.randomUUID();
  return new Promise(resolve => {
    let done = false;
    let unsubscribeScope = () => {};
    const finish = (result: { ok: boolean; reason?: string }) => {
      if (done) return;
      done = true; clearTimeout(timer); unsubscribe(); unsubscribeScope(); resolve(result);
    };
    const unsubscribe = onWebEvent('web:ai:tool-write-receipt', receipt => {
      if (receipt.requestId !== requestId || receipt.requestChannel !== spec.channel || receipt.attemptId !== attemptId) return;
      const owner = receipt.owner;
      if (owner.accountId !== scope.accountId || owner.kind !== scope.kind || owner.generation !== scope.generation || owner.epoch !== scope.epoch) return;
      finish(accountScope.isReady(scope) ? receipt : { ok: false, reason: 'account-changed' });
    });
    const timer = setTimeout(() => finish({ ok: false, reason: 'no-confirmation' }), 1500);
    unsubscribeScope = accountScope.subscribe(() => finish({ ok: false, reason: 'account-changed' }));
    // Owner is added last and cannot be dropped by registry payload decoding.
    emitWebEvent(spec.channel, { ...spec.payload, requestId, owner: scope, attemptId } as WebEventMap[typeof spec.channel]);
  });
}
