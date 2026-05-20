import { describe, it, expect, beforeEach } from "vitest";
import { createInMemoryRepo } from "../src/testing";
import type { RepoRecord } from "../src/types";
import {
  makeRecord,
  runRepositoryContractTests,
  type ContractRecord,
} from "./repository-contract";

interface TestRecord extends RepoRecord {
  value: string;
}

runRepositoryContractTests("createInMemoryRepo contract", () =>
  createInMemoryRepo<ContractRecord>({ namespace: "contract" }),
);

describe("createInMemoryRepo", () => {
  let repo: ReturnType<typeof createInMemoryRepo<TestRecord>>;

  beforeEach(() => {
    repo = createInMemoryRepo<TestRecord>();
  });

  it("should return undefined for a missing record", async () => {
    const result = await repo.get("nonexistent");
    expect(result).toBeUndefined();
  });

  it("should put and get a record round-trip", async () => {
    const record: TestRecord = { ...makeRecord("r1"), value: "hello" };
    await repo.put(record);
    const result = await repo.get("r1");
    expect(result).toEqual(record);
  });

  it("should overwrite a record on repeated put (upsert)", async () => {
    await repo.put({ ...makeRecord("r1"), value: "first" });
    await repo.put({ ...makeRecord("r1"), value: "second" });
    const result = await repo.get("r1");
    expect(result?.value).toBe("second");
  });

  it("should delete a record and return undefined after", async () => {
    await repo.put({ ...makeRecord("r2"), value: "data" });
    await repo.delete("r2");
    const result = await repo.get("r2");
    expect(result).toBeUndefined();
  });

  it("delete is a no-op when record does not exist", async () => {
    await expect(repo.delete("ghost")).resolves.toBeUndefined();
  });

  it("should list all stored records", async () => {
    await repo.put({ ...makeRecord("a"), value: "1" });
    await repo.put({ ...makeRecord("b"), value: "2" });
    const all = await repo.list();
    expect(all).toHaveLength(2);
    const ids = all.map((r) => r.id).sort();
    expect(ids).toEqual(["a", "b"]);
  });

  it("should list empty array for empty repo", async () => {
    const all = await repo.list();
    expect(all).toEqual([]);
  });
});
