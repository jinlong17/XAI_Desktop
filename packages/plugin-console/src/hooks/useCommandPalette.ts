import { useCallback, useEffect, useMemo, useState } from "react";
import type { PluginSlotRegistry } from "../registry/PluginSlotRegistry";
import type { CommandSearchResult, SearchResultAction, SearchableEntity } from "../types";

const defaultEntities: SearchableEntity[] = [
  { id: "label-focus", type: "label", title: "Focus", subtitle: "Label", keywords: ["deep work", "priority"] },
  { id: "todo-review-roadmap", type: "todo", title: "Review Track B roadmap", subtitle: "Todo", keywords: ["urgent", "important"] },
  { id: "habit-deep-work", type: "habit", title: "Deep work block", subtitle: "Habit", keywords: ["streak"] },
  { id: "clip-email", type: "clipboard", title: "Follow up with design@example.com", subtitle: "Clipboard", keywords: ["email"] },
  { id: "project-console", type: "project", title: "Console shell", subtitle: "Project", keywords: ["kanban", "board"] },
];

function actionsFor(entity: SearchableEntity): SearchResultAction[] {
  if (entity.type === "clipboard") return ["copy", "open"];
  if (entity.type === "todo") return ["open", "reveal", "create"];
  return ["open", "reveal"];
}

function scoreEntity(entity: SearchableEntity, query: string): number {
  const lower = query.toLowerCase();
  if (!lower) return 1;
  const haystack = [entity.title, entity.subtitle, ...(entity.keywords ?? [])].join(" ").toLowerCase();
  if (entity.title.toLowerCase().startsWith(lower)) return 100;
  if (haystack.includes(lower)) return 50;
  return 0;
}

export interface CommandPaletteController {
  isOpen: boolean;
  query: string;
  results: CommandSearchResult[];
  degradedProviders: string[];
  activeIndex: number;
  setQuery(query: string): void;
  setActiveIndex(index: number): void;
  open(): void;
  close(): void;
  toggle(): void;
  execute(result: CommandSearchResult, action?: SearchResultAction): void;
}

export interface UseCommandPaletteOptions {
  entities?: SearchableEntity[];
  registry?: PluginSlotRegistry;
  repoSearchProvider?: () => Promise<SearchableEntity[]>;
  onExecute?: (result: CommandSearchResult, action: SearchResultAction) => void;
}

export function useCommandPalette({
  entities,
  registry,
  repoSearchProvider,
  onExecute,
}: UseCommandPaletteOptions = {}): CommandPaletteController {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [registered, setRegistered] = useState<SearchableEntity[]>([]);
  const [degradedProviders, setDegradedProviders] = useState<string[]>([]);
  const [repoEntities, setRepoEntities] = useState<SearchableEntity[]>([]);

  const setQueryStable = useCallback((nextQuery: string) => {
    setQuery(nextQuery);
    setActiveIndex(0);
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((current) => !current);
  }, []);

  useEffect(() => {
    if (!registry) return;
    let cancelled = false;
    void registry.getSearchEntities(200).then((snapshot) => {
      if (cancelled) return;
      setRegistered(snapshot.entities);
      setDegradedProviders([...snapshot.timedOutProviders, ...snapshot.failedProviders]);
    });
    return () => {
      cancelled = true;
    };
  }, [registry]);

  useEffect(() => {
    if (!repoSearchProvider) return;
    let cancelled = false;
    void repoSearchProvider().then((next) => {
      if (!cancelled) setRepoEntities(next);
    });
    return () => {
      cancelled = true;
    };
  }, [repoSearchProvider]);

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        toggle();
      }
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [toggle]);

  const effectiveEntities = entities ?? (repoSearchProvider ? repoEntities : registry ? registered : defaultEntities);

  const results = useMemo<CommandSearchResult[]>(() => {
    return effectiveEntities
      .map((entity) => ({ id: `${entity.type}:${entity.id}`, entity, score: scoreEntity(entity, query), actions: actionsFor(entity) }))
      .filter((result) => result.score > 0)
      .sort((a, b) => b.score - a.score || a.entity.title.localeCompare(b.entity.title))
      .slice(0, 12);
  }, [effectiveEntities, query]);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setActiveIndex(0);
  }, []);

  const execute = useCallback(
    (result: CommandSearchResult, action: SearchResultAction = result.actions[0] ?? "open") => {
      onExecute?.(result, action);
      close();
    },
    [close, onExecute],
  );

  return {
    isOpen,
    query,
    results,
    degradedProviders,
    activeIndex,
    setQuery: setQueryStable,
    setActiveIndex,
    open,
    close,
    toggle,
    execute,
  };
}
