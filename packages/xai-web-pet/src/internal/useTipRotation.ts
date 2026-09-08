/**
 * useTipRotation — encapsulates the prototype's auto-rotating tip bubble.
 *
 * Port of web design/pet.jsx lines 219-233 (the tip useEffect).
 *
 * Behaviour:
 * - When on===true AND !pickerOpen: immediately show tips[0], dismiss at
 *   TIP_FIRST_DISMISS_MS, then cycle every TIP_CYCLE_MS (null gap → TIP_REGROW_MS → next).
 * - When on===false OR pickerOpen: effect does not run; bubble clears.
 * - Both timers are cleaned up on unmount / dep change (StrictMode-safe).
 *
 * Returns nothing — calls setBubble directly. The bubble state lives in the
 * parent component (DesktopPet) and is passed as a setter reference.
 */

import { useEffect } from "react";
import { useI18n } from "@repo/plugin-web-tokens";
import type { Lang } from "../types.js";
import {
  TIP_CYCLE_MS,
  TIP_FIRST_DISMISS_MS,
  TIP_REGROW_MS,
} from "./timing.js";

interface UseTipRotationOptions {
  on: boolean;
  lang: Lang;
  pickerOpen: boolean;
  setBubble: (text: string | null) => void;
}

export function useTipRotation({
  on,
  lang,
  pickerOpen,
  setBubble,
}: UseTipRotationOptions): void {
  const { s } = useI18n(lang);

  useEffect(() => {
    if (!on || pickerOpen) return;

    const tips = [
      s("pet.hello"),
      s("pet.tip1"),
      s("pet.tip2"),
      s("pet.tip3"),
      s("pet.tip4"),
    ];

    let i = 0;
    setBubble(tips[0] ?? null);

    const dismiss = setTimeout(() => setBubble(null), TIP_FIRST_DISMISS_MS);

    const cycle = setInterval(() => {
      i = (i + 1) % tips.length;
      setBubble(null);
      setTimeout(() => setBubble(tips[i] ?? null), TIP_REGROW_MS);
    }, TIP_CYCLE_MS);

    return () => {
      clearInterval(cycle);
      clearTimeout(dismiss);
    };
  }, [on, lang, pickerOpen, setBubble, s]);
}
