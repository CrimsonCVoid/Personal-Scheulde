@@ .. @@
import { GraduationCap } from 'lucide-react';
 import { useEventsStore } from '@/features/events/store';
 import { useTasksStore } from '@/features/tasks/store';
+import { useSettingsStore } from '@/features/settings/store';
+import { getCanvasImportStats } from '@/lib/canvasDataProcessor';
 import { formatTime, formatDate } from '@/lib/time';