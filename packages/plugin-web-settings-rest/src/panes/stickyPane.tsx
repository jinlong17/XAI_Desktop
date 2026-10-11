/**
 * stickyPane — Settings → Sticky Note pane: five independently recoverable
 * device preferences.
 *
 * 13-color palette + font-size + pin-default + restore-size + 4 grid-spacing cards,
 * persisted to the unscoped device keys xai_pref_sticky_*.
 *
 * Every field uses the asynchronous preference binding with a strict caller
 * domain. A valid edit becomes a field-local draft that only its own matching
 * verified write may settle; a failure keeps the latest choice with Retry,
 * Discard, a memory-only export and the host departure guard. Invalid or
 * unreadable stored bytes get a per-field Reload only and are never rewritten.
 *
 * OKLCH color vars declared in src/styles.css (no hex in TSX).
 *
 * Port of web design/module-settings.jsx lines 900-977.
 * API contract: packages/plugin-web-settings-rest/docs/api.md §4.9
 */

import * as React from "react";
import type { Pane, PaneDepartureGuard, PaneRenderProps } from "@repo/plugin-web-settings-shell";
import { Toggle, SettingRow, SectionBlock } from "@repo/plugin-web-settings-shell";
import { useI18n } from "@repo/plugin-web-tokens";
import { accountScope, usePrefAutosaveAsync } from "@repo/plugin-web-storage";
import type { PrefAutosaveAsyncResult, WebPrefKey } from "@repo/plugin-web-storage";
import { localI18n } from "../internal/localI18n.js";
import { STICKY_COLOR_IDS, StickyColorPalette } from "../internal/StickyColorPalette.js";
import type { StickyColorId, StickyFontSize, StickyGridSpacing } from "../types.js";

interface SpacingOption {
  readonly id: StickyGridSpacing;
  readonly gap: string;
}

const SPACING_OPTIONS: readonly SpacingOption[] = [
  { id: "none",   gap: "0" },
  { id: "normal", gap: "6px" },
  { id: "large",  gap: "14px" },
  { id: "xl",     gap: "24px" },
] as const;

const FONT_OPTIONS: ReadonlyArray<{ readonly id: StickyFontSize; readonly labelKey: string }> = [
  { id: "small", labelKey: "sticky.fontSmall" },
  { id: "normal", labelKey: "sticky.fontNormal" },
  { id: "large", labelKey: "sticky.fontLarge" },
  { id: "xl", labelKey: "sticky.fontXl" },
];

type FieldId = "color" | "font" | "pin_default" | "restore_size" | "grid_spacing";
type FieldValue = StickyColorId | StickyFontSize | boolean | StickyGridSpacing;
/** One accepted user choice. Only this exact object may settle its field's work. */
type Draft = { readonly value: FieldValue; readonly session: object; readonly operation: object; settledFailure: boolean; retryActive: boolean };
type Drafts = Record<FieldId, Draft | null>;
type Prefs = Record<FieldId, PrefAutosaveAsyncResult<FieldValue>>;

const FIELDS: readonly FieldId[] = ["color", "font", "pin_default", "restore_size", "grid_spacing"];
const LABEL_KEYS: Record<FieldId, string> = {
  color: "sticky.defaultColor",
  font: "sticky.fontSize",
  pin_default: "sticky.pinDefault",
  restore_size: "sticky.restoreSize",
  grid_spacing: "sticky.gridSpacing",
};

const oneOf = <T extends string>(values: readonly T[]) =>
  (value: unknown): value is T => typeof value === "string" && (values as readonly string[]).includes(value);
const isColor = oneOf(STICKY_COLOR_IDS);
const isFont = oneOf(FONT_OPTIONS.map((option) => option.id));
const isSpacing = oneOf(SPACING_OPTIONS.map((option) => option.id));
const isBoolean = (value: unknown): value is boolean => typeof value === "boolean";
const VALIDATORS: Record<FieldId, (value: unknown) => value is FieldValue> = {
  color: isColor,
  font: isFont,
  pin_default: isBoolean,
  restore_size: isBoolean,
  grid_spacing: isSpacing,
};
const isValueFor = (field: FieldId, value: unknown): value is FieldValue => VALIDATORS[field](value);
const emptyDrafts = (): Drafts => ({ color: null, font: null, pin_default: null, restore_size: null, grid_spacing: null });
const withLabel = (template: string, label: string): string => template.replace("{label}", label);

function StickyPaneContent({ lang, registerDepartureGuard }: PaneRenderProps): React.ReactElement {
  const { s } = useI18n(lang);
  const t = localI18n(lang);
  const scope = React.useSyncExternalStore(accountScope.subscribe, accountScope.capture, accountScope.capture);
  const color = usePrefAutosaveAsync("xai_pref_sticky_color" as WebPrefKey, { validate: isColor });
  const font = usePrefAutosaveAsync("xai_pref_sticky_font" as WebPrefKey, { validate: isFont });
  const pin = usePrefAutosaveAsync("xai_pref_sticky_pin_default" as WebPrefKey, { validate: isBoolean });
  const restore = usePrefAutosaveAsync("xai_pref_sticky_restore_size" as WebPrefKey, { validate: isBoolean });
  const spacing = usePrefAutosaveAsync("xai_pref_sticky_grid_spacing" as WebPrefKey, { validate: isSpacing });
  const prefs = { color, font, pin_default: pin, restore_size: restore, grid_spacing: spacing } as unknown as Prefs;
  const prefsRef = React.useRef(prefs);
  prefsRef.current = prefs;
  const scopeRef = React.useRef(scope);
  scopeRef.current = scope;
  const epochRef = React.useRef(scope.epoch);
  const decisionTokenRef = React.useRef<object>({});
  const sessionRef = React.useRef<object>({});
  const aliveRef = React.useRef(true);
  const draftsRef = React.useRef<Drafts>(emptyDrafts());
  const [draftVersion, setDraftVersion] = React.useState(0);
  const [inputErrors, setInputErrors] = React.useState<Partial<Record<FieldId, true>>>({});
  const [exportFailed, setExportFailed] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  // Device work survives every owner change, but an old host decision must refuse.
  if (epochRef.current !== scope.epoch) {
    epochRef.current = scope.epoch;
    decisionTokenRef.current = {};
  }
  // Unmount detaches every capability and late completion; committed writes stay.
  React.useLayoutEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      decisionTokenRef.current = {};
      draftsRef.current = emptyDrafts();
    };
  }, []);

  const changed = React.useCallback(() => setDraftVersion((version) => version + 1), []);
  const liveScope = React.useCallback(
    () => aliveRef.current && accountScope.capture() === scopeRef.current && epochRef.current === scopeRef.current.epoch,
    [],
  );
  const isCurrentDraft = React.useCallback(
    (field: FieldId, draft: Draft | null): draft is Draft =>
      Boolean(draft && liveScope() && draft.session === sessionRef.current && isValueFor(field, draft.value)),
    [liveScope],
  );
  const hasCurrentDraft = React.useCallback(
    () => FIELDS.some((field) => isCurrentDraft(field, draftsRef.current[field])),
    [isCurrentDraft],
  );
  const clearInputError = React.useCallback((field: FieldId) => setInputErrors((errors) => {
    if (!errors[field]) return errors;
    const next = { ...errors };
    delete next[field];
    return next;
  }), []);

  const putDraft = React.useCallback((field: FieldId, value: FieldValue): Draft => {
    const draft: Draft = { value, session: sessionRef.current, operation: {}, settledFailure: false, retryActive: false };
    draftsRef.current[field] = draft;
    clearInputError(field);
    setExportFailed(false);
    setSaved(false);
    changed();
    return draft;
  }, [changed, clearInputError]);
  const settle = React.useCallback((field: FieldId, draft: Draft, ok: boolean) => {
    if (draftsRef.current[field] !== draft) return;
    if (ok) {
      draftsRef.current[field] = null;
      setSaved(true);
      changed();
      return;
    }
    draft.retryActive = false;
    draft.settledFailure = true;
    changed();
  }, [changed]);
  const settlePredecessor = React.useCallback((field: FieldId, draft: Draft, ok: boolean) => {
    // Recovering a failed predecessor only lets the queue continue. Its result
    // never acknowledges this newer draft; a repeated failure may be retried.
    if (ok || draftsRef.current[field] !== draft) return;
    draft.retryActive = false;
    changed();
  }, [changed]);

  const edit = React.useCallback((field: FieldId, value: unknown) => {
    if (!liveScope()) return;
    if (!isValueFor(field, value)) {
      setInputErrors((errors) => (errors[field] ? errors : { ...errors, [field]: true }));
      return;
    }
    const draft = putDraft(field, value);
    void prefsRef.current[field].edit(value).then(
      (result) => settle(field, draft, result.ok),
      () => settle(field, draft, false),
    );
  }, [liveScope, putDraft, settle]);
  const retry = React.useCallback((field: FieldId) => {
    const draft = draftsRef.current[field];
    if (!isCurrentDraft(field, draft) || draft.retryActive) return;
    const pref = prefsRef.current[field];
    const ownFailure = draft.settledFailure;
    const failedPredecessor = !ownFailure && (pref.meta.status === "error" || pref.meta.status === "conflict");
    if (!ownFailure && !failedPredecessor) return;
    draft.retryActive = true;
    if (ownFailure) draft.settledFailure = false;
    changed();
    const attempt = pref.retry();
    if (ownFailure) void attempt.then((result) => settle(field, draft, result.ok), () => settle(field, draft, false));
    else void attempt.then((result) => settlePredecessor(field, draft, result.ok), () => settlePredecessor(field, draft, false));
  }, [changed, isCurrentDraft, settle, settlePredecessor]);
  const discard = React.useCallback((field: FieldId) => {
    const draft = draftsRef.current[field];
    if (!isCurrentDraft(field, draft)) return;
    // Detach first: a late completion of the discarded work can never revive it.
    draftsRef.current[field] = null;
    clearInputError(field);
    changed();
    prefsRef.current[field].meta.reload();
  }, [changed, clearInputError, isCurrentDraft]);
  const discardAll = React.useCallback(() => {
    for (const field of FIELDS) if (isCurrentDraft(field, draftsRef.current[field])) discard(field);
  }, [discard, isCurrentDraft]);
  const reloadSource = React.useCallback((field: FieldId) => {
    // Refused at invocation time while the same field holds actual work.
    if (!liveScope() || draftsRef.current[field] !== null) return;
    clearInputError(field);
    prefsRef.current[field].meta.reload();
  }, [clearInputError, liveScope]);

  const exportDraft = React.useCallback(() => {
    const token = decisionTokenRef.current;
    const stillCurrent = () => liveScope() && decisionTokenRef.current === token && hasCurrentDraft();
    if (!stillCurrent()) return;
    // Memory only: captured drafts, strictly revalidated; never a Storage call.
    const device: Partial<Record<FieldId, FieldValue>> = {};
    for (const field of FIELDS) {
      const draft = draftsRef.current[field];
      if (isCurrentDraft(field, draft)) device[field] = draft.value;
    }
    if (Object.keys(device).length === 0) return;
    let url: string | null = null;
    let anchor: HTMLAnchorElement | null = null;
    try {
      const blob = new Blob([JSON.stringify({ version: 1, kind: "sticky-draft", values: { device } })], { type: "application/json" });
      if (!stillCurrent()) return;
      url = URL.createObjectURL(blob);
      if (!stillCurrent()) return;
      anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "sticky-draft.json";
      anchor.style.display = "none";
      document.body.appendChild(anchor);
      if (!stillCurrent()) return;
      anchor.click();
      if (stillCurrent()) setExportFailed(false);
    } catch {
      if (stillCurrent()) setExportFailed(true);
    } finally {
      try { anchor?.remove(); } catch { /* cleanup never changes recovery */ }
      try { if (url !== null) URL.revokeObjectURL(url); } catch { /* cleanup never changes recovery */ }
    }
  }, [hasCurrentDraft, isCurrentDraft, liveScope]);

  const guardLabel = s("settings.sticky");
  // A fresh registration per epoch carries a fresh decision token; draftVersion
  // also re-registers so the host re-evaluates a held departure on completion.
  React.useEffect(() => {
    if (!registerDepartureGuard) return undefined;
    const token = decisionTokenRef.current;
    const capturedScope = scope;
    const isCurrent = () => decisionTokenRef.current === token && liveScope() && accountScope.capture() === capturedScope;
    const guard: PaneDepartureGuard = {
      token,
      label: guardLabel,
      isCurrent,
      isBlocking: () => isCurrent() && hasCurrentDraft(),
      exportDraft: () => { if (isCurrent()) exportDraft(); },
      discardDraft: () => { if (isCurrent()) discardAll(); },
    };
    return registerDepartureGuard(guard);
  }, [discardAll, draftVersion, exportDraft, guardLabel, hasCurrentDraft, liveScope, registerDepartureGuard, scope]);

  const hasActualDraft = hasCurrentDraft();
  React.useEffect(() => {
    if (!hasActualDraft) return undefined;
    const warn = (event: BeforeUnloadEvent) => {
      if (!aliveRef.current || !FIELDS.some((field) => draftsRef.current[field] !== null)) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [hasActualDraft]);

  const current = (field: FieldId): FieldValue => {
    const draft = draftsRef.current[field];
    return isCurrentDraft(field, draft) ? draft.value : prefsRef.current[field].value;
  };
  // A switch inverts the latest intent (its draft), never the rendered closure.
  const toggle = (field: "pin_default" | "restore_size") => edit(field, current(field) !== true);
  const labelFor = (field: FieldId): string => t(LABEL_KEYS[field]);
  const hasSourceIssue = FIELDS.some((field) => {
    const meta = prefs[field].meta;
    return meta.source === "invalid" || meta.source === "unavailable"
      || meta.status === "error" || meta.status === "conflict" || meta.status === "pending";
  });
  const showSaved = saved && !hasActualDraft && !hasSourceIssue && Object.keys(inputErrors).length === 0;

  const recovery = (field: FieldId): React.ReactElement | null => {
    const meta = prefs[field].meta;
    const active = isCurrentDraft(field, draftsRef.current[field]);
    const sourceOnly = !active && (meta.source === "invalid" || meta.source === "unavailable");
    const inputError = inputErrors[field] === true;
    if (!active && !sourceOnly && !inputError) return null;
    const label = labelFor(field);
    const status = active
      ? withLabel(t(meta.status === "pending" ? "sticky.saving" : "sticky.notSaved"), label)
      : sourceOnly ? withLabel(t("sticky.unavailable"), label) : null;
    return (
      <div className="sticky-recovery-field" role="alert">
        <div className="sticky-recovery-text">
          {inputError && <span>{withLabel(t("sticky.invalid"), label)}</span>}
          {status !== null && <span>{status}</span>}
        </div>
        {active && (
          <>
            <button type="button" onClick={() => retry(field)} aria-label={`${t("sticky.retry")} ${label}`}>{t("sticky.retry")}</button>
            <button type="button" onClick={() => discard(field)} aria-label={`${t("sticky.discard")} ${label}`}>{t("sticky.discard")}</button>
          </>
        )}
        {sourceOnly && (
          <button type="button" onClick={() => reloadSource(field)} aria-label={`${t("sticky.reload")} ${label}`}>{t("sticky.reload")}</button>
        )}
      </div>
    );
  };

  const spacingValue = current("grid_spacing");
  return (
    <div className="sticky-pane">
      <h3 className="pane-title">{s("settings.sticky")}</h3>
      <p className="pane-sub">{t("sticky.desc_en")}</p>

      <h4 className="sl-group">{t("sticky.defaultColor")}</h4>
      <StickyColorPalette
        selected={current("color") as StickyColorId}
        onSelect={(id: StickyColorId) => edit("color", id)}
      />
      {recovery("color")}

      <SettingRow label={t("sticky.fontSize")}>
        <select
          className="sl-select"
          value={current("font") as StickyFontSize}
          onChange={(e) => edit("font", e.target.value)}
          aria-label={t("sticky.fontSize")}
        >
          {FONT_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>{t(option.labelKey)}</option>
          ))}
        </select>
      </SettingRow>
      {recovery("font")}

      <SectionBlock style={{ marginTop: 14 }}>
        <SettingRow label={t("sticky.pinDefault")}>
          <Toggle
            on={current("pin_default") === true}
            onChange={() => toggle("pin_default")}
            ariaLabel={t("sticky.pinDefault")}
          />
        </SettingRow>
        {recovery("pin_default")}
        <SettingRow label={t("sticky.restoreSize")} desc={t("sticky.restoreSizeDesc")}>
          <Toggle
            on={current("restore_size") === true}
            onChange={() => toggle("restore_size")}
            ariaLabel={t("sticky.restoreSize")}
          />
        </SettingRow>
        {recovery("restore_size")}
      </SectionBlock>

      <h4 className="sl-group">{t("sticky.gridSpacing")}</h4>
      <div className="sn-spacing" role="group" aria-label={t("sticky.gridSpacing")}>
        {SPACING_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={"sn-sp" + (spacingValue === opt.id ? " active" : "")}
            onClick={() => edit("grid_spacing", opt.id)}
            aria-pressed={spacingValue === opt.id}
            data-spacing-id={opt.id}
          >
            <div className="sn-sp-row" style={{ gap: opt.gap }}>
              <span className="sn-sp-tile" />
              <span className="sn-sp-tile" />
            </div>
            <div className="sn-sp-label">
              {t(`sticky.space${opt.id.charAt(0).toUpperCase()}${opt.id.slice(1)}` as Parameters<typeof t>[0])}
            </div>
          </button>
        ))}
      </div>
      {recovery("grid_spacing")}

      {hasActualDraft && (
        <div className="sticky-recovery-actions">
          <button type="button" onClick={exportDraft}>{t("sticky.exportDraft")}</button>
          <button type="button" onClick={discardAll}>{t("sticky.discardAll")}</button>
          {exportFailed && <p role="alert">{t("sticky.exportFailed")}</p>}
        </div>
      )}
      {showSaved && <p className="sticky-recovery-saved" role="status">{t("sticky.saved")}</p>}
    </div>
  );
}

export const stickyPane: Pane = {
  id: "sticky",
  icon: "pin",
  i18nKey: "settings.sticky",
  render: (props: PaneRenderProps): React.ReactElement => (
    <StickyPaneContent {...props} />
  ),
};
