import { createPluginCenterEntry, PluginRegistry } from "@repo/core/registry";
import type {
  PluginCenterEntry,
  PluginCenterEntryStatus,
  PluginManifest,
} from "@repo/core/types";

const BUILT_IN_PLUGIN_ORDER = [
  "organizer",
  "widgets",
  "clipboard",
  "calendar",
  "pet",
] as const;

const STATUS_BY_PLUGIN_NAME: Record<string, PluginCenterEntryStatus> = {
  organizer: "available",
  widgets: "planned",
  clipboard: "planned",
  calendar: "planned",
  pet: "planned",
};

const UNAVAILABLE_REASON_BY_PLUGIN_NAME: Record<string, string> = {
  widgets: "Waiting for generic instance management.",
  clipboard: "Waiting for privacy and permission gates.",
  calendar: "Waiting for calendar provider and glance contracts.",
  pet: "Waiting for native overlay behavior controls.",
};

const DEFAULT_CONTENT_TYPE_BY_PLUGIN_NAME: Record<string, string> = {
  organizer: "normal-window-organizer",
};

const PLANNED_MANIFESTS: PluginManifest[] = [
  {
    name: "widgets",
    version: "0.1.0",
    displayName: "Desktop Widgets",
    description:
      "Widget host, built-in time progress widgets, habit stats, and personalization tokens.",
    author: "Jinlong",
    enabled: false,
    contentTypes: ["widget"],
    windows: {
      overlay: true,
      control: true,
    },
    events: {
      emit: ["widgets:changed", "widgets:preference-updated"],
      listen: ["calendar:events-changed", "pet:ai-suggestion"],
    },
    dependencies: ["@repo/core-data"],
    tauriCommands: [],
  },
  {
    name: "clipboard",
    version: "0.1.0",
    displayName: "Clipboard",
    description:
      "Local clipboard history, privacy rules, paste queue, and OCR preview contract.",
    author: "Jinlong",
    enabled: false,
    contentTypes: ["clipboard-entry", "paste-queue", "ocr-preview"],
    windows: {
      control: true,
    },
    events: {
      emit: [
        "clipboard:entry-created",
        "clipboard:entry-deleted",
        "clipboard:paste-queued",
        "clipboard:ocr-requested",
      ],
      listen: [],
    },
    dependencies: [],
    tauriCommands: [],
  },
  {
    name: "calendar",
    version: "0.1.0",
    displayName: "Calendar",
    description:
      "Month mini view and day timeline using mock aggregated events.",
    author: "Jinlong",
    enabled: false,
    contentTypes: ["calendar-event"],
    windows: {
      control: true,
    },
    events: {
      emit: ["calendar:events-changed"],
      listen: ["productivity:todo-changed", "project:milestone-changed"],
    },
    dependencies: ["@repo/core-data", "@repo/plugin-widgets"],
    tauriCommands: [],
  },
  {
    name: "pet",
    version: "0.1.0",
    displayName: "Desktop Pet",
    description:
      "Basic desktop pet presence, lightweight status, and non-intrusive reminder surface.",
    author: "Jinlong",
    enabled: false,
    contentTypes: ["pet"],
    windows: {
      overlay: true,
      control: true,
    },
    events: {
      emit: ["pet:state-changed", "pet:ai-suggestion"],
      listen: ["ai-cube:mock-action"],
    },
    dependencies: ["@repo/core-data"],
    tauriCommands: [],
  },
];

function sortBuiltInEntries(entries: PluginCenterEntry[]): PluginCenterEntry[] {
  const order = new Map<string, number>(
    BUILT_IN_PLUGIN_ORDER.map((name, index) => [name, index]),
  );
  return [...entries].sort((a, b) => {
    const aIndex = order.get(a.pluginName) ?? Number.MAX_SAFE_INTEGER;
    const bIndex = order.get(b.pluginName) ?? Number.MAX_SAFE_INTEGER;
    return aIndex - bIndex || a.displayName.localeCompare(b.displayName);
  });
}

export function getBuiltInPluginCenterEntries(): PluginCenterEntry[] {
  const entriesByName = new Map<string, PluginCenterEntry>();

  for (const entry of PluginRegistry.getPluginCenterEntries({
    statusByPluginName: STATUS_BY_PLUGIN_NAME,
    defaultContentTypeByPluginName: DEFAULT_CONTENT_TYPE_BY_PLUGIN_NAME,
    unavailableReasonByPluginName: UNAVAILABLE_REASON_BY_PLUGIN_NAME,
  })) {
    if (
      BUILT_IN_PLUGIN_ORDER.includes(
        entry.pluginName as (typeof BUILT_IN_PLUGIN_ORDER)[number],
      )
    ) {
      entriesByName.set(entry.pluginName, entry);
    }
  }

  for (const manifest of PLANNED_MANIFESTS) {
    if (entriesByName.has(manifest.name)) continue;
    entriesByName.set(
      manifest.name,
      createPluginCenterEntry(
        { manifest, components: {} },
        {
          status: STATUS_BY_PLUGIN_NAME[manifest.name],
          unavailableReason: UNAVAILABLE_REASON_BY_PLUGIN_NAME[manifest.name],
        },
      ),
    );
  }

  return sortBuiltInEntries([...entriesByName.values()]);
}
