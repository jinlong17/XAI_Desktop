import {
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync, spawnSync } from "node:child_process";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const evidence = fileURLToPath(new URL("./", import.meta.url));
const revision = process.argv[2];
const suffix = process.argv[3] ?? "run";

if (!revision) throw new Error("Pinned revision required");

const commit = execFileSync("git", ["rev-parse", revision], {
  cwd: root,
  encoding: "utf8",
}).trim();
const archive = mkdtempSync(join(tmpdir(), "xai-more-final-"));

const linkWorkspaceNodeModules = (group) => {
  const archivedGroup = join(archive, group);
  for (const name of readdirSync(archivedGroup)) {
    const packageRoot = join(archivedGroup, name);
    try {
      JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf8"));
    } catch {
      continue;
    }
    const source = join(root, group, name, "node_modules");
    if (existsSync(source)) symlinkSync(source, join(packageRoot, "node_modules"));
  }
};

const checks = [
  ["settings-typecheck", ["--filter", "@repo/plugin-web-settings-rest", "typecheck"]],
  ["settings-lint", ["--filter", "@repo/plugin-web-settings-rest", "lint"]],
  ["web-check-types", ["--filter", "@repo/web", "check-types"]],
  ["web-test", ["--filter", "@repo/web", "test"]],
  ["web-lint", ["--filter", "@repo/web", "lint"]],
  ["storage-check-types", ["--filter", "@repo/plugin-web-storage", "check-types"]],
];

try {
  execFileSync("tar", ["-x", "-C", archive], {
    input: execFileSync("git", ["archive", commit], {
      cwd: root,
      maxBuffer: 100 * 1024 * 1024,
    }),
  });
  symlinkSync(join(root, "node_modules"), join(archive, "node_modules"));
  linkWorkspaceNodeModules("apps");
  linkWorkspaceNodeModules("packages");

  for (const [name, args] of checks) {
    const result = spawnSync("pnpm", args, {
      cwd: archive,
      encoding: "utf8",
      maxBuffer: 100 * 1024 * 1024,
    });
    if (result.error) throw result.error;

    const output = join(evidence, `${name}-${suffix}-${revision}.log`);
    if (existsSync(output)) throw new Error(`Evidence exists: ${output}`);
    writeFileSync(
      output,
      [
        `revision=${revision}`,
        `fixed_commit=${commit}`,
        `command=pnpm ${args.join(" ")}`,
        `exit=${result.status}`,
        result.stdout,
        result.stderr,
      ]
        .join("\n")
        .trimEnd() + "\n",
    );
    console.log(name, `exit=${result.status}`, result.stdout.slice(-1800));
    if (result.status !== 0) process.exitCode = result.status ?? 1;
  }
} finally {
  rmSync(archive, { recursive: true, force: true });
}
