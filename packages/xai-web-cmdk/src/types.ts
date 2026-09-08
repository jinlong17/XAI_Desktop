/**
 * @repo/xai-web-cmdk — type definitions.
 *
 * These types form the public contract for the Cmd+K command palette.
 * All types are re-exported from src/index.ts (the ONLY allowed import path).
 *
 * Design snapshot: packages/xai-web-cmdk/docs/design.md
 * API contract: packages/xai-web-cmdk/docs/api.md §1
 * Roadmap row: gap-closure row #3 (xai-web-cmdk-search)
 */

import type { ReactNode } from "react";
import type { WebModuleId } from "@repo/core/types";

// ---- SearchHitKind ----------------------------------------------------------

/**
 * Discriminates the navigation action taken when the user selects a hit.
 *
 * - "module-jump": navigate to /app/<moduleId>; no entity highlight
 * - "entity": navigate to /app/<moduleId>; emit entityId for module-side scrollIntoView
 * - "settings-pane": navigate to /app/settings; emit entityId = paneId
 *
 * api.md §1.1
 */
export type SearchHitKind =
  | "module-jump"
  | "entity"
  | "settings-pane";

// ---- SearchHit --------------------------------------------------------------

/**
 * A single result returned by a module adapter.
 * api.md §1.2
 */
export interface SearchHit {
  /** Stable hit id, formed as `${moduleId}:${entityId ?? "*"}`. Used as React key. */
  readonly id: string;
  /** Source module. */
  readonly moduleId: WebModuleId;
  /** Kind discriminator. */
  readonly kind: SearchHitKind;
  /** Entity id (card id, session id, pane id, etc.). Absent for "module-jump". */
  readonly entityId?: string;
  /** Display label — bilingual; renderer picks based on current lang. */
  readonly label: { readonly en: string; readonly zh: string };
  /** Optional sub-label for context (e.g., "Pomodoro · 25 min · 2026-05-10"). */
  readonly sub?: { readonly en: string; readonly zh: string };
  /** Score for ranking. Higher = better. Range [0, 100]. */
  readonly score: number;
  /**
   * Optional match-highlight metadata. Adapter populates matchSpans so the
   * renderer can wrap matched substrings with <mark>. If absent, renderer
   * falls back to a single-pass escapeHtml(label) with no <mark> wrapping.
   */
  readonly matchSpans?: ReadonlyArray<{
    readonly start: number;
    readonly end: number;
    readonly source: "en" | "zh";
  }>;
}

// ---- ModuleSearchAdapter ----------------------------------------------------

/**
 * Contract every adapter must satisfy.
 *
 * - Pure function (no side effects, no I/O).
 * - Never throws; wraps body in try/catch; returns [] on failure.
 * - Receives state as unknown (boundary cast pattern).
 * - Query is already lowercased by the caller.
 * - Returns at most 20 hits.
 * - Empty query returns up to 1 hit (the module-jump entry).
 *
 * api.md §1.3
 */
export type ModuleSearchAdapter = (
  query: string,
  state: unknown,
) => readonly SearchHit[];

// ---- UseCommandPalette ------------------------------------------------------

/**
 * Shape returned by the useCommandPalette() hook.
 * api.md §1.4
 */
export interface UseCommandPalette {
  /** Open the palette. */
  open: (opts?: { source?: "shortcut" | "topbar-click" | "programmatic" }) => void;
  /** Close the palette. */
  close: () => void;
  /** Whether the palette is currently open. */
  isOpen: boolean;
  /** Current query string. */
  query: string;
  /** Set the query string. */
  setQuery: (next: string) => void;
}

// ---- CommandPaletteProps ----------------------------------------------------

/**
 * Props for <CommandPalette/>.
 * api.md §1.5
 *
 * O1 resolution: lang is an optional test-override. When absent,
 * <CommandPalette/> reads lang from useWebShell().lang at runtime.
 * Passing lang explicitly is useful in unit tests (no provider needed).
 */
export interface CommandPaletteProps {
  /**
   * Lang used to render bilingual labels + i18n strings.
   * Optional — defaults to useWebShell().lang when not provided.
   * Provide explicitly in tests to avoid needing a WebShellProvider.
   */
  lang?: "en" | "zh";
  /** Optional override for navigate; default uses useNavigate() from react-router. */
  navigate?: (path: string) => void;
}

// ---- CommandPaletteProviderProps --------------------------------------------

/**
 * Props for <CommandPaletteProvider/>.
 * api.md §1.6
 */
export interface CommandPaletteProviderProps {
  children: ReactNode;
}
