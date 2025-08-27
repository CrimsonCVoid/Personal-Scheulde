import { createBrowserRouter } from 'react-router-dom';
import Layout from './layout';
import Dashboard from '@/pages/Dashboard';
import CalendarPage from '@/pages/CalendarPage';
import TasksPage from '@/pages/TasksPage';
import SettingsPage from '@/pages/SettingsPage';
import AuthGate from '@/pages/AuthGate';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthGate />,
    children: [
      {
        element: <Layout />,
        children: [
          {
            index: true,
            element: <Dashboard />,
          },
          {
            path: 'calendar',
            element: <CalendarPage />,
          },
          {
            path: 'tasks',
            element: <TasksPage />,
          },
          {
            path: 'settings',
            element: <SettingsPage />,
          },
        ],
      },
    ],
  },
]);