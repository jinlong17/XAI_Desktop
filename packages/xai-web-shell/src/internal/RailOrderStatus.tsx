/**
 * @internal — the Topbar status and panel for the sidebar (rail) order
 * (CP-APPRAIL-01, contract A8 and §7 item 2).
 *
 * The host passes it through the shell's optional `railOrderStatus` slot,
 * which the Topbar renders immediately after `appearanceStatus`. It is a view
 * of the provided rail-order controller and renders nothing (no DOM node)
 * unless (a) the current draft has been settled unsuccessful at least once —
 * it stays while a Retry of that draft is pending — or (b) no draft exists and
 * the stored order is invalid or unreadable.
 *
 * When rendered it is one root element (`.rail-order-status`) holding a native
 * disclosure button and, while open, a non-modal labelled panel after it in
 * DOM order: Retry, Discard and Export for a draft; Reload only for a source
 * issue. Escape closes the panel and returns focus to the button; a mousedown
 * outside the root closes it (focus moves to the button only if it was inside
 * the panel). When the status unmounts while it contains focus, focus moves to
 * `.topbar-pref-trigger`, never to `<body>`. The status never navigates and
 * never retries by itself; it touches storage only through its actions.
 */

import * as React from "react";
import { RailOrderControllerContext } from "./railOrderController.js";
import { railOrderCopy } from "./railOrderCopy.js";

const PANEL_ID = "rail-order-panel";

/** Focus bookkeeping across a commit that removes the focused control. */
interface FocusMemo {
  /** Focus was inside the status root when the last render started. */
  inside: boolean;
  /** The Topbar that held the status root, kept to reach `.topbar-pref-trigger` after unmount. */
  topbar: Element | null;
}

function activeElement(): Element | null {
  return typeof document === "undefined" ? null : document.activeElement;
}

/** True when focus has been lost (on `<body>`, nowhere, or on a detached node). */
function focusLost(): boolean {
  const active = activeElement();
  return active === null || active === document.body || !active.isConnected;
}

/** `<RailOrderStatus />` takes no props (`RailOrderStatusProps`); it reads the provided controller. */
export function RailOrderStatus(): React.ReactElement | null {
  const controller = React.useContext(RailOrderControllerContext);
  const kind = controller?.statusKind ?? null;
  const visible = kind !== null;
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const [memo] = React.useState<FocusMemo>(() => ({ inside: false, topbar: null }));

  // Before this render's commit changes the DOM, remember whether it held focus.
  const root = rootRef.current;
  if (root !== null) {
    const active = activeElement();
    memo.inside = active !== null && root.contains(active);
    memo.topbar = root.closest(".topbar");
  }

  // A hidden status never stays open; it opens closed when it renders again.
  if (!visible && open) setOpen(false);

  React.useLayoutEffect(() => {
    if (!memo.inside) return;
    if (!visible) {
      // The status unmounted while it held focus: never leave focus on <body>.
      memo.inside = false;
      const trigger = memo.topbar?.querySelector<HTMLElement>(".topbar-pref-trigger")
        ?? document.querySelector<HTMLElement>(".topbar .topbar-pref-trigger");
      trigger?.focus();
      return;
    }
    // The status stayed but the focused control went away (for example Discard
    // over an unreadable source): focus returns to the status button.
    if (focusLost()) buttonRef.current?.focus();
  });

  // Escape and an outside mousedown close the open panel.
  React.useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== "Escape") return;
      const active = activeElement();
      const within = active !== null && (rootRef.current?.contains(active) ?? false);
      setOpen(false);
      if (within || focusLost()) buttonRef.current?.focus();
    };
    const onMouseDown = (event: MouseEvent): void => {
      const target = event.target;
      if (target instanceof Node && rootRef.current?.contains(target)) return;
      const active = activeElement();
      const inPanel = active !== null && (panelRef.current?.contains(active) ?? false);
      setOpen(false);
      if (inPanel) buttonRef.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onMouseDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, [open]);

  if (controller === null || kind === null) return null;
  const copy = railOrderCopy(controller.lang);
  const source = kind === "source";
  const statusName = source ? copy.statusSourceName : copy.statusDraftName;
  const statusText = source ? copy.statusSourceText : copy.statusDraftText;
  const saving = kind === "saving";
  const message = source ? copy.unavailable : saving ? copy.saving : copy.notSaved;
  const retryInert = !controller.canRetry;

  return (
    <div className="rail-order-status" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className="rail-order-status-button"
        data-testid="rail-order-status"
        aria-label={statusName}
        aria-expanded={open}
        aria-controls={PANEL_ID}
        onClick={() => setOpen((value) => !value)}
      >
        <svg
          className="rail-order-status-icon"
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
        <span className="rail-order-status-text">{statusText}</span>
      </button>
      {open && (
        <div
          ref={panelRef}
          id={PANEL_ID}
          className="rail-order-status-panel"
          data-testid="rail-order-panel"
          role="dialog"
          aria-label={copy.panelName}
        >
          <p
            key={kind}
            className="rail-order-status-message"
            data-testid="rail-order-message"
            role={saving ? "status" : "alert"}
          >
            {message}
          </p>
          {!source && controller.exportFailed && (
            <p className="rail-order-status-message rail-order-status-export-error" role="alert">
              {copy.exportFailed}
            </p>
          )}
          <div className="rail-order-status-actions">
            {source ? (
              <button
                type="button"
                className="rail-order-status-action"
                data-testid="rail-order-reload"
                aria-label={copy.reload.name}
                onClick={() => controller.reload()}
              >
                {copy.reload.label}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="rail-order-status-action rail-order-status-action--primary"
                  data-testid="rail-order-retry"
                  aria-label={copy.retry.name}
                  aria-disabled={retryInert ? "true" : undefined}
                  onClick={() => controller.retry()}
                >
                  {copy.retry.label}
                </button>
                <button
                  type="button"
                  className="rail-order-status-action"
                  data-testid="rail-order-discard"
                  aria-label={copy.discard.name}
                  onClick={() => controller.discard()}
                >
                  {copy.discard.label}
                </button>
                <button
                  type="button"
                  className="rail-order-status-action"
                  data-testid="rail-order-export"
                  aria-label={copy.exportDraft.name}
                  onClick={() => controller.exportDraft()}
                >
                  {copy.exportDraft.label}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
