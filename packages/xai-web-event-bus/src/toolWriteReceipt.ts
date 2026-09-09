import { emitWebEvent } from './emitter';
import type { WebEventMap } from './events';

type Receipt = WebEventMap['web:ai:tool-write-receipt'];
export type ToolWriteChannel = Receipt['requestChannel'];
type Owner = Receipt['owner'];
export type ToolWriteResult = Pick<Receipt, 'ok' | 'reason' | 'targetId'>;
export type DurableToolWriteResult =
  | Readonly<{ ok: true; targetId: string; replay?: boolean }>
  | Readonly<{ ok: false; reason: string }>;
const sameOwner = (a: Owner, b: Owner) => a.kind === b.kind && a.accountId === b.accountId && a.generation === b.generation && a.epoch === b.epoch;

const PUBLIC_FAILURES = new Set<NonNullable<ToolWriteResult['reason']>>([
  'invalid', 'not-found', 'storage', 'account-changed', 'request-conflict', 'capacity',
]);

function publicResult(result: DurableToolWriteResult): ToolWriteResult {
  if (result.ok) {
    return typeof result.targetId === 'string' && result.targetId.length > 0
      ? { ok: true, targetId: result.targetId }
      : { ok: false, reason: 'storage' };
  }
  return PUBLIC_FAILURES.has(result.reason as NonNullable<ToolWriteResult['reason']>)
    ? { ok: false, reason: result.reason as NonNullable<ToolWriteResult['reason']> }
    : { ok: false, reason: 'storage' };
}

/** Await the durable business outcome before publishing its correlated receipt. */
export async function executeToolWrite<K extends ToolWriteChannel>(
  channel: K,
  payload: WebEventMap[K],
  current: Owner,
  perform: () => Promise<DurableToolWriteResult>,
): Promise<ToolWriteResult> {
  const reply = (result: ToolWriteResult) => emitWebEvent('web:ai:tool-write-receipt', {
    requestId: payload.requestId, requestChannel: channel, attemptId: payload.attemptId,
    owner: payload.owner ?? current, ...result,
  });
  if (current.kind === 'locked' || !current.accountId || !current.generation || (payload.owner && !sameOwner(payload.owner, current))) {
    const result = { ok: false, reason: 'account-changed' } as const;
    reply(result); return result;
  }
  if (typeof payload.requestId !== 'string' || !payload.requestId.trim()) {
    const result = { ok: false, reason: 'invalid' } as const;
    reply(result); return result;
  }
  let result: ToolWriteResult;
  try {
    result = publicResult(await perform());
  } catch {
    result = { ok: false, reason: 'storage' };
  }
  reply(result);
  return result;
}
