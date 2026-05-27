import "./App.css";

function App() {
  return (
    <main className="app-shell">
      <section
        style={{
          margin: "40px auto",
          maxWidth: 560,
          padding: 24,
          borderRadius: 16,
          background: "rgba(15, 23, 42, 0.78)",
          border: "1px solid rgba(148, 163, 184, 0.35)",
          color: "#e2e8f0",
          backdropFilter: "blur(8px)",
        }}
      >
        <h1 style={{ margin: "0 0 12px", fontSize: 22 }}>Legacy Desktop Fallback</h1>
        <p style={{ margin: 0, lineHeight: 1.6 }}>
          The Phase 1 desktop runtime is now served from <code>apps/web</code>. This React shell is
          intentionally kept as a non-overlay fallback only.
        </p>
      </section>
    </main>
  );
}

export default App;
