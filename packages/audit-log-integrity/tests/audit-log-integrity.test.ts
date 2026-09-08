import { describe, expect, it, vi } from 'vitest';

import { AuditLogHashChain, createSentryBreadcrumb, withAuditErrorBoundary } from '../src';

describe('audit log integrity', () => {
  it('links entries by hash chain and detects tampering', () => {
    const chain = new AuditLogHashChain();
    chain.append({ accountId: 'acct', eventType: 'push', timestampMs: 1 });
    chain.append({ accountId: 'acct', eventType: 'rekey_complete', timestampMs: 2, metadata: { keyId: 2 } });

    expect(() => chain.verify()).not.toThrow();
    const tampered = chain.list();
    tampered[1] = { ...tampered[1]!, eventType: 'pull' };
    expect(() => chain.verify(tampered)).toThrow(/E3025/);
  });

  it('emits privacy-safe telemetry and breadcrumbs without payload content', () => {
    const chain = new AuditLogHashChain();
    const entry = chain.append({
      accountId: 'acct',
      eventType: 'conflict',
      timestampMs: 3,
      metadata: { entityId: 'todo-secret' },
    });

    expect(chain.telemetry()).toEqual([{ eventType: 'conflict', timestampMs: 3 }]);
    expect(createSentryBreadcrumb(entry)).toEqual({ eventType: 'conflict', timestampMs: 3 });

    const onError = vi.fn();
    expect(withAuditErrorBoundary(() => { throw new Error('boom'); }, onError)).toBeNull();
    expect(onError.mock.calls[0]![0]).toMatchObject({ eventType: 'conflict' });
  });
});
