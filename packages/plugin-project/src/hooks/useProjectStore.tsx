import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { LocalStorageAdapter } from "../data/LocalStorageAdapter";
import type { Card, CardDraft, ChecklistItem, DataAdapter, Project, ProjectDraft } from "../types";

const PROJECT_STORAGE_KEY = "xai.plugin-project.projects";
const CARD_STORAGE_KEY = "xai.plugin-project.cards";

const defaultLists = [
  { id: "list-backlog", title: "Backlog", order: 0 },
  { id: "list-active", title: "Active", order: 1 },
  { id: "list-review", title: "Review", order: 2 },
  { id: "list-done", title: "Done", order: 3 },
];

const seedProjects: Project[] = [
  {
    id: "project-track-b",
    name: "Track B Console",
    lists: defaultLists,
    labels: ["label-focus"],
  },
];

const seedCards: Card[] = [
  {
    id: "card-console-shell",
    title: "Console shell scaffold",
    listId: "list-active",
    order: 0,
    labels: ["label-focus"],
    dueDate: "2026-05-20",
    checklist: [
      { id: "check-sidebar", text: "Sidebar nav", done: true },
      { id: "check-search", text: "Global search shell", done: true },
    ],
    description: "Mock-first shell for Track B packages.",
  },
  {
    id: "card-project-board",
    title: "Project board scaffold",
    listId: "list-backlog",
    order: 0,
    labels: [],
    checklist: [],
    description: "Pure React drag and drop board.",
  },
];

function createId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeCardOrder(cards: Card[], listId: string): Card[] {
  return cards
    .filter((card) => card.listId === listId)
    .sort((a, b) => a.order - b.order)
    .map((card, order) => ({ ...card, order }));
}

export interface ProjectStore {
  projects: Project[];
  cards: Card[];
  activeProjectId: string | null;
  activeProject: Project | null;
  setActiveProject(projectId: string): void;
  refresh(): Promise<void>;
  createProject(input: ProjectDraft): Promise<Project>;
  createCard(input: CardDraft): Promise<Card>;
  updateCard(id: string, patch: Partial<Omit<Card, "id">>): Promise<void>;
  deleteCard(id: string): Promise<void>;
  moveCard(cardId: string, listId: string, order?: number): Promise<void>;
  updateChecklist(cardId: string, checklist: ChecklistItem[]): Promise<void>;
  getCardsByList(listId: string): Card[];
}

const ProjectStoreContext = createContext<ProjectStore | undefined>(undefined);

export interface ProjectStoreProviderProps {
  projectAdapter?: DataAdapter<Project>;
  cardAdapter?: DataAdapter<Card>;
  children: ReactNode;
}

export function ProjectStoreProvider({
  projectAdapter = new LocalStorageAdapter<Project>(PROJECT_STORAGE_KEY, seedProjects),
  cardAdapter = new LocalStorageAdapter<Card>(CARD_STORAGE_KEY, seedCards),
  children,
}: ProjectStoreProviderProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [nextProjects, nextCards] = await Promise.all([projectAdapter.getAll(), cardAdapter.getAll()]);
    setProjects(nextProjects);
    setCards(nextCards);
    setActiveProjectId((current) => current ?? nextProjects[0]?.id ?? null);
  }, [cardAdapter, projectAdapter]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createProject = useCallback(
    async (input: ProjectDraft) => {
      const name = input.name.trim();
      if (!name) throw new Error("Project name is required");
      const project: Project = { id: createId("project"), name, lists: defaultLists, labels: input.labels ?? [] };
      await projectAdapter.save(project);
      setProjects((prev) => [...prev, project]);
      setActiveProjectId(project.id);
      return project;
    },
    [projectAdapter],
  );

  const createCard = useCallback(
    async (input: CardDraft) => {
      const title = input.title.trim();
      if (!title) throw new Error("Card title is required");
      const siblingCount = cards.filter((card) => card.listId === input.listId).length;
      const card: Card = {
        id: createId("card"),
        title,
        listId: input.listId,
        order: siblingCount,
        labels: input.labels ?? [],
        dueDate: input.dueDate,
        checklist: [],
        description: input.description,
      };
      await cardAdapter.save(card);
      setCards((prev) => [...prev, card]);
      return card;
    },
    [cardAdapter, cards],
  );

  const updateCard = useCallback(
    async (id: string, patch: Partial<Omit<Card, "id">>) => {
      const current = await cardAdapter.getById(id);
      if (!current) return;
      const next = { ...current, ...patch };
      await cardAdapter.save(next);
      setCards((prev) => prev.map((card) => (card.id === id ? next : card)));
    },
    [cardAdapter],
  );

  const deleteCard = useCallback(
    async (id: string) => {
      await cardAdapter.delete(id);
      setCards((prev) => prev.filter((card) => card.id !== id));
    },
    [cardAdapter],
  );

  const moveCard = useCallback(
    async (cardId: string, listId: string, order = 0) => {
      const target = cards.find((card) => card.id === cardId);
      if (!target) return;
      const withoutTarget = cards.filter((card) => card.id !== cardId);
      const targetList = withoutTarget.filter((card) => card.listId === listId).sort((a, b) => a.order - b.order);
      const clampedOrder = Math.min(Math.max(order, 0), targetList.length);
      targetList.splice(clampedOrder, 0, { ...target, listId, order: clampedOrder });
      const normalizedTargetList = targetList.map((card, index) => ({ ...card, order: index }));
      const sourceList = target.listId === listId ? [] : normalizeCardOrder(withoutTarget, target.listId);
      const unaffected = withoutTarget.filter((card) => card.listId !== listId && card.listId !== target.listId);
      const nextCards = [...unaffected, ...sourceList, ...normalizedTargetList];
      await Promise.all(nextCards.map((card) => cardAdapter.save(card)));
      setCards(nextCards);
    },
    [cardAdapter, cards],
  );

  const updateChecklist = useCallback(
    async (cardId: string, checklist: ChecklistItem[]) => updateCard(cardId, { checklist }),
    [updateCard],
  );

  const activeProject = activeProjectId ? projects.find((project) => project.id === activeProjectId) ?? null : null;
  const getCardsByList = useCallback(
    (listId: string) => cards.filter((card) => card.listId === listId).sort((a, b) => a.order - b.order),
    [cards],
  );

  const value = useMemo<ProjectStore>(
    () => ({
      projects,
      cards,
      activeProjectId,
      activeProject,
      setActiveProject: setActiveProjectId,
      refresh,
      createProject,
      createCard,
      updateCard,
      deleteCard,
      moveCard,
      updateChecklist,
      getCardsByList,
    }),
    [projects, cards, activeProjectId, activeProject, refresh, createProject, createCard, updateCard, deleteCard, moveCard, updateChecklist, getCardsByList],
  );

  return <ProjectStoreContext.Provider value={value}>{children}</ProjectStoreContext.Provider>;
}

export function useProjectStore(): ProjectStore {
  const store = useContext(ProjectStoreContext);
  if (!store) throw new Error("useProjectStore must be used within ProjectStoreProvider");
  return store;
}
