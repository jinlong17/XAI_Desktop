import { registerAccountMigrationValidator } from "@repo/plugin-web-storage";
import { isTaskColsArray } from "./validate.js";
registerAccountMigrationValidator("xai_task_cols", isTaskColsArray);
