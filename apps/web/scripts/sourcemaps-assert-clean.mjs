import { listSourceMapFiles } from "./sourcemaps-lib.mjs";

const maps = listSourceMapFiles("./dist");
if (maps.length > 0) {
  console.error("[sourcemaps-assert-clean] public sourcemaps still present:\n" + maps.join("\n"));
  process.exit(1);
}

console.log("[sourcemaps-assert-clean] no public .map files in dist");
