/**
 * apps/admin/src/adapters/guardedCommands.ts — guarded command seam (row #3, P1).
 *
 * Browser ADVISORY only: this adapter delegates to the audited mock AdminApiClient so
 * RBAC, audit-on-mutation, and applied:false come from the shipped contract rows. The
 * production server remains authoritative: the server is the real enforcer and must
 * perform the privileged operation plus audit append in one transaction. This row does
 * no network, no storage, and no real write; every granted mock mutation returns
 * applied:false.
 */
import {
  createAuditedMockAdminApiClient,
  type AuditedMockContext,
} from "../audit/auditedMutation";
import type { AdminAuditChain } from "../audit/hashChain";
import type { AdminApiResult, MutationAck } from "../contracts/adminApi";

export const GUARDED_COMMAND_ADVISORY_NOTE =
  "Guarded admin commands are browser advisory only. The server is the real enforcer " +
  "and authoritative gate: it must perform the privileged operation and audit append in " +
  "one transaction. This mock performs no network, no storage, and no real write; " +
  "granted calls return applied:false.";

export interface GuardedCommandAdapter {
  banUser(input: { email: string }): Promise<AdminApiResult<MutationAck>>;
  bulkBan(input: { emails: string[] }): Promise<AdminApiResult<MutationAck>>;
  transferOwnership(input: {
    org: string;
    toMember: string;
  }): Promise<AdminApiResult<MutationAck>>;
  setFeatureRollout(input: {
    key: string;
    rollout: number;
  }): Promise<AdminApiResult<MutationAck>>;
}

export function createGuardedCommandAdapter(ctx?: AuditedMockContext): {
  commands: GuardedCommandAdapter;
  chain: AdminAuditChain;
} {
  const { client, chain } = createAuditedMockAdminApiClient(ctx);
  const commands: GuardedCommandAdapter = {
    banUser: (input) => client.banUser(input),
    bulkBan: (input) => client.bulkBan(input),
    transferOwnership: (input) => client.transferOwnership(input),
    setFeatureRollout: (input) => client.setFeatureRollout(input),
  };

  return { commands, chain };
}
