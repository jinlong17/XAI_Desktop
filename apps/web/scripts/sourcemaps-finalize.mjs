import { runSentryCli } from "./sourcemaps-lib.mjs";

const result = runSentryCli(["releases", "finalize", process.env.SENTRY_RELEASE ?? ""]);

if (result.skipped) {
  console.log(`[sourcemaps-finalize] skipped: ${result.reason}`);
} else {
  console.log(`[sourcemaps-finalize] ran: ${result.command}`);
}
