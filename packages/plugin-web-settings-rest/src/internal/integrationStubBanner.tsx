/**
 * @internal — integrationStubBanner.tsx
 *
 * Pane-top disclosure banner for the Integrations pane in v1 stub mode.
 * Non-dismissible (no close button per FA-12).
 *
 * Design home: packages/plugin-web-settings-rest/docs/design.md §FA-12
 */

import * as React from "react";
import type { Lang } from "@repo/plugin-web-tokens";
import { localI18n } from "./localI18n.js";

interface IntegrationStubBannerProps {
  readonly lang: Lang;
}

export function IntegrationStubBanner({
  lang,
}: IntegrationStubBannerProps): React.ReactElement {
  const t = localI18n(lang);

  return (
    <div className="int-stub-banner" role="note" data-testid="int-stub-banner">
      <span className="int-stub-banner__text">{t("int.banner.stub")}</span>
    </div>
  );
}
