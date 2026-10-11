/**
 * @internal — the pane-local bottom action area of Settings → Appearance
 * (CP-APPEARANCE-01, contract A2.1–A2.9).
 *
 * In normal flow at the end of `.appearance-pane`, start-aligned and wrapping
 * (never sticky or fixed, and none of the shared settings footer's classes):
 *   1. the pane status line (`role="status"`, always rendered, empty when
 *      nothing applies);
 *   2. the recovery action group: Retry all first, at the inline start, then
 *      Export and Discard all (rendered only while drafts exist);
 *   3. Reset to defaults, at the inline start of its own line.
 *
 * Retry all is always rendered. It is enabled if and only if E is non-empty;
 * otherwise it carries `aria-disabled="true"` — never the native `disabled`
 * attribute — so it stays a focusable Tab stop and focus never drops to
 * `<body>` when a pass disables it. Its label never changes, and it is
 * described by the status line only while it is enabled or a pass is open.
 * Activation always delegates to the controller, which derives E live and is
 * inert when E is empty.
 */

import * as React from "react";
import type { AppearanceController, AppearanceStatusLine } from "../types.js";
import type { AppearanceRecoveryCopy } from "./appearanceRecoveryCopy.js";

export interface AppearanceActionsProps {
  readonly controller: AppearanceController;
  readonly copy: AppearanceRecoveryCopy;
  readonly resetRef: React.Ref<HTMLButtonElement>;
  readonly onDiscardAll: () => void;
  readonly onReset: () => void;
}

function statusText(line: AppearanceStatusLine, copy: AppearanceRecoveryCopy): string {
  switch (line.kind) {
    case "retrying": return copy.retrying;
    case "export-failed": return copy.exportFailed;
    case "not-saved": return copy.notSavedCount(line.count);
    case "saved": return copy.saved;
    case "restored": return copy.restored;
    case "none": return "";
  }
}

export function AppearanceActions({ controller, copy, resetRef, onDiscardAll, onReset }: AppearanceActionsProps): React.ReactElement {
  const statusId = React.useId();
  const enabled = controller.retryAllEnabled;
  const described = enabled || controller.passOpen;
  return (
    <div className="appearance-actions">
      <p className="appearance-status-line" role="status" data-testid="appearance-status-line" id={statusId}>
        {statusText(controller.statusLine, copy)}
      </p>
      <div className="appearance-actions-row">
        <button
          type="button"
          className="btn primary appearance-retry-all"
          data-testid="appearance-retry-all"
          aria-disabled={enabled ? undefined : "true"}
          aria-describedby={described ? statusId : undefined}
          onClick={() => controller.retryAll()}
        >
          {copy.retryAll}
        </button>
        {controller.hasDraft && (
          <button
            type="button"
            className="btn ghost"
            data-testid="appearance-export-draft"
            onClick={() => controller.exportDraft()}
          >
            {copy.exportDraft}
          </button>
        )}
        {controller.hasDraft && (
          <button type="button" className="btn ghost" data-testid="appearance-discard-all" onClick={onDiscardAll}>
            {copy.discardAll}
          </button>
        )}
      </div>
      <div className="appearance-actions-row">
        <button
          ref={resetRef}
          type="button"
          className="btn ghost appearance-reset"
          data-testid="appearance-reset-defaults"
          onClick={onReset}
        >
          {copy.reset}
        </button>
      </div>
    </div>
  );
}
