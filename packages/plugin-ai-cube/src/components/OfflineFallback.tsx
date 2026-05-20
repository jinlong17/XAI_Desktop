export function OfflineFallback({ active }: { active: boolean }) {
  if (!active) {
    return null;
  }
  return <p style={{ padding: 10, borderRadius: 8, background: "#fef3c7", color: "#92400e" }}>Offline mode: responses use cached local fallback text.</p>;
}
