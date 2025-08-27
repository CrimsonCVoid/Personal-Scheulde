import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task } from '../events/types';
import { formatISO, parseISO, isToday, isPast, isFuture } from 'date-fns';

interface TasksState {
  tasks: Task[];
  isLoading: boolean;
  
  // Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  
  // Selectors
  getTaskById: (id: string) => Task | undefined;
  getTodayTasks: () => Task[];
  getOverdueTasks: () => Task[];
  getUpcomingTasks: () => Task[];
  getCompletedTasks: () => Task[];
  searchTasks: (query: string) => Task[];
}

export const useTasksStore = create<TasksState>()(
  persist(
    (set, get) => ({
      tasks: [],
      isLoading: false,

      addTask: (taskData) => {
        const now = formatISO(new Date());
        const task: Task = {
          ...taskData,
          id: crypto.randomUUID(),
          createdAt: now,
          updatedAt: now,
        };
        
        set((state) => ({
          tasks: [...state.tasks, task],
        }));
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, ...updates, updatedAt: formatISO(new Date()) }
              : task
          ),
        }));
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
      },

      toggleTask: (id) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, completed: !task.completed, updatedAt: formatISO(new Date()) }
              : task
          ),
        }));
      },

      getTaskById: (id) => {
        return get().tasks.find((task) => task.id === id);
      },

      getTodayTasks: () => {
        const now = new Date();
        return get().tasks.filter((task) => {
          if (!task.due || task.completed) return false;
          return isToday(parseISO(task.due));
        });
      },

      getOverdueTasks: () => {
        const now = new Date();
        return get().tasks.filter((task) => {
          if (!task.due || task.completed) return false;
          return isPast(parseISO(task.due)) && !isToday(parseISO(task.due));
        });
      },

      getUpcomingTasks: () => {
        const now = new Date();
        return get().tasks.filter((task) => {
          if (!task.due || task.completed) return false;
          return isFuture(parseISO(task.due));
        });
      },

      getCompletedTasks: () => {
        return get().tasks.filter((task) => task.completed);
      },

      searchTasks: (query) => {
        const q = query.toLowerCase();
        return get().tasks.filter((task) =>
          task.title.toLowerCase().includes(q) ||
          task.notes?.toLowerCase().includes(q)
        );
      },
    }),
    {
      name: 'tasks-storage',
    }
  )
);