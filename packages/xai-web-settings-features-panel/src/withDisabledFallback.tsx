/**
 * withDisabledFallback — wraps a `WebModuleSlotRegistration` so its child
 * route components short-circuit to `<DisabledFeatureFallback>` whenever the
 * user's `xai_pref_features_<id>` is false.
 *
 * Used at the host wiring point (apps/web/src/routes/modules/shellRegistrations.tsx)
 * to guarantee that deep-links into a disabled module produce the friendly
 * empty state instead of a partially-rendered module shell.
 *
 * API contract: packages/xai-web-settings-features-panel/docs/api.md §1 + §5
 */

import * as React from "react";
import { usePref } from "@repo/plugin-web-storage";
import type { WebPrefKey } from "@repo/plugin-web-storage";
import type { WebModuleSlotRegistration } from "@repo/xai-web-shell";
import { useWebShell } from "@repo/xai-web-shell";
import type { WebModuleRouteProps } from "@repo/core/types";
import { DisabledFeatureFallback } from "./DisabledFeatureFallback.js";
import { featurePrefKey, isFeatureId } from "./featureIds.js";
import type { FeatureId } from "./types.js";

export function withDisabledFallback(
  reg: WebModuleSlotRegistration,
  moduleId: FeatureId,
): WebModuleSlotRegistration {
  if (!isFeatureId(moduleId)) {
    if (typeof window !== "undefined" && devMode()) {
      console.warn(
        "[plugin-web-settings-features-panel] withDisabledFallback received non-FeatureId moduleId:",
        moduleId,
      );
    }
    return reg;
  }
  const prefKey = featurePrefKey(moduleId) as WebPrefKey;

  return {
    ...reg,
    children: reg.children.map((child) => {
      const Original = child.render;
      function DisabledGuard(props: WebModuleRouteProps): React.ReactElement {
        const [on] = usePref(prefKey) as readonly [boolean, unknown, unknown];
        const { lang } = useWebShell();
        if (on === false) {
          return <DisabledFeatureFallback moduleId={moduleId} lang={lang} />;
        }
        return <Original {...props} />;
      }
      DisabledGuard.displayName = `withDisabledFallback(${child.path})`;
      return {
        ...child,
        render: DisabledGuard,
      };
    }),
  };
}

// `import.meta.env` is provided by Vite at build time but not in this package's
// tsconfig types. Detect DEV without importing vite/client.
function devMode(): boolean {
  try {
    return process.env["NODE_ENV"] !== "production";
  } catch {
    return false;
  }
}
