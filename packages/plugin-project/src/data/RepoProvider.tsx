import { createContext, useContext, useMemo, type ReactNode } from "react";
import { createTauriRepo, type Repo } from "@repo/core-data";
import { useTauriInvoke } from "@repo/core/hooks";
import { LocalStorageAdapter } from "./LocalStorageAdapter";
import { RepoAdapter } from "./RepoAdapter";
import type { Card, DataAdapter, Project } from "../types";

const PROJECT_STORAGE_KEY = "xai.plugin-project.projects";
const CARD_STORAGE_KEY = "xai.plugin-project.cards";

export interface ProjectRepoAdapters {
  projectAdapter: DataAdapter<Project>;
  cardAdapter: DataAdapter<Card>;
}

const ProjectRepoContext = createContext<ProjectRepoAdapters | undefined>(undefined);

export interface ProjectRepoProviderProps {
  projectAdapter?: DataAdapter<Project>;
  cardAdapter?: DataAdapter<Card>;
  projectRepo?: Repo<Project>;
  cardRepo?: Repo<Card>;
  seedProjects?: Project[];
  seedCards?: Card[];
  children: ReactNode;
}

function canUseTauriRepo(): boolean {
  return typeof window !== "undefined" && Boolean((window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__);
}

export function ProjectRepoProvider({
  projectAdapter,
  cardAdapter,
  projectRepo,
  cardRepo,
  seedProjects = [],
  seedCards = [],
  children,
}: ProjectRepoProviderProps) {
  const { invoke } = useTauriInvoke();
  const value = useMemo<ProjectRepoAdapters>(() => {
    const resolvedProjectRepo = projectRepo ?? (canUseTauriRepo() ? createTauriRepo<Project>(invoke, { namespace: "plugin-project-projects", schemaVersion: 1 }) : undefined);
    const resolvedCardRepo = cardRepo ?? (canUseTauriRepo() ? createTauriRepo<Card>(invoke, { namespace: "plugin-project-cards", schemaVersion: 1 }) : undefined);
    return {
      projectAdapter:
        projectAdapter ??
        (resolvedProjectRepo
          ? new RepoAdapter<Project>(resolvedProjectRepo, { entityType: "project.project", seed: seedProjects })
          : new LocalStorageAdapter<Project>(PROJECT_STORAGE_KEY, seedProjects)),
      cardAdapter:
        cardAdapter ??
        (resolvedCardRepo
          ? new RepoAdapter<Card>(resolvedCardRepo, { entityType: "project.card", seed: seedCards })
          : new LocalStorageAdapter<Card>(CARD_STORAGE_KEY, seedCards)),
    };
  }, [cardAdapter, cardRepo, invoke, projectAdapter, projectRepo, seedCards, seedProjects]);

  return <ProjectRepoContext.Provider value={value}>{children}</ProjectRepoContext.Provider>;
}

export function useProjectRepoAdapters(): ProjectRepoAdapters | undefined {
  return useContext(ProjectRepoContext);
}
