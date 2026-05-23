/**
 * @internal — validate.ts
 *
 * `isCountdownCard(x)` — type predicate that validates the storage shape.
 * Used to filter entries read from `usePref("xai_countdowns")`.
 *
 * Invalid entries produce a DEV `console.warn` and are silently dropped.
 *
 * API contract: packages/xai-web-countdown/docs/api.md §5.1
 */

import type { CountdownCard } from "../types.js";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isDev(): boolean {
  return (
    typeof import.meta !== "undefined" &&
    (import.meta as { env?: { DEV?: boolean } }).env?.DEV === true
  );
}

/**
 * Returns true if `x` satisfies the `CountdownCard` storage shape.
 *
 * Invariants checked:
 * - x is a non-null object
 * - id: non-empty string
 * - title: object with non-empty string .en and .zh (empty string allowed per spec)
 * - target_date: matches /^\d{4}-\d{2}-\d{2}$/
 * - variant: "image" | "light"
 * - cover_url: null when variant="light"; non-null string when variant="image"
 */
export function isCountdownCard(x: unknown): x is CountdownCard {
  if (x === null || typeof x !== "object") {
    devWarn(x, "not an object");
    return false;
  }

  const obj = x as Record<string, unknown>;

  // id
  if (typeof obj["id"] !== "string" || obj["id"] === "") {
    devWarn(x, "id missing or empty");
    return false;
  }

  // title
  const title = obj["title"];
  if (
    title === null ||
    typeof title !== "object" ||
    typeof (title as Record<string, unknown>)["en"] !== "string" ||
    typeof (title as Record<string, unknown>)["zh"] !== "string"
  ) {
    devWarn(x, "title.en or title.zh missing");
    return false;
  }

  // target_date
  if (
    typeof obj["target_date"] !== "string" ||
    !DATE_RE.test(obj["target_date"])
  ) {
    devWarn(x, "target_date invalid");
    return false;
  }

  // variant
  const variant = obj["variant"];
  if (variant !== "image" && variant !== "light") {
    devWarn(x, "variant must be 'image' or 'light'");
    return false;
  }

  // cover_url constraints
  const cover_url = obj["cover_url"];
  if (variant === "light" && cover_url !== null) {
    devWarn(x, "variant=light requires cover_url=null");
    return false;
  }
  if (variant === "image" && (cover_url === null || typeof cover_url !== "string")) {
    devWarn(x, "variant=image requires non-null string cover_url");
    return false;
  }

  return true;
}

function devWarn(x: unknown, reason: string): void {
  if (isDev()) {
    console.warn("[plugin-web-countdown] isCountdownCard: dropped entry —", reason, x);
  }
}
