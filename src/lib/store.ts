"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Activity,
  Cycle,
  Goal,
  PacklistItem,
  PacklistTemplate,
  PacklistTemplateItem,
  Scope,
  ShoppingItem,
  Todo,
  TripSegment,
  UserId,
} from "./types";
import {
  SEED_ACTIVITIES,
  SEED_CYCLE,
  SEED_GOALS,
  SEED_PACKLIST_TEMPLATES,
  SEED_SHOPPING,
  SEED_TODOS,
} from "./seed";

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export type AuthAccount = {
  id: string;
  email: string;
  userId: UserId;
  workspaceId: string;
};

export type CloudStatus = "idle" | "loading" | "syncing" | "error" | "offline";

type AppData = {
  activities: Activity[];
  shopping: ShoppingItem[];
  todos: Todo[];
  goals: Goal[];
  cycle: Cycle;
  packlistTemplates: PacklistTemplate[];
};

type State = AppData & {
  currentUser: UserId;

  // Cloud-Auth
  account: AuthAccount | null;
  /** True wenn der initiale Cloud-Pull beim App-Start abgeschlossen ist. */
  authReady: boolean;
  cloudVersion: number;
  cloudStatus: CloudStatus;
  cloudError: string | null;
  /** Lokal verändert, noch nicht zur Cloud gepusht? */
  pendingPush: boolean;

  /** Transient: Anzahl offener Sheets. Nicht persistiert. */
  sheetOpen: number;

  // System
  incSheetOpen: () => void;
  decSheetOpen: () => void;
  setCurrentUser: (id: UserId) => void;

  // Auth (API-basiert)
  register: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  login: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<{ ok: true } | { ok: false; error: string }>;

  // Cloud-Sync
  setAccount: (a: AuthAccount | null) => void;
  setAuthReady: (v: boolean) => void;
  applyCloudData: (data: Partial<AppData>, version: number) => void;
  setCloudStatus: (s: CloudStatus, err?: string | null) => void;
  setCloudVersion: (v: number) => void;
  markPushed: () => void;
  exportAppData: () => AppData;

  // shopping
  addShopping: (input: Pick<ShoppingItem, "text" | "scope" | "spinnerei">) => void;
  toggleShopping: (id: string) => void;
  updateShopping: (id: string, patch: Partial<ShoppingItem>) => void;
  removeShopping: (id: string) => void;

  // todos
  addTodo: (
    input: Pick<Todo, "text" | "scope" | "prio" | "due"> & { tags?: string[]; note?: string },
  ) => void;
  toggleTodo: (id: string) => void;
  updateTodo: (id: string, patch: Partial<Todo>) => void;
  removeTodo: (id: string) => void;

  // activities
  addActivity: (input: Omit<Activity, "id" | "by">) => void;
  updateActivity: (id: string, patch: Partial<Activity>) => void;
  removeActivity: (id: string) => void;

  // packlist
  addPacklistItem: (activityId: string, text: string, scope: Scope, category: string) => void;
  updatePacklistItem: (activityId: string, itemId: string, patch: Partial<PacklistItem>) => void;
  togglePacklistItem: (activityId: string, itemId: string) => void;
  removePacklistItem: (activityId: string, itemId: string) => void;
  movePacklistItem: (activityId: string, itemId: string, direction: "up" | "down") => void;
  resetPacklist: (activityId: string) => void;
  applyPacklistTemplate: (activityId: string, templateId: string) => void;

  // trip segments
  addSegment: (activityId: string, seg: Omit<TripSegment, "id">) => void;
  updateSegment: (activityId: string, segmentId: string, patch: Partial<TripSegment>) => void;
  removeSegment: (activityId: string, segmentId: string) => void;

  // pre-trip
  addPreTripItem: (activityId: string, text: string, scope: Scope) => void;
  togglePreTripItem: (activityId: string, itemId: string) => void;
  removePreTripItem: (activityId: string, itemId: string) => void;
  pushPreTripToShopping: (activityId: string, itemId: string) => void;

  // templates
  addPacklistTemplate: (name: string) => string;
  updatePacklistTemplate: (id: string, patch: Partial<PacklistTemplate>) => void;
  removePacklistTemplate: (id: string) => void;
  addTemplateItem: (templateId: string, text: string, scope: Scope, category: string) => void;
  updateTemplateItem: (templateId: string, itemId: string, patch: Partial<PacklistTemplateItem>) => void;
  removeTemplateItem: (templateId: string, itemId: string) => void;

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

const EMPTY_APP_DATA: AppData = {
  activities: SEED_ACTIVITIES,
  shopping: SEED_SHOPPING,
  todos: SEED_TODOS,
  goals: SEED_GOALS,
  cycle: SEED_CYCLE,
  packlistTemplates: SEED_PACKLIST_TEMPLATES,
};

/**
 * Markiert eine Mutation, die in die Cloud gepusht werden soll. Setzt
 * `pendingPush: true`. Der Sync-Layer in CloudSyncProvider beobachtet
 * dieses Flag und schickt debounced an /api/sync.
 */
function markDirty(): { pendingPush: true } {
  return { pendingPush: true };
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...EMPTY_APP_DATA,
      currentUser: "D",

      account: null,
      authReady: false,
      cloudVersion: 0,
      cloudStatus: "idle",
      cloudError: null,
      pendingPush: false,

      sheetOpen: 0,

      incSheetOpen: () => set((s) => ({ sheetOpen: s.sheetOpen + 1 })),
      decSheetOpen: () => set((s) => ({ sheetOpen: Math.max(0, s.sheetOpen - 1) })),

      setCurrentUser: (id) => set({ currentUser: id }),

      setAccount: (a) => set({ account: a }),
      setAuthReady: (v) => set({ authReady: v }),
      setCloudStatus: (s, err = null) => set({ cloudStatus: s, cloudError: err }),
      setCloudVersion: (v) => set({ cloudVersion: v }),
      markPushed: () => set({ pendingPush: false }),
      exportAppData: () => {
        const s = get();
        return {
          activities: s.activities,
          shopping: s.shopping,
          todos: s.todos,
          goals: s.goals,
          cycle: s.cycle,
          packlistTemplates: s.packlistTemplates,
        };
      },
      applyCloudData: (data, version) =>
        set({
          activities: data.activities ?? EMPTY_APP_DATA.activities,
          shopping: data.shopping ?? EMPTY_APP_DATA.shopping,
          todos: data.todos ?? EMPTY_APP_DATA.todos,
          goals: data.goals ?? EMPTY_APP_DATA.goals,
          cycle: data.cycle ?? EMPTY_APP_DATA.cycle,
          packlistTemplates: data.packlistTemplates ?? EMPTY_APP_DATA.packlistTemplates,
          cloudVersion: version,
          pendingPush: false,
        }),

      register: async (email, password) => {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          return { ok: false, error: body.error ?? `Fehler ${res.status}` };
        }
        const body = (await res.json()) as { account: AuthAccount };
        set({ account: body.account, currentUser: body.account.userId });
        return { ok: true };
      },

      login: async (email, password) => {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          return { ok: false, error: body.error ?? `Fehler ${res.status}` };
        }
        const body = (await res.json()) as { account: AuthAccount };
        set({ account: body.account, currentUser: body.account.userId });
        return { ok: true };
      },

      changePassword: async (oldPassword, newPassword) => {
        const res = await fetch("/api/auth/change-password", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ oldPassword, newPassword }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          return { ok: false, error: body.error ?? `Fehler ${res.status}` };
        }
        return { ok: true };
      },

      logout: async () => {
        try {
          await fetch("/api/auth/logout", { method: "POST" });
        } catch {
          // egal — Cookie wird auch vom Server abgeräumt sobald wieder online
        }
        set({
          account: null,
          cloudVersion: 0,
          cloudStatus: "idle",
          cloudError: null,
          pendingPush: false,
          ...EMPTY_APP_DATA,
        });
      },

      // ---------- shopping ----------
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
          ...markDirty(),
        }));
      },
      toggleShopping: (id) =>
        set((s) => ({
          shopping: s.shopping.map((it) => (it.id === id ? { ...it, done: !it.done } : it)),
          ...markDirty(),
        })),
      updateShopping: (id, patch) =>
        set((s) => ({
          shopping: s.shopping.map((it) => (it.id === id ? { ...it, ...patch } : it)),
          ...markDirty(),
        })),
      removeShopping: (id) =>
        set((s) => ({
          shopping: s.shopping.filter((it) => it.id !== id),
          ...markDirty(),
        })),

      // ---------- todos ----------
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
          ...markDirty(),
        }));
      },
      toggleTodo: (id) =>
        set((s) => ({
          todos: s.todos.map((it) => (it.id === id ? { ...it, done: !it.done } : it)),
          ...markDirty(),
        })),
      updateTodo: (id, patch) =>
        set((s) => ({
          todos: s.todos.map((it) => (it.id === id ? { ...it, ...patch } : it)),
          ...markDirty(),
        })),
      removeTodo: (id) =>
        set((s) => ({ todos: s.todos.filter((it) => it.id !== id), ...markDirty() })),

      // ---------- activities ----------
      addActivity: (input) => {
        const t = input.title.trim();
        if (!t) return;
        const by = get().currentUser;
        set((s) => ({
          activities: [{ ...input, title: t, by, id: uid("act") }, ...s.activities],
          ...markDirty(),
        }));
      },
      updateActivity: (id, patch) =>
        set((s) => ({
          activities: s.activities.map((it) => (it.id === id ? { ...it, ...patch } : it)),
          ...markDirty(),
        })),
      removeActivity: (id) =>
        set((s) => ({ activities: s.activities.filter((it) => it.id !== id), ...markDirty() })),

      // ---------- cycle ----------
      setCycle: (cycle) => set({ cycle, ...markDirty() }),
      updateCycle: (patch) =>
        set((s) => ({ cycle: { ...s.cycle, ...patch }, ...markDirty() })),

      // ---------- packlist ----------
      addPacklistItem: (activityId, text, scope, category) => {
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
                    {
                      id: uid("pk"),
                      text: t,
                      packed: false,
                      scope,
                      by,
                      category: category || "Sonstiges",
                    },
                  ],
                }
              : a,
          ),
          ...markDirty(),
        }));
      },
      updatePacklistItem: (activityId, itemId, patch) =>
        set((s) => ({
          activities: s.activities.map((a) =>
            a.id === activityId
              ? {
                  ...a,
                  packlist: a.packlist.map((p) =>
                    p.id === itemId ? { ...p, ...patch } : p,
                  ),
                }
              : a,
          ),
          ...markDirty(),
        })),
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
          ...markDirty(),
        })),
      removePacklistItem: (activityId, itemId) =>
        set((s) => ({
          activities: s.activities.map((a) =>
            a.id === activityId
              ? { ...a, packlist: a.packlist.filter((p) => p.id !== itemId) }
              : a,
          ),
          ...markDirty(),
        })),
      movePacklistItem: (activityId, itemId, direction) =>
        set((s) => ({
          activities: s.activities.map((a) => {
            if (a.id !== activityId) return a;
            const list = a.packlist;
            const idx = list.findIndex((p) => p.id === itemId);
            if (idx === -1) return a;
            const cat = list[idx].category;
            // Tausch-Partner suchen: nächster Nachbar in derselben Kategorie.
            let swap = -1;
            if (direction === "up") {
              for (let i = idx - 1; i >= 0; i--) {
                if (list[i].category === cat) { swap = i; break; }
              }
            } else {
              for (let i = idx + 1; i < list.length; i++) {
                if (list[i].category === cat) { swap = i; break; }
              }
            }
            if (swap === -1) return a;
            const next = list.slice();
            [next[idx], next[swap]] = [next[swap], next[idx]];
            return { ...a, packlist: next };
          }),
          ...markDirty(),
        })),
      resetPacklist: (activityId) =>
        set((s) => ({
          activities: s.activities.map((a) =>
            a.id === activityId
              ? { ...a, packlist: a.packlist.map((p) => ({ ...p, packed: false })) }
              : a,
          ),
          ...markDirty(),
        })),
      applyPacklistTemplate: (activityId, templateId) => {
        const tpl = get().packlistTemplates.find((t) => t.id === templateId);
        if (!tpl) return;
        const by = get().currentUser;
        set((s) => ({
          activities: s.activities.map((a) =>
            a.id === activityId
              ? {
                  ...a,
                  packlist: [
                    ...a.packlist,
                    ...tpl.items.map((it) => ({
                      id: uid("pk"),
                      text: it.text,
                      packed: false,
                      scope: it.scope,
                      by,
                      category: it.category || "Sonstiges",
                    })),
                  ],
                }
              : a,
          ),
          ...markDirty(),
        }));
      },

      // ---------- segments ----------
      addSegment: (activityId, seg) =>
        set((s) => ({
          activities: s.activities.map((a) =>
            a.id === activityId
              ? { ...a, segments: [...a.segments, { ...seg, id: uid("sg") }] }
              : a,
          ),
          ...markDirty(),
        })),
      updateSegment: (activityId, segmentId, patch) =>
        set((s) => ({
          activities: s.activities.map((a) =>
            a.id === activityId
              ? {
                  ...a,
                  segments: a.segments.map((g) =>
                    g.id === segmentId ? { ...g, ...patch } : g,
                  ),
                }
              : a,
          ),
          ...markDirty(),
        })),
      removeSegment: (activityId, segmentId) =>
        set((s) => ({
          activities: s.activities.map((a) =>
            a.id === activityId
              ? { ...a, segments: a.segments.filter((g) => g.id !== segmentId) }
              : a,
          ),
          ...markDirty(),
        })),

      // ---------- pre-trip ----------
      addPreTripItem: (activityId, text, scope) => {
        const t = text.trim();
        if (!t) return;
        const by = get().currentUser;
        set((s) => ({
          activities: s.activities.map((a) =>
            a.id === activityId
              ? {
                  ...a,
                  preTripShopping: [
                    ...a.preTripShopping,
                    { id: uid("pt"), text: t, done: false, scope, by },
                  ],
                }
              : a,
          ),
          ...markDirty(),
        }));
      },
      togglePreTripItem: (activityId, itemId) =>
        set((s) => ({
          activities: s.activities.map((a) =>
            a.id === activityId
              ? {
                  ...a,
                  preTripShopping: a.preTripShopping.map((p) =>
                    p.id === itemId ? { ...p, done: !p.done } : p,
                  ),
                }
              : a,
          ),
          ...markDirty(),
        })),
      removePreTripItem: (activityId, itemId) =>
        set((s) => ({
          activities: s.activities.map((a) =>
            a.id === activityId
              ? { ...a, preTripShopping: a.preTripShopping.filter((p) => p.id !== itemId) }
              : a,
          ),
          ...markDirty(),
        })),
      pushPreTripToShopping: (activityId, itemId) => {
        const activity = get().activities.find((a) => a.id === activityId);
        const item = activity?.preTripShopping.find((p) => p.id === itemId);
        if (!item || !activity) return;
        const by = get().currentUser;
        set((s) => ({
          shopping: [
            {
              id: uid("s"),
              text: `${item.text} (für ${activity.title})`,
              done: false,
              by,
              scope: item.scope,
              spinnerei: false,
              qty: "",
              category: "sonstiges",
              addedAt: Date.now(),
            },
            ...s.shopping,
          ],
          ...markDirty(),
        }));
      },

      // ---------- templates ----------
      addPacklistTemplate: (name) => {
        const t = name.trim();
        if (!t) return "";
        const by = get().currentUser;
        const id = uid("tpl");
        set((s) => ({
          packlistTemplates: [
            ...s.packlistTemplates,
            { id, name: t, by, scope: "geteilt", items: [] },
          ],
          ...markDirty(),
        }));
        return id;
      },
      updatePacklistTemplate: (id, patch) =>
        set((s) => ({
          packlistTemplates: s.packlistTemplates.map((t) =>
            t.id === id ? { ...t, ...patch } : t,
          ),
          ...markDirty(),
        })),
      removePacklistTemplate: (id) =>
        set((s) => ({
          packlistTemplates: s.packlistTemplates.filter((t) => t.id !== id),
          ...markDirty(),
        })),
      addTemplateItem: (templateId, text, scope, category) => {
        const t = text.trim();
        if (!t) return;
        set((s) => ({
          packlistTemplates: s.packlistTemplates.map((tpl) =>
            tpl.id === templateId
              ? {
                  ...tpl,
                  items: [
                    ...tpl.items,
                    { id: uid("ti"), text: t, scope, category: category || "Sonstiges" },
                  ],
                }
              : tpl,
          ),
          ...markDirty(),
        }));
      },
      updateTemplateItem: (templateId, itemId, patch) =>
        set((s) => ({
          packlistTemplates: s.packlistTemplates.map((tpl) =>
            tpl.id === templateId
              ? {
                  ...tpl,
                  items: tpl.items.map((it) => (it.id === itemId ? { ...it, ...patch } : it)),
                }
              : tpl,
          ),
          ...markDirty(),
        })),
      removeTemplateItem: (templateId, itemId) =>
        set((s) => ({
          packlistTemplates: s.packlistTemplates.map((tpl) =>
            tpl.id === templateId
              ? { ...tpl, items: tpl.items.filter((it) => it.id !== itemId) }
              : tpl,
          ),
          ...markDirty(),
        })),

      // ---------- goals ----------
      addGoal: (input) => {
        const t = input.title.trim();
        if (!t) return;
        const by = get().currentUser;
        set((s) => ({
          goals: [
            { ...input, title: t, by, id: uid("g"), current: 0, steps: [] },
            ...s.goals,
          ],
          ...markDirty(),
        }));
      },
      updateGoal: (id, patch) =>
        set((s) => ({
          goals: s.goals.map((it) => (it.id === id ? { ...it, ...patch } : it)),
          ...markDirty(),
        })),
      removeGoal: (id) =>
        set((s) => ({ goals: s.goals.filter((it) => it.id !== id), ...markDirty() })),
      addGoalStep: (goalId, text) => {
        const t = text.trim();
        if (!t) return;
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === goalId
              ? { ...g, steps: [...g.steps, { id: uid("gs"), text: t, done: false }] }
              : g,
          ),
          ...markDirty(),
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
          ...markDirty(),
        })),
      removeGoalStep: (goalId, stepId) =>
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === goalId
              ? { ...g, steps: g.steps.filter((st) => st.id !== stepId) }
              : g,
          ),
          ...markDirty(),
        })),
    }),
    {
      name: "ambardaellen-store",
      version: 7,
      storage: createJSONStorage(() => localStorage),
      // Auth + Transient + Sync-Status nicht persistieren — die kommen vom Server.
      partialize: (state) => ({
        currentUser: state.currentUser,
        activities: state.activities,
        shopping: state.shopping,
        todos: state.todos,
        goals: state.goals,
        cycle: state.cycle,
        packlistTemplates: state.packlistTemplates,
      }),
      migrate: (persisted: unknown, version: number) => {
        if (!persisted || version < 7) {
          const prev = (persisted as Partial<AppData & { currentUser: UserId }> | null) ?? null;
          return {
            currentUser: prev?.currentUser ?? ("D" as UserId),
            activities: prev?.activities ?? EMPTY_APP_DATA.activities,
            shopping: prev?.shopping ?? EMPTY_APP_DATA.shopping,
            todos: prev?.todos ?? EMPTY_APP_DATA.todos,
            goals: prev?.goals ?? EMPTY_APP_DATA.goals,
            cycle: prev?.cycle ?? EMPTY_APP_DATA.cycle,
            packlistTemplates: prev?.packlistTemplates ?? EMPTY_APP_DATA.packlistTemplates,
          };
        }
        return persisted;
      },
    },
  ),
);
