import { registerAccountMigrationValidator } from "@repo/plugin-web-storage";
import { isCountdownCard } from "./validate.js";
registerAccountMigrationValidator("xai_countdowns", value => Array.isArray(value) && value.every(isCountdownCard));
