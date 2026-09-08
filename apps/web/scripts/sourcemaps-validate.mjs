import { runSentryCli } from "./sourcemaps-lib.mjs";

const result = runSentryCli(["releases", "files", process.env.SENTRY_RELEASE ?? "", "list"]);

if (result.skipped) {
  console.log(`[sourcemaps-validate] skipped: ${result.reason}`);
} else {
  console.log(`[sourcemaps-validate] ran: ${result.command}`);
}
