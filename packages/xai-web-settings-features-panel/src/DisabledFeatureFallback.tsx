/**
 * DisabledFeatureFallback — empty state shown when a deep link reaches a
 * module whose `xai_pref_features_<id>` is false.
 *
 * The seed brief requires "module-disabled deep-link resolves to a friendly
 * empty state, not a 404". This component is the friendly empty state.
 *
 * API contract: packages/xai-web-settings-features-panel/docs/api.md §1 + §5
 */

import * as React from "react";
import { useI18n } from "@repo/plugin-web-tokens";
import { isFeatureId } from "./featureIds.js";
import type { DisabledFeatureFallbackProps } from "./types.js";

export function DisabledFeatureFallback({
  moduleId,
  lang,
}: DisabledFeatureFallbackProps): React.ReactElement {
  const { s } = useI18n(lang);

  // Resolve module display name — falls back to a generic copy if unknown.
  const known = isFeatureId(moduleId);
  if (!known && isDev()) {
    console.warn(
      "[plugin-web-settings-features-panel] DisabledFeatureFallback received unknown moduleId:",
      moduleId,
    );
  }

  const moduleName = known
    ? s(`nav.${moduleId}`)
    : lang === "zh"
      ? "此模块"
      : "this module";

  const title = s("settings.features_off_title");
  const body = s("settings.features_off_body");

  return (
    <section
      className="disabled-feature-fallback"
      data-feature-id={moduleId}
      role="status"
      aria-live="polite"
    >
      <h2 className="disabled-feature-fallback__title">{moduleName}</h2>
      <p className="disabled-feature-fallback__body" data-testid="dff-title">
        {title}
      </p>
      <p className="disabled-feature-fallback__body" data-testid="dff-body">
        {body}
      </p>
    </section>
  );
}

// `import.meta.env` is provided by Vite but not in this package's tsconfig
// types. Detect DEV via NODE_ENV.
function isDev(): boolean {
  try {
    return process.env["NODE_ENV"] !== "production";
  } catch {
    return false;
  }
}
