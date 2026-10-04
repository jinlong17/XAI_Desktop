/**
 * @internal — featuresPane object.
 *
 * Substitutes the `features` placeholder in `paneRegistry` from
 * `@repo/plugin-web-settings-shell`. Consumed by the host composition file
 * `apps/web/src/routes/modules/settingsPaneComposition.ts`.
 *
 * API contract: packages/xai-web-settings-features-panel/docs/api.md §1 + §3
 */

import * as React from "react";
import type { Pane, PaneRenderProps } from "@repo/plugin-web-settings-shell";
import { FeaturesPane } from "../FeaturesPane.js";

export const featuresPane: Pane = {
  id: "features",
  icon: "sliders",
  i18nKey: "settings.features",
  // Forwards every render prop, including the optional host departure guard.
  render: (props: PaneRenderProps) => <FeaturesPane {...props} />,
};
