import {
  beginRekey,
  completeRekeySwap,
  stageRekeyBlobs,
  type BeginRekeyInput,
  type RekeyAccountState,
  type RekeyBlobInput,
  type RekeyProofGate,
  type RekeySession,
  type RetiredKeyCleanupPlan,
} from '../../plugin-account/src/rekey';

export type RekeyCheckpointPhase = 'init' | 'staging' | 'before_swap' | 'after_swap';

export interface RekeyCheckpoint {
  phase: RekeyCheckpointPhase;
  account: RekeyAccountState;
  session: RekeySession;
  cleanup?: RetiredKeyCleanupPlan;
}

export interface RekeyCheckpointStore {
  save(checkpoint: RekeyCheckpoint): Promise<void>;
  load(sessionId: string): Promise<RekeyCheckpoint | undefined>;
  clear(sessionId: string): Promise<void>;
}

export class InMemoryRekeyCheckpointStore implements RekeyCheckpointStore {
  private readonly checkpoints = new Map<string, RekeyCheckpoint>();

  async save(checkpoint: RekeyCheckpoint): Promise<void> {
    this.checkpoints.set(checkpoint.session.id, cloneCheckpoint(checkpoint));
  }

  async load(sessionId: string): Promise<RekeyCheckpoint | undefined> {
    const checkpoint = this.checkpoints.get(sessionId);
    return checkpoint ? cloneCheckpoint(checkpoint) : undefined;
  }

  async clear(sessionId: string): Promise<void> {
    this.checkpoints.delete(sessionId);
  }
}

export async function startTwoPhaseRekey(store: RekeyCheckpointStore, input: BeginRekeyInput): Promise<RekeyCheckpoint> {
  const started = beginRekey(input);
  const checkpoint: RekeyCheckpoint = { phase: 'init', account: started.account, session: started.session };
  await store.save(checkpoint);
  return checkpoint;
}

export async function stageTwoPhaseRekey(
  store: RekeyCheckpointStore,
  checkpoint: RekeyCheckpoint,
  blobs: readonly RekeyBlobInput[],
): Promise<RekeyCheckpoint> {
  const staged: RekeyCheckpoint = {
    phase: 'staging',
    account: checkpoint.account,
    session: stageRekeyBlobs(checkpoint.session, blobs),
  };
  await store.save(staged);
  return staged;
}

export async function completeTwoPhaseRekey(
  store: RekeyCheckpointStore,
  checkpoint: RekeyCheckpoint,
  gate: RekeyProofGate,
): Promise<RekeyCheckpoint> {
  const beforeSwap: RekeyCheckpoint = { ...checkpoint, phase: 'before_swap' };
  await store.save(beforeSwap);
  const completed = completeRekeySwap(beforeSwap.account, beforeSwap.session, gate);
  const afterSwap: RekeyCheckpoint = {
    phase: 'after_swap',
    account: completed.account,
    session: completed.session,
    cleanup: completed.cleanup,
  };
  await store.save(afterSwap);
  return afterSwap;
}

export async function resumeTwoPhaseRekey(
  store: RekeyCheckpointStore,
  sessionId: string,
  input: {
    blobs: readonly RekeyBlobInput[];
    gate: RekeyProofGate;
  },
): Promise<RekeyCheckpoint> {
  const checkpoint = await store.load(sessionId);
  if (!checkpoint) {
    throw new Error('E3005: missing rekey checkpoint');
  }
  if (checkpoint.phase === 'after_swap') {
    return checkpoint;
  }
  const staged = checkpoint.phase === 'init' ? await stageTwoPhaseRekey(store, checkpoint, input.blobs) : checkpoint;
  return completeTwoPhaseRekey(store, staged, input.gate);
}

function cloneCheckpoint(checkpoint: RekeyCheckpoint): RekeyCheckpoint {
  const cloned: RekeyCheckpoint = {
    phase: checkpoint.phase,
    account: {
      ...checkpoint.account,
      recoverySigningPub: new Uint8Array(checkpoint.account.recoverySigningPub),
      keyring: checkpoint.account.keyring.map(cloneKeyringEntry),
    },
    session: {
      ...checkpoint.session,
      newRecoverySigningPub: new Uint8Array(checkpoint.session.newRecoverySigningPub),
      activeDeviceIds: [...checkpoint.session.activeDeviceIds],
      staged: checkpoint.session.staged.map((blob) => ({ ...blob })),
    },
  };
  if (checkpoint.cleanup) {
    cloned.cleanup = cloneCleanupPlan(checkpoint.cleanup);
  }
  return cloned;
}

function cloneKeyringEntry(entry: RekeyAccountState['keyring'][number]): RekeyAccountState['keyring'][number] {
  return entry.materialBuffer ? { ...entry, materialBuffer: new Uint8Array(entry.materialBuffer) } : { ...entry };
}

function cloneCleanupPlan(cleanup: RetiredKeyCleanupPlan): RetiredKeyCleanupPlan {
  return {
    oldKeyId: cleanup.oldKeyId,
    deviceDekWrapsToDelete: cleanup.deviceDekWrapsToDelete.map((wrap) => ({ ...wrap })),
    keyMaterialZeroized: cleanup.keyMaterialZeroized,
  };
}
