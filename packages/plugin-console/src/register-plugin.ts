import { PluginRegistry } from "@repo/core/registry";
import type { ConsoleViewRegistration, PluginManifest } from "@repo/core/types";
import { LabelsConsoleView } from "./mockViews";

const consoleManifest: PluginManifest = {
  name: "console",
  version: "0.1.0",
  displayName: "控制台",
  description:
    "Productivity console shell with three-pane layout and staged ConsoleView integration.",
  author: "Jinlong",
  enabled: true,
  contentTypes: ["console-shell", "console-view-slot", "console-search", "notification"],
  windows: {
    console: true,
  },
  ui: {
    consoleSidebar: {
      entries: [
        {
          id: "labels",
          label: "Labels",
          icon: "tag",
          order: 80,
          group: "labels",
          enabled: true,
          placeholder: true,
          moduleId: "labels",
        },
      ],
    },
  },
  events: {
    emit: [
      "console:navigate-module",
      "console:sidebar-toggled",
      "console:search-opened",
      "console:detail-selection-changed",
      "console:reconcile-requested",
      "console:ack-applied",
    ],
    listen: ["account:sync-started", "account:sync-completed", "account:sync-failed"],
  },
  dependencies: ["@repo/core", "@repo/core-data"],
  tauriCommands: [
    "open_console_window",
    "close_console_window",
    "focus_console_window",
    "get_console_window_frame",
    "set_console_window_frame",
  ],
};

const consoleViews: ConsoleViewRegistration[] = [
  {
    moduleId: "labels",
    sidebar: {
      id: "labels",
      label: "Labels",
      icon: "tag",
      order: 80,
      group: "labels",
      enabled: true,
      placeholder: true,
      moduleId: "labels",
    },
    render: LabelsConsoleView,
  },
];

export function registerConsolePlugin(): void {
  PluginRegistry.register(consoleManifest, {
    ConsoleViews: consoleViews,
  });
}
