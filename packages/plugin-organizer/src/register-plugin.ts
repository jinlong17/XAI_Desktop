import { PluginRegistry } from "@repo/core/registry";
import type { PluginManifest } from "@repo/core/types";
import manifestJson from "../manifest.json";

const organizerManifest = manifestJson as PluginManifest;

export function registerOrganizerPlugin(): void {
  PluginRegistry.register(organizerManifest, {});
}
