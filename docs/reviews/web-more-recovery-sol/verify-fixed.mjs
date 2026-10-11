import { copyFileSync, existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync, spawnSync } from "node:child_process";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const evidence = fileURLToPath(new URL("./", import.meta.url));
const revision = process.argv[2];
if (!revision) throw Error("Pinned revision required");
const commit = execFileSync("git", ["rev-parse", revision], { cwd: root, encoding: "utf8" }).trim();
const directory = mkdtempSync(join(tmpdir(), "xai-more-sol-"));
try {
  execFileSync("tar", ["-x", "-C", directory], { input: execFileSync("git", ["archive", commit], { cwd: root, maxBuffer: 100 * 1024 * 1024 }) });
  symlinkSync(join(root, "node_modules"), join(directory, "node_modules"));
  const aliases = [];
  for (const name of readdirSync(join(directory, "packages"))) {
    const folder = join(directory, "packages", name); let pkg;
    try { pkg = JSON.parse(readFileSync(join(folder, "package.json"), "utf8")); } catch { continue; }
    symlinkSync(join(root, "packages", name, "node_modules"), join(folder, "node_modules"));
    for (const [key, value] of Object.entries(pkg.exports ?? {})) {
      const target = typeof value === "string" ? value : value.import ?? value.default;
      if (typeof target === "string" && !key.includes("*")) aliases.push({ find: pkg.name + (key === "." ? "" : key.slice(1)), replacement: join(folder, target) });
    }
  }
  aliases.sort((left, right) => right.find.length - left.find.length);
  aliases.push({ find: "react", replacement: join(root, "packages/plugin-web-settings-rest/node_modules/react") }, { find: "@testing-library/react", replacement: join(root, "packages/plugin-web-settings-rest/node_modules/@testing-library/react") });
  const owned = join(directory, "docs/reviews/web-more-recovery-sol"); mkdirSync(owned, { recursive: true });
  for (const file of ["fixture.tsx", "fields.test.tsx", "reset.test.tsx", "queues.test.tsx", "boundaries.test.tsx", "owner-export.test.tsx"]) copyFileSync(join(evidence, file), join(owned, file));
  const modes = [
    ["fields", ["docs/reviews/web-more-recovery-sol/fields.test.tsx"]],
    ["reset", ["docs/reviews/web-more-recovery-sol/reset.test.tsx"]],
    ["queues", ["docs/reviews/web-more-recovery-sol/queues.test.tsx"]],
    ["boundaries", ["docs/reviews/web-more-recovery-sol/boundaries.test.tsx"]],
    ["owner-export", ["docs/reviews/web-more-recovery-sol/owner-export.test.tsx"]],
    ["original", ["packages/plugin-web-settings-rest/src/__tests__/morePane.test.tsx"]],
  ];
  for (const [mode, include] of modes) {
    if (process.argv[3] && process.argv[3] !== mode) continue;
    const config = join(directory, "sol.config.mjs");
    writeFileSync(config, "export default " + JSON.stringify({ root: directory, resolve: { alias: aliases }, esbuild: { jsx: "automatic" }, test: { globals: true, environment: "jsdom", setupFiles: [join(directory, "packages/plugin-web-settings-rest/vitest.setup.ts")], include } }));
    const result = spawnSync(join(root, "packages/plugin-web-settings-rest/node_modules/.bin/vitest"), ["run", "--config", config], { cwd: directory, encoding: "utf8", maxBuffer: 30 * 1024 * 1024 });
    const output = join(evidence, `${mode}-${process.argv[4] ?? "run"}-${revision}.log`); if (existsSync(output)) throw Error("Evidence exists; use suffix");
    writeFileSync(output, `revision=${revision} fixed_commit=${commit}\nexit=${result.status}\n${result.stdout}\n${result.stderr}`.trimEnd() + "\n");
    console.log(mode, `exit=${result.status}`, result.stdout.slice(-1800)); if (result.status !== 0) process.exitCode = result.status ?? 1;
  }
} finally { rmSync(directory, { recursive: true, force: true }); }
