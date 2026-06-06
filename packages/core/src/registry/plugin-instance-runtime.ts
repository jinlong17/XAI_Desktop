import type {
  PluginInstance,
  PluginInstanceConfigInput,
  PluginInstanceId,
} from '../types/plugin';
import type { PluginWindowSnapshot } from '../types/window';
import type { PluginInstanceStore } from './plugin-instance-store';
import type { PluginWindowAdapter } from './plugin-window-adapter';

export interface PluginInstanceRuntimeOptions {
  store: PluginInstanceStore;
  windowAdapter: PluginWindowAdapter;
}

export interface PluginInstanceRuntimeResult {
  instance: PluginInstance;
  window?: PluginWindowSnapshot;
}

export async function enablePluginInstanceOnDesktop(
  id: PluginInstanceId,
  options: PluginInstanceRuntimeOptions,
): Promise<PluginInstanceRuntimeResult> {
  const instance = await options.store.enable(id);
  const window = await options.windowAdapter.create({
    instanceId: instance.id,
    config: instance.config,
  });
  return { instance, window };
}

export async function disablePluginInstanceOnDesktop(
  id: PluginInstanceId,
  options: PluginInstanceRuntimeOptions,
): Promise<PluginInstanceRuntimeResult> {
  const instance = await options.store.disable(id);
  await options.windowAdapter.close(id);
  return { instance };
}

export async function hidePluginInstanceOnDesktop(
  id: PluginInstanceId,
  options: PluginInstanceRuntimeOptions,
): Promise<PluginInstanceRuntimeResult> {
  const instance = await options.store.hide(id);
  await options.windowAdapter.close(id);
  return { instance };
}

export async function deletePluginInstanceOnDesktop(
  id: PluginInstanceId,
  options: PluginInstanceRuntimeOptions,
): Promise<void> {
  await options.windowAdapter.close(id);
  await options.store.deleteInstance(id);
}

export async function updatePluginInstanceConfigOnDesktop(
  id: PluginInstanceId,
  config: PluginInstanceConfigInput,
  options: PluginInstanceRuntimeOptions,
): Promise<PluginInstanceRuntimeResult> {
  const instance = await options.store.updateConfig(id, config);
  if (instance.lifecycleState !== 'enabled') {
    return { instance };
  }
  const window = await options.windowAdapter.update({
    instanceId: instance.id,
    config: instance.config,
  });
  return { instance, window };
}
