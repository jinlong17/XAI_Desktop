import { PluginRegistry } from "@repo/core/registry";
import type { PluginManifest } from "@repo/core/types";
import { labelsConsoleViews } from "./console-view";
import manifestJson from "../manifest.json";

const labelsManifest = manifestJson as PluginManifest;

export function registerLabelsPlugin(): void {
  PluginRegistry.register(labelsManifest, {
    ConsoleViews: labelsConsoleViews,
  });
}
