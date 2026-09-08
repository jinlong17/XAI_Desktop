/**
 * @repo/plugin-web-pet — public barrel.
 *
 * This file is the ONLY public surface of this package.
 * Consumers MUST NOT import from src/internal/* directly.
 *
 * Side-effect: imports pet.css so keyframes are injected into the
 * document stylesheet when this module is loaded. Declared as a
 * sideEffect in package.json so Vite/Rollup does not tree-shake it.
 */

// Side-effect CSS import (must come first)
import "./pet.css";

// Components
export { DesktopPet } from "./DesktopPet.js";
export { PetPicker } from "./PetPicker.js";

// Catalog
export { PET_DEFS } from "./internal/petDefs.js";

// Types
export type {
  DesktopPetProps,
  PetPickerProps,
  PetDef,
  PetAnim,
  PetId,
  PetPos,
  Lang,
} from "./types.js";
