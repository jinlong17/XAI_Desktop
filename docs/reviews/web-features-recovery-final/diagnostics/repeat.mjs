// Diagnostic repetition driver (scratch only, not evidence): runs one verify-callers.mjs mode N times per revision
// with output redirected to a scratch directory, then summarises pass/fail per run.
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const [worktree, depsRoot, outDir, mode, count, ...revisions] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });
const runner = join(worktree, "docs/reviews/web-features-recovery-final/verify-callers.mjs");
for (const revision of revisions) {
  const tally = { pass: 0, fail: 0, other: 0 };
  for (let index = 1; index <= Number(count); index += 1) {
    const suffix = `rep${index}`;
    const started = Date.now();
    const result = spawnSync("node", [runner, revision, mode, suffix], {
      cwd: worktree, encoding: "utf8",
      env: { ...process.env, XAI_DEPS_ROOT: depsRoot, XAI_FINAL_OUTPUT_DIR: outDir, DEBUG_PRINT_LIMIT: "300000" },
    });
    const log = join(outDir, `${mode}-${suffix}-${revision}.log`);
    const text = existsSync(log) ? readFileSync(log, "utf8") : "";
    const totals = (text.match(/^totals .*$/m) ?? ["totals missing"])[0];
    const failed = [...text.matchAll(/^case \d+ FAILED \| (.*)$/gm)].map(match => match[1]);
    const status = result.status;
    if (status === 0) tally.pass += 1; else if (failed.length) tally.fail += 1; else tally.other += 1;
    console.log(`${revision} ${suffix} exit=${status} ${Math.round((Date.now() - started) / 1000)}s ${totals}${failed.length ? ` FAILED: ${failed.join(" ; ")}` : ""}`);
  }
  console.log(`${revision} summary pass=${tally.pass} fail=${tally.fail} other=${tally.other}`);
}
