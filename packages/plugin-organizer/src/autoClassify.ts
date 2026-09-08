/**
 * Auto-classification rules (G3-E2).
 *
 * Given a `GridItemEntity` (typically just created from a Finder drop)
 * and the set of available `GridEntity` targets, pick the best Grid to
 * place it in based on extension / kind / path heuristics. Returning
 * `null` means "ask the user / keep on Desktop" — the runtime layer is
 * never forced into a bad placement.
 *
 * The default rule set is conservative: it only matches when a Grid
 * declares a `themeColor` or `title` slot that overlaps with the
 * incoming item's kind / extension. Future iterations can replace
 * `defaultClassificationRules()` with a Repository-backed rules table.
 */

import type { GridEntity, GridItemEntity } from "@repo/core-data";

export interface ClassificationContext {
  item: GridItemEntity;
  grids: GridEntity[];
}

export interface ClassificationRule {
  /** Stable identifier for the rule; surfaces in audit logs. */
  id: string;
  /** Higher score wins; ties resolve by rule order. */
  match(ctx: ClassificationContext): {
    gridId: string;
    score: number;
  } | null;
}

export interface ClassificationResult {
  gridId: string;
  ruleId: string;
  score: number;
}

/** Apply the rules in order; return the highest-scoring match. */
export function classifyGridItem(
  rules: ClassificationRule[],
  ctx: ClassificationContext,
): ClassificationResult | null {
  let best: ClassificationResult | null = null;
  for (const rule of rules) {
    const candidate = rule.match(ctx);
    if (!candidate) continue;
    if (!best || candidate.score > best.score) {
      best = {
        gridId: candidate.gridId,
        ruleId: rule.id,
        score: candidate.score,
      };
    }
  }
  return best;
}

/** Extract the file extension (lowercase, no leading dot). */
export function fileExtension(item: GridItemEntity): string | null {
  if (!item.filepath) return null;
  const lastSlash = item.filepath.lastIndexOf("/");
  const lastDot = item.filepath.lastIndexOf(".");
  if (lastDot <= lastSlash) return null;
  return item.filepath.slice(lastDot + 1).toLowerCase() || null;
}

const KIND_TO_TITLE_TOKENS: Record<GridItemEntity["kind"], string[]> = {
  file: ["docs", "documents", "notes", "files"],
  folder: ["folders", "projects"],
  app: ["apps", "applications"],
  url: ["links", "bookmarks", "web"],
};

const EXTENSION_GROUPS: Array<{
  exts: string[];
  tokens: string[];
}> = [
  { exts: ["png", "jpg", "jpeg", "gif", "webp", "heic"], tokens: ["images", "photos", "media"] },
  { exts: ["mp4", "mov", "avi", "mkv", "webm"], tokens: ["videos", "media"] },
  { exts: ["mp3", "wav", "flac", "aac"], tokens: ["audio", "music", "media"] },
  { exts: ["pdf"], tokens: ["pdfs", "documents", "docs"] },
  { exts: ["md", "markdown", "txt", "rtf"], tokens: ["notes", "docs", "writing"] },
  { exts: ["zip", "tar", "gz", "7z"], tokens: ["archives", "downloads"] },
];

function titleTokens(grid: GridEntity): string[] {
  return grid.title
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

/**
 * Default rule set:
 *
 * - Grid title contains the item's kind keyword (`docs`, `apps`, …) → score 10.
 * - Grid title contains an extension-group keyword (`images`, `pdfs`, …) → score 20.
 * - Grid title literally matches the parent folder name (e.g. `Photos`) → score 25.
 */
export function defaultClassificationRules(): ClassificationRule[] {
  return [
    {
      id: "kind-title-match",
      match: ({ item, grids }) => {
        const wanted = KIND_TO_TITLE_TOKENS[item.kind];
        for (const grid of grids) {
          const tokens = titleTokens(grid);
          if (tokens.some((t) => wanted.includes(t))) {
            return { gridId: grid.id, score: 10 };
          }
        }
        return null;
      },
    },
    {
      id: "extension-title-match",
      match: ({ item, grids }) => {
        const ext = fileExtension(item);
        if (!ext) return null;
        const group = EXTENSION_GROUPS.find((g) => g.exts.includes(ext));
        if (!group) return null;
        for (const grid of grids) {
          const tokens = titleTokens(grid);
          if (tokens.some((t) => group.tokens.includes(t))) {
            return { gridId: grid.id, score: 20 };
          }
        }
        return null;
      },
    },
    {
      id: "parent-folder-title-match",
      match: ({ item, grids }) => {
        if (!item.filepath) return null;
        const parts = item.filepath.split("/").filter(Boolean);
        if (parts.length < 2) return null;
        const parent = parts[parts.length - 2]?.toLowerCase();
        if (!parent) return null;
        for (const grid of grids) {
          if (titleTokens(grid).includes(parent)) {
            return { gridId: grid.id, score: 25 };
          }
        }
        return null;
      },
    },
  ];
}
