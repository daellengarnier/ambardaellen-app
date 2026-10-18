"use client";

import { create } from "zustand";
import type {
  AreaDto,
  DayPlanDto,
  InboxDto,
  TodoDto,
  TodoInput,
  TodoPatch,
} from "./life";
import { todayZurich } from "./life";

// Client-Zustand für alles, was über /api/v1 läuft (Todos, Inbox,
// Tagesplan). Nicht persistiert: Quelle ist der Server, Jarvis schreibt
// parallel. Änderungen werden optimistisch angezeigt und bei Fehlern
// durch einen frischen Stand vom Server ersetzt.

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/v1${path}`, {
    cache: "no-store",
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

type LifeState = {
  areas: AreaDto[];
  todos: TodoDto[];
  inbox: InboxDto[];
  plan: DayPlanDto | null;
  loaded: boolean;
  error: string | null;

  refresh: () => Promise<void>;
  addTodo: (input: TodoInput) => Promise<TodoDto | null>;
  updateTodo: (id: string, patch: TodoPatch) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  removeTodo: (id: string) => Promise<void>;
  addInbox: (text: string) => Promise<void>;
  processInbox: (id: string, input: TodoInput) => Promise<void>;
  dismissInbox: (id: string) => Promise<void>;
  removeInbox: (id: string) => Promise<void>;
  reset: () => void;
};

const DONE_LIMIT = 150;

export const useLife = create<LifeState>()((set, get) => {
  const fail = async (e: unknown) => {
    set({ error: (e as Error).message });
    await get().refresh();
  };

  return {
    areas: [],
    todos: [],
    inbox: [],
    plan: null,
    loaded: false,
    error: null,

    refresh: async () => {
      try {
        const today = todayZurich();
        const [areas, open, done, inbox, plan] = await Promise.all([
          get().areas.length
            ? Promise.resolve({ areas: get().areas })
            : api<{ areas: AreaDto[] }>("/areas"),
          api<{ todos: TodoDto[] }>("/todos?status=offen"),
          api<{ todos: TodoDto[] }>(`/todos?status=erledigt&limit=${DONE_LIMIT}`),
          api<{ items: InboxDto[] }>("/inbox"),
          api<{ plan: DayPlanDto | null }>(`/day-plans/${today}`),
        ]);
        set({
          areas: areas.areas,
          todos: [...open.todos, ...done.todos],
          inbox: inbox.items,
          plan: plan.plan,
          loaded: true,
          error: null,
        });
      } catch (e) {
        set({ error: (e as Error).message, loaded: true });
      }
    },

    addTodo: async (input) => {
      try {
        const { todo } = await api<{ todo: TodoDto }>("/todos", {
          method: "POST",
          body: JSON.stringify(input),
        });
        set((s) => ({ todos: [todo, ...s.todos] }));
        return todo;
      } catch (e) {
        await fail(e);
        return null;
      }
    },

    updateTodo: async (id, patch) => {
      set((s) => ({
        todos: s.todos.map((t) =>
          t.id === id
            ? {
                ...t,
                ...patch,
                doneAt:
                  patch.status === undefined
                    ? t.doneAt
                    : patch.status === "erledigt"
                      ? new Date().toISOString()
                      : null,
              }
            : t,
        ) as TodoDto[],
      }));
      try {
        const { todo } = await api<{ todo: TodoDto }>(`/todos/${id}`, {
          method: "PATCH",
          body: JSON.stringify(patch),
        });
        set((s) => ({ todos: s.todos.map((t) => (t.id === id ? todo : t)) }));
      } catch (e) {
        await fail(e);
      }
    },

    toggleTodo: async (id) => {
      const t = get().todos.find((x) => x.id === id);
      if (!t) return;
      await get().updateTodo(id, { status: t.status === "offen" ? "erledigt" : "offen" });
    },

    removeTodo: async (id) => {
      set((s) => ({ todos: s.todos.filter((t) => t.id !== id) }));
      try {
        await api(`/todos/${id}`, { method: "DELETE" });
      } catch (e) {
        await fail(e);
      }
    },

    addInbox: async (text) => {
      const t = text.trim();
      if (!t) return;
      try {
        const { item } = await api<{ item: InboxDto }>("/inbox", {
          method: "POST",
          body: JSON.stringify({ text: t }),
        });
        set((s) => ({ inbox: [item, ...s.inbox] }));
      } catch (e) {
        await fail(e);
      }
    },

    processInbox: async (id, input) => {
      set((s) => ({ inbox: s.inbox.filter((i) => i.id !== id) }));
      try {
        const { todo } = await api<{ item: InboxDto; todo: TodoDto }>(`/inbox/${id}/process`, {
          method: "POST",
          body: JSON.stringify(input),
        });
        set((s) => ({ todos: [todo, ...s.todos] }));
      } catch (e) {
        await fail(e);
      }
    },

    dismissInbox: async (id) => {
      set((s) => ({ inbox: s.inbox.filter((i) => i.id !== id) }));
      try {
        await api(`/inbox/${id}`, { method: "PATCH", body: JSON.stringify({ processed: true }) });
      } catch (e) {
        await fail(e);
      }
    },

    removeInbox: async (id) => {
      set((s) => ({ inbox: s.inbox.filter((i) => i.id !== id) }));
      try {
        await api(`/inbox/${id}`, { method: "DELETE" });
      } catch (e) {
        await fail(e);
      }
    },

    reset: () => set({ todos: [], inbox: [], plan: null, loaded: false, error: null }),
  };
});

// ─── Helfer für die Oberfläche ──────────────────────────────

export function areaByKey(areas: AreaDto[], key: string | null): AreaDto | undefined {
  return key ? areas.find((a) => a.key === key) : undefined;
}

export const isOpen = (t: TodoDto) => t.status === "offen";
