export function InputBar({ value, onChange, onSend }: { value: string; onChange(value: string): void; onSend(): void }) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSend();
      }}
      style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}
    >
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder="Ask AI Cube" style={{ minHeight: 38, borderRadius: 8, border: "1px solid #cbd5e1", padding: "0 10px" }} />
      <button type="submit">Send</button>
    </form>
  );
}
