const sections = [
  { id: "plugins", title: "Plugins", body: "Enablement and ordering controls are pending host integration." },
  { id: "search", title: "Search", body: "Repository-backed indexing will replace local mock filtering." },
  { id: "privacy", title: "Privacy", body: "Clipboard redaction and local retention settings surface here." },
  { id: "desktop", title: "Desktop", body: "Desktop bridge actions use mock events until Track A contracts land." },
];

export function ConsoleSettings() {
  return (
    <section style={{ display: "grid", gap: 10 }}>
      {sections.map((section) => (
        <article key={section.id} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 12 }}>
          <strong>{section.title}</strong>
          <p style={{ color: "#6b7280", margin: "6px 0 0" }}>{section.body}</p>
        </article>
      ))}
    </section>
  );
}
