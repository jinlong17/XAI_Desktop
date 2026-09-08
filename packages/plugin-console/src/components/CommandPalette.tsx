import { useEffect, useRef, type KeyboardEvent } from "react";
import { useCommandPalette, type CommandPaletteController, type UseCommandPaletteOptions } from "../hooks/useCommandPalette";
import { SearchResult } from "./SearchResult";

export interface CommandPaletteProps extends UseCommandPaletteOptions {
  controller?: CommandPaletteController;
  placeholder?: string;
}

export function CommandPalette({ controller, placeholder = "Search labels, tasks, habits, clips, projects", ...options }: CommandPaletteProps) {
  if (controller) return <CommandPaletteContent palette={controller} placeholder={placeholder} />;
  return <CommandPaletteWithHook options={options} placeholder={placeholder} />;
}

function CommandPaletteWithHook({
  options,
  placeholder,
}: {
  options: UseCommandPaletteOptions;
  placeholder: string;
}) {
  const palette = useCommandPalette(options);
  return <CommandPaletteContent palette={palette} placeholder={placeholder} />;
}

function CommandPaletteContent({
  palette,
  placeholder,
}: {
  palette: CommandPaletteController;
  placeholder: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (palette.isOpen) inputRef.current?.focus();
  }, [palette.isOpen]);

  if (!palette.isOpen) return null;

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      palette.setActiveIndex(Math.min(palette.activeIndex + 1, Math.max(palette.results.length - 1, 0)));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      palette.setActiveIndex(Math.max(palette.activeIndex - 1, 0));
    }
    if (event.key === "Enter") {
      const active = palette.results[palette.activeIndex];
      if (active) palette.execute(active);
    }
  };

  return (
    <div
      aria-modal="true"
      role="dialog"
      style={{
        background: "rgba(17,24,39,0.36)",
        inset: 0,
        paddingTop: "12vh",
        position: "fixed",
        zIndex: 50,
      }}
    >
      <section
        style={{
          background: "#ffffff",
          borderRadius: 8,
          boxShadow: "0 24px 80px rgba(0,0,0,0.22)",
          display: "grid",
          gap: 8,
          margin: "0 auto",
          maxWidth: 680,
          padding: 10,
          width: "calc(100% - 32px)",
        }}
      >
        <input
          aria-label="Command palette search"
          onChange={(event) => palette.setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          ref={inputRef}
          style={{ border: "1px solid #d1d5db", borderRadius: 8, fontSize: 16, minHeight: 44, padding: "0 12px" }}
          value={palette.query}
        />
        <div role="listbox" style={{ display: "grid", gap: 4, maxHeight: 420, overflow: "auto" }}>
          {palette.results.map((result, index) => (
            <SearchResult
              active={index === palette.activeIndex}
              key={result.id}
              onExecute={palette.execute}
              result={result}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
