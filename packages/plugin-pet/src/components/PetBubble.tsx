import type { PetReminder } from "../types";

export function PetBubble({ reminder, onDismiss }: { reminder?: PetReminder; onDismiss(): void }) {
  if (!reminder || reminder.dismissed) {
    return null;
  }
  return (
    <div style={{ maxWidth: 260, padding: 12, borderRadius: 10, background: "#ffffff", border: "1px solid #cbd5e1", boxShadow: "0 12px 24px rgba(15,23,42,0.16)" }}>
      <p style={{ margin: 0 }}>{reminder.message}</p>
      <button type="button" onClick={onDismiss} style={{ marginTop: 8 }}>
        Hide
      </button>
    </div>
  );
}
