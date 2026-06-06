import { describe, expect, it, vi } from 'vitest';
import {
  createPluginInstanceConfig,
  createPluginWindowAdapter,
  gridSnapshotToPluginWindowSnapshot,
  normalizeCommandError,
  pluginInstanceConfigToGridRect,
  pluginInstanceIdToGridId,
} from '../src/registry';
import type { CommandError, GridWindowSnapshot } from '../src/types';

const RECT = { x: 10, y: 20, width: 320, height: 240 };
const CONFIG = createPluginInstanceConfig({
  placement: {
    x: RECT.x,
    y: RECT.y,
    displayId: 'display-1',
    spaceId: 'space-1',
  },
  size: {
    preset: 'large',
    width: RECT.width,
    height: RECT.height,
  },
  behavior: {
    pinned: true,
    clickThrough: true,
    allSpaces: true,
    clickAction: 'open-settings',
  },
  style: {
    mode: 'minimal',
    opacity: 0.66,
  },
});

function gridSnapshot(gridId = 'instance-1'): GridWindowSnapshot {
  return {
    gridId,
    label: `grid_${gridId}`,
    rect: RECT,
    visible: true,
  };
}

describe('plugin window adapter', () => {
  it('maps create to the existing create_grid_window command', async () => {
    const invoke = vi.fn(async () => gridSnapshot());
    const adapter = createPluginWindowAdapter({ invoke, sourceLabel: 'control' });

    const snapshot = await adapter.create({
      instanceId: 'instance-1',
      config: CONFIG,
    });

    expect(invoke).toHaveBeenCalledWith('create_grid_window', {
      gridId: 'instance-1',
      rect: RECT,
    });
    expect(snapshot).toEqual({
      instanceId: 'instance-1',
      label: 'grid_instance-1',
      surface: 'grid',
      rect: RECT,
      visible: true,
      placement: CONFIG.placement,
      size: CONFIG.size,
      behavior: CONFIG.behavior,
      style: CONFIG.style,
      nativeApplied: {
        placement: true,
        size: true,
        opacity: false,
        clickThrough: false,
        pinned: false,
        allSpaces: false,
      },
    });
  });

  it('maps update, focus, close, and list to grid lifecycle commands', async () => {
    const invoke = vi
      .fn()
      .mockResolvedValueOnce(gridSnapshot())
      .mockResolvedValueOnce(gridSnapshot())
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce([gridSnapshot('instance-1'), gridSnapshot('instance-2')]);
    const adapter = createPluginWindowAdapter({ invoke, sourceLabel: 'main' });

    await adapter.update({ instanceId: 'instance-1', config: CONFIG });
    await adapter.focus('instance-1');
    await adapter.close('instance-1');
    const listed = await adapter.list();

    expect(invoke).toHaveBeenNthCalledWith(1, 'update_grid_window', {
      gridId: 'instance-1',
      rect: RECT,
    });
    expect(invoke).toHaveBeenNthCalledWith(2, 'focus_grid_window', {
      gridId: 'instance-1',
    });
    expect(invoke).toHaveBeenNthCalledWith(3, 'close_grid_window', {
      gridId: 'instance-1',
    });
    expect(invoke).toHaveBeenNthCalledWith(4, 'list_grid_windows', undefined);
    expect(listed.map((snapshot) => snapshot.instanceId)).toEqual(['instance-1', 'instance-2']);
  });

  it('derives grid rect from placement and size config', () => {
    expect(pluginInstanceConfigToGridRect(CONFIG)).toEqual(RECT);
  });

  it('rejects invalid plugin instance ids before invoking host commands', async () => {
    const invoke = vi.fn();
    const adapter = createPluginWindowAdapter({ invoke, sourceLabel: 'control' });

    await expect(adapter.create({ instanceId: 'bad id', config: CONFIG })).rejects.toMatchObject({
      code: 'INVALID_PLUGIN_INSTANCE_ID',
      recoverable: true,
    });
    expect(invoke).not.toHaveBeenCalled();
  });

  it('rejects disallowed source labels before invoking host commands', async () => {
    const invoke = vi.fn();
    const adapter = createPluginWindowAdapter({
      invoke,
      sourceLabel: 'control',
      allowedSourceLabels: ['main'],
    });

    await expect(adapter.focus('instance-1')).rejects.toMatchObject({
      code: 'WINDOW_CAPABILITY_DENIED',
      recoverable: false,
    });
    expect(invoke).not.toHaveBeenCalled();
  });

  it('normalizes string, Error, unknown, and already typed command errors', () => {
    const typed: CommandError = {
      code: 'WINDOW_NOT_FOUND',
      message: 'missing',
      recoverable: true,
    };

    expect(normalizeCommandError(typed)).toBe(typed);
    expect(normalizeCommandError('native string')).toMatchObject({
      code: 'WINDOW_NATIVE_ERROR',
      message: 'native string',
      recoverable: true,
    });
    expect(normalizeCommandError(new Error('native error'))).toMatchObject({
      code: 'WINDOW_NATIVE_ERROR',
      message: 'native error',
      recoverable: true,
    });
    expect(normalizeCommandError({ unexpected: true })).toMatchObject({
      code: 'WINDOW_NATIVE_ERROR',
      message: 'Unknown window command error',
      recoverable: true,
      details: { unexpected: true },
    });
  });

  it('exports stable id and snapshot mappers', () => {
    expect(pluginInstanceIdToGridId('abc_123-xyz')).toBe('abc_123-xyz');
    expect(gridSnapshotToPluginWindowSnapshot(gridSnapshot('abc'), 'abc', CONFIG)).toEqual({
      instanceId: 'abc',
      label: 'grid_abc',
      surface: 'grid',
      rect: RECT,
      visible: true,
      placement: CONFIG.placement,
      size: CONFIG.size,
      behavior: CONFIG.behavior,
      style: CONFIG.style,
      nativeApplied: {
        placement: true,
        size: true,
        opacity: false,
        clickThrough: false,
        pinned: false,
        allSpaces: false,
      },
    });
  });

  it('uses rect-derived fallback config when no instance config is supplied', () => {
    expect(gridSnapshotToPluginWindowSnapshot(gridSnapshot('abc'), 'abc')).toMatchObject({
      placement: {
        x: RECT.x,
        y: RECT.y,
      },
      size: {
        preset: 'medium',
        width: RECT.width,
        height: RECT.height,
      },
      behavior: {
        pinned: false,
        clickThrough: false,
        allSpaces: false,
      },
      style: {
        mode: 'system',
        opacity: 1,
      },
    });
  });
});
