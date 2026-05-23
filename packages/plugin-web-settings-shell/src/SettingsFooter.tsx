/**
 * <SettingsFooter> — Save & apply (1800ms flash) + Reset to defaults (confirm).
 *
 * Models the footer block from web design/module-settings.jsx line 635-650
 * with two upgrades over the source:
 *   - Save broadcasts WebPreferenceChange[] via the typed event bus.
 *   - Reset to defaults wraps `resetAllPrefs()` (or a caller-provided override)
 *     in a confirmation dialog.
 *
 * API contract: packages/xai-web-settings-shell/docs/api.md §2.3
 */

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { useI18n } from "@repo/plugin-web-tokens";
import { emitWebEvent } from "@repo/xai-web-event-bus";
import type { SettingsFooterProps } from "./types.js";
import { confirmAction } from "./internal/confirmAction.js";
import { resetAllPrefs } from "./internal/resetAllPrefs.js";

const SAVE_FLASH_MS = 1800;

export function SettingsFooter({
  onSave,
  onReset,
  lang,
}: SettingsFooterProps): React.ReactElement {
  const { s } = useI18n(lang);
  const [saved, setSaved] = useState(false);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear any pending flash on unmount.
  useEffect(() => {
    return () => {
      if (flashTimer.current !== null) {
        clearTimeout(flashTimer.current);
      }
    };
  }, []);

  const handleSave = (): void => {
    const changes = onSave();
    if (!Array.isArray(changes)) {
      if (
        typeof import.meta !== "undefined" &&
        (import.meta as { env?: { DEV?: boolean } }).env?.DEV
      ) {
        console.warn(
          "[SettingsFooter] onSave must return WebPreferenceChange[]; got",
          changes,
        );
      }
      return;
    }
    const changedAt = new Date().toISOString();
    for (const change of changes) {
      // Per-key narrowing through the discriminated union (matches the bus
      // payload type exactly per key).
      if (change.key === "theme") {
        emitWebEvent("web:settings:preference-changed", { ...change, changedAt });
      } else if (change.key === "density") {
        emitWebEvent("web:settings:preference-changed", { ...change, changedAt });
      } else if (change.key === "fontScale") {
        emitWebEvent("web:settings:preference-changed", { ...change, changedAt });
      } else if (change.key === "accentHue") {
        emitWebEvent("web:settings:preference-changed", { ...change, changedAt });
      } else if (change.key === "railPos") {
        emitWebEvent("web:settings:preference-changed", { ...change, changedAt });
      } else if (change.key === "bgTone") {
        emitWebEvent("web:settings:preference-changed", { ...change, changedAt });
      } else if (change.key === "lang") {
        emitWebEvent("web:settings:preference-changed", { ...change, changedAt });
      }
    }
    setSaved(true);
    if (flashTimer.current !== null) {
      clearTimeout(flashTimer.current);
    }
    flashTimer.current = setTimeout(() => {
      setSaved(false);
      flashTimer.current = null;
    }, SAVE_FLASH_MS);
  };

  const handleReset = (): void => {
    const message =
      lang === "zh"
        ? "确定恢复所有设置为默认值？这会清除保存的主题、布局和模块开关。"
        : "Reset every preference to defaults? This clears saved theme, layout, and module toggles.";
    if (!confirmAction(message)) return;
    if (onReset !== undefined) {
      onReset();
    } else {
      resetAllPrefs();
    }
  };

  const resetLabel = lang === "zh" ? "恢复默认" : "Reset to defaults";
  const savedLabel = s("common.done"); // bundle has "common.done" = Done / 完成 but we want Saved label
  // Use direct bilingual strings to match source line 647-648 exactly.
  const savedText = lang === "zh" ? "已保存" : "Saved";
  const saveText = lang === "zh" ? "保存生效" : "Save & apply";

  // Silence the unused `savedLabel` variable — it is intentionally kept for
  // potential future i18n bundle promotion of "settings.saved".
  void savedLabel;

  return (
    <div className="pane-footer">
      <button
        type="button"
        className="btn ghost"
        onClick={handleReset}
        data-testid="settings-footer-reset"
      >
        {resetLabel}
      </button>
      <button
        type="button"
        className={"btn primary pane-save" + (saved ? " is-saved" : "")}
        onClick={handleSave}
        data-testid="settings-footer-save"
      >
        {saved ? savedText : saveText}
      </button>
    </div>
  );
}
