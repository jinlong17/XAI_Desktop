import type {
  CommandError,
  CreatePluginWindowInput,
  GridWindowSnapshot,
  PluginWindowCommandSourceLabel,
  PluginWindowSnapshot,
  UpdatePluginWindowInput,
} from '../types/window';
import type { PluginInstanceConfig } from '../types/plugin';

export type PluginWindowCommand =
  | 'create_grid_window'
  | 'update_grid_window'
  | 'close_grid_window'
  | 'focus_grid_window'
  | 'list_grid_windows';

export type PluginWindowCommandInvoker = <T>(
  command: PluginWindowCommand,
  args?: Record<string, unknown>,
) => Promise<T>;

export interface PluginWindowAdapterOptions {
  invoke: PluginWindowCommandInvoker;
  sourceLabel?: PluginWindowCommandSourceLabel;
  allowedSourceLabels?: PluginWindowCommandSourceLabel[];
}

export interface PluginWindowAdapter {
  create(input: CreatePluginWindowInput): Promise<PluginWindowSnapshot>;
  update(input: UpdatePluginWindowInput): Promise<PluginWindowSnapshot>;
  focus(instanceId: string): Promise<PluginWindowSnapshot>;
  close(instanceId: string): Promise<void>;
  list(): Promise<PluginWindowSnapshot[]>;
}

const DEFAULT_ALLOWED_SOURCE_LABELS: PluginWindowCommandSourceLabel[] = ['main', 'control'];

export function createPluginWindowAdapter(
  options: PluginWindowAdapterOptions,
): PluginWindowAdapter {
  const allowedSourceLabels = options.allowedSourceLabels ?? DEFAULT_ALLOWED_SOURCE_LABELS;

  function ensureSourceAllowed(): void {
    if (!options.sourceLabel) {
      return;
    }
    if (!allowedSourceLabels.includes(options.sourceLabel)) {
      throw createCommandError(
        'WINDOW_CAPABILITY_DENIED',
        `window \`${options.sourceLabel}\` is not allowed to invoke plugin window lifecycle commands`,
        false,
      );
    }
  }

  async function invokeGridCommand<T>(
    command: PluginWindowCommand,
    args?: Record<string, unknown>,
  ): Promise<T> {
    ensureSourceAllowed();
    try {
      return await options.invoke<T>(command, args);
    } catch (error) {
      throw normalizeCommandError(error);
    }
  }

  return {
    async create(input) {
      const gridId = pluginInstanceIdToGridId(input.instanceId);
      const rect = pluginInstanceConfigToGridRect(input.config);
      const snapshot = await invokeGridCommand<GridWindowSnapshot>('create_grid_window', {
        gridId,
        rect,
      });
      return gridSnapshotToPluginWindowSnapshot(snapshot, input.instanceId, input.config);
    },
    async update(input) {
      const gridId = pluginInstanceIdToGridId(input.instanceId);
      const rect = pluginInstanceConfigToGridRect(input.config);
      const snapshot = await invokeGridCommand<GridWindowSnapshot>('update_grid_window', {
        gridId,
        rect,
      });
      return gridSnapshotToPluginWindowSnapshot(snapshot, input.instanceId, input.config);
    },
    async focus(instanceId) {
      const gridId = pluginInstanceIdToGridId(instanceId);
      const snapshot = await invokeGridCommand<GridWindowSnapshot>('focus_grid_window', {
        gridId,
      });
      return gridSnapshotToPluginWindowSnapshot(snapshot, instanceId);
    },
    async close(instanceId) {
      const gridId = pluginInstanceIdToGridId(instanceId);
      await invokeGridCommand<void>('close_grid_window', {
        gridId,
      });
    },
    async list() {
      const snapshots = await invokeGridCommand<GridWindowSnapshot[]>('list_grid_windows');
      return snapshots.map((snapshot) =>
        gridSnapshotToPluginWindowSnapshot(snapshot, gridIdToPluginInstanceId(snapshot.gridId)),
      );
    },
  };
}

export function pluginInstanceIdToGridId(instanceId: string): string {
  if (!isValidPluginWindowInstanceId(instanceId)) {
    throw createCommandError(
      'INVALID_PLUGIN_INSTANCE_ID',
      "plugin instance id must be non-empty and contain only ASCII letters, numbers, '-' or '_'",
      true,
    );
  }
  return instanceId;
}

export function gridIdToPluginInstanceId(gridId: string): string {
  return gridId;
}

export function gridSnapshotToPluginWindowSnapshot(
  snapshot: GridWindowSnapshot,
  instanceId: string,
  config?: PluginInstanceConfig,
): PluginWindowSnapshot {
  const fallbackConfig = config ?? gridSnapshotToPluginInstanceConfig(snapshot);
  return {
    instanceId,
    label: snapshot.label,
    surface: 'grid',
    rect: snapshot.rect,
    visible: snapshot.visible,
    placement: fallbackConfig.placement,
    size: fallbackConfig.size,
    behavior: fallbackConfig.behavior,
    style: fallbackConfig.style,
    nativeApplied: {
      placement: true,
      size: true,
      opacity: false,
      clickThrough: false,
      pinned: false,
      allSpaces: false,
    },
  };
}

export function pluginInstanceConfigToGridRect(config: PluginInstanceConfig): GridWindowSnapshot['rect'] {
  return {
    x: config.placement.x,
    y: config.placement.y,
    width: config.size.width,
    height: config.size.height,
  };
}

export function normalizeCommandError(error: unknown): CommandError {
  if (isCommandError(error)) {
    return error;
  }
  if (typeof error === 'string') {
    return createCommandError('WINDOW_NATIVE_ERROR', error, true);
  }
  if (error instanceof Error) {
    return createCommandError('WINDOW_NATIVE_ERROR', error.message, true);
  }
  return createCommandError('WINDOW_NATIVE_ERROR', 'Unknown window command error', true, error);
}

function isValidPluginWindowInstanceId(instanceId: string): boolean {
  return instanceId.length > 0 &&
    instanceId.length <= 128 &&
    /^[A-Za-z0-9_-]+$/.test(instanceId);
}

function isCommandError(error: unknown): error is CommandError {
  const candidate = error as Partial<CommandError>;
  return typeof candidate.code === 'string' &&
    typeof candidate.message === 'string' &&
    typeof candidate.recoverable === 'boolean';
}

function createCommandError(
  code: string,
  message: string,
  recoverable: boolean,
  details?: unknown,
): CommandError {
  return {
    code,
    message,
    recoverable,
    details,
  };
}

function gridSnapshotToPluginInstanceConfig(snapshot: GridWindowSnapshot): PluginInstanceConfig {
  return {
    placement: {
      x: snapshot.rect.x,
      y: snapshot.rect.y,
    },
    size: {
      preset: 'medium',
      width: snapshot.rect.width,
      height: snapshot.rect.height,
    },
    behavior: {
      pinned: false,
      clickThrough: false,
      allSpaces: false,
      clickAction: 'focus',
    },
    style: {
      mode: 'system',
      opacity: 1,
    },
  };
}
