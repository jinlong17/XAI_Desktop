import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock @tauri-apps/api/core before importing the hook
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

import { invoke as tauriInvoke } from '@tauri-apps/api/core';
import { useTauriInvoke } from '../src/hooks/useTauriInvoke';

const mockInvoke = vi.mocked(tauriInvoke);

describe('useTauriInvoke', () => {
  beforeEach(() => {
    mockInvoke.mockReset();
  });

  it('should return an invoke function', () => {
    const hook = useTauriInvoke();
    expect(hook).toBeDefined();
    expect(typeof hook.invoke).toBe('function');
  });

  it('should forward cmd and args to tauri invoke and resolve', async () => {
    const expected = { data: 'hello' };
    mockInvoke.mockResolvedValueOnce(expected);

    const { invoke } = useTauriInvoke();
    const result = await invoke<typeof expected>('my_command', { key: 'value' });

    expect(mockInvoke).toHaveBeenCalledWith('my_command', { key: 'value' });
    expect(result).toEqual(expected);
  });

  it('should forward cmd without args', async () => {
    mockInvoke.mockResolvedValueOnce(null);

    const { invoke } = useTauriInvoke();
    await invoke('no_args_command');

    expect(mockInvoke).toHaveBeenCalledWith('no_args_command', undefined);
  });

  it('should propagate rejection (pass-through error semantics)', async () => {
    const error = new Error('E3001: sync auth required');
    mockInvoke.mockRejectedValueOnce(error);

    const { invoke } = useTauriInvoke();
    await expect(invoke('sync_command')).rejects.toThrow('E3001: sync auth required');
  });
});
