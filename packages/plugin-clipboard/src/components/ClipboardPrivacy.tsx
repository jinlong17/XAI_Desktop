import { useState, type FormEvent } from "react";
import { useClipboardStore } from "../hooks/useClipboardStore";

export function ClipboardPrivacy() {
  const { privacy, updatePrivacy, clearUnpinned } = useClipboardStore();
  const [pattern, setPattern] = useState("");
  const [confirmingRedaction, setConfirmingRedaction] = useState(false);
  const [understandsIrreversibility, setUnderstandsIrreversibility] = useState(false);

  const addPattern = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!pattern.trim()) return;
    updatePrivacy({ redactPatterns: [...privacy.redactPatterns, pattern.trim()] });
    setPattern("");
  };

  const toggleRedaction = (enabled: boolean) => {
    if (enabled && !privacy.acknowledgedRedactIrreversibility) {
      setUnderstandsIrreversibility(false);
      setConfirmingRedaction(true);
      return;
    }
    updatePrivacy({ redactEnabled: enabled });
  };

  return (
    <section
      aria-label="Clipboard privacy controls"
      style={{ border: "1px solid #e5e7eb", borderRadius: 8, display: "grid", gap: 12, padding: 12 }}
    >
      <label style={{ alignItems: "center", display: "flex", gap: 8 }}>
        <input
          checked={privacy.redactEnabled}
          onChange={(event) => toggleRedaction(event.target.checked)}
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
      {confirmingRedaction ? (
        <div
          aria-modal="true"
          role="dialog"
          style={{
            alignItems: "center",
            background: "rgba(17, 24, 39, 0.35)",
            display: "flex",
            inset: 0,
            justifyContent: "center",
            padding: 16,
            position: "fixed",
            zIndex: 20,
          }}
        >
          <div style={{ background: "#ffffff", borderRadius: 8, display: "grid", gap: 12, maxWidth: 420, padding: 16 }}>
            <strong>Enable redaction</strong>
            <p style={{ margin: 0 }}>
              Enabling redaction will rewrite all stored clipboard content matching the configured patterns. Original values cannot be
              recovered.
            </p>
            <label style={{ alignItems: "center", display: "flex", gap: 8 }}>
              <input
                checked={understandsIrreversibility}
                onChange={(event) => setUnderstandsIrreversibility(event.target.checked)}
                type="checkbox"
              />
              I understand
            </label>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                onClick={() => {
                  setConfirmingRedaction(false);
                  setUnderstandsIrreversibility(false);
                }}
                type="button"
              >
                Cancel
              </button>
              <button
                disabled={!understandsIrreversibility}
                onClick={() => {
                  updatePrivacy({ redactEnabled: true, acknowledgedRedactIrreversibility: true });
                  setConfirmingRedaction(false);
                  setUnderstandsIrreversibility(false);
                }}
                type="button"
              >
                Enable redaction
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
