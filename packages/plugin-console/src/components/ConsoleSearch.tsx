export interface ConsoleSearchProps {
  onOpenPalette?: () => void;
  placeholder?: string;
}

export function ConsoleSearch({ onOpenPalette, placeholder = "Search... (Cmd+K)" }: ConsoleSearchProps) {
  return (
    <button
      aria-label="Open command palette"
      onClick={() => onOpenPalette?.()}
      onFocus={() => onOpenPalette?.()}
      style={{
        background: "#ffffff",
        border: "1px solid #d1d5db",
        borderRadius: 8,
        cursor: "text",
        minHeight: 36,
        minWidth: 220,
        padding: "0 10px",
        textAlign: "left",
      }}
      type="button"
    >
      <span style={{ color: "#9ca3af" }}>{placeholder}</span>
    </button>
  );
}
