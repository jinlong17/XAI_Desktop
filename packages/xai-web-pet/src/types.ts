/**
 * Public types for @repo/plugin-web-pet.
 *
 * DesktopPetProps — props for the top-level DesktopPet component.
 * PetPickerProps  — props for the standalone PetPicker modal.
 * PetDef          — one entry in the PET_DEFS catalog.
 * PetAnim         — union of the 7 named CSS keyframe identifiers.
 *
 * PetId and PetPos are imported from @repo/plugin-web-storage to avoid
 * duplicating the canonical type. Re-export them here so consumers can
 * import everything pet-related from one place.
 */

import type { PetId, PetPos } from "@repo/plugin-web-storage";
import type { Lang } from "@repo/plugin-web-tokens";

// Re-export so consuming code can do a single import from this package.
export type { PetId, PetPos, Lang };

/** The 7 named CSS animation identifiers. */
export type PetAnim =
  | "bob"
  | "hop"
  | "sway"
  | "glow"
  | "still"
  | "twinkle"
  | "flicker";

/** One entry in the PET_DEFS catalog. */
export interface PetDef {
  readonly id: PetId;
  readonly anim: PetAnim;
  readonly name: { readonly en: string; readonly zh: string };
  readonly desc: { readonly en: string; readonly zh: string };
}

/** Props for the DesktopPet root component. */
export interface DesktopPetProps {
  /**
   * Visibility flag. When false, the pet body is unmounted but PetPicker
   * may still render if pickerOpen was true at toggle-off.
   * Authoritative source: apps/web/src/App.tsx `petOn` useState.
   */
  on: boolean;

  /**
   * Active UI language. Drives useI18n(lang) for tip strings and picker chrome.
   * Authoritative source: apps/web/src/App.tsx `lang` useState.
   */
  lang: Lang;
}

/** Props for the standalone PetPicker modal overlay. */
export interface PetPickerProps {
  open: boolean;
  onClose: () => void;
  current: PetId;
  onSelect: (next: PetId) => void;
  lang: Lang;
}
