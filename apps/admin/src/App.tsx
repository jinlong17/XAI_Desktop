/**
 * apps/admin App root — Phase 1 scaffold stub.
 *
 * Phase 1: scaffold + deploy boundary only (no pages, no guard yet).
 * Phase 2 will wire AdminRouteGate + router.
 * Phase 3 will add typed adapters.
 * Phase 4 will port the 10 pages.
 */
import React from "react";

export default function App(): React.ReactElement {
  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        padding: "2rem",
        maxWidth: "640px",
        margin: "0 auto",
      }}
    >
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
        XAI Admin Dashboard
      </h1>
      <p style={{ color: "#666" }}>
        Shell scaffold — Phase 1. Guard and pages wired in Phase 2+.
      </p>
      <p style={{ fontSize: "0.75rem", color: "#999", marginTop: "1rem" }}>
        Isolated surface · Independent CSP/deploy boundary · mock-authenticated posture
      </p>
    </div>
  );
}
