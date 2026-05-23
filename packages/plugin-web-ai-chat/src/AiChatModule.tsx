/**
 * AiChatModule — root route component for the AI Chat module.
 *
 * P1 version: aurora + breathing orb only (no sidebar, no composer, no state).
 * Full composition lands in P2 per dev_log.md Phase Plan.
 *
 * API contract: packages/xai-web-ai-chat/docs/api.md §1
 */

import React from "react";
import type { Lang } from "@repo/plugin-web-tokens";
import { AiAurora } from "./AiAurora.js";
import { BreathingOrb } from "./BreathingOrb.js";

export interface AiChatModuleProps {
  /** Active language. Drives useI18n bundle + inline bilingual literals. */
  lang: Lang;
}

export function AiChatModule(_props: AiChatModuleProps) {
  // P1 placeholder: aurora + orb visuals only, no state machine yet.
  // Reference the prop once so noUnusedParameters stays happy without `_` rename.
  void _props;
  return (
    <div className="module module-ai">
      <main className="ai-main">
        <div className="ai-stage empty">
          <AiAurora thinking={false} />
          <BreathingOrb thinking={false} />
        </div>
      </main>
    </div>
  );
}
