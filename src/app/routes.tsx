import CalendarPage from '@/pages/CalendarPage';
import TasksPage from '@/pages/TasksPage';
import SettingsPage from '@/pages/SettingsPage';
import CanvasModulesPage from '@/pages/CanvasModulesPage';
import CanvasOAuthCallback from '@/pages/CanvasOAuthCallback';
import CanvasModulesPage from '@/pages/CanvasModulesPage';
import CanvasOAuthCallback from '@/pages/CanvasOAuthCallback';
import CanvasModulesPage from '@/pages/CanvasModulesPage';
import CanvasOAuthCallback from '@/pages/CanvasOAuthCallback';
import AuthGate from '@/pages/AuthGate';

export const router = createBrowserRouter([
  {
    path: '/oauth/canvas/callback',
    element: <CanvasOAuthCallback />,
  },
  {
    path: '/oauth/canvas/callback',
    element: <CanvasOAuthCallback />,
  },
  {
    path: '/oauth/canvas/callback',
    element: <CanvasOAuthCallback />,
  },
  {
    path: '/',
    element: <AuthGate />,
    children: [
      {
        path: 'calendar',
        element: <CalendarPage />,
      },
      {
        path: 'tasks',
        element: <TasksPage />,
      },
      {
        path: 'canvas',
        element: <CanvasModulesPage />,
      },
      {
        path: 'canvas',
        element: <CanvasModulesPage />,
      },
      {
        path: 'canvas',
        element: <CanvasModulesPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  }
]);