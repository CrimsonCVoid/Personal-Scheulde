import { Event } from './types';
import { parseISO, addDays, addWeeks, addMonths, addYears, isBefore, format } from 'date-fns';

export const EVENT_COLORS = [
  { name: 'Blue', value: '#3B82F6', bg: '#EFF6FF', text: '#1D4ED8' },
  { name: 'Red', value: '#EF4444', bg: '#FEF2F2', text: '#DC2626' },
  { name: 'Green', value: '#10B981', bg: '#F0FDF4', text: '#059669' },
  { name: 'Purple', value: '#8B5CF6', bg: '#FAF5FF', text: '#7C3AED' },
  { name: 'Orange', value: '#F97316', bg: '#FFF7ED', text: '#EA580C' },
  { name: 'Pink', value: '#EC4899', bg: '#FDF2F8', text: '#DB2777' },
  { name: 'Teal', value: '#14B8A6', bg: '#F0FDFA', text: '#0F766E' },
  { name: 'Yellow', value: '#EAB308', bg: '#FEFCE8', text: '#CA8A04' },
];

export function getEventColor(colorName: string) {
  return EVENT_COLORS.find(c => c.name.toLowerCase() === colorName?.toLowerCase()) || EVENT_COLORS[0];
}

export function expandRecurringEvents(event: Event, rangeStart: Date, rangeEnd: Date): Event[] {
  if (!event.repeat) return [event];
  
  const events: Event[] = [];
  const startDate = parseISO(event.start);
  let currentDate = startDate;
  let count = 0;
  const maxOccurrences = event.repeat.count || 100; // Fallback to prevent infinite loops
  
  while (isBefore(currentDate, rangeEnd) && count < maxOccurrences) {
    if (!isBefore(currentDate, rangeStart)) {
      const duration = parseISO(event.end).getTime() - parseISO(event.start).getTime();
      const endDate = new Date(currentDate.getTime() + duration);
      
      events.push({
        ...event,
        id: `${event.id}-${count}`,
        start: currentDate.toISOString(),
        end: endDate.toISOString(),
      });
    }
    
    // Calculate next occurrence
    switch (event.repeat.freq) {
      case 'DAILY':
        currentDate = addDays(currentDate, event.repeat.interval || 1);
        break;
      case 'WEEKLY':
        currentDate = addWeeks(currentDate, event.repeat.interval || 1);
        break;
      case 'MONTHLY':
        currentDate = addMonths(currentDate, event.repeat.interval || 1);
        break;
      case 'YEARLY':
        currentDate = addYears(currentDate, event.repeat.interval || 1);
        break;
    }
    
    count++;
    
    if (event.repeat.until && isBefore(parseISO(event.repeat.until), currentDate)) {
      break;
    }
  }
  
  return events;
}

export function calculateEventColumns(events: Event[]): Array<Event & { column: number; maxColumns: number }> {
  if (events.length === 0) return [];
  
  // Sort events by start time
  const sortedEvents = [...events].sort((a, b) => 
    parseISO(a.start).getTime() - parseISO(b.start).getTime()
  );
  
  const columns: Array<Event & { column: number; maxColumns: number }> = [];
  const activeColumns: Array<{ endTime: number; events: Event[] }> = [];
  
  sortedEvents.forEach(event => {
    const startTime = parseISO(event.start).getTime();
    const endTime = parseISO(event.end).getTime();
    
    // Remove expired columns
    for (let i = activeColumns.length - 1; i >= 0; i--) {
      if (activeColumns[i].endTime <= startTime) {
        activeColumns.splice(i, 1);
      }
    }
    
    // Find available column
    let columnIndex = 0;
    for (let i = 0; i < activeColumns.length; i++) {
      if (activeColumns[i].endTime <= startTime) {
        columnIndex = i;
        break;
      }
      columnIndex = i + 1;
    }
    
    // Add to column or create new one
    if (columnIndex < activeColumns.length) {
      activeColumns[columnIndex] = { endTime, events: [...activeColumns[columnIndex].events, event] };
    } else {
      activeColumns.push({ endTime, events: [event] });
    }
    
    columns.push({
      ...event,
      column: columnIndex,
      maxColumns: Math.max(activeColumns.length, 1),
    });
  });
  
  return columns;
}

export function detectEventConflicts(newEvent: Event, existingEvents: Event[]): Event[] {
  const newStart = parseISO(newEvent.start).getTime();
  const newEnd = parseISO(newEvent.end).getTime();
  
  return existingEvents.filter(event => {
    if (event.id === newEvent.id) return false;
    
    const eventStart = parseISO(event.start).getTime();
    const eventEnd = parseISO(event.end).getTime();
    
    // Check for overlap
    return (newStart < eventEnd && newEnd > eventStart);
  });
}

export function formatEventTime(event: Event, format24h = false): string {
  if (event.allDay) return 'All day';
  
  const start = parseISO(event.start);
  const end = parseISO(event.end);
  const timeFormat = format24h ? 'HH:mm' : 'h:mm a';
  
  return `${format(start, timeFormat)} - ${format(end, timeFormat)}`;
}

export function getEventDuration(event: Event): string {
  if (event.allDay) return 'All day';
  
  const start = parseISO(event.start);
  const end = parseISO(event.end);
  const minutes = Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
  
  if (minutes < 60) return `${minutes}m`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
}