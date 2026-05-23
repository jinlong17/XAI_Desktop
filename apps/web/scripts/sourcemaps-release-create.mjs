import { runSentryCli } from "./sourcemaps-lib.mjs";

const release = process.env.SENTRY_RELEASE ?? "";
const result = runSentryCli(["releases", "new", release]);

if (result.skipped) {
  console.log(`[sourcemaps-release-create] skipped: ${result.reason}`);
} else {
  console.log(`[sourcemaps-release-create] ran: ${result.command}`);
}
