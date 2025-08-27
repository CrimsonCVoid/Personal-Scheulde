export type RepeatRule = {
  freq: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  interval?: number;
  byWeekday?: number[];   // 0-6 (Sun-Sat)
  byMonthDay?: number[];  // 1-31
  count?: number;
  until?: string;         // ISO
  timezone?: string;      // IANA
};

export type Event = {
  id: string;
  title: string;
  description?: string;
  start: string;          // ISO (store UTC)
  end: string;            // ISO (store UTC)
  allDay?: boolean;
  color?: string;
  location?: string;
  attendees?: string[];
  repeat?: RepeatRule | null;
  reminders?: Array<{ minutesBefore: number }>;
  createdAt: string;
  updatedAt: string;
};

export type Task = {
  id: string;
  title: string;
  due?: string;           // ISO
  notes?: string;
  priority?: 'low' | 'med' | 'high';
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AvailabilitySlot = {
  day: number; // 0-6 (Sun-Sat)
  start: string; // HH:mm format
  end: string; // HH:mm format
};

export type Availability = {
  weekly: AvailabilitySlot[];
  exceptions: Array<{
    date: string; // ISO date
    available: boolean;
    slots?: AvailabilitySlot[];
  }>;
};

export type CalendarView = 'month' | 'week' | 'day';

export type Theme = {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  reducedMotion: boolean;
};