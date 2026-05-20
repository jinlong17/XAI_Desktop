import { useMemo, useState, type FormEvent } from "react";
import { useClipboardStore } from "../hooks/useClipboardStore";
import type { ClipboardEntryType } from "../types";
import { ClipboardPrivacy } from "./ClipboardPrivacy";

const filterOptions: Array<ClipboardEntryType | "all"> = ["all", "text", "url", "code", "image", "file"];

export function ClipboardList() {
  const { entries, addMockEntry, deleteEntry, renderContent, togglePinned } = useClipboardStore();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ClipboardEntryType | "all">("all");
  const [draft, setDraft] = useState("");

  const visibleEntries = useMemo(() => {
    const lower = query.toLowerCase();
    return entries.filter((entry) => {
      const typeMatch = filter === "all" || entry.type === filter;
      const queryMatch = !lower || entry.content.toLowerCase().includes(lower) || entry.source?.toLowerCase().includes(lower);
      return typeMatch && queryMatch;
    });
  }, [entries, filter, query]);

  const addEntry = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.trim()) return;
    void addMockEntry({ content: draft, source: "manual" });
    setDraft("");
  };

  return (
    <section style={{ display: "grid", gap: 12 }}>
      <form onSubmit={addEntry} style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <input
          aria-label="Mock clipboard input"
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Paste mock content"
          style={{ border: "1px solid #d1d5db", borderRadius: 8, flex: "1 1 240px", minHeight: 36, padding: "0 10px" }}
          value={draft}
        />
        <button type="submit">Capture</button>
      </form>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <input
          aria-label="Search clipboard history"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search history"
          style={{ border: "1px solid #d1d5db", borderRadius: 8, flex: "1 1 200px", minHeight: 34, padding: "0 10px" }}
          value={query}
        />
        <select
          aria-label="Clipboard type filter"
          onChange={(event) => setFilter(event.target.value as ClipboardEntryType | "all")}
          style={{ border: "1px solid #d1d5db", borderRadius: 8, minHeight: 34, padding: "0 8px" }}
          value={filter}
        >
          {filterOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {visibleEntries.map((entry) => {
          const content = renderContent(entry);
          return (
            <article
              key={entry.id}
              style={{
                background: entry.pinned ? "#fffbeb" : "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                display: "grid",
                gap: 8,
                padding: 10,
              }}
            >
              <header style={{ alignItems: "center", color: "#6b7280", display: "flex", fontSize: 12, gap: 8 }}>
                <strong style={{ color: "#111827" }}>{entry.type}</strong>
                {entry.source ? <span>{entry.source}</span> : null}
                <time dateTime={entry.createdAt}>{new Date(entry.createdAt).toLocaleString()}</time>
                <button onClick={() => void togglePinned(entry.id)} style={{ marginLeft: "auto" }} type="button">
                  {entry.pinned ? "Unpin" : "Pin"}
                </button>
                <button onClick={() => void deleteEntry(entry.id)} type="button">Delete</button>
              </header>
              {entry.type === "url" ? (
                <a href={content} rel="noopener noreferrer" target="_blank">
                  {content}
                </a>
              ) : (
                <pre style={{ margin: 0, overflow: "auto", whiteSpace: "pre-wrap" }}>{content}</pre>
              )}
            </article>
          );
        })}
      </div>
      <ClipboardPrivacy />
    </section>
  );
}
