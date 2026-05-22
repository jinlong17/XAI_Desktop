export interface ModuleRoutePlaceholderPageProps {
  moduleId: string;
  childPath: string;
}

export function ModuleRoutePlaceholderPage({ moduleId, childPath }: ModuleRoutePlaceholderPageProps) {
  return (
    <section>
      <h2>{moduleId}</h2>
      <p>Module route: /app/{moduleId}/{childPath || "(index)"}</p>
      <p>This module remains placeholder-mounted in W6.</p>
    </section>
  );
}
