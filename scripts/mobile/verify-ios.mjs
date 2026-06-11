#!/usr/bin/env node
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "../..");
const mobileDir = resolve(repoRoot, "apps/mobile");
const iosProject = resolve(mobileDir, "ios/App/App.xcodeproj");
const derivedDataPath = resolve(mobileDir, "ios/DerivedData");
const appPath = resolve(derivedDataPath, "Build/Products/Debug-iphonesimulator/App.app");
const bundleId = "com.jinlong.xai.mobile";

const args = new Set(process.argv.slice(2));
const destinationArgIndex = process.argv.indexOf("--destination");
const explicitDestination =
  destinationArgIndex >= 0 ? process.argv[destinationArgIndex + 1] : null;
const selfTest = args.has("--self-test");
const skipSync = args.has("--skip-sync");
const allowBlocked = args.has("--allow-blocked");
const launchIfBooted = !args.has("--build-only");

function printHeading(label) {
  console.log(`\n== ${label} ==`);
}

function run(command, commandArgs, options = {}) {
  return new Promise((resolveRun) => {
    const child = spawn(command, commandArgs, {
      cwd: options.cwd ?? repoRoot,
      env: process.env,
      shell: false,
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      const text = chunk.toString();
      stdout += text;
      if (!options.quiet) process.stdout.write(text);
    });
    child.stderr.on("data", (chunk) => {
      const text = chunk.toString();
      stderr += text;
      if (!options.quiet) process.stderr.write(text);
    });
    child.on("close", (status) => {
      resolveRun({ status: status ?? 1, stdout, stderr });
    });
  });
}

function blocked(message, detail = "") {
  console.log(`STATUS: BLOCKED_ENVIRONMENT`);
  console.log(`BLOCKER: ${message}`);
  if (detail.trim()) {
    console.log("DETAIL:");
    console.log(detail.trim());
  }
  process.exitCode = allowBlocked ? 0 : 2;
}

function fail(message) {
  console.error(`STATUS: FAIL`);
  console.error(`ERROR: ${message}`);
  process.exitCode = 1;
}

function listAvailableIphones(simctlJson) {
  const devices = simctlJson.devices ?? {};
  return Object.entries(devices).flatMap(([runtime, runtimeDevices]) =>
    (runtimeDevices ?? [])
      .filter((device) => device.isAvailable && /iPhone/.test(device.name))
      .map((device) => ({
        runtime,
        name: device.name,
        udid: device.udid,
        state: device.state,
      }))
  );
}

async function main() {
  printHeading("iOS thin shell verification");
  console.log(`repo: ${repoRoot}`);
  console.log(`mode: ${selfTest ? "self-test mock-auth" : "live-auth"}`);

  if (!existsSync(iosProject)) {
    fail(`Missing iOS project at ${iosProject}. Run pnpm --filter @repo/mobile cap:add:ios first.`);
    return;
  }

  if (!skipSync) {
    printHeading("Sync web assets into iOS wrapper");
    const syncScript = selfTest ? "sync:ios:self-test" : "sync:ios";
    const sync = await run("pnpm", ["--filter", "@repo/mobile", syncScript], { cwd: repoRoot });
    if (sync.status !== 0) {
      fail(`pnpm --filter @repo/mobile ${syncScript} failed.`);
      return;
    }
  }

  printHeading("Check Xcode toolchain");
  const selectedDeveloperDir = await run("xcode-select", ["-p"], { quiet: true });
  if (selectedDeveloperDir.stdout.trim()) {
    console.log(`xcode-select: ${selectedDeveloperDir.stdout.trim()}`);
  }

  const xcodebuildVersion = await run("xcodebuild", ["-version"], { quiet: true });
  if (xcodebuildVersion.status !== 0) {
    blocked("Full Xcode is not selected; xcodebuild cannot run simulator builds.", xcodebuildVersion.stderr);
    return;
  }
  console.log(xcodebuildVersion.stdout.trim());

  const simctl = await run("xcrun", ["simctl", "list", "devices", "available", "-j"], { quiet: true });
  if (simctl.status !== 0) {
    blocked("simctl is unavailable; install/select full Xcode and iOS simulator runtime.", simctl.stderr);
    return;
  }

  let simctlJson;
  try {
    simctlJson = JSON.parse(simctl.stdout);
  } catch (error) {
    fail(`Unable to parse simctl JSON: ${error instanceof Error ? error.message : String(error)}`);
    return;
  }

  const iphones = listAvailableIphones(simctlJson);
  if (iphones.length === 0) {
    blocked("No available iPhone simulator was found. Install an iOS simulator runtime in Xcode.");
    return;
  }

  const booted = iphones.find((device) => device.state === "Booted");
  const selectedName = explicitDestination ?? booted?.name ?? iphones[0].name;
  console.log(`selected simulator: ${selectedName}${booted ? ` (${booted.udid}, Booted)` : ""}`);
  if (!booted && launchIfBooted) {
    console.log("launch: skipped until the user boots an iPhone simulator.");
  }

  printHeading("Build iOS simulator app");
  await mkdir(derivedDataPath, { recursive: true });
  const destination = `platform=iOS Simulator,name=${selectedName}`;
  const build = await run("xcodebuild", [
    "-project",
    iosProject,
    "-scheme",
    "App",
    "-configuration",
    "Debug",
    "-sdk",
    "iphonesimulator",
    "-destination",
    destination,
    "-derivedDataPath",
    derivedDataPath,
    "build",
  ]);
  if (build.status !== 0) {
    fail(`xcodebuild failed for destination '${destination}'.`);
    return;
  }

  if (!existsSync(appPath)) {
    fail(`Build finished but expected app bundle is missing: ${appPath}`);
    return;
  }

  if (!launchIfBooted) {
    console.log("STATUS: PASS_BUILD_ONLY");
    return;
  }

  if (!booted) {
    console.log("STATUS: PARTIAL_BUILD_PASS_BOOT_REQUIRED");
    process.exitCode = allowBlocked ? 0 : 3;
    return;
  }

  printHeading("Install and launch on booted simulator");
  const install = await run("xcrun", ["simctl", "install", booted.udid, appPath]);
  if (install.status !== 0) {
    fail("simctl install failed.");
    return;
  }
  const launch = await run("xcrun", ["simctl", "launch", booted.udid, bundleId]);
  if (launch.status !== 0) {
    fail("simctl launch failed.");
    return;
  }

  console.log("STATUS: PASS");
  console.log(`bundle: ${bundleId}`);
  console.log(`simulator: ${booted.name} (${booted.udid})`);
}

await main();
