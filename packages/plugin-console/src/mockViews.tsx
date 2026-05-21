import type { ConsoleViewProps } from "@repo/core/types";

function MockView({
  title,
  copy,
  props,
}: {
  title: string;
  copy: string;
  props: ConsoleViewProps;
}) {
  return (
    <section style={{ display: "grid", gap: 12 }}>
      <header style={{ display: "grid", gap: 2 }}>
        <h2 style={{ fontSize: 20, margin: 0 }}>{title}</h2>
        <p style={{ color: "#6b7280", margin: 0 }}>{copy}</p>
      </header>
      <dl style={{ display: "grid", gap: 8, margin: 0 }}>
        <div style={{ alignItems: "center", display: "flex", gap: 8 }}>
          <dt style={{ color: "#6b7280", minWidth: 120 }}>Module</dt>
          <dd style={{ margin: 0 }}>{props.moduleId}</dd>
        </div>
        <div style={{ alignItems: "center", display: "flex", gap: 8 }}>
          <dt style={{ color: "#6b7280", minWidth: 120 }}>Active Query</dt>
          <dd style={{ margin: 0 }}>{props.query || "—"}</dd>
        </div>
        <div style={{ alignItems: "center", display: "flex", gap: 8 }}>
          <dt style={{ color: "#6b7280", minWidth: 120 }}>Selection Keys</dt>
          <dd style={{ margin: 0 }}>
            {Object.keys(props.selection).length ? Object.keys(props.selection).join(", ") : "—"}
          </dd>
        </div>
      </dl>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => props.capabilities.requestReconcile("mock-view-action")}
          type="button"
        >
          Request Reconcile
        </button>
        <button
          onClick={() => props.capabilities.openCommandPalette()}
          type="button"
        >
          Open Cmd+K
        </button>
      </div>
    </section>
  );
}

export function TasksConsoleView(props: ConsoleViewProps) {
  return (
    <MockView
      copy="Contract mock view. Real tasks integration is Phase 3 and remains authority-gated."
      props={props}
      title="Tasks"
    />
  );
}

export function PomodoroConsoleView(props: ConsoleViewProps) {
  return (
    <MockView
      copy="Contract mock view. Real pomodoro integration is Phase 3 and remains authority-gated."
      props={props}
      title="Pomodoro"
    />
  );
}

export function HabitsConsoleView(props: ConsoleViewProps) {
  return (
    <MockView
      copy="Contract mock view. Real habits integration is Phase 3 and remains authority-gated."
      props={props}
      title="Habits"
    />
  );
}

export function MatrixConsoleView(props: ConsoleViewProps) {
  return (
    <MockView
      copy="Contract mock view. Real matrix integration is Phase 3 and remains authority-gated."
      props={props}
      title="Matrix"
    />
  );
}

export function LabelsConsoleView(props: ConsoleViewProps) {
  return (
    <MockView
      copy="Contract mock view. Real labels integration is Phase 4 and remains authority-gated."
      props={props}
      title="Labels"
    />
  );
}
