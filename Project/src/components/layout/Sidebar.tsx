import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Calendar, 
  CheckSquare, 
  Settings,
  Clock,
  Plus
} from 'lucide-react';
import { useTasksStore } from '@/features/tasks/store';
import { cn } from '@/lib/utils';
import MiniCalendar from '@/components/calendar/MiniCalendar';

export default function Sidebar() {
  const location = useLocation();
  const { getTodayTasks, getOverdueTasks } = useTasksStore();
  
  const todayTasksCount = getTodayTasks().length;
  const overdueTasksCount = getOverdueTasks().length;

  const navigation = [
    {
      name: 'Dashboard',
      href: '/',
      icon: Home,
      current: location.pathname === '/',
    },
    {
      name: 'Calendar',
      href: '/calendar',
      icon: Calendar,
      current: location.pathname === '/calendar',
    },
    {
      name: 'Tasks',
      href: '/tasks',
      icon: CheckSquare,
      current: location.pathname === '/tasks',
      badge: todayTasksCount + overdueTasksCount,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      current: location.pathname === '/settings',
    },
  ];

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow border-r bg-background pt-5 overflow-y-auto">
        <div className="flex-grow flex flex-col px-4">
          {/* Quick Add Button */}
          <Button className="mb-6">
            <Plus className="h-4 w-4 mr-2" />
            New Event
          </Button>

          {/* Navigation */}
          <nav className="space-y-1 mb-6">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                    item.current
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                  {item.badge ? (
                    <Badge 
                      variant={item.badge > 0 ? 'destructive' : 'secondary'} 
                      className="ml-auto"
                    >
                      {item.badge}
                    </Badge>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          {/* Mini Calendar */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Calendar</h3>
            <MiniCalendar />
          </div>

          {/* Quick Stats */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Today</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  Tasks
                </span>
                <Badge variant={todayTasksCount > 0 ? 'default' : 'secondary'}>
                  {todayTasksCount}
                </Badge>
              </div>
              {overdueTasksCount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center text-destructive">
                    <Clock className="h-4 w-4 mr-2" />
                    Overdue
                  </span>
                  <Badge variant="destructive">
                    {overdueTasksCount}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}