import { canSelect, type RlsContext, type RlsRow, type RlsTable } from '../../rls-policies-and-tests/src';

export interface RlsFuzzFailure {
  index: number;
  table: RlsTable;
  context: RlsContext;
  row: RlsRow;
}

export function runRlsIsolationFuzz(iterations = 500): RlsFuzzFailure[] {
  const failures: RlsFuzzFailure[] = [];
  const tables: RlsTable[] = ['encrypted_blobs', 'device_dek_wraps', 'mutation_dedup', 'device_sync_progress'];
  for (let index = 0; index < iterations; index += 1) {
    const contextAccount = `acct-${index % 17}`;
    const rowAccount = index % 11 === 0 ? `acct-other-${index}` : contextAccount;
    const context: RlsContext = {
      role: index % 13 === 0 ? 'anon' : 'authenticated',
      userId: index % 13 === 0 ? null : contextAccount,
      deviceId: `dev-${index % 7}`,
    };
    const row: RlsRow = {
      accountId: rowAccount,
      deviceId: index % 3 === 0 ? context.deviceId ?? undefined : `dev-other-${index}`,
      status: index % 5 === 0 ? 'revoked' : 'active',
    };
    const table = tables[index % tables.length]!;
    const selected = canSelect(table, context, row);
    if (selected && (context.role !== 'authenticated' || context.userId !== row.accountId)) {
      failures.push({ index, table, context, row });
    }
    if (selected && table === 'device_dek_wraps' && row.deviceId !== context.deviceId) {
      failures.push({ index, table, context, row });
    }
  }
  return failures;
}
