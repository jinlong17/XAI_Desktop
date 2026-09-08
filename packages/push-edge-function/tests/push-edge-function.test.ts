import { describe, expect, it } from 'vitest';

import { InMemoryPushEdgeFunction } from '../src';

describe('push edge function mock', () => {
  it('deduplicates mutations and rejects revision gaps', () => {
    const edge = new InMemoryPushEdgeFunction();

    expect(edge.push({ accountId: 'acct', mutationId: 'mut-1', entityType: 'todos', entityId: 'a', proposedRevision: 1 })).toMatchObject({ status: 'ok' });
    expect(edge.push({ accountId: 'acct', mutationId: 'mut-1', entityType: 'todos', entityId: 'a', proposedRevision: 1 })).toMatchObject({ status: 'duplicate' });
    expect(edge.push({ accountId: 'acct', mutationId: 'mut-2', entityType: 'todos', entityId: 'a', proposedRevision: 3 })).toMatchObject({ status: 'revision_mismatch', currentRevision: 1 });
  });
});
