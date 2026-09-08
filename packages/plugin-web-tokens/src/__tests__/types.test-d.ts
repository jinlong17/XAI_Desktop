/**
 * Negative / type tests — AC-N1..AC-N3 (test.md §D)
 * These are compile-time checks only. No runtime assertions.
 * The @ts-expect-error directives enforce that the type system
 * correctly rejects invalid inputs.
 */

import { applyDensity, applyTheme } from "../apply.js";
import { useI18n } from "../i18n.js";

// AC-N1: Accessing a missing key on the typed bundle must fail at compile time.
{
  const { t } = useI18n("en");
  // @ts-expect-error — 'nope' does not exist on the typed I18NBundle
  void t.nope;
}

// AC-N2: Passing an invalid lang to useI18n must fail at compile time.
{
  // @ts-expect-error — "fr" is not assignable to Lang ("en" | "zh")
  useI18n("fr");
}

// AC-N3: Passing an invalid density to applyDensity must fail at compile time.
{
  // @ts-expect-error — "ultra" is not assignable to Density
  applyDensity("ultra");
}

// Positive compile checks (must NOT require @ts-expect-error):
{
  const { t, s } = useI18n("en");
  void t.habits.title;           // valid nested key
  void t.app_name;               // valid top-level key
  void s("settings.font_scale"); // runtime path — always string
  applyDensity("compact");       // valid density
  applyTheme("system");          // valid theme
}
