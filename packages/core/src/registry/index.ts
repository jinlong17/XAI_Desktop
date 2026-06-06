export { PluginRegistry } from './plugin-registry';
export { OverlayHost, ControlHost } from './plugin-host';
export {
  createAddToDesktopRequest,
  createPluginCenterEntries,
  createPluginCenterEntry,
  createPluginInstanceConfig,
  createPluginInstance,
  getPluginSupportedSurfaces,
} from './plugin-center';
export { addPluginCenterEntryToDesktop } from './plugin-center-runtime';
export {
  deletePluginInstanceOnDesktop,
  disablePluginInstanceOnDesktop,
  enablePluginInstanceOnDesktop,
  hidePluginInstanceOnDesktop,
  restoreEnabledPluginInstancesOnDesktop,
  updatePluginInstanceConfigOnDesktop,
} from './plugin-instance-runtime';
export {
  PLUGIN_INSTANCE_STORE_KEY,
  PLUGIN_INSTANCE_STORE_SCHEMA_VERSION,
  createPluginInstanceStore,
  createWebStoragePluginInstanceAdapter,
  migratePluginInstanceStoreSnapshot,
} from './plugin-instance-store';
export {
  createPluginWindowAdapter,
  gridIdToPluginInstanceId,
  gridSnapshotToPluginWindowSnapshot,
  normalizeCommandError,
  pluginInstanceConfigToGridRect,
  pluginInstanceIdToGridId,
} from './plugin-window-adapter';
export type {
  CreateAddToDesktopRequestOptions,
  CreatePluginCenterEntriesOptions,
  CreatePluginCenterEntryOptions,
  CreatePluginInstanceOptions,
} from './plugin-center';
export type {
  AddPluginCenterEntryToDesktopOptions,
  AddPluginCenterEntryToDesktopResult,
} from './plugin-center-runtime';
export type {
  PluginInstanceRuntimeOptions,
  PluginInstanceRuntimeResult,
  PluginInstanceRestoreResult,
} from './plugin-instance-runtime';
export type {
  CreatePluginInstanceStoreOptions,
  PluginInstancePersistenceAdapter,
  PluginInstanceStorageLike,
  PluginInstanceStore,
  PluginInstanceStoreSnapshot,
} from './plugin-instance-store';
export type {
  PluginWindowAdapter,
  PluginWindowAdapterOptions,
  PluginWindowCommand,
  PluginWindowCommandInvoker,
} from './plugin-window-adapter';
