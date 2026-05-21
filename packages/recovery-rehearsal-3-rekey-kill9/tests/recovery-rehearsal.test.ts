import { describe, expect, it } from 'vitest';

import {
  rehearseDeviceRevokeWriteRejection,
  rehearseLocalWipeMnemonicRestore,
  rehearseRekeyKill9Resume,
  rehearseServerWipeClientResync,
  runAllRecoveryRehearsals,
} from '../src';

describe('recovery rehearsal scenarios', () => {
  it('returns the four expected scenario names', async () => {
    const results = await runAllRecoveryRehearsals();

    expect(results.map((result) => result.name)).toEqual([
      'server_wipe_client_resync',
      'local_wipe_mnemonic_restore',
      'rekey_kill9_resume',
      'device_revoke_write_rejection',
    ]);
  });

  it('passes the server wipe client resync scenario with real sync push and pull', async () => {
    const result = await rehearseServerWipeClientResync();

    expect(result.passed).toBe(true);
    expect(result.details).not.toBe('');
  });

  it('passes the local wipe mnemonic restore scenario with real signing verification', async () => {
    const result = await rehearseLocalWipeMnemonicRestore();

    expect(result.passed).toBe(true);
    expect(result.details).not.toBe('');
  });

  it('passes the rekey kill -9 resume scenario', async () => {
    const result = await rehearseRekeyKill9Resume();

    expect(result.passed).toBe(true);
    expect(result.details).not.toBe('');
  });

  it('passes the device revoke write rejection scenario with a rejected second push', async () => {
    const result = await rehearseDeviceRevokeWriteRejection();

    expect(result.passed).toBe(true);
    expect(result.details).not.toBe('');
  });

  it('fails server wipe recovery when the client also lost the local outbox', async () => {
    const result = await rehearseServerWipeClientResync({ seedLocalOutbox: false });

    expect(result.passed).toBe(false);
    expect(result.details).not.toBe('');
  });
});
