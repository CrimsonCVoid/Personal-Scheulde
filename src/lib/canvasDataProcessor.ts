import { toast } from 'sonner';
import { formatISO, parseISO, addDays, startOfDay, endOfDay } from 'date-fns';
import { useSettingsStore } from '@/features/settings/store';
import { useEventsStore } from '@/features/events/store';
import {
  getCanvasCourses,
  getCourseAssignments,
  getPlannerItems,
  getCalendarEvents,
  getCurrentUser,
  CanvasApiError,
} from '@/lib/canvasApi';
import { Event } from '@/features/events/types';
import { EVENT_COLORS } from '@/features/events/utils';

interface CanvasAssignment {
  id: number;
  name: string;
  description?: string;
  due_at?: string;
  unlock_at?: string;
  lock_at?: string;
  points_possible?: number;
  course_id: number;
  submission_types?: string[];
  workflow_state: string;
  assignment_group_id?: number;
  group_weight?: number;
  omit_from_final_grade?: boolean;
  all_dates?: Array<{
    due_at?: string;
    unlock_at?: string;
    lock_at?: string;
    title?: string;
  }>;
}

interface CanvasCourse {
  id: number;
  name: string;
  course_code?: string;
  workflow_state: string;
  start_at?: string;
  end_at?: string;
}

interface ImportStats {
  coursesProcessed: number;
  assignmentsImported: number;
  weightedAssignments: number;
  eventsImported: number;
  errors: string[];
}

/**
 * Imports comprehensive data from Canvas LMS including weighted assignments and course modules
 */
export async function importCanvasData(): Promise<ImportStats> {
  const { canvasDomain, canvasAccessToken, setCanvasUser } = useSettingsStore.getState();
  const { addOrUpdateEvent } = useEventsStore.getState();

  if (!canvasDomain || !canvasAccessToken) {
    toast.error('Canvas is not connected. Please connect your Canvas account first.');
    throw new Error('Canvas not connected');
  }

  const stats: ImportStats = {
    coursesProcessed: 0,
    assignmentsImported: 0,
    weightedAssignments: 0,
    eventsImported: 0,
    errors: []
  };

  const toastId = 'canvas-import';
  toast.loading('Connecting to Canvas LMS...', { id: toastId });

  try {
    // Step 1: Verify connection and get current user
    toast.loading('Verifying Canvas connection...', { id: toastId });
    const currentUser = await getCurrentUser();
    setCanvasUser(currentUser);

    // Step 2: Fetch all active courses
    toast.loading('Fetching your courses...', { id: toastId });
    const courses: CanvasCourse[] = await getCanvasCourses();
    const activeCourses = courses.filter(course => 
      course.workflow_state === 'available' || course.workflow_state === 'published'
    );

    stats.coursesProcessed = activeCourses.length;

    // Step 3: Process each course for assignments and modules
    for (let i = 0; i < activeCourses.length; i++) {
      const course = activeCourses[i];
      
      toast.loading(
        `Processing course ${i + 1}/${activeCourses.length}: ${course.name}...`, 
        { id: toastId }
      );

      try {
        // Fetch assignments for this course
        const assignments: CanvasAssignment[] = await getCourseAssignments(course.id.toString());
        
        for (const assignment of assignments) {
          try {
            const processedEvent = await processCanvasAssignment(assignment, course);
            if (processedEvent) {
              addOrUpdateEvent(processedEvent);
              stats.assignmentsImported++;
              
              if (processedEvent.isWeighted) {
                stats.weightedAssignments++;
              }
            }
          } catch (assignmentError) {
            console.warn(`Failed to process assignment ${assignment.id}:`, assignmentError);
            stats.errors.push(`Assignment "${assignment.name}": ${assignmentError.message}`);
          }
        }

      } catch (courseError) {
        console.warn(`Failed to process course ${course.id}:`, courseError);
        stats.errors.push(`Course "${course.name}": ${courseError.message}`);
      }
    }

    // Step 4: Fetch calendar events for additional context
    toast.loading('Importing calendar events...', { id: toastId });
    try {
      const today = new Date();
      const startDate = formatISO(startOfDay(addDays(today, -30))); // 30 days ago
      const endDate = formatISO(endOfDay(addDays(today, 365))); // 1 year ahead
      
      const courseContextCodes = activeCourses.map(course => `course_${course.id}`);
      const calendarEvents = await getCalendarEvents(startDate, endDate, courseContextCodes);
      
      for (const calEvent of calendarEvents) {
        try {
          const processedEvent = await processCanvasCalendarEvent(calEvent, activeCourses);
          if (processedEvent) {
            addOrUpdateEvent(processedEvent);
            stats.eventsImported++;
          }
        } catch (eventError) {
          console.warn(`Failed to process calendar event ${calEvent.id}:`, eventError);
          stats.errors.push(`Calendar event "${calEvent.title}": ${eventError.message}`);
        }
      }
    } catch (calendarError) {
      console.warn('Failed to fetch calendar events:', calendarError);
      stats.errors.push(`Calendar events: ${calendarError.message}`);
    }

    // Success notification
    const successMessage = `Successfully imported ${stats.assignmentsImported} assignments (${stats.weightedAssignments} weighted) and ${stats.eventsImported} events from ${stats.coursesProcessed} courses`;
    toast.success(successMessage, { id: toastId });

    if (stats.errors.length > 0) {
      toast.warning(`Import completed with ${stats.errors.length} warnings. Check console for details.`, {
        duration: 5000
      });
      console.warn('Canvas import warnings:', stats.errors);
    }

    return stats;

  } catch (error) {
    console.error('Canvas data import failed:', error);
    
    let errorMessage = 'Failed to import Canvas data';
    if (error instanceof CanvasApiError) {
      errorMessage = error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    toast.error(errorMessage, { id: toastId });
    throw error;
  }
}

/**
 * Processes a Canvas assignment into an Event object
 */
async function processCanvasAssignment(assignment: CanvasAssignment, course: CanvasCourse): Promise<Event | null> {
  // Skip assignments without due dates
  if (!assignment.due_at) {
    return null;
  }

  // Skip unpublished assignments
  if (assignment.workflow_state !== 'published') {
    return null;
  }

  // Determine if assignment is weighted (affects final grade)
  const isWeighted = !assignment.omit_from_final_grade && (assignment.points_possible || 0) > 0;
  const weight = assignment.group_weight || 0;

  // Choose color based on weight and type
  let colorIndex = 0; // Default blue
  if (isWeighted) {
    if (weight >= 30) colorIndex = 1; // Red for high weight
    else if (weight >= 15) colorIndex = 4; // Orange for medium weight
    else colorIndex = 2; // Green for low weight
  } else {
    colorIndex = 7; // Yellow for non-weighted
  }

  // Handle multiple due dates (section overrides)
  const dueDates = assignment.all_dates || [{ due_at: assignment.due_at }];
  const primaryDueDate = dueDates[0];

  if (!primaryDueDate.due_at) {
    return null;
  }

  const dueDate = parseISO(primaryDueDate.due_at);
  
  // Create event object
  const event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'> = {
    title: assignment.name,
    description: assignment.description ? 
      `${assignment.description}\n\nCourse: ${course.name}` : 
      `Canvas Assignment from ${course.name}`,
    start: formatISO(dueDate),
    end: formatISO(dueDate), // Assignments typically don't have duration
    allDay: false,
    color: EVENT_COLORS[colorIndex].name.toLowerCase(),
    location: `${course.name} (${course.course_code || 'Canvas'})`,
    canvasId: `assignment_${assignment.id}`,
    canvasCourseId: course.id.toString(),
    canvasType: 'assignment',
    weight: weight,
    isWeighted: isWeighted,
    pointsPossible: assignment.points_possible || 0,
    submissionTypes: assignment.submission_types || [],
    reminders: isWeighted ? [
      { minutesBefore: 1440 }, // 1 day before for weighted assignments
      { minutesBefore: 60 }    // 1 hour before
    ] : [
      { minutesBefore: 60 }    // 1 hour before for non-weighted
    ],
  };

  return event;
}

/**
 * Processes a Canvas calendar event into an Event object
 */
async function processCanvasCalendarEvent(calEvent: any, courses: CanvasCourse[]): Promise<Event | null> {
  if (!calEvent.start_at || !calEvent.end_at) {
    return null;
  }

  const course = courses.find(c => c.id === calEvent.context_id);
  const courseName = course?.name || 'Canvas';

  // Skip if this is an assignment (already processed above)
  if (calEvent.assignment && calEvent.assignment.id) {
    return null;
  }

  const event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'> = {
    title: calEvent.title,
    description: calEvent.description || `Canvas event from ${courseName}`,
    start: formatISO(parseISO(calEvent.start_at)),
    end: formatISO(parseISO(calEvent.end_at)),
    allDay: calEvent.all_day || false,
    color: EVENT_COLORS[5].name.toLowerCase(), // Pink for calendar events
    location: calEvent.location_name || courseName,
    canvasId: `event_${calEvent.id}`,
    canvasCourseId: calEvent.context_id?.toString(),
    canvasType: 'event',
    isWeighted: false, // Calendar events typically don't affect grades
    reminders: [{ minutesBefore: 30 }],
  };

  return event;
}

/**
 * Gets import statistics for display
 */
export function getCanvasImportStats(): {
  totalCanvasEvents: number;
  weightedAssignments: number;
  courseCount: number;
  lastImportDate?: string;
} {
  const { events } = useEventsStore.getState();
  const canvasEvents = events.filter(event => event.canvasId);
  const weightedEvents = canvasEvents.filter(event => event.isWeighted);
  const courses = new Set(canvasEvents.map(event => event.canvasCourseId).filter(Boolean));

  return {
    totalCanvasEvents: canvasEvents.length,
    weightedAssignments: weightedEvents.length,
    courseCount: courses.size,
    lastImportDate: canvasEvents.length > 0 ? 
      Math.max(...canvasEvents.map(e => new Date(e.updatedAt).getTime())).toString() : 
      undefined
  };
}