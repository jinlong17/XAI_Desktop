import type {
  PluginCenterEntry,
  PluginInstance,
  PluginInstanceConfigInput,
} from '../types/plugin';
import type { PluginWindowSnapshot } from '../types/window';
import { createAddToDesktopRequest } from './plugin-center';
import type { PluginInstanceStore } from './plugin-instance-store';
import type { PluginWindowAdapter } from './plugin-window-adapter';

export interface AddPluginCenterEntryToDesktopOptions {
  store: PluginInstanceStore;
  windowAdapter: PluginWindowAdapter;
  config?: PluginInstanceConfigInput;
}

export interface AddPluginCenterEntryToDesktopResult {
  instance: PluginInstance;
  window: PluginWindowSnapshot;
}

export async function addPluginCenterEntryToDesktop(
  entry: PluginCenterEntry,
  options: AddPluginCenterEntryToDesktopOptions,
): Promise<AddPluginCenterEntryToDesktopResult> {
  if (!entry.canAddToDesktop) {
    throw new Error(`Plugin ${entry.pluginName} is not addable from Plugin Center`);
  }

  const request = createAddToDesktopRequest(entry, {
    config: options.config,
  });
  const instance = await options.store.create(request);
  const window = await options.windowAdapter.create({
    instanceId: instance.id,
    config: instance.config,
  });

  return {
    instance,
    window,
  };
}
