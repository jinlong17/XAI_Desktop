import { useEffect, useState, type FormEvent } from "react";
import { useProjectStore } from "../hooks/useProjectStore";
import type { Card, ChecklistItem } from "../types";

export interface CardDetailProps {
  card: Card;
}

export function CardDetail({ card }: CardDetailProps) {
  const { updateCard, updateChecklist } = useProjectStore();
  const [checkText, setCheckText] = useState("");
  const [titleDraft, setTitleDraft] = useState(card.title);
  const [descDraft, setDescDraft] = useState(card.description ?? "");

  useEffect(() => {
    setTitleDraft(card.title);
  }, [card.id, card.title]);

  useEffect(() => {
    setDescDraft(card.description ?? "");
  }, [card.id, card.description]);

  const addChecklistItem = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!checkText.trim()) return;
    const item: ChecklistItem = {
      id: `check-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      text: checkText.trim(),
      done: false,
    };
    void updateChecklist(card.id, [...card.checklist, item]);
    setCheckText("");
  };

  return (
    <section style={{ border: "1px solid #e5e7eb", borderRadius: 8, display: "grid", gap: 12, padding: 12 }}>
      <input
        aria-label="Card title"
        onBlur={() => {
          const next = titleDraft.trim();
          if (next && next !== card.title) void updateCard(card.id, { title: next });
        }}
        onChange={(event) => setTitleDraft(event.target.value)}
        style={{ border: "1px solid #d1d5db", borderRadius: 8, fontSize: 18, fontWeight: 700, minHeight: 38, padding: "0 10px" }}
        value={titleDraft}
      />
      <textarea
        aria-label="Card description"
        onBlur={() => {
          if (descDraft !== (card.description ?? "")) void updateCard(card.id, { description: descDraft });
        }}
        onChange={(event) => setDescDraft(event.target.value)}
        placeholder="Description"
        style={{ border: "1px solid #d1d5db", borderRadius: 8, minHeight: 100, padding: 10, resize: "vertical" }}
        value={descDraft}
      />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {card.labels.map((label) => (
          <span key={label} style={{ background: "#eef2ff", borderRadius: 6, color: "#3730a3", padding: "4px 6px" }}>
            {label}
          </span>
        ))}
        {card.dueDate ? <time dateTime={card.dueDate}>Due {card.dueDate}</time> : null}
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        <strong>Checklist</strong>
        {card.checklist.map((item) => (
          <label key={item.id} style={{ alignItems: "center", display: "flex", gap: 8 }}>
            <input
              checked={item.done}
              onChange={(event) =>
                void updateChecklist(
                  card.id,
                  card.checklist.map((current) =>
                    current.id === item.id ? { ...current, done: event.target.checked } : current,
                  ),
                )
              }
              type="checkbox"
            />
            <span style={{ textDecoration: item.done ? "line-through" : "none" }}>{item.text}</span>
          </label>
        ))}
        <form onSubmit={addChecklistItem} style={{ display: "flex", gap: 8 }}>
          <input
            aria-label="Checklist item"
            onChange={(event) => setCheckText(event.target.value)}
            placeholder="Add checklist item"
            style={{ border: "1px solid #d1d5db", borderRadius: 8, flex: 1, minHeight: 34, padding: "0 8px" }}
            value={checkText}
          />
          <button type="submit">Add</button>
        </form>
      </div>
    </section>
  );
}
