import type { Repo, RepoRecord } from "@repo/core-data";
import type { SearchableEntity } from "../types";

export interface RepoSearchSource<T extends RepoRecord> {
  repo: Repo<T>;
  entityType: string;
  map(record: T): SearchableEntity | null;
}

export function createRepoSearchProvider(sources: readonly RepoSearchSource<RepoRecord>[]) {
  return async function repoSearchProvider(): Promise<SearchableEntity[]> {
    const results = await Promise.all(
      sources.map(async (source) => {
        const records = await source.repo.list({ entityType: source.entityType });
        return records.map((record) => source.map(record)).filter((entity): entity is SearchableEntity => Boolean(entity));
      }),
    );
    return results.flat();
  };
}
