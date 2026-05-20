import type { WidgetDefinition, WidgetManifestRegistration } from "./types";

export class WidgetRegistry {
  private readonly definitions = new Map<string, WidgetDefinition>();

  register(definition: WidgetDefinition): void {
    this.definitions.set(definition.type, definition);
  }

  registerManifest(manifest: WidgetManifestRegistration): void {
    for (const definition of manifest.widgets) {
      this.register(definition);
    }
  }

  get(type: string): WidgetDefinition | undefined {
    return this.definitions.get(type);
  }

  list(): WidgetDefinition[] {
    return [...this.definitions.values()];
  }
}

export function createWidgetRegistry(registrations: readonly WidgetManifestRegistration[] = []): WidgetRegistry {
  const registry = new WidgetRegistry();
  for (const registration of registrations) {
    registry.registerManifest(registration);
  }
  return registry;
}
