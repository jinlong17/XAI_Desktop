/**
 * <Toggle> atom — verbatim TSX port of web design/module-settings.jsx line 1053-1058.
 *
 * API contract: packages/xai-web-settings-shell/docs/api.md §2.2
 */

import * as React from "react";
import type { ToggleProps } from "./types.js";

export function Toggle({ on, onChange, ariaLabel }: ToggleProps): React.ReactElement {
  const className = "toggle" + (on ? " on" : "");
  return (
    <button
      className={className}
      onClick={() => onChange()}
      role="switch"
      aria-checked={on}
      aria-label={ariaLabel}
      type="button"
    >
      <span className="toggle-knob" />
    </button>
  );
}
