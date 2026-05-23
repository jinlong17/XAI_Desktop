/**
 * @internal — 3-line bilingual helper.
 * Used throughout view components to select between en/zh strings.
 */

export type Lang = "en" | "zh";

/** Pick `en` or `zh` from a bilingual string pair based on the current lang. */
export function bilingual(strings: { en: string; zh: string }, lang: Lang): string {
  return lang === "zh" ? strings.zh : strings.en;
}
