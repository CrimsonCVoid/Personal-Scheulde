// Actions
addEvent: (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => void;
addOrUpdateEvent: (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => void;
updateEvent: (id: string, updates: Partial<Event>) => void;
deleteEvent: (id: string) => void;
setView: (view: CalendarView) => void;
setSelectedDate: (date: string) => void;

// Selectors
getEventById: (id: string) => Event | undefined;
getEventByCanvasId: (canvasId: string) => Event | undefined;
getEventsByDate: (date: string) => Event[];
getEventsInRange: (start: string, end: string) => Event[];
getUpcomingEvents: (limit?: number) => Event[];
getWeightedEvents: () => Event[];
getEventsByCourse: (canvasCourseId: string) => Event[];
searchEvents: (query: string) => Event[];

      getEventById: (id) => {
        return get().events.find((event) => event.id === id);
      },

      getEventByCanvasId: (canvasId) => {
        return get().events.find((event) => event.canvasId === canvasId);
      },

      getWeightedEvents: () => {
        return get().events.filter((event) => event.isWeighted);
      },

      getEventsByCourse: (canvasCourseId) => {
        return get().events.filter((event) => event.canvasCourseId === canvasCourseId);
      },