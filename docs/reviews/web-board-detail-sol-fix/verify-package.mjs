/** Author runner: immutable product archive, package suite only. */
import { execFileSync, spawnSync } from "node:child_process";
import {
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const output = fileURLToPath(new URL("./", import.meta.url));
const revision = process.argv[2];
const label = process.argv[3] ?? "package";
if (!revision) throw new Error("Pinned revision required");
const directory = mkdtempSync(join(tmpdir(), "xai-board-detail-package-"));

try {
  execFileSync("tar", ["-x", "-C", directory], {
    input: execFileSync("git", ["archive", revision], {
      cwd: root,
      maxBuffer: 100 * 1024 * 1024,
    }),
  });
  symlinkSync(join(root, "node_modules"), join(directory, "node_modules"));
  const aliases = [];
  for (const name of readdirSync(join(directory, "packages"))) {
    const folder = join(directory, "packages", name);
    try {
      const pkg = JSON.parse(readFileSync(join(folder, "package.json"), "utf8"));
      symlinkSync(join(root, "packages", name, "node_modules"), join(folder, "node_modules"));
      for (const [key, value] of Object.entries(pkg.exports ?? {})) {
        const target = typeof value === "string" ? value : value.import ?? value.default;
        if (typeof target === "string" && !key.includes("*")) {
          aliases.push({
            find: pkg.name + (key === "." ? "" : key.slice(1)),
            replacement: join(folder, target),
          });
        }
      }
    } catch {
      // Non-package folders do not participate in the workspace aliases.
    }
  }
  aliases.sort((left, right) => right.find.length - left.find.length);
  const packageRoot = join(directory, "packages/plugin-web-board-workspaces");
  const config = join(directory, "author-package.config.mjs");
  writeFileSync(
    config,
    `export default ${JSON.stringify({
      root: packageRoot,
      resolve: { alias: aliases },
      esbuild: { jsx: "automatic" },
      test: {
        globals: true,
        environment: "jsdom",
        setupFiles: [join(packageRoot, "vitest.setup.ts")],
        include: ["src/__tests__/**/*.{test,spec}.{ts,tsx}"],
      },
    })}`,
  );
  const result = spawnSync(
    join(root, "packages/plugin-web-board-workspaces/node_modules/.bin/vitest"),
    ["run", "--config", config],
    { cwd: packageRoot, encoding: "utf8", maxBuffer: 30 * 1024 * 1024 },
  );
  if (result.error) throw result.error;
  writeFileSync(
    join(output, `${label}-${revision}.log`),
    `revision=${revision}\nexit=${result.status}\n${result.stdout}\n${result.stderr}`.trimEnd() + "\n",
  );
  console.log(result.stdout.slice(-2200));
  if (result.status !== 0) process.exitCode = result.status ?? 1;
} finally {
  rmSync(directory, { recursive: true, force: true });
}
