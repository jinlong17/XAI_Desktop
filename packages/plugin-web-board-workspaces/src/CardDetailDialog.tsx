/**
 * CardDetailDialog — read-only card detail native <dialog>.
 *
 * Audit Top-10 #5 fix — B-23/B-29/B-32/B-34/B-36 + Map view.
 * Modeled on ShareModal.tsx (same package, same native <dialog> pattern).
 *
 * Props:
 *   open     — whether dialog is visible
 *   card     — resolved BoardCardData (or null; dialog renders nothing if null)
 *   listName — bilingual list name resolved by caller
 *   lang     — "en" | "zh"
 *   onClose  — called when user closes via Close button, ESC, or backdrop click
 *
 * v1 scope: read-only. No edit affordance.
 * No new npm deps; no plugin-web-tokens edit; no EventMap entry.
 */

import { useEffect, useRef } from "react";
import type { BoardCardData } from "@repo/plugin-web-board-core";
import { PM_LABELS } from "@repo/plugin-web-board-core";
import { STR_CARD_DETAIL } from "./internal/strings.js";
import type { Lang } from "./internal/strings.js";

/** Mock members — mirrors TableView's inline const (mock data only; no real member store). */
const MOCK_MEMBERS = [
  { id: "u1", name: "Alice" },
  { id: "u2", name: "Bob" },
  { id: "u3", name: "Carol" },
] as const;

export interface CardDetailDialogProps {
  open: boolean;
  card: BoardCardData | null;
  /** Resolved bilingual name for the list the card belongs to. */
  listName: string;
  lang: Lang;
  onClose: () => void;
}

export function CardDetailDialog({
  open,
  card,
  listName,
  lang,
  onClose,
}: CardDetailDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Open / close via showModal / close to get native focus-trap + backdrop
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  // Native ESC fires "cancel" event — wire to onClose
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    function onCancel(e: Event) {
      e.preventDefault();
      onClose();
    }
    dialog.addEventListener("cancel", onCancel);
    return () => dialog.removeEventListener("cancel", onCancel);
  }, [onClose]);

  function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === dialogRef.current) {
      onClose();
    }
  }

  const STR = STR_CARD_DETAIL;

  // Resolve labels
  const resolvedLabels =
    card?.labels
      ?.map((id) => PM_LABELS.find((l) => l.id === id))
      .filter(Boolean) as (typeof PM_LABELS)[number][] | undefined;

  // Resolve members
  const resolvedMembers =
    card?.members
      ?.map((id) => MOCK_MEMBERS.find((m) => m.id === id))
      .filter(Boolean) as (typeof MOCK_MEMBERS)[number][] | undefined;

  // Due string: prefer lang-specific; fall back across locales
  const dueStr =
    lang === "en" ? (card?.dueEn ?? card?.due) : (card?.due ?? card?.dueEn);

  return (
    <dialog
      ref={dialogRef}
      className="card-detail-dialog"
      data-testid="card-detail-dialog"
      onClick={handleBackdropClick}
    >
      {card && (
        <div className="cdd-body">
          {/* Title */}
          <div className="cdd-header">
            <h2 className="cdd-title" data-testid="cdd-title">
              {card.title[lang]}
            </h2>
            <button
              type="button"
              className="cdd-close-btn"
              data-testid="cdd-close-btn"
              onClick={onClose}
              aria-label={STR.close[lang]}
            >
              ×
            </button>
          </div>

          {/* List name */}
          <div className="cdd-row" data-testid="cdd-list-row">
            <span className="cdd-label">{STR.listLabel[lang]}</span>
            <span className="cdd-value" data-testid="cdd-list-name">
              {listName}
            </span>
          </div>

          {/* Due date */}
          {dueStr && (
            <div className="cdd-row" data-testid="cdd-due-row">
              <span className="cdd-label">{STR.dueLabel[lang]}</span>
              <span
                className={"cdd-value" + (card.dueLate ? " cdd-due-late" : "")}
                data-testid="cdd-due-value"
              >
                {dueStr}
                {card.dueLate && (
                  <span className="cdd-late-badge" data-testid="cdd-late-badge">
                    {" "}
                    {STR.lateLabel[lang]}
                  </span>
                )}
              </span>
            </div>
          )}

          {/* Start date */}
          {card.start && (
            <div className="cdd-row" data-testid="cdd-start-row">
              <span className="cdd-label">{STR.startLabel[lang]}</span>
              <span className="cdd-value" data-testid="cdd-start-value">
                {card.start}
              </span>
            </div>
          )}

          {/* Labels */}
          {resolvedLabels && resolvedLabels.length > 0 && (
            <div className="cdd-row cdd-labels-row" data-testid="cdd-labels-row">
              <span className="cdd-label">{STR.labelsLabel[lang]}</span>
              <div className="cdd-chips" data-testid="cdd-labels">
                {resolvedLabels.map((l) => (
                  <span
                    key={l.id}
                    className="cdd-chip"
                    style={{ background: l.color }}
                    data-testid={`cdd-label-${l.id}`}
                  >
                    {l.name[lang]}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Members */}
          {resolvedMembers && resolvedMembers.length > 0 && (
            <div className="cdd-row cdd-members-row" data-testid="cdd-members-row">
              <span className="cdd-label">{STR.membersLabel[lang]}</span>
              <div className="cdd-chips" data-testid="cdd-members">
                {resolvedMembers.map((m) => (
                  <span key={m.id} className="cdd-chip cdd-member-chip" data-testid={`cdd-member-${m.id}`}>
                    {m.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Checklist */}
          {card.checklist && (
            <div className="cdd-row" data-testid="cdd-checklist-row">
              <span className="cdd-label">{STR.checklistLabel[lang]}</span>
              <span className="cdd-value" data-testid="cdd-checklist-value">
                {card.checklist.done}/{card.checklist.total} (
                {card.checklist.total > 0
                  ? Math.round((card.checklist.done / card.checklist.total) * 100)
                  : 0}
                %)
              </span>
            </div>
          )}

          {/* Attachments */}
          {card.attach !== undefined && card.attach !== null && (
            <div className="cdd-row" data-testid="cdd-attach-row">
              <span className="cdd-label">{STR.attachLabel[lang]}</span>
              <span className="cdd-value" data-testid="cdd-attach-value">
                {card.attach}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="cdd-footer">
            <button
              type="button"
              className="cdd-close-action"
              data-testid="cdd-close-action"
              onClick={onClose}
            >
              {STR.close[lang]}
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
