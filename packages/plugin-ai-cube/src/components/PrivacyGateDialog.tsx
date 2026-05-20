"use client";

import type { PrivacyReview } from "../types";

export function PrivacyGateDialog({ review, onApprove, onCancel }: { review?: PrivacyReview; onApprove(): void; onCancel(): void }) {
  if (!review) {
    return null;
  }
  return (
    <div role="dialog" aria-modal="true" style={{ position: "fixed", inset: 0, display: "grid", placeItems: "center", background: "rgba(15,23,42,0.36)", zIndex: 20 }}>
      <section style={{ width: "min(440px, calc(100vw - 32px))", padding: 18, borderRadius: 12, background: "#ffffff", color: "#172033" }}>
        <h2 style={{ marginTop: 0 }}>Pre-send review (mock)</h2>
        <p>{review.scope}</p>
        <strong>Data types</strong>
        <ul>
          {review.dataTypes.map((type) => (
            <li key={type}>{type}</li>
          ))}
        </ul>
        {review.secretsDetected.length > 0 ? (
          <p>Redaction will mask: {review.secretsDetected.join(", ")}</p>
        ) : (
          <p>No mock secrets matched these patterns. This is a best-effort heuristic, not a guarantee.</p>
        )}
        <div style={{ display: "flex", justifyContent: "end", gap: 8 }}>
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" onClick={onApprove}>
            Send mock request
          </button>
        </div>
      </section>
    </div>
  );
}
