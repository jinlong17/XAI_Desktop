import { ResponsiveLayout } from "../components/ResponsiveLayout";
import { WebLayout } from "../components/WebLayout";
import { createTauriCapabilityStub } from "../lib/tauriCapabilityStub";

export default async function ConsolePage() {
  const capability = createTauriCapabilityStub();
  const commandStatus = await capability.invoke("organize_desktop", { dryRun: true });

  return (
    <WebLayout active="console">
      <ResponsiveLayout>
        <section className="workspace-panel todo-list">
          <div className="section-heading">
            <p className="eyebrow">Today</p>
            <h2>Todo list</h2>
          </div>
          {["Review widget prototype", "Draft privacy gate notes", "Check web fallback copy"].map((item, index) => (
            <label key={item} className="task-row">
              <input type="checkbox" defaultChecked={index === 0} />
              <span>{item}</span>
            </label>
          ))}
        </section>
        <section className="workspace-panel project-board">
          <div className="section-heading">
            <p className="eyebrow">Projects</p>
            <h2>Board</h2>
          </div>
          <div className="board-columns">
            {["Scaffold", "Review", "Blocked"].map((column) => (
              <div key={column} className="board-column">
                <strong>{column}</strong>
                <span>{column === "Blocked" ? "No hard blockers" : "Mock card ready"}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="workspace-panel settings-preview">
          <div className="section-heading">
            <p className="eyebrow">Capability</p>
            <h2>Desktop command fallback</h2>
          </div>
          <p>{commandStatus.message}</p>
          <small>{commandStatus.available ? "available" : "degraded"}</small>
        </section>
      </ResponsiveLayout>
    </WebLayout>
  );
}
