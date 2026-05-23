/**
 * ComingSoonPanel — placeholder body when view ≠ "month".
 *
 * Renders `cal.coming_soon` bilingually inside a `.cal-grid.panel` outer
 * container, preserving the toolbar visibility above.
 */

import type { JSX } from "react";
import type { I18NBundle } from "@repo/plugin-web-tokens";

interface ComingSoonPanelProps {
  t: I18NBundle;
}

export function ComingSoonPanel({ t }: ComingSoonPanelProps): JSX.Element {
  return (
    <div className="cal-grid panel cal-coming-soon" data-testid="cal-coming-soon">
      <p>{t.cal.coming_soon}</p>
    </div>
  );
}
