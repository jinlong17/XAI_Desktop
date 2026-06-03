import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(new URL("../..", import.meta.url).pathname);
const sourcePath = resolve(repoRoot, "docs/workflow/project/dashboard-state.json");
const generatedPath = resolve(repoRoot, "docs/prototypes/dev-dashboard/state.generated.js");
const requiredKeys = ["web", "app", "plugin", "sync", "site", "admin"];
const allowedSupportReleaseKeys = new Set(["project-system"]);

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function readGeneratedState(path) {
  const text = readFileSync(path, "utf8");
  return JSON.parse(text.replace(/^window\.XAI_DASHBOARD_STATE\s*=\s*/, "").replace(/;\s*$/, ""));
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertKeySet(label, rows) {
  const keys = rows.map(row => row.key);
  assert(
    JSON.stringify([...keys].sort()) === JSON.stringify([...requiredKeys].sort()),
    `${label} keys must be ${requiredKeys.join(", ")}; got ${keys.join(", ")}`
  );
  assert(new Set(keys).size === keys.length, `${label} keys must be unique`);
}

function assertRegistryModule(module, sourceModule) {
  assert(module.labels?.overview, `${module.key} missing labels.overview`);
  assert(module.labels?.deployment, `${module.key} missing labels.deployment`);
  assert(module.labels?.release, `${module.key} missing labels.release`);
  assert(module.visual?.tone, `${module.key} missing visual.tone`);
  assert(module.visual?.icon, `${module.key} missing visual.icon`);
  assert(module.overview?.phase || module.phase, `${module.key} missing overview phase`);
  assert(module.overview?.running || module.running, `${module.key} missing overview running`);
  assert(module.overview?.target || module.target, `${module.key} missing overview target`);
  assert(module.tracking?.region || module.region, `${module.key} missing tracking region`);
  assert(Array.isArray(module.features), `${module.key} features must be an array`);
  assert(Array.isArray(module.routing), `${module.key} routing must be an array`);
  assert(Array.isArray(module.skills), `${module.key} skills must be an array`);
  assert(Array.isArray(module.workflow), `${module.key} workflow must be an array`);
  assert(Array.isArray(module.transitions), `${module.key} transitions must be an array`);
  assert(Array.isArray(module.impacts), `${module.key} impacts must be an array`);

  if (sourceModule) {
    assert(module.overview_title === module.labels.overview, `${module.key} overview_title must derive from labels.overview`);
    assert(module.deployment_title === module.labels.deployment, `${module.key} deployment_title must derive from labels.deployment`);
    assert(module.release_title === module.labels.release, `${module.key} release_title must derive from labels.release`);
    assert(module.tone === module.visual.tone, `${module.key} tone must derive from visual.tone`);
    assert(module.icon === module.visual.icon, `${module.key} icon must derive from visual.icon`);
    assert(JSON.stringify(module.features) === JSON.stringify(sourceModule.features), `${module.key} features drifted from registry source`);
  }
}

const source = readJson(sourcePath);
assert(Array.isArray(source.product_lines), "dashboard-state.json must define product_lines");
assertKeySet("source product_lines", source.product_lines);
source.product_lines.forEach(module => assertRegistryModule(module));

assert(existsSync(generatedPath), "state.generated.js is missing; run pnpm dashboard first");
const generated = readGeneratedState(generatedPath);
assert(generated.product_module_registry?.field === "product_lines", "generated state must expose product_module_registry.field=product_lines");
assert(Array.isArray(generated.product_lines), "generated product_lines missing");
assert(Array.isArray(generated.overview_modules), "generated overview_modules missing");
assertKeySet("generated product_lines", generated.product_lines);
assertKeySet("generated overview_modules", generated.overview_modules);
assert(
  JSON.stringify(generated.product_lines) === JSON.stringify(generated.overview_modules),
  "overview_modules must be the same generated module definitions as product_lines"
);

const sourceByKey = new Map(source.product_lines.map(module => [module.key, module]));
const generatedByKey = new Map(generated.product_lines.map(module => [module.key, module]));
generated.product_lines.forEach(module => assertRegistryModule(module, sourceByKey.get(module.key)));

(generated.product_links || []).forEach(([from, to]) => {
  assert(generatedByKey.has(from), `product_links references unknown module ${from}`);
  assert(generatedByKey.has(to), `product_links references unknown module ${to}`);
});

(generated.deployment?.modules || []).forEach(module => {
  assert(generatedByKey.has(module.key), `deployment.modules references unknown module ${module.key}`);
});

(generated.release_modules || []).forEach(module => {
  const product = generatedByKey.get(module.key);
  if (product) {
    assert(module.title === product.release_title, `${module.key} release title must derive from registry`);
    assert(module.tone === product.tone, `${module.key} release tone must derive from registry`);
    return;
  }
  assert(allowedSupportReleaseKeys.has(module.key), `release_modules references unknown module ${module.key}`);
  assert(module.title && module.tone, `${module.key} support release module must expose title and tone`);
});

generated.product_lines.forEach(module => {
  (module.related_docs || []).forEach(doc => {
    assert(doc.path && existsSync(resolve(repoRoot, doc.path)), `${module.key} related doc missing: ${doc.path}`);
  });
});

console.log(`verified Product Module Registry: ${generated.product_lines.map(module => module.key).join(", ")}`);
