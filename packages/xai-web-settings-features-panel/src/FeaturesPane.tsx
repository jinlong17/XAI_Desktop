/**
 * FeaturesPane — Settings → Features pane content.
 *
 * Renders one card per FeatureId (`featureIdOrder`), each with a Toggle and a
 * FeatureThumb preview, persisted to the unscoped device keys
 * `xai_pref_features_<id>`.
 *
 * The pane autosaves and recovers through the local operation model
 * (`internal/featuresRecovery.ts`): a failed or pending choice stays visible
 * with field-local feedback, Retry and Discard; unreadable or malformed stored
 * bytes get a Reload only; "Export Features draft" downloads a memory-only
 * recovery file; the optional host departure guard and a beforeunload warning
 * protect unresolved drafts. There is no shared Save footer: "Reset to
 * defaults" is a Features-local control that asks a truthful confirmation and
 * then runs a pane-scoped, per-key reset batch with per-field results.
 *
 * Port of web design/module-settings.jsx lines 156-192 (FeaturesPane).
 *
 * API contract: packages/xai-web-settings-features-panel/docs/api.md §1 + §5
 * Recovery contract: docs/reviews/web-features-recovery-contract/contract.md
 */

import * as React from "react";
import { useI18n } from "@repo/plugin-web-tokens";
import type { Lang } from "@repo/plugin-web-tokens";
import { Toggle, SectionBlock } from "@repo/plugin-web-settings-shell";
import { FeatureThumb } from "./internal/FeatureThumb.js";
import { useFeaturesRecovery } from "./internal/featuresRecovery.js";
import type { FeatureFieldState, FeatureFieldView } from "./internal/featuresRecovery.js";
import { featuresRecoveryCopy } from "./internal/featuresRecoveryCopy.js";
import type { FeaturesRecoveryCopy } from "./internal/featuresRecoveryCopy.js";
import type { FeatureId, FeaturesPaneProps } from "./types.js";

export function FeaturesPane({ lang, registerDepartureGuard }: FeaturesPaneProps): React.ReactElement {
  const { s } = useI18n(lang);
  const copy = featuresRecoveryCopy(lang);
  const recovery = useFeaturesRecovery({ guardLabel: s("settings.features"), registerDepartureGuard });
  const paneRef = React.useRef<HTMLDivElement>(null);
  const resetRef = React.useRef<HTMLButtonElement>(null);

  // Keyboard continuity: a recovery action whose control disappears returns
  // focus to the field's switch (or, for Discard all, stays in the pane).
  const focusSwitch = React.useCallback((id: FeatureId) => {
    paneRef.current?.querySelector<HTMLElement>(`[data-feature-id="${id}"] [role="switch"]`)?.focus();
  }, []);
  const discardField = (id: FeatureId) => {
    recovery.discard(id);
    focusSwitch(id);
  };
  const reloadField = (id: FeatureId) => {
    recovery.reload(id);
    focusSwitch(id);
  };
  const discardAll = () => {
    recovery.discardAll();
    resetRef.current?.focus();
  };
  const resetToDefaults = () => {
    recovery.resetToDefaults(() => window.confirm(copy.confirmReset));
  };

  const statusText = recovery.status === "restored" ? copy.restored : recovery.status === "saved" ? copy.saved : "";

  return (
    <div className="features-pane" ref={paneRef}>
      <h3 className="pane-title">{s("settings.features")}</h3>
      <p className="pane-intro">{s("settings.features_intro")}</p>
      <SectionBlock>
        <div className="features-grid">
          {recovery.fields.map((field) => (
            <FeatureCard
              key={field.id}
              field={field}
              lang={lang}
              copy={copy}
              onToggle={recovery.toggle}
              onRetry={recovery.retry}
              onDiscard={discardField}
              onReload={reloadField}
              focusSwitch={focusSwitch}
            />
          ))}
        </div>
      </SectionBlock>
      {recovery.hasDraft && (
        <div className="features-recovery-actions">
          <button type="button" className="btn ghost" onClick={recovery.exportDraft}>{copy.exportDraft}</button>
          <button type="button" className="btn ghost" onClick={discardAll}>{copy.discardAll}</button>
          {recovery.exportFailed && <p className="features-recovery-error" role="alert">{copy.exportFailed}</p>}
        </div>
      )}
      <div className="features-recovery-footer">
        <p className="features-recovery-status" role="status">{statusText}</p>
        <button
          ref={resetRef}
          type="button"
          className="btn ghost features-recovery-reset"
          data-testid="features-reset-defaults"
          onClick={resetToDefaults}
        >
          {copy.reset}
        </button>
      </div>
    </div>
  );
}

// ---- FeatureCard -----------------------------------------------------------

interface FeatureCardProps {
  readonly field: FeatureFieldView;
  readonly lang: Lang;
  readonly copy: FeaturesRecoveryCopy;
  readonly onToggle: (id: FeatureId) => void;
  readonly onRetry: (id: FeatureId) => void;
  readonly onDiscard: (id: FeatureId) => void;
  readonly onReload: (id: FeatureId) => void;
  readonly focusSwitch: (id: FeatureId) => void;
}

/** One card per FeatureId; the switch submits a closure-bound value only. */
function FeatureCard({ field, lang, copy, onToggle, onRetry, onDiscard, onReload, focusSwitch }: FeatureCardProps): React.ReactElement {
  const { s } = useI18n(lang);
  const { id, on, state } = field;
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
          onChange={() => onToggle(id)}
          ariaLabel={`${name} — ${on ? "on" : "off"}`}
        />
      </div>
      {state !== "clean" && (
        <FieldRecovery
          id={id}
          label={name}
          state={state}
          copy={copy}
          onRetry={onRetry}
          onDiscard={onDiscard}
          onReload={onReload}
          focusSwitch={focusSwitch}
        />
      )}
      <div className={`feat-thumb feat-thumb-${id}`}>
        <FeatureThumb kind={id} />
      </div>
    </div>
  );
}

// ---- FieldRecovery ---------------------------------------------------------

interface FieldRecoveryProps {
  readonly id: FeatureId;
  readonly label: string;
  readonly state: Exclude<FeatureFieldState, "clean">;
  readonly copy: FeaturesRecoveryCopy;
  readonly onRetry: (id: FeatureId) => void;
  readonly onDiscard: (id: FeatureId) => void;
  readonly onReload: (id: FeatureId) => void;
  readonly focusSwitch: (id: FeatureId) => void;
}

function messageFor(state: FieldRecoveryProps["state"], label: string, copy: FeaturesRecoveryCopy): string {
  switch (state) {
    case "saving": return copy.saving(label);
    case "resetting": return copy.resetting(label);
    case "not-saved": return copy.notSaved(label);
    case "not-reset": return copy.notReset(label);
    case "unavailable": return copy.unavailable(label);
  }
}

/** Field-local feedback: Retry and Discard for actual work, Reload only for a source issue. */
function FieldRecovery({ id, label, state, copy, onRetry, onDiscard, onReload, focusSwitch }: FieldRecoveryProps): React.ReactElement {
  const rootRef = React.useRef<HTMLDivElement>(null);
  // When the block disappears (for example after a successful Retry) while it
  // holds focus, focus returns to the field's switch instead of <body>.
  React.useLayoutEffect(() => {
    const root = rootRef.current;
    return () => {
      if (root !== null && root.contains(document.activeElement)) focusSwitch(id);
    };
  }, [focusSwitch, id]);

  const alert = state === "not-saved" || state === "not-reset" || state === "unavailable";
  return (
    <div className="features-recovery-field" ref={rootRef}>
      <p key={alert ? "alert" : "status"} className="features-recovery-text" role={alert ? "alert" : "status"}>
        {messageFor(state, label, copy)}
      </p>
      {state === "unavailable" ? (
        <button type="button" className="btn ghost" aria-label={copy.reloadName(label)} onClick={() => onReload(id)}>
          {copy.reload}
        </button>
      ) : (
        <>
          <button type="button" className="btn ghost" aria-label={copy.retryName(label)} onClick={() => onRetry(id)}>
            {copy.retry}
          </button>
          <button type="button" className="btn ghost" aria-label={copy.discardName(label)} onClick={() => onDiscard(id)}>
            {copy.discard}
          </button>
        </>
      )}
    </div>
  );
}
