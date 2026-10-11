/**
 * @internal Strict validation for local-calendar date keys (YYYY-MM-DD).
 *
 * A shape check alone accepts impossible dates such as 2026-02-31. Build a
 * UTC civil date and require every component to round-trip so JavaScript's
 * normalization cannot turn an invalid requested day into a different day.
 */
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isValidCivilDate(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const match = DATE_RE.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  // Calendar keys are the same four-digit, positive-year values accepted by
  // the module's native date input: 0001 through 9999.
  if (year < 1 || year > 9999 || month < 1 || month > 12 || day < 1 || day > 31) return false;

  // setUTCFullYear avoids Date.UTC's special 1900 offset for years 0..99.
  const candidate = new Date(0);
  candidate.setUTCHours(0, 0, 0, 0);
  candidate.setUTCFullYear(year, month - 1, day);
  return candidate.getUTCFullYear() === year
    && candidate.getUTCMonth() === month - 1
    && candidate.getUTCDate() === day;
}
