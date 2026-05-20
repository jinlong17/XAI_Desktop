import { describe, expect, it } from 'vitest';

import { exploreProtocolStateSpace, nextStates, initialProtocolState } from '../src';

describe('TypeScript protocol model checker fallback', () => {
  it('explores nonce and rekey states without invariant failures or deadlocks', () => {
    const report = exploreProtocolStateSpace(7);

    expect(report.visitedStates).toBeGreaterThan(8);
    expect(report.transitions).toBeGreaterThan(12);
    expect(report.deadlocks).toEqual([]);
    expect(report.invariantFailures).toEqual([]);
  });

  it('eventually reaches rekey swap state', () => {
    const normal = initialProtocolState();
    const staging = nextStates(normal).find((state) => state.phase === 'staging');
    expect(staging).toBeDefined();

    const stagedOne = nextStates(staging!).find((state) => state.stagedBlobs === 1);
    const stagedTwo = nextStates(stagedOne!).find((state) => state.stagedBlobs === 2);
    const swapped = nextStates(stagedTwo!).find((state) => state.phase === 'swapped');

    expect(swapped).toMatchObject({ activeKey: 2, oldKeyWritesAllowed: false });
  });
});
