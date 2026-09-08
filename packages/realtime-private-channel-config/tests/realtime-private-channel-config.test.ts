import { describe, expect, it, vi } from 'vitest';

import { MockRealtimeBus, createPrivateChannelConfig } from '../src';

describe('realtime private channel config', () => {
  it('scopes events to account private channels', () => {
    const bus = new MockRealtimeBus();
    const accountA = createPrivateChannelConfig('acct-a');
    const accountB = createPrivateChannelConfig('acct-b');
    const handlerA = vi.fn();
    const handlerB = vi.fn();
    bus.subscribe(accountA, handlerA);
    bus.subscribe(accountB, handlerB);

    bus.publish(accountA, { accountId: 'acct-a', payload: { seq: 1 } });

    expect(handlerA).toHaveBeenCalledWith({ seq: 1 });
    expect(handlerB).not.toHaveBeenCalled();
    expect(() => bus.publish(accountA, { accountId: 'acct-b', payload: {} })).toThrow(/account mismatch/);
  });
});
