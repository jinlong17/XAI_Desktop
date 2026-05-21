import { describe, expect, it } from 'vitest';

import { runRlsIsolationFuzz } from '../src';

describe('RLS fuzz property model', () => {
  it('never exposes cross-account rows or other-device wraps', () => {
    expect(runRlsIsolationFuzz(1000)).toEqual([]);
  });
});
