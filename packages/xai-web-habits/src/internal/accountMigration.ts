import { registerAccountMigrationValidator } from "@repo/plugin-web-storage";
import { isHabit, validateHabitsState } from "./validate.js";
registerAccountMigrationValidator("xai_habits_state", value => {
  if (!value || typeof value !== "object" || validateHabitsState(value) !== value) return false;
  const state = value as Record<string, unknown>;
  if (!Array.isArray(state.habits) || !state.habits.every(isHabit)) return false;
  for (const [field, type] of [["checkIns", "boolean"], ["diaries", "string"]] as const) {
    const groups = state[field];
    if (groups == null) continue;
    if (typeof groups !== "object" || Array.isArray(groups)) return false;
    for (const group of Object.values(groups)) {
      if (!group || typeof group !== "object" || Array.isArray(group)) return false;
      if (!Object.values(group).every(item => type === "boolean" ? item === true : typeof item === "string")) return false;
    }
  }
  return true;
});
