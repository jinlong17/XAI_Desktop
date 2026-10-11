// Builds a scratch-only diagnostic variant of verify-callers.mjs (never committed, not evidence):
// - root comes from XAI_DIAG_ROOT (the worktree) because the copy lives in the scratchpad;
// - XAI_DIAG_VITEST_ARGS (JSON array) is appended to the Vitest arguments (for example ["-t", "name"]);
// - XAI_DIAG_EXTRA (JSON array of [sourceAbsolutePath, archiveRelativePath]) copies extra diagnostic oracles;
// - XAI_DIAG_INCLUDE (JSON array) overrides the include list.
import { readFileSync, writeFileSync } from "node:fs";
const [source, target] = process.argv.slice(2);
let text = readFileSync(source, "utf8");
const replace = (from, to) => { if (!text.includes(from)) throw Error(`pattern not found: ${from}`); text = text.replace(from, to); };
replace(`const root = fileURLToPath(new URL("../../../", import.meta.url));`, `const root = process.env.XAI_DIAG_ROOT.endsWith("/") ? process.env.XAI_DIAG_ROOT : process.env.XAI_DIAG_ROOT + "/";`);
replace(`const evidence = fileURLToPath(new URL("./", import.meta.url));`, `const evidence = root + "docs/reviews/web-features-recovery-final/";`);
replace(`const args = ["run", "--config", configFile, "--reporter=verbose", "--reporter=json", \`--outputFile.json=\${jsonReport}\`];`,
  `const args = ["run", "--config", configFile, "--reporter=verbose", "--reporter=json", \`--outputFile.json=\${jsonReport}\`, ...JSON.parse(process.env.XAI_DIAG_VITEST_ARGS ?? "[]")];`);
replace(`    for (const file of spec.include) assert(existsSync(join(directory, file)), \`Requested test file missing from the archive: \${file}\`);`,
  `    for (const [from, to] of JSON.parse(process.env.XAI_DIAG_EXTRA ?? "[]")) { mkdirSync(dirname(join(directory, to)), { recursive: true }); copyFileSync(from, join(directory, to)); }
    if (process.env.XAI_DIAG_INCLUDE) spec.include = JSON.parse(process.env.XAI_DIAG_INCLUDE);
    for (const file of spec.include) assert(existsSync(join(directory, file)), \`Requested test file missing from the archive: \${file}\`);`);
writeFileSync(target, text);
console.log("diagnostic runner written:", target);
