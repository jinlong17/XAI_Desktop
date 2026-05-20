import { useState, type FormEvent } from "react";
import { useClipboardStore } from "../hooks/useClipboardStore";

export function ClipboardPrivacy() {
  const { privacy, updatePrivacy, clearUnpinned } = useClipboardStore();
  const [pattern, setPattern] = useState("");

  const addPattern = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!pattern.trim()) return;
    updatePrivacy({ redactPatterns: [...privacy.redactPatterns, pattern.trim()] });
    setPattern("");
  };

  return (
    <section
      aria-label="Clipboard privacy controls"
      style={{ border: "1px solid #e5e7eb", borderRadius: 8, display: "grid", gap: 12, padding: 12 }}
    >
      <label style={{ alignItems: "center", display: "flex", gap: 8 }}>
        <input
          checked={privacy.redactEnabled}
          onChange={(event) => updatePrivacy({ redactEnabled: event.target.checked })}
          type="checkbox"
        />
        Redact sensitive patterns
      </label>
      <form onSubmit={addPattern} style={{ display: "flex", gap: 8 }}>
        <input
          aria-label="Redaction pattern"
          onChange={(event) => setPattern(event.target.value)}
          placeholder="Regex pattern"
          style={{ border: "1px solid #d1d5db", borderRadius: 8, flex: 1, minHeight: 34, padding: "0 8px" }}
          value={pattern}
        />
        <button type="submit">Add</button>
      </form>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {privacy.redactPatterns.map((item) => (
          <button
            key={item}
            onClick={() => updatePrivacy({ redactPatterns: privacy.redactPatterns.filter((patternItem) => patternItem !== item) })}
            style={{ border: "1px solid #d1d5db", borderRadius: 6, cursor: "pointer", padding: "4px 6px" }}
            type="button"
          >
            {item}
          </button>
        ))}
      </div>
      <label style={{ display: "grid", gap: 4 }}>
        <span>Auto-clear unpinned entries</span>
        <select
          onChange={(event) => updatePrivacy({ autoClearMinutes: event.target.value ? Number(event.target.value) : null })}
          style={{ border: "1px solid #d1d5db", borderRadius: 8, minHeight: 34, padding: "0 8px" }}
          value={privacy.autoClearMinutes ?? ""}
        >
          <option value="">Off</option>
          <option value="5">5 minutes</option>
          <option value="30">30 minutes</option>
          <option value="120">2 hours</option>
        </select>
      </label>
      <button
        onClick={() => {
          void clearUnpinned();
        }}
        type="button"
      >
        Clear unpinned
      </button>
    </section>
  );
}
