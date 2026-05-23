import { readdirSync, rmSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

export function listSourceMapFiles(distDir) {
  const root = resolve(distDir);
  const files = [];

  function walk(current) {
    for (const entry of readdirSync(current)) {
      const next = join(current, entry);
      const stat = statSync(next);
      if (stat.isDirectory()) {
        walk(next);
        continue;
      }

      if (next.endsWith(".map")) {
        files.push(next);
      }
    }
  }

  walk(root);
  return files;
}

export function removeSourceMapFiles(distDir) {
  const files = listSourceMapFiles(distDir);
  for (const file of files) {
    rmSync(file, { force: true });
  }
  return files;
}

function readRequiredEnv() {
  const required = ["SENTRY_ORG", "SENTRY_PROJECT", "SENTRY_RELEASE", "SENTRY_AUTH_TOKEN"];
  const missing = required.filter((key) => !(process.env[key] && process.env[key].trim().length > 0));
  return {
    missing,
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    release: process.env.SENTRY_RELEASE,
    authToken: process.env.SENTRY_AUTH_TOKEN,
  };
}

export function runSentryCli(args) {
  const envState = readRequiredEnv();
  if (envState.missing.length > 0) {
    return {
      skipped: true,
      reason: `missing env: ${envState.missing.join(", ")}`,
      command: ["sentry-cli", ...args].join(" "),
    };
  }

  const result = spawnSync("sentry-cli", args, {
    env: {
      ...process.env,
      SENTRY_ORG: envState.org,
      SENTRY_PROJECT: envState.project,
      SENTRY_RELEASE: envState.release,
      SENTRY_AUTH_TOKEN: envState.authToken,
    },
    stdio: "inherit",
  });

  if (result.status !== 0) {
    throw new Error(`sentry_cli_failed:${result.status ?? "unknown"}`);
  }

  return {
    skipped: false,
    command: ["sentry-cli", ...args].join(" "),
  };
}
