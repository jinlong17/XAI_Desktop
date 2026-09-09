import { registerAccountMigrationValidator } from "@repo/plugin-web-storage";
import { validatePrefs } from "./validate.js";
function sameValue(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (!a || !b || typeof a !== "object" || typeof b !== "object") return false;
  const left = Object.entries(a), right = Object.entries(b);
  return left.length === right.length && left.every(([key,value]) => sameValue(value, (b as Record<string,unknown>)[key]));
}
registerAccountMigrationValidator("xai_meditation_prefs", value => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const raw = value as Record<string, unknown>;
  if (raw.schemaVersion !== undefined && ![1,2,3].includes(Number(raw.schemaVersion))) return false;
  const normalized = validatePrefs(value) as unknown as Record<string, unknown>;
  return Object.entries(raw).every(([key,item]) => key === "schemaVersion" || sameValue(item, normalized[key]));
});
