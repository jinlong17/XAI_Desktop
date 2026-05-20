/**
 * Protocol state explorer (NOT a TLA+ model).
 * This is a TypeScript exhaustive state-space exploration that mirrors
 * the high-level invariants of docs/spec/sync.tla, but does not run
 * TLC and is not a substitute for formal model checking.
 * See docs/spec/sync.tla for the authoritative specification.
 * Tracking: full TLA+ wiring (Java + tla-tools) is a follow-up in G9+1.
 */

export type RekeyPhase = 'normal' | 'staging' | 'swapped';

export type ExplorationStatus = 'completed' | 'completed_with_invariant_failures';

export interface ExploreProtocolStateSpaceOptions {
  /**
   * Enables deliberately unsafe rollback branches used to prove invariants fire.
   * The default state-space run keeps these probes disabled for normal coverage.
   */
  includeProbeTransitions?: boolean;
}

export interface NextStateOptions {
  /**
   * Includes unsafe probe-only branches such as reopening old-key writes after
   * swap. These branches model bad concurrent rollback attempts and should be
   * rejected by checkInvariants().
   */
  includeProbeTransitions?: boolean;
}

export const explorerVersion = 'ts-bfs-v1';

export const syncTlaReference = {
  path: 'docs/spec/sync.tla',
  variables: [
    'active',
    'revoked',
    'joined',
    'hasDEK',
    'keyEpoch',
    'rekeying',
    'commitSeq',
    'seenCommit',
    'pending',
    'applied',
    'conflictShadow',
    'recovered',
    'scenarioSeen',
  ],
  actions: [
    'Init',
    'JoinDevice',
    'RevokeDevice',
    'BeginRekey',
    'FinishRekey',
    'QueueOfflineMutation',
    'ReplayPending',
    'DuplicateMutation',
    'FullRecovery',
    'Next',
  ],
} as const;

const NEW_INVARIANTS_COVERED = [
  'leaseEnd must not trail nonce by more than one',
  'staging phase cannot advance nonce after BeginRekey',
  'swapped phase cannot gain staged blobs',
  'normal phase cannot accept commits when old-key writes are disabled',
  'swapped phase cannot reopen old-key writes',
] as const;

/**
 * Coarse TypeScript projection of docs/spec/sync.tla variables.
 *
 * This explorer intentionally uses bounded counters instead of the full TLA+
 * sets/functions. The field comments identify the sync.tla variable each field
 * approximates so drift is visible during maintenance.
 */
export interface ProtocolState {
  /** Mirrors sync.tla commitSeq and the local seenCommit progress. */
  nonce: number;
  /** Mirrors the bounded MaxCommit/seenCommit window used to permit commits. */
  leaseEnd: number;
  /** Mirrors rekeying plus keyEpoch phase: Init, BeginRekey, FinishRekey. */
  phase: RekeyPhase;
  /** Mirrors hasDEK/active/revoked as an old-epoch write-acceptance guard. */
  oldKeyWritesAllowed: boolean;
  /** Mirrors pending rekey material before FinishRekey can complete. */
  stagedBlobs: number;
  /** Mirrors keyEpoch in the active key projection. */
  activeKey: number;
  /** Captures commitSeq at BeginRekey so staging cannot advance nonce. */
  stagingStartNonce?: number;
  /** Coarse counter for docs/spec/sync.tla revoked from RevokeDevice. */
  revokedDevices?: number;
  /** Coarse counter for docs/spec/sync.tla conflictShadow from ReplayPending. */
  conflictShadows?: number;
  /** Derived marker for a successful ReplayPending commitSeq increment. */
  lastCommitAccepted?: boolean;
}

/**
 * BFS coverage report for the TypeScript explorer that mirrors docs/spec/sync.tla.
 */
export interface StateCoverageReport {
  visitedStates: number;
  transitions: number;
  deadlocks: ProtocolState[];
  invariantFailures: string[];
  sampleStates: ProtocolState[];
  completed: boolean;
  status: ExplorationStatus;
  hasInvariantFailures: boolean;
  newInvariantsCovered: string[];
}

export function initialProtocolState(): ProtocolState {
  return {
    nonce: 0,
    leaseEnd: 1,
    phase: 'normal',
    oldKeyWritesAllowed: true,
    stagedBlobs: 0,
    activeKey: 1,
    revokedDevices: 0,
    conflictShadows: 0,
    lastCommitAccepted: false,
  };
}

export function exploreProtocolStateSpace(
  maxDepth = 7,
  options: ExploreProtocolStateSpaceOptions = {},
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

    const next =
      depth >= maxDepth
        ? []
        : nextStates(state, { includeProbeTransitions: options.includeProbeTransitions ?? false });
    transitions += next.length;
    if (next.length === 0 && state.phase !== 'swapped' && depth < maxDepth) {
      deadlocks.push(state);
    }
    for (const candidate of next) {
      queue.push({ state: candidate, depth: depth + 1 });
    }
  }

  const hasInvariantFailures = invariantFailures.length > 0;

  return {
    visitedStates: seen.size,
    transitions,
    deadlocks,
    invariantFailures,
    sampleStates: [...seen].slice(0, 8).map(parseKey),
    completed: true,
    status: hasInvariantFailures ? 'completed_with_invariant_failures' : 'completed',
    hasInvariantFailures,
    newInvariantsCovered: [...NEW_INVARIANTS_COVERED],
  };
}

export function nextStates(state: ProtocolState, options: NextStateOptions = {}): ProtocolState[] {
  const includeProbeTransitions = options.includeProbeTransitions ?? true;
  const next: ProtocolState[] = [];
  const revokedDevices = state.revokedDevices ?? 0;
  const conflictShadows = state.conflictShadows ?? 0;

  if (
    state.nonce <= state.leaseEnd &&
    state.phase !== 'staging' &&
    (state.phase !== 'normal' || state.oldKeyWritesAllowed)
  ) {
    next.push({ ...state, nonce: state.nonce + 1, lastCommitAccepted: true });
  }
  if (state.nonce > state.leaseEnd && state.phase === 'normal') {
    next.push({ ...state, leaseEnd: state.leaseEnd + 2, lastCommitAccepted: false });
  }
  if (state.phase === 'normal') {
    next.push({
      ...state,
      phase: 'staging',
      oldKeyWritesAllowed: false,
      activeKey: state.activeKey,
      stagingStartNonce: state.nonce,
      lastCommitAccepted: false,
    });
  }
  if (state.phase === 'staging' && state.stagedBlobs < 2) {
    next.push({ ...state, stagedBlobs: state.stagedBlobs + 1, lastCommitAccepted: false });
  }
  if (state.phase === 'staging' && state.stagedBlobs === 2) {
    next.push({
      ...state,
      phase: 'swapped',
      activeKey: Math.max(state.activeKey, 2),
      oldKeyWritesAllowed: false,
      lastCommitAccepted: false,
    });
    next.push({
      ...state,
      phase: 'staging',
      stagedBlobs: 1,
      oldKeyWritesAllowed: false,
      lastCommitAccepted: false,
    });
  }
  if (state.phase !== 'staging' && revokedDevices < 1) {
    next.push({
      ...state,
      oldKeyWritesAllowed: false,
      revokedDevices: revokedDevices + 1,
      lastCommitAccepted: false,
    });
  }
  if (state.nonce > state.leaseEnd && conflictShadows < 1) {
    next.push({
      ...state,
      conflictShadows: conflictShadows + 1,
      lastCommitAccepted: false,
    });
  }
  if (includeProbeTransitions && state.phase === 'swapped' && !state.oldKeyWritesAllowed) {
    next.push({ ...state, oldKeyWritesAllowed: true, lastCommitAccepted: false });
  }

  return next;
}

export function checkInvariants(state: ProtocolState): string[] {
  const failures: string[] = [];
  const revokedDevices = state.revokedDevices ?? 0;
  const conflictShadows = state.conflictShadows ?? 0;

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
  if (state.leaseEnd < state.nonce - 1) {
    failures.push('leaseEnd must not trail nonce by more than one');
  }
  if (
    state.phase === 'staging' &&
    state.stagingStartNonce !== undefined &&
    state.nonce !== state.stagingStartNonce
  ) {
    failures.push('staging phase cannot advance nonce after BeginRekey');
  }
  if (state.phase === 'swapped' && state.stagedBlobs !== 2) {
    failures.push('swapped phase cannot gain staged blobs');
  }
  if (state.phase === 'normal' && !state.oldKeyWritesAllowed && state.lastCommitAccepted) {
    failures.push('normal phase cannot accept commits when old-key writes are disabled');
  }
  if (state.phase === 'swapped' && state.oldKeyWritesAllowed) {
    failures.push('swapped phase cannot reopen old-key writes');
  }
  if (revokedDevices > 0 && state.oldKeyWritesAllowed) {
    failures.push('revoked devices cannot retain old-key write acceptance');
  }
  if (conflictShadows < 0 || conflictShadows > 1) {
    failures.push('conflict shadow count must remain bounded');
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
    state.stagingStartNonce ?? '_',
    state.revokedDevices ?? 0,
    state.conflictShadows ?? 0,
    state.lastCommitAccepted ? 1 : 0,
  ].join('|');
}

function parseKey(key: string): ProtocolState {
  const [
    nonce,
    leaseEnd,
    phase,
    allowed,
    stagedBlobs,
    activeKey,
    stagingStartNonce,
    revokedDevices,
    conflictShadows,
    lastCommitAccepted,
  ] = key.split('|');
  if (
    nonce === undefined ||
    leaseEnd === undefined ||
    phase === undefined ||
    allowed === undefined ||
    stagedBlobs === undefined ||
    activeKey === undefined ||
    stagingStartNonce === undefined ||
    revokedDevices === undefined ||
    conflictShadows === undefined ||
    lastCommitAccepted === undefined
  ) {
    throw new Error('E3005: invalid state key');
  }

  const state: ProtocolState = {
    nonce: Number(nonce),
    leaseEnd: Number(leaseEnd),
    phase: phase as RekeyPhase,
    oldKeyWritesAllowed: allowed === '1',
    stagedBlobs: Number(stagedBlobs),
    activeKey: Number(activeKey),
    revokedDevices: Number(revokedDevices),
    conflictShadows: Number(conflictShadows),
    lastCommitAccepted: lastCommitAccepted === '1',
  };

  if (stagingStartNonce !== '_') {
    state.stagingStartNonce = Number(stagingStartNonce);
  }

  return state;
}
