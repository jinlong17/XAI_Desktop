// Scratch-only: run the diagnostic runner variant N times with a given Vitest name filter / extra files.
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const [diagRunner, worktree, depsRoot, outDir, mode, count, revision, label, vitestArgs = "[]", extra = "[]", include = ""] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });
let pass = 0, fail = 0;
for (let index = 1; index <= Number(count); index += 1) {
  const suffix = `${label}${index}`;
  const env = { ...process.env, XAI_DEPS_ROOT: depsRoot, XAI_FINAL_OUTPUT_DIR: outDir, XAI_DIAG_ROOT: worktree, XAI_DIAG_VITEST_ARGS: vitestArgs, XAI_DIAG_EXTRA: extra, DEBUG_PRINT_LIMIT: "300000" };
  if (include) env.XAI_DIAG_INCLUDE = include;
  const result = spawnSync("node", [diagRunner, revision, mode, suffix], { cwd: worktree, encoding: "utf8", env });
  const log = join(outDir, `${mode}-${suffix}-${revision}.log`);
  const text = existsSync(log) ? readFileSync(log, "utf8").replace(/\u001b\[[0-9;]*m/g, "") : "";
  const totals = (text.match(/^totals [^\n]*/m) ?? ["totals missing"])[0].replace(/ suite_errors.*/, "");
  const failedCases = [...text.matchAll(/^case \d+ FAILED \| ([^\n]*)/gm)].map(match => match[1]);
  const diag = [...text.matchAll(/^DIAG [^\n]*/gm)].map(match => match[0]);
  if (result.status === 0) pass += 1; else fail += 1;
  console.log(`${revision} ${suffix} exit=${result.status} ${totals}${failedCases.length ? ` FAILED: ${failedCases.join(" ; ")}` : ""}${result.status !== 0 && !text ? ` stderr=${result.stderr.slice(0, 400)}` : ""}`);
  for (const line of diag) console.log(`   ${line.slice(0, 600)}`);
}
console.log(`${revision} ${label} summary pass=${pass} fail=${fail}`);
