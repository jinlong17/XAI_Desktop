import { usePomodoroStore } from "../hooks/usePomodoroStore";
import { useTodoStore } from "../hooks/useTodoStore";
import type { Todo, TodoQuadrant } from "../types";
import { TodoItem } from "./TodoItem";

const quadrantMeta: Array<{ id: TodoQuadrant; title: string; hint: string; color: string }> = [
  { id: "do", title: "Do", hint: "Urgent + important", color: "#fee2e2" },
  { id: "schedule", title: "Schedule", hint: "Important", color: "#dcfce7" },
  { id: "delegate", title: "Delegate", hint: "Urgent", color: "#e0f2fe" },
  { id: "eliminate", title: "Eliminate", hint: "Low leverage", color: "#f3f4f6" },
];

function byQuadrant(todos: Todo[], quadrant: TodoQuadrant): Todo[] {
  return todos.filter((todo) => todo.quadrant === quadrant && todo.status !== "archived");
}

export function EisenhowerMatrix() {
  const { todos, moveToQuadrant, setStatus } = useTodoStore();
  const pomodoro = usePomodoroStore();

  return (
    <section
      aria-label="Eisenhower matrix"
      style={{
        display: "grid",
        gap: 10,
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
      }}
    >
      {quadrantMeta.map((quadrant) => (
        <div
          key={quadrant.id}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            const todoId = event.dataTransfer.getData("text/plain");
            if (todoId) void moveToQuadrant(todoId, quadrant.id);
          }}
          style={{ background: quadrant.color, borderRadius: 8, display: "grid", gap: 8, minHeight: 220, padding: 10 }}
        >
          <header>
            <strong>{quadrant.title}</strong>
            <span style={{ color: "#6b7280", display: "block", fontSize: 12 }}>{quadrant.hint}</span>
          </header>
          {byQuadrant(todos, quadrant.id).map((todo) => (
            <div
              draggable
              key={todo.id}
              onDragStart={(event) => event.dataTransfer.setData("text/plain", todo.id)}
            >
              <TodoItem
                onSelect={pomodoro.selectTodo}
                onStartPomodoro={(todoId) => pomodoro.start(todoId)}
                onToggle={(todoId) => {
                  void setStatus(todoId, todo.status === "done" ? "open" : "done");
                }}
                selected={pomodoro.activeTodoId === todo.id}
                todo={todo}
              />
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}
