/**
 * <SettingRow> atom — verbatim TSX port of web design/module-settings.jsx line 1039-1048.
 *
 * API contract: packages/xai-web-settings-shell/docs/api.md §2.2
 */

import * as React from "react";
import type { SettingRowProps } from "./types.js";

export function SettingRow({
  label,
  desc,
  children,
  style,
}: SettingRowProps): React.ReactElement {
  return (
    <div className="setting-row" style={style}>
      <div className="sr-text">
        <div className="sr-label">{label}</div>
        {desc !== undefined && desc !== "" ? (
          <div className="sr-desc">{desc}</div>
        ) : null}
      </div>
      <div className="sr-ctrl">{children}</div>
    </div>
  );
}
