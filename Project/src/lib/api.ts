// Mock API layer with realistic latency
import { Event, Task, Availability } from '@/features/events/types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class MockAPI {
  static async getEvents(): Promise<Event[]> {
    await delay(200);
    // Return events from localStorage or empty array
    const stored = localStorage.getItem('events-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.state?.events || [];
    }
    return [];
  }

  static async createEvent(event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event> {
    await delay(150);
    const now = new Date().toISOString();
    return {
      ...event,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
  }

  static async updateEvent(id: string, updates: Partial<Event>): Promise<Event> {
    await delay(100);
    const events = await this.getEvents();
    const event = events.find(e => e.id === id);
    if (!event) throw new Error('Event not found');
    
    return {
      ...event,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
  }

  static async deleteEvent(id: string): Promise<void> {
    await delay(100);
    // Implementation would be handled by the store
  }

  static async getTasks(): Promise<Task[]> {
    await delay(180);
    const stored = localStorage.getItem('tasks-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.state?.tasks || [];
    }
    return [];
  }

  static async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    await delay(120);
    const now = new Date().toISOString();
    return {
      ...task,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
  }

  static async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    await delay(100);
    const tasks = await this.getTasks();
    const task = tasks.find(t => t.id === id);
    if (!task) throw new Error('Task not found');
    
    return {
      ...task,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
  }

  static async deleteTask(id: string): Promise<void> {
    await delay(100);
    // Implementation would be handled by the store
  }

  static async getAvailability(): Promise<Availability> {
    await delay(150);
    const stored = localStorage.getItem('availability-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.state?.availability || { weekly: [], exceptions: [] };
    }
    return { weekly: [], exceptions: [] };
  }

  static async updateAvailability(availability: Availability): Promise<Availability> {
    await delay(120);
    return availability;
  }
}