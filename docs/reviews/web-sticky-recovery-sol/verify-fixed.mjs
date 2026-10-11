/**
 * Sol immutable-archive runner: Settings Sticky recovery oracles (CP-STICKY-01, control-plane batch 4).
 *
 * Usage:
 *   XAI_DEPS_ROOT=<checkout whose pnpm-lock.yaml equals the revision's> \
 *     node docs/reviews/web-sticky-recovery-sol/verify-fixed.mjs <revision> <mode|all> <suffix>
 *
 * Modes: bytes, fields, queues, continuity-export (Sol oracles) and original (the archive's own
 * packages/plugin-web-settings-rest/src/__tests__/stickyPane.test.tsx, ST1-ST10, as a positive control).
 *
 * The runner expands `git archive <revision>` into a temporary directory, copies this directory's oracle
 * files into it, links dependencies read-only from XAI_DEPS_ROOT (default: this repository root) after a
 * lockfile SHA-256 gate, runs Vitest once per mode and writes <mode>-<suffix>-<revision>.log beside this
 * file. It refuses to overwrite any existing log, records the requested and resolved revision, and exits
 * with the first nonzero Vitest status. Nothing is written into the dependency checkout: the temporary
 * archive gets its own node_modules directory of links and its own Vite cache directory.
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const evidence = fileURLToPath(new URL("./", import.meta.url));
const owned = "docs/reviews/web-sticky-recovery-sol";
const dependencyRoot = resolve(process.env.XAI_DEPS_ROOT ?? root);
const [revision, modeArgument = "all", suffix = "run"] = process.argv.slice(2);
if (!revision) throw Error("Usage: node verify-fixed.mjs <revision> <mode|all> <suffix>");
if (!/^[A-Za-z0-9._-]+$/.test(suffix)) throw Error(`Unsafe suffix: ${suffix}`);

const ORACLE_FILES = ["fixture.tsx", "bytes.test.tsx", "fields.test.tsx", "queues.test.tsx", "continuity-export.test.tsx"];
const MODES = {
  bytes: [`${owned}/bytes.test.tsx`],
  fields: [`${owned}/fields.test.tsx`],
  queues: [`${owned}/queues.test.tsx`],
  "continuity-export": [`${owned}/continuity-export.test.tsx`],
  original: ["packages/plugin-web-settings-rest/src/__tests__/stickyPane.test.tsx"],
};
const selected = modeArgument === "all" ? Object.keys(MODES) : [modeArgument];
for (const mode of selected) if (!MODES[mode]) throw Error(`Unsupported mode ${mode}; use one of ${Object.keys(MODES).join(", ")} or all`);
const logPath = mode => join(evidence, `${mode}-${suffix}-${revision}.log`);
for (const mode of selected) if (existsSync(logPath(mode))) throw Error(`Evidence exists; use a new suffix: ${logPath(mode)}`);

const sha256 = data => createHash("sha256").update(data).digest("hex");
const commit = execFileSync("git", ["rev-parse", "--verify", `${revision}^{commit}`], { cwd: root, encoding: "utf8" }).trim();
const archiveLock = execFileSync("git", ["show", `${commit}:pnpm-lock.yaml`], { cwd: root, maxBuffer: 256 * 1024 * 1024 });
assert(existsSync(join(dependencyRoot, "node_modules")), "Dependency tree missing; set XAI_DEPS_ROOT to a checkout with installed node_modules");
const dependencyLockHash = sha256(readFileSync(join(dependencyRoot, "pnpm-lock.yaml")));
const archiveLockHash = sha256(archiveLock);
assert.equal(dependencyLockHash, archiveLockHash, "Dependency checkout lockfile differs from the fixed product lockfile");
const vitestBin = join(dependencyRoot, "packages/plugin-web-settings-rest/node_modules/.bin/vitest");
assert(existsSync(vitestBin), `Vitest binary missing at ${vitestBin}`);
const oracleHashes = [...ORACLE_FILES, "verify-fixed.mjs"].map(name => `${name}=${sha256(readFileSync(join(evidence, name)))}`);

const directory = mkdtempSync(join(tmpdir(), "xai-sticky-sol-"));
let firstFailure = 0;
try {
  execFileSync("tar", ["-x", "-C", directory], { input: execFileSync("git", ["archive", commit], { cwd: root, maxBuffer: 1024 * 1024 * 1024 }) });
  // Private node_modules directories of read-only links. Workspace (@repo) links and caches are never
  // linked: workspace packages resolve only through the archive aliases below, never from the checkout.
  const linkDependencies = (source, target) => {
    mkdirSync(target, { recursive: true });
    for (const entry of readdirSync(source)) {
      if (entry === "@repo" || entry === ".vite" || entry === ".vite-temp" || entry === ".cache") continue;
      symlinkSync(join(source, entry), join(target, entry));
    }
  };
  linkDependencies(join(dependencyRoot, "node_modules"), join(directory, "node_modules"));
  const aliases = [];
  for (const name of readdirSync(join(directory, "packages"))) {
    const folder = join(directory, "packages", name);
    let pkg;
    try { pkg = JSON.parse(readFileSync(join(folder, "package.json"), "utf8")); } catch { continue; }
    const packageDependencies = join(dependencyRoot, "packages", name, "node_modules");
    if (existsSync(packageDependencies)) linkDependencies(packageDependencies, join(folder, "node_modules"));
    for (const [key, value] of Object.entries(pkg.exports ?? {})) {
      const target = typeof value === "string" ? value : value.import ?? value.default;
      if (typeof target === "string" && !key.includes("*")) aliases.push({ find: pkg.name + (key === "." ? "" : key.slice(1)), replacement: join(folder, target) });
    }
  }
  aliases.sort((left, right) => right.find.length - left.find.length);
  aliases.push(
    { find: "react", replacement: join(dependencyRoot, "packages/plugin-web-settings-rest/node_modules/react") },
    { find: "@testing-library/react", replacement: join(dependencyRoot, "packages/plugin-web-settings-rest/node_modules/@testing-library/react") },
  );
  const target = join(directory, owned);
  mkdirSync(target, { recursive: true });
  for (const name of ORACLE_FILES) copyFileSync(join(evidence, name), join(target, name));

  for (const mode of selected) {
    const config = join(directory, `sol-${mode}.config.mjs`);
    const options = {
      root: directory,
      cacheDir: join(directory, ".sol-vite-cache"),
      resolve: { alias: aliases },
      esbuild: { jsx: "automatic" },
      test: {
        globals: true,
        environment: "jsdom",
        setupFiles: [join(directory, "packages/plugin-web-settings-rest/vitest.setup.ts")],
        include: MODES[mode],
        testTimeout: 30000,
        hookTimeout: 30000,
      },
    };
    // React's act() environment warning is harness noise; every other console line is kept.
    writeFileSync(config, `const options = ${JSON.stringify(options)};\noptions.test.onConsoleLog = log => !String(log).includes("not wrapped in act(");\nexport default options;\n`);
    const result = spawnSync(vitestBin, ["run", "--config", config, "--reporter=verbose"], {
      cwd: directory,
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
      env: { ...process.env, NO_COLOR: "1", FORCE_COLOR: "0" },
    });
    const status = result.status ?? 1;
    const header = [
      `requested_revision=${revision}`,
      `resolved_commit=${commit}`,
      `mode=${mode}`,
      `suffix=${suffix}`,
      `include=${MODES[mode].join(",")}`,
      `dependency_root=${dependencyRoot}`,
      `dependency_lockfile_sha256=${dependencyLockHash}`,
      `archive_lockfile_sha256=${archiveLockHash}`,
      `oracle_sha256 ${oracleHashes.join(" ")}`,
      `exit=${status}${result.signal ? ` signal=${result.signal}` : ""}`,
    ].join("\n");
    if (existsSync(logPath(mode))) throw Error(`Evidence appeared during the run; refusing to overwrite ${logPath(mode)}`);
    writeFileSync(logPath(mode), `${header}\n---- stdout ----\n${result.stdout ?? ""}\n---- stderr ----\n${result.stderr ?? ""}`.trimEnd() + "\n");
    const summary = (result.stdout ?? "").split("\n").filter(line => /^\s*(Test Files|Tests)\s/.test(line)).join(" | ");
    console.log(`${mode}: exit=${status} ${summary}`);
    if (status !== 0 && firstFailure === 0) firstFailure = status;
  }
} finally {
  rmSync(directory, { recursive: true, force: true });
}
if (firstFailure !== 0) process.exitCode = firstFailure;
