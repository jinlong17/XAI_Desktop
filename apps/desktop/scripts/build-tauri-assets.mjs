import { rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const desktopDir = resolve(scriptDir, "..");
const repoRoot = resolve(desktopDir, "../..");
const webDir = resolve(repoRoot, "apps/web");
const webDistDir = resolve(webDir, "dist");
const desktopHostDistDir = resolve(webDistDir, "desktop-host");
const nodeBin = process.execPath;

const env = {
  ...process.env,
  VITE_XAI_DESKTOP_HOST: process.env.VITE_XAI_DESKTOP_HOST ?? "tauri",
  VITE_WEB_AUTH_MODE: process.env.VITE_WEB_AUTH_MODE ?? "mock-authenticated",
};

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    env,
    stdio: "inherit",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run(nodeBin, ["./node_modules/vite/bin/vite.js", "build"], webDir);
run(nodeBin, ["./scripts/sourcemaps-assert-clean.mjs"], webDir);
run(nodeBin, ["./scripts/browser-safety-assert-dist.mjs"], webDir);

rmSync(desktopHostDistDir, { recursive: true, force: true });
run(
  nodeBin,
  [
    "./node_modules/vite/bin/vite.js",
    "build",
    "--outDir",
    "../web/dist/desktop-host",
    "--base",
    "./",
    "--emptyOutDir",
  ],
  desktopDir,
);
