import { emitWebEvent } from './emitter';
import type { WebEventMap } from './events';

type Receipt = WebEventMap['web:ai:tool-write-receipt'];
export type ToolWriteChannel = Receipt['requestChannel'];
type Owner = Receipt['owner'];
export type ToolWriteResult = Pick<Receipt, 'ok' | 'reason' | 'targetId'>;
// A page-lifetime cache survives subscriber remount/StrictMode reconstruction.
// It is not a durable receipt journal. Scope objects isolate account generations.
const committed = new WeakMap<object, Map<string, { signature: string; result: ToolWriteResult }>>();
const sameOwner = (a: Owner, b: Owner) => a.kind === b.kind && a.accountId === b.accountId && a.generation === b.generation && a.epoch === b.epoch;

export function executeToolWrite<K extends ToolWriteChannel>(
  channel: K,
  payload: WebEventMap[K],
  current: Owner,
  perform: () => ToolWriteResult,
): void {
  const reply = (result: ToolWriteResult) => emitWebEvent('web:ai:tool-write-receipt', {
    requestId: payload.requestId, requestChannel: channel, attemptId: payload.attemptId,
    owner: payload.owner ?? current, ...result,
  });
  if (current.kind === 'locked' || !current.accountId || !current.generation || (payload.owner && !sameOwner(payload.owner, current))) {
    reply({ ok: false, reason: 'account-changed' }); return;
  }
  if (typeof payload.requestId !== 'string' || !payload.requestId.trim()) { reply({ ok: false, reason: 'invalid' }); return; }
  const { owner: _owner, attemptId: _attempt, requestedAt: _time, ...operation } = payload;
  void _owner; void _attempt; void _time;
  const signature = JSON.stringify(operation);
  let cache = committed.get(current);
  if (!cache) { cache = new Map(); committed.set(current, cache); }
  const key = channel + ':' + payload.requestId;
  const existing = cache.get(key);
  if (existing) { reply(existing.signature === signature ? existing.result : { ok: false, reason: 'request-conflict' }); return; }
  // Do not evict committed identities and accidentally execute them twice.
  if (cache.size >= 1000) { reply({ ok: false, reason: 'capacity' }); return; }
  let result: ToolWriteResult;
  try { result = perform(); } catch { result = { ok: false, reason: 'storage' }; }
  if (result.ok) cache.set(key, { signature, result });
  reply(result);
}
