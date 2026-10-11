import { registerAccountMigrationValidator } from "@repo/plugin-web-storage";
import { isPomodoroSession } from "./validate.js";
registerAccountMigrationValidator("xai_pomodoro_sessions", value => Array.isArray(value) && value.every(isPomodoroSession));

import { isActiveSession } from "./sessionProtocol.js";
registerAccountMigrationValidator("xai_pomodoro_active", value => value === null || isActiveSession(value));
