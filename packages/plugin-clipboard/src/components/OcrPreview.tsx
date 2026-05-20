import { useMemo, useState } from "react";
import type { ClipboardEntry, OcrResult } from "../types";

export interface OcrPreviewProps {
  entry: ClipboardEntry;
  initialResult?: OcrResult;
}

function mockRecognize(entry: ClipboardEntry): OcrResult {
  const text = entry.content.includes("task-list")
    ? "Review roadmap\nAdd console search\nPrepare notification mock"
    : `Recognized text from ${entry.content}`;
  return {
    entryId: entry.id,
    status: "ready",
    text,
    confidence: 0.82,
    engine: "mock",
    blocks: text.split("\n").map((line, index) => ({
      id: `${entry.id}-block-${index}`,
      text: line,
      confidence: 0.8,
      bounds: { x: 12, y: 18 + index * 24, width: 220, height: 18 },
    })),
  };
}

export function OcrPreview({ entry, initialResult }: OcrPreviewProps) {
  const [result, setResult] = useState<OcrResult | null>(initialResult ?? null);
  const placeholder = useMemo(() => mockRecognize(entry), [entry]);

  if (entry.type !== "image") {
    return (
      <section style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 12 }}>
        OCR preview requires an image clipboard entry.
      </section>
    );
  }

  const activeResult = result ?? { ...placeholder, status: "idle" as const, text: "", blocks: [] };

  return (
    <section aria-label="OCR preview" style={{ border: "1px solid #e5e7eb", borderRadius: 8, display: "grid", gap: 12, padding: 12 }}>
      <header style={{ alignItems: "center", display: "flex", justifyContent: "space-between" }}>
        <strong>OCR Preview</strong>
        <span style={{ color: "#6b7280", fontSize: 12 }}>{activeResult.engine} · {activeResult.status}</span>
      </header>
      <div style={{ background: "#111827", borderRadius: 8, color: "#ffffff", minHeight: 140, padding: 12 }}>
        <span style={{ color: "#d1d5db", display: "block", fontSize: 12 }}>Image source</span>
        <strong>{entry.content}</strong>
      </div>
      <button onClick={() => setResult(placeholder)} type="button">Run mock OCR</button>
      <textarea
        aria-label="Recognized OCR text"
        readOnly
        style={{ border: "1px solid #d1d5db", borderRadius: 8, minHeight: 110, padding: 10, resize: "vertical" }}
        value={activeResult.text}
      />
      <div style={{ display: "grid", gap: 6 }}>
        {activeResult.blocks.map((block) => (
          <div key={block.id} style={{ background: "#f9fafb", borderRadius: 6, padding: 8 }}>
            <strong>{block.text}</strong>
            <span style={{ color: "#6b7280", display: "block", fontSize: 12 }}>
              confidence {Math.round(block.confidence * 100)}% · x{block.bounds.x} y{block.bounds.y}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
