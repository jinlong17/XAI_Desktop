import { runSentryCli } from "./sourcemaps-lib.mjs";

const result = runSentryCli(["sourcemaps", "inject", "./dist"]);

if (result.skipped) {
  console.log(`[sourcemaps-debugids-inject] skipped: ${result.reason}`);
} else {
  console.log(`[sourcemaps-debugids-inject] ran: ${result.command}`);
}
