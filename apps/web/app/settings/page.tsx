import { WebLayout } from "../components/WebLayout";

export default function SettingsPage() {
  return (
    <WebLayout active="settings">
      <section className="settings-grid">
        <div className="workspace-panel">
          <h2>Sync</h2>
          <p>Offline-first writes use IndexedDB and queue mock remote blob sync.</p>
          <label className="switch-row">
            <input type="checkbox" defaultChecked />
            <span>Enable mock remote sync</span>
          </label>
        </div>
        <div className="workspace-panel">
          <h2>Security</h2>
          <p>CSP middleware and security headers are active.</p>
          <label className="switch-row">
            <input type="checkbox" defaultChecked />
            <span>Enable local rate limit guard</span>
          </label>
        </div>
      </section>
    </WebLayout>
  );
}
