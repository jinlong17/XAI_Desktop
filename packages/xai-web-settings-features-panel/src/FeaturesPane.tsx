/**
 * FeaturesPane — Settings → Features pane content.
 *
 * Renders 8 SettingRow entries (one per FeatureId), each with a Toggle and a
 * FeatureThumb preview. Persists state to `xai_pref_features_<id>` via usePref.
 *
 * Includes SettingsFooter for Save/Reset — Reset restores all 8 toggles to true.
 *
 * Port of web design/module-settings.jsx lines 156-192 (FeaturesPane).
 *
 * API contract: packages/xai-web-settings-features-panel/docs/api.md §1 + §5
 */

import * as React from "react";
import { useI18n } from "@repo/plugin-web-tokens";
import { usePref } from "@repo/plugin-web-storage";
import type { WebPrefKey } from "@repo/plugin-web-storage";
import {
  Toggle,
  SectionBlock,
  SettingsFooter,
} from "@repo/plugin-web-settings-shell";
import { FeatureThumb } from "./internal/FeatureThumb.js";
import { featureIdOrder, featurePrefKey } from "./featureIds.js";
import type { FeatureId, FeaturesPaneProps } from "./types.js";

export function FeaturesPane({ lang }: FeaturesPaneProps): React.ReactElement {
  const { s } = useI18n(lang);

  return (
    <div className="features-pane">
      <h3 className="pane-title">{s("settings.features")}</h3>
      <p className="pane-intro">{s("settings.features_intro")}</p>
      <SectionBlock>
        <div className="features-grid">
          {featureIdOrder.map((id) => (
            <FeatureCard key={id} id={id} lang={lang} />
          ))}
        </div>
      </SectionBlock>
      <SettingsFooter
        lang={lang}
        onSave={() => []}
        onReset={resetAllFeaturePrefs}
      />
    </div>
  );
}

// ---- FeatureCard -----------------------------------------------------------

interface FeatureCardProps {
  readonly id: FeatureId;
  readonly lang: "en" | "zh";
}

/**
 * One card per FeatureId. The pref key is derived from `id` and passed to a
 * single typed `usePref` call — Rules of Hooks compliant because exactly one
 * hook executes per render in a stable order (id is fixed for the card's
 * lifetime; `key={id}` in the parent guarantees a fresh instance per id).
 */
function FeatureCard({ id, lang }: FeatureCardProps): React.ReactElement {
  const { s } = useI18n(lang);
  // The registry key is the literal `xai_pref_features_<id>` — the cast
  // narrows it to WebPrefKey for the typed usePref signature. The 8 keys
  // exist in PREF_REGISTRY (added in P1), so the cast is safe.
  const prefKey = featurePrefKey(id) as WebPrefKey;
  const [on, setOn] = usePref(prefKey) as readonly [
    boolean,
    (next: boolean) => void,
    unknown,
  ];

  const name = s(`nav.${id}`);
  const desc = s(`settings.features_desc_${id}`);

  return (
    <div className="feat-card" data-feature-id={id}>
      <div className="feat-head">
        <div className="feat-text">
          <div className="feat-name">{name}</div>
          <div className="feat-desc">{desc}</div>
        </div>
        <Toggle
          on={on}
          onChange={() => setOn(!on)}
          ariaLabel={`${name} — ${on ? "on" : "off"}`}
        />
      </div>
      <div className={`feat-thumb feat-thumb-${id}`}>
        <FeatureThumb kind={id} />
      </div>
    </div>
  );
}

// ---- Reset helper ----------------------------------------------------------

/** Removes all 8 feature prefs from localStorage → restores every toggle to default (true). */
function resetAllFeaturePrefs(): void {
  for (const id of featureIdOrder) {
    try {
      localStorage.removeItem(featurePrefKey(id));
    } catch {
      /* swallow — matches resetAllPrefs() idempotency */
    }
  }
  // Fire a storage event so same-tab listeners notice. removeItem above does
  // NOT trigger 'storage' in the originating tab — usePref subscribes to a
  // same-tab bus on `setPref`, which we bypassed. To wake up other usePref
  // instances we dispatch a synthetic event with key=null, which matches the
  // `localStorage.clear()` branch in usePref.
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new StorageEvent("storage", { key: null, storageArea: localStorage }),
    );
  }
}
