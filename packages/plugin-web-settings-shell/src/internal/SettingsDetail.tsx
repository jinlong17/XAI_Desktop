/**
 * @internal — SettingsDetail.tsx
 *
 * Renders the active pane via `active.render({ lang })`.
 * Not exported from index.ts.
 */

import * as React from "react";
import type { Lang } from "@repo/plugin-web-tokens";
import type { Pane } from "../types.js";

interface SettingsDetailProps {
  lang: Lang;
  active: Pane;
}

export function SettingsDetail({
  lang,
  active,
}: SettingsDetailProps): React.ReactElement {
  return (
    <section className="settings-detail" data-pane={active.id}>
      {active.render({ lang })}
    </section>
  );
}
