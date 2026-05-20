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
const SEED_TIMESTAMP = "2026-05-20T00:00:00.000Z";

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
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP,
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
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP,
  },
  {
    id: "card-project-board",
    title: "Project board scaffold",
    listId: "list-backlog",
    order: 0,
    labels: [],
    checklist: [],
    description: "Pure React drag and drop board.",
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP,
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

export function ProjectStoreProvider({ projectAdapter, cardAdapter, children }: ProjectStoreProviderProps) {
  const [defaultProjectAdapter] = useState(
    () => new LocalStorageAdapter<Project>(PROJECT_STORAGE_KEY, seedProjects),
  );
  const [defaultCardAdapter] = useState(() => new LocalStorageAdapter<Card>(CARD_STORAGE_KEY, seedCards));
  const stableProjectAdapter = projectAdapter ?? defaultProjectAdapter;
  const stableCardAdapter = cardAdapter ?? defaultCardAdapter;
  const [projects, setProjects] = useState<Project[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [nextProjects, nextCards] = await Promise.all([stableProjectAdapter.getAll(), stableCardAdapter.getAll()]);
    setProjects(nextProjects);
    setCards(nextCards);
    setActiveProjectId((current) => current ?? nextProjects[0]?.id ?? null);
  }, [stableCardAdapter, stableProjectAdapter]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createProject = useCallback(
    async (input: ProjectDraft) => {
      const name = input.name.trim();
      if (!name) throw new Error("Project name is required");
      const now = new Date().toISOString();
      const project: Project = {
        id: createId("project"),
        name,
        lists: defaultLists,
        labels: input.labels ?? [],
        createdAt: now,
        updatedAt: now,
      };
      await stableProjectAdapter.save(project);
      setProjects((prev) => [...prev, project]);
      setActiveProjectId(project.id);
      return project;
    },
    [stableProjectAdapter],
  );

  const createCard = useCallback(
    async (input: CardDraft) => {
      const title = input.title.trim();
      if (!title) throw new Error("Card title is required");
      const siblingCount = cards.filter((card) => card.listId === input.listId).length;
      const now = new Date().toISOString();
      const card: Card = {
        id: createId("card"),
        title,
        listId: input.listId,
        order: siblingCount,
        labels: input.labels ?? [],
        dueDate: input.dueDate,
        checklist: [],
        description: input.description,
        createdAt: now,
        updatedAt: now,
      };
      await stableCardAdapter.save(card);
      setCards((prev) => [...prev, card]);
      return card;
    },
    [cards, stableCardAdapter],
  );

  const updateCard = useCallback(
    async (id: string, patch: Partial<Omit<Card, "id">>) => {
      const current = await stableCardAdapter.getById(id);
      if (!current) return;
      const next = { ...current, ...patch, updatedAt: new Date().toISOString() };
      await stableCardAdapter.save(next);
      setCards((prev) => prev.map((card) => (card.id === id ? next : card)));
    },
    [stableCardAdapter],
  );

  const deleteCard = useCallback(
    async (id: string) => {
      await stableCardAdapter.delete(id);
      setCards((prev) => prev.filter((card) => card.id !== id));
    },
    [stableCardAdapter],
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
      const currentById = new Map(cards.map((card) => [card.id, card] as const));
      const movedAt = new Date().toISOString();
      const merged = [...normalizedTargetList, ...sourceList];
      const dirty = merged.filter((card) => {
        const before = currentById.get(card.id);
        return !before || before.listId !== card.listId || before.order !== card.order;
      });
      const dirtyIds = new Set(dirty.map((card) => card.id));
      const dirtyWithTimestamp = dirty.map((card) => ({ ...card, updatedAt: movedAt }));
      const unaffected = withoutTarget.filter((card) => card.listId !== listId && card.listId !== target.listId);
      const nextCards = [...unaffected, ...sourceList, ...normalizedTargetList].map((card) =>
        dirtyIds.has(card.id) ? { ...card, updatedAt: movedAt } : card,
      );
      await Promise.all(dirtyWithTimestamp.map((card) => stableCardAdapter.save(card)));
      setCards(nextCards);
    },
    [cards, stableCardAdapter],
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
