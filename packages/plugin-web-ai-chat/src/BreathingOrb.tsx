/**
 * BreathingOrb — 3-layer radial-gradient breathing orb.
 *
 * Idle breath: 9 / 11 / 13s on the three layers.
 * Thinking speed-up: 3.5 / 4.2 / 5s when thinking={true}.
 *
 * All animation is CSS keyframes (transform + opacity only). No JS rAF loop.
 *
 * Design: packages/xai-web-ai-chat/docs/design.md
 */

import React from "react";

export interface BreathingOrbProps {
  /** When true, adds the `.orb-thinking` modifier — accelerates all 3 layers. */
  thinking: boolean;
}

export function BreathingOrb({ thinking }: BreathingOrbProps) {
  const className = "orb" + (thinking ? " orb-thinking" : "");
  return (
    <div className={className} aria-hidden="true">
      <div className="orb-layer orb-1" />
      <div className="orb-layer orb-2" />
      <div className="orb-layer orb-3" />
      <div className="orb-noise" />
    </div>
  );
}
