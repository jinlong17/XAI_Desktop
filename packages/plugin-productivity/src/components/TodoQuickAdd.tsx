import { useState, type FormEvent } from "react";
import { autoAssignQuadrant, useTodoStore } from "../hooks/useTodoStore";

export function TodoQuickAdd() {
  const { createTodo } = useTodoStore();
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const previewQuadrant = title.trim() ? autoAssignQuadrant(title, dueDate || undefined) : null;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) return;
    void createTodo({ title, dueDate: dueDate || undefined });
    setTitle("");
    setDueDate("");
  };

  return (
    <form onSubmit={submit} style={{ alignItems: "center", display: "flex", flexWrap: "wrap", gap: 8 }}>
      <input
        aria-label="Todo title"
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Add task"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-1)",
          borderRadius: 8,
          color: "var(--text-1)",
          flex: "1 1 220px",
          minHeight: 36,
          padding: "0 10px",
        }}
        value={title}
      />
      <input
        aria-label="Due date"
        onChange={(event) => setDueDate(event.target.value)}
        style={{ background: "var(--bg-panel)", border: "1px solid var(--border-1)", borderRadius: 8, color: "var(--text-1)", minHeight: 36, padding: "0 10px" }}
        type="date"
        value={dueDate}
      />
      <span style={{ color: "var(--text-2)", fontSize: 12, minWidth: 86 }}>{previewQuadrant ?? "auto"}</span>
      <button
        style={{
          background: "var(--accent)",
          border: 0,
          borderRadius: 8,
          color: "var(--text-on-accent)",
          cursor: "pointer",
          fontWeight: 700,
          minHeight: 36,
          padding: "0 12px",
        }}
        type="submit"
      >
        Add
      </button>
    </form>
  );
}
