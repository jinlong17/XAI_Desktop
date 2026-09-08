export interface PushMutation {
  accountId: string;
  mutationId: string;
  entityType: string;
  entityId: string;
  proposedRevision: number;
}

export interface PushEdgeResult {
  mutationId: string;
  status: 'ok' | 'duplicate' | 'revision_mismatch';
  appliedRevision?: number;
  currentRevision?: number;
}

export class InMemoryPushEdgeFunction {
  private readonly revisions = new Map<string, number>();
  private readonly dedup = new Map<string, PushEdgeResult>();

  push(mutation: PushMutation): PushEdgeResult {
    const dedupKey = `${mutation.accountId}\u0000${mutation.mutationId}`;
    const duplicate = this.dedup.get(dedupKey);
    if (duplicate) {
      return { ...duplicate, status: 'duplicate' };
    }
    const entityKey = `${mutation.accountId}\u0000${mutation.entityType}\u0000${mutation.entityId}`;
    const currentRevision = this.revisions.get(entityKey) ?? 0;
    if (mutation.proposedRevision !== currentRevision + 1) {
      const result: PushEdgeResult = {
        mutationId: mutation.mutationId,
        status: 'revision_mismatch',
        currentRevision,
      };
      this.dedup.set(dedupKey, result);
      return result;
    }
    this.revisions.set(entityKey, mutation.proposedRevision);
    const result: PushEdgeResult = {
      mutationId: mutation.mutationId,
      status: 'ok',
      appliedRevision: mutation.proposedRevision,
    };
    this.dedup.set(dedupKey, result);
    return result;
  }
}
