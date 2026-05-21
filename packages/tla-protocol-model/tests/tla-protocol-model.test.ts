import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import {
  checkInvariants,
  exploreProtocolStateSpace,
  nextStates,
  initialProtocolState,
} from '../src';

describe('TypeScript protocol model checker fallback', () => {
  it('explores nonce and rekey states without invariant failures or deadlocks', () => {
    const report = exploreProtocolStateSpace(7);

    expect(report.status).toBe('completed');
    expect(report.visitedStates).toBeGreaterThan(8);
    expect(report.transitions).toBeGreaterThan(12);
    expect(report.deadlocks).toEqual([]);
    expect(report.invariantFailures).toEqual([]);
    expect(report.newInvariantsCovered).toHaveLength(4);
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

    expect(failures).toContain('swapped phase must reject old key writes');
  });

  it('explorer report can distinguish probe-only invariant violations', () => {
    const report = exploreProtocolStateSpace(7, { includeProbeTransitions: true });

    expect(report.status).toBe('completed-with-violations');
    expect(report.invariantFailures.some((failure) => failure.includes('swapped phase must reject old key writes'))).toBe(true);
  });

  it('explorer report references docs/spec/sync.tla in JSDoc', () => {
    const source = readFileSync(new URL('../src/index.ts', import.meta.url), 'utf8');

    expect(source).toContain('docs/spec/sync.tla');
  });
});
