/**
 * @internal — the App-scoped Appearance controller (CP-APPEARANCE-01).
 *
 * The seven Appearance fields are unscoped device preferences. Each binds the
 * accepted async autosave engine with a strict validator, in a fixed hook
 * order: the four root keys (`xai_pref_lang`, `xai_pref_theme`,
 * `xai_pref_density`, `xai_pref_font_scale`) through the open-ended suffix
 * path with the `json` codec, the three registered keys (`xai_accent_hue`,
 * `xai_rail_pos`, `xai_bg_tone`) through the registered path. Every valid
 * edit (pane or Topbar) and every Reset to defaults intent becomes the field's
 * exact draft object, and only that object may settle the field:
 *
 * - a draft displays and applies immediately; a set draft shows its chosen
 *   value, a reset draft the default, and only the matching latest success
 *   clears it (verified bytes, verified absence or the engine's verified
 *   no-op). Retry re-runs the field's own held request, so a reset is retried
 *   as a removal and keeps its refusal or uncertainty authority;
 * - Reset to defaults is a pane-scoped batch of six per-key engine resets:
 *   language is never touched; no rollback and no broadcast;
 * - invalid or unreadable stored bytes are source-only: the default is shown
 *   and applied, Reload rereads, and nothing is ever rewritten;
 * - Retry all is one pass over E (the fields whose draft is settled
 *   unsuccessful), computed live at activation; each member's per-field Retry
 *   runs exactly once and its outcome is attributed to the exact draft;
 * - the controller applies the display values to `<html>`, keeps a
 *   `beforeunload` warning while drafts exist and owns the sign-out step.
 *
 * Contract: docs/reviews/web-appearance-recovery-contract/contract.md r3,
 * A2–A7 and §5–§8.
 */

import * as React from "react";
import { usePrefAutosaveAsync } from "@repo/plugin-web-storage";
import type { PrefAutosaveAsyncResult, PrefMutationResult, UsePrefAutosaveAsyncDynamicOptions } from "@repo/plugin-web-storage";
import {
  applyAccentHue,
  applyBgTone,
  applyDensity,
  applyFontScale,
  applyRailPos,
  applyTheme,
} from "@repo/plugin-web-tokens";
import type { BgTone, Density, Lang, RailPos, Theme } from "@repo/plugin-web-tokens";
import { appearanceDefaults } from "../appearanceDefaults.js";
import type {
  AppearanceController,
  AppearanceFieldId,
  AppearanceFieldState,
  AppearanceProviderProps,
  AppearanceStatusLine,
  AppearanceValues,
} from "../types.js";
import { appearanceRecoveryCopy } from "./appearanceRecoveryCopy.js";

// ---- Fields, strict domains and defaults (contract §2) ------------------------

/** The pane's display order; also Retry all's order (A2.3). */
export const APPEARANCE_FIELD_ORDER: readonly AppearanceFieldId[] = [
  "lang", "theme", "density", "accentHue", "bgTone", "railPos", "fontScale",
];
/** The six Reset to defaults fields: language is kept (§6). */
const RESET_FIELDS: readonly AppearanceFieldId[] = ["theme", "density", "accentHue", "bgTone", "railPos", "fontScale"];
const RESET_FIELD_SET: ReadonlySet<AppearanceFieldId> = new Set(RESET_FIELDS);
const DEFAULTS: AppearanceValues = Object.freeze({ lang: "en", ...appearanceDefaults });
const BG_TONE_IDS: readonly string[] = ["default", "cream", "mist", "lavender", "peach", "graphite"];

const isLang = (value: unknown): value is Lang => value === "en" || value === "zh";
const isTheme = (value: unknown): value is Theme => value === "light" || value === "dark" || value === "system";
const isDensity = (value: unknown): value is Density => value === "comfortable" || value === "compact";
const isFontScale = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0.85 && value <= 1.15;
const isAccentHue = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 360;
const isRailPos = (value: unknown): value is RailPos =>
  value === "left" || value === "right" || value === "top" || value === "bottom";
/** The six tokens tones; storage's widened `"sage"` is outside the strict domain. */
const isBgTone = (value: unknown): value is BgTone => typeof value === "string" && BG_TONE_IDS.includes(value);

type Validators = { readonly [K in AppearanceFieldId]: (value: unknown) => value is AppearanceValues[K] };
const VALIDATORS: Validators = {
  lang: isLang,
  theme: isTheme,
  density: isDensity,
  accentHue: isAccentHue,
  bgTone: isBgTone,
  railPos: isRailPos,
  fontScale: isFontScale,
};

// Open-ended suffix bindings of the four root keys: json codec, today's exact bytes.
const LANG_BINDING: UsePrefAutosaveAsyncDynamicOptions<Lang> = { codec: "json", defaultValue: DEFAULTS.lang, validate: isLang };
const THEME_BINDING: UsePrefAutosaveAsyncDynamicOptions<Theme> = { codec: "json", defaultValue: DEFAULTS.theme, validate: isTheme };
const DENSITY_BINDING: UsePrefAutosaveAsyncDynamicOptions<Density> = { codec: "json", defaultValue: DEFAULTS.density, validate: isDensity };
const FONT_SCALE_BINDING: UsePrefAutosaveAsyncDynamicOptions<number> = { codec: "json", defaultValue: DEFAULTS.fontScale, validate: isFontScale };
// Registered bindings keep their registry codec and default; the caller adds the strict domain.
const ACCENT_BINDING = { validate: isAccentHue } as const;
const RAIL_BINDING = { validate: isRailPos } as const;
const BG_TONE_BINDING = { validate: isBgTone } as const;

// ---- Operation model ----------------------------------------------------------

type FieldValue = AppearanceValues[AppearanceFieldId];
type Bindings = { readonly [K in AppearanceFieldId]: PrefAutosaveAsyncResult<AppearanceValues[K]> };
type BindingMeta = Bindings[AppearanceFieldId]["meta"];

/** One admitted intent. Only this exact object may settle its field's work. */
interface Draft {
  readonly operation: "set" | "reset";
  /** Displayed intent: the chosen value, or the default for a reset. */
  readonly value: FieldValue;
  /**
   * The binding meta rendered when the intent was admitted. A rendered engine
   * status is only trusted for this draft once a later render exists.
   */
  readonly admittedMeta: BindingMeta;
  /** Reset batch that counts this intent toward "Defaults restored." (null for a set). */
  batch: object | null;
  /** The draft's own request failed and nothing is re-attempting it. */
  settledFailure: boolean;
  /** A Retry for this draft (its own request or a held predecessor) is in flight. */
  retryActive: boolean;
}
type Drafts = Record<AppearanceFieldId, Draft | null>;

/** One Retry all activation: members are (field, exact draft at activation). */
interface Pass {
  readonly pending: Map<AppearanceFieldId, Draft>;
  readonly succeeded: Draft[];
  failed: number;
}

interface ControllerState {
  bindings: Bindings;
  displayLang: Lang;
  alive: boolean;
  drafts: Drafts;
  passes: Pass[];
  resetBatch: object | null;
  outcome: "saved" | "restored" | null;
  exportFailed: boolean;
  paneCount: number;
}

type Operations = Omit<
  AppearanceController,
  "values" | "fieldStates" | "hasDraft" | "unsavedCount" | "retryAllEnabled" | "passOpen" | "statusLine"
> & { readonly canRetry: (field: AppearanceFieldId) => boolean };

const emptyDrafts = (): Drafts => ({
  lang: null,
  theme: null,
  density: null,
  accentHue: null,
  bgTone: null,
  railPos: null,
  fontScale: null,
});

const refusal = (): Promise<PrefMutationResult<unknown>> => Promise.resolve({ ok: false, reason: "storage" });

function createOperations(state: ControllerState, notify: () => void): Operations {
  const anyDraft = (): boolean => APPEARANCE_FIELD_ORDER.some((id) => state.drafts[id] !== null);
  const clearPaneLine = (): void => {
    state.exportFailed = false;
    state.outcome = null;
  };

  /** The rendered engine status shows a held failed request for this draft's field. */
  const failedShown = (id: AppearanceFieldId, draft: Draft): boolean => {
    const meta = state.bindings[id].meta;
    return meta !== draft.admittedMeta && (meta.status === "error" || meta.status === "conflict");
  };
  /**
   * Membership of E, from live operation state: the field has an actual draft,
   * nothing for it is in flight or runnable, and its queue is held by a failed
   * request. A reset draft is only eligible while the engine holds its failed
   * request, so its Retry is always a removal and never the hook's set path.
   */
  const canRetry = (id: AppearanceFieldId): boolean => {
    if (!state.alive) return false;
    const draft = state.drafts[id];
    if (draft === null || draft.retryActive) return false;
    const failed = failedShown(id, draft);
    if (draft.settledFailure) return draft.operation === "set" || failed;
    return failed;
  };

  const closePass = (pass: Pass): void => {
    state.passes = state.passes.filter((open) => open !== pass);
    if (pass.failed > 0) {
      state.outcome = null;
      return;
    }
    // Superseded and detached members are ignored; with no success the general rules apply.
    if (pass.succeeded.length === 0) return;
    if (state.paneCount === 0 || anyDraft() || state.passes.length > 0) {
      state.outcome = null;
      return;
    }
    const batch = state.resetBatch;
    const restored = batch !== null && pass.succeeded.every((draft) => draft.operation === "reset" && draft.batch === batch);
    if (restored) state.resetBatch = null;
    state.outcome = restored ? "restored" : "saved";
  };
  const isPendingMember = (id: AppearanceFieldId, draft: Draft): boolean =>
    state.passes.some((pass) => pass.pending.get(id) === draft);
  const resolveMember = (id: AppearanceFieldId, draft: Draft, outcome: "succeeded" | "failed" | "gone"): void => {
    for (const pass of state.passes.slice()) {
      if (pass.pending.get(id) !== draft) continue;
      pass.pending.delete(id);
      if (outcome === "succeeded") pass.succeeded.push(draft);
      else if (outcome === "failed") pass.failed += 1;
      if (pass.pending.size === 0) closePass(pass);
    }
  };

  /** A genuine latest success outside a pass: claimed only while a pane is mounted and nothing is left. */
  const recordSuccess = (draft: Draft): void => {
    if (state.paneCount === 0 || anyDraft() || state.passes.length > 0) {
      state.outcome = null;
      return;
    }
    if (draft.operation === "reset" && draft.batch !== null && draft.batch === state.resetBatch) {
      state.resetBatch = null;
      state.outcome = "restored";
      return;
    }
    state.outcome = "saved";
  };

  const settle = (id: AppearanceFieldId, draft: Draft, ok: boolean): void => {
    // Superseded, discarded or detached work never revives or clears newer work.
    if (!state.alive || state.drafts[id] !== draft) return;
    if (!ok) {
      draft.retryActive = false;
      draft.settledFailure = true;
      resolveMember(id, draft, "failed");
      notify();
      return;
    }
    state.drafts[id] = null;
    // The export-failure line belongs to drafts: the last draft clearing clears it.
    if (!anyDraft()) state.exportFailed = false;
    if (isPendingMember(id, draft)) resolveMember(id, draft, "succeeded");
    else recordSuccess(draft);
    notify();
  };
  const settlePredecessor = (id: AppearanceFieldId, draft: Draft, ok: boolean): void => {
    // Recovering a failed predecessor only lets the field's queue continue. Its
    // result never acknowledges this newer draft; a repeated failure stays retryable.
    if (ok || !state.alive || state.drafts[id] !== draft) return;
    draft.retryActive = false;
    resolveMember(id, draft, "failed");
    notify();
  };

  /** Establishes a field's identity and operation before anything is enqueued. */
  const admit = (id: AppearanceFieldId, operation: Draft["operation"], value: FieldValue, batch: object | null): Draft => {
    const previous = state.drafts[id];
    const draft: Draft = {
      operation,
      value,
      admittedMeta: state.bindings[id].meta,
      batch,
      settledFailure: false,
      retryActive: false,
    };
    state.drafts[id] = draft;
    if (previous !== null) resolveMember(id, previous, "gone");
    return draft;
  };
  const submit = (id: AppearanceFieldId, draft: Draft): void => {
    const binding = state.bindings[id] as PrefAutosaveAsyncResult<FieldValue>;
    let request: Promise<PrefMutationResult<unknown>>;
    try {
      request = draft.operation === "reset" ? binding.reset() : binding.edit(draft.value);
    } catch {
      request = refusal();
    }
    void request.then((result) => settle(id, draft, result.ok), () => settle(id, draft, false));
  };

  const edit = <K extends AppearanceFieldId>(id: K, value: AppearanceValues[K]): void => {
    if (!state.alive || !VALIDATORS[id](value)) return;
    // A newer contrary edit supersedes any pending "Defaults restored." claim.
    if (RESET_FIELD_SET.has(id)) state.resetBatch = null;
    const draft = admit(id, "set", value, null);
    clearPaneLine();
    submit(id, draft);
    notify();
  };

  /** Starts exactly one attempt of the field's held failed request. */
  const startRetry = (id: AppearanceFieldId): boolean => {
    if (!canRetry(id)) return false;
    const draft = state.drafts[id];
    if (draft === null) return false;
    const ownFailure = draft.settledFailure;
    draft.retryActive = true;
    draft.settledFailure = false;
    let attempt: Promise<PrefMutationResult<unknown>>;
    try {
      attempt = state.bindings[id].retry();
    } catch {
      attempt = refusal();
    }
    if (ownFailure) void attempt.then((result) => settle(id, draft, result.ok), () => settle(id, draft, false));
    else void attempt.then((result) => settlePredecessor(id, draft, result.ok), () => settlePredecessor(id, draft, false));
    return true;
  };

  /** Detaches a field's work before the safe reload: zero writes, rereads only this field. */
  const detach = (id: AppearanceFieldId): boolean => {
    const draft = state.drafts[id];
    if (draft === null) return false;
    state.drafts[id] = null;
    if (draft.batch !== null && draft.batch === state.resetBatch) state.resetBatch = null;
    resolveMember(id, draft, "gone");
    try {
      state.bindings[id].meta.reload();
    } catch {
      /* the detached draft stays detached */
    }
    return true;
  };

  return {
    canRetry,
    setLang: (next) => edit("lang", next),
    setTheme: (next) => edit("theme", next),
    setDensity: (next) => edit("density", next),
    setAccentHue: (next) => edit("accentHue", next),
    setRailPos: (next) => edit("railPos", next),
    setFontScale: (next) => edit("fontScale", next),
    chooseBgTone: (tone, hue) => {
      if (!isBgTone(tone) || !isAccentHue(hue)) return;
      edit("bgTone", tone);
      edit("accentHue", hue);
    },
    retry: (id) => {
      if (!canRetry(id)) return;
      clearPaneLine();
      startRetry(id);
      notify();
    },
    discard: (id) => {
      if (!state.alive || !detach(id)) return;
      clearPaneLine();
      notify();
    },
    reload: (id) => {
      // Refused at invocation time while the same field holds actual work.
      if (!state.alive || state.drafts[id] !== null) return;
      // A source repair rereads; it never claims a save by itself.
      clearPaneLine();
      try {
        state.bindings[id].meta.reload();
      } catch {
        /* the source stays as it is */
      }
      notify();
    },
    discardAll: () => {
      if (!state.alive) return;
      let detached = false;
      for (const id of APPEARANCE_FIELD_ORDER) if (detach(id)) detached = true;
      if (!detached) return;
      clearPaneLine();
      notify();
    },
    retryAll: () => {
      if (!state.alive) return;
      // E is derived from live operation state at activation, never from the last render.
      const members = APPEARANCE_FIELD_ORDER.filter(canRetry);
      if (members.length === 0) return;
      clearPaneLine();
      const pass: Pass = { pending: new Map(), succeeded: [], failed: 0 };
      for (const id of members) {
        const draft = state.drafts[id];
        if (draft !== null) pass.pending.set(id, draft);
      }
      state.passes = [...state.passes, pass];
      // Each member's per-field Retry, exactly once, before any asynchronous settlement.
      for (const id of members) if (!startRetry(id)) pass.pending.delete(id);
      if (pass.pending.size === 0) state.passes = state.passes.filter((open) => open !== pass);
      notify();
    },
    exportDraft: () => {
      const live = (): boolean => state.alive && anyDraft();
      if (!live()) return;
      // Memory only: captured, strictly validated drafts; never a Storage call.
      const device: Partial<Record<AppearanceFieldId, { operation: "set"; value: FieldValue } | { operation: "reset" }>> = {};
      for (const id of APPEARANCE_FIELD_ORDER) {
        const draft = state.drafts[id];
        if (draft === null || (draft.operation === "set" && !VALIDATORS[id](draft.value))) continue;
        device[id] = draft.operation === "reset" ? { operation: "reset" } : { operation: "set", value: draft.value };
      }
      if (Object.keys(device).length === 0) return;
      const before = state.exportFailed;
      let failed = false;
      let url: string | null = null;
      let anchor: HTMLAnchorElement | null = null;
      try {
        const blob = new Blob([JSON.stringify({ version: 1, kind: "appearance-draft", changes: { device } })], { type: "application/json" });
        if (!live()) return;
        url = URL.createObjectURL(blob);
        if (!live()) return;
        anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "appearance-draft.json";
        anchor.style.display = "none";
        document.body.appendChild(anchor);
        if (!live()) return;
        anchor.click();
      } catch {
        failed = true;
      } finally {
        try { anchor?.remove(); } catch { /* cleanup never changes recovery */ }
        try { if (url !== null) URL.revokeObjectURL(url); } catch { /* cleanup never changes recovery */ }
      }
      if (!state.alive) return;
      state.exportFailed = failed;
      if (failed !== before) notify();
    },
    resetToDefaults: (confirmReset) => {
      if (!state.alive) return;
      let accepted = false;
      try {
        accepted = confirmReset() === true;
      } catch {
        accepted = false;
      }
      if (!accepted || !state.alive) return;
      clearPaneLine();
      const current = state.resetBatch;
      const unresolved = current === null ? [] : RESET_FIELDS.filter((id) => state.drafts[id]?.batch === current);
      if (unresolved.length > 0) {
        // A duplicate activation enqueues no duplicate removal: pending resets
        // continue, and failed ones re-attempt only their own removal.
        for (const id of unresolved) if (state.drafts[id]?.settledFailure) startRetry(id);
        notify();
        return;
      }
      // Synchronously admit six typed reset intents and one batch identity.
      const batch = {};
      state.resetBatch = batch;
      const admitted: Array<readonly [AppearanceFieldId, Draft]> = [];
      const failedResets: AppearanceFieldId[] = [];
      for (const id of RESET_FIELDS) {
        const existing = state.drafts[id];
        if (existing !== null && existing.operation === "reset") {
          // An unresolved reset keeps its own request and authority; it is never rebased.
          existing.batch = batch;
          if (existing.settledFailure) failedResets.push(id);
          continue;
        }
        admitted.push([id, admit(id, "reset", DEFAULTS[id], batch)]);
      }
      for (const [id, draft] of admitted) submit(id, draft);
      for (const id of failedResets) startRetry(id);
      notify();
    },
    confirmSignOut: async () => {
      if (!state.alive || !anyDraft()) return true;
      let proceed = false;
      try {
        proceed = window.confirm(appearanceRecoveryCopy(state.displayLang).confirmSignOut) === true;
      } catch {
        proceed = false;
      }
      if (!proceed) return false;
      // OK discards every draft with zero set or remove attempts; late completions are ignored.
      for (const id of APPEARANCE_FIELD_ORDER) detach(id);
      clearPaneLine();
      notify();
      return true;
    },
    attachPane: () => {
      state.paneCount += 1;
      let attached = true;
      return () => {
        if (!attached) return;
        attached = false;
        state.paneCount -= 1;
      };
    },
  };
}

function displayValue<K extends AppearanceFieldId>(id: K, draft: Draft | null, stored: unknown): AppearanceValues[K] {
  if (draft !== null && VALIDATORS[id](draft.value)) return draft.value;
  return VALIDATORS[id](stored) ? stored : DEFAULTS[id];
}

/** Applies a display value to `<html>`; never throws (the values are strictly validated). */
function applySafely(apply: () => void): void {
  try {
    apply();
  } catch {
    /* an environment without matchMedia keeps the previous attribute */
  }
}

const NONE: AppearanceStatusLine = { kind: "none" };
const RETRYING: AppearanceStatusLine = { kind: "retrying" };
const EXPORT_FAILED: AppearanceStatusLine = { kind: "export-failed" };

/**
 * Creates the Appearance controller. Call it once per owner: App calls it once
 * inside `AccountStorageGate`; a standalone pane owns its own instance.
 */
export function useAppearanceController(): AppearanceController {
  // One strict binding per key, in display order; the count and hook order never change.
  const lang = usePrefAutosaveAsync("lang", LANG_BINDING);
  const theme = usePrefAutosaveAsync("theme", THEME_BINDING);
  const density = usePrefAutosaveAsync("density", DENSITY_BINDING);
  const accentHue = usePrefAutosaveAsync("xai_accent_hue", ACCENT_BINDING);
  // Strictly validated to the six tokens tones, so storage's widened union never surfaces.
  const bgTone = usePrefAutosaveAsync("xai_bg_tone", BG_TONE_BINDING) as unknown as PrefAutosaveAsyncResult<BgTone>;
  const railPos = usePrefAutosaveAsync("xai_rail_pos", RAIL_BINDING);
  const fontScale = usePrefAutosaveAsync("font_scale", FONT_SCALE_BINDING);
  const bindings: Bindings = { lang, theme, density, accentHue, bgTone, railPos, fontScale };

  const [, setVersion] = React.useState(0);
  const [{ state, operations }] = React.useState(() => {
    const initial: ControllerState = {
      bindings,
      displayLang: DEFAULTS.lang,
      alive: true,
      drafts: emptyDrafts(),
      passes: [],
      resetBatch: null,
      outcome: null,
      exportFailed: false,
      paneCount: 0,
    };
    return { state: initial, operations: createOperations(initial, () => setVersion((version) => version + 1)) };
  });
  state.bindings = bindings;

  const drafts = state.drafts;
  const values: AppearanceValues = {
    lang: displayValue("lang", drafts.lang, lang.value),
    theme: displayValue("theme", drafts.theme, theme.value),
    density: displayValue("density", drafts.density, density.value),
    accentHue: displayValue("accentHue", drafts.accentHue, accentHue.value),
    bgTone: displayValue("bgTone", drafts.bgTone, bgTone.value),
    railPos: displayValue("railPos", drafts.railPos, railPos.value),
    fontScale: displayValue("fontScale", drafts.fontScale, fontScale.value),
  };
  state.displayLang = values.lang;

  const fieldStates = {} as Record<AppearanceFieldId, AppearanceFieldState>;
  for (const id of APPEARANCE_FIELD_ORDER) {
    const draft = drafts[id];
    const meta = bindings[id].meta;
    if (draft !== null) {
      const failed = !draft.retryActive
        && (draft.settledFailure || (meta !== draft.admittedMeta && (meta.status === "error" || meta.status === "conflict")));
      fieldStates[id] = draft.operation === "reset" ? (failed ? "not-reset" : "resetting") : (failed ? "not-saved" : "saving");
    } else {
      fieldStates[id] = meta.source === "invalid" || meta.source === "unavailable" ? "unavailable" : "clean";
    }
  }
  const eligible = APPEARANCE_FIELD_ORDER.filter(operations.canRetry);
  const hasDraft = APPEARANCE_FIELD_ORDER.some((id) => drafts[id] !== null);
  const passOpen = state.passes.length > 0;
  const quiet = !hasDraft && APPEARANCE_FIELD_ORDER.every((id) => {
    const meta = bindings[id].meta;
    return (meta.source === "valid" || meta.source === "absent") && (meta.status === "idle" || meta.status === "saved");
  });
  let statusLine: AppearanceStatusLine = NONE;
  if (passOpen) statusLine = RETRYING;
  else if (state.exportFailed && hasDraft) statusLine = EXPORT_FAILED;
  else if (eligible.length > 0) statusLine = { kind: "not-saved", count: eligible.length };
  else if (quiet && state.outcome !== null) statusLine = { kind: state.outcome };

  // Unmount detaches every member, callback and late completion; committed writes stay.
  React.useLayoutEffect(() => {
    state.alive = true;
    return () => {
      state.alive = false;
      state.drafts = emptyDrafts();
      state.passes = [];
      state.resetBatch = null;
      state.outcome = null;
      state.exportFailed = false;
    };
  }, [state]);

  // DOM application of the display values (formerly App.tsx's apply* effects).
  React.useLayoutEffect(() => { applySafely(() => applyTheme(values.theme)); }, [values.theme]);
  React.useLayoutEffect(() => { applySafely(() => applyDensity(values.density)); }, [values.density]);
  React.useLayoutEffect(() => { applySafely(() => applyFontScale(values.fontScale)); }, [values.fontScale]);
  React.useLayoutEffect(() => { applySafely(() => applyAccentHue(values.accentHue)); }, [values.accentHue]);
  React.useLayoutEffect(() => { applySafely(() => applyBgTone(values.bgTone)); }, [values.bgTone]);
  React.useLayoutEffect(() => { applySafely(() => applyRailPos(values.railPos)); }, [values.railPos]);
  // The system theme follows its media query while it is displayed.
  React.useEffect(() => {
    if (values.theme !== "system" || typeof window === "undefined" || typeof window.matchMedia !== "function") return undefined;
    let query: MediaQueryList;
    try {
      query = window.matchMedia("(prefers-color-scheme: dark)");
    } catch {
      return undefined;
    }
    if (typeof query?.addEventListener !== "function") return undefined;
    const onChange = (): void => applySafely(() => applyTheme("system"));
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [values.theme]);

  // A cancelable warning while any draft exists (not crash durability); never a Storage call.
  React.useEffect(() => {
    if (!hasDraft) return undefined;
    const warn = (event: BeforeUnloadEvent): void => {
      if (!state.alive || !APPEARANCE_FIELD_ORDER.some((id) => state.drafts[id] !== null)) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [hasDraft, state]);

  return {
    values,
    fieldStates,
    hasDraft,
    unsavedCount: eligible.length,
    retryAllEnabled: eligible.length > 0,
    passOpen,
    statusLine,
    setLang: operations.setLang,
    setTheme: operations.setTheme,
    setDensity: operations.setDensity,
    setAccentHue: operations.setAccentHue,
    setRailPos: operations.setRailPos,
    setFontScale: operations.setFontScale,
    chooseBgTone: operations.chooseBgTone,
    retry: operations.retry,
    discard: operations.discard,
    reload: operations.reload,
    discardAll: operations.discardAll,
    retryAll: operations.retryAll,
    exportDraft: operations.exportDraft,
    resetToDefaults: operations.resetToDefaults,
    confirmSignOut: operations.confirmSignOut,
    attachPane: operations.attachPane,
  };
}

// ---- Provider -------------------------------------------------------------------

/** The App-scoped controller, provided to the pane and the Topbar status. */
export const AppearanceControllerContext = React.createContext<AppearanceController | null>(null);

/** Provides an existing controller (created once by the host) to its subtree. */
export function AppearanceProvider({ controller, children }: AppearanceProviderProps): React.ReactElement {
  return <AppearanceControllerContext.Provider value={controller}>{children}</AppearanceControllerContext.Provider>;
}
