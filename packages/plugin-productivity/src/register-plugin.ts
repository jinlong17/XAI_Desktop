import { PluginRegistry } from "@repo/core/registry";
import type { PluginManifest } from "@repo/core/types";
import { productivityConsoleViews } from "./console-views";
import manifestJson from "../manifest.json";

const productivityManifest = manifestJson as PluginManifest;

export function registerProductivityPlugin(): void {
  PluginRegistry.register(productivityManifest, {
    ConsoleViews: productivityConsoleViews,
  });
}
