import { PluginRegistry } from "@repo/core/registry";
import type { PluginManifest } from "@repo/core/types";
import manifestJson from "../manifest.json";

const consoleManifest = manifestJson as PluginManifest;

export function registerConsolePlugin(): void {
  PluginRegistry.register(consoleManifest, {});
}
