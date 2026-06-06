/**
 * TT-PROVIDER-NO-KEY-MATERIAL — explicit provider key-material guard (row #4 P3).
 *
 * Proves no provider key material reaches admin source fixtures, read-model outputs, or
 * the browser bundle. Real secret storage is server-side; the browser receives only
 * opaque handles/status/metadata. `vaultRef` is intentionally allowed because it is a
 * non-secret label, not a credential value.
 */
import { beforeAll, describe, expect, it } from "vitest";
import { execSync } from "child_process";
import { existsSync, readFileSync, readdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ADMIN_ROOT = join(__dirname, "..", "..");
const DIST = join(ADMIN_ROOT, "dist");
const ASSETS = join(DIST, "assets");
const FIXTURES = join(ADMIN_ROOT, "src", "fixtures", "index.ts");

const SECRET_FIELD_NAMES = [
  "apiKey",
  "secret",
  "secretKey",
  "token",
  "credential",
  "privateKey",
  "keyMaterial",
  "keyMask",
  "maskedTail",
] as const;

const PROVIDER_KEY_VALUE_PATTERNS: Array<{ name: string; pattern: RegExp }> = [
  { name: "OpenAI-style provider key", pattern: /sk-[A-Za-z0-9]{8,}/ },
  { name: "Anthropic-style provider key", pattern: /sk-ant-[A-Za-z0-9-]{6,}/ },
  { name: "Google provider key", pattern: /AIza[A-Za-z0-9_-]{6,}/ },
  { name: "masked provider key", pattern: /[A-Za-z-]{2,}•{3,}/ },
];

function collectOwnKeys(value: unknown): string[] {
  if (!value || typeof value !== "object") return [];
  if (Array.isArray(value)) return value.flatMap(collectOwnKeys);

  const record = value as Record<string, unknown>;
  return Object.keys(record).flatMap((key) => [key, ...collectOwnKeys(record[key])]);
}

function collectBundleFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectBundleFiles(full));
    else if (/\.(js|css|html)$/.test(entry.name)) out.push(full);
  }
  return out;
}

function distLooksBuilt(): boolean {
  return existsSync(ASSETS) && readdirSync(ASSETS).some((f) => f.endsWith(".js"));
}

function providerFixtureBlock(source: string): string {
  const start = source.indexOf("export const PROVIDERS");
  const end = source.indexOf("/* ---- Audit", start);
  expect(start, "PROVIDERS fixture block not found").toBeGreaterThanOrEqual(0);
  expect(end, "end of PROVIDERS fixture block not found").toBeGreaterThan(start);
  return source.slice(start, end);
}

describe("TT-PROVIDER-NO-KEY-MATERIAL", () => {
  let bundleFiles: string[] = [];

  beforeAll(() => {
    if (!distLooksBuilt()) {
      execSync("pnpm exec vite build", { cwd: ADMIN_ROOT, stdio: "ignore" });
    }
    bundleFiles = collectBundleFiles(DIST);
  }, 180_000);

  it("read-model facet carries provider statuses/handles only", async () => {
    const { providersReadSeam } = await import("../adapters");

    const providers = await providersReadSeam.list();
    const handles = await providersReadSeam.secretHandles();

    expect(providers.ok).toBe(true);
    expect(handles.ok).toBe(true);
    if (!providers.ok || !handles.ok) return;

    for (const object of [...providers.data, ...handles.data]) {
      const ownKeys = collectOwnKeys(object);
      for (const field of SECRET_FIELD_NAMES) {
        expect(ownKeys).not.toContain(field);
      }

      const serialized = JSON.stringify(object);
      for (const { name, pattern } of PROVIDER_KEY_VALUE_PATTERNS) {
        expect(serialized, `${name} leaked in read-model output`).not.toMatch(pattern);
      }
    }
  });

  it("fixture facet contains no provider key values or secret field names in provider literals", () => {
    const source = readFileSync(FIXTURES, "utf-8");
    const providersBlock = providerFixtureBlock(source);

    for (const { name, pattern } of PROVIDER_KEY_VALUE_PATTERNS) {
      expect(source, `${name} leaked in fixtures`).not.toMatch(pattern);
    }

    for (const field of SECRET_FIELD_NAMES) {
      const propertyPattern = new RegExp(`\\b${field}\\s*:`);
      expect(
        providersBlock,
        `secret field "${field}" found in provider fixture object literals`,
      ).not.toMatch(propertyPattern);
    }
  });

  it("bundle facet contains no provider key-shaped values", () => {
    expect(
      bundleFiles.filter((file) => file.endsWith(".js")).length,
      "no built .js found under apps/admin/dist",
    ).toBeGreaterThan(0);

    for (const { name, pattern } of PROVIDER_KEY_VALUE_PATTERNS) {
      const hits: string[] = [];
      for (const file of bundleFiles) {
        const content = readFileSync(file, "utf-8");
        if (pattern.test(content)) hits.push(file.replace(ADMIN_ROOT, "apps/admin"));
      }
      expect(hits, `${name} found in built browser bundle`).toHaveLength(0);
    }
  });
});
