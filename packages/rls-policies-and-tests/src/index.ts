export type RlsRole = 'anon' | 'authenticated';
export type RlsDeviceStatus = 'active' | 'pending_dek_wrap' | 'revoked';
export type RlsTable =
  | 'accounts'
  | 'sync_devices'
  | 'device_dek_wraps'
  | 'encrypted_blobs'
  | 'mutation_dedup'
  | 'device_sync_progress'
  | 'nonce_lease';

export interface RlsContext {
  role: RlsRole;
  userId: string | null;
  deviceId: string | null;
}

export interface RlsRow {
  accountId: string;
  deviceId?: string;
  status?: RlsDeviceStatus;
}

export function canSelect(table: RlsTable, context: RlsContext, row: RlsRow): boolean {
  if (context.role !== 'authenticated' || context.userId === null) {
    return false;
  }
  if (row.accountId !== context.userId) {
    return false;
  }
  if (table === 'sync_devices') {
    if (row.deviceId !== context.deviceId) {
      return row.status === 'active' && isActiveCaller(context, row);
    }
    return row.status === 'active' || row.status === 'pending_dek_wrap';
  }
  if (table === 'device_dek_wraps') {
    return row.deviceId === context.deviceId && isActiveCaller(context, row);
  }
  if (table === 'nonce_lease') {
    return false;
  }
  return isActiveCaller(context, row);
}

export function canMutateDirectly(table: RlsTable, _context: RlsContext, _row: RlsRow): boolean {
  return table === 'device_sync_progress';
}

export function assertUserFilter(query: { table: RlsTable; filters: Record<string, string> }, context: RlsContext): void {
  if (context.userId === null || query.filters.account_id !== context.userId) {
    throw new Error('E3030: RLS query must include account_id filter for authenticated user');
  }
}

function isActiveCaller(context: RlsContext, row: RlsRow): boolean {
  return context.deviceId !== null && row.status !== 'revoked';
}
