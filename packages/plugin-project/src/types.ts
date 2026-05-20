export interface DataAdapter<T extends { id: string }> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  save(item: T): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface ProjectList {
  id: string;
  title: string;
  order: number;
}

export interface Project {
  id: string;
  name: string;
  lists: ProjectList[];
  labels: string[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Card {
  id: string;
  title: string;
  listId: string;
  order: number;
  labels: string[];
  dueDate?: string;
  checklist: ChecklistItem[];
  description?: string;
}

export interface ProjectDraft {
  name: string;
  labels?: string[];
}

export interface CardDraft {
  title: string;
  listId: string;
  labels?: string[];
  dueDate?: string;
  description?: string;
}
