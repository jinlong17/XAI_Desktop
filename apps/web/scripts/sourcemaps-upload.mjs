import { runSentryCli } from "./sourcemaps-lib.mjs";

const result = runSentryCli([
  "sourcemaps",
  "upload",
  "./dist",
  "--ext",
  "js",
  "--ext",
  "map",
  "--rewrite",
  "--validate",
]);

if (result.skipped) {
  console.log(`[sourcemaps-upload] skipped: ${result.reason}`);
} else {
  console.log(`[sourcemaps-upload] ran: ${result.command}`);
}
