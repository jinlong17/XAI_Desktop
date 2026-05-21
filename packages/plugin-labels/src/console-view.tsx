import type { ConsoleViewProps, ConsoleViewRegistration } from "@repo/core/types";
import { useEffect, useState } from "react";
import { LabelRepoProvider } from "./data/RepoProvider";
import { LabelStoreProvider, useLabelStore } from "./hooks/useLabelStore";
import { LabelBadge } from "./components/LabelBadge";
import { LabelPicker } from "./components/LabelPicker";

function useConsoleShortcuts(props: ConsoleViewProps): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        props.capabilities.openCommandPalette(props.query);
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "r") {
        event.preventDefault();
        void props.capabilities.requestReconcile("labels-console-shortcut");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [props]);
}

function LabelsConsoleContent({ props }: { props: ConsoleViewProps }) {
  const { labels } = useLabelStore();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useConsoleShortcuts(props);

  const selectedLabels = selectedIds
    .map((id) => labels.find((label) => label.id === id))
    .filter((label): label is (typeof labels)[number] => Boolean(label));

  return (
    <section style={{ display: "grid", gap: 12 }}>
      <header style={{ alignItems: "center", display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "space-between" }}>
        <div>
          <h2 style={{ margin: 0 }}>Labels</h2>
          <p style={{ color: "#6b7280", margin: "4px 0 0" }}>
            Cross-module label management with Console keyboard flows.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => props.capabilities.openCommandPalette(props.query)} type="button">Cmd+K</button>
          <button onClick={() => props.capabilities.navigate({ moduleId: "settings", listId: "shortcuts" })} type="button">Settings</button>
          <button onClick={() => void props.capabilities.requestReconcile("labels-console-action")} type="button">Reconcile</button>
        </div>
      </header>

      <LabelPicker
        allowCreate
        onChange={(next) => {
          setSelectedIds(next);
          void props.capabilities.persistState({
            moduleId: "labels",
            listId: next[0],
            detailId: next.join(","),
          });
        }}
        placeholder="Search or create labels"
        selectedIds={selectedIds}
      />

      <section style={{ display: "grid", gap: 8 }}>
        <strong>Selected labels</strong>
        {selectedLabels.length ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {selectedLabels.map((label) => (
              <LabelBadge key={label.id} label={label} />
            ))}
          </div>
        ) : (
          <small style={{ color: "#6b7280" }}>No labels selected yet.</small>
        )}
      </section>
    </section>
  );
}

export function LabelsConsoleView(props: ConsoleViewProps) {
  return (
    <LabelRepoProvider>
      <LabelStoreProvider>
        <LabelsConsoleContent props={props} />
      </LabelStoreProvider>
    </LabelRepoProvider>
  );
}

export const labelsConsoleViews: ConsoleViewRegistration[] = [
  {
    moduleId: "labels",
    sidebar: {
      id: "labels",
      label: "Labels",
      icon: "tag",
      order: 60,
      group: "labels",
      enabled: true,
      placeholder: false,
      moduleId: "labels",
    },
    render: LabelsConsoleView,
  },
];
