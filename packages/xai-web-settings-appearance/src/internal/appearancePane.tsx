/**
 * @internal — appearancePane registry entry.
 *
 * Substitutes the `appearance` placeholder in `paneRegistry` from
 * `@repo/plugin-web-settings-shell`. Consumed by the host composition file
 * `apps/web/src/routes/modules/settingsPaneComposition.ts`.
 *
 * API contract: packages/xai-web-settings-appearance/docs/api.md §4
 */

import * as React from "react";
import type { Pane } from "@repo/plugin-web-settings-shell";
import { AppearancePane } from "../AppearancePane.js";

export const appearancePane: Pane = {
  id: "appearance",
  icon: "sun",
  i18nKey: "settings.appearance",
  render: ({ lang }) => <AppearancePane lang={lang} />,
};
