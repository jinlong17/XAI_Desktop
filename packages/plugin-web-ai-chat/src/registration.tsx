/**
 * registration.tsx — shell slot registration for the AI Chat module.
 *
 * Exports `aiChatWebModuleRegistration` which is consumed by
 * `apps/web/src/routes/modules/shellRegistrations.tsx`.
 *
 * The `render` wrapper reads `lang` from `useWebShell()` which is populated
 * by `<WebShellProvider lang={lang}>` in apps/web/src/App.tsx.
 *
 * API contract: packages/xai-web-ai-chat/docs/api.md §2
 * Design: packages/xai-web-ai-chat/docs/design.md
 */

import React from "react";
import type { WebModuleSlotRegistration } from "@repo/xai-web-shell";
import { useWebShell } from "@repo/xai-web-shell";
import { AiChatModule } from "./AiChatModule.js";

function AiChatModuleRoute() {
  const { lang } = useWebShell();
  return <AiChatModule lang={lang} />;
}

export const aiChatWebModuleRegistration: WebModuleSlotRegistration = {
  moduleId: "ai",
  label: "XAI Chat",
  defaultChildPath: "",
  children: [
    { path: "", render: AiChatModuleRoute },
    { path: "*", render: AiChatModuleRoute },
  ],
  icon: "sparkle",
  railOrder: 1,
  i18nKey: "nav.ai",
  showInRail: true,
};
