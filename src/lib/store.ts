"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Activity,
  Cycle,
  Goal,
  PacklistItem,
  ShoppingItem,
  Todo,
  UserId,
} from "./types";
import {
  SEED_ACTIVITIES,
  SEED_CYCLE,
  SEED_GOALS,
  SEED_SHOPPING,
  SEED_TODOS,
} from "./seed";

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

type State = {
  currentUser: UserId;
  activities: Activity[];
  shopping: ShoppingItem[];
  todos: Todo[];
  goals: Goal[];
  cycle: Cycle;

  setCurrentUser: (id: UserId) => void;

  // shopping
  addShopping: (input: Pick<ShoppingItem, "text" | "scope" | "spinnerei">) => void;
  toggleShopping: (id: string) => void;
  updateShopping: (id: string, patch: Partial<ShoppingItem>) => void;
  removeShopping: (id: string) => void;

  // todos
  addTodo: (input: Pick<Todo, "text" | "scope" | "prio" | "due"> & { tags?: string[]; note?: string }) => void;
  toggleTodo: (id: string) => void;
  updateTodo: (id: string, patch: Partial<Todo>) => void;
  removeTodo: (id: string) => void;

  // activities
  addActivity: (input: Omit<Activity, "id" | "by">) => void;
  updateActivity: (id: string, patch: Partial<Activity>) => void;
  removeActivity: (id: string) => void;

  // packlist (per activity)
  addPacklistItem: (activityId: string, text: string, scope: PacklistItem["scope"]) => void;
  togglePacklistItem: (activityId: string, itemId: string) => void;
  removePacklistItem: (activityId: string, itemId: string) => void;
  resetPacklist: (activityId: string) => void;

  // cycle
  setCycle: (cycle: Cycle) => void;
  updateCycle: (patch: Partial<Cycle>) => void;

  // goals
  addGoal: (input: Omit<Goal, "id" | "by" | "steps" | "current">) => void;
  updateGoal: (id: string, patch: Partial<Goal>) => void;
  removeGoal: (id: string) => void;
  addGoalStep: (goalId: string, text: string) => void;
  toggleGoalStep: (goalId: string, stepId: string) => void;
  removeGoalStep: (goalId: string, stepId: string) => void;
};

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      currentUser: "D",
      activities: SEED_ACTIVITIES,
      shopping: SEED_SHOPPING,
      todos: SEED_TODOS,
      goals: SEED_GOALS,
      cycle: SEED_CYCLE,

      setCurrentUser: (id) => set({ currentUser: id }),

      addShopping: ({ text, scope, spinnerei }) => {
        const t = text.trim();
        if (!t) return;
        const by = get().currentUser;
        set((s) => ({
          shopping: [
            {
              id: uid("s"),
              text: t,
              done: false,
              by,
              scope,
              spinnerei,
              qty: "",
              category: "lebensmittel",
              addedAt: Date.now(),
            },
            ...s.shopping,
          ],
        }));
      },
      toggleShopping: (id) =>
        set((s) => ({
          shopping: s.shopping.map((it) =>
            it.id === id ? { ...it, done: !it.done } : it,
          ),
        })),
      updateShopping: (id, patch) =>
        set((s) => ({
          shopping: s.shopping.map((it) => (it.id === id ? { ...it, ...patch } : it)),
        })),
      removeShopping: (id) =>
        set((s) => ({ shopping: s.shopping.filter((it) => it.id !== id) })),

      addTodo: ({ text, scope, prio, due, tags = [], note = "" }) => {
        const t = text.trim();
        if (!t) return;
        const by = get().currentUser;
        set((s) => ({
          todos: [
            {
              id: uid("t"),
              text: t,
              done: false,
              due,
              prio,
              by,
              scope,
              addedAt: Date.now(),
              note,
              tags,
            },
            ...s.todos,
          ],
        }));
      },
      toggleTodo: (id) =>
        set((s) => ({
          todos: s.todos.map((it) => (it.id === id ? { ...it, done: !it.done } : it)),
        })),
      updateTodo: (id, patch) =>
        set((s) => ({
          todos: s.todos.map((it) => (it.id === id ? { ...it, ...patch } : it)),
        })),
      removeTodo: (id) =>
        set((s) => ({ todos: s.todos.filter((it) => it.id !== id) })),

      addActivity: (input) => {
        const t = input.title.trim();
        if (!t) return;
        const by = get().currentUser;
        set((s) => ({
          activities: [{ ...input, title: t, by, id: uid("act") }, ...s.activities],
        }));
      },
      updateActivity: (id, patch) =>
        set((s) => ({
          activities: s.activities.map((it) => (it.id === id ? { ...it, ...patch } : it)),
        })),
      removeActivity: (id) =>
        set((s) => ({ activities: s.activities.filter((it) => it.id !== id) })),

      setCycle: (cycle) => set({ cycle }),
      updateCycle: (patch) => set((s) => ({ cycle: { ...s.cycle, ...patch } })),

      addPacklistItem: (activityId, text, scope) => {
        const t = text.trim();
        if (!t) return;
        const by = get().currentUser;
        set((s) => ({
          activities: s.activities.map((a) =>
            a.id === activityId
              ? {
                  ...a,
                  packlist: [
                    ...a.packlist,
                    { id: uid("pk"), text: t, packed: false, scope, by },
                  ],
                }
              : a,
          ),
        }));
      },
      togglePacklistItem: (activityId, itemId) =>
        set((s) => ({
          activities: s.activities.map((a) =>
            a.id === activityId
              ? {
                  ...a,
                  packlist: a.packlist.map((p) =>
                    p.id === itemId ? { ...p, packed: !p.packed } : p,
                  ),
                }
              : a,
          ),
        })),
      removePacklistItem: (activityId, itemId) =>
        set((s) => ({
          activities: s.activities.map((a) =>
            a.id === activityId
              ? { ...a, packlist: a.packlist.filter((p) => p.id !== itemId) }
              : a,
          ),
        })),
      resetPacklist: (activityId) =>
        set((s) => ({
          activities: s.activities.map((a) =>
            a.id === activityId
              ? { ...a, packlist: a.packlist.map((p) => ({ ...p, packed: false })) }
              : a,
          ),
        })),

      addGoal: (input) => {
        const t = input.title.trim();
        if (!t) return;
        const by = get().currentUser;
        set((s) => ({
          goals: [
            { ...input, title: t, by, id: uid("g"), current: 0, steps: [] },
            ...s.goals,
          ],
        }));
      },
      updateGoal: (id, patch) =>
        set((s) => ({
          goals: s.goals.map((it) => (it.id === id ? { ...it, ...patch } : it)),
        })),
      removeGoal: (id) =>
        set((s) => ({ goals: s.goals.filter((it) => it.id !== id) })),
      addGoalStep: (goalId, text) => {
        const t = text.trim();
        if (!t) return;
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === goalId
              ? { ...g, steps: [...g.steps, { id: uid("gs"), text: t, done: false }] }
              : g,
          ),
        }));
      },
      toggleGoalStep: (goalId, stepId) =>
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === goalId
              ? {
                  ...g,
                  steps: g.steps.map((st) =>
                    st.id === stepId ? { ...st, done: !st.done } : st,
                  ),
                }
              : g,
          ),
        })),
      removeGoalStep: (goalId, stepId) =>
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === goalId
              ? { ...g, steps: g.steps.filter((st) => st.id !== stepId) }
              : g,
          ),
        })),
    }),
    {
      name: "ambardaellen-store",
      version: 2,
      storage: createJSONStorage(() => localStorage),
      migrate: (persisted: unknown, version: number) => {
        // Bei Schema-Bumps Seeds neu laden (lokale Daten weg, aber besser als Crash).
        if (!persisted || version < 2) {
          return {
            currentUser: "D" as UserId,
            activities: SEED_ACTIVITIES,
            shopping: SEED_SHOPPING,
            todos: SEED_TODOS,
            goals: SEED_GOALS,
            cycle: SEED_CYCLE,
          };
        }
        return persisted as State;
      },
    },
  ),
);
