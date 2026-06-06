import React from "react";
import type { Lang } from "@repo/plugin-web-tokens";
import { IconGlyph } from "./internal/icons.js";

interface AddCountdownCardProps {
  lang: Lang;
  onClick?: () => void;
}

export function AddCountdownCard({ lang, onClick }: AddCountdownCardProps) {
  return (
    <button
      type="button"
      className="cd-add-card"
      onClick={onClick}
    >
      <span className="cd-add-card__mark"><IconGlyph name="plus" size={18} /></span>
      <span>{lang === "zh" ? "新建倒计时" : "Add Countdown"}</span>
    </button>
  );
}
