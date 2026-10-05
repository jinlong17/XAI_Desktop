/**
 * @internal — the Topbar status for unsaved Appearance changes (CP-APPEARANCE-01).
 *
 * The host passes it through the shell's optional `appearanceStatus` slot,
 * which the Topbar renders immediately after `premiumBadge`. It is a view of
 * the App-scoped controller and renders nothing (no DOM node) unless at least
 * one field has a settled unsuccessful draft (E is non-empty): a field that is
 * only pending does not render it. Activation calls the host's review
 * callback exactly once; it never touches storage, never retries and offers no
 * Retry all.
 *
 * Contract: docs/reviews/web-appearance-recovery-contract/contract.md §7 item 2.
 */

import * as React from "react";
import type { AppearanceStatusProps } from "../types.js";
import { AppearanceControllerContext } from "./appearanceController.js";
import { appearanceRecoveryCopy } from "./appearanceRecoveryCopy.js";

export function AppearanceStatus({ onReview }: AppearanceStatusProps): React.ReactElement | null {
  const controller = React.useContext(AppearanceControllerContext);
  if (controller === null || controller.unsavedCount === 0) return null;
  const copy = appearanceRecoveryCopy(controller.values.lang);
  return (
    <button
      type="button"
      className="appearance-status"
      data-testid="appearance-status"
      aria-label={copy.statusName}
      onClick={() => onReview()}
    >
      <svg
        className="appearance-status-icon"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7.5v5.5M12 16.5v.01" />
      </svg>
      <span className="appearance-status-text">{copy.statusText}</span>
    </button>
  );
}
