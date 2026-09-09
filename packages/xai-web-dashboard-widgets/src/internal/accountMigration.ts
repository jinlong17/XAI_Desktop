import { registerAccountMigrationValidator } from "@repo/plugin-web-storage";
import { getWeather } from "./weatherStore/weatherStore.js";
import { STICKY_COLORS } from "./stickiesStore/types.js";
registerAccountMigrationValidator("xai_dashboard_weather", value => value === null || getWeather(value) !== null);
registerAccountMigrationValidator("xai_dashboard_stickies", value => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return Object.values(value).every(sticky => {
    if (!sticky || typeof sticky !== "object" || typeof sticky.id !== "string" || typeof sticky.text !== "string" || typeof sticky.createdAt !== "string" || !Object.hasOwn(STICKY_COLORS, sticky.color)) return false;
    if (sticky.source !== undefined) {
      const source = sticky.source;
      if (!source || typeof source !== "object" || source.type !== "task" || typeof source.id !== "string" || typeof source.title !== "string" || (source.listLabel !== undefined && typeof source.listLabel !== "string")) return false;
    }
    return ["width","height","x","y","order"].every(key => sticky[key] === undefined || (typeof sticky[key] === "number" && Number.isFinite(sticky[key])));
  });
});
