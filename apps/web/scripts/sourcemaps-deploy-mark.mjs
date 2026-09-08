import { runSentryCli } from "./sourcemaps-lib.mjs";

const release = process.env.SENTRY_RELEASE ?? "";
const environment = process.env.SENTRY_DEPLOY_ENV ?? process.env.NODE_ENV ?? "production";
const result = runSentryCli(["deploys", "new", "--release", release, "-e", environment]);

if (result.skipped) {
  console.log(`[sourcemaps-deploy-mark] skipped: ${result.reason}`);
} else {
  console.log(`[sourcemaps-deploy-mark] ran: ${result.command}`);
}
