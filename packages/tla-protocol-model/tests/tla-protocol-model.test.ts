import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { checkInvariants, exploreProtocolStateSpace, nextStates, initialProtocolState } from '../src';

describe('TypeScript protocol model checker fallback', () => {
  it('explores nonce and rekey states without invariant failures or deadlocks', () => {
    const report = exploreProtocolStateSpace(7);

    expect(report.visitedStates).toBeGreaterThan(8);
    expect(report.transitions).toBeGreaterThan(12);
    expect(report.deadlocks).toEqual([]);
    expect(report.invariantFailures).toEqual([]);
    expect(report.status).toBe('completed');
    expect(report.hasInvariantFailures).toBe(false);
    expect(report.newInvariantsCovered).toEqual(
      expect.arrayContaining([
        'staging phase cannot advance nonce after BeginRekey',
        'swapped phase cannot gain staged blobs',
        'normal phase cannot accept commits when old-key writes are disabled',
      ]),
    );
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

  it('checkInvariants flags swapped + oldKeyWritesAllowed=true', () => {
    const failures = checkInvariants({
      ...initialProtocolState(),
      phase: 'swapped',
      activeKey: 2,
      stagedBlobs: 2,
      oldKeyWritesAllowed: true,
    });

    expect(failures).toContain('swapped phase cannot reopen old-key writes');
  });

  it('distinguishes completed BFS runs that find invariant failures', () => {
    const report = exploreProtocolStateSpace(7, { includeProbeTransitions: true });

    expect(report.completed).toBe(true);
    expect(report.status).toBe('completed_with_invariant_failures');
    expect(report.hasInvariantFailures).toBe(true);
    expect(report.invariantFailures.some((failure) => failure.includes('swapped phase'))).toBe(true);
  });

  it('explorer report references docs/spec/sync.tla in JSDoc', () => {
    const source = readFileSync(new URL('../src/index.ts', import.meta.url), 'utf8');

    expect(source).toContain('docs/spec/sync.tla');
    expect(source).toContain('NOT a TLA+ model');
  });
});
