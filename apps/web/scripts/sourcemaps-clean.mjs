import { removeSourceMapFiles } from "./sourcemaps-lib.mjs";

const removed = removeSourceMapFiles("./dist");
console.log(`[sourcemaps-clean] removed ${removed.length} .map file(s)`);
