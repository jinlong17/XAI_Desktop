/**
 * ConfirmationCard — renders a proposed AI action with Confirm/Cancel buttons.
 *
 * CRITICAL: This component only DISPLAYS the proposed action. The write event
 * is emitted ONLY when the user clicks Confirm (no silent writes).
 * Rendering this card does NOT execute any write.
 *
 * Design: packages/xai-web-ai-chat/docs/design.md §2026-05-29 Extension §state
 * API contract: packages/xai-web-ai-chat/docs/api.md §13.3
 * Test strategy: packages/xai-web-ai-chat/docs/test.md §8 CC tests
 */

import React from "react";
import type { Lang } from "@repo/plugin-web-tokens";
import type { ConfirmationSpec } from "./internal/toolRegistry.js";

export interface ConfirmationCardProps {
  /** The proposed action to display. */
  spec: ConfirmationSpec;
  /** Active language. */
  lang: Lang;
  /** Called when user clicks Confirm (producer of the write event — caller's responsibility). */
  onConfirm: () => void;
  /** Called when user clicks Cancel. */
  onCancel: () => void;
}

export function ConfirmationCard({ spec, lang, onConfirm, onCancel }: ConfirmationCardProps) {
  const zh = lang === "zh";

  return (
    <div className="ai-confirmation-card" role="dialog" aria-label={spec.label}>
      <div className="ai-confirmation-header">
        <span className="ai-confirmation-icon">✦</span>
        <span className="ai-confirmation-label">{spec.label}</span>
      </div>
      <div className="ai-confirmation-description">{spec.description}</div>
      <div className="ai-confirmation-actions">
        <button
          type="button"
          className="ai-confirmation-confirm"
          onClick={onConfirm}
          aria-label={zh ? "确认" : "Confirm"}
        >
          {zh ? "确认" : "Confirm"}
        </button>
        <button
          type="button"
          className="ai-confirmation-cancel"
          onClick={onCancel}
          aria-label={zh ? "取消" : "Cancel"}
        >
          {zh ? "取消" : "Cancel"}
        </button>
      </div>
    </div>
  );
}
