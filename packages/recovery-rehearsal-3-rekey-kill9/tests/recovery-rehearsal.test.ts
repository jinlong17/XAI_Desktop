import { describe, expect, it } from 'vitest';

import { runAllRecoveryRehearsals } from '../src';

describe('recovery rehearsal scenarios', () => {
  it('passes all four mock recovery scenarios', async () => {
    const results = await runAllRecoveryRehearsals();

    expect(results.map((result) => result.name)).toEqual([
      'server_wipe_client_resync',
      'local_wipe_mnemonic_restore',
      'rekey_kill9_resume',
      'device_revoke_write_rejection',
    ]);
    expect(results.every((result) => result.passed)).toBe(true);
  });
});
