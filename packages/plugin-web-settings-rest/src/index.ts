/**
 * @repo/plugin-web-settings-rest — public surface.
 *
 * This is the ONLY allowed import path for consumers.
 * Never import from src/internal/ or src/panes/ directly.
 *
 * Roadmap row #24 · W4b — Settings remaining 11 panes
 * (Account / Premium / Smart Lists / Notifications / Date & Time /
 *  More / Integrations / Collaborate / Sticky Note / Hotkeys / About)
 *
 * API contract: packages/xai-web-settings-rest/docs/api.md §0
 * ADR anchor: docs/adr/0007-xai-web-console-build-form.md §S4 + §S7 + §S8
 */

// Side-effect CSS — applied once globally when this package is first imported.
import "./styles.css";

// ---- Per-pane Pane objects ------------------------------------------------
export { accountPane }       from "./panes/accountPane.js";
export { premiumPane }       from "./panes/premiumPane.js";
export { smartListsPane }    from "./panes/smartListsPane.js";
export { notificationsPane } from "./panes/notificationsPane.js";
export { dateTimePane }      from "./panes/dateTimePane.js";
export { morePane }          from "./panes/morePane.js";
export { integrationsPane }  from "./panes/integrationsPane.js";
export { collaboratePane }   from "./panes/collaboratePane.js";
export { stickyPane }        from "./panes/stickyPane.js";
export { hotkeysPane }       from "./panes/hotkeysPane.js";
export { aboutPane }         from "./panes/aboutPane.js";
// Extension 2026-05-25 — AI pane (gap-closure row #2)
export { aiPane }            from "./panes/aiPane.js";

// ---- Aggregate + composition helper --------------------------------------
export { restPanesById }            from "./internal/restPanesById.js";
export { applyRestPanesToRegistry } from "./internal/applyRestPanesToRegistry.js";

// Extension 2026-05-25 — OAuth callback page (gap-closure row #7)
export { CallbackPage } from "./CallbackPage.js";

// ---- Public types --------------------------------------------------------
export type {
  SmartListId,
  SmartListVisibility,
  StickyColorId,
  StickyFontSize,
  StickyGridSpacing,
  WindowType,
  TaskDefaultDate,
  TaskDefaultReminderDue,
  TaskDefaultReminderAll,
  TaskDefaultPriority,
  TaskDefaultTagId,
  TaskDefaultListId,
  AddTo,
  OverdueAt,
  DefaultShare,
  IntegrationCardId,
} from "./types.js";

// Extension 2026-05-25 — OAuth provider id type (gap-closure row #7)
export type { IntegrationProviderId } from "./internal/integrationProviders.js";
