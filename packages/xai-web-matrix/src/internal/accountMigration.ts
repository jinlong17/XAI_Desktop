import { registerAccountMigrationValidator } from "@repo/plugin-web-storage";
import { asMatrixState } from "./usePersistedMatrix.js";
registerAccountMigrationValidator("xai_matrix_state", value => asMatrixState(value) === value);
