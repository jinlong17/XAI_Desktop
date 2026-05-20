/**
 * Protocol state explorer (NOT a TLA+ model).
 * This is a TypeScript exhaustive state-space exploration that mirrors
 * the high-level invariants of docs/spec/sync.tla, but does not run
 * TLC and is not a substitute for formal model checking.
 * See docs/spec/sync.tla for the authoritative specification.
 * Tracking: full TLA+ wiring (Java + tla-tools) is a follow-up in G9+1.
 */
export type RekeyPhase = 'normal' | 'staging' | 'swapped';

const NEW_INVARIANTS = [
  'nonce cannot advance beyond the lease window outside staging',
  'swapped phase must preserve exactly two staged blobs',
  'swapped phase must reject old key writes',
  'normal phase cannot stay quarantined unless a device is revoked',
] as const;

type NormalizedProtocolState = Omit<ProtocolState, 'conflictShadow' | 'deviceRevoked'> & {
  conflictShadow: boolean;
  deviceRevoked: boolean;
};

/**
 * High-level state that mirrors selected sync.tla variables and actions:
 * - `nonce` mirrors `commitSeq`.
 * - `leaseEnd` approximates the acceptance window implied by `seenCommit`
 *   and stale `ReplayPending` base checks.
 * - `phase` mirrors `rekeying` plus the post-`FinishRekey` swapped state.
 * - `oldKeyWritesAllowed` shadows whether pre-rekey writes are still accepted
 *   across `BeginRekey` / `FinishRekey`.
 * - `stagedBlobs` is a TypeScript-only progress counter between
 *   `BeginRekey` and `FinishRekey`.
 * - `activeKey` approximates the currently usable `keyEpoch`.
 * - `conflictShadow` mirrors whether sync.tla `conflictShadow` is non-empty.
 * - `deviceRevoked` mirrors whether the modeled device is in `revoked`
 *   before `FullRecovery`.
 */
export interface ProtocolState {
  /** Mirrors sync.tla `commitSeq`. */
  nonce: number;
  /** Mirrors the replay acceptance window implied by `seenCommit`. */
  leaseEnd: number;
  /** Mirrors sync.tla `rekeying` plus the post-`FinishRekey` completion state. */
  phase: RekeyPhase;
  /** Mirrors whether pre-rekey writes are accepted across `BeginRekey` / `FinishRekey`. */
  oldKeyWritesAllowed: boolean;
  /** TypeScript-only counter approximating staged key material before `FinishRekey`. */
  stagedBlobs: number;
  /** High-level shadow of the active sync.tla `keyEpoch`. */
  activeKey: number;
  /** Mirrors whether sync.tla `conflictShadow` is non-empty. Defaults to `false`. */
  conflictShadow?: boolean;
  /** Mirrors whether the modeled device is currently in sync.tla `revoked`. Defaults to `false`. */
  deviceRevoked?: boolean;
}

export interface ExploreOptions {
  includeProbeTransitions?: boolean;
}

export interface StateCoverageReport {
  status: 'completed' | 'completed-with-violations';
  visitedStates: number;
  transitions: number;
  deadlocks: ProtocolState[];
  invariantFailures: string[];
  newInvariantsCovered: string[];
  sampleStates: ProtocolState[];
}

export const explorerVersion = 'ts-bfs-v1';

export function initialProtocolState(): ProtocolState {
  return {
    nonce: 0,
    leaseEnd: 1,
    phase: 'normal',
    oldKeyWritesAllowed: true,
    stagedBlobs: 0,
    activeKey: 1,
    conflictShadow: false,
    deviceRevoked: false,
  };
}

export function exploreProtocolStateSpace(
  maxDepth = 7,
  options: ExploreOptions = {},
): StateCoverageReport {
  const initial = initialProtocolState();
  const seen = new Set<string>();
  const queue: Array<{ state: ProtocolState; depth: number }> = [{ state: initial, depth: 0 }];
  const deadlocks: ProtocolState[] = [];
  const invariantFailures: string[] = [];
  let transitions = 0;

  while (queue.length > 0) {
    const { state, depth } = queue.shift()!;
    const stateKey = keyOf(state);
    if (seen.has(stateKey)) {
      continue;
    }
    seen.add(stateKey);

    const failures = checkInvariants(state);
    invariantFailures.push(...failures.map((failure) => `${failure} @ ${stateKey}`));

    const next = depth >= maxDepth ? [] : nextStates(state, options);
    transitions += next.length;
    if (next.length === 0 && normalizeState(state).phase !== 'swapped' && depth < maxDepth) {
      deadlocks.push(normalizeState(state));
    }
    for (const candidate of next) {
      queue.push({ state: candidate, depth: depth + 1 });
    }
  }

  return {
    status: invariantFailures.length > 0 ? 'completed-with-violations' : 'completed',
    visitedStates: seen.size,
    transitions,
    deadlocks,
    invariantFailures,
    newInvariantsCovered: [...NEW_INVARIANTS],
    sampleStates: [...seen].slice(0, 8).map(parseKey),
  };
}

export const main = exploreProtocolStateSpace;

export function nextStates(state: ProtocolState, options: ExploreOptions = {}): ProtocolState[] {
  const current = normalizeState(state);
  const next: ProtocolState[] = [];
  const includeProbeTransitions = options.includeProbeTransitions ?? false;

  if (
    current.phase !== 'staging' &&
    current.oldKeyWritesAllowed &&
    !current.deviceRevoked &&
    current.nonce <= current.leaseEnd
  ) {
    next.push({ ...current, nonce: current.nonce + 1 });
  }
  if (current.nonce > current.leaseEnd && current.phase === 'normal' && !current.deviceRevoked) {
    next.push({ ...current, leaseEnd: current.leaseEnd + 2 });
  }
  if (current.phase === 'normal' && !current.deviceRevoked) {
    next.push({
      ...current,
      phase: 'staging',
      oldKeyWritesAllowed: false,
      stagedBlobs: 0,
      conflictShadow: false,
      activeKey: 1,
    });
  }
  if (current.phase === 'normal' && !current.deviceRevoked) {
    next.push({ ...current, deviceRevoked: true, oldKeyWritesAllowed: false });
  }
  if (current.deviceRevoked) {
    next.push({
      ...current,
      deviceRevoked: false,
      oldKeyWritesAllowed: true,
      conflictShadow: false,
      leaseEnd: Math.max(current.leaseEnd, current.nonce),
    });
  }
  if (current.phase === 'staging' && current.stagedBlobs < 2) {
    next.push({ ...current, stagedBlobs: current.stagedBlobs + 1 });
  }
  if (current.phase === 'staging' && current.stagedBlobs === 2) {
    next.push({
      ...current,
      phase: 'swapped',
      activeKey: 2,
      oldKeyWritesAllowed: false,
      conflictShadow: false,
    });
    next.push({
      ...current,
      phase: 'staging',
      stagedBlobs: 1,
      oldKeyWritesAllowed: false,
    });
  }
  if (current.phase === 'swapped' && !current.conflictShadow) {
    next.push({ ...current, conflictShadow: true });
  }
  if (includeProbeTransitions && current.phase === 'swapped' && !current.oldKeyWritesAllowed) {
    next.push({ ...current, oldKeyWritesAllowed: true, conflictShadow: true });
  }

  return next;
}

export function checkInvariants(state: ProtocolState): string[] {
  const current = normalizeState(state);
  const failures: string[] = [];

  if (current.nonce < 0 || current.leaseEnd < 0) {
    failures.push('nonce values must be non-negative');
  }
  if (current.phase === 'staging' && current.oldKeyWritesAllowed) {
    failures.push('old key writes must be quarantined during rekey staging');
  }
  if (current.phase === 'swapped' && current.activeKey !== 2) {
    failures.push('new key must be active after swap');
  }
  if (current.phase === 'normal' && current.stagedBlobs !== 0) {
    failures.push('normal phase cannot contain staged blobs');
  }
  if (current.phase !== 'staging' && current.leaseEnd < current.nonce - 1) {
    failures.push('nonce cannot advance beyond the lease window outside staging');
  }
  if (current.phase === 'swapped' && current.stagedBlobs !== 2) {
    failures.push('swapped phase must preserve exactly two staged blobs');
  }
  if (current.phase === 'swapped' && current.oldKeyWritesAllowed) {
    failures.push('swapped phase must reject old key writes');
  }
  if (current.phase === 'normal' && !current.oldKeyWritesAllowed && !current.deviceRevoked) {
    failures.push('normal phase cannot stay quarantined unless a device is revoked');
  }

  return failures;
}

function normalizeState(state: ProtocolState): NormalizedProtocolState {
  return {
    ...state,
    conflictShadow: state.conflictShadow ?? false,
    deviceRevoked: state.deviceRevoked ?? false,
  };
}

function keyOf(state: ProtocolState): string {
  const current = normalizeState(state);
  return [
    current.nonce,
    current.leaseEnd,
    current.phase,
    current.oldKeyWritesAllowed ? 1 : 0,
    current.stagedBlobs,
    current.activeKey,
    current.conflictShadow ? 1 : 0,
    current.deviceRevoked ? 1 : 0,
  ].join('|');
}

function parseKey(key: string): ProtocolState {
  const [nonce, leaseEnd, phase, allowed, stagedBlobs, activeKey, conflictShadow, deviceRevoked] =
    key.split('|');
  if (
    nonce === undefined ||
    leaseEnd === undefined ||
    phase === undefined ||
    allowed === undefined ||
    stagedBlobs === undefined ||
    activeKey === undefined ||
    conflictShadow === undefined ||
    deviceRevoked === undefined
  ) {
    throw new Error('E3005: invalid state key');
  }
  return {
    nonce: Number(nonce),
    leaseEnd: Number(leaseEnd),
    phase: phase as RekeyPhase,
    oldKeyWritesAllowed: allowed === '1',
    stagedBlobs: Number(stagedBlobs),
    activeKey: Number(activeKey),
    conflictShadow: conflictShadow === '1',
    deviceRevoked: deviceRevoked === '1',
  };
}
