/**
 * Parent-role immutable-archive runner: Settings Sticky actual-host oracles (CP-STICKY-01, control-plane batch 5).
 *
 * Usage (from the repository root of a checkout that contains this directory):
 *   XAI_DEPS_ROOT=<checkout whose pnpm-lock.yaml equals the revision's> \
 *     node docs/reviews/web-sticky-recovery-independent/verify-fixed.mjs <revision> host <suffix>
 *
 * One mode, `host`: ./host.test.tsx against the production Shell + ComposedSettings + router factory.
 *
 * The runner expands `git archive <revision>` into a temporary directory and copies only host.test.tsx into
 * docs/reviews/web-sticky-recovery-independent/ inside it, so every product file comes from the archive. Third-party
 * dependencies are linked read-only from XAI_DEPS_ROOT (default: this repository root) after asserting that the
 * dependency checkout's pnpm-lock.yaml SHA-256 equals the revision's. Workspace `@repo/*` links are never linked from
 * the dependency checkout: every workspace package export is aliased to the archive's own source. The log
 * host-<suffix>-<revision>.log is written beside this file with the requested and resolved revision, both lockfile
 * hashes and the oracle/runner hashes; an existing log is never overwritten, and a nonzero Vitest status is preserved
 * as this process's exit code. Nothing is written into the dependency checkout: the temporary archive gets its own
 * node_modules directories of links and its own Vite cache, and is deleted afterwards.
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
const owned = "docs/reviews/web-sticky-recovery-independent";
const dependencyRoot = resolve(process.env.XAI_DEPS_ROOT ?? root);
const [revision, mode, suffix] = process.argv.slice(2);
if (!revision || !mode || !suffix) throw Error("Usage: node verify-fixed.mjs <revision> host <suffix>");
if (!/^[A-Za-z0-9._-]+$/.test(revision)) throw Error(`Unsafe revision: ${revision}`);
if (!/^[A-Za-z0-9._-]+$/.test(suffix)) throw Error(`Unsafe suffix: ${suffix}`);

const ORACLE_FILES = ["host.test.tsx"];
const MODES = { host: [`${owned}/host.test.tsx`] };
if (!Object.hasOwn(MODES, mode)) throw Error(`Unsupported mode ${mode}; the only mode is host`);
const logPath = join(evidence, `${mode}-${suffix}-${revision}.log`);
if (existsSync(logPath)) throw Error(`Evidence exists; use a new suffix: ${logPath}`);

const sha256 = data => createHash("sha256").update(data).digest("hex");
const commit = execFileSync("git", ["rev-parse", "--verify", `${revision}^{commit}`], { cwd: root, encoding: "utf8" }).trim();
const runnerHead = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
const archiveLock = execFileSync("git", ["show", `${commit}:pnpm-lock.yaml`], { cwd: root, maxBuffer: 256 * 1024 * 1024 });
assert(existsSync(join(dependencyRoot, "node_modules")), "Dependency tree missing; set XAI_DEPS_ROOT to a checkout with installed node_modules");
const dependencyLockHash = sha256(readFileSync(join(dependencyRoot, "pnpm-lock.yaml")));
const archiveLockHash = sha256(archiveLock);
assert.equal(dependencyLockHash, archiveLockHash, "Dependency checkout lockfile differs from the requested revision's lockfile");
const vitestBin = join(dependencyRoot, "packages/plugin-web-settings-rest/node_modules/.bin/vitest");
assert(existsSync(vitestBin), `Vitest binary missing at ${vitestBin}`);
const fileHashes = Object.fromEntries([...ORACLE_FILES, "verify-fixed.mjs"].map(name => [name, sha256(readFileSync(join(evidence, name)))]));

const directory = mkdtempSync(join(tmpdir(), "xai-sticky-host-"));
let status = 1;
try {
  execFileSync("tar", ["-x", "-C", directory], { input: execFileSync("git", ["archive", commit], { cwd: root, maxBuffer: 1024 * 1024 * 1024 }) });
  // Private node_modules directories of read-only links. Workspace (@repo) links and caches are never linked, so
  // workspace packages resolve only through the archive aliases below, never from the dependency checkout.
  const linkDependencies = (source, target) => {
    mkdirSync(target, { recursive: true });
    for (const entry of readdirSync(source)) {
      if (entry === "@repo" || entry === ".vite" || entry === ".vite-temp" || entry === ".cache") continue;
      symlinkSync(join(source, entry), join(target, entry));
    }
  };
  linkDependencies(join(dependencyRoot, "node_modules"), join(directory, "node_modules"));
  linkDependencies(join(dependencyRoot, "apps/web/node_modules"), join(directory, "apps/web/node_modules"));
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
  // One instance each of React, the router and Testing Library for archive code and the oracle.
  aliases.push(
    { find: "react-router", replacement: join(dependencyRoot, "apps/web/node_modules/react-router") },
    { find: "react", replacement: join(dependencyRoot, "packages/plugin-web-settings-rest/node_modules/react") },
    { find: "@testing-library/react", replacement: join(dependencyRoot, "packages/plugin-web-settings-rest/node_modules/@testing-library/react") },
  );
  const target = join(directory, owned);
  mkdirSync(target, { recursive: true });
  for (const name of ORACLE_FILES) {
    copyFileSync(join(evidence, name), join(target, name));
    assert.equal(sha256(readFileSync(join(target, name))), fileHashes[name], `Copied oracle ${name} differs from the evidence file`);
  }

  const config = join(directory, `host-${mode}.config.mjs`);
  const options = {
    root: directory,
    cacheDir: join(directory, ".host-vite-cache"),
    resolve: { alias: aliases },
    esbuild: { jsx: "automatic" },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: [],
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
  status = result.status ?? 1;
  const header = [
    `requested_revision=${revision}`,
    `resolved_commit=${commit}`,
    `mode=${mode}`,
    `suffix=${suffix}`,
    `include=${MODES[mode].join(",")}`,
    `runner_checkout_head=${runnerHead}`,
    `dependency_root=${dependencyRoot}`,
    `dependency_lockfile_sha256=${dependencyLockHash}`,
    `archive_lockfile_sha256=${archiveLockHash}`,
    `oracle_sha256 ${Object.entries(fileHashes).map(([name, hash]) => `${name}=${hash}`).join(" ")}`,
    `node=${process.version}`,
    `exit=${status}${result.signal ? ` signal=${result.signal}` : ""}${result.error ? ` spawn_error=${result.error.message}` : ""}`,
  ].join("\n");
  if (existsSync(logPath)) throw Error(`Evidence appeared during the run; refusing to overwrite ${logPath}`);
  writeFileSync(logPath, `${header}\n---- stdout ----\n${result.stdout ?? ""}\n---- stderr ----\n${result.stderr ?? ""}`.trimEnd() + "\n");
  const summary = (result.stdout ?? "").split("\n").filter(line => /^\s*(Test Files|Tests)\s/.test(line)).join(" | ");
  console.log(`${mode}: exit=${status} ${summary}`);
} finally {
  rmSync(directory, { recursive: true, force: true });
}
if (status !== 0) process.exitCode = status;
