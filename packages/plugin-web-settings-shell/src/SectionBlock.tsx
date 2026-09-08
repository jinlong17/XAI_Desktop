/**
 * <SectionBlock> atom — verbatim TSX port of web design/module-settings.jsx line 1050-1051.
 *
 * API contract: packages/xai-web-settings-shell/docs/api.md §2.2
 */

import * as React from "react";
import type { SectionBlockProps } from "./types.js";

export function SectionBlock({
  children,
  style,
}: SectionBlockProps): React.ReactElement {
  return (
    <div className="setting-block" style={style}>
      {children}
    </div>
  );
}
