/**
 * AddCountdownCard — placeholder "add" card at the end of the grid.
 *
 * Renders a dashed button that opens the create modal when clicked.
 *
 * API contract: packages/xai-web-countdown/docs/api.md §2.2
 */

import React from "react";
import type { Lang } from "@repo/plugin-web-tokens";

interface AddCountdownCardProps {
  lang: Lang;
  onClick?: () => void;
}

export function AddCountdownCard({ lang, onClick }: AddCountdownCardProps) {
  return (
    <button
      type="button"
      className="cd-card cd-add"
      onClick={onClick}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      <span>{lang === "zh" ? "新建倒计时" : "Add Countdown"}</span>
    </button>
  );
}
