import { rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn, spawnSync } from "node:child_process";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const desktopDir = resolve(scriptDir, "..");
const repoRoot = resolve(desktopDir, "../..");
const webDir = resolve(repoRoot, "apps/web");
const desktopHostPublicDir = resolve(webDir, "public/desktop-host");
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

rmSync(desktopHostPublicDir, { recursive: true, force: true });
run(
  nodeBin,
  [
    "./node_modules/vite/bin/vite.js",
    "build",
    "--outDir",
    "../web/public/desktop-host",
    "--base",
    "./",
    "--emptyOutDir",
  ],
  desktopDir,
);

const webDev = spawn(nodeBin, ["./node_modules/vite/bin/vite.js", "--port", "3000"], {
  cwd: webDir,
  env,
  stdio: "inherit",
});

function stop() {
  webDev.kill("SIGTERM");
}

process.on("SIGINT", stop);
process.on("SIGTERM", stop);

webDev.on("exit", (code, signal) => {
  if (signal) {
    process.exit(0);
  }
  process.exit(code ?? 0);
});
