import { useEffect } from "react";
import { useClipboardStore } from "../hooks/useClipboardStore";
import { usePasteQueue } from "../hooks/usePasteQueue";

export function PasteQueue() {
  const { entries, renderContent } = useClipboardStore();
  const queue = usePasteQueue({
    entries,
    onPaste: async () => {
      await Promise.resolve();
    },
  });

  useEffect(() => {
    if (queue.status !== "running" || !queue.currentEntry) return undefined;
    const timer = window.setTimeout(() => {
      void queue.pasteCurrent();
    }, 450);
    return () => window.clearTimeout(timer);
  }, [queue, queue.currentEntry, queue.status]);

  return (
    <section aria-label="Sequential paste queue" style={{ border: "1px solid #e5e7eb", borderRadius: 8, display: "grid", gap: 12, padding: 12 }}>
      <header style={{ alignItems: "center", display: "flex", gap: 8, justifyContent: "space-between" }}>
        <strong>Paste Queue</strong>
        <span style={{ color: "#6b7280", fontSize: 12 }}>{queue.status}</span>
      </header>
      <div style={{ display: "grid", gap: 6, maxHeight: 220, overflow: "auto" }}>
        {entries.map((entry) => (
          <label key={entry.id} style={{ alignItems: "center", display: "flex", gap: 8 }}>
            <input
              checked={queue.entryIds.includes(entry.id)}
              onChange={() => queue.toggleEntry(entry.id)}
              type="checkbox"
            />
            <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{renderContent(entry)}</span>
          </label>
        ))}
      </div>
      <div style={{ background: "#f9fafb", borderRadius: 8, minHeight: 74, padding: 10 }}>
        <span style={{ color: "#6b7280", display: "block", fontSize: 12 }}>Current</span>
        <strong>{queue.currentEntry ? renderContent(queue.currentEntry) : "No entry selected"}</strong>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <button onClick={queue.start} type="button">Start</button>
        <button onClick={() => void queue.pasteCurrent()} type="button">Paste current</button>
        <button onClick={queue.pause} type="button">Pause</button>
        <button onClick={queue.reset} type="button">Reset</button>
      </div>
    </section>
  );
}
