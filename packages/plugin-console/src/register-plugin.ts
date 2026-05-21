import { PluginRegistry } from "@repo/core/registry";
import type { ConsoleViewRegistration, PluginManifest } from "@repo/core/types";
import {
  HabitsConsoleView,
  LabelsConsoleView,
  MatrixConsoleView,
  PomodoroConsoleView,
  TasksConsoleView,
} from "./mockViews";

const consoleManifest: PluginManifest = {
  name: "console",
  version: "0.1.0",
  displayName: "控制台",
  description:
    "Productivity console shell with three-pane layout and contract-mock ConsoleViews.",
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
          id: "tasks",
          label: "Tasks",
          icon: "check-square",
          order: 20,
          group: "productivity",
          enabled: true,
          placeholder: true,
          moduleId: "tasks",
        },
        {
          id: "pomodoro",
          label: "Pomodoro",
          icon: "timer",
          order: 30,
          group: "productivity",
          enabled: true,
          placeholder: true,
          moduleId: "pomodoro",
        },
        {
          id: "habits",
          label: "Habits",
          icon: "repeat",
          order: 40,
          group: "productivity",
          enabled: true,
          placeholder: true,
          moduleId: "habits",
        },
        {
          id: "matrix",
          label: "Matrix",
          icon: "grid",
          order: 50,
          group: "productivity",
          enabled: true,
          placeholder: true,
          moduleId: "matrix",
        },
        {
          id: "labels",
          label: "Labels",
          icon: "tag",
          order: 60,
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
    moduleId: "tasks",
    sidebar: {
      id: "tasks",
      label: "Tasks",
      icon: "check-square",
      order: 20,
      group: "productivity",
      enabled: true,
      placeholder: true,
      moduleId: "tasks",
    },
    render: TasksConsoleView,
  },
  {
    moduleId: "pomodoro",
    sidebar: {
      id: "pomodoro",
      label: "Pomodoro",
      icon: "timer",
      order: 30,
      group: "productivity",
      enabled: true,
      placeholder: true,
      moduleId: "pomodoro",
    },
    render: PomodoroConsoleView,
  },
  {
    moduleId: "habits",
    sidebar: {
      id: "habits",
      label: "Habits",
      icon: "repeat",
      order: 40,
      group: "productivity",
      enabled: true,
      placeholder: true,
      moduleId: "habits",
    },
    render: HabitsConsoleView,
  },
  {
    moduleId: "matrix",
    sidebar: {
      id: "matrix",
      label: "Matrix",
      icon: "grid",
      order: 50,
      group: "productivity",
      enabled: true,
      placeholder: true,
      moduleId: "matrix",
    },
    render: MatrixConsoleView,
  },
  {
    moduleId: "labels",
    sidebar: {
      id: "labels",
      label: "Labels",
      icon: "tag",
      order: 60,
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
