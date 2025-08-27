import TasksPage from '@/pages/TasksPage';
import SettingsPage from '@/pages/SettingsPage';
import AuthGate from '@/pages/AuthGate';
import CanvasOAuthCallback from '@/pages/CanvasOAuthCallback';

export const router = createBrowserRouter([
  {
    path: '/oauth/canvas/callback',
    element: <CanvasOAuthCallback />,
  },
  {
    path: '/',
    element: <AuthGate />,
  }
]);