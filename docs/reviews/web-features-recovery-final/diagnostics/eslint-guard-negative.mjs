// Negative and positive control for the ESLint module-resolution guard embedded in verify-packages.mjs.
// Not evidence; development check only. Writes only inside the scratch directory given as argv[4].
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

const [runner, dependencyRoot, eslintStoreDir, scratch] = process.argv.slice(2);
const source = readFileSync(runner, "utf8");
const match = /const ESLINT_GUARD = `([\s\S]*?)`;\n/.exec(source);
if (!match) throw Error("guard template not found");
const guardText = match[1].replace(/\\\\n/g, "\\n");
mkdirSync(scratch, { recursive: true });
const guardFile = join(scratch, "eslint-guard.mjs");
writeFileSync(guardFile, guardText);
const eslintBin = join(dependencyRoot, "node_modules/.bin/eslint");
for (const [label, forbidden] of [["positive (nothing forbidden)", []], ["negative (eslint's own store folder forbidden)", [eslintStoreDir]]]) {
  const pinLog = join(scratch, `pin-${label.split(" ")[0]}.log`);
  const env = { ...process.env, NODE_OPTIONS: `--import=${pathToFileURL(guardFile).href}`, XAI_FINAL_GUARD_SETTINGS: JSON.stringify({ archive: scratch, forbidden, pinLog }) };
  const result = spawnSync(eslintBin, ["--version"], { cwd: scratch, encoding: "utf8", env });
  const pin = existsSync(pinLog) ? readFileSync(pinLog, "utf8").split("\n").filter(Boolean) : [];
  console.log(`${label}: exit=${result.status} stdout=${JSON.stringify(result.stdout.trim())} stderr_first=${JSON.stringify((result.stderr.split("\n").find(line => line.includes("Pin violation")) ?? result.stderr.split("\n")[0] ?? "").slice(0, 200))} hook_lines=${pin.filter(line => line.startsWith("hook-registered")).length} violations=${pin.filter(line => line.startsWith("violation")).length}`);
}
