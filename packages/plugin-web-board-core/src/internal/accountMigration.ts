import { registerAccountMigrationValidator } from "@repo/plugin-web-storage";
import { isBoardArray, isBoardWorkspaceArray } from "./isBoardArray.js";
registerAccountMigrationValidator("xai_boards_v2", isBoardArray);
registerAccountMigrationValidator("xai_board_workspaces", isBoardWorkspaceArray);
