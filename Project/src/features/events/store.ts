import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Event, CalendarView } from './types';
import { formatISO, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

interface EventsState {
  events: Event[];
  view: CalendarView;
  selectedDate: string;
  isLoading: boolean;
  
  // Actions
  addEvent: (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEvent: (id: string, updates: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  setView: (view: CalendarView) => void;
  setSelectedDate: (date: string) => void;
  
  // Selectors
  getEventById: (id: string) => Event | undefined;
  getEventsByDate: (date: string) => Event[];
  getEventsInRange: (start: string, end: string) => Event[];
  getUpcomingEvents: (limit?: number) => Event[];
  searchEvents: (query: string) => Event[];
}

export const useEventsStore = create<EventsState>()(
  persist(
    (set, get) => ({
      events: [],
      view: 'week',
      selectedDate: formatISO(new Date()),
      isLoading: false,

      addEvent: (eventData) => {
        const now = formatISO(new Date());
        const event: Event = {
          ...eventData,
          id: crypto.randomUUID(),
          createdAt: now,
          updatedAt: now,
        };
        
        set((state) => ({
          events: [...state.events, event],
        }));
      },

      updateEvent: (id, updates) => {
        set((state) => ({
          events: state.events.map((event) =>
            event.id === id
              ? { ...event, ...updates, updatedAt: formatISO(new Date()) }
              : event
          ),
        }));
      },

      deleteEvent: (id) => {
        set((state) => ({
          events: state.events.filter((event) => event.id !== id),
        }));
      },

      setView: (view) => set({ view }),
      
      setSelectedDate: (date) => set({ selectedDate: date }),

      getEventById: (id) => {
        return get().events.find((event) => event.id === id);
      },

      getEventsByDate: (date) => {
        const targetDate = parseISO(date);
        const dayStart = startOfDay(targetDate);
        const dayEnd = endOfDay(targetDate);
        
        return get().events.filter((event) => {
          const eventStart = parseISO(event.start);
          const eventEnd = parseISO(event.end);
          
          return isWithinInterval(eventStart, { start: dayStart, end: dayEnd }) ||
                 isWithinInterval(eventEnd, { start: dayStart, end: dayEnd }) ||
                 isWithinInterval(dayStart, { start: eventStart, end: eventEnd });
        });
      },

      getEventsInRange: (start, end) => {
        const rangeStart = parseISO(start);
        const rangeEnd = parseISO(end);
        
        return get().events.filter((event) => {
          const eventStart = parseISO(event.start);
          const eventEnd = parseISO(event.end);
          
          return isWithinInterval(eventStart, { start: rangeStart, end: rangeEnd }) ||
                 isWithinInterval(eventEnd, { start: rangeStart, end: rangeEnd }) ||
                 isWithinInterval(rangeStart, { start: eventStart, end: eventEnd });
        });
      },

      getUpcomingEvents: (limit = 5) => {
        const now = new Date();
        return get().events
          .filter((event) => parseISO(event.start) > now)
          .sort((a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime())
          .slice(0, limit);
      },

      searchEvents: (query) => {
        const q = query.toLowerCase();
        return get().events.filter((event) =>
          event.title.toLowerCase().includes(q) ||
          event.description?.toLowerCase().includes(q) ||
          event.location?.toLowerCase().includes(q)
        );
      },
    }),
    {
      name: 'events-storage',
    }
  )
);