import type { Repo } from "@repo/core-data";
import type { DataAdapter, PetEntity } from "../types";

const ENTITY_TYPE: PetEntity["entityType"] = "pet.pet";

export class RepoAdapter implements DataAdapter<PetEntity> {
  constructor(private readonly repo: Repo<PetEntity>) {}

  async getAll(): Promise<PetEntity[]> {
    const pets = await this.repo.list({ entityType: ENTITY_TYPE });
    return pets.filter((pet) => !pet.deletedAt);
  }

  async getById(id: string): Promise<PetEntity | null> {
    const pet = await this.repo.get(id);
    return pet && !pet.deletedAt ? pet : null;
  }

  async save(item: PetEntity): Promise<void> {
    await this.repo.put({ ...item, entityType: ENTITY_TYPE, syncScope: "device-local" });
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
