/**
 * InsightCallout.tsx — sparkle icon + h4 + p, copy pre-resolved by insightCopy().
 *
 * api.md §7.
 */

import * as React from "react";
import type { Lang } from "@repo/plugin-web-tokens";
import { IconSparkle } from "./internal/icons.js";

export interface InsightCalloutProps {
  copy: string;
  lang: Lang;
}

export function InsightCallout({
  copy,
  lang,
}: InsightCalloutProps): React.ReactElement {
  return (
    <div className="stats-insight panel">
      <span style={{ color: "var(--accent)" }} aria-hidden="true">
        <IconSparkle size={18} />
      </span>
      <div>
        <h4>{lang === "zh" ? "本周洞察" : "This week's insight"}</h4>
        <p>{copy}</p>
      </div>
    </div>
  );
}
