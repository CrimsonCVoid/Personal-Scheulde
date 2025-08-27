import { formatISO, addDays, addHours, startOfDay, setHours, setMinutes } from 'date-fns';
import { useEventsStore } from '@/features/events/store';
import { useTasksStore } from '@/features/tasks/store';

export function seedDatabase() {
  const { addEvent } = useEventsStore.getState();
  const { addTask } = useTasksStore.getState();
  
  // Check if already seeded
  if (useEventsStore.getState().events.length > 0) return;

  const now = new Date();
  const today = startOfDay(now);
  
  // Seed Events
  const events = [
    {
      title: 'Team Standup',
      description: 'Daily team sync meeting',
      start: formatISO(setMinutes(setHours(today, 9), 0)),
      end: formatISO(setMinutes(setHours(today, 9), 30)),
      color: 'blue',
      repeat: { freq: 'DAILY' as const, byWeekday: [1, 2, 3, 4, 5] }, // Weekdays
      reminders: [{ minutesBefore: 10 }],
    },
    {
      title: 'Client Presentation',
      description: 'Quarterly review with Johnson & Associates',
      start: formatISO(setMinutes(setHours(addDays(today, 1), 14), 0)),
      end: formatISO(setMinutes(setHours(addDays(today, 1), 16), 0)),
      color: 'red',
      location: 'Conference Room A',
      attendees: ['john@company.com', 'sarah@company.com'],
      reminders: [{ minutesBefore: 30 }, { minutesBefore: 10 }],
    },
    {
      title: 'Lunch Break',
      start: formatISO(setMinutes(setHours(today, 12), 0)),
      end: formatISO(setMinutes(setHours(today, 13), 0)),
      color: 'green',
      repeat: { freq: 'DAILY' as const, byWeekday: [1, 2, 3, 4, 5] },
    },
    {
      title: 'Gym Session',
      description: 'Cardio and strength training',
      start: formatISO(setMinutes(setHours(addDays(today, 2), 18), 0)),
      end: formatISO(setMinutes(setHours(addDays(today, 2), 19), 30)),
      color: 'orange',
      location: 'Fitness Center',
      repeat: { freq: 'WEEKLY' as const, byWeekday: [1, 3, 5] }, // Mon, Wed, Fri
    },
    {
      title: 'Project Review',
      description: 'Monthly project status review',
      start: formatISO(setMinutes(setHours(addDays(today, 7), 10), 0)),
      end: formatISO(setMinutes(setHours(addDays(today, 7), 11), 30)),
      color: 'purple',
      repeat: { freq: 'MONTHLY' as const },
      reminders: [{ minutesBefore: 60 }],
    },
    {
      title: 'Coffee with Alex',
      start: formatISO(setMinutes(setHours(addDays(today, 3), 15), 0)),
      end: formatISO(setMinutes(setHours(addDays(today, 3), 16), 0)),
      color: 'teal',
      location: 'Blue Bottle Coffee',
    },
    {
      title: 'Flight to Seattle',
      description: 'AA1234 - Business trip',
      start: formatISO(setMinutes(setHours(addDays(today, 10), 8), 0)),
      end: formatISO(setMinutes(setHours(addDays(today, 10), 12), 30)),
      color: 'blue',
      location: 'Airport',
      reminders: [{ minutesBefore: 120 }],
    },
    {
      title: 'Weekend Getaway',
      allDay: true,
      start: formatISO(startOfDay(addDays(today, 5))),
      end: formatISO(startOfDay(addDays(today, 7))),
      color: 'pink',
      location: 'Napa Valley',
    }
  ];
  
  events.forEach(event => addEvent(event));
  
  // Seed Tasks
  const tasks = [
    {
      title: 'Review quarterly reports',
      due: formatISO(addDays(today, 1)),
      priority: 'high' as const,
      notes: 'Focus on revenue metrics and client satisfaction scores',
    },
    {
      title: 'Update project documentation',
      due: formatISO(addDays(today, 3)),
      priority: 'med' as const,
      notes: 'Include new API endpoints and authentication flow',
    },
    {
      title: 'Book dentist appointment',
      priority: 'low' as const,
      notes: 'Regular checkup - overdue',
    },
    {
      title: 'Prepare presentation slides',
      due: formatISO(addDays(today, 1)),
      priority: 'high' as const,
      notes: 'For client presentation tomorrow',
    },
    {
      title: 'Call Mom',
      due: formatISO(today),
      priority: 'med' as const,
    },
    {
      title: 'Grocery shopping',
      due: formatISO(addDays(today, 2)),
      priority: 'low' as const,
      notes: 'Milk, bread, vegetables, coffee',
    },
    {
      title: 'Submit expense report',
      due: formatISO(addDays(today, 5)),
      priority: 'med' as const,
      completed: false,
    }
  ];
  
  tasks.forEach(task => addTask(task));
}