/** Device-local civil dates. Date-only keys are identities, never UTC instants. */
export function localDateKey(value: Date | number): string {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function parseLocalDateKey(key: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return null;
  const [year, month, day] = key.split("-").map(Number) as [number, number, number];
  const date = new Date(0);
  date.setFullYear(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  return localDateKey(date) === key ? date : null;
}
export function addLocalDays(value: Date | number, days: number): Date {
  const date = new Date(value);
  date.setDate(date.getDate() + days);
  return date;
}
export function startOfLocalDay(value: Date | number): Date {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}
export function nextLocalDayStart(value: Date | number): Date {
  return startOfLocalDay(addLocalDays(value, 1));
}
