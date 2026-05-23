/**
 * Canonical type declarations for @repo/plugin-web-matrix.
 *
 * These types are re-exported via index.ts (the only public surface).
 * The storage layer uses MatrixStateBlob = unknown; callers cast through here.
 *
 * ADR anchor: docs/adr/0007-xai-web-console-build-form.md §S4
 * Frozen assumptions: design.md §1.1 items 3-4
 */

import type { Lang } from "@repo/plugin-web-tokens";

/** Four-quadrant priority signal. Same string literal as event-channel payload. */
export type Quadrant = "q1" | "q2" | "q3" | "q4";

/** A card displayed inside a matrix quadrant. */
export interface MatrixCard {
  /** Stable opaque id; consumer must not reuse across cards. */
  readonly id: string;
  /** Bilingual title. Both langs MUST be present. */
  readonly title: { en: string; zh: string };
  /** Optional ISO-like display date for the EN locale (matches prototype `t.date`). */
  readonly date?: string;
  /** Optional ZH-locale display date string (matches prototype `t.dateZh`). */
  readonly dateZh?: string;
  /** Optional tag/label class — matches the prototype's `t.tag` field. */
  readonly tag?: string;
  /** Reserved for a future xai-web-tasks join — undefined in v1. */
  readonly taskId?: string;
}

/** Persisted matrix shape. Single JSON blob in `xai_matrix_state`. */
export interface MatrixState {
  readonly schemaVersion: 1;
  readonly q1: readonly MatrixCard[];
  readonly q2: readonly MatrixCard[];
  readonly q3: readonly MatrixCard[];
  readonly q4: readonly MatrixCard[];
}

/** Props for `<MatrixModule/>`. */
export interface MatrixModuleProps {
  /** Active UI language. Drives `useI18n(lang)` inside the module. */
  lang: Lang;
}
