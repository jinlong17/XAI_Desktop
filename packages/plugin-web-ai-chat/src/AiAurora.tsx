/**
 * AiAurora — the 5-layer aurora background.
 *
 * Renders:
 *  - .ai-aurora wrapper (with optional .thinking modifier) — also carries the
 *    4-layer accent-color floor radial gradient via styles.css.
 *  - 3× .aurora-stream conic-gradient rotating layers (as-1/2/3).
 *  - 5× .aurora-blob radial-gradient blobs (ab-1..ab-5).
 *  - 1× .ai-stars containing 60 deterministic .star spans.
 *  - 1× .ai-grain SVG noise overlay.
 *
 * No JS animation — every motion is a CSS keyframe targeting transform / opacity
 * only, per Frozen Assumption 10 (prefers-reduced-motion respected via CSS).
 *
 * Design: packages/xai-web-ai-chat/docs/design.md
 */

import React from "react";
import { getStarInstances } from "./internal/starInstances.js";

export interface AiAuroraProps {
  /** When true, adds the `.thinking` modifier class — speeds up aurora streams + blobs. */
  thinking: boolean;
}

const STAR_INSTANCES = getStarInstances();

export function AiAurora({ thinking }: AiAuroraProps) {
  const className = "ai-aurora" + (thinking ? " thinking" : "");
  return (
    <div className={className} aria-hidden="true">
      <div className="aurora-stream as-1" />
      <div className="aurora-stream as-2" />
      <div className="aurora-stream as-3" />
      <div className="aurora-blob ab-1" />
      <div className="aurora-blob ab-2" />
      <div className="aurora-blob ab-3" />
      <div className="aurora-blob ab-4" />
      <div className="aurora-blob ab-5" />
      <div className="ai-stars">
        {STAR_INSTANCES.map((star, i) => (
          <span
            key={i}
            className="star"
            style={{
              left: star.left,
              top: star.top,
              animationDelay: star.animationDelay,
              animationDuration: star.animationDuration,
              opacity: star.opacity,
            }}
          />
        ))}
      </div>
      <div className="ai-grain" />
    </div>
  );
}
