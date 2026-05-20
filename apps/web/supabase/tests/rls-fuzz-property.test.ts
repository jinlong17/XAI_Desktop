import { describe, expect, it } from 'vitest';

import { runRlsIsolationFuzz } from '../../../../packages/rls-fuzz-property/src';

describe('sync-v1 RLS fuzz property mock', () => {
  it('never exposes cross-account rows or other-device wraps in generated cases', () => {
    expect(runRlsIsolationFuzz(2000)).toEqual([]);
  });
});
