/**
 * tauri-conf-build-profile.test.ts
 *
 * Regression guards for apps/desktop/src-tauri/tauri.conf.json Vite env
 * injection (S1 fix — desktop/web UI divergence bug 2026-05-30).
 *
 * TC-TAURI-CONF-1: beforeBuildCommand must NOT inject desktop-phase1-offline.
 *   Rationale: the offline profile gates Organizer visibility + Boards offline
 *   fallback in shared web code, causing the desktop App to diverge from the
 *   dev-branch web-live baseline (bug root cause).
 *
 * TC-TAURI-CONF-2: beforeDevCommand must NOT inject desktop-phase1-offline.
 *   Same rationale as TC-TAURI-CONF-1, but for the dev (tauri dev) path.
 *
 * TC-TAURI-CONF-3: beforeBuildCommand MUST retain VITE_WEB_AUTH_MODE=mock-authenticated.
 *   Rationale: dropping mock-authenticated leaves the desktop with no session,
 *   AppRouteGate redirects /app to /auth/login, and Phase-1 offline-capable
 *   launch breaks. This env var is orthogonal to the runtime profile.
 *
 * TC-TAURI-CONF-4: beforeDevCommand MUST retain VITE_WEB_AUTH_MODE=mock-authenticated.
 *   Same rationale as TC-TAURI-CONF-3, but for the dev path.
 *
 * These guards are lightweight config text-checks; they run in the standard
 * `pnpm --filter @repo/web test` suite (no build artifact required).
 *
 * Test strategy: packages/desktop-tauri-web-dist-normal-window/docs/test.md
 *   §Regression Checks (S3 addition).
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// apps/web/src/__tests__/ → apps/desktop/src-tauri/tauri.conf.json
const TAURI_CONF_PATH = resolve(
  __dirname,
  "../../../../apps/desktop/src-tauri/tauri.conf.json",
);

interface TauriConfBuild {
  beforeBuildCommand?: string;
  beforeDevCommand?: string;
}

interface TauriConf {
  build?: TauriConfBuild;
}

function readTauriConf(): TauriConf {
  return JSON.parse(readFileSync(TAURI_CONF_PATH, "utf-8")) as TauriConf;
}

describe("Tauri build profile injection guards (S1 regression — 2026-05-30)", () => {
  it(
    "TC-TAURI-CONF-1: beforeBuildCommand must NOT inject desktop-phase1-offline",
    () => {
      const conf = readTauriConf();
      const cmd = conf.build?.beforeBuildCommand ?? "";
      expect(
        cmd,
        [
          "beforeBuildCommand still injects VITE_WEB_RUNTIME_PROFILE=desktop-phase1-offline.",
          "This causes Organizer to appear in the desktop sidebar and Boards to fall back to",
          "empty offline-cache state, diverging from the dev-branch web-live baseline.",
          "Remove the env var from tauri.conf.json beforeBuildCommand.",
        ].join(" "),
      ).not.toContain("desktop-phase1-offline");
    },
  );

  it(
    "TC-TAURI-CONF-2: beforeDevCommand must NOT inject desktop-phase1-offline",
    () => {
      const conf = readTauriConf();
      const cmd = conf.build?.beforeDevCommand ?? "";
      expect(
        cmd,
        [
          "beforeDevCommand still injects VITE_WEB_RUNTIME_PROFILE=desktop-phase1-offline.",
          "This causes Organizer to appear and Boards to show empty offline state during",
          "`tauri dev`, diverging from the dev-branch web-live baseline.",
          "Remove the env var from tauri.conf.json beforeDevCommand.",
        ].join(" "),
      ).not.toContain("desktop-phase1-offline");
    },
  );

  it(
    "TC-TAURI-CONF-3: beforeBuildCommand MUST retain VITE_WEB_AUTH_MODE=mock-authenticated",
    () => {
      const conf = readTauriConf();
      const cmd = conf.build?.beforeBuildCommand ?? "";
      expect(
        cmd,
        [
          "beforeBuildCommand is missing VITE_WEB_AUTH_MODE=mock-authenticated.",
          "Without this, the desktop App has no pre-authenticated session; AppRouteGate",
          "redirects /app to /auth/login and Phase-1 offline-capable launch breaks.",
          "Restore VITE_WEB_AUTH_MODE=mock-authenticated in tauri.conf.json beforeBuildCommand.",
        ].join(" "),
      ).toContain("VITE_WEB_AUTH_MODE=mock-authenticated");
    },
  );

  it(
    "TC-TAURI-CONF-4: beforeDevCommand MUST retain VITE_WEB_AUTH_MODE=mock-authenticated",
    () => {
      const conf = readTauriConf();
      const cmd = conf.build?.beforeDevCommand ?? "";
      expect(
        cmd,
        [
          "beforeDevCommand is missing VITE_WEB_AUTH_MODE=mock-authenticated.",
          "Without this, `tauri dev` has no pre-authenticated session; the desktop App",
          "redirects to /auth/login and cannot reach /app offline.",
          "Restore VITE_WEB_AUTH_MODE=mock-authenticated in tauri.conf.json beforeDevCommand.",
        ].join(" "),
      ).toContain("VITE_WEB_AUTH_MODE=mock-authenticated");
    },
  );
});
