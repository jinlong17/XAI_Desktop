export type RekeyPhase = 'normal' | 'staging' | 'swapped';

export interface ProtocolState {
  nonce: number;
  leaseEnd: number;
  phase: RekeyPhase;
  oldKeyWritesAllowed: boolean;
  stagedBlobs: number;
  activeKey: number;
}

export interface StateCoverageReport {
  visitedStates: number;
  transitions: number;
  deadlocks: ProtocolState[];
  invariantFailures: string[];
  sampleStates: ProtocolState[];
}

export function initialProtocolState(): ProtocolState {
  return {
    nonce: 0,
    leaseEnd: 1,
    phase: 'normal',
    oldKeyWritesAllowed: true,
    stagedBlobs: 0,
    activeKey: 1,
  };
}

export function exploreProtocolStateSpace(maxDepth = 7): StateCoverageReport {
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

    const next = depth >= maxDepth ? [] : nextStates(state);
    transitions += next.length;
    if (next.length === 0 && state.phase !== 'swapped' && depth < maxDepth) {
      deadlocks.push(state);
    }
    for (const candidate of next) {
      queue.push({ state: candidate, depth: depth + 1 });
    }
  }

  return {
    visitedStates: seen.size,
    transitions,
    deadlocks,
    invariantFailures,
    sampleStates: [...seen].slice(0, 8).map(parseKey),
  };
}

export function nextStates(state: ProtocolState): ProtocolState[] {
  const next: ProtocolState[] = [];

  if (state.nonce <= state.leaseEnd && state.phase !== 'staging') {
    next.push({ ...state, nonce: state.nonce + 1 });
  }
  if (state.nonce > state.leaseEnd && state.phase === 'normal') {
    next.push({ ...state, leaseEnd: state.leaseEnd + 2 });
  }
  if (state.phase === 'normal') {
    next.push({ ...state, phase: 'staging', oldKeyWritesAllowed: false, activeKey: 1 });
  }
  if (state.phase === 'staging' && state.stagedBlobs < 2) {
    next.push({ ...state, stagedBlobs: state.stagedBlobs + 1 });
  }
  if (state.phase === 'staging' && state.stagedBlobs === 2) {
    next.push({ ...state, phase: 'swapped', activeKey: 2, oldKeyWritesAllowed: false });
  }

  return next;
}

export function checkInvariants(state: ProtocolState): string[] {
  const failures: string[] = [];
  if (state.nonce < 0 || state.leaseEnd < 0) {
    failures.push('nonce values must be non-negative');
  }
  if (state.phase === 'staging' && state.oldKeyWritesAllowed) {
    failures.push('old key writes must be quarantined during rekey staging');
  }
  if (state.phase === 'swapped' && state.activeKey !== 2) {
    failures.push('new key must be active after swap');
  }
  if (state.phase === 'normal' && state.stagedBlobs !== 0) {
    failures.push('normal phase cannot contain staged blobs');
  }
  return failures;
}

function keyOf(state: ProtocolState): string {
  return [
    state.nonce,
    state.leaseEnd,
    state.phase,
    state.oldKeyWritesAllowed ? 1 : 0,
    state.stagedBlobs,
    state.activeKey,
  ].join('|');
}

function parseKey(key: string): ProtocolState {
  const [nonce, leaseEnd, phase, allowed, stagedBlobs, activeKey] = key.split('|');
  if (
    nonce === undefined ||
    leaseEnd === undefined ||
    phase === undefined ||
    allowed === undefined ||
    stagedBlobs === undefined ||
    activeKey === undefined
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
  };
}
