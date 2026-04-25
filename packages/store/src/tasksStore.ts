import type { Task } from "@pomotimer/core";
import { Store } from "@tanstack/store";

export interface TasksState {
  tasks: Task[];
  newTaskDraft: string;
}

export const initialTasksState: TasksState = {
  tasks: [
    {
      id: cryptoId(),
      text: "Draft Q4 product strategy doc",
      done: false,
      pomos: 2,
      est: 4,
      active: true,
      note: "Outline + competitive scan",
    },
    {
      id: cryptoId(),
      text: "Review design handoff for Pomotimer",
      done: false,
      pomos: 0,
      est: 2,
      active: false,
    },
    {
      id: cryptoId(),
      text: "Reply to design partner emails",
      done: true,
      pomos: 1,
      est: 1,
      active: false,
    },
  ],
  newTaskDraft: "",
};

function cryptoId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}

export function createTasksStore(initial?: Partial<TasksState>) {
  const store = new Store<TasksState>({ ...initialTasksState, ...initial });

  const setActive = (id: string) =>
    store.setState((s) => ({
      ...s,
      tasks: s.tasks.map((t) => ({ ...t, active: t.id === id })),
    }));

  const toggleDone = (id: string) =>
    store.setState((s) => ({
      ...s,
      tasks: s.tasks.map((t) =>
        t.id === id ? { ...t, done: !t.done } : t,
      ),
    }));

  const setEst = (id: string, delta: number) =>
    store.setState((s) => ({
      ...s,
      tasks: s.tasks.map((t) =>
        t.id === id ? { ...t, est: Math.max(1, t.est + delta) } : t,
      ),
    }));

  const incrementPomos = (id: string) =>
    store.setState((s) => ({
      ...s,
      tasks: s.tasks.map((t) =>
        t.id === id ? { ...t, pomos: t.pomos + 1 } : t,
      ),
    }));

  const remove = (id: string) =>
    store.setState((s) => ({
      ...s,
      tasks: s.tasks.filter((t) => t.id !== id),
    }));

  const setDraft = (text: string) =>
    store.setState((s) => ({ ...s, newTaskDraft: text }));

  const commitDraft = () =>
    store.setState((s) => {
      const text = s.newTaskDraft.trim();
      if (!text) return s;
      const next: Task = {
        id: cryptoId(),
        text,
        done: false,
        pomos: 0,
        est: 1,
        active: false,
      };
      return { ...s, tasks: [...s.tasks, next], newTaskDraft: "" };
    });

  return {
    store,
    setActive,
    toggleDone,
    setEst,
    incrementPomos,
    remove,
    setDraft,
    commitDraft,
  };
}

export type TasksStore = ReturnType<typeof createTasksStore>;

export function activeTask(state: TasksState): Task | undefined {
  return state.tasks.find((t) => t.active && !t.done);
}

export function remainingCount(state: TasksState): number {
  return state.tasks.filter((t) => !t.done).length;
}

export function totalEstimatedRemaining(state: TasksState): number {
  return state.tasks
    .filter((t) => !t.done)
    .reduce((sum, t) => sum + Math.max(0, t.est - t.pomos), 0);
}
