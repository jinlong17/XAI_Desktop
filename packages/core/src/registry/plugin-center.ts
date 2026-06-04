import type {
  AddToDesktopRequest,
  ContentType,
  PluginCenterEntry,
  PluginCenterEntryStatus,
  PluginInstance,
  PluginInstanceBehavior,
  PluginInstanceConfig,
  PluginInstanceId,
  PluginInstancePlacement,
  PluginInstanceSize,
  PluginInstanceStyle,
  PluginManifest,
  PluginRegistration,
  PluginWindowSurface,
} from '../types/plugin';

const DEFAULT_SIZE: PluginInstanceSize = {
  preset: 'medium',
  width: 320,
  height: 240,
};

const DEFAULT_PLACEMENT: PluginInstancePlacement = {
  x: 80,
  y: 80,
};

const DEFAULT_BEHAVIOR: PluginInstanceBehavior = {
  pinned: false,
  clickThrough: false,
  allSpaces: false,
  clickAction: 'focus',
};

const DEFAULT_STYLE: PluginInstanceStyle = {
  mode: 'system',
  opacity: 1,
};

export interface CreatePluginCenterEntryOptions {
  status?: PluginCenterEntryStatus;
  defaultContentType?: ContentType;
  unavailableReason?: string;
}

export interface CreateAddToDesktopRequestOptions {
  contentType?: ContentType;
  source?: AddToDesktopRequest['source'];
  config?: Partial<PluginInstanceConfig>;
}

export interface CreatePluginInstanceOptions {
  id: PluginInstanceId;
  now: string;
  schemaVersion?: number;
  lifecycleState?: PluginInstance['lifecycleState'];
}

export function getPluginSupportedSurfaces(manifest: PluginManifest): PluginWindowSurface[] {
  return (['overlay', 'control', 'grid', 'console'] as const).filter(
    (surface) => manifest.windows[surface],
  );
}

export function createPluginCenterEntry(
  registration: PluginRegistration,
  options: CreatePluginCenterEntryOptions = {},
): PluginCenterEntry {
  const { manifest } = registration;
  const status = options.status ?? (manifest.enabled ? 'available' : 'disabled');
  const defaultContentType = options.defaultContentType ?? manifest.contentTypes[0];
  const canAddToDesktop = manifest.enabled && (status === 'available' || status === 'shipped');

  return {
    pluginName: manifest.name,
    displayName: manifest.displayName,
    description: manifest.description,
    version: manifest.version,
    status,
    enabledByManifest: manifest.enabled,
    contentTypes: [...manifest.contentTypes],
    supportedSurfaces: getPluginSupportedSurfaces(manifest),
    defaultContentType,
    canAddToDesktop,
    canOpenSettings: Boolean(registration.components.SettingsPanel),
    unavailableReason: options.unavailableReason,
  };
}

export function createAddToDesktopRequest(
  entry: PluginCenterEntry,
  options: CreateAddToDesktopRequestOptions = {},
): AddToDesktopRequest {
  const contentType = options.contentType ?? entry.defaultContentType;
  if (!contentType) {
    throw new Error(`Plugin ${entry.pluginName} does not declare a desktop content type`);
  }

  return {
    pluginName: entry.pluginName,
    contentType,
    source: options.source ?? 'plugin-center',
    config: mergePluginInstanceConfig(options.config),
  };
}

export function createPluginInstance(
  request: AddToDesktopRequest,
  options: CreatePluginInstanceOptions,
): PluginInstance {
  return {
    id: options.id,
    pluginName: request.pluginName,
    contentType: request.contentType,
    schemaVersion: options.schemaVersion ?? 1,
    lifecycleState: options.lifecycleState ?? 'enabled',
    syncScope: 'device-local',
    config: mergePluginInstanceConfig(request.config),
    createdAt: options.now,
    updatedAt: options.now,
  };
}

function mergePluginInstanceConfig(
  config: Partial<PluginInstanceConfig> = {},
): PluginInstanceConfig {
  return {
    placement: {
      ...DEFAULT_PLACEMENT,
      ...config.placement,
    },
    size: {
      ...DEFAULT_SIZE,
      ...config.size,
    },
    behavior: {
      ...DEFAULT_BEHAVIOR,
      ...config.behavior,
    },
    style: {
      ...DEFAULT_STYLE,
      ...config.style,
    },
    dataSource: config.dataSource,
  };
}
