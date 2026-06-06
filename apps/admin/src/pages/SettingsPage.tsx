/**
 * Settings (系统设置) — org info + security/webhook toggles (read this slice).
 * Reads through `settingsAdapter` (../adapters). No inline mock data.
 * Toggles are local display state only — no production write this slice.
 */
import { useState } from "react";
import { settingsAdapter } from "../adapters";
import { Panel } from "../components/primitives";

export function SettingsPage(): React.ReactElement {
  const settings = settingsAdapter.read();
  const [toggles, setToggles] = useState(() =>
    Object.fromEntries(settings.toggles.map((t) => [t.key, t.enabled])),
  );

  return (
    <div className="page page--settings">
      <Panel title="组织信息">
        <dl className="kv">
          <div>
            <dt>组织名称</dt>
            <dd>{settings.orgName}</dd>
          </div>
          <div>
            <dt>支持邮箱</dt>
            <dd>{settings.supportEmail}</dd>
          </div>
        </dl>
      </Panel>

      <Panel title="安全与通知">
        <div className="setting-list">
          {settings.toggles.map((t) => (
            <div className="setting-row" key={t.key}>
              <div>
                <div className="nm">{t.label}</div>
                <div className="em">{t.description}</div>
              </div>
              <button
                type="button"
                className={`toggle ${toggles[t.key] ? "on" : ""}`}
                aria-label={`${t.label} 开关`}
                aria-pressed={toggles[t.key]}
                onClick={() => setToggles((prev) => ({ ...prev, [t.key]: !prev[t.key] }))}
              >
                <span className="toggle-knob" />
              </button>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
