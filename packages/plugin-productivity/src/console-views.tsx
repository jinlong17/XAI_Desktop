import type { ConsoleViewDefinition, ConsoleViewProps } from "@repo/core/types";
import { useEffect, type ReactNode } from "react";
import { ProductivityRepoProvider } from "./data/RepoProvider";
import { HabitStoreProvider } from "./hooks/useHabitStore";
import { PomodoroStoreProvider } from "./hooks/usePomodoroStore";
import { TodoStoreProvider } from "./hooks/useTodoStore";
import { HabitList } from "./components/HabitList";
import { PomodoroTimer } from "./components/PomodoroTimer";
import { EisenhowerMatrix } from "./components/EisenhowerMatrix";
import { TodoList } from "./components/TodoList";

function useConsoleShortcuts(props: ConsoleViewProps, reason: string): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        props.capabilities.openCommandPalette(props.query);
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "r") {
        event.preventDefault();
        void props.capabilities.requestReconcile(reason);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [props, reason]);
}

function ProductivityConsoleSection({
  title,
  subtitle,
  props,
  children,
}: {
  title: string;
  subtitle: string;
  props: ConsoleViewProps;
  children: ReactNode;
}) {
  useConsoleShortcuts(props, `productivity-${props.moduleId}`);

  return (
    <section style={{ display: "grid", gap: 12 }}>
      <header style={{ alignItems: "center", display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "space-between" }}>
        <div>
          <h2 style={{ margin: 0 }}>{title}</h2>
          <p style={{ color: "#6b7280", margin: "4px 0 0" }}>{subtitle}</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => props.capabilities.openCommandPalette(props.query)} type="button">Cmd+K</button>
          <button onClick={() => void props.capabilities.requestReconcile(`manual-${props.moduleId}`)} type="button">Reconcile</button>
        </div>
      </header>
      {children}
    </section>
  );
}

function ProductivityConsoleProviders({ children }: { children: ReactNode }) {
  return (
    <ProductivityRepoProvider>
      <TodoStoreProvider>
        <PomodoroStoreProvider>
          <HabitStoreProvider>{children}</HabitStoreProvider>
        </PomodoroStoreProvider>
      </TodoStoreProvider>
    </ProductivityRepoProvider>
  );
}

export function TasksConsoleView(props: ConsoleViewProps) {
  return (
    <ProductivityConsoleProviders>
      <ProductivityConsoleSection
        props={props}
        subtitle="Keyboard-first task capture and status updates."
        title="Tasks"
      >
        <TodoList />
      </ProductivityConsoleSection>
    </ProductivityConsoleProviders>
  );
}

export function PomodoroConsoleView(props: ConsoleViewProps) {
  return (
    <ProductivityConsoleProviders>
      <ProductivityConsoleSection
        props={props}
        subtitle="Timer session controls with active task binding."
        title="Pomodoro"
      >
        <PomodoroTimer />
      </ProductivityConsoleSection>
    </ProductivityConsoleProviders>
  );
}

export function HabitsConsoleView(props: ConsoleViewProps) {
  return (
    <ProductivityConsoleProviders>
      <ProductivityConsoleSection
        props={props}
        subtitle="Habit streak check-ins with frequency tracking."
        title="Habits"
      >
        <HabitList />
      </ProductivityConsoleSection>
    </ProductivityConsoleProviders>
  );
}

export function MatrixConsoleView(props: ConsoleViewProps) {
  return (
    <ProductivityConsoleProviders>
      <ProductivityConsoleSection
        props={props}
        subtitle="Drag todos across quadrants and run focused execution."
        title="Matrix"
      >
        <EisenhowerMatrix />
      </ProductivityConsoleSection>
    </ProductivityConsoleProviders>
  );
}

export const productivityConsoleViews: ConsoleViewDefinition[] = [
  {
    moduleId: "tasks",
    render: TasksConsoleView,
  },
  {
    moduleId: "pomodoro",
    render: PomodoroConsoleView,
  },
  {
    moduleId: "habits",
    render: HabitsConsoleView,
  },
  {
    moduleId: "matrix",
    render: MatrixConsoleView,
  },
];
