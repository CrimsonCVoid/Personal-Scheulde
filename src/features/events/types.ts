@@ .. @@
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
+  // Canvas LMS Integration
+  canvasId?: string;      // Canvas assignment/event ID
+  canvasCourseId?: string; // Canvas course ID
+  canvasType?: 'assignment' | 'quiz' | 'discussion' | 'event';
+  weight?: number;        // Assignment weight percentage
+  isWeighted?: boolean;   // Whether this item affects final grade
+  pointsPossible?: number; // Total points for assignment
+  submissionTypes?: string[]; // Types of submissions allowed
   createdAt: string;
   updatedAt: string;
 };