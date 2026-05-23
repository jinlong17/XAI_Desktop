import { runSentryCli } from "./sourcemaps-lib.mjs";

const release = process.env.SENTRY_RELEASE ?? "";
const result = runSentryCli(["releases", "set-commits", release, "--auto", "--ignore-missing"]);

if (result.skipped) {
  console.log(`[sourcemaps-release-set-commits] skipped: ${result.reason}`);
} else {
  console.log(`[sourcemaps-release-set-commits] ran: ${result.command}`);
}
