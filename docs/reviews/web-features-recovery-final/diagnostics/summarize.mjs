import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
const dir = process.argv[2];
for (const name of readdirSync(dir).filter(file => file.endsWith(".log")).sort()) {
  const text = readFileSync(join(dir, name), "utf8").replace(/\u001b\[[0-9;]*m/g, "");
  const assertion = (text.match(/AssertionError: [^\n]*/) ?? ["(none)"])[0];
  const notCompleted = [...new Set([...text.matchAll(/([A-Za-z ()]+) reset to default was not completed/g)].map(match => match[1].trim()))];
  const totals = (text.match(/^totals [^\n]*/m) ?? [""])[0].replace(/ suite_errors.*/, "");
  console.log(`${name}: ${totals} | ${assertion} | not-completed: ${notCompleted.join("; ") || "-"}`);
}
