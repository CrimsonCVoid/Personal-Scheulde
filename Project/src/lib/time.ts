import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  addMinutes, 
  differenceInMinutes,
  parseISO,
  formatISO,
  isWithinInterval,
  startOfDay,
  endOfDay,
  addDays,
  isToday,
  isSameDay,
  startOfMonth,
  endOfMonth,
  eachWeekOfInterval,
  getDay,
  setHours,
  setMinutes,
  roundToNearestMinutes
} from 'date-fns';

export const DEFAULT_SLOT_SIZE = 15; // minutes

export function formatTime(date: Date | string, format24h = false): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, format24h ? 'HH:mm' : 'h:mm a');
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy');
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d');
}

export function getWeekDays(date: Date = new Date()): Date[] {
  const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
}

export function getMonthWeeks(date: Date = new Date()): Date[][] {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  const weeks = eachWeekOfInterval({ start, end }, { weekStartsOn: 1 });
  
  return weeks.map(weekStart => getWeekDays(weekStart));
}

export function roundToSlot(date: Date, slotSize = DEFAULT_SLOT_SIZE): Date {
  return roundToNearestMinutes(date, { nearestTo: slotSize });
}

export function generateTimeSlots(startHour = 0, endHour = 24, slotSize = 60): string[] {
  const slots: string[] = [];
  const start = setMinutes(setHours(new Date(), startHour), 0);
  const totalMinutes = (endHour - startHour) * 60;
  
  for (let i = 0; i < totalMinutes; i += slotSize) {
    const time = addMinutes(start, i);
    slots.push(format(time, 'HH:mm'));
  }
  
  return slots;
}

export function getTimeSlotFromY(y: number, containerHeight: number, startHour = 0, endHour = 24): Date {
  const totalHours = endHour - startHour;
  const hourHeight = containerHeight / totalHours;
  const hours = (y / hourHeight) + startHour;
  const minutes = (hours % 1) * 60;
  
  const date = new Date();
  date.setHours(Math.floor(hours));
  date.setMinutes(Math.round(minutes / DEFAULT_SLOT_SIZE) * DEFAULT_SLOT_SIZE);
  date.setSeconds(0);
  date.setMilliseconds(0);
  
  return date;
}

export function getYFromTimeSlot(date: Date | string, containerHeight: number, startHour = 0, endHour = 24): number {
  const d = typeof date === 'string' ? parseISO(date) : date;
  const totalHours = endHour - startHour;
  const hourHeight = containerHeight / totalHours;
  const hours = d.getHours() + (d.getMinutes() / 60);
  
  return (hours - startHour) * hourHeight;
}

export function isEventInTimeRange(event: { start: string; end: string }, startTime: Date, endTime: Date): boolean {
  const eventStart = parseISO(event.start);
  const eventEnd = parseISO(event.end);
  
  return isWithinInterval(eventStart, { start: startTime, end: endTime }) ||
         isWithinInterval(eventEnd, { start: startTime, end: endTime }) ||
         isWithinInterval(startTime, { start: eventStart, end: eventEnd });
}

export function getDurationInMinutes(start: string, end: string): number {
  return differenceInMinutes(parseISO(end), parseISO(start));
}

export function addMinutesToDate(date: string, minutes: number): string {
  return formatISO(addMinutes(parseISO(date), minutes));
}

export function getCurrentTime(): Date {
  return new Date();
}

export function isCurrentTime(date: Date): boolean {
  const now = new Date();
  return Math.abs(differenceInMinutes(now, date)) < 1;
}

export function getTodayDateString(): string {
  return formatISO(startOfDay(new Date()));
}

export function isSameDayISO(date1: string, date2: string): boolean {
  return isSameDay(parseISO(date1), parseISO(date2));
}